# H3C Final Closure â€” Auth-Issued Runtime Token Proof

**Date:** 2026-09-09 (Asia/Bangkok)
**Environment:** WSTERA LAB (`ykxlqnshaaxmzzocpjlj`)
**Scope:** H3C only
**Current status:** `H3C PASS / CLOSED`

## Final Live Proof

Canonical evidence:
- `H3C-FINAL-LIVE-PROOF-ATTEMPT1-2026-09-09.json` â€” preserved failed attempt used to diagnose classifier/freshness issues.
- `H3C-FINAL-LIVE-PROOF-ATTEMPT2-2026-09-09.json` â€” final safe-mode live proof.
- `H3C-FINAL-PRIVILEGE-SNAPSHOT-2026-09-09.json` - Attempt 1 privilege snapshot; preserved because it became stale before consumption.
- `H3C-FINAL-PRIVILEGE-SNAPSHOT-ATTEMPT2-2026-09-09.json` - fresh privilege snapshot consumed by Attempt 2 (age 1.69 seconds at POS-GRANTS).

Attempt 2 verdict: **PASS**.
- Required probes: 36 PASS.
- Required missing/non-pass: 0.
- `POS-3` remained advisory `RUNTIME-BLOCKED`; mutating submit RPC was not invoked.
- `NEG-ROLE-2` remained advisory `NOT TESTABLE` under the reviewed threat model.
- Runtime JWT: ES256, project-bound, role `ps01_line_runtime`, lifetime 300 seconds.
- Expired-token negative probe passed with HTTP 401 / `PGRST303` after explicit expiry margin.
- Final runtime JWT residual narrow authority ended at `2026-09-09T05:07:00.000Z`.
## Harness Remediation During Live Proof

Attempt 1 exposed two harness-classifier defects and one evidence-freshness issue; it did not expose an architecture privilege escape:
- HTTP 406 / `PGRST106` invalid-schema responses were explicit Data API routing denials but the classifier accepted only 400/401/403/404.
- Storage returned outer HTTP 400 with `AccessDenied` and an embedded 403/permission-denied result; the classifier did not recognize the explicit denial.
- The privilege snapshot exceeded the 15-minute freshness contract before the harness consumed it.

The remediation was documented in `BRIEF-H3C-HARNESS-LIVE-CLASSIFIER-REMEDIATION-2026-09-09.md` and limited to classifier handling/selftests. No DB privilege redesign was performed. Offline selftest passed after the patch.

`NEG-EXP-1` was treated separately as a possible real blocker. The second runner waited 65 seconds beyond JWT `exp`; the expired token was then rejected with HTTP 401 / `PGRST303`.

## Identity-First Teardown

After evidence capture:
- final runtime Auth identity deleted through the supported Dashboard path;
- final control Auth identity deleted through the supported Dashboard path;
- all earlier H3C proof identities independently verified absent;
- `wstera_platform_internal.runtime_token_grants` independently verified at 0 rows;
- hosted Custom Access Token Hook manually disabled in Dashboard by the authorized operator;
- no DB/catalog surface exists in this session to independently read hosted Auth hook configuration, so the hook-disable assertion is explicitly operator-confirmed rather than DB-derived;
- closure waited past the last issued runtime JWT `exp` before claiming residual authority ended.
## Fixture Teardown

Final proof fixtures were removed after runtime authority teardown.

The first exact shop-delete attempt failed closed and rolled back because `subscription_audit_log` is protected by `trg_subscription_audit_immutable` / `SUBSCRIPTION_AUDIT_IMMUTABLE`.

House did not weaken or drop that guard. A bounded maintenance teardown was documented in `H3C-FIXTURE-TEARDOWN-MAINTENANCE-2026-09-09.sql`:
1. disable only `trg_subscription_audit_immutable` inside one explicit transaction;
2. delete only audit rows for the two exact H3C shop UUIDs;
3. re-enable the trigger immediately;
4. delete only the two exact H3C shops and let existing ON DELETE CASCADE FKs remove child fixtures;
5. verify all H3C residue counts are zero before COMMIT.

Operator result and independent DB verification both report zero H3C residue for shops, owners, pets, rooms, rate plans, subscriptions, audit rows, and bookings.

## Post-Teardown Shared-Runtime Signature

Machine-readable evidence: `H3C-FINAL-POST-TEARDOWN-SIGNATURE-2026-09-09.json`.

Verified after teardown:
- `ps01_line_runtime` remains NOLOGIN;
- exactly three Customer LINE V2 PS01 functions are executable;
- direct write-capable PS01 relation grants remain 0;
- `public.rls_auto_enable()` EXECUTE remains false;
- `local_service` schema USAGE remains false;
- `ps01.ps01_request_user_id()` EXECUTE remains false;
- Storage bucket count remains 2;
- cron job count remains 8;
- Data API exposed schemas remain `public, graphql_public, local_service, ps01`;
- proof Auth users = 0 and runtime-token grants = 0.
## Regression / Advisor Close-Out

Linked schema lint was rerun against `ps01,local_service,public,wstera_platform_internal` and returned: **No schema errors found**.

The authorized operator refreshed the Supabase Dashboard Security Advisor at `2026-09-09T07:13:25.833Z` and returned exactly one finding:
- `security_definer_view` / ERROR / EXTERNAL for `local_service.shop_public_profile`.

This finding is the previously known BK01/local_service shared-runtime surface and is not attributed to H3C. No `function_search_path_mutable` finding for the three PS01 request helpers reappeared, and no new H3C/runtime-token/hook finding was reported.

Therefore the mandatory H3C advisor close-out condition is satisfied. The remaining `local_service.shop_public_profile` finding stays open for the subsequent shared-runtime phases and does not constitute HOUSE-A closure.

## Gate Boundary

Even after H3C closes, **HOUSE-A remains OPEN**. Canonical continuation is H3D/H3E/H3F -> H4 -> H5 -> HOUSE-A. BK01 remains quarantined from Junction A retry until a separate durable HOUSE-A PASS exists.

No production environment was touched. No submit mutation was executed. No JWT, password, signing material, service key, or connection string is stored in this evidence.

## Final H3C Verdict

**H3C: PASS / CLOSED.** All required live probes passed, identity-first teardown completed, residual JWT authority expired, proof fixtures and grants were removed, post-teardown signatures match the expected boundary, linked schema lint passed, and the final Dashboard Security Advisor refresh showed no H3C-attributable finding.
