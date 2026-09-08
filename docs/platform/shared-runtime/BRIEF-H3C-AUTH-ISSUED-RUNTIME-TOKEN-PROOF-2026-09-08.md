# BRIEF — H3C Auth-Issued Runtime Token Proof

**Date:** 2026-09-08 (Asia/Bangkok)
**Environment:** WSTERA LAB only (`ykxlqnshaaxmzzocpjlj`)
**Mode:** WSTERA HOUSE / SHARED-RUNTIME H3C
**Parent:** `DESIGN-H2-SHARED-RUNTIME-ISOLATION-EXECUTION-BOUNDARY-2026-09-08.md`
**H3B evidence:** `evidence/H3B-POST-APPLY-RUNTIME-BOUNDARY-2026-09-08.md`
**Status:** `PREPARE SUPPORT -> PROVE ISSUANCE -> PROVE DATA API NEGATIVE MATRIX`

## Goal

Prove a real Supabase Auth-issued ES256 access token with PostgreSQL `role=ps01_line_runtime` can execute only the three H3B Customer LINE RPCs through the exposed `ps01` Data API surface.

The proof must not copy the project signing private key, legacy JWT secret, direct database password, or project-wide service credential into PS01 source/runtime.

## Locked Facts

- H3B role exists as NOLOGIN.
- PostgREST `authenticator` has SET-only membership in `ps01_line_runtime`.
- `ps01_line_runtime` has exactly three PS01 function grants and zero direct PS01 table-write grants.
- managed `PUBLIC` still gives the role DB-level `net` privileges.
- `net` is not in the Data API exposed schema set.
- `ps01_runtime_login` remains enabled until H3C/H3D pass.

## Source References

- H1 privilege inventory + query pack.
- H2 execution-boundary design.
- H3A pre-mutation refresh.
- H3B migration/rollback + post-apply evidence.
- Supabase Custom Access Token Hook and JWT documentation.
## H3C Support Architecture

Create a House-owned internal namespace:

`wstera_platform_internal`

Initial contents:
- `runtime_token_grants` — House-controlled allowlist keyed by Supabase Auth user UUID;
- `custom_access_token_hook(event jsonb)` — PostgreSQL Auth Hook function.

The namespace is not added to Data API exposure. PUBLIC and product roles receive no schema access.

The hook is deliberately `SECURITY INVOKER`, not SECURITY DEFINER. `supabase_auth_admin` receives only the schema/function/table read privileges required to evaluate the allowlist.

No allowlist row exists after support migration. Therefore merely creating the support objects changes no user token and grants no product runtime authority.

For the initial H3C slice the table accepts only `database_role = 'ps01_line_runtime'`. Expansion to another runtime role requires a reviewed platform migration rather than arbitrary text insertion.

For an enabled, unexpired allowlist row the hook:
- keeps required Auth claims;
- replaces only JWT `role` with the reviewed NOLOGIN database role;
- caps the issued access-token `exp` to five minutes from hook execution if the original expiry is longer.

All non-allowlisted Auth users receive their original role/expiry unchanged.
## Execution Sequence

### H3C-1 — Commit support artifacts
- exact forward migration;
- exact rollback migration;
- no secrets or generated user IDs;
- House repo clean and pushed before LAB mutation.

### H3C-2 — Apply inert support migration
- create internal platform schema/table/hook function;
- do not enable Auth Hook configuration;
- do not insert an allowlist row;
- re-run schema/global/shared regression checks and Security Advisor.

### H3C-3 — Provision LAB-only service identity
Use a supported Supabase Auth Admin/Dashboard path. Do not insert directly into `auth.users` and do not reuse a human/customer account.

Record only the service user UUID in House evidence. Credentials remain outside source control and outside product runtime.

### H3C-4 — Add temporary House allowlist grant
Insert the service UUID into `wstera_platform_internal.runtime_token_grants` with:
- role fixed to `ps01_line_runtime`;
- enabled=true;
- finite `valid_until` for the LAB proof window.

### H3C-5 — Enable the Custom Access Token Hook
Use hosted Auth configuration field-level authority only. Broad `supabase config push` remains forbidden because House has no complete canonical project config and CLI has no dry-run.
### H3C-6 — Obtain Auth-issued token and prove claims
From a House-controlled operator path, authenticate the LAB service identity and verify:
- signature validates against WSTERA LAB JWKS;
- issuer is WSTERA LAB Auth;
- `role=ps01_line_runtime`;
- expiry is no more than five minutes after issuance;
- no signing material is present in the product repository/runtime.

### H3C-7 — Data API positive/negative matrix
Positive:
- all three allowlisted PS01 Customer LINE RPCs reach the function boundary with valid inputs/fixtures.

Negative:
- non-allowlisted PS01 RPC fails;
- direct PS01 table mutation/read outside granted API fails;
- BK01 `local_service` direct access fails;
- `ps01_internal` and MT01 surfaces fail;
- `net`, `cron`, `auth`, `storage`, `extensions` cannot be addressed through the Data API route;
- invalid signature, expired token and foreign role fail closed.

### H3C-8 — Disable temporary proof authority
After evidence capture:
- disable/delete the temporary allowlist row;
- revoke/delete the LAB service identity when no longer needed;
- keep or disable the hook according to the next approved product-path integration phase;
- do not retire `ps01_runtime_login` until H3D passes.

## Rollback Order

1. Disable hosted Auth Hook config if enabled.
2. Remove runtime-token grant rows.
3. Revoke hook/table grants from `supabase_auth_admin`.
4. Drop hook/table/platform schema using the committed rollback artifact.
5. H3B role remains unless H3B itself is rolled back separately.
6. Re-run shared-runtime signatures and Security Advisor.