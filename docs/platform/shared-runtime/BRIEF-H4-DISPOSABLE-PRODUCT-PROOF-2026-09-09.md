# BRIEF — H4 Disposable Product Negative-Probe Gate (execution design)

**Date:** 2026-09-09 (Asia/Bangkok)
**Environment:** WSTERA LAB (`ykxlqnshaaxmzzocpjlj`) only — Production LOCKED
**Status:** `DESIGN PREPARED — DO NOT APPLY BEFORE H3 (H3D+H3E+H3F) PASS/CLOSED` (brief §10)
**Entry gate:** H3 PASS/CLOSED. BK01 must NOT be the H4 test product.

## Source-of-Truth References

1. Parent brief §10, §13
2. `docs/platform/shared-runtime/DESIGN-H2-SHARED-RUNTIME-ISOLATION-EXECUTION-BOUNDARY-2026-09-08.md` (H4)
3. `docs/platform/shared-runtime/ADDENDUM-CLAUDE-PREPARE-UNTIL-OPERATOR-ACTION-2026-09-09.md`
4. Forward: `docs/platform/shared-runtime/migrations/h4_disposable_product_forward.sql`
5. Rollback/teardown: `docs/platform/shared-runtime/migrations/h4_disposable_product_rollback.sql`
6. Harness: `tools/shared-runtime/h4/h4-probe-harness.mjs` (+ `--selftest`, PASS)
7. Privilege snapshot: `tools/shared-runtime/h4/h4-privilege-snapshot.sql`
8. Evidence template: `docs/platform/shared-runtime/evidence/H4-DISPOSABLE-PRODUCT-PROOF-2026-09-09.md`

## 1. Disposable namespace + roles

| Object | Name | Shape |
|---|---|---|
| product schema | `h4_probe` | owned by `h4_migrator`; `REVOKE ALL ... FROM PUBLIC` |
| migrator/owner role | `h4_migrator` | NOLOGIN NOINHERIT; no DB-wide CREATE; authority limited to `h4_probe` |
| runtime role | `h4_runtime` | NOLOGIN NOINHERIT; `USAGE` on `h4_probe`; `EXECUTE` on exactly one function; no table DML; no direct DB login credential |
| product-local table | `h4_probe.notes` | owned by `h4_migrator` |
| the one product-local migration op | `h4_probe.h4_migrate_note(text)` | SECURITY DEFINER, `search_path=h4_probe,pg_temp`; inserts a note; executed via the platform lane / migrator authority |
| the one allowlisted runtime op | `h4_probe.h4_echo(text)` | SECURITY DEFINER, `search_path=h4_probe,pg_temp`; returns `'h4:'||text`; the only `h4_runtime` EXECUTE |

`GRANT h4_runtime TO authenticator WITH INHERIT FALSE, SET TRUE` — PostgREST SET ROLE path only.

## 2. Token issuance plan (separate from the ps01 contract — brief §10)

H4 gets its **own** support layer, not a widening of the H3C `runtime_token_grants` CHECK:
- `wstera_platform_internal.h4_runtime_token_grants` — `CHECK (database_role = 'h4_runtime')`, revoked from every app/product role, SELECT to `supabase_auth_admin` only.
- `wstera_platform_internal.h4_custom_access_token_hook(jsonb)` — SECURITY INVOKER, stamps `role=h4_runtime` + caps `exp` at ≤5 min, only for an enabled/valid grant row.

Both are created by the forward migration and **fully removed** by the rollback. The hosted Custom Access Token Hook (single slot) is pointed at `h4_custom_access_token_hook` by the operator only during H4, then disabled.

## 3. Data API exposure plan

`h4_probe` must be temporarily added to `pgrst.db_schemas` for the runtime probe. This is a **platform-lane / operator** change (Dashboard → Settings → API → Exposed schemas, or a tightly scoped `ALTER ROLE authenticator SET pgrst.db_schemas = 'public, graphql_public, local_service, ps01, h4_probe'` + `NOTIFY pgrst, 'reload config'`).

- capture exact pre-state: `public, graphql_public, local_service, ps01`
- add **only** `h4_probe`
- teardown restores the exact pre-state string
- the disposable product itself has zero ability to change this (verified by `NEG-*` probes + `h4-privilege-snapshot.sql` → `runtime_migration_insert=false`, `runtime_public_create=false`)

## 4. Positive proof (brief §10 — both required)

