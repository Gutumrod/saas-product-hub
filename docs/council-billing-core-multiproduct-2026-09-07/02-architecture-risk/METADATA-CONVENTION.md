# Metadata Convention

## Allowed Stripe Metadata

Stripe metadata MAY include only routing and correlation hints:

```yaml
product_id: canonical WSTERA product id
product_code: stable product code
account_id: product-owned account or tenant reference
profile_version: billing profile version
environment: test | live
plan_id: profile plan id
checkout_attempt_id: deterministic checkout attempt id
test_run_id: deterministic test run id, test only
correlation_id: audit correlation id
```

## Prohibited Metadata Use

Metadata MUST NOT be treated as authority for:

- successful payment
- active subscription
- entitlement grant
- amount
- currency
- billing period
- refund state
- account ownership
- product authorization
- profile activation

Metadata is a routing hint. Money truth comes from provider re-fetch and reconciliation. Entitlement truth comes from the Product-owned state after an idempotent, audited entitlement adapter transition.

## PII And Logging

Metadata SHOULD avoid PII. Audit logs MUST store a redacted allowlisted projection, not raw provider payloads. Secrets, tokens, full raw webhooks, card data, customer email, and unnecessary Stripe objects MUST NOT be logged.

## Unknown Metadata

Unknown or absent `product_id` metadata on webhook events MUST result in:

- signature verified first
- event durably recorded as skipped or needs-review
- no guessed routing
- no state transition
- safe 2xx only after durable intake decision

