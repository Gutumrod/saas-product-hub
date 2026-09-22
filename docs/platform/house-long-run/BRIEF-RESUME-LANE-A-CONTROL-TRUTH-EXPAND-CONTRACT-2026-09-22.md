# BRIEF — RESUME LANE A CONTROL TRUTH WITH SAFE EXPAND → DEPLOY → CONTRACT ROLLOUT

Date: 2026-09-22
Task: WSTERA-CONTROL-TRUTH-SYNC-001
Workflow: WF-DEV-01 v1.3.0 / LONG_RUN
Lane: A — Control Truth / platform.wstera.com
State on entry: OWNER_HOLD_PRODUCTION_MUTATION
Authority in this brief: SOURCE / TEST / EVIDENCE / REVIEW ONLY — NO PRODUCTION MUTATION

## 1. Why this continuation exists

R2 closed the source/revision work at:
- hub-web fde38f64e6bd72de9af549a88777bf276933c051
- wstera-workflows fb84b9d6517186246dacde2871937d98c52ec7a6

The Owner Hold then proposed a coupled migration/deploy window for 0009_work_scope_identity.sql.

A later controller verification found a rollout-safety defect in that plan:
- currently deployed hub-web uses the legacy 17-argument ingest_agent_work_event_atomic;
- the approved new hub-web source uses the 19-argument call;
- current 0009 creates/grants the 19-argument overload and later drops the 17-argument overload in the same migration file;
- the normal repo migration command is drizzle-kit migrate, which applies migration files as migrations rather than pausing inside one file to let a Worker deploy occur;
- therefore applying the current whole 0009 before deploy breaks the old client after the DROP, while deploying the new client before the 19-argument function exists breaks the new client.

The migration header itself already states the intended safe order:
EXPAND (sections 1–8) → deploy new client → CONTRACT (old 17-arg DROP).

This brief turns that intent into an executable, reviewable release sequence.

## 2. Entry snapshot — re-measure before editing

Planning:
- worktree D:\AI-Workspace\runtime\worktrees\wstera-control-truth-sync-001
- branch work/wstera-control-truth-sync-001
- measured HEAD 14b798c7d87a7b62cf38ab28472b0cc9d3f813fa
- measured parity 0/0

hub-web:
- worktree D:\AI-Workspace\runtime\worktrees\hub-web-cts001
- branch work/wstera-control-truth-sync-001
- measured HEAD fde38f64e6bd72de9af549a88777bf276933c051
- measured remote parity 0/0

wstera-workflows:
- worktree D:\AI-Workspace\runtime\worktrees\wstera-control-sync-t4
- branch work/wstera-control-truth-sync-001-t4
- measured HEAD fb84b9d6517186246dacde2871937d98c52ec7a6
- measured parity 0/0

If any of these changed, classify the change before proceeding. Do not reset/clean unknown work.

## 3. Required runtime

Hermes remains Lane-A orchestrator/state holder.

Before substantive dispatch:
- load and obey hermes-native-swarm;
- load/discover wstera-control-sync for truth/activity projection;
- Agent Relay is not the ordinary execution path.

No installed runtime skill mutation is authorized by this brief.

## 4. Objective

Prepare and independently review a two-revision database rollout that allows both old and new clients
to work during the deployment boundary.

### Revision A — EXPAND

Modify the unapplied 0009_work_scope_identity.sql so it is additive/compatible:

- add/backfill scope identity as already designed;
- create the 19-argument ingest_agent_work_event_atomic;
- revoke/grant its exact privileges as already designed;
- DO NOT DROP the 17-argument overload in Revision A;
- update comments/rollback text so they truthfully describe the staged rollout.

Critically, Revision A must not contain a new 0010 migration file in drizzle/migrations/.
The first production migration command must run from a repository revision where 0009 is the only new
unapplied migration. Otherwise drizzle-kit migrate can immediately apply the contract step and recreate
the original gap.

### Revision B — CONTRACT

A child commit of Revision A that adds:
drizzle/migrations/0010_retire_legacy_work_event_rpc.sql

The contract migration must:
- fail closed unless the 19-argument function exists;
- verify the new path has the intended executable privilege shape before retiring the old path;
- drop exactly the superseded 17-argument signature;
- make no unrelated schema/data change;
- document the restore-before-client-rollback recovery order.

