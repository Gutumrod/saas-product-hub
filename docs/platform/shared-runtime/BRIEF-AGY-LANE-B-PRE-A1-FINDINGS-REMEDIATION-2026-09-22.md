# BRIEF — PRE-A1 REMEDIATION OF THE THREE H3D FINDINGS (AGY EXECUTION)

Date: 2026-09-22
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Author: Claude (Windows) — Lane-B controller
Authority: `OWNER-DECISION-LANE-B-PRE-A1-REMEDIATION-2026-09-22.md` §3.B, §4
Status: `CONTROLLER DRAFT REV2 — CORRECTS DEFECT-07/DEFECT-08 FROM CODEX ROUND 1 (REVIEW-CODEX-LANE-B-CONTROLLER-PACKAGE-2026-09-22.md) — AWAITING CODEX INDEPENDENT REVIEW. AGY MUST NOT START UNTIL CLAUDE RELEASES IT.`
Companion (binding): `CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md`

## 0. Where you work

| Field | Value |
|---|---|
| Worktree | `D:\AI-Workspace\runtime\worktrees\house-h3d-h5-20260909` |
| Branch | `work/house-h3d-h5-20260909` |
| Base | `2b1af861aa608f08abb0bd8224821b9ca5ac9981` (clean, `0/0`) |
| PS01 worktree | untouched — do not open it for writing |
| `H3D_OUT_DIR` | **must** be a path outside the repo for any tool run (e.g. `%TEMP%\lane-b-out`) |

## 1. Hard boundary — read before anything else

**No LAB access of any kind in this unit.** No DB connection, no Auth API call, no
Dashboard action, no role/credential creation, no DML/DDL. Every test in this unit is
offline. A test that needs LAB is written, committed, and marked
`LIVE_DEFERRED_TO_A1_PREFLIGHT` — it is not run.

Do not: squash or rewrite `d6707c0..2b1af86`; merge; touch PS01; touch H3E/H3F/H5
assets; touch `migrations/*`; touch `tools/shared-runtime/h4/h4-probe-harness.mjs`; run
scaffolders, `git clean`, `git reset`, `rm -rf`; read or reference
`BILLING_DATABASE_URL` or `SUPABASE_DB_PASSWORD_WSTERA_LAB`.

### Allowed write scope

- `tools/shared-runtime/h3d/**`
- `tools/shared-runtime/inventory/**`
- `tools/shared-runtime/lib/**` (new, shared helpers only)
- `tools/shared-runtime/h3c/h3c-privilege-snapshot.sql`, `tools/shared-runtime/h4/h4-privilege-snapshot.sql` (provenance field only)
- `tools/shared-runtime/package.json` (script entries only; **no new dependency**)
- `docs/platform/shared-runtime/fixtures/**`
- `docs/platform/shared-runtime/runbooks/**` (new)
- `docs/platform/shared-runtime/evidence/LANE-B-PRE-A1-REMEDIATION-2026-09-22.md` (new)

Anything else → stop and report; do not widen scope yourself.

## 2. Finding 1 — `F-GATE-RLS-COUPLING` (HIGH)

**Defect.** Gates were authored under an RLS-bypassing credential. Under least
privilege, 12 of 23 counted tables read `0` because they are invisible, the catalog
fingerprint embeds an RLS-protected data row, and `lab-readonly-inventory.mjs` counts
`storage.buckets` and `cron.job` (both RLS-protected in Supabase) into its signature.
A blind zero reads as green. (`BATCH-H3D-S` §5, `ANALYSIS` A2.)

**Required change.**

1. One measurability helper in `tools/shared-runtime/lib/` used by **every** counting
   path (runner `modeReviewed` / post-seed / teardown counts, inventory, any new gate
   script). For each relation it returns `{ measurable, reason }` from the live
   catalog: `has_table_privilege(current_user, rel, 'SELECT')` AND
   (`NOT relrowsecurity` OR current role `rolbypassrls`). A non-measurable relation
   yields `UNMEASURED`, never a number.
2. A session visibility control, run once per session before any count is accepted:
   `ps01.commercial_packages` count must equal the recorded reference value `3`. A
   different value → every RLS-protected count in that session is `UNMEASURED`.
3. Gate result algebra: a gate is `PASS` only if every required item is measured and
   matches. Any `UNMEASURED` item → gate result `UNMEASURED` with a **distinct exit
   code** from both PASS and FAIL. No code path may coerce `UNMEASURED` to `0`/PASS.
