#!/usr/bin/env node
// H3D live LAB smoke orchestrator — WSTERA LAB only.
//
// One coherent one-shot flow (remediation brief 2026-09-09):
//   preflight -> [operator enables hook] -> runtime+control identities/grant ->
//   expired runtime JWT (issued early, waited out) -> fresh privilege snapshot ->
//   fresh runtime JWT -> spawn h3c-proof-harness with tokens in the child ENV
//   (never argv, never stdout, never disk) -> read verdict -> identity-first
//   teardown (verified) -> [operator disables hook] -> residual-expiry note ->
//   inventory compare.
//
// SECURITY: no raw JWT / password / key / DB-URL-with-password is ever printed,
// written to evidence, or placed on a command line. Evidence records only:
// identity UUIDs, issuer, project ref, role, iat, exp, lifetime, probe verdicts,
// HTTP/error classes. Cleanup failure makes the run fail.
//
// `pg` is this tool tree's own dependency (tools/shared-runtime/package.json).
//
// Env (operator-supplied; never logged):
//   H3D_SUPABASE_URL    https://ykxlqnshaaxmzzocpjlj.supabase.co
//   H3D_ANON_KEY        LAB anon / publishable key
//   H3D_SERVICE_KEY     LAB service/secret key (Auth Admin only)
//   H3D_GRANTS_DB_URL   postgres session that can SELECT/INSERT/DELETE
//                       wstera_platform_internal.runtime_token_grants and run
//                       the read-only privilege snapshot
//   H3D_OUT_DIR         evidence output dir (default: cwd)
//   H3D_HOUSE_ROOT      House worktree root (default: resolved from this file)
//
// Modes:  --selftest | --preflight | --run | --teardown-only <uuid[,uuid...]>

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import pg from "pg";

const { Client } = pg;
const HERE = path.dirname(fileURLToPath(import.meta.url));
const HOUSE_ROOT = process.env.H3D_HOUSE_ROOT || path.resolve(HERE, "../../..");
const HARNESS = path.join(HOUSE_ROOT, "tools/shared-runtime/h3c/h3c-proof-harness.mjs");
const SNAPSHOT_SQL = path.join(HOUSE_ROOT, "tools/shared-runtime/h3c/h3c-privilege-snapshot.sql");
const H3B_EVIDENCE = path.join(HOUSE_ROOT, "docs/platform/shared-runtime/evidence/H3B-POST-APPLY-RUNTIME-BOUNDARY-2026-09-08.md");

const CFG = {
  url: (process.env.H3D_SUPABASE_URL || "").replace(/\/+$/, ""),
  anonKey: process.env.H3D_ANON_KEY || "",
  serviceKey: process.env.H3D_SERVICE_KEY || "",
  grantsDbUrl: process.env.H3D_GRANTS_DB_URL || "",
  outDir: process.env.H3D_OUT_DIR || process.cwd(),
  expectedRole: "ps01_line_runtime",
  maxLifetimeSec: 300,
  grantValiditySec: 900, // grant row outlives both token issuances
  expiryMarginSec: 75,
};

// ---- helpers -------------------------------------------------------------
const b64urlToJson = (s) => JSON.parse(Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
function claimsOf(jwt) {
  const p = String(jwt).split(".");
  if (p.length !== 3) throw new Error("not a 3-part JWT");
  return b64urlToJson(p[1]);
}
function classifyToken(jwt) {
  const c = claimsOf(jwt);
  const life = c.exp && c.iat ? c.exp - c.iat : null;
  return {
    role: c.role,
    iss: c.iss || null,
    ref: (c.iss || "").match(/([a-z0-9]{20})\.supabase\./i)?.[1] || c.ref || null,
    iat: c.iat, exp: c.exp, lifetimeSec: life,
    subPrefix: typeof c.sub === "string" ? c.sub.slice(0, 8) : null,
    roleIsRuntime: c.role === CFG.expectedRole,
    lifetimeOk: life != null && life > 0 && life <= CFG.maxLifetimeSec,
    expired: typeof c.exp === "number" && c.exp * 1000 <= Date.now(),
  };
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function requireEnv(keys) {
  const miss = keys.filter((k) => !CFG[k]);
  if (miss.length) { fail(`missing env: ${miss.map((k) => "H3D_" + k.replace(/([A-Z])/g, "_$1").toUpperCase()).join(", ")}`); }
}
function fail(msg) { process.stderr.write(`\nSTOP: ${msg}\n`); process.exit(1); }

function out(name, obj) {
  fs.mkdirSync(CFG.outDir, { recursive: true });
  const p = path.join(CFG.outDir, name);
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n");
  process.stderr.write(`evidence: ${p}\n`);
  return p;
}

async function adminFetch(pth, init = {}) {
  const r = await fetch(`${CFG.url}${pth}`, {
    ...init,
    headers: { apikey: CFG.serviceKey, Authorization: `Bearer ${CFG.serviceKey}`, "Content-Type": "application/json", ...(init.headers || {}) },
  });
  const text = await r.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* */ }
  return { status: r.status, json, text: text.slice(0, 240) };
}
async function createIdentity(tag) {
  const email = `h3d-${tag}-${Date.now()}-${crypto.randomInt(1e6)}@wstera-lab.invalid`;
  const password = crypto.randomUUID() + crypto.randomUUID();
  const r = await adminFetch("/auth/v1/admin/users", { method: "POST", body: JSON.stringify({ email, password, email_confirm: true }) });
  if (r.status >= 300 || !r.json?.id) throw new Error(`createIdentity(${tag}) ${r.status}: ${r.text}`);
  return { id: r.json.id, email, password };
}
async function deleteIdentity(id) {
  const r = await adminFetch(`/auth/v1/admin/users/${id}`, { method: "DELETE" });
  return r.status < 300 || r.status === 404;
}
async function identityExists(id) {
  const r = await adminFetch(`/auth/v1/admin/users/${id}`, { method: "GET" });
  return r.status === 200;
}
async function tokenFor(id) {
  const r = await fetch(`${CFG.url}/auth/v1/token?grant_type=password`, {
    method: "POST", headers: { apikey: CFG.anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email: id.email, password: id.password }),
  });
  const j = await r.json();
  if (!j.access_token) throw new Error(`token grant failed ${r.status}`);
  return j.access_token;
}

