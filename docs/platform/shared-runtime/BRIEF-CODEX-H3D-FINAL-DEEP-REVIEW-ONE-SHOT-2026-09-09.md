# BRIEF — Codex H3D Final Deep Review / One-Shot Remediation Brief

**Date:** 2026-09-09 (Asia/Bangkok)
**Mode:** WSTERA HOUSE / INDEPENDENT CODEX REVIEW ONLY
**Environment under review:** WSTERA LAB (`ykxlqnshaaxmzzocpjlj`) only
**Execution authority:** READ / REVIEW / DESIGN ONLY. LIVE DML NOT AUTHORIZED.
**Current House status:** `REMEDIATE BEFORE LIVE DML / LIVE DML NOT AUTHORIZED`

## Mission

Perform a first-principles independent review of the entire H3D disposable AUTHZ fixture and live-gate design, then produce **one canonical final remediation brief** that can be handed to Claude for one implementation pass.

Do not implement the remediation yourself in this review lane. Do not edit the runner/SQL/package except for the final review/remediation brief you are asked to author.

The purpose is to stop iterative one-defect-at-a-time review. Find all material correctness, security, race, teardown, evidence, and operator-order defects now.
## Locked source state

House worktree:
`D:\AI-Workspace\runtime\worktrees\house-h3d-h5-20260909`
branch `work/house-h3d-h5-20260909`
review baseline `5118487` (brief-only commit on top of fixture package `7ddd4ed`), pushed `0/0`, clean before this Codex brief.

PS01 worktree:
`D:\AI-Workspace\runtime\worktrees\ps01-h3d-data-api-20260909`
branch `work/ps01-h3d-data-api-20260909` @ `4efee70`, pushed `0/0`, unchanged.

Do not trust status summaries. Inspect the actual files, git diff/history, canonical PS01 SQL, trigger/FK catalog evidence, H3C harness contract, and Operator Action Pack.
## Mandatory files to review

At minimum inspect:
- `tools/shared-runtime/h3d/h3d-live-runner.mjs`
- `tools/shared-runtime/h3c/h3c-proof-harness.mjs` + README/selftests
- `docs/platform/shared-runtime/fixtures/h3d-authz-fixture-precheck.sql`
- `docs/platform/shared-runtime/fixtures/h3d-authz-fixture-seed.sql`
- `docs/platform/shared-runtime/fixtures/h3d-authz-fixture-teardown.sql`
- `docs/platform/shared-runtime/evidence/H3D-DISPOSABLE-AUTHZ-FIXTURE-PREP-2026-09-09.md`
- `docs/platform/shared-runtime/OPERATOR-ACTION-PACK-H3D-TO-H5-2026-09-09.md`
- `BRIEF-CLAUDE-H3D-FIXTURE-ATOMIC-GUARD-REMEDIATION-2026-09-09.md`
- prior H3C live proof + H3C teardown precedent
- PS01 `supabase/shared-runtime/ps01-baseline.sql`

Trace the actual RPC bodies through `quote_customer_booking_v2_internal` → `resolve_booking_v2_quote_internal` → `assert_booking_window_available_internal`.
## Review dimension A — fixture semantic correctness

Verify every probe has the minimum real topology needed to prove the intended boundary and cannot PASS for the wrong reason.

Explicitly re-check:
- baseline Shop A / Owner A / LINE A / Pet A positive path;
- real Shop B not linked to LINE A for `POS-AUTHZ-1`;
- Owner B + Pet B in Shop A, Owner B != Owner A, for `POS-AUTHZ-3`;
- Room A + active RatePlan A are a real joined pair on `(shop_id, room_id)`;
- room capacity cannot become an earlier failure than foreign-pet ownership;
- no optional/default fixture variable can silently weaken required probes;
- `H3C_FIX_PET_IDS` / `OTHER_PET_IDS` cardinality and parsing match the harness exactly.

Identify any remaining false-positive or false-negative path.
## Review dimension B — seed atomicity / races / locks

