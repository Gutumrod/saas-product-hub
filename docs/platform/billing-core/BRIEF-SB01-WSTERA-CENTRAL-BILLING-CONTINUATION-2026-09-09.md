# BRIEF — SB01 WSTERA Central Billing Continuation

**Date:** 2026-09-09 (Asia/Bangkok)
**Mode:** WSTERA HOUSE / SB01 CENTRAL BILLING CORE / PHASE 2 CONTINUATION
**Goal:** Make SB01 a production-grade internal Central Billing Core for WSTERA Products without productizing it externally yet.

## Owner direction

Continue the existing Central Billing Core; do not restart or redesign from scratch.

The canonical model is one shared Billing Core + versioned Product Billing Profiles. Control Plane is a read-only consumer. BK01 is a compatibility/parity source and future extraction target, not a permanent competing billing architecture.

Security and money correctness outrank speed. Green unit tests alone are not enough for PASS.

## Canonical repositories

House governance/source-of-truth:
`Gutumrod/saas-product-hub`

SB01 runtime implementation:
`Gutumrod/stripe-billing`

SB01 execution branch:
`feature/central-billing-phase2-runtime`

Verified SB01 checkpoint at handoff:
`4441645991f30f73a4f103f48af29b686a5890c5`
## Verified current SB01 state

`platform/runtime/` is committed in checkpoint `4441645` with the Phase 2 runtime foundation.

Verified commands on Windows at handoff:
- `npm ci --ignore-scripts` → PASS / 0 vulnerabilities
- `npm run build` → FAIL with exactly 3 TypeScript errors
- `npm run typecheck` → FAIL with the same 3 errors

Current compile blockers:
1. `platform/runtime/src/db.ts:131` — `Record<string, unknown>` is not assignable to postgres `JSONValue`.
2. `platform/runtime/src/db.ts:258` — same JSON typing defect.
3. `platform/runtime/src/runtime.ts:239` — `providerCustomerId` remains `string | null` after the code path that should establish readiness.

Do not hide these with unsafe casts. Prove the invariant or normalize data into a valid JSON type.

SB01 repo has pre-existing untracked `docs/` content. Do not sweep, delete, reset, stash, or include it in Phase 2 commits unless a separately scoped documentation task explicitly authorizes those exact files.

## Existing runtime foundation to preserve

The current runtime already contains:
- account assertion binding to Product/account/action/environment/operation/expiry
- exact Product Billing Profile resolution
- Test-only admission for `pending_validation` profiles
- Stripe Test adapter that refuses non-test credentials
- server-side Stripe Product/Price authority
- server-owned return URLs and metadata
- operation fingerprint/idempotency model
- provider customer reservation/recovery
- raw-body webhook signature verification
- durable provider-event claim + outbox design
- worker retry/lease/dead-letter model
- provider re-fetch reconciliation path
- signed entitlement-transition envelope + deterministic Test sink
## Control Plane contract — must be incorporated, not duplicated

Control Plane already defines a fail-closed Billing Core consumer contract at:
`Gutumrod/hub-web/server/control-plane/adapters/billing-core-adapter.ts`

SB01 must treat this as a downstream read-contract requirement when designing its authoritative read surface.

The Core read model must eventually support enough authoritative data for Control to project:
- Product ID/code and account ID
- subscription reference, plan and profile version
- subscription lifecycle status
- amount/currency
- current period end / cancel-at-period-end
- provider-updated timestamp
- payment reference/status/amount/currency/occurred-at/provider reference
- environment / connection / degraded-read state

Do not move billing logic into Control Plane. Control remains `canExecutePaymentActions: false` until a later separately reviewed mutation contract exists.

Do not force SB01 database internals to mirror Control DTO names. Provide an explicit mapping/projection boundary instead.

## BK01 compatibility target

Use BK01 as a capability baseline, not as source code to copy wholesale.

Capabilities the shared Core must meet or exceed include:
- server-resolved Checkout Price mapping
- authenticated Customer Portal
- raw Stripe webhook signature verification
- idempotent event claim/journal
- provider re-fetch for material subscription truth
- out-of-order protection
- trial/active/past_due/cancel lifecycle handling
- atomic handoff into Product-owned entitlement state

BK01 migration remains Compatibility-First Extraction: preserve → register profile → facade → shadow/parity → capability-by-capability extraction → retire duplicated plumbing only after evidence.
## Known profile/evidence state

Current canonical profile states:
- PS01 `pending_validation`
- LK01 `pending_validation`
- BK01 `compatibility_hold`
- WS01/DC01/MT01/CM01 `draft`

Evidence already earned and not to be repeated without reason:
- Profile Registry + deterministic multi-profile tests `16/16 PASS`
- PS01/LK01 same-account cross-Product isolation PASS
- cross-Product spoof fail-closed
- Stripe Test mixed PS01/LK01 provider lifecycle PASS
- subscribe/cancel/re-subscribe/selective-cancel/provider-refetch/cleanup PASS

These results do not activate profiles. Remaining runtime gates are still mandatory.

## Execution order

### Phase 2A — restore compile clean
1. Fix only the 3 verified TypeScript defects first.
2. Run `npm run build`.
3. Run `npm run typecheck`.
4. Run the relevant runtime/profile tests.
5. Review exact diff before expanding scope.

STOP if compile repair exposes an architecture contradiction rather than a local type/invariant defect.

