# OWNER ROUTING OVERRIDE — LANE B HERMES + RELAY CONTROLLER

Date: 2026-09-22
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Owner directive: migrate Lane B control from the Claude-held review loop to Hermes-held LONG_RUN orchestration using canonical Agent Relay, with WSTERA Control Sync loaded and active.
Authority: source/design/test/evidence/review orchestration only until the existing Owner live-mutation checkpoints are reached.

## 1. This override changes controller routing, not technical truth

Effective immediately:

- Hermes becomes the Lane B LONG_RUN orchestrator, canonical brief holder, state holder, gate tracker, and integration verifier.
- Canonical Agent Relay becomes the primary execution/review routing mechanism.
- Claude is no longer the Lane B controller/state holder.
- Claude becomes `SENIOR_DIFFICULT_REMEDIATION_ENGINEER` only, reached through the Relay escalation ladder.
- Codex remains independent reviewer/classifier and may perform only bounded fixes allowed by Relay; it must never self-approve a revision it mutates.
- OpenCode is the ordinary `PRIMARY_GENERAL_IMPLEMENTATION_WORKER`.
- Qwen is bounded secondary remediation/testing support.
- AGY remains UI/UX-only for ordinary Relay work. This Lane B package currently has no UI work, so AGY MUST NOT be used for backend/database/auth/security-contract remediation.
- Hermes Native Swarm may be used only for bounded mechanical inspection/testing/evidence work where its v0.1.1 contract fits. Swarm does not own Lane B state or remediation reasoning.

All existing technical evidence, Owner checkpoints, security boundaries, and exact-revision review requirements remain in force unless this file explicitly overrides routing behavior.
## 2. Mandatory runtime skills — load before any dispatch

Hermes MUST load and verify these exact installed runtime skills before planning or dispatch:

1. Agent Relay:
   `D:\AI-Workspace\runtime\hermes-native\data\skills\devops\kanban-external-agent-dispatch\SKILL.md`
   - installed version observed at brief creation: `2.5.3`
2. WSTERA Control Sync:
   `D:\AI-Workspace\runtime\hermes-native\data\skills\devops\wstera-control-sync\SKILL.md`
   - installed version observed at brief creation: `0.1.0`

Hermes MUST record the exact path, version, SHA256, effective `HERMES_HOME`, and runtime-guard result in the Relay preflight evidence.

On Windows, run the Relay platform guard required by the installed Relay skill before creating execution cards.

If either skill is missing, unreadable, version-drifted, or the runtime guard fails, state = `LANE_B_RELAY_PREFLIGHT_BLOCKED`; do not fall back silently to Swarm, direct CLI, Claude-controller mode, or an older Relay copy.

Control Sync is mandatory for governed WSTERA state transitions. Because the installed Control Sync contract says current RPC 0006 rejects unscoped House/Platform work, Hermes MUST NOT invent a Product code. Use activity-only telemetry where required and record Work Queue projection as blocked until the reviewed compatibility patch is deployed.
## 3. Required read order

Before any mutation or dispatch, Hermes MUST read in this order:

1. this routing override;
2. `STATUS-LANE-B-PRE-A1-CONTROLLER-PACKAGE-2026-09-22.md`;
3. `REVIEW-CODEX-LANE-B-CONTROLLER-PACKAGE-ROUND4-2026-09-22.md`;
4. `OWNER-DECISION-LANE-B-PRE-A1-REMEDIATION-2026-09-22.md`;
5. `BRIEF-LANE-B-SHARED-RUNTIME-LONG-RUN-CLAUDE-AGY-CODEX-2026-09-22.md`;
6. `RUN-MANIFEST-LANE-B-SHARED-RUNTIME-LONG-RUN-2026-09-22.md`;
7. `ANALYSIS-LANE-B-LONG-RUN-BLOCKERS-2026-09-22.md`;
8. `CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md`;
9. `BRIEF-AGY-LANE-B-PRE-A1-FINDINGS-REMEDIATION-2026-09-22.md`;
10. `VERIFICATION-H2-H4-CONSISTENCY-2026-09-22.md`;
11. `BATCH-H3D-S-2026-09-22.md`;
12. exact execution source/evidence required by the active finding.

