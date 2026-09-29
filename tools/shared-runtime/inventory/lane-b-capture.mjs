import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parse as parseConnectionString } from "pg-connection-string";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "../../..");
const CONFIG = JSON.parse(fs.readFileSync(path.join(HERE, "lane-b-capture-config.json"), "utf8"));
const identifier = (value) => {
  if (!/^[a-z_][a-z0-9_]*$/.test(value)) throw Object.assign(new Error("invalid identifier"), { code: "INVALID_IDENTIFIER" });
  return `"${value}"`;
};
const safeError = (code, cause) => Object.assign(new Error("capture failed", cause ? { cause } : undefined), { code });
const stableJson = (value) => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).filter((key) => value[key] !== undefined).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
};

export function validateCaptureTarget({ projectRef, databaseUrl, config = CONFIG }) {
  const expected = config.lab_project_ref;
  if (!projectRef || projectRef !== expected || projectRef === config.production_project_ref) {
    throw safeError("PROJECT_REF_REJECTED");
  }
  let url;
  try { url = new URL(databaseUrl); } catch { throw safeError("DATABASE_URL_INVALID"); }
  if (!/^postgres(?:ql)?:$/.test(url.protocol)) throw safeError("DATABASE_URL_INVALID");
  const queryKeys = [...url.searchParams.keys()];
  if (queryKeys.some((key) => key !== "sslmode")
    || (url.searchParams.has("sslmode") && (url.searchParams.getAll("sslmode").length !== 1
      || url.searchParams.get("sslmode") !== "verify-full"))) {
    throw safeError("DATABASE_QUERY_REJECTED");
  }
  let parsed;
  try { parsed = parseConnectionString(databaseUrl); } catch { throw safeError("DATABASE_URL_INVALID"); }
  if (!parsed.host || !parsed.user || !parsed.password) throw safeError("DATABASE_URL_INVALID");
  const expectedHost = config.database_host_template.replace("{project_ref}", expected).toLowerCase();
  const hostname = parsed.host.toLowerCase();
  const port = parsed.port || "5432";
  const isDirectHost = hostname === expectedHost && port === "5432";
  const isSessionPooler = /^aws-\d+-[a-z]{2,}-[a-z]+-\d+\.pooler\.supabase\.com$/.test(hostname)
    && port === "5432"
    && parsed.user === `postgres.${expected}`;
  if (!isDirectHost && !isSessionPooler) throw safeError("DATABASE_HOST_MISMATCH");
  if (parsed.database !== "postgres") throw safeError("DATABASE_HOST_MISMATCH");
  const connectionConfig = Object.freeze({
    host: hostname,
    port,
    user: parsed.user,
    database: parsed.database,
    password: parsed.password,
    ssl: Object.freeze({ rejectUnauthorized: true }),
  });
  return Object.freeze({ projectRef: expected, host: hostname, connectionConfig, databaseUrl });
}

