# Build Sequence

## Decision

Adopt the candidate build sequence as-is. No reordering is justified by the identity-safe evidence.

```text
Existing Billing decisions
  -> Freeze architecture inputs
  -> Multi-Product Profile Contract
  -> Security/identity contract
  -> Stripe Test preflight
  -> Core Billing API
  -> Webhook durable intake
  -> Card recurring vertical slice
  -> Reconciliation
  -> PromptPay adapter
  -> Product #1 integration
  -> Product #2 isolation proof
  -> New-product admission harness
  -> Live-readiness gate
```

## Rationale

- Profile contract must precede implementation because it defines product, plan, rail, provider mapping, entitlement adapter, and admission gates.
- Security/identity must precede Stripe calls because product/account/environment binding is the core isolation control.
- Stripe Test preflight must precede Core API work that depends on provider behavior.
- Webhook durable intake must precede reliance on asynchronous provider events.
- Card recurring vertical slice should come before PromptPay because Stripe card subscription is the primary automatic recurring rail.
- Reconciliation must precede PromptPay adapter because PromptPay is manual and redirects/webhooks are not sufficient authority.
- Product #2 isolation proof must occur before declaring the multi-product pattern proven.
- Live-readiness is last and does not authorize live without Owner approval.

## Stop Gates

Stop before implementation if:

- contracts in this pack are not accepted as canonical
- Stripe Test preflight fails
- account-bound assertion design is unresolved for routes claiming account isolation
- profile activation cannot be made atomic
- webhook durable claim/outbox cannot be implemented
- reconciliation cannot verify expected amount/currency/product/account/plan/billing period
- entitlement adapter cannot be idempotent and signed
- Free-First policy would be violated by required infrastructure

