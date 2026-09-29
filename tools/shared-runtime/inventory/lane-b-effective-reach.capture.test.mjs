import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { captureLiveWithPreflight, safeCaptureDiagnostic, validateCaptureTarget } from "./lane-b-capture.mjs";

const stableJson = (value) => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).filter((key) => value[key] !== undefined).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
};

const config = {
  lab_project_ref: "ykxlqnshaaxmzzocpjlj",
  production_project_ref: "gyleqrjdzwwlqierdwcy",
  database_host_template: "db.{project_ref}.supabase.co",
  tls_ca_file: "certs/supabase-root-2021.crt",
  tls_ca_sha256: "700723581420dd1ac98fd7e9ac529f0ef210eadcaf87fc868a3ad7d114c2f3b7",
  output_env: "OUT",
  project_ref_env: "REF",
  database_url_env: "URL",
  stage_env: "STAGE",
  default_stage: "H3D-LIVE",
};
const databaseUrl = ({ username, hostname, port = "5432" }) => {
  const url = new URL("postgresql://placeholder");
  url.username = username;
  url.password = "never-print";
  url.hostname = hostname;
  url.port = port;
  url.pathname = "/postgres";
  url.searchParams.set("sslmode", "verify-full");
  return url.toString();
};
const envFor = (ref = config.lab_project_ref, hostRef = config.lab_project_ref, output = path.join(os.tmpdir(), `lane-b-${crypto.randomUUID()}.json`)) => ({
  REF: ref,
  URL: databaseUrl({ username: "operator", hostname: `db.${hostRef}.supabase.co` }),
  OUT: output,
  STAGE: "H3D-LIVE",
});
const poolerUrl = (usernameRef = config.lab_project_ref, hostname = "aws-0-ap-southeast-1.pooler.supabase.com", port = "5432") =>
  databaseUrl({ username: `postgres.${usernameRef}`, hostname, port });

test("rejects wrong and production project refs before creating a connection", async () => {
  for (const ref of ["otherproject123456789012", config.production_project_ref]) {
    let connects = 0;
    await assert.rejects(captureLiveWithPreflight({ env: envFor(ref), config, createClient: async () => { connects++; throw Error("unexpected"); } }), { code: "PROJECT_REF_REJECTED" });
    assert.equal(connects, 0);
  }
});

test("rejects a mismatched database host before creating a connection", async () => {
  let connects = 0;
  await assert.rejects(captureLiveWithPreflight({ env: envFor(config.lab_project_ref, config.production_project_ref), config, createClient: async () => { connects++; throw Error("unexpected"); } }), { code: "DATABASE_HOST_MISMATCH" });
  assert.equal(connects, 0);
  assert.throws(() => validateCaptureTarget({ projectRef: config.lab_project_ref, databaseUrl: databaseUrl({ username: "operator", hostname: `db.${config.lab_project_ref}.supabase.co`, port: "6543" }), config }), { code: "DATABASE_HOST_MISMATCH" });
});

test("accepts a session pooler only when its username binds the pinned LAB ref", () => {
  const target = validateCaptureTarget({ projectRef: config.lab_project_ref, databaseUrl: poolerUrl(), config });
  assert.equal(target.projectRef, config.lab_project_ref);
  assert.equal(target.host, "aws-0-ap-southeast-1.pooler.supabase.com");
  const withSslMode = validateCaptureTarget({ projectRef: config.lab_project_ref, databaseUrl: poolerUrl(), config });
  assert.equal(withSslMode.connectionConfig.ssl.rejectUnauthorized, true);
  assert.equal(withSslMode.connectionConfig.ssl.servername, "aws-0-ap-southeast-1.pooler.supabase.com");
  assert.deepEqual(withSslMode.connectionConfig.ssl.ca, fs.readFileSync(new URL("./certs/supabase-root-2021.crt", import.meta.url)));
});

