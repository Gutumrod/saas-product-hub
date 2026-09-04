# LK01 — Product Gate Candidate C

_(anonymized candidate; identity withheld from synthesizer)_

---

# LK01 WSTERA Link — A Independent Expert Product Gate Answer

Procedure: `llm-council-gate` v0.3.2. Frozen brief read in full (COUNCIL-BRIEF.md). Independent analysis; no gate verdict, no pricing/competitive positioning, no revival of SU01, no code/schema/phase/deploy/module changes.

---

## Recommendation

WSTERA Link is a **branded campaign-link and first-party outbound click-attribution SaaS for Thai online sellers, creators, affiliate operators, and agencies** — explicitly *not* a generic URL shortener. Its durable identity is the three-part promise: **create a stable branded link, know which channel sends customers, and change the destination without re-publishing links or QR codes.**

First primary user segment: **Thai online sellers and creator/affiliate operators publishing affiliate links and QR materials on Facebook, LINE, TikTok, and Shopee/Lazada.** Their core pain is twofold and inseparable: (1) published short links and printed/displayed QR codes are fragile because destination changes force re-publication and break already-distributed materials; and (2) they cannot see first-party outbound click attribution before traffic leaves their owned channel, so they cannot decide where to spend effort without depending on ad-platform counters that they do not control.

V1 should be the **smallest hot-path-safe system that delivers the destination-switching/attribution value loop**: multi-tenant link core with versioned destination mutation, an edge redirect worker whose resolution is independent of analytics and billing failure, bounded campaign/click analytics sufficient to prove first value (a tracked click visible in a dashboard), and fail-closed tenancy and entitlement. Explicitly out of V1 (keep as non-goals): full web analytics, ad-platform/conversion-pixel replacement, link-in-bio builder, marketing automation, A/B testing, cross-device identity resolution, and enterprise SSO/SAML.

Where V1 ends: **before any custom-domain, campaign-grouping/UTM-builder, CSV-export, API/webhook, and team-access paid features (all Phase 5)**, and before PromptPay goes live without reconciliation. Implementation remains frozen at a pre-build state: **no production application code exists today.** When the portfolio's P0b and P1 shared-boundary/billing-contract gates are satisfied, LK01 enters Phase 0 (scaffold) — never code-before-gates.

---

## Verified facts / evidence used

Verified against the repo at `D:\AI-Workspace\projects\saas-product-hub\products\WSTERA-Link`, branch `docs/hybrid-billing-promptpay`, clean working tree, HEAD `ae7c474` ("docs: refresh LK01 gates after P0a closure"):

