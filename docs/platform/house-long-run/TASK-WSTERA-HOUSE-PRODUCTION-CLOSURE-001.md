# TASK — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Status: T5 PENDING / **OWNER_HOLD** — code-only deploy + live proof COMPLETE; R15 apply blocked on provisioning authority
Workflow ID: WF-DEV-01
Workflow Spec Version: 1.3.0
Execution Mode: LONG_RUN
Runtime Procedure: kanban-external-agent-dispatch v2.5.3
Repository: Gutumrod/saas-product-hub
Workspace: D:\AI-Workspace\projects\saas-product-hub
Branch / Worktree: work/house-production-closure-longrun-20260919 / D:\AI-Workspace\projects\saas-product-hub
Base Commit: 01cfc28dbb9ea8081f389240d57797c70cda7d9b
Current Commit: hub-web `679ff279e5ff2a9a3006bea79ccc6ccde90715ec` (frozen candidate, deployed at `00bdb1b5`)
House Records Revision: `34400c2ad7557050865b614fcdc613b33d3de498` (evidence set at the stop), then `b8c6a20` (this checkpoint update)
Note: House HEAD moves whenever this checkpoint file is updated, so it is deliberately not asserted as a single
  scalar; the authoritative frozen revision for the candidate lives in `T5-CANDIDATE-FREEZE-2026-09-20.md`.
Owner: Free
Commander: NONE
Coordinator: Hermes
Current Worker: `00bdb1b5-70d2-4e41-b97d-f1f238e9bf31` (LIVE) · rollback target `9db4fb70-a5e5-4989-94b5-1d271ab10055`
Current Checkpoint: CP-10 T5/B5 closure — OWNER_HOLD
Current Stage: T5
Current Work Unit: R15 D0-D4 COMPLETE — schema remediated, hub_web_app live, DATABASE_URL switched, runtime verified
Current Review Batch: B5
Current State: OWNER_HOLD
Run Manifest: docs/platform/house-long-run/RUN-MANIFEST-WSTERA-HOUSE-PRODUCTION-CLOSURE-001.md @ f84a59c5d602ca37c95727997a0d63a709ddd63e
Latest Dispatch: B5 closure -> agent-codex OWNER_DECISION_REQUIRED at hub-web 679ff27 (deployed)
Dispatch Revision: docs/platform/house-long-run/B5-CLOSURE-REVIEW-REPORT-CODEX-2026-09-20.md
Latest Reviewer Packet: docs/platform/house-long-run/R15-D4-EVIDENCE-CLOSURE-2026-09-21.md (current)
Expected Stop: READY FOR OWNER HOUSE CLOSURE REVIEW — WSTERA-HOUSE-PRODUCTION-CLOSURE-001
Next Allowed Action: R15 D0-D4 COMPLETE (schema remediated 9/9, hub_web_app scoped role live, DATABASE_URL switched, runtime verified, Worker 9a004fa9). Per the manifest, a fresh B5 independent re-review of this exact deployed state is required next, then T6.

## Objective

Close the WSTERA House/shared-platform critical path under the approved LONG_RUN manifest while SB01 continues in its separate lane.

## Source of Truth

1. `docs/platform/house-long-run/BRIEF-WSTERA-HOUSE-PRODUCTION-CLOSURE-LONG-RUN-2026-09-19.md`
2. `docs/platform/house-long-run/RUN-MANIFEST-WSTERA-HOUSE-PRODUCTION-CLOSURE-001.md @ f84a59c5d602ca37c95727997a0d63a709ddd63e`
3. `AGENTS.md`
4. `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md`
5. current exact repository/runtime evidence
6. current `Gutumrod/wstera-workflows` registry/policies pinned by the Brief

## Brief

House only. No product-specific implementation.

Primary stage sequence:

```text
T0 House reconcile
T1 R15 least privilege
T2 product-event signer hardening
T3 shared fulfillment
T4 accepted SB01 LR-2F -> Control read projection
T5 production readiness + controlled apply/deploy/live proof
T6 final House reconciliation + product-lane dependency matrix
```

SB01 implementation remains external. T4 waits for an exact accepted LR-2F contract; T1-T3 may continue while SB01 proceeds.

## Current Review

No implementation/review round has started under this Task.

Known starting refs:
- House prior coordination base: `01cfc28dbb9ea8081f389240d57797c70cda7d9b`
- House `master` observed at brief creation: `1556d8a29ce5fa2f408bed981f26d9ef7d61aa33`
- Hub/Control base branch: `Gutumrod/hub-web:feature/platform-control-plane @ 125af8435f4c80b9525c72405b44807206905fc5`
- Hub/Control LONG_RUN branch: `work/house-platform-closure-20260919`
- SB01 external state observed: LR-2E closed/PASS; LR-2F next.

PRE-01 must reverify these before execution. If exact remote refs changed materially, persist the delta and apply manifest invalidation/hold rules; do not silently assume old refs.

## Checkpoints

