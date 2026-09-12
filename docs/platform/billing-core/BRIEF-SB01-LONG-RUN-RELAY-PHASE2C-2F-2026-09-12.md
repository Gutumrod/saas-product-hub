# BRIEF — SB01 Long-Run Relay — Phase 2C through 2F — 2026-09-12

Program: `SB01 — WSTERA Central Billing Core`
Owner: `Free`
Commander / Final Verify: `Sol`
Orchestrator: `Hermes`
Primary execution workflow: `WF-RELAY-01 v1.2.0`
Supporting implementation contract: `WF-DEV-01 v1.1.0`
Work type: `DIRECT-APPROVED`
Release policy: `RELAY_STANDARD`
Execution status: `READY FOR OWNER LAUNCH / NOT LAUNCHED`
Final hard stop: `READY FOR SOL/OWNER REVIEW — SB01 PHASE 2F PROJECTION CONTRACT`

## Owner direction

Run SB01 as the first controlled Long-Run Relay pilot. The execution chain should continue across approved stages without requiring Owner chat handoff after every normal checkpoint.

Hermes holds the approved plan, dispatches agents, persists stage evidence/checkpoints, and advances only when deterministic gates and Codex checkpoint verification pass.

Owner/Sol must be called only for an explicit hard stop, decision gap, architecture/security/business contract change, unauthorized mutation requirement, unrecoverable executor/runtime failure, repair-loop exhaustion, or the final Phase 2F review checkpoint.

This brief does not authorize immediate execution by itself. Relay runtime parity is now PASS. Owner launch authorizes Hermes to start orchestration and run PRE-01; no substantive agent stage may release unless PRE-01 passes fail-closed.

## Locked role map

### Hermes — Orchestrator / Clerk only
Hermes owns orchestration mechanics only:
- hold this brief and the stage graph;
- perform fail-closed Relay preflight;
- create/release stage dispatches;
- persist exact revision/evidence/checkpoint state;
- route work according to Codex verdict/classification;
- advance to the next stage only after required gates pass;
- stop on hard checkpoint, decision gap, runtime/executor failure, scope conflict, or repair-loop exhaustion.

Hermes must NOT:
- implement or patch product/runtime source;
- decide whether work quality is acceptable;
- invent architecture/business/security decisions;
- classify a substantive defect by its own judgment;
- silently substitute agents or widen scope.

### AGY + Qwen — Primary workers
AGY and Qwen are the primary implementation workers for this Long-Run pilot.

Hermes assigns bounded non-overlapping work packages to AGY and/or Qwen according to stage scope and current executor readiness. They may run sequentially or in parallel only when write scopes are independent and the Relay preflight records why parallelism is safe.

Default worker responsibilities:
- implement locked stage requirements;
- add/update bounded tests and evidence required by the stage;
- repair ordinary defects routed back by Codex;
- commit/push exact work revision and return inspectable evidence.

Neither AGY nor Qwen may self-approve their own work or reinterpret the locked product/architecture/security contract.

### Codex — Head verifier / checkpoint authority
Codex is the independent checkpoint verifier for every material SB01 Long-Run stage.

Codex reviews the exact stage revision and evidence after worker deterministic gates. Codex must not repair production source during the verification pass.

Codex returns exactly one routing verdict:
- `PASS` — stage is acceptable; Hermes may advance to the next authorized stage.
- `FIX_BY_AGY` — bounded ordinary remediation assigned to AGY; return to Codex after repair.
- `FIX_BY_QWEN` — bounded ordinary remediation assigned to Qwen; return to Codex after repair.
- `SEND_TO_CLAUDE` — defect is difficult/substantive enough that the precision closer is required.
- `SOL_OWNER_DECISION_REQUIRED` — product/architecture/security/business/authority decision is required; Hermes hard-stops.

Codex must bind every verdict to an exact SHA/artifact set and include the finding set plus required acceptance/regression checks for any non-PASS result.

### Claude — Difficult-work closer only
Claude is NOT a normal stage worker and must not be dispatched merely because it is available.

Claude is used only when Codex returns `SEND_TO_CLAUDE`, or Sol explicitly authorizes a difficult-work closure package after a hard blocker.

Claude receives the complete bounded defect package, exact reviewed SHA, allowed/prohibited scope, required regression checks, and stop condition. After Claude returns, Codex performs fresh verification before Hermes advances.

### Sol / Owner
Sol remains Commander / Architect / Final Verify. Owner remains Final Authority.

