# DC01 DocCraft — Business/Market Gate Synthesis

Date: 2026-09-04  
Gate: Business/Market Gate  
Product: DC01 DocCraft  
Inputs read: COUNCIL-BRIEF.md, CANDIDATE-A.md, CANDIDATE-B.md, CANDIDATE-C.md, SYNTHESIS-MANIFEST.md  
Candidate identity: Candidate A/B/C are anonymous independent expert answers. No identity inference was attempted.

## 1. Problem Understood

DocCraft is a no-login, local-first Thai business-document studio for quotation, invoice, receipt, work order, and conditional tax invoice. The locked V1 boundary excludes login, account, cloud, billing infrastructure, e-sign, accounting, e-Tax, AI, history, and multi-document catalog. V1 uses local autosave with a single active draft. The primary buyer is the primary user: a Thai micro-business owner/operator.

The Business/Market Gate question is whether DocCraft has a credible paid market and which revenue model fits this product shape, while respecting the Product Gate finding that V1 is not yet a sellable implementation because Phases 4.1/5/6 are incomplete. Repeat use, retention, and willingness-to-pay remain unvalidated until a Public Pilot.

Owner decisions D1-D2 are now authoritative for this targeted remediation. D1 locks the commercial path as no-login/local-first, free Public Pilot first, then a one-time unlock hypothesis at THB 299-599 after the sellable feature set is ready; subscription is not a V1 model. D2 approves minimal anonymous and consented Public Pilot telemetry with no document contents, no customer/company names, no tax IDs, no financial amounts, no sensitive document fields, no login requirement, and no reduced core functionality for users who refuse telemetry.

This synthesis is not a code review, architecture review, implementation plan, or mutation of product/pricing documents.

## 2. Verified Facts

### Locked Product Facts

| Fact | Evidence status | Candidate coverage |
|---|---:|---:|
| V1 is no-login, no-account, no-cloud, local-first, local autosave, single-active-draft, no history. | Verified locked product fact as reported by candidates | 3/3 |
| V1 excludes billing infrastructure, e-sign, accounting, e-Tax, AI, and cloud/account features. | Verified locked product fact as reported by candidates | 3/3 |
| Primary buyer equals primary user: Thai micro-business owner/operator. | Verified locked product fact / consensus from Product Gate as used by candidates | 3/3 |
| V1 is not yet sellable because Phases 4.1/5/6 are incomplete. | Verified locked product fact as reported by candidates | 3/3 |
| No DocCraft Public Pilot data exists for repeat use, retention, paid conversion, or willingness-to-pay. | Verified locked product fact as reported by candidates | 3/3 |
| Core differentiation is Thai tax-domain correctness: VAT conditionality, tax-invoice validity gating, WHT handling, discount allocation, deposit, centralized rounding, A4 print. | Verified locked product fact as reported by candidates | 3/3 |
| Owner decision D1 locks V1 commercial sequence: finish Phase 4.1/5/6 product work, open a free Public Pilot, validate tax-document usage/repeat usage/print-export completion/willingness-to-pay, then test THB 299-599 one-time unlock when sellable. | Owner Decision | Owner |
| Owner decision D2 approves minimal anonymous and consented telemetry for app opened, document created, tax feature used, preview completed, print/export completed, and return/repeat session; telemetry implementation/vendor/schema belongs to Architecture/Risk/Pre-Build. | Owner Decision | Owner |

### External Market And Pricing Evidence Cited By Candidates

All candidate-cited current external evidence was retrieved by the candidates on 2026-09-04 unless otherwise noted.

