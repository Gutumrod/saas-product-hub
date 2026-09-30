// Source-only A9 proof. Every real connection is hard-coded to loopback.
// A fresh cluster is required; this creates database lab and never drops a database.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { executePlatformSql } from '../apply-platform-sql.mjs';
import { snapshot, diffLines } from './catalog-snapshot.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../../..');
const argv = process.argv.slice(2);
const values = {};
assert.equal(argv.length, 6, 'usage: --booking-root <absolute> --port <local-port> --evidence <absolute>');
for (let i = 0; i < argv.length; i += 2) {
  assert.ok(['--booking-root', '--port', '--evidence'].includes(argv[i]));
  assert.equal(values[argv[i]], undefined); values[argv[i]] = argv[i + 1];
}
const BOOKING = values['--booking-root'];
const PORT = Number(values['--port']);
const OUT = values['--evidence'];
assert.ok(path.isAbsolute(BOOKING) && path.isAbsolute(OUT));
assert.ok(Number.isInteger(PORT) && PORT > 1024 && PORT < 65536);
assert.equal(execFileSync('git', ['-C', BOOKING, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  '32df434e1057a83ecbf0c290a659be42f24bbc55');
assert.ok(!fs.existsSync(path.join(OUT, 'roundtrip.json')), 'evidence must be a fresh destination');
fs.mkdirSync(OUT, { recursive: true });
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/shared-runtime/platform-sql/manifest.json')));
const role = manifest.entries.find(e => e.id === 'bk01-runtime-role');
const bootstrap = manifest.entries.find(e => e.id === 'bk01-platform-bootstrap');
assert.ok(role && bootstrap && role.order < bootstrap.order);
const forward = fs.readFileSync(path.join(ROOT, role.path), 'utf8');
const rollback = fs.readFileSync(path.join(ROOT, role.rollback.path), 'utf8');
assert.equal(hash(forward), role.sha256); assert.equal(hash(rollback), role.rollback.sha256);
const createClient = async () => new pg.Client({ host: '127.0.0.1', port: PORT,
  user: 'postgres', database: 'lab', statement_timeout: 25000, application_name: 'bk01-a9-local-proof' });
const env = {
  LANE_B_PROJECT_REF: 'ykxlqnshaaxmzzocpjlj',
  // Validator-only fake URI; the client factory never connects to this host.
  LANE_B_DATABASE_URL: 'postgresql://postgres.ykxlqnshaaxmzzocpjlj:offline-test-password@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=verify-full',
  BK01_REPO_ROOT: BOOKING, PLATFORM_SQL_EVIDENCE_DIR: path.join(OUT, 'platform-sql'),
};
let checks = 0;
const check = (label, condition) => { assert.ok(condition, label); checks++; console.log(`ok ${checks}: ${label}`); };
const run = async args => {
  const output = [];
  await executePlatformSql(args, { env, createClient, stdout: value => output.push(value) });
  return output[0];
};
const apply = entry => run(['apply', '--file', entry.path, '--confirm', entry.sha256]);
const reverse = entry => run(['rollback', '--file', entry.rollback.path, '--confirm', entry.rollback.sha256]);
const rawSnapshot = async () => {
  const previous = process.env.SNAP_RAW;
  try { process.env.SNAP_RAW = '1'; return await snapshot(PORT, 'lab'); }
  finally { if (previous === undefined) delete process.env.SNAP_RAW; else process.env.SNAP_RAW = previous; }
};
const postgres = new pg.Client({ host: '127.0.0.1', port: PORT, user: 'postgres', database: 'postgres' });
let admin;
try {
  await postgres.connect();
  await postgres.query('CREATE DATABASE lab'); await postgres.end();
  admin = await createClient(); await admin.connect();
  await admin.query(fs.readFileSync(path.join(HERE, 'scaffold.sql'), 'utf8'));
  await admin.end(); admin = await createClient(); await admin.connect();
  const migrations = fs.readdirSync(path.join(BOOKING, 'supabase/migrations')).filter(x => x.endsWith('.sql')).sort();
  check('real frozen legacy chain has 30 migrations', migrations.length === 30);
  for (const file of migrations) await admin.query(fs.readFileSync(path.join(BOOKING, 'supabase/migrations', file), 'utf8'));
  await admin.query(fs.readFileSync(path.join(ROOT, 'docs/platform/shared-runtime/migrations/h3c_auth_runtime_token_support.sql'), 'utf8'));
  const baseline = await snapshot(PORT, 'lab');
  const rawBaseline = await rawSnapshot();
  const baselineProbe = async () => (await admin.query("SELECT local_service.is_platform_admin() AS platform_admin, local_service.is_shop_member('00000000-0000-0000-0000-000000000001') AS shop_member")).rows[0];
  const beforeProbe = await baselineProbe();
  check('baseline has no BK01 role', (await admin.query("SELECT count(*)::int AS n FROM pg_roles WHERE rolname LIKE 'bk01_%'")).rows[0].n === 0);
  // The former failure is reproduced with the immutable bootstrap on local PG.
  await admin.query('BEGIN');
  await assert.rejects(() => admin.query(fs.readFileSync(path.join(BOOKING, bootstrap.path), 'utf8')),
    error => error.code === 'P0001' && error.message.includes('bk01_runtime (NOLOGIN Data API runtime role) is required'));
  await admin.query('ROLLBACK'); checks++; console.log(`ok ${checks}: frozen bootstrap fails before prerequisite (actual PostgreSQL guard)`);
  const initial = await run(['plan']);
  check('22 relation / 61 function baseline plans role before bootstrap', initial.localServiceBaseline.relations === 22
    && initial.localServiceBaseline.functions === 61 && initial.next.file === role.path);
  await apply(role);
  const attrs = (await admin.query("SELECT rolsuper,rolinherit,rolcreaterole,rolcreatedb,rolcanlogin,rolreplication,rolbypassrls,rolconfig,shobj_description(oid,'pg_authid') AS comment FROM pg_roles WHERE rolname='bk01_runtime'")).rows[0];
  check('new role has all seven non-privileged/NOLOGIN attributes', ['rolsuper','rolinherit','rolcreaterole','rolcreatedb','rolcanlogin','rolreplication','rolbypassrls'].every(key => attrs[key] === false));
  check('new role has 8s statement/lock timeout and boundary comment',
    JSON.stringify([...attrs.rolconfig].sort()) === JSON.stringify(['lock_timeout=8s','statement_timeout=8s']) && attrs.comment.includes('NOLOGIN BK01 Data API'));
  check('new role has no direct ACL/ownership or memberships',
    (await admin.query("SELECT (SELECT count(*) FROM pg_shdepend WHERE refclassid='pg_authid'::regclass AND refobjid=(SELECT oid FROM pg_roles WHERE rolname='bk01_runtime')) + (SELECT count(*) FROM pg_auth_members WHERE roleid=(SELECT oid FROM pg_roles WHERE rolname='bk01_runtime') OR member=(SELECT oid FROM pg_roles WHERE rolname='bk01_runtime')) AS n")).rows[0].n === '0');
  await admin.query('BEGIN');
  await assert.rejects(() => admin.query(forward), error => error.code === 'P0001' && error.message === 'bk01_runtime already exists');
  await admin.query('ROLLBACK'); checks++; console.log(`ok ${checks}: duplicate role creation refuses safely`);
  // Exercise the actual SQL guards using transaction-local synthetic fixtures.
  const guard = async (label, setupSql, source, message) => {
    await admin.query('BEGIN');
    try {
      await admin.query(setupSql);
      await assert.rejects(() => admin.query(source), error => error.code === 'P0001' && error.message.includes(message));
      check(label, true);
    } finally { await admin.query('ROLLBACK'); }
  };
  await guard('non-platform forward guard rejects', 'SET LOCAL ROLE anon', forward, 'requires platform postgres session');
  await guard('non-platform rollback guard rejects', 'SET LOCAL ROLE anon', rollback, 'requires platform postgres session');
  await guard('rollback refuses an owned schema', 'CREATE SCHEMA a9_owned AUTHORIZATION bk01_runtime', rollback, 'ownership or privileges/dependencies remain');
  await guard('rollback refuses an owned relation', 'CREATE TABLE public.a9_owned(id integer); ALTER TABLE public.a9_owned OWNER TO bk01_runtime', rollback, 'ownership or privileges/dependencies remain');
  await guard('rollback refuses a direct relation grant', 'GRANT SELECT ON ps01.runtime_boundary_probe TO bk01_runtime', rollback, 'ownership or privileges/dependencies remain');
  await guard('rollback refuses a schema grant', 'GRANT USAGE ON SCHEMA ps01 TO bk01_runtime', rollback, 'ownership or privileges/dependencies remain');
  await guard('rollback refuses direct database privileges', 'GRANT CREATE ON DATABASE lab TO bk01_runtime', rollback, 'ownership or privileges/dependencies remain');
  await guard('rollback refuses default privileges', 'ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT SELECT ON TABLES TO bk01_runtime', rollback, 'ownership or privileges/dependencies remain');
  await guard('rollback refuses being a member of another role', 'GRANT anon TO bk01_runtime', rollback, 'role memberships remain');
  await guard('rollback refuses inbound membership', 'GRANT bk01_runtime TO authenticator WITH INHERIT FALSE, SET TRUE', rollback, 'role memberships remain');
  check('plan after role creation selects unchanged bootstrap', (await run(['plan'])).next.file === bootstrap.path);
  await apply(bootstrap);
  check('frozen bootstrap commits after role prerequisite', (await admin.query("SELECT to_regclass('local_service_internal.schema_migrations') IS NOT NULL AS ready")).rows[0].ready);
  await run(['plan']);
  await assert.rejects(() => reverse(role), { message: 'PLAN_ORDER_OR_STALENESS_REJECTED' });
  check('tool refuses role rollback ahead of bootstrap', true);
  await reverse(bootstrap);
  const afterBootstrap = await run(['plan']);
  check('bootstrap rollback leaves runtime role to reverse last', afterBootstrap.next.file === bootstrap.path && afterBootstrap.rollback.file === role.rollback.path);
  await reverse(role);
  const final = await snapshot(PORT, 'lab');
  const rawFinal = await rawSnapshot();
  const delta = diffLines(baseline, final);
  check('role -> bootstrap -> reverse bootstrap -> reverse role restores baseline', delta.onlyBefore.length === 0 && delta.onlyAfter.length === 0);
  check('is_platform_admin/is_shop_member results equal baseline', JSON.stringify(await baselineProbe()) === JSON.stringify(beforeProbe));
  check('no BK01 roles remain', (await admin.query("SELECT count(*)::int AS n FROM pg_roles WHERE rolname LIKE 'bk01_%'")).rows[0].n === 0);
  check('no idle transaction remains', (await admin.query("SELECT count(*)::int AS n FROM pg_stat_activity WHERE datname='lab' AND pid<>pg_backend_pid() AND state LIKE 'idle in transaction%'")).rows[0].n === 0);
  const end = await run(['plan']);
  check('final plan returns to prerequisite and no rollback history remains', end.next.file === role.path && end.rollback === null);
  const result = { result: 'LOCAL_POSTGRES_ROUNDTRIP_PASS', checks, at: new Date().toISOString(),
    server_version: (await admin.query('SHOW server_version')).rows[0].server_version,
    tool_git_sha: execFileSync('git', ['-C', ROOT, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    role_sha256: role.sha256, rollback_sha256: role.rollback.sha256,
    bootstrap_sha256: bootstrap.sha256, bootstrap_rollback_sha256: bootstrap.rollback.sha256,
    baseline_lines: baseline.length, final_lines: final.length, delta,
    raw_delta: diffLines(rawBaseline, rawFinal),
    snapshot_normalization: 'only PostgreSQL default database/schema/relation ACL materialization (A7)',
    normalized_acl_lines: final.normalized, role_attributes: attrs, loopback_only: true,
    input_sha256: { scaffold: hash(fs.readFileSync(path.join(HERE, 'scaffold.sql'))),
      snapshot: hash(fs.readFileSync(path.join(HERE, 'catalog-snapshot.mjs'))) } };
  fs.writeFileSync(path.join(OUT, 'roundtrip.json'), JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
  fs.writeFileSync(path.join(OUT, 'snapshot-before.txt'), baseline.join('\n') + '\n', { flag: 'wx' });
  fs.writeFileSync(path.join(OUT, 'snapshot-after.txt'), final.join('\n') + '\n', { flag: 'wx' });
  fs.writeFileSync(path.join(OUT, 'snapshot-before-raw.txt'), rawBaseline.join('\n') + '\n', { flag: 'wx' });
  fs.writeFileSync(path.join(OUT, 'snapshot-after-raw.txt'), rawFinal.join('\n') + '\n', { flag: 'wx' });
  console.log(JSON.stringify({ result: result.result, checks, delta: 0 }));
} finally {
  await Promise.allSettled([admin?.end(), postgres.end()]);
}
