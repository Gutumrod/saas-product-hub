# CODEX REVIEW — LANE-B CONTROLLER PACKAGE

Reviewed SHA: `4c3210df7355f639d98fde41da13c8079a6ccf47`

Source revision checked: `D:\AI-Workspace\runtime\worktrees\house-h3d-h5-20260909` at `2b1af861aa608f08abb0bd8224821b9ca5ac9981`.

Verdict: **FAIL**

Mutation: **None.** The three controller-package files and the execution worktree were not modified. This review file is the requested deliverable only. No new package SHA exists; the planning worktree remains at `4c3210df7355f639d98fde41da13c8079a6ccf47`.

## Findings

### DEFECT-01 — HIGH — C §2 makes a false unchanged-range claim

File: `docs/platform/shared-runtime/VERIFICATION-H2-H4-CONSISTENCY-2026-09-22.md:20-33`

Defect: C says the listed H4 files were last changed at `7ab7b6c` and were unchanged in `d6707c0..2b1af86`. That is false for the listed `OPERATOR-ACTION-PACK-H3D-TO-H5-2026-09-09.md`.

Evidence: `git log d6707c0..2b1af86 -- docs/platform/shared-runtime/OPERATOR-ACTION-PACK-H3D-TO-H5-2026-09-09.md` returns `2c1ef3a044b0d31ed09efeb0c416583936eb3759`; the diff changes the catalog-manifest command at the file's opening block. The other H4 artifacts in the table do have last-change commit `7ab7b6c471c227b24364b7d92d32ae7bfb421f07`.

Impact: The exact-revision evidence statement is not trustworthy, and the operator pack's changed H4 section is not covered by the stated unchanged-file premise.

Required fix: Narrow the unchanged claim to the five artifacts actually unchanged, explicitly record the operator-pack change, and re-review the current H4 section at `2b1af86`.

### DEFECT-02 — HIGH — W is not the exact “no other schema” boundary claimed

File: `docs/platform/shared-runtime/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md:42,75,90-97`

Defect: W is described as a scoped writer with “No other schema”, but membership in `ps01_migrator` is an ownership-level capability, not a table-only grant. The package does not enumerate or reject the effective reach inherited through that membership.

Evidence: The source teardown performs `ALTER TABLE ps01.subscription_audit_log DISABLE TRIGGER ...` at `docs/platform/shared-runtime/fixtures/h3d-authz-fixture-teardown.sql:185-188`. The H1 evidence records `ps01_migrator` as the owner of `ps01` and `ps01_internal` (`docs/platform/shared-runtime/evidence/H1-EFFECTIVE-PRIVILEGE-INVENTORY-2026-09-08.md:48,100`). The same H1 evidence records managed `net` schema/object authority for PS01 identities (`:55-77`), while the current batch measured new roles inheriting managed `cron`/`net` writes at creation (`BATCH-H3D-S-2026-09-22.md:191-198`).

Impact: A W session can reach at least the PS01 internal ownership surface and the managed PUBLIC surfaces; the stated exact boundary and “no other schema” assertion are false. This is materially broader than the policy's table-DML description.

Required fix: Define the effective boundary, not only direct grants: enumerate `ps01`, `ps01_internal`, `net`, `cron`, and every inherited object privilege; add behavioral/static checks for each forbidden surface; and do not call W table-scoped until that inherited ownership exposure is either explicitly accepted or removed. The trigger-DDL requirement must be separately proven (see DEFECT-05).

### DEFECT-03 — HIGH — M is not actually read-only under the documented platform ACL

File: `docs/platform/shared-runtime/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md:41,63-67`

Defect: M is defined as having no INSERT/UPDATE/DELETE/TRUNCATE anywhere, but the same policy states that every M/W role inherits managed PUBLIC write access to `cron`/`net`. Those statements cannot both be true as effective-privilege claims.

Evidence: The batch measured a newly created role with only intended SELECT grants receiving write privilege on `cron` (one table) and `net` (two tables) through PUBLIC (`BATCH-H3D-S-2026-09-22.md:191-198`). The H1 evidence shows the concrete `net` relation privileges (`docs/platform/shared-runtime/evidence/H1-EFFECTIVE-PRIVILEGE-INVENTORY-2026-09-08.md:57-77`).

Impact: A BYPASSRLS measurement credential is not merely a read-only credential; it has effective managed-surface write capability. Static SQL exclusion and a zero-delta inventory are compensating controls, not privilege removal or proof of no write authority.