Revision B may update tests/docs needed to prove the contract migration.

No production app logic should change from fde38f6. If implementation discovers that app/source behavior
must change, stop and raise a new finding instead of silently widening this amendment.

## 5. Why two git revisions are mandatory

The production migration runner is:
drizzle-kit migrate

If 0009 and 0010 are both present as unapplied migrations when the first migration command runs,
both may be applied sequentially and the safe deployment boundary disappears.

Therefore prepare two immutable reviewed revisions:

- A_EXPAND_REV: contains the safe expanded 0009, no 0010 migration file
- A_CONTRACT_REV: child commit containing 0010

Both revisions must be pushed and independently reviewed before production authorization.

The Worker application source/bundle must be proven equivalent between the two revisions except for
non-bundled migration/test/docs content.

## 6. Allowed source scope

Primary allowed files:
- drizzle/migrations/0009_work_scope_identity.sql
- new drizzle/migrations/0010_retire_legacy_work_event_rpc.sql — Revision B only
- server/control-plane/work-truth-migration.test.ts
- narrowly related migration/release evidence docs for this task

Do not modify unrelated Control Plane behavior, decision semantics, truth gates, UI, billing, auth,
or Control Sync sender behavior.

If a test requires another file, document why before editing and keep the amendment minimal.

## 7. Required deterministic proof — Revision A / EXPAND

Tests must prove:
1. 0009 creates the 19-argument function.
2. 0009 grants 19-argument execution only to the intended backend role and revokes PUBLIC/anon/authenticated.
3. 0009 contains no executable DROP of the 17-argument signature.
4. the legacy signature remains structurally available through the expansion boundary.
5. scope identity columns/backfill/constraint semantics remain unchanged from the R2-approved design.
6. no fake Product code path is introduced.
7. full hub-web typecheck/tests pass.
8. git diff --check clean.
9. production Worker dry-run bundle preserves the already-approved T3/T5 application behavior.

## 8. Required deterministic proof — Revision B / CONTRACT

Tests must prove:
1. 0010 is the only new contract migration relative to Revision A.
2. 0010 fails closed if the 19-argument function/preconditions are absent.
3. 0010 drops exactly the 17-argument superseded signature.
4. 0010 does not drop/alter the 19-argument function.
5. after the modeled contract state, no legacy 17-argument callable path remains.
6. rollback/restore instructions restore 17 before any old-client rollback.
7. full hub-web typecheck/tests pass.
8. git diff --check clean.
9. the Worker production bundle from Revision A vs Revision B is byte-identical or otherwise proven
   application-source-equivalent; any difference must be explained and reviewed.

Use falsification: mutate/remove each rollout invariant and prove the relevant test fails, then revert byte-identically.

## 9. Review gate — focused R2 rollout amendment

After both revisions are ready, Codex independently reviews:
- exact A_EXPAND_REV
- exact A_CONTRACT_REV
- diff from R2-approved hub-web fde38f6
- unchanged wstera-workflows fb84b9d
- deterministic gates
- migration-runner sequencing
- rollback/forward-fix plan
- exact production operator steps

This is a focused rollout amendment review. Do not claim that the old R2 exact-SHA approval automatically
covers the changed migration revisions.

Codex must explicitly answer:
- Can the old deployed 17-arg client operate after EXPAND and before deploy?
- Can the new 19-arg client operate after deploy and before CONTRACT?
- Can the contract migration run only after the new Worker is proven live?
- Does the normal migration runner apply only 0009 when run from A_EXPAND_REV?
- Does it apply only 0010 later when run from A_CONTRACT_REV after 0009 is already recorded?
- Is rollback safe on both sides of the contract boundary?

If Codex mutates any reviewed file, that revision needs a new independent review before release.

## 10. Production rollout runbook to prepare — DO NOT EXECUTE

The reviewed release package must contain this sequence.

### Window 0 — preflight
- take a Control DB backup / recovery point;
- record DB migration baseline and function signatures;
- record current Worker version;
- record installed Control Sync hashes;
- confirm no conflicting Lane-B live mutation window;
- confirm exact reviewed revisions available.

