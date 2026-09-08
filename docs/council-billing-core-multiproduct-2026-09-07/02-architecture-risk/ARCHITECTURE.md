# Architecture

## Recommended Architecture

WSTERA adopts a Central Billing Core with a Product Billing Profile Registry and a shared Stripe/provider path.

```text
Product server
  -> Central Billing API
  -> Authenticated request context
  -> Product Billing Profile Registry
  -> Billing operation policy
  -> Provider Adapter
  -> Stripe
```

Asynchronous correctness path:

```text
Provider event
  -> Webhook signature verification
  -> Durable event claim
  -> Outbox job
  -> Provider re-fetch
  -> Reconciliation
  -> Billing state transition
  -> Entitlement Adapter
  -> Product-owned entitlement state
```

## Authority Boundaries

Billing Core owns:

- Product Billing Profile Registry.
- Provider object mapping by environment.
- Billing API request validation.
- Stripe adapter and future bounded provider adapters.
- Durable webhook intake, outbox, retry, and reconciliation.
- Billing audit projection.

Products own:

- Product-specific account/tenant model.
- Business entitlement meaning.
- Feature state, quotas, local snapshots, and product UX.
- Domain-specific payment flows that are not WSTERA SaaS billing.

Provider owns:

- Payment/subscription object truth after re-fetch.
- Payment intent, invoice, subscription, refund, and customer objects.

## Core Invariants

- Runtime MUST NOT use mutable global `current_profile` or `active_product`.
- Product identity MUST be derived server-side from caller credential, not caller body.
- Account identity MUST be asserted and verified per route requirements.
- Provider Price IDs MUST be resolved server-side from active profile mappings.
- Metadata MAY route/correlate; metadata MUST NOT authorize money or entitlement truth.
- Browser redirects MUST NOT change billing or entitlement state without reconciliation.

## Decision Rationale

Centralization is the least risky path because it puts money correctness in one hardened core instead of repeating Stripe integrations per Product. The Product Billing Profile Registry keeps product commercial differences explicit without letting Products own competing subscription state machines.

This architecture supports subscriptions, free tiers, trials, one-time sales, and manual renewal without forcing all Products into the BK01 model or into a single monetization shape.

## Rejected Alternatives

- Per-product Stripe integrations: rejected because they duplicate money-correctness failure surfaces.
- Mutable global active profile: rejected because concurrent Product A/Product B operations can cross-route.
- Forced BK01 migration now: rejected by Owner decision and operational risk.
- PromptPay as automatic recurring subscription rail: rejected by Owner decision and Stripe PromptPay behavior.
- Billing-as-a-Service productization now: rejected as non-goal.

