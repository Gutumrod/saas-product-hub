# LAUNCH PACKET — SB01 Long-Run Relay — Phase 2C through 2F — 2026-09-12

Status: `READY TO SEND TO HERMES / NOT LAUNCHED`
Program: `SB01 — WSTERA Central Billing Core`
Task ID: `SB01-LONG-RUN-2C-2F-001`
Owner / Final Authority: `Free`
Commander / Final Verify: `Sol`
Orchestrator: `Hermes`
Workflow: `WF-RELAY-01 v1.2.0`
Runtime: `kanban-external-agent-dispatch v2.3.8`
Work Type: `DIRECT-APPROVED`
Release Policy: `RELAY_STANDARD`
Failure Behavior: `STOP / FAIL CLOSED`

## Launch Meaning

This packet is launch-ready but is not itself Owner authorization. When Owner sends this packet to Hermes with an explicit instruction to launch `SB01-LONG-RUN-2C-2F-001`, Hermes may begin orchestration and PRE-01 only.

No substantive AGY/Qwen/Codex/Claude stage may release until Hermes persists a complete PRE-01 Relay preflight with PASS.

## Canonical Pins

House Long-Run brief:
`D:\AI-Workspace\runtime\worktrees\house-billing-core-20260909\docs\platform\billing-core\BRIEF-SB01-LONG-RUN-RELAY-PHASE2C-2F-2026-09-12.md`

House brief revision:
`fa0691e0236346858c4fbaf4cd3f23075dfe5d13`

SB01 workspace:
`D:\AI-Workspace\runtime\worktrees\sb01-central-billing-20260909`

SB01 local branch:
`work/sb01-central-billing-pc-20260911`

SB01 remote branch:
`origin/feature/central-billing-phase2-runtime`

Expected SB01 launch HEAD:
`3249b7188f6d98dfc4fe12a37e2aaa06398fd8b8`

Accepted Phase 2B material SHA:
`6be6cb36af42ba2cef62a8f070f0bb8d0a5e2895`

Task checkpoint:
`docs/tasks/TASK-SB01-LONG-RUN-2C-2F-001.md`

Relay plan:
`docs/relay/RELAY-PLAN-SB01-LONG-RUN-2C-2F-2026-09-12.json`

Relay plan materialization commit:
`ea9778e972c4ce1658c871d85f5841d344d99995`

Initial AGY dispatch:
`docs/dispatch/AGENT-DISPATCH-SB01-LR-2C-AGY-2026-09-12.md`

Initial AGY dispatch revision:
`1b5ca31711aa362481aefec840576af188389f61`

Task checkpoint pin revision:
`3249b7188f6d98dfc4fe12a37e2aaa06398fd8b8`

## Relay / Executor Pre-Evidence

Parity remediation task: `RELAY-RUNTIME-PARITY-001`.

Workflow registry closure commit:
`713c7124e7743e731583b755ba87c5fad9ba24a1`

Canonical Windows Relay runtime:
`D:\AI-Workspace\runtime\hermes-native\data\skills\devops\kanban-external-agent-dispatch\SKILL.md`

Runtime version: `2.3.8`
Runtime SHA-256: `F8AFFA7C0430FA645581129BB01B60C5AF2BEA2CA36CD1C5C9E853CA2B4CD809`
Runtime-home guard: `PASS`

Current readiness evidence before launch:
- Claude = PASS
- AGY = PASS
- Qwen = PASS
- Codex = PASS
- `execution_backend = direct_external_process`
- `transport_model = none`

Hermes must still execute and persist the canonical PRE-01 preflight at launch time. Prior evidence does not waive runtime preflight.

## Locked Roles

- Hermes = orchestrate / gate / track / persist / route mechanically only.
- AGY + Qwen = primary workers.
- Codex = head verifier / checkpoint routing authority.
- Claude = difficult-work closer only when Codex returns `SEND_TO_CLAUDE` or Sol explicitly authorizes a hard closure package.
- Sol = Commander / Architect / Final Verify.
- Owner = Final Authority.

Hermes must not implement source, judge semantic quality, invent decisions, silently substitute agents, or widen scope.

## Required Execution Route

Default material phase pattern:
`AGY -> Qwen -> deterministic gate -> Codex`

The workers are sequential by default to prevent overlapping writes. Hermes may not parallelize them unless a future persisted dispatch proves non-overlapping write scope and the locked brief permits it.

