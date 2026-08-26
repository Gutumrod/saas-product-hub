# Plan: Centralized `billing-core` Service

**Status:** LOCKED — owner-approved 2026-08-27. This is the canonical architecture for portfolio
billing going forward. Do not design a competing/parallel billing architecture without an explicit
owner decision superseding this document.
**Supersedes for Phase 1 purposes:** `docs/platform/identity-billing-platform/PRD.md`'s Phase 1
("wire the 4 stripe-billing modules into a real app/server layer") — this document is that Phase 1,
specified concretely. Phases 2+ of that PRD (Hub-wide organizations/entitlement-sync/bundle
checkout) are not in scope here and remain a separate, still-unapproved future decision.

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

1. **Phase 0** — modules-hub fixes + tests green (above).
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
   docs. Nothing here is "done" until PawSpace is fully live, the doc corrections are in, and all of
   Phase 3's results have been reviewed together — no partial ship before real launch.

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
