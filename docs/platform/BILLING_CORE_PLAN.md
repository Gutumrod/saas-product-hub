# Plan: Centralized `billing-core` Service

**Status:** LOCKED — owner-approved 2026-08-27. This is the canonical architecture for portfolio
billing going forward. Do not design a competing/parallel billing architecture without an explicit
owner decision superseding this document.
**Revision:** v2 (2026-08-27, same day) — second review pass. v1 was approved and pushed; v2 adds
§0 (hard prerequisites, incl. a real Supabase-project-quota blocker v1 missed), the concrete
status-enum mapping, Stripe-customer/idempotency-key/backfill/proration specifics that v1 left to
the implementer's improvisation, and operational sections (secrets, observability, rollback,
explicit out-of-scope). No architectural decision from v1 changed — every v2 edit is a gap fill.
**Supersedes for Phase 1 purposes:** `docs/platform/identity-billing-platform/PRD.md`'s Phase 1
("wire the 4 stripe-billing modules into a real app/server layer") — this document is that Phase 1,
specified concretely. Phases 2+ of that PRD (Hub-wide organizations/entitlement-sync/bundle
checkout) are not in scope here and remain a separate, still-unapproved future decision.
**Relationship to the two production plans:** both `PORTFOLIO_PRODUCTION_MASTER_PLAN.md` (Codex's)
and `PRODUCTION_LAUNCH_PLAN_2026-08-27.md` (Claude's) already reference this document as the locked
billing authority and explicitly forbid designing a competing billing track. Those two plans coexist
deliberately by owner decision and are **not** to be merged here; this document stays the billing
spec both of them point at.

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
  `products/PawSpace/supabase/migrations/20260825141500_phase13_subscription_lifecycle.sql`.
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

**P-1. Supabase project quota is a real blocker (added v2).** This plan calls for a *new, separate*
Supabase project for billing-core's own tables. The org is on the free tier, which allows **2
active projects, and both slots are already used** (`gyleqrjdzwwlqierdwcy`, `coyelzlgukvpgguqpjdi`) —
`ROADMAP.md` records the owner's intent to upgrade to Supabase Pro only *after* revenue exists,
which is circular here (billing-core is what enables revenue). One of three must be chosen by the
owner before Phase 1:
- **(a) Upgrade to Supabase Pro now** — cleanest, matches the isolation intent, costs money before
  first revenue.
- **(b) Put billing-core's tables in a dedicated `billing_core` schema inside the existing
  `coyelzlgukvpgguqpjdi` (hub) project**, with its own DB role scoped to that schema only — no new
  project needed. Weaker isolation (shared DB blast radius) but preserves schema-level separation
  and can be migrated to its own project later. Note `registry.yaml` already reserves the name
  `schema: "billing_core"` for exactly this.
- **(c) Defer billing-core until Pro is affordable** — blocks PS01/LK01/DC01 monetization entirely.

Recommendation: **(b) now, (a) at first revenue.** It unblocks the build immediately at zero cost
and the eventual move is a schema dump/restore, not a redesign. **This choice must be made before
Phase 1; do not let an implementer silently pick one.**

**P-2. Stripe account/mode.** Confirm which Stripe account billing-core uses and that **test-mode
keys are used for everything through Phase 3.** Live keys must not exist in any local `.env` or
Worker secret until the owner explicitly authorizes go-live. Guard: billing-core refuses to boot if
`STRIPE_SECRET_KEY` starts with `sk_live_` unless `BILLING_CORE_ALLOW_LIVE=true` is also set —
implement this check in `src/lib/config.ts` as a startup assertion, not a comment.

**P-3. Currency and minor units.** All amounts are **THB in satang** (minor units): ฿990/month =
`99000`, ฿9,900/year = `990000`. The `payment` module already validates integer minor units; the
plan seed data and every price in billing-core's `plans` table must follow this. Getting this wrong
is a 100× billing error, so it is called out explicitly rather than left implicit.

**P-4. Phase 0 is a cross-repo change.** `modules-hub` is a **separate git repo**
(`github.com/Gutumrod/modules-hub`), not a subdirectory of this one — the Phase 0 fixes need their
own commit and push there. Deliberate decision on the existing stale copies of those modules:
- `products/multi-tenant-ai/modules/*` and `products/headless-commerce` (its `feat/reference-server`
  branch) — **leave stale.** They are sell-outright products with their own working reference
  servers; re-syncing them is unrelated churn and out of scope here.
- `products/stripe-billing/modules/*` — **leave stale**, and stop treating it as a build source.
  Its role is now historical; `billing-core` builds from `modules-hub`. (Optional cleanup, not
  required: the stray `.agy-prompt.md` / `.codex-result.json` / `.qwen-*` agent artifacts sitting in
  that tree.)
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
  `mode: 'subscription'` with inline `price_data[recurring][interval]` (keeps billing-core's own
  `Plan` table as the pricing source of truth, no manual Stripe Price provisioning per plan). Native
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

**Persistence:** a new, separate Supabase project for billing-core's own
`plans`/`subscriptions`/`payments`/`webhook_idempotency` tables (used by `wstera_link`/`doccraft`-
future accounts). `pawspace` keeps its own `shop_subscriptions` as authoritative — billing-core calls
into it via RPC, described below.

**Scheduler:** Cloudflare Cron Trigger (`wrangler.jsonc`, every 15 min) sweeping for `grace_period`
subscriptions whose `gracePeriodEnd`/`grace_period_end` has passed, in both billing-core's own DB
and PawSpace's `shop_subscriptions` — advances them to `expired`.

**API surface:**
```
POST /v1/checkout                              create/reuse Stripe Customer, create subscription-mode Checkout Session
GET  /v1/subscriptions/:product/:accountId      status (wstera_link/doccraft — pawspace reads its own DB/RPCs directly, not this)
GET  /v1/entitlements/:product/:accountId/:key  canUseFeature/getLimit wrapper
POST /v1/portal                                 Stripe Billing Portal session
POST /webhooks/stripe                           raw-body-first, Stripe-Signature verified
POST /internal/cron/grace-period-sweep          shared-secret header, cron-invoked
```

**How each product gets entitlement updates — decided per product, not generic:**
- **`pawspace`**: no webhook-out, no polling. Billing-core holds a scoped PawSpace Supabase
  service-role key and calls its *existing* RPCs directly (`transition_shop_subscription(...)`,
  `set_shop_commercial_package(...)`), using the Stripe event id as the RPC's built-in
  `p_idempotency_key`. No new PawSpace-side code needed — this reuses an already-audited trust
  boundary (`SECURITY DEFINER`, `service_role`-only) instead of building a new inbound webhook + auth
  story on PawSpace's side. `Plan.id` for pawspace plans is set to literally equal PawSpace's
  `commercial_packages.id` (`starter`/`pro`/`enterprise`) so no translation table is needed beyond
  `billingInterval` (`month`/`year`) ↔ `billing_interval` (`monthly`/`annual`).
- **`wstera_link`** (pre-build): future app calls `GET /v1/subscriptions`/`GET /v1/entitlements`
  synchronously at request time — pull, not push, since it has no local subscription state of its
  own. Billing-core *is* its subscription source of truth.
- **`doccraft`** (forward-looking, Phase 8): same pull model, documented only.

Webhook handler order (`routes/webhook.ts`), following the one proven-working pattern in this
portfolio (`multi-tenant-ai/server/src/routes/payment-demo.ts`), ported to Hono: read raw body first
→ verify signature → on replay return `200` (not `401` — Stripe disables the endpoint after repeated
401s on a legitimate duplicate) → route by event metadata to either PawSpace's RPC wrapper or
billing-core's own `subscriptionCore.handleBillingEvent` → record to audit log → `200`.

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
  `p_idempotency_key = uuidv5(stripe_event_id, BILLING_CORE_NAMESPACE_UUID)` with one fixed
  namespace UUID constant checked into `src/lib/ids.ts`. Deterministic means a replayed Stripe
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

#### 2d. Plan changes and proration (added v2)

The module's `changePlan` accepts an `immediate` flag and **ignores it** (verified — no proration,
no period reset). Do not build on it for paid plan changes. Decision: **plan changes are performed
Stripe-side, not module-side** — upgrade/downgrade goes through the Stripe Billing Portal
(`/v1/portal`), Stripe applies its own proration, and the resulting
`customer.subscription.updated` webhook is what updates state on our side (for PawSpace, via
`set_shop_commercial_package` + `transition_shop_subscription`). This keeps one source of truth for
money math and avoids reimplementing proration. `changePlan` remains usable only for
non-billing-affecting internal corrections; if that's ever needed for a paid subscription, its
ignored-`immediate` behavior must be fixed first.

### 3. Correct `wstera_link` and `doccraft` docs to point at billing-core

- `products/wstera-link/docs/02_SYSTEM_ARCHITECTURE.md` — update the Billing Flow section to name
  billing-core as the actual backend, not its currently-vendored local module copies. Check
  `docs/PRODUCT_DECISIONS.md`/`docs/DOCUMENTATION_AUDIT.md` for this repo's convention on amending a
  doc marked `LOCKED pre-build baseline` before editing (versioned changelog line, not silent edit).
  Its `04_PRICING_ENTITLEMENTS.md` plan table already maps cleanly onto the
  `EntitlementValue = boolean | number | string | null` shape with no gaps — no schema change needed.
- `products/DocCraft/docs/MONETIZATION_AND_PAYMENT_FLOW.md` §2 — name billing-core as the intended
  Phase 8 backend, sketch entitlement fields (`cloud_sync_enabled`, `device_limit`,
  `customer_record_limit`, `catalog_record_limit`) in the same shape. Explicitly marked
  forward-looking; no code, no schema, Phase 8 stays Phase 8.

### 4. Phased build order (matches the owner's mandated methodology exactly)

0. **Prerequisite gate (v2)** — §0's P-1 (Supabase project decision) answered by the owner, and P-2
   (test-mode-only guard) implemented. Phase 1 cannot start before P-1 is answered.
1. **Phase 0** — modules-hub fixes + tests green (above), committed and pushed to the `modules-hub`
   repo (separate repo — see §0 P-4).
2. **Phase 1** — billing-core skeleton + PawSpace wired end to end only (wstera_link/doccraft routes
   stub `501` for now). Seed billing-core's plan table with PawSpace's real 3 tiers. Done when one
   real PawSpace shop can complete a Stripe test-mode checkout and its `shop_subscriptions` row
   updates correctly, observed manually once.
3. **Phase 2 — self-test**: implementer smoke-checks every route locally before formal testing
   starts.
4. **Phase 3 — three test rounds, reviewed together only after all three finish, not one at a
   time:**
   - **A — automated regression**: module unit tests (incl. new bug-fix tests) + billing-core's own
     repository/mapping/integration tests.
   - **B — real Stripe test-mode E2E**: Stripe CLI (`stripe listen`, `stripe trigger ...`) against
     the real Stripe test API — closes the previously-flagged gap that the Stripe adapter had never
     been tested against real Stripe, only mocks. Manually cross-check Stripe's test Dashboard
     (Customers/Subscriptions/Events/Webhook delivery success rate).
   - **C — adversarial/negative-path**: replayed webhook idempotency, tampered signature rejection,
     out-of-order events (confirm PawSpace's transition guard rejects illegal transitions and
     billing-core surfaces that rejection rather than swallowing it), concurrent-checkout race, live
     grace-period-boundary sweep test.
5. **Phase 4** — finish remaining PawSpace routes + cron wiring; correct `wstera_link`/`doccraft`
   docs; remove `wstera-link/vendor/modules/*` (now obsolete, §0 P-4); implement the scoped-DB-role
   hardening for PawSpace access (§5a) and the alerting in §5b. Nothing here is "done" until
   PawSpace is fully live, the doc corrections are in, and all of Phase 3's results have been
   reviewed together — no partial ship before real launch.

---

## 5. Operations (added v2)

### 5a. Secrets

Required (Worker secrets in prod via `wrangler secret put`, local `.env` for dev — never committed):

| Secret | Purpose |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe API (test-mode until go-live — see P-2) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...`, signature verification |
| `BILLING_CORE_SUPABASE_URL` / `..._SERVICE_ROLE_KEY` | billing-core's own tables |
| `PAWSPACE_SUPABASE_URL` / `..._SERVICE_ROLE_KEY` | calling PawSpace's two RPCs |
| `BILLING_CORE_CRON_SECRET` | shared secret for `/internal/cron/grace-period-sweep` |

Portfolio convention applies: real values live in the central vault
(`.secrets/keys.txt`) and are read from it directly — never copied into repo files, docs, chat, or
agent output. When updating a secret, verify with a live call, not a dashboard success message (the
2026-08-20 DB-password rotation silently failed and looked successful — see `ROADMAP.md` gate 1).

**Blast-radius note, stated deliberately:** billing-core holds PawSpace's **service-role** key,
which is full-database access, to call two `SECURITY DEFINER` RPCs. That is a real concentration of
privilege and the main security cost of centralizing. It is accepted because the alternative
(building an authenticated inbound webhook endpoint on PawSpace) duplicates verification logic the
RPC already provides. Mitigation, required at Phase 4: PawSpace should issue billing-core a
**dedicated DB role with `EXECUTE` on exactly those two RPCs and nothing else**, rather than the
blanket service-role key, once the integration is proven. Track this as a Phase 4 hardening item,
not an optional nice-to-have.

### 5b. Observability and alerting

The owner's stated reason for centralizing was: one place to fail means you find out immediately,
instead of four places failing quietly. **That only holds if something actually watches it** — so
this is a required part of the build, not a follow-up:
- Every webhook outcome (verified / replay / invalid-signature / routed / skipped / RPC-rejected)
  is written to the `audit-log` module with the Stripe event id.
- `GET /health` returns Stripe reachability + both Supabase connections, not just `200 OK`.
- **Alert to the owner (LINE or email) on:** any invalid-signature burst, any RPC rejection that
  isn't an expected idempotent duplicate, any cron sweep that errors or processes zero rows when
  rows were due, and Stripe webhook delivery failures. Until a portfolio-wide alerting path exists,
  the minimum acceptable version is a daily digest — silence must never be the only signal.
- Weekly manual check during rollout: Stripe Dashboard → Developers → Webhooks delivery success
  rate is 100% and the endpoint is not disabled.

### 5c. Rollback / kill-switch

- Billing-core is deployed independently of every product, so `wrangler rollback` reverts it
  without touching PS01/LK01/DC01.
- **Products must fail safe when billing-core is unreachable.** For entitlement reads, PawSpace is
  already safe by construction (it reads its own DB; billing-core being down means state simply
  stops updating). For LK01/DC01's pull model, an unreachable billing-core must **not** silently
  grant paid features — decide per product between "deny (fail closed)" and "serve last-known
  cached entitlement with a TTL"; LK01's own locked spec already mandates fail-closed, so follow it.
- `/v1/checkout` failing is a lost sale, not a data-integrity problem — it is safe to hard-fail with
  a clear user-facing error.
- A Stripe-side kill switch exists independently: disabling the webhook endpoint in the Stripe
  Dashboard stops all inbound state changes without deploying anything.

### 5d. Explicitly out of scope

Named so nobody re-opens them mid-build: VAT / Thai tax invoices (the org isn't VAT-registered —
plain receipts only), Stripe Connect / marketplace payment splitting (not needed — all four
Subscribe products collect into the platform's own Stripe account), migrating `booking` onto
billing-core, Hub-wide multi-product bundle checkout and cross-product discounts (that's
`identity-billing-platform`'s later phases, still unapproved), and dunning-email design (Stripe's
built-in retry/dunning is used as-is for now).

**Known accepted consequence:** the portfolio will run **two billing systems permanently** —
`booking`'s inline integration and billing-core. This is intentional (see Context), but it means any
money-related bug must be checked in both places. This must be written into the operations runbook;
in six months nobody will remember it otherwise.

---

## Critical files

- `/Users/wachirayachankhonkan/AI-Workspace/projects/modules-hub/modules/subscription/core/{types,engine,service}.ts` — the two bug fixes + grace-period logic
- `/Users/wachirayachankhonkan/AI-Workspace/projects/modules-hub/modules/payment/adapters/stripe-adapter.ts` — subscription-mode checkout support
- `/Users/wachirayachankhonkan/AI-Workspace/projects/saas-product-hub/products/PawSpace/supabase/migrations/20260825141500_phase13_subscription_lifecycle.sql` — the existing RPC surface billing-core calls into (verified: `transition_shop_subscription`, `set_shop_commercial_package`, both `future_billing_event`-aware with idempotency keys)
- `/Users/wachirayachankhonkan/AI-Workspace/projects/saas-product-hub/products/multi-tenant-ai/server/src/routes/payment-demo.ts` and `server/src/app.ts` — the proven webhook-wiring pattern to port to Hono
- `/Users/wachirayachankhonkan/AI-Workspace/projects/saas-product-hub/products/wstera-link/docs/02_SYSTEM_ARCHITECTURE.md`, `products/DocCraft/docs/MONETIZATION_AND_PAYMENT_FLOW.md` — doc corrections
- New: `/Users/wachirayachankhonkan/AI-Workspace/projects/saas-product-hub/services/billing-core/` — the service itself (structure: `vendor/modules/`, `src/{lib,repositories,routes,jobs}/`, `wrangler.jsonc`)

## Verification

```bash
# Phase 0
cd modules-hub/modules/subscription && npm test && npm run typecheck
cd modules-hub/modules/payment && npm test && npm run typecheck

# Phase 1-3
cd services/billing-core && npm run typecheck && npm test

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
original signature (expect `401`); fire two concurrent `/v1/checkout` calls for the same account
(expect only one non-cancelled subscription to exist afterward); force a subscription's
`grace_period_end` to the near future, wait, invoke the cron sweep manually, confirm it flips to
`expired` and the entitlement check returns `false`.
