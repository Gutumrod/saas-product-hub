# TASK — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Status: T5 — **R15 D0-D4 EXECUTED AND VERIFIED**; Owner ruling A applied; awaiting B5 re-review of the corrected exact state
Workflow ID: WF-DEV-01
Workflow Spec Version: 1.3.0
Execution Mode: LONG_RUN
Runtime Procedure: kanban-external-agent-dispatch v2.5.3
Repository: Gutumrod/saas-product-hub
Workspace: D:\AI-Workspace\projects\saas-product-hub
Branch / Worktree: work/house-production-closure-longrun-20260919 / D:\AI-Workspace\projects\saas-product-hub
Base Commit: 01cfc28dbb9ea8081f389240d57797c70cda7d9b
Current Commit: hub-web `407130718646d13630b9789f68522a521fc74483` (includes schema remedy `0008`)
Deployed Worker: `5dc81232-c116-4722-a6c1-74c15ad50385` (LIVE)
Rollback-addressable: `9a004fa9` → `00bdb1b5` → `9db4fb70`
Credential note: the `hub_web_app` password was re-issued on 2026-09-21; see `R15-CREDENTIAL-REPAIR-INCIDENT-2026-09-21.md` and `R15-POST-CREDENTIAL-REPAIR-VERIFY-2026-09-21.txt`
Frozen review candidate (pre-remedy, historical): `679ff279e5ff2a9a3006bea79ccc6ccde90715ec`
House Records Revision: moves with each commit; the authoritative frozen *candidate* revision is `T5-CANDIDATE-FREEZE-2026-09-20.md`
Owner: Free
Commander: NONE
Coordinator: Hermes
Current Checkpoint: CP-10 T5/B5 — post-R15 re-review
Current Stage: T5
Current Work Unit: R15 D0-D4 COMPLETE — schema remediated (9/9 tables, 9/9 enums), `hub_web_app` live with the exact reviewed grants, `DATABASE_URL` switched, runtime identity verified
Current Review Batch: B5
Current State: IN_PROGRESS
Run Manifest: docs/platform/house-long-run/RUN-MANIFEST-WSTERA-HOUSE-PRODUCTION-CLOSURE-001.md @ f84a59c5d602ca37c95727997a0d63a709ddd63e
Latest Dispatch: B5 re-review #4 (post-R15 + Owner ruling A, Codex Windows Session-1) -> agent-codex WORKER_FIX (item 1 resolved; fresh D1 evidence produced)
Dispatch Revision: docs/platform/house-long-run/B5-RER15-REVIEW-REPORT-CODEX-2026-09-21.md
Latest Reviewer Packet: docs/platform/house-long-run/R15-D4-EVIDENCE-CLOSURE-2026-09-21.md (current) · `R15-CREDENTIAL-REPAIR-INCIDENT-2026-09-21.md` (credential re-issue)
Next Allowed Action: submit a short B5 re-review of the current state. Latest evidence: `R15-D1-FRESH-EVIDENCE-2026-09-21.txt` (PASS, from the corrected probe). T6 only on `BATCH_APPROVED`.
R15 state: D0-D4 EXECUTED — schema 9/9 tables and 9/9 enums; `hub_web_app` live with the exact reviewed grants; `DATABASE_URL` switched; runtime identity verified. Precise privilege claim: explicit grants = exact review matrix; effective privileges = exact matrix plus the recorded PostgreSQL PUBLIC-default exception on `user_role` (not granted by this task; does not confer access to `public.profiles`).
Expected Stop: READY FOR OWNER HOUSE CLOSURE REVIEW — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

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

B5 re-review, post-R15, on the corrected exact state.

- Reviewer route: Codex, Windows **Session-1** (readiness probe `CODEX_REVIEWER_READY`, `provenance_session = 1`) — evidence `B5-RER15-Codex-SESSION1-READINESS-2026-09-21.txt`
- Review #1 (post-R15): `OWNER_DECISION_REQUIRED` on the `user_role` effective privilege → Owner ruled disposition A
- Review #2 (post-ruling): `WORKER_FIX` — the D1 provision probe still carried pre-ruling wording/logic, and this checkpoint was stale
- Review #3 (post-fix): `WORKER_FIX` — the probe's assertion logic is now correct, but its grant-step header at `:64` is still un-qualified, and this file still had stale state sections

Known refs:

- House prior coordination base: `01cfc28dbb9ea8081f389240d57797c70cda7d9b`
- House `master` observed at brief creation: `1556d8a29ce5fa2f408bed981f26d9ef7d61aa33`
- Hub/Control base branch: `Gutumrod/hub-web:feature/platform-control-plane @ 125af8435f4c80b9525c72405b44807206905fc5`
- Hub/Control LONG_RUN branch: `work/house-platform-closure-20260919 @ 4071307`
- SB01 external state: LR-2F-A accepted @ `96abe08`; consumed by T4.

## Checkpoints

