# BRIEF — SB01 Phase 2B R2 SQL Qualification Remediation — 2026-09-12

Task ID: `SB01-PHASE-2B`
Workflow: `WF-DEV-01 v1.1.0`
Owner: `Free`
Commander: `Sol / House`
Assigned remediation role: `Claude`
Entry condition: `PASS — Owner authorized bounded remediation after House/Sol R2`
Phase 2C: `HOLD`
Control Plane Billing integration: `HOLD`

## Problem

House/Sol R2 reviewed exact remediation SHA `2cfdfaea25278294d26f66ee88947e0407645402` and returned `REMEDIATE_SOURCE`.

The active-lease design intent is correct, but `OUTBOX_LEASE_PRESERVING_CONFLICT_SET` uses unqualified existing-row column references on the RHS of `ON CONFLICT DO UPDATE`. PostgreSQL can resolve both target row and `excluded` row in that context, so references such as `status`, `lease_expires_at`, `next_attempt_at`, and `lease_owner` are ambiguous at runtime.

The current six-case regression suite exercises only the pure helper `resolveOutboxConflict`; it does not prove the actual SQL/call-site qualification contract and therefore failed to catch the runtime-validity defect.

## Source of Truth

Read in this order before editing:
1. `docs/tasks/TASK-SB01-PHASE-2B.md` in `Gutumrod/stripe-billing`.
2. House R2 review: `docs/platform/billing-core/REVIEW-SB01-PHASE-2B-HOUSE-SOL-R2-2026-09-12.md` at House commit `f9b05c9fbc2bf72d03d7a0d94c88259386c2a01c`.
3. This brief.
4. Previous remediation report: `docs/platform/billing-core/REPORT-CLAUDE-SB01-PHASE-2B-OUTBOX-LEASE-REMEDIATION-2026-09-12.md`.
5. Actual runtime source/tests on the pinned SB01 branch/revision.

Do not use chat history as source of truth.

## Objective

Close R2-F1 and R2-F2 in one bounded remediation round without changing the intended Phase 2B behavior.

Required end state:
- both duplicate-conflict paths generate unambiguous PostgreSQL `ON CONFLICT DO UPDATE` SQL;
- unexpired `processing` lease remains intact;
- `dead_letter` remains fail-closed;
- expired/non-active jobs retain the existing recovery behavior;
- regression coverage fails if existing-row RHS qualification is removed or either call site stops using the shared qualified clause.

## Allowed Scope

Allowed source/test changes only as necessary in:
- `platform/runtime/src/db.ts`
- `platform/runtime/tests/outbox-lease-conflict.test.mjs`
- additional narrowly scoped runtime test file only if required for actual SQL/call-site contract coverage
- one remediation evidence report under `docs/platform/billing-core/`

Recommended implementation shape:
- give each outbox `INSERT` target a stable explicit alias, e.g. `AS existing_job`;
- keep SET target columns on the LHS unqualified;
- qualify all existing-row RHS references through the target alias;
- keep one shared conflict clause used by both `claimWebhookEvent` and `enqueueReconciliation`.

This is a recommendation, not permission to redesign unrelated runtime code.

## Required Regression Contract

The next tests must prove more than the pure decision helper.

At minimum add source/runtime contract coverage that verifies:
1. the shared conflict clause references existing-row values through an explicit target qualifier;
2. both `claimWebhookEvent` and `enqueueReconciliation` use the same shared qualified conflict clause;
3. removing the target qualifier would make the regression fail;
4. active lease, dead-letter, expired lease, pending, failed, and completed decision semantics remain covered.

Do not claim executed-PostgreSQL proof unless an actual PostgreSQL statement is executed.

No LAB, production, Stripe/provider, or external DB mutation is authorized by this brief. A disposable local PostgreSQL mutation test is NOT authorized in this round unless Owner separately approves it.

## Required Verification

Before return:
- targeted R2 regression: PASS
- full runtime `npm test`: PASS
- runtime `npm run build`: PASS
- runtime `npm run typecheck`: PASS
- Product Billing Profile Registry `npm test`: 16/16 PASS
- `git diff --check`: PASS
- tracked git status clean after commit
- push complete and remote parity `0/0`

## Prohibited

- No Phase 2C implementation.
- No LAB/production mutation.
- No Stripe/provider calls.
- No Product Billing Profile activation/change.
- No Control Plane Billing implementation.
- No migration/schema redesign.
- No merge/release/deploy.
- No Council rerun.
- No reuse of the previous Claude remediation dispatch.
- No self-approval; Claude stops for House/Sol review.

## Required Return Contract

Return all of:
- exact remediation SHA;
- branch/worktree;
- exact changed files;
- exact targeted regression names/results;
- runtime build/typecheck/test results;
- Profile Registry result;
- `git diff --check` result;
- evidence/report path;
- blockers/limitations;
- deviations from brief/dispatch;
- final tracked git status;
- push/remote parity;
- actual stop checkpoint.

## Stop Condition

`READY FOR HOUSE/SOL REVIEW R3`

Phase 2C remains HOLD until House/Sol explicitly accepts Phase 2B closure.