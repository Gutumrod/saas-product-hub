# RUN MANIFEST — HOUSE-SHARED-RUNTIME-ISOLATION-001

Manifest Status: `APPROVED`
Task ID: `HOUSE-SHARED-RUNTIME-ISOLATION-001`
Workflow: `WF-DEV-01 v1.2.0`
Execution Mode: `LONG_RUN`
Owner Approval: `YES — 2026-09-16 continuation instruction`
Repository: `Gutumrod/saas-product-hub`
Coordinator Branch / Worktree: `master / D:\AI-Workspace\projects\saas-product-hub`
Execution Branch: `work/house-h3d-h5-20260909`
Runtime Procedure: `kanban-external-agent-dispatch v2.5.0`
Relay Composition: `WF-RELAY-01 v1.3.0`
Failure Behavior: `STOP / FAIL CLOSED`

## Source of Truth

1. `BRIEF-HOUSE-SELL-READY-LONG-RUN-2026-09-16.md` — current Owner/runtime overlay and scope.
2. `TASK-HOUSE-SHARED-RUNTIME-ISOLATION-001.md` — current checkpoint state.
3. `BRIEF-CLAUDE-H3D-STATIC-ACCEPTANCE-REMEDIATION-2026-09-09.md` — H3D S1–S5/A1 technical contract.
4. `BRIEF-CLAUDE-H3D-H5-HOUSE-A-LONG-RUN-EXECUTION-2026-09-09.md` — historical technical stage contract; worker routing superseded.
5. `HANDOFF-H3D-WINDOWS-TO-MAC-2026-09-09.md` at remote execution commit `d6707c0` — active-device handoff.
6. `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md` + `AGENTS.md`.

## Run Objective

Advance only the House shared-runtime isolation critical path using exact-revision evidence, deterministic gates, independent Codex review, and explicit Owner checkpoints before live/security-critical mutations.
## Global Boundaries

### Allowed

- inspect/read canonical House, execution worktrees, PS01 execution worktree, Git and Relay state;
- static/offline implementation inside a declared Work Unit and allowed paths;
- SELECT-only LAB verification explicitly permitted by the stage contract;
- deterministic tests, lint, typecheck, build, security scans and evidence generation;
- commit/push to the authorized execution branch after exact diff review;
- independent read-only review against the exact target revision.

### Prohibited

- no `git reset`, `git clean`, force checkout, force push, or destructive cleanup of unknown local state;
- no Production mutation or deploy;
- no paid/cost change;
- no unrelated Control Plane, billing-core, Module Hub, KMO, Council, or product feature expansion;
- no merge into `master` or original PS01 branches inside this run;
- no worker self-approval;
- no silent agent substitution or scope widening;
- no live LAB DML/Auth/grant/hook/role mutation before its declared Owner checkpoint.

## Canonical Budgets

```yaml
local_fix_attempts_per_issue_cycle: 2
reviewer_remediation_attempts_per_finding_cycle: 2
senior_escalations_per_authorized_decision: 1
```
## Reviewer Policy

```yaml
primary_reviewer: Codex
fallback_reviewer: Claude
fallback_only_when_primary_unavailable: true
no_self_review: true
no_reviewer_shopping: true
critical_boundary_forces_review: true
max_stages_per_batch: 3
max_changed_files_per_batch: 15
```

Claude difficult remediation is a separate route from Claude fallback review. Claude may not review a diff it authored or last substantively remediated.

## Worker Capability Rules

- `PRIMARY_GENERAL_IMPLEMENTATION_WORKER` -> `agent-opencode` for ordinary implementation/remediation.
- `SPECIALIST` -> `agent-qwen` for bounded command-heavy SQL/test/harness qualification declared below.
- `UI-UX-SPECIALIST` -> `agent-agy`; no stage in this manifest currently requires UI work.
- independent reviewer -> `agent-codex`; Claude fallback only on evidenced Codex unavailability.
- difficult remediation -> Claude only through the active Relay escalation contract.

## Stage Graph

| Stage | Objective | Entry Condition | Work Units | Review Batch | On Pass | Owner Checkpoint |
|---|---|---|---|---|---|---|
| `PRE-01` | Verify runtime + active Mac worktree truth | Brief checkpoint pushed | deterministic preflight | N/A | `H3D-S` READY | NONE |
| `H3D-S` | Close S1–S5 static acceptance findings | PRE-01 PASS | OpenCode + AUTO_GATE | `BATCH-H3D-S` | Codex review | `OWNER-CP-H3D-A1` |
| `H3D-A1` | Rollback-only/two-session atomicity/concurrency proof | Owner authorizes A1 | Qwen qualification; bounded fixes only if needed | `BATCH-H3D-A1` | Codex review | `OWNER-CP-H3D-LIVE` |
| `H3D-LIVE` | Real H3D LAB app-path proof + teardown | Owner authorizes live H3D | Qwen execution/qualification; bounded remediation by rule | `BATCH-H3D-LIVE` | H3D candidate PASS | `OWNER-CP-H3E` |
| `H3E` | Retire reusable PS01 direct DB login safely | H3D approved + Owner authorizes H3E | OpenCode bounded source/SQL + Qwen verification | `BATCH-H3-CLOSE` | `H3F` | NONE |
| `H3F` | Re-measure shared surfaces and close H3 candidate | H3E provisional pass | Qwen read-only inventory/compare | `BATCH-H3-CLOSE` | Codex review | NONE |
| `H4` | Disposable-product positive/negative isolation proof | H3 approved + Owner authorizes H4 | OpenCode bounded tooling + Qwen proof/teardown | `BATCH-H4` | Codex review | NONE |
| `H5` | Existing-product regression + rollback evidence | H4 approved/teardown clean | Qwen verification; OpenCode only for reviewed defects | `BATCH-H5-HOUSE-A` | final independent review | `OWNER-CP-HOUSE-A` |

