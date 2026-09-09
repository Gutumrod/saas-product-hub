# BRIEF — H3C Live Proof Fixture Provisioning

**Date:** 2026-09-09
**Mode:** WSTERA HOUSE MAJOR / H3C LAB PROOF ONLY
**Target:** WSTERA LAB (`ykxlqnshaaxmzzocpjlj`)
**Production:** FORBIDDEN

## Objective

Provision the minimum temporary PS01 dataset required by the already-reviewed H3C safe-mode harness, prove runtime-token authorization/isolation against real data, then remove all proof data.

This brief does **not** authorize product feature work, submit-booking mutation, schema change, migration, production access, or broad Auth configuration changes.

## Minimum fixture graph

Create only temporary rows identifiable by the `H3C-PROOF-20260909` marker:

1. Shop A — the permitted tenant.
2. Shop B — a real cross-shop denial target.
3. Owner A in Shop A with a unique temporary LINE user id.
4. Pet A belonging to Owner A.
5. Owner B in Shop A plus Pet B, used only as another-customer pet denial target.
6. One available room in Shop A.
7. One active fixed-package rate plan for that room.

No booking, booking_request, payment, storage object, external integration, or LINE network call may be created.
## Execution constraints

- Generate UUIDs at execution time; do not add a data migration or hardcode generated IDs into migration history.
- Capture the exact generated IDs only in H3C evidence.
- Use a bounded transaction for fixture creation and verify row counts immediately after commit.
- Run the canonical `h3c-proof-harness.mjs` in default safe mode only; `H3C_ALLOW_SUBMIT_PROBE` and `H3C_SUBMIT_DISPOSABLE_ACK` remain unset.
- A signed non-allowlisted Auth control token and a genuinely expired LAB runtime token are required before H3C may PASS.
- Fresh privilege evidence must be <=15 minutes old when the final harness run begins.
- Any unexpected constraint, trigger, cross-product write, or non-fixture mutation is STOP / BLOCKED.

## Cleanup contract

After proof capture, remove temporary authority and proof data fail-closed:

1. invalidate/delete temporary Auth identities and their sessions first;
2. remove temporary `runtime_token_grants` rows;
3. disable Custom Access Token Hook back to its captured prior state;
4. wait for/reject any residual runtime JWT through `residualNarrowAuthorityUntil`;
5. delete H3C fixture rows in FK-safe order: rate plan, pets, owners, room, shops;
6. verify zero H3C marker rows remain and the PS01 runtime boundary is unchanged;
7. save evidence, commit, push, and leave House repo clean.

## Gate

Fixture provisioning itself is not H3C PASS. H3C remains blocked until token verification, all required positive/negative probes, and teardown evidence are complete.