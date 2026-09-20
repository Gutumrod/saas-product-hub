# B3 REVIEW CLOSURE — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Review Batch: **B3 — Fulfillment Durability Boundary**
Stage: T3 (shared one-time product fulfillment)
Reviewer: `agent-codex` (independent)
Recorded: 2026-09-20 (Asia/Bangkok)

## Verdict history

| Round | Verdict | hub-web revision | Basis |
|---|---|---|---|
| B3 R1 | `WORKER_FIX` | `ae29d20` | 3 blocking (intent-vs-completion), 2 non-blocking (test quality) |
| B3 R2 | **`BATCH_APPROVED`** | `33082f8` | **0 blocking**; 2 non-blocking remain |

`B3 = BATCH_APPROVED`. Transition: **T3 approved -> T4/T5.**

## R2 verification performed by the reviewer (independently, from source)

| Finding | Reviewer's R2 verification |
|---|---|
| **BLK-B3-1** failure/resume audit recipient linkage | **closed** — failed/abandoned audits resolve `recipientDigest`; `resume()` loads the stored binding digest and passes it through |
| **BLK-B3-2** revoke permanently suppressed | **closed** — repeat revoke returns `deduplicated` only when grant AND binding are durably revoked; a partial revoke retry completes missing state |
| **BLK-B3-2** reissue permanently suppressed | **closed** — a reissue retry finds the existing `(grantKey, generation)` successor and completes it |
| **BLK-B3-3** post-handoff persistence failure | **closed** — marks attempt and grant `FAILED`, appends a failure audit, returns an error |
| Test-fake CONTROL 1 | compares `grantKey`; CONTROL 2 separately compares `bindingKey` and `revokedAt === null` |
| B3-4d load-bearing | confirmed: planted successor is reused, **and Hermes's revert mutation made it fail again** |
| proof-6 mutation probe | now executes the service and the mutated binding control |
| Scope diff `ae29d20` → `33082f8` | only `server/fulfillment/service.ts` and `server/fulfillment/fulfillment.test.ts`; `drizzle/` and `server/webhooks/` untouched |
| `npx tsc --noEmit` | passed (production source only — tests excluded) |
| Secret-pattern scan | no matches over source, fixtures, repository, schema, migration |

**Blocking: none.**

## Remaining non-blocking findings (accepted, carried to T5/T6)

1. **proof-7 mutation probe is still tautological** — `fulfillment.test.ts:1530-1543` mutates an
   in-memory audit array rather than invoking a mutated recorder/control, so it does not prove the
   production audit invariant survives mutation. proof-6 *was* fixed. This is the same defect class
   that B2 and B3 have each raised once; it is recorded rather than deferred silently.
2. **The broad "no provider SDK / no billing mutation" claim remains static-review dependent** — the
   boundary scanner checks a limited vocabulary, so absence is not exhaustively proven. The reviewer
   judged this fair to record as a limitation rather than a defect.

## Unsupported claims recorded

- "No provider SDK / no billing mutation" is not exhaustively supported beyond static review and the
  limited scanner.
- No database mutation, deploy or migration is independently observable from the reviewer sandbox;
  repository evidence shows no such change. **Live-state verification lands in T5** by design.

## Untested areas carried to T5 as live-verification requirements

- Full vitest execution inside the reviewer sandbox (`spawn EPERM` — four consecutive occurrences; a
  permanent evidence characteristic of this setup, not evidence against the suite).
- Live PostgreSQL partial-index conflict behaviour.
- Concurrent callers and transactional partial-failure recovery **— the highest-value live test, since
  BLK-B3-2 was precisely a partial-failure defect**.
- Real storage-provider retry/idempotency behaviour.
- Test-file typecheck coverage (the recorded gate gap).

## Remediation accounting

B3 R1 `WORKER_FIX` → ordinary round 1 (partially successful; carried a wrong Hermes diagnosis) →
ordinary round 2 (found the true cause; blocked by the orchestrator's `context_mode` error) →
Codex classification `SENIOR_REMEDIATION_REQUIRED` → **one bounded authorised senior repair** →
`33082f8` → B3 R2 `BATCH_APPROVED`.

The escalation ladder was followed exactly. Reviewer remediation budget: the blocking findings are
closed, so no further remediation is outstanding.

## Process corrections kept on the record

- An earlier Hermes packet and the Codex classification were **both wrong** about the reissue half. The
  senior engineer reading the source was right; Hermes verified it before acting.
- The first two senior dispatches used `context_mode='isolated'`, which maps to
  `--permission-mode plan` for `agent-claude`; only `BUILD` yields `bypassPermissions`. That was an
  orchestrator configuration error, not a worker failure.

## Transition

`B3 BATCH_APPROVED` -> **T4 is now the active gate**: it is `PENDING_DEPENDENCY` on the exact accepted
SB01 LR-2F contract, which does **not** yet exist (`LR-2F-A Stage B` has 16 open Decision Gaps
awaiting an Owner ruling). Per the Run Manifest, T4 persists `T4 DEPENDENCY_WAIT` and **no temporary
billing projection may be built**. T5 preparation that does not depend on the missing contract may
proceed.
