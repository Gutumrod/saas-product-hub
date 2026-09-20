/**
 * R15 — D0.4 topology completion (READ-ONLY).
 *
 * The first pass showed billing_core / billing_core_staging absent from Project A. The Owner's
 * P4/U4 determination requires establishing WHERE they actually live before concluding, so this
 * enumerates every schema in this database and every database reachable on this server.
 * SELECT-only. No credential value is printed.
 */
import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';

const ENV = path.resolve('D:/AI-Workspace/projects/saas-product-hub/apps/hub-web/.env');
const url = fs.readFileSync(ENV, 'utf8').split(/\r?\n/)
  .find(l => l.startsWith('DATABASE_URL='))?.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
if (!url) { console.error('no DATABASE_URL'); process.exit(1); }

const sql = postgres(url, { prepare: false, ssl: 'require', max: 1, idle_timeout: 5, connect_timeout: 20 });
const out = [];
const rec = (l, v) => { out.push([l, v]); console.log(`[D0.4] ${l}: ${JSON.stringify(v)}`); };

try {
  console.log('--- every schema in this database (name + owner + object count) ---');
  const schemas = await sql`
    SELECT n.nspname AS schema,
           pg_get_userbyid(n.nspowner) AS owner,
           (SELECT count(*)::int FROM pg_class c WHERE c.relnamespace = n.oid) AS objects,
           (SELECT count(*)::int FROM pg_class c WHERE c.relnamespace = n.oid AND c.relkind IN ('r','p')) AS tables
    FROM pg_namespace n
    WHERE n.nspname NOT LIKE 'pg\\_%' AND n.nspname <> 'information_schema'
    ORDER BY n.nspname`;
  rec('all_schemas', schemas);

  const billingish = schemas.filter(s => /billing|core|payment|stripe|entitle/i.test(s.schema));
  rec('billingish_schemas', billingish);

  console.log('--- databases on this server ---');
  const dbs = await sql`SELECT datname, pg_get_userbyid(datdba) AS owner FROM pg_database WHERE datistemplate = false ORDER BY datname`;
  rec('databases', dbs);

  console.log('--- where the deny boundary actually lives: search every schema for billing tables ---');
  const t = await sql`
    SELECT n.nspname AS schema, c.relname AS name, c.relkind,
           (SELECT count(*)::bigint FROM pg_class x WHERE x.oid = c.oid) AS _x
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind IN ('r','p')
      AND (c.relname ~* 'billing|entitle|subscription|invoice|payment|stripe')
    ORDER BY n.nspname, c.relname`;
  rec('tables_matching_billing_names', t);

  const anyPublic = await sql`
    SELECT n.nspname AS schema, c.relname AS name
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('r','p') ORDER BY c.relname`;
  rec('public_tables', anyPublic);

  fs.writeFileSync(
    'D:/AI-Workspace/runtime/hermes-native/workspace/house-r15/d0-topology.json',
    JSON.stringify({ captured_at: new Date().toISOString(), records: out }, null, 2));
} catch (e) {
  console.error('ERR:', e.message);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
