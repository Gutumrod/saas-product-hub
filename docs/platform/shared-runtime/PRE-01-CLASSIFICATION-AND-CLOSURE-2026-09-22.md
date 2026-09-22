# PRE-01 — DIRTY-STATE CLASSIFICATION & CLOSURE

Date: 2026-09-22
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Stage: `PRE-01`
Classifier: Claude (Windows) — Lane-B LONG_RUN controller
Terminal state: **`PRE-01 PASS`**

## 1. Preserved artifact

| Field | Value |
|---|---|
| Preserve commit | `db19abda329a31c08ad63b6be83afa47bd0eb494` |
| Parent | `d6707c0c96309f2f0efb8f83f00b5f34aee6d2b5` |
| Remote ref | `origin/preserve/mac-h3d-dirty-20260922` |
| Changed files | `tools/shared-runtime/h3d/h3d-live-runner.mjs` (only) |
| Delta | +405 / −63 |
| Blob (preserved) | `c7a426c6792e59c4670a2e23f4ec89f1f1e31847` |
| Blob (committed baseline) | `899d9cbf24d3a8445e483b364e44ec9ffb22e6e4` |
| Mac local bundle | `~/mac-h3d-preserve-20260922.bundle` sha256 `33374d298b62cd20b9018283acda4fd9c41a3661f6f1662ab72efdc9e19d6a45` |
| File mtime | 2026-09-17 21:23:58 |

Integrity: the blob inside the preserve commit equals the blob the Mac reported
from its working tree, and the commit's parent equals the Mac `HEAD`. The Windows
controller verified both independently after fetch.

Mac post-state confirmed unchanged: `HEAD` still `d6707c0`, working tree still
`M tools/shared-runtime/h3d/h3d-live-runner.mjs`, blob still `c7a426c`. No branch,
index, or working-tree mutation occurred. PS01 verified at `c169e5d`, clean, `0/0`.

## 2. Provenance

**Unattributed.** No agent session log, reflog entry, vault log, or handoff note on
the Mac covers this edit. The only temporal evidence is the file mtime
(2026-09-17), eight days after the Windows→Mac handoff.

Consequence, locked: this revision carries **zero prior review**. No PASS, gate
result, or acceptance may be inherited for it. Any downstream stage that depends on
it must be bound to a reviewer verdict issued against an exact SHA.

Provenance is nevertheless **resolved for PRE-01 purposes by content**: the change
is unambiguously targeted at the S1–S5 findings of
`BRIEF-CLAUDE-H3D-STATIC-ACCEPTANCE-REMEDIATION-2026-09-09.md`, is internally
coherent, and is not foreign or unrelated work. It is valid continuation work and
must be preserved, not discarded.

## 3. Classification against S1–S5

| Finding | Verdict | Evidence in preserved revision |
|---|---|---|
| S1 — worktree commit binding | **ADDRESSED** | `houseCommit()` now runs `git -C HOUSE_ROOT rev-parse --verify HEAD` via `execFileSync` with a 5000 ms timeout, validates `^[0-9a-f]{40}$`, throws on failure. `H3D_HOUSE_COMMIT` is cross-check only; mismatch throws. The `"unknown"` fallback is gone. |
| S2 — `HOOK_ON_CONFIRMED` dead end | **ADDRESSED** | `writeReceipt("HOOK_ON_CONFIRMED", { …, ...bindings })` now spreads the verified bindings produced by `verifyBoundSeedContext()`. `receiptFresh()` rewritten with a `required` table over `commit`, `catalog_fingerprint`, `fixture_fingerprint`, `seed_manifest_sha256`, `post_seed_receipt_sha256`, `project_ref`: when an expected value is supplied, a missing/null/empty field FAILS instead of silently skipping. |
| S3 — receipt chain not hash-linked | **ADDRESSED** | New chain store (`chainDir`/`chainFiles`/`latestChain`) writing monotonic `NNNN-STATE.json` with `chain_seq`. `CHAIN_ALLOWED` transition map enforced by `assertChainTransition()` inside `writeReceipt`. `loadExternalAuthorization()` now writes an internal consumed-authorization marker receipt. `verifyReceiptChain()` added and wired into `modeState()`. |
| S4 — seed-manifest integrity | **ADDRESSED** | `readSeedManifestSnapshot()` opens once and stats before/after (`dev`/`ino`/`size`/`mtimeMs`) to detect change-during-read, then hashes the exact bytes. `verifyBoundSeedContext()` wired at all three mutation entry points (hook probe, run, teardown). Teardown calls `assertManifestUnchanged()` then `runPsqlFile(TEARDOWN_SQL, { manifest: seed.bytes… })` — the same verified bytes are passed, with no manual copy/edit step. |
| S5 — `camera_access_audit` scope | **PARTIAL — see §4** | Runner side only: post-seed `SELECT count(*) … WHERE shop_id IN ($1,$2)`, throw if non-zero, and `camera_access_audit_fixture_count` recorded in evidence. |
| A1 — concurrency/failure injection | **CORRECTLY NOT ATTEMPTED** | `tests.mjs` untouched. Consistent with the brief: A1 belongs to a separately authorized lane. |

