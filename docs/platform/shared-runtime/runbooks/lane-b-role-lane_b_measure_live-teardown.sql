-- lane-b-role-lane_b_measure_live-teardown.sql
-- GENERATED FILE — do not edit by hand. Regenerate with:
--   node tools/shared-runtime/h3d/generate-runbooks.mjs --write
-- SOLE allowlist source: docs/platform/shared-runtime/fixtures/lane-b-per-stage-allowlist.json
--   sha256(ba670d11f28755a6e435b0456a7b7f4fde6f3505767763f21bfd84bd88e8d85e)
-- spec: docs/platform/shared-runtime/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md §1/§1a/§3 (planning b80f813)
-- role class: M   stage: H3D-LIVE   owning checkpoint: OWNER-CP-H3D-LIVE
-- NOT executed by U-R3. Files only. Execute only inside the owning checkpoint window.
\set ON_ERROR_STOP on
BEGIN;

-- 1. REVOKE every grant from the create file, one line each (G-REVOKE-MIRROR)
REVOKE SELECT ON ps01.commercial_packages FROM lane_b_measure_live;
REVOKE USAGE ON SCHEMA ps01_internal FROM lane_b_measure_live;
REVOKE USAGE ON SCHEMA ps01 FROM lane_b_measure_live;

-- 3. terminate the role's sessions
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE usename = 'lane_b_measure_live';

-- 4. drop the role (role-drop only; owner reassignment is not used — F9: refused by non-superuser postgres)
DROP ROLE lane_b_measure_live;

-- 5. closing assertion: L1 — catalog presence of the role itself is false
DO $lane_b_assert$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'lane_b_measure_live') THEN
    RAISE EXCEPTION 'L1: role lane_b_measure_live still present after DROP';
  END IF;
END
$lane_b_assert$;

COMMIT;
