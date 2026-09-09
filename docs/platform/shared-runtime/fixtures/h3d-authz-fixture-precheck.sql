-- H3D disposable AUTHZ fixture — PRECHECK (EVIDENCE ONLY). SELECT ONLY. WSTERA LAB.
--
-- This file is NOT the seed guard and MUST NEVER be treated as one. The
-- authoritative preconditions live inside h3d-authz-fixture-seed.sql steps 2-7,
-- executed atomically under the seed's table locks. This precheck is captured
-- once for the evidence bundle to record the pre-seed state a human reviews
-- before granting fixture-DML authorization (F01).
--
-- No DML. No trigger changes. No ALTER.

-- E1: exact fixture-id collision (all must be 0).
SELECT 'E1 fixture-id collision' AS check,
  (SELECT count(*) FROM ps01.shops           WHERE id IN ('0d15d05a-0000-4000-8000-00000000a001','0d15d05a-0000-4000-8000-00000000b002')) AS shops,
  (SELECT count(*) FROM ps01.pet_owners      WHERE id IN ('0d15d05a-0000-4000-8000-0000000aa011','0d15d05a-0000-4000-8000-0000000bb012')) AS pet_owners,
  (SELECT count(*) FROM ps01.pets            WHERE id IN ('0d15d05a-0000-4000-8000-00000aa00021','0d15d05a-0000-4000-8000-00000bb00022')) AS pets,
  (SELECT count(*) FROM ps01.rooms           WHERE id  = '0d15d05a-0000-4000-8000-000000000031') AS rooms,
  (SELECT count(*) FROM ps01.room_rate_plans WHERE id  = '0d15d05a-0000-4000-8000-000000000041') AS rate_plans;

-- E2: synthetic-label collision, case-normalised (all must be 0).
SELECT 'E2 synthetic-label collision' AS check,
  (SELECT count(*) FROM ps01.shops      WHERE lower(slug) LIKE 'h3d-proof-%' OR lower(name) LIKE 'h3d-proof %') AS shop_labels,
  (SELECT count(*) FROM ps01.pet_owners WHERE upper(line_user_id) LIKE 'H3D-PROOF-%' OR upper(phone) LIKE 'H3D-PROOF-%' OR upper(first_name) LIKE 'H3D-PROOF-%') AS owner_labels,
  (SELECT count(*) FROM ps01.pets       WHERE upper(name) LIKE 'H3D-PROOF-%') AS pet_labels,
  (SELECT count(*) FROM ps01.rooms      WHERE upper(room_number) LIKE 'H3D-PROOF-%') AS room_labels;

-- E3: accepted pre-seed baseline — EMPTY for every shop-rooted PS01 table.
SELECT 'E3 pre-seed row counts (accepted baseline = all 0)' AS check,
  (SELECT count(*) FROM ps01.shops) shops, (SELECT count(*) FROM ps01.staff_users) staff_users,
  (SELECT count(*) FROM ps01.pet_owners) pet_owners, (SELECT count(*) FROM ps01.pets) pets,
  (SELECT count(*) FROM ps01.rooms) rooms, (SELECT count(*) FROM ps01.room_rate_plans) rate_plans,
  (SELECT count(*) FROM ps01.bookings) bookings, (SELECT count(*) FROM ps01.booking_pets) booking_pets,
  (SELECT count(*) FROM ps01.booking_requests) booking_requests, (SELECT count(*) FROM ps01.daily_reports) daily_reports,
  (SELECT count(*) FROM ps01.google_sync_mappings) google_sync_mappings, (SELECT count(*) FROM ps01.sync_queue) sync_queue,
  (SELECT count(*) FROM ps01.camera_settings) camera_settings, (SELECT count(*) FROM ps01.camera_visitor_credentials) camera_visitor_credentials,
  (SELECT count(*) FROM ps01.shop_commercial_assignments) shop_commercial_assignments, (SELECT count(*) FROM ps01.import_batches) import_batches,
  (SELECT count(*) FROM ps01.shop_subscriptions) shop_subscriptions, (SELECT count(*) FROM ps01.subscription_audit_log) subscription_audit_log;

-- E4: starter commercial package + its consumed semantics (must be one usable row).
SELECT 'E4 starter package' AS check, id, name, room_limit, pet_history_limit, monthly_price, annual_price, support_tier
FROM ps01.commercial_packages WHERE id = 'starter';

-- E5: the six triggers the seed depends on must be present and enabled ('O').
SELECT 'E5 required triggers' AS check, c.relname AS table, t.tgname,
  CASE t.tgenabled WHEN 'O' THEN 'enabled' ELSE t.tgenabled::text END AS state
FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'ps01' AND NOT t.tgisinternal
  AND t.tgname IN ('trg_initialize_shop_subscription_after_insert','trg_prevent_legacy_subscription_status_write',
                   'trg_pet_owners_commercial_access','trg_enforce_pet_commercial_quota',
                   'trg_enforce_room_commercial_quota','trg_subscription_audit_immutable')
ORDER BY c.relname, t.tgname;
