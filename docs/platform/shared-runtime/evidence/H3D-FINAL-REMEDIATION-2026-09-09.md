# H3D Final One-Shot Remediation — Implementation Evidence

**Date:** 2026-09-09 (Asia/Bangkok)
**Environment:** WSTERA LAB (`ykxlqnshaaxmzzocpjlj`) — read-only throughout
**Brief:** `BRIEF-CLAUDE-H3D-FINAL-ONE-SHOT-REMEDIATION-2026-09-09.md`
**Status:** `H3D FINAL REMEDIATION IMPLEMENTED / LIVE DML AWAITING SEPARATE AUTHORIZATION`
**Unchanged closure state:** `LIVE DML NOT AUTHORIZED / H3D NOT PASS / HOUSE-A CLOSED / BK01 QUARANTINED`

No seed / teardown / Auth identity / runtime grant / hook / live run occurred
during this implementation lane. All live claims below are from SELECT-only
catalog / RPC-signature reads.

## Changed files

| File | Change |
|---|---|
| `tools/shared-runtime/h3d/catalog-manifest.mjs` | NEW — SELECT-only capture of the ps01.shops-rooted FK graph, all graph triggers (name/function/`tgenabled`/timing/events/function-def sha256), the control-function hashes, and `commercial_packages('starter')`. `--verify` STOPs (exit 3) on any FK / trigger / function / graph-table / starter drift. `--selftest` covers 8 drift classes. |
| `docs/platform/shared-runtime/fixtures/h3d-expected-catalog-manifest.json` | NEW — the captured expected manifest (fingerprint `001c2c213f4a7086704da1e56879b82bee88f6f6054bd66c316e1791369d0619`). 20 shop-rooted tables, 30 FK edges, 21 triggers. |
| `docs/platform/shared-runtime/fixtures/h3d-authz-fixture-seed.sql` | REWRITTEN per §5 — `SET LOCAL` bounded timeouts, `SHARE ROW EXCLUSIVE` on the 7 controlled tables, `commercial_packages('starter') FOR SHARE` + semantic assertions, inline trigger gate, empty-baseline + case-normalised label + exact-id collision assertions, in-txn count snapshot, exact `+(2,2,2,1,1,2,2)` delta, every-other-graph-table `+0`, exact subscription semantics (`trial_ends_at = trial_started_at + 30d`, source `bootstrap`, no cancel/suspend, null period/grace) and exact audit semantics (`system` / `subscription.initialized` / `bootstrap` / expected reason / `previous_*` + `actor_id` + `idempotency_key` + `request_fingerprint` null), `SET CONSTRAINTS ALL IMMEDIATE`, redacted manifest with generated subscription/audit ids + `txid_current()` + pre-seed counts. No `ON CONFLICT`. |
| `docs/platform/shared-runtime/fixtures/h3d-authz-fixture-teardown.sql` | REWRITTEN per §6 — manifest load + shape check, `ACCESS EXCLUSIVE` on `subscription_audit_log` acquired first (never upgraded), `SHARE ROW EXCLUSIVE` on every other shop-rooted graph table, exact trigger OID/function/`tgenabled='O'` verification, pre-delete assertions (exact fixture rows, exact generated subscription/audit ids, zero non-fixture child rows), leaf-first deletes by exact id each with `GET DIAGNOSTICS ROW_COUNT`, immutable-audit `DISABLE`/`ENABLE` of the exact named trigger scoped to the two exact audit ids, shop delete last must affect exactly 2, residue-zero + pre-seed-count-restoration + trigger-re-enabled post-checks. |
| `docs/platform/shared-runtime/fixtures/h3d-authz-fixture-precheck.sql` | REWRITTEN — relabelled EVIDENCE ONLY / "NOT the seed guard"; SELECT-only; records the pre-seed state a human reviews before granting fixture-DML authorization. |
| `tools/shared-runtime/h3d/h3d-live-runner.mjs` | REWRITTEN per §7–§8 — 14-state machine + hash-linked TTL receipts; `H3DError` typed throws + one top-level exit (no `process.exit` inside workflows); `Ledger` ownership register + `Promise.allSettled` cleanup + per-UUID verify + redacted recovery file; split `--preflight-readonly` (mutation-free) / `--preflight-hook-probe --authorize-hook-probe` / `--run --authorize-run`; `--reviewed`, `--verify-post-seed`, `--state`; strict LAB-origin + DB-identity + project-ref checks before any network call; INSERT-only grant with collision STOP; minimal child-env allowlist; `spawnHarness` distinguishes timeout / signal / spawn-failure / nonzero-exit / missing / malformed / stale evidence + hashes the child JSON; discovery Invariants A (joined room/plan pair) + B (same-shop distinct-owner foreign pet, exactly one); PII/secret scanner on every evidence write and receipt. |
| `tools/shared-runtime/h3d/sql-static-check.mjs` | NEW — parses the three fixture SQL files for BEGIN/COMMIT, bounded timeouts, lock order, pre-DML assertions, forced deferred constraints, exact row-count checks, id-scoped deletes, no unscoped DELETE/UPDATE/TRUNCATE, no `ON CONFLICT`, evidence-only precheck. |
| `tools/shared-runtime/h3d/tests.mjs` | NEW — aggregates every offline selftest + static check + catalog-drift scenario. |
| `tools/shared-runtime/h3c/h3c-proof-harness.mjs` | `H3C_STRICT_H3D=1` opt-in (off by default → committed H3C contract + its selftests unchanged): strict fixture validation (UUID / uniqueness / exact cardinality / cross-field / fixed future `start_at`), 2xx positive-shape checks for POS-1/POS-2 (no PII persisted), exact-branch AUTHZ classifier `strictAuthzReject` (PASS only on SQLSTATE `P0xxx` + the traced rejection message; 5xx / gateway / routing / capacity / room / plan / empty / 2xx = FAIL), POS-AUTHZ-3 forced to exactly one foreign pet reusing the POS-2 room/plan/start. 22 new `--selftest` assertions. |
| `tools/shared-runtime/package.json` | `selftest` script now also runs `h3d/tests.mjs`. |
| `docs/platform/shared-runtime/OPERATOR-ACTION-PACK-H3D-TO-H5-2026-09-09.md` | H3D section rewritten to the §9 16-transition table; removed "preflight is all read-only"; documented the external-authorization-receipt format. |

