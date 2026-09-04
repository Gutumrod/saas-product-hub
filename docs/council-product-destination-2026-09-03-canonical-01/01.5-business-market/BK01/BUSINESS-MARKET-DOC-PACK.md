# BK01 Business/Market Document Pack

Run: WSTERA Product Destination Council - Canonical Run 01  
Gate: Business/Market Gate  
Product: BK01 Booking by WSTERA  
Verdict: PASS  
Confidence: 74/100  
Date: 2026-09-04  
Scope: Targeted document-level remediation only. Not launch/build approval.  

## BUSINESS-MODEL

BK01 should use a merchant-paid recurring subscription model for Thailand-first single-location appointment operations.

Customer paying BK01: shop owner/operator or manager.

End customer: books through public booking/LINE flow and should not pay BK01.

Recommended V1 model:

| Plan | Role in model | Current pilot/reference price |
|---|---|---|
| Trial | Time-limited proof of value | ฿0 / 14 days |
| Basic | Core appointment operations with manual slip handling | ฿490/mo, 5 staff, manual slip |
| Pro | Higher-load operations with auto-slip verification | ฿990/mo, 10 staff, auto-slip required before public sale |

The subscription model fits because the paid value is recurring: availability integrity, reminders, deposit status, staff coordination, history, and reduced admin friction.

## MONETIZATION

Primary monetization:

- Monthly subscription paid by merchant.
- Basic monetizes core operations and manual deposit workflow.
- Pro monetizes auto-slip automation and higher staff/operational load only after downstream verification.

Monetization guardrails:

- Do not sell Pro publicly until OD-001 downstream verification is complete: provider, real unit economics, allowance/overage model, reliability, and safe failure path.
- Auto-slip failure must fall back safely to manual review and must never falsely confirm payment.
- Trial ฿0/14 days, Basic ฿490/mo, and Pro ฿990/mo are pilot/reference prices only, not final public prices.
- Final public pricing must wait for pilot willingness-to-pay evidence plus real variable-cost/unit-economics evidence.
- For V1 paid production, merchant bears its own LINE OA/message costs. WSTERA integrates with merchant-owned LINE OA and documents/setup-supports the integration.
- Do not bundle WSTERA-managed LINE message allowance into V1 subscription. Reconsider only post-V1 with real demand/economics evidence.
- Avoid per-booking quota walls for paid plans; competitors already offer unlimited or high caps.
- Avoid marketplace commission or payment MDR in V1; BK01 is not a demand marketplace or payment processor.

## COMPETITIVE-LANDSCAPE

Observed Thai price envelope from candidate evidence fetched 2026-09-04:

| Competitor | Cited price / model | Relevance |
|---|---:|---|
| OneRun | ฿299/mo | Low-cost direct Thai booking |
| Onque | ฿299/mo, includes SlipOK auto-slip per candidate evidence | Strong undercut risk for BK01 Pro |
| MeQueue | Pro ฿399/mo, 10 staff | Undercuts BK01 Basic on price/staff |
| JongQ | ฿499/mo | Near Basic reference price |
| EikQueue | Pro ฿590/mo, unlimited staff, deposit + slip upload | Strong direct competitor |
| Suriya | starts ฿499/mo | Near Basic reference price |
| FoxConnect | ฿690+ | Mid-market Thai competitor |
| Bookio | Growth ฿990/mo | Matches BK01 Pro reference price |
| QueueBooking | ฿990/mo | Matches BK01 Pro reference price |
| SeeU | ฿990-1,990/mo | Higher Thai salon SaaS anchor |
| Bangkok Boost | ฿990-1,590/mo | Higher Thai LINE booking/deposit anchor |
| ZERVA | free | Free alternative pressure |

Global anchors:

- Fresha around THB 525/mo.
- Booksy $29.99 plus staff fees.
- Square and some generic tools include free appointment options.

Competitive synthesis:

The market is active and paid, but crowded. BK01 cannot win by being "a booking system." Differentiation should remain an evidence-backed positioning hypothesis to validate: Thai LINE-first appointment operations focused on scheduling integrity, deposit-state clarity, and low setup burden.

Evidence representation correction:

- One candidate was more confident about BK01 differentiation.
- Two candidates considered differentiation execution-thin or unproven.
- This is 1/3 confidence, not a majority.

## POSITIONING

Recommended positioning hypothesis to validate:

BK01 is appointment operations for Thai LINE-first shops that need fewer double bookings, clearer deposit state, and less manual follow-up.

Do not position BK01 as a generic booking page. Generic booking is commoditized and available free or cheap.

Positioning pillars:

- Schedule integrity: prevent avoidable double-booking and staff-slot confusion.
- Deposit workflow: PromptPay/slip state clarity; manual in Basic; automatic in Pro only when ready.
- LINE-native operation: works with the Thai channel merchants and customers already use.
- Low setup burden: fast enough for small shops without IT staff.
- Merchant-owned relationship: the shop keeps the customer relationship and export path.

## CUSTOMER-VALUE-PROPOSITION

Pain -> Capability -> Outcome -> Business Value -> Reason to Pay:

