# Webhook Routing Contract

## Pipeline

```text
Stripe event
  -> read bounded raw body
  -> verify Stripe-Signature
  -> parse event
  -> durable event claim
  -> durable outbox job
  -> route by product/account hints
  -> provider re-fetch
  -> reconcile expected state
  -> monotonic transition
  -> entitlement adapter
```

## Intake Rules

- Raw body MUST be read before JSON parsing.
- Raw body MUST have a configured size cap.
- Stripe signature MUST be verified before parsing is trusted.
- Missing provider event ID MUST be recorded and skipped; it MUST NOT mutate state.
- Duplicate provider event ID MUST be acknowledged without reapplying state.
- A 2xx response is allowed only after durable event claim and durable retry/delivery obligation are persisted.

Official Stripe docs state that signature verification needs the raw request body and that webhook endpoints may receive duplicate events; this contract treats those as required controls.

## Durable Claim And Outbox

One database transaction SHOULD create:

- `processed_events` row keyed by provider + event_id
- normalized event envelope
- redacted audit projection
- `delivery_jobs` outbox row for reconciliation/adapter work

If the transaction fails, the endpoint MUST return non-2xx so Stripe retries.

## Routing

`metadata.product_id`, `metadata.account_id`, and `metadata.profile_version` are routing hints only. Routing must then be verified through provider re-fetch:

- Stripe Customer/Subscription/PaymentIntent must match Billing Core account mapping.
- Price/Product must match active or pinned profile mapping.
- amount, currency, plan, billing period, and environment must match expectations.

Unknown product/account is skipped or dead-lettered with audit; never guessed.

## Ordering

- Event-ID uniqueness handles identical duplicate events.
- Distinct out-of-order events are handled by provider re-fetch and monotonic state rules.
- Per-account order-sensitive transitions MUST serialize by `(environment, product_id, account_id)`.
- Older events MUST NOT overwrite newer provider state.

## Retry Ownership

Billing Core owns webhook retry/outbox processing:

- exponential backoff with jitter
- bounded max attempts
- lease/visibility timeout
- dead-letter state
- operator requeue with audit

