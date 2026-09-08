# CLAUDE EXPERT REPORT — WSTERA Billing Core Multi-Product Profile Architecture

**Expert:** Claude (independent clean-room)
**Mode:** Architecture + Risk/Invariant only (Targeted Decision Mode)
**Date:** 2026-09-07
**Authority:** Owner is final authority. This report is an independent expert input; it does not authorize build, live money, or production.

---

## 0. Recommendation

**ADOPT the Owner candidate** — `WSTERA Products -> Central Billing API -> request-scoped canonical product_id -> Product Billing Profile Registry -> Provider Adapter -> Stripe` — **with the hardening conditions below**, and propose Council verdict **REMEDIATE** (not PASS, not BLOCK).

Rationale in one line: the centralized-billing direction is already LOCKED and evidence-backed (BILLING_CORE_PLAN.md v4, Phase 0.5 security contracts, 2026-09-01 Payment Council synthesis), and the multi-product profile registry is a sound, buildable extension of that locked direction — but the frozen brief asks for a *complete, build-usable* contract across 21 output areas, and several of those contracts are not yet fully specified or are contradicted by current evidence. A PASS would overstate lock-readiness; a BLOCK is not warranted because every gap is a bounded, nameable remediation that does not require re-litigating the frozen Owner decisions.

**The single most important hardening condition:** the brief's "no mutable global current_profile/active_product" invariant is correct and must be the load-bearing rule, but the current `BILLING_CORE_PLAN.md`/Phase 0.5 evidence does not yet define the **Product Billing Profile Registry** as a first-class versioned object with an explicit migration/rollback rule and a fail-closed admission gate. That is the concrete gap to close before PASS.

---

## 1. Verified facts and exact evidence paths

