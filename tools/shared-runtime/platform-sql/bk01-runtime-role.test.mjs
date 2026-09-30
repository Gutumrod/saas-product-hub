import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { executePlatformSql } from './apply-platform-sql.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const MANIFEST = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/shared-runtime/platform-sql/manifest.json')));
const ROLE_PATH = 'docs/platform/shared-runtime/migrations/h3_bk01_runtime_role.sql';
const directories = new Set();
process.on('exit', () => { for (const dir of directories) fs.rmSync(dir, { recursive: true, force: true }); });

function fixture({ role = null, bootstrap = false } = {}) {
  const evidence = fs.mkdtempSync(path.join(os.tmpdir(), 'bk01-role-plan-'));
  directories.add(evidence);
  const env = {
    LANE_B_PROJECT_REF: 'ykxlqnshaaxmzzocpjlj',
    LANE_B_DATABASE_URL: 'postgresql://postgres.ykxlqnshaaxmzzocpjlj:offline-test-password@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=verify-full',
    PLATFORM_SQL_EVIDENCE_DIR: evidence,
  };
  const calls = [];
  const createClient = async () => ({
    async connect() {}, async end() {},
    async query(sql) {
      calls.push(sql);
      if (sql.includes("SELECT to_regclass('local_service_internal.schema_migrations')")) {
        return { rows: [{ ledger_exists: bootstrap, local_relations: 22, local_functions: 61,
          bk01_runtime_role_exists: Boolean(role) }] };
      }
      if (sql.includes('AS member_of_other_role')) return { rows: role ? [role] : [] };
      if (sql.includes('runtime_issuer_clients')) return { rows: [{ a: false, b: false, c: false, d: false }] };
      if (sql.includes('runtime_token_grants')) return { rows: [{ constraint_ready: false, function_ready: false }] };
      if (sql.includes('storage_upload_runtime_roles')) return { rows: [{ a: false, b: false, c: false, d: false, e: false }] };
      return { rows: [] };
    },
  });
  return { env, calls, createClient, evidence };
}
const roleState = overrides => ({ rolname: 'bk01_runtime', rolsuper: false, rolinherit: false,
  rolcreaterole: false, rolcreatedb: false, rolcanlogin: false, rolreplication: false, rolbypassrls: false,
  rolconfig: ['statement_timeout=8s', 'lock_timeout=8s'], member_of_other_role: false,
  has_members: false, has_dependencies: false, ...overrides });

test('manifest puts the reviewed runtime role prerequisite before frozen bootstrap', () => {
  const entry = MANIFEST.entries.find(e => e.id === 'bk01-runtime-role');
  assert.ok(entry, 'missing role creation step caused the actual LAB bootstrap failure');
  assert.equal(entry.path, ROLE_PATH);
  assert.ok(entry.order < MANIFEST.entries.find(e => e.id === 'bk01-platform-bootstrap').order);
});

test('LAB-shaped baseline without BK01 roles plans role creation, never bootstrap first', async () => {
  const ctx = fixture(); const outputs = [];
  await executePlatformSql(['plan'], { ...ctx, repoRoot: ROOT, manifest: MANIFEST, stdout: x => outputs.push(x) });
  assert.equal(outputs[0].next?.file, ROLE_PATH);
  assert.ok(ctx.calls.includes('BEGIN READ ONLY'));
  assert.ok(ctx.calls.includes('ROLLBACK'));
});

test('clean runtime role plans frozen bootstrap next', async () => {
  const ctx = fixture({ role: roleState() }); const outputs = [];
  await executePlatformSql(['plan'], { ...ctx, repoRoot: ROOT, manifest: MANIFEST, stdout: x => outputs.push(x) });
  assert.equal(outputs[0].next?.file, 'supabase/shared-runtime/bk01-platform-bootstrap.sql');
  assert.equal(outputs[0].entries[0].applied, true);
});

test('unsafe pre-existing runtime role stops rather than being accepted as a completed prerequisite', async () => {
  for (const override of [{ rolcanlogin: true }, { rolinherit: true }, { rolsuper: true },
    { rolcreaterole: true }, { rolcreatedb: true }, { rolreplication: true }, { rolbypassrls: true },
    { rolconfig: [] }, { member_of_other_role: true }, { has_members: true }, { has_dependencies: true }]) {
    const ctx = fixture({ role: roleState(override) });
    await assert.rejects(() => executePlatformSql(['plan'], { ...ctx, repoRoot: ROOT, manifest: MANIFEST, stdout: () => {} }),
      { message: 'EXISTING_BK01_RUNTIME_ROLE_CONFLICT' });
  }
});

test('bootstrap-owned inbound membership and ACLs do not invalidate the runtime role after bootstrap', async () => {
  const ctx = fixture({ role: roleState({ has_members: true, has_dependencies: true }), bootstrap: true }); const outputs = [];
  await executePlatformSql(['plan'], { ...ctx, repoRoot: ROOT, manifest: MANIFEST, stdout: x => outputs.push(x) });
  assert.equal(outputs[0].next?.file, 'docs/platform/shared-runtime/migrations/house_runtime_issuer.sql');
});
