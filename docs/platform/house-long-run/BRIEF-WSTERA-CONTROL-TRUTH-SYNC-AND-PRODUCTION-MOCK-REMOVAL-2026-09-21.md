# BRIEF — WSTERA Control Truth Sync + Production Mock Removal

Task ID: `WSTERA-CONTROL-TRUTH-SYNC-001`
Workflow: `WF-DEV-01 v1.3.0 / LONG_RUN`
Status: **LOCKED FOR HERMES EXECUTION PREP — IMPLEMENTATION NOT STARTED**
Date: 2026-09-21 (Asia/Bangkok)
Owner authority: create/commit/push this planning package only; no implementation or production mutation is authorized by this document alone.

## 1. Problem

WSTERA Control cannot yet represent House/Platform/infrastructure work truth without fabricating a Product identity, while production Control still contains reachable demo/simulation paths that can present fabricated state. Owner Inbox also records decisions in Control DB but no verified reverse path exists for Hermes to consume the decision and continue a run.

This task must make `platform.wstera.com` an Owner-visible projection of validated plan/work/activity truth without redesigning the Control Plane.

## 2. Verified baseline

### Canonical House repository
- Repo: `Gutumrod/saas-product-hub`.
- Source worktree inspected: `D:\AI-Workspace\projects\saas-product-hub`.
- Branch: `work/house-production-closure-longrun-20260919`.
- Current HEAD: `13a2d55b509d15ee5b6375562b029c0dc98dce49`.
- Origin parity after fetch: `0 ahead / 0 behind`.
- Worktree is not fully clean: three pre-existing untracked files under `docs/platform/shared-runtime/`; they belong to another workstream and MUST NOT be changed, added, deleted, reset, cleaned or rebased by this task.
- Planning worktree for this task: `D:\AI-Workspace\runtime\worktrees\wstera-control-truth-sync-001`.
- Planning branch: `work/wstera-control-truth-sync-001`, based exactly on `13a2d55`.

### House closure evidence
- `WSTERA-HOUSE-PRODUCTION-CLOSURE-001` is CLOSED with closure line `HOUSE FOUNDATION CLOSED`.
- Supported claims remain bounded to `BUILD_PASS` and `LIVE_PROVEN` for code-only scope.
- `PRODUCTION_READY` and `OPERATED_STABLE` remain NOT CLAIMED.
- Canonical evidence read: `OWNER-FINAL-ACCEPTANCE-CLOSURE-2026-09-21.md`, `B6-FINAL-REVIEW-REPORT-CODEX-2026-09-21-r2.md`, `T6-WU03-FINAL-EVIDENCE-PACKET-2026-09-21.md`, and `docs/CURRENT_STATUS.md`.

### hub-web repository and production
- Repo: `Gutumrod/hub-web`.
- Worktree: `D:\AI-Workspace\projects\saas-product-hub\apps\hub-web`.
- Branch: `work/house-platform-closure-20260919`.
- HEAD: `407130718646d13630b9789f68522a521fc74483`.
- Origin parity: `0 ahead / 0 behind`; worktree clean.
- Draft PR #2 verified live: OPEN + DRAFT, head `4071307`, base `main@8a3e49330e6cc1d52d6ad3d96fd0d291a66b4f56`; MUST NOT be auto-merged.
- Current Cloudflare Worker deployment verified by Wrangler: `5dc81232-c116-4722-a6c1-74c15ad50385`.
- `https://platform.wstera.com/` returns HTTP 200.
- `system.health` tRPC route returns HTTP 200 with valid input.

