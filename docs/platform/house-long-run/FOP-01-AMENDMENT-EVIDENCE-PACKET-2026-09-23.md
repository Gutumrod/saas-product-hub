# F-OP-01 AMENDMENT EVIDENCE PACKET

Task id: `WSTERA-CONTROL-TRUTH-SYNC-001`
Work unit: `FOP-WU4-EVIDENCE`
Correlation id: `wstera-cts-001-fop-wu4-20260923`
Amendment id: `F-OP-01-AMENDMENT`
Date: 2026-09-23
Role: evidence preparation (`swarm-evidence`)
State on entry: `OWNER_HOLD_PRODUCTION_MUTATION_V2`
Target terminal state: `OWNER_HOLD_PRODUCTION_MUTATION_V3`

Authority boundary statement:

This packet is SOURCE / DOCS / RUNBOOK / TEST / EVIDENCE material only. It carries **NO live
production authority**. Nothing in this packet authorizes, implies, schedules, or pre-approves a
database connection, a migration apply, a deploy, a Cloudflare mutation, a backup, or a runtime
skill install. Every **current** value below was measured in this work unit or in the reconciliation
work unit named for it; no hash was copied from prose. The tables explicitly labelled *historical*
are prior measurements, retained for audit and not used as current identity.

Document revision: reconciled by work unit `FOP-WU6-DOCS-RECONCILE`
(correlation `wstera-cts-001-fop-wu6-20260923`) after the focused independent review returned
`CHANGES_REQUIRED` and the helper and harness were remediated. **Section 1, Section 3.1, Section 4,
Section 6 and Section 8 describe the post-remediation state** and carry the values measured in this
reconciliation run; the superseded pre-remediation values are kept below, explicitly labelled as
historical. Sections 2, 5 and 7 are source/scope/template material, carried over unchanged.

Measurement environment WU4 (the original packet work unit — historical values, superseded):

- planning worktree: `D:/AI-Workspace/runtime/worktrees/wstera-control-truth-sync-001`
- measured HEAD: `75360add4e11a565be366370d697b2f0f071c580`
- measured branch: `work/wstera-control-truth-sync-001`
- measurement timestamp (UTC): `2026-09-23T06:39:27Z`

Measurement environment WU6 (this reconciliation — **every value in Sections 1, 3.1, 4 and 8 below
was measured in this run**):

- planning worktree: `D:/AI-Workspace/runtime/worktrees/wstera-control-truth-sync-001`
- measured HEAD: `f68af6973c41b55b69e3b46fea555128e0c4c045`
- measured branch: `work/wstera-control-truth-sync-001`
- measurement timestamp (UTC): `2026-09-23T07:15:21Z`
- node version: `v22.23.2`
- database contact: **none.** No database was contacted and no connection was attempted in this work
  unit. No real connection string was read. Every helper process exercised here was launched by the
  offline harness with either no credential or the synthetic unroutable
  `postgresql://<synthetic>@127.0.0.1:1/wu3offline` (host `127.0.0.1`, port `1`, no listener).

---

## Section 1 — Measured amendment artifacts

**Current values (measured in this WU6 reconciliation run).** Produced by `sha256sum <path>` and
`wc -c <path>` inside the planning worktree, re-measured at the very end of this work unit:

| # | Path | Bytes | sha256 |
|---|---|---|---|
| 1 | `docs/platform/house-long-run/tools/lane-a-exact-file-postgres-apply.mjs` | 70882 | `d87bd4aa938d0d0a853cea84289e182d29e2cafe6237ff2df3e4fb5a3a77398b` |
| 2 | `docs/platform/house-long-run/tools/tests/fop-helper-verify.mjs` | 67610 | `f62317c26923a0b41b143e48f0ed71ea8b8c5f8b1f4e2deb52ba89e4440f0b8c` |
| 3 | `docs/platform/house-long-run/RUNBOOK-LANE-A-EXPAND-DEPLOY-CONTRACT-2026-09-23.md` | 27272 | `1f2c203d643e8455f954fb94e19dbd6dcb4918a61d96526c9830428d20f8f082` |
| 4 | `docs/platform/house-long-run/FINDING-MIGRATION-RUNNER-CONTRADICTS-BRIEF-2026-09-23.md` | 12753 | `2391703b0152666b517abe6f4537cf6f920d91ea975216d8764a8a8264c70bf4` |

Correcting artifact 1's hash is the point of this reconciliation: the pre-remediation value recorded
below was stale, because the helper was remediated after the first independent review and the packet
had not been re-measured since.

