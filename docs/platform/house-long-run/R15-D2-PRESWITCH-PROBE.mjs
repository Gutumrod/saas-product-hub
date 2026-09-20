/**
 * R15 — D2 CREDENTIAL PRE-SWITCH PROOF (v3, restructured).
 *
 * Fix from v2: using `throw __ABORT__` inside sql.begin() to force the rollback also exited the
 * whole outer try block, so every section after it was silently skipped. Now the abort is caught
 * at the begin() call and execution continues normally.
 *
 * Connects AS hub_web_app, proves every matrix 4.1 operation, OV-1 with a real uploadedBy, and the
 * negative controls. Owner D2.2 test authority: all writes run inside rolled-back transactions.
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

const sql = postgres(appUrl, { prepare: false, ssl: 'require', max: 1, idle_timeout: 5, connect_timeout: 25 });
const ownerSql = postgres(ownerUrl, { prepare: false, ssl: 'require', max: 1, idle_timeout: 5, connect_timeout: 25 });
let ok = true;
const log = [];
const say = s => { console.log(s); log.push(s); };
const ROLLBACK = Symbol('rollback');

/** run fn in a transaction, always roll back, never let the rollback abort the caller */
async function rolledBack(fn) {
  try {
    await sql.begin(async tx => { await fn(tx); throw ROLLBACK; });
  } catch (e) {
    if (e !== ROLLBACK && e?.message !== 'ROLLBACK_SENTINEL') {
      // a real failure inside the transaction: report it, do not mask it
      say(`  (transaction error: ${e.code ?? ''} ${e.message})`);
      ok = false;
      return { failed: e };
    }
  }
  return {};
}

