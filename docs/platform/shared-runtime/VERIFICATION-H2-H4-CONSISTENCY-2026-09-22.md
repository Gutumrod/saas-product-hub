# VERIFICATION — H2 / H4 CONSISTENCY

Date: 2026-09-22
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Author: Claude (Windows) — Lane-B controller
Authority: `OWNER-DECISION-LANE-B-PRE-A1-REMEDIATION-2026-09-22.md` §2, §3.C
Status: `CONTROLLER DRAFT — AWAITING CODEX INDEPENDENT REVIEW`
Mutation: none. No H4 object was applied, and no LAB access was made.

## 1. Question

Do the current H4 brief, forward/rollback SQL, probe harness, token-issuance path and
teardown preserve the H2 boundary (product roles `NOLOGIN`, no reusable product DB
LOGIN, execution through the platform lane, H4 tests only product-available
interfaces)? This is a re-verification, not a redesign. Retracted finding A4 is not
re-opened.

## 2. Inspected — exact revision

Repo `github.com/Gutumrod/saas-product-hub`, branch `work/house-h3d-h5-20260909`,
`2b1af861aa608f08abb0bd8224821b9ca5ac9981`. The H4 files were last changed at
`7ab7b6c` and are unchanged in the reviewed range `d6707c0..2b1af86`.

| File | Role |
|---|---|
| `docs/platform/shared-runtime/DESIGN-H2-SHARED-RUNTIME-ISOLATION-EXECUTION-BOUNDARY-2026-09-08.md` | boundary definition (§Security Invariants 1–10, §H4) |
| `docs/platform/shared-runtime/BRIEF-H4-DISPOSABLE-PRODUCT-PROOF-2026-09-09.md` | H4 execution design |
| `docs/platform/shared-runtime/migrations/h4_disposable_product_forward.sql` | forward |
| `docs/platform/shared-runtime/migrations/h4_disposable_product_rollback.sql` | rollback / teardown |
| `tools/shared-runtime/h4/h4-probe-harness.mjs` | Data API probe harness |
| `tools/shared-runtime/h4/h4-privilege-snapshot.sql` | privilege snapshot |
| `docs/platform/shared-runtime/evidence/H4-DISPOSABLE-PRODUCT-PROOF-2026-09-09.md` | evidence template |
| `docs/platform/shared-runtime/OPERATOR-ACTION-PACK-H3D-TO-H5-2026-09-09.md` §H4 | operator sequence |

## 3. Verdict against each H2 requirement

| H2 requirement | Result | Evidence |
|---|---|---|
| Product runtime role `NOLOGIN` (inv. 2) | **HOLDS** | forward: `CREATE ROLE h4_runtime NOLOGIN NOINHERIT … NOBYPASSRLS`; post-check raises on `rolcanlogin`. |
| Product migration role `NOLOGIN` (inv. 3) | **HOLDS** | same for `h4_migrator`. |
| No reusable product DB LOGIN credential (inv. 1) | **HOLDS** | no `PASSWORD` clause anywhere in H4 SQL; harness env takes only `H4_RUNTIME_JWT` / `H4_EXPIRED_JWT` / publishable key; evidence template row "direct DB login … no credential exists". |
| Migrations are platform-executed proposals (§Migration Execution Boundary) | **HOLDS** | forward and rollback assert `current_user = 'postgres'`; positive migrator proof is `SET ROLE h4_migrator` from the platform session, not a product credential. Under `CREDENTIAL-STRATEGY-LANE-B` these run as class P in the SQL editor. |
| Token authority is House-owned (§Token Authority, inv. 4–5) | **HOLDS** | separate `h4_runtime_token_grants` (owner-only, `SELECT` to `supabase_auth_admin`) + `h4_custom_access_token_hook` caps `exp` ≤ 5 min and refuses a login-capable/privileged target role. No signing material leaves the platform. |
| Exposure limited (inv. 6) | **HOLDS** | only `h4_probe` added to exposed schemas; teardown restores the exact prior string. |
| Exact operation grants (inv. 7) | **HOLDS** | post-check: `h4_runtime` EXECUTE count = 1, direct table writes = 0. |
| No dynamic schema/SQL/role at the boundary (inv. 8) | **HOLDS** | both functions have fixed bodies and pinned `search_path`. |
| H4 tests only product-available interfaces (§H4) | **HOLDS** | runtime probes are Data API calls with an Auth-issued token; metadata/`SET ROLE` checks are labelled platform-admin evidence, as H2 permits. |
| Teardown preserves the boundary | **HOLDS, with G-H4-2 below** | rollback drops hook → grant table → membership → schema → roles, asserts zero residue and that the ps01 H3C contract and the 3-EXECUTE `ps01_line_runtime` boundary are intact. |

