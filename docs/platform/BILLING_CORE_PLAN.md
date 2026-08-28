# Plan: Centralized `billing-core` Service

**Status:** LOCKED — owner-approved 2026-08-27. This is the canonical architecture for portfolio
billing going forward. Do not design a competing/parallel billing architecture without an explicit
owner decision superseding this document.
**Revision:** v3 (2026-08-27, same day) — v2 added
§0 (hard prerequisites, incl. a real Supabase-project-quota blocker v1 missed), the concrete
status-enum mapping, Stripe-customer/idempotency-key/backfill/proration specifics that v1 left to
the implementer's improvisation, and operational sections (secrets, observability, rollback,
explicit out-of-scope). v3 incorporates the independent clean-slate security review and removes
financial-policy decisions from this engineering plan.

**Security amendment — 2026-08-27 clean-slate review:** The centralized-service decision remains
locked, but four implementation details below are corrected before build:

1. A Supabase secret or legacy service-role key is not privilege-scoped. It authorizes the
   project-wide `service_role` and bypasses RLS. A separately named key narrows rotation impact, not
   database privilege.
2. Billing-core therefore does not hold PawSpace's project-wide elevated key. It calls a narrow
   PawSpace Edge Function ingress using a dedicated HMAC/asymmetric service credential; that
   function alone holds the PawSpace elevated key and exposes only validated subscription
   transitions. **CEO-approved 2026-08-27 (master plan §10 D4)** — the risk-acceptance alternative
   is closed; the ingress is mandatory and is built and tested in Phase 0.5.
3. Cloudflare Cron uses the Worker's internal `scheduled()` handler. No public
   `/internal/cron/...` endpoint protected only by a shared header is created.
4. LK01 redirect requests never synchronously call billing-core. Billing is checked/synchronized on
   control-plane boundaries and stored as a bounded local entitlement snapshot.

These are least-privilege and availability corrections, not a second billing architecture and not
financial-plan changes. Supabase-specific implementation must target the current hosted Edge Runtime
(Deno 2.1 at review time), use explicit Data API grants plus RLS where a schema is exposed, and run
database/security advisors before migration release.

