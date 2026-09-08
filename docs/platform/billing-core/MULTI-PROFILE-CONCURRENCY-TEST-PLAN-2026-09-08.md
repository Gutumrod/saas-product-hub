# WSTERA Billing Core — Multi-Profile Concurrency Test Plan

**Mode:** Test Mode only. No live keys, live money, production deploy, or BK01 migration.

## Profiles under test

1. PS01 Pawstia — Founding C2, THB 990/month recurring.
2. LK01 WSTERA Link — Pro THB 199/month and Business THB 590/month baseline used only for Test validation; public pricing remains unapproved.
3. Third Product profile is intentionally deferred rather than inventing WS01 pricing or pulling BK01 into the Core early.

## Customer fixtures

- Customer 1 -> PS01 Founding C2
- Customer 2 -> LK01 Pro
- Customer 3 -> LK01 Business or PS01 depending on the isolation case

Every fixture uses a distinct account assertion, operation ID and product-bound request context.

## Required scenario matrix

- C1/C2/C3 subscribe separately.
- C1/C2/C3 subscribe concurrently.
- C1/C2/C3 cancel concurrently.
- All subscribe; only C2 cancels.
- All subscribe; C1+C2 cancel concurrently while C3 stays active.
- Same account_id text used in PS01 and LK01 must remain two isolated billing identities.
- Same account receives cancel + resubscribe concurrently; operations must serialize deterministically.
- Cross-product spoof/mismatched requested product must fail closed.