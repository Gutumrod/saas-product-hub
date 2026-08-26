# WSTERA 7-Product Production Master Plan

**Prepared by:** Codex  
**Commissioned by:** CEO, WSTERA  
**Repository:** `Gutumrod/saas-product-hub`  
**Website:** `wstera.com`  
**Date:** 2026-08-27  
**Status:** CEO-approved execution baseline  
**Scope:** Engineering, security, operations, product delivery, and launch readiness only

> Owner boundary: financial planning is deliberately excluded. This document does not set prices,
> revenue targets, budgets, unit economics, financial forecasts, or commercial package values. The
> CEO owns those decisions in a separate plan. Billing work here means only the technical machinery
> required to collect, reconcile, and enforce an owner-approved commercial configuration.

---

## 1. Authority and source-of-truth order

This document is the execution authority for taking the following seven repositories to real
production readiness:

| Code | Repository key | Delivery model |
|---|---|---|
| BK01 | `booking` | Subscription SaaS |
| PS01 | `pawspace` | Subscription SaaS |
| LK01 | `wstera_link` | Subscription SaaS |
| DC01 | `doccraft` | Subscription SaaS |
| MT01 | `multi_tenant_ai` | One-time source product |
| CM01 | `booking_ticket_module` | One-time source/template product |
| HC01 | `headless_commerce` | One-time source product |

When documents disagree, use this order:

1. A later explicit CEO decision.
2. This production master plan.
3. Product-specific locked architecture, PRD, security, and release documents.
4. `docs/platform/BILLING_CORE_PLAN.md` for the centralized billing implementation boundary.
5. `docs/products/registry.yaml` for catalog identity and declared acceptance state.
6. `docs/platform/ROADMAP.md` and older audit/evidence documents as historical evidence.

The product repositories remain independent repositories cloned under `products/` for local work.
They must not be embedded into the Hub git history as subtrees, submodules, or copied source trees.

---

## 2. Evidence baseline verified on 2026-08-27

The plan is based on direct inspection of the current default branches, not readiness claims alone.

| Product | Default branch and inspected head | Verified current state | Primary production gap |
|---|---|---|---|
| BK01 | `main` at `e99615d` | Two Next.js applications, Supabase migrations, auth, tenant, quota, Stripe and Cloudflare deployment scaffolding exist | No repository CI; automated application regression and live production evidence are incomplete |
| PS01 | `master` at `97c9fd6` | Next.js application, Supabase migrations, operational flows and substantial phase test evidence exist | No repository CI; payment activation, production operations and real-shop pilot evidence remain open |
| LK01 | `main` at `bf591e3` | Locked documentation and a retired prototype reference exist | No production application code exists |
| DC01 | `master` at `2a8652e` | Next.js local-first document application with unit and browser tests exists | Account, cloud persistence, centralized billing integration and production operations remain open |
| MT01 | `master` at `92139cf` | Reusable modules and an Express reference server exist | It is not a packaged, deployable, documented customer product |
| CM01 | `main` at `be37b0a` | React/Vite template with unit and Playwright tests exists | Persistence is local-only; packaging, adapters, buyer verification and release automation are incomplete |
| HC01 | `master` at `3147162` | Four independent modules exist on the default branch | No integrated service, database application, installer, release root or deployment contract exists |

Cross-portfolio observations:

- None of the seven inspected default branches contains a GitHub Actions workflow.
- Several manifests use floating compatible ranges such as `^`; releases are not uniformly
  reproducible from a declared runtime and lockfile policy.
- Historical evidence is useful but cannot replace rerunning the gate on the exact release commit.
- The Hub contains older scope and sequencing discussions. They must not silently reintroduce
  products outside the seven-product scope.

The commit hashes above are an intake snapshot, not permanent readiness assertions. Each phase must
refresh its own baseline before implementation.

---

## 3. Portfolio architecture boundaries

### 3.1 Hub responsibility

`wstera.com` is the portfolio storefront and staff control plane. It may own:

