-- H3C Auth-issued runtime token support — WSTERA LAB platform migration.
-- Inert after apply: no grant rows and no hosted Auth Hook activation.
-- Source: BRIEF-H3C-AUTH-ISSUED-RUNTIME-TOKEN-PROOF-2026-09-08.md

DO $$
BEGIN
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION 'H3C support migration requires platform postgres session.';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname='wstera_platform_internal') THEN
    RAISE EXCEPTION 'wstera_platform_internal already exists; refresh baseline before apply';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_roles
    WHERE rolname='ps01_line_runtime'
      AND NOT rolcanlogin
      AND NOT rolsuper
      AND NOT rolcreatedb
      AND NOT rolcreaterole
      AND NOT rolbypassrls
  ) THEN
    RAISE EXCEPTION 'H3B ps01_line_runtime boundary is missing or unsafe';
  END IF;
END $$;

CREATE SCHEMA wstera_platform_internal AUTHORIZATION postgres;
REVOKE ALL ON SCHEMA wstera_platform_internal FROM PUBLIC;

CREATE TABLE wstera_platform_internal.runtime_token_grants (
  user_id uuid PRIMARY KEY,
  database_role text NOT NULL CHECK (database_role = 'ps01_line_runtime'),
  enabled boolean NOT NULL DEFAULT false,
  valid_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (valid_until IS NULL OR valid_until > created_at)
);
REVOKE ALL ON TABLE wstera_platform_internal.runtime_token_grants
FROM PUBLIC, anon, authenticated, service_role, authenticator,
     ps01_migrator, ps01_runtime, ps01_runtime_login, ps01_line_runtime;

GRANT USAGE ON SCHEMA wstera_platform_internal TO supabase_auth_admin;
GRANT SELECT ON TABLE wstera_platform_internal.runtime_token_grants TO supabase_auth_admin;

CREATE FUNCTION wstera_platform_internal.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SET search_path = pg_catalog, wstera_platform_internal
AS $$
DECLARE
  v_claims jsonb;
  v_database_role text;
  v_original_exp bigint;
  v_capped_exp bigint;
BEGIN
  v_claims := event -> 'claims';
  IF jsonb_typeof(v_claims) <> 'object' THEN
    RAISE EXCEPTION 'H3C token hook received invalid claims';
  END IF;

  SELECT g.database_role
    INTO v_database_role
  FROM wstera_platform_internal.runtime_token_grants g
  WHERE g.user_id = NULLIF(event ->> 'user_id', '')::uuid
    AND g.enabled
    AND (g.valid_until IS NULL OR g.valid_until > statement_timestamp());

  IF v_database_role IS NULL THEN
    RETURN jsonb_build_object('claims', v_claims);
  END IF;
  IF v_database_role <> 'ps01_line_runtime'
     OR NOT EXISTS (
       SELECT 1 FROM pg_roles
       WHERE rolname=v_database_role
         AND NOT rolcanlogin
         AND NOT rolsuper
         AND NOT rolcreatedb
         AND NOT rolcreaterole
         AND NOT rolbypassrls
     ) THEN
    RAISE EXCEPTION 'H3C token grant targets an invalid runtime role';
  END IF;

  IF NOT (v_claims ? 'exp') THEN
    RAISE EXCEPTION 'H3C token hook requires an existing exp claim';
  END IF;

  v_original_exp := (v_claims ->> 'exp')::bigint;
  v_capped_exp := floor(extract(epoch FROM statement_timestamp() + interval '5 minutes'))::bigint;

  v_claims := jsonb_set(v_claims, '{role}', to_jsonb(v_database_role), true);
  v_claims := jsonb_set(v_claims, '{exp}', to_jsonb(least(v_original_exp, v_capped_exp)), true);

  RETURN jsonb_build_object('claims', v_claims);
END;
$$;

REVOKE EXECUTE ON FUNCTION wstera_platform_internal.custom_access_token_hook(jsonb)
FROM PUBLIC, anon, authenticated, service_role, authenticator,
     ps01_migrator, ps01_runtime, ps01_runtime_login, ps01_line_runtime;
GRANT EXECUTE ON FUNCTION wstera_platform_internal.custom_access_token_hook(jsonb)
TO supabase_auth_admin;

COMMENT ON SCHEMA wstera_platform_internal IS
  'WSTERA platform-owned internal control-plane objects; never expose through Data API.';
COMMENT ON TABLE wstera_platform_internal.runtime_token_grants IS
  'House allowlist for short-lived Auth-issued product runtime role tokens.';
COMMENT ON FUNCTION wstera_platform_internal.custom_access_token_hook(jsonb) IS
  'Supabase Custom Access Token Hook candidate; inert until hosted Auth config is enabled.';
DO $$
DECLARE
  v_api_schemas text;
BEGIN
  IF EXISTS (SELECT 1 FROM wstera_platform_internal.runtime_token_grants) THEN
    RAISE EXCEPTION 'H3C support migration must finish with zero runtime token grants';
  END IF;

  IF NOT has_schema_privilege('supabase_auth_admin','wstera_platform_internal','USAGE')
     OR NOT has_table_privilege('supabase_auth_admin','wstera_platform_internal.runtime_token_grants','SELECT')
     OR NOT has_function_privilege('supabase_auth_admin','wstera_platform_internal.custom_access_token_hook(jsonb)','EXECUTE') THEN
    RAISE EXCEPTION 'supabase_auth_admin lacks the exact hook support privileges';
  END IF;

  IF has_schema_privilege('anon','wstera_platform_internal','USAGE')
     OR has_schema_privilege('authenticated','wstera_platform_internal','USAGE')
     OR has_schema_privilege('service_role','wstera_platform_internal','USAGE')
     OR has_schema_privilege('ps01_line_runtime','wstera_platform_internal','USAGE') THEN
    RAISE EXCEPTION 'H3C platform internal schema leaked to an application/product role';
  END IF;

  SELECT setting INTO v_api_schemas
  FROM (SELECT unnest(rolconfig) AS setting FROM pg_roles WHERE rolname='authenticator') s
  WHERE setting LIKE 'pgrst.db_schemas=%'
  LIMIT 1;

  IF v_api_schemas LIKE '%wstera_platform_internal%' THEN
    RAISE EXCEPTION 'H3C platform internal schema appears in Data API exposure';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='wstera_platform_internal'
      AND p.proname='custom_access_token_hook'
      AND p.prosecdef
  ) THEN
    RAISE EXCEPTION 'H3C hook must remain SECURITY INVOKER';
  END IF;
END $$;