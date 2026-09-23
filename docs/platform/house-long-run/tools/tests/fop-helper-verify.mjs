#!/usr/bin/env node
/**
 * FOP-WU3-VERIFY-R2 — offline verification harness for
 *   docs/platform/house-long-run/tools/lane-a-exact-file-postgres-apply.mjs
 *
 * OFFLINE GUARANTEE
 *   This harness NEVER sets LANE_A_CONTROL_DATABASE_URL to a real credential. The only
 *   credential strings it ever exposes to the helper are (a) absent, or (b) synthetic and
 *   unroutable (127.0.0.1:1) with a synthetic project reference. No case is allowed to
 *   reach the helper's execution stage: the harness asserts that no spawned run reports a
 *   classification from the execution set (CONNECTION_FAILED / RUNTIME_DEPENDENCY_UNAVAILABLE
 *   / DRY_RUN_PASS / APPLY_PASS). No database is contacted and no connection is attempted.
 *
 *   The helper file is NEVER modified by this harness. It is only read (bytes, for the
 *   sha256 guard and for the structural line-number evidence).
 *
 * NO TREE MUTATION (both modes)
 *   This harness writes NOTHING inside the repository tree. It creates no
 *   `tools/tests/fop-wu3-artifacts/` directory and does not refresh any tracked evidence
 *   file. Every scratch file it needs (including the evidence JSON it asks the helper to
 *   write through `--evidence-out`) goes to an OS temp directory:
 *     default mode     : <os.tmpdir()>/fop-wu3-artifacts  (kept for operator inspection)
 *     read-only mode   : a fresh mkdtemp directory under <os.tmpdir()>, REMOVED on exit
 *   The scratch path is printed in the HARNESS_MODE header line.
 *
 * READ-ONLY MODE  (LANE_A_FOP_READONLY=1)
 *   Enabled by the environment variable LANE_A_FOP_READONLY=1. In this mode the harness:
 *     - creates and modifies NO file in the repository tree (no artifact directory, no
 *       evidence JSON under the tree) — scratch goes to an OS temp directory and is deleted
 *       on exit;
 *     - still runs EVERY case it can run and still reports that case's classification;
 *     - prints a header line stating it is running in read-only mode;
 *     - leaves `git status --porcelain --untracked-files=all` unchanged from before it ran.
 *
 * SKIP_UNSPAWNABLE  (constrained-environment honesty)
 *   Child-process availability is probed ONCE at startup with
 *   `spawnSync(process.execPath, ['-e', '0'])`. In a sandbox that cannot spawn children,
 *   every case that needs a spawned process reports SKIP_UNSPAWNABLE with an explicit
 *   reason — never FAIL and never PASS, because the case produced no evidence at all.
 *   In-process cases do NOT need spawning and therefore still run and still report PASS or
 *   FAIL. The final total line states how many cases were skipped, e.g.
 *     FOP_HELPER_VERIFY_TOTAL: 20/20 PASS (24 SKIP_UNSPAWNABLE — child process unavailable in this environment)
 *   EXIT CODE: 0 when every RUNNABLE case passed (skipped cases do not fail the run), and
 *   non-zero when any runnable case failed. A sandbox limitation is never converted into
 *   either a false FAIL or a false PASS.
 *
 * CASES THAT DEPEND ON A SPAWNED CHILD
 *   Cases whose assertions read a spawned helper's stdout/status, plus CASE-J (spawns
 *   python/swarmctl) and CASE-L (spawns git), are marked as needing a child. In addition,
 *   `evaluateGovernedPreflight` with the helper's REAL dependency set resolves the migration
 *   revision through `spawnGit`, so CASE-A-*-preflight-ok-inprocess and CASE-G-static-guard-ladder
 *   are "in-process" yet still transitively need spawning; they are guarded by needsSpawnForGit
 *   so a spawn-limited environment skips them instead of reporting a sandbox-induced false FAIL.
 *   The aggregate CASE-G-NO-CONNECTION-ATTEMPTED-global is skipped when zero child runs were
 *   possible, because with an empty evidence base its assertion would be vacuously true —
 *   reporting it PASS would be a false PASS.
 *
 *   Spawn-free cases (guaranteed to run in every environment, including a reviewer sandbox with
 *   no child processes): CASE0, the CASE-N1..N11 sequencing probes (which inject stub git
 *   dependencies), CASE-F-seam / CASE-F-INVERSE, CASE-H, CASE-I, CASE-K and CASE-N0.
 *   CASE-N1 — the required demonstration that a 0010 apply carrying a 0009 apply record but no
 *   worker-live proof is refused with WORKER_LIVE_PROOF_MISSING — therefore reproduces in a
 *   fully constrained sandbox.
 *
 * CASE N — the brief section 10 worker-live gate for 0010 (F-OP-01 finding 1)
 *   In-process cases assert that a 0010 apply is refused unless the release evidence records
 *   BOTH (4a) a successful 0009 apply for the same target ref AND (4b) a live-Worker proof of
 *   the 19-argument path for the same target ref and task id. N1 is the required demonstration
 *   that WORKER_LIVE_PROOF_MISSING fires when the proof is absent while the 0009 record is
 *   present. N3/N4/N5 assert the different-target, different-task and incomplete-proof
 *   refusals; N2/N6/N9 assert the two documented accepted shapes are non-vacuously accepted.
 *
 * Run: node docs/platform/house-long-run/tools/tests/fop-helper-verify.mjs
 *      LANE_A_FOP_READONLY=1 node docs/platform/house-long-run/tools/tests/fop-helper-verify.mjs
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as helper from '../lane-a-exact-file-postgres-apply.mjs';

// ─────────────────────────────────────────────────────────────────────────────
// Paths / constants
// ─────────────────────────────────────────────────────────────────────────────

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '../../../../..');
const HELPER_PATH = path.resolve(HERE, '../lane-a-exact-file-postgres-apply.mjs');
const HELPER_ARG = HELPER_PATH.split(path.sep).join('/');
const HELPER_SHA256_EXPECTED = 'd87bd4aa938d0d0a853cea84289e182d29e2cafe6237ff2df3e4fb5a3a77398b';

const CONTROL_REPO = process.env.LANE_A_FOP_CONTROL_REPO || 'D:/AI-Workspace/runtime/worktrees/hub-web-cts001';
const RUNBOOK = path.resolve(REPO_ROOT, 'docs/platform/house-long-run/RUNBOOK-LANE-A-EXPAND-DEPLOY-CONTRACT-2026-09-23.md');
const SWARMCTL = process.env.LANE_A_FOP_SWARMCTL || 'D:/AI-Workspace/runtime/hermes-native/data/skills/hermes-native-swarm/scripts/swarmctl.py';

const SELF_PATH = fileURLToPath(import.meta.url);

// ── Environment capabilities ────────────────────────────────────────────────

const READONLY = process.env.LANE_A_FOP_READONLY === '1';

const CAN_SPAWN = (() => {
  try {
    const probe = spawnSync(process.execPath, ['-e', '0'], {
      encoding: 'utf8', windowsHide: true, timeout: 60000,
    });
    return probe && probe.error == null && probe.status === 0;
  } catch {
    return false;
  }
})();

// ── Scratch directory: OUTSIDE the repository tree, in both modes ───────────
// The repository tree is never written to. In read-only mode the scratch directory is
// created with mkdtemp and removed on exit.

let SCRATCH;
let scratchCleanup = null;
if (READONLY) {
  SCRATCH = fs.mkdtempSync(path.join(os.tmpdir(), 'fop-wu3-readonly-'));
  scratchCleanup = () => {
    try { fs.rmSync(SCRATCH, { recursive: true, force: true }); } catch { /* best effort */ }
  };
  process.on('exit', () => scratchCleanup());
} else {
  SCRATCH = path.join(os.tmpdir(), 'fop-wu3-artifacts');
  fs.mkdirSync(SCRATCH, { recursive: true });
}

console.log(`HARNESS_MODE: ${READONLY ? 'READ_ONLY (LANE_A_FOP_READONLY=1)' : 'DEFAULT'} — repository tree is never written; scratch dir = ${SCRATCH}${READONLY ? ' (removed on exit)' : ''}`);
console.log(`HARNESS_ENVIRONMENT: child_process_available=${CAN_SPAWN} readonly=${READONLY} repo_root=${REPO_ROOT}`);

const ID9 = Object.freeze({
  id: '0009',
  revision: 'dfcb4be4ac8b488ef740e2147f83b5c19251fbd8',
  file: 'drizzle/migrations/0009_work_scope_identity.sql',
  sha256: '8f88a7d1e4d3777dd0c2adefa999f61799bd50dd1270407fa025f3c4068d3487',
  label: 'EXPAND',
});
const ID10 = Object.freeze({
  id: '0010',
  revision: 'dd9a629eaa4e75c29fe0b8aa31698b5f9c4e1dae',
  file: 'drizzle/migrations/0010_retire_legacy_work_event_rpc.sql',
  sha256: '3963c6a6e6423f006889d87c735e86ef30831680964c19b096f23f2b091a7b30',
  label: 'CONTRACT',
});

