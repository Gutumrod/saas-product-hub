# T1 CITATION PACK — verified source citations for the R15 write-only lanes

Purpose: supply pre-verified `file:line` citations so the four write-only lanes do **not** re-derive
or re-verify anything. Lane workers must read this file, then write their assigned artifact.

Verified at revision: `61dcdfcc07f8ae5edd493fcde61568e2ef0ca51d`
Verified by: Hermes (orchestrator) + independent re-verification by `agent-codex` (T1 classification)
Authority for the RLS decision: `docs/platform/house-long-run/T1-RLS-DECISION-RECORD-2026-09-20.md`

> **Lane rule:** do not re-verify these citations. Copy them into your artifact. If a citation
> appears wrong, record it as a finding in your own report rather than re-deriving the whole matrix.

---

## A. Two database access paths

### Path A — direct Postgres (drizzle / postgres-js), `DATABASE_URL`
- `apps/hub-web/server/db.ts:1-3` — imports `drizzle-orm/postgres-js`, `postgres`
- `apps/hub-web/server/db.ts:20` — lazily cached `_db`
- `apps/hub-web/server/db.ts:23-34` — `getDb()` = `postgres(ENV.databaseUrl, { prepare: false })` + `drizzle(client)`; returns `null` when URL absent
- `apps/hub-web/server/db.ts:18` → `apps/hub-web/server/_core/env.ts:5` — `databaseUrl` = `getRuntimeEnvString("DATABASE_URL")`
- `apps/hub-web/server/_core/runtime-env.ts:11-15` — Worker binding first, else `process.env[name] ?? ""`

### Path B — Supabase PostgREST clients
- Product project: `apps/hub-web/server/_core/supabaseAdmin.ts:9-21` — `createClient(ENV.supabaseUrl, ENV.supabaseServiceRoleKey)`; env at `env.ts:6-7`
- Control project: `apps/hub-web/server/control-plane/adapters/control-db.ts:13-20` — `createClient(ENV.wsteraControlSupabaseUrl, ENV.wsteraControlSecretKey)`; env at `env.ts:13-14`

## B. Production vs local entry (Owner-verified architecture basis)

- `apps/hub-web/wrangler.jsonc:4` — `"main": "server/worker.ts"` (production Cloudflare entry)
- `apps/hub-web/wrangler.jsonc:8-10` — routes `wstera.com`, `platform.wstera.com`
- `apps/hub-web/server/worker.ts:4` — `import { createContext } from "./_core/context.fetch.js"`
- `apps/hub-web/server/worker.ts` — `createContext: () => createContext({ req: request })` in the tRPC fetch handler
- `apps/hub-web/server/_core/context.fetch.ts:4` — `import { syncProfileFromSupabase } from "./profileStore.js"`
- `apps/hub-web/server/_core/context.fetch.ts:16` — `resolveProfile: async user => (client ? syncProfileFromSupabase(client, user) : null)`
- `apps/hub-web/server/_core/context.fetch.ts:3` — imports `context.js` **as a type only** (`import type { TrpcContext }`)
- `apps/hub-web/server/_core/index.ts:7` — `import { createContext } from "./context.js"` (the only importer of the direct-Postgres context)
- `apps/hub-web/server/_core/index.ts:94-95` — "Local dev entry … Production runs on Cloudflare Workers via server/worker.ts instead — this file isn't deployed."

## C. `public.profiles` — production does NOT use the direct-Postgres path

- `apps/hub-web/server/db.ts:35` — `upsertProfile` definition
- `apps/hub-web/server/db.ts:93` — `getProfileById` definition
- `apps/hub-web/server/_core/context.ts:48` — `await db.upsertProfile({...})` (only caller)
- `apps/hub-web/server/_core/context.ts:54` — `await db.getProfileById(data.user.id)` (only caller)
- `apps/hub-web/server/_core/profileStore.ts:27-62` — production profile sync over PostgREST (`client.from("profiles")`, select/update/insert)

**Conclusion to state:** in production, `public.profiles` is reached only through the Supabase
PostgREST path (Path B), never through the direct-Postgres path (Path A). Therefore the production
direct-Postgres runtime does not require `public.profiles`.

## D. Production direct-Postgres object usage (what `hub_web_app` actually needs)

- `apps/hub-web/server/routers.ts:10-19` — imports from `./db.js`: `createProduct`, `createProductAsset`,
  `createProductInstallation`, `getProductBySlug`, `listProductAssets`, `listProductInstallations`,
  `listProducts`, `updateProductInstallationStatus`