### Completeness

`node --check` on the preserved revision PASSES. There are no `TODO`, `FIXME`,
`WIP`, or unimplemented markers, and every new function is wired into a call site
rather than left orphaned. This is a coherent near-complete pass, **not** an
abandoned half-edit.

### Verification status

**No gate has been run against this revision.** `npm run selftest` and
`node h3d/sql-static-check.mjs` results are unknown; no evidence of a run exists on
the Mac. The work is implemented but unverified.

## 4. Locked finding carried into `H3D-S`

**F-S5-RESIDUAL — S5 is incomplete.** The preserved revision changes only
`h3d-live-runner.mjs`. These S5 requirements remain unmet, and all of them are
inside the allowed implementation scope of the static-acceptance brief:

1. Teardown must lock `ps01.camera_access_audit` in the deterministic lock set and
   assert zero fixture-shop rows before the first `DELETE`
   (`docs/platform/shared-runtime/fixtures/h3d-authz-fixture-teardown.sql` — untouched).
2. Seed-side atomic precondition and recorded baseline expectation
   (`…/h3d-authz-fixture-seed.sql` — untouched).
3. Post-restoration residue assertion: fixture-shop rows still zero after teardown,
   with count/signature included in restoration evidence.
4. `catalog-manifest.mjs` naming must distinguish FK-reachable tables from extra
   monitored surfaces so the manifest stops overstating graph reachability
   (untouched).
5. `camera_rate_limit_buckets` must be documented as non-shop-scoped with no FK.
   It does not appear anywhere in the preserved revision.

Because `camera_access_audit` has no FK to `ps01.shops`, deleting fixture Shop A/B
cannot remove such rows. Without item 1 and item 3 they can survive teardown
unnoticed — which is precisely the defect S5 raised. Post-seed detection alone does
not close it.

## 5. Gate deviation record (§9 discipline)

`BRIEF-MAC-PRE-01-DIRTY-STATE-PRESERVATION-2026-09-22.md` §4 gates the push on a
broad secret-scan returning `0`. The scan returned `1`.

- The single hit was the bare token `password`, the loosest term in that pattern.
- A precise re-scan for secret-shaped assignments
  (`(password|secret|token|api_key|…)\s*[:=]\s*['"]{8,}`) returned `0`.
- All four `password` occurrences were inspected with string literals ≥10 chars
  masked, and are: a security comment forbidding secrets in the file (line 8); a
  regex that *detects* a DB URL carrying a password (line 95); a runtime
  `crypto.randomUUID()` temporary password (lines 317–332); and
  `PGPASSWORD: decodeURIComponent(u.password)` reading a parsed URL at runtime
  (line 507). No literal secret value exists in the file.

Classified as a **gate-design false positive**. The push was authorized explicitly
by the Lane-B controller on that basis; the Mac correctly refused to self-authorize
and correctly refused to create `refs/preserve/*` without explicit authorization.

Corrective action for subsequent units: the assignment-shape pattern becomes the
blocking gate; the broad pattern is retained as advisory only.

## 6. PRE-01 manifest requirements

| Requirement | Status |
|---|---|
| Inspect active Mac worktree | DONE |
| Classify dirty `h3d-live-runner.mjs` | DONE — valid continuation work, S1–S4 addressed, S5 partial, gates unrun, zero review |
| Verify branch/HEAD/upstream/parity | DONE — Mac `d6707c0`, `0/0` |
| Verify PS01 execution worktree | DONE — `c169e5d`, clean, `0/0` |
| Verify remote execution branch | DONE — `origin/work/house-h3d-h5-20260909` = `d6707c0` |
| Verify Source of Truth files | DONE — all 8 present |
| Preserve unknown local work | DONE — local bundle + `origin/preserve/mac-h3d-dirty-20260922`; working tree untouched |
| Confirm no Production authority | CONFIRMED — none granted |

Cross-lane check: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001` (coordinator Hermes) is
`CLOSED` as of 2026-09-21 with `Next Allowed Action: NONE`. No concurrent mutation
window exists against a shared LAB/Auth/config surface, so brief §8 non-overlap is
satisfied.

## 7. Next unit

`H3D-S` — AGY completes F-S5-RESIDUAL items 1–5, then runs the full required gate
set from the static-acceptance brief against the resulting revision. Codex reviews
the exact resulting SHA. No Owner checkpoint is required to begin `H3D-S`; the next
hard stop is `OWNER-CP-H3D-A1`.