Treat the separate SELECT precheck as evidence only. Determine what must be re-asserted atomically inside the seed transaction before the first INSERT.

Review:
- exact-ID collisions;
- synthetic-label collisions;
- accepted empty PS01 business/support baseline;
- starter package existence and expected package semantics;
- required trigger existence/enabled state;
- transaction isolation and table-lock strategy needed to close TOCTOU gaps;
- whether the chosen locks actually block conflicting INSERT/UPDATE/DELETE without unnecessarily freezing unrelated schemas/products;
- deterministic rerun behavior after partial/failed attempts;
- whether `current_user='postgres'` is a correct/portable execution requirement for the actual operator path.

Specify the least-privilege, bounded locking/precondition design and exact failure behavior.
## Review dimension C — trigger / support-row side effects

Independently trace every trigger fired by the 8 explicit fixture INSERTs and every trigger fired by teardown DELETEs.

Verify the package's claim that the only automatic support delta is exactly:
- `shop_subscriptions`: +2;
- `subscription_audit_log`: +2;
- everything else: +0.

Check expected subscription package/status/trial fields and audit action/source/fingerprint/idempotency behavior from the real trigger functions, not from docs.

Require the seed to fail/rollback if support rows are missing, duplicated, or semantically different from the expected initialization rows.

Look for hidden trigger effects, audit recursion, quota/commercial-gate behavior, timestamp-dependent semantics, or deferred constraints that could invalidate the package.
## Review dimension D — teardown safety / cascade graph

Build the actual current FK/trigger delete graph rooted at Shop A/B from live/canonical schema evidence.

The teardown must never use `ON DELETE CASCADE` as a silent garbage collector. Before the first DELETE, require an atomic assertion that every child surface under the two fixture shops is either:
- an exact expected fixture/support row; or
- zero rows.

Explicitly cover bookings, booking pets/requests, staff, daily reports, camera/sync surfaces, subscription/audit surfaces, and every other current FK child discovered from the catalog.

Determine whether explicit deletion of known leaves + final shop deletion is safe, or whether all expected child rows should be deleted explicitly.

Any unexpected child row must cause STOP/ROLLBACK before destructive DML.
## Review dimension E — teardown control restoration

Review the immutable-audit trigger maintenance sequence as a transaction-control problem, not only a row-delete problem.

Verify:
- trigger exists and begins enabled;
- only `trg_subscription_audit_immutable` is disabled;
- disable scope/duration is minimal;
- only the exact expected fixture audit rows can be deleted;
- the trigger is restored before COMMIT;
- any assertion/error after disable causes the transaction to restore both data and trigger state;
- no concurrent session can exploit the maintenance window to mutate unrelated audit rows.

If `ALTER TABLE ... DISABLE TRIGGER` creates unacceptable concurrency or lock semantics, prescribe a safer exact alternative.
## Review dimension F — H3D runner / preflight / live state machine

Review the full state machine, not only fixture discovery:
- seed exists before `--preflight`;
- fixture discovery happens before any hook-readiness probe mutation;
- `--preflight` itself creates/deletes an Auth identity + runtime grant once fixtures exist;
- hook inactive must produce a clean, fully torn-down `NOT READY` state;
- hook active preflight must also tear down its probe before `--run`;
- `--run` runtime/control identities, grant, expired token, active token, harness child-env handoff, and teardown are failure-safe on every throw/timeout branch.

Challenge whether preflight probe DML needs its own explicit authorization boundary after the fixture seed, and encode that boundary clearly if so.

Check that no token, password, DB URL, LINE id, or sensitive customer field reaches argv/stdout/evidence/git.
## Review dimension G — operator order / authorization boundaries

Audit the Operator Action Pack as an executable runbook. Every state transition must have exactly one owner and one prerequisite.

