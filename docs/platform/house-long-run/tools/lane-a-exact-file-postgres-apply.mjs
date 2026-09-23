#!/usr/bin/env node
/**
 * LANE_A_EXACT_FILE_POSTGRES_TRANSACTION_APPLY_V1
 * ============================================================================
 * Operator helper for applying ONE exact reviewed migration file to the WSTERA
 * Control database inside ONE PostgreSQL transaction.
 *
 *   dry-run:  BEGIN -> exact migration SQL -> in-transaction assertions -> deliberate ROLLBACK
 *   apply:    BEGIN -> preconditions -> exact migration SQL -> postconditions -> COMMIT
 *
 * It implements the reviewed mechanism-design decision recorded in
 * BRIEF-RESUME-LANE-A-FOP01-EXACT-FILE-APPLY-2026-09-23.md section 5, and the
 * transaction pattern proven by R15-D0-DRYRUN-PROBE.mjs (sentinel error thrown
 * inside sql.begin, so the rollback is structural and cannot accidentally commit).
 *
 * WHAT THIS HELPER DELIBERATELY DOES NOT DO
 *   - It never invokes `drizzle-kit generate`, `drizzle-kit migrate` or `npm run db:push`.
 *     The ONLY external program it may spawn is `git` (see spawnGit()).
 *   - It creates no migration journal and no migration ledger. There is no
 *     `drizzle/migrations/meta/_journal.json` and no `__drizzle_migrations` here.
 *     Sequencing is proven by live catalog preconditions (read inside the apply
 *     transaction) plus immutable release evidence for the exact file/revision/hash.
 *   - It never accepts a connection string, password or token on argv.
 *   - It never prints or persists the connection string. Only the sanitized target
 *     identity (project reference + resolved role name) is ever reported.
 *   - It never splits one migration file across transactions.
 *   - It never retries. One apply attempt per invocation.
 *
 * USAGE (all inputs mandatory unless marked optional)
 *   node docs/platform/house-long-run/tools/lane-a-exact-file-postgres-apply.mjs \
 *     --mode dry-run|apply \
 *     --migration-id 0009|0010 \
 *     --file <bound relative path for that migration id> \
 *     --expect-revision <exact 40-hex git commit in --control-repo> \
 *     --expect-sha256 <64-hex sha256 of the file bytes AT that revision> \
 *     --expect-target-ref <expected Supabase project reference> \
 *     --control-repo <path to the git worktree holding drizzle/migrations> \
 *     [--require-evidence <path to a release-evidence JSON>]   mandatory for --mode apply on 0010 \
 *     [--release-id <release id>]                              optional \
 *     [--evidence-out <path to write the evidence JSON>]        optional
 *
 * CANONICAL REVIEWED IDENTITIES (from the F-OP-01 brief section 6; not hardcoded here,
 * because --expect-sha256 is an operator-supplied input by contract -- these are the
 * values the operator is required to pass):
 *   0009  revision dfcb4be4ac8b488ef740e2147f83b5c19251fbd8
 *         file drizzle/migrations/0009_work_scope_identity.sql
 *         sha256 8f88a7d1e4d3777dd0c2adefa999f61799bd50dd1270407fa025f3c4068d3487
 *   0010  revision dd9a629eaa4e75c29fe0b8aa31698b5f9c4e1dae
 *         file drizzle/migrations/0010_retire_legacy_work_event_rpc.sql
 *         sha256 3963c6a6e6423f006889d87c735e86ef30831680964c19b096f23f2b091a7b30
 *
 * REFUSAL ORDER (LOAD-BEARING). Every refusal below happens BEFORE the connection
 * string is read from the environment and BEFORE any connection is attempted:
 *   1. --migration-id is exactly 0009/0010 AND --file is that id's bound path   -> MIGRATION_IDENTITY_UNKNOWN
 *   2. file bytes extracted FROM --expect-revision hash to --expect-sha256      -> FILE_HASH_MISMATCH
 *   3. --expect-revision is an exact commit present in --control-repo           -> REVISION_NOT_FOUND
 *   4. apply of 0010 requires --require-evidence recording a successful 0009    -> SEQUENCING_EVIDENCE_MISSING
 *   5. LANE_A_LIVE_DB_AUTHORIZED=YES must be present                            -> AUTHORITY_GUARD_REFUSAL
 *   6. --mode apply additionally requires LANE_A_PRODUCTION_APPLY_AUTHORIZED=YES -> AUTHORITY_GUARD_REFUSAL
 * Target proof (TARGET_IDENTITY_MISMATCH / TARGET_IDENTITY_UNDETERMINABLE) runs
 * after 5/6 and is also pre-connection: it is derived by PARSING the credential,
 * never by dialing out.
 *
 * AUTHORITY: the two environment guards are safety interlocks only. They create no
 * authority and must not be set before the Owner production release authorization.
 * This helper performs no apply on its own say-so.
 *
 * NON-CLAIMS: a dry-run PASS does not authorize apply. An apply PASS is not
 * PRODUCTION_READY and not OPERATED_STABLE. See the runbook's rollback/recovery
 * contract and the F-OP-01 non-claims.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

export const MECHANISM_ID = 'LANE_A_EXACT_FILE_POSTGRES_TRANSACTION_APPLY_V1';
export const TASK_ID = 'WSTERA-CONTROL-TRUTH-SYNC-001';

/** The only external program this helper is allowed to spawn. */
const GIT_BIN = 'git';

/** Environment variable names. Never logged with a value. */
export const ENV_AUTHORITY = {
  LIVE_DB: 'LANE_A_LIVE_DB_AUTHORIZED',
  PRODUCTION_APPLY: 'LANE_A_PRODUCTION_APPLY_AUTHORIZED',
  CREDENTIAL: 'LANE_A_CONTROL_DATABASE_URL',
};

/**
 * The complete, closed migration identity set. A pair outside this table is refused.
 * `boundFile` is the only acceptable value for `--file` for that id.
 */
export const MIGRATIONS = Object.freeze({
  '0009': Object.freeze({
    id: '0009',
    boundFile: 'drizzle/migrations/0009_work_scope_identity.sql',
    label: 'EXPAND',
    applyOrder: 1,
    requiresSequencingEvidenceOnApply: false,
  }),
  '0010': Object.freeze({
    id: '0010',
    boundFile: 'drizzle/migrations/0010_retire_legacy_work_event_rpc.sql',
    label: 'CONTRACT',
    applyOrder: 2,
    requiresSequencingEvidenceOnApply: true,
  }),
});

/**
 * Machine-readable refusal / outcome classifications.
 * `exitCode` is the process exit code emitted for that classification.
 */
