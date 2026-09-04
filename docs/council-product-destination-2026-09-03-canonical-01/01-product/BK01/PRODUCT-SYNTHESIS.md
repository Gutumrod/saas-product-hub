# BK01 Booking by WSTERA — Product Gate Synthesis

Procedure: `llm-council-gate` v0.3.2  
Gate: Product Gate only  
Verdict: **REMEDIATE**

## 1. Problem Understood

BK01 must answer what Booking by WSTERA is, who it first serves, and where V1 ends. The three completed expert candidates converge that BK01 is a Thailand-first, single-location appointment-operations SaaS for small hair, barber, beauty, and nail businesses with about 1-10 providers. It is an operations product, not a generic booking widget, ticket module, marketplace, clinic system, POS, ERP, or CRM suite.

The product promise is the combined loop of collision-safe staff scheduling, PromptPay deposit handling, merchant-owned LINE operations, and low-burden onboarding. V1 is decidable as a target contract, but current implementation evidence is not yet sellable V1 because DB-backed gates, live provider behavior, pilot evidence, and several owner decisions remain unresolved.

## 2. Verified Facts

- BK01 product identity is a Thailand-first single-location appointment-operations SaaS for hair/barber/beauty/nail shops, about 1-10 providers. Agreement: 3/3 among completed experts.
- BK01 is an operations product, not merely a booking tool. Agreement: 3/3 among completed experts.
- The first deliberate ICP is Thai LINE-centric small service businesses with deposit-required services and no required customer-installed app. Agreement: 3/3 among completed experts.
- The core loop is owner setup, customer booking URL, collision-safe booking/hold or no-deposit confirm, PromptPay deposit/slip submission, merchant or Pro verification, confirmation, LINE confirmation/reminder, completion/no-show, history/export. Agreement: 3/3 among completed experts.
- V1 includes required cancel/reschedule, reminders, explicit staff identity and staff self-scope, controlled PromptPay QR, private slip storage, merchant-owned LINE for paid production, CSV export/closure, and native operational ticket/support capability. Agreement: 3/3 among completed experts.
- V1 excludes medical/clinic workflow, multi-branch, marketplace, POS/inventory/payroll/accounting, full CRM/marketing automation, annual billing, customer mobile app, public slip URLs, runtime `promptpay.io`, and unaudited platform impersonation. Agreement: 3/3 among completed experts.
- Canonical booking states are `hold`, `pending_review`, `confirmed`, `completed`, `cancelled`, `no_show`, `expired`; canonical deposit states are `not_required`, `awaiting`, `submitted`, `verified`, `rejected`, `refunded`. Agreement: 3/3 among completed experts.
- Availability must fail closed when schedule data is missing and must prevent overlapping active bookings at the authoritative data layer. Agreement: 3/3 among completed experts.
- Any Staff means deterministic allocation among qualifying providers, protected by collision-safe booking logic. Agreement: 3/3 among completed experts.
- Deposit-required bookings start with a 15-minute hold; no-deposit bookings can atomically confirm. Agreement: 3/3 among completed experts.
- Auto-slip is V1-required for Pro before sale, but provider, allowance, cost/top-up, and failure policy are still unresolved. Agreement: 3/3 among completed experts.
- Basic/Pro prices are provisional references, not final public prices. Agreement: 3/3 among completed experts.
- Paid production LINE should use merchant-owned LINE OA; central WSTERA OA is limited to trial/onboarding boundary. Agreement: 3/3 among completed experts.
- DB-backed gates remain `BLOCKED_ENVIRONMENT`: G2 plus DB-backed parts of G3-G9 have zero accepted runtime evidence because no approved PostgreSQL/Supabase runtime exists and Docker is prohibited. Agreement: 3/3 among completed experts.
- Static/unit/build evidence exists, including tests, lint, build, static absence, and secret scan, but this does not prove sellable V1. Agreement: 3/3 among completed experts.
- Independent review PASS exists for code/design with no P0/P1, but DB-backed evidence remains blocked. Agreement: 3/3 among completed experts.
- `CURRENT_STATUS.md` versus independent-review PASS has a reconciliation tension that CONT-04/CONT-03 closeout must resolve before release claims. Agreement: 1/3 explicit, consistent with the shared evidence.
- CM01 is a separate product/repo and must not be collapsed into BK01. Agreement: 3/3 among completed experts.
- BK01 has native ticket/case capability only as V1 operational/support scope under PD-018, not as a lead product identity. Agreement: 3/3 among completed experts.
- Module Hub scan is HOLD and no product-defining BK01 decision depends on Module Hub at this gate. Agreement: 3/3 among completed experts.
- Pilot/WTP/concurrency/notification reliability evidence is unmeasured. Agreement: 3/3 among completed experts.
- Stale build/source-map legacy-string release hygiene remains a risk for shipped artifacts even where current source/static checks pass. Agreement: 2/3 explicit.

## 3. Consensus / Majority / Dissent

Full consensus, 3/3:

- Product identity: Thailand-first appointment-operations SaaS for single-location hair/barber/beauty/nail shops.
- ICP: Thai LINE-centric small service businesses, 1-10 providers, low setup burden, deposit workflows.
- V1 boundary: required PRD rows plus BK-A closeout and release gates; explicit non-goals remain out.
- Product-defining capabilities: scheduling integrity, PromptPay/private slip, merchant-owned LINE, staff self-scope, cancel/reschedule/reminders.
- Current implementation is not sellable V1 because DB-backed authority-layer gates and provider-backed evidence are missing.
- Auto-slip Pro, final prices, and LINE cost/allowance remain owner decisions.
- CM01 separation and Module Hub HOLD are binding for this gate.