## PRE-01 — Hermes Preflight

State: `PENDING`
Depends On: brief/manifest checkpoint committed and pushed.

Hermes must verify and persist before any substantive worker dispatch:
- current canonical Relay runtime path, version `2.5.0`, hash and effective `HERMES_HOME`;
- readiness of OpenCode and Codex; Qwen/Claude only before first use;
- active Mac House worktree exists and actual branch/HEAD/dirty/ahead-behind state is known;
- active Mac PS01 execution worktree exists and actual branch/HEAD/dirty/ahead-behind state is known;
- remote House execution branch contains `d6707c0` and no unexpected divergent history;
- unknown Mac local changes are preserved and classified, never cleaned/reset;
- source documents and execution branch are mutually consistent;
- no Production authority is present.

If the Mac cannot be inspected or contains unclassified local work, PRE-01 = `BLOCKED`. Hermes must not silently switch execution back to Windows.

## H3D-S — Static Acceptance Remediation

State: `PENDING`
Review Batch: `BATCH-H3D-S`
Depends On: `PRE-01 PASS`
Invalidated By: changes to H3D runner/fixtures/catalog/tooling after provisional evidence.
### H3D-S Objective / Scope

Close only S1–S5 from the static-acceptance brief without changing the PS01 product contract or performing live mutation.

Allowed writes:
- `tools/shared-runtime/h3d/**` only as required by S1–S5;
- `docs/platform/shared-runtime/fixtures/h3d-authz-fixture-seed.sql`;
- `docs/platform/shared-runtime/fixtures/h3d-authz-fixture-teardown.sql`;
- H3D expected catalog/tooling required to classify FK vs monitored non-FK surfaces;
- H3D evidence/operator-pack sections required for the corrected state machine.

Prohibited:
- PS01 business/schema source;
- H3E/H3F/H4/H5 implementation;
- fixture seed/teardown execution;
- Auth create/delete, grant DML, hook mutation, H3D live run;
- merge/release/deploy.

### H3D-S-WU01

Worker: `agent-opencode` / `PRIMARY_GENERAL_IMPLEMENTATION_WORKER`.
Objective: implement S1–S5 exactly, including tests.
Expected Stop: AUTO_GATE handoff; never self-approve.
Timeout decomposition: split by finding groups `S1+S2`, `S3+S4`, `S5+evidence` only if required; otherwise `REVIEW_REQUIRED`.

### H3D-S AUTO_GATE

- `npm run selftest` PASS under `tools/shared-runtime`;
- `node h3d/sql-static-check.mjs` PASS;
- worktree-commit binding selftest PASS;
- receipt chain/dead-end/tamper tests PASS;
- seed-manifest hash tamper test PASS;
- `camera_access_audit` fixture-scope test PASS;
- correct catalog verification command PASS using SELECT-only DB access when the session already has the required credential safely available;
- SELECT-only LAB baseline remains unchanged where verification is possible;
- `git diff --check` PASS;
- allowed-path diff PASS;
- secret/private-key/JWT/connection-string scan PASS;
- exact target SHA and clean/pushed branch evidence required before review.

AUTO_GATE PASS -> `PROVISIONAL_PASS` -> `REVIEW_REQUIRED` for `BATCH-H3D-S`.

### BATCH-H3D-S

Reviewer: Codex, independent, read-only.
Critical boundary: security/Auth/runtime authorization state machine.
Required packet: exact base/head, S1–S5 change ledger, all failed/remediated history, AUTO_GATE outputs, diff, evidence paths, known limitations including unexecuted A1.

On `BATCH_APPROVED`:
- mark H3D static acceptance approved only;
- transition to `OWNER_HOLD` at `OWNER-CP-H3D-A1`;
- do not execute A1 or H3D live mutation automatically.

## H3D-A1 — Rollback-Only Concurrency Validation

State: `PENDING / OWNER-GATED`
Entry: explicit Owner authorization after `BATCH-H3D-S` approval.
Objective: prove atomic rollback, locking and two-session concurrency/failure behavior without leaving committed product/auth/grant/hook residue.

Primary worker: Qwen `SPECIALIST` for bounded command-heavy validation using the already-reviewed harness/SQL.
OpenCode may be dispatched only for a bounded defect returned by the gate/reviewer.

AUTO_GATE must prove:
- exact authorized test plan executed;
- intended rollback/lock behavior observed;
- no durable fixture/business/Auth/grant/hook residue;
- shared surfaces unchanged outside expected ephemeral transaction state;
- exact commands/exit codes and revision-bound evidence persisted.
