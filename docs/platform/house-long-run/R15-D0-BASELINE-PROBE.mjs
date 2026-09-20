/**
 * R15 — D0 PRE-FLIGHT (READ-ONLY, NO MUTATION)
 *
 * Owner decision 2026-09-20 authorized the R15 transition D0->D1->D2->D3->D4 under the approved
 * R15 plan. This script performs D0 only:
 *   D0.1 pin the transition target
 *   D0.2 capture the pre-transition baseline (the rollback reference)
 *   D0.4 verify the ACTUAL production topology for the P4/U4 pre-data gate
 *
 * It runs SELECT statements only. No CREATE/ALTER/GRANT/REVOKE/INSERT/UPDATE/DELETE.
 * It never prints the connection string or any credential value.
 */
import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';

const ENV = path.resolve('D:/AI-Workspace/projects/saas-product-hub/apps/hub-web/.env');
const env = fs.readFileSync(ENV, 'utf8');
const url = env.split(/\r?\n/).find(l => l.startsWith('DATABASE_URL='))?.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
if (!url) { console.error('DATABASE_URL not found in .env'); process.exit(1); }

const roleBase = url.match(/postgresql:\/\/([^:]+):/)?.[1] ?? '?';
console.log('=== D0.1 TRANSITION TARGET (pinned) ===');
console.log('credential role form :', roleBase.includes('.') ? `${roleBase.split('.')[0]}.<redacted-ref>` : roleBase);
console.log('project ref matches R15 defect identity (postgres.coyelzlgukvpgguqpjdi):', roleBase === 'postgres.coyelzlgukvpgguqpjdi');
console.log('target Worker       : hub-web (wstera.com, platform.wstera.com)');
console.log('superseded version  : 9db4fb70-a5e5-4989-94b5-1d271ab10055');
console.log('current  version    : 00bdb1b5-70d2-4e41-b97d-f1f238e9bf31');
console.log('');

const sql = postgres(url, { prepare: false, ssl: 'require', max: 1, idle_timeout: 5, connect_timeout: 20 });

const out = [];
function rec(step, label, value) { out.push({ step, label, value }); console.log(`[${step}] ${label}: ${JSON.stringify(value)}`); }

