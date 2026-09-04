# DC01 DocCraft — Product Gate Candidate A

_(anonymized candidate; identity withheld from synthesizer)_

---

# DocCraft (DC01) â Product Gate Expert Answer (C)

Role: Independent Product Gate expert. Procedure: `llm-council-gate` v0.3.2 (frozen brief `COUNCIL-BRIEF.md`).
Gate question: What exactly should DocCraft be, for whom, and where does sellable V1 end?
Repo inspected: `D:\AI-Workspace\projects\saas-product-hub\products\DocCraft` (branch `master`, HEAD `ceeb2a1`, clean tree).
Note: This is evidence and recommendation only. No Council verdict, no pricing/market decision, no code mutation made.


---

## Recommendation

DocCraft should be a **browser-first, no-login modular business-document studio for the Thai sole-proprietor / small-business segment** (freelancers, mechanics/tradesmen, made-to-order shops) whose core pain is producing quotation, invoice, receipt, and work-order documents without adopting a full accounting system. It should ship as a **local-first (browser-local-storage) tool that generates A4 print output through the native browser print dialog (environment-provided Save-as-PDF), with a clean single-logo business-branding block and strict Thai tax-domain correctness (entity type and VAT registration kept independent, WHT on explicit eligible line basis, deposit/PromptPay as optional derived amounts)**.

Sellable V1 ends precisely at the PRD V1 non-goal boundary: it is **not** an accounting system, **not** an e-Tax Invoice / e-Receipt platform, and offers **no login, no cloud sync, no subscription billing, no E-Sign, no auto document conversion, no Excel reporting, no AI generation, and no free-form template/logo design**. V1 is a focused, correct, fast document-production tool. The strongest sustainable product identity is "**the fastest correct way for a small Thai business to produce and print an invoice / quote / receipt / work order**" â correctness-first in the tax domain (so it is dependable) and speed/simplicity in the editor (so it is actually used). This identity is fully supported by the existing Phase 1â4 implementation; it does not require inventing new capability to make the V1 sellable.

The one decision the product gate should surface as material but is not empowered to resolve here: whether the hidden-but-retained JSON import/export capability (owner decision D-2026-09-03, option 2 KEEP) becomes a deliberately deferred **paid** capability â and therefore a V1 revenue argument â or stays indefinitely capability-held-but-not-exposed. Under the current contract, it is neither a customer-facing backup contract nor a monetization lever; it sits as technical breadth alreeady built.

## Verified facts/evidence used

- **Product definition and core loop** â `docs/PRODUCT_ONE_PAGER.md` ( Â§Product, Â§Core loop) and `docs/PRD.md` Â§1: browser-first; target = freelancers, mechanics, made-to-order shops, small businesses in Thailand; core loop `select doc type â enter data â toggle blocks â check totals â A4 preview â browser print`. Same loop in `SYSTEM_ARCHITECTURE.md` Â§1.
- **No-login / no-backend V1** â PRD Â§1, Â§13 gate 10; SYSTEM_ARCHITECTURE Â§1. Confirmed in source: no `app/**/api` route files and no `route.ts` anywhere; `localStorage` used only in `src/persistence/storage.ts`. Runtime has no Supabase, auth, or payment-gateway requirement for Phases 1â6.
- **Native print, no PDF generator** â PRD Â§8/Â§13 gate 5; SYSTEM_ARCHITECTURE Â§5; `window.print()` present in `src/ui/editor/DocCraftEditor.tsx`; no PDF library in `package.json` deps (only next/react/react-dom + dev tooling). Gate 3 independent review (`GATE3_INDEPENDENT_FINAL_REVIEW_2026-09-01.md`) confirms 118/118 unit, 33/33 E2E, and visual native-print verification with Save-as-PDF destination evidence.
- **Document types and tax contract** â PRD Â§3â4: quotation, invoice, receipt, work order, plus conditional locked `tax_invoice`; `entityType` and `vatStatus` are independent dimensions (an individual can be VAT-registered; a juristic person is not automatically VAT-registered). Confirmed in `src/domain/tax/types.ts`: `VAT_RATE_PERCENT = 7`, `EntityType`, `VatStatus`.
- **Calculation engine correctness** â `src/domain/calculation/calculate.ts`: VAT only when enabled & business VAT-registered; WHT on explicit eligible line basis with proportional document-discount allocation; deposit from percent or fixed; net payable = after-discount + VAT â WHT; single rounding policy. Source verified.
- **Modular editor + compact layout** â PRD Â§7: blocks for business/header, optional business logo, customer, items, optional item-image column, discount/tax/WHT/deposit summary, payment + optional PromptPay QR, terms/notes, signature placeholders; desktop >=1024px editor+live preview, compact <1024px editor/preview switcher (431â1023px is not desktop).
- **Local persistence** â PRD Â§9, SYSTEM_ARCHITECTURE Â§4: autosave, schema versioning/migration, quota/error surfaced (no silent loss), import validates before replace, JSON round-trip retained. Source: `src/persistence/{storage,migration,validation,import-export}.ts`. Gate 4 independent re-review (`GATE4_INDEPENDENT_REVIEW_2026-08-26.md`) = PASS incl. image pipeline guards (262,144-byte encoded cap, 960px long edge, JPEG/WebP canonical, bounded retries) and 32/32 E2E.
- **V1 non-goals** â PRD Â§11 explicit list; SYSTEM_ARCHITECTURE Ã'9; ROADMAP Phase 7/8/9 gate post-MVP (auth/Supabase/cloud, billing, E-Sign/Excel/conversion/templates) behind the PV pilot-validation gate.
- **Owner decision D-2026-09-03** â `docs/PRODUCT_DECISIONS.md`: option 2 KEEP hiding JSON backup UI entry points; handler retained, not a customer-facing V1 backup contract, re-surface requires re-scope review. Resolves `OPEN-FINDING-json-backup-controls-2026-09-03.md` to RESOLVED.
- **Gate state** â `docs/CURRENT_STATUS.md` (2026-09-03): Gates 1, 2, 4 closed; Gate 3 PASS/CLOSED after 2026-09-01 remediation + independent final review; Phase 4.1 Business Logo blocked only on mandatory intake (owner confirmation). Working tree clean at `ceeb2a1`; pushed to `origin/master`.
- **Module Hub** â `../module-scan/COUNCIL-BRIEF.md` (in the canonical-01 council dir) is **STATUS: HOLD** â no module-fit inspection is released at this gate, so no module candidates are evidence for this answer.

