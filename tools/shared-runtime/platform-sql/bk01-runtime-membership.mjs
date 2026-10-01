// Brief 18 A10: managed creator membership is authority to administer the role,
// never authority to inherit it or SET ROLE. No membership is revoked here.
export function validRuntimeMemberships(rows, bootstrap) {
  if (!Array.isArray(rows)) return false;
  const creator = rows.filter(row => row.granted_role === 'bk01_runtime' && row.member === 'postgres'
    && ['supabase_admin','postgres'].includes(row.grantor) && row.admin_option === true
    && row.inherit_option === false && row.set_option === false);
  const authenticator = rows.filter(row => row.granted_role === 'bk01_runtime' && row.member === 'authenticator'
    && row.grantor === 'postgres' && row.admin_option === false
    && row.inherit_option === false && row.set_option === true);
  return creator.length === 1 && rows.length === (bootstrap ? 2 : 1)
    && authenticator.length === (bootstrap ? 1 : 0);
}

export function validHouseIssuerMemberships(rows) {
  if (!Array.isArray(rows) || rows.length !== 1) return false;
  const [creator] = rows;
  return creator.granted_role === 'wstera_runtime_issuer_login'
    && creator.member === 'postgres'
    && ['supabase_admin', 'postgres'].includes(creator.grantor)
    && creator.admin_option === true
    && creator.inherit_option === false
    && creator.set_option === false;
}

export async function rollbackManagedRuntimeRole(client) {
  // A10 tool-owned exception. The immutable rollback file remains a manifest
  // selector/checksum contract, not executable SQL for this managed-role path.
  // Run inside the caller's transaction/advisory lock. DROP removes the sole
  // creator ADMIN row itself; revoking it first would remove DROP authority.
  await client.query(`DO $a10_managed_runtime_drop$
  DECLARE v_oid oid;
  BEGIN
    IF current_user <> 'postgres' THEN
      RAISE EXCEPTION 'A10 runtime role rollback requires platform postgres session';
    END IF;
    SELECT oid INTO v_oid FROM pg_catalog.pg_roles WHERE rolname='bk01_runtime';
    IF v_oid IS NULL THEN RAISE EXCEPTION 'A10 runtime role is missing'; END IF;
    IF (SELECT count(*) FROM pg_catalog.pg_auth_members
        WHERE roleid=v_oid OR member=v_oid OR grantor=v_oid) <> 1
      OR NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_auth_members m
        JOIN pg_catalog.pg_roles member ON member.oid=m.member
        JOIN pg_catalog.pg_roles grantor ON grantor.oid=m.grantor
        WHERE m.roleid=v_oid AND member.rolname='postgres'
          AND grantor.rolname IN ('supabase_admin','postgres')
          AND m.admin_option IS TRUE AND m.inherit_option IS FALSE AND m.set_option IS FALSE
      ) THEN RAISE EXCEPTION 'A10 runtime rollback blocked: unexpected role memberships';
    END IF;
    IF EXISTS (SELECT 1 FROM pg_catalog.pg_shdepend
      WHERE refclassid='pg_catalog.pg_authid'::regclass AND refobjid=v_oid) THEN
      RAISE EXCEPTION 'A10 runtime rollback blocked: ownership or privileges/dependencies remain';
    END IF;
  END $a10_managed_runtime_drop$;
  DROP ROLE bk01_runtime;`);
}

export async function rollbackHouseRuntimeIssuerRole(client) {
  await client.query(`DO $house_runtime_issuer_role_drop$
  DECLARE v_oid oid;
  BEGIN
    IF current_user <> 'postgres' THEN
      RAISE EXCEPTION 'House runtime issuer role rollback requires platform postgres session';
    END IF;
    SELECT oid INTO v_oid FROM pg_catalog.pg_roles WHERE rolname='wstera_runtime_issuer_login';
    IF v_oid IS NULL THEN RAISE EXCEPTION 'House runtime issuer role is missing'; END IF;
    IF EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE oid=v_oid
      AND (rolsuper OR rolinherit OR rolcreaterole OR rolcreatedb OR rolcanlogin OR rolreplication OR rolbypassrls
        OR (SELECT array_agg(setting ORDER BY setting) FROM unnest(rolconfig) setting)
          IS DISTINCT FROM ARRAY['lock_timeout=8s','statement_timeout=8s']::text[])
      ) THEN RAISE EXCEPTION 'House runtime issuer role attributes changed'; END IF;
    IF (SELECT count(*) FROM pg_catalog.pg_auth_members
        WHERE roleid=v_oid OR member=v_oid OR grantor=v_oid) <> 1
      OR NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_auth_members m
        JOIN pg_catalog.pg_roles member ON member.oid=m.member
        JOIN pg_catalog.pg_roles grantor ON grantor.oid=m.grantor
        WHERE m.roleid=v_oid AND member.rolname='postgres'
          AND grantor.rolname IN ('supabase_admin','postgres')
          AND m.admin_option IS TRUE AND m.inherit_option IS FALSE AND m.set_option IS FALSE
      ) THEN RAISE EXCEPTION 'House runtime issuer role rollback blocked: unexpected role memberships';
    END IF;
    IF EXISTS (SELECT 1 FROM pg_catalog.pg_shdepend
      WHERE refclassid='pg_catalog.pg_authid'::regclass AND refobjid=v_oid) THEN
      RAISE EXCEPTION 'House runtime issuer role rollback blocked: ownership or privileges/dependencies remain';
    END IF;
  END $house_runtime_issuer_role_drop$;
  DROP ROLE wstera_runtime_issuer_login;`);
}
