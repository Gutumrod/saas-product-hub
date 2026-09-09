# BRIEF — Claude H3D Final One-Shot Remediation

**Date:** 2026-09-09 (Asia/Bangkok)
**Mode:** WSTERA HOUSE / INDEPENDENT CODEX FINAL REVIEW
**Environment:** WSTERA LAB (`ykxlqnshaaxmzzocpjlj`) only
**Verdict:** `PASS FOR IMPLEMENTATION`
**Live state:** `LIVE DML NOT AUTHORIZED / H3D NOT PASS / HOUSE-A CLOSED / BK01 QUARANTINED`

This is the canonical H3D remediation instruction for the next Claude implementation pass. It supersedes the piecemeal H3D fixture/runner remediation instructions. “PASS FOR IMPLEMENTATION” means the remediation design below is complete enough to implement; it does **not** authorize fixture DML, Auth identity mutation, runtime-grant DML, hook mutation, H3D live execution, merge, or release.

## 1. Source-of-Truth References

- House branch `work/house-h3d-h5-20260909`; reviewed HEAD `158a81c`; fixture package commit `7ddd4ed`; prior atomic-guard brief `5118487`.
- `tools/shared-runtime/h3d/h3d-live-runner.mjs`
- `tools/shared-runtime/h3c/h3c-proof-harness.mjs`, `tools/shared-runtime/h3c/README.md`, and the harness selftests
- `docs/platform/shared-runtime/fixtures/h3d-authz-fixture-precheck.sql`
- `docs/platform/shared-runtime/fixtures/h3d-authz-fixture-seed.sql`
- `docs/platform/shared-runtime/fixtures/h3d-authz-fixture-teardown.sql`
- `docs/platform/shared-runtime/evidence/H3D-DISPOSABLE-AUTHZ-FIXTURE-PREP-2026-09-09.md`
- `docs/platform/shared-runtime/evidence/H3C-FINAL-CLOSURE-2026-09-09.md`
- `docs/platform/shared-runtime/evidence/H3C-FIXTURE-TEARDOWN-MAINTENANCE-2026-09-09.sql`
- `docs/platform/shared-runtime/OPERATOR-ACTION-PACK-H3D-TO-H5-2026-09-09.md`
- `docs/platform/shared-runtime/evidence/H3D-BASELINE-INVENTORY-2026-09-09.json`
- Canonical PS01 source: PS01 branch `work/ps01-h3d-data-api-20260909`, commit `4efee70`, `supabase/shared-runtime/ps01-baseline.sql`.

The PS01 worktree was **not clean at review time** (`package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` modified; `docs/testing/` and `tests/booking_v2_contract.test.ts` untracked). Therefore this review used committed `4efee70` as the canonical PS01 SQL source and does not treat the dirty working tree as approved source truth. Current live catalog parity could not be re-queried in this Codex shell because no DB credential/SQL client was available; all live-shape claims below are either tied to the committed baseline/prior captured evidence or explicitly require a fresh SELECT-only proof before implementation acceptance.

## 2. Independent Conclusion

The synthetic topology is conceptually minimal and correct: Shop A/Owner A/LINE A/Pet A establishes the positive path; Shop B has no LINE A link; Owner B and Pet B are in Shop A but distinct from Owner A; Room A and active Rate Plan A are a joined `(shop_id, room_id)` pair; capacity 2 is not an earlier failure than the one-element foreign-pet probe; and harness CSV parsing yields arrays with the expected cardinality.

The current package is nevertheless unsafe for live use. There are blocking defects in atomic preconditions, trigger-effect verification, teardown graph coverage, trigger maintenance concurrency, runner cleanup, state-transition authorization, evidence handling, and negative-probe classification. All HIGH findings below must be remediated in one bounded pass and all acceptance gates must pass before House can consider a separate live-DML authorization.

## 3. Findings

### H3D-F01 — HIGH — seed preconditions are not atomic or complete

**Evidence:** `h3d-authz-fixture-precheck.sql:6-34` performs separate SELECTs. `h3d-authz-fixture-seed.sql:22-39` begins a transaction but only checks `current_user`, exact IDs, and starter existence before inserts. It does not lock the controlled tables, recheck synthetic labels, assert the accepted empty baseline, verify starter semantics, or verify trigger definitions/state.

**Impact:** a concurrent or drifted row/trigger/package can make the seed pass on a different topology, produce different side effects, or partially block after the operator has already crossed the DML boundary.

**Required fix:** implement the exact seed transaction in §5. The precheck remains evidence only and may never be treated as the seed guard.

### H3D-F02 — HIGH — the seed does not prove the claimed support delta or semantics

