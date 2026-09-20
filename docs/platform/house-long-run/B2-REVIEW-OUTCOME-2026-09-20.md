# B2 REVIEW OUTCOME — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Review Batch: **B2 — Product Event Trust Boundary**
Stage: T2 (product-event signer hardening)
Reviewer: `agent-codex` (independent)
Source revision reviewed: hub-web `432b1abd97aa0a024d2e9175bd5ded39d5b7acdd`
Recorded: 2026-09-20 (Asia/Bangkok)

## Verdict

**`WORKER_FIX`** — 1 blocking finding (tautological idempotency test), 1 non-blocking.

## What the reviewer confirmed as PASS (independently, from source)

| Check | Result |
|---|---|
| Revision binding (`git rev-parse HEAD` matched; worktree clean) | PASS |
| Signer→product binding resolved server-side; mismatched `productId` rejected (`productEvents.ts:296-306`) | PASS |
| Envelope + body tamper binding via canonical HMAC over envelope fields plus server-computed raw-body SHA-256 (`:128-145`, `:318-326`) | PASS |
| Digest contract fixed: `bodyDigest` absent from schema and rejected as unknown field (`:50-74`; tests `560-572`) | PASS |
| Verification ordering: first DB access occurs after signature, replay and rate checks (`:261-351`) | PASS |
| Replay window, body-size bound, per-signer rate limit enforced | PASS (source) |
| Idempotency implementation: unique index `(productId, externalEventId)` + `onConflictDoNothing` (`db.ts:224-253`; `schema.ts:149-155`) | PASS (source) |
| Failure modes fail closed (unknown/malformed key, bad product binding, bad version, bad timestamps) | PASS (source) |
| Secret hygiene: no secret returned or logged; identity accessors omit secrets (`signerRegistry.ts:175-187`) | PASS (source) |
| Typecheck `npx tsc --noEmit` | PASS (exit 0) |
| Changed-path audit: only the five dispatched files; no DB/schema/migration/deploy change | PASS |
| `git diff --check` | PASS |

The T2 signer contract itself is therefore accepted by the reviewer on its substance.

## Blocking finding BLK-B2-1 — tautological idempotency test

Reviewer: "The mock itself deduplicates `(productId, externalEventId)`
(`productEvents.test.ts:164-176`), so the test still passes if production DB idempotency is removed.
Tests `h` and `h2` therefore do not independently prove the database control."

**Verified true by Hermes against the file.** The `beforeEach` mock of
`recordProductInstallationFromWebhook` contains its own duplicate check over a local `harness.writes`
array and returns `{ inserted: false }` on a repeat. So test (h) "a replayed eventId does not
duplicate state" is satisfied by the **mock's** logic, not by the shipping code. Removing the real
`onConflictDoNothing` from `db.ts` would not fail that test.

This matters because idempotency-under-replay is an explicit acceptance requirement
(`PORTFOLIO_PRODUCTION_MASTER_PLAN.md:193` and `:518`), so a test that cannot fail is an unsupported
claim of coverage.

## Non-blocking NB-B2-1 — accessor contract lacks direct test coverage

`listProductEventSignerIdentities()` / `listKeyIdsForProduct()` are not invoked by any secret-hygiene
test. Source inspection confirms they omit `secret`, but the claimed contract is untested.

## Unsupported claims recorded

- The Hermes-reported `197/197` vitest pass could not be independently confirmed by the reviewer
  because `npx vitest run` fails in its sandbox with `spawn EPERM`. Hermes did run the suite in the
  project workspace and will re-run it after remediation; the reviewer's limitation is recorded as a
  permanent evidence characteristic, not treated as evidence against the suite.
- The Hermes-reported canonical secret-scan result was not independently re-run by the reviewer;
  source-level inspection found no logging or emission of secrets.

## Remediation route (reviewer-remediation path)

Dispatched back to an implementation lane. Environment constraint that the reviewer did not know:
**no live-database test harness exists in `apps/hub-web`** (no `pg-mem`, no `pglite`, and no
authorized live DB access in this stage), and adding a paid service is prohibited. The repo's
established convention for DB-contract coverage is source/SQL-contract assertion
(`server/control-plane/work-truth-migration.test.ts` inspects migration SQL text).

So the remediation must:
1. Remove the mock's own deduplication so the handler tests stop simulating the control they claim
   to cover, and instead assert that the handler forwards `productId` + `externalEventId` unchanged
   (dedupe being the database's responsibility).
2. Add a source-contract test that **fails if the production idempotency control is removed** —
   asserting `db.ts` uses `onConflictDoNothing` targeting `(productId, externalEventId)` and that
   `schema.ts` declares the corresponding unique index.
3. Add direct coverage that the identity accessors omit `secret`.
4. Re-run `npx tsc --noEmit` and `npx vitest run`, and report exact counts.

Reviewer remediation attempts for this finding cycle: **1/2**.
