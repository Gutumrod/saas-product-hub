# OWNER HOLD V2 — PRODUCTION MUTATION (Lane A EXPAND → DEPLOY → CONTRACT)

Task: `WSTERA-CONTROL-TRUTH-SYNC-001` · Workflow `WF-DEV-01 v1.3.0 / LONG_RUN`
State: **`OWNER_HOLD_PRODUCTION_MUTATION_V2`** — stopped at the manifest checkpoint, not failed.
Reached: 2026-09-23 (Asia/Bangkok) · Held by: Hermes (Long-Run Orchestrator / State Holder)
Governing brief: `BRIEF-RESUME-LANE-A-CONTROL-TRUTH-EXPAND-CONTRACT-2026-09-22.md` §12

Nothing was advanced past this gate. **No production mutation of any kind occurred.**

---

## 1. The two reviewed revisions

| Role | Repository | Revision | Remote parity |
|---|---|---|---|
| `A_EXPAND_REV` — Revision A (EXPAND) | `hub-web` | `dfcb4be4ac8b488ef740e2147f83b5c19251fbd8` | 0/0 |
| `A_CONTRACT_REV` — Revision B (CONTRACT) | `hub-web` | `dd9a629eaa4e75c29fe0b8aa31698b5f9c4e1dae` | 0/0 |

Revision B is a direct child of Revision A. The reviewed application source parent is the
already-R2-approved `fde38f64e6bd72de9af549a88777bf276933c051`.

```text
drizzle/migrations/0009_work_scope_identity.sql
  present at both A_EXPAND_REV and A_CONTRACT_REV, byte-identical between them
  sha256 8f88a7d1e4d3777dd0c2adefa999f61799bd50dd1270407fa025f3c4068d3487

drizzle/migrations/0010_retire_legacy_work_event_rpc.sql
  present ONLY at A_CONTRACT_REV (absent at A_EXPAND_REV — load-bearing)
  sha256 3963c6a6e6423f006889d87c735e86ef30831680964c19b096f23f2b091a7b30
```

## 2. Unchanged revision outside this lane

```text
wstera-workflows  work/wstera-control-truth-sync-001-t4  fb84b9d6517186246dacde2871937d98c52ec7a6
  worktree clean · parity 0/0 · not modified by this lane
```

## 3. What Revision A does and does not do

**Does:** adds the two nullable scope columns with an applied-shape assertion, the bounded product
backfill, the `NOT VALID` constraint plus its separate `VALIDATE CONSTRAINT`, the 19-argument
`ingest_agent_work_event_atomic`, and the four-statement privilege block pinning the full 19-entry
type list (3 REVOKE + 1 GRANT to `service_role`).

**Does not:** drop the superseded 17-argument overload. It is deliberately retained, so a currently
deployed 17-argument client keeps ingesting across the expansion boundary. Its comment prose was
rewritten so it no longer claims to remove the legacy signature.

**Does not contain any `0010` file.** This is load-bearing: if both migrations were present as
unapplied when the first apply ran, the deployment boundary the whole design exists to create would
disappear.

## 4. What Revision B does

Adds `0010`, the CONTRACT step: a catalog-based fail-closed precondition block (exactly one
19-argument function; exactly one superseded 17-argument overload; `service_role` can execute the
19-argument path; PUBLIC cannot), exactly one DDL statement (the 17-argument `DROP FUNCTION IF
EXISTS` by full explicit type list), and a post-retirement assertion block. No unrelated schema or
data change. Header documents the recovery order and the `42883` hazard.

## 5. Deterministic gates

```text
hub-web  npm run check                                  -> exit 0
hub-web  npx vitest run                                 -> 28 files, 497 tests, exit 0
hub-web  git diff --check                               -> CLEAN
hub-web  check_expand_static.py                         -> 10/10
hub-web  check_contract_static.py                       -> 11/11
hub-web  application-source diff fde38f6..dd9a629
         (excluding drizzle/ and the migration test)    -> EMPTY (no app source changed)
hub-web  esbuild bundle server/_core/index.ts
         at dfcb4be vs dd9a629                          -> byte-identical
                                                            sha256 6e596d6ecde0ca7e92a99bd8ab9b2aab7a1587f831ece52831839a803f2bae11
```

