# MT01 Business / Market Gate — Independent Expert Raw Answer (AGY)

Gate: Business / Market Gate
Procedure: llm-council-gate v0.3.2
Product: MT01 Multi-Tenant AI Starter Kit
Date of analysis: 2026-09-04
Role: Independent expert (Business/Market). This is a raw evidence answer, NOT a gate verdict. Codex synthesizes the verdict.

---

## Recommendation

MT01 has a **credible but weak and currently unproven** one-time commercial source market. The buyer segment (developer / small technical team / agency building a multi-tenant AI SaaS backend) is real, evidenced, and actively paying for exactly this category of product at $99–$649 one-time. The build-vs-buy economics strongly favor a paid starter kit over DIY composition for a time-constrained technical buyer. However, MT01's locked V1 deliverable is materially weaker than every direct competitor at the same price point: it is backend-only, ships mock/in-memory persistence only, has no frontend/auth UI, no production persistence adapter, no deployment pipeline, and its reference server README still documents "6 modules" while the Product Gate locked 7. It also has **no LICENSE file at repo root** and no clean-install proof — both are hard prerequisites for a commercial source product. Recommendation: the market is credible enough to proceed to pricing/license design, but MT01 must NOT be priced or sold at the mid-market $199–$349 band until (a) the 7-module documentation drift is fixed, (b) a license/IP position and dependency-redistribution evidence exist, and (c) clean-install proof is produced. If sold as-is, it should be positioned as a low-cost reference/composition kit (roughly $49–$149) or bundled, not as a production-ready starter competing head-on with ShipFast/Supastarter/MakerKit.

---

## Verified facts / evidence used (with URL/source/date)

### Competitor pricing & licensing (current external evidence, retrieved 2026-09-04)

- **ShipFast** — $199 (Starter) / $249 (All-in) / $299 (Bundle), one-time, lifetime updates, unlimited projects, no refund once repo access granted. Source: shipfa.st (2026-09-04); dupple.com/reviews/shipfast (2026); toolmage.com/en/tool/shipfast (2026). Market leader, ~20K+ customers.
- **Supastarter** — $349–$1,499, one-time, Supabase-native, multi-tenancy, i18n, teams/RBAC. Source: boilerplatehub.com/detail/supastarter (2026); supastarter.dev (2026-09-04). Trusted by 1,400+ developers.
- **MakerKit** — $349 (Pro, 1 user) / $649 (Teams, 5 collaborators), lifetime, continuous updates, unlimited projects, Supabase-native stack. Source: makerkit.dev (2026-09-04).
- **LaunchFast** — $99–$249 one-time, multi-framework (Next.js/SvelteKit/Astro). Source: starterpick.com/compare/launchfast-vs-makerkit (2026); boilerplatehub.com/compare/makerkit-vs-launchfast (2026).
- **VibeReady** — $149 (AI Framework) / $399 (Full Kit), one-time, AI-agent SaaS starter. Source: vibeready.sh/ai-saas-boilerplate (updated August 2026).
- **ZeroDrag** — $119 (Starter) / $169 (Pro), one-time, lifetime. Source: zerodrag.cloud/blog/saas-boilerplate-vs-build-from-scratch (2026).
- **Free/open-source alternatives** — T3 Stack (26K GitHub stars), Epic Stack (13K), Open SaaS (8K), Nextacular (3K, multi-tenant subdomain routing). Source: starterpick.com/guides/state-of-saas-boilerplates-2026-market-map (2026).

### Market structure & build-vs-buy economics (current external evidence, 2026)

- SaaS boilerplate market: ~80 active products in 2026; 35% free/open-source, 40% in the $100–$299 band, 15% in $300–$499, 4% at $500+. Average mid-market price $199. Source: starterpick.com/guides/state-of-saas-boilerplates-2026-market-map (2026).
- Buyer mix: indie hackers ~40%, freelancers/agencies ~30%, startup founders ~20%, enterprise ~10%. Source: same market map (2026).
- Build-vs-buy: auth + Stripe alone = 2–6 days of setup; scratch build = 50–160 hours (junior 290–330h, senior 146–166h); a $299 boilerplate breaks even in ~2 hours at $150/hr. Source: starterpick.com/guides/saas-boilerplate-vs-scratch-cost-benefit-2026 (2026); zerodrag.cloud (2026); eden-stack.com/blog/build-vs-buy-saas-boilerplate (2026).
- AI-generated scaffolds: ~45% of AI-generated code carries security flaws; a generated scaffold needs 2–6 weeks of hardening vs a maintained kit. Source: boilerplatehub.com/blog/build-your-own-boilerplate (2026).
- AI integration is table stakes in 2026; 92% of SaaS companies shipped or plan an AI feature. AI-built SaaS market ~$142B in 2026, growing ~39%/yr. Source: saasgoodies.com/ai-saas-statistics (2026); coherentmarketinsights.com/industry-reports/ai-created-saas-market (2026).
- The $299 "impulse buy" threshold is a documented pricing psychology for this category. Source: starterpick.com market map (2026).

