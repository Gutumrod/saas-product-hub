# RUN MANIFEST — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Manifest Status: APPROVED
Task ID: WSTERA-HOUSE-PRODUCTION-CLOSURE-001
Workflow: `WF-DEV-01` v1.3.0
Execution Mode: `LONG_RUN`
Manifest Revision: PINNED BY TASK / LAUNCH HANDOFF TO THE COMMIT CONTAINING THIS FILE
Owner Approval: YES
Coordination Repository: `Gutumrod/saas-product-hub`
Coordination Branch: `work/house-production-closure-longrun-20260919`
Coordination Base SHA: `01cfc28dbb9ea8081f389240d57797c70cda7d9b`
Hub/Control Repository: `Gutumrod/hub-web`
Hub/Control Branch: `work/house-platform-closure-20260919`
Hub/Control Base SHA: `125af8435f4c80b9525c72405b44807206905fc5`
Runtime Procedure: `kanban-external-agent-dispatch v2.5.3`

## Source of Truth

1. `docs/platform/house-long-run/BRIEF-WSTERA-HOUSE-PRODUCTION-CLOSURE-LONG-RUN-2026-09-19.md` at or after `c5fd93b5bbe1a23020bb1d4f54992dac5873c51c`.
2. `AGENTS.md`.
3. `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md`.
4. `docs/platform/HANDOFF-WSTERA-HOUSE-CONTINUATION-2026-09-12.md`.
5. `docs/platform/BRIEF-CONTROL-PLANE-READ-ONLY-CONTINUATION-2026-09-11.md`.
6. `Gutumrod/hub-web:docs/control-plane/OWNER-DIRECTIVE-BILLING-AUTHORITY-BOUNDARY-2026-09-11.md`.
7. `Gutumrod/wstera-workflows:WORKFLOW-REGISTRY.md` Registry v1.5.0.
8. `Gutumrod/wstera-workflows:workflows/development/WF-DEV-01-LONG-RUN.md` v1.3.0.
9. `Gutumrod/wstera-workflows:workflows/relay/WF-RELAY-01-AGENT-RELAY.md` v1.3.0 / runtime v2.5.3.
10. `Gutumrod/wstera-workflows:policies/PRODUCTION-READINESS-STANDARD.md` v1.0.0.
11. Exact current source/tests/evidence on the revision under execution.
12. SB01 LR-2F exact accepted projection contract when it becomes available.

If a source conflict changes scope/architecture/security/business authority, STOP as `OWNER_HOLD`. Historical documents do not override later explicit Owner decisions or current exact-revision evidence.

## Run Objective

Reach:

`READY FOR OWNER HOUSE CLOSURE REVIEW — WSTERA-HOUSE-PRODUCTION-CLOSURE-001`

with all House/shared-platform blockers in this manifest either:
- closed with exact-revision evidence; or
- explicitly classified as external product-only work that no longer blocks House.

The run must not make any product-specific production-ready claim.

## Global Boundaries

### Allowed

Coordination repository:
- `docs/CURRENT_STATUS.md`
- `docs/platform/**` only as required for current House task/evidence/handoff/readiness records
- task/manifest/dispatch/evidence artifacts for this Task
- non-destructive merge of `origin/master` into the LONG_RUN House branch

Hub/Control repository:
- existing `client/**`, `server/**`, `drizzle/**`, `scripts/**`, `.github/**`, config and docs needed for the locked House scope
- tests/evidence for R15, signer hardening, fulfillment, Control read projection, production safety/readiness
- existing-target Cloudflare deployment after production-readiness gate approval
- non-destructive least-privilege DB role/grant operations required by R15 after the exact source/migration package is independently approved

External read-only:
- `Gutumrod/stripe-billing` for SB01 LR-2F state/evidence/contract inspection
- `Gutumrod/modules-hub` for mandatory Reuse Gate
- `Gutumrod/wstera-workflows` for workflow/policy/runtime authority

### Prohibited

