import test from 'node:test';
import assert from 'node:assert/strict';
import { createIssuerHandler } from '../issuer.mjs';

const secret = 'client-secret-fixture';
const salt = crypto.getRandomValues(new Uint8Array(16));
const imported = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), 'PBKDF2', false, ['deriveBits']);
const secretHash = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 210_000 }, imported, 256));
const claims = (overrides = {}) => ({ role: 'bk01_runtime', aud: 'authenticated', iss: 'https://lab.example/auth/v1',
  exp: 1_800_000_250, sub: 'user-fixture', ...overrides });
const token = (payload) => `e30.${btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')}.sig`;
const env = { SUPABASE_URL: 'https://lab.example', SUPABASE_PUBLISHABLE_KEY: 'publishable-fixture',
  BK01_AUTH_EMAIL: 'runtime@example.invalid', BK01_AUTH_PASSWORD: 'password-fixture' };

function fixture({ role = 'bk01_runtime', enabled = true, limitAllowed = true, authClaims = claims(), auditFails = false } = {}) {
  const audit = [];
  let authCalls = 0;
  const store = {
    async loadClient(clientId) { return { clientId, productCode: 'bk01', projectRef: 'abcdefghijklmnopqrst', authUserId: 'user-fixture', runtimeRole: role,
      enabled, secretSalt: salt, secretHash }; },
    async consumeRateLimit() { return { allowed: limitAllowed }; },
    async appendAudit(entry) { if (auditFails) throw new Error('audit_offline'); audit.push(entry); },
  };
  const handler = createIssuerHandler({ store, clock: () => 1_800_000_000_000,
    authFetch: async () => { authCalls += 1; return Response.json({ access_token: token(authClaims), refresh_token: 'must-not-escape' }); } });
  const request = new Request('https://issuer.example/v1/runtime-tokens', { method: 'POST',
    headers: { authorization: `Basic ${btoa(`bk01-client:${secret}`)}`, 'content-type': 'application/json', 'cf-connecting-ip': '192.0.2.1' },
    body: JSON.stringify({ audience: 'supabase:abcdefghijklmnopqrst' }) });
  return { handler, request, audit, authCalls: () => authCalls };
}

test('issues only short-lived allowlisted Auth token and returns no refresh token', async () => {
  const fx = fixture();
  const response = await fx.handler(fx.request, env);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.expires_in, 250);
  assert.equal(body.token_type, 'Bearer');
  assert.equal('refresh_token' in body, false);
  assert.deepEqual(fx.audit.map(({ productCode, result, reason }) => ({ productCode, result, reason })),
    [{ productCode: 'bk01', result: 'issued', reason: 'ok' }]);
  assert.equal(JSON.stringify(fx.audit).includes(secret), false);
});

test('rejects a runtime role outside the allowlist before contacting Auth', async () => {
  const fx = fixture({ role: 'service_role' });
  const response = await fx.handler(fx.request, env);
  assert.equal(response.status, 403);
  assert.equal(fx.authCalls(), 0);
});

test('rejects an Auth token with lifetime greater than five minutes', async () => {
  const fx = fixture({ authClaims: claims({ exp: 1_800_000_301 }) });
  const response = await fx.handler(fx.request, env);
  assert.equal(response.status, 503);
  assert.equal(fx.audit.at(-1).reason, 'auth_claims_rejected');
});

test('rate limit is atomic gate before password-grant call', async () => {
  const fx = fixture({ limitAllowed: false });
  const response = await fx.handler(fx.request, env);
  assert.equal(response.status, 429);
  assert.equal(fx.authCalls(), 0);
});

test('missing Auth secrets fail closed without issuing a token', async () => {
  const fx = fixture();
  const response = await fx.handler(fx.request, { ...env, BK01_AUTH_PASSWORD: '' });
  assert.equal(response.status, 503);
  assert.equal(fx.authCalls(), 0);
});

test('audit failure blocks token delivery', async () => {
  const fx = fixture({ auditFails: true });
  const response = await fx.handler(fx.request, env);
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error, 'unavailable');
});
