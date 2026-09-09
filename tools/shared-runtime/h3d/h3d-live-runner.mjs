#!/usr/bin/env node
// H3D live LAB orchestrator — WSTERA LAB only.
//
// Implements the §7 state machine + §8 runner requirements of
// BRIEF-CLAUDE-H3D-FINAL-ONE-SHOT-REMEDIATION-2026-09-09.md.
//
// Hard rules:
//   * SECURITY: no raw JWT / password / key / DB-URL-with-password / LINE id /
//     owner-or-pet name / phone / raw RPC body is ever printed, put on a command
//     line, or written to evidence. Evidence records only: UUIDs where exact
//     recovery needs them, issuer/project ref, role, iat/exp/lifetime, safe
//     error CLASSES, probe verdicts.
//   * FAIL-CLOSED: every mutating lifecycle is wrapped so a single ownership
//     ledger cleans every registered resource independently (Promise.allSettled),
//     verifies each exact UUID gone, and writes redacted recovery evidence.
//     No process.exit inside a cleanup-capable function — typed throw to one
//     top-level handler.
//   * AUTHORIZATION: a mutating phase runs only with a fresh, non-expired,
//     hash-linked external authorization receipt for this exact commit + run id.
//     The runner cannot mint an *_AUTHORIZED receipt itself.
//
// `pg` is tools/shared-runtime's own dependency.
//
// Env (operator-supplied; never logged):
//   H3D_SUPABASE_URL    https://ykxlqnshaaxmzzocpjlj.supabase.co
//   H3D_ANON_KEY        LAB anon / publishable key
//   H3D_SERVICE_KEY     LAB service/secret key (Auth Admin only)
//   H3D_GRANTS_DB_URL   postgres session (SELECT/INSERT/DELETE runtime_token_grants,
//                       run the read-only privilege + catalog SELECTs)
//   H3D_OUT_DIR         evidence output dir (default: cwd)
//   H3D_RECEIPTS_DIR    receipt dir (default: <OUT_DIR>/receipts)
//   H3D_RUN_ID          stable id for this authorized operation window
//   H3D_HOUSE_ROOT      House worktree root (default: resolved from this file)
//   H3D_SEED_MANIFEST   path to the seed manifest JSON (post-seed modes)
//
// Modes:
//   --selftest
//   --state
//   --reviewed
//   --preflight-readonly
//   --verify-post-seed
//   --preflight-hook-probe --authorize-hook-probe <receiptFile>   [--expect-hook-off | --expect-hook-on]
//   --run --authorize-run <receiptFile>
//   --teardown-only <uuid[,uuid...]>

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
const CATALOG_TOOL = path.join(HOUSE_ROOT, "tools/shared-runtime/h3d/catalog-manifest.mjs");
const EXPECTED_CATALOG = path.join(HOUSE_ROOT, "docs/platform/shared-runtime/fixtures/h3d-expected-catalog-manifest.json");

const LAB_ORIGIN = "https://ykxlqnshaaxmzzocpjlj.supabase.co";
const LAB_REF = "ykxlqnshaaxmzzocpjlj";

const CFG = {
  url: (process.env.H3D_SUPABASE_URL || "").replace(/\/+$/, ""),
  anonKey: process.env.H3D_ANON_KEY || "",
  serviceKey: process.env.H3D_SERVICE_KEY || "",
  grantsDbUrl: process.env.H3D_GRANTS_DB_URL || "",
  outDir: process.env.H3D_OUT_DIR || process.cwd(),
  receiptsDir: process.env.H3D_RECEIPTS_DIR || path.join(process.env.H3D_OUT_DIR || process.cwd(), "receipts"),
  runId: process.env.H3D_RUN_ID || "",
  seedManifest: process.env.H3D_SEED_MANIFEST || "",
  expectedRole: "ps01_line_runtime",
  maxLifetimeSec: 300,
  grantValiditySec: 900,
  expiryMarginSec: 75,
  receiptTtlSec: 15 * 60,
};

// ---- typed error + single exit ----------------------------------------
class H3DError extends Error {
  constructor(msg, { stop = true } = {}) { super(msg); this.name = "H3DError"; this.stop = stop; }
}
const sha = (s) => crypto.createHash("sha256").update(s == null ? "" : String(s)).digest("hex");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- secret / PII scrubbing ------------------------------------------
const PII_PATTERNS = [
  /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}/,      // JWT
  /sb_secret_[A-Za-z0-9]{6,}/, /sb_publishable_[A-Za-z0-9]{10,}/,
  /postgres(?:ql)?:\/\/[^\s"]*:[^\s"@/]+@/,                             // DB URL w/ password
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\bU[0-9a-f]{32}\b/,                                                  // raw LINE user id
];
function assertNoPii(obj, where) {
  const s = typeof obj === "string" ? obj : JSON.stringify(obj);
  for (const re of PII_PATTERNS) {
    if (re.test(s)) throw new H3DError(`PII/secret pattern in ${where} (${re})`);
  }
  return obj;
}

