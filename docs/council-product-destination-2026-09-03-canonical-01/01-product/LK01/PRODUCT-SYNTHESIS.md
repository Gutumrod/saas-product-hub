# LK01 WSTERA Link - Product Gate Synthesis

Procedure: `llm-council-gate` v0.3.2  
Gate: Product Gate only  
Inputs: `COUNCIL-BRIEF.md`, `CANDIDATE-A.md`, `CANDIDATE-B.md`, `CANDIDATE-C.md`, `SYNTHESIS-MANIFEST.md`  
Experts completed: 3/3, no degraded run  
Gate verdict: **REMEDIATE**

## 1. Problem Understood

LK01 WSTERA Link is a Thai-first branded campaign-link and first-party outbound click-attribution SaaS for online sellers, creators/affiliate operators, agencies/social admins, and SMBs. The first primary segment is Thai online sellers publishing across Facebook, LINE, TikTok, Shopee/Lazada affiliate destinations, and printed QR materials.

The product is explicitly not a generic URL shortener. Its core value loop is:

1. Create a stable branded link and QR.
2. Publish it across social, marketplace, affiliate, chat, and printed channels.
3. See first-party outbound click attribution by source/campaign.
4. Change the destination later without replacing the public link or QR.

V1 ends at the smallest hot-path-safe product that proves this loop: multi-tenant link core, redirect edge, QR/stable URL behavior, minimal analytics, quota/metering, and tenant isolation. Paid feature expansion such as custom domains, campaign grouping, UTM builder, export, API/webhooks, and team access is not V1 core and belongs to later Phase 5 scope unless Owner changes scope through a formal decision.

Product Gate does not decide pricing, revenue, competition, GTM, architecture, risk gate, pre-build gate, Module Hub scan, portfolio arbitration, release, or implementation authorization.

## 2. Verified Facts

- Product identity is "branded campaign-link + first-party outbound click attribution SaaS", not a generic URL shortener. Agreement: 3/3.
- First primary user segment is Thai online sellers using Facebook, LINE, TikTok, Shopee/Lazada affiliate links, and printed/QR materials. Agreement: 3/3.
- Secondary served segments include creators/affiliate operators, agencies/social admins, and SMBs with the same core link/attribution need. Agreement: 3/3.
- Core pain is inability to repoint already-published links/QRs and inability to see first-party source attribution before traffic leaves owned channels. Agreement: 3/3.
- Core value loop is stable branded link/QR, tracked outbound click, source/campaign evidence, and destination switching without republishing. Agreement: 3/3.
- V1 must preserve redirect hot-path safety: analytics, billing, and dashboard failures must not block a resolvable redirect. Agreement: 3/3.
- Smallest coherent V1 product scope is Phases 1-3: auth/tenant/RLS, link core + redirect edge + stable QR, minimal analytics + quota. Agreement: 3/3.
- Billing/Phase 4 is not a product-owned Stripe state machine; LK01 must consume centralized billing-core and must not grant entitlement without verified provider truth. Agreement: 3/3.
- PromptPay release requires reconciliation before activation and must not be launched from browser success alone. Agreement: 3/3.
- Paid features such as custom domain, campaign grouping/UTM builder, CSV export, API/webhooks, and team access are not V1 core; they are Phase 5 unless Owner explicitly recuts scope. Agreement: 3/3.
- Minimum analytics for usefulness is tracked click totals, source/referrer/UTM attribution, recent trend/date range within plan limits, deterministic bot filtering, quota handling, and no unique-visitor claim. Agreement: 3/3.
- Raw IP persistence, fingerprinting, cross-device identity resolution, and ad-platform parity claims are out of scope for V1. Agreement: 3/3.
- Quota exhaustion must not break redirects; tracking can pause/drop while public links continue resolving. Agreement: 3/3.
- Vendored module presence is not proof of V1 necessity. Billing-related vendored modules are historical/reference after centralized billing-core. Agreement: 3/3.
- SU01 must not be revived as the product destination. Agreement: 3/3.
- Implementation is currently pre-build / on hold behind portfolio gates; Product Gate does not authorize code, schema, deployment, or Module Hub work. Agreement: 3/3.
- Locked commercial values are reported as input facts only: Free 0 THB, Pro 199 THB/month, Business 590 THB/month, with documented quotas/grace behavior. Agreement: 3/3.

## 3. Consensus / Majority / Dissent