The old Claude→AGY→Codex→Claude routing language remains historical context only where it conflicts with this override. Technical facts and Owner live-mutation boundaries from those documents remain binding.
## 4. Inherited measured state at takeover

Planning worktree:
`D:\AI-Workspace\runtime\worktrees\house-lane-b-longrun-plan-20260922`

Measured before this override:
- branch: `work/house-lane-b-longrun-plan-20260922`
- tracked HEAD before this override: `2db3f89bc2b2d22fea46166658cc4d1611dcca41`
- remote parity: exact at that measurement
- tracked tree: clean
- untracked evidence: `REVIEW-CODEX-LANE-B-CONTROLLER-PACKAGE-ROUND4-2026-09-22.md` — preserve; never clean/reset it away.

Execution worktree:
`D:\AI-Workspace\runtime\worktrees\house-h3d-h5-20260909`

Measured state:
- branch: `work/house-h3d-h5-20260909`
- HEAD: `2b1af861aa608f08abb0bd8224821b9ca5ac9981`
- remote parity: exact
- worktree: clean

Round-4 reviewed package revision: `675975b85d4ccb106a39a9d2166b7dbbab70edb0`
Round-4 verdict: `FAIL`
Open findings: `NEW-DEFECT-08`, `NEW-DEFECT-09`.
No LAB/Auth/role/secret/live mutation was performed by that review.
## 5. Mandatory takeover preflight

Hermes MUST reconcile reality before releasing any worker:

- re-read planning and execution HEAD/branch/remote/dirty state;
- classify every untracked/dirty file without deleting, stashing, resetting, or overwriting unknown work;
- persist the Round-4 review evidence under Lane-B control before relying on it as canonical durable evidence;
- confirm no overlapping LAB/Auth/config/role mutation window is active;
- run Relay runtime guard and record exact skill hashes;
- run Control Sync doctor/outbox-status without printing secrets;
- build one Relay preflight packet for this task with `work_type=OTHER` and explicit Owner-approved Relay routing;
- bind every execution card to exact allowed/prohibited paths and exact revision;
- set failure behavior to `STOP` outside the remediation authority below.

Do not execute H3D-A1, H3D-LIVE, H3E, H4, Production mutation, or BK01 Junction A during takeover.

## 6. Failure/remediation circuit breaker

For each stable `Issue Fingerprint`:

1. ordinary bounded repair attempt #1;
2. rerun the exact failed deterministic gate;
3. if still failing, ordinary bounded repair attempt #2;
4. rerun the exact failed deterministic gate;
5. if still failing, NO ordinary repair #3 — dispatch Codex for classification;
6. Claude may be dispatched only when Codex explicitly returns `SEND_TO_CLAUDE` for bounded difficult remediation;
7. after one Claude repair, rerun the exact failed gate before any further action.

A materially new root cause receives a new fingerprint. Do not reset counters merely because wording or filenames changed.
## 7. Package-review circuit breaker — no legacy Round 5 loop

The prior package reached four Codex FAIL rounds. Do not continue with a fifth patch-by-finding review under the old pattern.

Set state to `PACKAGE_RECONSTRUCTION_REQUIRED` when any of these is true:

- an independent review returns 3 or more material findings;
- any HIGH finding shows a foundational invariant/model is wrong;
- the same root-cause family survives across two reviewed revisions;
- two consecutive independent reviews FAIL;
- a fix for one finding creates another finding in the same invariant family.

In `PACKAGE_RECONSTRUCTION_REQUIRED`:

- stop incremental reviewer-driven patching;
- build a root-cause/finding family ledger from all prior rounds;
- reconstruct the affected contract/package from source-of-truth invariants;
- run pre-review falsification and deterministic validation across the whole reconstructed surface;
- freeze a new exact revision;
- then request one fresh independent Codex review of that reconstructed revision.

Do not label that fresh review “Round 5” as continuation of the old loop. It is a new reconstructed package review bound to a new baseline.

## 8. Current reconstruction target

The repeated root-cause family is the effective privilege / credential boundary model.