### MT01 repo state (verified on disk 2026-09-04)

- Repo: `D:\AI-Workspace\projects\saas-product-hub\products\multi-tenant-ai`, HEAD `92139cf`.
- Seven module directories present: `tenant-context`, `auth-supabase`, `ai-provider`, `payment`, `subscription`, `enterprise-features`, `webhook-receiver`.
- Reference server tests: **13/13 passing** (vitest, 2 test files), verified by running `npm test` (exit 0).
- `server/README.md` still states "all **6** Multi-Tenant AI Starter Kit modules" and "all 6 starter kit modules" — **documentation drift vs the locked 7-module V1** (Product Gate locked `webhook-receiver` as the 7th module).
- **No LICENSE file at repo root** (only third-party `node_modules` LICENSE files exist). No COPYING file.
- No clean-install proof, no packaging/versioning/fulfillment path, no support/update boundary documented in the repo.
- `docs/CURRENT_STATUS.md` (2026-09-02) states productization is "scheduled for portfolio P5" and "no current slot is assigned"; the reference server "remains a source-product reference with in-memory/demo boundaries, not a release artifact."

---

## Key reasons

1. **The payer segment is real and evidenced.** Indie builders, agencies, and small technical teams demonstrably pay $99–$649 one-time for SaaS starter kits (ShipFast ~20K customers, Supastarter 1,400+ devs, MakerKit, LaunchFast). MT01's locked buyer (developer / small technical team / agency building a multi-tenant AI SaaS backend) maps directly onto the largest two market segments (indie hackers 40% + freelancers/agencies 30%).

2. **Build-vs-buy economics favor a paid kit for the target buyer.** Auth + Stripe + multi-tenancy + AI provider abstraction + webhook handling is 2–6 days of setup or 50–160 hours of scratch work. At a $100–$150/hr developer rate, a $199–$349 kit breaks even in hours. The multi-tenant + billing + webhook composition is exactly the "integration-dense" category that AI-generated scaffolds handle worst (webhook idempotency, Stripe signature verification, replay protection are the failure-prone parts).

3. **The multi-tenant/AI/billing/resilience composition is a genuine differentiator in principle.** Most competitors (ShipFast, LaunchFast) do NOT ship multi-tenancy; only Supastarter and MakerKit do, and they charge $299–$649. MT01's seven-module composition (tenant-context, auth-supabase, ai-provider, payment, subscription, enterprise-features with CircuitBreaker, webhook-receiver with replay protection) is a defensible niche — but only if it is delivered as a working, documented, clean-installable composition.

4. **One-time license fits the category.** The entire competitive set uses one-time + lifetime-updates licensing. MT01's one-time source-product model is consistent with buyer expectations and avoids the maintenance/update revenue burden that would require a hosted or subscription operation MT01 is not set up to run.

5. **The market is growing and AI is table stakes.** AI-built SaaS is ~$142B and growing ~39%/yr; 92% of SaaS companies ship or plan AI features. A multi-tenant AI backend starter is well-timed.

---

## Risks / failure cases

1. **V1 deliverable is materially weaker than competitors at the same price.** MT01 V1 is backend-only, mock/in-memory persistence, no frontend/auth UI, no production persistence adapter, no deployment pipeline. ShipFast/Supastarter/MakerKit at $199–$649 ship production-ready full-stack foundations with real DB, auth UI, and deployment. A buyer comparing MT01 at $199–$349 against these will see a strictly inferior artifact. **This is the single largest commercial risk.**

2. **No LICENSE file at repo root.** A commercial source product with no license is unsellable as-is — buyers cannot legally use or redistribute it, and dependency-redistribution evidence is absent. This is a hard blocker for any sale, not a soft risk.

3. **Documentation drift (README says "6 modules", Product Gate locked 7).** This is exactly the kind of inconsistency that erodes buyer trust in a source product and was flagged as a Product Gate remediation item; it is still present in the actual repo.

4. **No clean-install proof.** The Product Gate carried this forward as a Pre-Build requirement. Without it, a buyer cannot be confident the kit installs and runs; a failed first install is fatal for a one-time-purchase product with no refund path.

