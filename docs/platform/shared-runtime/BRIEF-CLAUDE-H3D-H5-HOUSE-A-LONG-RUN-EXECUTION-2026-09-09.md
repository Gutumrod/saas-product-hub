# BRIEF — Claude Long-Run H3D -> H5 / HOUSE-A Review-Ready Execution

**Date:** 2026-09-09 (Asia/Bangkok)
**Mode:** WSTERA HOUSE / SHARED-RUNTIME / LONG-RUN EXECUTION
**Executor:** Claude Desktop
**Final reviewer:** Secretary GPT in a fresh review chat
**Environment:** WSTERA LAB only (`ykxlqnshaaxmzzocpjlj`)
**Production:** LOCKED
**Final authority boundary:** Claude may close H3/H4/H5 phase evidence, but MUST NOT emit final `HOUSE-A PASS`, release BK01, or authorize BK01 Junction A retry.

## 1. Mission

Continue from the closed H3C checkpoint and carry the shared-runtime isolation program as far as safely possible through:

`H3D -> H3E -> H3F -> H4 -> H5 -> HOUSE-A REVIEW READY`

The goal is not to make tests green. The goal is to prove that the shared WSTERA LAB runtime remains usable by PS01 while product-controlled execution cannot escape its bounded authority into BK01, MT01, Supabase-managed surfaces, global migration history, or platform configuration.

Build-to-Sell remains the priority. Do not open unrelated Council, research, billing, feature, refactor, or product work.

## 2. Immutable Starting Checkpoints

House repo:
- path: `D:\AI-Workspace\projects\saas-product-hub`
- branch at brief creation: `master`
- pre-brief verified base SHA: `6b0020cee7964cb8d2b52340832ca06bb996e62f`
- execution base: the pushed House commit that contains this brief; verify `6b0020cee7964cb8d2b52340832ca06bb996e62f` is its ancestor/base
- origin divergence at brief creation: `0/0`
- working tree at brief creation: clean except this brief/handoff update before checkpoint commit

PS01 staging repo:
- path: `D:\AI-Workspace\projects\saas-product-hub\products\PawSpace-pssr02-staging`
- remote: `https://github.com/Gutumrod/pawspace.git`
- source branch: `build/ps-sr02-staging-2026-09-06`
- required source commit: `c21c27c18f57ee2c54172c0d08697ab02b184b4a`
- source branch is ahead of origin by 1 commit
- original worktree has one pre-existing untracked handoff file; do not consume, delete, stage, or rewrite it from the original worktree.

## 3. Canonical Sources — Read Before Mutation

Read these files from disk in this order and treat them as source of truth:

1. `AGENTS.md`
2. `docs/platform/shared-runtime/BRIEF-HOUSE-SHARED-RUNTIME-CONTINUATION-HANDOFF-2026-09-09.md`
3. `docs/platform/shared-runtime/BRIEF-SHARED-RUNTIME-PLATFORM-ISOLATION-REMEDIATION-2026-09-08.md`
4. `docs/platform/shared-runtime/DESIGN-H2-SHARED-RUNTIME-ISOLATION-EXECUTION-BOUNDARY-2026-09-08.md`
5. `docs/platform/shared-runtime/ADR-SHARED-RUNTIME-MIGRATION-CONFIG-AUTHORITY-2026-09-08.md`
6. `docs/platform/shared-runtime/evidence/H1-EFFECTIVE-PRIVILEGE-INVENTORY-2026-09-08.md`
7. `docs/platform/shared-runtime/evidence/H1-READONLY-INVENTORY-QUERIES-2026-09-08.sql`
8. `docs/platform/shared-runtime/evidence/H3A-PRE-MUTATION-REFRESH-2026-09-08.md`
9. `docs/platform/shared-runtime/evidence/H3B-POST-APPLY-RUNTIME-BOUNDARY-2026-09-08.md`
10. `docs/platform/shared-runtime/evidence/H3C-FINAL-CLOSURE-2026-09-09.md`
11. `docs/platform/shared-runtime/REPORT-SHARED-RUNTIME-SECURITY-ADVISOR-HANDOFF-2026-09-08.md`
12. `docs/platform/shared-runtime/REPORT-BK01-JUNCTION-A-PLATFORM-ISOLATION-HANDOFF-2026-09-08.md`
13. `docs/strategy/WSTERA-SHARED-LINE-OA-TEST-FIXTURE-POLICY.md`
14. PS01: `docs/PS01-SHARED-RUNTIME-ISOLATION-CONTRACT-2026-09-07.md`
15. PS01: `docs/daily/HANDOFF-PS01-BOOKING-V2-SHARED-RUNTIME-CONTINUATION-2026-09-08.md`