| Chain | BK01 synthesis |
|---|---|
| Pain | LINE/manual/calendar workflow causes repeated availability questions, double bookings, no-shows, manual confirmation, and manual deposit checking. |
| Capability | Collision-safe scheduling, PromptPay deposit/slip workflow, reminders, merchant LINE integration, staff scope, history/export. |
| Outcome | Fewer schedule mistakes, less admin time, clearer deposit status, fewer forgotten appointments. |
| Business value | Recovered revenue from no-shows, protected slots, saved staff time, better customer experience. |
| Reason to pay | A monthly fee is rational if one prevented no-show or meaningful admin-time saving covers the subscription. This must be proven in pilot. |

## PRICING-HYPOTHESES

Current pilot/reference prices:

- Trial: ฿0/14 days.
- Basic: ฿490/mo.
- Pro: ฿990/mo.

Pricing policy:

- These prices are not final public prices.
- OD-002 closes the current pricing-policy question for this gate.
- Final public pricing will be decided after pilot willingness-to-pay evidence plus real variable-cost/unit-economics evidence.
- Absence of a final public price must not remain an unresolved Owner-decision blocker in this Business/Market Gate.

Pricing hypotheses to validate later:

- Basic at ฿490 converts if the shop sees immediate reduction in manual scheduling and deposit friction.
- Pro at ฿990 converts only if auto-slip saves enough manual checking and does not create unexpected overage/support friction.
- The 5-staff Basic and 10-staff Pro caps may be competitively weak versus unlimited-staff Thai plans.
- Total cost of ownership must include merchant-borne LINE OA/message costs.
- Final pricing needs pilot WTP, auto-slip margin, and competitor re-anchoring.

Do not rewrite locked provisional prices inside product/pricing source documents from this gate.

## MARKET-ASSUMPTIONS

| Assumption | Status |
|---|---|
| Thai salons/barbers/beauty/nail shops will pay recurring monthly SaaS fees | Supported by competitor pricing, not BK01-proven |
| LINE-first workflow is the right channel | Supported by Thai LINE reach and competitor behavior |
| Deposit-required services are common enough to drive payment | Plausible but needs pilot evidence |
| One prevented no-show can justify Basic | Plausible arithmetic, unmeasured in BK01 |
| Auto-slip can justify Pro | Plausible, but Pro sale requires downstream OD-001 verification |
| Merchant-borne LINE cost is acceptable | Market-normal, adoption risk remains; OD-003 sets V1 model |
| BK01 can win on reliability/setup burden | Unproven positioning hypothesis requiring pilot/launch validation |

## OWNER DECISIONS APPLIED

| Decision | Applied state |
|---|---|
| OD-001 Auto-slip | Preserve auto-slip as required for Pro. Do not publicly sell Pro until downstream provider/economics/allowance/reliability/failure-path verification. Safe fallback to manual review; never falsely confirm payment. |
| OD-002 Pricing | Trial/Basic/Pro prices remain pilot/reference only. Final public pricing after pilot WTP and real unit economics. No remaining Owner-decision blocker in this gate. |
| OD-003 LINE cost model | V1 merchants bear their own LINE OA/message costs. WSTERA integrates with merchant-owned LINE OA and supports setup. No bundled WSTERA managed allowance in V1. |
| OD-004 Cancel/reschedule windows | Merchant configuration mandatory during onboarding before publish/go-live. No universal default and no silent nullable fail-closed configuration. |
| OD-006 Blacklist | Defer customer-facing blacklist post-V1. Remove V1-facing blacklist claims/copy. Dormant internal fields must not create active V1 behavior without later authorization and verification. |

## GATE VERDICT

**PASS**

BK01 has a credible recurring paid market and a directionally coherent merchant-paid subscription model for the frozen Business/Market Gate.

This PASS is document-level only. It does not approve launch, public sale, Pro sale, build, deploy, Product #4 dispatch, or later gates.

No genuine Business/Market blockers remain after Owner decisions and classification correction.

## DOWNSTREAM BLOCKER CLASSIFICATION

| Issue | Classification | Gate treatment |
|---|---|---|
| No BK01 WTP / conversion / retention / no-show evidence | Pilot / Launch / Operations validation | Preserved as required validation; does not block this pre-build market-direction PASS. |
| Auto-slip provider/economics/reliability unresolved | Architecture / Pre-Build / Risk / Launch | Blocks public Pro sale; do not select provider merely to close this gate. |
| LINE cost model | Business policy resolved by OD-003; Launch/Ops disclosure | Merchant-owned LINE OA/message costs in V1; measure adoption and support burden downstream. |
| Final public prices | Owner after Pilot / Unit Economics | OD-002 closes this gate question; final price decision remains downstream. |
| Competitive positioning unproven | Pilot / Launch / Operations validation | Validate Thai LINE-first appointment-operations positioning. |
| CAC/onboarding/support cost absent | Launch / Operations validation | Measure payback and support load before scale. |
| Effective Product Gate | Product provenance | Current canonical effective Product Gate = PASS. Historical REMEDIATE is provenance only. |
| DB-backed gates BLOCKED_ENVIRONMENT | Architecture / Pre-Build / Risk | Carry forward; not released by this document-level PASS. |
| V1 not sellable yet | Launch / Product / Risk | Carry forward; this gate does not authorize public launch. |
| Cancel/reschedule enforcement | Product / Risk / Launch | OD-004 sets business rule; exact UX/enforcement downstream. |
| Blacklist disposition | Product / Launch content QA | OD-006 defers V1-facing capability; remove V1-facing claims/copy downstream. |
