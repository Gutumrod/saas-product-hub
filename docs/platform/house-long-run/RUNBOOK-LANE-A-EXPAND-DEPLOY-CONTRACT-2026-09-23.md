# PRODUCTION ROLLOUT RUNBOOK — Lane A EXPAND → DEPLOY → CONTRACT

Task: `WSTERA-CONTROL-TRUTH-SYNC-001` · Workflow `WF-DEV-01 v1.3.0 / LONG_RUN`
Prepared: 2026-09-23 (Asia/Bangkok) · Prepared by: Hermes (Long-Run Orchestrator / State Holder)
State on entry: **`OWNER_HOLD_PRODUCTION_MUTATION_V2`**
Authority: **PREPARATION ONLY — DO NOT EXECUTE.** This document authorizes nothing.

> **Status: MECHANISM RESOLVED — PREPARED, NOT EXECUTED.** The apply mechanism this runbook
> depends on is now resolved at design level by `LANE_A_EXACT_FILE_POSTGRES_TRANSACTION_APPLY_V1`
> and implemented by the operator helper named in §2. That helper is **prepared and has NOT been
> executed**: no database has been contacted, no connection has been attempted, no migration has
> been applied. Live execution still requires the authority guards **and** a future Owner release
> authorization. The precondition blocker recorded in
> `FINDING-MIGRATION-RUNNER-CONTRADICTS-BRIEF-2026-09-23.md` is cleared at the mechanism level;
> its operator-contract level stays open pending focused review and that authorization.
> **Nothing in this document is executable authority.**

---

## 0. Reviewed revisions this runbook refers to

| Role | Repo | Revision | Remote parity |
|---|---|---|---|
| `A_EXPAND_REV` — Revision A (EXPAND) | `hub-web` | `dfcb4be4ac8b488ef740e2147f83b5c19251fbd8` | 0/0 |
| `A_CONTRACT_REV` — Revision B (CONTRACT) | `hub-web` | `dd9a629eaa4e75c29fe0b8aa31698b5f9c4e1dae` | 0/0 |
| R2-approved application source (parent of A) | `hub-web` | `fde38f64e6bd72de9af549a88777bf276933c051` | 0/0 |
| Control Sync source (unchanged by this lane) | `wstera-workflows` | `fb84b9d6517186246dacde2871937d98c52ec7a6` | 0/0 |
| Planning / evidence | `saas-product-hub` | see latest planning head | — |

Exact migration hashes:

```text
drizzle/migrations/0009_work_scope_identity.sql
  at A_EXPAND_REV and A_CONTRACT_REV (unchanged between them)
  sha256 8f88a7d1e4d3777dd0c2adefa999f61799bd50dd1270407fa025f3c4068d3487

drizzle/migrations/0010_retire_legacy_work_event_rpc.sql
  at A_CONTRACT_REV (absent at A_EXPAND_REV)
  sha256 3963c6a6e6423f006889d87c735e86ef30831680964c19b096f23f2b091a7b30
```

Application-source equivalence (measured, not asserted):

```text
git diff --stat fde38f6 dd9a629 -- . ':!drizzle' ':!server/control-plane/work-truth-migration.test.ts'
  -> EMPTY  (no application source differs from the R2-approved source)

esbuild bundle of server/_core/index.ts at dfcb4be vs dd9a629
  -> sha256 6e596d6ecde0ca7e92a99bd8ab9b2aab7a1587f831ece52831839a803f2bae11 (both, byte-identical)
```

The two rollout revisions change **only** the two migration files and the migration-contract
test file. No Worker application behaviour changes from `fde38f6`.

---

## 1. What the two-revision shape buys, in one paragraph

`0009` is EXPAND-only: it adds the scope columns, the constraint, the backfill and the
19-argument scope-gated RPC with its service_role-only privilege block, and it **does not** drop
the superseded 17-argument overload. So a currently deployed 17-argument Worker keeps ingesting
throughout the expansion. `0010` is the CONTRACT step: it fails closed unless the 19-argument path
exists, is reachable by `service_role`, is not reachable by PUBLIC, and the legacy overload is
present exactly once — and only then drops the 17-argument signature. The legacy overload is
therefore retired only after the new client has been deployed and proven live.

