# SaaS Product Hub - Current Portfolio Status

**Reconciled:** 2026-09-02 (Asia/Bangkok)
**Parent repository:** `Gutumrod/saas-product-hub`
**Parent branch/HEAD before this pass:** `master @ 01a8156`
**Execution authority:** `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md` revision 3 + later explicit owner decisions
**Purpose:** current-state overlay. This file does not replace product PRDs, architecture contracts, gate evidence or historical daily logs.

## Portfolio Gate State

| Gate / Dependency | Current state |
|---|---|
| P0a-C1 Portfolio foundation | **NOT PASSED** - `hub-web` CI is green; CM01 owning CI is red at `ff15819` with 2 Linux date/timezone failures |
| Booking Stage 4 migration-history reconciliation | **CLOSED** at Booking `836943a`; do not repeat |
| Pawstia Project B admission | **NOT YET ADMITTED** - PS-A2 may proceed when dispatched; schema-scoped migrations/RLS/grants/denial evidence + explicit authorization still required |
| R15 Hub DB least privilege | **OPEN / PRE-DATA GATE** - live Hub runtime must move off Project A `postgres` owner access to scoped `hub_web_app`, with billing-schema denial proof |
| billing-core migration `0001` | **QA REQUIRED / DO NOT APPLY** |
| Pawstia Phase 13 | **NOT CLOSED** - verification branch exists; CI failed historical Phase 1 isolation regression before downstream matrix completed |
| DocCraft Gate 3 / Gate 4 | **CLOSED locally with evidence**; Phase 4.1 waits on portfolio gate + mandatory intake |
| Payment/billing architecture | **Direction reconciled** - centralized billing-core remains authoritative; 2026-09-01 council adds Stripe-card recurring + PromptPay manual rail + mandatory reconciliation, not a competing core |

## Today's Portfolio Order

1. **CM01 / booking-ticket-module - bounded track:** fix the two CI date/timezone regressions, obtain fresh green owning CI, then reassess P0a-C1.
2. **Documentation reconciliation:** preserve current product status/daily/brief files and reconcile WSTERA Link billing docs against the Payment Council without opening implementation.
3. **WSM owner gate:** current repo is synchronized; only explicit Documentation Lock authorization remains before a Phase 1 brief can be prepared.
4. **R15:** activate as a separately scoped security remediation after the current bounded track; do not mix it with Control Plane Demo V2.
5. **Booking:** resumes as the heavy track only after P0a-C1 passes, under the existing focus gate.
6. **Pawstia:** Phase 13 verification and PS-A2 admission remain separate gated tasks; neither is implied complete by Booking Stage 4 closure.

## Final Seven Production Tracks

| Code | Product | Current execution state |
|---|---|---|
| BK01 | Booking | BK-A remediation queued after P0a-C1; Stage 4 closed; CONT-03/DB gates still open |
| PS01 | Pawstia | Phase 13 verification not closed; Project B admission not yet authorized |
| LK01 | WSTERA Link | Pre-build; hybrid billing/PromptPay documentation reconciliation in progress; implementation hold |
| DC01 | DocCraft | Gate 3/4 closed locally; Phase 4.1 mandatory intake next only after portfolio gate |
| MT01 | Multi-Tenant AI | Reference server only; deferred to P5/L0-L5 productization |
| CM01 | Booking Ticket Module | **Current P0a-C1 blocker** - CI 59/61 |
| HC01 | Headless Commerce | Deferred to P5 except explicitly authorized HC-A cleanup |

## Extended Portfolio / Incubation

- `LN01 line-oa-ai`: legacy maintenance; real LINE sandbox proof absent.
- LINE OA AI Sales & Service Engine: Phase 1 code gate PASS; W0-W2 foundation ready when scheduled; state-changing Phase 2 blocked by real LINE gate.
- `TT01 ticket-tracking-relay`: functional demo/MVP; JSON persistence/in-memory sessions/no automated suite.
- `SB01 stripe-billing`: historical/internal reference only; must not compete with billing-core.
- `FF01`, `CA01`, `IO01`, `ET01`, `CO01`, `AR01`: prototype/internal tracks on hold pending explicit product contracts/work slots.
- `RM01 RentMatrix`: Phase 0 PASS; Phase 1 ready when scheduled.
- `OD01 OmniDesk`: Documentation + Phase 0 PASS; Phase 1 ready when scheduled.
- Money Leak Buddy: documentation-only behavior-first MVP contract; architecture/build gate not yet locked.
- `WS01 WSM`: independent Documentation Review PASS; repo synchronized; owner Documentation Lock decision pending. WSM is not yet declared into `docs/products/registry.yaml` as a catalog identity.

## Source Links

Every product repo now has:
- `docs/CURRENT_STATUS.md`
- `docs/daily/2026-09-02.md`
- `docs/daily/WORK-BRIEF-2026-09-02.md`

`apps/hub-web` has the equivalent current status and daily/brief under `docs/control-plane/`.

## Safety / Truth Rule

- Historical evidence stays historical; do not rewrite old PASS/FAIL records to look current.
- A current overlay may supersede a stale status sentence, but it cannot change an architecture/owner decision without an explicit decision record.
- No commit, push, merge, deploy, production DB apply or secret change is implied by this documentation reconciliation.
