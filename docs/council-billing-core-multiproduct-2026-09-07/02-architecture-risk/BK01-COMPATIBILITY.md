# BK01 Compatibility

## Decision

BK01 receives a transitional exception plus central facade/adapter convergence. There is no forced BK01 rewrite now.

## Authoritative Interpretation

- BK01 remains protected from forced migration.
- Existing BK01 billing is a capability baseline/reference implementation.
- Shared Billing Core must be a capability superset, not a copy of BK01.
- New Products use shared Billing Core natively.
- BK01 converges later through central facade/adapter first.
- Extraction happens only capability-by-capability after evidence gates pass.
- Product-specific entitlement remains Product-owned.

## What Must Not Leak Into Generic Core

Generic Billing Core contracts MUST NOT embed:

- `shop_id` as universal account key
- `shop_users`
- Basic/Pro package assumptions
- Booking entitlement rules
- monthly-only semantics
- BK01 quota/top-up details as generic subscription behavior
- BK01 merchant/customer PromptPay deposits

Generic account identity is `account_id` or Product-owned tenant reference. Product adapters translate generic transitions to Product state.

## Facade Path

Phase BK-F0:

- Define BK01 facade contract matching central Product-facing API shape.
- No behavior change to BK01 payment implementation.
- No migration of Stripe objects or DB state.

Phase BK-F1:

- Add central observability/audit correlation for BK01 facade calls where safe.
- Keep BK01 as system of record for its current SaaS billing until extraction is approved.

Phase BK-F2:

- Compare BK01 capabilities against Billing Core superset.
- Define parity, isolation, reconciliation, rollback, and regression evidence.

Phase BK-F3:

- Extract one capability at a time only after evidence passes.

## Separate Financial Domains

BK01 SaaS subscription paid to WSTERA and BK01 merchant/customer PromptPay deposit flows are separate financial domains. They MUST NOT share subscription state machines, entitlement authority, reconciliation policy, or provider metadata conventions except through clearly separated audit references.