Hard stops requiring Sol/Owner include:
- architecture/security/business contract change;
- undefined Product or billing authority decision;
- production/live mutation requirement;
- cross-product contract change beyond locked Phase 2 scope;
- repair-loop exhaustion;
- unrecoverable Relay/executor integrity failure;
- final Phase 2F Control read-contract projection review.

## Source of Truth — read before execution

1. House R3 closure: `docs/platform/billing-core/REVIEW-SB01-PHASE-2B-HOUSE-SOL-R3-2026-09-12.md`.
2. Canonical continuation: `docs/platform/billing-core/BRIEF-SB01-WSTERA-CENTRAL-BILLING-CONTINUATION-2026-09-09.md`.
3. `docs/platform/billing-core/CANONICAL-BILLING-SYSTEM-MAP-2026-09-09.md`.
4. `docs/platform/billing-core/BRIEF-CENTRAL-BILLING-CORE-PHASE2-CONTINUATION-2026-09-08.md`.
5. Council architecture/risk contracts under `docs/council-billing-core-multiproduct-2026-09-07/`.
6. Product Billing Profile contract and existing Phase 2A/2B evidence.
7. Actual SB01 source/tests at the exact execution revision.
8. `WF-RELAY-01` and the canonical local `kanban-external-agent-dispatch` runtime procedure active at execution time.

Chat history is not Source of Truth.

## Current accepted baseline

Phase 2B is accepted/closed at material SHA:
`6be6cb36af42ba2cef62a8f070f0bb8d0a5e2895`

House/Sol R3 independently verified:
- runtime build PASS;
- runtime typecheck PASS;
- runtime tests 10/10 PASS;
- Product Billing Profile Registry 16/16 PASS;
- `git diff --check` PASS;
- reviewed worktree clean.

Long-Run execution must start only from a clean exact revision descended from this accepted baseline and after all preparation/governance commits are pinned.

## PRE-00 — Relay runtime parity gate — PASS

Resolved by task `RELAY-RUNTIME-PARITY-001`.

Canonical verified state:
- Workflow Registry: `WF-RELAY-01 v1.2.0` -> `kanban-external-agent-dispatch v2.3.8`.
- Workflow registry main closure commit: `713c7124e7743e731583b755ba87c5fad9ba24a1`.
- Canonical Windows runtime: `kanban-external-agent-dispatch v2.3.8`.
- Runtime path: `D:\AI-Workspace\runtime\hermes-native\data\skills\devops\kanban-external-agent-dispatch\SKILL.md`.
- Runtime SHA-256: `F8AFFA7C0430FA645581129BB01B60C5AF2BEA2CA36CD1C5C9E853CA2B4CD809`.
- Runtime-home guard: PASS; effective process/gateway home = `D:\AI-Workspace\runtime\hermes-native\data`.
- Named external executor readiness: Claude PASS, AGY PASS, Qwen PASS, Codex PASS.
- `execution_backend = direct_external_process`; `transport_model = none`.

PRE-00 is closed. Do not reopen or downgrade runtime during this pilot unless fresh evidence shows a material runtime integrity failure.

## PRE-01 — Mandatory execution preflight

Before any substantive agent call, Hermes must persist a complete Relay preflight proving:
- canonical skill path/version/hash;
- effective `HERMES_HOME`;
- work type `DIRECT-APPROVED`;
- this brief and referenced Source of Truth are readable;
- Owner launch approval for this Long-Run pilot is present;
- workspace / branch / exact starting revision are unambiguous and clean;
- allowed/prohibited paths are explicit per stage;
- external CLI readiness passes for AGY, Qwen, Codex, and Claude before any of them is used;
- no overlapping write scopes exist;
- context mode / QA mode are valid;
- failure behavior is `STOP`;
- no live/production secrets or mutation authority are present.

If a required selected executor is unavailable, do not silently substitute another agent. HOLD or re-plan only through an explicitly recorded Sol/Owner-approved routing change.

## Production portability rule — Owner locked 2026-09-12

WSTERA LAB is a temporary proof environment, not the permanent SB01 deployment target. All Phase 2C-2F implementation and evidence must remain production-portable.

