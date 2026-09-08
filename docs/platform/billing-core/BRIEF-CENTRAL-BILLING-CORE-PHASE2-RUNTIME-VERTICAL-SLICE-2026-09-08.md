# BRIEF — Central Billing Core Phase 2 Runtime Vertical Slice

## MODE
**WSTERA HOUSE MAJOR / CENTRAL BILLING CORE / TEST MODE ONLY**

Owner authorizes continuation of the shared Central Billing Core after Profile Registry + Stripe Test provider matrix PASS.

This brief owns only the shared runtime foundation. It must not absorb Product-specific implementation work that belongs to separate Product teams.

## HARD SCOPE BOUNDARIES
- Do **not** touch MT01. Its team is executing a separate market-parity build and must finish first.
- Do **not** migrate or extract BK01 billing in this phase.
- Do **not** implement PromptPay in this phase.
- Do **not** use live Stripe keys, live charges, production deploy, or production billing migration.
- Do **not** silently activate PS01 or LK01 profiles.
- Do **not** rewrite historical evidence documents to make them look current.

## VERIFIED BASELINE
SB01 repo: `D:\AI-Workspace\projects\saas-product-hub\products\stripe-billing`
Current verified SB01 HEAD: `397d0b70c33183ce1986ec7024d7d8e1013a7e6b`
Branch: `master`; upstream divergence: `0/0` at verification.
Pre-existing unrelated `?? docs/` exists in SB01 and must remain untouched unless separately reviewed.

Parent house repo: `D:\AI-Workspace\projects\saas-product-hub`
Current billing evidence checkpoint: `a7754ea docs(billing): record Stripe provider matrix pass`.

Already proven:
- Product Billing Profile Registry foundation.
- exact request-scoped `product_id + environment + profile_version` resolution.
- fail-closed activation guard and rollback target requirement.
- account-bound assertion guard type/validation.
- PS01 + LK01 real Stripe Test Product/Price mappings.
- real Stripe Test subscribe/cancel/resubscribe/provider-refetch lifecycle.
- local multi-profile concurrency/isolation matrix: **16/16 PASS**.
- live activation denied by default.

Current profiles remain:
- PS01: `pending_validation`.
- LK01: `pending_validation`.
- Others: draft/hold according to their dossiers.

