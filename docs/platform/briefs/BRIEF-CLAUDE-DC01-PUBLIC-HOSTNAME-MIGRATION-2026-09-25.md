# BRIEF — Claude — DC01 DocCraft Public Hostname Migration — 2026-09-25

**Mode:** EXECUTION / SOURCE-OF-TRUTH FIRST / FAIL-CLOSED
**Owner decision:** migrate DocCraft customer-facing hostname from internal-code host to public-slug host.
**Target product:** DC01 / DocCraft
**Canonical target:** `https://doccraft.wstera.com`
**Legacy live host:** `https://dc01.wstera.com`
**Do not expand scope into Phase 7/Auth/Supabase/Billing.**

## 0. Authority and mandatory inputs

Read and verify these before changing product source or Cloudflare state:

1. Parent repo canonical policy commit:
   `Gutumrod/saas-product-hub@8873bbc8e62fe578a5ba75d0083a9e44d800dfbb`
2. `docs/platform/PRODUCT_PUBLIC_NAMING_AND_HOSTNAME_POLICY.md`
3. `docs/platform/reviews/REPORT-WSTERA-PRODUCT-HOSTNAME-NAMING-POLICY-AUDIT-2026-09-24.md`
4. `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md` §10 D1
5. `docs/products/registry.yaml` DC01 entry
6. DocCraft `docs/CURRENT_STATUS.md`
7. DocCraft `docs/testing/DEFECT_BRANCH_SELECTION_TOGGLE_2026-09-24.md`
8. DocCraft `docs/HANDOFF-DC01-MAC-CONTINUATION-2026-09-09.md`
9. DocCraft `docs/RELEASE_AND_OPERATIONS_RUNBOOK.md`

Later explicit Owner decision wins over older hostname evidence. Historical evidence must remain historical.
## 1. Confirmed starting facts — verify again, do not merely trust this brief

Parent/House:
- canonical policy was reconciled and pushed to `origin/master` at `8873bbc8e62fe578a5ba75d0083a9e44d800dfbb`;
- public names/slugs must be unique; hosted app canonical host is `<public_slug>.wstera.com`;
- DC01 public slug is `doccraft`; canonical target is `doccraft.wstera.com`;
- `product_id` / `product_code=DC01` remain internal identifiers;
- `dc01.wstera.com` is a legacy compatibility surface until this migration explicitly closes it.

DocCraft checkout observed immediately before this brief:
- repo: `https://github.com/Gutumrod/doccraft.git`;
- local path: `D:\AI-Workspace\projects\saas-product-hub\products\doccraft`;
- worktree was clean;
- active branch: `fix/branch-type-toggle-2026-09-24`;
- HEAD: `2a7d3c85119b07590058a293672bd94a4575e840`;
- branch tracks `origin/fix/branch-type-toggle-2026-09-24`;
- default `origin/master`: `a52e5708449500305f15e91f107ba0882b17fa46`;
- active branch is 0 behind / 6 commits ahead of `origin/master`.

Those 6 commits contain real production/security/runtime work, not docs only. Do not reset, rebase away,
or start this migration from stale `origin/master` merely because it is the default branch.
## 2. Known runtime shape and migration blast radius

Observed current configuration:
- `wrangler.jsonc` deploys Worker `wstera-dc01` static assets with custom domain `dc01.wstera.com`;
- `wrangler.http-redirect.jsonc` deploys `wstera-dc01-http-redirect` for `http://dc01.wstera.com/*`;
- `worker/http-redirect.mjs` currently hard-codes `dc01.wstera.com` and returns 308 to HTTPS;
- `scripts/phase6-production-smoke.mjs` defaults to `https://dc01.wstera.com` but accepts `DC01_URL`;
- current checkout contains 47 `dc01.wstera.com` matching lines across 24 files.

Current/non-historical references include at least:
- `wrangler.jsonc`
- `wrangler.http-redirect.jsonc`
- `worker/http-redirect.mjs`
- `scripts/phase6-production-smoke.mjs`
- `scripts/security-adversarial-browser-round1.mjs`
- `scripts/security-adversarial-round1.mjs`
- `scripts/security-boundary-selftest.mjs`
- `scripts/security-csp-residual-probe.mjs`
- `docs/CURRENT_STATUS.md`
- `docs/RELEASE_AND_OPERATIONS_RUNBOOK.md`

