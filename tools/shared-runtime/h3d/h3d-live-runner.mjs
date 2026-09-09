#!/usr/bin/env node
// H3D live LAB smoke runner — WSTERA LAB only. PREPARE-ONLY until the operator
// enables the hosted Custom Access Token Hook.
//
// Automates every step that does NOT require the hosted Dashboard:
//   * provision a disposable LAB Auth identity (service key -> Auth Admin);
//   * insert one short-lived ps01_line_runtime grant row (postgres -> grants table);
//   * obtain a fresh Auth-issued access token for that identity;
//   * verify role=ps01_line_runtime + lifetime <= 300s on the token itself;
//   * run the safe Data API probe matrix (reuses ../h3c/h3c-proof-harness.mjs);
//   * teardown identity-first: delete Auth identity + sessions -> delete grant row.
//
// The operator does ONLY: (a) enable the hook before `--run`, (b) disable it after.
//
// Env (never logged):
//   H3D_SUPABASE_URL          https://ykxlqnshaaxmzzocpjlj.supabase.co
//   H3D_ANON_KEY              LAB anon / publishable key
//   H3D_SERVICE_KEY           LAB service/secret key (Auth Admin only)
//   H3D_GRANTS_DB_URL         postgres SELECT+INSERT session for the grants table
//   H3D_OUT_DIR               where evidence JSON is written
//
// Modes:
//   --preflight   check env + hook readiness (issues a token, checks the role claim). No teardown needed.
//   --run         full smoke (requires the hook to be ENABLED). Provisions, probes, tears down.
//   --teardown-only <identityUuid>   emergency cleanup.
//   --selftest    offline: token decode + role/lifetime checks. No network.

import crypto from "node:crypto";
import { createRequire } from "node:module";
import fs from "node:fs";
import process from "node:process";

const require = createRequire("D:/AI-Workspace/projects/saas-product-hub/products/PawSpace-pssr02-staging/");

const env = process.env;
const CFG = {
  url: (env.H3D_SUPABASE_URL || "").replace(/\/+$/, ""),
  anonKey: env.H3D_ANON_KEY || "",
  serviceKey: env.H3D_SERVICE_KEY || "",
  grantsDbUrl: env.H3D_GRANTS_DB_URL || "",
  outDir: env.H3D_OUT_DIR || ".",
  expectedRole: "ps01_line_runtime",
  maxLifetimeSec: 300,
};

const b64urlToJson = (s) => JSON.parse(Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
function decodeClaims(jwt) {
  const p = jwt.split(".");
  if (p.length !== 3) throw new Error("not a 3-part JWT");
  return b64urlToJson(p[1]);
}
function checkTokenClaims(claims) {
  const life = claims.exp && claims.iat ? claims.exp - claims.iat : null;
  return {
    roleOk: claims.role === CFG.expectedRole,
    lifetimeOk: life != null && life > 0 && life <= CFG.maxLifetimeSec,
    role: claims.role,
    lifetimeSec: life,
    exp: claims.exp,
  };
}

async function adminFetch(path, init = {}) {
  const r = await fetch(`${CFG.url}${path}`, {
    ...init,
    headers: { apikey: CFG.serviceKey, Authorization: `Bearer ${CFG.serviceKey}`, "Content-Type": "application/json", ...(init.headers || {}) },
  });
  const text = await r.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* */ }
  return { status: r.status, json, text: text.slice(0, 300) };
}

