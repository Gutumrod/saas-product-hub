# HANDOFF — WSTERA House Continuation — 2026-09-12

Task ID: `WSTERA-HOUSE-CONTINUATION`
Workflow: `WF-DEV-01@1.1.0` for the current bounded House review/remediation coordination round
Repository: `Gutumrod/saas-product-hub`
Branch: `work/billing-core-systemize-20260909`
Current House Commit Before This Handoff: `5862bf2d58409650572cf258ee0c7bce26eb207a`
Status: `READY_FOR_NEXT_HOUSE_CHAT`
From: `Sol / House Commander`
To: `Sol / next House chat`
Source Dispatch: `N/A — House coordination handoff; no execution authority is transferred by this file`
Start Checkpoint: `SB01 Phase 2B returned from Independent QA to House/Sol review`
Expected Stop: `Next House chat verifies canonical state before any new non-trivial execution`
Actual Stop: `SB01 Phase 2B remediation delegated; Phase 2C HOLD; Control Plane HOLD`
Next Allowed Action: `Read this handoff, verify current Git state, then wait for SB01 remediation return and perform House/Sol Review R2 on the exact returned SHA.`

## Owner Operating Rules

- Owner is final authority.
- Every non-trivial task must pass the Flow Selection Gate before execution: pin Workflow ID, Workflow Spec version, reason, runtime procedure when applicable, and Entry Conditions PASS/HOLD.
- Important briefs, reviews, handoffs, evidence, and dispatches must be file-backed. Chat alone is not canonical state.
- Workflow, Task Checkpoint, and Agent Dispatch Packet are separate contracts and must not substitute for one another.
- After every material stage: persist evidence, update Task checkpoint, record actual stop, set one next allowed action, then create a fresh dispatch for the next worker before non-trivial execution.
- Owner = Final Authority; Sol = Commander / Brief / Review / Final Verify; Hermes = Orchestrator/Clerk; builders/verifiers cannot self-approve.
- Do not reopen Council merely because implementation is difficult. Use Council only when the selected workflow requires a decision/release-verification round or actual architecture/security/product disagreement exists.
- Build-to-Sell remains priority, but security, isolation, money correctness, rollback and evidence are non-negotiable.

## Done

### 1. Workflow discipline restored

The active workflow rules were re-read from `Gutumrod/wstera-workflows` and the House process was corrected to enforce Flow Selection before non-trivial work.

Canonical operating references:
- `WORKFLOW-REGISTRY.md`
- `policies/AGENT-DISPATCH-POLICY.md`
- `templates/TASK-TEMPLATE.md`
- `templates/AGENT-DISPATCH-TEMPLATE.md`
- `templates/HANDOFF-TEMPLATE.md`

### 2. SB01 Phase 2B review completed through Independent QA

SB01 repository: `Gutumrod/stripe-billing`
Canonical branch: `feature/central-billing-phase2-runtime`
Workflow: `WF-DEV-01 v1.1.0`

Key exact revisions:
- Phase 2B implementation target: `3f62fab6c97010bd5311684efc8d7e9d3eece475`
- Phase 2B review checkpoint: `4caef761df984bd7327f3062012bef881d375797`
- Claude Independent QA report commit: `1fbbffb1aed3f9c51d947f461e2d539f5eb6417a`
- Returned Task checkpoint: `8c9d8a576f8076299978b401806e7fcf826337c8`

Claude verdict:
`PASS WITH ONE MEDIUM FINDING`

House/Sol disposition:
`SB01 PHASE 2B REMEDIATE_SOURCE`

The Medium finding was NOT risk-accepted because it directly affects the outbox lease/concurrency model that Phase 2C webhook/reconciliation work will build on.

Defect summary:
- `claimWebhookEvent` and `enqueueReconciliation` can reset an existing actively leased `processing` outbox job to `pending` and clear `lease_owner` / `lease_expires_at` on duplicate enqueue/event activity.
- This can make the same logical job immediately leaseable by another worker while the first worker is still processing it.
- Current downstream reconciliation idempotency reduces direct money-state corruption risk, but the active-lease concurrency invariant is still violated and must be fixed before Phase 2C.

### 3. SB01 bounded remediation package issued

Canonical House review:
`docs/platform/billing-core/REVIEW-SB01-PHASE-2B-CLAUDE-QA-DISPOSITION-2026-09-12.md`

Canonical remediation brief:
`docs/platform/billing-core/BRIEF-SB01-PHASE-2B-OUTBOX-LEASE-REMEDIATION-2026-09-12.md`