Required fix: Rename and describe M as “no product/data writes; managed PUBLIC write exposure remains”, or fail the role gate when those effective writes exist. Record the exact accepted residual exposure and ensure all M tools are constrained and independently checked against it. Keep the BYPASSRLS justification limited to visibility measurement; it is not itself a write-safety argument.

### DEFECT-04 — MEDIUM — The window-open M write probe is not harmless

File: `docs/platform/shared-runtime/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md:127-129`

Defect: The policy probes a real table with `LOCK TABLE ps01.shops IN ROW EXCLUSIVE MODE` and calls the probe harmless because it writes no row. If the guardrail is broken, it still acquires a real table lock.

Evidence: The package's own standing rule requires a negative control to be harmless when it fails (`HANDOFF-LANE-B-SESSION-2026-09-22.md:116-119`). PostgreSQL documents that `ROW EXCLUSIVE` is a real table lock held until transaction end and that it is permitted by INSERT privilege; SELECT-only users are limited to ACCESS SHARE ([PostgreSQL LOCK documentation](https://www.postgresql.org/docs/16/sql-lock.html)).

Impact: A broken guardrail can create lock contention or block conflicting DDL/lock phases on a live PS01 table. A timeout can also be caused by unrelated contention rather than privilege state. This violates the package's own harmless-negative-control rule.

Required fix: Use privilege metadata checks for real-table write privileges and a temporary-table behavioral probe for connection-level read-only enforcement. Do not take a write-mode lock on a live product table as a read-only window preflight.

### DEFECT-05 — MEDIUM — W sufficiency for trigger DDL is asserted, not proven

File: `docs/platform/shared-runtime/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md:104-108,121-129,182-185`

Defect: The runbook assertion checks role attributes, grants, and membership, but does not prove that an inherited W session can perform the required `ALTER TABLE ... DISABLE/ENABLE TRIGGER` operation. The only explicit unresolved assumption is whether postgres can grant membership; that is not the same as proving the operation succeeds.

Evidence: The exact required operation is `ALTER TABLE ps01.subscription_audit_log DISABLE/ENABLE TRIGGER` at `docs/platform/shared-runtime/fixtures/h3d-authz-fixture-teardown.sql:185,188`. The package's proposed closing checks are `has_*_privilege` and `pg_has_role` checks at A `:104-108` and `:182-185`; no trigger-DDL behavior check is specified.

Impact: A1 can reach a fixture teardown that fails after DML or can force an unsafe credential fallback. The package currently has no evidence that W is sufficient for the operation it uses to justify W over P.

Required fix: Add an owner-window, fail-closed capability check for the exact table owner/trigger-DDL path before fixture DML; if it fails, stop without using postgres and route the new credential decision to the Owner. Do not treat membership alone as proof.

### DEFECT-06 — MEDIUM — Per-stage cleanup is incomplete for Auth/grant/token surfaces

File: `docs/platform/shared-runtime/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md:69-83,99-133`

Defect: The policy provides a generic create/teardown order for M/W roles, but does not define the required per-stage teardown order for H3D-LIVE and H4's Auth identities, runtime-grant rows, hooks, and short-lived tokens. Those are explicitly part of the stage credential map.

Evidence: H3D-LIVE includes W plus runtime-grant DML, Auth-admin A, and product token T (`A:75-76`); H4 includes P, A, T, and M (`A:79`). The generic teardown at `A:109-115` only revokes grants/membership, terminates sessions, and drops a database role. The H4 source separately requires Auth-side teardown before SQL rollback (`docs/platform/shared-runtime/migrations/h4_disposable_product_rollback.sql:1-5`), proving that this is a real lifecycle surface rather than an optional detail.

Impact: A later stage can satisfy the role teardown template while leaving an Auth identity, grant row, enabled hook, or unexpired token. That fails the Owner requirement for per-stage revoke/teardown order and can invalidate residue evidence.

Required fix: Add explicit H3D-LIVE and H4 sequences: ledger the identity, delete identity/grant, disable or restore the hook/config, wait past every issued token expiry or prove rejection, then revoke/drop database roles and independently remeasure. Keep P operations Owner-only.

### DEFECT-07 — MEDIUM — Provenance negative controls do not reject a constant database-side identity

File: `docs/platform/shared-runtime/BRIEF-AGY-LANE-B-PRE-A1-FINDINGS-REMEDIATION-2026-09-22.md:118-149`

Defect: The brief requires `databaseRefEvidence` to differ between schema-identical projects, but its negative controls only test a mocked value that differs from recorded LAB. There is no falsification test for a foreign target that returns the same constant/stamped value as LAB.