---

## 2. ✅ APPLY MECHANISM — RESOLVED (`LANE_A_EXACT_FILE_POSTGRES_TRANSACTION_APPLY_V1`)

The apply mechanism is resolved. This runbook no longer depends on `drizzle-kit migrate`, and it no
longer depends on a migration ledger. Both of those were the blocker recorded in
`FINDING-MIGRATION-RUNNER-CONTRADICTS-BRIEF-2026-09-23.md`; that finding is cleared here at the
**mechanism** level and stays open only at the operator-contract level.

**Mechanism id:** `LANE_A_EXACT_FILE_POSTGRES_TRANSACTION_APPLY_V1`
**Operator helper:** `docs/platform/house-long-run/tools/lane-a-exact-file-postgres-apply.mjs`
**Helper state: PREPARED AND NOT EXECUTED.** No database has been contacted with it, no connection
has been attempted, and no migration has been applied. It is prepared tooling only.

### 2.1 What is used, and what is deliberately NOT used

| Decision | Value |
|---|---|
| Apply input | the exact reviewed SQL file, read as raw bytes **from the pinned git revision** (`git cat-file -p <rev>:<file>`) and verified against an expected sha256 |
| Runner | **NO Drizzle runner.** `drizzle-kit generate`, `drizzle-kit migrate` and `npm run db:push` are never invoked |
| Ledger | **NO migration ledger.** `drizzle/migrations/meta/_journal.json` and `__drizzle_migrations` are not created and are not consulted |
| Sequencing proof | **live catalog preconditions read inside the apply transaction, plus immutable release evidence** for the exact file / revision / hash |
| Scope of one run | exactly ONE migration file, inside exactly ONE transaction, never split across transactions |
| Dry run | `BEGIN -> exact migration SQL -> in-transaction assertions -> deliberate ROLLBACK` |
| Apply | `BEGIN -> preconditions -> exact migration SQL -> postconditions -> COMMIT` |

There is no ledger row to reconcile and no journal to enumerate. The "only 0009 is new, then only
0010 is new" property is therefore asserted by **release evidence + the live catalog state the
helper measures inside the transaction**, not by a runner that cannot assert it. The absence of a
Drizzle ledger is explicit and accepted for this release mechanism (brief §5).

> The `db:push` prohibition is unchanged and still holds: **do not** run `npm run db:push`, and
> **do not** create a migration journal to make drizzle-kit work. That is a schema-wide operation
> and is out of scope for this lane.

### 2.2 Refusal order is load-bearing

Before **any** database credential is read and before **any** connection is attempted, the helper
verifies the following in this order and exits non-zero with a machine-readable classification:

| # | Check | Refusal classification |
|---|---|---|
| 1 | `--migration-id` is exactly `0009`/`0010` **and** `--file` equals that id's bound path | `MIGRATION_IDENTITY_UNKNOWN` |
| 2 | the bytes extracted **from the declared revision** hash to exactly `--expect-sha256` | `FILE_HASH_MISMATCH` |
| 3 | `--expect-revision` is an exact 40-hex commit present in `--control-repo` | `REVISION_NOT_FOUND` |
| 4 | applying `0010` requires `--require-evidence` recording a successful `0009` apply for the same target ref | `SEQUENCING_EVIDENCE_MISSING` |
| 5 | `LANE_A_LIVE_DB_AUTHORIZED=YES` is present | `AUTHORITY_GUARD_REFUSAL` |
| 6 | `--mode apply` additionally requires `LANE_A_PRODUCTION_APPLY_AUTHORIZED=YES` | `AUTHORITY_GUARD_REFUSAL` |

Checks 1–3 compare the file bytes **read out of the revision**, never merely the working-tree file.
Checks 5–6 read **no** credential and make **no** connection attempt.

After checks 1–6, and still before any connection, the target is proven by **parsing** the
credential (never by dialing out): the project reference is the token after the last `.` in the
pooler user-info form `postgres.<ref>`, or the label before `.supabase.co` in the host form. Only a
sanitized identity is reported.

