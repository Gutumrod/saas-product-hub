-- H3D disposable AUTHZ fixture — GUARDED FORWARD SEED. WSTERA LAB only.
-- Platform postgres session. Implements the §5 lock + assertion contract of
-- BRIEF-CLAUDE-H3D-FINAL-ONE-SHOT-REMEDIATION-2026-09-09.md.
--
-- This file IS the seed guard. h3d-authz-fixture-precheck.sql is evidence only
-- and must never be treated as the guard.
--
-- DO NOT APPLY without an explicit Owner/House fixture-DML authorization receipt
-- for this exact commit + run id. A committed file is not authorization.
--
-- Fixture ids (deterministic, obviously synthetic — prefix 0d15d05a = "disposa"):
--   SHOP A   0d15d05a-0000-4000-8000-00000000a001   baseline shop
--   SHOP B   0d15d05a-0000-4000-8000-00000000b002   cross-shop target (POS-AUTHZ-1)
--   OWNER A  0d15d05a-0000-4000-8000-0000000aa011   SHOP A, LINE-linked, baseline customer
--   OWNER B  0d15d05a-0000-4000-8000-0000000bb012   SHOP A, different customer, no LINE link
--   PET A    0d15d05a-0000-4000-8000-00000aa00021   OWNER A / SHOP A, baseline positive context
--   PET B    0d15d05a-0000-4000-8000-00000bb00022   OWNER B / SHOP A, cross-customer target (POS-AUTHZ-3)
--   ROOM A   0d15d05a-0000-4000-8000-000000000031   SHOP A, capacity_pets = 2
--   PLAN A   0d15d05a-0000-4000-8000-000000000041   SHOP A, ROOM A, DAY/1, active, price 1000.00
--   LINE A   'H3D-PROOF-LINE-USER-A'

\set ON_ERROR_STOP on

BEGIN;

-- 1. bounded timeouts — any wait is a hard STOP / ROLLBACK
SET LOCAL lock_timeout = '4s';
SET LOCAL statement_timeout = '30s';
SET LOCAL idle_in_transaction_session_timeout = '30s';

-- 2. LAB / session identity (recorded without secrets by the operator wrapper)
DO $$
BEGIN
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION 'H3D seed: session role must be postgres (F09 additional check).';
  END IF;
  IF current_database() <> 'postgres' THEN
    RAISE EXCEPTION 'H3D seed: current_database() = %, expected postgres.', current_database();
  END IF;
  IF current_setting('server_version_num')::int < 170000 THEN
    RAISE EXCEPTION 'H3D seed: unexpected server version %.', current_setting('server_version');
  END IF;
  -- ownership: postgres must be able to write the fixture tables and toggle the
  -- audit trigger later; assert it holds the ps01_migrator membership path.
  IF NOT pg_has_role('postgres', 'ps01_migrator', 'MEMBER') THEN
    RAISE EXCEPTION 'H3D seed: postgres lacks the ps01_migrator membership needed for teardown DDL.';
  END IF;
END $$;

-- 3. controlled-table locks (SHARE ROW EXCLUSIVE): blocks concurrent INSERT/
--    UPDATE/DELETE, allows SELECT. Deterministic order, ps01 only.
LOCK TABLE ps01.shops                  IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE ps01.pet_owners             IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE ps01.pets                   IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE ps01.rooms                  IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE ps01.room_rate_plans        IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE ps01.shop_subscriptions     IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE ps01.subscription_audit_log IN SHARE ROW EXCLUSIVE MODE;

