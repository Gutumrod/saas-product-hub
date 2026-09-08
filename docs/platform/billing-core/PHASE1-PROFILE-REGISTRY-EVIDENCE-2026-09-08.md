# Billing Core Phase 1 — Profile Registry Evidence

Date: 2026-09-08
Owner authorization: build foundation, Test Mode only; profiles added one at a time starting PS01.

## Implemented
- Canonical rollout plan and per-Product billing dossiers under `docs/platform/billing-core/profiles/`.
- Seven current dossiers: PS01, LK01, WS01, DC01, MT01, CM01, BK01.
- Runtime foundation at `products/stripe-billing/platform/profile-registry/`.
- Typed Product Billing Profile contract.
- Registration validation and immutable stored snapshots.
- Exact request-scoped resolution by credential-bound `product_id + environment + profile_version`.
- No mutable global `current_profile` / `active_product` / implicit latest-profile resolution.
- Activation guard with provider/admission evidence checks and live activation denied by default.
- Explicit rollback-profile requirement when replacing an active profile.
- Account-bound assertion guard for account-scoped operations.
- PS01 Test profile fixture: Founding C2 THB 990/month, status `pending_validation`.

## Verification
TypeScript production source/profile typecheck: PASS.
Node built-in behavioral tests: **8/8 PASS**.
Tests cover pending registration, incomplete PS01 activation denial, product spoof denial, exact env/version resolution, duplicate version denial, partial Stripe mapping denial, rollback requirement, and missing account assertion denial.

## Deliberately not implemented
Stripe API calls, Checkout, Portal, webhook intake, reconciliation runtime, Pawstia entitlement delivery, database apply, live keys/charges, production deploy, BK01 migration/extraction.

## Next gate
Stripe Test preflight for PS01 -> create/map Test Product + Price -> record `test_run_id` and isolation evidence -> only then evaluate PS01 activation and begin shared Stripe adapter/vertical slice.