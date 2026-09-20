# T5-WU03 — EXACT CANDIDATE PREDEPLOY QUALIFICATION

Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001` · Stage **T5** · Work Unit **T5-WU03**
Review Batch: B5 (pre-deploy) · Recorded: 2026-09-20 (Asia/Bangkok) · Orchestrator: Hermes

## Candidate freeze

> **Revision authority:** the frozen candidate `679ff279e5ff2a9a3006bea79ccc6ccde90715ec` revision for T5 is stated in exactly one place —
> `T5-CANDIDATE-FREEZE-2026-09-20.md`. The SHA repeated in this document is a convenience copy;
> if the two ever disagree, that file wins and this document is stale.

| Item | Value |
|---|---|
| Repository | `Gutumrod/hub-web` |
| Branch | `work/house-platform-closure-20260919` |
| **Frozen candidate revision** | **`679ff279e5ff2a9a3006bea79ccc6ccde90715ec`** |
| Base before T5 | `381fef3f639f1b6da225c217ce6ddd3e0f29cd61` (B4-approved) |
| Remote parity | verified equal to `origin/work/house-platform-closure-20260919` |
| Coordination repo revision | `Gutumrod/saas-product-hub` `work/house-production-closure-longrun-20260919` |

Nothing further may change in the candidate between this record and the deploy. Any material change
invalidates this qualification and requires a fresh B5 review.

## Deterministic gates, run by Hermes on the frozen revision

```
cd apps/hub-web
npx tsc --noEmit   -> exit 0
npx vitest run     -> 25 files, 366 tests, all passing
                      (pre-T5 baseline 23 files / 347 tests; no test removed; re-measured at the frozen revision)
npm audit          -> 14 findings (1 critical, 4 high, 9 moderate)
                      (was 15; the fixed one was drizzle-orm, on the live path)
