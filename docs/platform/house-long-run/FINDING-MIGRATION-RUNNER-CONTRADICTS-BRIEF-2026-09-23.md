# FINDING — the brief's stated migration runner contradicts the measured repository state

Task: `WSTERA-CONTROL-TRUTH-SYNC-001` · Lane A resume
Recorded: 2026-09-23 (Asia/Bangkok) · Recorded by: Hermes (Long-Run Orchestrator / State Holder)
Severity: **BLOCKING for the production runbook** — it does not block the source revisions, but it
invalidates the operator steps the brief prescribes for Window 1 and Window 3.
Status: source work continued; this finding is raised rather than silently worked around.

---

## 1. What the brief asserts

`BRIEF-RESUME-LANE-A-CONTROL-TRUTH-EXPAND-CONTRACT-2026-09-22.md` states, in three places, that the
normal repo migration command is `drizzle-kit migrate`:

- `:22` — *"the normal repo migration command is drizzle-kit migrate, which applies migration files as
  migrations rather than pausing inside one file to let a Worker deploy occur"*;
- `:117-118` — *"The production migration runner is: drizzle-kit migrate"*;
- `:194-195` — *"Does the normal migration runner apply only 0009 when run from A_EXPAND_REV? Does it
  apply only 0010 later when run from A_CONTRACT_REV after 0009 is already recorded?"*

The whole two-revision design (§5) is justified by that premise.

## 2. What the repository actually contains — measured

```text
$ find drizzle -type f
drizzle/migrations/0001_rbac_roles.sql
drizzle/migrations/0002_control_plane_schema.sql
drizzle/migrations/0003_work_tracking_truth_pipeline.sql
drizzle/migrations/0004_add_unmapped_to_work_item_status.sql
drizzle/migrations/0005_atomic_work_event_rpc.sql
drizzle/migrations/0006_canonical_product_id_work_truth.sql
drizzle/migrations/0007_shared_one_time_fulfillment.sql
drizzle/migrations/0008_product_installations.sql
drizzle/migrations/0009_work_scope_identity.sql
drizzle/schema.ts

$ ls drizzle        # no meta/ directory, no _journal.json
migrations  schema.ts
```

There is **no `drizzle/migrations/meta/` directory and no `_journal.json`**. `drizzle-kit migrate`
resolves migrations through the journal (`meta/_journal.json`, 4 references in
`node_modules/drizzle-kit/bin.cjs`); with no journal there is nothing for it to enumerate. The
repository has never carried one — `git log --all -- drizzle/migrations/meta/*` returns nothing.

`package.json` exposes exactly one migration path, and it is the one the Owner has prohibited:

```json
"db:push": "drizzle-kit generate && drizzle-kit migrate"
```

## 3. Independent corroboration already on disk

Three separate prior artefacts in the same task already record the same fact — this finding is not new
information, it is an unresolved contradiction between those artefacts and this brief:

| Artefact | What it records |
|---|---|
| `R15-D0-DECISION-REPORT-CODEX-2026-09-20.md:44` | *"ห้ามใช้ `drizzle-kit migrate` หรือ `db:push` บน Project A จนกว่าจะมี migration-history strategy ที่ปลอดภัย เพราะ database ไม่มี `__drizzle_migrations`"* |
| `R15-D0-DECISION-OUTCOME-2026-09-20.md:69` | Explicitly NOT authorized: `drizzle-kit generate` / `drizzle-kit migrate` / `npm run db:push` |
| `T2-WU02-MIGRATION-RPC-QUALIFICATION-2026-09-21.md:963` (F10) | *"no `__drizzle_migrations` journal ... `db:push` is `drizzle-kit generate && drizzle-kit migrate`, which without a journal would attempt to reconcile the entire schema"* |
| `0009_work_scope_identity.sql:11-13` (its own header) | *"There is no `__drizzle_migrations` journal under drizzle/, so `npm run db:push` ... would attempt to reconcile the ENTIRE schema across both projects. Do NOT run db:push for this file."* |

So the brief's premise is contradicted by (a) the repository contents, (b) a prior Owner decision that
explicitly forbids that runner, and (c) the migration file's own header.

## 4. Why this matters for revenue and for safety

