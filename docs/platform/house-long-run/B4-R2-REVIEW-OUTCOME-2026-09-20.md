# B4 R2 REVIEW OUTCOME — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Review Batch: **B4 — Financial Read Boundary** (re-review)
Stage: T4
Reviewer: `agent-codex` (independent)
Source revision reviewed: hub-web `93fedeb7af5bb49a7f9a208759db515fb5f22b85`
Recorded: 2026-09-20 (Asia/Bangkok)

## Verdict

**`WORKER_FIX`** — 2 blocking, 0 non-blocking.

## What the reviewer confirmed as PASS

| Check | Result |
|---|---|
| HEAD/branch = exact requested SHA; diff scope correct | PASS |
| `git diff --check` | PASS |
| `npx tsc --noEmit` | PASS |
| Parser fail-closed paths and duplicate-secret rejection | PASS (static) |
| **Real router→adapter→transport→GET path traced** | PASS |
| Router input validation / RBAC / read-only behaviour | PASS |
| `canExecutePaymentActions: false` on all paths | PASS |
| Secret hygiene reviewed | PASS |
| Forbidden paths empty; no DB/deploy/migration | PASS |
| Mutation probes now dynamically import and execute mutated temporary subjects | PASS |
| No enumeration path found | PASS |
| **The previous "Control now consumes" claim is now supported** (`server/routers.ts:9,86-93`; `billing-core-snapshot-router.ts:28-60`) | PASS |

Four of four R1 blocking findings are therefore closed, and the stage's objective is now genuinely met.

Vitest could not execute in the reviewer sandbox (`spawn EPERM`, sixth occurrence).

## Environment-input deviation — ADJUDICATED: correct as-is

The reviewer ruled the lane was right **not** to expose `environment` as a caller input:

> "the accepted design binds environment to the product credential/configuration, not caller input. The
> owner ruling explicitly states `environment` comes from the credential and is never a request field
> (`STAGE-B-OWNER-RULING-AMENDMENT.md:53-67`, especially lines 53-55 and 65); the read contract says
> the same (`STAGE-B-READ-CONTRACT.md:120-125`)."

So the deviation I flagged is settled in the lane's favour, with citations, and my dispatch wording
was the imprecise part. The reviewer adds that the **resolved** environment must still be verified in
the response — which is Finding 1 below.

## New blocking findings — both verified true by Hermes against the code

Fingerprint: `CONTROL_READ_RESPONSE_IDENTITY_NOT_VERIFIED` (distinct from the R1 findings; a new cycle,
so its own repair budget applies).

### BLK-B4R2-1 — response `productId` and `environment` are not always verified against the requested authority

`billing-core-transport.ts:303-350` (`toControlSnapshot`) checks only `raw.accountId` against the
requested account. It then **copies `raw.productId` verbatim** into every subscription projection
(`:326`) and **casts `raw.environment`** straight into `environment`/`mode` (`:338-339`) without
comparing either to the configured credential's product/environment.

`validateSnapshot()` in `billing-core-adapter.ts:124-151` checks `productId` against the canonical
registry **only inside subscription/payment rows**. So when a response carries
`subscription: null`, a subscription-shaped check never runs, and a response naming the **wrong**
`productId` or a **wrong environment** is accepted.

Verified: with no subscription, nothing compares `raw.productId` or `raw.environment` to the authority
Control requested the read under. That lets SB01 (or anything impersonating it) return data attributed
to a different product/environment than the one the credential authorises — on a financial read
boundary.

### BLK-B4R2-2 — the transport claims strict validation but discards payment data and never validates readiness/freshness

- `:250` validates that `body.payments` is an array and `:292` carries it into the raw shape, but
  `toControlSnapshot` hardcodes `payments: []` at `:346`. A **non-empty** wire `payments` array is
  therefore **silently discarded**, not mapped and not rejected. The in-code claim at `:240` that the
  response is strictly shape-validated is not supported by behaviour.
- `readiness` and `freshness` appear **nowhere** in the transport (grep returns no reference), yet the
  accepted response contract requires them.

Silently converting a non-empty array to empty is an unsupported **repair** path, which the stage's own
contract forbids ("rejection is not repair; never a partially trusted snapshot").

## Unsupported claims recorded

- `billing-core-transport.ts:240` claims strict shape validation, but readiness/freshness are ignored
  and payment rows can be discarded. **Contradicted by implementation.**
- The prior "Control now consumes" claim **is now supported** (reviewer's own correction in the lane's
  favour).

## Untested areas carried to T5

Full vitest run in the reviewer sandbox; live SB01 HTTP integration; live runtime account-assertion
mismatch; live readiness under all dependency failures.

## Remedy shape

One bounded ordinary repair, then B4 R3:

1. Verify the response's `productId` and `environment` against the **configured authority** for the
   credential used — not only against `accountId`, and not only inside subscription rows. A mismatch
   must reject as a contract violation.
2. Stop discarding payment data. Either map a non-empty `payments` array per the accepted contract, or
   reject it as a contract violation — never silently coerce to `[]`.
3. Validate the mandatory `readiness`/`freshness` fields the accepted contract requires, reading the
   contract source rather than guessing field names.
4. Correct the in-code claim at `:240` so it matches actual behaviour.

Repair budget for this fingerprint: **0/2 used** at dispatch time.
