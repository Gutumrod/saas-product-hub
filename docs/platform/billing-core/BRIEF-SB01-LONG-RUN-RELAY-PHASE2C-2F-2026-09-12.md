# BRIEF — SB01 Long-Run Relay — Phase 2C through 2F — 2026-09-12

Program: `SB01 — WSTERA Central Billing Core`
Owner: `Free`
Commander / Final Verify: `Sol`
Orchestrator: `Hermes`
Primary execution workflow: `WF-RELAY-01 v1.2.0`
Supporting implementation contract: `WF-DEV-01 v1.1.0`
Work type: `DIRECT-APPROVED`
Release policy: `RELAY_STANDARD`
Execution status: `HOLD — BRIEF READY / DO NOT RUN YET`
Final hard stop: `READY FOR SOL/OWNER REVIEW — SB01 PHASE 2F PROJECTION CONTRACT`

## Owner direction

Run SB01 as the first controlled Long-Run Relay pilot. The execution chain should continue across approved stages without requiring Owner chat handoff after every normal checkpoint.

Hermes holds the approved plan, dispatches agents, persists stage evidence/checkpoints, and advances only when deterministic gates and required verifier stages pass.

Owner/Sol must be called only for an explicit hard stop, decision gap, architecture/security/business contract change, unauthorized mutation requirement, unrecoverable executor/runtime failure, repair-loop exhaustion, or the final Phase 2F review checkpoint.

This brief does not authorize immediate execution. Prepare only. Hermes must not be started until the Relay runtime parity gate below is PASS.

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

## PRE-00 — Mandatory Relay runtime parity gate

Observed during brief preparation:
- Workflow Registry / `WF-RELAY-01 v1.2.0` currently records runtime procedure `kanban-external-agent-dispatch v2.3.6`.
- Canonical Windows runtime file currently declares `kanban-external-agent-dispatch v2.3.8`.
- Observed runtime path: `D:\AI-Workspace\runtime\hermes-native\data\skills\devops\kanban-external-agent-dispatch\SKILL.md`.
- Observed SHA-256: `F8AFFA7C0430FA645581129BB01B60C5AF2BEA2CA36CD1C5C9E853CA2B4CD809`.

This mismatch is a HARD HOLD under Relay preflight. Before execution, governance/runtime synchronization must establish one canonical approved combination and fresh-session verification must prove Hermes sees that same runtime metadata/version.

Do not reinterpret `WF-RELAY-01 v1.2.0` silently against v2.3.8. Do not downgrade the runtime to force a match. Resolve and persist the parity decision first.

## PRE-01 — Mandatory execution preflight

Before any substantive agent call, Hermes must persist a complete Relay preflight proving:
- canonical skill path/version/hash;
- effective `HERMES_HOME`;
- work type `DIRECT-APPROVED`;
- this brief and referenced Source of Truth are readable;
- Owner approval for this Long-Run pilot is present;
- workspace / branch / exact starting revision are unambiguous and clean;
- allowed/prohibited paths are explicit per stage;
- external CLI readiness passes for every selected named executor before its first substantive stage;
- no overlapping write scopes exist;
- context mode / QA mode are valid;
- failure behavior is `STOP`;
- no live/production secrets or mutation authority are present.

If any required executor is unavailable, do not silently substitute another agent. HOLD and return the readiness evidence.

## Authority boundary

Hermes may:
- orchestrate;
- gate;
- track;
- materialize approved stage cards/dispatches;
- persist evidence/checkpoints;
- advance to the next pre-approved stage after required gates pass.

Hermes may not:
- implement product code;
- repair defects itself;
- invent architecture/business/security decisions;
- approve its own semantic conclusions;
- widen scope;
- substitute agents silently;
- authorize live/production activity;
- mark Owner acceptance.

## Agent roles for this pilot

### Primary Builder — AGY
AGY receives the first implementation pass for each approved Phase 2C/2D/2E/2F stage, subject to current Relay readiness and role-fit checks.

If AGY readiness/role-fit for a required backend/data/API stage is not verified, HOLD. Do not silently route the stage to another agent.

### Checkpoint Verifier — Codex
Codex performs the stage verification checkpoint against the exact returned revision.

Use `INDEPENDENT-QA` for a first semantic verification pass where independence is required. Withhold builder conclusions and expected verdict until Codex's first report is persisted.

Codex must return a structured result containing at minimum:
- exact reviewed SHA;
- checks/evidence performed;
- findings;
- untested areas;
- `VERDICT = PASS | REMEDIATE | BLOCK`;
- `DEFECT_CLASS = NONE | MECHANICAL | SUBSTANTIVE | DECISION_REQUIRED`.