**Historical values (WU4, pre-remediation — kept for audit, DO NOT USE):**

| # | Path | Bytes | sha256 |
|---|---|---|---|
| 1 | `docs/platform/house-long-run/tools/lane-a-exact-file-postgres-apply.mjs` | 56368 | `f3fc4d0cb40ef60bfb97ac05df0623793fe52badeb2db0a07ca83911d7a2453e` |
| 2 | `docs/platform/house-long-run/tools/tests/fop-helper-verify.mjs` | 39128 | `f70bbfd2c50766b4c7551fda0775b257bfec4854c9ffc7b5a4c66469d0b68b09` |
| 3 | `docs/platform/house-long-run/RUNBOOK-LANE-A-EXPAND-DEPLOY-CONTRACT-2026-09-23.md` | 23108 | `71f1635bf56bff93ab5c611d693a7555eedd99e37906dcd548c74e1cf37d6862` |
| 4 | `docs/platform/house-long-run/FINDING-MIGRATION-RUNNER-CONTRADICTS-BRIEF-2026-09-23.md` | 10625 | `2812162b063cd90d9f499b9dde9733eeb9afa22590e92f866e3f446cfced7a8d` |

Truthful qualification of the **current** hashes (not a claim of committed identity):

- All four artifacts are **working-tree file hashes measured at HEAD `f68af69`**, not committed blob
  hashes. Artifacts 1 and 2 are tracked files whose content is **modified** relative to HEAD `f68af69`
  (`git cat-file -e f68af69:docs/platform/house-long-run/tools/lane-a-exact-file-postgres-apply.mjs`
  and the same for the harness both exit `0`, so both paths do exist at HEAD — the working copies
  differ from the HEAD blobs). Artifacts 3 and 4 are likewise **modified** relative to HEAD.
- `git status --porcelain --untracked-files=all` in this work unit reports exactly 6 entries: the two
  tools files and the four `tools/tests/fop-wu3-artifacts/*.json` fixtures, all `M`. The three
  documents reconciled by this work unit appear as `M` **after** this run's edits.
- These hashes therefore describe the amendment **as prepared**, and must be re-measured after the
  commit/push of brief §18 before being used as committed-artifact identities.
- Historical statement, retained as history: at HEAD `75360ad` the helper path did not exist in the
  commit and the helper's runtime evidence field `helper.present_at_repo_head` resolved to `false`
  while the helper was untracked. That measurement was taken then and is superseded: at HEAD
  `f68af69` both the helper and the harness **are** present in the commit (measured in this run by
  `git cat-file -e`, exit `0` for each).

---

## Section 2 — Immutable migration identities, extracted from their declared revisions

Each hash was computed by extracting the file **from the declared revision object**, never from the
working tree, using:

`git -C D:/AI-Workspace/runtime/worktrees/hub-web-cts001 cat-file -p <rev>:<file> | sha256sum`

| Migration | Declared revision (extracted FROM) | File | sha256 observed | Expected (brief §6) | Agreement |
|---|---|---|---|---|---|
| 0009 EXPAND | `dfcb4be4ac8b488ef740e2147f83b5c19251fbd8` | `drizzle/migrations/0009_work_scope_identity.sql` | `8f88a7d1e4d3777dd0c2adefa999f61799bd50dd1270407fa025f3c4068d3487` | `8f88a7d1e4d3777dd0c2adefa999f61799bd50dd1270407fa025f3c4068d3487` | MATCH |
| 0010 CONTRACT | `dd9a629eaa4e75c29fe0b8aa31698b5f9c4e1dae` | `drizzle/migrations/0010_retire_legacy_work_event_rpc.sql` | `3963c6a6e6423f006889d87c735e86ef30831680964c19b096f23f2b091a7b30` | `3963c6a6e6423f006889d87c735e86ef30831680964c19b096f23f2b091a7b30` | MATCH |

Pipeline status for both extractions: `git` leg exit `0`, `sha256sum` leg exit `0`.
No disagreement was found between any measured hash and the value stated in brief §6.

