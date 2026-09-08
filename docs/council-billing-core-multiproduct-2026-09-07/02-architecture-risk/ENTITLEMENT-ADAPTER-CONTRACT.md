# Entitlement Adapter Contract

## Boundary

Billing Core does not own Product business state. It emits audited billing transitions to a Product Entitlement Adapter. The Product applies those transitions to Product-owned state.

```text
Billing Core billing transition
  -> signed adapter message
  -> Product ingress or pull endpoint
  -> Product-owned entitlement state
  -> optional snapshot back to Billing Core
```

## Adapter Modes

`push`

Billing Core calls a narrow Product ingress for each state transition.

`pull`

Product queries Billing Core for entitlement projection and reconciles locally.

`snapshot`

Billing Core or Product maintains a bounded local snapshot with TTL/staleness rules.

## Required Controls

- signed ingress for push mode
- timestamp and replay window
- deterministic idempotency key per transition
- per-product signing key reference
- product/account/profile/environment binding in message
- allowlisted transition types
- local Product UNIQUE/idempotency enforcement
- TTL and fail-closed behavior for snapshots
- correlation ID across Billing Core, provider object, adapter delivery, and Product state

## Outage Semantics

Product outage:

- Billing Core records billing transition and retries delivery.
- Entitlement update is deferred.
- No duplicate grant; Product idempotency must hold.

Billing Core outage:

- Product uses last valid local state/snapshot according to TTL.
- Missing/expired paid snapshot fails closed unless product policy explicitly allows a bounded grace period.

Recovery:

- Reconciler re-fetches provider truth.
- Outbox redelivers missed transitions.
- Product compares local state against Billing Core projection and repairs drift.

## Product Examples

PS01:

- Merchant-paid recurring subscription.
- Use narrow signed transition ingress.
- Billing Core sends subscription lifecycle transitions only; Pawstia remains owner of shop/business entitlement state.

LK01:

- Free + recurring subscription direction.
- Use bounded local entitlement snapshot off redirect hot path.
- Expired/missing snapshot fails closed for paid features.

DC01:

- Free Public Pilot first.
- Future one-time unlock/license entitlement; not subscription V1.
- Preserve local-first product behavior.

Source-sale products:

- MT01/CM01 sale grants purchase/fulfillment/license/update entitlement.
- Do not model these as fake recurring subscriptions.

BK01:

- Facade/adapter first.
- Do not import BK01-specific `shop_id`, `shop_users`, Basic/Pro, Booking rules, or monthly-only assumptions into the generic adapter.

