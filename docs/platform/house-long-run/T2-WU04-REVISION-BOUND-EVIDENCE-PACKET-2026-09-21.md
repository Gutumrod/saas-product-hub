# T2-WU04 — REVISION-BOUND EVIDENCE PACKET — WSTERA-CONTROL-TRUTH-SYNC-001

One revision-bound evidence packet normalising the complete T2 stage evidence for
`WSTERA-CONTROL-TRUTH-SYNC-001`, written 2026-09-21 (Asia/Bangkok) under work unit
`T2-WU04-REVISION-BOUND-EVIDENCE-PACKET`, correlation id `wstera-cts-001-t2-wu04-20260921`,
capability `evidence_preparation`, lane `t2-wu04`.

This is a normalisation record. It is not an approval, not a gate result, and not a stage PASS.

## A. Stage and revision identity

| Field | Value | Source |
|---|---|---|
| Task | `WSTERA-CONTROL-TRUTH-SYNC-001` | `RUN-MANIFEST-WSTERA-CONTROL-TRUTH-SYNC-001.md`; lane evidence records |
| Workflow | `WF-DEV-01 v1.3.0` / `LONG_RUN` | `RUN-LEDGER-WSTERA-CONTROL-TRUTH-SYNC-001-2026-09-21.json` |
| Execution engine | `hermes-native-swarm v0.1.1`, `relay_path_used: false` on every lane | `RUN-LEDGER-…json`; every lane evidence record |
| Stage under evidence | T2 (`t2-wu01`, `t2-wu02`, `t2-wu03`); T2-WU04 is this packet lane | lane evidence records |
| Planning worktree | `D:/AI-Workspace/runtime/worktrees/wstera-control-truth-sync-001` | ledger `revisions.planning_worktree` |
| Planning worktree revision | `c6c7c0ece06aa861c1559afbecdc8368ebc532e1` — **no commit made** | ledger `revisions.planning_worktree` |
| Implementation (hub-web) worktree | `D:/AI-Workspace/runtime/worktrees/hub-web-cts001` | lane evidence records `workspace.path` |
| Implementation base revision | `407130718646d13630b9789f68522a521fc74483` | all three T2 lane records declare, measure and bind this revision |
| Implementation branch | `work/wstera-control-truth-sync-001` | ledger `revisions.hub_web_isolated_worktree` |
| Commits in either worktree | **ZERO — no commit, no push, anywhere** | ledger; T2-WU02 §10.4; T2-WU03 record |
| Packet correlation id | `wstera-cts-001-t2-wu04-20260921` | `t2-wu04-run.json` |
| Packet capability | `evidence_preparation` | `t2-wu04-run.json` |

Declared stage boundaries at the time of writing: T2 is implemented and tested but **not reviewed**
(R1 Codex review not run), **not committed**, **not merged**, and **not approved**. `B0` has no blocking
finding; T1 is complete as evidence.

## B. Lane execution ledger

For each of the three T2 lanes: lane id, work unit id, worker profile, model, provider, engine,
session id, lane state, and the sha256 of its evidence record. Worker/model/provider/engine/session/
state values are read from the lane record's own `worker` and `state` fields; the evidence sha256 was
computed by this work unit with `sha256sum` over the record file on disk.