### Phase 2B — runtime DB contract
1. Derive forward migration `0002` from actual runtime DB calls and Council contracts.
2. Review constraints/indexes/authority boundaries statically.
3. Use WSTERA LAB only; no production DB.
4. Prove coexistence with existing shared-runtime schemas and no unauthorized cross-product reach.
5. Capture catalog/migration evidence and cleanup/recovery procedure.
### Phase 2C — HTTP + Stripe Test vertical slice
1. Start the Core HTTP boundary from SB01.
2. Exercise valid PS01 Test checkout through the Core API, not a direct provider shortcut.
3. Persist and verify operation/customer/provider mappings in WSTERA LAB.
4. Directly re-fetch the Stripe Test object as financial truth.
5. Verify caller cannot override Product, environment, Price ID, amount, currency, provider customer or return URLs.
6. No live keys, live charges or production deployment.

### Phase 2D — webhook durability + reconciliation
1. Send a real Stripe Test-signed webhook through the Core webhook route.
2. Prove raw-body signature validation.
3. Prove durable event claim/outbox before success response.
4. Replay duplicates and prove no double transition.
5. Exercise retry/lease/dead-letter paths.
6. Exercise out-of-order/ambiguous events and require provider re-fetch.
7. Prove scheduled reconciliation repairs a missing-webhook scenario.

### Phase 2E — entitlement + multi-Product isolation
1. Exercise the signed deterministic Test entitlement sink.
2. Prove idempotent replay and monotonic transition versioning.
3. Exercise PS01 + LK01 through the actual runtime path, not registry-only tests.
4. Prove identical account text across Products cannot cross customer/subscription/outbox/entitlement state.
5. Keep Product-owned business entitlement semantics outside the Core.

### Phase 2F — Control read-contract projection
After Core runtime truth is proven, define an explicit read-only authoritative projection/transport contract for Control Plane.

Do not wire payment mutation into Control. Do not let Control become a second source of billing truth.
## Mandatory negative-authority matrix

Through the real HTTP/runtime boundary, fail closed for attempts to spoof or override at least:
- Product ID/code
- environment
- account identity / invalid account assertion
- Stripe Product/Price mapping
- amount
- currency
- Stripe Customer ID
- arbitrary success/cancel/portal return URL
- profile version
- cross-Product credential use
- replayed/expired operation authority

For every denied request, prove there is no provider object creation and no durable billing side effect.

## PASS criteria

Do not mark Central Billing Phase 2 PASS unless evidence proves all of:
- runtime build/typecheck/tests PASS
- LAB migrations and catalog verification PASS
- HTTP Core boundary exercised
- real Stripe Test Checkout through SB01
- webhook durability before success response
- duplicate/out-of-order behavior correct
- provider re-fetch used as financial truth
- reconciliation repair including missing-webhook case
- signed/idempotent/monotonic entitlement Test proof
- PS01/LK01 runtime isolation and negative authority proof
- Control read-contract projection defined from Core truth
- cleanup/rollback evidence recorded
- no live/production mutation

Green tests without runtime/provider/DB evidence are not sufficient.
## Scope locks

Do not expand this Phase 2 continuation into:
- external SB01 productization
- public developer API/SDK/meters/tenant onboarding for third parties
- MT01 billing integration
- BK01 live migration/extraction
- PromptPay recurring billing
- live Stripe keys or live charges
- production deploy
- Product-owned business entitlement rewrites
- Control Plane payment mutation
- Council reopening unless source/runtime evidence proves a genuine architecture contradiction

SB01 may later become a sellable Product, but current implementation decisions must first prove the internal WSTERA multi-Product use case cleanly.

## Git / evidence discipline

- Work only on the SB01 continuation branch/worktree.
- Do not reset/stash/clean pre-existing unrelated files.
- Stage intended files explicitly.
- Keep House governance/doc commits separate from SB01 runtime commits.
- No secret values in Git, command arguments, evidence or logs.
- Before each checkpoint: tests/build, `git diff --check`, staged diff review, branch parity.
- Push every accepted checkpoint before changing machines.

## Canonical documents to read before implementation

1. `docs/platform/billing-core/CANONICAL-BILLING-SYSTEM-MAP-2026-09-09.md`
2. `docs/platform/billing-core/BRIEF-CENTRAL-BILLING-CORE-PHASE2-CONTINUATION-2026-09-08.md`
3. `docs/council-billing-core-multiproduct-2026-09-07/02-architecture-risk/ARCHITECTURE.md`
4. `docs/council-billing-core-multiproduct-2026-09-07/02-architecture-risk/PRODUCT-BILLING-PROFILE-CONTRACT.md`
5. `docs/council-billing-core-multiproduct-2026-09-07/OWNER-ADDENDUM-BK01-COMPATIBILITY-FIRST-EXTRACTION-2026-09-08.md`
6. `docs/platform/billing-core/MULTI-PROFILE-CONCURRENCY-EVIDENCE-2026-09-08.md`
7. `docs/platform/billing-core/STRIPE-TEST-PROVIDER-MATRIX-EVIDENCE-2026-09-08.md`
8. Control consumer source: `Gutumrod/hub-web/server/control-plane/adapters/billing-core-adapter.ts`
## Immediate next action

Start with Phase 2A only: inspect the three compile defects against the actual code paths at SB01 commit `4441645`, repair them without unsafe casts or scope expansion, then rerun build/typecheck/tests and checkpoint the result.

Only after Phase 2A is clean should the executor derive/verify the Phase 2 DB migration and proceed through the runtime gates in order.

## Return status for the first implementation checkpoint

Return evidence-backed state as one of:
- `SB01 PHASE 2A COMPILE CLEAN / READY FOR DB-CONTRACT REVIEW`
- `SB01 PHASE 2A REMEDIATE`
- `SB01 ARCHITECTURE CONTRADICTION — HOUSE REVIEW REQUIRED`

Do not claim Central Billing Core PASS from the compile checkpoint.