Candidate confidence scores: A 78/100, B 88/100, C 78/100.

3/3 consensus:

- LK01 should be a branded campaign-link and first-party outbound click-attribution SaaS for Thai sellers/creators/agencies/SMBs.
- The first primary segment is Thai online sellers using multi-channel social, marketplace, affiliate, chat, and printed QR distribution.
- The product must not become a generic URL shortener, web analytics suite, ad-pixel replacement, link-in-bio product, marketing automation suite, A/B testing engine, identity-resolution product, or enterprise SSO product.
- V1 should prove the destination-switching and attribution loop while keeping redirect resolution independent from analytics and billing failures.
- The minimum useful analytics slice is source-attributed tracked clicks, trends/date range, deterministic bot filtering, and quota behavior without unique-visitor claims.
- Module Hub scan remains HOLD; vendored module presence does not create V1 product scope.
- PromptPay/billing correctness is a major unresolved preflight and must not be rushed into launch.

2/3 majority:

- V1 core should be treated primarily as Phases 1-3, with Phase 4 billing required for monetization but not for proving the free-tier core value loop. Agreement: 2/3. Candidate B framed Phases 0-4 as the V1 build core because billing is needed to sell it; A and C emphasized Phases 1-3 as the smallest hot-path-safe V1, with Phase 4 as monetization gate.
- Paid feature set should remain outside V1 core, but the first paid launch cut still needs Owner confirmation. Agreement: 2/3. Candidate B asserted Phase 5 is not V1 scope more strongly; A and C flagged the exact paid launch cut as an unresolved Owner decision.

1/3 emphasis-dissent:

- Candidate B emphasized repository HEAD/clean-tree/SU01 grep evidence more than the others. This is evidence detail, not a disagreement.
- Candidate C emphasized free-plan "1 lifetime destination change per link" as a decision worth revisiting before Build/Phase 5. This is a scope/monetization caution, not a contradiction of the locked baseline.
- Candidate A emphasized billing modules and platform plumbing classification in more detail. This is an implementation-boundary emphasis, not a different product conclusion.

## 4. Missing Evidence / Unresolved Questions

- Stripe Thailand / PromptPay preflight: eligible account, pinned API version, test card and PromptPay flows, reconciliation mechanics, idempotency, account/product/amount/currency matching. Agreement that unresolved: 3/3.
- V1 paid-launch feature cut: whether the first paid release includes only billing and higher limits or also any Phase 5 features such as custom domains, campaigns/UTM, export, API/webhooks, or team. Agreement that unresolved: 3/3.
- Custom-domain behavior: subdomain vs apex support, Cloudflare for SaaS current limits/pricing, TLS/DNS lifecycle, and whether apex is promised. Agreement that unresolved: 3/3.
- Bot-filter and abuse thresholds: crawler/bot signatures, false-positive tolerance, rate limits, moderation, unsafe destination rules, destination-edit abuse controls. Agreement that unresolved: 3/3.
- Retention/deletion policy: analytics detail vs aggregate retention, hidden vs deleted data after downgrade, audit/security record retention, deletion job semantics. Agreement that unresolved: 3/3.
- Redirect SLO: exact latency/availability budget is deferred to Beta measurement and not yet a build-time numeric promise. Agreement that unresolved: 3/3.
- Centralized billing-core contract: entitlement snapshot freshness, reconciliation interval, pending PromptPay UI state, replay/out-of-order event handling. Agreement that unresolved: 3/3.
- Beta success thresholds: activation, active tracked links, redirect success, analytics acceptance/drop rate, and paid beta exit thresholds are not numerically locked. Agreement that unresolved: 2/3.

## 5. Synthesizer Recommendation

Recommend **REMEDIATE** for Product Gate.

The product direction should be accepted as substantially converged: LK01 is a Thai-first branded campaign-link plus first-party attribution SaaS, with V1 bounded to the destination-switching/attribution loop and explicit non-goals. However, Product Gate should not be marked PASS yet because several Owner decisions are still required to convert the converged product definition into a build-approval-ready source of truth.

The remediation is documentation/decision remediation only:

- Lock the V1 paid-launch feature cut.
- Lock Stripe/PromptPay preflight status and the rule that PromptPay cannot launch without reconciliation.
- Lock custom-domain scope, especially apex behavior.
- Lock initial abuse/bot-filter thresholds or at least a Phase 2/3 acceptance placeholder with owner-approved tolerances.
- Lock retention/deletion policy for analytics and audit data.
- Lock whether redirect SLO remains Beta-measured or needs a provisional engineering target.

