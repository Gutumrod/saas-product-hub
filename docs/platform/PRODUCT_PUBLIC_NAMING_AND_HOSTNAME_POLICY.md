# WSTERA Public Product Naming & Hostname Policy

**Status:** CANONICAL / OWNER-APPROVED
**Effective:** 2026-09-25
**Owner:** WSTERA Owner
**Scope:** Customer-facing WSTERA product names, public slugs, hosted application hostnames, and legacy-host migration
**Supersedes:** `PORTFOLIO_PRODUCTION_MASTER_PLAN.md` §10 D1 hostname rule approved 2026-08-26/27
**Evidence:** `docs/platform/reviews/REPORT-WSTERA-PRODUCT-HOSTNAME-NAMING-POLICY-AUDIT-2026-09-24.md`

## 1. Identity contract

WSTERA separates permanent internal identity from customer-facing identity:

| Field | Purpose | Change policy |
|---|---|---|
| `product_id` | Permanent machine identity | Immutable; never recycled |
| `product_code` | Permanent internal portfolio/reference code | Immutable after assignment; never recycled |
| `name` | Customer-facing product name | Must be unique across active/reserved portfolio |
| `slug` | Customer-facing public product slug | Must be unique/reserved; migration required after publication |

`product_id` and `product_code` remain valid for Control Plane, billing metadata, internal docs,
audit trails, gates, repository references, operational records, and machine-to-machine identity.
They are not required in customer-facing URLs.

## 2. Public naming and slug rules
1. Every customer-facing WSTERA product name must be unique across active and reserved products.
2. A later product that would reuse an existing public name must be renamed before launch.
3. Every public slug must be globally unique across WSTERA, lowercase, DNS-label safe, and explicitly declared in the registry.
4. A published/reserved slug is not silently recycled to another product.
5. A product rename requires an explicit name/slug migration decision. The old slug remains reserved unless the Owner explicitly releases it after compatibility review.
6. A hosted product without an approved unique slug has no approved public application hostname yet.
7. One-time/source products do not require a WSTERA application hostname unless WSTERA later introduces a hosted product surface for them.

Repository/catalog `key`, repository path, database schema, and product code do not define the public hostname.

## 3. Canonical public hostname

For a WSTERA-hosted product application:

```text
public_host = <public_slug>.wstera.com
```

Example:

```text
product_code = DC01
name         = DocCraft
slug         = doccraft
public_host  = doccraft.wstera.com
```
The portfolio root `wstera.com` remains owned by the Hub/storefront. Product subdomains do not own the root zone.

## 4. Legacy code-host compatibility

Previously published or reserved code-based hosts such as `dc01.wstera.com`, `bk01.wstera.com`,
`ps01.wstera.com`, and `lk01.wstera.com` are legacy identifiers after this policy takes effect.

- Do not delete or rebind an existing live legacy host blindly.
- Browser traffic may be redirected only after the new canonical host is attached and verified.
- Provider endpoints, OAuth callbacks, payment redirects/webhooks, LINE callbacks, QR codes,
  bookmarks, monitoring, and external references must be inventoried and migrated explicitly.
- Do not assume every provider follows redirects safely; update provider configuration directly where required.
- A legacy host remains available for compatibility until its owning migration records an explicit sunset/disposition.
- A code-host reservation that was never deployed may be superseded without creating the legacy host.

## 5. Historical evidence

Dated evidence, reviews, launch snapshots, council artifacts, and status reports must preserve the
hostname that was true at their observation time. Do not bulk-rewrite historical evidence.

Active policy and current-state documents must point to this policy and the current registry state.
Historical documents that encode the former code-host rule may receive a supersession notice without
rewriting their original body.

## 6. Registry contract
The registry is the declaration point for `name` and `slug`. The canonical public host is derived
from the approved slug; a separate `canonical_host` YAML field is not required by this policy.

Before accepting a new or changed public name/slug:

1. check exact and case-insensitive name collisions across active/reserved products;
2. check exact slug collisions across all active/reserved/retired-reserved slugs;
3. confirm the slug is DNS-label safe;
4. reserve the name and slug in the registry before public launch;
5. if the product was already published, create a migration/compatibility plan before changing it.

As of the 2026-09-25 reconciliation, the registry check found 20 declared slugs with 20 unique
values and 24 declared public names with 24 unique values. Products without a declared slug remain
ineligible for a canonical public application hostname until a slug is approved.

## 7. DocCraft migration reference

The first migration under this policy is DocCraft:

```text
Internal code: DC01
Public name:   DocCraft
Public slug:   doccraft
Canonical app: doccraft.wstera.com
Legacy host:   dc01.wstera.com
```
Policy approval does not itself mutate DNS, Cloudflare routes, certificates, runtime config,
provider callbacks, or product source. Those changes require a separate implementation task with
verification and rollback/compatibility evidence.

## 8. Authority

When hostname/naming documents conflict, a later explicit Owner decision wins. For public product
naming and application hostnames, this policy is the canonical interpretation of
`PORTFOLIO_PRODUCTION_MASTER_PLAN.md` §10 D1 from 2026-09-25 onward.
