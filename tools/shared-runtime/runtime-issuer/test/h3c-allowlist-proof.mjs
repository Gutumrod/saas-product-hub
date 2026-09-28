import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../');
const output = process.env.RUNTIME_ISSUER_SQL_PROOF_OUTPUT;
if (!output || path.resolve(output).startsWith(`${root}${path.sep}`)) {
  throw new Error('Set RUNTIME_ISSUER_SQL_PROOF_OUTPUT to an external runtime evidence path');
}
const original = fs.readFileSync(path.join(root, 'docs/platform/shared-runtime/migrations/h3c_auth_runtime_token_support.sql'), 'utf8');
const expansion = fs.readFileSync(path.join(root, 'docs/platform/shared-runtime/migrations/h3c_runtime_role_allowlist_expansion.sql'), 'utf8');
const rollback = fs.readFileSync(path.join(root, 'docs/platform/shared-runtime/migrations/h3c_runtime_role_allowlist_expansion_rollback.sql'), 'utf8');
const db = new PGlite();
const results = [];
const pass = (name, ok, detail = '') => { results.push({ name, ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`); };
const query = async (sql) => (await db.query(sql)).rows;

await db.exec(`CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN;
CREATE ROLE authenticator NOLOGIN; CREATE ROLE supabase_auth_admin NOLOGIN;
CREATE ROLE ps01_migrator NOLOGIN; CREATE ROLE ps01_runtime NOLOGIN;
CREATE ROLE ps01_runtime_login LOGIN; CREATE ROLE ps01_line_runtime NOLOGIN;
CREATE ROLE bk01_runtime NOLOGIN;`);
let initialError = null;
try { await db.exec(original); } catch (error) { initialError = String(error.message); }
pass('frozen H3C support migration applies offline', initialError === null, initialError ?? 'inert H3C baseline created');
if (initialError) { await db.close(); process.exit(1); }
let expansionError = null;
try { await db.exec(expansion); } catch (error) { expansionError = String(error.message); }
pass('BK01 H3C allowlist expansion applies without changing existing grants', expansionError === null,
  expansionError ?? 'existing grants preserved');
if (expansionError) { await db.close(); process.exit(1); }

await db.exec(`INSERT INTO wstera_platform_internal.runtime_token_grants(user_id,database_role,enabled,valid_until)
  VALUES ('00000000-0000-4000-8000-000000000001','ps01_line_runtime',true,now()+interval '1 hour'),
         ('00000000-0000-4000-8000-000000000002','bk01_runtime',true,now()+interval '1 hour');`);
const ps01 = (await query(`SELECT wstera_platform_internal.custom_access_token_hook(
  '{"user_id":"00000000-0000-4000-8000-000000000001","claims":{"role":"authenticated","exp":9999999999}}'::jsonb) AS token`))[0].token;
const bk01 = (await query(`SELECT wstera_platform_internal.custom_access_token_hook(
  '{"user_id":"00000000-0000-4000-8000-000000000002","claims":{"role":"authenticated","exp":9999999999}}'::jsonb) AS token`))[0].token;
const psRole = ps01.claims.role;
const bkRole = bk01.claims.role;
const ttlRows = await query(`SELECT floor(extract(epoch FROM statement_timestamp()+interval '5 minutes'))::bigint AS ceiling`);
pass('H3C hook keeps PS01 role and adds only BK01 runtime role', psRole === 'ps01_line_runtime' && bkRole === 'bk01_runtime',
  `ps01=${psRole}; bk01=${bkRole}`);
pass('both Auth-issued roles remain capped at five minutes',
  Number(ps01.claims.exp) <= Number(ttlRows[0].ceiling) && Number(bk01.claims.exp) <= Number(ttlRows[0].ceiling));
const unknownRejected = await (async () => {
  try { await db.exec(`INSERT INTO wstera_platform_internal.runtime_token_grants(user_id,database_role,enabled)
    VALUES ('00000000-0000-4000-8000-000000000003','other_runtime',true)`); return false; }
  catch { await db.exec('ROLLBACK;'); return true; }
})();
pass('unknown database role cannot enter House hook grant table', unknownRejected);

await db.exec(`DELETE FROM wstera_platform_internal.runtime_token_grants WHERE user_id IN
 ('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002');`);
let rollbackError = null;
try { await db.exec(rollback); } catch (error) { rollbackError = String(error.message); }
const psConstraintRestored = (await query(`SELECT count(*)::int AS n FROM pg_constraint
  WHERE conname='runtime_token_grants_database_role_check'`))[0].n === 1;
pass('H3C rollback restores the PS01-only check after all BK01 grants are cleared', rollbackError === null && psConstraintRestored,
  rollbackError ?? 'source allowlist returned to prior role set');

const proof = { generated_at: new Date().toISOString(), engine: 'PGlite embedded Postgres',
  limits: ['mock Auth hook invocation only', 'does not enable hosted Auth hook or issue a JWT', 'not a live LAB proof'], results };
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(proof, null, 2) + '\n');
await db.close();
if (results.some((result) => !result.ok)) process.exit(1);
