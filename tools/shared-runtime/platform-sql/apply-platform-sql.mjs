import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { defaultCreateClient, safeCaptureDiagnostic, validateCaptureTarget } from "../inventory/lane-b-capture.mjs";
import { validRuntimeMemberships, rollbackManagedRuntimeRole, validHouseIssuerMemberships, rollbackHouseRuntimeIssuerRole } from "./bk01-runtime-membership.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "../../..");
const MANIFEST_PATH = path.join(HERE, "manifest.json");
const CAPTURE_CONFIG = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "tools/shared-runtime/inventory/lane-b-capture-config.json"), "utf8"));
const TIMEOUT_MS = 25_000;
const REQUIRED_PREFLIGHT_ROLES = ["anon", "authenticated", "service_role", "authenticator",
  "supabase_auth_admin", "supabase_admin", "postgres", "ps01_line_runtime", "ps01_runtime", "ps01_runtime_login", "ps01_migrator"];
// Stable signed-int key pair shared by every platform SQL operator on this database.
const ADVISORY_LOCK_KEY = [1_347_245_890, 2_026_092_929];

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
  const rollbackPaths = new Set();
  let previousOrder = -Infinity;
  for (const entry of manifest.entries) {
    if (!entry || !/^[a-z0-9-]+$/.test(entry.id || "") || ids.has(entry.id)
      || !Number.isInteger(entry.order) || entry.order <= previousOrder
      || !["house", "booking"].includes(entry.repository) || !safeRelative(entry.path)
      || !["wrap", "self"].includes(entry.tx) || !/^[a-f0-9]{64}$/.test(entry.sha256 || "") || !entry.rollback
      || !["wrap", "self"].includes(entry.rollback.tx)
      || !safeRelative(entry.rollback.path) || !/^[a-f0-9]{64}$/.test(entry.rollback.sha256 || "")
      || rollbackPaths.has(`${entry.repository}:${entry.rollback.path}`)) fail("MANIFEST_INVALID");
    const key = `${entry.repository}:${entry.path}`;
    if (paths.has(key)) fail("MANIFEST_INVALID");
    ids.add(entry.id); paths.add(key); rollbackPaths.add(`${entry.repository}:${entry.rollback.path}`); previousOrder = entry.order;
  }
  const issuerRole = manifest.entries.find((entry) => entry.id === "house-runtime-issuer-role");
  const issuer = manifest.entries.find((entry) => entry.id === "house-runtime-issuer");
  if (!issuerRole || !issuer || issuerRole.order !== 15 || issuer.order !== 20
    || issuerRole.repository !== "house" || issuer.repository !== "house"
    || issuerRole.path !== "docs/platform/shared-runtime/migrations/house_runtime_issuer_role.sql"
    || issuer.path !== "docs/platform/shared-runtime/migrations/house_runtime_issuer.sql"
    || issuerRole.order >= issuer.order) fail("MANIFEST_HOUSE_ISSUER_ROLE_STAGE_REQUIRED");
  const createdRoleOwners = new Map();
  for (const entry of manifest.entries) for (const role of entry.creates_roles || []) {
    if (!/^[a-z_][a-z0-9_]*$/.test(role) || createdRoleOwners.has(role)) fail("MANIFEST_ROLE_OWNER_INVALID");
    createdRoleOwners.set(role, entry);
  }
  if (createdRoleOwners.get("bk01_runtime")?.id !== "bk01-runtime-role"
    || createdRoleOwners.get("bk01_migrator")?.id !== "bk01-platform-bootstrap"
    || createdRoleOwners.get("wstera_runtime_issuer_login")?.id !== "house-runtime-issuer-role") {
    fail("MANIFEST_ROLE_OWNER_INVALID");
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

function entryForRollbackFile(manifest, requested) {
  const normalized = String(requested || "").replaceAll("\\", "/");
  const entry = manifest.entries.find((candidate) => candidate.rollback.path === normalized
    || `${candidate.repository}/${candidate.rollback.path}` === normalized);
  if (!entry) fail("SQL_ROLLBACK_FILE_NOT_IN_MANIFEST");
  return entry;
}

export function assertRoleReferencesOwned(sql, manifest) {
  const roleOwners = new Map(manifest.entries.flatMap((entry) =>
    (entry.creates_roles || []).map((role) => [role, entry])));
  const baselineRoles = new Set(REQUIRED_PREFLIGHT_ROLES);
  const ignored = new Set(["public", "if", "exists", "select", "where", "group", "order"]);
  const source = String(sql).replace(/--[^\r\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
  const references = new Set();
  for (const match of source.matchAll(/\brolname\s*=\s*'([^']+)'/gi)) references.add(match[1].toLowerCase());
  const code = source.replace(/'(?:''|[^'])*'/g, "''").replace(/\$([a-z_][a-z0-9_]*)?\$[\s\S]*?\$\1?\$/gi, "");
  for (const match of code.matchAll(/\bTO\s+([a-z_][a-z0-9_]*(?:\s*,\s*[a-z_][a-z0-9_]*)*)/gi)) {
    for (const role of match[1].split(",").map((item) => item.trim().toLowerCase())) if (!ignored.has(role)) references.add(role);
  }
  for (const match of code.matchAll(/\bREVOKE\b(?:(?!;)[\s\S])*?\bFROM\s+([a-z_][a-z0-9_]*(?:\s*,\s*[a-z_][a-z0-9_]*)*)/gi)) {
    for (const role of match[1].split(",").map((item) => item.trim().toLowerCase())) if (!ignored.has(role)) references.add(role);
  }
  for (const match of code.matchAll(/\b(?:CREATE|ALTER|DROP)\s+ROLE\s+([a-z_][a-z0-9_]*)/gi)) references.add(match[1].toLowerCase());
  const unowned = [...references].filter((role) => !ignored.has(role) && !baselineRoles.has(role) && !roleOwners.has(role));
  for (const role of ignored) references.delete(role);
  if (unowned.length) throw Object.assign(new Error("MANIFEST_ROLE_REFERENCE_UNOWNED"),
    { code: "MANIFEST_ROLE_REFERENCE_UNOWNED", roles: unowned });
  return { references: [...references].sort(), owners: Object.fromEntries([...references].filter((role) => roleOwners.has(role))
    .map((role) => [role, roleOwners.get(role).id])), allowlisted: [...references].filter((role) => baselineRoles.has(role)).sort() };
}

function validateAllPinnedSources(manifest, env, repoRoot, selected) {
  const forward = readPinnedFile(selected, env, repoRoot, manifest);
  const rollback = { ...selected, path: selected.rollback.path, sha256: selected.rollback.sha256 };
  const rollbackSource = readPinnedFile(rollback, env, repoRoot, manifest);
  const roleOwnership = {
    forward: assertRoleReferencesOwned(forward.sql, manifest),
    rollback: assertRoleReferencesOwned(rollbackSource.sql, manifest),
  };
  validateTransactionMode(forward.sql, selected.tx);
  validateTransactionMode(rollbackSource.sql, selected.rollback.tx);
  return { forward, rollback: rollbackSource, roleOwnership };
}

async function queryOne(client, sql, values = []) {
  const result = await client.query(sql, values);
  return result.rows?.[0] || {};
}

async function readState(client, manifest) {
  const baseline = await queryOne(client, `
    SELECT to_regclass('local_service_internal.schema_migrations') IS NOT NULL AS ledger_exists,
      to_regclass('local_service_internal.migration_baseline') IS NOT NULL AS migration_baseline_exists,
      EXISTS (SELECT 1 FROM pg_catalog.pg_namespace WHERE nspname='local_service_internal') AS internal_schema_exists,
      to_regprocedure('local_service_internal.request_user_id()') IS NOT NULL AS request_user_id_exists,
      EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname='bk01_migrator') AS bk01_migrator_role_exists,
      EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname='bk01_runtime') AS bk01_runtime_role_exists,
      EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname='ps01_runtime_login') AS ps01_runtime_login_role_exists,
      EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname='wstera_runtime_issuer_login') AS house_issuer_role_exists,
      to_regclass('wstera_platform_internal.runtime_token_grants') IS NOT NULL AS runtime_token_grants_exists,
      to_regprocedure('local_service.authorize_booking_recovery_attempt(uuid,text)') IS NOT NULL AS recovery_function_exists,
      to_regprocedure('local_service.claim_due_line_notifications(integer)') IS NOT NULL AS notification_function_exists,
      to_regprocedure('local_service.claim_stripe_webhook_event(text,text,timestamptz)') IS NOT NULL AS stripe_claim_function_exists,
      to_regprocedure('local_service.complete_line_notification(uuid,integer,text,timestamptz,timestamptz,text)') IS NOT NULL AS notification_complete_function_exists,
      to_regprocedure('local_service.sync_subscription_state_bk_a(text,bigint,uuid,text,text,text,text,bigint,boolean)') IS NOT NULL AS subscription_function_exists,
      (SELECT count(*)::int FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
       WHERE n.nspname='local_service' AND c.relkind IN ('r','p','v','m','f')) AS local_relations,
      (SELECT count(*)::int FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
       WHERE n.nspname='local_service' AND p.prokind IN ('f','p')) AS local_functions`);
  const preflightRoleRows = await client.query(`SELECT rolname FROM pg_catalog.pg_roles WHERE rolname = ANY($1::text[])`,
    [REQUIRED_PREFLIGHT_ROLES]);
  const presentPreflightRoles = new Set((preflightRoleRows.rows || []).map((row) => row.rolname));
  const missingPreflightRoles = REQUIRED_PREFLIGHT_ROLES.filter((role) => !presentPreflightRoles.has(role));
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
  const runtimeRole = await queryOne(client, `SELECT r.rolname, r.rolsuper, r.rolinherit,
    r.rolcreaterole, r.rolcreatedb, r.rolcanlogin, r.rolreplication, r.rolbypassrls, r.rolconfig,
    EXISTS (SELECT 1 FROM pg_catalog.pg_auth_members WHERE member=r.oid) AS member_of_other_role,
    EXISTS (SELECT 1 FROM pg_catalog.pg_auth_members WHERE roleid=r.oid OR grantor=r.oid) AS has_members,
    EXISTS (SELECT 1 FROM pg_catalog.pg_shdepend
      WHERE refclassid='pg_catalog.pg_authid'::regclass AND refobjid=r.oid) AS has_dependencies,
    COALESCE((SELECT json_agg(json_build_object('granted_role',parent.rolname,
      'member',member.rolname,'grantor',grantor.rolname,'admin_option',m.admin_option,
      'inherit_option',m.inherit_option,'set_option',m.set_option)
      ORDER BY parent.rolname,member.rolname,grantor.rolname)
      FROM pg_catalog.pg_auth_members m
      JOIN pg_catalog.pg_roles parent ON parent.oid=m.roleid
      JOIN pg_catalog.pg_roles member ON member.oid=m.member
      JOIN pg_catalog.pg_roles grantor ON grantor.oid=m.grantor
      WHERE m.roleid=r.oid OR m.member=r.oid OR m.grantor=r.oid), '[]'::json) AS memberships
    FROM pg_catalog.pg_roles r WHERE r.rolname='bk01_runtime'`);
  const issuer = await queryOne(client, `SELECT
    to_regclass('wstera_platform_internal.runtime_issuer_clients') IS NOT NULL AS a,
    to_regclass('wstera_platform_internal.runtime_issuer_rate_limits') IS NOT NULL AS b,
    to_regclass('wstera_platform_internal.runtime_issuer_audit') IS NOT NULL AS c,
    to_regprocedure('wstera_platform_internal.consume_runtime_issuer_rate_limit(text,integer,integer,timestamptz)') IS NOT NULL AS d`);
  const issuerComplete = [issuer.a, issuer.b, issuer.c, issuer.d].every(Boolean);
  const runtimeRoleExists = runtimeRole.rolname === "bk01_runtime";
  if (runtimeRoleExists) {
    const settings = [...(runtimeRole.rolconfig || [])].sort();
    if (["rolsuper", "rolinherit", "rolcreaterole", "rolcreatedb", "rolcanlogin", "rolreplication", "rolbypassrls"]
      .some((attribute) => runtimeRole[attribute] !== false)
      || canonicalJson(settings) !== canonicalJson(["lock_timeout=8s", "statement_timeout=8s"])
      || runtimeRole.member_of_other_role
      || !validRuntimeMemberships(runtimeRole.memberships, Boolean(baseline.ledger_exists))
      || (!baseline.ledger_exists && runtimeRole.has_dependencies)) {
      fail("EXISTING_BK01_RUNTIME_ROLE_CONFLICT");
    }
  }
  state["bk01-runtime-role"] = runtimeRoleExists;
  objects["bk01-runtime-role"] = { roleExists: runtimeRoleExists, attributes: runtimeRoleExists ? runtimeRole : null };
  const houseIssuerRole = await queryOne(client, `SELECT r.rolname, r.rolsuper, r.rolinherit,
    r.rolcreaterole, r.rolcreatedb, r.rolcanlogin, r.rolreplication, r.rolbypassrls, r.rolconfig,
    EXISTS (SELECT 1 FROM pg_catalog.pg_auth_members WHERE member=r.oid) AS member_of_other_role,
    EXISTS (SELECT 1 FROM pg_catalog.pg_auth_members WHERE roleid=r.oid OR grantor=r.oid) AS has_members,
    EXISTS (SELECT 1 FROM pg_catalog.pg_shdepend
      WHERE refclassid='pg_catalog.pg_authid'::regclass AND refobjid=r.oid) AS has_dependencies,
    COALESCE((SELECT json_agg(json_build_object('granted_role',parent.rolname,
      'member',member.rolname,'grantor',grantor.rolname,'admin_option',m.admin_option,
      'inherit_option',m.inherit_option,'set_option',m.set_option))
      FROM pg_catalog.pg_auth_members m
      JOIN pg_catalog.pg_roles parent ON parent.oid=m.roleid
      JOIN pg_catalog.pg_roles member ON member.oid=m.member
      JOIN pg_catalog.pg_roles grantor ON grantor.oid=m.grantor
      WHERE m.roleid=r.oid OR m.member=r.oid OR m.grantor=r.oid), '[]'::json) AS memberships
    FROM pg_catalog.pg_roles r WHERE r.rolname='wstera_runtime_issuer_login'`);
  const houseIssuerRoleExists = houseIssuerRole.rolname === "wstera_runtime_issuer_login";
  if (houseIssuerRoleExists) {
    const settings = [...(houseIssuerRole.rolconfig || [])].sort();
    if (["rolsuper", "rolinherit", "rolcreaterole", "rolcreatedb", "rolcanlogin", "rolreplication", "rolbypassrls"]
      .some((attribute) => houseIssuerRole[attribute] !== false)
      || canonicalJson(settings) !== canonicalJson(["lock_timeout=8s", "statement_timeout=8s"])
      || !validHouseIssuerMemberships(houseIssuerRole.memberships)
      || (houseIssuerRole.has_dependencies && !issuerComplete)) {
      fail("EXISTING_HOUSE_ISSUER_ROLE_CONFLICT");
    }
  }
  state["house-runtime-issuer-role"] = houseIssuerRoleExists;
  objects["house-runtime-issuer-role"] = { roleExists: houseIssuerRoleExists, attributes: houseIssuerRoleExists ? houseIssuerRole : null };
  state["bk01-platform-bootstrap"] = Boolean(baseline.ledger_exists);
  objects["bk01-platform-bootstrap"] = { schemaMigrationsTable: Boolean(baseline.ledger_exists) };
  objects["house-runtime-issuer"] = { clientsTable: Boolean(issuer.a), rateLimitsTable: Boolean(issuer.b), auditTable: Boolean(issuer.c), rateLimitFunction: Boolean(issuer.d) };
  state["house-runtime-issuer"] = Object.values(objects["house-runtime-issuer"]).every(Boolean);
  const h3c = await queryOne(client, `SELECT
    EXISTS (SELECT 1 FROM pg_catalog.pg_constraint c JOIN pg_catalog.pg_class t ON t.oid=c.conrelid
      JOIN pg_catalog.pg_namespace n ON n.oid=t.relnamespace WHERE n.nspname='wstera_platform_internal'
      AND t.relname='runtime_token_grants' AND c.conname='runtime_token_grants_database_role_check'
      AND pg_catalog.pg_get_constraintdef(c.oid) ILIKE '%bk01_runtime%') AS constraint_ready,
    COALESCE((SELECT p.prosrc ILIKE '%bk01_runtime%' FROM pg_catalog.pg_proc p
      JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='wstera_platform_internal'
      AND p.proname='custom_access_token_hook' LIMIT 1), false) AS function_ready,
    CASE WHEN EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname='supabase_auth_admin')
      AND to_regnamespace('wstera_platform_internal') IS NOT NULL
      THEN has_schema_privilege('supabase_auth_admin','wstera_platform_internal','USAGE') ELSE false END AS auth_schema_usage,
    CASE WHEN EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname='supabase_auth_admin')
      AND to_regclass('wstera_platform_internal.runtime_token_grants') IS NOT NULL
      THEN has_table_privilege('supabase_auth_admin','wstera_platform_internal.runtime_token_grants','SELECT') ELSE false END AS auth_token_grants_select,
    CASE WHEN EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname='supabase_auth_admin')
      AND to_regprocedure('wstera_platform_internal.custom_access_token_hook(jsonb)') IS NOT NULL
      THEN has_function_privilege('supabase_auth_admin',
        to_regprocedure('wstera_platform_internal.custom_access_token_hook(jsonb)'),'EXECUTE') ELSE false END AS auth_hook_execute`);
  objects["h3c-runtime-role-allowlist-expansion"] = { roleConstraint: Boolean(h3c.constraint_ready), hookFunction: Boolean(h3c.function_ready) };
  state["h3c-runtime-role-allowlist-expansion"] = Object.values(objects["h3c-runtime-role-allowlist-expansion"]).every(Boolean);
  const storage = await queryOne(client, `SELECT
    to_regclass('wstera_platform_internal.storage_upload_runtime_roles') IS NOT NULL AS a,
    to_regclass('wstera_platform_internal.storage_upload_bucket_allowlist') IS NOT NULL AS b,
    to_regclass('wstera_platform_internal.storage_upload_grants') IS NOT NULL AS c,
    to_regprocedure('wstera_platform_internal.consume_storage_upload()') IS NOT NULL AS d,
    EXISTS (SELECT 1 FROM pg_catalog.pg_trigger t JOIN pg_catalog.pg_class c ON c.oid=t.tgrelid
      JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='storage'
      AND c.relname='objects' AND t.tgname='wstera_consume_product_storage_upload_grant' AND NOT t.tgisinternal) AS e,
    CASE WHEN EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname='bk01_runtime')
      AND to_regnamespace('storage') IS NOT NULL
      THEN has_schema_privilege('bk01_runtime','storage','USAGE') ELSE false END AS f,
    CASE WHEN EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname='bk01_runtime')
      AND to_regclass('storage.objects') IS NOT NULL
      THEN has_table_privilege('bk01_runtime','storage.objects','INSERT') ELSE false END AS g,
    CASE WHEN EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname='bk01_runtime') THEN
      to_regprocedure('wstera_platform_internal.can_create_storage_upload(text,text)') IS NOT NULL
      AND has_function_privilege('bk01_runtime',
        to_regprocedure('wstera_platform_internal.can_create_storage_upload(text,text)'),'EXECUTE') ELSE false END AS h,
    CASE WHEN EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname='bk01_migrator')
      AND to_regnamespace('wstera_platform_internal') IS NOT NULL
      THEN has_schema_privilege('bk01_migrator','wstera_platform_internal','USAGE') ELSE false END AS i,
    CASE WHEN EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname='bk01_migrator') THEN
      to_regprocedure('wstera_platform_internal.register_storage_upload_grant(text,text,text,text,bigint,timestamptz)') IS NOT NULL
      AND has_function_privilege('bk01_migrator',
        to_regprocedure('wstera_platform_internal.register_storage_upload_grant(text,text,text,text,bigint,timestamptz)'),'EXECUTE') ELSE false END AS j`);
  objects["house-storage-upload-grants"] = { runtimeRoles: Boolean(storage.a), bucketAllowlist: Boolean(storage.b), grants: Boolean(storage.c), consumeFunction: Boolean(storage.d), storageTrigger: Boolean(storage.e) };
  state["house-storage-upload-grants"] = Object.values(objects["house-storage-upload-grants"]).every(Boolean);
  objects.preflightPrerequisites = {
    requiredBaselineRoles: REQUIRED_PREFLIGHT_ROLES,
    missingBaselineRoles: missingPreflightRoles,
    manifestRoleOwners: Object.fromEntries(manifest.entries.flatMap((entry) =>
      (entry.creates_roles || []).map((role) => [role, { id: entry.id, order: entry.order }]))),
    ps01RuntimeLoginRole: Boolean(baseline.ps01_runtime_login_role_exists),
    houseRuntimeIssuerRole: houseIssuerRoleExists,
    runtimeTokenGrants: Boolean(baseline.runtime_token_grants_exists),
    authSchemaUsage: Boolean(h3c.auth_schema_usage), authTokenGrantsSelect: Boolean(h3c.auth_token_grants_select),
    authHookExecute: Boolean(h3c.auth_hook_execute),
    runtimeStorageUsage: Boolean(storage.f), runtimeObjectsInsert: Boolean(storage.g),
    runtimeCanCreateExecute: Boolean(storage.h), migratorInternalUsage: Boolean(storage.i),
    migratorRegisterGrantExecute: Boolean(storage.j),
  };
  state.preflightPrerequisites = objects.preflightPrerequisites;
  return { state, objects, baseline: {
    ...baseline,
    key_objects: {
      migrationBaselineTable: Boolean(baseline.migration_baseline_exists),
      internalSchema: Boolean(baseline.internal_schema_exists),
      requestUserIdFunction: Boolean(baseline.request_user_id_exists),
      bk01MigratorRole: Boolean(baseline.bk01_migrator_role_exists),
      bk01RuntimeRole: Boolean(baseline.bk01_runtime_role_exists),
      ps01RuntimeLoginRole: Boolean(baseline.ps01_runtime_login_role_exists),
      houseRuntimeIssuerRole: Boolean(baseline.house_issuer_role_exists),
      runtimeTokenGrants: Boolean(baseline.runtime_token_grants_exists),
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
  const absoluteDirectory = path.resolve(dir);
  const relative = path.relative(REPO_ROOT, absoluteDirectory);
  if (!relative.startsWith("..") && !path.isAbsolute(relative)) fail("EVIDENCE_DIRECTORY_MUST_BE_EXTERNAL");
  fs.mkdirSync(absoluteDirectory, { recursive: true });
  const realDirectory = fs.realpathSync(absoluteDirectory);
  const realRelative = path.relative(fs.realpathSync(REPO_ROOT), realDirectory);
  if (!realRelative.startsWith("..") && !path.isAbsolute(realRelative)) fail("EVIDENCE_DIRECTORY_MUST_BE_EXTERNAL");
  return realDirectory;
}

function writeEvidence(directory, record) {
  const stem = String(record.file || record.attemptedFile || "preconnect").replace(/[^a-zA-Z0-9_-]/g, "_");
  const operation = String(record.operation || "evidence").replace(/[^a-zA-Z0-9_-]/g, "_");
  const name = `${operation}-${stem}-${record.at.replace(/[-:.]/g, "")}-${crypto.randomBytes(4).toString("hex")}.json`;
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
    || plan.projectRef !== projectRef || plan.toolGitSha !== toolSha(repoRoot)) fail("PLAN_ORDER_OR_STALENESS_REJECTED");
  return plan;
}

function readMutationHistory(directory, manifest) {
  let names;
  try { names = fs.readdirSync(directory).filter((name) => name.endsWith(".json") && name !== "latest-plan.json"); }
  catch { return []; }
  const records = [];
  for (const name of names) {
    let record;
    try { record = JSON.parse(fs.readFileSync(path.join(directory, name), "utf8")); }
    catch { fail("EVIDENCE_HISTORY_INVALID"); }
    if (!record || typeof record !== "object" || Array.isArray(record)) fail("EVIDENCE_HISTORY_INVALID");
    const operation = record.operation || (record.result === "applied" ? "apply" : null);
    if (!["apply", "rollback"].includes(operation) || !["applied", "rolled_back"].includes(record.result)) continue;
    if ((operation === "apply" && record.result !== "applied") || (operation === "rollback" && record.result !== "rolled_back")) fail("EVIDENCE_HISTORY_INVALID");
    const entry = manifest.entries.find((candidate) => candidate.path === record.file && candidate.sha256 === record.sha256);
    if (!entry || !Number.isFinite(Date.parse(record.at))) fail("EVIDENCE_HISTORY_INVALID");
    records.push({ entry, operation, at: Date.parse(record.at) });
  }
  records.sort((a, b) => a.at - b.at);
  for (let index = 1; index < records.length; index++) {
    if (records[index - 1].at === records[index].at) fail("EVIDENCE_HISTORY_INVALID");
  }
  const active = [];
  for (const record of records) {
    if (record.operation === "apply" && record.entry) {
      if (active.some((entry) => entry.id === record.entry.id) || (active.length && active.at(-1).order >= record.entry.order)) fail("EVIDENCE_HISTORY_INVALID");
      active.push(record.entry);
    }
    else if (record.operation === "rollback") {
      if (active.at(-1)?.id !== record.entry?.id) fail("EVIDENCE_HISTORY_INVALID");
      active.pop();
    }
  }
  return active;
}

function renderPlan(entries, state, objects, next, baseline, rollbackEntry) {
  return {
    mode: "plan-read-only",
    localServiceBaseline: { relations: Number(baseline.local_relations), functions: Number(baseline.local_functions) },
    existingMigrationLedger: { exists: Boolean(baseline.ledger_exists), rows: Number(baseline.ledger_rows), entries: baseline.ledger_entries },
    bootstrapKeyObjects: baseline.key_objects,
    preflightPrerequisites: objects.preflightPrerequisites,
    entries: entries.map((entry) => ({ file: entry.path, sha256: entry.sha256, applied: Boolean(state[entry.id]), keyObjects: objects[entry.id] })),
    next: next ? { file: next.path, sha256: next.sha256 } : null,
    rollback: rollbackEntry ? { file: rollbackEntry.rollback.path, sha256: rollbackEntry.rollback.sha256, forwardFile: rollbackEntry.path } : null,
  };
}

async function executePlatformSqlInternal(argv, {
  env = process.env,
  manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")),
  repoRoot = REPO_ROOT,
  createClient = defaultCreateClient,
  stdout = (value) => process.stdout.write(`${JSON.stringify(value, null, 2)}\n`),
} = {}, stateContext) {
  assertManifest(manifest);
  const [mode, ...args] = argv;
  if (mode !== "plan" && mode !== "apply" && mode !== "rollback") fail("USAGE: plan | apply --file <manifest-path> --confirm <sha256> | rollback --file <rollback-manifest-path> --confirm <sha256>");
  let selected = null;
  let operationSource = null;
  if (mode === "apply" || mode === "rollback") {
    if (args.length !== 4 || args[0] !== "--file" || args[2] !== "--confirm") fail(`USAGE: ${mode} --file <manifest-path> --confirm <sha256>`);
    selected = mode === "apply" ? entryForFile(manifest, args[1], repoRoot) : entryForRollbackFile(manifest, args[1]);
    const expectedHash = mode === "apply" ? selected.sha256 : selected.rollback.sha256;
    if (args[3] !== expectedHash) fail("CONFIRMATION_HASH_MISMATCH");
    operationSource = validateAllPinnedSources(manifest, env, repoRoot, selected);
  } else if (args.length) fail("USAGE: plan");

  const projectRef = env[CAPTURE_CONFIG.project_ref_env];
  const databaseUrl = env[CAPTURE_CONFIG.database_url_env];
  const evidenceDirectory = ensureExternalEvidenceDirectory(env);
  const history = readMutationHistory(evidenceDirectory, manifest);
  const latestApplied = history.at(-1) || null;
  if (mode === "apply" || mode === "rollback") {
    const plan = readAndValidatePlan(evidenceDirectory, selected, projectRef, repoRoot);
    const plannedFile = mode === "apply" ? plan.next?.file : plan.rollback?.file;
    const plannedHash = mode === "apply" ? plan.next?.sha256 : plan.rollback?.sha256;
    if (plannedFile !== (mode === "apply" ? selected.path : selected.rollback.path)
      || plannedHash !== (mode === "apply" ? selected.sha256 : selected.rollback.sha256)
      || (mode === "rollback" && plan.rollback?.forwardFile !== selected.path)) fail("PLAN_ORDER_OR_STALENESS_REJECTED");
    if (mode === "rollback" && latestApplied?.id !== selected.id) fail("ROLLBACK_NOT_LATEST_APPLIED");
  }
  const target = validateCaptureTarget({ projectRef, databaseUrl, config: CAPTURE_CONFIG });
  const client = await createClient(target.connectionConfig);
  const selfTransactional = (mode === "apply" && selected.tx === "self") || (mode === "rollback" && selected.rollback.tx === "self");
  const protocolConnection = client.connection;
  let transactionStatus = null;
  const onReadyForQuery = (message) => { transactionStatus = message?.status || null; };
  if (selfTransactional && typeof protocolConnection?.on === "function") protocolConnection.on("readyForQuery", onReadyForQuery);
  let connected = false;
  let inTransaction = false;
  let evidence = null;
  let evidenceWritten = false;
  let operationFailed = false;
  let lockAcquired = false;
  let successOutput = null;
  try {
    if (mode === "apply" || mode === "rollback") {
      evidence = {
        file: selected.path,
        sha256: selected.sha256,
        operation: mode,
        rollbackFile: selected.rollback.path,
        rollbackSha256: selected.rollback.sha256,
        toolGitSha: toolSha(repoRoot),
        at: new Date().toISOString(),
        result: "failed",
        redactedError: null,
        provenance: { mode: `platform-sql-${mode}`, projectRef: target.projectRef, sourceRepository: selected.repository },
      };
    }
    stateContext.connectionAttempted = true;
    await client.connect(); connected = true;
    if (mode === "apply" || mode === "rollback") {
      const lock = await queryOne(client, "SELECT pg_try_advisory_lock($1, $2) AS acquired", ADVISORY_LOCK_KEY);
      if (lock.acquired !== true) fail("PLATFORM_SQL_ADVISORY_LOCK_UNAVAILABLE");
      lockAcquired = true;
    }
    if (mode === "plan") await client.query("BEGIN READ ONLY");
    const { state, objects, baseline } = await readState(client, manifest);
    state.objectPresence = objects;
    if (mode === "apply" && objects.preflightPrerequisites.missingBaselineRoles.length) {
      fail("PREFLIGHT_REQUIRED_ROLES_MISSING");
    }
    const next = determineNext(manifest, state, baseline);
    if (mode === "plan") {
      await client.query("ROLLBACK");
      const active = readMutationHistory(evidenceDirectory, manifest);
      const rollbackEntry = active.at(-1) || null;
      const result = renderPlan(manifest.entries, state, objects, next, baseline, rollbackEntry);
      const plan = { createdAt: new Date().toISOString(), projectRef: target.projectRef,
        toolGitSha: toolSha(repoRoot), next: result.next, rollback: result.rollback,
        state: Object.fromEntries(Object.entries(state).filter(([key]) => key !== "objectPresence")), baseline: result.existingMigrationLedger };
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
    if (mode === "apply" && (!next || next.id !== selected.id)) fail(next ? "PLATFORM_SQL_ORDER_REJECTED" : "PLATFORM_SQL_ALREADY_APPLIED");
    if (mode === "rollback") {
      const laterEntriesApplied = manifest.entries.some((entry) => entry.order > selected.order && state[entry.id]);
      if (!state[selected.id] || laterEntriesApplied || latestApplied?.id !== selected.id) fail("ROLLBACK_NOT_LATEST_APPLIED");
    }
    if (selfTransactional) {
      await client.query(mode === "apply" ? operationSource.forward.sql : operationSource.rollback.sql);
      if (transactionStatus !== "I") fail("SELF_TRANSACTION_END_UNVERIFIED");
    } else {
      await client.query("BEGIN"); inTransaction = true;
      await client.query(`SET LOCAL statement_timeout = '${TIMEOUT_MS}ms'`);
      if (mode === "rollback" && selected.id === "bk01-runtime-role") {
        evidence.executionPolicy = "A10_MANAGED_RUNTIME_ROLE_DROP";
        await rollbackManagedRuntimeRole(client);
      } else if (mode === "rollback" && selected.id === "house-runtime-issuer-role") {
        evidence.executionPolicy = "GO6_MANAGED_HOUSE_ISSUER_ROLE_DROP";
        await rollbackHouseRuntimeIssuerRole(client);
      } else {
        await client.query(mode === "apply" ? operationSource.forward.sql : operationSource.rollback.sql);
      }
      await client.query("COMMIT"); inTransaction = false;
    }
    evidence.result = mode === "apply" ? "applied" : "rolled_back";
    writeEvidence(evidenceDirectory, evidence); evidenceWritten = true;
    successOutput = { mode, result: mode === "apply" ? "applied" : "rolled_back", file: mode === "apply" ? selected.path : selected.rollback.path, sha256: mode === "apply" ? selected.sha256 : selected.rollback.sha256 };
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
    if (error?.code && /^[0-9A-Z]{5}$/.test(error.code)) throw new Error(`${error.code}: ${evidence?.redactedError || "database operation failed"}`);
    throw new Error(evidence?.redactedError || "PLATFORM_SQL_OPERATION_FAILED");
  } finally {
    if (lockAcquired) {
      try {
        const unlock = await queryOne(client, "SELECT pg_advisory_unlock($1, $2) AS unlocked", ADVISORY_LOCK_KEY);
        if (unlock.unlocked !== true) stateContext.unlockError = "PLATFORM_SQL_ADVISORY_UNLOCK_FAILED";
      } catch { stateContext.unlockError = "PLATFORM_SQL_ADVISORY_UNLOCK_FAILED"; }
    }
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
  if (stateContext.unlockError) throw new Error(stateContext.unlockError);
  if (successOutput) stdout(successOutput);
}

function errorCode(error) {
  const code = error?.code || error?.cause?.code;
  if (code && /^[A-Z][A-Z0-9_]{0,80}$/.test(code)) return code;
  if (code && /^[0-9A-Z]{5}$/.test(code)) return code;
  const message = String(error?.message || "");
  return /^[A-Z][A-Z0-9_]{0,80}$/.test(message) ? message : "PLATFORM_SQL_OPERATION_FAILED";
}

export async function executePlatformSql(argv, dependencies = {}) {
  const stateContext = { connectionAttempted: false, lockAcquired: false, unlockError: null };
  try {
    return await executePlatformSqlInternal(argv, dependencies, stateContext);
  } catch (error) {
    if (!stateContext.connectionAttempted) {
      const env = dependencies.env || process.env;
      try {
        const directory = ensureExternalEvidenceDirectory(env);
        const repoRoot = dependencies.repoRoot || REPO_ROOT;
        const code = errorCode(error);
        writeEvidence(directory, {
          operation: "preconnect-rejected",
          code,
          at: new Date().toISOString(),
          toolGitSha: toolSha(repoRoot),
        });
      } catch { /* invalid evidence destination cannot safely receive a record */ }
    }
    if (stateContext.unlockError) throw new Error(stateContext.unlockError);
    const code = errorCode(error);
    if (code !== "PLATFORM_SQL_OPERATION_FAILED" && code !== error?.message) throw new Error(code, { cause: error });
    throw error;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  executePlatformSql(process.argv.slice(2)).catch((error) => {
    const message = /^[A-Z][A-Z0-9_]{0,80}$/.test(error?.message || "")
      || /^[0-9A-Z]{5}: /.test(error?.message || "") ? error.message : "PLATFORM_SQL_OPERATION_FAILED";
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  });
}
