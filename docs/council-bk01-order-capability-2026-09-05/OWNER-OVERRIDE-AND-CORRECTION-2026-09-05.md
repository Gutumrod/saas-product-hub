# OWNER OVERRIDE & CORRECTION — BK01 Order Capability

**Date:** 2026-09-05 (Asia/Bangkok)
**Authority:** Owner explicit decision; higher priority than council recommendation/reporting where they differ.
**Council run:** `council-bk01-order-capability-2026-09-05`
**Checkpoint basis:** parent `master @ 7b66b2f`

## Why this record exists

Hermes' owner-facing report was materially inconsistent in decision numbering and therefore unsafe to use as an approval reference. The council synthesis remains historical provenance, but this Owner record is the effective decision source for Phase 0.

Do not rewrite council history to imply the experts made these Owner decisions. Use this document as the superseding Owner layer.

## Reporting correction

Canonical decision numbering is D1–D12:

- D1 Phase 0 authorization
- D2 Product boundary
- D3 ICP / market scope
- D4 Document treatment
- D5 Reuse direction
- D6 Sequencing
- D7 Capability activation model
- D8 Order-linked Booking deposit policy
- D9 Order payment status boundary
- D10 Order-to-Booking link model
- D11 Prototype disposition
- D12 Claim/CM01 wording
## Effective Owner decisions

### D1 — Phase 0
APPROVED for documentation/governance only. `BUILD AUTHORIZATION: NO`.

### D2 — Product boundary
APPROVED. BK01 becomes a modular Business Portal foundation with independent Booking and Order capabilities. Booking remains the sole appointment/staff/time/collision authority.

### D3 — ICP / market scope
APPROVED as bounded expansion. Order may support SMB made-to-order, pre-order, production-to-ready, service+product and Order-only workflows. This does not authorize generic e-commerce, marketplace, POS, ERP or full retail platform scope.

### D4 — Document treatment
APPROVED. Use dated addenda/decisions. Supersede appointment-only framing only where necessary. Preserve historical locked contracts and council/prototype provenance.

### D5 — Reuse direction
APPROVED. Catalog = `USE + ADAPT` from canonical `modules-hub/modules/product-catalog` using copy-and-own provenance. Order lifecycle/capacity/ready-date/link = `MISSING CAPABILITY`. MT01 bootstrap check is applicable.

### D6 — Sequencing
Phase 0A/0B documentation may run in parallel with BK-A. Order implementation may not start merely because Phase 0 is complete; Codex release-plan constraints below also apply.
### D7 — Capability activation
APPROVED conceptually: `booking_enabled`, `order_enabled`, `claim_enabled`. Existing `shops/shop_users/shop_id` remain the tenancy boundary. Disabling a capability stops new intake but preserves history.

### D8 — Order-linked Booking deposit
Booking remains authoritative. Order must not auto-waive, auto-merge or silently settle Booking deposits. A linked Booking follows the Booking-side service/policy; Order payment remains a separate state domain.

### D9 — Order payment status
APPROVED as product-local operational state only, e.g. `UNPAID/PARTIALLY_PAID/PAID/REFUNDED`. It is not a payment engine, billing-core replacement, subscription state machine or cross-module settlement engine.

### D10 — Order-to-Booking link
Phase 0B shall lock a many-to-many-capable relationship, READY-only creation rule, create/cancel/rebook/unlink/audit semantics, and independent lifecycles. Booking completion must not auto-complete Order.

### D11 — Prototype disposition
APPROVED: frozen exploration/visual evidence only. No direct promotion of prototype code to production.

### D12 — Claim / CM01 wording
Do not claim `CM01-owned lifecycle` unless runtime ownership is proven. Use a neutral future `Order -> link/launch -> Claim or Case capability owner` boundary. BK01 must not create a duplicate Claim lifecycle or an unapproved runtime dependency.

## Authorization boundary

Phase 0A/0B documentation is authorized. Production code, migrations, Supabase apply, deploy, merge, prototype feature work and silent edits to locked historical contracts remain unauthorized.
## Phase 0 completion — 2026-09-05

Owner-authorized Phase 0A/0B work is complete. Product Boundary and Order V1 Contract are LOCKED; formal Module Reuse Check is COMPLETE; Reuse Gate: PASS; MT01 Bootstrap Check PASS. This closes the bounded documentation track and returns the bounded slot. Order implementation remains unauthorized under D6/Codex sequencing.

Booking documentation checkpoint: 82b297d (docs(booking): lock Order phase0 contract and reuse gate).