The two-revision design was adopted **because** the runner was believed to be non-pausable. The
retained-overload shape of Revision A remains correct and useful under either runner — it is strictly
safer — but the **operator steps** in Brief §10 Window 1 / Window 3 (`"Run the normal migration
mechanism from that exact revision"`, `"Since 0009 is already recorded, only 0010 should apply"`) are
**not executable as written**, because:

- there is no runner to "run the normal migration mechanism" with;
- there is no migration ledger in which 0009 could be "already recorded", so "only 0010 should apply"
  is not a property any tool can enforce.

An operator following §10 literally would either (i) run `npm run db:push`, which the Owner has
explicitly prohibited and which would attempt to reconcile the entire schema across two different
databases, or (ii) discover mid-window that the prescribed command does not apply anything, in a
production deployment window.

## 5. Shortest safe remediation path (proposal — NOT authorized, needs Owner ruling)

The source revisions do not depend on resolving this. What must be resolved **before** the production
window is opened:

1. **Owner/operator names the actual apply mechanism.** Evidence on disk shows every prior Control-DB
   migration was applied by an explicit, reviewed statement sequence — the folder's own established
   precedent is `BEGIN; <DDL>; <assertions>; ROLLBACK;` dry-run first, then a real apply
   (`0008_product_installations.sql:9-10`, cited in `T2-WU02…:841-844`). The shortest path is to state
   that the same reviewed-apply mechanism is used for 0009 and 0010, with the file path as the input,
   rather than invoking a drizzle runner that has no journal.
2. **Name the migration-ledger question explicitly.** Either the window accepts "no ledger — apply by
   exact file, recorded in the release evidence packet", or a ledger strategy is designed first. Codex
   already flagged the latter as a precondition in `R15-D0-DECISION-REPORT-2026-09-20.md:44`.
3. **Restate Brief §10 Window 1 / Window 3** in terms of the named mechanism, so the operator steps are
   executable and the "only 0009 then only 0010" property is asserted by the release evidence rather
   than by a tool that cannot assert it.

This finding does **not** weaken any rollout invariant: Revision A still retains the legacy overload and
Revision B still fails closed before retiring it, so both clients remain serviceable across the boundary
under any apply mechanism.

## 6. Non-claims

No database was contacted to produce this finding. No `drizzle-kit` command was executed. No
production mutation occurred. This finding is raised by the state holder; it does **not** authorise any
change to the runbook, and it does not authorise production mutation of any kind.

## 7. Evidence

- `BRIEF-RESUME-LANE-A-CONTROL-TRUTH-EXPAND-CONTRACT-2026-09-22.md:22,117-118,194-195`
- `drizzle/` contents and absence of `meta/_journal.json` — measured in worktree
  `D:/AI-Workspace/runtime/worktrees/hub-web-cts001` at revision `dfcb4be`
- `package.json` `scripts.db:push`
- `R15-D0-DECISION-REPORT-CODEX-2026-09-20.md:44`, `R15-D0-DECISION-OUTCOME-2026-09-20.md:69`
- `T2-WU02-MIGRATION-RPC-QUALIFICATION-2026-09-21.md:963` (F10), `:841-844`
- `drizzle/migrations/0009_work_scope_identity.sql:11-13`, `:15-21`

---

## 8. DISPOSITION — appended 2026-09-23 (mechanism resolved at design level; operator-contract level open)

This section is **appended**; nothing in §1–§7 above is rewritten, and the finding is not marked
closed. It records the disposition of the blocker as of the F-OP-01 amendment.

**Mechanism resolved.** The mechanism-design portion of this finding is resolved by the named
contract `LANE_A_EXACT_FILE_POSTGRES_TRANSACTION_APPLY_V1`, recorded in
`BRIEF-RESUME-LANE-A-FOP01-EXACT-FILE-APPLY-2026-09-23.md` §5. §5.1's gap — *no operator step named
an actual apply mechanism* — is closed: the mechanism is now an exact reviewed file applied through
the `postgres` client inside one transaction, exactly the precedent this finding's §5.1 identified on
disk (`0008_product_installations.sql:9-10`).

**Implemented.** The mechanism is implemented by the operator helper
`docs/platform/house-long-run/tools/lane-a-exact-file-postgres-apply.mjs`, which:

- reads the file bytes **from the pinned git revision** and verifies them against an expected
  sha256, so "the exact reviewed bytes" is enforced rather than assumed;
