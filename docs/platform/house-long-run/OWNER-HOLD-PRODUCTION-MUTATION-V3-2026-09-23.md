# OWNER HOLD V3 — PRODUCTION MUTATION (F-OP-01 resolved at operator-contract level)

Task: `WSTERA-CONTROL-TRUTH-SYNC-001` · Workflow `WF-DEV-01 v1.3.0 / LONG_RUN`
State: **`OWNER_HOLD_PRODUCTION_MUTATION_V3`** — stopped at the terminal state the governing brief defines.
Reached: 2026-09-23 (Asia/Bangkok) · Held by: Hermes (Long-Run Orchestrator / State Holder)
Governing brief: `BRIEF-RESUME-LANE-A-FOP01-EXACT-FILE-APPLY-2026-09-23.md` §20

Nothing was advanced past this gate. **No production mutation of any kind occurred.**

---

## 1. What changed since V2

V2 held Lane A because the brief's stated production apply mechanism did not exist in this
repository. That is now resolved, independently reviewed, and closed at the operator-contract level.

```text
V2 blocker:  F-OP-01 — the brief prescribed `drizzle-kit migrate`, but this repo has no
             drizzle/migrations/meta and no _journal.json, so that runner has no migration
             set to enumerate; `db:push` is separately prohibited by a prior Owner decision.
V3 status:   F-OP-01 RESOLVED at mechanism-design level and APPROVED at operator-contract
             level by an independent review. The remaining blocker is only the Owner release
             authorization, which by design has no substitute.
```

## 2. The amendment package

| Item | Value |
|---|---|
| Amendment revision (planning) | `4ca08f2578335c887bc119c6546c8f9d9be1276b` |
| Remote parity | 0/0, worktree clean |
| Mechanism id | `LANE_A_EXACT_FILE_POSTGRES_TRANSACTION_APPLY_V1` |
| Operator helper | `docs/platform/house-long-run/tools/lane-a-exact-file-postgres-apply.mjs` |
| Helper sha256 | `d87bd4aa938d0d0a853cea84289e182d29e2cafe6237ff2df3e4fb5a3a77398b` (56,368 B class) |
| Offline harness | `docs/platform/house-long-run/tools/tests/fop-helper-verify.mjs` |
| Harness sha256 | `f62317c26923a0b41b143e48f0ed71ea8b8c5f8b1f4e2deb52ba89e4440f0b8c` |
| Corrected runbook sha256 | `1f2c203d643e8455f954fb94e19dbd6dcb4918a61d96526c9830428d20f8f082` |
| F-OP-01 finding sha256 | `2391703b0152666b517abe6f4537cf6f920d91ea975216d8764a8a8264c70bf4` |
| Evidence packet sha256 | `3d320faacb761edaef48c68dae76ef59b4a7f630ad699527333a7206d3a07e63` |
| Codex verdict (round 2) | `APPROVED_WITH_FINDINGS`, no finding requiring artifact change |

## 3. Immutable reviewed source revisions (unchanged, not re-designed)

| Role | Repository | Revision | Parity |
|---|---|---|---|
| `A_EXPAND_REV` | `hub-web` | `dfcb4be4ac8b488ef740e2147f83b5c19251fbd8` | 0/0 |
| `A_CONTRACT_REV` | `hub-web` | `dd9a629eaa4e75c29fe0b8aa31698b5f9c4e1dae` | 0/0 |
| Control Sync source (untouched by this lane) | `wstera-workflows` | `fb84b9d6517186246dacde2871937d98c52ec7a6` | 0/0 |

Migration hashes, extracted from their declared revisions (not the working tree):

```text
0009_work_scope_identity.sql            8f88a7d1e4d3777dd0c2adefa999f61799bd50dd1270407fa025f3c4068d3487
0010_retire_legacy_work_event_rpc.sql   3963c6a6e6423f006889d87c735e86ef30831680964c19b096f23f2b091a7b30
0010 absent at A_EXPAND_REV             confirmed (git exit 128)
```

The F-OP-01 amendment touched only planning-repo docs and tooling. Neither `hub-web` nor
`wstera-workflows` was modified, so the reviewed migration identities are intact.

## 4. What the operator helper enforces

- **Closed migration set.** Only `0009` and `0010` are accepted, each bound to exactly one file path.
- **Exact bytes from the pinned revision.** The migration text is read via
  `git cat-file -p <rev>:<file>` and hashed; a mismatch refuses before the credential is read.
- **Target identity proof.** The credential's identity must resolve to the declared expected target
  reference; a mismatch refuses with `TARGET_IDENTITY_MISMATCH` before any driver load. The
  connection string is never printed, never passed in argv, and never persisted.
