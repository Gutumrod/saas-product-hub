# Billing Profile Index

| Order | Product | Code | Billing model | Current commercial amount | Runtime profile status |
|---|---|---|---|---|---|
| 1 | Pawstia PMS | PS01 | recurring subscription | Founding C2 THB 990/month, first 10 invitation-only | `pending_validation` — build first |
| 2 | WSTERA Link | LK01 | free + recurring subscription | final public pricing/quota unresolved | `draft` |
| 3 | WSM | WS01 | recurring subscription | packages/pricing/trial unresolved | `draft` |
| 4 | DocCraft | DC01 | free pilot -> one-time unlock | future experiment THB 299–599 | `draft` |
| 5 | Multi-Tenant AI Starter Kit | MT01 | one-time source sale | direction USD 149–199; purchased version perpetual + 12 months updates | `draft` |
| 6 | Claim & Case Module | CM01 | one-time source/license | final price unresolved | `draft` |
| 7 | Booking | BK01 | recurring SaaS subscription | Basic/Pro pilot references THB 490/990 monthly; final public price not locked | `compatibility_hold` |

Runtime activation is independent of dossier existence. A dossier documents current truth; it does not authorize a charge.

Canonical architecture: `docs/council-billing-core-multiproduct-2026-09-07/02-architecture-risk/`.
Canonical portfolio identity: `docs/products/registry.yaml`.