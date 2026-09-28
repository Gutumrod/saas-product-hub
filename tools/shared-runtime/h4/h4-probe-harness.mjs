#!/usr/bin/env node
// H4 disposable-product negative-probe harness — WSTERA LAB only.
// PREPARE-ONLY. Safe by default: GET + POST to the single allowlisted h4_probe
// operation only; never a table INSERT/PUT/DELETE; never a foreign-schema write.
//
// Classifier core is shared with tools/shared-runtime/h3c/h3c-proof-harness.mjs
// (H-04: a generic 5xx / transport error / routing miss is NEVER a boundary
// reach; a negative probe "fails closed" only on an explicit access/routing
// denial).
//
// Env (operator-supplied; never logged):
//   H4_SUPABASE_URL            e.g. https://ykxlqnshaaxmzzocpjlj.supabase.co
//   H4_ANON_KEY                LAB anon / publishable key (apikey header)
//   H4_RUNTIME_JWT             Auth-issued token, role=h4_runtime, lifetime <= 300s
//   H4_EXPIRED_JWT  (opt)      a previously-issued, now-expired h4_runtime token
//   H4_PRIVILEGE_SNAPSHOT      path to the JSON from h4-privilege-snapshot.sql
//   H4_OUT          (opt)      write machine-readable JSON here
//
// Exit 0 only when every required probe is present once with verdict PASS.

import crypto from "node:crypto";
import fs from "node:fs";
import process from "node:process";

const NIL_UUID = "00000000-0000-0000-0000-000000000000";
const RPC_ECHO = "h4_echo";

const env = process.env;
const CFG = {
  url: (env.H4_SUPABASE_URL || "").replace(/\/+$/, ""),
  anonKey: env.H4_ANON_KEY || "",
  runtimeJwt: env.H4_RUNTIME_JWT || "",
  expiredJwt: env.H4_EXPIRED_JWT || "",
  privilegeSnapshot: env.H4_PRIVILEGE_SNAPSHOT || "",
  expectedRole: env.H4_EXPECTED_ROLE || "h4_runtime",
  expectedRef: env.H4_EXPECTED_PROJECT_REF || "ykxlqnshaaxmzzocpjlj",
  maxLifetimeSec: Number(env.H4_MAX_TOKEN_LIFETIME_SEC || 300),
  outFile: env.H4_OUT || "",
};

const REQUIRED = [
  "TOK-1", "TOK-2", "TOK-3", "TOK-4",
  "POS-ECHO", "POS-GRANTS",
  "NEG-H4-TBL", "NEG-H4-MIGRATE",
  "NEG-PS01", "NEG-PS01-INT", "NEG-LS", "NEG-MT", "NEG-WPI",
  "NEG-NET", "NEG-CRON", "NEG-AUTH", "NEG-STOR", "NEG-EXT",
  "NEG-EXP", "NEG-SIG", "NEG-KEY", "NEG-ANON",
];
const ALLOWED_VERDICTS = new Set(["PASS", "FAIL", "RUNTIME-BLOCKED", "INFO"]);
const results = [];
const rec = (id, verdict, detail = {}) => results.push({ id, verdict, ...detail });

// ---- shared classifier core (mirror of h3c-proof-harness.mjs) --------------
const ROUTING_NOT_FOUND = new Set(["PGRST202", "PGRST301", "PGRST106", "PGRST100", "42883", "42P01", "3F000"]);
function inFunctionPgError(code) {
  if (typeof code !== "string") return false;
  if (ROUTING_NOT_FOUND.has(code)) return false;
  return /^(22|23|40|09|2F|38|39)[0-9A-Z]{3}$/.test(code) || /^P0[0-9A-Z]{3}$/.test(code);
}
function boundaryReached(res) {
  if (res.status >= 200 && res.status < 300) return true;
  if (res.status === 401 || res.status === 403) return false;
  if (res.status === -1 || res.status >= 500) return false;
  if ([404, 405, 406].includes(res.status)) return false;
  if ([400, 409, 422].includes(res.status)) return inFunctionPgError(res.code);
  return false;
}
function failsClosed(res) {
  if (res.status === 401 || res.status === 403 || res.status === 404) return true;
  if ((res.status === 400 || res.status === 406) && ROUTING_NOT_FOUND.has(res.code)) return true;
  return false;
}
function storageFailsClosed(res) {
  if (res.status === 401 || res.status === 403) return true;
  return res.status === 400 && res.code === "AccessDenied" &&
    /"statusCode"\s*:\s*"403"/.test(res.snippet || "") &&
    /(Unauthorized|permission denied)/i.test(res.snippet || "");
}

