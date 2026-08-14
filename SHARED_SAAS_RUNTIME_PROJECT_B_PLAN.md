# Shared SaaS Runtime — Project B Execution Plan

**Status:** Draft for approval — no code, migration, environment variable, or live Supabase change is authorized by this document.

**Purpose:** Allow several sellable SaaS products to share one Supabase Project B without mixing customer data, permissions, deployments, or operational risk.

**Portfolio in scope:**

- 01 Bulk ETL & Sync
- 02 Stripe Billing Backend-as-a-Service
- 03 Headless Commerce API
- 04 Compliance / Audit-as-a-Service
- 05 Feature Flag + Config Platform
- 06 Multi-Tenant AI SaaS Starter Kit
- 07 AI Resilience Gateway
- 08 Content Auto-Pilot
- 09 IT Ops Watchdog
- 10 LINE OA AI Customer Service Bot

**Explicitly out of scope:** `bike-booking-saas-cf-poc`, `service-booking-saas`, and `service-booking-fullstack`.

`local-service-booking-saas` is the current tenant of Project B and remains in scope as the existing baseline. It owns the `local_service` schema; no new product may write tables into that schema.

---

## 1. Target architecture

```text
Project A — Hub Control Plane
  marketing-site back office, product catalog, leads, staff operations,
  cross-product customer summary, support queue

Project B — Shared SaaS Runtime
  auth                         shared identity only
  runtime_core                 shared organization/product-access contract
  local_service                existing Local Service Booking SaaS
  line_oa                      LINE OA AI Bot
  content_autopilot            Content Auto-Pilot
  commerce                     Headless Commerce, if admitted
  ...one private schema per admitted product
  R2 buckets                   product-specific assets and archives
```

### Non-negotiable boundaries

1. **One product equals one Postgres schema.** Product tables, functions, types, views, and RLS helpers belong to its own schema. A table-name prefix is not an adequate boundary.
2. **`auth.users` can be shared, authorization cannot.** A signed-in user gains access to a product only through that product's membership table and RLS policy. Never authorize from editable user metadata.
3. **Project A is not a second copy of Project B data.** It receives minimal, signed, idempotent summaries/events. It does not query Project B with a client-exposed service key.
4. **RLS and explicit grants are mandatory for every exposed table.** An application-side `WHERE tenant_id = ...` is useful but never substitutes for RLS.
5. **Files stay out of Postgres.** Use Cloudflare R2 by default; if Supabase Storage is required, use a distinct bucket and distinct policies per product.
6. **A service-role key is project-wide.** It is server-only, never sent to browsers, and any server holding it is trusted for all Product B data. High-risk products must therefore be isolated rather than merely hidden by naming conventions.

---

## 2. Shared data contract

Create `runtime_core` only after the current booking migration history and security gates are settled. It must start small:

| Object | Responsibility | Not responsible for |
|---|---|---|
| `organizations` | Canonical business/customer account identifier | Product-specific profile fields |
| `organization_members` | User membership at organization level | Automatic access to every product |
| `product_installations` | Which organization enabled which product | Product billing history/details |
| `product_entitlements` | Read-only decision input for an enabled product | Replacing each product's domain rules prematurely |
| `platform_audit_events` | Small operational security trail with retention | Raw webhook payloads or high-volume analytics |

Existing booking records remain under `local_service.shops` and `local_service.shop_users`. A later, separately approved bridge may map one shop to one `runtime_core.organization`; do not rename or mass-migrate booking entities while adding the shared core.

Every product schema owns its own membership and domain rows, for example:

```text
local_service.shop_users
line_oa.workspace_users
content_autopilot.workspace_users
commerce.store_users
```

Product RLS must verify both the product membership and the scoped organization/workspace/store ID. Access to `line_oa` must not follow merely because the user owns a booking shop.

---

## 3. Product admission policy

Project B is a shared runtime, not a dumping ground. Before admission, each product must pass the following review:

- has a unique schema, bucket/R2 prefix, product key, data-retention rule, and accountable owner;
- estimates rows/day, average row size, file growth, egress, realtime connections, and webhook/API volume;
- has tenant and role model written before migration work;
- has a separate RLS denial test for anonymous, unauthenticated, wrong-product, wrong-tenant, staff, owner, and platform-admin cases;
- does not require a project-wide secret to be placed in a browser or untrusted worker;
- can tolerate Project B's shared outage/quota blast radius.

