# ADDENDUM — Claude Prepare-Until-Operator-Action

**Date:** 2026-09-09 (Asia/Bangkok)
**Parent brief:** `BRIEF-CLAUDE-H3D-H5-HOUSE-A-LONG-RUN-EXECUTION-2026-09-09.md`
**Current execution state:** `BLOCKED at H3D live smoke / static H3D complete`
**Authority:** extends PREPARE-ONLY work while CEO/operator is unavailable; it does not waive any phase entry gate.

## Owner Direction

Do not stop working merely because H3D live proof requires an authorized Supabase Dashboard action. Continue every safe, non-mutating, reversible preparation that can be completed without the CEO/operator, so that the eventual operator session is reduced to the smallest possible action set.

The long run must stop only when either:
1. all safe preparatory work is exhausted and the remaining work genuinely requires operator-only hosted control-plane action or secret-bearing live authority; or
2. a real security/architecture blocker requires Owner/Secretary decision.

This addendum does **not** authorize H3E/H3F/H4/H5 execution before their entry gates. It authorizes preparation only.
## While H3D Live Is Blocked

Complete all remaining H3D static work to reviewer-ready quality:
- inspect the final PS01 diff against the original `c21c27c...` base;
- strengthen focused tests/source scans where gaps remain;
- prepare a secret-free H3D live runner/checklist using environment variable names only;
- prepare exact expected positive/negative outcomes and teardown verification queries;
- verify no direct `PS01_RUNTIME_DB_*`, `ps01-runtime-db.ts`, service-role, or admin fallback remains on the active Customer LINE path;
- keep H3D verdict `BLOCKED / LIVE ACTION REQUIRED` until the real LAB smoke runs.

The existing `H3D-LIVE-ACTION-REQUIRED-2026-09-09.md` remains the live gate. Do not fake or simulate the missing hosted hook proof.
## Prepare H3E Without Executing It

Prepare, but do not apply, the full H3E retirement package:
- fresh SELECT-only pre-state queries for `ps01_runtime_login` role attributes, memberships, password-present boolean, role settings, and active sessions;
- forward SQL to make `ps01_runtime_login` NOLOGIN/passwordless;
- rollback/recovery SQL/procedure that requires a newly provisioned LAB credential and never restores an old secret from source/evidence;
- post-apply verification SQL;
- direct-login failure probe plan;
- secret-registry cleanup checklist by secret NAME only;
- H3E evidence template with every required field prefilled except live results.

Do not alter `ps01_runtime_login`, its password, sessions, or active secret configuration until H3D is actually PASS.
## Prepare H3F / H4 / H5 Without Crossing Gates

Prepare H3F:
- reusable H1-compatible read-only inventory runner/query pack;
- expected-delta manifest for H3B/H3C/H3D/H3E;
- machine-readable snapshot schema and comparison script;
- explicit unexplained-delta stop logic.

Prepare H4:
- dated disposable-product execution design;
- exact temporary names, forward/rollback SQL, cleanup order, positive operation, negative matrix, token/config plan, and zero-residue checks;
- safe probe harness/classifiers with offline selftests;
- no live H4 schema/role/Auth/config creation before H3 is PASS.

Prepare H5:
- PS01 staff/browser regression checklist and test runner;
- PS01 Customer LINE regression runner/checklist;
- BK01 read-only preservation probes only;
- MT01 read-only signature probes only;
- shared Storage/cron/extensions/Data API/migration-ledger final comparison scripts;
- rollback-proof checklist and Security Advisor capture template.

All of the above remains PREPARE-ONLY until its parent gate passes.
## Operator Action Pack — Required End State Before Stopping

Before stopping for the CEO/operator, produce one consolidated durable file:

`docs/platform/shared-runtime/OPERATOR-ACTION-PACK-H3D-TO-H5-2026-09-09.md`

It must tell the operator exactly:
- which Dashboard page to open and which single field/toggle to change;
- which disposable Auth user(s) must be created, if still required;
- which prepared command/script to run after each click;
- which outputs indicate PASS versus STOP;
- which teardown click/action restores pre-state;
- which later operator-only actions are already known for H4/H5, clearly separated from actions that may disappear after H3D;
- expected maximum residual JWT expiry/wait where applicable;
- no secret values.

The operator pack must minimize manual work. If Claude can automate a step safely via existing approved tooling, it must not assign that step to the CEO.
## Hard Boundaries During Preparation

Preparation must remain non-mutating against dependency-gated live surfaces. In particular:
- no H3E role/password mutation before H3D PASS;
- no H4 disposable schema/role/Data API/Auth config mutation before H3 PASS;
- no BK01 schema/bootstrap mutation;
- no MT01 mutation;
- no Production;
- no broad Auth config push;
- no secret/token/password value in git, logs, evidence, or chat;
- no phase PASS based only on prepared scripts or static tests.

Read-only LAB metadata queries and local/offline tests are allowed. Local code/docs/scripts on isolated execution branches are allowed.

## Checkpoint / Return Contract

Commit all completed PREPARE-ONLY artifacts on the existing isolated execution branches using exact staging. Do not merge to master/original PS01 branch. Push only if the parent brief's branch discipline is satisfied; otherwise leave exact clean local checkpoints and report them.

Final status while CEO is unavailable should be:

`OPERATOR ACTION PACK READY / H3D LIVE BLOCKED`

Return the full operator-pack path, House/PS01 branch HEADs and statuses, what is already prepared for H3E/H3F/H4/H5, and the smallest remaining manual action. H3D/HOUSE-A/BK01 remain locked until live evidence exists.