# DESIGN H2 — Shared Runtime Isolation Execution Boundary

**Date:** 2026-09-08 (Asia/Bangkok)
**Owner:** WSTERA Owner
**Authority:** WSTERA House / Shared Runtime Platform
**Status:** `LOCKED FOR H3 PREPARATION / NO LIVE MUTATION BY THIS DOCUMENT`
**H1 checkpoint:** `5ca6176` — `docs(platform): record H1 effective privilege inventory`
**Current platform verdict:** `FAIL / REMEDIATION REQUIRED`

## Source-of-Truth References

1. `docs/platform/shared-runtime/BRIEF-SHARED-RUNTIME-PLATFORM-ISOLATION-REMEDIATION-2026-09-08.md`
2. `docs/platform/shared-runtime/evidence/H1-EFFECTIVE-PRIVILEGE-INVENTORY-2026-09-08.md`
3. `docs/platform/shared-runtime/evidence/H1-READONLY-INVENTORY-QUERIES-2026-09-08.sql`
4. `docs/platform/shared-runtime/ADR-SHARED-RUNTIME-MIGRATION-CONFIG-AUTHORITY-2026-09-08.md`
5. `docs/platform/shared-runtime/REPORT-BK01-JUNCTION-A-PLATFORM-ISOLATION-HANDOFF-2026-09-08.md`
6. PS01 contract: `products/PawSpace-pssr02-staging/docs/PS01-SHARED-RUNTIME-ISOLATION-CONTRACT-2026-09-07.md`
7. PS01 direct DB candidate: `products/PawSpace-pssr02-staging/lib/ps01-runtime-db.ts`
8. PS01 PostgREST/JWT prototype: `products/PawSpace-pssr02-staging/lib/ps01-runtime.ts`
9. Supabase pg_net docs: `https://supabase.com/docs/guides/database/extensions/pg_net`
10. Supabase JWT signing keys: `https://supabase.com/docs/guides/auth/signing-keys`
## Problem

H1 proved that strict isolation cannot be obtained by product-specific grants alone while Supabase-managed `pg_net` grants schema/object/function authority to `PUBLIC`.

The managed `net` owner is `supabase_admin`. WSTERA `postgres` is not superuser, is not a member of `supabase_admin`, and does not own `net`. Therefore a design that depends on an ordinary House migration rewriting managed ACLs is not an enforceable baseline.

The present PS01 direct database path makes the managed default materially relevant because `ps01_runtime_login` is a real LOGIN identity with a configured credential and a pooler-based application path.

## Decision

**WSTERA will neutralize managed `PUBLIC` capabilities at the execution boundary instead of making managed ACL mutation a prerequisite for shared-runtime admission.**

Canonical shared-runtime product identities are NOLOGIN Postgres roles. Product applications and product repositories do not receive direct database LOGIN credentials.

Managed ACL narrowing may still be pursued later as defense-in-depth if a supported Supabase-owned procedure is proven. It is not the dependency for the current H3 path.

## Supersession of Earlier Login Assumption

The 2026-09-08 migration/config ADR previously targeted an independently rotatable product migration LOGIN. H1 proves that a generic direct product database LOGIN is unsafe under the current managed `PUBLIC` privilege surface.

Therefore, for shared WSTERA LAB/Production, this H2 design supersedes only that login portion:

- product migration group roles remain NOLOGIN;
- product runtime roles remain NOLOGIN;
- no future `bk01_migrator_login` is created while this design governs;
- existing `ps01_runtime_login` is transitional and must be retired after replacement runtime proof.
## User / Stakeholder

The boundary serves every WSTERA product sharing one Supabase project. Product teams must be able to build and operate their own product without receiving a database credential capable of reaching another product or a managed shared surface.

The platform team remains the trusted authority for project-global configuration, managed extensions, database roles and release execution.

## Architecture

```text
Product server / worker
        |
        | HTTPS + publishable API key
        | short-lived JWT: role=<product_runtime_role>
        v
Supabase API Gateway / PostgREST
        |
        | SET ROLE to NOLOGIN product role
        | only exposed schemas / granted RPCs
        v
Product-owned RPC surface
        |
        +-- product schema only
        +-- tenant checks / RLS / bounded SECURITY DEFINER where required

NO direct product DB login
NO product-owned pooler credential
NO net schema in Data API exposed set
```

PostgREST's `authenticator` remains the direct database LOGIN. Product roles are selected from verified JWT claims and remain NOLOGIN.

