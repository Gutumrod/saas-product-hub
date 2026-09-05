# CANDIDATE-A

Anonymized independent Council expert evidence for the WS01 Business/Market Gate. Identity-stripped. This is a raw expert input; it does not issue the gate verdict.

Role: INDEPENDENT Council expert. This is a raw evidence file only; it does NOT issue the gate verdict (Codex does that), does not authorize Phase 1, does not reopen the locked Product definition, and does not set final public prices (commercial values TBD by source-of-truth).
Scope: external market evidence gathered 2026-09-05; product claims grounded from `D:\AI-Workspace\projects\saas-product-hub\products\WSM\docs` only where a claim needs source support.

---

## 1. Recommendation

**CONDITIONAL — proceed toward a narrow, verified beachhead first; do NOT authorize broad Phase-1 go-to-market as currently scoped.**

Direction: There IS a credible recurring paid market for the WSM proposition, but only inside a deliberately narrow segment: **small-to-mid Thai importer/distributors (owner-operator or small admin team) with a dealer network, 100–5,000 SKUs, and RECURRING partial factory supply / shortage / manual allocation of scarce SKUs — today running on Excel + LINE.** For those, the pain is real, recurring, and costly, and the spreadsheet status-quo genuinely does not answer it.

The recommendation is CONDITIONAL (not UNCONDITIONAL) because three things must be proven before a commercial launch is coherent, and none is proven today:
1. That the "shortage + manual allocation + dealer-dependency" cluster is the buyer's *top* pain (not just a chronic annoyance) for a paying ICP sample;
2. That the V1 proposition (thin end-to-end loop, manual supply adapter, no ERP/inventory/WMS/finance) is recognized by customers as a *system of record for allocation*, not "another spreadsheet in a browser" — otherwise it collapses into order-management/ERP-lite commodity and loses pricing power;
3. That ARPU x retention can cover the real onboarding/migration/support cost, which for imported SKU/dealer/supplier master data and historical migration is non-trivial.

NOT qualified (NQ) on the beachhead size/count side: the reachable Thai beachhead count is only partially verifiable (see §10). The business model direction is sound; the *commercial coherence* still depends on unresolved V1 commercial policy (public price, trial, limits) that the brief explicitly keeps TBD.

I do not authorize Phase 1 implementation. Do not release sales/onboarding effort to build against a full ICP until the buyer-pain verification below returns positive.

---

## 2. Verified facts / evidence

All fetches performed 2026-09-05 (Asia/Bangkok). Where a claim is changing or could not be independently re-verified at fetch time, it is marked `UNVERIFIED` or `hypothesis`.

**Product grounding (repo):**
- WSM = multi-tenant B2B supply planning and dealer allocation SaaS; North Star Demand → Supply → Gap → Allocation → Fulfillment. (`products/WSM/docs/00_PRODUCT_VISION.md`)
- V1 thin end-to-end loop confirmed; manual supply entry is an explicit replaceable V1 adapter, not permanent identity. (`docs/01_PRD.md FR-SUP-001, FR-SPL-001`)
- Pricing doc separates billing state from feature entitlement; commercial values deliberately TBD; public-launch blockers (price, trial, limits) require owner approval. (`docs/04_PRICING_ENTITLEMENTS.md`)
- Supply-domain invariants: Requested≠Allocated≠Fulfilled; Ordered≠Confirmed≠Received; allocation derived (never silently copied); backorder explicit; manual override requires actor+reason+audit. (`docs/05_SUPPLY_DOMAIN_RULES.md`)

