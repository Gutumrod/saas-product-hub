# DC01 DocCraft — Business/Market Document Pack

Date: 2026-09-04  
Gate: Business/Market Gate  
Product: DC01 DocCraft  
Status: Remediated Business/Market Gate document pack. This document does not mutate any product or pricing source of truth.

## BUSINESS-MODEL

### Model Summary

DocCraft should be modeled as a free, no-login document studio that validates demand first, with a one-time paid unlock hypothesis for tax-correct/professional-output features after Product Gate remediation and Public Pilot validation. Subscription should be deferred until DocCraft has account/history/cloud/catalog/reporting features that create recurring value.

Owner decision D1 locks this commercial path. DocCraft remains no-login and local-first; it does not become an account/cloud/subscription product in V1, and Phase 7 monetization scope is not added to this gate.

### Primary User And Payer

| Dimension | Definition |
|---|---|
| Primary user | Thai micro-business owner/operator, freelancer, service shop, tradesperson, made-to-order seller, or small operator producing business documents directly. |
| Primary payer | Same person as the user. V1 has no buyer/user split, procurement process, admin buyer, or team account. |
| Paid outcome | A correct, clean, A4-controlled Thai business/tax document produced quickly without learning or subscribing to a full accounting system. |

Core paid value proposition: Thai business/tax documents that are more correct, faster, A4-print-ready, without adopting a full accounting system.

### Value Chain

Pain -> Capability -> Outcome -> Business Value -> Reason to Pay

| Step | DocCraft meaning |
|---|---|
| Pain | Thai micro-businesses waste time and risk mistakes using Word/Excel/free generators for quotations, invoices, receipts, work orders, tax invoices, VAT, WHT, deposit, and rounding. |
| Capability | No-login browser studio with Thai tax-domain correctness, local autosave, A4 preview, native print/Save-as-PDF, and PromptPay payment instruction. |
| Outcome | A presentable, tax-aware Thai business document in minutes without account setup or accounting-software adoption. |
| Business value | Time saved, fewer document corrections, fewer tax-math mistakes, more professional customer-facing documents, lower overhead than full accounting software. |
| Reason to pay | "I need a correct tax/clean/professional document now and do not want to adopt a full accounting system." |

## MONETIZATION

### Recommended Model

Recommended model: one-time-first hybrid.

| Phase | Monetization stance | Reason |
|---|---|---|
| Pre-remediation V1 | Do not sell. | Product Gate says Phases 4.1/5/6 are incomplete; V1 is not sellable. |
| Public Pilot V1 | Free validation funnel. | Needed to measure tax-document usage, repeat usage, preview completion, print/export completion, and willingness/reason to pay. |
| Post-remediation paid test | One-time unlock hypothesis, approximately THB 299-599. | Closest cited structural competitor, BillKub, is reported by Candidate C at THB 299 one-time; V1 lacks subscription retention infrastructure. |
| Phase 7+ | Reconsider subscription only after account/history/cloud/catalog/reporting exist. | Recurring value needs recurring workflow, not just one document session. Subscription is not a V1 model. |

### Candidate Model Ratios

| Model | Candidate support | Interpretation |
|---|---:|---|
| One-time / one-time-first hybrid for V1 shape | 2/3 | Best fit for no-login/local-first transactional value. |
| Subscription only after Phase 7+ | 2/3 | Recurring monetization should wait for account/history/cloud/reporting. |
| Do not sell V1 at all | 1/3 strongly; 3/3 until remediation | Candidate B rejects direct V1 paid path; all candidates agree no paid launch before readiness and validation. |
| Usage-based V1 pricing | 0/3 as primary | Poor fit for no-login/local-first and hard to meter/enforce. |

### Paid Feature Hypotheses

These are hypotheses, not validated pricing decisions.

| Paid hypothesis | Evidence basis | Validation needed |
|---|---|---|
| Conditional tax invoice unlock | Candidate A/C support; BillKub reportedly makes tax invoice Pro-only; Thai tax correctness is DocCraft's strongest wedge. | Pilot paid-intent test by VAT-registered users. |
| WHT eligible-line basis + proportional discount allocation | 3/3 candidates identify tax-depth as differentiation; Candidate C says BillKub lacks WHT. | Test whether users understand and value this enough to pay. |
| Clean/no-watermark/branded output | Competitors use watermark/branding as paid lever. | Test whether buyers pay for professionalism alone or only with tax features. |
| Local backup/export | Local-storage trust risk appears in candidates. | Validate whether users see export as paid feature or required trust baseline. |
| Future history/catalog/cloud/reporting | Candidate B/C place recurring value here. | Validate repeat use before building subscription. |

