# T3 B3 REMEDIATION round 2 — root cause of the remaining revoke defect

Stage: T3 · Recorded: 2026-09-20 (Asia/Bangkok)
Status: **one blocking production defect remains** + two test-harness defects

## Correction to the earlier reading

An earlier note in `T3-B3-REMEDIATION-R2-OUTCOME-2026-09-20.md` classified all three remaining failures
as test-harness defects. That was **wrong for the first one**, and the correction matters.

Measured failure:

```
FAIL  proof 5: suppresses a repeated revoke instead of applying it twice
AssertionError: expected false to be true
  at fulfillment.test.ts:1081
  1081|  expect(second.deduplicated).toBe(true);   // received false
```

The test asserts the **new** intended semantics (a repeat revoke, with the end state already reached,
reports `deduplicated: true`). It receives `false`, which means the repeated revoke is applying
**again**. That is BLK-B3-2 itself, not a harness bug — the test is correct and the production code is
not.

## Root cause (verified against the code)

In `service.ts` `revoke(...)`:

```ts
const operation = await repository.recordLifecycleOperation({ ... });     // intent marker

const current = (await repository.getGrantById(grantRow.id)) ?? grantRow;
const bindings = await repository.listRecipientBindings(grantRow.id);
const grantDone   = grantIsRevoked(current);
const bindingDone = bindingReleased(bindings);

if (operation.inserted && grantDone && bindingDone) {
  return { revoked: true, deduplicated: true, grant: toGrantView(current) };
}
```

The dedup verdict requires **`operation.inserted`** to be true, in addition to the end state being
reached. On a genuine repeat revoke the operation row already exists, so `operation.inserted` is
**false**, the early return is skipped, and execution falls through into the completion branch — which
unconditionally re-applies `markGrantRevoked` and `markRecipientRevoked` and appends another audit
entry, returning `deduplicated: false`.

So `operation.inserted` is being used as a proxy for "this is a first attempt", when the whole point of
the intent-marker design is that it is **not** a completion marker. The end-state check
(`grantDone && bindingDone`) is already the correct completion test; conflating it with `inserted`
reintroduces the BLK-B3-2 defect in a subtler form.

### Required fix

The dedup verdict must be driven by the **durable end state alone**:

- If the end state is reached (`grantDone && bindingDone`), the operation is complete — return
  `{ revoked: true, deduplicated: true }` **regardless** of whether this call inserted the operation
  row.
- If the end state is not reached, complete it (the existing completion branch is correct) and report
  `deduplicated: false`.
- `operation.inserted` must not gate the dedup decision. It may still be used for diagnostics.

Note the symmetric check must be made in `finishReissueIntent`, which has the same shape:
`const alreadyComplete = linkDone && boundDone && deliveredDone;` — verify that its dedup/`deduplicated`
reporting does not additionally depend on a row being newly inserted.

## The other two failures — these ARE harness defects (unchanged reading)

| Test | Cause |
|---|---|
| `B3-4c: a retry after a SIMULATED PARTIAL revoke COMPLETES the revoke` | `ReferenceError: deriveOperationKey is not defined` — the test calls it without importing it. It **is** exported at `idempotency.ts:93`. |
| `B3-4d: a retry after a SIMULATED PARTIAL reissue COMPLETES the reissue` | `expected 'grant-0009' to be 'grant-0008'` — a test-local id-ordering assumption invalidated by the newly added cases. Assert on the returned id, not a hard-coded sequence position. |

## Unchanged state

```
npx tsc --noEmit  -> exit 0            (no type defect)
npx vitest run    -> 3 failed | 274 passed (277)
```

## Budget

Local fix attempts for the revoke-defect fingerprint: this is a **new, distinct** root cause (gating
predicate) from the earlier round's missing-plumbing root cause, so it takes its own counter:
**1/2**. The two harness defects ride the existing cycle.

## Next step

One bounded lane, scoped to:
1. remove `operation.inserted` from the revoke dedup predicate (end state decides),
2. check the same shape in `finishReissueIntent`,
3. import `deriveOperationKey` in the test file,
4. fix the `B3-4d` id assertion,
5. fix the proof-7 mutation probe (still outstanding from B3),
6. run and report `npx tsc --noEmit` and `npx vitest run`.