| Target-proof outcome | Classification |
|---|---|
| credential resolves to a different project ref than `--expect-target-ref` | `TARGET_IDENTITY_MISMATCH` |
| identity cannot be determined | `TARGET_IDENTITY_UNDETERMINABLE` |

The connection string is read **only** from `LANE_A_CONTROL_DATABASE_URL`. It is never accepted on
argv, never printed, and never written to evidence. The two environment guards are safety interlocks
only: they create no authority and **must not** be set before the future Owner Production approval.

### 2.3 Exact dry-run commands (documented; NOT to be run before authorization)

Both commands below are the **dry-run** form only. They are recorded so the operator step is
executable and unambiguous, not so it can be run now. Set neither guard until the Owner release
authorization exists.

0010 additionally requires `--require-evidence` pointing at the release record of a successful 0009
apply for the same target ref — that requirement applies to `--mode apply`; the dry-run forms below
are shown without it.

```text
# Window 1 — 0009 EXPAND dry-run, from A_EXPAND_REV
node docs/platform/house-long-run/tools/lane-a-exact-file-postgres-apply.mjs \
  --mode dry-run \
  --migration-id 0009 \
  --file drizzle/migrations/0009_work_scope_identity.sql \
  --expect-revision dfcb4be4ac8b488ef740e2147f83b5c19251fbd8 \
  --expect-sha256 8f88a7d1e4d3777dd0c2adefa999f61799bd50dd1270407fa025f3c4068d3487 \
  --expect-target-ref <control-project-ref> \
  --control-repo D:/AI-Workspace/runtime/worktrees/hub-web-cts001 \
  --evidence-out <path>/lane-a-0009-dryrun.json

# Window 3 — 0010 CONTRACT dry-run, from A_CONTRACT_REV
node docs/platform/house-long-run/tools/lane-a-exact-file-postgres-apply.mjs \
  --mode dry-run \
  --migration-id 0010 \
  --file drizzle/migrations/0010_retire_legacy_work_event_rpc.sql \
  --expect-revision dd9a629eaa4e75c29fe0b8aa31698b5f9c4e1dae \
  --expect-sha256 3963c6a6e6423f006889d87c735e86ef30831680964c19b096f23f2b091a7b30 \
  --expect-target-ref <control-project-ref> \
  --control-repo D:/AI-Workspace/runtime/worktrees/hub-web-cts001 \
  --evidence-out <path>/lane-a-0010-dryrun.json
```

`<control-project-ref>` is the WSTERA_CONTROL project reference: `plvpbribiomqppfokzir`, recorded
in `R15-D0-PREFLIGHT-OUTCOME-2026-09-20.md:45` (that row was explicitly *not inspected* in R15 —
the value is a project identifier from the canonical project map, **not** a secret, and the runbook
records it so the operator cannot guess or mistype the target). The helper refuses if the credential
does not resolve to it.

The apply form is the same command with `--mode apply` **and** both authority guards set, and for
`0010` **also** `--require-evidence`. Do not prepare or run the apply form before the Owner release
authorization.

### 2.4 Preconditions / postconditions (real catalog reads)

Both phases read the catalog; neither trusts "the file ran" as proof.

**0009 (EXPAND)**
- precondition: exactly one `public.ingest_agent_work_event_atomic` with `pronargs = 17` exists;
- postcondition: exactly one with `pronargs = 19` exists **and** the 17-argument one still exists
  **and** `service_role` can execute the 19-argument one **and** PUBLIC cannot **and**
  `public.work_queue_items` has `scope_type`/`scope_key` with the intended types **and** the
  `work_queue_items_scope_consistency` constraint exists and is validated.

**0010 (CONTRACT)**
- precondition: exactly one with `pronargs = 19` **and** exactly one with `pronargs = 17`,
  `service_role` can execute the 19-argument one, PUBLIC cannot;
- postcondition: exactly one with `pronargs = 19` remains and **zero** with `pronargs = 17` remain.