**Evidence:** `h3d-authz-fixture-seed.sql:97-101` checks only two `status='trialing'` subscriptions. Canonical `initialize_shop_subscription_internal` creates subscriptions with package `starter`, offer `standard`, interval `monthly`, status `trialing`, `trial_started_at=now()`, `trial_ends_at=now()+30 days`, source `bootstrap`, and creates audit action `subscription.initialized` with system/bootstrap/result fields. The seed does not assert most of these fields or the two audit rows at all.

**Impact:** missing, duplicate, stale, or semantically wrong trigger output can be reported as success. A changed starter package may also fail later quota/commercial gates for reasons unrelated to AUTHZ.

**Required fix:** snapshot controlled-table counts before insertion; after insertion assert exact deltas and exact fixture-scoped rows, including audit-to-subscription joins and timestamp relationships as specified in §5. Do not assert exact wall-clock values; assert transaction-stable bounded relationships.

### H3D-F03 — HIGH — current teardown can silently cascade-delete unexpected data

**Evidence:** `h3d-authz-fixture-teardown.sql:21-36` deletes known leaves and then shops; the residue check occurs only afterward. Canonical PS01 FKs rooted at shops include at least `staff_users`, `pet_owners`, `pets`, `rooms`, `bookings`, `booking_pets`, `daily_reports`, `google_sync_mappings`, `sync_queue`, `camera_settings`, `camera_visitor_credentials`, `shop_commercial_assignments`, `booking_requests`, `import_batches`, `shop_subscriptions`, `subscription_audit_log`, and `room_rate_plans`, with further edges among owners/pets/rooms/bookings/rate plans.

**Impact:** any unexpected child can be erased by cascade and the final zero-residue assertion will still pass.

**Required fix:** build and verify the fresh catalog graph, lock every in-scope child surface, assert the complete exact/zero child inventory before the first DELETE, then explicitly delete every expected leaf/support row. Shop deletion is allowed only as a final referential-integrity assertion, not as a garbage collector.

### H3D-F04 — HIGH — immutable-audit maintenance lacks explicit lock/control proofs

**Evidence:** `h3d-authz-fixture-teardown.sql:28-31` disables a row-level immutability trigger with `ALTER TABLE`, deletes by shop ID, then re-enables. Transaction rollback restores trigger state on error, but while disabled the trigger state is a table-wide control, not a per-row exception.

**Impact:** PostgreSQL transactional DDL and the table lock acquired by `ALTER TABLE ... DISABLE TRIGGER` should prevent another DML session from observing/using the temporary disabled state when disable and re-enable commit together. However, the current package does not make that lock contract explicit or test it, does not acquire the lock before all destructive preconditions, does not prove the trigger began exactly enabled (`tgenabled='O'`), and does not restrict deletion to exact asserted audit IDs. A future refactor or unexpected lock wait/control drift could therefore invalidate the safety claim without detection.

**Required fix:** do not add a schema/function bypass merely for fixture convenience. Use the existing transactional-DDL pattern, but make its safety contract explicit: acquire `ACCESS EXCLUSIVE` on `ps01.subscription_audit_log` at the beginning of the teardown lock phase, before destructive assertions; verify exact trigger OID/function/state; disable only the named trigger; delete exact asserted audit IDs (not merely shop IDs); re-enable and re-verify before commit. The lock is held until commit, so no concurrent session can use the disabled state. Set short `lock_timeout`; timeout is a hard STOP with rollback. Prove this behavior with a two-session concurrency test.

### H3D-F05 — HIGH — runner can leak Auth identities/grants on early failures

**Evidence:** in `h3d-live-runner.mjs:341-355`, the preflight identity is created before `try`; inside `finally`, a failure in `removeGrant` prevents identity deletion. In `:382-388`, runtime identity and then control identity are created before entering `try`; failure creating the second identity leaks the first. Cleanup operations are sequential and not independently attempted. `fail()` calls `process.exit`, which can bypass normal unwinding/evidence finalization.

**Impact:** failed preflight/run can leave an Auth user or allowlist row behind, contradicting fail-closed restoration.

**Required fix:** use a single ownership ledger created before the first mutation. Register each resource immediately after creation. Wrap the entire mutating lifecycle, including both identity creations, in `try/finally`. Cleanup must attempt every registered resource independently with `Promise.allSettled` or equivalent, retry only bounded transient failures, verify each exact UUID, write redacted recovery evidence, and exit only after cleanup completes. Never call `process.exit` from inside cleanup-capable functions; return/throw to one top-level exit point.

### H3D-F06 — HIGH — `--run` does not enforce the preflight/authorization state and mutates before discovery

