# WSTERA Central Billing — Canonical System Map

**Date:** 2026-09-09 (Asia/Bangkok)
**Owner:** WSTERA HOUSE
**Runtime implementation:** SB01 / `Gutumrod/stripe-billing`
**Status:** `INTERNAL CENTRAL BILLING CORE / PHASE 2 IN PROGRESS`

## 1. One system, four roles

WSTERA has one SaaS billing architecture, not separate Billing systems per Product.

```text
WSTERA HOUSE
  -> owns architecture, contracts, profiles, gates and acceptance
SB01 Central Billing Runtime
  -> executes checkout/provider/webhook/reconciliation billing mechanics
Product Billing Profiles
  -> define each Product's commercial/provider/entitlement contract
Control Plane
  -> consumes authoritative Billing Core read projections; no payment mutation
```

BK01 billing remains temporarily authoritative for BK01 only under Compatibility-First Extraction. It is a capability/parity source and future migration target, not a permanent competing architecture.
## 2. Canonical request path

```text
Product server
  -> Central Billing API
  -> authenticated Product/account context
  -> Product Billing Profile Registry
  -> billing operation policy
  -> provider adapter
  -> Stripe Test/Live according to explicit environment/profile mapping
```

Asynchronous truth path:

```text
Stripe event
  -> signature verification
  -> durable event claim
  -> outbox/retry
  -> provider re-fetch
  -> reconciliation
  -> billing state transition
  -> Product Entitlement Adapter
  -> Product-owned business state
```

Provider truth must never be replaced by browser redirects, caller-supplied metadata, or Control Plane state.
## 3. Product Billing Profile model

One hardened Core serves multiple Products through versioned Product Billing Profiles.

Current profile states:
- PS01 Pawstia PMS — `pending_validation`
- LK01 WSTERA Link — `pending_validation`
- WS01 — `draft`
- DC01 — `draft`
- MT01 — `draft`
- CM01 — `draft`
- BK01 — `compatibility_hold`

A profile is Core-owned configuration/domain contract data. Products and callers must not supply Stripe Product IDs, Price IDs, amounts, currency, environment authority, or active profile version.

Activated profile versions are immutable. Material changes require a new profile version and an explicit rollback target.

## 4. Control Plane integration boundary

`hub-web/server/control-plane/adapters/billing-core-adapter.ts` is a downstream consumer contract only.

Control may read authoritative Billing Core projections for Product/account subscription and payment state. It currently enforces `canExecutePaymentActions: false` and must remain fail-closed until an approved Core read transport exists.
Control Plane must not duplicate checkout, portal, webhook, reconciliation, provider mapping, entitlement transition, or subscription state-machine logic.

The Core must eventually expose a read contract sufficient to populate Control's current projection fields, including:
- Product identity and account identity
- plan/profile version
- subscription status and period/cancel state
- amount/currency
- provider-updated time
- payment status, amount, currency and provider reference
- connection/environment/readiness state

## 5. BK01 Compatibility-First Extraction

BK01 is preserved while the Core is immature. The migration target is:
1. Preserve current BK01 billing authority.
2. Register a BK01 Product Billing Profile without changing customer money flow.
3. Add a central product-facing facade compatible with the common Billing API.
4. Run parity/shadow proof against BK01 identity, mapping, provider truth, reconciliation, entitlement and failure behavior.
5. Extract checkout/portal, webhook routing, reconciliation and provider mapping one capability at a time after parity + rollback proof.
6. Keep Booking-specific entitlement semantics behind a BK01 Entitlement Adapter.
7. Retire duplicated BK01 SaaS-billing plumbing only after evidence passes.

BK01 merchant/customer PromptPay deposits remain a separate Booking business-payment domain and are not part of WSTERA SaaS subscription billing.
## 6. Evidence already earned

Current evidence is useful but does not activate any profile:
- Profile Registry + deterministic multi-profile tests: `16/16 PASS`
- PS01/LK01 same-account cross-Product isolation: PASS
- cross-Product spoof: fail-closed
- Stripe Test provider lifecycle for mixed PS01/LK01: PASS
- subscribe / cancel / re-subscribe / selective cancel / provider re-fetch / cleanup: PASS

Remaining Phase 2 gates include runtime compile, LAB DB contract, HTTP integration, durable webhook intake, duplicate/out-of-order handling, reconciliation repair, entitlement delivery, audit, rollback and negative caller-authority proof.

## 7. Productization policy

SB01 is currently internal WSTERA infrastructure. Do not expand Phase 2 for external customers, public API keys, metering, SDKs, tenancy productization or commercial packaging.

Potential future productization is explicitly preserved as an option only after WSTERA proves that multiple Products can onboard through profiles/adapters without Core rewrites and BK01 can converge through compatibility-first extraction.

## 8. Canonical references

- `docs/council-billing-core-multiproduct-2026-09-07/02-architecture-risk/ARCHITECTURE.md`
- `docs/council-billing-core-multiproduct-2026-09-07/02-architecture-risk/PRODUCT-BILLING-PROFILE-CONTRACT.md`
- `docs/council-billing-core-multiproduct-2026-09-07/OWNER-ADDENDUM-BK01-COMPATIBILITY-FIRST-EXTRACTION-2026-09-08.md`
- `docs/platform/billing-core/PROFILE-INDEX.md`
- `docs/platform/billing-core/MULTI-PROFILE-CONCURRENCY-EVIDENCE-2026-09-08.md`
- `docs/platform/billing-core/STRIPE-TEST-PROVIDER-MATRIX-EVIDENCE-2026-09-08.md`
- Control consumer contract: `Gutumrod/hub-web` → `server/control-plane/adapters/billing-core-adapter.ts`
- SB01 runtime: `Gutumrod/stripe-billing` → `platform/runtime/`
