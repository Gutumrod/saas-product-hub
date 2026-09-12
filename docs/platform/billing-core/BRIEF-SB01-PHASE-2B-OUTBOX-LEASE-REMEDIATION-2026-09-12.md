# BRIEF — SB01 Phase 2B Outbox Lease Remediation

Date: 2026-09-12 (Asia/Bangkok)
Mode: SB01 CENTRAL BILLING CORE / PHASE 2B REMEDIATION
Owner: WSTERA / Free

## Flow Selection

- Workflow ID: `WF-DEV-01`
- Workflow Spec Version: `1.1.0`
- Reason: bounded remediation from House/Sol review of Independent QA finding
- Runtime Procedure: N/A
- Entry Conditions: PASS after SB01 Task checkpoint is updated and a fresh remediation dispatch is created

## Review baseline

- Implementation target reviewed: `3f62fab6c97010bd5311684efc8d7e9d3eece475`
- Claude QA report: `1fbbffb1aed3f9c51d947f461e2d539f5eb6417a`
- Returned checkpoint: `8c9d8a576f8076299978b401806e7fcf826337c8`
- House disposition: `SB01 PHASE 2B REMEDIATE_SOURCE`

## Defect to fix

In `platform/runtime/src/db.ts`, duplicate-event/reconciliation enqueue conflict handling can reset an existing `processing` outbox job to `pending` and clear `lease_owner` / `lease_expires_at` while the lease is still active.

Affected logical paths identified by QA:
- `claimWebhookEvent`
- `enqueueReconciliation`

This can allow a second worker to lease the same logical job concurrently.

## Required invariant

If an outbox job is `processing` with an unexpired active lease, duplicate enqueue/event activity must not invalidate that lease or make the job immediately leaseable by another worker.

Normal completion/failure, legitimate lease expiry/recovery, and `dead_letter` behavior must remain correct and fail-closed.

## Allowed scope

- Modify only runtime logic/tests/documentation needed to close this race.
- Add a regression test that demonstrates the pre-fix failure mode and proves the post-fix invariant.
- Keep existing Phase 2B DB isolation/idempotency behavior intact.

## Prohibited

- No Phase 2C implementation.
- No LAB or production mutation.
- No Stripe/provider calls.
- No Product Billing Profile activation.
- No Control Plane billing work.
- No unrelated migration/schema redesign unless a schema blocker is proven and returned to House.

## Verification required

- Targeted outbox active-lease duplicate regression: PASS
- Runtime build: PASS
- Runtime typecheck: PASS
- Profile Registry regression: 16/16 PASS
- `git diff --check`: PASS
- final tracked git status: clean

## Execution route

Per `WF-DEV-01` v1.1.0, update Task checkpoint first, then create a fresh Claude remediation dispatch pinned to the exact reviewed baseline and this full defect contract. Do not reuse the Independent-QA dispatch.

Claude remediation must stop at `READY FOR HOUSE/SOL REVIEW R2` and return exact remediation SHA plus evidence. Phase 2C remains HOLD.