- **never** invokes `drizzle-kit generate`, `drizzle-kit migrate` or `npm run db:push` (the only
  external program it can spawn is `git`);
- creates **no** migration journal and **no** ledger — `drizzle/migrations/meta/_journal.json` and
  `__drizzle_migrations` are neither created nor consulted;
- proves sequencing from **live catalog preconditions read inside the apply transaction, plus
  immutable release evidence** for the exact file/revision/hash, which is precisely what §5.2
  asked to be named explicitly: the lane accepts "no ledger — apply by exact file, recorded in the
  release evidence packet";
- refuses, in a fixed order that runs entirely **before** any credential is read or any connection
  is attempted, on an unknown migration id/path pair, a hash mismatch, a missing revision, missing
  sequencing evidence, and a missing authority guard;
- runs `BEGIN -> exact file -> assertions -> deliberate ROLLBACK` in dry-run and
  `BEGIN -> preconditions -> exact file -> postconditions -> COMMIT` in apply, one file per
  transaction, never split.

**Runbook restated.** §2 of `RUNBOOK-LANE-A-EXPAND-DEPLOY-CONTRACT-2026-09-23.md` is rewritten from
"mechanism blocker" to the resolved mechanism, and §5.3's request — *restate Window 1 / Window 3 in
terms of the named mechanism* — is done: both windows now invoke the helper on the exact reviewed
revision and hash.

**Still open — operator-contract level only.** This finding is **not closed**. It stays open at the
operator-contract level until:

1. the focused independent Codex review of the amendment (§19 of the F-OP-01 brief) returns
   `APPROVED` or `APPROVED_WITH_FINDINGS` with no open blocking finding; and
2. the Owner release authorization (`LANE_A_PRODUCTION_RELEASE_V1`) is given.

**Non-claims added by this disposition.** No database was contacted to produce the helper, the
runbook amendment or this section. No connection was attempted — including for the helper's failure
paths, which are proven without any connection. No `drizzle-kit` or `db:push` command was executed.
No production mutation occurred, and the helper has **not** been run. The helper is prepared and NOT
executed. No `PRODUCTION_READY` and no `OPERATED_STABLE` is claimed.

### 8.1 Review history — appended by work unit `FOP-WU6-DOCS-RECONCILE` (correlation `wstera-cts-001-fop-wu6-20260923`)

Appended only; §1–§7 and the rest of §8 above are unchanged.

1. **Mechanism-design resolved.** The mechanism-level portion of this finding is resolved as recorded
   above (`LANE_A_EXACT_FILE_POSTGRES_TRANSACTION_APPLY_V1`, implemented by
   `docs/platform/house-long-run/tools/lane-a-exact-file-postgres-apply.mjs`).
2. **First independent review returned `CHANGES_REQUIRED`.** The focused independent Codex review of
   the amendment returned `CHANGES_REQUIRED` with **two blocking findings** and **one HIGH finding**:
   - *blocking* — the 0010 sequencing gate did not enforce the live-Worker proof of the 19-argument
     path (only the pre-existing 0009 apply record was enforced);
   - *blocking* — the harness `PASS` claim did not reproduce in the reviewer's sandbox;
   - *HIGH* — the harness was not read-only.
3. **Remediation applied.** The helper and the harness were changed to close all three findings: the
   0010 apply now refuses with `WORKER_LIVE_PROOF_MISSING` unless the same release evidence records a
   live-Worker proof of the 19-argument path for the same target ref and task id (the 0009 apply
   record is never accepted as that proof); the harness now writes nothing inside the repository tree
   in either mode and deletes its scratch on exit in read-only mode; and cases that need a spawned
   child report `SKIP_UNSPAWNABLE` — never `FAIL` and never `PASS` — when the environment cannot
   spawn one, so a sandbox limitation can no longer be reported as a pass or as a failure.
4. **Second independent review is PENDING.**
5. **This finding is therefore NOT approved and NOT closed.** `F-OP-01` remains **open at
   operator-contract level**, and no live access is authorized by this document. The conditions in
   §8 item 1–2 above still stand: a completed focused review of the remediated artifacts returning
   `APPROVED`/`APPROVED_WITH_FINDINGS` with no open blocking finding, and the Owner release
   authorization (`LANE_A_PRODUCTION_RELEASE_V1`).
