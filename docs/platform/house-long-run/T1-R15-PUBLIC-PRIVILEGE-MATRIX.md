# T1-R15 PUBLIC PRIVILEGE MATRIX — `hub_web_app` on `public` objects

Task ID: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001`
Stage: T1 (R15 least-privilege preparation)
Work unit: `T1-WU03-PUBLIC-PRIVILEGE-MATRIX`
Correlation id: `house-t1-wu03-20260920`
Role class: `evidence_preparation`
Record type: **EVIDENCE PREPARATION ARTIFACT — NOT A GRANT, NOT AN APPROVAL**
Recorded: 2026-09-20 (Asia/Bangkok)

Citations source: `docs/platform/house-long-run/T1-CITATION-PACK.md` (sections **B, C, D, E, F**
only), blob `b8a4994254af0660bfcad661d9200c1f7c30f0c7`.
Governing ruling: `docs/platform/house-long-run/T1-RLS-DECISION-RECORD-2026-09-20.md`
(Owner decision OPTION 3, binding).

> **Lane rule applied:** every `file:line` citation in this artifact was **copied from the
> citation pack**. Nothing here was re-derived, re-verified, or re-read from source by this lane.
> No citation was introduced from any source other than citation-pack sections B, C, D, E, F.

---

## 1. Purpose and boundary

`hub_web_app` is the dedicated Project A **direct-Postgres** login role that R15 requires in place
of the `postgres` owner connection (see the governing ruling). This document states the *required
privilege matrix*: the minimum set of `public`-object privileges the production direct-Postgres
runtime needs, and the privileges it explicitly must not hold.

This matrix is a **declaration of required privilege, not an execution**. No role was created or
altered, no grant or revoke was issued, and no database statement was run.

## 2. Which access path the matrix applies to

The production runtime has two database access paths. The matrix below applies to the
**direct-Postgres path only** (Path A, `DATABASE_URL`); it is the role `hub_web_app` is scoped to.

| Basis | Citation (copied from pack §B) |
|---|---|
| production Cloudflare entry is `server/worker.ts` | `apps/hub-web/wrangler.jsonc:4` — `"main": "server/worker.ts"` |
| production routes | `apps/hub-web/wrangler.jsonc:8-10` — routes `wstera.com`, `platform.wstera.com` |
| production context is the fetch context, not the direct-Postgres context | `apps/hub-web/server/worker.ts:4` — `import { createContext } from "./_core/context.fetch.js"`; `apps/hub-web/server/worker.ts` — `createContext: () => createContext({ req: request })` |
| local Express entry that uses the direct-Postgres context is **not deployed** | `apps/hub-web/server/_core/index.ts:7` — `import { createContext } from "./context.js"` (only importer); `apps/hub-web/server/_core/index.ts:94-95` — "Local dev entry … Production runs on Cloudflare Workers via server/worker.ts instead — this file isn't deployed." |
| production context consumes `context.js` as a **type only** | `apps/hub-web/server/_core/context.fetch.ts:3` — `import type { TrpcContext }` |

## 3. `public.profiles` — EXCLUDED (not required in production)

**Statement required by this work unit: `public.profiles` is EXCLUDED from the `hub_web_app`
grant set.** RLS on `public.profiles` stays enabled and untouched; no `hub_web_app` policy is to be
created.

| Basis | Citation (copied from pack §C) |
|---|---|
| `upsertProfile` defined | `apps/hub-web/server/db.ts:35` |
| `getProfileById` defined | `apps/hub-web/server/db.ts:93` |
| only caller of `upsertProfile` | `apps/hub-web/server/_core/context.ts:48` — `await db.upsertProfile({...})` |
| only caller of `getProfileById` | `apps/hub-web/server/_core/context.ts:54` — `await db.getProfileById(data.user.id)` |
| production profile sync is over PostgREST, not direct Postgres | `apps/hub-web/server/_core/profileStore.ts:27-62` — `client.from("profiles")`, select/update/insert |

**Conclusion (copied from pack §C):** in production, `public.profiles` is reached only through the
Supabase PostgREST path (Path B), never through the direct-Postgres path (Path A). Therefore the
production direct-Postgres runtime does not require `public.profiles`.

## 4. Required-privilege matrix (pack §D, §F)

### 4.1 Object operations

| Object | Required operations | Included in `hub_web_app` scope |
|---|---|---|
| `public.products` | SELECT, INSERT | YES |
| `public.product_assets` | SELECT, INSERT | YES |
| `public.product_installations` | SELECT, INSERT, UPDATE | YES |
| `public.profiles` | **none in production** (excluded by Owner ruling) | **NO — EXCLUDED** |

Usage basis for those operations, copied from pack §D and §F:

| Basis | Citation |
|---|---|
| production runtime object usage (routers) | `apps/hub-web/server/routers.ts:10-19` — imports from `./db.js`: `createProduct`, `createProductAsset`, `createProductInstallation`, `getProductBySlug`, `listProductAssets`, `listProductInstallations`, `listProducts`, `updateProductInstallationStatus` |
| production runtime object usage (webhook) | `apps/hub-web/server/webhooks/productEvents.ts:2` — imports `getProductBySlug`, `recordProductInstallationFromWebhook` |
| the operations table itself | citation pack §D — object/operation table (`products` SELECT+INSERT; `product_assets` SELECT+INSERT; `product_installations` SELECT+INSERT+UPDATE; `profiles` none/excluded) |

### 4.2 Supporting requirements derived from the schema (pack §F)

| Requirement | Citation |
|---|---|
| schema `USAGE` on `public` (implied by all listed object access) | citation pack §D objects are all in `public`; §F covers their schema elements |
| `USAGE` on the backing identity sequences for INSERT | `apps/hub-web/drizzle/schema.ts:61,90,128` — `generatedAlwaysAsIdentity()` on `products.id`, `product_assets.id`, `product_installations.id` |
| enum types referenced by those tables (SELECT/INSERT/UPDATE of enum columns) | `apps/hub-web/drizzle/schema.ts:12-34` — `user_role`, `product_status`, `asset_type`, `installation_status`, `installation_source` |
| unique indexes resolving the runtime's `ON CONFLICT` targets | `apps/hub-web/drizzle/schema.ts:76` (`products_slug_unique`); `apps/hub-web/drizzle/schema.ts:106-109` (`product_assets_product_storage_unique`); `apps/hub-web/drizzle/schema.ts:152-155` (`product_installations_event_unique`) |
| foreign keys constraining runtime writes | `apps/hub-web/drizzle/schema.ts:91-93`, `apps/hub-web/drizzle/schema.ts:100-102`, `apps/hub-web/drizzle/schema.ts:129-131`, `apps/hub-web/drizzle/schema.ts:142` |

## 5. Explicit prohibitions (required to be stated)

The following are **explicitly absent** from the `hub_web_app` privilege set. They are stated here
as the least-privilege proof required by R15.

| Prohibition | Basis |
|---|---|
| **no ownership** of any `public` object, schema, or database | R15 control as carried in the governing ruling (`T1-RLS-DECISION-RECORD-2026-09-20.md`); §D lists required object operations only, and ownership is not among them |
| **no `CREATE`** (no `CREATE` / `ALTER` / `DROP`) | citation pack §E — "No `CREATE` / `ALTER` / `DROP` anywhere in `apps/hub-web/server/**`" |
| **no `DELETE`** | citation pack §E — "No `DELETE` anywhere in `apps/hub-web/server/**`" |
| **no `BYPASSRLS`** | governing ruling OPTION 3 — "**DO NOT** grant `BYPASSRLS` to `hub_web_app`" |
| no escalating role membership | governing ruling — R15 intent: "no escalating role membership" |
| explicit deny on `billing_core` and `billing_core_staging` | governing ruling — "explicit deny on `billing_core`" / "`billing_core_staging`" (deny matrix is a separate T1 lane) |

Because §E records no `CREATE`, `ALTER`, or `DROP` anywhere under `apps/hub-web/server/**`, the
runtime requires no DDL privilege; because §E records no `DELETE` anywhere under
`apps/hub-web/server/**`, the runtime requires no `DELETE` privilege. Only the operations listed in
§4.1 are required.

## 6. Resulting required-privilege summary for `hub_web_app`

```
SCHEMA   USAGE on public
SEQUENCES  USAGE on backing identity sequences of:
           products.id, product_assets.id, product_installations.id
TYPES    USAGE on: user_role, product_status, asset_type,
           installation_status, installation_source
TABLES   public.products              -> SELECT, INSERT
         public.product_assets        -> SELECT, INSERT
         public.product_installations -> SELECT, INSERT, UPDATE
         public.profiles              -> NOT GRANTED (excluded)
```

```
EXCLUDED / DENIED (must remain absent):
  ownership of any object                        (NO)
  CREATE / ALTER / DROP                          (NO)
  DELETE                                         (NO)
  BYPASSRLS                                      (NO)
  escalating role membership                     (NO)
  billing_core, billing_core_staging             (EXPLICIT DENY; separate lane)
```

## 7. Citation provenance

| Citation pack section | Used in |
|---|---|
| B — production vs local entry | §2 |
| C — `public.profiles` not on the production direct-Postgres path | §3 |
| D — production direct-Postgres object usage | §4.1, §5 |
| E — absent operations | §5 |
| F — schema-derived requirements | §4.2 |

Sections A, G, H, I, J of the citation pack were **not** used by this lane, per the work-unit
authority ("Use only the citations supplied in T1-CITATION-PACK.md sections B, C, D, E, F").

## 8. Declarations

- **Citations copied, not re-derived.** Every `file:line` above is copied verbatim from
  `T1-CITATION-PACK.md` sections B, C, D, E, F. No source file was re-read to produce this matrix
  and no citation was re-verified or re-derived by this lane.
- **No production mutation occurred.** This work unit produced one documentation file under
  `docs/platform/house-long-run/`. No database connection was opened, no role created or altered,
  no grant or revoke issued, no migration run, no secret read or printed, and no file outside
  `docs/platform/house-long-run/` was written.
- **No approval is implied.** This is a normalized evidence-preparation record. It is not a grant
  script, not a review PASS, and not a production-readiness claim.