async function withDb(fn) {
  const c = new Client({ connectionString: CFG.grantsDbUrl, ssl: { rejectUnauthorized: false }, statement_timeout: 20000 });
  await c.connect();
  try { return await fn(c); } finally { await c.end(); }
}
async function addGrant(userId) {
  await withDb((c) => c.query(
    `INSERT INTO wstera_platform_internal.runtime_token_grants (user_id, database_role, enabled, valid_until)
     VALUES ($1, 'ps01_line_runtime', true, now() + ($2 || ' seconds')::interval)
     ON CONFLICT (user_id) DO UPDATE SET enabled = true, valid_until = EXCLUDED.valid_until`,
    [userId, String(CFG.grantValiditySec)],
  ));
}
async function removeGrant(userId) {
  await withDb((c) => c.query("DELETE FROM wstera_platform_internal.runtime_token_grants WHERE user_id = $1", [userId]));
}
async function grantExists(userId) {
  return withDb(async (c) => (await c.query("SELECT 1 FROM wstera_platform_internal.runtime_token_grants WHERE user_id = $1", [userId])).rowCount > 0);
}
async function grantRowCount() {
  return withDb(async (c) => Number((await c.query("SELECT count(*)::int n FROM wstera_platform_internal.runtime_token_grants")).rows[0].n));
}
async function writeFreshSnapshot() {
  const sql = fs.readFileSync(SNAPSHOT_SQL, "utf8");
  const row = await withDb(async (c) => (await c.query(sql)).rows[0]);
  const snap = row.snapshot ?? row;
  const p = path.join(CFG.outDir, `H3D-PRIVILEGE-SNAPSHOT-${Date.now()}.json`);
  fs.mkdirSync(CFG.outDir, { recursive: true });
  fs.writeFileSync(p, JSON.stringify(snap) + "\n");
  return p;
}
async function resolvePs01TableCol() {
  return withDb(async (c) => {
    const r = await c.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema='ps01' AND table_name='bookings' AND is_nullable='YES'
       ORDER BY ordinal_position LIMIT 1`,
    );
    return r.rows[0]?.column_name || null;
  });
}

// Read-only discovery of a REAL cross-tenant authorization fixture set from
// current WSTERA LAB data (H3D authz-fixture remediation 2026-09-09). SELECT
// only — every query is checked for mutating keywords before execution. Returns
// { ok:true, fixtures } or { ok:false, reason } (a scarcity STOP, not an error).
//
// PS01 relationship model (verified from the live RPC bodies + baseline DDL):
//   ps01.pet_owners(id, shop_id, line_user_id)  UNIQUE(shop_id,line_user_id) -- customer<->shop link
//   ps01.shops(id, slug)
//   ps01.pets(id, shop_id, owner_id)   FK (shop_id,owner_id) -> pet_owners(shop_id,id)
//   ps01.rooms(id, shop_id, capacity_pets)
//   ps01.room_rate_plans(id, shop_id, room_id, is_active)  FK (shop_id,room_id) -> rooms(shop_id,id)
//
// resolve_booking_v2_quote_internal: rate plan matched on (id, shop_id, room_id)
//   -> assert_booking_window_available_internal: owner must exist for shop; room
//   capacity_pets >= |pets|; every pet must satisfy (shop_id, owner_id, id).
//
// Invariant A (House review): room + active rate plan MUST be one joined pair
//   where plan.room_id = room.id AND both belong to the baseline shop.
// Invariant B (House review): the POS-AUTHZ-3 foreign pet MUST be in the baseline
//   shop, owned by a different real pet_owners row in that same shop — so the
//   rejection proves cross-CUSTOMER ownership isolation, not just shop scope.
const MUTATING_SQL = /\b(insert|update|delete|upsert|merge|create|alter|drop|truncate|grant|revoke)\b/i;
async function discoverAuthzFixtures() {
  return withDb(async (c) => {
    const sel = async (name, sql, params = []) => {
      if (MUTATING_SQL.test(sql)) throw new Error(`discovery query "${name}" is not read-only`);
      return (await c.query(sql, params)).rows;
    };

    // Fixture A — baseline: a real pet_owner with a linked LINE identity + at
    // least one pet of that owner (baseline positive context).
    const [baseline] = await sel("baseline",
      `SELECT po.id AS owner_id, po.shop_id, po.line_user_id
       FROM ps01.pet_owners po
       JOIN ps01.shops s ON s.id = po.shop_id
       WHERE po.line_user_id IS NOT NULL AND btrim(po.line_user_id) <> ''
         AND EXISTS (SELECT 1 FROM ps01.pets p WHERE p.shop_id = po.shop_id AND p.owner_id = po.id)
       ORDER BY po.created_at NULLS LAST, po.id
       LIMIT 1`);
    if (!baseline) return { ok: false, reason: "Fixture A: no ps01.pet_owners row with a linked line_user_id AND at least one owned pet exists in LAB" };

    const [baselinePet] = await sel("baselinePet",
      `SELECT id FROM ps01.pets WHERE shop_id = $1 AND owner_id = $2 ORDER BY id LIMIT 1`,
      [baseline.shop_id, baseline.owner_id]);

    // Fixture B — cross-shop: a real second shop the baseline LINE user is NOT linked to.
    const [otherShop] = await sel("otherShop",
      `SELECT s.id AS shop_id
       FROM ps01.shops s
       WHERE s.id <> $1
         AND NOT EXISTS (
           SELECT 1 FROM ps01.pet_owners po2
           WHERE po2.shop_id = s.id AND btrim(po2.line_user_id) = btrim($2))
       ORDER BY s.id
       LIMIT 1`, [baseline.shop_id, baseline.line_user_id]);
    if (!otherShop) return { ok: false, reason: "Fixture B: no second ps01.shops row exists that the baseline line_user is provably not linked to" };

    // Invariant A — room + active rate plan as ONE joined pair in the baseline shop.
    const [pair] = await sel("roomPlanPair",
      `SELECT r.id AS room_id, rp.id AS rate_plan_id, r.capacity_pets
       FROM ps01.rooms r
       JOIN ps01.room_rate_plans rp
         ON rp.room_id = r.id AND rp.shop_id = r.shop_id
       WHERE r.shop_id = $1 AND rp.is_active = TRUE
       ORDER BY r.id, rp.id
       LIMIT 1`, [baseline.shop_id]);
    if (!pair) return { ok: false, reason: "Fixture C support: baseline shop has no (room + active room_rate_plans WHERE plan.room_id = room.id) pair" };

    // Invariant B — foreign pet: baseline shop, different real owner in that shop.
    const foreignPets = await sel("foreignPets",
      `SELECT p.id
       FROM ps01.pets p
       JOIN ps01.pet_owners po2 ON po2.id = p.owner_id AND po2.shop_id = p.shop_id
       WHERE p.shop_id = $1 AND po2.id <> $2
       ORDER BY p.id
       LIMIT LEAST(2, $3::int)`, [baseline.shop_id, baseline.owner_id, Math.max(1, pair.capacity_pets)]);
    if (foreignPets.length === 0) return { ok: false, reason: "Fixture C: no ps01.pets in the baseline shop owned by a different pet_owners row (cross-customer, same shop)" };

    return {
      ok: true,
      fixtures: {
        baselineShopId: baseline.shop_id,
        baselineOwnerId: baseline.owner_id,
        baselineLineUserId: baseline.line_user_id,
        baselinePetIds: baselinePet ? [baselinePet.id] : [],
        otherShopId: otherShop.shop_id,
        roomId: pair.room_id,
        ratePlanId: pair.rate_plan_id,
        otherPetIds: foreignPets.map((r) => r.id),
      },
    };
  });
}
// non-PII assertion projection for evidence.
function fixtureAssertion(f) {
  return {
    baseline_shop_id: f.baselineShopId,
    baseline_owner_id: f.baselineOwnerId,
    baseline_line_user_ref: `${String(f.baselineLineUserId).slice(0, 3)}…${crypto.createHash("sha256").update(String(f.baselineLineUserId)).digest("hex").slice(0, 8)}`,
    baseline_pet_ids: f.baselinePetIds,
    cross_shop_id: f.otherShopId,
    quote_room_id: f.roomId,
    quote_rate_plan_id: f.ratePlanId,
    cross_customer_pet_ids: f.otherPetIds,
    invariant_A: "quote_room_id + quote_rate_plan_id are one joined pair: room_rate_plans.room_id = rooms.id AND both shop_id = baseline_shop_id AND plan is_active",
    invariant_B: "each cross_customer_pet_id is a ps01.pets row with shop_id = baseline_shop_id and owner_id <> baseline_owner_id, backed by a real second ps01.pet_owners row in baseline_shop_id",
    relationship_assertions: [
      "baseline_owner is a real ps01.pet_owners row with shop_id=baseline_shop_id and a linked line_user_id",
      "cross_shop_id is a real ps01.shops row with NO pet_owners link for the baseline line_user (proven by NOT EXISTS)",
      "quote_room_id / quote_rate_plan_id are real active rows in baseline_shop_id",
      "cross_customer_pet_ids are real ps01.pets rows whose owner_id <> baseline_owner_id",
    ],
  };
}

function spawnHarness(env) {
  return new Promise((resolve) => {
    execFile("node", [HARNESS], { env, timeout: 150000, maxBuffer: 4 * 1024 * 1024 }, (err, stdout, stderr) => {
      resolve({ code: err ? (typeof err.code === "number" ? err.code : 1) : 0, stderrTail: String(stderr).split("\n").slice(-40).join("\n") });
    });
  });
}

// ---- preflight ----------------------------------------------------------
async function preflight() {
  requireEnv(["url", "anonKey", "serviceKey", "grantsDbUrl"]);
  const checks = {};
  checks.harness_present = fs.existsSync(HARNESS);
  checks.snapshot_sql_present = fs.existsSync(SNAPSHOT_SQL);
  checks.h3b_evidence_present = fs.existsSync(H3B_EVIDENCE);
  if (!checks.harness_present || !checks.snapshot_sql_present || !checks.h3b_evidence_present) {
    out(`H3D-PREFLIGHT-${Date.now()}.json`, { step: "preflight", checks });
    fail(`missing repo file(s): ${Object.entries(checks).filter(([, v]) => !v).map(([k]) => k).join(", ")}`);
  }

  let col = null;
  try { col = await resolvePs01TableCol(); } catch (e) { fail(`cannot read ps01.bookings columns: ${e.message}`); }
  checks.ps01_table_col_resolved = Boolean(col);
  if (!col) fail("could not resolve a nullable ps01.bookings column for NEG-TBL-2");

  let snapOk = false;
  try {
    const p = await writeFreshSnapshot();
    const s = JSON.parse(fs.readFileSync(p, "utf8"));
    snapOk = Number(s.exec_count) === 3 && Number(s.write_count) === 0 && s.role_no_login === true
      && s.public_rls_auto_enable_exec === false && s.local_service_usage === false;
    fs.unlinkSync(p);
  } catch (e) { fail(`privilege snapshot failed: ${e.message}`); }
  checks.privilege_snapshot_valid = snapOk;
  if (!snapOk) fail("privilege snapshot does not match the expected ps01_line_runtime boundary");

  // REAL cross-tenant authorization fixtures — read-only, BEFORE any operator hook action.
  let discovery = { ok: false, reason: "not attempted" };
  try { discovery = await discoverAuthzFixtures(); }
  catch (e) { fail(`AUTHZ fixture discovery error: ${e.message}`); }
  checks.authz_fixtures_discovered = discovery.ok;
  if (!discovery.ok) {
    out(`H3D-PREFLIGHT-${Date.now()}.json`, {
      step: "preflight", generatedAt: new Date().toISOString(), checks,
      resolved: { ps01_table_col: col },
      authz_fixture_discovery: { ok: false, reason: discovery.reason },
      verdict: `STOP — real cross-shop / cross-customer AUTHZ fixtures cannot be discovered read-only (${discovery.reason}). Seeding PS01 business rows is a LAB mutation and is not authorized here.`,
    });
    fail(`AUTHZ fixture discovery: ${discovery.reason}`);
  }

  const before = await grantRowCount();
  checks.grant_rows_before = before;

  // hook-readiness probe: create identity + grant + token, read the role claim, teardown.
  const probeId = await createIdentity("preflight");
  let hookActive = false;
  let tokenClass = null;
  try {
    await addGrant(probeId.id);
    const jwt = await tokenFor(probeId);
    tokenClass = classifyToken(jwt);
    hookActive = tokenClass.roleIsRuntime;
  } finally {
    const gGone = (await removeGrant(probeId.id), !(await grantExists(probeId.id)));
    const iGone = (await deleteIdentity(probeId.id), !(await identityExists(probeId.id)));
    checks.probe_teardown_grant_removed = gGone;
    checks.probe_teardown_identity_removed = iGone;
    if (!gGone || !iGone) fail("preflight probe teardown incomplete");
  }
  checks.grant_rows_after = await grantRowCount();
  checks.hook_active = hookActive;

  const result = {
    step: "preflight", generatedAt: new Date().toISOString(), checks,
    resolved: { ps01_table_col: col },
    authz_fixture_discovery: { ok: true, assertion: fixtureAssertion(discovery.fixtures) },
    probe_token: tokenClass ? { role: tokenClass.role, lifetimeSec: tokenClass.lifetimeSec, ref: tokenClass.ref } : null,
    verdict: hookActive ? "READY (hook active) — run --run" : "NOT READY — operator must enable the Custom Access Token hook, then re-run --preflight",
  };
  out(`H3D-PREFLIGHT-${Date.now()}.json`, result);
  process.stderr.write(`\n${result.verdict}\n`);
  process.exit(hookActive ? 0 : 2);
}

// ---- run ---------------------------------------------------------------
async function run() {
  requireEnv(["url", "anonKey", "serviceKey", "grantsDbUrl"]);
  if (!fs.existsSync(HARNESS) || !fs.existsSync(SNAPSHOT_SQL) || !fs.existsSync(H3B_EVIDENCE)) {
    fail("required repo file missing — run --preflight");
  }
  const rec = { step: "run", startedAt: new Date().toISOString(), identities: {}, tokens: {}, teardown: {} };
  const grantRowsBefore = await grantRowCount();
  rec.grant_rows_before = grantRowsBefore;

  const runtimeId = await createIdentity("runtime");
  const controlId = await createIdentity("control");
  rec.identities.runtime = runtimeId.id;
  rec.identities.control = controlId.id;

  let harnessOut = null;
  try {
    await addGrant(runtimeId.id);

    // expired token: issued now, waited out below.
    const expiredJwt = await tokenFor(runtimeId);
    const expiredClass = classifyToken(expiredJwt);
    rec.tokens.expired = { role: expiredClass.role, iat: expiredClass.iat, exp: expiredClass.exp, lifetimeSec: expiredClass.lifetimeSec };
    if (!expiredClass.roleIsRuntime) throw new Error(`hook not active: runtime token role=${expiredClass.role}`);

    // control token: NO grant row -> must stay role=authenticated, uncapped.
    const controlJwt = await tokenFor(controlId);
    const controlClass = classifyToken(controlJwt);
    rec.tokens.control = { role: controlClass.role, iat: controlClass.iat, exp: controlClass.exp, lifetimeSec: controlClass.lifetimeSec };
    if (controlClass.role !== "authenticated") throw new Error(`control identity got role=${controlClass.role} (hook leaked to a non-allowlisted user)`);

    const tableCol = await resolvePs01TableCol();
    if (!tableCol) throw new Error("could not resolve ps01.bookings column");

    // REAL authorization fixtures — no random-UUID fallback (authz-fixture remediation).
    const discovery = await discoverAuthzFixtures();
    if (!discovery.ok) throw new Error(`AUTHZ fixture discovery failed: ${discovery.reason} — cannot run POS-AUTHZ-1/3 without real foreign relationships`);
    const fx = discovery.fixtures;
    rec.authz_fixtures = fixtureAssertion(fx);

    // wait until the expired token is genuinely past exp.
    const waitMs = Math.max(0, (expiredClass.exp + CFG.expiryMarginSec) * 1000 - Date.now());
    process.stderr.write(`waiting ${Math.round(waitMs / 1000)}s for the runtime token to expire...\n`);
    await sleep(waitMs);
    if (!classifyToken(expiredJwt).expired) throw new Error("expired-token wait did not produce an expired JWT");

    // fresh privilege snapshot + fresh active runtime token, right before probing.
    const snapshotPath = await writeFreshSnapshot();
    const activeJwt = await tokenFor(runtimeId);
    const activeClass = classifyToken(activeJwt);
    rec.tokens.active = { role: activeClass.role, iat: activeClass.iat, exp: activeClass.exp, lifetimeSec: activeClass.lifetimeSec, ref: activeClass.ref, subPrefix: activeClass.subPrefix };
    if (!activeClass.roleIsRuntime || !activeClass.lifetimeOk) throw new Error(`fresh runtime token unusable: role=${activeClass.role} lifetime=${activeClass.lifetimeSec}s`);
    rec.residualNarrowAuthorityUntil = new Date(activeClass.exp * 1000).toISOString();

    // spawn the h3c proof harness — tokens go in the child ENV only.
    const harnessJsonPath = path.join(CFG.outDir, `H3D-LIVE-PROOF-${Date.now()}.json`);
    const childEnv = {
      ...process.env,
      H3C_SUPABASE_URL: CFG.url,
      H3C_ANON_KEY: CFG.anonKey,
      H3C_RUNTIME_JWT: activeJwt,
      H3C_CONTROL_JWT: controlJwt,
      H3C_EXPIRED_JWT: expiredJwt,
      H3C_PRIVILEGE_SNAPSHOT: snapshotPath,
      H3C_H3B_EVIDENCE: H3B_EVIDENCE,
      H3C_PS01_TABLE: "bookings",
      H3C_PS01_TABLE_COL: tableCol,
      // real, internally consistent authorization matrix from live LAB rows:
      H3C_FIX_SHOP_ID: fx.baselineShopId,
      H3C_FIX_LINE_USER_ID: fx.baselineLineUserId,
      H3C_FIX_PET_IDS: fx.baselinePetIds.join(","),
      H3C_FIX_OTHER_SHOP_ID: fx.otherShopId,
      H3C_FIX_ROOM_ID: fx.roomId,
      H3C_FIX_RATE_PLAN_ID: fx.ratePlanId,
      H3C_FIX_OTHER_PET_IDS: fx.otherPetIds.join(","),
      H3C_OUT: harnessJsonPath,
    };
    process.stderr.write("running h3c-proof-harness (child process, tokens in env only)...\n");
    const child = await spawnHarness(childEnv);
    try { fs.unlinkSync(snapshotPath); } catch { /* keep on failure */ }

    let hv = { verdict: "UNKNOWN" };
    try { hv = JSON.parse(fs.readFileSync(harnessJsonPath, "utf8")); } catch { /* */ }
    harnessOut = harnessJsonPath;
    rec.harness = {
      exitCode: child.code,
      verdict: hv.verdict,
      gate: hv.gate ? { missing: hv.gate.missing, requiredNotPass: hv.gate.requiredNotPass, duplicates: hv.gate.duplicates } : null,
      counts: hv.counts || null,
      evidenceFile: path.basename(harnessJsonPath),
    };
    rec.stderrTail = child.stderrTail;
  } catch (e) {
    rec.error = String(e.message || e);
  } finally {
    // identity-first teardown, verified per exact id.
    rec.teardown.runtime_identity_deleted = await deleteIdentity(runtimeId.id).catch(() => false);
    rec.teardown.control_identity_deleted = await deleteIdentity(controlId.id).catch(() => false);
    await removeGrant(runtimeId.id).catch(() => {});
    rec.teardown.runtime_identity_gone = !(await identityExists(runtimeId.id).catch(() => true));
    rec.teardown.control_identity_gone = !(await identityExists(controlId.id).catch(() => true));
    rec.teardown.runtime_grant_gone = !(await grantExists(runtimeId.id).catch(() => true));
    rec.teardown.grant_rows_after = await grantRowCount().catch(() => -1);
    // a pre-existing unrelated grant row is not our failure; our own must be gone.
    rec.teardown.no_new_residual_grant = rec.teardown.grant_rows_after <= grantRowsBefore;
    rec.finishedAt = new Date().toISOString();
  }

  const cleanupOk = rec.teardown.runtime_identity_gone && rec.teardown.control_identity_gone
    && rec.teardown.runtime_grant_gone && rec.teardown.no_new_residual_grant;
  const pass = !rec.error && rec.harness?.verdict === "PASS" && rec.harness?.exitCode === 0 && cleanupOk;
  rec.verdict = pass ? "H3D LIVE PASS" : (rec.error || !cleanupOk ? "H3D RUN FAILED" : `H3D LIVE NOT PASS (harness ${rec.harness?.verdict})`);
  rec.cleanupOk = cleanupOk;

  out(`H3D-RUN-${Date.now()}.json`, rec);
  process.stderr.write(`\n${rec.verdict}\n`);
  process.stderr.write(`teardown: identities gone R=${rec.teardown.runtime_identity_gone} C=${rec.teardown.control_identity_gone}, our grant gone=${rec.teardown.runtime_grant_gone}, grant rows ${rec.teardown.grant_rows_after}\n`);
  if (rec.residualNarrowAuthorityUntil) process.stderr.write(`do not declare authority gone before ${rec.residualNarrowAuthorityUntil}\n`);
  if (harnessOut) process.stderr.write(`harness evidence: ${harnessOut}\n`);
  process.exit(pass ? 0 : 1);
}

async function teardownOnly(csv) {
  requireEnv(["url", "serviceKey", "grantsDbUrl"]);
  const ids = csv.split(",").map((s) => s.trim()).filter(Boolean);
  const rec = { step: "teardown-only", ids: {} };
  for (const id of ids) {
    await deleteIdentity(id).catch(() => {});
    await removeGrant(id).catch(() => {});
    rec.ids[id] = { identity_gone: !(await identityExists(id).catch(() => true)), grant_gone: !(await grantExists(id).catch(() => true)) };
  }
  rec.grant_rows_after = await grantRowCount().catch(() => -1);
  out(`H3D-TEARDOWN-${Date.now()}.json`, rec);
  const ok = Object.values(rec.ids).every((v) => v.identity_gone && v.grant_gone);
  process.exit(ok ? 0 : 1);
}

// ---- offline selftest -------------------------------------------------
function selftest() {
  let bad = 0;
  const ok = (c, m) => { if (!c) { process.stderr.write(`FAIL ${m}\n`); bad++; } };
  const now = Math.floor(Date.now() / 1000);
  const mk = (o) => `h.${Buffer.from(JSON.stringify({ role: "ps01_line_runtime", iss: "https://ykxlqnshaaxmzzocpjlj.supabase.co/auth/v1", iat: now, exp: now + 250, sub: "abcdef01-1111-2222-3333-444444444444", ...o })).toString("base64url")}.s`;

  ok(classifyToken(mk({})).roleIsRuntime === true, "role match");
  ok(classifyToken(mk({ role: "authenticated" })).roleIsRuntime === false, "role mismatch caught");
  ok(classifyToken(mk({ exp: now + 250 })).lifetimeOk === true, "lifetime 250 ok");
  ok(classifyToken(mk({ exp: now + 900 })).lifetimeOk === false, "lifetime 900 rejected (hook not capping)");
  ok(classifyToken(mk({ exp: now - 5 })).expired === true, "expired detected");
  ok(classifyToken(mk({})).ref === "ykxlqnshaaxmzzocpjlj", "project ref from issuer");
  ok(classifyToken(mk({})).subPrefix === "abcdef01" && !JSON.stringify(classifyToken(mk({}))).includes("444444444444"), "sub redacted to prefix");
  try { classifyToken("a.b"); ok(false, "2-part rejected"); } catch { ok(true, "2-part rejected"); }

  const src = fs.readFileSync(fileURLToPath(import.meta.url), "utf8");
  // remediation blocker 3: no machine-specific absolute path.
  ok(!/[A-Za-z]:\/(?:Users|AI-Workspace)/.test(src) && !/createRequire\(/.test(src), "no absolute path / createRequire in source");
  // remediation blocker 1: tokens reach the harness via child ENV, never argv/stdout.
  ok(src.includes("H3C_RUNTIME_JWT: activeJwt") && src.includes("childEnv") && src.includes("execFile(\"node\", [HARNESS]"), "runtime JWT handed to harness via child env");
  ok(!/console\.log\([^)]*[Jj]wt/.test(src) && !/stdout\.write\([^)]*[Jj]wt/.test(src), "no jwt printed to stdout");
  ok(src.includes("H3C_CONTROL_JWT: controlJwt") && src.includes("H3C_EXPIRED_JWT: expiredJwt"), "control + expired JWT wired as required inputs");
  ok(src.includes("H3C_PS01_TABLE_COL: tableCol") && src.includes("resolvePs01TableCol"), "table column resolved, not placeholdered");
  // remediation: teardown happens after proof consumption, verified per-id.
  ok(src.indexOf("teardown.runtime_identity_deleted") > src.indexOf("await spawnHarness(childEnv)"),
    "identity teardown code runs after the harness spawn");
  ok(src.indexOf("rec.error = String") < src.indexOf("} finally {\n    // identity-first teardown"),
    "teardown finally wraps the harness run");
  ok(src.includes("identityExists(runtimeId.id)") && src.includes("grantExists(runtimeId.id)"), "teardown verifies exact identity + grant removal");
  ok(src.includes("no_new_residual_grant") && src.includes("grant_rows_after <= grantRowsBefore"), "pre-existing grant not treated as our failure");
  // preflight fails closed before operator action on missing repo files / snapshot / col.
  ok(src.includes("fail(") && src.includes("hook_active") && src.includes("process.exit(hookActive ? 0 : 2)"), "preflight fails closed / signals hook state");

  // authz-fixture remediation: POS-AUTHZ-1/3 fixtures come from real LAB rows, never random UUIDs.
  const authzKeys = ["H3C_FIX_SHOP_ID", "H3C_FIX_OTHER_SHOP_ID", "H3C_FIX_ROOM_ID", "H3C_FIX_RATE_PLAN_ID", "H3C_FIX_OTHER_PET_IDS", "H3C_FIX_LINE_USER_ID"];
  for (const k of authzKeys) {
    const line = src.split("\n").find((l) => l.includes(`${k}:`)) || "";
    ok(line.includes("fx.") && !/randomUUID|randomBytes|randomInt/.test(line), `${k} sourced from discovered fixture, no random fallback`);
  }
  ok(src.includes("async function discoverAuthzFixtures") && src.includes("MUTATING_SQL.test(sql)"), "discoverAuthzFixtures exists and rejects any mutating query");
  ok(!MUTATING_SQL.test(src.slice(src.indexOf("async function discoverAuthzFixtures"), src.indexOf("// non-PII assertion projection"))),
    "discoverAuthzFixtures body contains no mutating SQL keyword");
  ok(src.indexOf("await discoverAuthzFixtures()") < src.indexOf("hook-readiness probe"),
    "preflight runs fixture discovery BEFORE the hook-readiness probe");
  ok(src.includes("STOP — real cross-shop / cross-customer AUTHZ fixtures cannot be discovered read-only"),
    "preflight emits a scarcity STOP verdict when discovery fails");
  ok(src.includes("AUTHZ fixture discovery failed:") && src.includes("cannot run POS-AUTHZ-1/3 without real foreign relationships"),
    "--run aborts (no fallback) when discovery fails");
  // MUTATING_SQL must actually catch the words it claims to.
  ok(MUTATING_SQL.test("... INSERT INTO x ...") && MUTATING_SQL.test("delete from") && !MUTATING_SQL.test("SELECT id FROM ps01.pets"),
    "MUTATING_SQL guard matches write keywords, not SELECT");

  // House review Invariant A + B (disposable-fixture-prep brief).
  const discBody = src.slice(src.indexOf("async function discoverAuthzFixtures"), src.indexOf("// non-PII assertion projection"));
  const roomPlanQ = discBody.slice(discBody.indexOf('"roomPlanPair"'), discBody.indexOf('[baseline.shop_id])', discBody.indexOf('"roomPlanPair"')));
  ok(/rp\.room_id\s*=\s*r\.id/.test(roomPlanQ) && /rp\.shop_id\s*=\s*r\.shop_id/.test(roomPlanQ) && /r\.shop_id\s*=\s*\$1/.test(roomPlanQ) && /rp\.is_active\s*=\s*TRUE/i.test(roomPlanQ),
    "Invariant A: room+plan discovered as one pair joined on shop_id AND room_id, plan active");
  const foreignPetQ = discBody.slice(discBody.indexOf('"foreignPets"'), discBody.indexOf("if (foreignPets.length"));
  ok(/JOIN ps01\.pet_owners po2 ON po2\.id = p\.owner_id AND po2\.shop_id = p\.shop_id/.test(foreignPetQ)
     && /p\.shop_id\s*=\s*\$1/.test(foreignPetQ) && /po2\.id\s*<>\s*\$2/.test(foreignPetQ),
    "Invariant B: foreign pet constrained to baseline shop, owned by a real distinct pet_owners row in that shop");
  ok(src.includes("H3C_FIX_PET_IDS: fx.baselinePetIds.join") && discBody.includes("baselinePet"),
    "baseline positive-context pet (Fixture A) discovered and wired");
  ok(src.includes("invariant_A:") && src.includes("invariant_B:"), "fixtureAssertion records both invariants for the reviewer");
  // no random substitute for ANY authz fixture, including line user + baseline pet.
  for (const k of ["H3C_FIX_SHOP_ID", "H3C_FIX_LINE_USER_ID", "H3C_FIX_PET_IDS", "H3C_FIX_OTHER_SHOP_ID", "H3C_FIX_ROOM_ID", "H3C_FIX_RATE_PLAN_ID", "H3C_FIX_OTHER_PET_IDS"]) {
    const line = src.split("\n").find((l) => l.trim().startsWith(`${k}:`)) || "";
    ok(line.includes("fx.") && !/random/i.test(line), `${k}: no random substitute`);
  }

  process.stderr.write(bad ? `\nSELFTEST: ${bad} FAILURE(S)\n` : "\nSELFTEST PASS (token classify, no-abs-path, secure handoff, required inputs, verified teardown, authz invariants A+B)\n");
  process.exit(bad ? 1 : 0);
}

const mode = process.argv[2];
if (mode === "--selftest") selftest();
else if (mode === "--preflight") preflight().catch((e) => fail(e.message));
else if (mode === "--run") run().catch((e) => fail(e.message));
else if (mode === "--teardown-only" && process.argv[3]) teardownOnly(process.argv[3]).catch((e) => fail(e.message));
else { process.stderr.write("usage: h3d-live-runner.mjs --selftest | --preflight | --run | --teardown-only <uuid[,uuid...]>\n"); process.exit(2); }
