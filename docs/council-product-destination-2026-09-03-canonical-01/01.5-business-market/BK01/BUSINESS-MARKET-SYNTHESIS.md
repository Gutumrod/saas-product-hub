# BK01 Business/Market Gate Synthesis

Run: WSTERA Product Destination Council - Canonical Run 01  
Gate: Business/Market Gate - BK01 Booking by WSTERA  
Date: 2026-09-04  
Role: Independent synthesizer and document author  
Remediation: Targeted Owner-decision and classification remediation, OD-001/002/003/004/006  

## 1. Problem Understood

BK01 must be assessed as a Thailand-first recurring subscription SaaS for single-location hair, barber, beauty, and nail shops. The frozen Business/Market Gate question is:

Does BK01 have a credible recurring paid market, and is the locked provisional Trial / Basic / Pro revenue model directionally correct for that market?

This gate does not approve launch, does not approve build, does not open later gates, and does not require post-build product-market-fit evidence before judging pre-build market direction. Pilot willingness-to-pay, conversion, retention, measured no-show reduction, recovered revenue, real notification consumption, actual support load, and measured CAC/payback remain mandatory downstream validation requirements, but they are not Business/Market blockers unless the frozen gate contract requires those results before PASS.

## 2. Verified Facts

- Payer: shop owner/operator or manager, not the end customer.
- First segment: Thailand-first single-location hair/barber/beauty/nail shops, commonly 1-10 providers, LINE-centric, often running appointments through LINE/manual calendars.
- Thai booking SaaS category already exists and is monetized. Verified price envelope cited by candidates includes OneRun ฿299, Onque ฿299, MeQueue Pro ฿399, JongQ ฿499, EikQueue Pro ฿590, Suriya ฿499, FoxConnect ฿690+, Bookio Growth ฿990, QueueBooking ฿990, SeeU ฿990-1,990, Bangkok Boost ฿990-1,590, plus ZERVA free.
- Global alternatives also exist in or around the relevant price band: Fresha around THB 525/mo, Booksy $29.99 plus staff fees, Square free, SimplyBook, Setmore.
- LINE OA Thailand costs are material: Free 300 broadcast messages/mo, Basic ฿1,280/15k messages, Pro ฿1,780/35k messages. Reply-API messages are reported free; proactive push/broadcast consumes quota.
- PromptPay is mature Thai payment infrastructure. Merchant bank-account receiving can be free in some bank contexts; commercial merchant acceptance/payment-gateway fees can be 1-1.65%.
- SlipOK-class auto-slip verification has real unit costs: roughly ฿0.30-0.70 per verification overage, with published packages such as ฿600/mo for 1,000 slips.
- BK01 locked pilot/reference prices remain: Trial ฿0/14d, Basic ฿490/mo for 5 staff with manual slip, Pro ฿990/mo for 10 staff with auto-slip required before Pro sale. They are not final public prices.
- Canonical effective Product Gate status is PASS according to `01-product/BK01/EFFECTIVE-PRODUCT-GATE-STATUS.md`. Historical pre-meta-audit Product Gate REMEDIATE is provenance only and must not be treated as current.
- No BK01 pilot willingness-to-pay, retention, no-show reduction, notification reliability, deposit reliability, actual support-load, or measured CAC/payback evidence exists yet. These are downstream Pilot / Launch / Operations validation requirements.
- Market-size indicators are favorable but not proof of BK01 demand: roughly 24,600 hair salons in Thailand in one cited dataset, only about 15% with websites, and LINE has 50M+ Thai users/accounts.

## 3. Owner Decisions Applied

| Decision | Business/Market effect |
|---|---|
| OD-001 Auto-slip | Auto-slip remains required for Pro. Pro must not be publicly sold until provider, real unit economics, allowance/overage model, reliability, and failure path are verified. Provider selection and technical verification are downstream; do not choose a provider merely to close this gate. Auto-slip failure must fall back safely to manual review and must never falsely confirm payment. |
| OD-002 Pricing | Trial ฿0/14 days, Basic ฿490/month, Pro ฿990/month remain pilot/reference prices only, not final public prices. Final pricing will be decided after pilot WTP plus real variable-cost/unit-economics evidence. Lack of final public prices is therefore closed for this gate and is no longer an unresolved Owner-decision blocker. |
| OD-003 LINE cost model | For V1 paid production, each merchant bears its own LINE OA/message costs. WSTERA integrates with merchant-owned LINE OA and documents/supports setup. WSTERA does not bundle a managed LINE message allowance into V1 subscription. A WSTERA-managed allowance/add-on may be reconsidered post-V1 with demand/economics evidence. |
| OD-004 Cancel/reschedule windows | Merchant configuration is mandatory during onboarding before publish/go-live. No universal product default. No silent nullable fail-closed configuration that makes the advertised customer self-service flow unusable. Exact UX/enforcement is downstream. |
| OD-006 Blacklist | Customer-facing/product blacklist capability is deferred post-V1. Remove V1-facing blacklist claims/copy. Dormant schema/internal fields need not be removed solely for this decision, but must not create active V1 booking behavior without downstream authorization and verification. |

