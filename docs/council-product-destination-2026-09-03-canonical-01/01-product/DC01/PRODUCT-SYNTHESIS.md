# DC01 DocCraft — Product Gate Synthesis

Gate verdict: REMEDIATE  
Procedure: llm-council-gate v0.3.2  
Role: Independent Synthesizer + Independent Document Author  
Identity status: Candidate authorship not inspected, inferred, or used  
Inputs used: COUNCIL-BRIEF.md, CANDIDATE-A.md, CANDIDATE-B.md, CANDIDATE-C.md, SYNTHESIS-MANIFEST.md  
Completed experts: 3/3, no degraded run  
OWNER-BRIEF: 01-PRODUCT-OWNER-BRIEF.md

## 1. Problem Understood

Verified fact: This Product Gate answers: what exactly DocCraft should be, for whom, and where sellable V1 ends.

External blocker: This gate must not decide pricing, revenue, competitor positioning, Module Hub integration, portfolio arbitration, architecture implementation, release, build, merge, deploy, or later LOCK/REVISE/PAUSE/DROP disposition.

Recommendation: Treat this synthesis as a Product Gate decision artifact only.

## 2. Verified Facts

Verified fact: DocCraft is a no-login, browser-first Thai business-document studio for micro-business users who need to produce quotation, invoice, receipt, work order, and conditional tax invoice documents without adopting full accounting software.

Agreement: 3/3 among completed experts.

Verified fact: Primary target segments are Thai freelancers, tradespeople/mechanics/field contractors, made-to-order or service shops, and micro-SMEs.

Agreement: 3/3 among completed experts.

Verified fact: V1 core loop is document type selection, data entry, block toggles, total checking, A4 preview, and native browser print.

Agreement: 3/3 among completed experts.

Verified fact: V1 is no-login/no-backend/local browser persistence and uses native `window.print()` rather than a PDF-generation engine.

Agreement: 3/3 among completed experts.

Verified fact: Thai tax-domain correctness is product-defining: entityType and vatStatus are independent, VAT is conditional on VAT registration and enablement, tax_invoice is conditional/locked, WHT uses explicit eligible line basis with proportional document-discount allocation, deposit is derived, and rounding is centralized/deterministic.

Agreement: 3/3 among completed experts.

Verified fact: V1 excludes login, cloud sync, subscription billing, e-sign, payment confirmation, auto document conversion, Excel reports, inventory, ledger/accounting, e-Tax/e-Receipt integration, AI generation, and free-form template/design tooling.

Agreement: 3/3 among completed experts.

Verified fact: JSON import/export is capability-held-but-not-exposed under owner decision D-2026-09-03 and is not a V1 customer-facing backup contract.

Agreement: 3/3 among completed experts recognize this state or its risk.

Verified fact: Candidates report no live pilot, repeat-usage, willingness-to-pay, or segment-priority evidence.

Agreement: 3/3 among completed experts.

Verified fact: Current implementation is not yet complete sellable V1 because Phase 4.1 logo, Phase 5 PromptPay QR, and Phase 6 hardening/gate remain unfinished or not opened according to Candidates B/C; Candidate A also reports Phase 4.1 intake/blocker and PV uncertainty.

Agreement: 2/3 explicit current-state gap; 1/3 compatible but less explicit.

## 3. Consensus / Majority / Dissent

### Consensus — 3/3 among completed experts

Verified fact: DocCraft should be a focused Thai business-document studio, not accounting software.

Verified fact: Primary users are Thai micro-business operators: freelancers, tradespeople, mechanics/contractors, made-to-order/service shops, and micro-SMEs.

Verified fact: The core product loop ends in A4 preview and native browser print.

Verified fact: Thai tax-domain correctness is a core differentiator.

Verified fact: V1 must stay no-login/no-backend and avoid cloud/account/payment/e-sign/accounting/e-Tax scope.

Verified fact: PromptPay in V1 is payment instruction only, not payment processing.

Verified fact: Browser local storage is convenience persistence, not durable cloud backup.

Verified fact: No live market evidence proves willingness to pay or repeat usage yet.

### Majority — 2/3 among completed experts

Evidence: Candidate B and C explicitly define sellable V1 completion as Phase 6 MVP Release Gate / PRD acceptance gates. Candidate A aligns with the PRD V1 boundary but does not center Phase 6 in the same way.

Recommendation: Use Phase 6 / PRD acceptance gates as the formal V1 completion line.

Evidence: Candidate B and C frame local-first primarily as implementation/delivery model; Candidate A gives it more product-value weight.

Recommendation: Position local-first as enabling no-login, instant start, privacy disclosure, and low operating cost; do not make it the main headline identity.

Evidence: Candidate B and C explicitly identify telemetry mode as unresolved before pilot; Candidate A focuses more on willingness-to-pay/PV evidence.

Recommendation: Treat telemetry-mode selection as required before Public Pilot, not required to define Product Gate identity.

### Minority / Dissent — 1/3 among completed experts

Evidence: Candidate A treats local-first more strongly as part of V1 value proposition.

Impact: This can improve privacy framing, but can over-promise durability if not worded carefully.

Evidence: Candidate C uniquely reports stale JSON-backup messaging in lower-authority docs after D-2026-09-03.

Impact: Even as 1/3 dissent/evidence, this is high-impact because public/support messaging could promise backup controls users cannot see.

Evidence: Candidate C emphasizes repeat-use risk from single-active-draft/no-history more strongly than A/B.

Impact: Pilot repeat-use metrics may be confounded by product scope rather than weak demand.

## 4. Missing Evidence / Unresolved Questions

Unknown: Which segment has the strongest paid pain: freelancer, field contractor, service shop, made-to-order shop, or broader micro-SME.