- product catalog and public product pages;
- product launch status and destination URLs;
- minimal customer-to-product installation summaries;
- signed, idempotent product lifecycle events;
- staff support and operational links;
- one-time artifact fulfillment metadata.

It must not become a browser-accessible super-database for product tenant data, and must not hold a
client-exposed key capable of crossing product boundaries.

### 3.2 Subscription products

- BK01 keeps its existing self-contained Stripe integration. Do not migrate it merely for symmetry.
- PS01, LK01, and DC01 integrate with the centralized service defined by
  `docs/platform/BILLING_CORE_PLAN.md`.
- Product authorization remains local to each product. A Hub account or payment record alone never
  grants access to tenant data.
- Every product defines its own account/tenant identity, roles, retention rules, and denial tests.

### 3.3 One-time products

- MT01, CM01, and HC01 are versioned source products, not hosted SaaS tenants.
- Deliverables must be produced from immutable tags with a checksum, changelog, license text,
  dependency inventory, installation guide, upgrade guide, security boundary, and support policy.
- No WSTERA production secret, customer record, live endpoint credential, or internal-only path may
  appear in a buyer artifact.
- A clean-environment buyer acceptance test is mandatory for every release.

### 3.4 Environments

Every hosted product and shared service uses separate local, preview, staging, and production
configuration. Preview and staging must never write to production data. Production secrets are
stored in the platform secret manager, never `.env` files committed to git.

---

## 4. Mandatory production gates

A product cannot be marked production-ready until all applicable gates have evidence linked to the
exact release commit.

### G0 — Scope and architecture

- PRD and explicit non-goals are current.
- Tenant, trust, data-flow, deployment, and external dependency boundaries are documented.
- Risk register identifies security, privacy, operational and vendor failure modes.
- Architecture review has no unresolved release blocker.

### G1 — Build integrity

- Runtime and package-manager versions are pinned.
- Direct dependencies are exact-versioned for release or controlled by an approved lockfile policy.
- Clean install, typecheck, lint, unit test and production build pass in CI.
- Generated artifact is reproducible and traceable to an immutable commit/tag.
- Dependency and secret scanning run automatically.

### G2 — Security and tenant isolation

- Threat model and authorization matrix are reviewed.
- Anonymous, unauthenticated, wrong-role, wrong-tenant, replay and privilege-escalation tests pass.
- Webhooks verify signatures before state mutation and process duplicates idempotently.
- Rate limits, abuse controls and safe error responses are active.
- Secrets are scoped, rotated when exposure is suspected, and absent from client bundles/logs.
- High-severity findings are closed; accepted residual risk is recorded by the CEO.

### G3 — Data and recovery

- Migration source of truth is unambiguous.
- Forward migration and forward-fix/rollback procedure are rehearsed in staging.
- Backup ownership, frequency, retention and restore procedure are documented.
- A restore rehearsal succeeds and its recovery time/data-loss observations are recorded.
- Export, deletion and retention behavior are tested for applicable personal data.

### G4 — Reliability and observability

- Structured logs use request/event IDs and redact credentials/personal data.
- Health checks, error tracking, latency, saturation and external dependency metrics are available.
- Alerts have a named recipient, severity and response runbook.
- Retry, timeout, circuit-breaker or dead-letter behavior is defined where external APIs are used.
- Load and concurrency tests cover the product's critical path.

### G5 — Product acceptance

- Critical user journeys pass in real browsers against staging.
- Accessibility and supported viewport checks pass.
- Empty, loading, error, retry and partial-failure states are verified.
- Customer-facing claims match implemented and tested behavior.
- Setup/onboarding can be completed from the published instructions.

### G6 — Release and operations

- Release, rollback/forward-fix, incident, support and status communication runbooks exist.
- Production configuration has been reviewed separately from staging.
- Smoke tests pass after deployment.
- On-call responsibility and escalation path are explicit, even if the CEO is the sole operator.
- Legal/privacy/support artifacts required by the product are published.