- writes to any product repository
- SB01 source implementation or provider mutation
- direct Stripe payment/customer/subscription mutation from House
- direct billing truth write from Control
- changing `canExecutePaymentActions: false`
- destructive DB/drop/delete/data-clearing operations
- force push, hard reset, clean, rebase of unknown/shared work, or history rewriting
- writing secrets to repository, evidence, logs, prompts, dispatches, or chat
- new paid service/plan
- architecture/business/security-policy expansion
- mass security refactor unrelated to the critical path
- merge to default branch unless the stage explicitly reaches and passes the declared merge/release gate

## Canonical Budgets

```yaml
local_fix_attempts_per_issue_cycle: 2
reviewer_remediation_attempts_per_finding_cycle: 2
senior_escalations_per_authorized_decision: 1
```

Use stable Issue Fingerprints. The initial observation is not a repair attempt. A materially new root cause gets a new fingerprint without erasing prior history.

## Review Batch Defaults

```yaml
max_stages_per_batch: 1
max_changed_files_per_batch: 20
critical_boundary_forces_review: true
```

This manifest intentionally reviews each critical House boundary separately. T0 and T6 are coordination stages; all implementation/security/readiness stages force review.

## Reviewer Policy

```yaml
primary_reviewer: Codex
fallback_reviewer: Claude
fallback_only_when_primary_unavailable: true
no_self_review: true
no_reviewer_shopping: true
```

Claude fallback review is prohibited when Claude authored/remediated the reviewed target scope and no other independent reviewer is available.

## Stage Graph

| Stage | Objective | Entry Condition | Work Units | AUTO_GATE | Review Batch | On Approved Batch | Owner Checkpoint |
|---|---|---|---|---|---|---|---|
| T0 | Reconcile House canonical state | PRE-01 PASS | T0-WU01..03 | git/state/docs checks | B0 | T1 | NONE |
| T1 | Prepare + prove R15 least-privilege source/package | B0 approved | T1-WU01..03 | tests/security/diff/build | B1 | T2 | NONE |
| T2 | Harden product-event signer boundary | B1 approved | T2-WU01..03 | auth/replay/cross-product tests | B2 | T3 | NONE |
| T3 | Build shared one-time fulfillment path | B2 approved + Reuse Gate PASS | T3-WU01..04 | delivery/idempotency/revoke/reissue tests | B3 | T4 if dependency ready, otherwise wait/join | NONE |
| T4 | Consume accepted SB01 LR-2F projection in Control | B3 approved + SB01 LR-2F accepted | T4-WU01..03 | read-only/fail-closed tests | B4 | T5 | NONE |
| T5 | Production readiness + controlled apply/deploy/live proof | B1-B4 approved | T5-WU01..06 | G1-G10 + deploy/live smoke | B5 | T6 | NONE |
| T6 | Final House reconciliation + unblock matrix | B5 approved | T6-WU01..03 | docs/evidence/state consistency | B6 | FINAL STOP | OWNER FINAL CLOSURE REVIEW |

If SB01 LR-2F is not ready after T3, Hermes must persist `T4 DEPENDENCY_WAIT` and may perform only T3-approved cleanup/evidence packaging and T5 preparation that does not depend on the missing contract. Do not invent a temporary billing projection.

---

# Stage Contracts

## T0 — HOUSE CANONICAL RECONCILIATION

State: PENDING
Review Batch: B0
Depends On: PRE-01
Invalidated By: changes to `origin/master`, coordination branch history, or current House/SB01/Control state before T0 closes.

### Objective

Create one current, inspectable House continuation state without deleting prior House/SB01 history.

### Allowed

- fetch remotes/read branch history
- merge `origin/master` into `work/house-production-closure-longrun-20260919` with a merge commit if needed
- resolve documentation-only conflicts using current authority/evidence
- update `docs/CURRENT_STATUS.md`
- create/update Task/dispatch/evidence/handoff files under `docs/platform/house-long-run/**`

### Prohibited

- rebase/reset/force push/clean unknown work
- alter product repositories
- rewrite historical evidence
- claim current product states not independently supported by evidence
- begin hub-web source implementation before T0 gates pass

