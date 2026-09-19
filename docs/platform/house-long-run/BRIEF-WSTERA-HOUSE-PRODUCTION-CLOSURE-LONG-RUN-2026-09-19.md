# BRIEF — WSTERA HOUSE PRODUCTION CLOSURE LONG_RUN — 2026-09-19

Task ID: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001`
Owner: `Free`
Workflow: `WF-DEV-01 v1.3.0`
Execution Mode: `LONG_RUN`
Relay: `WF-RELAY-01 v1.3.0`
Runtime Procedure: `kanban-external-agent-dispatch v2.5.3`
Work Type: `DIRECT-APPROVED`
Status: `OWNER APPROVED / READY FOR MANIFEST-PINNED PREFLIGHT`

## Objective

Close the WSTERA **House/shared-platform critical path** to an evidence-backed production-operable state without opening or implementing product-specific work.

The run must continue autonomously through pre-approved technical stages and bounded remediation. Hermes must stop only at a genuine authority boundary, prohibited/destructive action, reviewer STOP, unrecoverable independence/runtime failure, or final House closure checkpoint.

This run does **not** take over SB01 implementation. SB01 remains a separate active lane. House may inspect SB01 state and consume its accepted read-projection contract when available.

## Owner Authorization

Owner authorizes this LONG_RUN to execute the bounded House closure described here, including:
- repository reconciliation on dedicated work branches;
- implementation/remediation in the existing `hub-web` Control/Hub platform scope;
- non-destructive least-privilege database-role/grant remediation required by R15;
- existing-target Cloudflare/Control deployment and verification when all declared production-readiness gates pass;
- deterministic tests, security checks, live smoke, evidence creation, commit and push.

This authorization does **not** permit:
- product-specific implementation in BK01/PS01/LK01/DC01/MT01/CM01/WS01 or another product repo;
- SB01 implementation or Stripe provider mutation from House;
- new paid services or paid-plan changes;
- destructive database operations/data deletion;
- secret disclosure or unplanned secret rotation;
- financial/payment mutation from Control Plane;
- architecture/business/security-policy changes outside the already locked House contracts;
- mass refactoring solely because the organization cybersecurity program exists.

A required action outside these boundaries is `OWNER_HOLD`.

## Flow Selection Gate

- Workflow ID: `WF-DEV-01`
- Workflow Spec Version: `1.3.0`
- Execution Mode: `LONG_RUN`
- Reason: multi-stage House closure with dependency gates, exact-revision evidence, bounded technical auto-recovery, independent review batches, and only one final Owner checkpoint.
- Relay Workflow: `WF-RELAY-01 v1.3.0`
- Runtime: `kanban-external-agent-dispatch v2.5.3`
- Entry Conditions: `PASS after PRE-01`
- Production readiness authority: `Gutumrod/wstera-workflows/policies/PRODUCTION-READINESS-STANDARD.md` v1.0.0.

## Canonical Role Map

Use the current Workflow Registry role model:

- Hermes = orchestrator / dispatcher / deterministic gate runner / state holder.
- OpenCode = primary general implementation worker.
- Qwen = secondary testing / bounded remediation / command-heavy support.
- AGY = UI/UX implementation specialist only.
- Codex = principal independent reviewer / important-gate authority / difficult-defect classifier.
- Claude = senior difficult remediation engineer only; never ordinary/default builder.
- Owner = final authority.

Hermes must not implement source code or subjectively approve work.
No builder/remediator may approve its own substantive diff.

## Source of Truth — precedence

1. Latest explicit Owner decision recorded in this brief and later committed Owner decisions.
2. `AGENTS.md` in `Gutumrod/saas-product-hub`.
3. `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md`.
4. `docs/platform/HANDOFF-WSTERA-HOUSE-CONTINUATION-2026-09-12.md` and later House evidence.
5. `docs/platform/BRIEF-CONTROL-PLANE-READ-ONLY-CONTINUATION-2026-09-11.md`.
6. `Gutumrod/hub-web:docs/control-plane/OWNER-DIRECTIVE-BILLING-AUTHORITY-BOUNDARY-2026-09-11.md`.
7. Actual `Gutumrod/hub-web` source/tests on the exact execution revision.
8. Accepted SB01 LR-2F read-projection contract **only after** its exact revision has independent PASS and House/Owner acceptance.
9. `Gutumrod/wstera-workflows` current workflow/policy/runtime contracts pinned above.

Chat history is not execution authority.

## Verified Starting State

### House coordination repository

Repository: `Gutumrod/saas-product-hub`

Current remote state at brief creation:
- `master @ 1556d8a29ce5fa2f408bed981f26d9ef7d61aa33`
- prior House/SB01 coordination branch `work/billing-core-systemize-20260909 @ 01cfc28dbb9ea8081f389240d57797c70cda7d9b`
- these histories are diverged: House branch is ahead 21 commits and behind master 2 commits.
- new LONG_RUN branch: `work/house-production-closure-longrun-20260919`, created from `01cfc28dbb9ea8081f389240d57797c70cda7d9b`.

The first stage must reconcile `origin/master` into the LONG_RUN branch without deleting/rebasing away the prior House/SB01 evidence history.

### House status documentation

`docs/CURRENT_STATUS.md` is stale relative to current September 19 governance and later SB01/Control evidence. It must be refreshed as a current overlay; historical evidence must not be rewritten.

### SB01 external dependency lane

Repository: `Gutumrod/stripe-billing`

Observed state at brief creation:
- active branch `work/sb01-central-billing-pc-20260911 @ 4d8311b835eb149f44d36e226db4a701d9b37821`
- LR-2C = CLOSED / PASS
- LR-2D = CLOSED / PASS
- LR-2E = CLOSED / PASS with Codex PASS at `cd7363cf661e69e19e4ee207824cd354110e1180`
- LR-2F = NEXT / not yet released at the observed checkpoint.

House must not execute SB01 work. It may proceed with independent House stages while LR-2F runs elsewhere.

### Control / Hub repository

Repository: `Gutumrod/hub-web`
Canonical active platform branch: `feature/platform-control-plane @ 125af8435f4c80b9525c72405b44807206905fc5`
Default branch: `main @ 8a3e49330e6cc1d52d6ad3d96fd0d291a66b4f56`
Draft PR #1 remains open.
`feature/platform-control-plane` is 30 commits ahead of `main`, 0 behind.

Known verified House gaps:
- Control billing integration is intentionally fail-closed and dependency-HOLD until SB01 Phase 2F exposes an accepted authoritative read projection.
- Control invariant: `canExecutePaymentActions: false`.
- R15 remains open: Hub runtime must move away from Project A database-owner identity to a scoped `hub_web_app` role and prove denial to `billing_core` and `billing_core_staging`.
- current product-event webhook still uses one shared HMAC secret while the payload chooses `productSlug`; this does not satisfy the Production Master Plan's per-product signer binding.
- no current `hub-web` implementation was found for the shared one-time-product fulfillment/delivery/revoke/reissue capability required by P1/L4.
- Mac handoff evidence says build can succeed without the required build-time Supabase values; deployment must therefore verify the built artifact before Wrangler deployment.
- HTTP-to-HTTPS behavior and dependency-hardening were recorded as separate pre-production hardening items.

## Locked House Boundary

House owns shared platform/control/integration capability only.

### In scope

1. House Source-of-Truth reconciliation.
2. R15 least-privilege remediation.
3. Hub product-event signer/authentication hardening already specified by the Production Master Plan.
4. Shared one-time-product fulfillment capability required by P1/L4, subject to mandatory reuse/bootstrap checks.
5. Approved SB01 LR-2F read projection -> existing Control read adapter integration.
6. Hub/Control build/deploy safety, HTTP->HTTPS, dependency/security closure, exact-artifact verification.
7. Production Readiness Record and final House operational closure.
8. Exact dependency/unblock matrix for product lanes.

### Out of scope

- product repo feature work;
- product production gates;
- product pricing/business decisions;
- SB01 Core implementation;
- BK01 billing migration;
- PromptPay expansion;
- MT01/CM01/HC01 artifact contents;
- redesign of Control Plane;
- second billing/payment engine in Control;
- organization-wide security mass-refactor.

## Problem -> User -> Scope -> Architecture -> Data -> Workflow -> Failure -> Security -> Acceptance

### Problem
Shared House dependencies are the remaining coordination bottleneck. House evidence is split across diverged branches; SB01 projection is not yet consumed by Control; R15 is open; product-event authentication is weaker than the locked contract; shared fulfillment is missing; production-deploy/readiness evidence is incomplete.

### User
Primary operational user is WSTERA Owner. Product teams consume House capabilities but are not implementation scope for this run.

### Scope
Only shared House/platform/control work listed above.

### Architecture
- Hub/Control stays in `hub-web`.
- Control is observability/control, not financial authority.
- SB01 is authoritative billing truth.
- Control consumes SB01 read-only projection.
- BK01 billing remains isolated.
- product events use server-bound per-product signer identity, not a caller-selected product under a shared secret.
- fulfillment is a shared Hub capability implemented once, not separately in MT01/CM01/HC01.

### Data
- do not move product tenant data into Control.
- Hub/customer summary data remains minimal.
- billing truth stays in SB01.
- R15 makes `hub_web_app` least-privilege and unable to access billing schemas.
- fulfillment records immutable artifact/version recipient + idempotent delivery/reissue/revoke audit state only as required by the locked capability.

### Workflow
`WF-DEV-01 v1.3.0 / LONG_RUN` composed with `WF-RELAY-01 v1.3.0`.

### Failure cases
At minimum cover:
- stale/diverged git state;
- missing SB01 LR-2F dependency;
- database permission overreach/denial mistakes;
- signer spoof/replay/wrong-product;
- duplicate/retried fulfillment;
- delivery failure between durable state transitions;
- build with missing/wrong production env;
- dependency/security regression;
- deploy succeeds but live behavior is wrong;
- reviewer/executor unavailable;
- worker timeout and recurring defects.

### Security
Production Readiness G5 plus locked House security invariants are mandatory. No secret value may enter repo, logs, dispatch packets, or evidence.

### Acceptance
House closes only when the final Run Manifest closure contract passes on exact revisions and the Production Readiness Record is complete. Green build/tests alone are insufficient.

## Stage Intent

The exact executable stage graph is in:
`docs/platform/house-long-run/RUN-MANIFEST-WSTERA-HOUSE-PRODUCTION-CLOSURE-001.md`

High-level order:

```text
T0 HOUSE RECONCILE
  -> T1 R15 LEAST PRIVILEGE
  -> T2 PRODUCT-EVENT SIGNER HARDENING
  -> T3 SHARED FULFILLMENT
  -> T4 SB01 LR-2F DEPENDENCY JOIN + CONTROL READ INTEGRATION
  -> T5 PLATFORM PRODUCTION-READINESS / DEPLOY / LIVE PROOF
  -> T6 HOUSE FINAL RECONCILIATION + PRODUCT-LANE UNBLOCK MATRIX
