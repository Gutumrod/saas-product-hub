import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { defaultCreateClient, safeCaptureDiagnostic, validateCaptureTarget } from "../inventory/lane-b-capture.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "../../..");
const MANIFEST_PATH = path.join(HERE, "manifest.json");
const CAPTURE_CONFIG = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "tools/shared-runtime/inventory/lane-b-capture-config.json"), "utf8"));
const TIMEOUT_MS = 25_000;

function fail(code) { throw Object.assign(new Error(code), { code }); }
function sha256(bytes) { return crypto.createHash("sha256").update(bytes).digest("hex"); }
function canonicalJson(value) {
  if (value instanceof Date) return JSON.stringify(value.toISOString());
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
function safeRelative(value) {
  return typeof value === "string" && value.length > 0 && !path.isAbsolute(value)
    && !value.split(/[\\/]/).includes("..") && !value.includes("\0");
}
function assertManifest(manifest) {
  if (!manifest || manifest.version !== 1 || !Array.isArray(manifest.entries) || !manifest.entries.length
    || !/^[a-f0-9]{40}$/.test(manifest.booking_repository_sha || "")
    || !Array.isArray(manifest.accepted_bk01_ledger) || !manifest.accepted_bk01_ledger.length) fail("MANIFEST_INVALID");
  let priorFilename = "";
  for (const item of manifest.accepted_bk01_ledger) {
    if (!item || !safeRelative(item.filename) || !/^[a-f0-9]{64}$/.test(item.sha256 || "")
      || item.filename <= priorFilename) fail("MANIFEST_INVALID");
    priorFilename = item.filename;
  }
  const ids = new Set();
  const paths = new Set();
  let previousOrder = -Infinity;
  for (const entry of manifest.entries) {
    if (!entry || !/^[a-z0-9-]+$/.test(entry.id || "") || ids.has(entry.id)
      || !Number.isInteger(entry.order) || entry.order <= previousOrder
      || !["house", "booking"].includes(entry.repository) || !safeRelative(entry.path)
      || !["wrap", "self"].includes(entry.tx) || !/^[a-f0-9]{64}$/.test(entry.sha256 || "") || !entry.rollback
      || !safeRelative(entry.rollback.path) || !/^[a-f0-9]{64}$/.test(entry.rollback.sha256 || "")) fail("MANIFEST_INVALID");
    const key = `${entry.repository}:${entry.path}`;
    if (paths.has(key)) fail("MANIFEST_INVALID");
    ids.add(entry.id); paths.add(key); previousOrder = entry.order;
  }
}
function gitHead(root) {
  try { return execFileSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); }
  catch { fail("SOURCE_REPOSITORY_UNAVAILABLE"); }
}
function resolveSource(entry, env, repoRoot) {
  const root = entry.repository === "house" ? repoRoot : env.BK01_REPO_ROOT;
  if (!root || !path.isAbsolute(root)) fail("SOURCE_REPOSITORY_UNAVAILABLE");
  const resolvedRoot = path.resolve(root);
  const file = path.resolve(resolvedRoot, entry.path);
  const relative = path.relative(resolvedRoot, file);
  if (!relative || relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) fail("MANIFEST_PATH_REJECTED");
  return file;
}
function readPinnedFile(entry, env, repoRoot, manifest) {
  if (entry.repository === "booking" && gitHead(path.resolve(env.BK01_REPO_ROOT || "")) !== manifest.booking_repository_sha) fail("BOOKING_SOURCE_SHA_MISMATCH");
  const file = resolveSource(entry, env, repoRoot);
  let bytes;
  try { bytes = fs.readFileSync(file); } catch { fail("SQL_SOURCE_UNAVAILABLE"); }
  if (sha256(bytes) !== entry.sha256) fail("SQL_HASH_MISMATCH");
  return { file, bytes, sql: bytes.toString("utf8") };
}

const TRANSACTION_COMMANDS = new Set(["BEGIN", "START", "COMMIT", "END", "ROLLBACK", "ABORT", "SAVEPOINT", "RELEASE"]);