try {
  const profileId = (await ownerSql`SELECT id FROM public.profiles ORDER BY "createdAt" LIMIT 1`)[0]?.id ?? null;
  say(`real profiles.id for OV-1: ${profileId ?? 'NONE PRESENT'}`);

  say('');
  say('=== D2.1 CONNECTION IDENTITY (must be hub_web_app, not the owner) ===');
  const id = (await sql`SELECT current_user AS cu, session_user AS su`)[0];
  say(`  current_user=${id.cu} session_user=${id.su}`);
  const idOk = id.cu === cred.role && id.su === cred.role;
  if (!idOk) ok = false;
  say(`  identity is ${cred.role}: ${idOk ? 'PASS' : 'FAIL'}`);

  say('');
  say('=== D2.2 POSITIVE CONTROL — every required operation of matrix 4.1 (rolled back) ===');
  await rolledBack(async tx => {
    for (const t of ['products','product_assets','product_installations']) {
      const r = await tx.unsafe(`SELECT count(*)::bigint AS n FROM public."${t}"`);
      say(`  SELECT public.${t.padEnd(24)} OK rows=${r[0].n}`);
    }
    const stamp = Date.now();
    const p = await tx`INSERT INTO public.products
        ("slug","name","tagline","description","category","status","sortOrder")
        VALUES (${'r15-d2-' + stamp}, ${'R15 D2 proof'}, ${'proof'}, ${'R15 D2 proof row'}, ${'platform'}, 'coming_soon', 0)
        RETURNING id`;
    say(`  INSERT public.products                OK id=${p[0].id}`);
    await tx`INSERT INTO public.product_assets
        ("productId","assetType","originalFilename","storageKey","storageUrl","mimeType","sizeBytes","uploadedBy")
        VALUES (${p[0].id}, 'logo', ${'proof.png'}, ${'r15/d2/proof.png'}, ${'https://example.invalid/p.png'}, ${'image/png'}, 1, ${profileId})`;
    say(`  INSERT public.product_assets          OK (uploadedBy = real value)`);
    await tx`INSERT INTO public.product_installations
        ("productId","customerEmail","status","source","externalEventId")
        VALUES (${p[0].id}, ${'r15-d2@example.invalid'}, 'active', 'manual', ${'evt-' + stamp})`;
    say(`  INSERT public.product_installations   OK`);
    const u = await tx`UPDATE public.product_installations SET "customerName"=${'R15 D2'}
                       WHERE "productId"=${p[0].id} RETURNING id`;
    say(`  UPDATE public.product_installations   OK (${u.length} row)`);
    let dup = false;
    try {
      await tx`INSERT INTO public.product_installations ("productId","externalEventId") VALUES (${p[0].id}, ${'evt-' + stamp})`;
    } catch (e) { dup = e.code === '23505'; }
    say(`  duplicate (productId,externalEventId) rejected with 23505: ${dup ? 'PASS' : 'FAIL'}`);
    if (!dup) ok = false;
  });
  say('  rolled back — nothing persisted');

  say('');
  say('=== D2.2 NEGATIVE CONTROLS (privileges that must NOT exist) ===');
  for (const [label, stmt] of [
    ['SELECT public.profiles',       'SELECT count(*) FROM public.profiles'],
    ['DELETE public.products',       'DELETE FROM public.products WHERE false'],
    ['UPDATE public.products',       `UPDATE public.products SET "name"='x' WHERE false`],
    ['DELETE public.product_assets', 'DELETE FROM public.product_assets WHERE false'],
    ['CREATE TABLE in public',       'CREATE TABLE public.r15_should_fail (id int)'],
  ]) {
    try { await sql.unsafe(stmt); ok = false; say(`  ${label.padEnd(30)} ALLOWED — FAIL`); }
    catch (e) { say(`  ${label.padEnd(30)} denied ${e.code} — PASS`); }
  }

  say('');
  say('=== OV-1: FK to public.profiles using the REAL uploadedBy / recordedBy values ===');
  await rolledBack(async tx => {
    const stamp = Date.now();
    const p = await tx`INSERT INTO public.products
        ("slug","name","tagline","description","category","status","sortOrder")
        VALUES (${'r15-ov1-' + stamp}, ${'OV-1'}, ${'proof'}, ${'OV-1'}, ${'platform'}, 'coming_soon', 0)
        RETURNING id`;
    try {
      await tx`INSERT INTO public.product_assets
          ("productId","assetType","originalFilename","storageKey","storageUrl","mimeType","sizeBytes","uploadedBy")
          VALUES (${p[0].id}, 'logo', ${'ov1.png'}, ${'r15/ov1.png'}, ${'https://example.invalid/o.png'}, ${'image/png'}, 1, ${profileId})`;
      say('  product_assets INSERT with real uploadedBy: SUCCEEDED -> FK check needs no profiles SELECT');
    } catch (e) { ok = false; say(`  product_assets INSERT with real uploadedBy: FAILED ${e.code} ${e.message}`); }
    try {
      await tx`INSERT INTO public.product_installations
          ("productId","status","source","recordedBy") VALUES (${p[0].id}, 'active', 'manual', ${profileId})`;
      say('  product_installations INSERT with real recordedBy: SUCCEEDED');
    } catch (e) { ok = false; say(`  product_installations INSERT with real recordedBy: FAILED ${e.code} ${e.message}`); }
  });
  say('  rolled back — nothing persisted');

  say('');
  say('=== D2.2 billing deny (disposition A: absence-invariant, NOT a DENY PASS) ===');
  for (const s of ['billing_core','billing_core_staging']) {
    try { await sql.unsafe(`SELECT count(*) FROM ${s}.payments`); say(`  ${s}: ACCESSIBLE — unexpected`); }
    catch (e) { say(`  ${s}: ${e.code} — schema does not exist in Project A`); }
  }
  say('  => absence-invariant; mandatory re-verification when billing_core is created here.');

  say('');
  say(`=== D2 RESULT: ${ok ? 'PASS' : 'FAIL'} ===`);
} catch (e) {
  ok = false;
  say(`FATAL: ${e.message}`);
} finally {
  fs.writeFileSync(path.join(WS, 'd2-evidence.json'), JSON.stringify({ at: new Date().toISOString(), ok, log }, null, 2));
  await sql.end({ timeout: 5 });
  await ownerSql.end({ timeout: 5 });
  process.exitCode = ok ? 0 : 1;
}