Primary references: [Supabase API-key privileges](https://supabase.com/docs/guides/getting-started/api-keys),
[RLS and elevated-key behavior](https://supabase.com/docs/guides/database/postgres/row-level-security),
and [Data API exposure/grants](https://supabase.com/docs/guides/api/securing-your-api).

**Supersedes for Phase 1 purposes:** `docs/platform/identity-billing-platform/PRD.md`'s Phase 1
("wire the 4 stripe-billing modules into a real app/server layer") — this document is that Phase 1,
specified concretely. Phases 2+ of that PRD (Hub-wide organizations/entitlement-sync/bundle
checkout) are not in scope here and remain a separate, still-unapproved future decision.
**Relationship to the production documents:** `PORTFOLIO_PRODUCTION_MASTER_PLAN.md` is the
seven-product execution authority and this document is its billing implementation boundary.
`PRODUCTION_LAUNCH_PLAN_2026-08-27.md` is retained only as a supplemental independent review; it
does not create a second sequence or financial authority.

## Context

The owner locked the portfolio's active scope to 7 products split by commercial model: 4 Subscribe
(`booking`, `pawspace`, `wstera_link`, `doccraft`) and 3 sell-outright (`multi_tenant_ai`,
`booking_ticket_module`, `headless_commerce`) — see `ROADMAP.md`'s "Active scope" section. For the
Subscribe group, the owner's explicit, fixed strategic goal is **one centralized billing service** —
not each product independently copying Stripe integration modules, even where a product's own docs
currently assume otherwise. Any product whose current plan doesn't fit that goal gets adjusted to
fit it; centralization is not up for re-litigation.

`booking` already has its own mature, working, self-contained Stripe integration
(`products/booking/apps/booking-admin/src/app/api/{webhooks/stripe,billing/checkout,billing/portal}/route.ts`,
real signature verification, idempotency, DB-trigger-level enforcement, per-plan quota with topup
ledger) and is explicitly **out of scope** — not touched, not migrated.

The other three products' actual state, confirmed by reading their code/docs directly (not
doc-trust):
- **`pawspace`** already has a payment-agnostic entitlement/subscription-lifecycle schema (Phase 13)
  that was *built waiting for* exactly this kind of external billing authority — it already exposes
  `SECURITY DEFINER` RPCs (`transition_shop_subscription`, `set_shop_commercial_package`) with a
  `'future_billing_event'` source literal and built-in idempotency, verified to exist in
  `products/pawspace/supabase/migrations/20260825141500_phase13_subscription_lifecycle.sql`.
- **`wstera_link`** is docs-only (zero app code) but had vendored its own independent copy of the
  billing modules in its spec — since nothing is built yet, this is a documentation correction, not
  a rewrite.
- **`doccraft`** has no billing decision made at all (its own docs defer billing to "Phase 8"), but
  the owner wants the integration planned now anyway so it isn't designed inconsistently later —
  documentation only, no code, no schema, Phase 8 stays Phase 8.

Two real bugs were found by direct code inspection in the shared `subscription` module (used by
everything here): `past_due` subscriptions aren't blocked from entitlements, and billing periods are
hardcoded to 30 days regardless of monthly/annual plan choice. These must be fixed at the source
(`modules-hub`) before anything is built on top of them. `291/291 tests passing` on the old modules
did not catch either bug — do not treat a passing test suite as evidence of production readiness for
real billing without independently re-checking the logic.

**Mandated build methodology (owner, 2026-08-27):** get a minimal version working, self-test, then
run 3 distinct test approaches, review all 3 together, then complete every remaining phase — nothing
ships partially, everything must be complete before real/live launch.

---

## 0. Hard prerequisites — resolve before Phase 1 starts

**P-1. Supabase placement — DECIDED 2026-08-27 (CEO, via Commander Final Review Gate).**
`billing_core` lives as a **dedicated schema inside the Hub project** (Project A, `apps/hub-web`,
Supabase `coyelzlgukvpgguqpjdi`). This matches the already-approved `identity-billing-platform` PRD,
which places the central billing/entitlement schema in Project A, and it inherits real backups when
Project A upgrades to Supabase Pro. A separate free Supabase account was rejected: free tier has no
automatic backups and pauses idle organizations — the wrong home for payment records.

The gate closes only when all of the following are recorded and verified before Phase 1:

1. `billing_core` is its own schema; it does not add columns to or share tables with existing Hub
   schemas.
2. billing-core connects with a **dedicated Postgres role scoped to the `billing_core` schema
   only**. The project `service_role`/secret key is never used by billing-core. `BILLING_CORE_DATABASE_URL`
   carries this narrow role, not an elevated key.
3. `billing_core` is not exposed to the Data API. The Hub's public/anon key cannot reach it. Migrations
   include explicit `REVOKE`/`GRANT`, fixed `search_path`, and `supabase db advisors` evidence.
4. A restore rehearsal of the `billing_core` schema alone has succeeded in staging, with recovery
   time and data-loss observations recorded.
5. Billing migrations are expand/contract and reviewed so a failed billing migration cannot break the
   live Hub storefront running in the same project.

Accepted residual risk: a Project-A outage also takes billing offline. Per §5c that means checkout
fails — a lost sale, not data loss — which the CEO accepts. Reconfirm actual account/plan state when
Phase 0 starts. PawSpace keeps its own project and is still reached only through the narrow signed
ingress below; billing-core still never holds PawSpace's elevated key.

The CEO's separate financial plan owns the Supabase Pro upgrade timing and any cost decision.

**P-2. Stripe account/mode.** Confirm which Stripe account billing-core uses and that **test-mode
keys are used for everything through Phase 3.** Live keys must not exist in any local `.env` or
Worker secret until the owner explicitly authorizes go-live. Guard: billing-core refuses to boot if
`STRIPE_SECRET_KEY` starts with `sk_live_` unless `BILLING_CORE_ALLOW_LIVE=true` is also set —
implement this check in `src/lib/config.ts` as a startup assertion, not a comment.

**P-3. Currency and minor units.** Currency, prices, intervals, tax behavior, trials, refunds, and
proration policy come from the CEO's separate approved financial configuration. Billing-core stores
integer minor units and validates the Stripe currency exponent; it must not assume every currency
uses two decimal places or hard-code values in source. Contract tests use owner-approved fixtures
and prove that display units, stored minor units, Checkout, invoices, and webhook reconciliation
agree exactly.

**P-4. Phase 0 is a cross-repo change.** `modules-hub` is a **separate git repo**
(`github.com/Gutumrod/modules-hub`), not a subdirectory of this one — the Phase 0 fixes need their
own commit and push there. Deliberate disposition of the existing copied modules:
- `products/multi-tenant-ai/modules/*` and `products/headless-commerce` (its `feat/reference-server`
  branch) — do not resync as part of billing-core. Their own production gates must independently
  patch, replace, or pin every copied module and record provenance; known-stale code cannot ship
  merely because it is out of scope for this service.
- `products/stripe-billing/modules/*` — stop treating it as a build source and mark it historical;
  `billing-core` builds from a reviewed, immutable `modules-hub` commit.
- `products/wstera-link/vendor/modules/*` — becomes **obsolete** once LK01 switches to the pull
  model (§3). Remove it as part of LK01's doc/architecture correction so nobody builds against it
  by accident.

---

## Approach

### 1. Fix the shared bugs at the source (`modules-hub`)

In `/Users/wachirayachankhonkan/AI-Workspace/projects/modules-hub/modules/subscription/`:
- `core/types.ts` — add `gracePeriodEnd?: Date` to `Subscription`.
- `core/engine.ts` (`resolvePlan`, ~line 23) — block entitlements on `past_due` immediately;
  `grace_period` only resolves while `gracePeriodEnd` hasn't passed (fail closed if
  missing/expired).
- `core/service.ts` (`createSubscription`, ~line 73) — replace the hardcoded `+30 days` with a real
  `addInterval(start, plan.billingInterval)` helper (`month`/`year`, with month-overflow clamping
  e.g. Jan 31 → Feb 28/29). Also fix `handleBillingEvent`'s `subscription.payment_failed` case to
  actually compute and set `grace_period`/`gracePeriodEnd` using `config.gracePeriodDays` (currently
  dead/unused, defaulted to 3).
- Add unit tests proving both fixes (`past_due` blocks, `grace_period` respects its own end time,
  monthly/annual period math including leap-year and month-overflow cases).
- `modules/payment/adapters/stripe-adapter.ts` — extend `createPayment` to support
  `mode: 'subscription'` with inline `price_data[recurring][interval]` (keeps the owner-approved
  billing configuration as the application source of truth, with no untracked manual Stripe Price
  provisioning per plan). Native
  Stripe Subscriptions were chosen over "one-time Checkout per period" because the portfolio's
  existing (partial) webhook-glue code in `multi-tenant-ai` already assumes real
  `customer.subscription.*`/`invoice.*` Stripe objects.

Run `npm test` in both `modules-hub/modules/subscription` and `modules-hub/modules/payment` — must
be green before anything copies these modules elsewhere.

### 2. Build `billing-core` as a new isolated service

New top-level `services/billing-core/` in `saas-product-hub` (sibling to `products/`, portfolio
infra not a product). Vendors its own copy of the fixed `payment`/`subscription`/`webhook-receiver`/
`audit-log` modules from `modules-hub` (the up-to-date source — `products/stripe-billing/modules/`
has drifted stale — missing `requireCheckoutUrl()`/`normalizeProviderCurrency()` validation and the
`INVALID_PAYMENT_REQUEST` error code that modules-hub's `payment` module already has — and should
not be used as the copy source).

**Runtime: Hono, not Express.** The rest of the portfolio's Cloudflare deployments (`booking`,
`OmniDesk`, `hub-web`) are Next.js-on-Workers; a standalone service needs a Workers-native framework.
Hono runs unmodified on both local Node (`tsx`, for dev) and Workers (`export default app` is the
fetch handler directly) — zero porting step later. It also structurally avoids the exact
body-parsing-middleware-order bug (`express.raw()` before `express.json()`) that already bit
`multi-tenant-ai` once, since Hono has no global body parser to order against.

