# BK01 — Product Gate Candidate B

_(anonymized candidate; identity withheld from synthesizer)_

---

# BK01 Booking by WSTERA — Product Gate Expert Answer 

Frozen gate question: What exactly should Booking by WSTERA be, for whom, and where does V1 end?

---

## Recommendation

BK01 should be a **Thailand-first, single-location appointment-operations SaaS** squarely aimed at small hair/barber/beauty/nail businesses with roughly 1–10 service providers, in which the durable product identity is **"reliable staff scheduling + Thai-native PromptPay deposit flow + merchant-owned LINE operations + low onboarding burden"** — an operations product, not merely a booking tool. The primary loop is: merchant configures one shop/service/provider/schedule → publishes a customer booking URL → customer makes a collision-safe booking (deposit-hold or immediate no-deposit confirm) → merchant reviews/verifies deposit → confirm → reminder/confirmation delivery → merchant marks completion or no-show → audited cancellation/reschedule. V1 ends at the explicit non-goals (no medical, no multi-branch, no marketplace, no POS/ERP/inventory/payroll/accounting, no full CRM/marketing automation, no annual billing, no customer mobile app, no public deposit-slip URLs, no runtime `promptpay.io`, no unaudited platform impersonation) and is gated by a fixed 14-item BK-A contract-remediation closeout list plus DB-backed gate closure in an approved PostgreSQL/Supabase runtime.

The product-defining capabilities (the ones that materially set BK01 apart and therefore anchor the identity) are, in order: ** enforcement of booking-integrity at the authoritative data layer** (DB exclusion constraint + atomic collision-safe create/reschedule), **(B) a PromptPay-native deposit flow with controlled/self-generated QR** (no public `promptpay.io`), ** a merchant-owned LINE architecture for paid production with central OA confined to trial/onboarding**, **(D) explicit staff identity self-scope**, and **(E) self-service customer change flow (cancel/reschedule) with policy, audit, and atomic guardrails**. Staff/provider management, hold/reschedule timing, and ticket/case remain required-but-operational capabilities that do not by themselves set the identity. BK01's internal ticket/case support capability must be kept distinct from the CM01 Booking Claim & Case Management module: they are separate artifacts with separate product boundaries; similar naming is not evidence of merge/reuse fit.

---

## Verified facts/evidence used

All evidence opened and read directly in this run; nothing cited from memory.

**Frozen brief** — `docs/.../01-product/BK01/COUNCIL-BRIEF.md` (gate question, mandated docs, rules, output contract).