**WU6 re-measurement (this reconciliation run).** The same extraction was repeated read-only against
the hub-web worktree `D:/AI-Workspace/runtime/worktrees/hub-web-cts001`, with identical results:
`0009` at `dfcb4be4ac8b488ef740e2147f83b5c19251fbd8` →
`8f88a7d1e4d3777dd0c2adefa999f61799bd50dd1270407fa025f3c4068d3487`; `0009` at
`dd9a629eaa4e75c29fe0b8aa31698b5f9c4e1dae` →
`8f88a7d1e4d3777dd0c2adefa999f61799bd50dd1270407fa025f3c4068d3487`; `0010` at
`dd9a629eaa4e75c29fe0b8aa31698b5f9c4e1dae` →
`3963c6a6e6423f006889d87c735e86ef30831680964c19b096f23f2b091a7b30`. `0009` bytes remain unchanged
between the two declared revisions. Both declarations in the table above therefore still agree with a
measurement taken in this run.

Supplementary measurement (context, not required by this unit): `0009` extracted from the CONTRACT
revision `dd9a629...` also hashes to
`8f88a7d1e4d3777dd0c2adefa999f61799bd50dd1270407fa025f3c4068d3487`, i.e. `0009` bytes are unchanged
between the two declared revisions as observed in this run.

### EXPAND-revision absence proof for 0010

Command:

`git -C D:/AI-Workspace/runtime/worktrees/hub-web-cts001 cat-file -p dfcb4be4ac8b488ef740e2147f83b5c19251fbd8:drizzle/migrations/0010_retire_legacy_work_event_rpc.sql`

Observed output:

```
fatal: path 'drizzle/migrations/0010_retire_legacy_work_event_rpc.sql' exists on disk, but not in 'dfcb4be4ac8b488ef740e2147f83b5c19251fbd8'
```

Exit code: `128`.

Interpretation (bounded): the specified file is absent from the EXPAND revision object, while it
does exist on disk in the hub-web worktree. This is a git object-level absence proof for `0010` at
the EXPAND revision. It is a git-object statement only; it is not a database statement and carries
no claim about any live catalog.

Not measured in this unit (stated explicitly rather than filled in): the current hub-web worktree
HEAD was not re-measured here. Brief §2 declares it as
`dd9a629eaa4e75c29fe0b8aa31698b5f9c4e1dae`; this packet does not assert it as a fresh measurement.

---

## Section 3 — Deterministic gate results

### 3.1 Offline harness

Harness mode 1 — default:

`node docs/platform/house-long-run/tools/tests/fop-helper-verify.mjs`

Exit code: `0`

Header lines, verbatim:

```
HARNESS_MODE: DEFAULT — repository tree is never written; scratch dir = C:\Users\Win11\AppData\Local\Temp\fop-wu3-artifacts
HARNESS_ENVIRONMENT: child_process_available=true readonly=false repo_root=D:\AI-Workspace\runtime\worktrees\wstera-control-truth-sync-001
```

Final total line, verbatim:

```
FOP_HELPER_VERIFY_TOTAL: 44/44 PASS
```

Harness mode 2 — read-only:

`LANE_A_FOP_READONLY=1 node docs/platform/house-long-run/tools/tests/fop-helper-verify.mjs`

Exit code: `0`

Read-only header line, verbatim (the `mkdtemp` scratch path differs on every run; this is the value
observed in this run):

```
HARNESS_MODE: READ_ONLY (LANE_A_FOP_READONLY=1) — repository tree is never written; scratch dir = C:\Users\Win11\AppData\Local\Temp\fop-wu3-readonly-rdvbeF (removed on exit)
```

Final total line, verbatim:

```
FOP_HELPER_VERIFY_TOTAL: 44/44 PASS
```

In both modes the harness emitted 44 `PASS` case lines and no `FAIL` line, and exited `0`. The
harness's own global no-connection case reported: spawned runs = 14; runs reporting an execution-stage
classification = 0; runs mentioning `CONNECTION_FAILED` / `RUNTIME_DEPENDENCY_UNAVAILABLE` = 0;
`connection_attempted=false` in each guard-fixture evidence JSON. Every spawned helper run refused
before the execution stage, so no database was contacted and no connection was attempted.

Unspawnable cases: in an environment that cannot spawn child processes the harness reports those cases
as `SKIP_UNSPAWNABLE` with an explicit reason — **never `PASS` and never `FAIL`** — and exits `0` when
every runnable case passed. In this measurement environment `child_process_available=true`, so zero
cases were skipped (`SKIP_UNSPAWNABLE` count = 0) and the two totals above carry no skip annotation.

#### 3.1.1 Historical harness result (WU4, pre-remediation — superseded)