Do not bulk replace all 47 matches. Dated Gate 6, security, review, screenshot, testing, and handoff evidence
that actually observed `dc01.wstera.com` must retain that hostname.
## 3. Critical state hazard — establish the true deploy base first

Latest local evidence says the branch-toggle fix was deployed to production from branch
`fix/branch-type-toggle-2026-09-24`, code commit `f5f4951`, with main Worker version
`e84767c8-955f-4562-a159-80fdee44722f`, then documented at `2a7d3c8`.

Before creating a migration branch:
1. fetch/prune DocCraft remotes;
2. prove local/remote cleanliness and divergence;
3. inspect Cloudflare deployment/version evidence available to you;
4. identify the exact source commit/state currently serving production;
5. confirm the six commits ahead of `origin/master` are not lost;
6. choose an integration base that contains the deployed security + branch-toggle state.

If the deployed source cannot be proven, or using `origin/master` would drop production hardening:
**STOP and report `BLOCKED_DEPLOY_BASE_NOT_PROVEN`. Do not improvise a merge/reset.**

Prefer an isolated migration worktree/branch such as `migration/doccraft-public-host-20260925`
from the proven production-capable ref. Do not mutate or clean unknown work in another checkout.
## 4. Scope contract

### In scope
- attach and prove `doccraft.wstera.com` on the existing intended DocCraft runtime;
- keep DocCraft identity/code `DC01` unchanged;
- update current runtime/config/tests/runbook/current-state references that must treat the slug host as canonical;
- preserve safe access through `dc01.wstera.com` during migration;
- verify TLS/certificate, HTTPS response, HSTS/CSP/security headers, route behavior, path/query handling, and no redirect loop;
- inventory any provider callback/external URL dependency before changing it;
- create new dated migration evidence with exact commit, Worker versions/routes and production observations;
- commit and push only after all applicable gates pass.

### Explicitly out of scope
- Phase 7, Supabase, Auth, cloud sync, billing, pricing, or unrelated product features;
- rewriting dated historical evidence to make old URLs look current;
- changing `product_id`, `product_code`, repo identity, Worker identity without necessity;
- broad Cloudflare zone/TLS cleanup unrelated to this migration;
- secret rotation unless an actual exposure is discovered;
- unrelated `301` vs `308` transport-policy remediation.
## 5. Required migration strategy — thin vertical slice first

Use the lowest-risk sequence. Do not cut over by deleting the legacy host first.

### Phase A — Preflight / inventory
1. classify every current `dc01.wstera.com` match as:
   - active canonical config/test/doc to change;
   - intentional legacy-compatibility reference to keep;
   - historical evidence to preserve unchanged.
2. inspect actual Cloudflare routes/custom domains/Worker versions before mutation;
3. prove whether DocCraft has any live OAuth, Stripe, LINE, webhook, QR, or other external callback dependency;
4. record rollback point before any deploy;
5. capture current legacy-host behavior.

### Phase B — Canonical host live
Attach `doccraft.wstera.com` to the proven DocCraft application runtime and make it serve the same
reviewed application/security posture. Do not retire `dc01.wstera.com` yet.

Minimum proof before any legacy redirect change:
- `https://doccraft.wstera.com` returns expected DocCraft app with HTTP 200;
- certificate/TLS valid;
- HSTS/CSP/anti-framing/nosniff/noindex expectations pass;
- core application smoke passes;
- no unexpected third-party network success or security regression.
### Phase C — Legacy compatibility disposition
After Phase B passes, explicitly choose and prove the safest legacy behavior from current architecture.

Preferred risk order:
1. temporarily serve the same proven app on both hosts if that is the least disruptive supported state;
2. then, if safe and authorized by the existing route architecture, redirect browser traffic from
   legacy `dc01.wstera.com` to `https://doccraft.wstera.com` while preserving path/query.

Do not assume OAuth/webhooks/provider callbacks can follow redirects. If any exist, migrate provider
configuration directly and preserve the legacy endpoint until verified safe.

