# BRIEF — RESUME WSTERA-CONTROL-TRUTH-SYNC-001 FROM T3

Task: `WSTERA-CONTROL-TRUTH-SYNC-001`
Workflow: `WF-DEV-01 v1.3.0 / LONG_RUN`
Resume state: `OWNER_HOLD_T3_COMPOSITE_SCOPE`
Owner authority: **RESUME AUTHORIZED**

## Mandatory skill gate — do this before any work

Hermes MUST load, discover, and obey both skills before dispatching any substantive work:

1. `hermes-native-swarm`
2. `wstera-control-sync`

If either skill is unavailable, disabled, mismatched, or its required preflight fails: **STOP fail-closed. Do not substitute Agent Relay or another execution path.**

Ordinary implementation/testing/evidence work MUST run through `hermes-native-swarm`.
Agent Relay is forbidden as the ordinary execution path.
Control projection/activity MUST use `wstera-control-sync` according to its contract.

## Read first — Source of Truth

Read these files before resuming:

1. `D:/AI-Workspace/runtime/hermes-native/hermes-native-vault/00_Daily_Logs/handoff/2026-09-21-WSTERA-CONTROL-TRUTH-SYNC-001-RUN-REPORT.md`
2. `D:/AI-Workspace/runtime/worktrees/wstera-control-truth-sync-001/docs/platform/house-long-run/RUN-MANIFEST-WSTERA-CONTROL-TRUTH-SYNC-001.md`
3. `D:/AI-Workspace/runtime/worktrees/wstera-control-truth-sync-001/docs/platform/house-long-run/OWNER-HOLD-T3-COMPOSITE-SCOPE-2026-09-21.md`
4. `D:/AI-Workspace/runtime/worktrees/wstera-control-truth-sync-001/docs/platform/house-long-run/R1-CODEX-REVIEW-VERDICT-2026-09-21.md`
5. `D:/AI-Workspace/runtime/worktrees/wstera-control-truth-sync-001/docs/platform/house-long-run/TASK-WSTERA-CONTROL-TRUTH-SYNC-001.md`
6. Original Brief and T1/T2 evidence only as needed to resolve exact contracts/invariants.

Run Report SHA256 at this handoff:
`249c576eccd06cb53ea72f7261ecc0ab1f56c831db1bfb9a992339a5aed893bc`

## Exact resume baseline

Planning repo:
- branch: `work/wstera-control-truth-sync-001`
- expected HEAD: `ce46984c86dcb141633e3b0490f2d0457fe987b0`

hub-web implementation worktree:
- branch: `work/wstera-control-truth-sync-001`
- expected HEAD: `393af8eac1633f2bb68038a89ddd3bd3062710cf`

Before mutation, re-verify actual HEADs, remote refs, dirty state, Draft PR #2 state, skill readiness, and Control Sync doctor/outbox. Reality overrides this brief if drift is found; classify drift before continuing. Do not reset/clean unknown work.

## Owner decision — T3-WU02 split is authorized

Owner authorizes **Option 1** from `OWNER_HOLD_T3_COMPOSITE_SCOPE`.

Hermes MAY split `T3-WU02` into smaller single-objective sub-units, for example:
- server truth-mode paths: Owner Inbox / Agent Activity / Portfolio Gates;
- client Control Plane truth-mode paths;
- further bounded sub-units if needed to keep each Swarm packet single-objective.

This is a **re-expression of the existing T3-WU02 scope only**:
- do not add scope;
- do not remove acceptance criteria;
- do not weaken production-truth requirements;
- do not mark T3-WU02 complete until all original WU02 acceptance is satisfied.

Avoid composite Swarm packets already proven to timeout on this host.

## Continue automatically

Resume from T3 and continue without asking Owner for routine technical decisions:

`T3-WU02 sub-units -> T3-WU03 -> T3-WU04 -> T3-WU05 -> T4 -> T5 -> R2`

Use Codex only at the independent-review checkpoints required by the Manifest/policy, not per work unit.
Claude remains difficult-remediation only after the defined retry + Codex classification route.

The prior task-specific Owner exception remains active:
- Hermes may commit + push exact verified revisions for this task on `work/wstera-control-truth-sync-001`;
- do not rename the branch;
- do not include unrelated changes;
- do not merge Draft PR #2.

Before every commit: deterministic gates PASS, evidence bound to files/revision, `git diff --check` CLEAN, scope clean.

## Control truth constraints

Until non-product Work Queue sync is actually live and proven:
- do not invent a Product code;
- do not claim `work.sync` success when the live contract still rejects it;
- activity telemetry may be emitted through `wstera-control-sync` when truthful;
- pending/dead-letter is failure/blocked evidence, never PASS.

Production runtime must never substitute demo/mock rows or simulation success for live truth.

## Hard stop

No live DB migration apply, production deployment, runtime-skill production activation, or other production mutation is authorized by this brief.

After R2, STOP at:

`OWNER_HOLD_PRODUCTION_MUTATION`

Present exact R2-approved SHAs, migration/deploy coupling plan, rollback/forward-fix plan, and live-proof plan for Owner authorization.

Do not claim `PRODUCTION_READY` or `OPERATED_STABLE`.
