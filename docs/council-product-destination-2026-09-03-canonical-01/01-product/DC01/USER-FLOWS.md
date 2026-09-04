# DC01 DocCraft — User Flows

Status: Product Gate artifact  
Gate verdict: REMEDIATE  
Completed experts: 3/3

## Core Value Loop

Verified fact: The core loop is:

1. Select document type.
2. Enter business, customer, and item data.
3. Toggle optional blocks.
4. Check totals.
5. Preview A4 document.
6. Print through browser native print dialog.

Consensus: 3/3 among completed experts.

Recommendation: Product messaging and V1 acceptance should treat this loop as the product, not as one feature among many.

## Flow 1 — First Document Without Login

Verified fact: V1 must let a new user reach preview/print without login or backend dependency.

Consensus: 3/3 among completed experts.

Acceptance:

- User opens app.
- User selects quotation, invoice, receipt, work order, or eligible tax invoice.
- User enters minimum valid business/customer/item data.
- User previews A4 output.
- User opens native print dialog.
- No account, credential, payment account, or server call is required.

## Flow 2 — Thai Tax-Aware Document Creation

Verified fact: V1 supports VAT/WHT/deposit/discount/rounding rules for Thai business documents.

Consensus: 3/3 among completed experts.

Acceptance:

- User chooses entityType independently from vatStatus.
- VAT applies only when business is VAT registered and VAT is enabled.
- Tax invoice remains locked until VAT-registered profile and required fields are complete.
- WHT applies only to explicit eligible lines.
- Document discount allocation affects WHT proportionally.
- Deposit amount can affect net payable without becoming payment confirmation.

## Flow 3 — Branded A4 Output

Verified fact: Phase 4.1 single business logo is approved V1 scope but not yet implemented/opened according to Candidates B/C.

Agreement: 2/3 explicitly state logo is not yet implemented/opened; 1/3 notes Phase 4.1 intake/blocker.

Acceptance:

- User can add one business logo in the fixed branding area.
- Failed logo replacement preserves accepted existing logo.
- Logo does not become free-form design, watermark, multi-logo, or brand-kit scope.

## Flow 4 — PromptPay Payment Instruction

Verified fact: PromptPay QR is in V1 scope as a document payment instruction, not DocCraft billing or payment verification.

Consensus: 3/3 among completed experts.

Acceptance:

- User enters validated PromptPay target.
- User chooses no fixed amount, deposit amount, or net-payable amount where allowed.
- QR appears as payment instruction on the document.
- System does not confirm payment, update paid status, verify slips, or act as POS.

## Flow 5 — Draft Recovery Within V1 Limits

Verified fact: V1 uses browser storage for autosave and restore; it is not durable cloud backup.

Consensus: 3/3 among completed experts.

Acceptance:

- Normal refresh restores current draft.
- Storage quota/failure is surfaced.
- In-memory work is not silently discarded during storage failure.
- User-facing JSON import/export backup is not part of V1 under D-2026-09-03.

Risk: Clearing browser data, private mode, browser policy, or cross-device use can lose drafts. This is a product trust risk and must be disclosed.

## Flow 6 — Pilot Measurement

Recommendation: Before Public Pilot, choose telemetry mode and measure activation, print/save completion, return usage, and support failures without collecting document/customer contents.

Agreement: 2/3 among completed experts explicitly state telemetry mode is unresolved; 3/3 state pilot/willingness-to-pay evidence is missing.