## Key reasons

1. **Correctness-first is a defensible wedge in a sea of "simple invoice tools".** The tax domain is where small Thai businesses get burned (entity type vs VAT registration confusion; WHT on the wrong basis). Getting this right â independently tested â is a genuine, verifiable product differentiator, not marketing bloat.
2. **The no-login / no-backend / browser-print architecture is a real launch advantage.** Zero-friction start (PRD gate 10), no infrastructure to operate for V1, and a privacy story ("data stays in your browser") that suits solo operators.
3. **The V1 boundary is already tight and already mostly built.** Four core types + conditional tax invoice, modular editor, native A4 print, local autosave, optional PromptPay, optional single business logo â exactly the sellable core. Every Phase 1â4 capability is product-defining, not breadth that should have waited.
4. **Post-MVP breadth is correctly gated behind a pilot-validation gate (PV)** rather than shipped on faith â auth/cloud/billing/E-Sign/Excel all wait for real repeat-usage evidence.
5. **The strongest "sellable V1" endgame is a focused local-first studio**; the alternative identity ("accounting replacement") is explicitly a non-goal and would drag in ledger, inventory, e-Tax integration, and tax-compliance claims the claim guardrail (Â§14) forbids.

## Risks / failure cases

- **Not enough willingness to pay for a browser-only local-first tool** with no accounts/cloud sync â users may expect "an app" with accounts and cross-device access. Mitigated only if the PV phase surfaces willingness to pay for correctness + speed. (Monetization is Business/Market gate.)
- **Tax-correctness overclaims (legal/integration liability).** Marketing it as a tax-compliant/e-Tax platform before Phase 7+ integration invites regulatory liability. The claim guardrail and PRD Â§3 must be enforced in every asset.
- **Native-print output is not identical across browsers/OS.** Save-as-PDF depends on environment dialogs; pagination best-effort â support friction.
- **LocalStorage/browser-storage limits and clearing.** Local persistence is convenience storage, not durable backup; with JSON export hidden in V1, a user who clears browser storage loses drafts with no visible recoverable path.
- **PromptPay scope creep.** Document QR is a payment instruction, not payment-verification/POS (PRD Â§10); adding paid-status confirmation would push it to Phase 8+.
- **Hidden JSON backup drifting into an undocumented orphan.** Retained-but-hidden, exercised only via `dispatchEvent` in tests; if never surfaced, dead breadth and support inconsistency.
- **Phase 4.1 single-logo assumption.** Some made-to-order shops may expect multi-logo/watermark/brand-kit â scoping expectation to manage in messaging.

## Assumptions

- The Thai freelancer / tradesman / small-business segment identified in PRD/one-pager is the intended primary market and pain; I take this as the given brief, not a fact independently validated against live users.
- "V1 is sellable" means a revenue-viable V1 exists for at least some of this segment once price/positioning is set by the Business/Market gate; willingness-to-pay is still an open commercial hypothesis (one-pager Â³Pricing).
- V1 can be released/valued without login at PRD-required quality because the no-login core loop is complete and gate-verified; I did not re-run the build/tests this pass (evidence files + source inspection are the basis).
- Owner decision D-2026-09-03 (KEEP JSON backup product) remains ACTIVE through V1 release.
- Module Hub scan stays on HOLD; no module-fit findings are binding at this product gate.

## Open questions / missing evidence

- **Willingness to pay**: No live-user evidence of pricing acceptance or retention for a no-login local-first studio exists yet (PV gate is designed to produce it). The single biggest open question for "sellable V1".
- **Who exactly the paying buyer is**: the document creator (freelancer/tradesman) or the customer/owner who receives the PDF â not validated.
- **Multi-browser print fidelity beyond Chrome/Edge**: only Chrome/Edge desktop verified; Firefox/Safari/mobile-browser native-print untested.
- **Phase 4.1 intake**: implementation not yet opened (blocked on owner intake confirmation).
- **V1 "sellable" definition**: no explicit number (paid conversions, repeat weekly usage, docs/user/day) was verified this pass.
- **Hidden JSON backup's end game**: deferred or monetized? Owner decision is KEEP-hidden; commercial intent unresolved at product level.
- **Long-horizon identity**: does DocCraft eventually become the accounting/e-Tax product (Phase 7â9) or stay a focused studio? Roadmap leaves both open.

## Confidence

**78 / 100**

High confidence on *what DocCraft is* (browser-first, no-login, modular, Thai-small-business document studio), the *core loop*, the *V1 boundary*, and *which capabilities are product-defining* â clearly specified in authoritative contracts and corroborated by verified source and gate evidence. Moderate confidence on *sellability*: real willingness-to-pay and a concrete paying-buyer profile are unresolved, the Module Hub scan is on HOLD, and V1 revenue depends on Business/Market gate inputs I must not decide here.
