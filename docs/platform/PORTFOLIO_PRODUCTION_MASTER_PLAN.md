# WSTERA 7-Product Production Master Plan

**Prepared by:** Codex

**Commissioned by:** CEO, WSTERA

**Repository:** `Gutumrod/saas-product-hub`

**Website:** `wstera.com`

**Date:** 2026-08-27

**Status:** CEO-approved execution baseline — revision 3 after Commander Final Review Gate

**Scope:** Engineering, security, operations, product delivery, and launch readiness only

> Owner boundary: financial planning is deliberately excluded. This document does not set prices,
> revenue targets, budgets, unit economics, financial forecasts, or commercial package values. The
> CEO owns those decisions in a separate plan. Billing work here means only the technical machinery
> required to collect, reconcile, and enforce an owner-approved commercial configuration.

Revision history:

- **R1:** initial CEO-approved seven-product production baseline.
- **R2:** clean-slate re-audit added Hub as a gated dependency, executable baseline failures,
  supply-chain/identity/SLO gates, the V0–V5 verification protocol, a risk/decision register and
  billing-core least-privilege corrections. Evidence: `PORTFOLIO_REAUDIT_2026-08-27.md`.
- **R3:** Commander Final Review Gate (2026-08-27) returned `REMEDIATE` and the CEO ordered the
  remediated plan adopted as the project's execution route. R3 adds the §0 planning-input
  constraint, the P0a/P0b split, the single-track focus gate, the one-time-product L-ladder, buyer
  fulfillment as a first-class deliverable, the document-reconciliation worklist, the Hub
  pre-existing-condition record, the dual-billing runbook obligation, and the billing-core database
  placement decision. Review record: `D:\AI-Workspace\vault\06-Agent-Logs\SaaS-Product-Hub\
  2026-08-27-commander-final-review.md`.

## Current execution checkpoint - 2026-09-03

> **Status overlay, not revision 4.** Revision 3 and CEO decisions D1-D10 remain the execution authority. This section updates only verified gate/dependency state; it does not reopen scope, sequencing rules or owner decisions.

- **P0a-C1 = PASS (independent reassessment 2026-09-03).** The named CM01 blocker is closed: CM01 owning CI is green on `main@aeaa750` (run `33670789635`) and `hub-web` CI is green at `d8e31c7` (run `33593735430`). Both jobs run on GitHub-hosted runners after `actions/checkout@v4`, satisfying the checkpoint's clean-clone/no-untracked-local requirement. `CI_BASELINE.md` explicitly makes lint advisory/placeholder-only when the proving repository lacks installed lint tooling and assigns that closure to P0b; the missing lint step therefore does not invalidate P0a-C1. Independent evidence and verdict: `docs/platform/REVIEW-P0a-C1-2026-09-03.md`. Residual P0b lint/tooling debt remains blocking only at the per-repository release-readiness gate.
  Residual, non-blocking: three `registry.yaml` `path:` fields added after P0a-B4 remain mixed-case (`products/LINE OA AI Sales & Service Engine`, `products/RentMatrix`, `products/OmniDesk`). Per D5, lowercase them only in the same change that renames the physical directories.
- **Booking Stage 4 prerequisite = CLOSED** at `836943a`. PS-A2 is unblocked from that upstream dependency, but Pawstia is **not** admitted until its schema-scoped migration/RLS/grants/denial package is independently reviewed and explicit Project B admission is authorized.
- **Pawstia Phase 13 = NOT CLOSED.** Verification branch `c063592` / Draft PR #4 has clean migration replay + DB lint evidence but the matrix stopped at the historical Phase 1 isolation regression; final evidence and independent PASS do not exist yet.
- **R15 = OPEN / pre-data gate.** `apps/hub-web` runtime database access must move off the Project A `postgres` owner identity to scoped `hub_web_app` and prove billing-schema denial before billing data exists.
- **DC01 Gate 3/Gate 4 = CLOSED locally.** P0a-C1 is PASS. Before Phase 4.1 implementation, DocCraft must disposition its High JSON backup-controls contract finding and then complete mandatory intake/owner plan approval.
- **Payment rail addendum:** the 2026-09-01 council does not create another billing service. `BILLING_CORE_PLAN.md` remains canonical and now records card subscription as the recurring rail, PromptPay as a manual/non-auto-renew payment rail, and reconciliation as mandatory before PromptPay activation.

Operational status index: `docs/CURRENT_STATUS.md`.

---
## 0. Planning-input constraint

Three inputs may order this plan: **dependency order, engineering maturity, and risk.** Nothing
else may.

- **Financial inputs are excluded** by the owner boundary above. Price, revenue, budget, and
  forecast belong to the CEO's separate plan.
- **Usage and demand inputs are excluded** by the CEO order of 2026-08-27 recorded in
  `D:\AI-Workspace\vault\00-System\Decisions\agent-iron-rules.md`: current or projected user counts
  may not cut scope, lower a priority, or kill infrastructure and strategic work. Low or zero usage
  today is not evidence against building something. A scope cut must be justified from the
  long-term plan itself.

A proposal such as "ship this one first because it reaches users soonest," "validate demand before
building the next phase," or "defer this because nobody uses it yet" is out of order in this
document regardless of how reasonable it sounds. The same proposal restated as a dependency,
maturity, or risk fact — for example "this product has no billing-core dependency, so it does not
contend for the critical path" — is in order. Reviewers must reject the first form and accept the
second, and must not let the first form re-enter through a supplemental document.

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
6. `docs/platform/PORTFOLIO_REAUDIT_2026-08-27.md` for the latest intake evidence.
7. `docs/platform/ROADMAP.md` and older audit/evidence documents as historical evidence.

`docs/platform/PRODUCTION_LAUNCH_PLAN_2026-08-27.md` is retained as a supplemental independent
review. It is not a competing execution plan, and its effort, finance, price, revenue, sequencing,
and unresolved-owner-decision sections are non-authoritative.

The product repositories remain independent repositories cloned under `products/` for local work.
They must not be embedded into the Hub git history as subtrees, submodules, or copied source trees.

---

## 2. Evidence baseline verified on 2026-08-27

The plan is based on direct inspection and executable checks recorded in
`PORTFOLIO_REAUDIT_2026-08-27.md`, not readiness claims alone.

