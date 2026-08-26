# Product Identity & Hostname Namespace Proposal

**Status:** Proposal only — not approved for implementation  
**Created:** 2026-08-26  
**Scope:** SaaS Product Hub / WSTERA product portfolio

## 1. Problem

Product names such as `booking`, `chat`, `docs`, `crm`, or `pos` describe a category or capability and may be reused by multiple future products.

Using a generic product name as the permanent subdomain creates a namespace collision. For example, `booking.wstera.com` becomes ambiguous if WSTERA later ships multiple booking products for different verticals or use cases.

The product's permanent technical identity should therefore be independent from its marketing name, category, and public slug.

## 2. Proposed identity model

Each product receives four separate identity fields:

| Field | Purpose | Change policy |
|---|---|---|
| `product_id` | Permanent machine identity | Immutable |
| `product_code` | Short human-readable portfolio code | Immutable after assignment |
| `name` | Customer-facing product name | May change |
| `slug` | Customer-facing URL/brand slug | May change with migration |

Example:

```text
product_id   = prd_<ULID-or-equivalent>
product_code = BK01
name         = Local Service Booking
slug         = service-booking
category     = booking
```

The existing registry `key` may remain as a repository/catalog key. This proposal does not rename current repositories, schemas, products, or registry entries.

## 3. Hostname model

Reserve the short product code as a stable WSTERA technical hostname:

```text
bk01.wstera.com  -> Product BK01
bk02.wstera.com  -> Product BK02
dc01.wstera.com  -> Product DC01
ps01.wstera.com  -> Product PS01
```

A separate branded hostname may point to the same product when a public product name is established:

```text
serviceflow.wstera.com -> BK01
pawspace.wstera.com    -> PS01
doccraft.wstera.com    -> DC01
```

`wstera.com` remains the portfolio/company root and is not assigned to an individual product.

The stable code hostname and branded hostname solve different problems:

- code hostname = durable technical identity and routing target
- branded hostname = human-facing marketing identity
- product name = display identity
- category = classification only; never treated as a unique identifier

## 4. Product-code allocation

Proposed code format: `<family-prefix><sequence>`.

Initial examples only:

| Code | Candidate product/family |
|---|---|
| `BK01` | Current Local Service Booking product |
| `BK02` | Future booking product |
| `DC01` | DocCraft |
| `PS01` | PawSpace |

Codes must never be recycled after assignment, including after a product is retired.

## 5. Registry extension proposed later

If this proposal is approved in the future, a registry entry could eventually gain fields similar to:

```yaml
product_id: "prd_<immutable-id>"
product_code: "BK01"
key: "booking"
name: "Local Service Booking"
slug: "service-booking"
category: "Operations & Scheduling"
canonical_host: "bk01.wstera.com"
public_host: null
```

This is a proposed shape only. No registry schema change is authorized by this document.

## 6. Current Booking implication

The existing `products/booking` product is the first candidate for `BK01` if the owner later approves this namespace policy.

This proposal intentionally does **not** attach `booking.wstera.com`, `bk01.wstera.com`, or any other hostname now. The current deployment remains pending under the existing roadmap.

## 7. Decision boundary

Before implementation, the owner must explicitly approve:

1. Whether the portfolio adopts permanent `product_id` values.
2. Whether `product_code` follows the `<family-prefix><sequence>` convention.
3. Whether code-based hosts such as `bk01.wstera.com` become canonical infrastructure hosts, aliases, or customer-visible URLs.
4. The migration policy for renamed public slugs/domains.
5. The first code allocation list for existing products.

Until those decisions are approved, this document is informational only and must not trigger DNS, deployment, repository rename, schema, registry, or application changes.