At minimum separate:
1. SELECT-only review/precheck;
2. explicit authorization for disposable fixture DML;
3. guarded seed;
4. post-seed read-only verification;
5. authorization, if required, for preflight identity/grant probe;
6. `--preflight` with hook still off;
7. operator hook enable;
8. `--preflight` confirms hook active;
9. `--run` live proof;
10. operator hook disable;
11. wait through residual token expiry where required;
12. fixture teardown;
13. inventory/signature comparison;
14. H3D closure decision.

Find ambiguous, contradictory, circular, or unsafe ordering and eliminate it in the final brief.
## Review dimension H — evidence and closure criteria

Define evidence that is sufficient to prove both success and restoration without exposing secrets or PII.

Require evidence for:
- pre-seed baseline and collision checks;
- atomic seed preconditions + post-seed exact topology/support delta;
- preflight discovery assertions;
- hook-off and hook-on token behavior;
- full required H3C probe verdicts;
- identity/grant teardown by exact UUID;
- hook disabled and residual token authority expired;
- fixture teardown preconditions and exact residue zero;
- trigger/control restoration;
- post-teardown inventory signature match.

Specify which failures are hard STOP versus retryable, and exactly what cleanup must occur before a retry.
## Known House findings are leads, not the review boundary

House has already identified these concerns:
- separate precheck is not an atomic seed guard;
- seed must assert exact support-row semantics/delta;
- teardown can hide unexpected child deletion behind `ON DELETE CASCADE`;
- immutable-audit maintenance needs concurrency/control-state scrutiny.

Do not merely confirm these four items. Attempt to falsify the entire design and find additional defects independently.

Review transaction failure paths, lock release, timeout behavior, concurrent writes, deferred triggers/constraints, reruns after partial operator action, stale evidence, stale branch state, and recovery after hook or runner failure.

If a claim cannot be proved from source/live read-only evidence, mark it UNKNOWN and make the final remediation brief require proof rather than assume it.
## Allowed verification

Allowed during Codex review:
- read all repo files/history/diffs;
- run offline selftests/static tests;
- run SELECT-only WSTERA LAB catalog/state queries if credentials/tooling are already available;
- inspect git status/parity;
- inspect current Supabase function/trigger/FK definitions read-only.

Forbidden:
- seed or teardown DML;
- Auth identity creation/deletion;
- runtime grant INSERT/DELETE;
- hook enable/disable;
- schema/ACL/grant/RLS changes;
- H3E/H3F/H4/H5 execution;
- implementation edits beyond the single final review/remediation brief.
## Required single deliverable

Create exactly one canonical file:
`docs/platform/shared-runtime/BRIEF-CLAUDE-H3D-FINAL-ONE-SHOT-REMEDIATION-2026-09-09.md`

That file must contain:
- independent verdict (`PASS FOR IMPLEMENTATION` or `REMEDIATE REVIEW DESIGN FIRST`);
- complete findings, severity, source evidence, and why each matters;
- exact implementation changes required by file/function/SQL phase;
- transaction/locking/trigger/cascade design requirements;
- exact state-machine/operator order;
- exact tests, negative tests, failure-injection cases, and acceptance criteria;
- exact STOP/recovery rules;
- required evidence and final authorization boundary.

It must supersede piecemeal H3D remediation instructions for the next Claude implementation pass.
## Quality bar

Do not accept “tests green” as sufficient. Every claimed invariant must be tied to the actual runtime path and failure mode it protects.

Prefer fail-closed behavior over convenience. Do not weaken required H3C probes, waive cross-tenant evidence, or use nonexistent/random identifiers as authorization proof.

Do not introduce broad locks, trigger disabling, or schema changes merely to simplify the fixture.

The final brief must be implementable in one bounded Claude pass without requiring another architecture decision from House unless Codex discovers a genuinely new hard blocker.

## Git policy

Commit and push **only** the single Codex-produced canonical remediation brief on the current isolated House branch. Do not modify implementation files.

Report final brief full path, commit SHA, clean status, and remote parity `0/0`.

End review with live status still:
`LIVE DML NOT AUTHORIZED / H3D NOT PASS / HOUSE-A CLOSED / BK01 QUARANTINED`.