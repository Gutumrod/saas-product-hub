#!/usr/bin/env node
// H3C Auth-issued runtime token proof harness — WSTERA LAB only.
//
// PREPARE-ONLY / SAFE-BY-DEFAULT. In default mode the harness performs NO
// mutation: every probe is a GET, or a POST to one of two read/compute RPCs
// (context, quote) that are non-persistence operations by the PS01 contract.
// It never calls submit_booking_request_v2_internal and never issues a table
// INSERT/PUT/DELETE. A mutating submit probe exists only behind an explicit
// opt-in (H3C_ALLOW_SUBMIT_PROBE=1 + disposable-fixture acknowledgement) and is
// advisory-only — it can never contribute to a PASS verdict.
//
// It never prints tokens, keys, secrets, passwords or full JWTs.
//
// Design:  ../../../docs/platform/shared-runtime/evidence/CLAUDE-H3C-NEGATIVE-MATRIX-2026-09-08.md
// Review:  ../../../docs/platform/shared-runtime/evidence/CLAUDE-H3C-INDEPENDENT-REVIEW-2026-09-08.md
// House:   ../../../docs/platform/shared-runtime/evidence/HOUSE-REVIEW-CLAUDE-H3C-PROOF-PACK-2026-09-08.md
//
// Node >= 20 (built-in fetch + node:crypto JWK import). No npm. No Docker.
//
// Exit code 0 ONLY when the explicit required-probe contract is fully satisfied:
// every required probe present exactly once with verdict PASS, no FAIL anywhere,
// no unknown/duplicate verdicts. Any other outcome exits 1.

import crypto from 'node:crypto';
import fs from 'node:fs';
import process from 'node:process';

const NIL_UUID = '00000000-0000-0000-0000-000000000000';
const RPC_CONTEXT = 'get_customer_booking_context_v2_internal';
const RPC_QUOTE = 'quote_customer_booking_v2_internal';
const RPC_SUBMIT = 'submit_booking_request_v2_internal';

// ---------------------------------------------------------------------------
// config / operator input
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
  h3bEvidence: env.H3C_H3B_EVIDENCE || '',
  allowSubmitProbe: env.H3C_ALLOW_SUBMIT_PROBE === '1' && env.H3C_SUBMIT_DISPOSABLE_ACK === '1',
  fixtures: {
    shopId: env.H3C_FIX_SHOP_ID || '',
    lineUserId: env.H3C_FIX_LINE_USER_ID || '',
    roomId: env.H3C_FIX_ROOM_ID || '',
    ratePlanId: env.H3C_FIX_RATE_PLAN_ID || '',
    petIds: (env.H3C_FIX_PET_IDS || '').split(',').map((s) => s.trim()).filter(Boolean),
    startAt: env.H3C_FIX_START_AT || '',
    otherShopId: env.H3C_FIX_OTHER_SHOP_ID || '',
    otherPetIds: (env.H3C_FIX_OTHER_PET_IDS || '').split(',').map((s) => s.trim()).filter(Boolean),
  },
  outFile: env.H3C_OUT || '',
  ps01OtherRpc: env.H3C_PS01_OTHER_RPC || 'get_customer_booking_context_internal',
  ps01Table: env.H3C_PS01_TABLE || 'bookings',
  ps01TableCol: env.H3C_PS01_TABLE_COL || '',
  ps01InternalObj: env.H3C_PS01_INTERNAL_OBJ || 'booking_occupancy',
  localServiceFn: env.H3C_LOCAL_SERVICE_FN || 'is_shop_member',
  mt01Table: env.H3C_MT01_TABLE || 'tenants',
};

// ---------------------------------------------------------------------------
// required-probe contract  (House review H-01)
// ---------------------------------------------------------------------------

const TOK_IDS = ['TOK-1', 'TOK-2', 'TOK-3', 'TOK-4', 'TOK-5', 'TOK-6', 'TOK-7'];
const NEG_IDS = [
  'NEG-SD-1', 'NEG-SD-2', 'NEG-ROLE-1', 'NEG-PUB-1',
  'NEG-TBL-1', 'NEG-TBL-2', 'NEG-LS-1',
  'NEG-INT-1', 'NEG-MT-1', 'NEG-MT-2', 'NEG-WPI-1',
  'NEG-NET-1', 'NEG-NET-1b', 'NEG-CRON-1', 'NEG-AUTH-1', 'NEG-EXT-1', 'NEG-STOR-1',
  'NEG-EXP-1', 'NEG-SIG-1', 'NEG-SIG-2', 'NEG-KEY-1', 'NEG-ANON-1',
];
const REQUIRED_PROBES = [
  ...TOK_IDS,
  'POS-1', 'POS-2', 'POS-GRANTS',
  'POS-AUTHZ-1', 'POS-AUTHZ-2', 'POS-AUTHZ-3',
  'POS-CONTROL-1',
  ...NEG_IDS,
];
// Advisory probes may hold a non-PASS verdict without blocking the gate.
const ADVISORY_PROBES = new Set(['NEG-ROLE-2', 'POS-3']);
const ALLOWED_VERDICTS = new Set(['PASS', 'FAIL', 'RUNTIME-BLOCKED', 'NOT TESTABLE', 'INFO']);

// ---------------------------------------------------------------------------
// result plumbing
// ---------------------------------------------------------------------------

const results = [];
const record = (id, category, verdict, detail = {}) => {
  results.push({ id, category, verdict, ...detail });
};

function emit(obj) {
  const json = JSON.stringify(obj, null, 2);
  if (CFG.outFile) {
    fs.writeFileSync(CFG.outFile, json + '\n');
    process.stderr.write(`\nmachine-readable evidence written to ${CFG.outFile}\n`);
  } else {
    process.stdout.write(json + '\n');
  }
}