export function safeCaptureDiagnostic(error, databaseUrl) {
  const parts = [];
  let current = error;
  for (let depth = 0; current && depth < 3; depth++, current = current.cause) {
    let message = typeof current.message === "string" ? current.message : String(current);
    const secrets = [databaseUrl, CONFIG.lab_project_ref];
    try {
      const parsed = new URL(databaseUrl);
      secrets.push(parsed.href, parsed.host, parsed.hostname, parsed.username, parsed.password);
      for (const encoded of [parsed.username, parsed.password]) {
        if (encoded) {
          try { secrets.push(decodeURIComponent(encoded)); } catch { /* keep encoded form only */ }
        }
      }
    } catch { /* malformed URLs are reported through the generic validator error */ }
    for (const secret of [...new Set(secrets.filter(Boolean))].sort((a, b) => b.length - a.length)) {
      message = message.split(secret).join("[redacted]");
    }
    message = message
      .replace(/(?:postgres(?:ql)?|https?):\/\/[^\s'"<>]+/gi, "[connection redacted]")
      .replace(/\b(?:[a-z0-9-]+\.)*(?:pooler\.supabase\.com|supabase\.co)\b/gi, "[host redacted]")
      .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "[IP redacted]")
      .replace(/\b(?:[a-f0-9]{1,4}:){2,}[a-f0-9:.]*\b/gi, "[IP redacted]")
      .replace(/[\r\n\t]+/g, " ")
      .slice(0, 500);
    const errorClass = current?.constructor?.name || "Error";
    parts.push(`${errorClass}: ${message || "(no message)"}`);
  }
  return parts.join("; caused by ");
}

function privilegeNames(kind) {
  return kind === "S" ? ["SELECT", "USAGE", "UPDATE"] : ["SELECT", "INSERT", "UPDATE", "DELETE", "TRUNCATE", "REFERENCES", "TRIGGER"];
}

async function queryRows(client, sql, values = []) {
  const result = await client.query(sql, values);
  return result.rows || [];
}

async function createMeasurementRole(client, stageName, measurement) {
  const roleByStage = { "H3D-LIVE": "lane_b_rw_live", "H3D-A1": "lane_b_rw_a1" };
  const sourceRole = roleByStage[stageName];
  if (!sourceRole) throw safeError("STAGE_REJECTED");
  const runbookPath = path.join(REPO_ROOT, `docs/platform/shared-runtime/runbooks/lane-b-role-${sourceRole}-create.sql`);
  const runbook = fs.readFileSync(runbookPath, "utf8");
  const grants = runbook.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.startsWith("GRANT "));
  if (!grants.length || grants.some((line) => !line.endsWith(` TO ${sourceRole};`))) throw safeError("RUNBOOK_GRANTS_INVALID");
  const role = `lane_b_probe_${crypto.randomUUID().replaceAll("-", "")}`;
  const roleSql = identifier(role);
  measurement.role = role;
  const existing = await queryRows(client, "SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = $1", [role]);
  if (existing.length) throw safeError("TEMP_ROLE_COLLISION");
  const validUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString().replace("T", " ").replace("Z", "+00");
  // Treat an uncertain CREATE ROLE response as possibly committed so finally retries DROP.
  measurement.created = true;
  await client.query(`CREATE ROLE ${roleSql} LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION CONNECTION LIMIT 3 VALID UNTIL '${validUntil}'`);
  for (const line of grants) {
    const member = line.match(/^GRANT ([a-z_][a-z0-9_]*) TO [a-z_][a-z0-9_]*;$/i);
    const schema = line.match(/^GRANT ([A-Z, ]+) ON SCHEMA ([a-z_][a-z0-9_]*) TO [a-z_][a-z0-9_]*;$/i);
    const table = line.match(/^GRANT ([A-Z, ]+) ON(?: TABLE)? ([a-z_][a-z0-9_]*\.[a-z_][a-z0-9_]*) TO [a-z_][a-z0-9_]*;$/i);
    if (member) {
      await client.query(`GRANT ${identifier(member[1])} TO ${roleSql}`);
      measurement.cleanup.push(`REVOKE ${identifier(member[1])} FROM ${roleSql}`);
    } else if (schema) {
      const privileges = schema[1].split(",").map((name) => name.trim()).join(", ");
      const target = identifier(schema[2]);
      await client.query(`GRANT ${privileges} ON SCHEMA ${target} TO ${roleSql}`);
      measurement.cleanup.push(`REVOKE ${privileges} ON SCHEMA ${target} FROM ${roleSql}`);
    } else if (table) {
      const privileges = table[1].split(",").map((name) => name.trim()).join(", ");
      const target = table[2].split(".").map(identifier).join(".");
      await client.query(`GRANT ${privileges} ON TABLE ${target} TO ${roleSql}`);
      measurement.cleanup.push(`REVOKE ${privileges} ON TABLE ${target} FROM ${roleSql}`);
    } else {
      throw safeError("RUNBOOK_GRANT_UNSUPPORTED");
    }
  }
  return measurement;
}