## Findings

| ID | Sev | Status | Where |
|---|---|---|---|
| F01 seed preconditions not atomic | HIGH | **Fixed** — all preconditions are inside `h3d-authz-fixture-seed.sql` steps 2–7 under the table locks; precheck is evidence-only (`sql-static-check.mjs`: "precheck labelled evidence-only", "seed asserts the empty pre-seed baseline"). |
| F02 support delta / semantics unproven | HIGH | **Fixed** — in-txn count snapshot + exact `(2,2,2,1,1,2,2)` delta + full subscription + audit field assertions incl. `trial_ends_at = trial_started_at + 30d` and all-null `previous_*`/`idempotency_key`/`request_fingerprint`. Canonical semantics read from live `initialize_shop_subscription_internal`. |
| F03 teardown silent cascade | HIGH | **Fixed** — `catalog-manifest.mjs` derives the full shop-rooted graph; teardown locks every graph table, asserts zero non-fixture child rows before the first DELETE, deletes leaf-first by exact id, shop delete last must affect exactly 2. `sql-static-check`: "teardown asserts zero non-fixture child rows before first DELETE", "child-zero assertion precedes shop delete". |
| F04 immutable-audit maintenance lacks lock/control proofs | HIGH | **Fixed** — `ACCESS EXCLUSIVE` on `subscription_audit_log` acquired directly at the top of the lock phase; exact trigger OID + function + `tgenabled='O'` verified before disable; only the named trigger disabled; delete restricted to the exact manifest audit ids; re-enable + re-verify before COMMIT; `SET LOCAL lock_timeout='4s'` → timeout is `ON_ERROR_STOP` ROLLBACK. Two-session concurrency behaviour is designed + enumerated below (execution needs DML authorization). |
| F05 runner leaks Auth identities/grants | HIGH | **Fixed** — `Ledger` registers each resource at creation, `cleanupAll()` uses `Promise.allSettled`, one bounded verify retry, per-UUID `identityExists`/`grantExists` verification, redacted recovery file flushed on every register, residuals block the run verdict. No `process.exit` inside workflows (`--selftest`: "typed errors, no fail()+process.exit"). |
| F06 `--run` doesn't enforce state / mutates before discovery | HIGH | **Fixed** — `--run` requires `--authorize-run <RUN_AUTHORIZED receipt>`, a fresh `HOOK_ON_CONFIRMED` receipt (commit + catalog fingerprint), a `POST_SEED_VERIFIED` receipt whose fixture fingerprint still matches live discovery, and `assertLabTarget()` + `assertDbIdentity()` — all before the first `createIdentity`. |
| F07 AUTHZ probes PASS for the wrong error | HIGH | **Fixed** — `H3C_STRICT_H3D` classifier: PASS only on SQLSTATE `P0xxx` (verified live: the RPCs raise `P0001`) + the exact traced message (`/not linked to shop/`, `/Invalid pet selection for booking owner/`); every other status/code/branch = FAIL. POS-1/POS-2 must return 2xx with the exact fixture shape first. 15-case classifier matrix in `--selftest`. |
| F08 preflight boundary contradicts behaviour | HIGH | **Fixed** — `--preflight-readonly` is mechanically mutation-free (`--selftest`: "preflight-readonly performs no identity creation"); the hook probe is a separate `--preflight-hook-probe` mode needing `--authorize-hook-probe`. Operator Pack text no longer says "all read-only". |
| F09 `current_user='postgres'` brittle | MED | **Fixed** — seed + teardown assert `current_database()='postgres'`, `server_version_num >= 170000`, `pg_has_role('postgres','ps01_migrator','MEMBER')`; the runner asserts DB identity + external authorization receipts per phase. `postgres` retained as an additional assertion, not the sole control. |
| F10 fixture/evidence identity unstable | MED | **Fixed** — seed emits a manifest with exact fixture ids, generated subscription/audit ids, `txid_current()`, pre-seed counts, expected delta; `--verify-post-seed` records a `fixture_fingerprint`; `--run` STOPs on fingerprint drift vs `POST_SEED_VERIFIED`; teardown targets exact generated ids. Pre-seed inventory is captured in the same authorized window (`--reviewed` / seed manifest), historical baseline is reference only. |
| F11 unsafe error/body text + cleanup artifacts | MED | **Fixed** — `adminFetch` returns only a status + error class, never a body; strict POS-1/2 store a boolean shape map, not the response; `assertNoPii` (JWT / sb_secret / DB-URL / private-key / raw LINE id patterns) runs on every evidence write and receipt; temp snapshots + the tracked harness JSON are `Ledger`-registered and deleted in cleanup. |
| F12 trigger/FK completeness from a stale list | MED | **Fixed** — `catalog-manifest.mjs --verify` compares a fresh SELECT-only capture to the version-controlled `h3d-expected-catalog-manifest.json`; any new/removed/disabled trigger, changed function hash, changed FK delete action / deferrability, or new shop-rooted table is `STOP — CATALOG GRAPH CHANGED` (exit 3). The runner runs `--verify` at `--reviewed`, `--preflight-readonly`, and before `--run`; the seed re-asserts the six critical triggers inline. |

