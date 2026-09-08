# QWEN — Independent Expert Report — WSTERA Billing Core Multi-Product Profile Architecture

**Expert:** Qwen (agent-qwen)
**Mode:** Targeted Decision Mode — Architecture + Risk/Invariant only
**Date:** 2026-09-07
**Authority:** Owner (คุณฟรี) is final authority. Hermes is Coordinator/Clerk. This is an independent expert seat; I did not read any other expert raw answer or Council synthesis.

---

## 1. Recommendation

**ADOPT the Owner candidate** — `WSTERA Products -> Central Billing API -> request-scoped canonical product_id -> Product Billing Profile Registry -> Provider Adapter -> Stripe` — **with the hardening conditions below**, and propose a **REMEDIATE** Council verdict.

The architecture is sound, is already substantially locked by prior Owner decisions and the existing `BILLING_CORE_PLAN.md` / Phase 0.5 security contracts, and is the correct convergence target. However, the frozen brief asks for a **multi-product profile registry** and a **new-product admission gate** that the existing canonical documents do **not yet fully specify**. Those are the exact contract gaps that must be closed before a later Pre-Build/Implementation Gate audit can pass. The architecture itself is not blocked; the missing contracts are bounded and closable, hence REMEDIATE rather than PASS or BLOCK.

**Confidence: 84/100.**

---

## 2. Verified facts and exact evidence paths used

I inspected the following actual files (not doc-trust):

1. `docs/council-billing-core-multiproduct-2026-09-07/02-architecture-risk/COUNCIL-BRIEF.md` — the frozen brief (read completely).
2. `docs/platform/BILLING_CORE_PLAN.md` — canonical centralized billing plan, rev 4 (2026-08-27) + 2026-09-01 payment-rail/orchestrator addendum. LOCKED.
3. `docs/platform/BILLING_CORE_PHASE_0_5_SECURITY_CONTRACTS.md` — rev 2 (2026-08-30), the reviewed security contract Phase 1 builds against.
4. `docs/strategy/WSTERA-FREE-FIRST-INFRASTRUCTURE-POLICY.md` — canonical Owner policy, LOCKED 2026-09-06.
5. `docs/strategy/BUILD-TO-SELL-EXECUTION-2026-09-06.md` — current execution authority.
6. `docs/council-payment-core-2026-09-01/FINAL-CODEX-SYNTHESIS.md` — prior Payment Council synthesis (architecture + build order).
7. Current Product Build-to-Sell briefs under BK01/DC01/PS01/LK01/WS01/MT01/CM01 (all read).

### Verified facts (grounded in the above)