| Field | `t2-wu01` | `t2-wu02` | `t2-wu03` |
|---|---|---|---|
| Lane id | `t2-wu01` | `t2-wu02` | `t2-wu03` |
| Work unit id | `T2-WU01-WORK-SCOPE-CONTRACT` | `T2-WU02-MIGRATION-RPC-QUALIFICATION` | `T2-WU03-SCOPE-CONTRACT-TESTS` |
| Worker profile | `swarm-builder` | `swarm-db` | `swarm-tester` |
| Model | `deepseek-v4.1-flash:cloud` | `deepseek-v4.1-flash:cloud` | `deepseek-v4.1-flash:cloud` |
| Provider | `ollama-cloud` | `ollama-cloud` | `ollama-cloud` |
| Engine | `hermes-native` | `hermes-native` | `hermes-native` |
| Session id | `20260921_152035_113544` | `20260921_153751_671adf` | `20260921_155120_17139c` |
| Lane state | `SWARM_WORK_UNIT_PASS` | `SWARM_WORK_UNIT_PASS` | `SWARM_WORK_UNIT_PASS` |
| Invariant | `CLEAN` (findings `[]`) | `CLEAN` (findings `[]`) | `CLEAN` (findings `[]`) |
| Capability | `implementation` | `database_qualification` | `testing` |
| `relay_path_used` | `false` | `false` | `false` |
| Evidence record sha256 | `dfd166244213345c81f62cedd5b52993a18c1e2f4913b860dfcfe2701eb92cd6` | `e5315840a31810c397e570a4a6e7f3d50da88ef3a4d9b8c83f477a994056699b` | `385432023bc4f995521d1fae0a19ee47cba6183be8f15892504a4107c8337f39` |
| Evidence record path | `…/workspace/wstera-cts-001/out-t2-wu01/t2-wu01/evidence-t2-wu01.json` | `…/workspace/wstera-cts-001/out-t2-wu02/t2-wu02/evidence-t2-wu02.json` | `…/workspace/wstera-cts-001/out-t2-wu03/t2-wu03/evidence-t2-wu03.json` |
| Started / finished (UTC) | `2026-09-21T08:20:35Z` / `08:34:01Z` | `2026-09-21T08:37:50Z` / `08:46:53Z` | `2026-09-21T08:51:19Z` / `08:57:12Z` |

Every lane record carries `worker.trusted: false` with the note "worker self-report; never converted
into an approval". Commander lane verdicts as recorded in the ledger: `t2-wu01` **ACCEPTED**;
`t2-wu02` **ACCEPTED AS EVIDENCE** — verdict `QUALIFIED_WITH_FINDINGS` (12 findings, F1 = HIGH);
`t2-wu03` verdict not yet recorded in the ledger at the revision this packet describes (the ledger
was generated at `2026-09-21T08:48:40Z` and lists `T2-WU03`/`T2-WU04` under `not_reached`).

Recording limitation carried as raw fact: the `invocation.stdout_excerpt` field of
`evidence-t2-wu03.json` is stored truncated at 8,192 bytes against 10,567 original bytes
(`max_output_excerpt_bytes: 8192` in `t2-wu03-run.json`), so the tail of that lane's own summary is
not present in its evidence record. `evidence-t2-wu01.json` (8,112 bytes) and `evidence-t2-wu02.json`
(6,989 bytes) are below the same limit and are not truncated.

## C. Commander independent verification

These are the commander's own re-runs, recorded as distinct from the worker self-reports in section B.
Each row names its source; no value in this section is a worker claim.

