# MT01 Business / Market Document Pack

Date: 2026-09-04  
Gate: 01.5 Business / Market  
Verdict supported: PASS  

This file contains the concrete recommended Business/Market document pack for MT01. It does not modify product, pricing, license, package, checkout, or release artifacts outside this Business/Market run directory.

## BUSINESS-MODEL.md

```md
# MT01 Business Model

## Product

MT01 is a one-time commercial source product: a backend-only, framework-agnostic, copy-in Multi-Tenant AI SaaS Backend Kit.

## Primary Buyer

Primary beachhead: agencies / technical agencies building SaaS backends for clients.

Secondary buyer: advanced indie builders and small technical teams that need backend composition patterns for AI SaaS and already own or prefer their own frontend stack.

Not primary V1 buyer: non-technical SMEs. They buy outcomes, not source blueprints.

## Value Creation

MT01 helps buyers skip repeated foundation work:

- tenant context and isolation model
- Supabase-style auth/RBAC integration boundary
- AI provider abstraction
- payment/subscription/entitlement logic
- Stripe/webhook receiver patterns
- resilience primitives such as circuit breaker/tracing

## Revenue Model

One-time source license.

Recommended initial posture:

- single-developer license at USD 149-199
- no Team tier until demand evidence and packaging/support are ready
- no subscription unless a hosted service, update service, or support product is later created
- perpetual use of the purchased version plus 12 months of updates included

## Business Model Risk

The model depends on new-buyer acquisition and reputation. It does not create MRR by default. Support burden can erase margin if boundaries are unclear.

## Gate Status

Credible market: yes.

Commercial path: locked for Business/Market PASS.

Launch readiness: not approved by this gate; downstream blockers remain.
```

## MONETIZATION.md

```md
# MT01 Monetization

## Recommended Model

One-time source purchase.

## Initial Pricing Hypothesis

- Single developer: USD 149-199
- Team tier: do not open until demand evidence and packaging/support are ready

## Price Ceiling

Current V1 should not be priced in the $449-$649 full-stack band because it is backend-only and does not ship frontend/auth UI, production persistence, or deployment pipeline.

## Update Model Recommendation

Use the Owner-decided bounded update window.

Locked model:

- perpetual use of the purchased version
- 12 months of updates included
- no lifetime updates
- after 12 months, customer may continue using the purchased version
- future major-version/update entitlement may become a paid renewal/upgrade later
- exact renewal economics carry forward to Launch/Operations/Business iteration
- critical security fixes policy to be decided before sale

## Refund Posture

Locked posture: 14-day limited refund policy.

- before source access/download: refund per policy
- after source access/download: refund only for material defect or delivery materially differs from advertised scope and support cannot fix
- no blanket "no refund" policy
- final legal wording and jurisdiction compliance carry forward to Legal/Launch

## Support Recommendation

Support boundary must be explicit before sale.

Recommended default:

- support install and documented reference path only
- no free custom integration into buyer's frontend, Supabase project, Stripe account, or AI provider account
- paid implementation/support calls can become an upsell

## Gross Margin Assumption

Source-code products have high gross margin after merchant fees, but actual margin depends on support/refund load.
```

## COMPETITIVE-LANDSCAPE.md

```md
# MT01 Competitive Landscape

## Paid Competitor Set

Relevant paid comparables from candidate evidence:

- ShipFast
- Supastarter
- MakerKit
- SaaS Pegasus
- FastReact
- VibeReady
- Achromatic
- LaunchFast
- ZeroDrag
- Next.js Boilerplate Pro / SaaS Starter

Common pattern:

- one-time pricing
- source access
- developer/agency buyer
- tiers by seat, project count, or feature bundle
- explicit license and refund/update terms

## Free / Open-Source Floor

Relevant free/open-source substitutes from candidate evidence:

- nextjs/saas-starter
- Open SaaS
- T3/Epic Stack-style starters
- BoxyHQ
- Nextacular
- MakerKit Lite
- LastSaaS
- Vercel AI chatbot-style templates

Commercial implication:

MT01 cannot sell raw components as scarce. It must sell time saved, coherent composition, correctness, documentation, and a clear integration path.

## MT01 Differentiation

Potential differentiation:

- backend-only
- framework-agnostic
- copy-in modules rather than full app fork
- multi-tenant + AI + billing + entitlement + webhook + resilience composition

Risk:

The same differentiation narrows the market. Most proven paid competitors are full-stack because many starter-kit buyers want a complete app foundation.

## Competitive Positioning Constraint

Do not position current V1 as equivalent to full-stack production-ready competitors.

Position as:

"A backend composition kit for technical teams building multi-tenant AI SaaS on their own frontend."
```

## POSITIONING.md

```md
# MT01 Positioning

## Recommended Position

MT01 is a backend-only, framework-agnostic, copy-in Multi-Tenant AI SaaS Backend Kit for developers and agencies who already have their frontend stack.

## One-Sentence Positioning

MT01 gives technical builders a tested backend composition for multi-tenant AI SaaS foundations without forcing them into a full-stack template.

## Do Say

- backend-only
- source kit
- framework-agnostic
- copy-in modules
- reference server
- buyer-owned infrastructure
- designed for technical founders and agencies

## Do Not Say For Current V1

- full-stack starter kit
- production-ready full app
- drop-in hosted SaaS
- no-code product
- replacement for ShipFast/Supastarter/MakerKit/Pegasus

## Beachhead

Primary beachhead:

Agencies / technical agencies building SaaS backends for clients where multi-tenancy, entitlements, and AI-provider abstraction are needed early.

Secondary:

Advanced indie builders and small technical teams.

## Positioning Risk

If the messaging implies production-ready parity with full-stack kits, refund and reputation risk are high.
```

