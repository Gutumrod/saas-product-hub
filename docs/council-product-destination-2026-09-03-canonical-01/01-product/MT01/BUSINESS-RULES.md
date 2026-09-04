# MT01 Product Business Rules

## Scope rules

- MT01 is sold as source, not as a hosted service.
- Primary buyer is a developer, small technical team, indie builder, or agency building its own multi-tenant AI SaaS backend.
- Non-technical turnkey-app buyers are out of V1 target.
- Buyer owns runtime infrastructure, credentials, production persistence, deployment, frontend, and operations.
- The reference server may demonstrate production-adjacent flows but must be labeled demo/reference where it uses in-memory state.
- Claims must match shipped evidence.

## Module rules

- V1 includes seven modules: `tenant-context`, `auth-supabase`, `ai-provider`, `payment`, `subscription`, `enterprise-features`, and `webhook-receiver`.
- `webhook-receiver` must not be treated as a hidden dependency while the Stripe webhook reference path depends on it.
- Module provenance/version drift must be resolved or frozen with rationale before packaging. This is a Pre-Build item, not a Product Gate blocker.

## Claim rules

- Allowed claim: backend starter kit / source starter kit / reference architecture for multi-tenant AI SaaS.
- Allowed claim: includes a tested reference server demonstrating module composition.
- Allowed claim: includes Stripe webhook verification reference path through `webhook-receiver`.
- Allowed claim: includes interfaces/mock/in-memory reference persistence for demo composition.
- Allowed claim: includes demo/in-process tracing.
- Disallowed claim: production-ready SaaS.
- Disallowed claim in V1: production persistence adapter.
- Disallowed claim in V1: distributed tracing / OpenTelemetry support.
- Disallowed claim in V1: turnkey billing/subscription system safe for multi-instance production.

## Gate rules

- Product Gate may define artifact, buyer, scope, non-goals, and acceptance criteria.
- Product Gate must not decide pricing or license economics.
- Product Gate must not release packaging or mutate source code.
- Product Gate PASS requires WHAT / WHO / WHY / V1 to be understandable from canonical artifacts without guessing.

## Support and sale rules

- A one-time source product must have written license/IP, redistribution, support/update, packaging, and fulfillment boundaries before sale.
- Absence of those Launch/Operations items does not block Product Gate definition after the V1 product contract is locked.
