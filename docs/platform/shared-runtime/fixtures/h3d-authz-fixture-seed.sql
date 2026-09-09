-- H3D disposable AUTHZ fixture — FORWARD SEED. WSTERA LAB only.
-- Platform postgres session. One transaction. Rerun-aware (fails closed on any
-- pre-existing fixture id). INSERT only into ps01 fixture tables — the two
-- support rows per shop (shop_subscriptions + subscription_audit_log) are created
-- automatically by the existing AFTER INSERT trigger on ps01.shops
-- (trg_initialize_shop_subscription_after_insert -> initialize_shop_subscription_internal),
-- which starts a 30-day 'trialing' subscription. No trigger is disabled here.
--
-- DO NOT APPLY without explicit Owner/House authorization. A committed file is
-- not authorization to execute it.
--
-- Fixture ids (deterministic, obviously synthetic — prefix 0d15d05a = "disposa"):
--   SHOP A   0d15d05a-0000-4000-8000-00000000a001   baseline shop
--   SHOP B   0d15d05a-0000-4000-8000-00000000b002   cross-shop target (POS-AUTHZ-1)
--   OWNER A  0d15d05a-0000-4000-8000-0000000aa011   SHOP A, LINE-linked, baseline customer
--   OWNER B  0d15d05a-0000-4000-8000-0000000bb012   SHOP A, different customer, NOT LINE-linked
--   PET A    0d15d05a-0000-4000-8000-00000aa00021   OWNER A / SHOP A, baseline positive context
--   PET B    0d15d05a-0000-4000-8000-00000bb00022   OWNER B / SHOP A, cross-customer target (POS-AUTHZ-3)
--   ROOM A   0d15d05a-0000-4000-8000-000000000031   SHOP A, capacity 2
--   PLAN A   0d15d05a-0000-4000-8000-000000000041   SHOP A, ROOM A, DAY/1, active

BEGIN;

DO $$
BEGIN
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION 'H3D fixture seed requires the platform postgres session.';
  END IF;
  IF EXISTS (SELECT 1 FROM ps01.shops WHERE id IN ('0d15d05a-0000-4000-8000-00000000a001','0d15d05a-0000-4000-8000-00000000b002'))
     OR EXISTS (SELECT 1 FROM ps01.pet_owners WHERE id IN ('0d15d05a-0000-4000-8000-0000000aa011','0d15d05a-0000-4000-8000-0000000bb012'))
     OR EXISTS (SELECT 1 FROM ps01.pets WHERE id IN ('0d15d05a-0000-4000-8000-00000aa00021','0d15d05a-0000-4000-8000-00000bb00022'))
     OR EXISTS (SELECT 1 FROM ps01.rooms WHERE id = '0d15d05a-0000-4000-8000-000000000031')
     OR EXISTS (SELECT 1 FROM ps01.room_rate_plans WHERE id = '0d15d05a-0000-4000-8000-000000000041') THEN
    RAISE EXCEPTION 'H3D fixture id(s) already present — run h3d-authz-fixture-teardown.sql first.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM ps01.commercial_packages WHERE id = 'starter') THEN
    RAISE EXCEPTION 'starter commercial package missing — shop trigger would fail.';
  END IF;
END $$;

-- shops (AFTER INSERT trigger initializes a 30-day trialing subscription each)
INSERT INTO ps01.shops (id, name, slug) VALUES
  ('0d15d05a-0000-4000-8000-00000000a001', 'H3D-PROOF Shop A', 'h3d-proof-shop-a'),
  ('0d15d05a-0000-4000-8000-00000000b002', 'H3D-PROOF Shop B', 'h3d-proof-shop-b');

-- owners (Owner A LINE-linked in Shop A; Owner B a distinct customer, Shop A, no LINE link)
INSERT INTO ps01.pet_owners (id, shop_id, line_user_id, first_name, phone) VALUES
  ('0d15d05a-0000-4000-8000-0000000aa011', '0d15d05a-0000-4000-8000-00000000a001', 'H3D-PROOF-LINE-USER-A', 'H3D-PROOF-Owner-A', 'H3D-PROOF-PHONE-A1'),
  ('0d15d05a-0000-4000-8000-0000000bb012', '0d15d05a-0000-4000-8000-00000000a001', NULL,                   'H3D-PROOF-Owner-B', 'H3D-PROOF-PHONE-B1');

-- pets (Pet A -> Owner A; Pet B -> Owner B; both Shop A)
INSERT INTO ps01.pets (id, shop_id, owner_id, name, species) VALUES
  ('0d15d05a-0000-4000-8000-00000aa00021', '0d15d05a-0000-4000-8000-00000000a001', '0d15d05a-0000-4000-8000-0000000aa011', 'H3D-PROOF-Pet-A', 'dog'),
  ('0d15d05a-0000-4000-8000-00000bb00022', '0d15d05a-0000-4000-8000-00000000a001', '0d15d05a-0000-4000-8000-0000000bb012', 'H3D-PROOF-Pet-B', 'cat');