### Acceptance Contract

- coordination branch contains prior House history + current `master` governance, with ancestry/merge evidence
- exact House and hub-web starting refs are recorded
- SB01 is recorded as external dependency lane, not House implementation
- `docs/CURRENT_STATUS.md` current overlay distinguishes verified state from historical state
- working tree clean and remote parity recorded
- no source code outside approved coordination docs changes during T0

### AUTO_GATE

- `git status --short`
- `git branch --show-current`
- `git rev-parse HEAD`
- `git rev-parse origin/master`
- `git merge-base --is-ancestor origin/master HEAD` => PASS required
- `git diff --check`
- changed-path audit => coordination docs only
- current-state claims checked against exact remote evidence

### Work Units

#### T0-WU01 — PRE/STATE
Worker Rule: Qwen command-heavy validation or Hermes deterministic gate runner
Objective: resolve exact local worktrees, fetch, record branch/head/upstream/dirty state and remote refs.
Expected Stop: state evidence persisted.

#### T0-WU02 — RECONCILE
Worker Rule: OpenCode
Objective: merge current master into House LONG_RUN branch without history rewriting; resolve only documentation conflicts under Source-of-Truth order.
Expected Stop: clean reconciled candidate.

#### T0-WU03 — CURRENT STATUS
Worker Rule: OpenCode
Objective: update current House status and checkpoint documents to actual evidence.
Expected Stop: T0 AUTO_GATE.

Timeout Decomposition: each WU is separately resumable; no blind replay.

### Transition

AUTO_GATE PASS -> REVIEW_REQUIRED B0.
B0 BATCH_APPROVED -> T1 READY.

---

## T1 — R15 LEAST-PRIVILEGE PREPARATION

State: PENDING
Review Batch: B1
Depends On: T0 approved
Invalidated By: changes to DB access layer, relevant migrations/schema/config/auth environment contract.

### Objective

Produce a production-safe, reviewed R15 package that moves Hub runtime away from Project A database-owner identity to a dedicated scoped `hub_web_app` role, without yet applying destructive or unreviewed production mutation.

### Mandatory pre-build

- inspect actual hub-web DB access code/config/migrations first
- identify exact objects/operations Hub runtime requires
- perform Module Reuse Check where applicable; likely N/A must be evidence-backed
- record threat/privilege matrix before implementation

### Acceptance Contract

Source/config/migration/operator package proves:
- `hub_web_app` is login/runtime role, not owner
- no `CREATE` or role escalation capability
- only minimum required public-object access
- explicit DENY proof for `billing_core`
- explicit DENY proof for `billing_core_staging`
- owner DB URL is not required by application runtime
- deploy/rollback sequence is documented and safe
- local/test environment can exercise privilege matrix without exposing secrets

### AUTO_GATE

- targeted DB access tests
- negative privilege tests
- migration/static SQL validation
- app typecheck/test/build relevant to changes
- secret scan on changed files
- `git diff --check`
- allowed-path diff
- worktree clean
- exact SHA evidence

### Work Units

#### T1-WU01 — PRIVILEGE INVENTORY
Worker Rule: OpenCode
Objective: inspect actual code/SQL/config and write exact required privilege matrix + implementation plan.
Expected Stop: implementation-ready evidence, no production mutation.

#### T1-WU02 — IMPLEMENT PACKAGE
Worker Rule: OpenCode
Objective: implement scoped role/grant/migration/operator/config changes and regression tests.
Expected Stop: source candidate.

#### T1-WU03 — COMMAND/SECURITY QUALIFICATION
Worker Rule: Qwen
Objective: run command-heavy privilege/SQL/test qualification on exact candidate.
Expected Stop: T1 AUTO_GATE evidence.

### Critical Boundary

Database/security least privilege. Independent B1 review required before any production DB role/grant apply.

B1 BATCH_APPROVED -> T2.

---

## T2 — PRODUCT-EVENT SIGNER HARDENING

State: PENDING
Review Batch: B2
Depends On: T1 approved
Invalidated By: event webhook/auth/event-schema changes.

