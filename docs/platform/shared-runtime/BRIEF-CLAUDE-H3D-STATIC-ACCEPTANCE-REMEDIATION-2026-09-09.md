# BRIEF — Claude H3D Static Acceptance Remediation

**Date:** 2026-09-09 (Asia/Bangkok)
**Mode:** WSTERA HOUSE / H3D STATIC ACCEPTANCE REMEDIATION ONLY
**Environment:** WSTERA LAB (`ykxlqnshaaxmzzocpjlj`) — SELECT-only verification allowed
**Status:** `STATIC ACCEPTANCE REMEDIATE / LIVE DML NOT AUTHORIZED`

## House acceptance verdict

Commit `5a2b545` is a major improvement and F01–F12 are substantially implemented, but it is **not yet accepted for the authorization window**.

Independent House review found four static/runtime-state defects plus one acceptance-gate issue. Fix them in one bounded pass. Do not seed/teardown LAB, create/delete Auth users, change runtime grants, toggle hooks, or run H3D live.

Current verified repository state:
- House `work/house-h3d-h5-20260909` @ `5a2b545`, clean, pushed `0/0`.
- PS01 `work/ps01-h3d-data-api-20260909` @ `c169e5d`, clean, pushed `0/0`; do not modify it in this pass.

Current SELECT-only LAB state verified by House: PS01 fixture/business/support counts = 0, `runtime_token_grants=0`, `auth.users=5`, `camera_access_audit=0`.
## Finding S1 — HIGH — worktree commit binding is broken

`houseCommit()` currently reads `HOUSE_ROOT/.git/HEAD`. This House checkout is a Git worktree: `.git` is a pointer file (`gitdir: .../.git/worktrees/house-h3d-h5-20260909`), not a directory.

Therefore the function falls through to `H3D_HOUSE_COMMIT` or `"unknown"`. This defeats the requirement that receipts and external authorization are bound to the actual checked-out commit.

### Required fix

Resolve the real commit from the repository itself, not a manually trusted env fallback. Preferred implementation: invoke `git -C HOUSE_ROOT rev-parse --verify HEAD` with bounded timeout and validate a full 40-hex SHA. A correctly parsed worktree gitdir is an acceptable equivalent.

`H3D_HOUSE_COMMIT` may be used only as a cross-check; mismatch with the resolved commit must STOP. `unknown` is never acceptable in any mutating/authorized state.

Add tests that run against the actual worktree shape and prove `houseCommit()` equals `git rev-parse HEAD`.
## Finding S2 — HIGH — `HOOK_ON_CONFIRMED` creates a dead-end receipt

`modePreflightHookProbe(... expect="on")` writes `HOOK_ON_CONFIRMED` with `commit` and token lifetime only.

`modeRun()` then validates that receipt with `receiptFresh(..., { commit, catalogFp })`. `receiptFresh()` requires `r.catalog_fingerprint === catalogFp` whenever `catalogFp` is supplied.

Result: a valid hook-on probe produces a receipt that cannot satisfy `--run`; the state machine dead-ends before live execution.

### Required fix

Bind `HOOK_ON_CONFIRMED` to the fresh verified catalog fingerprint and current fixture fingerprint. Include the POST_SEED receipt hash and current seed-manifest SHA-256 as supporting bindings.

Also harden `receiptFresh()`: if an expected `fixtureFp` or other required binding is supplied, absence of that field must FAIL rather than silently skip comparison.

Add an offline state-machine test that creates a synthetic valid receipt chain and proves `HOOK_ON_CONFIRMED -> RUN_AUTHORIZED -> --run pre-mutation gates` is reachable, while missing/stale/mismatched bindings STOP before mutation.
## Finding S3 — HIGH — receipt chain is not fully hash-linked

`STATE_ORDER` includes external authorization states (`FIXTURE_DML_AUTHORIZED`, `HOOK_PROBE_AUTHORIZED`, `RUN_AUTHORIZED`, `FIXTURE_TEARDOWN_AUTHORIZED`) and internal execution states, but external receipts are read from arbitrary files and are not recorded into the internal receipt chain.

`writeReceipt()` hashes only `receipt-<prevState>.json` if that internal file exists; for several transitions it therefore writes `prev_receipt_sha256=null`. The current implementation does not match the claimed durable hash-linked state machine.

### Required fix

The runner must never mint authorization, but when it consumes a valid external authorization file it must record a redacted internal `AUTHORIZATION_CONSUMED`/state marker containing the authorization file SHA-256, state, run_id, resolved House commit, project ref, expiry, and required catalog/fixture/manifest bindings.

Materialize the chain states that subsequent states depend on (`SEEDED` from verified seed manifest, authorization-consumed markers, hook-enable requested/confirmed evidence as appropriate). Every transition that claims a previous-state hash must have a non-null predecessor hash, except the first `REVIEWED` state.

