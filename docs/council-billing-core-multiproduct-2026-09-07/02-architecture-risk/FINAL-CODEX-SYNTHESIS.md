# Final Codex Synthesis - WSTERA Billing Core Multi-Product Architecture

Round: 02 Architecture + Risk/Invariant

Final verdict: PASS

Confidence: 82/100

This PASS locks the architecture and contracts for a later Pre-Build/Implementation Gate audit. It does not authorize implementation, live Stripe keys, live charges, production deployment, paid infrastructure, or BK01 rewrite.

## Decision

Adopt:

```text
WSTERA Product server
  -> Central Billing API
  -> request-scoped canonical product_id + account_id + environment
  -> Product Billing Profile Registry
  -> Provider Adapter
  -> Stripe
```

Add the required correctness spine:

```text
Stripe webhook
  -> raw-body signature verification
  -> durable event claim + outbox
  -> product/account routing
  -> provider re-fetch + reconciliation
  -> monotonic state transition
  -> Product Entitlement Adapter
  -> Product-owned state
```

No mutable global `current_profile`, `active_product`, or "latest active profile" is allowed at runtime. Every request, webhook, scheduled job, and retry resolves profile identity from the request/event/job scope and environment.

## Consensus And Dissent

3/3 candidates support the central architecture, profile registry direction, request-scoped identity, shared Stripe path, durable webhook intake/outbox, reconciliation before entitlement transitions, Product-owned entitlement state, and no forced BK01 rewrite.

3/3 candidates reject per-product Stripe reintegration, mutable global profile state, caller-supplied Stripe Price authority, trusting redirects/webhook order/metadata as money truth, PromptPay as an automatic subscription state machine, and merging BK01 merchant/customer PromptPay deposits into WSTERA SaaS billing.

2/3 candidates proposed REMEDIATE because the canonical evidence did not yet contain a first-class multi-product profile registry and fail-closed admission harness. 1/3 proposed PASS because those contracts can be defined in this decision round and the missing runtime evidence belongs to later implementation gates.

Resolved decision: PASS, because this output pack supplies the missing architecture/risk contracts requested by the frozen brief. The dissent is real: implementation cannot start until these contracts are accepted as canonical and later gates produce evidence. The PASS is a contract-lock verdict, not a build/live authorization.

## BK01 Clarification Resolution

The post-expert Owner clarification is authoritative. BK01 is not the shared Billing Core and must not be forcibly rewritten now. Existing BK01 billing is a capability baseline/reference implementation. The shared Billing Core must become a capability superset of reusable BK01 SaaS billing capabilities plus multi-product capabilities BK01 never needed.

Generic contracts must not copy BK01 assumptions such as `shop_id`, `shop_users`, Basic/Pro packages, Booking entitlement rules, or monthly-only semantics. New Products use the shared core natively. BK01 converges later through a central facade/adapter first, then capability-by-capability extraction only after parity, isolation, reconciliation, rollback, and regression evidence pass.

BK01 merchant/customer PromptPay deposits are a separate financial domain and must never be merged into WSTERA SaaS subscription billing.

## Provider Facts Verified

Official Stripe docs checked during synthesis:

- Stripe webhook signature verification requires the raw request body and `Stripe-Signature`; parsing or mutating the body before verification can fail verification: https://docs.stripe.com/webhooks
- Stripe webhook endpoints can receive duplicate events; processed event IDs must be logged to avoid reprocessing: https://docs.stripe.com/webhooks
- Stripe provides a recovery path for undelivered events by listing recent undelivered events; automatic retries continue while an endpoint has not acknowledged them: https://docs.stripe.com/webhooks/process-undelivered-events
- Stripe Price amount changes require a new Price; old Prices are archived/inactivated for new use, not mutated in place: https://docs.stripe.com/products-prices/manage-prices and https://docs.stripe.com/products-prices/how-products-and-prices-work
- Stripe idempotency keys are bounded, retained at least 24 hours, and reused keys with different parameters error: https://docs.stripe.com/api/idempotent_requests
- PromptPay is Thailand-based, THB presentment, customer-initiated, QR/payment-app based; Checkout subscription mode is not supported for PromptPay and Subscriptions/Invoicing only support `send_invoice`: https://docs.stripe.com/payments/promptpay

## Source Drift

Because the synthesis boundary allowed only the five identity-safe inputs plus official Stripe docs, drift is recorded as identity-safe evidence from the frozen brief and candidates rather than by reopening raw project sources:

- The frozen brief reports stale DocCraft subscription language in `BILLING_CORE_PLAN.md`; current DC01 authority is Free Public Pilot first, later one-time unlock experiment.
- The frozen brief reports earlier plan language accepting two billing systems because BK01 was excluded; this synthesis resolves that as a transitional state with later facade-first convergence, not forced rewrite.
- Candidates independently report Phase 0.5 corrected the account-isolation claim: product credential alone is product-granularity authority, not account-bound isolation.
- Candidates independently report webhook intake is a transactional outbox/durable delivery obligation, not a presence-only event ledger.

## Output Pack

The remaining files in this pack define the canonical contracts:

- Architecture and rationale
- Product Billing Profile schema and lifecycle
- Billing API, Stripe mapping, metadata, webhook routing, reconciliation, entitlement adapter
- Test fixture and test/live configuration
- New Product admission and BK01 compatibility
- Security invariants, failure matrix, observability/audit
- Build sequence, acceptance matrix, non-goals, open Owner decisions