- **F1 — Centralization is already locked.** `BILLING_CORE_PLAN.md` Context: "one centralized billing service — not each product independently copying Stripe integration modules"; centralization "is not up for re-litigation." The 2026-09-01 addendum adds a "thin host-level billing orchestrator" for product policy, provider normalization and scheduled coordination. The Owner candidate is consistent with this locked direction.
- **F2 — Stripe is the primary recurring rail; PromptPay is manual/non-auto-renew.** Locked in the plan addendum and the brief (Frozen decisions 4, 5). PromptPay "must not become a second subscription state machine."
- **F3 — Reconciliation is mandatory before PromptPay-dependent transitions.** Plan addendum + Phase 0.5 payment-rail inheritance: "webhook/redirect body alone is insufficient authority"; must re-fetch provider truth and verify product/account/amount/currency.
- **F4 — Test Mode only is authorized now; live keys prohibited until explicit Owner authorization.** Plan P-2: live keys must not exist in any local `.env` or Worker secret until go-live; billing-core refuses to boot on `sk_live_` unless `BILLING_CORE_ALLOW_LIVE=true` (startup assertion in `src/lib/config.ts`).
- **F5 — Product credential binding is product-granularity only, NOT account isolation.** Phase 0.5 §2.3 explicitly: "a leaked PawSpace credential can submit or query every known or guessed PawSpace shop ID"; "product-wide account reach." Account-bound assertion required for `/v1/portal`; product-wide-read acceptance required for GET routes. This directly contradicts the plan's stronger "caller-supplied account ID it does not own" phrasing, and the reconciliation is documented in Phase 0.5.
- **F6 — Durable webhook intake is a transactional outbox, not a presence-only ledger.** Phase 0.5 §4: `processed_events` (UNIQUE on Stripe event ID + status) + `delivery_jobs` outbox created in one transaction; `200` only after durable intake AND durable delivery obligation.
- **F7 — Provider event ID is mandatory.** Plan §2e + Phase 0 carry-forward: an event without `evt_...` ID is audit-logged and dropped, never processed.
- **F8 — No mutable global active/current profile.** Brief CRITICAL: "no mutable global `current_profile`/`active_product`"; every request/event/job resolves product/profile request-scoped. This is a NEW requirement not yet in the canonical plan (the plan uses per-product config but does not yet specify the request-scoped profile registry).
- **F9 — Free-First policy is canonical.** `WSTERA-FREE-FIRST-INFRASTRUCTURE-POLICY.md`: pre-revenue defaults to free; paid infrastructure requires evidence-backed exception; "Future-proofing" is not a cost trigger. The billing-core plan already respects this (no new Supabase project, no Pro, schema isolation only — §10 D10).
- **F10 — BK01 is out of scope for forced migration.** Plan Context + §5d: booking's inline Stripe integration is "explicitly out of scope — not touched, not migrated"; the portfolio will run two billing systems permanently. Brief Frozen decision 9 + BK01 special case.
- **F11 — BK01 merchant/customer PromptPay deposit and WSTERA SaaS billing are separate financial domains.** Brief Frozen decision 10; must never be merged.
- **F12 — DC01 is free Public Pilot first, then a later one-time unlock experiment; subscription is NOT V1.** Brief current-commercial-mode reality + DC01 brief. The plan still carries stale DocCraft subscription language (brief "Verified source drift").
- **F13 — MT01/CM01 are one-time source products; their embedded payment/subscription modules belong to the buyer's own provider account.** Brief Frozen decisions 12, 13 + MT01/CM01 briefs. Selling MT01/CM01 is a separate WSTERA one-time checkout.
- **F14 — Phase 0.5 is reviewed and settled; the draft schema migration and apply runbook exist but nothing is applied.** Phase 0.5 §7.1: design contracts settled; `0001_billing_core_schema.sql` + `APPLY-RUNBOOK.md` are DRAFT, nothing applied. R15 pre-data gate (hub-web owner URL) is a later-phase gate.
- **F15 — Pawstia ingress implementation is blocked until Pawstia is admitted to Project B** (PS-A2 schema-scoping, contract/RLS/grants/denial review + explicit authorization). Phase 0.5 §7.2.
- **F16 — The plan's build order and the Payment Council's 10-phase order agree on money-correctness-first.** Reconciliation before PromptPay release; card recurring E2E before reconciliation; multi-product proof before production cutover.

### Assumptions (not verified from the evidence)

