import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const migration = fs.readFileSync(path.join(root, 'docs/platform/shared-runtime/storage/house_storage_upload_grants.sql'), 'utf8');
const rollback = fs.readFileSync(path.join(root, 'docs/platform/shared-runtime/storage/house_storage_upload_grants_rollback.sql'), 'utf8');
const output = process.env.STORAGE_PROOF_OUTPUT;
if (!output || path.resolve(output).startsWith(`${root}${path.sep}`)) {
  throw new Error('Set STORAGE_PROOF_OUTPUT to a runtime evidence path outside the worktree');
}
const db = new PGlite();
const results = [];
const exec = async (sql) => db.exec(sql);
const query = async (sql) => (await db.query(sql)).rows;
const pass = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const rejected = async (sql) => {
  try { await exec(sql); return false; } catch { await exec('ROLLBACK;'); return true; }
};

await exec(`CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN;
CREATE ROLE bk01_runtime NOLOGIN; CREATE ROLE other_runtime NOLOGIN;
CREATE SCHEMA wstera_platform_internal; CREATE SCHEMA storage;
CREATE TABLE storage.objects (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), bucket_id text NOT NULL,
  name text NOT NULL, metadata jsonb NOT NULL, UNIQUE(bucket_id,name));
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects FORCE ROW LEVEL SECURITY;
GRANT INSERT ON storage.objects TO bk01_runtime;
GRANT USAGE ON SCHEMA storage TO bk01_runtime;
`);
let migrationError = null;
try { await exec(migration); } catch (error) { migrationError = String(error.message); }
pass('House grant SQL applies to isolated Storage/Postgres stand-in', migrationError === null, migrationError ?? 'source SQL applied');
if (migrationError) { await db.close(); process.exit(1); }

await exec(`SET ROLE bk01_runtime; SELECT set_config('request.jwt.claim.role','bk01_runtime',false);
SELECT wstera_platform_internal.register_bk01_storage_upload_grant(
  '11111111-1111-4111-8111-111111111111/22222222-2222-4222-8222-222222222222.jpg',
  repeat('a',64),'image/jpeg',1234,statement_timestamp()+interval '5 minutes');`);
let goodUploadError = null;
try { await exec(`INSERT INTO storage.objects(bucket_id,name,metadata) VALUES
  ('deposit-slips','11111111-1111-4111-8111-111111111111/22222222-2222-4222-8222-222222222222.jpg',
   '{"mimetype":"image/jpeg","size":"1234"}'::jsonb);`); }
catch (error) { goodUploadError = String(error.message); await exec('ROLLBACK; RESET ROLE;'); }
if (!goodUploadError) await exec('RESET ROLE;');
pass('valid exact path/MIME/size consumes one grant and inserts object', goodUploadError === null,
  goodUploadError ?? 'one object, one consumed grant');

const reusedDenied = await rejected(`SET ROLE bk01_runtime;
SELECT set_config('request.jwt.claim.role','bk01_runtime',false);
INSERT INTO storage.objects(bucket_id,name,metadata) VALUES
  ('deposit-slips','11111111-1111-4111-8111-111111111111/22222222-2222-4222-8222-222222222222.jpg',
   '{"mimetype":"image/jpeg","size":"1234"}'::jsonb);`);
pass('second upload with consumed path is rejected', reusedDenied);
await exec('RESET ROLE;');

await exec(`SELECT wstera_platform_internal.register_bk01_storage_upload_grant(
  '11111111-1111-4111-8111-111111111111/33333333-3333-4333-8333-333333333333.png',
  repeat('b',64),'image/png',500,statement_timestamp()+interval '5 minutes');`);
const wrongMetadataDenied = await rejected(`SET ROLE bk01_runtime;
SELECT set_config('request.jwt.claim.role','bk01_runtime',false);
INSERT INTO storage.objects(bucket_id,name,metadata) VALUES
  ('deposit-slips','11111111-1111-4111-8111-111111111111/33333333-3333-4333-8333-333333333333.png',
   '{"mimetype":"image/jpeg","size":"500"}'::jsonb);`);