### Objective

Replace the shared-secret/caller-selected-product trust shape with the Production Master Plan's server-bound per-product signer contract.

### Locked Contract

The signed envelope must bind:
- version
- key ID / signer identity
- product ID
- event ID
- issued-at
- body digest

Server maps signer/key identity to exactly one authorized product.

Required controls:
- raw-body signature verification before mutation
- short replay window
- idempotency
- bounded body/request validation
- rate/abuse control appropriate to endpoint
- wrong-product impersonation impossible
- safe rotation path without caller-controlled product authority

### Acceptance Contract

Tests prove:
- missing/bad signature denied before DB mutation
- valid signer Product A cannot emit Product B event
- replay/expired event denied or deduplicated per contract
- duplicate event does not duplicate state
- unknown key/product fails closed
- body tamper fails
- existing valid installation event path remains functional
- no secret printed/logged/client-exposed

### Work Units

#### T2-WU01 — SOURCE AUDIT + CONTRACT MAP
Worker Rule: OpenCode
Objective: map current webhook/source/env/tests to locked signer contract; identify minimal migration/compatibility path.

#### T2-WU02 — IMPLEMENT
Worker Rule: OpenCode
Objective: implement per-product signer binding + replay/rate/validation controls and tests.

#### T2-WU03 — SECURITY REGRESSION
Worker Rule: Qwen
Objective: run negative/cross-product/replay/tamper/idempotency suite and exact diff qualification.

### AUTO_GATE

- targeted webhook tests
- full relevant test suite
- typecheck/build
- secret scan
- changed-path audit
- `git diff --check`
- exact SHA/worktree clean

B2 BATCH_APPROVED -> T3.

---

## T3 — SHARED ONE-TIME PRODUCT FULFILLMENT

State: PENDING
Review Batch: B3
Depends On: T2 approved
Invalidated By: fulfillment state/API/storage/repository-grant contract changes.

### Objective

Implement the P1/L4 shared fulfillment capability once in Hub, for later use by MT01/CM01/HC01, without implementing those products.

### Mandatory Gate Before Build

1. Read `docs/platform/MODULE-REUSE-POLICY.md`.
2. Perform MT01 Bootstrap Check if applicable.
3. Search `modules-hub` and existing hub-web source for reusable delivery/grant/idempotency/audit modules.
4. Record:
   - REUSE
   - REJECT WITH JUSTIFICATION
   - N/A WITH EVIDENCE
5. `Reuse Gate: PASS` required before T3-WU02.

### Locked Capability Contract

The shared capability must:
- accept an already-authoritative purchase/entitlement input contract without becoming payment truth
- bind recipient to immutable artifact/repository version
- deliver/grant idempotently
- make repeated/retried delivery safe
- fail visibly and durably
- audit who received which immutable version
- support revoke
- support reissue
- never package WSTERA production secrets
- keep product-specific artifact contents outside House scope

### Acceptance Contract

A test artifact/grant must prove:
1. first delivery/grant
2. repeated identical request -> no duplicate harmful side effect
3. interrupted/failed delivery -> resumable/visible state
4. re-delivery
5. revoke
6. reissue
7. immutable version/audit linkage
8. no payment mutation and no product-content implementation

### Work Units

#### T3-WU01 — REUSE/BOOTSTRAP GATE
Worker Rule: OpenCode
Objective: produce evidence-backed Reuse Gate + bounded design mapping from locked P1/L4 contract to existing Hub seams.
Expected Stop: `Reuse Gate PASS` or OWNER_HOLD if a genuine architecture decision is missing.

#### T3-WU02 — IMPLEMENT DURABLE FULFILLMENT
Worker Rule: OpenCode
Objective: implement the minimal production-grade shared fulfillment capability.

#### T3-WU03 — FAILURE/IDEMPOTENCY QUALIFICATION
Worker Rule: Qwen
Objective: exercise duplicate, retry, interrupted-state, revoke, reissue, immutable-version and audit tests.

