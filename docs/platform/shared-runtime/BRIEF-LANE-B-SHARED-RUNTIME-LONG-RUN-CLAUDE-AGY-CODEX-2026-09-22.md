# BRIEF — LANE B SHARED-RUNTIME LONG_RUN (CLAUDE → AGY → CODEX → CLAUDE)

Date: 2026-09-22
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Target: close House Shared Runtime Isolation through `HOUSE-A` so BK01 can receive the House return package and retry Junction A.
Mode: `LONG_RUN`
Planning branch: `work/house-lane-b-longrun-plan-20260922`
Execution branch baseline: `work/house-h3d-h5-20260909 @ d6707c0c96309f2f0efb8f83f00b5f34aee6d2b5`

This brief is a task-specific Owner routing override. It does not rewrite global agent-role policy outside this Lane B run.

## 1. Required Source of Truth — read before execution

Claude MUST read these in order before dispatching work:

1. this Brief
2. `RUN-MANIFEST-LANE-B-SHARED-RUNTIME-LONG-RUN-2026-09-22.md`
3. `BRIEF-CLAUDE-H3D-H5-HOUSE-A-LONG-RUN-EXECUTION-2026-09-09.md`
4. `BRIEF-CLAUDE-H3D-STATIC-ACCEPTANCE-REMEDIATION-2026-09-09.md`
5. `BRIEF-SHARED-RUNTIME-PLATFORM-ISOLATION-REMEDIATION-2026-09-08.md`
6. `HANDOFF-H3D-WINDOWS-TO-MAC-2026-09-09.md`
7. `OPERATOR-ACTION-PACK-H3D-TO-H5-2026-09-09.md`
8. `REPORT-BK01-JUNCTION-A-PLATFORM-ISOLATION-HANDOFF-2026-09-08.md`
9. the current evidence under `docs/platform/shared-runtime/evidence/` needed for the active stage

Reality on disk/runtime overrides handoff prose when measured evidence conflicts. Never erase unknown local work to make the brief appear true.

## 2. Mandatory PRE-01 state reconciliation

Current measured fact at brief creation:

- Mac execution worktree:
  `/Users/wachirayachankhonkan/AI-Workspace/runtime/worktrees/house-h3d-h5-20260909`
- branch: `work/house-h3d-h5-20260909`
- HEAD: `d6707c0c96309f2f0efb8f83f00b5f34aee6d2b5`
- remote parity: `0/0`
- dirty tracked file exists:
  `tools/shared-runtime/h3d/h3d-live-runner.mjs`

Claude MUST inspect and classify that dirty file before any mutation. Do not reset, clean, checkout-over, stash-and-forget, or overwrite it. Determine provenance and whether it is valid continuation work, unrelated work, or incomplete prior work. Persist the classification.

The Windows copy of the Lane-B execution worktree is behind the remote and is not the active execution authority. Do not silently switch execution to Windows merely because it is cleaner.

## 3. Lane-B agent roles — Owner locked

### Claude
Claude is:
- LONG_RUN controller / state holder for this Lane B run;
- interpreter of this Brief + stage contracts;
- dispatcher of AGY/Codex work;
- resolver of hard architecture/security/remediation problems only;
- verifier after Codex-made mutations;
- authority to advance to the next pre-authorized technical stage only when the required review state is satisfied.

Claude MUST NOT absorb ordinary implementation/labor that AGY can perform safely.

### AGY
AGY is the primary labor executor for all ordinary work:
- source edits;
- scripts/harnesses;
- tests;
- evidence collection/normalization;
- browser/staff/product-surface proof;
- bounded runbook execution;
- authorized LAB actions that are explicitly within an already-approved Owner checkpoint and exact runbook.

AGY does not self-approve its own work and does not decide Owner authority boundaries.

### Codex
Codex is:
- exact-revision reviewer;
- defect classifier;
- bounded defect fixer when the fix is sufficiently clear and stays within locked scope;
- re-runner of deterministic verification after its own bounded fix.

Codex MUST NOT self-approve a revision that Codex mutated.

## 4. Mandatory execution loop

For each stage/work unit:

`CLAUDE CONTROL → AGY EXECUTE → CODEX REVIEW/FIX → CLAUDE CHECK → CONTINUE`

Detailed rules:

1. **Claude prepares/locks the next unit**
   - exact objective;
   - exact allowed/prohibited scope;
   - exact worktree;
   - acceptance checks;
   - Owner authority status;
   - expected evidence.

2. **AGY executes all ordinary labor**
   - implement/run/prove;
   - deterministic gates;
   - evidence;
   - exact changed-file set;
   - commit/push only if the active task authority permits it;
   - return exact SHA, not a prose-only PASS.