- **Repository is pre-build.** Top-level contains only `.git`, `.gitignore`, `docs/`, `docs-pre-sync-…`, `references/`, `vendor/`. There is **no `package.json`, no application source**; `CURRENT_STATUS.md` states verbatim "no production application code exists" and product is "pre-build".
- **Product identity (00_PRODUCT_VISION.md).** "branded campaign-link and click-analytics SaaS"; explicitly "not positioned as a generic URL shortener"; promise = stable branded link + know which channel sends customers + change destination without replacing published links/QR. Primary ICP = Thai sellers (Facebook, LINE, TikTok, Shopee/Lazada affiliate, QR), creators/affiliate ops needing first-party outbound click measurement, small businesses wanting branded links + simple attribution, agencies/social admins. Product principle: "Redirect reliability is more important than analytics completeness."
- **First value definition (06_UX_USER_FLOWS.md).** Activation = user creates first valid link; First Value = first tracked click appears in analytics. Activation flow: sign up → create tenant → create first link → copy link/QR → first tracked click → view analytics.
- **Analytics minimum (05_ANALYTICS_SPEC.md + FR-AN-*).** Tracked click = resolved redirect passing bot filter, accepted by ingestion; quota click = exactly one `click.tracked`; bot-filtered and quota-dropped events do not consume quota. V1 does not claim unique visitors/unique clicks. Precedence: explicit UTM source → normalized referrer source/hostname → Direct/None. Bot filtering is deterministic, versioned, never blocks redirect. Raw IP not persisted as analytics. No fingerprinting.
- **Quota (FR-Q / PRODUCT_DECISIONS).** Free = 5 active links, 250 tracked clicks/mo, 7-day analytics; Pro = ฿199/mo, 500 links, 50k clicks, 365-day analytics; Business = ฿590/mo, 5,000 links, 500k clicks, 730-day analytics. At limit, redirect continues; new eligible analytics dropped from customer analytics until reset/upgrade. Quota exhaustion never disables redirect.
- **Failure matrix & hot path (02_SYSTEM_ARCHITECTURE.md, NFR-REL-001, FR-REDIRECT-003).** Redirect path has **no synchronous analytics write dependency** and **never calls billing-core synchronously**; redirect uses a bounded local entitlement snapshot for control-plane feature enforcement; redirect availability is independent of billing availability. Supabase is authoritative source of truth; Cloudflare cache is optimization only.
- **Vendored modules (MODULE_PROVENANCE.md).** Ten modules vendored from `modules-hub` upstream HEAD `db441ce1…` on 2026-08-26: auth-supabase, tenant-context, subscription, payment, webhook-receiver, rate-limit, audit-log, config-runtime, health-check, import-export. **2026-09-02 billing disposition:** after portfolio locked centralized `billing-core`, the vendored `subscription`, `payment`, and `webhook-receiver` copies are **historical/reference provenance, not the Phase 4 build source.**
- **Billing architecture (02_SYSTEM_ARCHITECTURE.md, ADR-001, FR-BILL-007/008).** LK01 integrates with the portfolio **centralized billing-core**; it does not run a product-owned Stripe state machine and does not treat vendored payment/subscription modules as authoritative billing infrastructure. Card = automatic recurring rail; PromptPay = manual, user-initiated, non-auto-renew rail. **Reconciliation is mandatory before PromptPay activation** (provider truth re-fetched, product/account/amount/currency matched). Browser checkout success is never authoritative.
- **Grace policies.** Card auto-collection failure = 7-day recovery grace before Free enforcement; PromptPay non-renewal (LK01) = 3-day post-expiry grace before Free enforcement, account/history preserved; custom-domain paid→Free = 7-day routing grace; default-domain published links remain valid after grace even on overage.
- **Roadmap (07_DEVELOPMENT_ROADMAP.md).** Phase-gated (Phase 0 scaffold → 1 Auth/Tenant/RLS → 2 Link Core & Redirect → 3 Analytics & Quota → 4 Subscription & Billing → 5 Paid Product Features → 6 Hardening → 7 Beta/Launch). Each phase needs tests/evidence/independent gate; scope-changing discoveries require an ADR.
- **External dependencies (09_EXTERNAL_DEPENDENCIES.md, checked 2026-08-26).** Cloudflare for SaaS/custom hostnames confirmed available on non-Enterprise plans (limits can change; re-verify before Phase 5 and launch). Stripe Thailand supports card + PromptPay in THB (preflight: verify Thailand/PromptPay eligibility, pin Stripe API version, prove both test flows). Vendor capability is evidence, not immutable product truth.
- **Gate-state (CURRENT_STATUS.md).** P0a-C1 **PASS** at portfolio level; LK01 implementation on hold behind portfolio P0b repo-readiness and P1 shared-boundary/billing-contract gates; LK01 cannot close those shared gates by itself. Next authorized action = keep implementation on hold; Phase 0 intake only after P0b/P1 satisfied.

---

## Key reasons

1. **The differentiation is the stable-link-plus-attribution loop, not shortening.** Generic URL shortening commoditizes; the defensible identity is "published material survives destination change" coupled to "first-party channel attribution before you give up the visitor to Facebook/TikTok/LINE/Shopee/Lazada." This is the load-bearing product promise and should anchor all PRD/UX/roadmap decisions.

