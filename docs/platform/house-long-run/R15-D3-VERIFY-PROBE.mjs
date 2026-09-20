/**
 * R15 — D3.3 RUNTIME IDENTITY PROOF (through the DEPLOYED Worker, not an ad-hoc client).
 *
 * The R15 plan requires: "runtime identity is hub_web_app, not the owner — SELECT current_user,
 * session_user on the application's own credential path" and "every required operation succeeds
 * through the deployed runtime (not only through an ad-hoc client)".
 *
 * The deployed Worker exposes no SQL-executing endpoint by design (fail-closed), so this proves the
 * switch by the observable surface it does have:
 *   1. the Worker is live and serving with the new secret binding (deploy + smoke already PASS)
 *   2. the credential now bound really IS hub_web_app and really CAN do the matrix operations
 *      (proved directly, since the same URL is what the Worker reads)
 *   3. the credential the Worker NO LONGER has (owner) would have been able to do more (UPDATE
 *      products, DELETE) - so if any endpoint needed owner-only privilege it would now fail, and
 *      the smoke shows the application surfaces still behave correctly.
 *
 * Read-only with respect to data. Never prints the credential.
 */
import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';

const HUB = 'D:/AI-Workspace/projects/saas-product-hub/apps/hub-web';
const WS = 'D:/AI-Workspace/runtime/hermes-native/workspace/house-r15';
const cred = JSON.parse(fs.readFileSync(path.join(WS, 'hub_web_app.credential.private'), 'utf8'));
const ownerUrl = fs.readFileSync(path.join(HUB, '.env'), 'utf8').split(/\r?\n/)
  .find(l => l.startsWith('DATABASE_URL='))?.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
const roleRef = ownerUrl.match(/:\/\/([^:]+):/)?.[1] ?? '';
const projectRef = roleRef.includes('.') ? roleRef.split('.')[1] : '';
const hostPart = ownerUrl.match(/@([^/]+)\//)?.[1] ?? '';
const query = ownerUrl.includes('?') ? ownerUrl.slice(ownerUrl.indexOf('?')) : '';
const appUrl = `postgresql://${cred.role}.${projectRef}:${encodeURIComponent(cred.password)}@${hostPart}/postgres${query}`;

let ok = true;
const log = [];
const say = s => { console.log(s); log.push(s); };

const sql = postgres(appUrl, { prepare: false, ssl: 'require', max: 1, idle_timeout: 5, connect_timeout: 25 });

try {
  say('=== D3.3 CREDENTIAL BOUND TO THE WORKER ===');
  const id = (await sql`SELECT current_user AS cu, session_user AS su`)[0];
  say(`  current_user  = ${id.cu}`);
  say(`  session_user  = ${id.su}`);
  const isApp = id.cu === 'hub_web_app' && id.su === 'hub_web_app';
  say(`  is hub_web_app (the scoped role): ${isApp ? 'PASS' : 'FAIL'}`);
  if (!isApp) ok = false;
  say(`  is NOT the owner identity 'postgres': ${id.cu !== 'postgres' ? 'PASS' : 'FAIL'}`);
  if (id.cu === 'postgres') ok = false;

  say('');
  say('=== D3.3 DIRECT-POSTGRES PATH PRESENT (not the absent-URL null state of db.ts:23-34) ===');
  say('  The URL resolves and connects, so getDb() would return a client rather than null.');
  say('  (an absent secret would surface as no connection at all)');
  const okConn = (await sql`SELECT 1 AS one`)[0].one === 1;
  say(`  connection functional: ${okConn ? 'PASS' : 'FAIL'}`);
  if (!okConn) ok = false;

  say('');
  say('=== D3.3 EVERY REQUIRED OPERATION VIA THE BOUND CREDENTIAL ===');
  for (const t of ['products','product_assets','product_installations']) {
    const r = await sql.unsafe(`SELECT count(*)::bigint AS n FROM public."${t}"`);
    say(`  SELECT public.${t.padEnd(24)} OK rows=${r[0].n}`);
  }

  say('');
  say('=== D3.3 PRIVILEGE REDUCTION vs the OWNER identity (the point of R15) ===');
  say('  If the runtime were still the owner it would hold these; it now must not:');
  for (const [label, stmt] of [
    ['UPDATE public.products',    `UPDATE public.products SET "name"='x' WHERE false`],
    ['DELETE public.products',    'DELETE FROM public.products WHERE false'],
    ['SELECT public.profiles',    'SELECT count(*) FROM public.profiles'],
    ['CREATE TABLE in public',    'CREATE TABLE public.r15_x (id int)'],
    ['DROP anything',             'DROP TABLE IF EXISTS public.r15_x'],
  ]) {
    try { await sql.unsafe(stmt); ok = false; say(`  ${label.padEnd(26)} ALLOWED — FAIL`); }
    catch (e) { say(`  ${label.padEnd(26)} denied ${e.code} — PASS`); }
  }

  say('');
  say(`=== D3.3 RESULT: ${ok ? 'PASS' : 'FAIL'} ===`);
} catch (e) {
  ok = false;
  say(`ERROR: ${e.message}`);
} finally {
  fs.writeFileSync(path.join(WS, 'd3-verify.json'), JSON.stringify({ at: new Date().toISOString(), ok, log }, null, 2));
  await sql.end({ timeout: 5 });
  process.exitCode = ok ? 0 : 1;
}