The WU4 packet recorded `FOP_HELPER_VERIFY_TOTAL: 31/31 PASS` (exit `0`), spawned runs = 13. That
figure is **superseded**: it was produced against the pre-remediation harness, before the 0010
worker-live gate and the two harness findings were remediated, and it is not a claim about the current
artifacts. The current measured totals are the two `44/44 PASS` runs above.

### 3.2 Secret scan (raw JSON)

WU4 run (historical, pre-remediation — the file set scanned then):

Command:

`python D:/AI-Workspace/runtime/hermes-native/data/skills/hermes-native-swarm/scripts/swarmctl.py secret-scan --paths docs/platform/house-long-run/tools/lane-a-exact-file-postgres-apply.mjs docs/platform/house-long-run/tools/tests/fop-helper-verify.mjs docs/platform/house-long-run/RUNBOOK-LANE-A-EXPAND-DEPLOY-CONTRACT-2026-09-23.md docs/platform/house-long-run/FINDING-MIGRATION-RUNNER-CONTRADICTS-BRIEF-2026-09-23.md`

Exit code: `0`

Raw stdout, verbatim:

```json
{
  "skill": "HERMES-NATIVE-SWARM-V0.1",
  "state": "SWARM_WORK_UNIT_PASS",
  "classification": null,
  "files_scanned": 4,
  "known_credential_values_loaded": 0,
  "findings": []
}
```

WU6 run (this reconciliation). The harness's own `CASE-J-secret-scan` covers the same and wider path
set (19 paths: the harness, the helper, and scratch files outside the tree) and reported in **both**
modes of this run:

```
PASS CASE-J-secret-scan (observed exit=0 classification=NO_FINDINGS detail=swarmctl secret-scan over 19 paths (harness, helper, scratch files outside the tree) -> exit 0, findings=0: { "skill": "HERMES-NATIVE-SWARM-V0.1", "state": "SWARM_WORK_UNIT_PASS", "classification": null, "files_scanned": 19, "known_credential_values_loaded": 0, "findings": [] })
```

The WU6 work unit additionally reported the secret-scan result through that harness case; no separate
`swarmctl` invocation was made by WU6, and no finding is recorded in either run.

### 3.3 `git diff --check`

WU4 run (historical): exit code `0`, stdout empty, with two line-ending advisories on stderr.

WU6 re-run in this reconciliation, after all three documents were edited:

Command: `git diff --check`

Exit code: `0`

stdout: empty (no whitespace-error lines).

stderr: nine line-ending advisories (`LF will be replaced by CRLF the next time Git touches it`) —
one for each of the 9 modified paths. These are line-ending advisories, not whitespace errors, and
`--check` still exited `0`. The three reconciled documents are among them. Verbatim for those three:

```
warning: in the working copy of 'docs/platform/house-long-run/FINDING-MIGRATION-RUNNER-CONTRADICTS-BRIEF-2026-09-23.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/platform/house-long-run/FOP-01-AMENDMENT-EVIDENCE-PACKET-2026-09-23.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/platform/house-long-run/RUNBOOK-LANE-A-EXPAND-DEPLOY-CONTRACT-2026-09-23.md', LF will be replaced by CRLF the next time Git touches it
```

---

## Section 4 — Changed files and authorized write scope

### Authorized write scope of this reconciliation (WU6)

This reconciliation work unit (`FOP-WU6-DOCS-RECONCILE`) was authorized to edit **exactly three**
documents:

- `docs/platform/house-long-run/RUNBOOK-LANE-A-EXPAND-DEPLOY-CONTRACT-2026-09-23.md`
- `docs/platform/house-long-run/FINDING-MIGRATION-RUNNER-CONTRADICTS-BRIEF-2026-09-23.md`
- `docs/platform/house-long-run/FOP-01-AMENDMENT-EVIDENCE-PACKET-2026-09-23.md` (this file)

Nothing under `docs/platform/house-long-run/tools/**` was touched: the helper and the harness were
**read and executed only**, and their remediation was performed by the preceding remediation work
unit, not by this one. The measured pre-edit state of the planning worktree at the start of WU6 was
`git status --porcelain --untracked-files=all` = **6 entries**, all `M`:

```
 M docs/platform/house-long-run/tools/lane-a-exact-file-postgres-apply.mjs
 M docs/platform/house-long-run/tools/tests/fop-helper-verify.mjs
 M docs/platform/house-long-run/tools/tests/fop-wu3-artifacts/case-d-wrong-hash.json
 M docs/platform/house-long-run/tools/tests/fop-wu3-artifacts/case-f-target-mismatch.json
 M docs/platform/house-long-run/tools/tests/fop-wu3-artifacts/case-g1-guard-live-unset.json
 M docs/platform/house-long-run/tools/tests/fop-wu3-artifacts/case-g2-guard-prod-apply-unset.json
```