`DEFECT_CLASS` guides the pre-approved routing below; Hermes does not invent or reinterpret it.

### Precision Remediation — Claude
Claude is reserved for a pre-authorized precision remediation stage only after the original responsible Builder has received the required first repair opportunity or the Builder returns an explicit bounded inability/block that satisfies the escalation condition below.

Claude is not a replacement for an unavailable AGY and is not invoked merely because a defect is inconvenient.

## Repair routing / loop guard

Relay runtime rule remains authoritative: a QA defect returns first to the original responsible Builder.

For each stage:
1. AGY builds -> Codex verifies.
2. `PASS` -> Hermes advances to the next approved stage.
3. `REMEDIATE / MECHANICAL` -> AGY Repair #1 -> fresh Codex verify.
4. `REMEDIATE / SUBSTANTIVE` -> AGY receives one bounded Repair #1 opportunity using the persisted Codex finding package.
5. If AGY Repair #1 returns an explicit substantive inability/block, or fresh Codex verification finds the same substantive defect remains, Hermes may materialize the pre-approved Claude Precision Remediation stage for that exact defect package.
6. Claude remediation -> fresh Codex verify.
7. If the same substantive defect remains after Claude verification, STOP -> Sol/Owner.
8. `DECISION_REQUIRED` at any point -> STOP -> Sol/Owner. No agent invents the missing decision.

Maximum automatic repair chain per stage:
`AGY Build -> Codex -> AGY Repair #1 -> Codex -> Claude Precision #1 -> Codex`.

No additional automatic repair loop is authorized.

## Stage LR-2C — HTTP + Stripe Test vertical slice

Objective: prove the Core HTTP boundary and a valid Test checkout through SB01 without provider shortcuts.

Required work/evidence:
- start/use the SB01 Core HTTP boundary;
- exercise valid PS01 Test checkout through Core API;
- persist and verify operation/customer/provider mappings in WSTERA LAB;
- re-fetch the Stripe Test object as financial truth;
- prove caller cannot override Product, environment, Price ID, amount, currency, provider customer, profile version, or return URLs;
- prove denied requests create no provider object and no unauthorized durable billing side effect;
- no live keys, live charge, production DB or production deployment.

Checkpoint sequence:
`AGY LR-2C Build -> deterministic tests/gates -> Codex LR-2C Verify -> repair routing if needed -> PASS -> LR-2D`.

Hermes may advance from LR-2C to LR-2D automatically only on Codex PASS plus deterministic gate PASS.

## Stage LR-2D — Webhook durability + reconciliation

Objective: prove durable, replay-safe webhook and reconciliation behavior against Stripe Test.

Required work/evidence:
- real Stripe Test-signed webhook through Core webhook route;
- raw-body signature validation;
- durable event claim/outbox before success response;
- duplicate replay with no double transition;
- retry/lease/dead-letter paths;
- out-of-order/ambiguous event handling requiring provider re-fetch;
- scheduled reconciliation repairing a missing-webhook scenario;
- preserve Phase 2B active-lease/dead-letter invariants.

Checkpoint sequence:
`AGY LR-2D Build -> deterministic tests/gates -> Codex LR-2D Verify -> repair routing if needed -> PASS -> LR-2E`.

Hermes may advance automatically only on Codex PASS plus deterministic gate PASS.

## Stage LR-2E — Entitlement + multi-Product isolation proof

Objective: prove deterministic entitlement delivery and real runtime isolation across Products.

Required work/evidence:
- signed deterministic Test entitlement sink;
- idempotent replay;
- monotonic transition versioning;
- PS01 + LK01 exercised through the actual runtime path, not registry-only tests;
- identical account text across Products cannot cross customer/subscription/outbox/entitlement state;
- Product-owned business entitlement semantics remain outside Core;
- mandatory negative-authority matrix remains fail-closed.

Checkpoint sequence:
`AGY LR-2E Build -> deterministic tests/gates -> Codex LR-2E Verify -> repair routing if needed -> PASS -> LR-2F`.

Hermes may advance automatically only on Codex PASS plus deterministic gate PASS.

## Stage LR-2F — Control read-contract projection

Objective: define the authoritative read-only projection/transport contract from proven SB01 runtime truth for future Control Plane consumption.