All facts below were read directly from the named files (not from memory or other experts' output).

### 1.1 Centralization is already LOCKED (not a new decision)
- `docs/platform/BILLING_CORE_PLAN.md` (v4, 2026-08-27, status LOCKED): "This is the canonical architecture for portfolio billing going forward. Do not design a competing/parallel billing architecture without an explicit owner decision superseding this document." The owner's fixed strategic goal is **one centralized billing service**, not each product independently copying Stripe modules.
- The plan already added a **thin host-level billing orchestrator** for product policy, provider normalization and scheduled coordination (2026-09-01 addendum), and a **per-product policy/config direction** (Codex synthesis, `docs/council-payment-core-2026-09-01/FINAL-CODEX-SYNTHESIS.md`).

### 1.2 Stripe is the primary provider; Test Mode only now
- `BILLING_CORE_PLAN.md` P-2: test-mode keys for everything through Phase 3; live keys must not exist in any local `.env` or Worker secret until explicit go-live authorization; **boot guard**: billing-core refuses to boot if `STRIPE_SECRET_KEY` starts with `sk_live_` unless `BILLING_CORE_ALLOW_LIVE=true` (implemented as a startup assertion in `src/lib/config.ts`, not a comment).
- Frozen Owner decision #2: one Stripe account, Test Mode and Live Mode; Test Mode only authorized now. #3: live money/keys/charges/production prohibited until explicit authorization.

### 1.3 Stripe Card/Subscription is the recurring rail; PromptPay is manual
- `BILLING_CORE_PLAN.md` 2026-09-01 addendum: "Stripe card / Stripe Subscription is the recurring rail. It owns automatic recurring collection for subscription products." "PromptPay is a manual/non-auto-renew payment rail. It must not become a second subscription state machine."
- Frozen Owner decisions #4, #5, #6, #7: reconciliation mandatory before payment/entitlement transitions that depend on PromptPay; webhook/browser redirect alone is not authoritative money truth; reconciliation must re-fetch provider truth and verify product/account/expected payment/subscription/amount/currency and apply an idempotent transition.

### 1.4 Security contracts already exist and are strong
- `docs/platform/BILLING_CORE_PHASE_0_5_SECURITY_CONTRACTS.md` (rev 2, 2026-08-30): threat model T1–T20; `/v1/*` auth contract; **product-wide account reach** (product credential is product-granularity only, NOT account isolation — T16, §2.3); account-bound assertion required for `/v1/portal`; transactional outbox webhook intake (§4); vendor provenance/pin policy (§5, pin = `modules-hub` main `3b6401a28e6f7e69b383277a200fca1986f49ede`); Worker `scheduled()` contract (§6); R15 pre-data gate (hub-web must move off the Project A `postgres` owner `DATABASE_URL` before any billing data exists).
- The brief's "product credential binding alone is not same-product account isolation" is **explicitly confirmed** by Phase 0.5 §2.3 and T16.

### 1.5 Current commercial-mode reality (newer Owner authority) — verified from the 7 product Build-to-Sell briefs
- **BK01** (`products/booking/docs/BUILD-TO-SELL-EXECUTION-2026-09-06.md`): merchant-paid recurring subscription; mature self-contained Stripe integration; **out of scope for forced migration** (Frozen decision #9, #10).
- **PS01 Pawstia** (`products/pawspace/docs/...`): merchant-paid recurring subscription; Founding C2 = first 10 stores, invitation-only, THB 990/month, continuous subscription required; public package pricing remains downstream.
- **WS01 WSM** (`products/WSM/docs/...`): tenant recurring subscription direction; final packages/pricing/trial unresolved.
- **LK01 WSTERA Link** (`products/wstera-link/docs/...`): Free + recurring subscription; final public pricing/quota unresolved; redirect hot path must not depend synchronously on analytics or billing.
- **DC01 DocCraft** (`products/doccraft/docs/...`): Free Public Pilot first; later one-time unlock experiment THB 299–599; **subscription is NOT V1**.
- **MT01** (`products/multi-tenant-ai/BUILD-TO-SELL-EXECUTION-2026-09-06.md`): one-time source product, USD 149–199 single purchase, perpetual use of purchased version + 12 months updates.
- **CM01** (`products/booking-ticket-module/docs/...`): one-time commercial source/license product; final pricing unresolved.

### 1.6 Drift the brief flags — confirmed
- `BILLING_CORE_PLAN.md` still carries stale DocCraft subscription language; current DC01 authority is free Public Pilot then a later one-time unlock experiment. **Confirmed** — the plan's Context section lists `doccraft` under the "Subscribe" group, which contradicts the current DC01 brief (subscription is not V1). This is document drift, not a re-litigation.
- The plan historically accepted two billing systems because BK01 was excluded. **Confirmed** — §5d: "the portfolio will run two billing systems permanently — booking's inline integration and billing-core. This is intentional." This run evaluates compatibility/facade convergence without forced migration.
- Phase 0.5 webhook contract is a transactional outbox/durable delivery, not a presence-only event ledger. **Confirmed** — §4.

### 1.7 Provider behavior verified against current official Stripe documentation (2026-09-07)
- **Webhook signature:** `Stripe-Signature` header contains `t=` timestamp and `v1=` signature(s); verify HMAC-SHA256 over `timestamp + "." + raw body`; constant-time compare; default tolerance 5 minutes; **do not use tolerance 0** (disables recency check); Stripe generates a new signature+timestamp on each retry delivery. (docs.stripe.com/webhooks)
- **Price immutability:** Stripe Price objects are immutable — `unit_amount` cannot be updated after creation; to change price you create a new Price under the same Product and migrate subscriptions. (docs.stripe.com/api/prices/object; confirmed by multiple sources)
- **Idempotency:** Stripe idempotency keys are up to 255 chars; results cached for ≥24h; reusing a key with different parameters returns an `idempotency_error` (409); keys expire after 24h. (docs.stripe.com/api/idempotent_requests)
- **PromptPay:** Thailand government-led instant payment; merchant shows QR, customer scans with bank app; confirmation received from Stripe when payment completes; auto-enabled for Dashboard-eligible Thailand accounts. (docs.stripe.com/payments/promptpay)

---

## 2. Proposed contracts for all 21 required output areas

### 2.1 Recommended Architecture
```
WSTERA Product (server) -> Central Billing API (/v1/*) -> request-scoped canonical product_id
  -> Product Billing Profile Registry (versioned, per environment)
  -> Provider Adapter (Stripe; later PromptPay) -> Stripe
  -> Webhook intake (one public endpoint) -> durable outbox -> reconcile -> entitlement adapter -> Product-owned state
```
- **No mutable global `current_profile`/`active_product`.** Every request/event/job resolves product/profile request-scoped from canonical identity + environment. This is the load-bearing invariant (Frozen candidate CRITICAL).
- Billing Core is a **thin orchestrator + policy/config holder**, not the owner of Product business state. It owns: profile registry, provider object mappings, reconciliation, webhook durable intake, entitlement adapter dispatch, audit.
- Products keep their own authoritative business/entitlement state; Billing Core pushes/pulls through a narrow entitlement adapter boundary.

### 2.2 Decision rationale
- Centralization is already LOCKED and evidence-backed; the multi-product registry is the natural extension that lets a new Product onboard by registering a profile instead of building a new Stripe integration.
- One server-side billing entry path reduces the "four places failing quietly" problem the owner cited as the reason to centralize (BILLING_CORE_PLAN.md §5b).
- The profile registry decouples commercial policy (per-product) from the shared money-correctness spine (idempotency, reconciliation, webhook), which is exactly what the 2026-09-01 Council and Phase 0.5 already established.
- Do NOT force all Products into the same monetization model — the registry must represent `free`, `trial`, `subscription`, `one_time`, `manual_renewal` and let each Product use the rails appropriate to it.

### 2.3 Product Billing Profile Schema (versioned)
A versioned profile object, stored in `billing_core` schema, keyed by `(product_id, environment, profile_version)`. At minimum:

```yaml
profile:
  product_id: string            # canonical, request-scoped
  product_code: string          # stable, human-readable
  environment: test|live
  profile_version: int          # monotonic; runtime never silently picks partial
  status: draft|active|suspended|retired
  billing_models: [free|trial|subscription|one_time|manual_renewal]
  currency: string               # ISO 4217
  minor_unit_rules: { exponent: int, allowed: [..] }   # never assume 2 decimals
  plans: [ { plan_id, package_ref, price_ref, interval, trial_days?, ... } ]
  rails:
    card_subscription: { enabled: bool, auto_renew: bool }
    promptpay: { enabled: bool, manual_renew: bool, expiry_minutes: int }
  lifecycle_refs:
    trial: { days, downgrade_target }
    grace: { days, downgrade_target }
    retry_dunning: { max_attempts, backoff, policy_ref }
  entitlement_adapter: { contract_version, endpoint/ingress_ref, push|pull|snapshot }
  refund_policy_ref: string
  provider_mappings:            # by environment
    test: { stripe_product_id, stripe_price_ids: {plan_id: price_id} }
    live: { stripe_product_id, stripe_price_ids: {plan_id: price_id} }
  admission: { isolation_test_ref, activated_at }
```
- **Profile mutation/version changes MUST have an explicit migration/rollback rule** (Frozen brief §New Product admission). Runtime must not silently pick a partially-written profile — reads must be atomic against a fully-committed version.

### 2.4 Profile lifecycle/state model
`draft -> (register) -> active -> suspended -> retired`
- `draft`: profile exists but not admitted; no checkout/entitlement possible.
- `active`: passed isolation tests + admission gate; can serve requests.
- `suspended`: fail-closed hold (e.g. reconciliation capability lost, security incident); requests fail closed.
- `retired`: no new checkouts; existing subscriptions continue under a pinned profile version until migrated.
- Version transitions: `active@v1 -> active@v2` requires a migration plan (what changes, which existing subscriptions re-map, rollback target). A partially-written v2 is never readable as active.

### 2.5 Billing API Contract
Evaluate the brief's minimum set and harden:
- `POST /v1/checkout` — create/reuse Stripe Customer, create subscription-mode Checkout Session. **Server-derived idempotency key** (environment + credential/product + account + operation + immutable logical checkout-attempt ID), never caller-supplied (T13). DB lock/reservation before Stripe Customer call so concurrent retry cannot create a duplicate Customer. Return URL from server-side allowlist only (T11). Account-bound assertion recommended.
- `GET /v1/subscriptions/:product/:accountId` — caller credential + product match; `:product` must equal credential's product; cross-product → 403. Without account-bound assertion this is **product-wide read** (explicit acceptance per product).
- `GET /v1/entitlements/:product/:accountId/:key` — same product-wide-read caveat.
- `POST /v1/portal` — **account-bound assertion REQUIRED** (T16/§2.2); short-lived session; server-selected allowlisted return URL; rate-limited per credential AND per account.
- Every `/v1/*` route: server-side product identity, account/tenant identity, environment, authorization, idempotency, valid profile/plan. Prevent wrong-product, cross-product, cross-account, caller product spoofing, caller-supplied Stripe Price manipulation.
- **Caller-supplied Stripe Price manipulation:** the Price is resolved server-side from the profile's `provider_mappings` by `plan_id`; the caller never supplies a Stripe Price ID. A caller-supplied price/amount is rejected.

### 2.6 Stripe Product/Price Mapping Contract
- **One Stripe Product maps to one WSTERA Product** (bounded rule). A WSTERA Product may have multiple Stripe Prices (one per plan/version).
- **Price-per-plan/version strategy:** each plan/version is a distinct immutable Stripe Price. Price lifecycle is immutable (verified: Stripe Price `unit_amount` cannot be updated). Price change = create new Price under the same Stripe Product, migrate subscriptions, retire old Price from new-checkout use (existing subscriptions keep their pinned Price until migrated).
- **Where IDs are stored:** in the `billing_core` schema `provider_mappings` (per product, per environment), NOT in Product repos.
- **Provider IDs are config/mapping data, NOT domain/commercial truth.** The commercial truth is the profile's plan/package/policy; Stripe IDs are the provider-side projection. Metadata must never be treated as authority (see 2.7).
- **Test vs live mapping isolation:** separate `provider_mappings.test` and `.live`; a live mapping is never resolvable in test and vice versa; environment binding is enforced (T18).
- **Metadata convention:** `metadata.product`, `metadata.account_id`, `metadata.profile_version`, `metadata.environment` are **routing hints only** — they may route a webhook to the right product/account but must never by themselves authorize money truth or entitlement truth (Frozen brief §Webhook routing).
- **Exact values Product repos must never hardcode:** Stripe Product IDs, Stripe Price IDs, Stripe Customer IDs, currency exponents, plan amounts, intervals, trial/grace days, retry/dunning policy. All resolved from the profile/registry server-side.

### 2.7 Metadata Convention
- Allowed metadata on Stripe objects: `product`, `account_id`, `profile_version`, `environment`, `plan_id`, `checkout_attempt_id` (routing/correlation).
- **Never treated as authority:** any metadata field that would grant money truth or entitlement truth. Metadata is a routing hint; the authoritative state comes from provider re-fetch + reconciliation + the profile registry.
- Metadata is redacted in audit logs (T14); no PII in metadata.

### 2.8 Webhook Routing Contract
Target candidate (endorsed): one Stripe webhook entry -> signature verify -> durable event claim/outbox -> identify product/account -> provider re-fetch/reconcile -> state transition -> entitlement adapter.
- **Product/account provenance:** from `metadata.product`/`metadata.account_id` as routing hints, then **verified by provider re-fetch** (the Stripe object's customer/subscription must match the mapped account). An event with no recognized `metadata.product` is audit-logged and answered `200`, never guessed (BILLING_CORE_PLAN.md §2b).
- **Metadata role:** routing hint only (2.7).
- **Provider lookup timing:** re-fetch provider truth before applying a money/entitlement transition (Frozen #6/#7). Webhook body alone is insufficient authority.
- **Duplicate/out-of-order:** `processed_events` UNIQUE on Stripe event ID + explicit status; duplicate → `200 {duplicate:true}`; out-of-order distinct events → compare provider object/version timestamp with current snapshot, monotonic transition rules, reconcile before ambiguous regression, record stale event as `skipped` (T20).
- **Retry ownership:** billing-core owns retry via `delivery_jobs` outbox with exponential backoff + jitter, bounded `max_attempts`, dead-letter + operator requeue (T19).
- **Per-account ordering:** per-`(product, account_id)` serialization where transitions are order-sensitive (T19/T20).
- **Audit:** every outcome writes one redacted `audit_events` row (T14).

### 2.9 Reconciliation Contract
Shared reconciliation for Stripe subscription/payment state AND manual PromptPay state. Must cover: expected amount/currency/product/account/plan/billing period; missing webhook; paid-but-no-entitlement; entitlement-without-valid-payment; refund; cancellation; failed renewal; stale provider state; PromptPay expiry; drift repair.
- **Browser success redirect is never authoritative state** (Frozen #6, #7).
- **Polling/re-fetch cadence:** scheduled reconciler (default daily, per-product override; Codex synthesis). Re-fetch provider truth, match product/account/expected payment/subscription/amount/currency, apply idempotent transition.
- **Bounded retries/backoff:** exponential backoff + jitter, bounded attempts, dead-letter.
- **Operator review/dead-letter path:** `failed`/dead-letter state, alerting, operator-safe requeue.
- **Monotonic/out-of-order rules:** compare provider timestamps; never regress newer state with an older event; reconcile before ambiguous regression.

### 2.10 Entitlement Adapter Boundary
Billing Core must NOT own Product business state. Define `Billing Core -> Product Entitlement Adapter -> Product-owned state` for push/pull/snapshot patterns.
- **Signed ingress:** narrow, signed, timestamped, replay-bounded (e.g. PawSpace Project B Edge Function ingress; Phase 0.5 §1.1/§4).
- **Local snapshot:** bounded local entitlement snapshot off the redirect hot path (LK01; DC01 future).
- **TTL/staleness:** fail closed when snapshot missing/expired (LK01 locked spec mandates fail-closed).
- **Replay/idempotency:** deterministic idempotency key (UUIDv5 from event ID) so replay hits the product's own UNIQUE constraint.
- **Product outage / billing-core outage / recovery:** products fail safe; billing-core outage stops state updates but must not silently grant paid features.
- **Entitlement drift:** reconciler detects and repairs.
- **Audit correlation:** correlation ID across billing-core, webhook, entitlement adapter, product state.
- Examples (from brief): PS01 → Pawstia authoritative subscription lifecycle via narrow signed transition ingress; LK01 → bounded local entitlement snapshot off redirect hot path; DC01 → future one-time unlock/license entitlement preserving local-first; source-sale products (MT01/CM01) → purchase/fulfillment/license/update entitlement, NOT a fake recurring subscription.

### 2.11 Test Fixture Contract
- Use Stripe Test Mode on the one WSTERA Stripe account as **`WSTERA Stripe Sandbox / Billing Test Fixture`** (NOT "Queueeasy Stripe Fixture" — Queueeasy is a separate Shared LINE OA test fixture, per BUILD-TO-SELL-EXECUTION-2026-09-06.md).
- Deterministic test identity: `environment=test`, `product_id`, `account_id`, `profile_version`, `test_run_id`.
- Product-specific test customers/products/prices OR an equally isolated mapping contract; deterministic cleanup; webhook tests; reconciliation tests; entitlement tests; negative/failure tests; **explicit proof Product A cannot modify Product B entitlement**.

### 2.12 Test/Live Configuration Model
- Separate `provider_mappings.test` and `.live`; separate credentials per environment; environment- and audience-bound (T18).
- Test Mode only authorized now; live keys impossible before Owner authorization + runtime live-key boot guard (P-2).
- Staging: `billing_core_staging` schema + scoped role in Project A (no new project, no Pro/branch DB — §10 D10, Free-First).

### 2.13 New Product Admission Procedure
Harden the candidate `REGISTER PROFILE -> CREATE/MAP STRIPE PRODUCT -> CREATE/MAP PRICE -> DEFINE ENTITLEMENT ADAPTER -> RUN TEST SUITE -> PASS ISOLATION -> ACTIVATE` into a **fail-closed admission gate**:
1. REGISTER PROFILE (draft)
2. CREATE/MAP STRIPE PRODUCT (test)
3. CREATE/MAP PRICE (test)
4. DEFINE ENTITLEMENT ADAPTER (contract_version, ingress/snapshot)
5. RUN TEST SUITE (unit + Stripe test-mode E2E + adversarial)
6. PASS ISOLATION (prove Product A cannot modify Product B entitlement)
7. MAP LIVE PROVIDER OBJECTS (only when live authorized)
8. VERIFY RECONCILIATION CAPABILITY
9. VERIFY AUTHORIZATION BINDINGS (per-product credential, account-bound assertion where required)
10. VERIFY AUDIT CONTROLS
11. ACTIVATE
- **Activation must be impossible if any required environment/provider mapping, authorization binding, reconciliation capability, entitlement contract, test, or audit control is incomplete.** Fail-closed.
- Profile mutation/version changes have an explicit migration/rollback rule; runtime never silently picks a partially-written profile.

### 2.14 BK01 Compatibility/Migration Decision
- **Forced migration is PROHIBITED** (Frozen #9). BK01 keeps its mature inline Stripe integration.
- **Recommended path: transitional exception + central facade/adapter in front of the existing implementation**, with later migration after central proof. This is the evidence-backed compatibility path.
- The goal is eventual one central product-facing entry contract without destabilizing BK01.
- **Do NOT merge BK01 merchant/customer PromptPay deposit flow into WSTERA SaaS billing** (Frozen #10). BK01 SaaS subscription paid to WSTERA and BK01 merchant/customer PromptPay deposit are separate financial domains.
- The portfolio will run two billing systems during transition (already accepted in BILLING_CORE_PLAN.md §5d); the facade converges the product-facing entry contract over time.

### 2.15 Security Invariants (MUST be explicit)
- Live keys impossible before Owner authorization + runtime live-key boot guard.
- No secrets in Product repos.
- Server-side product binding and account/tenant binding.
- No caller-supplied provider price authority.
- Environment separation and test/live mapping isolation.
- Idempotency, replay protection, durable webhook intake/outbox.
- Duplicate and out-of-order event handling.
- Provider re-fetch + amount/currency validation.
- Stripe signature verification and bounded raw body handling (64 KB cap).
- No raw sensitive payload/secret logging; redacted allowlisted audit projection.
- No cross-product or cross-tenant/account access.
- Safe refund/cancel/renewal behavior and auditability.
- No mutable global active/current profile.

### 2.16 Failure Handling Matrix (all 20 required cases)
| # | Failure | Detection | Safe behavior | Retry/reconcile | Entitlement effect | Audit/alert | Recovery owner |
|---|---|---|---|---|---|---|---|
| 1 | Stripe unavailable | API error/timeout | Checkout fails (lost sale, not data loss); webhook intake still verifies+durably stores | Bounded retry/backoff; reconciler re-fetches when Stripe returns | No new grant; existing state unchanged | Alert on Stripe outage | billing-core ops |
| 2 | Billing Core unavailable | liveness/readiness probe | Products fail safe; LK01/DC01 fail closed on missing/expired snapshot; PawSpace reads own DB (state stops updating) | N/A (billing-core is the down component) | No silent grant of paid features | Alert on billing-core outage | billing-core ops |
| 3 | Product unavailable | entitlement adapter call fails | Billing-core records transition, retries via outbox; product recovers and reconciles | Bounded retry/backoff; dead-letter | Entitlement update deferred until product returns | Alert on product outage | product ops |
| 4 | Webhook missing | reconciler detects local vs Stripe drift | Reconciler re-fetches provider truth and applies idempotent transition | Reconciler owns | Repaired by reconciliation | Alert on drift | billing-core ops |
| 5 | Webhook duplicate | `processed_events` UNIQUE | `200 {duplicate:true}`; no re-apply | N/A (already applied) | No double-grant | `replay` audit row | billing-core |
| 6 | Webhook out-of-order | provider timestamp vs snapshot | Monotonic rules; reconcile before ambiguous regression; stale event → `skipped` | Reconciler | No regression of newer state | `skipped` audit row | billing-core |
| 7 | Wrong amount | reconciliation amount match | Reject transition; do not grant; operator review | Reconciler + operator | No grant on mismatch | Alert + dead-letter | billing-core ops + operator |
| 8 | Wrong currency | reconciliation currency match | Reject transition; do not grant | Reconciler + operator | No grant on mismatch | Alert + dead-letter | billing-core ops + operator |
| 9 | Wrong Product | metadata routing + provider re-fetch | Event with unrecognized product → audit-logged, `200`, no guess | N/A | No cross-product grant | `skipped` audit row | billing-core |
| 10 | Wrong account | account-bound assertion / provider re-fetch | Reject; no cross-account action | N/A | No cross-account grant | Alert | billing-core |
| 11 | Stale profile | profile_version check | Fail closed; do not serve a partially-written/retired profile | Operator updates profile with migration | No grant on stale profile | Alert | billing-core ops |
| 12 | Stale Stripe Price | provider re-fetch + price mapping | Reject caller-supplied price; resolve from profile; reconcile | Reconciler | No grant on stale price | Alert | billing-core ops |
| 13 | Checkout success but payment fails | webhook `checkout.session.async_payment_failed` / `payment_intent.payment_failed` | No entitlement grant; notify; allow retry | Retry/dunning | No grant until paid | Audit | billing-core |
| 14 | Payment succeeds but entitlement update fails | entitlement adapter failure | Billing-core records paid state; retries entitlement via outbox; reconciler repairs | Bounded retry/backoff; dead-letter | Entitlement deferred until adapter succeeds | Alert | billing-core + product ops |
| 15 | Entitlement exists without valid payment | reconciler detects entitlement-without-valid-payment | Revoke/flag; do not trust entitlement alone | Reconciler | Revoke entitlement | Alert | billing-core ops |
| 16 | Refund | Stripe refund event / reconciler | Apply refund; revoke/flag entitlement per policy; audit | Reconciler | Entitlement adjusted per refund policy | Audit | billing-core ops |
| 17 | Cancellation | `customer.subscription.deleted` / cancel_at_period_end | End entitlement at period end; no auto-renew | Reconciler | Entitlement ends per policy | Audit | billing-core |
| 18 | Card retry failure | `invoice.payment_failed` | Enter grace/retry/dunning per policy; block entitlements on `past_due` immediately (Phase 0 fix) | Retry/dunning | No grant while past_due | Alert | billing-core |
| 19 | PromptPay expiry | expiry timer / reconciler | Notify; enter grace or downgrade to Free per policy; no auto-renew | Reconciler | Paid entitlement ends; account/history preserved | Audit | billing-core |
| 20 | Reconciliation finds drift | reconciler | Re-fetch provider truth; apply idempotent correction; operator review for ambiguous cases | Reconciler + operator | Repaired | Alert + dead-letter | billing-core ops + operator |

### 2.17 Observability/Audit Requirements
- Every webhook outcome durably recorded (verified/replay/invalid-signature/routed/skipped/RPC-rejected) with Stripe event ID, correlation ID, product, account reference, attempt, latency, redacted result.
- Separate liveness and readiness probes; dependency probes with strict timeouts, never expose credentials/customer data/raw provider errors.
- Alert on: invalid-signature bursts, unexpected RPC rejections, queue age/retry exhaustion, reconciliation drift, failed sweeps, Stripe webhook delivery failures.
- Dashboards: intake rate, duplicate rate, processing lag, transition success/error rate, reconciliation drift, entitlement snapshot age by product/environment.
- Weekly manual check during rollout: Stripe Dashboard webhook delivery success rate 100%, endpoint not disabled.
- Audit: allowlisted projection only (T14); append-oriented ledger/audit rows; retention/deletion defined.

### 2.18 Build Sequence
Evaluate the candidate sequence. **Endorse with evidence** (matches BILLING_CORE_PLAN.md money-correctness order and Codex 10-phase build order):
`Existing Billing decisions -> Freeze architecture inputs -> Multi-Product Profile Contract -> Security/identity contract -> Stripe Test preflight -> Core Billing API -> Webhook durable intake -> Card recurring vertical slice -> Reconciliation -> PromptPay adapter -> Product #1 integration -> Product #2 isolation proof -> New-product admission harness -> Live-readiness gate`
- This is the correct money-correctness order. Reconciliation MUST precede PromptPay activation (Frozen #6/#7; Codex consensus 4/4 that reconciliation is required before production, and the brief's own build order places Reconciliation before PromptPay adapter).
- A Council PASS does not authorize implementation, production deployment, live keys, or live charges.

### 2.19 Acceptance Test Matrix
- Unit: module bug-fix tests (past_due blocks, grace_period respects end time, monthly/annual period math incl. leap-year/month-overflow).
- Integration: repository/mapping/integration tests.
- Stripe test-mode E2E: `stripe listen`, `stripe trigger ...` against real Stripe test API; manual Dashboard cross-check (one Customer per account, correct interval/price, webhook delivery 100%).
- Adversarial: replayed webhook idempotency incl. non-consecutive `A→B→A` and cancelled-then-replay-old-event; concurrent duplicate delivery (apply once); tampered/expired ingress signature; wrong product/account binding; oversized body; out-of-order events; concurrent-checkout race; queue retry exhaustion; webhook-to-Stripe reconciliation; live grace-period-boundary sweep; **proof Product A cannot modify Product B entitlement**.
- Reconciliation: missing webhook, paid-but-no-entitlement, entitlement-without-valid-payment, refund, cancellation, failed renewal, stale provider state, PromptPay expiry, drift repair.
- Entitlement: push/pull/snapshot, TTL/staleness, replay/idempotency, product outage, billing-core outage, recovery, drift, audit correlation.

### 2.20 Explicit Non-Goals
- Live Stripe charges/keys or production deployment.
- Final public pricing or Product pricing mutation.
- Paid infrastructure purchases without Free-First exception evidence.
- Stripe Connect, marketplace payments, merchant-of-record expansion, tax-accounting redesign.
- Billing-as-a-Service productization (internal-first only; BaaS is a separately gated future decision).
- Rewriting BK01 payment implementation for architectural symmetry.
- Product feature expansion.
- Unrelated Council, Module Hub Scan, or generic portfolio work.

### 2.21 Open Owner Decisions (only where genuinely required)
- Final public pricing/packages for PS01, WS01, LK01, CM01 (downstream; not this Council's decision).
- Exact reconciliation cadence per product (default daily; per-product override is product configuration, not a hard-coded constant).
- PromptPay renewal reminder lead time (product configuration within the owner-approved reminder window).
- Refund handling in the internal-first phase is a support-ticket/manual-operator process (no automated refund subsystem implied).

---

## 3. Security/risk invariant analysis

The Phase 0.5 security contracts (T1–T20) are the strongest part of the evidence and are directly reusable. Key invariants that MUST hold in the multi-product profile design:

1. **No mutable global active/current profile** — the load-bearing rule. Every request/event/job resolves product/profile request-scoped from canonical identity + environment. Concurrent Product A and Product B operations must be impossible to cross-route.
2. **Product credential is product-granularity only, not account isolation** (T16/§2.3). Any stronger account-bound claim requires an account-bound assertion or equivalent verified ownership proof. `/v1/portal` never runs without the assertion.
3. **No caller-supplied provider price authority** — Price resolved server-side from profile `provider_mappings` by `plan_id`.
4. **Environment separation** — test/live mapping isolation; live keys impossible before Owner authorization + boot guard.
5. **Durable webhook intake/outbox** — `processed_events` UNIQUE + `delivery_jobs` outbox in one transaction; `200` only after durable intake AND durable delivery obligation.
6. **Provider re-fetch + amount/currency validation** — webhook/redirect body alone is never authoritative money truth.
7. **No raw sensitive payload/secret logging** — redacted allowlisted audit projection.
8. **R15 pre-data gate** — hub-web must move off the Project A `postgres` owner `DATABASE_URL` before any billing data exists.

**Residual risks (accepted, must be recorded):**
- A Project-A outage also takes billing offline (checkout fails = lost sale, not data loss; CEO accepts).
- The PawSpace ingress holds Project B's service-role key (RLS-bypass across all Project B schemas); blast radius bounded only by the function's grants + fixed `search_path` + validated input. This is the highest-blast-radius single control and must be adversarially tested.
- Two billing systems during BK01 transition means provider-integration defects must be triaged against both implementations.

---

## 4. Failure-case analysis

Covered in full in §2.16 (all 20 required cases). Summary of the highest-risk cases and their non-negotiable controls:
- **#14 payment succeeds but entitlement update fails** — must NOT be solved by trusting the redirect; the paid state is recorded durably and entitlement is retried via the outbox + reconciler.
- **#15 entitlement exists without valid payment** — reconciler must detect and revoke; entitlement alone is never authority.
- **#6 out-of-order** — monotonic transition rules + reconcile-before-regression; never let an older distinct event overwrite newer state.
- **#20 reconciliation drift** — re-fetch provider truth, idempotent correction, operator review for ambiguous cases.
- **#18 card retry failure** — `past_due` blocks entitlements immediately (Phase 0 fix); grace only while `gracePeriodEnd` hasn't passed (fail closed if missing/expired).

---

## 5. BK01 compatibility decision

**Transitional exception + central facade/adapter in front of the existing implementation, with later migration after central proof.** Forced migration is prohibited (Frozen #9). The facade exposes the one central product-facing entry contract while BK01's mature inline integration continues to operate; migration to the central path happens later, only after central proof, and never merges BK01 merchant/customer PromptPay deposit into WSTERA SaaS billing (Frozen #10).

---

## 6. Profile/schema/API/webhook/reconciliation/entitlement/test/admission contracts

All specified in §2.3–§2.13. The contracts are build-usable with the hardening conditions in §8.

---

## 7. Rejected alternatives and why

- **Reject: "no centralization, each product builds its own Stripe integration."** Contradicts the LOCKED owner decision and the owner's stated reason for centralizing (one place to fail = find out immediately). Not re-litigatable.
- **Reject: "force BK01 onto billing-core now."** Prohibited by Frozen #9; would destabilize a mature, working integration for architectural symmetry.
- **Reject: "PromptPay as a second subscription state machine."** Prohibited by Frozen #5; PromptPay is manual/non-auto-renew.
- **Reject: "trust webhook/redirect alone as money truth."** Prohibited by Frozen #6/#7; reconciliation is mandatory.
- **Reject: "a mutable global current_profile/active_product."** The brief's CRITICAL invariant; would make concurrent Product A/B cross-routing possible.
- **Reject: "Billing-as-a-Service productization now."** Non-goal; internal-first only, BaaS is a separately gated future decision (Codex synthesis).

---

## 8. Assumptions

- The `billing_core` schema placement in Project A (D3), the PawSpace Project B ingress (D4), and no-new-project/schema-isolation (D10) remain the placement decisions.
- The `modules-hub` pin `3b6401a28e6f7e69b383277a200fca1986f49ede` remains the vendor source (Phase 0.5 §5).
- Stripe Test Mode is available and PromptPay is exercisable in test mode on the WSTERA Stripe account (Phase 0 preflight must confirm; not yet verified as done).
- Reconciliation cadence default daily, per-product override (product configuration, not a hard-coded constant).
- Refund handling in the internal-first phase is a support-ticket/manual-operator process (no automated refund subsystem).
- The current commercial-mode reality in the brief (BK01/PS01/WS01/LK01 recurring; DC01/MT01/CM01 one-time) is the newer Owner authority and supersedes stale portfolio rows prospectively.

---

## 9. Missing evidence / open questions

- **No Product Billing Profile Registry exists yet** in the canonical evidence. `BILLING_CORE_PLAN.md` and Phase 0.5 define the orchestrator, webhook, auth, and schema access, but NOT a first-class versioned profile registry with migration/rollback and a fail-closed admission gate. This is the primary gap.
- **Stripe Test preflight not yet evidenced as done** (Thailand account PromptPay eligibility, PromptPay in test mode, pinned API version). The brief's build sequence requires it; it is a Phase 0 prerequisite, not yet recorded as complete.
- **R15 pre-data gate** (hub-web off the `postgres` owner `DATABASE_URL`) is a Phase-0.5 later-phase gate, not yet closed.
- **Pawstia Project B admission** (PS-A2 schema-scoping, contract/RLS/grants/denial review, explicit authorization) is still required before the ingress implementation can proceed.
- **Exact reconciliation cadence and PromptPay reminder lead time** are product configuration decisions, not yet set.
- **Final public pricing/packages** for PS01/WS01/LK01/CM01 are downstream Owner decisions.

---

## 10. Genuine Owner decisions only

- Final public pricing/packages for PS01, WS01, LK01, CM01.
- Reconciliation cadence per product (default daily; per-product override).
- PromptPay renewal reminder lead time.
- Refund handling process in the internal-first phase.
- Any paid infrastructure purchase (requires Free-First exception evidence).

---

## 11. Proposed Council verdict

**REMEDIATE**

**Confidence: 78/100**

**Why REMEDIATE, not PASS:** The architecture direction is sound, LOCKED, and evidence-backed, and the multi-product profile registry is a correct extension. But the frozen brief asks for a complete, build-usable contract across 21 output areas, and the canonical evidence does not yet define the **Product Billing Profile Registry** as a first-class versioned object with an explicit migration/rollback rule and a fail-closed admission gate. A PASS would overstate lock-readiness for a Pre-Build/Implementation Gate audit.

**Why REMEDIATE, not BLOCK:** Every gap is a bounded, nameable remediation that does not require re-litigating any frozen Owner decision. There is no blocking contradiction between the brief and the evidence; the gaps are missing specifications, not contradictions.

**Exact contract/evidence gap to close (the remediation):**
1. **Define the Product Billing Profile Registry** as a first-class versioned object (schema in §2.3, lifecycle in §2.4) with an explicit migration/rollback rule and a fail-closed admission gate (§2.13). This is the single most important missing contract.
2. **Record Stripe Test preflight evidence** (Thailand account PromptPay eligibility, PromptPay in test mode, pinned API version) — Phase 0 prerequisite.
3. **Close R15 pre-data gate** (hub-web off the `postgres` owner `DATABASE_URL`) before any billing data exists.
4. **Complete Pawstia Project B admission** (PS-A2) before the ingress implementation proceeds.

**Dissent (honest):** I am not fully confident that the "one Stripe Product maps to one WSTERA Product" rule is optimal for all seven products — in particular, source-sale products (MT01/CM01) may not need a Stripe Product/Price at all if their fulfillment is a one-time checkout or license grant. The profile schema should allow a product to have **no** Stripe recurring mapping (one-time/source-sale), which the current "one Stripe Product per WSTERA Product" framing does not explicitly accommodate. This is a bounded refinement, not a blocker.

**A REMEDIATE verdict does NOT authorize implementation, production deployment, live keys, or live charges.**
