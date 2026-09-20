# T5-WU05 — CONTROLLED PRODUCTION APPLY + DEPLOY — OPERATOR CONTRACT (PREPARED, NOT EXECUTED)

Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001` · Stage T5 · Work Unit **T5-WU05**
Status: **PREPARED — awaiting B5 pre-deploy `BATCH_APPROVED`**
Recorded: 2026-09-20 · Orchestrator: Hermes

**No step below has been executed.** This document exists so that, once B5 approves, every command is
deterministic and no improvisation is required. Any material deviation during execution is a STOP.

## Pre-conditions (all must hold before step 1)

- [ ] B5 pre-deploy review returned `BATCH_APPROVED` against this exact candidate
- [ ] Owner's nine standing conditions still hold (candidate frozen, R15 non-destructive, existing
      approved target, canonical secret path, rollback ready, no new destructive/paid/architecture gap,
      live commands materially identical to this contract)
- [ ] `git rev-parse HEAD` equals the frozen candidate SHA, worktree clean, remote parity verified
- [ ] Rollback target read back from Cloudflare immediately before mutation

## Step 0 — identity re-verification (Hermes, deterministic)

```
cd D:/AI-Workspace/projects/saas-product-hub/apps/hub-web
git branch --show-current
git rev-parse HEAD            # must equal the frozen candidate SHA
git status --short            # must be empty
git fetch origin && git rev-parse @{u}
npx wrangler deployments status   # record the CURRENT version as the rollback target
```

If the SHA does not match, or the tree is dirty, **STOP**.

## Step 1 — zone-level HTTP→HTTPS (reversible, existing target)

Zone: `wstera.com` (`a94702438f99a15c357425999ecdeed5`)

```
PATCH /zones/{zone_id}/settings/always_use_https      {"value":"on"}
PATCH /zones/{zone_id}/settings/min_tls_version       {"value":"1.2"}
```

Rollback: same calls with `{"value":"off"}` and `{"value":"1.0"}` respectively.

Verify: `http://wstera.com` and `http://platform.wstera.com` must redirect to HTTPS (no 200).

## Step 2 — build the exact candidate

```
cd apps/hub-web
npm run build        # runs check:build-env -> vite build -> esbuild
```

The build-env gate now fails the build if a required build-time value is absent. Record the build
result and the artifact identity (hash/fingerprint) **without printing any secret value**.

## Step 3 — deploy to the existing Worker

```
npx wrangler deploy
```

Deploy **with both new config sets still absent**, so both new capabilities remain inert and the
deploy itself only ships code + the hardening changes. Record the deployed version identifier
immediately (this is what WU06 must bind to).

## Step 4 — post-deploy smoke of the inert state (before activating anything)

- `https://wstera.com` → 200 over HTTPS; HTTP now redirects
- `https://platform.wstera.com` → 200 over HTTPS; HTTP now redirects
- Security headers present on both routes (HSTS, XCTO, XFO, Referrer-Policy, CSP)
- `/health` → 200
- Product-event webhook with no signature → fail-closed rejection (registry absent)
- Control billing read router → `readiness.state = waiting_for_billing_core`, `snapshot = null`,
  `error.name = BillingCoreUnconfiguredError`

**If any of these is wrong, roll back (step 8) before activating anything.**

## Step 5 — activate capability 1: product-event signers

Deliver `PRODUCT_EVENT_SIGNERS` through the canonical secret path (never a repo file, never printed).

Verify, in order:
1. a correctly signed event for a registered product → accepted
2. an unsigned/badly signed event → rejected, no DB write
3. a valid signer for product A emitting a product-B event → rejected
4. a malformed registry (one bad entry) → the WHOLE config inactive (whole-config fail-closed)

Rollback: remove the secret → capability returns to inert fail-closed.

## Step 6 — activate capability 2: Billing Core read

Deliver `BILLING_CORE_CONTROL_READ_BASE_URL` (https only) + `BILLING_CORE_CONTROL_READ_CREDENTIALS`
through the canonical secret path.

Verify, in order:
1. a read for a permitted account → truthful snapshot, attributable to the SB01 projection
2. an unpermitted/unknown account → refused (403 assertion mismatch or explicit error)
3. Billing Core unreachable → visible `degraded` / `canRead: false`, never an empty success
4. `canExecutePaymentActions` remains `false` on every path

Rollback: remove both secrets → adapter returns to `UnconfiguredBillingCoreAdapter`.

## Step 7 — R15 least-privilege apply (non-destructive, per the T1 package + Owner ruling)

Apply the approved `hub_web_app` role/grants per `T1-R15-DEPLOY-ROLLBACK-PLAN.md`. Verify:
- positive: the runtime can reach exactly its required `public` objects
- negative: `billing_core` and `billing_core_staging` are denied
- `public.profiles` is excluded per the Owner's ruling
- the owner `DATABASE_URL` is no longer used by the application runtime

Rollback: the plan's recorded reverse sequence.

> If B5 ruled the R15 apply out of the approved window, skip this step and record it as deferred.

## Step 8 — rollback procedure (any step)

| Layer | Action |
|---|---|
| Worker | `npx wrangler rollback` to the version recorded in step 0 |
| Zone | reverse the two `PATCH` calls (step 1) |
| Capability 1 | remove `PRODUCT_EVENT_SIGNERS` |
| Capability 2 | remove both `BILLING_CORE_CONTROL_READ_*` secrets |
| R15 | per the T1 rollback plan |

## Hard prohibitions

- No secret value printed, logged, or written to a repository file at any point.
- No destructive DB operation; no data deletion; no drop.
- No new paid service; no plan change.
- No SB01/provider mutation; no Stripe payment/customer/subscription mutation.
- No new architecture/security/business authority decision.
- No `canExecutePaymentActions` change.
- No force push, no history rewrite.

## Evidence to record for WU06 and B5 closure

Exact candidate SHA · deployed version identifier · build result and artifact fingerprint
(non-secret) · each verification result above with the observed value · the rollback target that was
in effect · every deviation, or an explicit statement that there was none.

## STOP conditions during execution

Any command differing materially from this contract; any secret exposure; any destructive action
required; any authority question; any verification that fails and cannot be corrected within this
contract.
