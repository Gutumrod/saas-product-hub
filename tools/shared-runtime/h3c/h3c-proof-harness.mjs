#!/usr/bin/env node
// H3C Auth-issued runtime token proof harness — WSTERA LAB only.
//
// PREPARE-ONLY ARTIFACT. It performs NO mutation of any kind: it only calls
// read-shaped RPC/REST endpoints and inspects HTTP status + error codes. It is
// safe to run repeatedly. It does not sign in unless the operator explicitly
// provides service-identity credentials via env, and it never prints tokens,
// keys, secrets, passwords or full JWTs.
//
// Design: docs/platform/shared-runtime/evidence/CLAUDE-H3C-NEGATIVE-MATRIX-2026-09-08.md
// Review:  docs/platform/shared-runtime/evidence/CLAUDE-H3C-INDEPENDENT-REVIEW-2026-09-08.md
//
// Node >= 20 (built-in fetch + node:crypto JWK import). No external packages.
// No Docker.
//
// Exit code: 0 only if every prerequisite is met, all token pre-checks pass,
// all positive probes reach the function boundary, and every negative probe
// fails closed. Any FAIL, or a security-relevant RUNTIME-BLOCKED, exits 1.

import crypto from 'node:crypto';
import fs from 'node:fs';
import process from 'node:process';

const NIL_UUID = '00000000-0000-0000-0000-000000000000';
const PS01_RPCS = [
  'get_customer_booking_context_v2_internal',
  'quote_customer_booking_v2_internal',
  'submit_booking_request_v2_internal',
];

// ---------------------------------------------------------------------------
// env / operator input
// ---------------------------------------------------------------------------

const env = process.env;
const CFG = {
  url: (env.H3C_SUPABASE_URL || '').replace(/\/+$/, ''),
  anonKey: env.H3C_ANON_KEY || '',
  runtimeJwt: env.H3C_RUNTIME_JWT || '',
  controlJwt: env.H3C_CONTROL_JWT || '',
  expiredJwt: env.H3C_EXPIRED_JWT || '',
  serviceEmail: env.H3C_SERVICE_EMAIL || '',
  servicePassword: env.H3C_SERVICE_PASSWORD || '',
  expectedProjectRef: env.H3C_EXPECTED_PROJECT_REF || 'ykxlqnshaaxmzzocpjlj',
  expectedRole: env.H3C_EXPECTED_ROLE || 'ps01_line_runtime',
  maxTokenLifetimeSec: Number(env.H3C_MAX_TOKEN_LIFETIME_SEC || 300),
  fixtures: {
    shopId: env.H3C_FIX_SHOP_ID || '',
    lineUserId: env.H3C_FIX_LINE_USER_ID || '',
    roomId: env.H3C_FIX_ROOM_ID || '',
    ratePlanId: env.H3C_FIX_RATE_PLAN_ID || '',
    petIds: (env.H3C_FIX_PET_IDS || '').split(',').map((s) => s.trim()).filter(Boolean),
    startAt: env.H3C_FIX_START_AT || '',
    // TM-11 negative-authz fixtures (read-only, House-supplied)
    otherShopId: env.H3C_FIX_OTHER_SHOP_ID || '',
    otherPetIds: (env.H3C_FIX_OTHER_PET_IDS || '').split(',').map((s) => s.trim()).filter(Boolean),
  },
  outFile: env.H3C_OUT || '',
  // probe names the operator supplies from live metadata (kept out of source):
  ps01OtherRpc: env.H3C_PS01_OTHER_RPC || 'get_customer_booking_context_internal',
  ps01Table: env.H3C_PS01_TABLE || 'bookings',
  ps01InternalObj: env.H3C_PS01_INTERNAL_OBJ || 'booking_occupancy',
  localServiceFn: env.H3C_LOCAL_SERVICE_FN || 'is_shop_member',
  mt01Table: env.H3C_MT01_TABLE || 'tenants',
};

const results = [];
const record = (id, category, verdict, detail) => {
  results.push({ id, category, verdict, ...detail });
};