- `apps/hub-web/server/webhooks/productEvents.ts:2` — imports `getProductBySlug`, `recordProductInstallationFromWebhook`

| Object | Required operations |
|---|---|
| `public.products` | SELECT, INSERT |
| `public.product_assets` | SELECT, INSERT |
| `public.product_installations` | SELECT, INSERT, UPDATE |
| `public.profiles` | **none in production** (excluded by Owner ruling) |

## E. Absent operations (must be stated as proof of least privilege)

- No `CREATE` / `ALTER` / `DROP` anywhere in `apps/hub-web/server/**`
- No `DELETE` anywhere in `apps/hub-web/server/**`

## F. Schema-derived requirements

- `apps/hub-web/drizzle/schema.ts:61,90,128` — `generatedAlwaysAsIdentity()` on `products.id`,
  `product_assets.id`, `product_installations.id` → INSERT requires `USAGE` on the backing sequences
- `apps/hub-web/drizzle/schema.ts:12-34` — enums referenced by those tables: `user_role`,
  `product_status`, `asset_type`, `installation_status`, `installation_source`
- `apps/hub-web/drizzle/schema.ts:76` — `products_slug_unique`
- `apps/hub-web/drizzle/schema.ts:106-109` — `product_assets_product_storage_unique`
- `apps/hub-web/drizzle/schema.ts:152-155` — `product_installations_event_unique`
  (the three unique indexes resolve the runtime's `ON CONFLICT` targets)
- Foreign keys constraining runtime writes: `schema.ts:91-93`, `:100-102`, `:129-131`, `:142`

## G. RLS state on `public.profiles` (Owner decision context)

- `apps/hub-web/drizzle/migrations/0001_rbac_roles.sql:22` — `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY`
- `.../0001_rbac_roles.sql:30-33` — `profiles_self_read` TO `authenticated`
- `.../0001_rbac_roles.sql:36-45` — `profiles_internal_read` TO `authenticated`
- `.../0001_rbac_roles.sql:48-52` — `profiles_service_write` TO `service_role`
- No `hub_web_app` policy exists anywhere.

## H. Migration inventory (DDL scope)

- `drizzle/migrations/0001_rbac_roles.sql` — Project A `public`: enum values `:12-15`, RLS `:22`, policies `:30-33`, `:36-45`, `:48-52`
- `drizzle/migrations/0002_control_plane_schema.sql` — **Control project**: enums `:12-17,:45-49,:73,:96-98`; tables `work_queue_items :19-37`, `owner_inbox_items :51-65`, `portfolio_gates :75-91`, `agent_activity_events :100-110`; RLS `:123-126`; `service_role` policies `:129-132`
- `drizzle/migrations/0003_work_tracking_truth_pipeline.sql` — additive columns `:25-37`, indexes `:40-42`
- `drizzle/migrations/0004_add_unmapped_to_work_item_status.sql` — `:22` enum value add
- `drizzle/migrations/0005_atomic_work_event_rpc.sql` — `:27-28`, `:32-34`, `:36-207` SECURITY DEFINER function, `:214-228` REVOKE, `:234-237` GRANT to `service_role`
- `drizzle/migrations/0006_canonical_product_id_work_truth.sql` — `:26-27`, `:29-30`, `:32-258`, `:265-288`
- None of the six reference `billing_core`.
- `drizzle.config.ts:3` requires `process.env.DATABASE_URL`; `:8-15` dialect `postgresql`, schema `./drizzle/schema.ts`, out `./drizzle`

## I. Deployment/config facts

- `apps/hub-web/wrangler.jsonc:3-11` — deploys Worker `hub-web` at `server/worker.ts`, routes `wstera.com` + `platform.wstera.com`
- `wrangler.jsonc` declares **no** `vars` and **no** secret bindings → `DATABASE_URL`, `SUPABASE_*`,
  `WSTERA_CONTROL_*` arrive as Worker secrets (`keep_vars: true` at `:7`), read via `runtime-env.ts:11-15`
- `apps/hub-web/package.json` scripts: `build` = `vite build && esbuild server/_core/index.ts …`, `cf:deploy` = `vite build && wrangler deploy`, `test` = `vitest run`, `check` = `tsc --noEmit`

## J. R15 authority

- `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md:896` — R15: runtime connects as Project A
  `postgres` **owner**; correct state = dedicated `hub_web_app` **login role** scoped to exactly the
  `public` objects used — no ownership, no `CREATE`, no escalating membership
