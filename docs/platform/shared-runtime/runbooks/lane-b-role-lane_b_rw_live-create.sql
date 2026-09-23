-- lane-b-role-lane_b_rw_live-create.sql
-- GENERATED FILE — do not edit by hand. Regenerate with:
--   node tools/shared-runtime/h3d/generate-runbooks.mjs --write
-- SOLE allowlist source: docs/platform/shared-runtime/fixtures/lane-b-per-stage-allowlist.json
--   sha256(ba670d11f28755a6e435b0456a7b7f4fde6f3505767763f21bfd84bd88e8d85e)
-- spec: docs/platform/shared-runtime/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md §1/§1a/§3 (planning b80f813)
-- role class: W   stage: H3D-LIVE   owning checkpoint: OWNER-CP-H3D-LIVE
-- NOT executed by U-R3. Files only. Execute only inside the owning checkpoint window.
-- Required psql variables (operator-supplied; never persisted in this repository):
--   :'role_password'        one-time password generated inside the SQL-editor session (§1 inv. 2)
--   :'window_valid_until'   window-end timestamp for VALID UNTIL (must be <= window end)
\set ON_ERROR_STOP on
BEGIN;

CREATE ROLE lane_b_rw_live
  LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION
  CONNECTION LIMIT 3
  VALID UNTIL :'window_valid_until'
  PASSWORD :'role_password';

-- intended grants — each on its own line (G-REVOKE-MIRROR mirrors each one)
GRANT ps01_migrator TO lane_b_rw_live;
GRANT USAGE ON SCHEMA wstera_platform_internal TO lane_b_rw_live;
GRANT SELECT, INSERT, DELETE ON wstera_platform_internal.runtime_token_grants TO lane_b_rw_live;

-- closing assertion: asserts behaviour and names the layer it asserts (contract §3)
DO $lane_b$
DECLARE
  r record;
  p text;
  privs text[];
  is_exception boolean;
  allowed text[] := ARRAY['SELECT','INSERT','DELETE'];
  denied  text[] := ARRAY['UPDATE','TRUNCATE','REFERENCES','TRIGGER'];
BEGIN
  -- This block runs in the creating class-P session, so every assertion names the
  -- created role explicitly (it is the role's behaviour being asserted, not the session's).
  -- ATTRIBUTE (class shape)
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'lane_b_rw_live'
                   AND rolcanlogin AND NOT rolsuper AND NOT rolcreatedb AND NOT rolcreaterole
                   AND NOT rolreplication AND rolbypassrls = false) THEN
    RAISE EXCEPTION 'lane-b ATTRIBUTE assertion failed for %', 'lane_b_rw_live';
  END IF;

  -- L6 ownership capability (membership), exactly as the class requires
  IF pg_has_role('lane_b_rw_live', 'ps01_migrator', 'MEMBER') IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'L6: ps01_migrator membership assertion failed';
  END IF;

  -- L3 schema USAGE (exactly as the class/stage requires)
  IF has_schema_privilege('lane_b_rw_live', 'ps01', 'USAGE') IS DISTINCT FROM true THEN RAISE EXCEPTION 'L3: ps01 USAGE false'; END IF;
  IF has_schema_privilege('lane_b_rw_live', 'ps01_internal', 'USAGE') IS DISTINCT FROM true THEN RAISE EXCEPTION 'L3: ps01_internal USAGE false'; END IF;
  IF has_schema_privilege('lane_b_rw_live', 'wstera_platform_internal', 'USAGE') IS DISTINCT FROM true THEN RAISE EXCEPTION 'L3: wstera_platform_internal USAGE mismatch'; END IF;
  IF has_schema_privilege('lane_b_rw_live', 'local_service', 'USAGE') IS DISTINCT FROM false THEN RAISE EXCEPTION 'L3: always-forbidden schema local_service is USAGE=true'; END IF;
  IF has_schema_privilege('lane_b_rw_live', 'mt01', 'USAGE') IS DISTINCT FROM false THEN RAISE EXCEPTION 'L3: always-forbidden schema mt01 is USAGE=true'; END IF;
  IF has_schema_privilege('lane_b_rw_live', 'mt01_private', 'USAGE') IS DISTINCT FROM false THEN RAISE EXCEPTION 'L3: always-forbidden schema mt01_private is USAGE=true'; END IF;
  IF has_schema_privilege('lane_b_rw_live', 'auth', 'USAGE') IS DISTINCT FROM false THEN RAISE EXCEPTION 'L3: always-forbidden schema auth is USAGE=true'; END IF;
  IF has_schema_privilege('lane_b_rw_live', 'vault', 'USAGE') IS DISTINCT FROM false THEN RAISE EXCEPTION 'L3: always-forbidden schema vault is USAGE=true'; END IF;

  -- L2 object grant true for each intended object grant
  IF has_table_privilege('lane_b_rw_live', to_regclass('wstera_platform_internal.runtime_token_grants')::oid, 'SELECT') IS DISTINCT FROM true THEN RAISE EXCEPTION 'L2: intended SELECT on wstera_platform_internal.runtime_token_grants missing'; END IF;

  -- L4 effective reach = L2 AND L3 on the SAME qualified object (exception relation only)
  IF NOT (has_schema_privilege('lane_b_rw_live', 'wstera_platform_internal', 'USAGE')
            AND has_table_privilege('lane_b_rw_live', to_regclass('wstera_platform_internal.runtime_token_grants')::oid, 'SELECT')) THEN
    RAISE EXCEPTION 'L4: exception relation wstera_platform_internal.runtime_token_grants is not L2 AND L3 reachable';
  END IF;

  -- forbidden reach (W): L1 enumerate pg_catalog, L2 per-kind by OID, L3 already asserted above
  FOR r IN SELECT c.oid, n.nspname, c.relname, c.relkind
             FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'wstera_platform_internal' AND c.relkind IN ('r','p','S','f') LOOP
    is_exception := (r.nspname = 'wstera_platform_internal' AND r.relname = 'runtime_token_grants');
    privs := CASE WHEN r.relkind = 'S' THEN ARRAY['SELECT','USAGE','UPDATE']
                 ELSE ARRAY['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER'] END;
    FOREACH p IN ARRAY privs LOOP
      IF r.relkind = 'S' THEN
        IF is_exception AND p = ANY(allowed) THEN
          IF has_sequence_privilege('lane_b_rw_live', r.oid, p) IS DISTINCT FROM true THEN RAISE EXCEPTION 'L2: exception sequence % missing %', r.relname, p; END IF;
        ELSIF has_sequence_privilege('lane_b_rw_live', r.oid, p) IS DISTINCT FROM false THEN RAISE EXCEPTION 'forbidden reach: % %', r.relname, p; END IF;
      ELSE
        IF is_exception AND p = ANY(allowed) THEN
          IF has_table_privilege('lane_b_rw_live', r.oid, p) IS DISTINCT FROM true THEN RAISE EXCEPTION 'L2: exception relation % missing %', r.relname, p; END IF;
        ELSIF is_exception AND p = ANY(denied) THEN
          IF has_table_privilege('lane_b_rw_live', r.oid, p) IS DISTINCT FROM false THEN RAISE EXCEPTION 'L2: exception relation % must deny %', r.relname, p; END IF;
        ELSIF has_table_privilege('lane_b_rw_live', r.oid, p) IS DISTINCT FROM false THEN RAISE EXCEPTION 'forbidden reach: % %', r.relname, p; END IF;
      END IF;
    END LOOP;
  END LOOP;
END
$lane_b$;

COMMIT;