**Persistence:** billing-core's own `plans`/`subscriptions`/`payments`/`webhook_idempotency` tables
(used by `wstera_link`/`doccraft`-future accounts) live in the `billing_core` schema inside the Hub
project, under the five controls recorded at P-1 — dedicated scoped Postgres role, private schema,
isolated restore rehearsal, expand/contract migrations. `pawspace` keeps its own `shop_subscriptions`
authoritative and exposes only the narrow ingress described below.

Billing tables default to a private, non-exposed schema. If any object must use the Data API, expose
only the intended schema/object, grant roles explicitly, enable RLS, and test anonymous,
unauthenticated, wrong-account, wrong-product and elevated-service paths. Do not assume newly created
tables are automatically exposed. Migrations include explicit function `REVOKE`/`GRANT`, fixed
`search_path`, idempotency constraints and `supabase db advisors` evidence.

**Scheduler:** Cloudflare Cron Trigger (`wrangler.jsonc`, every 15 min) sweeps billing-core's own
expired `grace_period` rows. For PawSpace, the same internal `scheduled()` handler sends a signed,
replay-bounded `expire_due` command to the narrow PawSpace ingress; the PawSpace function selects
and advances only eligible rows inside its own project. Billing-core never queries PawSpace with an
elevated key. The job function is shared with tests/manual operator tooling; there is no public cron
HTTP route.

