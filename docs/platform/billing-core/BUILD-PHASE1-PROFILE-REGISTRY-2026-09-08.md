# BUILD — Billing Core Phase 1: Product Billing Profile Registry

Status: OWNER AUTHORIZED — TEST MODE FOUNDATION ONLY

## Objective
Create the reusable multi-product foundation inside `products/stripe-billing` before any Checkout/API/provider implementation.

## Build now
- typed Product Billing Profile contract matching Council schema
- validation for identity, environment, lifecycle, plans, rails and provider mapping completeness
- immutable/versioned registry API
- exact request-scoped resolver; never global `current_profile`
- fail-closed activation guard and explicit rollback target
- account-bound context type for later API/auth wiring
- deterministic PS01 Test profile fixture in `pending_validation`
- negative tests for wrong product/environment/version, duplicate active version, partial paid mapping and cross-product resolution

## Do not build yet
Stripe network calls, Checkout, Portal, webhook ingress, real DB migration/apply, entitlement delivery to Pawstia, live config, charges, production deploy, BK01 migration.

## Canonical inputs
- `docs/council-billing-core-multiproduct-2026-09-07/02-architecture-risk/PRODUCT-BILLING-PROFILE-CONTRACT.md`
- `PROFILE-LIFECYCLE.md`, `BILLING-API-CONTRACT.md`, `SECURITY-INVARIANTS.md`, `NEW-PRODUCT-ADMISSION.md`
- `docs/platform/billing-core/PROFILE-ROLLOUT-PLAN.md`
- `docs/platform/billing-core/profiles/PS01.md`

## Exit gate
Tests/typecheck pass; PS01 can register as pending but cannot activate without complete Test provider mapping/admission evidence; Product A cannot resolve Product B profile; no mutable shared current-product state exists.