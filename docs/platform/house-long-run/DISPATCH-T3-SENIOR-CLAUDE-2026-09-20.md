# SENIOR REMEDIATION DISPATCH — T3 intent-vs-completion boundary — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Agent: `agent-claude` — `SENIOR_DIFFICULT_REMEDIATION_ENGINEER`
Authority: Codex exact-evidence classification returned **`SENIOR_REMEDIATION_REQUIRED`**
(`docs/platform/house-long-run/T3-CLASSIFICATION-2-REPORT-CODEX-2026-09-20.md`)
Stage: T3 (shared one-time product fulfillment) · Review Batch: B3-R2 (pending)
Recorded: 2026-09-20

## Why a senior engineer is being engaged

Two ordinary remediation rounds were spent on the B3 blocking findings. The second round's packet
contained a **factual misdiagnosis from Hermes** (it told the lane the `B3-4d` failure was a test id
assumption; the lane correctly refused). The remaining defect is a **correctness-critical
intent-versus-completion boundary in an idempotent, durable, auditable capability**, which is exactly
the shape the escalation ladder reserves for senior remediation.

## Source to remediate

Repository: `Gutumrod/hub-web` (nested; `apps/hub-web` is git-ignored inside the House repo)
Branch: `work/house-platform-closure-20260919`
Worktree: `D:\AI-Workspace\projects\saas-product-hub\apps\hub-web`
Delivered revision: `ae29d202c7ee60a579e85209ec6575fdd357c060` + **uncommitted remediation edits** in
`server/fulfillment/service.ts` and `server/fulfillment/fulfillment.test.ts`

Measured state right now:

```
npx tsc --noEmit  -> exit 0
npx vitest run    -> 3 failed | 274 passed (277)
```

## The defect, stated once

An **intent marker is being treated as sufficient evidence of completion**, in both halves.

**Revoke** — `server/fulfillment/service.ts:1033`:

```ts
if (operation.inserted && grantDone && bindingDone) {
  return { revoked: true, deduplicated: true, grant: toGrantView(current) };
}
```

On a genuine repeat revoke the lifecycle operation already exists, so `operation.inserted` is `false`,
the early return is skipped, and execution falls into the completion branch — which re-applies
`markGrantRevoked` + `markRecipientRevoked` and appends a second audit entry, returning
`deduplicated: false`. The test `proof 5` asserts the correct new semantics and receives `false`.

**Reissue** — a retry finds the previously planted successor and **mints a new one** instead of
completing the existing one. `fulfillment.test.ts:1348` asserts `retried.grant.id === successorId`
where `successorId` is captured from the deliberately planted row (not a literal); it receives
`grant-0009` instead of `grant-0008`.

## Authorized remedy (Codex)

1. **Revoke:** remove `operation.inserted &&` from the predicate at `service.ts:1033`. Codex's
   sufficiency check: this **is** sufficient for the one-audit-entry assertion, because a fully
   complete end state returns **before** the completion/audit branch; the partial-completion branch
   must retain its existing conditional audit behaviour so only the retry that actually completes
   missing state writes the single audit entry.
2. **Reissue:** when the successor already exists (the planted/partial case), route it through
   `finishReissueIntent` / `completeReissue` for **that** successor. Do not mint another row.
   Completion requires predecessor linkage, successor binding, audit and delivery to be durable.
   A full-end-state retry must be audit-free and delivery-idempotent.
3. **Mechanical, same pass:** import `deriveOperationKey` in `fulfillment.test.ts` (it is exported at
   `idempotency.ts:93`); remove the `TEMP-DEBUG` console block left in the test file.
4. **Do not** weaken the planted-successor assertion at `:1348` — it is the invariant that detects the
   defect. Codex explicitly confirmed that assertion is sound.

`repository.ts`: no structural change indicated.

## Required to pass

- `B3-4c` (partial revoke completes)
- `B3-4d` (partial reissue completes, **same** successor)
- repeated revoke → exactly ONE lifecycle row and ONE revoke audit entry, grant ends revoked
- repeated reissue → one successor, one audit entry
- full `npx vitest run`
- `npx tsc --noEmit` exit 0

## Boundaries

- Do not modify `drizzle/` (schema and migration are reviewed and correct) or `server/webhooks/`.
- No deploy, no live database access, no migration apply, no real secret value.
- Do not redesign the intent-boundary approach wholesale; apply the authorized predicate/route change.
- If you find that the authorized fix is itself insufficient, say so with evidence rather than
  widening scope silently — a senior finding that overrides the classification is a legitimate return.

## Also available to you

Hermes has independently verified: the revoked-half predicate at `service.ts:1033`; the `B3-4d`
assertion at `fulfillment.test.ts:1348` and the `successorId` capture at `:1306`; the `TEMP-DEBUG`
block; and that `deriveOperationKey` is exported at `idempotency.ts:93`. `tsc` is clean; the three
failures are as described.