-- 4. commercial 'starter' package — pin the exact row, assert full semantics.
DO $$
DECLARE p ps01.commercial_packages%ROWTYPE;
BEGIN
  SELECT * INTO p FROM ps01.commercial_packages WHERE id = 'starter' FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'H3D seed: commercial_packages(starter) missing.'; END IF;
  IF COALESCE(p.room_limit, 0) < 1 THEN RAISE EXCEPTION 'H3D seed: starter room_limit % < 1.', p.room_limit; END IF;
  IF COALESCE(p.pet_history_limit, 0) < 2 THEN RAISE EXCEPTION 'H3D seed: starter pet_history_limit % < 2.', p.pet_history_limit; END IF;
  -- resolve_shop_commercial_authority consumes name/monthly_price/annual_price/
  -- support_tier/room_limit/pet_history_limit; all must be present-shaped.
  IF p.name IS NULL OR p.monthly_price IS NULL THEN
    RAISE EXCEPTION 'H3D seed: starter package semantic fields incomplete.';
  END IF;
END $$;

-- 5. catalog manifest gate — the fixture depends on an exact trigger/FK graph.
--    The runner runs tools/shared-runtime/h3d/catalog-manifest.mjs --verify against
--    h3d-expected-catalog-manifest.json immediately before this seed and STOPs on
--    drift. This block re-asserts the minimum trigger set inline as defence in depth.
DO $$
DECLARE v_missing text;
BEGIN
  SELECT string_agg(x.name, ', ') INTO v_missing FROM (VALUES
    ('trg_initialize_shop_subscription_after_insert','shops','O'),
    ('trg_prevent_legacy_subscription_status_write','shops','O'),
    ('trg_pet_owners_commercial_access','pet_owners','O'),
    ('trg_enforce_pet_commercial_quota','pets','O'),
    ('trg_enforce_room_commercial_quota','rooms','O'),
    ('trg_subscription_audit_immutable','subscription_audit_log','O')
  ) AS x(name, tbl, want_enabled)
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'ps01' AND NOT t.tgisinternal
      AND t.tgname = x.name AND c.relname = x.tbl
      AND CASE t.tgenabled WHEN 'O' THEN 'O' ELSE t.tgenabled::text END = x.want_enabled
  );
  IF v_missing IS NOT NULL THEN
    RAISE EXCEPTION 'H3D seed: required trigger(s) missing/disabled: %.', v_missing;
  END IF;
END $$;