2. **Redirect reliability is the product's physical core and its trust boundary.** Because the product's purpose is that published links "just keep working," the redirect hot path must be isolated from analytics and billing failure — this is both the #1 product principle and a non-functional requirement (NFR-REL-001, FR-REDIRECT-003). Getting this wrong converts a branding/attribution tool into a source of broken customer links. This is the strongest reason the small, hot-path-safe V1 shape is correct.

3. **First value must be provable inside V1.** The entire value proposition reduces to "a tracked click appears in the dashboard." Without the analytics minimum (tracked clicks by link/source over a bounded range, no unique-visitor claims, deterministic bot filter, quota accounting), the product cannot demonstrate any differentiation. Analytics is therefore V1-necessary, but only the minimal slice.

4. **Tenancy and entitlement must fail closed from day one.** Cross-tenant read/write/export/inference must fail (FR-TENANT-003, RLS on every tenant-owned table NFR-SEC-001). For a multi-tenant SaaS whose value is attribution data, tenant isolation is a hard product requirement, not polish.

5. **Vending a module is not proof of V1 necessity.** Provenance shows `sub/payment/webhook-receiver` are explicitly **de-authoritized** after the billing-core decision — their presence in `vendor/` must not be read as V1 scope. Platform plumbing (auth, tenant-context, rate-limit, config-runtime, health-check, audit-log, import-export) is genuinely needed but is commodity infrastructure, not product identity. Link core, redirect edge, and attribution are the product-defining capabilities regardless of where the code physically lives.

6. **Billing correctness gates are a distinct, hard dependency.** Entitlement must derive only from verified provider event + persisted transition; PromptPay must never open without reconciliation; duplicate/replayed/out-of-order events must not extend entitlement. This is a correctness/money-gate, and it is the single largest risk to launch — hence it is correctly its own phase with independent preflight evidence.

7. **Scope discipline is already encoded as non-goals.** Full analytics, ad-pixel replacement, link-in-bio, automation, A/B, identity resolution, SSO/SAML are explicit non-goals. Honoring them is what keeps V1 hot-path-safe and shippable, and prevents feature-creep into "another full web-analytics suite."

---

## Risks / failure cases

- **Redirect on the hot path degrades or is coupled to analytics.** If analytics persistence, quota accounting, or subscription lookup is made synchronous or blocking on resolution, the core promise (published links keep working) collapses at load — losing both trust and every existing published customer asset.
- **Quota behavior misread as link breakage.** If an over-quota or paid→free tenant loses redirectability, published material breaks — explicitly prohibited by decisions ("quota exhaustion never disables redirect", "paid→Free never breaks default-domain published links"). UX copy must not imply links are broken when tracking pauses.
- **Attribution overreach / false confidence.** If the product claims unique visitors, cross-device, or parity with ad-platform counters, it will be (a) impossible to deliver honestly and (b) a compliance/trust liability in Thailand. Spec already forbids unique-visitor claims and mandates copy noting WSTERA counts its own tracked redirects, not ad-platform parity.
- **Cross-tenant leakage.** RLS/auth/tenant-context failure leaks one seller's attribution data to another — existential. The negative cross-tenant tests in Phase 1 are the real gate, not the happy path.
- **PromptPay launched before reconciliation.** Without provider-truth re-fetch and idempotent amount/currency/account/product matching, unverified or double-entitled periods are possible (duplicate/replayed events). Money-correctness failure is the highest-severity single risk; it is currently guarded by Phase 4 + reconciliation preflight, but any pressure to ship PromptPay early is a top escalation.
- **Custom-domain / Cloudflare limit drift.** Cloudflare for SaaS limits and certificate lifecycle can change; deploying Phase 5 before re-verifying current terms risks promise-breaking (apex behavior explicitly not promised). Also custom domain adds redirect-availability surface.
- **Scope creep toward "full web analytics" or "link-in-bio"** dilutes identity and expands the hot-path surface. Non-goals must be defended.
- **Fragile cache/destination propagation.** A destination change that doesn't become visible predictably (cache version/purge/TTL) breaks the core promise ("change destination without republishing"). Must be bounded by version/purge/TTL and monitored per failure matrix.
- **Stale entitlement snapshot driving management actions wrong.** If the local bounded entitlement snapshot is not kept consistent with billing-core, paid features could be granted/denied incorrectly (fail-closed for management actions is the rule; redirect must not depend on live billing).