### PRE-01 — Hermes Preflight

Before substantive release Hermes must verify and persist:
- canonical runtime path/version/hash = pinned v2.3.8 state;
- effective `HERMES_HOME` and gateway home are canonical;
- Owner launch authorization is explicit;
- SB01 branch/worktree is clean and exact HEAD = `3249b7188f6d98dfc4fe12a37e2aaa06398fd8b8`;
- House brief / Task / Relay plan / first dispatch are readable and mutually consistent;
- AGY/Qwen/Codex readiness PASS; Claude readiness PASS before any Claude use;
- allowed/prohibited write scopes are explicit;
- context modes and QA independence are valid;
- no live/production authority is present;
- failure behavior = STOP.

Any mismatch = HOLD. Do not repair product source during preflight.

### LR-2C

If PRE-01 PASS:
1. Hermes updates Task checkpoint to the actual AGY worker state.
2. Release only `docs/dispatch/AGENT-DISPATCH-SB01-LR-2C-AGY-2026-09-12.md`.
3. Persist AGY return/evidence and exact commit SHA.
4. Create a fresh Qwen LR-2C dispatch pinned to AGY's exact returned SHA; do not reuse this AGY dispatch.
5. Qwen performs bounded negative-authority/test/evidence expansion.
6. Persist Qwen return and exact combined stage revision.
7. Create fresh Codex `INDEPENDENT-QA` dispatch against the exact combined LR-2C revision.
8. Codex returns one routing verdict.

### Codex Routing Contract

Allowed verdicts only:
- `PASS`
- `FIX_BY_AGY`
- `FIX_BY_QWEN`
- `SEND_TO_CLAUDE`
- `SOL_OWNER_DECISION_REQUIRED`

Hermes routes mechanically:
- `PASS` -> persist checkpoint -> next already-authorized phase.
- `FIX_BY_AGY` -> one fresh bounded AGY repair dispatch -> deterministic gate -> Codex `INFORMED-VERIFY`.
- `FIX_BY_QWEN` -> one fresh bounded Qwen repair dispatch -> deterministic gate -> Codex `INFORMED-VERIFY`.
- `SEND_TO_CLAUDE` -> one fresh bounded Claude difficult-work dispatch -> deterministic gate -> Codex `INFORMED-VERIFY`.
- `SOL_OWNER_DECISION_REQUIRED` -> hard stop.

Repair-loop guard per phase: maximum one ordinary worker repair plus one Claude difficult-work closure round. If still not PASS, hard stop to Sol/Owner.

### LR-2D

Only after LR-2C Codex PASS:
`AGY webhook/reconciliation implementation -> Qwen replay/retry/lease/dead-letter/out-of-order tests/evidence -> Codex checkpoint`.

### LR-2E

Only after LR-2D Codex PASS:
`AGY entitlement/runtime implementation -> Qwen PS01/LK01 isolation/idempotency/monotonicity tests/evidence -> Codex checkpoint`.

### LR-2F

Only after LR-2E Codex PASS:
`AGY bounded SB01 projection implementation if required -> Qwen read-contract/documentation/test evidence -> Codex checkpoint`.

Even if LR-2F Codex verdict is PASS, Hermes MUST stop at:
`READY FOR SOL/OWNER REVIEW — SB01 PHASE 2F PROJECTION CONTRACT`

Do not start Control Plane implementation and do not open a later SB01 phase.

## Absolute Prohibitions

- no live Stripe keys or live charges;
- no production DB/provider mutation;
- no production deploy;
- no merge/release;
- no Control Plane payment mutation or duplicate billing engine;
- no BK01 live migration/extraction;
- no MT01 billing integration;
- no PromptPay recurring billing;
- no Product-owned entitlement rewrite;
- no silent retry, relabeling, agent substitution, or unlimited remediation loop;
- no Council reopening unless an actual architecture/security/business decision gap is persisted.

## Owner Launch Command

Owner may launch by sending this packet to Hermes and explicitly stating:

`LAUNCH SB01-LONG-RUN-2C-2F-001 — execute the pinned launch packet exactly; PRE-01 must PASS before substantive release; stop at the Phase 2F Sol/Owner hard checkpoint.`

Anything weaker than an explicit launch instruction leaves the Task in `READY_FOR_OWNER_LAUNCH`.