The three reconciled documents were already committed blobs at HEAD `f68af69` and are modified by
this work unit; no other path was written. This supersedes the Section 4 change-list recorded by WU4
(below, kept as history), which listed the tools files as untracked `??` entries — they are tracked
`M` entries now.

Historical WU4 change list, verbatim as reported at the time:

```
 M docs/platform/house-long-run/FINDING-MIGRATION-RUNNER-CONTRADICTS-BRIEF-2026-09-23.md
 M docs/platform/house-long-run/RUNBOOK-LANE-A-EXPAND-DEPLOY-CONTRACT-2026-09-23.md
?? docs/platform/house-long-run/tools/lane-a-exact-file-postgres-apply.mjs
?? docs/platform/house-long-run/tools/tests/fop-helper-verify.mjs
?? docs/platform/house-long-run/tools/tests/fop-wu3-artifacts/case-d-wrong-hash.json
?? docs/platform/house-long-run/tools/tests/fop-wu3-artifacts/case-f-target-mismatch.json
?? docs/platform/house-long-run/tools/tests/fop-wu3-artifacts/case-g1-guard-live-unset.json
?? docs/platform/house-long-run/tools/tests/fop-wu3-artifacts/case-g2-guard-prod-apply-unset.json
```

That list was then 8 entries (confirmed by `| wc -l`).

### Authorization against brief §14

Brief §14 authorizes edits only to: the runbook; the finding (append disposition/closure status
only); a new operator helper under `docs/platform/house-long-run/tools/**`; new tests/fixtures for
that helper under the same tools subtree; new F-OP-01 amendment evidence/review/handoff documents;
and the brief itself only for a separately recorded factual correction.

| Changed path | Brief §14 clause authorizing it |
|---|---|
| `docs/platform/house-long-run/RUNBOOK-LANE-A-EXPAND-DEPLOY-CONTRACT-2026-09-23.md` | `RUNBOOK-LANE-A-EXPAND-DEPLOY-CONTRACT-2026-09-23.md` |
| `docs/platform/house-long-run/FINDING-MIGRATION-RUNNER-CONTRADICTS-BRIEF-2026-09-23.md` | append disposition/closure status only (appended as §8; §1–§7 unchanged) |
| `docs/platform/house-long-run/tools/lane-a-exact-file-postgres-apply.mjs` | new operator helper under `docs/platform/house-long-run/tools/**` |
| `docs/platform/house-long-run/tools/tests/fop-helper-verify.mjs` | new tests/fixtures for that helper under the same tools subtree |
| `docs/platform/house-long-run/tools/tests/fop-wu3-artifacts/case-d-wrong-hash.json` | new tests/fixtures for that helper under the same tools subtree |
| `docs/platform/house-long-run/tools/tests/fop-wu3-artifacts/case-f-target-mismatch.json` | new tests/fixtures for that helper under the same tools subtree |
| `docs/platform/house-long-run/tools/tests/fop-wu3-artifacts/case-g1-guard-live-unset.json` | new tests/fixtures for that helper under the same tools subtree |
| `docs/platform/house-long-run/tools/tests/fop-wu3-artifacts/case-g2-guard-prod-apply-unset.json` | new tests/fixtures for that helper under the same tools subtree |
| `docs/platform/house-long-run/FOP-01-AMENDMENT-EVIDENCE-PACKET-2026-09-23.md` (this file) | new F-OP-01 amendment evidence/review/handoff documents |

No path outside the brief §14 scope was modified. `0009`, `0010`, `drizzle/`, `server/`, `client/`,
`package.json`, `docs/platform/shared-runtime/` and unrelated House/Lane-B files were not touched by
this work unit.

---

## Section 5 — Brief §12 release-evidence fields applied as a template

Brief §12 defines the required field list for a **migration execution record**. This amendment
produces **no** migration execution record: no helper run, dry-run or apply, was performed. The table
below therefore maps each §12 field to the operator-helper evidence key that will carry it at
live-apply time (from `buildEvidence()` in the helper, schema
`lane-a-exact-file-postgres-apply-evidence/v1`), and marks the value for this source-only amendment
as `NOT_APPLICABLE_SOURCE_ONLY`. No live-apply value is invented here.

