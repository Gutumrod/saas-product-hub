# Business/Market Document Pack - WS01 WSTERA Supply Management

Verdict carried from synthesis: **PASS**  
Confidence: **72/100**  
D1 beachhead: **Thailand-first motorcycle/automotive aftermarket importer-distributors**  
D2 pricing state: **final public pricing unlocked; monetization direction only**  
Boundary: **no Product Gate reopening, no implementation, no architecture/migrations/deployment, no Agent Relay/Layer 2, no broad launch**

## 1. Initial payer / beachhead profile

Economic buyer and tenant: Thailand-first motorcycle/automotive aftermarket importer-distributor. The likely signer is the owner/operator, managing director, or owner-led supply/admin team.

Operations user: small supply/admin team that consolidates dealer bookings, maintains SKU/dealer/supplier data, updates expected/confirmed/received supply, calculates gap, performs manual/partial allocation, handles exceptions, answers dealers, and tracks backorders.

Dealer actor: dealer/reseller/shop. Dealer submits demand and sees only its own result. Dealer is not the SaaS payer.

Supplier/factory actor: supplier/factory confirms, partially confirms, delays, or ships supply. In V1, supplier/factory state is represented through manual reliable supply input.

Locked first commercial beachhead:

- Small-to-mid-size Thai importers/distributors of motorcycle and automotive aftermarket accessories.
- Multiple active SKUs/variants.
- Multiple dealers, approximately 20-200 as a working ICP hypothesis, not a hard limit.
- One or more suppliers/factories.
- Recurring constrained supply: partial production, delay, quota, shortage, or partial shipment.
- Dealer demand must regularly be reconciled against supply actually expected or received.
- Current workflow uses Excel/Google Sheets + LINE/chat + owner/admin memory.
- Allocation decisions create repeated dealer questions, exceptions, or disputes.

Beachhead exclusions:

- Generic FMCG, building materials, general wholesale, retail ERP, warehouse management, procurement platforms, universal supply-chain planning.
- Importers with plentiful supply and no recurring allocation tension.
- Tiny dealer networks where owner memory and LINE remain good enough.
- Large enterprise ERP/SAP/Oracle buying motions.
- Factories, suppliers, dealers, marketplaces, and end consumers as primary payers.

Product-model boundary: the aftermarket beachhead is a go-to-market focus, not a domain-specific product model. WS01 remains a generic multi-tenant B2B supply planning and dealer allocation SaaS.

## 2. Pain-status-quo map

| Pain | Current status quo | Why status quo breaks | Evidence status |
|---|---|---|---|
| Dealer requests scattered across LINE/chat | Admin copies messages into Excel/Sheets | Duplicate, missed, or ambiguous requests | Thai LINE/chat context and adjacent SaaS evidence support category; aftermarket-specific rate downstream |
| Requested treated as allocated/fulfilled | Spreadsheet columns and owner memory | Dealers treat requests as promises | Core product truth; measured incidence downstream |
| Ordered supply treated as confirmed/received | Supplier/factory messages copied into sheet | Oversell and late shortage discovery | Candidate evidence supports partial-supply practice; prospect-specific validation downstream |
| Shortage discovered late | Manual recalculation | Firefighting, delayed dealer communication | Credible recurring pain for constrained-supply ICP; measured impact downstream |
| Manual allocation of scarce supply | Owner/admin judgment in Excel | No durable explanation for dealer A vs dealer B | Core wedge; direct Thai aftermarket proof downstream |
| Backorders double-counted or forgotten | Notes, chat, tabs, memory | Re-promising and fulfillment divergence | Core product risk; measured rate downstream |
| Dealer asks status repeatedly | LINE replies one by one | Admin burden and inconsistent answers | Credible in LINE-first workflow; saved hours downstream |
| Spreadsheet overwrite/history loss | Shared workbook/files | Decision provenance destroyed | Spreadsheet risk category supported; tenant-specific proof downstream |
| Owner dependency | Owner/admin memory | Decision latency and single point of failure | Credible for owner-led ICP; quantified cost downstream |

## 3. Competitor landscape

Strongest competitor: Excel/Google Sheets + LINE/chat + owner/admin memory. It is free, familiar, flexible, and already embedded in Thai owner/operator workflows.

Local/adjacent systems cited by candidates:

- Zort and similar Thai inventory/order/booking SaaS: validate that Thai businesses pay for adjacent dealer/order/stock pain, but center on booking/order/inventory rather than importer-side supply truth plus allocation provenance.
- Smith/Fusion and dealer/reseller systems: relevant adjacent substitutes for dealer networks, but not proven to center on manual scarce-supply allocation against uncertain factory supply.
- FlowAccount/PEAK/Odoo-style accounting/POS/ERP-lite: strong local willingness-to-pay and scope-pressure anchors; they become dangerous if WS01 is positioned vaguely as inventory/order/ERP.

