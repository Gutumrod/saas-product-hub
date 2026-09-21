# RUN MANIFEST — WSTERA-CONTROL-TRUTH-SYNC-001

Status: **LOCKED**
Workflow: `WF-DEV-01 v1.3.0`
Execution Mode: `LONG_RUN`
Primary engine: `hermes-native-swarm v0.1.1`
State writer: Hermes
Control projection baseline: `wstera-control-sync v0.1.0`; any revised runtime version must be pinned exactly before activation
Base House revision: `13a2d55b509d15ee5b6375562b029c0dc98dce49`
Planning branch: `work/wstera-control-truth-sync-001`

## 1. Governance header requirements

Every substantive Swarm invocation MUST pin:
- `schema_version: "1.0"`
- task `WSTERA-CONTROL-TRUTH-SYNC-001`
- workflow `WF-DEV-01` version `1.3.0`
- `execution_mode: LONG_RUN`
- exact current workflow state
- locked Source of Truth paths
- allowed/prohibited scope
- exact mutable workspace
- acceptance checks
- revision-bound evidence; no raw prompt/stderr
- retry budget below
- independent review checkpoints below
- explicit external escalation routes
- Owner checkpoints
- `execution.engine: hermes-native`
- primary executor distinct from reviewer
- `model_substitution_authorized: false`
- telemetry optional only, never required.

## 2. Retry / escalation budget

Per stable Issue Fingerprint:
- local_fix_attempts: 2
- reviewer_remediation_attempts: 2
- senior_escalations: 1 per authorized Codex classification
- initial failure is observation, not a repair attempt.
- same failure after two bounded ordinary repairs => Codex classification.
- Claude may remediate only after Codex returns the authorized difficult-remediation route.
- new materially different root cause gets a new fingerprint; prior history remains linked.

## 3. Workspaces / ownership

- House planning/evidence: `D:\AI-Workspace\runtime\worktrees\wstera-control-truth-sync-001`
- hub-web implementation source baseline: `D:\AI-Workspace\projects\saas-product-hub\apps\hub-web`
- Control Sync source baseline: `D:\AI-Workspace\temp\wstera-control-sync-build`
- Installed runtime skills are read/verify targets, not source-of-truth edit locations.
- Before any implementation, Hermes MUST create or select isolated mutable worktrees for hub-web and wstera-workflows. Never patch the inspected canonical worktrees if they contain unrelated work.
- No two parallel Swarm lanes may mutate the same workspace.

## 4. Stage graph

```text
T0 Canonical reconciliation + runtime/config freeze
  -> B0 AUTO_GATE
T1 Scope contract + production-truth dependency closure spec
  -> T2 API/RPC/schema implementation + migration qualification
  -> R1 CODEX IMPORTANT REVIEW
T3 Remove production mock/demo runtime paths
  -> B3 AUTO_GATE
T4 Hermes Control Sync integration for scoped work
  -> B4 AUTO_GATE
T5 Owner Inbox decision round-trip
  -> R2 CODEX IMPORTANT REVIEW
OWNER CHECKPOINT: authorize production DB migration/deploy
T6 Release/apply/deploy + live proof
  -> R3 CODEX POST-DEPLOY REVIEW
T7 Final reconciliation + evidence packet
  -> READY FOR OWNER CONTROL TRUTH REVIEW
```

Codex is NOT called for every Work Unit. A stage may force extra review only when WF-DEV-01 requires it because of critical boundary, batch-size threshold, unexpected scope, or failed remediation.

## 5. T0 — Canonical reconciliation / runtime freeze

Worker: `swarm-inspector`; evidence normalization: `swarm-evidence`.

Required:
- fetch/recheck House, hub-web and wstera-workflows refs, origin parity, worktree state.
- verify Draft PR #2 remains OPEN/DRAFT and do not merge.
- read House closure packet and `docs/CURRENT_STATUS.md`.
- re-read installed Swarm + Control Sync skill versions/hashes.
- run Swarm profile/header preflight and Control Sync doctor/outbox status.
- verify current production Worker version and public health.
- recheck Mac device parity if Mac is online; if offline, record `MAC_PARITY_UNVERIFIED`.
- verify Control Sync endpoint environment.