| Check | Recorded result | Source |
|---|---|---|
| Typecheck, `npm run check` (`tsc --noEmit`), hub-web worktree | PASS, exit 0, output `> service-booking-landing@1.0.0 check` / `> tsc --noEmit` with no diagnostics | `verify-t2-wu01.json` `commander_independent_checks.npm_run_check`; `evidence-t2-wu03.json` `commander_checks` (same command, exit 0); re-confirmed in `evidence-t2-wu01.json` |
| Full suite after T2-WU01 | **PASS 381/381 tests, 25/25 test files**, exit 0 (baseline before the change: **366/366**, 25 files) | `verify-t2-wu01.json` `vitest_full`: "PASS 381/381 (25 files), baseline was 366/366"; ledger `t2-wu01.commander_reruns.vitest`: "381/381 PASS (baseline 366)" |
| Full suite after T2-WU03 (with the new contract test file) | **PASS 416/416 tests, 26/26 test files**, exit 0 | `evidence-t2-wu03.json` `commander_checks` (`npx vitest run`, exit 0) plus the lane's recorded runs of `npx vitest run` and `npm run test` at 26 files / 416 tests |
| Out-of-repo behavioural probe of `resolveWorkScope` | **PROBE_ALL_OK — 10/10 scope rows correct, 5/5 legacy `resolveProductIdentity` rows unchanged** | `verify-t2-wu01.json` `commander_independent_checks.probe_decision_table`; ledger `t2-wu01.commander_reruns.probe`. Harness: `esbuild` bundle of `identity.ts` → `probe/identity.mjs`, **run by node outside the repo**. Bundled probe artifact sha256 `a7e1963804f48b3d9d2cd2bf6759e427f8238e0196928c3933fdcfe2bad90058` |
| Probe row detail (10 scope rows) | (1) product + canonical `BK01` → resolved with canonical product identity; (2) product not in registry `ZZ99` → unresolved, fail closed; (3) `scopeType=product` without `productCode` → unresolved; (4) `house` + `scopeKey` → resolved `non_product_scope`, null product identity; (5) no product + no scope → unresolved; (6) non-product scope + `productCode` → unresolved; (7) non-product scope + blank `scopeKey` → unresolved; (8) unknown `scopeType` `banana` → unresolved; (9) `shared_runtime` + `scopeKey` → resolved `non_product_scope`; (10) `workflow_infrastructure` + `scopeKey` → resolved `non_product_scope` | `verify-t2-wu01.json` `probe_evidence.result_rows` |
| Probe row detail (5 legacy identity rows) | `null` / `undefined` / `''` / `'   '` / `'not-a-code'` → unresolved, behaviour unchanged | `verify-t2-wu01.json` `probe_evidence.result_rows` last entry |
| Changed-file scope | NONE out of scope — `git status` showed exactly the six allowed files, no untracked file (after T2-WU01) | `verify-t2-wu01.json` `changed_files_scope`, `out_of_scope_changes`; ledger `commander_reruns.out_of_scope` |
| Migration file | NONE created — `drizzle/migrations/` holds only `0001`–`0008`; `0009_work_scope_identity.sql` absent | `verify-t2-wu01.json`; `evidence-t2-wu02.json` check `! test -f drizzle/migrations/0009_work_scope_identity.sql` (exit 0); re-measured live for this packet |
| Database | NOT contacted | `verify-t2-wu01.json` `database_contacted: false`; T2-WU02 §10.4 |
| RPC argument additivity | `p_scope_type` / `p_scope_key` added additively; `p_product_code` / `p_identity_state` names and meaning unchanged; `product_code` not repurposed; exact-body HMAC path untouched | `verify-t2-wu01.json` `commander_independent_checks` (`rpc_args_additive`, `product_code_repurposed: false`, `hmac_path_unchanged: true`) |
| Commit state | `committed: false`; HEAD at verification still `407130718646d13630b9789f68522a521fc74483` | `verify-t2-wu01.json` (`base_revision`, `head_at_verification`, `committed`); ledger `commander_reruns.committed` |
| **Implementation-file hashes unchanged between T2-WU01 and T2-WU03** | **CONFIRMED** — see the three-row comparison below | `evidence-t2-wu01.json` `artifacts` / `commander_checks` `after_sha256`; `evidence-t2-wu03.json` recorded `sha256sum -c … all six OK`; this work unit's live `sha256sum` |
| T2-WU02 corroboration of F1/F2/F9 | F1 CONFIRMED — `grep 'DROP FUNCTION'` over `drizzle/` returns nothing; `0006` declares a 17-argument function granted to `service_role`, so a 19-argument `CREATE OR REPLACE` leaves the 17-argument overload live with no scope gate. F2 CONFIRMED — the handler dispatches on substrings `scope_identity_invalid` / `scope_identity_conflict`; an unpinned RPC tag falls through to a retryable 500. F9 CONFIRMED — `work-truth-migration.test.ts` asserts only statement suffixes and reads only `0006`. Client now sends 19 args while the migration signature is still 17 | `RUN-LEDGER…json` `t2-wu02.commander_independent_corroboration`; reproduced in this packet's section G |

Implementation-file hash comparison — T2-WU01 `after_sha256` vs the value measured on disk for this
packet (all three identical; T2-WU03 added only a new test file and the T2-WU03 lane's own in-lane
`sha256sum -c` over its six baselined files returned `all six OK`, exit 0):

| Implementation file | T2-WU01 `after_sha256` | Measured on disk at T2-WU04 | Equal |
|---|---|---|---|
| `server/control-plane/work-event-schema.ts` | `908fb277f43f7a21cb2f366e14a0b7589188857f28a3e42275607437a21257ba` | `908fb277f43f7a21cb2f366e14a0b7589188857f28a3e42275607437a21257ba` | YES |
| `server/control-plane/identity.ts` | `9e3017a862742e1e202d7d4ba86a214d70b7512fa09179791f09afcd86566945` | `9e3017a862742e1e202d7d4ba86a214d70b7512fa09179791f09afcd86566945` | YES |
| `server/webhooks/agentEvents.ts` | `17495250249b085f2c460c8429847ba4365792188730beb5ccc946eb720c6c2f` | `17495250249b085f2c460c8429847ba4365792188730beb5ccc946eb720c6c2f` | YES |

