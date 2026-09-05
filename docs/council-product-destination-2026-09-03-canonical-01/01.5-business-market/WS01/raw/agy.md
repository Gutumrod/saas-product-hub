# WS01 — WSTERA Supply Management — Business/Market Gate — Raw Expert Answer (AGY)

Independent Council expert evidence. Prepared for the WS01 Business/Market Gate per COUNCIL-BRIEF.md (frozen 2026-09-05). This file is raw expert evidence only; it does NOT issue the gate verdict (Codex does). No Phase 1 authorization, no reopening of locked Product definition, no invented final public prices.

---

## 1. Recommendation

**CONDITIONAL — direction: pass toward a narrow, validated beachhead, with explicit commercial/delivery conditions.**

WS01 attacks a real, recurring, costly pain (truthful supply/demand/gap/allocation coordination for importers/distributors with dealer networks) that spreadsheets and chat genuinely fail to manage under partial factory supply. A credible initial payer exists (small/mid-size Thai importer/distributor owner-operator with a dealer network and recurring shortage/allocation rounds). The V1 thin loop is disciplined and stays inside a commercially coherent wedge.

It is conditional (not UNCONDITIONAL) because three things are unproven at this gate and materially affect monetization:
- Whether enough of the 162,791 registered Thai wholesale/distribution entities actually hit the *recurring partial-supply + manual-allocation* trigger (many importer/dealer relationships are stable, non-constrained supply).
- Whether a Thai SME will pay a **recurring** fee for a *decision-traceability/collaboration* layer vs. improving a spreadsheet or adopting a cheap Thai accounting/POS SaaS (THB 599–4,000/mo) that bundles inventory.
- Whether ARPU supports the onboarding/Excel-migration burden without an assisted-onboarding or data-import line of business.

