# Observability And Audit

## Required Audit Events

Billing Core MUST record redacted allowlisted audit events for:

- profile registration, validation, activation, suspension, deprecation, retirement
- checkout request accepted/rejected
- portal request accepted/rejected
- provider API call start/result without secrets/raw payload
- webhook signature verification result
- durable event claim result
- duplicate/out-of-order/skipped event result
- reconciliation comparison and repair
- entitlement adapter delivery, retry, dead-letter, recovery
- refund, cancellation, failed renewal, PromptPay expiry
- cross-product/cross-account denial
- live-key boot guard refusal

## Metrics

Minimum metrics:

- checkout requests by product/environment/status
- provider API latency/errors
- webhook intake rate
- invalid signature count
- duplicate event count
- outbox queue age
- retry attempts/exhaustion
- reconciliation drift count
- entitlement adapter success/failure
- entitlement snapshot age
- profile activation failures

## Alerts

Alert on:

- live-key boot guard refusal
- invalid-signature burst
- webhook endpoint not receiving events
- Stripe delivery failures or disabled endpoint
- outbox queue age above threshold
- retry exhaustion/dead-letter
- reconciliation drift
- wrong product/account/amount/currency attempts
- Product adapter outage
- missing/expired entitlement snapshots for paid accounts

## Logs

Logs MUST use correlation IDs and redacted projections. Do not log raw Stripe payloads, secrets, full customer data, card data, tokens, or unbounded provider errors.

## Operator Review

Dead-letter review MUST show enough safe data to decide recovery:

- correlation ID
- product_id
- account reference
- environment
- provider object refs
- expected vs actual amount/currency/plan/status
- retry history
- recommended recovery action

Operator actions must be audited.