## Live SELECT-only proofs captured this pass

- RPC rejection SQLSTATE: `ps01.get_customer_booking_context_v2_internal` and `quote_customer_booking_v2_internal` raise **`P0001`** for their guard branches (used by the strict AUTHZ classifier).
- Catalog manifest fingerprint `001c2c21…` — 20 shop-rooted tables, 30 FK edges, 21 triggers; `subscription_audit_log <- shops` and `<- shop_subscriptions` both `ON DELETE CASCADE`; `commercial_packages('starter')` = room_limit 10 / pet_history_limit 300 (≫ the 1 room + 2 pets the fixture inserts).
- `catalog-manifest.mjs --verify` against the captured expected manifest → **no drift**.
- LAB still has 0 rows in `ps01.shops` / `pet_owners` / `pets` / `rooms` / `room_rate_plans`; `runtime_token_grants` = 0; `auth.users` = 5.

## Concurrency / failure-injection matrix (DESIGNED — execution needs fixture-DML authorization)

These §10 scenarios are enforced structurally now and must be executed in the
first authorized window before House considers a live-DML PASS:

1. seed collision inserted after the evidence precheck but before the seed lock → seed STOP, zero delta (the seed's step-6 exact-id assertion runs under `SHARE ROW EXCLUSIVE`).
2. concurrent INSERT/UPDATE/DELETE on each of the 7 controlled tables while the seed holds locks → contender blocks then `lock_timeout` on the contender; seed atomic.
3. concurrent `commercial_packages('starter')` UPDATE/DELETE → blocks on the seed's `FOR SHARE`, times out, cannot change seed semantics.
4. trigger missing / disabled / renamed / function hash changed → `catalog-manifest.mjs --verify` STOP, and the seed's inline trigger gate STOPs before the first INSERT.
5. injected error after each of the 8 inserts and after each trigger side effect → whole transaction ROLLBACK to the pre-seed signature (`\set ON_ERROR_STOP on`, single `BEGIN/COMMIT`).
6. duplicate / missing / wrong subscription or audit field → seed step 10/11 assertion ROLLBACK.
7. teardown with one unexpected row on each catalog child surface → teardown step-5 assertion STOP before the first DELETE, all rows preserved.
8. concurrent child insert after the teardown precheck → blocked by the `SHARE ROW EXCLUSIVE` / `ACCESS EXCLUSIVE` locks held to commit.
9. injected error before / during / after audit maintenance → data + trigger state restore exactly (transactional DDL rollback).
10. concurrent unrelated `subscription_audit_log` UPDATE/DELETE during maintenance → blocked by the `ACCESS EXCLUSIVE` lock; after commit the immutable trigger rejects it.
11. teardown exact-row mismatch or missing manifest → STOP without any DELETE.
12. runner: injected failure after runtime identity, before control identity; after each grant/token/snapshot/discovery; on child spawn / timeout / malformed evidence; during each cleanup call → every registered resource independently attempted, exact residuals reported, run FAILS.
13. `--run` without receipts / expired receipt / wrong commit-catalog-fixture hash / hook off / wrong project URL → zero mutations.
14. `SIGINT`/`SIGTERM` → the top-level handler exits 1 after the `finally` cleanup; abrupt `SIGKILL` is a documented manual-recovery case with the ledger IDs already flushed to disk before any mutation.

## §11 acceptance criteria

| # | Criterion | Status |
|---|---|---|
| 1 | all HIGH/MEDIUM findings implemented | **Met** — F01–F12 above |
| 2 | fresh SELECT-only catalog proof matches canonical shapes | **Met** — `catalog-manifest.mjs --verify` no drift; RPC SQLSTATE verified `P0001` |
| 3 | seed/teardown concurrency + failure-injection prove atomic rollback / bounded locks / exact semantics / no silent cascade / immutable-audit protection | **Structurally met + designed**; live execution is an explicit item for the first authorized window (matrix above) |
| 4 | runner tests prove zero residual owned identities/grants/files on every injectable failure and direct `--run` cannot bypass receipts | **Met** — ledger + `--selftest`; `--run` receipt enforcement |
| 5 | H3C probes cannot PASS from an unrelated error; positives return exact safe shape | **Met** — `H3C_STRICT_H3D` classifier + 2xx shape checks + 15-case matrix |
| 6 | Operator Pack: one owner / prerequisite / authorization boundary / recovery / evidence per transition | **Met** — §9 16-row table |
| 7 | evidence contains no secrets or PII, hash-linked to commit / catalog / fixture manifest / run id | **Met** — `assertNoPii` on every write; receipts carry commit + catalog + fixture fingerprints + `prev_receipt_sha256` |
| 8 | House + clean PS01 gates pass; diffs reviewed; parity reported | **Met** — see "Gates" |
| 9 | no seed/teardown/Auth/grant/hook/live run during implementation | **Met** — read-only only; `runtime_token_grants` 0, `auth.users` 5, `ps01.shops` 0 |

## Gates

| Gate | Command | Result |
|---|---|---|
| House offline suite | `npm run selftest` in `tools/shared-runtime` | PASS (h3c strict F07, h4, h3d runner, `h3d/tests.mjs` — catalog selftest + SQL static + drift scenarios) |
| SQL static | `node tools/shared-runtime/h3d/sql-static-check.mjs` | PASS |
| catalog verify | `catalog-manifest.mjs --verify h3d-expected-catalog-manifest.json` | no drift |
| PS01 (clean `4efee70` throwaway worktree) | focused H3D test, `tsc --noEmit`, `pnpm lint`, boundary verifier | PASS |
| secret / PII scan of the full diff | grep + `assertNoPii` self-tests | clean |
| `git diff --check` + diff review | only the H3D runner/harness/tools + 3 fixture SQL + catalog manifest + prep/final evidence + Operator Pack | confirmed |

## Remaining UNKNOWN / blockers

- **PostgREST HTTP status for `P0001`** — the strict classifier accepts `400/409/422` with a `P0xxx` code (matches the existing `inFunctionPgError` assumption proven in the H3C 36-probe PASS). If this PostgREST version returns `500` for `P0001`, the strict AUTHZ probe FAILs (safe direction) and the first authorized live run will surface it; the classifier would then need the reviewed 4xx→exact-code mapping. Recorded, not assumed away.
- **Two-session concurrency execution** — designed, not run (no DML authorization). Item 1 of the first authorized window.
- **Owner/House must issue the four external authorization receipts** (§9). The runner cannot.

## PS01

The final brief's canonical PS01 SQL source is `4efee70` (the H3D Data API adapter
commit). At brief-review time the PS01 worktree was dirty with pending test
evidence; the Owner (`Gutumrod`) committed that pending work themselves as
`c169e5d test(ps01): add booking v2 verification evidence` (21:11, additive test
docs + `tests/booking_v2_contract.test.ts` only — no change to the H3D adapter
code) and pushed it (`work/ps01-h3d-data-api-20260909` @ `c169e5d`, origin 0/0,
clean). This implementation lane did **not** touch, clean, or commit on the PS01
branch. PS01 gates were run from a throwaway detached `4efee70` worktree (removed
after) and PASS; `c169e5d` is a superset that only adds test material on top.
