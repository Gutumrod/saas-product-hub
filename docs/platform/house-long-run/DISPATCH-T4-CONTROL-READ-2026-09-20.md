# AGENT DISPATCH — T4 Control read projection (SB01 LR-2F join) — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Stage: T4 — Consume accepted SB01 LR-2F projection in Control
Review Batch: **B4 — Financial Read Boundary**
Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001`
Workflow: `WF-DEV-01 v1.3.0` / LONG_RUN
Workspace (absolute): `D:\AI-Workspace\projects\saas-product-hub`
Repository for source: `Gutumrod/hub-web` branch `work/house-platform-closure-20260919`
Base revision: `33082f8f43eca67754e27d052fbc2318a7a47e81`
Recorded: 2026-09-20

## Dependency: SATISFIED

SB01 LR-2F-A is ACCEPTED / CLOSED / PASS at implementation revision
`96abe085004f61a029d2519615ec8aa575384b89` (Codex final closure `R3 = PASS`, 0 blockers, 0 defects).
Full verification: `docs/platform/house-long-run/T4-DEPENDENCY-ENTRY-GATE-2026-09-20.md`.

Do **not** redesign SB01. Consume the accepted contract only.

## The accepted contract

- **Endpoint:** `GET /v1/billing/control/snapshot`
- **Addressing:** `product + environment + explicit accountId -> account-scoped billing snapshot`.
  **Product-wide enumeration is NOT authorized.**
- **Authorization:** dedicated `control_read` scope plus an account assertion bound to product,
  environment, account, `operation_id` and action. A caller-addressed `accountId` disagreeing with the
  assertion is refused (`403 ACCOUNT_ASSERTION_MISMATCH`).
- **SB01 is `productId` native**; Control resolves `productCode -> productId` on its side.
- **One-way authority:** `Control -> SB01 approved read projection -> SB01/provider truth`.

## Locked invariants (Run Manifest T4)

- `canExecutePaymentActions: false` — unchanged, always
- no Checkout/Portal creation
- no payment/subscription/customer mutation
- no Stripe/provider SDK business logic in Control
- no provider secrets in Control
- no webhook/outbox/reconciliation engine in Control
- no entitlement writes
- no local authoritative billing state
- **missing/degraded projection fails closed visibly**
- displayed money/status state is attributable to the SB01 projection

## Current state in Control (already implemented — verified)

`apps/hub-web/server/control-plane/adapters/billing-core-adapter.ts` contains the contract types, the
`validateSnapshot` rejection contract, `UnconfiguredBillingCoreAdapter` (fail-closed) and
`TransportBackedBillingCoreAdapter`. `getBillingCoreAdapter()` deliberately returns the unconfigured
adapter, with the in-code comment: *"Concrete network transport is intentionally not wired until
Billing Core exposes the approved Control read contract."* That condition is now met.

## Work to deliver

### T4-WU02 — implement the read path

1. **Transport.** Implement a concrete `BillingCoreTransport` that calls
   `GET /v1/billing/control/snapshot` with the account-scoped addressing (product + environment +
   explicit `accountId`). It must send the `control_read` scope and the account assertion
   (product, environment, account, `operation_id`, action). No product-wide enumeration.
2. **Credential/config path.** The per-product `control_read` credential is runtime config — read it
   through the existing runtime-env seam, never hardcode it, never log it, never return it in any
   error body. If the credential is absent, the adapter must remain fail-closed (unconfigured), not
   silently degraded into something that claims readiness.
3. **`productCode -> productId` resolution** on the Control side, using the canonical control-plane
   product registry rather than a local mapping invented here.
4. **`providerStatus` mapping** from the raw SB01 vocabulary into Control's display/status vocabulary.
   Unknown values must fail closed (reject), not be coerced into a plausible-looking status.
5. **Total SB01 unavailability.** Handle connection refusal, timeout, non-2xx, malformed JSON and a
   contract-violating snapshot distinctly, and fail closed *visibly* — a readiness state a caller can
   see, never a silent empty-success.
6. **Wire `getBillingCoreAdapter()`** to return the transport-backed adapter **only when** transport
   config is present; otherwise keep returning the unconfigured adapter. Never fall back to demo
   billing data as live truth.
7. **Rejection is not repair.** `validateSnapshot` must remain strict; on rejection the consumer
   returns its last known state or fail-closed readiness — never a partially trusted snapshot.

### T4-WU03 — proof

Tests must demonstrate:

- read correctness for a well-formed account-scoped snapshot
- wrong/unavailable/degraded projection → fail-closed visibly (each failure mode distinguishable)
- `productCode`/`productId` disagreement → rejected
- unknown `providerStatus` → rejected, not coerced
- identity/money violations → rejected (mirroring the existing adapter tests at
  `billing-core-adapter.test.ts:92-109`)
- **absence of any mutation/provider-secret path**: no Checkout/Portal creation, no
  payment/subscription/customer mutation, no provider SDK import, no entitlement write, no local
  authoritative billing state. Pair any control that could silently vanish with a mutation probe.
- `canExecutePaymentActions` remains `false` on every path, including readiness and error paths.

## Prohibited

- No Stripe/provider SDK, no provider secret, no webhook/outbox/reconciliation engine in Control.
- No entitlement writes and no local authoritative billing state.
- No mutation of `billing_core` / `billing_core_staging`.
- Do not redesign the adapter's contract types or `validateSnapshot` semantics — they already match
  the accepted SB01 contract.
- Do not weaken existing tests. Do not modify `apps/hub-web/server/webhooks/` or the fulfillment
  module.
- No deploy, no live database access, no migration apply.

## Environment facts

- `apps/hub-web` has **no live-database harness** and must not gain one. Use the repo's source/SQL and
  source-contract testing convention (`server/control-plane/work-truth-migration.test.ts`,
  `server/webhooks/installIdempotency.test.ts`), with mutation probes where a control could silently
  vanish.
- **Test files are outside the typecheck gate** (`tsconfig.json` excludes `**/*.test.ts`), so a
  green `tsc` says nothing about the tests. Run `npx vitest run` as the binding evidence.
- Current gates to preserve: `npx tsc --noEmit` exit 0; `npx vitest run` 21 files / **277 tests**
  passing.

## Evidence to report

- files created/changed
- the exact addressing and auth shape sent by the transport, and how the credential is read without
  being echoed
- the `providerStatus` mapping table and what happens on an unknown value
- each failure mode and its observable readiness state
- exact commands and results for `npx tsc --noEmit` and `npx vitest run`
- an explicit statement that no mutation/provider-secret path exists and `canExecutePaymentActions`
  remains false
- an explicit statement that no secret value appears in any file, log or error body