Mandatory rules:
- tracked source, migrations, schemas, tests, contracts, and runtime behavior must not hardcode WSTERA LAB project IDs, hosts, credentials, Stripe Test keys, webhook signing secrets, Test Price IDs, callback URLs, or other environment-specific values;
- environment/provider-specific values must enter through approved profile/config/secret boundaries only;
- database evolution must be reproducible from versioned migrations/contracts; production is created by applying the same approved migrations, not by copying LAB test data or treating LAB as the production database;
- LAB disposable/test records and proof fixtures must never be promoted as production data;
- production provisioning is expected to replace LAB/Test bindings with production-only values, including BILLING_DATABASE_URL, Stripe Live credentials, production webhook endpoint/signing secret, production Product/Price bindings, and production return URLs;
- Stripe CLI listener secrets and localhost webhook forwarding are test-only evidence mechanisms and must never become production configuration;
- production webhook registration must use the real public SB01 production endpoint and a separately provisioned production signing secret;
- evidence must label LAB/Test versus Production/Live state explicitly so a green LAB proof cannot be misrepresented as production readiness;
- any LAB-specific value embedded in tracked source or required for business logic is a portability defect and must fail the relevant checkpoint;
- promotion to production must be a provisioning/deploy/migrate/verify operation against an approved SB01 artifact, not a redesign or rewrite of the billing core.

Expected production promotion path after Owner authorization:
deploy approved SB01 artifact -> apply approved migrations -> provision production profiles/secrets -> register production webhook -> smoke/financial-truth verification -> release decision

This rule does NOT authorize production deployment, Live Stripe mutation, production database mutation, or Live webhook registration during the current Phase 2C-2F Long-Run. Current execution remains LAB + Stripe TEST only until a separate Owner-authorized production gate.

## Long-Run stage graph

### LR-2C — HTTP + Stripe Test vertical slice
Objective:
- start the Core HTTP boundary from SB01;
- exercise valid PS01 Test checkout through the Core API, never a direct provider shortcut;
- persist/verify operation, customer, and provider mappings in WSTERA LAB;
- re-fetch the Stripe Test object as financial truth;
- prove caller cannot override Product, environment, Price ID, amount, currency, provider customer, return URLs, or profile version.

Primary workers: `AGY + Qwen` under bounded non-overlapping dispatches.

Required deterministic gate before Codex:
- relevant tests/build/typecheck PASS;
- required LAB/Stripe-Test evidence exists;
- no live/production mutation;
- `git diff --check` PASS;
- exact source revision committed/pushed;
- branch parity recorded.

Then: `Codex checkpoint verify`.

### LR-2D — Webhook durability + reconciliation
Objective:
- send a real Stripe Test-signed webhook through the Core webhook route;
- prove raw-body signature validation;
- prove durable event claim/outbox before success response;
- replay duplicate webhook and prove no double transition;
- exercise retry/lease/dead-letter behavior;
- exercise out-of-order/ambiguous events and provider re-fetch;
- prove scheduled reconciliation repairs a missing-webhook case.

Primary workers: `AGY + Qwen`.

Codex must verify exact revision/evidence before Hermes advances.

### LR-2E — Entitlement + multi-Product isolation
Objective:
- exercise signed deterministic Test entitlement sink;
- prove idempotent replay and monotonic transition versioning;
- exercise PS01 + LK01 through actual runtime path;
- prove identical account text cannot cross Product customer/subscription/outbox/entitlement state;
- keep Product-owned business entitlement semantics outside SB01 Core.

Primary workers: `AGY + Qwen`.

Codex must verify exact revision/evidence before Hermes advances.

### LR-2F — Control read-contract projection
Objective:
- define explicit read-only authoritative projection/transport contract for Control Plane from proven SB01 runtime truth;
- prove Control remains consumer/read-only only;
- no payment mutation, provider mutation, billing state machine, or second billing source of truth in Control.

Primary workers: `AGY + Qwen` for bounded implementation/documentation/test scope only.

Codex performs the Phase 2F checkpoint audit. Even if Codex returns `PASS`, Hermes MUST NOT advance into Control implementation or any further SB01 phase.

Hard stop:
`READY FOR SOL/OWNER REVIEW — SB01 PHASE 2F PROJECTION CONTRACT`

## Checkpoint routing contract

For every material stage:

`AGY/Qwen work -> deterministic gate -> Codex exact-SHA verification -> routing verdict`

Routing:
- `PASS` -> Hermes persists checkpoint and releases the next already-authorized SB01 stage.
- `FIX_BY_AGY` -> Hermes dispatches one bounded AGY remediation -> deterministic gate -> fresh Codex verification.
- `FIX_BY_QWEN` -> Hermes dispatches one bounded Qwen remediation -> deterministic gate -> fresh Codex verification.
- `SEND_TO_CLAUDE` -> Hermes materializes a Claude difficult-work remediation packet -> deterministic gate -> fresh Codex verification.
- `SOL_OWNER_DECISION_REQUIRED` -> hard stop; no dependent stage release.