4. Catalog manifest split:
   - `schema` section — FK graph, triggers, function hashes, column and constraint
     contracts — with its own `schema_fingerprint`. Must be derivable by a role with
     no RLS bypass. Where the capture uses `information_schema` (which filters by
     privilege), assert that every expected table is present; a missing table is
     `UNMEASURED`, not drift.
   - `reference_data` section — the `commercial_packages('starter')` row — with its own
     `reference_fingerprint`, verified only when the visibility control passed.
   - `--verify` reports the two separately. The combined A1 gate requires both measured
     and matching.
5. Expected manifest update: the new fingerprints may be **recomputed offline** from the
   data already in `fixtures/h3d-expected-catalog-manifest.json`. Record them with
   `"verification": "offline_recomputed_not_live_verified"`. Do not describe them as
   captured or as matching LAB. (`BATCH-H3D-S` §2 defect 2 — this exact overstatement
   has happened once.)
6. Inventory: `storage_bucket_count`, `cron_job_count`, `cron_job_names`,
   `auth_user_count` and `token_grant_rows` go through the helper; unmeasured items
   are excluded from the signature and listed under `unmeasured[]`; `compare-inventory.mjs`
   treats a non-empty `unmeasured[]` on either side as `UNMEASURED`, not match. Replace
   the existing `COALESCE(…, -1)` sentinel pattern — `-1` is a number a comparator can
   match.

**Negative controls (offline selftests, each must fail the gate if the logic breaks):**

- RLS-enabled table + role without bypass → `UNMEASURED`, not `0`.
- visibility control reads `0` → all RLS-protected counts `UNMEASURED`.
- a mocked hidden row (true count 1, visible count 0) is never reported `PASS`.
- `UNMEASURED` gate exit code ≠ PASS exit code ≠ FAIL exit code.
- reference-data invisible → schema verify may PASS, combined A1 gate does not.
- inventory: one side with `unmeasured[]` non-empty → comparator not `MATCH`.
- a regression test asserting no counting path in the repo bypasses the helper
  (source scan for `count(*)` outside the helper and outside SQL fixture files).

## 3. Finding 2 — `F-CATALOG-PROVENANCE` (HIGH), root cause

**Defect.** `catalog-manifest.mjs:174` stamps `project_ref` from a literal, so both
sides of `--verify` carry the same constant and a schema-identical foreign database
verifies PASS as LAB. Siblings with the same defect, all in scope:
`h4/h4-privilege-snapshot.sql:18`, `h3c/h3c-privilege-snapshot.sql:27`,
`inventory/lab-readonly-inventory.mjs:104`, `fixtures/h3d-authz-fixture-seed.sql:280`
(the seed manifest's `project_ref`, which the runner then "checks" against the same
constant at `h3d-live-runner.mjs:477`). And the database side of the runner is never
checked at all: psql and `pg` connect to whatever `H3D_GRANTS_DB_URL` names
(`h3d-live-runner.mjs:338-342`, `:497-510`).

**Required change — fix once, where every caller routes.**

1. One `lab-target` helper in `tools/shared-runtime/lib/`:
   - `connectionRef(url)` — derive the ref from the pooler username suffix
     (`<role>.<ref>`) and/or host `db.<ref>.supabase.co`; if both present they must
     agree; none/ambiguous → throw **before** any network I/O.
   - `databaseRefEvidence(client)` — after connecting, read a database-side value that
     differs between two schema-identical Supabase projects. Candidates to evaluate,
     in order: `pg_control_system().system_identifier`; a Supabase-provisioned setting
     or object carrying the ref. Pick the first that is (a) readable by a class-M role
     **per documentation or source**, and (b) not writable by any class-M/W role. State
     the choice and the reason. Its live readability is
     `LIVE_DEFERRED_TO_A1_PREFLIGHT`; if it proves unreadable there, the preflight
     STOPs — it does not fall back to a literal.
   - `assertLabTarget(url, client)` — both values must match `LAB_REF`; mismatch or
     absence → typed STOP, non-zero exit, and nothing written that is labelled LAB.
2. Every DB entry point uses it: `catalog-manifest.mjs` `withDb`, `lab-readonly-inventory.mjs`,
   runner `withDb`, runner `runPsqlFile` (check the URL **before** spawning psql).