Consensus: 3/3 among completed experts identify missing market/pilot evidence.

Unknown: Will users pay for a no-login local-first document studio without account/cloud/history?

Consensus: 3/3 among completed experts.

Unknown: Pilot telemetry collection mode is not chosen.

Agreement: 2/3 among completed experts.

Unknown: Browser print fidelity beyond Chrome/Edge desktop is not proven.

Consensus: 3/3 among completed experts.

Unknown: Exact future for JSON import/export: keep hidden, re-expose as backup, or package later.

Consensus: 3/3 among completed experts identify this as current/future risk or unresolved commercial/product item.

Owner Decision: Phase 4.1 logo intake confirmation is required before that work proceeds.

Agreement: 2/3 explicit; 1/3 notes Phase 4.1 blocker/intake.

External blocker: Pricing, packaging, paid conversion criteria, and competitor positioning belong to Business/Market Gate.

## 5. Synthesizer Recommendation

Recommendation: Define DocCraft V1 as:

> A no-login, browser-first Thai business-document studio for micro-business owner/operators who need fast, correct, A4-controlled quotations, invoices, receipts, work orders, and VAT-conditional tax invoices without using a full accounting system.

Recommendation: Sellable V1 ends at the PRD acceptance gates through Phase 6, including single business logo and PromptPay QR as bounded V1 capabilities, and excluding account/cloud/payment/e-sign/accounting/e-Tax/AI/template-designer scope.

Recommendation: Use `REMEDIATE` for this Product Gate, not `PASS`, because the product definition is clear but the gate package needs explicit remediation before it can be used downstream:

1. State that current implementation is not yet sellable V1 until Phase 4.1, Phase 5, and Phase 6 are complete.
2. Carry the JSON import/export hidden/non-contractual boundary into all Product Gate artifacts.
3. Flag stale public/support messaging risk around JSON backup for later doc cleanup before pilot/market use.
4. Record owner decisions needed for Phase 4.1 intake, pilot telemetry mode, JSON future, and Phase 7+ timing.

## 6. Why This Recommendation

Evidence: All candidates independently converge on the same product identity, target user, core loop, Thai tax correctness, and V1 non-goals.

Evidence: Two candidates explicitly define V1 completion as Phase 6/PRD gates, and the third candidate is compatible with the PRD non-goal boundary.

Evidence: All candidates warn that willingness-to-pay and repeat use are unvalidated; therefore Product Gate can define V1 but cannot claim market success.

Evidence: JSON backup is a cross-candidate risk. Candidate C's stale-doc observation is only 1/3 but is material enough to require remediation because it affects user trust and public claims.

Recommendation: REMEDIATE preserves a usable product decision while preventing downstream misuse as "V1 is ready/sellable today."

## 7. Rejected Alternatives + Why

Rejected alternative: Make DocCraft a full accounting system.

Reason: Rejected by 3/3 among completed experts and by V1 non-goals. It would require ledger, inventory, compliance, reports, and broader liability.

Rejected alternative: Make e-Tax/e-Receipt compliance the V1 product.

Reason: Rejected by 3/3. Candidates all treat e-Tax/e-Receipt integration/legal certification as out of V1.

Rejected alternative: Make cloud/login/account history required for V1.

Reason: Rejected by 3/3. V1 is explicitly no-login/no-backend; cloud/pro belongs after PV.

Rejected alternative: Position local-first as the main product headline.

Reason: Rejected by majority 2/3. It is true architecture and useful trust context, but the main customer value is speed, correctness, and A4-controlled document production.

Rejected alternative: Treat JSON export as visible V1 backup.

Reason: Rejected by current owner decision D-2026-09-03 and by 3/3 recognition that it is hidden/non-contractual or risky. Re-exposure requires scope review.

Rejected alternative: PASS without remediation.

Reason: The definition is strong, but the gate would be misleading if downstream readers miss unfinished V1-scope work, hidden JSON boundary, and stale backup messaging risk.

Rejected alternative: BLOCK.

Reason: No hard blocker prevents answering the Product Gate. The Product Gate can be decided with scoped remediation.

## 8. Gate Verdict + Blockers

Gate verdict: REMEDIATE

Meaning: Product Gate is decidable and has a recommended V1 direction, but it should not be treated as clean PASS until remediation items are acknowledged in the Product Pack and before downstream owner/market handoff.

Blockers:

- No hard Product Gate blocker.
- Remediation required: do not call current implementation sellable V1.
- Remediation required: reconcile JSON backup messaging before public/support materials are used.
- Remediation required: owner must make downstream choices for Phase 4.1 intake and pilot telemetry.

## 9. Confidence

Confidence: 82/100

Reasoning: High confidence on identity, user, V1 scope, non-goals, and core business rules because 3/3 candidates converge. Confidence is lower than 90 because live sellability is unproven, Phase 4.1/5/6 remain incomplete, telemetry mode is unresolved, and one candidate reports stale JSON-backup messaging that may affect public claims.

## 10. Technical Document Pack

Created Product Pack:

- PRODUCT-SOURCE-OF-TRUTH.md
- PRODUCT-SCOPE.md
- USER-FLOWS.md
- BUSINESS-RULES.md
- V1-ACCEPTANCE-CRITERIA.md
- OPEN-DECISIONS.md

Recommendation: These six files are sufficient for a stable Product Gate without padding. They separate identity, scope, flows, domain rules, acceptance evidence, and owner decisions.

## 11. Thai OWNER-BRIEF

Created: 01-PRODUCT-OWNER-BRIEF.md

The OWNER-BRIEF explains the same verdict, ratios, recommendation, risks, unresolved questions, and owner decisions in Thai.

