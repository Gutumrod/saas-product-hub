# DC01 DocCraft — Product Source of Truth

Status: Product Gate artifact  
Gate verdict: REMEDIATE  
Procedure: llm-council-gate v0.3.2  
Inputs: COUNCIL-BRIEF.md, CANDIDATE-A.md, CANDIDATE-B.md, CANDIDATE-C.md, SYNTHESIS-MANIFEST.md  
Completed experts: 3/3

## Claim Classification

Every statement in this document is classified as one of: Verified fact, Evidence, Assumption, Unknown, Recommendation, Owner Decision, External blocker.

## Product Identity

Verified fact: DocCraft is a no-login, browser-first Thai business-document studio for micro-business users who need to create business documents without adopting a full accounting system.

Consensus: 3/3 among completed experts.

Recommendation: The clearest product identity is: "fast, correct, A4-controlled Thai business documents without a full accounting system."

Evidence: All candidates identify the same core shape: browser-first/no-login, quotation/invoice/receipt/work order plus conditional tax invoice, modular document blocks, native browser print, local autosave, Thai tax-aware calculations, and no backend requirement for V1.

## Target Customer and User

Verified fact: The target users named by the candidates are freelancers, mechanics/tradespeople, field contractors, custom/made-to-order shops, service shops, and micro-SMEs in Thailand.

Consensus: 3/3 among completed experts.

Recommendation: Treat the V1 primary buyer and primary user as the same person: a Thai micro-business owner/operator who creates documents themselves.

Agreement: 2/3 among completed experts explicitly framed buyer and user as the same person; 1/3 left the paying buyer profile unresolved.

Unknown: Which sub-segment has the strongest paid pain is not validated by live-user evidence.

## Problem / Pain

Verified fact: The core pain is producing quotations, invoices, receipts, work orders, and tax-relevant business documents quickly and correctly without using Word/Excel templates or a full accounting system.

Consensus: 3/3 among completed experts.

Evidence: Candidates converge on repeated document creation, Thai VAT/WHT/deposit details, A4 print control, mobile/field use, and avoiding accounting-system complexity.

## Value Proposition

Recommendation: V1 should promise speed, correctness, controlled A4 output, and low-friction start:

- Create a Thai business document without login.
- Enter business/customer/items/payment/tax data in one flow.
- Preview A4 output.
- Print through the browser native print dialog, including Save as PDF when the environment supports it.
- Keep draft convenience through browser autosave, with clear warning that browser storage is not durable backup.

Consensus: 3/3 among completed experts.

Evidence: All candidates identify document-production speed, Thai tax-domain correctness, native A4 print, and no-login as product-defining.

## Product Endgame

Recommendation: V1 is the validation vehicle. Cloud/Pro, account sync, billing, e-sign, document history, lifecycle conversion, Excel reporting, and advanced templates stay post-MVP until Pilot Validation proves repeat use and recurring pain.

Consensus: 3/3 among completed experts.

Unknown: Long-term endgame beyond V1 is not decided. Candidate A leaves open whether DocCraft eventually becomes broader accounting/e-Tax; Candidates B/C strongly keep Phase 7+ behind PV.

## Local-First Positioning

Verified fact: V1 is local-first/browser-local-storage and no-backend.

Consensus: 3/3 among completed experts.

Majority position: Local-first is primarily an implementation/delivery choice that enables instant no-login use and low operating cost, not the headline product identity.

Agreement: 2/3 among completed experts.

Minority / dissent: Local-first can be part of the V1 product value story as a privacy/data-control benefit.

Agreement: 1/3 among completed experts.

Recommendation: Position local-first as "start immediately, no signup; drafts live in your browser" and avoid making "durable backup" or "offline-first" claims.

## Sellable V1 Boundary

Verified fact: Sellable V1 ends at the Phase 6 MVP Release Gate / PRD acceptance gates, not at the current partially completed implementation state.

Consensus: 2/3 among completed experts explicitly define the V1 end at Phase 6 / PRD acceptance gates; 1/3 aligns to the PRD V1 non-goal boundary but does not emphasize Phase 6 as strongly.

Recommendation: Product Gate should pass the scope definition only after remediation documents the current-state caveats and stale JSON-backup contradiction before downstream owner/market use.

## Current State Caveat

Verified fact: The experts report that Gates 1-4 are closed/PASS, but Phase 4.1 business logo, Phase 5 PromptPay QR, and Phase 6 MVP hardening remain unfinished or not opened.

Agreement: 2/3 among completed experts explicitly state this current-state gap; 1/3 notes Phase 4.1 blocked and willingness-to-pay unresolved but presents the V1 identity as already supported by Phase 1-4 implementation.

Recommendation: Do not call current code "sellable V1." Call it "V1 scope defined; implementation still has V1-scope work remaining."

## V1 In Scope

Verified fact: V1 scope includes:

- No-login browser use.
- Quotation, invoice, receipt, work order, and conditional tax invoice.
- Business, customer, items, discount/tax/WHT/deposit, payment, PromptPay QR, terms/notes, signature placeholders, item-image column, and single business-logo block where approved.
- A4 preview and native browser print.
- Local autosave, schema-versioned restore, storage-failure handling, and no silent data loss.
- Thai tax-domain rules: entityType and vatStatus independent, VAT only when registered and enabled, WHT on explicit eligible-line basis with proportional document-discount allocation, deposit calculation, and centralized rounding.

Consensus: 3/3 among completed experts.

## V1 Out of Scope

Verified fact: V1 excludes:

- Login/account.
- Supabase/cloud sync.
- Subscription billing.
- E-Sign/customer signing links.
- Payment confirmation/slip verification.
- Auto quotation to invoice to receipt conversion.
- Excel monthly reporting.
- Inventory.
- Double-entry ledger / GL.
- e-Tax / e-Receipt integration or legal certification.
- AI document generation.
- Free-form template designer, arbitrary layout editing, multiple logos, watermark, or brand kit.
- Customer-facing JSON backup/export contract under current owner decision.

Consensus: 3/3 among completed experts.

## Success Criteria

Recommendation: Product success for V1 should be measured as:

- A new user can create, preview, and print/save a valid A4 document without login.
- Draft survives normal refresh.
- Tax invoice is locked unless VAT-registered profile and required fields are valid.
- Calculation outputs are deterministic across VAT, WHT, discount, deposit, and rounding cases.
- Storage failure is surfaced and preserves in-memory work.
- PromptPay QR is generated only from validated payment-instruction inputs.
- Pilot can measure activation, print/save completion, return usage, and support failures without collecting document/customer content.

Agreement: 3/3 on functional criteria; 2/3 explicitly raise telemetry/pilot measurement readiness.

## Evidence Limits

Unknown: There is no live pilot evidence for willingness to pay, repeat usage, strongest segment, or pricing.

Consensus: 3/3 among completed experts.

Unknown: Chrome/Edge desktop print evidence does not prove Firefox/Safari/mobile print parity.

Consensus: 3/3 among completed experts.

Unknown: Telemetry collection mode for pilot is not chosen.

Agreement: 2/3 among completed experts.