B0 acceptance:
- no unknown drift affecting the contract.
- Windows runtime preflight passes.
- Re-run Control Sync doctor through the Hermes-loaded environment before live sync. Planning-time verification is PASS: endpoint configured + HTTPS-valid, secret configured without exposure. If this regresses, BLOCK live sync; do not fake success.
- no source mutation.

## 6. T1 — Scope contract + dependency closure

Worker: `swarm-inspector` only; Brief already locks architecture, so no new architecture decision is delegated.

Produce:
- exact change map for `work-event-schema.ts`, `identity.ts`, `agentEvents.ts`, RPC migration, Work Queue mapping/types/tests.
- exact production dependency closure for demo repository, demo command executor, fixture imports, router fallbacks, UI simulation defaults.
- exact Owner decision write path and proposed poll/ack integration points.
- additive migration design for explicit `scopeType/scopeKey`.
- backward compatibility proof for canonical Product events.

No code mutation in this stage.

## 7. T2 — API/RPC/schema implementation + qualification

Work Units:
- T2-WU01 `swarm-builder`: implement explicit work-scope contract in hub-web.
- T2-WU02 `swarm-db`: independently qualify additive migration/RPC, rollback/forward-fix, RLS and privilege effects; NO live apply.
- T2-WU03 `swarm-tester`: unit/integration tests for product and non-product scope, revision, idempotency, concurrency and Owner Inbox atomicity.
- T2-WU04 `swarm-evidence`: revision-bound packet.

Required cases:
- product + canonical identity => accepted.
- product + missing/unknown/conflicting identity => rejected.
- non-product + explicit allowed scope + null product identity => accepted.
- non-product + product identity present => rejected.
- no Product identity + no explicit non-product scope => rejected.
- existing Product task cannot mutate scope/product identity.
- revision N accepts only N+1.
- same event ID/same payload deduplicates; same ID/different payload conflicts.
- Owner Inbox effect remains idempotent.

R1: Codex independent review of exact target revision, migration and evidence. Valid outcomes follow policy. No live DB mutation.

## 8. T3 — Remove production mock/demo runtime paths

Work Units:
- T3-WU01 `swarm-builder`: make Overview/Customers/Billing/Operations production paths use production-safe live/empty/degraded adapters; no default `DemoControlPlaneRepository`.
- T3-WU02 `swarm-builder`: make Owner Inbox, Agent Activity, Portfolio Gates and UI defaults truth-preserving; no demo fallback in production.
- T3-WU03 `swarm-builder`: disable simulation-only command success in production; do not activate payment/billing mutation.
- T3-WU04 `swarm-tester`: production dependency-closure and runtime-mode tests.
- T3-WU05 `swarm-evidence`: packet.

Acceptance:
- production import/runtime closure cannot select demo fixtures/repository/executor as live data.
- no-data returns empty/not-connected; DB error returns degraded/unavailable; authority stop returns blocked.
- test fixtures remain permitted only outside production dependency closure.
- loading/missing query data never defaults to `simulation`.
- no fabricated customers/billing/operations/work/inbox/activity/gates.
- no new real payment action.

B3 is mechanical unless critical/batch rules force Codex review.

## 9. T4 — Hermes Control Sync integration

Mutable repo: isolated worktree from `Gutumrod/wstera-workflows@e711b94`.

Work Units:
- T4-WU01 `swarm-builder`: update `wstera-control-sync` sender/contract for explicit non-product scope.
- T4-WU02 `swarm-tester`: dry-run normalization, durable outbox, exact-body retry, scope serialization, redaction.
- T4-WU03 `swarm-evidence`: source/install parity plan and installation evidence.

Requirements:
- Hermes emits Work Queue state only at material transitions.
- activity remains activity; it cannot promote canonical task state.
- pending/dead-letter delivery is visible failure, not PASS.
- endpoint and secrets are read from runtime environment/canonical secret channel; never command arguments.
- do not install revised skill over the runtime copy until exact revision has passed required review/installation gate.

B4 mechanical gate; if runtime skill revision changes security/auth behavior, roll into R2.

