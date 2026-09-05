# BK01 Order Phase 0 — Execution Plan

**Date:** 2026-09-05
**Execution authority:** Owner override D1–D12 + Codex `PORTFOLIO_PRODUCTION_MASTER_PLAN.md`
**Track class:** BOUNDED documentation/governance track — COMPLETE / CLOSED
**Build authorization:** NO

## Objective

Close every decision and contract needed to make Order implementation safe to schedule later, without touching production code, migrations, runtime state or the frozen prototype.

## Phase 0A — Product Boundary Decision

Deliverables:

1. dated ADR/Owner Decision expanding BK01 from appointment-only framing to modular Booking + Order capability foundation;
2. bounded ICP definition: SMB made-to-order/pre-order/production-to-ready/service+product/Order-only; explicitly exclude generic commerce/POS/ERP/marketplace;
3. authority map: Booking vs Order vs future Claim/Case owner;
4. document map: supersede-in-part / addendum / preserve historical;
5. capability activation intent and history-preservation rule;
6. sequencing statement anchored to Codex focus gate and BK-A/B release hardening.

Exit: Owner-readable Phase 0A pack with no unresolved product-boundary contradiction.
## Phase 0B — Order V1 Contract + Reuse Gate

Deliverables:

1. Order lifecycle including pre-confirmation state decision;
2. immutable order-item snapshot contract;
3. production lead-time and single-target-day capacity semantics;
4. earliest/requested/scheduled/promised ready-date rules;
5. atomic capacity reservation/cancellation/reduction behavior;
6. local Order payment-status and slip-verification boundaries;
7. Booking-side deposit authority and no-auto-waive/no-auto-merge rule;
8. READY-only Order→Booking creation and many-to-many-capable link contract;
9. capability toggles, entitlement effects and disabled-history behavior;
10. public tracking-token, phone matching, RLS, authorization and audit contract;
11. failure/concurrency/idempotency/rollback acceptance criteria;
12. explicit V1 non-goals carried forward unchanged.

Reuse deliverables:

- formal Module Reuse Check;
- `product-catalog = USE + ADAPT` from canonical modules-hub source;
- immutable source commit/version/copy-date/local-change provenance plan;
- `Order lifecycle/capacity/ready-date/link = MISSING CAPABILITY` record;
- MT01 Bootstrap Check record;
- final `Reuse Gate: PASS / REMEDIATE / HOLD`.
## Cross-track coordination with Booking core

Order Phase 0 must never modify BK-A/B runtime files or migrations.

Booking heavy-track work continues independently:

`BK-A DB/runtime closure -> BK-B automated release gate -> deployment/external systems -> recovery/ops -> pilot/release decision`.

If Phase 0 finishes first, stop Order work at the gate and return the bounded slot. Do not start implementation automatically.

## Implementation entry rule

Default: wait for Booking V1 release/pilot Owner decision before Order implementation.

Earliest exception requires all of:

- BK-A closed;
- BK-B closed;
- Order Phase 0A/0B locked;
- Reuse Gate PASS;
- MT01 bootstrap record complete;
- isolated Order migration/branch baseline;
- explicit Owner written overlap/risk authorization.

## Final Phase 0 handoff

Return one Owner brief containing: locked decisions, remaining risks, reuse provenance, implementation blockers, exact files to amend/supersede, recommended first implementation phase, and explicit `BUILD AUTHORIZATION: YES/NO`.

Until a later Owner decision changes it: **BUILD AUTHORIZATION: NO**.
## Completion record — 2026-09-05

Phase 0A Product Boundary Decision: **LOCKED**.

Phase 0B Order V1 Contract: **LOCKED**.

Module Reuse Check: **COMPLETE**. Product Catalog v0.1.0 at cd88c570ab57f6976d15f85d09973d0cfbf0cd63 verified with 213/213 tests + typecheck PASS.

MT01 Bootstrap Check: **PASS**.

Reuse Gate: **PASS**.

Bounded slot: **RETURNED / FREE**. No next track is auto-dispatched.

Order implementation remains **NOT AUTHORIZED**.

Booking documentation checkpoint: 82b297d (docs(booking): lock Order phase0 contract and reuse gate).
