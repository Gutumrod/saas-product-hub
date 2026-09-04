# PS01 — Product Gate Candidate B

_(anonymized candidate; identity withheld from synthesizer)_

---

# Council Product Gate — PS01 Pawstia — C Expert Answer

Independent expert assessment for the frozen brief `llm-council-gate v0.3.2`.
Gate question: **What exactly should Pawstia PMS be, for whom, and where does V1 end?**
This document is an expert contribution, not a Council gate verdict, and does not treat technical closure as market fit.

Repository inspected directly on verify branch `verify/phase13-closure-2026-09-01` @ local HEAD `fdd10e7` (which also equals origin `refs/pull/4/head`).

---

## Recommendation

Pawstia PMS is, and should stay in V1, a **single-location Pet Hotel / Pet Daycare Management OS for Bangkok-area pet-hostelry operators**, not a generic property/business PMS. Its authoritative identity is the **"Pet Hotel OS"** that lets frontline staff run a collision-free daily stay lifecycle from an iPad/phone and deliver a professional multi-photo Daily Care Report into each pet owner's existing LINE chat, while the shop keeps a durable ownable copy of its customer and booking data in its own Google Sheets.

**V1 scope ends at:** (1) authoritative room matrix + booking/check-in/check-out/cleaning/maintenance lifecycle with database-level double-booking and pet no-overlap prevention; (2) Daily Care Report (food/excretion/mood status + 1–4 photos) delivered to LINE with idempotent retry; (3) the Google Sheets one-way pet-centric export replica as the data-ownership guarantee; (4) single-store tenant/staff authorization; plus the enabling layers already built (verified LINE identity claim, onboarding/CSV import, owner/manager dashboard, subscription/entitlement/quota enforcement). **V1 explicitly excludes** clinic/pharmacy, grooming scheduling, slip/payment/e-tax, Google Drive photo sync, digital pet passport, full multi-branch control, and the advanced RTSP/HLS multi-camera platform.

Recommended next identity decision: keep the V1 commercial identity narrower than "PMS" — position it as **"Pet Hotel/Daycare OS"** (single-store) and let the broader multi-branch / multi-service PMS expand only from validated closed-beta and paid demand (Roadmap Stage D), never pre-emptively. Do not admit any Module Hub capability by naming similarity; retain Pawstia's authoritative Postgres RPC/RLS domain as the source of truth.

---

## Verified facts / evidence used

Product identity & positioning:
- `docs/PRODUCT_ONE_PAGER.md` positions it as "Pet Hotel OS" solving three pains: double-booking risk, fragmented per-carer LINE photo delivery, and data lock-in fear; targets pet hotels/daycares; pricing 990/1,490/2,490 THB/mo.
- `docs/PRD.md` authoritative statement: single-store Pet Hotel & Pet Daycare Management OS; three V1 goals map 1:1 to the operation loop, Daily Report in ≤15 s, and Sheets data ownership; explicit non-goals include clinic/pharmacy, grooming queue, SlipOK/billing/e-tax, Google Drive photo sync, digital pet passport/full RTSP-HLS camera, multi-branch.
- `README.md` and `docs/BUSINESS_MODEL.md` confirm the single-location V1 focus and B2B subscription packages with B2C pet-owner value delivered through LINE.

Core daily loop & authoritative contracts (verified in `docs/PRD.md`, `docs/SYSTEM_ARCHITECTURE.md`, and migration `20260825141500_phase13_subscription_lifecycle.sql` / `...141600...` / `...141700...`):
- Authoritative Security-Definer RPC gateway pattern; no generic browser CRUD on invariants (`docs/SYSTEM_ARCHITECTURE.md` Table at §2 and PRD §3).
- `create_booking` / `update_booking_status` strict linear lifecycle `confirmed→checked_in→checked_out` with `confirmed→cancelled`, illegal-transition rejection; pet no-overlap (Decision 2A); deterministic lock ordering; same-owner invariant (1A); date/room capacity/maintenance revalidation; LINE claim TTL/consume-server-only (Decision 6A); multiple Daily Reports with atomic technical idempotency (Decision 5A) and persistent retry-key reuse; Google Sheets binding proof-of-control + system-owned transactional outbox (Decision 9A).

