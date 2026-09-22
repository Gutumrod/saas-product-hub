# OWNER DECISION — Literal NODE_ENV Production Gate + T3 Resume

Task: `WSTERA-CONTROL-TRUTH-SYNC-001`
Workflow: `WF-DEV-01 v1.3.0 / LONG_RUN`
Decision date: 2026-09-22
Owner decision: **AUTHORIZED**

## Decision

Authorize the measured literal-form production discriminator mechanism proven in:

`FINDING-LITERAL-NODE-ENV-RESOLVES-BOTH-BLOCKERS-2026-09-22.md`

The implementation MUST use a small dependency-free helper whose production check is based on the literal form:

`process.env.NODE_ENV === "production"`

This helper becomes the canonical production discriminator for the Control Truth paths covered by this task.

## Consistency rule

Do NOT introduce two competing production discriminators.

Migrate the relevant Control Plane / webhook production-truth readers away from `ENV.isProduction` to the new dependency-free helper so that the same production decision is used by:

- Owner Inbox truth paths;
- Agent Activity truth paths;
- Portfolio Gates truth paths;
- Work Queue production truth guards where in task scope;
- agent-events production truth guard where in task scope;
- simulation-only command success / T3-WU03 command path;
- any directly related T3 production-truth reader required to avoid a split discriminator.

Do not broaden this into unrelated environment refactoring.

The implementation must preserve the billing-action import-closure gate without widening its allowlist merely to admit `_core/env.ts` or `_core/runtime-env.ts`.

## Required proof before accepting the change

Hermes must dispatch implementation/testing through `hermes-native-swarm` and keep `wstera-control-sync` loaded and active according to its contract.

Required evidence:

1. dry-run Worker bundle proves literal `process.env.NODE_ENV` is build-time replaced;
2. no runtime `NODE_ENV` Worker binding is required for this mechanism;
3. production truth paths above resolve through the same canonical helper;
4. no reachable production demo/simulation success path remains through an inert discriminator;
5. billing-action dependency-closure test remains PASS without widening the allowlist for `_core/env.ts` / `_core/runtime-env.ts`;
6. deterministic tests + typecheck + `git diff --check` PASS;
7. regression checks prove development/test behavior is preserved where explicitly intended;
8. exact changed files and hashes are bound to the reviewed revision.

The previous WU02D verdict may be carried forward without replay only where Hermes proves the verified router bytes and invariants remain unchanged at the target revision.

## Resume authorization

Resume:

`T3-WU03 -> T3-WU04 -> T3-WU05 -> T4 -> T5 -> R2`

Routine technical sub-units may continue automatically under the existing LONG_RUN manifest.

Codex remains the independent reviewer at the required revision-bound checkpoint. Claude remains difficult-remediation only under the existing escalation policy.

## Control Sync truth requirement

Current report records one Control Sync dead-letter item. It must remain visible and be classified/reconciled before any gate that claims Control Sync delivery health. Do not hide, delete, or reinterpret it as PASS without evidence.

## Authority boundary

This decision authorizes **source implementation + tests + evidence + exact revision commit/push only**.

It does NOT authorize:

- live DB migration apply;
- production deployment;
- Cloudflare production variable mutation;
- runtime-skill production activation beyond already-authorized local/test verification;
- merge of Draft PR #2;
- any production mutation.

No new `NODE_ENV` Worker binding is required or authorized by this decision.

After R2, STOP at:

`OWNER_HOLD_PRODUCTION_MUTATION`

Present exact approved revisions, migration/deploy coupling, rollback/forward-fix plan, Control Sync delivery state, and live-proof plan before any production action.

Do not claim `PRODUCTION_READY` or `OPERATED_STABLE`.
