-- Managed-role rollback is tool-owned and guarded by bk01-runtime-membership.mjs.
-- This immutable manifest target intentionally cannot be executed directly.
DO $house_runtime_issuer_role_rollback$
BEGIN
  RAISE EXCEPTION 'use the platform SQL managed-role rollback guard';
END;
$house_runtime_issuer_role_rollback$;
