/**
 * R15 D0 — SCHEMA DRIFT REPORT (READ-ONLY, NO MUTATION)
 *
 * Compares every table declared in drizzle/schema.ts against the live Project A database.
 * SELECT / to_regclass only. No DDL, no writes, no credential printed.
 *
 * This is step 1 of the remediation proposal: it converts "some tables are missing" into an
 * exact, reviewable scope before anything is applied.
 */
import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';

const ROOT = 'D:/AI-Workspace/projects/saas-product-hub/apps/hub-web';
const url = fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split(/\r?\n/)
  .find(l => l.startsWith('DATABASE_URL='))?.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
if (!url) { console.error('no DATABASE_URL'); process.exit(1); }

// tables declared in schema.ts via pgTable("<name>", ...)
const schemaSrc = fs.readFileSync(path.join(ROOT, 'drizzle/schema.ts'), 'utf8');
const declared = [...schemaSrc.matchAll(/pgTable\(\s*["']([^"']+)["']/g)].map(m => m[1]);

// enums declared via pgEnum("<name>", ...)
const enums = [...schemaSrc.matchAll(/pgEnum\(\s*["']([^"']+)["']/g)].map(m => m[1]);

const sql = postgres(url, { prepare: false, ssl: 'require', max: 1, idle_timeout: 5, connect_timeout: 20 });

try {
  console.log(`declared tables in schema.ts : ${declared.length}`);
  console.log(`declared enums  in schema.ts : ${enums.length}`);
  console.log('');

  const present = [], absent = [];
  for (const t of declared) {
    const r = await sql`SELECT to_regclass(${'public.' + t}) AS r`;
    if (r[0].r) present.push(t); else absent.push(t);
  }

  console.log(`=== PRESENT in Project A (${present.length}/${declared.length}) ===`);
  for (const t of present) {
    const cols = await sql`
      SELECT count(*)::int AS n FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${t}`;
    const rows = await sql.unsafe(`SELECT count(*)::bigint AS n FROM public."${t}"`).catch(() => [{ n: '?' }]);
    console.log(`  ${t.padEnd(34)} cols=${String(cols[0].n).padStart(3)}  rows=${String(rows[0].n)}`);
  }

  console.log('');
  console.log(`=== ABSENT from Project A (${absent.length}/${declared.length}) ===`);
  for (const t of absent) console.log(`  ${t}`);

  console.log('');
  console.log('=== enum types in Project A ===');
  for (const e of enums) {
    const r = await sql`SELECT count(*)::int AS n FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace
                        WHERE t.typname = ${e} AND n.nspname = 'public'`;
    console.log(`  ${e.padEnd(26)} ${r[0].n ? 'present' : 'ABSENT'}`);
  }

  console.log('');
  console.log('=== migration bookkeeping ===');
  const j = await sql`SELECT to_regclass('drizzle.__drizzle_migrations') AS a,
                             to_regclass('public.__drizzle_migrations') AS b`;
  console.log('  drizzle.__drizzle_migrations :', j[0].a);
  console.log('  public.__drizzle_migrations  :', j[0].b);

  const out = { captured_at: new Date().toISOString(), declared_tables: declared, present, absent, enums };
  fs.writeFileSync('D:/AI-Workspace/runtime/hermes-native/workspace/house-r15/d0-drift.json', JSON.stringify(out, null, 2));
} catch (e) {
  console.error('ERR:', e.message);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
