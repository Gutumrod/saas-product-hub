# DC01 DocCraft — V1 Acceptance Criteria

Status: Product Gate artifact  
Gate verdict: REMEDIATE  
Completed experts: 3/3

## Acceptance Boundary

Recommendation: V1 is acceptable for sellable/pilot use only after PRD acceptance gates through Phase 6 are complete and evidence-backed.

Agreement: 2/3 explicit Phase 6 boundary; 1/3 compatible PRD-boundary position.

## Product Acceptance Criteria

Verified fact: Candidates identify these functional gates as required V1 behavior.

Consensus: 3/3 among completed experts.

Criteria:

1. User can create, preview, and print A4 documents without login.
2. Quotation, invoice, receipt, work order, and conditional tax invoice are supported.
3. Tax invoice locks fail-closed until VAT-registered profile and required fields are valid.
4. entityType and vatStatus remain independent.
5. VAT, WHT, discount, deposit, and rounding outputs are deterministic and tested.
6. Modular blocks render correctly in editor and print output.
7. Desktop and compact layouts respect defined breakpoints.
8. Native browser print is used; no PDF-generator promise.
9. Local autosave restores after normal refresh.
10. Storage failures are visible and do not silently discard in-memory work.
11. Item images remain bounded by image-pipeline limits.
12. Single logo block is implemented and verified without expanding into free-form design.
13. PromptPay QR is implemented and verified as payment instruction only.
14. No backend/auth/payment/account is required for V1 E2E.

## Evidence Required Before Claiming Sellable V1

Recommendation: Do not mark V1 sellable until evidence exists for:

- Phase 4.1 logo implementation/gate.
- Phase 5 PromptPay QR implementation/gate.
- Phase 6 hardening/release gate.
- Native print reference-browser evidence remains green.
- Privacy/data notice and support messaging match hidden JSON-backup decision.
- Pilot measurement mode is chosen before public pilot.

Agreement:

- 2/3 explicitly identify Phase 4.1/5/6 as remaining.
- 2/3 explicitly identify telemetry mode as unresolved.
- 1/3 explicitly identifies stale JSON-backup docs requiring reconciliation.
- 3/3 identify no live-user/pilot/willingness-to-pay evidence.

## Commercial Evidence Limit

Unknown: Product Gate cannot prove market sellability. No candidate reports live pilot, paid conversion, repeat usage, or willingness-to-pay evidence.

Consensus: 3/3 among completed experts.

External blocker: Pricing, revenue model, competitor positioning, and market verdict belong to later Business/Market Gate and must not be decided here.

