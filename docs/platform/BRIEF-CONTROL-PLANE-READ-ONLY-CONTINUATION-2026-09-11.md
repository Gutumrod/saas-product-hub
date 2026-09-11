# BRIEF — WSTERA Control Plane Read-Only Continuation

**Date:** 2026-09-11 (Asia/Bangkok)
**Mode:** CONTROL PLANE / BILLING OBSERVABILITY / HOLD
**Owner:** WSTERA / Free

## Workflow selection

- Workflow ID: `WF-DEV-01`
- Workflow Spec Version: `1.1.0`
- Reason: future bounded Control Plane implementation after dependency is ready
- Runtime Procedure: N/A
- Entry Conditions: `HOLD`

No non-trivial implementation is authorized by this brief while Entry Conditions remain HOLD.

## Canonical target

- Repository: `Gutumrod/hub-web`
- Canonical branch: `feature/platform-control-plane`
- Remote HEAD verified from PC at brief creation: `125af8435f4c80b9525c72405b44807206905fc5`

Current branch history already contains:
- `7ddbbdf` — fail-closed Billing Core read adapter + targeted tests
- `d8711fa` — mobile navigation/horizontal-scroll UI fixes
- `89747ab` — apex deployment review brief
- `f986cd3` — Windows-to-Mac handoff
- `125af84` — read-only billing authority boundary

## Canonical authority

Read first:
`docs/platform/billing-core/OWNER-DIRECTIVE-CONTROL-PLANE-BILLING-BOUNDARY-2026-09-11.md`
## Locked role

Control Plane is an Owner-facing control/observation surface, not a payment system.

Allowed billing-related responsibility:
- consume approved read-only SB01 projections;
- display subscription/payment status;
- display plan/profile version and period/cancel state;
- expose health/readiness/availability/degraded state;
- provide audit/observability/search/filter surfaces.

Invariant:
`canExecutePaymentActions: false`

If authoritative SB01 data is missing, show `unconfigured`, `degraded` or unavailable. Never invent billing truth.

## Prohibited scope

Do not implement:
- Checkout or Customer Portal creation;
- create/cancel/refund subscription/payment mutation;
- Stripe/provider adapter business logic;
- provider secrets;
- webhook processing, ledger, outbox, retries or reconciliation;
- billing profile/provider mapping mutation;
- entitlement mutation;
- direct financial action buttons;
- a second billing state machine inside Control Plane.
## Current action

`HOLD FEATURE DEVELOPMENT`.

Primary dependency is SB01 Phase 2F: an approved authoritative read projection from Central Billing Core.

Until that exists, Control Plane should preserve its current branch and boundary. Do not manufacture temporary billing logic to keep UI moving.

## Re-entry conditions

Execution may resume when at least one is true:
1. House accepts SB01 Phase 2F read-contract evidence and authorizes Control integration; or
2. Owner issues a separate bounded Control-only task that does not depend on new billing truth.

Before any resumed implementation:
- verify a dedicated clean worktree from `origin/feature/platform-control-plane`;
- verify exact HEAD and upstream parity;
- do not reuse an unrelated storefront branch/worktree as the execution baseline;
- create a new task checkpoint/dispatch for the bounded scope.

## Expected next integration scope after SB01 2F

Map approved SB01 read projection into the existing Control adapter, then expose truthful Owner-facing state only.

Required verification will include:
- targeted adapter tests;
- typecheck/build relevant to the change;
- fail-closed degraded/unavailable behavior;
- proof that payment mutation remains impossible;
- exact SHA and bounded diff review.
## Stop conditions

Return to House immediately if a requested Control feature would require:
- authoritative financial inference not exposed by SB01;
- provider secret access;
- payment/subscription mutation;
- billing DB writes;
- entitlement writes;
- duplication of SB01 webhook/reconciliation/state-machine logic.

## Required return state

While HOLD, report:
`CONTROL PLANE READ-ONLY HOLD / WAITING FOR SB01 PHASE 2F`

After an authorized integration round, return exact SHA, tests, evidence paths, remaining blockers and one of:
- `CONTROL READ PROJECTION PASS`
- `CONTROL READ PROJECTION REMEDIATE`
- `CONTROL BOUNDARY CONFLICT — HOUSE REVIEW REQUIRED`

Do not claim billing-system PASS from Control Plane evidence.