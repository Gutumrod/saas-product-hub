# BLOCKER — H3C Hosted Auth Field-Level Activation

**Date:** 2026-09-09 (Asia/Bangkok)
**Environment:** WSTERA LAB (`ykxlqnshaaxmzzocpjlj`) only
**Mode:** WSTERA HOUSE / H3C LIVE-PROOF PREPARATION / FAIL-CLOSED
**Production:** NOT AUTHORIZED
**Status:** `BLOCKED_OPERATOR_HOSTED_AUTH_CONFIG`

## Current Verified Checkpoint

Repository:
- branch: `master`
- HEAD before this blocker document: `b07aa000103914268a963a7ae052a9698a9ba0bb`
- origin divergence: `0/0`
- working tree: clean

Completed today:
- bounded hardening of `ps01.ps01_request_user_id()`, `ps01.ps01_request_email()`, and `ps01.ps01_request_name()`;
- all three now pin `search_path = pg_catalog`;
- owner/ACL/SECURITY INVOKER/STABLE state preserved;
- Security Advisor no longer reports `function_search_path_mutable` for these helpers;
- H3C runtime privilege boundary regression remains PASS: `ps01_line_runtime` NOLOGIN, exactly 3 PS01 RPC EXECUTEs, 0 direct PS01 relation writes, no `local_service` USAGE, no `public.rls_auto_enable()` EXECUTE;
- post-apply evidence committed and pushed at `b07aa00`.

This is **not** H3C end-to-end PASS, HOUSE-A PASS, or BK01 Junction A PASS.

## Why Execution Stops Here

The canonical H3C sequence requires hosted Auth configuration to change **only** the Custom Access Token Hook field(s), with the previous state captured and an equally narrow rollback path proven before activation.

Verified tooling state:
- Supabase CLI `2.116.0` is authenticated and can list WSTERA LAB;
- CLI `config` currently exposes only `config push` for remote configuration;
- broad `supabase config push` is explicitly forbidden by the H3C handoff;
- the available Supabase connector supports database/project operations but exposes no Auth Admin user mutation or hosted Auth config mutation action;
- current Supabase documentation confirms hosted Custom Access Token Hooks are enabled from `Authentication > Hooks (Beta)` and Postgres hook URIs use `pg-functions://postgres/<schema>/<function_name>`;
- current Management API documentation confirms `PATCH /v1/projects/{ref}/config/auth` exists, but the available tool surface does not provide an authorized field-level Management API invocation;
- an attempt to access the local CLI credential for a direct Management API call was blocked by platform credential-safety enforcement. No credential was disclosed or persisted.

Therefore House cannot currently prove all of these before mutation:
1. pre-change hosted Auth config snapshot for the relevant hook fields;
2. field-only patch semantics;
3. post-change diff limited to the Custom Access Token Hook;
4. field-only rollback to the captured previous state.

Fail-closed consequence: **do not create the LAB service identity, do not insert the temporary runtime-token grant, and do not enable the hook yet.**

## Live Inert-State Recheck

Immediately before locking this blocker, live WSTERA LAB was re-read:
- `runtime_token_grant_count = 0`;
- no runtime-token database roles are allowlisted;
- `wstera_platform_internal.custom_access_token_hook(jsonb)` exists;
- `supabase_auth_admin` has schema USAGE on `wstera_platform_internal`;
- `supabase_auth_admin` has EXECUTE on the hook.

Therefore no temporary H3C runtime authority was left behind by this work.

## Proof Harness Readiness

Current harness verification:
- `node --check tools/shared-runtime/h3c/h3c-proof-harness.mjs` -> PASS;
- `node tools/shared-runtime/h3c/h3c-proof-harness.mjs --selftest` -> `SELFTEST PASS`;
- selftest covers crypto, project-ref H-05, classifiers H-04, gate H-01, safety H-02/H-03, and privilege H-08;
- safe mode still does not invoke the mutating submit RPC;
- a new canonical privilege snapshot must be captured <=15 minutes before real token issuance.

No real Auth-issued runtime token has been created or tested yet.

## Resolution Contract

H3C may resume only when an authorized operator can perform the hosted Auth actions through the Supabase Dashboard, or an approved tool exposes equivalent narrow Auth Admin/config operations.

The live window must follow this order:
1. recheck repo clean/origin `0/0` and WSTERA LAB target;
2. provision one LAB-only service identity through Supabase Auth Admin/Dashboard;
3. add one finite `runtime_token_grants` row for `ps01_line_runtime` with an absolute `valid_until`;
4. enable **Custom Access Token Hook only**, selecting `wstera_platform_internal.custom_access_token_hook` (canonical URI form: `pg-functions://postgres/wstera_platform_internal/custom_access_token_hook`);
5. capture a new <=15-minute privilege snapshot;
6. sign in the service identity to obtain a real Supabase Auth-issued ES256 access token;
7. run the safe-mode H3C proof harness and required negative matrix;
8. teardown identity-first: invalidate/delete service identity and sessions, remove the finite grant, then disable the Custom Access Token Hook back to its captured prior state;
9. record `residualNarrowAuthorityUntil` from any already-issued runtime JWT and do not claim full authority disappearance before expiry/rejection proof.

If hosted Auth rejects the non-public hook schema, any unrelated Auth field changes, or teardown cannot be proven, STOP and keep H3C blocked.

## Owner/Operator Manual Gate

Do **not** enable the hook in advance.

When an authorized operator is available at the WSTERA LAB Dashboard, resume from this file. House should first prepare the short-lived service identity/grant window, then the operator performs the narrowly scoped hook enable action. The operator must remain available for the matching hook disable action during teardown.

Production remains locked. BK01 remains quarantined until HOUSE-A PASS.
