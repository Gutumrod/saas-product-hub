# PRE-BUILD BRIEF — WSTERA Central Billing Core

**Date:** 2026-09-08
**Mode:** WSTERA HOUSE MAJOR / BUILD-TO-SELL / PRE-BUILD ONLY
**Status:** READY AS EXECUTION PLAN, NOT YET IMPLEMENTATION AUTHORIZATION

## Objective
Build one shared WSTERA Billing Core so Product teams stop creating separate Stripe integrations and separate subscription/payment state machines.

Target operating model:

`Product -> Central Billing API -> request-scoped identity -> Product Billing Profile -> Provider Adapter -> Stripe -> Reconciliation -> Entitlement Adapter -> Product-owned state`

A new Product should normally be onboarded by registering a versioned Billing Profile, mapping provider objects, defining entitlement integration, passing Test Mode/isolation gates, then activating — not by building another payment stack.

## Owner-locked strategy
1. Central Billing Core is the long-term common path.
2. Stripe is the primary provider; Test Mode only is currently authorized.
3. No mutable global `current_profile` / `active_product`.
4. Every request/event/job resolves Product/Profile request-scoped from canonical identity + environment.
5. Stripe/provider identifiers are server-owned mapping data, not caller authority or Product commercial truth.
6. Billing Core owns verified financial/billing state; Product owns Product-specific business entitlement state.
7. BK01 is **Compatibility-First Extraction**: preserve now, facade later, extract capability-by-capability after parity proof.
8. BK01 merchant/customer PromptPay deposits remain a separate financial domain.
## Capability baseline from BK01
The shared Core must at minimum preserve the proven capability class already visible in BK01:
- authenticated server-side checkout creation
- server-side plan -> Stripe Price resolution
- Stripe Customer Portal
- signed raw-body webhook verification
- durable/idempotent event claim
- provider re-fetch for material state changes
- duplicate and out-of-order protection
- recurring subscription lifecycle handling
- atomic handoff into Product-owned entitlement state

Do **not** copy BK01 assumptions into the Core. BK01-specific `shop_id`, `shop_users`, Basic/Pro names, `shops.subscription_status`, Booking acceptance policy and monthly-only assumptions stay behind BK01 boundaries.

## Phase 0 — Architecture closure / contract freeze
Before code starts, final Council synthesis must lock:
- Product Billing Profile schema + lifecycle
- Billing API contract
- Stripe Product/Price mapping contract
- webhook routing + durable intake/outbox contract
- reconciliation contract
- entitlement adapter contract
- Test Mode fixture contract
- New Product Admission procedure
- BK01 Compatibility-First migration contract
- failure matrix + security invariants

Exit: Council verdict is final and explicit Owner build authorization exists. A Council PASS alone is not build authorization.
## Phase 1 — Core identity + Product Billing Profile Registry
Build the shared foundation first:
- canonical `product_id` / stable product code
- account/tenant-bound authorization assertion or equivalent verified ownership proof
- environment (`test` / future `live`) as explicit request context
- immutable active profile versions; edits create a new version
- lifecycle such as `draft -> pending_validation -> active -> deprecated -> retired`
- fail closed on missing, partial, inactive or stale profile
- deterministic request-scoped resolver; no process-global Product/Profile state
- server-side allowlisted return URLs

Acceptance:
- concurrent Product A/B requests never cross-resolve
- caller cannot spoof Product or account
- caller cannot choose Stripe Product/Price directly
- profile version can be audited and reproduced for every payment operation

## Phase 2 — Shared Stripe Provider Adapter
Implement shared Test Mode provider plumbing:
- Stripe client lives only in shared server-side boundary
- per-environment Product/Price mappings
- shared Checkout creation
- shared Customer Portal creation where the billing model supports it
- server resolves plan/package -> provider Price from active profile
- metadata is correlation/routing hint only
- no Product repo stores Stripe secret keys

Use BK01 Checkout/Portal behavior as capability reference, not as a runtime dependency.
## Phase 3 — Durable webhook + reconciliation core
One central Stripe webhook path:
1. read raw body
2. verify Stripe signature
3. durable event claim / idempotency
4. resolve Product/account provenance
5. provider re-fetch for authoritative current truth
6. validate expected Product/account/amount/currency/plan/subscription
7. apply monotonic/idempotent financial transition
8. enqueue durable entitlement delivery
9. audit result and reconciliation correlation

Required recovery behavior:
- duplicate webhook -> acknowledge without duplicate state change
- missing webhook -> scheduled reconciliation repairs drift
- out-of-order webhook -> stale state cannot overwrite newer provider truth
- provider unavailable -> retry/backoff; no optimistic entitlement
- payment succeeds but entitlement delivery fails -> durable retry/dead-letter/alert
- entitlement exists without valid payment -> reconciliation detects and invokes Product policy for downgrade/revoke

This phase must meet or exceed the capability class already proven in BK01 while being multi-Product and Product-agnostic.

## Phase 4 — Entitlement Adapter framework
Define a narrow shared interface:

`Verified Billing State -> Product Entitlement Adapter -> Product-owned state`