### Runtime skills
- Hermes Agent: `v0.21.2 (2026.9.11)`; both required skills are discovered and enabled.
- `hermes-native-swarm` version `0.1.1`; installed SKILL SHA256 `42FE28754A67AB26153A41151E412BA0BEC3822019B991EBDBEAD8DB9ECE3A91`.
- Swarm test suite: 260 run, 259 PASS, 1 skipped, 0 failures/errors.
- `wstera-control-sync` version `0.1.0`; installed SKILL SHA256 `E1D239032C837C93DCCF74F61685383C6972AFA689DDCEE771125254AB438630`.
- Control Sync source: `Gutumrod/wstera-workflows`, branch `task/WSTERA-CONTROL-SYNC-001`, HEAD `e711b94835525def94757e9ec3b4ec5bda615308`, origin parity 0/0, clean.
- Installed `SKILL.md`, `EVENT-CONTRACT.md`, and `control_sync.py` are byte-identical to that source worktree.
- Control Sync tests: 7/7 PASS.
- Canonical policy is repository-level `policies/CONTROL-SYNC-POLICY.md`; it is not packaged inside the installed skill tree.
- Effective Hermes-loaded environment verified with the same Hermes env loader used by the CLI: endpoint_configured=true, endpoint_https=true, secret configured from canonical secret source, secret_value_exposed=false. The earlier direct-shell doctor result was non-authoritative because that shell bypassed Hermes .env loading.
- Mac skill parity remains UNVERIFIED for this task. This does not block the Windows-only run.

## 3. Verified gaps

### GAP-A — non-product work identity is rejected
The table schema permits nullable `product_code`/`product_id`, but current API normalization and RPC treat every task projection as Product-scoped:
- `server/control-plane/work-event-schema.ts` resolves missing Product code to `identityState = unresolved`.
- `server/webhooks/agentEvents.ts` rejects any normalized task whose identity state is not `canonical`.
- migration `0006_canonical_product_id_work_truth.sql` rejects any task projection without canonical `productCode + productId`.

Result: House/Platform/workflow/shared-runtime work cannot enter Work Queue truthfully. Fake Product codes are forbidden.

### GAP-B — production mock/demo reachability remains
Verified production-reachable paths include:
- `server/control-plane/service.ts` defaults to `new DemoControlPlaneRepository()`; `server/routers.ts` exposes Overview, Customers, Billing, Operations and command paths through this singleton.
- `CommandService` constructs `DemoCommandExecutor`.
- Owner Inbox returns demo items/simulation success when Control DB is absent and demo fallback on DB errors.
- Agent Activity and Portfolio Gates return `simulation` / `demo_fallback` modes on missing/error paths.
- `PlatformControlPlane.tsx` defaults missing query mode to `simulation`.
- Work Queue is already stricter in production: missing/error DB returns empty + `degraded`; this behavior is the model to preserve.
- Test fixtures may remain only when unreachable from production runtime and impossible to present as live truth.

### GAP-C — Owner decision round-trip is incomplete
Current Owner Inbox `decide` writes `status=decided`, `selected_option`, `decision_note`, and timestamps to Control DB. No verified command/API exists in `wstera-control-sync` for Hermes to poll/consume/acknowledge those decisions. A DB-only button is therefore not yet run control.

### GAP-D — direct-shell environment probe mismatch — RESOLVED
A direct PowerShell invocation initially reported endpoint_configured=false because it did not load Hermes .env. Re-running through the actual Hermes environment loader proved the canonical endpoint is already configured and HTTPS-valid. T0 must still re-run doctor through the Hermes-loaded environment before live sync, but no endpoint provisioning blocker remains on Windows.

## 4. Locked truth architecture

```text
Run Manifest + Task = PLAN TRUTH
Hermes = WORK TRUTH / CURRENT STATE
Swarm workers + reviewers = ACTIVITY + EVIDENCE TRUTH
platform.wstera.com = OWNER-VISIBLE PROJECTION
```

Only Hermes may promote canonical task state after required evidence/gates. Worker self-report, including a claimed PASS, is untrusted input.

## 5. Locked work-scope contract

Do not overload Product identity to represent House/Platform work.