#### T3-WU04 — CLEAN-ROOM TEST ARTIFACT
Worker Rule: OpenCode or Qwen according to manifest-authorized capability
Objective: use a synthetic/non-product artifact to prove the full shared mechanism without touching MT01/CM01/HC01 content.

### AUTO_GATE

- reuse/bootstrap evidence PASS
- targeted tests
- failure/retry/idempotency tests
- full relevant suite/typecheck/build
- secret/artifact scan
- `git diff --check`
- allowed-path diff
- exact SHA/worktree clean

B3 BATCH_APPROVED -> T4 if SB01 dependency ready; otherwise T4 DEPENDENCY_WAIT.

---

## T4 — SB01 LR-2F JOIN + CONTROL READ PROJECTION

State: PENDING
Review Batch: B4
Depends On: T3 approved + exact accepted SB01 LR-2F contract
Invalidated By: SB01 projection contract changes or Control billing adapter changes.

### Dependency Entry Gate

Before any T4 implementation, Hermes must inspect `Gutumrod/stripe-billing` and persist:
- exact LR-2F material SHA
- exact independent review verdict/evidence
- exact accepted projection schema/transport/auth/failure contract
- House/Owner acceptance state required by the SB01 task
- no unresolved LR-2F blocker

If not available: `DEPENDENCY_WAIT`. Do not synthesize or infer the missing contract.

### Objective

Map the approved SB01 authoritative read projection into the existing Control billing adapter and UI/read APIs only.

### Locked Invariants

- `canExecutePaymentActions: false`
- no Checkout/Portal creation
- no payment/subscription/customer mutation
- no Stripe/provider SDK business logic in Control
- no provider secrets in Control
- no webhook/outbox/reconciliation engine in Control
- no entitlement writes
- no local authoritative billing state
- missing/degraded projection fails closed visibly
- displayed money/status state is attributable to SB01 projection

### Work Units

#### T4-WU01 — CONTRACT/ADAPTER MAP
Worker Rule: OpenCode
Objective: inspect exact LR-2F contract and existing `billing-core-adapter.ts`; record mapping and prohibited mutation surface.

#### T4-WU02 — IMPLEMENT READ PATH
Worker Rule: OpenCode
Objective: implement approved read-only projection consumption in existing adapter/routes/UI as required; no redesign.

#### T4-WU03 — BOUNDARY/DEGRADED TEST
Worker Rule: Qwen
Objective: prove read correctness, unavailable/degraded fail-closed behavior, and absence of mutation/provider-secret paths.

### AUTO_GATE

- adapter tests
- wrong/unavailable/degraded projection tests
- mutation-route absence/invariant tests
- typecheck/test/build
- secret scan
- `git diff --check`
- exact SHA/worktree clean

B4 BATCH_APPROVED -> T5.

---

## T5 — PRODUCTION READINESS / CONTROLLED APPLY / DEPLOY / LIVE PROOF

State: PENDING
Review Batch: B5
Depends On: B1-B4 approved
Invalidated By: any material candidate change after readiness evidence is collected.

### Objective

Promote the exact House platform candidate from BUILD_PASS through applicable Production Readiness gates, then perform the Owner-authorized existing-target controlled production apply/deploy/live proof.

### Pre-Deploy Rule

No production mutation until:
- exact candidate SHA is frozen
- Production Readiness Record exists
- applicable G1-G10 evidence is PASS or explicit N/A WITH EVIDENCE
- B5 pre-deploy independent review approves the candidate/evidence
- canonical build-time environment delivery is verified without printing secrets
- rollback target/procedure is recorded

### Required Production Readiness Coverage

#### G1 Contract/Ownership
- Hub/Control/SB01 boundaries
- operational owner
- escalation/kill switch
- authority boundaries

#### G2 Functional
- full relevant tests
- negative auth/role/tenant/event/fulfillment/control-read tests
- known regression cases

#### G3 Failure/Recovery
- provider/unavailable projection
- duplicate/retry
- DB/auth/network failure
- rollback/recovery
- deploy rollback

