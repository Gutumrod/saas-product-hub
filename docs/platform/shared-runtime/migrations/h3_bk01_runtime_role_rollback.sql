-- Guarded rollback of the House-owned BK01 runtime role prerequisite.
-- Reverse the product/House chain and bootstrap first. Never revoke or cascade.

DO $bk01_runtime_role_rollback_guard$
DECLARE
  v_role_oid oid;
BEGIN
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION 'H3 BK01 runtime role rollback requires platform postgres session.';
  END IF;
  SELECT oid INTO v_role_oid FROM pg_catalog.pg_roles WHERE rolname = 'bk01_runtime';
  IF v_role_oid IS NULL THEN
    RAISE EXCEPTION 'bk01_runtime is missing; refresh rollback state';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_auth_members
    WHERE roleid = v_role_oid OR member = v_role_oid OR grantor = v_role_oid
  ) THEN
    RAISE EXCEPTION 'BK01 runtime role rollback blocked: role memberships remain; reverse bootstrap first';
  END IF;
  -- Shared dependencies cover ownership, direct ACLs, initial ACLs, default
  -- privileges and policy references, including objects in other databases.
  -- PUBLIC defaults are not grants to this role and do not prevent its removal.
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_shdepend
    WHERE refclassid = 'pg_catalog.pg_authid'::regclass AND refobjid = v_role_oid
  ) THEN
    RAISE EXCEPTION 'BK01 runtime role rollback blocked: ownership or privileges/dependencies remain; reverse bootstrap first';
  END IF;
END
$bk01_runtime_role_rollback_guard$;

DROP ROLE bk01_runtime;
