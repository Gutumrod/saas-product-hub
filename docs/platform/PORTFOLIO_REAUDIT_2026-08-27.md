# WSTERA Portfolio Production Re-Audit — 2026-08-27

**Prepared by:** Codex

**Commissioned by:** CEO, WSTERA

**Purpose:** Independent clean-slate verification of the seven-product production plan

**Scope:** Code, repository, security, build, test, release, and operations readiness only

> Financial planning is excluded. This audit does not set or validate prices, revenue, budgets,
> forecasts, or commercial package values.

---

## 1. Method and limits

The audit refreshed the current default branches, inspected manifests/source/docs, enumerated remote
branches/tags and GitHub metadata, and ran clean-install verification where the repository exposed a
repeatable command. The verification host used Node.js `22.22.3`, npm `10.9.8`, and pnpm `11.22.0`;
pnpm lockfiles may select their own declared pnpm version during install.

No production credential was read or changed. No production Stripe, Supabase, LINE, Google, DNS, or
Cloudflare mutation was performed. Live-environment assertions therefore remain unverified until
their product gate explicitly exercises them. Product clones were shallow, so this pass is not a
full git-history secret audit.

## 2. Repositories inspected

| Component | Repository | Default branch | Inspected commit |
|---|---|---|---|
| Portfolio documentation | `Gutumrod/saas-product-hub` | `master` | `b9333bf` intake point |
| Hub control plane | `Gutumrod/hub-web` | `main` | `8a3e493` |
| BK01 | `Gutumrod/booking` | `main` | `e99615d` |
| PS01 | `Gutumrod/pawspace` | `master` | `97c9fd6` |
| LK01 | `Gutumrod/wstera-link` | `main` | `bf591e3` |
| DC01 | `Gutumrod/doccraft` | `master` | `2a8652e` |
| MT01 | `Gutumrod/multi-tenant-ai` | `master` | `92139cf` |
| CM01 | `Gutumrod/booking-ticket-module` | `main` | `be37b0a` |
| HC01 | `Gutumrod/headless-commerce` | `master` | `3147162` |

`hub-web` is a separate private repository normally checked out at `apps/hub-web`; it is ignored by
the parent Hub repository. The seven product repositories follow the same nested-repository model
under `products/`. The parent repository currently tracks documentation only, not the application
or product source trees.

## 3. Executable verification results

### Hub control plane

- `npm ci`, TypeScript check, 15 Vitest tests, and production build passed.
- The client build emitted an approximately 800 kB minified main-chunk warning.
- `npm audit` reported 8 findings: 5 moderate, 2 high, and 1 critical.
- No GitHub Actions workflow, release tag, `SECURITY.md`, `CODEOWNERS`, or detected branch protection.
- The product-event endpoint uses one shared HMAC secret while accepting an arbitrary
  `productSlug`. A compromised emitter could therefore impersonate another product. The contract
  also lacks a signed timestamp/replay window, explicit body-size limit, and per-product key ID.
- The Worker reads the complete webhook body into memory before validation.
- Asset upload trusts the declared MIME family and publishes to a public bucket; content sniffing,
  active-content rejection, malware scanning/quarantine, and orphan cleanup need explicit evidence.

### BK01 — booking

- `npm ci` completed, but `npm run lint` failed in `booking-admin` with 12 errors and 6 warnings;
  `booking-consumer` added 8 warnings.
- The root build is not clean-clone reproducible because `prebuild` expects an untracked
  `.env.local`; the audit intentionally did not create or read a production configuration.
- There is no application test runner/configuration or application test file on `main`; the SQL QA
  scripts do not cover the Next.js route/auth/UI layer.
- `npm audit --package-lock-only` reported one high-severity transitive finding.
- There is an old, highly divergent `feat/phase-e4-3-e4-5-stripe-billing` branch. It must be
  dispositioned explicitly, not merged mechanically.

### PS01 — PawSpace

- Frozen install, lint, and production build passed.
- Nine TypeScript test files exist, but the repo does not include `tsx`, has no standard `test`
  script, and a clean clone cannot run those files using their historical command. Each attempted
  `pnpm exec tsx tests/*.test.ts` failed because the executable is absent.
- The existing `test:e2e` path has external/local-Supabase prerequisites and was not treated as a
  clean-clone gate in this pass.
- pnpm audit reported no known vulnerability at audit time.
- `docs/COMMERCIAL_READINESS.md` still marks subscription lifecycle, transition rules, and trial
  expiry as unimplemented even though Phase 13 now contains the lifecycle schema/RPCs. Payment
  collection remains absent; the document must distinguish those states.
