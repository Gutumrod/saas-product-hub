# BK01 Order Prototype Lock — 2026-09-05

**Status:** FROZEN / OWNER-REVIEWED PROTOTYPE
**Scope:** Merchant Admin + Customer Pre-Order mobile flow
**Purpose:** Visual/product contract reference only; not production implementation

## Locked artifacts

- `index.html`
  - SHA-256: `571A67D6D4A7C05527BAD49280404D73B28EC1E373C12DEE6F67A342E23C4BF1`
- `customer.html`
  - SHA-256: `FAFA02B14214D482B6013096C7A2ACF82D584C1A96E3DDAAFA12BE1CA01D1E60`

## Independent verification

Owner-side verification completed against the served prototype, not only the AGY walkthrough report.

- Core remediation scenarios A–H: **22/22 PASS**
- Final micro-remediation edge checks: **19/19 PASS**
- Both pages returned HTTP 200 at verification time

## Locked product behavior

1. Order handles product/work preparation, lead time, production capacity and ready date.
2. Booking remains the appointment authority for staff + time.
3. Order-linked Booking can only be created after Order is `READY`.
4. Order-linked Booking cannot bypass or displace existing Booking availability.
5. Order and Booking lifecycles remain separate.
6. Booking completion does not automatically complete the Order.
7. Booking deposit policy for Order-linked Booking is `Not configured` in this prototype.
8. Customer phone is used to match an existing shop customer, not as an authentication credential.
9. Customer-facing UI does not expose raw production capacity units.
10. Customer ready-date selection is constrained by lead time, workshop calendar and capacity.

## Explicit non-goals of this lock

This prototype does **not** authorize or claim production support for:

- Lift / bay / room / equipment resource scheduling
- Buffer-before / buffer-after engine
- Inventory / warehouse / supplier / purchasing
- Automatic Booking→Order completion
- Automatic payment aggregation across Order and Booking
- Shipping engine
- BOM / routing / employee workload optimization
- Claim lifecycle inside BK01

## Freeze rule

No additional feature work should be added to this prototype without a new Owner delta decision.
Future changes must either:

1. update the prototype under a new dated delta/lock record, or
2. move into the approved V1 system contract and production implementation plan.

This lock preserves the visual/product decisions reached during the 2026-09-05 review. It does not supersede existing locked BK01 production contracts by itself.