function parseTopLevelSql(sql) {
  if (typeof sql !== "string") fail("SQL_SOURCE_INVALID");
  const statements = [];
  let tokens = [];
  let metaCommand = false;
  let i = 0;
  const finishStatement = () => {
    if (tokens.length) statements.push(tokens);
    tokens = [];
  };
  while (i < sql.length) {
    const c = sql[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === "-" && sql[i + 1] === "-") { i += 2; while (i < sql.length && sql[i] !== "\n") i++; continue; }
    if (c === "/" && sql[i + 1] === "*") {
      i += 2; let depth = 1;
      while (i < sql.length && depth) {
        if (sql[i] === "/" && sql[i + 1] === "*") { depth++; i += 2; }
        else if (sql[i] === "*" && sql[i + 1] === "/") { depth--; i += 2; }
        else i++;
      }
      if (depth) fail("SQL_LEXING_INVALID");
      continue;
    }
    if (c === "'") {
      if (!tokens.length) tokens.push("<STRING>");
      const escapePrefix = i > 0 && /[eE]/.test(sql[i - 1]) && (i < 2 || !/[a-zA-Z0-9_$]/.test(sql[i - 2]));
      i++;
      let closed = false;
      while (i < sql.length) {
        if (sql[i] === "'") {
          i++;
          if (sql[i] === "'") { i++; continue; }
          closed = true; break;
        }
        if (escapePrefix && sql[i] === "\\") { i += 2; continue; }
        i++;
      }
      if (!closed) fail("SQL_LEXING_INVALID");
      continue;
    }
    if (c === '"') {
      if (!tokens.length) tokens.push("<IDENTIFIER>");
      i++;
      let closed = false;
      while (i < sql.length) {
        if (sql[i] === '"') {
          i++;
          if (sql[i] === '"') { i++; continue; }
          closed = true; break;
        }
        i++;
      }
      if (!closed) fail("SQL_LEXING_INVALID");
      continue;
    }
    if (c === "$") {
      const match = sql.slice(i).match(/^\$[a-zA-Z_][a-zA-Z0-9_]*\$|^\$\$/);
      if (match) {
        if (!tokens.length) tokens.push("<DOLLAR_LITERAL>");
        const tag = match[0]; i += tag.length; const end = sql.indexOf(tag, i);
        if (end < 0) fail("SQL_LEXING_INVALID");
        i = end + tag.length; continue;
      }
    }
    if (c === ";") { finishStatement(); i++; continue; }
    if (c === "\\") { metaCommand = true; i++; continue; }
    if (/[a-zA-Z_]/.test(c)) {
      const match = sql.slice(i).match(/^[a-zA-Z_][a-zA-Z0-9_$]*/)[0];
      tokens.push(match.toUpperCase()); i += match.length; continue;
    }
    if (!tokens.length) tokens.push(`<${c}>`);
    i++;
  }
  finishStatement();
  const controls = [];
  for (let index = 0; index < statements.length; index++) {
    const [first, second] = statements[index];
    if (TRANSACTION_COMMANDS.has(first) || (first === "PREPARE" && second === "TRANSACTION")) controls.push({ index, command: first });
  }
  return { statements, controls, metaCommand };
}

export function containsTopLevelTransactionControl(sql) {
  const parsed = parseTopLevelSql(sql);
  return parsed.controls.length > 0;
}

export function validateTransactionMode(sql, mode) {
  if (mode !== "wrap" && mode !== "self") fail("MANIFEST_TRANSACTION_MODE_INVALID");
  const parsed = parseTopLevelSql(sql);
  if (mode === "wrap") {
    if (parsed.controls.length || parsed.metaCommand) fail("WRAPPED_SQL_TRANSACTION_CONTROL_REJECTED");
    return;
  }
  const lastIndex = parsed.statements.length - 1;
  const begins = parsed.controls.filter(({ command }) => command === "BEGIN");
  const commits = parsed.controls.filter(({ command }) => command === "COMMIT");
  const exactBoundary = parsed.statements.length >= 2
    && parsed.statements[0][0] === "BEGIN"
    && parsed.statements[lastIndex][0] === "COMMIT"
    && begins.length === 1 && begins[0].index === 0
    && commits.length === 1 && commits[0].index === lastIndex
    && parsed.controls.length === 2;
  if (!exactBoundary || parsed.metaCommand) fail("SELF_TRANSACTION_SHAPE_INVALID");
}

function entryForFile(manifest, requested, repoRoot) {
  const normalized = String(requested || "").replaceAll("\\", "/");
  const entry = manifest.entries.find((candidate) => candidate.path === normalized
    || `${candidate.repository}/${candidate.path}` === normalized);
  if (!entry) fail("SQL_FILE_NOT_IN_MANIFEST");
  return entry;
}