// ---- JWT (decode only; identity verified against issuer/ref) ----------
const b64urlToJson = (x) => JSON.parse(Buffer.from(String(x).replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
function claimsOf(jwt) {
  const p = String(jwt).split(".");
  if (p.length !== 3) throw new H3DError("not a 3-part JWT");
  return b64urlToJson(p[1]);
}
function classifyToken(jwt) {
  const c = claimsOf(jwt);
  const life = c.exp && c.iat ? c.exp - c.iat : null;
  const ref = (c.iss || "").match(/([a-z0-9]{20})\.supabase\./i)?.[1] || c.ref || null;
  return {
    role: c.role, iss: c.iss || null, ref,
    iat: c.iat, exp: c.exp, lifetimeSec: life,
    subPrefix: typeof c.sub === "string" ? c.sub.slice(0, 8) : null,
    roleIsRuntime: c.role === CFG.expectedRole,
    projectOk: ref === LAB_REF,
    lifetimeOk: life != null && life > 0 && life <= CFG.maxLifetimeSec,
    expired: typeof c.exp === "number" && c.exp * 1000 <= Date.now(),
  };
}

// ---- strict URL / project validation (F09 / §8) ----------------------
function assertLabTarget() {
  if (CFG.url !== LAB_ORIGIN) throw new H3DError(`H3D_SUPABASE_URL must equal ${LAB_ORIGIN} (got a different origin)`);
}
function requireEnv(keys) {
  const miss = keys.filter((k) => !CFG[k]);
  if (miss.length) throw new H3DError(`missing env: ${miss.map((k) => "H3D_" + k.replace(/([A-Z])/g, "_$1").toUpperCase()).join(", ")}`);
}

// ---- evidence I/O (PII-scanned) --------------------------------------
function writeEvidence(name, obj) {
  fs.mkdirSync(CFG.outDir, { recursive: true });
  assertNoPii(obj, name);
  const p = path.join(CFG.outDir, name);
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n");
  process.stderr.write(`evidence: ${p}\n`);
  return p;
}

// ---- receipts (§7): durable, hash-linked, TTL --------------------------
function receiptPath(state) { return path.join(CFG.receiptsDir, `receipt-${state}.json`); }
function readReceipt(state) {
  try { return JSON.parse(fs.readFileSync(receiptPath(state), "utf8")); } catch { return null; }
}
function receiptFresh(r, { commit, catalogFp, fixtureFp } = {}) {
  if (!r) return { ok: false, why: "missing" };
  if (r.run_id !== CFG.runId) return { ok: false, why: "run_id mismatch" };
  if (Date.parse(r.expires_at) <= Date.now()) return { ok: false, why: "expired" };
  if (commit && r.commit !== commit) return { ok: false, why: "commit drift" };
  if (catalogFp && r.catalog_fingerprint !== catalogFp) return { ok: false, why: "catalog drift" };
  if (fixtureFp && r.fixture_fingerprint && r.fixture_fingerprint !== fixtureFp) return { ok: false, why: "fixture drift" };
  return { ok: true };
}
function writeReceipt(state, body) {
  fs.mkdirSync(CFG.receiptsDir, { recursive: true });
  const prev = fs.existsSync(receiptPath(prevState(state))) ? sha(fs.readFileSync(receiptPath(prevState(state)))) : null;
  const rec = {
    state, run_id: CFG.runId, at: new Date().toISOString(),
    expires_at: new Date(Date.now() + CFG.receiptTtlSec * 1000).toISOString(),
    prev_receipt_sha256: prev, ...body,
  };
  rec.hash = sha(JSON.stringify({ ...rec, hash: undefined }));
  assertNoPii(rec, `receipt-${state}`);
  fs.writeFileSync(receiptPath(state), JSON.stringify(rec, null, 2) + "\n");
  return rec;
}
const STATE_ORDER = [
  "REVIEWED", "FIXTURE_DML_AUTHORIZED", "SEEDED", "POST_SEED_VERIFIED",
  "HOOK_PROBE_AUTHORIZED", "HOOK_OFF_CONFIRMED", "HOOK_ENABLE_REQUESTED",
  "HOOK_ON_CONFIRMED", "RUN_AUTHORIZED", "RUN_COMPLETE", "HOOK_OFF_AFTER_RUN",
  "RESIDUAL_EXPIRED", "FIXTURE_TEARDOWN_AUTHORIZED", "RESTORED",
];
function prevState(s) { const i = STATE_ORDER.indexOf(s); return i > 0 ? STATE_ORDER[i - 1] : s; }

// external *_AUTHORIZED receipts the runner may READ but never MINT.
function loadExternalAuthorization(file, expectState) {
  let a;
  try { a = JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (e) { throw new H3DError(`cannot read authorization receipt: ${e.message}`); }
  if (a.kind !== "h3d-external-authorization" || a.state !== expectState) {
    throw new H3DError(`authorization receipt is not a valid ${expectState} grant`);
  }
  if (a.run_id !== CFG.runId) throw new H3DError("authorization receipt run_id mismatch");
  if (!a.commit || a.commit !== houseCommit()) throw new H3DError("authorization receipt commit drift");
  if (Date.parse(a.expires_at) <= Date.now()) throw new H3DError("authorization receipt expired");
  return a;
}
function houseCommit() {
  try {
    return fs.readFileSync(path.join(HOUSE_ROOT, ".git/HEAD"), "utf8").trim().startsWith("ref:")
      ? fs.readFileSync(path.join(HOUSE_ROOT, ".git", fs.readFileSync(path.join(HOUSE_ROOT, ".git/HEAD"), "utf8").trim().slice(5)), "utf8").trim()
      : fs.readFileSync(path.join(HOUSE_ROOT, ".git/HEAD"), "utf8").trim();
  } catch { return process.env.H3D_HOUSE_COMMIT || "unknown"; }
}

// ---- Auth Admin + DB (no PII returned) -------------------------------
async function adminFetch(pth, init = {}) {
  const r = await fetch(`${CFG.url}${pth}`, {
    ...init,
    headers: { apikey: CFG.serviceKey, Authorization: `Bearer ${CFG.serviceKey}`, "Content-Type": "application/json", ...(init.headers || {}) },
  });
  // classify only — never return the body
  let errCode = null;
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    errCode = (() => { try { return JSON.parse(t).error_code || JSON.parse(t).code || null; } catch { return null; } })();
  }
  return { status: r.status, errClass: r.ok ? "ok" : `http_${r.status}${errCode ? ":" + errCode : ""}` };
}
async function createIdentity(tag) {
  const email = `h3d-${tag}-${Date.now()}-${crypto.randomInt(1e6)}@wstera-lab.invalid`;
  const password = crypto.randomUUID() + crypto.randomUUID();
  const r = await fetch(`${CFG.url}/auth/v1/admin/users`, {
    method: "POST",
    headers: { apikey: CFG.serviceKey, Authorization: `Bearer ${CFG.serviceKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  const j = await r.json().catch(() => ({}));
  if (r.status >= 300 || !j.id) throw new H3DError(`createIdentity(${tag}) failed http_${r.status}`);
  return { id: j.id, email, password };
}
async function deleteIdentity(id) { return (await adminFetch(`/auth/v1/admin/users/${id}`, { method: "DELETE" })).status; }
async function identityExists(id) { return (await adminFetch(`/auth/v1/admin/users/${id}`, { method: "GET" })).status === 200; }
async function tokenFor(id) {
  const r = await fetch(`${CFG.url}/auth/v1/token?grant_type=password`, {
    method: "POST", headers: { apikey: CFG.anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email: id.email, password: id.password }),
  });
  const j = await r.json().catch(() => ({}));
  if (!j.access_token) throw new H3DError(`token grant failed http_${r.status}`);
  return j.access_token;
}
async function withDb(fn) {
  const c = new Client({ connectionString: CFG.grantsDbUrl, ssl: { rejectUnauthorized: false }, statement_timeout: 20000 });
  await c.connect();
  try { return await fn(c); } finally { await c.end(); }
}
async function addGrantInsertOnly(userId) {
  // §8: INSERT-only. A pre-existing row for the same UUID is a hard STOP.
  await withDb(async (c) => {
    const dup = await c.query("SELECT 1 FROM wstera_platform_internal.runtime_token_grants WHERE user_id = $1", [userId]);
    if (dup.rowCount) throw new H3DError(`grant row already exists for ${userId} — STOP`);
    await c.query(
      `INSERT INTO wstera_platform_internal.runtime_token_grants (user_id, database_role, enabled, valid_until)
       VALUES ($1, 'ps01_line_runtime', true, now() + ($2 || ' seconds')::interval)`,
      [userId, String(CFG.grantValiditySec)],
    );
  });
}
async function removeGrant(userId) {
  await withDb((c) => c.query("DELETE FROM wstera_platform_internal.runtime_token_grants WHERE user_id = $1", [userId]));
}
async function grantExists(userId) {
  return withDb(async (c) => (await c.query("SELECT 1 FROM wstera_platform_internal.runtime_token_grants WHERE user_id = $1", [userId])).rowCount > 0);
}
async function assertDbIdentity() {
  await withDb(async (c) => {
    const r = (await c.query("SELECT current_user cu, current_database() db")).rows[0];
    if (r.cu !== "postgres" || r.db !== "postgres") throw new H3DError(`unexpected DB identity ${r.cu}/${r.db}`);
  });
}
async function writeFreshSnapshotFile() {
  const sql = fs.readFileSync(SNAPSHOT_SQL, "utf8");
  const row = await withDb(async (c) => (await c.query(sql)).rows[0]);
  const snap = row.snapshot ?? row;
  const ok = Number(snap.exec_count) === 3 && Number(snap.write_count) === 0 && snap.role_no_login === true
    && snap.public_rls_auto_enable_exec === false && snap.local_service_usage === false;
  if (!ok) throw new H3DError("privilege snapshot does not match the ps01_line_runtime boundary");
  fs.mkdirSync(CFG.outDir, { recursive: true });
  const p = path.join(CFG.outDir, `.h3d-priv-snapshot-${Date.now()}.json`);
  fs.writeFileSync(p, JSON.stringify(snap) + "\n");
  return p;
}
async function resolvePs01TableCol() {
  return withDb(async (c) => (await c.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema='ps01' AND table_name='bookings' AND is_nullable='YES'
     ORDER BY ordinal_position LIMIT 1`)).rows[0]?.column_name || null);
}

// ---- catalog verify (spawn the SELECT-only tool) --------------------
function verifyCatalog() {
  return new Promise((resolve, reject) => {
    execFile("node", [CATALOG_TOOL, "--verify", EXPECTED_CATALOG], {
      env: { LAB_DB_URL: CFG.grantsDbUrl, PATH: process.env.PATH },
      timeout: 60000, maxBuffer: 4 * 1024 * 1024,
    }, (err, stdout) => {
      let res = null;
      try { res = JSON.parse(stdout); } catch { /* */ }
      if (err && (!res || res.drift?.length)) return reject(new H3DError(`catalog drift: ${res ? res.drift.join("; ") : "verify failed"}`));
      resolve(res || { drift: [], live_fingerprint: null });
    });
  });
}

// ---- fixture discovery (Invariants A + B) ---------------------------
const MUTATING_SQL = /\b(insert|update|delete|upsert|merge|create|alter|drop|truncate|grant|revoke)\b/i;
async function discoverAuthzFixtures() {
  return withDb(async (c) => {
    const sel = async (name, sql, params = []) => {
      if (MUTATING_SQL.test(sql)) throw new H3DError(`discovery query "${name}" is not read-only`);
      return (await c.query(sql, params)).rows;
    };
    const [baseline] = await sel("baseline",
      `SELECT po.id AS owner_id, po.shop_id, po.line_user_id
       FROM ps01.pet_owners po JOIN ps01.shops s ON s.id = po.shop_id
       WHERE po.line_user_id IS NOT NULL AND btrim(po.line_user_id) <> ''
         AND EXISTS (SELECT 1 FROM ps01.pets p WHERE p.shop_id = po.shop_id AND p.owner_id = po.id)
       ORDER BY po.created_at NULLS LAST, po.id LIMIT 1`);
    if (!baseline) return { ok: false, reason: "Fixture A: no ps01.pet_owners row with a linked line_user_id AND at least one owned pet exists in LAB" };
    const [baselinePet] = await sel("baselinePet",
      `SELECT id FROM ps01.pets WHERE shop_id = $1 AND owner_id = $2 ORDER BY id LIMIT 1`, [baseline.shop_id, baseline.owner_id]);
    const [otherShop] = await sel("otherShop",
      `SELECT s.id AS shop_id FROM ps01.shops s
       WHERE s.id <> $1 AND NOT EXISTS (
         SELECT 1 FROM ps01.pet_owners po2 WHERE po2.shop_id = s.id AND btrim(po2.line_user_id) = btrim($2))
       ORDER BY s.id LIMIT 1`, [baseline.shop_id, baseline.line_user_id]);
    if (!otherShop) return { ok: false, reason: "Fixture B: no second ps01.shops row exists that the baseline line_user is provably not linked to" };
    const [pair] = await sel("roomPlanPair",
      `SELECT r.id AS room_id, rp.id AS rate_plan_id, r.capacity_pets
       FROM ps01.rooms r JOIN ps01.room_rate_plans rp ON rp.room_id = r.id AND rp.shop_id = r.shop_id
       WHERE r.shop_id = $1 AND rp.is_active = TRUE ORDER BY r.id, rp.id LIMIT 1`, [baseline.shop_id]);
    if (!pair) return { ok: false, reason: "Fixture C support: baseline shop has no (room + active room_rate_plans WHERE plan.room_id = room.id) pair" };
    const foreignPets = await sel("foreignPets",
      `SELECT p.id FROM ps01.pets p
       JOIN ps01.pet_owners po2 ON po2.id = p.owner_id AND po2.shop_id = p.shop_id
       WHERE p.shop_id = $1 AND po2.id <> $2 ORDER BY p.id LIMIT LEAST(1, $3::int)`,
      [baseline.shop_id, baseline.owner_id, Math.max(1, pair.capacity_pets)]);
    if (foreignPets.length !== 1) return { ok: false, reason: "Fixture C: expected exactly one ps01.pets row in the baseline shop owned by a different pet_owners row" };
    if (!baselinePet) return { ok: false, reason: "Fixture A: baseline owner has no pet in the baseline shop" };
    return {
      ok: true,
      fixtures: {
        baselineShopId: baseline.shop_id, baselineOwnerId: baseline.owner_id, baselineLineUserId: baseline.line_user_id,
        baselinePetIds: [baselinePet.id], otherShopId: otherShop.shop_id,
        roomId: pair.room_id, ratePlanId: pair.rate_plan_id, otherPetIds: foreignPets.map((r) => r.id),
      },
    };
  });
}
function fixtureFingerprint(f) {
  return sha(JSON.stringify([
    f.baselineShopId, f.baselineOwnerId, sha(f.baselineLineUserId),
    f.baselinePetIds, f.otherShopId, f.roomId, f.ratePlanId, f.otherPetIds,
  ]));
}
function fixtureAssertion(f) {
  return {
    baseline_shop_id: f.baselineShopId, baseline_owner_id: f.baselineOwnerId,
    baseline_line_user_ref: `${String(f.baselineLineUserId).slice(0, 3)}…${sha(f.baselineLineUserId).slice(0, 8)}`,
    baseline_pet_ids: f.baselinePetIds, cross_shop_id: f.otherShopId,
    quote_room_id: f.roomId, quote_rate_plan_id: f.ratePlanId, cross_customer_pet_ids: f.otherPetIds,
    invariant_A: "quote_room_id + quote_rate_plan_id are one joined pair (rp.room_id=r.id, both shop_id=baseline)",
    invariant_B: "each cross_customer_pet_id is in baseline shop, owner_id <> baseline_owner, backed by a real distinct pet_owners row in that shop",
    fixture_fingerprint: fixtureFingerprint(f),
  };
}

// ---- ownership ledger (F05) -----------------------------------------
class Ledger {
  constructor() { this.items = []; this.recoveryFile = path.join(CFG.outDir, `.h3d-ledger-${Date.now()}.json`); }
  register(type, id, meta = {}) { this.items.push({ type, id, meta, created_at: new Date().toISOString() }); this.flush(); }
  flush() {
    fs.mkdirSync(CFG.outDir, { recursive: true });
    fs.writeFileSync(this.recoveryFile, JSON.stringify({ note: "redacted recovery ledger — delete after verified cleanup", items: this.items }, null, 2) + "\n");
  }
  async cleanupAll() {
    const results = await Promise.allSettled(this.items.map((it) => this.cleanupOne(it)));
    const residual = [];
    for (let i = 0; i < this.items.length; i++) {
      const it = this.items[i]; const r = results[i];
      let gone = r.status === "fulfilled" && r.value === true;
      if (!gone) {
        // one bounded verify retry
        try { gone = await this.verifyGone(it); } catch { gone = false; }
      }
      if (!gone) residual.push({ type: it.type, id: it.id });
    }
    return residual;
  }
  async cleanupOne(it) {
    if (it.type === "auth_identity") {
      await deleteIdentity(it.id).catch(() => {});
      return !(await identityExists(it.id).catch(() => true));
    }
    if (it.type === "grant_row") {
      await removeGrant(it.id).catch(() => {});
      return !(await grantExists(it.id).catch(() => true));
    }
    if (it.type === "temp_file") { try { fs.unlinkSync(it.id); } catch { /* */ } return !fs.existsSync(it.id); }
    return true;
  }
  async verifyGone(it) {
    if (it.type === "auth_identity") return !(await identityExists(it.id));
    if (it.type === "grant_row") return !(await grantExists(it.id));
    if (it.type === "temp_file") return !fs.existsSync(it.id);
    return true;
  }
}

// ---- child harness spawn (§8) --------------------------------------
function spawnHarness(childEnv, evidencePath) {
  return new Promise((resolve) => {
    const before = Date.now();
    execFile("node", [HARNESS], { env: childEnv, timeout: 150000, maxBuffer: 4 * 1024 * 1024 }, (err) => {
      const out = { class: "ok", exitCode: 0, verdict: null };
      if (err) {
        if (err.killed && err.signal === "SIGTERM") out.class = "timeout";
        else if (err.signal) out.class = `signal:${err.signal}`;
        else if (typeof err.code === "number") { out.class = "nonzero_exit"; out.exitCode = err.code; }
        else out.class = "spawn_failure";
      }
      if (!fs.existsSync(evidencePath)) { out.class = out.class === "ok" ? "missing_evidence" : out.class; resolve(out); return; }
      const st = fs.statSync(evidencePath);
      if (st.mtimeMs < before) { out.class = "stale_evidence"; resolve(out); return; }
      let j = null;
      try { j = JSON.parse(fs.readFileSync(evidencePath, "utf8")); } catch { out.class = "malformed_evidence"; resolve(out); return; }
      out.verdict = j.verdict;
      out.evidence_sha256 = sha(fs.readFileSync(evidencePath));
      out.gate = j.gate ? { missing: j.gate.missing, requiredNotPass: j.gate.requiredNotPass, duplicates: j.gate.duplicates } : null;
      out.counts = j.counts || null;
      resolve(out);
    });
  });
}
function minimalChildEnv(extra) {
  // §8: allowlist, not process.env spread.
  return { PATH: process.env.PATH, NODE_OPTIONS: "", ...extra };
}

// =====================================================================
// modes
// =====================================================================
async function modeState() {
  const rows = STATE_ORDER.map((s) => {
    const r = readReceipt(s);
    return { state: s, present: Boolean(r), fresh: r ? receiptFresh(r).ok : false, at: r?.at || null };
  });
  process.stdout.write(JSON.stringify({ run_id: CFG.runId, commit: houseCommit(), states: rows }, null, 2) + "\n");
}

async function modeReviewed() {
  requireEnv(["grantsDbUrl", "runId"]);
  const catalog = await verifyCatalog();
  const disc = await discoverAuthzFixtures();
  const pre = await withDb(async (c) => (await c.query(`
    SELECT jsonb_object_agg(t, n) o FROM (
      SELECT 'shops' t, count(*) n FROM ps01.shops UNION ALL
      SELECT 'pet_owners', count(*) FROM ps01.pet_owners UNION ALL
      SELECT 'pets', count(*) FROM ps01.pets UNION ALL
      SELECT 'rooms', count(*) FROM ps01.rooms UNION ALL
      SELECT 'room_rate_plans', count(*) FROM ps01.room_rate_plans UNION ALL
      SELECT 'shop_subscriptions', count(*) FROM ps01.shop_subscriptions UNION ALL
      SELECT 'subscription_audit_log', count(*) FROM ps01.subscription_audit_log UNION ALL
      SELECT 'staff_users', count(*) FROM ps01.staff_users UNION ALL
      SELECT 'bookings', count(*) FROM ps01.bookings) s`)).rows[0].o);
  const body = {
    kind: "review",
    commit: houseCommit(),
    catalog_fingerprint: catalog.live_fingerprint,
    pre_seed_counts: pre,
    authz_fixture_discovery: disc.ok
      ? { ok: true, ...fixtureAssertion(disc.fixtures) }
      : { ok: false, reason: disc.reason },
  };
  const rec = writeReceipt("REVIEWED", body);
  writeEvidence(`H3D-REVIEWED-${Date.now()}.json`, rec);
  process.stderr.write(disc.ok
    ? "REVIEWED — catalog verified, fixtures discoverable. Next: House issues a FIXTURE_DML_AUTHORIZED receipt, then apply the guarded seed.\n"
    : `REVIEWED — catalog verified but AUTHZ fixtures NOT discoverable: ${disc.reason}\n(apply h3d-authz-fixture-seed.sql after Owner/House authorization, then --verify-post-seed)\n`);
}

async function modePreflightReadonly() {
  // §8 / F08: mechanically mutation-free. NO Auth/grant.
  requireEnv(["grantsDbUrl"]);
  assertLabTarget();
  const checks = {
    harness: fs.existsSync(HARNESS), snapshot_sql: fs.existsSync(SNAPSHOT_SQL),
    h3b_evidence: fs.existsSync(H3B_EVIDENCE), catalog_tool: fs.existsSync(CATALOG_TOOL),
    expected_catalog: fs.existsSync(EXPECTED_CATALOG),
  };
  const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) throw new H3DError(`missing repo file(s): ${missing.join(", ")}`);
  const catalog = await verifyCatalog();
  const col = await resolvePs01TableCol();
  if (!col) throw new H3DError("could not resolve a nullable ps01.bookings column for NEG-TBL-2");
  const disc = await discoverAuthzFixtures();
  const snapPath = await writeFreshSnapshotFile();
  try { fs.unlinkSync(snapPath); } catch { /* */ }
  const out = {
    kind: "preflight-readonly", mutation_free: true,
    catalog_fingerprint: catalog.live_fingerprint, ps01_table_col: col,
    authz_fixture_discovery: disc.ok ? { ok: true, ...fixtureAssertion(disc.fixtures) } : { ok: false, reason: disc.reason },
    verdict: disc.ok ? "READY (read-only) — next is a separately authorized hook-probe" : `STOP — ${disc.reason}`,
  };
  writeEvidence(`H3D-PREFLIGHT-RO-${Date.now()}.json`, out);
  if (!disc.ok) throw new H3DError(`AUTHZ fixture discovery: ${disc.reason}`, { stop: true });
  process.stderr.write("preflight-readonly: READY (no mutation performed)\n");
}

async function modeVerifyPostSeed() {
  requireEnv(["grantsDbUrl", "runId", "seedManifest"]);
  const m = assertNoPii(JSON.parse(fs.readFileSync(CFG.seedManifest, "utf8")), "seed-manifest");
  if (m.kind !== "h3d-authz-fixture-seed-manifest") throw new H3DError("not a seed manifest");
  const catalog = await verifyCatalog();
  const disc = await discoverAuthzFixtures();
  if (!disc.ok) throw new H3DError(`post-seed: fixtures still not discoverable: ${disc.reason}`);
  const f = disc.fixtures;
  const idOk = f.baselineShopId === m.fixture_ids.shop_a && f.otherShopId === m.fixture_ids.shop_b
    && f.baselineOwnerId === m.fixture_ids.owner_a && f.roomId === m.fixture_ids.room_a
    && f.ratePlanId === m.fixture_ids.plan_a && f.baselinePetIds[0] === m.fixture_ids.pet_a
    && f.otherPetIds.length === 1 && f.otherPetIds[0] === m.fixture_ids.pet_b;
  if (!idOk) throw new H3DError("post-seed: discovered fixtures do not match the seed manifest ids");
  const delta = await withDb(async (c) => (await c.query(`
    SELECT jsonb_build_object(
      'shops',(SELECT count(*) FROM ps01.shops)-($1->>'shops')::int,
      'pet_owners',(SELECT count(*) FROM ps01.pet_owners)-($1->>'pet_owners')::int,
      'pets',(SELECT count(*) FROM ps01.pets)-($1->>'pets')::int,
      'rooms',(SELECT count(*) FROM ps01.rooms)-($1->>'rooms')::int,
      'room_rate_plans',(SELECT count(*) FROM ps01.room_rate_plans)-($1->>'room_rate_plans')::int,
      'shop_subscriptions',(SELECT count(*) FROM ps01.shop_subscriptions)-($1->>'shop_subscriptions')::int,
      'subscription_audit_log',(SELECT count(*) FROM ps01.subscription_audit_log)-($1->>'subscription_audit_log')::int) d`,
    [JSON.stringify(m.pre_seed_counts)])).rows[0].d);
  const want = { shops: 2, pet_owners: 2, pets: 2, rooms: 1, room_rate_plans: 1, shop_subscriptions: 2, subscription_audit_log: 2 };
  if (JSON.stringify(delta) !== JSON.stringify(want)) throw new H3DError(`post-seed delta mismatch: ${JSON.stringify(delta)}`);
  const fp = fixtureFingerprint(f);
  const rec = writeReceipt("POST_SEED_VERIFIED", {
    kind: "post-seed-verification", commit: houseCommit(),
    catalog_fingerprint: catalog.live_fingerprint, fixture_fingerprint: fp,
    seed_manifest_sha256: sha(fs.readFileSync(CFG.seedManifest)),
    expected_delta_match: true,
  });
  writeEvidence(`H3D-POST-SEED-VERIFIED-${Date.now()}.json`, rec);
  process.stderr.write("POST_SEED_VERIFIED — next: House issues a HOOK_PROBE_AUTHORIZED receipt.\n");
}

async function runProbeIdentity(ledger, tag) {
  const id = await createIdentity(tag);
  ledger.register("auth_identity", id.id, { tag });
  await addGrantInsertOnly(id.id);
  ledger.register("grant_row", id.id, { tag });
  const jwt = await tokenFor(id);
  const cls = classifyToken(jwt);
  return { id: id.id, cls };
}

async function modePreflightHookProbe(authFile, expect) {
  requireEnv(["url", "anonKey", "serviceKey", "grantsDbUrl", "runId"]);
  assertLabTarget();
  await assertDbIdentity();
  loadExternalAuthorization(authFile, "HOOK_PROBE_AUTHORIZED");
  const psv = readReceipt("POST_SEED_VERIFIED");
  if (!receiptFresh(psv, { commit: houseCommit() }).ok) throw new H3DError("no fresh POST_SEED_VERIFIED receipt");

  const ledger = new Ledger();
  let cls = null;
  let residual = [];
  try {
    const probe = await runProbeIdentity(ledger, "hookprobe");
    cls = probe.cls;
  } finally {
    residual = await ledger.cleanupAll();
  }
  const hookActive = cls?.roleIsRuntime === true;
  const tokenStaysAuth = cls?.role === "authenticated";
  const out = {
    kind: "preflight-hook-probe", expect,
    probe_token: cls ? { role: cls.role, lifetimeSec: cls.lifetimeSec, projectOk: cls.projectOk } : null,
    hook_active: hookActive, residual_resources: residual,
  };
  writeEvidence(`H3D-HOOK-PROBE-${Date.now()}.json`, out);
  if (residual.length) throw new H3DError(`hook-probe cleanup incomplete: ${JSON.stringify(residual)}`);
  if (expect === "off") {
    if (!tokenStaysAuth) throw new H3DError(`expected hook OFF: probe token role=${cls?.role}`);
    writeReceipt("HOOK_OFF_CONFIRMED", { kind: "hook-off", commit: houseCommit() });
    process.stderr.write("HOOK_OFF_CONFIRMED — operator may now enable the hook.\n");
  } else if (expect === "on") {
    if (!hookActive || !cls.projectOk || !cls.lifetimeOk) throw new H3DError(`expected hook ON: role=${cls?.role} project=${cls?.projectOk} lifetimeOk=${cls?.lifetimeOk}`);
    writeReceipt("HOOK_ON_CONFIRMED", { kind: "hook-on", commit: houseCommit(), token_lifetime_sec: cls.lifetimeSec });
    process.stderr.write("HOOK_ON_CONFIRMED — next: House issues RUN_AUTHORIZED.\n");
  }
}

async function modeRun(authFile) {
  requireEnv(["url", "anonKey", "serviceKey", "grantsDbUrl", "runId", "seedManifest"]);
  assertLabTarget();
  await assertDbIdentity();
  loadExternalAuthorization(authFile, "RUN_AUTHORIZED");

  const catalog = await verifyCatalog();
  const hoc = readReceipt("HOOK_ON_CONFIRMED");
  if (!receiptFresh(hoc, { commit: houseCommit(), catalogFp: catalog.live_fingerprint }).ok) {
    throw new H3DError(`no fresh HOOK_ON_CONFIRMED receipt (${receiptFresh(hoc, { commit: houseCommit(), catalogFp: catalog.live_fingerprint }).why})`);
  }
  const disc = await discoverAuthzFixtures();
  if (!disc.ok) throw new H3DError(`--run: fixtures not discoverable: ${disc.reason}`);
  const fx = disc.fixtures;
  const fp = fixtureFingerprint(fx);
  const psv = readReceipt("POST_SEED_VERIFIED");
  if (!receiptFresh(psv, { commit: houseCommit(), fixtureFp: fp }).ok) throw new H3DError("fixture fingerprint drift vs POST_SEED_VERIFIED");

  const tableCol = await resolvePs01TableCol();
  if (!tableCol) throw new H3DError("could not resolve ps01.bookings column");

  const ledger = new Ledger();
  const rec = { kind: "run", startedAt: new Date().toISOString(), run_id: CFG.runId, tokens: {}, harness: null };
  const tokenExpiries = [];
  let residual = [];
  let snapshotPath = null; let harnessJson = null;
  try {
    // runtime identity + grant + the "expired" token (issued early)
    const runtime = await createIdentity("runtime");
    ledger.register("auth_identity", runtime.id, { tag: "runtime" });
    await addGrantInsertOnly(runtime.id);
    ledger.register("grant_row", runtime.id, { tag: "runtime" });
    const expiredJwt = await tokenFor(runtime);
    const expiredCls = classifyToken(expiredJwt);
    if (!expiredCls.roleIsRuntime || !expiredCls.projectOk) throw new H3DError("hook not active / wrong project for the runtime token");
    tokenExpiries.push(expiredCls.exp);
    rec.tokens.expired = { role: expiredCls.role, lifetimeSec: expiredCls.lifetimeSec };

    // control identity (no grant) — must stay authenticated
    const control = await createIdentity("control");
    ledger.register("auth_identity", control.id, { tag: "control" });
    const controlJwt = await tokenFor(control);
    const controlCls = classifyToken(controlJwt);
    if (controlCls.role !== "authenticated") throw new H3DError(`control identity elevated to role=${controlCls.role}`);
    tokenExpiries.push(controlCls.exp);
    rec.tokens.control = { role: controlCls.role, lifetimeSec: controlCls.lifetimeSec };

    // wait out the expired token
    const waitMs = Math.max(0, (expiredCls.exp + CFG.expiryMarginSec) * 1000 - Date.now());
    process.stderr.write(`waiting ${Math.round(waitMs / 1000)}s for the runtime token to expire...\n`);
    await sleep(waitMs);
    if (!classifyToken(expiredJwt).expired) throw new H3DError("expired-token wait did not produce an expired JWT");

    // fresh snapshot + fresh active token
    snapshotPath = await writeFreshSnapshotFile();
    ledger.register("temp_file", snapshotPath, { tag: "priv-snapshot" });
    const activeJwt = await tokenFor(runtime);
    const activeCls = classifyToken(activeJwt);
    if (!activeCls.roleIsRuntime || !activeCls.lifetimeOk || !activeCls.projectOk) throw new H3DError("fresh runtime token unusable");
    tokenExpiries.push(activeCls.exp);
    rec.tokens.active = { role: activeCls.role, lifetimeSec: activeCls.lifetimeSec, projectOk: activeCls.projectOk };
    rec.residualNarrowAuthorityUntil = new Date(Math.max(...tokenExpiries) * 1000).toISOString();

    // fixed, recorded future start_at (§8 — no harness default)
    const startAt = new Date(Date.now() + 3 * 86400000).toISOString();
    rec.fixture_fingerprint = fp;
    rec.start_at = startAt;

    harnessJson = path.join(CFG.outDir, `H3D-LIVE-PROOF-${Date.now()}.json`);
    ledger.register("temp_file", harnessJson, { tag: "harness-json-tracked-until-hashed" });
    const childEnv = minimalChildEnv({
      H3C_SUPABASE_URL: CFG.url, H3C_ANON_KEY: CFG.anonKey,
      H3C_RUNTIME_JWT: activeJwt, H3C_CONTROL_JWT: controlJwt, H3C_EXPIRED_JWT: expiredJwt,
      H3C_PRIVILEGE_SNAPSHOT: snapshotPath, H3C_H3B_EVIDENCE: H3B_EVIDENCE,
      H3C_PS01_TABLE: "bookings", H3C_PS01_TABLE_COL: tableCol,
      H3C_STRICT_H3D: "1",
      H3C_FIX_SHOP_ID: fx.baselineShopId, H3C_FIX_LINE_USER_ID: fx.baselineLineUserId,
      H3C_FIX_PET_IDS: fx.baselinePetIds.join(","),
      H3C_FIX_OTHER_SHOP_ID: fx.otherShopId, H3C_FIX_ROOM_ID: fx.roomId,
      H3C_FIX_RATE_PLAN_ID: fx.ratePlanId, H3C_FIX_OTHER_PET_IDS: fx.otherPetIds.join(","),
      H3C_FIX_START_AT: startAt,
      H3C_OUT: harnessJson,
    });
    process.stderr.write("running h3c-proof-harness (child; tokens in minimal child env only)...\n");
    const h = await spawnHarness(childEnv, harnessJson);
    rec.harness = h;
    // the harness JSON becomes retained evidence once hashed — stop tracking it for deletion
    ledger.items = ledger.items.filter((it) => it.id !== harnessJson);
    ledger.flush();
  } catch (e) {
    rec.error = String(e.message || e);
  } finally {
    residual = await ledger.cleanupAll();
    rec.residual_resources = residual;
    rec.finishedAt = new Date().toISOString();
  }

  const cleanupOk = residual.length === 0;
  const pass = !rec.error && rec.harness?.class === "ok" && rec.harness?.verdict === "PASS" && cleanupOk;
  rec.verdict = pass ? "H3D LIVE PASS"
    : (rec.error || !cleanupOk ? "H3D RUN FAILED" : `H3D LIVE NOT PASS (harness ${rec.harness?.class}/${rec.harness?.verdict})`);
  writeEvidence(`H3D-RUN-${Date.now()}.json`, rec);
  if (pass) writeReceipt("RUN_COMPLETE", { kind: "run-complete", commit: houseCommit(), max_residual_expiry: rec.residualNarrowAuthorityUntil });
  process.stderr.write(`\n${rec.verdict}\ncleanup residual: ${JSON.stringify(residual)}\n`);
  if (!pass) throw new H3DError(rec.verdict, { stop: true });
}

async function modeTeardownOnly(csv) {
  requireEnv(["url", "serviceKey", "grantsDbUrl"]);
  const ids = csv.split(",").map((s) => s.trim()).filter(Boolean);
  const ledger = new Ledger();
  for (const id of ids) { ledger.register("auth_identity", id, { manual: true }); ledger.register("grant_row", id, { manual: true }); }
  const residual = await ledger.cleanupAll();
  writeEvidence(`H3D-TEARDOWN-ONLY-${Date.now()}.json`, { kind: "teardown-only", ids, residual });
  if (residual.length) throw new H3DError(`residual after teardown-only: ${JSON.stringify(residual)}`);
  process.stderr.write("teardown-only: all listed resources verified gone.\n");
}

// ---- offline selftest ---------------------------------------------
function selftest() {
  let bad = 0;
  const ok = (c, m) => { if (!c) { process.stderr.write(`FAIL ${m}\n`); bad++; } };
  const now = Math.floor(Date.now() / 1000);
  const mk = (o) => `h.${Buffer.from(JSON.stringify({ role: "ps01_line_runtime", iss: `https://${LAB_REF}.supabase.co/auth/v1`, iat: now, exp: now + 250, sub: "abcdef01-1111-2222-3333-444444444444", ...o })).toString("base64url")}.s`;

  ok(classifyToken(mk({})).roleIsRuntime && classifyToken(mk({})).projectOk && classifyToken(mk({})).lifetimeOk, "token ok");
  ok(!classifyToken(mk({ role: "authenticated" })).roleIsRuntime, "role mismatch");
  ok(!classifyToken(mk({ iss: "https://zzzzzzzzzzzzzzzzzzzz.supabase.co/auth/v1" })).projectOk, "wrong project ref caught");
  ok(!classifyToken(mk({ exp: now + 900 })).lifetimeOk, "uncapped lifetime rejected");
  ok(classifyToken(mk({ exp: now - 5 })).expired, "expired detected");

  // PII scanner
  const jwtish = "eyJ" + "a".repeat(30) + "." + "b".repeat(30) + "." + "c".repeat(30);
  for (const badStr of [jwtish, "sb_secret_ABCDEF123456", "postgres://u:pw@host/db", "U0123456789abcdef0123456789abcdef"]) {
    let threw = false; try { assertNoPii(badStr, "t"); } catch { threw = true; }
    ok(threw, `PII scanner catches ${badStr.slice(0, 12)}`);
  }
  ok(assertNoPii({ ok: 1, id: "0d15d05a-0000-4000-8000-00000000a001" }, "t"), "PII scanner passes clean UUID object");

  const S = (a, b) => a + b;                       // fragment join so needles never self-match
  const src = fs.readFileSync(fileURLToPath(import.meta.url), "utf8");
  ok(!/[A-Za-z]:\/(?:Users|AI-Workspace)/.test(src) && !src.includes(S("createRequire", "(")), "no absolute path / createRequire");
  ok((src.split(S("...process", ".env")).length - 1) === 0, "child env is an allowlist, not process.env spread");
  ok(src.includes(S("class ", "H3DError")) && (src.split(S("function ", "fail(")).length - 1) === 0, "typed errors, no fail()+process.exit in workflows");
  ok(src.includes(S("Promise.", "allSettled")), "ledger cleanup uses Promise.allSettled");
  {
    const body = src.slice(src.indexOf("async function addGrantInsertOnly"), src.indexOf("async function removeGrant"));
    ok(body.includes(S("INSERT ", "INTO wstera_platform_internal.runtime_token_grants"))
       && (body.split(S("ON ", "CONFLICT")).length - 1) === 0
       && body.includes("dup.rowCount"), "grant INSERT is insert-only, collision is a hard STOP");
  }
  {
    const ext = src.slice(src.indexOf("function loadExternalAuthorization"), src.indexOf("function houseCommit"));
    ok(src.includes("READ but never MINT") && ext.includes('a.kind !== "h3d-external-authorization"') && !ext.includes("writeReceipt("),
      "external authorization receipts are read + validated, never written by the runner");
  }
  ok(src.indexOf("modePreflightReadonly") > 0 && src.includes(S("mutation_free", ": true"))
     && (src.slice(src.indexOf("async function modePreflightReadonly"), src.indexOf("async function modeVerifyPostSeed")).split("createIdentity").length - 1) === 0,
    "preflight-readonly performs no identity creation");
  ok(src.includes(S("H3C_STRICT", '_H3D: "1"')) && src.includes(S("H3C_FIX_START", "_AT: startAt")), "run passes strict-H3D + a fixed recorded start_at to the harness");
  ok(src.includes("assertLabTarget") && src.includes("LAB_ORIGIN"), "strict LAB origin check before network");
  {
    const sh = src.slice(src.indexOf("function spawnHarness"), src.indexOf("function minimalChildEnv"));
    ok(["timeout", "signal:", "nonzero_exit", "spawn_failure", "missing_evidence", "malformed_evidence", "stale_evidence"].every((c) => sh.includes(c)),
      "spawnHarness distinguishes every failure class");
  }
  ok(src.includes("fixtureFingerprint") && src.includes("fixture_fingerprint") && src.includes("fixture fingerprint drift vs POST_SEED_VERIFIED"),
    "fixture fingerprint computed + bound across phases + drift is a STOP");
  for (const k of ["H3C_FIX_SHOP_ID", "H3C_FIX_LINE_USER_ID", "H3C_FIX_PET_IDS", "H3C_FIX_OTHER_SHOP_ID", "H3C_FIX_ROOM_ID", "H3C_FIX_RATE_PLAN_ID", "H3C_FIX_OTHER_PET_IDS"]) {
    const line = src.split("\n").find((l) => l.includes(`${k}: `)) || "";
    ok(line.includes("fx.") && !/random/i.test(line), `${k} from discovered fixture, no random`);
  }
  // discovery Invariants A + B
  const disc = src.slice(src.indexOf("async function discoverAuthzFixtures"), src.indexOf("function fixtureFingerprint"));
  ok(/rp\.room_id = r\.id AND rp\.shop_id = r\.shop_id/.test(disc) && /rp\.is_active = TRUE/.test(disc), "Invariant A: joined room/plan pair");
  ok(/JOIN ps01\.pet_owners po2 ON po2\.id = p\.owner_id AND po2\.shop_id = p\.shop_id/.test(disc) && /p\.shop_id = \$1/.test(disc) && /po2\.id <> \$2/.test(disc), "Invariant B: same-shop distinct-owner foreign pet");
  ok(/foreignPets\.length !== 1/.test(disc), "Invariant B: exactly one foreign pet (capacity 2 cannot be the earlier failure)");
  ok(!MUTATING_SQL.test(disc.replace(/is not read-only|MUTATING_SQL/g, "")), "discovery body has no mutating SQL keyword");

  process.stderr.write(bad ? `\nSELFTEST: ${bad} FAILURE(S)\n` : "\nSELFTEST PASS (state machine, ledger, PII, strict target, fixtures, spawn classes)\n");
  process.exit(bad ? 1 : 0);
}

// ---- one top-level exit handler ----------------------------------
async function main() {
  const mode = process.argv[2];
  const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
  switch (mode) {
    case "--selftest": return selftest();
    case "--state": return modeState();
    case "--reviewed": return modeReviewed();
    case "--preflight-readonly": return modePreflightReadonly();
    case "--verify-post-seed": return modeVerifyPostSeed();
    case "--preflight-hook-probe": {
      const a = arg("--authorize-hook-probe");
      if (!a) throw new H3DError("--preflight-hook-probe requires --authorize-hook-probe <receiptFile>");
      const expect = process.argv.includes("--expect-hook-on") ? "on" : "off";
      return modePreflightHookProbe(a, expect);
    }
    case "--run": {
      const a = arg("--authorize-run");
      if (!a) throw new H3DError("--run requires --authorize-run <receiptFile>");
      return modeRun(a);
    }
    case "--teardown-only": {
      if (!process.argv[3]) throw new H3DError("--teardown-only <uuid[,uuid...]>");
      return modeTeardownOnly(process.argv[3]);
    }
    default:
      process.stderr.write("usage: h3d-live-runner.mjs --selftest | --state | --reviewed | --preflight-readonly | --verify-post-seed | --preflight-hook-probe --authorize-hook-probe <f> [--expect-hook-on] | --run --authorize-run <f> | --teardown-only <uuids>\n");
      process.exit(2);
  }
}
main().catch((e) => {
  process.stderr.write(`\n${e instanceof H3DError ? "STOP" : "ERROR"}: ${e.message}\n`);
  process.exit(1);
});