-- room + active rate plan, in Shop A, plan.room_id = room.id (Invariant A)
INSERT INTO ps01.rooms (id, shop_id, room_number, room_type, capacity_pets, base_price_per_night) VALUES
  ('0d15d05a-0000-4000-8000-000000000031', '0d15d05a-0000-4000-8000-00000000a001', 'H3D-PROOF-R1', 'standard', 2, 1000.00);

INSERT INTO ps01.room_rate_plans (id, shop_id, room_id, unit, quantity, price) VALUES
  ('0d15d05a-0000-4000-8000-000000000041', '0d15d05a-0000-4000-8000-00000000a001', '0d15d05a-0000-4000-8000-000000000031', 'DAY', 1, 1000.00);

-- relationship assertions (fail closed on any mismatch)
DO $$
BEGIN
  IF (SELECT count(*) FROM ps01.shops WHERE id IN ('0d15d05a-0000-4000-8000-00000000a001','0d15d05a-0000-4000-8000-00000000b002')) <> 2 THEN
    RAISE EXCEPTION 'assert: Shop A and Shop B must both exist.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM ps01.pet_owners
        WHERE id='0d15d05a-0000-4000-8000-0000000aa011' AND shop_id='0d15d05a-0000-4000-8000-00000000a001'
          AND line_user_id='H3D-PROOF-LINE-USER-A') THEN
    RAISE EXCEPTION 'assert: Owner A must be linked to Shop A with the disposable LINE id.'; END IF;
  IF EXISTS (SELECT 1 FROM ps01.pet_owners
        WHERE shop_id='0d15d05a-0000-4000-8000-00000000b002' AND line_user_id='H3D-PROOF-LINE-USER-A') THEN
    RAISE EXCEPTION 'assert: the LINE id must have NO pet_owners link to Shop B.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM ps01.pet_owners
        WHERE id='0d15d05a-0000-4000-8000-0000000bb012' AND shop_id='0d15d05a-0000-4000-8000-00000000a001')
     OR '0d15d05a-0000-4000-8000-0000000bb012' = '0d15d05a-0000-4000-8000-0000000aa011' THEN
    RAISE EXCEPTION 'assert: Owner B must be distinct from Owner A and belong to Shop A.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM ps01.pets
        WHERE id='0d15d05a-0000-4000-8000-00000bb00022' AND shop_id='0d15d05a-0000-4000-8000-00000000a001'
          AND owner_id='0d15d05a-0000-4000-8000-0000000bb012') THEN
    RAISE EXCEPTION 'assert: Pet B must belong to Owner B and Shop A.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM ps01.pets
        WHERE id='0d15d05a-0000-4000-8000-00000aa00021' AND shop_id='0d15d05a-0000-4000-8000-00000000a001'
          AND owner_id='0d15d05a-0000-4000-8000-0000000aa011') THEN
    RAISE EXCEPTION 'assert: Pet A must belong to Owner A and Shop A.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM ps01.rooms
        WHERE id='0d15d05a-0000-4000-8000-000000000031' AND shop_id='0d15d05a-0000-4000-8000-00000000a001'
          AND capacity_pets >= 2) THEN
    RAISE EXCEPTION 'assert: Room A must belong to Shop A with capacity >= 2.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM ps01.room_rate_plans
        WHERE id='0d15d05a-0000-4000-8000-000000000041'
          AND shop_id='0d15d05a-0000-4000-8000-00000000a001'
          AND room_id='0d15d05a-0000-4000-8000-000000000031'
          AND is_active) THEN
    RAISE EXCEPTION 'assert: Rate Plan A must be active and belong to Room A + Shop A (Invariant A).'; END IF;
  -- support rows the trigger created
  IF (SELECT count(*) FROM ps01.shop_subscriptions
        WHERE shop_id IN ('0d15d05a-0000-4000-8000-00000000a001','0d15d05a-0000-4000-8000-00000000b002')
          AND status='trialing') <> 2 THEN
    RAISE EXCEPTION 'assert: each fixture shop must have exactly one trialing subscription (trigger support row).'; END IF;
END $$;

SELECT jsonb_build_object(
  'shop_a', '0d15d05a-0000-4000-8000-00000000a001',
  'shop_b', '0d15d05a-0000-4000-8000-00000000b002',
  'owner_a', '0d15d05a-0000-4000-8000-0000000aa011',
  'owner_b', '0d15d05a-0000-4000-8000-0000000bb012',
  'pet_a', '0d15d05a-0000-4000-8000-00000aa00021',
  'pet_b', '0d15d05a-0000-4000-8000-00000bb00022',
  'room_a', '0d15d05a-0000-4000-8000-000000000031',
  'plan_a', '0d15d05a-0000-4000-8000-000000000041',
  'line_user_id', 'H3D-PROOF-LINE-USER-A',
  'subscriptions_created', (SELECT count(*) FROM ps01.shop_subscriptions WHERE shop_id IN ('0d15d05a-0000-4000-8000-00000000a001','0d15d05a-0000-4000-8000-00000000b002')),
  'audit_rows_created', (SELECT count(*) FROM ps01.subscription_audit_log WHERE shop_id IN ('0d15d05a-0000-4000-8000-00000000a001','0d15d05a-0000-4000-8000-00000000b002'))
) AS h3d_fixture_seed_result;

COMMIT;