**External market evidence (with source):**
- **Allocation disputes are a real, litigated, recurring business problem.** A New York GMC dealer sued GM for $15M over inequitable new-vehicle allocation (2026-06). US state dealer laws (e.g., Minnesota) mandate "equitable/fair/reasonable" allocation and, on written request, disclosure of allocation method; dealer recordkeeping at each allocation cycle is treated as critical litigation evidence. Sources: autonews.com (2026-06-15), jdsupra.com (Foley & Lardner), bsm-law.com/allocation-lessons, mada.org. — This validates the *auditability + dealer-explanation* wedge as high-value, not decorative. (Automotive context; analogous dynamic, smaller scale, in Thai FMCG/parts/equipment distribution.)
- **Thai SMBs run trade on LINE + Excel and are under-servered by ERP.** Almostmind (Thai AI-ERP-in-LINE) states ~85% of Thailand's internet population uses LINE daily and 70% of ERP implementations fail. A Thai import-export case (Pinnacle Arc / Enersys, 350M THB/yr, 4,200 SKUs, 47 Excel files) reported ~23% inventory discrepancy and 3 days lost to an overwritten workbook; after a real ERP, order-processing time fell ~70% and data errors below 2%. Sources: almostmind.com/en, enersys.co.th/en/insights/odoo-erp-case-study-import-export-trading-thailand-2026. — Validates (a) Excel+LINE is the real status quo, (b) the spreadsheet-overwrite destruction pain is real, (c) the economics of fixing it are meaningful.
- **Competitive price bands for B2B dealer/wholesale ordering are low and monthly, validating that a small tenant can pay but capping ARPU unless differentiated.** OrderDock $20/$49/$99 per month flat (50/250/unlimited buyers); SparkLayer $49–$599/mo + $39/sales-agent, on Shopify; MiraB2B Starter/Growth custom quotes; XoroONE B2B portal (ERP-connected self-service ordering). Sources: orderdock.app, sparklayer.io/pricing, mirab2b.com, xorosoft.com.
- **Thai SME ERP-lite / commerce suites price around ฿590–1,490/mo** (Seller Pao Growth ฿590/mo, Pro ฿1,490/mo); Almostmind from ฿990/mo. Sources: sellerpao.com/en/features/erp, almostmind.com/en. — Establishes a realistic Thai ARPU anchor well below US/global B2B SaaS; WSM must price against Thai buyer willingness, not US bands.
- **Beachhead registry count (partially verifiable):** ~163k–166k registered wholesale/distribution entities in Thailand under DBD/NACE-46 / TSIC-46. ThailandSIC TSIC 46: 56,203 new registrations since 2022 (51,680 still active). InfobelPRO counts 162,791 DBD-sourced; companydata.com lists ~165,533. Sources: thailandsic.com/46, infobelpro.com, companydata.com/directory/thailand. — Beachhead *universe* ~160k; the true reachable, paying subset (owner-operated importer/distributor with real dealer networks and recurring shortage) is much smaller and only `hypothesis`-sized (see §3, §10).
- Gartner (2024) figure cited by a vendor: 83% of B2B buyers prefer digital ordering over phone/fax/fax-in-Excel — supports dealer-facing self-service tailwind. (`UNVERIFIED` — vendor-cited, not independently re-fetched.)
- Wholesale/SEA ERP-lite incumbents: PinCloud, ArionERP, SYSPRO TH, Lawson, Odoo (Thai localization) all serve Thai SME/mid distribution. Source: pinweicloud.com, arionerp.com, th.syspro.com, lawson.co.th, enersys/odoo. — Establishes the incumbent gravity WSM must avoid (see §5, §11).

---

## 3. Initial payer + beachhead

**Economic buyer (who signs/pays): the importer / distributor owner-operator or owner-led small operations/admin team.** In Thai SMEs this is usually the same person or a 2–4 person ops/admin cluster. The dealer is a demand-side actor and the supplier/factory is a supply-side actor; **neither is the SaaS payer.** This matches the locked definition.

**Operations user:** the admin/ops person who runs booking rounds, enters supply, does the manual allocation, and answers "why didn't dealer X get stock." This person feels the pain daily and is the internal champion, but the *decision to pay* rest with the owner, who is pain-sensitive around staff-hours, lost sales, and dealer friction.