## 4. Consensus / Majority / Dissent

| Question | Ratio | Synthesis |
|---|---:|---|
| Credible recurring paid market exists in principle | 3/3 | All candidates agree the Thai appointment-operations category is real and merchants already pay monthly fees in the relevant band. |
| BK01-specific paid model is not proven yet | 3/3 | All candidates require pilot WTP/retention/outcome evidence before final commercial confidence and public pricing. |
| Trial / Basic / Pro shape is directionally coherent | 3/3 | Manual slip in Basic and auto-slip in Pro maps to operational workload and variable-cost automation. |
| Current pilot/reference prices are final-ready | 0/3 | No candidate supports treating ฿490/฿990 as final public pricing now. OD-002 resolves this as a downstream pricing-validation requirement, not a gate blocker. |
| Auto-slip economics are material for Pro | 3/3 | Provider, allowance, overage, failure handling, and margin must be verified before Pro public sale. OD-001 preserves this downstream condition. |
| LINE OA cost model is material to adoption/TCO | 3/3 | Merchant-borne LINE cost is market-normal but must be disclosed/setup-supported. OD-003 resolves V1 packaging: merchant-owned LINE OA, no WSTERA bundled allowance. |
| Competitive pressure is severe | 3/3 | All candidates cite cheaper/free Thai alternatives; Candidate C is strongest that Onque/MeQueue/EikQueue materially undercut BK01. |
| Differentiation confidence | 1/3 more confident, 2/3 execution-thin/unproven | One candidate was more positive on the combined loop; two candidates said differentiation is execution-thin and must be proven. This is not a majority. |
| Expert gate votes | N/A | The frozen brief explicitly told experts not to issue gate verdicts. Codex issues the gate verdict and must not convert absence of expert verdicts into a 0/3 expert vote. |

## 5. Missing Evidence Preserved For Later Validation

These findings remain important and must not be erased, but under the frozen gate contract they are downstream validation requirements rather than current Business/Market blockers:

- Pilot willingness-to-pay: conversion from Trial to Basic/Pro at realistic reference prices.
- Retention/churn: whether shops keep paying after initial novelty.
- Real no-show reduction and recovered revenue for BK01 merchants.
- Notification delivery behavior and actual LINE quota consumption by booking confirmations/reminders.
- Deposit/slip reliability: manual verification lag, auto-slip success/failure rates, and support burden.
- Pro auto-slip provider, unit cost, included allowance, overage/top-up, fallback, and failure policy verification before public Pro sale.
- Final public prices after pilot willingness-to-pay and real variable-cost/unit-economics evidence.
- Acquisition economics: CAC, sales motion, onboarding workload, support load, and payback for ฿490-990 pilot/reference ARPU.
- Competitive proof: whether BK01 can outperform cheaper competitors on reliability, setup burden, scheduling integrity, and deposit-state clarity.

## 6. Synthesizer Recommendation

BK01 should **PASS** the targeted Business/Market Gate after OD-001/002/003/004/006 and corrected blocker classification.

The market is credible because Thai merchants already pay recurring monthly fees for booking, LINE, reminders, deposit, and operations workflows in roughly the same purchasing context. The payer is clear, the pain is recurring, and the Trial / Basic / Pro ladder is directionally coherent for a merchant-paid subscription.

This PASS is document-level only. It is not approval to launch, sell Pro, build, deploy, open Product #4, open Architecture/Risk/Pre-Build/Launch gates, or modify implementation. It preserves explicit downstream validation requirements.

## 7. Why This Recommendation

The prior REMEDIATE verdict over-classified post-build proof as pre-build market-gate blockers. For this frozen gate, missing BK01-specific WTP, conversion, retention, no-show reduction, recovered revenue, notification consumption, support load, and CAC/payback evidence should cap confidence and drive pilot/launch/operations gates, but they do not disprove that BK01 has a credible recurring paid market.

Owner decisions also remove the open policy blockers:

- OD-001 makes auto-slip a required Pro condition while pushing provider selection and reliability/economics verification to downstream gates.
- OD-002 keeps ฿490/฿990 as pilot/reference prices and explicitly says final public pricing is downstream evidence-based, so final price absence is not a remaining gate blocker.
- OD-003 resolves V1 LINE packaging as merchant-owned LINE OA/message cost, not bundled WSTERA allowance.
- OD-004 resolves cancel/reschedule policy at market/offer level: mandatory merchant onboarding configuration before publish/go-live.
- OD-006 removes V1-facing blacklist claims by deferring blacklist post-V1.

The remaining uncertainties are real, but they are validation conditions for Pilot / Launch / Operations and for Pro public sale, not blockers to the narrow Business/Market direction question.

## 8. Rejected Alternatives + Why

