# BRIEF — Claude H3D AUTHZ Fixture Remediation

**Date:** 2026-09-09 (Asia/Bangkok)
**Mode:** WSTERA HOUSE / H3D AUTHZ FIXTURE REMEDIATION ONLY
**Environment:** WSTERA LAB (`ykxlqnshaaxmzzocpjlj`) only
**Owner direction:** PREPARE + VERIFY ONLY. LIVE HOOK ACTION NOT AUTHORIZED.
**Status:** `H3D REMEDIATION PARTIAL PASS / AUTHZ FIXTURE PROOF BLOCKED / LIVE NOT AUTHORIZED`

## Goal

Repair only the remaining H3D authorization-fixture defect.

The existing H3D runner architecture, JWT handoff, control-token path, expired-token path, dependency isolation, teardown verification, branch isolation, and push/parity are accepted as the current base unless this remediation proves otherwise.

Do not weaken the H3C contract. Do not replace real cross-tenant proof with nonexistent/random identifiers.

## Locked current state

House worktree:
`D:\AI-Workspace\runtime\worktrees\house-h3d-h5-20260909`
branch `work/house-h3d-h5-20260909` @ `a8007a0`

PS01 worktree:
`D:\AI-Workspace\runtime\worktrees\ps01-h3d-data-api-20260909`
branch `work/ps01-h3d-data-api-20260909` @ `4efee70`

## Source of Truth

Read before changing code:

1. `docs/platform/shared-runtime/BRIEF-H3C-AUTH-ISSUED-RUNTIME-TOKEN-PROOF-2026-09-08.md`
2. `docs/platform/shared-runtime/evidence/CLAUDE-H3C-NEGATIVE-MATRIX-2026-09-08.md`
3. `tools/shared-runtime/h3c/h3c-proof-harness.mjs`
4. `tools/shared-runtime/h3d/h3d-live-runner.mjs`
5. `docs/platform/shared-runtime/OPERATOR-ACTION-PACK-H3D-TO-H5-2026-09-09.md`
6. `BRIEF-CLAUDE-H3D-OPERATOR-PACK-REMEDIATION-2026-09-09.md`

Do not infer the PS01 relationship model. Inspect the actual WSTERA LAB schema/catalog and the actual PS01 RPC bodies before designing fixture discovery.

## Accepted remediation from previous round

These are not blockers now:

- runtime JWT is handed to H3C through child-process environment only;
- raw JWT is not put in argv/stdout/evidence;
- control identity/token is generated separately and must remain `authenticated`;
- expired runtime token is genuinely waited past `exp`;
- `H3C_PS01_TABLE_COL` is resolved from catalog;
- `tools/shared-runtime` owns its own `pg` dependency;
- no machine-specific PawSpace path remains;
- cleanup verifies both identities and the runtime grant by exact UUID;
- House + PS01 work branches were pushed and had `0/0` parity at the accepted checkpoint.

## Remaining defect

The current runner supplies random UUIDs for authorization fixtures:

- `H3C_FIX_SHOP_ID`
- `H3C_FIX_OTHER_SHOP_ID`
- `H3C_FIX_ROOM_ID`
- `H3C_FIX_RATE_PLAN_ID`
- `H3C_FIX_OTHER_PET_IDS`

This is insufficient for the locked H3C authorization proof.

The canonical contract requires:

- `POS-AUTHZ-1`: a **real existing shop** that the selected LINE/customer identity is not linked to;
- `POS-AUTHZ-3`: **real existing pet IDs owned by another customer**, used against the selected customer/shop context.

A random/nonexistent UUID proves only "not found / nonexistent object rejected". It does not prove cross-shop or cross-customer isolation.

## Required remediation

Build a read-only fixture discovery step that derives a valid, internally consistent authorization matrix from current WSTERA LAB data.

Fixture discovery must use SELECT/catalog/read-only operations only.

It must never INSERT, UPDATE, DELETE, UPSERT, seed, create synthetic PS01 business records, call mutating RPCs, or alter Auth/product data.

## Fixture contract

The discovery result must prove, from actual LAB rows and relationships, at minimum:

### Fixture A — baseline customer/shop context

A real shop + real LINE/customer identity relationship that the read/compute RPCs can evaluate.

Record only stable IDs needed by the harness. Do not expose names, phone numbers, emails, LINE profile data, or other unnecessary PII in evidence.

### Fixture B — cross-shop target

A second real shop that exists in LAB and is demonstrably not linked to Fixture A's LINE/customer identity.

The discovery query must prove both existence and non-membership/non-linkage.

### Fixture C — cross-customer pet target

One or more real pets that exist in LAB and belong to another customer/owner, not Fixture A's customer identity.

Where the quote RPC requires room/rate-plan inputs, choose real read-only compatible room/rate-plan records for the intended shop/context. Do not use random UUIDs merely to force an early not-found path.

