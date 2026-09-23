# BRIEF — RESUME LANE B AFTER OPENCODE RECOVERY

Date: 2026-09-23
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Mode: `LONG_RUN / HERMES + AGENT RELAY`
Controller/state holder: Hermes
Technical governance: Sol
Owner authority: `OWNER-DECISION-GATE-CONTRACT-LANE-B-2026-09-23.md`
Entry state: `U-R2 COMPLETE / U-R3 IN PROGRESS`

## 1. Objective

Resume Lane B from the real post-OpenCode-recovery state.

Do NOT restart U-R1/U-R2, do NOT reopen the resolved OpenCode provider-auth blocker, and do NOT
return to the old Claude-controller or patch-by-review-round loop.

Immediate path:

`reconcile current U-R3 dirty continuation → complete U-R3 → deterministic gates → mechanical
commit/push → freeze candidate pair → Codex independent review → Sol verify/resolve → continue
under the Owner Decision Gate Contract`.
## 2. Measured entry snapshot

Planning:
- workspace: `D:\AI-Workspace\runtime\worktrees\house-lane-b-longrun-plan-20260922`
- branch: `work/house-lane-b-longrun-plan-20260922`
- measured HEAD before this brief: `b80f813050cb57457b4e31504e4a14720878d169`
- state: clean before this brief
- U-R2: COMPLETE

Execution:
- workspace: `D:\AI-Workspace\runtime\worktrees\house-h3d-h5-20260909`
- branch: `work/house-h3d-h5-20260909`
- measured HEAD: `b8a8f47e0ac04194dbfb6761c439f0ad5c0e8a33`
- state: DIRTY with U-R3 continuation work; preserve it exactly until classified
- U-R3 brief: `docs/platform/shared-runtime/BRIEF-U-R3-LANE-B-EXECUTABLE-CHECKS-2026-09-23.md`

The execution dirty state is not permission to reset/clean/stash/overwrite. Hermes must classify each
path against the U-R3 allowed scope and resume valid continuation work.

## 3. OpenCode blocker disposition

The prior OpenCode provider-auth failure is RESOLVED by the persistent managed contract.

Canonical proof:
`RUNTIME-HARDENING-OPENCODE-PROVIDER-CONTRACT-2026-09-23.md`

Pinned proof revision:
`931e3711f0fec19860be1e59769674a4981b7e4a`

Recorded gate:
`OPENCODE_PROVIDER_AUTH_FIX_PERSISTENT / U-R2_ELIGIBLE = PASS`
Before first new OpenCode dispatch, Hermes MUST:
- run the repo-owned OpenCode contract `verify`;
- run the real `probe`;
- stop only if verify/probe fails AND the canonical repair path cannot restore it inside existing authority.

A repeat of the same provider-auth drift is a technical remediation issue, not an Owner decision.

## 4. Required read order

1. this resume brief;
2. `OWNER-DECISION-GATE-CONTRACT-LANE-B-2026-09-23.md`;
3. `OWNER-ROUTING-OVERRIDE-LANE-B-HERMES-RELAY-CONTROLLER-2026-09-22.md`;
4. `OWNER-RULING-LANE-B-HERMES-RELAY-TAKEOVER-2026-09-22.md`;
5. `RUNTIME-HARDENING-OPENCODE-PROVIDER-CONTRACT-2026-09-23.md`;
6. `LEDGER-LANE-B-FINDING-FAMILIES-2026-09-22.md`;
7. `BRIEF-U-R2-LANE-B-CONTRACT-RECONSTRUCTION-2026-09-23.md`;
8. `CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md` at current planning revision;
9. execution-branch `BRIEF-U-R3-LANE-B-EXECUTABLE-CHECKS-2026-09-23.md`;
10. exact U-R3 dirty diff and files on disk.

Measured reality overrides stale prose. Do not erase unknown work to make a brief appear true.

## 5. Runtime and routing

Hermes MUST load/verify:
- canonical Agent Relay skill;
- WSTERA Control Sync skill;
- current OpenCode managed provider contract.

Ordinary implementation = OpenCode.
Qwen = bounded specialist/testing support.
Codex = independent review/classification.
Claude = difficult remediation only after `SEND_TO_CLAUDE`.
AGY is not a backend/database/security worker.
## 6. First action — reconcile and resume U-R3

Before any new worker mutation, Hermes must inspect the execution worktree and classify every current
dirty/untracked path against U-R3 §1.1.

