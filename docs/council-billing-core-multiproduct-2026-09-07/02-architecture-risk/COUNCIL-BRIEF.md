# FROZEN COUNCIL BRIEF — WSTERA Billing Core Multi-Product Profile Architecture

## Mode and authority
Targeted Decision Mode: Architecture + Risk/Invariant only. This is a Build-to-Sell shared-platform blocker, not a broad re-opening of Payment Council.

Owner is final authority. Hermes is Coordinator/Clerk only. Independent experts are Claude, AGY, Qwen. Codex is independent synthesizer/document author only. No R2 peer review, no Chairman, no Codex expert seat.

## Target question
Should WSTERA adopt `Central Billing Core + Product Billing Profile Registry + shared Stripe/provider path` so every Product uses one server-side billing entry path and a new Product is onboarded by registering a profile, mapping provider objects, defining entitlement integration, passing isolation tests, and activating — instead of building a new Stripe integration per Product?

If yes, produce the exact safe contract. If no, identify the evidence-backed blocker and safer replacement. Do not merely agree with the Owner candidate.

## Canonical evidence — inspect actual files
- `D:\AI-Workspace\projects\saas-product-hub\docs\platform\BILLING_CORE_PLAN.md`
- `D:\AI-Workspace\projects\saas-product-hub\docs\platform\BILLING_CORE_PHASE_0_5_SECURITY_CONTRACTS.md`
- `D:\AI-Workspace\projects\saas-product-hub\docs\strategy\WSTERA-FREE-FIRST-INFRASTRUCTURE-POLICY.md`
- `D:\AI-Workspace\projects\saas-product-hub\docs\strategy\BUILD-TO-SELL-EXECUTION-2026-09-06.md`
- `D:\AI-Workspace\projects\saas-product-hub\docs\council-payment-core-2026-09-01\FINAL-CODEX-SYNTHESIS.md`
- Current Product Build-to-Sell briefs under BK01/DC01/PS01/LK01/WS01/MT01/CM01.

Facts must be separated from assumptions. If provider behavior is material and internet access is available, verify against current official provider documentation rather than memory.
## Frozen Owner decisions — DO NOT re-litigate
1. WSTERA direction is one centralized billing path; Products must not create competing billing/subscription state machines.
2. Stripe is the primary WSTERA payment provider. One Stripe account has Test Mode and Live Mode. Test Mode only is authorized now.
3. Live money, live keys, live charges, production deployment are prohibited until explicit Owner authorization.
4. Stripe Card/Stripe Subscription is the primary automatic recurring rail for subscription Products.
5. PromptPay is manual/user-initiated/non-auto-renew. It must not become a second subscription state machine.
6. Reconciliation is mandatory before payment/entitlement transitions that depend on PromptPay; webhook or browser redirect alone is not authoritative money truth.
7. Reconciliation must re-fetch provider truth and verify product, account/tenant, expected payment/subscription, amount, currency, and apply an idempotent transition.
8. Free-First policy is canonical. Pre-revenue defaults to viable free infrastructure; paid infrastructure requires evidence-backed exception.
9. BK01 is out of scope for forced migration/rewrite solely for architecture symmetry.
10. BK01 SaaS subscription paid to WSTERA and BK01 merchant/customer PromptPay deposit are separate financial domains and must never be merged.
11. DocCraft's document PromptPay QR is a customer payment instruction feature, not WSTERA billing and not payment confirmation.
12. MT01's embedded payment/subscription source modules belong to the buyer's own provider account; selling MT01 itself is a separate WSTERA one-time checkout.
13. Historical evidence remains immutable provenance; newer Owner decisions supersede stale current-state statements prospectively.

## Owner candidate to evaluate
`WSTERA Products -> Central Billing API -> request-scoped canonical product_id -> Product Billing Profile Registry -> Provider Adapter -> Stripe`

CRITICAL: no mutable global `current_profile`/`active_product`. Every request/event/job must resolve product/profile request-scoped from canonical identity and environment. Concurrent Product A and Product B operations must be impossible to cross-route.
## Current commercial-mode reality — newer Owner authority
### Recurring / subscription
- BK01: merchant-paid recurring subscription.
- PS01 Pawstia: merchant-paid recurring subscription; current Founding C2 = first 10 stores, invitation-only, THB 990/month, continuous subscription required. Public package pricing remains downstream evidence.
- WS01 WSM: tenant recurring subscription direction; final packages/pricing/trial unresolved.
- LK01 WSTERA Link: Free + recurring subscription; final public pricing/quota unresolved.

### One-time
- DC01 DocCraft: Free Public Pilot first; later one-time unlock experiment THB 299–599. Subscription is not V1.
- MT01: one-time source product, current direction USD 149–199 single purchase, perpetual use of purchased version + 12 months updates.
- CM01: one-time commercial source/license product; final pricing unresolved.