Codex is the semantic routing authority for quality/remediation classification. Hermes executes the routing mechanically and may not reinterpret it.

## Repair-loop guard

A normal stage must not ping-pong indefinitely.

Per material checkpoint:
1. primary AGY/Qwen implementation round;
2. Codex verification;
3. at most one ordinary bounded repair by the worker selected by Codex;
4. Codex re-verification;
5. if still substantive/difficult, Codex routes `SEND_TO_CLAUDE`;
6. Claude gets one bounded difficult-work closure round;
7. Codex re-verifies;
8. if still not PASS, hard stop `SOL_OWNER_DECISION_REQUIRED`.

No silent retry, strategy mutation, agent substitution, or unlimited repair loops.

## Context / independence rules

Codex first verification of each material stage uses `INDEPENDENT-QA` semantics: exact target revision, neutral locked requirements, target source required to test, allowed/prohibited paths, and safety constraints. Withhold worker PASS claims, suspected defect hints, implementation rationale, and expected verdict until first Codex report is persisted.

Repair/re-verification rounds may use `INFORMED-VERIFY` with the persisted Codex defect report.

Qwen may use `trusted-repo` only for authorized implementation/repair with deterministic path/diff gates. When used for isolated evidence analysis, use the runtime-supported isolation mode and no unauthorized repository mutation.

## Mandatory negative-authority matrix

Through the real HTTP/runtime boundary, fail closed for spoof/override attempts involving at least:
- Product ID/code;
- environment;
- account identity / invalid account assertion;
- Stripe Product/Price mapping;
- amount;
- currency;
- Stripe Customer ID;
- arbitrary success/cancel/portal return URL;
- profile version;
- cross-Product credential use;
- replayed/expired operation authority.

For every denied request, prove no provider object creation and no durable billing side effect.

## Phase 2C-2F PASS evidence contract

Do not claim the Long-Run milestone is ready for final review unless evidence proves all applicable items:
- runtime build/typecheck/tests PASS;
- LAB migrations/catalog verification remain valid;
- HTTP Core boundary exercised;
- real Stripe Test Checkout through SB01;
- webhook durability before success response;
- duplicate/out-of-order behavior correct;
- provider re-fetch used as financial truth;
- reconciliation repair including missing-webhook case;
- signed/idempotent/monotonic entitlement Test proof;
- PS01/LK01 runtime isolation and negative-authority proof;
- Control read-contract projection defined from Core truth;
- cleanup/rollback evidence recorded;
- no live/production mutation;
- exact SHAs and Codex checkpoint reports persisted for every material stage.

Green unit tests without runtime/provider/DB evidence are not sufficient.

## Scope locks

Do not expand this Long-Run pilot into:
- external SB01 productization;
- public developer API/SDK/meters/third-party onboarding;
- MT01 billing integration;
- BK01 live migration/extraction;
- PromptPay recurring billing;
- live Stripe keys or live charges;
- production deploy;
- Product-owned business entitlement rewrites;
- Control Plane payment mutation;
- Control Plane implementation beyond the Phase 2F SB01 read-contract artifact;
- Council reopening unless evidence proves a genuine architecture/security/business decision gap.

## Git / evidence discipline

- Work only on the authorized SB01 continuation branch/worktree.
- Do not reset/stash/clean unrelated pre-existing work.
- Stage intended files explicitly.
- Keep House governance/doc commits separate from SB01 runtime implementation commits.
- No secret values in Git, command arguments, evidence, or logs.
- Before every Codex checkpoint: deterministic tests/build as applicable, `git diff --check`, intended diff review, exact commit/push, branch parity.
- Every Codex report, worker remediation return, and Hermes checkpoint transition must be persisted before downstream release.

## Launch condition

This brief is `READY FOR OWNER LAUNCH / NOT LAUNCHED`.

Preparation gates already satisfied:
1. Relay workflow/runtime parity resolved and persisted — PASS.
2. fresh-session/runtime-home verification — PASS.
3. AGY/Qwen direct readiness probes — PASS; full named-executor readiness reported PASS after parity remediation.
4. revision-pinned Long-Run task graph and first-stage dispatch must be present in the SB01 repo launch packet.

Owner launch authorizes Hermes to begin orchestration only. Hermes must first persist PRE-01 complete Relay preflight. If PRE-01 is not PASS, stop before substantive AGY/Qwen/Codex/Claude execution.

Until explicit Owner launch: `READY FOR OWNER LAUNCH — NOT RUNNING`.
