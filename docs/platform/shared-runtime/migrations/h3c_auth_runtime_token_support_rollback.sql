-- H3C Auth-issued runtime token support rollback — WSTERA LAB only.
-- IMPORTANT: hosted Custom Access Token Hook config must be disabled before this SQL runs.

DO $$
BEGIN
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION 'H3C support rollback requires platform postgres session.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname='wstera_platform_internal') THEN
    RAISE EXCEPTION 'wstera_platform_internal is already absent';
  END IF;
  IF EXISTS (
    SELECT 1 FROM wstera_platform_internal.runtime_token_grants
    WHERE enabled OR valid_until IS NULL OR valid_until > statement_timestamp()
  ) THEN
    RAISE EXCEPTION 'Disable/delete H3C runtime token grants before rollback';
  END IF;
END $$;

REVOKE EXECUTE ON FUNCTION wstera_platform_internal.custom_access_token_hook(jsonb)
FROM supabase_auth_admin;
REVOKE SELECT ON TABLE wstera_platform_internal.runtime_token_grants
FROM supabase_auth_admin;
REVOKE USAGE ON SCHEMA wstera_platform_internal
FROM supabase_auth_admin;

DROP FUNCTION wstera_platform_internal.custom_access_token_hook(jsonb);
DROP TABLE wstera_platform_internal.runtime_token_grants;
DROP SCHEMA wstera_platform_internal;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname='wstera_platform_internal') THEN
    RAISE EXCEPTION 'H3C support schema still exists after rollback';
  END IF;
END $$;