-- 6. accepted pre-seed state — EMPTY for every shop-rooted PS01 table, and no
--    exact fixture id / synthetic label anywhere (case-normalised).
DO $$
DECLARE v_bad text;
BEGIN
  SELECT string_agg(t || '=' || c, ', ') INTO v_bad FROM (
    SELECT 'shops' t, count(*) c FROM ps01.shops UNION ALL
    SELECT 'staff_users', count(*) FROM ps01.staff_users UNION ALL
    SELECT 'pet_owners', count(*) FROM ps01.pet_owners UNION ALL
    SELECT 'pets', count(*) FROM ps01.pets UNION ALL
    SELECT 'rooms', count(*) FROM ps01.rooms UNION ALL
    SELECT 'room_rate_plans', count(*) FROM ps01.room_rate_plans UNION ALL
    SELECT 'bookings', count(*) FROM ps01.bookings UNION ALL
    SELECT 'booking_pets', count(*) FROM ps01.booking_pets UNION ALL
    SELECT 'booking_requests', count(*) FROM ps01.booking_requests UNION ALL
    SELECT 'daily_reports', count(*) FROM ps01.daily_reports UNION ALL
    SELECT 'google_sync_mappings', count(*) FROM ps01.google_sync_mappings UNION ALL
    SELECT 'sync_queue', count(*) FROM ps01.sync_queue UNION ALL
    SELECT 'camera_settings', count(*) FROM ps01.camera_settings UNION ALL
    SELECT 'camera_visitor_credentials', count(*) FROM ps01.camera_visitor_credentials UNION ALL
    SELECT 'shop_commercial_assignments', count(*) FROM ps01.shop_commercial_assignments UNION ALL
    SELECT 'import_batches', count(*) FROM ps01.import_batches UNION ALL
    SELECT 'shop_subscriptions', count(*) FROM ps01.shop_subscriptions UNION ALL
    SELECT 'subscription_audit_log', count(*) FROM ps01.subscription_audit_log
  ) s WHERE c <> 0;
  IF v_bad IS NOT NULL THEN
    RAISE EXCEPTION 'H3D seed: pre-seed baseline is not empty: %.', v_bad;
  END IF;

  IF EXISTS (SELECT 1 FROM ps01.shops WHERE lower(slug) LIKE 'h3d-proof-%' OR lower(name) LIKE 'h3d-proof %')
     OR EXISTS (SELECT 1 FROM ps01.pet_owners WHERE upper(line_user_id) LIKE 'H3D-PROOF-%' OR upper(phone) LIKE 'H3D-PROOF-%' OR upper(first_name) LIKE 'H3D-PROOF-%')
     OR EXISTS (SELECT 1 FROM ps01.pets WHERE upper(name) LIKE 'H3D-PROOF-%')
     OR EXISTS (SELECT 1 FROM ps01.rooms WHERE upper(room_number) LIKE 'H3D-PROOF-%') THEN
    RAISE EXCEPTION 'H3D seed: a real row already uses an H3D-PROOF-* label.';
  END IF;

  IF EXISTS (SELECT 1 FROM ps01.shops WHERE id IN ('0d15d05a-0000-4000-8000-00000000a001','0d15d05a-0000-4000-8000-00000000b002'))
     OR EXISTS (SELECT 1 FROM ps01.pet_owners WHERE id IN ('0d15d05a-0000-4000-8000-0000000aa011','0d15d05a-0000-4000-8000-0000000bb012'))
     OR EXISTS (SELECT 1 FROM ps01.pets WHERE id IN ('0d15d05a-0000-4000-8000-00000aa00021','0d15d05a-0000-4000-8000-00000bb00022'))
     OR EXISTS (SELECT 1 FROM ps01.rooms WHERE id = '0d15d05a-0000-4000-8000-000000000031')
     OR EXISTS (SELECT 1 FROM ps01.room_rate_plans WHERE id = '0d15d05a-0000-4000-8000-000000000041') THEN
    RAISE EXCEPTION 'H3D seed: an exact fixture id already exists — run guarded teardown first.';
  END IF;
END $$;

-- 7. snapshot controlled-table counts inside the transaction.
CREATE TEMP TABLE _h3d_pre ON COMMIT DROP AS
SELECT 'shops' t, (SELECT count(*) FROM ps01.shops) n UNION ALL
SELECT 'pet_owners', (SELECT count(*) FROM ps01.pet_owners) UNION ALL
SELECT 'pets', (SELECT count(*) FROM ps01.pets) UNION ALL
SELECT 'rooms', (SELECT count(*) FROM ps01.rooms) UNION ALL
SELECT 'room_rate_plans', (SELECT count(*) FROM ps01.room_rate_plans) UNION ALL
SELECT 'shop_subscriptions', (SELECT count(*) FROM ps01.shop_subscriptions) UNION ALL
SELECT 'subscription_audit_log', (SELECT count(*) FROM ps01.subscription_audit_log);

-- 8. inserts in dependency order. No ON CONFLICT, no rerun-as-success.
INSERT INTO ps01.shops (id, name, slug) VALUES
  ('0d15d05a-0000-4000-8000-00000000a001', 'H3D-PROOF Shop A', 'h3d-proof-shop-a'),
  ('0d15d05a-0000-4000-8000-00000000b002', 'H3D-PROOF Shop B', 'h3d-proof-shop-b');

INSERT INTO ps01.pet_owners (id, shop_id, line_user_id, first_name, phone) VALUES
  ('0d15d05a-0000-4000-8000-0000000aa011', '0d15d05a-0000-4000-8000-00000000a001', 'H3D-PROOF-LINE-USER-A', 'H3D-PROOF-Owner-A', 'H3D-PROOF-PHONE-A1'),
  ('0d15d05a-0000-4000-8000-0000000bb012', '0d15d05a-0000-4000-8000-00000000a001', NULL,                   'H3D-PROOF-Owner-B', 'H3D-PROOF-PHONE-B1');