At brief creation the dirty set included:
- modified `tools/shared-runtime/h3d/sql-static-check.mjs`;
- modified `tools/shared-runtime/package.json`;
- new `docs/platform/shared-runtime/fixtures/lane-b-per-stage-allowlist.json`;
- new `docs/platform/shared-runtime/runbooks/**`;
- new `tools/shared-runtime/h3d/generate-runbooks.mjs`;
- new `tools/shared-runtime/h3d/lane-b-gates.mjs`;
- new `tools/shared-runtime/inventory/lane-b-effective-reach.mjs`;
- new `tools/shared-runtime/lib/**`.

If these are valid U-R3 continuation work, preserve and continue them. If any path is outside scope or
has uncertain provenance, classify and route to Sol; do not destroy it.

## 7. U-R3 completion authority

U-R3 is `PRE_AUTHORIZED_CONTINUE`.

Hermes may dispatch/resume OpenCode and bounded Qwen support to finish the exact U-R3 brief,
run its deterministic gates, verify the diff, and mechanically commit/push the execution branch.

No LAB, DB, Auth, role, secret, Dashboard, Production, H3D-A1, H3D-LIVE, H3E, H4, or BK01
mutation is authorized by U-R3.

U-R3 terminal state is:
`U-R3 COMPLETE — EXECUTABLE CHECKS + RUNBOOKS LANDED; READY FOR CANDIDATE PAIR FREEZE`.
## 8. Candidate pair freeze

After U-R3 is committed/pushed and both branches are clean with remote parity:

Freeze the candidate identity as:

`(planning_sha, execution_sha)`

where:
- planning SHA is the exact current Lane-B contract/planning revision;
- execution SHA is the exact U-R3 landed revision;
- a candidate manifest records both branches, SHAs, changed-file sets, relevant artifact hashes,
  deterministic gate results, and its own SHA256.

Do not merge branches to manufacture one SHA.

Any change to either SHA invalidates the frozen candidate and all review inherited from it.

## 9. Review / Sol / Owner gates

After freeze:
1. `CODEX_REVIEW_REQUIRED` — Codex independently reviews the exact candidate pair.
2. if Codex mutates anything, the mutated input cannot inherit its own PASS; route under the locked
   independence rule and create a new candidate pair.
3. after Codex PASS without invalidating mutation: `SOL_VERIFY_OR_RESOLVE`.
4. Sol verifies review binding, evidence, gates, open findings, scope, and authority.
5. if technically complete, Sol may release continuation automatically until the next locked Owner gate.

The next expected live Owner gate remains `OWNER-CP-H3D-A1`.
No source/review PASS grants H3D-A1 live authority.

## 10. Failure handling

Use the Owner Decision Gate Contract exactly.

For a stable Issue Fingerprint:
ordinary repair #1 → exact failed gate → ordinary repair #2 → exact failed gate → Codex classify.

No ordinary repair #3.
Claude is available only after Codex says `SEND_TO_CLAUDE`.

Technical runtime/provider/tool failures with an existing canonical repair path remain technical
remediation. They are not Owner decisions.
## 11. Control Sync / board / docs

Hermes must keep governed state current at material transitions using the installed Control Sync
contract. Do not invent a Product code to bypass the unscoped House/Platform limitation.

Board/card closure and docs sync are pre-authorized after their evidence-backed stage transition.
Do not create an Owner stop for mechanical board closure, handoff writing, evidence normalization,
commit/push, or parity verification.

Flush Control Sync before a governed stop. Telemetry delivery failure remains separate from the
technical work verdict.

## 12. No extra Owner stops

After one-time Owner approval of the exact Owner Decision Gate Contract revision, Hermes MUST NOT
ask Owner for:
- ordinary implementation choices inside the locked brief;
- routine test/gate failures;
- allowed-scope remediation;
- commit/push;
- docs/evidence sync;
- child-card/stage closure;
- provider drift recoverable by the canonical OpenCode contract;
- Codex-requested bounded technical fixes that do not cross a contract boundary;
- Sol-verifiable evidence/revision ambiguity.

Only the contract's explicit `OWNER_DECISION_REQUIRED` conditions may stop for Owner.

## 13. Activation

This resume brief may be prepared and committed before activation.

Substantive continuation under the new authority contract begins only after the Owner explicitly
approves the exact committed revision of:
`OWNER-DECISION-GATE-CONTRACT-LANE-B-2026-09-23.md`.

After approval, Hermes records:

`SOL_DECISION_GATES_LOCKED`

and resumes from §6 without introducing any additional Owner checkpoint.

Until then: preserve current U-R3 work; no destructive action and no new live mutation.