| Evidence | Source cited by candidates | Business implication | Coverage |
|---|---|---|---:|
| FlowAccount has a free tier and paid tiers around low hundreds of THB/month; candidates cite Standard around THB 165-199/month, Pro around THB 249-299/month, Pro Business around THB 457-549/month depending on annual/list framing. | https://flowaccount.com/pricing, https://flowaccount.com/en/pricing, plus third-party reviews cited by A/B/C | Thai SMEs pay recurring fees for fuller accounting/document workflows; DocCraft documents-only cannot price near a full-suite without stronger recurring value. | 3/3 |
| PEAK has free/freelance entry and paid tiers ranging from a few hundred to higher monthly plans. | https://peakaccount.com and third-party market references cited by B/C | Paid Thai accounting/tax workflows exist, but PEAK is a fuller accounting product, not a no-login document studio. | 2/3 |
| Free or no-signup Thai document generators exist, including EasyQuote and SimpleBalance. | https://quotation-generator-eosin.vercel.app/, https://simplebalance.co.th/free-invoice-generator/ | The visible V1 document-generation category is free-anchored and already competitive. | 2/3 for EasyQuote/SimpleBalance; 3/3 for free-template/status-quo pressure |
| BillKub offers a close no-login/local Thai document tool with free core documents and Pro at THB 299 one-time lifetime, including tax invoice/logo/no watermark/all templates; WHT not available per Candidate C. | https://billkub.com | Strongest cited evidence for one-time purchase model in the exact structural niche; also proves the niche is already occupied. | 1/3 |
| Kitslancer and other Thai freelancer/accounting products show willingness to pay for Thai-tax/payment depth in subscription bundles. | Candidate B cites Kitslancer via krispitech.com; Candidate B also cites Easy Bunchee. | Supports subscription only when recurring workspace/account/history/reporting value exists; less direct for V1. | 1/3 |
| International invoice tools such as Zoho Invoice and Wave keep core invoicing free and monetize adjacent layers. | Candidate C cites Zoho and Wave official pricing/pages. | Reinforces free core invoice anchor and monetization pressure toward branding/automation/account layers. | 1/3 |
| Thai tax compliance pain is real: VAT threshold, VAT tax-invoice requirements, WHT filings, penalties, and e-Tax direction are cited. | Candidate A cites FlowAccount/bmu/etaxgo/phuketexpatguide; Candidate B cites market/e-Tax sources; Candidate C cites PEAK/FlowAccount e-Tax pricing but labels dedicated RD timeline unverified. | Tax correctness is a credible pain and differentiator, but DocCraft-specific willingness-to-pay is unproven. | 3/3 for tax pain; 2/3 for regulatory/e-Tax tailwind |

## 3. Consensus / Majority / Dissent

### Consensus: 3/3

| Topic | Synthesis |
|---|---|
| Credible pain exists | 3/3 candidates agree Thai micro-business document creation with VAT/WHT/tax-invoice/A4 correctness is a real problem. |
| V1 is not sellable today | 3/3 agree Product Gate remediation remains required before any sellable V1 or public paid claim. |
| Free/status-quo pressure is severe | 3/3 identify free alternatives, templates, or free-entry accounting/document tools as the main competitive anchor. |
| Willingness-to-pay is unvalidated for DocCraft | 3/3 agree no DocCraft-specific Public Pilot evidence exists for repeat use, retention, conversion, or exact price. |
| Payer = user | 3/3 accept the buyer/user as Thai micro-business owner/operator for V1. |
| Tax-depth is the strongest differentiator | 3/3 point to Thai tax correctness depth rather than generic document generation as the credible wedge. |
| V1 subscription is weak or impossible as-built | 3/3 reject selling locked V1 as a straightforward subscription because V1 has no account, no billing, no history, and weak recurring value. |

### Majority: 2/3

| Topic | Majority | Dissent |
|---|---|---|
| Best near-term monetization model | 2/3 candidates (A/C) recommend one-time purchase or one-time-first hybrid for the no-login/local-first V1 shape. | 1/3 candidate (B) recommends no V1 paid path and subscription only for Phase 7+. |
| Direct paid-market credibility inside the no-login document-studio niche | 2/3 candidates (A/C) find a real but conditional/narrow paid market for a one-time paid capability, especially tax invoice / WHT / clean output. | 1/3 candidate (B) says the credible paid market is long-term, but locked V1 has no direct defensible paid path. |
| Subscription timing | 2/3 candidates (B/C) place meaningful subscription or recurring monetization after Phase 7+ account/history/cloud/reporting features. | 1/3 candidate (A) leaves delayed subscription/usage possible after Pilot Validation but emphasizes one-time V1 unlock. |
| One-time price anchor | 2/3 candidates (A/C) suggest low one-time THB ranges; C has direct BillKub THB 299 anchor and A suggests THB 199-499. | 1/3 candidate (B) argues one-time/usage is not evidenced in the Thai B2B-micro segment compared with subscription norms. |

### Dissent / Divergence

| Topic | Candidate positions | Synthesis handling |
|---|---|---|
| Whether V1 should charge at all | A: free core plus small one-time unlock. B: do not price or sell V1; use it as free acquisition/validation. C: one-time purchase THB 299-599 could fit after remediation, but collection path is unbuilt. | This is a real three-way distinction. Synthesis recommends not launching paid before Product remediation and Public Pilot, but adopts one-time/hybrid as the best model to test for the no-login V1 shape. |
| Subscription vs one-time evidence | A: subscription weak because full accounting starts near THB 165-249/month. B: subscription is evidenced in Thai tools, but only Phase 7+. C: BillKub proves one-time in the closest structural niche. | Evidence is not equal. BillKub is the closest cited structural competitor for V1, so one-time gets more weight for V1. FlowAccount/PEAK/Kitslancer are stronger evidence for Phase 7+ recurring products. |
| Market size confidence | B cites macro SME/e-invoicing market numbers and stronger category-level growth. A/C focus more on competitor price and direct substitution. | Macro evidence supports category attractiveness but does not validate DocCraft conversion. It is carried as context, not decisive proof. |