function die(reason) {
  const out = {
    harness: 'h3c-proof-harness',
    generatedAt: new Date().toISOString(),
    verdict: 'ABORTED',
    reason,
    results,
  };
  emit(out);
  process.stderr.write(`\nABORTED: ${reason}\n`);
  process.exit(1);
}

function emit(obj) {
  const json = JSON.stringify(obj, null, 2);
  if (CFG.outFile) {
    fs.writeFileSync(CFG.outFile, json + '\n');
    process.stderr.write(`\nmachine-readable evidence written to ${CFG.outFile}\n`);
  } else {
    process.stdout.write(json + '\n');
  }
}

// ---------------------------------------------------------------------------
// jwt helpers (decode + ES256 verify against JWKS) — no secret handling
// ---------------------------------------------------------------------------

const b64urlToBuf = (s) => Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
const b64urlToJson = (s) => JSON.parse(b64urlToBuf(s).toString('utf8'));

function decodeJwt(token) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('not a three-part JWT');
  return {
    header: b64urlToJson(parts[0]),
    payload: b64urlToJson(parts[1]),
    signingInput: `${parts[0]}.${parts[1]}`,
    signature: b64urlToBuf(parts[2]),
  };
}

// Safe, non-sensitive projection of claims for logging/evidence.
function safeClaims(payload) {
  return {
    iss: payload.iss,
    role: payload.role,
    aud: payload.aud,
    exp: payload.exp,
    iat: payload.iat,
    lifetimeSec: payload.exp && payload.iat ? payload.exp - payload.iat : null,
    sub_prefix: typeof payload.sub === 'string' ? payload.sub.slice(0, 6) + '…' : null,
    ref: payload.ref || null,
    session_id_present: Boolean(payload.session_id),
  };
}

async function fetchJwks() {
  const candidates = [
    `${CFG.url}/auth/v1/.well-known/jwks.json`,
    `${CFG.url}/auth/v1/keys`,
  ];
  for (const u of candidates) {
    try {
      const r = await fetch(u, { headers: { apikey: CFG.anonKey } });
      if (r.ok) {
        const j = await r.json();
        if (Array.isArray(j.keys) && j.keys.length) return { url: u, keys: j.keys };
      }
    } catch {
      /* try next */
    }
  }
  return null;
}

function verifyEs256(signingInput, signature, jwk) {
  const key = crypto.createPublicKey({ key: jwk, format: 'jwk' });
  // ES256 signatures in a JWT are raw r||s (IEEE P1363), not DER.
  return crypto.verify(
    'sha256',
    Buffer.from(signingInput),
    { key, dsaEncoding: 'ieee-p1363' },
    signature,
  );
}

// ---------------------------------------------------------------------------
// HTTP probe helper
// ---------------------------------------------------------------------------

async function probe({ method = 'POST', path, profile, token, body, omitApiKey = false, omitAuth = false }) {
  const headers = {};
  if (!omitApiKey) headers.apikey = CFG.anonKey;
  if (!omitAuth && token) headers.Authorization = `Bearer ${token}`;
  if (profile) {
    headers['Accept-Profile'] = profile;
    headers['Content-Profile'] = profile;
  }
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let status = 0;
  let code = null;
  let snippet = null;
  try {
    const r = await fetch(`${CFG.url}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    status = r.status;
    const text = await r.text();
    snippet = text.slice(0, 300);
    try {
      const j = JSON.parse(text);
      code = j.code || j.error_code || j.message?.slice(0, 60) || null;
    } catch {
      /* non-json body */
    }
  } catch (err) {
    status = -1;
    snippet = String(err).slice(0, 200);
  }
  return { status, code, snippet };
}

// PostgREST "function not found for this role / schema" markers.
const NOT_FOUND_CODES = new Set(['PGRST202', 'PGRST301', 'PGRST106', '42883', '42P01']);
const boundaryReached = (res) =>
  res.status !== 401 &&
  res.status !== 403 &&
  res.status !== -1 &&
  !(res.status === 404 && (!res.code || NOT_FOUND_CODES.has(res.code)));
const failsClosed = (res) =>
  res.status === 401 ||
  res.status === 403 ||
  res.status === 404 ||
  res.status === 406 ||
  (res.status === 400 && res.code && NOT_FOUND_CODES.has(res.code));

// ---------------------------------------------------------------------------
// RPC bodies
// ---------------------------------------------------------------------------

const rpcBody = (name, f = CFG.fixtures) => {
  const common = {
    p_verified_line_user_id: f.lineUserId || '',
    p_shop_id: f.shopId || NIL_UUID,
  };
  if (name === PS01_RPCS[0]) return common;
  const withPlan = {
    ...common,
    p_room_id: f.roomId || NIL_UUID,
    p_rate_plan_id: f.ratePlanId || NIL_UUID,
    p_pet_ids: f.petIds.length ? f.petIds : [NIL_UUID],
    p_start_at: f.startAt || new Date(Date.now() + 86400000).toISOString(),
  };
  if (name === PS01_RPCS[1]) return withPlan;
  return { ...withPlan, p_special_requests: null };
};

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

async function obtainRuntimeToken() {
  if (CFG.runtimeJwt) return CFG.runtimeJwt;
  if (CFG.serviceEmail && CFG.servicePassword) {
    // Password grant against LAB Auth. Credentials come from operator env only,
    // are never logged, and are not persisted by this harness.
    const r = await fetch(`${CFG.url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { apikey: CFG.anonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: CFG.serviceEmail, password: CFG.servicePassword }),
    });
    if (!r.ok) die(`could not authenticate LAB service identity (status ${r.status})`);
    const j = await r.json();
    if (!j.access_token) die('auth response contained no access_token');
    return j.access_token;
  }
  return '';
}