Feature breadth actually implemented (verified from `supabase/migrations/` inventory and `lib/`):
- Room setup/status/maintenance, booking + check-in/out/cleaning, pet/owner CRM, Daily Report media+storage+LINE retry (`lib/daily-report-*`, `lib/line-*`), Google Sheets replica (`lib/google-*`), bounded tenant-scoped visitor camera (Phase 8), owner/manager dashboard + entitlements (`lib/dashboard-service.ts`, `lib/entitlements.ts`), customer LIFF self-booking (Phase 11), onboarding + CSV import/audit (Phase 12, `lib/csv-import-service.ts`, `lib/pilot-readiness-service.ts`), subscription lifecycle + authoritative quota (Phase 13).

Verification / CI evidence (checked live, not stale):
- `docs/CURRENT_STATUS.md` (2026-09-02) predates today's closure work: it records Phase 13 NOT CLOSED and the earlier Phase 1 isolation regression failure. It is now superseded by newer evidence.
- `PHASE13_IMPLEMENTATION_EVIDENCE.md` (2026-09-03, committed `6527987`) records the remediation (`f48637d` drop-constraint-then-normalize order; `d6f4acf` deterministic Phase 7 fixture ordering) and a successful full isolated CI matrix.
- GitHub Actions run **`33743691064` verified via `gh run view` as `conclusion: success, status: completed`** — fresh migration replay, DB lint, Phase 1/2/3 historical regressions, current-schema pgTAP suites, Phase 13 quota concurrency races, legacy `trial→trialing` normalization probe, TypeScript suites, Phase 10 browser E2E, typecheck/lint/build/`git diff --check` all success.
- PR **#4 still Draft/Open** against `master`; `refs/pull/4/head` = `fdd10e7`, matching the local verification HEAD. No merge, no remote migration apply, no deployment. This is isolated-CI evidence only.

Independent reviews (from repo `REVIEW-*.md`): Phase 8 / 9 / 10 / 11 / 11.1 / 12 all closed with reviewer PASS and executable evidence (e.g., Phase 10 E2E 8/8 and 179 TS assertions; Phase 12 88/88 + addendum fixes to phone normalization and Sheets formula-injection escaping).

Commercial / operations status (verified):
- `docs/COMMERCIAL_READINESS.md`: core product checked; payment collection NOT implemented (by design, Phase 9/11 scoped out); upgrade/downgrade, trial-expiry, suspend/reactivate rules NOT defined; monitoring/backup-restore/incident/support, Terms/Privacy/DPA/subprocessors, formal trademark, production channel all still open.
- `docs/PRODUCT_OPERATIONS.md` (framework only): requires staging before production, monitoring of app/DB/LINE/Sheets/storage/auth failures, backup/recovery decisions, incident severity model, support process before GA.
- `docs/ROADMAP.md`: Stage A core product implemented (1–13); Stage B Closed Beta (1→3→5→10 stores) not started as a live validation; Stage C Paid Launch prerequisites not met; Stage D expansion only from validated demand. Notes Phase numbering (1–13) is distinct from commercial Stage numbering (A–D).
- `docs/ONBOARDING_SOP.md`: a coherent 4-step daily workflow and customer LINE claim (TTL 48h) documented — operational readiness for onboarding exists as a spec.

Module Hub overlap (inspected `D:\AI-Workspace\projects\modules-hub`):
- Module Hub INDEX/REGISTRY is a read-only copy-and-own library, explicitly "must not import across paths" and "adapter must never replace the target's authoritative tenant-scoped Postgres authority."
- Overlap is mostly nominal: generic `subscription`/`payment`, `auth`/`auth-supabase`, `tenant-context`, `line-oa-ai-module`, `audit-log`, `import-export`, `job-retry`. Pawstia's domain behavior (booking lifecycle invariants, no-overlap concurrency, LINE claim + Flex delivery, Google Sheets replica) is implemented natively in Pawstia's Postgres migrations and `lib/` services, not inherited from any hub module. The repo's own Phase 12 review and README document Module Hub involvement only as ADAPTER-ONLY / copy-and-own (e.g., formula-injection protection re-tested on the real import→DB→Sheets path, not the standalone hub serializer).
- `docs/BRIEF-warm-hospitality-redesign.md` is DESIGN-only / PLANNED, states "Module Hub gate: NOT NEEDED", and is explicitly not the paid-readiness critical path.