Corroborating live diff extent for the same three files: `git diff --stat` = "3 files changed,
229 insertions(+), 6 deletions(-)" — the same figure the T2-WU03 lane recorded in its own in-lane
check, i.e. no further change to implementation files after T2-WU01.

## D. Changed files and artifact hashes

Base revision for every hub-web row: `407130718646d13630b9789f68522a521fc74483`
(branch `work/wstera-control-truth-sync-001`). **No commit exists** in either worktree; every row
below is an uncommitted working-tree state. All sha256 values were computed by this work unit with
`sha256sum` over the real files on disk at the revision named in section A.

Hub-web worktree `D:/AI-Workspace/runtime/worktrees/hub-web-cts001`:

| # | File | Status | sha256 | Bytes |
|---|---|---|---|---|
| 1 | `server/control-plane/work-event-schema.ts` | modified | `908fb277f43f7a21cb2f366e14a0b7589188857f28a3e42275607437a21257ba` | 8263 |
| 2 | `server/control-plane/identity.ts` | modified | `9e3017a862742e1e202d7d4ba86a214d70b7512fa09179791f09afcd86566945` | 7542 |
| 3 | `server/webhooks/agentEvents.ts` | modified | `17495250249b085f2c460c8429847ba4365792188730beb5ccc946eb720c6c2f` | 9059 |
| 4 | `server/control-plane/work-event-schema.test.ts` | modified | `a36c28070c9d7b70f65ca7807dbf1c2fa823be91ff9c353ff12323b4e7f42522` | not measured |
| 5 | `server/webhooks/agentEvents.test.ts` | modified | `dfbc804e09e87f9955089516934dccebaf65161802388b4cac2bf986369b4605` | not measured |
| 6 | `server/control-plane/identity.test.ts` | modified | `7337d38da0fc74b8b0806757e4fb90a7d24797459b6aef1f350167d708b91dc7` | not measured |
| 7 | `server/control-plane/work-scope-contract.test.ts` | untracked, new in T2-WU03 | `2eb30ff2d477808250c1faebe8732f6510c667ca6d1709f2dc62a4bf334dbdf4` | 32746 |

Row 7 is the only file added by T2-WU03; rows 1–3 are the implementation files, created by T2-WU01 as
an additive change to the base revision, and rows 4–6 are their existing test files. Bytes for rows
4–6 are marked "not measured" rather than estimated. Live `git status --porcelain=v1` at the base
revision shows exactly these seven entries (`M` × 6, `??` × 1). Live `git diff --stat` over all six
tracked files: "6 files changed, 554 insertions(+), 6 deletions(-)". No migration file was created
(`drizzle/migrations/` holds only `0001`–`0008`); `0009_work_scope_identity.sql` does not exist.

Documents in the planning worktree `D:/AI-Workspace/runtime/worktrees/wstera-control-truth-sync-001`
at `c6c7c0ece06aa861c1559afbecdc8368ebc532e1` (all uncommitted):

| File | sha256 | Bytes |
|---|---|---|
| `docs/platform/house-long-run/T1-SCOPE-CONTRACT-AND-DEPENDENCY-CLOSURE-2026-09-21.md` | `415ed8e4a0e64cd28e5e81a355f952951b7896b2a627497f05bde371c1101c43` | 64259 |
| `docs/platform/house-long-run/T2-WU02-MIGRATION-RPC-QUALIFICATION-2026-09-21.md` | `1e7a81b1c9c36a905c08ace4ce235e454b9b93ce6ed1e2b0b115f612d3cd8c63` | 72451 |
| `docs/platform/house-long-run/T2-WU04-REVISION-BOUND-EVIDENCE-PACKET-2026-09-21.md` (this packet) | not embedded — a self-referential hash cannot survive the write that carries it; the measured value is reported in the `t2-wu04` lane work result next to this path | 32138+ |

The T1 and T2-WU02 document hashes match the values pinned in
`RUN-LEDGER-WSTERA-CONTROL-TRUTH-SYNC-001-2026-09-21.json` `artifacts`. Source-evidence hashes for
the same artifacts, as recorded by the producing lanes: T1 doc `415ed8e4…` in
`verify-t2-wu01.json`; T2-WU02 doc `1e7a81b1…` in `evidence-t2-wu02.json` `artifacts` and its
`mutation-observed` check.