## 10. T5 — Owner Inbox decision round-trip

Work Units:
- T5-WU01 `swarm-builder` hub-web: add agent-only decided-item poll + consumption acknowledgement path linked to task/root task.
- T5-WU02 `swarm-builder` wstera-workflows: add durable decision poll/consume support to Control Sync.
- T5-WU03 `swarm-tester`: cross-repo contract tests and replay/tamper/wrong-task/wrong-option cases.
- T5-WU04 `swarm-evidence`: revision-bound end-to-end packet.

Required behavior:
- Owner UI decision is preserved as immutable audit data.
- Hermes has no Control DB owner/service-role credential.
- polling only returns decisions authorized for the requesting canonical task/root.
- Hermes persists decision evidence before acknowledging consumption.
- repeated poll after acknowledged consumption cannot re-advance the run.
- cross-endpoint HMAC replay is prevented by domain separation.
- wrong-task, stale, tampered or unsupported-option decisions fail closed.

R2: Codex independently reviews exact hub-web + wstera-workflows revisions and the cross-repo evidence.

## 11. Owner production checkpoint

After R2 approval, STOP at `OWNER_HOLD_PRODUCTION_MUTATION`.

Owner decision must explicitly cover:
- live Control DB migration apply;
- hub-web production deployment;
- revised Control Sync runtime installation/activation if required;
- rollback/forward-fix plan.

No owner response => no live mutation.

## 12. T6 — Release / deploy / live proof

Entry: explicit Owner production authority + exact R2-approved revisions.

Workers:
- `swarm-release`: preflight, release qualification, deployment/post-release verification only within its proven authority.
- `swarm-db`: pre/post schema verification; live apply only through the separately authorized migration procedure.
- `swarm-tester`: live read-only verification.
- `swarm-evidence`: final deployment evidence.

If the selected Swarm release worker is not authorized by its runtime contract to perform a required production mutation, STOP and route that mutation to the approved operator path; Hermes coordinates but does not perform substantive release mutation itself.

Live proof must demonstrate:
- Product task sync still works and identity conflicts fail closed.
- House/Platform task sync works with explicit non-product scope and no fake Product code.
- Owner hold produces one Inbox item.
- Owner decision is consumed by Hermes and advances only the authorized checkpoint.
- live UI truth modes are LIVE / EMPTY / DEGRADED / BLOCKED as applicable.
- no demo customer/billing/operation/work/inbox/activity/gate state appears in production.
- Control sender outbox has no unexplained pending/dead-letter items.
- public health/security baseline remains intact.

R3: Codex post-deploy independent review bound to deployed Worker/version, DB migration evidence, runtime skill revision and live proof.

## 13. T7 — Final reconciliation / evidence packet

Workers: `swarm-inspector` + `swarm-evidence`.
Reconcile:
- exact repos/branches/SHAs and deployment version.
- migration state and rollback/forward-fix state.
- installed skill versions/hashes.
- Control task revision and Owner Inbox decision evidence.
- dirty worktree classification.
- all acceptance criteria.
- secret scan.
- remaining limitations and non-claims.

Stop line on full acceptance:
`READY FOR OWNER CONTROL TRUTH REVIEW — WSTERA-CONTROL-TRUTH-SYNC-001`

Do not auto-close the task and do not widen claims to `PRODUCTION_READY` or `OPERATED_STABLE` unless a separate authority/evidence contract supports them.

## 14. Material Control Sync transitions

Sync only:
- task initialized/resumed;
- Stage start;
- Work Unit start;
- assignee change;
- executing;
- awaiting independent review;
- review verdict;
- remediation;
- blocked;
- waiting Owner;
- Owner decision resolved;
- completed;
- closed.

Do not emit revisions for conversational progress.

## 15. Mandatory evidence per stage

- exact repo/worktree/branch/base/target SHA;
- changed-file list and allowed-scope check;
- worker profile + model/provider provenance;
- deterministic command/check results;
- failure/remediation ledger;
- artifact paths + hashes;
- Control sync state/revision when applicable;
- no secret values;
- reviewer verdict at mandatory checkpoints;
- Owner decision record at production checkpoint.
