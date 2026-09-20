# B3 REMEDIATION OUTCOME — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Stage: T3 · Review Batch: B3-R2 (pending)
Delivered fix revision: hub-web `33082f8f43eca67754e27d052fbc2318a7a47e81` (pushed; parity PASS)
Recorded: 2026-09-20 (Asia/Bangkok)

## What closed the B3 findings

Two distinct defects, both of the same shape — **an intent marker treated as sufficient evidence of
completion**:

### 1. Production — revoke dedup predicate (`service.ts`)

Was: `if (operation.inserted && grantDone && bindingDone)`.

On a genuine repeat revoke the lifecycle operation row already exists, so `operation.inserted` is
`false`; the early return was skipped and execution fell through to the completion branch, which
re-applied `markGrantRevoked` + `markRecipientRevoked` and appended a **second** revoke audit entry.

Now: the predicate is driven by the durable end state alone — `if (grantDone && bindingDone)` — so a
repeat that finds the end state reached returns `deduplicated` without touching state.

### 2. Test fake — an inert idempotency control (`fulfillment.test.ts`)

`find()` compared `g.bindingKey` against whatever it was called with, but **both callers pass a
grantKey** (`insertGrantIdempotent`, `getGrantByGrantKeyAndGeneration`). CONTROL 1 — the absolute
`(grantKey, generation)` unique index — was therefore **never exercised**: a replayed insert reported
`inserted: true` where the real index would suppress it, so a reissue retry minted a second successor
instead of completing the planted one. `find()` now takes and compares `grantKey`.

CONTROL 2 (the partial live-binding index) is untouched and still compares a genuine
`bindingKey` / `revokedAt === null`.

### 3. Mechanical

`deriveOperationKey` added to the idempotency import — note it was a **runtime `ReferenceError` under
vitest, not a `tsc` error**, because `tsconfig.json` excludes `**/*.test.ts`. That is precisely the
gate-coverage gap recorded in `GATE-COVERAGE-FINDING-TEST-TYPECHECK-2026-09-20.md`. The `TEMP-DEBUG`
block was removed.

## Liveness of CONTROL 1 — proven by mutation, not by a green assertion

Claude's trace, which Hermes verified: **B3-4d is the only test that actually reaches `find()`.** A
fully-completed reissue retry short-circuits earlier via `getGrantById`, so the "suppresses a repeated
reissue" test never touches the collision path at all. B3-4d's predecessor has
`supersededByFulfillmentId === null`, so its retry falls through to
`insertGrantIdempotent` → `find()` → a real `(grantKey, generation)` collision.

**Hermes mutation-proved it directly:** reverting `find()` to the broken comparison made **B3-4d fail
again** (`1 failed`); restoring it returned the suite to green. So the control is live, not merely
present — which is the property this task has had to re-establish repeatedly.

## Orchestrator-verified gates (run by Hermes from the committed state)

```
cd apps/hub-web
npx tsc --noEmit  -> exit 0
npx vitest run    -> 21 files, 277 tests, all passing     (pre-T3 baseline: 213)
git diff --name-only -- drizzle/ server/webhooks/  -> empty
git status --short -> clean
```

Mutation proof: revert `find()` → B3-4d red; restore → green.

## Corrected record — three wrong diagnoses, and who found the truth

| Source | Claim about the reissue half | Verdict |
|---|---|---|
| Hermes (round 1 packet) | "test-local id-ordering assumption" | **wrong** |
| Codex classifier | "production code mints a successor" | **wrong** |
| Claude (senior, read the source) | "the test fake's lookup is inert; production is correct" | **correct**, independently verified by Hermes |

The revoke half of Codex's classification was correct and is what got fixed for real. That half had
also been independently confirmed by a bounded lane and by Claude's own trace.

**No layer accepted another's conclusion on trust.** The worker refused a wrong Hermes instruction and
was right; Codex was right about one half and wrong about the other; Claude was right about both and
had its finding verified before being acted on. All three corrections are recorded rather than
quietly dropped.

## Orchestrator errors recorded (mine)

1. The round-1 packet carried the id-ordering misdiagnosis.
2. The first **two** senior dispatches used `context_mode='isolated'`, which the canonical executor
   maps to `--permission-mode plan` for `agent-claude`
   (`direct_external_executors.py:1146-1162`). Only `context_mode='BUILD'` yields
   `bypassPermissions`. Claude therefore could not write files and correctly produced plans instead of
   edits, twice. That was a configuration error on my side, not a worker failure.

## Reviewer remediation accounting

B3 R1 `WORKER_FIX` → remediation round 1 (partially successful, wrong diagnosis) → round 2 (found the
real cause, blocked by the permission-mode error) → **senior remediation, one bounded authorised
repair**, applied at `33082f8`. The escalation ladder was followed: ordinary repairs exhausted →
Codex classification → senior remediation.

## Carried to T5 as live-verification requirements

Live PostgreSQL behaviour for partial unique-index conflict targets; concurrent callers racing on the
same grant/attempt; transactional recovery after DB failure between handoff, state update and audit
append; real storage-adapter idempotency and duplicate side-effect behaviour; and the fact that
**test files are outside every typecheck gate**.

## Transition

T3 remediation delivered -> **B3 R2 independent review required** before T4/T5.
Bind the review to hub-web `33082f8`.