```

| Gate | Result |
|---|---|
| Typecheck | PASS (production source; note `tsconfig.json` excludes `**/*.test.ts`) |
| Full test suite | PASS 25/366 (re-measured at the frozen revision `679ff27`) |
| Dependency audit | 1 critical + 4 high remain, **all dev/build tooling**; every finding has a recorded disposition |
| `drizzle-orm` HIGH advisory | **FIXED** — `0.44.7` -> `^0.45.2`, closing GHSA-gpj5-g38j-94v9 on the live server path |
| Build-env gate | PASS — `check:build-env` runs ahead of `build` and `cf:deploy`; verified to abort with a MISSING message when a required value is absent |
| Secret scan (canonical Relay scanner) | 0 findings across all changed files |
| Forbidden-path diff | `drizzle/`, `server/webhooks/`, `server/fulfillment/`, `client/` — no unauthorised change |

## Build artifact qualification

| Item | State |
|---|---|
| Build command | `npm run check:build-env && vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist` |
| Worker entry | `server/worker.ts` (per `wrangler.jsonc` `main`) |
| Deploy command | `npm run check:build-env && vite build && wrangler deploy` |
| Static asset route | Cloudflare Workers Static Assets serves the SPA from the edge; `run_worker_first: ["/api/*"]` forces only the API through the Worker |
| Security headers | applied to all four Worker-answered paths **and** mirrored in `client/public/_headers` for the asset route, with a drift-guard test |
| Build-time config failure mode | **closed** — the Mac-handoff failure (build succeeding without required Supabase values) can no longer reach a deploy silently |

The exact artifact identity will be captured at WU05 as deployment output; this record freezes the
**source** candidate it must be built from.

## Configuration delivery contract for WU05 (no value printed)

Two configuration sets must be present for the deployed Worker, both currently **absent** (measured
during WU01/WU02), which is why the new capabilities are inert in production today:

| Config | Purpose | Current state |
|---|---|---|
| `PRODUCT_EVENT_SIGNERS` | T2 per-product signer registry | **absent** -> product-event webhook rejects (fail-closed) |
| `BILLING_CORE_CONTROL_READ_BASE_URL`, `BILLING_CORE_CONTROL_READ_CREDENTIALS` | T4 SB01 read transport | **absent** -> adapter stays `UnconfiguredBillingCoreAdapter` (fail-closed) |
| `DATABASE_URL`, `SUPABASE_*`, `WSTERA_CONTROL_*`, `OWNER_USER_ID`, `AGENT_EVENTS_HMAC_SECRET` | pre-existing runtime needs | present today (Worker runs) |

Delivery must use the canonical secret path (Cloudflare Worker secrets via `wrangler secret put` or the
existing secret pipeline), never a repository file, never a printed value. Verification is by
**presence-only indicators** (the WU02 report proposes a truncated fingerprint comparison), never by
echoing a value.

**Risk note for B5:** enabling `PRODUCT_EVENT_SIGNERS` and the Billing Core read credentials will
**change production behaviour** from fail-closed-inert to active. That is intended and authorised, but
it must be sequenced so each can be verified and, if needed, reverted independently.

## Rollback contract

| Layer | Target | Procedure |
|---|---|---|
| Worker code | previous deployed version (versions are enumerable via `wrangler deployments list`; the pre-T5 version is `9db4fb70-a5e5-4989-94b5-1d271ab10055`) | `wrangler rollback` or redeploy the prior version |
| Zone settings | `always_use_https: off`, `min_tls_version: 1.0` | reverse `PATCH` per the WU02 report |
| New capabilities | inert state | remove the two config sets (secrets) to return to fail-closed behaviour |
| R15 role/grants | pre-apply state | per the T1 deploy/rollback plan |

## Pre-deploy checklist for B5

Each line states its own evidence state. Items that depend on WU05 are deliberately NOT ticked —
they cannot be asserted before the deploy runs.

- [x] Exact candidate SHA frozen — `679ff279e5ff2a9a3006bea79ccc6ccde90715ec` (freeze record verified)
- [x] Production Readiness Record exists — `T5-PRODUCTION-READINESS-RECORD-2026-09-20.md`
- [ ] Applicable G1–G10 evidence PASS or explicit N/A WITH EVIDENCE — **PARTIAL**: recorded, with the
      remaining gaps enumerated below and the live items untested until WU06
- [ ] Canonical build-time environment delivery verified without printing secrets — **mechanism verified**
      (build-env gate aborts on a MISSING value); the **live delivery** is a WU05 action and is not done
- [x] Rollback target/procedure recorded — production deployment id captured, rollback path documented
- [x] No destructive/irreversible action introduced
- [x] No new paid dependency introduced
- [ ] Live commands materially identical to the approved operator contract — **NOT YET EXECUTED**; WU05
- [ ] R15 operation is the approved non-destructive role/grant package — **R15 is PREPARED, NOT APPLIED**;
      the apply is a WU05 step and has not run

## Open G-gaps that B5 must rule on (from the readiness record)

1. HTTP→HTTPS enforcement — **fixable at WU05** via the zone setting (documented, reversible); still open
2. Security headers — **closed by WU02**
3. Dependency audit — **drizzle-orm fixed**; the remainder are dev/build tooling with recorded reasons
4. Runbook — **CLOSED**: `docs/control-plane/BILLING-CORE-READ-FULFILLMENT-RUNBOOK-2026-09-20.md`
5. Kill-switch / escalation — **CLOSED**: `docs/control-plane/CAPABILITY-KILL-SWITCH-ESCALATION-2026-09-20.md`
6. Control request correlation — **DESIGN RECORDED, NOT IMPLEMENTED**: `docs/control-plane/CONTROL-READ-CORRELATION-DESIGN-2026-09-20.md`; the readiness record keeps this `PARTIAL`
7. Live smoke — WU06

State of items 4–6 was corrected here after B5 R5 found this table stale: items 4 and 5 were written as
NOT YET although both records had been created in the same remediation round. Only correlation remains
open (design only, correctly marked PARTIAL), plus the live items. The B5 ruling on whether each gap
blocks `PRODUCTION_READY` or the deploy window is recorded in the readiness record and the B5 review
reports.