try {
  console.log('=== D0.2 BASELINE (read-only, rollback reference) ===');

  const id = await sql`SELECT current_user AS cu, session_user AS su, current_database() AS db, version() AS v`;
  rec('D0.2', 'current_user', id[0].cu);
  rec('D0.2', 'session_user', id[0].su);
  rec('D0.2', 'database', id[0].db);
  rec('D0.2', 'server_version_prefix', id[0].v.split(' ').slice(0, 2).join(' '));

  const role = await sql`SELECT rolname, rolsuper, rolcreatedb, rolcreaterole, rolbypassrls, rolinherit, rolcanlogin
                         FROM pg_roles WHERE rolname = 'hub_web_app'`;
  rec('D0.2', 'hub_web_app exists (expect ZERO rows at baseline)', role.length);
  rec('D0.2', 'hub_web_app row', role);

  const rls = await sql`SELECT c.relname, c.relrowsecurity, c.relforcerowsecurity
                        FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
                        WHERE n.nspname = 'public' AND c.relname = 'profiles'`;
  rec('D0.2', 'public.profiles RLS state', rls);

  const pol = await sql`SELECT pol.polname,
                               (SELECT array_agg(r.rolname ORDER BY r.rolname)
                                  FROM unnest(pol.polroles) pr
                                  JOIN pg_roles r ON r.oid = pr) AS roles
                        FROM pg_policy pol
                        JOIN pg_class c ON c.oid = pol.polrelid
                        JOIN pg_namespace n ON n.oid = c.relnamespace
                        WHERE n.nspname = 'public' AND c.relname = 'profiles'`;
  rec('D0.2', 'public.profiles policies', pol);

  const owners = await sql`SELECT count(*)::int AS n FROM pg_tables t
                           JOIN pg_class c ON c.relname = t.tablename
                           WHERE t.schemaname = 'public' AND c.relowner = (SELECT oid FROM pg_roles WHERE rolname='hub_web_app')`;
  rec('D0.2', 'objects owned by hub_web_app (expect 0)', owners[0].n);

  console.log('');
  console.log('=== D0.4 P4/U4 — ACTUAL PRODUCTION TOPOLOGY (pre-data gate) ===');

  const schemas = await sql`SELECT nspname, pg_get_userbyid(nspowner) AS owner
                            FROM pg_namespace
                            WHERE nspname IN ('billing_core','billing_core_staging')
                            ORDER BY nspname`;
  rec('D0.4', 'billing schemas present', schemas);
  rec('D0.4', 'billing_core present', schemas.some(s => s.nspname === 'billing_core'));
  rec('D0.4', 'billing_core_staging present', schemas.some(s => s.nspname === 'billing_core_staging'));

  // enumerate the REAL objects in those schemas (never invent probe names)
  for (const s of schemas) {
    const objs = await sql`SELECT c.relkind, c.relname, pg_get_userbyid(c.relowner) AS owner
                           FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
                           WHERE n.nspname = ${s.nspname} AND c.relkind IN ('r','p','v','m','S','f')
                           ORDER BY c.relkind, c.relname`;
    rec('D0.4', `${s.nspname}: objects (relkind/name/owner)`, objs);
    const fns = await sql`SELECT p.proname, pg_get_userbyid(p.proowner) AS owner
                          FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
                          WHERE n.nspname = ${s.nspname} ORDER BY p.proname`;
    rec('D0.4', `${s.nspname}: functions`, fns);
    const tys = await sql`SELECT t.typname FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
                          WHERE n.nspname = ${s.nspname} ORDER BY t.typname`;
    rec('D0.4', `${s.nspname}: types`, tys);
  }

  // row existence check on real tables, counts only (no data values)
  for (const s of schemas) {
    const tables = await sql`SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
                             WHERE n.nspname = ${s.nspname} AND c.relkind IN ('r','p') ORDER BY c.relname`;
    for (const t of tables) {
      try {
        const r = await sql.unsafe(`SELECT count(*)::bigint AS n FROM "${s.nspname}"."${t.relname}"`);
        rec('D0.4', `${s.nspname}.${t.relname} row count`, String(r[0].n));
      } catch (e) {
        rec('D0.4', `${s.nspname}.${t.relname} row count`, `UNREADABLE: ${e.message}`);
      }
    }
  }

  // PUBLIC-level grants that could confer access (deny matrix §)
  const pub = await sql`SELECT n.nspname, a.privilege_type, a.grantee::regrole AS grantee
                        FROM (SELECT nspname, oid FROM pg_namespace WHERE nspname IN ('billing_core','billing_core_staging')) n
                        JOIN pg_class c ON c.relnamespace = n.oid
                        CROSS JOIN LATERAL aclexplode(COALESCE(c.relacl, acldefault('r', c.relowner))) a
                        WHERE a.grantee = 0`;
  rec('D0.4', 'PUBLIC grants inside billing schemas (grantee=0)', pub);

  console.log('');
  console.log('=== D0 RESULT SUMMARY ===');
  console.log('owner credential in use  :', id[0].cu);
  console.log('hub_web_app rows         :', role.length, '(expect 0)');
  console.log('billing_core present     :', schemas.some(s => s.nspname === 'billing_core'));
  console.log('billing_core_staging     :', schemas.some(s => s.nspname === 'billing_core_staging'));
  console.log('READ-ONLY: no mutation performed');

  fs.writeFileSync(
    'D:/AI-Workspace/runtime/hermes-native/workspace/house-r15/d0-baseline.json',
    JSON.stringify({ captured_at: new Date().toISOString(), records: out }, null, 2)
  );
} catch (e) {
  console.error('D0 ERROR:', e.message);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
