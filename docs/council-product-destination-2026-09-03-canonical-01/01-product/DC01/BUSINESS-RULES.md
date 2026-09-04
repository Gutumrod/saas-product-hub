# DC01 DocCraft — Business Rules

Status: Product Gate artifact  
Gate verdict: REMEDIATE  
Completed experts: 3/3

## Thai Tax Domain

Verified fact: entityType and vatStatus are independent dimensions.

Consensus: 3/3 among completed experts.

Rule:

- Do not infer VAT registration from entity type.
- Individual can be VAT registered.
- Juristic person is not automatically VAT registered.

## Document Types

Verified fact: V1 document types are quotation, invoice, receipt, work order, and conditional tax invoice.

Consensus: 3/3 among completed experts.

Rule:

- Tax invoice must stay locked until business is VAT registered and required fields are complete.
- Tax invoice validation is not legal certification.

## VAT

Verified fact: VAT rate is 7% in the candidate evidence; VAT applies only when business is VAT registered and VAT is enabled.

Consensus: 3/3 among completed experts.

Rule:

- VAT must not apply solely because the business is juristic.
- VAT must not be marketed as e-Tax/e-Receipt compliance.

## WHT

Verified fact: WHT uses explicit eligible line basis with proportional document-discount allocation.

Consensus: 3/3 among completed experts.

Rule:

- WHT applies only to marked eligible lines.
- Document-level discount affects WHT basis proportionally.
- WHT behavior must remain deterministic and tested.

## Deposit

Verified fact: Deposit is an optional derived amount and can be percent or fixed depending on scope described by candidates.

Consensus: 3/3 among completed experts.

Rule:

- Deposit can be shown and used for net payable / PromptPay amount modes.
- Deposit does not mean payment has been made.

## Rounding

Verified fact: V1 requires a centralized/single rounding policy.

Consensus: 3/3 among completed experts.

Rule:

- Totals should be deterministic across line discounts, document discounts, VAT, WHT, deposit, and net payable.

## PromptPay

Verified fact: PromptPay QR is a payment instruction on the user's document, not DocCraft billing.

Consensus: 3/3 among completed experts.

Rule:

- PromptPay target and amount must be validated.
- No payment confirmation, slip verification, paid-status automation, or gateway behavior in V1.

## JSON Import / Export

Verified fact: Under owner decision D-2026-09-03, JSON import/export is capability-held-but-not-exposed, not a V1 customer-facing backup contract.

Consensus: 3/3 among completed experts recognize the hidden/non-contractual state or risk.

Rule:

- Do not describe JSON export as a visible V1 backup path.
- Re-exposure requires scope review.
- Any future monetization or paid packaging decision belongs to Business/Market or later product scope review, not this Product Gate.

## Local Storage

Verified fact: Browser local storage is convenience persistence, not durable cloud backup.

Consensus: 3/3 among completed experts.

Rule:

- Surface quota/storage errors.
- Preserve in-memory work on storage failure where possible.
- Disclose that browser data clearing can lose drafts.

## Claims Guardrail

Recommendation: Public or owner-facing claims must avoid:

- "Tax compliant" without legal qualification.
- "e-Tax/e-Receipt platform."
- "PDF generator."
- "Payment system."
- "Durable backup."
- "Cloud sync" or "account history" for V1.

Agreement: 3/3 on the underlying non-goals and risk; 1/3 explicitly identifies stale JSON-backup messaging as remediation item.