**Dealer-demand actor:** 10–200 dealers who submit requests and see their own result. They consume the mobile-first booking link and self-service self-scoped result; their *adoption* (low-friction, no training) is a load-bearing retention factor.

**Supplier/factory actor:** entered as master data + supply position only in V1 (manual supply adapter). Not a platform participant V1.

**Narrowest credible first paying segment (beachhead):** "Multi-SKU Thai importer/distributor with a real dealer network, recurring *partial* factory/supplier supply or shortages on a meaningful SKU subset, currently coordinating Excel + LINE, with an owner who loses either staff-hours or dealer relationships to the allocation problem." Concrete test profile:
- 100–5,000 SKUs/variants (not SKU-simple single-line wholesalers — too little allocation need; not the SAP-scale enterprise — wrong buying motion);
- 10–200 active dealers;
- at least one SKU routinely sells short / sees partial factory delivery or delayed confirmed production on a recurring (monthly/seasonal) cycle;
- currently using shared Excel + LINE chats + owner memory for demand/supply/allocation;
- owner can articulate a specific recent loss: a dealer dispute, an oversell, a "why did A get it and not B" conversation, or lost sales due to late-discovered shortage.

**Conditions that make WSM worth PAYING for (all should be present, not just some):**
- Shortage/partial-supply recurs (weak pain if supply is plentiful — §11);
- The business runs discrete "rounds"/waves of dealer order-taking (booking-round pattern) rather than continuous ad-hoc reorder only;
- Allocation decisions involve judgment (who gets the scarce stock) and need to be *justifiable* to dealers;
- History/provenance matters (dealer disputes, audit, re-runs) — spreadsheet overwrite destroys it;
- Dealer network is large enough that answering dealers one-by-one is a real admin cost.

**Beachhead size is only `hypothesis`:** of the ~160k Thai wholesale registrations, the addressable subset matching the above is plausibly a few thousand (`hypothesis`), and reachable early-adopter beachhead for a Thai, Thai-language, LINE-comfortable SaaS is `unverified` without field validation. Counts are labeled `unverified` (§10).

---

## 4. Recurring pain and status quo

