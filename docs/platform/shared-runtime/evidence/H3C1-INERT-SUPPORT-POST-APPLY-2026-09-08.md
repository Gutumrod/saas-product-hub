# H3C1 — Inert Auth Runtime Token Support / Post-Apply Evidence

**Date:** 2026-09-08 (Asia/Bangkok)
**Environment:** WSTERA LAB (`ykxlqnshaaxmzzocpjlj`)
**Mode:** HOUSE PLATFORM / H3C SUPPORT ONLY
**Source checkpoint:** `fc34b5f`
**Applied migration:** `h3c_auth_runtime_token_support`
**Status:** `H3C1 PASS / H3C END-TO-END NOT YET PASS`

## Source-of-Truth References

1. `BRIEF-H3C-AUTH-ISSUED-RUNTIME-TOKEN-PROOF-2026-09-08.md`
2. `evidence/H3C-AUTH-HOOK-ROLE-VALIDATION-2026-09-08.md`
3. `migrations/h3c_auth_runtime_token_support.sql`
4. `migrations/h3c_auth_runtime_token_support_rollback.sql`
5. H3B post-apply evidence and H2 execution-boundary design.

## Apply Result

The committed inert H3C support migration was applied successfully through WSTERA platform migration authority.

Global migration history moved from `38` to `39` rows exactly as intended.
Latest row:
- version `20260908123549`;
- name `h3c_auth_runtime_token_support`.

No hosted Auth Hook was enabled. No service identity was created. No runtime-token grant row was inserted. Production was not touched.
## Platform-Internal Boundary Proof

`wstera_platform_internal` exists with owner `postgres`.

Effective access after apply:
- `supabase_auth_admin`: schema USAGE = true;
- `supabase_auth_admin`: `runtime_token_grants` SELECT = true;
- `supabase_auth_admin`: hook EXECUTE = true;
- `supabase_auth_admin`: INSERT/UPDATE/DELETE on grant table = false;
- `anon`, `authenticated`, `service_role`, `authenticator`, and `ps01_line_runtime`: no platform-internal schema USAGE;
- `service_role` and `ps01_line_runtime`: no grant-table SELECT;
- hook is SECURITY INVOKER (`prosecdef=false`).

The grant table remained empty after apply (`0` rows).

The internal namespace was not added to PostgREST exposure. Current Data API schemas remained:

`public, graphql_public, local_service, ps01`

## Regression Proof

Post-apply product/shared counts matched the H3B baseline:
- `local_service`: 21 tables / 61 functions / 26 policies / 61 indexes / 35 FKs;
- `ps01`: 21 / 92 / 16 / 58 / 32;
- `ps01_internal`: 1 / 0 / 0 / 1 / 0;
- `mt01`: 6 / 2 / 6 / 12 / 7;
- `mt01_private`: 0 / 2 / 0 / 0 / 0.

Shared surfaces remained:
- Storage buckets = 2;
- cron jobs = 8;
- extensions = 8;
- `ps01_runtime_login` remains LOGIN-enabled.

The three H3B Customer LINE RPC signatures remained present and unchanged.

Security Advisor produced no new finding attributable to `wstera_platform_internal` or the H3C support objects. Existing findings remain governed by `REPORT-SHARED-RUNTIME-SECURITY-ADVISOR-HANDOFF-2026-09-08.md`.

## Proof Limitation

The available Supabase SQL connector executes read-only as `supabase_read_only_user`.

Therefore this checkpoint did **not**:
- insert a temporary allowlist row;
- impersonate `supabase_auth_admin`;
- enable the hosted Custom Access Token Hook;
- provision a LAB service identity;
- obtain a real Auth-issued `role=ps01_line_runtime` token;
- execute the H3C Data API positive/negative matrix.

This is an operator/tooling limitation, not evidence that H3C issuance succeeds or fails.

## Verdict

`H3C1 PASS` means only that the inert support layer is present, bounded, and regression-safe at the measured checkpoint.

`H3C END-TO-END` remains **NOT PASS / LOCKED** until real hosted Auth issuance and Data API attack-matrix evidence exist.

No authorization is created here to disable `ps01_runtime_login` or readmit BK01.