Required work/evidence:
- projection is derived from SB01 authoritative state, not a second billing state machine;
- explicit schema/transport contract for allowed Control reads;
- no checkout/session creation;
- no portal mutation;
- no webhook ownership;
- no reconciliation ownership;
- no ledger/payment state mutation;
- no provider secret ownership;
- no entitlement mutation authority in Control;
- projection freshness/error/unknown-state behavior is explicit and fail-closed;
- consumer contract is stable enough for a separate Control implementation task later.

Checkpoint sequence:
`AGY LR-2F Contract Build -> deterministic contract checks -> Codex LR-2F Verify -> repair routing if needed`.

On PASS, Hermes MUST STOP. It must not launch Control Plane work.

Final marker:
`READY FOR SOL/OWNER REVIEW — SB01 PHASE 2F PROJECTION CONTRACT`

## Mandatory negative-authority matrix across the Long-Run

Through the real HTTP/runtime boundary, fail closed for attempts to spoof/override at least:
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

Every denied request must prove no unauthorized provider object and no unauthorized durable billing side effect.

## Allowed external mutation scope after execution is separately released

Allowed only inside the later approved Relay execution:
- WSTERA LAB data needed for Phase 2C-2E proof;
- Stripe TEST-mode objects/webhooks needed for Phase 2C-2D proof;
- disposable local test artifacts;
- tracked SB01 branch source/tests/evidence within each stage's explicit allowed paths.

Never allowed under this brief:
- production DB mutation;
- live Stripe keys/charges;
- production deployment;
- Control Plane billing mutation;
- BK01 live migration/extraction;
- MT01 billing integration;
- PromptPay recurring billing;
- external SB01 productization;
- merge/release to production without later explicit authority.

No secret values may enter Git, prompts, command lines persisted as evidence, reports, or chat.

## Deterministic gate required before every stage advance

As applicable to changed scope:
- targeted regression;
- full relevant tests;
- lint if present;
- typecheck;
- build;
- migration/catalog verification when relevant;
- runtime/provider/DB evidence where the stage explicitly requires it;
- `git diff --check`;
- tracked status review;
- exact commit SHA;
- branch/remote parity;
- allowed-path diff check;
- secret scan appropriate to the changed/evidence files.

Green code-only tests do not substitute for required runtime/provider/DB evidence.

## Automatic advance conditions

Hermes may advance to the next stage without Owner/Sol chat only when all are true:
- current stage Source of Truth/dispatch is satisfied;
- required builder return is persisted;
- deterministic gate is PASS;
- Codex verifier returns PASS on the exact revision;
- no decision gap exists;
- no prohibited mutation occurred;
- repository state is clean/expected;
- next stage is already authorized by this Long-Run brief;
- agent readiness for the next selected executor passes.

Otherwise STOP.

## Hard-stop conditions

Immediately stop the affected chain and return to Sol/Owner for any of:
- workflow/runtime version/hash mismatch;
- executor readiness failure with no explicitly approved recovery;
- architecture/security/business-rule decision gap;
- requested scope wider than this brief;
- production/live mutation required;
- schema redesign not already authorized;
- cross-product contract contradiction;
- same substantive defect remains after the maximum repair chain;
- evidence/provenance missing or contaminated;
- repository revision/branch/worktree ambiguity;
- secret exposure;
- Phase 2F verifier PASS (normal final hard stop).

## Required stage evidence / handoff

Every substantive stage must persist:
- exact source artifacts read;
- selected agent + direct-executor provenance;
- exact starting/ending revision;
- files changed;
- commands/checks and exit codes;
- relevant runtime/provider/DB evidence;
- acceptance items completed;
- findings/known limitations/untested areas;
- decision gaps;
- verifier report;
- next stage or exact stop reason.

Task checkpoint must be updated after every material stage before Hermes releases the next stage.

## Pilot success criteria

This Long-Run pilot succeeds operationally only if:
1. Hermes can carry SB01 from released LR-2C through LR-2F without Owner chat handoff at normal PASS checkpoints;
2. independent Codex checkpoints remain revision-bound and uncontaminated where required;
3. repair routing follows the bounded loop without Hermes making semantic decisions;
4. all evidence is persisted and inspectable;
5. no unauthorized production/live/Control mutation occurs;
6. the chain stops automatically at `READY FOR SOL/OWNER REVIEW — SB01 PHASE 2F PROJECTION CONTRACT`.

## Current stop / next action

`BRIEF READY — EXECUTION HOLD`

Do not run Hermes yet.

Next preparation action is to resolve and persist `WF-RELAY-01` / `kanban-external-agent-dispatch` runtime parity, then materialize a revision-pinned Relay plan/task graph from this brief and present the launch packet for Owner review before execution.