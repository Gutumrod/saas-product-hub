-- H3D disposable AUTHZ fixture — GUARDED EXACT TEARDOWN. WSTERA LAB only.
-- Platform postgres session. Implements the §6 lock + cascade contract of
-- BRIEF-CLAUDE-H3D-FINAL-ONE-SHOT-REMEDIATION-2026-09-09.md.
--
-- Requires the seed manifest emitted by h3d-authz-fixture-seed.sql, passed as:
--   psql "$LAB_DB_URL" -v manifest="$(cat h3d-seed-manifest.json)" \
--        -f h3d-authz-fixture-teardown.sql
--
-- DO NOT APPLY without an explicit Owner/House fixture-teardown authorization
-- receipt, issued only after hook-off + residual-token-expiry + zero runner
-- resources.
--
-- Before running this file the operator/runner MUST have run
-- tools/shared-runtime/h3d/catalog-manifest.mjs --verify and had it PASS
-- (STOP — CATALOG GRAPH CHANGED otherwise).

\set ON_ERROR_STOP on

BEGIN;

SET LOCAL lock_timeout = '4s';
SET LOCAL statement_timeout = '30s';
SET LOCAL idle_in_transaction_session_timeout = '30s';

-- 1. LAB / session identity (same checks as the seed).
DO $$
BEGIN
  IF current_user <> 'postgres' THEN RAISE EXCEPTION 'H3D teardown: session role must be postgres.'; END IF;
  IF current_database() <> 'postgres' THEN RAISE EXCEPTION 'H3D teardown: current_database() = %.', current_database(); END IF;
  IF NOT pg_has_role('postgres', 'ps01_migrator', 'MEMBER') THEN
    RAISE EXCEPTION 'H3D teardown: postgres lacks ps01_migrator membership for the audit DDL.';
  END IF;
END $$;

-- 2. load the seed manifest + assert its shape.
CREATE TEMP TABLE _h3d_m ON COMMIT DROP AS SELECT :'manifest'::jsonb AS m;
DO $$
DECLARE m jsonb := (SELECT m FROM _h3d_m);
BEGIN
  IF m IS NULL OR m->>'kind' <> 'h3d-authz-fixture-seed-manifest' THEN
    RAISE EXCEPTION 'H3D teardown: missing / wrong seed manifest.';
  END IF;
  IF (m->'fixture_ids'->>'shop_a') <> '0d15d05a-0000-4000-8000-00000000a001'
     OR (m->'fixture_ids'->>'shop_b') <> '0d15d05a-0000-4000-8000-00000000b002'
     OR (m->'fixture_ids'->>'plan_a') <> '0d15d05a-0000-4000-8000-000000000041' THEN
    RAISE EXCEPTION 'H3D teardown: manifest fixture ids do not match this file.';
  END IF;
  IF (m->'generated_ids'->>'subscription_a') IS NULL OR (m->'generated_ids'->>'audit_a') IS NULL THEN
    RAISE EXCEPTION 'H3D teardown: manifest is missing generated subscription/audit ids.';
  END IF;
END $$;

-- 3. lock the whole shop-rooted graph, parent-to-leaf. ACCESS EXCLUSIVE on the
--    immutable-audit table (acquired directly, never upgraded), SHARE ROW
--    EXCLUSIVE on the rest. Any wait -> lock_timeout -> ROLLBACK with no deletes.
LOCK TABLE ps01.subscription_audit_log IN ACCESS EXCLUSIVE MODE;
LOCK TABLE ps01.shops                  IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE ps01.shop_subscriptions     IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE ps01.staff_users            IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE ps01.pet_owners             IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE ps01.pets                   IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE ps01.rooms                  IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE ps01.room_rate_plans        IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE ps01.bookings               IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE ps01.booking_pets           IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE ps01.booking_requests       IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE ps01.daily_reports          IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE ps01.google_sync_mappings   IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE ps01.sync_queue             IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE ps01.camera_settings        IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE ps01.camera_visitor_credentials IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE ps01.shop_commercial_assignments IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE ps01.import_batches         IN SHARE ROW EXCLUSIVE MODE;

