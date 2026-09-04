# MT01 V1 Acceptance Criteria

Product Gate verdict: PASS.

These criteria define V1 at Product Gate level. Later-gate evidence remains required before packaging, sale, launch, or production claims.

## Product contract

- Primary buyer is locked as developer / small technical team / agency building its own multi-tenant AI SaaS backend.
- Non-technical turnkey-app buyer is explicitly out of V1 target.
- V1 module list is locked at seven modules: `tenant-context`, `auth-supabase`, `ai-provider`, `payment`, `subscription`, `enterprise-features`, and `webhook-receiver`.
- V1 non-goals are explicitly documented.
- Buyer-owned responsibilities are explicit.

## V1 boundaries

- Persistence boundary is interfaces/mock/in-memory reference persistence only.
- Production persistence adapter is out of V1 and deferred to Architecture/Build.
- Observability boundary is demo/in-process tracing only.
- OpenTelemetry/distributed tracing is out of V1 unless implemented and verified in a later gate.

## Artifact expectations before buyer-ready release

- Source artifact has root README, setup guide, `.env.example`, changelog/version, and release manifest.
- License/IP and dependency/module redistribution evidence exist before sale.
- Module provenance/version pin exists for every shipped module before packaging.
- Any known drift from Canonical Module Hub is resolved or accepted with written rationale before packaging.

## Installability expectations before packaging/release

- Clean machine install is executed and recorded.
- Typecheck passes.
- Test suite passes.
- Reference server starts without seller-private secrets.
- Demo routes and documented setup path work from shipped instructions.

## Honesty of claims

- Documentation does not call MT01 a hosted SaaS.
- Documentation does not call the reference server production-ready.
- Documentation does not target non-technical turnkey-app buyers for V1.
- Documentation does not claim production persistence, frontend, deployment, OpenTelemetry, distributed tracing, or production multi-instance idempotency unless implemented and tested in a later gate.

## Buyer readiness carried forward

- Fulfillment path is tested before sale.
- Support/update boundary is documented before sale.
- Registry/catalog/brief/status language is reconciled with the final V1 contract before buyer-facing use.