These shapes were read out of the reviewed migration files themselves
(`0009_work_scope_identity.sql` sections 2/4/8, `0010_retire_legacy_work_event_rpc.sql` sections 1/3),
not assumed. On dry-run, the helper additionally re-asserts after the rollback that the persistent
shape equals the measured pre-run shape. On apply, any failing precondition, statement or
postcondition rolls back, exits non-zero with `APPLY_FAILED`, and performs **no automatic retry**.

---

## 3. Window 0 — preflight

- [ ] Take a Control DB backup / recovery point and record its identifier.
- [ ] Record the DB migration baseline and the current function signatures, specifically the
      `pronargs` set of `public.ingest_agent_work_event_atomic` (expect exactly one with 17).
- [ ] Record the currently serving Worker version/revision.
- [ ] Record installed Control Sync hashes (rollback targets, per `T4-WU03…` §2).
- [ ] **Collision check against Lane B**: confirm no Lane-B live mutation window is open.
- [ ] Confirm both reviewed revisions are available and match the hashes in §0.
- [ ] Confirm the apply mechanism from §2 is in force and the helper is present at the exact
      revision/hash recorded in the Owner package. The Owner release authorization must already
      exist before either authority guard is set.

If any item fails: **STOP.** Do not open the window.

---

## 4. Window 1 — EXPAND (apply 0009 from `A_EXPAND_REV`)

Use exactly `dfcb4be`. Apply `drizzle/migrations/0009_work_scope_identity.sql` through
`LANE_A_EXACT_FILE_POSTGRES_TRANSACTION_APPLY_V1` (§2), invoking the helper on the exact reviewed
revision and hash:

```text
-- dry-run first (BEGIN -> exact file -> assertions -> deliberate ROLLBACK)
node docs/platform/house-long-run/tools/lane-a-exact-file-postgres-apply.mjs \
  --mode dry-run --migration-id 0009 \
  --file drizzle/migrations/0009_work_scope_identity.sql \
  --expect-revision dfcb4be4ac8b488ef740e2147f83b5c19251fbd8 \
  --expect-sha256 8f88a7d1e4d3777dd0c2adefa999f61799bd50dd1270407fa025f3c4068d3487 \
  --expect-target-ref plvpbribiomqppfokzir \
  --control-repo D:/AI-Workspace/runtime/worktrees/hub-web-cts001 \
  --evidence-out <path>/lane-a-0009-dryrun.json

-- only after the dry run reports DRY_RUN_PASS, and only under the Owner release authorization
node docs/platform/house-long-run/tools/lane-a-exact-file-postgres-apply.mjs \
  --mode apply --migration-id 0009 \
  --file drizzle/migrations/0009_work_scope_identity.sql \
  --expect-revision dfcb4be4ac8b488ef740e2147f83b5c19251fbd8 \
  --expect-sha256 8f88a7d1e4d3777dd0c2adefa999f61799bd50dd1270407fa025f3c4068d3487 \
  --expect-target-ref plvpbribiomqppfokzir \
  --control-repo D:/AI-Workspace/runtime/worktrees/hub-web-cts001 \
  --release-id <release id> \
  --evidence-out <path>/lane-a-0009-apply.json
```

The apply form requires `LANE_A_LIVE_DB_AUTHORIZED=YES` **and**
`LANE_A_PRODUCTION_APPLY_AUTHORIZED=YES`, and the connection string is read only from
`LANE_A_CONTROL_DATABASE_URL`. Set neither guard before the Owner release authorization exists.

Nothing else is new at this revision — in particular **no `0010` file exists at `dfcb4be`**, and that
must be verified before applying, because if 0010 were present the contract step could be applied in
the same run and the deployment boundary would disappear. The helper enforces this structurally: a
`0010` invocation against `dfcb4be` is refused as `FILE_HASH_MISMATCH` (the path does not exist at
that revision).

Verify live after apply:
- [ ] the **17-argument** `ingest_agent_work_event_atomic` still exists and retains its expected
      backend accessibility (this is the property that keeps the old client working);
- [ ] the **19-argument** function exists;
- [ ] the 19-argument privilege shape is correct: `service_role` can execute; PUBLIC / anon /
      authenticated cannot;
- [ ] `work_queue_items.scope_type` / `scope_key` exist with the intended types and bounds;
- [ ] the scope consistency constraint is validated;
- [ ] the bounded product backfill produced the expected row count and left every other row's
      `scope_type` NULL;