1. **product-local migration authority**: through the platform postgres session `SET ROLE h4_migrator`, `SELECT h4_probe.h4_migrate_note('h4-forward-proof')` succeeds and a row lands in `h4_probe.notes`; the same call `SET ROLE h4_migrator` against `ps01.*` / `local_service.*` / `mt01.*` fails.
2. **runtime token**: a ≤5-min Auth-issued `role=h4_runtime` token invokes `POST /rest/v1/rpc/h4_echo` and reaches the function boundary (harness `POS-ECHO`), and `POS-GRANTS` confirms from a fresh snapshot: exactly 1 EXECUTE (`h4_echo`), 0 table writes, no foreign-schema USAGE.

Denying everything is not a PASS — `POS-ECHO` + the migrator positive op must both work.

## 5. Negative matrix (brief §10) — harness `NEG-*` + SQL

Runtime/migrator boundary must fail closed on:

| Probe | Target | Harness id |
|---|---|---|
| BK01 `local_service` object | `GET /rest/v1/shop_public_profile` profile `local_service` | `NEG-LS` |
| PS01 / `ps01_internal` object | `GET /rest/v1/bookings` `ps01`; `.../booking_occupancy` `ps01_internal` | `NEG-PS01`, `NEG-PS01-INT` |
| MT01 / `mt01_private` object | `GET /rest/v1/tenants` `mt01` | `NEG-MT` |
| ungranted fn in own schema | `POST /rest/v1/rpc/h4_migrate_note` `h4_probe` | `NEG-H4-MIGRATE` |
| direct own-table write | `POST /rest/v1/notes` `h4_probe` | `NEG-H4-TBL` |
| net work | `GET /rest/v1/http_request_queue` `net` | `NEG-NET` |
| shared cron | `GET /rest/v1/job` `cron` | `NEG-CRON` |
| auth / storage metadata | `GET /rest/v1/users` `auth`; `GET /storage/v1/bucket` | `NEG-AUTH`, `NEG-STOR` |
| extensions | `GET /rest/v1/anything` `extensions` | `NEG-EXT` |
| platform internal | `GET /rest/v1/runtime_token_grants` `wstera_platform_internal` | `NEG-WPI` |
| create roles / db-wide privs / create in public / alter Data API config / write global migration history | SQL: `h4-privilege-snapshot.sql` booleans all false; `SET ROLE h4_migrator` + `CREATE ROLE`/`CREATE TABLE public.x`/`INSERT supabase_migrations.schema_migrations` all raise `42501` | (SQL section of evidence) |
| direct product DB login | none exists — `h4_runtime`/`h4_migrator` are NOLOGIN, no credential provisioned | (SQL) |
| foreign / expired / tampered tokens | `NEG-EXP`, `NEG-SIG`, `NEG-KEY`, `NEG-ANON` |

For managed surfaces not Data-API-exposed, an explicit 401/403/404 or `PGRST106` routing denial is valid; a bare 5xx/transport error is **not** (harness `failsClosed` / H-04).

## 6. Cleanup order (brief §10 teardown)

1. delete the disposable Auth identity + its sessions (operator);
2. remove the `h4_runtime_token_grants` row (operator / SQL);
3. disable the hosted hook; wait past the last token `exp` (record it) or prove rejection;
4. restore the exact pre-H4 `pgrst.db_schemas` string; reload;
5. `psql -f h4_disposable_product_rollback.sql` — drops hook fn + grant table, revokes authenticator membership, `DROP SCHEMA h4_probe CASCADE`, `DROP ROLE h4_runtime`, `DROP ROLE h4_migrator`; post-check asserts zero residue AND the ps01 H3C contract + `ps01_line_runtime` 3-EXECUTE boundary intact;
6. re-run `lab-readonly-inventory.mjs` → `compare-inventory.mjs` against `H3D-BASELINE-INVENTORY` (+ the H3E manifest entry) → signature back to the pre-H4 value, exit 0.

## 7. Expected baseline restoration

After teardown the shared-surface signature must equal the post-H3F value (no `h4_*` role, schema, grant, hook, Auth user, Data API entry, Storage/cron/extension change; global migration history contains only the reviewed H4 forward row + its rollback row, both retained as evidence — same pattern as `bk01_platform_bootstrap` / `_rollback`).

## 8. Hard stops (brief §10, §13)

- H4 before H3 PASS → STOP.
- H4 needs a direct DB LOGIN credential or product-controlled global migration authority → STOP (design gives neither).
- Broad Auth config push → STOP; field-level hook change with pre/post diff only.
- 5xx-only "denial" evidence → STOP.
- Any `h4_*` identity reaching `local_service` / `ps01*` / `mt01*` / `net` / `cron` / `auth` / `storage` / `extensions` / `wstera_platform_internal` outside the contract → STOP, rollback.
- Any unrelated BK01/MT01/shared delta → STOP.
