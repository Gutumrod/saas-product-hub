# HANDOFF — WSTERA HOUSE PRODUCTION CLOSURE LONG_RUN LAUNCH — 2026-09-19

Task ID: WSTERA-HOUSE-PRODUCTION-CLOSURE-001
Workflow: WF-DEV-01@1.3.0 / LONG_RUN + WF-RELAY-01@1.3.0
Runtime Procedure: kanban-external-agent-dispatch v2.5.3
Repository: Gutumrod/saas-product-hub
Branch: work/house-production-closure-longrun-20260919
Launch Base Before This Handoff: e25c7d1f5d473371e515b61d85c49d94425026b8
Status: READY_FOR_HERMES_PRE_01
From: Owner / House planning
To: Hermes
Source Dispatch: N/A — orchestration launch handoff; first worker dispatch is materialized after PRE-01
Start Checkpoint: PRE-01 LONG_RUN PREFLIGHT
Expected Stop: READY FOR OWNER HOUSE CLOSURE REVIEW — WSTERA-HOUSE-PRODUCTION-CLOSURE-001
Actual Stop: launch package prepared; no substantive House implementation started
Next Allowed Action: Read the canonical Brief, Manifest, and Task; run PRE-01 fail-closed; if PASS, update Task and release T0-WU01.

## Read and execute

1. `docs/platform/house-long-run/BRIEF-WSTERA-HOUSE-PRODUCTION-CLOSURE-LONG-RUN-2026-09-19.md`
2. `docs/platform/house-long-run/RUN-MANIFEST-WSTERA-HOUSE-PRODUCTION-CLOSURE-001.md`
3. `docs/platform/house-long-run/TASK-WSTERA-HOUSE-PRODUCTION-CLOSURE-001.md`
4. `AGENTS.md`
5. `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md`
6. current `Gutumrod/wstera-workflows/WORKFLOW-REGISTRY.md` and pinned policies/runtime

Do not use this chat as execution authority.

## Done

- New House LONG_RUN branch created from prior House coordination history:
  `work/house-production-closure-longrun-20260919` from `01cfc28dbb9ea8081f389240d57797c70cda7d9b`.
- Dedicated Hub/Control execution branch created:
  `Gutumrod/hub-web:work/house-platform-closure-20260919` from `125af8435f4c80b9525c72405b44807206905fc5`.
- Owner-approved House-only brief persisted.
- LONG_RUN Run Manifest persisted and pinned at `f84a59c5d602ca37c95727997a0d63a709ddd63e`.
- Task checkpoint initialized.
- SB01 explicitly remains an external active lane; House must not duplicate its work.
- T0-T3 may proceed while LR-2F runs elsewhere.
- T4 waits for exact accepted SB01 LR-2F projection contract.
- T5 controls production-readiness/apply/deploy/live proof.
- T6 closes House and emits factual product dependency/unblock matrix.

## Verified starting refs

At launch-package preparation:
- House `master`: `1556d8a29ce5fa2f408bed981f26d9ef7d61aa33`.
- Prior House/SB01 coordination: `work/billing-core-systemize-20260909 @ 01cfc28dbb9ea8081f389240d57797c70cda7d9b`.
- House histories were observed diverged: prior coordination branch ahead 21 / behind master 2.
- Hub/Control active source baseline: `feature/platform-control-plane @ 125af8435f4c80b9525c72405b44807206905fc5`.
- Hub/Control default `main @ 8a3e49330e6cc1d52d6ad3d96fd0d291a66b4f56`.
- Hub/Control feature branch observed 30 commits ahead / 0 behind main; Draft PR #1 open.
- SB01 external branch observed `work/sb01-central-billing-pc-20260911 @ 4d8311b835eb149f44d36e226db4a701d9b37821`, LR-2E closed/PASS, LR-2F next.

PRE-01 must re-fetch/reverify all material refs before execution.

## Execution order

```text
PRE-01
  -> T0 House reconcile
  -> B0
  -> T1 R15 least privilege
  -> B1
  -> T2 product-event signer hardening
  -> B2
  -> T3 shared fulfillment
  -> B3
  -> T4 accepted SB01 LR-2F -> Control read integration
  -> B4
  -> T5 production readiness / controlled production apply / deploy / live proof
  -> B5
  -> T6 final House reconciliation + dependency matrix
  -> B6
  -> READY FOR OWNER HOUSE CLOSURE REVIEW
```

## Mandatory operating rules

- Hermes = orchestrator/state/dispatch/deterministic gate runner only.
- OpenCode = ordinary primary implementation worker.
- Qwen = command-heavy/test/bounded remediation support.
- AGY = UI/UX only and need not be used unless a real UI/UX Work Unit appears.
- Codex = primary independent reviewer at declared batch/threshold boundaries.
- Claude = difficult remediation only through the runtime escalation contract, or fallback independent reviewer only on evidenced Codex unavailability with independence preserved.
- Do not create stages merely to exercise an agent.
- Do not call Codex for every command/failure/provisional pass.
- Do not stop for normal technical failure; use fingerprinted bounded auto-recovery.
- Do not ask Owner which agent to try next.
- No agent self-approval.
- No secret value in evidence/output.

## SB01 dependency rule

House does not wait idle for SB01.

Proceed T0 -> T1 -> T2 -> T3.

At T4:
- inspect exact current SB01 Task/evidence;
- require accepted LR-2F projection contract;
- if absent, persist `T4 DEPENDENCY_WAIT`;
- do not fabricate a projection;
- do not build a temporary billing source in Control;
- continue only manifest-authorized preparation that does not depend on LR-2F.

## Production mutation rule

Owner authorizes the existing-target controlled House closure actions in the Manifest, but no live mutation occurs before T5 predeploy gates and independent review approve the exact candidate.

No destructive DB operation, new paid service, product mutation, SB01 provider mutation, or unplanned secret rotation is authorized.

## Return contract

At each material stage persist:
- exact revision
- repo/branch/worktree
- changed files
- tests/checks and exact results
- evidence paths
- issue fingerprint/attempt counters if applicable
- worktree status
- deviations
- blockers/limitations
- actual stop/state
- next allowed action
- remote parity after push

At final return provide:
- exact House revision
- exact hub-web revision/default-branch disposition
- deployed artifact/Worker identity if T5 live deploy occurred
- Production Readiness state (`BUILD_PASS`, `PRODUCTION_READY`, `LIVE_PROVEN`; never infer `OPERATED_STABLE`)
- R15 evidence
- signer evidence
- fulfillment evidence
- Control/SB01 read-boundary evidence
- remaining blockers
- product dependency/unblock matrix
- final B6 review evidence

## Blockers

No blocker prevents PRE-01/T0-T3.

Expected external dependency:
- T4 waits for accepted SB01 LR-2F.

## Do not do

- do not touch product repos
- do not implement SB01
- do not make Control a payment engine
- do not reset/rebase/clean away unknown work
- do not merge branches mechanically without the manifest gate
- do not deploy before T5
- do not claim House completion from green tests alone
- do not claim product readiness from House closure
- do not turn a dependency wait into guessed implementation

## Launch verdict

`HOUSE LONG_RUN PACKAGE READY — HERMES PRE-01 AUTHORIZED`

