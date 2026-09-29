import assert from "node:assert/strict";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { EventEmitter } from "node:events";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { executePlatformSql, containsTopLevelTransactionControl } from "./apply-platform-sql.mjs";
import { safeCaptureDiagnostic } from "../inventory/lane-b-capture.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../..");
const MANIFEST = JSON.parse(fs.readFileSync(path.join(HERE, "manifest.json"), "utf8"));
const projectRef = "ykxlqnshaaxmzzocpjlj";
const databaseUrl = "postgresql://postgres.ykxlqnshaaxmzzocpjlj:offline-test-password@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=verify-full";
const temporaryDirectories = new Set();
process.on("exit", () => { for (const directory of temporaryDirectories) fs.rmSync(directory, { recursive: true, force: true }); });

function setup({ issuerApplied = false } = {}) {
  const evidence = fs.mkdtempSync(path.join(os.tmpdir(), "platform-sql-test-"));
  temporaryDirectories.add(evidence);
  const env = { LANE_B_PROJECT_REF: projectRef, LANE_B_DATABASE_URL: databaseUrl,
    BK01_REPO_ROOT: ROOT, PLATFORM_SQL_EVIDENCE_DIR: evidence };
  let clientCreates = 0;
  const calls = [];
  const createClient = async () => {
    clientCreates++;
    return {
      async connect() { calls.push("CONNECT"); },
      async end() { calls.push("END"); },
      async query(sql) {
        calls.push(sql);
        if (String(sql).includes("pg_try_advisory_lock")) return { rows: [{ acquired: true }] };
        if (String(sql).includes("pg_advisory_unlock")) return { rows: [{ unlocked: true }] };
        if (sql.includes("SELECT to_regclass('local_service_internal.schema_migrations')")) return { rows: [{ ledger_exists: true, local_relations: 22, local_functions: 61 }] };
        if (sql.includes("runtime_issuer_clients")) return { rows: [{ a: issuerApplied, b: issuerApplied, c: issuerApplied, d: issuerApplied }] };
        if (sql.includes("runtime_token_grants")) return { rows: [{ constraint_ready: false, function_ready: false }] };
        if (sql.includes("storage_upload_runtime_roles")) return { rows: [{ a: false, b: false, c: false, d: false, e: false }] };
        if (sql.includes("SELECT count(*)::int AS count FROM local_service_internal.schema_migrations")) return { rows: [{ count: 0 }] };
        return { rows: [] };
      },
    };
  };
  return { evidence, env, calls, createClient, get clientCreates() { return clientCreates; } };
}

async function expectCode(action, code) {
  await assert.rejects(action, (error) => typeof code === "function" ? code(error) : error.message === code || error.code === code);
}

