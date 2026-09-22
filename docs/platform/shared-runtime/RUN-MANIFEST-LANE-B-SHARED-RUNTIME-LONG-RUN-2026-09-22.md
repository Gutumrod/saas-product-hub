# RUN MANIFEST — LANE B SHARED-RUNTIME LONG_RUN

Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Workflow: Owner task-specific Lane-B LONG_RUN
Status: `LOCKED FOR EXECUTION AFTER PRE-01`
Planning baseline: `origin/work/house-h3d-h5-20260909@d6707c0c96309f2f0efb8f83f00b5f34aee6d2b5`

## Agent loop

`CLAUDE CONTROL → AGY EXECUTE → CODEX REVIEW/FIX → CLAUDE CHECK → NEXT UNIT`

Rules:
- AGY = ordinary labor.
- Codex = review + bounded fixes.
- Claude = controller + hard work only.
- Codex mutation requires Claude review PASS before continuation.
- Claude mutation requires Codex independent review before continuation.
- Any mutation invalidates review on the prior SHA.

## Stage table

| Stage | Main executor | Review/check | Owner stop |
|---|---|---|---|
| PRE-01 | Claude control + AGY read-only collection | Claude | none |
| H3D-S | AGY | Codex → Claude | after review: H3D-A1 |
| H3D-A1 | AGY under exact runbook | Codex → Claude | before execution |
| H3D-LIVE | AGY under exact runbook | Codex → Claude | before execution |
| H3E | AGY ordinary execution; Claude only hard remediation | Codex → Claude | before execution |
| H3F | AGY read-only remeasure | Codex → Claude | none |
| H4 | AGY under exact runbook | Codex → Claude | before execution |
| H5 | AGY regression/evidence | Codex → Claude | final HOUSE-A |
| HOUSE-A package | Claude assembles state; AGY evidence support | Codex final independent review | Owner final decision |

## Required stage ordering

`PRE-01`
→ `H3D-S`
→ `BATCH-H3D-S`
→ `OWNER-CP-H3D-A1`
→ `H3D-A1`
→ `BATCH-H3D-A1`
→ `OWNER-CP-H3D-LIVE`
→ `H3D-LIVE`
→ `BATCH-H3D-LIVE`
→ `OWNER-CP-H3E`
→ `H3E`
→ `H3F`
→ `BATCH-H3-CLOSE`
→ `OWNER-CP-H4`
→ `H4`
→ `BATCH-H4`
→ `H5`
→ `BATCH-H5-HOUSE-A`
→ `OWNER-CP-HOUSE-A`

No stage may inherit a PASS across a changed revision.

## PRE-01 required measured facts

Before execution:
- inspect active Mac worktree;
- classify dirty `tools/shared-runtime/h3d/h3d-live-runner.mjs`;
- verify branch/HEAD/upstream/parity;
- verify PS01 execution worktree state;
- verify remote execution branch;
- verify all Source of Truth files;
- preserve unknown local work;
- confirm no Production authority.

If dirty-state provenance cannot be resolved safely: `PRE-01 BLOCKED`.

## Completion

Technical end-state:
`HOUSE-A REVIEW READY`

Owner end-state:
`SHARED-RUNTIME PLATFORM ISOLATION: PASS / HOUSE-A PASS`

Then produce BK01 return package. Do not perform BK01 Junction A from this run.
