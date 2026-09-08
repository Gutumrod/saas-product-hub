# BRIEF — WSTERA Shared Runtime Platform Isolation Remediation

**Date:** 2026-09-08 (Asia/Bangkok)
**Owner:** WSTERA Owner — final authority
**Executor:** WSTERA House / Shared Runtime Platform
**Mode:** PLATFORM REMEDIATION PLAN / LAB ONLY / EVIDENCE-FIRST / FAIL-CLOSED
**Current verdict:** `SHARED-RUNTIME PLATFORM ISOLATION = FAIL / REMEDIATION REQUIRED`
**BK01 status:** `QUARANTINED / Junction A runtime unlock denied`

## Source-of-Truth References

1. `docs/platform/shared-runtime/ADR-SHARED-RUNTIME-MIGRATION-CONFIG-AUTHORITY-2026-09-08.md`
2. `docs/platform/shared-runtime/REPORT-BK01-JUNCTION-A-PLATFORM-ISOLATION-HANDOFF-2026-09-08.md`
3. `docs/platform/SHARED_SAAS_RUNTIME_PROJECT_B_PLAN.md` — historical architecture context; authority is superseded where the 2026-09-08 ADR says so.
4. `products/booking/docs/audit/BK01-SHARED-RUNTIME-JUNCTION-A-FAILURE-EVIDENCE-2026-09-08.md`
5. `products/booking/docs/order/BRIEF-BK01-COORDINATOR-BUSINESS-PORTAL-INTEGRATION-MASTER-2026-09-08.md`
6. BK01 failure checkpoint: `e49f3e2` on `feature/bk-a-v1-contract-remediation`.
7. House platform authority checkpoint before this brief: `5af466f`.
8. Root governance: `AGENTS.md`, including the 2026-09-08 Documentation-First Brief Rule.

No chat summary overrides these documents. If evidence conflicts, stop and resolve the conflict in a dated repository document before mutation.

## Owner Decision Locked by This Brief

Before any new shared-runtime mutation, House must make the repository clean, preserve audit evidence, and execute remediation in explicit phases. BK01 must not repair platform-managed isolation defects from its product lane.
## Verified Current State

- WSTERA LAB is the non-production shared-runtime proving ground.
- BK01 Junction A failed after a controlled platform bootstrap attempt and was rolled back before any BK01 product-local forward migration.
- Post-rollback signatures returned BK01, PS01, MT01 and measured managed/shared surfaces to their pre-attempt baseline.
- BK01-specific blocker: transferring selected `local_service` function ownership to `bk01_migrator` broke existing `auth.*`-dependent runtime behavior.
- Platform blocker: product roles inherit write-capable access to Supabase managed `net` objects through `PUBLIC` ACLs.
- The `net` exposure is also observable on PS01 product roles, so strict platform isolation is not currently proven.
- The existing Project B plan already states that project-wide secrets and managed/shared surfaces carry shared blast radius; the 2026-09-08 ADR now additionally locks platform-global vs product-local mutation authority.
- Production has not been authorized for this remediation.

## Problem

The platform currently has a policy-level product boundary that is stronger than the effective PostgreSQL privilege boundary. A product identity can inherit capabilities from shared `PUBLIC` ACLs even when its product-specific GRANT statements appear narrow. Therefore intended grants alone cannot be used as proof of isolation.

## User / Stakeholder

Primary stakeholder is the WSTERA Owner. Secondary stakeholders are every product coordinator whose product may coexist in the same Supabase runtime. The platform must protect one product from another without requiring product teams to understand or own project-global Supabase internals.

## Scope

House owns only the platform-level isolation model: effective privilege discovery, managed-surface compatibility analysis, platform role/ACL or execution-boundary remediation, disposable-product proof, unrelated-product regression proof, and rollback evidence.
## Explicitly Out of Scope

- Repairing BK01 `auth.*` function ownership behavior.
- Implementing BK01 Order or Claim runtime migrations.
- Changing PS01 or MT01 product-domain ownership, schema contracts, or histories.
- Billing redesign, Council work, LINE redesign, or product feature work.
- Production SQL, production deployment, production secret changes, or production ACL experiments.
- Weakening a product boundary merely to make a gate pass.

## Architecture Contract

