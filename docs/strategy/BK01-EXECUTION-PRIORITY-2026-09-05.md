# BK01 Execution Priority — Owner Direction after Order Council

**Date:** 2026-09-05
**Authority chain:** Owner decision -> Codex `PORTFOLIO_PRODUCTION_MASTER_PLAN.md` -> product locked contracts -> current repository evidence.
**Purpose:** decide when BK01 should run relative to the rest of the portfolio and separate Booking-core work from Order expansion.

## Executive decision

**Start/resume BK01 now as the portfolio heavy track.**

This is not a revenue/demand reordering. It follows the Codex master plan's dependency/maturity/risk sequence: P0a-C1 is already PASS and the plan explicitly places BK01 as the first P2 heavy track.

No other product must finish before BK01 core resumes.

BK01 Order Phase 0A/0B has now completed as the bounded documentation track: Product Boundary LOCKED, Order V1 Contract LOCKED, Reuse Gate PASS and MT01 Bootstrap PASS. The bounded slot is returned. Order production implementation remains blocked.

## Why BK01 is first

Codex master plan §5/P2 says: run BK01 as the heavy track and CM01 as the bounded track after P0a-C1 and each repository's P0b readiness.

Codex §7 engineering sequence also puts `Hub hardening + BK01 production hardening` before DC01/PS01, MT01, LK01 and HC01.

Parent `docs/CURRENT_STATUS.md` independently records BK01 as `NEXT ELIGIBLE HEAVY TRACK` after P0a-C1 PASS.
## Current BK01 evidence

Current booking repo branch: `feature/bk-a-v1-contract-remediation`.
Implementation baseline before the Phase 0 documentation checkpoint: `213360a`. Phase 0A/0B product documentation is committed in the Booking repository at `82b297d`.

Latest verified BK-A evidence shows:

- non-DB unit/static tests: PASS 19/19;
- lint: PASS, zero errors;
- consumer + admin production builds: PASS;
- independent Codex review: PASS, zero P0/P1 code/design defect;
- Booking Stage 4 migration-history reconciliation: CLOSED;
- CONT-04 DB-backed gates: still `BLOCKED_ENVIRONMENT`;
- no production deploy or remote DB apply is proven.

This means BK01 is mature enough to remain the heavy track, but not release-complete.

## Heavy-track sequence — BK01 Booking core

1. Refresh current branch/HEAD/evidence without rerunning already-closed non-DB remediation unnecessarily.
2. Close or explicitly resolve the approved DB/runtime path for CONT-04 without installing Docker on the active Windows host.
3. Execute DB-backed migration/RLS/tenant/concurrency/provider evidence in the approved runtime.
4. Close BK-A baseline with independent evidence.
5. Complete BK-B automated release gate / P0b repository release-readiness requirements.
6. Continue deployment, external-system, recovery/operations and pilot work toward BK-L1 / P2-C2.
7. Record Owner GO / NO-GO / CONDITIONAL at the Booking release checkpoint.
## Completed bounded track — BK01 Order Phase 0

The bounded slot was used for Order governance/documentation and is now closed:

### Phase 0A
- dated Product Boundary Decision;
- bounded ICP definition;
- supersede/amend/preserve map;
- sequencing decision and no-build boundary.

### Phase 0B
- Order V1 lifecycle and data contract;
- capacity/ready-date semantics;
- security/RLS/audit/failure cases;
- capability activation behavior;
- Order payment vs Booking deposit separation;
- many-to-many-capable Order↔Booking link rules;
- formal Module Reuse Check and provenance plan;
- MT01 Bootstrap Check record;
- acceptance criteria and explicit non-goals.

Exit condition achieved: Phase 0A/0B artifacts are locked and `Reuse Gate: PASS`. Stop Order work here; the freed bounded slot is not automatically reassigned.
## When may Order implementation actually start?

### Default / recommended trigger
Do **not** let Order implementation delay the existing Booking V1 release path. Finish the current Booking heavy track through its release/pilot checkpoint and record Owner `GO / NO-GO / CONDITIONAL`; then open Order implementation as the next BK01 capability track.

### Earliest exceptional trigger
If Owner later decides Order must begin before Booking's release checkpoint, all of these must be true first:

1. BK-A closed with DB-backed baseline evidence;
2. BK-B automated release gate / repository release readiness closed;
3. Phase 0A/0B contracts locked;
4. formal Reuse Gate = PASS;
5. MT01 Bootstrap Check recorded;
6. Order implementation branch/migration baseline is isolated from the closed Booking baseline;
7. Owner explicitly authorizes overlap and accepts focus/release-delay risk in writing.

Without all seven, Order implementation remains `BLOCKED`.

This is stricter than the council's minimal `BK-A/DB baseline + Reuse Gate` wording because Codex master-plan risk R1 explicitly requires BK-A/B closure before feature expansion.
## Portfolio priority while BK01 is active

| Priority | Track | Decision |
|---:|---|---|
| 1 | **BK01 Booking core** | ACTIVE HEAVY TRACK now. Resume BK-A/CONT-04 -> BK-B -> release/pilot path. |
| 2 | **BK01 Order Phase 0A/0B** | **CLOSED / LOCKED bounded track.** Reuse Gate PASS; implementation remains blocked. |
| 3 | **CM01** | Eligible to use the now-free bounded slot under Codex P2 only if Owner/parent explicitly dispatches it; no automatic start from this closeout. |
| 4 | **DC01 / PS01** | Next heavy products under P3 after the BK01 release checkpoint; DC01's existing closeout/print-gate maturity makes it the natural first P3 closure, with PS01 following/parallel only within the focus gate. |
| 5 | **MT01** | Productize after existing SaaS applications per Codex sequence. Also used now only as a bootstrap/reference check for Order Phase 0B. |
| 6 | **LK01** | Implementation follows stable P0/P1/billing boundaries; do not displace BK01 now. |
| 7 | **HC01** | Deferred to P5 except already-authorized HC-A cleanup. |
| Hold | **WS01 / other outside-master-plan tracks** | May retain locked documentation/evidence, but the accepted Layer Model does not authorize WS01 dispatch and it must not displace the current heavy/bounded slots without a new Owner sequencing decision. |

## Focus rule

At most one heavy track + one bounded track are open. While this plan is active:

- heavy = BK01 Booking core;
- bounded = FREE after BK01 Order Phase 0 closeout;
- no third active build/governance track should be opened merely because it is small or nearly finished.