test("pooler capture keeps the admin login and never connects as the measurement role", async () => {
  const url = poolerUrl();
  let clientConfig;
  const client = { connect: async () => { throw Object.assign(Error("offline stub"), { code: "OFFLINE_STUB" }); }, end: async () => {} };
  await assert.rejects(captureLiveWithPreflight({
    env: { ...envFor(), URL: url }, config,
    getGitSha: () => "c".repeat(40), getGitStatus: () => "",
    createClient: async (connectionConfig) => { clientConfig = connectionConfig; return client; },
  }), { code: "OFFLINE_STUB" });
  assert.equal(clientConfig.host, "aws-0-ap-southeast-1.pooler.supabase.com");
  assert.equal(clientConfig.port, "5432");
  assert.equal(clientConfig.user, `postgres.${config.lab_project_ref}`);
  assert.equal(clientConfig.database, "postgres");
  assert.equal(clientConfig.ssl.rejectUnauthorized, true);
  assert.equal(clientConfig.ssl.servername, "aws-0-ap-southeast-1.pooler.supabase.com");
  assert.deepEqual(clientConfig.ssl.ca, fs.readFileSync(new URL("./certs/supabase-root-2021.crt", import.meta.url)));
  assert.equal(clientConfig.password, "never-print");
  assert.equal(Object.hasOwn(clientConfig, "connectionString"), false);
});

test("rejects pooler ref, production, host suffix, and transaction port before creating a connection", async () => {
  const cases = [
    { url: poolerUrl("anotherproject123456789012"), code: "DATABASE_HOST_MISMATCH" },
    { url: poolerUrl(config.production_project_ref), code: "DATABASE_HOST_MISMATCH" },
    { url: poolerUrl(config.lab_project_ref, "aws-0-ap-southeast-1.pooler.supabase.net"), code: "DATABASE_HOST_MISMATCH" },
    { url: poolerUrl(config.lab_project_ref, "aws-0-ap-southeast-1.pooler.supabase.com", "6543"), code: "DATABASE_HOST_MISMATCH" },
  ];
  for (const item of cases) {
    let clientConstructions = 0;
    let networkConnects = 0;
    await assert.rejects(captureLiveWithPreflight({
      env: { ...envFor(), URL: item.url }, config,
      getGitSha: () => "d".repeat(40), getGitStatus: () => "",
      createClient: async () => {
        clientConstructions++;
        return { connect: async () => { networkConnects++; }, end: async () => {} };
      },
    }), { code: item.code });
    assert.equal(clientConstructions, 0);
    assert.equal(networkConnects, 0);
  }
});

test("rejects effective pg query overrides and unsafe query params before connecting", async () => {
  const direct = envFor().URL;
  const cases = [
    { url: `${poolerUrl()}&user=postgres.${config.production_project_ref}`, code: "DATABASE_QUERY_REJECTED" },
    { url: `${poolerUrl()}&port=6543`, code: "DATABASE_QUERY_REJECTED" },
    { url: `${poolerUrl()}&host=evil.example`, code: "DATABASE_QUERY_REJECTED" },
    { url: `${direct}&host=evil.example`, code: "DATABASE_QUERY_REJECTED" },
    { url: `${direct}&application_name=unexpected`, code: "DATABASE_QUERY_REJECTED" },
    { url: `${direct.replace("?sslmode=verify-full", "")}?sslmode=disable`, code: "DATABASE_QUERY_REJECTED" },
    { url: `${direct.replace("?sslmode=verify-full", "")}?sslmode=prefer`, code: "DATABASE_QUERY_REJECTED" },
    { url: `${direct.replace("?sslmode=verify-full", "")}?sslmode=require`, code: "DATABASE_QUERY_REJECTED" },
    { url: `${direct}&dbname=template1`, code: "DATABASE_QUERY_REJECTED" },
    { url: direct.replace("?sslmode=verify-full", ""), code: "DATABASE_QUERY_REJECTED" },
  ];
  for (const item of cases) {
    let clientConstructions = 0;
    let networkConnects = 0;
    await assert.rejects(captureLiveWithPreflight({
      env: { ...envFor(), URL: item.url }, config,
      getGitSha: () => "d".repeat(40), getGitStatus: () => "",
      createClient: async () => {
        clientConstructions++;
        return { connect: async () => { networkConnects++; }, end: async () => {} };
      },
    }), { code: item.code });
    assert.equal(clientConstructions, 0, item.url);
    assert.equal(networkConnects, 0, item.url);
  }
});

