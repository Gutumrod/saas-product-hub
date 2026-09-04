# DC01 DocCraft — Product Scope

Status: Product Gate artifact  
Gate verdict: REMEDIATE  
Completed experts: 3/3

## Scope Rule

Recommendation: V1 is a focused document-production tool. Any feature that makes DocCraft behave like accounting software, hosted SaaS, payment processing, legal tax certification, document lifecycle automation, or design software is out of V1.

Consensus: 3/3 among completed experts.

## V1 Product-Defining Capabilities

Verified fact: The following capabilities define V1:

1. No-login browser-first document creation.
2. Thai business documents: quotation, invoice, receipt, work order, conditional tax invoice.
3. Modular editor with toggleable document blocks.
4. Thai tax-aware calculation engine.
5. A4 preview and native browser print.
6. Local autosave and schema-versioned restore.
7. Storage failure handling with visible error state and no silent loss.
8. Item image support within bounded image pipeline.
9. Single business logo block after Phase 4.1.
10. PromptPay QR as document payment instruction after Phase 5.

Consensus: 3/3 among completed experts.

## V1 Completion Boundary

Verified fact: Candidate B and C define the completion boundary as Phase 6 MVP Release Gate / PRD acceptance gates. Candidate A aligns to the PRD V1 non-goal boundary and acknowledges Phase 4.1 / PV unresolved items.

Agreement: 2/3 explicit Phase 6 boundary; 1/3 compatible but less explicit.

Recommendation: Downstream gates should use this wording: "V1 scope is defined by PRD acceptance gates through Phase 6; current implementation is not yet sellable V1 until Phase 4.1, Phase 5, and Phase 6 gates are complete."

## Explicit Non-Goals

Verified fact: The following are outside V1:

- Account/login/auth.
- Cloud sync, Supabase backend, cross-device history.
- Subscription billing or payment gateway.
- Payment confirmation, paid status automation, slip verification, POS behavior.
- E-Sign or customer signing links.
- Auto document lifecycle conversion.
- Excel monthly reports.
- Inventory, ledger, GL, full accounting.
- e-Tax / e-Receipt platform behavior or legal certification.
- AI generation.
- Free-form template designer, arbitrary positioning, brand kit, multiple logos, watermark.
- Customer-facing JSON backup/export contract under D-2026-09-03.

Consensus: 3/3 among completed experts.

## Product-Defining vs Wait

Recommendation: Keep these in V1 because they serve the primary loop:

- Single logo: document professionalism and brand identity.
- PromptPay QR: payment instruction tied to invoice/deposit workflow.
- Item images: useful for made-to-order/service contexts.
- Tax rules: core Thai-market correctness.

Consensus: 3/3 among completed experts treat logo, PromptPay, modular blocks, tax, A4 print, local persistence as V1-defining.

Recommendation: Keep these post-MVP:

- Customer/product catalog.
- Document history.
- Cloud sync.
- Pro billing/subscriptions.
- E-sign.
- Excel/reporting.
- Advanced templates.
- AI.

Consensus: 3/3 among completed experts.

## Boundary Risks

Evidence: Candidate C identifies stale messaging in lower-authority docs that still presents JSON backup as user-facing. Candidate B and A identify hidden JSON backup as an unresolved/commercial/data-loss risk.

Agreement: 1/3 explicitly reports stale documentation contradiction; 3/3 report JSON backup/customer-facing backup boundary as important.

Recommendation: Remediate Product Gate documentation by making JSON backup hidden/non-contractual in this Product Pack and requiring later doc cleanup before public messaging.

