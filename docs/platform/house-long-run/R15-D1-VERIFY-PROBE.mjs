/**
 * R15 — D1 VERIFICATION (re-run, no creation). Role already provisioned.
 *
 * Corrects the checker defect found in the first D1 pass: PostgreSQL grants USAGE on TYPE to
 * PUBLIC by default (acldefault('T',...) includes PUBLIC=U), so `has_type_privilege(role,type,'USAGE')`
 * is true for every role unless PUBLIC's grant is revoked. The matrix's requirement is that
 * hub_web_app holds no privilege BEYOND the reviewed set, so the correct test distinguishes:
 *   - EXPLICIT grant to hub_web_app (the reviewed grant)             -> expected for the 4 matrix enums
 *   - effective access only via the PostgreSQL PUBLIC default        -> expected, not revocable per-role
 * The first pass wrongly treated the second as a failure.
 */
import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';

const HUB = 'D:/AI-Workspace/projects/saas-product-hub/apps/hub-web';
const WS = 'D:/AI-Workspace/runtime/hermes-native/workspace/house-r15';
const url = fs.readFileSync(path.join(HUB, '.env'), 'utf8').split(/\r?\n/)
  .find(l => l.startsWith('DATABASE_URL='))?.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');

const ROLE = 'hub_web_app';
const sql = postgres(url, { prepare: false, ssl: 'require', max: 1, idle_timeout: 5, connect_timeout: 25 });
let ok = true;
const log = [];
const say = s => { console.log(s); log.push(s); };

