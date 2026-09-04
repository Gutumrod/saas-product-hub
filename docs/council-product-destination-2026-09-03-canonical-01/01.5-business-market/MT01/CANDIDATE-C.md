# Candidate C — Business/Market Gate Raw Answer

Raw expert answer for the WSTERA Product Destination Council, Business/Market Gate (llm-council-gate v0.3.2). This is NOT a gate verdict — Codex synthesizes. No license/package/checkout/release was created; no product/pricing document was modified.

All external claims below were fetched fresh on **2026-09-04** via web fetch and carry URL + source + fetch date. Claims that could not be verified externally are labeled **UNVERIFIED**. Nothing was answered from model memory alone.

---

## 1. Recommendation

**CONDITIONAL YES — MT01 has a credible one-time commercial source market, with three pre-sale conditions and a price ceiling.** (Not a gate verdict.)

- The paid one-time starter-kit market is real, active, and price-verified today: $180–$1,499 one-time, every verified competitor sells one-time (none subscription), with documented buyer counts in the hundreds to thousands per product (ShipFast ~8,407 buyers; Supastarter 1,483 devs; Pegasus 1,900; Achromatic 850+ licenses; MakerKit "thousands of developers").
- MT01's buyer fits the evidenced payer segment: indie builder / small agency building their own AI SaaS backend — the segment that demonstrably pays one-time prices for source starters.
- **Price ceiling:** MT01 ships less than full-stack competitors (backend-only, in-memory reference persistence, no frontend/auth UI), so it cannot command the $449–$649 full-stack band. Verified comparables support **$149–$299 (single seat) / +$100–$250 (team tier)**. Above $349 the value proposition collapses against MakerKit Pro ($349, full-stack, Supabase-native).
- **Conditions before sale** (consistent with Product Gate carryovers): (a) clean-install evidence on a fresh machine, (b) module provenance/IP clearance in writing, (c) published support/update/refund/compatibility policy. Without these, reason-to-pay is undermined by the free/open-source floor and the support burden eats the margin.
- **Demand for MT01 specifically is still UNVERIFIED** — all demand evidence is category-level. A demand smoke test (landing page + waitlist, or pre-sale at ~$149) should precede any launch decision.

---

## 2. Verified facts / evidence used (all fetched 2026-09-04)

### 2a. Paid one-time competitors (direct + indirect)