---

## Assumptions

- The frozen docs (vision/PRD/architecture/analytics/UX/roadmap/deps/provenance/decisions/status, plus ADR-001) are the authoritative product intent, and later ADRs take precedence where they amend earlier text (billing amendment 2026-09-02).
- Portfolio-level gates (P0b repository-readiness, P1 shared-boundary/billing-contract) are prerequisites owned by the portfolio, not by LK01; LK01 does not attempt to satisfy them itself.
- "V1" in this answer means the minimal shippable release that proves the attribution value loop with hot-path safety; paid feature phases (custom domain, campaigns/UTM, export, API/webhook, team) are V2/Phase 5 scope by the roadmap, not V1.
- Vendored module presence implies only that the copy exists locally and is product-owned for adaptation; it does **not** imply the module's feature is V1-necessary (proven by the de-authoritized billing modules).
- Thailand legal/tax/regulatory obligations (including for Stripe/PromptPay) are deferred to the Phase 4 preflight; I have not independently verified Thailand payment/tax requirements here.
- No production code exists today, so this gate is a product-scope decision on the locked docs, not a review of shipped capability.

---

## Open questions / missing evidence

- **Redirect SLO.** No production SLO is set (NFR-PERF-001 establishes it "from Beta measurements rather than invented pre-production"). The hot-path target must be measured in Beta, not asserted now — acceptable but an open acceptance criterion.
- **Custom-domain apex behavior.** Not promised pending the chosen Cloudflare for SaaS capability and the customer's DNS case; must be re-resolved at Phase 5. Open.
- **PromptPay reconciliation mechanics.** Reconciliation timing, re-fetch cadence, and exact idempotency keying live in the centralized billing-core contract (P1 gate) and are not finalized in LK01 docs. The "must exist before PromptPay release" rule is clear; the precise contract is not yet evidenced here.
- **Free-plan "1 lifetime destination change per link"** is a locked decision but its abuse-control rationale is thin; whether it should be per-link-lifetime vs. time-bounded is worth an owner decision before Build/Phase 5.
- **Apex vs subdomain custom hosts** and whether customers will hit DNS/TLS validation friction is unproven; needs real Cloudflare tests in Phase 5.
- **Bot-filter / preview-crawler signature scope** is deterministic/versioned but the specific signature set and the acceptable false-positive (human-click-flagged-as-bot) rate are not enumerated. Minor, but affects "Total Clicks" trust.
- **Upgrade/entitlement refresh semantics** across a centralized billing-core (snapshot sync timing, reconciliation interval, and how a pending PromptPay return is handled in UI) hinge on the P1 contract — open.
- **Retention/deletion job specifics** (Phase 6) are not specified; whether downgraded analytics detail is hard-deleted versus locked per data policy is stated as following "data policy, not UI visibility" but the policy itself isn't enumerated.

---

## Confidence

**78 / 100**

High confidence in the product identity, the primary segment, and the hot-path-safe V1 boundary — these are unambiguous in the locked docs and mutually consistent. Slight deduction for: (a) a product still fully pre-build with zero production evidence, so the gate is necessarily doc-grounded; (b) the PromptPay reconciliation and entitlement-snapshot contract resolution living outside LK01 (P1 shared gate) and not yet evidenced here; and (c) the redirect SLO and bot-filter false-positive specifics being explicitly deferred. None of these open items changes the V1 destination-switching/attribution core or its non-goals.
