# MT01 Product Scope

## V1 in scope

- Packaged source artifact or repository access for buyer delivery.
- Backend-only reference composition.
- Express reference server as setup and integration proof.
- Seven V1 modules: `tenant-context`, `auth-supabase`, `ai-provider`, `payment`, `subscription`, `enterprise-features`, and `webhook-receiver`.
- Stripe webhook reference path through the included `webhook-receiver` module.
- Interfaces/mock/in-memory reference persistence only.
- Demo/in-process tracing only.
- Buyer setup guide and `.env.example`.
- Documentation of buyer-owned infrastructure, credentials, production persistence, deployment, frontend, operations, and hardening.

## V1 out of scope

- Hosted operation.
- Turnkey production SaaS.
- Non-technical turnkey-app buyer.
- Frontend/auth UI.
- Production database persistence adapter.
- Deployment pipeline or managed infrastructure.
- OpenTelemetry exporter or distributed tracing.
- Production-grade horizontal multi-instance idempotency.
- Pricing and license economics.
- Portfolio ranking or release arbitration.

## Carried forward

Launch/Operations before sale:

- License/IP and dependency redistribution evidence.
- Support/update boundary.
- Packaging/versioning and fulfillment path.

Pre-Build before packaging:

- Module provenance/version drift resolution or freeze rationale.
- Clean-install proof from shipped materials.

## Scope constraint

The V1 buyer artifact must match the code actually shipped. Because the reference Stripe webhook flow depends on `webhook-receiver`, V1 documentation and provenance must include it as the seventh module.