#### G4 Data/Integrity
- migration/version/idempotency
- R15 privilege state
- fulfillment durable state
- Control no local financial truth

#### G5 Security
- R15
- signer binding
- auth/RBAC
- secret scan
- dependency audit
- HTTP->HTTPS/security headers as applicable
- no billing mutation

#### G6 Observability/Auditability
- request/run/event identifiers
- actionable health/alerts
- fulfillment and Control read auditability
- deploy/version traceability

#### G7 SLO/Capacity/Cost/Limits
- use existing locked House targets where applicable
- record provider/rate/storage limits
- no invented universal target

#### G8 Change/Regression
- exact candidate
- dependency/runtime/config changes
- invalidated evidence rerun

#### G9 Operations/Incident
- runbook
- health/readiness
- rollback
- owner/contact
- known limits

#### G10 Outcome/Live Acceptance
- Owner can use platform/control shared capability as declared
- product-specific business outcomes are N/A WITH EVIDENCE, not silently claimed

### Work Units

#### T5-WU01 — READINESS RECORD + EVIDENCE GAP CHECK
Worker Rule: OpenCode
Objective: create Production Readiness Record and close missing non-live evidence.

#### T5-WU02 — DEPENDENCY / HTTP / BUILD-ENV HARDENING
Worker Rule: OpenCode
Objective: close current dependency/security issues, enforce HTTP->HTTPS as required, make build fail/verify correctly for required production config, and prove exact artifact config without leaking values.

#### T5-WU03 — PREDEPLOY QUALIFICATION
Worker Rule: Qwen
Objective: run full deterministic candidate gates and produce exact artifact/hash/rollback/predeploy evidence.

#### T5-WU04 — B5 PREDEPLOY REVIEW
Worker Rule: Codex independent reviewer
Objective: review exact candidate/readiness packet before live mutation.
Valid verdicts use LONG_RUN contract.
Only BATCH_APPROVED permits WU05.

#### T5-WU05 — CONTROLLED PRODUCTION APPLY + DEPLOY
Worker Rule: Hermes deterministic operator steps + OpenCode/Qwen only for pre-approved command support; no subjective improvisation
Objective:
- apply approved R15 least-privilege role/grants/config transition
- build exact approved artifact using canonical secret/config path
- verify artifact identity/config
- deploy existing WSTERA Cloudflare target
- do not mutate SB01 provider/billing truth

If any live apply/deploy command differs materially from approved operator contract, STOP.

#### T5-WU06 — LIVE PROOF + RECOVERY CHECK
Worker Rule: Qwen command-heavy verification, plus Owner-visible smoke evidence where browser/human verification is required
Objective:
- verify `https://wstera.com`
- verify `https://platform.wstera.com`
- verify HTTP redirects to HTTPS
- verify system health
- verify unauthenticated/unsigned fail-closed behavior
- verify Owner login/control surfaces
- verify Work Queue / Owner Inbox / Agent Activity
- verify Control Billing read projection truthful/degraded behavior
- verify product-event negative auth
- verify fulfillment synthetic end-to-end path where safe in production or production-like isolated mode
- verify rollback target remains usable

### Production State Claims

T5 may claim at most the state supported by evidence:
- `BUILD_PASS`
- `PRODUCTION_READY`
- `LIVE_PROVEN`

It must not claim `OPERATED_STABLE` without the predeclared stability window/sample evidence.

### B5 Closure

Because WU05 occurs after pre-deploy review, any live/config change that changes source/artifact or invalidates evidence requires a fresh B5 closure review of the exact deployed/candidate state.

B5 BATCH_APPROVED after live evidence -> T6.

---

## T6 — FINAL HOUSE RECONCILIATION + UNBLOCK MATRIX

State: PENDING
Review Batch: B6
Depends On: T5 approved
Invalidated By: post-T5 material platform change.

### Objective

Make repository truth, operational truth, and dependency truth match exactly, then hand off product lanes without claiming their product-specific readiness.

### Acceptance Contract

