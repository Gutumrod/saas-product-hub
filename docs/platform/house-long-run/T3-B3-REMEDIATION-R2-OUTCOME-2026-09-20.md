# T3 B3 REMEDIATION — round 2 outcome + remaining mechanical defects

Stage: T3 · Review Batch: B3-R2 (pending)
Recorded: 2026-09-20 (Asia/Bangkok)

## Measured state after `t3-wu04b`

```
cd apps/hub-web
npx tsc --noEmit   -> exit 0                                    (arity defect fixed)
npx vitest run     -> Test Files 1 failed | 20 passed (21)
                      Tests 3 failed | 274 passed (277)          (was 272)
```

Test count rose 272 -> 277, i.e. the five B3-required cases were authored plus the proof-6 probe
rewrite. `tsc` is clean, so **no production type defect remains**.

## What the lane completed

- **STEP 1** arity defect fixed (`finishReissueIntent` call at `service.ts:1232` now matches the
  5-parameter declaration at `:738`). `tsc` clean.
- **STEP 2** revoke test rewritten to assert the new resumable semantics.
- **STEP 3** the five B3-required test cases authored (including `B3-4c` partial-revoke completion and
  `B3-4d` partial-reissue completion).
- **STEP 4 (first half)** the proof-6 mutation probe rewritten.
- **STEP 4 (second half)** proof-7 probe rewrite NOT done.
- **STEP 5** the acceptance commands were never re-run by the lane after editing.

## The three remaining failures — all test-harness defects, verified

| # | Failing test | Cause | Verified |
|---|---|---|---|
| 1 | `proof 5: suppresses a repeated revoke instead of applying it twice` (`→ expected false to be true`) | The new `B3-4c`/`B3-4d` cases create additional grants; the older proof-5 assertion expects `grant-0008` but now receives `grant-0009` — an id-ordering assumption that the new cases invalidated | `fulfillment.test.ts` id sequence; failure text `expected 'grant-0009' to be 'grant-0008'` |
| 2 | `B3-4c: a retry after a SIMULATED PARTIAL revoke COMPLETES the revoke` (`→ deriveOperationKey is not defined`) | The test calls `deriveOperationKey` but does not import it. The symbol **is** exported: `idempotency.ts:93` | grep of `deriveOperationKey` across the fulfilment module |
| 3 | `B3-4d: a retry after a SIMULATED PARTIAL reissue COMPLETES the reissue` | Same missing import (and/or the same id-ordering assumption) | same |

**No production defect is indicated by any of the three.** Two are a missing import of an
already-exported symbol; one is a test-local id ordering assumption. This is the same class of
mechanical harness defect seen repeatedly in this task (undefined helper, id assumptions, CRLF
matching), not a contract problem.

## Budget position (stated plainly)

Local fix attempts for the current fingerprint: **2/2 consumed**. The permission to keep fixing came
from the fact that each round exposed a *different* mechanical defect rather than the same one, but the
budget is now exhausted. Per the Brief's automatic technical recovery, a further ordinary repair is not
permitted; the next step on a *new* failure would be Codex classification.

## Why this is recorded rather than escalated

The three remaining defects are (a) fully diagnosed with exact causes and (b) limited to test plumbing,
with production source already clean on `tsc` and reviewed by B3 on substance. Recording the exact state
lets the next actor close them without re-diagnosis, and keeps the escalation ladder intact for a
genuine new failure.
