# H3F — Re-Measure Shared Surfaces (PREPARED / NOT RUN)

**Date prepared:** 2026-09-09
**Environment:** WSTERA LAB (`ykxlqnshaaxmzzocpjlj`) — Production LOCKED
**Status:** `PREPARE-ONLY — RUN ONLY AFTER H3E POST-APPLY IS CLEAN`
**Entry gate (brief §9):** H3D PASS + H3E applied and post-apply-verified.

## Source-of-Truth References

1. Brief §9
2. `tools/shared-runtime/inventory/lab-readonly-inventory.mjs` (runner)
3. `tools/shared-runtime/inventory/compare-inventory.mjs` (comparator)
4. `docs/platform/shared-runtime/evidence/H3D-BASELINE-INVENTORY-2026-09-09.json` (post-H3C reference, signature `fe40aa79c90e513a98359c787c7dc27656e494400a9b070fb29abf624f27059c`)
5. `docs/platform/shared-runtime/evidence/H3F-EXPECTED-DELTA-MANIFEST-2026-09-09.json`
6. `docs/platform/shared-runtime/evidence/H1-EFFECTIVE-PRIVILEGE-INVENTORY-2026-09-08.md` (H1 reference — compare counts/owners, NOT hashes across algorithms)

## Procedure (fill after H3E)

```
KEYS=D:/AI-Workspace/.secrets/keys.txt
PW=$(grep -m1 '^SUPABASE_DB_PASSWORD_WSTERA_LAB=' "$KEYS" | cut -d= -f2-)
ENC=$(node -e 'process.stdout.write(encodeURIComponent(process.argv[1]))' "$PW")
export LAB_DB_URL="postgresql://postgres.ykxlqnshaaxmzzocpjlj:${ENC}@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
export INVENTORY_OUT="docs/platform/shared-runtime/evidence/H3F-SHARED-SURFACE-SNAPSHOT-2026-09-09.json"
export INVENTORY_LABEL="H3F post-H3E remeasure"
node tools/shared-runtime/inventory/lab-readonly-inventory.mjs
unset LAB_DB_URL
node tools/shared-runtime/inventory/compare-inventory.mjs \
  docs/platform/shared-runtime/evidence/H3D-BASELINE-INVENTORY-2026-09-09.json \
  docs/platform/shared-runtime/evidence/H3F-SHARED-SURFACE-SNAPSHOT-2026-09-09.json \
  docs/platform/shared-runtime/evidence/H3F-EXPECTED-DELTA-MANIFEST-2026-09-09.json
echo "compare exit=$?"   # 0 = ok to proceed; 3 = STOP, unexplained delta
```

## Required measurements (brief §9) — captured by the runner

| Surface | Runner field | Baseline value |
|---|---|---|
| product role attributes/memberships/effective privileges | `roles`, `memberships`, `effective_authority` | ps01_line_runtime NOLOGIN/NOINHERIT, USAGE ps01 only, net USAGE (known PUBLIC leak); ps01_runtime_login LOGIN+password (until H3E) |
| schema owners + object counts | `schema_counts` | local_service postgres 21/61/26/61/35 · ps01 ps01_migrator 21/92/16/58/32 · ps01_internal ps01_migrator 1/0/0/1/0 · mt01 postgres 6/2/6/12/7 · mt01_private postgres 0/2/0/0/0 · wstera_platform_internal postgres 1/1/0/1/0 |
| function EXECUTE visibility + SECURITY DEFINER surfaces | `ps01_v2_gateway`, `security_definer_surfaces`, `secdef_function_counts`, `net_bridges` | ps01 v2 gateway: 3 fns, line_runtime EXECUTE true, anon/authenticated false. secdef views: only `local_service.shop_public_profile`. anon secdef fns: local_service 10, ps01 0. net bridges: none. |
| managed net/cron/storage/auth PUBLIC ACLs | `public_managed_acls` | 18 rows (the H1 pg_net PUBLIC surface + cron SELECT/DELETE) — must be byte-identical |
| Data API exposed schemas | `global[0].data_api_schemas` | `public, graphql_public, local_service, ps01` |
| Storage buckets | `global[0].storage_bucket_ids` | `["deposit-slips","ps01-daily-report-photos"]` (count 2) |
| cron jobs | `global[0].cron_job_names` | 8: daily-evening, daily-morning, task-0900/1030/1130/1300/1330/2000 |
| extensions | `extensions` | 8: btree_gist 1.7, pg_cron 1.6.4, pg_net 0.20.3, pg_stat_statements 1.11, pgcrypto 1.3, plpgsql 1.0, supabase_vault 0.3.1, uuid-ossp 1.1 |
| global migration ledger | `global[0].global_migration_count` / `latest_...` | 41 / `20260909013819 h3c_ps01_request_helpers_search_path_hardening` |

## Expected H3-family deltas (must each be explained — brief §9)

| Delta | Phase | Explanation |
|---|---|---|
| `ps01_line_runtime` role + 3 RPC EXECUTEs + authenticator SET-membership | H3B | `h3_ps01_line_runtime_boundary` (ledger 38) |
| `wstera_platform_internal` schema + `runtime_token_grants` + `custom_access_token_hook` | H3C | `h3c_auth_runtime_token_support` (ledger 39) |
| `public.rls_auto_enable()` EXECUTE removed from anon/authenticated/service_role/ps01_line_runtime | H3C (H-08) | `h3c_public_rls_auto_enable_acl_hardening` (ledger 40) |
| `ps01.ps01_request_*` helper search_path pinned; `ps01_request_user_id()` EXECUTE removed | H3C | `h3c_ps01_request_helpers_search_path_hardening` (ledger 41) |
| PS01 Customer LINE app path moved to Data API adapter | H3D | source-only (PS01 branch); no LAB delta |
| `ps01_runtime_login` LOGIN true->false, password true->false; +1 ledger row | H3E | `h3e_ps01_runtime_login_retirement` |

Any delta not in this table = **unexplained**. H3F FAILS.

## Known-open, NOT H3-attributable (must still be present, unchanged)

- `local_service.shop_public_profile` SECURITY DEFINER view (Advisor ERROR) — BK01 quarantine scope.
- 10 `local_service` anon-EXECUTE SECURITY DEFINER functions — pre-existing BK01 broad-RPC surface.
- `net` PUBLIC ACL (schema USAGE + write on `net._http_response` / `net.http_request_queue` / seq) reachable by every `ps01_*` role — the H1 defect, neutralised at the execution boundary by H2, not by ACL.

## Comparator limitation (record for the reviewer)

`compare-inventory.mjs` matches deltas against manifest **path prefixes**. A manifest entry like `queries.roles` auto-explains any change under it. The reviewer MUST read the printed EXPLAINED list and confirm each row change is exactly the one named in the manifest `reason` (e.g. only `ps01_runtime_login` `rolcanlogin`/`password_present`), not a different role or attribute.

## Verdict field (fill after run)

- signature baseline: `fe40aa79c90e513a98359c787c7dc27656e494400a9b070fb29abf624f27059c`
- signature post-H3E: `____`
- comparator exit: `____`
- unexplained deltas: `____`
- migration ledger rows added by House during H3 (exact): `____`
- **H3 verdict:** `____ (PASS/CLOSED only if H3D + H3E + H3F all pass and evidence set complete)`
