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
skill install. Every value below was measured in this work unit; no hash was copied from prose.

Measurement environment (as measured in this run):

- planning worktree: `D:/AI-Workspace/runtime/worktrees/wstera-control-truth-sync-001`
- measured HEAD: `75360add4e11a565be366370d697b2f0f071c580`
- measured branch: `work/wstera-control-truth-sync-001`
- measurement timestamp (UTC): `2026-09-23T06:39:27Z`

---

## Section 1 — Measured amendment artifacts

All values below were produced by `sha256sum <path>` and `stat -c '%s' <path>` run inside the
planning worktree during this work unit. Byte sizes were cross-validated with `wc -c`; both
measurements agreed exactly for all four files.

| # | Path | Bytes | sha256 |
|---|---|---|---|
| 1 | `docs/platform/house-long-run/tools/lane-a-exact-file-postgres-apply.mjs` | 56368 | `f3fc4d0cb40ef60bfb97ac05df0623793fe52badeb2db0a07ca83911d7a2453e` |
| 2 | `docs/platform/house-long-run/tools/tests/fop-helper-verify.mjs` | 39128 | `f70bbfd2c50766b4c7551fda0775b257bfec4854c9ffc7b5a4c66469d0b68b09` |
| 3 | `docs/platform/house-long-run/RUNBOOK-LANE-A-EXPAND-DEPLOY-CONTRACT-2026-09-23.md` | 23108 | `71f1635bf56bff93ab5c611d693a7555eedd99e37906dcd548c74e1cf37d6862` |
| 4 | `docs/platform/house-long-run/FINDING-MIGRATION-RUNNER-CONTRADICTS-BRIEF-2026-09-23.md` | 10625 | `2812162b063cd90d9f499b9dde9733eeb9afa22590e92f866e3f446cfced7a8d` |

Truthful qualification of these hashes (not a claim of committed identity):

- Artifacts 1 and 2 are, at the measured HEAD `75360ad`, **untracked** files (see Section 4). Their
  hashes are working-tree file hashes. They are not yet committed blob hashes.
- Artifacts 3 and 4 are **modified** relative to HEAD `75360ad` (see Section 4). Their hashes are
  working-tree file hashes of the amended content, not the HEAD blob hashes.
- Therefore the four hashes above describe the amendment **as prepared**, and must be re-measured
  after the commit/push of brief §18 before being used as committed-artifact identities.
- Observation recorded by the helper's own self-identity code path: at HEAD `75360ad` the helper
  path does not exist in the commit, so the helper's runtime evidence field
  `helper.present_at_repo_head` resolves to `false` while the helper remains untracked. Measured
  directly:
  - `git cat-file -e 75360ad...:docs/platform/house-long-run/tools/lane-a-exact-file-postgres-apply.mjs`
    -> exit `128` (`exists on disk, but not in '75360ad...'`)
  - `git -C <planning worktree> rev-parse HEAD` -> exit `0`

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

Command:

`node docs/platform/house-long-run/tools/tests/fop-helper-verify.mjs`

Exit code: `0`

Final total line, verbatim:

```
FOP_HELPER_VERIFY_TOTAL: 31/31 PASS
```

The harness emitted 31 `PASS` case lines (CASE0, CASE-A x4, CASE-B x3, CASE-C x3, CASE-D x2,
CASE-E x2, CASE-G1, CASE-G2, CASE-G x3, CASE-F x3, CASE-H, CASE-I x4, CASE-J, CASE-K, CASE-L) plus
raw `L-STATUS-RAW` / `L-DIFF-CHECK-RAW` blocks. No `FAIL` line was emitted. The harness's own global
no-connection case reported: spawned runs = 13; runs reporting an execution-stage classification = 0;
runs mentioning CONNECTION_FAILED / RUNTIME_DEPENDENCY_UNAVAILABLE = 0; `connection_attempted=false`
in each guard-fixture evidence JSON.

### 3.2 Secret scan (raw JSON)

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

### 3.3 `git diff --check`

Command: `git diff --check`

Exit code: `0`

stdout: empty (no whitespace-error lines).

stderr (two line-ending advisories, reproduced verbatim, not whitespace errors):

```
warning: in the working copy of 'docs/platform/house-long-run/FINDING-MIGRATION-RUNNER-CONTRADICTS-BRIEF-2026-09-23.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/platform/house-long-run/RUNBOOK-LANE-A-EXPAND-DEPLOY-CONTRACT-2026-09-23.md', LF will be replaced by CRLF the next time Git touches it
```

---

## Section 4 — Changed files and authorized write scope

`git status --porcelain --untracked-files=all` output, verbatim, exactly as reported (8 entries),
captured **before** this packet file was written:

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

Entry count confirmed as `8` by `git status --porcelain --untracked-files=all | wc -l`.

Post-write delta, stated so the list stays exactly reproducible: writing this packet adds exactly one
further `??` entry, `docs/platform/house-long-run/FOP-01-AMENDMENT-EVIDENCE-PACKET-2026-09-23.md`.
Any other delta between this list and a later `git status` is not attributable to this work unit.

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
- No credential value, connection string, or secret-bearing stderr is recorded in this packet.
- The harness PASS recorded in Section 3 is offline/deterministic evidence only. It is not
  `BUILD_PASS != PRODUCTION_READY`-defeating evidence and does not constitute production readiness.
- `F-OP-01` is resolved only at **mechanism level**. It stays **open at operator-contract level**
  until (1) the focused review and (2) the Owner release authorization exist.

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

---

END OF PACKET — evidence only; no approval is expressed or implied by this document.
