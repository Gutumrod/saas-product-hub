# BK01 ORDER CAPABILITY — Proposal to Portfolio / Parent Governance

**Date:** 2026-09-05 (Asia/Bangkok)
**Product:** BK01 Booking
**Proposal type:** Product-boundary expansion / capability addition
**Status:** PROPOSED — prototype validated, production contract not yet authorized
**Disposition: APPROVE PHASE 0 — Owner accepted 2026-09-05; Phase 0A/0B now COMPLETE/LOCKED; Reuse Gate PASS; Order implementation remains unauthorized.**
**Effective decision record:** `docs/council-bk01-order-capability-2026-09-05/OWNER-OVERRIDE-AND-CORRECTION-2026-09-05.md`
**Owner intent:** expand BK01 from appointment-only operation into a modular business portal foundation while preserving Booking as an independent capability.

## Executive summary

BK01 currently has a locked V1 contract centered on appointment operations. During Owner review, a validated prototype was created to test a broader but still bounded direction: add an **Order capability** for pre-order / made-to-order businesses, then link finished orders into the existing Booking capability only when an appointment is actually required.

The proposed product shape is:

`Business Portal → Booking + Order + future Claim integration`

This is **not** a proposal to replace the Booking Engine, merge all workflows, or turn BK01 into ERP/POS/warehouse software.

The prototype is now frozen at:

- `prototypes/bk01-order-portal/index.html`
- `prototypes/bk01-order-portal/customer.html`
- lock record: `prototypes/bk01-order-portal/PROTOTYPE-LOCK-2026-09-05.md`

## What we are asking the parent portfolio to approve

Approve BK01 to proceed to a formal **Phase 0 Product Boundary + Order V1 Contract** that explicitly supersedes the appointment-only boundary where required, without silently rewriting historical locked documents.
## Proposed capability boundary

### Booking — remains authoritative for appointments

Booking owns:

- service appointment date/time
- staff availability and schedule
- working hours / break / holiday checks
- service duration
- appointment collision prevention
- booking lifecycle and booking-specific payment/deposit rules

Order must not create a second appointment scheduler.

### Order — new capability proposed

Order owns:

- product / made-to-order catalog
- immutable order line snapshots at confirmation
- order lifecycle: `DRAFT → CONFIRMED → IN_PROGRESS → READY → COMPLETED`, with cancellation rules to be locked
- order payment status kept separate from order lifecycle
- production lead days
- workshop production calendar
- daily production capacity
- capacity reservation
- earliest / requested / promised ready dates
- customer pre-order mobile flow

The core business rule is:

`Lead Time + Production Calendar + Available Capacity → earliest available ready date`
## Order â†” Booking relationship

When an Order reaches `READY` and requires installation or another in-person service:

`Order READY → Create Booking → existing Booking Engine checks availability → linked Booking`

Rules already validated in the frozen prototype:

- Order-linked Booking is allowed only when the Order is `READY`.
- It uses the same staff + time authority as a normal Booking.
- It cannot bypass, move or displace an existing Booking.
- Installation duration is explicit and may vary by job.
- The staff whose availability is checked must be the same staff persisted into the Booking.
- Order and Booking retain separate lifecycles.
- Completing a Booking does not automatically complete the Order.

A many-to-many link model should be evaluated in the formal contract rather than assuming one Order always has exactly one Booking.

## Customer-facing direction validated by prototype

Mobile-first customer flow:

`Select items → choose desired ready date → customer details → order deposit/slip → track order → if READY and installation required, create Booking`

Customer does not see raw production capacity units. The customer sees only whether a date is too early, closed, full, or available.

Phone number is used for tenant-local customer matching, not as an authentication credential. Order tracking should use an opaque recovery/access mechanism in the production contract.
## Proposed capability activation model

Conceptually each existing BK01 `shop` remains the tenant boundary. Do **not** rename the current `shops` / `shop_users` / `shop_id` implementation merely to use the word tenant.

The formal contract should evaluate a shop-level capability model such as:

- `booking_enabled`
- `order_enabled`
- `claim_enabled`

Expected behavior when a capability is disabled:

- stop new intake for that capability;
- keep historical records visible/manageable;
- never delete or hide business history merely because a capability toggle changed.

This allows a merchant to use Booking only, Order only, or both, while preserving the current BK01 tenancy/security foundation.

## Explicit non-goals for Order V1

Do not expand this proposal into:

- inventory / warehouse management
- suppliers / purchasing / purchase orders
- accounting / ERP / POS
- shipping carrier engine
- marketplace synchronization
- BOM / production routing
- worker workload optimization
- lift / bay / room / machine resource scheduling
- generic resource-booking engine
- automatic cross-module payment aggregation
- automatic Booking→Order completion

Claim/case handling remains outside Order V1. Future claim integration should reuse the CM01-owned lifecycle rather than duplicate it inside BK01.

## Platform / governance impact

This proposal is a material product capability addition, so production work must follow `AGENTS.md` mandatory pre-build governance before coding:

1. resolve the superseding BK01 product-boundary decision;
2. run the applicable MT01 bootstrap check;
3. run the Module Reuse Check;
4. resolve central-platform vs BK01 runtime ownership;
5. record reuse/provenance decisions;
6. require `Reuse Gate: PASS` before production implementation.

No prototype code should be promoted directly into production merely because the visual flow passed review.
## Recommended sequencing if approved

### Phase 0A — Product Boundary Decision

Create a dated Owner/architecture decision that formally allows BK01 to become a modular Business Portal foundation with independent Booking and Order capabilities.

### Phase 0B — Order V1 Contract

Lock domain terms, lifecycle, data model, capacity semantics, scheduler behavior, security/RLS, failure cases, audit requirements, acceptance criteria and non-goals.

### Pre-implementation baseline

Before new Order migrations are stacked onto BK01, reconcile or explicitly checkpoint the current BK-A remediation / DB-runtime baseline so later migration failures remain attributable.

### Build sequence

1. Order Core
2. Production Capacity
3. Booking integration
4. controlled real-shop pilot / copy-and-own where applicable
5. CM01 claim integration as a later capability link

## Prototype evidence

Independent verification on 2026-09-05:

- core scenarios Aâ€“H: **22/22 PASS**
- final edge/micro-remediation checks: **19/19 PASS**
- admin and customer prototype pages served successfully with HTTP 200
- prototype freeze hashes are recorded in `PROTOTYPE-LOCK-2026-09-05.md`

## Decision requested from parent governance

Choose one:

- **APPROVE PHASE 0:** allow BK01 Order capability to enter formal contract/gate work.
- **REMEDIATE PROPOSAL:** return specific boundary questions before Phase 0.
- **REJECT / DEFER:** retain BK01 as appointment-only and archive the Order prototype as exploration evidence.

Until an approval is recorded, this document authorizes **no production code, migration, deploy, remote DB change or replacement of existing locked BK01 contracts**.