| Product | Price (one-time) | License terms | Modules relevant to MT01 | Source (fetched 2026-09-04) |
|---|---|---|---|---|
| **ShipFast** (Next.js JS/TS) | **$199 Starter / $249 All-in / $299 bundle** — "Pay once. Build unlimited projects!" | Unlimited projects; no refunds ("After you've got access to the repo… it can't be refunded"); no resale/redistribution of the boilerplate itself; AS-IS | Auth (Google OAuth, magic links), Stripe/Lemon Squeezy payments incl. webhooks, emails, SEO. **No built-in AI module**; no multi-tenant orgs listed | https://shipfa.st/ and https://shipfa.st/license |
| **Supastarter** (Next.js / Nuxt / TanStack Start) | **$299 Solo (1 dev seat) / $799 Startup (5 seats) / $1,499 Agency (10 seats)** — "No subscriptions. No recurring fees." Lifetime updates | Unlimited projects, commercial + client use, white-label at Agency tier | **Multi-tenant organizations** (invite, roles owner/admin/member, seat-based billing), billing w/ provider choice (Stripe/Lemonsqueezy/Polar/Creem/Dodo), **AI workflows module + chatbot example + multiple AI adapters**, better-auth, i18n, SaaS admin UI | https://supastarter.dev |
| **MakerKit** (Next.js 16 / TanStack Start / React Router; Supabase-native or Drizzle/Prisma) | **$349 Pro (1 user) / $649 Teams (5 users)** — "One-time payment, no subscriptions", lifetime updates, unlimited projects | Unlimited projects; Pro = 1 repo user, Teams = up to 5 (more on contact) | **Organizations/teams + granular RBAC**, billing (Stripe Checkout/Portal, per-seat/usage/flat/one-time), **AI agent rules + MCP server** (no end-user AI product module), auth incl. passkeys/MFA; free "MakerKit Lite" open-source edition | https://makerkit.dev/pricing |
| **SaaS Pegasus** (Django) | **$449 Professional (1 project) / $649 Unlimited projects** — "one-time… no subscriptions"; upgrade path within year 1 for diff + $49 | 1 additional year of updates; 7-day full refund ("no questions asked"); priority support at $649 tier | **Teams/multi-tenancy w/ RBAC** (single-DB, app-layer isolation), Stripe subscriptions + per-seat, **AI chat & agents (OpenAI/Anthropic/Google), streaming, agentic workflows** | https://www.saaspegasus.com/pricing/ |
| **Achromatic** (Next.js, tRPC, Prisma+Drizzle) | **$180 one-time** — 850+ licenses sold since Sept 2024 | License covers individual/team/org; unlimited projects incl. client work; sales final after delivery | **Organizations (roles, switching, ownership transfer)**, Stripe subscriptions + per-seat + credits, **AI chatbot (Vercel AI SDK)** + usage-credit billing, Better Auth | https://achromatic.dev |
| **Next.js Boilerplate Pro / SaaS Starter** (nextjs-boilerplate.com) | **$399 Single (1 project) / $1,199 Unlimited** — one-time, 1 year of updates + 1 year email support | Per-project licensing; no per-seat option | **Multi-tenancy via Clerk orgs, Stripe subscriptions, RBAC**; no AI features listed | https://nextjs-boilerplate.com/pro-saas-starter-kit |

Buyer-count evidence (same sources, 2026-09-04): ShipFast "8,407 makers ship faster"; Supastarter "Trusted by 1483 developers"; Pegasus "1900 developers and businesses"; Achromatic "850+ licenses sold since September 2024"; MakerKit "used by thousands of developers… hundreds of SaaS products in production".

### 2b. Free / open-source floor (the DIY alternative)

| Repo | Stars | License | What it covers | Source (fetched 2026-09-04) |
|---|---|---|---|---|
| nextjs/saas-starter (official Next.js successor to the archived Supabase starter) | **16.1k** | MIT | Email/password auth, Stripe Checkout + Customer Portal, teams CRUD, basic RBAC — self-described "intentionally minimal… learning resource" | https://github.com/nextjs/saas-starter |
| wasp-lang/open-saas (Open SaaS) | **15.7k** | Free, "100% Open Source" | Auth, payments (Stripe/Polar/Lemon Squeezy) incl. webhooks, admin dashboard, AI-ready agent rules | https://opensaas.sh and https://github.com/topics/saas-boilerplate |
| vercel/ai-chatbot | **20.9k** | LICENSE file present (type not shown on page) | Free Next.js + AI SDK chatbot template | https://github.com/vercel/ai-chatbot |
| ixartz/SaaS-Boilerplate | **7.4k** | MIT (free core) | Multi-tenancy/orgs + RBAC free; **Stripe billing only in paid Plus/Pro/Max tiers** ($399/$1,199 per above) | https://github.com/ixartz/SaaS-Boilerplate |
| vercel/nextjs-subscription-payments (Supabase + Stripe) | 7.7k | MIT | **Archived 2025-01-23**, replaced by nextjs/saas-starter — the official Supabase+Stripe starter path is now generic Postgres | https://github.com/vercel/nextjs-subscription-payments |
| boxyhq/saas-starter-kit | **4.9k** | Apache-2.0 | Enterprise: teams/multi-tenancy, SAML SSO, SCIM directory sync, audit logs, Stripe payments, RBAC | https://github.com/boxyhq/saas-starter-kit |
| MakerKit Lite | 455 | free "lite" edition | Free Supabase+Next.js edition of the paid MakerKit | https://github.com/search?q=supabase+saas+starter&type=repositories |
| KolbySisk/next-supabase-stripe-starter | 806 | public repo | "The highest quality SaaS starter" Next.js+Supabase+Stripe | same search URL |
| antoineross/Hikari | 390 | open source | Next.js 14 + Stripe + Supabase SaaS starter | same search URL |
| backblaze-labs/ai-saas-starter-kit | 12 | MIT | Next.js 16 + FastAPI monorepo: Supabase auth, Stripe billing, AI image generation | https://github.com/topics/saas-starter-kit |
| SamurAIGPT/ai-saas-starter | 23 | free | Next.js AI SaaS boilerplate: OAuth, Stripe credit billing, async generation | same topics URL |