### Window 1 — EXPAND
Checkout/use exact A_EXPAND_REV.

Run the normal migration mechanism from that exact revision so only safe 0009 is new.

Verify live DB:
- 17-argument function exists and retains its expected backend accessibility;
- 19-argument function exists;
- 19-argument privilege shape is correct;
- new scope columns/backfill/constraint are correct;
- currently deployed old Worker ingestion still succeeds.

If this fails, stop. Do not deploy the new Worker.

### Window 2 — DEPLOY
Deploy hub-web from the reviewed application revision whose application source is the R2-approved source
plus the rollout-only migration/test/docs amendment.

Verify:
- exact Worker version/revision is serving;
- product-scoped event succeeds through 19 args;
- House/Platform explicit non-product scope succeeds with no fake Product code;
- identity conflict/missing identity cases fail closed;
- truth modes remain correct;
- decision poll/ack routes are live.

Before contract, confirm the old Worker revision is no longer serving and allow any old in-flight request
to drain using a measured/justified drain condition, not a guessed assertion.

If deploy/live proof fails, rollback/re-point the Worker while 17 still exists. Do not run 0010.

### Window 3 — CONTRACT
Checkout/use exact A_CONTRACT_REV.

Run the normal migration mechanism. Since 0009 is already recorded, only 0010 should apply.

Verify:
- 17-argument function is gone;
- 19-argument function still works;
- product and non-product ingestion pass;
- legacy bypass is absent.

### Window 4 — Control Sync skill install
Only after the decision routes are live and the DB/client contract is stable:

- install exact reviewed wstera-control-sync revision fb84b9d or its independently proven install-equivalent tree;
- verify installed file hashes against source;
- verify detail bound is active;
- verify decision poll/consume support;
- preserve rollback copy/hashes.

### Window 5 — full live proof
Run the nine live proofs already defined in the Owner Hold:

1. product task sync works;
2. identity conflicts fail closed;
3. House/Platform non-product sync works without fake Product code;
4. one hold creates exactly one Inbox item;
5. decision consumes once and does not re-advance;
6. live UI truth modes are truthful;
7. no production demo state;
8. outbox has no unexplained pending/dead-letter;
9. public health/security baseline intact.

Then proceed to R3 and T7 per the locked manifest.

## 11. Rollback / forward-fix contract

### Before CONTRACT
If the new Worker fails:
- re-point/rollback Worker to the old version;
- 17-argument function still exists, so old ingestion remains compatible;
- leaving additive 19-arg function/columns temporarily is acceptable pending reviewed cleanup;
- do not destructively reverse data by default.

### After CONTRACT
Never roll the Worker back to a 17-argument client while the 17-argument RPC is absent.

If an old-client rollback becomes necessary:
1. restore the exact reviewed 17-argument function/privileges first;
2. verify it live;
3. only then re-point the Worker to the old version.

Prefer forward-fix when the new 19-argument path is healthy.

### Skill
Rollback installed Control Sync using the pre-install hashes/files recorded in the T4 parity plan.

## 12. Authority boundary

This brief authorizes only:
- source edits;
- tests/falsification;
- evidence;
- two immutable rollout commits;
- commit/push;
- focused Codex review;
- preparation of the production runbook.

It does NOT authorize:
- DB backup execution;
- migration apply;
- hub-web production deploy;
- Cloudflare mutation;
- runtime skill install;
- Draft PR #2 merge;
- any Production mutation.

After the focused review, STOP at:

OWNER_HOLD_PRODUCTION_MUTATION_V2

Present:
- A_EXPAND_REV
- A_CONTRACT_REV
- unchanged wstera-workflows@fb84b9d
- exact SQL hashes
- exact migration-runner commands
- exact Worker deploy revision
- rollback/restore artifact
- focused Codex verdict
- collision check against Lane B

No Owner answer = no production mutation.

## 13. Terminal path after future Owner approval

Only after explicit Owner approval of the V2 package:

T6 EXPAND → DEPLOY → CONTRACT → SKILL INSTALL → LIVE PROOF → R3 → T7
→ READY FOR OWNER CONTROL TRUTH REVIEW

Do not claim PRODUCTION_READY or OPERATED_STABLE from this lane alone.
