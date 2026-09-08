# H1 — Effective Privilege Inventory / WSTERA Shared Runtime

**Date:** 2026-09-08 (Asia/Bangkok)
**Environment:** WSTERA LAB (`ykxlqnshaaxmzzocpjlj`)
**Mode:** READ ONLY / EVIDENCE ONLY / NO DDL / NO DML
**Parent brief:** `docs/platform/shared-runtime/BRIEF-SHARED-RUNTIME-PLATFORM-ISOLATION-REMEDIATION-2026-09-08.md`
**Verdict:** `H1 COMPLETE / PLATFORM ISOLATION STILL FAIL / H2 REQUIRED`

## Source-of-Truth References

1. `docs/platform/shared-runtime/ADR-SHARED-RUNTIME-MIGRATION-CONFIG-AUTHORITY-2026-09-08.md`
2. `docs/platform/shared-runtime/REPORT-BK01-JUNCTION-A-PLATFORM-ISOLATION-HANDOFF-2026-09-08.md`
3. `docs/platform/shared-runtime/BRIEF-SHARED-RUNTIME-PLATFORM-ISOLATION-REMEDIATION-2026-09-08.md`
4. `products/booking/docs/audit/BK01-SHARED-RUNTIME-JUNCTION-A-FAILURE-EVIDENCE-2026-09-08.md`
5. PS01 worktree contract: `products/PawSpace-pssr02-staging/docs/PS01-SHARED-RUNTIME-ISOLATION-CONTRACT-2026-09-07.md`
6. PS01 active candidate adapter: `products/PawSpace-pssr02-staging/lib/ps01-runtime-db.ts`
7. Reproducible SELECT-only SQL: `docs/platform/shared-runtime/evidence/H1-READONLY-INVENTORY-QUERIES-2026-09-08.sql`
8. Supabase pg_net docs: `https://supabase.com/docs/guides/database/extensions/pg_net`

## Execution Boundary

H1 used live PostgreSQL metadata queries only. No role, ACL, schema, table, migration, Storage bucket, cron job, extension, Data API configuration or product data was mutated.

No password, API token, service key or connection secret value was read into this evidence. Only role attributes and a boolean indicating whether a password exists were inspected where required.

## Executive Finding

The BK01 incident finding is reproduced and strengthened: WSTERA's current product-role model is not strictly isolated from the Supabase-managed `pg_net` surface.
Three current PS01 product identities inherit `net` access from managed `PUBLIC` ACLs:

- `ps01_migrator`
- `ps01_runtime`
- `ps01_runtime_login`

For each identity, live effective-privilege checks show:

- `USAGE` on schema `net`;
- write-capable authority on both managed `net` relations;
- writable authority on the request-queue sequence;
- `EXECUTE` on all 12 currently installed `net` functions.

This is not an intended PS01 grant. It is inherited from `PUBLIC` and therefore cannot be subtracted with a PS01-specific `REVOKE` while the `PUBLIC` grant remains effective.

## Current Product Role State

| Role | LOGIN | INHERIT | SUPER | CREATEDB | CREATEROLE | BYPASSRLS | Intended purpose |
|---|---:|---:|---:|---:|---:|---:|---|
| `ps01_migrator` | no | no | no | no | no | no | PS01 schema ownership/migration group |
| `ps01_runtime` | no | no | no | no | no | no | bounded PS01 runtime group |
| `ps01_runtime_login` | yes | yes | no | no | no | no | direct server DB/pooler login |

`ps01_runtime_login` is a member of `ps01_runtime` with inheritance enabled. Live metadata confirms the login currently has a password configured, but the password value was not inspected.

No `bk01_*` role exists after the Junction A rollback. No `mt01_*` custom database role exists in the current snapshot.
## Exact `pg_net` Exposure

Live `PUBLIC` ACLs on `net` include:

| Object | PUBLIC authority observed |
|---|---|
| `net._http_response` | `SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER` |
| `net.http_request_queue` | `SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER` |
| `net.http_request_queue_id_seq` | `SELECT, USAGE, UPDATE` |
| schema `net` | `USAGE` |

All 12 installed `net` functions are executable by the three PS01 identities because both schema `USAGE` and function `EXECUTE` are effective.

The callable set includes the externally meaningful operations:

- `net.http_get(...)`
- `net.http_post(...)`
- `net.http_delete(...)`
- `net.worker_restart()`
- `net.wake()`
- response/worker helper functions.

The current installed extension is `pg_net 0.20.3`. PostgreSQL dependency metadata proves the `net` schema, two relations, sequence and functions are extension-owned objects.

## Managed-Surface Reachability Distinction

`cron` also has some `PUBLIC` object privileges: `SELECT` on `cron.job`, and `SELECT/DELETE` on `cron.job_run_details`.

However the PS01 product identities do **not** currently have `USAGE` on schema `cron`. Therefore these object grants are present but not directly reachable through a schema-qualified product-role call in the current state.

H2 must preserve this distinction: an object grant existing is not the same as an effective end-to-end capability.
## Healthy Boundaries Confirmed

All three PS01 identities currently have:

- database `CREATE = false`;
- `public` schema `CREATE = false`;
- `CREATEROLE = false`;
- `CREATEDB = false`;
- `BYPASSRLS = false`;
- no effective write authority to the global Supabase migration ledger;
- no `USAGE` on `local_service`;
- no `USAGE` on `mt01` / `mt01_private`;
- no `USAGE` on `storage` or `auth`.

`ps01_internal` remains owned and usable only by `ps01_migrator` among PS01 product identities.

A search of ordinary functions in currently exposed Data API schemas (`public`, `graphql_public`, `local_service`, `ps01`) found no function definition referencing `net.*`. Therefore no current exposed RPC bridge to `net` was identified.

