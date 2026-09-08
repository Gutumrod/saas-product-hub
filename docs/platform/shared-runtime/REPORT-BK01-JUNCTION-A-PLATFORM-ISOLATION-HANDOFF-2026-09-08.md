# REPORT — BK01 Junction A Failure / WSTERA Shared-Runtime Platform Handoff

**Date:** 2026-09-08 (Asia/Bangkok)
**Reporter:** BK01 Coordinator / Secretary GPT
**Target owner:** WSTERA House / Shared Runtime Platform
**Environment:** WSTERA LAB (`ykxlqnshaaxmzzocpjlj`)
**Mode:** INCIDENT EVIDENCE + PLATFORM REMEDIATION HANDOFF
**Severity:** HIGH — shared-runtime admission boundary is not enforceably safe

## Executive verdict

BK01 Junction A was executed against WSTERA LAB and **FAILED A2 isolation/regression acceptance**.

The attempted BK01 platform bootstrap was rolled back before any BK01 product-local forward migration was applied. Post-rollback evidence confirms BK01, PS01, MT01 and measured shared surfaces returned to their pre-attempt baseline.

Two distinct blockers were proven:

1. **BK01-specific:** transferring Booking function ownership from `postgres` to `bk01_migrator` broke existing functions that depend on `auth.*`.
2. **Platform-level:** product roles inherit write-capable access to Supabase managed `net` objects through `PUBLIC` ACLs. This exposure is not unique to BK01; it is also present on PS01 roles.

Therefore BK01 remains **QUARANTINED** from forward shared-runtime migrations, while the platform-level isolation claim must be re-evaluated by WSTERA House.
## Source-of-truth references

- Platform ADR: `docs/platform/shared-runtime/ADR-SHARED-RUNTIME-MIGRATION-CONFIG-AUTHORITY-2026-09-08.md`
- BK01 failure evidence: `products/booking/docs/audit/BK01-SHARED-RUNTIME-JUNCTION-A-FAILURE-EVIDENCE-2026-09-08.md`
- BK01 coordinator path: `products/booking/docs/order/BRIEF-BK01-COORDINATOR-BUSINESS-PORTAL-INTEGRATION-MASTER-2026-09-08.md`
- BK01 failure checkpoint commit: `e49f3e2` on `feature/bk-a-v1-contract-remediation`

## Owner rule governing this handoff

A product is admitted to the shared runtime only if it can evolve without unauthorized mutation, privilege reach or collateral damage to other hosted products/shared surfaces.

If BK01 requires weakening another product boundary, taking project-wide authority, or creating collateral delta to PS01/MT01/shared managed surfaces, BK01 fails admission. Completion percentage or sunk implementation cost does not override this gate.

## A0 — refreshed live baseline before mutation

Live global migration history had advanced from the earlier assessment because MT01 independently added four migrations:

- `20260908083054_mt_mp_02_persistence_reference`
- `20260908083145_mt_mp_02_explicit_server_only_deny`
- `20260908083459_mt_mp_02_atomic_claims`
- `20260908084606_mt_mp_02_verification_probe_20260908`

These were identified as MT01 movement, not BK01 movement.
A0 confirmed before BK01 mutation:

- `local_service`: 21 tables, 61 functions, 26 policies, 61 indexes, 35 FKs; owner `postgres`.
- `ps01`: 21 tables, 92 functions, 16 policies, 58 indexes, 32 FKs; owner `ps01_migrator`.
- `ps01_internal`: 1 table; owner `ps01_migrator`.
- `mt01`: 6 tables, 2 functions, 6 policies, 12 indexes, 7 FKs; owner `postgres`.
- `mt01_private`: 2 functions; owner `postgres`.
- Storage buckets: exactly `deposit-slips` and `ps01-daily-report-photos`.
- cron jobs: 8.
- Data API exposed schemas: `public, graphql_public, local_service, ps01`.
- No BK01 FK/function/policy reference into PS01 or MT01 was found.
- `local_service_internal` did not exist.
- `bk01_migrator` / `bk01_migrator_login` did not exist.

The existing BK01 object-level coexistence therefore remained healthy before the bootstrap attempt.

## A1 — platform bootstrap attempt

The reviewed `bk01_platform_bootstrap` was applied through the platform-authorized migration mechanism, not product `supabase db push`.

Immediate post-apply collateral comparison showed no unauthorized PS01/MT01/shared object delta. The global migration ledger increased by exactly one intended platform entry: `bk01_platform_bootstrap`.
## A2 — failure evidence

### Failure 1 — BK01 function ownership regression

The bootstrap transferred 58 ordinary `local_service` functions to `bk01_migrator`, while leaving three known shared-surface functions under `postgres`.

Sixteen BK01-owned functions reference `auth.*`, including authorization/member/admin paths such as:

- `local_service.is_shop_member(uuid)`
- `local_service.has_shop_role(uuid,text[])`
- `local_service.is_platform_admin()`
- `local_service.current_staff_id(uuid)`
- `local_service.cancel_booking(uuid,text)`
- `local_service.approve_booking_deposit(uuid)`
- `local_service.extend_booking_hold(uuid)`
- `local_service.provision_owner_shop(...)`

After ownership transfer, a read-only Booking probe against `local_service.is_shop_member(...)` failed with PostgreSQL `42501 permission denied for schema auth`.

