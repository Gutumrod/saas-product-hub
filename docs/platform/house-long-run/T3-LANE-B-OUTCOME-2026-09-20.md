# T3 lane B outcome + lane C defect list — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Stage: T3 (shared one-time product fulfillment)
Review Batch: B3 (not reached)
Recorded: 2026-09-20 (Asia/Bangkok)
Orchestrator: Hermes

## Measured state after lane B (Hermes-run, in the project workspace)

```
cd apps/hub-web
npx tsc --noEmit  -> exit 0
npx vitest run    -> Test Files 2 failed | 19 passed (21)
                     Tests 22 failed | 233 passed (255)
```

## What lane B delivered (verified on disk)

| Deliverable | State |
|---|---|
| Drift adjudication applied | ✅ migration now declares `fulfillment_records_live_binding_unique` on `bindingKey` (grep count = 1) |
| `drizzle/schema.ts` | ✅ four missing unique indexes declared |
| `server/fulfillment/repository.ts` | ✅ created |
| `server/fulfillment/service.ts` | ✅ created (1,000+ lines) |
| `server/fulfillment/fulfillment.test.ts` | ✅ created — covers the eight acceptance proofs |
| `server/fulfillment/fulfillment-controls.test.ts` | ✅ created — control/mutation-probe coverage |
| `npx tsc --noEmit` | ✅ exit 0 |

The eight acceptance proofs are all **authored**; they fail for one mechanical reason, below.

## Single root cause of all 22 failures — `recipientDigest` is not in scope in `runHandoff`

Measured failure text (20 of the failures, identical cause):

```
ReferenceError: recipientDigest is not defined
 ❯ runHandoff server/fulfillment/service.ts:510:9
```

Verified by Hermes against the file:

- `runHandoff` is declared at `service.ts:468-472` with the signature
  `(grantRow, attempt, options)` — it takes **no** `recipientDigest` parameter.
- Yet `recipientDigest` is referenced inside its body at **`:485`** and **`:510`**.
- The variable only exists in sibling scope: `resumeAttempt` (`:415-419`) declares it as a
  parameter, and `deriveIdentities` (`:209-220`) is where it is actually computed.
- Both call sites (`:408` and `:461`) call `runHandoff(recorded, running, options)` without it.

So `resumeAttempt` had the digest available and simply never forwarded it, and `runHandoff` never
declared it. This is a **mechanical scope/plumbing bug**, not a design defect: the audit call needs
the recipient digest to satisfy the "record who received which immutable version" requirement, and
the value exists one frame up.

### Required fix

Thread `recipientDigest` from `resumeAttempt` into `runHandoff` (add the parameter and pass it at both
call sites, or compute it inside `runHandoff` from the grant row). Prefer passing it: the digest is
already derived once per request and should not be recomputed. Do not change the audit contract.

## The remaining 2 failures — `fulfillment-controls.test.ts`

`repository.ts — the two idempotency controls use two distinct conflict targets` and
`service.ts — never becomes payment truth`. These are the control/probe assertions; inspect the exact
messages after the scope fix, since at least one may be a genuine contract gap rather than plumbing:

- The conflict-target assertion is intended to pin that the repository uses
  `(grantKey, generation)` for attempt idempotency **and** the `bindingKey` partial index for the
  live-binding rule — the two distinct controls the adjudication required. If the repository
  implemented only one, this test correctly fails and the repository needs the second target.
- The "never becomes payment truth" assertion must genuinely verify the absence of a provider SDK, a
  billing table, and any payment-mutation name in the service. If it fails on a false positive
  (e.g. a comment word), the assertion is over-broad and must be narrowed rather than deleted.

## Note on a reported "pre-existing baseline failure"

Lane B's report described a baseline failure in `installIdempotency.test.ts`
("MUTATION PROBE: the assertions fail when the installation unique index is deleted") observed before
its edits. Hermes re-ran that suite after lane B and could **not** reproduce it — the targeted run
produced no such failure. The 22 failures above are the reproducible state. If the mutation probe is
flaky (it asserts on a mutated copy of `schema.ts`, which lane B then also edited), lane C must make
it deterministic rather than leave a possibly-order-dependent probe in the suite.

## Attempt ledger

| # | Lane | max_turns | Outcome |
|---|---|---|---|
| 1 | `t3-wu02` | 45 | turn budget exhausted; schema + migration + vendor + provenance landed |
| 2 | `t3-wu02a` | 30 | fixed 6 typecheck errors (tsc exit 0); found and correctly refused to decide the drift; repository not started |
| 3 | `t3-wu02b` | 48 | applied drift fix; repository, service and tests written; 1 scope bug leaves 22 tests red |

Local fix attempts for the scope-bug fingerprint: **0/2** (initial observation).

## Remedy

One bounded lane: thread `recipientDigest` through `runHandoff`, then reconcile the two
`fulfillment-controls.test.ts` assertions against the adjudicated two-target repository contract, then
make any flaky mutation probe deterministic. Report `npx tsc --noEmit` and `npx vitest run` exactly.
