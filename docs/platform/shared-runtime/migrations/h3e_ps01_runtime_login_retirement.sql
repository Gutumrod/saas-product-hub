-- H3E — retire the direct PS01 product DB login. WSTERA LAB only.
-- Platform-owned migration. Apply only through the WSTERA platform postgres session.
--
-- ENTRY GATE (human, not enforceable in SQL):
--   * H3C PASS/CLOSED and H3D PASS (real Customer LINE Data API smoke green).
--   * The active application no longer reads PS01_RUNTIME_DB_* for the Customer
--     LINE path (verified: PS01 branch work/ps01-h3d-data-api-20260909 @ 4efee70).
--   * A rollback credential path exists that does NOT restore an old secret
--     (see h3e_ps01_runtime_login_retirement_rollback.sql).
--
-- Final state: ps01_runtime_login is NOLOGIN and password-less. The role and its
-- ps01_runtime membership are preserved as an audit/rollback identity.

DO $$
BEGIN
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION 'H3E retirement requires the platform postgres session.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ps01_runtime_login') THEN
    RAISE EXCEPTION 'ps01_runtime_login does not exist; refresh the H3E baseline.';
  END IF;

  -- pre-H3E expected shape (from H3D-BASELINE-INVENTORY-2026-09-09.json)
  IF NOT EXISTS (
    SELECT 1 FROM pg_roles
    WHERE rolname = 'ps01_runtime_login'
      AND rolcanlogin AND rolinherit
      AND NOT rolsuper AND NOT rolcreatedb AND NOT rolcreaterole AND NOT rolbypassrls
  ) THEN
    RAISE EXCEPTION 'ps01_runtime_login is not in the expected pre-H3E LOGIN/INHERIT shape.';
  END IF;

  IF (SELECT rolpassword IS NULL FROM pg_roles WHERE rolname = 'ps01_runtime_login') THEN
    RAISE EXCEPTION 'ps01_runtime_login already has no password; H3E may have already run.';
  END IF;

  -- no live session may be using the login we are about to retire
  IF EXISTS (SELECT 1 FROM pg_stat_activity WHERE usename = 'ps01_runtime_login') THEN
    RAISE EXCEPTION 'Active ps01_runtime_login session(s) present; drain before retirement.';
  END IF;

  -- ps01_line_runtime replacement must already be in place and bounded
  IF NOT EXISTS (
    SELECT 1 FROM pg_roles WHERE rolname = 'ps01_line_runtime'
      AND NOT rolcanlogin AND NOT rolinherit
      AND NOT rolsuper AND NOT rolcreatedb AND NOT rolcreaterole AND NOT rolbypassrls
  ) THEN
    RAISE EXCEPTION 'ps01_line_runtime replacement boundary is missing or unsafe; H3D not complete.';
  END IF;
END $$;

ALTER ROLE ps01_runtime_login NOLOGIN;
ALTER ROLE ps01_runtime_login PASSWORD NULL;

COMMENT ON ROLE ps01_runtime_login IS
  'RETIRED 2026-09-__ (H3E): NOLOGIN, passwordless. Preserved only as an audit / '
  'rollback identity, member of ps01_runtime. The active PS01 Customer LINE path '
  'uses ps01_line_runtime via the Data API. Do not re-enable without a freshly '
  'provisioned LAB credential injected out-of-band.';

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ps01_runtime_login' AND rolcanlogin) THEN
    RAISE EXCEPTION 'H3E post-check: ps01_runtime_login is still LOGIN.';
  END IF;
  IF (SELECT rolpassword IS NOT NULL FROM pg_roles WHERE rolname = 'ps01_runtime_login') THEN
    RAISE EXCEPTION 'H3E post-check: ps01_runtime_login still has a password.';
  END IF;
  -- membership + other attributes unchanged
  IF NOT EXISTS (
    SELECT 1 FROM pg_auth_members m
    JOIN pg_roles mem ON mem.oid = m.member
    JOIN pg_roles par ON par.oid = m.roleid
    WHERE mem.rolname = 'ps01_runtime_login' AND par.rolname = 'ps01_runtime'
  ) THEN
    RAISE EXCEPTION 'H3E post-check: ps01_runtime_login lost its ps01_runtime membership.';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_roles WHERE rolname = 'ps01_runtime_login'
      AND (rolsuper OR rolcreatedb OR rolcreaterole OR rolbypassrls OR NOT rolinherit)
  ) THEN
    RAISE EXCEPTION 'H3E post-check: ps01_runtime_login attributes drifted.';
  END IF;
  -- ps01_line_runtime still exactly bounded
  IF (
    SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'ps01' AND has_function_privilege('ps01_line_runtime', p.oid, 'EXECUTE')
  ) <> 3 THEN
    RAISE EXCEPTION 'H3E post-check: ps01_line_runtime executable PS01 function count is not 3.';
  END IF;
END $$;