Canonical House -> SB01 handoff:
`docs/platform/billing-core/HANDOFF-SB01-PHASE-2B-OUTBOX-LEASE-REMEDIATION-2026-09-12.md`

Handoff commit:
`5862bf2d58409650572cf258ee0c7bce26eb207a`

Required remediation route:
1. Keep Task ID `SB01-PHASE-2B`.
2. Keep `WF-DEV-01 v1.1.0` until Phase 2B closes.
3. Update canonical Task checkpoint to remediation stage.
4. Create a fresh Claude Remediation Agent Dispatch Packet.
5. Do not reuse Independent-QA dispatch.
6. Fix only the bounded outbox active-lease race.
7. Add regression proving duplicate activity cannot clear an unexpired active lease or make the job concurrently leaseable.
8. Required verification: targeted regression PASS, runtime build PASS, runtime typecheck PASS, Profile Registry 16/16 PASS, `git diff --check` PASS, final tracked status clean.
9. Persist evidence, commit/push, verify remote parity.
10. Stop at `READY FOR HOUSE/SOL REVIEW R2` and return exact remediation SHA.

Phase 2C remains HOLD until House/Sol R2 accepts the remediation.

### 4. Codex Windows sandbox failure separated from SB01

Codex auth/connectivity was healthy, but Windows sandbox failed before substantive execution with:
`CreateProcessAsUserW failed: 5 (Access is denied.)`

Even trivial `Get-Location` could not execute inside the sandbox.

This is classified as:
`Windows executor/sandbox infrastructure failure`

It is NOT:
- an SB01 defect;
- an Independent QA verdict;
- grounds to bypass the Codex sandbox.

Canonical incident/remediation report:
`docs/platform/agent-relay/REPORT-CODEX-WINDOWS-SANDBOX-EXECUTOR-FAILURE-2026-09-11.md`

House report commit:
`e04470b551febc440568f1c412599f210b2e62b0`

Claude successfully completed the SB01 Independent QA reroute. The Codex executor defect must be repaired as a separate runtime/infrastructure task.

### 5. Control Plane remains dependency-HOLD

Canonical Control rule remains unchanged:
**Control Plane is Owner-facing control/observation, not a billing/payment engine.**

Control Plane may read authoritative SB01 projections and show status/health/readiness, but must not implement Checkout/Portal payment execution, provider mutation, billing webhooks/reconciliation/ledger/state machine, provider secrets, or entitlement mutation.

Control remains HOLD for Billing integration until SB01 reaches the authorized read-only projection stage (planned Phase 2F), unless Owner explicitly creates a separate bounded Control-only task.

Do not start Control Billing implementation merely because Phase 2B is progressing.

Canonical Control hold brief:
`docs/platform/BRIEF-CONTROL-PLANE-READ-ONLY-CONTINUATION-2026-09-11.md`

## Verified

At the time immediately before this House continuation handoff was created:
- House remote branch `work/billing-core-systemize-20260909` pointed to `5862bf2d58409650572cf258ee0c7bce26eb207a`.
- The SB01 remediation brief and House -> SB01 handoff were present on the House branch.
- SB01 exact QA/report/checkpoint commits above were present in `Gutumrod/stripe-billing`.
- Phase 2C was still HOLD.
- Control Plane Billing integration was still HOLD.

The next chat must re-verify live branch heads/status before making fresh claims because repository state may advance after this handoff.

## Changed Files / Canonical Artifacts Produced in This House Round

- `docs/platform/billing-core/REVIEW-SB01-PHASE-2B-HOUSE-SOL-2026-09-11.md`
- `docs/platform/agent-relay/REPORT-CODEX-WINDOWS-SANDBOX-EXECUTOR-FAILURE-2026-09-11.md`
- `docs/platform/billing-core/REVIEW-SB01-PHASE-2B-CLAUDE-QA-DISPOSITION-2026-09-12.md`
- `docs/platform/billing-core/BRIEF-SB01-PHASE-2B-OUTBOX-LEASE-REMEDIATION-2026-09-12.md`
- `docs/platform/billing-core/HANDOFF-SB01-PHASE-2B-OUTBOX-LEASE-REMEDIATION-2026-09-12.md`
- `docs/platform/HANDOFF-WSTERA-HOUSE-CONTINUATION-2026-09-12.md` (this file)

## Return Contract for the Next SB01 Material Stage

SB01 must return all of the following before House/Sol Review R2 can close the remediation:
- exact remediation commit SHA;
- branch/worktree;
- changed files;
- targeted active-lease duplicate regression + exact result;
- runtime build result;
- runtime typecheck result;
- Profile Registry regression result;
- `git diff --check` result;
- evidence/report paths;
- final git status;
- deviations from brief/dispatch;
- blockers/limitations;
- actual stop checkpoint;
- remote parity after push.