Introduce an explicit work-scope identity in the event/normalized/RPC/storage path:
- `scopeType`: one of `product | house | platform | workflow_infrastructure | shared_runtime`.
- `scopeKey`: stable non-secret identifier for non-product scope; Product scope may derive/use the canonical Product identity.
- Product-scoped work MUST retain canonical immutable `productCode + productId` and fail closed on unknown/conflicting identity.
- Non-product scope MUST carry no Product code/id and MUST carry an explicit non-product `scopeType + scopeKey`.
- Missing Product identity without explicit non-product scope remains ambiguous and MUST fail closed.
- Backward compatibility: existing canonical Product events may remain valid without forcing a breaking sender migration, but no new ambiguous unscoped task may be accepted.
- Persist scope additively; do not repurpose `product_code`.
- Preserve event idempotency, exact revision N→N+1, atomic ingestion, Owner Inbox effect identity, HMAC verification, and existing Product identity immutability.

Implementation may refine column/field names only if the same semantics and acceptance contract are preserved and the change is revision-bound in review.

## 6. Locked Owner decision return architecture

Use a server-mediated, audited return path. Hermes MUST NOT receive direct Control DB owner/service-role credentials.

Smallest production-safe target:
1. Owner decides in the existing authenticated Owner Inbox UI.
2. Control DB stores the immutable decision result linked to the Work Queue item/task.
3. A bounded agent-only decision poll endpoint returns decided, unconsumed decisions for the requesting canonical task/root task.
4. Hermes `wstera-control-sync` adds decision poll/consume support with a durable local cursor/ledger.
5. Hermes validates the decision against the locked Run Manifest/allowed Owner checkpoint, persists decision evidence locally, then advances canonical state.
6. Hermes acknowledges consumption only after local persistence; Control records consumption metadata without erasing the original decision.
7. Poll/ack authentication must be agent-only and domain-separated from browser auth. Reuse of the existing HMAC secret is allowed only with endpoint-specific/domain-separated signing so an agent-events signature cannot be replayed against the decision endpoint.
8. No direct database credential is introduced into Hermes.

## 7. Objectives

1. Accept House/Platform/infrastructure/shared-runtime Work Queue truth without fake Product codes.
2. Keep Product-scoped identity and all existing integrity guards fail-closed.
3. Remove production demo/mock substitution and simulation-success paths while retaining test-only fixtures.
4. Make Owner Inbox a real round-trip control surface for governed runs.
5. Integrate `wstera-control-sync` into Hermes material transitions only.
6. Prove live Owner-visible truth on `platform.wstera.com`.

## 8. Non-goals / prohibited scope

- No Product feature development.
- No payment mutation, billing-provider mutation, Stripe live mutation, synthetic payment action, or banking action.
- No destructive DB operation, `db:push`, mass refactor, or weakening of RLS.
- No owner/service-role DB credential in Hermes, repo, logs or evidence.
- No secret values in command arguments, source, logs or evidence.
- No Draft PR #2 merge unless separately authorized by Owner.
- No Agent Relay as ordinary execution path.
- No paid dependency without Owner authority.
- No production mutation before the explicit Owner production checkpoint.

## 9. Execution engine and role boundaries

Hermes = Long-Run Orchestrator / Coordinator / State Holder only. It may hold state, materialize bounded packets, dispatch, run deterministic checks, persist evidence, and sync validated state. It MUST NOT implement/patch substantive output.

Ordinary execution uses `hermes-native-swarm v0.1.1`:
- `swarm-inspector`: read-only reconciliation / dependency closure / forensics.
- `swarm-builder`: bounded source/config implementation.
- `swarm-tester`: tests/lint/typecheck/build/regression.
- `swarm-db`: SQL/migration/schema qualification only; no live mutation.
- `swarm-release`: release preflight/post-release verification; live mutation still requires explicit Owner authority and a permitted release procedure.
- `swarm-evidence`: evidence normalization/checkpoint packet.

Codex is used only for independent review at important revision-bound gates defined in the manifest, not every Work Unit. Claude is difficult remediation only under the active escalation policy: two bounded ordinary repair attempts for the same Issue Fingerprint, then Codex classification; Claude only when Codex returns the authorized difficult-remediation route.

## 10. Acceptance criteria