| Product | Default branch and inspected head | Verified current state | Primary production gap |
|---|---|---|---|
| BK01 | `main` at `e99615d` | Two Next.js applications, 28 Supabase migrations, auth, tenant, quota, Stripe and Cloudflare scaffolding exist | Clean lint fails, clean build depends on untracked environment state, and there is no application test suite or CI |
| PS01 | `master` at `97c9fd6` | Clean lint/build pass; Next.js application, Supabase migrations and operational flows exist; public name is now Pawstia (§10 D8) | TypeScript phase tests lack a checked-in runner/standard `test` script; billing, operations, internal Pawstia rename, social-handle claim, formal TH trademark search and real-shop pilot remain open |
| LK01 | `main` at `bf591e3` | Locked documentation and a retired prototype reference exist | No production application code exists |
| DC01 | `master` at `2a8652e` | Clean typecheck, 118 unit tests, build and 32 browser tests pass | Gate 3 manual Chrome/Edge print acceptance is open; a critical test-tool advisory and all cloud/SaaS work remain |
| MT01 | `master` at `92139cf` | Reference server typecheck and 13 tests pass | Server remains in-memory/demo-only; high/critical dependency findings, license, packaging and deployable product are open |
| CM01 | `main` at `be37b0a` | Clean typecheck, 61 unit tests and build pass; MIT license exists | High/critical toolchain findings, exact browser rerun, adapter/package/release automation and buyer verification remain |
| HC01 | `master` at `3147162` | Four independent modules exist; open PR #1 adds a local reference server | Default branch has no integrated product; PR server has no auth/persistent DB and reproducibly passes only 13/14 tests on the audit host |

The portfolio also depends on the private `Gutumrod/hub-web` control-plane repository (`main` at
`8a3e493` during intake). Its clean typecheck, 15 tests and build pass, but it has no CI/release tag,
has high/critical dependency findings, and its current shared HMAC product-event contract does not
cryptographically bind an emitter to one product.

Cross-portfolio observations:

- None of the seven product default branches, the parent Hub, or `hub-web` contains a GitHub Actions
  workflow.
- None of the seven products has a release tag; CM01 is the only one with a repository license.
- Default-branch protection was not detected through the GitHub API during intake.
- Several manifests use floating compatible ranges such as `^`; releases are not uniformly
  reproducible from a declared runtime and lockfile policy.
- Current dependency audits report at least one high or critical finding in Hub, BK01, DC01, MT01,
  CM01, and the HC01 feature server. Counts are time-sensitive and must be regenerated at release.
- Historical evidence is useful but cannot replace rerunning the gate on the exact release commit.
- The Hub contains older scope and sequencing discussions. They must not silently reintroduce
  products outside the seven-product scope.

The commit hashes above are an intake snapshot, not permanent readiness assertions. Each phase must
refresh its own baseline before implementation.

---

## 3. Portfolio architecture boundaries

### 3.1 Hub responsibility

`wstera.com` is the portfolio storefront and staff control plane. Its source is the separate private
`Gutumrod/hub-web` repository, normally cloned at `apps/hub-web`. It may own:

- product catalog and public product pages;
- product launch status and destination URLs;
- minimal customer-to-product installation summaries;
- signed, idempotent product lifecycle events;
- staff support and operational links;
- one-time artifact fulfillment metadata.

It must not become a browser-accessible super-database for product tenant data, and must not hold a
client-exposed key capable of crossing product boundaries.

Each product-event signer must have a separate identity/key bound server-side to exactly one product.
The signed envelope includes version, key ID, product ID, event ID, issued-at time and body digest;
the Hub enforces a short replay window, idempotency, body-size limit and rate limit before database
writes. A shared HMAC secret that permits any emitter to choose any `productSlug` is prohibited.

Hub installation summaries default to an opaque external account ID and operational status. Email,
name, notes or other personal data are stored only when a documented support purpose, retention rule,
access audit and deletion path exist.

Public asset uploads require magic-byte/content validation, active-content rejection, safe download
headers, bounded decoding, quarantine/malware policy and orphan cleanup. A caller-declared MIME type
alone is not sufficient evidence that a file is safe to publish.

**Pre-existing condition — the Hub is already public.** `wstera.com` has been serving from
Cloudflare Workers since 2026-08-25 with an empty catalog, so every product call-to-action renders
as "coming soon" and no product currently emits `product_installations` events. This predates the
plan and is not treated as a partial ship of it. Two consequences bind from R3 onward:

- The live Hub is a production surface. Any change to it — catalog rows, destination URLs,
  event contract, upload path, staff auth — follows the same gate and verification protocol as a
  product release, and its evidence names the exact `hub-web` commit.
- No product's destination URL or purchase path may be published on the Hub before that product's
  own release checkpoint records a CEO `GO`. An accurate "not yet available" state is the required
  behavior until then, never a link that appears live because it looks finished.

### 3.2 Subscription products

- BK01 keeps its existing self-contained Stripe integration. Do not migrate it merely for symmetry.
- PS01, LK01, and DC01 integrate with the centralized service defined by
  `docs/platform/BILLING_CORE_PLAN.md`.
- Billing-core may not hold a PawSpace project-wide elevated Supabase key. Per §10 D4 it reaches
  PawSpace only through the narrow signed Edge Function ingress that owns the elevated key
  internally; the risk-acceptance alternative is closed.
- Product authorization remains local to each product. A Hub account or payment record alone never
  grants access to tenant data.
- Every product defines its own account/tenant identity, roles, retention rules, and denial tests.
- Billing or entitlement lookup must not sit on LK01's redirect hot path or prevent DC01 local drafts
  from opening. Entitlements are synchronized/cached at control-plane boundaries with documented
  expiry and degraded behavior.

### 3.3 One-time products

- MT01, CM01, and HC01 are versioned source products, not hosted SaaS tenants, and are governed by
  the L0–L5 ladder in §4 in addition to the applicable G gates.
- Deliverables must be produced from immutable tags with a checksum, changelog, license text,
  dependency inventory, installation guide, upgrade guide, security boundary, and support policy.
- No WSTERA production secret, customer record, live endpoint credential, or internal-only path may
  appear in a buyer artifact.
- A clean-environment buyer acceptance test is mandatory for every release.

### 3.4 Environments

Every hosted product and shared service uses separate local, preview, staging, and production
configuration. Preview and staging must never write to production data. Production secrets are
stored in the platform secret manager, never `.env` files committed to git.

Required production variables are validated at startup/deploy and fail closed. Empty strings,
development defaults and mock adapters are forbidden in production. Each environment has separate
provider credentials, webhook endpoints, storage namespaces, data, alerts and rotation records.

---

## 4. Mandatory production gates

A product cannot be marked production-ready until all applicable gates have evidence linked to the
exact release commit.

### G0 — Scope and architecture

- PRD and explicit non-goals are current.
- Repository ownership, canonical checkout path/casing, default branch and source-of-truth files are
  recorded; a nested repo is never mistaken for tracked parent-repo source.
- Tenant, trust, data-flow, deployment, and external dependency boundaries are documented.
- Identity lifecycle covers signup/invite, verification, recovery, session revocation, role change,
  staff removal and break-glass administration where applicable.
