const MAX_BODY_BYTES = 512;
const MAX_TOKEN_SECONDS = 300;

const json = (status, body, headers = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
});

function decodeBasic(value) {
  if (!value?.startsWith('Basic ')) return null;
  try {
    const decoded = atob(value.slice(6));
    const split = decoded.indexOf(':');
    if (split <= 0) return null;
    return { clientId: decoded.slice(0, split), secret: decoded.slice(split + 1) };
  } catch {
    return null;
  }
}

function decodeJwt(token) {
  const segments = token.split('.');
  if (segments.length !== 3) return null;
  try {
    const base64 = segments[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')));
  } catch {
    return null;
  }
}

function bytesEqual(left, right) {
  if (left.length !== right.length) return false;
  let different = 0;
  for (let index = 0; index < left.length; index += 1) different |= left[index] ^ right[index];
  return different === 0;
}

async function verifyClientSecret(secret, salt, expectedHash, cryptoImpl = crypto) {
  if (!secret || !salt || !expectedHash) return false;
  const key = await cryptoImpl.subtle.importKey('raw', new TextEncoder().encode(secret), 'PBKDF2', false, ['deriveBits']);
  const derived = new Uint8Array(await cryptoImpl.subtle.deriveBits({
    name: 'PBKDF2', hash: 'SHA-256', salt: new Uint8Array(salt), iterations: 210_000,
  }, key, expectedHash.length * 8));
  return bytesEqual(derived, new Uint8Array(expectedHash));
}

function clientIp(request) {
  const value = request.headers.get('cf-connecting-ip') || '';
  return /^[0-9a-fA-F:.]{2,64}$/.test(value) ? value : 'unknown';
}

export function createIssuerHandler({ store, recordAudit, authFetch = fetch, clock = () => Date.now(), cryptoImpl = crypto }) {
  const audit = async (productCode, result, reason) => {
    if (recordAudit) {
      const recorded = await recordAudit({ at: new Date(clock()).toISOString(), productCode, result, reason });
      if (recorded?.success === false) throw new Error('audit_record_failed');
      return;
    }
    await store.appendAudit({ at: new Date(clock()).toISOString(), productCode, result, reason });
  };
  return async function handle(request, env) {
    if (request.method !== 'POST' || new URL(request.url).pathname !== '/v1/runtime-tokens') {
      return json(404, { error: 'not_found' });
    }
    if (Number(request.headers.get('content-length') || 0) > MAX_BODY_BYTES) return json(413, { error: 'request_too_large' });
    const auth = decodeBasic(request.headers.get('authorization'));
    if (!auth) return json(401, { error: 'unauthorized' }, { 'www-authenticate': 'Basic realm="wstera-runtime"' });

    try {
      const ipLimit = await store.consumeRateLimit(`issuer-ip:${clientIp(request)}`, {
        limit: 60, windowSeconds: 60, now: new Date(clock()),
      });
      if (!ipLimit.allowed) return json(429, { error: 'rate_limited' });
    } catch { return json(503, { error: 'unavailable' }); }

    let client;
    try { client = await store.loadClient(auth.clientId); }
    catch {
      return json(503, { error: 'unavailable' });
    }
    if (!client?.enabled) return json(401, { error: 'unauthorized' });

    const deny = async (status, reason) => {
      try { await audit(client.productCode, 'denied', reason); }
      catch { return json(503, { error: 'unavailable' }); }
      return json(status, { error: status === 429 ? 'rate_limited' : status >= 500 ? 'unavailable' : 'unauthorized' });
    };
    try {
      const clientLimit = await store.consumeRateLimit(`issuer-client:${client.clientId}:${clientIp(request)}`, {
        limit: 10, windowSeconds: 60, now: new Date(clock()),
      });
      if (!clientLimit.allowed) return deny(429, 'rate_limited');
    } catch { return deny(503, 'rate_limit_store_error'); }

    let secretOk = false;
    try { secretOk = await verifyClientSecret(auth.secret, client.secretSalt, client.secretHash, cryptoImpl); }
    catch { return deny(503, 'verifier_error'); }
    if (!secretOk) return deny(401, 'invalid_client');

    let payload;
    try {
      const bytes = await request.arrayBuffer();
      if (bytes.byteLength > MAX_BODY_BYTES) return deny(413, 'request_too_large');
      payload = JSON.parse(new TextDecoder().decode(bytes));
    } catch { return deny(400, 'invalid_json'); }
    if (!payload || Object.keys(payload).some((key) => key !== 'audience')
      || payload.audience !== `supabase:${client.projectRef}`) {
      return deny(400, 'invalid_audience');
    }
    if (!['bk01_runtime'].includes(client.runtimeRole) || client.productCode !== 'bk01') {
      return deny(403, 'role_not_allowlisted');
    }
    if (!env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY || !env.BK01_AUTH_EMAIL || !env.BK01_AUTH_PASSWORD) {
      return deny(503, 'issuer_config_missing');
    }

    let upstream;
    try {
      const endpoint = new URL('/auth/v1/token?grant_type=password', env.SUPABASE_URL);
      upstream = await authFetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json', apikey: env.SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ email: env.BK01_AUTH_EMAIL, password: env.BK01_AUTH_PASSWORD }),
        signal: AbortSignal.timeout(8_000),
      });
    } catch { return deny(503, 'auth_unavailable'); }
    if (!upstream.ok) return deny(503, 'auth_rejected');

    let authResult;
    try { authResult = await upstream.json(); }
    catch { return deny(503, 'auth_invalid_response'); }
    const token = typeof authResult?.access_token === 'string' ? authResult.access_token : '';
    const claims = decodeJwt(token);
    const nowSeconds = Math.floor(clock() / 1000);
    const expiresIn = Number(claims?.exp) - nowSeconds;
    const expectedIssuer = new URL('/auth/v1', env.SUPABASE_URL).toString().replace(/\/$/, '');
    if (!claims || claims.role !== client.runtimeRole || claims.sub !== client.authUserId || claims.iss !== expectedIssuer
      || claims.aud !== 'authenticated' || !Number.isInteger(claims.exp)
      || expiresIn <= 0 || expiresIn > MAX_TOKEN_SECONDS || !claims.sub) {
      return deny(503, 'auth_claims_rejected');
    }

    try { await audit(client.productCode, 'issued', 'ok'); }
    catch { return json(503, { error: 'unavailable' }); }
    return json(200, { access_token: token, token_type: 'Bearer', expires_in: expiresIn });
  };
}

export { decodeJwt, verifyClientSecret };
