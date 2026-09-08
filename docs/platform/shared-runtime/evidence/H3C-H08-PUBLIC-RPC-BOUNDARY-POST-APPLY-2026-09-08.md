# H3C H-08 — Public RPC Boundary Hardening / Post-Apply Evidence

**Date:** 2026-09-08 (Asia/Bangkok)
**Environment:** WSTERA LAB (`ykxlqnshaaxmzzocpjlj`)
**Source checkpoint:** `8fa3d755ce5b936699d9de3e7fd5037a18699a1c`
**Applied migration:** `h3c_public_rls_auto_enable_acl_hardening`
**Status:** `H-08 PASS / H3C LIVE TOKEN PROOF NOT YET RUN`

## Source-of-Truth References

1. `HOUSE-REVIEW-CLAUDE-H3C-PROOF-PACK-REV2-2026-09-08.md`
2. `H3C-PRE-H08-PRIVILEGE-SNAPSHOT-2026-09-08.json`
3. `H3C-POST-H08-PRIVILEGE-SNAPSHOT-2026-09-08.json`
4. `migrations/h3c_public_rls_auto_enable_acl_hardening.sql`
5. `migrations/h3c_public_rls_auto_enable_acl_hardening_rollback.sql`
6. `tools/shared-runtime/h3c/h3c-privilege-snapshot.sql`

## Apply Result

The bounded ACL hardening migration applied successfully through House platform migration authority.

It changed only EXECUTE authority on `public.rls_auto_enable()`; the function was not dropped or altered and the event trigger `ensure_rls` was not disabled.

Post-apply ACL/effective privilege:
- `anon`: EXECUTE = false
- `authenticated`: EXECUTE = false
- `service_role`: EXECUTE = false
- `ps01_line_runtime`: EXECUTE = false
- `postgres`: EXECUTE = true
- function ACL now contains only `postgres=X/postgres`.## Event-Trigger Continuity

`ensure_rls` remains:
- event: `ddl_command_end`
- enabled state: `O`
- owner: `postgres`
- function: `public.rls_auto_enable()`

Therefore the hardening removed external/Data-API caller authority without disabling the existing automatic-RLS event-trigger path.

## H3B Boundary Regression

Fresh post-apply privilege measurement confirms `ps01_line_runtime` remains:
- NOLOGIN;
- exactly 3 executable PS01 functions;
- exactly the three Customer LINE V2 RPCs;
- zero direct write-capable privileges on PS01 relations;
- no `local_service` schema USAGE;
- no EXECUTE on `ps01.ps01_request_user_id()`.

`public.rls_auto_enable_exec` changed from `true` before H-08 to `false` after H-08. No intended PS01 grant widened.

## Shared Runtime Regression

Global migration history moved from `39` to `40` rows exactly as intended.

Latest migration:
- version `20260908143818`
- name `h3c_public_rls_auto_enable_acl_hardening`

Storage bucket count remained `2`; cron job count remained `8`; Data API schema set remained `public, graphql_public, local_service, ps01`; `ps01_runtime_login` remains LOGIN and was not modified.## Security Advisor Delta

Mandatory post-DDL Security Advisor was rerun.

The `public.rls_auto_enable()` finding is gone from both external SECURITY DEFINER execution lints.

Historical -> post-H-08 counts:
- anonymous-callable SECURITY DEFINER functions: `11 -> 10`
- authenticated-callable SECURITY DEFINER functions: `46 -> 45`

The remaining findings are pre-existing and separately owned, including `local_service.shop_public_profile`, BK01/local_service RPC exposure, three PS01 mutable-search-path helpers, managed/public extensions, and Auth leaked-password protection.

## Verdict

**H-08 PASS.** The specific custom SECURITY DEFINER surface that violated the H3C exact-runtime boundary is neutralized without disabling `ensure_rls`.

This does not constitute H3C end-to-end PASS. The remaining H3C proof requires hosted Auth service identity provisioning, finite allowlist authority, hosted Custom Access Token Hook activation, a real Auth-issued ES256 token, and the required live harness matrix.

Production was not touched. BK01 Junction A was not retried.