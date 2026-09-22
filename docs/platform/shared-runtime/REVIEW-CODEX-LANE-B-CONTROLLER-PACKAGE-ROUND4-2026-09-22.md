# CODEX REVIEW — LANE-B CONTROLLER PACKAGE — ROUND 4

Reviewed SHA: `675975b85d4ccb106a39a9d2166b7dbbab70edb0`

Execution source checked: `D:\AI-Workspace\runtime\worktrees\house-h3d-h5-20260909` at `2b1af861aa608f08abb0bd8224821b9ca5ac9981`.

Verdict: **FAIL**

Mutation: **None to the package or execution source.** This new review file is the only requested deliverable written. No LAB, Supabase, Auth, or secret access was performed. Nothing was pushed.

## Review basis

Intent: make the Lane-B credential boundary and its window-open checks executable, non-self-contradictory, and safe to hand to AGY.

The requested diff is confined to `CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md`. The planning worktree was clean at the reviewed SHA, and the execution source worktree was clean at the stated baseline SHA. The JavaScript block in §3a passes a syntax check. The new SQL joins use the correct condition `n.oid = c.relnamespace`; no changed query contains the prior silent-zero-row join defect. The `('r','p','S')` filter is correct for ordinary/partitioned tables plus sequences and excludes indexes/TOAST relations. The W exception query's `('r','p','v','m')` filter is correct only for the table-like objects to which the seven listed table privileges apply; it is not an exhaustive all-relation inventory, as noted below.

## Requested finding dispositions

- **NEW-DEFECT-03 — PARTIALLY CLOSED:** The forbidden-write contract now separates product/data tables from the accepted `cron`/`net` exposure, W's `ps01_internal` ownership reach, and the H3D-LIVE named exception, and it retains all four table write privileges. The separate positive exposure query has a correct join and table/partition/sequence filter, but it is not an exact effective-relation assertion as written; see NEW-DEFECT-09.
- **NEW-DEFECT-05 — PARTIALLY CLOSED:** The probe now has the real `4s` lock timeout and `30s` statement timeout (`fixtures/h3d-authz-fixture-teardown.sql:19-23`), real try/catch/finally code, and safe error classification: `42501` means incapable, `55P03`/`57014` means `UNMEASURED`, and other errors are rethrown. PostgreSQL aborts an open transaction when the client disconnects, so the disconnect fallback reasoning is sound. However, `client.connect()` is outside the try/finally, so the promised unconditional session-termination contract does not cover every connection path; the outer lifecycle guard still needs to be made explicit.
- **NEW-DEFECT-06 — PARTIALLY CLOSED:** The `pg_catalog` enumeration fixes the prior privilege-filtered `information_schema.tables` problem, and its join is correct. It still loses the schema identity by selecting only `c.relname`, so the qualified H3D-LIVE exception cannot reliably match the returned value; it also does not cover sequences/foreign tables despite claiming an exhaustive relation boundary. See NEW-DEFECT-08.
- **NEW-DEFECT-07 — CLOSED:** The revised write-check prose excludes `cron`/`net`, W's accepted `ps01_internal` ownership reach, and the stage-specific H3D-LIVE exception while retaining all four checks for forbidden `ps01` tables outside the fixture DML set. The separate positive exposure check has an independent defect (NEW-DEFECT-09), but it does not reintroduce NEW-DEFECT-07's self-contradiction.

## Further NEW-DEFECT findings

### NEW-DEFECT-08 — MEDIUM — H3D-LIVE relation checks cannot identify the exception relation reliably

File: `docs/platform/shared-runtime/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md:265`

Defect: The catalog query returns only `c.relname`, but the following contract compares `r` to the qualified value `wstera_platform_internal.runtime_token_grants` and passes `r` to `has_table_privilege`. A bare name is resolved through the session `search_path`; it is not the relation identified by the `pg_namespace` join.

Evidence: the query is `SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace ...`; the exception branch is `r = 'wstera_platform_internal.runtime_token_grants'`. Therefore a conforming H3D-LIVE result returns `runtime_token_grants`, not the qualified string. The exception can fail to match, or a same-named relation on the search path can be checked instead.

Impact: H3D-LIVE can be stopped even when the exact allowed table has the documented privileges, or the check can evaluate a different relation. The gate does not prove the advertised exact boundary.

Required fix: return `c.oid` plus `n.nspname`/`c.relname`, or return a safely qualified identifier, and call `has_table_privilege` with the relation OID or an explicitly qualified relation. Keep the seven table-privilege assertions on the resolved relation, and enumerate sequences/foreign tables separately if the contract continues to say “every relation.”

### NEW-DEFECT-09 — MEDIUM — the accepted-exposure positive query is not an exact reachable-relation assertion

File: `docs/platform/shared-runtime/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md:263`

Defect: The new positive query enumerates every `r/p/S` relation in both schemas and selects only `relname`, while the expected set is the four qualified relations `net._http_response`, `net.http_request_queue`, `net.http_request_queue_id_seq`, and `cron.job`. It therefore mixes catalog presence with effective reach and cannot perform an exact schema-qualified set comparison as written.

Evidence: the H1 inventory records `cron.job_run_details` as an existing relation with PUBLIC object grants, but also records that PS01 identities have no `USAGE` on schema `cron`, so that object is not currently reachable (`docs/platform/shared-runtime/evidence/H1-EFFECTIVE-PRIVILEGE-INVENTORY-2026-09-08.md:81-85`). The query's `n.nspname IN ('cron','net') AND c.relkind IN ('r','p','S')` will nevertheless enumerate `cron.job_run_details` and treat it as an extra relation against the four-item documented set. Selecting only `relname` also loses the namespace and permits same-name ambiguity.

Impact: the accepted-surface gate cannot pass against the documented baseline, or it can compare the wrong notion of exposure. This prevents a real positive assertion that the accepted effective relation set is exactly the one documented in §1a.

Required fix: choose and state one contract: for effective reach, return schema-qualified relation identity and filter/assert the relevant schema/object privileges (including the schema `USAGE` distinction); for catalog-surface inventory, include every catalog relation in the documented baseline and do not call it effective reach. In either case compare qualified identities as a set, retaining `r/p/S` for table/partition/sequence rows and excluding `i/I/t` indexes/TOAST from this table/sequence check.

## Final disposition

The round-4 edits close NEW-DEFECT-07 and materially improve NEW-DEFECT-05/06, but the H3D-LIVE gate still has an unqualified relation identity and the accepted-exposure positive assertion still conflates catalog objects with effective reach. Do not release this controller package to AGY. Claude must correct the remaining contract defects and provide a new exact revision for review.