pass('MIME mismatch is rejected and grant consume rolls back', wrongMetadataDenied);
await exec('RESET ROLE;');
const wrongSizeDenied = await rejected(`SET ROLE bk01_runtime;
SELECT set_config('request.jwt.claim.role','bk01_runtime',false);
INSERT INTO storage.objects(bucket_id,name,metadata) VALUES
  ('deposit-slips','11111111-1111-4111-8111-111111111111/33333333-3333-4333-8333-333333333333.png',
   '{"mimetype":"image/png","size":"5242881"}'::jsonb);`);
pass('oversize object is rejected and grant consume rolls back', wrongSizeDenied);
await exec('RESET ROLE;');

await exec(`SELECT wstera_platform_internal.register_bk01_storage_upload_grant(
  '11111111-1111-4111-8111-111111111111/44444444-4444-4444-8444-444444444444.webp',
  repeat('c',64),'image/webp',222,statement_timestamp()+interval '5 minutes');
UPDATE wstera_platform_internal.storage_upload_grants SET expires_at=statement_timestamp()-interval '1 second'
 WHERE object_path LIKE '%44444444%';`);
const expiredDenied = await rejected(`SET ROLE bk01_runtime;
SELECT set_config('request.jwt.claim.role','bk01_runtime',false);
INSERT INTO storage.objects(bucket_id,name,metadata) VALUES
  ('deposit-slips','11111111-1111-4111-8111-111111111111/44444444-4444-4444-8444-444444444444.webp',
   '{"mimetype":"image/webp","size":"222"}'::jsonb);`);
pass('expired grant is rejected', expiredDenied);
await exec('RESET ROLE;');

await exec(`SELECT wstera_platform_internal.register_bk01_storage_upload_grant(
  '11111111-1111-4111-8111-111111111111/55555555-5555-4555-8555-555555555555.jpg',
  repeat('d',64),'image/jpeg',90,statement_timestamp()+interval '5 minutes');`);
const otherProductDenied = await rejected(`SET ROLE other_runtime;
SELECT set_config('request.jwt.claim.role','other_runtime',false);
INSERT INTO storage.objects(bucket_id,name,metadata) VALUES
  ('deposit-slips','11111111-1111-4111-8111-111111111111/55555555-5555-4555-8555-555555555555.jpg',
   '{"mimetype":"image/jpeg","size":"90"}'::jsonb);`);
pass('other product role cannot use BK01 grant', otherProductDenied);
await exec('RESET ROLE;');

const counts = (await query(`SELECT (SELECT count(*)::int FROM storage.objects) AS objects,
  (SELECT count(*)::int FROM wstera_platform_internal.storage_upload_grants WHERE consumed_at IS NOT NULL) AS consumed`))[0];
pass('invalid attempts did not consume any unaccepted grant', counts.objects === 1 && counts.consumed === 1,
  JSON.stringify(counts));
const rollbackDenied = await rejected(rollback);
pass('rollback refuses while one-time grant rows remain', rollbackDenied);
await exec('RESET ROLE; DELETE FROM wstera_platform_internal.storage_upload_grants;');
await exec(rollback);
const rollbackObjects = (await query(`SELECT
  to_regclass('wstera_platform_internal.storage_upload_grants') IS NULL AS table_gone,
  to_regprocedure('wstera_platform_internal.register_bk01_storage_upload_grant(text,text,text,bigint,timestamptz)') IS NULL AS register_gone,
  NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='wstera_consume_bk01_storage_upload_grant' AND NOT tgisinternal) AS trigger_gone,
  NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='bk01_deposit_slip_grant_insert') AS policy_gone,
  NOT has_schema_privilege('bk01_runtime','wstera_platform_internal','USAGE') AS schema_usage_revoked`))[0];
pass('empty storage grant source rolls back only its owned objects and grant',
  rollbackObjects.table_gone && rollbackObjects.register_gone && rollbackObjects.trigger_gone
    && rollbackObjects.policy_gone && rollbackObjects.schema_usage_revoked,
  JSON.stringify(rollbackObjects));

const proof = { generated_at: new Date().toISOString(), engine: 'PGlite embedded Postgres',
  limits: ['does not emulate Supabase Storage signed URL issuance or token expiry',
    'does not establish hosted Storage metadata field timing/values', 'not a live LAB proof'], results };
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(proof, null, 2) + '\n');
await db.close();
if (results.some((result) => !result.ok)) process.exit(1);