// ---- jwt (decode + ES256 verify, public key only) -------------------------
const b64urlToBuf = (s) => Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
const b64urlToJson = (s) => JSON.parse(b64urlToBuf(s).toString("utf8"));
function decodeJwt(t) {
  const p = t.split(".");
  if (p.length !== 3) throw new Error("not a 3-part JWT");
  return { header: b64urlToJson(p[0]), payload: b64urlToJson(p[1]), signingInput: `${p[0]}.${p[1]}`, signature: b64urlToBuf(p[2]) };
}
function verifyEs256(si, sig, jwk) {
  const key = crypto.createPublicKey({ key: jwk, format: "jwk" });
  return crypto.verify("sha256", Buffer.from(si), { key, dsaEncoding: "ieee-p1363" }, sig);
}
async function fetchJwks() {
  for (const u of [`${CFG.url}/auth/v1/.well-known/jwks.json`, `${CFG.url}/auth/v1/keys`]) {
    try {
      const r = await fetch(u, { headers: { apikey: CFG.anonKey } });
      if (r.ok) { const j = await r.json(); if (Array.isArray(j.keys) && j.keys.length) return { url: u, keys: j.keys }; }
    } catch { /* next */ }
  }
  return null;
}

async function probe({ method = "GET", path, profile, token, body, omitApiKey = false, omitAuth = false, headers: extra }) {
  const headers = { ...(extra || {}) };
  if (!omitApiKey) headers.apikey = CFG.anonKey;
  if (!omitAuth && token) headers.Authorization = `Bearer ${token}`;
  if (profile) { headers["Accept-Profile"] = profile; if (method !== "GET") headers["Content-Profile"] = profile; }
  if (body !== undefined) headers["Content-Type"] = "application/json";
  try {
    const r = await fetch(`${CFG.url}${path}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
    const text = await r.text();
    let code = null;
    try { const j = JSON.parse(text); code = j.code || j.error_code || (typeof j.message === "string" ? j.message.slice(0, 80) : null); } catch { /* */ }
    return { status: r.status, code, snippet: text.slice(0, 240) };
  } catch (e) { return { status: -1, code: null, snippet: String(e).slice(0, 160) }; }
}

function computeGate() {
  const seen = new Map();
  const dup = [];
  for (const r of results) { if (seen.has(r.id)) dup.push(r.id); else seen.set(r.id, r); }
  const unknown = results.filter((r) => !ALLOWED_VERDICTS.has(r.verdict)).map((r) => `${r.id}:${r.verdict}`);
  const missing = REQUIRED.filter((id) => !seen.has(id));
  const notPass = REQUIRED.filter((id) => seen.has(id) && seen.get(id).verdict !== "PASS");
  const anyFail = results.some((r) => r.verdict === "FAIL");
  const blocked = dup.length || unknown.length || missing.length || notPass.length || anyFail;
  return { verdict: blocked ? (anyFail || dup.length || unknown.length ? "FAIL" : "INCOMPLETE") : "PASS", dup, unknown, missing, notPass };
}

function loadSnapshot() {
  if (!CFG.privilegeSnapshot) return { ok: false, note: "set H4_PRIVILEGE_SNAPSHOT" };
  let d;
  try { d = JSON.parse(fs.readFileSync(CFG.privilegeSnapshot, "utf8")); }
  catch (e) { return { ok: false, note: `cannot read snapshot: ${e.message}` }; }
  const ageMs = Math.abs(Date.now() - Date.parse(d.captured_at || 0));
  const checks = {
    ref: d.project_ref === CFG.expectedRef,
    role: d.role === "h4_runtime",
    noLogin: d.role_no_login === true,
    execCount1: Number(d.exec_count) === 1,
    execIsEcho: Array.isArray(d.exec_functions) && d.exec_functions.length === 1 && /h4_echo/.test(JSON.stringify(d.exec_functions)),
    zeroWrites: Number(d.write_count) === 0,
    noForeign: d.foreign_schema_usage === false,
    fresh: ageMs <= 15 * 60 * 1000,
  };
  return { ok: Object.values(checks).every(Boolean), note: JSON.stringify(checks), data: d };
}

async function main() {
  const miss = [];
  if (!CFG.url) miss.push("H4_SUPABASE_URL");
  if (!CFG.anonKey) miss.push("H4_ANON_KEY");
  if (!CFG.runtimeJwt) miss.push("H4_RUNTIME_JWT");
  if (miss.length) { emit({ verdict: "ABORTED", reason: `missing env: ${miss.join(", ")}` }); process.exit(1); }

  const jwks = await fetchJwks();
  let claims = {};
  try {
    const d = decodeJwt(CFG.runtimeJwt);
    claims = d.payload;
    rec("TOK-1", d.header.alg === "ES256" ? "PASS" : "FAIL", { detail: `alg=${d.header.alg}` });
    const jwk = jwks && (jwks.keys.find((k) => k.kid === d.header.kid) || jwks.keys[0]);
    let sigOk = false;
    try { sigOk = jwk ? verifyEs256(d.signingInput, d.signature, jwk) : false; } catch { /* */ }
    rec("TOK-2", sigOk ? "PASS" : "FAIL", { detail: jwks ? `verified against ${jwks.url}` : "JWKS unreachable" });
    rec("TOK-3", claims.role === CFG.expectedRole ? "PASS" : "FAIL", { detail: `role=${claims.role}` });
    const life = claims.exp && claims.iat ? claims.exp - claims.iat : null;
    rec("TOK-4", life != null && life > 0 && life <= CFG.maxLifetimeSec ? "PASS" : "FAIL", { detail: `lifetime=${life}s` });
  } catch (e) {
    rec("TOK-1", "FAIL", { detail: e.message });
  }

  const snap = loadSnapshot();
  rec("POS-GRANTS", snap.ok ? "PASS" : "RUNTIME-BLOCKED", { detail: snap.note });

  // POS: the one allowed runtime op reaches its function boundary
  {
    const res = await probe({ method: "POST", path: `/rest/v1/rpc/${RPC_ECHO}`, profile: "h4_probe", token: CFG.runtimeJwt, body: { p_text: "probe" } });
    rec("POS-ECHO", boundaryReached(res) ? "PASS" : "FAIL", { http: res.status, code: res.code, snippet: res.snippet });
  }
  // NEG: no direct h4_probe.notes write; no product-local migrate op from runtime
  {
    const res = await probe({ method: "POST", path: "/rest/v1/notes", profile: "h4_probe", token: CFG.runtimeJwt, body: { note: "x" }, headers: { Prefer: "return=minimal" } });
    rec("NEG-H4-TBL", failsClosed(res) ? "PASS" : "FAIL", { http: res.status, code: res.code, snippet: res.snippet });
  }
  {
    const res = await probe({ method: "POST", path: "/rest/v1/rpc/h4_migrate_note", profile: "h4_probe", token: CFG.runtimeJwt, body: { p_note: "x" } });
    rec("NEG-H4-MIGRATE", failsClosed(res) ? "PASS" : "FAIL", { http: res.status, code: res.code, snippet: res.snippet });
  }
  // NEG: foreign product / managed schemas unreachable via Data API
  const negGet = [
    ["NEG-PS01", "/rest/v1/bookings?limit=1", "ps01"],
    ["NEG-PS01-INT", "/rest/v1/booking_occupancy?limit=1", "ps01_internal"],
    ["NEG-LS", "/rest/v1/shop_public_profile?limit=1", "local_service"],
    ["NEG-MT", "/rest/v1/tenants?limit=1", "mt01"],
    ["NEG-WPI", "/rest/v1/runtime_token_grants?limit=1", "wstera_platform_internal"],
    ["NEG-NET", "/rest/v1/http_request_queue?limit=1", "net"],
    ["NEG-CRON", "/rest/v1/job?limit=1", "cron"],
    ["NEG-AUTH", "/rest/v1/users?limit=1", "auth"],
    ["NEG-EXT", "/rest/v1/anything?limit=1", "extensions"],
  ];
  for (const [id, path, profile] of negGet) {
    const res = await probe({ method: "GET", path, profile, token: CFG.runtimeJwt });
    rec(id, failsClosed(res) ? "PASS" : "FAIL", { http: res.status, code: res.code, snippet: res.snippet });
  }
  {
    const res = await probe({ method: "GET", path: "/storage/v1/bucket", token: CFG.runtimeJwt });
    rec("NEG-STOR", storageFailsClosed(res) ? "PASS" : "FAIL", { http: res.status, code: res.code, snippet: res.snippet });
  }
  // token-level negatives
  if (CFG.expiredJwt) {
    const res = await probe({ method: "POST", path: `/rest/v1/rpc/${RPC_ECHO}`, profile: "h4_probe", token: CFG.expiredJwt, body: { p_text: "x" } });
    rec("NEG-EXP", res.status === 401 ? "PASS" : "FAIL", { http: res.status, code: res.code });
  } else {
    rec("NEG-EXP", "RUNTIME-BLOCKED", { note: "provide H4_EXPIRED_JWT" });
  }
  {
    const p = CFG.runtimeJwt.split(".");
    const sig = b64urlToBuf(p[2]); sig[0] ^= 0xff;
    const res = await probe({ method: "POST", path: `/rest/v1/rpc/${RPC_ECHO}`, profile: "h4_probe", token: `${p[0]}.${p[1]}.${sig.toString("base64url")}`, body: { p_text: "x" } });
    rec("NEG-SIG", res.status === 401 ? "PASS" : "FAIL", { http: res.status, code: res.code });
  }
  {
    const res = await probe({ method: "POST", path: `/rest/v1/rpc/${RPC_ECHO}`, profile: "h4_probe", token: CFG.runtimeJwt, body: { p_text: "x" }, omitApiKey: true });
    rec("NEG-KEY", res.status === 401 ? "PASS" : "FAIL", { http: res.status, code: res.code });
  }
  {
    const res = await probe({ method: "POST", path: `/rest/v1/rpc/${RPC_ECHO}`, profile: "h4_probe", token: null, body: { p_text: "x" }, omitAuth: true });
    rec("NEG-ANON", failsClosed(res) ? "PASS" : "FAIL", { http: res.status, code: res.code });
  }

  finish(claims);
}

function emit(obj) {
  const json = JSON.stringify(obj, null, 2);
  if (CFG.outFile) { fs.writeFileSync(CFG.outFile, json + "\n"); process.stderr.write(`written ${CFG.outFile}\n`); }
  else process.stdout.write(json + "\n");
}
function finish(claims) {
  const gate = computeGate();
  emit({
    harness: "h4-probe-harness", generatedAt: new Date().toISOString(), target: CFG.url,
    residualNarrowAuthorityUntil: claims.exp ? new Date(claims.exp * 1000).toISOString() : null,
    verdict: gate.verdict, gate, results,
  });
  process.stderr.write(`\nH4 verdict=${gate.verdict}\n`);
  for (const r of results) process.stderr.write(`  ${String(r.verdict).padEnd(15)} ${r.id}${r.http ? " http=" + r.http : ""}${r.code ? " code=" + r.code : ""}\n`);
  if (gate.missing.length) process.stderr.write(`MISSING: ${gate.missing.join(", ")}\n`);
  if (gate.notPass.length) process.stderr.write(`NOT PASS: ${gate.notPass.join(", ")}\n`);
  process.exit(gate.verdict === "PASS" ? 0 : 1);
}

// ---- offline selftest -----------------------------------------------------
function selftest() {
  let bad = 0;
  const ok = (c, m) => { if (!c) { console.error("SELFTEST FAIL:", m); bad++; } };
  ok(boundaryReached({ status: 200 }) === true, "200 boundary");
  ok(boundaryReached({ status: 500 }) === false, "500 not boundary");
  ok(boundaryReached({ status: -1 }) === false, "transport not boundary");
  ok(boundaryReached({ status: 404, code: "PGRST202" }) === false, "routing 404 not boundary");
  ok(boundaryReached({ status: 400, code: "22P02" }) === true, "in-function pg error is boundary");
  ok(failsClosed({ status: 403 }) === true, "403 closed");
  ok(failsClosed({ status: 200 }) === false, "200 not closed");
  ok(failsClosed({ status: 500 }) === false, "500 not closed (ambiguous)");
  ok(failsClosed({ status: 406, code: "PGRST106" }) === true, "406 invalid-schema closed");
  ok(failsClosed({ status: 406, code: null }) === false, "generic 406 not closed");
  ok(storageFailsClosed({ status: 400, code: "AccessDenied", snippet: '{"statusCode":"403","error":"Unauthorized"}' }) === true, "wrapped storage 403 closed");
  ok(storageFailsClosed({ status: 400, code: "AccessDenied", snippet: "{}" }) === false, "ambiguous storage 400 not closed");
  // gate
  for (const id of REQUIRED) results.push({ id, verdict: "PASS" });
  ok(computeGate().verdict === "PASS", "full required set -> PASS");
  results.push({ id: "NEG-NET", verdict: "PASS" });
  ok(computeGate().verdict === "FAIL", "duplicate id -> FAIL");
  results.length = 0;
  for (const id of REQUIRED) results.push({ id, verdict: id === "NEG-AUTH" ? "FAIL" : "PASS" });
  ok(computeGate().verdict === "FAIL", "any FAIL -> FAIL");
  results.length = 0;
  for (const id of REQUIRED.filter((x) => x !== "NEG-CRON")) results.push({ id, verdict: "PASS" });
  ok(computeGate().verdict !== "PASS", "missing required -> not PASS");
  console.error(bad ? `\nSELFTEST: ${bad} FAILURE(S)` : "\nSELFTEST PASS");
  process.exit(bad ? 1 : 0);
}

if (process.argv.includes("--selftest")) selftest();
else main().catch((e) => { emit({ verdict: "ABORTED", reason: String(e && e.stack ? e.stack.split("\n")[0] : e) }); process.exit(1); });