**Locked product documents (repo `D:\AI-Workspace\projects\saas-product-hub\products\booking`):**
- `docs/00_PRODUCT_VISION.md` — Status LOCKED 2026-08-28. Primary ICP = single-location hair/barber/beauty/nail, ~1–10 providers, Thailand, LINE-centric Thai-first. Category = "Thailand-first appointment operations SaaS with LINE-assisted customer communication and PromptPay-native deposit workflows." Explicit V1 non-goals list (medical, multi-branch, marketplace, POS, payroll, CRM suite, annual billing, mobile app, public slip URLs, `promptpay.io`, unaudited impersonation). Differentiation hypothesis = the combination of reliable scheduling + Thai-native deposit + merchant-owned LINE + low setup burden; LINE or PromptPay alone are NOT defensible. Success evidence = pilot showing time-to-first-value, booking integrity under concurrency, reliable deposits/notifications, retention/WTP; no-show reduction/conversion/WTP remain hypotheses.
- `docs/01_PRD.md` — Status LOCKED 2026-08-28, baseline `main @ e99615d`. Full FR/SEC/REL/OPS/NFR requirement contract. Key: FR-ONB-001 single shop; FR-SVC/STF/SCH service/provider/schedule; FR-BKG-001..006 public booking without customer account, availability excludes closures/time-off/missing-schedule/breaks/overlap, atomic collision-safe create, deposit hold vs no-deposit immediate confirm, hold expiry releases capacity; FR-DEP-001..004 PromptPay QR inside approved boundary (no public `promptpay.io`), private slip storage, reject/verify with Pro auto-verify target, duplicate/ambiguity fail-safe; FR-LIFE-001..005 cancel/reschedule with policy+audit, completed/no-show measurable, blacklist optional, tenant-scoped history; FR-LINE-001..003 confirmation + at least one reminder with evidence, merchant-owned OA paid vs central OA trial, notification failure never mutates authoritative state; FR-BILL-001..004 Stripe webhook idempotent/out-of-order safe, monthly-only public V1, no legacy 100/500 paid wall, explicit variable-cost allowances; FR-DATA-001/002 CSV export + closure process; FR-SUP-001 owner/admin-only V1 ticket as operational capability, not lead claim; FR-OPS-001 audited platform admin; SEC/REL/NFR tenancy scoping, private slips, no secrets in client, DB-authoritative concurrency, Asia/Bangkok, mobile-first.
- `docs/05_BOOKING_DOMAIN_RULES.md` — Status LOCKED. Canonical booking states `hold/pending_review/confirmed/completed/cancelled/no_show/expired`; deposit states `not_required/awaiting/submitted/verified/rejected/refunded`. Availability bookable only if shop/service/provider active + explicit weekly schedule + duration fits + not closed + no overlap. Missing schedule = fail-closed unavailable. Any Staff = deterministic lowest-qualifying-workload + tie-breaker, collision-safe. Hold = deposit-required starts `hold/awaiting`, 15-min expiry releases capacity → `expired`; no-deposit enters `confirmed/not_required` atomically. Slip rules (private object, controlled ref, upload type/size limits, submit moves hold→`pending_review/submitted`, manual approve→`confirmed/verified`, reject→time-limited recoverable, auto-verify only on positive provider result tied to expected amount/merchant/transaction, duplicate trans_ref rejected/escalated). Reschedule = V1 REQUIRED atomic old-slot-release+new-reserve under same rules. Cancel = within merchant policy, releases capacity, refund is merchant policy (no automated-refund claim). Completion/no-show = explicit actions, never inferred. Blacklist Optional. Paid capacity effectively unlimited, legacy 100/500 retired. LINE = confirmation + ≥1 reminder required, failure logged/recoverable without corrupting state, merchant OA paid default.
- `docs/06_UX_USER_FLOWS.md` — Status LOCKED. Customer flow (open URL → service/provider/Any-Staff/date/time → name+Thai mobile → collision-safe hold or immediate confirm → if deposit: controlled PromptPay QR + countdown → private slip upload → `pending_review`/verified → on confirm show code/detail/contact/LINE state). Change flow (recovery-token surface → merchant policy → cancel or new slot → atomic mutation → notification; failure leaves original unchanged). Owner onboarding/daily, staff flow (maps to exactly one provider, own bookings only, no shop-wide tickets, fails closed), platform-operator flow (audited, no impersonation).
- `docs/10_DEVELOPMENT_ROADMAP.md` — Status LOCKED. Stage 4 Option A reconciliation COMPLETE at `836943a` (must not repeat). Portfolio P0a-C1 PASS, BK01 eligible as next heavy track. CONT-03 re-verified at HEAD `908108c`: `npm test` 19/19, lint 0 errors, build PASS, `git diff --check` PASS, static absence PASS, secret scan PASS; DB-backed gates G2 + DB parts of G3–G9 BLOCKED_ENVIRONMENT. 14-item BK-A closeout list; BK-B pilot (5–15 qualifying single-location pilot shops); BK-C commercial lock; BK-D public V1 launch only after gates + legal/privacy + owner price approval + independent PASS. Post-V1 = annual billing, multi-branch, CRM/marketing, marketplace, webhooks, waitlist, calendar sync, advanced analytics.
- `docs/PRODUCT_DECISIONS.md` — Status OWNER APPROVED 2026-08-28. PD-001..PD-018 fully recorded with rejected alternatives. Locked: PD-001 ICP; PD-002 retire 100/500 paid quota; PD-003 ฿490/฿990 provisional not final; PD-004 Pro auto-slip V1-required before sale; PD-005 merchant-owned LINE for paid, central OA trial; PD-006 explicit staff mapping/self-scope; PD-007 private slip storage; PD-008 annual POST-V1; PD-009 customer reschedule/cancel V1-required; PD-010 reminders V1-required; PD-011 controlled PromptPay QR, no `promptpay.io`; PD-012 CSV export + closure flow; PD-013 no-show explicit/audited; PD-014 blacklist optional; PD-015 multi-branch POST-V1; PD-016 medical excluded; PD-017 canonical host `bk01.wstera.com`, two-Worker routing; PD-018 ticket = operational/support capability, not lead marketing. "Do not price database rows" pricing philosophy; exact prices pending.
- `docs/CURRENT_STATUS.md` — Branch `feature/bk-a-v1-contract-remediation`, baseline `51771f6`. BK-A open, Stage 4 closed, CONT-03 requires remediation+review, CONT-04 DB gates blocked (no approved PostgreSQL/Supabase, Docker prohibited). P0a-C1 PASS.
- `docs/audit/BK-A-IMPLEMENTATION-EVIDENCE-2026-08-29.md` — A1–A13 implemented: private slip refs/signed reads/staff auth mapping + owner-admin vs staff-self RLS; monthly-only checkout, annual removed, 100/500 wall removed, ฿490/฿990 as pilot/reference; central-trial vs merchant-paid LINE boundary + raw-body HMAC + durable notification claim/retry/log + confirmation + 24h reminder; provider-neutral auto-verify result/audit boundary, no public claim; deterministic in-app PromptPay payload + local SVG QR, no `promptpay.io`; token-authorized customer cancel/reschedule atomic + completed/no-show + immutable audit; CSV export + closure request + staff excluded from shop tickets + platform-admin mutation audit; unsupported absolute copy removed. Migration `supabase/migrations/20260829105155_bk_a_v1_contract_remediation.sql` created but NOT applied to any live/remote project. Non-DB gates PASS at HEAD `908108c`; DB gates BLOCKED_ENVIRONMENT (no local Postgres `/psql`, no Docker). Owner-decision blockers carried forward (auto-slip provider/allowance/cost, WSTERA LINE cost model, final prices, cancel/reschedule windows nullable fail-closed).
- `docs/audit/INDEPENDENT_REVIEW_CODEX_BK-A_2026-08-29.md` — PASS, 0 P0/P1 code/design defects, 2 P2 cosmetic; DB-backed gates BLOCKED_ENVIRONMENT (not code defects). Cont-04 required before public V1.
- `docs/audit/CURRENT_TRUTH_AND_CONTRADICTIONS.md` — Full contradiction register resolved at product-contract level; ROLE-003 staff-ticket scope, CLAIM-001 absolute `ปลอดภัย 100%` copy, COMM-001 stale commercial copy all resolved toward BK-A remediation.
- `docs/daily/2026-09-03.md` — same CONT-03/DB-blocked status; next = Continuation 04 in approved runtime; do-not-repeat notes.
- Repo inspection (live): branch `feature/bk-a-v1-contract-remediation`, clean working tree; 29 migrations incl. the BK-A migration; apps `booking-admin` + `booking-consumer` (OpenNext Cloudflare Workers per current-truth doc), Worker names `wstera-admin`/`wstera-consumer`; canonical host `bk01.wstera.com` per PD-017.