### G7 — Real-world validation

- Subscription SaaS: a controlled pilot completes the critical operational loop for the observation
  period defined in the product launch brief.
- One-time product: a clean-machine buyer simulation installs, runs, tests, upgrades and removes the
  product using only shipped materials.
- All findings are triaged; no P0/P1 issue remains open.
- CEO records a final Go/No-Go decision.

---

## 5. Portfolio execution phases

Phases describe dependency order, not financial timing. Parallel work is allowed only when it does
not bypass an earlier gate or overload the same production trust boundary.

### Phase P0 — Establish the release system

Deliverables:

1. Add a standard CI baseline to each product: install, typecheck, lint, test, build, dependency
   audit, secret scan and artifact retention where applicable.
2. Pin Node/package-manager/runtime versions and document the lockfile update policy.
3. Add repository-level `SECURITY.md`, release checklist, incident contacts and vulnerability
   handling policy.
4. Define environment naming, secret ownership and domain ownership.
5. Create a common evidence template containing commit, environment, commands, outputs, reviewer,
   known limitations and Go/No-Go result.
6. Confirm branch protection and required checks on each default branch.

Checkpoint **P0-C1 — Release foundation ready**:

- Seven CI pipelines run on clean clones.
- No pipeline relies on an untracked local file.
- All build/test commands are documented and reproducible.
- Initial threat model and release owner exist for every product.

### Phase P1 — Platform integration foundation

Deliverables:

1. Preserve the Hub as catalog/control plane with signed, minimal product events.
2. Execute the already locked `BILLING_CORE_PLAN.md`; do not create a competing billing design.
3. Keep BK01 billing isolated from billing-core.
4. Define a versioned contract for Hub installation summaries and one-time artifact fulfillment.
5. Add audit, idempotency, replay protection and operational dashboards to shared integrations.

Checkpoint **P1-C1 — Shared boundary proven**:

- Invalid signatures and replayed events cannot duplicate state changes.
- No browser can use a shared service credential to cross a product boundary.
- Billing-core's three prescribed test approaches have been completed and reviewed together.
- Shared-service failure behavior is documented for PS01, LK01 and DC01.

### Phase P2 — First release candidates

Run BK01 and CM01 as independent release tracks after P0-C1.

Checkpoint **P2-C1**: CM01 buyer artifact passes clean-machine acceptance.  
Checkpoint **P2-C2**: BK01 staging, security, recovery and pilot gates pass.  
Checkpoint **P2-C3**: CEO approves or rejects each launch independently.

### Phase P3 — Complete existing SaaS applications

Run DC01 and PS01 after their platform dependencies are available. Neither product may claim
readiness from UI completion alone.

Checkpoint **P3-C1**: DC01 data lifecycle, print/export, recovery and subscription authorization
pass.  
Checkpoint **P3-C2**: PS01 operational integrations, subscription transitions, privacy controls and
real-shop pilot pass.  
Checkpoint **P3-C3**: production smoke test and post-deploy observation complete for each product.

### Phase P4 — Build the new edge SaaS

Build LK01 only after P0 and the applicable P1 billing contract are stable. Redirect availability
must never depend synchronously on analytics processing.

Checkpoint **P4-C1**: tenant/security schema and redirect critical path pass.  
Checkpoint **P4-C2**: analytics, retention, domain ownership and abuse controls pass.  
Checkpoint **P4-C3**: load, recovery, staged rollout and production observation pass.

### Phase P5 — Productize the remaining source products

Productize MT01 before building HC01 because HC01 currently lacks an integrated application and has
the largest implementation surface.

Checkpoint **P5-C1**: MT01 installs and operates as a complete starter kit.  
Checkpoint **P5-C2**: HC01 integrated commerce service passes concurrency, migration and buyer
acceptance.  
Checkpoint **P5-C3**: both products have immutable, scanned, documented release artifacts.

### Phase P6 — Portfolio launch closure