- **A1 — Provider behavior.** I did not re-verify current Stripe PromptPay/Test-Mode behavior against live official docs in this run (no internet verification performed). The plan pins an explicit Stripe API version and requires a Thailand-account/PromptPay-eligibility preflight (P-2) as Phase 0 scope. I treat Stripe's exact PromptPay event/QR/expiry semantics as an open preflight item, not a settled fact.
- **A2 — The `billing_core` schema migration content.** I did not read `docs/platform/billing-core/migrations/0001_billing_core_schema.sql` (it is a DRAFT and not in the brief's canonical list). My profile-schema proposal below is a contract, not a claim about the existing draft.
- **A3 — No product currently has a billing profile registry or admission harness.** The brief's Required Product Billing Profile contract and New Product admission contract are not present in the canonical plan; I assume they are net-new deliverables this Council must lock.

---

## 3. Proposed contracts for all 21 required output areas

### 3.1 Recommended Architecture

Adopt the Owner candidate with the request-scoped identity spine:

```
WSTERA Products
  -> Central Billing API (/v1/*)  [server-side product_id + account/tenant binding + env + authz + idempotency]
  -> Product Billing Profile Registry  [versioned, request-scoped resolution; NO mutable global current_profile]
  -> Provider Adapter  [Stripe primary recurring; PromptPay manual rail]
  -> Stripe  [Test Mode only now]
```

Plus the durable webhook intake (transactional outbox) and the scheduled reconciler as the correctness spine, and the per-product Entitlement Adapter boundary so Billing Core never owns Product business state.

### 3.2 Decision rationale

- Centralization is already Owner-locked (F1); the candidate is the faithful expression of that decision.
- One server-side billing entry path removes per-product Stripe integration duplication and gives one place to fail loudly (the Owner's stated reason for centralizing).
- The request-scoped profile registry (F8) is the correct mechanism to make concurrent Product A / Product B operations impossible to cross-route — it is the missing piece the brief correctly demands.
- The existing Phase 0.5 security contracts already cover the hard security spine (webhook, outbox, account-ownership, credential binding, SSRF, idempotency). The candidate does not weaken them.
- Free-First (F9) is respected: no new paid infrastructure is implied; the plan already avoids new Supabase projects/Pro.

### 3.3 Product Billing Profile Schema

A versioned profile record, stored in `billing_core` config (not caller-supplied), keyed by canonical `product_id` + `profile_version` + `environment`. Minimum fields (mapping to the brief's Required contract):

- `product_id` (canonical) + stable `product_code`
- `billing_model`: one of `free | trial | subscription | one_time | manual_renewal`
- `currency` + `allowed_minor_units` (validated against Stripe currency exponent; never hardcoded 2dp)
- `plan/package` identifiers + `commercial_policy_ref` (profile-owned reference to the Owner-approved financial config; the profile does NOT define monetary values)
- `enabled_rails` + `automatic/manual_renewal_semantics` (e.g. card=auto, PromptPay=manual)
- `trial/free_tier/grace/retry/dunning` behavior references
- `entitlement_adapter` contract reference (which adapter, push/pull/snapshot)
- `refund_policy_ref`
- `profile_version`, `environment`, `activation/admission_status`
- `provider_object_mappings` by environment (Stripe Product/Price IDs per env)

**Rule:** a profile is immutable once activated; changes are new versions with an explicit migration/rollback rule. Runtime must never silently pick a partially-written profile — resolution reads a fully-committed version only.

### 3.4 Profile lifecycle / state model

States: `draft -> review -> active -> deprecated -> retired`, plus `admission_pending` (before all admission gates pass). Activation is impossible unless all required environment/provider mappings, authorization bindings, reconciliation capability, entitlement contract, tests and audit controls are complete (fail-closed admission). Version changes follow expand/contract; a partially-written profile is never resolvable.

### 3.5 Billing API Contract

Evaluate the brief's minimum set and harden:

- `POST /v1/checkout` — server-derived idempotency key (T13), DB lock before Stripe Customer call, return URL from allowlisted per-product/per-env config (T11), product match from credential, account-bound assertion recommended.
- `GET /v1/subscriptions/:product/:accountId` — product must equal credential's product (else 403); product-wide-read acceptance required without account-bound assertion.
- `GET /v1/entitlements/:product/:accountId/:key` — same product-wide-read caveat.
- `POST /v1/portal` — **account-bound assertion REQUIRED** (Phase 0.5 §2.2); short-lived session, allowlisted return URL, rate-limited per credential AND per account.

Every request enforces: server-side product identity, account/tenant identity, environment, authorization, idempotency, valid profile/plan. Prevent wrong-product, cross-product, cross-account, caller product spoofing, and caller-supplied Stripe Price manipulation (price is resolved server-side from the profile, never from the caller). Return URLs resolve from server-side allowlists only.

### 3.6 Stripe Product/Price Mapping Contract

- **One Stripe Product maps to one WSTERA Product** (bounded rule; no shared Stripe Product across WSTERA products).
- **Price-per-plan/version** with immutable Price lifecycle: a plan/version change creates a new Price; old Prices are archived, never mutated.
- **Stripe Product/Price IDs are stored in the profile's `provider_object_mappings`** (config/mapping data), NOT in Product repos and NOT treated as domain/commercial truth.
- **Provider IDs are config/mapping data, not domain/commercial truth.** The profile's plan/package + commercial policy ref is the domain truth; Stripe IDs are the provider-side projection.
- **Price change/version migration:** new Price + profile version bump; reconciliation re-fetches provider truth; no silent mutation of a live Price.
- **Test vs live mapping isolation:** separate mapping sets per environment; test/live never cross.
- **Metadata convention:** metadata is a routing hint only, never authority for money truth or entitlement truth (brief + Phase 0.5).
- **Exact values Product repos must never hardcode:** Stripe Product/Price IDs, currency minor-unit exponents, billing intervals, grace/retry/dunning constants, provider API versions, and any monetary value. These come from the profile + Owner-approved config.

### 3.7 Metadata Convention

`metadata.product` + `metadata.account_id` are routing hints for webhook/event routing. An event with no recognized `metadata.product` is audit-logged and answered `200`, never guessed at (plan §2b). Metadata must never by itself authorize money truth or entitlement truth; reconciliation re-fetches provider truth and verifies product/account/amount/currency before any transition.

### 3.8 Webhook Routing Contract

Adopt the Phase 0.5 transactional outbox contract verbatim:

`one Stripe webhook entry -> signature verify (raw-body-first, 64KB cap) -> durable event claim/outbox (processed_events + delivery_jobs in one transaction) -> identify product/account (metadata routing hint) -> provider re-fetch/reconcile -> state transition -> entitlement adapter`

- Product/account provenance: from metadata routing hint + provider re-fetch; never metadata alone.
- Duplicate/out-of-order: UNIQUE on event ID (replay) + T20 monotonic transition rules (out-of-order distinct events).
- Retry ownership: delivery worker with bounded backoff, `max_attempts`, dead-letter, operator requeue.
- Per-`(product, account_id)` serialization where transitions are order-sensitive.
- Audit: redacted allowlisted projection per outcome.

### 3.9 Reconciliation Contract

Shared reconciliation for Stripe subscription/payment state AND manual PromptPay state. Must cover: expected amount/currency/product/account/plan/billing period, missing webhook, paid-but-no-entitlement, entitlement-without-valid-payment, refund, cancellation, failed renewal, stale provider state, PromptPay expiry, drift repair. Browser success redirect is never authoritative state.

- Polling/re-fetch cadence: daily default, per-product override (Payment Council consensus).
- Bounded retries/backoff with jitter; operator review/dead-letter path.
- Monotonic/out-of-order rules: compare provider object/version timestamp with `provider_state_updated_at`; reconcile from Stripe before applying an ambiguous regression; record ignored stale event as `skipped` with reason.

### 3.10 Entitlement Adapter Boundary

Billing Core must NOT own Product business state. Define `Billing Core -> Product Entitlement Adapter -> Product-owned state` for push/pull/snapshot patterns. Must address: signed ingress, local snapshot, TTL/staleness, replay/idempotency, product outage, billing-core outage, recovery, entitlement drift, audit correlation.

- **PS01 -> Pawstia:** narrow signed transition ingress (Project B Edge Function) calling `transition_shop_subscription`/`set_shop_commercial_package` RPCs; idempotency UUID = UUIDv5(fixed namespace, event ID).
- **LK01 -> bounded local entitlement snapshot** off the redirect hot path; fail-closed when snapshot missing/expired.
- **DC01 -> future one-time unlock/license entitlement** preserving local-first product behavior.
- **Source-sale products (MT01/CM01) -> purchase/fulfillment/license/update entitlement**, NOT a fake recurring subscription.

### 3.11 Test Fixture Contract

Use Stripe Test Mode on the one WSTERA Stripe account as `WSTERA Stripe Sandbox / Billing Test Fixture` (NOT "Queueeasy Stripe Fixture" — Queueeasy is the separate shared LINE OA fixture). Support deterministic test identity: `environment=test`, `product_id`, `account_id`, `profile_version`, `test_run_id`. Require product-specific test customers/products/prices or an equally isolated mapping contract, deterministic cleanup, webhook tests, reconciliation tests, entitlement tests, negative/failure tests, and explicit proof Product A cannot modify Product B entitlement.

### 3.12 Test/Live Configuration Model

Separate config per environment (local/staging/production). Test-mode keys only until go-live. Live-key boot guard (`sk_live_` refusal unless `BILLING_CORE_ALLOW_LIVE=true`). Test/live provider-object mapping isolation. No secrets in Product repos; real values in the central vault, never committed.

### 3.13 New Product Admission Procedure

Harden the candidate:

`REGISTER PROFILE -> CREATE/MAP STRIPE PRODUCT -> CREATE/MAP PRICE -> DEFINE ENTITLEMENT ADAPTER -> RUN TEST SUITE -> PASS ISOLATION -> ACTIVATE`

Add missing fail-closed steps:
- **Authorization binding** (per-product `/v1` credential issued, environment/audience-bound).
- **Reconciliation capability** proven (reconciler can re-fetch and verify this product's state).
- **Audit controls** present.
- **Isolation proof** (Product A cannot modify Product B entitlement) as a hard gate.
- **Profile version migration/rollback rule** defined before activation.

Activation must be impossible if any of these is incomplete. Runtime must not silently pick a partially-written profile.

### 3.14 BK01 Compatibility/Migration Decision

**Transitional exception + central facade/adapter in front of the existing implementation.** BK01's mature checkout/webhook/portal/DB enforcement/quota/top-up behavior stays untouched (F10). The goal is eventual one central product-facing entry contract without destabilizing BK01. Do NOT merge BK01 merchant/customer PromptPay deposit flow into WSTERA SaaS billing (F11). The plan already records the permanent two-billing-systems reality; this Council should lock the facade convergence path as the compatibility decision.

### 3.15 Security Invariants

All from the brief + Phase 0.5, MUST be explicit:
- live keys impossible before Owner authorization + runtime live-key boot guard
- no secrets in Product repos
- server-side product binding and account/tenant binding
- no caller-supplied provider price authority
- environment separation and test/live mapping isolation
- idempotency, replay protection, durable webhook intake/outbox
- duplicate and out-of-order event handling
- provider re-fetch + amount/currency validation
- Stripe signature verification and bounded raw body handling
- no raw sensitive payload/secret logging; redacted allowlisted audit projection
- no cross-product or cross-tenant/account access
- safe refund/cancel/renewal behavior and auditability
- no mutable global active/current profile

### 3.16 Failure Handling Matrix

| # | Failure | Detection | Safe behavior | Retry/reconcile | Entitlement effect | Audit/alert | Recovery owner |
|---|---|---|---|---|---|---|---|
| 1 | Stripe unavailable | outbound error/timeout | checkout hard-fails (lost sale, not data loss); webhook intake still verifies+durably claims | bounded retry/backoff; reconciler re-fetches when back | no new entitlement granted; existing snapshot TTL governs | alert on Stripe outage | billing-core ops |
| 2 | Billing Core unavailable | liveness/readiness probes | products fail safe: PawSpace reads own DB (state stops updating); LK01/DC01 fail-closed or TTL snapshot | reconciler resumes on recovery | no silent grant of paid features | alert | billing-core ops |
| 3 | Product unavailable | ingress/entitlement call fails | delivery job retries with backoff; dead-letter after max_attempts | delivery worker + reconciler | entitlement update deferred; no double-apply (idempotent) | alert on retry exhaustion | product owner + billing ops |
| 4 | webhook missing | reconciler drift | reconciler re-fetches provider truth and repairs | reconciler | repaired via reconciliation | alert on drift | billing-core ops |
| 5 | webhook duplicate | UNIQUE on event ID | `200 {duplicate:true}`; no re-apply | none (already durable) | unchanged | replay audit row | — |
| 6 | webhook out-of-order | T20 timestamp compare | reconcile from Stripe before ambiguous regression; record stale as `skipped` | reconciler | monotonic transition only | skipped audit row | billing-core ops |
| 7 | wrong amount | reconciliation amount match | reject transition; no entitlement | reconciler + operator review | no entitlement | alert | operator |
| 8 | wrong currency | currency exponent validation | reject transition | reconciler | no entitlement | alert | operator |
| 9 | wrong Product | metadata.product + credential binding | audit-log, `200`, no guess | — | no transition | skipped audit row | billing-core ops |
| 10 | wrong account | account-bound assertion / product-wide acceptance | reject; no cross-account action | — | no transition | alert | security/ops |
| 11 | stale profile | profile version check | resolve only fully-committed version; fail closed | profile migration/rollback rule | no silent partial profile | alert | billing-core ops |
| 12 | stale Stripe Price | reconciler price compare | re-fetch; new Price via version migration | reconciler | no silent mutation | alert | billing-core ops |
| 13 | checkout success but payment fails | Stripe payment_failed event | grace_period with explicit end; no entitlement | retry/dunning | no entitlement until paid | audit | billing-core ops |
| 14 | payment succeeds but entitlement update fails | delivery job failure | retry with backoff; dead-letter; reconciler | delivery worker + reconciler | entitlement deferred; no double-apply | alert | product owner + billing ops |
| 15 | entitlement exists without valid payment | reconciler | revoke/downgrade per policy | reconciler | entitlement removed | alert | billing-core ops |
| 16 | refund | Stripe refund event | manual/operator process (internal-first); no automated refund subsystem | operator | entitlement adjusted per policy | audit | operator |
| 17 | cancellation | Stripe cancel event | cancel_at_period_end / cancelled; no silent reactivation of suspended | reconciler | entitlement ends per policy | audit | billing-core ops |
| 18 | card retry failure | payment_failed | grace + dunning; then downgrade/expire per policy | retry/dunning + reconciler | no entitlement after grace | alert | billing-core ops |
| 19 | PromptPay expiry | QR expiry / inquiry | notify before/after expiry; grace then downgrade to Free or end paid entitlement (per product Free-tier presence) | reconciler re-fetch | no entitlement after expiry | alert | billing-core ops |
| 20 | reconciliation finds drift | reconciler | enqueue correction + alert; operator review | reconciler + operator | repaired via reconciliation | alert | billing-core ops |

### 3.17 Observability / Audit requirements

- Every webhook outcome durably recorded (verified/replay/invalid-signature/routed/skipped/RPC-rejected) with event ID, correlation ID, product, account ref, attempt, latency, redacted result.
- Separate liveness/readiness probes; dependency probes with strict timeouts, never exposing credentials/customer data/raw provider errors.
- Alert on: invalid-signature bursts, unexpected RPC rejections, queue age/retry exhaustion, reconciliation drift, failed sweeps, Stripe webhook delivery failures.
- Dashboards: intake rate, duplicate rate, processing lag, transition success/error rate, reconciliation drift, entitlement snapshot age by product/environment.
- Weekly manual check: Stripe Dashboard webhook delivery success rate 100%, endpoint not disabled.
- Redacted allowlisted audit projection only (T14); no raw sensitive payload/secret logging.

### 3.18 Build Sequence

Evaluate the candidate sequence and confirm it is consistent with the plan + Payment Council order. I endorse the candidate order with the money-correctness-first emphasis already locked:

`Existing Billing decisions -> Freeze architecture inputs -> Multi-Product Profile Contract -> Security/identity contract -> Stripe Test preflight -> Core Billing API -> Webhook durable intake -> Card recurring vertical slice -> Reconciliation -> PromptPay adapter -> Product #1 integration -> Product #2 isolation proof -> New-product admission harness -> Live-readiness gate`

This matches the plan's Phase 0/0.5/1+ gates and the Payment Council's 10-phase order (reconciliation before PromptPay release; card recurring before reconciliation; multi-product proof before production cutover). No reordering needed.

### 3.19 Acceptance Test Matrix

- Unit: module bug-fix tests (past_due blocks, grace_period end, monthly/annual period math incl. leap-year/month-overflow).
- Integration: repository/mapping/integration tests.
- Real Stripe test-mode E2E (Stripe CLI `stripe listen`/`stripe trigger ...`).
- Adversarial/negative: replayed webhook idempotency incl. non-consecutive A→B→A and cancelled-then-replay-old-event; concurrent duplicate delivery; tampered/expired ingress signature; wrong product/account binding; oversized body; out-of-order events; concurrent-checkout race; queue retry exhaustion; webhook-to-Stripe reconciliation; live grace-period-boundary sweep.
- Isolation: explicit proof Product A cannot modify Product B entitlement.
- Security: `supabase db advisors --type security` clean; denial tests for `hub_web_app`/`billing_core_app`; Data-API exposed-list verification.

### 3.20 Explicit Non-Goals

- Live Stripe charges/keys or production deployment
- final public pricing or Product pricing mutation
- paid infrastructure purchases without Free-First exception evidence
- Stripe Connect, marketplace payments, merchant-of-record expansion, tax-accounting redesign
- Billing-as-a-Service productization
- rewriting BK01 payment implementation for architecture symmetry
- Product feature expansion
- unrelated Council, Module Hub Scan or generic portfolio work

### 3.21 Open Owner Decisions (only where genuinely required)

- Final public pricing/packages for PS01, WS01, LK01, CM01 (all remain downstream evidence; not a billing-architecture blocker).
- DC01 one-time unlock price range (THB 299–599) — downstream experiment, not V1.
- MT01/CM01 final pricing — downstream.
- Whether the account-bound assertion mechanism is adopted for GET routes beyond `/v1/portal` (recommended; requires per-product product-wide-read acceptance until then).

---

## 4. Security / risk invariant analysis

The Phase 0.5 security contracts are the strongest part of the evidence and are already settled. Key invariants I verified are sound:

- **Product credential binding is product-granularity only** (F5). This is the single most important security fact in the brief. Any claim of account isolation must be backed by an account-bound assertion or equivalent verified ownership mechanism. The plan's stronger "caller-supplied account ID it does not own" phrasing is superseded by Phase 0.5's reconciliation. **This must be carried into the multi-product profile contract** — the profile registry must not imply account isolation it does not provide.
- **No mutable global current_profile** (F8) is the correct invariant for multi-product concurrency. The profile registry must resolve request-scoped from canonical identity + environment.
- **Durable outbox** (F6) and **mandatory event ID** (F7) are the correctness spine; they must not be weakened by the multi-product profile layer.
- **Live-key boot guard** (F4) is a hard invariant; the multi-product admission gate must not bypass it.
- **Free-First** (F9) constrains any paid-infrastructure proposal; the profile registry and admission harness must not imply new paid infra.

## 5. Failure-case analysis

Covered in the 20-row matrix in §3.16. The two highest-risk cases for the multi-product profile architecture specifically are **#9 wrong Product** (mitigated by credential binding + metadata routing hint + no-guess rule) and **#11 stale profile** (mitigated by immutable-version resolution + fail-closed on partial writes). Both are closable with the profile contract.

## 6. BK01 compatibility decision

**Transitional exception + central facade/adapter in front of the existing implementation** (§3.14). No forced migration. This is the evidence-backed path consistent with F10/F11 and the plan's permanent two-billing-systems reality.

## 7. Rejected alternatives and why

- **Reject: "each Product builds its own Stripe integration."** Contradicts the locked centralization decision (F1) and the Owner's stated reason for centralizing (one place to fail loudly).
- **Reject: "force BK01 onto billing-core now."** Prohibited (F10); would destabilize a mature, working implementation for architecture symmetry.
- **Reject: "PromptPay as a second subscription state machine."** Prohibited (F2); PromptPay is manual/non-auto-renew.
- **Reject: "merge BK01 merchant/customer PromptPay deposit into WSTERA SaaS billing."** Prohibited (F11); separate financial domains.
- **Reject: "treat metadata as money/entitlement truth."** Contradicts Phase 0.5 and the brief; metadata is a routing hint only.
- **Reject: "a mutable global active/current profile."** Explicitly prohibited by the brief CRITICAL; would make cross-routing possible.

## 8. Assumptions

- A1 (Stripe PromptPay/Test-Mode behavior not re-verified against live docs this run; preflight is Phase 0 scope).
- A2 (did not read the draft `0001_billing_core_schema.sql`; my profile schema is a contract, not a claim about the draft).
- A3 (no product currently has a profile registry or admission harness; these are net-new deliverables).

## 9. Missing evidence / open questions

- **The multi-product profile registry schema and admission harness are not yet specified in any canonical document.** This is the primary gap this Council must close.
- **The account-bound assertion mechanism** is designed for `/v1/portal` but its adoption for GET routes is an open decision.
- **Stripe PromptPay preflight evidence** (Thailand-account eligibility, test-mode PromptPay, API version pin) is Phase 0 scope, not yet produced.
- **Pawstia Project B admission** (PS-A2) is an unblock condition for the ingress implementation.
- **R15 pre-data gate** (hub-web owner URL removal) is a later-phase gate, not yet closed.

## 10. Genuine Owner decisions only

- Whether to adopt the account-bound assertion for GET routes beyond `/v1/portal` (recommended).
- Final public pricing/packages for PS01/WS01/LK01/CM01 (downstream, not a billing-architecture blocker).
- DC01 one-time unlock price range (downstream experiment).

## 11. Proposed Council verdict

**REMEDIATE**

**Confidence: 84/100.**

**Rationale:** The architecture is sound, already substantially locked, and consistent with all prior Owner decisions and the Phase 0.5 security contracts. It is NOT blocked — there is no contradiction that bounded remediation cannot close. But it is not yet a PASS because the brief's two net-new requirements — the **Product Billing Profile Registry** (request-scoped, versioned, no mutable global profile) and the **New Product Admission harness** (fail-closed gate) — are not yet specified in any canonical document. A PASS would mean the contracts are sufficiently locked for a later Pre-Build/Implementation Gate audit; they are not, until those two contracts are written and reconciled with the existing plan.

**Exact gaps to close for REMEDIATE:**
1. Write the **Product Billing Profile Schema + lifecycle/state model** (§3.3–3.4) into a canonical document, with the request-scoped resolution invariant (no mutable global current_profile) and immutable-version/partial-write fail-closed rule.
2. Write the **New Product Admission Procedure** (§3.13) as a fail-closed gate, adding authorization binding, reconciliation capability, audit controls, isolation proof, and profile migration/rollback rule to the candidate.
3. Reconcile the plan's "caller-supplied account ID it does not own" phrasing with Phase 0.5's product-wide-account-reach reality in the multi-product context (F5).
4. Record the **BK01 compatibility decision** (transitional exception + central facade) as a locked decision, not just a plan note.
5. Confirm the profile registry and admission harness introduce **no new paid infrastructure** (Free-First compliance).

A REMEDIATE does NOT authorize implementation, production deployment, live keys, or live charges.

---

*End of Qwen independent expert report. I inspected only the frozen brief and the canonical evidence paths named therein; I did not read any other expert raw answer or Council synthesis.*
