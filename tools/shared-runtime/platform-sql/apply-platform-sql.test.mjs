import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
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

function setup() {
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
        if (sql.includes("SELECT to_regclass('local_service_internal.schema_migrations')")) return { rows: [{ ledger_exists: true, local_relations: 22, local_functions: 61 }] };
        if (sql.includes("runtime_issuer_clients")) return { rows: [{ a: false, b: false, c: false, d: false }] };
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
  fs.writeFileSync(path.join(ctx.evidence, "latest-plan.json"), JSON.stringify({
    createdAt: new Date().toISOString(), projectRef, toolGitSha: "", next: nextEntry && { file: nextEntry.path, sha256: nextEntry.sha256 },
    state: { "bk01-platform-bootstrap": true, "house-runtime-issuer": false, "h3c-runtime-role-allowlist-expansion": false, "house-storage-upload-grants": false },
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
  assert.equal(JSON.parse(fs.readFileSync(path.join(ctx.evidence, "latest-plan.json"), "utf8")).next.sha256, MANIFEST.entries[1].sha256);
});

test("pinned H3C and storage files with their own transaction are rejected before client creation", async () => {
  const ctx = setup();
  for (const entry of MANIFEST.entries.slice(2)) {
    await expectCode(() => executePlatformSql(["apply", "--file", entry.path, "--confirm", entry.sha256], { env: ctx.env, createClient: ctx.createClient, manifest: MANIFEST, repoRoot: ROOT }), "SQL_TRANSACTION_CONTROL_REJECTED");
  }
  assert.equal(ctx.clientCreates, 0);
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
