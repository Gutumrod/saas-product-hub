# B2 REVIEW CLOSURE — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Review Batch: **B2 — Product Event Trust Boundary**
Stage: T2 (product-event signer hardening)
Reviewer: `agent-codex` (independent, INDEPENDENT-QA)
Recorded: 2026-09-20 (Asia/Bangkok)

## Verdict history

| Round | Verdict | hub-web revision | Basis |
|---|---|---|---|
| B2 R1 | `WORKER_FIX` | `432b1ab` | 1 blocking: tautological idempotency test |
| B2 R2 | **`BATCH_APPROVED`** | `e24d5a9` | 0 blocking, 0 non-blocking, NB-B2-1 closed |

`B2 = BATCH_APPROVED`. Transition: **T2 approved -> T3 READY** (Reuse Gate already PASS).

## Why R2 is legitimate

Same reviewer, same batch. The remediation targeted the root cause the reviewer named, and R2
verified the fix independently rather than accepting the report. No verdict was requested in the
dispatch.

## R1 blocking finding — closure

**BLK-B2-1** — the handler suite's `beforeEach` mock deduplicated `(productId, externalEventId)`
itself, so tests (h)/(h2) passed even if the production database control were deleted.

Fix applied (test-only; production source untouched):
- The mock no longer deduplicates; it records every write and returns `{ inserted: true }`.
- (h)/(h2) now assert what the handler actually owns — forwarding the server-resolved `productId`
  and the event `externalEventId`, across repeated and distinct deliveries, while observing the
  writer's outcome.
- A new source-contract suite (`installIdempotency.test.ts`) asserts over the shipping source text
  that `db.ts` uses `onConflictDoNothing` targeted at `(productId, externalEventId)` with the
  insert/returning/no-op shape, and that `drizzle/schema.ts` declares the matching unique index.
  Each control is paired with a **mutation probe** against a damaged copy of the same source.

R2 verification: handler mock no longer deduplicates; (h)/(h2) verify forwarding; **all eight
mutation replacements changed their fixture copies**; assertions would throw for removed, retargeted,
no-op and update-degraded controls and for an altered unique index. Reviewer judgement on the
approach: *"Source-contract convention is legitimate for this stage: no live DB harness or authorized
live database exists, and repository precedent uses source/SQL assertions. This is structural proof,
not live-runtime proof."*

That last sentence is recorded verbatim because it is the correct epistemic label: this is
**structural** coverage, not live runtime proof. Live DB behaviour remains an untested area.

## Hermes independent verification (not taken from the worker)

```
cd apps/hub-web
npx tsc --noEmit  -> exit 0
npx vitest run    -> 19 files, 213 tests, all passing   (pre-T2 baseline: 174)
git diff HEAD -- server/db.ts server/webhooks/productEvents.ts \
                 server/webhooks/signerRegistry.ts drizzle/schema.ts  -> empty
```

**Live mutation proof performed by Hermes:** rewriting `db.ts` `onConflictDoNothing` ->
`onConflictDoUpdate` made **4 tests fail** in the idempotency suite; the source was then restored and
confirmed byte-clean (`git diff` empty). This is what makes the coverage claim mechanical rather than
asserted — the test demonstrably fails when the control is removed.

Reviewer non-blocking NB-B2-1 (identity accessors untested for secret omission) is **closed**: direct
tests now verify the accessors expose only `keyId`/`productId`, and source-projection probes reject
secret leakage.

## Untested areas (carried to T5)

- No live PostgreSQL replay test in this stage; acceptance relies on source-contract plus
  mutation-probe coverage.
- Reviewer could not execute Vitest in its sandbox (`spawn EPERM`); its result is recorded as a
  permanent evidence characteristic, not as evidence against the suite.

## Reviewer remediation budget

**2/2 used** across this finding cycle (round 1 fixed the mock; round 1's replacement introduced 4
mechanical test defects which round 2 closed). The batch is now approved, so no further remediation
is required.

## Scope

Production source unchanged from `432b1ab` (confirmed empty diff). The only changes at `e24d5a9` are
the two test files. No database mutation, no deploy, no migration, no secret value.

## Transition

`B2 BATCH_APPROVED` -> **T3 (shared one-time product fulfillment) READY.**
`T3 Reuse Gate = PASS` is already recorded (`T3-REUSE-GATE-2026-09-20.md`).