**Evidence:** `h3d-live-runner.mjs:373-410` checks only file presence, then creates identities/grant before rediscovering fixtures. It does not require a fresh successful preflight artifact, hook-active proof, exact fixture fingerprint, operator authorization receipt, or current hook state before mutation.

**Impact:** an operator can invoke `--run` directly, against stale/different fixtures, or after hook state changed. Discovery failure occurs after live mutations.

**Required fix:** split modes and enforce signed/hashed local state receipts as in §7. `--run` must first perform all read-only file/snapshot/fixture checks, compare an exact fixture fingerprint to the post-seed verification artifact, require a fresh hook-on preflight receipt, and only then create identities/grants. A direct or stale run must STOP before mutation.

### H3D-F07 — HIGH — AUTHZ probes can PASS for the wrong error

**Evidence:** `h3c-proof-harness.mjs:507-543` treats any HTTP status `>=400` as successful rejection for `POS-AUTHZ-1` and `POS-AUTHZ-3`. It also accepts broad text regexes. Thus gateway failure, SQL syntax/type error, timeout, unavailable RPC, rate-plan failure, room failure, or unrelated server error can count as authorization success. `POS-AUTHZ-1` is labeled “weak signal” by the harness itself.

**Impact:** H3D can PASS without proving the intended tenant/customer boundary.

**Required fix:** classify only the exact expected PostgreSQL error class/message emitted by the traced RPC branch, or change the read-only RPCs in a separately approved PS01 remediation to expose stable safe error codes. Require the baseline context and quote requests to return 2xx with exact fixture IDs/shape immediately before the negative probes. Reject 5xx, gateway/auth/routing errors, timeout, missing RPC, room/rate-plan/capacity errors, generic 4xx, empty/ambiguous snippets, and any unexpected code as FAIL. Evidence must record only a safe classifier/code, never response bodies containing owner phone/name/pet data.

### H3D-F08 — HIGH — preflight authorization boundary and runbook claims contradict behavior

**Evidence:** Operator Pack `:64-86` calls preflight “all read-only” while runner `:341-352` creates/deletes an Auth identity and inserts/deletes a runtime grant. The current order folds fixture discovery, hook readiness, and a mutating probe into one command without a separate authorization checkpoint.

**Impact:** an operator can cross a live mutation boundary believing the command is read-only; ownership and recovery responsibilities are ambiguous.

**Required fix:** split `--preflight-readonly` from `--preflight-hook-probe` (or require an explicit `--authorize-hook-probe <receipt>` flag). The first mode must be mechanically mutation-free. The second requires a separate explicit authorization after guarded seed/post-seed verification and uses the failure-safe ledger from F05.

### H3D-F09 — MEDIUM — `current_user='postgres'` is brittle and is not a sufficient authorization control

**Evidence:** both seed and teardown compare the textual role name. Hosted Supabase operator paths and delegated roles can change; role name alone says nothing about environment, branch, exact privileges, or human authorization.

**Impact:** legitimate bounded execution can be blocked, while any session named postgres is accepted even if target/project or operator order is wrong.

**Required fix:** assert `current_database`, project identity from a trusted read-only project-ref source, required table/function ownership or exact privileges, and no unexpected role transition. Use `session_user/current_user` evidence and require an external authorization receipt. Do not broaden grants to make a role pass. If the only validated operator path is hosted `postgres`, retain it as an additional assertion, not the sole control.

### H3D-F10 — MEDIUM — fixture/evidence identity is not stable enough across phases

**Evidence:** subscription and audit IDs are generated randomly by triggers; teardown selects audit rows by shop ID. The runner rediscovers rows but does not bind them to a seed-run manifest. Baseline inventory is timestamped historical evidence, not proof of current pre-seed state.

**Impact:** teardown can target the wrong support rows or compare restoration against stale inventory.

**Required fix:** seed output must include a redacted manifest containing exact fixture IDs, generated subscription IDs, generated audit IDs, transaction ID, schema/catalog fingerprint, pre-count signature, and content hash. Teardown must accept/verify that manifest and target exact IDs. Capture a fresh pre-seed inventory/signature in the same authorized operation window; historical baseline is reference only.

### H3D-F11 — MEDIUM — runner evidence may retain unsafe error/body text and cleanup artifacts

**Evidence:** `adminFetch` returns the first 240 response characters; run evidence stores `rec.error` and the harness stores response snippets. The positive context RPC returns owner name/phone and pet fields. Snapshot/harness files can remain on exceptions/timeouts.

**Impact:** PII or operational detail can reach evidence/git, and temporary sensitive-adjacent files may persist after failure.

