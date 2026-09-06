# WSTERA Product Identity Reconciliation — 2026-09-07

**Status:** CLOSED
**Owner decision:** Close the identity reconciliation before Control Plane work-tracking integration.
**Scope:** Current seven-product Build-to-Sell portfolio plus registry identity hygiene.

## Canonical authority

`docs/products/registry.yaml` is the source of truth for permanent product identity:

- `product_id` = immutable machine identity; never reused.
- `product_code` = immutable short portfolio code; never recycled.
- Product names, slugs, repository names and paths are not identity authority.
- Control, Hermes, S-Bridge and agents must not infer product identity from titles or paths.

Current execution authority remains separate: `docs/strategy/BUILD-TO-SELL-EXECUTION-2026-09-06.md`.
Identity registration does not authorize build, migration, deployment, DNS or runtime placement.

## Active seven — canonical 7/7

| Code | Product | Permanent product_id | Registry path | Git repository | Result |
|---|---|---|---|---|---|
| BK01 | Booking | `prd_f55973504ccf4872a4a0a259e80e4550` | `products/booking` | `Gutumrod/booking` | CANONICAL |
| DC01 | DocCraft | `prd_d3bd4eca099b4c9599b2a9ecd0cc9652` | `products/doccraft` | `Gutumrod/doccraft` | CANONICAL |
| PS01 | Pawstia | `prd_c3a024781f4e4079815b2399cfe330e0` | `products/pawspace` | `Gutumrod/pawspace` | CANONICAL |
| LK01 | WSTERA Link | `prd_f4be6d1a9b544632a527e0e15e485622` | `products/wstera-link` | `Gutumrod/wstera-link` | CANONICAL |
| MT01 | Multi-Tenant AI Starter Kit | `prd_f44256f593314d9d932ad6b6da2f586f` | `products/multi-tenant-ai` | `Gutumrod/multi-tenant-ai` | CANONICAL |
| CM01 | Booking Claim & Case Management | `prd_a33aba1a1f9841c1806cd23ce0ae8a66` | `products/booking-ticket-module` | `Gutumrod/booking-ticket-module` | CANONICAL |
| WS01 | WSM — WSTERA Supply Management | `prd_8d94348cd4ed492ba6ee08776da66bc6` | `products/WSM` | `Gutumrod/wsm` | CANONICAL — reconciled 2026-09-07 |

WS01 was already consistently used by the WSM repository, Council artifacts and Build-to-Sell authority. The missing parent-registry declaration was the gap. Owner approval on 2026-09-07 closes that gap; it does not change WSM runtime or deployment authority.

Compatibility note: the current WSM README uses the legacy label `Product ID: WS01`. Under the portfolio identity model, that value is the `product_code`; the permanent machine `product_id` is the `prd_...` value in the central registry. The registry wins if terminology conflicts.

## Registry entries still identity-pending

The following registered/incubation products do not yet have an Owner-approved permanent `product_id` + `product_code` pair:

- `line_oa_ai_sales_service_engine`
- `money_leak_buddy`

They are **IDENTITY_PENDING**, not canonical Control product identities. Do not invent codes such as a guessed family prefix and do not derive identity from repository/path/name. They may be assigned permanent identity only by a later Owner declaration recorded in the central registry.

These two pending incubation identities do **not** block the current seven-product reconciliation because neither is part of the current Build-to-Sell seven.

## Control / Hermes ingestion contract

For Product-scoped work, ingestion must carry an explicit canonical `product_code` that exists in the registry. If a packet/task lacks a canonical code, preserve it as unresolved rather than guessing.

Allowed outcome:

`product_code = null` + `identity_state = unresolved`

Forbidden outcomes: title matching, path matching, repo-name guessing, agent-generated codes, or mock substitutions.

## Reconciliation verdict

- Active Build-to-Sell portfolio identity: **7/7 CANONICAL**.
- WS01 parent-registry gap: **CLOSED**.
- Duplicate active product codes: must remain **0**.
- Duplicate permanent product IDs: must remain **0**.
- Identity-pending incubation entries: explicitly marked and excluded from canonical Control ingestion.

## Next boundary

Control Plane Phase 1 may now use `docs/products/registry.yaml` as the identity authority for the active seven.

The next unresolved problem is not portfolio naming; it is runtime propagation: Hermes/S-Bridge work records still need explicit `product_code` carried into the Control work-tracking contract.