**Conclusion: the current H4 design preserves the H2 NOLOGIN boundary.** No
contradiction exists and none is recorded. H4 must not be redesigned around a direct
product DB LOGIN.

## 4. Real gaps found during re-verification

None of these breaks H2. Each would stall or weaken H4 when it runs, so each is
recorded as a finding with a bounded remediation. None is fixed in this unit; they are
scheduled before `OWNER-CP-H4`, not before `OWNER-CP-H3D-A1`.

### G-H4-1 — MEDIUM — token-issuance path exists only as prose

Operator pack §H4 step 4: "provision H4 Auth identity + `h4_runtime_token_grants` row
+ token (analogous to the H3D runner path)". No tool implements this. The harness
consumes `H4_RUNTIME_JWT` but nothing produces it, and the grant row can be inserted
only by the platform `postgres` session (owner-only by design). This is the
"requirement discovered at the gate" pattern of `ANALYSIS` A1.

Remediation (before `OWNER-CP-H4`): a runbook that splits the step by credential class
— grant-row INSERT/DELETE as a class-P SQL-editor file; identity create/delete and
token issuance by an agent tool using class A, with the same ledger, teardown-on-every-
path and ≤ 300 s token rules as the H3D runner; token passed to the harness through a
minimal child env only.

### G-H4-2 — MEDIUM — forward and rollback are not atomic under `psql -f`

Neither file sets `\set ON_ERROR_STOP on` or wraps in `BEGIN … COMMIT`, and the
operator pack runs them with `psql -f`. Under psql defaults each statement autocommits
and psql continues past errors, so a failed post-check leaves the forward partly
applied, and the rollback's `REVOKE h4_runtime FROM authenticator` errors if the role
is already absent. Contrast: the H3D seed uses `\set ON_ERROR_STOP on` + `BEGIN`.

H2 is not breached — the roles are created `NOLOGIN` on the first statements — but
partial state is exactly what H3F would flag as unexplained drift.

Remediation: `\set ON_ERROR_STOP on` + single transaction for the forward; for the
rollback, guard each step on existence (`DO` blocks) so it is safe on partial state.
Note that under class P (SQL editor) the editor already runs a batch in one
transaction; the fix is still required because the pack names `psql -f`.

### G-H4-3 — LOW — privilege snapshot narrower than the forward post-check

`h4-privilege-snapshot.sql` checks `migrator_foreign_usage` on `ps01`, `local_service`,
`mt01` only, and `runtime_migration_insert` for `h4_runtime` only. The forward
post-check additionally covers `ps01_internal`, `mt01_private`,
`wstera_platform_internal`; nothing in the snapshot checks `h4_migrator` INSERT on
`supabase_migrations.schema_migrations`, which H2 names ("no product-local CLI can
write the global migration ledger"). The evidence template covers it as a manual SQL
row. Remediation: add the missing booleans so the snapshot, not a manual row, carries
the claim.

### G-H4-4 — sibling of `F-CATALOG-PROVENANCE`

`h4-privilege-snapshot.sql:18` stamps `'project_ref', 'ykxlqnshaaxmzzocpjlj'` as a
literal, exactly as `catalog-manifest.mjs:174` does. Handled by the root-cause fix in
the B brief (finding 2 covers every literal-stamped provenance field), not separately.

## 5. Standing boundary for later stages

- H4 remains class P for DDL and grant rows; the agent never holds `postgres`.
- `h4_runtime` / `h4_migrator` inherit the managed `PUBLIC` cron/net write (H1, F10 of
  the credential strategy). H2 already classifies this as platform-metadata fact, not
  product reachability, because no product-controlled channel addresses those
  surfaces. It stays an open H1 item, not an H4 failure.
- H4 hard stop unchanged: if any step turns out to need a direct DB LOGIN for a
  product role, STOP.