INSERT INTO ps01.pets (id, shop_id, owner_id, name, species) VALUES
  ('0d15d05a-0000-4000-8000-00000aa00021', '0d15d05a-0000-4000-8000-00000000a001', '0d15d05a-0000-4000-8000-0000000aa011', 'H3D-PROOF-Pet-A', 'dog'),
  ('0d15d05a-0000-4000-8000-00000bb00022', '0d15d05a-0000-4000-8000-00000000a001', '0d15d05a-0000-4000-8000-0000000bb012', 'H3D-PROOF-Pet-B', 'cat');

INSERT INTO ps01.rooms (id, shop_id, room_number, room_type, capacity_pets, base_price_per_night) VALUES
  ('0d15d05a-0000-4000-8000-000000000031', '0d15d05a-0000-4000-8000-00000000a001', 'H3D-PROOF-R1', 'standard', 2, 1000.00);

INSERT INTO ps01.room_rate_plans (id, shop_id, room_id, unit, quantity, price) VALUES
  ('0d15d05a-0000-4000-8000-000000000041', '0d15d05a-0000-4000-8000-00000000a001', '0d15d05a-0000-4000-8000-000000000031', 'DAY', 1, 1000.00);

-- 9 + 10 + 11. exact topology, exact deltas, exact subscription + audit semantics.
SET CONSTRAINTS ALL IMMEDIATE;
DO $$
DECLARE
  d_shops int; d_owners int; d_pets int; d_rooms int; d_plans int; d_subs int; d_audit int;
  ss ps01.shop_subscriptions%ROWTYPE;
  al ps01.subscription_audit_log%ROWTYPE;
  v_shop uuid;