function validateAllPinnedSources(manifest, env, repoRoot, selected) {
  const forward = readPinnedFile(selected, env, repoRoot, manifest);
  const rollback = { ...selected, path: selected.rollback.path, sha256: selected.rollback.sha256 };
  readPinnedFile(rollback, env, repoRoot, manifest);
  validateTransactionMode(forward.sql, selected.tx);
  return forward;
}

async function queryOne(client, sql, values = []) {
  const result = await client.query(sql, values);
  return result.rows?.[0] || {};
}

async function readState(client) {
  const baseline = await queryOne(client, `
    SELECT to_regclass('local_service_internal.schema_migrations') IS NOT NULL AS ledger_exists,
      to_regclass('local_service_internal.migration_baseline') IS NOT NULL AS migration_baseline_exists,
      EXISTS (SELECT 1 FROM pg_catalog.pg_namespace WHERE nspname='local_service_internal') AS internal_schema_exists,
      to_regprocedure('local_service_internal.request_user_id()') IS NOT NULL AS request_user_id_exists,
      EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname='bk01_migrator') AS bk01_migrator_role_exists,
      EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname='bk01_runtime') AS bk01_runtime_role_exists,
      to_regprocedure('local_service.authorize_booking_recovery_attempt(uuid,text)') IS NOT NULL AS recovery_function_exists,
      to_regprocedure('local_service.claim_due_line_notifications(integer)') IS NOT NULL AS notification_function_exists,
      to_regprocedure('local_service.claim_stripe_webhook_event(text,text,timestamptz)') IS NOT NULL AS stripe_claim_function_exists,
      to_regprocedure('local_service.complete_line_notification(uuid,integer,text,timestamptz,timestamptz,text)') IS NOT NULL AS notification_complete_function_exists,
      to_regprocedure('local_service.sync_subscription_state_bk_a(text,bigint,uuid,text,text,text,text,bigint,boolean)') IS NOT NULL AS subscription_function_exists,
      (SELECT count(*)::int FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
       WHERE n.nspname='local_service' AND c.relkind IN ('r','p','v','m','f')) AS local_relations,
      (SELECT count(*)::int FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
       WHERE n.nspname='local_service' AND p.prokind IN ('f','p')) AS local_functions`);
  let ledgerRows = 0;
  let ledgerEntries = [];
  if (baseline.ledger_exists) {
    const row = await queryOne(client, "SELECT count(*)::int AS count FROM local_service_internal.schema_migrations");
    ledgerRows = Number(row.count || 0);
    const result = await client.query(`SELECT migration_id, filename, source_sha256, release_id, runner_version, applied_at
      FROM local_service_internal.schema_migrations ORDER BY migration_id`);
    ledgerEntries = result.rows || [];
  }
  const state = {};
  const objects = {};
  state["bk01-platform-bootstrap"] = Boolean(baseline.ledger_exists);
  objects["bk01-platform-bootstrap"] = { schemaMigrationsTable: Boolean(baseline.ledger_exists) };
  const issuer = await queryOne(client, `SELECT
    to_regclass('wstera_platform_internal.runtime_issuer_clients') IS NOT NULL AS a,
    to_regclass('wstera_platform_internal.runtime_issuer_rate_limits') IS NOT NULL AS b,
    to_regclass('wstera_platform_internal.runtime_issuer_audit') IS NOT NULL AS c,
    to_regprocedure('wstera_platform_internal.consume_runtime_issuer_rate_limit(text,integer,integer,timestamptz)') IS NOT NULL AS d`);
  objects["house-runtime-issuer"] = { clientsTable: Boolean(issuer.a), rateLimitsTable: Boolean(issuer.b), auditTable: Boolean(issuer.c), rateLimitFunction: Boolean(issuer.d) };
  state["house-runtime-issuer"] = Object.values(objects["house-runtime-issuer"]).every(Boolean);
  const h3c = await queryOne(client, `SELECT
    EXISTS (SELECT 1 FROM pg_catalog.pg_constraint c JOIN pg_catalog.pg_class t ON t.oid=c.conrelid
      JOIN pg_catalog.pg_namespace n ON n.oid=t.relnamespace WHERE n.nspname='wstera_platform_internal'
      AND t.relname='runtime_token_grants' AND c.conname='runtime_token_grants_database_role_check'
      AND pg_catalog.pg_get_constraintdef(c.oid) ILIKE '%bk01_runtime%') AS constraint_ready,
    COALESCE((SELECT p.prosrc ILIKE '%bk01_runtime%' FROM pg_catalog.pg_proc p
      JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='wstera_platform_internal'
      AND p.proname='custom_access_token_hook' LIMIT 1), false) AS function_ready`);
  objects["h3c-runtime-role-allowlist-expansion"] = { roleConstraint: Boolean(h3c.constraint_ready), hookFunction: Boolean(h3c.function_ready) };
  state["h3c-runtime-role-allowlist-expansion"] = Object.values(objects["h3c-runtime-role-allowlist-expansion"]).every(Boolean);
  const storage = await queryOne(client, `SELECT
    to_regclass('wstera_platform_internal.storage_upload_runtime_roles') IS NOT NULL AS a,
    to_regclass('wstera_platform_internal.storage_upload_bucket_allowlist') IS NOT NULL AS b,
    to_regclass('wstera_platform_internal.storage_upload_grants') IS NOT NULL AS c,
    to_regprocedure('wstera_platform_internal.consume_storage_upload()') IS NOT NULL AS d,
    EXISTS (SELECT 1 FROM pg_catalog.pg_trigger t JOIN pg_catalog.pg_class c ON c.oid=t.tgrelid
      JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='storage'
      AND c.relname='objects' AND t.tgname='wstera_consume_product_storage_upload_grant' AND NOT t.tgisinternal) AS e`);
  objects["house-storage-upload-grants"] = { runtimeRoles: Boolean(storage.a), bucketAllowlist: Boolean(storage.b), grants: Boolean(storage.c), consumeFunction: Boolean(storage.d), storageTrigger: Boolean(storage.e) };
  state["house-storage-upload-grants"] = Object.values(objects["house-storage-upload-grants"]).every(Boolean);
  return { state, objects, baseline: {
    ...baseline,
    key_objects: {
      migrationBaselineTable: Boolean(baseline.migration_baseline_exists),
      internalSchema: Boolean(baseline.internal_schema_exists),
      requestUserIdFunction: Boolean(baseline.request_user_id_exists),
      bk01MigratorRole: Boolean(baseline.bk01_migrator_role_exists),
      bk01RuntimeRole: Boolean(baseline.bk01_runtime_role_exists),
      recoveryFunction: Boolean(baseline.recovery_function_exists),
      notificationClaimFunction: Boolean(baseline.notification_function_exists),
      stripeClaimFunction: Boolean(baseline.stripe_claim_function_exists),
      notificationCompleteFunction: Boolean(baseline.notification_complete_function_exists),
      subscriptionFunction: Boolean(baseline.subscription_function_exists),
    },
    ledger_rows: ledgerRows,
    ledger_entries: ledgerEntries,
  } };
}