1. Reconcile Hub catalog claims and live destination URLs with product evidence.
2. Verify support, incident, security contact, privacy, data deletion and status communication paths.
3. Run a portfolio-wide credential and dependency review.
4. Record each product's independent Go/No-Go decision; never declare all seven ready as a group
   when one product's evidence is missing.
5. Schedule post-launch reviews based on operational risk and observed incidents, not financial
   targets.

Checkpoint **P6-C1 — Portfolio externally operable**:

- Every listed live product links to its exact release evidence.
- Every non-live product is labeled accurately and cannot accept an unintended production action.
- A failure in one product or shared service has a documented containment and recovery procedure.

---

## 6. Product execution plans

### 6.1 BK01 — `booking`

**Target:** secure, observable multi-tenant booking SaaS deployed under a WSTERA subdomain.

Work packages:

1. **BK-A Baseline reconciliation** — refresh migration, environment, Stripe, LINE and Cloudflare
   state; list unresolved TODOs and verify that older evidence still matches the default branch.
2. **BK-B Automated release gate** — add CI, application tests and database/RLS regression. Cover
   hold expiry, collision, cancellation/reconfirmation, staff capacity, quota/top-up, role denial
   and locale-critical routes.
3. **BK-C Deployment** — validate both Workers builds, staging domains, production secrets, cache
   behavior, redirects and post-deploy smoke tests.
4. **BK-D External systems** — verify Stripe signatures/idempotency/reconciliation and LINE
   signatures/retries/rate limits with real sandbox/test endpoints.
5. **BK-E Recovery and operations** — database restore, failed-webhook replay, alerting, log redaction,
   incident and customer-support runbooks.
6. **BK-F Pilot** — controlled businesses exercise booking creation, staff allocation, payment
   transition, cancellation and recovery; collect defects as evidence.

Release checkpoint **BK-L1**:

- G0–G7 pass on one release commit.
- Both consumer and admin applications pass production smoke tests.
- Cross-tenant and quota enforcement are proven against the release database.
- No manual production step exists without a named owner and verification record.

### 6.2 PS01 — `pawspace`

**Target:** production pet hotel/daycare operations SaaS with tenant isolation and resilient external
integrations.

Work packages:

1. **PS-A Evidence refresh** — rerun migrations, RLS/RPC tests, application build and phase suites;
   resolve differences between evidence documents and committed source.
2. **PS-B CI and environments** — establish staging/production projects, deploy pipeline and secret
   boundaries for Supabase, LINE, Google and camera access.
3. **PS-C Billing-core connection** — implement only the contract locked in
   `BILLING_CORE_PLAN.md`; verify idempotent subscription transitions and fail-closed entitlements.
4. **PS-D Integration resilience** — test LIFF identity, LINE report delivery, Google Sheets retry
   and reconciliation, expired camera links and vendor outage recovery.
5. **PS-E Privacy and operations** — retention/deletion, audit logs, access expiry, backup/restore,
   alerts and staff support runbooks.
6. **PS-F Real-shop pilot** — staff complete reservation, check-in, care reporting, visitor access,
   checkout and failure recovery using real operational accounts.

Release checkpoint **PS-L1**:

- G0–G7 pass.
- No payment event can directly bypass the existing subscription transition guard.
- All external integrations have retry, observability and a documented degraded mode.
- Pilot findings are closed or explicitly accepted by the CEO.

### 6.3 LK01 — `wstera_link`

**Target:** Cloudflare-first multi-tenant link management and analytics SaaS.

Work packages:

1. **LK-A Contract lock** — reconcile the locked documents with billing-core; define tenant, role,
   domain, redirect, analytics, retention and deletion contracts before application migrations.
2. **LK-B Control plane** — build authentication, tenant membership, link CRUD, validation, RLS and
   audit trails with denial-first tests.
3. **LK-C Redirect plane** — implement a small edge path with validated destinations, cache policy,
   abuse controls and a failure mode independent of the analytics pipeline.
