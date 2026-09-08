# WSTERA Billing Core — Multi-Profile Concurrency Evidence

Date: 2026-09-08
Scope: PS01 + LK01, Test Mode only.

## Local deterministic harness

Implementation path:
`products/stripe-billing/platform/profile-registry/`

Verification:
- TypeScript typecheck: PASS
- Node test runner: **16/16 PASS**
- Existing Profile Registry negative tests: 8/8 PASS
- New multi-profile lifecycle/concurrency scenarios: 8/8 PASS

Covered scenarios:
1. three customers subscribe separately across PS01/LK01;
2. three subscribe concurrently;
3. three cancel concurrently;
4. all subscribe then only C2 cancels;
5. all subscribe then C1+C2 cancel together;
6. identical account_id text across two Products stays isolated;
7. same-account cancel/resubscribe race serializes deterministically;
8. cross-product spoof fails closed.

No Product state leaked between PS01 and LK01 in this harness.
## Stripe Test provider preflight

A non-live Stripe Test credential already used by BK01 was inspected without exposing its value.
The key resolved to a Thailand account with default currency THB; active existing products included BK01-like Basic/Pro objects.

Created central-profile validation objects, all confirmed `livemode=false`:
- PS01 Product `prod_VDeG7pTAPPBnw8`
- PS01 Founding C2 Price `price_1UDCxyHB4GRCffd9RyaDWZ1c` = THB 990/month
- LK01 Product `prod_VDeGMVGn8CB4me`
- LK01 Pro Price `price_1UDCxzHB4GRCffd9a0rUipHY` = THB 199/month
- LK01 Business Price `price_1UDCxzHB4GRCffd97bC6KI4h` = THB 590/month

These Test objects are provider mappings only; they do not authorize public pricing or live billing.

## Stripe Test provider lifecycle — PASS

The correct Stripe sandbox account was connected after the initial preflight. A real Test Mode provider matrix then created three test customers, created PS01/LK01 subscriptions, refetched provider state, canceled one customer without affecting the other two, re-subscribed, canceled two while the third remained active, re-subscribed again, and finally canceled all three.

Direct provider list checks confirmed zero active subscriptions for all three customer fixtures after cleanup. Exact provider evidence is recorded in `STRIPE-TEST-PROVIDER-MATRIX-EVIDENCE-2026-09-08.md`.

Profiles still remain `pending_validation`: provider lifecycle PASS does not replace account-binding, webhook, reconciliation, entitlement, audit, or rollback gates.
## Provider runner prepared

A secret-free runner is now tracked at:
`products/stripe-billing/platform/profile-registry/scripts/run-stripe-test-concurrency.mjs`

Safety properties:
- refuses any key that is not `sk_test_`;
- reads secret only from process environment;
- never writes the secret to repo/log output;
- uses the canonical PS01/LK01 Test Price mappings from compiled profiles;
- performs provider refetch after subscribe/cancel;
- runs sequential, concurrent-all, C2-only cancel, and C1+C2 cancel scenarios;
- deletes test customers during cleanup.

`node --check` PASS. Full local registry/concurrency verification remains 16/16 PASS.
The provider lifecycle has now also been exercised through the connected Stripe sandbox; the standalone runner remains available for future exact-parallel provider execution when an approved Test-key process boundary is used.