**Required fix:** use allowlisted error classes/codes; never persist raw response snippets for customer-context/quote probes. Redact UUIDs where exact recovery IDs are not required. Track and delete temporary snapshots in `finally`; keep only explicitly approved redacted evidence. Add a secret/PII scanner covering generated evidence before commit.

### H3D-F12 — MEDIUM — trigger/FK completeness is asserted from a stale list, not proved at execution

**Evidence:** prep documentation says “everything else +0” and names several tables, but neither seed nor teardown validates the current catalog graph or all enabled triggers. The committed baseline can drift from WSTERA LAB.

**Impact:** a newly added FK/trigger can add or destroy rows without being noticed.

**Required fix:** generate a SELECT-only catalog manifest immediately before authorization and compare it to a version-controlled expected manifest. Any new/missing/disabled trigger, FK edge, deferrability/action change, or table in the shop-rooted graph is a hard STOP requiring House review; do not auto-accept catalog drift.

## 4. Locked Fixture Semantics

Claude must preserve these invariants exactly:

1. Shop A and Shop B are exact synthetic shops; Shop A is the positive shop and Shop B is the cross-shop target.
2. Owner A is in Shop A and uniquely linked to LINE A; no owner in Shop B is linked to LINE A.
3. Pet A is in Shop A and owned by Owner A. `H3C_FIX_PET_IDS` is exactly one UUID, Pet A.
4. Owner B is distinct from Owner A, belongs to Shop A, and has no LINE link. Pet B is in Shop A and owned by Owner B. `H3C_FIX_OTHER_PET_IDS` is exactly one UUID, Pet B.
5. Room A belongs to Shop A and has `capacity_pets=2`. Rate Plan A belongs to `(Shop A, Room A)`, is active, uses `DAY/1`, and has the expected price. One foreign pet can never trip capacity before ownership validation.
6. Baseline context and quote must succeed with exact returned shop/owner/pet/room/rate-plan fields before negative AUTHZ probes run.
7. No optional/default fixture environment variable is allowed in H3D live mode. Empty, malformed, duplicate, non-UUID, wrong-cardinality, or mismatched variables cause pre-network STOP. Defaults remain allowed only in explicitly labeled boundary/selftest modes that cannot produce H3D PASS.
8. `H3C_ALLOW_SUBMIT_PROBE` remains off. The disposable fixture does not authorize booking-request DML.

## 5. Seed Transaction and Locking Contract

Implement this order in `h3d-authz-fixture-seed.sql`:

1. `BEGIN`; set bounded `lock_timeout`, `statement_timeout`, and `idle_in_transaction_session_timeout`. Any timeout is a hard STOP/ROLLBACK.
2. Verify LAB project identity and operator/session invariants. Record them without secrets.
3. Acquire locks in one documented global order to avoid deadlocks. Use `SHARE ROW EXCLUSIVE` on the controlled DML tables: `shops`, `pet_owners`, `pets`, `rooms`, `room_rate_plans`, `shop_subscriptions`, and `subscription_audit_log`. This conflicts with ordinary `ROW EXCLUSIVE` INSERT/UPDATE/DELETE while allowing SELECTs. Lock only `ps01`; do not lock unrelated schemas/products.
4. Acquire `ROW SHARE`/`SELECT ... FOR SHARE` on the exact `commercial_packages('starter')` row. Assert one row and its complete accepted semantic fingerprint: active/usable state, commercial access during trial, room limit >=1, pet-history limit >=2, and every field consumed by `resolve_shop_commercial_authority`. A concurrent UPDATE/DELETE must block and then time out/STOP.
5. Assert the fresh catalog manifest: required FKs, trigger names, trigger functions, enabled state exactly `O`, non-internal status, trigger timing/events, and function-definition hashes. At minimum cover shop initialization, legacy subscription mirror, owner/pet/room commercial guards, and audit immutability.
6. Assert the accepted pre-seed business/support state. For this gate the baseline is empty for every shop-rooted PS01 business/support table in the fresh catalog graph, not merely the five fixture tables. Assert exact fixture IDs and every `H3D-PROOF-*` label absent using exact/case-normalized predicates; reject lookalike/case variants.
7. Snapshot global counts/signatures for all controlled tables inside the transaction.
8. Insert the two shops, then owners, pets, room, and plan in the existing dependency order. Do not use `ON CONFLICT`, defaults that weaken required values, or rerun-as-success behavior. A previous successful seed requires verified teardown first.
9. Assert exact post-seed topology and exact deltas. Explicit rows: shops +2, owners +2, pets +2, rooms +1, plans +1. Support rows: subscriptions +2, audit +2. Every other graph table: +0.
10. Assert each subscription exactly: one per fixture shop; package `starter`; offer `standard`; interval `monthly`; status `trialing`; transition source `bootstrap`; not cancelled/suspended; `trial_started_at` equals the transaction timestamp within database semantics; `trial_ends_at = trial_started_at + interval '30 days'`; period/grace fields match canonical initialization behavior.
11. Assert each audit exactly: one per fixture subscription and shop; actor `system`; action `subscription.initialized`; resulting status/package/offer `trialing/starter/standard`; source `bootstrap`; expected reason; previous fields null; actor/idempotency/fingerprint fields exactly as canonical initialization defines (currently null). Reject duplicates or any extra fixture-scoped audit row.
12. Force all deferred constraints to immediate before final assertions (`SET CONSTRAINTS ALL IMMEDIATE`) and re-run exact counts. Emit one redacted seed manifest and `COMMIT` only if every assertion passes.