**API surface:**
```
POST /v1/checkout                              create/reuse Stripe Customer, create subscription-mode Checkout Session
GET  /v1/subscriptions/:product/:accountId      status (wstera_link/doccraft — pawspace reads its own DB/RPCs directly, not this)
GET  /v1/entitlements/:product/:accountId/:key  canUseFeature/getLimit wrapper
POST /v1/portal                                 Stripe Billing Portal session
POST /webhooks/stripe                           raw-body-first, Stripe-Signature verified
```

Every `/v1/*` route authenticates the caller, derives product/account from an authorization binding,
and rejects a caller-supplied account ID that it does not own. Product-to-product calls use separate
service identities and audience-bound credentials. Checkout creation has an idempotency key and a
database uniqueness/lock boundary; request authentication is tested independently from Stripe
success. The webhook endpoint is the only public unauthenticated route and is bounded by body size,
rate/abuse controls and Stripe signature verification.

**How each product gets entitlement updates — decided per product, not generic:**
- **`pawspace`**: billing-core sends a versioned, timestamped, signed request to a narrow PawSpace
  Edge Function such as `billing-entitlement-ingress`. The function binds the caller to the billing
  service, enforces a short replay window, validates product/shop/event/transition fields, and calls
  only the existing `transition_shop_subscription(...)` and
  `set_shop_commercial_package(...)` RPCs. The function derives the RPC's UUID idempotency value
  deterministically from the Stripe event ID as specified in §2b. Only the PawSpace function
  environment holds its elevated project credential. That credential still has project-wide
  RLS-bypass privilege and must be isolated, redacted, rotated and never returned to billing-core.
  Review the existing `SECURITY DEFINER` functions, explicit
  `REVOKE`/`GRANT`, `search_path` and deprecated `auth.role()` usage before release. `Plan.id` for
  PawSpace plans remains equal to `commercial_packages.id`; only interval representation is mapped.
- **`wstera_link`** (pre-build): authenticated control-plane writes and a scheduled reconciler pull
  subscription/entitlement state into a bounded local snapshot. Link creation/update and premium
  mutations fail closed when the snapshot is missing/expired. The redirect plane reads only the
  already-approved link/routing state and never waits synchronously for billing-core.
- **`doccraft`** (forward-looking, Phase 8): authenticated cloud operations use a bounded signed or
  server-fetched entitlement snapshot. Local drafts remain readable/exportable during billing-core
  outage; cloud-only premium mutations fail closed after the documented snapshot/grace boundary.