---

## Key reasons

1. **The buyer's strongest pain is operational trust on the daily stay loop, not management reporting.** The one-pager converges all three headline pains on "does the room double-book at festivals," "do owners reliably get today's report," and "can I get my data out." That is a hospitality execution problem, narrower and sharper than a general PMS. A generic PMS framing would dilute the "15-second Daily Report into the owner's LINE" wedge, which is the single most differentiated, defensible behavior.
2. **The architecture already encodes the correct narrower identity.** The entire mutation surface (`create_booking`, `add_pet_to_booking`, `create_daily_report`, claim/reset LINE, Google Sheets replica, subscription/quota) is purpose-built to a single-store pet hotel lifecycle. Re-titling this as a broad PMS would misrepresent what the 13 phases actually lock down.
3. **Core daily value/retention loop is the "stay loop," and it is fully implemented and now green on isolated CI.** The loop — check-in → room-no-collision → pet care data → Daily Report → owner receives LINE — is the product-defining behavior. Retention depends on the shop depending on it daily and owners valuing the LINE card.
4. **Product-defining vs optional breadth is now clear from the implementation evidence.** Product-defining: collision-free booking engine, Daily Report + LINE delivery, Google Sheets data-ownership replica. Optional breadth (enablers/expansion, already built): owner/manager dashboard, LIFF self-booking, bounded camera, onboarding/CSV import, entitlements/quota. These enablers strengthen sell-readiness but none is the identity; the roadmap's Stage D (multi-branch, grooming, vaccine, advanced camera, add-ons) must only be entered from validated demand.
5. **The correct first commercial gate is Stage B Closed Beta with paid-production prerequisites held as a hard gate.** Pilot/value validation needs only a green Phase 13 + a live cohort (1→3→5→10 stores) measuring onboarding time, LINE delivery success, Sheets sync failure, staff learning curve, and willingness-to-pay (H1–H4 in `BUSINESS_MODEL.md`). Paid production additionally requires payment collection through the authoritative subscription transition domain, upgrade/downgrade/trial-expiry/suspend rules, real staging/production deployment, monitoring+backup/restore+incident+support, legal/DPA/trademark/brand-channel, and independent launch review + owner GO.
6. **Module Hub naming overlap must not be read as displacement.** The hub is a read-only library and explicitly cannot displace a target's authoritative Postgres authority; Pawstia's proven native domain behavior stands. Any future hub reuse must be copy-and-own into Pawstia and re-verified through Pawstia's real call paths, exactly as Phase 12 did for formula-injection protection.

---

## Risks / failure cases

