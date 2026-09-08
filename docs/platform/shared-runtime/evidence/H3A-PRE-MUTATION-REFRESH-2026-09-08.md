# H3A — Pre-Mutation Refresh / PS01 Data API Runtime Boundary

**Date:** 2026-09-08 (Asia/Bangkok)
**Environment:** WSTERA LAB (`ykxlqnshaaxmzzocpjlj`)
**Mode:** PRE-MUTATION EVIDENCE / NO PERSISTENT LAB CHANGE
**Parent design:** `docs/platform/shared-runtime/DESIGN-H2-SHARED-RUNTIME-ISOLATION-EXECUTION-BOUNDARY-2026-09-08.md`
**H2 checkpoint:** `c0d95b5`
**Status:** `H3A PREPARED / APPLY BLOCKED UNTIL TOKEN ISSUANCE PATH IS PROVEN`

## Source-of-Truth References

1. `docs/platform/shared-runtime/evidence/H1-EFFECTIVE-PRIVILEGE-INVENTORY-2026-09-08.md`
2. `docs/platform/shared-runtime/DESIGN-H2-SHARED-RUNTIME-ISOLATION-EXECUTION-BOUNDARY-2026-09-08.md`
3. `docs/platform/shared-runtime/migrations/h3_ps01_line_runtime_boundary.sql`
4. `docs/platform/shared-runtime/migrations/h3_ps01_line_runtime_boundary_rollback.sql`
5. PS01 source checkpoint `c21c27c` on `build/ps-sr02-staging-2026-09-06`
6. `products/PawSpace-pssr02-staging/lib/ps01-runtime-db.ts`
7. `products/PawSpace-pssr02-staging/lib/ps01-runtime.ts`
8. `products/PawSpace-pssr02-staging/lib/line-booking-server.ts`
9. Supabase JWT signing keys: `https://supabase.com/docs/guides/auth/signing-keys`

## Repository State

House was clean at H2 checkpoint `c0d95b5` before H3A artifacts were written.

PS01 staging worktree is clean at `c21c27c`, branch `build/ps-sr02-staging-2026-09-06`, and is one commit ahead of its remote branch at this snapshot.

## Live LAB Refresh

PostgreSQL runtime:
- PostgreSQL `17.6` (`server_version_num=170006`).
- target remains WSTERA LAB only.
- `ps01_line_runtime` does not exist before H3B.
- `ps01_runtime_login` still exists and can LOGIN, as required by replacement-first sequencing.

Current product surfaces remain aligned with H1:

| Schema | Owner | Tables | Functions | Policies | Indexes | FKs |
|---|---|---:|---:|---:|---:|---:|
| `local_service` | `postgres` | 21 | 61 | 26 | 61 | 35 |
| `ps01` | `ps01_migrator` | 21 | 92 | 16 | 58 | 32 |
| `ps01_internal` | `ps01_migrator` | 1 | 0 | 0 | 1 | 0 |
| `mt01` | `postgres` | 6 | 2 | 6 | 12 | 7 |
| `mt01_private` | `postgres` | 0 | 2 | 0 | 0 | 0 |

Shared counts remain: Storage buckets `2`, cron jobs `8`, extensions `8`, global migrations `37`.
Latest global migration remains `20260908103450` (`bk01_platform_bootstrap_rollback`).
Data API schemas remain `public, graphql_public, local_service, ps01`.
## Exact PS01 Customer RPC Surface

Live metadata confirms the three intended Customer LINE RPCs are:

1. `ps01.get_customer_booking_context_v2_internal(character varying, uuid)`
2. `ps01.quote_customer_booking_v2_internal(character varying, uuid, uuid, uuid, uuid[], timestamp with time zone)`
3. `ps01.submit_booking_request_v2_internal(character varying, uuid, uuid, uuid, uuid[], timestamp with time zone, text)`

All three are `SECURITY DEFINER`, owned by `ps01_migrator`, and currently executable by `ps01_runtime` only; `anon` and `authenticated` do not have EXECUTE.

A fourth PS01 function, `ps01.sync_booking_occupancy_window()`, still inherited default `PUBLIC EXECUTE`. It is a trigger function bound to `ps01.bookings`, not a product API. H3B therefore revokes its `PUBLIC EXECUTE` so a fresh product role does not inherit an unintended fourth PS01 executable function.

## H3B Artifact Correction

The initial H3B draft used a plain role membership grant to PostgREST `authenticator`. PostgreSQL 17 exposes explicit membership `INHERIT` and `SET` options, so H3B now uses:

`GRANT ps01_line_runtime TO authenticator WITH INHERIT FALSE, SET TRUE;`

The migration self-check requires `SET=true` and `INHERIT=false`, matching the existing Supabase/PostgREST role-switching pattern.
## Token Issuance Finding

WSTERA LAB publishes an ES256 JWKS key and Supabase Auth owns the corresponding signing capability. House does not need, and must not extract, the managed private key or legacy JWT secret.

Supabase documentation confirms a Custom Access Token Hook can alter the required JWT `role` claim before Auth issues the access token, and Data API uses that claim as the PostgreSQL role. This provides a supported path for H3C without copying signing material into PS01.

No existing custom access-token hook function was found in the database, and none of the five current Auth users carry an app/user metadata `role` field. Exact hosted Auth hook configuration remains a platform config action and must be changed field-by-field, not through a broad product `config push`.

Current CLI `config push` has no dry-run mode and House has no canonical full-project `config.toml`; therefore broad config push is rejected for H3.

## H3A Verdict

`H3A PASS / H3B READY`

H3B may add the narrow NOLOGIN role while leaving `ps01_runtime_login` untouched. H3C remains responsible for proving an Auth-issued short-lived `role=ps01_line_runtime` token and the complete negative matrix before any direct DB login retirement.

No persistent LAB mutation was made during H3A.