# BRIEF — Claude H3D Disposable AUTHZ Fixture Preparation

**Date:** 2026-09-09 (Asia/Bangkok)
**Mode:** WSTERA HOUSE / H3D DISPOSABLE FIXTURE PREP ONLY
**Environment:** WSTERA LAB (`ykxlqnshaaxmzzocpjlj`) only
**Status:** `H3D AUTHZ FIXTURE SEED PREP AUTHORIZED / LIVE DML NOT AUTHORIZED`

## House decision

The current STOP is accepted as correct: WSTERA LAB contains no PS01 business rows capable of satisfying required-for-PASS `POS-AUTHZ-1` and `POS-AUTHZ-3`.

House selects **unblock option 1**: prepare a bounded, disposable PS01 fixture seed + teardown package specifically for H3D.

This brief authorizes **preparation and static verification only**. It does **not** authorize applying INSERT/UPDATE/DELETE or any other LAB mutation yet.

Do not enable the Custom Access Token hook. Do not run H3D live. Do not start H3E/H3F/H4/H5.

## Rejected alternatives

Option 2 (wait for H5 fixture) is rejected under the locked gate order because H5 is downstream of H3 PASS/H4 and therefore cannot be used as an H3D prerequisite without creating a dependency inversion/cycle.

Option 3 (reviewer waiver / structural-only proof) is rejected because it weakens required `POS-AUTHZ-1/3` runtime proof.
## Locked source state

House worktree:
`D:\AI-Workspace\runtime\worktrees\house-h3d-h5-20260909`
branch `work/house-h3d-h5-20260909` @ `7ceab91`, pushed `0/0`, clean at review.

PS01 worktree:
`D:\AI-Workspace\runtime\worktrees\ps01-h3d-data-api-20260909`
branch `work/ps01-h3d-data-api-20260909` @ `4efee70`, pushed `0/0`, clean at review.

Accepted evidence:
- `evidence/H3D-AUTHZ-FIXTURE-STOP-2026-09-09.md`
- `evidence/H3C-FINAL-LIVE-PROOF-ATTEMPT1-2026-09-09.json`
- `evidence/H3C-FIXTURE-TEARDOWN-MAINTENANCE-2026-09-09.sql`
- PS01 canonical source `supabase/shared-runtime/ps01-baseline.sql`

Current LAB scarcity is accepted: `shops=0`, `pet_owners=0`, `pets=0`, `rooms=0`, `room_rate_plans=0`.

## Two discovery invariants House found during review

Before preparing the seed, repair `discoverAuthzFixtures()` so its success criteria match the real RPC contract exactly.
### Invariant A — rate plan must belong to the selected room

`resolve_booking_v2_quote_internal` requires all three simultaneously:
- `room_rate_plans.id = p_rate_plan_id`
- `room_rate_plans.shop_id = p_shop_id`
- `room_rate_plans.room_id = p_room_id`

The current discovery queries `rooms` and active `room_rate_plans` independently. That can produce a mismatched room/plan pair and cause a false rejection unrelated to pet ownership.

Fix discovery to derive the room and active rate plan as a **single joined pair** (or equivalent invariant assertion) where `plan.room_id = room.id` and both belong to the baseline shop.

### Invariant B — foreign pet must isolate customer ownership, not shop scope

`assert_booking_window_available_internal` validates pets by both:
`shop_id = p_shop_id AND owner_id = p_owner_id AND id = ANY(p_pet_ids)`.

The current discovery selects any pet with `owner_id <> baseline_owner_id`, without constraining `shop_id`.

Fix it so the `POS-AUTHZ-3` pet is:
- a real `ps01.pets` row;
- `shop_id = baseline_shop_id`;
- `owner_id <> baseline_owner_id`;
- backed by a real second `pet_owners` row in that same baseline shop.

This makes the rejection specifically demonstrate cross-customer ownership isolation inside one shop.

## Required disposable fixture topology

Prepare one minimal, deterministic fixture family with explicit IDs and an exact teardown manifest.

Required rows:
- **Shop A** — baseline shop used by customer-context and quote probes.
- **Shop B** — real second shop used only for `POS-AUTHZ-1` cross-shop isolation.
- **Owner A** — belongs to Shop A and has a non-empty disposable LINE user id.
- **Pet A** — belongs to Owner A in Shop A; baseline positive context.
- **Owner B** — different owner, also in Shop A.
- **Pet B** — belongs to Owner B in Shop A; used by `POS-AUTHZ-3`.
- **Room A** — belongs to Shop A and has capacity sufficient for the probe.
- **Rate Plan A** — active, belongs to Shop A, and `room_id = Room A.id`.

The seed may include only additional rows that are strictly required by existing PS01 foreign keys / invariants. If additional support rows are required, enumerate and justify them in the prep report before any live authorization request.

Do not create bookings, subscriptions, staff users, production-like customer data, or unrelated product rows merely for convenience.

## Seed package requirements