3. Every emitted artifact carries measured provenance
   (`provenance: { connection_ref, database_ref_evidence, measured_at }`). A field
   holding a literal ref may remain only under the name `expected_project_ref`. SQL
   files that cannot measure (seed manifest, snapshots) must not emit a
   `project_ref` at all; the calling tool attaches its measured provenance, and
   consumers (`readSeedManifestSnapshot`, snapshot readers) require the tool-attached
   field.
4. `--verify` compares provenance, and a manifest without measured provenance cannot
   verify PASS.

**Negative controls (offline):**

- URL whose ref ≠ LAB → STOP before connect (assert no socket/psql spawn happened).
- user ref ≠ host ref → STOP.
- URL with no parseable ref → STOP.
- mocked `databaseRefEvidence` ≠ recorded LAB value → STOP.
- **two-project same-schema fixture (added, Codex round 1 DEFECT-07):** a mocked
  client presenting the identical schema/data capture as LAB but a *different*
  `database_ref_evidence` value must be rejected (STOP), proving the mechanism
  distinguishes projects and not merely schema drift. A companion mocked client that
  returns a **constant or hardcoded** `database_ref_evidence` (mimicking the exact
  literal-stamping bug this finding fixes) across two differently-configured mock
  connections must also be rejected by the selftest itself — i.e. the selftest harness
  asserts the chosen mechanism is *capable of varying*, not only that today's LAB
  value matches. A mechanism that cannot fail this control (e.g. `databaseRefEvidence`
  implemented as `() => LAB_REF`) does not satisfy this finding and must not be
  merged.
- expected manifest carrying only a literal `project_ref` → verify refuses.
- seed manifest without tool-attached provenance → runner refuses it.
- source scan: no remaining literal-stamped `project_ref` output in any in-scope file
  (the constant may exist only as `LAB_REF` / `expected_project_ref`).

**Live-only closure (`LIVE_DEFERRED_TO_A1_PREFLIGHT`, unresolved in this unit):** the
offline controls above can prove the *comparison logic* is sound; they cannot prove
`databaseRefEvidence`'s chosen live mechanism actually differs between two real
Supabase projects, because this unit has no LAB access. The A1 preflight window must
run the mechanism against LAB and record the raw value before it is trusted for any
gate; if it turns out constant or unreadable under class M, `H3D-A1` STOPs and returns
a new finding, it does not fall back to the literal.

## 4. Finding 3 — `auth.users` measurability (MEDIUM)

**Defect.** `auth.users` returns `42501` to any grantable role (`BATCH-H3D-S` §6,
`ANALYSIS` B3), yet the H3D-A1 exit criterion and every later "no Auth residue" claim
depend on it, and `lab-readonly-inventory.mjs:204` reads it through SQL.

**Required change.**

1. An Auth measurement module in `tools/shared-runtime/lib/` using the Auth Admin API
   (class A, `CREDENTIAL-STRATEGY` §1), **GET only**:
   - origin must pass the §3 LAB target check (API origin = `https://<LAB_REF>.supabase.co`);
   - page through `/auth/v1/admin/users` until exhausted; record
     `count` and `id_set_sha256` (sha256 over the sorted list of `sha256(id)`), never
     emails, phones, metadata, or raw ids;
   - cross-check the page-walk count against the server's reported total when the
     response supplies one; disagreement → `UNMEASURED`;
   - any non-200, missing body, or truncated walk → `UNMEASURED`. Never `0`.
2. Residue claim = before/after equality of **both** `count` and `id_set_sha256`. A
   count-only comparison is not accepted (create-one-delete-another would pass it).
3. Inventory and runner stop reading `auth.users` through SQL; they use this module.
4. The module must be unable to mutate: a source-level test asserts its only HTTP
   method is `GET` and its only path prefix is `/auth/v1/admin/users`.