Do not revive stale portfolio rows as current authority. Record drift explicitly.

## Required Product Billing Profile contract
Define a versioned profile schema that can represent at least:
- canonical `product_id` and stable product code
- billing model(s): `free`, `trial`, `subscription`, `one_time`, `manual_renewal`
- currency and allowed minor-unit rules
- plan/package identifiers and profile-owned commercial policy references
- enabled rails and automatic/manual renewal semantics
- trial/free-tier/grace/retry/dunning behavior references
- entitlement mapping/adapter contract
- refund-policy reference
- profile version, environment, activation/admission status
- provider object mappings by environment

Do not force all Products into the same monetization model.
## Required Stripe Product/Price mapping decision
Define the contract for `WSTERA Product -> Stripe Product -> Stripe Price(s)` including:
- whether one Stripe Product maps to one WSTERA Product or another bounded rule
- Price-per-plan/version strategy and immutable Price lifecycle
- where Stripe Product/Price IDs are stored
- whether provider IDs are config/mapping data versus domain/commercial truth
- price change/version migration behavior
- test vs live provider-object mapping and isolation
- metadata convention and what metadata may never be treated as authority
- exact values Product repos must never hardcode

## Required Billing API contract
At minimum evaluate `POST /checkout`, `GET /subscription/status`, `GET /entitlements`, `POST /portal` or a safer equivalent.
Every request must enforce server-side product identity, account/tenant identity, environment, authorization, idempotency and valid profile/plan.
Prevent wrong product, cross-product, cross-account, caller product spoofing and caller-supplied Stripe Price manipulation.
Resolve return URLs from server-side allowlists. Do not allow arbitrary caller redirect URLs.
Account isolation claims must be backed by account-bound assertions or an equivalent verified ownership mechanism; product credential alone is only product-granularity authority.

## Required Webhook routing contract
Target candidate: one Stripe webhook entry -> signature verify -> durable event claim/outbox -> identify product/account -> provider re-fetch/reconcile -> state transition -> entitlement adapter.
Define product/account provenance, metadata role, provider lookup timing, duplicate/out-of-order behavior, retry ownership, per-account ordering and audit requirements.
Stripe metadata may be a routing hint but must not by itself authorize money truth or entitlement truth.
## Required Reconciliation contract
Design shared reconciliation for Stripe subscription/payment state and manual PromptPay state. It must cover expected amount/currency/product/account/plan/billing period, missing webhook, paid-but-no-entitlement, entitlement-without-valid-payment, refund, cancellation, failed renewal, stale provider state, PromptPay expiry and drift repair.
Browser success redirect is never authoritative state.
Define polling/re-fetch cadence policy, bounded retries/backoff, operator review/dead-letter path and monotonic/out-of-order rules.

## Required Entitlement Adapter boundary
Billing Core must not become owner of Product business state.
Define `Billing Core -> Product Entitlement Adapter -> Product-owned state` for push/pull/snapshot patterns.
Must address signed ingress, local snapshot, TTL/staleness, replay/idempotency, product outage, billing-core outage, recovery, entitlement drift and audit correlation.
Examples:
- PS01 -> Pawstia authoritative subscription lifecycle via narrow signed transition ingress.
- LK01 -> bounded local entitlement snapshot off redirect hot path.
- DC01 -> future one-time unlock/license entitlement while preserving local-first product behavior.
- Source-sale products -> purchase/fulfillment/license/update entitlement, not a fake recurring subscription.

## Required test architecture
Use Stripe Test Mode on the one WSTERA Stripe account as `WSTERA Stripe Sandbox / Billing Test Fixture`.
Do not call it Queueeasy Stripe Fixture. Queueeasy is a separate Shared LINE OA test fixture.
Support deterministic test identity such as `environment=test`, `product_id`, `account_id`, `profile_version`, `test_run_id`.
Require product-specific test customers/products/prices or an equally isolated mapping contract, deterministic cleanup, webhook tests, reconciliation tests, entitlement tests, negative/failure tests and explicit proof Product A cannot modify Product B entitlement.
## New Product admission contract
Evaluate and harden this candidate:
`REGISTER PROFILE -> CREATE/MAP STRIPE PRODUCT -> CREATE/MAP PRICE -> DEFINE ENTITLEMENT ADAPTER -> RUN TEST SUITE -> PASS ISOLATION -> ACTIVATE`.
Add any missing steps required for a fail-closed admission gate. Activation must be impossible if required environment/provider mappings, authorization bindings, reconciliation capability, entitlement contract, tests or audit controls are incomplete.
Profile mutation/version changes must have an explicit migration/rollback rule; runtime must not silently pick a partially-written profile.