GitHub topic "saas-boilerplate" lists **550 public repositories** (285 TypeScript) — the free floor is deep, not a single template (https://github.com/topics/saas-boilerplate, fetched 2026-09-04).

### 2c. Backend-only / stack-agnostic paid kit scan

- GitHub search "ai saas backend starter kit" returned **6 repositories, all free/open-source, none paid** (https://github.com/search?q=ai+saas+backend+starter+kit&type=repositories, fetched 2026-09-04).
- awesome-opensource-boilerplates list contains **no paid AI/backend-only kit**; closest AI entries (Open SaaS, LastSaaS, SpeedPy) are full-stack and free (https://github.com/EinGuterWaran/awesome-opensource-boilerplates, fetched 2026-09-04). LastSaaS (165 stars, MIT, Go+React) notably ships multi-tenant isolation + Stripe billing + MCP server for free (https://github.com/jonradoff/lastsaas, fetched 2026-09-04).
- **No paid, backend-only, multi-tenant AI SaaS starter kit was found in this scan.** Absence was not exhaustively proven (scan limits noted in §6). Read as: genuine whitespace, plausibly because the mainstream buyer wants a full-stack kit.

### 2d. Distribution economics (merchant-of-record fees)

- **Lemon Squeezy: 5% + $0.50 per transaction**, $0/mo, MoR handles sales tax (https://www.lemonsqueezy.com/pricing, fetched 2026-09-04). On a $249 sale ≈ $12.95 + $0.50.
- **Gumroad: 10% + $0.50 direct sales; 30% for Discover marketplace sales**; MoR since 2025-01-01 (https://gumroad.com/pricing, fetched 2026-09-04).
- Net: distribution cost is ~5–10% of revenue — gross margin on a source-code product remains >90%. Margin risk is NOT in fees; it is in support/refund burden (§3, §5).

### 2e. Licensing norms for the category

- Verified norm is **one-time license, unlimited (or per-project) builds, explicit no-resale clause, AS-IS no warranty** — e.g., ShipFast license: unlimited projects personal/team, prohibits "resell or redistribute the ShipFast boilerplate as a standalone product", non-transferable, Singapore law (https://shipfa.st/license, fetched 2026-09-04).
- Two variants for update rights: **lifetime updates** (ShipFast, Supastarter, MakerKit, Achromatic) vs **1-year update windows** (Pegasus "1 additional year of updates", nextjs-boilerplate "1 year of updates").
- Seat-based team tiers are the standard agency monetization ($799/$1,499 Supastarter; $649 MakerKit Teams).
- Refund norms are mixed: none (ShipFast), 7-day (Pegasus), final-after-delivery (Achromatic) — a written policy is required, not a specific stance.

---

## 3. Key reasons

**R1. The one-time market is proven and priced.** Six independent paid kits, all one-time, $180–$1,499, with real buyer counts. Developers demonstrably pay $199–$649 once for source starters. The "credible one-time commercial source market" question is answered YES at category level. (Evidence: §2a.)

**R2. The payer segment is evidenced by competitor tier structure.** Solo/1-seat tiers at $180–$349 (Achromatic, MakerKit Pro, ShipFast, Supastarter Solo) are the volume products; team/agency tiers at $649–$1,499 are the upsell. For MT01 the primary payer is the indie builder or 2–10 person agency building a B2B AI SaaS backend who already owns their frontend stack. "Tech SME as direct buyer" is secondary — SMEs buy outcomes, not blueprints; the SME appears as the *agency's client*, not the payer. (Inference from tier structure + locked Product Definition's buyer clause.)

**R3. The build-vs-buy gap is the reason to pay.** Composing MT01's seven modules DIY (tenant isolation, Supabase-style auth/RBAC, AI provider abstraction, entitlements, Stripe webhooks + webhook receiver, circuit breaker/tracer wiring) is a realistic 40–120 hours for a competent dev (internal estimate — UNVERIFIED externally; see §5). At typical freelance/agency blended rates of ~$50–$150/hr (assumption, UNVERIFIED), DIY costs $2,000–$18,000 of opportunity cost versus a $199–$299 purchase. This gap is exactly why 8,407 people bought ShipFast. The Pain→Capability→Outcome→Value→Reason-to-Pay chain: (Pain) devs get tenant isolation, entitlement enforcement, and Stripe webhook handling wrong and burn weeks wiring AI providers; (Capability) seven tested TS modules + a reference server proving the loop; (Outcome) skip weeks of wiring and the classic webhook/entitlement bug class; (Value) weeks of saved time and earlier first revenue; (Reason to pay) buy the composition once, keep full source ownership.

**R4. Differentiation is real but thin — and must be proven, not asserted.** MT01's verified differences vs the paid set: (1) **backend-only and framework-agnostic** — the only kit in the verified set that is not a fork-me full-stack app (Express reference server is composition proof, not the product); (2) **copy-in modules** rather than a monorepo you fork — modules can be lifted into an existing codebase; (3) **coherent AI-provider + entitlement + webhook-receiver loop** with resilience primitives. Against the free floor, that is the entire paid delta — free starters (nextjs/saas-starter, Open SaaS, BoxyHQ, MakerKit Lite) already give auth + Stripe + teams + admin. "Measurable differentiation" therefore reduces to: module-boundary quality, verified composition (13/13 tests passing at HEAD 92139cf), and docs/clean-install — none of which is yet customer-visible evidence. Differentiation is credible in kind, unproven in degree.

**R5. One-time fits; "lifetime updates" does not fit MT01's churn surface.** Category norm is one-time (all six verified competitors). But MT01's included surfaces churn hard: AI provider SDKs (OpenAI/Anthropic/Gemini) release breaking changes continuously, Stripe API/webhook schemas evolve, Supabase auth APIs move. A "lifetime updates" promise (ShipFast/MakerKit style) converts that churn into an unpaid perpetual support liability. The Pegasus/nextjs-boilerplate model — one-time purchase + 1-year update window, optional paid support ($149/call exists at Supastarter as an evidenced ancillary) — fits MT01's economics better.

**R6. Support/refund/compatibility burden is the real cost center.** MT01 buyers bring their own Supabase, Stripe, and AI-provider accounts and their own frontend — the support matrix (auth versions × AI SDKs × Stripe webhook configs × Node runtimes) is where unpaid tickets breed. Competitor norms are explicit: Pegasus 7-day refund + 1yr support; nextjs-boilerplate 1yr email support (24h response); ShipFast no refunds + Discord. MT01 needs the equivalent in writing *before* sale — especially a compatibility boundary statement ("supported: Node LTS, Stripe API version X, Supabase current") or every mismatch becomes a support case. This compounds the Product Gate's own carryover (clean-install evidence missing).

**R7. Margin is structurally excellent; the risks are IP/provenance, not economics.** ~5–10% distribution fee (§2d) against a $0-marginal-cost source product gives >90% gross margin. The gating risks: (a) **module provenance/version drift** — flagged by Product Gate as unresolved; MT01 cannot be lawfully sold until ownership/rights of every copied module are established, including any AI-generated or copyleft-derived code (UNVERIFIED until a provenance audit exists); (b) **buyer-side redistribution** — the license must follow the ShipFast pattern (prohibit reselling the kit as a boilerplate, retain IP, AS-IS) — norm is verified, MT01's own license text does not yet exist; (c) piracy/leak of source kits is endemic and the market has decided to live with it (ShipFast thrives regardless).

**R8. The whitespace is real but may be a demand signal in disguise.** No paid backend-only multi-tenant AI kit was found (§2c). Two readings: (a) underserved niche that MT01 can own; (b) evidence the mainstream starter buyer wants a full-stack kit with frontend included, and backend-only demand is thin. The 550-repo free floor skews full-stack. The locked Product Definition already fences MT01 away from turnkey buyers, which narrows the pool further. This ambiguity is the single biggest market unknown and is only resolvable empirically (smoke test), not by more desk research.

---

## 4. Risks / failure cases

1. **Free floor compression.** nextjs/saas-starter (16.1k stars, MIT, Stripe + teams + RBAC) and Open SaaS (15.7k) are free, official, and actively referenced; BoxyHQ (4.9k) even ships enterprise SSO/SCIM free. A price-sensitive builder can fork free code for $0. If MT01's docs/test/clean-install quality does not visibly exceed the free floor, paid conversion fails.
2. **Backend-only positioning shrinks the funnel.** Every verified paid competitor bundles a frontend. MT01 demands the buyer bring frontend, auth UI, deployment, ops. That is coherent for the locked buyer definition, but it removes the largest buyer cohort (turnkey-seeking builders) and concentrates risk on a narrower, less-proven cohort (backend-focused indie/agency).
3. **In-memory-only persistence caps the value claim.** Pegasus at $449 ships real multi-tenant DB architecture; MT01 ships interfaces + in-memory reference persistence (production adapter explicitly deferred). Marketing MT01 as "production foundations" invites refunds and reputation damage; it must be sold as "composition blueprint + verified wiring", which lowers the justifiable price.
4. **MT01-specific demand is zero-evidence.** All demand data is for other products. Failure case: launch to silence. Mitigation: pre-sale/waitlist smoke test before any Launch-gate spend.
5. **Provenance/IP unresolved = cannot sell.** Product Gate carryover. If any module carries copyleft provenance or unclear rights, sale exposes the seller and buyers. Hard blocker, not a soft risk.
6. **Lifetime-update liability under AI-SDK churn.** If launch copies MakerKit/ShipFast "lifetime updates" framing, AI provider SDK churn turns a one-time sale into an indefinite maintenance debt. Use a bounded update window instead.
7. **Support burden exceeds the one-time revenue.** Buyer-owned external accounts + buyer-built frontend mean every integration failure (Stripe webhook misconfig, Supabase RLS mistake, AI key quota) lands in MT01 support regardless of cause. Without a written support boundary, effective margin goes negative on the first 20 customers.
8. **One-time revenue has no tail.** No recurring revenue; the model lives on new launches and upsells (team tiers, consulting calls). If MT01 is a one-and-done SKU, the business case depends entirely on repeat productization — outside this gate's scope but worth recording.
9. **Supabase/official re-entry risk.** The official Supabase+Stripe starter was archived (2025-01-23) and succeeded by a generic Postgres starter — currently good for MT01. If an official multi-tenant AI backend starter ships later, the paid delta erodes further (monitor before Launch).

---

## 5. Assumptions

- **A1 (UNVERIFIED):** DIY composition of MT01's seven-module scope costs a competent developer 40–120 hours. Internal estimate; no external benchmark for this exact scope was obtainable. The build-vs-buy argument survives a wide error band (even 20 hours at $50/hr = $1,000 vs $249), but the specific number is unbenchmarked.
- **A2 (assumption, UNVERIFIED):** Blended freelance/agency developer rates of ~$50–$150/hr. Upwork rate-resources page returned 403 on fetch; no current external rate figure verified.
- **A3 (inference):** Payer mix for MT01 ≈ indie builders (majority of volume) + small agencies (majority of revenue via team tiers) + rare tech SMEs. Inferred from competitor tier structures, not from MT01 data.
- **A4 (inference):** GitHub star counts are a proxy for the free floor's mindshare, and vendor buyer counts are truthful (self-reported, not audited).
- **A5 (inference):** The Product Gate's verified state (13/13 tests, typecheck passing at HEAD 92139cfa) predicts acceptable first-buyer quality — quality claims beyond typecheck/tests remain unverified externally.
- **A6:** "Backend-only + stack-agnostic" is a real purchase motive, not merely a seller's constraint. No external demand evidence exists for this motive in this category.

---

## 6. Open questions / missing evidence

1. **MT01-specific demand (blocking for Launch):** zero waitlist/LOI/pre-sale evidence. Cheapest resolution: landing page + waitlist, or 5–10 pre-sales at ~$149 with refund guarantees, before any launch spend.
2. **Backend-only paid-competitor absence:** scan of GitHub topics/searches/awesome lists found none, but was not exhaustive (no paid-marketplace sweep across Gumroad/Lemon Squeezy search, no Chinese/Japanese market scan, no niche B2B vendor scan). Question: does any paid backend-only multi-tenant/AI kit exist at a price that constrains MT01?
3. **WTP for copy-in modules vs fork-me repos:** untested hypothesis. Would a builder pay the same for modular copy-in code as for a full forkable app? No external benchmark found.
4. **Agency demand evidence:** agencies pay $799–$1,499 team tiers for *full-stack* kits (verified); no evidence agencies pay for backend-only blueprints. If the agency segment is the intended volume buyer, test it explicitly in the smoke test.
5. **Provenance audit (blocking):** per-module ownership/rights/AI-generation/copyleft status — Product Gate carryover, prerequisite to any sale.
6. **Clean-install proof (blocking):** fresh-machine install of the packaged kit with recorded evidence — Product Gate carryover.
7. **Refund/support policy decision:** category norms are verified and mixed (none / 7-day / final-after-delivery; 1yr vs lifetime updates). The policy choice is open and belongs to the Launch/Operations gates — this gate only records that the choice must be made and published before sale.
8. **Supabase official-starter watch:** confirm no official multi-tenant AI SaaS starter is imminent (the archived vercel/nextjs-subscription-payments path currently redirects to the generic nextjs/saas-starter — favorable for now, re-check before Launch messaging).
9. **Pricing experiment design:** $149 vs $199 vs $249 price-point sensitivity for MT01's narrowed buyer is unknown; a 2–3 price-point test during pre-sale would resolve the ceiling question with data instead of inference.

---

## 7. Confidence

**70/100.**

- High confidence (evidence-backed): the one-time starter-kit market exists, is priced $180–$1,499, is bought by the thousands per product, and its licensing/distribution norms are as recorded in §2. ~90% on those category-level facts.
- Medium confidence: MT01 fits the evidenced buyer segment and the build-vs-buy gap is persuasive (build-vs-buy magnitude rests on UNVERIFIED assumptions A1/A2, though the conclusion is robust to large errors). ~65%.
- Lower confidence: backend-only demand specifically (A6, open question 3–4) and MT01's own traction (zero evidence). ~45%.
- The 70 blends: strong category evidence, genuine but thin differentiation, material unresolved carryovers (provenance, clean-install, support policy), and unverified MT01 demand. The verdict direction ("credible market — yes, conditionally") would flip to NO only if the demand smoke test fails, which is exactly why the smoke test is the recommended next step.