4. **LK-D Analytics plane** — asynchronous ingestion, batching, deduplication, aggregation,
   retention and deletion. Define acceptable event loss explicitly in the product SLO.
5. **LK-E Custom domains** — ownership challenge, certificate lifecycle, revalidation, removal and
   anti-takeover tests.
6. **LK-F Subscription authorization** — pull entitlements from billing-core with authenticated,
   cache-bounded and fail-closed behavior.
7. **LK-G Load and staged launch** — test redirect latency, burst traffic, queue backlog, database
   saturation and regional failure; release through staged traffic.

Release checkpoint **LK-L1**:

- G0–G7 pass.
- Redirect remains available when analytics processing is degraded.
- Cross-tenant custom-domain takeover and unsafe redirect tests fail safely.
- Retention/deletion removes both raw and aggregated attributable data as designed.

### 6.4 DC01 — `doccraft`

**Target:** reliable local-first document application with optional authenticated cloud capability.

Work packages:

1. **DC-A Preserve the local-first core** — rerun domain calculations, persistence migrations,
   image pipeline, import/export and recovery tests before adding cloud behavior.
2. **DC-B Print fidelity** — establish visual fixtures for supported documents, page breaks, Thai
   text, tax conditions, images and supported browsers/printers.
3. **DC-C Account and tenant boundary** — add authentication, document ownership, RLS, device/session
   control, export and deletion without breaking offline/local drafts.
4. **DC-D Cloud synchronization** — versioned envelope, conflict handling, retry, encryption,
   corruption recovery and local/cloud source-of-truth rules.
5. **DC-E Billing-core connection** — follow the forward-looking pull model already locked in the
   centralized plan; cache entitlements safely and fail closed for cloud-only operations.
6. **DC-F Production operations** — deployment, monitoring, backup/restore, browser matrix and
   staged user migration from local-only data.

Release checkpoint **DC-L1**:

- G0–G7 pass.
- Existing local documents remain usable through upgrade and temporary cloud outage.
- Calculation and printed output match the approved fixtures.
- Sync conflicts and corrupt backups recover without silent data loss.

### 6.5 MT01 — `multi_tenant_ai`

**Target:** complete self-hostable multi-tenant AI starter kit sold as a versioned source product.

Work packages:

1. **MT-A Product contract** — define exactly what the starter kit deploys, supported providers,
   supported runtime/database, extension points and explicit non-goals.
2. **MT-B Repository integration** — create root workspace orchestration; replace the demonstration
   start path with a production server, migrations, environment validation and health checks.
3. **MT-C Security** — tenant/RLS denial suite, provider-key custody, webhook verification,
   idempotency, SSRF/input limits, rate limits and audit logging.
4. **MT-D AI reliability** — timeouts, retry policy, provider failover, usage accounting, prompt/data
   isolation, safe error handling and observable request correlation.
5. **MT-E Deployment kit** — pinned dependencies, `.env.example`, database bootstrap, Docker or
   approved deployment path, production configuration and upgrade/forward-fix procedure.
6. **MT-F Buyer package** — license, documentation, examples, API contract, changelog, checksum,
   SBOM and automated buyer acceptance suite.

Release checkpoint **MT-L1**:

- G0–G6 and the one-time form of G7 pass.
- Clean-environment install works without access to WSTERA internal repositories or secrets.
- Tenant and provider credentials cannot cross boundaries.
- Upgrade from the immediately prior supported release is tested once releases exist.

### 6.6 CM01 — `booking_ticket_module`

**Target:** reusable case-management UI/source product with explicit host integration boundaries.

Work packages:

1. **CM-A Product boundary** — keep it distinct from BK01's native ticket system; describe it as a
   reusable module/template and remove hosted-backend implications.
2. **CM-B Persistence contract** — define typed adapter interfaces for list/read/create/update,
   authentication context, optimistic conflict, pagination and error mapping. Keep local storage as
   a documented demo adapter only.