- [ ] **the currently deployed old Worker still ingests successfully** through the 17-argument path.

If this fails: **STOP. Do not deploy the new Worker.** With 0009 applied and the old client live,
the system is in a compatible state — the additive objects are backwards-compatible, so no urgent
action is required beyond not proceeding.

---

## 5. Window 2 — DEPLOY

Deploy hub-web from `A_CONTRACT_REV` (`dd9a629`) — the application source is identical to the
R2-approved source `fde38f6` (§0 proves this), plus the migration/test/doc changes which are not
part of the bundle.

Verify:
- [ ] the exact Worker version/revision is serving;
- [ ] a product-scoped event succeeds through the 19-argument path;
- [ ] House/Platform explicit non-product scope succeeds with **no fake Product code**;
- [ ] identity conflict / missing identity cases fail closed;
- [ ] live UI truth modes are correct (LIVE / EMPTY / DEGRADED / BLOCKED as applicable);
- [ ] the decision poll/ack routes are live.

Before CONTRACT:
- [ ] confirm the old Worker revision is **no longer serving**;
- [ ] allow old in-flight requests to drain using a **measured** drain condition (a recorded
      observation of zero in-flight requests over a stated interval) — never a guessed assertion.

If deploy or live proof fails: **roll back / re-point the Worker while the 17-argument function
still exists.** Do not run `0010`.

---

## 6. Window 3 — CONTRACT (apply 0010 from `A_CONTRACT_REV`)

Use exactly `dd9a629`. Apply `drizzle/migrations/0010_retire_legacy_work_event_rpc.sql` through
`LANE_A_EXACT_FILE_POSTGRES_TRANSACTION_APPLY_V1` (§2):

```text
-- dry-run first, from A_CONTRACT_REV
node docs/platform/house-long-run/tools/lane-a-exact-file-postgres-apply.mjs \
  --mode dry-run --migration-id 0010 \
  --file drizzle/migrations/0010_retire_legacy_work_event_rpc.sql \
  --expect-revision dd9a629eaa4e75c29fe0b8aa31698b5f9c4e1dae \
  --expect-sha256 3963c6a6e6423f006889d87c735e86ef30831680964c19b096f23f2b091a7b30 \
  --expect-target-ref plvpbribiomqppfokzir \
  --control-repo D:/AI-Workspace/runtime/worktrees/hub-web-cts001 \
  --evidence-out <path>/lane-a-0010-dryrun.json

-- apply: --require-evidence is MANDATORY for 0010 and must point at the release record of the
-- successful 0009 apply for this same target ref (Window 1's lane-a-0009-apply.json).
node docs/platform/house-long-run/tools/lane-a-exact-file-postgres-apply.mjs \
  --mode apply --migration-id 0010 \
  --file drizzle/migrations/0010_retire_legacy_work_event_rpc.sql \
  --expect-revision dd9a629eaa4e75c29fe0b8aa31698b5f9c4e1dae \
  --expect-sha256 3963c6a6e6423f006889d87c735e86ef30831680964c19b096f23f2b091a7b30 \
  --expect-target-ref plvpbribiomqppfokzir \
  --control-repo D:/AI-Workspace/runtime/worktrees/hub-web-cts001 \
  --require-evidence <path>/lane-a-0009-apply.json \
  --release-id <release id> \
  --evidence-out <path>/lane-a-0010-apply.json
```

Without a release-evidence record of a successful `0009` apply for this same target ref, the helper
refuses with `SEQUENCING_EVIDENCE_MISSING` **before** reading any credential or attempting any
connection. Because 0009 was already applied in Window 1, `0010` is the only new file — asserted by
that release evidence plus the live catalog preconditions read inside the transaction (§2.4), not by
a runner.

`0010` fails closed on its own: if the 19-argument path is absent, or `service_role` cannot execute
it, or PUBLIC still can, or the legacy overload is not present exactly once, it raises and applies
nothing.

Verify:
- [ ] the **17-argument** function is gone;
- [ ] the **19-argument** function still works;
- [ ] product and non-product ingestion both pass;
- [ ] no legacy bypass path remains.