async function dropMeasurementRole(client, measurement) {
  let firstFailure = null;
  for (const sql of [...measurement.cleanup].reverse()) {
    try { await client.query(sql); } catch (error) { firstFailure ||= error; }
  }
  try { await client.query(`DROP ROLE ${identifier(measurement.role)}`); } catch (error) { firstFailure ||= error; }
  let exists;
  try { exists = await queryRows(client, "SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = $1", [measurement.role]); }
  catch (error) { throw safeError(error.code || "TEMP_ROLE_VERIFY_FAILED"); }
  if (exists.length) throw safeError(firstFailure?.code || "TEMP_ROLE_REMAINS");
  measurement.created = false;
}

export async function captureLiveWithPreflight(options = {}) {
  const env = options.env || process.env;
  const config = options.config || CONFIG;
  const target = validateCaptureTarget({
    projectRef: env[config.project_ref_env],
    databaseUrl: env[config.database_url_env],
    config,
  });
  const stage = env[config.stage_env] || config.default_stage;
  const outputPath = env[config.output_env];
  if (!outputPath || !path.isAbsolute(outputPath)) throw safeError("OUTPUT_PATH_REQUIRED");
  const outputRelativeToRepo = path.relative(REPO_ROOT, path.resolve(outputPath));
  if (!(outputRelativeToRepo === ".." || outputRelativeToRepo.startsWith(`..${path.sep}`) || path.isAbsolute(outputRelativeToRepo))) {
    throw safeError("OUTPUT_MUST_BE_EXTERNAL");
  }
  const toolGitSha = (options.getGitSha || (() => execFileSync("git", ["rev-parse", "HEAD"], { cwd: REPO_ROOT, encoding: "utf8" }).trim()))();
  if (!/^[0-9a-f]{40}$/i.test(toolGitSha)) throw safeError("TOOL_SHA_UNAVAILABLE");
  const gitStatus = (options.getGitStatus || (() => execFileSync("git", ["status", "--porcelain", "--untracked-files=normal"], { cwd: REPO_ROOT, encoding: "utf8" })))();
  if (gitStatus.trim()) throw safeError("WORKTREE_DIRTY");
  const createClient = options.createClient || (async (connectionConfig) => {
    const { Client } = await import("pg");
    return new Client({ ...connectionConfig, statement_timeout: 25000, connectionTimeoutMillis: 10000, application_name: "wstera-lane-b-capture" });
  });

  // No client is constructed or connected until project and host validation above pass.
  const client = await createClient(target.connectionConfig);
  let connected = false;
  let measurement = null;
  let primaryError = null;
  let data = null;
  measurement = { role: null, cleanup: [], created: false };
  try {
    await client.connect();
    connected = true;
    measurement = await createMeasurementRole(client, stage, measurement);
    const schemas = ["ps01", "ps01_internal", "wstera_platform_internal", "local_service", "mt01", "mt01_private", "auth", "vault", "cron", "net"];
    const [identityRows, schemaRows, enumeration, functions] = await Promise.all([
      queryRows(client, "SELECT current_user, current_database(), current_setting('server_version') AS server_version"),
      queryRows(client, `SELECT nspname, has_schema_privilege($1, nspname, 'USAGE') AS usage FROM pg_catalog.pg_namespace ORDER BY nspname`, [measurement.role]),
      queryRows(client, `SELECT c.oid::text AS oid, n.nspname, c.relname, c.relkind, c.relrowsecurity, c.relforcerowsecurity, pg_catalog.pg_get_userbyid(c.relowner) AS owner FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = ANY($1::text[]) AND c.relkind IN ('r','p','v','m','f','S') ORDER BY n.nspname,c.relkind,c.relname`, [schemas]),
      queryRows(client, `SELECT p.oid::text AS oid, n.nspname, p.proname, pg_catalog.pg_get_function_identity_arguments(p.oid) AS args, pg_catalog.has_function_privilege($1,p.oid,'EXECUTE') AS execute FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname = ANY($2::text[]) ORDER BY n.nspname,p.proname,args`, [measurement.role, schemas]),
    ]);
    const usageBySchema = Object.fromEntries(schemaRows.map((row) => [row.nspname, row.usage]));
    const grantsByOid = {};
    for (const object of enumeration) {
      const names = privilegeNames(object.relkind);
      const fn = object.relkind === "S" ? "has_sequence_privilege" : "has_table_privilege";
      const rows = await queryRows(client, `SELECT ${names.map((name) => `${fn}($1,$2::oid,'${name}') AS ${name.toLowerCase()}`).join(",")}`, [measurement.role, object.oid]);
      grantsByOid[object.oid] = {
        nspname: object.nspname,
        relname: object.relname,
        privileges: names.filter((name) => rows[0]?.[name.toLowerCase()] === true),
        privilege_results: Object.fromEntries(names.map((name) => [name, rows[0]?.[name.toLowerCase()] === true])),
      };
    }
    const roleRows = await queryRows(client, `SELECT rolname, rolsuper, rolinherit, rolcreaterole, rolcreatedb, rolcanlogin, rolreplication, rolbypassrls, rolconfig FROM pg_catalog.pg_roles WHERE rolname=$1`, [measurement.role]);
    const memberRows = await queryRows(client, `SELECT parent.rolname AS granted_role, m.admin_option, m.inherit_option, m.set_option FROM pg_catalog.pg_auth_members m JOIN pg_catalog.pg_roles member ON member.oid=m.member JOIN pg_catalog.pg_roles parent ON parent.oid=m.roleid WHERE member.rolname=$1 ORDER BY parent.rolname`, [measurement.role]);
    const measured = { stage, role: measurement.role, enumeration, grantsByOid, usageBySchema };
    const { evaluateMeasured } = await import("./lane-b-effective-reach.mjs");
    data = {
      stage,
      measured_role: measurement.role,
      identity: identityRows[0] || null,
      role: roleRows[0] || null,
      memberships: memberRows,
      schema_usage: usageBySchema,
      enumeration,
      grants_by_oid: grantsByOid,
      functions,
      evaluation: evaluateMeasured(measured),
    };
  } catch (error) {
    primaryError = error;
  } finally {
    if (connected && measurement?.created) {
      try { await dropMeasurementRole(client, measurement); }
      catch (error) {
        primaryError ||= error;
        // A broken query connection must not strand the temporary role when a fresh
        // connection can still reach the already-validated project/host.
        let cleanupClient;
        try {
          cleanupClient = await createClient(target.connectionConfig);
          await cleanupClient.connect();
          await dropMeasurementRole(cleanupClient, measurement);
        } catch (cleanupError) {
          primaryError = safeError(cleanupError.code || "TEMP_ROLE_CLEANUP_FAILED");
        } finally {
          try { await cleanupClient?.end(); } catch { primaryError = safeError("TEMP_ROLE_CLEANUP_FAILED"); }
        }
      }
    }
    if (connected) {
      try { await client.end(); }
      catch (error) { primaryError ||= error; }
    }
  }
  if (primaryError) throw safeError(primaryError.code || "CAPTURE_QUERY_FAILED", primaryError);

  const outputBytes = `${stableJson(data)}\n`;
  const outputSha256 = crypto.createHash("sha256").update(outputBytes, "utf8").digest("hex");
  const artifact = {
    project_ref: target.projectRef,
    host: target.host,
    captured_at_utc: new Date().toISOString(),
    tool_git_sha: toolGitSha,
    output_sha256: outputSha256,
    output_sha256_scope: "UTF-8 stable JSON of data field plus trailing LF",
    data,
    temporary_role: { created_after_preflight: true, dropped_in_finally: true, verified_absent: true },
  };
  fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(artifact, null, 2)}\n`, { flag: "wx" });
  return { outputPath: path.resolve(outputPath), outputSha256, ok: data.evaluation?.ok === true };
}
