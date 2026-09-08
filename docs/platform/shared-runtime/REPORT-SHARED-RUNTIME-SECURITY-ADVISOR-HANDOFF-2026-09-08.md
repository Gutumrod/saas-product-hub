# REPORT — WSTERA LAB Security Advisor Findings / Shared Runtime Handoff

**Date:** 2026-09-08 (Asia/Bangkok)
**Environment:** WSTERA LAB (`ykxlqnshaaxmzzocpjlj`)
**Mode:** SECURITY EVIDENCE / TRIAGE HANDOFF
**Trigger:** mandatory post-H3B Supabase Security Advisor check
**Status:** `OPEN SECURITY FINDINGS / DO NOT SILENTLY ACCEPT`

## Scope Boundary

This report records advisor findings discovered while verifying H3B. It does not authorize bulk ACL remediation, BK01 feature work, PS01 feature work, Production mutation, or broad Data API config changes.

H3B did not create these advisor findings. H3B created only the NOLOGIN role `ps01_line_runtime`, its SET-only PostgREST membership, exact three PS01 RPC grants, and removal of PUBLIC EXECUTE from one PS01 trigger function.

## Highest-Severity Finding

Supabase Security Advisor reports one `ERROR`:

- `security_definer_view`: `local_service.shop_public_profile` is defined with SECURITY DEFINER semantics.

This is an externally facing BK01/shared-runtime surface because `local_service` is currently exposed by the Data API.

Remediation reference:
`https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view`

This finding requires BK01/platform review before any claim that the currently exposed BK01 Data API surface is hardened.
## SECURITY DEFINER RPC Exposure

Advisor reports externally callable SECURITY DEFINER functions:

- `11` functions callable by `anon` across exposed schemas;
- `46` functions callable by `authenticated` across exposed schemas.

The anonymous set includes multiple `local_service` functions plus `public.rls_auto_enable()`.
Examples include BK01 booking recovery/deposit operations and internal-looking trigger/helper functions. The advisor specifically reports direct Data API RPC routes for these functions.

This is not proof that every listed function is exploitable after its own internal authorization checks. It is proof that the executable surface is broader than the fail-closed shared-runtime posture allows without individual review.

Remediation references:
- `https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable`
- `https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable`

Required follow-up: classify every externally executable SECURITY DEFINER function as intentional public API, authenticated API, trigger/helper-only, or platform/admin-only, then revoke default EXECUTE for anything not explicitly public.
## Additional Advisor Findings

`rls_enabled_no_policy` (`INFO`, 9 tables):
- four `local_service` tables;
- five `ps01` tables.

RLS enabled with no policy is fail-closed for ordinary RLS-controlled callers, but each table still requires intent review so privileged/SECURITY DEFINER paths are understood.

`function_search_path_mutable` (`WARN`, 3 PS01 functions):
- `ps01.ps01_request_user_id`;
- `ps01.ps01_request_email`;
- `ps01.ps01_request_name`.

Remediation reference:
`https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable`

`extension_in_public` (`WARN`, 2 extensions): `pg_net` and `btree_gist`.
This overlaps H1's managed-surface concern and must not be "fixed" by moving a managed extension without Supabase compatibility proof.

Remediation reference:
`https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public`

Auth leaked-password protection is disabled (`WARN`). This is an Auth configuration hardening item, not a database-role remediation.
## Ownership / Next Routing

The findings split into separate owners:

- BK01/local_service executable/view findings: BK01 coordinator remediation under the existing BK01 quarantine; House must verify shared-runtime regression afterward.
- PS01 helper search-path findings: PS01 security remediation, without widening runtime grants.
- `public.rls_auto_enable()` and managed extension exposure: House/platform ownership.
- Auth leaked-password protection: House Auth configuration hardening.

None of these findings authorizes weakening another product boundary or broadening Data API exposure.

## Current Gate Effect

H3B remains valid because its new role is narrow and its direct grants passed verification.

However, **WSTERA Shared Runtime Platform Isolation is not globally PASS** while the pre-existing external SECURITY DEFINER surface remains unreviewed.

BK01 remains quarantined. Production remains untouched.

This report must be referenced by the relevant product/platform remediation work before final shared-runtime admission.
## Post-H-08 Amendment — 2026-09-08

House subsequently proved that `public.rls_auto_enable()` was a custom, non-extension-owned SECURITY DEFINER function exposed through `public`, with effective EXECUTE inherited by `ps01_line_runtime` through PUBLIC.

House applied bounded migration `h3c_public_rls_auto_enable_acl_hardening` after committing exact forward/rollback artifacts.

Post-apply:
- external EXECUTE removed from PUBLIC, `anon`, `authenticated`, and `service_role`;
- `ps01_line_runtime` no longer has effective EXECUTE;
- `postgres` retains EXECUTE;
- event trigger `ensure_rls` remains enabled and bound to the same function.

Security Advisor delta:
- anonymous SECURITY DEFINER executable count: `11 -> 10`;
- authenticated SECURITY DEFINER executable count: `46 -> 45`;
- `public.rls_auto_enable()` no longer appears in either lint.

This amendment does not erase the historical findings above. The remaining BK01/local_service and other shared-runtime findings remain open until separately remediated and verified.