### Public Pilot Telemetry

Owner decision D2 approves minimal anonymous and consented telemetry for Public Pilot validation.

| Rule | Locked constraint |
|---|---|
| No sensitive payloads | Do not collect document contents, customer/company names, tax IDs, financial amounts, or sensitive document fields. |
| No account dependency | Do not require login or account creation for telemetry. |
| No functionality penalty | Refusing telemetry must not reduce core functionality. |
| Product events only | Collect only app opened, document created, tax feature used, preview completed, print/export completed, and return/repeat session. |
| Feedback pairing | Use telemetry together with manual feedback, not instead of it. |
| Implementation ownership | Exact analytics vendor, schema, consent UX, storage, retention, and event transport belong to Architecture / Risk / Pre-Build. |

## COMPETITIVE-LANDSCAPE

### Direct Alternatives

| Competitor / alternative | Candidate-cited facts | DocCraft implication |
|---|---|---|
| BillKub | Candidate C cites free core, local IndexedDB guest mode, PromptPay QR, and THB 299 one-time Pro for tax invoice/logo/no watermark/templates; WHT not available. | Closest structural competitor. Validates one-time model and caps price expectations. |
| EasyQuote | Candidate A/B cite no-signup/free document generator; premium around THB 99/month for no watermark/history/templates. | Free-entry head-to-head pressure; subscription ceiling is low for documents-only. |
| SimpleBalance | Candidate A/B cite free no-signup Thai document/PDF generator with VAT 7%. | Basic document generation is not a moat. |
| Invoicemint / Invoice Builder / other free tools | Candidate B cites free VAT-ready or offline tools; Candidate A cites free generator/template sites. | Free alternatives set THB 0 anchor for shallow features. |
| Word/Excel templates | 3/3 candidates cite or acknowledge as status quo. | Main substitution target; DocCraft must win on time, correctness, and A4 reliability. |

### Indirect Alternatives

| Competitor / alternative | Candidate-cited facts | DocCraft implication |
|---|---|---|
| FlowAccount | 3/3 cite free and paid Thai accounting tiers in low hundreds of THB/month; includes much broader accounting/e-Tax/tax workflows. | Subscription price ceiling: DocCraft cannot charge like full accounting without full recurring value. |
| PEAK | 2/3 cite free/freelance entry and paid accounting tiers. | Validates Thai accounting willingness-to-pay, but not V1 document-only monetization. |
| Kitslancer | Candidate B cites THB 399/month freelancer workspace with PromptPay/WHT/tax features. | Supports recurring Thai freelancer value when workflow suite exists. |
| Zoho Invoice / Wave | Candidate C cites free international invoicing core and paid adjacent layers. | Global benchmark: invoices are often free; monetization comes from adjacent workflow, automation, branding, payments, or accounting. |

## POSITIONING

### Recommended Positioning

DocCraft should be positioned as:

> The fastest no-login Thai business-document studio for micro-business owners who need tax-aware, A4-ready documents without adopting full accounting software.

### Positioning Boundaries

| Do say | Do not say |
|---|---|
| "Tax-aware document creation" | "Certified accounting/legal compliance" |
| "No-login, local-first, fast document production" | "Cloud accounting replacement" |
| "Correctness checks for VAT/WHT/tax-invoice document logic" | "Revenue Department filing/e-Tax submission" |
| "A4 preview and browser print" | "Guaranteed identical print across all browsers/devices" until verified |
| "For Thai micro-business operators" | "For enterprises/accounting teams" |

### Differentiation Claims To Validate

| Claim | Current status |
|---|---|
| WHT/deposit/discount/rounding correctness is deeper than free generators. | Plausible from candidate evidence, but competitor depth must be periodically rechecked. |
| No-login is a meaningful advantage over FlowAccount/PEAK. | Plausible for low-friction users; unvalidated as paid driver. |
| Tax invoice gating is commercially valuable. | Plausible for VAT-registered users; paid conversion unvalidated. |
| A4 print reliability is a key trust driver. | Product/Launch verification still required. |

## CUSTOMER-VALUE-PROPOSITION

### Primary Value Proposition