test("rejects unavailable and hash-mismatched pinned CA before constructing a client", async () => {
  const cases = [
    { config: { ...config, tls_ca_file: "certs/not-present.crt" }, code: "TLS_CA_UNAVAILABLE" },
    { config: { ...config, tls_ca_sha256: "0".repeat(64) }, code: "TLS_CA_HASH_MISMATCH" },
  ];
  for (const item of cases) {
    let clientConstructions = 0;
    await assert.rejects(captureLiveWithPreflight({
      env: envFor(), config: item.config,
      createClient: async () => { clientConstructions++; throw Error("unexpected"); },
    }), { code: item.code });
    assert.equal(clientConstructions, 0);
  }
});

test("capture diagnostics include class and message while redacting credentials and hosts", () => {
  const url = poolerUrl();
  const diagnostic = safeCaptureDiagnostic(new Error(`connect failed at ${url} (aws-0-ap-southeast-1.pooler.supabase.com)`), url);
  assert.match(diagnostic, /^Error: connect failed at \[redacted\]/);
  assert.equal(diagnostic.includes("never-print"), false);
  assert.equal(diagnostic.includes("postgres." + config.lab_project_ref), false);
  assert.equal(diagnostic.includes("aws-0-ap-southeast-1.pooler.supabase.com"), false);
  assert.equal(diagnostic.includes("[redacted]"), true);
});

test("capture diagnostics redact resolved IP addresses and the LAB project ref", () => {
  const url = envFor().URL;
  const diagnostic = safeCaptureDiagnostic(new Error(`ECONNREFUSED 52.8.1.2; peer [2600:1f18:abcd::1]; project ${config.lab_project_ref}`), url);
  assert.equal(diagnostic.includes("52.8.1.2"), false);
  assert.equal(diagnostic.includes("2600:1f18:abcd::1"), false);
  assert.equal(diagnostic.includes(config.lab_project_ref), false);
  assert.match(diagnostic, /\[IP redacted\]/);
});

test("matching pinned project and host reach the injected connection stub", async () => {
  assert.equal(validateCaptureTarget({ projectRef: config.lab_project_ref, databaseUrl: envFor().URL, config }).host, `db.${config.lab_project_ref}.supabase.co`);
  let connects = 0;
  const output = path.join(os.tmpdir(), `lane-b-capture-${crypto.randomUUID()}.json`);
  const client = { connect: async () => {}, query: async (sql) => {
    if (sql.includes("pg_roles") && sql.includes("SELECT 1")) return { rows: [] };
    if (sql.startsWith("CREATE ROLE") || sql.startsWith("GRANT") || sql.startsWith("REVOKE") || sql.startsWith("DROP ROLE")) return { rows: [] };
    if (sql.includes("current_user")) return { rows: [{ current_user: "capture_operator", current_database: "postgres", server_version: "17" }] };
    if (sql.includes("pg_namespace")) return { rows: [] };
    if (sql.includes("pg_class")) return { rows: [] };
    if (sql.includes("pg_proc")) return { rows: [] };
    if (sql.includes("pg_auth_members")) return { rows: [] };
    if (sql.includes("DROP ROLE")) return { rows: [] };
    if (sql.includes("has_table_privilege") || sql.includes("has_sequence_privilege")) return { rows: [{}] };
    return { rows: [] };
  }, end: async () => {} };
  const result = await captureLiveWithPreflight({
    env: envFor(config.lab_project_ref, config.lab_project_ref, output), config,
    getGitSha: () => "a".repeat(40),
    getGitStatus: () => "",
    createClient: async () => { connects++; return client; },
  });
  assert.equal(connects, 1);
  const artifact = JSON.parse(fs.readFileSync(result.outputPath, "utf8"));
  assert.equal(artifact.project_ref, config.lab_project_ref);
  assert.equal(artifact.host, `db.${config.lab_project_ref}.supabase.co`);
  assert.match(artifact.captured_at_utc, /Z$/);
  assert.equal(artifact.tool_git_sha, "a".repeat(40));
  assert.equal(artifact.output_sha256, crypto.createHash("sha256").update(`${stableJson(artifact.data)}\n`, "utf8").digest("hex"));
  assert.equal(artifact.temporary_role.verified_absent, true);
  assert.equal(JSON.stringify(artifact).includes("never-print"), false);
  fs.rmSync(output, { force: true });
});