`SERIALIZABLE` alone is not a substitute for the locks above. The table locks close phantoms and DML races deterministically. Do not escalate to schema-wide/database-wide locks.

## 6. Teardown Transaction and Cascade Contract

Before implementation, produce a fresh SELECT-only catalog query listing every FK path rooted at `ps01.shops`, including constraint name, child/parent columns, delete action, deferrability, and child table triggers. Compare it with the expected list. Unknown drift is `STOP — CATALOG GRAPH CHANGED`.

Then implement teardown as follows:

1. Begin with bounded timeouts and the same verified LAB/operator checks.
2. Load and hash-verify the exact seed manifest. Lock the fixture shops `FOR UPDATE`, then acquire locks on **all** discovered shop-rooted tables in deterministic parent-to-leaf order: `ACCESS EXCLUSIVE` for `subscription_audit_log` and `SHARE ROW EXCLUSIVE` for the remaining tables. Acquire the stronger audit lock directly rather than upgrading it later. This prevents new child DML after the pre-delete assertion. If lock acquisition times out, rollback without deleting anything.
3. Assert the two shops and all eight explicit rows exactly match the manifest and synthetic semantic fingerprint. Assert the exact two subscriptions and exact two audits by generated IDs and full semantics.
4. Assert zero rows for every non-fixture child surface, including at least staff, bookings, booking pets, booking requests, daily reports, Google mappings, sync queue, camera settings, camera visitor credentials, commercial assignments, import batches, occupancy/schedule child surfaces, and any new catalog-discovered edge. Also assert no runtime grant/Auth identity is associated with the fixture run and the hook is off before fixture teardown.
5. Force deferred constraints immediate. Any missing expected row, extra row, semantic mismatch, or unexpected child is a hard STOP/ROLLBACK before the first DELETE.
6. Delete explicit known leaves by exact manifest ID: plan, pets, room, owners. Delete exact audit IDs using the safe method in F04. Delete exact subscription IDs. Delete exact shop IDs last. Require `GET DIAGNOSTICS ROW_COUNT`/equivalent exact counts after every statement.
7. Do not use shop cascade as cleanup. Final shop deletion must affect exactly two rows and should have no child rows remaining. Any FK cascade that actually removes a row is a defect; prove zero children immediately before it.
8. Re-verify audit-control state/function hash, all fixture IDs/labels zero, every graph-table delta restored, and fresh inventory signature equal to the immediate pre-seed signature. Commit only after all checks pass.

Rollback restores transactional DDL and data, but the implementation must still test trigger/control restoration under injected errors after maintenance begins.

## 7. Runner State Machine and Authorization Contract

Implement an explicit state machine with durable, redacted, hash-linked receipts:

1. `REVIEWED`: exact House/PS01 commit and catalog manifest recorded; SELECT only.
2. `FIXTURE_DML_AUTHORIZED`: external Owner/House authorization receipt for this commit/project/run ID. The runner cannot mint this receipt itself.
3. `SEEDED`: guarded seed committed and exact seed manifest verified.
4. `POST_SEED_VERIFIED`: separate SELECT-only verifier matches manifest/topology/support delta.
5. `HOOK_PROBE_AUTHORIZED`: separate explicit authorization for temporary Auth user + runtime-grant DML.
6. `HOOK_OFF_CONFIRMED`: hook-probe preflight issues a token that remains authenticated; exact probe identity/grant are torn down and verified.
7. `HOOK_ENABLE_REQUESTED`: only the operator enables the named hook.
8. `HOOK_ON_CONFIRMED`: fresh authorized hook-probe yields `ps01_line_runtime`, exact lifetime/project/signature checks pass, and probe resources are torn down.
9. `RUN_AUTHORIZED`: requires fresh `HOOK_ON_CONFIRMED`, exact fixture fingerprint, hook state, and privilege snapshot.
10. `RUN_COMPLETE`: full H3C required matrix passes; runtime/control identities and exact grant are removed and verified on every path.
11. `HOOK_OFF_AFTER_RUN`: operator disables hook; a fresh control/probe confirms no new role elevation.
12. `RESIDUAL_EXPIRED`: wait past the maximum `exp` of **every** issued runtime token, including both hook probes and run tokens. Deleting users does not revoke already-issued access tokens.
13. `FIXTURE_TEARDOWN_AUTHORIZED`: separate explicit teardown authorization after hook-off/residual expiry and zero runner resources.
14. `RESTORED`: guarded teardown, trigger-state proof, residue zero, and inventory signature match.
15. Only House may decide H3D closure after reviewing the evidence bundle.

