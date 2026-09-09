-- H4 rollback / teardown. WSTERA LAB only. Platform postgres session.
-- Removes every H4 object. Run in this order (brief §10 teardown).
-- Auth-side teardown (delete the disposable Auth identity + sessions, disable the
-- hosted hook, wait past the last token exp) is an OPERATOR action done BEFORE
-- this SQL — see OPERATOR-ACTION-PACK-H3D-TO-H5-2026-09-09.md.

DO $$
BEGIN
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION 'H4 rollback requires the platform postgres session.';
  END IF;
END $$;

-- 1. remove the token-support layer (parallel to the ps01 contract, never merged)
DROP FUNCTION IF EXISTS wstera_platform_internal.h4_custom_access_token_hook(jsonb);
DROP TABLE    IF EXISTS wstera_platform_internal.h4_runtime_token_grants;

-- 2. remove the PostgREST SET ROLE path
REVOKE h4_runtime FROM authenticator;

-- 3. drop the disposable schema (CASCADE removes h4_probe.notes + both functions)
DROP SCHEMA IF EXISTS h4_probe CASCADE;

-- 4. drop the roles (must be ownerless now)
DROP ROLE IF EXISTS h4_runtime;
DROP ROLE IF EXISTS h4_migrator;

-- 5. zero-residue post-check
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'h4_probe') THEN
    RAISE EXCEPTION 'H4 teardown: h4_probe schema still present.';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname IN ('h4_migrator','h4_runtime')) THEN
    RAISE EXCEPTION 'H4 teardown: h4_* role still present.';
  END IF;
  IF to_regclass('wstera_platform_internal.h4_runtime_token_grants') IS NOT NULL THEN
    RAISE EXCEPTION 'H4 teardown: h4_runtime_token_grants still present.';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'wstera_platform_internal' AND p.proname = 'h4_custom_access_token_hook'
  ) THEN
    RAISE EXCEPTION 'H4 teardown: h4_custom_access_token_hook still present.';
  END IF;
  -- the ps01 H3C contract must be untouched
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'wstera_platform_internal' AND p.proname = 'custom_access_token_hook'
  ) OR to_regclass('wstera_platform_internal.runtime_token_grants') IS NULL THEN
    RAISE EXCEPTION 'H4 teardown damaged the ps01 H3C token-support contract.';
  END IF;
  -- ps01_line_runtime still exactly bounded
  IF (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'ps01' AND has_function_privilege('ps01_line_runtime', p.oid, 'EXECUTE')) <> 3 THEN
    RAISE EXCEPTION 'H4 teardown: ps01_line_runtime EXECUTE count drifted.';
  END IF;
END $$;