Disclosed deviation carried forward: `verify-t2-wu01.json` `known_deviation` records that T1-WU01's
own published sha256 pre-dated two in-document line-number corrections; the commander re-measured and
the post-correction hash `415ed8e4…` is authoritative. That re-measured value is the one recorded
here and it agrees with the live measurement.

## E. Required case coverage and observed results

The ten required cases are taken verbatim from work unit `T2-WU03-SCOPE-CONTRACT-TESTS`
(`out-t2-wu03/t2-wu03/prompt-t2-wu03.txt`). Observed results are read from
`evidence-t2-wu03.json` `worker_report.summary`, which reports 35 `it()` tests in 10 labelled CASE
blocks, all asserted against the real exported `resolveWorkScope` / `isScopeType` /
`isNonProductScopeType`, the real normalizer, and the real `handleAgentEventPayload` (handler
exercised with an injected stub `db`, so no database was needed).

| Case | Required case (abridged) | Observed result | Evidence |
|---|---|---|---|
| 1 | Product scope with a canonical registered `productCode` is accepted, canonical product identity retained | **PASS** | `evidence-t2-wu03.json`: "CASE 1 … — PASS" |
| 2 | Product scope with a missing `productCode` is rejected | **PASS** | `evidence-t2-wu03.json`: "CASE 2 … — PASS" |
| 3 | Product scope with an unknown / non-registry `productCode` is rejected | **PASS** | `evidence-t2-wu03.json`: "CASE 3 … — PASS", with the fixture correction recorded under section F |
| 4 | Non-product scope: explicit allowed `scopeType` + non-empty `scopeKey`, no product identity → accepted with null product identity | **PASS** | `evidence-t2-wu03.json`: "CASE 4 … — PASS" |
| 5 | Non-product scope carrying a product code or product id is rejected | **PASS** | `evidence-t2-wu03.json`: "CASE 5 … — PASS" |
| 6 | No product identity and no explicit non-product scope is rejected as ambiguous | **PASS** | `evidence-t2-wu03.json`: "CASE 6 … — PASS" |
| 7 | An unknown `scopeType` outside the five-value vocabulary is rejected | **PASS** | `evidence-t2-wu03.json`: "CASE 7 … — PASS" |
| 8 | Non-empty `scopeType` with an empty or whitespace-only `scopeKey` is rejected | **PASS** | `evidence-t2-wu03.json`: "CASE 8 … — PASS" |
| 9 | Ingestion handler: every rejected case fails closed before any durable write (RPC never called) | **PASS** | `evidence-t2-wu03.json`: "CASE 9 … — PASS" |
| 10 | Exact-body HMAC verification still rejects an unsigned or wrongly signed request | **PASS** | `evidence-t2-wu03.json`: "CASE 10 … — PASS" |

Coverage arithmetic as recorded and re-confirmed by the commander: 10 of 10 required cases PASS, 0
recorded FAIL. The lane reported no case that did not hold ("no case was self-approved"; the only
per-case failure text present is the T2-WU03 fixture-correction evidence reproduced in section F).

Independently of the worker, the commander's out-of-repo behavioural probe (section C) covers the same
decision surface at the resolver boundary: 10/10 scope rows correct and 5/5 legacy identity rows
unchanged. The probe is a separate harness from the in-repo test file and was not produced by the
T2-WU03 worker.

Suite counts at each point, exactly as observed: baseline before T2-WU01 — 25 files / 366 tests;
after T2-WU01 — 25 files / 381 tests; after T2-WU03 — 26 files / 416 tests. Typecheck `npm run check`
exit 0 at every point.

## F. Retry, remediation and failure ledger

Budget state, read from `RUN-LEDGER-WSTERA-CONTROL-TRUTH-SYNC-001-2026-09-21.json`
`retry_budget`:

| Budget | Total | Consumed | Remaining |
|---|---|---|---|
| `local_fix_attempts` | 2 | **1** | **1** |
| `reviewer_remediation_attempts` | 2 | 0 | 2 |
| `senior_escalations` | 1 | 0 | 1 |

The consumed local-fix attempt is the one recorded against lane `t0-wu02`
(`T0-WU02-EVIDENCE-SECRET-REDACTION`): "local fix attempt 1 of 2 consumed; secret gate re-verified
CLEAN; non-credential ETag preserved". Its cause, as recorded in the ledger's `t0-wu01` note, was an
initial commander secret-scan FAIL over two credential values copied from a `wrangler whoami`
transcript into evidence. That attempt was spent at T0, before this unit's work; this packet consumes
no retry, remediation or escalation budget of its own.