// Synthetic, unresolvable, unroutable. NOT a real credential, ever.
const UNROUTABLE_URL = 'postgresql://postgres.wu3syntheticref@127.0.0.1:1/wu3offline';
const SYNTHETIC_REF = 'wu3syntheticref';
const UNUSED_REF = 'wu3-nonprod-ref';

const ENV = helper.ENV_AUTHORITY;
const CLS = helper.CLASSIFICATION;
const EXECUTION_CLASSIFICATIONS = new Set([
  'RUNTIME_DEPENDENCY_UNAVAILABLE', 'CONNECTION_FAILED', 'DRY_RUN_PASS', 'DRY_RUN_FAILED',
  'APPLY_PASS', 'APPLY_FAILED', 'INTERNAL_ERROR',
]);

const findings = [];
const failures = [];
const skips = [];
let caseCount = 0;
const childRuns = [];

function oneLine(s, n = 320) {
  const t = String(s ?? '').replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n)}…` : t;
}

function report(id, ok, exitCode, classification, detail) {
  caseCount += 1;
  if (!ok) failures.push(id);
  const status = ok ? 'PASS' : 'FAIL';
  console.log(`${status} ${id} (observed exit=${exitCode} classification=${classification} detail=${oneLine(detail)})`);
  return ok;
}

function finding(id, text) {
  findings.push({ id, text });
  console.log(`FINDING ${id}: ${oneLine(text, 600)}`);
}

/**
 * A case that needed a spawned process which this environment cannot provide. It is NOT a
 * FAIL (no evidence was produced) and NOT a PASS (nothing was verified). The reason is always
 * printed explicitly.
 */
function skipCase(id, reason) {
  skips.push({ id, reason });
  console.log(`SKIP_UNSPAWNABLE ${id} (reason=${oneLine(reason, 240)})`);
  return false;
}

/**
 * Guard used by every child-dependent case. Returns true when the case must be skipped
 * because spawning is unavailable; prints the SKIP_UNSPAWNABLE line in that case.
 */
function needsChild(id, reason) {
  if (CAN_SPAWN) return false;
  skipCase(id, reason);
  return true;
}

/**
 * Guard for "in-process" cases that are nonetheless NOT spawn-free: calling the exported
 * `evaluateGovernedPreflight` with the real dependency set resolves the migration revision
 * through `spawnGit`, so those cases transitively need the ability to spawn `git`. They are
 * in-process in the sense that no helper child is launched, but they cannot be verified in an
 * environment that cannot spawn at all. Reporting them FAIL there would be a false FAIL
 * caused purely by the sandbox; reporting them PASS would be a false PASS. They are skipped.
 *
 * Cases that are genuinely spawn-free (`CASE0`, `CASE-N0`, the `CASE-N1..N11` sequencing probes
 * which inject stub git dependencies, the `deriveTargetIdentity` seam cases, the stub-handle
 * transaction cases `CASE-H`/`CASE-I`, and the file-only `CASE-K`) are NOT guarded by this and
 * still run in every environment.
 */
function needsSpawnForGit(id, reason) {
  if (CAN_SPAWN) return false;
  skipCase(id, reason);
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper invocation (child process) — no credential ever reaches a real target
// ─────────────────────────────────────────────────────────────────────────────

function cleanEnv(overrides = {}) {
  const env = { ...process.env };
  delete env[ENV.LIVE_DB];
  delete env[ENV.PRODUCTION_APPLY];
  delete env[ENV.CREDENTIAL];
  for (const [k, v] of Object.entries(overrides)) {
    if (v === undefined) delete env[k];
    else env[k] = v;
  }
  return env;
}

function runHelper(args, envOverrides = {}) {
  const res = spawnSync(process.execPath, [HELPER_ARG, ...args], {
    env: cleanEnv(envOverrides),
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    windowsHide: true,
    timeout: 120000,
  });
  const stdout = res.stdout || '';
  const stderr = res.stderr || '';
  const m = stdout.match(/^CLASSIFICATION: (\S+)\s*$/m);
  const classification = m ? m[1] : null;
  const rec = { args, env: Object.keys(envOverrides), status: res.status, classification, stdout, stderr };
  childRuns.push(rec);
  if (classification && EXECUTION_CLASSIFICATIONS.has(classification)) {
    finding(
      'EXECUTION-STAGE-REACHED',
      `a spawned helper run reported classification ${classification}, which is impossible without a driver load; ` +
      `args=${args.join(' ')}`,
    );
  }
  if (/postgres:\/\/<redacted>|postgresql:\/\/<redacted>/.test(stdout) && /TARGET_IDENTITY: ref=/.test(stdout)) {
    // informational only: the helper sanitizes; nothing to assert here
  }
  return rec;
}

function baseArgs(pair, over = {}) {
  const a = {
    mode: 'dry-run',
    'migration-id': pair.id,
    file: pair.file,
    'expect-revision': pair.revision,
    'expect-sha256': pair.sha256,
    'expect-target-ref': UNUSED_REF,
    'control-repo': CONTROL_REPO,
    ...over,
  };
  const out = [];
  for (const [k, v] of Object.entries(a)) {
    if (v === undefined || v === null) continue;
    out.push(`--${k}`, String(v));
  }
  return out;
}

function evidencePath(id) {
  return path.join(SCRATCH, `${id}.json`);
}

function readEvidence(id) {
  try {
    return JSON.parse(fs.readFileSync(evidencePath(id), 'utf8'));
  } catch {
    return null;
  }
}

function writeScratchJson(name, obj) {
  const p = path.join(SCRATCH, name);
  fs.writeFileSync(p, `${JSON.stringify(obj, null, 2)}\n`, 'utf8');
  return p;
}

// ─────────────────────────────────────────────────────────────────────────────
// CASE 0 — helper artefact integrity (sha256 unchanged)
// ─────────────────────────────────────────────────────────────────────────────

const helperBytes = fs.readFileSync(HELPER_PATH);
const helperSha = crypto.createHash('sha256').update(helperBytes).digest('hex');
report(
  'CASE0-helper-sha256-unchanged',
  helperSha === HELPER_SHA256_EXPECTED,
  'n/a',
  'ARTIFACT_INTEGRITY',
  `observed helper sha256=${helperSha} expected=${HELPER_SHA256_EXPECTED}`,
);
if (helperSha !== HELPER_SHA256_EXPECTED) {
  finding('HELPER-HASH-DRIFT', `helper sha256 is ${helperSha}, expected ${HELPER_SHA256_EXPECTED}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// CASE A — both locked identities accepted at the validation stage
// ─────────────────────────────────────────────────────────────────────────────

const aResults = {};
for (const pair of [ID9, ID10]) {
  const id = `CASE-A-${pair.id}-identity-accepted`;
  if (!needsChild(id, 'requires spawning the operator helper as a child process')) {
    const r = runHelper(baseArgs(pair), { [ENV.LIVE_DB]: 'YES' });
    aResults[pair.id] = r;
    const shaLine = (r.stdout.match(/^FILE_SHA256_OBSERVED: (\S+)\s*$/m) || [])[1] || null;
    const accepted = shaLine === pair.sha256;
    const ok = r.status === 3
      && r.classification === 'TARGET_IDENTITY_UNDETERMINABLE'
      && accepted
      && !/REVISION_NOT_FOUND|FILE_HASH_MISMATCH|MIGRATION_IDENTITY_UNKNOWN|AUTHORITY_GUARD_REFUSAL/.test(r.stdout);
    report(
      id,
      ok,
      r.status,
      r.classification ?? 'NONE',
      `path/hash/revision passed validation: FILE_SHA256_OBSERVED=${shaLine} (expected ${pair.sha256}); ` +
      `guard satisfied (LANE_A_LIVE_DB_AUTHORIZED=YES); no credential present so it refused only at target identity; ` +
      `observed_sha_equals_expected=${accepted}`,
    );
  }
}