It is NOT a blocker at this stage. The blocker classification in the brief (no credible payer / pain too weak / wedge indistinguishable / economics can't support delivery) does NOT clearly trigger; all four are plausible risks but none is demonstrated fatal now. Proceed toward a small Phase 1 validation with the conditions in Section 8/9/11.

---

## 2. Verified facts / evidence

External, current as of fetch date **2026-09-05**. All sourced claims below include URL.

- **Thailand wholesale & distribution registry pool — 162,791 records** (Thailand Department of Business Development–derived, NACE 46 scope): https://www.infobelpro.com/companies/thailand/distribution-and-wholesale (fetched 2026-09-05).
- **Retail companies in Thailand — 128,857 records** (NACE 47 scope): https://www.infobelpro.com/companies/thailand/retail (fetched 2026-09-05).
- **Total Thai registered juristic persons — 2,116,276** (DBD-derived): https://www.thaibizindex.com/en/insights (fetched 2026-09-05).
- **NetSuite wholesale/distribution economics (enterprise floor well above WSM pricepoint):** base platform "from $999/mo" + $129–$199/user/mo; annual license small business (5–10 users) $24K–$54K/yr; mid-market $50K–$150K/yr; implementation $25K–$500K; 3-yr TCO often $200K–$750K. https://www.brokenrubik.com/blog/netsuite-pricing-the-definitive-guide and https://www.erpresearch.com/industries/retail-commerce/wholesale-distribution and https://www.erpresearch.com/en-us/netsuite-wholesale-distribution (fetched 2026-09-05).
- **Odoo wholesale/distribution costs (closest affordable "big" incumbent):** Standard ~€24.90/user/mo, Custom/Enterprise ~€37.40/user/mo (Thailand billed via Europe-Central EUR pricelist); Thai SME Odoo SaaS bundles THB 3,000–4,000/mo (unlimited users) from Frontware; SME Odoo implementation typically $10K–$50K; Odoo apps-store Distribution Management module $699/database. https://oec.sh/odoo-pricing/thailand , https://odoo.frontware.com/page/pricing , https://gloriumtech.com/odoo-erp-for-wholesale-distribution , https://apps.odoo.com/apps/modules/17.0/distribution_management (fetched 2026-09-05).
- **B2B ordering SaaS (direct, affordable reference points):** Orderwerks B2B order management for distributors, pricing starting ~$150/mo base (+ $25/driver/mo route module) — https://www.orderwerks.com/pricing ; VoiceOrder B2B store from ~$129/mo with add-ons $149/mo — https://www.voiceordersolutions.com/blog/best-order-management-software-for-distributors ; Shopify B2B/wholesale apps typically $10–$50/mo on standard plans (vs Plus cost) — https://developios.com/blog/shopify-b2b-explained (all fetched 2026-09-05).
- **SEA B2B ordering/distribution platform:** Borong (Malaysia/Indonesia) — SaaS B2B e-commerce for supplier–distributor–wholesaler–retailer; on marketplace orders a flat ~3% commission, 0% commission for direct/own-customer orders via Borong Direct; available in 2 countries (MY, ID). https://www.borong.com/id/borong-direct and https://pageid.borong.com/produk/borong-direct/ (fetched 2026-09-05).
- **Thai SME accounting/POS SaaS willingness-to-pay anchors (adjacent, established local players):** FlowAccount & PEAK tiers roughly THB 599–1,499/mo; e-Tax invoice submission in paid tiers; "Thai accountant network" as moat. https://software-listing.com/blog/thai-sme-accounting-stack-2026 (fetched 2026-09-05).
- **Thai SME digital maturity (context, NOT WSM-specific):** depa reports ~70% of surveyed enterprises at "Industry 2.0 Solution" digitization level; Thai SMEs 100% moved operations online per one market-research claim — these are broad, non-WSM-specific and flagged `UNVERIFIED` for WSM's target segment. https://www.depa.or.th/en/article-view/20250423_01 , https://marketresearchthailand.com/insights/articles/empower-businesses-thailand-sme-digital-transformation (fetched 2026-09-05).
- **FMCG-distributor communication pain recognized industrially:** AI chat agents being deployed on WhatsApp to replace manual distributor ordering/communication — corroborates that dealer-order-via-chat + shortage/order friction is a live, recognized problem in the region. https://airudder.com/automating-distributor-communication-with-ai-how-fmcg-brands-are-streamlining-b2b-order-management/ (fetched 2026-09-05).

Product-source grounding (WSM repo, `products/WSM`): Product Vision/PRD define ICP as importer/distributor with multiple SKUs + dealers, one-or-more suppliers/factories, regularly facing partial production/delay/shortage, currently allocating manually; pricing doc keeps all commercial values TBD and mandates separation of billing state from feature entitlement. These are internal product claims, not independent market proof — used only to scope what WSM claims, not to validate the market.

---

## 3. Initial payer + beachhead

**Initial payer (economic buyer + operations user):** the **importer/distributor owner-operator** (or a small operations/admin team, 1–5 people) who personally owns the spreadsheet/chat coordination and is the one person who "can't explain why dealer A got stock and dealer B did not." They are the economic buyer (they pay), the operations user (they allocate), and the decision-maker — a single-decision-seller motion.

**Beachhead (narrowest credible first paying segment):** small/mid-size Thai importer or exclusive distributor that:
- holds **multiple SKUs** and serves an active **dealer/reseller network**;
- buys from **one or more factories/suppliers** (many-to-many sourcing);
- **repeatedly faces partial production, delay, or shortage**, forcing recurring allocation rounds;
- currently coordinates via **Excel + LINE/chat + owner memory**.

This is the segment where pain is genuinely recurring and monetizable. Do NOT treat every importer as a customer: an importer with plentiful supply and a stable dealer list has no recurring allocation pain and won't pay monthly.

**Actor separation:** economic buyer = importer/distributor owner; operations user = admin/ops clerk (1–3 people); dealer-demand actor = the dealer/reseller (demand-side, **not** the SaaS payer); supplier-factory actor = external supplier/factory (data touchpoint, not payer). WSM's V1 correctly keeps dealers as demand-side actors, not payers — this matches the commercial model.

**Conditions making WSM worth paying for:** (a) recurring constrained supply (shortage at least a few rounds a year); (b) >1 SKU and >a handful of dealers so allocation is not trivial; (c) an owner who feels the cost of explaining allocations / discovering shortage late; (d) repeated allocation disputes or lost spreadsheet history. If only (a) is absent, value collapses — hence the conditional recommendation.

---

## 4. Recurring pain and status quo

Recurring + costly pains in the target ICP (each is common in the segment, corroborated by the FMCG chat-order friction source and general distribution-ops literature):

- Dealer requests scattered across LINE/chat/email — no single demand record (`Verified as a recognized regional pain`, FMCG bot article; general claim).
- Duplicate/inconsistent Excel sheets; demand "requested" mistaken for "committed order"; factory order mistaken for "confirmed production" (`hypothesis` unless a specific WSM customer confirms; this is exactly WSM's Ordered≠Confirmed≠Received truth).
- Shortage discovered too late to re-plan.
- Manual allocation of scarce supply and no audit trail for "why dealer A, not B" — owner dependency + dealer disputes.
- Partial-supply changes cascade into repeated shortage recalculation.
- Backorder tracking and history lost when a spreadsheet is overwritten.

**Costs these create** (mix of evidence + hypothesis): admin/staff hours re-keying and reconciling (`hypothesis` magnitude), lost sales from late-discovered shortage (`hypothesis`), allocation errors and dealer dissatisfaction, excess/under-promises, decision latency (waiting on the owner), and a single point of failure on owner memory.

**Status quo (strongest competitor is not software — it is improvised tooling):** Excel / Google Sheets, LINE, WhatsApp/chat, email, paper, shared-drive files, and **owner/operator memory**.

**Why pay WSM instead of improving the spreadsheet?** The spreadsheet's weaknesses are structural, not cosmetic:
- No shared, concurrent truth — overwrite destroys provenance (WSM's "history over overwrite" directly targets this).
- No enforced separation of Requested / Allocated / Fulfilled and Ordered / Confirmed / Received — the spreadsheet conflates them, so allocations drift from reality.
- No dealer self-service — the dealer must ask the admin, keeping the admin the bottleneck.
- No gap calculation that cannot double-subtract backorders.
The wedge is "truthful, auditable supply/demand/gap/allocation state," not "prettier spreadsheet." That is a defensible reason to pay IF the owner feels the spreadsheet's conflation directly loses money or trust. Where the spreadsheet "works well enough" for a stable, abundant-supply importer, WSM has no hook — this is the core commercial acceptance condition.

---

## 5. Competitor evidence

**Status quo alternatives (strongest):**
- Excel/Google Sheets + LINE/WhatsApp + owner memory. Free, familiar, no onboarding. The default and the real competitor. `Unverified` how many Thai targets have already outgrown these — likely the majority have not.

**Direct / adjacent SaaS:**

| Competitor | Category | Target | Verifiable pricing | Notes |
|---|---|---|---|---|
| **NetSuite Wholesale Distribution Edition** | Enterprise ERP | mid-market→enterprise distributions | base from ~$999/mo + $129–$199/user/mo; license $24K–$150K/yr; impl $25K–$500K | Correct for SAP-scale not WSM ICP. Way above Thai SME. `UNVERIFIED` exact THB, negotiated. |
| **Odoo (Community/Enterprise + Distribution module)** | ERP-lite / SaaS | SME, incl. Thai SMEs | Standard ~€24.90, Enterprise ~€37.40/user/mo; Thai bundle THB 3,000–4,000/mo unlimited users; Distro module $699/db; impl $10K–$50K | Affordable incumbents; have inventory/order/POS; generic, not allocation/shortage-first. |
| **Orderwerks** | B2B ordering/OMS | distributors (wine/spirits/tobacco) | ~$150/mo base + add-ons | US-centric ordering/OMS; not a Thai allocation/shortage tool. |
| **VoiceOrder** | B2B OMS | distributors | B2B store ~$129/mo; add-ons $149/mo | US-centric. |
| **Shopify B2B / wholesale apps** | B2B portal | SMB e-commerce | apps ~$10–$50/mo; Plus higher | Order portal, not supply/gap/allocation. |
| **Borong (Direct/Field Sales/POS)** | SEA B2B distribution platform | Indonesia/Malaysia supplier/distributor/wholesaler/retailer | ~3% marketplace commission on new orders; 0% on direct/own customer orders | Closest SEA adjacency: distribution + ordering + stock. Monetizes via take-rate/marketplace, not allocation. Available MY/ID — not Thailand (as fetched). |
| **Thai accounting/POS SaaS (FlowAccount, PEAK)** | Accounting/inventory/POS | Thai SME | ~THB 599–1,499/mo | Bundles inventory; NOT demand-vs-supply gap/allocation. Strong local incumbent that could absorb WSM's ICP if WSM stays vague. |
| **Enterprise SCP (Kinaxis, Omneo, etc.)** | Supply chain planning | enterprise | Kinaxis enterprise-tier (5–6+ figure/yr) | Not comparable; wrong ICP/buying motion. |

**Key competitive read:** WSM does not compete with SAP/NetSuite Kinaxis-scale; it competes with (1) improvised spreadsheet+chat (default), (2) cheap Thai accounting/POS SaaS that bundles inventory, and (3) SEA B2B ordering platforms (Borong et al.) that target ordering/sales rather than *scarce-supply allocation truthfully reconciled to fulfillment*. No named competitor found that is *both* Thai SME-priced *and* allocation/shortage-gap-first — that is the open wedge.

---

## 6. Pain → Capability → Outcome → Business Value → Reason to Pay

- **Supply truth (Ordered≠Confirmed≠Received):** capability = enforce distinct supply states; outcome = no factory order mistaken for confirmed production; **Business value:** fewer over-promises and surprise shortages (`hypothesis` magnitude); **Reason to pay:** owner stops discovering production shortfall at fulfillment time.
- **Demand truth (Requested≠Allocated≠Fulfilled):** capability = keep dealer demand separate from allocation and shipment; outcome = no dealer request assumed to be guaranteed stock; **Business value:** fewer dealer disputes and allocation errors (`hypothesis`); **Reason to pay:** defensible, explainable allocation.
- **Gap (reliable demand-vs-supply shortage visibility):** capability = computed gap that does not double-subtract backorders; outcome = shortage seen before it bites; **Business value:** decision latency and lost sales cut (`hypothesis`); **Reason to pay:** proactive re-planning vs. reactive firefighting.
- **Allocation (traceable manual/partial):** capability = auditable allocation decision record; outcome = "why dealer A, not B" answerable; **Business value:** owner delegation + fewer disputes; **Reason to pay:** removes single-point-of-failure on the owner's memory.
- **Dealer communication (dealer sees own result):** capability = dealer self-result without asking admin; outcome = less admin churn on re-keying; **Business value:** admin time saved; **Reason to pay:** dealer self-service breaks the admin bottleneck.
- **History (no spreadsheet overwrite):** capability = history-over-overwrite provenance; outcome = decision provenance survives; **Business value:** auditability + less rework; **Reason to pay:** data is a switching-cost moat.

**Overall reason to pay (hypothesis):** recurring constrained supply + allocation disputes + admin re-keying cost the importer enough (hours, lost margin, dealer trust) that a monthly fee is justified — but the hard number is unmeasured; treat the value case as hypothesis until a pilot quantifies hours/rounds saved.

---

## 7. Differentiation

Defensible wedge beyond "spreadsheet but prettier":
1. **Truthful supply-state separation** (Ordered≠Confirmed≠Received) — spreadsheets and cheap inventory/accounting SaaS conflate a request with a commitment and an order with confirmed stock.
2. **Shortage visibility via computed gap** that cannot double-subtract backorders — not present in order portals or accounting bundles.
3. **Auditable allocation decision record** — the "why dealer A not B" provenance that Excel overwriting destroys; this is a trust feature with real dealer-relations value.
4. **Dealer self-result** — dealer sees own outcome without asking admin, turning the admin from bottleneck into exception handler.

Valuable vs. ERP/inventory/OMS/spreadsheets/order portals because each focuses on recording orders or stock levels, not on **reconciling scarce supply to demand allocation truthfully**. Differentiation is real but **thin and easy to copy** — a fast-moving ERP-lite (Odoo) could add a shortage/allocator screen. So the moat is not feature depth; it is **niche focus + auditable decision provenance + dealer data lock-in**, which only compounds once a tenant accumulates rounds of allocation history.

---

## 8. Monetization direction

Commercial values are TBD by source-of-truth — no final public prices invented here. Evaluate structures:

- **Monthly B2B per tenant** — simplest, matches recurring monthly rounds; recommended core.
- **Tier by active dealers** — correlates with value (more dealers = more allocation complexity) but adds billing complexity; acceptable as a soft cap.
- **Tier by active SKU/variants** — value-correlated; keep simple, avoid per-line-item metering.
- **Seats (operations roles)** — weak fit because V1 is 1 owner + 1–3 ops; a seat tier would over-complicate.
- **Booking/allocation volume** — value-correlated but metering cost may exceed benefit at V1; do not assume usage-based billing.
- **Advanced allocation policies / automation / API / webhooks** — a later monetization tier, not V1 core.
- **Onboarding / data-import fee** — justified given Excel migration burden; a concrete, defensible revenue line.
- **Enterprise controls/support + audit export** — a top-tier pull-through later.
- **Transaction/take-rate** — should NOT be assumed (WSM is not a marketplace; dealer isn't payer). Reject take-rate for V1.

**Direction:** recurring per-tenant, tiered by active dealers (with SKU as secondary soft limit), plus a one-time onboarding/data-import fee; advanced allocation/API as a later tier. Keep billing simple; anchor ARPU to the Thai SME software market (accounting/POS SaaS ~THB 599–1,500/mo; Odoo bundles ~THB 3,000–4,000/mo unlimited users) rather than to US B2B SaaS norms (`hypothesis` for what WSM can charge).

---

## 9. Sales / onboarding / delivery model

**Initial sale:** owner-led demo → **assisted onboarding**. The economic buyer is the owner; a self-serve-only motion will likely fail because the core value (allocation truth) needs a working first supply round. Realistic path: consultative-lite onboarding led by WSTERA, not fully self-serve.

**Onboarding burden (each is real cost):**
- Excel migration of products/SKUs, dealer list, supplier mapping, historical allocation data.
- Product/SKU setup and supplier mapping (many-to-many).
- Staff training on workflow change (admins + dealer-facing self-result).
- Dealer-code/account rollout to the dealer network.
- Support burden during first allocation rounds.
- (Non-goal discipline) V1 explicitly avoids ERP/inventory/WMS/finance — so WSM sells a thin loop, not a system replacement.

**ARPU vs. onboarding effort — the critical commercial tension:** if onboarding is labor-heavy (hours of assisted setup per tenant) but ARPU is THB-trivial (matching cheap Thai SaaS), unit economics fail. Therefore either (a) onboarding must be templated/data-import-assisted to near-self-serve, or (b) an onboarding/data-import fee must carry the cost. Both are conditions. If a pilot shows onboarding > ~2–4 assisted hours at a pricepoint that can't carry it, the delivery model is uneconomic → blocker-adjacent.

---

## 10. Acquisition / activation / retention

- **Acquisition triggers:** major shortage event, factory delays, dealer-network growth past what Excel handles, unmanageable duplicate sheets, repeated allocation disputes, or a dealer demanding a fair/visible allocation. Timing-driven — sell into pain events, not steady state. No reliable SEA-channel CAC data found → `UNVERIFIED` CAC.
- **Activation (hypothesis):** one real booking/supply round that reaches Gap + Allocation successfully. If V1 gets a tenant through a live constrained round with a defensible allocation, the tenant is activated.
- **Retention (pay month 2+):** recurring dealer rounds, recurring supply updates, shortage management, allocation history, the dealer's dependency on the self-result portal, and accumulated SKU/dealer/supplier history + auditability. Retention is data-moat-driven and inherently recurring if the pain is recurring. `hypothesis` that churn is low when constrained supply persists; risk when supply becomes abundant (see §11).

---

## 11. Commercial risks / failure cases

At minimum, the brief's list, assessed:

- **Excel good-enough** — highest risk. The default competitor is free. If the segment hasn't outgrown spreadsheets/chat, no monetization. **Mitigation:** sell into constrained-supply/allocation-dispute triggers only.
- **ERP/inventory incumbent (Odoo/Thai accounting SaaS)** — cheap bundled inventory could absorb the ICP if WSM stays vague. **Mitigation:** stay sharp on the shortage/allocation/audit wedge.
- **Integration expectations** — dealers/owners may expect order→inventory→accounting flow; V1's non-goals (no ERP/inventory/WMS/finance) are correct but may cap perceived value and create integration asks. Expect scope pressure.
- **Migration complexity** — Excel/dealer/supplier/history import is nontrivial; onerous onboarding kills economics.
- **Long B2B sales cycle** — owner-decision helps (short cycle), but if procurement/accounting must approve, cycle lengthens.
- **High onboarding/support cost** — vs. low ARPU = uneconomic (see §9). Serious risk.
- **Niche ICP** — the beachhead is narrow by design; fine for a wedge, lethal if it stays a micro-niche with no adjacent expansion.
- **Bespoke-workflow pressure** — each importer allocates differently; customers may push WSM toward custom ERP. Non-goal discipline is mandatory.
- **Weak pain when supply plentiful** — non-constrained importer has no recurring shortage pain → churn or no-purchase. Structural, recurring-revenue risk that must be acknowledged (not hidden).
- **Seasonal/intermittent allocation cycles** — monthly recurring billing fights annual or campaign-seasonal cycles; consider round/season-based value communication.
- **Switching resistance & buyer data quality** — messy existing Excel data slows activation.
- **Dealer adoption friction** — dealers must open the portal; if dealers won't, allocation value still stands on admin side but dealer self-service value erodes.
- **Insufficient ARPU** — Thai SME price anchors are low; ARPU may not clear onboarding/support costs.
- **Security/trust on sensitive allocation data** — tenants will not tolerate leaks of who-gets-scarce-stock; trust is a must.
- **Failure case framing:** the cleanest failure is a V1 that is "spreadsheet+chat but prettier" with no measured admin-time/dispute saving and no recurring constrained-supply customer to anchor ARPU. Guard by quantifying value with the first 1–3 pilots before scale.

---

## 12. Assumptions

- The target Thai importer/distributor segment genuinely experiences recurring partial supply / shortage / manual allocation (not proven by independent Thai data at this gate; `hypothesis` grounded in the frozen ICP and industrial FMCG distribution pain).
- An owner-operator decision can close a B2B sale quickly without a formal procurement committee (likely, but `unverified`).
- Dealer self-result + auditable allocation has enough perceived value for a *recurring* fee (hypothesis; spreadsheet-comfort may override).
- V1 non-goals (no ERP/inventory/WMS/finance/forecast engine) are commercially acceptable to the ICP — i.e., prospects accept a thin loop that does not also manage inventory/accounting (assumption; some may refuse an "extra system").
- WSM can onboard with near-templated import; otherwise unit economics break (§9).
- Thai SME willingness-to-pay for B2B ops SaaS sits around the local accounting/POS band (THB ~500–4,000/mo) — `hypothesis`.
- Dealer network is large enough (and SKUs many enough) that allocation is non-trivial — central assumption for value.
- No Thailand-specific regulatory dependency (e.g., mandatory dealer-portal compliance) affects adoption — assumed none.

---

## 13. Open questions / missing evidence

- **Quantified pain:** actual admin hours lost, allocation-error frequency, and dealer-dispute rate in a Thai importer/distributor — no public data; requires pilot measurement. **(biggest gap)**
- **Beachhead size with the *trigger* qualified:** how many of the 162,791 Thai wholesale/distribution entities are small/mid-size importers/distributors with dealer networks AND recurring constrained supply? The registry count is a total, not the qualified beachhead → `unverified`.
- **ARPU that a Thai mid-size importer will pay** for a supply/allocation layer specifically (versus bundled accounting/POS) — unknown.
- **Willingness to pay a monthly subscription vs. a per-round or annual fee** given seasonal cycles — unknown.
- **Dealer-side adoption willingness** to use a portal for self-result — assumption only.
- **Real onboarding cost** (assisted hours per tenant) — unknown until a pilot.
- **Whether WSM's ICP is already served by an incumbent** Thai B2B distribution platform in the target verticals (e.g., auto parts, building materials, FMCG) — a vertical-specific competitor sweep is incomplete.
- **CAC / sales-cycle cost** for SEA B2B SaaS at this pricepoint — no reliable data → `UNVERIFIED`.
- **Integration demand pressure** that would push V1 scope-creep into ERP/inventory — monitor.

---

## 14. Confidence 0–100

**67/100.**

Rationale: The pain is real and recurrent in a defined segment (grounded in the frozen ICP + industrial distribution/FMCG evidence + a large Thai wholesale/distribution registry pool). The wedge (truthful supply/demand/gap/allocation + auditable allocation + dealer self-result) is genuinely differentiated vs. spreadsheets and cheap inventory/accounting SaaS at V1 scope. However, confidence is capped because: (a) no independent Thai market-size qualified to the constrained-supply trigger exists; (b) the value case for a *recurring* fee is hypothesis, not measured; (c) Thai SME price anchors are low, so unit economics (ARPU vs. assisted onboarding) are unproven; and (d) the moat is thin and copyable, resting on niche focus and data lock-in rather than deep functionality. These are commercially addressable at the validation stage and do not, on current evidence, rise to a hard gate blocker — hence CONDITIONAL rather than NQ.
