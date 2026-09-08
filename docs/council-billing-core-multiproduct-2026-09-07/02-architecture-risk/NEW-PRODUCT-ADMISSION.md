# New Product Admission

## Gate

Admission is fail-closed. A Product cannot use Billing Core for paid checkout until every required gate is complete.

## Procedure

```text
REGISTER PROFILE
  -> AUTHORIZE PRODUCT
  -> MAP ENVIRONMENT
  -> MAP STRIPE PRODUCT
  -> MAP STRIPE PRICE
  -> DEFINE ENTITLEMENT ADAPTER
  -> DEFINE RECONCILIATION POLICY
  -> DEFINE AUDIT PROJECTION
  -> RUN TEST SUITE
  -> PASS ISOLATION
  -> ACTIVATE PROFILE
```

## Required Gates

1. Canonical `product_id` exists.
2. Profile fields are complete for the requested billing model.
3. Product caller credential exists and is environment-bound.
4. Account-bound assertion mechanism is defined for routes that require it.
5. Return URL refs are server-side allowlisted.
6. Stripe Product mapping exists for paid Stripe rail in the target environment.
7. Stripe Price mapping exists for every paid active plan.
8. Entitlement Adapter contract is implemented or explicitly no-op for free-only phase.
9. Reconciliation policy can verify product/account/plan/amount/currency/billing period.
10. Webhook routing can identify product/account and fails closed on unknowns.
11. Redacted audit projection is defined.
12. Deterministic test identity is wired.
13. Webhook, reconciliation, entitlement, negative, and isolation tests pass.
14. Rollback/migration rule is written.
15. Profile activation is atomic.

## Activation Prohibitions

Activation MUST be impossible if any of these are incomplete:

- environment/provider mappings
- authorization bindings
- account-bound assertion where required
- reconciliation capability
- entitlement adapter contract
- tests
- audit controls
- profile rollback/migration rule

Runtime MUST NOT silently pick a partial profile, a stale profile, or a live mapping from test mode.

