# REVIEW — SB01 Phase 2B House/Sol R2 — 2026-09-12

Task ID: `SB01-PHASE-2B`
Workflow: `WF-DEV-01 v1.1.0`
Reviewer: `Sol / House`
Review Target: `2cfdfaea25278294d26f66ee88947e0407645402`
Returned Task Checkpoint: `ca3b9e28c898deabc99ae1f9b86dc3e7ed606d70`
Verdict: `REMEDIATE_SOURCE`
Phase 2C: `HOLD`
Control Plane Billing integration: `HOLD`

## Scope verified

The remediation commit is exactly one material commit ahead of the pinned remediation-dispatch state and changes only:
- `platform/runtime/src/db.ts`
- `platform/runtime/tests/outbox-lease-conflict.test.mjs`
- `docs/platform/billing-core/REPORT-CLAUDE-SB01-PHASE-2B-OUTBOX-LEASE-REMEDIATION-2026-09-12.md`

No Phase 2C source, migration/schema redesign, Control Plane billing implementation, LAB/provider mutation, merge, deploy, or release was included in the material remediation commit.

## Independent verification on exact remediation SHA

A detached House review worktree was created at exact SHA `2cfdfaea25278294d26f66ee88947e0407645402`:
`D:\AI-Workspace\runtime\reviews\sb01-phase2b-house-r2-2cfdfae`

Independent results:
- `git diff --check`: PASS
- runtime `npm run build`: PASS
- runtime `npm run typecheck`: PASS
- runtime `npm test`: 6/6 PASS
- Product Billing Profile Registry `npm test`: 16/16 PASS
- review worktree tracked status: clean
- target SHA and checkpoint SHA are both present on `origin/feature/central-billing-phase2-runtime`

Note: Profile Registry has no package lock in this revision, so `npm ci` is not applicable there. House installed its single dev dependency in the detached review worktree with `npm install --no-package-lock --ignore-scripts`; no tracked file was changed.

## Finding R2-F1 — HIGH / RELEASE BLOCKER

The new shared `OUTBOX_LEASE_PRESERVING_CONFLICT_SET` uses unqualified RHS column references inside `ON CONFLICT DO UPDATE`, including:
- `status`
- `lease_expires_at`
- `next_attempt_at`
- `lease_owner`

Both affected call sites embed that clause into an `INSERT ... ON CONFLICT (dedupe_key) DO UPDATE SET ...` statement.

PostgreSQL exposes both the existing target row and the proposed `excluded` row inside `ON CONFLICT DO UPDATE`. An unqualified RHS reference to a column that exists in both relations is ambiguous. PostgreSQL's own mailing-list example demonstrates `SET k=k+1` under `ON CONFLICT DO UPDATE` failing with `ERROR: column reference "k" is ambiguous`; the existing target row must be referenced through the target table name or an alias, while the proposed row is referenced through `excluded`.

Official references:
- https://www.postgresql.org/docs/18/sql-insert.html
- https://www.postgresql.org/message-id/CAMPa0rVHkdFe8_bog6Pt9Oa%3D7_LQkGDbR49sA_a043mE37G6dA%40mail.gmail.com

Therefore the remediation can compile and pass the pure decision-table tests while the actual duplicate-conflict SQL still fails at execution time. The exact code path under remediation is consequently not safe to accept as Phase 2B closure.

## Finding R2-F2 — MEDIUM / REGRESSION COVERAGE GAP

The new six-case regression suite calls only `resolveOutboxConflict`, a manually mirrored pure function. It does not execute `claimWebhookEvent`, `enqueueReconciliation`, or the actual shared SQL clause against PostgreSQL.

The remediation report correctly discloses that this is logic-level proof only. However, the dispatch required evidence that duplicate activity in both affected paths cannot clear an unexpired lease or make the job concurrently leaseable. Because the helper and SQL can diverge, the current suite cannot detect the SQL ambiguity in R2-F1 and does not satisfy that path-level proof strongly enough for closure.

## Required bounded remediation

Keep Task ID `SB01-PHASE-2B` and Workflow `WF-DEV-01 v1.1.0`.

Required source correction:
1. Give the outbox INSERT target a stable alias (recommended), or otherwise parameterize the shared clause with an explicit target-row qualifier.
2. Keep SET target columns on the LHS unqualified, but qualify existing-row references on the RHS through the target alias.
3. Preserve current intended semantics exactly: active unexpired `processing` lease remains intact; `dead_letter` remains fail-closed; expired/non-active states retain the existing recovery behavior.
4. Keep the fix bounded to the two duplicate-conflict paths and their regression/evidence.

Required proof for the next return:
- source-level proof that both actual call sites use the same qualified target-row conflict clause;
- regression that would fail if the SQL clause reverts to ambiguous/unqualified existing-row references;
- runtime build PASS;
- runtime typecheck PASS;
- runtime tests PASS;
- Profile Registry 16/16 PASS;
- `git diff --check` PASS;
- clean tracked status and remote parity;
- no Phase 2C, LAB/production, Stripe/provider, Control Plane billing, migration/schema, merge/deploy/release activity.

A disposable local PostgreSQL contract test is recommended for the next round if explicitly authorized, because it would exercise the actual `ON CONFLICT` statement without touching WSTERA LAB/production or provider systems.

## Decision

`SB01 PHASE 2B — REMEDIATE_SOURCE`

The active-lease design intent is correct, but exact remediation SHA `2cfdfaea25278294d26f66ee88947e0407645402` is not accepted for Phase 2B closure because the generated PostgreSQL conflict action can fail on ambiguous existing-row column references.

Phase 2C remains HOLD. No Council rerun is required; this is a bounded source/runtime correctness defect.

## Next allowed action

Update the canonical SB01 Task checkpoint to the R2 remediation state. Do not execute the next source remediation until a fresh bounded remediation brief/dispatch is issued under the existing workflow and Owner authorization is satisfied.