**Module Hub / CM01 boundary evidence:**
- `docs/.../module-scan/COUNCIL-BRIEF.md` — Module Hub canonical library `D:\AI-Workspace\projects\modules-hub`, status HOLD until owner release after Round 1; similar names not evidence of fit; a missing module is a finding, not authorization to build one.
- `docs/.../01-product/CM01/COUNCIL-BRIEF.md` — CM01 is a SEPARATE product ("Booking Claim & Case Management Module") in a SEPARATE repo `products\booking-ticket-module`, with its own gate question, own V1 finish line, and explicit rule "Do not collapse CM01 into BK01 by name similarity." CM01 boundary explicitly references separation decisions vs BK01/TT01 and Module Hub ticket-tracker.
- BK01 native ticket/case: FR-SUP-001 + PD-018 lock BK01's internal ticket/case as an owner/admin-only operational support capability for the booking product (not a lead/CRM claim). This is BK01-native and distinct from the standalone CM01 module.

---

## Key reasons

1. **The product identity must land on "operations," not "booking tool."** The vision and PRD both state the recurring failure is keeping staff availability, deposits, confirmations, changes, and customer communication consistent without double-booking or manual follow-up. Merely "taking bookings" is commoditized; the defensible core is scheduling integrity + Thai-native deposit + merchant-owned LINE + low setup, as an operations suite for a single location.

