-- H3 PS01 LINE runtime boundary â€” platform-owned LAB migration.
-- Source: DESIGN-H2-SHARED-RUNTIME-ISOLATION-EXECUTION-BOUNDARY-2026-09-08.md
-- Apply only through WSTERA platform migration authority.

DO $$
BEGIN
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION 'H3 PS01 line runtime boundary requires platform postgres session.';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ps01_line_runtime') THEN
    RAISE EXCEPTION 'ps01_line_runtime already exists';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'ps01') THEN
    RAISE EXCEPTION 'ps01 schema is missing';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_roles
    WHERE rolname = 'ps01_runtime_login' AND NOT rolcanlogin
  ) THEN
    RAISE EXCEPTION 'ps01_runtime_login already retired; refresh H3 baseline before apply';
  END IF;
END $$;

CREATE ROLE ps01_line_runtime
  NOLOGIN
  NOINHERIT
  NOSUPERUSER
  NOCREATEDB
  NOCREATEROLE
  NOREPLICATION
  NOBYPASSRLS;
ALTER ROLE ps01_line_runtime SET statement_timeout = '8s';
ALTER ROLE ps01_line_runtime SET lock_timeout = '8s';
COMMENT ON ROLE ps01_line_runtime IS
  'WSTERA shared runtime: NOLOGIN PS01 Customer LINE Data API role; exact RPC allowlist only.';

-- PostgREST authenticator may SET ROLE, but never inherits it in-session by default.
GRANT ps01_line_runtime TO authenticator WITH INHERIT FALSE, SET TRUE;

-- PS01 objects are owned by ps01_migrator. Perform the owned-object ACL changes as owner.
SET ROLE ps01_migrator;

-- Remove the only remaining PS01 function that still inherits default PUBLIC EXECUTE.
-- It is a trigger function already bound to ps01.bookings; direct invocation is not a product API.
REVOKE EXECUTE ON FUNCTION ps01.sync_booking_occupancy_window() FROM PUBLIC;

GRANT USAGE ON SCHEMA ps01 TO ps01_line_runtime;
GRANT EXECUTE ON FUNCTION
  ps01.get_customer_booking_context_v2_internal(character varying, uuid)
TO ps01_line_runtime;
GRANT EXECUTE ON FUNCTION
  ps01.quote_customer_booking_v2_internal(character varying, uuid, uuid, uuid, uuid[], timestamp with time zone)
TO ps01_line_runtime;
GRANT EXECUTE ON FUNCTION
  ps01.submit_booking_request_v2_internal(character varying, uuid, uuid, uuid, uuid[], timestamp with time zone, text)
TO ps01_line_runtime;

RESET ROLE;
DO $$
DECLARE
  v_exec_count integer;
  v_table_write_count integer;
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_roles
    WHERE rolname='ps01_line_runtime'
      AND (rolcanlogin OR rolsuper OR rolcreatedb OR rolcreaterole OR rolinherit OR rolbypassrls)
  ) THEN
    RAISE EXCEPTION 'ps01_line_runtime role attributes are unsafe';
  END IF;

  IF has_database_privilege('ps01_line_runtime', current_database(), 'CREATE')
     OR has_schema_privilege('ps01_line_runtime','public','CREATE')
     OR has_schema_privilege('ps01_line_runtime','ps01','CREATE') THEN
    RAISE EXCEPTION 'ps01_line_runtime has unexpected CREATE authority';
  END IF;

  IF has_schema_privilege('ps01_line_runtime','local_service','USAGE')
     OR has_schema_privilege('ps01_line_runtime','ps01_internal','USAGE')
     OR has_schema_privilege('ps01_line_runtime','mt01','USAGE')
     OR has_schema_privilege('ps01_line_runtime','mt01_private','USAGE')
     OR has_schema_privilege('ps01_line_runtime','auth','USAGE')
     OR has_schema_privilege('ps01_line_runtime','storage','USAGE')
     OR has_schema_privilege('ps01_line_runtime','cron','USAGE') THEN
    RAISE EXCEPTION 'ps01_line_runtime has unexpected product/managed schema reach';
  END IF;
  SELECT count(*) INTO v_exec_count
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='ps01'
    AND has_function_privilege('ps01_line_runtime',p.oid,'EXECUTE');

  IF v_exec_count <> 3 THEN
    RAISE EXCEPTION 'ps01_line_runtime executable PS01 function count %, expected 3', v_exec_count;
  END IF;

  SELECT count(*) INTO v_table_write_count
  FROM pg_class c
  JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='ps01'
    AND c.relkind IN ('r','p','v','m')
    AND (
      has_table_privilege('ps01_line_runtime',c.oid,'INSERT')
      OR has_table_privilege('ps01_line_runtime',c.oid,'UPDATE')
      OR has_table_privilege('ps01_line_runtime',c.oid,'DELETE')
      OR has_table_privilege('ps01_line_runtime',c.oid,'TRUNCATE')
      OR has_table_privilege('ps01_line_runtime',c.oid,'REFERENCES')
      OR has_table_privilege('ps01_line_runtime',c.oid,'TRIGGER')
    );

  IF v_table_write_count <> 0 THEN
    RAISE EXCEPTION 'ps01_line_runtime has direct PS01 table write authority';
  END IF;
END $$;
DO $$
DECLARE
  v_api_schemas text;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_auth_members m
    JOIN pg_roles member ON member.oid=m.member
    JOIN pg_roles parent ON parent.oid=m.roleid
    WHERE member.rolname='authenticator'
      AND parent.rolname='ps01_line_runtime'
      AND m.set_option
      AND NOT m.inherit_option
  ) THEN
    RAISE EXCEPTION 'authenticator membership for ps01_line_runtime is not SET-only as expected';
  END IF;

  SELECT setting INTO v_api_schemas
  FROM (
    SELECT unnest(rolconfig) AS setting
    FROM pg_roles WHERE rolname='authenticator'
  ) s
  WHERE setting LIKE 'pgrst.db_schemas=%'
  LIMIT 1;

  IF v_api_schemas IS NULL OR v_api_schemas NOT LIKE '%ps01%'
     OR v_api_schemas LIKE '%net%'
     OR v_api_schemas LIKE '%cron%'
     OR v_api_schemas LIKE '%auth%'
     OR v_api_schemas LIKE '%storage%' THEN
    RAISE EXCEPTION 'Unexpected Data API schema exposure: %', v_api_schemas;
  END IF;
END $$;

