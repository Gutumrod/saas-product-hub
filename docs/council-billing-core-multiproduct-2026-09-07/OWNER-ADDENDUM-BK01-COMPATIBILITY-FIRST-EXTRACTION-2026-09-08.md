# Owner Addendum — BK01 Compatibility-First Extraction

**Date:** 2026-09-08
**Status:** OWNER CLARIFICATION AFTER EXPERT STAGE
**Scope:** Billing Core Multi-Product Architecture Council only

## Governance note
`02-architecture-risk/COUNCIL-BRIEF.md` remains frozen and is not rewritten after expert fan-out. This addendum is a post-expert Owner clarification that must be incorporated by the independent synthesis as an explicit BK01 compatibility/migration target. It does not alter or erase any expert raw evidence.

The clarification is consistent with the frozen brief's existing requirement for a transitional BK01 exception/facade and eventual central product-facing entry contract. If the synthesizer finds any conflict with expert evidence, it must report the conflict rather than silently override it.

## Owner clarification
WSTERA must not treat BK01 as a permanently separate billing architecture. BK01 is exempt from forced migration now, but the new shared Billing Core must be designed so BK01 can later converge onto the same product-facing billing pattern safely.

Adopt the working strategy name:

**Compatibility-First Extraction**

Core rule:

> Build the shared Billing Core as a capability superset of the billing capabilities WSTERA actually needs from BK01, without making the Core depend on BK01-specific code, tables, identifiers, plans, or business rules.
## Verified BK01 capability baseline
Secretary inspection of the current BK01 repo confirms these capabilities exist as baseline behavior/evidence:
- Stripe Checkout route with server-side plan-to-Price resolution
- Stripe Customer Portal route bound to authenticated shop owner/account
- raw-body Stripe signature verification
- webhook event idempotency journal / claim
- provider re-fetch for material subscription events
- out-of-order protection before state overwrite
- subscription lifecycle handling including trial/active/past_due/cancel behavior
- atomic subscription state synchronization into BK01-owned entitlement state

Evidence paths inspected:
- `products/booking/docs/02_SYSTEM_ARCHITECTURE.md`
- `products/booking/docs/04_PRICING_ENTITLEMENTS.md`
- `products/booking/docs/technical/STRIPE_SUBSCRIPTION_STATE_MACHINE.md` (historical design evidence only where superseded by current SSOT)
- `products/booking/apps/booking-admin/src/app/api/billing/checkout/route.ts`
- `products/booking/apps/booking-admin/src/app/api/billing/portal/route.ts`
- `products/booking/apps/booking-admin/src/app/api/webhooks/stripe/route.ts`

## What the shared Core must add beyond BK01
Because BK01 was built for one Product, the shared Core must additionally provide:
1. request-scoped canonical Product identity and account/tenant binding
2. versioned Product Billing Profile Registry
3. environment-specific provider object mapping
4. cross-product isolation and spoofing prevention
5. generic Stripe Product/Price mapping contract per Product/Profile version
6. generic webhook routing and reconciliation across Products
7. generic Entitlement Adapter boundary while preserving Product-owned business state
8. new-Product admission gate and deterministic multi-Product Test Mode fixture
9. support for multiple billing models (`subscription`, `one_time`, `free`, later bounded manual renewal) rather than BK01 monthly-only assumptions
10. migration/rollback rules for profile and provider mapping changes

## BK01 migration target
BK01 migration is deliberately staged:
1. **Preserve** — existing BK01 billing remains authoritative while the shared Core is immature.
2. **Register** — create a BK01 Product Billing Profile without changing BK01 runtime behavior.
3. **Facade** — expose BK01 through the same central product-facing Billing API contract, delegating internally to the existing BK01 billing implementation.
4. **Parity / shadow proof** — compare identity, mapping, provider truth, reconciliation, entitlement result and failure behavior without changing customer money flow.
5. **Extract shared capabilities one at a time** — checkout/portal, webhook routing, reconciliation and shared provider mapping only after capability-level parity and rollback evidence pass.
6. **Retain Product-owned entitlement rules** — Booking-specific effects remain behind `BK01 Entitlement Adapter`; the Billing Core must not own booking business rules.
7. **Retire duplicated BK01 billing plumbing only after proof** — no big-bang rewrite.

## Permanent financial-domain separation
BK01 merchant/customer PromptPay deposits remain a Booking business-payment domain and are never merged into WSTERA SaaS subscription billing. A future shared payment utility may reuse bounded technical components only if financial ownership, accounting, authorization and state machines remain explicitly separate.
