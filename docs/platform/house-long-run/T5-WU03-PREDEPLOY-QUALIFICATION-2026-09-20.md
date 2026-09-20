# T5-WU03 — EXACT CANDIDATE PREDEPLOY QUALIFICATION

Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001` · Stage **T5** · Work Unit **T5-WU03**
Review Batch: B5 (pre-deploy) · Recorded: 2026-09-20 (Asia/Bangkok) · Orchestrator: Hermes

## Candidate freeze

| Item | Value |
|---|---|
| Repository | `Gutumrod/hub-web` |
| Branch | `work/house-platform-closure-20260919` |
| **Frozen candidate revision** | **`61acf52c6ecb5995f7ae67b7885f4548f40ebaef`** |
| Base before T5 | `381fef3f639f1b6da225c217ce6ddd3e0f29cd61` (B4-approved) |
| Remote parity | verified equal to `origin/work/house-platform-closure-20260919` |
| Coordination repo revision | `Gutumrod/saas-product-hub` `work/house-production-closure-longrun-20260919` |

Nothing further may change in the candidate between this record and the deploy. Any material change
invalidates this qualification and requires a fresh B5 review.

## Deterministic gates, run by Hermes on the frozen revision

```
cd apps/hub-web
npx tsc --noEmit   -> exit 0
npx vitest run     -> 25 files, 358 tests, all passing
                      (pre-T5 baseline 23 files / 347 tests; no test removed)
npm audit          -> 14 findings (1 critical, 4 high, 9 moderate)
                      (was 15; the fixed one was drizzle-orm, on the live path)
```

| Gate | Result |
|---|---|
| Typecheck | PASS (production source; note `tsconfig.json` excludes `**/*.test.ts`) |
| Full test suite | PASS 25/358 |
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

- [ ] Exact candidate SHA frozen — **`the frozen candidate`**
- [ ] Production Readiness Record exists — `T5-PRODUCTION-READINESS-RECORD-2026-09-20.md`
- [ ] Applicable G1–G10 evidence PASS or explicit N/A WITH EVIDENCE — recorded, with remaining gaps listed
- [ ] Canonical build-time environment delivery verified without printing secrets — mechanism recorded
- [ ] Rollback target/procedure recorded — above
- [ ] No destructive/irreversible action introduced
- [ ] No new paid dependency introduced
- [ ] Live commands materially identical to the approved operator contract
- [ ] R15 operation is the approved non-destructive role/grant package

## Open G-gaps that B5 must rule on (from the readiness record)

1. HTTP→HTTPS enforcement — **fixable at WU05** via the zone setting (documented, reversible)
2. Security headers — **closed by WU02**
3. Dependency audit — **drizzle-orm fixed**; the remainder are dev/build tooling with recorded reasons
4. Runbook — NOT YET WRITTEN
5. Kill-switch / escalation — NOT YET RECORDED
6. Control request correlation — NOT EVIDENCED
7. Live smoke — WU06

Items 4–6 are the remaining non-live gaps. B5 must decide whether they block `PRODUCTION_READY`, and the
Task must record that ruling either way.
