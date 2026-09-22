# BRIEF — NEW CHAT HOUSE DUAL-LANE CONTROLLER

Date: 2026-09-22
Role: HOUSE-DUAL-LANE-CONTROLLER
Owner: WSTERA Owner
Scope: Control and reconcile Lane A + Lane B until both reach their declared terminal review/Owner gates.

This brief makes the new ChatGPT chat the owner-side controller and truth reconciler for both House lanes.
It does not replace the lane executors. It keeps the lanes aligned, verifies claims against disk/runtime,
writes durable Owner decisions/continuation briefs, and prevents either lane from silently crossing authority boundaries.

## 1. Mandatory startup rule

Before issuing any new instruction, inspect the real repositories/worktrees/runtime and reconcile them against this snapshot.
If reality has moved, persist the new measured state before directing work.

Never answer from chat memory alone when a lane claim can be checked on disk.
Do not reset, clean, rebase, checkout-over, stash-and-forget, or otherwise destroy unknown/unclassified local work.

## 2. Read order

Read these first:

### Controller
1. this brief
2. CHECKLIST-HOUSE-PARALLEL-CLOSURE-2026-09-22.md
3. BRIEF-RESUME-LANE-A-CONTROL-TRUTH-EXPAND-CONTRACT-2026-09-22.md

### Lane A — Control Truth
4. RUN-MANIFEST-WSTERA-CONTROL-TRUTH-SYNC-001.md
5. OWNER-HOLD-PRODUCTION-MUTATION-2026-09-22.md
6. R2-CODEX-REVIEW-VERDICT-2026-09-22.md
7. T4-WU03-SOURCE-INSTALL-PARITY-PLAN-2026-09-22.md
8. CONTROL-SYNC-DEAD-LETTER-CLASSIFICATION-2026-09-22.md

### Lane B — Shared Runtime Isolation
Read from:
D:\AI-Workspace\runtime\worktrees\house-lane-b-longrun-plan-20260922\docs\platform\shared-runtime\

9. BRIEF-LANE-B-SHARED-RUNTIME-LONG-RUN-CLAUDE-AGY-CODEX-2026-09-22.md
10. RUN-MANIFEST-LANE-B-SHARED-RUNTIME-LONG-RUN-2026-09-22.md
11. OWNER-DECISION-LANE-B-PRE-A1-REMEDIATION-2026-09-22.md
12. ANALYSIS-LANE-B-LONG-RUN-BLOCKERS-2026-09-22.md
13. CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md
14. BRIEF-AGY-LANE-B-PRE-A1-FINDINGS-REMEDIATION-2026-09-22.md
15. VERIFICATION-H2-H4-CONSISTENCY-2026-09-22.md
16. if present, read and preserve REVIEW-CODEX-LANE-B-CONTROLLER-PACKAGE-2026-09-22.md

## 3. Measured snapshot at handoff

### Lane A — Control Truth / platform.wstera.com

Planning:
- worktree: D:\AI-Workspace\runtime\worktrees\wstera-control-truth-sync-001
- branch: work/wstera-control-truth-sync-001
- HEAD: 14b798c7d87a7b62cf38ab28472b0cc9d3f813fa
- parity: 0/0
- clean at measurement

hub-web:
- worktree: D:\AI-Workspace\runtime\worktrees\hub-web-cts001
- branch: work/wstera-control-truth-sync-001
- HEAD: fde38f64e6bd72de9af549a88777bf276933c051
- remote branch at same SHA, parity 0/0
- clean at measurement

wstera-workflows:
- worktree: D:\AI-Workspace\runtime\worktrees\wstera-control-sync-t4
- branch: work/wstera-control-truth-sync-001-t4
- HEAD: fb84b9d6517186246dacde2871937d98c52ec7a6
- parity: 0/0
- clean at measurement

State:
- T3 complete
- T4 complete
- T5 complete
- R2 closed at source/revision level
- run held at OWNER_HOLD_PRODUCTION_MUTATION
- no DB apply
- no production deploy
- revised Control Sync skill not installed
- Draft PR #2 not merged
- T6/R3/T7 not started

New controller finding after the Owner Hold:
the existing one-file 0009_work_scope_identity.sql rollout cannot guarantee a zero-gap deployment when used by the
normal migration runner, because the deployed old client calls the 17-argument RPC, the new client calls the
19-argument RPC, and the current 0009 both creates 19 and drops 17 in one migration.

The migration's own header already declares the intended safe sequence:
EXPAND (sections 1–8) → deploy new client → CONTRACT (old 17-arg DROP).

Therefore Lane A MUST execute the continuation brief before any production approval is reconsidered.

### Lane B — Shared Runtime Isolation / HOUSE-A

Planning:
- worktree: D:\AI-Workspace\runtime\worktrees\house-lane-b-longrun-plan-20260922
- branch: work/house-lane-b-longrun-plan-20260922
- HEAD: 4c3210df7355f639d98fde41da13c8079a6ccf47
- parity: 0/0 at measurement
- IMPORTANT: an untracked file was present:
  docs/platform/shared-runtime/REVIEW-CODEX-LANE-B-CONTROLLER-PACKAGE-2026-09-22.md