-- 4. verify the immutable-audit trigger began exactly enabled (tgenabled='O'),
--    is the exact named trigger bound to the exact function.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_proc p ON p.oid = t.tgfoid
    JOIN pg_namespace pn ON pn.oid = p.pronamespace
    WHERE n.nspname='ps01' AND c.relname='subscription_audit_log'
      AND t.tgname='trg_subscription_audit_immutable'
      AND t.tgenabled='O' AND NOT t.tgisinternal
      AND pn.nspname='ps01' AND p.proname='prevent_subscription_audit_mutation'
  ) THEN
    RAISE EXCEPTION 'H3D teardown: immutable-audit trigger not in the exact expected enabled state.';
  END IF;
END $$;

-- 5. pre-delete assertions: exact fixture rows present, all non-fixture child
--    surfaces empty for the fixture shops. Any mismatch -> ROLLBACK, no delete.
SET CONSTRAINTS ALL IMMEDIATE;
DO $$
DECLARE
  m jsonb := (SELECT m FROM _h3d_m);
  a uuid := '0d15d05a-0000-4000-8000-00000000a001';
  b uuid := '0d15d05a-0000-4000-8000-00000000b002';
  sub_a uuid := (m->'generated_ids'->>'subscription_a')::uuid;
  sub_b uuid := (m->'generated_ids'->>'subscription_b')::uuid;
  aud_a uuid := (m->'generated_ids'->>'audit_a')::uuid;
  aud_b uuid := (m->'generated_ids'->>'audit_b')::uuid;
BEGIN
  IF (SELECT count(*) FROM ps01.shops WHERE id IN (a,b)) <> 2
     OR (SELECT count(*) FROM ps01.pet_owners WHERE id IN ('0d15d05a-0000-4000-8000-0000000aa011','0d15d05a-0000-4000-8000-0000000bb012')) <> 2
     OR (SELECT count(*) FROM ps01.pets WHERE id IN ('0d15d05a-0000-4000-8000-00000aa00021','0d15d05a-0000-4000-8000-00000bb00022')) <> 2
     OR (SELECT count(*) FROM ps01.rooms WHERE id = '0d15d05a-0000-4000-8000-000000000031') <> 1
     OR (SELECT count(*) FROM ps01.room_rate_plans WHERE id = '0d15d05a-0000-4000-8000-000000000041') <> 1 THEN
    RAISE EXCEPTION 'H3D teardown: exact fixture rows do not all match the manifest.';
  END IF;
  IF (SELECT count(*) FROM ps01.shop_subscriptions WHERE id IN (sub_a,sub_b) AND shop_id IN (a,b)) <> 2
     OR (SELECT count(*) FROM ps01.subscription_audit_log WHERE id IN (aud_a,aud_b) AND shop_id IN (a,b) AND subscription_id IN (sub_a,sub_b)) <> 2 THEN
    RAISE EXCEPTION 'H3D teardown: generated subscription / audit ids do not match the manifest.';
  END IF;
  -- no extra fixture-scoped support rows
  IF (SELECT count(*) FROM ps01.shop_subscriptions WHERE shop_id IN (a,b)) <> 2
     OR (SELECT count(*) FROM ps01.subscription_audit_log WHERE shop_id IN (a,b)) <> 2 THEN
    RAISE EXCEPTION 'H3D teardown: unexpected extra subscription / audit rows for the fixture shops.';
  END IF;

  -- every non-fixture child surface must be empty for the fixture shops.
  IF (SELECT count(*) FROM ps01.staff_users WHERE shop_id IN (a,b)) <> 0
     OR (SELECT count(*) FROM ps01.bookings WHERE shop_id IN (a,b)) <> 0
     OR (SELECT count(*) FROM ps01.booking_pets WHERE shop_id IN (a,b)) <> 0
     OR (SELECT count(*) FROM ps01.booking_requests WHERE shop_id IN (a,b)) <> 0
     OR (SELECT count(*) FROM ps01.daily_reports WHERE shop_id IN (a,b)) <> 0
     OR (SELECT count(*) FROM ps01.google_sync_mappings WHERE shop_id IN (a,b)) <> 0
     OR (SELECT count(*) FROM ps01.sync_queue WHERE shop_id IN (a,b)) <> 0
     OR (SELECT count(*) FROM ps01.camera_settings WHERE shop_id IN (a,b)) <> 0
     OR (SELECT count(*) FROM ps01.camera_visitor_credentials WHERE shop_id IN (a,b)) <> 0
     OR (SELECT count(*) FROM ps01.shop_commercial_assignments WHERE shop_id IN (a,b)) <> 0
     OR (SELECT count(*) FROM ps01.import_batches WHERE shop_id IN (a,b)) <> 0 THEN
    RAISE EXCEPTION 'H3D teardown: an unexpected child row exists for a fixture shop.';
  END IF;