This is a reproduced runtime regression, not a theoretical ACL concern. The current bootstrap cannot be re-applied unchanged.

### Failure 2 — managed `net` privilege leak through `PUBLIC`

A2 privilege inspection showed `bk01_migrator` and `bk01_migrator_login` had write-capable privilege on three `net` objects despite receiving no intended BK01 grant to that managed schema.
Observed writable `net` objects included:

- `net._http_response`
- `net.http_request_queue`
- `net.http_request_queue_id_seq`

The source is the managed schema/object `PUBLIC` ACL, not a BK01-specific grant.

Cross-checking existing product roles proved the same exposure exists for:

- `ps01_migrator`
- `ps01_runtime`
- `ps01_runtime_login`

Therefore this is a **platform isolation defect**. It cannot be honestly closed by changing only BK01 role grants.

PostgreSQL privileges are additive: a product-specific role cannot be made less privileged than privileges already granted to `PUBLIC`. House remediation must therefore address the shared managed-surface privilege model itself or change the product execution architecture so product identities cannot exercise those capabilities.

Do not directly revoke Supabase-managed `PUBLIC` privileges in LAB without compatibility analysis and rollback proof. A platform change that breaks Supabase internals is also a failed remediation.

## Rollback executed

No BK01 product-local migration had been applied, so the reviewed bootstrap rollback was executed immediately.
Rollback verification proved:

- `local_service` owner returned to `postgres`.
- BK01 schema/object metadata signature returned to the exact pre-attempt value.
- `local_service_internal` was removed.
- `bk01_migrator` and `bk01_migrator_login` were removed.
- Booking probe recovered from permission error to normal result.
- PS01 / `ps01_internal` signatures matched A0 exactly.
- MT01 / `mt01_private` signatures matched A0 exactly.
- Storage, cron, extensions, exposed-schema configuration, auth, net, public, realtime and vault signatures matched A0.
- non-BK role and role-membership signatures matched A0.

The platform ledger intentionally retains both audit records:

- `bk01_platform_bootstrap`
- `bk01_platform_bootstrap_rollback`

Do not repair or erase these rows; they are evidence of a failed controlled admission attempt.

## Current product state after handoff

**BK01 existing LAB runtime:** restored to pre-attempt baseline.

**BK01 shared-runtime admission:** `QUARANTINED / FAIL`.

**BK01 forward product-local migration:** LOCKED.

**BK01 Order/Claim live runtime migrations:** LOCKED.
## WSTERA House remediation scope

House owns the platform-level portion only. Required work:

1. Re-audit effective privileges inherited from `PUBLIC` across managed schemas/objects for every current and future product role.
2. Inventory at minimum `net`, `cron`, `storage`, `auth`, `public`, `extensions`, database privileges and executable shared functions.
3. Distinguish privileges required by Supabase internals from privileges that arbitrary product identities can exercise.
4. Design an enforceable product-isolation model that does not rely only on naming conventions or migration SQL validators.
5. Prove the model against PS01 plus a disposable TEST product before BK01 is re-admitted.
6. Preserve platform ownership of global migration history, exposed-schema configuration, roles and managed surfaces.
7. Produce rollback evidence for any platform ACL/role change before using it as a shared-runtime baseline.

### Mandatory negative probes

A product migrator/runtime identity must fail closed when attempting to:

- write another product schema;
- write another product internal schema;
- enqueue/alter shared network work through `net` unless explicitly platform-authorized;
- mutate shared cron state;
- mutate Storage metadata or another product bucket;
- create/alter/drop extensions;
- create roles or change database-wide privileges;
- alter Data API exposed-schema configuration;
- write global Supabase migration history from a product-local runner.
## House acceptance criteria before returning control to BK01

Platform remediation is not complete until evidence proves all of the following:

- PS01 continues to function after the platform change.
- MT01 current runtime is unchanged unless explicitly included in the House change.
- a disposable product identity cannot reach BK01, PS01, MT01 or managed shared surfaces outside its contract.
- effective privileges are measured from the actual login/runtime identity, not inferred from intended GRANT statements.
- shared `PUBLIC` privilege exposure is either removed safely or architecturally neutralized with proven enforcement.
- global migration/config ownership remains platform-only.
- rollback restores exact pre-change signatures.
- no production project is touched during remediation/proof.

Only after House emits a **SHARED-RUNTIME PLATFORM ISOLATION PASS** should BK01 prepare a new Junction A attempt.

## Explicitly outside House scope for this handoff

Do not repair BK01's `auth.*` function ownership model inside the House/platform change. That is BK01 coordinator scope after the platform isolation baseline is fixed.

Do not merge or modify Claude/Codex BK01 safe-lane branches. They remain additive, fail-closed outputs and do not require shared-runtime mutation yet.

Do not open Billing redesign, Council work, LINE redesign or Production deployment from this report.

## Return contract to BK01 coordinator

When House finishes, return:

- platform remediation commit/SHA;
- exact LAB migrations applied;
- pre/post shared-surface signatures;
- effective privilege matrix for product roles;
- negative probe results;
- rollback proof;
- explicit `PASS` or `FAIL` verdict.

Until that return contract exists, BK01 Junction A remains closed and runtime unlock remains denied.
