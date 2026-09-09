# H3D — AUTHZ Fixture Discovery: STOP (LAB scarcity)

**Date:** 2026-09-09 (Asia/Bangkok)
**Environment:** WSTERA LAB (`ykxlqnshaaxmzzocpjlj`) — read-only throughout
**Brief:** `BRIEF-CLAUDE-H3D-AUTHZ-FIXTURE-REMEDIATION-2026-09-09.md`
**Status:** `STOP — real cross-shop / cross-customer AUTHZ fixtures do not exist in WSTERA LAB`

## 1. What was required

`POS-AUTHZ-1` and `POS-AUTHZ-3` are required-for-PASS probes in `h3c-proof-harness.mjs`. The remediation brief (correctly) rejects random/nonexistent UUIDs for them:
- `POS-AUTHZ-1` must use a **real** foreign shop the baseline LINE identity is not linked to;
- `POS-AUTHZ-3` must use **real** pets owned by a **different** customer.

## 2. PS01 relationship model (inspected read-only from live LAB)

RPC bodies (`SELECT pg_get_functiondef(...)` on `ps01`):

`get_customer_booking_context_v2_internal(p_verified_line_user_id, p_shop_id)`:
```
SELECT ... FROM shops WHERE id = p_shop_id;                          -- shop exists
SELECT id ... INTO v_owner_id FROM pet_owners
  WHERE shop_id = p_shop_id AND line_user_id = btrim(p_verified_line_user_id);  -- the link
IF NOT FOUND THEN RAISE 'Pet owner not found or not linked to shop.';
SELECT ... FROM pets p WHERE p.shop_id = p_shop_id AND p.owner_id = v_owner_id; -- owner's pets
```
`quote_customer_booking_v2_internal(...)`: same owner resolution, then
`resolve_booking_v2_quote_internal(p_shop_id, v_owner_id, p_room_id, p_rate_plan_id, p_pet_ids, ...)` — validates the pets against `v_owner_id`.

Catalog columns confirmed:
- `ps01.pet_owners(id uuid, shop_id uuid, line_user_id varchar)` — the customer↔shop link
- `ps01.shops(id uuid, slug varchar)`
- `ps01.pets(id uuid, shop_id uuid, owner_id uuid)`
- `ps01.rooms(id uuid, shop_id uuid, status varchar)`
- `ps01.room_rate_plans(id uuid, shop_id uuid, room_id uuid, is_active boolean)`

A valid fixture set therefore needs, from real rows:
- **A** — one `pet_owners` row with a non-empty `line_user_id` → baseline shop + owner + LINE id;
- **B** — a second `shops` row with **no** `pet_owners` link for that LINE id (proven by `NOT EXISTS`);
- **C** — `pets` with `owner_id <> baseline owner`, plus a `rooms` row and an active `room_rate_plans` row in the baseline shop (so a quote rejection is about the foreign pets, not a missing room/plan).

## 3. Live LAB state (read-only, 2026-09-09)

```
SELECT (SELECT count(*) FROM ps01.shops)          -- 0
     , (SELECT count(*) FROM ps01.pet_owners)     -- 0
     , (SELECT count(*) FROM ps01.pets)           -- 0
     , (SELECT count(*) FROM ps01.rooms)          -- 0
     , (SELECT count(*) FROM ps01.room_rate_plans)-- 0
```

Every PS01 business table is empty. This is expected: H3C's identity-first teardown + fixture teardown (`H3C-FIXTURE-TEARDOWN-MAINTENANCE-2026-09-09.sql`) removed the two H3C proof shops and all cascaded child rows, and "H3C residue counts are zero for shops, owners, pets, rooms, rate plans, subscriptions, audit rows, and bookings" (H3C closure).

## 4. Discovery result

`h3d-live-runner.mjs --preflight` runs `discoverAuthzFixtures()` (SELECT-only, every query guarded by `MUTATING_SQL`) **before any operator hook action or identity/grant creation**. Output:

```
verdict: "STOP — real cross-shop / cross-customer AUTHZ fixtures cannot be discovered
          read-only (Fixture A: no ps01.pet_owners row with a linked line_user_id
          exists in LAB). Seeding PS01 business rows is a LAB mutation and is not
          authorized here."
exit 1
```

`wstera_platform_internal.runtime_token_grants` row count immediately after: **0** — confirming the runner stopped before any mutation.

## 5. Why this is a STOP, not a workaround

Brief STOP condition #1: *"LAB does not contain enough real relationships for a valid cross-shop/cross-customer fixture set"* → STOP.
Brief: *"Any required mutation is a blocker and must STOP."* Creating shops/owners/pets is DML.
Brief: *"A STOP is the correct outcome when the real proof prerequisite does not exist. Do not fabricate a workaround."*

The random-UUID substitute is removed. `POS-AUTHZ-1/3` stay required-for-PASS and are not reclassified.

## 6. What is delivered (works once fixtures exist)

`discoverAuthzFixtures()` derives a valid, internally consistent matrix the moment real rows exist (an authorized fixture-seeding step, or PS01 staff-flow data in a future LAB state). `--preflight` fails closed until then; `--run` refuses with no fallback. Evidence records IDs + relationship assertions only — the LINE id is reduced to a 3-char prefix + short sha256 (`fixtureAssertion()`), no names/phones/emails/profile data.

## 7. Unblock options (operator / House decision — not taken here)

1. **Authorize a bounded, disposable PS01 fixture seed + teardown** for the H3D live proof (the H3C pattern: two shops, one LINE-linked owner, pets under a second owner, one room + active rate plan; teardown-first, same as `H3C-FIXTURE-TEARDOWN-MAINTENANCE`). This is a LAB mutation and needs its own authorization line.
2. **Run the H3D live proof against a LAB state that already has PS01 staff-flow data** (e.g. after the H5 authenticated-staff fixture is created for its own gate) and reuse those rows read-only.
3. Accept `POS-AUTHZ-1/3` as proven structurally from the RPC source + the H3B/H3C role boundary, with a documented reviewer waiver — **not** an agent decision.

## 8. Verdict

`H3D LIVE: STILL BLOCKED.` The operator-pack architecture, secure JWT handoff, control/expired-token paths, dependency isolation, teardown verification, and read-only fixture discovery are all in place and gate-green. The single remaining prerequisite — real PS01 cross-tenant rows in LAB — does not exist and cannot be created under this brief.