function determineNext(manifest, state, baseline) {
  const bootstrap = state["bk01-platform-bootstrap"];
  if (!bootstrap && baseline.ledger_rows > 0) fail("EXISTING_BK01_LEDGER_CONFLICT");
  if (baseline.ledger_entries.length > manifest.accepted_bk01_ledger.length) fail("EXISTING_BK01_LEDGER_CONFLICT");
  for (let index = 0; index < baseline.ledger_entries.length; index++) {
    const actual = baseline.ledger_entries[index];
    const expected = manifest.accepted_bk01_ledger[index];
    if (actual.filename !== expected.filename || String(actual.source_sha256).toLowerCase() !== expected.sha256) {
      fail("EXISTING_BK01_LEDGER_CONFLICT");
    }
  }
  if (!bootstrap && (baseline.key_objects?.bk01MigratorRole || baseline.key_objects?.internalSchema
    || baseline.key_objects?.requestUserIdFunction || baseline.key_objects?.migrationBaselineTable)) fail("EXISTING_BK01_BOOTSTRAP_CONFLICT");
  for (const entry of manifest.entries) {
    if (!state[entry.id] && entry.id !== "bk01-platform-bootstrap"
      && Object.values(state.objectPresence?.[entry.id] || {}).some(Boolean)) fail("PLATFORM_SQL_PARTIAL_STATE");
  }
  let firstIncomplete = -1;
  for (let index = 0; index < manifest.entries.length; index++) {
    if (!state[manifest.entries[index].id]) { firstIncomplete = index; break; }
  }
  if (firstIncomplete < 0) return null;
  if (manifest.entries.slice(firstIncomplete + 1).some((entry) => state[entry.id])) fail("PLATFORM_SQL_ORDER_STATE_CONFLICT");
  return manifest.entries[firstIncomplete];
}