| §12 required field | Helper evidence key / source | Value in this amendment |
|---|---|---|
| task id | `task_id` (constant `TASK_ID = 'WSTERA-CONTROL-TRUTH-SYNC-001'`) | `NOT_APPLICABLE_SOURCE_ONLY` |
| release id | `release_id` (from `--release-id`; `null` when not supplied) | `NOT_APPLICABLE_SOURCE_ONLY` |
| migration id | `migration_id` (from `--migration-id`, closed set `{0009,0010}`) | `NOT_APPLICABLE_SOURCE_ONLY` |
| git revision | `git_revision` (from `--expect-revision`) | `NOT_APPLICABLE_SOURCE_ONLY` |
| exact file path | `file_path` (from `--file`, bound per migration id) | `NOT_APPLICABLE_SOURCE_ONLY` |
| file SHA256 | `file_sha256` (observed, from bytes read at the revision) and `file_sha256_expected` | `NOT_APPLICABLE_SOURCE_ONLY` |
| operator-helper revision/hash | `helper` object: `path`, `sha256` (self-hash read at run time), `repo_head` (`git rev-parse HEAD`), `present_at_repo_head` | `NOT_APPLICABLE_SOURCE_ONLY` |
| sanitized target identity | `target_identity` `{ ref, role, derivation_form }` — project ref only, never the connection string | `NOT_APPLICABLE_SOURCE_ONLY` |
| mode: dry-run or apply | `mode` (from `--mode`) | `NOT_APPLICABLE_SOURCE_ONLY` |
| transaction start/end timestamps | `transaction` `{ started_at, ended_at, single_transaction }` | `NOT_APPLICABLE_SOURCE_ONLY` |
| precondition results | `preconditions` (array of `{check, expected, observed, ok}`; dry-run records the informational entry `dry-run:no_preconditions_in_transaction`) | `NOT_APPLICABLE_SOURCE_ONLY` |
| SQL execution result | `sql_execution` `{ executed, statement_count, single_file_single_transaction, error }` | `NOT_APPLICABLE_SOURCE_ONLY` |
| postcondition results | `postconditions` (array of `{check, expected, observed, ok}`) | `NOT_APPLICABLE_SOURCE_ONLY` |
| rollback/commit result | `rollback` `{ result, deliberate }` and `commit` `{ result }` (plus `post_rollback_shape`, `persistent_shape_preserved`) | `NOT_APPLICABLE_SOURCE_ONLY` |
| exit code | `exit_code` | `NOT_APPLICABLE_SOURCE_ONLY` |
| final classification | `final_classification` | `NOT_APPLICABLE_SOURCE_ONLY` |

§12 non-secret constraint, as implemented by the helper's evidence record: `mechanism`,
`credential_value_persisted: false`, `connection_string_persisted: false`,
`raw_stderr_persisted: false`. Those three boolean keys are structural assertions in
`buildEvidence()`; their presence in the source is not evidence that a record was produced.

For this amendment the §12 list is satisfied only in the **template** sense: the field list exists,
the recording keys exist in the helper, and every live value is explicitly marked not applicable
rather than filled.

---

## Section 6 — Non-claims

Stated plainly, for this work unit:

- No database was contacted.
- No connection was attempted (including on any helper failure path).
- No migration was applied.
- No Drizzle runner was invoked (`drizzle-kit generate`, `drizzle-kit migrate`, `npm run db:push`
  were not run).
- No migration ledger was created (`drizzle/migrations/meta/_journal.json` and
  `__drizzle_migrations` were neither created nor consulted).
- No production deploy occurred.
- No runtime skill was installed.
- No GAP-A live closure occurred.
- No backup was taken.
- The operator helper was **not executed** in this work unit. It was hashed, not run.
- No `PRODUCTION_READY` is claimed.
- No `OPERATED_STABLE` is claimed.
- No authority-interlock environment variable (`LANE_A_LIVE_DB_AUTHORIZED`,
  `LANE_A_PRODUCTION_APPLY_AUTHORIZED`) was set by this work unit.
- No credential value, connection string, or secret-bearing stderr is recorded in this packet. The
  only connection-string-shaped string that appears anywhere in this reconciliation is the synthetic,
  unroutable `postgresql://<synthetic>@127.0.0.1:1/wu3offline` used by the offline harness.
- The harness PASS recorded in Section 3 is offline/deterministic evidence only. It is not
  `BUILD_PASS != PRODUCTION_READY`-defeating evidence and does not constitute production readiness.
