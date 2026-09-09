-- H4 — disposable product negative-probe gate. WSTERA LAB only. Platform postgres.
-- PREPARE-ONLY. DO NOT APPLY before H3 (H3D+H3E+H3F) is PASS/CLOSED (brief §10).
--
-- Creates a single throwaway product boundary:
--   schema h4_probe                 owned by h4_migrator
--   role   h4_migrator  NOLOGIN     authority limited to h4_probe
--   role   h4_runtime   NOLOGIN     EXECUTE on exactly one h4_probe operation
--   fn     h4_probe.h4_echo(text)   SECURITY DEFINER, the one allowed runtime op
--   fn     h4_probe.h4_migrate_note(text)  the one allowed product-local migration op
--
-- Token support is a SEPARATE artifact from the H3C ps01-only contract
-- (brief §10): its own grant table + its own hook, both removed by the rollback.

DO $$
BEGIN
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION 'H4 forward requires the platform postgres session.';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'h4_probe') THEN
    RAISE EXCEPTION 'h4_probe already exists; a prior H4 run was not torn down.';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname IN ('h4_migrator','h4_runtime')) THEN
    RAISE EXCEPTION 'h4_* role residue present; tear down before re-running H4.';
  END IF;
  -- H3 must be closed: ps01_runtime_login retired, ps01_line_runtime bounded
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ps01_runtime_login' AND rolcanlogin) THEN
    RAISE EXCEPTION 'H3E not applied (ps01_runtime_login still LOGIN); H4 entry gate fails.';
  END IF;
END $$;

-- roles ---------------------------------------------------------------------
CREATE ROLE h4_migrator NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
CREATE ROLE h4_runtime  NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
ALTER ROLE h4_runtime SET statement_timeout = '8s';
ALTER ROLE h4_runtime SET lock_timeout = '8s';
COMMENT ON ROLE h4_migrator IS 'H4 disposable product migrator; authority limited to schema h4_probe. Torn down after the H4 gate.';
COMMENT ON ROLE h4_runtime  IS 'H4 disposable product runtime; EXECUTE on exactly one h4_probe operation. Torn down after the H4 gate.';

-- PostgREST SET ROLE path for the runtime role (SET-only, never inherited)
GRANT h4_runtime TO authenticator WITH INHERIT FALSE, SET TRUE;

-- schema, owned by the migrator; migrator has NO database-wide CREATE
CREATE SCHEMA h4_probe AUTHORIZATION h4_migrator;
REVOKE ALL ON SCHEMA h4_probe FROM PUBLIC;

SET ROLE h4_migrator;

-- product-local table + the one product-local migration operation
CREATE TABLE h4_probe.notes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE FUNCTION h4_probe.h4_migrate_note(p_note text)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER
SET search_path = h4_probe, pg_temp
AS $fn$
DECLARE v_id bigint;
BEGIN
  INSERT INTO h4_probe.notes(note) VALUES (p_note) RETURNING id INTO v_id;
  RETURN v_id;
END;
$fn$;

-- the one allowlisted RUNTIME operation
CREATE FUNCTION h4_probe.h4_echo(p_text text)
RETURNS text LANGUAGE sql SECURITY DEFINER
SET search_path = h4_probe, pg_temp
AS $fn$ SELECT 'h4:' || coalesce(p_text, '') $fn$;