- **Authority interlocks.** `LANE_A_LIVE_DB_AUTHORIZED=YES` is required for any live connection and
  `LANE_A_PRODUCTION_APPLY_AUTHORIZED=YES` additionally for real commit mode. Without them the
  helper refuses with `AUTHORITY_GUARD_REFUSAL`, attempts no connection and reads no credential.
  These are safety interlocks — they do not create authority.
- **Dry run.** `BEGIN -> exact migration SQL -> in-transaction assertions -> deliberate ROLLBACK`,
  and the rollback is structural (a sentinel throw the callback can only reach after the assertion
  block), not advisory.
- **Apply.** `BEGIN -> preconditions -> exact migration SQL -> postconditions -> COMMIT`, and the
  commit is reachable only by a normal callback return after the postconditions pass.
- **No Drizzle runner, no ledger.** `drizzle-kit generate`, `drizzle-kit migrate` and `db:push` are
  never invoked; no `_journal.json` and no `__drizzle_migrations` are created or consulted.
- **Ledgerless sequencing.** Before `0009`: exactly one 17-argument RPC in the expected shape.
  Before `0010`: exactly one 19-argument RPC with the reviewed privilege shape, exactly one legacy
  17-argument overload, **and** a recorded successful `0009` apply **and** a recorded live-Worker
  proof of the 19-argument path — same target ref and same task id. The `0009` record alone is
  explicitly rejected as that proof (`WORKER_LIVE_PROOF_MISSING`).

## 5. Review history (both rounds, stated plainly)

**Round 1** (`f68af69`) — verdict **`CHANGES_REQUIRED`** with two blocking findings and one HIGH:

1. *BLOCKING* — the `0010` sequencing gate enforced only the `0009` apply record and did not enforce
   the live-Worker proof the brief requires before CONTRACT.
2. *BLOCKING* — the harness `PASS` claim did not reproduce in the reviewer's sandbox: that sandbox
   cannot spawn child processes, so every spawned case returned no exit code and was counted FAIL
   (22 failures).
3. *HIGH* — the harness was not read-only; running it wrote artifacts inside the repository, so a
   reviewer mutated the tree.

**Remediation** (`4ca08f2`) — all three closed:

1. `WORKER_LIVE_PROOF_MISSING` added; the `0010` gate is now conjunctive over the `0009` record and a
   worker-live proof for the same target ref and task id.
2. The harness probes spawn availability once and reports `SKIP_UNSPAWNABLE` — never FAIL, never
   PASS — with a total line naming the skipped count, and still exits non-zero if a runnable case
   fails.
3. `LANE_A_FOP_READONLY=1` added: no file is written inside the repository, scratch lives in an OS
   temp directory and is removed on exit. Verified: porcelain identical before and after.

**Round 2** (`4ca08f2`) — verdict **`APPROVED_WITH_FINDINGS`**, *findings: none requiring artifact
change*. Round-1 closure: blocking 1 **CLOSED**, blocking 2 **CLOSED by code inspection**,
HIGH 3 **CLOSED by code inspection**.

**Honest limitation, stated rather than smoothed over:** the reviewer's sandbox also cannot write to
a temp directory, so it could not execute the harness at all and verified those two gates by code
inspection; the commander verified them by execution (`44/44 PASS` in both modes). No single
environment so far exhibits both a full harness run and reviewer independence. This is the same
sandbox class of limitation recorded at earlier reviews of this task.

## 6. Gate results

```text
node --check helper            -> PASS (reviewer + commander)
node --check harness           -> PASS (reviewer + commander)
harness default mode           -> exit 0, 44/44 PASS                    (commander-measured)
harness read-only mode         -> exit 0, 44/44 PASS, scratch removed   (commander-measured)
porcelain before/after read-only run -> identical                       (commander + reviewer)
git diff --check               -> clean                                 (reviewer + commander)
secret scan (9 artifacts)      -> 0 findings                            (reviewer + commander)
migration identity extraction  -> PASS, 0010 absent at EXPAND           (reviewer + commander)
```

## 7. Rollback / forward-fix contract (unchanged)

**Before CONTRACT:** if the new Worker fails, re-point the Worker to the previous version. The
17-argument function still exists, so old ingestion stays compatible. The additive 19-argument
function and the scope columns may remain temporarily pending reviewed cleanup. No destructive data
reversal by default.

**After CONTRACT:** **never** roll the Worker back to a 17-argument client while the 17-argument RPC
is absent — every ingestion call returns `42883 undefined_function`. If an old-client rollback
becomes necessary: restore the exact reviewed 17-argument function and its privileges first
(re-apply `0006`), verify it live, and only then re-point the Worker. Prefer forward-fix whenever the
19-argument path is healthy.