// A — in-process governed preflight must return ok for BOTH identities.
// NOTE: this case resolves the revision through the helper's real `revisionExists`/`bytesAtRevision`
// (i.e. it spawns `git`), so it is guarded by needsSpawnForGit rather than run blind.
const aStatic = {};
for (const pair of [ID9, ID10]) {
  const aId = `CASE-A-${pair.id}-preflight-ok-inprocess`;
  if (needsSpawnForGit(aId, 'in-process preflight still resolves the revision by spawning git via the helper\'s real dependency set')) continue;
  let credentialRead = false;
  const env = { [ENV.LIVE_DB]: 'YES' };
  Object.defineProperty(env, ENV.CREDENTIAL, {
    enumerable: true,
    get() { credentialRead = true; return undefined; },
  });
  const args = {
    mode: 'dry-run',
    'migration-id': pair.id,
    file: pair.file,
    'expect-revision': pair.revision,
    'expect-sha256': pair.sha256,
    'expect-target-ref': UNUSED_REF,
    'control-repo': CONTROL_REPO,
  };
  const pre = helper.evaluateGovernedPreflight(args, env, {});
  aStatic[pair.id] = { pre, credentialRead };
  const ok = pre.ok === true
    && pre.observedSha256 === pair.sha256
    && typeof pre.migrationText === 'string' && pre.migrationText.length > 0
    && credentialRead === false;
  report(
    aId,
    ok,
    'n/a',
    pre.classification ?? 'PREFLIGHT_OK',
    `evaluateGovernedPreflight ok=${pre.ok} observedSha256=${pre.observedSha256} ` +
    `migrationText_bytes=${pre.migrationText ? pre.migrationText.length : null} credential_variable_read=${credentialRead}`,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CASE B — wrong revision fails closed (+ INVERSE)
// ─────────────────────────────────────────────────────────────────────────────

const a1 = aResults['0009'];

if (!needsChild('CASE-B-wrong-revision-40hex-absent', 'requires spawning the operator helper as a child process')) {
  const b1 = runHelper(baseArgs(ID9, { 'expect-revision': 'a'.repeat(40) }));
  report(
    'CASE-B-wrong-revision-40hex-absent',
    b1.status === 2 && b1.classification === 'REVISION_NOT_FOUND',
    b1.status,
    b1.classification ?? 'NONE',
    `revision '${'a'.repeat(40)}' is not a commit in ${CONTROL_REPO}; refused before any credential read`,
  );
}

if (!needsChild('CASE-B-wrong-revision-malformed', 'requires spawning the operator helper as a child process')) {
  const b2 = runHelper(baseArgs(ID9, { 'expect-revision': 'not-a-sha' }));
  report(
    'CASE-B-wrong-revision-malformed',
    b2.status === 2 && b2.classification === 'REVISION_NOT_FOUND',
    b2.status,
    b2.classification ?? 'NONE',
    'revision is not exact 40-hex; refused before any credential read',
  );
}

if (!needsChild('CASE-B-INVERSE-correct-revision-not-refused', 'assertion reads a spawned helper result (stdout of the correct-revision run)')) {
  report(
    'CASE-B-INVERSE-correct-revision-not-refused',
    a1.status === 3 && !/REVISION_NOT_FOUND/.test(a1.stdout) && /^FILE_SHA256_OBSERVED: /m.test(a1.stdout),
    a1.status,
    a1.classification ?? 'NONE',
    'INVERSE PAIR (B): the correct locked revision for 0009 is NOT refused as REVISION_NOT_FOUND; ' +
    'the bytes were extracted and hashed, so the revision gate is non-vacuous',
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CASE C — wrong id/path pairing fails closed (+ INVERSE)
// ─────────────────────────────────────────────────────────────────────────────

if (!needsChild('CASE-C-0009-id-with-0010-path', 'requires spawning the operator helper as a child process')) {
  const c1 = runHelper(baseArgs(ID9, { file: ID10.file }));
  report(
    'CASE-C-0009-id-with-0010-path',
    c1.status === 2 && c1.classification === 'MIGRATION_IDENTITY_UNKNOWN',
    c1.status,
    c1.classification ?? 'NONE',
    `--migration-id 0009 with --file ${ID10.file} refused at check_1 (not the path bound to 0009)`,
  );
}

if (!needsChild('CASE-C-0010-id-with-0009-path', 'requires spawning the operator helper as a child process')) {
  const c2 = runHelper(baseArgs(ID10, { file: ID9.file }));
  report(
    'CASE-C-0010-id-with-0009-path',
    c2.status === 2 && c2.classification === 'MIGRATION_IDENTITY_UNKNOWN',
    c2.status,
    c2.classification ?? 'NONE',
    `--migration-id 0010 with --file ${ID9.file} refused at check_1 (not the path bound to 0010)`,
  );
}

if (!needsChild('CASE-C-INVERSE-correct-pair-not-refused', 'assertion reads a spawned helper result (stdout of the correct-pair run)')) {
  report(
    'CASE-C-INVERSE-correct-pair-not-refused',
    /^FILE_SHA256_OBSERVED: /m.test(a1.stdout) && !/MIGRATION_IDENTITY_UNKNOWN/.test(a1.stdout)
      && aStatic['0009'].pre.ok === true && aStatic['0010'].pre.ok === true,
    a1.status,
    a1.classification ?? 'NONE',
    'INVERSE PAIR (C): both correct id/file pairs pass check_1 (no MIGRATION_IDENTITY_UNKNOWN) and ' +
    'evaluateGovernedPreflight returns ok for both, so the pairing gate is non-vacuous',
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CASE D — wrong hash fails closed (+ INVERSE)
// ─────────────────────────────────────────────────────────────────────────────

const corrupted = `${ID9.sha256.slice(0, -1)}${ID9.sha256.slice(-1) === '7' ? '8' : '7'}`;

if (!needsChild('CASE-D-wrong-hash-refused', 'requires spawning the operator helper as a child process')) {
  const dEvPath = evidencePath('case-d-wrong-hash');
  const d1 = runHelper(baseArgs(ID9, { 'expect-sha256': corrupted, 'evidence-out': dEvPath }));
  const dDoc = readEvidence('case-d-wrong-hash');
  const dObserved = dDoc ? dDoc.file_sha256 : null;
  report(
    'CASE-D-wrong-hash-refused',
    d1.status === 2 && d1.classification === 'FILE_HASH_MISMATCH'
      && dObserved === ID9.sha256
      && dDoc && dDoc.file_sha256_expected === corrupted
      && dDoc.refusal && dDoc.refusal.connection_attempted === false && dDoc.refusal.credential_read === false,
    d1.status,
    d1.classification ?? 'NONE',
    `--expect-sha256 ${corrupted} rejected as FILE_HASH_MISMATCH; evidence json file_sha256(observed)=${dObserved} ` +
    `equals the real file hash=${ID9.sha256}, file_sha256_expected=${corrupted}; ` +
    `refusal.connection_attempted=${dDoc?.refusal?.connection_attempted}`,
  );
}

if (!needsChild('CASE-D-INVERSE-correct-hash-not-refused', 'assertion reads a spawned helper result (FILE_SHA256_OBSERVED of the correct-hash run)')) {
  const aSha = (a1.stdout.match(/^FILE_SHA256_OBSERVED: (\S+)\s*$/m) || [])[1] || null;
  report(
    'CASE-D-INVERSE-correct-hash-not-refused',
    aSha === ID9.sha256 && !/FILE_HASH_MISMATCH/.test(a1.stdout),
    a1.status,
    a1.classification ?? 'NONE',
    `INVERSE PAIR (D): the correct pinned sha256 is NOT refused as FILE_HASH_MISMATCH; the run printed ` +
    `FILE_SHA256_OBSERVED=${aSha} which equals the expected hash, so the hash gate is non-vacuous`,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CASE E — unsupported migration id fails closed (+ INVERSE)
// ─────────────────────────────────────────────────────────────────────────────

if (!needsChild('CASE-E-unsupported-migration-id', 'requires spawning the operator helper as a child process')) {
  const e1 = runHelper(baseArgs(ID9, { 'migration-id': '0011' }));
  report(
    'CASE-E-unsupported-migration-id',
    e1.status === 2 && e1.classification === 'MIGRATION_IDENTITY_UNKNOWN',
    e1.status,
    e1.classification ?? 'NONE',
    '--migration-id 0011 is outside the closed set {0009,0010}; refused at check_1',
  );
}

if (!needsChild('CASE-E-INVERSE-supported-id-not-refused', 'assertion reads a spawned helper result (stdout of the supported-id run)')) {
  report(
    'CASE-E-INVERSE-supported-id-not-refused',
    aStatic['0009'].pre.ok === true && aStatic['0010'].pre.ok === true
      && !/MIGRATION_IDENTITY_UNKNOWN/.test(a1.stdout),
    a1.status,
    a1.classification ?? 'NONE',
    'INVERSE PAIR (E): both supported ids are accepted (preflight ok for 0009 and 0010), so the closed-set gate is non-vacuous',
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CASE G — authority guards (child + in-process inverse pairs)
// ─────────────────────────────────────────────────────────────────────────────

if (!needsChild('CASE-G1-guard-live-db-unset', 'requires spawning the operator helper as a child process')) {
  const g1ev = evidencePath('case-g1-guard-live-unset');
  const g1 = runHelper(
    baseArgs(ID9, { 'evidence-out': g1ev }),
    { [ENV.CREDENTIAL]: UNROUTABLE_URL },
  );
  const g1doc = readEvidence('case-g1-guard-live-unset');
  const g1ConnFalse = g1doc && g1doc.refusal && g1doc.refusal.connection_attempted === false && g1doc.refusal.credential_read === false;
  report(
    'CASE-G1-guard-live-db-unset',
    g1.status === 2 && g1.classification === 'AUTHORITY_GUARD_REFUSAL'
      && /no credential was read and no connection was attempted/.test(g1.stdout) && g1ConnFalse,
    g1.status,
    g1.classification ?? 'NONE',
    `LANE_A_LIVE_DB_AUTHORIZED unset, credential=unroutable 127.0.0.1:1 synthetic; refused as ${g1.classification} ` +
    `(NOT CONNECTION_FAILED); evidence json refusal.connection_attempted=${g1doc?.refusal?.connection_attempted} ` +
    `credential_read=${g1doc?.refusal?.credential_read}`,
  );
}

if (!needsChild('CASE-G2-guard-production-apply-unset', 'requires spawning the operator helper as a child process')) {
  const g2ev = evidencePath('case-g2-guard-prod-apply-unset');
  const g2 = runHelper(
    baseArgs(ID9, { mode: 'apply', 'evidence-out': g2ev }),
    { [ENV.LIVE_DB]: 'YES', [ENV.CREDENTIAL]: UNROUTABLE_URL },
  );
  const g2doc = readEvidence('case-g2-guard-prod-apply-unset');
  report(
    'CASE-G2-guard-production-apply-unset',
    g2.status === 2 && g2.classification === 'AUTHORITY_GUARD_REFUSAL'
      && g2doc && g2doc.failure_stage === 'check_6_production_apply_authority'
      && g2doc.refusal.connection_attempted === false && g2doc.refusal.credential_read === false,
    g2.status,
    g2.classification ?? 'NONE',
    'LANE_A_LIVE_DB_AUTHORIZED=YES but LANE_A_PRODUCTION_APPLY_AUTHORIZED unset with --mode apply; refused at ' +
    `check_6; evidence json refusal.connection_attempted=${g2doc?.refusal?.connection_attempted}`,
  );
}

// G-INVERSE (child): guards satisfied -> NOT a guard refusal (and still no connection,
// because no credential exists, so it can only refuse at target identity).
if (!needsChild('CASE-G-INVERSE-guards-satisfied-not-refused', 'requires spawning the operator helper as a child process')) {
  const ginv = runHelper(baseArgs(ID9), { [ENV.LIVE_DB]: 'YES' });
  report(
    'CASE-G-INVERSE-guards-satisfied-not-refused',
    ginv.classification === 'TARGET_IDENTITY_UNDETERMINABLE' && ginv.status === 3
      && !/AUTHORITY_GUARD_REFUSAL/.test(ginv.stdout),
    ginv.status,
    ginv.classification ?? 'NONE',
    'INVERSE PAIR (G1): with the live-DB guard set, the same invocation is NOT refused as AUTHORITY_GUARD_REFUSAL ' +
    '(it advances to target identity, which cannot be derived without a credential)',
  );
}

if (!needsChild('CASE-G-INVERSE-apply-guards-satisfied-not-refused', 'requires spawning the operator helper as a child process')) {
  const ginv2 = runHelper(baseArgs(ID9, { mode: 'apply' }), { [ENV.LIVE_DB]: 'YES', [ENV.PRODUCTION_APPLY]: 'YES' });
  report(
    'CASE-G-INVERSE-apply-guards-satisfied-not-refused',
    ginv2.classification === 'TARGET_IDENTITY_UNDETERMINABLE' && ginv2.status === 3
      && !/AUTHORITY_GUARD_REFUSAL/.test(ginv2.stdout),
    ginv2.status,
    ginv2.classification ?? 'NONE',
    'INVERSE PAIR (G2): with BOTH guards set and --mode apply, the invocation is NOT refused as ' +
    'AUTHORITY_GUARD_REFUSAL; it stops at target identity with no credential present',
  );
}

// G in-process: credential getter proves the preflight never reads the credential variable.
// Like CASE-A, this resolves the revision through the helper's real git dependencies.
function guardProbe(envOverrides, modeOverride) {
  let credentialRead = false;
  const env = { ...envOverrides };
  Object.defineProperty(env, ENV.CREDENTIAL, {
    enumerable: true,
    get() { credentialRead = true; return UNROUTABLE_URL; },
  });
  const args = {
    mode: modeOverride,
    'migration-id': ID9.id,
    file: ID9.file,
    'expect-revision': ID9.revision,
    'expect-sha256': ID9.sha256,
    'expect-target-ref': UNUSED_REF,
    'control-repo': CONTROL_REPO,
  };
  const pre = helper.evaluateGovernedPreflight(args, env, {});
  return { pre, credentialRead };
}

if (!needsSpawnForGit('CASE-G-static-guard-ladder', 'in-process guard ladder still resolves the revision by spawning git via the helper\'s real dependency set')) {
  const gp1 = guardProbe({}, 'dry-run');
  const gp2 = guardProbe({ [ENV.LIVE_DB]: 'YES' }, 'apply');
  const gp3 = guardProbe({ [ENV.LIVE_DB]: 'YES' }, 'dry-run');
  const gp4 = guardProbe({ [ENV.LIVE_DB]: 'YES', [ENV.PRODUCTION_APPLY]: 'YES' }, 'apply');
  report(
    'CASE-G-static-guard-ladder',
    gp1.pre.ok === false && gp1.pre.stage === 'check_5_live_db_authority' && gp1.credentialRead === false
      && gp2.pre.ok === false && gp2.pre.stage === 'check_6_production_apply_authority' && gp2.credentialRead === false
      && gp3.pre.ok === true && gp3.credentialRead === false
      && gp4.pre.ok === true && gp4.credentialRead === false,
    'n/a',
    `${gp1.pre.classification}/${gp2.pre.classification}/ok-ok`,
    'in-process ladder: (live unset -> check_5 refusal), (live=YES, apply, prod unset -> check_6 refusal), ' +
    '(live=YES dry-run -> ok), (both=YES apply -> ok); credential variable read in preflight = ' +
    `${gp1.credentialRead}/${gp2.credentialRead}/${gp3.credentialRead}/${gp4.credentialRead} (all must be false)`,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CASE F — wrong target identity fails closed (exported identity seam)
// ─────────────────────────────────────────────────────────────────────────────

const seam = helper.deriveTargetIdentity(UNROUTABLE_URL);
const fSeamOk = typeof helper.deriveTargetIdentity === 'function'
  && seam.ok === true && seam.ref === SYNTHETIC_REF && seam.form === 'pooler';
report(
  'CASE-F-seam-exported-deriveTargetIdentity',
  fSeamOk,
  'n/a',
  'IN_PROCESS_SEAM_OK',
  `exported seam deriveTargetIdentity('${UNROUTABLE_URL}') -> ok=${seam.ok} ref=${seam.ref} role=${seam.role} form=${seam.form} ` +
  '(no network: this function only parses the string)',
);

if (!needsChild('CASE-F-wrong-target-identity-refused', 'requires spawning the operator helper as a child process')) {
  const fev = evidencePath('case-f-target-mismatch');
  const f1 = runHelper(
    baseArgs(ID9, { 'expect-target-ref': 'wu3-other-ref', 'evidence-out': fev }),
    { [ENV.LIVE_DB]: 'YES', [ENV.CREDENTIAL]: UNROUTABLE_URL },
  );
  const fdoc = readEvidence('case-f-target-mismatch');
  report(
    'CASE-F-wrong-target-identity-refused',
    f1.status === 3 && f1.classification === 'TARGET_IDENTITY_MISMATCH'
      && /REFUSED_AT: target_proof/.test(f1.stdout)
      && fdoc && fdoc.target_identity && fdoc.target_identity.ref === SYNTHETIC_REF
      && fdoc.refusal.connection_attempted === false && fdoc.refusal.credential_read === true,
    f1.status,
    f1.classification ?? 'NONE',
    `credential resolves ref=${fdoc?.target_identity?.ref}, --expect-target-ref=wu3-other-ref; exit=${f1.status} ` +
    `(TARGET_IDENTITY_MISMATCH exitCode=${CLS.TARGET_IDENTITY_MISMATCH.exitCode}); refusal stage=target_proof, ` +
    `connection_attempted=${fdoc?.refusal?.connection_attempted}; refusal precedes any driver load`,
  );
}

const fInv = seam.ok === true && !(seam.ref !== SYNTHETIC_REF);
report(
  'CASE-F-INVERSE-matching-ref-not-mismatched',
  fInv,
  'n/a',
  'IN_PROCESS_SEAM_OK',
  `INVERSE PAIR (F): with the same credential the derived ref (${seam.ref}) EQUALS the expected ref, so the ` +
  "helper's mismatch branch (the `identity.ref !== args['expect-target-ref']` comparison) evaluates false; " +
  'the mismatch gate is non-vacuous. Proven in-process because the matching case would otherwise advance ' +
  'toward the execution stage (no connection may be attempted by this harness).',
);

// ─────────────────────────────────────────────────────────────────────────────
// CASE H — dry-run is structurally guaranteed to roll back (stub handle + line numbers)
// ─────────────────────────────────────────────────────────────────────────────

const srcLines = helperBytes.toString('utf8').split(/\r?\n/);
const idxOfFirst = (needle) => srcLines.findIndex((l) => l.includes(needle));
const idxOfLast = (needle) => {
  for (let i = srcLines.length - 1; i >= 0; i -= 1) if (srcLines[i].includes(needle)) return i;
  return -1;
};
const L = {
  preThrow: idxOfFirst('throw new Error(result.failure_reason);') + 1,
  postMeasure: idxOfFirst('result.postconditions = await measurePostFn(tx, migration.id)') + 1,
  postThrow: idxOfLast('throw new Error(result.failure_reason);') + 1,
  dryRunGuard: idxOfFirst("if (mode === 'dry-run') {") + 1,
  sentinelThrow: idxOfFirst('throw new Sentinel()') + 1,
  commitCallLines: srcLines.map((l, i) => [i + 1, l]).filter(([, l]) => /\.commit\s*\(/.test(l)).map(([n]) => n),
  callbackEnd: idxOfFirst('// apply: falling out of the callback reaches postgres.js') + 1,
};

function makeStubSql() {
  const log = { begun: 0, rolledBack: 0, committed: 0, unsafeCalls: 0 };
  const sql = {
    log,
    async begin(cb) {
      log.begun += 1;
      const tx = {
        unsafe: async () => { log.unsafeCalls += 1; },
      };
      try {
        await cb(tx);
        log.committed += 1;
      } catch (e) {
        log.rolledBack += 1;
        throw e;
      }
    },
  };
  return sql;
}

const okCheck = (name) => ({ check: name, expected: 'true', observed: true, ok: true });

const stubDry = makeStubSql();
const dryOutcome = await helper.runManagedTransaction({
  mode: 'dry-run',
  sql: stubDry,
  migration: helper.MIGRATIONS['0009'],
  migrationText: '-- stub (never sent anywhere; no database is involved)',
  deps: {
    measureShape: async () => ({ fn_17_count: 1, fn_19_count: 1 }),
    measurePreconditions: async () => [okCheck('stub-pre')],
    measurePostconditions: async () => [okCheck('stub-post')],
  },
});
const h1 = dryOutcome.result;
const hStruct =
  L.sentinelThrow > L.dryRunGuard
  && L.dryRunGuard > L.postThrow
  && L.postThrow > L.postMeasure
  && L.commitCallLines.length === 0
  && L.callbackEnd > L.sentinelThrow;
report(
  'CASE-H-dry-run-structural-rollback',
  dryOutcome.classification === 'DRY_RUN_PASS'
    && h1.rollback_deliberate === true && h1.rollback_result === 'ROLLED_BACK'
    && h1.commit_result === 'NOT_COMMITTED' && h1.shape_preserved === true
    && stubDry.log.committed === 0 && stubDry.log.rolledBack === 1 && hStruct,
  'n/a',
  dryOutcome.classification,
  `stub transaction: begin=${stubDry.log.begun} committed=${stubDry.log.committed} rolledBack=${stubDry.log.rolledBack}; ` +
  `rollback_deliberate=${h1.rollback_deliberate} commit_result=${h1.commit_result}; ` +
  `helper lines inspected: L${L.dryRunGuard} (guard \`if (mode === 'dry-run')\`) < L${L.sentinelThrow} (\`throw new Sentinel()\`) ` +
  `and L${L.callbackEnd} (comment: falling out of the callback reaches postgres.js COMMIT) is AFTER the sentinel; ` +
  `explicit .commit( call sites in helper = ${L.commitCallLines.length === 0 ? 'none' : L.commitCallLines.join(',')}`,
);

// ─────────────────────────────────────────────────────────────────────────────
// CASE I — apply commits only after postconditions pass (+ INVERSE)
// ─────────────────────────────────────────────────────────────────────────────

const stubApplyFail = makeStubSql();
const applyFail = await helper.runManagedTransaction({
  mode: 'apply',
  sql: stubApplyFail,
  migration: helper.MIGRATIONS['0009'],
  migrationText: '-- stub',
  deps: {
    measureShape: async () => ({ fn_17_count: 1, fn_19_count: 1 }),
    measurePreconditions: async () => [okCheck('stub-pre')],
    measurePostconditions: async () => [{ check: 'stub-post', expected: 'true', observed: false, ok: false }],
  },
});
const iStruct = L.dryRunGuard > L.postThrow && L.postThrow > L.preThrow && L.postThrow > L.postMeasure
  && L.commitCallLines.length === 0;
report(
  'CASE-I-apply-postcondition-failure-rolls-back',
  applyFail.classification === 'APPLY_FAILED'
    && applyFail.result.rollback_result === 'ROLLED_BACK' && applyFail.result.commit_result === 'NOT_COMMITTED'
    && applyFail.result.failure_stage === 'postcondition'
    && stubApplyFail.log.committed === 0 && stubApplyFail.log.rolledBack === 1 && iStruct,
  'n/a',
  applyFail.classification,
  `failing postcondition -> throw at L${L.postThrow} before the dry-run guard L${L.dryRunGuard} and before the ` +
  `callback end L${L.callbackEnd}: committed=${stubApplyFail.log.committed} rolledBack=${stubApplyFail.log.rolledBack} ` +
  `commit_result=${applyFail.result.commit_result} failure_stage=${applyFail.result.failure_stage}; ` +
  `explicit .commit( call sites in helper = ${L.commitCallLines.length === 0 ? 'none' : L.commitCallLines.join(',')} ` +
  `(commit is postgres.js's implicit commit on normal callback return)`,
);

const stubApplyOk = makeStubSql();
const applyOk = await helper.runManagedTransaction({
  mode: 'apply',
  sql: stubApplyOk,
  migration: helper.MIGRATIONS['0009'],
  migrationText: '-- stub',
  deps: {
    measureShape: async () => ({ fn_17_count: 1, fn_19_count: 1 }),
    measurePreconditions: async () => [okCheck('stub-pre')],
    measurePostconditions: async () => [okCheck('stub-post')],
  },
});
report(
  'CASE-I-INVERSE-all-postconditions-pass-commits',
  applyOk.classification === 'APPLY_PASS' && applyOk.result.commit_result === 'COMMITTED'
    && applyOk.result.rollback_result === 'NOT_RUN'
    && stubApplyOk.log.committed === 1 && stubApplyOk.log.rolledBack === 0,
  'n/a',
  applyOk.classification,
  `INVERSE PAIR (I): with every postcondition true the callback returns normally and COMMIT happens ` +
  `(committed=${stubApplyOk.log.committed}); so the postcondition gate is non-vacuous`,
);

const stubApplyPreFail = makeStubSql();
const applyPreFail = await helper.runManagedTransaction({
  mode: 'apply',
  sql: stubApplyPreFail,
  migration: helper.MIGRATIONS['0009'],
  migrationText: '-- stub',
  deps: {
    measureShape: async () => ({ fn_17_count: 1, fn_19_count: 1 }),
    measurePreconditions: async () => [{ check: 'stub-pre', expected: 'true', observed: false, ok: false }],
    measurePostconditions: async () => [okCheck('stub-post')],
  },
});
report(
  'CASE-I-apply-precondition-failure-rolls-back',
  applyPreFail.classification === 'APPLY_FAILED' && applyPreFail.result.commit_result === 'NOT_COMMITTED'
    && applyPreFail.result.failure_stage === 'precondition'
    && stubApplyPreFail.log.unsafeCalls === 0 && stubApplyPreFail.log.committed === 0,
  'n/a',
  applyPreFail.classification,
  `precondition throw at L${L.preThrow} fired before the migration SQL (statement_count=` +
  `${applyPreFail.result.statement_count}, unsafe calls=${stubApplyPreFail.log.unsafeCalls}); commit_result=${applyPreFail.result.commit_result}`,
);

// ─────────────────────────────────────────────────────────────────────────────
// CASE N — brief section 10 worker-live gate for 0010 (F-OP-01 finding 1)
//
// Every N case is IN-PROCESS (it calls the exported evaluateGovernedPreflight directly and
// never opens a connection), so it runs in both default and read-only mode and in an
// environment that cannot spawn children.
// ─────────────────────────────────────────────────────────────────────────────

const PROOF_REF = SYNTHETIC_REF;

const apply0009Record = {
  task_id: helper.TASK_ID,
  migration_id: '0009',
  mode: 'apply',
  final_classification: 'APPLY_PASS',
  commit: { result: 'COMMITTED' },
  target_identity: { ref: PROOF_REF },
};

const validProof = {
  task_id: helper.TASK_ID,
  target_ref: PROOF_REF,
  observed_function: 'public.ingest_agent_work_event_atomic(19 args)',
  observed_by: 'select p.pronargs from pg_proc p where p.proname = ... (fixture observing command)',
  observed_at: '2026-09-23T00:00:00.000Z',
};

/**
 * In-process probe of check 4/4b. Mode is apply by default and BOTH authority guards are set,
 * so the only thing that can refuse is the sequencing gate itself — and the credential getter
 * proves the refusal happened without reading the credential variable.
 *
 * HERMETIC: the git-facing dependencies are stubbed (the revision is declared to exist and the
 * file bytes are supplied directly), exactly as the stub-handle transaction cases do. These
 * cases therefore run in ANY environment, including one that cannot spawn a child process —
 * which is what lets the sequencing gate be verified inside a constrained reviewer sandbox.
 * The hash/revision gates are covered separately by CASE-B/CASE-D against the real git.
 */
const HERMETIC_STUB_BYTES = Buffer.from('-- stub migration text for the sequencing-gate cases (never sent to any database)\n', 'utf8');
const HERMETIC_STUB_SHA = crypto.createHash('sha256').update(HERMETIC_STUB_BYTES).digest('hex');

function sequencingGateDeps() {
  return {
    revisionExists: () => true,
    bytesAtRevision: () => HERMETIC_STUB_BYTES,
    statIsDirectory: (p) => {
      try { return fs.statSync(p).isDirectory(); } catch { return false; }
    },
  };
}

function proofProbe(evidencePathArg, expectRef, mode = 'apply') {
  let credentialRead = false;
  const env = { [ENV.LIVE_DB]: 'YES', [ENV.PRODUCTION_APPLY]: 'YES' };
  Object.defineProperty(env, ENV.CREDENTIAL, {
    enumerable: true,
    get() { credentialRead = true; return UNROUTABLE_URL; },
  });
  const args = {
    mode,
    'migration-id': ID10.id,
    file: ID10.file,
    'expect-revision': ID10.revision,
    'expect-sha256': HERMETIC_STUB_SHA,
    'expect-target-ref': expectRef,
    'control-repo': CONTROL_REPO,
    'require-evidence': evidencePathArg,
  };
  const pre = helper.evaluateGovernedPreflight(args, env, sequencingGateDeps());
  return { pre, credentialRead };
}

// N0 — the new classification exists in the exported classification object.
report(
  'CASE-N0-classification-WORKER_LIVE_PROOF_MISSING-exists',
  Object.prototype.hasOwnProperty.call(CLS, 'WORKER_LIVE_PROOF_MISSING')
    && CLS.WORKER_LIVE_PROOF_MISSING.kind === 'refusal'
    && CLS.WORKER_LIVE_PROOF_MISSING.exitCode === 2
    && typeof helper.evaluateWorkerLiveProof === 'function',
  'n/a',
  'CLASSIFICATION_CATALOG',
  `CLASSIFICATION.WORKER_LIVE_PROOF_MISSING=${JSON.stringify(CLS.WORKER_LIVE_PROOF_MISSING)}; ` +
  `existing classifications preserved=${Object.keys(CLS).length} total ` +
  `(SEQUENCING_EVIDENCE_MISSING=${JSON.stringify(CLS.SEQUENCING_EVIDENCE_MISSING)}, ` +
  `AUTHORITY_GUARD_REFUSAL=${JSON.stringify(CLS.AUTHORITY_GUARD_REFUSAL)}); ` +
  'exported evaluateWorkerLiveProof present=' + (typeof helper.evaluateWorkerLiveProof === 'function'),
);

// N1 — THE REQUIRED DEMONSTRATION: 0009 record present, worker-live proof absent -> REFUSED.
{
  const p = writeScratchJson('n1-0009-only-no-proof.json', { records: [apply0009Record] });
  const { pre, credentialRead } = proofProbe(p, PROOF_REF);
  report(
    'CASE-N1-0010-apply-0009-record-but-no-worker-live-proof-REFUSED',
    pre.ok === false
      && pre.classification === 'WORKER_LIVE_PROOF_MISSING'
      && pre.stage === 'check_4b_worker_live_proof'
      && CLS.WORKER_LIVE_PROOF_MISSING.exitCode === 2
      && pre.sequencing && pre.sequencing.ok === true
      && pre.sequencing.worker_live_proof && pre.sequencing.worker_live_proof.ok === false
      && pre.sequencing.worker_live_proof.reason === 'worker_live_proof_absent'
      && credentialRead === false,
    CLS.WORKER_LIVE_PROOF_MISSING.exitCode,
    pre.classification ?? 'NONE',
    `REQUIRED DEMONSTRATION — evidence records the successful 0009 apply for target ${PROOF_REF} (4a satisfied: ` +
    `sequencing.ok=${pre.sequencing?.ok}) but records NO worker-live proof, so the 0010 apply is refused as ` +
    `${pre.classification} at ${pre.stage} with exit ${CLS.WORKER_LIVE_PROOF_MISSING.exitCode}; the 0009 apply record alone ` +
    `was NOT accepted as proof (worker_live_proof.reason=${pre.sequencing?.worker_live_proof?.reason}); ` +
    `credential variable read during the refusal=${credentialRead}`,
  );
}

// N2 — Shape 2 (per-record fields) accepted: gate is non-vacuous.
{
  const p = writeScratchJson('n2-shape2-per-record-proof.json', { records: [apply0009Record, validProof] });
  const { pre } = proofProbe(p, PROOF_REF);
  report(
    'CASE-N2-INVERSE-shape2-per-record-proof-accepted',
    pre.ok === true
      && pre.sequencing.worker_live_proof.ok === true
      && pre.sequencing.worker_live_proof.source === 'per_record_fields',
    'n/a',
    pre.classification ?? 'PREFLIGHT_OK',
    `INVERSE (N): the same 0010 apply invocation with a complete per-record (Shape 2) worker-live proof for task ` +
    `${helper.TASK_ID} and target ${PROOF_REF} is accepted (preflight ok=${pre.ok}, ` +
    `proof.source=${pre.sequencing?.worker_live_proof?.source}), so the WORKER_LIVE_PROOF_MISSING gate is not ` +
    'a blanket refusal. No connection: evaluateGovernedPreflight never dials out.',
  );
}

// N3 — proof present but for a DIFFERENT target ref -> refused.
{
  const p = writeScratchJson('n3-proof-different-target.json', {
    records: [apply0009Record],
    worker_live_proofs: [{ ...validProof, target_ref: 'wu3-some-other-ref' }],
  });
  const { pre } = proofProbe(p, PROOF_REF);
  report(
    'CASE-N3-proof-for-different-target-refused',
    pre.ok === false && pre.classification === 'WORKER_LIVE_PROOF_MISSING'
      && pre.sequencing.worker_live_proof.reason === 'worker_live_proof_recorded_for_a_different_target',
    CLS.WORKER_LIVE_PROOF_MISSING.exitCode,
    pre.classification ?? 'NONE',
    `worker-live proof exists but names target 'wu3-some-other-ref' while --expect-target-ref is '${PROOF_REF}'; ` +
    `refused as ${pre.classification} (reason=${pre.sequencing?.worker_live_proof?.reason})`,
  );
}

// N4 — proof present but for a DIFFERENT task id -> refused.
{
  const p = writeScratchJson('n4-proof-different-task.json', {
    records: [apply0009Record],
    worker_live_proofs: [{ ...validProof, task_id: 'WSTERA-SOME-OTHER-TASK' }],
  });
  const { pre } = proofProbe(p, PROOF_REF);
  report(
    'CASE-N4-proof-for-different-task-id-refused',
    pre.ok === false && pre.classification === 'WORKER_LIVE_PROOF_MISSING'
      && pre.sequencing.worker_live_proof.reason === 'worker_live_proof_recorded_for_a_different_task',
    CLS.WORKER_LIVE_PROOF_MISSING.exitCode,
    pre.classification ?? 'NONE',
    `worker-live proof names task 'WSTERA-SOME-OTHER-TASK' while the helper's task id is '${helper.TASK_ID}'; ` +
    `refused as ${pre.classification} (reason=${pre.sequencing?.worker_live_proof?.reason})`,
  );
}

// N5 — incomplete proof (right ref + right task, missing observer/timestamp) -> refused, fail closed.
{
  const p = writeScratchJson('n5-proof-incomplete.json', {
    records: [apply0009Record],
    worker_live_proofs: [{ task_id: helper.TASK_ID, target_ref: PROOF_REF, observed_function: 'public.ingest_agent_work_event_atomic(19 args)' }],
  });
  const { pre } = proofProbe(p, PROOF_REF);
  report(
    'CASE-N5-incomplete-proof-refused-fail-closed',
    pre.ok === false && pre.classification === 'WORKER_LIVE_PROOF_MISSING'
      && pre.sequencing.worker_live_proof.reason === 'worker_live_proof_record_incomplete',
    CLS.WORKER_LIVE_PROOF_MISSING.exitCode,
    pre.classification ?? 'NONE',
    `a proof record with the right target ref and task id but WITHOUT observed_by/observed_at is refused as ` +
    `${pre.classification} (reason=${pre.sequencing?.worker_live_proof?.reason}) rather than being ignored`,
  );
}

// N6 — Shape 1 (sibling top-level array) accepted: the documented preferred shape is enforced.
{
  const p = writeScratchJson('n6-shape1-top-level-array.json', {
    records: [apply0009Record],
    worker_live_proofs: [validProof],
  });
  const { pre } = proofProbe(p, PROOF_REF);
  report(
    'CASE-N6-INVERSE-shape1-top-level-array-accepted',
    pre.ok === true && pre.sequencing.worker_live_proof.ok === true
      && pre.sequencing.worker_live_proof.source === 'top_level_worker_live_proofs',
    'n/a',
    pre.classification ?? 'PREFLIGHT_OK',
    `the documented sibling top-level \`worker_live_proofs\` array shape is accepted ` +
    `(proof.source=${pre.sequencing?.worker_live_proof?.source}, proof.observed_function=` +
    `${pre.sequencing?.worker_live_proof?.proof?.observed_function})`,
  );
}

// N7 — valid proof but NO 0009 apply record -> still SEQUENCING_EVIDENCE_MISSING (4a unchanged, 4b is not a substitute).
{
  const p = writeScratchJson('n7-proof-but-no-0009-record.json', { records: [], worker_live_proofs: [validProof] });
  const { pre } = proofProbe(p, PROOF_REF);
  report(
    'CASE-N7-worker-proof-without-0009-record-still-refused',
    pre.ok === false && pre.classification === 'SEQUENCING_EVIDENCE_MISSING'
      && pre.stage === 'check_4_sequencing_evidence',
    CLS.SEQUENCING_EVIDENCE_MISSING.exitCode,
    pre.classification ?? 'NONE',
    'a complete worker-live proof does NOT substitute for the pre-existing 4a gate: with no successful 0009 apply ' +
    `record the 0010 apply is still refused as ${pre.classification} at ${pre.stage}`,
  );
}

// N8 — dry-run of 0010 with evidence lacking a proof is NOT refused (proof gates apply only).
{
  const p = writeScratchJson('n8-dryrun-no-proof-not-refused.json', { records: [apply0009Record] });
  const { pre } = proofProbe(p, PROOF_REF, 'dry-run');
  report(
    'CASE-N8-dry-run-without-proof-not-refused',
    pre.ok === true && pre.sequencing.worker_live_proof && pre.sequencing.worker_live_proof.ok === false,
    'n/a',
    pre.classification ?? 'PREFLIGHT_OK',
    'the worker-live proof gate applies to --mode apply only: a 0010 DRY-RUN carrying the same 0009-only evidence ' +
    `advances (ok=${pre.ok}) while the proof state is still recorded on sequencing.worker_live_proof ` +
    `(ok=${pre.sequencing?.worker_live_proof?.ok}, reason=${pre.sequencing?.worker_live_proof?.reason})`,
  );
}

// N9 — the alternative live-ingestion-proof-reference form is accepted.
{
  const p = writeScratchJson('n9-live-ingestion-proof-ref.json', {
    records: [apply0009Record],
    worker_live_proofs: [{
      task_id: helper.TASK_ID,
      target_ref: PROOF_REF,
      live_ingestion_proof_ref: 'fixture-live-ingestion-proof-record-0001',
      observed_by: 'fixture observing command',
      observed_at: '2026-09-23T00:00:00.000Z',
    }],
  });
  const { pre } = proofProbe(p, PROOF_REF);
  report(
    'CASE-N9-INVERSE-live-ingestion-proof-ref-accepted',
    pre.ok === true && pre.sequencing.worker_live_proof.ok === true
      && pre.sequencing.worker_live_proof.proof.live_ingestion_proof_ref === 'fixture-live-ingestion-proof-record-0001',
    'n/a',
    pre.classification ?? 'PREFLIGHT_OK',
    'the documented alternative (a recorded live-ingestion-proof reference instead of an observed function identity) ' +
    `is accepted: proof.live_ingestion_proof_ref=${pre.sequencing?.worker_live_proof?.proof?.live_ingestion_proof_ref}`,
  );
}

// N10 — 0009 apply record for a DIFFERENT target -> 4a still refuses (existing behaviour preserved).
{
  const p = writeScratchJson('n10-0009-record-different-target.json', {
    records: [{ ...apply0009Record, target_identity: { ref: 'wu3-foreign-ref' } }],
    worker_live_proofs: [validProof],
  });
  const { pre } = proofProbe(p, PROOF_REF);
  report(
    'CASE-N10-0009-record-for-other-target-still-refused',
    pre.ok === false && pre.classification === 'SEQUENCING_EVIDENCE_MISSING',
    CLS.SEQUENCING_EVIDENCE_MISSING.exitCode,
    pre.classification ?? 'NONE',
    `a 0009 apply record for 'wu3-foreign-ref' with a complete worker-live proof for '${PROOF_REF}' is still refused ` +
    `as ${pre.classification} (reason=${pre.sequencing?.reason})`,
  );
}

// N11 — the observed-function identity must establish the 19-argument shape, not merely name the RPC.
{
  const p = writeScratchJson('n11-proof-wrong-arity.json', {
    records: [apply0009Record],
    worker_live_proofs: [{
      task_id: helper.TASK_ID,
      target_ref: PROOF_REF,
      observed_function: 'public.ingest_agent_work_event_atomic(17 args)',
      observed_by: 'fixture observing command',
      observed_at: '2026-09-23T00:00:00.000Z',
    }],
  });
  const { pre } = proofProbe(p, PROOF_REF);
  report(
    'CASE-N11-proof-naming-17-arg-path-refused',
    pre.ok === false && pre.classification === 'WORKER_LIVE_PROOF_MISSING'
      && pre.sequencing.worker_live_proof.reason === 'worker_live_proof_record_incomplete',
    CLS.WORKER_LIVE_PROOF_MISSING.exitCode,
    pre.classification ?? 'NONE',
    'a proof naming the RPC on the 17-argument path is NOT accepted as proof of the 19-argument path: refused as ' +
    `${pre.classification} (reason=${pre.sequencing?.worker_live_proof?.reason})`,
  );
}

// N-CHILD — end-to-end: the refusal happens in the real helper process, before any credential read.
if (!needsChild('CASE-N-CHILD-0010-apply-no-proof-refused-before-credential', 'requires spawning the operator helper as a child process')) {
  const nChildEv = writeScratchJson('nchild-0009-only-no-proof.json', { records: [apply0009Record] });
  const nArgs = baseArgs(ID10, {
    mode: 'apply',
    'expect-target-ref': PROOF_REF,
    'require-evidence': nChildEv,
    'evidence-out': evidencePath('case-n-child-0010-no-proof'),
  });
  const nRun = runHelper(nArgs, { [ENV.LIVE_DB]: 'YES', [ENV.PRODUCTION_APPLY]: 'YES', [ENV.CREDENTIAL]: UNROUTABLE_URL });
  const nDoc = readEvidence('case-n-child-0010-no-proof');
  report(
    'CASE-N-CHILD-0010-apply-no-proof-refused-before-credential',
    nRun.status === CLS.WORKER_LIVE_PROOF_MISSING.exitCode
      && nRun.classification === 'WORKER_LIVE_PROOF_MISSING'
      && /REFUSED_AT: check_4b_worker_live_proof/.test(nRun.stdout)
      && !/TARGET_IDENTITY|CONNECTION_FAILED|RUNTIME_DEPENDENCY_UNAVAILABLE|DRIVER/.test(nRun.stdout)
      && nDoc && nDoc.final_classification === 'WORKER_LIVE_PROOF_MISSING'
      && nDoc.refusal && nDoc.refusal.credential_read === false && nDoc.refusal.connection_attempted === false
      && nDoc.sequencing_evidence && nDoc.sequencing_evidence.ok === true
      && nDoc.sequencing_evidence.worker_live_proof.ok === false,
    nRun.status,
    nRun.classification ?? 'NONE',
    `child run of the real helper: --mode apply --migration-id 0010 with both guards YES and a synthetic unroutable ` +
    `credential, evidence = successful 0009 apply record with NO worker-live proof; exit=${nRun.status} ` +
    `classification=${nRun.classification}; evidence json refusal.credential_read=${nDoc?.refusal?.credential_read} ` +
    `connection_attempted=${nDoc?.refusal?.connection_attempted}; the run never reached target proof or a driver load`,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CASE J — secret scan over the created files and the helper
// ─────────────────────────────────────────────────────────────────────────────

if (!needsChild('CASE-J-secret-scan', 'requires spawning python/swarmctl as a child process')) {
  const scanPaths = [SELF_PATH, HELPER_PATH, ...fs.readdirSync(SCRATCH).map((f) => path.join(SCRATCH, f))]
    .map((p) => p.split(path.sep).join('/'));
  const scan = spawnSync('python', [SWARMCTL, 'secret-scan', '--paths', ...scanPaths], {
    encoding: 'utf8',
    cwd: REPO_ROOT,
    timeout: 180000,
    windowsHide: true,
  });
  const scanOut = `${scan.stdout || ''}${scan.stderr || ''}`;
  let scanFindings = null;
  try { scanFindings = JSON.parse((scan.stdout || '').trim()).findings; } catch { scanFindings = null; }
  report(
    'CASE-J-secret-scan',
    scan.status === 0 && Array.isArray(scanFindings) && scanFindings.length === 0,
    scan.status,
    scan.status === 0 ? 'NO_FINDINGS' : 'SCAN_NONZERO',
    `swarmctl secret-scan over ${scanPaths.length} paths (harness, helper, scratch files outside the tree) -> ` +
    `exit ${scan.status}, findings=${Array.isArray(scanFindings) ? scanFindings.length : 'UNPARSED'}: ${oneLine(scanOut, 400)}`,
  );
  if (Array.isArray(scanFindings) && scanFindings.length > 0) {
    finding('SECRET-SCAN-OUTPUT', `secret-scan reported ${scanFindings.length} finding(s): ${oneLine(JSON.stringify(scanFindings), 800)}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CASE K — runbook drizzle-kit / db:push classification
// ─────────────────────────────────────────────────────────────────────────────

let kOk = false;
let kDetail = 'runbook unreadable';
if (fs.existsSync(RUNBOOK)) {
  const rl = fs.readFileSync(RUNBOOK, 'utf8').split(/\r?\n/);
  const hits = [];
  rl.forEach((line, i) => {
    if (/drizzle-kit|db:push/i.test(line)) {
      const prohibition = /\b(no longer|never|not\b|prohibit|do not|don't|cannot|out of scope)\b/i.test(line);
      hits.push({ line: i + 1, classification: prohibition ? 'PROHIBITION_OR_HISTORICAL' : 'LIVE_INSTRUCTION', text: oneLine(line, 200) });
    }
  });
  const live = hits.filter((h) => h.classification === 'LIVE_INSTRUCTION');
  kOk = live.length === 0;
  kDetail = `hits=${hits.length} live=${live.length} prohibition_or_historical=${hits.length - live.length} :: ` +
    hits.map((h) => `L${h.line}=${h.classification}`).join(' ');
  for (const h of hits) console.log(`  K-HIT L${h.line} ${h.classification}: ${h.text}`);
}
report('CASE-K-runbook-drizzle-kit-dbpush', kOk, 'n/a', kOk ? 'NO_LIVE_INSTRUCTION' : 'LIVE_INSTRUCTION_PRESENT', kDetail);
if (!kOk) finding('RUNBOOK-LIVE-DRIZZLE-INSTRUCTION', kDetail);

// ─────────────────────────────────────────────────────────────────────────────
// CASE L — planning worktree cleanliness / scope
// ─────────────────────────────────────────────────────────────────────────────

if (!needsChild('CASE-L-worktree-scope', 'requires spawning git as a child process')) {
  const diffCheck = spawnSync('git', ['diff', '--check'], { cwd: REPO_ROOT, encoding: 'utf8', windowsHide: true });
  const statusPorcelain = spawnSync('git', ['status', '--porcelain', '--untracked-files=all'], { cwd: REPO_ROOT, encoding: 'utf8', windowsHide: true });
  const statusLines = (statusPorcelain.stdout || '').trim().split(/\r?\n/).filter(Boolean);
  console.log(`  L-STATUS-RAW ${statusLines.length} entries:`);
  for (const s of statusLines) console.log(`   ${s}`);
  console.log(`  L-DIFF-CHECK-RAW exit=${diffCheck.status} stderr=${oneLine(diffCheck.stderr, 300)}`);
  report(
    'CASE-L-worktree-scope',
    diffCheck.status === 0,
    diffCheck.status,
    'GIT_DIFF_CHECK',
    `git diff --check exit=${diffCheck.status} (stderr=${oneLine(diffCheck.stderr, 160) || 'empty'}); ` +
    `git status --porcelain --untracked-files=all entries=${statusLines.length}: ${statusLines.join(' | ')}`,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// No-connection assertion across every spawned run
// ─────────────────────────────────────────────────────────────────────────────

if (childRuns.length === 0) {
  skipCase(
    'CASE-G-NO-CONNECTION-ATTEMPTED-global',
    'no child run was possible in this environment, so there is no evidence base for this aggregate; ' +
    'reporting it PASS would be a false PASS',
  );
} else {
  const reachedExecution = childRuns.filter((r) => r.classification && EXECUTION_CLASSIFICATIONS.has(r.classification));
  const sawConnectionFailure = childRuns.filter((r) => /CONNECTION_FAILED|RUNTIME_DEPENDENCY_UNAVAILABLE/.test(r.stdout));
  report(
    'CASE-G-NO-CONNECTION-ATTEMPTED-global',
    reachedExecution.length === 0 && sawConnectionFailure.length === 0,
    'n/a',
    'NO_CONNECTION_ATTEMPTED',
    `spawned runs=${childRuns.length}; runs reporting an execution-stage classification=${reachedExecution.length}; ` +
    `runs mentioning CONNECTION_FAILED/RUNTIME_DEPENDENCY_UNAVAILABLE=${sawConnectionFailure.length}; ` +
    `credentials used by this harness: absent or the synthetic unroutable ${UNROUTABLE_URL.replace(/\/\/.*@/, '//<synthetic>@')} ` +
    '(host 127.0.0.1 port 1, no listener, never dialed because every case refuses beforehand)',
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Findings + total
// ─────────────────────────────────────────────────────────────────────────────

for (const f of findings) console.log(`FINDING-RECORD ${f.id}: ${oneLine(f.text, 800)}`);

const passed = caseCount - failures.length;
const skipped = skips.length;
const skipNote = `${skipped} SKIP_UNSPAWNABLE — child process unavailable in this environment`;

if (failures.length === 0) {
  console.log(skipped > 0
    ? `FOP_HELPER_VERIFY_TOTAL: ${passed}/${caseCount} PASS (${skipNote})`
    : `FOP_HELPER_VERIFY_TOTAL: ${passed}/${caseCount} PASS`);
  if (skipped > 0) console.log(`FOP_HELPER_VERIFY_SKIPPED_CASES: ${skips.map((s) => s.id).join(', ')}`);
  process.exitCode = 0;
} else {
  console.log(skipped > 0
    ? `FOP_HELPER_VERIFY_TOTAL: ${failures.length} FAILURE(S) (${skipNote})`
    : `FOP_HELPER_VERIFY_TOTAL: ${failures.length} FAILURE(S)`);
  console.log(`FOP_HELPER_VERIFY_FAILED_CASES: ${failures.join(', ')}`);
  if (skipped > 0) console.log(`FOP_HELPER_VERIFY_SKIPPED_CASES: ${skips.map((s) => s.id).join(', ')}`);
  process.exitCode = 1;
}

// ─────────────────────────────────────────────────────────────────────────────
// Scratch teardown (read-only mode) — verified, not assumed
// ─────────────────────────────────────────────────────────────────────────────

if (scratchCleanup) {
  scratchCleanup();
  console.log(`HARNESS_SCRATCH_REMOVED_ON_EXIT: ${!fs.existsSync(SCRATCH)} (path was ${SCRATCH})`);
} else {
  console.log(`HARNESS_SCRATCH_REMOVED_ON_EXIT: false (default mode keeps scratch for inspection at ${SCRATCH})`);
}
