# Business / Market Gate Brief — WS01 WSTERA Supply Management

STATUS: CURRENT / AUTHORIZED — Release 1B Product #5 WS01.
Procedure: `llm-council-gate` v0.3.2. Frozen input for independent experts only.
Repo: `D:\AI-Workspace\projects\saas-product-hub\products\WSM`
Freeze recorded: 2026-09-05. After expert dispatch, do NOT mutate these frozen questions.

## Locked Product Identity (Release 1A PASS, confidence 82/100)

- **WSM — WSTERA Supply Management**
- Category: Multi-tenant B2B supply planning and dealer allocation SaaS
- Primary buyer: Importer / distributor owner-operator หรือ small operations/admin team
- Dealers: demand-side actors — ไม่ใช่ SaaS payer
- North Star: Demand → Supply → Gap → Allocation → Fulfillment

## Locked Product Boundary (V1 thin end-to-end loop)

Dealer booking → confirmed demand → manual reliable supply → gap → manual/partial allocation → backorder → dealer-visible self-scoped result

Product-defining truths:
- Requested ≠ Allocated ≠ Fulfilled
- Ordered ≠ Confirmed ≠ Received
- Product ↔ Supplier/Factory supports many-to-many sourcing
- Gap must not double-subtract backorders
- allocation/history/audit must remain traceable
- backorder carry is explicit, not automatic
- tenant = importer/distributor business
- manual supply is a replaceable V1 adapter, not permanent product identity

Do NOT use Business/Market Gate to reopen this definition.

## V1 NON-GOALS (do not inflate V1 proposition)

No: ERP, inventory/WMS, finance/accounting, purchasing/PO suite, factory production system, logistics/TMS, CRM, marketplace, AI demand forecasting, automated allocation engine, multi-site supplier management, automatic backorder carry, broad dealer portal.

## Frozen Gate Question

> Does WS01 WSTERA Supply Management have a credible recurring paid market, with a clear initial payer, recurring costly supply/allocation pain, and a commercially coherent V1 monetization and delivery direction?

This is a Business/Market gate. It does NOT ask whether schema is build-ready, database placement resolved, central billing exists, implementation/production complete, pilot PMF proven, architecture/security pass. Classify those downstream.

## Required Expert Research (independent — current external evidence)

### 1. Initial Payer / Beachhead
Narrowest credible first paying segment. Test: importer/distributor with dealer networks; multi-SKU importer facing partial factory supply; exclusive distributor; wholesaler with recurring dealer reservation/allocation rounds; small/mid-size operator coordinating Excel + LINE; businesses with regular shortages or production allocation. Do not assume every importer is a good customer. Separate: economic buyer / operations user / dealer-demand actor / supplier-factory actor. Identify conditions making WSM valuable enough to pay for.

### 2. Recurring Pain
Which pain is truly recurring + costly: dealer requests scattered across LINE/chat; duplicate/inconsistent Excel sheets; demand mistaken for committed order; ordered factory quantity mistaken for confirmed production; shortage discovered late; manual allocation of scarce supply; inability to explain why dealer A got stock and dealer B did not; partial supply changes; repeated shortage recalculation; dealer disputes; backorder tracking; lost history after spreadsheet overwrite; fulfillment divergence from allocation. Evidence these create: staff/admin cost, lost sales, allocation errors, dealer dissatisfaction, excess promises, decision latency, owner dependency.

### 3. Status Quo Alternatives (strongest competitor)
Excel, Google Sheets, LINE, WhatsApp/chat, email, paper, owner/operator memory, shared drive files. Answer: Why should the importer pay WSM instead of improving their spreadsheet?

### 4. Direct / Adjacent Competitors
Categories: supply planning, demand planning, wholesale/dealer ordering, inventory allocation, order management, B2B distributor portals, ERP/ERP-lite, procurement/supply-chain SaaS. Include Thailand/SEA + international reference. Capture: target customer, pricing (verifiable), min contract, setup/implementation fees, seats/users, SKU/order limits, integrations, dealer portals, allocation capability, forecasting capability, implementation burden. Do not compare WSM to SAP-scale enterprise as if ICP/buying motion is identical.

### 5. Differentiation
Defensible wedge beyond "spreadsheet but prettier". Candidate to test: truthful supply-state separation + shortage visibility + auditable allocation decision record + dealer self-result. Valuable/distinguishable vs: ERP, inventory systems, order management, spreadsheets, generic B2B ordering portals.