BEGIN
  SELECT (SELECT count(*) FROM ps01.shops)              - (SELECT n FROM _h3d_pre WHERE t='shops'),
         (SELECT count(*) FROM ps01.pet_owners)         - (SELECT n FROM _h3d_pre WHERE t='pet_owners'),
         (SELECT count(*) FROM ps01.pets)               - (SELECT n FROM _h3d_pre WHERE t='pets'),
         (SELECT count(*) FROM ps01.rooms)              - (SELECT n FROM _h3d_pre WHERE t='rooms'),
         (SELECT count(*) FROM ps01.room_rate_plans)    - (SELECT n FROM _h3d_pre WHERE t='room_rate_plans'),
         (SELECT count(*) FROM ps01.shop_subscriptions) - (SELECT n FROM _h3d_pre WHERE t='shop_subscriptions'),
         (SELECT count(*) FROM ps01.subscription_audit_log) - (SELECT n FROM _h3d_pre WHERE t='subscription_audit_log')
  INTO d_shops, d_owners, d_pets, d_rooms, d_plans, d_subs, d_audit;

  IF (d_shops, d_owners, d_pets, d_rooms, d_plans, d_subs, d_audit) IS DISTINCT FROM (2, 2, 2, 1, 1, 2, 2) THEN
    RAISE EXCEPTION 'H3D seed: delta mismatch got (shops=%,owners=%,pets=%,rooms=%,plans=%,subs=%,audit=%), want (2,2,2,1,1,2,2).',
      d_shops, d_owners, d_pets, d_rooms, d_plans, d_subs, d_audit;
  END IF;

  -- every other shop-rooted table must be unchanged (still 0).
  IF (SELECT count(*) FROM ps01.staff_users) <> 0
     OR (SELECT count(*) FROM ps01.bookings) <> 0
     OR (SELECT count(*) FROM ps01.booking_pets) <> 0
     OR (SELECT count(*) FROM ps01.booking_requests) <> 0
     OR (SELECT count(*) FROM ps01.daily_reports) <> 0
     OR (SELECT count(*) FROM ps01.google_sync_mappings) <> 0
     OR (SELECT count(*) FROM ps01.sync_queue) <> 0
     OR (SELECT count(*) FROM ps01.camera_settings) <> 0
     OR (SELECT count(*) FROM ps01.camera_visitor_credentials) <> 0
     OR (SELECT count(*) FROM ps01.shop_commercial_assignments) <> 0
     OR (SELECT count(*) FROM ps01.import_batches) <> 0 THEN
    RAISE EXCEPTION 'H3D seed: an unrelated shop-rooted table gained rows.';
  END IF;

  -- exact fixture topology + relationship assertions
  IF NOT EXISTS (SELECT 1 FROM ps01.pet_owners WHERE id='0d15d05a-0000-4000-8000-0000000aa011'
        AND shop_id='0d15d05a-0000-4000-8000-00000000a001' AND line_user_id='H3D-PROOF-LINE-USER-A') THEN
    RAISE EXCEPTION 'assert: Owner A / Shop A / LINE A.'; END IF;
  IF EXISTS (SELECT 1 FROM ps01.pet_owners
        WHERE shop_id='0d15d05a-0000-4000-8000-00000000b002' AND line_user_id='H3D-PROOF-LINE-USER-A') THEN
    RAISE EXCEPTION 'assert: LINE A must have NO link to Shop B.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM ps01.pets WHERE id='0d15d05a-0000-4000-8000-00000aa00021'
        AND shop_id='0d15d05a-0000-4000-8000-00000000a001' AND owner_id='0d15d05a-0000-4000-8000-0000000aa011') THEN
    RAISE EXCEPTION 'assert: Pet A -> Owner A / Shop A.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM ps01.pets WHERE id='0d15d05a-0000-4000-8000-00000bb00022'
        AND shop_id='0d15d05a-0000-4000-8000-00000000a001' AND owner_id='0d15d05a-0000-4000-8000-0000000bb012') THEN
    RAISE EXCEPTION 'assert: Pet B -> Owner B / Shop A.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM ps01.rooms WHERE id='0d15d05a-0000-4000-8000-000000000031'
        AND shop_id='0d15d05a-0000-4000-8000-00000000a001' AND capacity_pets = 2) THEN
    RAISE EXCEPTION 'assert: Room A / Shop A / capacity 2.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM ps01.room_rate_plans WHERE id='0d15d05a-0000-4000-8000-000000000041'
        AND shop_id='0d15d05a-0000-4000-8000-00000000a001' AND room_id='0d15d05a-0000-4000-8000-000000000031'
        AND unit='DAY' AND quantity=1 AND price=1000.00 AND is_active) THEN
    RAISE EXCEPTION 'assert: Rate Plan A active / DAY 1 / 1000.00 / (Shop A, Room A) pair.'; END IF;

  -- each fixture shop: exactly one subscription with canonical initialization semantics
  FOREACH v_shop IN ARRAY ARRAY['0d15d05a-0000-4000-8000-00000000a001','0d15d05a-0000-4000-8000-00000000b002']::uuid[] LOOP
    IF (SELECT count(*) FROM ps01.shop_subscriptions WHERE shop_id = v_shop) <> 1 THEN
      RAISE EXCEPTION 'assert: shop % must have exactly one subscription.', v_shop; END IF;
    SELECT * INTO ss FROM ps01.shop_subscriptions WHERE shop_id = v_shop;
    IF ss.package_id <> 'starter' OR ss.commercial_offer <> 'standard' OR ss.billing_interval <> 'monthly'
       OR ss.status <> 'trialing' OR ss.last_transition_source <> 'bootstrap'
       OR ss.cancel_at_period_end IS TRUE OR ss.cancelled_at IS NOT NULL OR ss.suspended_at IS NOT NULL THEN
      RAISE EXCEPTION 'assert: subscription semantics wrong for shop %.', v_shop; END IF;
    IF ss.trial_started_at IS NULL OR ss.trial_ends_at IS NULL
       OR ss.trial_started_at < transaction_timestamp() OR ss.trial_started_at > statement_timestamp()
       OR ss.trial_ends_at <> ss.trial_started_at + interval '30 days' THEN
      RAISE EXCEPTION 'assert: subscription trial window wrong for shop %.', v_shop; END IF;
    IF ss.current_period_start IS NOT NULL OR ss.current_period_end IS NOT NULL OR ss.grace_period_end IS NOT NULL THEN
      RAISE EXCEPTION 'assert: subscription period/grace must be null at initialization for shop %.', v_shop; END IF;

    -- exactly one audit row per fixture subscription + shop, canonical fields
    IF (SELECT count(*) FROM ps01.subscription_audit_log WHERE shop_id = v_shop) <> 1 THEN
      RAISE EXCEPTION 'assert: shop % must have exactly one audit row.', v_shop; END IF;
    SELECT * INTO al FROM ps01.subscription_audit_log WHERE shop_id = v_shop;
    IF al.subscription_id <> ss.id OR al.actor_type <> 'system' OR al.action <> 'subscription.initialized'
       OR al.resulting_status <> 'trialing' OR al.resulting_package_id <> 'starter' OR al.resulting_offer <> 'standard'
       OR al.transition_source <> 'bootstrap' OR al.reason <> '30-day trial initialized with shop creation'
       OR al.previous_status IS NOT NULL OR al.previous_package_id IS NOT NULL OR al.previous_offer IS NOT NULL
       OR al.actor_id IS NOT NULL OR al.idempotency_key IS NOT NULL OR al.request_fingerprint IS NOT NULL THEN
      RAISE EXCEPTION 'assert: audit row semantics wrong for shop %.', v_shop; END IF;
  END LOOP;