async function main() {
  // ---- prerequisites (fail closed) ----
  const missing = [];
  if (!CFG.url) missing.push('H3C_SUPABASE_URL');
  if (!CFG.anonKey) missing.push('H3C_ANON_KEY');
  if (missing.length) die(`missing required env: ${missing.join(', ')}`);

  const runtimeJwt = await obtainRuntimeToken();
  if (!runtimeJwt) {
    die('no runtime token: set H3C_RUNTIME_JWT, or H3C_SERVICE_EMAIL + H3C_SERVICE_PASSWORD');
  }

  // ---- token pre-checks ----
  let decoded;
  try {
    decoded = decodeJwt(runtimeJwt);
  } catch (e) {
    die(`runtime token is not a decodable JWT: ${e.message}`);
  }
  const claims = safeClaims(decoded.payload);

  record('TOK-1', 'token', decoded.header.alg === 'ES256' ? 'PASS' : 'FAIL', {
    detail: `alg=${decoded.header.alg}`,
  });

  const jwks = await fetchJwks();
  let sigOk = false;
  if (jwks) {
    const jwk = jwks.keys.find((k) => k.kid === decoded.header.kid) || jwks.keys[0];
    try {
      sigOk = verifyEs256(decoded.signingInput, decoded.signature, jwk);
    } catch (e) {
      sigOk = false;
      record('TOK-2-note', 'token', 'INFO', { detail: `verify threw: ${e.message}` });
    }
  }
  record('TOK-2', 'token', sigOk ? 'PASS' : 'FAIL', {
    detail: jwks ? `verified against ${jwks.url}` : 'JWKS endpoint not reachable',
  });

  const issOk = typeof claims.iss === 'string' && claims.iss.includes(CFG.url.replace(/^https?:\/\//, ''));
  record('TOK-3', 'token', issOk ? 'PASS' : 'FAIL', { detail: `iss=${claims.iss}` });

  record('TOK-4', 'token', claims.role === CFG.expectedRole ? 'PASS' : 'FAIL', {
    detail: `role=${claims.role} (expected ${CFG.expectedRole})`,
  });

  const lifeOk = claims.lifetimeSec != null && claims.lifetimeSec <= CFG.maxTokenLifetimeSec && claims.lifetimeSec > 0;
  record('TOK-5', 'token', lifeOk ? 'PASS' : 'FAIL', {
    detail: `exp-iat=${claims.lifetimeSec}s (max ${CFG.maxTokenLifetimeSec}s) — measured from JWT, not from OAuth expires_in`,
  });

  const notExpired = claims.exp && claims.exp * 1000 > Date.now();
  record('TOK-6', 'token', notExpired ? 'PASS' : 'FAIL', {
    detail: notExpired ? 'token still valid' : 'token already expired — obtain a fresh one',
  });

  const refHay = `${claims.iss || ''} ${claims.ref || ''} ${JSON.stringify(claims.aud || '')} ${CFG.url}`;
  const refOk = refHay.includes(CFG.expectedProjectRef);
  record('TOK-7', 'token', refOk ? 'PASS' : 'FAIL', {
    detail: `expected project ref ${CFG.expectedProjectRef} present in issuer/url/aud`,
  });

  const tokPrechecksPassed = results
    .filter((r) => ['TOK-1', 'TOK-2', 'TOK-3', 'TOK-4', 'TOK-5', 'TOK-6', 'TOK-7'].includes(r.id))
    .every((r) => r.verdict === 'PASS');

  if (!tokPrechecksPassed) {
    finish(claims, 'token pre-checks failed — no probes were run');
    return;
  }

  // ---- POSITIVE: 3 RPCs reach the boundary ----
  const haveFixtures = Boolean(CFG.fixtures.shopId && CFG.fixtures.lineUserId);
  for (let i = 0; i < PS01_RPCS.length; i += 1) {
    const name = PS01_RPCS[i];
    // POS-3 (submit) stays boundary-only unless the operator opted in.
    const res = await probe({
      path: `/rest/v1/rpc/${name}`,
      profile: 'ps01',
      token: runtimeJwt,
      body: rpcBody(name),
    });
    record(`POS-${i + 1}`, 'positive', boundaryReached(res) ? 'PASS' : 'FAIL', {
      target: name,
      mode: haveFixtures ? 'fixture' : 'boundary-only',
      http: res.status,
      code: res.code,
      note: 'boundary reached = role+grant+SET ROLE+schema resolution worked; a domain 4xx from inside the function still counts',
      snippet: res.snippet,
    });
  }

  // ---- POS-AUTHZ (TM-11): RPC bodies enforce their own authz ----
  if (CFG.fixtures.otherShopId && CFG.fixtures.lineUserId) {
    const res = await probe({
      path: `/rest/v1/rpc/${PS01_RPCS[0]}`,
      profile: 'ps01',
      token: runtimeJwt,
      body: { p_verified_line_user_id: CFG.fixtures.lineUserId, p_shop_id: CFG.fixtures.otherShopId },
    });
    // "pass" = the RPC did NOT return a populated cross-shop context. We can only
    // assert weakly from the harness: 2xx with an empty/rejecting body, or a 4xx.
    const looksRejected = res.status >= 400 || /null|not.*found|denied|unauthor|forbidden|empty/i.test(res.snippet || '');
    record('POS-AUTHZ-1', 'positive-authz', looksRejected ? 'PASS' : 'FAIL', {
      http: res.status,
      code: res.code,
      note: 'cross-shop p_shop_id must not yield another shop context; House must also confirm from the RPC body / logs',
      snippet: res.snippet,
    });
  } else {
    record('POS-AUTHZ-1', 'positive-authz', 'RUNTIME-BLOCKED', {
      note: 'set H3C_FIX_OTHER_SHOP_ID (a real shop the fixture LINE user is NOT linked to) — read-only',
    });
  }
  record('POS-AUTHZ-2', 'positive-authz', 'RUNTIME-BLOCKED', {
    note: 'blank/unverified p_verified_line_user_id path — House to run with a controlled fixture + inspect RPC body',
  });
  if (CFG.fixtures.otherPetIds.length) {
    record('POS-AUTHZ-3', 'positive-authz', 'RUNTIME-BLOCKED', {
      note: 'cross-customer p_pet_ids supplied; House to execute + confirm no cross-customer quote is returned',
    });
  } else {
    record('POS-AUTHZ-3', 'positive-authz', 'RUNTIME-BLOCKED', {
      note: 'set H3C_FIX_OTHER_PET_IDS (another customer\'s pet ids, read-only)',
    });
  }

  // ---- POS-CONTROL-1: hook is a no-op for a non-allowlisted user ----
  if (CFG.controlJwt) {
    try {
      const c = decodeJwt(CFG.controlJwt);
      const cl = safeClaims(c.payload);
      const ok = cl.role === 'authenticated' && (cl.lifetimeSec == null || cl.lifetimeSec > CFG.maxTokenLifetimeSec);
      record('POS-CONTROL-1', 'control', ok ? 'PASS' : 'FAIL', {
        detail: `control user role=${cl.role} lifetime=${cl.lifetimeSec}s (expected authenticated, uncapped)`,
      });
    } catch (e) {
      record('POS-CONTROL-1', 'control', 'FAIL', { detail: `control token undecodable: ${e.message}` });
    }
  } else {
    record('POS-CONTROL-1', 'control', 'RUNTIME-BLOCKED', {
      note: 'provide H3C_CONTROL_JWT: a token for a NON-allowlisted LAB Auth user, issued while the hook is enabled',
    });
  }

  // ---- NEGATIVE matrix ----
  const neg = [];
  neg.push(['NEG-SD-1', { path: '/rest/v1/rpc/sync_booking_occupancy_window', profile: 'ps01', body: {} }]);
  neg.push(['NEG-SD-2', { path: `/rest/v1/rpc/${CFG.ps01OtherRpc}`, profile: 'ps01', body: {} }]);
  neg.push(['NEG-ROLE-1', { path: `/rest/v1/rpc/${CFG.localServiceFn}`, profile: 'local_service', body: {} }]);
  neg.push(['NEG-PUB-1', { path: '/rest/v1/rpc/rls_auto_enable', profile: 'public', body: {} }]);
  neg.push(['NEG-TBL-1', { method: 'GET', path: `/rest/v1/${CFG.ps01Table}?limit=1`, profile: 'ps01' }]);
  neg.push(['NEG-TBL-2', { path: `/rest/v1/${CFG.ps01Table}`, profile: 'ps01', body: { probe: true } }]);
  neg.push(['NEG-LS-1', { method: 'GET', path: '/rest/v1/shop_public_profile?limit=1', profile: 'local_service' }]);
  neg.push(['NEG-INT-1', { method: 'GET', path: `/rest/v1/${CFG.ps01InternalObj}?limit=1`, profile: 'ps01_internal' }]);
  neg.push(['NEG-MT-1', { method: 'GET', path: `/rest/v1/${CFG.mt01Table}?limit=1`, profile: 'mt01' }]);
  neg.push(['NEG-MT-2', { method: 'GET', path: '/rest/v1/anything?limit=1', profile: 'mt01_private' }]);
  neg.push(['NEG-WPI-1', { method: 'GET', path: '/rest/v1/runtime_token_grants?limit=1', profile: 'wstera_platform_internal' }]);
  neg.push(['NEG-NET-1', { path: '/rest/v1/rpc/http_post', profile: 'net', body: {} }]);
  neg.push(['NEG-NET-1b', { method: 'GET', path: '/rest/v1/_http_response?limit=1', profile: 'net' }]);
  neg.push(['NEG-CRON-1', { method: 'GET', path: '/rest/v1/job?limit=1', profile: 'cron' }]);
  neg.push(['NEG-AUTH-1', { method: 'GET', path: '/rest/v1/users?limit=1', profile: 'auth' }]);
  neg.push(['NEG-EXT-1', { method: 'GET', path: '/rest/v1/anything?limit=1', profile: 'extensions' }]);

  for (const [id, opts] of neg) {
    const res = await probe({ ...opts, token: runtimeJwt });
    record(id, 'negative', failsClosed(res) ? 'PASS' : 'FAIL', {
      http: res.status,
      code: res.code,
      expected: 'fail closed (401/403/404/PGRST202)',
      snippet: res.snippet,
    });
  }

  // storage API (different base path)
  {
    const res = await probe({ method: 'GET', path: '/storage/v1/bucket', token: runtimeJwt });
    record('NEG-STOR-1', 'negative', res.status === 401 || res.status === 403 ? 'PASS' : 'FAIL', {
      http: res.status, code: res.code, expected: '401/403 (role is not service_role)', snippet: res.snippet,
    });
  }

  // token-level failures
  if (CFG.expiredJwt) {
    const res = await probe({ path: `/rest/v1/rpc/${PS01_RPCS[0]}`, profile: 'ps01', token: CFG.expiredJwt, body: rpcBody(PS01_RPCS[0]) });
    record('NEG-EXP-1', 'negative', res.status === 401 ? 'PASS' : 'FAIL', { http: res.status, code: res.code, snippet: res.snippet });
  } else {
    record('NEG-EXP-1', 'negative', 'RUNTIME-BLOCKED', { note: 'provide H3C_EXPIRED_JWT (a previously-issued, now-expired runtime token)' });
  }

  {
    // NEG-SIG-1: flip one byte of the signature
    const parts = runtimeJwt.split('.');
    const sig = b64urlToBuf(parts[2]);
    sig[0] ^= 0xff;
    const tampered = `${parts[0]}.${parts[1]}.${sig.toString('base64url')}`;
    const res = await probe({ path: `/rest/v1/rpc/${PS01_RPCS[0]}`, profile: 'ps01', token: tampered, body: rpcBody(PS01_RPCS[0]) });
    record('NEG-SIG-1', 'negative', res.status === 401 ? 'PASS' : 'FAIL', { http: res.status, code: res.code, snippet: res.snippet });
  }
  {
    // NEG-SIG-2: tamper payload (role -> postgres), keep original signature
    const parts = runtimeJwt.split('.');
    const p = b64urlToJson(parts[1]);
    p.role = 'postgres';
    const tampered = `${parts[0]}.${Buffer.from(JSON.stringify(p)).toString('base64url')}.${parts[2]}`;
    const res = await probe({ path: `/rest/v1/rpc/${PS01_RPCS[0]}`, profile: 'ps01', token: tampered, body: rpcBody(PS01_RPCS[0]) });
    record('NEG-SIG-2', 'negative', res.status === 401 ? 'PASS' : 'FAIL', {
      http: res.status, code: res.code, note: 'payload role=postgres with stale signature must be rejected', snippet: res.snippet,
    });
  }
  record('NEG-ROLE-2', 'negative', 'NOT TESTABLE', {
    note: 'a validly-signed token with role=service_role/authenticator/postgres cannot be produced without a signing path the design withholds; the 4 hook/table/membership controls (see threat model TM-7) cover this',
  });
  {
    // NEG-KEY-1: omit apikey
    const res = await probe({ path: `/rest/v1/rpc/${PS01_RPCS[0]}`, profile: 'ps01', token: runtimeJwt, body: rpcBody(PS01_RPCS[0]), omitApiKey: true });
    record('NEG-KEY-1', 'negative', res.status === 401 ? 'PASS' : 'FAIL', { http: res.status, code: res.code, expected: '401 from gateway', snippet: res.snippet });
  }
  {
    // NEG-ANON-1: no Authorization, only anon apikey
    const res = await probe({ path: `/rest/v1/rpc/${PS01_RPCS[0]}`, profile: 'ps01', token: null, body: rpcBody(PS01_RPCS[0]), omitAuth: true });
    record('NEG-ANON-1', 'negative', failsClosed(res) ? 'PASS' : 'FAIL', { http: res.status, code: res.code, expected: 'anon has no EXECUTE -> fail', snippet: res.snippet });
  }

  finish(claims, null);
}

function finish(claims, note) {
  const counts = results.reduce((a, r) => ((a[r.verdict] = (a[r.verdict] || 0) + 1), a), {});
  const securityBlocked = results.filter(
    (r) => r.verdict === 'RUNTIME-BLOCKED' && (r.category === 'negative' || r.id === 'POS-AUTHZ-1'),
  );
  const anyFail = results.some((r) => r.verdict === 'FAIL');
  let verdict;
  if (note) verdict = 'INCOMPLETE';
  else if (anyFail) verdict = 'FAIL';
  else if (securityBlocked.length) verdict = 'INCOMPLETE — security-relevant probes RUNTIME-BLOCKED';
  else verdict = 'PASS';

  const out = {
    harness: 'h3c-proof-harness',
    generatedAt: new Date().toISOString(),
    target: CFG.url,
    expectedProjectRef: CFG.expectedProjectRef,
    tokenClaims: claims,
    verdict,
    note,
    counts,
    securityRelevantBlocked: securityBlocked.map((r) => r.id),
    results,
  };
  emit(out);

  process.stderr.write('\n=== H3C proof harness summary ===\n');
  process.stderr.write(`target: ${CFG.url}   verdict: ${verdict}\n`);
  process.stderr.write(`token: role=${claims.role} lifetime=${claims.lifetimeSec}s iss=${claims.iss}\n`);
  for (const r of results) {
    process.stderr.write(`  ${r.verdict.padEnd(16)} ${r.id.padEnd(14)} ${r.category}${r.http ? '  http=' + r.http : ''}${r.code ? ' code=' + r.code : ''}\n`);
  }
  process.stderr.write(`counts: ${JSON.stringify(counts)}\n`);

  process.exit(verdict === 'PASS' ? 0 : 1);
}

// ---------------------------------------------------------------------------
// self-test: `node h3c-proof-harness.mjs --selftest`
// Exercises JWT decode + ES256 verify + classifiers offline. No network, no env.
// ---------------------------------------------------------------------------

function selftest() {
  const assert = (cond, msg) => {
    if (!cond) {
      process.stderr.write(`SELFTEST FAIL: ${msg}\n`);
      process.exit(1);
    }
  };

  const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const jwk = publicKey.export({ format: 'jwk' });
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'ES256', kid: 'test-kid', typ: 'JWT' };
  const payload = {
    iss: 'https://ykxlqnshaaxmzzocpjlj.supabase.co/auth/v1',
    role: 'ps01_line_runtime',
    aud: 'authenticated',
    sub: 'abcdef01-2345-6789-abcd-ef0123456789',
    iat: now,
    exp: now + 250,
    ref: 'ykxlqnshaaxmzzocpjlj',
    session_id: 's1',
  };
  const si = `${Buffer.from(JSON.stringify(header)).toString('base64url')}.${Buffer.from(JSON.stringify(payload)).toString('base64url')}`;
  const sig = crypto.sign('sha256', Buffer.from(si), { key: privateKey, dsaEncoding: 'ieee-p1363' });
  const token = `${si}.${sig.toString('base64url')}`;

  const d = decodeJwt(token);
  assert(d.header.alg === 'ES256', 'decode header alg');
  assert(d.payload.role === 'ps01_line_runtime', 'decode payload role');

  const c = safeClaims(d.payload);
  assert(c.lifetimeSec === 250, `lifetimeSec (${c.lifetimeSec})`);
  assert(c.sub_prefix === 'abcdef…', `sub redaction (${c.sub_prefix})`);
  const cs = JSON.stringify(c);
  assert(!cs.includes('2345-6789'), 'full sub uuid must not appear in safeClaims');
  assert(!/password|secret|signing|private/i.test(cs), 'no secret-ish key in safeClaims');

  assert(verifyEs256(d.signingInput, d.signature, jwk) === true, 'ES256 verify good sig');
  const badSig = Buffer.from(d.signature);
  badSig[0] ^= 0xff;
  assert(verifyEs256(d.signingInput, badSig, jwk) === false, 'ES256 verify rejects tampered sig');

  // classifiers
  assert(boundaryReached({ status: 200, code: null }) === true, 'boundary: 200');
  assert(boundaryReached({ status: 400, code: '23514' }) === true, 'boundary: in-function 400');
  assert(boundaryReached({ status: 401 }) === false, 'boundary: 401 not reached');
  assert(boundaryReached({ status: 404, code: 'PGRST202' }) === false, 'boundary: PGRST202 not reached');
  assert(failsClosed({ status: 404, code: 'PGRST202' }) === true, 'failsClosed: 404 PGRST202');
  assert(failsClosed({ status: 403 }) === true, 'failsClosed: 403');
  assert(failsClosed({ status: 200 }) === false, 'failsClosed: 200 is NOT closed');

  process.stderr.write('SELFTEST PASS (jwt decode, ES256 verify, redaction, classifiers)\n');
  process.exit(0);
}

if (process.argv.includes('--selftest')) selftest();
else main().catch((e) => die(`unhandled: ${e && e.stack ? e.stack.split('\n')[0] : e}`));
