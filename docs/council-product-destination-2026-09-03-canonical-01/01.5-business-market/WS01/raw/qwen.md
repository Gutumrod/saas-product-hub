# WS01 WSTERA Supply Management — Raw Expert Evidence (Business/Market Gate)

Expert: Qwen (independent council expert — raw evidence answer only; no gate verdict issued here; no Phase 1 authorization; no reopening of the locked product definition).
Brief: `COUNCIL-BRIEF.md` (frozen 2026-09-05, llm-council-gate v0.3.2). All external sources fetched 2026-09-05 unless noted. Claims that change over time or could not be verified against a live authoritative source are marked `UNVERIFIED`. Unproven business outcomes are marked `hypothesis`. No final public prices are invented — commercial values remain TBD by source-of-truth.

---

## 1. Recommendation

**CONDITIONAL** — direction: the recurring paid market is credible for a *narrow beachhead* (Thai importer/distributor owner-operators with active dealer networks and recurring partial factory supply, currently running bookings/allocation on Excel + LINE), but only under explicit conditions; it is not unconditional.

Conditions (each must be validated; none is a blocker today):

1. **Shortage-recurrence condition.** The ICP must have *recurring* supply/allocation rounds (monthly/quarterly booking cycles or frequent partial-shipment episodes). Importers with plentiful supply or one-off shortage events will not retain a subscription (weak pain risk — Section 11).
2. **Reachability condition.** WSM must be able to reach and close Thai mid-size importer/distributors economically (owner-led demo + assisted onboarding; days-level onboarding, not weeks). Thailand establishment counts for wholesale businesses could not be verified in this research (`UNVERIFIED`) — beachhead size is plausible but unquantified.
3. **Wedge-discipline condition.** The proposition must stay at "allocation truth + dealer-visible result" and must NOT drift into inventory/ERP replacement. Thai and international incumbents (Zort booking feature, Unleashed/inFlow/Cin7 B2B portals) already own adjacent ground; WSM's differentiation survives only on the supplier-truth + auditable manual allocation record + dealer self-result combination (Section 7).
4. **ARPU-vs-onboarding condition.** Plausible Thai B2B ARPU (Section 8) must fund assisted onboarding and Thai-language support. Published Thai SaaS anchors (Zort ฿1,584–2,666/mo retail tiers, ฿59k–99k/yr corporate tiers; FlowAccount ฿199–549/mo) and international anchors ($129–$729/mo inventory/order systems; $900+/mo planning tools) suggest the band exists, but willingness-to-pay for *this* workflow is `hypothesis` until first paid pilots.
5. **Dealer-side adoption condition.** Dealers are non-payers and are likely LINE-native; WSM's dealer visibility must work with near-zero dealer effort (link-based or LINE-integrated self-result), otherwise activation fails at the demand-actor layer.

Bottom line for the gate inputs: payer, recurring pain, and monetization direction are coherent and externally evidenced at the category level; the specific ICP pay-rate and beachhead size remain unproven and must be classified as pilot-stage validation, not assumed.

---

## 2. Verified facts / evidence

All sources fetched 2026-09-05. URL + what was verified:

**Thailand operating environment (demand-side context)**

- LINE is the dominant messaging/commerce channel in Thailand: **56M monthly active users, 78.2% of population, 85.7% of internet users** (Jan 2025, figures "shared with us by LINE" per DataReportal). https://datareportal.com/reports/digital-2025-thailand
- Thai chat commerce (commerce transacted through chat, overwhelmingly LINE): **฿462B (2023) → ฿1.14T forecast (2028), CAGR 19.2%**, per LINE Thailand, reported by Bangkok Post, 16 Jan 2024. https://www.bangkokpost.com/business/general/2724639/chat-commerce-set-to-surge — This is direct external evidence that Thai dealer↔supplier commerce is transacted inside chat, not systems.
- Thai SME base: **>3.2 million SMEs = 99.5% of all enterprises** (OSMEP, cited by Nation Thailand and Microsoft Asia, Mar 2025). https://www.nationthailand.com/blogs/business/trade/40044166 ; https://news.microsoft.com/source/asia/2025/03/31/microsofts-smes-ai-skills-summit-en/ — OSMEP↔LINE also run an SME digital-partnership program (Khaosod English, 30 Sep 2024), reinforcing that Thai SME ops run on LINE.
- Wholesale + retail trade is Thailand's **2nd-largest sector: ฿3.2 trillion in 2025 = 16.4% of GDP** (Krungsri Research, Industry Outlook Modern Trade 2026–2028, published 30 Apr 2026, citing NSO-based aggregates; Euromonitor modern-retail value ฿4.5T in 2024). https://www.krungsri.com/en/research/industry/industry-outlook/wholesale-retail/modern-trade/io/modern-trade-2026
- Number of Thai wholesale establishments/juristic persons: **not successfully retrieved** from DBD (JS-rendered portal) or NSO census pages this session — `UNVERIFIED`. The 2022 NSO trade & services census (data year 2021) exists and covers wholesale, but the count was not extractable from fetched pages. https://gdcatalog.go.th/dataset/gdpublish-0404-12-0008