**Control Sync skill:** roll back using the pre-install hashes/files recorded in the T4 parity plan.

**Migration rollback:** the helper's dry-run proves the file is accepted and rolled back before any
real apply; a real apply that fails rolls back automatically and does not retry.

## 8. Lane-B collision state

```text
Lane B planning  work/house-lane-b-longrun-plan-20260922  (no live window open)
Lane B execution work/house-h3d-h5-20260909               (no live window open)
```

No Lane-B live mutation window is open. Any later live window must re-check the other lane
immediately before authority is granted.

## 9. Exact operator identity and credential source class

- **Operator:** Hermes (Long-Run Orchestrator / State Holder) as coordinator; any real apply requires
  a human operator to set the two authority interlocks explicitly in the process environment.
- **Credential source class:** the Control database connection string is read by the helper from the
  environment variable `LANE_A_CONTROL_DATABASE_URL` at run time only. It is never passed in argv,
  never printed, and never written to evidence. **No credential value is recorded anywhere in this
  package.** The specific provisioning path for that variable is an Owner/operator decision and is
  deliberately not invented here.

## 10. 🔴 What is required from you now — one bounded decision

The brief defines a single release authorization:

```text
LANE_A_PRODUCTION_RELEASE_V1
```

If approved **once**, it authorizes the ordered release only, every window conditional on the prior
window PASS:

```text
Window 0  live preflight / backup / target proof
Window 1  0009 transactional dry-run -> PASS -> exact-file APPLY -> live assertions
Window 2  hub-web deploy -> live 19-argument proof
Window 3  0010 transactional dry-run -> PASS -> exact-file APPLY -> live assertions
Window 4  exact Control Sync skill install + parity
Window 5  nine live proofs -> R3 -> T7
```

Any FAIL stops before the next window; no authority is inferred to skip a gate.

Also required with that decision:

1. **Name the operator** who will set `LANE_A_LIVE_DB_AUTHORIZED` / `LANE_A_PRODUCTION_APPLY_AUTHORIZED`.
2. **Confirm the credential source** for `LANE_A_CONTROL_DATABASE_URL` (the expected target reference
   the helper must see is the Control project; the helper refuses any other target).
3. **Say whether the release proceeds now** under the CEO revenue deadline.

**Without explicit `LANE_A_PRODUCTION_RELEASE_V1` approval: no live DB access, no backup, no apply,
no deploy, no Cloudflare mutation, no skill install.**

## 11. Non-claims

- No database was contacted, no connection attempted, no migration applied, no production deploy,
  no Cloudflare mutation, no runtime skill install, no Draft PR #2 merge.
- No `PRODUCTION_READY`, no `OPERATED_STABLE`, no `READY FOR OWNER CONTROL TRUTH REVIEW`.
- `work.sync` remains blocked by GAP-A; no fake Product code was ever invented.
- F-OP-01 is closed at the operator-contract level by independent review; it is **not** a claim that
  anything has been applied or that the mechanism has been exercised against a live database. The
  helper has never been run in live mode.
- Mac parity remains `MAC_PARITY_UNVERIFIED`.
- T6, R3 and T7 have not started.
- **The dead-letter condition is still live**: the installed Control Sync still lacks the
  `activity.detail` bound until Window 4 runs. Mitigation remains procedural (short details).
- Two harness runtime gates are commander-verified and reviewer-code-inspected; the reviewer could
  not execute the harness in its sandbox. Recorded, not hidden.

---

## Evidence index

| Artifact | Path |
|---|---|
| This hold | `docs/platform/house-long-run/OWNER-HOLD-PRODUCTION-MUTATION-V3-2026-09-23.md` |
| F-OP-01 finding (+ disposition) | `docs/platform/house-long-run/FINDING-MIGRATION-RUNNER-CONTRADICTS-BRIEF-2026-09-23.md` |
| Corrected runbook | `docs/platform/house-long-run/RUNBOOK-LANE-A-EXPAND-DEPLOY-CONTRACT-2026-09-23.md` |
| Amendment evidence packet | `docs/platform/house-long-run/FOP-01-AMENDMENT-EVIDENCE-PACKET-2026-09-23.md` |
| Codex verdict round 2 | `docs/platform/house-long-run/FOP-01-CODEX-VERDICT-R2-2026-09-23.md` |
| Codex raw transcripts | `…/workspace/wstera-cts-001/fop-amendment/FOP-CODEX-VERDICT.txt` (round 1), `FOP-CODEX-VERDICT-R2.txt` (round 2) |
| Operator helper + harness | `docs/platform/house-long-run/tools/…` |
| Prior V2 hold | `docs/platform/house-long-run/OWNER-HOLD-PRODUCTION-MUTATION-V2-2026-09-23.md` |