If `0010` fails closed: **STOP.** The state is unchanged (nothing was retired), the deployed new
Worker is serving through the 19-argument path, and the legacy overload simply remains. Diagnose
from the raised tag before retrying.

---

## 7. Window 4 — Control Sync skill install

Only after the decision routes are live and the DB/client contract is stable.

- [ ] install the exact reviewed Control Sync revision `fb84b9d` or an independently proven
      install-equivalent tree;
- [ ] verify installed file hashes against source;
- [ ] verify the `activity.detail` bound is active — the previously measured endpoint limit is
      2000 characters (2000 accepted, 2001 rejected);
- [ ] verify decision poll / consume support is present;
- [ ] preserve the pre-install rollback copy and hashes.

---

## 8. Window 5 — full live proof

Run the nine live proofs defined in `OWNER-HOLD-PRODUCTION-MUTATION-2026-09-22.md` §6:

1. product task sync works;
2. identity conflicts fail closed;
3. House/Platform non-product sync works with no fake Product code;
4. one hold creates exactly one Inbox item;
5. a decision consumes once and a repeat poll does not re-advance;
6. live UI truth modes are truthful;
7. no production demo state;
8. outbox has no unexplained pending or dead-letter;
9. public health / security baseline intact.

Only then proceed to R3 and T7 per the locked manifest.

---

## 9. Rollback / recovery contract

### Before CONTRACT (0009 applied, 0010 not)
If the new Worker fails: re-point the Worker to the previous version. The 17-argument function still
exists, so old ingestion remains compatible. The additive 19-argument function and the scope columns
may remain temporarily pending reviewed cleanup. Do not destructively reverse data by default.

### After CONTRACT (0010 applied)
**Never** roll the Worker back to a 17-argument client while the 17-argument RPC is absent — every
ingestion call returns `42883 undefined_function`.

If an old-client rollback becomes necessary:
1. restore the exact reviewed 17-argument function and its privileges first (re-apply `0006`);
2. verify it live;
3. **only then** re-point the Worker to the old version.

Prefer forward-fix whenever the 19-argument path is healthy.

### Control Sync skill
Roll back using the pre-install hashes/files recorded in the T4 parity plan.

---

## 10. Runbook disposition

| Item | Status |
|---|---|
| Two reviewed source revisions | ✅ prepared, pushed, parity 0/0 |
| Application-source equivalence | ✅ measured (empty app diff + byte-identical bundle) |
| Deterministic gates | ✅ check exit 0 · 28 files / 497 tests · diff --check clean · static 10/10 + 11/11 |
| Focused independent review | ⏳ in progress (Codex, exact SHAs) |
| Apply mechanism determined | ✅ resolved by `LANE_A_EXACT_FILE_POSTGRES_TRANSACTION_APPLY_V1` (§2) |
| Operator helper | ⏳ **prepared, NOT executed** — `tools/lane-a-exact-file-postgres-apply.mjs` |
| Offline refusal/falsification gates on the helper | ⏳ pending independent verification (no DB required) |
| Owner release authorization (`LANE_A_PRODUCTION_RELEASE_V1`) | ❌ **not given** |
| Production mutation | ❌ none, and none authorized |

**Nothing in this document is authorized for execution.** The run stops at
`OWNER_HOLD_PRODUCTION_MUTATION_V2` until the Owner release authorization exists. The helper being
prepared is not authority to run it: live access additionally requires both authority guards **and**
that authorization. No `PRODUCTION_READY` and no `OPERATED_STABLE` is claimed anywhere.

### Non-claims for this amendment

- The helper has **not** been executed against any database. No connection was attempted, and no
  credential value was read or written while producing it.
- No migration has been applied. `0009` and `0010` remain **authored only**.
- A successful dry run would still not authorize apply.
- The mechanism-level blocker is cleared; the **operator-contract** level of
  `FINDING-MIGRATION-RUNNER-CONTRADICTS-BRIEF-2026-09-23.md` remains open pending focused review
  and the Owner release authorization.
- The rollback / recovery contract in §9 is unchanged and in force; nothing here weakens it.
