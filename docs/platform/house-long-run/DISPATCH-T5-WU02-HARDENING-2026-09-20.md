# T5-WU02 DISPATCH — dependency / HTTP→HTTPS / security-headers / build-env hardening

Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001` · Stage **T5** · Work Unit **T5-WU02**
Review Batch: B5 (pre-deploy) · Workspace: `D:\AI-Workspace\projects\saas-product-hub`
Repository for source: `Gutumrod/hub-web` branch `work/house-platform-closure-20260919`
Candidate revision: `381fef3f639f1b6da225c217ce6ddd3e0f29cd61`
Recorded: 2026-09-20

## Authority

Owner/Sol directed T5 to continue under the approved RUN MANIFEST without reconfirming before WU05,
**provided** all nine listed conditions remain true. This work unit performs **no production
mutation**: it changes repository source only. The zone-level and deploy-level operations are WU05.

## Measured starting state (by Hermes, read-only)

**HTTP→HTTPS is broken, and the cause is at the Cloudflare zone, not in the Worker:**

```
zone wstera.com a94702438f99a15c357425999ecdeed5  status: active
  always_use_https          : off      <-- the operative cause
  ssl                       : full
  min_tls_version           : 1.0      <-- below current practice
  automatic_https_rewrites  : on
```

Confirmed by request: `http://wstera.com` and `http://platform.wstera.com` both return **HTTP 200
with no redirect**, and the HTTPS response carries **no** `Strict-Transport-Security`,
`X-Content-Type-Options`, `X-Frame-Options` or CSP.

**Dependency audit (`npm audit`) on the candidate: 15 findings — 1 critical, 5 high, 9 moderate.**
Notable:
- `drizzle-orm` **high** — GHSA-gpj5-g38j-94v9, SQL injection via improperly escaped identifiers,
  affected range `<0.45.2`. The repo is on `0.44.7`. **This one is on the live server path.**
- `sharp` **high** — inherited through `wrangler` → `miniflare`; build/dev tooling.
- `vite` **high/advisory** — dev/build tooling.
- `vitest` **critical** — via `@vitest/mocker`; dev dependency, not shipped.
- `wrangler` → `miniflare` **high** — tooling.

**Live configuration gap:** the deployed Worker has no `PRODUCT_EVENT_SIGNERS` and no
`BILLING_CORE_CONTROL_READ_*`, so both new capabilities are inert in production (fail-closed). Config
delivery is a WU05 item; this unit prepares and verifies the mechanism **without printing values**.

## Deliverables

### 1. HTTP→HTTPS enforcement (in-repo part)

The zone setting `always_use_https: off` is the operative cause and is fixed at WU05 by a zone
setting change (existing approved target, non-destructive, reversible). Your in-repo responsibility:

- Ensure the Worker does not depend on HTTP being reachable. Any absolute URL the Worker emits must be
  `https://`.
- Do **not** add a Worker-level redirect that would conflict with the zone-level setting; a
  double-redirect or a redirect loop is a defect. State explicitly in your report that enforcement is
  zone-level and that the Worker is redirect-free by design.
- Record the exact zone API call WU05 will need (`PATCH /zones/{zone_id}/settings/always_use_https`
  with `{"value":"on"}`) plus the reverse call for rollback, and the recommended
  `min_tls_version` (`1.2`) with its reverse. Do not execute them.

### 2. Security headers

Add the headers the G5 record flagged as missing. Implement them in the Worker so they apply to both
routes, without breaking the SPA asset path or the tRPC/webhook responses:

- `Strict-Transport-Security` — long max-age, `includeSubDomains`. Do **not** add `preload` unless the
  Owner wants it; note that preload is a one-way commitment.
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` (or a CSP `frame-ancestors` directive if you also add a CSP — state which)
- `Referrer-Policy: strict-origin-when-cross-origin`
- A Content-Security-Policy appropriate to this app. **If a strict CSP would break the SPA or tRPC,
  say so and propose the narrowest policy that does not**, rather than shipping a broken page or a
  useless policy.

Headers must **not** be added to webhook responses in a way that breaks signature checks, and must not
override `Content-Type` on JSON responses.

### 3. Build-environment delivery correctness

The Mac handoff recorded that the build can succeed **without** the required build-time Supabase values,
and the manifest requires that deployment verify the built artifact. Deliver:

- A build-time check that fails the build when required configuration is absent, so a
  mis-configured artifact cannot be deployed silently. Keep it strictly non-secret-printing.
- Evidence that the check actually fails when a value is missing (a mutation-style probe: remove a
  required value, observe the failure, restore).
- Note for WU05: a way to verify the built artifact's configuration identity **without printing any
  value** (e.g. presence/length/hash-of-fingerprint indicators).

### 4. Dependency hardening

- Fix what is safely fixable **without** breaking the candidate: assess the `drizzle-orm` upgrade
  (`0.44.7` → `>=0.45.2`, closing GHSA-gpj5-g38j-94v9) and, if it is a safe version bump for this
  codebase, apply it and prove the full suite still passes. If the upgrade requires code changes
  beyond a version bump, **do not** attempt a broad migration here — record it as a finding with the
  exact scope, since this candidate is otherwise frozen and approved through B4.
- Record the disposition of every audit finding: fixed, accepted-with-reason, or deferred-with-scope.
  For dev-only tooling findings (vitest, vite, wrangler/miniflare/sharp) state plainly whether the
  affected code ships to production. `npm audit fix --force` that changes majors is **not** authorised
  in this unit.

## Prohibited

- No production deploy, no zone setting change, no DNS change, no DB operation, no secret printing.
- Do not modify `drizzle/` migrations, `server/webhooks/`, or `server/fulfillment/`.
- Do not weaken or delete existing tests; the baseline is **23 files / 347 tests**.
- No new paid dependency.

## Required to pass

```
cd apps/hub-web
npx tsc --noEmit   -> exit 0
npx vitest run     -> fully green, baseline preserved (23 files / 347 tests) plus any new cases
```

Plus: the build-time config check must demonstrably fail on a missing required value; headers must be
covered by tests; and no secret may appear in any file, log, header or error body.

## Report to produce

- files changed, with the header set actually applied and where it is applied
- the exact zone API calls WU05 will run, with their rollback counterparts
- the build-time check's behaviour and the probe that proves it fails when a value is missing
- per-finding audit disposition (fixed / accepted / deferred, with scope)
- whether the drizzle-orm upgrade was applied, and if not, the exact scope of what it would need
- exact `tsc` and `vitest` results after the change
- a statement that no production mutation was performed and no secret value appears anywhere