function toolSha(repoRoot) { return gitHead(repoRoot); }

function ensureExternalEvidenceDirectory(env) {
  const dir = env.PLATFORM_SQL_EVIDENCE_DIR;
  if (!dir || !path.isAbsolute(dir)) fail("EVIDENCE_DIRECTORY_REQUIRED");
  fs.mkdirSync(dir, { recursive: true });
  const relative = path.relative(REPO_ROOT, path.resolve(dir));
  if (!relative.startsWith("..") && !path.isAbsolute(relative)) fail("EVIDENCE_DIRECTORY_MUST_BE_EXTERNAL");
  return path.resolve(dir);
}

function writeEvidence(directory, record) {
  const name = `${record.file.replace(/[^a-zA-Z0-9_-]/g, "_")}-${record.at.replace(/[-:.]/g, "")}.json`;
  const destination = path.join(directory, name);
  const temporary = `${destination}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(record, null, 2)}\n`, { flag: "wx" });
  fs.renameSync(temporary, destination);
}

function writeLatestPlan(directory, plan) {
  const destination = path.join(directory, "latest-plan.json");
  const temporary = `${destination}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(plan, null, 2)}\n`, { flag: "w" });
  fs.renameSync(temporary, destination);
}

function readAndValidatePlan(directory, selected, projectRef, repoRoot) {
  let plan;
  try { plan = JSON.parse(fs.readFileSync(path.join(directory, "latest-plan.json"), "utf8")); }
  catch { fail("FRESH_PLAN_REQUIRED"); }
  const age = Date.now() - Date.parse(plan.createdAt);
  if (!Number.isFinite(age) || age < 0 || age > 15 * 60 * 1000
    || plan.projectRef !== projectRef || plan.toolGitSha !== toolSha(repoRoot)
    || plan.next?.file !== selected.path || plan.next?.sha256 !== selected.sha256) fail("PLAN_ORDER_OR_STALENESS_REJECTED");
  return plan;
}

function renderPlan(entries, state, objects, next, baseline) {
  return {
    mode: "plan-read-only",
    localServiceBaseline: { relations: Number(baseline.local_relations), functions: Number(baseline.local_functions) },
    existingMigrationLedger: { exists: Boolean(baseline.ledger_exists), rows: Number(baseline.ledger_rows), entries: baseline.ledger_entries },
    bootstrapKeyObjects: baseline.key_objects,
    entries: entries.map((entry) => ({ file: entry.path, sha256: entry.sha256, applied: Boolean(state[entry.id]), keyObjects: objects[entry.id] })),
    next: next ? { file: next.path, sha256: next.sha256 } : null,
  };
}