If the exact relationship model differs from this wording, document the actual schema/RPC relationship and preserve the same security meaning.

## Runner behavior required

Update H3D so `--preflight` performs fixture discovery **before any operator hook action is requested**.

Preflight must fail closed if a real authorization fixture set cannot be proven read-only.

Required preflight checks must include:

- baseline shop/customer relationship exists;
- cross-shop target exists and is unrelated to baseline identity;
- cross-customer pet target exists and belongs to a different customer/owner;
- required room/rate-plan inputs exist if the quote RPC needs them;
- fixture values are mutually consistent with the actual RPC argument semantics;
- no fixture value used for POS-AUTHZ-1/3 was generated with `randomUUID()` or equivalent.

`--run` must consume the discovered/validated fixture set. Do not silently fall back to random IDs if discovery fails.

The fixture set may remain in process memory or a temporary non-secret machine-readable file if necessary, but evidence must contain only IDs/relationship assertions required for audit and no unnecessary PII.

Any temporary file must be deleted after the run or explicitly retained as non-secret evidence with a documented schema.

## Harness contract

Do not weaken or bypass H3C to accommodate fixture scarcity.

Specifically:

- `POS-AUTHZ-1` remains required-for-PASS;
- `POS-AUTHZ-3` remains required-for-PASS;
- do not reclassify either as advisory;
- do not broaden a PASS classifier so `not found` from a nonexistent random object counts as cross-tenant proof;
- do not remove the existing control-token, expired-token, negative-schema, or privilege-snapshot requirements.

If the harness needs additional evidence fields to distinguish "real foreign object denied" from "object absent", add them without reducing the existing gate.

## No-live-action rule

During this remediation:

- do not enable/disable the hosted Custom Access Token Hook;
- do not run `h3d-live-runner.mjs --run`;
- do not apply H3E/H3F/H4/H5 migrations;
- do not release HOUSE-A;
- do not release BK01 quarantine;
- do not merge either work branch.

Read-only LAB fixture discovery is allowed. Any required mutation is a blocker and must STOP.

## Verification required before returning

Run and preserve exact outcomes for:

1. `npm run selftest` under `tools/shared-runtime` — H3C + H4 + H3D all PASS.
2. Add focused tests/selftest assertions proving AUTHZ fixture discovery rejects random/nonexistent-only substitutes.
3. Verify fixture discovery is read-only from code and execution evidence.
4. PS01 H3D focused static test — 7/7 or the current canonical count if intentionally extended.
5. `tsc --noEmit`.
6. `pnpm lint`.
7. PS01 shared-runtime boundary verifier.
8. secret scan of the remediation diff.
9. `git diff` review: no unrelated product/House changes.
10. House + PS01 branch clean and pushed; prove remote parity `0/0`.

Do not claim readiness from selftests alone. Show the actual discovered LAB relationship shape without exposing sensitive customer data.

## Acceptance criteria

Return `OPERATOR ACTION PACK READY` only if all are true:

- real read-only AUTHZ fixtures are discoverable in WSTERA LAB;
- POS-AUTHZ-1 uses an existing foreign shop relationship, not absence;
- POS-AUTHZ-3 uses existing foreign-customer pet data, not absence;
- preflight fails closed when those relationships cannot be proven;
- no random UUID fallback remains for required AUTHZ proof;
- no LAB mutation occurred;
- all required gates pass;
- Operator Pack describes the real flow exactly;
- both branches are clean, pushed, and `0/0`.

## Mandatory STOP conditions

STOP and report evidence if:

- LAB does not contain enough real relationships for a valid cross-shop/cross-customer fixture set;
- the actual PS01 schema/RPC contract makes the requested proof impossible without mutation;
- a fixture query would require sensitive data to be copied into source/logs/evidence;
- satisfying the gate requires weakening H3C or changing required probes to advisory;
- read-only discovery finds an unexpected cross-product/shared-runtime delta;
- remediation touches unrelated products, original PS01 staging, or House master;
- secret/token material appears in git, stdout, argv, or persistent evidence;
- git parity cannot be restored cleanly.

A STOP is the correct outcome when the real proof prerequisite does not exist. Do not fabricate a workaround.

## Deliverable back to House

Return one concise report containing:

- actual tables/RPC relationships inspected for fixture discovery;
- proof that the selected fixture objects exist and represent the required foreign relationships, with IDs only and no unnecessary PII;
- files changed;
- tests/gates and exact outcomes;
- confirmation that LAB was read-only throughout remediation;
- final House + PS01 commit SHAs;
- push/remote `0/0` proof;
- final status: `OPERATOR ACTION PACK READY` or `STOP — <reason>`.

Do not perform the live H3D toggle after remediation. Owner/House must review and explicitly authorize live operator action first.