Prepare SQL/script artifacts that are reviewable before execution.

1. A **precheck** that is SELECT-only and proves the intended fixture IDs do not already exist and records current relevant row counts.
2. A **forward seed** that inserts only the approved disposable fixture family.
3. A **relationship assertion** section/query proving after seed:
   - Shop A and Shop B both exist;
   - Owner A is linked to Shop A + disposable LINE id;
   - the same LINE id has no `pet_owners` link to Shop B;
   - Owner B is distinct from Owner A and belongs to Shop A;
   - Pet B belongs to Owner B and Shop A;
   - Room A belongs to Shop A;
   - Rate Plan A is active and belongs to Room A + Shop A.
4. An **exact teardown** that removes only the disposable fixture family and any strictly-required support rows.
5. A **post-teardown residue assertion** returning zero for every exact fixture id and proving LAB returns to the pre-seed row-count/signature baseline.

Prefer a transaction-safe, deterministic, rerun-aware design. Seed must fail closed on unexpected pre-existing IDs or incompatible state; never silently overwrite real rows.

## Security / privacy constraints

All fixture data must be synthetic and disposable. Do not copy real customer names, phone numbers, emails, LINE identifiers, pet names, or production credentials.

Use clearly synthetic labels such as `H3D-PROOF-*`; use UUIDs only as deterministic fixture primary keys, not as substitutes for missing relationship proof.

No secrets in SQL, docs, git history, stdout evidence, or command lines. Continue using env names for credentials.

Do not widen RLS, grants, schema exposure, hook ACL, role membership, or function EXECUTE privileges to make the seed easier.

Do not change PS01 business logic or H3C harness semantics to fit the fixture.

## Runner changes required in this prep

Update `discoverAuthzFixtures()` to enforce Invariant A and Invariant B before reporting `ok: true`.

Add selftests/static assertions that verify:
- room/rate-plan discovery is joined on both `shop_id` and `room_id`;
- foreign pet discovery constrains `pet.shop_id = baseline_shop_id`;
- foreign pet owner is real, distinct, and belongs to baseline shop;
- no random/nonexistent fallback is reintroduced for required AUTHZ fixtures;
- discovery remains SELECT-only and still runs before any hook-readiness identity/grant probe.

## Required verification before returning to House

Run, without applying the seed to LAB:
- House shared-runtime selftest suite (`h3c + h4 + h3d`);
- PS01 H3D focused static test;
- `tsc --noEmit`;
- `pnpm lint`;
- PS01 shared-runtime boundary verifier;
- secret scan for the full remediation diff;
- git diff review proving no unrelated changes.

The seed/teardown SQL itself must be syntax/static-reviewed against the current PS01 baseline schema and foreign-key relationships. Do not execute it merely to prove syntax under this brief.

If a local disposable PostgreSQL/Supabase instance already exists and can reproduce the exact PS01 schema without touching WSTERA LAB, optional rehearsal there is allowed. Clearly label such evidence LOCAL/NON-LAB and do not substitute it for the later LAB proof.

## STOP conditions

STOP and report rather than improvising if:
- valid fixture topology requires changing PS01 schema/business logic;
- seed requires disabling security controls beyond a narrowly justified existing immutable-audit teardown mechanism;
- teardown cannot prove exact residue zero;
- a required supporting row would affect BK01, MT01, shared billing, shared LINE, or another product;
- any seed step requires production data/secrets;
- discovery still has a path that can PASS with nonexistent or semantically mismatched rows.

## Deliverables

Return with:
1. updated `tools/shared-runtime/h3d/h3d-live-runner.mjs` implementing both discovery invariants;
2. proposed disposable seed artifact;
3. proposed exact teardown artifact;
4. a PREP evidence/report documenting fixture topology, exact IDs, relationship assertions, expected row-count delta, teardown order, and why every inserted row is necessary;
5. updated Operator Action Pack showing that live DML remains pending House/Owner authorization;
6. complete test/gate results;
7. House commit SHA, remote parity, and clean status.

PS01 branch should remain unchanged unless a genuine source defect is found. If unchanged, explicitly prove its HEAD/parity/clean status.

## Commit / push policy

Commit and push the **preparation artifacts only** to `work/house-h3d-h5-20260909` after all static gates pass.

A committed seed SQL file is not authorization to execute it. The live authorization boundary is this exact state change:

`PREPARED / REVIEW-READY` → Secretary/House review → explicit Owner/House authorization → only then apply bounded LAB fixture seed.

After push, prove House remote parity `0/0` and a clean working tree.

## Final required status for this brief

Success status:
`H3D DISPOSABLE AUTHZ FIXTURE PACKAGE PREPARED / LIVE DML AWAITING AUTHORIZATION`

Do not claim H3D PASS. Do not enable the Custom Access Token hook. Do not apply the seed. Do not start H3E/H3F/H4/H5. HOUSE-A remains closed and BK01 remains quarantined.