Do not trust any brief alone. Verify live disk, git, current WSTERA LAB metadata, and current source before execution.

## 4. Locked H3C State — Do Not Re-Open Without Regression Evidence

H3C is `PASS / CLOSED`.
- Final live matrix: 36 required probes PASS.
- `ps01_line_runtime` is NOLOGIN and has exactly the three Customer LINE V2 PS01 RPCs.
- Direct PS01 write grants: 0.
- `local_service` usage: false.
- custom `public.rls_auto_enable()` EXECUTE: false.
- proof Auth users: 0.
- runtime-token grants: 0.
- hosted Custom Access Token Hook: disabled after proof.
- H3C fixtures/subscriptions/audit/bookings: zero residue.
- final runtime JWT expired before H3C closure.
- final Advisor refresh showed only the pre-existing `local_service.shop_public_profile` SECURITY DEFINER view.

Do not rerun H3C merely for convenience. Reuse its evidence as immutable input unless H3D/H3E exposes a regression.

## 5. Mandatory Workspace Isolation

### Claude Desktop: initial Open Folder / working directory

When starting this assignment in Claude Desktop, open this folder first:

`D:\AI-Workspace\projects\saas-product-hub`

This is the coordinator/House repository containing the canonical brief and shared-runtime evidence. Claude should read this brief from that root, verify the House checkpoint, inspect the PS01 source repo by absolute path, and only then create the isolated execution worktrees below.

Do **not** open `PawSpace-pssr02-staging` as the only Claude working directory for the long run. That repo is only the PS01 source lane, while H3E/H3F/H4/H5 and HOUSE-A evidence belong to the House/platform lane.

After isolation is created, actual execution should happen in these work directories:
- House execution workdir: `D:\AI-Workspace\runtime\worktrees\house-h3d-h5-20260909`
- PS01 execution workdir: `D:\AI-Workspace\runtime\worktrees\ps01-h3d-data-api-20260909`

The original roots remain inspection-only/reference roots during execution:
- House original: `D:\AI-Workspace\projects\saas-product-hub`
- PS01 original: `D:\AI-Workspace\projects\saas-product-hub\products\PawSpace-pssr02-staging`

Do not execute the long run on the existing House master worktree or the dirty PS01 source worktree.

Create two isolated worktrees/branches after fetching remotes and recording exact pre-state:

### House lane
Recommended branch: work/house-h3d-h5-20260909
Recommended worktree: D:\AI-Workspace\runtime\worktrees\house-h3d-h5-20260909
Base on the committed House brief checkpoint created from 6b0020cee7964cb8d2b52340832ca06bb996e62f.

### PS01 lane
Recommended branch: work/ps01-h3d-data-api-20260909
Recommended worktree: D:\AI-Workspace\runtime\worktrees\ps01-h3d-data-api-20260909
Base exactly on PS01 commit c21c27c18f57ee2c54172c0d08697ab02b184b4a.

The original PS01 worktree contains the pre-existing untracked handoff:
docs/daily/HANDOFF-PS01-BOOKING-V2-SHARED-RUNTIME-CONTINUATION-2026-09-08.md
Preserve it untouched in the original worktree. Do not delete, stage, rewrite, reset over, or otherwise consume it.

Do not merge either execution branch to House master or the original PS01 branch. Push execution branches only after focused checkpoint review. Secretary GPT will make the final review/merge decision.

