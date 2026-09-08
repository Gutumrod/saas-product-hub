# H3B — Post-Apply PS01 LINE Runtime Boundary Evidence

**Date:** 2026-09-08 (Asia/Bangkok)
**Environment:** WSTERA LAB (`ykxlqnshaaxmzzocpjlj`)
**Mode:** POST-APPLY VERIFICATION / LAB ONLY
**Source checkpoint:** `f668816`
**Applied migration:** `h3_ps01_line_runtime_boundary`
**Status:** `H3B PASS / H3C REQUIRED`

## Source-of-Truth References

1. `docs/platform/shared-runtime/DESIGN-H2-SHARED-RUNTIME-ISOLATION-EXECUTION-BOUNDARY-2026-09-08.md`
2. `docs/platform/shared-runtime/evidence/H3A-PRE-MUTATION-REFRESH-2026-09-08.md`
3. `docs/platform/shared-runtime/migrations/h3_ps01_line_runtime_boundary.sql`
4. `docs/platform/shared-runtime/migrations/h3_ps01_line_runtime_boundary_rollback.sql`
5. H3A/H3B artifact checkpoint `f668816`

## Apply Result

The committed H3B migration was applied through WSTERA platform migration authority to WSTERA LAB only.

Result: `SUCCESS`.

Global migration history moved from 37 to 38 rows exactly as intended. The new latest row is:
- version `20260908122004`;
- name `h3_ps01_line_runtime_boundary`.

Production was not touched.
## Role Boundary Proof

`ps01_line_runtime` now exists with:
- `NOLOGIN`;
- `NOINHERIT`;
- no superuser, CREATEDB, CREATEROLE or BYPASSRLS;
- no database-wide CREATE;
- `USAGE` on `ps01` only among product schemas;
- no CREATE on `ps01`;
- no `local_service`, `ps01_internal`, `mt01`, `auth`, `storage` or `cron` schema USAGE.

PostgREST membership is exact:
- member: `authenticator`;
- granted role: `ps01_line_runtime`;
- `ADMIN=false`;
- `INHERIT=false`;
- `SET=true`.

`ps01_runtime_login` remains `LOGIN=true`. H3B did not retire or alter the replacement source path.

The new role can execute exactly three PS01 functions and no fourth PS01 function:
1. `get_customer_booking_context_v2_internal(character varying, uuid)`
2. `quote_customer_booking_v2_internal(character varying, uuid, uuid, uuid, uuid[], timestamp with time zone)`
3. `submit_booking_request_v2_internal(character varying, uuid, uuid, uuid, uuid[], timestamp with time zone, text)`

Direct write-capable privileges on PS01 relations: `0`.
## Known Managed PUBLIC Privilege Still Present

H3B does **not** claim the underlying Supabase-managed `pg_net` PUBLIC ACL is fixed.

Live effective checks still show:
- `has_schema_privilege('ps01_line_runtime','net','USAGE') = true`;
- `has_function_privilege('ps01_line_runtime','net.http_post(...)','EXECUTE') = true`.

This is the same platform ACL defect identified in H1 and is inherited from `PUBLIC`, not granted by H3B.

The H2 design neutralizes this at the product execution boundary rather than modifying Supabase-owned ACLs blindly. Current Data API exposure remains exactly:

`public, graphql_public, local_service, ps01`

`net`, `cron`, `auth`, `storage`, `extensions`, `ps01_internal` and MT01 internal surfaces were not added.

Therefore H3B alone is not sufficient to declare isolation PASS. H3C must prove with a real Auth-issued `role=ps01_line_runtime` token that the three intended RPCs work and managed/non-product capabilities cannot be exercised through the supported Data API path.

The PS01 trigger function `ps01.sync_booking_occupancy_window()` no longer grants EXECUTE through PUBLIC and is not executable by `ps01_line_runtime`.
## Cross-Product / Shared Regression Proof

Product schema counts and owners are unchanged from H3A:
- `local_service`: postgres / 21 tables / 61 functions / 26 policies / 61 indexes / 35 FKs;
- `ps01`: ps01_migrator / 21 tables / 92 functions / 16 policies / 58 indexes / 32 FKs;
- `ps01_internal`: ps01_migrator / 1 table / 0 functions / 0 policies / 1 index / 0 FKs;
- `mt01`: postgres / 6 tables / 2 functions / 6 policies / 12 indexes / 7 FKs;
- `mt01_private`: postgres / 0 tables / 2 functions / 0 policies / 0 indexes / 0 FKs.

Shared state remains:
- Storage buckets: exactly `deposit-slips` and `ps01-daily-report-photos`;
- Storage bucket count: `2`;
- cron job count: `8`;
- extension count: `8`;
- Data API schemas unchanged.

The only intended global ledger delta is the H3B migration row.

## Security Advisor Check

Supabase Security Advisor was run after H3B. No finding names `ps01_line_runtime` or identifies an H3B-created table/function exposure.

The advisor did expose pre-existing House/BK01/PS01 security findings that are not silently accepted. They are recorded in a separate platform security handoff rather than being mixed into H3B remediation scope.

## Verdict

`H3B PASS / H3C REQUIRED`

No rollback is required from current H3B evidence. The rollback artifact remains ready if H3C or replacement regression proves H3B unsafe.