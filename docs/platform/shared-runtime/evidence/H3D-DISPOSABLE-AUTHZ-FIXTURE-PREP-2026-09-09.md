# H3D — Disposable AUTHZ Fixture Package (PREPARED / LIVE DML AWAITING AUTHORIZATION)

**Date:** 2026-09-09 (Asia/Bangkok)
**Environment:** WSTERA LAB (`ykxlqnshaaxmzzocpjlj`) — read-only throughout this prep
**Brief:** `BRIEF-CLAUDE-H3D-DISPOSABLE-AUTHZ-FIXTURE-PREP-2026-09-09.md` (House unblock option 1)
**Status:** `H3D DISPOSABLE AUTHZ FIXTURE PACKAGE PREPARED / LIVE DML AWAITING AUTHORIZATION`

## Artifacts

| File | Kind |
|---|---|
| `fixtures/h3d-authz-fixture-precheck.sql` | SELECT-only precheck |
| `fixtures/h3d-authz-fixture-seed.sql` | forward seed (INSERT only, one txn, fails closed on pre-existing ids) |
| `fixtures/h3d-authz-fixture-teardown.sql` | exact teardown (DELETE only, one txn, residue assertion) |
| `tools/shared-runtime/h3d/h3d-live-runner.mjs` | `discoverAuthzFixtures()` updated for Invariant A + B |

**No SQL in this package has been executed against WSTERA LAB.** A committed
seed file is not authorization to run it (brief §"Commit / push policy").

## 1. Discovery-invariant repairs (runner)

### Invariant A — room + rate plan as one joined pair
`discoverAuthzFixtures()` `roomPlanPair` query:
```sql
SELECT r.id AS room_id, rp.id AS rate_plan_id, r.capacity_pets
FROM ps01.rooms r
JOIN ps01.room_rate_plans rp ON rp.room_id = r.id AND rp.shop_id = r.shop_id
WHERE r.shop_id = $1 AND rp.is_active = TRUE
ORDER BY r.id, rp.id LIMIT 1
```
Matches `resolve_booking_v2_quote_internal`'s `room_rate_plans WHERE id = p_rate_plan_id AND shop_id = p_shop_id AND room_id = p_room_id`. No mismatched pair possible.

### Invariant B — foreign pet isolates customer ownership within one shop
`foreignPets` query:
```sql
SELECT p.id
FROM ps01.pets p
JOIN ps01.pet_owners po2 ON po2.id = p.owner_id AND po2.shop_id = p.shop_id
WHERE p.shop_id = $1 AND po2.id <> $2   -- $1 baseline shop, $2 baseline owner
ORDER BY p.id LIMIT LEAST(2, capacity_pets)
```
Matches `assert_booking_window_available_internal`'s pet check
`pets WHERE shop_id = p_shop_id AND owner_id = p_owner_id AND id = ANY(p_pet_ids)`.
The `POS-AUTHZ-3` rejection (`Invalid pet selection for booking owner.`) then proves
**cross-customer** ownership isolation inside one shop, not just shop scope.

Baseline positive-context pet (`Fixture A`) is also discovered and wired as
`H3C_FIX_PET_IDS`. Selftests assert both invariant query shapes and that no
AUTHZ fixture (`H3C_FIX_SHOP_ID/LINE_USER_ID/PET_IDS/OTHER_SHOP_ID/ROOM_ID/RATE_PLAN_ID/OTHER_PET_IDS`)
has a random substitute.

## 2. PS01 RPC contract inspected (live `pg_get_functiondef`, read-only)

- `get_customer_booking_context_v2_internal` — owner via `pet_owners(shop_id, line_user_id)`.
- `quote_customer_booking_v2_internal` → `resolve_booking_v2_quote_internal` — rate plan on `(id, shop_id, room_id)` → `assert_booking_window_available_internal` — owner exists for shop; `capacity_pets >= |pets|`; every pet satisfies `(shop_id, owner_id, id)`; no maintenance/booking overlap.
- Customer path touches **no** subscription/entitlement gate directly (those gate DDL/mutation, not read/quote).

## 3. Trigger / FK surface inspected (read-only)