## 4. Remaining Validation Items / Reclassified Blockers

Owner decisions D1-D2 resolve the two previously-open Business/Market owner-decision questions: commercial scope and telemetry mode. The remaining evidence gaps are now validation objectives for the approved free Public Pilot, not blockers to this Business/Market Gate.

| Item | Why it matters | Gate classification |
|---|---|---|
| Public Pilot repeat-use rate for no-login, single-active-draft V1. | Validates whether the no-login/local-first workflow creates enough repeat value to support a paid unlock later. | Pilot validation objective; not a Business/Market blocker after D1-D2 |
| Public Pilot willingness-to-pay and paid conversion for tax-correct/no-watermark/clean-output features. | Tests the locked THB 299-599 one-time unlock hypothesis. | Pilot validation objective; not a Business/Market blocker after D1-D2 |
| Segment split: VAT-registered micro-sellers vs non-VAT freelancers/service shops/tradespeople. | Tax-depth monetization likely depends on a narrower VAT/WHT/tax-invoice segment. | Pilot validation objective |
| Perceived value of WHT eligible-line basis, discount allocation, deposit, and tax-invoice gating. | Determines whether technical tax correctness is visible enough to drive payment. | Pilot validation objective |
| Real competitor conversion/sales data, especially BillKub Pro and EasyQuote Premium. | Public pricing proves offers exist, not conversion volume. | Market monitoring; not a blocking gate item |
| Checkout, unlock, and entitlement feasibility under no-login/local-first constraints. | One-time unlock needs a payment and entitlement mechanism that does not violate the locked product boundary. | Architecture / Pre-Build |
| Telemetry implementation, vendor, and schema. | D2 approves telemetry mode, but exact implementation must preserve privacy limits and refusal semantics. | Architecture / Risk / Pre-Build |
| Phases 4.1/5/6 incomplete. | Current implementation is not sellable until original roadmap work closes. | Product / Launch |
| Data-loss trust risk from local storage. | Paid users may not accept local-only persistence as reliable business record storage without clear handling. | Product / Risk / Launch |
| Browser print fidelity across Chrome/Edge/Safari/Firefox and mobile. | The A4-ready promise depends on reliable print/export completion. | Product / Launch |
| Legal positioning for "app-validated" tax correctness vs legal/accounting certification. | Incorrect user expectations create support and trust risk. | Risk / Launch |

## 5. Synthesizer Recommendation

DocCraft has a credible paid market and now has a locked Business/Market path. The recommended Business/Market position is:

1. Keep the no-login/local-first product shape.
2. Close necessary product work in Phase 4.1 / 5 / 6 per the original roadmap.
3. Open a free Public Pilot before paid launch.
4. Use the pilot to validate tax-document usage, repeat usage, print/export completion, and willingness/reason to pay.
5. When the sellable feature set is ready, test a one-time unlock at THB 299-599.
6. Do not position as "pay to create generic documents"; free alternatives compete too easily.
7. Use the core paid value proposition: Thai business/tax documents that are more correct, faster, A4-print-ready, without adopting a full accounting system.
8. Do not treat subscription as a V1 model. Reconsider subscription only after Phase 7+ when account/cloud/history/reporting actually exist.

This recommendation weighs Candidate C's BillKub evidence heavily because it is the closest structural match to DocCraft's no-login/local-first document-studio wedge. FlowAccount/PEAK/Kitslancer evidence is also credible, but it is more applicable to a future recurring product with account, history, cloud, reporting, and accounting-adjacent workflow.

## 6. Why This Recommendation

### Evidence Weighting

| Evidence class | Weight | Reason |
|---|---:|---|
| Closest structural competitor: BillKub THB 299 one-time Pro | High | It directly matches no-login/local storage/free core/paid tax invoice and clean output better than full accounting SaaS comparisons. |
| Thai full accounting SaaS pricing: FlowAccount/PEAK/Easy Bunchee | Medium-high | Proves willingness to pay for Thai business/tax workflows, but bundled feature depth is much broader than DocCraft V1. |
| Free document generators/templates | High | Defines the user's price anchor and substitution pressure. |
| Macro SME/e-invoicing market size | Medium | Useful context, but too broad to prove DocCraft's conversion. |
| Product locked facts | High | V1 boundary controls what can be sold without violating scope. |
| Candidate opinions without direct evidence | Low | Used only as hypotheses. |

