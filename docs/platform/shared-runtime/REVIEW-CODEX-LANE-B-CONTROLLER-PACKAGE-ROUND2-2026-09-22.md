# CODEX REVIEW — LANE-B CONTROLLER PACKAGE — ROUND 2

Reviewed SHA: `47eab10a68844f5e06d7ad13cfdff5683c7bf374`

Round-1 comparison base: `4c3210df7355f639d98fde41da13c8079a6ccf47`

Execution source revision checked: `D:\AI-Workspace\runtime\worktrees\house-h3d-h5-20260909` at `2b1af861aa608f08abb0bd8224821b9ca5ac9981`.

Verdict: **FAIL**

Mutation: **None to the package or execution source.** This new review file is the only deliverable written. The planning worktree remains at the reviewed SHA; no new package SHA exists and nothing was pushed.

## Review basis

The intent is to make the pre-A1 controller package safe to hand to the next agent while preserving the no-LAB boundary. The smallest safe path is to correct the package contradictions and keep live proof deferred to the Owner checkpoint; no live fallback is authorized by this review.

## Round-1 defect dispositions

- **DEFECT-01 — NOT CLOSED:** C records the operator-pack change and narrows the unchanged-range discussion, but still says all six other files last changed at `7ab7b6c`; the table/loop contains seven files, and `DESIGN-H2-SHARED-RUNTIME-ISOLATION-EXECUTION-BOUNDARY-2026-09-08.md` actually has latest commit `c0d95b532ffc447b59cbc72c3cfa5c3cca1a0df8`, not `7ab7b6c` (C:23-47).
- **DEFECT-02 — PARTIALLY CLOSED:** A now acknowledges ownership-level `ps01`/`ps01_internal` reach and managed-surface exposure, but it does not enumerate all effective H1 reach and contradicts the H3D-LIVE direct grant to `wstera_platform_internal.runtime_token_grants` (A:47-85,119; H1:35-42,136-140).
- **DEFECT-03 — CLOSED:** A no longer claims M is project-wide read-only; it explicitly records inherited `cron`/`net` write exposure as accepted, bounded, and re-measured (A:55-65,103-110).
- **DEFECT-04 — PARTIALLY CLOSED:** The harmful `ROW EXCLUSIVE` lock on a product table was replaced by metadata inspection, but the check tests only `INSERT`, while the remaining forbidden-reach probe still uses live `LOCK TABLE ... ACCESS SHARE` (A:214-216).
- **DEFECT-05 — PARTIALLY CLOSED:** The exact disable/enable statements, transaction rollback, and STOP/no-P fallback are now explicit (A:217), but the probe is not fully harmless or bounded: `ALTER TABLE` can hold an exclusive table lock during the transaction and the snippet supplies no lock/statement timeout or guaranteed error-path rollback handler.
- **DEFECT-06 — PARTIALLY CLOSED:** A adds explicit H3D-LIVE and H4 cleanup sequences and cites the H4 rollback order, but the H3D claim that the sequence matches the runner is false: the runner cleans Auth identities and grant rows concurrently in `Promise.allSettled`, before the operator disables the hook (runner:534-555,918-924; A:136-165).
- **DEFECT-07 — CLOSED:** B now requires a same-schema/different-project control and a second control that fails a constant/hardcoded provenance implementation; it also keeps real-project variation explicitly deferred to A1 without literal fallback (B:140-168).
- **DEFECT-08 — CLOSED:** B requires a complete measured object, rejects absent/null/wrong-type/malformed/inconsistent count/hash values, and adds malformed-success negative controls that cannot produce a residue match (B:192-216).
- **DEFECT-09 — CLOSED:** C accurately records G-H4-5, cites the unchanged operator-pack actor contradiction, and explicitly forbids an agent from running H4 SQL under the current contract without modifying the operator pack in this unit (C:70-88,143-174; operator pack:154-170).
- **DEFECT-10 — CLOSED:** F7 now states the finite named `REVOKE` list, the separate `supabase_auth_admin` `SELECT`, and the owner caveat, matching the forward SQL (A:27; `h4_disposable_product_forward.sql`:83-95).

## New defects introduced by REV2

### NEW-DEFECT-01 — HIGH — C still contains a false exact-revision provenance claim

File: `docs/platform/shared-runtime/VERIFICATION-H2-H4-CONSISTENCY-2026-09-22.md:34-47`

Defect: The revision correction says “all six other files” last changed at `7ab7b6c`, while the table and verification loop contain seven non-operator files. The claim is also false for the Design file.

Evidence: C:34-47 says all six have last-change `7ab7b6c` and lists `DESIGN-H2-SHARED-RUNTIME-ISOLATION-EXECUTION-BOUNDARY-2026-09-08.md` in the loop. Read-only source verification produced `git log -1 --format='%H %s' -- docs/platform/shared-runtime/DESIGN-H2-SHARED-RUNTIME-ISOLATION-EXECUTION-BOUNDARY-2026-09-08.md` → `c0d95b532ffc447b59cbc72c3cfa5c3cca1a0df8 docs(platform): lock H2 isolation execution boundary`. The seven files are unchanged in `d6707c0..2b1af861`, but they do not all have the same last-change commit.

Impact: The exact-revision evidence section remains internally false and can cause a reviewer to bind the H2/H4 table to the wrong historical revision.

Required fix: State separately that the seven non-operator files have no commits in the reviewed range; list each file's actual last-change SHA, or remove the unsupported common-last-change claim. Keep the operator-pack H3D change and unchanged H4 block separately scoped.

