# BRIEF — WSTERA House Sell-Ready LONG_RUN Continuation — 2026-09-16

Status: `APPROVED FOR STATIC/REVIEW EXECUTION; LIVE MUTATION GATED`
Task ID: `HOUSE-SHARED-RUNTIME-ISOLATION-001`
Owner / Final Authority: `Free`
Workflow: `WF-DEV-01 v1.2.0`
Execution Mode: `LONG_RUN`
Relay Composition: `WF-RELAY-01 v1.3.0`
Runtime Procedure: `kanban-external-agent-dispatch v2.5.0`
Work Type: `DIRECT-APPROVED`
Release Policy: `RELAY_STANDARD`
Failure Behavior: `STOP / FAIL CLOSED`

## 1. Mission

Continue WSTERA House from the actual canonical state and remove the shortest real blocker to Sell Ready / Production Ready operation.

The current House critical path is the shared-runtime isolation gate:

`H3D -> H3E -> H3F -> H4 -> H5 -> HOUSE-A review -> BK01 Junction A release decision`

Do not expand platform scope merely because another improvement is available. Work that does not directly remove a sell/deploy/onboard/support/payment blocker stays out of this run.

## 2. Owner Runtime Overlay — 2026-09-16

The latest Owner direction pins the current execution baseline as:
- Agent Relay `v2.5.0`;
- Hermes = orchestrator / state / dispatch;
- OpenCode = `PRIMARY_GENERAL_IMPLEMENTATION_WORKER`;
- AGY = `UI-UX-SPECIALIST` + Council expert;
- Qwen = specialist;
- Codex = independent reviewer / important gates;
- Claude = difficult remediation / fallback.
This explicit Owner overlay supersedes stale worker-routing assumptions in the 2026-09-09 Claude-only long-run brief. It does not erase historical evidence or authorize a worker to approve its own changes.

The active Relay skill on Windows was directly verified at:
`D:\AI-Workspace\runtime\hermes-native\data\skills\devops\kanban-external-agent-dispatch\SKILL.md`
with declared version `2.5.0`.

The workflow registry still names an older Relay procedure in its descriptive row. For this run, the explicit Owner instruction plus the verified active canonical Relay skill pins procedure `v2.5.0`; no unrelated workflow-repository edit is authorized by this task.

## 3. Verified Current State

Coordinator House:
- workspace: `D:\AI-Workspace\projects\saas-product-hub`
- branch: `master`
- HEAD: `94ce432121b7bc79914fe22c976dab83745b8e50`
- origin parity: `0/0`
- working tree before this brief: clean

House execution lane:
- branch: `work/house-h3d-h5-20260909`
- remote HEAD: `d6707c0c96309f2f0efb8f83f00b5f34aee6d2b5`
- Windows worktree local HEAD: `7ecfe11a7dfef1a3686d1612b82b7cdca84dc067`
- Windows worktree: clean, behind remote by 1 commit
- remote tip is the durable Windows-to-Mac H3D handoff

PS01 execution lane:
- branch: `work/ps01-h3d-data-api-20260909`
- HEAD/origin: `c169e5dfc6ba3da45c653b853f1694355ee8ae88`
- working tree: clean
- H3D Data API source replacement already exists on this branch and must not be restarted from scratch.
Active-device state:
- `HANDOFF-H3D-WINDOWS-TO-MAC-2026-09-09.md` designates Mac as the active H3D execution machine;
- expected Mac House worktree: `/Users/wachirayachankhonkan/AI-Workspace/runtime/worktrees/house-h3d-h5-20260909`;
- expected Mac PS01 worktree: `/Users/wachirayachankhonkan/AI-Workspace/runtime/worktrees/ps01-h3d-data-api-20260909`;
- Remote Desktop attempts to inspect the Mac timed out on 2026-09-16;
- therefore the Mac local HEAD/dirty state is currently **UNVERIFIED** and substantive execution must not start until PRE-01 resolves it.

## 4. Current Technical Checkpoint

H3C is `PASS / CLOSED`; do not rerun it without regression evidence.