Evidence: The source at the reviewed SHA emits a literal catalog ref (`tools/shared-runtime/h3d/catalog-manifest.mjs:171-175`) and the runner accepts a seed manifest only by comparing its literal ref to the same constant (`tools/shared-runtime/h3d/h3d-live-runner.mjs:463-478`). The proposed controls at `B:140-149` do not include a two-project “same schema, different database identity” test.

Impact: An implementation can replace the current literal with another constant or a database-side value that is identical across projects, pass the listed mismatch test, and still label a foreign database as LAB.

Required fix: Add an offline two-target fixture/mocked-client test with identical schema/data and different database identities; require evidence to differ and reject constant/fallback values. Keep the live mechanism explicitly `LIVE_DEFERRED_TO_A1_PREFLIGHT` until this proof exists.

### DEFECT-08 — MEDIUM — Auth measurement can pass without a complete measurement object

File: `docs/platform/shared-runtime/BRIEF-AGY-LANE-B-PRE-A1-FINDINGS-REMEDIATION-2026-09-22.md:159-180`

Defect: The brief says to record `count` and `id_set_sha256` and to return `UNMEASURED` for HTTP/body/pagination failures, but it does not require a missing/null count or missing/null hash to be `UNMEASURED`, nor does it define a negative control for that malformed-success case.

Evidence: The residue rule compares both fields at `B:168-169`, while the listed negative controls at `B:174-180` cover 401/403, same-count/different-id, truncation, wrong origin, and output PII, but not missing measurement fields.

Impact: A malformed or vacuous `{ count: null, id_set_sha256: null }` result could compare equal before/after unless the implementation adds an unstated schema guard. The count-plus-hash design is sound only after complete-page and output-schema validation.

Required fix: Make absent, null, wrong-type, empty, or inconsistent `count`/`id_set_sha256` an explicit `UNMEASURED` result; add a mocked malformed-body negative control and assert that no residue comparison can pass without both concrete fields.

### DEFECT-09 — HIGH — C misses the operator-pack actor contradiction for P

File: `docs/platform/shared-runtime/VERIFICATION-H2-H4-CONSISTENCY-2026-09-22.md:35-52`; companion A `:43-44,79`

Defect: C concludes that H4 forward/rollback are platform-lane P operations, but the exact inspected operator pack still tells “Agent” to run both `psql -f` commands.

Evidence: `docs/platform/shared-runtime/OPERATOR-ACTION-PACK-H3D-TO-H5-2026-09-09.md:154-170` says `Agent: psql -f migrations/h4_disposable_product_forward.sql` and later `agent psql -f migrations/h4_disposable_product_rollback.sql`. A says P is executed by the Owner in the SQL editor and that the agent never holds the postgres credential (`A:43-44`).

Impact: The controller package has two incompatible execution authorities. If the operator pack is followed literally, an agent must hold P, violating the credential strategy and the stated H2 execution boundary, even though the SQL itself preserves NOLOGIN.

Required fix: Record this as a real pre-H4 documentation/authority gap and update the later operator sequence to make the Owner/platform SQL-editor actor explicit. Do not dispatch an agent to run those commands under the current contract; the current pre-A1 allowed scope does not authorize silently widening P access.

### DEFECT-10 — LOW — F7 overstates the ACL evidence

File: `docs/platform/shared-runtime/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md:27`

Defect: F7 says `h4_runtime_token_grants` is revoked from “every role except its owner”. The source revokes from a finite named list, grants SELECT to `supabase_auth_admin`, and does not prove an all-roles statement.

Evidence: `docs/platform/shared-runtime/migrations/h4_disposable_product_forward.sql:83-95` shows the table creation, the finite `REVOKE ALL` role list, and the separate `GRANT SELECT` to `supabase_auth_admin`.

Impact: The measured fact is broader than the checked source. It can cause reviewers to assume an ACL property that was not actually asserted for every database role.

Required fix: State the finite named-role ACL exactly, identify the table owner, and add a catalog assertion if the intended invariant is “no non-owner INSERT/UPDATE/DELETE”.

## Claims verified as correct

