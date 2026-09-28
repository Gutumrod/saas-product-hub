import postgres from 'postgres';
import { createAuditLog } from './vendor/module-hub/audit-log/core/index.ts';
import { createIssuerHandler } from './issuer.mjs';
import { createPostgresIssuerStore } from './postgres-store.mjs';

export default {
  async fetch(request, env) {
    if (!env.HYPERDRIVE?.connectionString || !env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY
      || !env.BK01_AUTH_EMAIL || !env.BK01_AUTH_PASSWORD) {
      return new Response(JSON.stringify({ error: 'unavailable' }), {
        status: 503, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
      });
    }
    const sql = postgres(env.HYPERDRIVE.connectionString, { max: 1, fetch_types: false, prepare: true });
    try {
      const store = createPostgresIssuerStore(sql);
      const audit = createAuditLog({ store: {
        async append(record) {
          const metadata = record.metadata ?? {};
          await sql`insert into wstera_platform_internal.runtime_issuer_audit(at,product_code,result,reason_code)
            values (${record.timestamp},${record.entity.id},${metadata.result},${metadata.reason_code})`;
        },
        async query() { throw new Error('audit_query_not_available_in_issuer'); },
      } });
      return await createIssuerHandler({ store, recordAudit: (entry) => audit.record({
        actor: { type: 'service' }, action: `runtime_token.${entry.result}`,
        entity: { type: 'product', id: entry.productCode },
        timestamp: entry.at, metadata: { result: entry.result, reason_code: entry.reason },
      }) })(request, env);
    } finally {
      await sql.end({ timeout: 1 });
    }
  },
};