| Alternative | Decision | Why rejected |
|---|---|---|
| Keep REMEDIATE | Rejected after remediation | No unresolved blocker remains under the frozen Business/Market contract once Owner policy decisions are applied and post-build evidence is reclassified downstream. |
| BLOCK | Rejected | There is enough current evidence that Thai merchants pay recurring fees for this category. The market is not imaginary. |
| Treat ฿490/฿990 as final public prices | Rejected | OD-002 says they remain pilot/reference prices until pilot WTP and unit-economics evidence. |
| One-time setup fee only | Rejected | The core value is recurring operational reliability and automation. One-time fees do not match ongoing notifications, support, slip verification, scheduling, and merchant operations. |
| Transaction/commission model | Rejected for V1 | BK01 is not positioned as a payment processor or demand marketplace. PromptPay/deposit flows should avoid unnecessary MDR complexity at V1. |
| Per-booking quota monetization | Rejected | Competitors offer unlimited or high booking caps. Booking-count walls weaken adoption and conflict with the locked paid posture. |
| WSTERA-managed LINE allowance in V1 | Rejected by OD-003 | V1 uses merchant-owned LINE OA/message costs. Managed allowance/add-on is post-V1 only with real demand and economics evidence. |
| Sell Pro before auto-slip is verified | Rejected by OD-001 | Pro must not be publicly sold until auto-slip provider, economics, allowance/overage, reliability, and safe failure path are verified. |

## 9. Gate Verdict + Blockers

**Verdict: PASS**

**Confidence: 74/100**

No genuine Business/Market blockers remain under the frozen gate contract after targeted remediation.

### Downstream Carry-Forward Requirements

| Requirement | Correct owner/gate | Treatment |
|---|---|---|
| Pilot WTP/conversion at Trial / Basic / Pro reference prices | Pilot / Launch / Operations | Must validate before final public pricing and scale decisions. |
| Retention/churn, no-show reduction, recovered revenue | Pilot / Operations | Must validate before outcome claims and long-term commercial confidence. |
| Real notification consumption and LINE setup burden | Launch / Operations | Merchant-owned LINE OA cost must be disclosed and measured. |
| Auto-slip provider/economics/reliability/failure path | Architecture / Pre-Build / Risk / Launch | Blocks public Pro sale, not this market-direction PASS. |
| Final public prices | Owner after Pilot / Unit Economics | OD-002 closes current policy question; finalization is downstream. |
| Cancel/reschedule enforcement UX | Product / Risk / Launch | OD-004 sets mandatory merchant config before publish/go-live; implementation remains downstream. |
| Blacklist V1-facing claims/copy removal | Product / Launch content QA | OD-006 defers blacklist post-V1; dormant internals must not create active V1 behavior. |
| Competitive differentiation proof | Pilot / Launch / Operations | Validate positioning hypothesis: Thai LINE-first appointment operations focused on scheduling integrity, deposit-state clarity, and low setup burden. |
| CAC/onboarding/support economics | Launch / Operations | Measure payback and support load before scale. |
| Effective Product Gate | Product provenance | Current canonical status is PASS; historical REMEDIATE is provenance only. |
| DB-backed gates / V1 sellability | Architecture / Risk / Pre-Build / Launch | Not released by this Business/Market PASS. |

## 10. Business/Market Document Pack / Exact Document Changes

Do not modify product or pricing source documents outside this BK01 run directory. The Business/Market pack is authored as `BUSINESS-MARKET-DOC-PACK.md` in this directory and should be treated as Business/Market gate output, not as a replacement for locked product/pricing documents.

Required pack sections:

- `BUSINESS-MODEL`: Merchant-paid recurring subscription; Trial / Basic / Pro ladder; no customer-paid booking fee; no marketplace commission in V1.
- `MONETIZATION`: Basic subscription for manual operations; Pro subscription only after auto-slip provider/economics/reliability/failure path are verified; optional future add-ons require separate cost evidence.
- `COMPETITIVE-LANDSCAPE`: Track Thai direct competitors in the ฿299-990 band and free alternatives; specifically monitor Onque, MeQueue, EikQueue, Bookio, Suriya, QueueBooking, SeeU, ZERVA.
- `POSITIONING`: Evidence-backed hypothesis to validate: Thai LINE-first appointment operations focused on scheduling integrity, deposit-state clarity, and low setup burden, not merely "another booking system."
- `CUSTOMER-VALUE-PROPOSITION`: Fewer no-shows, fewer double-bookings, less manual admin, clearer deposit status, customer booking without app install.
- `PRICING-HYPOTHESES`: ฿490/฿990 remain pilot/reference prices, not final public prices; validate against conversion, margin, and competitor pressure.
- `MARKET-ASSUMPTIONS`: Thai shops will pay recurring subscription if one prevented no-show or reduced admin time covers monthly fee; must be validated downstream.
- `GATE VERDICT`: PASS, document-level only.
- `DOWNSTREAM BLOCKER CLASSIFICATION`: Product/DB/environment/readiness/pilot evidence issues carried forward, not used as Business/Market fail reasons.

## 11. Thai OWNER-BRIEF

See `01.5-BUSINESS-OWNER-BRIEF.md` in this BK01 run directory. Hermes will render HTML deterministically after this remediation.
