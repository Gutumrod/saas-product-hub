# MT01 Product Source of Truth

## Product identity

MT01 is a backend-only, self-hostable, versioned source starter kit for developers, small technical teams, and agencies building their own multi-tenant AI SaaS backend.

It is not:

- Hosted SaaS.
- A production-ready deployed application.
- A frontend/auth UI product.
- A reference server sold alone.
- A turnkey app for non-technical buyers.
- A pricing/license-economics decision.

## Buyer

Primary buyer: developer, small technical team, indie builder, or agency building its own AI SaaS backend.

Out of V1 target: non-technical business owner seeking a ready-to-run turnkey app.

Buyer must bring or build their own:

- Supabase or equivalent auth/storage infrastructure.
- AI provider credentials.
- Stripe account and webhook configuration.
- Production persistence adapter.
- Deployment, monitoring, operations, and frontend.

## Core promise

MT01 gives the buyer a source-code composition blueprint for multi-tenant AI SaaS foundations:

- Tenant context.
- Supabase-style auth/RBAC integration.
- AI provider abstraction.
- Subscription/entitlement logic.
- Payment and Stripe webhook handling.
- Enterprise helper features.
- Reference server wiring that demonstrates the loop.

## V1 module list

V1 includes seven modules:

- `tenant-context`
- `auth-supabase`
- `ai-provider`
- `payment`
- `subscription`
- `enterprise-features`
- `webhook-receiver`

`webhook-receiver` is included as the seventh V1 module because the current Stripe webhook reference path depends on it.

## V1 boundaries

- Persistence: interfaces/mock/in-memory reference persistence only.
- Observability: demo/in-process tracing only.
- Production persistence adapter: out of V1; deferred to Architecture/Build.
- OpenTelemetry/distributed tracing: out of V1 unless implemented and verified in a later gate.

## Current gate status

Product Gate verdict: PASS.

MT01 passes Product Gate because WHAT / WHO / WHY / V1 are now defined without requiring a fresh agent to guess. Sale, packaging, launch, architecture/build, and market decisions remain carried forward to later gates.
