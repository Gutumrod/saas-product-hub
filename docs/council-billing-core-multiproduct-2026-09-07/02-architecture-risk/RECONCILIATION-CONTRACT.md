# Reconciliation Contract

## Purpose

Reconciliation is the authority bridge between provider state, Billing Core state, and Product entitlement state. Webhooks and browser redirects are signals, not authority.

## Required Validation

Before any money-dependent billing or entitlement transition, Billing Core MUST re-fetch provider truth and verify:

- environment
- product_id
- account_id or mapped provider customer
- provider customer/subscription/payment object
- plan_id
- provider Price/Product mapping
- amount
- currency
- billing period
- payment/subscription status
- refund/cancellation/failed-renewal state
- profile_version or recoverable pinned mapping

## Covered Drift Cases

The reconciler MUST cover:

- missing webhook
- paid but no entitlement
- entitlement without valid payment
- refund
- cancellation
- failed renewal/card retry failure
- stale provider state
- stale profile
- stale Stripe Price
- wrong amount
- wrong currency
- wrong product
- wrong account
- PromptPay expiry
- drift repair after outage

## Cadence

Minimum policy:

- webhook-triggered reconciliation for money-affecting events
- scheduled sweep for recent provider changes
- daily full or bounded rolling sweep by default
- per-product override allowed by profile policy
- higher cadence for PromptPay expiry windows and dunning-sensitive products

Cadence is config, not code constant.

## Retry And Dead Letter

- Use bounded retries with exponential backoff and jitter.
- Every retry has a correlation ID.
- Ambiguous mismatch goes to dead-letter/operator review.
- Dead-letter records MUST include safe redacted facts: provider object refs, expected vs actual values, product/account refs, and attempted recovery.

## State Rules

- State transitions MUST be idempotent.
- Older state MUST NOT regress newer paid/cancelled/refunded state.
- `past_due`, `unpaid`, `canceled`, `refunded`, and `incomplete_expired` must not grant active paid entitlement unless product policy explicitly allows a still-valid grace period.
- Browser success redirect MUST only trigger polling/status UX; it MUST NOT grant entitlement.

## PromptPay

PromptPay is manual/user-initiated. It is not an automatic recurring rail. Stripe docs identify PromptPay as customer-initiated, THB presentment, and not supported by Checkout subscription mode. PromptPay renewal-like behavior must be modeled as manual renewal with expiry, reminders, provider re-fetch, and reconciliation before entitlement changes.