- `docs/CURRENT_STATUS.md` reflects exact current House state
- Production Master Plan current overlay/evidence links are reconciled if required without rewriting historical plan authority
- final House handoff records:
  - exact House commit
  - exact hub-web commit/default-branch disposition
  - deployed artifact/Worker identity
  - Production Readiness state
  - R15 state
  - signer state
  - fulfillment state
  - Control/SB01 read boundary state
  - remaining House blockers
- Draft PR #1/default-branch strategy is explicitly dispositioned; no stale unmerged production-only code is silently left as canonical
- product dependency matrix says for each product lane only:
  - House dependency available / unavailable
  - exact contract/evidence reference
  - product-specific work still required
- no product is marked PRODUCTION_READY by House evidence alone

### Work Units

#### T6-WU01 — REPO/PR/CURRENT STATUS RECONCILE
Worker Rule: OpenCode
Objective: reconcile docs, branch/default-branch state and current status.

#### T6-WU02 — PRODUCT DEPENDENCY UNBLOCK MATRIX
Worker Rule: OpenCode
Objective: produce a factual dependency matrix only; no product implementation.

#### T6-WU03 — FINAL EVIDENCE PACKET
Worker Rule: Hermes
Objective: assemble exact-revision House closure packet for B6.

### AUTO_GATE

- docs/status vs exact refs consistency
- no stale HOLD/PASS contradictions in current overlay
- branch/upstream parity
- `git diff --check`
- exact evidence links
- no product-source changes

B6 independent review required.

B6 `BATCH_APPROVED` -> final stop:

`READY FOR OWNER HOUSE CLOSURE REVIEW — WSTERA-HOUSE-PRODUCTION-CLOSURE-001`

No automatic Owner acceptance.

---

# Review Batches

## B0 — House State Integrity
Stage: T0
Critical focus: history preservation, exact current-state truth.
On BATCH_APPROVED: T1.

## B1 — R15 Security Boundary
Stage: T1
Critical focus: DB owner removal, least privilege, billing schema denial, rollback.
On BATCH_APPROVED: T2.

## B2 — Product Event Trust Boundary
Stage: T2
Critical focus: signer->product binding, replay, tamper, idempotency.
On BATCH_APPROVED: T3.

## B3 — Fulfillment Durability Boundary
Stage: T3
Critical focus: delivery/retry/revoke/reissue/audit/secret-free artifact path.
On BATCH_APPROVED: T4 join/wait.

## B4 — Financial Read Boundary
Stage: T4
Critical focus: SB01 authority preserved, Control strictly read-only/fail-closed.
On BATCH_APPROVED: T5.

## B5 — Production Readiness / Live Boundary
Stage: T5
Critical focus: exact candidate, G1-G10, R15 live state, deploy/artifact/live proof/recovery.
On BATCH_APPROVED: T6.

## B6 — House Final Closure
Stage: T6
Critical focus: repository truth, operational truth, dependency matrix, no false product readiness.
On BATCH_APPROVED: final Owner closure checkpoint.

# Materialization Contract

Hermes may materialize packets only from:
- this locked manifest;
- exact current SHA/worktree;
- previous verdict;
- stage/work-unit state;
- counters/fingerprints;
- evidence paths;
- exact dependency state.

Hermes may not invent:
- new stage/scope
- new architecture
- new business/security policy
- new paid dependency
- product implementation
- billing mutation
- production authority beyond this manifest.

# Stop Conditions

- Source of Truth material conflict
- missing exact-revision evidence required for a transition
- no pre-approved timeout decomposition
- reviewer independence unavailable
- genuine architecture/security/business/product authority gap
- destructive/irreversible action required
- unapproved paid/cost action
- secret path cannot be used safely
- external SB01 dependency not accepted when T4 is reached -> DEPENDENCY_WAIT, not workaround
- reviewer `OWNER_DECISION_REQUIRED` or `STOP`
- final Owner closure checkpoint

# Approval

Owner Decision: APPROVED
Approval basis: Owner request on 2026-09-19 to run Hermes LONG_RUN to close House work, with SB01 continuing separately.