- Risk register identifies security, privacy, operational and vendor failure modes.
- Non-financial architecture decisions are recorded in an ADR/decision log before implementation.
- Architecture review has no unresolved release blocker.

### G1 — Build integrity

- Runtime and package-manager versions are pinned.
- Direct dependencies are exact-versioned for release or controlled by an approved lockfile policy.
- Clean install, typecheck, lint, unit test and production build pass in CI.
- Generated artifact is reproducible and traceable to an immutable commit/tag.
- Dependency, license, secret, SAST and artifact scanning run automatically; full git history is in
  scope for secret scanning.
- No unaccepted high/critical dependency finding remains. Any exception names reachability,
  compensating control, owner, expiry and re-review date.
- Release provenance includes lockfile hash, SBOM, artifact checksum and source commit.

### G2 — Security and tenant isolation

- Threat model and authorization matrix are reviewed.
- Anonymous, unauthenticated, wrong-role, wrong-tenant, replay and privilege-escalation tests pass.
- Webhooks verify signatures before state mutation and process duplicates idempotently.
- Cross-product messages cryptographically bind signer identity to the authorized product and enforce
  timestamp/replay windows; account IDs supplied by callers are checked against authenticated
  ownership.
- Rate limits, abuse controls and safe error responses are active.
- Browser security headers, CSP, CSRF strategy, redirect allowlists and upload/content controls are
  verified where applicable.
- Secrets use the least privilege the provider actually supports, are rotated when exposure is
  suspected, and are absent from client bundles/logs. A key that bypasses RLS is always documented
  as project-wide even if it has a service-specific name.
- High-severity findings are closed; accepted residual risk is recorded by the CEO.

### G3 — Data and recovery

- Migration source of truth is unambiguous.
- Forward migration and forward-fix/rollback procedure are rehearsed in staging.
- Backup ownership, frequency, retention and restore procedure are documented.
- A restore rehearsal succeeds and its recovery time/data-loss observations are recorded.
- Export, deletion and retention behavior are tested for applicable personal data.
- The CEO approves explicit RTO and RPO targets before launch; restore evidence meets them.
- Schema/API changes include compatibility, backfill, partial-failure and zero/low-downtime behavior.

### G4 — Reliability and observability

- Structured logs use request/event IDs and redact credentials/personal data.
- Health checks, error tracking, latency, saturation and external dependency metrics are available.
- Alerts have a named recipient, severity and response runbook.
- Retry, timeout, circuit-breaker or dead-letter behavior is defined where external APIs are used.
- Load and concurrency tests cover the product's critical path.
- Product SLO/SLIs, synthetic checks, alert thresholds and degraded modes are approved and tested.
- Queued/background work proves retry exhaustion, poison-message handling, reconciliation and safe
  manual replay.

### G5 — Product acceptance

- Critical user journeys pass in real browsers against staging.
- Accessibility, Thai/English/i18n, timezone/calendar and supported browser/viewport checks pass.
- Empty, loading, error, retry and partial-failure states are verified.
- Customer-facing claims match implemented and tested behavior.
- Setup/onboarding can be completed from the published instructions.
- Authentication email/invite/recovery delivery and expiry behavior are tested when the product uses
  email identity.

### G6 — Release and operations

- Release, rollback/forward-fix, incident, support and status communication runbooks exist.
- Production configuration has been reviewed separately from staging.
- Smoke tests pass after deployment.
- DNS, TLS, security headers, cache rules, redirects and any required email-domain records are
  verified from outside the operator network.
- A staged/canary release and rollback or forward-fix trigger is defined; emergency disablement does
  not corrupt tenant state.
- On-call responsibility and escalation path are explicit, even if the CEO is the sole operator.
- Legal/privacy/support artifacts required by the product are published.
- For any subscription product, the incident and support runbooks state that the portfolio runs two
  independent billing implementations permanently — BK01's inline Stripe integration and
  billing-core — and route a provider-integration defect to both for triage. A runbook that names
  only one implementation does not pass this gate.

### G7 — Real-world validation

- Subscription SaaS: a controlled pilot completes the critical operational loop for the observation
  period defined in the product launch brief.
- One-time product: a clean-machine buyer simulation installs, runs, tests, upgrades and removes the
  product using only shipped materials.
- All findings are triaged; no P0/P1 issue remains open.
- The final reviewer is independent from the implementation pass and reruns evidence rather than
  accepting an agent-authored report.
- CEO records a final Go/No-Go decision.

### One-time product release ladder (L0–L5)

G0–G7 were written for a hosted service. MT01, CM01 and HC01 are versioned source products: the
buyer operates them, so uptime, tenant SLOs and end-customer privacy obligations do not transfer,
while a different body of evidence — which no product in this portfolio has ever produced — does.
For those three products G0–G6 apply as written where they concern the source itself, G7 takes its
one-time form, and the following ladder is mandatory in addition. A one-time product is not
release-ready until every rung has evidence.

| Gate | Name | Passes when |
|---|---|---|
| **L0** | Buyer and scope lock | Who buys it, what they can build with it, what ships and what explicitly does not, are written and current. HC01's `BRIEF.md` is an empty checklist and fails this gate today. |
| **L1** | Clean-install proof | A person who did not write the code clones the default branch onto a clean machine, follows only the shipped instructions, and reaches a running, passing state with no undocumented step and no access to WSTERA repositories or secrets. |
| **L2** | License and IP | The product has its own license and buyer-facing terms, and a full dependency-license audit shows nothing that forbids redistribution. CM01 has a license; MT01 and HC01 do not. |
| **L3** | Packaging and versioning | An immutable tag, changelog, checksum, SBOM, compatibility matrix and a written post-purchase update policy exist for the exact released artifact. |
| **L4** | Fulfillment path | A buyer can complete purchase and receive the artifact or repository access through a path that has been exercised end to end, including a failed and a repeated delivery. |
| **L5** | Support boundary | What is supported, what is not, and the response commitment are published before the first sale, not after it. |

L4 is the portfolio's largest untested surface for these products and is delivered under P1 as a
Hub capability, not improvised per product. Its scope, ordering and gating are engineering
decisions; the commercial terms it carries are not, and stay in the CEO's separate plan.

### Verification protocol applied to every release candidate

1. **V0 — Baseline:** refresh remote/default branch, working tree, runtime versions, lockfile,
   environment inventory and known open issues before changing code.
2. **V1 — Implementer self-test:** the implementer runs the smallest complete local loop and records
   failures without declaring a production gate passed.
3. **V2 — Automated regression:** clean install, static checks, unit/integration/contract/database
   tests and production build run from one documented CI entrypoint.
