# BRIEF — Claude H3D Fixture Atomic-Guard Remediation

**Date:** 2026-09-09 (Asia/Bangkok)
**Mode:** WSTERA HOUSE / H3D DISPOSABLE FIXTURE REMEDIATION ONLY
**Environment:** WSTERA LAB (`ykxlqnshaaxmzzocpjlj`) only
**Status:** `REMEDIATE BEFORE LIVE DML / LIVE DML NOT AUTHORIZED`

## House verdict

The disposable AUTHZ fixture topology is accepted and the H3D runner Invariant A + B repairs are accepted.

However, the package is **not yet authorized for live DML**. House found fail-closed / teardown-safety gaps in the prepared SQL package.

Do not apply the seed. Do not enable the Custom Access Token hook. Do not run H3D live. Do not start H3E/H3F/H4/H5.

## Verified current state

House branch `work/house-h3d-h5-20260909` @ `7ddd4ed`, remote parity `0/0`, clean at review.

Independent `npm run selftest` result: H3C PASS, H4 PASS, H3D PASS including AUTHZ invariants A+B.

Independent WSTERA LAB SELECT-only review confirmed:
- exact fixture ID collisions = 0;
- synthetic `H3D-PROOF-*` label collisions = 0;
- `ps01.shops/pet_owners/pets/rooms/room_rate_plans` = 0;
- `shop_subscriptions=0`, `subscription_audit_log=0`;
- `starter` package exists exactly once;
- `runtime_token_grants=0`, `auth.users=5`;
- shop-init and immutable-audit triggers are enabled (`tgenabled='O'`).
## Blocker 1 — precheck is not atomic with seed

`h3d-authz-fixture-precheck.sql` is SELECT-only and currently clean, but `h3d-authz-fixture-seed.sql` only rechecks exact fixture IDs + `starter` existence.

It does **not** fail closed inside the seed transaction if:
- a synthetic-label collision appears after precheck;
- PS01 business/support baseline changes from the accepted empty state;
- required trigger state changes before seed;
- an incompatible row appears between human precheck and live seed.

The brief required the seed to fail closed on incompatible state. A separate operator-read precheck is evidence, not an atomic guard.

### Required remediation

Inside the seed transaction, before any INSERT:
1. acquire a short write-excluding lock or equivalent transaction guard on the seven fixture/support tables;
2. assert exact fixture IDs absent;
3. assert `H3D-PROOF-*` label collisions absent;
4. assert the accepted PS01 baseline for this gate is still empty;
5. assert `starter` exists;
6. assert required shop-init + immutable-audit triggers exist and are enabled.

Do not rely on the operator manually comparing SELECT output.
## Blocker 2 — seed does not fully assert expected support delta

The seed currently asserts two `trialing` subscriptions but does not fail if the expected audit support delta is wrong.

The prepared package claims exactly:
- 8 explicit fixture rows;
- 2 `shop_subscriptions` support rows;
- 2 `subscription_audit_log` support rows;
- no other business rows.

### Required remediation

Before COMMIT, assert the complete expected post-seed state for the controlled fixture scope:
- shops=2, owners=2, pets=2, rooms=1, rate plans=1;
- subscriptions for Shop A/B = exactly 2 with the expected trialing/starter relationship;
- initialization audit rows for Shop A/B = exactly 2 with the expected initialization action/source;
- all relationship assertions from the prepared package still hold.

If any count or relationship differs, RAISE and roll back the whole seed transaction.
## Blocker 3 — teardown can cascade-delete unexpected child rows

Current teardown deletes the known fixture leaves, then deletes Shop A/B. `shops` has multiple `ON DELETE CASCADE` children.

The package currently checks some residue **after** deletion, but that cannot prove no unexpected child row was deleted by cascade. A booking/staff/report/camera/sync/etc. row under a fixture shop could disappear with the shop and the final residue could still be zero.

That violates the locked requirements: exact teardown, unrelated rows 0, no silent cleanup of unexpected state.

### Required remediation

Before the first DELETE, inside the same teardown transaction:
1. assert the expected fixture topology exists exactly;
2. assert expected support rows exist exactly;
3. inspect/assert every relevant PS01 child surface referencing Shop A/B;
4. require all non-fixture child surfaces (bookings, booking requests/pets, staff, reports, camera/sync and any other current FK child) to be zero;
5. STOP/ROLLBACK if any unexpected child row exists.

Prefer deriving the child-surface list from the current catalog/FKs or maintaining an explicit complete list justified from fresh catalog evidence. Do not silently rely on CASCADE.
## Teardown control-state requirement

The live immutable-audit trigger is currently enabled with `tgenabled='O'`.

Teardown may reuse the approved H3C narrow maintenance pattern, but it must:
- verify the trigger exists/enabled before disabling;
- disable only `trg_subscription_audit_immutable`;
- delete only the two fixture shops' expected audit rows;
- re-enable inside the same transaction;
- verify the trigger is restored to the expected enabled state before COMMIT.

Any failure must roll back both row deletion and trigger-state changes.

## Operator Pack correction

Update `OPERATOR-ACTION-PACK-H3D-TO-H5-2026-09-09.md` so the live order is explicit:
1. run SELECT-only precheck and save evidence;
2. confirm package/remediation commit + clean/pushed state;
3. only after later explicit authorization, run guarded seed;
4. run `--preflight` and require fixture discovery success before any Dashboard hook action;
5. continue H3D only after the preflight result is valid.

The precheck remains useful evidence even after the seed contains the same guards.
## Scope locks

Allowed:
- edit the three H3D fixture SQL artifacts;
- edit H3D runner selftests only if needed to reflect guard invariants;
- update the prep evidence and Operator Action Pack;
- run SELECT-only LAB verification and offline/static gates.

Not allowed:
- execute seed/teardown DML on LAB;
- enable/disable the Custom Access Token hook;
- alter PS01 schema/business logic/RLS/grants;
- start H3E/H3F/H4/H5;
- merge branches or release HOUSE-A/BK01.

## Verification before return

Run and report:
- House H3C + H4 + H3D selftests;
- static review of all three SQL files against current live catalog + canonical PS01 baseline;
- SELECT-only precheck on LAB;
- PS01 focused H3D test, typecheck, lint, boundary verifier;
- secret scan and git diff review;
- House clean + pushed + remote parity `0/0`;
- PS01 unchanged clean + parity `0/0`.

Return status only as:
`H3D FIXTURE ATOMIC GUARDS REMEDIATED / LIVE DML AWAITING AUTHORIZATION`

House/Owner will review again before any live seed is authorized.