Stage exact files only. Do not use broad staging while unrelated files exist. Each phase must end with a readable evidence trail and a clean execution worktree.

## 6. Global Safety / Security Rules

- WSTERA LAB only. Production mutation is forbidden.
- BK01 remains quarantined. Do not run its failed bootstrap or mutate local_service.
- Do not remediate local_service.shop_public_profile from this brief; preserve/report it as a known separately-owned finding.
- Do not mutate MT01 except for read-only regression measurement.
- Do not weaken RLS, ACLs, search paths, role boundaries, or Supabase managed protections to make a test pass.
- Do not expose net, cron, auth, storage, extensions, ps01_internal, or platform-internal schemas through Data API.
- No project signing private key, legacy JWT secret, service-role key, DB password, token, connection string, or secret value may enter git, docs, logs, test snapshots, chat, or screenshots.
- Secret names may be recorded; values may not.
- Use existing registered WSTERA LAB secrets when available. Do not create duplicate secrets merely because a value cannot be found immediately.
- If a required secret or hosted Dashboard action cannot be performed safely, write an explicit blocker evidence file and stop at that gate. Do not improvise a broader authority path.

## 7. Phase H3D — Product-Path Replacement Proof

### Goal
Replace the active PS01 Customer LINE server path so it no longer uses the reusable PostgreSQL pooler login. The active target becomes:

LINE -> Next.js server -> Supabase Data API -> short-lived Auth-issued JWT role=ps01_line_runtime -> exact PS01 gateway RPC

### Source files to inspect first
- lib/ps01-runtime-db.ts
- lib/ps01-runtime.ts
- lib/line-booking-server.ts
- lib/line-booking-core.ts
- lib/env.ts
- lib/ps01-schema.ts
- .env.example
- all tests that touch Customer LINE Booking V2 or PS01 runtime clients

### Required implementation properties
- The active Customer LINE path must not import or call getPs01RuntimeDatabaseClient().
- Use a server-only Data API adapter implementing the existing Ps01RuntimeRpcClient contract.
- Preserve the same local defense-in-depth allowlist for exactly three RPC names; do not expose a generic arbitrary RPC interface to caller-controlled names.
- The token contract is role=ps01_line_runtime, not the older role=ps01_runtime prototype comment/assumption.
- Token is server-only and short-lived. Do not persist it in source or a committed env file.
- No SUPABASE_SERVICE_ROLE_KEY fallback is allowed in the Customer LINE data-plane.
- No direct table/admin fallback is allowed when Data API RPC fails.
- Do not remove the old direct-DB adapter until replacement proof is green; keep it only as rollback/reference during H3D if needed.

### H3D static/source proof
Add or update focused tests proving:
- missing runtime JWT fails closed;
- the Data API adapter cannot execute a fourth/unallowlisted RPC;
- Customer LINE server actions select the Data API adapter, not the pg pool;
- service-role/admin credentials are not consulted by the Customer LINE runtime path;
- current role/schema assumptions match ps01_line_runtime and ps01 Data API profile.

Run at minimum the repository-equivalent commands for:
- focused unit tests;
- pnpm exec tsc --noEmit;
- pnpm lint;
- pnpm build;
- shared-runtime generator/verifier;
- source scans showing no active Customer LINE dependency on PS01_RUNTIME_DB_* or lib/ps01-runtime-db.ts.

### H3D live LAB smoke
Use the existing H3C platform token-support architecture only as reviewed. Provision a new LAB-only service identity through a supported Auth Admin path, add one finite ps01_line_runtime grant, enable only the Custom Access Token Hook through field-level configuration, obtain a fresh Auth-issued token, and inject the raw token only into the live server process environment.

Do not persist the JWT. Evidence may record only issuer/project ref, role, iat/exp/lifetime, identity UUID, grant timing, and probe outcomes.

The minimum H3D smoke is non-mutating: valid LINE test identity/config -> customer context -> quote through the actual PS01 server action/HTTP path. Also prove cross-shop/context denial and no direct DB fallback.

