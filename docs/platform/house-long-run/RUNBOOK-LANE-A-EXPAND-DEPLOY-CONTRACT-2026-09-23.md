# PRODUCTION ROLLOUT RUNBOOK — Lane A EXPAND → DEPLOY → CONTRACT

Task: `WSTERA-CONTROL-TRUTH-SYNC-001` · Workflow `WF-DEV-01 v1.3.0 / LONG_RUN`
Prepared: 2026-09-23 (Asia/Bangkok) · Prepared by: Hermes (Long-Run Orchestrator / State Holder)
State on entry: **`OWNER_HOLD_PRODUCTION_MUTATION_V2`**
Authority: **PREPARATION ONLY — DO NOT EXECUTE.** This document authorizes nothing.

> ⚠️ **Status: NOT EXECUTABLE AS-IS.** Step 2 and step 4 depend on a production apply mechanism
> that does not exist in this repository as the governing brief describes it. See
> `FINDING-MIGRATION-RUNNER-CONTRADICTS-BRIEF-2026-09-23.md` and §2 below. An Owner ruling on the
> apply mechanism is required before this runbook becomes executable.

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

## 2. 🔴 MECHANISM BLOCKER — resolve before opening any window

The governing brief states the production migration runner is `drizzle-kit migrate`. **That runner
does not exist in this repository**: there is no `drizzle/migrations/meta/` directory and no
`_journal.json`, so drizzle-kit has no migration set to enumerate. `package.json` exposes only
`db:push` (`drizzle-kit generate && drizzle-kit migrate`), which a prior Owner decision explicitly
prohibits for this project because the database has no `__drizzle_migrations`, and which would
attempt to reconcile the entire schema across two different databases.

Therefore the brief's operator steps — *"run the normal migration mechanism from that exact
revision"* (Window 1) and *"since 0009 is already recorded, only 0010 should apply"* (Window 3) —
are **not executable as written**, and the "only 0009 then only 0010" property cannot be enforced
by any tool in this repository.

**Required before this runbook is executable — one Owner ruling naming the apply mechanism.**
The shortest safe path, consistent with this folder's own established precedent:

- apply **by exact reviewed file path**, using the folder's existing convention of a rolled-back
  transaction dry run first (`BEGIN; <DDL>; <assertions>; ROLLBACK;`) and then a real apply —
  the precedent recorded at `0008_product_installations.sql:9-10` and cited in
  `T2-WU02-MIGRATION-RPC-QUALIFICATION-2026-09-21.md:841-844`;
- state explicitly that **no migration ledger** is used, and that the apply is recorded in the
  release evidence packet by file path + sha256 + applied-at, instead of by a ledger row;
- restate Window 1 / Window 3 in those terms, so "only 0009 is new" and "only 0010 is new" are
  asserted by the release evidence rather than by a runner that cannot assert it.

**Do not** substitute `npm run db:push`. **Do not** create a migration journal to make drizzle-kit
work: that is a schema-wide operation and is out of scope for this lane.

---

## 3. Window 0 — preflight

- [ ] Take a Control DB backup / recovery point and record its identifier.
- [ ] Record the DB migration baseline and the current function signatures, specifically the
      `pronargs` set of `public.ingest_agent_work_event_atomic` (expect exactly one with 17).
- [ ] Record the currently serving Worker version/revision.
- [ ] Record installed Control Sync hashes (rollback targets, per `T4-WU03…` §2).
- [ ] **Collision check against Lane B**: confirm no Lane-B live mutation window is open.
- [ ] Confirm both reviewed revisions are available and match the hashes in §0.
- [ ] Confirm the apply mechanism from §2 has been named by the Owner.

If any item fails: **STOP.** Do not open the window.

---

## 4. Window 1 — EXPAND (apply 0009 from `A_EXPAND_REV`)

Use exactly `dfcb4be`. Apply `drizzle/migrations/0009_work_scope_identity.sql` through the
mechanism named in §2. Nothing else is new at this revision — in particular **no `0010` file exists
at `dfcb4be`**, and that must be verified before applying, because if 0010 were present the contract
step could be applied in the same run and the deployment boundary would disappear.

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

Use exactly `dd9a629`. Apply `drizzle/migrations/0010_retire_legacy_work_event_rpc.sql` through the
mechanism named in §2. Because 0009 was already applied in Window 1, `0010` is the only new file —
assert that from the release evidence (§2), not from a runner.

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
| Apply mechanism named by Owner | ❌ **missing — blocking (§2)** |
| Production mutation | ❌ none, and none authorized |

**Nothing in this document is authorized for execution.** The run stops at
`OWNER_HOLD_PRODUCTION_MUTATION_V2` until the Owner answers. No `PRODUCTION_READY` and no
`OPERATED_STABLE` is claimed anywhere.