Hermes must require the reconstructed package to distinguish explicitly:

`catalog presence != object grant != schema USAGE != effective reach != RLS visibility != ownership capability`

The reconstruction must also preserve stage-specific exceptions, exact qualified relation identity, managed `cron/net` residual exposure, non-vacuous checks, and harmless/bounded capability probes.
## 9. First Relay objective after takeover

The first execution objective is NOT to start H3D-A1 and NOT to patch NEW-DEFECT-08/09 in isolation.

Hermes must first create one reconstruction unit that:

- inventories Round 1-4 findings and groups them by root-cause family;
- verifies each still-open claim against execution source `2b1af861...`;
- reconstructs the affected credential/effective-privilege contract coherently;
- updates only the minimum authorized planning/source/test/evidence artifacts required by that reconstruction;
- adds deterministic falsification checks that would fail for unqualified identity, catalog-only reach, RLS-blind zero, or unsafe privilege assumptions;
- produces one exact candidate revision and complete changed-file list;
- runs repo-level deterministic gates before independent review.

Ordinary implementation/remediation is routed to OpenCode unless the work is purely bounded specialist/testing support suitable for Qwen.

Codex is withheld until the candidate revision is frozen and pre-review validation passes.

Claude is withheld unless Codex classifies a remaining bounded defect as `SEND_TO_CLAUDE`.

## 10. Independent review and release rule

Codex review must use `INDEPENDENT-QA` context where practical and must be bound to the exact frozen SHA.

If Codex PASSes without mutation, Hermes performs integration/state consistency verification and may advance only to the next already-authorized technical state.

If Codex mutates, Codex cannot self-approve; route the new SHA through the Relay independence rule.

No reviewer PASS authorizes an Owner checkpoint automatically.
## 11. Owner checkpoints remain hard stops

This override does NOT authorize any live mutation beyond existing authority.

Explicit Owner approval is still required at:
- `OWNER-CP-H3D-A1`
- `OWNER-CP-H3D-LIVE`
- `OWNER-CP-H3E`
- `OWNER-CP-H4`
- `OWNER-CP-HOUSE-A`

No silence, prior approval, reviewer PASS, Relay PASS, Swarm PASS, or Control telemetry counts as Owner approval.

## 12. Control Sync requirements

Hermes owns canonical task projection; Relay activity is evidence, not work truth.

Mandatory sync moments:
- takeover/resume;
- reconstruction start;
- worker dispatch/change;
- independent review start/verdict;
- blocker/failure/remediation state change;
- Owner hold;
- package reconstruction PASS;
- task/stage closure.

If Work Queue projection is blocked by the current unscoped House/Platform RPC limitation, record that blocker and emit permitted activity-only telemetry. Never fabricate a Product identity to force Control sync.

Flush the Control Sync outbox before stopping the run. Pending/dead-letter delivery is an observable sync problem, not permission to rewrite the work verdict.
## 13. Brief-creation runtime fingerprints

Observed on Windows at brief creation:

- Relay `SKILL.md` SHA256: `be80473c22ff0eda0f3480b35aa056287983f861c83c6a72a6ef21db721d0d5f`
- Control Sync `SKILL.md` SHA256: `e1d239032c837c93dccf74f61685383c6972afa689ddcee771125254ab438630`

Hermes must remeasure these values at takeover. A mismatch is not automatically bad, but it must be classified before work continues.

## 14. Required takeover output before any substantive dispatch

Hermes must persist one takeover/preflight record containing:

- exact planning/execution HEAD + remote parity + dirty/untracked classification;
- loaded Relay path/version/hash;
- loaded Control Sync path/version/hash;
- Relay runtime guard result;
- Control Sync doctor/outbox state;
- active Owner authority and prohibited live actions;
- root-cause ledger for Codex R1-R4;
- current Issue Fingerprint(s);
- selected Relay graph and exact worker roles;
- first reconstruction unit with acceptance checks;
- confirmation that legacy `Round 5` patch-loop routing is disabled.

Only after that record is complete may Hermes release the first Relay worker card.

Initial controller state under this override:
`LANE_B_HERMES_RELAY_TAKEOVER_REQUIRED`