If hosted Auth hook activation cannot be changed safely without an operator, finish all static H3D work, write a precise H3D-LIVE-ACTION-REQUIRED blocker, and STOP before H3D PASS. Do not proceed to H3E.

### H3D teardown and exit
After live smoke, teardown identity-first:
1. delete/invalidate the temporary Auth service identity and sessions;
2. remove its runtime_token_grants row;
3. disable the hosted Custom Access Token Hook;
4. record the last JWT exp and do not claim authority gone until exp has passed or rejection is directly proven;
5. verify no proof identity/grant residue remains.

H3D may be marked PASS only if source gates, live LAB app-path smoke, negative isolation checks, and token teardown all pass.

Required evidence:
- House: evidence/H3D-PS01-DATA-API-PATH-PROOF-2026-09-09.md
- PS01: docs/daily/H3D-DATA-API-PATH-REPLACEMENT-2026-09-09.md
- machine-readable probe result where practical;
- exact PS01 execution-branch commit SHA and changed-file list;
- test/typecheck/lint/build outputs summarized with raw log paths outside git if large.

Do not push/merge the PS01 change into the original branch. Push only the isolated execution branch after H3D evidence is internally consistent.

## 8. Phase H3E — Retire Direct Product DB Login

### Entry condition
H3C is already PASS. H3D must also be PASS with the real Customer LINE Data API path proven before any direct-login retirement mutation.

### Pre-mutation evidence
Capture live metadata for ps01_runtime_login immediately before change:
- LOGIN/INHERIT/SUPERUSER/CREATEDB/CREATEROLE/BYPASSRLS;
- role memberships;
- search_path/timeouts;
- boolean only for password configured; never read/store password hash/value;
- active pg_stat_activity sessions for the role;
- exact application source references to PS01_RUNTIME_DB_* and direct pooler code.

Prepare exact forward and rollback artifacts in the House lane before applying anything. Recommended names:
- migrations/h3e_ps01_runtime_login_retirement.sql
- migrations/h3e_ps01_runtime_login_retirement_rollback.sql

### Required final state
- ps01_runtime_login becomes NOLOGIN;
- reusable database password is removed from the role;
- no active session under the old login remains;
- PS01 Customer LINE path continues to work through ps01_line_runtime Data API token;
- application runtime no longer requires pooler host/user/password values for the Customer LINE path.

### Credential retirement
After the database role is NOLOGIN/passwordless and the app-path replacement is verified, remove the old DB credential from active PS01 runtime configuration and mark the LAB secret name retired/quarantined in the appropriate secret registry if that registry is in scope. Do not print or recover the old value. Historical documents may keep the secret NAME only.

If an ignored/local .env file contains the old credential, remove the active key/value from that runtime profile without copying it elsewhere. Never commit the local secret file.

### Rollback contract
Rollback must never restore an old password from source control or evidence. If rollback needs LOGIN capability, it must use a newly generated LAB credential injected out-of-band and not logged.

Prove rollback safely. Prefer a transaction-scoped rehearsal or another bounded method that demonstrates the role can be restored to the declared pre-H3E LOGIN/password-present shape with a fresh temporary LAB credential, then returns to the intended final NOLOGIN/passwordless state. Do not leave the direct login re-enabled after rehearsal.

If the current tooling cannot rehearse password restoration without exposing the secret, record that limitation explicitly and provide a reviewed rollback procedure plus all non-secret checks. Do not fake exact rollback proof.

### H3E post-apply proof
- role is NOLOGIN and password-present boolean is false;
- zero active sessions remain for ps01_runtime_login;
- H3D Data API context/quote smoke still passes after retirement;
- direct network login using the retired identity fails;
- ps01_line_runtime remains NOLOGIN with exact three RPC EXECUTEs and zero PS01 direct writes;
- no BK01/MT01/shared privilege changed.

Required evidence: evidence/H3E-PS01-DIRECT-LOGIN-RETIREMENT-2026-09-09.md plus machine-readable pre/post role snapshot. Do not proceed to H3F until H3E is clean.

