-- H3 BK01 runtime role prerequisite -- platform-owned migration.
-- Adapted from h3_ps01_line_runtime_boundary.sql at House 7695b62.
-- Authority: brief 18 A9 (2026-09-30). Apply only after review and fresh Owner GO.
-- Bootstrap owns the later authenticator membership and product RPC grants.

DO $bk01_runtime_role_preflight$
BEGIN
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION 'H3 BK01 runtime role requires platform postgres session.';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'bk01_runtime') THEN
    RAISE EXCEPTION 'bk01_runtime already exists';
  END IF;
END
$bk01_runtime_role_preflight$;

CREATE ROLE bk01_runtime
  NOLOGIN
  NOINHERIT
  NOSUPERUSER
  NOCREATEDB
  NOCREATEROLE
  NOREPLICATION
  NOBYPASSRLS;
ALTER ROLE bk01_runtime SET statement_timeout = '8s';
ALTER ROLE bk01_runtime SET lock_timeout = '8s';
COMMENT ON ROLE bk01_runtime IS
  'WSTERA shared runtime: NOLOGIN BK01 Data API role; exact RPC allowlist only.';