- The reviewed planning branch is exactly `4c3210df7355f639d98fde41da13c8079a6ccf47`, and the execution source is exactly `2b1af861aa608f08abb0bd8224821b9ca5ac9981`.
- F1 is correct: seed identity/membership assertions are at `h3d-authz-fixture-seed.sql:34-46`; teardown assertions are at `h3d-authz-fixture-teardown.sql:28-31`.
- F2 is correct as to the operation: teardown disables and re-enables the named audit trigger at `h3d-authz-fixture-teardown.sql:185,188`.
- F3 is correct: `assertDbIdentity()` requires `postgres/postgres` at `h3d-live-runner.mjs:361-365`, and is called at `:757,823,942`.
- F4 is correct: Auth Admin POST/DELETE paths are at `h3d-live-runner.mjs:315-328`, and runtime-grant SELECT/INSERT/DELETE paths are at `:343-360`.
- F5 is correct: API-origin validation is only `assertLabTarget()` at `h3d-live-runner.mjs:130-132`; DB clients use the supplied URLs at `:338-342` and `:497-518`, while catalog `withDb` uses `LAB_DB_URL` at `catalog-manifest.mjs:260-266` without database-side LAB provenance.
- F6 is correct: H3E and H4 platform SQL assert `current_user = 'postgres'` and perform role DDL; for example H3E at `h3e_ps01_runtime_login_retirement.sql:14-18,53-54` and H4 at `h4_disposable_product_forward.sql:14-18,32-40`.
- The measured portions of F7 are correct: the H4 grant table is created in the platform lane, application roles are revoked, and `supabase_auth_admin` receives SELECT at `h4_disposable_product_forward.sql:83-95`; the “every role” wording is the overstatement in DEFECT-10.
- F8 is correct as a description of the inventory SQL: it reads `storage.buckets`, `cron.job`, migration history, and `auth.users` at `lab-readonly-inventory.mjs:149-208`. The supplied H3D-S record correctly classifies `auth.users` as `UNMEASURED` rather than a passing zero.
- F9 is supported by the recorded teardown evidence: explicit REVOKEs were required before DROP ROLE and `DROP OWNED BY` was refused in the Supabase environment (`BATCH-H3D-S-2026-09-22.md:259-276`).
- F10 is supported by the measured H3D-S record: newly created roles inherited managed `cron`/`net` write privilege (`BATCH-H3D-S-2026-09-22.md:189-202`). This is also why DEFECT-02 and DEFECT-03 are not merely wording concerns.
- F11 is supported by the recorded measured behavior: pooler options and `ALTER ROLE ... SET` did not enforce read-only, while a probe write succeeded (`ANALYSIS-LANE-B-LONG-RUN-BLOCKERS-2026-09-22.md:160-173`).
- F12 is supported by the H3D-S record: `ps01.commercial_packages = 3`, and a non-BYPASSRLS role could not see the RLS-protected reference row (`BATCH-H3D-S-2026-09-22.md:102-114,145-167`).
- The three remediation findings in B are real and in scope. The stated count-plus-sorted-ID-hash Auth measurement is a sound non-PII residue representation and catches same-count identity substitution (`B:159-169`), provided the completeness/schema controls in DEFECT-08 are added.
- C's H2 conclusions are correct for the SQL boundary itself: H4 creates both product roles as `NOLOGIN` (`h4_disposable_product_forward.sql:31-40`), contains no password clause, uses the platform `postgres` assertion, and its rollback asserts zero H4 residue plus preservation of the PS01 H3C contract and three-execute boundary (`h4_disposable_product_rollback.sql:7-12,28-58`).
- G-H4-1 is real: the operator pack says to provision the identity, grant row, and token, while the harness only consumes `H4_RUNTIME_JWT` (`OPERATOR-ACTION-PACK-H3D-TO-H5-2026-09-09.md:154-166`; `h4-probe-harness.mjs:11-36`).
- G-H4-2 is real: the H4 forward and rollback SQL contain neither `ON_ERROR_STOP` nor an explicit transaction, while the operator pack invokes them with `psql -f` (`OPERATOR-ACTION-PACK-H3D-TO-H5-2026-09-09.md:154-170`; `h4_disposable_product_forward.sql:14-18`; `h4_disposable_product_rollback.sql:1-26`).
- G-H4-3 is real: the snapshot omits several foreign-schema checks and has no `h4_migrator` migration-ledger INSERT check (`h4-privilege-snapshot.sql:25-41`), while the forward post-check covers additional foreign schemas (`h4_disposable_product_forward.sql:151-173`).
- G-H4-4 is real: `h4-privilege-snapshot.sql:16-19` stamps `project_ref` with the LAB literal, matching the sibling literal-stamping defect in `catalog-manifest.mjs:171-175`.

## Final disposition

Do not release this controller package to AGY. Claude must correct the evidence-range claim, reconcile the operator actor, and repair the effective credential-boundary and falsifiability defects above before any implementation dispatch. No live LAB/Auth/role action is authorized by this review.