test("capture errors still revoke and drop the temporary role in finally", async () => {
  const output = path.join(os.tmpdir(), `lane-b-capture-fail-${crypto.randomUUID()}.json`);
  const calls = [];
  const client = { connect: async () => {}, query: async (sql) => {
    calls.push(sql);
    if (sql.includes("pg_roles") && sql.includes("SELECT 1")) return { rows: [] };
    if (sql.startsWith("CREATE ROLE") || sql.startsWith("GRANT") || sql.startsWith("REVOKE") || sql.startsWith("DROP ROLE")) return { rows: [] };
    if (sql.includes("current_user")) throw Object.assign(Error("contains hidden connection fields"), { code: "STUB_FAILURE" });
    return { rows: [] };
  }, end: async () => {} };
  await assert.rejects(captureLiveWithPreflight({ env: envFor(config.lab_project_ref, config.lab_project_ref, output), config, getGitSha: () => "b".repeat(40), getGitStatus: () => "", createClient: async () => client }), { code: "STUB_FAILURE" });
  assert.ok(calls.some((sql) => sql.startsWith("CREATE ROLE")));
  assert.ok(calls.some((sql) => sql.startsWith("DROP ROLE")));
  assert.equal(calls.some((sql) => /never-print/.test(sql)), false);
  assert.equal(fs.existsSync(output), false);
});

test("cleanup reconnect uses the same pinned CA and validated SNI", async () => {
  const configs = [];
  let roleChecks = 0;
  const makeClient = () => ({
    connect: async () => {},
    query: async (sql) => {
      if (sql.includes("pg_roles") && sql.includes("SELECT 1")) {
        roleChecks++;
        if (roleChecks === 2) throw Object.assign(Error("cleanup verify failed"), { code: "CLEANUP_VERIFY_STUB" });
        return { rows: [] };
      }
      if (sql.includes("current_user")) throw Object.assign(Error("capture stop"), { code: "CAPTURE_STOP_STUB" });
      return { rows: [] };
    },
    end: async () => {},
  });
  await assert.rejects(captureLiveWithPreflight({
    env: envFor(), config,
    getGitSha: () => "e".repeat(40), getGitStatus: () => "",
    createClient: async (connectionConfig) => {
      configs.push(connectionConfig);
      return makeClient();
    },
  }), { code: "CAPTURE_STOP_STUB" });
  assert.equal(configs.length, 2);
  assert.equal(configs[0], configs[1]);
  for (const clientConfig of configs) {
    assert.deepEqual(clientConfig.ssl.ca, fs.readFileSync(new URL("./certs/supabase-root-2021.crt", import.meta.url)));
    assert.equal(clientConfig.ssl.rejectUnauthorized, true);
    assert.equal(clientConfig.ssl.servername, `db.${config.lab_project_ref}.supabase.co`);
  }
});