H3D is **not PASS**. The execution branch contains substantial H3D implementation, operator tooling, evidence scaffolding, and PS01 Data API replacement work, but the durable static acceptance brief records unresolved findings:
- `S1` worktree commit binding;
- `S2` hook-on receipt dead-end;
- `S3` incomplete hash-linked receipt chain;
- `S4` seed-manifest integrity across run/teardown;
- `S5` `camera_access_audit` non-FK shop-scoped residue coverage.

Acceptance gate `A1` is also open: concurrency/failure-injection/atomic rollback proof was designed but intentionally not executed because live DML authority was withheld.

Consequences:
- H3E/H3F/H4/H5 must not be bypassed into;
- HOUSE-A is not closed;
- BK01 remains quarantined from Junction A;
- Production remains locked.
## 5. Source-of-Truth References

Read in this precedence order before mutation:
1. latest explicit Owner direction recorded by this brief;
2. `AGENTS.md`;
3. `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md`;
4. `docs/strategy/BUILD-TO-SELL-EXECUTION-2026-09-06.md`;
5. `docs/platform/shared-runtime/BRIEF-HOUSE-SHARED-RUNTIME-CONTINUATION-HANDOFF-2026-09-09.md`;
6. `docs/platform/shared-runtime/BRIEF-CLAUDE-H3D-H5-HOUSE-A-LONG-RUN-EXECUTION-2026-09-09.md` as historical technical contract, with worker routing superseded by this brief;
7. `docs/platform/shared-runtime/BRIEF-CLAUDE-H3D-STATIC-ACCEPTANCE-REMEDIATION-2026-09-09.md`;
8. remote execution-branch `docs/platform/shared-runtime/HANDOFF-H3D-WINDOWS-TO-MAC-2026-09-09.md` at `d6707c0`;
9. H3C final closure and H3D evidence on the execution branch;
10. `TASK-HOUSE-SHARED-RUNTIME-ISOLATION-001.md` and the locked Run Manifest created with this brief.

Runtime authority:
- `WF-DEV-01 v1.2.0 / LONG_RUN`;
- `kanban-external-agent-dispatch v2.5.0`;
- OpenCode worker contract at the active Hermes profile.

## 6. Immediate Authorized Work

The first substantive stage is **H3D static acceptance remediation only**.

OpenCode is the primary implementation worker. It may fix S1–S5 only inside the exact paths allowed by the existing static-acceptance brief and the Run Manifest. It must not alter PS01 business/schema code, start H3E, seed/teardown LAB fixtures, create/delete Auth users, change runtime grants, toggle Auth hooks, or run H3D live.

After deterministic gates pass, Codex performs the independent batch review. A provisional worker PASS is not approval.
## 7. Declared Owner Checkpoints

The long run must stop for explicit Owner authority before crossing these boundaries:

1. `OWNER-CP-H3D-A1` — authorize narrowly bounded rollback-only/two-session LAB DML validation for A1 after S1–S5 are independently approved.
2. `OWNER-CP-H3D-LIVE` — authorize real H3D LAB fixture/Auth/grant/hook/live-smoke mutation after A1 evidence passes review.
3. `OWNER-CP-H3E` — authorize retirement/rehearsal mutation of `ps01_runtime_login` after H3D PASS.
4. `OWNER-CP-H4` — authorize disposable H4 schema/roles/Data API/Auth proof and teardown after H3 closes.
5. `OWNER-CP-HOUSE-A` — final House decision after independent H5/HOUSE-A review; this checkpoint controls whether BK01 may retry Junction A.

No checkpoint above implies Production authorization.

## 8. Sell-Ready Priority Rule

This run may remove only blockers that are on the current sell/deploy/operate critical path.

Explicitly out of scope:
- new Control Plane feature work not required by this gate;
- billing-core expansion;
- Module Hub scan/research;
- unrelated Council work;
- new product capabilities;
- KMO-specific implementation;
- cosmetic platform refactors;
- Production deployment or live customer mutation.

If a new issue is discovered, classify whether it blocks this critical path. Non-blocking improvements are recorded and deferred, not implemented opportunistically.

## 9. Success Definition

This continuation succeeds when it either:
- reaches the next declared Owner checkpoint with exact revision-bound evidence and independent review; or
- stops at the first real blocker with durable evidence and no unsafe workaround.

Ultimate House closure requires H3D/H3E/H3F/H4/H5 evidence, independent review, and Owner `HOUSE-A` decision. Until then, BK01 Junction A remains locked.
