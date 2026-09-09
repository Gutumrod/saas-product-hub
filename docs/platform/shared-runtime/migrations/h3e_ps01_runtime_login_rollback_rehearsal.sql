-- H3E rollback rehearsal — transaction-scoped, WSTERA LAB, platform postgres.
-- Proves ps01_runtime_login can be restored to the pre-H3E LOGIN/password-present
-- shape with a FRESH credential and then returned to NOLOGIN/passwordless, without
-- ever using or exposing the old secret.
--
-- The temporary password is gen_random_uuid()::text generated inside the
-- transaction and NEVER selected, logged, or persisted. The whole transaction is
-- rolled back, so no catalog change survives.
--
-- Run AFTER the forward migration has set NOLOGIN/passwordless. Expected output:
-- three NOTICE lines, then ROLLBACK.

BEGIN;

DO $$
DECLARE
  v_tmp text := gen_random_uuid()::text || gen_random_uuid()::text;
  v_canlogin boolean;
  v_pw_present boolean;
BEGIN
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION 'rehearsal requires the platform postgres session.';
  END IF;

  -- start: expected post-forward shape
  SELECT rolcanlogin, rolpassword IS NOT NULL INTO v_canlogin, v_pw_present
  FROM pg_roles WHERE rolname = 'ps01_runtime_login';
  IF v_canlogin OR v_pw_present THEN
    RAISE EXCEPTION 'rehearsal precondition failed: role is not NOLOGIN/passwordless (run the forward migration first).';
  END IF;
  RAISE NOTICE 'rehearsal start: canlogin=%, password_present=%  (expected false/false)', v_canlogin, v_pw_present;

  -- restore to pre-H3E shape with a fresh throwaway credential
  EXECUTE format('ALTER ROLE ps01_runtime_login LOGIN PASSWORD %L', v_tmp);
  SELECT rolcanlogin, rolpassword IS NOT NULL INTO v_canlogin, v_pw_present
  FROM pg_roles WHERE rolname = 'ps01_runtime_login';
  IF NOT v_canlogin OR NOT v_pw_present THEN
    RAISE EXCEPTION 'rehearsal: restore step did not produce LOGIN + password-present.';
  END IF;
  RAISE NOTICE 'rehearsal restored: canlogin=%, password_present=%  (expected true/true)', v_canlogin, v_pw_present;

  -- return to intended final shape
  ALTER ROLE ps01_runtime_login NOLOGIN;
  ALTER ROLE ps01_runtime_login PASSWORD NULL;
  SELECT rolcanlogin, rolpassword IS NOT NULL INTO v_canlogin, v_pw_present
  FROM pg_roles WHERE rolname = 'ps01_runtime_login';
  IF v_canlogin OR v_pw_present THEN
    RAISE EXCEPTION 'rehearsal: return-to-final step did not produce NOLOGIN/passwordless.';
  END IF;
  RAISE NOTICE 'rehearsal returned to final: canlogin=%, password_present=%  (expected false/false)', v_canlogin, v_pw_present;

  v_tmp := NULL;
END $$;

ROLLBACK;