2. **The core loop is fully locked and implementable in V1.** The create path (public URL → collision-safe hold/immediate confirm → deposit verify → confirm) and the change path (reschedule/cancel with policy + atomicity + audit), plus completion/no-show for KPI truth, are specified down to state machines, database rules, and UX steps. This gives a concrete, testable V1 finish line.

3. **Scheduling integrity is the authoritative differentiator at the data layer.** Domain rules and REL-001 specify DB-level exclusion-constraint collision prevention, atomic create/reschedule transactions, fail-closed missing schedules, Any Staff deterministic allocation. Booking-integrity-under-concurrency is both a core value and a V1 release gate (partly DB-gated).

4. **Thai-native money flow is first-class, which matches the ICP and market.** PromptPay deposit with self-controlled QR (no public `promptpay.io`), private slip storage, safe slip verification including Pro auto-verify, duplicate/ambiguity fail-safe — these are deliberate, approved product decisions that Thai small appointment merchants can adopt without external payment friction.

5. **Merchant ownership of the customer relationship and LINE is explicit.** PD-005/FR-LINE-002 lock merchant-owned LINE OA for paid production, central WSTERA OA only for onboarding/trial. This directly answers the "for whom" (line-first Thai operators who want their own brand/trust on LINE) and keeps BK01 distinct from a brand-capture marketplace.

6. **V1 scope boundaries are crisp and enforced.** Eleven explicit vision non-goals plus PD-015 (no multi-branch), PD-016 (no medical), PD-008 (no annual), PD-002 (no legacy quota wall), PD-018 (ticket not a lead claim) give an unambiguous "where V1 ends," and are backed by static-absence checks in CONT-03.

7. **The separation from CM01 is deliberate and must be preserved.** CM01 is a separate product in a separate repo with its own brief; similar naming is explicitly not evidence of fit. BK01's native ticket/case (owner/admin support capability) is operational to the booking journey, not the standalone claim/case-management module. No basis exists in these briefs to collapse them.

---

## Risks/failure cases