export const CLASSIFICATION = Object.freeze({
  // ── ordered pre-connection refusals ────────────────────────────────────────
  ARGUMENT_INVALID: { exitCode: 2, kind: 'refusal' },
  MIGRATION_IDENTITY_UNKNOWN: { exitCode: 2, kind: 'refusal' },
  FILE_HASH_MISMATCH: { exitCode: 2, kind: 'refusal' },
  REVISION_NOT_FOUND: { exitCode: 2, kind: 'refusal' },
  SEQUENCING_EVIDENCE_MISSING: { exitCode: 2, kind: 'refusal' },
  AUTHORITY_GUARD_REFUSAL: { exitCode: 2, kind: 'refusal' },
  // ── target proof, still pre-connection ─────────────────────────────────────
  TARGET_IDENTITY_MISMATCH: { exitCode: 3, kind: 'refusal' },
  TARGET_IDENTITY_UNDETERMINABLE: { exitCode: 3, kind: 'refusal' },
  // ── execution ─────────────────────────────────────────────────────────────
  RUNTIME_DEPENDENCY_UNAVAILABLE: { exitCode: 4, kind: 'failure' },
  CONNECTION_FAILED: { exitCode: 4, kind: 'failure' },
  DRY_RUN_PASS: { exitCode: 0, kind: 'pass' },
  DRY_RUN_FAILED: { exitCode: 4, kind: 'failure' },
  APPLY_PASS: { exitCode: 0, kind: 'pass' },
  APPLY_FAILED: { exitCode: 4, kind: 'failure' },
  INTERNAL_ERROR: { exitCode: 5, kind: 'failure' },
});

export const ROLLBACK_SENTINEL = '__LANE_A_DELIBERATE_ROLLBACK__';

/**
 * The ONLY error treated as a successful dry-run abort. A bare string comparison is
 * used in addition to the class check so the sentinel is unambiguous and a real
 * database error can never be mistaken for the deliberate rollback.
 */
