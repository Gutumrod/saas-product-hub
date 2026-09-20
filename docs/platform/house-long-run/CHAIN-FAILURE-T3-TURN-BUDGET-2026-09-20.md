# CHAIN FAILURE — T3 lane turn-budget exhaustion (round 1) — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Stage: T3 (shared one-time product fulfillment)
Review Batch: B3 (not reached)
Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001`
Recorded: 2026-09-20 (Asia/Bangkok)

## Issue Fingerprint

```
T3_IMPLEMENTATION_TURN_BUDGET_EXHAUSTED_BEFORE_CORE_SERVICE
```

Failure class: `executor-resource-envelope` · Component: `swarm-builder` turn budget on a
multi-artifact capability build · Failing gate: `tsc --noEmit`, then `vitest run` ·
Symptom: schema + migration + vendored bases written, repository/service/tests never started.

Note: this is the **same failure class** as the T1 fingerprint
(`SWARM_WORKER_TURN_BUDGET_EXHAUSTED_BEFORE_DELIVERABLE_WRITE`) — a bounded native worker was handed
a capability build larger than its turn envelope. The T3 packet was pre-shaped with build-order
writes (which is why real progress survived), but the envelope was still sized as one lane.

## Attempt ledger

| # | Lane | max_turns | Outcome |
|---|---|---|---|
| 1 | `t3-wu02` | 45 | worker `FAIL` — schema, migration and vendor copies written; repository, service and tests not started; `tsc` exit 2; `vitest` exit 1 |

Local fix attempts for this fingerprint: **0/2** (initial observation, not a repair).

## What actually landed (verified by Hermes on disk, not from the report)

```
drizzle/schema.ts                                   +316 lines (additive only)
drizzle/migrations/0007_shared_one_time_fulfillment.sql   263 lines
server/fulfillment/types.ts                          213 lines
server/fulfillment/idempotency.ts                    116 lines
server/fulfillment/db.ts                              26 lines
server/fulfillment/vendor/PROVENANCE.md               97 lines
server/fulfillment/vendor/{audit-log,audit-recorder,audit-store-pg,clone,
                           file-storage,file-storage-types,job-retry}.ts
```

`PROVENANCE.md` satisfies the Reuse Gate's copy-and-own obligation correctly and precisely: it
records source version, immutable source commit `cd88c570ab57f6976d15f85d09973d0cfbf0cd63` for all
three bases, copy date, the destination-owned status, and an explicit statement that nothing imports
from `modules-hub` by filesystem path and that no upstream module was modified.

**Important scope note:** `drizzle/schema.ts` is a file the B2 reviewer already assessed as
unchanged. This change is **additive only** (+316 lines, no deletions) and touches no existing table
or index, so it does not invalidate B2's conclusions about `product_installations`. B3 must confirm
that reading.

## Measured defects in what landed

`npx tsc --noEmit` -> exit 2, six errors:

| File | Error |
|---|---|
| `drizzle/schema.ts:9` | `TS2305: Module 'drizzle-orm/pg-core' has no exported member 'sql'` |
| `server/fulfillment/vendor/audit-store-pg.ts:22` | `TS2307: Cannot find module './db.js'` |
| `server/fulfillment/vendor/audit-store-pg.ts:23` | `TS2459: 'AuditRecorder' declares locally but is not exported` |
| `server/fulfillment/vendor/audit-store-pg.ts:70` | `TS7006: Parameter 'row' implicitly has an 'any' type` |
| `server/fulfillment/vendor/clone.ts:59` | `TS2802: MapIterator can only be iterated with --downlevelIteration or target >= es2015` |
| `server/fulfillment/vendor/clone.ts:70` | `TS2802: SetIterator` same |

The TS2802 pair is the identical class already fixed twice in this task (T2 `signerRegistry.ts`): the
repo's tsconfig target does not permit iterator spread. It is a known, mechanical fix.

`npx vitest run` -> exit 1 (expected: the new schema has no tests and the tree does not typecheck).

## Remedy shape

**Continuation lanes, not a replay** (Brief rule: "each WU is separately resumable; no blind
replay"). The landed work is kept because it is correct in substance and satisfies the Reuse Gate's
provenance obligation.

Split into two bounded lanes:

- **R2-A (fix + repository):** correct the six typecheck errors (import `sql` from the right module
  in `drizzle/schema.ts`; fix the vendored `audit-store-pg.ts` import/export/typing issues; replace
  the two iterator spreads with `Array.from(...)` in `clone.ts`), then implement the durable
  repository with the idempotency key. Verify `npx tsc --noEmit` exit 0.
- **R2-B (service + tests):** implement the fulfillment service (deliver, durable visible failure,
  revoke, reissue, audit of recipient + immutable version) and the test coverage for the eight
  acceptance proofs, using the repo's source/SQL-contract convention with mutation probes. Verify
  `npx tsc --noEmit` and `npx vitest run`.

Both lanes dispatched in the background. `max_turns` sized for one deliverable each rather than a
whole capability.