For Thai micro-business owners who create documents themselves, DocCraft reduces the time and risk of producing professional Thai business/tax documents by combining no-login speed, local-first privacy, A4 print control, and Thai tax-domain correctness.

### Segment-Specific Value

| Segment | Likely value | Revenue confidence |
|---|---|---|
| VAT-registered micro-seller | Tax invoice validity, VAT/WHT correctness, clean formal output. | Highest hypothesis; still unvalidated. |
| Freelancer / contractor | Quotation/invoice/receipt speed, PromptPay instruction, professional appearance. | Medium; strong free competition. |
| Service shop / tradesperson | Work order + invoice/receipt in one simple flow. | Medium; repeat-use unknown. |
| Non-VAT casual seller | Fast documents and clean print. | Low paid confidence because free tools likely good enough. |

## PRICING-HYPOTHESES

These are test hypotheses, not approved prices.

| Hypothesis | Suggested test | Success signal |
|---|---|---|
| H1: Users will pay THB 299 one-time for clean output + tax invoice + branded documents. | Landing-page or in-product paid-intent test after remediation. | Meaningful click-to-pay or completed-payment rate among repeat users. |
| H2: Users will pay THB 499-599 one-time if WHT/deposit/tax-invoice correctness is clearly explained. | A/B test tax-depth messaging vs branding messaging. | Tax-depth variant improves paid intent among VAT/WHT users. |
| H3: Subscription is not viable until history/cloud/catalog/reporting exist. | Pilot retention cohort with no history vs prototype paid-waitlist for Phase 7+. | Subscription intent correlates with history/cloud/reporting demand, not one-off documents. |
| H4: Free core is required for acquisition. | Compare free completion funnel against upfront paywall. | Free funnel produces document completion and repeat return sufficient for upsell testing. |

## MARKET-ASSUMPTIONS

| Assumption | Status | Validation path |
|---|---|---|
| Thai micro-business document pain is real. | Supported by 3/3 candidates and external competitor landscape. | Public Pilot qualitative feedback and completion metrics. |
| A narrower VAT/WHT/tax-invoice segment will pay. | Hypothesis supported by tax-pain and competitor paid-tier anchors. | Segment-specific paid-intent tests. |
| One-time purchase is the best V1-compatible model. | Majority 2/3; strongest direct competitor evidence from Candidate C. | Test THB 299/499/599 one-time offers. |
| Subscription becomes viable with Phase 7+ recurring workflow features. | Majority 2/3; supported by FlowAccount/PEAK/Kitslancer category evidence. | Validate retention and feature demand before build. |
| Free alternatives will suppress conversion for shallow document features. | Consensus 3/3. | Track paid-intent difference between non-tax and tax-document users. |
| Local-first/no-login is a trust and convenience advantage. | Plausible but commercially unvalidated. | Pilot interviews and funnel comparison against login-first alternatives. |

## GATE VERDICT

Verdict: PASS

Business/Market Gate passes because D1 locks a credible V1-compatible commercial path and D2 locks the Public Pilot telemetry mode needed to validate the remaining market hypotheses. The pass is limited to Business/Market. It does not approve launch, paid checkout/unlock implementation, telemetry vendor/schema, pricing-document mutation, or V1 subscription.

## DOWNSTREAM BLOCKER CLASSIFICATION

| Remaining item | Gate classification |
|---|---|
| Checkout, unlock, and entitlement mechanism for THB 299-599 one-time unlock. | Architecture / Pre-Build |
| Telemetry implementation, vendor, consent UX, schema, retention, and transport. | Architecture / Risk / Pre-Build |
| Phase 4.1 / 5 / 6 product work. | Product / Launch |
| Local-storage trust, data-loss handling, and backup/export UX. | Product / Risk / Launch |
| A4 print/export fidelity across browsers and devices. | Product / Launch |
| Legal/accounting disclaimer for tax-correctness positioning. | Risk / Launch |

## BUSINESS-OWNER-BRIEF SUMMARY

DocCraft Business/Market Gate is PASS after Owner decisions D1-D2. The paid market is credible, especially around Thai tax-correct documents for micro-businesses, and the commercial path is now locked: finish Phase 4.1/5/6, open a free Public Pilot with minimal anonymous consented telemetry, validate usage/repeat/print-export/WTP, then test a THB 299-599 one-time unlock after the sellable feature set is ready. This is not launch approval and does not approve subscription as V1.