### NEW-DEFECT-02 — HIGH — A's effective W boundary contradicts the H3D-LIVE grant and its own forbidden-reach gate

File: `docs/platform/shared-runtime/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md:67-85,119,214-217`

Defect: A says W does not reach `wstera_platform_internal` and makes that schema a forbidden W surface, but the H3D-LIVE row explicitly grants the same W role `USAGE, SELECT, INSERT, DELETE` on `wstera_platform_internal.runtime_token_grants`.

Evidence: A:77-81 says W does not reach `wstera_platform_internal`; A:119 grants H3D-LIVE W direct access to `wstera_platform_internal.runtime_token_grants`; A:216 repeats that schema as a forbidden-reach W check. H1:35-42 and H1:136-140 also show that the effective boundary needs an explicit object/surface inventory, not only the intended table list.

Impact: H3D-LIVE cannot simultaneously use its required grant-row path and pass the package's forbidden-reach assertion. The effective-boundary statement is false for a named stage, so the credential gate is not executable as written.

Required fix: Make the effective boundary stage-specific. Explicitly include the H3D-LIVE runtime-grant table as the only allowed `wstera_platform_internal` exception for that stage, enumerate the inherited `net` schema/object/function/sequence reach from H1, and make the W forbidden-reach check consume the exact stage allowlist.

### NEW-DEFECT-03 — MEDIUM — the “no real-table write privilege” check tests only INSERT

File: `docs/platform/shared-runtime/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md:214`

Defect: The new metadata probe asserts only `has_table_privilege(current_user, t, 'INSERT') = false`, although the surrounding class contract and F10 evidence concern `INSERT`, `UPDATE`, `DELETE`, and `TRUNCATE` capability.

Evidence: A:41 says M has no intended `INSERT/UPDATE/DELETE/TRUNCATE`; A:214 checks only `INSERT`; H1:57-64 records the managed `net` relations with `SELECT, INSERT, UPDATE, DELETE, TRUNCATE` and sequence authority.

Impact: A role with only UPDATE, DELETE, or TRUNCATE on a forbidden table passes the stated window-open check. The probe therefore does not prove the “no real-table write privilege” claim or the full boundary required for W outside its fixture set.

Required fix: Check all write privileges (`INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, and any separately relevant sequence/function capability) for every enumerated forbidden relation, with stage-specific allowed relations for W; retain the metadata-only/no-live-lock property.

### NEW-DEFECT-04 — MEDIUM — the H3D-LIVE teardown sequence is not the source execution order

File: `docs/platform/shared-runtime/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md:136-150`

Defect: A says its H3D-LIVE sequence “matches the runner's own ledgered `--teardown-only` path”, but the runner's normal `--run` cleanup calls `Ledger.cleanupAll()` and removes Auth identities and grant rows concurrently; `--teardown-only` only performs that resource cleanup and does not disable the hook or wait for token expiry.

Evidence: The runner maps all ledger items through `Promise.allSettled` at `h3d-live-runner.mjs:534-555`, executes that cleanup in the `finally` block at `:918-924`, and its `modeTeardownOnly` registers/deletes only the identity and grant resources at `:981-989`. The operator pack separately disables the hook at step 11 and waits/verifies at step 12 (`OPERATOR-ACTION-PACK-H3D-TO-H5-2026-09-09.md:99-103`). A:141-149 presents disable-hook → identity → grant → wait as if it were the runner's implemented order.

Impact: The strategy can be read as evidence that identity-first, hook-off-first, and ordered teardown are already enforced by the runner when they are not. A failed run may leave the operator with a different cleanup state than this sequence assumes.

Required fix: Separate “required safe operator sequence” from “current runner behavior”. Either update the source runner/pack under an authorized scope, or state precisely that runner cleanup is concurrent and that the operator must disable the hook, run the bounded recovery cleanup, wait for the recorded expiry, and independently verify before fixture teardown.

### NEW-DEFECT-05 — MEDIUM — the trigger capability probe is not operationally harmless under lock contention

File: `docs/platform/shared-runtime/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md:217`

Defect: The probe correctly rolls back persistent DDL state when it completes, but it performs `ALTER TABLE` on the live `ps01.subscription_audit_log` table without a bounded lock/statement timeout or an explicit client-side finally/disconnect guarantee.

Evidence: A:217 issues the disable/enable `ALTER TABLE` statements in a bare `BEGIN ... ROLLBACK` snippet. The real teardown identifies the same table's `ACCESS EXCLUSIVE` locking requirement at `fixtures/h3d-authz-fixture-teardown.sql:182-188`, and its bounded teardown sets `lock_timeout` and `statement_timeout` at `:21-23`. The new probe specifies neither bound.

Impact: A preflight intended as a harmless capability check can wait on or hold an exclusive lock on a live product table. Rollback protects catalog state after completion; it does not make an unbounded lock acquisition harmless.

Required fix: Keep the exact behavioral proof, but add bounded `lock_timeout`/`statement_timeout` and an execution wrapper that guarantees rollback or closes the session on every error path. Record timeout as STOP/UNMEASURED, never as proof that W lacks the capability.

## Review conclusion

The revision closes the original M wording issue, provenance-control design issue, Auth schema-guard issue, operator-pack contradiction recording, and F7 wording issue. It does not yet provide a self-consistent effective privilege contract or trustworthy exact-revision evidence, and the new checks/teardown prose overstates what the real runner and database probes guarantee. Do not release this package to AGY or authorize A1 from this SHA.