1. Platform-global authority owns global migration history, Data API exposed-schema configuration, custom role creation, managed `auth`/`storage`/`cron`/`net`/extensions changes, database-wide privileges, and global resource registry.
2. Product-local authority owns only its admitted product namespaces, bounded product migration ledger/lock, and explicitly approved shared interfaces.
3. A product identity must not gain mutation capability solely because `PUBLIC` or another shared role grants it transitively.
4. Effective privilege must be measured from the actual login/runtime identity, including inherited role memberships and `PUBLIC` grants.
5. A managed-surface remediation is invalid if it breaks required Supabase internal behavior.
6. No product repository may repair, absorb, or independently control project-global migration history.

## Data / Evidence Contract

Each phase must preserve machine-readable or reproducible evidence for:
- roles and memberships;
- schema/object owners;
- effective privileges;
- function EXECUTE visibility;
- managed-surface ACLs;
- Data API exposed schemas;
- global migration history;
- Storage buckets and metadata signatures;
- cron jobs;
- extension set/versions;
- BK01, PS01 and MT01 schema signatures;
- rollback signatures.
## Execution Workflow

### Phase H0 — Housekeeping, Freeze, and Checkpoint

Status for this brief: `COMPLETE BEFORE REMEDIATION`.

- Preserve the failed 2026-09-03 Council run as audit-only evidence rather than deleting it.
- Preserve current Billing, PS01 strategy, shared-runtime authority, and BK01 handoff documents in Git history.
- Remove or archive agent scratch that is not canonical evidence.
- Keep active nested product worktrees intact and prevent them from contaminating the parent repository status.
- Remove filesystem junk that has no evidence value.
- Fetch origin, verify divergence, and do not mix unrelated files in broad staging commands.
- Create and push a reviewed documentation checkpoint before H1.

**Exit:** parent House repo clean, audit artifacts preserved, no product worktree destroyed, and the remediation brief is committed/pushed.

### Phase H1 — Effective Privilege Inventory — READ ONLY

No ACL, role, schema, config, migration, or data mutation is allowed in H1.

Inventory effective capabilities for every current product migration/runtime/login identity plus platform/shared roles. At minimum cover `net`, `cron`, `storage`, `auth`, `public`, `extensions`, database privileges, executable shared functions, role memberships, and schema privileges.

Evidence must distinguish direct GRANT, role inheritance, ownership, and `PUBLIC` inheritance.
**H1 required output:** an effective privilege matrix showing `ALLOW`, `DENY`, source of privilege, and tested identity for each sensitive surface.

**H1 hard stop:** if effective privilege cannot be measured safely with read-only metadata access, stop and document the blocker. Do not infer safety from intended SQL.

### Phase H2 — Isolation Design Lock — NO LIVE MUTATION

Use H1 evidence to design the smallest enforceable correction. Evaluate managed `PUBLIC` ACL compatibility first, then role/execution architecture if safe ACL narrowing cannot be proven.

The design must specify:
- exact privileges/capabilities being removed, retained, or relocated;
- Supabase/internal identities that require each retained capability;
- product identities affected;
- migration/rollback mechanism owned by the platform lane;
- negative probes that prove the design;
- expected pre/post signatures;
- failure and rollback triggers.

Do not issue a blanket `REVOKE ... FROM PUBLIC` because it looks cleaner. A design that breaks Supabase internals is a failed design.

**Exit:** dated design document reviewed against H1 evidence before any ACL/role mutation.

### Phase H3 — Bounded LAB Platform Remediation

Apply only the reviewed H2 platform change in WSTERA LAB through the platform-global migration authority. No product-local runner may apply this change.
Before apply, capture exact H0/H1 baseline signatures. After apply, compare every declared shared/product surface and stop immediately on unexplained collateral delta.

### Phase H4 — Disposable Product Negative-Probe Gate

Create a disposable TEST product identity and namespace under the platform lane. Do not use BK01 as the first proof identity.

The disposable identity must fail closed when attempting to:
- write BK01 `local_service` objects;
- write PS01 or `ps01_internal` objects;
- write MT01 or `mt01_private` objects;
- enqueue or alter `net` work without explicit platform authorization;
- mutate shared cron state;
- mutate Storage metadata or another product bucket;
- create/alter/drop extensions;
- create roles or change database-wide privileges;
- alter Data API exposed-schema configuration;
- write global Supabase migration history from a product-local runner.

Also prove its own explicitly granted product-local migration operation succeeds. Denying everything is not a valid product-runtime design.