Supabase documents that the JWT `role` claim selects the Postgres role and that externally minted JWTs can be accepted when signed by a configured signing key. Supabase also documents that `net` is not exposed by the Data API under the normal configuration.
## Runtime Role Shape

A runtime role must be operation-specific where practical, not merely product-wide.

For the current PS01 Customer LINE vertical slice, target a new NOLOGIN role:

`ps01_line_runtime`

Its initial authority is limited to:

- `USAGE` on schema `ps01`;
- `EXECUTE` on exactly the customer gateway RPCs required by the LINE Booking V2 path;
- no direct table DML unless separately proven necessary;
- no `ps01_internal` access;
- no BK01 / MT01 schema access;
- no database/public `CREATE`;
- no `BYPASSRLS`, `CREATEDB`, `CREATEROLE` or role administration.

Initial RPC allowlist is derived from the current source:

1. `ps01.get_customer_booking_context_v2_internal(...)`
2. `ps01.quote_customer_booking_v2_internal(...)`
3. `ps01.submit_booking_request_v2_internal(...)`

The exact signatures must be refreshed from live metadata before H3 grants. Names alone are not sufficient execution evidence.

## Token Authority

A product does not receive the project signing private key or legacy JWT secret.

House owns token minting/signing authority. Product servers receive only short-lived bearer tokens scoped by the `role` claim and expiration.

For LAB proof, a token may be minted by a House-controlled operator process without persisting signing material in the product repository. For Production, token issuance must be automated through a platform-owned issuer with rotation and audit.
## Migration Execution Boundary

Product repositories no longer receive a direct migration LOGIN credential in the shared project.

A product migration is a **proposal artifact**, not self-executing authority. The product owns:

- product-local migration source;
- product-local version/checksum identity;
- product-local ledger contract;
- rollback/forward-fix intent;
- product tests and expected schema signature.

House owns live execution. Before apply, House creates/reviews the exact platform execution artifact and records its source product SHA.

The existing product-local ledger remains useful to prove independent product history, but the connection that writes to LAB is platform-controlled.

This removes the failure mode where a product repository holding a direct DB credential can run arbitrary SQL that inherits managed `PUBLIC` capabilities.

A future automated product-local runner may return only after either:

1. managed shared ACLs are safely narrowed so its role is technically unable to reach those surfaces; or
2. a constrained platform migration compiler/executor is implemented that does not accept arbitrary product SQL as executable input.

Static regex/SQL validation by itself is not accepted as the final enforcement boundary.

## Data / Ownership Contract

No product data is moved by H2.

Existing ownership remains:

- BK01 application schema: `local_service`;
- PS01 application schema: `ps01`;
- PS01 internal schema: `ps01_internal`;
- MT01 schemas: `mt01`, `mt01_private`;
- managed/shared schemas remain platform/Supabase-owned.
## H3 Workflow

H3 must use a replacement-first sequence so PS01 is not broken merely to make the isolation matrix look cleaner.

### H3A — Pre-mutation refresh

- rerun H1 role/ACL/global baseline queries;
- capture exact live signatures/counts;
- refresh the three PS01 customer RPC signatures and current grants;
- confirm no Production target is selected;
- confirm House repo and PS01 source worktree SHAs/statuses.

### H3B — Add narrow NOLOGIN Data API role

Platform change creates/configures `ps01_line_runtime` and grants only the exact PS01 gateway authority required by the current LINE path.

Do not disable `ps01_runtime_login` yet.

### H3C — Data API security proof

Using a House-minted short-lived JWT with `role=ps01_line_runtime`, prove:

- intended three RPC flows work;
- direct PS01 table access outside the contract fails;
- `local_service`, `ps01_internal`, MT01, Auth, Storage, cron and net are unreachable through the API contract;
- ungranted PS01 RPCs fail;
- expired/foreign-role/invalid-signature tokens fail closed.

### H3D — Product-path replacement proof

Update the PS01 staging candidate to use the bounded Data API client instead of `lib/ps01-runtime-db.ts` for the Customer LINE path. Run source verification, tests, lint, typecheck/build and live LAB smoke before retiring the direct login.
### H3E — Retire direct product DB login

Only after H3C/H3D PASS:

- change `ps01_runtime_login` to `NOLOGIN`;
- remove its reusable password credential after rollback material is prepared;
- preserve the role temporarily only if needed for audit/rollback identity;
- verify the application no longer depends on pooler login credentials.

