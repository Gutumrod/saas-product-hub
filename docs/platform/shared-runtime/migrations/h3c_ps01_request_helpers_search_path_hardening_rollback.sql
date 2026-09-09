-- H3C PS01 request-helper search_path hardening rollback — WSTERA LAB only.
-- Restores the exact pre-hardening mutable search_path state; use only for rollback.

DO $$
DECLARE
  v_name text;
  v_oid oid;
  v_owner text;
  v_acl text;
  v_secdef boolean;
  v_volatility "char";
  v_config text[];
  v_after_owner text;
  v_after_acl text;
  v_after_secdef boolean;
  v_after_volatility "char";
  v_after_config text[];
BEGIN
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION 'H3C helper rollback requires platform postgres session';
  END IF;

  FOREACH v_name IN ARRAY ARRAY[
    'ps01_request_user_id',
    'ps01_request_email',
    'ps01_request_name'
  ] LOOP
    SELECT p.oid,
           pg_get_userbyid(p.proowner),
           p.proacl::text,
           p.prosecdef,
           p.provolatile,
           p.proconfig
      INTO v_oid, v_owner, v_acl, v_secdef, v_volatility, v_config
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'ps01'
      AND p.proname = v_name
      AND pg_get_function_identity_arguments(p.oid) = '';

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Required PS01 helper %.%() is missing', 'ps01', v_name;
    END IF;
    IF EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'ps01' AND p.proname = v_name AND p.oid <> v_oid
    ) THEN
      RAISE EXCEPTION 'Unexpected overload exists for ps01.%()', v_name;
    END IF;
    IF v_owner <> 'ps01_migrator' OR v_secdef OR v_volatility <> 's' THEN
      RAISE EXCEPTION 'Unexpected ownership/security/volatility state for ps01.%()', v_name;
    END IF;
    IF v_config IS DISTINCT FROM ARRAY['search_path=pg_catalog']::text[] THEN
      RAISE EXCEPTION 'Unexpected function-local config for ps01.%(); refuse rollback', v_name;
    END IF;
    EXECUTE format(
      'ALTER FUNCTION ps01.%I() RESET search_path',
      v_name
    );

    SELECT pg_get_userbyid(p.proowner),
           p.proacl::text,
           p.prosecdef,
           p.provolatile,
           p.proconfig
      INTO v_after_owner, v_after_acl, v_after_secdef,
           v_after_volatility, v_after_config
    FROM pg_proc p
    WHERE p.oid = v_oid;

    IF v_after_owner IS DISTINCT FROM v_owner
       OR v_after_acl IS DISTINCT FROM v_acl
       OR v_after_secdef IS DISTINCT FROM v_secdef
       OR v_after_volatility IS DISTINCT FROM v_volatility THEN
      RAISE EXCEPTION 'Unexpected metadata drift while rolling back ps01.%()', v_name;
    END IF;
    IF v_after_config IS NOT NULL THEN
      RAISE EXCEPTION 'search_path reset failed for ps01.%()', v_name;
    END IF;
  END LOOP;
END $$;