export async function executePlatformSql(argv, {
  env = process.env,
  manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")),
  repoRoot = REPO_ROOT,
  createClient = defaultCreateClient,
  stdout = (value) => process.stdout.write(`${JSON.stringify(value, null, 2)}\n`),
} = {}) {
  assertManifest(manifest);
  const [mode, ...args] = argv;
  if (mode !== "plan" && mode !== "apply") fail("USAGE: plan | apply --file <manifest-path> --confirm <sha256>");
  let selected = null;
  let source = null;
  if (mode === "apply") {
    if (args.length !== 4 || args[0] !== "--file" || args[2] !== "--confirm") fail("USAGE: apply --file <manifest-path> --confirm <sha256>");
    selected = entryForFile(manifest, args[1], repoRoot);
    if (args[3] !== selected.sha256) fail("CONFIRMATION_HASH_MISMATCH");
    source = validateAllPinnedSources(manifest, env, repoRoot, selected);
  } else if (args.length) fail("USAGE: plan");

  const projectRef = env[CAPTURE_CONFIG.project_ref_env];
  const databaseUrl = env[CAPTURE_CONFIG.database_url_env];
  const evidenceDirectory = ensureExternalEvidenceDirectory(env);
  if (mode === "apply") readAndValidatePlan(evidenceDirectory, selected, projectRef, repoRoot);
  const target = validateCaptureTarget({ projectRef, databaseUrl, config: CAPTURE_CONFIG });
  const client = await createClient(target.connectionConfig);
  const selfTransactional = mode === "apply" && selected.tx === "self";
  const protocolConnection = client.connection;
  let transactionStatus = null;
  const onReadyForQuery = (message) => { transactionStatus = message?.status || null; };
  if (selfTransactional && typeof protocolConnection?.on === "function") protocolConnection.on("readyForQuery", onReadyForQuery);
  let connected = false;
  let inTransaction = false;
  let evidence = null;
  let evidenceWritten = false;
  let operationFailed = false;
  try {
    if (mode === "apply") {
      evidence = {
        file: selected.path,
        sha256: selected.sha256,
        toolGitSha: toolSha(repoRoot),
        at: new Date().toISOString(),
        result: "failed",
        redactedError: null,
        provenance: { mode: "platform-sql-apply", projectRef: target.projectRef, sourceRepository: selected.repository },
      };
    }
    await client.connect(); connected = true;
    if (mode === "plan") await client.query("BEGIN READ ONLY");
    const { state, objects, baseline } = await readState(client);
    state.objectPresence = objects;
    const next = determineNext(manifest, state, baseline);
    if (mode === "plan") {
      await client.query("ROLLBACK");
      const result = renderPlan(manifest.entries, state, objects, next, baseline);
      const plan = { createdAt: new Date().toISOString(), projectRef: target.projectRef,
        toolGitSha: toolSha(repoRoot), next: result.next, state: Object.fromEntries(Object.entries(state).filter(([key]) => key !== "objectPresence")), baseline: result.existingMigrationLedger };
      writeLatestPlan(evidenceDirectory, plan);
      stdout(result);
      return;
    }
    const currentPlanState = Object.fromEntries(Object.entries(state).filter(([key]) => key !== "objectPresence"));
    const validatedPlan = readAndValidatePlan(evidenceDirectory, selected, projectRef, repoRoot);
    if (canonicalJson(validatedPlan.state) !== canonicalJson(currentPlanState)
      || canonicalJson(validatedPlan.baseline) !== canonicalJson(renderPlan(manifest.entries, state, objects, next, baseline).existingMigrationLedger)) {
      fail("PLAN_DATABASE_STATE_CHANGED");
    }
    if (!next || next.id !== selected.id) fail(next ? "PLATFORM_SQL_ORDER_REJECTED" : "PLATFORM_SQL_ALREADY_APPLIED");
    if (selfTransactional) {
      await client.query(source.sql);
      if (transactionStatus !== "I") fail("SELF_TRANSACTION_END_UNVERIFIED");
    } else {
      await client.query("BEGIN"); inTransaction = true;
      await client.query(`SET LOCAL statement_timeout = '${TIMEOUT_MS}ms'`);
      await client.query(source.sql);
      await client.query("COMMIT"); inTransaction = false;
    }
    evidence.result = "applied";
    writeEvidence(evidenceDirectory, evidence); evidenceWritten = true;
    stdout({ mode: "apply", result: "applied", file: selected.path, sha256: selected.sha256 });
  } catch (error) {
    operationFailed = true;
    if (selfTransactional && connected) {
      try {
        await client.query("ROLLBACK");
        if (transactionStatus !== "I") fail("SELF_TRANSACTION_ROLLBACK_UNVERIFIED");
      } catch (rollbackError) {
        error = Object.assign(new Error("self transaction rollback could not be verified", { cause: rollbackError }), { code: "SELF_TRANSACTION_ROLLBACK_UNVERIFIED" });
      }
    } else if (inTransaction) {
      try { await client.query("ROLLBACK"); } catch { /* preserve original failure */ }
      inTransaction = false;
    }
    if (evidence) evidence.redactedError = safeCaptureDiagnostic(error, databaseUrl);
    if (error?.code && /^[A-Z][A-Z0-9_]{0,80}$/.test(error.code)) throw new Error(error.code);
    throw new Error(evidence?.redactedError || "PLATFORM_SQL_OPERATION_FAILED");
  } finally {
    if (mode === "plan" && connected) { /* successful plan already rolled back */ }
    if (connected) {
      try { await client.end(); } catch { /* don't mask query outcome */ }
    }
    if (typeof protocolConnection?.off === "function") protocolConnection.off("readyForQuery", onReadyForQuery);
    if (evidence && !evidenceWritten) {
      try { writeEvidence(evidenceDirectory, evidence); }
      catch {
        if (!operationFailed) throw new Error("EVIDENCE_WRITE_FAILED");
      }
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  executePlatformSql(process.argv.slice(2)).catch((error) => {
    const message = /^[A-Z][A-Z0-9_]{0,80}$/.test(error?.message || "") ? error.message : "PLATFORM_SQL_OPERATION_FAILED";
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  });
}
