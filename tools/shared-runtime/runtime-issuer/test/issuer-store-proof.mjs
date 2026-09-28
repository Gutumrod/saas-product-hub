import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../');
const output = process.env.RUNTIME_ISSUER_SQL_PROOF_OUTPUT;
if (!output || path.resolve(output).startsWith(`${root}${path.sep}`)) {
  throw new Error('Set RUNTIME_ISSUER_SQL_PROOF_OUTPUT to an external runtime evidence path');
}
const sqlSource = fs.readFileSync(path.join(root, 'docs/platform/shared-runtime/migrations/house_runtime_issuer.sql'), 'utf8');
const rollbackSource = fs.readFileSync(path.join(root, 'docs/platform/shared-runtime/migrations/house_runtime_issuer_rollback.sql'), 'utf8');
const db = new PGlite();
const results = [];
const pass = (name, ok, detail = '') => { results.push({ name, ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`); };
const query = async (sql) => (await db.query(sql)).rows;

await db.exec(`CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN;
CREATE ROLE wstera_runtime_issuer_login LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
CREATE SCHEMA ps01; CREATE TABLE ps01.private_probe(secret text);`);
let applyError = null;
try { await db.exec(sqlSource); } catch (error) { applyError = String(error.message); }
pass('House issuer schema/function SQL applies in isolation', applyError === null, applyError ?? 'source SQL applied');
if (applyError) { await db.close(); process.exit(1); }

const limits = [];
await db.exec(`SET ROLE wstera_runtime_issuer_login;`);
for (let index = 0; index < 11; index += 1) {
  limits.push((await query(`SELECT * FROM wstera_platform_internal.consume_runtime_issuer_rate_limit(
    'client-a:192.0.2.10',10,60,'2026-09-28T00:00:00Z'::timestamptz)`))[0]);
}
pass('atomic database rate limit allows ten and denies the eleventh attempt',
  limits.slice(0, 10).every((row) => row.allowed) && !limits[10].allowed,
  `allowed=${limits.filter((row) => row.allowed).length}; denied=${limits.filter((row) => !row.allowed).length}`);
let directWriteDenied = false;
try { await db.exec(`INSERT INTO wstera_platform_internal.runtime_issuer_rate_limits(rate_key,window_start,hit_count)
  VALUES ('direct',now(),1)`); } catch { directWriteDenied = true; await db.exec('ROLLBACK;'); }
pass('runtime login cannot bypass the atomic rate-limit function', directWriteDenied);
await db.exec('RESET ROLE;');
const roleGrants = (await query(`SELECT has_schema_privilege('wstera_runtime_issuer_login','ps01','USAGE') AS product_schema_usage,
  has_table_privilege('wstera_runtime_issuer_login','ps01.private_probe','SELECT') AS product_table_select,
  has_table_privilege('wstera_runtime_issuer_login','wstera_platform_internal.runtime_issuer_clients','SELECT') AS client_select,
  has_table_privilege('wstera_runtime_issuer_login','wstera_platform_internal.runtime_issuer_clients','UPDATE') AS client_update,
  has_table_privilege('wstera_runtime_issuer_login','wstera_platform_internal.runtime_issuer_audit','INSERT') AS audit_insert,
  has_table_privilege('wstera_runtime_issuer_login','wstera_platform_internal.runtime_issuer_audit','UPDATE') AS audit_update`))[0];
pass('dedicated login has House-only minimum grants', !roleGrants.product_schema_usage && !roleGrants.product_table_select
  && roleGrants.client_select && !roleGrants.client_update && roleGrants.audit_insert && !roleGrants.audit_update,
  JSON.stringify(roleGrants));
await db.exec(`INSERT INTO wstera_platform_internal.runtime_issuer_clients
  (client_id,product_code,project_ref,auth_user_id,runtime_role,secret_salt,secret_hash,expires_at)
  VALUES ('client-a','bk01','abcdefghijklmnopqrst','00000000-0000-4000-8000-000000000001','bk01_runtime',
    decode(repeat('ab',16),'hex'),decode(repeat('cd',32),'hex'),now()+interval '1 hour');`);
await db.exec(`SET ROLE wstera_runtime_issuer_login;`);
const clientReadable = (await query(`SELECT client_id,product_code FROM wstera_platform_internal.runtime_issuer_clients`)).length === 1;
pass('House worker can read an enabled client verifier row', clientReadable);
await db.exec('RESET ROLE;');
let populatedRollbackDenied = false;
try { await db.exec(rollbackSource); } catch (error) {
  populatedRollbackDenied = String(error.message).includes('rollback blocked');
}
pass('rollback refuses to delete live client/rate state', populatedRollbackDenied);

const emptyDb = new PGlite();
await emptyDb.exec(`CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN;
CREATE ROLE wstera_runtime_issuer_login LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;`);
await emptyDb.exec(sqlSource);
await emptyDb.exec(rollbackSource);
const leftovers = (await emptyDb.query(`SELECT
  to_regclass('wstera_platform_internal.runtime_issuer_clients') IS NULL AS clients_gone,
  to_regclass('wstera_platform_internal.runtime_issuer_rate_limits') IS NULL AS rates_gone,
  to_regclass('wstera_platform_internal.runtime_issuer_audit') IS NULL AS audit_gone,
  to_regprocedure('wstera_platform_internal.consume_runtime_issuer_rate_limit(text,integer,integer,timestamptz)') IS NULL AS function_gone`)).rows[0];
pass('empty House issuer schema rolls back exactly its owned objects',
  leftovers.clients_gone && leftovers.rates_gone && leftovers.audit_gone && leftovers.function_gone,
  JSON.stringify(leftovers));
await emptyDb.close();

const proof = { generated_at: new Date().toISOString(), engine: 'PGlite embedded Postgres',
  limits: ['only an isolated House-schema stand-in', 'not a Hyperdrive/hosted role proof', 'no token or credential values in output'], results };
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(proof, null, 2) + '\n');
await db.close();
if (results.some((result) => !result.ok)) process.exit(1);