Receipts expire after 15 minutes or immediately on commit/catalog/fixture/hook-state drift. A later phase may not infer authorization from a prior command, a committed SQL file, or a successful selftest.

## 8. Runner Implementation Requirements by Function

### `h3d-live-runner.mjs`

- Replace `fail()+process.exit()` inside workflows with typed errors and one top-level exit handler.
- Add strict URL/project validation before any network call; target must equal the LAB origin and token issuer/project must match it independently.
- Replace `grantRowCount` cleanup logic with exact per-run UUID ownership. Global count is supporting evidence only; `after <= before` cannot prove an unrelated deletion did not hide a leaked owned row.
- Make grant INSERT insert-only. `ON CONFLICT DO UPDATE` can overwrite a pre-existing row for the same UUID and obscures ownership. Collision is a hard STOP.
- Register identity/grant/temp-file resources immediately and clean each independently in `finally`. Cleanup failure emits exact recovery IDs and blocks progress.
- Run strict fixture discovery/fingerprint and all read-only gates before any identity/grant mutation in every mode.
- Make hook-off and hook-on probes explicit authorized modes. Record all token expiries for residual-authority calculation.
- In `spawnHarness`, distinguish timeout, signal, spawn failure, nonzero exit, missing/malformed evidence, and verdict failure. Require the child evidence path to be newly created, inside the approved evidence directory, and content-hash it.
- Pass a minimal child environment allowlist rather than spreading all of `process.env`; this prevents unrelated secrets from reaching the child.
- Delete privilege snapshots in all branches after consuming a safe projection. Never persist raw JWTs, passwords, keys, DB URLs, LINE IDs, owner/pet names, phones, or raw RPC bodies.

### `h3c-proof-harness.mjs`

- Add strict UUID parsing, uniqueness, exact cardinality, and cross-field validation for all H3D fixture variables.
- Remove permissive defaults from H3D pass mode, especially NIL UUID and generated start time. The runner must pass a fixed, recorded future `start_at`; the harness must validate it.
- Require baseline positive context and quote to return 2xx and validate exact safe fields. Do not persist PII fields returned by context.
- Replace broad `>=400` AUTHZ classifiers with exact expected branch classifiers. Infrastructure/routing/timeout/5xx/unrelated business errors always FAIL.
- Assert `POS-AUTHZ-3` uses exactly Pet B and one pet, so capacity 2 cannot be the rejection. Assert the rate plan/room pair and start time are identical to the immediately preceding positive quote.
- Add a negative test proving capacity failure, missing room, inactive plan, malformed UUID, gateway 401/403, 404 RPC, and 5xx cannot satisfy AUTHZ probes.

### SQL/docs/evidence files

- Remediate all three fixture SQL files per §§5-6.
- Update prep evidence to reflect only verified post-remediation facts and label unexecuted behavior as static/UNKNOWN.
- Rewrite the H3D portion of the Operator Pack to match §9 exactly; remove “preflight is all read-only.”
- Do not modify canonical PS01 business logic in this pass. Use the explicit `ACCESS EXCLUSIVE` transactional trigger-maintenance design above.

## 9. Exact Operator Order