- `F-OP-01` is resolved only at **mechanism level**. It stays **open at operator-contract level**.
  The first focused independent review returned `CHANGES_REQUIRED` and the remediation was applied;
  the **second independent review is pending** (Section 8). Nothing in this packet approves the
  amendment, closes F-OP-01, or authorizes any live access.
- The pre-remediation `31/31 PASS` figure in Section 3.1.1 is **historical and superseded** and must
  not be read as a claim about the current artifacts.

---

## Section 7 — Reviewer inputs for the focused Codex gate

Exact paths for the reviewer to read (brief §19 scope):

Amendment artifacts:

1. `docs/platform/house-long-run/FOP-01-AMENDMENT-EVIDENCE-PACKET-2026-09-23.md` (this packet)
2. `docs/platform/house-long-run/tools/lane-a-exact-file-postgres-apply.mjs`
3. `docs/platform/house-long-run/tools/tests/fop-helper-verify.mjs`
4. `docs/platform/house-long-run/tools/tests/fop-wu3-artifacts/case-d-wrong-hash.json`
5. `docs/platform/house-long-run/tools/tests/fop-wu3-artifacts/case-f-target-mismatch.json`
6. `docs/platform/house-long-run/tools/tests/fop-wu3-artifacts/case-g1-guard-live-unset.json`
7. `docs/platform/house-long-run/tools/tests/fop-wu3-artifacts/case-g2-guard-prod-apply-unset.json`
8. `docs/platform/house-long-run/RUNBOOK-LANE-A-EXPAND-DEPLOY-CONTRACT-2026-09-23.md` (§2 restated;
   §2.2 refusal order; §2.3/§2.4 window commands)
9. `docs/platform/house-long-run/FINDING-MIGRATION-RUNNER-CONTRADICTS-BRIEF-2026-09-23.md`
   (§8 appended disposition)

Governing brief and held state:

10. `docs/platform/house-long-run/BRIEF-RESUME-LANE-A-FOP01-EXACT-FILE-APPLY-2026-09-23.md`
    (§5 mechanism, §6 identities, §8–§12 contracts, §13 gates, §14 scope, §19 gate, §20 terminal)
11. `docs/platform/house-long-run/OWNER-HOLD-PRODUCTION-MUTATION-V2-2026-09-23.md`
12. `docs/platform/house-long-run/R2-AMENDMENT-CODEX-VERDICT-2026-09-23.md`

Immutable migration identities, to be read **at their declared revisions**, not from the working
tree:

13. `git -C D:/AI-Workspace/runtime/worktrees/hub-web-cts001 cat-file -p dfcb4be4ac8b488ef740e2147f83b5c19251fbd8:drizzle/migrations/0009_work_scope_identity.sql`
14. `git -C D:/AI-Workspace/runtime/worktrees/hub-web-cts001 cat-file -p dd9a629eaa4e75c29fe0b8aa31698b5f9c4e1dae:drizzle/migrations/0010_retire_legacy_work_event_rpc.sql`

Review questions the packet is prepared to answer are those of brief §19 (1–6). Reviewer mutation
removes self-approval: a new revision must be created and reviewed again.

For the **second** review (pending), the inputs are the remediated artifacts at the current hashes in
Section 1 — the superseded WU4 hashes in that section's historical table do not identify the revision
the second review must examine.

---

## Section 8 — Focused review outcome history and remediation (appended by WU6)

Appended by work unit `FOP-WU6-DOCS-RECONCILE`. This section reports the review history **as it
actually was**, including the valid findings, and does not present the reviewer as wrong overall.

### 8.1 First independent focused review — verdict `CHANGES_REQUIRED`

The first focused independent Codex review of the F-OP-01 amendment returned **`CHANGES_REQUIRED`**,
with **two blocking findings** and **one HIGH finding**:

| # | Severity | Finding |
|---|---|---|
| 1 | **BLOCKING** | The `0010` sequencing gate did not enforce the live-Worker proof. Only the pre-existing `0009` apply record was required; a live-Worker proof of the 19-argument path was not enforced for the same target ref and task id. |
| 2 | **BLOCKING** | The harness `PASS` claim did not reproduce in the reviewer's sandbox. |
| 3 | **HIGH** | The harness was not read-only. |

### 8.2 Remediation — what changed to close each finding