| Table | Trigger | Effect on the seed |
|---|---|---|
| `ps01.shops` | `trg_initialize_shop_subscription_after_insert` | AFTER INSERT → `initialize_shop_subscription_internal(NEW.id)` inserts one `shop_subscriptions` (`package_id='starter'`, `status='trialing'`, `trial_ends_at = now()+30d`) and one `subscription_audit_log` (`action='subscription.initialized'`). **Required support rows, auto-created.** |
| `ps01.pet_owners` | `trg_pet_owners_commercial_access` (BEFORE I/U/D) → `assert_shop_commercial_mutation_allowed` | Passes: the trialing subscription gives `commercial_access = TRUE` for 30 days (`resolve_shop_commercial_authority`). |
| `ps01.pets` | `trg_enforce_pet_commercial_quota` (BEFORE INSERT) | Passes: subscription initialized, `commercial_access = TRUE`, 2 pets ≪ starter `pet_history_limit`. |
| `ps01.rooms` | `trg_enforce_room_commercial_quota` (BEFORE INSERT) | Passes: 1 room ≪ starter `room_limit`. |
| `ps01.subscription_audit_log` | `trg_subscription_audit_immutable` | Blocks DELETE — teardown reuses the exact H3C precedent (disable that one trigger, delete only the two fixture shops' rows, re-enable). |

FKs referencing the fixture tables that matter for teardown: `pets`, `room_rate_plans`,
`shop_subscriptions`, `subscription_audit_log`, `booking_requests`, `bookings`,
`booking_pets`, `staff_users`, camera/sync/daily-report tables all
`ON DELETE CASCADE` from `shops`. The teardown deletes leaf rows explicitly, then
handles the audit rows, then subscriptions, then shops.

`ps01.commercial_packages` has 3 rows incl. `starter` (precheck P4 re-verifies).

## 4. Fixture topology + exact IDs

Deterministic, obviously synthetic (prefix `0d15d05a` = "disposa"), version nibble 4, variant 8.

| Row | ID | Belongs to | Purpose |
|---|---|---|---|
| Shop A | `0d15d05a-0000-4000-8000-00000000a001` | — | baseline shop (context + quote) |
| Shop B | `0d15d05a-0000-4000-8000-00000000b002` | — | `POS-AUTHZ-1` cross-shop target |
| Owner A | `0d15d05a-0000-4000-8000-0000000aa011` | Shop A | baseline customer, `line_user_id = 'H3D-PROOF-LINE-USER-A'` |
| Owner B | `0d15d05a-0000-4000-8000-0000000bb012` | Shop A | distinct customer, no LINE link — owns the `POS-AUTHZ-3` pet |
| Pet A | `0d15d05a-0000-4000-8000-00000aa00021` | Owner A / Shop A | baseline positive context (`H3C_FIX_PET_IDS`) |
| Pet B | `0d15d05a-0000-4000-8000-00000bb00022` | Owner B / Shop A | `POS-AUTHZ-3` cross-customer target |
| Room A | `0d15d05a-0000-4000-8000-000000000031` | Shop A | capacity 2, `H3C_FIX_ROOM_ID` |
| Rate Plan A | `0d15d05a-0000-4000-8000-000000000041` | Shop A + Room A | `DAY/1`, active, `H3C_FIX_RATE_PLAN_ID` (Invariant A pair) |

Every row is required: the 2 shops, 2 owners, 2 pets, 1 room, 1 rate plan are the
minimum to satisfy `POS-1/2` (real success), `POS-AUTHZ-1` (real cross-shop),
`POS-AUTHZ-2` (blank-line-user against a real shop), `POS-AUTHZ-3` (real
cross-customer pet). No bookings, staff, subscriptions (beyond the trigger's),
commercial assignments, or unrelated rows.

## 5. Relationship assertions the seed proves (post-INSERT, in-transaction)

1. Shop A and Shop B both exist.
2. Owner A → Shop A + disposable LINE id.
3. that LINE id has **no** `pet_owners` link to Shop B.
4. Owner B is distinct from Owner A and belongs to Shop A.
5. Pet B → Owner B + Shop A; Pet A → Owner A + Shop A.
6. Room A → Shop A, `capacity_pets >= 2`.
7. Rate Plan A active, `shop_id = Shop A`, `room_id = Room A` (Invariant A).
8. each fixture shop has exactly one `trialing` subscription (trigger support row).

## 6. Expected row-count delta

| Table | Δ | Note |
|---|---|---|
| `ps01.shops` | +2 | |
| `ps01.pet_owners` | +2 | |
| `ps01.pets` | +2 | |
| `ps01.rooms` | +1 | |
| `ps01.room_rate_plans` | +1 | |
| `ps01.shop_subscriptions` | +2 | trigger support (1 per shop) |
| `ps01.subscription_audit_log` | +2 | trigger support (1 per shop) |
| everything else | 0 | |

Total inserted-by-seed: **8 rows**. Trigger-created support: **4 rows**. Nothing else.

## 7. Teardown order (all in one transaction)

1. `DELETE room_rate_plans` (Plan A)
2. `DELETE pets` (Pet A, Pet B)
3. `DELETE rooms` (Room A)
4. `DELETE pet_owners` (Owner A, Owner B)
5. `DISABLE TRIGGER trg_subscription_audit_immutable` → `DELETE subscription_audit_log WHERE shop_id IN (A,B)` → `ENABLE TRIGGER`
6. `DELETE shop_subscriptions WHERE shop_id IN (A,B)`
7. `DELETE shops` (A, B)
8. residue assertion: all 12 counts (exact ids + synthetic labels + bookings) = 0, else `RAISE`
9. re-assert `trg_subscription_audit_immutable` is enabled

Post-teardown, `ps01.*` returns to the pre-seed row-count baseline recorded by
`h3d-authz-fixture-precheck.sql` P3.

## 8. Static review

The three SQL files were reviewed against the live catalog DDL for `shops`,
`pet_owners`, `pets`, `rooms`, `room_rate_plans`, `shop_subscriptions`,
`subscription_audit_log`, `commercial_packages`, plus the trigger/FK inspection
above and the canonical `supabase/shared-runtime/ps01-baseline.sql`. **Not
executed** — no local Supabase on this host (no Docker); LAB execution awaits
authorization.

Column coverage: `shops(id,name,slug)` — `slug UNIQUE NOT NULL`, `subscription_status`
defaulted by trigger. `pet_owners(id,shop_id,line_user_id,first_name,phone)` —
`phone NOT NULL`, `UNIQUE(shop_id,phone)`, `UNIQUE(shop_id,line_user_id)` (NULL for
Owner B is allowed). `pets(id,shop_id,owner_id,name,species)` — `species CHECK IN
('dog','cat')`, composite FK `(shop_id,owner_id)→pet_owners`. `rooms(id,shop_id,
room_number,room_type,capacity_pets,base_price_per_night)` — `room_type CHECK IN
('standard',…)`, `capacity_pets >= 1`, `UNIQUE(shop_id,room_number)`. `room_rate_plans
(id,shop_id,room_id,unit,quantity,price)` — `unit CHECK IN ('HOUR','DAY','MONTH')`,
`quantity > 0`, `UNIQUE(shop_id,room_id,unit,quantity)`, composite FK `(shop_id,
room_id)→rooms`.

## 9. Privacy / security

All data synthetic, `H3D-PROOF-*` labelled. No real names / phones / emails /
LINE identifiers / pet names / credentials. No RLS / grant / schema / hook /
role / EXECUTE widening. No PS01 business-logic change. The only control touched
is the pre-existing immutable-audit trigger, disabled for exactly the two
fixture shops' rows and re-enabled in the same transaction (H3C precedent).

## 10. Verification (this prep, no seed applied)

| Gate | Result |
|---|---|
| `npm run selftest` (h3c + h4 + h3d) | PASS — h3d selftest now also asserts Invariant A + B query shapes and no random AUTHZ substitute |
| PS01 H3D focused static test | 7/7 PASS |
| `pnpm exec tsc --noEmit` | PASS |
| `pnpm lint` | PASS |
| PS01 boundary verifier | PASS |
| secret scan (full remediation diff) | clean |
| `git diff` review | only the h3d runner + 3 fixture SQL + 2 docs; no unrelated change |

`h3d-live-runner.mjs --preflight` still STOPs (LAB has no PS01 rows yet):
`Fixture A: no ps01.pet_owners row with a linked line_user_id AND at least one owned pet exists in LAB`.

## 11. Live authorization boundary

`PREPARED / REVIEW-READY` → Secretary/House review of these three SQL files →
**explicit Owner/House authorization** → apply `h3d-authz-fixture-seed.sql` →
`h3d-live-runner.mjs --preflight` (now READY) → operator enables the hook →
`--run` → `--run` teardown of Auth identities/grant → operator disables the hook →
apply `h3d-authz-fixture-teardown.sql` → re-run inventory/compare (signature
match) → mark H3D PASS.

Claude does not apply the seed, enable the hook, run H3D live, or start
H3E/H3F/H4/H5. HOUSE-A remains closed; BK01 remains quarantined.
