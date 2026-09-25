# TASK — HOUSE-SHARED-RUNTIME-ISOLATION-001

Status: `READY_FOR_BRIEF_CHECKPOINT`
Owner / Final Authority: `Free`
Program: `WSTERA House — Sell Ready / Production Ready Critical Path`
Workflow: `WF-DEV-01 v1.2.0`
Execution Mode: `LONG_RUN`
Relay Composition: `WF-RELAY-01 v1.3.0`
Runtime Procedure: `kanban-external-agent-dispatch v2.5.0`
Work Type: `DIRECT-APPROVED`
Failure Behavior: `STOP / FAIL CLOSED`

## Objective

Close the current House shared-runtime isolation critical path from the real H3D state through the declared Codex and Owner checkpoints without opening unrelated platform scope.

The immediate sell-readiness dependency is the House isolation gate that keeps BK01 Junction A quarantined. This task does not authorize unrelated Control Plane expansion, billing implementation, product feature expansion, or Production mutation.

## Verified Coordinator Baseline — 2026-09-16

- Repository: `Gutumrod/saas-product-hub`
- Canonical coordinator workspace: `D:\AI-Workspace\projects\saas-product-hub`
- Branch: `master`
- HEAD: `94ce432121b7bc79914fe22c976dab83745b8e50`
- `origin/master`: same SHA
- Working tree: clean
- Remote: `https://github.com/Gutumrod/saas-product-hub.git`
## Verified Execution Baseline

House execution branch:
- branch: `work/house-h3d-h5-20260909`
- Windows worktree: `D:\AI-Workspace\runtime\worktrees\house-h3d-h5-20260909`
- Windows local HEAD: `7ecfe11a7dfef1a3686d1612b82b7cdca84dc067`
- remote HEAD: `d6707c0c96309f2f0efb8f83f00b5f34aee6d2b5`
- Windows worktree: clean, behind remote by 1 commit
- remote-only commit: `docs(platform): hand off H3D execution from Windows to Mac`

PS01 execution branch:
- branch: `work/ps01-h3d-data-api-20260909`
- Windows worktree: `D:\AI-Workspace\runtime\worktrees\ps01-h3d-data-api-20260909`
- HEAD / origin: `c169e5dfc6ba3da45c653b853f1694355ee8ae88`
- divergence: `0/0`
- working tree: clean

Active-device handoff:
- canonical handoff names Mac as the active H3D execution machine;
- Mac worktree path: `/Users/wachirayachankhonkan/AI-Workspace/runtime/worktrees/house-h3d-h5-20260909`;
- current Remote Desktop access to that Mac timed out on 2026-09-16;
- therefore PRE-01 must verify the Mac worktree/HEAD/dirty state before substantive dispatch.
## Current Checkpoint

`CP-H3D-STATIC-REMEDIATION-PENDING`

Current blocker set from durable evidence:
- H3D static acceptance findings `S1–S5` are not closed on the remote execution branch.
- Acceptance gate `A1` concurrency/failure-injection proof remains unexecuted by design.
- H3D is not PASS.
- H3E/H3F/H4/H5 are not authorized to bypass H3D.
- HOUSE-A is not closed.
- BK01 remains quarantined from Junction A.

## Worker / Reviewer Map

- Hermes = orchestrator / state / dispatch only.
- OpenCode = `PRIMARY_GENERAL_IMPLEMENTATION_WORKER` for ordinary implementation/remediation.
- AGY = `UI-UX-SPECIALIST` only for ordinary worker stages; no current UI work is planned here.
- Qwen = bounded specialist for command-heavy SQL/test/harness qualification when declared by the manifest.
- Codex = primary independent batch reviewer / important gate reviewer.
- Claude = difficult remediation or fallback independent reviewer only under the locked independence/failover rules.

## Authority Boundary

Owner authorization in the 2026-09-16 continuation instruction covers preparation, commit/push, PRE-01, static implementation/remediation, deterministic gates, and independent review up to declared Owner checkpoints.

It does **not** silently authorize Production mutation, destructive action, paid changes, or the live LAB DML/Auth/hook/role mutations that the prior H3D/H3E/H4 briefs explicitly reserve for separate checkpoints.
