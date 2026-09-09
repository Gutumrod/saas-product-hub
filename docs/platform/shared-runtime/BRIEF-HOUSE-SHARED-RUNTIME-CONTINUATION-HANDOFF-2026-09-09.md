# BRIEF â€” WSTERA House Shared-Runtime Continuation Handoff

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

H3C is now PASS / CLOSED. Continue H3D/H3E/H3F -> H4 -> H5 -> HOUSE-A so BK01 can retry Junction A only after the separate House gate closes.

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
- `c2765f1` â€” merge Claude H3C proof pack Rev2
- `8fa3d75` â€” harden H3C public RPC boundary
- `7af3e19` â€” record H3C H-08 hardening proof

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

## H3C Closed State

H3C end-to-end live proof is **PASS / CLOSED** in WSTERA LAB.

Canonical final evidence:
- `evidence/H3C-FINAL-LIVE-PROOF-ATTEMPT1-2026-09-09.json` — preserved failed diagnostic attempt;
- `evidence/H3C-FINAL-LIVE-PROOF-ATTEMPT2-2026-09-09.json` — final live matrix PASS;
- `evidence/H3C-FINAL-PRIVILEGE-SNAPSHOT-ATTEMPT2-2026-09-09.json` - fresh privilege snapshot consumed by the final matrix;
- `evidence/H3C-FINAL-POST-TEARDOWN-SIGNATURE-2026-09-09.json` — post-teardown boundary signature;
- `evidence/H3C-FINAL-CLOSURE-2026-09-09.md` — durable H3C closure record;
- `evidence/H3C-FIXTURE-TEARDOWN-MAINTENANCE-2026-09-09.sql` — exact bounded fixture teardown.

Final H3C facts:
- 36 required harness probes PASS; no required missing/non-pass probes;
- mutating submit RPC remained disabled/advisory;
- final runtime token was Auth-issued ES256 with `ps01_line_runtime` and 300-second lifetime;
- expired-token rejection PASS after explicit expiry margin;
- proof Auth identities = 0 and runtime-token grants = 0 after identity-first teardown;
- hosted Custom Access Token Hook disabled by authorized operator after proof;
- final residual JWT authority expired before teardown closure;
- proof fixtures/subscriptions/audit/bookings independently verified at zero residue;
- post-teardown role/API/storage/cron signatures match the expected H3C boundary;
- linked DB schema lint returned `No schema errors found`;
- final Dashboard Security Advisor refresh reported only the pre-existing `local_service.shop_public_profile` SECURITY DEFINER view and no H3C-attributable finding.

The next authorized House work is H3D/H3E/H3F. Do not rerun H3C unless later evidence shows regression.

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

Then continue with the minimum authorized H3D/H3E/H3F work required by the shared-runtime isolation program. H3C is closed; do not claim HOUSE-A PASS or BK01 Junction A PASS until H3D/H3E/H3F -> H4 -> H5 are complete with durable evidence.