### Recommended portfolio routing

| Product | Initial routing | Reason |
|---|---|---|
| Local Service Booking | Keep in Project B | Existing baseline, isolated `local_service` schema |
| LINE OA AI Bot | First candidate for Project B | Similar SME/business tenant model; still needs its own webhook, quota, workspace, and LINE-token boundary |
| Content Auto-Pilot | Second candidate for Project B | Can use shared organization identity, but separate workflow and asset boundary |
| Headless Commerce | Conditional | Admit only after storage, catalog growth, and payment boundary are estimated |
| Feature Flag platform | Conditional | Technically compatible, but developer-facing access and high request volume need a quota review |
| Stripe Billing BaaS | Conditional / likely isolated later | Billing truth and provider secrets raise blast-radius requirements |
| AI Resilience Gateway | Conditional / likely isolated later | API-key custody, rate limiting, and high egress need their own capacity decision |
| IT Ops Watchdog | Conditional | Require webhook/credential isolation and retention policy first |
| Bulk ETL & Sync | Dedicated project when operational | Large files/jobs conflict with a shared free-tier database and quota |
| Compliance / Audit service | Dedicated project when sold | Data sensitivity, retention, and customer isolation justify its own blast radius |
| Multi-Tenant AI Starter Kit | Not a hosted Project B tenant by default | It is sellable source/starter-kit material, not necessarily a shared hosted runtime |

---

## 4. Migration and source-of-truth model

Project B has exactly one deployed database. Therefore it must have exactly one migration owner and one release sequence.

### Recommended model

1. `local-service-booking-saas` remains the temporary canonical database repository because it already owns the deployed `local_service` schema.
2. No other product repository may run `supabase db push`, apply dashboard SQL, repair migration history, or deploy an independent migration to Project B.
3. A product team submits a database change request containing: schema contract, data growth estimate, RLS matrix, grants, rollback/forward-fix plan, and verification cases.
4. The database owner creates the migration through the Supabase CLI, reviews it, applies it only after approval, and exports the generated TypeScript types for the affected product client.
5. When Project B has two admitted products and the migration process is proven stable, move the database contract into a dedicated, versioned repository or package. Do not attempt that move while the current booking history is unresolved.

### Hard stop before any new product schema

The current booking project has unresolved remote/local migration-history reconciliation and uncommitted platform-admin work. Before Project B accepts a second product, complete and review:

- the current migration source-of-truth reconciliation;
- the existing booking E3.3 security/public-data gap and its live RLS regression checks;
- review or disposition of the present uncommitted files; and
- a clean, reviewed baseline commit for Project B.

No `db push`, migration repair, production DDL, or direct dashboard SQL is permitted as a shortcut through this gate.

---

## 5. Implementation phases and approval gates

### Phase 0 — Freeze and prove the existing baseline

**Owner:** Database owner + booking owner

- Reconcile local and remote migration history for `local_service` without applying unrelated schema changes.
- Finish the booking security/live verification gate already identified for E3.3.
- Review the uncommitted platform-admin migration and UI work as a separate booking change; it is not a shared-runtime migration.
- Record the deployed schema, Data API exposed schemas, grants, RLS policies, storage buckets, Edge Functions, secrets inventory names only, and current quota usage.

**Exit evidence:** reviewed baseline commit; migration list agrees with the approved source of truth; live REST/browser negative tests pass; no unreviewed product schema work.

### Phase 1 — Establish Project B governance

**Owner:** Platform architect + database owner

- Publish this architecture as the source of truth and name the database-change owner/reviewer.
- Create product-admission and migration-release checklists.
- Define product keys, schema naming, bucket/R2 prefixes, event names, retention fields, and environment naming.
- Decide whether Project A uses a separate Supabase project now or initially uses only server-side APIs; it must not gain direct cross-project database access.

**Exit evidence:** approved ADR, named owners, release checklist, and first admitted product selected.

### Phase 2 — Introduce the minimal shared core

**Owner:** Database owner

- Add the narrowly scoped `runtime_core` schema and the contract in section 2.
- Add no cross-product foreign keys until their lifecycle is proven compatible.
- Build a reversible, one-to-one bridge from an existing booking shop to an organization only after data mapping approval.
- Write role/RLS tests before wiring a new frontend to it.

**Exit evidence:** tests prove that a booking user cannot read another organization or any non-booking product; platform staff cannot use browser-side privileges to bypass policies.