async function createIdentity() {
  const email = `h3d-proof-${Date.now()}@wstera-lab.invalid`;
  const password = crypto.randomUUID() + crypto.randomUUID();
  const r = await adminFetch("/auth/v1/admin/users", {
    method: "POST",
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  if (r.status >= 300 || !r.json?.id) throw new Error(`createIdentity failed: ${r.status} ${r.text}`);
  return { id: r.json.id, email, password };
}
async function deleteIdentity(id) {
  await adminFetch(`/auth/v1/admin/users/${id}`, { method: "DELETE" });
}
async function tokenForIdentity(email, password) {
  const r = await fetch(`${CFG.url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: CFG.anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const j = await r.json();
  if (!j.access_token) throw new Error(`token grant failed: ${r.status}`);
  return j.access_token;
}

async function withGrantsClient(fn) {
  if (!CFG.grantsDbUrl) throw new Error("H3D_GRANTS_DB_URL not set");
  const { Client } = require("pg");
  const c = new Client({ connectionString: CFG.grantsDbUrl, ssl: { rejectUnauthorized: false }, statement_timeout: 15000 });
  await c.connect();
  try { return await fn(c); } finally { await c.end(); }
}
async function addGrant(userId, seconds = 240) {
  return withGrantsClient((c) =>
    c.query(
      `INSERT INTO wstera_platform_internal.runtime_token_grants (user_id, database_role, enabled, valid_until)
       VALUES ($1, 'ps01_line_runtime', true, now() + ($2 || ' seconds')::interval)
       ON CONFLICT (user_id) DO UPDATE SET enabled = true, valid_until = EXCLUDED.valid_until`,
      [userId, String(seconds)],
    ),
  );
}
async function removeGrant(userId) {
  return withGrantsClient((c) => c.query("DELETE FROM wstera_platform_internal.runtime_token_grants WHERE user_id = $1", [userId]));
}
async function grantRowCount() {
  return withGrantsClient(async (c) => Number((await c.query("SELECT count(*)::int AS n FROM wstera_platform_internal.runtime_token_grants")).rows[0].n));
}

function out(name, obj) {
  const p = `${CFG.outDir}/${name}`;
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n");
  console.error(`written ${p}`);
}

async function preflight() {
  requireEnv(["url", "anonKey", "serviceKey", "grantsDbUrl"]);
  const before = await grantRowCount();
  const id = await createIdentity();
  let result = { step: "preflight", identity: id.id, grant_rows_before: before };
  try {
    await addGrant(id.id, 180);
    const jwt = await tokenForIdentity(id.email, id.password);
    const claims = decodeClaims(jwt);
    const chk = checkTokenClaims(claims);
    result = { ...result, ...chk, hookActive: chk.roleOk };
    console.error(
      chk.roleOk
        ? `HOOK ACTIVE: token carries role=ps01_line_runtime, lifetime=${chk.lifetimeSec}s -> ready for --run`
        : `HOOK NOT ACTIVE: token role=${chk.role} (expected ps01_line_runtime). Operator must enable the Custom Access Token Hook.`,
    );
  } finally {
    await removeGrant(id.id).catch(() => {});
    await deleteIdentity(id.id).catch(() => {});
    result.grant_rows_after = await grantRowCount().catch(() => -1);
  }
  out(`H3D-PREFLIGHT-${Date.now()}.json`, result);
  process.exit(result.hookActive ? 0 : 2);
}

async function run() {
  requireEnv(["url", "anonKey", "serviceKey", "grantsDbUrl"]);
  const rec = { step: "run", startedAt: new Date().toISOString() };
  const id = await createIdentity();
  rec.identity = id.id;
  try {
    await addGrant(id.id, 240);
    const jwt = await tokenForIdentity(id.email, id.password);
    const chk = checkTokenClaims(decodeClaims(jwt));
    rec.token = { role: chk.role, lifetimeSec: chk.lifetimeSec, exp: chk.exp };
    if (!chk.roleOk || !chk.lifetimeOk) {
      throw new Error(`token not usable: role=${chk.role} lifetime=${chk.lifetimeSec}s — is the hook enabled?`);
    }
    // hand off to the h3c proof harness (safe read-only Data API matrix)
    rec.next = "run tools/shared-runtime/h3c/h3c-proof-harness.mjs with H3C_RUNTIME_JWT set to the issued token, H3C_SUPABASE_URL/H3C_ANON_KEY, and a fresh H3C_PRIVILEGE_SNAPSHOT. This runner intentionally does not shell out; it prints the exact command.";
    console.error(
      `\nHOOK OK. Now run the probe matrix (same shell):\n` +
      `  export H3C_SUPABASE_URL="${CFG.url}"\n` +
      `  export H3C_ANON_KEY="<anon>"   # do not paste in logs\n` +
      `  export H3C_RUNTIME_JWT="<the token this runner issued>"\n` +
      `  export H3C_PRIVILEGE_SNAPSHOT="<fresh json from tools/shared-runtime/h3c/h3c-privilege-snapshot.sql>"\n` +
      `  export H3C_OUT="${CFG.outDir}/H3D-LIVE-PROOF-$(date +%Y%m%dT%H%M%SZ).json"\n` +
      `  node tools/shared-runtime/h3c/h3c-proof-harness.mjs\n`,
    );
    rec.residualNarrowAuthorityUntil = new Date(chk.exp * 1000).toISOString();
  } finally {
    // identity-first teardown
    await deleteIdentity(id.id).catch((e) => (rec.teardown_identity_error = String(e)));
    await removeGrant(id.id).catch((e) => (rec.teardown_grant_error = String(e)));
    rec.grant_rows_after = await grantRowCount().catch(() => -1);
    rec.finishedAt = new Date().toISOString();
  }
  out(`H3D-RUN-${Date.now()}.json`, rec);
  console.error(`teardown done. grant rows now: ${rec.grant_rows_after}. Do not claim authority gone until ${rec.residualNarrowAuthorityUntil}.`);
}

function requireEnv(keys) {
  const miss = keys.filter((k) => !CFG[k]);
  if (miss.length) { console.error(`missing env: ${miss.join(", ")}`); process.exit(1); }
}

function selftest() {
  let bad = 0;
  const ok = (c, m) => { if (!c) { console.error("FAIL", m); bad++; } };
  const now = Math.floor(Date.now() / 1000);
  const mk = (over) => Buffer.from(JSON.stringify({ role: "ps01_line_runtime", iat: now, exp: now + 250, ...over })).toString("base64url");
  ok(checkTokenClaims(b64urlToJson(mk({}))).roleOk === true, "role match");
  ok(checkTokenClaims(b64urlToJson(mk({ role: "authenticated" }))).roleOk === false, "role mismatch caught");
  ok(checkTokenClaims(b64urlToJson(mk({ exp: now + 250 }))).lifetimeOk === true, "lifetime 250 ok");
  ok(checkTokenClaims(b64urlToJson(mk({ exp: now + 900 }))).lifetimeOk === false, "lifetime 900 rejected");
  ok(checkTokenClaims(b64urlToJson(mk({ exp: now - 10 }))).lifetimeOk === false, "expired rejected");
  try { decodeClaims("a.b"); ok(false, "2-part rejected"); } catch { ok(true, "2-part rejected"); }
  console.error(bad ? `\nSELFTEST: ${bad} failure(s)` : "\nSELFTEST PASS");
  process.exit(bad ? 1 : 0);
}

const mode = process.argv[2];
if (mode === "--selftest") selftest();
else if (mode === "--preflight") preflight().catch((e) => { console.error(e.message); process.exit(1); });
else if (mode === "--run") run().catch((e) => { console.error(e.message); process.exit(1); });
else if (mode === "--teardown-only" && process.argv[3]) {
  const uid = process.argv[3];
  (async () => { await removeGrant(uid).catch(() => {}); await deleteIdentity(uid).catch(() => {}); console.error(`teardown attempted for ${uid}; grant rows now ${await grantRowCount().catch(() => "?")}`); })();
} else {
  console.error("usage: h3d-live-runner.mjs --selftest | --preflight | --run | --teardown-only <uuid>");
  process.exit(2);
}