**Which pains are truly recurring + costly (for the beachhead):**
1. **Dealer requests scattered across LINE/chat/phone/email** → transcription, missed orders, duplicate requests. (High frequency, staff-cost + accuracy.)
2. **Duplicate/inconsistent Excel sheets** and version conflicts; **one overwrite destroys decision provenance.** (Proven by Pinnacle Arc case: overwritten Feb PO cost 3 days; 23% inventory discrepancy.) — Evidence-backed.
3. **Demand mistaken for committed order / ordered factory qty mistaken for confirmed production** → overselling, excess promises, allocation errors. (Core to WSM's Requested≠Allocated / Ordered≠Confirmed≠Received.)
4. **Shortage discovered late** → lost sales, angry dealers, firefighting.
5. **Manual allocation of scarce supply** is judgment-heavy, time-consuming, and **hard to justify to dealers** — "why did dealer A get stock and not B?" Dealer dissatisfaction, relationship damage. (Automotive allocation-dispute precedent §2 shows how consequential and litigable this is in larger markets; the Thai SME analogue is dealer churn/trust, not lawsuits.)
6. **Partial supply changes** → repeated shortage recalculation, re-allocation churn.
7. **Backorder tracking** scattered across sheets/chat/memory → missed fill, double-commit.
8. **History loss after spreadsheet overwrite** → cannot audit, cannot re-run, cannot explain past decisions.
9. **Owner dependency** — only the owner/admin "knows" the true position; single-point failure.

**Evidence of cost impact:** staff/admin hours (Pinnacle Arc: 3 people per order-processing lot → 1), lost sales and oversells, allocation errors, dealer dissatisfaction, excess promises, decision latency, owner bottleneck. These map 1:1 to the brief's cost list. Business-outcome magnitudes (e.g., "$X saved per round") are **`hypothesis`** until measured in the beachhead.

**Status quo (strongest "competitor"):** Excel, Google Sheets, LINE, WhatsApp, email, paper, owner memory, shared-drive files. **Why pay WSM instead of improving the spreadsheet?** Because the spreadsheet *cannot* answer the four questions WSM is built for: (a) what is *reliable* supply (not just a number in a cell), (b) where the *shortage* genuinely is without double-subtracting backorders, (c) a *traceable, audit-able* allocation record that survives overwrite, and (d) a *dealer self-serve result* that stops the "why not me" calls. A spreadsheet is a calculation surface; WSM is a state machine with provenance and a dealer-visible contract. The "improve my Excel" path is real and is the default, but it does not scale beyond one owner/admin and does not produce a defensible, dealer-visible allocation history.

---

## 5. Competitor evidence (direct / adjacent)

| Competitor | Category | Target | Pricing (verified source) | Allocation capability | Dealer portal | Notes |
|---|---|---|---|---|---|---|
| OrderDock (orderdock.app) | Wholesale ordering SaaS | Mfrs/distributors 10–500 emp | $20/$49/$99 per month (flat, 50/250/unlimited buyers) | Basic stock/shortage, not a real allocation record | Yes (buyer portal) | Low-cost generalist; no auditable allocation provenance |
| SparkLayer (sparklayer.io) | B2B ordering layer on Shopify | Shopify brands, distributors | $49–$599/mo + $39/agent; on top of Shopify/Shopify Plus | No real supply-gap/allocation engine | Yes | Ecommerce-origin; net terms/pricing, not shortage allocation |
| MiraB2B (mirab2b.com) | Dealer order system | Wholesalers w/ dealer networks | Starter/Growth; Enterprise custom | Order mgmt, stock display, virtual POS | Yes | SKU/warehouse/rep-scoped; sales-oriented, not supply-gap |
| XoroONE B2B Portal (xorosoft.com) | B2B self-service portal (ERP-connected) | Distributors on XoroONE ERP | Part of XoroONE (ERP-lite); enterprise | Inventory + allocation inside ERP | Yes | Incumbent-gravity path; requires their ERP |
| Odoo (Thai localization) | Modular ERP-lite | Thai SME/mid import-export/distribution | ~400–600k THB/yr for 52 users (`UNVERIFIED`, vendor case) | Full ERP incl. inventory/PO; not dealer-allocation-native | No thin dealer booking link | The credible "we'll outgrow to this" alternative |
| SYSPRO/Lawson/Arion/PinCloud (TH) | Thai distribution ERP | Thai SME/mid | custom/quoted | ERP-centric | varies | Incumbent gravity; heavy, not dealer-allocation-native |
| Almostmind (almostmind.com) | AI ERP in LINE | Thai SMBs | from ฿990/mo | inventory; not dealer allocation | LINE-based | Confirms LINE-first comfort; different wedge |
| Seller Pao (sellerpao.com) | Thai e-commerce OMS+ERP | Thai online/wholesale sellers | Growth ฿590/mo, Pro ฿1,490/mo | multi-warehouse stock | partial | E-commerce-origin; not importer-supply-gap |

Pricing for most Thai/local options is quote-based or bundled (`UNVERIFIED` for firm published prices). Min-contract/implementation fees are not uniformly published; assume negotiated for Thai ERP tier.

**Adjacent/generalist gap WSM claims:** none of the low-cost generalists (OrderDock, SparkLayer, MiraB2B) has a *supply-gap + auditable manual allocation + dealer self-scoped result* core; they solve order-intake and pricing. The ERPs (Odoo, SYSPRO, XoroONE) have supply/inventory but are not dealer-allocation-provenance-native and are heavier to adopt. This is WSM's defensible niche — IF the beachhead actually experiences the supply-gap pain (the main condition in §1).

Do not compare WSM to SAP-scale enterprise; the buying motion and ICP differ. (Noted in brief.)

---

## 6. Pain → Capability → Outcome → Business Value → Reason to Pay

**Supply truth (Ordered ≠ Confirmed ≠ Received).**
- Pain: ordered qty mistaken for confirmed/available supply → oversell, late-discovered shortage.
- Capability: separate ordered/confirmed/received supply facts with provenance/confidence.
- Outcome: owner knows "what is actually reliable."
- Business value: fewer oversells/excess promises, earlier shortage warning (`hypothesis` until measured).
- Reason to pay: prevents the single most expensive recurring error class (oversell + angry dealers).

**Demand truth (Requested ≠ Allocated ≠ Fulfilled).**
- Pain: dealer request treated as guaranteed stock; aggregate demand misread as committed.
- Capability: explicit, immutable request; allocation derived; fulfillment tracked; dealer told "request ≠ guaranteed."
- Outcome: honest demand picture, no double-commitment.
- Business value: allocation accuracy, reduced dealer disputes.
- Reason to pay: turns an informal promise into a state you can rely on.

**Gap (demand-vs-supply shortage visibility).**
- Pain: shortage discovered late; repeated recalculation; backorder double-subtract.
- Capability: computed reliable-supply position, explicit shortage per variant, backorder explicit (not auto).
- Outcome: "where the gap genuinely is" at a glance.
- Business value: time saved on firefighting + shortage-aware decisions.
- Reason to pay: the shortage is the event that makes "spreadsheet won't cut it" undeniable.

**Allocation (traceable manual/partial).**
- Pain: manual allocation is unfair-looking to dealers; "why A not B"; no audit trail.
- Capability: authorized manual/partial allocation, remainder→backorder, every override logged with actor+reason.
- Outcome: defensible, explainable, auditable allocation decisions.
- Business value: preserved dealer relationships; reduced dispute handling; owner de-bottlenecked.
- Reason to pay: the audit/explanation wedge is the most differentiated, highest-value reason (allocation-dispute evidence §2).

**Dealer communication (dealer sees own result without asking admin).**
- Pain: dealer "why not me" calls; admin answering one-by-one; dealer opacity.
- Capability: mobile-first booking link; dealer sees only their own requested/allocated/waiting result.
- Outcome: self-service, no training, no admin round-trip.
- Business value: admin-hours saved; dealer satisfaction; digital-ordering tailwind (Gartner 83% `UNVERIFIED`).
- Reason to pay: removes the repetitive admin burden that is the owner's daily annoyance.

**History (no spreadsheet overwrite destroying provenance).**
- Pain: overwritten workbook → lost decisions, no re-run, no audit (Pinnacle Arc: 3 days recovery).
- Capability: history over overwrite; full revision provenance.
- Outcome: decisions reproducible and defensible anytime.
- Business value: trust, auditability, dispute resolution.
- Reason to pay: this is the wedge a spreadsheet physically cannot match.

All business-value magnitudes are `hypothesis` until a beachhead pilot measures admin-time saved, dispute reduction, allocation accuracy, etc. (brief's downstream-validation list).

---

## 7. Differentiation

Wedge (defensible, not "spreadsheet but prettier"): **truthful supply-state separation + shortage visibility + auditable allocation decision record + dealer self-result**, in one thin loop — versus:
- **Spreadsheets/Sheets:** no state machine, no provenance, no dealer-facing contract, no shortage computation that survives overwrite.
- **ERP / inventory systems (Odoo, SYSPRO, XoroONE):** supply/inventory generalists; dealer-allocation-as-auditable-record and dealer self-scoped result are not where they lead; heavier adoption burden, longer sales cycle, higher price.
- **Order management / generic B2B ordering portals (OrderDock, SparkLayer, MiraB2B):** order intake + customer pricing; no supply-gap engine, no manual allocation provenance, no dealer-result-with-justification.
- **Owner memory:** the null option; WSM removes single-point owner dependency.

What makes the wedge *defensible*: it is built around the specific, recurring, costly shortage/allocation event, tied to dealer trust and admin de-bottlenecking — a pain the generalists price themselves away from and the ERPs bury under scope. The audit/provenance dimension in particular turns "we gave stock to A not B" from an argument into a reproducible record, which is the strongest defensible wedge per §2 evidence. The risk: if the beachhead's allocation pain is too shallow/rare, the whole differentiation collapses to "cheaper order portal," which is commoditized at $20–99/mo (§5). Differentiation is therefore real but **conditional on the shortage+dealer-network ICP**.

---

## 8. Monetization direction (commercial values TBD — do not invent final prices)

The brief forbids inventing final public prices; direction only.

**Primary anchor: monthly B2B per-tenant** — recurring, aligns with the North Star, simplest billing. Anchor to *tenant* (the importer business), not per-dealer, so tenant growth (adding dealers) is not punished by billing churn.

**Tiering dimensions that correlate with value (candidates, evaluate for billing simplicity):**
- **Active dealers** — correlates with "how much admin/dealer-serve value": the more dealers, the more the self-serve result and the bigger the allocation burden. Good value-correlated, simple meter.
- **Active variants/SKUs** — correlates with catalogue/complexity; reasonable but secondary to dealers for the wedge.
- **User seats / operational roles** — minor for a 2–4 person ops team; don't over-weight; seats add billing friction for little value in this ICP.
- **Booking/allocation volume (rounds/order lines)** — optional usage lever; risk of unpredictable bills (see SparkLayer order-limit overage as anti-pattern). Prefer generous included volume + high overage rather than hard caps early.
- **Advanced allocation policies / automation / API / integrations** — natural up-sell tier for growing tenants (once allocation is proven, automation is the expansion hook). Keep out of V1 base.
- **Onboarding/data-import fee** — justify as a separate setup/onboarding charge (import SKU/dealer/supplier master + historical data is real work; §8). One-time or amortized, not baked silently into price.
- **Enterprise controls / audit export / multi-warehouse** — higher tier for more demanding tenants.

**Avoid (direction):** transaction / take-rate revenue should not be assumed (the brief flags this); don't make WSM's success depend on % of dealer GMV. Don't lead with per-SKU or per-round hard caps that make the bill unpredictable. Don't price WSM against US bands (§2) — Thai willingness anchors lower (Seller Pao ฿590–1,490/mo, Almostmind ฿990/mo are the realistic Thai SMB reference window), so ARPU is modest and must be offset by low onboarding cost and thin-loop focus, not by high monthly price.

---

## 9. Sales / onboarding / delivery model

**Realistic initial sale:** **owner-led demo → assisted/hands-on onboarding**, not pure self-serve and not consultative-enterprise. The Thai owner-operator decides; a 30–45 min owner-facing demo showing "your shortage round, your allocation, your dealer seeing their result" converts far better than a signup flow. Some co-selling through existing Thai B2B-software/SaaS channels or LINE-OA is plausible.

**Onboarding burden (real, must be engineered down):** SKU/variant master import (from Excel), dealer master import, supplier/factory mapping, *some* dealer-code rollout + booking-link distribution to 10–200 dealers, and optionally historical demand/supply migration. The brief correctly warns this is non-trivial.
- **Mitigations:** an Excel import wizard for masters (copy-paste-to-preview is enough for hundreds of SKUs), a simple dealer-link share (no dealer account setup — dealers click a scoped link), and a "start with next round" migration policy (don't backfill old history on day one; let provenance accumulate forward). This keeps onboarding to hours, not weeks, and is what makes low ARPU viable.
- **Historical-data migration:** treat as optional/tiered, not a launch gate. V1 value is forward-looking allocation truth; backfill is a later enterprise feature.

**Delivery:** cloud multi-tenant SaaS (per locked identity); V1 manual supply adapter. Support burden must be lean: Thai-language, LINE/support-channel-first, an onboarding runbook, and self-serve dealer links to avoid dealer-support tickets.

**Economics check:** plausible Thai ARPU (low hundreds ฿/mo to low thousands) must cover onboarding/support cost. The thin-loop + forward-looking-migration policy is the lever that keeps cost/ARPU sane. If onboarding balloons (deep integration asks, heavy migration), the economics break — that is a §11 risk.

---

## 10. Acquisition / activation / retention

**Acquisition triggers (natural moments):** a major shortage or factory delay (pain peaks), a dealer network growth spurt, Excel becoming unmanageable/overwritten, repeated "why not me" allocation disputes. The shortage event is the strongest inbound/cold-call trigger because it makes "spreadsheet won't cut it" undeniable. Messaging should be event-triggered ("got a partial factory shipment? here's how to allocate it defensibly").

**Activation (hypothesis, from brief):** one real booking round that reaches Gap + allocation successfully with at least 1–2 dealers using the self-scoped link. This is the Aha moment and the retention cliff.

**Retention (pay month 2+):** recurring dealer booking rounds (a natural monthly/seasonal cadence), recurring supply updates (partial deliveries keep returning), shortage management as the habitual workflow, allocation history + auditability accumulating value, dealer dependency (dealers come to rely on seeing their result), accumulated SKU/dealer/supplier data creating switching cost. The more rounds run, the higher the barrier to leaving — provided the pain recurs (weak if supply is plentiful).

**Metrics that matter downstream (not a gate blocker, must be measured):** conversion, activation (first Gap+allocation), month-2 and month-3 retention, churn, CAC, admin-time saved, dispute reduction, allocation accuracy, ARPU (§6 hypothesis list). None proven yet → retention is `hypothesis`.

---

## 11. Commercial risks / failure cases

1. **Excel good-enough** (highest risk): if the beachhead's shortage/allocation pain is shallow or rare, WSM loses to the free spreadsheet. Mitigate: sell into event/ICP where recurrence is provable.
2. **ERP/inventory incumbent** (Odoo, SYSPRO, XoroONE, Thai ERP-lite): customers "outgrow to" ERP or an existing ERP is the alternative. Mitigate: position WSM as the dealer-allocation provenance layer, not an ERP-replacement.
3. **Integration expectations:** prospects may demand POS/ERP/e-commerce integration (Seller Pao, TDFB-Odoo show Thai buyers value connected stock). V1 explicitly non-goals ERP/inventory/logistics; a hard expectation mismatch loses deals. Mitigate: state V1 boundary honestly; route integration demand to the expansion tier.
4. **Migration complexity / onboarding load:** SKU+dealer+supplier import and dealer rollout are real cost; if it overruns, low-ARPU economics break (§8). Mitigate: import wizard + forward-policy + thin loop.
5. **Long B2B sales cycle / owner inertia:** Thai owner-operator may defer; shortage-event urgency must anchor the sale. Mitigate: owner-led demo + event-triggered outreach.
6. **High onboarding/support cost** against modest ARPU: the #1 economics risk.
7. **Niche ICP too narrow** to support initial validation (§1 condition).
8. **Bespoke-workflow pressure / WSM-becomes-custom-ERP:** each tenant wants their allocation rule/format; if WSM bends per-customer it loses thin-loop focus and becomes a services business. Mitigate: tenant-configurable policy but bounded; refuse one-off builds. (The Product is explicitly tenant-configurable-policy, not per-customer code.)
9. **Weak pain when supply is plentiful:** allocation value shrinks in a surplus market; recurrence must be a qualification criterion.
10. **Seasonal/intermittent allocation cycles:** if buyers only need WSM in shortage season, they churn off-season. Mitigate: pricing anchors to rounds so the system stays in use; make non-shortage time still the booking/supply system of record.
11. **Switching resistance / staff habit:** ops keep using Excel/LINE; the admin (champion) must switch workflows. Mitigate: LINE-comfortable UX, minimal training.
12. **Buyer data quality:** garbage SKU/dealer/supplier masters defeat V1. Mitigate: import validation/preview at onboarding.
13. **Dealer adoption friction:** if dealers won't use the booking link, admin does work anyway and value halves. Mitigate: zero-training scoped link, mobile-first.
14. **Insufficient ARPU:** if real Thai willingness is ~฿1k/mo and onboarding is high, per-deal LTV may not cover cost. Mitigate: thin loop + forward-policy migration + value-tier up-sell.
15. **Security/trust around sensitive allocation data:** tenants handle commercially sensitive dealer allocation; breach/leakage kills trust. Mitigate: tenancy + server-authorization + audit (§2 product invariants are aligned: SEC-TEN/DLR/AUD).

---

## 12. Assumptions

- The beachhead ICP (multi-SKU importer/distributor, 10–200 dealers, recurring partial supply/shortage, owner-operator, Excel+LINE) is the correct initial market; assumption, not yet field-verified.
- The recurring shortage/allocation pain is real and costly *for these tenants at a willingness-to-pay threshold* — evidence supports prevalence (Excel/LINE status quo) but not yet willingness-to-pay magnitude.
- Thai B2B SaaS ARPU can support this if onboarding is kept thin — based on Thai reference prices (฿590–1,490/mo) but not on WSM-attributable data.
- Dealers will use a zero-training scoped booking link at acceptable adoption rates (Gartner digital-ordering preference is vendor-cited `UNVERIFIED`; Thai LINE comfort supports it but is not WSM-proven).
- Audit/explanation value is worth paying for at Thai SME scale (extrapolated from larger-market allocation-dispute evidence; `hypothesis` at this scale).
- Historical-data migration can be deferred (forward-accumulating provenance is acceptable to the buyer).
- Owner is the decision-maker and is pain-accessible via shortage-event-triggered outreach (not a multi-level procurement cycle).

---

## 13. Open questions / missing evidence

1. **Willingness-to-pay magnitude** at Thai SME importer scale (vs. the ฿590–1,490/mo anchor) — unmeasured; the decisive unknown.
2. **Retention/churn** (month-2+ behavior) and real CAC — none exists pre-launch (`hypothesis`).
3. **True reachable beachhead count** of the specific ICP (the ~160k DBD wholesale registrations is the universe, not the beachhead; the paying subset is `unverified` without field/DBD profiling).
4. **Dealer adoption realism** in a Thai dealer network (would dealers actually use the scoped link / self-service result?).
5. **Whether "allocation-dispute/audit" value translates** from litigated US automotive scale to Thai SME dealer-trust terms (`hypothesis`).
6. **Integration expectations ceiling** — how many beachhead candidates will reject a V1 with no ERP/POS/e-commerce integration.
7. **Seasonality** of the allocation pain across target niches (which categories recur year-round vs. seasonally).
8. **Competitor undercutting of the ordering-portal slice** (OrderDock $20–99/mo) if WSM is perceived as just order-intake.
9. **Public price, trial, limits, overage** — owner/TBD per §8; unresolved and gate-affecting (§1 condition 3).
10. **Measured admin-time saved / dispute reduction / allocation accuracy** — the downstream metrics that would validate §6 business value; not yet available (correctly classified downstream per brief).

---

## 14. Confidence 0–100

**62 / 100** — credible recurring paid market exists for a narrow ICP, supported by strong external evidence (Excel+LINE status quo, spreadsheet-overwrite loss, allocation-dispute/audit gravity, Thai B2B SaaS price anchors, ~163k wholesale-registration universe). The proposition is well-differentiated against cheap order-portals and generalist ERPs *for the shortage+dealer-network beachhead*.

Deductions: (a) willingness-to-pay and retention are unmeasured pre-launch; (b) the reachable beachhead count is `hypothesis`/`unverified`; (c) dealer adoption and integration-expectation ceilings are unproven; (d) V1 commercial policy (price/trial/limits) is unresolved; (e) the wedge collapses if the beachhead's allocation pain proves shallow/rare.

This is a conditional, evidence-backed commercial direction — not an unconditional green light. The gate verdict itself is Codex's, not mine.

---