```

T1-T3 may proceed while SB01 LR-2F runs in its separate lane.
T4 cannot execute until the exact accepted LR-2F contract exists.
T5 requires T1-T4 approved review batches.
T6 is final closure and does not imply any product is itself production-ready.

## Review Strategy

Critical boundaries force independent review:
- R15 database/auth least privilege.
- product-event signer/public shared event contract.
- fulfillment durable delivery/revoke contract.
- SB01->Control financial read boundary.
- production deploy/readiness claim.

Normal happy path: one Codex independent call per declared Review Batch, not per command/work unit.

Codex valid LONG_RUN verdicts:
- `BATCH_APPROVED`
- `WORKER_FIX`
- `SENIOR_REMEDIATION_REQUIRED`
- `OWNER_DECISION_REQUIRED`
- `STOP`

Claude difficult remediation follows the Relay escalation contract; Claude fallback review is allowed only on evidenced Codex unavailability and never when Claude authored/remediated the reviewed scope.

## Automatic Technical Recovery

For a stable Issue Fingerprint:
1. observe/fingerprint failure;
2. OpenCode ordinary repair #1 -> rerun exact failed gate;
3. if same issue fails, OpenCode ordinary repair #2 -> rerun;
4. if same issue still fails -> Codex exact-evidence classification;
5. `SEND_TO_CLAUDE` only when Codex/runtime authorizes difficult remediation;
6. rerun exact gate;
7. materially new issue gets a new fingerprint/counter.

Do not stop for Owner merely because a normal technical attempt failed.

## Mandatory STOP / OWNER_HOLD

Stop only when:
- Source of Truth conflicts materially;
- product/business/architecture/security-policy decision is required;
- destructive/irreversible action is required;
- new paid/cost authorization is required;
- production/live mutation falls outside this brief's existing-target authorization;
- required secret is missing and cannot be provisioned through the approved secret path;
- reviewer independence cannot be preserved;
- runtime integrity/provenance cannot be proven;
- Codex returns `OWNER_DECISION_REQUIRED` or `STOP`;
- final closure is reached.

## Final Expected State

The task may return final House closure only when all applicable statements are evidenced:

- House branch contains reconciled current governance/history and current status.
- R15 least-privilege boundary is proven.
- per-product event signer identity/replay boundary is proven.
- shared fulfillment path has delivered, redelivered/retried, revoked and reissued a test artifact/grant end-to-end.
- accepted SB01 LR-2F authoritative read projection is integrated read-only into Control.
- `canExecutePaymentActions: false` remains invariant.
- exact candidate passes required checks and Production Readiness G1-G10 with explicit N/A evidence where applicable.
- approved existing-target deployment/live smoke is recorded against exact artifact/Worker revision.
- rollback/recovery/observability/operations evidence exists.
- `docs/CURRENT_STATUS.md` and House handoff reflect actual implementation state.
- product dependency matrix states what is unblocked without falsely declaring product readiness.

Final stop:

`READY FOR OWNER HOUSE CLOSURE REVIEW — WSTERA-HOUSE-PRODUCTION-CLOSURE-001`