## 9. Phase H3F — Re-Measure Shared Surfaces

Rerun the canonical H1 read-only inventory after H3E and compare the live state against H1 plus every explicitly authorized H3 delta. Do not compare hashes produced by different canonicalization algorithms.

Use:
- evidence/H1-READONLY-INVENTORY-QUERIES-2026-09-08.sql;
- H3A/H3B/H3C evidence;
- H3D/H3E evidence from this run;
- current global migration ledger and Data API configuration.

Measure and preserve at minimum:
- product role attributes/memberships/effective privileges;
- schema owners and object counts for local_service, ps01, ps01_internal, mt01, mt01_private;
- function EXECUTE visibility and SECURITY DEFINER surfaces;
- managed net/cron/storage/auth reachability distinctions;
- Data API exposed schemas;
- Storage bucket names/count;
- cron jobs;
- extension set and versions;
- global Supabase migration history/count/latest row;
- product/shared metadata signatures using one documented algorithm.

Expected H3-family deltas must be explained explicitly, including ps01_line_runtime, the platform-internal token-support layer, H3 helper search-path hardening, public.rls_auto_enable ACL hardening, and ps01_runtime_login retirement. Any other delta is unexplained until proven otherwise.

H3F FAILS if PS01 works but BK01, MT01, Storage, cron, extensions, Data API exposure, migration history, or other shared surfaces drift outside reviewed House changes.

Required H3F evidence:
- evidence/H3F-SHARED-SURFACE-REMEASURE-2026-09-09.md
- evidence/H3F-SHARED-SURFACE-SNAPSHOT-2026-09-09.json (or equivalent machine-readable output);
- explicit expected-vs-observed delta table;
- exact migration ledger rows added by House during H3;
- explicit H3 verdict.

Claude may mark H3 PASS/CLOSED only when H3D, H3E and H3F all pass and the H3 evidence set is complete. If H3 fails, stop before H4 and write the blocker.

Create a focused House branch checkpoint after H3 closes. Push the execution branch, verify origin divergence 0/0, and keep the worktree clean before H4.

## 10. Phase H4 — Disposable Product Negative-Probe Gate

### Entry condition
H3 must be PASS/CLOSED. Do not use BK01 as the H4 test product.

### H4 design-first rule
Before live H4 mutation, write a short dated H4 execution design in the House branch showing the exact disposable namespace, role names, forward/rollback artifacts, Data API exposure plan, token issuance plan, positive operation, negative matrix, cleanup order, and expected baseline restoration.

Recommended minimum architecture:
- one disposable product schema with a unique H4-only name;
- one NOLOGIN product migrator/owner role with authority limited to its own namespace;
- one NOLOGIN runtime role with no direct DB login credential;
- one exact allowlisted runtime operation in the disposable schema;
- platform-owned temporary token issuance support if needed;
- no product-held credential capable of arbitrary SQL against WSTERA LAB.

Do not generalize the existing H3C ps01-only runtime_token_grants contract merely for convenience. If H4 needs a different Auth hook role, use a separately reviewed temporary H4 support artifact or another House-controlled issuance method that preserves the H2 token-authority contract.

If H4 requires temporary Data API exposure of the disposable schema, only the platform lane may change it. Capture the exact pre-state, add only the disposable schema, reload safely, and restore the exact pre-state during teardown. The disposable product itself must have no ability to change Data API configuration.

### H4 positive proof
Prove BOTH:
1. the disposable product-local migration authority can perform an explicitly granted operation only inside its own namespace when executed through the House-controlled platform lane;
2. a valid short-lived runtime token can invoke only the disposable product allowlisted runtime operation through the product-facing interface.

Denying everything is not a PASS. At least one intended product-local operation must work.