| Step | Owner | Prerequisite | Action | Mutation authority |
|---|---|---|---|---|
| 1 | Claude/House | locked commits | SELECT-only catalog, trigger, FK, collision, baseline and inventory capture | none |
| 2 | House/Owner | Step 1 PASS | explicit authorization for the exact guarded fixture seed commit/run ID | authorizes seed only |
| 3 | Claude/operator agent | Step 2 receipt | execute guarded seed | fixture/support DML only |
| 4 | Claude/House | Step 3 manifest | independent SELECT-only post-seed verification | none |
| 5 | House/Owner | Step 4 PASS | explicit authorization for hook-readiness Auth identity/grant probes | probe DML only |
| 6 | Claude/operator agent | Step 5 | hook-off probe; teardown exact probe resources | Auth/grant probe only |
| 7 | Human operator | Step 6 `HOOK_OFF_CONFIRMED` | enable only `wstera_platform_internal.custom_access_token_hook` | one Dashboard control |
| 8 | Claude/operator agent | Step 7 | hook-on probe; teardown exact probe resources | Auth/grant probe only |
| 9 | House/Owner | Step 8 PASS | authorize H3D run for exact receipts | run identities/grant only |
| 10 | Claude/operator agent | Step 9 | run full H3C proof and failure-safe cleanup | bounded run DML |
| 11 | Human operator | Step 10 terminal evidence | disable the hook regardless of PASS/FAIL | one Dashboard control |
| 12 | Claude/operator agent | Step 11 | confirm hook off; wait past max token expiry; verify zero owned identities/grants | authorized probe if required by Step 5 receipt |
| 13 | House/Owner | Step 12 PASS | authorize exact fixture teardown | fixture teardown only |
| 14 | Claude/operator agent | Step 13 | guarded teardown | exact fixture/support DELETE only |
| 15 | Claude/House | Step 14 | inventory/signature comparison and closure package | none |
| 16 | House | all evidence PASS | decide H3D closure | no automatic H3E/H3F/H4/H5 authority |

On any failure after hook enable, operator action is always: disable hook first, preserve redacted recovery IDs, clean runner-owned identities/grants, wait out token expiry, then decide fixture teardown. Do not proceed to later phases to “recover.”

## 10. Required Tests and Failure Injection

### Offline/static

- H3C, H4, H3D selftests.
- SQL parser/static checks prove BEGIN/COMMIT, timeouts, lock order, pre-DML assertions, forced deferred constraints, exact row-count checks, and no broad/unscoped DELETE.
- Catalog fixture tests using captured catalog JSON: expected graph passes; added FK, removed trigger, disabled trigger, changed trigger function hash, changed delete action, or deferrable change each STOP.
- Fixture parser tests: missing/empty/malformed/duplicate/wrong-cardinality IDs and optional defaults each STOP.
- AUTHZ classifier matrix: only exact owner/shop and invalid-pet branches pass; 400 parse, 401/403 gateway, 404, 409 capacity, timeout, 5xx, HTML, empty body, and unrelated SQL error fail.
- Secret/PII test injects recognizable token, password, DB URL, LINE ID, phone and owner name into mocked failures and proves none appears in argv/stdout/stderr/evidence.

### Transaction/concurrency

- Seed collision inserted after standalone precheck but before seed lock: seed STOPs with zero delta.
- Concurrent insert/update/delete on every controlled seed table while seed locks are held: contender blocks/times out; seed remains atomic.
- Concurrent starter update/delete: blocks/times out and cannot alter seed semantics.
- Trigger missing/disabled/renamed/function changed: seed STOPs before first INSERT.
- Inject error after each of the eight explicit inserts and after each trigger side effect: entire transaction rolls back to exact pre-signature.
- Duplicate/missing/wrong subscription or audit fields: post-seed assertion rolls back everything.
- Teardown with one unexpected row on each catalog child surface: STOP before first DELETE and preserve all rows.
- Concurrent child insert after teardown precheck: blocked by lock; cannot sneak behind assertion.
- Inject error immediately before, during, and after audit maintenance: data and trigger/control state restore exactly.
- Concurrent unrelated audit UPDATE/DELETE during maintenance: must never succeed; prove blocked then immutable failure after commit.
- Teardown exact-row mismatch or missing manifest: STOP without deletion.

### Runner lifecycle

- Inject failure after runtime identity creation but before control identity creation; after each grant/token/snapshot/discovery step; on child spawn, timeout, malformed/missing evidence; and during each cleanup call. Every created resource is independently attempted and exact residuals are reported.
- Invoke `--run` without receipts, with expired receipt, wrong commit/catalog/fixture hash, hook off, or wrong project URL: zero mutations.
- Preflight hook off and hook on both leave zero owned identities/grants.
- Network timeout in first cleanup does not prevent remaining cleanup attempts.
- Process interruption test (`SIGINT`/`SIGTERM`) uses the same bounded cleanup handler; abrupt kill remains a documented manual recovery case with ledger IDs flushed before mutation.
- Token expiry calculation includes every runtime-role token; hook-off does not claim authority gone until the maximum expiry has passed.

### Project gates

- House: `npm run selftest` in `tools/shared-runtime`.
- PS01: run the repository-defined focused H3D test, typecheck, lint, and boundary verifier from a clean `4efee70`-based worktree; do not use or clean the currently dirty PS01 worktree without separate ownership.
- `git diff --check`, exact diff review, secret/PII scan, and verification that only authorized remediation files changed.