Fail-closed events that actually occurred in the run, carried as raw fact:

1. Commander secret-scan FAIL on the first T0 document → remediation at `t0-wu02` (the consumed
   local-fix attempt above).
2. A routing refusal before dispatch at T1: the first packet declared an unknown capability token and
   `swarmctl plan` returned `SWARM_REVIEW_REQUIRED / ROUTING_UNCERTAIN` with zero lanes; no worker
   ran. Corrected in-packet and re-validated.
3. An isolated-worktree harness defect: global git `core.autocrlf=true` materialised the fresh
   hub-web worktree with CRLF line endings, breaking four mutation-probe tests (366 → 362 passing);
   after forcing LF materialisation the baseline is 366/366. Recorded as a harness defect, not a
   product defect.
4. T2-WU03 internal fixture correction: the lane's first run of its new file returned
   `EXIT=1`, `Test Files 1 failed (1)` / `Tests 3 failed | 30 passed (33)`. The recorded cause is
   `Local Service Booking: expected false to be true` — the fixture code was 21 characters
   (`printf | wc -c` = 21) and exceeded the schema's `productCode` `max(20)`, so `safeParse` failed at
   the parse layer with 400 before the scope gate; the lane recorded that asserting 422 there "would
   have been an assertion about the wrong layer". It corrected its own fixture to use an in-bound
   non-registry code for the scope-gate assertion and gave the over-long code its own explicit
   parse-layer test, then re-ran: `Tests 35 passed (35)`, exit 0. This self-correction happened inside
   the single T2-WU03 lane run and is **not** recorded in the ledger as consuming a local-fix attempt;
   whether it should be charged to the budget is a commander/Owner classification this packet does not
   make.

No lane in T2 reported `FAIL` or `BLOCKED` as its work-unit state. No escalation was used.

## G. Findings carried to R1

Findings list reproduced from `T2-WU02-MIGRATION-RPC-QUALIFICATION-2026-09-21.md` §10.2, with the
severity column as the document states it. The T2-WU02 verdict is **`QUALIFIED_WITH_FINDINGS`**;
F1 is the blocking-class finding and is the reason the verdict is not
`QUALIFIED_NO_BLOCKING_FINDING`.

| # | Severity | Finding (as recorded) |
|---|---|---|
| **F1** | **HIGH** | The signature change creates an **overload**, not a replacement. `CREATE OR REPLACE FUNCTION` with an added parameter list leaves `ingest_agent_work_event_atomic(<17 types>)` in place with its `service_role` grant intact and **no scope gate**, so the new fail-closed scope contract is bypassable by any 17-argument caller, and such bypass rows land with `scope_type IS NULL` — indistinguishable from legitimate legacy rows. The design describes a replacement while proposing an addition. The migration must either `DROP FUNCTION IF EXISTS` the superseded 17-type signature (after the new function is created and granted, and after the client deploy) or explicitly justify retaining it. No database object references the function, so the `DROP` is dependency-safe. |
| F2 | MEDIUM | The design requires a new non-retryable scope error tag but names no tag. The handler routes RPC errors by substring match, so an unnamed tag the handler does not recognise falls through to the retryable 500 branch instead of a non-retryable 422 — a fail-open outcome for an integrity violation. The applied WU01 work already expects `scope_identity_invalid` / `scope_identity_conflict`. The RPC tag string must be pinned and asserted by a test. |
| F3 | MEDIUM | The row-level consistency constraint required by the design is never given as SQL. It must be NULL-tolerant on `scope_type` (legacy rows keep NULL by design) and ordered after the backfill. A plain `ADD CONSTRAINT … CHECK` takes `ACCESS EXCLUSIVE` and scans the table; if any existing row violates it the migration fails and aborts. `NOT VALID` + `VALIDATE CONSTRAINT` is the safe sequence — a pattern used nowhere in this folder today. |
| F4 | MEDIUM | The design never states which value a non-product row writes into `identity_state`, and proposes no constraint on that column, yet the applied WU01 work emits `"non_product_scope"`. `identity_state` is a free `varchar(30) NOT NULL DEFAULT 'unresolved'` with no `CHECK`, so the only bound on the new vocabulary is column width. |
| F5 | LOW | Layer-bound disagreement on the `scope_type` bound: the parser accepts up to 50 characters while the proposed column is `varchar(30)`. Harmless today only because the longest legal vocabulary value is 23 characters. `scope_key` is already aligned at 200/200. |
| F6 | LOW | `work_queue_scope_idx (scope_type, scope_key)` is speculative: no read path filters or orders by either column. Either justify the index with a named read path or omit it. |
| F7 | LOW | `ADD COLUMN IF NOT EXISTS` does not verify an existing column's type or length; a re-run after a mis-typed earlier attempt reports success with the wrong applied shape. The migration should assert the applied column type explicitly after the `ALTER`. |
| F8 | LOW | The applied WU01 payload change nests `workScope` inside the payload passed as `p_payload`, widening the byte-comparison surface of the event-id/payload conflict check: two events with the same `event_id` differing only in scope data are now a conflict. Consistent with the documented contract, but it changes retry semantics for the deployed sender and must be stated explicitly. |
| F9 | MEDIUM | The migration-contract test provides false-negative coverage for the highest-risk control: it asserts only statement suffixes, which are identical for a 17-type and a 19-type list, and reads only `0006` — so a wrong-arity block, a missing block for the new function, and an entirely new migration file all pass. New assertions must pin the full 19-entry type list on all four statements. |
| F10 | MEDIUM | The proposed file name `0009_work_scope_identity.sql` carries no target-database declaration, while this folder contains migrations for two different databases (`0002`–`0006` Control; `0007`/`0008` product DB) and there is no `__drizzle_migrations` journal. The migration must declare its target database and its predecessor explicitly, and the `db:push` prohibition must hold. |
| F11 | LOW | The design supplies no rollback block, while every precedent migration in this folder carries one. Section 8 of the qualification supplies the missing plan; it must be written into the migration file. |
| F12 | LOW | Apply/deploy ordering is unspecified. Because the change is an overload the correct order is: schema → new function + full privilege block → client deploy → retire the old overload. Dropping the old arity before the new client is live produces `42883 undefined_function` on every ingestion call. |

