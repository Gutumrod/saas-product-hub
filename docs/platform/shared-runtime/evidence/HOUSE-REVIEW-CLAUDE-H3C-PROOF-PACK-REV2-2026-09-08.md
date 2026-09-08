# HOUSE REVIEW — Claude H3C Proof Pack Rev2

**Date:** 2026-09-08 (Asia/Bangkok)
**Environment:** WSTERA LAB (`ykxlqnshaaxmzzocpjlj`)
**Reviewed branch:** `review/claude-h3c-proof-20260908`
**Reviewed Rev2 SHA:** `c34f17e2fef83ff6d694c8ac59ae8724d040f044`
**House master before merge:** `4643bb69446265838cd34a328711b36206b1db59`
**Merge checkpoint:** `c2765f1`
**Status:** `REV2 ACCEPTED AS PREPARE-ONLY / LIVE H3C STILL BLOCKED`

## Source-of-Truth References

1. `HOUSE-REVIEW-CLAUDE-H3C-PROOF-PACK-2026-09-08.md`
2. `BRIEF-CLAUDE-H3C-PROOF-PACK-REMEDIATION-2026-09-08.md`
3. Claude Rev2 seven-file proof pack merged at `c2765f1`.
4. `BRIEF-H3C-AUTH-ISSUED-RUNTIME-TOKEN-PROOF-2026-09-08.md`
5. `H3B-POST-APPLY-RUNTIME-BOUNDARY-2026-09-08.md`
6. Live WSTERA LAB SELECT-only privilege inspection performed during House review.

## Rev2 Disposition

House re-ran `node --check` and `--selftest`; both passed.

H-01 through H-07 are materially remediated:
- required-probe contract prevents false PASS from missing authz/control probes;
- submit RPC is opt-in only and advisory;
- table write probe targets a nonexistent primary key;
- generic 5xx / transport errors cannot count as function-boundary proof;
- project-ref validation no longer trusts configured target URL;
- control JWT receives full signature/issuer/project/expiry validation;
- teardown records residual access-token authority until JWT `exp`.
## House Live Verification Added During Re-review

House did not rely on the Rev2 report alone.

Live SELECT-only inspection confirmed `ps01_line_runtime` currently has:
- NOLOGIN role present;
- exactly `3` executable functions in schema `ps01`;
- exactly the three Customer LINE V2 RPCs;
- `0` direct write-capable privileges on PS01 relations.

House also inspected the live definitions of the three RPCs and the quote helper chain:
- context and quote are read/compute paths with explicit LINE-user + shop scoping;
- quote validates rate-plan/shop/room and pet ownership/collision constraints;
- submit is the only target RPC that inserts a `booking_requests` row.

Therefore safe-mode live proof must never require submit execution.

## New House Finding H-08 — Exposed `public.rls_auto_enable()`

Live effective privilege inspection found:
- `ps01_line_runtime` has `USAGE` on schema `public`;
- `public` is an exposed Data API schema;
- `ps01_line_runtime` has effective `EXECUTE` on `public.rls_auto_enable()`;
- the function is `SECURITY DEFINER`, owner `postgres`, and not extension-owned;
- its ACL grants EXECUTE to PUBLIC, `anon`, `authenticated`, and `service_role`;
- it is attached to enabled event trigger `ensure_rls` on `ddl_command_end`.

This is a real H3C blocker because the runtime JWT would otherwise have a callable custom SECURITY DEFINER surface outside the three PS01 RPCs.
## House Hardening Response

House prepared a bounded ACL-only remediation:
- `migrations/h3c_public_rls_auto_enable_acl_hardening.sql`
- `migrations/h3c_public_rls_auto_enable_acl_hardening_rollback.sql`

The forward migration changes only function EXECUTE ACLs. It does not drop or disable the event trigger and asserts that `ensure_rls` remains enabled and bound to the same function.

House also hardened the proof harness:
- added `tools/shared-runtime/h3c/h3c-privilege-snapshot.sql`;
- `POS-GRANTS` now requires a fresh live privilege snapshot, not prose evidence;
- `NEG-PUB-1` is proven from the snapshot and never invokes the dangerous event-trigger function;
- negative RPC probes use non-mutating targets/methods and no longer rely on HTTP 405 as isolation evidence.

The canonical H3C brief was updated to adopt the corrected identity-first rollback order and residual-JWT rule.

## Gate

Rev2 proof-pack quality: **ACCEPTED**.

H3C live token proof: **BLOCKED until H-08 ACL hardening is applied and verified**.

Global Shared-Runtime Platform Isolation remains separately blocked by the previously recorded BK01/local_service SECURITY DEFINER surface and managed/shared exposure items. This Rev2 acceptance does not close those global findings.
