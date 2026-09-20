# T1-WU01 CARRY-FORWARD FINDINGS (timeout decomposition input)

Source: swarm lane `t1-wu01` (worker `swarm-inspector`, capability `inspection`)
Lane outcome: worker self-report `FAIL` — inspection COMPLETED but the write step was not
reached because the tool-iteration budget (max_turns=12) was exhausted. Lane state field
reported `SWARM_WORK_UNIT_PASS` with `artifacts: []`; commander-authoritative reading is
**NOT PASS** (acceptance checks require the document, which does not exist).

Disposition: Run Manifest permits `Timeout Decomposition` ("each WU is separately resumable;
no blind replay"). WU-02 is therefore dispatched as a separate `evidence_preparation` lane
whose only job is to write the canonical document. WU-01 is not blindly replayed.

WARNING TO THE WU-02 WORKER: the block below is a **truncated** excerpt (~8.1 KB of an
11.3 KB report). Treat it as a lead, not as evidence. Re-verify every claim you carry into
the deliverable against the actual source file:line. Any claim you cannot re-verify must be
omitted or explicitly marked unverified.

---

STATE: FAIL

SUMMARY: The read-only inspection was completed and the actual hub-web database access path was fully determined from source with file:line evidence, but the one required deliverable — a new markdown inventory document under `docs/platform/house-long-run/` — was NOT created, because the tool-iteration budget was exhausted before the write step. The unit therefore does not satisfy its acceptance checks and must be re-dispatched to perform only the document write using the evidence below.

Note: the stop condition `SWARM_BLOCKED` does NOT apply — the DB access path WAS determinable from source. This is an incomplete-work FAIL, not a blocked unit.

COMMANDS: (read-only; no mutating command was run)

```
cd D:/AI-Workspace/projects/saas-product-hub && git rev-parse HEAD && git status --porcelain | head -50
  exit 0
  -> c2aeeb524283218b5c35a0c4271d971061758069
  -> ?? docs/platform/shared-runtime/BRIEF-HOUSE-SELL-READY-LONG-RUN-2026-09-16.md
     ?? docs/platform/shared-runtime/RUN-MANIFEST-HOUSE-SELL-READY-LONG-RUN-2026-09-16.md
     ?? docs/platform/shared-runtime/TASK-HOUSE-SHARED-RUNTIME-ISOLATION-001.md
```
The 3 untracked files are the pre-existing untracked set recorded in the session-start workspace snapshot (`Status: 3 untracked`); they are not mine. Revision matches the packet revision `c2aeeb5`.

Non-shell inspection tools used (all read-only, exit 0 / no error): `read_file` on db.ts, _core/env.ts, _core/runtime-env.ts, _core/supabaseAdmin.ts, _core/profileStore.ts, _core/context.ts, _core/context.fetch.ts, control-plane/adapters/control-db.ts, drizzle/schema.ts, drizzle.config.ts, wrangler.jsonc, package.json, worker.ts, _core/index.ts, webhooks/productEvents.ts, webhooks/agentEvents.ts, storage.ts, all 6 migration files, RUN-MANIFEST-WSTERA-HOUSE-PRODUCTION-CLOSURE-001.md, docs/CURRENT_STATUS.md, PORTFOLIO_PRODUCTION_MASTER_PLAN.md:885-924, BILLING_CORE_PHASE_0_5_SECURITY_CONTRACTS.md:40-159; `search_files` for `createClient`, `getSupabaseAdmin`, `from(`, `db.js`, `billing_core`, `hub_web_app`, `SUPABASE_*`/`WSTERA_CONTROL_*`/`DATABASE_URL`, `*` under drizzle/ and house-long-run/.

RESULT — observed findings (each backed by a concrete file:line):

1. Actual DB access path — TWO paths, determined without ambiguity.

Path A — direct Postgres connection (Project A, hub-web product DB), used for all `public`-schema reads/writes:
- `apps/hub-web/server/db.ts:1-3` imports `drizzle-orm/postgres-js`, `postgres`.
- `apps/hub-web/server/db.ts:20` lazily cached `_db`; `:23-34` `getDb()` = `postgres(ENV.databaseUrl, { prepare: false })` wrapped in `drizzle(client)`; returns `null` when the URL is absent.
- `apps/hub-web/server/db.ts:18` → `apps/hub-web/server/_core/env.ts:5` `get databaseUrl() { return getRuntimeEnvString("DATABASE_URL"); }`
- `apps/hub-web/server/_core/runtime-env.ts:11-15` `getRuntimeEnvString` = Worker binding first, else `process.env[name] ?? ""`.
- Consumed at `apps/hub-web/server/_core/context.ts:3,48,54`; `apps/hub-web/server/webhooks/productEvents.ts:2,93,99`; `apps/hub-web/server/routers.ts:12-18,350,353,380,398,411`.

Path B — Supabase PostgREST clients (Data API):
- Product project: `apps/hub-web/server/_core/supabaseAdmin.ts:9-21` `createClient(ENV.supabaseUrl, ENV.supabaseServiceRoleKey)` (env.ts:6-7).
- Control project: `apps/hub-web/server/control-plane/adapters/control-db.ts:13-20` `createClient(ENV.wsteraControlSupabaseUrl, ENV.wsteraControlSecretKey)` (env.ts:13-14).

2. Exact required Postgres privilege inventory for Path A (public schema only).

Read (SELECT) required by `db.ts`:
- `public.profiles` — `db.ts:100` (`select ... from profiles where id = ... limit 1`)
- `public.products` — `db.ts:111` (order by `sortOrder`,`createdAt`), `db.ts:121`, `db.ts:138`
- `public.product_assets` — `db.ts:149-153`
- `public.product_installations` — `db.ts:178-182`, `db.ts:185`

Insert required:
- `public.profiles` — `db.ts:83-86` `insert ... onConflictDoUpdate({ target: profiles.id, set })`
- `public.products` — `db.ts:129` `.returning()`
- `public.product_assets` — `db.ts:160` `.returning()`
- `public.product_installations` — `db.ts:197-200` `.returning()`; `db.ts:236-251` `onConflictDoNothing({ target: [productId, externalEventId] }).returning()`

Update required:
- `public.product_installations` — `db.ts:212-216` `.set({ status, updatedAt }).returning()`

Objects the runtime must NOT need: no `CREATE`/`ALTER`/`DROP` anywhere in server code; no `DELETE` anywhere in server code; no ownership.

Sequence privileges: `products.id` and `product_assets.id` and `product_installations.id` are `generatedAlwaysAsIdentity()` (`drizzle/schema.ts:61,90,128`) → identity sequences require `USAGE` on the backing sequences for INSERT.

Schema `USAGE`: required on `public`.

Enums referenced by columns (`drizzle/schema.ts:12-34`): `user_role`, `product_status`, `asset_type`, `installation_status`, `installation_source` — needed for insert/update/select of those columns.

Foreign keys that constrain runtime writes: `product_assets.productId → products.id ON DELETE CASCADE` (`schema.ts:91-93`), `product_assets.uploadedBy → profiles.id ON DELETE RESTRICT` (`:100-102`), `product_installations.productId → products.id ON DELETE CASCADE` (`:129-131`), `product_installations.recordedBy → profiles.id ON DELETE SET NULL` (`:142`).

Unique indexes the runtime relies on for conflict targets: `products_slug_unique` (`schema.ts:76`), `product_assets_product_storage_unique` (`:106-109`), `product_installations_event_unique` (`:152-155`) — required for `ON CONFLICT (id)` / `(productId, externalEventId)` to resolve.

3. Migrations inspected and their DDL scope:
- `drizzle/migrations/0001_rbac_roles.sql` — `:12-15` ALTER TYPE `user_role` ADD VALUE (wstera_customer/support/operator/owner); `:22` `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY`; `:30-33` `profiles_self_read` TO authenticated USING `auth.uid() = id`; `:36-45` `profiles_internal_read`; `:48-52` `profiles_service_write` FOR ALL TO `service_role` USING true.
- `drizzle/migrations/0002_control_plane_schema.sql` — Control project; enums `:12-17,:45-49,:73,:96-98`; tables `work_queue_items :19-37`, `owner_inbox_items :51-65`, `portfolio_gates :75-91`, `agent_activity_events :100-110`; RLS enabled `:123-126`; `service_role` policies `:129-132`.
- `drizzle/migrations/0003_work_tracking_truth_pipeline.sql` — additive columns `:25-37`, indexes `:40-42`.
- `drizzle/migrations/0004_add_unmapped_to_work_item_status.sql` — `:22` `ALTER TYPE "public"."work_item_status" ADD VALUE IF NOT EXISTS 'unmapped'`.
- `drizzle/migrations/0005_atomic_work_event_rpc.sql` — `:27-28` `owner_inbox_items.source_event_id`; `:32-34` unique partial index; `:36-207` `ingest_agent_work_event_atomic(...) SECURITY DEFINER SET search_path = pg_catalog, public`; `:214-228` REVOKE EXECUTE FROM PUBLIC/anon/authenticated; `:234-237` GRANT EXECUTE TO `service_role`.
- `drizzle/migrations/0006_canonical_product_id_work_truth.sql` — `:26-27` `work_queue_items.product_id`; `:29-30` index; `:32-258` function replace; `:265-288` same REVOKE/GRANT shape.

All six migration files target `public` (0001) or the separate Control project (0002-0006); none reference `billing_core`. `drizzle.config.ts:3` requires `process.env.DATABASE_URL`; `:8-15` `dialect: "postgresql"`, `schema: "./drizzle/schema.ts"`, `out: "./drizzle"`, `dbCredentials.url = connectionString`.

4. Runtime identity fact: `apps/hub-web/wrangler.jsonc:3-11` deploys `hub-web` at `server/worker.ts` bound to `wstera.com` and `platform.wstera.com`; the file declares **no** `vars` and **no** secret bindings, so `DATABASE_URL` / `SUPABASE_*` / `WSTERA_CONTROL_*` are delivered as Worker secrets (`keep_vars: true`, `:7`), read via `runtime-env.ts:11-15`.

5. R15 authority captured (for the implementation plan section):
- `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md:896` — R15: runtime connects as Project A `postgres` **owner** (`postgres.coyelzlgukvpgguqpjdi` pooler); control = move to a dedicated `hub_web_app` **login role** scoped to exactly the `public` objects used — **no ownership, no `CREATE`, no
[TRUNCATED: original_bytes=11336 limit=8192]