### H4 mandatory negative matrix
The disposable runtime/migrator boundary must fail closed when attempting to:
- access or mutate BK01 local_service objects;
- access or mutate PS01 or ps01_internal objects;
- access or mutate MT01 or mt01_private objects;
- invoke an ungranted function in its own schema;
- enqueue, alter, or address net work;
- alter shared cron state;
- access/mutate auth or storage metadata or another product bucket;
- create/alter/drop extensions;
- create roles, grant role membership, or change database-wide privileges;
- create in public or another product schema;
- alter Data API exposed-schema configuration;
- write global Supabase migration history from a product-local path;
- use a direct product DB login credential (none should exist);
- use foreign-role, expired, or tampered tokens.

For managed surfaces that are not Data API exposed, an explicit 406/403 routing/access denial is valid reachability evidence only when the classifier/evidence distinguishes that from ambiguous transport or 5xx failure.

### H4 Auth/token handling
If using Supabase Auth-issued runtime tokens, provision a disposable LAB-only Auth identity through a supported admin path, give it one finite grant to the disposable runtime role, enable only the reviewed temporary access-token hook configuration, issue a <=5-minute token, and teardown identity-first after probes.

Broad Auth config push is forbidden. Prefer field-level config with pre/post diff. If no safe field-level path is available, stop and produce a blocker rather than changing unrelated Auth settings.

### H4 teardown
Before H4 PASS:
- delete/invalidate disposable Auth identity and sessions;
- remove temporary token grant;
- disable temporary hook and wait past last token exp or prove rejection;
- restore exact Data API schema configuration;
- remove disposable schema/data/roles/support objects using the reviewed rollback/teardown order;
- verify no H4 role, password, Auth user, grant, schema, data, config, Storage, cron, extension, or migration residue remains beyond explicitly preserved House migration evidence;
- re-run shared-surface signatures after teardown.

Required evidence:
- BRIEF-H4-DISPOSABLE-PRODUCT-PROOF-2026-09-09.md
- exact forward/rollback SQL under docs/platform/shared-runtime/migrations/;
- evidence/H4-DISPOSABLE-PRODUCT-PROOF-2026-09-09.md
- machine-readable H4 probe matrix;
- post-teardown zero-residue snapshot.

H4 may be marked PASS only after positive proof, every required negative probe, and exact teardown/restoration all pass.

## 11. Phase H5 — Existing Product Regression + Rollback Proof

### Entry condition
H4 must be PASS and fully torn down.

### PS01 regression
Prove the real PS01 application still works after direct-login retirement:
- Staff/browser authenticated LAB flow;
- room/rate-plan/Booking V2 staff behavior required by the current product;
- Customer LINE bounded Data API context + quote;
- cross-shop denial;
- no active Customer LINE dependency on PS01_RUNTIME_DB_* or ps01_runtime_login;
- no service-role/admin fallback in the normal browser/customer data-plane.

For staff/browser proof, use a LAB-only Auth fixture through the normal authenticated application path. Do not use project admin/service-role as the browser data-plane.

For LINE proof, use only the approved shared LINE OA/test fixture policy and a dedicated test identity. Do not modify or take ownership of a merchant production OA.

A mutating booking-request smoke is authorized in H5 only if Claude first proves the exact submit path has no uncontrolled payment, Storage, cron, pg_net, or external-notification side effect for the disposable LAB fixture. Use exact test IDs and teardown. If side effects cannot be safely isolated, keep H5 customer proof to the strongest non-mutating path and record the limitation for reviewer judgment rather than triggering real external work.

### BK01 preservation
BK01 remains quarantined. Do not apply BK01 schema/bootstrap changes. Re-run only its preserved safe/read-only Booking probe and structural baseline checks needed to prove House work caused no collateral change.

The known local_service.shop_public_profile SECURITY DEFINER Advisor finding and BK01 auth/ownership findings remain separately owned. H5 must report them without claiming they were solved.

### MT01 preservation
Re-measure MT01 and mt01_private schema/count/signature evidence and prove unchanged state unless an independently authorized concurrent House change is explicitly documented. Do not repair or refactor MT01 from this brief.

