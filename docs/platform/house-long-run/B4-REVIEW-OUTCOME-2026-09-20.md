# B4 REVIEW OUTCOME — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Review Batch: **B4 — Financial Read Boundary**
Stage: T4 (consume accepted SB01 LR-2F projection in Control)
Reviewer: `agent-codex` (independent)
Source revision reviewed: hub-web `32daeea60dfbc0c7465ed4c92ea61cba1352ba6d`
Recorded: 2026-09-20 (Asia/Bangkok)

## Verdict

**`WORKER_FIX`** — 4 blocking, 1 non-blocking, 3 unsupported claims.

## What the reviewer confirmed as PASS

| Check | Result |
|---|---|
| HEAD/branch = exact requested SHA | PASS |
| Commit scope = exactly the four named files; `drizzle/`, `server/webhooks/`, `server/fulfillment/` untouched | PASS |
| `git diff --check` | PASS |
| `npx tsc --noEmit` | PASS |
| One outbound `GET` only, approved route, no provider SDK or mutation imports | PASS |
| Explicit `accountId` required before any network call; no enumeration parameter | PASS |
| Assertion binds product, environment, account, operation ID, action | PASS |
| Provider mapping: accepts `trialing`/`active`/`past_due`/`canceled`/`cancelled`; **rejects** `unpaid`/`incomplete`/`incomplete_expired`/`paused`/empty/unknown | PASS |
| Connection, timeout, non-2xx, malformed JSON, contract violation → typed rejections | PASS |
| `canExecutePaymentActions` literal `false` on ready and degraded transport paths | PASS |
| No token/assertion secret in URL, fixed error text, or readiness reason | PASS |

Vitest could not execute in the reviewer sandbox (`spawn EPERM`, fifth occurrence).

## Blocking findings — all four verified true by Hermes against the code

### BLK-B4-1 — malformed partial credential config is not fail-closed

`parseBillingCoreTransportConfig()` (`billing-core-transport.ts:107-119`) uses `continue` for a
malformed entry and returns a valid config as long as **any** entry is valid. The test at
`billing-core-transport.test.ts:108-123` explicitly approves this, which contradicts the contract I
stated in the T4 dispatch and closure: *"the parser fails closed to an unconfigured adapter on … any
entry missing a required field."*

Verified: the malformed entry is skipped, the good entry survives, `credentials.size > 0`, and a
config object is returned. So a structurally broken product entry leaves Control configured.

**This is a contract violation against my own written requirement, and the test encodes the wrong
behaviour.** Both must change.

### BLK-B4-2 — unconfigured reads return an empty *successful* snapshot instead of rejecting

`UnconfiguredBillingCoreAdapter.getSnapshot()` (`billing-core-adapter.ts:163-174`) **resolves** with
`connected: false`, empty `subscriptions`/`payments`, and a warning, and its readiness is
`waiting_for_billing_core` — not `degraded`.

Verified against the pre-T4 revision `33082f8`: this behaviour is **identical before T4**, so the lane
did not introduce it. But it directly contradicts two criteria I wrote into the T4 dispatch
("missing/invalid config read rejects"; "no empty success") and the manifest's *"missing/degraded
projection fails closed visibly"*.

**Recorded honestly as a gap in my packet, not as a worker defect** — I asked for a `rejects`
behaviour in the criteria without instructing a change to the class that would have to provide it.
It is still a real blocking gap in the delivered state.

### BLK-B4-3 — the claimed Control consumption has no production caller ← most serious

Repository-wide search finds **no production use** of `getBillingCoreAdapter()`,
`TransportBackedBillingCoreAdapter` or `BillingCoreControlSnapshot` outside the adapter module and its
tests. Verified by Hermes: every non-test reference is a declaration, an interface member, or a
comment inside `billing-core-adapter.ts` / `billing-core-transport.ts` / `env.ts`.

So T4's objective — *"Consume accepted SB01 LR-2F projection in Control"* — is **not met**. The
transport is implemented and tested in isolation but nothing in Control actually calls it. The stage
delivered capability, not consumption. The reviewer's phrasing is exact: *"'Control now consumes' is
unsupported by production call-site evidence."*

This is the finding that matters most for T4's declared purpose and it is a fair call against my own
closure document, which stated the transport was wired without verifying a live consumer.

### BLK-B4-4 — one assertion secret can be reused across products

The parser provides product-keyed lookup but does not reject the same `assertionSecret` appearing under
multiple `productId`s (`billing-core-transport.ts:106-119`). A single shared secret may therefore be
configured for several products, defeating the per-product signer separation the contract exists to
provide.

## Non-blocking finding (accepted)

**NB-B4-1 — the mutation probes do not execute a mutated subject.** `billing-core-transport.test.ts:448-484`
modifies source **text** and asserts on regex absence; it never loads or invokes the modified transport.
So it proves the text probe, not the runtime behaviour after a method/route change. This is the **same
defect class B2, B3 and now B4 have each raised** — worth fixing rather than deferring again.

## Unsupported claims recorded

- "49 new cases" is structurally plausible (40 declarations plus parameterised cases) but the reviewer
  could not execute vitest to confirm.
- **"Control now consumes…" is unsupported by production call-site evidence** (BLK-B4-3).
- "Any malformed credential entry drops the whole config" is contradicted by the implementation **and
  by its own test** (BLK-B4-1).

## Untested areas carried to T5

Full vitest execution in the reviewer sandbox; live SB01 HTTP integration; runtime verification that a
mismatched caller account is actually refused; runtime production route/service consumption;
cross-product duplicate-secret rejection (absent in code); and live readiness behaviour under all
network failure modes.

## Remedy shape

One bounded remediation lane, then B4 R2:

1. **Parser fail-closed:** a malformed entry must invalidate the whole config (or be rejected
   explicitly); remove the `continue`-and-proceed behaviour and update the test at
   `billing-core-transport.test.ts:108-123` to assert the corrected contract.
2. **Unconfigured must reject:** `UnconfiguredBillingCoreAdapter.getSnapshot()` must not resolve an
   empty success. It must reject with a typed fail-closed error, and its readiness must be
   `degraded`-equivalent so it is visibly not serving data.
3. **Wire a real production consumer:** a Control route/service must actually call
   `getBillingCoreAdapter()` and surface the snapshot and readiness, so the stage's objective is met
   rather than only exported. This is the substantive part of T4 and must be reviewed as such.
4. **Reject duplicate assertion secrets across products** in the parser, with a test.
5. **Fix the mutation probes** so they execute a mutated subject rather than asserting on source text.

Reviewer remediation attempts for this cycle: **1/2**.