4. **V3 — Real-environment E2E:** use real staging services/provider sandboxes and real browsers;
   mocks alone cannot close an external-system gate.
5. **V4 — Adversarial and failure-path:** cover tamper, replay, wrong tenant/role, concurrency,
   timeout, retry exhaustion, provider outage, restore and rollback/forward-fix boundaries.
6. **V5 — Independent combined review:** a reviewer inspects code and reviews V2–V4 together, reruns
   representative evidence, records limitations, then returns `PASS` or `REMEDIATE`.

No public/live release occurs between V1 and V5. A later code, dependency, configuration or provider
change invalidates the affected evidence and reruns the relevant stages.

---

## 5. Portfolio execution phases

Phases describe dependency order, not financial timing. Parallel work is allowed only when it does
not bypass an earlier gate or overload the same production trust boundary.

#### Focus gate — binding, not advisory

Seven products and two shared services are executed by one operator with agent assistance. The
dominant failure mode is not a wrong technical decision; it is every product reaching roughly
eighty percent while none reaches a release checkpoint, because attention moved before anything
closed. Sequencing advice alone has never prevented this, so it is a gate:

- At most **one heavy track** and **one bounded track** are open at a time. A heavy track is a
  product advancing toward its own release checkpoint. A bounded track is scoped work with a
  written exit condition that does not require sustained design attention.
- A new heavy track may open only when the current one has recorded a CEO `GO`, `NO-GO` or
  `CONDITIONAL` decision at its release checkpoint, **or** the CEO explicitly authorizes the
  overlap in writing, naming what is being accepted.
- A heavy track blocked by an external dependency is **paused, not replaced**: the blocker, its
  owner and the resume condition are recorded, and the slot stays assigned to it unless the CEO
  reassigns it.
- Opening a track "because it is small" is the exact move this gate exists to stop. Size is not the
  criterion; a recorded closing decision is.

This gate constrains concurrency only. It never removes a product from scope, reorders by usage or
demand, or downgrades anything for being early — see §0.

### Phase P0 — Establish the release system

P0 is split. **P0a is portfolio-wide and blocks every product.** **P0b is per-repository and travels
with that repository's own track** — it must be complete for a repository before that repository's
first release checkpoint, and it does not hold a different product hostage. Bundling the two was a
single front-loaded gate whose slowest repository stalled all seven.

**P0a — portfolio foundation (blocks all product work):**

1. Publish a repository map for the parent Hub, private `hub-web`, seven products and future
   `billing-core`: remote URL, canonical local path/casing, default branch, owner and release
   authority. Resolve `PawSpace`/`pawspace` and `DocCraft`/`doccraft` path casing before automation
   depends on case-sensitive paths. Hostname convention is already decided (§10 D1); this step only
   records it in the map.
2. Define — not yet install everywhere — the standard CI baseline every repository must run: frozen
   install, typecheck, lint, test, build, dependency/license audit, history-aware secret scan, SAST
   and artifact retention where applicable. Publish it as a reusable definition, and prove it on
   `hub-web` and one product before it is replicated.
3. Pin the supported Node/package-manager/runtime matrix and document the lockfile update policy.
4. Define environment naming, required-variable validation, secret ownership, domain ownership,
   RTO/RPO/SLO decision owner and external-provider inventory.
5. Create a common evidence template containing commit, lockfile/artifact digest, environment,
   commands, outputs, reviewer, known limitations and Go/No-Go result.
