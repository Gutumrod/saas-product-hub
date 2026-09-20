# B4 REVIEW CLOSURE — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Review Batch: **B4 — Financial Read Boundary**
Stage: T4 (consume accepted SB01 LR-2F projection in Control)
Reviewer: `agent-codex` (independent)
Recorded: 2026-09-20 (Asia/Bangkok)
**Verdict: `BATCH_APPROVED`** on hub-web `381fef3f639f1b6da225c217ce6ddd3e0f29cd61`

## Verdict history

| Round | Verdict | Revision | Findings |
|---|---|---|---|
| B4 R1 | `WORKER_FIX` | `32daeea` | 4 blocking (parser fail-closed, unconfigured empty success, **no production consumer**, duplicate secret) + 1 non-blocking |
| B4 R2 | `WORKER_FIX` | `93fedeb` | 2 blocking (response identity unverified; payments discarded + readiness/freshness unvalidated) |
| B4 R3 | `WORKER_FIX` | `390ad0f` | 1 blocking code (`paymentDataState` not literal) + 1 blocking **document** (Hermes's stale closure) |
| B4 R4 | `WORKER_FIX` | `381fef3` | code clean; 1 blocking **document** (Hermes's correction paragraph itself wrong) |
| B4 R5 | **`BATCH_APPROVED`** | `381fef3` | **0 blocking**, 1 non-blocking (test execution not locally re-confirmable) |

## R5 verification — the reviewer checked the document against the repository

| Revision | Claim | Verified |
|---|---|---|
| `32daeea` (initial) | 4 files, +993/-5 | **match** |
| `93fedeb` | 7 files, +303/-46 | **match** |
| `390ad0f` | 3 files, +245/-26 | **match** |
| `381fef3` (current) | 2 files, +38/-7 | **match** |

Also confirmed: HEAD/worktree unchanged from R4 (`git diff 381fef3` empty, worktree clean); the document
now consistently binds delivery, change set, gate counts and review to `381fef3`; historical four-file
figures are explicitly labelled as the initial delivery; gate claims (23 files / 347 tests; pre-T4
baseline 21/277) match the recorded run. **R4's code findings remain closed because the reviewed code is
byte-for-byte unchanged.**

`UNSUPPORTED CLAIMS: none.`

## What T4 actually delivered (approved state)

`Gutumrod/hub-web` `381fef3`, branch `work/house-platform-closure-20260919`:

- `server/control-plane/adapters/billing-core-transport.ts` — GET-only transport for
  `/v1/billing/control/snapshot`, account-scoped addressing, HMAC account assertion bound to product +
  environment + account + operation_id + action, per-product credentials from the runtime-env seam,
  `productCode -> productId` resolved Control-side, `providerStatus` mapping with unknown values
  rejected, **unconditional** response identity verification against the configured authority, literal
  `paymentDataState`, non-empty payments rejected rather than coerced, mandatory readiness/freshness
  validated against the binding contract, all failure modes distinguishable and fail-closed visibly
- `server/control-plane/billing-core-snapshot-router.ts` — the **real production consumer**, exposed as
  `controlPlane.billingCoreSnapshot.get` and wired into `server/routers.ts`, returning a stable
  `{ readiness, snapshot, error }` view so degraded/unconfigured state is observable
- `server/control-plane/adapters/billing-core-adapter.ts` — `getBillingCoreAdapter()` returns the
  transport-backed adapter only when valid config is present, otherwise the unconfigured adapter
- `server/_core/env.ts` — two runtime-config getters
- Tests: 23 files / 347 tests passing

Invariants held throughout: `canExecutePaymentActions` literal `false` on every path including
readiness and error paths; no provider SDK; no Checkout/Portal creation; no payment/subscription/
customer mutation; no entitlement write; no local authoritative billing state; no product-wide
enumeration; no secret in any URL, error message, readiness reason or log.

## Untested areas carried to T5 (permanent / live items)

- Full vitest execution inside the reviewer sandbox (`spawn EPERM` — six consecutive occurrences).
- **Live SB01 HTTP integration** — the transport has not been exercised against a running Billing Core.
- Live credential/environment mismatch behaviour.
- Live readiness behaviour under dependency failures.
- Live PostgreSQL behaviour (also carried from T3).

## Process corrections kept on the record

**Two closure-document defects, both Hermes's, in two consecutive rounds.** The first recorded a stale
revision and change set; the second correction paragraph then itself named the wrong revision and the
wrong file count. The reviewer caught both. The fix that finally held was to derive every figure with
`git show --stat` before writing it, and to carry an explicit per-revision change-set table.

This is the third time in this task that an orchestrator-side artifact (packet wording, dispatch mode,
closure document) was the defect rather than the worker — recorded rather than smoothed over.

## Transition

`B4 BATCH_APPROVED` -> **T5 (production readiness / controlled apply / deploy / live proof) READY.**

T5 is the only stage in this task that performs real production mutation. It requires the exact
candidate to be frozen, a Production Readiness Record, G1-G10 evidence, a B5 pre-deploy independent
review, verified build-time environment delivery without printing secrets, and a recorded rollback
target — all before any live mutation, per the Run Manifest.