### Shared/global regression
Verify:
- Storage bucket list/signatures unchanged;
- cron jobs unchanged;
- extension set/versions unchanged;
- Data API schemas restored to the canonical baseline after all temporary H4 work;
- global migration history contains only expected reviewed House entries;
- no disposable H4 object remains;
- Security Advisor shows no new H3/H4/H5-attributable finding.

### Rollback proof
H5 must assemble and verify rollback evidence for every persistent House change introduced by H3D-H3E and any H4 platform artifact. A rollback file that was never checked against live metadata is not sufficient.

At minimum, demonstrate that the declared pre-change role/config/signature state can be restored without using old stored secrets, and that the intended final state is re-established after rehearsal. Record exactly what was executed versus only reviewed.

Required H5 evidence:
- evidence/H5-EXISTING-PRODUCT-REGRESSION-2026-09-09.md
- PS01 browser/staff proof references;
- PS01 Customer LINE proof references;
- BK01 baseline preservation evidence;
- MT01 unchanged evidence;
- shared/global final signature snapshot;
- rollback execution/rehearsal evidence;
- final Security Advisor result;
- explicit H5 PASS or FAIL verdict.

If a real PS01 regression, unexplained BK01/MT01/shared delta, rollback failure, or new security finding appears, H5 FAILS and HOUSE-A must not be prepared as PASS-ready.

## 12. HOUSE-A Review-Ready Package — Claude Must Stop Here

Claude does NOT own the final HOUSE-A decision. After H5, assemble a reviewer package and stop with status:

`HOUSE-A REVIEW READY`

Recommended final report:
`docs/platform/shared-runtime/REPORT-HOUSE-A-REVIEW-READY-2026-09-09.md`

The report must contain, with exact file/SHA references:
1. House execution branch/base/head/remote divergence and changed-file list.
2. PS01 execution branch/base/head/remote divergence and changed-file list.
3. All exact LAB platform migrations applied, in order, with migration-ledger evidence.
4. Effective privilege matrix before and after, including actual login/runtime identities.
5. H3D source/live replacement proof.
6. H3E direct-login retirement and rollback proof.
7. H3F shared-surface comparison with explained deltas.
8. H4 disposable-product positive + negative matrix and zero-residue teardown.
9. H5 PS01 regression evidence.
10. BK01 baseline preservation evidence.
11. MT01 unchanged evidence or explicitly scoped concurrent delta.
12. Storage/cron/extensions/Data API/global migration pre/post signatures.
13. Security Advisor final output and classification of every remaining finding.
14. Rollback proof and exact residual risks/limitations.
15. A candidate recommendation: REVIEW RECOMMENDS PASS, REVIEW RECOMMENDS FAIL, or BLOCKED — but never final HOUSE-A PASS.

Secretary GPT will independently verify disk/git/DB/live evidence in a fresh chat before any final House gate decision or BK01 release.

## 13. Hard Stop Conditions

STOP, write durable evidence, and do not proceed to the next dependent phase if any of these occurs:
- required work would touch Production;
- H3D cannot obtain a safe product-scoped Auth-issued token without broad Auth/config authority;
- PS01 Data API path requires service-role/admin fallback or arbitrary function naming;
- ps01_runtime_login retirement breaks the replacement path;
- old DB credential cannot be retired without exposing or persisting it;
- any product token reaches local_service, ps01_internal, MT01, net, cron, auth, storage, extensions, or platform-internal surfaces outside the reviewed contract;
- H4 disposable product requires a direct DB LOGIN credential or product-controlled global migration authority;
- a 5xx/transport error is the only evidence for a security denial;
- any unrelated BK01/MT01/shared object or migration-history delta appears;
- rollback cannot restore the declared baseline;
- secrets or raw tokens appear in a git candidate, log artifact intended for commit, or evidence file;
- the original dirty PS01 worktree would have to be modified/destructively cleaned to continue.

When blocked, create one precise blocker file stating phase, exact failing step, evidence, what was NOT changed, and the smallest operator action required. Do not leave the database half-mutated; rollback/teardown first whenever possible.

## 14. Commit / Push Discipline for the Long Run