5. **Output schema guard (added, Codex round 1 DEFECT-08).** The module's return type
   is `{ measured: true, count: number, id_set_sha256: <64-hex-char string> } |
   { measured: false, reason: string }`. Before returning `measured: true`, the module
   validates `count` is a non-negative integer and `id_set_sha256` matches
   `/^[0-9a-f]{64}$/, and that `id_set_sha256` is the empty-list hash
   (`sha256("")`) if and only if `count === 0`. Any violation — absent field, `null`,
   wrong type, empty string, malformed hex, or a count/hash pair that is internally
   inconsistent — returns `measured: false`, never a partially-populated `measured:
   true` object. The residue comparison (step 2) itself additionally refuses to run
   if either side is `measured: false`, reporting `UNMEASURED` rather than treating a
   missing value as equal to another missing value.

**Negative controls (offline, mocked fetch):**

- 401/403 (wrong project key) → `UNMEASURED`, not `0`.
- mocked extra identity with same count but different id → residue check FAILS.
- pagination truncated → `UNMEASURED`.
- origin ≠ LAB → STOP before fetch.
- output scan: no email/uuid-shaped raw value in the emitted evidence.
- **malformed-success negative controls (added, Codex round 1 DEFECT-08):** a mocked
  response that returns HTTP 200 with `count: null`, or with `id_set_sha256`
  missing/empty/wrong-length, or with `count` and `id_set_sha256` mutually
  inconsistent (e.g. `count: 0` paired with a non-empty-list hash) — each must yield
  `measured: false`, and a before/after pair built from two such malformed results
  must not be reported as matching residue.

**Live positive control** (`LIVE_DEFERRED`): at the A1 preflight the measured count
must equal the recorded baseline `5`; at H3D-LIVE the runner's own created identity
must raise the measured count by exactly one mid-run — proof the counter is not blind.

## 5. Credential-strategy source consequences (needed so A1 is executable)

From `CREDENTIAL-STRATEGY-LANE-B` §2 "Consequence for existing source":

1. Seed and teardown SQL: replace the `current_user = 'postgres'` assertion with the
   class-W shape assertion given there. Keep every other guard untouched. Preserve the
   lock order that Codex round 1 fixed — re-run the lock-order test.
2. Runner `assertDbIdentity()`: class-W shape assertion; the runtime-grant privilege
   checks only in the `H3D-LIVE` modes.
3. Runbooks (files only, **not executed**) under `docs/platform/shared-runtime/runbooks/`:
   `lane-b-role-lane_b_measure_a1-create.sql` / `-teardown.sql` and
   `lane-b-role-lane_b_rw_a1-create.sql` / `-teardown.sql`, per
   `CREDENTIAL-STRATEGY` §3, including the window-open behavioural checks.
4. Gates from `CREDENTIAL-STRATEGY` §6 as selftests: `G-STATIC-NOSHARED`,
   `G-REVOKE-MIRROR`, `G-NO-SECRET-AT-REST`, `G-NO-P-ON-AGENT`.

## 6. Work units — one writer, in this order, one commit each

| Unit | Content |
|---|---|
| U1 | §3 provenance helper + adoption + sibling fixes + tests |
| U2 | §2 measurability helper, catalog split, inventory, expected manifest offline recompute + tests |
| U3 | §4 Auth measurement module + inventory/runner adoption + tests |
| U4 | §5 identity assertions, runbooks, credential gates |

Run the full gate set (§7) after each unit, not only at the end. Push after U4.

## 7. Required gates before you return

- `npm run selftest` (in `tools/shared-runtime`) PASS, including every new negative control above;
- `node tools/shared-runtime/h3d/sql-static-check.mjs` PASS;
- `node tools/shared-runtime/h3d/catalog-manifest.mjs --selftest` PASS;
- `git diff --check 2b1af86..HEAD` clean;
- blocking secret scan (assignment-shape) over the diff and the evidence doc = 0;
- changed-file list ⊆ §1 allowed scope — show it;
- `git status` clean, `H3D_OUT_DIR` outside the repo, remote parity `0/0` after push;
- PS01 worktree still `c169e5d`, clean.

## 8. Return format

Write `docs/platform/shared-runtime/evidence/LANE-B-PRE-A1-REMEDIATION-2026-09-22.md`
containing: final SHA; per-unit SHA; exact changed-file list; every gate command with
its literal exit code and last output line; for every negative control, the test name
and the proof that it fails when the logic is removed (mutation check: revert the
guard locally, show the test failing, restore — **in a test run only, never
committed**); the provenance mechanism chosen and why; every item marked
`LIVE_DEFERRED_TO_A1_PREFLIGHT`.

A claim with no command output behind it is not evidence. Your report will be checked
against the diff line by line — an earlier unit reported changing a function it had not
changed.

Terminal status for this unit, and nothing stronger:
`PRE-A1 FINDINGS REMEDIATED AT SOURCE — LIVE PROOF DEFERRED TO OWNER-CP-H3D-A1`