### Phase H5 — Existing Product Regression + Rollback Proof

After negative probes pass, verify PS01 remains functional and its measured signatures are expected. Verify MT01 is unchanged unless an explicit House change included it. Re-check BK01 baseline without attempting its quarantined bootstrap.
Rollback must be executed or rehearsed with enough evidence to prove exact restoration of the declared pre-change signatures. A rollback script that has not been verified is not sufficient evidence.

### Junction HOUSE-A — Shared-Runtime Platform Isolation Gate

House may emit `SHARED-RUNTIME PLATFORM ISOLATION: PASS` only when H1-H5 evidence is complete and no unexplained collateral delta remains.

Required gate evidence:
- platform remediation commit/SHA;
- exact LAB platform migrations applied;
- effective privilege matrix before and after;
- disposable-product positive and negative probe results;
- PS01 regression evidence;
- MT01 unchanged evidence or explicitly scoped delta;
- BK01 baseline preservation evidence;
- shared-surface pre/post signatures;
- rollback proof;
- explicit `PASS` or `FAIL` verdict.

A green application test suite without privilege and live isolation evidence cannot close HOUSE-A.

## Failure Cases / Stop Conditions

Stop rather than improvise if a required change would mutate another product's domain/history, require a product repo to control global migration history, expose a project-wide secret to an untrusted runtime, weaken RLS to compensate for role problems, or touch production.

Stop if a managed Supabase capability cannot be safely narrowed without breaking required internals. Record the blocker and redesign the execution boundary instead of hiding the privilege.
## Security Requirements

- Fail closed on unknown or unmeasured privilege paths.
- Measure actual login/runtime identities, not only NOLOGIN group roles.
- Treat ownership, membership, function SECURITY DEFINER behavior, `PUBLIC`, and database/schema defaults as privilege sources.
- Do not log passwords, connection strings, service keys, tokens, or secret values in evidence.
- Use secret names only where an inventory is required.
- Keep all remediation in WSTERA LAB until a separate production authorization exists.
- Preserve evidence of failed controlled attempts; do not rewrite migration history to make a failure disappear.

## Acceptance Criteria

This remediation program is complete only when:
1. House repository and evidence trail remain clean and traceable.
2. Effective privileges are documented for every current product role relevant to the shared runtime.
3. A disposable product can mutate only its approved product-local boundary.
4. Cross-product and managed-surface negative probes fail closed.
5. PS01 continues to function after the platform change.
6. MT01 remains unchanged unless explicitly included in the reviewed change.
7. BK01 remains quarantined until House returns a platform PASS.
8. Global migration/config authority remains platform-only.
9. Rollback returns the measured baseline exactly or within an explicitly documented expected signature change.
10. No production environment is touched.

Any missing item keeps the verdict `FAIL / REMEDIATION REQUIRED`.
## Return Contract to BK01

Only after HOUSE-A PASS may House return control to the BK01 coordinator. The return package must contain the evidence listed above and must not claim that BK01's separate `auth.*` ownership blocker is solved.

BK01 must then:
1. design a new bounded function-ownership/auth-access model;
2. review a replacement bootstrap instead of reusing the failed bootstrap unchanged;
3. repeat Junction A from a fresh A0 baseline;
4. keep Order/Claim live runtime migrations locked until the new Junction A passes.

## Git / Documentation Discipline

- No broad `git add -A` while unrelated work exists.
- Each evidence family should have a focused commit message and changed-file review.
- Run `git diff --check` before committing; classify intentional Markdown line-break whitespace separately from accidental whitespace defects.
- Fetch before push and verify final local/origin divergence.
- Never claim a clean checkpoint until `git status --short --untracked-files=all` is empty, excluding intentionally local `.git/info/exclude` entries for active nested worktrees.
- All subsequent briefs and handoffs must be files under the relevant canonical docs tree and must include Source-of-Truth References.

## Next Authorized Action

After this documentation/cleanliness checkpoint is pushed, the next phase is **H1 — Effective Privilege Inventory, READ ONLY**.

H1 does not authorize any LAB mutation. A separate dated H1 evidence document must be created before H2 design begins.

**PLATFORM REMEDIATION PATH:** LOCKED
**CURRENT RUNTIME VERDICT:** FAIL / REMEDIATION REQUIRED
**PRODUCTION:** NOT AUTHORIZED