REVOKE EXECUTE ON FUNCTION h4_probe.h4_echo(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION h4_probe.h4_migrate_note(text) FROM PUBLIC;

RESET ROLE;

GRANT USAGE ON SCHEMA h4_probe TO h4_runtime;
-- runtime: exactly one operation, no table DML
SET ROLE h4_migrator;
GRANT EXECUTE ON FUNCTION h4_probe.h4_echo(text) TO h4_runtime;
RESET ROLE;

-- token support (separate from the ps01-only H3C contract) -----------------
CREATE TABLE wstera_platform_internal.h4_runtime_token_grants (
  user_id uuid PRIMARY KEY,
  database_role text NOT NULL CHECK (database_role = 'h4_runtime'),
  enabled boolean NOT NULL DEFAULT false,
  valid_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (valid_until IS NULL OR valid_until > created_at)
);
REVOKE ALL ON TABLE wstera_platform_internal.h4_runtime_token_grants
FROM PUBLIC, anon, authenticated, service_role, authenticator,
     ps01_migrator, ps01_runtime, ps01_runtime_login, ps01_line_runtime, h4_migrator, h4_runtime;
GRANT SELECT ON TABLE wstera_platform_internal.h4_runtime_token_grants TO supabase_auth_admin;

CREATE FUNCTION wstera_platform_internal.h4_custom_access_token_hook(event jsonb)
RETURNS jsonb LANGUAGE plpgsql STABLE
SET search_path = pg_catalog, wstera_platform_internal
AS $fn$
DECLARE
  v_claims jsonb := event -> 'claims';
  v_role text;
  v_orig_exp bigint;
  v_cap_exp bigint;
BEGIN
  IF jsonb_typeof(v_claims) <> 'object' THEN
    RAISE EXCEPTION 'H4 token hook received invalid claims';
  END IF;
  SELECT g.database_role INTO v_role
  FROM wstera_platform_internal.h4_runtime_token_grants g
  WHERE g.user_id = NULLIF(event ->> 'user_id','')::uuid
    AND g.enabled AND (g.valid_until IS NULL OR g.valid_until > statement_timestamp());
  IF v_role IS NULL THEN
    RETURN jsonb_build_object('claims', v_claims);
  END IF;
  IF v_role <> 'h4_runtime'
     OR NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = v_role
        AND NOT rolcanlogin AND NOT rolsuper AND NOT rolcreatedb
        AND NOT rolcreaterole AND NOT rolbypassrls) THEN
    RAISE EXCEPTION 'H4 token grant targets an invalid runtime role';
  END IF;
  IF NOT (v_claims ? 'exp') THEN
    RAISE EXCEPTION 'H4 token hook requires an existing exp claim';
  END IF;
  v_orig_exp := (v_claims ->> 'exp')::bigint;
  v_cap_exp := floor(extract(epoch FROM statement_timestamp() + interval '5 minutes'))::bigint;
  v_claims := jsonb_set(v_claims, '{role}', to_jsonb(v_role), true);
  v_claims := jsonb_set(v_claims, '{exp}',  to_jsonb(least(v_orig_exp, v_cap_exp)), true);
  RETURN jsonb_build_object('claims', v_claims);
END;
$fn$;
REVOKE EXECUTE ON FUNCTION wstera_platform_internal.h4_custom_access_token_hook(jsonb)
FROM PUBLIC, anon, authenticated, service_role, authenticator,
     ps01_migrator, ps01_runtime, ps01_runtime_login, ps01_line_runtime, h4_migrator, h4_runtime;
GRANT EXECUTE ON FUNCTION wstera_platform_internal.h4_custom_access_token_hook(jsonb) TO supabase_auth_admin;

-- post-checks -------------------------------------------------------------
DO $$
DECLARE v_exec int; v_writes int;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname IN ('h4_migrator','h4_runtime')
     AND (rolcanlogin OR rolsuper OR rolcreatedb OR rolcreaterole OR rolbypassrls OR rolinherit)) THEN
    RAISE EXCEPTION 'H4 role attributes unsafe';
  END IF;
  IF has_database_privilege('h4_migrator', current_database(), 'CREATE')
     OR has_schema_privilege('h4_migrator','public','CREATE')
     OR has_database_privilege('h4_runtime', current_database(), 'CREATE') THEN
    RAISE EXCEPTION 'H4 roles have unexpected CREATE authority';
  END IF;
  IF has_schema_privilege('h4_migrator','ps01','USAGE')
     OR has_schema_privilege('h4_migrator','ps01_internal','USAGE')
     OR has_schema_privilege('h4_migrator','local_service','USAGE')
     OR has_schema_privilege('h4_migrator','mt01','USAGE')
     OR has_schema_privilege('h4_migrator','mt01_private','USAGE')
     OR has_schema_privilege('h4_runtime','ps01','USAGE')
     OR has_schema_privilege('h4_runtime','local_service','USAGE')
     OR has_schema_privilege('h4_runtime','mt01','USAGE')
     OR has_schema_privilege('h4_runtime','ps01_internal','USAGE') THEN
    RAISE EXCEPTION 'H4 role reaches a foreign product schema';
  END IF;
  IF has_schema_privilege('h4_migrator','wstera_platform_internal','USAGE')
     OR has_schema_privilege('h4_runtime','wstera_platform_internal','USAGE') THEN
    RAISE EXCEPTION 'H4 role reaches the platform-internal schema';
  END IF;
  SELECT count(*) INTO v_exec FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='h4_probe' AND has_function_privilege('h4_runtime', p.oid, 'EXECUTE');
  IF v_exec <> 1 THEN RAISE EXCEPTION 'h4_runtime executable count %, expected 1', v_exec; END IF;
  SELECT count(*) INTO v_writes FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='h4_probe' AND c.relkind IN ('r','p')
      AND (has_table_privilege('h4_runtime',c.oid,'INSERT') OR has_table_privilege('h4_runtime',c.oid,'UPDATE')
        OR has_table_privilege('h4_runtime',c.oid,'DELETE'));
  IF v_writes <> 0 THEN RAISE EXCEPTION 'h4_runtime has direct h4_probe table writes'; END IF;
  IF EXISTS (SELECT 1 FROM wstera_platform_internal.h4_runtime_token_grants) THEN
    RAISE EXCEPTION 'H4 forward must finish with zero h4 token grants';
  END IF;
END $$;
