/**
 * R15 schema remediation — DRY RUN (per Codex's required per-file pattern).
 *
 *   BEGIN -> <one migration file> -> assertions -> ROLLBACK        (nothing persists)
 *
 * This proves the DDL is accepted by PostgreSQL 17.6 in a single transaction and that the
 * resulting shape matches drizzle/schema.ts. It is a READ-ONLY operation on the database's
 * persistent state: every transaction is deliberately rolled back.
 *
 * It does NOT apply anything. Applying requires the bounded Owner authorization.
 * Reads the credential from .env; never prints it.
 */
import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';

const HUB = 'D:/AI-Workspace/projects/saas-product-hub/apps/hub-web';
const WS = 'D:/AI-Workspace/runtime/hermes-native/workspace/house-r15';
const url = fs.readFileSync(path.join(HUB, '.env'), 'utf8').split(/\r?\n/)
  .find(l => l.startsWith('DATABASE_URL='))?.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
if (!url) { console.error('no DATABASE_URL'); process.exit(1); }

const files = [
  { name: '0007_shared_one_time_fulfillment.sql', src: path.join(HUB, 'drizzle/migrations/0007_shared_one_time_fulfillment.sql'),
    expect: ['fulfillment_records','fulfillment_recipients','fulfillment_deliveries','fulfillment_lifecycle_operations','fulfillment_audit'] },
  { name: '0008_product_installations.sql',      src: path.join(WS, '0008_product_installations.DRAFT.sql'),
    expect: ['product_installations'] },
];
const enumExpect = ['installation_status','installation_source','fulfillment_status','fulfillment_artifact_kind','fulfillment_delivery_status','fulfillment_lifecycle_operation'];

const sql = postgres(url, { prepare: false, ssl: 'require', max: 1, idle_timeout: 5, connect_timeout: 25 });

async function dryRun(f) {
  console.log(`\n=== DRY RUN: ${f.name} ===`);
  const ddl = fs.readFileSync(f.src, 'utf8');
  let ok = true;
  try {
    await sql.begin(async tx => {
      await tx.unsafe(ddl);
      console.log('  DDL accepted by PostgreSQL inside one transaction: YES');
      for (const t of f.expect) {
        const r = await tx`SELECT to_regclass(${'public.' + t}) AS r`;
        const present = !!r[0].r;
        if (!present) ok = false;
        console.log(`  table ${t.padEnd(34)} ${present ? 'created' : 'MISSING'}`);
        if (present) {
          const c = await tx`SELECT column_name, data_type, is_nullable, column_default
                             FROM information_schema.columns
                             WHERE table_schema='public' AND table_name=${t} ORDER BY ordinal_position`;
          console.log(`     cols=${c.length} -> ${c.map(x => x.column_name).join(', ')}`);
        }
      }
      for (const e of enumExpect) {
        const r = await tx`SELECT count(*)::int AS n FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace
                           WHERE t.typname=${e} AND n.nspname='public'`;
        if (r[0].n) {
          const v = await tx`SELECT enumlabel FROM pg_enum e JOIN pg_type t ON t.oid=e.enumtypid
                             JOIN pg_namespace n ON n.oid=t.typnamespace
                             WHERE t.typname=${e} AND n.nspname='public' ORDER BY enumsortorder`;
          console.log(`  enum  ${e.padEnd(34)} ${v.map(x => x.enumlabel).join('|')}`);
        }
      }
      // the FK/index the matrix and the webhook depend on
      if (f.expect.includes('product_installations')) {
        const fk = await tx`SELECT conname, pg_get_constraintdef(oid) AS def FROM pg_constraint
                            WHERE conrelid = 'public.product_installations'::regclass AND contype='f'`;
        for (const x of fk) console.log(`  FK    ${x.conname}: ${x.def}`);
        const ix = await tx`SELECT indexname FROM pg_indexes WHERE schemaname='public' AND tablename='product_installations'`;
        console.log(`  indexes: ${ix.map(x => x.indexname).join(', ')}`);
        const gr = await tx`SELECT has_table_privilege(current_user,'public.product_installations','INSERT') AS ins`;
        console.log(`  current_user can INSERT (for D1.2 grant planning): ${gr[0].ins}`);
      }
      throw new Error('__ABORT__');
    });
  } catch (e) {
    if (e.message === '__ABORT__') console.log('  transaction rolled back deliberately — nothing persisted');
    else { ok = false; console.log(`  ERROR: ${e.code || ''} ${e.message}`); }
  }
  console.log(`  RESULT: ${ok ? 'PASS' : 'FAIL'}`);
  return ok;
}

let allPass = true;
for (const f of files) {
  if (!fs.existsSync(f.src)) { console.log(`\n=== SKIP (missing): ${f.name} ===`); allPass = false; continue; }
  allPass = (await dryRun(f)) && allPass;
}
console.log(`\n=== DRY RUN TOTAL: ${allPass ? 'ALL PASS' : 'HAS FAILURES'} ===`);
console.log('Nothing was applied. Applying requires the bounded Owner authorization.');
await sql.end({ timeout: 5 });
