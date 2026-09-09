# H3C — PS01 Request Helper Search-Path Hardening / Post-Apply Evidence

**Date:** 2026-09-09 (Asia/Bangkok)
**Environment:** WSTERA LAB (`ykxlqnshaaxmzzocpjlj`)
**Source checkpoint:** `8c6f9ea9ec57491e7a6fdfa37fb14f1fe4bab0a0`
**Applied migration:** `h3c_ps01_request_helpers_search_path_hardening`
**Migration version:** `20260909013819`
**Status:** `PASS / H3C LIVE AUTH TOKEN PROOF STILL NOT RUN`

## Source-of-Truth References

1. `BRIEF-H3C-PS01-HELPER-SEARCH-PATH-HARDENING-2026-09-09.md`
2. `BRIEF-HOUSE-SHARED-RUNTIME-CONTINUATION-HANDOFF-2026-09-09.md`
3. `BRIEF-H3C-AUTH-ISSUED-RUNTIME-TOKEN-PROOF-2026-09-08.md`
4. `evidence/H3C-H08-PUBLIC-RPC-BOUNDARY-POST-APPLY-2026-09-08.md`
5. `migrations/h3c_ps01_request_helpers_search_path_hardening.sql`
6. `migrations/h3c_ps01_request_helpers_search_path_hardening_rollback.sql`
7. `evidence/H3C-POST-HELPER-HARDENING-PRIVILEGE-SNAPSHOT-2026-09-09.json`

## Pre-Apply Verification

Live metadata confirmed all three helpers existed with `proconfig = NULL`, were `STABLE`, `SECURITY INVOKER`, owned by `ps01_migrator`, and were not executable by `ps01_line_runtime`.

The pre-apply ACL string for all three was:
`{ps01_migrator=X/ps01_migrator,authenticated=X/ps01_migrator,ps01_runtime=X/ps01_migrator}`.
`postgres` was verified as a member of `ps01_migrator`; `ps01_migrator` remained NOLOGIN.

A first documentation checkpoint `ac9e882` was pushed but contained literal `\n` formatting defects in the newly written artifacts. It was never applied to LAB. Corrective checkpoint `8c6f9ea` repaired the artifacts, was pushed, and restored repo clean/origin `0/0` before any LAB mutation.

## Apply Result

The corrected forward migration applied successfully through House platform migration authority.

It changed only function-local `search_path` metadata for:
- `ps01.ps01_request_user_id()`
- `ps01.ps01_request_email()`
- `ps01.ps01_request_name()`

Post-apply all three have exact `proconfig = {search_path=pg_catalog}`.
Owner remains `ps01_migrator`; each function remains `SECURITY INVOKER` and `STABLE`.
The ACL string remains exactly the pre-apply value and `ps01_line_runtime` still has no EXECUTE on any helper.

The migration ledger added exactly one new row:
- version `20260909013819`
- name `h3c_ps01_request_helpers_search_path_hardening`

## H3C Runtime Boundary Regression

Fresh canonical privilege snapshot at `2026-09-09T01:39:06.372097+00:00` confirms:
- `ps01_line_runtime` remains NOLOGIN;
- exactly 3 PS01 functions are executable, matching the Customer LINE V2 allowlist;
- direct write-capable PS01 relation privileges remain 0;
- `local_service` schema USAGE remains false;
- `public.rls_auto_enable()` EXECUTE remains false;
- `ps01.ps01_request_user_id()` EXECUTE remains false.

Additional shared-surface regression checks:
- Storage bucket count = 2;
- cron job count = 8;
- Data API exposed schemas remain `public, graphql_public, local_service, ps01`.

## Security Advisor Result

The mandatory post-DDL Security Advisor rerun no longer reports `function_search_path_mutable`; the previous three PS01 helper warnings are gone.

Remaining findings are pre-existing/separately owned:
- `security_definer_view`: 1 (`local_service.shop_public_profile`);
- externally executable SECURITY DEFINER functions: anon 10 / authenticated 45;
- `extension_in_public`: 2 (`pg_net`, `btree_gist`);
- RLS enabled/no-policy: 9;
- Auth leaked-password protection disabled: 1.

No new advisor finding was attributed to this hardening.

## Verdict
**PASS — bounded helper search-path hardening is complete in WSTERA LAB.**

This does not constitute H3C end-to-end PASS, HOUSE-A PASS, or BK01 Junction A PASS.

The saved post-hardening privilege snapshot is evidence for this checkpoint only. H3C token issuance still requires a new snapshot captured <=15 minutes before the real Auth-issued token proof.

## Next Authorized Action

Proceed with the remaining H3C live-proof sequence only:
1. provision a LAB-only Supabase Auth service identity through supported Auth Admin/Dashboard flow;
2. add one finite allowlist row for `ps01_line_runtime` with concrete `valid_until`;
3. enable only the Custom Access Token Hook field through hosted Auth configuration;
4. capture a new <=15-minute privilege snapshot;
5. obtain a real Auth-issued ES256 token and run the safe-mode proof harness plus required negative matrix;
6. teardown identity-first and record `residualNarrowAuthorityUntil`.

Production remains locked. BK01 remains quarantined.
