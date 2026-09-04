# Council Product Gate — PS01 Pawstia (AGY Independent Expert)

Date: 2026-09-03
Brief: `llm-council-gate` v0.3.2 (frozen) — `COUNCIL-BRIEF.md`
Repo under review: `D:\AI-Workspace\projects\saas-product-hub\products\PawSpace`
Note: The Module Hub capability scan in the canonical destination is on `HOLD` pending owner release after Round 1 Product + Business/Market evidence; I therefore treat Module Hub overlap as out of scope for this gate and rely on the Phase 12 reviewer's documented `ADAPTER ONLY / SOURCE SUBTREE COPY` posture for the two Module Hub references that appear in the repo's own briefs.

---

## Recommendation

Pawstia PMS (`Pawstia`/`pawspace`/`PS01`) is, and should stay, a **Thailand-first, single-location Pet Hotel & Pet Daycare daily-operations OS** — a focused pet-room/booking integrity tool with a LINE-native daily-care-reporting loop and a Google Sheets ownership replica. It is **not** a broad multi-tenant "pet business management suite" in V1.

- **For whom:** the owning operator and floor staff of a single pet hotel/daycare site in Bangkok metro (secondary user: the pet owner who gets the LINE report card). V1 targets single-store, not multi-branch and not a marketplace.
- **Strongest pain to anchor on:** (1) double-booking / room-slot conflicts that already occur with paper or Excel (peak-holiday worst case); (2) the manual, scattered, per-pet LINE photo-reporting burden on staff every day; (3) data-lock-in fear that blocks pet hotels from adopting any new software.
- **Correct primary identity (V1):** a Pet Hotel/Daycare room-and-care operations OS (room matrix + strict booking lifecycle), whose moat is the combination of *authoritative DB-level concurrency/no-overlap enforcement* + *15-second Daily Care Report delivered via LINE* + *Google Sheets one-way export replica*. The broader "PMS" label is only safe as an aspiration; the concrete V1 deliverable is the single-store daily care loop.
- **Core daily value/retention loop:** pet checks in → room matrix shows a clean no-collision assignment → staff sees food/meds context → staff sends a 15-second Daily Report (1–4 photos + eat/elimination/mood + note) → owner receives a LINE Flex card. Repeat every stay. Retention driver: the loop is daily, habit-forming, LINE-native (no app download for the owner), and protects real bookings at the database boundary.
- **Primary flows:** booking/create + pet assignment; check-in/out + cleaning + maintenance; Daily Report with media + LINE delivery/retry; LINE identity claim (LIFF, 48h token); Google Sheets verified-binding export sync; onboarding/CSV import with audit; owner/manager dashboard with entitlement visibility; customer self-booking (LIFF) as a later validated addition (not the V1 wedge).
- **Smallest V1 (the line V1 ends at):** single-store room/booking/CRM + check-in/out/cleaning/maintenance + Daily Care Report via LINE + Google Sheets export replica + LINE claim + onboarding/import + owner/manager dashboard + subscription/entitlement foundation + Starter quotas. **Explicit non-goals (PRD §2):** no clinic/pharmacy, no grooming queue, no SlipOK/billing/e-tax automation, no Google Drive photo sync in V1, no digital pet passport / full RTSP-HLS multi-camera platform, no multi-branch control — all parked to future paid/expansion stages pending real demand.
- **Product-defining versus optional breadth:** *Defining* = booking integrity (room + pet no-overlap at DB), Daily Report → LINE delivery, Google Sheets ownership replica. *Optional breadth* = customer self-booking LIFF (validation-stage), camera access (bounded only), dashboard/entitlements, quotas — these are support/polish/ops, not the wedge.
- **Pilot/value-validation prerequisites vs paid-production prerequisites (per `BRIEF-sell-ready-execution.md` / `ROADMAP.md` / `COMMERCIAL_READINESS.md`):** Closed-Beta value validation first (real store(s), measure onboarding time, booking failures, LINE delivery success, Sheets sync failures, staff learning curve, support burden, willingness-to-pay), then paid-production after Phase 13 independent closure, payment collection, staging/production + monitoring/backup/restore/incident/support, Terms/Privacy/DPA, and formal brand/trademark + channel clearance. Technical "pilot ready" must never be read as market fit.

---

## Verified facts/evidence used