Rules:
- Core never writes arbitrary Product business tables directly.
- Every delivery is signed/authenticated, idempotent and audit-correlated.
- Product outage does not lose a paid transition; delivery remains durable/retryable.
- Product business rules remain local: e.g. BK01 decides what canceled/past_due means for accepting bookings.
## Phase 5 — First recurring vertical slice: PS01
Use PS01/Pawstia as the first native shared-Core recurring Product because its current Founding C2 direction is concrete: invitation-only first 10 stores, THB 990/month, continuous subscription required.

Test Mode only:
- register PS01 Billing Profile
- create/map PS01 Stripe Test Product/Price
- wire authenticated checkout
- process signed webhook through shared path
- provider re-fetch/reconcile
- deliver verified entitlement transition into Pawstia adapter
- prove cancel/past_due/retry behavior without live money

No final public pricing expansion is implied beyond already approved current Product authority.

## Phase 6 — Cross-product isolation proof + admission harness
Create deterministic Product A/Product B Test Mode fixtures and prove:
- same-time checkout cannot cross-route
- webhook for Product A cannot mutate Product B financial or entitlement state
- account A cannot open portal/status for account B
- stale/wrong profile and wrong Price fail closed
- profile activation is impossible until auth binding, provider mapping, reconciliation, entitlement adapter, tests and audit controls pass

Package these checks into the New Product Admission harness so every future Product runs the same gate.

## Phase 7 — Additional billing models
After recurring flow is stable, add bounded shared models as demanded by sale priority:
- `one_time` for MT01 / CM01 and later DC01 unlock when commercially authorized
- `free` / Free-to-Paid transition for Products such as LK01
- manual/user-initiated PromptPay adapter only as a separate rail with mandatory reconciliation; never a second subscription state machine
## Phase 8 — BK01 compatibility facade
Do not rewrite BK01. Integrate it in layers:
1. register a BK01 Billing Profile representing its approved WSTERA SaaS subscription contract
2. bind BK01 identity/account semantics into the shared API contract
3. central API delegates BK01 operations to the existing BK01 billing implementation
4. run parity/shadow checks against BK01 current provider/subscription truth
5. prove failures/rollback before replacing any existing capability

BK01 merchant/customer PromptPay deposit processing remains completely outside this facade.

## Phase 9 — BK01 capability extraction
Only after Core parity is proven, replace one capability at a time:
- shared Checkout/Price mapping
- shared Customer Portal session creation
- central webhook routing/durable intake
- shared provider re-fetch/reconciliation

For each extraction:
- baseline existing BK01 behavior
- run Test Mode parity tests
- preserve a rollback route
- switch only one capability boundary at a time
- verify no Booking entitlement/business-rule regression

End state: BK01 uses the same Billing Core pattern as other Products, while `BK01 Entitlement Adapter` remains the boundary to Booking-owned business state.
## Phase 10 — Live-readiness gate
Before any live authorization, independently verify:
- Test Mode recurring + one-time flows as applicable
- webhook signature/idempotency/out-of-order/missing-event recovery
- reconciliation drift repair
- cross-product + cross-account isolation
- profile migration/rollback
- entitlement delivery outage/retry recovery
- secret/key boundary and live-key boot guard
- audit/observability and operator recovery path
- Product admission gate evidence
- BK01 compatibility has no merchant/customer PromptPay domain crossover

Live remains prohibited until a separate Owner authorization.

## Definition of Done for shared Core before BK01 extraction
The Core is not extraction-ready merely because checkout works. Minimum proof:
- at least one native recurring Product works end-to-end in Stripe Test Mode
- multi-Product isolation suite passes
- provider re-fetch/reconciliation is operational
- durable entitlement delivery/retry is proven
- active Profile versions are immutable and auditable
- New Product Admission gate fails closed
- rollback strategy is tested
- shared Core capability matrix is equal to or stronger than the BK01 capability being replaced

## Explicitly prohibited in this build path
- Live Stripe keys or live charges
- Production payment deployment without later Owner authorization
- big-bang BK01 billing rewrite
- merging BK01 customer deposits into WSTERA SaaS billing
- Product-controlled Stripe Price IDs or secrets
- mutable global Product/Profile selection
- final public pricing invention
- Stripe Connect / MoR / marketplace/tax expansion
- paid infrastructure without Free-First exception evidence
## Immediate next action after Council closure
If final synthesis closes Architecture/Risk and Owner explicitly authorizes build, the first implementation brief is **Phase 1 only**:

`Product Billing Profile Registry + request-scoped resolver + identity/account/environment guards + immutable profile lifecycle + negative isolation tests`.

Do not start Stripe checkout code first. The shared identity/profile boundary must exist first so later Checkout, Webhook and Reconciliation cannot accidentally inherit BK01's single-Product assumptions.

## Handoff rule
Every phase must leave:
- code/tests/docs aligned
- test evidence recorded
- no unrelated repo changes
- explicit gate verdict
- rollback note where money/entitlement state is affected

Stop at the phase boundary on failure. Do not expand scope to unrelated Product work, Module Hub Scan, another Council, or production/live payment work.
