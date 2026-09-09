# BRIEF — WSTERA House Shared-Runtime Continuation Handoff

**Date:** 2026-09-09 (Asia/Bangkok)
**Mode:** WSTERA HOUSE / SHARED-RUNTIME / BUILD-TO-SELL
**Repo:** `D:\AI-Workspace\projects\saas-product-hub`
**Branch:** `master`
**Checkpoint at handoff:** `7af3e1999d80285ed7c00debf1a26308ec26a545`
**Origin divergence at handoff:** `0/0`
**Working tree at handoff:** clean

## Governing Rule

No canonical brief exists only in chat. Every continuation, remediation, execution plan, gate decision, and handoff must be backed by a durable repo file with evidence references.

Production remains locked unless separately authorized. Shared-runtime work is WSTERA LAB only unless a later durable brief explicitly changes that.

## Current House Objective

Close the remaining H3C live proof safely, then continue H3D/H3E/H3F -> H4 -> H5 -> HOUSE-A so BK01 can retry Junction A.

Build-to-Sell remains the priority. Do not open unrelated Council/research/gates.

## Current Canonical State

Claude H3C independent proof pack Rev2 was accepted as PREPARE-ONLY and merged at `c2765f1`.
House then found H-08: `public.rls_auto_enable()` was callable through an exposed custom SECURITY DEFINER surface.
H-08 was remediated with bounded ACL-only hardening and verified PASS.

Latest House evidence:
- `evidence/HOUSE-REVIEW-CLAUDE-H3C-PROOF-PACK-REV2-2026-09-08.md`
- `evidence/H3C-H08-PUBLIC-RPC-BOUNDARY-POST-APPLY-2026-09-08.md`
- `evidence/H3C-POST-H08-PRIVILEGE-SNAPSHOT-2026-09-08.json`

Latest commits:
- `c2765f1` — merge Claude H3C proof pack Rev2
- `8fa3d75` — harden H3C public RPC boundary
- `7af3e19` — record H3C H-08 hardening proof

H-08 post-apply facts:
- `public.rls_auto_enable()` EXECUTE removed from anon/authenticated/service_role/ps01_line_runtime.
- event trigger `ensure_rls` remains enabled and bound to the same function.
- `ps01_line_runtime` remains NOLOGIN.
- exactly 3 executable PS01 functions remain.
- direct write-capable PS01 relation privileges remain 0.
- no `local_service` schema USAGE for `ps01_line_runtime`.
- Data API schema set unchanged: `public, graphql_public, local_service, ps01`.
- Storage bucket count remains 2; cron job count remains 8.
- `ps01_runtime_login` remains LOGIN and is not yet retired.

## Important Remaining H3C Work

H3C end-to-end live proof has NOT been run.
The next House execution must follow the canonical H3C brief exactly and must remain WSTERA LAB only.

Required sequence before any H3C PASS claim:
1. Re-read `BRIEF-H3C-AUTH-ISSUED-RUNTIME-TOKEN-PROOF-2026-09-08.md` and current House evidence.
2. Reconfirm repo clean / origin 0/0 and LAB-only target.
3. Resolve the three PS01 mutable-search-path helpers before live proof if still present:
   - `ps01.ps01_request_user_id()`
   - `ps01.ps01_request_email()`
   - `ps01.ps01_request_name()`
   Use bounded PS01/platform-approved remediation with fixed `search_path`; do not broaden EXECUTE.
4. Provision a LAB-only Supabase Auth service identity through supported Auth Admin/Dashboard flow; never write `auth.users` directly and never reuse a human/customer identity.
5. Add one finite House allowlist row for `ps01_line_runtime` with concrete `valid_until`.
6. Enable only the Custom Access Token Hook through field-level hosted Auth configuration; broad `supabase config push` is forbidden.
7. Capture fresh privilege snapshot <=15 minutes before token issuance using `tools/shared-runtime/h3c/h3c-privilege-snapshot.sql`.
8. Obtain a real Auth-issued ES256 token and run the safe-mode proof harness + required negative matrix.
9. Teardown identity-first: invalidate service identity/sessions/refresh tokens, then remove/disable grant, then disable hook as authorized.
10. Record `residualNarrowAuthorityUntil` and do not claim temporary token authority is gone before JWT expiry or direct rejection proof.