## BK01 special case
BK01 already has mature checkout/webhook/portal/DB enforcement/quota/top-up behavior. Forced migration is prohibited.
Council must choose an evidence-backed compatibility path such as transitional exception, central facade/adapter in front of existing implementation, later migration after central proof, or another bounded alternative.
The goal is eventual one central product-facing entry contract without destabilizing BK01.
Do not merge BK01 merchant/customer PromptPay deposit flow into WSTERA SaaS billing.

## Security invariants — MUST be explicit
- live keys impossible before Owner authorization and runtime live-key boot guard
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
## Required failure handling matrix
State exact detection, safe behavior, retry/reconcile responsibility, entitlement effect, audit/alert and recovery owner for at least:
1. Stripe unavailable
2. Billing Core unavailable
3. Product unavailable
4. webhook missing
5. webhook duplicate
6. webhook out-of-order
7. wrong amount
8. wrong currency
9. wrong Product
10. wrong account
11. stale profile
12. stale Stripe Price
13. checkout success but payment fails
14. payment succeeds but entitlement update fails
15. entitlement exists without valid payment
16. refund
17. cancellation
18. card retry failure
19. PromptPay expiry
20. reconciliation finds drift

Do not solve integrity problems by trusting redirects, webhook delivery order, metadata alone, or mutable in-memory profile state.
## Required build-usable Council output
The final synthesis/document pack must explicitly cover all of these, not only an essay:
1. Recommended Architecture
2. Decision rationale
3. Product Billing Profile Schema
4. Profile lifecycle/state model
5. Billing API Contract
6. Stripe Product/Price Mapping Contract
7. Metadata Convention
8. Webhook Routing Contract
9. Reconciliation Contract
10. Entitlement Adapter Contract
11. Test Fixture Contract
12. Test/Live Configuration Model
13. New Product Admission Procedure
14. BK01 Compatibility/Migration Decision
15. Security Invariants
16. Failure Handling Matrix
17. Observability/Audit requirements
18. Build Sequence
19. Acceptance Test Matrix
20. Explicit Non-Goals
21. Open Owner Decisions only where genuinely required

Final Council verdict must be exactly one of `PASS`, `REMEDIATE`, `BLOCK`, with confidence and dissent reported honestly.
## Candidate build sequence to evaluate
Council may change ordering only with evidence. Evaluate:
`Existing Billing decisions -> Freeze architecture inputs -> Multi-Product Profile Contract -> Security/identity contract -> Stripe Test preflight -> Core Billing API -> Webhook durable intake -> Card recurring vertical slice -> Reconciliation -> PromptPay adapter -> Product #1 integration -> Product #2 isolation proof -> New-product admission harness -> Live-readiness gate`.

A Council PASS does not authorize implementation, production deployment, live keys, or live charges.

## Explicit non-goals
Do not authorize or expand into:
- Live Stripe charges/keys or production deployment
- final public pricing or Product pricing mutation
- paid infrastructure purchases without Free-First exception evidence
- Stripe Connect, marketplace payments, merchant-of-record expansion or tax-accounting redesign
- Billing-as-a-Service productization
- rewriting BK01 payment implementation for architectural symmetry
- Product feature expansion
- unrelated Council, Module Hub Scan or generic portfolio work

## Verified source drift / facts experts must account for
- Current `BILLING_CORE_PLAN.md` centralizes billing and already added a thin orchestrator + per-product policy/config direction.
- The same plan still carries stale DocCraft subscription language; current DC01 authority is free Public Pilot then a later one-time unlock experiment.
- The plan historically accepted two billing systems because BK01 was excluded. This run evaluates compatibility/facade convergence without forced migration.
- Phase 0.5 security contracts explicitly state product credential binding alone is not same-product account isolation. Any stronger account-bound claim requires an account assertion or equivalent verified ownership proof.
- Existing webhook contract is transactional outbox/durable delivery, not a presence-only event ledger.
## Expert output contract
Each expert must independently inspect the frozen brief and actual referenced sources before concluding. Do not read another expert's output.

Return a structured report containing:
- Recommendation
- Verified facts and exact evidence paths/source references used
- Proposed contracts for all 21 required output areas where applicable
- Security/risk invariant analysis
- Failure-case analysis including all 20 required cases
- BK01 compatibility decision
- Profile/schema/API/webhook/reconciliation/entitlement/test/admission contracts
- Rejected alternatives and why
- Assumptions
- Missing evidence / open questions
- Genuine Owner decisions only
- Proposed Council verdict: exactly PASS / REMEDIATE / BLOCK
- Confidence 0–100

A `PASS` proposal means the architecture/contracts are sufficiently locked for a later Pre-Build/Implementation Gate audit. It does NOT mean build, live money or production is authorized.
A `REMEDIATE` proposal must name the exact contract/evidence gap to close.
A `BLOCK` proposal must identify the blocking contradiction/risk and why bounded remediation cannot currently close it.