# H4 — Disposable Product Proof (TEMPLATE / NOT RUN)

**Environment:** WSTERA LAB (`ykxlqnshaaxmzzocpjlj`) — Production LOCKED
**Status:** `PREPARE-ONLY — RUN AFTER H3 PASS/CLOSED`
**Design:** `docs/platform/shared-runtime/BRIEF-H4-DISPOSABLE-PRODUCT-PROOF-2026-09-09.md`

## Artifacts
- forward: `migrations/h4_disposable_product_forward.sql`
- rollback: `migrations/h4_disposable_product_rollback.sql`
- harness: `tools/shared-runtime/h4/h4-probe-harness.mjs` (selftest: **PASS**, 2026-09-09)
- snapshot SQL: `tools/shared-runtime/h4/h4-privilege-snapshot.sql`

## Pre-state (fill)
- shared-surface signature before H4: `____` (from post-H3F inventory)
- `pgrst.db_schemas` before H4: `public, graphql_public, local_service, ps01`
- `h4_probe` / `h4_migrator` / `h4_runtime` absent: `____`

## Forward apply (fill)
- migration ledger row added: `____`
- forward post-checks: `____` (all pass / list failures)
- `pgrst.db_schemas` during H4: `public, graphql_public, local_service, ps01, h4_probe`

## Positive proof (fill)
- [ ] `SET ROLE h4_migrator; SELECT h4_probe.h4_migrate_note('h4-forward-proof');` → row id `____`
- [ ] same call against `ps01.*` / `local_service.*` / `mt01.*` → `42501` `____`
- [ ] harness `POS-ECHO` → `____` (boundary reached)
- [ ] harness `POS-GRANTS` → `____` (exec_count=1 h4_echo, write_count=0, foreign_schema_usage=false)

## Negative matrix (fill — from harness JSON + SQL)
| id | expected | result |
|---|---|---|
| NEG-H4-TBL | fail closed | `____` |
| NEG-H4-MIGRATE | fail closed | `____` |
| NEG-PS01 / NEG-PS01-INT | fail closed | `____` |
| NEG-LS | fail closed | `____` |
| NEG-MT | fail closed | `____` |
| NEG-WPI | fail closed | `____` |
| NEG-NET / NEG-CRON / NEG-AUTH / NEG-STOR / NEG-EXT | fail closed | `____` |
| NEG-EXP / NEG-SIG / NEG-KEY / NEG-ANON | 401 / fail closed | `____` |
| SQL: `SET ROLE h4_migrator` + `CREATE ROLE x` | `42501` | `____` |
| SQL: `SET ROLE h4_migrator` + `CREATE TABLE public.x()` | `42501` | `____` |
| SQL: `SET ROLE h4_migrator` + `INSERT supabase_migrations.schema_migrations` | `42501` | `____` |
| SQL: `SET ROLE h4_migrator` + `ALTER ROLE authenticator SET pgrst.db_schemas` | `42501` | `____` |
| SQL: `h4-privilege-snapshot.sql` → `migrator_db_create` / `runtime_db_create` / `runtime_public_create` / `runtime_migration_insert` | all false | `____` |
| direct DB login as `h4_runtime` / `h4_migrator` | no credential exists; auth fails | `____` |

## Teardown (fill — order from design §6)
- [ ] disposable Auth identity + sessions deleted
- [ ] `h4_runtime_token_grants` row removed; last token `exp` = `____`
- [ ] hosted hook disabled; waited past `exp` OR rejection proven
- [ ] `pgrst.db_schemas` restored to `public, graphql_public, local_service, ps01`
- [ ] `h4_disposable_product_rollback.sql` applied; post-check `____`
- [ ] post-teardown inventory signature == pre-H4 signature: `____`
- [ ] `compare-inventory.mjs` exit: `____`

## Verdict (fill)
`H4 ____` — PASS only after positive proof + every required negative probe + exact teardown/restoration all pass.