### Separate transport finding
`docs/testing/DEFECT_BRANCH_SELECTION_TOGGLE_2026-09-24.md` records that live HTTP currently returns
`301 Moved Permanently` while older smoke/security contracts expect `308`. This is an existing separate finding.

For this task:
- observe and report actual status;
- do not silently normalize 301↔308 as collateral work;
- do not change shared/House routing just to make an old assertion green;
- if hostname migration technically requires changing that behavior, stop and report the exact dependency
  before making the unrelated policy choice.
## 6. Required implementation discipline

- Parameterize host-sensitive tests where practical instead of cloning brittle scripts.
- Canonical-host tests must target `doccraft.wstera.com`.
- Legacy-host compatibility tests must remain explicit and separate.
- Preserve historical files unchanged unless adding a clearly dated supersession/continuation note is necessary.
- Update `docs/CURRENT_STATUS.md` as a new 2026-09-25+ current-state overlay after production proof;
  do not falsify its dated 2026-09-08 observations.
- Amend `docs/RELEASE_AND_OPERATIONS_RUNBOOK.md` with current canonical + legacy behavior.
- No hard-coded credentials, account IDs, OAuth profiles, tokens or machine-local Wrangler auth state.
- Never copy Wrangler OAuth/profile state between machines.
- No force push.
- No destructive reset/clean of unknown work.

## 7. Verification gates before deploy

Use package scripts from the verified branch and exact lockfile:

```text
pnpm install --frozen-lockfile
pnpm audit
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:security-boundary
pnpm test:e2e
git diff --check
```

If Edge is unavailable on the execution machine, do not fake a full-browser PASS; report the missing gate.
## 8. Production acceptance after deploy

At minimum prove and record:
1. canonical HTTPS app load = expected 200;
2. canonical TLS certificate valid;
3. canonical HSTS/CSP/X-Frame-Options/nosniff/noindex headers match security contract;
4. canonical Chrome production smoke PASS;
5. canonical Edge production smoke PASS when Edge is available;
6. representative edit → persistence → PromptPay preview → print-media path still works;
7. security-boundary/adversarial probes relevant to hostname change pass;
8. canonical HTTP behavior observed and documented without inventing a 301/308 requirement;
9. legacy HTTPS behavior is intentional and proven;
10. legacy HTTP behavior is intentional and proven;
11. no redirect loop;
12. path/query preserved wherever a redirect is intentionally configured;
13. no historical-evidence bulk rewrite;
14. `rg dc01.wstera.com` leftovers are individually explainable as legacy compatibility or history;
15. no secrets/config credentials added to Git.

Rollback must be possible to the recorded pre-migration Worker version/config without losing the
currently deployed branch-toggle/security fixes.
## 9. Git / release closure

Only after all applicable verification passes:
1. create/update a dated migration report in the DocCraft repo;
2. include exact source SHA, branch, pre/post Worker versions, routes, commands, results, known limitations;
3. `git diff --check`;
4. commit the migration and evidence;
5. push the dedicated branch;
6. if repository policy allows and the correct integration route is proven, reconcile to the canonical
   DocCraft branch without discarding the six production commits; otherwise stop at a pushed reviewed branch
   and report the exact merge/release decision required.

Do not claim the parent House policy is changed by the DocCraft commit; it is already canonical at
`8873bbc8e62fe578a5ba75d0083a9e44d800dfbb`.

## 10. Required final report format

Return these sections:
- `VERDICT`
- `CONFIRMED FACTS`
- `DEPLOY BASE / PROVENANCE`
- `CHANGES MADE`
- `DNS / CLOUDFLARE / ROUTE STATE`
- `CANONICAL HOST PROOF`
- `LEGACY HOST COMPATIBILITY`
- `301/308 SEPARATE FINDING STATUS`
- `TEST / LINT / TYPECHECK / BUILD / E2E / SECURITY RESULTS`
- `HISTORICAL REFERENCES PRESERVED`
- `COMMIT / PUSH / REMOTE SHA`
- `OPEN DECISIONS`
- `BLOCKERS`

Success verdict may only be `DC01_PUBLIC_HOSTNAME_MIGRATION_PASS` when the canonical host is live,
legacy compatibility is proven, all applicable gates pass, and the committed/pushed source exactly matches evidence.
Otherwise use a precise blocked/remediate verdict and stop rather than guessing.
