# BRIEF — BK01 Build to Merchant Pilot

**Date:** 2026-09-06
**Mode:** WSTERA BUILD-TO-SELL
**Product:** Booking by WSTERA (BK01)

## Owner Direction
- Build-to-Sell is the active priority.
- Plan before every implementation, even for small changes.
- Do not reopen CONT-04/BK-SR-02, Council, Module Hub Scan, or Order implementation unless current evidence proves a real contradiction.
- Read current repo/Hermes/docs before acting; preserve partial work and evidence.
- Never fabricate credentials and never use production credentials for staging rehearsal.

## Current Verified State
- Repo: `D:\AI-Workspace\projects\saas-product-hub\products\booking`
- Branch: `feature/bk-a-v1-contract-remediation`
- HEAD: `e65366f983f15922358c35aba83782f781d96cbe`
- Local vs origin: ahead 3 / behind 0
- Working tree: modified `docs/BUILD-TO-SELL-EXECUTION-2026-09-06.md` + untracked BK-SR-03 evidence
- BK-A / CONT-04: CLOSED / PASS
- BK-SR-01: CLOSED
- BK-SR-02: CLOSED
- Order implementation: NOT AUTHORIZED

## Proven Evidence
- Local release checks: tests 20/20 PASS, lint 0 errors, consumer/admin production builds PASS, production dependency audit 0 vulnerabilities, diff/write-scope PASS.
- Staging isolation exists at `e65366f`: staging Worker names isolated from production and staging crons disabled.
- LINE signature verification/retry/secret boundaries are statically verified.
- Hermes top task: `t_6ea0150c`; prior Relay Standard stages completed with Qwen independent QA PASS and deterministic integration PASS.

## Exact Current Blocker — BK-SR-03
`.env.staging.local` is missing. Approved non-production runtime credentials are not configured for:
- Cloudflare staging authentication/runtime
- isolated non-production Supabase
- non-production LINE OA channel
- Stripe test credentials/webhook secret required by current V1 rehearsal

Do not use `.env.local` or production/KMO credentials as a shortcut.

## Problem / User / Destination
**Problem:** Release candidate is locally green but real external-system staging deploy/rollback/rehearsal is not proven.
**User:** Merchant using Booking consumer + Admin with merchant-owned LINE OA.
**Sell-ready destination:** merchant onboarding → booking rules → real booking/admin operation → LINE/payment paths → recovery/support → controlled merchant pilot without hidden WSTERA manual dependency.

## Immediate Workflow
1. Verify Git/Hermes state again before mutation; do not duplicate BK-SR-03 tasks.
2. Reconcile/commit/push current 3 local commits + durable BK-SR-03 evidence only after reviewing exact diff.
3. Authenticate approved Cloudflare staging runtime.
4. Create/verify isolated non-production Supabase and populate `.env.staging.local` with staging-only values.
5. Configure non-production LINE + Stripe test credentials.
6. Run `npm run cf:dry-run:staging`.
7. Deploy staging consumer/admin.
8. Run post-deploy smoke, LINE signature/retry/notification rehearsal, applicable Stripe V1 rehearsal.
9. Prove rollback + redeploy.
10. Close BK-SR-03 with exact deployment/evidence identities and independent review.
11. Plan BK-SR-04 Pilot-ready Onboarding/Operations before implementation.

## Failure / Security
- Any production credential/target use in staging = STOP.
- Secret values must remain server-side and must not be logged or committed.
- Failed deploy/rehearsal must preserve rollback path and evidence; do not weaken guards/tests.
- No KMO-specific infrastructure/code in BK01 sellable product.

## Acceptance
BK-SR-03 closes only when approved staging deploy, smoke, external-system rehearsal, rollback/redeploy, secret-boundary checks and independent QA pass.
BK-SR-04 then must make merchant onboarding/configuration/support/recovery executable from documentation before pilot.