### Business Logic

DocCraft's V1 value is transactional: create the current document correctly and quickly. It does not yet provide durable recurring workflow value because there is no account, history, cloud backup, document catalog, reporting, or billing. A subscription asks the user to pay for an ongoing relationship that V1 does not support.

A one-time paid capability fits the constraints better: the buyer can pay once for a local tool or paid output capability without turning DocCraft into an accounting suite. It also fits the closest cited direct competitor, BillKub, which Candidate C reports at THB 299 one-time lifetime.

However, Business/Market PASS does not mean launch approval or build approval. Product remediation is incomplete, checkout/unlock architecture is unresolved, and Public Pilot evidence is still needed before charging users. Those are downstream gate responsibilities, not reasons to keep the Business/Market Gate in REMEDIATE after D1-D2.

## 7. Rejected Alternatives

| Alternative | Rejected because |
|---|---|
| Pure V1 subscription | 3/3 candidates identify weak fit for locked V1. V1 has no account, billing, history, cloud, or durable retention loop; full accounting competitors start at low monthly prices and offer much more. |
| Usage-based pricing in V1 | Local-first/no-backend/no-account makes usage metering and enforcement awkward. It also adds friction to a category where free alternatives are abundant. |
| Immediate paid launch | Product Gate says V1 is not sellable; repeat use and willingness-to-pay are unvalidated. Charging before remediation and pilot would confuse Product readiness with Market credibility. |
| Full accounting/e-Tax expansion as V1 monetization | Violates locked V1 boundary. It belongs to downstream Product/Architecture/Launch gates. |
| Free forever with no paid hypothesis | It may be strategically useful for acquisition, but it does not answer whether there is a paid market or create a revenue path. Pilot should test willingness-to-pay instead of assuming zero. |
| Premium subscription only for branding/no-watermark | Branding/no-watermark is not enough on its own against free tools and low-cost accounting suites. It may support a one-time unlock but is not a durable recurring reason. |

## 8. Gate Verdict + Blockers

Verdict: PASS

Business/Market Gate decision: DocCraft has a credible paid-market hypothesis and the commercial path is now locked by Owner decision D1. Minimal anonymous and consented telemetry for the free Public Pilot is now approved by D2. The previously-open Business/Market questions are resolved: do not move V1 to account/cloud/subscription, do not add Phase 7 monetization scope, run a free Public Pilot first, and test one-time unlock at THB 299-599 only after the sellable feature set is ready.

This PASS is limited to the Business/Market Gate. It does not approve launch, paid checkout, telemetry implementation, pricing-document mutation, or Phase 7 build scope.

### Business/Market Blockers

| Blocker | Status |
|---|---|
| Commercial scope undecided. | Resolved by D1. |
| Telemetry mode undecided. | Resolved by D2. |
| Repeat-use, willingness-to-pay, segment, and SKU evidence missing. | Reclassified as approved Public Pilot validation objectives under D1-D2, not current Business/Market blockers. |

### Carry-Forward Items That Should Not Fail This Gate Alone

| Item | Downstream gate |
|---|---|
| Phases 4.1/5/6 incomplete. | Product / Launch |
| Checkout, unlock, and entitlement mechanism under no-login constraints. | Architecture / Pre-Build |
| Telemetry implementation, vendor, and schema. | Architecture / Risk / Pre-Build |
| Local-storage data-loss handling and backup/export UX. | Product / Risk / Launch |
| Browser print fidelity across devices. | Product / Launch |
| Legal/accounting disclaimer and support process for tax correctness. | Risk / Launch |

## 9. Confidence

Confidence: 72/100

Rationale: Confidence is high that the pain exists and that Thai micro-businesses pay for Thai tax/document/accounting workflows in broader products. Confidence is moderate that a one-time paid niche exists because Candidate C cites a close THB 299 one-time competitor. Confidence increases from the previous 61/100 because D1-D2 now lock the commercial path and telemetry mode, removing the two owner-decision blockers.

The verdict is therefore PASS for Business/Market, not REMEDIATE and not BLOCK. The market hypothesis is credible and the commercial path is locked enough to continue. Revenue remains a hypothesis pending Public Pilot, and all implementation/launch blockers stay assigned to their downstream gates.