try {
  say('=== D1.1 POSTURE (existing role) ===');
  const a = (await sql`SELECT rolsuper, rolcreatedb, rolcreaterole, rolbypassrls, rolinherit, rolcanlogin, rolreplication
                       FROM pg_roles WHERE rolname=${ROLE}`)[0];
  const posture = a && !a.rolsuper && !a.rolcreatedb && !a.rolcreaterole && !a.rolbypassrls && a.rolcanlogin;
  say(`  super=${a?.rolsuper} createdb=${a?.rolcreatedb} createrole=${a?.rolcreaterole} bypassrls=${a?.rolbypassrls} inherit=${a?.rolinherit} login=${a?.rolcanlogin} repl=${a?.rolreplication}`);
  say(`  R15 posture: ${posture ? 'PASS' : 'FAIL'}`);
  if (!posture) ok = false;

  const mem = (await sql`SELECT count(*)::int AS n FROM pg_auth_members m JOIN pg_roles r ON r.oid=m.member WHERE r.rolname=${ROLE}`)[0].n;
  say(`  memberships (expect 0): ${mem} ${mem === 0 ? 'PASS' : 'FAIL'}`);
  if (mem !== 0) ok = false;

  say('');
  say('=== D1.2 TABLE PRIVILEGES: explicit set equals the exact matrix (see user_role note below) ===');
  const want = { products: ['SELECT','INSERT'], product_assets: ['SELECT','INSERT'], product_installations: ['SELECT','INSERT','UPDATE'] };
  for (const [t, privs] of Object.entries(want)) {
    for (const p of ['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) {
      const got = (await sql`SELECT has_table_privilege(${ROLE}, ${'public.' + t}, ${p}) AS h`)[0].h;
      const should = privs.includes(p);
      const bad = should !== got;
      if (bad) ok = false;
      say(`  ${t.padEnd(24)} ${p.padEnd(11)} matrix=${should ? 'Y' : '-'} actual=${got ? 'Y' : '-'} ${bad ? 'MISMATCH' : 'ok'}`);
    }
  }

  say('');
  say('=== D1.2 profiles EXCLUDED (all privileges must be absent) ===');
  for (const p of ['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) {
    const got = (await sql`SELECT has_table_privilege(${ROLE},'public.profiles',${p}) AS h`)[0].h;
    if (got) ok = false;
    say(`  profiles ${p.padEnd(11)} ${got ? 'PRESENT - FAIL' : 'absent - ok'}`);
  }

  say('');
  say('=== D1.2 SEQUENCES (only the 3 granted tables) ===');
  for (const s of ['products_id_seq','product_assets_id_seq','product_installations_id_seq']) {
    const got = (await sql`SELECT has_sequence_privilege(${ROLE}, ${'public.' + s}, 'USAGE') AS h`)[0].h;
    say(`  ${s.padEnd(30)} USAGE=${got} ${got ? 'ok' : 'MISSING - FAIL'}`);
    if (!got) ok = false;
  }

  say('');
  say('=== D1.2 TYPE grants: EXPLICIT hub_web_app grants only ===');
  const explicit = await sql`
    SELECT t.typname, a.privilege_type
    FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace
    CROSS JOIN LATERAL aclexplode(COALESCE(t.typacl, acldefault('T', t.typowner))) a
    JOIN pg_roles g ON g.oid=a.grantee
    WHERE n.nspname='public' AND g.rolname=${ROLE} ORDER BY t.typname`;
  const names = explicit.map(x => x.typname);
  say(`  explicit: ${names.join(', ') || '(none)'}`);
  const expect = ['asset_type','installation_source','installation_status','product_status'];
  const exact = names.length === expect.length && expect.every(e => names.includes(e));
  say(`  equals the four reviewed enums exactly (user_role NOT included): ${exact ? 'PASS' : 'FAIL'}`);
  if (!exact) ok = false;

  say('');
  say('=== D1.2 note: effective PUBLIC default on enum types (not a grant by us) ===');
  const pubUsr = (await sql`SELECT has_type_privilege(${ROLE},'public.user_role','USAGE') AS h`)[0].h;
  const usrAcl = (await sql`SELECT typacl IS NULL AS d FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace
                            WHERE n.nspname='public' AND t.typname='user_role'`)[0].d;
  const others = {};
  for (const r of ['anon','authenticated','service_role']) {
    others[r] = (await sql`SELECT has_type_privilege(${r},'public.user_role','USAGE') AS h`)[0].h;
  }
  say(`  hub_web_app effective USAGE on user_role: ${pubUsr}`);
  say(`  user_role has no explicit ACL (PostgreSQL PUBLIC default applies): ${usrAcl}`);
  say(`  same default for anon/authenticated/service_role: ${JSON.stringify(others)}`);
  say(`  => a PostgreSQL characteristic of enum types, NOT a privilege granted by D1.`);
  say(`     Removing it per-role would require revoking PUBLIC's default, which would affect every`);
  say(`     other role and is outside the reviewed matrix. Recorded, not "fixed".`);

  say('');
  say('=== D1.2 other exclusions ===');
  for (const [label, expr] of [
    ['public schema CREATE', `has_schema_privilege('${ROLE}','public','CREATE')`],
    ['BYPASSRLS',            `(SELECT rolbypassrls FROM pg_roles WHERE rolname='${ROLE}')`],
    ['SUPERUSER',            `(SELECT rolsuper FROM pg_roles WHERE rolname='${ROLE}')`],
  ]) {
    const v = (await sql.unsafe(`SELECT ${expr} AS v`))[0].v;
    if (v === true) ok = false;
    say(`  ${label.padEnd(24)} false expected -> ${v} ${v === true ? 'FAIL' : 'ok'}`);
  }

  say('');
  say('=== D1.3 BILLING (disposition A: absence-invariant, NOT a DENY PASS) ===');
  const bs = await sql`SELECT nspname FROM pg_namespace WHERE nspname IN ('billing_core','billing_core_staging')`;
  say(`  billing schemas in Project A: ${bs.length} -> absence-invariant recorded; mandatory`);
  say(`  re-verification when they are created here. This is NOT a DENY PASS.`);

  say('');
  say('=== D1.4 profiles boundary frozen ===');
  const rls = (await sql`SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
                         WHERE n.nspname='public' AND c.relname='profiles'`)[0].relrowsecurity;
  const pol = (await sql`SELECT count(*)::int AS n FROM pg_policy pol JOIN pg_class c ON c.oid=pol.polrelid
                         JOIN pg_namespace n ON n.oid=c.relnamespace
                         WHERE n.nspname='public' AND c.relname='profiles'
                           AND EXISTS (SELECT 1 FROM unnest(pol.polroles) pr JOIN pg_roles r ON r.oid=pr WHERE r.rolname=${ROLE})`)[0].n;
  say(`  RLS enabled: ${rls} (expect true) · hub_web_app policies: ${pol} (expect 0)`);
  if (rls !== true || pol !== 0) ok = false;

  say('');
  say(`=== D1 RESULT: ${ok ? 'PASS' : 'FAIL'} ===`);
} catch (e) {
  ok = false;
  say(`ERROR: ${e.message}`);
} finally {
  fs.writeFileSync(path.join(WS, 'd1-verify.json'), JSON.stringify({ at: new Date().toISOString(), ok, log }, null, 2));
  await sql.end({ timeout: 5 });
  process.exitCode = ok ? 0 : 1;
}
