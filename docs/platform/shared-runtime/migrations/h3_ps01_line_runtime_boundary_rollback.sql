-- H3 PS01 LINE runtime boundary rollback — WSTERA LAB only.
-- Restores the exact pre-H3 role/function-ACL shape measured by H3A.

DO $$
BEGIN
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION 'H3 rollback requires platform postgres session.';
  END IF;
END $$;

-- Remove PostgREST SET ROLE path first.
REVOKE ps01_line_runtime FROM authenticator;

SET ROLE ps01_migrator;

REVOKE EXECUTE ON FUNCTION
  ps01.get_customer_booking_context_v2_internal(character varying, uuid)
FROM ps01_line_runtime;
REVOKE EXECUTE ON FUNCTION
  ps01.quote_customer_booking_v2_internal(character varying, uuid, uuid, uuid, uuid[], timestamp with time zone)
FROM ps01_line_runtime;
REVOKE EXECUTE ON FUNCTION
  ps01.submit_booking_request_v2_internal(character varying, uuid, uuid, uuid, uuid[], timestamp with time zone, text)
FROM ps01_line_runtime;
REVOKE USAGE ON SCHEMA ps01 FROM ps01_line_runtime;

-- Pre-H3 baseline had default PUBLIC EXECUTE on this trigger function.
GRANT EXECUTE ON FUNCTION ps01.sync_booking_occupancy_window() TO PUBLIC;

RESET ROLE;
DROP ROLE ps01_line_runtime;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='ps01_line_runtime') THEN
    RAISE EXCEPTION 'ps01_line_runtime still exists after rollback';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid=p.pronamespace
    CROSS JOIN LATERAL aclexplode(
      COALESCE(p.proacl, acldefault('f',p.proowner))
    ) a
    WHERE n.nspname='ps01'
      AND p.proname='sync_booking_occupancy_window'
      AND a.grantee=0
      AND a.privilege_type='EXECUTE'
  ) THEN
    RAISE EXCEPTION 'PUBLIC EXECUTE baseline was not restored for PS01 trigger function';
  END IF;
END $$;