### Control truth
- House/Platform task enters Work Queue with explicit non-product scope and null Product identity.
- Product work still rejects missing/unknown/conflicting Product identity.
- revision conflict, event ID payload conflict and concurrency conflict remain fail-closed.
- Owner hold creates exactly one Owner Inbox effect per source event.
- Hermes is the only canonical work-state promoter.
- worker/reviewer activity cannot self-promote task state.

### Production truth
- Production runtime has no path that substitutes demo customers, billing, operations, Work Queue, Owner Inbox or Agent Activity as live state.
- No DB/data => EMPTY / NOT CONNECTED / DEGRADED; backend error => DEGRADED/UNAVAILABLE; authority stop => BLOCKED.
- Production UI never defaults an unknown/missing mode to `simulation`.
- Test fixtures may remain only outside production dependency closure.
- Simulation-only commands are disabled/unavailable in production rather than returning fake success.

### Owner decision round-trip
- A real Owner decision can be created, read by Hermes through the approved agent path, revision/evidence bound, consumed exactly once logically, and acknowledged without direct DB credentials.
- Replayed/tampered decision messages fail closed.
- Hermes cannot accept a decision for the wrong task/root task or an option not allowed by the locked checkpoint.

### Runtime/live
- `hermes-native-swarm` and `wstera-control-sync` are actually invoked and evidence identifies task/revision/state.
- Control Sync endpoint configuration passes doctor before live sync.
- secret scanner clean; no credential printed.
- build/typecheck/tests and relevant migration qualification pass.
- live `platform.wstera.com` proof distinguishes LIVE / EMPTY / DEGRADED / BLOCKED.
- Draft PR #2 remains unmerged unless Owner separately authorizes merge.

## 11. Security gates

- Preserve exact-body HMAC contract for `/api/webhooks/agent-events`.
- Decision return path uses agent-only domain-separated authentication; browser session cannot impersonate Hermes and Hermes credential cannot be used as Owner UI authority.
- Additive migration only; qualify SQL with `swarm-db`; live application only after independent review + Owner authority.
- Preserve RLS and least-privilege runtime DB identity.
- Never expose secret material in test snapshots/evidence.
- Fail closed on ambiguous scope, stale/skipped revision, event payload conflict, cross-task decision, unsupported decision option, unavailable datastore, and unavailable reviewer at mandatory checkpoint.

## 12. Live deployment / rollback boundary

No deployment is authorized by this planning commit. Before production mutation:
- Codex must independently review the exact candidate revision and migration/rollback evidence.
- Owner must explicitly authorize the production migration/deploy checkpoint.
- Release procedure must prove the selected executor is allowed to perform the mutation; otherwise STOP for Owner/operator action.
- Record current Worker version before mutation.
- Rollback must identify the prior Worker version and DB rollback/forward-fix strategy; irreversible rollback assumptions are forbidden.

## 13. Stop conditions

STOP/HOLD on any of:
- canonical repo/ref mismatch or unknown dirty work;
- Control Sync endpoint still unconfigured at the first live-sync boundary;
- Mac execution requested while Mac parity remains unverified;
- contract change outside the locked scope identity/decision-return architecture;
- need to weaken Product identity, revision, HMAC, atomicity, RLS or Owner Inbox semantics;
- payment/billing live mutation;
- destructive migration or `db:push`;
- production mutation without Owner authority;
- reviewer independence failure;
- secret exposure;
- production path still capable of demo substitution at release gate.

## 14. Source of Truth for execution

Hermes must read, in order:
1. `TASK-WSTERA-CONTROL-TRUTH-SYNC-001.md`
2. `RUN-MANIFEST-WSTERA-CONTROL-TRUTH-SYNC-001.md`
3. this Brief
4. House closure/current-status evidence named in §2
5. installed `hermes-native-swarm/SKILL.md` + invocation contract
6. installed `wstera-control-sync/SKILL.md` + `references/EVENT-CONTRACT.md`
7. source `Gutumrod/wstera-workflows@e711b94` `policies/CONTROL-SYNC-POLICY.md`
8. actual hub-web source at the exact target revision before each batch.

If reality conflicts with this document, STOP, record the drift, and route to the applicable review/Owner boundary.