Majority, 2/3:

- Stale build/source-map artifacts create release-hygiene risk even when visible source passes absence checks.
- Staff/provider management, hold/reschedule timing, and ticket/case are required operational capabilities but are not the standalone differentiator.

Dissent or single-explicit emphasis, 1/3:

- One candidate emphasized `CURRENT_STATUS.md` still listing BK-A as open while independent review reports PASS; this is not a contradiction that changes product identity, but it is a required closeout reconciliation before release readiness language.
- One candidate cited broader market ledger evidence; this synthesis treats it only as contextual evidence because Business/Market decisions are out of scope.

## 4. Missing Evidence / Unresolved Questions

- Approved PostgreSQL/Supabase runtime for G2 and DB-backed G3-G9.
- Migration replay, RLS denial, tenant isolation, concurrent overlap, atomic reschedule, Stripe ordering, notification persistence, reminder scheduler, CSV export, and platform audit persistence evidence.
- Real provider evidence for LINE, Stripe, PromptPay/deposit flow, and auto-slip provider behavior.
- Auto-slip provider, included allowance, unit economics, top-up model, and failure/escalation policy.
- Final Basic/Pro prices and public commercial copy.
- WSTERA-managed LINE allowance/cost model for merchant-owned OA.
- Cancel/reschedule window defaults: keep nullable fail-closed or force configuration/defaults.
- Blacklist V1 disposition: optional ship, defer, or remove from V1 surfaced scope.
- Pilot evidence: time-to-first-value, real concurrency, notification reliability, deposit reliability, retention, no-show effect, and willingness to pay.
- CONT-04/CONT-03 closeout reconciliation between current status and independent review PASS.
- Release artifact hygiene for stale `.next`/source-map legacy strings.

## 5. Synthesizer Recommendation

Set the Product Gate verdict to **REMEDIATE**.

The product destination itself is stable enough to lock for downstream work: identity, ICP, V1 scope, flows, domain rules, and CM01 separation have full 3/3 agreement. However, a clean PASS would be misleading because the current implementation is explicitly not sellable V1. The remediation is not to re-decide the product; it is to close evidence and owner-decision gaps before any public V1 release or commercial claim.

## 6. Why This Recommendation

`PASS` would imply the Product Gate is stable without qualification, but the candidates all say critical DB-backed gates and provider-backed behavior remain unverified. `BLOCK` would overstate the problem because there is no hard product identity or scope blocker; the core product answer is coherent and fully agreed.

`REMEDIATE` best matches the evidence: lock the product target, preserve the V1 boundary, and require remediation of DB evidence, owner decisions, pilot evidence, and status/release-hygiene reconciliation before sellable V1.

## 7. Rejected Alternatives + Why

- `PASS`: rejected because current implementation is not sellable V1, DB-backed gates are `BLOCKED_ENVIRONMENT`, Pro auto-slip lacks provider/cost policy, final prices are provisional, LINE cost model is unresolved, and pilot evidence is absent.
- `BLOCK`: rejected because the product question is answered with 3/3 consensus; no candidate found an unresolved identity, ICP, or V1-scope conflict severe enough to stop product definition.
- Collapse BK01 with CM01: rejected by 3/3 agreement and explicit product boundary evidence.
- Treat Module Hub fit as binding: rejected because the Module Hub scan is HOLD and nothing product-defining depends on it at this gate.
- Treat pricing/revenue/competition as decided here: rejected because this gate is Product only and Business/Market decisions are reserved for later.

## 8. Gate Verdict + Blockers

Verdict: **REMEDIATE**

Blocking remediation items before sellable V1:

- Close DB-backed gates G2 and DB-backed portions of G3-G9 in an approved PostgreSQL/Supabase runtime.
- Reconcile CONT-04/CONT-03 status versus independent-review PASS and document whether named open items are fixed, pending, or deferred.
- Decide auto-slip provider, allowance, unit cost/top-up, and failure policy before selling Pro.
- Decide final Basic/Pro prices before public commercial launch.
- Decide WSTERA-managed LINE allowance/cost model for merchant-owned LINE.
- Decide cancel/reschedule default-window behavior or force configuration so fail-closed nulls do not silently break the customer change promise.
- Decide blacklist V1 disposition.
- Produce pilot evidence before making outcome claims such as WTP, retention, reduced no-shows, or real-world notification/deposit reliability.
- Verify release artifact hygiene, including stale build/source-map legacy strings.

## 9. Confidence

Confidence: **82/100**

Confidence is high on product identity, ICP, V1 boundary, flows, rules, and CM01 separation because all three candidates independently converge on the same locked product contract. It is capped because the implementation readiness claims still depend on DB/runtime evidence, provider-backed behavior, pilot measurement, and owner decisions that are not closed.

## 10. Technical Document Pack

Created Product Pack files:

- `PRODUCT-SOURCE-OF-TRUTH.md`
- `PRODUCT-SCOPE.md`
- `USER-FLOWS.md`
- `BUSINESS-RULES.md`
- `V1-ACCEPTANCE-CRITERIA.md`
- `OPEN-DECISIONS.md`
- `01-PRODUCT-OWNER-BRIEF.md`

## 11. Thai OWNER-BRIEF Reference

Thai owner-facing brief is persisted at:

`D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\BK01\01-PRODUCT-OWNER-BRIEF.md`