Rollback may re-enable the role only with a newly provisioned LAB credential; old password material must not be restored from source control.

### H3F — Re-measure shared surfaces

Rerun the H1 inventory and compare product/shared counts, effective privileges, Data API schemas, Storage, cron, extensions and migration history.

H3 is not PASS if PS01 works but unrelated BK01/MT01/shared surfaces drift unexpectedly.

## Failure Cases

Fail closed if any of the following occurs:

- the Data API cannot select the custom NOLOGIN role safely;
- a PS01 token can invoke any non-allowlisted PS01 operation that exceeds the H3 role contract;
- any exposed function becomes a bridge into `net`, `cron`, Storage metadata or another product;
- token signing requires copying project-wide signing material into PS01 source/runtime;
- retirement of `ps01_runtime_login` breaks the replacement path;
- H3 changes BK01/MT01 ownership/history outside the explicit platform artifact;
- rollback cannot restore the exact pre-H3 signatures;
- any step requires Production mutation.
## Security Invariants

1. A product repository never owns a reusable direct database LOGIN credential for the shared project.
2. Product runtime Postgres roles are NOLOGIN.
3. Product migration owner roles are NOLOGIN.
4. Runtime tokens are short-lived and contain only the intended role claim plus required standard claims.
5. The token signing private key/JWT secret is platform-owned and never copied to a product repository or product runtime.
6. `net`, `cron`, `auth`, `storage`, `extensions` and internal product schemas are not added to Data API exposure merely to simplify a product flow.
7. A runtime role receives exact operation grants, not broad product-schema table authority by default.
8. No product-controlled request may select a schema name, SQL string, function name or role name dynamically at the platform boundary.
9. Product migrations are proposals until accepted into a platform-owned execution artifact.
10. Build/test green cannot override a failed live privilege or negative security probe.

## Managed ACL Hardening Track

H2 does not declare the existing `pg_net` ACL safe. It declares that product execution must not be able to exercise that ACL.

A separate House hardening task may later investigate a Supabase-supported method to narrow `PUBLIC` on `pg_net` and `pg_cron` objects. That work must prove:

- correct extension owner/authority;
- Supabase worker compatibility;
- webhook/pg_net regression behavior;
- extension upgrade/recreate durability;
- rollback;
- no hidden dependency on managed grants.

Do not block H3 execution-boundary remediation on this optional hardening track.

## H4 Disposable Product Proof

H4 must test the architecture through the interfaces actually available to a product, not by granting a platform-admin session to the product merely for the test.
Required disposable-product probes:

- valid product token can perform only its own allowlisted operation;
- token cannot select another exposed product schema;
- token cannot invoke ungranted functions in its own schema;
- requests attempting `net`, `cron`, `auth`, `storage` or internal schemas are rejected because those surfaces are not exposed/authorized;
- no direct DB login credential exists for the disposable product;
- no product-local CLI can write the global migration ledger;
- foreign/expired/tampered tokens fail before product data mutation.

A platform administrator may separately use metadata queries to prove the underlying role still inherits managed `PUBLIC` ACLs; that fact does not count as product reachability when no product-controlled execution channel can address the managed surface.

## H5 Existing Product Regression

PS01 must pass its real application path after the runtime replacement. BK01 and MT01 must remain structurally unchanged except for explicitly documented House-owned global role/config changes.

Required evidence includes:

- PS01 Staff/browser regression;
- PS01 Customer LINE bounded Data API flow;
- PS01 cross-shop denial;
- BK01 existing Booking probe unchanged;
- MT01 schema/count signatures unchanged;
- Storage bucket list unchanged;
- cron/extension signatures unchanged;
- Data API exposed schemas unchanged unless H3 explicitly documents a required change;
- complete rollback evidence.

## Acceptance Criteria for H2

H2 is complete when this design is committed and pushed, with H1 as its immutable evidence input, and no live mutation has occurred during design.

H3 may begin only from this committed design and must follow replacement-first sequencing.

**H2 VERDICT:** `DESIGN LOCKED / ARCHITECTURAL NEUTRALIZATION SELECTED / H3 ELIGIBLE AFTER PRE-MUTATION REFRESH`

**Production:** `LOCKED`
**BK01 Junction A retry:** `LOCKED`
**Direct product DB LOGIN as canonical boundary:** `REJECTED`