Falsification performed: 5 cases against temporary copies of `0010` outside the repository
(precondition removed; DROP widened to 19 arguments; `ALTER TABLE` appended; postcheck moved before
the DROP; `42883` mentions removed) — each fired the intended assertion; temporary copies deleted,
no stray file remains.

## 6. Focused independent review — Codex

```text
VERDICT: APPROVED_WITH_FINDINGS
FILES_MUTATED_BY_REVIEWER: none
```

Full record: `R2-AMENDMENT-CODEX-VERDICT-2026-09-23.md` (raw transcript +
`D:/AI-Workspace/runtime/hermes-native/workspace/wstera-cts-001/lane-a-expand-contract/R2-AMENDMENT-CODEX-VERDICT.txt`).

This is a **source/revision verdict only** — not deployment approval, not DB-migration approval, not
skill-install approval, and not live-behaviour evidence. It does **not** inherit or extend the earlier
R2 exact-SHA approval; it reviewed the two rollout revisions on their own merits.

Reviewer's key answers: old 17-argument client works after EXPAND (yes); new 19-argument client works
after deploy before CONTRACT (yes); rollback safe on both sides (yes, conditionally — after CONTRACT
the 17-argument function must be restored and verified before any old-client re-point); F1 bypass is
**deferred, not live-closed**, until CONTRACT actually runs; all seven preserved invariants preserved.

Reviewer UNVERIFIED (sandbox `spawn EPERM`, same limitation as the earlier R2 review): `npx vitest
run` and the 497-test count. Those remain **commander-produced** evidence, not reviewer-reproduced.

Post-review immutability check: every repository clean, both migration hashes unchanged,
`git ls-files -s drizzle/migrations/` digest `538f873b164abb180bf4d249289b1f1e949caa5c9cd5e3b4c2f7df3bfa1cf361`.

## 7. 🔴 What is required from you before anything can proceed

### 7.1 Decide the production apply mechanism (BLOCKING) — F-OP-01

The brief prescribes `drizzle-kit migrate` as the production runner. **That runner does not exist in
this repository**: there is no `drizzle/migrations/meta/` and no `_journal.json`, so drizzle-kit has
no migration set to enumerate. `package.json` exposes only `db:push`, which a prior Owner decision
explicitly prohibits for this project because the database has no `__drizzle_migrations`.

Consequences, stated plainly:

- the brief's Window 1 and Window 3 operator steps — *"run the normal migration mechanism"* and
  *"since 0009 is already recorded, only 0010 should apply"* — are **not executable as written**;
- the "only 0009 first, only 0010 later" property cannot be enforced by any tool in this repository;
- an operator following the brief literally would either invoke a prohibited command or discover
  mid-window that the prescribed command applies nothing.

Codex independently reached the same conclusion and classified it — correctly, in my assessment — as
**blocking for the operator runbook, not blocking for the source revisions**.

**Shortest safe path (proposal, NOT authorized):** name the apply mechanism as *apply by exact
reviewed file path*, using this folder's own established precedent — a rolled-back transaction dry
run (`BEGIN; <DDL>; <assertions>; ROLLBACK;`) followed by a real apply (`0008:9-10`, cited in
`T2-WU02…:841-844`) — with **no migration ledger**, and the apply recorded in the release evidence
packet by file path + sha256 + applied-at. Then restate Window 1 and Window 3 in those terms.

Do **not** substitute `npm run db:push`. Do **not** create a migration journal: that is a schema-wide
operation across two different databases and is outside this lane.

### 7.2 The four original OWNER_HOLD items still stand

Carried forward from `OWNER-HOLD-PRODUCTION-MUTATION-2026-09-22.md` §3, now against the rollback-safe
two-revision plan:

| # | Mutation | Note |
|---|---|---|
| 1 | Live Control DB apply of the EXPAND revision | now split: apply `0009` from `dfcb4be` only |
| 2 | `hub-web` production deploy | application source is identical to the R2-approved source |
| 3 | Revised Control Sync runtime skill installation | only after the decision routes are live |
| 4 | Rollback / forward-fix plan acceptance | now materially safer: the legacy overload is retained until CONTRACT |

Items 1 and 2 no longer need to be in the *same* window in the strict sense the previous hold
required — retaining the overload removes the `42883` gap — but they should still be treated as one
release, with CONTRACT strictly last and only after live Worker proof.