Default proof mode must remain non-mutating. The submit RPC is advisory/opt-in only and must not be required for PASS.

## H3C Runtime Boundary Facts Already Independently Verified

House SELECT-only verification confirmed `ps01_line_runtime` has exactly the three Customer LINE V2 RPCs and zero direct PS01 table writes.
The live definitions of context/quote enforce LINE-user + shop scoping; quote also validates room/rate-plan/pet ownership and collision constraints.
`submit_booking_request_v2_internal` inserts `booking_requests`; never treat it as a read-only probe.

## Global Shared-Runtime Gate Still Open

H3C success will not by itself close global Shared-Runtime Platform Isolation.
Remaining separately-owned findings include:
- BK01/local_service SECURITY DEFINER surface, including `local_service.shop_public_profile` and broad callable RPCs;
- managed/shared `pg_net` PUBLIC exposure still requiring the agreed execution-boundary treatment / global gate proof;
- remaining Security Advisor findings such as managed/public extensions and Auth leaked-password protection.

Do not silently fix BK01 product-specific blockers from House unless the coordinator returns them as platform defects.

## BK01 State

BK01 reports `PRE-INTEGRATION HYGIENE: PASS` and is waiting on House Junction A only.
BK01 remains quarantined from live shared-runtime integration until HOUSE-A / Junction A platform isolation gate passes.
Do not authorize BK01 schema migration, Order/Claim live integration, or Junction A retry before the House gate is explicitly closed in durable evidence.

After House isolation PASS, BK01 may retry Junction A using its preserved evidence and coordinator plan, provided its own product-specific auth/ownership blocker is also cleared.

## Stop / Fail-Closed Conditions

STOP rather than improvise if hosted Auth rejects the non-public hook schema, if any required proof probe is missing/ambiguous, if any unexpected 5xx is being interpreted as security success, if Auth config diff moves unrelated fields, if a runtime token gains any authority outside the exact boundary, or if rollback evidence cannot prove cleanup.

No Production. No broad config push. No direct signing material. No project-wide service credential in product runtime. No direct `auth.users` writes. No mutation-based security probe unless explicitly approved and disposable.

## Canonical References To Read First In The New Chat

1. `AGENTS.md`
2. `docs/platform/shared-runtime/BRIEF-SHARED-RUNTIME-PLATFORM-ISOLATION-REMEDIATION-2026-09-08.md`
3. `docs/platform/shared-runtime/DESIGN-H2-SHARED-RUNTIME-ISOLATION-EXECUTION-BOUNDARY-2026-09-08.md`
4. `docs/platform/shared-runtime/BRIEF-H3C-AUTH-ISSUED-RUNTIME-TOKEN-PROOF-2026-09-08.md`
5. `docs/platform/shared-runtime/evidence/HOUSE-REVIEW-CLAUDE-H3C-PROOF-PACK-REV2-2026-09-08.md`
6. `docs/platform/shared-runtime/evidence/H3C-H08-PUBLIC-RPC-BOUNDARY-POST-APPLY-2026-09-08.md`
7. `docs/platform/shared-runtime/REPORT-SHARED-RUNTIME-SECURITY-ADVISOR-HANDOFF-2026-09-08.md`
8. `docs/platform/shared-runtime/REPORT-BK01-JUNCTION-A-PLATFORM-ISOLATION-HANDOFF-2026-09-08.md`

## Next Authorized Action

Start the new chat by verifying disk/git state against this handoff. If the checkpoint has moved, inspect every intervening commit before continuing.

Then continue only the minimum work required to make H3C live proof safe and executable. Do not claim H3C PASS, HOUSE-A PASS, or BK01 Junction A PASS without live evidence and a durable gate record.
