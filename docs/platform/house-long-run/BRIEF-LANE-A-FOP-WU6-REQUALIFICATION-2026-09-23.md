# BRIEF — LANE A FOP-WU6 REQUALIFICATION AFTER FAIL-CLOSED LANE

Date: 2026-09-23
Task: `WSTERA-CONTROL-TRUTH-SYNC-001`
Workflow: `WF-DEV-01 v1.3.0 / LONG_RUN`
Controller: Hermes
Execution: Hermes Native Swarm
Model: `deepseek-v4.1-flash:cloud`
Entry state: `OWNER_HOLD_PRODUCTION_MUTATION_V3 / GOVERNANCE_REQUALIFICATION_REQUIRED`
Live authority: NONE

## 1. Why this requalification is required

The original FOP-WU6 evidence is `SWARM_WORK_UNIT_FAIL`.

The installed `hermes-native-swarm` contract explicitly forbids the Commander/Hermes from
converting a worker/lane FAIL into PASS and requires advancement only from explicit validated states.

Therefore the later commander disposition in
`FOP-WU6-LANE-FAIL-DISPOSITION-2026-09-23.md` is evidence about why the checks were wrong,
but it is not itself a valid replacement for a Swarm PASS.
## 2. Objective

Re-run the FOP-WU6 qualification as a NEW bounded Native Swarm work unit using corrected,
positive/negation-aware checks against the already-reviewed artifacts.

Do not change the helper, harness, runbook, migration files, hub-web source, or Control Sync source
unless a new technical defect is actually proven. This unit is qualification/evidence only by default.

Target terminal state:

`FOP_WU6_REQUALIFIED / SWARM_WORK_UNIT_PASS / OWNER_HOLD_PRODUCTION_MUTATION_V3_RESTORED`

## 3. Canonical inputs

Planning current branch:
- `work/wstera-control-truth-sync-001`
- current pre-brief HEAD: `d73acaf19875985a474e1491a34121e97ef5be96`

Reviewed amendment revision:
- `4ca08f2578335c887bc119c6546c8f9d9be1276b`

Codex R2 record:
- `FOP-01-CODEX-VERDICT-R2-2026-09-23.md`
- verdict: `APPROVED_WITH_FINDINGS`
- `None requiring artifact change`

Hold:
- `OWNER-HOLD-PRODUCTION-MUTATION-V3-2026-09-23.md`

Original failed-lane disposition:
- `FOP-WU6-LANE-FAIL-DISPOSITION-2026-09-23.md`
## 4. Runtime and routing

Use installed `hermes-native-swarm` only for this requalification.

Model policy:
- `Model:cloud`
- exact baseline: `deepseek-v4.1-flash:cloud`
- `model_substitution_authorized: false`
- no Agent Relay or premium substitution for this unit.

Use one bounded evidence/verification lane. No substantive implementation is expected.

## 5. Required corrected checks

The new work unit MUST NOT reuse the two defective inline checks verbatim.

Required semantics:

1. **No-live-authorization claim check**
   - must distinguish a prohibition/negation from an authorization claim;
   - sentences containing `no`, `not`, `never`, `pending`, `without approval`, or equivalent
     must not be treated as positive authorization;
   - a positive authorization claim outside the Owner hold must fail the lane.

2. **Scope/baseline check**
   - compare WU6-owned mutations against the correct baseline after WU5;
   - do not count pre-existing uncommitted WU5 helper/harness paths as WU6 mutations;
   - prove the actual WU6 changed-path set.

3. **Positive artifact identity checks**
   - helper SHA256 = `d87bd4aa938d0d0a853cea84289e182d29e2cafe6237ff2df3e4fb5a3a77398b`;
   - harness SHA256 = `f62317c26923a0b41b143e48f0ed71ea8b8c5f8b1f4e2deb52ba89e4440f0b8c`;
   - runbook contains `WORKER_LIVE_PROOF_MISSING`;
   - F-OP-01 packet/finding state does not claim live authorization;
   - `git diff --check` clean;
   - secret scan = 0.

4. **Native Swarm result**
   - lane must end as actual `SWARM_WORK_UNIT_PASS`;
   - `SWARMCTL_EXIT=0`;
   - no commander override/disposition may substitute for the lane result.
## 6. No-live boundary

This work unit is offline/source/evidence-only.

Forbidden:
- live DB connection;
- backup creation;
- migration dry-run against live DB;
- setting `LANE_A_LIVE_DB_AUTHORIZED`;
- setting `LANE_A_PRODUCTION_APPLY_AUTHORIZED`;
- deploy / Cloudflare mutation;
- Control Sync skill install;
- PR merge;
- any production mutation.

## 7. Codex R2 preservation rule

If the requalification changes NONE of:
- helper bytes;
- harness bytes;
- active runbook bytes;
- F-OP-01 operator-contract semantics;
- reviewed migration identities,

then Codex R2 at `4ca08f2` remains the independent technical review of those artifacts.

Hermes must prove the artifact hashes remain identical and record that no reviewed artifact changed.
No additional Codex run is required solely for a new evidence-only Swarm PASS.

If any reviewed artifact changes, Codex R2 is invalidated for that artifact and a new independent
review is required before returning to V3.

## 8. Completion and hold restoration

After a genuine `SWARM_WORK_UNIT_PASS`:
- persist the new evidence path + SHA256;
- record the exact new work-unit id/correlation id;
- verify current worktree clean / remote parity after mechanical commit;
- state explicitly that the prior FAIL remains historical and was not rewritten;
- state that the new PASS is a separate requalification, not a retroactive conversion.

Then restore state:

`OWNER_HOLD_PRODUCTION_MUTATION_V3`

Only after this requalification PASS may the Owner consider `LANE_A_PRODUCTION_RELEASE_V1`.