### Phase 3 — Admit the first additional product: LINE OA AI Bot

**Owner:** LINE product owner + database owner

- Create only `line_oa` schema, its product-specific workspace membership, webhook idempotency, encrypted/server-side provider-token handling, and quota tables with retention.
- Give the product separate R2/bucket prefixes and webhook rate limits.
- Link an organization to the product through `runtime_core.product_installations`; do not couple LINE records to booking tables.

**Exit evidence:** end-to-end sandbox webhook test; all cross-product and cross-tenant denial tests pass; usage projection stays within the approved Project B budget.

### Phase 4 — Connect Project A safely

**Owner:** Hub control-plane owner

- Project B emits signed, idempotent summary events such as `product.installation.changed` or `subscription.changed` to a server-side Project A endpoint.
- Project A stores only the data needed for staff operations and customer support.
- Project A requests a product action through an authenticated server-to-server command endpoint, never through direct client-side database access.

**Exit evidence:** replayed events are idempotent; invalid signatures are rejected before database writes; Project A has no Project B service-role key exposed to any browser.

### Phase 5 — Admit later products one at a time

**Owner:** Product owner + database owner + security reviewer

- Repeat the product-admission policy for exactly one product per release.
- Reject or allocate a dedicated project when its workload/data sensitivity exceeds the shared-runtime budget.

**Exit evidence per product:** schema/RLS/grants review, storage/retention budget, migration review, automated denial suite, live sandbox verification, and rollback/forward-fix runbook.

### Phase 6 — Production operations

**Owner:** Operations owner

- Upgrade Project B from Free before paid public usage needs backup/SLA guarantees.
- Set a 400 MB database early-warning threshold, storage/R2 threshold, egress threshold, and named alert recipient.
- Define archive jobs for closed operational records; verify archive upload before deletion.
- Run restore rehearsal before declaring broad public production readiness.

**Exit evidence:** documented restore test, quota monitoring, tested alert route, incident owner, and per-product data-retention job.

---

## 6. Planned artifacts

These are created only in the approved phase; no migration filename is pre-reserved.

```text
local-service-booking-saas/
  docs/architecture/shared-saas-runtime.md
  docs/architecture/product-admission.md
  docs/runbooks/project-b-migration-release.md
  docs/runbooks/project-b-incident-and-restore.md
  supabase/migrations/                 # only database-owner generated migrations
  supabase/tests/                      # RLS, RPC, and product-isolation tests

<each admitted-product application>/
  src/lib/runtime-core-client.ts        # generated/typed product-scoped client wrapper
  src/lib/<product>-authorization.ts    # product membership checks
  docs/data-contract.md
```

The plan itself is stored at the portfolio root so it can be handed to any implementation team without granting them authority to change Project B.

---

## 7. Verified technical baseline and dependencies

No new dependency is needed for Phases 0–2.

| Tool/package | Verified version/use |
|---|---|
| Supabase CLI | `2.101.0` |
| `@supabase/ssr` in booking admin | `0.12.4` |
| `@supabase/supabase-js` in booking admin | `2.112.0` |
| Next.js in booking admin | `16.3.0` |
| React / React DOM in booking admin | `19.2.8` |
| TypeScript in booking admin | `5.9.3` |

Any later addition must be pinned to an exact reviewed version and committed with its lockfile. Do not introduce a dependency just to create a generic platform abstraction.

---

## 8. Mandatory verification matrix

For every product schema and release, prove all of the following with automated tests plus a live sandbox probe:

1. Anonymous callers can read/write only explicitly public operations.
2. Signed-in user with no product membership is denied.
3. Correct product user in another tenant/organization is denied.
4. Booking membership does not grant LINE/Content/Commerce access.
5. Product owner can access only its allowed tenant rows and allowed mutation types.
6. Platform admin RPCs require server-verified platform membership and have no direct table access path.
7. Direct access to ungranted tables/functions fails.
8. Storage/R2 object path cannot be read or written across product or tenant boundaries.
9. Webhook retry/event replay creates no duplicate business record.
10. List APIs are paginated, return only used fields, and have an index only where measured query patterns need one.

---

## 9. Approval required before execution

Approval of this plan authorizes **Phase 0 only**. It does not authorize any production SQL, migration repair, secret change, deployment, or new product schema.

Before Phase 3, product owner must explicitly confirm that LINE OA AI Bot is the first product to admit. If another product is selected, repeat the admission review and revise only that phase.