| Checkpoint | Status | Worker / Reviewer | Dispatch / Evidence | Stop / Result |
|---|---|---|---|---|
| CP-01 Flow Selection | PASS | Owner / coordinator | Brief + Workflow Registry v1.5.0 | WF-DEV-01 v1.3.0 LONG_RUN + Relay v1.3.0/v2.5.3 |
| CP-02 Brief | PASS | Owner | BRIEF-WSTERA-HOUSE-PRODUCTION-CLOSURE-LONG-RUN-2026-09-19.md | Owner approved |
| CP-03 Manifest Lock | PASS | Owner | RUN-MANIFEST... @ f84a59c5 | APPROVED |
| CP-04 PRE-01 | PASS | Hermes | EVIDENCE-PRE01-T0... §1 | PASS — 1 runtime repair (`RELAY_INSTALL_MANIFEST_MISSING_MODEL_PINS`), opencode UNAVAILABLE (deviation D-1) |
| CP-05 T0/B0 | **PASS / B0 BATCH_APPROVED** | Hermes / Codex | B0-REVIEW-CLOSURE-2026-09-19.md | T0 reconciled at `a502421`; B0 approved at `28f571d`, 0 blocking |
| CP-06 T1/B1 | **T1 GATE PASS / B1 PENDING** | swarm lanes 03–06 / Codex | T1-R15-* artifacts | 4/4 artifacts on disk; Owner RLS ruling applied |
| CP-07 T2/B2 | **PASS / B2 BATCH_APPROVED** | swarm-builder lanes / Codex | B2-REVIEW-CLOSURE-2026-09-20.md | Signer contract delivered at hub-web `e24d5a9`; 0 blocking |
| CP-08 T3/B3 | **T3 DELIVERED / B3 PENDING** | swarm-builder lanes / Codex | T3-CLOSURE-2026-09-20.md | Fulfillment at hub-web `ae29d20`; 272/272 tests |
| CP-09 T4/B4 | **PASS / B4 BATCH_APPROVED** | Claude lanes / Codex | B4-REVIEW-CLOSURE-2026-09-20.md | Control read projection at hub-web `381fef3` (5 review rounds, 0 blocking final) |
| CP-10 T5/B5 | READY | (T5 workers TBD) / Codex | pending | production/live evidence approval required |
| CP-11 T6/B6 | PENDING | OpenCode/Hermes/Codex | pending | final House closure packet |
| CP-12 Owner Closure | PENDING | Owner | final packet | final authority |

## LONG_RUN State

```text
Manifest Revision: f84a59c5d602ca37c95727997a0d63a709ddd63e
Stage State: REVIEW_REQUIRED (B3)
Issue Fingerprint: closed — T3_IMPLEMENTATION_TURN_BUDGET_EXHAUSTED_BEFORE_CORE_SERVICE, then six mechanical defects, all fixed across six bounded lanes
Local Fix Attempts: 1/2 (T3 scope bug)
Reviewer Remediation Attempts: 0/2 (this cycle)
Senior Escalations: 0/1
Primary Reviewer Status: Codex — B0-B4 BATCH_APPROVED (B1 2 rounds, B2 2 rounds, B3 2 rounds, B4 5 rounds); B5 predeploy BATCH_APPROVED (7 rounds); B5 closure OWNER_DECISION_REQUIRED
Active Independent Reviewer: NONE
```

## PRE-01 Required Evidence

Before T0-WU01:
- verify canonical Relay skill path/version/hash = runtime v2.5.3
- verify effective Hermes runtime home
- verify work type = DIRECT-APPROVED
- verify Brief/Manifest readable and exact revisions
- verify Owner approval exists
- resolve and pin local coordination worktree + hub-web worktree
- fetch remotes and record exact branch/upstream/head/dirty state
- verify no overlapping external write scope
- verify OpenCode, Qwen, Codex readiness before they are selected
- verify Claude readiness only before an authorized difficult-remediation/fallback-review use
- failure behavior = STOP
- production-readiness standard pinned
- no secrets printed

PRE-01 failure => HOLD with exact blocker/evidence. No worker dispatch.

## Evidence

Initial evidence:
- Brief commit: `c5fd93b5bbe1a23020bb1d4f54992dac5873c51c`
- Manifest commit: `f84a59c5d602ca37c95727997a0d63a709ddd63e`
- House LONG_RUN branch created from prior House/SB01 coordination head.
- Dedicated hub-web closure branch created from `125af8435f4c80b9525c72405b44807206905fc5`.

## Decisions

- House only; product implementation prohibited.
- SB01 remains separate; House consumes only accepted LR-2F output.
- Use current role model: OpenCode ordinary builder, Qwen support/testing, AGY UI only, Codex reviewer, Claude difficult remediation only.
- Do not pause for normal technical failures; use manifest/runtime auto-recovery.
- Final House closure remains Owner authority.

## Blockers

Current expected external dependency only:
- T4 waits for exact accepted SB01 LR-2F projection contract.

This does not block T0-T3.

## Next Action

Hermes performs PRE-01 and, on PASS, starts T0-WU01.

