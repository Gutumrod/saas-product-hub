# B3 REVIEW OUTCOME — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Review Batch: **B3 — Fulfillment Durability Boundary**
Stage: T3 (shared one-time product fulfillment)
Reviewer: `agent-codex` (independent)
Source revision reviewed: hub-web `ae29d202c7ee60a579e85209ec6575fdd357c060`
Recorded: 2026-09-20 (Asia/Bangkok)

## Verdict

**`WORKER_FIX`** — 3 blocking, 2 non-blocking (test quality), 2 unsupported claims.

## What the reviewer confirmed as PASS

| Check | Result |
|---|---|
| SHA/worktree binding; branch clean and matching origin | PASS |
| **Boundary**: no executable provider SDK, billing table, subscription/customer mutation, or local payment truth | PASS |
| **Idempotency**: distinct `(grantKey, generation)` and partial `bindingKey WHERE revokedAt IS NULL` controls present in schema, migration and repository | PASS |
| A **different immutable version is refused** rather than creating a parallel live grant | PASS |
| Failure durability: handoff failure records failed grant/attempt and returns an error | PASS |
| Audit/version: immutable version required by the recorder; normal success path carries the recipient digest | PASS |
| Revoke releases the live binding; repeated revoke suppressed; reissue path present | PASS |
| Reuse: vendored files destination-owned; provenance records versions, immutable commit, copy date, local changes, and the `modules/subscription` rejection | PASS |
| Scope: `schema.ts` diff additive; `server/webhooks/` untouched; no migration/deploy/DB apply | PASS |
| Secrets: no actual secret value found | PASS |

The core capability is therefore accepted on substance. The findings are about **durability edges and
audit completeness**, which is exactly B3's declared critical focus.

## Blocking findings — all three verified true by Hermes against the code

### BLK-B3-1 — delivery audit loses recipient linkage on failure and on resume

`service.ts:550-558` appends the `fulfillment.delivery.failed` / `.abandoned` audit entry **without**
`recipientDigest`. And `service.ts:721-723` `resume(id)` calls `deliverGrant(fulfillmentId, options)`
**omitting** the digest, while `deliverGrant` defaults it to `null` at `:300-304`.

Verified: `repository.getGrantById` already returns `recipientDigest` (projection at
`repository.ts:834`), so the value is recoverable at the resume entry point and is not being loaded.
Consequence: a failed handoff, or any resume, writes an audit entry with no recipient linkage — which
contradicts the contract's "record who received which immutable version" and leaves a gap precisely on
the failure path the capability exists to make auditable.

Test gap confirmed by Hermes: `fulfillment.test.ts:794` asserts only that the audit **contains** the
action `fulfillment.delivery.failed`; no test asserts the failure/resume entry carries the digest.

### BLK-B3-2 — revoke and reissue can become permanently "suppressed" after a partial durable failure

**Revoke:** `service.ts:744-756` records the lifecycle operation **first**, then performs
`markGrantRevoked` (`:761`) and `markRecipientRevoked` (`:766`). A retry therefore finds the existing
operation and returns `{ revoked: true, deduplicated: true }` at `:754-758` **without confirming the
grant was actually revoked**. If the first attempt died between the operation insert and the grant
update, the grant stays live forever while every retry reports success.

**Reissue:** `service.ts:850-928` inserts the successor row before the lifecycle linkage, predecessor
update, recipient binding, audit and delivery. A failure after insertion leaves a successor row, and a
retry can return `REISSUE_ALREADY_ISSUED` (`:869-889`) instead of resuming completion.

The reviewer's phrasing is exact: **"there is no transaction/compensation boundary."** That is the
defect — the operation record is being used as a completion marker when it is only an intent marker.

### BLK-B3-3 — post-handoff persistence failure is not made durable as a failed delivery

`service.ts:502-523` performs the **external** `handoff.handoff(...)` first, then
`markDeliverySucceeded`, `markGrantDelivered` and the audit append. If any of those writes fail, the
error escapes **without the grant being marked failed**, so a retry may repeat the external side
effect. The contract requires exactly the opposite: "fail visibly and durably rather than silently."

## Non-blocking findings (test quality — accepted)

- **NB-B3-1** — two mutation probes are partly tautological: the proof-6 probe
  (`fulfillment.test.ts:1048-1073`) only derives keys and checks an empty harness without executing a
  mutated control; the proof-7 probe (`:1135-1148`) mutates an in-memory audit array rather than
  invoking the recorder. These do not prove the production control survives mutation. This is the
  same defect class B2 raised, appearing again — worth fixing rather than deferring.
- **NB-B3-2** — the boundary scanner checks a limited vocabulary, so "no provider SDK / no billing
  mutation" cannot be *proven* absent by it; that broader claim remains static-review dependent. The
  reviewer judged the scanner useful for the known prohibited names, which is a fair reading.

## Unsupported claims recorded

- Hermes-reported vitest (`21 files, 272 tests`) and secret-scan results could not be independently
  re-run in the reviewer sandbox (`spawn EPERM` again).
- No live database migration/apply, concurrency test, or real storage-provider retry test is
  evidenced. These are carried to T5 as live-verification requirements.

## Untested areas carried forward

Live PostgreSQL behaviour for partial unique-index conflict targets; concurrent callers racing on the
same grant/attempt; **transactional recovery after DB failure between handoff, state update and audit
append**; real storage adapter idempotency and duplicate side-effect behaviour; full vitest execution
in the reviewer sandbox; and test-file typecheck coverage (the tsconfig exclusion recorded in
`GATE-COVERAGE-FINDING-TEST-TYPECHECK-2026-09-20.md`).

## Remedy shape

One bounded lane, three fixes plus test coverage, then re-review B3:

1. Thread the stored `recipientDigest` from `getGrantById` into every delivery audit path, including
   the failed/abandoned entries and the `resume(id)` entry point.
2. Make revoke and reissue **resumable rather than merely suppressed**: a retry that finds an existing
   lifecycle operation must verify the intended end state and complete it if incomplete, instead of
   returning deduplicated success. Add a compensation/ordering boundary so a partially applied
   operation is detectable and completable.
3. Ensure a post-handoff persistence failure marks the grant/attempt failed durably and returns an
   error, so a retry is bounded rather than repeating an unbounded external side effect.
4. Add tests for: failed-delivery audit carries the recipient digest; resume after failure carries it;
   retry after a simulated partial revoke completes the revoke; retry after a simulated partial
   reissue completes the reissue; persistence failure after handoff leaves durable failed state.
5. Fix the two tautological mutation probes so each actually executes a mutated control.

Reviewer remediation attempts for this cycle: **1/2**.