International comparables cited by candidates:

- B2B ordering portals: B2B Wave, OrderEase, Brandboom, OrderDock, Shopify B2B, SparkLayer, MiraB2B, NuORDER. These emphasize catalog ordering, customer portals, price lists, and order intake.
- Inventory/OMS: Zoho Inventory, inFlow, Unleashed, Cin7, Katana. These provide stock/order/backorder workflows and sometimes portals, but do not center on importer allocation rounds as the product's primary truth.
- Supply planning/forecasting: Netstock, Flowlity, Streamline/GMDH, Oracle/SAP-style fair-share allocation. These are heavier, integration-led, and wrong as a direct SMB Thai owner/operator buying motion.

Competitive conclusion: WS01 should not claim feature exclusivity. The wedge is the focused combination of supply-state truth, demand-state truth, gap visibility, auditable manual allocation, explicit backorder, and dealer-visible self-result at a Thai-first owner/operator buying motion.

## 4. Differentiation wedge

Differentiation to lock: **Truthful Supply + Explainable Allocation**.

- **Supply truth:** Ordered != Confirmed != Received.
- **Demand truth:** Requested != Allocated != Fulfilled.
- **Gap truth:** Demand -> Supply -> Gap, with shortage visible before allocation.
- **Allocation truth:** manual/partial allocation is traceable and explainable.
- **Backorder truth:** carry is explicit, not automatic, and must not double-subtract.
- **Dealer visibility:** dealer sees only its own result without becoming a broad portal user.
- **History:** allocation decisions survive spreadsheet overwrite and staff turnover.

The wedge collapses if WS01 becomes ERP-lite, inventory, warehouse management, procurement, marketplace, broad dealer portal, forecasting product, or a motorcycle-specific custom system.

## 5. Pain -> Capability -> Outcome -> Business Value -> Reason to Pay

| Pain | Capability | Outcome | Business value | Reason to pay |
|---|---|---|---|---|
| Factory order mistaken for confirmed supply | Separate ordered/confirmed/received states | Reliable supply is visible before allocation | Fewer over-promises and late shortage surprises `hypothesis` | Prevents recurring supply-promise errors |
| Dealer request mistaken for guaranteed stock | Separate requested/allocated/fulfilled states | Demand is visible without becoming a promise | Fewer dealer misunderstandings `hypothesis` | Turns chat demand into controlled state |
| Shortage discovered late | Gap calculation from demand and reliable supply | Shortage visible before allocation | Faster owner decisions and less firefighting `hypothesis` | Gap visibility is where Excel becomes painful |
| Dealer asks why another dealer got stock | Traceable manual/partial allocation | Decision can be explained and defended | Lower dispute burden and higher dealer trust `hypothesis` | Owner pays to reduce repeated conflict |
| Backorder forgotten or double-counted | Explicit backorder state | No silent re-promising | Cleaner fulfillment promises `hypothesis` | Prevents repeat allocation/backorder failures |
| Dealers ask admins for status | Dealer self-scoped result | Dealer checks own requested/allocated/waiting state | Admin time saved `hypothesis` | Reduces recurring LINE reply workload |
| Spreadsheet history overwritten | Persistent allocation/history record | Decision provenance survives | Less rework and owner dependency `hypothesis` | Spreadsheet cannot reliably preserve allocation truth |

## 6. Monetization direction (values TBD)

D2 keeps final public pricing unlocked. This doc pack does not approve final prices or public packages.

Approved direction:

- Primary model: recurring monthly or annual B2B subscription per tenant.
- Primary packaging hypothesis: active dealers.
- Secondary packaging hypotheses: active SKU/variant scale, seats, workflow sophistication, automation/API, integrations, audit export, enterprise controls, support level.
- Onboarding/data setup: may justify a separate fee once actual setup effort is measured.
- Seats: likely minor for V1 because first tenants are owner + small admin teams.
- Usage/round volume: not recommended as the default V1 meter because it adds billing anxiety during shortage periods.

Not approved:

- Final THB monthly prices.
- Final plan names.
- Dealer limits, SKU limits, seat limits, overage pricing.
- Annual discount.
- Onboarding fee amount.
- Trial duration.
- Transaction/take-rate default.
- Dealer-paid model.

## 7. Sales / onboarding / delivery model

Recommended initial motion: owner-led demo plus assisted onboarding.

The demo should show the actual WS01 value loop:

Dealer booking -> confirmed demand -> reliable supply -> gap -> manual/partial allocation -> explicit backorder -> dealer self-scoped result.

Onboarding model:

- Start from the next live allocation round.
- Do not require deep historical migration in V1.
- Import or prepare products/SKUs/variants from templates.
- Import dealers and create dealer codes/links.
- Map suppliers/factories to products without hard-coding automotive-specific logic.
- Train owner/admin staff on state separation and allocation logging.
- Keep dealer experience zero-install and LINE-friendly.
- Run the first round in parallel with Excel where needed.

Delivery economics condition: onboarding must be bounded and repeatable. If a tenant requires weeks of custom cleanup, ERP/POS/accounting integration, deep history import, or bespoke allocation-rule development, that becomes a Pilot/Launch economics issue.

## 8. Acquisition / activation / retention

Likely acquisition triggers:

- Major shortage event.
- Factory/supplier delay or partial shipment.
- Dealer network growth beyond owner/admin memory.
- Repeated allocation disputes in LINE/chat.
- Overwritten or conflicting spreadsheet.
- Backorder confusion causing re-promising.

Activation hypothesis:

Activation is one real supply/allocation round completed end to end, not import/login alone.

The activation loop is:

Dealer booking -> confirmed demand -> reliable supply -> visible gap -> manual/partial allocation -> explicit backorder -> dealer-visible self-scoped result.

Retention hypothesis:

Retention comes from recurring operational truth plus accumulated decision history: repeated dealer rounds, repeated supply updates, SKU/dealer/supplier data, allocation history, dealer habit, and owner/admin reliance on gap/allocation truth. Actual retention and churn remain downstream validation.

## 9. Market-size / beachhead estimate

Candidate evidence cited broad Thai wholesale/distribution registry counts and sector-scale indicators, but those are not qualified to the D1 beachhead.

Qualified beachhead remains unverified:

- Thai motorcycle/automotive aftermarket importer-distributor.
- Active dealer network.
- Multi-SKU/variant complexity.
- Recurring constrained or partial supply.
- Manual allocation rounds.
- Excel + LINE/chat + owner/admin memory.
- Owner-recognized cost of allocation errors/questions/disputes.

This is narrow enough for initial validation and reachable outreach. It is not yet quantified enough for TAM claims, scaling claims, or broad launch authorization.

## 10. Commercial risk register

| Risk | Severity | Gate classification | Mitigation |
|---|---|---|---|
| Excel good-enough | High | Remaining risk, not blocker after D1 | Qualify only recurring constrained-supply/dealer-allocation ICP |
| Beachhead size unverified | High | Downstream validation | Run targeted aftermarket interviews and lead list validation |
| WTP unproven | High | Downstream Pilot/Launch validation | Test with owner/operator interviews and paid pilots |
| Onboarding cost exceeds ARPU | High | Downstream Pilot/Launch validation | Templated imports, no deep history, possible onboarding fee |
| Wedge perceived as order portal | High | Commercial positioning risk | Lead with Truthful Supply + Explainable Allocation |
| Integration expectations | High | Scope/commercial risk | Preserve V1 non-goals; defer API/integrations |
| Dealer adoption friction | Medium-High | Downstream validation | Zero-install LINE-friendly self-result |
| Seasonal allocation cycles | Medium | Downstream validation | Qualify recurring rounds before selling |
| ERP/accounting/POS incumbents | Medium-High | Commercial risk | Position beside ERP, not replacing it |
| Bespoke workflow pressure | High | Product/commercial risk | Bounded configuration; anti-custom-ERP rule |
| Security/trust concerns | Medium-High | Later architecture/security gate | Tenant isolation, authorization, audit evidence later |
| Competitor copyability | Medium | Commercial risk | Build workflow habit and allocation history before scale |

## 11. Downstream-validation register

These items are preserved for Pilot/Launch and later gates. They are not Business/Market gate blockers after D1-D2:

- 5-10 targeted interviews with Thai motorcycle/automotive aftermarket importer-distributors.
- Real recent allocation-round walkthroughs.
- Direct willingness-to-pay evidence.
- Redacted sample spreadsheet/dealer/supplier data review.
- Actual onboarding hours and support burden.
- Paid pilot conversion.
- Activation rate from first real supply/allocation round.
- Month-2/month-3 retention and churn.
- CAC and sales-cycle length.
- Actual ARPU.
- Admin-time saved.
- Dealer-dispute reduction.
- Allocation accuracy/error reduction.
- Dealer self-result adoption rate.
- Production billing readiness.
- Runtime/database placement.
- Architecture/security review.
- Implementation, deployment, monitoring, and operations.

## 12. Explicit non-authorization

This Business/Market PASS authorizes no Product Gate reopening, no implementation, no architecture changes, no migrations, no deployment, no production billing, no Agent Relay, no Layer 2, no broad launch, and no mutation of raw expert evidence.

The only authorized decision is that the WS01 Business/Market gate closes as PASS under D1-D2, with the Pilot/Launch validation list preserved.