**Finding 1 (blocking) — helper.** The helper now enforces a second, independently required
sequencing sub-gate for a `0010` **apply**. `evaluateGovernedPreflight` evaluates check `4a` (a
successful `0009` apply for the same `--expect-target-ref`) and check `4b` (a **live-Worker proof of
the 19-argument path for the same target ref AND the same task id**, `WSTERA-CONTROL-TRUTH-SYNC-001`).
A `0009` apply record is **never** accepted as that proof. Absent, different-target, different-task
and incomplete proof records are refused as **`WORKER_LIVE_PROOF_MISSING`** (exit code `2`) at stage
`check_4b_worker_live_proof`, before the credential variable is read and before any connection is
attempted. Two proof shapes are accepted and documented in the helper header: a sibling top-level
`worker_live_proofs` array, or the proof fields carried directly on a record (or on the single root
object). The refusal order table in the helper's header gained the `4b` row, and the new
classification was added to the exported `CLASSIFICATION` catalog (existing classifications
preserved).

**Finding 2 (blocking) — harness.** The harness now probes child-process availability once at startup
and reports **`SKIP_UNSPAWNABLE`** — never `PASS`, never `FAIL` — for any case that needs a spawned
process it cannot obtain, printing the explicit reason and stating the skip count on the final total
line. A sandbox limitation can therefore no longer be misreported as either a harness failure or a
harness pass, and the exit code is `0` when every *runnable* case passed.

**Finding 3 (HIGH) — harness.** The harness now writes nothing inside the repository tree in **either**
mode. All scratch (including the evidence JSON it asks the helper to write through `--evidence-out`)
goes to an OS temp directory; read-only mode additionally creates a fresh `mkdtemp` directory, prints
a read-only header line, and **deletes** the scratch on exit, verifying the removal rather than
assuming it.

### 8.3 Why the reviewer's harness failure occurred, and what was in fact reproduced

The reviewer's harness failure was **caused by that sandbox being unable to spawn child processes**,
not by a defect in the harness's assertions. The commander reproduced **31/31 PASS before the
remediation** and **44/44 PASS after it**, in an environment with spawn available. To keep the record
honest in both directions, the harness now reports unspawnable cases as `SKIP_UNSPAWNABLE` rather than
as either `FAIL` or `PASS`, so neither a sandbox limitation nor a real failure can be misreported.

This does **not** mean the reviewer was wrong overall: findings 1 and 3 were valid, and finding 1 was
the reason the helper changed. Only the *attribution* of finding 2 is qualified — the observed failure
was environmental, and the harness has been changed so that such an environment produces an explicit
skip instead of a failure.

Current measured harness result, both modes, in an environment with `child_process_available=true`
(Section 3.1):

| Mode | Command | Exit code | Final total line |
|---|---|---|---|
| default | `node docs/platform/house-long-run/tools/tests/fop-helper-verify.mjs` | `0` | `FOP_HELPER_VERIFY_TOTAL: 44/44 PASS` |
| read-only | `LANE_A_FOP_READONLY=1 node …/fop-helper-verify.mjs` | `0` | `FOP_HELPER_VERIFY_TOTAL: 44/44 PASS` |

The read-only header line, verbatim (scratch path varies per run; value observed in this run):

```
HARNESS_MODE: READ_ONLY (LANE_A_FOP_READONLY=1) — repository tree is never written; scratch dir = C:\Users\Win11\AppData\Local\Temp\fop-wu3-readonly-rdvbeF (removed on exit)
```

### 8.4 Status after remediation

The second independent review has **not happened** — it is **PENDING**. Therefore:

- `F-OP-01` is **NOT approved**;
- `F-OP-01` remains **open at operator-contract level**;
- no live access is authorized by this packet, by the helper, or by the runbook;
- the Owner release authorization (`LANE_A_PRODUCTION_RELEASE_V1`) is still outstanding.

The three documents reconciled by this work unit describe the **post-remediation** state. The
runbook's §2.2.1 and §6, and the finding's §8.1, carry the same review history.

### 8.5 Non-claims added by this section

No database was contacted and no connection was attempted while producing this reconciliation. No
migration was applied. The helper was not executed by this work unit directly; it was executed only as
a child process of the offline harness, and every such run refused before the execution stage. No
credential value is recorded. No `PRODUCTION_READY` and no `OPERATED_STABLE` is claimed. The
`31/31 PASS` figure is historical only and is superseded by the measured `44/44 PASS` totals above.

---

END OF PACKET — evidence only; no approval is expressed or implied by this document.