Execution remote:
- branch: work/house-h3d-h5-20260909
- remote HEAD: 2b1af861aa608f08abb0bd8224821b9ca5ac9981

Current controller package:
- credential strategy drafted
- AGY pre-A1 remediation brief drafted
- H2/H4 consistency re-verification drafted
- Codex review of planning SHA 4c3210d = FAIL, no mutation
- Codex identified 10 findings, including HIGH defects in effective credential boundaries and the H4 operator actor contract
- AGY MUST NOT be released on the failed controller package

The untracked Codex review is current observed evidence, but because it was untracked at handoff the new controller
must preserve it and have Claude reconcile/persist it correctly before treating it as canonical durable state.

## 4. Lane ownership and routing

### Lane A
Execution controller: Hermes
Execution engine: hermes-native-swarm
Control projection skill: wstera-control-sync
Codex: independent exact-revision review at required gates
Claude: difficult remediation only under the lane's standing escalation rules unless a newer explicit Owner decision says otherwise

The new ChatGPT controller does NOT replace Hermes as the Lane-A long-run state holder.
It verifies Hermes reports, writes Owner-side decisions/briefs, and prevents unsafe authority transitions.

### Lane B
Controller / state holder: Claude
Ordinary labor: AGY
Reviewer / bounded fixer: Codex
Loop:
Claude control → AGY execute → Codex review/fix → Claude check → continue

If Codex mutates, Claude must review the new exact SHA before continuation.
If Claude mutates hard remediation, Codex must independently review that exact SHA before continuation.
No reviewer may self-approve its own mutated revision.

The new ChatGPT controller owns Owner-side coordination and gate decisions, not ordinary Lane-B implementation.

## 5. What the new chat must control

Maintain one durable view of:

- exact branch / worktree / HEAD / upstream / dirty state for both lanes;
- current stage;
- current blocker/finding IDs;
- last independent review SHA and verdict;
- next allowed action;
- next Owner checkpoint;
- whether any live mutation authority exists;
- whether either lane currently owns a LAB/Production mutation window.

Do not let a prose report override measured git/runtime state.

After every material gate or Owner decision, persist an updated dual-lane control state in a file before relying on it
across chats/devices.

## 6. Cross-lane collision rules

1. Lane A and Lane B use separate worktrees, branches, evidence and review chains.
2. A PASS in one lane does not imply a PASS in the other.
3. Only one live mutation window may be active against overlapping WSTERA shared infrastructure at a time.
4. Before authorizing a Lane-A production mutation or Lane-B LAB/Auth/role/config mutation, inspect the other lane for an active/conflicting mutation window.
5. No fake Product identity.
6. No silent dead-letter reinterpretation.
7. No secret values in repo/evidence/command arguments.
8. Production and LAB claims remain separate.
9. No PRODUCTION_READY / OPERATED_STABLE claim from partial lane completion.

## 7. Immediate next action — Lane A

Follow:
BRIEF-RESUME-LANE-A-CONTROL-TRUTH-EXPAND-CONTRACT-2026-09-22.md

The first objective is source-only rollout remediation. No production mutation authority is granted.

Expected path:
A-EXPAND SOURCE → A-CONTRACT SOURCE → deterministic gates → focused Codex rollout review
→ OWNER_HOLD_PRODUCTION_MUTATION_V2

Only after the revised exact revisions and rollout/rollback package are reviewed may the Owner decide whether to open T6.

## 8. Immediate next action — Lane B

Do NOT release the current 4c3210d controller package to AGY.

First:
1. preserve the untracked Codex review;
2. Claude reconciles and persists the Codex FAIL against exact SHA 4c3210d;
3. Claude corrects all review findings without live LAB/Auth/role mutation;
4. Codex reviews the corrected exact planning revision;
5. only after review passes under the Lane-B loop may Claude release AGY for the pre-A1 remediation work;
6. close the three pre-A1 findings under the approved loop;
7. stop at OWNER-CP-H3D-A1.

## 9. Owner checkpoints

Only the WSTERA Owner can authorize the protected mutation gates.

Lane A:
- production Control DB migration
- production hub-web deployment
- production/runtime skill install where the brief reserves it
- final Owner Control Truth review

Lane B:
- OWNER-CP-H3D-A1
- OWNER-CP-H3D-LIVE
- OWNER-CP-H3E
- OWNER-CP-H4
- OWNER-CP-HOUSE-A

No silence or timeout is approval.

## 10. Reporting rule

Do not ask the Owner for routine implementation decisions already covered by a brief.

Bring the Owner in only for:
- a real locked Owner checkpoint;
- a new security/architecture decision that changes the contract;
- production mutation;
- paid/cost-bearing change;
- destructive/irreversible action;
- a blocker that cannot be resolved within the existing lane authority.

When reporting a lane, state:
- measured revision;
- PASS/FAIL/BLOCKED;
- what changed;
- what remains;
- next allowed action;
- whether Owner action is required.

## 11. Dual-lane end condition

Lane A terminal target:
READY FOR OWNER CONTROL TRUTH REVIEW

Lane B terminal target:
HOUSE-A REVIEW READY, followed by explicit Owner HOUSE-A PASS and the durable BK01 return package.

Only after both lanes and any other still-open House-wide gates are reconciled may the controller evaluate
a broader House production-ready claim.