5. **Free/open-source substitution.** T3 Stack (26K stars), Epic Stack, Open SaaS, and Nextacular (multi-tenant) are free and competitive on features. The paid-kit value proposition rests on support, documentation, and polish — none of which MT01 has demonstrated yet. A price-sensitive indie builder may choose free.

6. **AI-generated scaffold substitution.** A coding agent can scaffold auth/billing/multi-tenancy in an afternoon; the paid-kit edge is hardening and integration correctness. MT01's in-memory/mock boundaries mean it does NOT ship the hardened production integrations that justify the premium — it ships the reference, not the hardened version.

7. **Support/update/refund burden.** One-time source products carry an implicit expectation of lifetime updates (ShipFast, MakerKit advertise this). MT01 has no documented update cadence, support boundary, or refund policy. If buyers expect updates and none come, reputation and refund risk follow.

8. **Margin/IP/licensing risk.** No license means no defined margin/IP position. Third-party dependencies (Express, Supabase SDK, vitest, etc.) have their own licenses; redistribution evidence is absent. This is a carried-forward Launch/Operations item but is a genuine commercial risk.

---

## Assumptions

- The Product Gate locked definition (7 modules, backend-only, mock/in-memory persistence, buyer-owned infra) is the authoritative V1 scope and will not change.
- The target buyer is technical and can read/configure TypeScript, Supabase, Stripe, and AI provider credentials — per the locked definition, non-technical turnkey buyers are out of V1.
- Pricing/license economics are not yet decided; this analysis assesses market credibility, not a specific price.
- The repo I inspected (HEAD `92139cf`) is the intended sellable artifact; if packaging/clean-install work is done later, some risks (clean-install, license) may be resolved before sale.
- External market data (competitor pricing, market size) is current as of 2026-09-04 retrieval; pricing changes frequently in this category.

---

## Open questions / missing evidence

- **What is the intended price point?** The brief does not specify one. This materially changes the recommendation (a $49–$149 reference kit is credible; a $199–$349 production-competitive kit is not, given V1 boundaries).
- **What license will MT01 ship under?** No license exists. This is the single most important missing piece for a commercial source product.
- **Is there clean-install proof?** Not in the repo. Required before any buyer-ready release claim.
- **What is the support/update/refund boundary?** Undefined. Competitors advertise lifetime updates; MT01 has no stated policy.
- **What is the distribution/sales channel?** No evidence of a storefront, checkout, fulfillment, or versioning path.
- **Is the 7-module documentation drift fixed before sale?** Currently the README says 6 modules; the locked V1 is 7.
- **What is the dependency-redistribution / IP position?** Absent. Needed to price and license safely.
- **Demand validation:** No evidence of waitlist, pre-orders, or buyer interviews for MT01 specifically. Market demand for the category is strong, but MT01-specific demand is UNVERIFIED.

---

## Pain → Capability → Outcome → Business Value → Reason to Pay

- **Pain:** A developer/agency building a multi-tenant AI SaaS backend spends 2–6 days (or 50–160 hours) wiring auth, tenant isolation, AI provider abstraction, subscription/entitlement, Stripe billing, and webhook verification — the exact subsystems where bugs (webhook idempotency, signature verification, replay protection) are expensive and where AI-generated scaffolds fail most often.
- **Capability:** MT01 provides a source-code composition blueprint covering tenant context, Supabase auth/RBAC, AI provider abstraction, subscription/entitlement, Stripe payment + webhook handling, and enterprise resilience (CircuitBreaker, tracing), with a reference server proving the loop (13/13 tests passing).
- **Outcome:** The buyer skips the generic multi-tenant AI SaaS foundation work and reaches their differentiated product logic faster — days instead of weeks, with a vetted composition pattern rather than a first-draft scaffold.
- **Business Value:** At a $100–$150/hr developer rate, even 20–40 hours saved is $2,000–$6,000 of value; the kit pays for itself at any price up to several hundred dollars. Faster time-to-first-customer also compresses validation risk.
- **Reason to Pay:** The buyer pays for (a) the integration-dense composition that is hard to get right from scratch or from AI generation, and (b) the time saved to reach product differentiation. This reason is credible ONLY if the kit is clean-installable, documented, licensed, and matches its locked scope — none of which is currently proven.

---

## Confidence 0-100

**62/100**

Confidence is moderate. The market category, buyer segment, and build-vs-buy economics are strongly evidenced and current (high confidence). But MT01-specific commercial readiness is low: no license, no clean-install proof, documentation drift, no support/update/refund policy, no distribution path, and a V1 deliverable that is materially weaker than direct competitors at the same price. The market is credible; the product's current sellability is not. Confidence is capped because the pricing hypothesis and MT01-specific demand are UNVERIFIED and because the license/IP gap is unresolved.
