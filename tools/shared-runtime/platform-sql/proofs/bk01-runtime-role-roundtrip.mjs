// Source-only A10/A11 proof. Every real connection is hard-coded to loopback.
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
import { rollbackManagedRuntimeRole } from '../bk01-runtime-membership.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../../..');
const argv = process.argv.slice(2);
const values = {};
assert.ok(argv.length === 6 || argv.length === 8,
  'usage: --booking-root <absolute-at-32df434> [--product-root <absolute-A11-branch>] --port <local-port> --evidence <absolute>');
for (let i = 0; i < argv.length; i += 2) {
  assert.ok(['--booking-root', '--product-root', '--port', '--evidence'].includes(argv[i]));
  assert.equal(values[argv[i]], undefined); values[argv[i]] = argv[i + 1];
}
const BOOKING = values['--booking-root'];
const PRODUCT = values['--product-root'] ?? BOOKING;
const PORT = Number(values['--port']);
const OUT = values['--evidence'];
assert.ok(path.isAbsolute(BOOKING) && path.isAbsolute(PRODUCT) && path.isAbsolute(OUT));
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
  user: 'postgres', database: 'lab', statement_timeout: 25000, application_name: 'bk01-a10-local-proof' });
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
const postgres = new pg.Client({ host: '127.0.0.1', port: PORT, user: 'supabase_admin', database: 'postgres' });
const supervisor = new pg.Client({ host: '127.0.0.1', port: PORT, user: 'supabase_admin', database: 'lab' });
let admin;
try {
  await postgres.connect();
  const version = Number((await postgres.query('SHOW server_version_num')).rows[0].server_version_num);
  assert.ok(version >= 170000 && version < 180000, 'A10 requires PostgreSQL 17');
  // Only fixture preparation uses a superuser. Every tool connection below
  // authenticates as postgres after this role is demoted.
  await postgres.query('CREATE ROLE postgres LOGIN SUPERUSER CREATEDB CREATEROLE BYPASSRLS');
  await postgres.query('CREATE DATABASE lab OWNER postgres'); await postgres.end();
  admin = await createClient(); await admin.connect();
  await admin.query(fs.readFileSync(path.join(HERE, 'scaffold.sql'), 'utf8'));
  await admin.end(); admin = await createClient(); await admin.connect();
  const migrations = fs.readdirSync(path.join(PRODUCT, 'supabase/migrations')).filter(x => x.endsWith('.sql')).sort();
  check('real frozen legacy chain has 30 migrations', migrations.length === 30);
  for (const file of migrations) await admin.query(fs.readFileSync(path.join(PRODUCT, 'supabase/migrations', file), 'utf8'));
  await admin.query(fs.readFileSync(path.join(ROOT, 'docs/platform/shared-runtime/migrations/h3c_auth_runtime_token_support.sql'), 'utf8'));
  await supervisor.connect();
  await supervisor.query('ALTER ROLE postgres NOSUPERUSER');
  await supervisor.query('GRANT anon TO postgres WITH INHERIT FALSE, SET TRUE');
  const actor = (await admin.query("SELECT current_user,session_user,rolsuper,rolcreaterole,rolbypassrls FROM pg_roles WHERE rolname=current_user")).rows[0];
  check('actual tool actor postgres is non-superuser with CREATEROLE and BYPASSRLS on PostgreSQL 17',
    actor.current_user === 'postgres' && actor.session_user === 'postgres' && actor.rolsuper === false
      && actor.rolcreaterole === true && actor.rolbypassrls === true);
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
  check('new role has no direct ACL/ownership dependencies',
    (await admin.query("SELECT count(*)::int AS n FROM pg_shdepend WHERE refclassid='pg_authid'::regclass AND refobjid=(SELECT oid FROM pg_roles WHERE rolname='bk01_runtime')")).rows[0].n === 0);
  const memberships = (await admin.query("SELECT member.rolname AS member,grantor.rolname AS grantor,m.admin_option,m.inherit_option,m.set_option FROM pg_auth_members m JOIN pg_roles parent ON parent.oid=m.roleid JOIN pg_roles member ON member.oid=m.member JOIN pg_roles grantor ON grantor.oid=m.grantor WHERE parent.rolname='bk01_runtime' ORDER BY member.rolname,grantor.rolname")).rows;
  assert.deepEqual(memberships,[{member:'postgres',grantor:'supabase_admin',admin_option:true,inherit_option:false,set_option:false}]);
  check('PostgreSQL creates the exact creator ADMIN row automatically',true);
  const recoveryOutput = [];
  await executePlatformSql(['plan'], {env:{...env, PLATFORM_SQL_EVIDENCE_DIR:path.join(OUT,'recovery-platform-sql')},
    createClient,stdout:value=>recoveryOutput.push(value)});
  const recovery = recoveryOutput[0];
  check('fresh recovery evidence recognizes managed role as applied and next is bootstrap without authorizing its rollback',
    recovery.entries[0].applied && recovery.next.file === bootstrap.path && recovery.rollback === null);
  await admin.query('BEGIN');
  await assert.rejects(() => admin.query(forward), error => error.code === 'P0001' && error.message === 'bk01_runtime already exists');
  await admin.query('ROLLBACK'); checks++; console.log(`ok ${checks}: duplicate role creation refuses safely`);
  // Exercise the actual SQL guards using transaction-local synthetic fixtures.
  const guard = async (label, setupSql, source, message) => {
    await supervisor.query('BEGIN');
    try {
      await supervisor.query(setupSql);
      await supervisor.query('SET LOCAL ROLE postgres');
      await assert.rejects(() => source === rollback ? rollbackManagedRuntimeRole(supervisor) : supervisor.query(source),
        error => error.code === 'P0001' && error.message.includes(message));
      check(label, true);
    } finally { await supervisor.query('ROLLBACK'); }
  };
  await admin.query('BEGIN'); await admin.query('SET LOCAL ROLE anon');
  await assert.rejects(()=>admin.query(forward),error=>error.code==='P0001' && error.message.includes('requires platform postgres session'));
  await admin.query('ROLLBACK'); check('non-platform forward guard rejects',true);
  await admin.query('BEGIN'); await admin.query('SET LOCAL ROLE anon');
  await assert.rejects(()=>rollbackManagedRuntimeRole(admin),error=>error.code==='P0001' && error.message.includes('requires platform postgres session'));
  await admin.query('ROLLBACK'); check('non-platform tool rollback guard rejects',true);
  await guard('rollback refuses an owned schema', 'CREATE SCHEMA a9_owned AUTHORIZATION bk01_runtime', rollback, 'ownership or privileges/dependencies remain');
  await guard('rollback refuses an owned relation', 'CREATE TABLE public.a9_owned(id integer); ALTER TABLE public.a9_owned OWNER TO bk01_runtime', rollback, 'ownership or privileges/dependencies remain');
  await guard('rollback refuses a direct relation grant', 'GRANT SELECT ON ps01.runtime_boundary_probe TO bk01_runtime', rollback, 'ownership or privileges/dependencies remain');
  await guard('rollback refuses a schema grant', 'GRANT USAGE ON SCHEMA ps01 TO bk01_runtime', rollback, 'ownership or privileges/dependencies remain');
  await guard('rollback refuses direct database privileges', 'GRANT CREATE ON DATABASE lab TO bk01_runtime', rollback, 'ownership or privileges/dependencies remain');
  await guard('rollback refuses default privileges', 'ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT SELECT ON TABLES TO bk01_runtime', rollback, 'ownership or privileges/dependencies remain');
  await guard('rollback refuses being a member of another role', 'GRANT anon TO bk01_runtime', rollback, 'unexpected role memberships');
  await guard('rollback refuses inbound membership', 'GRANT bk01_runtime TO authenticator WITH INHERIT FALSE, SET TRUE', rollback, 'unexpected role memberships');
  check('plan after role creation selects unchanged bootstrap', (await run(['plan'])).next.file === bootstrap.path);
  await apply(bootstrap);
  check('frozen bootstrap commits after role prerequisite', (await admin.query("SELECT to_regclass('local_service_internal.schema_migrations') IS NOT NULL AS ready")).rows[0].ready);
  check('bk01_migrator has no USAGE on extensions and PUBLIC has no USAGE',
    !(await admin.query("SELECT has_schema_privilege('bk01_migrator','extensions','USAGE') AS migrator, EXISTS (SELECT 1 FROM aclexplode(n.nspacl) acl WHERE acl.grantee=0 AND acl.privilege_type='USAGE') AS public FROM pg_namespace n WHERE n.nspname='extensions'")).rows[0].migrator
    && !(await admin.query("SELECT EXISTS (SELECT 1 FROM aclexplode(n.nspacl) acl WHERE acl.grantee=0 AND acl.privilege_type='USAGE') AS public FROM pg_namespace n WHERE n.nspname='extensions'")).rows[0].public);
  if (PRODUCT !== BOOKING) {
    for (const id of ['house-runtime-issuer', 'h3c-runtime-role-allowlist-expansion', 'house-storage-upload-grants']) {
      const entry = manifest.entries.find(item => item.id === id);
      assert.ok(entry, `missing manifest prerequisite ${id}`);
      const current = await run(['plan']);
      assert.equal(current.next.file, entry.path, `platform plan must select ${id}`);
      await apply(entry);
      check(`platform prerequisite ${id} applies before BK01 upload integration`, true);
    }
    const runnerEnv = { ...process.env,
      BK01_PLATFORM_DATABASE_URL: `postgresql://postgres@127.0.0.1:${PORT}/lab`,
      BK01_SHARED_RUNTIME_ENV: 'local', BK01_RELEASE_ID: 'A11-local-roundtrip',
      BK01_REPO_ROOT: undefined, PGOPTIONS: undefined };
    delete runnerEnv.BK01_REPO_ROOT;
    delete runnerEnv.PGOPTIONS;
    const runner = path.join(PRODUCT, 'scripts/bk01-migrate.mjs');
    const productMigrations = fs.readdirSync(path.join(PRODUCT, 'supabase/bk01-migrations'))
      .filter(name => name.endsWith('.sql')).sort();
    check('A11 BK01 stream contains five timestamp-ordered migrations', productMigrations.length === 5
      && productMigrations.at(-1) === '20260930120000_bk01_link_token_no_extensions.sql');
    let generateLinkTokenBefore = null;
    for (const filename of productMigrations) {
      const args = [runner, 'plan', '--through', filename];
      const planText = execFileSync(process.execPath, args, { cwd: PRODUCT, env: runnerEnv, encoding: 'utf8' });
      assert.ok(planText.includes(filename), `runner plan did not select ${filename}`);
      execFileSync(process.execPath, [runner, 'apply', '--through', filename],
        { cwd: PRODUCT, env: runnerEnv, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
      const ledger = await admin.query('SELECT filename FROM local_service_internal.schema_migrations ORDER BY filename');
      check(`actual BK01 runner applies ${filename} as a separate interval`, ledger.rows.at(-1)?.filename === filename);
      if (filename === '20260928120000_bk01_house_upload_grants.sql') {
        generateLinkTokenBefore = (await admin.query(`SELECT pg_get_userbyid(p.proowner) AS owner, coalesce(p.proacl::text,'<default>') AS acl
          FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
          WHERE n.nspname='local_service' AND p.proname='generate_link_token' AND pg_get_function_identity_arguments(p.oid)=''`)).rows[0];
      }
    }
    execFileSync(process.execPath, [runner, 'apply'],
      { cwd: PRODUCT, env: runnerEnv, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    check('second actual BK01 runner apply is a no-op with all five checksums in the ledger',
      (await admin.query('SELECT count(*)::int AS n FROM local_service_internal.schema_migrations')).rows[0].n === 5);
    const acl = await admin.query(`SELECT pg_get_userbyid(p.proowner) AS owner, coalesce(p.proacl::text,'<default>') AS acl
      FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
      WHERE n.nspname='local_service' AND p.proname='generate_link_token' AND pg_get_function_identity_arguments(p.oid)=''`);
    check('generate_link_token is callable and returns distinct ten-character uppercase hex tokens',
      (await admin.query(`SELECT bool_and(token ~ '^[0-9A-F]{10}$') AS valid, count(DISTINCT token)=64 AS unique
        FROM (SELECT local_service.generate_link_token() AS token FROM generate_series(1,64)) tokens`)).rows[0].valid
      && (await admin.query(`SELECT count(DISTINCT token)=64 AS unique FROM
        (SELECT local_service.generate_link_token() AS token FROM generate_series(1,64)) tokens`)).rows[0].unique);
    check('migration 5 preserves generate_link_token owner and exact ACL',
      Boolean(generateLinkTokenBefore) && generateLinkTokenBefore.owner === acl.rows[0]?.owner
        && generateLinkTokenBefore.acl === acl.rows[0]?.acl);
    await admin.query(`
      INSERT INTO local_service.shops(id,name,slug,line_oa_id,require_deposit,default_deposit_amount)
      VALUES ('10000000-0000-4000-8000-000000000001','A11 Proof Shop','a11-proof-shop','@a11-proof',true,50),
             ('10000000-0000-4000-8000-000000000002','A11 Trial Shop','a11-trial-shop',NULL,false,0);
      INSERT INTO local_service.services(id,shop_id,name,duration_minutes,price,deposit_amount,is_active)
      VALUES ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Proof Service',30,100,50,true),
             ('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','Trial Service',30,100,NULL,true);
      INSERT INTO local_service.staff(id,shop_id,name,is_active)
      VALUES ('30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Proof Staff',true),
             ('30000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','Trial Staff',true);
      INSERT INTO local_service.staff_schedules(shop_id,staff_id,day_of_week,is_working_day,work_start,work_end,break_start,break_end)
      SELECT shop_id,id,extract(dow from current_date+14)::int,true,'00:00','23:59',NULL,NULL
        FROM local_service.staff WHERE id IN ('30000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002')
    `);
    const depositBooking = (await admin.query(`SELECT local_service.create_booking_hold(
      '10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001',
      'A11 Customer','0812345678',NULL,current_date+14,'09:00',NULL) AS booking`)).rows[0].booking;
    const trialBooking = (await admin.query(`SELECT local_service.create_booking_hold(
      '10000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000002',
      'A11 Trial Customer','0812345679',NULL,current_date+14,'09:00',NULL) AS booking`)).rows[0].booking;
    check('actual create_booking_hold executes legacy token caller on both deposit and trial paths',
      depositBooking.status === 'hold' && trialBooking.status === 'confirmed'
        && /^[0-9A-F]{10}$/.test(depositBooking.link_token) && /^[0-9A-F]{10}$/.test(trialBooking.link_token));
    const normalBind = await admin.query(`SELECT claimed FROM local_service.bk01_line_bind_booking(
      'a11-proof-normal','${depositBooking.booking_code}','${depositBooking.link_token}',
      '10000000-0000-4000-8000-000000000001','U11111111111111111111111111111111')`);
    check('bk01_line_bind_booking executes with the replacement pg_catalog lease generator', normalBind.rows[0].claimed);
    const trialBind = await admin.query(`SELECT claimed FROM local_service.bk01_line_bind_booking_trial(
      'a11-proof-trial','${trialBooking.booking_code}','${trialBooking.link_token}',
      'U22222222222222222222222222222222')`);
    check('bk01_line_bind_booking_trial executes with the replacement pg_catalog lease generator', trialBind.rows[0].claimed);
    await admin.query('BEGIN');
    let uploadHashMatches = false;
    try {
      await admin.query("SELECT set_config('request.jwt.claim.role','bk01_runtime',true)");
      const upload = await admin.query(`SELECT * FROM local_service.authorize_deposit_slip_upload(
        '${depositBooking.booking_id}','${depositBooking.link_token}','image/png',1024)`);
      const uploadGrant = upload.rows[0];
      uploadHashMatches = /^[0-9a-f]{64}$/.test(uploadGrant.grant_token)
        && (await admin.query(`SELECT
          b.grant_token_hash=encode(pg_catalog.sha256(convert_to($1,'UTF8')),'hex')
          AND h.grant_token_hash=b.grant_token_hash AS valid
          FROM local_service.deposit_slip_upload_grants b
          JOIN wstera_platform_internal.storage_upload_grants h ON h.object_path=b.object_path
          WHERE b.id=$2`, [uploadGrant.grant_token,uploadGrant.grant_id])).rows[0].valid;
      await admin.query('COMMIT');
    } catch (error) {
      await admin.query('ROLLBACK');
      throw error;
    }
    check('authorize_deposit_slip_upload and House registration execute; stored SHA-256 matches both registries', uploadHashMatches);
    check('32-byte upload-token construction remains 64 hex chars and matches pgcrypto SHA-256',
      (await admin.query(`SELECT bool_and(length(token)=64 AND token ~ '^[0-9a-f]{64}$'
          AND encode(pg_catalog.sha256(convert_to(token,'UTF8')),'hex')
              = encode(extensions.digest(convert_to(token,'UTF8'),'sha256'),'hex')) AS valid
        FROM (SELECT encode(pg_catalog.sha256(pg_catalog.uuid_send(pg_catalog.gen_random_uuid())
                    || pg_catalog.uuid_send(pg_catalog.gen_random_uuid())),'hex') AS token
              FROM generate_series(1,64)) samples`)).rows[0].valid);
    check('catalog function reference gate returns no bk01_migrator-owned forbidden schema dependencies',
      (await admin.query(fs.readFileSync(path.join(ROOT, 'tools/shared-runtime/platform-sql/proofs/bk01-no-foreign-schema-refs.sql'), 'utf8')))[0].rows.length === 0);
    const policyParity = [];
    for (const [legacyClaim, claims] of [
      ['00000000-0000-4000-8000-000000000001', ''],
      ['', '{"sub":"00000000-0000-4000-8000-000000000002"}'],
    ]) {
      await admin.query('BEGIN');
      try {
        await admin.query("SELECT set_config('request.jwt.claim.sub',$1,true), set_config('request.jwt.claims',$2,true)", [legacyClaim, claims]);
        policyParity.push((await admin.query(`SELECT COALESCE(
          NULLIF(current_setting('request.jwt.claim.sub',true),''),
          (NULLIF(current_setting('request.jwt.claims',true),'')::jsonb->>'sub'))::uuid = auth.uid() AS equivalent`)).rows[0].equivalent);
      } finally { await admin.query('ROLLBACK'); }
    }
    check('shop_users policy JWT expression is equivalent to auth.uid for legacy and JSON claims', policyParity.every(Boolean));
    check('legacy rollback exceptions link_staff_user and submit_deposit_slip remain postgres-owned',
      (await admin.query(`SELECT count(*)=3 AND bool_and(pg_get_userbyid(p.proowner)='postgres') AS valid
        FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
        WHERE n.nspname='local_service' AND p.proname IN ('link_staff_user','submit_deposit_slip')`)).rows[0].valid);
  }
  if (PRODUCT !== BOOKING) {
    const result = { result: 'LOCAL_PG17_A11_FORWARD_CHAIN_PASS', checks, at: new Date().toISOString(),
      server_version: (await admin.query('SHOW server_version')).rows[0].server_version,
      product_source_head: execFileSync('git', ['-C', PRODUCT, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
      platform_tool_head: execFileSync('git', ['-C', ROOT, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
      migrations: (await admin.query('SELECT filename,source_sha256 FROM local_service_internal.schema_migrations ORDER BY filename')).rows,
      extensions_public_usage: false, bk01_migrator_extensions_usage: false,
      function_execution: { generate_link_token: '64 calls; ten uppercase hex; distinct',
        create_booking_hold: 'executed twice: deposit hold and non-deposit trial booking',
        line_binding: 'normal and trial RPCs returned claimed=true',
        authorize_deposit_slip_upload: 'executed; BK01 + House stored SHA-256 matched',
        upload_token_hash: '64 samples; 64 lowercase hex; pg_catalog.sha256 equals pgcrypto SHA-256',
      },
      loopback_only: true, input_sha256: { scaffold: hash(fs.readFileSync(path.join(HERE, 'scaffold.sql'))),
        foreign_schema_gate: hash(fs.readFileSync(path.join(HERE, 'bk01-no-foreign-schema-refs.sql'))) } };
    fs.writeFileSync(path.join(OUT, 'a11-roundtrip.json'), JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
    console.log(JSON.stringify({ result: result.result, checks, migrations: result.migrations.length }));
  } else {
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
    actor, automatic_memberships: memberships,
    recovery: {role_applied:recovery.entries[0].applied,next:recovery.next,rollback:recovery.rollback},
    role_rollback_execution_policy: 'A10_MANAGED_RUNTIME_ROLE_DROP',
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
  }
} finally {
  await Promise.allSettled([admin?.end(), supervisor.end(), postgres.end()]);
}
