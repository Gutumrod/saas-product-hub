-- H5 — BK01 + MT01 preservation probes. SELECT ONLY. WSTERA LAB.
-- Proves House H3D/H3E/H3F/H4 work caused no collateral change. Do NOT run any
-- BK01 bootstrap or MT01 repair from this file.

-- ============ BK01 / local_service ============

-- B1: schema owner + structural counts (compare to H1 / baseline inventory:
--     local_service = postgres / 21 tables / 61 functions / 26 policies / 61 indexes / 35 FKs).
SELECT 'local_service' AS schema, pg_get_userbyid(n.nspowner) AS owner,
  (SELECT count(*) FROM pg_class c WHERE c.relnamespace=n.oid AND c.relkind IN ('r','p')) AS tables,
  (SELECT count(*) FROM pg_proc p WHERE p.pronamespace=n.oid) AS functions,
  (SELECT count(*) FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid WHERE c.relnamespace=n.oid) AS policies,
  (SELECT count(*) FROM pg_class c WHERE c.relnamespace=n.oid AND c.relkind='i') AS indexes,
  (SELECT count(*) FROM pg_constraint c JOIN pg_class r ON r.oid=c.conrelid WHERE r.relnamespace=n.oid AND c.contype='f') AS fks
FROM pg_namespace n WHERE n.nspname='local_service';

-- B2: no bk01_* role exists (post Junction-A-rollback baseline).
SELECT rolname FROM pg_roles WHERE rolname ~ '^bk01_' ORDER BY rolname;  -- expect 0 rows

-- B3: local_service_internal must NOT exist (removed at Junction A rollback).
SELECT to_regnamespace('local_service_internal') AS local_service_internal;  -- expect NULL

-- B4: the known-open Advisor finding is still exactly one secdef view.
SELECT n.nspname, c.relname
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE c.relkind='v' AND n.nspname='local_service'
  AND NOT COALESCE(EXISTS (SELECT 1 FROM unnest(c.reloptions) o WHERE o ILIKE 'security_invoker=on'), false)
ORDER BY c.relname;  -- expect exactly: shop_public_profile

-- B5: safe read-only Booking probe — is_shop_member resolves (regression guard
--     from the Junction A failure: this failed 42501 when ownership was moved).
SELECT local_service.is_shop_member('00000000-0000-0000-0000-000000000000'::uuid) AS is_shop_member_probe; -- expect false, NOT an error

-- B6: local_service function owner distribution (Junction A moved 58 to bk01_migrator; must be back to postgres).
SELECT pg_get_userbyid(p.proowner) AS owner, count(*)
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='local_service' GROUP BY 1 ORDER BY 1;  -- expect: postgres 61

-- ============ MT01 ============

-- M1: schema owners + counts (baseline: mt01 postgres 6/2/6/12/7, mt01_private postgres 0/2/0/0/0).
WITH t(s) AS (VALUES ('mt01'),('mt01_private'))
SELECT t.s AS schema, pg_get_userbyid(n.nspowner) AS owner,
  (SELECT count(*) FROM pg_class c WHERE c.relnamespace=n.oid AND c.relkind IN ('r','p')) AS tables,
  (SELECT count(*) FROM pg_proc p WHERE p.pronamespace=n.oid) AS functions,
  (SELECT count(*) FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid WHERE c.relnamespace=n.oid) AS policies,
  (SELECT count(*) FROM pg_class c WHERE c.relnamespace=n.oid AND c.relkind='i') AS indexes,
  (SELECT count(*) FROM pg_constraint c JOIN pg_class r ON r.oid=c.conrelid WHERE r.relnamespace=n.oid AND c.contype='f') AS fks
FROM t JOIN pg_namespace n ON n.nspname=t.s ORDER BY t.s;

-- M2: no mt01_* custom role (baseline).
SELECT rolname FROM pg_roles WHERE rolname ~ '^mt01_' ORDER BY rolname;  -- expect 0 rows

-- M3: the 4 MT01 global migration rows are still present and unchanged.
SELECT version, name FROM supabase_migrations.schema_migrations
WHERE name LIKE 'mt_mp_02%' ORDER BY version;
-- expect: 20260908083054 mt_mp_02_persistence_reference
--         20260908083145 mt_mp_02_explicit_server_only_deny
--         20260908083459 mt_mp_02_atomic_claims
--         20260908084606 mt_mp_02_verification_probe_20260908

-- ============ shared ============

-- S1: no h4_* residue (after H4 teardown).
SELECT rolname FROM pg_roles WHERE rolname ~ '^h4_';                    -- expect 0
SELECT to_regnamespace('h4_probe') AS h4_probe;                        -- expect NULL
SELECT to_regclass('wstera_platform_internal.h4_runtime_token_grants') AS h4_grants; -- expect NULL

-- S2: ps01 H3C contract intact.
SELECT to_regclass('wstera_platform_internal.runtime_token_grants') IS NOT NULL AS ps01_grants_table,
       (SELECT count(*) FROM wstera_platform_internal.runtime_token_grants) AS ps01_grant_rows,  -- expect 0
       EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
               WHERE n.nspname='wstera_platform_internal' AND p.proname='custom_access_token_hook') AS ps01_hook_fn;