- **Frozen brief (authoritative):** `COUNCIL-BRIEF.md` in the PS01 canonical dir; gate question is identity/what/for-whom/where V1 ends; instructs direct Git/source inspection, not stale status docs; forbids gate verdicts, remediation, treatment of tech closure as market fit.
- **`docs/PRD.md`** — Authoritative target contract: "Pet Hotel OS … via LINE … Google Sheets export replica"; three pains (double-booking, Daily Care Report chaos, lock-in fear); V1 Goals 1–3 (authoritative booking + no-overlap, ≤15s LINE report, Google Sheets replica); strict booking state machine (`confirmed→checked_in→checked_out/cancelled`); deterministic lock ordering; idempotency; LINE claim; permission matrix (owner/manager/staff); explicit non-goals list.
- **`docs/PRODUCT_ONE_PAGER.md`** — 3-pain/3-feature framing (Visual Room Matrix, 15-Second Daily Report Card, Google Sheets Auto-Sync Replica); pricing starter 990/Pro 1,490 THB/mo; founding-10 free 30-day trial; **brand/publication status is DRAFT — DO NOT PUBLISH**; LINE OA + website both `TBD` (not claimed).
- **`docs/ROADMAP.md`** — Engineering Phase 1–3, 4–6, 7–9, 10, Design, 11/11.1, 12 all CLOSED; **Phase 13 IMPLEMENTED but NOT CLOSED (final re-verification pending at write time)**; Payment collection NOT IMPLEMENTED; Production deploy NOT VERIFIED/NOT LAUNCHED; Commercial Stage A=Core, B=Closed Beta, C=Paid Launch, D=Expansion; clear "do not call technical PILOT READY = real-world beta validation".
- **`docs/BUSINESS_MODEL.md`** — Decision C2 Founding Member Pro entitlement @990 THB (lifetime while continuous); Enterprise single-store Pro Plus 2,490; onboarding fee 3,000–5,000 after beta; H1–H4 validation hypotheses (30-store interviews, >40% trial→paid, WTP 990–1,490, B2C add-on take-up); 0-to-1 sales playbook (50 BKK hotels list, outreach, founding-10 funnel).
- **`docs/IMPLEMENTATION_STATUS.md` + `docs/CURRENT_STATUS.md`** — Phase 1–12 closed/reviewer-verified; Phase 13 implemented, re-verification required; **no FINAL Phase 13 evidence existed at 2026-09-02 reconciliation**; payment absent; production not verified; Closed Beta not completed; brand candidate locked only.
- **`docs/COMMERCIAL_READINESS.md`** — Before-Paid-Launch items **all still unchecked** at 2026-09-02: payment collection, upgrade/downgrade rules, trial-expiry, suspension/reactivation, monitoring, backup/recovery, incident, support, ToS/Privacy/DPA final, vendor/subprocessor, formal trademark; brand production web + channels unconfirmed.
- **`docs/PRODUCTION_OPERATIONS.md`** — Pre-production framework; staging/production/monitoring/backup/incident RTO-RPO/support all required before commercial launch; Windows Docker is not mandatory (GitHub Actions ephemeral Ubuntu preferred).
- **`docs/BRIEF-sell-ready-execution.md`** — PS-SR-01..10 tickets; priority: **PS-SR-01 (close Phase 13 independently) first**; Warm Hospitality is not the paid-readiness critical path; payment integration must not start until Closed Beta evidence + PS-SR-07 approved; Module Hub is read-only/copy-and-own, adapter must never replace tenant-scoped Postgres authority.
- **Phase evidence/reviews:** `PHASE12_IMPLEMENTATION_EVIDENCE.md` + `REVIEW-phase12-final-2026-08-23.md` (Phase 12 PASS, reviewer counts 88/88 etc., notes Module Hub reuse documented as ADAPTER ONLY/SOURCE SUBTREE COPY); `REVIEW-phase11.1-gate2` (PASS); `REVIEW-phase11` (PASS); `REVIEW-phase10` (PASS); `REVIEW-phase3/8/9` (PASS). These cover Phase 1–12 only.
- **Phase 13 current state (DIRECT verification, not status doc):**
  - Branch `verify/phase13-closure-2026-09-01`, HEAD `fdd10e7`, working tree clean.
  - `PHASE13_IMPLEMENTATION_EVIDENCE.md` now EXISTS (2026-09-03) and records CI run **33743691064 — success**, verified implementation SHA `d6f4acf`; covers clean migration replay + DB lint, Phase 1/2/3 historical regressions, current-schema suites (incl. Phase 13 lifecycle_matrix, csv_atomicity), quota concurrency races, legacy `trial→trialing` normalization, all TS suites incl. Phase 7 worker claim fix (`d6f4acf`), Phase 10 E2E, typecheck/lint/build/diff-check.
  - **I independently confirmed** via `gh run view 33743691064` → verify job **✓ in 8m14s** (passing), triggered by PR #4; PR #4 is **DRAFT/Open, not merged** (1372 additions/10 deletions, verification scope only, no production migrations).
  - **No independent Phase 13 reviewer file exists** (`REVIEW-phase13-*.md` absent); no `docs/daily/2026-09-03*.md` exists. The evidence file is self-described as CI closure evidence, explicitly noting "This is isolated CI evidence, not production deployment evidence. No PR merged, no remote DB migration applied, no deployment."
  - `docs/SYSTEM_ARCHITECTURE.md` reconciles (2026-08-28): Phase 13 added subscription lifecycle/commercial access/quotas/audit; payment absent; per-shop LINE tokens from server-side env config; **Supabase Vault remains a target architecture, not a current-runtime claim**.