## 11. Acceptance Criteria

Implementation is acceptable only when all are true:

1. All HIGH/MEDIUM findings above are implemented or an explicit House decision records a safer equivalent; no finding may be waived by wording.
2. Fresh SELECT-only live catalog proof matches canonical expected trigger/FK/function shapes; UNKNOWN becomes verified or remains a hard STOP.
3. Seed and teardown concurrency/failure-injection suites prove atomic rollback, bounded locks, exact support semantics, no silent cascades, and immutable-audit protection for unrelated rows.
4. H3D runner tests prove zero residual owned identities/grants/files on every injectable failure and direct `--run` cannot bypass receipts.
5. Required H3C probes cannot PASS from an unrelated error and baseline positive probes return exact expected safe shape.
6. Operator Pack has one owner, prerequisite, authorization boundary, recovery action, and evidence output per transition.
7. Evidence contains no secrets or PII and is hash-linked to commit, catalog, fixture manifest, and run ID.
8. House and clean PS01 gates pass; both diffs are reviewed; remote parity is reported accurately.
9. No seed/teardown/Auth/grant/hook/live run has occurred during the remediation implementation lane.

Passing these criteria changes status only to:

`H3D FINAL REMEDIATION IMPLEMENTED / LIVE DML AWAITING SEPARATE AUTHORIZATION`

It does not change H3D, HOUSE-A, or BK01 closure state.

## 12. Hard STOP, Retry, and Recovery Rules

### Hard STOP

- wrong project/commit/branch/dirty implementation scope;
- missing/stale authorization receipt;
- catalog/FK/trigger/function drift;
- any fixture collision, baseline non-empty state, or starter semantic mismatch;
- lock timeout/deadlock, assertion failure, unexpected support delta, deferred-constraint failure;
- unexpected teardown child, manifest/hash mismatch, trigger control mismatch;
- hook state contrary to expected transition;
- ambiguous AUTHZ error, harness FAIL/INCOMPLETE, evidence parse/hash failure;
- any cleanup resource not verified gone or any secret/PII found in evidence.

### Retryable only after verified cleanup

Transient network/5xx/timeout may be retried at most twice with backoff **only** when the operation is known idempotent/read-only or exact post-state has been verified. Before retrying a mutating phase: disable hook if enabled, reconcile every ledger UUID, remove exact owned grant/identity resources, wait past issued-token expiry where applicable, verify fixture transaction outcome from the manifest/signature, and obtain a new authorization receipt if the old one expired. Never rerun seed on an unknown outcome and never use teardown to hide an unknown seed state.

### Manual recovery

If the process is hard-killed, use the flushed redacted ledger to inspect exact Auth UUIDs and grant UUIDs, disable the hook, remove only owned resources, verify zero residue, wait through max expiry, and stop for House review. Fixture teardown remains separately authorized and guarded.

## 13. Required Evidence Bundle

- exact House/PS01 commit, clean/dirty status, and remote parity;
- fresh pre-seed inventory signature, collision/baseline/starter checks;
- fresh catalog manifest with FK/trigger/function hashes;
- fixture-DML authorization receipt identifier (no sensitive signer data);
- seed transaction preconditions, lock acquisition result, exact delta, topology/support manifest and hash;
- independent post-seed SELECT verification;
- hook-probe authorization receipt and hook-off/hook-on probe evidence with exact cleanup UUID verdicts;
- H3C baseline positives, strict AUTHZ outcomes, full required probe gate, child exit/timeout classification;
- all issued token `iat/exp/lifetime/role/project` safe projections and max residual expiry;
- run identity/grant teardown by exact UUID and zero owned residue;
- operator hook-disable proof and post-disable no-elevation proof;
- teardown precondition inventory for every graph child, exact DELETE counts, audit-control restoration, residue zero;
- post-teardown inventory/signature exact match;
- offline/concurrency/failure-injection results, diff check, secret/PII scan;
- final House closure decision, kept separate from implementation/runtime agents.

## 14. Implementation Scope and Final Boundary

Claude may edit only the H3D runner/harness selftests and validation needed for these invariants, the three fixture SQL files, the prep evidence, and the H3D Operator Pack sections. Do not change PS01 business/schema functions for fixture convenience. Do not edit unrelated H3E/H3F/H4/H5 artifacts, do not clean the dirty PS01 worktree, do not merge, and do not execute any live mutation.

Final return must include changed files, exact verification commands/results, remaining UNKNOWN/blockers, commit SHA, clean status, and remote parity. The required terminal status remains:

`LIVE DML NOT AUTHORIZED / H3D NOT PASS / HOUSE-A CLOSED / BK01 QUARANTINED`