## 6. Why This Recommendation

PASS would overstate readiness because Product Gate is supposed to define what LK01 is, who it serves, and where V1 ends. The candidates agree on the product identity, but they also agree that unresolved decisions affect build boundaries and launch behavior. Those unresolved points are not implementation details only; they shape product promises visible to sellers.

BLOCK would be too strong because there is no material expert contradiction, no degraded run, and no evidence that the product concept should be abandoned or redirected. The missing work is finite and decision/documentation based.

REMEDIATE is the accurate middle verdict: accept the converged product thesis, require owner decisions before Product Gate can become build-approval evidence, and keep all non-product gates out of this artifact.

## 7. Rejected Alternatives + Why

- Rejected: Treat LK01 as a generic URL shortener. Reason: 3/3 experts found the locked product identity is stable branded campaign links plus attribution and destination switching, not commodity shortening.
- Rejected: Revive SU01 or treat SU01 as the destination. Reason: brief and manifest explicitly prohibit this, and 3/3 candidates aligned.
- Rejected: Make full web analytics, ad-platform parity, pixel replacement, or unique visitors part of V1. Reason: 3/3 candidates identify these as non-goals or prohibited claims.
- Rejected: Treat vendored billing/payment modules as Phase 4 source. Reason: 3/3 candidates report centralized billing-core as authoritative and billing modules as historical/reference.
- Rejected: Put custom domains, campaign/UTM builder, export, API/webhooks, and team into V1 core by default. Reason: 3/3 candidates place these in paid/Phase 5 scope unless Owner explicitly recuts.
- Rejected: Mark Product Gate PASS now. Reason: 3/3 candidates surface unresolved owner decisions that materially affect product boundary and launch truth.
- Rejected: Mark Product Gate BLOCK. Reason: the candidate set is highly convergent, with no expert-level contradiction that prevents remediation.

## 8. Gate Verdict + Blockers

Gate verdict: **REMEDIATE**

Build-approval blockers:

- OD-001: Owner must lock whether V1 build approval is Phases 1-3 only, or whether Phase 4 billing is included in "V1 build core" for paid launch language.
- OD-002: Owner must lock first paid-launch feature cut and confirm that Phase 5 paid features remain non-V1 unless separately authorized.
- OD-003: Owner must lock PromptPay/Stripe preflight requirement before any billing implementation is treated as launchable.
- OD-004: Owner must lock initial bot-filter/abuse-control acceptance boundaries for public redirect safety.
- OD-005: Owner must lock analytics retention/deletion policy enough for Product Pack and later security/privacy gates.

Launch blockers:

- PromptPay cannot launch until reconciliation against provider truth is implemented and verified.
- Custom domains cannot launch until Cloudflare for SaaS capability, limits, DNS/TLS lifecycle, and apex/subdomain promise are re-verified.
- Production launch cannot claim redirect SLO, analytics parity, unique visitors, identity resolution, or ad-platform replacement without evidence and ADR-level scope change.
- Production launch cannot proceed without tenant isolation/RLS, redirect hot-path safety, quota behavior, bot filtering, and retention/deletion behavior verified by later gates.

## 9. Confidence 0-100

**81/100**

Rationale: the product identity, primary segment, V1 core, non-goals, analytics minimum, and vendored-module boundary are strongly supported by 3/3 experts. Confidence is reduced because all evidence is documentation-based/pre-build, and multiple owner decisions remain unresolved before build approval or launch claims.

## 10. Technical Document Pack

- `D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\LK01\PRODUCT-SYNTHESIS.md`
- `D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\LK01\PRODUCT-SOURCE-OF-TRUTH.md`
- `D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\LK01\PRODUCT-SCOPE.md`
- `D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\LK01\USER-FLOWS.md`
- `D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\LK01\BUSINESS-RULES.md`
- `D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\LK01\V1-ACCEPTANCE-CRITERIA.md`
- `D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\LK01\OPEN-DECISIONS.md`
- `D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\LK01\01-PRODUCT-OWNER-BRIEF.md`

## 11. Thai OWNER-BRIEF Reference

`D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\LK01\01-PRODUCT-OWNER-BRIEF.md`