6. Reconcile the documents that currently contradict the code, because a stale status document is
   how a gate gets skipped by accident. At minimum: BK01 is recorded as feature-complete while
   having no application test layer, so restate it as `feature complete, not production safe`;
   PS01's `COMMERCIAL_READINESS.md` must separate "subscription lifecycle schema implemented" from
   "payment collection absent" instead of denying both; `ROADMAP.md` describes an HC01 reference
   server and its passing tests as if they exist on the default branch when they exist only on the
   open PR; `ROADMAP.md` §A1 still carries CM01's superseded 2026-08-21 removal against the
   2026-08-27 seven-product lock; `ROADMAP.md`'s "Project B routing truth" table still routes
   `booking` to `booking.wstera.com` against the decided code-host convention (§10 D1); DC01's
   registry description still reports Phase 1–2 against a Phase 4 head; and every mixed-case nested
   path (`products/PawSpace`, `products/DocCraft`, including `registry.yaml`'s `path:` fields) is
   corrected to all-lowercase per §10 D5.

Checkpoint **P0a-C1 — Portfolio foundation ready**:

- The repository map, runtime matrix, environment/secret ownership, evidence template and CI
  definition are published and unambiguous.
- The CI definition runs green on `hub-web` and on the first product to adopt it, from clean clones,
  with no reliance on an untracked local file.
- Every document listed in P0a item 6 matches the code at a named commit.

**P0b — per-repository release readiness (blocks that repository only):**

1. Install the P0a CI baseline on the repository and prove it from a clean clone, including the
   correct browser/runtime installation step.
2. Close that repository's known intake blockers: BK01's lint failures, untracked-environment build
   dependency and absent application test entrypoint; PS01's missing test runner and standard `test`
   script; HC01's reproducible failing oversized-import test; and the high/critical dependency
   findings recorded for Hub, BK01, DC01, MT01, CM01 and the HC01 feature server.
3. Add `SECURITY.md`, release checklist, incident contacts, vulnerability policy, license and
   release/version policy appropriate to that product.
4. Enable branch protection and required checks on its default branch, and explicitly disposition
   stale, divergent and unmerged feature branches rather than merging them mechanically.
5. Record its initial threat model and named release owner.

Checkpoint **P0b-C1 — Repository release-ready** (recorded once per repository):

- Required checks pass on the default branch and are enforced.
- No unaccepted high/critical advisory and no failing required check remains.
- Threat model, release owner and security/release policy files exist.

A repository has not entered its release track until its own P0b-C1 is recorded. `billing-core`
records both checkpoints when its service skeleton is created.

### Phase P1 — Platform integration foundation

Deliverables:

1. Harden Hub as catalog/control plane: per-product signer identity, timestamped/versioned envelopes,
   bounded requests, replay window, rate limiting, minimized PII and safe public asset handling.
2. Execute `BILLING_CORE_PLAN.md` after its least-privilege amendment; do not create a competing
   billing service.
3. Keep BK01 billing isolated from billing-core.
4. Define a versioned contract for Hub installation summaries.
5. Build the one-time product fulfillment path as a Hub capability in its own right, not as
   metadata attached to something else. It must deliver an artifact or repository grant to a buyer,
   be idempotent under repeated and retried delivery, fail visibly rather than silently, record who
   received which immutable version, and support revocation and re-issue. This is the L4 rung for
   MT01, CM01 and HC01, and it is built once and shared. It carries whatever commercial terms the
   CEO's separate plan sets and defines none of them.
6. Keep billing-core and analytics off LK01's redirect hot path and preserve DC01 local/offline
   access during a billing outage.
7. Add durable event intake, audit, idempotency, reconciliation, replay tooling and operational
   dashboards to shared integrations.
8. Record vendored-module upstream commit/checksum and add a drift/update test so fixes do not split
   silently across `modules-hub`, billing-core and product copies.

Checkpoint **P1-C1 — Shared boundary proven**:

- Invalid signatures and replayed events cannot duplicate state changes.
- A valid signer for one product cannot emit an event for another product.
- No browser can use a shared service credential to cross a product boundary.
- Billing-core cannot use its PawSpace credential to perform arbitrary project-wide Data API access.
- Billing-core's three prescribed test approaches have been completed and reviewed together.
- Shared-service failure behavior is documented for PS01, LK01 and DC01.
- The fulfillment path has delivered, re-delivered and revoked a test artifact end to end.

### Phase P2 — First release candidates

Run BK01 as the heavy track and CM01 as the bounded track after P0a-C1 and each repository's own
P0b-C1, subject to the focus gate above.

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

**HC01 scope is written here, at the start of P5, by the CEO (§10 D9)** — before that the CEO
decides API skeleton vs full commerce backend vs Thailand-first order model, and HC-B locks the
domain contract against it. HC-A (PR #1 disposition + advisory/test cleanup) is done earlier and is
not gated by the scope decision.

Checkpoint **P5-C1**: MT01 installs and operates as a complete starter kit.

Checkpoint **P5-C2**: HC01 meets its CEO-written scope and passes the concurrency, migration and
buyer-acceptance gates applicable to that scope.

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
   state; list unresolved TODOs; fix current lint failures; make build/config validation reproducible
   from a clean clone; disposition the divergent Stripe feature branch; and verify that older
   evidence still matches the default branch.
2. **BK-B Automated release gate** — add CI, application tests and database/RLS regression. Cover
   signup/login/recovery/session behavior, hold expiry, collision, cancellation/reconfirmation,
   staff capacity, quota/top-up, role denial, both webhook routes and locale-critical browser flows.
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

### 6.2 PS01 — `pawspace` (public name: Pawstia)

**Target:** production pet boarding/daycare operations SaaS with tenant isolation and resilient
external integrations. Public name is **Pawstia** (§10 D8); repo key stays `pawspace`.

Work packages:

1. **PS-A Evidence refresh** — rerun migrations, RLS/RPC tests, application build and phase suites;
   add `tsx` or an approved runner plus one standard `test` entrypoint; resolve differences between
   `COMMERCIAL_READINESS.md`, evidence documents and committed Phase 13 source.
1a. **PS-A2 Project B schema migration** — per §10 D10, PS01 runs as the `pawspace` schema inside
   Project B (`gyleqrjdzwwlqierdwcy`), not its own project. Rewrite the 12 migrations from `public`
   to a `pawspace` schema, keep `auth.users` references but authorize only through the product's own
   membership table, and submit the schema contract / RLS matrix / grants / denial suite for Project
   B admission (`SHARED_SAAS_RUNTIME_PROJECT_B_PLAN.md` §3, Phase 3). **Booking's Project B
   migration-history prerequisite is closed** by Stage 4 Option A reconciliation at Booking commit
   `836943a` (26 migration pairs reconciled; dry-run shows only the two intentionally pending
   migrations). PS-A2 is therefore unblocked to perform Pawstia's own schema rewrite, contract/RLS/
   grants/denial review and explicit admission authorization; this does **not** mean Pawstia is
   already admitted to Project B.
2. **PS-B CI and environments** — deploy pipeline and secret boundaries for Supabase (the Project B
   schema and its Edge Functions), LINE, Google and camera access. Staging is a `pawspace_staging`
   schema inside Project B with its own scoped role — not a new project, not a branch DB (§10 D10;
   no Pro budget).
3. **PS-C Billing-core connection** — implement only the contract locked in
   `BILLING_CORE_PLAN.md`; verify idempotent subscription transitions and fail-closed entitlements.
4. **PS-D Integration resilience** — test LIFF identity, LINE report delivery, Google Sheets retry
   and reconciliation, expired camera links and vendor outage recovery.
5. **PS-E Privacy and operations** — retention/deletion, audit logs, access expiry, backup/restore,
   alerts and staff support runbooks.
6. **PS-F Brand and namespace gate** — public name is **Pawstia** (§10 D8); the `PawSpace` name hit
   a live US trademark and was dropped. This gate closes when: the internal rename (`pawspace` →
   `pawstia` in slug, UI copy, docs) is done — `product_id`/`PS01` unchanged, repo rename optional
   and later; the `@pawstia` handles on IG/FB/X are claimed; and a formal Thai attorney trademark
   search comes back clear. Engineering proceeds under the repo key `pawspace`; customer-facing
   surfaces use Pawstia.
7. **PS-G Real-shop pilot** — staff complete reservation, check-in, care reporting, visitor access,
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
   abuse controls and a failure mode independent of the analytics and billing services.
4. **LK-D Analytics plane** — asynchronous ingestion, batching, deduplication, aggregation,
   retention and deletion. Define acceptable event loss explicitly in the product SLO.
5. **LK-E Custom domains** — ownership challenge, certificate lifecycle, revalidation, removal and
   anti-takeover tests.
6. **LK-F Subscription authorization** — pull/synchronize entitlements only on authenticated
   control-plane and scheduled boundaries. Persist a bounded local entitlement snapshot; fail closed
   for premium mutations without placing billing-core on every redirect request.
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

1. **DC-A Preserve the local-first core** — remediate the critical test-tool advisory, then rerun
   domain calculations, 118-test baseline, persistence migrations, image pipeline, import/export,
   32 browser tests and recovery behavior before adding cloud functionality.
2. **DC-B Close existing Gate 3** — complete the product's required human Chrome and Edge native
   print-preview acceptance. Establish fixtures for supported documents, page breaks, Thai text,
   tax conditions, images and supported browsers/printers; do not open Phase 5 before PASS.
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
   supported runtime/database, extension points and explicit non-goals. Replace the registry's
   “production-ready boilerplate” claim until these gates actually pass.
2. **MT-B Repository integration** — create root workspace orchestration; replace the demonstration
   start path and in-memory repositories with a production reference implementation, migrations,
   environment validation, health/readiness checks and clean install command.
3. **MT-C Security** — tenant/RLS denial suite, provider-key custody, webhook verification,
   idempotency, SSRF/input limits, rate limits and audit logging.
4. **MT-D AI reliability** — timeouts, retry policy, provider failover, usage accounting, prompt/data
   isolation, safe error handling and observable request correlation.
5. **MT-E Deployment kit** — remediate dependency advisories, pin dependencies, add `.env.example`,
   database bootstrap, Docker or
   approved deployment path, production configuration and upgrade/forward-fix procedure.
6. **MT-F Buyer package** — license, documentation, examples, API contract, changelog, checksum,
   SBOM and automated buyer acceptance suite.

Release checkpoint **MT-L1**:

- G0–G6 and the one-time form of G7 pass.
- Clean-environment install works without access to WSTERA internal repositories or secrets.
- Tenant and provider credentials cannot cross boundaries.
- Upgrade from the immediately prior supported release is tested once releases exist.

### 6.6 CM01 — `booking_ticket_module`

**Target:** reusable case-management UI/source template, sold as source, with local storage as the
only shipped adapter. Per §10 D6, no production backend adapter is built in this initiative.

Work packages:

1. **CM-A Product boundary** — keep it distinct from BK01's native ticket system; describe it as a
   reusable UI/source template and remove hosted-backend implications.
2. **CM-B Persistence contract** — the deliverable is deliberately local-only. Document the storage
   adapter interface (list/read/create/update, error shape) clearly enough that a buyer can write
   their own backend adapter against it, but ship only the local-storage implementation. The sale
   materials state plainly that a persistent backend is the buyer's responsibility.
3. **CM-C Host integration** — provide the theme/i18n integration guide and the adapter interface
   documentation; no reference backend adapter, no customer credentials anywhere.
4. **CM-D Quality** — remediate high/critical toolchain advisories, add lint to scripts, CI gates,
   exact Playwright browser provisioning, accessibility, browser E2E, build artifact and dependency
   scanning.
5. **CM-E Buyer package** — versioned archive/package, license variants supplied by the CEO's
   commercial plan, changelog, compatibility matrix, upgrade guide, checksum and support boundary.

Release checkpoint **CM-L1**:

- G0–G6, L0–L5 and clean-machine buyer acceptance pass.
- Local storage limitations are stated in the product materials and in the running UI, and cannot
  be mistaken for production persistence.

### 6.7 HC01 — `headless_commerce`

**Target:** an integrated self-hostable commerce source product. Per §10 D9, HC01 is a committed
portfolio target but **deferred**: its scope (API skeleton vs full commerce backend vs
Thailand-first order model) is decided when phase P5 opens, not now. Only HC-A is authorized before
then. This section's HC-C onward is the shape the plan currently assumes and will be re-locked
against the CEO's P5 scope.

Work packages:

1. **HC-A Branch and evidence disposition** — independently review open PR #1; fix its reproducible
   oversized-import `EPIPE` failure and high/critical runtime/tooling advisories. Treat the local
   reference server as reusable input only, then explicitly merge, rewrite or supersede it. This
   work is valid under any scope and **is the only HC01 work authorized before P5**.
2. **HC-B Product and domain contract** — at P5, after the CEO writes the scope (§10 D9), replace the
   unfinished BRIEF with locked catalog, variant, inventory, reservation, order, payment, media,
   import/export, tenant and non-goal contracts. This is the L0 gate and blocks everything below it.
3. **HC-C Application shell** — create root workspace, API runtime, authentication/authorization,
   configuration validation, health/readiness endpoints and integration of reviewed modules.
4. **HC-D Database** — versioned PostgreSQL migrations, tenant/RLS policies, inventory ledger,
   concurrency-safe reservations, idempotent commands and audit history.
5. **HC-E External boundaries** — object storage, signed uploads, validated import/export jobs and
   payment webhook verification without coupling buyers to WSTERA infrastructure.
6. **HC-F API product** — OpenAPI contract, pagination/filtering/errors, compatibility policy,
   example client/storefront and contract tests.
7. **HC-G Reliability** — load, contention, oversell, replay, job retry, backup/restore and migration
   rehearsal.
8. **HC-H Buyer package** — installer, `.env.example`, exact dependencies, seed/demo data, license,
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

1. P0a portfolio foundation, then P0b for each repository as its track opens.
2. Hub event/upload hardening and BK01 production hardening; CM01 dependency/clean-buyer work may run
   as the bounded secondary track.
3. Billing-core least-privilege amendment and centralized service execution.
4. Close DC01's existing print gate, then run DC01 cloud-production and PS01 production/pilot tracks.
5. MT01 starter-kit productization.
6. LK01 implementation from the reconciled pre-build specification.
7. HC01 PR disposition, integrated application and buyer package.
8. Portfolio P6 reconciliation and externally operable closure.

Do not launch a product merely because it is earlier in the sequence. Its own release gate controls
the decision. Equally, do not reorder this sequence because a product looks closer to users or to a
first sale — that input is excluded by §0. Only a dependency, maturity or risk fact reorders it.

---

## 8. Checkpoint record format

Every checkpoint record must include:

```text
Checkpoint ID:
Product / service:
Repository and commit:
Default branch and clean-tree status:
Runtime/package-manager versions:
Lockfile hash:
Environment:
Scope tested:
Commands and automated results:
Manual scenarios and observations:
Security/negative-path results:
Dependency/license/secret scan results:
Migration/restore and RTO/RPO results:
SLO/alert/degraded-mode results:
Known limitations:
Open P0/P1 issues:
Reviewer:
CEO decision: GO / NO-GO / CONDITIONAL
Artifact/tag/checksum:
Evidence links:
```

`GO` applies only to the named commit and environment. A later change invalidates affected evidence
and reruns the relevant gates.

---

## 9. Portfolio risk register

| ID | Risk | Severity | Required control |
|---|---|---|---|
| R1 | BK01 has no application regression suite and current clean lint/build gates fail | Critical | Close BK-A/B before production deployment or feature expansion |
| R2 | Billing-core directly holding a PawSpace project-wide RLS-bypass key expands compromise blast radius | Critical | Decided §10 D4 — narrow signed Edge Function ingress only; billing-core never holds the elevated key; ingress built and tested in billing-core Phase 0.5 |
| R3 | Hub's shared HMAC secret lets one product signer impersonate another product | High | Decided §10 D2 — per-product HMAC keys bound to one product ID, with timestamp and replay window; shared secret retired at P1 |
| R4 | Hub and products have no CI, release tags, and detected branch protection | High | P0a-C1 CI definition and per-repository P0b-C1 required checks and protected release flow |
| R5 | Known high/critical dependency findings can ship to operators or buyers | High | Remediate or record reachability-based exception with expiry before release |
| R6 | Seven products plus shared services can remain partially complete through context switching | Critical | §5 focus gate as a binding concurrency limit — a recorded CEO decision or written overlap authorization is required before a second heavy track opens |
| R7 | HC01's open branch can be mistaken for production-ready because it contains a server/tests | High | Independent PR disposition; fix failing test, auth/persistence and advisories before integration |
| R8 | Stale/conflicting status documents can override current code evidence | High | Authority order, exact-commit evidence and same-change documentation updates |
| R9 | LINE, Google, Stripe, Supabase, Cloudflare and storage failures cross operational boundaries | High | Per-provider timeout/retry/reconciliation/degraded-mode runbooks and alerts |
| R10 | Naming/path case drift and the PawSpace trademark collision can force late migrations | Low | Hostname settled (§10 D1); path casing all-lowercase (§10 D5); PawSpace renamed to Pawstia (§10 D8) after a clean collision screen — residual: internal rename, social-handle claim, formal TH trademark search before public launch (PS-F) |
| R11 | Hub stores cross-product customer PII beyond its minimal control-plane role | Medium | Data minimization, field purpose, access audit, retention and deletion verification |
| R12 | Source products can expose WSTERA secrets, unsupported dependencies or unclear IP rights | High | Clean-room packaging, full-history secret scan, license audit, SBOM and buyer acceptance |
| R13 | No product has a working fulfillment path, so a finished one-time product still cannot be delivered to a buyer | High | L4 built once as the P1 Hub capability with idempotent, revocable, recorded delivery proven at P1-C1 |
| R14 | Billing-core shares the Hub project database with the public storefront (decided §10 D3) | Medium | Dedicated schema, dedicated scoped Postgres role, private (non-Data-API) schema, isolated restore rehearsal and expand/contract migrations — all verified before Phase P1 |
| R15 | hub-web's application runtime connects to Project A as the `postgres` **owner** identity (`DATABASE_URL` = `postgres.coyelzlgukvpgguqpjdi` pooler) — a hub-web runtime compromise is a database-owner compromise, and it defeats every grant boundary the `billing_core` schema relies on (found in the Phase 0.5 review) | High | Move hub-web's runtime to a dedicated `hub_web_app` login role scoped to exactly the `public` objects it uses — no ownership, no `CREATE`, no escalating role membership; keep the owner URL out of the app runtime; denial tests prove `hub_web_app` cannot use `billing_core`/`billing_core_staging`. **Pre-data gate:** must be closed before any billing data exists in Project A. Standing hub-web security fix regardless of billing-core timing. |

Risk severity is engineering/operational impact, not a financial estimate. A risk stays open until its
control has executable evidence or the CEO records a named, expiring acceptance.

---

## 10. Non-financial decisions required before affected work

### Decided (2026-08-27 unless noted) — implementation must follow these, not re-open them

- **D1. Hostname convention.** The canonical technical host for every product is its product code:
  `bk01.wstera.com`, `ps01.wstera.com`, `lk01.wstera.com`, `dc01.wstera.com`. This was approved on
  2026-08-26 with the `product_id`/`product_code` adoption (commit `45e6f23`); `registry.yaml`
  records the `canonical_host` reservation as a free-text comment for BK01 and LK01, and the same
  free-text comment was added for PS01 and DC01 under P0a-B4 (`docs/platform/PHASE_P0a_B4_EVIDENCE.md`
  item 8) — it is not a structured YAML field for any of the four, which is recorded as an open
  question for the CEO. Stripe redirect URLs, OAuth callbacks and LINE callbacks
  point at the code host, because the code never changes even when a brand name does. A branded
  alias (`pawspace.wstera.com` → PS01) may be added later pointing at the same product and blocks
  nothing. `ROADMAP.md`'s "Project B routing truth" table already reads `bk01.wstera.com` (corrected
  in commit `4385017`); no residual documentation work remains on that line.
- **D2. Hub event trust.** Per-product HMAC keys: each product-event signer holds its own secret,
  bound server-side to exactly one product. The current single shared secret is prohibited in
  production. Asymmetric signing remains a later upgrade option and does not need to be built now,
  but the shared secret may not survive P1 in either case.
- **D3. Billing-core database placement.** `billing_core` lives as a dedicated schema inside the Hub
  project (Project A, `apps/hub-web`, Supabase `coyelzlgukvpgguqpjdi`) — the `BILLING_CORE_PLAN.md`
  P-1 "dedicated schema in the Hub project" option. This matches the already-approved
  `identity-billing-platform` PRD, which places the central billing/entitlement schema in Project A,
  and it inherits real backups when Project A upgrades to Supabase Pro. A separate free account was
  rejected: free tier has no automatic backups and pauses idle organizations, which is the wrong
  home for payment records. Non-negotiable conditions, all verified before Phase P1:
  1. `billing_core` is its own schema, not mixed into existing tables.
  2. billing-core connects with a dedicated Postgres role scoped to that schema only. The project
     `service_role`/secret key is never used by billing-core.
  3. The schema is not exposed to the Data API; the Hub's public/anon key cannot reach it.
  4. A restore rehearsal of the `billing_core` schema alone has succeeded.
  5. Billing migrations are expand/contract and reviewed so a failed billing migration cannot break
     the live Hub storefront.
  Accepted residual risk: a Project-A outage also takes billing offline. Per `BILLING_CORE_PLAN.md`
  §5c that means checkout fails — a lost sale, not data loss — which is acceptable. PawSpace keeps
  its own project and is still reached only through the narrow signed ingress (D4).
- **D4. PawSpace billing trust.** Approved: billing-core reaches PawSpace only through the narrow
  signed Edge Function ingress described in `BILLING_CORE_PLAN.md` §2 and §5a. billing-core never
  holds PawSpace's elevated project key. The "accept the project-wide elevated-key risk" alternative
  is closed. The ingress is built and tested in billing-core Phase 0.5 before any checkout work.
- **D5. Repository path casing.** Canonical checkout paths are all-lowercase: `products/pawspace`,
  `products/doccraft`, and likewise for every nested repo. Every document, script and CI reference
  using a mixed-case path (`products/PawSpace`, `products/DocCraft`) is corrected under P0a,
  including `registry.yaml`'s `path:` fields.
- **D6. CM01 (Booking Ticket Module) deliverable boundary.** Sold as a UI/source template only.
  Local storage stays a documented demo adapter; no production backend adapter is built in this
  initiative. Its L2 persistence-contract work in §6.6 is the "deliberately local-only" branch, and
  the sale materials must state plainly that persistence is the buyer's responsibility. A backend
  adapter is a possible later product decision, not part of this scope.
- **D7. Operational targets (starting values).** Until a product has enough paying customers to
  justify tighter numbers, every hosted product targets **SLO 99%** availability, **RTO 4 hours**,
  **RPO 24 hours** (daily backup). Exception: billing-core's **RPO is 1 hour or better** because a
  lost payment record cannot be reconstructed from the product side. Supported browser/runtime
  matrix and retention windows are still set per product at its G0. These values are raised, never
  silently lowered, and any raise is recorded with its trigger.

- **D8. PawSpace brand — renamed to Pawstia.** The `PawSpace` name collided with a live US
  trademark application (PawSpace LLC, Serial 99182304, filed 2025-05-13, classes 009 downloadable
  software and 035 online marketplace/business services). The public product name is now
  **Pawstia**, full name **Pawstia — Pet Management System by WSTERA**, short form **Pawstia PMS**.
  A 2026-08-27 brand-collision screen found Pawstia clean on trademark exact-name (no hit in classes
  009/035/042), Google, pet/software company search, and `pawstia.com` (expired, no active
  business); social handles `@pawstia` on IG/FB/X showed no indexed account but are not 100%
  confirmed. `product_id` (`prd_c3a024781f4e4079815b2399cfe330e0`) and `product_code` (`PS01`) do
  not change; the repository stays `Gutumrod/pawspace` until an internal rename, which does not
  touch the product ID. Reviewer note: the "PMS" short form overlaps a well-known unrelated acronym
  and the B2B "property/project management system" sense; recorded as the CEO's explicit choice.
  Residual before public launch, tracked in PS-F: claim the `@pawstia` social handles, and obtain a
  formal Thai trademark search from an attorney (this screen is a candidate-clearance screen, not a
  legal clearance).

- **D10. No dedicated Supabase project per product until that product's revenue funds one.**
  The portfolio's Supabase footprint is exactly the two free-tier slots: **Project A**
  (`coyelzlgukvpgguqpjdi`, Hub control plane + the `billing_core` schema per D3) and **Project B**
  (`gyleqrjdzwwlqierdwcy`, the Shared SaaS Runtime). Every Subscribe product lives as **one Postgres
  schema in Project B**, per `SHARED_SAAS_RUNTIME_PROJECT_B_PLAN.md`'s one-product-one-schema model,
  until that specific product earns enough to pay for its own project. This is a CEO-owned
  cost/capacity policy; it cuts no product's scope — every product still ships — it sequences
  infrastructure spend behind the revenue that funds it. There is no budget for Supabase Pro until
  revenue funds it, so branch databases are not available either. A throwaway test/staging Supabase
  project also counts as "a new project" and is not created under this rule. The testing path is
  local Supabase (Docker) or a dedicated `*_staging` **schema** inside the same project with its own
  scoped Postgres role — schema isolation, not project or branch isolation.

  Consequences that override earlier wording:
  - **PS01 (Pawstia) → `pawspace` schema in Project B**, first in the admission queue
    (`pawspace` → `line_oa_ai` → `headless_commerce`, owner decision 2026-08-21). PS01's 12
    migrations are currently written against `public` and reference `auth.users` directly; they
    must be **rewritten schema-scoped** before admission. Booking's Project B migration-history
    prerequisite is now closed by Stage 4 Option A reconciliation at commit `836943a`; Pawstia is
    next in the queue but still requires its own schema contract / RLS matrix / grants / denial suite
    and explicit admission authorization before it is considered admitted.
  - `BILLING_CORE_PLAN.md`'s phrase "PawSpace keeps its own project" (§10 D4, §2, P-1) is
    corrected: PawSpace's authoritative subscription state lives in its **Project B schema**. The
    billing→PawSpace narrow ingress is a **Project B Edge Function**, and the elevated key it holds
    is **Project B's** service-role key — whose blast radius includes Booking's `local_service`
    schema. That makes the ingress's function-scoped grants, fixed `search_path`, and adversarial
    tests more important, not less.
  - `ENVIRONMENT_AND_SECRETS_POLICY.md` (lines ~153, ~182) and `registry.yaml`'s `runtime_project`
    fields that imply a per-product Supabase project are stale against D10 — reconcile under P0a
    item 6.

- **D9. HC01 (Headless Commerce) — deferred, not cut.** HC01 stays a committed portfolio target
   (§11 still requires all seven). Its scope decision — API skeleton vs full commerce backend vs
   Thailand-first order model — is **deliberately parked until HC01's own phase (P5) opens**, and is
   made then with the context available then, not now. This is a sequencing choice under the §5
   focus gate, not a usage or demand judgment: HC01 is last in dependency/maturity order and the
   operator's attention is committed ahead of it. Between now and P5, the only authorized HC01 work
   is **HC-A** (review and dispose of PR #1, fix its 13/14 test and its dependency advisories) —
   valid under any eventual scope. HC-B onward (the locked domain contract, database, API) does not
   start until the CEO writes the scope at P5. A working note for that future decision: the
   market-differentiated shape is the Thailand-first one (COD / PromptPay / Thai courier as native
   order states); "API skeleton" and "neutral full commerce backend" both compete against free,
   established alternatives. Reframing the Thai version as an *order-management* backend
   (order → payment → shipping label, chat-first, no cart) is smaller than a full commerce build —
   estimate it from a written brief before committing.

These decisions are intentionally limited to product/engineering behavior. Pricing, budgets,
forecasts and revenue decisions stay in the CEO's separate financial plan.

**§10 status:** the decisions that gated the start of work are all made (D1–D8) or deliberately
deferred with a recorded trigger (D9). Nothing in §10 blocks P0a. Smaller open questions surfaced by
the P0a work — three CI tooling choices (license audit, secret scan, SAST; commit `27a06c8`) and
whether `canonical_host` should become a structured `registry.yaml` field (D1) — are tracked in
their P0a evidence docs, not here, and none blocks P0a-C1.

---

## 11. Definition of done for the portfolio

The seven-product initiative is complete only when:

- each product independently passes its applicable production gates;
- Hub/control-plane and billing-core dependencies pass their own security, recovery and operations
  gates before a product relies on them;
- live Hub claims and links match actual product state;
- subscription products have tested entitlement and failure behavior without redefining the CEO's
  financial plan;
- one-time products pass L0–L5, including a clean-install proof performed by someone who did not
  write the code and a fulfillment path exercised end to end;
- tenant and product boundaries have executable negative tests;
- exact release commits have protected CI, no unaccepted high/critical findings, immutable tags,
  SBOMs and artifact checksums;
- backup/restore, incident response and support paths have been rehearsed;
- V2–V4 evidence has been reviewed together by an independent reviewer;
- no P0/P1 defect remains open;
- each launch has a recorded CEO Go decision.

Until then, statuses must use precise language such as `docs-only`, `prototype`, `release
candidate`, `pilot`, or `production`, supported by current evidence.
