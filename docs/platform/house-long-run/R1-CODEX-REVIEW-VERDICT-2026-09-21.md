# R1 — CODEX INDEPENDENT REVIEW VERDICT — WSTERA-CONTROL-TRUTH-SYNC-001

Review checkpoint: **R1** (after T2) · Workflow `WF-DEV-01 v1.3.0 / LONG_RUN`
Reviewer: **agent-codex** (`codex-cli 0.147.0`, auth `Logged in using ChatGPT`)
Reviewer role: independent reviewer — read-only, no repair authority
Reviewed at: 2026-09-21 (Asia/Bangkok)

## Verdict

```text
R1_VERDICT=BATCH_APPROVED
```

## Exact revisions reviewed

| Repo | Branch | Exact commit | Parent |
|---|---|---|---|
| hub-web | `work/wstera-control-truth-sync-001` | `fbd3a6274d7ae0100c198f32ce6e952d47940ad1` | `407130718646d13630b9789f68522a521fc74483` |
| saas-product-hub (planning) | `work/wstera-control-truth-sync-001` | `443e84922e7fab2189d26f78dc559f43336be81a` | `c6c7c0ece06aa861c1559afbecdc8368ebc532e1` |

Both remote-verified `0/0` before and after the review. No merge, no push, no PR created.

## Findings by review scope

1. **Scope identity contract — PASS.** Five-value vocabulary confirmed at `identity.ts:58-69`.
   Product scope derives `productCode + productId` from the canonical registry and fails closed on
   missing/unknown identity (`identity.ts:145-192`). Non-product scope enforces
   `scopeType + scopeKey` and nulls the Product identity (`identity.ts:160-175`). Normalizer is
   additive and does not repurpose `productCode` (`work-event-schema.ts:194-222`). RPC rejects
   non-product scope carrying Product identity (`0009:274-308`). Contract test 35/35.
2. **API / ingestion gate — PASS.** HMAC verification precedes JSON parse, normalization and the
   scope gate (`agentEvents.ts:113-165`). Rejected scope returns 422 before any RPC or durable write
   (`agentEvents.ts:151-165`). `p_product_code` / `p_identity_state` keep their names and meaning;
   scope rides additively as `p_scope_type` / `p_scope_key` (`agentEvents.ts:219-245`). Error tags
   agree between RPC and handler (`agentEvents.ts:83-96`).
3. **Migration / RPC — PASS** at source-qualification level. Nullable columns with no `DEFAULT`
   (`0009:99-107`); backfill limited to canonical Product identity (`0009:148-164`); NULL-tolerant
   CHECK constrained to the five values, added `NOT VALID` then validated separately
   (`0009:167-214`); 19-argument RPC with `SECURITY DEFINER` and explicit `search_path`
   (`0009:233-256`); idempotency, payload conflict, revision N→N+1, CAS and Owner Inbox
   `source_event_id` all preserved (`0009:311-345`); four-statement privilege block with the full
   19-type signature granted only to `service_role` (`0009:531-555`).
4. **F1 closure — GENUINELY CLOSED in source.** After stripping SQL comments, the reviewer
   independently measured the executable references:

   ```text
   CREATE ... args=19
   REVOKE ... args=19
   REVOKE ... args=19
   REVOKE ... args=19
   GRANT  ... args=19
   DROP FUNCTION IF EXISTS ... args=17
   ```

   The `DROP` follows the `CREATE` and `GRANT` (`0009:557-576`); the 17-argument signature appears
   **only** inside that executable `DROP`; no legacy CREATE/GRANT/REVOKE path remains. Migration
   contract test 17/17, full suite 430/430.
5. **Test evidence — REPRODUCED independently.** `npx vitest run` on the focused files 95/95 PASS;
   full suite 26 files 430/430 PASS; `tsc --noEmit` PASS; `git diff --check` CLEAN; git object ↔
   worktree binding confirmed for all 9 repo-A files and all 8 repo-B documents; both exact SHAs
   match `origin`.
   The reviewer qualified the secret-scan claim precisely: pattern scan found **no real credential**;
   it matched only the test HMAC fixtures `test-agent-hmac-secret-32bytes!!` and
   `some-other-hmac-secret-32-bytes!!`. So "CLEAN" is reproducible as a production-secret scan, but
   it is **not** a zero-match scan.
6. **Scope discipline — PASS.** Repo A changed exactly 9 files (3 implementation, 4 existing tests,
   1 migration, 1 new contract test). Repo B changed only the 8 planning/evidence documents. No
   unrelated runtime change.

## Counter-evidence / not reproducible

- `T2-WU04:226-268` still records F1 as "confirmed"; that is a **historical** finding from before this
  commit and does not contradict the current source.
- No database was contacted, so it remains **unverified** whether the migration is applied, what the
  live ACLs are, whether the live overload is gone, and how the Postgres transaction/concurrency
  behaves in applied state.
- Live sender/outbox compatibility with `wstera-workflows` was **not** reproduced; that is outside R1's
  source scope.

## What the Owner must know before the production checkpoint

- The migration **must not be applied without client/deploy coupling**: it drops the 17-argument
  overload *after* creating and granting the 19-argument function (`0009:558-571`). If an old client
  is still live at `DROP` time, ingestion returns `42883 undefined_function` on every call.
- R1 approves **source/revision qualification only.** Live DB apply, deploy and any production
  mutation still require the separate Owner production checkpoint.

## Boundary of this verdict

`BATCH_APPROVED` is a source-and-revision verdict at the two SHAs above. It is **not** a production
approval, **not** a `PRODUCTION_READY` claim, and **not** `OPERATED_STABLE`. It does not authorize the
migration apply or any deploy.

## Reviewer independence and integrity

Hermes independently recorded a pre-review snapshot of every tracked file hash in both worktrees and
re-compared after the review: **zero** file changed, both HEADs unchanged, both trees still clean, both
remotes still at the pinned revisions. The reviewer did not mutate the reviewed artifacts.

Harness note, recorded for honesty: this host's codex restricted-token sandbox cannot spawn child
processes — every sandboxed command fails with `0xC0000142`. The first R1 attempt therefore returned
`R1_VERDICT=STOP` honestly rather than guessing. The review was then re-run through the executor's
working path with full local access, under an explicit prompt boundary limiting the reviewer to
read-only operations, and the no-mutation check above confirms the boundary held.