This does not neutralize the defect for a direct database LOGIN. It only explains why the ordinary Data API path does not automatically expose `net` today.

## Direct PS01 Runtime Path Confirmed from Source

The active PS01 staging worktree deliberately implements a direct database connection for the customer LINE path.

`lib/ps01-runtime-db.ts` creates a server-only Node `pg` pool and fails closed unless the pooler username begins with `ps01_runtime_login.`. It allows exactly three PS01 RPC names and rejects any other requested RPC name.

`lib/env.ts` defines dedicated `PS01_RUNTIME_DB_*` server-only connection fields. The current PS01 isolation contract explicitly identifies the target path as:

`LINE -> Next server -> Supabase pooler -> ps01_runtime_login -> ps01_runtime -> PS01 RPC`

Therefore `ps01_runtime_login` cannot be classified as an irrelevant or dormant architecture artifact merely because no active session was observed during one H1 snapshot.
## Platform Ownership Constraint

Live role/ownership checks show:

- schema `net` owner = `supabase_admin`;
- WSTERA `postgres` is not a PostgreSQL superuser;
- WSTERA `postgres` is not a member of `supabase_admin`;
- WSTERA `postgres` has `USAGE` but not `CREATE` on `net`.

Therefore H2 must not assume an ordinary WSTERA `postgres` migration can reliably take ownership of, rewrite or revoke Supabase-managed `pg_net` ACLs.

The official Supabase `pg_net` documentation explicitly states that `net` grants `USAGE` to `PUBLIC` by default and explains its normal safety assumption: `net` is not exposed by the Data API, while standard `anon` and `authenticated` roles are `NOLOGIN`.

WSTERA's direct `ps01_runtime_login` changes that threat model because it is an actual LOGIN role with a direct database path.

## Current LAB Baseline

The product counts observed during H1 remain aligned with the post-BK01-rollback structural baseline:

| Schema | Owner | Tables | Functions | Policies | Indexes | FKs |
|---|---|---:|---:|---:|---:|---:|
| `local_service` | `postgres` | 21 | 61 | 26 | 61 | 35 |
| `ps01` | `ps01_migrator` | 21 | 92 | 16 | 58 | 32 |
| `ps01_internal` | `ps01_migrator` | 1 | 0 | 0 | 1 | 0 |
| `mt01` | `postgres` | 6 | 2 | 6 | 12 | 7 |
| `mt01_private` | `postgres` | 0 | 2 | 0 | 0 | 0 |

No structural count drift was observed relative to the Junction A rollback evidence.
Shared/global snapshot:

- Storage buckets: exactly `deposit-slips`, `ps01-daily-report-photos`;
- cron jobs: 8;
- installed extensions: 8;
- global Supabase migration rows: 37;
- latest global migration: `20260908103450 bk01_platform_bootstrap_rollback`;
- Data API schemas: `public, graphql_public, local_service, ps01`.

H1 also generated a deterministic metadata hash set for future H1/H3 comparison using the H1 canonicalization algorithm:

- `local_service`: `9561197d666435ef06bfc6e073126b3b`
- `ps01`: `21fc7a0ff2065364d8a08fde40214b4f`
- `ps01_internal`: `d6640c805206b1f3245f44e38acb90b3`
- `mt01`: `15c7c86c663ca7035c6e598c1aa7a6e3`
- `mt01_private`: `deec8450d76f417a1078f266defcad02`

These hashes must not be compared to earlier report hashes unless the hashing/canonicalization algorithm is proven identical. Counts and owners are the cross-document comparison used for this H1 checkpoint.

## Secondary Review Items

One reachable shared `SECURITY DEFINER` routine was identified: `public.rls_auto_enable()` owned by `postgres` and executable through broad ACLs.

Its definition is an event-trigger callback that enables RLS on newly created `public` tables. H1 did not prove that a product identity can invoke it as an ordinary useful escalation path. It is therefore a review item, not classified as a confirmed exploit or blocker from this evidence alone.

No other reachable `SECURITY DEFINER` routine was identified in the inspected managed/shared schemas for the three PS01 identities.
## H1 Verdict

`H1 COMPLETE / PLATFORM ISOLATION FAIL / H2 REQUIRED`

Confirmed blocker:

> A WSTERA product database identity can reach and mutate Supabase-managed `pg_net` state because `PUBLIC` supplies both schema and object/function privileges.

This affects the current PS01 direct runtime LOGIN and would also affect a future BK01 direct migrator/runtime LOGIN unless the platform boundary changes first.

H1 does not authorize a blanket `REVOKE` from `PUBLIC`. The managed owner is `supabase_admin`, and compatibility with Supabase internals plus extension upgrade/recreate behavior must be proven before any ACL change.

## Required H2 Decision

H2 must choose and document an enforceable path before any LAB mutation:

1. **Managed ACL path:** prove a supported way to narrow `pg_net` `PUBLIC` authority, preserve required Supabase/pg_net operation, survive extension lifecycle events, and provide exact rollback; or
2. **Execution-architecture path:** remove direct/raw product database identities and arbitrary product SQL execution from any path where inherited `PUBLIC` capabilities remain reachable.

Static SQL validation alone is not sufficient because the defect exists in effective runtime privileges outside the product migration text.

Until H2 is locked and H3 is explicitly authorized:

- do not create/re-enable BK01 migrator/runtime login roles;
- do not run BK01 Junction A again;
- do not change `pg_net`, `cron`, Storage, Auth or extension ACLs;
- do not promote PS01 direct pooler-login evidence to a platform isolation PASS;
- do not touch Production.