| Checkpoint | Status | Worker / Reviewer | Dispatch / Evidence | Stop / Result |
|---|---|---|---|---|
| CP-01 Flow Selection | PASS | Owner / coordinator | Brief + Workflow Registry v1.5.0 | WF-DEV-01 v1.3.0 LONG_RUN + Relay v1.3.0/v2.5.3 |
| CP-02 Brief | PASS | Owner | BRIEF-WSTERA-HOUSE-PRODUCTION-CLOSURE-LONG-RUN-2026-09-19.md | Owner approved |
| CP-03 Manifest Lock | PASS | Owner | RUN-MANIFEST... @ f84a59c5 | APPROVED |
| CP-04 PRE-01 | PASS | Hermes | EVIDENCE-PRE01-T0... §1 | PASS — 1 runtime repair (`RELAY_INSTALL_MANIFEST_MISSING_MODEL_PINS`), opencode UNAVAILABLE (deviation D-1) |
| CP-05 T0/B0 | **PASS / B0 BATCH_APPROVED** | Hermes / Codex | B0-REVIEW-CLOSURE-2026-09-19.md | T0 reconciled at `a502421`; B0 approved at `28f571d`, 0 blocking |
| CP-06 T1/B1 | **PASS / B1 BATCH_APPROVED** | swarm lanes 03–06 / Codex | T1-R15-* artifacts, B1-REVIEW-CLOSURE-2026-09-20.md | Owner RLS ruling OPTION 3 applied; 4/4 artifacts; 2 review rounds |
| CP-07 T2/B2 | **PASS / B2 BATCH_APPROVED** | swarm-builder lanes / Codex | B2-REVIEW-CLOSURE-2026-09-20.md | Signer contract delivered; 2 review rounds |
| CP-08 T3/B3 | **PASS / B3 BATCH_APPROVED** | swarm-builder lanes / Codex | T3-CLOSURE-2026-09-20.md, B3-REVIEW-OUTCOME-2026-09-20.md | Fulfillment hardened after senior remediation; 2 review rounds |
| CP-09 T4/B4 | **PASS / B4 BATCH_APPROVED** | Claude lanes / Codex | B4-REVIEW-CLOSURE-2026-09-20.md | Control read projection at hub-web `381fef3` (5 review rounds, 0 blocking final) |
| CP-10 T5/B5 | **T5 WU01–WU06 DONE / R15 D0–D4 DONE / B5 predeploy BATCH_APPROVED (7 rounds) / B5 post-R15 re-review #3 = WORKER_FIX** | Hermes (operator) / Codex | B5-*-REVIEW-REPORT-CODEX-*, B5-RER15-*, R15-D0..D4 records | deploy live `5dc81232`; WU06 16/16; R15 applied and verified; 2 wording/checkpoint items outstanding |
| CP-11 T6/B6 | PENDING — blocked on B5 `BATCH_APPROVED` | OpenCode/Hermes/Codex | T6-WU01..03 prepared | final House closure packet |
| CP-12 Owner Closure | PENDING | Owner | final packet | final authority |

## LONG_RUN State

```text
Manifest Revision: f84a59c5d602ca37c95727997a0d63a709ddd63e
Stage State: T5 post-R15 B5 re-review (BATCH_APPROVED required to enter T6)
Issue Fingerprint: open — B5 #4: fresh D1 evidence required from the corrected probe (now produced: R15-D1-FRESH-EVIDENCE-2026-09-21.txt)
Local Fix Attempts: 3/3 on the wording sweep (sweep applied instance-by-instance; root cause = scripted
  replace appended a duplicate field instead of replacing, so the file was never read whole)
Reviewer Remediation Attempts: 0/2 (this cycle)
Senior Escalations: 0/1
Primary Reviewer Status: Codex — B0–B4 BATCH_APPROVED; B5 predeploy BATCH_APPROVED (7 rounds);
  B5 closure OWNER_DECISION_REQUIRED; B5 post-R15 #1 OWNER_DECISION_REQUIRED (ruled by Owner),
  #2 WORKER_FIX (fixed), #3 WORKER_FIX (fixed), #4 WORKER_FIX (fresh D1 evidence produced)
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
- **Owner ruling 2026-09-21 (disposition A):** the `user_role` effective `USAGE` is accepted as a recorded PostgreSQL effective-privilege exception; **no database mutation** for that item and `REVOKE USAGE ON TYPE user_role FROM PUBLIC` is **not authorised** under this task.
- **Owner authorization 2026-09-21:** bounded schema remediation (Project A only; apply `0007` + additive `0008`; no `db:push`; no `0002`–`0006`; no billing/WSTERA_LAB change) — executed.

## Blockers

Open:
- Capability material absent (`PRODUCT_EVENT_SIGNERS`, `BILLING_CORE_CONTROL_READ_*`) → both inert
- Control request correlation: design only
- Owner-authenticated surfaces: pending Owner-visible verification
- Synthetic fulfillment end-to-end path: not exercised
- PR/default-branch disposition: pending Owner/governance decision (see `T6-WU01-REPO-PR-RECONCILE-DRAFT-2026-09-21.md`)
- Billing-deny re-verification trigger: when `billing_core` is created in Project A

Closed:
- T4 external dependency (SB01 LR-2F-A accepted)
- R15 schema gap (`product_installations` + fulfillment tables now exist)

## Next Action

Fix `R15-D1-PROVISION-PROBE.mjs:64` and the stale sections of this file, then submit a short B5 re-review.