**Thai-local competitor / substitute products (dealer & booking workflows)**

- **Zort (Thai inventory/order SaaS) sells a "ระบบจองสินค้า" (product booking) feature aimed exactly at stock-shortage pain**: marketing copy names "สินค้าไม่พอขาย" (stock insufficient), "สินค้าขาด ๆ เกิน ๆ" from "ออเดอร์ทับซ้อน" (overlapping/duplicate orders), and lets agents reserve stock in-system. https://zortout.com/package-dropship — Retail packages: Starter ฿600/mo, Professional ฿1,500/mo, Business ฿2,666.67/mo (monthly billing); Corporate ฿59,000/yr, Advanced ฿99,000/yr; dropship/booking package from ฿1,584/mo (฿19,000/yr), capped 2,000 transactions/mo; add-ons e.g. +1 user ฿3,900/yr. https://zortout.com/package — This is strong evidence the pain is real enough that a Thai vendor monetizes it, and that the Thai price band for adjacent SaaS is low thousands of THB/month.
- **Smith (smith.in.th)** — Thai dealer-management system for brand owners with dealer networks (cosmetics, supplements, MLM): stock-based / dropship / consignment / sales-team dealer models, dealer cards, tiered dealer pricing, points, dealer sub-sites, marketplace integrations (Lazada/Shopee/TikTok Shop/LINE Shopping). Pricing not published. https://www.smith.in.th
- **Fusion Solution "Reseller Solution"** — Thai dealer-management system; its marketing literally lists the pain: missed/un-keyed orders, lost documents, wrong data, wrong delivery/billing dates, customer dissatisfaction. Pricing unpublished ("ราคาประหยัด"). https://www.fusionsol.com/reseller-solution/
- Other Thai-adjacent systems surfaced (not fully fetched): Shipnity dropship/dealer ordering, LYNA General Distributor System (Odoo-based), Bplus Order Entry (booking documents with expiry inside an ERP), custom dealer systems by agencies (Idea Idesign). Sources: DDG search snippets, 2026-09-05.

**International inventory / order-management comparables (published pricing)**

- **Zoho Inventory**: $29/$79/$129/$249 per org/mo (2 users base; +$7.5/user), 500–15,000 orders/mo caps; backordering included from the Free plan; customer portal (Standard+), vendor portal (Professional+). https://www.zoho.com/inventory/pricing.html
- **inFlow Inventory**: $129 / $349 / $699 / ~$2,249 per mo (annual billing); 2/5/10/25 users; 1,200–unlimited sales orders/yr; B2B Showroom portal; one-time onboarding $499 (required Mid-Size+), services $199/hr. https://www.inflowinventory.com/software-pricing-inflow
- **Unleashed**: Core $399/mo (3 users, 100 sales orders/mo), Pro $729/mo; order-volume upgrades up to $490/mo unlimited; B2B eCommerce store add-on from $129/mo; onboarding $449–$5,549 one-off. https://www.unleashedsoftware.com/pricing
- **Cin7 Core**: $349 / $599 / $1,199 per mo; 5/10/15 users; 6k/24k/120k sale orders/yr; B2B Portal is a paid add-on on all tiers; API is an add-on. https://www.cin7.com/pricing/
- **Katana Cloud Inventory**: Core from $299/mo usage-based (unlimited users, orders billed by usage); optional onboarding $2,000; manufacturing add-on $199/mo; target = SMB product brands. https://katanamrp.com/pricing/

**B2B wholesale-ordering portal comparables**

- **B2B Wave**: £270/mo Pro and Scale (promo £135/mo first 3 months); unlimited orders/quotes/customers; 10–100 users; 20k–500k SKUs; 0% transaction fee; onboarding optional paid add-on on Pro, included on Scale; ERP/accounting integrations (QBO, Xero, Brightpearl). https://www.b2bwave.com/pricing/
- **OrderEase**: from **$17/day (~$510/mo)**, quote-based by channels/volume; unlimited users; B2B ordering portal, EDI, order automation. https://www.orderease.com/pricing
- **Brandboom**: $50–$83/mo entry (annual), Business ≈$149/mo (page JSON-LD), Enterprise custom; buyer portal, unlimited orders. https://www.brandboom.com/pricing
- **NuORDER by Lightspeed**: no public pricing, demo-gated. https://www.nuorder.com
- **Shopify B2B**: included in all self-serve plans (up to 3 catalogs); unlimited catalogs on Plus from $2,300/mo. https://www.shopify.com/pricing

**Supply-planning comparables (allocation/forecast side)**