Use focused phase checkpoints on the isolated branches. Recommended sequence:
- PS01 branch: H3D implementation + PS01 evidence checkpoint after all H3D gates pass.
- House branch: H3D House evidence checkpoint.
- House branch: H3E forward/rollback + post-apply evidence checkpoint.
- House branch: H3F remeasurement / H3 closure checkpoint.
- House branch: H4 design + reviewed forward/rollback before live H4 mutation.
- House branch: H4 proof/teardown checkpoint.
- House branch: H5 regression + HOUSE-A review-ready package checkpoint.

Before each commit:
- inspect status and exact diff;
- run diff whitespace check;
- parse every JSON evidence file;
- run relevant source/tests;
- scan candidate files for JWT-like strings, secret-role keys, passwords, connection strings, and private-key markers;
- stage exact intended files only.

After each push:
- fetch remote;
- verify execution branch origin divergence 0/0;
- verify worktree clean;
- record exact full SHA in the phase evidence.

Never force-push shared branches and never merge into master/original PS01 branch in this execution.

## 15. First Execution Actions

Claude must begin with evidence, not code changes:
1. Read all canonical sources above.
2. Verify House original worktree SHA/status/divergence and confirm the brief checkpoint is present.
3. Verify PS01 original worktree SHA/status/divergence and record the pre-existing untracked handoff without touching it.
4. Create the isolated House and PS01 worktrees/branches.
5. Capture a fresh read-only WSTERA LAB start snapshot before H3D work: role attributes, exact ps01_line_runtime EXECUTEs, PS01 direct writes, Data API schemas, product schema counts/signatures, Storage, cron, extensions, migration ledger latest/count, and current Advisor state where accessible.
6. Confirm H3C proof identities/grants remain zero and hosted hook is currently disabled before creating any new H3D proof authority.
7. Inspect PS01 runtime source and tests, then write the H3D implementation plan into the PS01 evidence file before modifying code.

Known post-H3C expectations at start include:
- ps01_line_runtime NOLOGIN;
- exact three Customer LINE V2 PS01 RPC EXECUTEs;
- zero direct PS01 write grants;
- local_service usage false;
- public.rls_auto_enable EXECUTE false;
- Storage bucket count 2;
- cron job count 8;
- Data API schemas public, graphql_public, local_service, ps01;
- zero H3C proof users/grants;
- Advisor known finding local_service.shop_public_profile only at the last H3C refresh.

If the fresh start snapshot materially differs, do not assume the brief is stale harmlessly. Identify intervening authorized work before mutation.

## 16. Claude Final Return Contract

When the long run stops, Claude must not return only a chat summary. The durable repo evidence is authoritative.

Claude final response to Owner must contain:
- terminal status: HOUSE-A REVIEW READY, BLOCKED at <phase>, or FAILED at <phase>;
- full path to REPORT-HOUSE-A-REVIEW-READY-2026-09-09.md or blocker file;
- House execution branch + full HEAD SHA + origin divergence + clean/dirty state;
- PS01 execution branch + full HEAD SHA + origin divergence + clean/dirty state;
- list of LAB migrations/config changes that remain intentionally applied;
- confirmation that temporary Auth identities/tokens/H4 objects are torn down, or exact residual authority and expiry if not yet gone;
- explicit statement that HOUSE-A was NOT finally declared by Claude and BK01 remains locked pending Secretary GPT review.

## 17. Success Definition

This Claude assignment succeeds when it either:
A. reaches HOUSE-A REVIEW READY with H3/H4/H5 evidence complete, branches pushed/clean, temporary proof authority torn down, and no unexplained collateral delta; or
B. stops fail-closed at the first real blocker with enough durable evidence that Secretary GPT can independently decide the smallest remediation.

It is NOT success to bypass a failed gate, weaken an isolation boundary, touch Production, mutate BK01 to make House tests pass, or claim a final HOUSE-A verdict without independent Secretary review.

**Owner direction:** move fast, but never trade isolation/security evidence for speed.