Webhook handler order (`routes/webhook.ts`), following the one proven-working pattern in this
portfolio (`multi-tenant-ai/server/src/routes/payment-demo.ts`), ported to Hono: read raw body first
with a strict size limit → verify signature → durably persist the event/idempotency record → on
replay return `200` → enqueue/apply the transition → record a redacted audit result. The handler
acknowledges only after durable intake, and a reconciler compares local state with Stripe to recover
missed, delayed or out-of-order delivery. Delivery to PawSpace uses the signed ingress above, not a
project-wide key held by billing-core. Invalid signatures return `401`; legitimate duplicates return
`200` without re-applying state.

#### 2a. Status enum mapping (added v2 — verified against both sources)

The generic module's `SubscriptionStatus` and PawSpace's `shop_subscriptions.status` were compared
directly. They are **not** in conflict — PawSpace is a strict superset:

| module `SubscriptionStatus` | PawSpace `shop_subscriptions.status` | Notes |
|---|---|---|
| `trialing` | `trialing` | 1:1 (PawSpace's `shops.subscription_status` also still allows a legacy `'trial'` — never write it) |
| `active` | `active` | 1:1 |
| `past_due` | `past_due` | 1:1 |
| `grace_period` | `grace_period` | 1:1 — both now require an explicit end timestamp |
| `cancel_at_period_end` | `cancel_at_period_end` | 1:1 |
| `cancelled` | `cancelled` | 1:1 |
| `expired` | `expired` | 1:1 |
| *(none)* | **`suspended`** | **PawSpace-only, admin-controlled** |

**`suspended` rule — important:** it exists only in PawSpace and represents a deliberate
administrative hold, not a billing state. Billing-core **must never set it, and must never
transition a shop *out* of it** on a Stripe event (e.g. a renewal `invoice.paid` arriving for a
suspended shop must not silently reactivate it). Billing-core records the event and audit-logs the
skip; lifting a suspension stays a PawSpace admin action. PawSpace's own transition `CASE` guard
should reject such a transition anyway — Approach C must include a test proving billing-core
surfaces that rejection instead of swallowing it.

#### 2b. Identity mapping and idempotency keys (added v2)

- **`stripe_customer_id` ownership:** billing-core's own DB owns the single mapping table
  `stripe_customers(product, account_id, stripe_customer_id, created_at)` with a unique constraint
  on `(product, account_id)`. This holds for PawSpace shops too — PawSpace's schema has no Stripe
  column and must not grow one; billing-core stays the only place Stripe identity lives, so a future
  provider swap touches one service. `/v1/checkout` looks up this table before creating a Customer,
  so retries can't create duplicate Stripe Customers.
- **Idempotency key derivation:** PawSpace's `transition_shop_subscription(p_idempotency_key UUID)`
  needs a **UUID**, but Stripe event ids are `evt_1AbC...` strings. Derive deterministically:
  UUIDv5 with `namespace = BILLING_CORE_NAMESPACE_UUID` and `name = stripe_event_id`, using one
  fixed namespace UUID constant checked into `src/lib/ids.ts`. Deterministic means a replayed Stripe
  delivery derives the same UUID and hits PawSpace's `UNIQUE(subscription_id, idempotency_key)`
  constraint — the replay protection is enforced inside PawSpace's own transaction, independent of
  billing-core's own idempotency store. Do not use `gen_random_uuid()` here; a random key defeats
  the entire mechanism.
- **`shop_id` provenance:** billing-core never invents its own id space for PawSpace. The caller
  (PawSpace's app) passes its own `shop_id` as `accountId` to `/v1/checkout`, and billing-core sets
  it on the Stripe Checkout Session / Customer as `metadata.product='pawspace'` +
  `metadata.account_id=<shop_id>`. The webhook router reads those two metadata fields to decide
  routing — **an event with no recognized `metadata.product` is audit-logged and answered `200`,
  never guessed at.**

#### 2c. Existing PawSpace shops — backfill (added v2)

PawSpace shops already have `shop_subscriptions` rows created by its own `bootstrap`/`migration`
transition sources, before billing-core exists. They are **not** retroactively migrated. Rule: a
shop becomes billing-core-managed the first time it completes a `/v1/checkout` flow (which creates
its `stripe_customers` row); until then its existing row keeps whatever state PawSpace's own admin
flow set. This means the two populations coexist during rollout, which is intended — no bulk
migration, no big-bang cutover. The grace-period sweep (§3) skips shops with no `stripe_customers`
mapping, so it never touches manually-administered shops.

#### 2d. Plan changes and proration seam (added v2, financial policy externalized in v3)

The module's `changePlan` accepts an `immediate` flag and **ignores it** (verified — no proration,
no period reset), so it cannot implement paid changes safely. The CEO's separate financial plan
defines upgrade, downgrade, proration, trial, refund, and tax behavior. Engineering must map that
approved policy to Stripe primitives, treat Stripe webhook state as the synchronization input, and
prove the resulting state transitions in contract/E2E tests. Until that mapping is approved and
tested, paid plan-change actions remain disabled; this document does not choose the policy.

### 3. Correct `wstera_link` and `doccraft` docs to point at billing-core

- `products/wstera-link/docs/02_SYSTEM_ARCHITECTURE.md` — update the Billing Flow section to name
  billing-core as the actual backend, not its currently-vendored local module copies. Check
  `docs/PRODUCT_DECISIONS.md`/`docs/DOCUMENTATION_AUDIT.md` for this repo's convention on amending a
  doc marked `LOCKED pre-build baseline` before editing (versioned changelog line, not silent edit).
  Its `04_PRICING_ENTITLEMENTS.md` plan table already maps cleanly onto the
  `EntitlementValue = boolean | number | string | null` shape with no gaps — no schema change needed.
- `products/doccraft/docs/MONETIZATION_AND_PAYMENT_FLOW.md` §2 — name billing-core as the intended
  Phase 8 backend, sketch entitlement fields (`cloud_sync_enabled`, `device_limit`,
  `customer_record_limit`, `catalog_record_limit`) in the same shape. Explicitly marked
  forward-looking; no code, no schema, Phase 8 stays Phase 8.

### 4. Phased build order (matches the owner's mandated methodology exactly)

1. **Prerequisite gate** — record the P-1 placement/credential boundary, implement P-2's
   test-mode startup guard, and load only the owner-approved P-3 configuration. Phase 1 cannot start
   before this evidence is approved.
2. **Phase 0** — finish the `modules-hub` fixes/tests above and push them to that separate repo at a
   reviewed immutable commit; record how every consumer pins it.
3. **Phase 0.5 — security contracts** — threat-model the Hub/billing/PawSpace boundary; implement
   and test the narrow PawSpace Edge Function ingress; lock `/v1/*` authentication/account
   ownership, private-schema/Data API grants, durable webhook intake, vendor provenance, and the
   Worker's internal `scheduled()` contract. No Stripe checkout work starts before this review
   passes.
4. **Phase 1** — build the billing-core skeleton and wire PawSpace end to end only
   (`wstera_link`/`doccraft` routes return explicit `501` until their phases). Seed the service from
   the owner-approved configuration without redefining financial values here. Done when one real
   PawSpace staging shop completes a Stripe test-mode checkout and its `shop_subscriptions` row
   updates through the narrow ingress with end-to-end audit correlation.
5. **Phase 2 — self-test**: implementer smoke-checks every route locally before formal testing
   starts.
6. **Phase 3 — three test rounds, reviewed together only after all three finish, not one at a
   time:**
   - **A — automated regression**: module unit tests (incl. new bug-fix tests) + billing-core's own
     repository/mapping/integration tests.
   - **B — real Stripe test-mode E2E**: Stripe CLI (`stripe listen`, `stripe trigger ...`) against
     the real Stripe test API — closes the previously-flagged gap that the Stripe adapter had never
     been tested against real Stripe, only mocks. Manually cross-check Stripe's test Dashboard
     (Customers/Subscriptions/Events/Webhook delivery success rate).
   - **C — adversarial/negative-path**: replayed webhook idempotency, tampered/expired PawSpace
     ingress signature, wrong product/account binding, oversized body, out-of-order events,
     concurrent-checkout race, queue retry exhaustion, webhook-to-Stripe reconciliation and live
     grace-period-boundary sweep. Prove billing-core has no PawSpace Data API or elevated project
     key.
7. **Phase 4** — finish the remaining PawSpace routes and internal cron wiring; correct
   `wstera_link`/`doccraft` docs; remove obsolete LK01 vendored billing copies; activate the
   monitoring/alerting/rollback controls in §5. Nothing is done until PawSpace's full staging gate,
   the documentation corrections, and the combined Phase 3 review all pass. No partial live ship.

---

## 5. Operations (added v2, hardened v3)

### 5a. Secrets

Required values are separate for local/staging/production. Production Worker secrets use the
deployment platform's secret store; local values use an ignored development-secret file and never a
committed `.env`:

| Secret | Purpose |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe API (test-mode until go-live — see P-2) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...`, signature verification |
| `BILLING_CORE_DATABASE_URL` | Dedicated database role limited to billing-core's schema |
| `PAWSPACE_BILLING_INGRESS_KEY` | Per-environment credential for signed calls to the narrow ingress |
| PawSpace elevated project key | PawSpace Edge Function environment only; never billing-core |

Portfolio convention applies: real values live in the central vault
(`.secrets/keys.txt`) and are read from it directly — never copied into repo files, docs, chat, or
agent output. When updating a secret, verify with a live call, not a dashboard success message (the
2026-08-20 DB-password rotation silently failed and looked successful — see `ROADMAP.md` gate 1).

The ingress signature includes version, key ID, timestamp, nonce, method/path, and body digest. The
PawSpace function enforces a short clock window and one-time nonce before any RPC. Rotation supports
current and previous key IDs for a bounded overlap, then proves the old key is rejected. The
function's elevated Supabase key remains project-wide and bypasses RLS; naming it separately does
not narrow privilege. Keep it only inside PawSpace, and narrow the callable database surface with
explicit function grants, fixed `search_path`, validated input, and adversarial tests.

### 5b. Observability and alerting

The owner's stated reason for centralizing was: one place to fail means you find out immediately,
instead of four places failing quietly. **That only holds if something actually watches it** — so
this is a required part of the build, not a follow-up:
- Every webhook outcome (verified / replay / invalid-signature / routed / skipped / RPC-rejected)
  is durably recorded with the Stripe event ID, correlation ID, product, account reference, attempt,
  latency, and redacted result.
- Separate liveness and readiness probes. Dependency probes have strict timeouts and never expose
  credentials, customer data, or raw provider errors.
- Alert on invalid-signature bursts, unexpected RPC rejections, queue age/retry exhaustion,
  reconciliation drift, failed sweeps, and Stripe webhook delivery failures. Threshold, owner,
  destination, acknowledgement, and escalation path are written into the runbook before staging.
- Dashboards expose intake rate, duplicate rate, processing lag, transition success/error rate,
  reconciliation drift, and entitlement snapshot age by product/environment.
- Weekly manual check during rollout: Stripe Dashboard → Developers → Webhooks delivery success
  rate is 100% and the endpoint is not disabled.

### 5c. Rollback / kill-switch

- Billing-core is deployed independently from every product. Every deployment records the immutable
  artifact/version, config revision, migration ID, and previous known-good rollback target.
- Migrations are expand/contract and backward-compatible across at least the active and previous
  Worker versions. Restore and rollback are rehearsed in staging before production.
- **Products must fail safe when billing-core is unreachable.** For entitlement reads, PawSpace is
  already safe by construction (it reads its own DB; billing-core being down means state simply
  stops updating). For LK01/DC01's pull model, an unreachable billing-core must **not** silently
  grant paid features — decide per product between "deny (fail closed)" and "serve last-known
  cached entitlement with a TTL"; LK01's own locked spec already mandates fail-closed, so follow it.
- `/v1/checkout` failing is a lost sale, not a data-integrity problem — it is safe to hard-fail with
  a clear user-facing error.
- A processing kill switch stops transition application while continuing to verify and durably
  intake provider events. Recovery replays the retained queue and runs reconciliation before the
  switch is cleared. Disabling the Stripe endpoint is an incident-authorized last resort, not the
  normal rollback path, because it creates a delivery/reconciliation obligation.

### 5d. Explicitly out of scope

The CEO's separate plan owns monetary values, price/package design, taxes/invoices, discounts,
refund/dunning rules, currency choice, and payment-account policy. This engineering plan implements
only an approved configuration and its safety controls. Also out of scope here: migrating `booking`
onto billing-core, Hub-wide bundle checkout/cross-product identity, and resynchronizing unrelated
source-product modules. Those require explicit later plans and gates.

**Known accepted consequence:** the portfolio will run **two billing systems permanently** —
`booking`'s inline integration and billing-core. This is intentional (see Context), but it means any
provider-integration defect must be triaged against both implementations. Record that split in the
operations runbook and incident checklist.

---

## Critical files

- `/Users/wachirayachankhonkan/AI-Workspace/projects/modules-hub/modules/subscription/core/{types,engine,service}.ts` — the two bug fixes + grace-period logic
- `/Users/wachirayachankhonkan/AI-Workspace/projects/modules-hub/modules/payment/adapters/stripe-adapter.ts` — subscription-mode checkout support
- `/Users/wachirayachankhonkan/AI-Workspace/projects/saas-product-hub/products/pawspace/supabase/migrations/20260825141500_phase13_subscription_lifecycle.sql` — the existing privileged RPC surface called only by the new narrow PawSpace ingress after a fresh function/grant/advisor review
- New in PawSpace: `supabase/functions/billing-entitlement-ingress/index.ts` (final name set by the PawSpace repo convention) — signed, timestamped, replay-bounded billing transition façade; Deno 2.1-compatible and independently tested
- `/Users/wachirayachankhonkan/AI-Workspace/projects/saas-product-hub/products/multi-tenant-ai/server/src/routes/payment-demo.ts` and `server/src/app.ts` — the proven webhook-wiring pattern to port to Hono
- `/Users/wachirayachankhonkan/AI-Workspace/projects/saas-product-hub/products/wstera-link/docs/02_SYSTEM_ARCHITECTURE.md`, `products/doccraft/docs/MONETIZATION_AND_PAYMENT_FLOW.md` — doc corrections
- New: `/Users/wachirayachankhonkan/AI-Workspace/projects/saas-product-hub/services/billing-core/` — the service itself (structure: `vendor/modules/`, `src/{lib,repositories,routes,jobs}/`, `wrangler.jsonc`)

## Verification

```bash
# Phase 0
cd modules-hub/modules/subscription && npm test && npm run typecheck
cd modules-hub/modules/payment && npm test && npm run typecheck

# Phase 1-3
cd services/billing-core && npm run typecheck && npm test

# PawSpace ingress and database security (exact commands resolved from current CLI --help)
cd products/pawspace && supabase functions serve
cd products/pawspace && supabase db advisors --local --type security --fail-on error

# Approach B — Stripe CLI, test-mode keys only
stripe listen --forward-to localhost:8787/webhooks/stripe
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger invoice.paid
stripe trigger invoice.payment_failed
stripe trigger customer.subscription.deleted
```
Manual checks in Stripe's test Dashboard: one Customer per account (no dupes on retry), correct
interval/price on the Subscription object, webhook delivery success rate 100% with nothing disabled.

Adversarial scripts to actually run (Approach C): replay a captured webhook body twice (expect
`200 {duplicate:true}` on the second, no duplicate audit-log row); resend with one tampered byte +
original signature (expect `401`); resend a valid PawSpace ingress request outside its timestamp
window or for the wrong product/shop (expect rejection before RPC); fire two concurrent
`/v1/checkout` calls for the same account (expect only one non-cancelled subscription); prove the
billing-core Worker environment contains no PawSpace Supabase secret/service-role key; force a
subscription's `grace_period_end` to the near future, invoke the same job used by the Worker's
`scheduled()` handler, confirm it flips to `expired`, and confirm the entitlement check returns
`false`.