- [GitHub issue #2](https://github.com/Gutumrod/pawspace/issues/2) remains open for the `PawSpace`
  brand-name collision risk.

### LK01 — WSTERA Link

- The default branch is documentation/reference material only; it has no runnable application,
  manifest, CI, release, or production test suite.
- Locked product decisions already require redirects not to wait synchronously for analytics. The
  billing integration must likewise stay off the redirect hot path.

### DC01 — DocCraft

- Frozen install, typecheck, 118 Vitest tests, production build, and 32 Chromium Playwright tests
  passed.
- pnpm audit reported one critical development-tool finding in the pinned Vitest version.
- Gate 4 is independently closed, but Gate 3 remains `REMEDIATE` until a human completes real
  Chrome and Edge native print-preview acceptance. Phase 5 remains blocked by the product's own
  process.
- The registry description still reports only Phase 1–2 and is stale against the Phase 4 head.

### MT01 — Multi-Tenant AI

- The reference server typecheck and 13 tests passed.
- `npm audit` for the server reported 5 findings: 3 moderate, 1 high, and 1 critical.
- The server deliberately uses in-memory repositories, stubbed integrations, demo routes, and no
  production database/migrations/frontend/deployment system.
- No repository-level release orchestration, license, release tag, compatibility policy, or buyer
  artifact exists.

### CM01 — Booking Ticket Module

- Clean install, typecheck, 61 Vitest tests, and production build passed.
- Browser E2E was not completed in this pass because the exact Playwright browser binary selected by
  the old lockfile was not installed. The README does document the required install step, so this is
  an unverified gate rather than a confirmed product defect.
- `npm audit` reported 6 findings: 1 moderate, 3 high, and 2 critical, concentrated in the pinned
  build/test toolchain.
- MIT license exists, but no release tag, CI workflow, changelog, buyer artifact, or dependency
  license report exists.
- Local storage is correctly disclosed as demo persistence; a sellable host integration still needs
  a verified adapter contract/reference implementation or an explicit local-only scope lock.

### HC01 — Headless Commerce

- `master` contains four modules and an unfinished `BRIEF.md`; it does not contain an integrated
  service.
- [PR #1](https://github.com/Gutumrod/headless-commerce/pull/1) (`feat/reference-server`) is open and
  GitHub reports it mergeable, but the branch is a reference server using local filesystem
  persistence with no authentication or production tenant boundary. It must not be equated with a
  production application.
- On the feature branch, typecheck passed but the suite passed 13/14 tests. The oversized-import
  test failed with `EPIPE` in the full suite and in three consecutive focused reruns, so the failure
  was reproducible on this audit host.
- `npm audit` for that server reported 13 findings: 3 low, 5 moderate, 4 high, and 1 critical. Some
  high findings affect the runtime Express dependency, not only test tooling.
- No license, release tag, production database/migrations, auth, installer, or upgrade path exists.

## 4. Portfolio-wide findings

1. None of the seven product default branches, the parent Hub, or `hub-web` has a GitHub Actions
   workflow.
2. No product has a release tag. CM01 is the only one of the seven with a repository license file.
3. Branch protection was not detected through the GitHub API for the inspected default branches.
4. Several manifests use compatible/floating ranges, and supported Node/package-manager versions
   are not consistently declared.
5. Known high/critical dependency findings exist in Hub, BK01, DC01, MT01, CM01, and the HC01 feature
   server. Audit counts are time-sensitive and must be regenerated on each release commit.
6. The parent Hub contains two production-plan documents with conflicting authority language. Only
   `PORTFOLIO_PRODUCTION_MASTER_PLAN.md` may govern execution; the other document must be labeled as
   a supplemental independent review.
7. The centralized billing plan calls the PawSpace Supabase elevated key “scoped.” A Supabase secret
   or legacy service-role key is rotation-scoped when separately named, but remains project-wide and
   bypasses RLS. Billing-core must not hold that key under a least-privilege claim.
8. Documentation contains stale status claims for BK01, PS01, DC01, MT01, and HC01. Release evidence
   must always name the exact repository commit and environment.

## 5. Required plan corrections

- Add Hub/control-plane hardening as a first-class dependency, not an implicit platform task.
- Add a reproducible verification protocol: implementer self-test, automated regression, real
  environment E2E, adversarial/negative testing, then independent combined review.
- Add software-supply-chain, identity/account lifecycle, upload safety, SLO/RTO/RPO, API
  compatibility, and staged rollout gates.
- Replace shared product-event signing with signer identity bound to exactly one product.
- Replace billing-core's direct possession of a PawSpace project-wide elevated key with a narrow,
  signed ingress boundary, or record an explicit CEO security-risk acceptance before build.
- Keep billing and analytics dependencies off LK01's redirect hot path.
- Review HC01 PR #1 as input only; close its failing test and runtime vulnerabilities before deciding
  whether to merge, rewrite, or supersede it.
- Treat all historical test totals as stale until rerun from a frozen clean environment.

---

This audit is evidence for planning, not a production-readiness verdict. Each release must rerun the
applicable gates on its exact commit and real target environment.
