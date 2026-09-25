# SOL RULING — EXECUTION_PROOF EXCLUSION DEFECT / REPAIR LADDER

Date: 2026-09-25
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Fingerprint: `EXECUTION_PROOF_EXCLUSION_PREFIX_STRIP_V1`
Evidence: `ATTEMPT5-FAILURE-RECORD-2026-09-25.md`
Authority: Lane-B Owner Decision Gate Contract §§4, 6, 7, 10

State: `BLOCKED_TECHNICAL_REMEDIATION / ORDINARY_REPAIR_1_AUTHORIZED`

## 1. Classification

This is a new technical fingerprint, distinct from:
- the B-3 non-BUILD harness-evidence guard;
- the scanner false-positive fingerprint;
- the stdout provenance mismatch.

Root cause is implementation-level:
`execution_proof._excluded()` uses character-set stripping where prefix normalization is required.

This does NOT require a new Owner decision because the intended security invariant already exists:
harness-owned evidence roots are excluded while worker writes outside those roots remain fail-closed.

The repair must restore that existing invariant; it must not redefine or weaken it.
## 2. Repair-ladder slot

Enter Lane-B §10.1 at:

`ordinary repair #1 -> exact gate -> focused Codex review -> B0.2 retry`

This is NOT:
- ordinary repair #3 of the scanner fingerprint;
- a Claude remediation;
- an Owner live-mutation gate;
- permission to install the protected runtime.

If repair #1 fails the exact gate for the same fingerprint:
- ordinary repair #2 is permitted;
- then rerun the exact gate;
- if still failing, Codex classify this fingerprint.

No repair #3.

## 3. Allowed source scope

Source-only remediation is authorized in canonical Relay source for:
- `execution_proof.py`;
- the exact mirrored canonical copy if the release contract requires byte parity;
- focused regression tests for this fingerprint;
- release-verifier assertions only if needed to prove the existing invariant.

Do not edit scanner logic.
Do not alter routing/model/provider.
Do not install into live runtime in this repair step.
## 4. Exact acceptance gate

Repair #1 must prove all of the following:

1. `.secretary-relay/**` is excluded from execution-proof workspace mutation accounting;
2. `.git/**` is excluded according to the same documented invariant;
3. an unauthorized worker write outside excluded roots is still detected;
4. allowed-path logic is unchanged except for correct prefix normalization;
5. no broad path suppression is introduced;
6. targeted regression tests PASS;
7. full canonical Relay test suite PASS;
8. canonical Relay release verifier PASS;
9. canonical skill/adapter parity required by the release manifest is intact;
10. no install/live-runtime mutation occurred.

The test suite must include a non-vacuity control that would fail on the pre-fix implementation.

## 5. Review requirement

Because this source change affects an execution/isolation gate relied on by later review stages,
Lane-B contract §6 requires a focused independent Codex review before the repaired gate is relied on
for continuation.

The review must bind to the exact canonical repair revision and inspect only scanner-clean files.

A Codex PASS/APPROVED result here reviews the execution-proof repair only.
It does NOT replace B0.2 scanner classification.

After focused review PASS:
- re-run B0.2 exactly once on the repaired canonical source through normal Relay provenance;
- if B0.2 returns admissible `SEND_TO_CLAUDE`, continue the already-approved Claude scanner path.
## 6. Failure-record disposition

`ATTEMPT5-FAILURE-RECORD-2026-09-25.md` is admissible Lane-B evidence and SHOULD be committed
to the planning branch.

It records measured truth, does not mutate implementation, and falls under the task's mechanical
integration authority. The standing `claude-owns-git-commits` rule is already overridden for this
task and branch by the Owner-approved Lane-B takeover/gate contract.

Commit the failure record and this ruling together as exact files only.

## 7. T78 worktree-removal finding

T78 remains separate from the execution-proof fingerprint.

Until its cleanup semantics are fixed/reviewed:
- do not archive/complete a Relay card that references a reusable/shared worktree;
- use disposable worktrees for diagnostics;
- never rely on an unpushed local-only worktree surviving card cleanup.

The third T78 occurrence does not change the repair classification above, but it remains a
high-priority Relay safety backlog item.

## 8. Terminal next state

After this ruling is committed:

`LANE_B = BLOCKED_TECHNICAL_REMEDIATION / EXECUTION_PROOF_REPAIR_1`

Lane A remains independent and may continue under the dual-lane controller.
