# Independent Expert â€” Independent Expert Report â€” WSTERA Billing Core Multi-Product Profile Architecture

**Council:** Billing Core Multi-Product Profile Architecture (2026-09-07)
**Mode:** Targeted Decision Mode â€” Architecture + Risk/Invariant only
**Expert:** Independent Expert (independent)
**Date:** 2026-09-07
**Scope:** This report inspects the frozen brief and the actual canonical evidence paths named there. No other expert raw answer or Council synthesis was read. The `raw/` directory was empty at inspection time (first expert), so this is fully independent.

---

## 1. Recommendation

**Verdict: PASS (with explicit locked-contract conditions).**

The Owner candidate â€” `WSTERA Products -> Central Billing API -> request-scoped canonical product_id -> Product Billing Profile Registry -> Provider Adapter -> Stripe` â€” is architecturally sound, is consistent with the frozen Owner decisions, and is already substantially pre-specified by the existing canonical `BILLING_CORE_PLAN.md` (v4, LOCKED 2026-08-27) and `BILLING_CORE_PHASE_0_5_SECURITY_CONTRACTS.md` (rev 2, 2026-08-30). The multi-product profile registry and the "no mutable global current_profile/active_product" invariant are the correct generalization of the existing single-product (PawSpace-first) design.

A PASS here means the architecture and contracts are sufficiently locked for a later Pre-Build/Implementation Gate audit. It does **NOT** authorize build, live money, live keys, or production deployment. The brief itself states this, and I hold to it.

**Why PASS rather than REMEDIATE:** The brief's required contracts (profile schema, Stripe mapping, billing API, webhook routing, reconciliation, entitlement adapter, test architecture, admission procedure, BK01 compatibility, security invariants, failure matrix) are all *definable now* from the frozen evidence, and I define them below. There is no evidence-backed blocker that prevents locking the architecture. The gaps that exist are **implementation-phase gates** (already enumerated in the canonical docs as Phase 0/0.5/1 gates), not architecture-lock blockers. REMEDIATE would be appropriate only if a required contract could not be specified; all can be.

**Confidence: 84/100.**

---

## 2. Verified facts and exact evidence paths

### 2.1 Canonical evidence inspected (all read in full)

| Evidence | Path | Key verified facts |
|---|---|---|
| Frozen Council Brief | `docs/council-billing-core-multiproduct-2026-09-07/02-architecture-risk/COUNCIL-BRIEF.md` | 13 frozen Owner decisions; Owner candidate; 21 required output areas; 20 failure cases; non-goals; source-drift notes |
| Billing Core Plan | `docs/platform/BILLING_CORE_PLAN.md` (v4, LOCKED 2026-08-27) | Centralized `billing-core` service; thin host-level orchestrator; Stripe card = recurring rail; PromptPay = manual/non-auto-renew; reconciliation mandatory before PromptPay; PawSpace narrow ingress; transactional outbox webhook; RPO â‰¤ 1h; test-mode-only until go-live; `sk_live_` boot guard; two-billing-systems accepted consequence (BK01 excluded) |
| Phase 0.5 Security Contracts | `docs/platform/BILLING_CORE_PHASE_0_5_SECURITY_CONTRACTS.md` (rev 2, 2026-08-30) | Threat model T1â€“T20; `/v1/*` auth + account-ownership contract; product-wide account reach (not account isolation) without assertion; transactional outbox webhook intake; `billing_core` schema access model; vendor pin `3b6401a`; `scheduled()` contract; R15 pre-data gate |
| Free-First Policy | `docs/strategy/WSTERA-FREE-FIRST-INFRASTRUCTURE-POLICY.md` (CANONICAL, 2026-09-06) | Pre-revenue = FREE FIRST; paid = evidence-backed last resort; provider neutrality; Owner Cost Doctrine (family money) |
| Build-to-Sell Execution | `docs/strategy/BUILD-TO-SELL-EXECUTION-2026-09-06.md` | 7-product execution authority; Free-First authority; product identity from `docs/products/registry.yaml`; Queueeasy shared LINE OA fixture |
| Payment Council Synthesis | `docs/council-payment-core-2026-09-01/FINAL-CODEX-SYNTHESIS.md` | Thin Billing Orchestrator; SubscriptionCore source of truth; Stripe card primary recurring rail; PromptPay manual rail; reconciliation before PromptPay; internal-first then BaaS option gate |
| Product Build-to-Sell briefs | `products/{booking,DocCraft,PawSpace,WSTERA-Link,WSM,multi-tenant-ai,booking-ticket-module}/docs/BUILD-TO-SELL-EXECUTION-2026-09-06.md` | Current commercial-mode reality per product (see Â§2.3) |

### 2.2 Provider facts verified against current official Stripe documentation (2026-09-07)