END $$;

-- 6. exact deletes, leaf-first, by exact id, each with a row-count assertion.
DO $$
DECLARE
  m jsonb := (SELECT m FROM _h3d_m);
  a uuid := '0d15d05a-0000-4000-8000-00000000a001';
  b uuid := '0d15d05a-0000-4000-8000-00000000b002';
  sub_a uuid := (m->'generated_ids'->>'subscription_a')::uuid;
  sub_b uuid := (m->'generated_ids'->>'subscription_b')::uuid;
  aud_a uuid := (m->'generated_ids'->>'audit_a')::uuid;
  aud_b uuid := (m->'generated_ids'->>'audit_b')::uuid;
  n int;
BEGIN
  DELETE FROM ps01.room_rate_plans WHERE id = '0d15d05a-0000-4000-8000-000000000041';
  GET DIAGNOSTICS n = ROW_COUNT; IF n <> 1 THEN RAISE EXCEPTION 'teardown: plan delete affected %.', n; END IF;

  DELETE FROM ps01.pets WHERE id IN ('0d15d05a-0000-4000-8000-00000aa00021','0d15d05a-0000-4000-8000-00000bb00022');
  GET DIAGNOSTICS n = ROW_COUNT; IF n <> 2 THEN RAISE EXCEPTION 'teardown: pets delete affected %.', n; END IF;

  DELETE FROM ps01.rooms WHERE id = '0d15d05a-0000-4000-8000-000000000031';
  GET DIAGNOSTICS n = ROW_COUNT; IF n <> 1 THEN RAISE EXCEPTION 'teardown: room delete affected %.', n; END IF;

  DELETE FROM ps01.pet_owners WHERE id IN ('0d15d05a-0000-4000-8000-0000000aa011','0d15d05a-0000-4000-8000-0000000bb012');
  GET DIAGNOSTICS n = ROW_COUNT; IF n <> 2 THEN RAISE EXCEPTION 'teardown: owners delete affected %.', n; END IF;

  -- audit rows: disable exactly the named immutability trigger for this txn.
  -- The ACCESS EXCLUSIVE lock is already held to commit; no concurrent session
  -- can observe the disabled state. Restrict to the exact manifest audit ids.
  ALTER TABLE ps01.subscription_audit_log DISABLE TRIGGER trg_subscription_audit_immutable;
  DELETE FROM ps01.subscription_audit_log WHERE id IN (aud_a, aud_b);
  GET DIAGNOSTICS n = ROW_COUNT; IF n <> 2 THEN RAISE EXCEPTION 'teardown: audit delete affected %.', n; END IF;
  ALTER TABLE ps01.subscription_audit_log ENABLE TRIGGER trg_subscription_audit_immutable;

  DELETE FROM ps01.shop_subscriptions WHERE id IN (sub_a, sub_b);
  GET DIAGNOSTICS n = ROW_COUNT; IF n <> 2 THEN RAISE EXCEPTION 'teardown: subscription delete affected %.', n; END IF;

  -- shop delete last — must be exactly 2 with zero remaining children.
  DELETE FROM ps01.shops WHERE id IN (a, b);
  GET DIAGNOSTICS n = ROW_COUNT; IF n <> 2 THEN RAISE EXCEPTION 'teardown: shop delete affected %.', n; END IF;
END $$;

