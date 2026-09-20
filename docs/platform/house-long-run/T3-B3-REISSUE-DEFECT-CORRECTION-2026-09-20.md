# T3 B3 REMEDIATION round 2 — CORRECTION: the B3-4d failure is a production defect

Stage: T3 · Recorded: 2026-09-20 (Asia/Bangkok)
Status: **two production defects remain** (revoke half + reissue half), plus one harness defect

## Hermes was wrong about B3-4d — and the worker was right to refuse

My packet for the previous lane instructed: *"the test `B3-4d` fails with
`expected 'grant-0009' to be 'grant-0008'` — a test-local id-ordering assumption broken by the newly
added cases; assert against the id actually returned by the call rather than a hard-coded sequence
position."*

The lane **refused** that instruction and reported:

> the stated root cause for B3-4d ("a test-local id-ordering assumption") is factually wrong, and
> executing the prescribed instruction would make the assertion tautological and delete the very
> invariant the test asserts

**The lane is correct and I was wrong.** Verified against the test body:

```ts
// fulfillment.test.ts:1348
expect(retried.grant.id).toBe(successorId);   // the SAME successor — grant-0008
```

`successorId` is not a hard-coded literal — it is captured at `:1306` from
`inserted.record!.id` after the test deliberately plants the intent-marker successor. The assertion
therefore pins a **real invariant**: a reissue retry must complete the **existing** successor, not mint
a second one. It receives `grant-0009`, i.e. a **new** successor row was created.

So the failure is **BLK-B3-2, reissue half, still unfixed** — the same defect class as the revoke
predicate. My "id-ordering" reading was a misdiagnosis, and following it would have deleted the only
test that detects the defect. Refusing a wrong instruction was the correct behaviour under the
Decision Gap contract, and it is recorded here as such.

## Verified remaining defects

| # | Defect | Class | Evidence |
|---|---|---|---|
| 1 | `revoke()` dedup verdict requires `operation.inserted && grantDone && bindingDone`, so a genuine repeat falls through and re-applies revocation | production | `service.ts:1033`; proof-5 expects `deduplicated: true`, receives `false` |
| 2 | A reissue retry creates a **new** successor instead of completing the existing one | production | `fulfillment.test.ts:1348` expects `grant-0008`, receives `grant-0009`; the invariant is real |
| 3 | `B3-4c` calls `deriveOperationKey` without importing it (exported at `idempotency.ts:93`) | harness | `ReferenceError: deriveOperationKey is not defined` |
| 4 | A `TEMP-DEBUG` console block was left in `fulfillment.test.ts` (the lane disclosed it) | hygiene | `fulfillment.test.ts:~1322-1343` |

Both production defects share one shape: **an intent marker is being treated as sufficient evidence of
completion.** For revoke the marker is `operation.inserted`; for reissue it is the pre-existing
successor's presence. Neither is completion. The correcting principle is the same for both: **decide
from the durable end state, and complete what is missing.**

## Measured state

```
cd apps/hub-web
npx tsc --noEmit  -> exit 0
npx vitest run    -> 3 failed | 274 passed (277)
```

## Budget and escalation position

Fingerprint `T3_INTENT_MARKER_MISREAD_AS_COMPLETION` (revoke + reissue halves): **2/2 local fix
attempts consumed**. The lane's refusal did not consume an attempt — it aborted before applying a wrong
fix, which is the right outcome.

Per the Brief's recovery ladder, the next step on a still-failing fingerprint is **Codex
exact-evidence classification**, not a third ordinary repair.

## What should happen next

1. Route both production defects to Codex for classification with this record attached, since the
   ordinary-repair budget is spent and the previous round produced a misdiagnosis from Hermes.
2. Codex decides whether this is `WORKER_FIX` (a bounded correction Hermes may dispatch) or
   `SENIOR_REMEDIATION_REQUIRED` (the intent-vs-completion boundary needs a careful redesign).
3. Remove the `TEMP-DEBUG` block and import `deriveOperationKey` in the same pass — both are
   mechanical and carry no design content.