3. **CM-C Host integration** — provide a production-quality reference adapter and theme/i18n
   integration guide without embedding customer credentials.
4. **CM-D Quality** — add lint to scripts, CI gates, accessibility, browser E2E, build artifact and
   dependency scanning.
5. **CM-E Buyer package** — versioned archive/package, license variants supplied by the CEO's
   commercial plan, changelog, compatibility matrix, upgrade guide, checksum and support boundary.

Release checkpoint **CM-L1**:

- G0–G6 and clean-machine buyer acceptance pass.
- A host can replace the demo adapter without changing UI domain code.
- Local storage limitations are visible and cannot be mistaken for production persistence.

### 6.7 HC01 — `headless_commerce`

**Target:** integrated self-hostable commerce API/source product, not a loose module collection.

Work packages:

1. **HC-A Product and domain contract** — lock catalog, variant, inventory, reservation, order,
   payment, media, import/export and tenant behavior; decide what is explicitly not included.
2. **HC-B Application shell** — create root workspace, API runtime, configuration validation,
   health/readiness endpoints and integration of the existing modules.
3. **HC-C Database** — versioned PostgreSQL migrations, tenant/RLS policies, inventory ledger,
   concurrency-safe reservations, idempotent commands and audit history.
4. **HC-D External boundaries** — object storage, signed uploads, validated import/export jobs and
   payment webhook verification without coupling buyers to WSTERA infrastructure.
5. **HC-E API product** — OpenAPI contract, pagination/filtering/errors, compatibility policy,
   example client/storefront and contract tests.
6. **HC-F Reliability** — load, contention, oversell, replay, job retry, backup/restore and migration
   rehearsal.
7. **HC-G Buyer package** — installer, `.env.example`, exact dependencies, seed/demo data, license,
   SBOM, checksum, upgrade guide and clean-machine acceptance.

Release checkpoint **HC-L1**:

- G0–G6 and clean-machine buyer acceptance pass.
- Concurrent inventory tests prove the documented oversell behavior.
- Payment and import replays cannot duplicate irreversible state.
- A buyer can deploy without any Project B or WSTERA production dependency.

---

## 7. Recommended engineering sequence

This sequence minimizes dependency conflicts and starts with the most mature deliverables. It is
not a financial prioritization:

1. Portfolio P0 release foundation.
2. CM01 productization and BK01 production hardening in parallel where ownership permits.
3. Centralized billing-core execution under its locked plan.
4. DC01 cloud-production track and PS01 production/pilot track.
5. MT01 starter-kit productization.
6. LK01 implementation from the locked pre-build specification.
7. HC01 integrated application and buyer package.
8. Portfolio P6 reconciliation and externally operable closure.

Do not launch a product merely because it is earlier in the sequence. Its own release gate controls
the decision.

---

## 8. Checkpoint record format

Every checkpoint record must include:

```text
Checkpoint ID:
Product / service:
Repository and commit:
Environment:
Scope tested:
Commands and automated results:
Manual scenarios and observations:
Security/negative-path results:
Known limitations:
Open P0/P1 issues:
Reviewer:
CEO decision: GO / NO-GO / CONDITIONAL
Evidence links:
```

`GO` applies only to the named commit and environment. A later change invalidates affected evidence
and reruns the relevant gates.

---

## 9. Definition of done for the portfolio

The seven-product initiative is complete only when:

- each product independently passes its applicable production gates;
- live Hub claims and links match actual product state;
- subscription products have tested entitlement and failure behavior without redefining the CEO's
  financial plan;
- one-time products have immutable, scanned, installable buyer artifacts;
- tenant and product boundaries have executable negative tests;
- backup/restore, incident response and support paths have been rehearsed;
- no P0/P1 defect remains open;
- each launch has a recorded CEO Go decision.

Until then, statuses must use precise language such as `docs-only`, `prototype`, `release
candidate`, `pilot`, or `production`, supported by current evidence.