Supporting references for the findings, as recorded in the source document: F1 —
`0006_canonical_product_id_work_truth.sql:32-49` (17-parameter declaration), `0006…:265-288` (grant
of the old overload to `service_role`), `T1-SCOPE-CONTRACT-AND-DEPENDENCY-CLOSURE-2026-09-21.md:238`,
`:248`, `:255-257`; F2 — `server/webhooks/agentEvents.ts:69-85`, `:90-91`, `:96-101`; F4 —
`0003_work_tracking_truth_pipeline.sql:27`, `server/control-plane/identity.ts:36`,
`server/webhooks/agentEvents.test.ts:191`; F9 — `server/control-plane/work-truth-migration.test.ts:5-8`,
`:36-39`; F10 — `0002…:2`, `0003…:2`, `0005…:3`, `0006…:3`, `0007…:2-3`, `0008…:2-4`, `0008…:14-17`,
`package.json:16`; F12 — `server/webhooks/agentEvents.ts:242-243`, `0006…:260-262`.

Commander independent corroboration of the three highest-severity findings, as recorded in
`RUN-LEDGER-WSTERA-CONTROL-TRUTH-SYNC-001-2026-09-21.json`
(`t2-wu02.commander_independent_corroboration`), reproduced here verbatim in substance:

- **F1 confirmed.** `grep 'DROP FUNCTION'` over `drizzle/` returns nothing; `0006` declares a
  17-argument function granted to `service_role`; a 19-argument `CREATE OR REPLACE` would leave the
  17-argument overload live with no scope gate. Corroborated by: the T2-WU01 client now sends **19**
  arguments while the migration signature is still **17**.
- **F2 confirmed.** The handler dispatches on the substrings `scope_identity_invalid` /
  `scope_identity_conflict`; an unpinned RPC tag falls through to a retryable 500.
- **F9 confirmed.** `work-truth-migration.test.ts` asserts only suffix strings (`") FROM PUBLIC;"`,
  etc.) and reads only `0006`.

Risks carried forward by T2-WU02 §10.3 (recorded as risks, not findings against the design): R-A —
applied database state never inspected, so every DB statement is a statement about migration source at
`4071307`, not applied truth; R-B — the `identity_state` third value exists only in the uncommitted
T2-WU01 working tree, not at the pinned revision; R-C — Control Sync sender-side scope/revision
binding is out of the inspection root; R-D — the backfill decision is explicitly reserved to the
reviewer/Owner boundary.

