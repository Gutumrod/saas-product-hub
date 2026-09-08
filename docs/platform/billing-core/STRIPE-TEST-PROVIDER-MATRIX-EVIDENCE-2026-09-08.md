# Stripe Test Provider Matrix Evidence — 2026-09-08

**Environment:** Stripe Test Mode / Sandbox only
**Stripe account:** `acct_1U2L8zHB4GRCffd9` — แซนด์บ็อกซ์ Queueeasy
**Live money:** PROHIBITED; every verified Product/Price/Customer/Subscription returned `livemode=false`.

## Profiles exercised
- PS01 Pawstia: Founding C2, THB 990/month, `price_1UDCxyHB4GRCffd9RyaDWZ1c`.
- LK01 WSTERA Link: Pro test validation, THB 199/month, `price_1UDCxzHB4GRCffd9a0rUipHY`.
- LK01 Business THB 590/month mapping also exists but was not needed for this customer matrix.

## Customer fixtures
- Customer 1 -> PS01
- Customer 2 -> LK01 Pro
- Customer 3 -> PS01

All customers used Stripe test card token `tok_visa`; no real customer/payment data was used.
## Provider lifecycle results
1. Customer 1 PS01 subscribed -> provider status `active`.
2. Customer 2 LK01 subscribed -> provider status `active`.
3. Customer 3 PS01 subscribed -> provider status `active`.
4. Cancel Customer 2 only -> Customer 2 `canceled`; Customer 1 and Customer 3 remained `active` on direct retrieve.
5. Re-subscribe Customer 2 -> new LK01 subscription `active`.
6. Cancel Customer 1 + Customer 2 -> both `canceled`; Customer 3 remained `active` on direct retrieve.
7. Re-subscribe Customer 1 + Customer 2 -> all three again reached `active` provider state.
8. Final cleanup canceled Customer 1 + Customer 2 + Customer 3.

Direct list checks after cleanup:
- Customer 1: `status=active` -> `data=[]`.
- Customer 2: `status=active` -> `data=[]`.
- Customer 3: `status=active` -> `data=[]`.

No active test subscription from this three-customer matrix was left behind.
## Concurrency interpretation
The Stripe connector executes tool calls serially, so exact same-millisecond provider invocation was not claimed here. True concurrent subscribe/cancel scheduling is covered by the local deterministic harness (`16/16 PASS`) using the same PS01/LK01 mappings. This provider run proves real Stripe Test lifecycle, cross-profile state separation, re-subscription after cancellation, direct provider refetch, and cleanup.

A Stripe Search query immediately after cancellation returned a stale search-index match even though the returned object itself had `status=canceled`; this is expected for Stripe Search's eventually-consistent index and is deliberately excluded as cleanup authority. Direct retrieve/list endpoints are the evidence source.

## Verdict
**PASS — Stripe Test provider lifecycle and mixed PS01/LK01 isolation.**

This does **not** activate either Product Billing Profile. Remaining activation gates include account-bound assertion evidence, webhook intake/signature/idempotency evidence, reconciliation evidence, entitlement-adapter evidence, audit evidence, and rollback proof.