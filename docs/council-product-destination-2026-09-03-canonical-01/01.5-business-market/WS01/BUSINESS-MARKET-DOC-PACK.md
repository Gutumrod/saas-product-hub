# Business/Market Document Pack - WS01 WSTERA Supply Management

Verdict carried from synthesis: **REMEDIATE**  
Confidence: **64/100**  
Commercial values: **TBD by source-of-truth; no final public prices invented here**

## 1. Initial payer / beachhead profile

Economic buyer: importer/distributor owner-operator, managing director, or owner-led small operations/admin team.

Operations user: 1-5 admin/ops staff who consolidate dealer bookings, maintain SKU/dealer/supplier data, update supply status, calculate gap, allocate scarce stock, answer dealers, and track backorders.

Dealer actor: dealer/reseller/shop. Dealer submits demand and sees self-scoped result. Dealer is not the SaaS payer.

Supplier/factory actor: confirms, partially confirms, delays, or ships supply. In V1 this actor is represented through manual supply input, not direct supplier collaboration.

Narrowest credible beachhead: small/mid Thai importer/distributor or exclusive/semi-exclusive distributor with 20-200 active dealers, 100-5,000 SKUs/variants or equivalent complexity, recurring booking/allocation rounds, partial factory supply, delayed confirmed production, quota, shortage, or partial shipment, current Excel/Google Sheets + LINE/chat workflow, and a recent concrete pain event such as oversell, dealer dispute, late shortage discovery, backorder confusion, or overwritten sheet.

Beachhead exclusions: importers with plentiful supply, tiny dealer counts, trivial SKU complexity, large enterprise ERP buyers, factories, suppliers, dealers, marketplaces, and end consumers as primary payers.

## 2. Pain-status-quo map

| Pain | Current status quo | Why status quo breaks | Evidence status |
|---|---|---|---|
| Dealer requests scattered across LINE/chat | Admin copies messages into Excel | Duplicate/missed requests and no single demand record | Thai LINE/chat commerce context verified; per-ICP burden `hypothesis` |
| Requested treated as allocated/fulfilled | Spreadsheet columns and manual memory | Dealers think requests are promises | Product problem and candidate consensus; business magnitude `hypothesis` |
| Ordered supply treated as confirmed/received | Factory chat/email copied into sheet | Oversell and late shortage discovery | Category practice verified; Thai ICP frequency `hypothesis` |
| Shortage discovered late | Manual recalculation | Firefighting, delayed dealer communication | Cross-candidate consensus; measured impact `hypothesis` |
| Manual allocation of scarce supply | Owner/admin judgment in Excel | No traceable reason for dealer A vs dealer B | Allocation/audit value supported by adjacent evidence; Thai SME value `hypothesis` |
| Backorders double-counted or forgotten | Notes, chats, extra tabs | Re-promising and fulfillment divergence | Cross-candidate consensus; measured rate `hypothesis` |
| Dealer asks status repeatedly | LINE replies one by one | Admin labor and inconsistent answers | Thai chat-commerce environment verified; saved hours `hypothesis` |
| Spreadsheet overwrite/history loss | Shared workbook/files | Provenance destroyed, cannot audit or re-run | Candidate evidence supports real spreadsheet risk; WSM-specific rate `hypothesis` |
| Owner dependency | Owner/admin memory | Decision latency and single point of failure | Cross-candidate consensus; quantified cost `hypothesis` |

## 3. Competitor landscape

Strongest competitor: Excel + LINE/chat + owner memory. It is free, familiar, flexible, and already embedded in Thai owner-operator workflows. WSM must beat it on structural state discipline, provenance, and dealer-visible results, not cosmetic UX.

Thai/local adjacent systems:

- Zort: Thai inventory/order SaaS with booking/reservation and dealer/dropship-adjacent features; published package evidence indicates Thai buyers pay low-thousands THB/month for adjacent workflows. Strong adjacent competitor if WSM drifts into generic booking/order management.
- Smith: Thai dealer-management system for brand/dealer networks; pricing not published. Dealer commerce and tier-pricing oriented.
- Fusion Solution Reseller Solution: Thai reseller/dealer workflow system; pricing not published. Solves order/admin/friction around resellers.
- FlowAccount/PEAK and Thai accounting/POS SaaS: strong local anchors for willingness-to-pay and price sensitivity; inventory/accounting bundles may absorb vague WSM positioning.
- Odoo Thai bundles/partners: ERP-lite path for SMEs that want a broader suite.

International and SEA comparables:

- B2B ordering portals: OrderDock, B2B Wave, OrderEase, Brandboom, Shopify B2B, SparkLayer, MiraB2B, NuORDER. They solve catalog ordering, price lists, customer portals, and order capture more than scarce-supply allocation truth.
- Inventory/OMS: Zoho Inventory, inFlow, Unleashed, Cin7, Katana. They provide stock/order/backorder workflows and portals, but are not centered on importer's manual allocation round and dealer self-result.
- Supply planning: Netstock, Flowlity, Streamline/GMDH, enterprise planning tools. They optimize forecasting/replenishment and tend to require integrations/implementation; wrong buying motion for Thai owner-operator V1.
- SEA distribution platforms: Borong and similar systems prove regional B2B distribution digitization, but are ordering/commerce oriented, sometimes marketplace/take-rate oriented, not WSM's allocation-truth wedge.

Competitive conclusion: WSM's opportunity is not exclusivity of features. Individual features are copyable. The opportunity is a focused center of gravity: importer/distributor allocation truth from dealer demand through reliable supply, gap, manual allocation, explicit backorder, and dealer self-result.

## 4. Differentiation wedge

WSM is differentiated only if it stays narrow:

- **Supply truth:** Ordered != Confirmed != Received.
- **Demand truth:** Requested != Allocated != Fulfilled.
- **Gap truth:** shortage calculated from reliable supply and demand without double-subtracting backorders.
- **Allocation truth:** manual/partial allocation is traceable, auditable, and explainable.
- **Backorder truth:** carry is explicit, not automatic.
- **Dealer visibility:** dealer sees only their own result without becoming a broad portal user.
- **History:** allocation decisions survive spreadsheet overwrite and staff turnover.

The wedge collapses if WSM is positioned as ERP-lite, inventory, dealer CRM, broad portal, forecasting, marketplace, or prettier spreadsheet.

## 5. Pain -> Capability -> Outcome -> Business Value -> Reason to Pay

| Pain | Capability | Outcome | Business value | Reason to pay |
|---|---|---|---|---|
| Factory ordered quantity is mistaken for confirmed supply | Separate ordered/confirmed/received states | Earlier view of reliable supply `hypothesis` | Fewer oversells and excess promises `hypothesis` | Avoids recurring promise errors during shortage rounds |
| Dealer request is mistaken for guaranteed stock | Separate requested/allocated/fulfilled states | Demand is visible without becoming a commitment `hypothesis` | Fewer allocation errors and dealer misunderstandings `hypothesis` | Turns informal chat promises into controlled states |
| Shortage discovered late | Gap calculation from demand and reliable supply | Shortage visible before fulfillment `hypothesis` | Less firefighting and faster owner decisions `hypothesis` | Gap is the moment Excel becomes painful |
| Dealer asks why they received less than requested | Traceable manual/partial allocation | Allocation can be explained and defended `hypothesis` | Lower dispute burden and better dealer trust `hypothesis` | Owner pays to reduce repeated conflict and memory dependency |
| Backorders are forgotten or double-counted | Explicit backorder carry | No silent re-promising `hypothesis` | Cleaner fulfillment promises and fewer errors `hypothesis` | Prevents a repeatable shortage/accounting-of-promises failure |
| Dealers ask admins for status repeatedly | Dealer self-scoped result | Dealer checks own requested/allocated/waiting state `hypothesis` | Admin time saved and fewer LINE replies `hypothesis` | Dealer communication is recurring labor |
| Spreadsheet history is overwritten | Persistent history/audit trail | Decision provenance survives `hypothesis` | Less rework; better dispute resolution; staff continuity `hypothesis` | Spreadsheet cannot reliably preserve allocation provenance |

## 6. Monetization direction (values TBD)

Do not set final public prices in this gate. Recommended structure only:

- Primary model: recurring monthly or annual B2B subscription per tenant.
- Tiering: primarily by active dealers, because dealer count drives communication burden and allocation complexity.
- Secondary tiering: active SKUs/variants as a soft complexity dimension.
- Seats: include enough owner/admin seats for a small team; do not make seat count the main value meter.
- Usage/round volume: avoid hard per-round or per-line metering in V1 because shortage periods are already stressful and unpredictable.
- Onboarding/data-import fee: likely needed to cover Excel import, SKU/dealer/supplier setup, first-round support, and migration burden.
- Expansion tiers: advanced allocation policies, automation, API/webhooks, integrations, audit export, enterprise controls, support SLA.
- Reject: transaction/take-rate for V1; broad marketplace economics; dealer-paid subscription.

Commercial values remain **TBD**. Thai adjacent SaaS price anchors suggest price sensitivity and constrain onboarding cost, but they do not set WSM's final price.

## 7. Sales / onboarding / delivery model

Recommended initial motion: owner-led demo plus assisted onboarding.

The demo should use a real or realistic shortage round and show dealer booking -> confirmed demand -> reliable supply -> gap -> manual/partial allocation -> explicit backorder -> dealer self-result.

Pure self-serve is too weak because the buyer is changing workflow discipline. Enterprise consulting is too heavy because the ICP cannot support long implementation cycles.

Onboarding model:

- Start with the next live round; do not require deep historical migration for V1.
- Import products/SKUs/variants from spreadsheet templates.
- Import dealers and dealer codes/links.
- Map suppliers/factories to products with many-to-many support.
- Run the first round in parallel with current Excel where needed.
- Train owner/admin staff on state separation and allocation logging.
- Keep dealer side zero-install and mobile/LINE-friendly.

Delivery economics condition: onboarding must be templated and bounded. If a tenant requires weeks of custom cleanup, deep history import, ERP/POS/accounting integration, or bespoke allocation-rule development, the V1 economics likely break.

## 8. Acquisition / activation / retention

Acquisition triggers:

- Major shortage event.
- Factory delay or partial shipment.
- Dealer network growth beyond owner/admin memory.
- Repeated allocation disputes in LINE/chat.
- Overwritten or conflicting spreadsheet.
- Backorder confusion causing re-promising.

Likely channels are Thai owner/operator networks, trade communities, vertical associations, LINE-first business communities, referrals from accountants/ops consultants/SaaS partners, and event-triggered outreach. CAC remains `UNVERIFIED`.

Activation metric: one real booking/supply/gap/allocation round completed with at least a subset of dealers seeing their self-scoped results. This is `hypothesis` until validated, but it is the correct first value moment.

Retention mechanism: recurring dealer rounds, recurring supply updates and partial confirmations, accumulated SKU/dealer/supplier data, allocation history/audit trail, dealer habit of checking own result, and owner/admin dependency on gap/allocation truth. Retention risk rises when supply becomes plentiful, allocation cycles are seasonal, dealer adoption is low, or staff returns to Excel.

## 9. Market-size / beachhead estimate

Candidate evidence cites broad Thai wholesale/distribution registry counts around 162k-166k records from commercial/DBD-derived sources. Candidate B could not independently retrieve authoritative DBD/NSO counts during its session. Treat broad counts as **`unverified`** for synthesis.

The qualified beachhead is much smaller than the broad wholesale/distribution universe. It requires all of importer/distributor business, active dealer network, multi-SKU or variant complexity, recurring constrained supply, partial shipment, quota, or delay, manual allocation rounds, Excel + LINE/chat status quo, and owner-recognized cost.

Estimate: **few hundred to few thousand reachable Thai early targets is a `hypothesis`, not verified.** A broad national TAM claim is not acceptable evidence for this gate.

Validation target: validate one first vertical deeply rather than claiming a broad market. A practical first proof could be 5-10 owner discovery calls and 1-3 paid or design-partner pilots in the most allocation-dense vertical.

## 10. Commercial risk register

| Risk | Severity | Gate classification | Mitigation |
|---|---|---|---|
| Excel good-enough | High | Business/Market remediation risk | Qualify only recurring constrained-supply/allocation-dispute ICP |
| Wedge perceived as order portal/spreadsheet | High | Business/Market remediation risk | Lead with allocation truth/provenance and dealer self-result |
| Qualified beachhead too small | High | Business/Market remediation risk | Pick one vertical and validate reachable counts/interviews |
| Onboarding cost exceeds ARPU | High | Business/Market remediation risk | Template imports, no deep history in V1, onboarding fee |
| Integration expectations | High | Commercial risk; not technical gate here | State V1 non-goals; defer API/integrations to expansion |
| Thai SaaS price sensitivity | High | Commercial risk | Keep delivery lean; do not rely on high US-style ARPU |
| Dealer adoption friction | Medium-High | Downstream validation | Zero-install self-result links, LINE-friendly rollout |
| Seasonal allocation cycles | Medium | Commercial risk | Qualify recurring rounds; consider annual/season-aware packaging later |
| ERP/accounting/POS incumbents | Medium-High | Commercial risk | Position beside ERP, not replacing it |
| Bespoke workflow pressure | High | Product/commercial risk | Bounded configuration; reject custom ERP drift |
| Data quality problems | Medium | Delivery risk | Import validation and onboarding checklist |
| Security/trust concerns | Medium-High | Downstream architecture/security | Preserve tenant isolation, authorization, audit evidence later |
| Competitor copyability | Medium | Commercial risk | Build workflow/data/history habit before incumbents respond |
| Long sales cycle/CAC | Medium | Downstream validation | Owner-led pain-event sales, measure CAC in pilots |

## 11. Downstream-validation register

These items must be preserved for later gates and pilots, but are **not Business/Market gate blockers**:

- Actual retention and churn.
- Real CAC and sales-cycle length.
- Conversion rate from owner-led demos.
- Activation rate: first real booking -> supply -> gap -> allocation round.
- Measured admin-time saving per round.
- Measured dealer-dispute reduction.
- Measured allocation accuracy/error reduction.
- Actual ARPU and willingness-to-pay.
- Paid pilot conversion and month-2/month-3 retention.
- Dealer self-result adoption rate.
- Production billing readiness.
- Runtime/database placement.
- Architecture/security review.
- Implementation, deployment, and operational monitoring.
