import { createRateLimiter } from './vendor/module-hub/rate-limit/core/limiter.ts';

export function createPostgresIssuerStore(sql) {
  const rateLimiter = createRateLimiter({ store: {
    async consume({ key, limit, windowMs, now }) {
      const [row] = await sql`
        select allowed, remaining, reset_at as "resetAt"
        from wstera_platform_internal.consume_runtime_issuer_rate_limit(
          ${key}, ${limit}, ${Math.floor(windowMs / 1000)}, ${new Date(now).toISOString()})`;
      if (!row) throw new Error('rate_limit_store_no_result');
      const resetAt = new Date(row.resetAt).getTime();
      return { allowed: row.allowed, currentCount: row.allowed ? limit - row.remaining : limit,
        windowStart: resetAt - windowMs, resetAt };
    },
  } });
  return {
    async loadClient(clientId) {
      const [row] = await sql`
        select client_id as "clientId", product_code as "productCode", project_ref as "projectRef", auth_user_id as "authUserId",
          runtime_role as "runtimeRole", secret_salt as "secretSalt", secret_hash as "secretHash", enabled
        from wstera_platform_internal.runtime_issuer_clients
        where client_id = ${clientId} and expires_at > now()
        limit 1`;
      return row ?? null;
    },
    async consumeRateLimit(key, { limit, windowSeconds, now }) {
      const result = await rateLimiter.check({ key, limit, windowMs: windowSeconds * 1000, now: now.getTime() });
      return { allowed: result.allowed, remaining: result.remaining,
        resetAt: new Date(result.resetAt).toISOString() };
    },
    async appendAudit({ at, productCode, result, reason }) {
      await sql`
        insert into wstera_platform_internal.runtime_issuer_audit(at, product_code, result, reason_code)
        values (${at}, ${productCode}, ${result}, ${reason})`;
    },
  };
}
