# PS01 Pawstia — Product Gate Synthesis

Procedure: `llm-council-gate` v0.3.2  
Run root: `D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\PS01`  
Inputs synthesized: `COUNCIL-BRIEF.md`, `CANDIDATE-A.md`, `CANDIDATE-B.md`, `CANDIDATE-C.md`, `SYNTHESIS-MANIFEST.md`  
Completed experts: 3/3  
Candidate identity: blind; candidates are referenced only as Candidate A, Candidate B, Candidate C.

## 1. Gate Verdict

**REMEDIATE**

Rationale: The three completed candidates agree that Pawstia has a coherent product identity and a defensible V1 boundary, but they also agree that Product Gate cannot pass as-is because the evidence base still lacks real pet-hospitality operator validation, independent Phase 13 closure, and several owner decisions that define the next sell-ready path. This is not a product rejection. It is a targeted remediation decision: lock the identity and V1 boundary, then collect/resolve the missing product evidence before the next gate.

This verdict is limited to the Product Gate. It does not decide Business-Market, Portfolio Arbitration, Module Hub scan, Architecture, Risk, Pre-Build, Agent Relay, deployment, PR merge, production migration, or paid launch.

## 2. Agreement Count

**Product identity agreement: 3/3**

All candidates recommend the same primary identity: Pawstia should stay a narrow, Thailand-first, single-location **Pet Hotel/Daycare OS** centered on room/booking integrity, LINE-native Daily Care Reports, and Google Sheets data ownership. None recommends broadening V1 into a generic PMS, clinic/grooming/billing suite, multi-branch platform, marketplace, or paid-production SaaS.

**Gate verdict agreement inferred from evidence: 3/3 support REMEDIATE.**

No candidate issued a gate verdict, per expert-seat rules. Synthesizer inference: all three candidates identify enough unresolved Product Gate evidence and owner decisions to block a clean PASS, while none finds evidence requiring a full BLOCK of the product direction.

## 3. Evidence Base Used

The synthesis is based only on the five allowed inputs:

- Frozen brief: `COUNCIL-BRIEF.md`
- Candidate A: `CANDIDATE-A.md`
- Candidate B: `CANDIDATE-B.md`
- Candidate C: `CANDIDATE-C.md`
- Synthesis manifest: `SYNTHESIS-MANIFEST.md`

The candidates themselves reported direct inspection of product docs, source, migrations, evidence files, review files, CI evidence, commercial-readiness docs, operations docs, and limited Module Hub context. This synthesis does not independently re-open the product repo or stale status documents.

## 4. Final Product Identity

Pawstia V1 should be defined as:

**A Thailand-first, single-location Pet Hotel/Daycare operations OS for small pet-hospitality operators, operated by owners/managers/staff on storefront devices, with pet owners receiving LINE-native daily reports.**

The term "PMS" should not drive scope. It can remain a naming/marketing label only if the concrete V1 promise stays narrow: pet hotel/daycare room and care operations, not broad pet-business management.

## 5. Buyer, User, And Strongest Pain

Primary buyer: the owning operator of a single pet hotel/daycare, especially Bangkok-metro or similar Thai stores.

Primary daily users: owner, manager, and floor staff who manage rooms, stays, care notes, photos, check-in/check-out, cleaning, and customer communication.

Secondary user: pet owner/customer who receives Daily Care Reports inside LINE and may use LINE claim/self-booking flows.

Strongest pain stack agreed by candidates:

1. Double-booking and room-slot conflicts, especially during peak periods.
2. Daily pet photo/report chaos across staff and LINE conversations.
3. Fear of data lock-in when adopting new software, mitigated by a Google Sheets replica.

## 6. Core Daily Value Loop

The product-defining retention loop is:

Pet checks in -> staff assigns a room without collision -> care context is recorded -> staff sends a 15-second Daily Care Report with 1-4 photos and food/excretion/mood/note -> pet owner receives the report in LINE -> shop retains operational and customer data with export/replica confidence.

This loop is more important than dashboards, subscriptions, camera access, or broad admin reporting. The product should be judged by whether real stores run this loop daily and keep using it.

## 7. V1 Boundary

Smallest defensible V1:

- Single-store tenant/staff authorization.
- Customer, pet, room, booking, check-in/check-out, cleaning, and maintenance lifecycle.
- Database-backed no-overlap and anti-collision booking integrity.
- Daily Care Report with media and LINE delivery/retry/idempotency.
- LINE identity claim flow.
- Google Sheets one-way ownership replica / export path.
- Onboarding and CSV import support.
- Owner/manager visibility sufficient to run the store.
- Subscription/entitlement/quota foundation as access-control infrastructure, not payment proof.

Explicit V1 non-goals:

- Clinic/pharmacy workflow.
- Grooming queue and staff resource scheduling.
- Payment, SlipOK, billing, reconciliation, and e-tax automation.
- Google Drive photo sync.
- Digital pet passport.
- Full RTSP/HLS or advanced multi-camera platform.
- Multi-branch operations.
- Marketplace or B2C-first product.

## 8. Product-Defining Features Vs Optional Breadth

Product-defining:

- Room matrix and booking integrity.
- Pet no-overlap / stay lifecycle correctness.
- LINE-native Daily Care Report.
- Google Sheets data-ownership replica.
- LINE identity claim enough to deliver reports to the correct customer.

Enabling or optional breadth:

- LIFF self-booking: useful, but not the V1 wedge.
- Visitor camera: built/bounded in candidate evidence, but not central to positioning; owner must decide whether it is hidden, retained, or postponed.
- Dashboard and entitlement visibility: operational support, not identity.
- Subscription/quota machinery: useful foundation, but not payment or market validation.
- CSV import/onboarding: important for beta adoption, but not the core promise itself.

## 9. Pilot Validation Vs Paid Production

Pilot/value-validation prerequisites:

- Name at least one real pet hotel/daycare store for closed beta.
- Run the daily stay/report loop with real staff and real pet-owner LINE delivery.
- Measure onboarding time, staff learning curve, booking conflict prevention, report completion time, LINE delivery success/failure, Sheets sync failure, support burden, and owner-perceived value.
- Capture pain-intensity and willingness-to-pay evidence before treating pricing as validated.
- Keep the beta single-store and operator-assisted until the loop is proven.

Paid-production prerequisites:

- Independent Phase 13 review closure and PR state reconciliation.
- Payment provider/rail and commercial transition rules.
- Trial expiry, upgrade/downgrade, suspension/reactivation, cancellation/refund/proration/reconciliation contracts.
- Staging and production topology, deploy/rollback evidence, monitoring, backup/restore, incident process, support process.
- Final Terms/Privacy/DPA/subprocessor/legal-entity posture.
- Formal trademark/brand/channel clearance, including LINE OA and production web address.

## 10. Dissent And Divergence

There is no material dissent on the core identity or V1 boundary.

Points of divergence:

- **Phase 13 status:** Candidate A says green CI exists but independent review is still pending and stale docs create premature-closure risk. Candidate B says the GitHub run was verified successful and PR #4 remains Draft/Open. Candidate C says Phase 13 is engineered/CI-closed but not independently closed. Synthesis: treat Phase 13 as strong technical evidence, not Product Gate PASS, not market fit, not paid-production readiness.
- **Module Hub treatment:** Candidate A briefly inspected Module Hub and concluded Pawstia-native behavior is not displaced. Candidate B inspected overlap and reached the same conclusion. Candidate C treated Module Hub scan as HOLD and did not use it as a deciding factor. Synthesis: Module Hub is held out of this Product Gate; naming similarity must not change Pawstia V1.
- **Optional breadth line:** Candidate A is most skeptical of visitor camera as V1-defining. Candidate B includes LIFF/onboarding/dashboard/subscription as enabling layers already built. Candidate C calls LIFF self-booking validation-stage and camera bounded-only. Synthesis: these can exist, but none should define the V1 promise.
- **Confidence:** Candidate A 86, Candidate B 74, Candidate C 82. Average 80.7. Spread reflects stronger confidence on product identity than on market validation.

## 11. Risks, Blockers, Assumptions, And Owner Decisions

Top risks/blockers:

- No real-store closed beta evidence exists in the candidates' reports.
- Market hypotheses and willingness-to-pay remain unvalidated.
- Technical closure may be mistaken for market fit.
- Phase 13 lacks a separate independent review verdict in all candidate reports.
- Paid-production prerequisites remain open: payment, legal, operations, support, staging/production, brand/channel clearance.
- Per-shop LINE token / secret-management posture is acceptable for bounded beta only if treated as an operational risk.
- Founding Member price lock may constrain later packaging if willingness-to-pay differs.

Assumptions:

- Candidate-reported source/evidence inspection is accurate.
- Product Gate scope is identity, user, V1 boundary, and validation path only.
- Business-Market and Portfolio Arbitration will evaluate pricing/revenue/competition and broader portfolio priority later.

Required owner decisions before the next gate:

1. Confirm public V1 positioning: "single-location Pet Hotel/Daycare OS" rather than broad PMS.
2. Choose whether visitor camera is kept visible, hidden, or postponed for V1 beta.
3. Name the first beta-store target and define closed-beta success metrics.
4. Decide whether Founding Member 990 THB Pro-forever remains locked before WTP validation.
5. Approve the rule that no paid launch starts until payment/legal/ops/brand gates are separately closed.
6. Decide LINE OA/channel ownership approach for beta and production.

## Final Decision

**Gate verdict: REMEDIATE**

**Agreement: 3/3 on product identity and V1 boundary; 3/3 evidence support for remediation before Product Gate PASS.**
