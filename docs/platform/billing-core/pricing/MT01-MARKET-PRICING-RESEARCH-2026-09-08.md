# MT01 Market Pricing Research — 2026-09-08

Status: **RECOMMENDATION READY — Owner pricing lock pending**
Product: MT01 Multi-Tenant AI SaaS Starter Kit
Commercial model: one-time source purchase, single developer, perpetual purchased version + 12 months updates.

## Market snapshot

| Product | Current public price signal | Product shape vs MT01 |
|---|---:|---|
| Achromatic | USD 180 one-time | Full production-oriented Next.js SaaS kit; auth, billing, organizations, admin, tests; broader/turnkey than MT01. |
| ShipFast | about USD 199 entry | Full SaaS launch boilerplate; less multi-tenant depth but includes app/frontend launch surface MT01 does not ship. |
| AnotherWrapper | USD 249 Solo | AI SaaS full stack + 8 finished AI apps + auth/billing/DB/storage/analytics; materially more turnkey. |
| TurboStarter | USD 249 promo / USD 349 standard Core | Web + mobile + extension, multi-tenancy, billing, admin and deploy tooling; materially broader. |
| supastarter | USD 299 Solo | Full multi-tenant SaaS stack with organizations, billing, admin, storage, notifications and deployment workflow. |
| MakerKit | USD 349 Pro | Deep B2B multi-tenant full-stack SaaS foundation, billing gateway, teams/RBAC and ongoing updates. |

Primary market sources were checked on 2026-09-08 from vendor/current comparison pages; prices can change and must be rechecked before public listing.
## MT01 value position

What MT01 genuinely includes today:
- seven composable TypeScript backend modules;
- immutable per-request tenant context and quota/entitlement boundary;
- OpenAI / Anthropic / Gemini provider abstraction;
- Stripe payment module and webhook parsing/verification path;
- Supabase JWT/RBAC boundary;
- circuit breaker + lightweight tracing primitives;
- provider-agnostic webhook verification with Web Crypto portability;
- reference Express server, module contracts, security boundary and extension points;
- zero runtime dependencies inside the seven modules.

What MT01 does **not** include today:
- frontend/auth UI;
- persistent production database adapters/migrations;
- deployment/Docker/cloud setup;
- production secret management, rate limiting or hardened observability;
- complete production webhook/replay infrastructure;
- production-readiness guarantee.

Therefore MT01 should price below full-stack USD 180–349 competitors, but above commodity templates because it sells reusable backend architecture and source-level extension points rather than a page/theme bundle.
## Recommended price

**USD 149 one-time / single developer**.

Why USD 149:
- clearly below complete SaaS kits at USD 180–349, so the buyer is not charged as if MT01 were a turnkey full-stack product;
- high enough to reflect seven reusable backend modules, multi-tenant/security/payment boundaries and commercial client-work reuse;
- aligns with the Council-approved USD 149–199 posture without stretching to the top of the range before real buyer proof;
- easier impulse/ROI decision for agencies and advanced indie builders than USD 179–199;
- leaves room to increase a later materially broader release rather than overpricing V1.

Do **not** launch below USD 149 as a standing price. A lower permanent price would undercharge unlimited-project/client-work rights and 12 months of updates.

## Support boundary required to avoid unpaid services

USD 149 includes source delivery, documentation, defect clarification and released fixes/updates for 12 months. It must **not** imply custom integration, architecture consulting, buyer-specific database implementation, deployment work, provider credential setup, production incident response, or guaranteed response SLA. Those are separate paid services if offered later.

## Recommended commercial lock

MT01 V1 Solo Developer License = **USD 149 one-time**.
Purchased version: perpetual use in unlimited permitted projects/client work by that licensed developer.
Updates: 12 months included; not lifetime updates.
Refund: current 14-day limited-refund direction, subject to final legal review.
Team tier: none in V1.

This recommendation is pricing evidence only until Owner locks it as canonical and legal/license review is completed before public sale.
