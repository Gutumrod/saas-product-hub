# T1-R15 PUBLIC PRIVILEGE MATRIX — `hub_web_app` on `public` objects

Task ID: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001`
Stage: T1 (R15 least-privilege preparation)
Work unit: `T1-WU03B-PUBLIC-PRIVILEGE-MATRIX-FIX` (corrected regeneration of `T1-WU03-PUBLIC-PRIVILEGE-MATRIX`)
Correlation id: `house-t1-wu03b-20260920`
Role class: `evidence_preparation`
Record type: **EVIDENCE PREPARATION ARTIFACT — NOT A GRANT, NOT AN APPROVAL**
Recorded: 2026-09-20 (Asia/Bangkok)
Artifact revision basis: `650daed52cb078130943f3e888d90745f9bb9c5b`

Citations source: `docs/platform/house-long-run/T1-CITATION-PACK.md` — sections **B, C, D, E** and
**section F as corrected (F.1 / F.2 / F.3)**, plus errata entries K-1 / K-2.
Governing ruling: `docs/platform/house-long-run/T1-RLS-DECISION-RECORD-2026-09-20.md`
(Owner decision OPTION 3, binding).
B1 findings disposition: `docs/platform/house-long-run/B1-REVIEW-OUTCOME-2026-09-20.md` (verdict
`WORKER_FIX`) and `docs/platform/house-long-run/B1-REVIEW-REPORT-CODEX-2026-09-20.md`.

> **Lane rule applied:** every `file:line` citation in this artifact was **copied from the
> citation pack**. Nothing here was re-derived, re-verified, or re-read from source by this lane.
> No citation was introduced from any source other than citation-pack sections B, C, D, E, F.

> **Supersession:** this file **overwrites** the earlier content of
> `T1-R15-PUBLIC-PRIVILEGE-MATRIX.md`. The overwritten version was the one reviewed by B1 and
> carried blocking finding BLK-1 (`user_role` included in the granted enum types), the FK caveat
> stated as a schema note rather than an open verification item, and the unsupported claim
> "Only the operations listed in §4.1 are required".

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
created. The governing ruling (OPTION 3) also states: **DO NOT** grant `BYPASSRLS` to
`hub_web_app`; **DO NOT** create a `hub_web_app` RLS policy merely to make direct-Postgres profile
access work; `hub_web_app` must not require access to `public.profiles` in the production runtime.

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

Consequently **no privilege of any kind on `public.profiles` is granted to `hub_web_app` by this
matrix** — no `SELECT`, no `INSERT`, no `UPDATE`, no `DELETE`, no `REFERENCES`, no `TRIGGER`.

## 4. Required-privilege matrix (pack §D, §F)

### 4.1 Object operations

| Object | Required operations | Included in `hub_web_app` scope |
|---|---|---|
| `public.products` | SELECT, INSERT | YES |
| `public.product_assets` | SELECT, INSERT | YES |
| `public.product_installations` | SELECT, INSERT, UPDATE | YES |
| `public.profiles` | **none in production** (excluded by Owner ruling) | **NO — EXCLUDED** |

Usage basis for those operations, copied from pack §D:

| Basis | Citation |
|---|---|
| production runtime object usage (routers) | `apps/hub-web/server/routers.ts:10-19` — imports from `./db.js`: `createProduct`, `createProductAsset`, `createProductInstallation`, `getProductBySlug`, `listProductAssets`, `listProductInstallations`, `listProducts`, `updateProductInstallationStatus` |
| production runtime object usage (webhook) | `apps/hub-web/server/webhooks/productEvents.ts:2` — imports `getProductBySlug`, `recordProductInstallationFromWebhook` |
| the operations table itself | citation pack §D — object/operation table (`products` SELECT+INSERT; `product_assets` SELECT+INSERT; `product_installations` SELECT+INSERT+UPDATE; `profiles` none/excluded) |

### 4.2 Supporting requirements derived from the schema (pack §F.1 / §F.2 / §F.3)

| Requirement | Citation |
|---|---|
| schema `USAGE` on `public` (implied by all listed object access) | citation pack §D objects are all in `public`; §F covers their schema elements |
| `USAGE` on the backing identity sequences for INSERT | pack §F.1 — `apps/hub-web/drizzle/schema.ts:61,90,128` — `generatedAlwaysAsIdentity()` on `products.id`, `product_assets.id`, `product_installations.id` |
| enum types referenced by those tables (SELECT/INSERT/UPDATE of enum columns) — **exactly four, corrected list** | pack §F.2 — `product_status` (`schema.ts:20`, used `:67`); `asset_type` (`schema.ts:21`, used `:94`); `installation_status` (`schema.ts:28`, used `:136`); `installation_source` (`schema.ts:34`, used `:139`) |
| unique indexes resolving the runtime's `ON CONFLICT` targets | pack §F.3 — `apps/hub-web/drizzle/schema.ts:76` (`products_slug_unique`); `apps/hub-web/drizzle/schema.ts:106-109` (`product_assets_product_storage_unique`); `apps/hub-web/drizzle/schema.ts:152-155` (`product_installations_event_unique`) |
| foreign keys constraining runtime writes | pack §F.3 — `apps/hub-web/drizzle/schema.ts:91-93`, `:100-102`, `:129-131`, `:142` |

#### 4.2.1 Enum types — corrected statement (addresses B1 BLK-1)

The production tables use **exactly these four enum types**, and `hub_web_app` requires `USAGE` on
those four only:

```
product_status
asset_type
installation_status
installation_source
```

**`user_role` is NOT granted and does NOT appear in the granted enum set.** Per pack §F.2,
`user_role` (`schema.ts:12`) is referenced only by `profiles.role` (`schema.ts:44`), and
`public.profiles` is excluded from the `hub_web_app` grant set by the Owner ruling. Granting
`USAGE` on `user_role` would therefore be an unnecessary privilege and would violate the
least-privilege "no more" rule recorded in the governing ruling.

Root cause of the earlier defect (recorded at source, pack §K-1, not re-derived here): the previous
citation pointed at the whole range `schema.ts:12-34`, which spans the excluded enum. The corrected
form supplied by pack §F.2 is the form used above.

#### 4.2.2 Foreign-key caveat on `uploadedBy` / `recordedBy` → `public.profiles` — OPEN VERIFICATION ITEM

Per pack §F.3 (verbatim substance): `product_assets.uploadedBy → profiles.id`
(`schema.ts:100-102`, `ON DELETE RESTRICT`) and `product_installations.recordedBy → profiles.id`
(`:142`, `ON DELETE SET NULL`) reference `public.profiles`. A runtime INSERT that supplies a value
for `uploadedBy` / `recordedBy` causes PostgreSQL to perform a referential-integrity lookup on
`public.profiles`, which **may** require `SELECT`/`REFERENCES` on the referenced table even though
the runtime never queries `profiles` directly.

**Status: OPEN LIVE-VERIFICATION ITEM — NOT A GRANTED PRIVILEGE.**

- This matrix does **not** grant `SELECT` or `REFERENCES` on `public.profiles` on account of this
  caveat, and must not be read as granting either.
- The caveat must be verified against the live database **before R15 apply**. If live verification
  shows a profile privilege is unavoidable, that is a change to the grant set requiring its own
  decision — it is not established by this document.
- B1 carried this forward as a permanent untested area
  (`B1-REVIEW-OUTCOME-2026-09-20.md`, "Untested areas carried forward": "Whether FK checks involving
  `public.profiles` succeed without any profile privilege … Requires live verification before R15
  apply; recorded as an open item, not a granted privilege").

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
| **no `USAGE` on the `user_role` enum type** | pack §F.2 — `user_role` belongs to the excluded `public.profiles`; granting it would be an unnecessary privilege (addressed under B1 BLK-1) |
| **no privilege on `public.profiles`** (SELECT / INSERT / UPDATE / DELETE / REFERENCES / TRIGGER) | pack §C and §D and governing ruling OPTION 3 — `public.profiles` is excluded. The `uploadedBy` / `recordedBy` FK question is an open verification item (§4.2.2), not a granted privilege. |

**REMOVED CLAIM — replaced by an accurate statement.** The previous revision of this artifact
asserted as an operative claim: *"Only the operations listed in §4.1 are required."* B1 recorded
that claim as **unsupported** while `user_role` was granted. It is **REMOVED from this artifact as
an operative assertion**; the wording appears above in this section only as a labelled quotation of
the withdrawn text, for traceability. The accurate replacement statement is:

> The object operations required by the production direct-Postgres runtime are those listed in
> §4.1. In addition, the schema-derived requirements in §4.2 (schema `USAGE`; `USAGE` on the three
> backing identity sequences; `USAGE` on the four enum types listed in §4.2.1; and the index and
> foreign-key behaviour cited in §4.2/§4.2.2) are part of the required set or remain open items as
> stated there. Beyond §4.1 and §4.2 **no** further privilege is supported by the citations
> supplied to this lane, and the least-privilege boundary in §5 is asserted only as the
> **declared** requirement: whether the proposed role actually behaves as this matrix requires has
> **not** been verified — live PostgreSQL privilege behaviour for `hub_web_app` remains untested
> (B1 "Untested areas carried forward").

## 6. Resulting required-privilege summary for `hub_web_app`

```
SCHEMA     USAGE on public
SEQUENCES  USAGE on backing identity sequences of:
           products.id, product_assets.id, product_installations.id