A chat claim such as “done” or “pass” without the required return evidence is not completion proof.

## Remaining

### Immediate

1. Wait for the dedicated SB01 lane to complete the bounded outbox lease remediation.
2. When SB01 returns, fetch and review the exact returned remediation SHA and evidence.
3. Perform House/Sol Review R2 only against that exact revision.
4. If substantive defects remain, issue the next remediation/closure stage through a fresh Task checkpoint + dispatch.
5. If R2 accepts the remediation, persist the Phase 2B closure evidence before authorizing Phase 2C.

### After Phase 2B closes

The current SB01 sequence remains:
`2C HTTP + Stripe Test -> 2D webhook durability/reconciliation -> 2E entitlement + multi-product isolation -> 2F authoritative read-only projection to Control Plane`

Each material stage requires its own checkpoint/brief/dispatch/evidence according to the selected workflow. Do not let one stage flow into the next merely because the work is contiguous.

## Blockers

- `Phase 2C`: authority-blocked until Phase 2B remediation passes House/Sol Review R2.
- `Control Plane Billing integration`: dependency-blocked until SB01 read-only projection is authorized/available.
- `Codex Windows executor`: separate infrastructure defect; do not contaminate SB01 status with it.

## Decisions

- Do not risk-accept the outbox active-lease race.
- Do not start Phase 2C on top of the known concurrency gap.
- Do not let Control Plane develop a second billing engine.
- Do not reopen Council for this bounded remediation.
- Do not bring BK01 into the active House focus unless Owner explicitly reopens it.
- Do not treat Codex sandbox failure as an SB01 defect.

## Evidence / Source of Truth Priority

For SB01 Phase 2B remediation review, read in this order:
1. `docs/platform/HANDOFF-WSTERA-HOUSE-CONTINUATION-2026-09-12.md`
2. `docs/platform/billing-core/HANDOFF-SB01-PHASE-2B-OUTBOX-LEASE-REMEDIATION-2026-09-12.md`
3. `docs/platform/billing-core/REVIEW-SB01-PHASE-2B-CLAUDE-QA-DISPOSITION-2026-09-12.md`
4. `docs/platform/billing-core/BRIEF-SB01-PHASE-2B-OUTBOX-LEASE-REMEDIATION-2026-09-12.md`
5. SB01 `docs/tasks/TASK-SB01-PHASE-2B.md`
6. SB01 remediation Agent Dispatch Packet for the current worker
7. SB01 exact returned remediation evidence/revision
8. `Gutumrod/wstera-workflows` registry/policy/templates if route/authority is in question

## Instructions for the Next House Chat

On entry:
1. Read this handoff first.
2. Read the canonical WSTERA workflow registry before non-trivial execution.
3. Verify House and SB01 remote branch heads/status before making claims.
4. Do not invent a new workflow for the still-open `SB01-PHASE-2B`; it remains pinned to `WF-DEV-01 v1.1.0` until that Task closes.
5. Do not execute SB01 remediation from House; the dedicated SB01 lane owns implementation unless Owner explicitly reassigns it.
6. If the Owner says “SB01 เสร็จแล้ว / push แล้ว”, inspect the exact remote SHA, evidence, Task checkpoint and dispatch return contract before issuing any PASS.
7. Review the remediation specifically for preservation of an unexpired active lease under duplicate enqueue/event activity and regression of normal completion/failure/expiry/dead-letter behavior.
8. Keep Phase 2C HOLD until Review R2 is persisted and accepted.
9. Keep Control Plane Billing integration HOLD until its dependency is authorized.
10. Keep the Codex Windows sandbox incident in the Agent Relay/runtime lane, not SB01.

## Do Not Do

- Do not authorize Phase 2C before Phase 2B remediation closes.
- Do not accept “PASS” without exact revision-bound evidence.
- Do not reuse an old dispatch for a new material stage.
- Do not let the remediation worker approve its own work.
- Do not mutate LAB/production or call Stripe/provider unless the active brief/dispatch explicitly authorizes it.
- Do not implement billing/payment mutation in Control Plane.
- Do not mix Codex executor remediation into SB01.
- Do not use chat history as a substitute for canonical files.

## Handoff Verdict

`HOUSE CONTINUATION READY / WAITING FOR SB01 PHASE 2B REMEDIATION RETURN`

This handoff reports the current House state. It does not authorize the recipient to execute the next material stage. The next chat must update/verify Task state and issue a fresh Agent Dispatch Packet whenever the selected workflow requires a new worker/execution round.