function withPlan(ctx, nextEntry) {
  const nextIndex = MANIFEST.entries.findIndex((entry) => entry.id === nextEntry?.id);
  const state = Object.fromEntries(MANIFEST.entries.map((entry, index) => [entry.id, index < nextIndex]));
  fs.writeFileSync(path.join(ctx.evidence, "latest-plan.json"), JSON.stringify({
    createdAt: new Date().toISOString(), projectRef, toolGitSha: "", next: nextEntry && { file: nextEntry.path, sha256: nextEntry.sha256 },
    state,
    baseline: { exists: true, rows: 0, entries: [] },
  }));
  const git = requireGitHead();
  const plan = JSON.parse(fs.readFileSync(path.join(ctx.evidence, "latest-plan.json"), "utf8"));
  plan.toolGitSha = git;
  fs.writeFileSync(path.join(ctx.evidence, "latest-plan.json"), JSON.stringify(plan));
}
function requireGitHead() {
  return execFileSync("git", ["-C", ROOT, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
}

test("top-level transaction statements are rejected without flagging DO bodies or literals", () => {
  assert.equal(containsTopLevelTransactionControl("-- BEGIN;\nDO $body$ BEGIN NULL; END; $body$; SELECT 'COMMIT;';"), false);
  assert.equal(containsTopLevelTransactionControl("BEGIN; SELECT 1; COMMIT;"), true);
  assert.equal(containsTopLevelTransactionControl("DO $bk01$ BEGIN NULL; END $bk01$;"), false);
});

test("self transaction validator accepts one outer BEGIN and final COMMIT while ignoring quoted text", async () => {
  const { validateTransactionMode } = await import("./apply-platform-sql.mjs");
  assert.equal(typeof validateTransactionMode, "function", "self-transactional SQL needs a structural validator");
  assert.doesNotThrow(() => validateTransactionMode(`-- leading comment\nBEGIN;\nSELECT 'COMMIT; SAVEPOINT x', E'ROLLBACK\\\\;';\nDO $body$ BEGIN RAISE NOTICE 'ROLLBACK'; END $body$;\n/* COMMIT; */\nCOMMIT;`, "self"));
});

test("self transaction validator rejects middle controls and incomplete wrappers", async () => {
  const { validateTransactionMode } = await import("./apply-platform-sql.mjs");
  assert.equal(typeof validateTransactionMode, "function", "self-transactional SQL needs a structural validator");
  for (const sql of [
    "BEGIN; SELECT 1; COMMIT; SELECT 2;",
    "BEGIN; SAVEPOINT s; COMMIT;",
    "BEGIN; SELECT 1;",
    "DO $$ BEGIN NULL; END $$;",
    "BEGIN; ROLLBACK; COMMIT;",
    "BEGIN; BEGIN; COMMIT;",
    "BEGIN; COMMIT; COMMIT;",
    "BEGIN; \\echo forbidden\n COMMIT;",
  ]) assert.throws(() => validateTransactionMode(sql, "self"), { code: "SELF_TRANSACTION_SHAPE_INVALID" });
  assert.doesNotThrow(() => validateTransactionMode("-- words in a comment: BEGIN; COMMIT;\nSELECT 'BEGIN;';", "wrap"));
  assert.throws(() => validateTransactionMode("BEGIN; SELECT 1; COMMIT;", "wrap"), { code: "WRAPPED_SQL_TRANSACTION_CONTROL_REJECTED" });
});

test("non-manifest file rejects before client creation", async () => {
  const ctx = setup();
  await expectCode(() => executePlatformSql(["apply", "--file", "../../private.sql", "--confirm", "a".repeat(64)], { ...ctx, env: ctx.env, manifest: MANIFEST, repoRoot: ROOT }), "SQL_FILE_NOT_IN_MANIFEST");
  assert.equal(ctx.clientCreates, 0);
});

test("SQL hash mismatch rejects before client creation", async () => {
  const ctx = setup();
  const manifest = structuredClone(MANIFEST);
  const entry = manifest.entries[1]; entry.sha256 = "0".repeat(64);
  await expectCode(() => executePlatformSql(["apply", "--file", entry.path, "--confirm", entry.sha256], { env: ctx.env, createClient: ctx.createClient, manifest, repoRoot: ROOT }), "SQL_HASH_MISMATCH");
  assert.equal(ctx.clientCreates, 0);
});

test("confirmation hash mismatch rejects before client creation", async () => {
  const ctx = setup(); const entry = MANIFEST.entries[1];
  await expectCode(() => executePlatformSql(["apply", "--file", entry.path, "--confirm", "0".repeat(64)], { env: ctx.env, createClient: ctx.createClient, manifest: MANIFEST, repoRoot: ROOT }), "CONFIRMATION_HASH_MISMATCH");
  assert.equal(ctx.clientCreates, 0);
});

test("booking source revision mismatch rejects bootstrap before client creation", async () => {
  const ctx = setup(); const entry = MANIFEST.entries[0];
  await expectCode(() => executePlatformSql(["apply", "--file", entry.path, "--confirm", entry.sha256], { env: ctx.env, createClient: ctx.createClient, manifest: MANIFEST, repoRoot: ROOT }), "BOOKING_SOURCE_SHA_MISMATCH");
  assert.equal(ctx.clientCreates, 0);
});

test("out-of-order apply rejects from the pinned plan before client creation", async () => {
  const ctx = setup(); const entry = MANIFEST.entries[1];
  withPlan(ctx, MANIFEST.entries[0]);
  await expectCode(() => executePlatformSql(["apply", "--file", entry.path, "--confirm", entry.sha256], { env: ctx.env, createClient: ctx.createClient, manifest: MANIFEST, repoRoot: ROOT }), "PLAN_ORDER_OR_STALENESS_REJECTED");
  assert.equal(ctx.clientCreates, 0);
});

test("plan inspects state in a read-only transaction and records the next approved file", async () => {
  const ctx = setup(); const output = [];
  await executePlatformSql(["plan"], { env: ctx.env, createClient: ctx.createClient, manifest: MANIFEST, repoRoot: ROOT, stdout: (value) => output.push(value) });
  assert.ok(ctx.calls.includes("BEGIN READ ONLY"));
  assert.ok(ctx.calls.includes("ROLLBACK"));
  assert.equal(output[0].next.file, MANIFEST.entries[1].path);
  assert.equal(output[0].rollback, null);
  assert.equal(JSON.parse(fs.readFileSync(path.join(ctx.evidence, "latest-plan.json"), "utf8")).next.sha256, MANIFEST.entries[1].sha256);
});

test("pinned H3C and storage source files satisfy self transaction structure", async () => {
  const { validateTransactionMode } = await import("./apply-platform-sql.mjs");
  assert.equal(typeof validateTransactionMode, "function", "self-transactional SQL needs a structural validator");
  for (const entry of MANIFEST.entries.slice(2)) {
    assert.equal(entry.tx, "self");
    const sql = fs.readFileSync(path.join(ROOT, entry.path), "utf8");
    assert.doesNotThrow(() => validateTransactionMode(sql, "self"), entry.path);
  }
});

test("House rollback files match their pinned hashes and declared transaction modes", async () => {
  const { validateTransactionMode } = await import("./apply-platform-sql.mjs");
  for (const entry of MANIFEST.entries.filter((item) => item.repository === "house")) {
    const file = path.join(ROOT, entry.rollback.path);
    const bytes = fs.readFileSync(file);
    assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"), entry.rollback.sha256, entry.rollback.path);
    assert.doesNotThrow(() => validateTransactionMode(bytes.toString("utf8"), entry.rollback.tx), entry.rollback.path);
  }
});

test("self mode executes pinned SQL literally without an outer wrapper", async () => {
  const ctx = setup({ issuerApplied: true });
  const manifest = structuredClone(MANIFEST);
  const entry = manifest.entries[2];
  assert.equal(entry.tx, "self");
  withPlan(ctx, entry);
  let executedSql;
  const originalCreateClient = ctx.createClient;
  ctx.createClient = async (...args) => {
    const client = await originalCreateClient(...args);
    client.connection = new EventEmitter();
    client.connectionStatus = "I";
    const originalQuery = client.query.bind(client);
    client.query = async (sql, values) => {
      if (String(sql).includes("-- House platform migration: expand the existing H3C")) {
        executedSql = sql;
        client.connectionStatus = "I";
        client.connection.emit("readyForQuery", { status: "I" });
        return { rows: [] };
      }
      return originalQuery(sql, values);
    };
    return client;
  };
  await executePlatformSql(["apply", "--file", entry.path, "--confirm", entry.sha256], { env: ctx.env, createClient: ctx.createClient, manifest, repoRoot: ROOT, stdout: () => {} });
  assert.equal(executedSql, fs.readFileSync(path.join(ROOT, entry.path), "utf8"));
  assert.equal(ctx.calls.includes("BEGIN"), false);
  assert.equal(ctx.calls.some((sql) => String(sql).startsWith("SET LOCAL statement_timeout")), false);
});

test("self mode rolls back a mid-file error and verifies idle transaction status", async () => {
  const ctx = setup({ issuerApplied: true });
  const manifest = structuredClone(MANIFEST);
  const entry = manifest.entries[2];
  assert.equal(entry.tx, "self");
  withPlan(ctx, entry);
  const originalCreateClient = ctx.createClient;
  ctx.createClient = async (...args) => {
    const client = await originalCreateClient(...args);
    client.connection = new EventEmitter();
    client.connectionStatus = "I";
    const originalQuery = client.query.bind(client);
    client.query = async (sql, values) => {
      if (String(sql).includes("-- House platform migration: expand the existing H3C")) {
        client.connectionStatus = "E";
        client.connection.emit("readyForQuery", { status: "E" });
        throw new Error("mid-file statement failed");
      }
      if (sql === "ROLLBACK") {
        ctx.calls.push(sql);
        client.connectionStatus = "I";
        client.connection.emit("readyForQuery", { status: "I" });
        return { rows: [] };
      }
      return originalQuery(sql, values);
    };
    return client;
  };
  await expectCode(() => executePlatformSql(["apply", "--file", entry.path, "--confirm", entry.sha256], { env: ctx.env, createClient: ctx.createClient, manifest, repoRoot: ROOT }), (error) => error.message.includes("mid-file statement failed"));
  assert.ok(ctx.calls.includes("ROLLBACK"));
  assert.equal(ctx.calls.some((sql) => String(sql).startsWith("SET LOCAL statement_timeout")), false);
});

test("self mode fails closed when rollback does not report the idle protocol state", async () => {
  const ctx = setup({ issuerApplied: true });
  const manifest = structuredClone(MANIFEST);
  const entry = manifest.entries[2];
  assert.equal(entry.tx, "self");
  withPlan(ctx, entry);
  const originalCreateClient = ctx.createClient;
  ctx.createClient = async (...args) => {
    const client = await originalCreateClient(...args);
    client.connection = new EventEmitter();
    const originalQuery = client.query.bind(client);
    client.query = async (sql, values) => {
      if (String(sql).includes("-- House platform migration: expand the existing H3C")) {
        client.connection.emit("readyForQuery", { status: "E" });
        throw new Error("mid-file statement failed");
      }
      if (sql === "ROLLBACK") {
        ctx.calls.push(sql);
        client.connection.emit("readyForQuery", { status: "E" });
        return { rows: [] };
      }
      return originalQuery(sql, values);
    };
    return client;
  };
  await expectCode(() => executePlatformSql(["apply", "--file", entry.path, "--confirm", entry.sha256], { env: ctx.env, createClient: ctx.createClient, manifest, repoRoot: ROOT }), "SELF_TRANSACTION_ROLLBACK_UNVERIFIED");
  assert.ok(ctx.calls.includes("ROLLBACK"));
});

test("production project ref rejects before client creation", async () => {
  const ctx = setup(); ctx.env.LANE_B_PROJECT_REF = "gyleqrjdzwwlqierdwcy";
  await expectCode(() => executePlatformSql(["plan"], { env: ctx.env, createClient: ctx.createClient, manifest: MANIFEST, repoRoot: ROOT }), "PROJECT_REF_REJECTED");
  assert.equal(ctx.clientCreates, 0);
});

test("failed file execution rolls its transaction back and emits redacted evidence", async () => {
  const ctx = setup();
  const entry = MANIFEST.entries[1];
  withPlan(ctx, entry);
  const originalCreateClient = ctx.createClient;
  ctx.createClient = async (...args) => {
    const client = await originalCreateClient(...args);
    const originalQuery = client.query.bind(client);
    client.query = async (sql, values) => {
      if (String(sql).startsWith("-- Guarded rollback") || String(sql).startsWith("-- House runtime")) return originalQuery(sql, values);
      if (String(sql).includes("CREATE SCHEMA IF NOT EXISTS wstera_platform_internal")) {
        ctx.calls.push(sql); throw new Error(`connect postgres://postgres:${new URL(databaseUrl).password}@secret.example/db failed`);
      }
      return originalQuery(sql, values);
    };
    return client;
  };
  await expectCode(() => executePlatformSql(["apply", "--file", entry.path, "--confirm", entry.sha256], { env: ctx.env, createClient: ctx.createClient, manifest: MANIFEST, repoRoot: ROOT }), (error) => error.message.includes("[connection redacted] failed"));
  assert.ok(ctx.calls.includes("ROLLBACK"));
  const records = fs.readdirSync(ctx.evidence).filter((name) => name.endsWith(".json") && name !== "latest-plan.json");
  assert.equal(records.length, 1);
  const evidence = JSON.parse(fs.readFileSync(path.join(ctx.evidence, records[0]), "utf8"));
  assert.equal(evidence.result, "failed");
  assert.equal(JSON.stringify(evidence).includes("offline-test-password"), false);
  assert.equal(JSON.stringify(evidence).includes("secret.example"), false);
});

test("approved next file applies in one transaction and records external evidence", async () => {
  const ctx = setup(); const entry = MANIFEST.entries[1]; const output = [];
  withPlan(ctx, entry);
  await executePlatformSql(["apply", "--file", entry.path, "--confirm", entry.sha256], {
    env: ctx.env, createClient: ctx.createClient, manifest: MANIFEST, repoRoot: ROOT, stdout: (value) => output.push(value),
  });
  assert.ok(ctx.calls.includes("BEGIN"));
  assert.ok(ctx.calls.some((sql) => sql.startsWith("SET LOCAL statement_timeout")));
  assert.ok(ctx.calls.includes("COMMIT"));
  assert.equal(output[0].result, "applied");
  const records = fs.readdirSync(ctx.evidence).filter((name) => name.endsWith(".json") && name !== "latest-plan.json");
  assert.equal(records.length, 1);
  const evidence = JSON.parse(fs.readFileSync(path.join(ctx.evidence, records[0]), "utf8"));
  assert.equal(evidence.result, "applied");
  assert.equal(evidence.sha256, entry.sha256);
});

test("capture diagnostic redacts URL credentials and host", () => {
  const result = safeCaptureDiagnostic(new Error(`failed postgres://user:secret@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres`), databaseUrl);
  assert.equal(result.includes("secret"), false);
  assert.equal(result.includes("pooler.supabase.com"), false);
});

test("rollback uses the exact paired source, fresh plan, lock, and rollback evidence", async () => {
  const ctx = setup({ issuerApplied: true });
  const entry = MANIFEST.entries[1];
  const plan = {
    createdAt: new Date().toISOString(), projectRef, toolGitSha: requireGitHead(),
    next: { file: MANIFEST.entries[2].path, sha256: MANIFEST.entries[2].sha256 },
    rollback: { file: entry.rollback.path, sha256: entry.rollback.sha256, forwardFile: entry.path },
    state: Object.fromEntries(MANIFEST.entries.map((item) => [item.id, item.id !== MANIFEST.entries[2].id && item.id !== MANIFEST.entries[3].id])),
    baseline: { exists: true, rows: 0, entries: [] },
  };
  fs.writeFileSync(path.join(ctx.evidence, "latest-plan.json"), JSON.stringify(plan));
  fs.writeFileSync(path.join(ctx.evidence, "apply-prior.json"), JSON.stringify({
    file: entry.path, sha256: entry.sha256, operation: "apply", at: new Date(Date.now() - 1000).toISOString(), result: "applied",
  }));
  const output = [];
  const originalCreateClient = ctx.createClient;
  ctx.createClient = async (...args) => {
    const client = await originalCreateClient(...args);
    client.connection = new EventEmitter();
    client.connectionStatus = "I";
    const originalQuery = client.query.bind(client);
    client.query = async (sql, values) => {
      if (String(sql).includes("Guarded rollback")) {
        client.connectionStatus = "I";
        client.connection.emit("readyForQuery", { status: "I" });
        return { rows: [] };
      }
      return originalQuery(sql, values);
    };
    return client;
  };
  await executePlatformSql(["rollback", "--file", entry.rollback.path, "--confirm", entry.rollback.sha256], {
    env: ctx.env, createClient: ctx.createClient, manifest: MANIFEST, repoRoot: ROOT, stdout: (value) => output.push(value),
  });
  assert.ok(ctx.calls.includes("SELECT pg_try_advisory_lock($1, $2) AS acquired"));
  assert.ok(ctx.calls.includes("SELECT pg_advisory_unlock($1, $2) AS unlocked"));
  assert.equal(output[0].result, "rolled_back");
  const records = fs.readdirSync(ctx.evidence).filter((name) => name.endsWith(".json") && name !== "latest-plan.json" && name !== "apply-prior.json");
  const evidence = JSON.parse(fs.readFileSync(path.join(ctx.evidence, records[0]), "utf8"));
  assert.equal(evidence.operation, "rollback");
  assert.equal(evidence.result, "rolled_back");
});

test("rollback paths outside the manifest reject before client construction and write evidence", async () => {
  const ctx = setup();
  await expectCode(() => executePlatformSql(["rollback", "--file", "../../untrusted.sql", "--confirm", "a".repeat(64)], {
    env: ctx.env, createClient: ctx.createClient, manifest: MANIFEST, repoRoot: ROOT,
  }), "SQL_ROLLBACK_FILE_NOT_IN_MANIFEST");
  assert.equal(ctx.clientCreates, 0);
  const records = fs.readdirSync(ctx.evidence).filter((name) => name.endsWith(".json"));
  const rejection = JSON.parse(fs.readFileSync(path.join(ctx.evidence, records[0]), "utf8"));
  assert.equal(rejection.code, "SQL_ROLLBACK_FILE_NOT_IN_MANIFEST");
  assert.ok(rejection.at);
  assert.equal(rejection.toolGitSha, requireGitHead());
});

test("rollback refuses a file that is not the last successful apply in evidence", async () => {
  const ctx = setup();
  const earlier = MANIFEST.entries[1]; const latest = MANIFEST.entries[2];
  const plan = {
    createdAt: new Date().toISOString(), projectRef, toolGitSha: requireGitHead(),
    next: { file: MANIFEST.entries[2].path, sha256: MANIFEST.entries[2].sha256 },
    rollback: { file: latest.rollback.path, sha256: latest.rollback.sha256, forwardFile: latest.path },
    state: Object.fromEntries(MANIFEST.entries.map((entry) => [entry.id, entry.order <= latest.order])),
    baseline: { exists: true, rows: 0, entries: [] },
  };
  fs.writeFileSync(path.join(ctx.evidence, "latest-plan.json"), JSON.stringify(plan));
  fs.writeFileSync(path.join(ctx.evidence, "apply-earlier.json"), JSON.stringify({ file: earlier.path, sha256: earlier.sha256, operation: "apply", at: new Date(Date.now() - 2000).toISOString(), result: "applied" }));
  fs.writeFileSync(path.join(ctx.evidence, "apply-latest.json"), JSON.stringify({ file: latest.path, sha256: latest.sha256, operation: "apply", at: new Date(Date.now() - 1000).toISOString(), result: "applied" }));
  await expectCode(() => executePlatformSql(["rollback", "--file", earlier.rollback.path, "--confirm", earlier.rollback.sha256], {
    env: ctx.env, createClient: ctx.createClient, manifest: MANIFEST, repoRoot: ROOT,
  }), "PLAN_ORDER_OR_STALENESS_REJECTED");
  assert.equal(ctx.clientCreates, 0);
});

test("guarded rollback SQLSTATE is returned clearly and does not retry or rewrite the rollback", async () => {
  const ctx = setup({ issuerApplied: true });
  const entry = MANIFEST.entries[1];
  fs.writeFileSync(path.join(ctx.evidence, "latest-plan.json"), JSON.stringify({
    createdAt: new Date().toISOString(), projectRef, toolGitSha: requireGitHead(),
    next: { file: MANIFEST.entries[2].path, sha256: MANIFEST.entries[2].sha256 },
    rollback: { file: entry.rollback.path, sha256: entry.rollback.sha256, forwardFile: entry.path },
    state: Object.fromEntries(MANIFEST.entries.map((item) => [item.id, item.order <= entry.order])),
    baseline: { exists: true, rows: 0, entries: [] },
  }));
  fs.writeFileSync(path.join(ctx.evidence, "apply-prior.json"), JSON.stringify({
    file: entry.path, sha256: entry.sha256, operation: "apply", at: new Date(Date.now() - 1000).toISOString(), result: "applied",
  }));
  const originalCreateClient = ctx.createClient;
  ctx.createClient = async (...args) => {
    const client = await originalCreateClient(...args);
    client.connection = new EventEmitter(); client.connectionStatus = "I";
    const originalQuery = client.query.bind(client);
    client.query = async (sql, values) => {
      if (String(sql).includes("Guarded rollback")) {
        client.connectionStatus = "E"; client.connection.emit("readyForQuery", { status: "E" });
        throw Object.assign(new Error("rollback blocked: data rows remain"), { code: "23514" });
      }
      if (sql === "ROLLBACK") {
        client.connectionStatus = "I"; client.connection.emit("readyForQuery", { status: "I" });
      }
      return originalQuery(sql, values);
    };
    return client;
  };
  await expectCode(() => executePlatformSql(["rollback", "--file", entry.rollback.path, "--confirm", entry.rollback.sha256], {
    env: ctx.env, createClient: ctx.createClient, manifest: MANIFEST, repoRoot: ROOT,
  }), (error) => error.message.startsWith("23514:") && error.message.includes("rollback blocked"));
  assert.ok(ctx.calls.includes("ROLLBACK"));
  assert.ok(ctx.calls.includes("SELECT pg_advisory_unlock($1, $2) AS unlocked"));
  const records = fs.readdirSync(ctx.evidence).filter((name) => name.endsWith(".json") && name !== "latest-plan.json" && name !== "apply-prior.json");
  const evidence = JSON.parse(fs.readFileSync(path.join(ctx.evidence, records[0]), "utf8"));
  assert.equal(evidence.result, "failed");
  assert.equal(evidence.redactedError.includes("data rows remain"), true);
});

test("advisory lock contention prevents the apply transaction", async () => {
  const ctx = setup(); const entry = MANIFEST.entries[1];
  withPlan(ctx, entry);
  const calls = [];
  const createClient = async () => ({
    async connect() { calls.push("CONNECT"); }, async end() {},
    async query(sql) {
      calls.push(sql);
      if (String(sql).includes("pg_try_advisory_lock")) return { rows: [{ acquired: false }] };
      return { rows: [] };
    },
  });
  await expectCode(() => executePlatformSql(["apply", "--file", entry.path, "--confirm", entry.sha256], {
    env: ctx.env, createClient, manifest: MANIFEST, repoRoot: ROOT,
  }), "PLATFORM_SQL_ADVISORY_LOCK_UNAVAILABLE");
  assert.equal(calls.some((sql) => sql === "BEGIN" || String(sql).includes("CREATE SCHEMA")), false);
});

test("target preflight rejection is visible and records code, time, and tool SHA before connect", async () => {
  const ctx = setup();
  ctx.env.LANE_B_DATABASE_URL = databaseUrl.replace(":5432/", ":6543/");
  await expectCode(() => executePlatformSql(["plan"], { env: ctx.env, createClient: ctx.createClient, manifest: MANIFEST, repoRoot: ROOT }), "DATABASE_HOST_MISMATCH");
  assert.equal(ctx.clientCreates, 0);
  const records = fs.readdirSync(ctx.evidence).filter((name) => name.endsWith(".json"));
  const rejection = JSON.parse(fs.readFileSync(path.join(ctx.evidence, records[0]), "utf8"));
  assert.equal(rejection.code, "DATABASE_HOST_MISMATCH");
  assert.ok(rejection.at);
  assert.equal(rejection.toolGitSha, requireGitHead());
});