- **PromptPay is a Thailand government-led instant payment method.** Stripe accounts in Thailand can only accept PromptPay payments in **THB**. (Stripe support: "Stripe accounts in Thailand can only accept PromptPay payments in THB"; Stripe PromptPay docs.)
- **PromptPay is a one-time / manual payment method, not a stored-card recurring rail.** It is user-initiated (customer scans QR in a Thailand bank app); Stripe confirms when the customer completes the payment. It is not designed for automatic recurring collection. This **confirms** the frozen Owner decision #5 (PromptPay = manual/non-auto-renew, must not become a second subscription state machine).
- **Stripe webhook signature verification requires the raw body.** Parsing JSON before verification corrupts the raw body Stripe uses to compute the signature; the correct pattern is `request.text()` (raw) first, then verify `Stripe-Signature`, then parse. This confirms the canonical plan's raw-body-first webhook contract.
- **Stripe webhooks can be delivered out-of-order and duplicated.** Idempotency (event-ID ledger) plus reconciliation is required; delivery order and metadata alone are not authoritative. This confirms the transactional-outbox + reconciler design.

### 2.3 Current commercial-mode reality (from product briefs â€” newer Owner authority)

- **BK01 (booking):** merchant-paid recurring subscription; mature self-contained Stripe integration; **out of scope for forced migration** (Owner decision #9). BK01 merchant/customer PromptPay deposit is a separate financial domain (Owner decision #10).
- **PS01 (Pawstia):** merchant-paid recurring subscription; Founding C2 = first 10 stores, invitation-only, THB 990/month, continuous subscription required; public pricing downstream.
- **WS01 (WSM):** tenant recurring subscription direction; final packages/pricing/trial unresolved.
- **LK01 (WSTERA Link):** Free + recurring subscription; final public pricing/quota unresolved.
- **DC01 (DocCraft):** Free Public Pilot first; later one-time unlock experiment THB 299â€“599; **subscription is NOT V1**.
- **MT01:** one-time source product, USD 149â€“199 single purchase, perpetual use of purchased version + 12 months updates.
- **CM01:** one-time commercial source/license product; final pricing unresolved.

**Drift recorded:** `BILLING_CORE_PLAN.md` still carries stale DocCraft subscription language; current DC01 authority is free Public Pilot then a later one-time unlock experiment. The plan historically accepted two billing systems because BK01 was excluded; this run evaluates compatibility/facade convergence without forced migration. These are recorded as drift, not re-litigated.

---

## 3. Proposed contracts for all 21 required output areas

### 3.1 Recommended Architecture

```
WSTERA Products
   â”‚  (per-product caller credential, request-scoped)
   â–¼
Central Billing API (billing-core Worker, Hono)
   â”‚  request-scoped canonical product_id + account/tenant identity + environment
   â–¼
Product Billing Profile Registry  (billing_core schema, versioned profiles)
   â”‚  resolve profile by (product_id, environment, profile_version)
   â–¼
Provider Adapter (Stripe; PromptPay as manual rail)
   â”‚
   â–¼
Stripe (one account, Test Mode now; Live only after Owner authorization)
```

**Critical invariant (from brief):** NO mutable global `current_profile`/`active_product`. Every request/event/job resolves product/profile request-scoped from canonical identity and environment. Concurrent Product A and Product B operations must be impossible to cross-route. This is satisfied by: (a) per-product caller credentials bound server-side to one product code; (b) request-scoped `product_id` derived from the credential, never from a mutable global; (c) profile resolution keyed by `(product_id, environment, profile_version)`; (d) per-`(product, account_id)` serialization for order-sensitive transitions.

### 3.2 Decision rationale

1. **One server-side billing entry path** eliminates N independent Stripe integrations, each a potential money-correctness defect surface. The canonical plan already documents two real bugs found in the shared `subscription` module (`past_due` not blocking entitlements; hardcoded 30-day periods) that a passing test suite missed â€” evidence that per-product re-implementation multiplies risk.
2. **Profile registry** is the correct abstraction: it lets each product keep its own monetization model (free/trial/subscription/one_time/manual_renewal) without forcing a single model, while sharing the money-correctness spine (idempotency, outbox, reconciliation, audit).
3. **Request-scoped identity** (no mutable global) is the only design that makes concurrent multi-product isolation provable. A global `current_profile` would be a cross-route race by construction.
4. **Stripe as primary provider** is a frozen Owner decision (#2) and is consistent with the existing canonical plan and Payment Council synthesis.
5. **PromptPay as manual rail** (not a second subscription state machine) is confirmed by both the frozen decision (#5) and current Stripe provider behavior (one-time, user-initiated, THB-only).
6. **Reconciliation before PromptPay** is mandatory (decision #7) and is already the canonical plan's locked direction.

### 3.3 Product Billing Profile Schema

Versioned profile schema (JSON document in `billing_core` schema, or normalized columns â€” recommend a versioned JSONB `profile` column plus a `profile_version` integer and immutable history rows). Must represent at least:

```yaml
profile:
  schema_version: 1
  product_id: <canonical product_id from registry.yaml>
  product_code: <stable code>
  billing_models: [free | trial | subscription | one_time | manual_renewal]
  currency: THB | USD | ...
  minor_unit_rule: <Stripe currency exponent; integer minor units; no hardcoded 2dp>
  plans:
    - plan_id, package_ref, price_minor, interval, trial_days, grace_days, retry_policy_ref
  rails:
    enabled: [card_subscription | promptpay_manual | ...]
    auto_renew: true|false   # card=auto; promptpay=manual
  lifecycle_refs:
    trial_ref, free_tier_ref, grace_ref, retry_ref, dunning_ref
  entitlement_adapter:
    adapter_id, ingress_contract_ref, push|pull|snapshot, ttl_seconds
  refund_policy_ref: <ref>
  profile_version: N
  environment: test | live
  activation_status: draft | active | deprecated
  provider_mappings:
    test: { stripe_product_id, stripe_price_ids: {...} }
    live: { stripe_product_id, stripe_price_ids: {...} }
```

**Rules:** profile is immutable once `active`; changes create a new `profile_version` with an explicit migration/rollback rule; runtime must never silently pick a partially-written profile (activation only after all required fields + mappings + tests complete â€” see Â§3.13).

### 3.4 Profile lifecycle / state model

`draft -> pending_validation -> active -> deprecated -> retired`

- `draft`: being authored; not routable.
- `pending_validation`: all required fields present; awaiting admission test suite + isolation proof.
- `active`: routable; only state that serves requests.
- `deprecated`: superseded by a newer `profile_version`; still readable for in-flight reconciliation but not for new checkouts.
- `retired`: no longer routable; retained for audit/reconciliation history.

**Migration/rollback rule:** a profile version change is a new immutable row; the previous `active` version remains the rollback target until the new version has passed admission and a bounded soak. Runtime resolves the exact `profile_version` from the request/event, never a "latest" global. A partially-written profile is never `active`.

### 3.5 Billing API Contract

Evaluate `POST /checkout`, `GET /subscription/status`, `GET /entitlements`, `POST /portal` (or safer equivalent). Locked contract:

| Route | Auth | Ownership | Notes |
|---|---|---|---|
| `POST /v1/checkout` | caller credential + product match | server-derived idempotency key (T13); DB lock before Stripe Customer call; account-bound assertion recommended; return URL from allowlisted config (T11) | Creates/reuses Stripe Customer; subscription-mode Checkout Session |
| `GET /v1/subscriptions/:product/:accountId` | caller credential + product match | `:product` must equal credential's product; cross-product â†’ 403; product-wide read unless account-bound assertion | Serves LK01/DC01 pull model; PawSpace reads its own DB |
| `GET /v1/entitlements/:product/:accountId/:key` | caller credential + product match | same product-wide-read caveat | canUseFeature/getLimit wrapper |
| `POST /v1/portal` | caller credential + product match + **account-bound assertion REQUIRED** | valid Stripe Billing Portal session exposes payment-method/cancel/invoice/subscription actions â€” bearer credential alone insufficient | Short-lived; server-selected allowlisted return URL; rate-limited per credential AND per account |
| `POST /webhooks/stripe` | no caller credential; Stripe signature only | raw-body-first, 64KB cap, signature verify before parse | Only public unauthenticated route |

**Every request enforces:** server-side product identity (from credential), account/tenant identity, environment, authorization, idempotency, valid profile/plan. **Prevents:** wrong product, cross-product, cross-account, caller product spoofing, caller-supplied Stripe Price manipulation (price comes from server-side profile mapping, never caller). **Return URLs** resolve from server-side allowlists only (T11). **Account isolation** claims are backed by account-bound assertions (Â§2.3 of Phase 0.5); product credential alone is product-granularity authority only.

### 3.6 Stripe Product/Price Mapping Contract

- **One Stripe Product maps to one WSTERA Product** (bounded rule). A WSTERA Product may have multiple Stripe Prices (one per plan/version).
- **Price-per-plan/version strategy:** each plan/package maps to an immutable Stripe Price. Price changes create a new Price; the old Price is retained (immutable lifecycle) and the profile's `provider_mappings` is updated to the new Price ID. Never mutate a Price in place.
- **Where IDs are stored:** in the Product Billing Profile Registry (`billing_core` schema), per environment (`test`/`live`), as **config/mapping data** â€” NOT domain/commercial truth.
- **Provider IDs are config/mapping data, not domain/commercial truth.** The canonical plan already states the owner-approved billing configuration is the application source of truth, with no untracked manual Stripe Price provisioning per plan. Stripe Price IDs are referenced, never treated as authoritative commercial policy.
- **Price change/version migration:** profile version bump + new immutable Stripe Price + admission re-test; existing subscriptions continue on their current Price until renewal/change per approved financial policy (proration policy is externalized to the CEO's financial plan â€” not chosen here).
- **Test vs live mapping isolation:** separate `test`/`live` provider_mappings in the profile; live keys impossible before Owner authorization + `sk_live_` boot guard (P-2).
- **Metadata convention:** `metadata.product` + `metadata.account_id` are **routing hints only** â€” never authority for money truth or entitlement truth. An event with no recognized `metadata.product` is audit-logged and answered `200`, never guessed at.
- **Exact values Product repos must never hardcode:** Stripe Product/Price IDs, Stripe Customer IDs, currency exponents, billing intervals, grace/retry/dunning constants, provider secrets. All resolved server-side from the profile registry / config.

### 3.7 Metadata Convention

- `metadata.product` = canonical product_id (routing hint).
- `metadata.account_id` = product's own account/tenant id (routing hint).
- `metadata.profile_version` = profile version at checkout (reconciliation aid).
- **Never authoritative for:** money truth, entitlement truth, amount, currency, plan. All of those are re-fetched from provider truth during reconciliation.
- Unknown/absent `product` metadata â†’ audit-logged `skipped`, `200`, no guess (canonical plan Â§2b).

### 3.8 Webhook Routing Contract

Target candidate (confirmed): `one Stripe webhook entry -> signature verify -> durable event claim/outbox -> identify product/account -> provider re-fetch/reconcile -> state transition -> entitlement adapter`.

Locked contract (from Phase 0.5 Â§4):
1. Read raw body; 64KB cap â†’ 413 if over.
2. Verify `Stripe-Signature` â†’ 401 if invalid.
3. Parse; missing `event.id` â†’ T10 `skipped` (alerted audit row, no state), 200.
4. Read `metadata.product`/`metadata.account_id`; unknown product â†’ `skipped`, 200, no guess.
5. **One transaction:** insert `processed_events` (UNIQUE on stripe_event_id) + `delivery_jobs` outbox row; commit.
6. Duplicate â†’ read status: completed/skipped â†’ `200 {duplicate:true, completed:true}`; pending/processing/retryable-failed â†’ ensure due job, `200 {duplicate:true, completed:false}`; cannot prove durable retry â†’ non-2xx.
7. `200` only after durable intake AND durable delivery obligation.

**Product/account provenance:** from metadata (routing hint) + provider re-fetch (authority). **Metadata role:** routing hint only. **Provider lookup timing:** re-fetch during reconciliation before any money/entitlement transition. **Duplicate/out-of-order:** event-ID ledger (T2) + monotonic transition rules + provider_state_updated_at comparison (T20). **Retry ownership:** delivery worker with exponential backoff + jitter, bounded max_attempts, dead-letter, operator requeue (T19). **Per-account ordering:** per-`(product, account_id)` serialization. **Audit:** every outcome writes one redacted `audit_events` row (T14).

### 3.9 Reconciliation Contract

Shared reconciliation for Stripe subscription/payment state AND manual PromptPay state. Must cover: expected amount/currency/product/account/plan/billing period; missing webhook; paid-but-no-entitlement; entitlement-without-valid-payment; refund; cancellation; failed renewal; stale provider state; PromptPay expiry; drift repair.

- **Browser success redirect is never authoritative state** (brief + canonical plan).
- **Polling/re-fetch cadence:** scheduled reconciler (Cloudflare Cron, every 15 min per canonical plan; daily default per Payment Council, per-product override allowed). Re-fetch provider truth for subscriptions changed in a recent window; compare local state; on drift enqueue correction + alert.
- **Bounded retries/backoff:** exponential backoff with jitter, bounded max_attempts, `next_attempt_at`, worker leases, dead-letter state, alerting, operator-safe requeue.
- **Operator review/dead-letter path:** `failed` state + alert + deliberate operator requeue; no silent infinite retry.
- **Monotonic/out-of-order rules:** compare provider object/version timestamp with current snapshot (`provider_state_updated_at`); define monotonic transition rules; reconcile from Stripe before applying an ambiguous regression; record ignored stale event as `skipped` with reason (T20).

### 3.10 Entitlement Adapter Boundary

Billing Core must NOT own Product business state. Contract: `Billing Core -> Product Entitlement Adapter -> Product-owned state`.

- **Signed ingress:** narrow, timestamped, replay-bounded, per-product signed transition ingress (PawSpace pattern: Project B Edge Function, UUIDv5 idempotency from event ID, fixed search_path, explicit grants).
- **Local snapshot:** bounded local entitlement snapshot off the redirect hot path (LK01 pattern); fail-closed when snapshot missing/expired.
- **TTL/staleness:** documented snapshot/grace boundary; cloud-only premium mutations fail closed after boundary.
- **Replay/idempotency:** deterministic idempotency key (UUIDv5 from event ID); UNIQUE constraint in product's own transaction.
- **Product outage:** entitlement reads fail closed or serve last-known-cached with TTL (per-product decision; LK01 mandates fail-closed).
- **Billing-core outage:** products fail safe; PawSpace reads its own DB (state stops updating, no false grant); LK01/DC01 fail closed on missing/expired snapshot.
- **Recovery:** reconciler replays retained queue + re-fetch before clearing kill switch.
- **Entitlement drift:** reconciler detects and repairs.
- **Audit correlation:** correlation ID across billing-core, ingress, product state.

Per-product examples (from brief):
- **PS01 â†’ Pawstia:** authoritative subscription lifecycle via narrow signed transition ingress (existing `transition_shop_subscription`/`set_shop_commercial_package` RPCs).
- **LK01 â†’** bounded local entitlement snapshot off redirect hot path.
- **DC01 â†’** future one-time unlock/license entitlement while preserving local-first product behavior.
- **Source-sale products (MT01/CM01) â†’** purchase/fulfillment/license/update entitlement, NOT a fake recurring subscription.

### 3.11 Test Fixture Contract

- Use Stripe Test Mode on the one WSTERA Stripe account as **`WSTERA Stripe Sandbox / Billing Test Fixture`** (NOT "Queueeasy Stripe Fixture" â€” Queueeasy is a separate shared LINE OA test fixture).
- Deterministic test identity: `environment=test`, `product_id`, `account_id`, `profile_version`, `test_run_id`.
- Product-specific test customers/products/prices (or equally isolated mapping contract); deterministic cleanup.
- Webhook tests (Stripe CLI `stripe listen`/`stripe trigger`), reconciliation tests, entitlement tests, negative/failure tests.
- **Explicit proof Product A cannot modify Product B entitlement** (isolation test â€” mandatory admission gate).

### 3.12 Test/Live Configuration Model

- One Stripe account, Test Mode and Live Mode (Owner decision #2). Test Mode only authorized now.
- Separate `test`/`live` provider_mappings in each profile.
- Live keys impossible before Owner authorization + `sk_live_` boot guard (P-2): billing-core refuses to boot if `STRIPE_SECRET_KEY` starts with `sk_live_` unless `BILLING_CORE_ALLOW_LIVE=true`.
- Environment- and audience-bound credentials (T18); key IDs carry environment prefix; current/previous overlap time-bounded; prove old/staging rejection after rotation.
- Staging: `billing_core_staging` schema + `billing_core_staging_app` role in Project A (no new project, no Pro/branch DB per Â§10 D10).

### 3.13 New Product Admission Procedure

Harden the candidate: `REGISTER PROFILE -> CREATE/MAP STRIPE PRODUCT -> CREATE/MAP PRICE -> DEFINE ENTITLEMENT ADAPTER -> RUN TEST SUITE -> PASS ISOLATION -> ACTIVATE`.

**Missing steps added for a fail-closed admission gate:**
1. **REGISTER PROFILE** (draft) â€” canonical product_id from `registry.yaml`, billing models, currency, plans, rails, lifecycle refs, entitlement adapter ref, refund policy ref.
2. **AUTHORIZATION BINDINGS** â€” per-product caller credential issued, environment- and audience-bound; account-bound assertion mechanism defined for portal/account routes.
3. **CREATE/MAP STRIPE PRODUCT** (test) â€” one Stripe Product per WSTERA Product.
4. **CREATE/MAP PRICE** (test) â€” immutable Stripe Price per plan/version.
5. **DEFINE ENTITLEMENT ADAPTER** â€” signed ingress or snapshot contract; replay/idempotency; TTL.
6. **RECONCILIATION CAPABILITY** â€” product's expected-payment matching (amount/currency/product/account/plan/billing period) wired into shared reconciler.
7. **RUN TEST SUITE** â€” unit/integration/webhook/reconciliation/entitlement/negative/failure.
8. **PASS ISOLATION** â€” explicit proof Product A cannot modify Product B entitlement; cross-product/cross-account negatives.
9. **AUDIT CONTROLS** â€” redacted audit projection, correlation, retention.
10. **ACTIVATE** â€” only after ALL of the above complete. Activation must be impossible if any required environment/provider mapping, authorization binding, reconciliation capability, entitlement contract, test, or audit control is incomplete.

**Profile mutation/version changes:** explicit migration/rollback rule; runtime must never silently pick a partially-written profile (immutable active profile; new version requires re-admission).

### 3.14 BK01 Compatibility/Migration Decision

**Recommended: transitional exception + central facade/adapter in front of existing implementation, with later migration after central proof.**

- BK01's mature checkout/webhook/portal/DB enforcement/quota/top-up behavior is **out of scope for forced migration** (Owner decision #9). Do not rewrite it for architecture symmetry.
- **Compatibility path:** expose a central facade/adapter in front of BK01's existing implementation so the eventual one central product-facing entry contract is preserved without destabilizing BK01. BK01 continues to operate its own Stripe integration during the transition.
- **Later migration** (after central proof on PS01/LK01/DC01) is a separate, evidence-gated decision â€” not authorized now.
- **Do NOT merge** BK01 merchant/customer PromptPay deposit flow into WSTERA SaaS billing (Owner decision #10). They are separate financial domains.
- **Recorded consequence:** the portfolio runs two billing systems during transition (BK01 inline + billing-core). This is intentional and already accepted in the canonical plan (Â§5d). Any provider-integration defect must be triaged against both.

### 3.15 Security Invariants (MUST be explicit)

- Live keys impossible before Owner authorization + runtime `sk_live_` boot guard.
- No secrets in Product repos (central vault; never committed `.env`).
- Server-side product binding and account/tenant binding.
- No caller-supplied provider price authority.
- Environment separation and test/live mapping isolation.
- Idempotency, replay protection, durable webhook intake/outbox.
- Duplicate and out-of-order event handling.
- Provider re-fetch + amount/currency validation.
- Stripe signature verification and bounded raw body handling (64KB).
- No raw sensitive payload/secret logging; redacted allowlisted audit projection.
- No cross-product or cross-tenant/account access.
- Safe refund/cancel/renewal behavior and auditability.
- No mutable global active/current profile.

### 3.16 Failure Handling Matrix

| # | Failure | Detection | Safe behavior | Retry/reconcile | Entitlement effect | Audit/alert | Recovery owner |
|---|---|---|---|---|---|---|---|
| 1 | Stripe unavailable | outbound error/timeout | checkout hard-fails (lost sale, not data loss); webhook intake still verifies+durably claims | retry with backoff; reconciler re-fetch when Stripe returns | no new grant; existing state unchanged | alert on Stripe outage | billing-core ops |
| 2 | Billing Core unavailable | liveness/readiness probe | products fail safe; PawSpace reads own DB (state stops updating); LK01/DC01 fail closed on missing/expired snapshot | N/A (core down) | no false grant | alert | billing-core ops |
| 3 | Product unavailable | ingress/entitlement call error | delivery job retries with backoff; dead-letter after max_attempts | retry + dead-letter | entitlement update deferred; no false grant | alert on retry exhaustion | product ops + billing-core |
| 4 | Webhook missing | reconciler detects local/provider drift | reconciler re-fetches provider truth and repairs | reconciler re-fetch | repaired by reconciler | alert on drift | billing-core ops |
| 5 | Webhook duplicate | event-ID ledger UNIQUE | `200 {duplicate:true}`; no re-apply | none (already applied) | unchanged | `replay` audit row | none |
| 6 | Webhook out-of-order | provider_state_updated_at comparison | monotonic transition rules; reconcile before ambiguous regression; stale â†’ `skipped` | reconciler re-fetch | no regression | `skipped` audit row | billing-core ops |
| 7 | Wrong amount | reconciliation amount match | reject transition; alert; no entitlement grant | reconciler re-fetch | no grant | alert | billing-core ops |
| 8 | Wrong currency | reconciliation currency match | reject transition; alert | reconciler re-fetch | no grant | alert | billing-core ops |
| 9 | Wrong Product | metadata.product + credential binding | unknown/absent product â†’ `skipped`, 200, no guess; cross-product â†’ 403 | none | no grant | `skipped`/403 audit | billing-core ops |
| 10 | Wrong account | account-bound assertion / credential binding | reject; no cross-account access | none | no grant | alert | billing-core ops |
| 11 | Stale profile | profile_version check | resolve exact version; never "latest" global; partially-written never active | re-resolve | no grant on stale | audit | billing-core ops |
| 12 | Stale Stripe Price | provider re-fetch + price mapping | use server-side profile mapping; never caller-supplied price | reconciler re-fetch | no grant on mismatch | alert | billing-core ops |
| 13 | Checkout success but payment fails | webhook `invoice.payment_failed` / reconciler | no entitlement grant; grace/retry per policy | retry + reconciler | no grant | alert | billing-core ops |
| 14 | Payment succeeds but entitlement update fails | delivery job failure | retry with backoff; dead-letter; reconciler repair | retry + reconciler | deferred; repaired | alert on retry exhaustion | billing-core + product ops |
| 15 | Entitlement exists without valid payment | reconciler detects | revoke/deny entitlement; alert | reconciler | revoke | alert | billing-core ops |
| 16 | Refund | Stripe refund event / reconciler | safe refund handling; audit; entitlement effect per policy | reconciler | per refund policy | audit | billing-core ops |
| 17 | Cancellation | Stripe cancel event / reconciler | safe cancel; entitlement ends per policy | reconciler | entitlement ends | audit | billing-core ops |
| 18 | Card retry failure | `invoice.payment_failed` | grace/retry/dunning per policy; fail closed after grace | retry + reconciler | no grant after grace | alert | billing-core ops |
| 19 | PromptPay expiry | reconciler / expiry check | no grant; notify; per policy (graceâ†’downgrade or end paid) | reconciler | no grant | alert | billing-core ops |
| 20 | Reconciliation finds drift | reconciler | enqueue correction + alert; operator review | reconciler | repaired | alert | billing-core ops |

**Do not solve integrity problems by trusting redirects, webhook delivery order, metadata alone, or mutable in-memory profile state.**

### 3.17 Observability/Audit Requirements

- Every webhook outcome (verified/replay/invalid-signature/routed/skipped/RPC-rejected/retry/failed) durably recorded with Stripe event ID, correlation ID, product, pseudonymized account reference, attempt, latency, redacted result.
- Separate liveness and readiness probes; dependency probes with strict timeouts, never exposing credentials/customer data/raw provider errors.
- Alert on: invalid-signature bursts, unexpected RPC rejections, queue age/retry exhaustion, reconciliation drift, failed sweeps, Stripe webhook delivery failures.
- Dashboards: intake rate, duplicate rate, processing lag, transition success/error rate, reconciliation drift, entitlement snapshot age by product/environment.
- Weekly manual check during rollout: Stripe Dashboard webhook delivery success rate 100%, endpoint not disabled.
- Retention/partitioning/archival authority defined for `processed_events`, `delivery_jobs`, `audit_events` before production volume.

### 3.18 Build Sequence

Evaluate the candidate sequence. **Recommendation: adopt as-is** (it matches the canonical plan's money-correctness order and the Payment Council's Phase 0-6 mapping):

`Existing Billing decisions -> Freeze architecture inputs -> Multi-Product Profile Contract -> Security/identity contract -> Stripe Test preflight -> Core Billing API -> Webhook durable intake -> Card recurring vertical slice -> Reconciliation -> PromptPay adapter -> Product #1 integration -> Product #2 isolation proof -> New-product admission harness -> Live-readiness gate`

**No change to ordering is required.** The canonical plan already maps this to Phase 0/0.5/1+ gates. Reconciliation before PromptPay is preserved (decision #7). Product #1 = PS01 (Pawstia, has the narrow ingress + Phase 13 RPCs ready). Product #2 isolation proof = the mandatory multi-product isolation evidence.

### 3.19 Acceptance Test Matrix

- Unit: module bug-fix tests (`past_due` blocks, `grace_period` respects end time, monthly/annual period math incl. leap-year/month-overflow).
- Integration: repository/mapping/integration tests; transactional outbox; idempotency ledger.
- Real Stripe test-mode E2E (Stripe CLI): subscribe/renew/webhook/dunning/retry/lifecycle; one Customer per account (no dupes on retry); correct interval/price; webhook delivery 100%.
- Adversarial/negative: replayed webhook idempotency incl. non-consecutive `Aâ†’Bâ†’A` and cancelled-then-replay-old-event; concurrent duplicate delivery (apply once); tampered/expired ingress signature; wrong product/account binding; oversized body; out-of-order events; concurrent-checkout race; queue retry exhaustion; webhook-to-Stripe reconciliation.
- Reconciliation: missing webhook, paid-not-credited, credited-not-paid, wrong amount/currency, PromptPay expiry, drift repair.
- Entitlement: signed ingress, local snapshot TTL/staleness, replay/idempotency, product outage, billing-core outage, recovery, drift.
- Isolation: **explicit proof Product A cannot modify Product B entitlement**; cross-product/cross-account negatives.
- Security: `supabase db advisors --type security` clean; RLS/grants/denial; `sk_live_` boot guard; no elevated key in billing-core.

### 3.20 Explicit Non-Goals

- Live Stripe charges/keys or production deployment.
- Final public pricing or Product pricing mutation.
- Paid infrastructure purchases without Free-First exception evidence.
- Stripe Connect, marketplace payments, merchant-of-record expansion, tax-accounting redesign.
- Billing-as-a-Service productization.
- Rewriting BK01 payment implementation for architecture symmetry.
- Product feature expansion.
- Unrelated Council, Module Hub Scan, or generic portfolio work.

### 3.21 Open Owner Decisions (only where genuinely required)

1. **BK01 central facade vs. later migration timing** â€” the compatibility path is recommended (facade now, migration later after central proof), but the *timing* of any eventual BK01 migration is an Owner decision, not an architecture-lock blocker.
2. **Reconciliation cadence per product** â€” default daily (Payment Council) / 15-min cron (canonical plan); per-product override is config, but the default cadence for the first product is an Owner/ops decision.
3. **Refund/cancel/renewal financial policy** â€” externalized to the CEO's financial plan (canonical plan Â§5d); not chosen here.
4. **Product #1 admission order** â€” PS01 is the natural first (narrow ingress + Phase 13 RPCs ready), but the Owner confirms which product is admitted first.

These are genuine Owner decisions only where they affect commercial/financial policy or timing; none blocks locking the architecture.

---

## 4. Security/risk invariant analysis

The Phase 0.5 security contracts (T1â€“T20) are the strongest part of the existing evidence and directly satisfy the brief's security invariants. Key confirmations:

- **Product credential binding alone is NOT same-product account isolation** (T16, Â§2.3). Any stronger account-bound claim requires an account-bound assertion. This is already the canonical position and the brief's source-drift note confirms it. The billing API contract (Â§3.5) enforces this: `/v1/portal` requires the assertion; account-reading GET routes are product-wide unless asserted.
- **No mutable global active/current profile** is the brief's critical invariant and is fully consistent with the request-scoped design. It is a *new* explicit invariant for this multi-product run (the single-product plan didn't need it), and it is correctly stated.
- **T7 pre-data gate (R15):** hub-web's runtime must move off the Project A `postgres` owner `DATABASE_URL` to a scoped `hub_web_app` role before any billing data exists. This is a hard gate, not an accepted residual.
- **Live-key guard:** `sk_live_` boot guard + `BILLING_CORE_ALLOW_LIVE` is a startup assertion, not a comment.
- **No elevated key in billing-core:** billing-core never holds Project A or Project B service-role keys; the PawSpace ingress (Project B Edge Function) is the only elevated-key holder, with fixed `search_path` + explicit grants bounding it to the `pawspace` schema.

**Residual risks (accepted, not blockers):** a Project-A outage takes billing offline (lost sale, not data loss â€” CEO-accepted); a billing-core Worker compromise yields test Stripe key + billing schema + bounded PawSpace transitions (not tenant data); the two-billing-systems transition (BK01 + billing-core) requires dual triage.

---

## 5. Failure-case analysis

All 20 required cases are covered in the matrix (Â§3.16). The design does not solve integrity problems by trusting redirects, webhook delivery order, metadata alone, or mutable in-memory profile state. The two most dangerous cases â€” **webhook out-of-order** (T20) and **entitlement-without-valid-payment** (case 15) â€” are both handled by the reconciler re-fetching provider truth and applying monotonic transition rules, not by trusting delivery order or metadata.

---

## 6. BK01 compatibility decision

See Â§3.14. **Transitional exception + central facade/adapter, later migration after central proof.** No forced migration; no merge of BK01 merchant/customer PromptPay deposit into WSTERA SaaS billing.

---

## 7. Profile/schema/API/webhook/reconciliation/entitlement/test/admission contracts

All defined in Â§3.3â€“Â§3.13. These are build-usable and consistent with the frozen evidence.

---

## 8. Rejected alternatives and why

1. **Per-product independent Stripe integration (status quo for non-BK01):** rejected â€” multiplies money-correctness defect surface; the canonical plan already found two real shared-module bugs a passing suite missed. Centralization is a frozen Owner decision (#1).
2. **Mutable global `current_profile`/`active_product`:** rejected â€” cross-route race by construction; violates the brief's critical invariant.
3. **PromptPay as a second subscription state machine:** rejected â€” frozen decision (#5) + current Stripe provider behavior (one-time, user-initiated, THB-only, not auto-recurring).
4. **Forced BK01 migration for architecture symmetry:** rejected â€” frozen decision (#9); would destabilize a mature, working integration.
5. **Billing-as-a-Service productization now:** rejected â€” non-goal; internal-first then separately gated BaaS option (Payment Council).
6. **Trusting webhook delivery order / metadata / redirect as money truth:** rejected â€” integrity must come from provider re-fetch + reconciliation + idempotency ledger.
7. **A second Supabase project / Pro / branch DB for billing:** rejected â€” Free-First policy + Â§10 D10 (no new project, no Pro until revenue funds it); schema isolation in Project A instead.

---

## 9. Assumptions

1. **Stripe account is Thailand-based / PromptPay-eligible** â€” the canonical plan's Phase 0 preflight must verify this (P-2). Not yet verified as fact; it is a preflight gate.
2. **Stripe API version is pinned** before adapter/E2E evidence is accepted (P-2). Assumed to be done in Phase 0.
3. **The `billing_core_staging` schema + preview Worker** will be stood up in Phase 0 (P-1 condition 4). It does not exist yet â€” this is a Phase 0 scope item, not an assumption to build against.
4. **Pawstia completes its PS-A2 schema-scoping + Project B admission** before the ingress implementation gate. Currently blocked on that (Phase 0.5 Â§7.2).
5. **`modules-hub` pin `3b6401a`** remains the vendored source (Phase 0.5 Â§5). Assumed stable.
6. **Provider facts** (PromptPay THB-only, one-time/manual, raw-body webhook verification, out-of-order/duplicate delivery) are current as of 2026-09-07 per official Stripe docs; re-verify at implementation time.

---

## 10. Missing evidence / open questions

1. **Stripe Thailand account PromptPay eligibility** â€” not yet verified; Phase 0 preflight gate.
2. **`billing_core_staging` environment** â€” does not exist yet; Phase 0 scope.
3. **Pawstia Project B admission** â€” pending PS-A2 evidence + explicit authorization; blocks ingress implementation.
4. **hub-web R15 pre-data gate** â€” hub-web runtime still on Project A `postgres` owner URL; must move to scoped `hub_web_app` role before any billing data exists.
5. **Reconciliation cadence default** for the first product â€” Owner/ops decision.
6. **Refund/cancel/renewal financial policy** â€” externalized to CEO's financial plan; not yet locked here.

None of these blocks locking the architecture; all are implementation-phase gates already enumerated in the canonical docs.

---

## 11. Genuine Owner decisions only

1. BK01 eventual migration timing (facade now; migration later after central proof).
2. Reconciliation cadence default for first product.
3. Refund/cancel/renewal financial policy (CEO's financial plan).
4. Product #1 admission order (PS01 recommended).

---

## 12. Proposed Council verdict

**PASS** (with the locked-contract conditions in Â§3 and the implementation-phase gates in Â§10).

- A PASS means the architecture/contracts are sufficiently locked for a later Pre-Build/Implementation Gate audit.
- It does **NOT** authorize build, live money, live keys, or production deployment.
- The Owner candidate is confirmed as the correct architecture, with the profile registry and request-scoped identity invariants as specified.

**Confidence: 84/100.**

**Dissent / honest caveats:** The 16-point confidence gap is driven by (a) unverified Stripe Thailand PromptPay eligibility (preflight gate), (b) the not-yet-existing staging environment, (c) the pending Pawstia Project B admission, and (d) the R15 pre-data gate not yet closed. These are all implementation-phase gates, not architecture-lock blockers â€” hence PASS, not REMEDIATE. If any of these were found to be architecturally unresolvable (e.g., Stripe Thailand PromptPay not available on the selected account), the verdict would drop to REMEDIATE with that specific evidence gap named.

---

*End of Independent Expert independent expert report. Written to the mandated raw path only; no source, canonical doc, git state, or other Council file was modified.*