1. **DB-backed gates are still BLOCKED_ENVIRONMENT.** All code/static/build PASS, but migration replay, RLS/tenancy denial, concurrent-overlap, Stripe ordering, LINE delivery, reminder scheduler, CSV content, and platform-admin audit persistence cannot be verified until an approved PostgreSQL/Supabase runtime is available (Docker prohibited). Public V1 cannot be declared until these close. Highest-risk single item: the concurrent-overlap exclusion constraint and atomic reschedule under real concurrency.
2. **Native-capability verification gap for LINE and auto-slip providers.** The implementation is provider-neutral fail-safe but no real LINE, Stripe, PromptPay bank, or auto-slip provider call was ever made. Real-world integration behavior is unverified; this is a live-runtime risk, not a pure environment-block.
3. **Final commercial decisions are unresolved owner-decisions.** Auto-slip provider/allowance/unit cost/top-up, WSTERA-managed LINE cost model, and final Basic/Pro prices are all open. Until decided, V1 marketing/commercial surfaces stay reference-only, and BD (public launch) stays blocked. Cancellation/reschedule policy windows are nullable and fail closed until merchants configure them (no default was invented) — a merchant-setup burden and a potential UX trap if not surfaced clearly.
4. **Pilot evidence is not yet captured.** Time-to-first-value, booking integrity under real concurrency, deposit/notification reliability, and willingness-to-pay are all hypotheses until BK-B pilot (5–15 shops) produces measured data. The "reduces no-shows" style claims are explicitly not allowed without `SHIPPED-VERIFIED` evidence.
5. **Scope creep toward "generic booking tool" or toward CRM/multi-branch.** The clearest failure mode is drifting to a generic scheduler, or expanding into marketing/CRM/multi-branch before the single-location operations value is proven — both are explicitly non-goals.
6. **CM01/BK01 boundary drift.** Because both touch "case/ticket" vocabulary, there is a real risk of an expert or later actor collapsing them by name similarity. The briefs preserve separate product boundaries; violating this would blur BK01's operations identity and CM01's standalone module value.
7. **Absolute-copy residue risk despite static PASS.** While CONT-03 confirms current V1 surfaces are clean, stale build artifacts (.next cache/source maps) still contain legacy strings; release build hygiene must ensure the actual shipped artifact is clean, not just visible source.

---

## Assumptions

- The frozen brief and the numbered LOCKED/OWNER-APPROVED documents (Vision, PRD, Domain Rules, UX Flows, Roadmap, PRODUCT_DECISIONS) are authoritative and internally consistent for the Product Gate. No earlier/historical document overrides a locked one.
- Canonical technical host is `bk01.wstera.com` with preserved two-Worker (admin/consumer) routing per PD-017.
- The Module Hub scan is on HOLD; I did not treat any module-hub capability as reusable without inspection, and none was required to answer the Product Gate (BK01's core is native domain logic).
- CM01 is a separate product/repo; this answer treats BK01 and CM01 as distinct and does not propose any merge.
- Pricing/revenue/competition are out of scope for this gate and are deliberately not decided; PD-002/PD-003/PD-008 statuses are cited only as scope/lock constraints.
- Asia/Bangkok business-time semantics; Thai+English UI (NFR-001); mobile-first customer flow (NFR-002).
- Docker/DB runtime restrictions are real and binding; no production/remote DB was opened and none should be until owner-provided.

---

## Open questions/missing evidence

1. When will an approved local or remote PostgreSQL/Supabase runtime be available to close CONT-04 (G2 + DB-backed G3–G9)? This is the single largest unresolved evidence gap for a PASS.
2. Final Pro auto-slip provider, included monthly allowance, unit economics/top-up price, and operational failure policy — open owner decisions.
3. Whether/at-what-cost WSTERA manages LINE messaging allowance for merchants; exact merchant-owned OA cost split.
4. Final public Basic/Pro monthly prices (currently pilot-reference only per PD-003).
5. Real (non-fixture) provider integration evidence: one real LINE delivery, one real Stripe webhook idempotency/out-of-order, one real PromptPay QR generation, and an end-to-end deposit verification result — none observed.
6. Whether merchant-configured cancel/reschedule policy windows lacking a default is acceptable UX/commercial risk, and whether a safe default (vs fail-closed nullable) is desired.
7. Pilot metrics that will empirically validate/invalidate the differentiation hypothesis (no-show reduction, conversion, WTP) — pending BK-B.
8. Confirmation of the release-hygiene guarantee that shipped artifacts (not just visible source) carry no legacy absolute/`promptpay.io` strings.

---

## Confidence 0-100

82

Confidence is high because the Product Gate answer is thoroughly locked by owner-approved documents read in full, with a concrete V1 contract, explicit non-goals, and independent PASSc+ evidence on the code/static/build surface. It is not higher because the decisive DB-backed verification and all real-provider/runtime evidence remain BLOCKED_ENVIRONMENT, three owner commercial decisions are still open, and pilot evidence has not been measured — any of which could materially shift the "where V1 ends" and readiness picture.
