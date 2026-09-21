# OWNER HOLD — commit/branch authority + T2 F1 disposition

Task: `WSTERA-CONTROL-TRUTH-SYNC-001` · Workflow `WF-DEV-01 v1.3.0 / LONG_RUN`
Held: 2026-09-21 (Asia/Bangkok) · Held by: Hermes (Long-Run Orchestrator / Coordinator / State Holder)
State: **`OWNER_HOLD_COMMIT_AUTHORITY_AND_T2_F1`** — the run is stopped at the R1 boundary, not failed.

Two decisions are required from the Owner. Hermes holds no authority to resolve either one, and the
run was **not** advanced past the gate while they are open. Nothing has been committed or pushed.

---

## H1 — Commit / branch authority (blocks R1 entirely)

**Why this blocks.** The manifest places a Codex independent review at `R1` immediately after T2, and the
independent-review policy requires the reviewer to verify the repository, branch, packet and **target SHA**
identity, and to reject a review whose evidence SHA differs from the target. Right now **no revision
exists** for the reviewed change, so R1 cannot be started at all.

**The conflict.** Three authorities disagree:

| Source | Requirement |
|---|---|
| Task instruction (this run) | Branch `work/wstera-control-truth-sync-001` |
| Repository git policy (`policies/GIT-POLICY.md`) | `one Task = one branch`; branch convention `task/<TASK-ID>-<slug>`; no routine work on `main`; reviews target an exact commit SHA |
| Standing workspace rule | `saas-product-hub` history: commits are made by **Claude only**; other agents edit and write evidence, then stop |

**Measured current state.**

| Worktree | Branch | HEAD | Commits made by this run |
|---|---|---|---|
| `D:\AI-Workspace\runtime\worktrees\hub-web-cts001` | `work/wstera-control-truth-sync-001` | `407130718646d13630b9789f68522a521fc74483` | **0** (6 tracked files modified, 1 new test file untracked) |
| `D:\AI-Workspace\runtime\worktrees\wstera-control-truth-sync-001` | `work/wstera-control-truth-sync-001` | `c6c7c0ece06aa861c1559afbecdc8368ebc532e1` | **0** (6 new untracked documents) |
| `D:\AI-Workspace\projects\saas-product-hub\apps\hub-web` (source) | `work/house-platform-closure-20260919` | `4071307…` | untouched, clean, 0/0 parity |
| `D:\AI-Workspace\projects\saas-product-hub` (House) | `work/house-production-closure-longrun-20260919` | `13a2d55…` | untouched; 3 unrelated untracked files preserved |
| `D:\AI-Workspace\temp\wstera-control-sync-build` | `task/WSTERA-CONTROL-SYNC-001` | `e711b94…` | untouched, clean |

Draft PR #2 was re-confirmed **OPEN + DRAFT + unmerged** live from the GitHub API. No merge occurred.

**Options as presented to the Owner.**
1. Hermes commits on `work/wstera-control-truth-sync-001` as the manifest locks.
2. Route the commit to Claude, per the standing `saas-product-hub` rule.
3. Rename to the git-policy form `task/WSTERA-CONTROL-TRUTH-SYNC-001` and have Hermes commit.

**Owner response:** *not received within the response window (10 minutes).* No option was applied.

---

## H2 — T2 finding F1 (HIGH) disposition

`T2-WU02` returned `QUALIFIED_WITH_FINDINGS` with twelve findings, F1 rated **HIGH**. Hermes independently
corroborated F1 from source rather than accepting the report:

- `grep -rn "DROP FUNCTION" drizzle/` → **no matches anywhere.**
- `drizzle/migrations/0006_canonical_product_id_work_truth.sql:32-49` declares
  `ingest_agent_work_event_atomic` with **17** parameters.
- `0006:265-288` grants EXECUTE on that **17-argument** signature to `service_role`.
- Therefore a 19-argument `CREATE OR REPLACE FUNCTION` **does not replace it.** PostgreSQL leaves the
  17-argument function in place with its grant intact and **no scope gate of any kind**, so the new
  fail-closed scope contract is bypassable by any 17-argument caller.
- Corroborating measurement: the T2-WU01 client already sends **19** arguments while the migration
  signature is still **17**.

**Options as presented to the Owner.**
1. Close it with a `DROP FUNCTION` of the superseded signature inside the migration text, before R1.
2. Retain the overload with a written justification plus a test proving it cannot bypass.
3. Leave the disposition to Codex at R1.

**Owner response:** *not received within the response window (10 minutes).* No option was applied.
The migration file has **not** been written, so nothing is locked by this hold.

---

## What was completed before the hold

| Stage | State |
|---|---|
| T0 + B0 | COMPLETE — no blocking finding; ten drift rows all non-contract-affecting |
| T1 | COMPLETE — locked scope contract + production-truth dependency closure |
| T2 | COMPLETE — 4 of 4 work units, all lanes PASS with CLEAN invariants |
| R1 | **BLOCKED by H1** — cannot bind a revision |

All eight lanes ran on `hermes-native-swarm v0.1.1` with `relay_path_used: false`. Agent Relay was never
used as an ordinary execution path. Codex and Claude were not invoked.

Commander-verified test progression: `366/366` baseline → `381/381` after T2-WU01 → **`416/416`** after
T2-WU03. Typecheck PASS at every gate. No migration file created. No database contacted.

### Blocker B1 — Control Work Queue projection

Migration `0006:70-78` raises `product_identity_invalid` for any task projection without a canonical
`productCode + productId`. Non-product House/Platform work therefore cannot be truthfully projected into
the Work Queue, and inventing a Product code is forbidden. **No `work.sync` was sent.** Control received
activity-only telemetry; all eight events were delivered with HTTP 200 and the durable outbox holds **zero**
non-delivered items. This is precisely the gap this task exists to close — closing it requires the T2→R1
path to proceed.

---

## Standing at this hold

Nothing is committed. Nothing is pushed. No migration exists. No database was contacted. No production
mutation occurred. Draft PR #2 remains unmerged.

No `PRODUCTION_READY`, no `OPERATED_STABLE`, no stage PASS asserted by Hermes on its own authority, and no
Owner decision made or inferred. Mac parity remains `MAC_PARITY_UNVERIFIED`.

**To resume:** the Owner answers H1 and H2 above. R1 follows immediately once a revision is pinned.
