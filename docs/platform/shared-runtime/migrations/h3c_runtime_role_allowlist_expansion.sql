-- House platform migration: expand the existing H3C Auth hook allowlist by one
-- previously source-reviewed product role. Existing grant rows remain unchanged.
BEGIN;

DO $preflight$
BEGIN
    IF current_user <> 'postgres' THEN
        RAISE EXCEPTION 'H3C role allowlist expansion requires platform postgres session';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='bk01_runtime'
        AND NOT rolcanlogin AND NOT rolsuper AND NOT rolcreatedb AND NOT rolcreaterole AND NOT rolbypassrls) THEN
        RAISE EXCEPTION 'bk01_runtime role is missing or has unsafe attributes';
    END IF;
    IF EXISTS (SELECT 1 FROM wstera_platform_internal.runtime_token_grants g
        WHERE g.database_role NOT IN ('ps01_line_runtime')) THEN
        RAISE EXCEPTION 'Existing H3C grants contain an unknown role';
    END IF;
END;
$preflight$;

ALTER TABLE wstera_platform_internal.runtime_token_grants
    DROP CONSTRAINT runtime_token_grants_database_role_check;
ALTER TABLE wstera_platform_internal.runtime_token_grants
    ADD CONSTRAINT runtime_token_grants_database_role_check
    CHECK (database_role IN ('ps01_line_runtime', 'bk01_runtime'));

CREATE OR REPLACE FUNCTION wstera_platform_internal.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql STABLE
SET search_path = pg_catalog, wstera_platform_internal
AS $function$
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
    SELECT g.database_role INTO v_database_role
      FROM wstera_platform_internal.runtime_token_grants g
     WHERE g.user_id = NULLIF(event ->> 'user_id', '')::uuid
       AND g.enabled AND (g.valid_until IS NULL OR g.valid_until > statement_timestamp());
    IF v_database_role IS NULL THEN RETURN jsonb_build_object('claims', v_claims); END IF;
    IF v_database_role NOT IN ('ps01_line_runtime', 'bk01_runtime') OR NOT EXISTS (
        SELECT 1 FROM pg_roles r WHERE r.rolname=v_database_role
          AND NOT r.rolcanlogin AND NOT r.rolsuper AND NOT r.rolcreatedb
          AND NOT r.rolcreaterole AND NOT r.rolbypassrls) THEN
        RAISE EXCEPTION 'H3C token grant targets an invalid runtime role';
    END IF;
    IF NOT (v_claims ? 'exp') THEN RAISE EXCEPTION 'H3C token hook requires an existing exp claim'; END IF;
    v_original_exp := (v_claims ->> 'exp')::bigint;
    v_capped_exp := floor(extract(epoch FROM statement_timestamp() + interval '5 minutes'))::bigint;
    v_claims := jsonb_set(v_claims, '{role}', to_jsonb(v_database_role), true);
    v_claims := jsonb_set(v_claims, '{exp}', to_jsonb(least(v_original_exp, v_capped_exp)), true);
    RETURN jsonb_build_object('claims', v_claims);
END;
$function$;

REVOKE ALL ON FUNCTION wstera_platform_internal.custom_access_token_hook(jsonb)
    FROM PUBLIC, anon, authenticated, service_role, authenticator, ps01_migrator,
         ps01_runtime, ps01_runtime_login, ps01_line_runtime, bk01_runtime;
GRANT EXECUTE ON FUNCTION wstera_platform_internal.custom_access_token_hook(jsonb) TO supabase_auth_admin;

DO $postflight$
BEGIN
    IF has_function_privilege('anon','wstera_platform_internal.custom_access_token_hook(jsonb)','EXECUTE')
       OR has_function_privilege('authenticated','wstera_platform_internal.custom_access_token_hook(jsonb)','EXECUTE')
       OR has_function_privilege('service_role','wstera_platform_internal.custom_access_token_hook(jsonb)','EXECUTE') THEN
        RAISE EXCEPTION 'H3C hook EXECUTE leaked to application roles';
    END IF;
    IF (SELECT count(*) FROM wstera_platform_internal.runtime_token_grants
         WHERE database_role NOT IN ('ps01_line_runtime','bk01_runtime')) <> 0 THEN
        RAISE EXCEPTION 'H3C hook table contains a role outside its allowlist';
    END IF;
END;
$postflight$;

COMMIT;
