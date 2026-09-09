-- H3E rollback — re-enable ps01_runtime_login. WSTERA LAB only. Platform postgres session.
--
-- THE OLD PASSWORD IS NEVER RESTORED. Rollback requires a freshly generated LAB
-- credential injected out-of-band and never written to source control or evidence.
--
-- Invoke exactly:
--   NEWPW="$(openssl rand -base64 30)"
--   psql "$LAB_DB_URL" -v new_pw="$NEWPW" -f h3e_ps01_runtime_login_retirement_rollback.sql
--   # then hand NEWPW to the runtime secret store as PS01_RUNTIME_DB_PASSWORD_WSTERA_LAB
--   # (new value), rotate it, and clear NEWPW from the shell.
--
-- This only exists as a safety net. The forward path (Data API via ps01_line_runtime)
-- is the intended end state.

\if :{?new_pw}
\else
  \echo '*** ERROR: provide -v new_pw=<freshly generated LAB credential>. Aborting. ***'
  \quit 1
\endif

DO $$
BEGIN
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION 'H3E rollback requires the platform postgres session.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ps01_runtime_login') THEN
    RAISE EXCEPTION 'ps01_runtime_login does not exist.';
  END IF;
END $$;

ALTER ROLE ps01_runtime_login LOGIN;
ALTER ROLE ps01_runtime_login PASSWORD :'new_pw';

COMMENT ON ROLE ps01_runtime_login IS
  'H3E ROLLED BACK: LOGIN re-enabled with a freshly provisioned LAB credential. '
  'Member of ps01_runtime only. Investigate why the Data API replacement failed '
  'before retrying H3E.';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ps01_runtime_login' AND rolcanlogin) THEN
    RAISE EXCEPTION 'H3E rollback post-check: ps01_runtime_login is not LOGIN.';
  END IF;
  IF (SELECT rolpassword IS NULL FROM pg_roles WHERE rolname = 'ps01_runtime_login') THEN
    RAISE EXCEPTION 'H3E rollback post-check: ps01_runtime_login has no password.';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_roles WHERE rolname = 'ps01_runtime_login'
      AND (rolsuper OR rolcreatedb OR rolcreaterole OR rolbypassrls OR NOT rolinherit)
  ) THEN
    RAISE EXCEPTION 'H3E rollback post-check: attribute drift.';
  END IF;
END $$;