- **Netstock**: from **$900/mo**, annual, quote-based; implementation typically 6–10 weeks; ERP-integrated demand/replenishment planning; ISO 27001. https://www.netstock.com/pricing/
- **Flowlity**: no public pricing; FAQ states mid-market SaaS "often start in the tens of thousands per year"; go-live <2 months; has supplier/customer collaborative portal. https://www.flowlity.com
- **GMDH Streamline**: no public pricing, customized quotes. https://gmdhsoftware.com/pricing
- Fair-share allocation of scarce supply is a *built-in automated* feature of enterprise planning systems: Oracle SCM fair-share rules (https://docs.oracle.com/en/cloud/saas/readiness/scm/26b/demand26b/26B-demand-wn-f42977.htm), SAP IBP fair share (learning.sap.com), ToolsGroup allocation strategies (toolsgroup.com). No surveyed SMB-priced product centers *manual, auditable* allocation decisions as the core object.

**ERP-lite anchor**

- **Odoo**: $16.90–$25.50/user/mo (yearly billing; promo $13.50/$20.40), all apps including Inventory/Sales/Purchase; portal users free. https://www.odoo.com/pricing
- **FlowAccount (Thai SMB accounting SaaS anchor)**: ฿199/฿299/฿549 per mo (annual from ฿1,990/฿2,990/฿5,490); claims 160,000+ Thai SME users; inventory from Pro tier. https://flowaccount.com/pricing — evidence that Thai SMB SaaS willingness-to-pay exists but is price-sensitive.

**Category-history risk evidence**

- **TradeGecko → QuickBooks Commerce sunset**: acquired by Intuit Aug 2020 ($80M+); standalone sunset announced Jun 2021; platform retired Jun 10–Jul 13, 2022 (non-US first); QuickBooks Commerce fully discontinued **Aug 31, 2023**. Sources: DDG result set incl. unleashedsoftware.com/blog/quickbooks-commerce-sunset/, inflowinventory.com/blog/quickbooks-commerce-sunset/, sku.io/tradegecko-what-happened/, quickbooks.intuit.com community threads (fetched 2026-09-05); Wikipedia confirms the $80M acquisition (https://en.wikipedia.org/wiki/TradeGecko). SMB inventory/order SaaS consolidation risk is real, not hypothetical.

**Supply/allocation pain evidence (sourcing practice, importer-side)**

- Factory allocation under shortage is standard industry reality: "On allocation" = "instead of shipping what you ordered, the factory decides how much each customer gets" (electronic components; GlobX guide). https://globx.eu/blog/supply-chain-insight/electronic-component-allocation
- Export/capacity-shortage order-allocation guidance for importers: distinguish binding commitments from forecasts, predeclared priority rules, partial-shipment scenarios, reconcile every promise as capacity changes. https://www.aizn.com/en/blog/aizn-export-capacity-shortage-order-allocation-guide
- Partial-shipment buyer playbooks for importers (PO-Relay), and partial-shipments/backorders "kill cash flow if mismanaged" for wholesale (Vndly 2026 guide; BetterCommerce). https://porelay.com/open-loops/partial-shipment-from-supplier ; https://www.vndly.io/blog/how-to-manage-partial-shipments-and-backorders-2026

---

## 3. Initial payer + beachhead

**Actors separated per brief:**

- **Economic buyer (payer):** importer/distributor owner-operator (or managing director) of a Thai mid-size distribution business — the person who absorbs dealer disputes personally and pays for anything that reduces them. Owner-operators decide fast but are price-sensitive and hands-on.
- **Operations user:** 1–3 admin/ops staff who currently consolidate dealer requests from LINE, maintain the Excel master, chase factories, and execute allocation rounds.
- **Demand-side actor:** dealers (ร้านค้า/ตัวแทน) — non-payers, LINE-native, mobile-first; they send requests in chat and want answers fast.
- **Supplier-side actor:** factory sales rep / merchandiser who confirms (or partially confirms) production quantities via chat/email.

**Narrowest credible first paying segment (beachhead candidate):**

Thai mid-size importer/distributor (roughly 5–50 staff) that simultaneously has:

1. 20–200 active dealers/shops placing recurring reservations per round (big enough that chat-reply burden and disputes are real; small enough that an enterprise tool is overkill);
2. multi-SKU exclusive or semi-exclusive distribution (own territory/dealer network — allocation decisions actually matter);
3. recurring partial factory supply — monthly/quarterly booking rounds, allocated quotas, or frequent partial shipments (the shortage-recurrence condition);
4. today's stack = Excel (or Google Sheets) + LINE groups, with the Excel owned by 1–2 key staff;
5. a history of allocation disputes or re-explanations ("why did dealer A get stock and I didn't?").

**Verticals where this pattern plausibly concentrates (to be validated, `hypothesis` for fit):** electrical/electronics & appliance distribution (Krungsri notes electrical/electronics = 13.1% of online retail share, fast-growing, implying deep dealer networks), building materials & hardware distribution, auto parts & accessories, FMCG sub-distribution, cosmetics/supplement brands with dealer networks (note: this last vertical is already served by Zort/Smith — WSM must win on allocation/supply truth, not dealer commerce).

**Conditions making WSM worth paying for:** recurring shortage cycles + dealer network above ~20 + allocation disputes with visible cost (angry dealers, lost reorders, owner time) + dependency on one Excel file that only one staff member understands. Importers without these (plentiful supply, tiny dealer counts, one product line) are NOT the initial payer — the brief's warning against assuming "every importer is a good customer" is externally consistent with the competitor landscape.

**Explicitly NOT the initial payer:** factories (supplier-side ERP already exists), end consumers, dealers themselves (non-payers per locked identity), large enterprises (they buy SAP/Oracle/Netstock-class systems).

---

## 4. Recurring pain and status quo

**Which pains are truly recurring + costly (evidence-graded):**

| Pain (from brief) | External evidence | Grade |
|---|---|---|
| Dealer requests scattered across LINE/chat | LINE = 56M MAU / 78.2% of TH population; Thai chat commerce ฿462B (2023) → ฿1.14T (2028F) — chat is *the* commerce rail | Verified as the environment; per-company burden `hypothesis` |
| Ordered factory quantity mistaken for confirmed production | "On allocation: the factory decides how much each customer gets" (GlobX); importer guidance to separate binding commitments from forecasts (AIZN) | Verified as a known industry failure mode |
| Partial supply changes mid-cycle | Partial-shipment playbooks; "partial shipment creates a scheduling decision most systems handle poorly" (User Solutions) | Verified as known; Thai-frequency `hypothesis` |
| Duplicate/inconsistent Excel, lost history after overwrite | Status-quo norm; Fusion Solution sells against "missed/un-keyed orders, lost documents"; Zort sells against "ออเดอร์ทับซ้อน" | Verified as pain Thai vendors monetize; spreadsheet-overwrite specifics `hypothesis` |
| Manual allocation of scarce supply + inability to explain why A got stock and B didn't | Fair-share allocation is formalized in Oracle/SAP/ToolsGroup for enterprises; SMB tools have no manual-audit-allocation object | Category verified; SMB incidence `hypothesis` |
| Backorder tracking, fulfillment divergence from allocation | Backorders/partial shipments "kill cash flow if mismanaged" (Vndly/BetterCommerce) | Verified as costly category |
| Dealer disputes / dissatisfaction | Fusion Solution marketing names customer dissatisfaction from order errors; Zort names overlapping orders | Vendor-claimed; plausible; Thai dispute cost `hypothesis` |
| Staff/admin cost, decision latency, owner dependency | No direct quantified Thai evidence found this session | `hypothesis` |

**Status quo (strongest competitor) and the honest answer to "why pay WSM instead of improving the spreadsheet?":**

- Excel + LINE is free, flexible, zero onboarding, and owner-trusted. It fails not at recording but at *state discipline*: nothing in a spreadsheet forces `Requested ≠ Allocated ≠ Fulfilled` or `Ordered ≠ Confirmed ≠ Received` to stay separated across rounds; nothing prevents gap double-subtraction of backorders; nothing preserves decision provenance after copy-paste/overwrite; and nothing shows each dealer only their own scoped result — so staff manually re-answer the same LINE questions every round.
- Therefore the pay-logic is not "better spreadsheet"; it is: (a) enforce supply-state truth so promises stop being mistaken for commitments; (b) make the allocation decision a recorded, explainable object; (c) let dealers self-serve their own result; (d) accumulate history that survives staff turnover. When a shortage round goes wrong publicly (dealer sees an inconsistency), the cost of the status quo becomes visible — that is the conversion moment (trigger mapping in Section 10).
- Counter-truth: for a distributor with 10 dealers and one shortage a year, Excel remains good-enough and WSM will churn. WSM's market is the *recurring-rounds* subset, not all importers.

---

## 5. Competitor evidence

Categories per brief; pricing verified where published; all fetched 2026-09-05.

**A. Thai dealer/dropship/booking systems (closest local substitutes)**

| Product | Target | Price (verified) | Allocation capability |
|---|---|---|---|
| Zort (zortout.com) | Mid/large stores with ตัวแทนจำหน่าย networks | Starter ฿600/mo, Pro ฿1,500/mo, Business ฿2,666.67/mo; Corporate ฿59k/yr, Advanced ฿99k/yr; booking/dropship pkg from ฿1,584/mo; add-ons published | Booking/reservation of stock by agents (จองสต๊อก) — first-come reservation, retail-order oriented; **no supplier-side Ordered/Confirmed/Received truth, no manual allocation-round object** |
| Smith (smith.in.th) | Brand owners with dealer networks (cosmetics/supplements/MLM) | Not published | Dealer orders in 3 models (stock/dropship/consign), tier pricing, dealer cards — dealer-commerce centric, not supply-allocation centric |
| Fusion Solution Reseller Solution | Businesses with reseller networks | Not published | Order/debt/commission admin for resellers; ERP-lite flavor |
| Bplus Order Entry (ERP module), LYNA (Odoo), Shipnity, Idea Idesign (custom) | ERP users / brand sellers | Not published | Booking documents inside ERP; dropship ordering; bespoke builds |

Reading: the Thai market already pays low-thousands THB/month for dealer-order plumbing — but every surveyed local product treats *booking* as a retail-order or reservation gimmick, not as an allocation decision over unreliable factory supply. (All fetched 2026-09-05; Smith/Fusion pricing unpublished.)

**B. International inventory/order management (published pricing)**

| Product | Entry → top price | Users | Orders | B2B portal | Allocation |
|---|---|---|---|---|---|
| Zoho Inventory | $29 → $249/org/mo | 2 (+$7.5/user) | 500–15k/mo | Customer portal Std+, vendor portal Prof+ | Backorders; no allocation rounds |
| inFlow | $129 → ~$2,249/mo | 2–25 | 1.2k/yr–unlimited | B2B Showroom; Showroom Pro $59/mo | Backorders; no allocation engine |
| Unleashed | $399 → $729/mo (+upgrades) | 3–5 | 100/mo base, upgrades | B2B store add-on $129/mo | Backorders; no allocation engine |
| Cin7 Core | $349 → $1,199/mo | 5–15 | 6k–120k/yr | B2B Portal paid add-on | Wholesale mgmt; portal add-on; no manual allocation record |
| Katana | from $299/mo usage | unlimited users | usage-based | — | Replenishment/forecasting add-ons; not allocation |

**C. B2B ordering portals:** B2B Wave £270/mo (promo £135); OrderEase from ~$510/mo; Brandboom $50–149/mo; NuORDER quote-based; Shopify B2B included (Plus from $2,300/mo). These solve *catalog ordering and price lists* — the dealer-side shopping experience — not the importer's scarce-supply allocation decision.

**D. Supply planning / forecasting:** Netstock from $900/mo (6–10 week implementation); Flowlity quote-based ("tens of thousands per year" for mid-market); Streamline quote-based; Katana planning add-ons. These optimize *replenishment and forecasts* — they assume you can buy what you plan; they do not run the importer's dealer-round allocation.

**E. ERP-lite/ERP:** Odoo $16.90–25.50/user/mo (all apps; portal users free); FlowAccount ฿199–549/mo (Thai; inventory from Pro). ERP can hold the data but demands process redesign; FlowAccount proves Thai SMB SaaS adoption at low price points.

**F. Enterprise planning (out-of-ICP but norm-setting):** Oracle SCM / SAP IBP fair-share allocation — automated, enterprise-priced. Do not compare WSM's buying motion to these.

**Gap assessment (evidence-based inference, not a claim of exclusivity):** across A–E, no surveyed product combines (1) supplier-side Ordered≠Confirmed≠Received truth per factory PO, (2) a recurring manual allocation round over the gap with per-dealer traceability, (3) explicit non-automatic backorder carry, (4) dealer-scoped self-result, at Thai SMB price points. Adjacent features exist everywhere (booking, portals, backorders, fair-share automation) — the *combination and center of gravity* is the wedge. This is a gap observation as of 2026-09-05; incumbents can close it (see Section 11).

---

## 6. Pain → Capability → Outcome → Business Value → Reason to Pay

| Pain | WSM capability (V1) | Outcome (label) | Business value | Reason to pay |
|---|---|---|---|---|
| Ordered ≠ Confirmed ≠ Received confusion | Supply truth per supplier/factory PO (manual reliable-supply adapter) | Promises stop being mistaken for commitments; earlier shortage detection `hypothesis` | Fewer over-promises to dealers; fewer emergency re-explanations | The Excel cannot enforce state separation; errors are repeated every round |
| Requested ≠ Allocated ≠ Fulfilled confusion | Demand truth: dealer bookings → confirmed demand ≠ allocated ≠ fulfilled | Admin stops treating requests as orders `hypothesis` | Prevents phantom demand inflating purchases | Same as above — state discipline is the product |
| Late shortage discovery; repeated recalculation | Gap visibility (demand vs reliable supply; no double-subtract of backorders) | Gap known at round start, not at delivery `hypothesis` | Earlier dealer communication; fewer surprises | Each recalculation cycle is staff time + latency |
| "Why did A get stock and B didn't?" | Manual/partial allocation with recorded per-dealer decisions + audit trail | Explainable, consistent allocation `hypothesis` | Dispute reduction; fairness credibility with dealers | Disputes hit the owner personally; a recorded rule set is a defense |
| Backorder chaos | Explicit backorder carry (not automatic) | Nothing silently promised twice `hypothesis` | Cash-flow and promise hygiene | Vndly/BetterCommerce: mismanaged backorders kill cash flow |
| Dealers ask staff the same question every round | Dealer-visible self-scoped result | Fewer status chats `hypothesis` | Admin hours recovered per round | Dealer communication is a recurring labor cost |
| Lost history after spreadsheet overwrite | Immutable allocation/history records | Decision provenance survives staff turnover `hypothesis` | Organizational memory; onboarding new staff faster | Knowledge concentration is a business risk owners recognize |

Reason-to-pay summary: WSM is paid to make scarce-supply allocation *truthful, explainable, and visible to dealers* — a workflow cost that recurs every round. It is not paid for forecasting (unproven in V1) or inventory (non-goal).

---

## 7. Differentiation

**Defensible wedge to test (beyond "spreadsheet but prettier"):**

1. **Truthful supply-state separation** as first-class objects (Ordered/Confirmed/Received; Requested/Allocated/Fulfilled) — vs inventory systems that only know *stock on hand* and order systems that only know *orders*. This is the core distinction vs every product in Section 5: WSM's center of gravity is the *relationship between unreliable factory supply and dealer demand*, not stock or catalog.
2. **Auditable manual allocation decision record** — enterprise systems automate fair-share; SMB tools don't do allocation at all; WSM records the human decision (traceable, per dealer, per round) because at Thai SMB scale the allocation is a judgment call the owner must be able to defend. This turns allocation from a hidden Excel act into an explainable institutional record.
3. **Dealer self-result without a broad portal** — dealers see their own scoped result (requested/allocated/fulfilled) with near-zero adoption friction, vs B2B portals that demand dealers shop a catalog (different behavior, higher friction) and vs the status quo where staff manually re-answer in LINE.
4. **Explicit, non-automatic backorder carry** — the product-defining truth directly opposes the "automation-first" pattern of incumbents; for allocation disputes, automatic carry is exactly what destroys trust.
5. **Tenant = importer/distributor business** — one payer, many non-paying dealer viewers; clean B2B SaaS economics.

**Distinguishability test vs each category:** ERP — no finance/inventory suite to fight; WSM sits beside it. Inventory systems — they start after goods arrive; WSM governs before/around arrival. Ordering portals — they sell catalogs; WSM rations supply. Spreadsheets — WSM enforces state and provenance. **Honest limits:** every individual element is copyable (Zort could add allocation rounds; Unleashed could add a PO-confirmation screen); the moat candidate is the accumulated workflow + allocation history + dealer-side familiarity, not any single feature — and that is `hypothesis` until retention data exists (downstream validation).

---

## 8. Monetization direction (structures only — no invented final public prices; commercial values TBD by source-of-truth)

**Assessment of structures against customer-value correlation (per brief's list):**

- **Monthly B2B per tenant (subscription)** — recommended primary. Matches "tenant = importer business"; matches Thai SaaS billing norms (Zort, FlowAccount both monthly/annual per org).
- **Tier by active dealers** — strong value-correlation candidate: dealer count drives the chat-coordination cost WSM removes, and drives dealer-visibility infrastructure. Also self-limiting: a tenant with 5 dealers shouldn't pay enterprise price. Caution: counting "active" dealers must be simple and dispute-proof.
- **Tier by active SKU/variants** — moderate correlation (multi-SKU importers have harder allocation); SKUs are cheap to host, so this tiers complexity more than value. Acceptable as a secondary dimension; avoid punishing small catalogs too hard.
- **Seats** — weak as primary dimension: Thai SMB ops teams are 1–3 people; seat pricing caps revenue and punishes the exact buyer profile. Use few included users + cheap add-ons (Zort's ฿3,900/yr/user add-on is the local pattern).
- **Booking/allocation volume** — volume correlates with value in heavy seasons, but metering allocation rounds creates bill anxiety during the highest-stress periods (a shortage is the worst time to meter). Not recommended for V1.
- **Advanced allocation policies / automation / API / integrations** — natural premium-tier candidates later (advanced policies = bigger tenants' complexity; API/integrations = ERP-adjacent tenants). Keep out of V1 core proposition.
- **Onboarding/data-import fee** — recommended: one-time assisted migration fee is the honest way to fund Excel→WSM migration (Section 9); international pattern is established (inFlow $499 one-time; Unleashed $449–$5,549; Katana $2,000 optional).
- **Transaction/take-rate** — explicitly not assumed in V1 (brief instruction; consistent with the market: B2B Wave advertises 0% transaction fees as a selling point).

**Direction conclusion:** tenant subscription, tiered primarily by active dealers (secondarily SKU tiering), few included users with paid add-ons, one-time onboarding/import fee, later premium for policies/automation/API. Local price-feasibility is evidenced by the Thai anchor band (Zort ฿1,584–2,666/mo adjacent retail tiers; ฿59k–99k/yr corporate tiers; FlowAccount ฿549/mo top tier) and international ladder ($129–$729/mo for inventory/order systems; $900/mo+ for planning). Exact WSM price points: TBD by source-of-truth — deliberately not proposed here.

---

## 9. Sales / onboarding / delivery model

**Realistic initial sale:** owner-led demo + assisted-onboarding B2B, sold in Thai, to the owner-operator directly. Self-serve is implausible for V1 (the buyer is buying a *workflow discipline change*, not a tool download); consultative enterprise sales is overkill for the ICP's price band.

**Onboarding burden items (from brief) and honest weightings:**

- Excel migration / product & SKU setup: bounded (import templates; SKUs are finite) — days.
- Dealer import + dealer-code rollout: bounded for data (a list), heavier for behavior — dealers must be told their result is now visible; keep dealer side link-based first (no dealer login requirement) — `hypothesis` that this keeps activation friction low.
- Supplier mapping (many-to-many product↔supplier/factory): the underappreciated item — messy in real importers, needs a guided template — days, sometimes a week+.
- Historical data migration: recommend *not* migrating deep history for V1 (start from current round; history accumulates forward) — avoids the classic SMB data-cleaning tar pit; flag as product decision for the owner brief.
- Staff training / workflow change: the real cost — the admin team's Excel habit must be replaced; parallel-run one full cycle with Excel before cutover — weeks for the first cohort, faster after playbooks exist.
- Support burden: Thai-language, LINE-friendly support expected (Thai SMB norm); budget for it — FlowAccount's 365-day support and free onboarding sessions set the local service expectation.

**ARPU-vs-effort test:** at the plausible Thai band (Section 8 anchors), onboarding must stay at days-to-2-weeks with templated migration, or the model breaks. This is a hard design constraint on delivery (self-serve import tooling + one guided cycle), and a checkpoint for pricing.

---

## 10. Acquisition / activation / retention

- **Acquisition triggers (evidence-graded):** major shortage episode or factory delay (strongest — pain becomes visible; conversion moment), dealer-network growth past Excel manageability, repeated allocation disputes/angry LINE threads, new importer scaling beyond founder+1-staff memory. Channels: Thai trade communities/Facebook groups for ตัวแทนจำหน่าย networks exist and are active (search evidence 2026-09-05); owner-communities and supplier-association channels; `hypothesis` that channel partnerships (accountants/FlowAccount-style ecosystems, trade associations) outperform paid ads at this ARPU.
- **Activation (hypothesis):** one real booking→supply→gap→allocation round completed end-to-end with dealer-visible results within 2–4 weeks of signup, run in parallel with the incumbent Excel. Round completion is the activation metric; anything less is a demo.
- **Retention (pay month 2+):** recurring rounds are the structural retention engine — every cycle re-uses accumulated dealers/SKUs/suppliers/allocation history (data gravity); dealer dependency grows as dealers learn to check their own result; audit trail becomes organizationally load-bearing after the first dispute resolved by it. Churn risks: supply becomes plentiful (tool idles — seasonal/intermittent allocation cycles), staff reverts to Excel in round 5, dealer side never adopts. Retention measurement = downstream validation, not gate assumption.

---

## 11. Commercial risks / failure cases

1. **Excel good-enough / status-quo gravity** — highest-probability risk; mitigated only by the recurring-round subset of ICPs (Section 4 counter-truth).
2. **Incumbent feature response** — Zort already sells booking; B2B Wave/Unleashed/Cin7 could add allocation records; FlowAccount could extend inventory toward distribution. WSM's differentiation must compound (history/workflow) before incumbents bother.
3. **ERP/inventory incumbency & integration expectations** — buyers will ask "does it connect to my accounting/POS/ERP?" V1 has no integration story; expectation management required; API is a later premium (Section 8).
4. **Migration complexity & data quality** — supplier mapping and SKU mess can triple onboarding; the no-deep-history rule (Section 9) mitigates but adds a sales-objection ("but my old data…").
5. **Long B2B sales cycle** — Thai owner-operators decide fast but trust slowly; expect multiple-cycle pilots; CAC unmeasured (`hypothesis` at this stage).
6. **High onboarding/support cost vs ARPU** — the model breaks if onboarding exceeds ~2 weeks per tenant; enforce templated delivery.
7. **Niche ICP / beachhead too narrow** — Thai wholesale establishment count `UNVERIFIED`; if the recurring-rounds subset is small (e.g., only low hundreds of reachable businesses), initial validation may still work but scaling requires SEA expansion (different language/regulatory surface).
8. **Bespoke-workflow pressure / custom-ERP drift** — allocation rules are idiosyncratic; customers will demand custom policies, tiers, and exceptions; V1 manual allocation is the defense (flexibility without code), but scope discipline is a permanent cost.
9. **Weak pain when supply is plentiful; seasonal cycles** — subscription value decays in good-supply periods; expect seasonal usage dips and design pricing/communication accordingly (not a V1 blocker).
10. **Switching resistance** — the Excel file is the owner's mental model; cutover must be gradual (parallel-run) or churn-onboarding occurs silently.
11. **Buyer data quality** — dealer lists in LINE contacts, SKUs in inconsistent sheets; import tooling is mandatory, not optional.
12. **Dealer adoption friction** — dealers won't install apps or log into portals voluntarily; dealer-visible result must be zero-install (link/LINE) or the demand-side loop fails — condition #5 of the recommendation.
13. **Insufficient ARPU** — Thai SMB price sensitivity (FlowAccount at ฿199–549/mo proves adoption at low prices, and also caps headroom); WSM must justify a multiple of accounting-SaaS ARPU via operational pain, or the assisted-onboarding economics fail.
14. **Security/trust around sensitive allocation data** — allocation decisions encode dealer favoritism/margins; a leak is commercially damaging to the tenant; Thai SMB buyers will have low formal security requirements but high trust sensitivity; data residency/hosting expectations `UNVERIFIED` for this segment.
15. **Category-consolidation risk (pattern evidence)** — TradeGecko ($80M acquisition) was sunset by Intuit by Aug 2023; SMB SaaS buyers remember orphaned tools; expect "will you still exist in 2 years?" objections.

---

## 12. Assumptions

1. The locked V1 boundary (booking→supply→gap→allocation→backorder→dealer-visible result; manual supply adapter; no ERP/inventory/forecasting) stays fixed for this assessment.
2. Thai importers/distributors with 20–200 dealers exist in numbers sufficient for a beachhead — plausible from sector scale (฿3.2T wholesale+retail, 16.4% of GDP) but establishment counts `UNVERIFIED`.
3. Recurring allocation rounds (not one-off shortages) are common in the target verticals — inferred from booking-feature commerce in Thailand and allocation industry practice; per-vertical frequency `hypothesis`.
4. Dealer-side visibility can be delivered with near-zero dealer effort (link-first/LINE-first) — design assumption, not yet market-proven.
5. Owners will accept one guided onboarding cycle and then run WSM without bespoke services — `hypothesis`.
6. Thai-language assisted sales can be run at CAC compatible with the Thai B2B SaaS band — `hypothesis`.
7. Comparable SaaS pricing bands (Sections 2/5/8) transfer reasonably to the WSM category as willingness-to-pay context, not as price targets.
8. No transaction/take-rate revenue assumed in V1.

---

## 13. Open questions / missing evidence

1. **Thai market sizing:** count of wholesale/import-distribution juristic persons and establishments (DBD DataWarehouse+/Open-DBD TSIC 46; NSO 2022 trade census tables) — `UNVERIFIED` this session; needed for beachhead arithmetic.
2. **Direct payer evidence:** zero primary interviews in this research; willingness-to-pay for allocation-truth workflow in Thailand is `hypothesis`. Needed: 5–10 owner-operator discovery calls (importer verticals from Section 3).
3. **Factory confirmation behavior:** how Thai importers actually receive factory confirmations/partial notices (chat? PDF? email?) and how structured the manual supply adapter must be — unverified.
4. **Dealer-side willingness:** will dealers actually open a self-result link from LINE, and how often? — unverified; decides condition #5.
5. **Vertical concentration:** which vertical (electronics appliances vs building materials vs auto parts vs FMCG) has the highest recurring-round density — unverified.
6. **Competitive response:** will Zort/FlowAccount/LYNA extend toward allocation-round tooling in the near term — unverified; monitor.
7. **Seasonality:** are allocation rounds concentrated seasonally (affects churn design and cash-flow shape of subscription) — unverified.
8. **Hosting/data-residency expectations** for commercially sensitive allocation data among Thai SMB buyers — unverified.
9. **Onboarding unit economics:** actual hours per tenant migration — unverified until first pilots.

---

## 14. Confidence 0–100

**63/100** for the *conditional* recommendation (not for unconditional passability).

- **Environment & pain (high confidence, ~75–80):** LINE-centric commerce, chat-commerce scale, Thai dealer-system market existing and monetizing adjacent pain (Zort/Smith/Fusion), allocation/partial-shipment failure modes documented in sourcing practice — externally verified.
- **Competitive gap (~65):** surveyed products consistently lack the supply-truth + manual-auditable-allocation + dealer-self-result center of gravity at SMB prices; but features are copyable and the survey is point-in-time (2026-09-05).
- **Beachhead quantification (~45):** ICP shape is coherent; Thai establishment counts and vertical-round-density remain unverified — the largest single uncertainty.
- **Monetization coherence (~65):** structure (tenant subscription, dealer-based tiers, onboarding fee) correlates with value and matches local billing norms; actual price points TBD and pay-rate unproven.
- **Delivery economics (~55):** onboarding must stay bounded; no direct evidence yet of achievable onboarding hours per tenant.

What would move confidence up: verified Thai importer/distributor counts + 5–10 owner-operator interviews confirming recurring rounds and current Excel+LINE workflow + one paid pilot with measurable month-2 retention. What would move it down: evidence that allocation rounds are rare/one-off in reachable verticals, or that dealers refuse any self-result channel, or incumbent booking features maturing into allocation tools before WSM ships.