-- 7. post-delete verification: trigger re-enabled, zero residue, delta restored.
SET CONSTRAINTS ALL IMMEDIATE;
DO $$
DECLARE v jsonb;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname='ps01' AND c.relname='subscription_audit_log'
      AND t.tgname='trg_subscription_audit_immutable' AND t.tgenabled='O'
  ) THEN
    RAISE EXCEPTION 'H3D teardown: immutable-audit trigger not re-enabled to state O.';
  END IF;

  v := jsonb_build_object(
    'exact_ids', (SELECT count(*) FROM ps01.shops WHERE id IN ('0d15d05a-0000-4000-8000-00000000a001','0d15d05a-0000-4000-8000-00000000b002'))
                 + (SELECT count(*) FROM ps01.pet_owners WHERE id IN ('0d15d05a-0000-4000-8000-0000000aa011','0d15d05a-0000-4000-8000-0000000bb012'))
                 + (SELECT count(*) FROM ps01.pets WHERE id IN ('0d15d05a-0000-4000-8000-00000aa00021','0d15d05a-0000-4000-8000-00000bb00022'))
                 + (SELECT count(*) FROM ps01.rooms WHERE id = '0d15d05a-0000-4000-8000-000000000031')
                 + (SELECT count(*) FROM ps01.room_rate_plans WHERE id = '0d15d05a-0000-4000-8000-000000000041'),
    'labels', (SELECT count(*) FROM ps01.shops WHERE lower(slug) LIKE 'h3d-proof-%')
              + (SELECT count(*) FROM ps01.pet_owners WHERE upper(line_user_id) LIKE 'H3D-PROOF-%' OR upper(phone) LIKE 'H3D-PROOF-%' OR upper(first_name) LIKE 'H3D-PROOF-%')
              + (SELECT count(*) FROM ps01.pets WHERE upper(name) LIKE 'H3D-PROOF-%')
              + (SELECT count(*) FROM ps01.rooms WHERE upper(room_number) LIKE 'H3D-PROOF-%'),
    'fixture_shop_children', (SELECT count(*) FROM ps01.shop_subscriptions WHERE shop_id IN ('0d15d05a-0000-4000-8000-00000000a001','0d15d05a-0000-4000-8000-00000000b002'))
                             + (SELECT count(*) FROM ps01.subscription_audit_log WHERE shop_id IN ('0d15d05a-0000-4000-8000-00000000a001','0d15d05a-0000-4000-8000-00000000b002'))
                             + (SELECT count(*) FROM ps01.pet_owners WHERE shop_id IN ('0d15d05a-0000-4000-8000-00000000a001','0d15d05a-0000-4000-8000-00000000b002'))
                             + (SELECT count(*) FROM ps01.pets WHERE shop_id IN ('0d15d05a-0000-4000-8000-00000000a001','0d15d05a-0000-4000-8000-00000000b002'))
                             + (SELECT count(*) FROM ps01.rooms WHERE shop_id IN ('0d15d05a-0000-4000-8000-00000000a001','0d15d05a-0000-4000-8000-00000000b002'))
                             + (SELECT count(*) FROM ps01.room_rate_plans WHERE shop_id IN ('0d15d05a-0000-4000-8000-00000000a001','0d15d05a-0000-4000-8000-00000000b002'))
  );
  IF (v->>'exact_ids')::int <> 0 OR (v->>'labels')::int <> 0 OR (v->>'fixture_shop_children')::int <> 0 THEN
    RAISE EXCEPTION 'H3D teardown: residue detected %.', v;
  END IF;

  -- restore to the exact pre-seed counts recorded in the manifest.
  IF EXISTS (
    SELECT 1 FROM jsonb_each_text((SELECT m->'pre_seed_counts' FROM _h3d_m)) pre(t, n)
    WHERE n::int <> CASE pre.t
      WHEN 'shops' THEN (SELECT count(*) FROM ps01.shops)
      WHEN 'pet_owners' THEN (SELECT count(*) FROM ps01.pet_owners)
      WHEN 'pets' THEN (SELECT count(*) FROM ps01.pets)
      WHEN 'rooms' THEN (SELECT count(*) FROM ps01.rooms)
      WHEN 'room_rate_plans' THEN (SELECT count(*) FROM ps01.room_rate_plans)
      WHEN 'shop_subscriptions' THEN (SELECT count(*) FROM ps01.shop_subscriptions)
      WHEN 'subscription_audit_log' THEN (SELECT count(*) FROM ps01.subscription_audit_log)
    END
  ) THEN
    RAISE EXCEPTION 'H3D teardown: table counts not restored to the pre-seed baseline.';
  END IF;

  RAISE NOTICE 'H3D teardown: residue zero, counts restored to pre-seed baseline.';
END $$;

COMMIT;
