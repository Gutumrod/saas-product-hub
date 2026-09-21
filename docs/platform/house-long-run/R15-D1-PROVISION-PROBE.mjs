/**
 * R15 — D1 ROLE / GRANT / DENY PROVISIONING.
 *
 * Authorized by Owner 2026-09-21 ("อนุมัติตาม §5"; R15 D0->D4 under the bounded grant).
 * Scope strictly per T1-R15-PUBLIC-PRIVILEGE-MATRIX §4.1/§6 and the Owner OPTION 3 ruling.
 *
 * Creates hub_web_app as a LOGIN role with the exact R15 posture and grants ONLY the reviewed
 * privilege set. Never prints a credential. The role's password is generated here and delivered
 * only to the canonical secret channel in D2 - it is not written to this file or any evidence.
 *
 * Deny step per Codex disposition A: billing_core / billing_core_staging do not exist in Project A,
 * so the deny is recorded as an ABSENCE-INVARIANT, NOT a DENY PASS.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import postgres from 'postgres';

const HUB = 'D:/AI-Workspace/projects/saas-product-hub/apps/hub-web';
const WS = 'D:/AI-Workspace/runtime/hermes-native/workspace/house-r15';
const url = fs.readFileSync(path.join(HUB, '.env'), 'utf8').split(/\r?\n/)
  .find(l => l.startsWith('DATABASE_URL='))?.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
if (!url) { console.error('no DATABASE_URL'); process.exit(1); }

const ROLE = 'hub_web_app';
const sql = postgres(url, { prepare: false, ssl: 'require', max: 1, idle_timeout: 5, connect_timeout: 25 });
let ok = true;
const log = [];
const say = s => { console.log(s); log.push(s); };

try {
  // ── D1.0 baseline re-check ────────────────────────────────────────────────
  say('=== D1.0 BASELINE RECHECK ===');
  const pre = await sql`SELECT count(*)::int AS n FROM pg_roles WHERE rolname = ${ROLE}`;
  say(`  ${ROLE} exists before: ${pre[0].n !== 0} (expect false)`);
  if (pre[0].n !== 0) { say('  ABORT: role already exists - refusing to modify an existing role'); throw new Error('ROLE_EXISTS'); }

  // ── D1.1 create the login role with the exact R15 posture ─────────────────
  say('');
  say('=== D1.1 CREATE ROLE (R15 posture) ===');
  // password is generated, used, and stored ONLY in the private handoff file for D2. It is never
  // printed and never committed.
  const pw = crypto.randomBytes(32).toString('base64url');
  await sql.unsafe(
    `CREATE ROLE ${ROLE} WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS PASSWORD '${pw.replace(/'/g, "''")}'`
  );
  say(`  created ${ROLE}: LOGIN, NOSUPERUSER, NOCREATEDB, NOCREATEROLE, NOINHERIT, NOREPLICATION, NOBYPASSRLS`);

  const attrs = await sql`SELECT rolsuper, rolcreatedb, rolcreaterole, rolbypassrls, rolinherit, rolcanlogin, rolreplication
                          FROM pg_roles WHERE rolname = ${ROLE}`;
  const a = attrs[0];
  const postureOk = a.rolsuper === false && a.rolcreatedb === false && a.rolcreaterole === false
                 && a.rolbypassrls === false && a.rolcanlogin === true;
  say(`  verify posture: super=${a.rolsuper} createdb=${a.rolcreatedb} createrole=${a.rolcreaterole} bypassrls=${a.rolbypassrls} login=${a.rolcanlogin} -> ${postureOk ? 'PASS' : 'FAIL'}`);
  if (!postureOk) { ok = false; throw new Error('POSTURE_FAIL'); }

  const memberships = await sql`SELECT count(*)::int AS n FROM pg_auth_members m
                                JOIN pg_roles r ON r.oid = m.member WHERE r.rolname = ${ROLE}`;
  say(`  membership rows (expect 0): ${memberships[0].n} -> ${memberships[0].n === 0 ? 'PASS' : 'FAIL'}`);
  if (memberships[0].n !== 0) { ok = false; throw new Error('MEMBERSHIP_FAIL'); }

  // ── D1.2 exact grant scope (matrix §4.1 / §6) ─────────────────────────────
  say('');
  // Owner ruling 2026-09-21: the grants applied here are the EXPLICIT grant set from the matrix.
  // This step says nothing about EFFECTIVE privileges, which also include the recorded
  // PostgreSQL PUBLIC-default exception on user_role (see the verification section below).
  say('=== D1.2 GRANT (explicit grant set, matrix §4.1/§6 - nothing more than the matrix) ===');
  const grants = [
    `GRANT USAGE ON SCHEMA public TO ${ROLE}`,
    `GRANT SELECT, INSERT ON public.products TO ${ROLE}`,
    `GRANT SELECT, INSERT ON public.product_assets TO ${ROLE}`,
    `GRANT SELECT, INSERT, UPDATE ON public.product_installations TO ${ROLE}`,
    // backing identity sequences for the three granted tables - named explicitly.
    // Deliberately NOT "ALL SEQUENCES IN SCHEMA public": that would auto-cover sequences created
    // later in the schema, which is broader than the reviewed matrix.
    `GRANT USAGE ON SEQUENCE public.products_id_seq TO ${ROLE}`,
    `GRANT USAGE ON SEQUENCE public.product_assets_id_seq TO ${ROLE}`,
    `GRANT USAGE ON SEQUENCE public.product_installations_id_seq TO ${ROLE}`,
    // exactly four enum types (user_role deliberately NOT granted - belongs to excluded profiles)
    `GRANT USAGE ON TYPE public.product_status TO ${ROLE}`,
    `GRANT USAGE ON TYPE public.asset_type TO ${ROLE}`,
    `GRANT USAGE ON TYPE public.installation_status TO ${ROLE}`,
    `GRANT USAGE ON TYPE public.installation_source TO ${ROLE}`,
  ];
  for (const g of grants) {
    try { await sql.unsafe(g); say(`  OK   ${g.replace(/ TO .*/, '')}`); }
    catch (e) { ok = false; say(`  FAIL ${g}: ${e.code} ${e.message}`); throw e; }
  }

  // ── D1.2 verification: EXPLICIT grants equal the matrix, and nothing more ──
  // Owner ruling 2026-09-21 (disposition A): this check is on EXPLICIT grants only. One
  // EFFECTIVE privilege exists outside that explicit set - USAGE on public.user_role, inherited
  // through PostgreSQL's PUBLIC default for enum types, held identically by every role. The
  // user_role row was removed from the `excluded` list below for that reason and is reported
  // separately as a recorded exception instead. See
  // OWNER-DECISION-USERROLE-EFFECTIVE-PRIVILEGE-2026-09-21.md.
  say('');
  say('=== D1.2 VERIFY: table privileges ===');
  const want = { products: ['SELECT','INSERT'], product_assets: ['SELECT','INSERT'], product_installations: ['SELECT','INSERT','UPDATE'] };
  for (const [t, privs] of Object.entries(want)) {
    for (const p of ['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) {
      const r = await sql`SELECT has_table_privilege(${ROLE}, ${'public.' + t}, ${p}) AS h`;
      const should = privs.includes(p);
      const got = r[0].h;
      const verdict = (should === got) ? 'ok' : 'MISMATCH';
      if (verdict === 'MISMATCH') ok = false;
      say(`  ${t.padEnd(24)} ${p.padEnd(10)} expected=${should ? 'Y' : 'n'} actual=${got ? 'Y' : 'n'} ${verdict}`);
    }
  }

  say('');
  say('=== D1.2 VERIFY: EXPLICITLY-excluded privileges must be ABSENT ===');
  // NOTE: USAGE on user_role is deliberately NOT in this list. Per the Owner ruling of 2026-09-21
  // (disposition A) it is a RECORDED PostgreSQL effective-privilege exception, not an explicit
  // grant, and `has_type_privilege` returns true for it in every role because acldefault('T', owner)
  // gives PUBLIC USAGE on enum types. It is asserted separately, below.
  const excluded = [
    ['public.profiles SELECT',           `has_table_privilege('${ROLE}','public.profiles','SELECT')`],
    ['public.profiles INSERT',           `has_table_privilege('${ROLE}','public.profiles','INSERT')`],
    ['public.profiles UPDATE',           `has_table_privilege('${ROLE}','public.profiles','UPDATE')`],
    ['public.profiles DELETE',           `has_table_privilege('${ROLE}','public.profiles','DELETE')`],
    ['public schema CREATE',             `has_schema_privilege('${ROLE}','public','CREATE')`],
    ['BYPASSRLS',                        `(SELECT rolbypassrls FROM pg_roles WHERE rolname='${ROLE}')`],
    ['SUPERUSER',                        `(SELECT rolsuper FROM pg_roles WHERE rolname='${ROLE}')`],
  ];
  for (const [label, expr] of excluded) {
    const r = await sql.unsafe(`SELECT ${expr} AS v`);
    const v = r[0].v;
    if (v === true) ok = false;
    say(`  ${label.padEnd(34)} must be false -> ${v} ${v === true ? 'FAIL' : 'PASS'}`);
  }

  say('');
  say('=== D1.2 VERIFY: explicit type grants equal the matrix; user_role NOT explicitly granted ===');
  const explicitTypes = await sql`
    SELECT t.typname FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace
    CROSS JOIN LATERAL aclexplode(COALESCE(t.typacl, acldefault('T', t.typowner))) a
    JOIN pg_roles g ON g.oid = a.grantee
    WHERE n.nspname='public' AND g.rolname=${ROLE} AND a.privilege_type='USAGE'
    ORDER BY t.typname`;
  const explicitNames = explicitTypes.map(x => x.typname);
  const wantTypes = ['asset_type','installation_source','installation_status','product_status'];
  const typesExact = explicitNames.length === wantTypes.length && wantTypes.every(w => explicitNames.includes(w));
  if (!typesExact) ok = false;
  say(`  explicit: ${explicitNames.join(', ') || '(none)'}`);
  say(`  equals the four matrix enums exactly: ${typesExact ? 'PASS' : 'FAIL'}`);

  say('');
  say('=== D1.2 RECORDED EXCEPTION (Owner ruling disposition A - NOT an explicit grant) ===');
  const urAcl = (await sql`SELECT typacl IS NULL AS no_acl FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace
                           WHERE n.nspname='public' AND t.typname='user_role'`)[0].no_acl;
  const holders = {};
  for (const r of [ROLE,'anon','authenticated','service_role']) {
    holders[r] = (await sql`SELECT has_type_privilege(${r},'public.user_role','USAGE') AS h`)[0].h;
  }
  say(`  user_role.typacl is null (nobody granted it): ${urAcl}`);
  say(`  effective USAGE holders (identical for every role): ${JSON.stringify(holders)}`);
  say("  -> arises from PostgreSQL's PUBLIC default for enum types (acldefault = =U/postgres).");
  say('  -> recorded as an accepted exception; NOT treated as a failure and NOT remediated.');
  if (urAcl !== true) { ok = false; say('  FAIL: expected user_role to have no explicit ACL'); }

  // ── D1.4 profiles boundary frozen ─────────────────────────────────────────
  say('');
  say('=== D1.4 public.profiles BOUNDARY (must be untouched) ===');
  const rls = await sql`SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
                        WHERE n.nspname='public' AND c.relname='profiles'`;
  const pol = await sql`SELECT count(*)::int AS n FROM pg_policy pol JOIN pg_class c ON c.oid=pol.polrelid
                        JOIN pg_namespace n ON n.oid=c.relnamespace
                        WHERE n.nspname='public' AND c.relname='profiles'
                          AND EXISTS (SELECT 1 FROM unnest(pol.polroles) pr JOIN pg_roles r ON r.oid=pr WHERE r.rolname=${ROLE})`;
  say(`  RLS still enabled: ${rls[0].relrowsecurity} (expect true)`);
  say(`  hub_web_app policies on profiles: ${pol[0].n} (expect 0)`);
  if (rls[0].relrowsecurity !== true || pol[0].n !== 0) { ok = false; say('  FAIL'); }

  // ── D1.3 deny step — ABSENCE-INVARIANT, per Codex disposition A ───────────
  say('');
  say('=== D1.3 BILLING DENY (disposition A: absence-invariant, NOT a DENY PASS) ===');
  const bs = await sql`SELECT nspname FROM pg_namespace WHERE nspname IN ('billing_core','billing_core_staging')`;
  say(`  billing schemas present in Project A: ${bs.length}`);
  say(`  -> recorded as absence-invariant: hub_web_app cannot hold privileges on a schema that`);
  say(`     does not exist in this project. This is NOT a DENY PASS.`);
  say(`  -> mandatory re-verification when billing_core/billing_core_staging are created in Project A.`);

  // ── OV-1: FK referential-integrity behaviour without profiles privilege ───
  say('');
  say('=== OV-1 FK BEHAVIOUR (product_installations.recordedBy -> profiles.id, no profiles priv) ===');
  say(`  deferred to D2.2: it must be observed with the hub_web_app credential itself, not inferred.`);

  // persist the password ONLY to the private handoff file (never printed, never committed)
  fs.writeFileSync(path.join(WS, 'hub_web_app.credential.private'),
    JSON.stringify({ role: ROLE, password: pw, created_at: new Date().toISOString() }, null, 2), { mode: 0o600 });
  say('');
  say(`  credential generated and written to the private handoff file (mode 600). Value never printed.`);

  say('');
  say(`=== RESULT: ${ok ? 'PASS' : 'FAIL'} ===`);
  fs.writeFileSync(path.join(WS, 'd1-evidence.json'), JSON.stringify({ at: new Date().toISOString(), ok, log }, null, 2));
} catch (e) {
  ok = false;
  say(`D1 ERROR: ${e.message}`);
  fs.writeFileSync(path.join(WS, 'd1-evidence.json'), JSON.stringify({ at: new Date().toISOString(), ok, log }, null, 2));
} finally {
  await sql.end({ timeout: 5 });
  process.exitCode = ok ? 0 : 1;
}