3. **Codex reviews the exact AGY revision**
   - reproduce critical checks;
   - inspect evidence and counter-evidence;
   - verify scope and revision binding.

4. **If Codex finds a bounded defect and can fix it safely**
   - Codex MAY mutate the code/evidence;
   - rerun required gates;
   - produce a new exact SHA;
   - outcome MUST be `FIX_APPLIED_AWAITING_CLAUDE_REVIEW`, not self-issued final PASS.

5. **If Codex made any mutation**
   - Claude MUST review the exact Codex-mutated SHA.
   - Only `CLAUDE_REVIEW_PASS` may release that revision to the next stage.
   - If Claude fails it, route ordinary repairs back to AGY; hard remediation may be handled by Claude.

6. **If Codex reviewed without mutating and returns PASS**
   - Claude performs the stage/gate consistency check against the Brief, evidence, Owner boundary, and exact SHA.
   - Claude may then advance the run.

7. **If Claude performs hard remediation and mutates code**
   - Claude cannot self-approve that mutated revision.
   - Send the exact Claude-mutated SHA back to Codex for independent review.
   - If Codex then mutates again, the resulting SHA returns to Claude review.
   - Continue this loop until the current revision has an independent reviewer that did not create that revision and all gates pass.

No reviewer shopping. No inherited PASS across a mutated SHA.

## 5. Stage path

Canonical path:

`PRE-01 → H3D-S → BATCH-H3D-S → OWNER-CP-H3D-A1 → H3D-A1 → BATCH-H3D-A1 → OWNER-CP-H3D-LIVE → H3D-LIVE → BATCH-H3D-LIVE → OWNER-CP-H3E → H3E → H3F → BATCH-H3-CLOSE → OWNER-CP-H4 → H4 → BATCH-H4 → H5 → BATCH-H5-HOUSE-A → OWNER-CP-HOUSE-A`

Final technical package before Owner decision:

`HOUSE-A REVIEW READY`

Final House gate after explicit Owner decision:

`SHARED-RUNTIME PLATFORM ISOLATION: PASS / HOUSE-A PASS`

Only after durable `HOUSE-A PASS` may BK01 receive the House return package and prepare a fresh Junction A retry.

## 6. Owner checkpoints — hard stops

Claude may run automatically through read-only/source/test/review work, but MUST stop for explicit Owner authority at:

- `OWNER-CP-H3D-A1`
- `OWNER-CP-H3D-LIVE`
- `OWNER-CP-H3E`
- `OWNER-CP-H4`
- `OWNER-CP-HOUSE-A`

No silence/timeout is approval.

No Production mutation is authorized by this brief.

## 7. Non-negotiable safety / integrity rules

- BK01 remains quarantined; do not retry Junction A from this Lane B run.
- Do not use BK01 as the disposable H4 product.
- No Product may own global migration/config authority.
- No project-wide/service-role credential may be placed in product runtime or evidence.
- Preserve RLS/least-privilege/fail-closed behavior.
- Do not weaken negative isolation checks merely to get green tests.
- No secret values in repo, evidence, command arguments, or reviewer packets.
- No reset/clean/rebase of unknown local work.
- Every reviewer verdict is bound to the exact reviewed SHA.
- Every mutation invalidates earlier review on the prior SHA.
- Keep LAB and Production claims separate.

## 8. Parallelization rules for speed

Claude should keep the critical dependency chain sequential, but may run preparation in parallel where it cannot invalidate the active stage:

- AGY may prepare later browser/regression checklists, harnesses, evidence templates, and read-only probes while another unit is under review.
- Codex may prepare review criteria and read-only baseline comparisons before the final SHA freezes.
- Final Codex verdict must wait for the exact frozen revision.
- Do not run two writers against the same worktree/files.
- Do not overlap two live mutation windows against the same LAB/Auth/config surface.

## 9. Commit / evidence discipline

For each accepted revision:
- exact repo/worktree/branch/base/target SHA;
- changed-file list;
- allowed-scope proof;
- deterministic commands/results;
- reviewer identity and whether reviewer mutated;
- evidence paths + hashes;
- dirty-state classification;
- remote parity;
- no secret exposure.

Do not call a stage PASS from a working tree with unclassified mutation.

## 10. Stop / return contract

At `HOUSE-A REVIEW READY`, stop and present:
- exact House/PS01 revisions;
- all LAB mutations actually applied;
- privilege and shared-surface before/after evidence;
- H3D/H3E/H3F/H4/H5 results;
- rollback/teardown proof;
- remaining findings/limitations;
- BK01 preservation proof;
- candidate review result.

Do not claim final `HOUSE-A PASS` without Owner decision.

After Owner `HOUSE-A PASS`, produce the durable BK01 return package. BK01 still owns its own fresh Junction A retry and subsequent Junction B / Order / Claim decisions.
