# TASK — WSTERA-CONTROL-TRUTH-SYNC-001

Status: **READY FOR HERMES PRECHECK — IMPLEMENTATION NOT STARTED**
Workflow: `WF-DEV-01 v1.3.0 / LONG_RUN`
Owner: WSTERA Owner
Coordinator/State Holder: Hermes
Ordinary execution engine: `hermes-native-swarm`
Control projection: `wstera-control-sync`

## Objective

Make WSTERA Control show truthful Owner-visible House/Platform work state, remove production demo/mock substitution, and complete the Owner Inbox → Hermes decision round-trip while preserving current security, product identity, revision, idempotency and atomicity invariants.

## Locked Source of Truth

1. `docs/platform/house-long-run/BRIEF-WSTERA-CONTROL-TRUTH-SYNC-AND-PRODUCTION-MOCK-REMOVAL-2026-09-21.md`
2. `docs/platform/house-long-run/RUN-MANIFEST-WSTERA-CONTROL-TRUTH-SYNC-001.md`
3. this Task
4. `docs/platform/house-long-run/OWNER-FINAL-ACCEPTANCE-CLOSURE-2026-09-21.md`
5. `docs/platform/house-long-run/B6-FINAL-REVIEW-REPORT-CODEX-2026-09-21-r2.md`
6. `docs/platform/house-long-run/T6-WU03-FINAL-EVIDENCE-PACKET-2026-09-21.md`
7. `docs/CURRENT_STATUS.md`
8. installed Swarm/Control Sync skill contracts and `Gutumrod/wstera-workflows@e711b94` Control Sync policy.
## Entry baseline

- House base: `Gutumrod/saas-product-hub@13a2d55b509d15ee5b6375562b029c0dc98dce49`.
- Planning branch: `work/wstera-control-truth-sync-001`.
- hub-web baseline: `Gutumrod/hub-web work/house-platform-closure-20260919@407130718646d13630b9789f68522a521fc74483`, clean and origin-parity.
- hub-web PR #2: OPEN/DRAFT; MUST NOT auto-merge.
- deployed Worker at planning time: `5dc81232-c116-4722-a6c1-74c15ad50385`.
- Control Sync baseline: `Gutumrod/wstera-workflows task/WSTERA-CONTROL-SYNC-001@e711b94835525def94757e9ec3b4ec5bda615308`.
- Swarm: v0.1.1, tests PASS.
- Control Sync: v0.1.0, 7/7 tests PASS, installed/source byte parity PASS.
- Windows Hermes discovery: both required skills enabled.
- Mac parity: UNVERIFIED because Mac device offline.

## Pre-Hermes blockers

### BLOCKER-01 — live Control endpoint configuration
Current `control_sync.py doctor` reports:
- local/outbox OK;
- secret configured through canonical secret source;
- secret value not exposed;
- `endpoint_configured=false`.

Before the first live Control event, provision `WSTERA_CONTROL_AGENT_EVENTS_URL` in the Hermes runtime environment using the approved configuration path and rerun doctor. Do not write endpoint/secret configuration into source code or evidence.

### CONDITIONAL-BLOCKER-02 — Mac execution
Do not execute this run on Mac until Mac skill/version/hash parity is re-verified. Windows execution is not blocked by Mac being offline.
## Required outcomes

1. Explicit scope identity supports Product and non-product work without fake Product codes.
2. Product identity invariants remain fail-closed and immutable.
3. Production runtime cannot substitute demo/mock rows or simulation success for real state.
4. Owner Inbox decision is consumable by Hermes through an authenticated, auditable, durable return path without direct DB credentials.
5. Hermes syncs canonical state only at material transitions.
6. live Owner view can distinguish LIVE / EMPTY / DEGRADED / BLOCKED.
7. all changes are revision-bound, independently reviewed at manifest checkpoints, and live mutation occurs only after Owner authorization.

## Allowed implementation scope

### hub-web
- Control work-event schemas/normalizer/identity handling.
- `/api/webhooks/agent-events` compatibility required for explicit work scope.
- additive Control DB migration/RPC changes.
- Work Queue/Owner Inbox/Agent Activity/Portfolio truth-mode paths.
- Overview/Customers/Billing/Operations production repository/service wiring needed only to remove demo truth.
- command path changes needed only to disable production simulation/fake success.
- Owner decision poll/ack server path.
- UI changes required to render truthful modes.
- tests/evidence/runbooks directly required by this task.

### wstera-workflows
- `runtime-skills/devops/wstera-control-sync` contract/script/tests.
- `policies/CONTROL-SYNC-POLICY.md` only if required to reflect the implemented contract.
- task-specific evidence/implementation record required by that repo's governance.
## Prohibited scope

- Product feature implementation.
- payment/billing provider/Stripe/bank mutation.
- destructive DB operation or `db:push`.
- weakening RLS/least privilege/HMAC/revision/idempotency.
- direct Control DB owner/service-role credentials in Hermes.
- secrets in repo/log/evidence/command arguments.
- Agent Relay ordinary execution.
- unapproved paid dependency.
- mass refactor.
- merge of Draft PR #2 without explicit Owner authority.
- production migration/deploy before Owner checkpoint.

## Review checkpoints

- R1 after T2: Codex — scope identity + API/RPC/migration.
- R2 after T5: Codex — mock-removal + Control Sync + Owner decision round-trip candidate.
- Production Owner checkpoint after R2.
- R3 after T6 live proof: Codex — deployed revision/runtime/evidence.

Codex is not a per-Work-Unit reviewer.

Claude is not an ordinary builder/reviewer. For a stable technical defect: two bounded ordinary repair attempts, then Codex classification; Claude only on authorized difficult-remediation outcome.

## Initial Hermes instruction
On start:
1. read Task → Run Manifest → Brief in that order;
2. verify all exact refs and dirty states again;
3. load `hermes-native-swarm` and `wstera-control-sync`;
4. run Swarm header/profile preflight and Control Sync doctor/outbox status;
5. emit only activity/dry-run evidence until generic work sync and endpoint prerequisites allow truthful live Work Queue projection;
6. execute T0 only;
7. continue automatically through pre-approved technical stages unless a manifest stop/Owner boundary is reached;
8. never modify the three unrelated untracked `docs/platform/shared-runtime` files in the original House worktree.

## Completion condition

The task is not complete when code/tests are merely green.

Completion requires:
- exact revisions and deployment identity recorded;
- scope contract live and proven;
- production mock/demo substitution closure proven;
- Owner decision round-trip proven;
- Control state/revision proof;
- secret scan clean;
- required independent review PASS;
- final evidence packet reconciled.

Final stop:
`READY FOR OWNER CONTROL TRUTH REVIEW — WSTERA-CONTROL-TRUTH-SYNC-001`

Owner closure is separate and MUST NOT be inferred.
