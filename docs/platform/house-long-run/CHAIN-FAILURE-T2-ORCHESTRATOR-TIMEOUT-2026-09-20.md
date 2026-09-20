# CHAIN FAILURE — T2 lane killed by orchestrator timeout — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Stage: T2 (product-event signer hardening)
Review Batch: B2 (not reached)
Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001`
Recorded: 2026-09-20 (Asia/Bangkok)

## Issue Fingerprint

```
T2_IMPLEMENTATION_LANE_KILLED_BEFORE_COMPLETION
```

Failure class: `orchestrator-process-lifecycle` · Component: `terminal foreground timeout` ·
Failing gate: `declared_checks` (`tsc --noEmit`, then `vitest run`) ·
Symptom: worker made real progress, then the orchestrator's foreground terminal call hit its
420 s cap and terminated the lane mid-flight.

## What happened

The T2 implementation lane (`t2-wu02`, worker `swarm-builder`, capability `implementation`,
`max_turns=30`) was dispatched and made real, verifiable progress:

| Artifact | Status |
|---|---|
| `apps/hub-web/server/webhooks/signerRegistry.ts` | **created** (7,686 bytes) |
| `apps/hub-web/server/webhooks/productEvents.ts` | **rewritten** (3,325 → 13,032 bytes) |
| `apps/hub-web/server/webhooks/productEvents.test.ts` | **NOT touched** (still 3,325 bytes, Aug 24) |

The lane was then killed by the orchestrator's own wrapper: the `terminal` foreground call
exceeded its 420 s limit and the process tree was terminated. No swarm evidence record was written,
so the lane has no admission record.

**This is an orchestrator/process defect, not a worker defect and not a source defect.**
The worker was still working; the harness ran out of foreground wall-clock.

## Verified current state of the source (measured, not assumed)

```
npx tsc --noEmit  ->  2 errors:
  server/webhooks/signerRegistry.ts(177,14): TS2802 MapIterator can only be iterated with
      --downlevelIteration or target >= es2015
  server/webhooks/signerRegistry.ts(184,14): TS2802 same
```

So the partially written code does **not** typecheck. The test file still contains only the original
6 tests, which target the **old** shared-secret contract, so the suite cannot be green against the
rewritten handler either. The stage is therefore in a genuine `REMEDIATION_REQUIRED` state.

No DB access, no deploy, no migration, no secret value was written. Only the two source files above
were modified.

## Attempt ledger

| # | Lane | max_turns | Outcome |
|---|---|---|---|
| 1 | `t2-wu02` | 30 | killed by orchestrator foreground timeout; 2/3 files written; typecheck FAIL |

Local fix attempts for this fingerprint: **0/2** (the kill is the initial observation, not a repair
attempt).

## Remedy shape (do not replay blind)

Per the Brief's auto-recovery rule ("each WU is separately resumable; no blind replay"):

- The already-written work is **kept**. Re-deriving `signerRegistry.ts` and the handler rewrite from
  scratch would discard real progress and risk a different, unreviewed design.
- A **continuation lane** must: fix the two TS2802 iteration errors, extend
  `productEvents.test.ts` with the twelve required cases, then run `npx vitest run` and
  `npx tsc --noEmit` from `apps/hub-web` and report exact results.
- **Harness correction (orchestrator-owned):** dispatch the continuation in the **background** with
  a tracked session id instead of a foreground call, and give `swarmctl` a generous lane timeout.
  The previous failure was caused by the wrapper's foreground cap, so repeating the same
  invocation shape would repeat the failure.
