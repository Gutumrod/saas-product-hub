# T4 DEPENDENCY ENTRY GATE — SB01 LR-2F ACCEPTANCE VERIFICATION

Stage: T4 — SB01 LR-2F JOIN + CONTROL READ PROJECTION
Gate required by: Run Manifest T4 "Dependency Entry Gate"
Recorded: 2026-09-20 (Asia/Bangkok)
Orchestrator: Hermes
Verdict: **DEPENDENCY SATISFIED — T4 RELEASED**

## Required items (Run Manifest T4) — each verified

| Required | Verified | Evidence |
|---|---|---|
| exact LR-2F material SHA | ✅ | `96abe085004f61a029d2519615ec8aa575384b89` — confirmed present as a real object in `Gutumrod/stripe-billing` |
| exact independent review verdict/evidence | ✅ | Codex final closure `R3 = PASS`, `BLOCKERS = 0`, `DEFECTS = 0`; verdict artifact `D:\AI-Workspace\runtime\reviews\sb01-lr2fa-native-swarm\CODEX-LR2FA-CLOSURE-VERDICT-R3.txt`; per-check PASS list includes build exit 0, typecheck exit 0, control-read suite 25/25, negative-authority suite 19/19, SQLSTATE mismatches 0, unknown-product branch reached, `git diff --check` clean |
| exact accepted projection schema/transport/auth/failure contract | ✅ | `docs/platform/billing-core/HANDOFF-SB01-LR2FA-CLOSED-HOUSE-T4-INTEGRATION-2026-09-20.md` @ branch head; contract detail in `evidence/STAGE-B-READ-CONTRACT.md`, `LR2FA-REVIEW-PACKAGE.md`, and `platform/runtime/tests/control-read-projection.test.mjs` (39 test cases) |
| House/Owner acceptance state required by the SB01 task | ✅ | Owner/Sol disposition recorded in the handoff: `LR-2F-A = ACCEPTED / CLOSED / PASS`; `LR-2F-B separate SB01 implementation lane = DO NOT START`; `House T4 = integration owner`; `Production activation = NOT AUTHORIZED` |
| no unresolved LR-2F blocker | ✅ | `R3 = PASS / BLOCKERS = 0 / DEFECTS = 0`; the handoff lists **disclosed limitations** (accepted, not blockers) that T5 must disposition |

**Result: the dependency is satisfied. `T4 DEPENDENCY_WAIT` is released.**

## The accepted contract, as it applies to T4

- **Endpoint:** `GET /v1/billing/control/snapshot`
- **Addressing:** `product + environment + explicit accountId -> account-scoped billing snapshot`.
  **Product-wide enumeration is not authorized.**
- **Authorization:** a dedicated `control_read` scope plus an account assertion bound to product,
  environment, account, `operation_id` and action. A caller-addressed `accountId` that disagrees with
  the assertion is refused (`403 ACCOUNT_ASSERTION_MISMATCH`).
- **SB01 remains `productId` native**; Control must resolve `productCode -> productId` on its side.
- **Authority direction is one-way:** `Control -> SB01 approved read projection -> SB01/provider truth`.
  Never `Control -> Stripe/provider directly`, never a billing DB mutation, never payment execution.
- `validateSnapshot` on the Control side **rejects, never repairs**: `source !== "billing_core"`,
  a disconnected snapshot claiming `test`/`live`, a subscription/payment missing
  `accountId`/`planId`/`subscriptionRef` (or `paymentRef`), `productCode`/`productId` disagreeing with
  the canonical registry, a non-non-negative-integer `amountMinor`, or a non-3-uppercase-letter
  currency must all throw `BillingCoreContractError`. On rejection the consumer returns its last known
  state or fail-closed readiness — never a repaired or partially trusted snapshot.

## What Control already has (verified in the hub-web worktree)

`apps/hub-web/server/control-plane/adapters/billing-core-adapter.ts` already implements:

- the contract types (`BillingCoreControlSnapshot`, projections, `BillingCoreTransport`),
- `validateSnapshot` matching the SB01 failure contract above,
- `UnconfiguredBillingCoreAdapter` (fail-closed) and `TransportBackedBillingCoreAdapter`,
- `getBillingCoreAdapter()` which **deliberately returns `UnconfiguredBillingCoreAdapter`**, with the
  in-code comment: *"Concrete network transport is intentionally not wired until Billing Core exposes
  the approved Control read contract."*

That condition is now met. T4's work is therefore bounded and concrete: implement the transport for
`GET /v1/billing/control/snapshot`, resolve `productCode -> productId` on the Control side, map raw
`providerStatus` into Control's display vocabulary, handle total SB01 unavailability, and prove the
prohibited mutation/provider/payment paths remain impossible — **not** a redesign of any of it.

## Contract invalidation rule (binding on this release)

If any material change occurs to the accepted SB01 projection schema, transport semantics,
authorization contract, failure semantics or authority boundary, this acceptance is invalidated and T4
must re-verify. A documentation-only handoff commit after `96abe085…` does not change the accepted
implementation revision.

## Disclosed limitations carried into T5 (must be dispositioned, not dropped)

- some DB qualification evidence carries older revision provenance;
- some real-Postgres suites were not part of the final revision-bound independent run;
- migration ledger provenance for `0002_multi_product_billing_runtime` is absent;
- a dead `UNKNOWN_PRODUCT` branch/comment remains cosmetic;
- the Control repository advanced independently during SB01 work.

## Concurrent-writer check (required before T4 edits)

The SB01 handoff explicitly warns: *"Do not use this handoff to start a second writer against House or
Control while that run is still active."* This T4 run **is** the House LONG_RUN, and its manifest
authorizes T4 as the Control read integration. SB01 states `LR-2F-B separate SB01 implementation lane =
DO NOT START`, and no separate SB01 writer is running. So T4 is the correct owner and there is no
second writer.

## Scope and git-authority note

T4 modifies the **Hub/Control repository (`Gutumrod/hub-web`)**, not a product repository. The standing
rule that only Claude commits in `saas-product-hub` is unaffected. The Owner ruling recorded at
`OWNER-HOLD`/`T0` for this task authorizes Hermes to commit and push for
`WSTERA-HOUSE-PRODUCTION-CLOSURE-001`; `hub-web` is the Control platform repository this task was
explicitly launched to close (Manifest: Hub/Control Repository `Gutumrod/hub-web`, branch
`work/house-platform-closure-20260919`), and Hermes has already been committing T1–T3 there.