END $$;

-- 12. redacted seed manifest (consumed by the teardown). IDs are opaque
--     synthetic UUIDs — safe. No names/phones/LINE ids beyond the synthetic label.
SELECT jsonb_build_object(
  'manifest_version', 1,
  'kind', 'h3d-authz-fixture-seed-manifest',
  'seeded_at', statement_timestamp(),
  'txid', txid_current(),
  'project_ref', 'ykxlqnshaaxmzzocpjlj',
  'line_user_label', 'H3D-PROOF-LINE-USER-A',
  'fixture_ids', jsonb_build_object(
    'shop_a', '0d15d05a-0000-4000-8000-00000000a001',
    'shop_b', '0d15d05a-0000-4000-8000-00000000b002',
    'owner_a', '0d15d05a-0000-4000-8000-0000000aa011',
    'owner_b', '0d15d05a-0000-4000-8000-0000000bb012',
    'pet_a', '0d15d05a-0000-4000-8000-00000aa00021',
    'pet_b', '0d15d05a-0000-4000-8000-00000bb00022',
    'room_a', '0d15d05a-0000-4000-8000-000000000031',
    'plan_a', '0d15d05a-0000-4000-8000-000000000041'
  ),
  'generated_ids', jsonb_build_object(
    'subscription_a', (SELECT id FROM ps01.shop_subscriptions WHERE shop_id='0d15d05a-0000-4000-8000-00000000a001'),
    'subscription_b', (SELECT id FROM ps01.shop_subscriptions WHERE shop_id='0d15d05a-0000-4000-8000-00000000b002'),
    'audit_a', (SELECT id FROM ps01.subscription_audit_log WHERE shop_id='0d15d05a-0000-4000-8000-00000000a001'),
    'audit_b', (SELECT id FROM ps01.subscription_audit_log WHERE shop_id='0d15d05a-0000-4000-8000-00000000b002')
  ),
  'pre_seed_counts', (SELECT jsonb_object_agg(t, n) FROM _h3d_pre),
  'expected_delta', jsonb_build_object('shops',2,'pet_owners',2,'pets',2,'rooms',1,'room_rate_plans',1,'shop_subscriptions',2,'subscription_audit_log',2)
) AS h3d_seed_manifest;

COMMIT;