### 6. Pain → Capability → Outcome → Business Value → Reason to Pay
Map at least: Supply truth (Ordered≠Confirmed≠Received); Demand truth (Requested≠Allocated≠Fulfilled); Gap (reliable demand-vs-supply shortage visibility); Allocation (traceable manual/partial); Dealer communication (dealer sees own result without asking admin); History (no spreadsheet overwrite destroying decision provenance). Label unproven business outcomes `hypothesis`.

### 7. Monetization Direction
Commerical values are TBD by source-of-truth — do NOT invent final public prices. Evaluate structures: monthly B2B per tenant; tier by active dealers; tier by active SKU/variants; seats; booking/allocation volume; advanced allocation policies; automation/API/integrations; onboarding/data-import fee; enterprise controls/support. Assess which dimensions correlate with customer value without complicating billing. Transaction/take-rate revenue should not be assumed.

### 8. Sales / Delivery Model
Determine initial sale realistically: self-serve / assisted onboarding / owner-led demo / implementation-assisted B2B / consultative. Assess: Excel migration burden, product/SKU setup, dealer import, historical data migration, supplier mapping, staff training, workflow change, dealer-code rollout, support burden. Ask whether plausible ARPU supports required onboarding effort.

### 9. Acquisition / Activation / Retention
- Acquisition trigger: major shortage, factory delays, dealer network growth, Excel unmanageable, repeated allocation disputes.
- Activation: one real booking/supply round reaches Gap + allocation successfully (hypothesis).
- Retention (pay month 2+): recurring dealer rounds, recurring supply updates, shortage management, allocation history, dealer dependency, accumulated SKU/dealer/supplier data, auditability.

### 10. Market Size / Beachhead
Do NOT use broad "global supply-chain = billions". Find evidence of reachable beachhead: small/mid-size importers/distributors with dealer networks and recurring partial supply/allocation problems. Estimate: number/type of relevant Thai businesses, vertical concentration, sales reachability, contract value, sales cycle. If no reliable count, label `unverified`.

### 11. Commercial Risks
Evaluate at minimum: Excel good-enough; ERP/inventory incumbent; integration expectations; migration complexity; long B2B sales cycle; high onboarding/support cost; niche ICP; bespoke-workflow pressure; customer requests turning WSM into custom ERP; weak pain when supply plentiful; seasonal/intermittent allocation cycles; switching resistance; buyer data quality; dealer adoption friction; insufficient ARPU; security/trust expectations around sensitive allocation data.

Use current external evidence when accessible; otherwise label changing claims `UNVERIFIED`.

## Expert Output Contract (exactly this order)

1. Recommendation
2. Verified facts / evidence
3. Initial payer + beachhead
4. Recurring pain and status quo
5. Competitor evidence
6. Pain → Capability → Outcome → Business Value → Reason to Pay
7. Differentiation
8. Monetization direction
9. Sales / onboarding / delivery model
10. Acquisition / activation / retention
11. Commercial risks / failure cases
12. Assumptions
13. Open questions / missing evidence
14. Confidence 0–100

Do not issue final gate verdict; Codex does. Do not authorize Phase 1 implementation.

## Blockers Classification (BK01/PS01 lesson)

Genuine Business/Market blocker: no credible payer; recurring pain too weak to monetize; wedge indistinguishable from spreadsheet/ERP; economics cannot support delivery/onboarding; unresolved V1 commercial policy essential to offer; beachhead too narrow to support initial validation; monetization direction fundamentally incoherent.

Downstream validation — NOT automatic gate blocker (preserve, do not erase): actual retention/churn, real CAC, conversion rate, measured admin-time saving, measured dispute reduction, measured allocation accuracy, actual ARPU, full PMF, production billing, runtime/database placement, architecture/security, implementation, deployment.

## Required WS01 Outputs (dir `01.5-business-market/WS01/`)

COUNCIL-BRIEF.md, BUSINESS-MARKET-SYNTHESIS.md, BUSINESS-MARKET-DOC-PACK.md, 01.5-BUSINESS-OWNER-BRIEF.md, 01.5-BUSINESS-OWNER-BRIEF.html, INDEX.html, AUDIT-MANIFEST.md, SYNTHESIS-MANIFEST.md, .candidate-mapping.json, CANDIDATE-A/B/C.md, raw expert evidence 3/3. Generate HTML with deterministic renderer. Update canonical root INDEX.html factually after synthesis.