- **Onboarding/docs:** `docs/ONBOARDING_SOP.md` (3-min storefront SOP: create customer + LINE claim → booking/check-in → Daily Report → check-out/cleaning) is consistent with PRD flows and is the operational evidence that the product is genuinely shaped around the storefront daily loop.
- **Module Hub:** canonical destination `module-scan/COUNCIL-BRIEF.md` **STATUS: HOLD until owner release** — so Module Hub overlap was not evaluated as a deciding factor; the only two Module Hub references in Pawstia docs are recorded as `ADAPTER ONLY / SOURCE SUBTREE COPY` (Phase 12 review, Phase 13 brief).

---

## Key reasons

1. **The strongest documented pain is daily-operations integrity, not breadth.** All three PRD/One-Pager problems (double-booking, photo-report chaos, lock-in fear) are single-store daily operational pains. That points to a narrow, sticky daily loop — not to a wide PMS/suite that spreads thin across clinic, grooming, billing, and multi-branch.
2. **The retention engine is the LINE-native daily report, not a dashboard.** The 15-second Daily Report delivered as a LINE Flex card is used daily, needs no app on the owner's side, and has concrete retry/idempotency/DB-membership contracts behind it. That is a genuine daily-habit retention loop; a broad "PMS" surface adds cost without strengthening it.
3. **Booking/room/pet integrity is provably engineered, not claimed.** Authoritative RPC-only mutations, deterministic lock ordering, strict state machine (`confirmed→checked_in→checked_out/cancelled`, no rollback), pet no-overlap even across rooms, DB-level concurrency and quota triggers, and reviewer-verified Phase 1–12 evidence give the core loop real credibility. This is the defensible product-defining identity.
4. **The repo's own roadmap and sell-ready brief already lock the boundary the gate asks about.** PRD non-goals and Stage B/C/D sequencing explicitly park billing/e-tax, grooming, clinic, multi-branch, camera platform, Drive sync, and digital passport until real beta/paid demand — i.e., V1 ends at the single-store loop, and the commercial gates (payment, prod ops, legal, brand) are deliberately *not* part of V1.
5. **Commercial readiness is honestly un-gated.** Nothing is being oversold: payment, upgrade/downgrade/trial/suspension rules, monitoring, backup/recovery, incident/support, final legal, formal trademark, and production web/channels are all explicitly NOT ready. The product is pre-revenue single-store operations software with entitlement/quota machinery, not a launched commercial SaaS.
6. **Brand/legal honesty matters to identity.** The commercial name `Pawstia PMS` is only a candidate (initial collision screening passed, not legal clearance), the publication one-pager is explicitly `DRAFT — DO NOT PUBLISH`, and LINE OA + website are `TBD`. Identity must therefore be stated as "pet-hotel daily-care operations OS (candidate brand)" and NOT as an established PMS brand.

---

## Risks/failure cases