export class DeliberateRollbackError extends Error {
  constructor() {
    super(ROLLBACK_SENTINEL);
    this.name = 'DeliberateRollbackError';
    this.isLaneADeliberateRollback = true;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Secret hygiene — nothing user-visible or persisted bypasses these
// ─────────────────────────────────────────────────────────────────────────────

const REDACTED = 'postgres://<redacted>';

/**
 * Builds a one-way sanitizer for the live credential. It knows the exact secret
 * string in memory so it can redact it (and its userinfo part) even if a driver or
 * a git error echoes a fragment of it. The sanitizer never emits the secret.
 */
function makeSanitizer(rawUrl) {
  const secrets = [];
  if (typeof rawUrl === 'string' && rawUrl.length > 0) {
    secrets.push(rawUrl);
    const schemeSplit = rawUrl.split('://');
    if (schemeSplit.length === 2) {
      const authority = schemeSplit[1].split('@')[0];
      // authority holds user[:password]; redact the password part explicitly.
      const userinfoPassword = authority.includes(':') ? authority.split(':').slice(1).join(':') : '';
      if (userinfoPassword.length > 0) secrets.push(userinfoPassword);
    }
    const urlMatch = rawUrl.match(/^[a-z][a-z0-9+.-]*:\/\/([^@/]+)@/i);
    if (urlMatch) secrets.push(urlMatch[1]);
  }
  return function sanitize(input) {
    let s = typeof input === 'string' ? input : String(input ?? '');
    for (const secret of secrets) {
      if (!secret) continue;
      s = s.split(secret).join('<redacted>');
    }
    s = s.replace(/[a-z][a-z0-9+.-]*:\/\/[^\s'"]+/gi, REDACTED);
    return s;
  };
}

const identitySanitizer = makeSanitizer(null);

// ─────────────────────────────────────────────────────────────────────────────
// Output
// ─────────────────────────────────────────────────────────────────────────────

const sink = { sanitize: identitySanitizer, lines: [] };

function out(line) {
  const s = sink.sanitize(line);
  sink.lines.push(s);
  process.stdout.write(s + '\n');
}

function err(line) {
  const s = sink.sanitize(line);
  sink.lines.push(s);
  process.stderr.write(s + '\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// argv parsing — strict, closed set. No credential may ever arrive on argv.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Flag names that would carry a credential. Their presence on argv is refused
 * outright rather than ignored, because "no credential value may appear in argv".
 */
const FORBIDDEN_ARG_FLAGS = new Set([
  'url', 'database-url', 'database_url', 'db-url', 'db_url', 'dsn', 'connection-string',
  'password', 'pass', 'pgpassword', 'token', 'access-token', 'service-role-key',
  'apikey', 'api-key', 'secret', 'key',
]);

const VALUE_FLAGS = new Set([
  'mode', 'migration-id', 'file', 'expect-revision', 'expect-sha256',
  'expect-target-ref', 'control-repo', 'require-evidence', 'release-id', 'evidence-out',
]);

const REQUIRED_FLAGS = Object.freeze([
  'mode', 'migration-id', 'file', 'expect-revision', 'expect-sha256',
  'expect-target-ref', 'control-repo',
]);

export function parseArgs(argv) {
  const args = Object.create(null);
  const unknown = [];
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (typeof token !== 'string' || !token.startsWith('--')) {
      unknown.push(token);
      continue;
    }
    const body = token.slice(2);
    let name;
    let value;
    if (body.includes('=')) {
      const eq = body.indexOf('=');
      name = body.slice(0, eq);
      value = body.slice(eq + 1);
    } else {
      name = body;
      const next = argv[i + 1];
      if (typeof next !== 'string' || next.startsWith('--')) {
        return { ok: false, reason: `flag --${name} requires a value`, flag: name };
      }
      value = next;
      i += 1;
    }
    if (FORBIDDEN_ARG_FLAGS.has(name)) {
      return {
        ok: false,
        reason: `flag --${name} is forbidden: no credential value may appear in argv; the connection string is read only from ${ENV_AUTHORITY.CREDENTIAL}`,
        flag: name,
        credential_in_argv: true,
      };
    }
    if (!VALUE_FLAGS.has(name)) {
      return { ok: false, reason: `unknown flag --${name}`, flag: name };
    }
    if (Object.prototype.hasOwnProperty.call(args, name)) {
      return { ok: false, reason: `flag --${name} given more than once`, flag: name };
    }
    args[name] = value;
  }
  if (unknown.length > 0) {
    return { ok: false, reason: `unexpected positional argument(s): ${unknown.join(', ')}` };
  }
  const missing = REQUIRED_FLAGS.filter((f) => typeof args[f] !== 'string' || args[f].length === 0);
  if (missing.length > 0) {
    return { ok: false, reason: `missing required flag(s): ${missing.map((f) => '--' + f).join(', ')}` };
  }
  return { ok: true, args };
}

// ─────────────────────────────────────────────────────────────────────────────
// git access — the ONLY external program, and only ever invoked as `git -C <repo> ...`
// ─────────────────────────────────────────────────────────────────────────────

function spawnGit(controlRepo, gitArgs) {
  return spawnSync(GIT_BIN, ['-C', controlRepo, ...gitArgs], {
    encoding: 'buffer',
    maxBuffer: 64 * 1024 * 1024,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

/** True when <rev> resolves to a commit object in the control repo. */
export function revisionExists(controlRepo, rev) {
  const res = spawnGit(controlRepo, ['cat-file', '-e', `${rev}^{commit}`]);
  return res.status === 0;
}

/**
 * Raw bytes of <file> at <rev>, or null when git cannot produce them.
 * `encoding: 'buffer'` is deliberate: the sha256 must be over the exact stored
 * bytes, never over a newline-translated text read.
 */
export function bytesAtRevision(controlRepo, rev, file) {
  const res = spawnGit(controlRepo, ['cat-file', '-p', `${rev}:${file}`]);
  if (res.status !== 0 || !res.stdout) return null;
  return res.stdout;
}

export function sha256Hex(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

// ─────────────────────────────────────────────────────────────────────────────
// TARGET PROOF — derive the project identity by PARSING the credential only
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Derives the Supabase project reference from a connection string without any
 * network access and without ever emitting the string.
 *
 * Accepted forms:
 *   pooler form : userinfo `postgres.<ref>`      -> ref is the token after the LAST `.`
 *   host form   : host `<ref>.supabase.co`       -> ref is the label before `.supabase.co`
 *                 (also accepts `db.<ref>.supabase.co`)
 *
 * Returns { ok: true, ref, role, form } or { ok: false, reason }.
 */
export function deriveTargetIdentity(rawUrl) {
  if (typeof rawUrl !== 'string' || rawUrl.trim().length === 0) {
    return { ok: false, reason: 'credential_absent' };
  }
  let parsed;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { ok: false, reason: 'unparseable_connection_string' };
  }
  if (!/^postgres(ql)?:$/i.test(parsed.protocol)) {
    return { ok: false, reason: `unexpected_scheme:${parsed.protocol.replace(':', '')}` };
  }
  let user = parsed.username || '';
  try {
    user = decodeURIComponent(user);
  } catch {
    return { ok: false, reason: 'undecodable_userinfo' };
  }
  const host = (parsed.hostname || '').toLowerCase();

  // host form <ref>.supabase.co (or db.<ref>.supabase.co)
  let hostForm = null;
  if (host.endsWith('.supabase.co')) {
    const labels = host.split('.');
    const ref = labels.length >= 3 ? labels[labels.length - 3] : '';
    if (ref.length > 0) hostForm = { ref, role: user || null, form: 'host' };
  }

  // pooler form postgres.<ref>
  let poolerForm = null;
  if (user.includes('.')) {
    const lastDot = user.lastIndexOf('.');
    const ref = user.slice(lastDot + 1);
    const role = user.slice(0, lastDot);
    if (ref.length > 0) poolerForm = { ref, role: role.length > 0 ? role : null, form: 'pooler' };
  }

  if (hostForm && poolerForm) {
    if (hostForm.ref !== poolerForm.ref) {
      return { ok: false, reason: 'ambiguous_identity_host_and_userinfo_disagree' };
    }
    return { ok: true, ...poolerForm, role: poolerForm.role ?? hostForm.role };
  }
  if (poolerForm) return { ok: true, ...poolerForm };
  if (hostForm) return { ok: true, ...hostForm };
  return { ok: false, reason: 'no_project_reference_in_userinfo_or_host' };
}

// ─────────────────────────────────────────────────────────────────────────────
// Catalog reads (used with either a transaction handle or the sql handle)
// ─────────────────────────────────────────────────────────────────────────────

const FN_NAME = 'ingest_agent_work_event_atomic';

async function countPronargs(q, pronargs) {
  const rows = await q`
    SELECT count(*)::int AS n
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.proname = ${FN_NAME}
       AND p.pronargs = ${pronargs}`;
  return rows[0] ? rows[0].n : null;
}

async function serviceRoleCanExecute(q, pronargs) {
  const rows = await q`
    SELECT (CASE
              WHEN EXISTS (SELECT 1 FROM pg_roles r WHERE r.rolname = 'service_role')
              THEN has_function_privilege('service_role', p.oid, 'EXECUTE')
              ELSE false
            END) AS can_execute,
           count(*)::int AS matched
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.proname = ${FN_NAME}
       AND p.pronargs = ${pronargs}`;
  return { matched: rows[0] ? rows[0].matched : null, canExecute: rows[0] ? rows[0].can_execute : null };
}

/**
 * PUBLIC reachability of the 19-argument function, read from the EFFECTIVE ACL.
 * `proacl IS NULL` means PostgreSQL's default function ACL applies, and that default
 * confers EXECUTE on PUBLIC (grantee oid 0) -- so a NULL proacl counts as reachable.
 */
async function publicDeniedCount(q, pronargs) {
  const rows = await q`
    SELECT count(*)::int AS n
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.proname = ${FN_NAME}
       AND p.pronargs = ${pronargs}
       AND p.proacl IS NOT NULL
       AND NOT EXISTS (
             SELECT 1 FROM aclexplode(p.proacl) a
              WHERE a.grantee = 0 AND a.privilege_type = 'EXECUTE'
           )`;
  return rows[0] ? rows[0].n : null;
}

async function scopeColumns(q) {
  const rows = await q`
    SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'work_queue_items'
       AND column_name IN ('scope_type', 'scope_key')
     ORDER BY column_name`;
  const out = {};
  for (const r of rows) {
    out[r.column_name] = {
      data_type: r.data_type,
      character_maximum_length: r.character_maximum_length === null ? null : Number(r.character_maximum_length),
    };
  }
  return out;
}

async function scopeConstraint(q) {
  const rows = await q`
    SELECT c.conname, c.convalidated
      FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      JOIN pg_namespace ns ON ns.oid = t.relnamespace
     WHERE ns.nspname = 'public'
       AND t.relname = 'work_queue_items'
       AND c.conname = 'work_queue_items_scope_consistency'`;
  if (rows.length === 0) return { present: false, validated: false, count: 0 };
  return { present: true, validated: rows[0].convalidated === true, count: rows.length };
}

/**
 * The persistent-shape measurement. Identical query set is used before and after a
 * dry-run so "the persistent shape after rollback equals the measured pre-run shape"
 * is a real comparison, not an assertion.
 */
export async function measureShape(q, migrationId) {
  const shape = {
    fn_17_count: await countPronargs(q, 17),
    fn_19_count: await countPronargs(q, 19),
  };
  const svc19 = await serviceRoleCanExecute(q, 19);
  shape.service_role_can_execute_19 = svc19.canExecute;
  shape.public_denied_19_count = await publicDeniedCount(q, 19);
  if (migrationId === '0009') {
    shape.scope_columns = await scopeColumns(q);
    shape.scope_constraint = await scopeConstraint(q);
  }
  return shape;
}

function checkValue(name, observed, predicate, expectedText) {
  return { check: name, expected: expectedText, observed, ok: predicate === true };
}

/**
 * Preconditions actually required by the reviewed files.
 *   0009 (EXPAND): the legacy 17-argument RPC exists exactly once in the pre-apply shape.
 *   0010 (CONTRACT): 0009 is already applied in the shape 0009 asserts itself --
 *      exactly one 19-argument function, the 17-argument overload still present exactly
 *      once, service_role able to execute the 19-argument path, PUBLIC unable to.
 *      (0010 re-asserts these itself in its own section 1; this helper measures the same
 *      facts from outside so the operator sees them before the file runs.)
 */
export async function measurePreconditions(q, migrationId) {
  const checks = [];
  if (migrationId === '0009') {
    const c17 = await countPronargs(q, 17);
    checks.push(checkValue('pre:0009:fn17_present_exactly_once', c17, c17 === 1, 'count of public.' + FN_NAME + ' with pronargs = 17 === 1'));
    return checks;
  }
  const c19 = await countPronargs(q, 19);
  checks.push(checkValue('pre:0010:fn19_present_exactly_once', c19, c19 === 1, 'count of public.' + FN_NAME + ' with pronargs = 19 === 1'));
  const c17 = await countPronargs(q, 17);
  checks.push(checkValue('pre:0010:fn17_present_exactly_once', c17, c17 === 1, 'count of public.' + FN_NAME + ' with pronargs = 17 === 1'));
  const svc = await serviceRoleCanExecute(q, 19);
  checks.push(checkValue('pre:0010:service_role_can_execute_19', svc.canExecute, svc.matched === 1 && svc.canExecute === true, 'service_role can execute the 19-argument function'));
  const pd = await publicDeniedCount(q, 19);
  checks.push(checkValue('pre:0010:public_cannot_execute_19', pd, pd === 1, 'effective ACL of the 19-argument function denies PUBLIC exactly once'));
  return checks;
}

/**
 * Postconditions actually asserted by the reviewed files.
 *   0009: exactly one 19-argument function AND the 17-argument overload still exists AND
 *         service_role can execute the 19-argument one AND PUBLIC cannot AND
 *         work_queue_items has scope_type/scope_key AND the scope-consistency constraint
 *         exists and is validated.
 *   0010: exactly one 19-argument function remains AND zero 17-argument ones remain.
 */
export async function measurePostconditions(q, migrationId) {
  const checks = [];
  if (migrationId === '0009') {
    const c19 = await countPronargs(q, 19);
    checks.push(checkValue('post:0009:fn19_present_exactly_once', c19, c19 === 1, 'count of public.' + FN_NAME + ' with pronargs = 19 === 1'));
    const c17 = await countPronargs(q, 17);
    checks.push(checkValue('post:0009:fn17_still_present_exactly_once', c17, c17 === 1, 'count of public.' + FN_NAME + ' with pronargs = 17 === 1 (EXPAND retains the legacy overload)'));
    const svc = await serviceRoleCanExecute(q, 19);
    checks.push(checkValue('post:0009:service_role_can_execute_19', svc.canExecute, svc.matched === 1 && svc.canExecute === true, 'service_role can execute the 19-argument function'));
    const pd = await publicDeniedCount(q, 19);
    checks.push(checkValue('post:0009:public_cannot_execute_19', pd, pd === 1, 'effective ACL of the 19-argument function denies PUBLIC exactly once'));
    const cols = await scopeColumns(q);
    const st = cols.scope_type;
    checks.push(checkValue('post:0009:scope_type_is_varchar_30', st ? `${st.data_type}(${st.character_maximum_length})` : 'absent', !!st && st.data_type === 'character varying' && st.character_maximum_length === 30, 'work_queue_items.scope_type character varying(30)'));
    const sk = cols.scope_key;
    checks.push(checkValue('post:0009:scope_key_is_varchar_200', sk ? `${sk.data_type}(${sk.character_maximum_length})` : 'absent', !!sk && sk.data_type === 'character varying' && sk.character_maximum_length === 200, 'work_queue_items.scope_key character varying(200)'));
    const con = await scopeConstraint(q);
    checks.push(checkValue('post:0009:scope_consistency_constraint_validated', con, con.present === true && con.validated === true, 'work_queue_items_scope_consistency exists AND convalidated = true'));
    return checks;
  }
  const c19 = await countPronargs(q, 19);
  checks.push(checkValue('post:0010:fn19_present_exactly_once', c19, c19 === 1, 'count of public.' + FN_NAME + ' with pronargs = 19 === 1'));
  const c17 = await countPronargs(q, 17);
  checks.push(checkValue('post:0010:fn17_removed', c17, c17 === 0, 'count of public.' + FN_NAME + ' with pronargs = 17 === 0'));
  return checks;
}

// ─────────────────────────────────────────────────────────────────────────────
// Ordered governed preflight — checks 1..6, all before any credential read
// ─────────────────────────────────────────────────────────────────────────────

const HEX40 = /^[0-9a-fA-F]{40}$/;
const HEX64 = /^[0-9a-fA-F]{64}$/;

/**
 * Reads the sequencing-evidence JSON and answers exactly one question: does it record
 * a SUCCESSFUL APPLY of 0009 for this same target reference?
 *
 * The helper's own evidence shape is the primary accepted shape. A record list under
 * `records` is also accepted, so a release packet that aggregates per-window records
 * works. Nothing else is accepted -- fail closed.
 */
export function readSequencingEvidence(evidencePath, expectedRef) {
  let raw;
  try {
    raw = fs.readFileSync(evidencePath, 'utf8');
  } catch (e) {
    return { ok: false, reason: `evidence_unreadable:${e.code || e.name}` };
  }
  let doc;
  try {
    doc = JSON.parse(raw);
  } catch {
    return { ok: false, reason: 'evidence_not_json' };
  }
  const records = Array.isArray(doc) ? doc : (Array.isArray(doc.records) ? doc.records : [doc]);
  let saw0009Apply = false;
  let sawTargetMismatch = false;
  for (const rec of records) {
    if (!rec || typeof rec !== 'object') continue;
    const migId = String(rec.migration_id ?? rec.migrationId ?? '');
    const mode = String(rec.mode ?? '');
    const classification = String(rec.final_classification ?? rec.classification ?? '');
    const commit = String((rec.commit && rec.commit.result) ?? rec.commit_result ?? '');
    const ref = String((rec.target_identity && rec.target_identity.ref) ?? (rec.target && rec.target.ref) ?? '');
    if (migId !== '0009' || mode !== 'apply') continue;
    saw0009Apply = true;
    const succeeded = classification === 'APPLY_PASS' && (commit === '' || /commit/i.test(commit));
    if (!succeeded) continue;
    if (ref === expectedRef) {
      return {
        ok: true,
        reason: 'successful_0009_apply_recorded_for_target',
        evidence_sha256: sha256Hex(Buffer.from(raw, 'utf8')),
        record: { migration_id: migId, mode, final_classification: classification, commit_result: commit || null, target_ref: ref },
      };
    }
    sawTargetMismatch = true;
  }
  if (sawTargetMismatch) return { ok: false, reason: 'evidence_0009_apply_recorded_for_a_different_target' };
  if (saw0009Apply) return { ok: false, reason: 'evidence_0009_apply_not_recorded_as_successful' };
  return { ok: false, reason: 'evidence_has_no_0009_apply_record' };
}

/**
 * The ordered refusal ladder (checks 1..6). It NEVER reads the credential variable and
 * NEVER opens a connection. It returns either { ok: true, ... } or
 * { ok: false, classification, reason, stage }.
 */
export function evaluateGovernedPreflight(args, env, deps = {}) {
  const revisionExistsFn = deps.revisionExists ?? revisionExists;
  const bytesAtRevisionFn = deps.bytesAtRevision ?? bytesAtRevision;
  const readSequencingEvidenceFn = deps.readSequencingEvidence ?? readSequencingEvidence;
  const statIsDirectory = deps.statIsDirectory ?? ((p) => {
    try { return fs.statSync(p).isDirectory(); } catch { return false; }
  });

  // Carries the hash of the bytes actually read from the declared revision, so it can be
  // reported for EVERY refusal that happens after the bytes were extracted -- not only for the
  // hash-mismatch case. It remains null for refusals that precede extraction.
  const extract = { observed_sha256: null };

  const fail = (classification, stage, reason, extra = {}) => ({
    ok: false, classification, stage, reason, observed_sha256: extract.observed_sha256, ...extra,
  });

  // ── structural argument validation (not one of the six ordered DB checks) ──
  if (args.mode !== 'dry-run' && args.mode !== 'apply') {
    return fail('ARGUMENT_INVALID', 'argument', `--mode must be exactly 'dry-run' or 'apply' (got '${args.mode}')`);
  }
  if (!statIsDirectory(args['control-repo'])) {
    return fail('ARGUMENT_INVALID', 'argument', '--control-repo is not an existing directory');
  }
  if (!HEX64.test(args['expect-sha256'])) {
    return fail('ARGUMENT_INVALID', 'argument', '--expect-sha256 is not exact 64-hex');
  }
  if (args.file.includes('\\') || path.isAbsolute(args.file)) {
    return fail('ARGUMENT_INVALID', 'argument', '--file must be the repo-relative path using forward slashes');
  }

  // ── Check 1: migration id / file pair is a member of the closed set ────────
  const migration = MIGRATIONS[args['migration-id']];
  if (!migration) {
    return fail('MIGRATION_IDENTITY_UNKNOWN', 'check_1_migration_identity',
      `--migration-id '${args['migration-id']}' is not one of ${Object.keys(MIGRATIONS).join(' / ')}`);
  }
  if (args.file !== migration.boundFile) {
    return fail('MIGRATION_IDENTITY_UNKNOWN', 'check_1_migration_identity',
      `--file does not equal the path bound to migration ${migration.id}`);
  }

  // ── Check 2: the bytes FROM the declared revision hash to --expect-sha256 ──
  // Byte extraction from an unresolvable revision is impossible by construction, so a
  // revision that is not an exact 40-hex commit present in the control repo is
  // classified REVISION_NOT_FOUND (check 3's classification) rather than being
  // misreported as a hash mismatch. The hash comparison itself is over the bytes
  // actually read out of the revision, never the working-tree file.
  const expectRevision = args['expect-revision'];
  let revisionCheck = { exact40Hex: HEX40.test(expectRevision), existsAsCommit: false };
  if (revisionCheck.exact40Hex) {
    revisionCheck.existsAsCommit = revisionExistsFn(args['control-repo'], expectRevision) === true;
  }
  if (!revisionCheck.exact40Hex || !revisionCheck.existsAsCommit) {
    return fail('REVISION_NOT_FOUND', 'check_2_extract_bytes_from_revision',
      revisionCheck.exact40Hex
        ? '--expect-revision is not an existing commit in --control-repo'
        : '--expect-revision is not an exact 40-hex git commit id',
      { revision_check: revisionCheck });
  }
  const bytes = bytesAtRevisionFn(args['control-repo'], expectRevision, args.file);
  if (bytes === null || bytes === undefined) {
    return fail('FILE_HASH_MISMATCH', 'check_2_extract_bytes_from_revision',
      'the declared file could not be extracted from the declared revision (path absent at that revision)',
      { revision_check: revisionCheck });
  }
  const fileBytes = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
  const observedSha256 = sha256Hex(fileBytes);
  extract.observed_sha256 = observedSha256;
  if (observedSha256 !== args['expect-sha256'].toLowerCase()) {
    return fail('FILE_HASH_MISMATCH', 'check_2_extract_bytes_from_revision',
      'sha256 of the file bytes AT the declared revision does not equal --expect-sha256',
      { expected_sha256: args['expect-sha256'].toLowerCase(), revision_check: revisionCheck });
  }

  // ── Check 3: re-affirm the revision as an exact commit object ─────────────
  if (!revisionExistsFn(args['control-repo'], expectRevision)) {
    return fail('REVISION_NOT_FOUND', 'check_3_revision_exists',
      '--expect-revision does not resolve to a commit object in --control-repo');
  }

  // ── Check 4: sequencing evidence, mandatory for apply of 0010 ─────────────
  let sequencing = { required: false, provided: false, ok: null, reason: 'not_required_for_this_pair' };
  const evidenceRequired = args.mode === 'apply' && migration.requiresSequencingEvidenceOnApply === true;
  if (evidenceRequired) {
    sequencing.required = true;
    if (typeof args['require-evidence'] !== 'string' || args['require-evidence'].length === 0) {
      return fail('SEQUENCING_EVIDENCE_MISSING', 'check_4_sequencing_evidence',
        '--require-evidence is mandatory for --mode apply on 0010 and was not supplied',
        { sequencing });
    }
    sequencing.provided = true;
    const evidence = readSequencingEvidenceFn(args['require-evidence'], args['expect-target-ref']);
    sequencing.ok = evidence.ok === true;
    sequencing.reason = evidence.reason;
    sequencing.evidence_sha256 = evidence.evidence_sha256 ?? null;
    if (!evidence.ok) {
      return fail('SEQUENCING_EVIDENCE_MISSING', 'check_4_sequencing_evidence',
        `release evidence does not record a successful 0009 apply for target ${args['expect-target-ref']} (${evidence.reason})`,
        { sequencing });
    }
    sequencing.record = evidence.record ?? null;
  } else if (typeof args['require-evidence'] === 'string' && args['require-evidence'].length > 0) {
    sequencing.provided = true;
    const evidence = readSequencingEvidenceFn(args['require-evidence'], args['expect-target-ref']);
    sequencing.ok = evidence.ok === true;
    sequencing.reason = evidence.ok ? evidence.reason : `informational_only:${evidence.reason}`;
    sequencing.evidence_sha256 = evidence.evidence_sha256 ?? null;
  }

  // ── Check 5 / 6: authority guards. No credential read, no connection. ─────
  // `sequencing` is always carried outward, so evidence written for a guard refusal still
  // records whether the sequencing requirement was evaluated and satisfied.
  const liveGuard = env[ENV_AUTHORITY.LIVE_DB];
  if (liveGuard !== 'YES') {
    return fail('AUTHORITY_GUARD_REFUSAL', 'check_5_live_db_authority',
      `${ENV_AUTHORITY.LIVE_DB} must be exactly 'YES'; no credential was read and no connection was attempted`,
      { guards: { live_db_authorized: false }, sequencing });
  }
  if (args.mode === 'apply') {
    const applyGuard = env[ENV_AUTHORITY.PRODUCTION_APPLY];
    if (applyGuard !== 'YES') {
      return fail('AUTHORITY_GUARD_REFUSAL', 'check_6_production_apply_authority',
        `${ENV_AUTHORITY.PRODUCTION_APPLY} must be exactly 'YES' for --mode apply; no credential was read and no connection was attempted`,
        { guards: { live_db_authorized: true, production_apply_authorized: false }, sequencing });
    }
  }

  return {
    ok: true,
    migration,
    revisionCheck,
    observedSha256,
    migrationText: fileBytes.toString('utf8'),
    sequencing,
    guards: {
      live_db_authorized: true,
      production_apply_authorized: args.mode === 'apply',
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Transaction engine
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Runs ONE migration file inside ONE transaction.
 *
 * dry-run: the callback ALWAYS ends by throwing DeliberateRollbackError, so the
 *          transaction can only roll back. There is no code path in dry-run that
 *          reaches a commit.
 * apply:   preconditions -> the exact file -> postconditions. Any failing step throws,
 *          which rolls the whole transaction back; a commit happens only when every
 *          postcondition is true.
 *
 * `deps` exists so the transaction skeleton can be exercised offline against a stub
 * handle, with no database anywhere in the picture.
 */
export async function runManagedTransaction({
  mode,
  sql,
  migration,
  migrationText,
  deps = {},
}) {
  const measureShapeFn = deps.measureShape ?? measureShape;
  const measurePreFn = deps.measurePreconditions ?? measurePreconditions;
  const measurePostFn = deps.measurePostconditions ?? measurePostconditions;
  const Sentinel = deps.DeliberateRollbackError ?? DeliberateRollbackError;

  const result = {
    mode,
    statement_count: 0,
    transaction_entered: false,
    rollback_result: 'NOT_RUN',
    commit_result: 'NOT_RUN',
    rollback_deliberate: false,
    preconditions: [],
    postconditions: [],
    sql_error: null,
    failure_stage: null,
    failure_reason: null,
    pre_run_shape: null,
    post_rollback_shape: null,
    shape_preserved: null,
  };

  // Persistent shape before anything runs. For dry-run this is BOTH the informational
  // precondition record and the baseline the post-rollback shape must equal.
  try {
    result.pre_run_shape = await measureShapeFn(sql, migration.id);
  } catch (e) {
    result.failure_stage = 'pre_run_shape';
    result.failure_reason = `pre_run_shape_unreadable:${e.code || e.name}`;
    return { ok: false, classification: 'CONNECTION_FAILED', result };
  }

  try {
    await sql.begin(async (tx) => {
      result.transaction_entered = true;

      // apply: preconditions first, inside the transaction, before the migration SQL.
      if (mode === 'apply') {
        result.preconditions = await measurePreFn(tx, migration.id);
        const failedPre = result.preconditions.filter((c) => c.ok !== true);
        if (failedPre.length > 0) {
          result.failure_stage = 'precondition';
          result.failure_reason = `precondition_failed:${failedPre.map((c) => c.check).join(',')}`;
          throw new Error(result.failure_reason);
        }
        result.preconditions.push({
          check: 'pre:apply:baseline_measured_before_transaction',
          expected: 'recorded', observed: 'recorded', ok: true, informational: true,
        });
      } else {
        result.preconditions = [{ check: 'dry-run:no_preconditions_in_transaction', expected: 'informational', observed: 'informational', ok: true, informational: true }];
      }

      // The exact reviewed file, ONE unsafe() call, ONE transaction. Never split.
      result.statement_count += 1;
      try {
        await tx.unsafe(migrationText);
      } catch (e) {
        result.failure_stage = 'sql_execution';
        result.failure_reason = 'migration_sql_rejected';
        result.sql_error = { sqlstate: e.code || null, message: sink.sanitize(e.message || '') };
        throw e;
      }

      // Post-migration assertions, INSIDE this same transaction.
      result.postconditions = await measurePostFn(tx, migration.id);
      const failedPost = result.postconditions.filter((c) => c.ok !== true);
      if (failedPost.length > 0) {
        result.failure_stage = 'postcondition';
        result.failure_reason = `postcondition_failed:${failedPost.map((c) => c.check).join(',')}`;
        throw new Error(result.failure_reason);
      }

      if (mode === 'dry-run') {
        // Structural, unconditional rollback. Nothing below this line can commit.
        throw new Sentinel();
      }
      // apply: falling out of the callback reaches postgres.js's COMMIT.
    });
    result.rollback_result = mode === 'dry-run' ? 'ROLLED_BACK' : 'NOT_RUN';
    result.commit_result = mode === 'apply' ? 'COMMITTED' : 'NOT_COMMITTED';
  } catch (e) {
    // The deliberate rollback is recognised ONLY by the sentinel object's class identity.
    // There is deliberately no message-text or duck-typed-flag fallback: a message string can
    // be produced by the migration SQL itself (a plpgsql RAISE), so matching on text would let
    // the file being applied masquerade as the intentional abort and turn a real failure into a
    // reported dry-run PASS. `instanceof Sentinel` cannot be reached from the database.
    const deliberate = typeof Sentinel === 'function' && e instanceof Sentinel;
    if (deliberate) {
      result.rollback_result = 'ROLLED_BACK';
      result.rollback_deliberate = true;
      result.commit_result = 'NOT_COMMITTED';
    } else {
      result.rollback_result = 'ROLLED_BACK';
      result.commit_result = 'NOT_COMMITTED';
      if (!result.failure_stage) {
        result.failure_stage = 'transaction';
        result.failure_reason = `transaction_error:${e?.code || e?.name || 'unknown'}`;
      }
      if (!result.sql_error) result.sql_error = { sqlstate: e?.code || null, message: sink.sanitize(e?.message || '') };
    }
  }

  if (mode === 'dry-run') {
    // Re-measure the persistent shape after the rollback and require it to equal the
    // measured pre-run shape. A non-equal shape means something persisted.
    try {
      result.post_rollback_shape = await measureShapeFn(sql, migration.id);
      result.shape_preserved = JSON.stringify(result.pre_run_shape) === JSON.stringify(result.post_rollback_shape);
    } catch (e) {
      result.shape_preserved = false;
      result.failure_stage = result.failure_stage ?? 'post_rollback_shape';
      result.failure_reason = result.failure_reason ?? `post_rollback_shape_unreadable:${e.code || e.name}`;
    }
    const allPostTrue = result.postconditions.length > 0 && result.postconditions.every((c) => c.ok === true);
    const ok = result.rollback_deliberate === true && allPostTrue && result.shape_preserved === true && result.failure_stage === null;
    return { ok, classification: ok ? 'DRY_RUN_PASS' : 'DRY_RUN_FAILED', result };
  }

  const ok = result.commit_result === 'COMMITTED' && result.failure_stage === null;
  return { ok, classification: ok ? 'APPLY_PASS' : 'APPLY_FAILED', result };
}

// ─────────────────────────────────────────────────────────────────────────────
// Driver loading, evidence, main
// ─────────────────────────────────────────────────────────────────────────────

function loadPostgresDriver(controlRepo) {
  const req = createRequire(path.join(controlRepo, 'package.json').replace(/\\/g, '/'));
  const mod = req('postgres');
  const driver = typeof mod === 'function' ? mod : mod?.default;
  if (typeof driver !== 'function') throw new Error('postgres client export is not callable');
  return driver;
}

function helperSelfIdentity() {
  const selfPath = fileURLToPath(import.meta.url);
  const self = {
    path: selfPath,
    sha256: null,
    repo_head: null,
    present_at_repo_head: false,
  };
  try {
    self.sha256 = sha256Hex(fs.readFileSync(selfPath));
  } catch { /* leave null; the evidence states it is unknown rather than guessing */ }
  try {
    const dir = path.dirname(selfPath);
    const head = spawnGit(dir, ['rev-parse', 'HEAD']);
    if (head.status === 0) {
      self.repo_head = head.stdout.toString('utf8').trim();
      const rel = path.relative(dir, selfPath).split(path.sep).join('/');
      const tracked = spawnGit(dir, ['cat-file', '-e', `${self.repo_head}:${rel}`]);
      self.present_at_repo_head = tracked.status === 0;
    }
  } catch { /* non-fatal; recorded as null */ }
  return self;
}

function buildEvidence(state) {
  const cls = state.classification;
  return {
    mechanism: MECHANISM_ID,
    schema: 'lane-a-exact-file-postgres-apply-evidence/v1',
    task_id: TASK_ID,
    release_id: state.args ? (state.args['release-id'] ?? null) : null,
    migration_id: state.args ? state.args['migration-id'] : null,
    git_revision: state.args ? state.args['expect-revision'] : null,
    file_path: state.args ? state.args.file : null,
    file_sha256: state.observed_sha256 ?? null,
    file_sha256_expected: state.args ? state.args['expect-sha256'] : null,
    helper: state.helper,
    control_repo: state.args ? state.args['control-repo'] : null,
    target_identity: state.target_identity ?? null,
    mode: state.args ? state.args.mode : null,
    transaction: state.transaction ?? null,
    pre_run_shape: state.result ? state.result.pre_run_shape : null,
    preconditions: state.result ? state.result.preconditions : null,
    sql_execution: state.result ? {
      executed: state.result.statement_count > 0,
      statement_count: state.result.statement_count,
      single_file_single_transaction: true,
      error: state.result.sql_error,
    } : null,
    postconditions: state.result ? state.result.postconditions : null,
    rollback: state.result ? {
      result: state.result.rollback_result,
      deliberate: state.result.rollback_deliberate,
    } : null,
    commit: state.result ? { result: state.result.commit_result } : null,
    post_rollback_shape: state.result ? state.result.post_rollback_shape : null,
    persistent_shape_preserved: state.result ? state.result.shape_preserved : null,
    sequencing_evidence: state.sequencing ?? null,
    refusal: state.refusal ?? null,
    guards: state.guards ?? null,
    failure_stage: state.result ? state.result.failure_stage : (state.stage ?? null),
    failure_reason: state.result ? state.result.failure_reason : (state.reason ?? null),
    exit_code: cls ? (CLASSIFICATION[cls]?.exitCode ?? 1) : 1,
    final_classification: cls,
    generated_at: new Date().toISOString(),
    credential_value_persisted: false,
    connection_string_persisted: false,
    raw_stderr_persisted: false,
  };
}

function writeEvidence(evidencePath, evidence) {
  if (typeof evidencePath !== 'string' || evidencePath.length === 0) return { written: false, reason: 'no_evidence_out' };
  try {
    fs.mkdirSync(path.dirname(path.resolve(evidencePath)), { recursive: true });
    fs.writeFileSync(evidencePath, JSON.stringify(evidence, null, 2) + '\n', 'utf8');
    return { written: true, path: path.resolve(evidencePath) };
  } catch (e) {
    err(`EVIDENCE_WRITE_FAILED: ${e.code || e.name}`);
    return { written: false, reason: `evidence_write_failed:${e.code || e.name}` };
  }
}

export async function main(argv, env, deps = {}) {
  const state = {
    args: null, helper: null, classification: null, result: null,
    observed_sha256: null, sequencing: null, guards: null, target_identity: null,
    transaction: null, refusal: null, stage: null, reason: null,
  };

  const parsed = parseArgs(argv);
  if (!parsed.ok) {
    state.classification = 'ARGUMENT_INVALID';
    state.stage = 'argument';
    state.reason = parsed.reason;
    state.refusal = { reason: parsed.reason, credential_in_argv: parsed.credential_in_argv === true };
    await finish(state);
    return CLASSIFICATION.ARGUMENT_INVALID.exitCode;
  }
  const args = parsed.args;
  state.args = args;

  out(MECHANISM_ID);
  out(`TASK_ID: ${TASK_ID}`);
  out(`MODE: ${args.mode}`);
  out(`MIGRATION_ID: ${args['migration-id']}`);
  out(`FILE: ${args.file}`);
  out(`REVISION: ${args['expect-revision']}`);
  out(`FILE_SHA256_EXPECTED: ${args['expect-sha256'].toLowerCase()}`);
  out(`CONTROL_REPO: ${args['control-repo']}`);

  // ── Ordered governed preflight. Nothing below this point has touched the
  //    credential variable or opened a socket. ────────────────────────────────
  const pre = evaluateGovernedPreflight(args, env, deps);
  state.observed_sha256 = pre.observed_sha256 ?? pre.observedSha256 ?? null;
  state.sequencing = pre.sequencing ?? null;
  state.guards = pre.guards ?? pre.guards_partial ?? null;
  if (!pre.ok) {
    state.classification = pre.classification;
    state.stage = pre.stage;
    state.reason = pre.reason;
    state.refusal = {
      reason: pre.reason,
      stage: pre.stage,
      observed_sha256: pre.observed_sha256 ?? null,
      revision_check: pre.revision_check ?? null,
      credential_read: false,
      connection_attempted: false,
    };
    if (pre.guards) state.guards = pre.guards;
    out(`REFUSED_AT: ${pre.stage}`);
    out(`REFUSAL_REASON: ${pre.reason}`);
    await finish(state);
    return CLASSIFICATION[pre.classification].exitCode;
  }

  out(`FILE_SHA256_OBSERVED: ${pre.observedSha256}`);
  out('FILE_BYTES_FROM: declared_revision (not the working tree)');

  // ── Target proof: parse the credential, still without connecting. ──────────
  const rawUrl = env[ENV_AUTHORITY.CREDENTIAL];
  Object.assign(sink, { sanitize: makeSanitizer(rawUrl) });
  const identity = deriveTargetIdentity(rawUrl);
  if (!identity.ok) {
    state.classification = 'TARGET_IDENTITY_UNDETERMINABLE';
    state.stage = 'target_proof';
    state.reason = `credential identity could not be derived (${identity.reason})`;
    state.refusal = { reason: state.reason, credential_read: true, connection_attempted: false };
    out('REFUSED_AT: target_proof');
    out(`REFUSAL_REASON: ${state.reason}`);
    await finish(state);
    return CLASSIFICATION.TARGET_IDENTITY_UNDETERMINABLE.exitCode;
  }
  state.target_identity = { ref: identity.ref, role: identity.role, derivation_form: identity.form };
  out(`TARGET_IDENTITY: ref=${identity.ref} role=${identity.role ?? '<none>'} form=${identity.form}`);
  if (identity.ref !== args['expect-target-ref']) {
    state.classification = 'TARGET_IDENTITY_MISMATCH';
    state.stage = 'target_proof';
    state.reason = `credential resolves to project ref '${identity.ref}' but --expect-target-ref is '${args['expect-target-ref']}'`;
    state.refusal = { reason: state.reason, credential_read: true, connection_attempted: false };
    out('REFUSED_AT: target_proof');
    out(`REFUSAL_REASON: ${state.reason}`);
    await finish(state);
    return CLASSIFICATION.TARGET_IDENTITY_MISMATCH.exitCode;
  }
  out('TARGET_PROOF: credential identity matches --expect-target-ref');

  // ── Execution. First point at which a socket may be opened. ───────────────
  let driver;
  try {
    driver = (deps.loadPostgresDriver ?? loadPostgresDriver)(args['control-repo']);
  } catch (e) {
    state.classification = 'RUNTIME_DEPENDENCY_UNAVAILABLE';
    state.stage = 'driver_load';
    state.reason = `postgres client could not be loaded from --control-repo (${e.code || e.name})`;
    await finish(state);
    return CLASSIFICATION.RUNTIME_DEPENDENCY_UNAVAILABLE.exitCode;
  }

  const sql = driver(rawUrl, { prepare: false, ssl: 'require', max: 1, idle_timeout: 5, connect_timeout: 25 });
  const startedAt = new Date().toISOString();
  state.transaction = { started_at: startedAt, ended_at: null, single_transaction: true };

  let outcome;
  try {
    outcome = await runManagedTransaction({
      mode: args.mode,
      sql,
      migration: pre.migration,
      migrationText: pre.migrationText,
      deps,
    });
  } catch (e) {
    outcome = {
      ok: false,
      classification: 'INTERNAL_ERROR',
      result: {
        mode: args.mode, statement_count: 0, transaction_entered: false,
        preconditions: [], postconditions: [],
        rollback_result: 'NOT_RUN', commit_result: 'NOT_RUN', rollback_deliberate: false,
        failure_stage: 'internal', failure_reason: `internal_error:${e?.name || 'unknown'}`,
      },
    };
    err(`INTERNAL_ERROR: ${e?.name || 'unknown'}`);
  }

  state.transaction.ended_at = new Date().toISOString();
  state.result = outcome.result;
  const connectionFailed = outcome.result.failure_stage === 'pre_run_shape';
  state.classification = connectionFailed ? 'CONNECTION_FAILED' : outcome.classification;

  for (const c of outcome.result.preconditions || []) {
    out(`  PRE  ${c.ok === true ? 'PASS' : 'FAIL'}  ${c.check}  observed=${JSON.stringify(c.observed)}`);
  }
  out(`SQL_EXECUTION: statements=${outcome.result.statement_count} ${outcome.result.sql_error ? 'ERROR state=' + JSON.stringify(outcome.result.sql_error) : 'accepted'}`);
  for (const c of outcome.result.postconditions || []) {
    out(`  POST ${c.ok === true ? 'PASS' : 'FAIL'}  ${c.check}  observed=${JSON.stringify(c.observed)}`);
  }
  out(`ROLLBACK: ${outcome.result.rollback_result} deliberate=${outcome.result.rollback_deliberate}`);
  out(`COMMIT: ${outcome.result.commit_result}`);
  if (args.mode === 'dry-run') {
    out(`PERSISTENT_SHAPE_PRESERVED_AFTER_ROLLBACK: ${outcome.result.shape_preserved}`);
  }
  if (outcome.result.failure_stage) {
    out(`FAILURE_STAGE: ${outcome.result.failure_stage}`);
    out(`FAILURE_REASON: ${outcome.result.failure_reason}`);
  }

  try {
    await sql.end({ timeout: 5 });
  } catch { /* nothing useful to add, and no retry is permitted */ }

  await finish(state);
  return CLASSIFICATION[state.classification].exitCode;
}

async function finish(state) {
  state.helper = helperSelfIdentity();
  const evidence = buildEvidence(state);
  const written = writeEvidence(state.args ? argsEvidenceOut(state.args) : null, evidence);
  if (written.written) out(`EVIDENCE_OUT: ${written.path}`);
  else if (written.reason && written.reason !== 'no_evidence_out') out(`EVIDENCE_OUT: not written (${written.reason})`);
  out(`CLASSIFICATION: ${state.classification}`);
  out(`EXIT: ${CLASSIFICATION[state.classification]?.exitCode ?? 1}`);
}

function argsEvidenceOut(args) {
  return args ? args['evidence-out'] : null;
}

const isMain = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isMain) {
  const code = await main(process.argv.slice(2), process.env);
  process.exitCode = code;
}
