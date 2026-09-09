-- H3D disposable AUTHZ fixture — PRECHECK. SELECT ONLY. WSTERA LAB.
-- Run before the seed. Every count in P1 must be 0. P2/P3 record the pre-seed
-- baseline so the post-teardown residue assertion can prove exact restoration.
-- No DML. No trigger changes.

-- P1: none of the exact fixture ids may already exist.
SELECT 'P1 fixture-id collision (all must be 0)' AS check,
  (SELECT count(*) FROM ps01.shops           WHERE id IN ('0d15d05a-0000-4000-8000-00000000a001','0d15d05a-0000-4000-8000-00000000b002')) AS shops,
  (SELECT count(*) FROM ps01.pet_owners      WHERE id IN ('0d15d05a-0000-4000-8000-0000000aa011','0d15d05a-0000-4000-8000-0000000bb012')) AS pet_owners,
  (SELECT count(*) FROM ps01.pets            WHERE id IN ('0d15d05a-0000-4000-8000-00000aa00021','0d15d05a-0000-4000-8000-00000bb00022')) AS pets,
  (SELECT count(*) FROM ps01.rooms           WHERE id  = '0d15d05a-0000-4000-8000-000000000031') AS rooms,
  (SELECT count(*) FROM ps01.room_rate_plans WHERE id  = '0d15d05a-0000-4000-8000-000000000041') AS rate_plans;

-- P2: synthetic-label collision (all must be 0) — proves no real row uses our labels.
SELECT 'P2 synthetic-label collision (all must be 0)' AS check,
  (SELECT count(*) FROM ps01.shops        WHERE slug LIKE 'h3d-proof-%') AS shop_slugs,
  (SELECT count(*) FROM ps01.pet_owners   WHERE line_user_id LIKE 'H3D-PROOF-%' OR phone LIKE 'H3D-PROOF-%' OR first_name LIKE 'H3D-PROOF-%') AS owner_labels,
  (SELECT count(*) FROM ps01.pets         WHERE name LIKE 'H3D-PROOF-%') AS pet_labels,
  (SELECT count(*) FROM ps01.rooms        WHERE room_number LIKE 'H3D-PROOF-%') AS room_labels;

-- P3: pre-seed baseline row counts for the five fixture tables + the two
--     trigger-owned support tables (expected auto-created support = +2 each).
SELECT 'P3 pre-seed row counts' AS check,
  (SELECT count(*) FROM ps01.shops)                  AS shops,
  (SELECT count(*) FROM ps01.pet_owners)             AS pet_owners,
  (SELECT count(*) FROM ps01.pets)                   AS pets,
  (SELECT count(*) FROM ps01.rooms)                  AS rooms,
  (SELECT count(*) FROM ps01.room_rate_plans)        AS rate_plans,
  (SELECT count(*) FROM ps01.shop_subscriptions)     AS shop_subscriptions,
  (SELECT count(*) FROM ps01.subscription_audit_log) AS subscription_audit_log;

-- P4: the commercial 'starter' package the shop trigger relies on must exist.
SELECT 'P4 starter package present (must be 1)' AS check,
  (SELECT count(*) FROM ps01.commercial_packages WHERE id = 'starter') AS starter_package;