- **Treating Phase 13 CI closure as market-validated.** CI is green, but no independent Phase 13 reviewer file exists and no real store has used the system. Adopting a "product is done" posture would conflate technical closure with market fit — the brief's core rule.
- **Breadth creep before validation.** Adding grooming scheduling, clinic/pharmacy, billing/SlipOK, multi-branch, Drive backup, or full multi-camera into V1 would dilute a sharp loop into a generic, unmaintainable suite and burn the founding-store feedback window.
- **Wrong buyer focus.** If the team optimizes for the pet *owner* (B2C) rather than the storefront operator who pays, retention weakens; B2C comfort derives *from* the operator's daily loop, not instead of it.
- **Payment/ops gates ignored.** A store cannot be charged reliably until payment, trial-expiry, suspension/reactivation, monitoring, backup/restore, incident/support, and legal (ToS/Privacy/DPA) are real. Launching on Phase 13 alone is a paid-ops failure case.
- **Brand/channel risk.** Unclaimed LINE OA + `TBD` website + uncleared trademark means the product cannot legally/publicly present itself as "Pawstia PMS" today; publishing early invites trademark and channel-ownership problems.
- **Single-customer concentration.** Pricing at 990–1,490 THB/mo implies the business needs many stores or strong add-ons to be viable; the H1–H4 hypotheses (30-store interviews, >40% conversion, WTP) are still unvalidated — the entire GTM rests on them.
- **Secret-management assumption leak.** Per-shop LINE tokens in server-side env config is not Supabase Vault; anything that treats Vault as current (vs target) overstates production security posture.

---

## Assumptions

- The gate question is asking for a recommendation on what V1 is and where it ends, not for a go/no-go vote on the overall program — per the brief I do not issue a gate verdict.
- Module Hub overlap is irrelevant to this answer because the canonical scan is `HOLD`; I rely on the repo's recorded `ADAPTER ONLY / COPY` posture and PRD-native behavior being authoritative (as the brief states: proven natively-Pawstia domain behavior is not displaced by naming similarity).
- "Pet PMS" breadth (clinic, grooming, billing, multi-branch, camera platform) is judged non-defining for V1 consistent with the repo's own PRD non-goals and Stage D placement; I did not re-derive a different scope.
- Phase 13 CI run `33743691064` being green is treated as *engineered closure evidence* and *not* as commercial readiness; I verified it directly via `gh run view`.
- Pricing/GTM figures and Decision C2 come from the repo docs (BUSINESS_MODEL, PRODUCT_ONE_PAGER) and are assumed accurate as of the reconciliation; I did not independently validate Thai market willingness-to-pay.

---

## Open questions/missing evidence

- **Independent Phase 13 reviewer PASS is missing.** CI is green and `PHASE13_IMPLEMENTATION_EVIDENCE.md` exists, but there is no `REVIEW-phase13-*.md` and no separate independent verdict; Phase 13 is therefore "engineered/CI-closed" but not "independently closed." Is that deliberate, and is an independent Phase 13 review planned before any Stage C gate?
- **Real-store Closed Beta evidence is entirely absent.** No store has onboarded/imported, booked, sent Daily Reports, or paid. Without H1–H4 data (interviews, conversion, WTP, staff learning curve, support burden) the core GTM assumptions are untested.
- **Payment provider/rail, trial-expiry, upgrade/downgrade, suspension/reactivation, and reconciliation contracts are undefined** (PS-SR-07 not locked). Which provider/rail is intended?
- **Production topology** (staging, deploy/rollback, monitoring, backup/restore RTO/RPO, incident/support processes) is documented as required but not built; no evidence of any staging or production deployment.
- **Formal legal/trademark/corporate-operator clearance** and production LINE OA + website are not confirmed; publication status is DRAFT.
- **Module Hub overlap** could not be evaluated this gate because the canonical scan is on HOLD; that scan is deferred to later Portfolio Arbitration.
- Whether Warm Hospitality redesign is behavior-frozen relative to business/schema/RLS/entitlement (the repo says it must be) and what its delivery impact on PS-SR-01 sequencing is.

---

## Confidence 0-100

**82/100.** Confidence is high on the recommendation itself (the product's defining identity as a Thailand-first single-location pet-hotel daily-care OS with a LINE-native report loop and Google Sheets ownership replica is fully consistent across PRD, One-Pager, Roadmap, and Sell-Ready brief; verified against actual Git/CI/review evidence). The deduction reflects: (a) no independent Phase 13 review yet recorded, (b) zero real-store Closed Beta / market evidence, (c) all payment/legal/operations launch gates still open — so the *identity and V1 boundary* are well-evidenced, but any claim about commercial readiness or market fit would be low-confidence and is explicitly out of this gate's scope.
