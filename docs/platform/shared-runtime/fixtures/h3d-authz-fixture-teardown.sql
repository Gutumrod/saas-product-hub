-- H3D disposable AUTHZ fixture — EXACT TEARDOWN. WSTERA LAB only.
-- Platform postgres session. One transaction. DELETE only, by exact id.
--
-- subscription_audit_log rows for the fixture shops are ON DELETE CASCADE from
-- ps01.shops but protected by trg_subscription_audit_immutable. This teardown
-- reuses the exact narrowly-scoped H3C precedent (H3C-FIXTURE-TEARDOWN-
-- MAINTENANCE-2026-09-09.sql): disable that one trigger, delete only the two
-- fixture shops' audit rows, re-enable it immediately. No other control is touched.
--
-- DO NOT APPLY without explicit Owner/House authorization.

BEGIN;

DO $$
BEGIN
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION 'H3D fixture teardown requires the platform postgres session.';
  END IF;
END $$;

-- leaf rows first
DELETE FROM ps01.room_rate_plans WHERE id = '0d15d05a-0000-4000-8000-000000000041';
DELETE FROM ps01.pets           WHERE id IN ('0d15d05a-0000-4000-8000-00000aa00021','0d15d05a-0000-4000-8000-00000bb00022');
DELETE FROM ps01.rooms          WHERE id = '0d15d05a-0000-4000-8000-000000000031';
DELETE FROM ps01.pet_owners     WHERE id IN ('0d15d05a-0000-4000-8000-0000000aa011','0d15d05a-0000-4000-8000-0000000bb012');

-- trigger-created support rows for the two fixture shops
ALTER TABLE ps01.subscription_audit_log DISABLE TRIGGER trg_subscription_audit_immutable;
DELETE FROM ps01.subscription_audit_log
  WHERE shop_id IN ('0d15d05a-0000-4000-8000-00000000a001','0d15d05a-0000-4000-8000-00000000b002');
ALTER TABLE ps01.subscription_audit_log ENABLE TRIGGER trg_subscription_audit_immutable;

DELETE FROM ps01.shop_subscriptions
  WHERE shop_id IN ('0d15d05a-0000-4000-8000-00000000a001','0d15d05a-0000-4000-8000-00000000b002');
DELETE FROM ps01.shops
  WHERE id IN ('0d15d05a-0000-4000-8000-00000000a001','0d15d05a-0000-4000-8000-00000000b002');

-- exact residue assertion — every count must be 0
DO $$
DECLARE v jsonb;
BEGIN
  v := jsonb_build_object(
    'shops',              (SELECT count(*) FROM ps01.shops WHERE id IN ('0d15d05a-0000-4000-8000-00000000a001','0d15d05a-0000-4000-8000-00000000b002')),
    'pet_owners',         (SELECT count(*) FROM ps01.pet_owners WHERE id IN ('0d15d05a-0000-4000-8000-0000000aa011','0d15d05a-0000-4000-8000-0000000bb012')),
    'pets',               (SELECT count(*) FROM ps01.pets WHERE id IN ('0d15d05a-0000-4000-8000-00000aa00021','0d15d05a-0000-4000-8000-00000bb00022')),
    'rooms',              (SELECT count(*) FROM ps01.rooms WHERE id = '0d15d05a-0000-4000-8000-000000000031'),
    'rate_plans',         (SELECT count(*) FROM ps01.room_rate_plans WHERE id = '0d15d05a-0000-4000-8000-000000000041'),
    'shop_subscriptions', (SELECT count(*) FROM ps01.shop_subscriptions WHERE shop_id IN ('0d15d05a-0000-4000-8000-00000000a001','0d15d05a-0000-4000-8000-00000000b002')),
    'audit_log',          (SELECT count(*) FROM ps01.subscription_audit_log WHERE shop_id IN ('0d15d05a-0000-4000-8000-00000000a001','0d15d05a-0000-4000-8000-00000000b002')),
    'slug_labels',        (SELECT count(*) FROM ps01.shops WHERE slug LIKE 'h3d-proof-%'),
    'owner_labels',       (SELECT count(*) FROM ps01.pet_owners WHERE line_user_id LIKE 'H3D-PROOF-%' OR phone LIKE 'H3D-PROOF-%' OR first_name LIKE 'H3D-PROOF-%'),
    'pet_labels',         (SELECT count(*) FROM ps01.pets WHERE name LIKE 'H3D-PROOF-%'),
    'room_labels',        (SELECT count(*) FROM ps01.rooms WHERE room_number LIKE 'H3D-PROOF-%'),
    'bookings',           (SELECT count(*) FROM ps01.bookings WHERE shop_id IN ('0d15d05a-0000-4000-8000-00000000a001','0d15d05a-0000-4000-8000-00000000b002'))
  );
  IF (SELECT bool_or(value::int <> 0) FROM jsonb_each_text(v)) THEN
    RAISE EXCEPTION 'H3D fixture residue detected: %', v;
  END IF;
  RAISE NOTICE 'H3D fixture teardown residue: % (all zero)', v;
END $$;

-- re-assert the immutable trigger is back on
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname='ps01' AND c.relname='subscription_audit_log'
      AND t.tgname='trg_subscription_audit_immutable' AND t.tgenabled <> 'D'
  ) THEN
    RAISE EXCEPTION 'trg_subscription_audit_immutable was not re-enabled.';
  END IF;
END $$;

COMMIT;