Historical Phase 1 evidence remains historical; current truth must use the later provider/concurrency evidence.
## CANONICAL CONTRACTS
Implementation must conform to the accepted Council pack under:
`docs\council-billing-core-multiproduct-2026-09-07\02-architecture-risk\`

Minimum authorities:
- `BILLING-API-CONTRACT.md`
- `WEBHOOK-ROUTING-CONTRACT.md`
- `RECONCILIATION-CONTRACT.md`
- `ENTITLEMENT-ADAPTER-CONTRACT.md`
- `SECURITY-INVARIANTS.md`
- `PRODUCT-BILLING-PROFILE-CONTRACT.md`
- `PROFILE-LIFECYCLE.md`
- `BUILD-SEQUENCE.md`
- `FAILURE-HANDLING-MATRIX.md`
- `OBSERVABILITY-AUDIT.md`
- `ACCEPTANCE-TEST-MATRIX.md`

If existing code conflicts with these contracts, fail closed and record the conflict. Do not silently reinterpret the architecture.

## PHASE 2 OBJECTIVE
Build the first reusable Test-Mode Central Billing runtime vertical slice on top of the Profile Registry:

`Product server -> Core Billing API -> credential/account binding -> exact profile -> provider mapping -> Stripe Test -> durable webhook/outbox -> provider re-fetch/reconcile -> audited entitlement transition`

The phase must prove runtime boundaries without modifying Product-owned business state yet.
## WORK PACKAGE P2-A — Core Billing API + Identity Binding
Implement a narrow reusable API runtime in SB01.

Required routes for this phase:
- `POST /v1/checkout`
- `GET /v1/subscription/status`
- `GET /v1/entitlements`
- `POST /v1/portal`
- `POST /webhooks/stripe`

Every account-scoped route must enforce:
- server-side Product identity derived from credential authority;
- environment bound by credential/deployment, not request body;
- exact active profile/profile version resolution;
- verified account-bound assertion or explicit accepted product-wide read policy;
- authorization and operation/correlation identity;
- server-side plan validation and provider object resolution;
- deterministic idempotency.

Caller must never be authoritative for:
- `product_id`;
- Stripe Product/Price ID;
- amount/currency;
- environment;
- provider customer ID;
- arbitrary success/cancel/portal return URL.

Negative tests must prove each forbidden override fails closed.
## WORK PACKAGE P2-B — Forward-Only Runtime Schema
Do not edit or reinterpret `migrations/0001_billing_core_schema.sql`.

Design a forward-only migration candidate, e.g. `0002_multi_product_billing_runtime.sql`, reviewed before any apply.

It must support at minimum:
- credential/product/environment binding references;
- Product/account <-> provider customer mapping;
- profile/version pinning for billing records;
- billing operations/idempotency records;
- provider subscription/payment object references;
- durable processed-provider-event claim keyed by provider + event id;
- normalized event envelope;
- durable outbox/delivery jobs;
- retry lease/attempt/dead-letter state;
- reconciliation result/state;
- entitlement transition delivery/audit reference;
- correlation IDs and timestamps.

Isolation keys must include environment + product + account wherever account-scoped state exists.

No mutable global current Product/Profile state is allowed in the DB either.

For this phase, migration may be validated against an approved non-production database only. Never apply to production.
## WORK PACKAGE P2-C — Stripe Test Adapter / Checkout Path
Build the shared provider adapter using profile-owned Test mappings only.

Required behavior:
- Stripe Product/Price resolved from the exact Product Billing Profile.
- Only `livemode=false` provider objects are permitted.
- Secret read only from approved runtime environment; never stored in repo or logs.
- Checkout idempotency key derived from environment/product/account/operation/profile.
- Customer mapping must be product/account scoped; never use caller customer id as authority.
- Return destinations selected from server-side allowlisted refs.
- provider response is persisted with correlation/audit references.

Use existing PS01/LK01 Test mappings as fixtures; do not alter Product commercial truth.

Do not claim browser redirect success as payment truth.

## WORK PACKAGE P2-D — Durable Stripe Webhook Intake
Implement the canonical durable pipeline:

`bounded raw body -> Stripe-Signature verify -> parse -> durable claim -> normalized envelope -> outbox -> 2xx`

Rules:
- raw body before JSON parser;
- configured body-size cap;
- signature required and verified;
- duplicate event acknowledged without reapply;
- missing/unknown event identity cannot mutate state;
- 2xx only after durable event claim + retry obligation persist successfully;
- routing metadata is hint only, never final financial authority.
## WORK PACKAGE P2-E — Reconciliation Engine
Every money-dependent transition must re-fetch provider truth before becoming authoritative.

Validate at minimum:
- environment;
- product/account mapping;
- provider customer/subscription/payment object;
- profile version and plan;
- Stripe Product/Price mapping;
- amount and currency;
- billing period;
- current provider status;
- cancellation/refund/payment-failure state.

Required failure coverage:
- missing webhook;
- duplicate/out-of-order webhook;
- wrong Product/account;
- wrong Price/amount/currency;
- stale profile/provider mapping;
- paid but entitlement not delivered;
- entitlement projection without valid payment;
- cancellation/refund/failed renewal;
- temporary provider/runtime outage.

Transitions must be idempotent and monotonic. Older evidence may never overwrite newer provider truth.
## WORK PACKAGE P2-F — Entitlement Delivery Boundary (Core Side Only)
Implement the shared Core-side transition contract without modifying PS01/LK01 Product-owned business state.

Required transition envelope:
- environment;
- product_id;
- account_id;
- profile_version;
- plan/entitlement transition type;
- provider/correlation references;
- transition version/idempotency key;
- issued timestamp/replay window;
- signing-key reference or equivalent authenticated delivery mechanism.

Provide a deterministic test adapter/sink so Core delivery, retry, duplicate suppression and ordering can be proven independently.

Do not create generic Product business fields such as `shop_id`, booking quotas, Pawstia store rules, or LK01 redirect rules inside Billing Core.

Actual PS01 Product entitlement mutation is a later Product-integration gate and requires its own bounded brief.

## WORK PACKAGE P2-G — Audit / Observability
Every checkout, provider event, reconcile decision, delivery attempt, retry, dead-letter and operator requeue must carry a correlation ID.

Audit records must be useful for reconstructing decisions while redacting secrets, raw credentials, full payment data and unnecessary PII.

Log success and failure paths. “No error thrown” is not sufficient evidence of a correct financial transition.
## REQUIRED VERIFICATION — DO NOT TRUST GREEN CODE ALONE
This phase is not complete merely because unit tests/typecheck pass.

Minimum proof must include:
1. static/type/unit verification for every new package;
2. migration/schema validation in an approved non-production DB;
3. real HTTP/runtime tests against the built Core API;
4. negative identity/account spoof attempts through the actual route boundary;
5. real Stripe Test checkout/provider lifecycle using `livemode=false` objects;
6. raw webhook signature verification through the actual HTTP ingress;
7. duplicate webhook delivery with durable no-double-apply proof;
8. out-of-order event sequence followed by provider re-fetch and monotonic result;
9. process/retry interruption proof showing durable outbox survives restart/failure;
10. wrong Price/amount/currency/Product/account reconciliation failures;
11. multi-profile PS01/LK01 isolation regression after runtime integration;
12. cleanup proof showing no unintended active Test subscription/fixture remains.

Where the execution environment cannot prove a required runtime property, mark it `BLOCKED_ENVIRONMENT` or `NOT_PROVEN`; never substitute mocks and call it PASS.

Provider/search eventual-consistency must not be used as authoritative read-after-write evidence. Use direct provider retrieve/list for cleanup and state proof.

## TEST DATA SAFETY
- Test Mode only.
- No real customer PII.
- Use synthetic accounts/customers and Stripe test payment methods.
- No credentials in tracked files, screenshots, evidence, or logs.
- Clean up provider/database fixtures or explicitly record retained non-production fixtures.
## EVIDENCE / ADMISSION REF UPDATE RULE
Create a Phase 2 evidence document under `docs/platform/billing-core/` with exact commands, runtime observations, provider object refs, DB proof and failures.

Only populate Profile Registry admission evidence fields when the corresponding behavior has been proven through the real Phase 2 path.

Eligible after proof:
- `accountBindingEvidenceRef`
- `webhookEvidenceRef`
- `reconciliationEvidenceRef`
- `auditEvidenceRef`

Do **not** populate `entitlementEvidenceRef` from the Core-side test sink. That field requires actual Product-owned entitlement integration proof.

Do not activate PS01/LK01 merely because Phase 2 passes.

## IMPLEMENTATION DISCIPLINE
Reuse existing SB01 modules only after checking their real contract and behavior. Existing `payment`, `subscription`, `webhook-receiver`, and `audit-log` modules are capabilities, not automatic proof that the new shared runtime exists.

Do not copy old Product-specific state machines into the generic Core.

Do not hide missing durability behind in-memory Sets/maps. Durable financial claims/outbox/reconciliation state must use the approved non-production persistence boundary.

Keep provider abstractions narrow enough for future rails, but do not prematurely implement PromptPay or unsupported providers.

Prefer small reviewable commits by work package. Do not mix unrelated house/product dirt into commits.
## DEFINITION OF DONE — PHASE 2
Phase 2 may be declared PASS only when all are true:
- Core API exists and enforces credential-derived Product/environment identity.
- account-bound routes reject missing/invalid/mismatched account assertions.
- provider Price/Product/amount/currency cannot be caller-selected.
- forward-only runtime schema is reviewed and validated non-production.
- Stripe Test checkout path works with canonical PS01/LK01 mappings.
- webhook ingress verifies raw signature and persists durable claim/outbox before 2xx.
- duplicate and out-of-order events do not double-apply/regress state.
- reconciler refetches provider and validates complete expected financial identity.
- Core-side entitlement transition delivery is durable/idempotent/auditable via test sink.
- PS01/LK01 remain isolated after full runtime integration.
- no live money or production mutation occurred.
- evidence document is complete and reproducible.

## STOP / FAIL-CLOSED CONDITIONS
Stop and report rather than work around the architecture if:
- account-binding authority cannot be proven;
- durable DB/outbox is unavailable;
- provider object cannot be reliably mapped to product/account/profile;
- reconciliation cannot verify amount/currency/plan/product/account;
- webhook signature requires losing raw-body integrity;
- a required proof needs live Stripe/production access;
- implementation would require touching MT01 or migrating BK01;
- canonical contract and existing code cannot be reconciled without Owner decision.

No new Council is required for ordinary implementation defects; escalate only a genuine architecture/Owner decision conflict.
## REQUIRED DELIVERABLES
At minimum produce:
- implemented SB01 Phase 2 runtime code;
- reviewed forward migration candidate `0002...sql` or equivalent;
- runtime/config `.env.example` changes without secrets;
- automated negative/runtime tests;
- non-production DB validation evidence;
- Stripe Test provider/runtime evidence;
- `PHASE2-RUNTIME-VERTICAL-SLICE-EVIDENCE-2026-09-08.md`;
- concise handoff identifying remaining PS01 Product-integration work.

## GIT / CHECKPOINT RULES
Before committing:
- inspect `git status` and staged diff;
- preserve unrelated/pre-existing dirt;
- never stage `node_modules`, secrets, runtime relay artifacts, local DB files, test secret material, or unrelated Product work;
- run the relevant verification for that checkpoint;
- make bounded, reviewable commits.

After the final Phase 2 checkpoint:
- verify working tree contains only documented unrelated/pre-existing dirt;
- verify local/upstream divergence;
- push intended SB01 and house evidence commits when clean and justified;
- record exact commit hashes in the evidence/handoff.

## PHASE 2 HARD STOP
On PASS, stop before actual PS01 Product-owned entitlement mutation and before profile activation.

Next phase must be separately authorized as a Product #1 integration/admission slice:
`Central Billing Core -> PS01 signed entitlement adapter -> Pawstia-owned state -> full end-to-end admission proof`.

MT01 remains out of scope until its responsible team completes and returns control.
BK01 remains compatibility-hold. PromptPay remains deferred.

**Target terminal status:** `PHASE 2 PASS — CORE RUNTIME PROVEN IN TEST MODE; PRODUCT ENTITLEMENT INTEGRATION NOT YET AUTHORIZED`.
