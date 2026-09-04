# PRODUCT-SOURCE-OF-TRUTH - WS01 WSM

## Locked Product Definition

WSM is a multi-tenant B2B supply-planning and dealer-allocation SaaS for importer/distributor businesses.

Its first product promise is a single traceable source of truth across:

Dealer Demand -> Reliable Supply -> Gap -> Allocation -> Backorder -> Dealer Result

V1 proves this loop manually and reliably before deeper modules are built.

## Primary Customer and Actors

- Customer / tenant: importer or distributor business.
- Buyer / primary operator: owner/operator or small admin team responsible for dealer demand, supplier/factory supply, shortages, and allocation.
- Dealer: demand-side actor using a mobile-first booking link and tenant-issued dealer code.
- Platform operator: portfolio/system operator, not a tenant and not a dealer.

## Product North Star

Demand -> Supply -> Gap -> Allocation -> Fulfillment

Every future capability must preserve this state chain rather than collapse it into a generic stock or order tool.

## V1 Product Boundary

V1 is the Phase 1 thin loop:

1. Tenant/admin configures catalogue, variants, suppliers, dealers, and booking round.
2. Dealer submits demand through mobile booking link.
3. Demand becomes confirmed input for the supply loop.
4. Admin enters manual reliable supply with confidence/provenance.
5. System computes Gap without double-subtracting backorders.
6. Admin manually allocates full or partial quantities.
7. Unallocated confirmed demand remains as backorder.
8. Dealer sees only their own requested, allocated, and waiting result.

## Non-Negotiable Product Invariants

- Requested != Allocated != Fulfilled.
- Ordered != Confirmed != Received.
- Variant is the operational planning unit.
- Product-to-supplier sourcing is many-to-many at the product model level.
- Manual supply in V1 is a replaceable adapter, not the final supply-planning system.
- Gap uses single-subtraction semantics: reliable supply minus open confirmed demand.
- Backorder is a lifecycle/queue/reporting state, not a second subtraction.
- Backorder carry is explicit admin action, not automatic V1 behavior.
- Allocation is derived from allocation records, not copied as mutable truth.
- Dealer reads are self-scoped.
- Tenant isolation is product-required.
- Audit events are immutable to app roles.

## Current Status

Documentation Lock is authorized for Product Gate purposes. This is not implementation approval.

No migration, scaffold, deployment, database apply, or Phase 1 build approval exists in this gate.

## Out-of-Scope For This Gate

- Pricing, revenue, competition, GTM, and market sizing.
- Architecture/hosting/database placement decision.
- Module Hub scan or shared infrastructure commitment.
- Risk gate, Pre-Build gate, Agent Relay gate, and Portfolio Arbitration.