## CUSTOMER-VALUE-PROPOSITION.md

```md
# MT01 Customer Value Proposition

## Pain

Technical builders repeatedly lose days or weeks wiring the same SaaS backend foundations:

- tenant context
- auth/RBAC boundaries
- AI provider abstraction
- subscription and entitlement logic
- payment/webhook handling
- resilience and tracing patterns

These areas are error-prone, especially webhook idempotency, entitlement enforcement, tenant isolation, and provider failure handling.

## Capability

MT01 provides a source-code backend composition covering the core multi-tenant AI SaaS foundation, with modules that can be copied into an existing stack.

## Outcome

The buyer reaches differentiated product work faster instead of spending the first build cycle on generic foundation wiring.

## Business Value

The value is saved engineering time, reduced integration mistakes, and earlier validation of the buyer's own SaaS product.

## Reason To Pay

The buyer pays because a coherent, documented, tested composition is cheaper than assembling and hardening the same backend from scratch, even when many individual components are free.

## Required Proof Before Strong Claims

- clean-install evidence
- docs that match the locked seven-module scope
- explicit production/non-production persistence boundary
- support/update/refund policy
- license and provenance clearance
```

## PRICING-HYPOTHESES.md

```md
# MT01 Pricing Hypotheses

## Current Evidence

The paid starter-kit market supports one-time source products in the broad $149-$649 mainstream range, with higher team/agency tiers.

MT01's current V1 is backend-only and reference-oriented, so it should not assume full-stack competitor pricing.

## Hypothesis A - Reference Backend Kit

Single developer: USD 149-199

Use when:

- current backend-only scope remains
- production persistence is not included
- positioning is explicit that this is a backend composition/reference kit

## Deferred Hypothesis B - Team Tier

Team tier: not open for V1.

Consider only after:

- demand evidence exists
- clean-install proof exists
- documentation is polished
- packaging/support are ready
- support/update/refund boundaries are written
- license/provenance requirement is satisfied

Do not publish a Team tier in the initial Business/Market path.

## Hypothesis C - Production-Ready Premium Kit

Single/team price: $249-$349+

Use only after:

- production persistence adapter exists or the production boundary is strongly documented
- clean-install and compatibility matrix are verified
- buyer-facing package is complete
- market test supports willingness to pay

## Rejected For Current V1

$449-$649 full-stack premium positioning.

Reason: current V1 does not include frontend/auth UI, production persistence, deployment pipeline, or full-stack app experience.

## Validation Plan

Before launch:

- landing page with clear positioning and price
- waitlist or pre-order CTA
- 5-10 interviews with agencies/advanced indie builders
- optional refundable pre-sale at USD 149-199 before source access/download
- record objections around backend-only value, support expectations, and production-readiness assumptions
```

## MARKET-ASSUMPTIONS.md

```md
# MT01 Market Assumptions

## Confirmed By Candidate Consensus

- Developers buy one-time SaaS starter kits.
- One-time source purchase is the category norm.
- Technical buyers value time saved.
- Free/open-source alternatives are strong substitutes.
- MT01-specific demand is not proven.

## Assumptions To Validate

1. Backend-only is a purchase motive, not only a seller constraint.
2. Agencies will pay for copy-in modules without a complete frontend.
3. Advanced indie builders will pay $149-$199 for reference/backend composition.
4. Buyers understand and accept buyer-owned infrastructure.
5. Perpetual use plus 12 months of updates is acceptable versus lifetime updates.
6. Support boundaries can be strict without killing conversion.

## Risks

- Launch to silence because category demand does not transfer to MT01.
- Buyers compare MT01 to full-stack competitors and reject it as incomplete.
- Free/open-source alternatives compress willingness to pay.
- Support burden exceeds one-time revenue.
- License/provenance gaps delay or block sale.

## Business/Market PASS Status

PASS at document level after applying Owner decisions D1-D4.

Resolved for Business/Market:

- chosen beachhead payer: agency / technical agency first
- locked positioning: backend-only, framework-agnostic, copy-in backend kit
- pricing hypothesis: USD 149-199 single developer
- no Team tier until demand evidence and packaging/support are ready
- update model: perpetual use plus 12 months of updates; no lifetime updates
- refund posture: 14-day limited refund with source-access/download limitation

Carry-forward blockers:

- Pre-Build/Launch: license, module provenance, 6-vs-7 module documentation drift, clean-install proof, packaging/docs consistency
- Launch/Operations: fulfillment, checkout, release packaging, support capacity, future renewal/upgrade economics
- Legal/Launch: final license/refund wording, jurisdiction compliance, dependency redistribution terms

Remaining Business/Market risks, not blockers:

- MT01-specific demand is not yet proven
- backend-only willingness to pay remains a validation hypothesis
- distribution/channel evidence remains absent
```

## 01.5-BUSINESS-OWNER-BRIEF.md

The Thai owner brief has been created separately as `01.5-BUSINESS-OWNER-BRIEF.md` in this run directory.