### 7.3 Decide whether to proceed at all under the CEO revenue deadline

Remaining to the revenue deadline: **13 days** at the time of this hold (deadline 2026-10-06). This
hold is the shortest known path to closing GAP-A (House/Platform work being invisible in the Work
Queue because non-product projections are rejected). It is a release-authority decision, not a
technical one.

## 8. Exact operator sequence required (prepared, NOT executed)

`RUNBOOK-LANE-A-EXPAND-DEPLOY-CONTRACT-2026-09-23.md`, marked **NOT EXECUTABLE AS-IS** until §7.1 is
resolved. Windows: preflight → EXPAND (`dfcb4be`) → DEPLOY (`dd9a629`) → CONTRACT (`dd9a629`) →
skill install → nine live proofs → R3 → T7.

## 9. Lane-B collision check

```text
Lane B planning  work/house-lane-b-longrun-plan-20260922   675975b85d4ccb106a39a9d2166b7dbbab70edb0
Lane B execution work/house-h3d-h5-20260909                2b1af861aa608f08abb0bd8224821b9ca5ac9981
```

No Lane-B live mutation window is open. Lane A and Lane B remain on separate branches and worktrees;
source-only work in the two lanes does not conflict. Any later live window must re-check the other
lane immediately before authority is granted.

## 10. Non-claims

- **No DB apply, no migration, no deploy, no Cloudflare mutation, no runtime skill install, no
  Draft PR #2 merge.** Draft PR #2 remains open and unmerged.
- No `PRODUCTION_READY`, no `OPERATED_STABLE`, no `READY FOR OWNER CONTROL TRUTH REVIEW`.
- `work.sync` remains blocked by GAP-A; no fake Product code was ever invented.
- The reviewer did not reproduce the test suite; its two gates are UNVERIFIED, not passed.
- The bundle-equivalence proof is byte-equality of a `server/_core/index.ts` esbuild bundle plus an
  empty application-source diff — it is not a full Cloudflare/Wrangler production build.
- Mac parity remains `MAC_PARITY_UNVERIFIED`.
- T6, R3 and T7 have not started.
- **The dead-letter condition is still live**: the installed Control Sync still lacks the
  `activity.detail` bound until item 3 runs. This run's mitigation remains procedural (short details),
  not installed.

## 11. What is required from you now

Answer, in order:

1. **§7.1** — name the production apply mechanism (or authorize the proposed shortest safe path).
2. **§7.2** — decision per item 1–4.
3. The intended operator for the live mutation.
4. Whether Lane A proceeds now under the revenue deadline or is deferred behind other revenue work.

**Nothing proceeds without your answer.** The run is held, not failed, and the reviewed revisions stay
exactly where they are.

---

## Evidence index

| Artifact | Path |
|---|---|
| This hold | `docs/platform/house-long-run/OWNER-HOLD-PRODUCTION-MUTATION-V2-2026-09-23.md` |
| Runner finding | `docs/platform/house-long-run/FINDING-MIGRATION-RUNNER-CONTRADICTS-BRIEF-2026-09-23.md` |
| Runbook (not executable as-is) | `docs/platform/house-long-run/RUNBOOK-LANE-A-EXPAND-DEPLOY-CONTRACT-2026-09-23.md` |
| Codex verdict record | `docs/platform/house-long-run/R2-AMENDMENT-CODEX-VERDICT-2026-09-23.md` |
| Codex raw transcript | `D:/AI-Workspace/runtime/hermes-native/workspace/wstera-cts-001/lane-a-expand-contract/R2-AMENDMENT-CODEX-VERDICT.txt` |
| Swarm evidence (A1/A2/B1/B2) | `D:/AI-Workspace/runtime/hermes-native/workspace/wstera-cts-001/lane-a-expand-contract/out-*/` |
| Static checkers | `.../lane-a-expand-contract/check_expand_static.py`, `check_contract_static.py` |
| Lane A1 attempt-1 preserved artifact | `.../lane-a-expand-contract/attempt1-preserve/0009-after-attempt1.sql` |
| Lane B1 attempt-1 preserved artifact | `.../lane-a-expand-contract/b1-preserve/0010-b1-authored.sql` |