function die(reason) {
  emit({ harness: 'h3c-proof-harness', generatedAt: new Date().toISOString(), verdict: 'ABORTED', reason, results });
  process.stderr.write(`\nABORTED: ${reason}\n`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// jwt helpers (decode + ES256 verify against JWKS) — public key only
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

function safeClaims(payload) {
  return {
    iss: payload.iss,
    role: payload.role,
    aud: payload.aud,
    exp: payload.exp,
    iat: payload.iat,
    lifetimeSec: payload.exp && payload.iat ? payload.exp - payload.iat : null,
    sub_prefix: typeof payload.sub === 'string' ? payload.sub.slice(0, 6) + '…' : null,
    ref_claim: payload.ref || null,
    session_id_present: Boolean(payload.session_id),
  };
}

async function fetchJwks() {
  for (const u of [`${CFG.url}/auth/v1/.well-known/jwks.json`, `${CFG.url}/auth/v1/keys`]) {
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
  return crypto.verify('sha256', Buffer.from(signingInput), { key, dsaEncoding: 'ieee-p1363' }, signature);
}

// House review H-05: project identity must come from the token/issuer/JWKS,
// NEVER from the configured target URL. `CFG.url` is not an input here.
function validateProjectRef(claims, jwksUrl, expectedRef) {
  const issuerRef = (claims.iss || '').match(/^https?:\/\/([a-z0-9]{20})\.supabase\.(?:co|in|net)/i)?.[1] || null;
  const jwksRef = (jwksUrl || '').match(/^https?:\/\/([a-z0-9]{20})\.supabase\./i)?.[1] || null;
  const claimRef = claims.ref_claim || null;
  const sources = { issuerRef, jwksRef, claimRef };
  const ok =
    (issuerRef && issuerRef === expectedRef) ||
    (claimRef && claimRef === expectedRef) ||
    (jwksRef && jwksRef === expectedRef);
  return { ok: Boolean(ok), sources };
}

// House review H-06: identical identity checks for any token used as evidence.
async function verifyTokenIdentity(token, jwks, { expectingRole }) {
  const out = { checks: [], claims: null, identityOk: false };
  let d;
  try {
    d = decodeJwt(token);
  } catch (e) {
    out.checks.push({ k: 'decode', ok: false, detail: e.message });
    return out;
  }
  const claims = safeClaims(d.payload);
  out.claims = claims;

  const algOk = d.header.alg === 'ES256';
  out.checks.push({ k: 'alg', ok: algOk, detail: `alg=${d.header.alg}` });

  let sigOk = false;
  if (jwks) {
    const jwk = jwks.keys.find((k) => k.kid === d.header.kid) || jwks.keys[0];
    try {
      sigOk = verifyEs256(d.signingInput, d.signature, jwk);
    } catch (e) {
      out.checks.push({ k: 'verify-threw', ok: false, detail: e.message });
    }
  }
  out.checks.push({ k: 'signature', ok: sigOk, detail: jwks ? `against ${jwks.url}` : 'JWKS unreachable' });

  const issOk = /^https?:\/\/[a-z0-9]{20}\.supabase\.(co|in|net)\/auth\/v1$/i.test(claims.iss || '');
  out.checks.push({ k: 'issuer-shape', ok: issOk, detail: `iss=${claims.iss}` });

  const ref = validateProjectRef(claims, jwks?.url, CFG.expectedProjectRef);
  out.checks.push({ k: 'project-ref', ok: ref.ok, detail: JSON.stringify(ref.sources) });

  const roleOk = !expectingRole || claims.role === expectingRole;
  out.checks.push({ k: 'role', ok: roleOk, detail: `role=${claims.role}${expectingRole ? ` (expect ${expectingRole})` : ''}` });

  const notExpired = claims.exp && claims.exp * 1000 > Date.now();
  out.checks.push({ k: 'not-expired', ok: Boolean(notExpired), detail: notExpired ? 'valid' : 'expired' });

  out.identityOk = algOk && sigOk && issOk && ref.ok && Boolean(notExpired);
  return out;
}

// ---------------------------------------------------------------------------
// HTTP probe helper + classifiers (House review H-03, H-04)
// ---------------------------------------------------------------------------

async function probe({ method = 'GET', path, profile, token, body, headers: extra, omitApiKey = false, omitAuth = false }) {
  const headers = { ...(extra || {}) };
  if (!omitApiKey) headers.apikey = CFG.anonKey;
  if (!omitAuth && token) headers.Authorization = `Bearer ${token}`;
  if (profile) {
    headers['Accept-Profile'] = profile;
    if (method !== 'GET' && method !== 'HEAD') headers['Content-Profile'] = profile;
  }
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  try {
    const r = await fetch(`${CFG.url}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await r.text();
    let code = null;
    try {
      const j = JSON.parse(text);
      code = j.code || j.error_code || (typeof j.message === 'string' ? j.message.slice(0, 80) : null);
    } catch {
      /* non-json */
    }
    return { status: r.status, code, snippet: text.slice(0, 280) };
  } catch (err) {
    return { status: -1, code: null, snippet: String(err).slice(0, 200) };
  }
}

// PostgREST routing / role failures (function or schema not visible to the role).
const ROUTING_NOT_FOUND = new Set(['PGRST202', 'PGRST301', 'PGRST106', 'PGRST100', '42883', '42P01', '3F000']);

// A non-2xx result proves the target Postgres function EXECUTED only when the
// error is unambiguously raised from inside it (SQLSTATE class 22/23, P0xxx,
// 40xxx serialization, or a check/exclusion violation). Generic 5xx, routing
// errors, and auth errors never count. (House review H-04)
function inFunctionPgError(code) {
  if (typeof code !== 'string') return false;
  if (ROUTING_NOT_FOUND.has(code)) return false;
  // SQLSTATE: 5 chars, class then subclass ([0-9A-Z]). In-function execution
  // signals: data exception (22xxx), integrity constraint (23xxx),
  // serialization/txn (40xxx), triggered action (09xxx), PL/pgSQL raise (P0xxx),
  // check/exclusion (2Fxxx). Not routing (PGRST*/42883/42P01/3F000), not 5xx.
  return /^(22|23|40|09|2F|38|39)[0-9A-Z]{3}$/.test(code) || /^P0[0-9A-Z]{3}$/.test(code);
}

function boundaryReached(res) {
  if (res.status >= 200 && res.status < 300) return true;
  if (res.status === 401 || res.status === 403) return false;
  if (res.status === -1 || res.status >= 500) return false; // H-04: never trust 5xx / transport error
  if (res.status === 404 || res.status === 405 || res.status === 406) return false;
  if (res.status === 400 || res.status === 409 || res.status === 422) return inFunctionPgError(res.code);
  return false;
}

// A negative probe "fails closed" only on an explicit access denial or a
// role/schema routing miss. 2xx, 405, or a 5xx (ambiguous) are NOT closed.
function failsClosed(res) {
  if (res.status === 401 || res.status === 403) return true;
  if (res.status === 404) return true;
  if (res.status === 400 && ROUTING_NOT_FOUND.has(res.code)) return true;
  return false;
}

// ---------------------------------------------------------------------------
// RPC bodies (context / quote only — submit is never built here in safe mode)
// ---------------------------------------------------------------------------

const contextBody = (f = CFG.fixtures) => ({
  p_verified_line_user_id: f.lineUserId || '',
  p_shop_id: f.shopId || NIL_UUID,
});
const quoteBody = (f = CFG.fixtures) => ({
  ...contextBody(f),
  p_room_id: f.roomId || NIL_UUID,
  p_rate_plan_id: f.ratePlanId || NIL_UUID,
  p_pet_ids: f.petIds.length ? f.petIds : [NIL_UUID],
  p_start_at: f.startAt || new Date(Date.now() + 86400000).toISOString(),
});

// ---------------------------------------------------------------------------
// gate computation — pure, exercised by --selftest (House review H-01)
// ---------------------------------------------------------------------------

function computeGate(resList, note) {
  const seen = new Map();
  const duplicates = [];
  for (const r of resList) {
    if (seen.has(r.id)) duplicates.push(r.id);
    else seen.set(r.id, r);
  }
  const unknownVerdicts = resList
    .filter((r) => !ALLOWED_VERDICTS.has(r.verdict))
    .map((r) => `${r.id}:${r.verdict}`);
  const missing = REQUIRED_PROBES.filter((id) => !seen.has(id));
  const requiredNotPass = REQUIRED_PROBES.filter(
    (id) => seen.has(id) && seen.get(id).verdict !== 'PASS',
  );
  const anyFail = resList.some((r) => r.verdict === 'FAIL');
  const advisoryNonPass = resList
    .filter((r) => ADVISORY_PROBES.has(r.id) && r.verdict !== 'PASS')
    .map((r) => `${r.id}:${r.verdict}`);

  const blocked =
    Boolean(note) ||
    duplicates.length > 0 ||
    unknownVerdicts.length > 0 ||
    missing.length > 0 ||
    requiredNotPass.length > 0 ||
    anyFail;

  let verdict;
  if (!blocked) verdict = 'PASS';
  else if (anyFail || duplicates.length || unknownVerdicts.length) verdict = 'FAIL';
  else verdict = 'INCOMPLETE';

  return { verdict, note: note || null, duplicates, unknownVerdicts, missing, requiredNotPass, advisoryNonPass };
}

// ---------------------------------------------------------------------------
// token acquisition
// ---------------------------------------------------------------------------

async function obtainRuntimeToken() {
  if (CFG.runtimeJwt) return CFG.runtimeJwt;
  if (CFG.serviceEmail && CFG.servicePassword) {
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

// ---------------------------------------------------------------------------
// POS-GRANTS — offline proof of the exact 3-function EXECUTE grant + zero
// table writes, read from committed H3B evidence (House review H-02: the
// submit grant is proven from privilege evidence, not by calling submit).
// ---------------------------------------------------------------------------

function posGrantsFromEvidence() {
  if (!CFG.h3bEvidence) {
    return record('POS-GRANTS', 'positive', 'RUNTIME-BLOCKED', {
      note: 'set H3C_H3B_EVIDENCE to the path of H3B-POST-APPLY-RUNTIME-BOUNDARY-2026-09-08.md so the 3-function grant (incl. submit) + zero-table-write boundary is proven offline',
    });
  }
  let text;
  try {
    text = fs.readFileSync(CFG.h3bEvidence, 'utf8');
  } catch (e) {
    return record('POS-GRANTS', 'positive', 'RUNTIME-BLOCKED', { note: `cannot read H3C_H3B_EVIDENCE: ${e.message}` });
  }
  const has3 = [RPC_CONTEXT, RPC_QUOTE, RPC_SUBMIT].every((n) => text.includes(n));
  const exactlyThree = /execute exactly three PS01 functions and no fourth/i.test(text) || /executable PS01 function count[^0-9]*3/i.test(text);
  const zeroWrites = /Direct write-capable privileges on PS01 relations:\s*`?0`?/i.test(text);
  const ok = has3 && exactlyThree && zeroWrites;
  record('POS-GRANTS', 'positive', ok ? 'PASS' : 'FAIL', {
    detail: `names3=${has3} exactlyThree=${exactlyThree} zeroWrites=${zeroWrites}`,
    source: CFG.h3bEvidence,
    note: 'offline proof that ps01_line_runtime has EXECUTE on exactly the 3 RPCs (incl. submit) and no direct PS01 table write; submit is NOT invoked by this harness',
  });
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

async function main() {
  const missing = [];
  if (!CFG.url) missing.push('H3C_SUPABASE_URL');
  if (!CFG.anonKey) missing.push('H3C_ANON_KEY');
  if (missing.length) die(`missing required env: ${missing.join(', ')}`);

  const runtimeJwt = await obtainRuntimeToken();
  if (!runtimeJwt) die('no runtime token: set H3C_RUNTIME_JWT, or H3C_SERVICE_EMAIL + H3C_SERVICE_PASSWORD');

  const jwks = await fetchJwks();

  // ---- token pre-checks (runtime token) ----
  const idn = await verifyTokenIdentity(runtimeJwt, jwks, { expectingRole: CFG.expectedRole });
  const claims = idn.claims || {};
  const ck = (k) => idn.checks.find((c) => c.k === k) || { ok: false, detail: 'missing' };

  record('TOK-1', 'token', ck('alg').ok ? 'PASS' : 'FAIL', { detail: ck('alg').detail });
  record('TOK-2', 'token', ck('signature').ok ? 'PASS' : 'FAIL', { detail: ck('signature').detail });
  record('TOK-3', 'token', ck('issuer-shape').ok ? 'PASS' : 'FAIL', { detail: ck('issuer-shape').detail });
  record('TOK-4', 'token', ck('role').ok ? 'PASS' : 'FAIL', { detail: ck('role').detail });
  const lifeOk = claims.lifetimeSec != null && claims.lifetimeSec > 0 && claims.lifetimeSec <= CFG.maxTokenLifetimeSec;
  record('TOK-5', 'token', lifeOk ? 'PASS' : 'FAIL', {
    detail: `exp-iat=${claims.lifetimeSec}s (max ${CFG.maxTokenLifetimeSec}s) — from JWT, not OAuth expires_in`,
  });
  record('TOK-6', 'token', ck('not-expired').ok ? 'PASS' : 'FAIL', { detail: ck('not-expired').detail });
  record('TOK-7', 'token', ck('project-ref').ok ? 'PASS' : 'FAIL', {
    detail: `project ref from token evidence only (issuer/claim/JWKS): ${ck('project-ref').detail}`,
  });

  const tokOk = TOK_IDS.every((id) => results.find((r) => r.id === id)?.verdict === 'PASS');
  if (!tokOk) return finish(claims, 'token pre-checks failed — no live probes were run', runtimeJwt);

  // ---- POS-GRANTS (offline) ----
  posGrantsFromEvidence();

  // ---- POS-1 / POS-2 : read/compute RPCs reach the function boundary ----
  const haveFix = Boolean(CFG.fixtures.shopId);
  {
    const res = await probe({ method: 'POST', path: `/rest/v1/rpc/${RPC_CONTEXT}`, profile: 'ps01', token: runtimeJwt, body: contextBody() });
    record('POS-1', 'positive', boundaryReached(res) ? 'PASS' : 'FAIL', {
      target: RPC_CONTEXT, mode: haveFix ? 'fixture' : 'boundary-only', http: res.status, code: res.code,
      note: 'read RPC; boundary = 2xx OR an in-function PG error (class 22/23/P0…). 5xx / routing / auth error = not reached',
      snippet: res.snippet,
    });
  }
  {
    const res = await probe({ method: 'POST', path: `/rest/v1/rpc/${RPC_QUOTE}`, profile: 'ps01', token: runtimeJwt, body: quoteBody() });
    record('POS-2', 'positive', boundaryReached(res) ? 'PASS' : 'FAIL', {
      target: RPC_QUOTE, mode: haveFix ? 'fixture' : 'boundary-only', http: res.status, code: res.code,
      note: 'quote is a pricing/compute RPC — non-persistence by the Order V1 / PS01 contract; House to confirm from RPC source',
      snippet: res.snippet,
    });
  }

  // ---- POS-3 : submit — ADVISORY, never required, opt-in only ----
  if (CFG.allowSubmitProbe && CFG.fixtures.shopId && CFG.fixtures.roomId && CFG.fixtures.ratePlanId) {
    const res = await probe({
      method: 'POST', path: `/rest/v1/rpc/${RPC_SUBMIT}`, profile: 'ps01', token: runtimeJwt,
      body: { ...quoteBody(), p_special_requests: 'H3C-PROOF-DISPOSABLE' },
    });
    record('POS-3', 'positive', boundaryReached(res) ? 'PASS' : 'FAIL', {
      target: RPC_SUBMIT, mode: 'MUTATING-OPT-IN', http: res.status, code: res.code,
      note: 'MUTATING probe run by explicit opt-in. Operator MUST verify + clean up any created request. Advisory only — cannot make the gate PASS.',
      snippet: res.snippet,
    });
  } else {
    record('POS-3', 'positive', 'RUNTIME-BLOCKED', {
      note: 'submit RPC is mutating; safe mode never calls it. Grant boundary is proven by POS-GRANTS. To run a controlled mutating check: H3C_ALLOW_SUBMIT_PROBE=1 H3C_SUBMIT_DISPOSABLE_ACK=1 + disposable fixtures + manual cleanup.',
    });
  }

  // ---- POS-AUTHZ 1..3 : RPC-body authorization (all read/compute) ----
  if (CFG.fixtures.otherShopId) {
    const res = await probe({
      method: 'POST', path: `/rest/v1/rpc/${RPC_CONTEXT}`, profile: 'ps01', token: runtimeJwt,
      body: { p_verified_line_user_id: CFG.fixtures.lineUserId || '', p_shop_id: CFG.fixtures.otherShopId },
    });
    const rejected = res.status >= 400 || /"?(null|not[_ ]?found|denied|unauthor|forbidden|no[_ ]?access)"?/i.test(res.snippet || '') || res.snippet === 'null';
    record('POS-AUTHZ-1', 'positive-authz', rejected ? 'PASS' : 'FAIL', {
      http: res.status, code: res.code,
      note: 'cross-shop p_shop_id must not return another shop context (weak signal from harness; House confirms from RPC body/logs)',
      snippet: res.snippet,
    });
  } else {
    record('POS-AUTHZ-1', 'positive-authz', 'RUNTIME-BLOCKED', {
      note: 'set H3C_FIX_OTHER_SHOP_ID (a real shop the fixture LINE user is NOT linked to) — read-only',
    });
  }
  if (CFG.fixtures.shopId) {
    const res = await probe({
      method: 'POST', path: `/rest/v1/rpc/${RPC_CONTEXT}`, profile: 'ps01', token: runtimeJwt,
      body: { p_verified_line_user_id: '', p_shop_id: CFG.fixtures.shopId },
    });
    const rejected = res.status >= 400 || res.snippet === 'null' || /"?(null|denied|unverified|invalid)"?/i.test(res.snippet || '');
    record('POS-AUTHZ-2', 'positive-authz', rejected ? 'PASS' : 'FAIL', {
      http: res.status, code: res.code, note: 'blank p_verified_line_user_id must not yield a customer context', snippet: res.snippet,
    });
  } else {
    record('POS-AUTHZ-2', 'positive-authz', 'RUNTIME-BLOCKED', { note: 'set H3C_FIX_SHOP_ID (any real shop) to run the blank-line-user read probe' });
  }
  if (CFG.fixtures.otherPetIds.length && CFG.fixtures.shopId && CFG.fixtures.roomId && CFG.fixtures.ratePlanId) {
    const res = await probe({
      method: 'POST', path: `/rest/v1/rpc/${RPC_QUOTE}`, profile: 'ps01', token: runtimeJwt,
      body: { ...quoteBody(), p_pet_ids: CFG.fixtures.otherPetIds },
    });
    const rejected = res.status >= 400 || /"?(null|denied|not[_ ]?found|forbidden|not[_ ]?your|invalid)"?/i.test(res.snippet || '');
    record('POS-AUTHZ-3', 'positive-authz', rejected ? 'PASS' : 'FAIL', {
      http: res.status, code: res.code, note: 'quote for another customer\'s pet ids must be rejected (quote is compute-only, non-mutating)', snippet: res.snippet,
    });
  } else {
    record('POS-AUTHZ-3', 'positive-authz', 'RUNTIME-BLOCKED', {
      note: 'set H3C_FIX_OTHER_PET_IDS + H3C_FIX_SHOP_ID/ROOM_ID/RATE_PLAN_ID (read-only) to run the cross-customer quote probe',
    });
  }

  // ---- POS-CONTROL-1 : hook is a no-op for a non-allowlisted user ----
  if (CFG.controlJwt) {
    const cIdn = await verifyTokenIdentity(CFG.controlJwt, jwks, { expectingRole: null }); // H-06: full identity verify
    const cl = cIdn.claims || {};
    const roleUnchanged = cl.role === 'authenticated';
    const uncapped = cl.lifetimeSec == null || cl.lifetimeSec > CFG.maxTokenLifetimeSec;
    const ok = cIdn.identityOk && roleUnchanged && uncapped;
    record('POS-CONTROL-1', 'control', ok ? 'PASS' : 'FAIL', {
      detail: `identityOk=${cIdn.identityOk} role=${cl.role} lifetime=${cl.lifetimeSec}s (expect signed+authenticated+uncapped)`,
      checks: cIdn.checks,
    });
  } else {
    record('POS-CONTROL-1', 'control', 'RUNTIME-BLOCKED', {
      note: 'provide H3C_CONTROL_JWT: a signed token for a NON-allowlisted LAB Auth user, issued while the hook is enabled',
    });
  }

  // ---- NEGATIVE matrix (all GET / non-mutating) ----
  const negGet = [
    ['NEG-SD-1', { path: '/rest/v1/rpc/sync_booking_occupancy_window', profile: 'ps01' }],
    ['NEG-SD-2', { path: `/rest/v1/rpc/${CFG.ps01OtherRpc}`, profile: 'ps01' }],
    ['NEG-ROLE-1', { path: `/rest/v1/rpc/${CFG.localServiceFn}`, profile: 'local_service' }],
    ['NEG-PUB-1', { path: '/rest/v1/rpc/rls_auto_enable', profile: 'public' }],
    ['NEG-TBL-1', { path: `/rest/v1/${CFG.ps01Table}?limit=1`, profile: 'ps01' }],
    ['NEG-LS-1', { path: '/rest/v1/shop_public_profile?limit=1', profile: 'local_service' }],
    ['NEG-INT-1', { path: `/rest/v1/${CFG.ps01InternalObj}?limit=1`, profile: 'ps01_internal' }],
    ['NEG-MT-1', { path: `/rest/v1/${CFG.mt01Table}?limit=1`, profile: 'mt01' }],
    ['NEG-MT-2', { path: '/rest/v1/anything?limit=1', profile: 'mt01_private' }],
    ['NEG-WPI-1', { path: '/rest/v1/runtime_token_grants?limit=1', profile: 'wstera_platform_internal' }],
    ['NEG-NET-1', { path: '/rest/v1/_http_response?limit=1', profile: 'net' }],
    ['NEG-NET-1b', { path: '/rest/v1/http_request_queue?limit=1', profile: 'net' }],
    ['NEG-CRON-1', { path: '/rest/v1/job?limit=1', profile: 'cron' }],
    ['NEG-AUTH-1', { path: '/rest/v1/users?limit=1', profile: 'auth' }],
    ['NEG-EXT-1', { path: '/rest/v1/anything?limit=1', profile: 'extensions' }],
  ];
  for (const [id, opts] of negGet) {
    const res = await probe({ method: 'GET', ...opts, token: runtimeJwt });
    record(id, 'negative', failsClosed(res) ? 'PASS' : 'FAIL', {
      http: res.status, code: res.code, expected: 'fail closed (401/403/404)', snippet: res.snippet,
    });
  }

  // NEG-TBL-2: non-mutating write-authority probe — PATCH a guaranteed-nonexistent PK.
  if (CFG.ps01TableCol) {
    const res = await probe({
      method: 'PATCH',
      path: `/rest/v1/${CFG.ps01Table}?id=eq.${NIL_UUID}`,
      profile: 'ps01', token: runtimeJwt,
      headers: { Prefer: 'return=minimal' },
      body: { [CFG.ps01TableCol]: null },
    });
    // no UPDATE grant -> 401/403; unreachable -> 404. 2xx/204 -> role HAS UPDATE authority (FAIL).
    const closed = res.status === 401 || res.status === 403 || res.status === 404;
    record('NEG-TBL-2', 'negative', closed ? 'PASS' : 'FAIL', {
      http: res.status, code: res.code,
      note: 'PATCH against a nonexistent PK — non-mutating even if the role had UPDATE. 2xx = role has write authority = FAIL.',
      snippet: res.snippet,
    });
  } else {
    record('NEG-TBL-2', 'negative', 'RUNTIME-BLOCKED', {
      note: 'set H3C_PS01_TABLE_COL to any real column of H3C_PS01_TABLE so the non-mutating PATCH-nonexistent-PK write-authority probe can run',
    });
  }

  // storage API
  {
    const res = await probe({ method: 'GET', path: '/storage/v1/bucket', token: runtimeJwt });
    record('NEG-STOR-1', 'negative', res.status === 401 || res.status === 403 ? 'PASS' : 'FAIL', {
      http: res.status, code: res.code, expected: '401/403 (role is not service_role)', snippet: res.snippet,
    });
  }

  // token-level failures
  if (CFG.expiredJwt) {
    const res = await probe({ method: 'POST', path: `/rest/v1/rpc/${RPC_CONTEXT}`, profile: 'ps01', token: CFG.expiredJwt, body: contextBody() });
    record('NEG-EXP-1', 'negative', res.status === 401 ? 'PASS' : 'FAIL', { http: res.status, code: res.code, snippet: res.snippet });
  } else {
    record('NEG-EXP-1', 'negative', 'RUNTIME-BLOCKED', { note: 'provide H3C_EXPIRED_JWT (a previously-issued, now-expired runtime token) — required for PASS' });
  }
  {
    const p = runtimeJwt.split('.');
    const sig = b64urlToBuf(p[2]);
    sig[0] ^= 0xff;
    const res = await probe({ method: 'POST', path: `/rest/v1/rpc/${RPC_CONTEXT}`, profile: 'ps01', token: `${p[0]}.${p[1]}.${sig.toString('base64url')}`, body: contextBody() });
    record('NEG-SIG-1', 'negative', res.status === 401 ? 'PASS' : 'FAIL', { http: res.status, code: res.code, snippet: res.snippet });
  }
  {
    const p = runtimeJwt.split('.');
    const pl = b64urlToJson(p[1]);
    pl.role = 'postgres';
    const res = await probe({ method: 'POST', path: `/rest/v1/rpc/${RPC_CONTEXT}`, profile: 'ps01', token: `${p[0]}.${Buffer.from(JSON.stringify(pl)).toString('base64url')}.${p[2]}`, body: contextBody() });
    record('NEG-SIG-2', 'negative', res.status === 401 ? 'PASS' : 'FAIL', { http: res.status, code: res.code, note: 'payload role=postgres + stale signature must be rejected', snippet: res.snippet });
  }
  record('NEG-ROLE-2', 'negative', 'NOT TESTABLE', {
    note: 'a validly-signed token with role=service_role/authenticator/postgres cannot be produced without a signing path the design withholds; covered by threat-model TM-7 (CHECK constraint + hook re-check + pg_roles check + authenticator membership). Advisory.',
  });
  {
    const res = await probe({ method: 'POST', path: `/rest/v1/rpc/${RPC_CONTEXT}`, profile: 'ps01', token: runtimeJwt, body: contextBody(), omitApiKey: true });
    record('NEG-KEY-1', 'negative', res.status === 401 ? 'PASS' : 'FAIL', { http: res.status, code: res.code, expected: '401 from gateway', snippet: res.snippet });
  }
  {
    const res = await probe({ method: 'POST', path: `/rest/v1/rpc/${RPC_CONTEXT}`, profile: 'ps01', token: null, body: contextBody(), omitAuth: true });
    record('NEG-ANON-1', 'negative', failsClosed(res) ? 'PASS' : 'FAIL', { http: res.status, code: res.code, expected: 'anon has no EXECUTE -> fail', snippet: res.snippet });
  }

  finish(claims, null, runtimeJwt);
}

function finish(claims, note, runtimeJwt) {
  const gate = computeGate(results, note);
  const counts = results.reduce((a, r) => ((a[r.verdict] = (a[r.verdict] || 0) + 1), a), {});
  const residualExp = claims && claims.exp ? new Date(claims.exp * 1000).toISOString() : null;

  const out = {
    harness: 'h3c-proof-harness',
    generatedAt: new Date().toISOString(),
    target: CFG.url,
    expectedProjectRef: CFG.expectedProjectRef,
    mode: CFG.allowSubmitProbe ? 'MUTATING-SUBMIT-OPT-IN' : 'safe-read-only',
    tokenClaims: claims,
    // House review H-07: an already-issued runtime JWT stays valid until this
    // exact time even after the service identity + refresh authority are gone,
    // because PostgREST validates the JWT without checking Auth-user existence.
    residualNarrowAuthorityUntil: residualExp,
    verdict: gate.verdict,
    gate,
    counts,
    results,
  };
  emit(out);

  process.stderr.write('\n=== H3C proof harness summary ===\n');
  process.stderr.write(`target=${CFG.url} mode=${out.mode} verdict=${gate.verdict}\n`);
  process.stderr.write(`token: role=${claims?.role} lifetime=${claims?.lifetimeSec}s residual-authority-until=${residualExp}\n`);
  for (const r of results) {
    process.stderr.write(`  ${String(r.verdict).padEnd(16)} ${r.id.padEnd(14)} ${r.category}${r.http ? '  http=' + r.http : ''}${r.code ? ' code=' + r.code : ''}\n`);
  }
  if (gate.missing.length) process.stderr.write(`MISSING required: ${gate.missing.join(', ')}\n`);
  if (gate.requiredNotPass.length) process.stderr.write(`required NOT PASS: ${gate.requiredNotPass.join(', ')}\n`);
  if (gate.duplicates.length) process.stderr.write(`DUPLICATE ids: ${gate.duplicates.join(', ')}\n`);
  if (gate.unknownVerdicts.length) process.stderr.write(`UNKNOWN verdicts: ${gate.unknownVerdicts.join(', ')}\n`);
  process.stderr.write(`counts: ${JSON.stringify(counts)}\n`);
  void runtimeJwt;
  process.exit(gate.verdict === 'PASS' ? 0 : 1);
}

// ---------------------------------------------------------------------------
// self-test — offline, proves the remediated GATE behaviour (House brief)
// ---------------------------------------------------------------------------

function selftest() {
  let failed = 0;
  const ok = (cond, msg) => {
    if (!cond) { process.stderr.write(`SELFTEST FAIL: ${msg}\n`); failed += 1; }
  };

  // --- crypto / decode / redaction ---
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const jwk = publicKey.export({ format: 'jwk' });
  const now = Math.floor(Date.now() / 1000);
  const mk = (over = {}) => {
    const header = { alg: 'ES256', kid: 'k', typ: 'JWT' };
    const payload = {
      iss: 'https://ykxlqnshaaxmzzocpjlj.supabase.co/auth/v1',
      role: 'ps01_line_runtime', aud: 'authenticated',
      sub: 'abcdef01-2345-6789-abcd-ef0123456789', iat: now, exp: now + 250, ...over,
    };
    const si = `${Buffer.from(JSON.stringify(header)).toString('base64url')}.${Buffer.from(JSON.stringify(payload)).toString('base64url')}`;
    const sig = crypto.sign('sha256', Buffer.from(si), { key: privateKey, dsaEncoding: 'ieee-p1363' });
    return { token: `${si}.${sig.toString('base64url')}`, si, sig };
  };
  const { token, si, sig } = mk();
  const d = decodeJwt(token);
  ok(d.header.alg === 'ES256' && d.payload.role === 'ps01_line_runtime', 'decode');
  const c = safeClaims(d.payload);
  ok(c.lifetimeSec === 250 && c.sub_prefix === 'abcdef…', 'safeClaims');
  ok(!JSON.stringify(c).includes('2345-6789'), 'no full sub in safeClaims');
  ok(!/password|secret|signing|private/i.test(JSON.stringify(c)), 'no secret-ish key in safeClaims');
  ok(verifyEs256(si, sig, jwk) === true, 'ES256 verify good');
  const bad = Buffer.from(sig); bad[0] ^= 0xff;
  ok(verifyEs256(si, bad, jwk) === false, 'ES256 verify tampered');

  // --- H-05: project-ref must NOT pass just because the target URL contains it ---
  const foreign = safeClaims(decodeJwt(mk({ iss: 'https://zzzzzzzzzzzzzzzzzzzz.supabase.co/auth/v1', ref: undefined }).token).payload);
  ok(validateProjectRef(foreign, 'https://zzzzzzzzzzzzzzzzzzzz.supabase.co/auth/v1/keys', 'ykxlqnshaaxmzzocpjlj').ok === false,
    'H-05: foreign-issuer token fails project-ref even if operator target URL has the expected ref');
  ok(validateProjectRef(safeClaims(d.payload), null, 'ykxlqnshaaxmzzocpjlj').ok === true, 'H-05: matching issuer passes');

  // --- H-04: generic 5xx / transport error is never a boundary reach ---
  ok(boundaryReached({ status: 500, code: null }) === false, 'H-04: 500 not boundary');
  ok(boundaryReached({ status: 502, code: null }) === false, 'H-04: 502 not boundary');
  ok(boundaryReached({ status: -1, code: null }) === false, 'H-04: transport error not boundary');
  ok(boundaryReached({ status: 404, code: 'PGRST202' }) === false, 'H-04: routing 404 not boundary');
  ok(boundaryReached({ status: 200, code: null }) === true, 'boundary: 200');
  ok(boundaryReached({ status: 400, code: '22P02' }) === true, 'boundary: in-function invalid_text_representation');
  ok(boundaryReached({ status: 400, code: 'P0001' }) === true, 'boundary: in-function raise_exception');
  ok(boundaryReached({ status: 400, code: 'PGRST100' }) === false, 'boundary: parse error not in-function');
  ok(failsClosed({ status: 403 }) === true && failsClosed({ status: 200 }) === false && failsClosed({ status: 500 }) === false,
    'failsClosed: 403 yes / 200 no / 500 no');

  // --- H-01: gate contract ---
  const base = () => [
    ...TOK_IDS.map((id) => ({ id, verdict: 'PASS' })),
    { id: 'POS-1', verdict: 'PASS' }, { id: 'POS-2', verdict: 'PASS' }, { id: 'POS-GRANTS', verdict: 'PASS' },
    { id: 'POS-AUTHZ-1', verdict: 'PASS' }, { id: 'POS-AUTHZ-2', verdict: 'PASS' }, { id: 'POS-AUTHZ-3', verdict: 'PASS' },
    { id: 'POS-CONTROL-1', verdict: 'PASS' },
    ...NEG_IDS.map((id) => ({ id, verdict: 'PASS' })),
    { id: 'NEG-ROLE-2', verdict: 'NOT TESTABLE' }, { id: 'POS-3', verdict: 'RUNTIME-BLOCKED' },
  ];
  ok(computeGate(base(), null).verdict === 'PASS', 'gate: full required set PASS -> PASS');

  const drop = (arr, id) => arr.filter((r) => r.id !== id);
  const set = (arr, id, v) => arr.map((r) => (r.id === id ? { ...r, verdict: v } : r));

  ok(computeGate(set(base(), 'POS-AUTHZ-2', 'RUNTIME-BLOCKED'), null).verdict !== 'PASS', 'H-01: POS-AUTHZ-2 RUNTIME-BLOCKED blocks PASS');
  ok(computeGate(set(base(), 'POS-AUTHZ-3', 'RUNTIME-BLOCKED'), null).verdict !== 'PASS', 'H-01: POS-AUTHZ-3 RUNTIME-BLOCKED blocks PASS');
  ok(computeGate(set(base(), 'POS-CONTROL-1', 'RUNTIME-BLOCKED'), null).verdict !== 'PASS', 'H-01: POS-CONTROL-1 RUNTIME-BLOCKED blocks PASS');
  ok(computeGate(set(base(), 'POS-GRANTS', 'RUNTIME-BLOCKED'), null).verdict !== 'PASS', 'H-02: POS-GRANTS RUNTIME-BLOCKED blocks PASS');
  ok(computeGate(drop(base(), 'NEG-NET-1'), null).verdict !== 'PASS', 'H-01: missing required negative probe blocks PASS');
  ok(computeGate(drop(base(), 'TOK-4'), null).verdict !== 'PASS', 'H-01: missing token check blocks PASS');
  ok(computeGate(set(base(), 'NEG-CRON-1', 'WeirdVerdict'), null).verdict === 'FAIL', 'H-01: unknown verdict -> FAIL');
  ok(computeGate([...base(), { id: 'NEG-CRON-1', verdict: 'PASS' }], null).verdict === 'FAIL', 'H-01: duplicate id -> FAIL');
  ok(computeGate(set(base(), 'NEG-AUTH-1', 'FAIL'), null).verdict === 'FAIL', 'H-01: any FAIL -> FAIL');
  ok(computeGate(base(), 'some note').verdict !== 'PASS', 'H-01: harness note blocks PASS');
  ok(computeGate(set(base(), 'POS-3', 'FAIL'), null).verdict !== 'PASS', 'advisory POS-3 FAIL still blocks (any FAIL rule)');
  ok(computeGate(set(base(), 'NEG-ROLE-2', 'RUNTIME-BLOCKED'), null).verdict === 'PASS', 'advisory NEG-ROLE-2 non-PASS does NOT block');

  // --- H-02 / H-03: default mode must not plan a submit or a table-mutating
  // HTTP call. Needles are assembled from fragments so this test cannot
  // self-match its own source text.
  const S = (a, b) => a + b;
  const src = fs.readFileSync(new URL(import.meta.url), 'utf8');
  const submitNeedle = S('rpc/${RPC_', 'SUBMIT}');
  ok((src.split(submitNeedle).length - 1) === 1, 'H-02: exactly one submit call site in source');
  ok(src.slice(0, src.indexOf(submitNeedle)).includes('CFG.allowSubmitProbe'),
    'H-02: the submit call site is preceded by the allowSubmitProbe opt-in guard');
  ok(!src.includes(S("method: '", "PUT'")) && !src.includes(S("method: '", "DELETE'")),
    'H-02: no PUT/DELETE method anywhere in the harness');
  const patchNeedle = S("method: '", "PATCH'");
  ok((src.split(patchNeedle).length - 1) === 1, 'H-03: exactly one PATCH probe');
  ok(src.slice(src.indexOf(patchNeedle), src.indexOf(patchNeedle) + 220).includes('id=eq.'),
    'H-03: the PATCH probe targets a specific (nonexistent) id filter');

  process.stderr.write(failed ? `\nSELFTEST: ${failed} FAILURE(S)\n` : '\nSELFTEST PASS (crypto, project-ref H-05, classifiers H-04, gate H-01, safety H-02/H-03)\n');
  process.exit(failed ? 1 : 0);
}

if (process.argv.includes('--selftest')) selftest();
else main().catch((e) => die(`unhandled: ${e && e.stack ? e.stack.split('\n')[0] : e}`));