## H. Open blockers and Owner decisions required

Three blockers, as recorded in `RUN-LEDGER-WSTERA-CONTROL-TRUTH-SYNC-001-2026-09-21.json`
`blockers` and `HERMES-RUN-STATUS-T0-T2-2026-09-21.md` §8:

- **B1 — Control Work Queue scope gap (GAP-A).** Migration `0006:70-78` raises
  `product_identity_invalid` for any task projection without a canonical `productCode + productId`,
  confirmed from source. Work Queue sync for non-product (House/Platform) work is therefore BLOCKED:
  it cannot be truthfully projected without inventing a fake Product code, which is forbidden. No
  work-sync was attempted; Control received **activity-only telemetry**, delivered HTTP 200. This is
  the gap the task exists to close.
- **B2 — Commit and branch authority unresolved.** The task instructions lock branch
  `work/wstera-control-truth-sync-001`; repository git policy prescribes `task/<TASK-ID>-<slug>`; and
  the standing rule states `saas-product-hub` commits are Claude-only. Nothing has been committed or
  pushed anywhere, so **R1 has no pinned revision to bind to**. Owner decision required: which branch
  and which commit authority govern.
- **B3 — T2 F1 overload defect (HIGH).** An arity-added `CREATE OR REPLACE` leaves the 17-argument
  scope-gateless overload reachable by `service_role`. The migration must `DROP` the superseded
  signature after the new function plus grant and the client deploy, or explicitly justify retaining
  it. Owner/reviewer decision required on which course; the defect must be closed inside the migration
  text before R1 can qualify it.

Decisions this packet does not make and reserves to the Owner: the B2 branch/commit authority; whether
retention of the 17-argument overload in B3 is ever justifiable; the T2-WU02 backfill question (R-D);
and whether the T2-WU03 internal fixture correction is charged to the local-fix budget (section F).

## I. Non-claims

- This packet asserts **no gate approval** of any kind and **no stage PASS** on its own authority. It
  is an evidence normalisation record only; verdict and approval belong to the commander and, where
  required, the Owner.
- No `PRODUCTION_READY` claim is made.
- No `OPERATED_STABLE` claim is made.
- No `LIVE_PROVEN` claim is made, including for anything quoted from prior closure records.
- `BUILD_PASS != PRODUCTION_READY != LIVE_PROVEN != OPERATED_STABLE`. The green typecheck and the
  381/381 and 416/416 suite results recorded here are build- and test-level evidence only and are not
  production-readiness proof.
- The T2-WU02 verdict `QUALIFIED_WITH_FINDINGS` is reproduced as the worker's recorded verdict and its
  commander disposition. This packet does not re-adjudicate, upgrade, or downgrade it, and does not
  convert it into a PASS.
- No lane's worker self-report is converted into an approval. Every lane record carries
  `worker.trusted: false`.
- T2 is **not reviewed**: R1 Codex review has not run. T2 is **not committed** and **not merged**;
  Draft PR #2 remains unmerged.
- No Owner decision is made or inferred by this packet.
- No migration file was created by any T2 unit; no `.sql` file exists at `0009_*`.
- **No database was contacted** at any point in T2; applied database state was never inspected, so
  every database statement in this packet is a statement about migration source at
  `407130718646d13630b9789f68522a521fc74483`, not applied truth.
- No production mutation of any kind occurred.
- F1 remains open. Nothing in the T2 test results closes F1; F1 is a migration-text defect outside the
  scope of the six implementation files and the new test file.
- Mac parity remains `MAC_PARITY_UNVERIFIED`.
- The `invocation.stdout_excerpt` of `evidence-t2-wu03.json` is stored truncated (8,192 of 10,567
  bytes), so this packet can only reproduce the portion the record contains; the absence of a
  statement here is not evidence that the source record lacks it.
- T2-WU03's lane verdict was not present in the run ledger at the revision this packet describes; the
  ledger lists `T2-WU03` and `T2-WU04` under `not_reached`. This packet records that fact rather than
  asserting a verdict for that lane.
- No secret store was read by this work unit, and no secret value appears in this packet.
- No file other than this packet was created or modified by this work unit, and no commit or push was
  performed.
- This packet deliberately does not embed its own sha256: any embedded value would be invalidated by
  the act of writing it. The packet's measured sha256 and byte count are reported in the `t2-wu04`
  lane work result alongside the path, for revision binding.
