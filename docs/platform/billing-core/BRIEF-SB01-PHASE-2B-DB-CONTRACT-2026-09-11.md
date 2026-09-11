# BRIEF — SB01 Phase 2B Runtime DB Contract

**Date:** 2026-09-11 (Asia/Bangkok)
**Mode:** SB01 CENTRAL BILLING CORE / PHASE 2B
**Owner:** WSTERA / Free

## Workflow selection

- Workflow ID: `WF-DEV-01`
- Workflow Spec Version: `1.1.0`
- Reason: bounded implementation/remediation after Phase 2A compile-clean checkpoint
- Runtime Procedure: N/A
- Entry Conditions: `PASS`

## Canonical runtime target

- Repository: `Gutumrod/stripe-billing`
- Canonical remote branch: `feature/central-billing-phase2-runtime`
- PC worktree: `D:\AI-Workspace\runtime\worktrees\sb01-central-billing-20260909`
- Current verified HEAD at brief creation: `049b34aedf97b6b42ed97dae8d0c833513efee3c`
- Current local branch: `work/sb01-central-billing-pc-20260911`
- Working tree at brief creation: clean

## Source-of-truth

Read before execution:
1. House: `docs/platform/billing-core/BRIEF-SB01-WSTERA-CENTRAL-BILLING-CONTINUATION-2026-09-09.md`
2. House: `docs/platform/billing-core/CANONICAL-BILLING-SYSTEM-MAP-2026-09-09.md`
3. Runtime evidence: `platform/runtime/EVIDENCE-SB01-PHASE-2A-COMPILE-CLEAN-2026-09-11.md`
## Verified entry state

Phase 2A is closed at the current branch history:
- compile defects repaired in `3145757`
- PC handoff acceptance recorded in `049b34a`
- `npm run build` PASS
- `npm run typecheck` PASS
- profile registry regression `16/16 PASS`
- `git diff --check` PASS

Checkpoint entering this brief:
`SB01 PHASE 2A COMPILE CLEAN / READY FOR DB-CONTRACT REVIEW`

## Objective

Derive and prove the Phase 2 runtime database contract from the actual SB01 runtime calls and locked Council/House contracts, without widening into HTTP/Stripe/webhook work yet.

## Required scope

1. Inspect actual runtime persistence calls and current migration history.
2. Derive forward migration `0002` only from required runtime contracts.
3. Review tables, constraints, indexes, uniqueness/idempotency guarantees, FK behavior and authority boundaries.
4. Keep Product/account/environment isolation explicit and fail-closed.
5. Prepare rollback/cleanup procedure for every mutation introduced by this phase.
6. Use WSTERA LAB only when runtime application is authorized; never production.
7. Prove coexistence with existing shared-runtime schemas and no unauthorized cross-Product reach.
8. Capture catalog/migration evidence sufficient for independent review.
## Hard prohibitions

Do not:
- start Phase 2C HTTP/Stripe Test work;
- call live Stripe or use live credentials;
- mutate production databases;
- activate Product Billing Profiles;
- migrate BK01 billing;
- add PromptPay recurring billing;
- implement Control Plane payment mutation;
- redesign Council-locked architecture without source/runtime evidence of contradiction;
- hide schema/typing defects with unsafe casts or permissive grants.

## Verification required before checkpoint

- migration/static contract review against actual runtime calls
- relevant automated tests
- build/typecheck remain PASS
- `git diff --check` PASS
- no secret material in diff/evidence
- bounded diff reviewed against this brief
- LAB migration/catalog evidence if migration is applied
- rollback/cleanup proof documented
- branch parity recorded before machine change or handoff

## Stop conditions

Stop and return to House if evidence shows:
- required DB contract contradicts a locked architecture decision;
- isolation requires shared-schema authority not already approved;
- money/idempotency correctness cannot be represented safely by the current contract;
- production/live mutation would be required to continue.
## Required return contract

Return all of:
- exact commit SHA reviewed/executed
- migration/evidence paths
- tests/build/typecheck results
- LAB mutation status: applied / not applied
- rollback/cleanup status
- remaining defects/blockers
- explicit next-action recommendation

Allowed checkpoint verdicts:
- `SB01 PHASE 2B DB CONTRACT PASS / READY FOR PHASE 2C REVIEW`
- `SB01 PHASE 2B REMEDIATE`
- `SB01 ARCHITECTURE CONTRADICTION — HOUSE REVIEW REQUIRED`

Do not claim Central Billing Phase 2 PASS from Phase 2B alone.

## Next phase boundary

Phase 2C may start only after House reviews Phase 2B evidence and authorizes the HTTP + Stripe Test vertical slice.