TYPES      USAGE on exactly four enum types:
             product_status
             asset_type
             installation_status
             installation_source
TABLES     public.products              -> SELECT, INSERT
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
  USAGE on the user_role enum type               (NO - belongs to excluded profiles)
  any privilege on public.profiles               (NO - excluded)
```

```
OPEN VERIFICATION ITEMS (not privileges; must be resolved before R15 apply):
  OV-1  whether FK referential-integrity checks for
        product_assets.uploadedBy -> profiles.id and
        product_installations.recordedBy -> profiles.id
        succeed with NO privilege on public.profiles   (see S4.2.2)
  OV-2  live PostgreSQL privilege behaviour of the proposed
        hub_web_app role (declared matrix not yet exercised)
```

## 7. Citation provenance

| Citation pack section | Used in |
|---|---|
| B — production vs local entry | §2 |
| C — `public.profiles` not on the production direct-Postgres path | §3, §5 |
| D — production direct-Postgres object usage | §4.1, §5 |
| E — absent operations | §5 |
| F.1 — sequence privileges | §4.2, §6 |
| F.2 — enum types (CORRECTED; `user_role` EXCLUDED) | §4.2, §4.2.1, §5, §6 |
| F.3 — indexes and foreign keys (incl. FK caveat) | §4.2, §4.2.2 |
| K-1 — erratum: previous `user_role` inclusion corrected at source | §4.2.1 |

Sections A, G, H, I, J of the citation pack were **not** used by this lane, per the work-unit
authority ("Use the CORRECTED citation pack section F (F.1/F.2/F.3) and sections B, C, D, E").

Note recorded by this lane (provenance hygiene, not a privilege statement): the previous revision of
this artifact declared the citation pack blob as `b8a4994254af0660bfcad661d9200c1f7c30f0c7`. The
pack read by this lane hashes to `cda6c5d063465a24bfd8e926b36c20e79b0dc872` and is the file as
committed at revision `650daed`, consistent with the pack having been rewritten in that commit
(B1 outcome: "Fix applied at source: citation pack §F rewritten into F.1/F.2/F.3").

## 8. B1 findings addressed by this regeneration

| Finding | Disposition in this artifact |
|---|---|
| **BLK-1** — `user_role` wrongly included in the required type privileges | Addressed. The granted enum set is exactly `product_status`, `asset_type`, `installation_status`, `installation_source` (§4.2, §4.2.1, §6). `user_role` appears only as an explicit EXCLUSION/denial (§4.2.1, §5, §6), never as a granted type. No grant of `user_role` exists anywhere in this document. |
| **Unsupported claim** — "Only the operations listed in §4.1 are required" | **REMOVED as an operative assertion** and replaced with the accurate statement in §5 ("REMOVED CLAIM — replaced by an accurate statement"), which no longer asserts that §4.1 is the complete required set. The phrase survives only as a labelled quotation of the withdrawn text. |
| **Untested area** — FK checks involving `public.profiles` without profile privilege | Addressed. Stated as open live-verification item OV-1 in §4.2.2 and §6 — explicitly **not** a granted privilege, and no `public.profiles` privilege is granted on its account. |
| BLK-2 / BLK-3 (billing denial matrix) | **Out of scope for this work unit.** Those findings belong to `T1-WU04-B-BILLING-DENY-MATRIX` (per `B1-REVIEW-OUTCOME-2026-09-20.md`, "Remedy"). Not touched here. |
| NB-1 (WU-05 attribution) | Out of scope for this work unit; fixed at citation-pack source per the B1 outcome. |

## 9. Declarations

- **Citations copied, not re-derived.** Every `file:line` above is copied verbatim from
  `T1-CITATION-PACK.md` sections B, C, D, E and corrected section F (F.1/F.2/F.3). No source file
  was re-read to produce this matrix and no citation was re-verified or re-derived by this lane.
- **No production mutation occurred.** This work unit produced one documentation file under
  `docs/platform/house-long-run/` (an overwrite of the existing
  `T1-R15-PUBLIC-PRIVILEGE-MATRIX.md`). No database connection was opened, no role created or
  altered, no grant or revoke issued, no migration run, no secret read or printed, and no file
  outside `docs/platform/house-long-run/` was written.
- **No approval is implied.** This is a normalized evidence-preparation record. It is not a grant
  script, not a review PASS, and not a production-readiness claim. Verification of this artifact
  and any final PASS belong to the commander and independent review.
