# BRIEF — H3C PS01 Request Helper Search-Path Hardening

**Date:** 2026-09-09 (Asia/Bangkok)
**Environment:** WSTERA LAB only (`ykxlqnshaaxmzzocpjlj`)
**Mode:** WSTERA HOUSE / H3C PRE-LIVE-PROOF REMEDIATION
**Production:** NOT AUTHORIZED
**Status:** READY FOR COMMITTED ARTIFACT -> LAB APPLY -> LIVE VERIFY

## Source-of-Truth References

1. `AGENTS.md`
2. `docs/platform/shared-runtime/BRIEF-HOUSE-SHARED-RUNTIME-CONTINUATION-HANDOFF-2026-09-09.md`
3. `docs/platform/shared-runtime/BRIEF-H3C-AUTH-ISSUED-RUNTIME-TOKEN-PROOF-2026-09-08.md`
4. `docs/platform/shared-runtime/DESIGN-H2-SHARED-RUNTIME-ISOLATION-EXECUTION-BOUNDARY-2026-09-08.md`
5. `docs/platform/shared-runtime/REPORT-SHARED-RUNTIME-SECURITY-ADVISOR-HANDOFF-2026-09-08.md`
6. `docs/platform/shared-runtime/evidence/H3C-H08-PUBLIC-RPC-BOUNDARY-POST-APPLY-2026-09-08.md`
7. Live WSTERA LAB metadata inspection performed 2026-09-09 before this brief.

## Verified Current State

Live metadata confirms these three PS01 helpers still exist with `proconfig = NULL`:
- `ps01.ps01_request_user_id()`
- `ps01.ps01_request_email()`
- `ps01.ps01_request_name()`

All three are `STABLE`, `SECURITY INVOKER`, owned by `ps01_migrator`, and have no `ps01_line_runtime` EXECUTE grant.
`postgres` is currently a member of `ps01_migrator`; `ps01_migrator` remains NOLOGIN.
The existing function ACLs grant EXECUTE only to `ps01_migrator`, `authenticated`, and `ps01_runtime`.

## Problem

Security Advisor reports `function_search_path_mutable` for these helpers. The current H3C continuation handoff requires them to be fixed before the live Auth-issued token proof if still present.

## Scope

Apply the smallest metadata-only hardening:
- pin each helper to `search_path = pg_catalog`;
- preserve function body, language, volatility, SECURITY INVOKER status, owner, and ACL exactly;
- do not broaden EXECUTE;
- do not alter PS01 tables, policies, data, runtime roles, Data API exposure, or other product schemas.

**Reuse Gate:** `N/A — bounded security remediation preserving existing capability; no reusable capability is introduced.`

## Execution Contract

1. Commit exact forward and rollback SQL before any LAB mutation.
2. Forward migration must fail closed if any helper is missing, overloaded unexpectedly, not owned by `ps01_migrator`, already carries function-local config, or is SECURITY DEFINER.
3. Apply only through House platform migration authority in WSTERA LAB.
4. Re-read live metadata immediately after apply.
5. Re-run Security Advisor and confirm the three mutable-search-path findings are gone without new attributable findings.\n6. Re-run the H3C privilege snapshot checks relevant to the runtime boundary.
7. Record a dated post-apply evidence document before proceeding to Auth identity/hook activation.

## Rollback Contract

Rollback is allowed only from the exact expected post-forward state. It resets only the function-local `search_path` setting and must preserve owner, ACL, body, volatility, and SECURITY INVOKER status.

If any unrelated drift is detected, STOP instead of forcing rollback.

## Acceptance Criteria

PASS only if:
- all three helpers have exact `proconfig = {search_path=pg_catalog}`;
- owner remains `ps01_migrator`;
- ACLs remain byte-for-byte equivalent to the pre-apply metadata;
- all three remain SECURITY INVOKER and STABLE;
- `ps01_line_runtime` still has no EXECUTE on these helpers;
- the H3B/H-08 runtime boundary remains unchanged;
- Security Advisor no longer reports these three mutable-search-path findings;
- no Production target is touched.

## Next Authorized Action

Create, review, commit, and push the exact forward/rollback migration artifacts. Only after the repository is clean at that checkpoint may House apply the forward migration to WSTERA LAB and capture post-apply evidence.
\n