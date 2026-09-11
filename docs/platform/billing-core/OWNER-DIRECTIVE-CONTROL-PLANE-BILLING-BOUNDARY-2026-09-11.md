# OWNER DIRECTIVE — Control Plane Billing Boundary

**Date:** 2026-09-11 (Asia/Bangkok)
**Status:** OWNER LOCKED / CANONICAL HOUSE AUTHORITY
**Owner:** WSTERA

## Decision

SB01 remains the single authoritative WSTERA Central Billing Core.

The WSTERA Control Plane is not authorized to implement a second payment/billing system. Its billing responsibility is limited to Owner-facing **read-only control and observability** over approved SB01 projections.

This directive binds House planning, SB01 integration work, and Control Plane work. A missing Control feature must not be solved by duplicating Billing Core logic in `hub-web`.

## Authority split

- **SB01:** billing execution, provider integration, webhook durability, reconciliation, billing state, profile/provider mapping and financial correctness.
- **Products:** Product-owned account/business entitlement semantics behind approved adapters.
- **Control Plane:** display/search/filter/health/audit/readiness views over SB01 read contracts only.

## Prohibited Control Plane scope

Control Plane must not own or implement:
- checkout/payment session creation;
- provider customer/subscription/payment/refund mutation;
- billing profile activation or provider mapping mutation;
- Stripe/provider secret handling or provider business logic;
- webhook processing, financial idempotency, outbox, retry/dead-letter or reconciliation;
- authoritative billing ledgers/state machines;
- billing-driven entitlement mutation;
- payment rail execution of any kind;
- direct financial mutation buttons/actions.

If SB01 does not yet expose the needed read data, the correct state is `unconfigured`/`degraded`/unavailable. The correct response is to extend the approved SB01 read contract—not to recreate billing inside Control Plane.

## Integration contract

Canonical dependency:

`Control Plane -> approved read-only SB01 projection -> SB01 Central Billing Core -> provider truth`

Control Plane may validate canonical Product identity and projection shape, but may not override financial truth or infer it independently.

The existing Control Plane invariant `canExecutePaymentActions: false` is part of this boundary and must remain true.

## Change control

This boundary may be changed only by a later explicit Owner directive committed as evidence. Until then, any Control Plane PR or brief that introduces payment mutation capability must be rejected as non-canonical.

Local enforcement copy is stored in the Control Plane repository under:
`docs/control-plane/OWNER-DIRECTIVE-BILLING-AUTHORITY-BOUNDARY-2026-09-11.md`