Add a chain verifier selftest that detects missing predecessor files, null predecessor hashes, altered receipt files, wrong run_id, and out-of-order transitions.
## Finding S4 — HIGH — seed-manifest integrity is not enforced across run/teardown

`POST_SEED_VERIFIED` records `seed_manifest_sha256`, but `modeRun()` does not hash the current `H3D_SEED_MANIFEST` and compare it with that receipt before mutation. The teardown SQL accepts a manifest string and trusts fields such as `pre_seed_counts` without an independently enforced hash binding.

An altered manifest can therefore break the evidence/restoration chain even if business fixture IDs still rediscover correctly.

### Required fix

Before any hook probe/run mutation, hash the current seed-manifest bytes and require an exact match with the `POST_SEED_VERIFIED` binding.

For teardown, add a mechanically enforced pre-teardown verifier/wrapper that:
- validates the manifest SHA-256 against the accepted POST_SEED/RESTORE authorization chain;
- validates project/run/commit/catalog/fixture bindings;
- invokes psql with the already-verified manifest without a manual copy/edit step;
- STOPs if the file changes between verification and invocation (open once / hash same bytes / pass same bytes).

Do not rely on the operator visually comparing a hash.
## Finding S5 — MEDIUM/HIGH — known shop-scoped camera residue is outside seed/teardown assertions

Live catalog verification by House confirms `ps01.camera_access_audit` exists and has `shop_id UUID`, but no FK to `ps01.shops`. The catalog tool hardcodes it in the monitored table set, while seed/teardown omit it from accepted-empty baseline, locks, zero-child checks, and post-restoration residue checks.

Because there is no FK, deleting Shop A/B cannot remove such rows; they can survive teardown unnoticed.

### Required fix

Treat `camera_access_audit` as an explicit shop-scoped non-FK surface:
- seed atomic precondition: zero rows for fixture Shop A/B and baseline expectation recorded;
- teardown: lock it in the deterministic lock set and assert zero rows for fixture Shop A/B before first DELETE;
- restoration: assert fixture-shop rows remain zero after teardown and include its count/signature in restoration evidence.

`camera_rate_limit_buckets` has no `shop_id` and no FK in current LAB; document it as non-shop-scoped and do not pretend it is an FK child. Update catalog-manifest naming to distinguish FK-reachable tables from extra monitored surfaces so the manifest does not overstate graph reachability.
## Acceptance gate A1 — concurrency/failure-injection remains unexecuted

`tools/shared-runtime/h3d/tests.mjs` explicitly states that the transaction/concurrency/failure-injection matrix is designed but not executed because the implementation lane had no DML authorization.

This is correct behavior for the implementation lane, but it means the canonical acceptance criterion requiring proof of atomic rollback/locking/concurrency is **not satisfied yet**.

Do not fake this with regex/static tests and do not change the criterion. After S1–S5 are fixed and static acceptance passes, House will issue a separate narrowly bounded authorization for rollback-only/two-session validation before authorizing the real committed fixture seed.

That validation lane must not leave committed PS01 fixture rows, Auth identities, runtime grants, hook changes, or unrelated state.

## Evidence correction

The real catalog CLI syntax is:
`node tools/shared-runtime/h3d/catalog-manifest.mjs --verify <expected-manifest.json>`

The prior report omitted the required expected-manifest argument. Correct the evidence/report command. Runtime `verifyCatalog()` already supplies the expected path; this finding is documentation/evidence hygiene, not a runtime blocker.
## Allowed implementation scope

Claude may edit only:
- `tools/shared-runtime/h3d/h3d-live-runner.mjs` and H3D offline tests/tooling required by S1–S5;
- `docs/platform/shared-runtime/fixtures/h3d-authz-fixture-seed.sql`;
- `docs/platform/shared-runtime/fixtures/h3d-authz-fixture-teardown.sql`;
- catalog expected/tooling where needed to distinguish FK graph vs monitored non-FK surfaces;
- H3D evidence and Operator Pack sections required to make the corrected state machine executable.

Do not modify PS01 business/schema code. Do not touch H3E/H3F/H4/H5. Do not merge.

## Required verification before return

- `npm run selftest` PASS;
- `node h3d/sql-static-check.mjs` PASS;
- correct live catalog verify command PASS using SELECT-only DB access;
- new worktree-commit selftest PASS against the actual House worktree;
- new receipt-chain/dead-end tests PASS;
- manifest-hash tamper test PASS;
- camera_access_audit scope test PASS;
- `git diff --check`, secret/PII scan, exact diff review;
- SELECT-only LAB state remains unchanged: fixture/business/support rows 0, grants 0, auth users unchanged;
- House commit/push clean remote parity `0/0`; PS01 remains untouched.

Return only status:
`H3D STATIC ACCEPTANCE REMEDIATED / ROLLBACK-ONLY VALIDATION AUTHORIZATION AWAITING OWNER`

Do not claim H3D PASS or real fixture-DML readiness until the concurrency/failure-injection acceptance lane is executed and reviewed.
