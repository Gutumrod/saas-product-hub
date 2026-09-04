# BUSINESS-RULES - WS01 WSM V1

## Quantity and State Semantics

- Requested demand is not guaranteed supply.
- Allocated quantity is not fulfilled quantity.
- Ordered quantity is not confirmed supply.
- Confirmed supply is not received supply.
- Allocation is derived from allocation records.
- Fulfillment is outside V1 except as North Star direction.

## Gap Rule

Gap is derived once from reliable supply and open confirmed demand.

Formula:

`supply_position = reliable_supply - open_confirmed_demand`

`shortage = max(-supply_position, 0)`

Backorders are not subtracted again. Backorder quantity exists for queueing, reporting, and lifecycle consistency.

## Supply Rule

Manual supply is allowed in V1 only as an adapter. It must record quantity, confidence, effective date, source/provenance, tenant, and variant.

Manual supply must be replaceable later by PO/factory commitment/batch evidence without reinterpreting historical demand.

## Allocation Rule

Allocation is manual in V1. Partial allocation is allowed. Auto-allocation and allocation policy execution are deferred.

Allocation must not exceed the allowed supply or requested/confirmed demand according to the Phase 1 build rule.

## Backorder Rule

Unallocated confirmed demand remains as backorder.

Backorder carry is not automatic in V1. It stays open until explicit admin action.

## Tenancy and Dealer Scope

Tenant = importer/distributor business.

Dealers belong to a tenant and are not tenants themselves.

Dealer booking identity uses tenant-issued code in V1. Dealer code is an identity claim, not a general authorization token.

Dealers must never see another dealer's demand, allocation, or backorder result.

## Audit Rule

Meaningful state changes, overrides, allocation decisions, and security-sensitive events require immutable audit evidence.

## Product Gate Limitation

This Product Gate does not decide runtime placement, database placement, billing integration, commercial values, legal retention, or SLA wording.
