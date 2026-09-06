# BRIEF — PS01 Build to 1-Store Closed Beta

**Date:** 2026-09-06
**Mode:** WSTERA BUILD-TO-SELL
**Product:** Pawstia PMS (PS01)

## Owner Direction
- Build-to-Sell is the active priority.
- Plan before every implementation, even for small changes.
- Do not reopen Phase 13 verification, Council, Module Hub Scan, or payment work by default.
- Preserve canonical Phase 13 closure and the dedicated PS-SR-02 staging worktree.
- Verify current Git/Hermes/provider state before acting; do not duplicate PS-SR-02 tasks.

## Current Verified State
- Canonical master commit: `3f665558a53b7dec26aee767d866a5533e909a8f`
- Main repo currently checked out at `verify/phase13-closure-2026-09-01` @ `67de7f38c8bb`, clean, origin 0/0.
- Dedicated staging worktree: `D:\AI-Workspace\projects\saas-product-hub\products\PawSpace-pssr02-staging`
- Staging branch: `build/ps-sr02-staging-2026-09-06`
- Staging HEAD: `3f665558a53b7dec26aee767d866a5533e909a8f`
- Staging worktree: only untracked `docs/PS-SR-02-STAGING-RELEASE-2026-09-06.md`
- Phase 13: CLOSED / canonical

## Proven Evidence
- typecheck PASS, lint PASS, production build PASS, diff/write-scope PASS.
- Canonical CI run `33743691064` passed the isolated matrix including two-tenant leakage protection and core operational loop.
- 13 ordered Supabase migrations are documented.
- Production was not mutated by PS-SR-02 work.

## Exact Current Blocker — PS-SR-02
No approved live staging application provider/runtime is configured.
No isolated Supabase cloud staging project exists.
No staging environment credentials are registered.
Local Windows E2E is blocked by Docker being offline plus `spawnSync pnpm.cmd EINVAL`; this is not permission to weaken tests and is not the preferred release path.

## Problem / User / Destination
**Problem:** Product capability and tenant-isolation evidence exist, but there is no real isolated staging release environment.
**User:** Pet hotel/daycare/pet-hospitality store.
**Commercial boundary:** Founding Member C2 = first 10 stores, invitation-only, THB 990/month, continuous subscription required, store-bound/non-transferable; this is not proof of general public WTP.
**Sell-ready near destination:** isolated staging → resilience/recovery proof → one real-store Closed Beta loop.

## Provider Decision Gate
Do not autonomously choose a hosting provider just to clear the gate. Present the current repo/runtime facts and one recommended provider path to Owner, then wait for approval before provider-specific implementation/configuration.
An isolated Supabase staging project is mandatory regardless of app provider.

## Immediate Workflow
1. Verify Git/Hermes state and preserve current PS-SR-02 evidence.
2. Present staging-provider recommendation + impact to Owner and obtain approval.
3. Create/verify isolated Supabase cloud staging project; never reuse production project/data.
4. Register staging-only credentials in the approved secrets vault/environment.
5. Add only the provider configuration required by the approved plan.
6. Apply migrations to staging with non-destructive `db push` and verify migration state.
7. Deploy staging app and run real two-tenant/core-loop smoke against staging.
8. Prove rollback/redeploy and record deployment identity.
9. Complete Stage Gate → independent QA → deterministic integration; close PS-SR-02.
10. Plan PS-SR-03 Integration Resilience + Recovery before implementation.
11. After PS-SR-03 PASS, plan PS-SR-04 and onboard one real store before expansion toward 10.

## Failure / Security / Acceptance
- Cross-tenant leakage, production-target ambiguity, secret exposure or destructive production reset = STOP.
- LINE/Sheets/LIFF/media failures in PS-SR-03 must have observable recovery/reconciliation paths.
- PS-SR-02 closes only with real isolated staging deploy, migration evidence, two-tenant smoke, rollback/redeploy, release record and independent QA.
- Payment implementation remains forbidden until the later commercial/payment contract gate is approved.
