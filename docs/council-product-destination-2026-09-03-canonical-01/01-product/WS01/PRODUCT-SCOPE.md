# PRODUCT-SCOPE - WS01 WSM V1

## In Scope For V1

- Multi-tenant SaaS product shape with tenant = importer/distributor business.
- Owner/admin tenant setup sufficient for the thin loop.
- Product/variant catalogue for planning.
- Supplier mapping sufficient for Phase 1.
- Dealer creation and tenant-issued dealer code.
- Booking round creation and dealer mobile booking link.
- Idempotent dealer demand submission.
- Confirmed demand used as Gap input.
- Manual supply entry with confidence, quantity, effective date, and provenance.
- Gap view over reliable supply and open confirmed demand.
- Manual full/partial allocation.
- Backorder persistence for unallocated demand.
- Dealer-visible self-scoped result.
- Tenant isolation, dealer self-scoping, immutable audit, and negative security tests.
- Entitlement read/enforcement shape, without deciding commercial values.

## Explicit Non-Goals For V1

- Purchase orders.
- Factory commitment workflow.
- Production batches and revision history.
- Multi-site supplier model.
- Allocation policies, allocation scoring, and auto-allocation.
- Warehouse, inventory ledger, barcode, fulfillment module, or stock movement.
- Payments, invoices, credit, deposits, accounting, or finance module.
- AI, forecasting, planning intelligence, impact automation.
- Notifications/integrations beyond the minimum auth/runtime/database dependency shape.
- Full dealer portal beyond booking and self-result.
- Automatic backorder carry into future rounds.
- Launch pricing, plan limits, trial/grace values, retention periods, or SLA wording.

## V1 Ends When

V1 ends when the following scenario is demonstrable end-to-end with evidence:

Dealer A and Dealer B submit demand in a booking round; admin enters reliable supply lower than total confirmed demand; system shows shortage; admin allocates partial quantities; unallocated demand becomes backorder; each dealer sees only their own requested/allocated/waiting result; retries do not duplicate demand; concurrent allocation cannot over-allocate; tenant/dealer isolation negative tests pass.

## Phase Boundary

Phase 2 may deepen supply provenance with PO/factory commitment/batches.

Phase 3 may add allocation policies, future-supply allocation behavior, backorder queue automation, and promise revision history.

Phase 4+ may add inventory/fulfillment, finance, automation, intelligence, and platform maturity.
