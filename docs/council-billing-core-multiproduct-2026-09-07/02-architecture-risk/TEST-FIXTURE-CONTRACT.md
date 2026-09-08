# Test Fixture Contract

## Fixture Name

Use Stripe Test Mode on the one WSTERA Stripe account as:

`WSTERA Stripe Sandbox / Billing Test Fixture`

Do not call it Queueeasy Stripe Fixture. Queueeasy is a separate Shared LINE OA test fixture.

## Deterministic Test Identity

Every test run MUST include:

```yaml
environment: test
product_id: string
account_id: string
profile_version: integer
test_run_id: string
plan_id: string
operation_id: string
correlation_id: string
```

## Isolation

Tests MUST use product-isolated test Customers, Stripe Products, Stripe Prices, metadata, and account IDs, or an equally strict isolated mapping contract.

Proof required:

- Product A cannot create checkout for Product B plan.
- Product A cannot resolve Product B Stripe Price.
- Product A cannot mutate Product B entitlement.
- Product A cannot use Product B return URL ref.
- Product A webhook event cannot route to Product B after provider re-fetch.
- Account A cannot access Account B where account-bound assertion is required.

## Cleanup

Test resources MUST be tagged with `test_run_id` and deterministic metadata. Cleanup must remove or archive only resources belonging to that test run and must never touch live mappings.

## Required Test Categories

- profile schema validation
- profile lifecycle activation/fail-closed tests
- Billing API positive and negative tests
- webhook signature/intake/duplicate/out-of-order tests
- Stripe test-mode checkout/subscription/payment tests
- reconciliation drift repair tests
- entitlement adapter push/pull/snapshot tests
- PromptPay manual renewal/expiry tests where supported
- refund/cancel/failed-renewal tests
- audit redaction tests