- **Market-fit gap not yet validated.** H1–H4 (pain intensity, trial→paid conversion >40%, willingness-to-pay at 990–1490 THB, B2C add-on take-up) are entirely untested; there is no real-store evidence. Green isolated CI is not customer adoption — the biggest risk is treating Phase 13 closure as equivalent to a sellable product.
- **Operational/commercial production gates are all still open.** No payment collection, no upgrade/downgrade/trial-expiry/suspend rules, no monitoring/backup-restore/incident/support process, no Terms/Privacy/DPA, no formal trademark, no production channel. Launching Stage C before these would strand the product operationally.
- **Phase 13 green is isolated-CI-only and PR #4 is still Draft/unmerged.** The successful run `33743691064` is strong but was executed on an ephemeral isolated stack; until the verification PR is independently passed and merged and the migration is applied to a real non-production environment, "implemented but not independently CLOSED" remains the honest status.
- **Secret/credential hardening gaps.** Per-shop LINE tokens are server-side env-config (`LINE_CHANNEL_ACCESS_TOKENS_JSON`), not Supabase Vault; Google Sheets sync production credentials are not yet hardened. These are operational risks for a LINE/Sheets-dependent product before paid production.
- **Warm Hospitality redesign may consume verification capacity or introduce scope risk.** It is design-only/planned, and the prior prototype was reverted for hygiene (BOM, behavior creep). It must stay behavior-frozen and never be the paid-readiness critical path ahead of PS-SR-01 (Phase 13 closure).
- **Pricing/entitlement enforcement could backfire if quotas are tuned wrong.** Starter 10 rooms / 300 pets is enforced at the DB boundary now; an enforcement bug (over- or under-quota) during real beta would erode operator trust, which is the very trust the product sells.
- **Single-store scope is a deliberate cap; premature multi-branch would split effort** across a different scheduling/tenant problem before the core loop is proven in the wild.

---

## Assumptions

- I treat the repository's frozen product docs (`PRD.md` single-store Pet Hotel OS, `PRODUCT_ONE_PAGER.md`, `README.md`) as the authoritative product definition, in line with the brief and README source-of-truth priority.
- Phase 13 CI success on isolated runner `33743691064` is taken as strong verification of implementation correctness for the current-schema + regression matrix, but NOT as a product gate, deployment readiness, or market-fit conclusion. I did not re-run the CI myself (no mutation authorized).
- The "Warm Hospitality redesign is not critical path" prioritization in `BRIEF-sell-ready-execution.md` §2 and §6 is treated as the intended execution order.
- Commercial Stage B Closed Beta is the correct next real-world validation; Stage C Paid Launch is the earliest point at which "where does V1 end" is satisfied commercially.
- Module Hub is a library only; I assume no Pawstia feature currently imports hub code at runtime (verified absence of such imports in the top-level `lib/` and `app/` structure inspected).

---

## Open questions / missing evidence

- **Real-store behavior:** No evidence of any live pet hotel using the product; onboarding-time, LINE-delivery-rate, Sheets-failure-rate, staff-learning, support-burden, and conversion metrics are unmeasured.
- **Willingness-to-pay:** No pricing experiment has run; 990/1490/2490 THB and the Founding 10-r@990 Pro-forever offer are asserted, not validated.
- **Payment/commercial contract:** Payment rail, upgrade/downgrade table, trial-expiry handling, suspension/reactivation, cancel/refund/proration, reconciliation — all unresolved owner decisions with no approved transition table (`COMMERCIAL_READINESS.md` blanks).
- **Legal/brand:** Formal trademark clearance, DPA/subprocessor list, retention/DSAR, legal operator, production web address/routing, and official LINE OA handle are all TBD.
- **Operations:** No staging/production deployment, RPO/RTO, backup-restore drill, incident runbook, or support channel exists as executed evidence.
- **Vault adoption:** Whether Supabase Vault becomes the real per-shop secret store (and when) is not decided; today it is a target, not reality.
- **Phase 13 independent reviewer verdict / PR #4 merge:** The evidence doc says "independent closure evidence" but I found no separate reviewer verdict file for Phase 13 yet; the pass must come from an explicit independent review, and PR #4 remains unmerged.
- **Module Hub overlap depth:** I inspected the hub INDEX/REGISTRY and top-level structure; I did not diff every hub module against Pawstia's native logic. Naming overlap exists (subscription/payment/auth/tenant/LINE) but I found no evidence of runtime reuse displacing native behavior.

---

## Confidence

**74 / 100**

High confidence on *what the product is and should stay* (single-store Pet Hotel/Daycare OS; core stay loop is product-defining; V1 scope and non-goals are clearly documented and match the implemented architecture). Moderate-to-low confidence on *market reality* — none of the commercial hypotheses, willingness-to-pay, or operator adoption have been validated, and the paid-production prerequisites are largely unmet — so "where V1 ends" commercially is a forward-looking target contingent on the untested closed-beta evidence rather than a demonstrated fact.
