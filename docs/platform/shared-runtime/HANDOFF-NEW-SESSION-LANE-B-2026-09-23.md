# HANDOFF — NEW SESSION, LANE B — GOVERNANCE RECOVERY CLOSED

Date: 2026-09-23
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Purpose: open a fresh session for Lane B with no history replay.
Governance state entering the new session: **`SOL_DECISION_GATES_LOCKED`**
Governance/recovery side-task: **CLOSED**
Written by: Hermes (mechanical record only; Hermes does not decide or approve)

---

## 0. Open this first

```text
Repo:        github.com/Gutumrod/saas-product-hub
Branch:      planning  work/house-lane-b-longrun-plan-20260922
             execution work/house-h3d-h5-20260909
Checkpoint:  planning  4b792e9794d921f89efd53998bb83ffbd3b06bf8
             execution 54327b1459bdecff1d00b19ca3b8099c5fc4f09a

Read and execute:
<D:\AI-Workspace\runtime\worktrees\house-lane-b-longrun-plan-20260922\docs\platform\shared-runtime\OWNER-DECISION-GATE-CONTRACT-LANE-B-2026-09-23.md>
<D:\AI-Workspace\runtime\worktrees\house-lane-b-longrun-plan-20260922\docs\platform\shared-runtime\BRIEF-RESUME-LANE-B-HERMES-RELAY-AFTER-OPENCODE-RECOVERY-2026-09-23.md>
<D:\AI-Workspace\runtime\worktrees\house-lane-b-longrun-plan-20260922\docs\platform\shared-runtime\BRIEF-CODEX-REVIEW-LANE-B-RECONSTRUCTED-PAIR-2026-09-23.md>
```

`Checkpoint` = the exact frozen pair that was released to Codex review. This handoff commit
adds **one docs-only commit** on the planning branch; it does not change any reviewed artifact.
The new session must bind to the SHAs it measures itself (see §3).

---

## 1. Current Lane-B state

```text
U-R1  finding-family ledger                          COMPLETE
U-R2  credential / effective-privilege reconstruction COMPLETE (REV5)
U-R3  executable checks + runbooks                   COMPLETE (stage gate PASS)
      → U-R3 COMPLETE — EXECUTABLE CHECKS + RUNBOOKS LANDED; READY FOR CANDIDATE PAIR FREEZE
governance gate contract                             APPROVED · SOL_DECISION_GATES_LOCKED
candidate pair                                       FROZEN and RELEASED to Codex review
Codex independent review                             ATTEMPTED → BLOCKED (harness), no review record
```

U-R1/U-R2/U-R3 evidence is **preserved unchanged**; all ten manifest artifact hashes were
re-verified against the repositories at this handoff and match (see §3.3).

---

## 2. SHAs

```text
planning  (contract + evidence)  4b792e9794d921f89efd53998bb83ffbd3b06bf8   parity EXACT
execution (U-R3 landed)          54327b1459bdecff1d00b19ca3b8099c5fc4f09a   parity EXACT
                                  tree 3bfcc13cd45012661c49bd32deb0859c5a5b4b9e (unchanged)
approval-bound contract revision 05442fa76cd83e3dc97955b501f8d2e0723a61cb
approved contract content sha256 00f0e9e57a620e5ad0a3c51f4596e285dfcf77b8cecdb84980efcff0bc6c1d6a
pinned runtime SoT               931e3711f0fec19860be1e59769674a4981b7e4a
```

The approved contract file is **immutable to Hermes**. Its bytes must not be edited; a state
change to the contract itself requires Owner action.

---

## 3. Candidate / freeze status

```text
candidate identity    immutable bound pair (planning_sha, execution_sha)
                      — branches are NOT merged to manufacture one SHA
last frozen pair      586d7db (planning, bookkeeping) / 54327b1 (execution)
current planning HEAD 4b792e9 (adds the Codex review brief) + this handoff commit
released to Codex     YES (brief BRIEF-CODEX-REVIEW-LANE-B-RECONSTRUCTED-PAIR-2026-09-23.md)
review record file    NOT PRODUCED
```

### 3.1 Invalidation rule (contract §6, manifest §2)

If either SHA changes, the previous review cannot be inherited. Docs/manifest bookkeeping
commits do not change the approved contract content, but the new session MUST re-freeze
explicitly on the exact pair it measures and record that pair before re-dispatching review.

### 3.2 The five real open findings (authority = Codex R4 disposition table, NOT the STATUS doc)

```text
NEW-DEFECT-03   forbidden-write check tested only INSERT (not all four write privileges)
NEW-DEFECT-05   trigger-DDL probe harmlessness was prose, not an executable contract
NEW-DEFECT-06   H3D-LIVE exception gate could not prove an exhaustive object boundary
NEW-DEFECT-08   H3D-LIVE relation checks returned a bare relname; qualified exception could not match
NEW-DEFECT-09   accepted-exposure query conflated catalog presence with effective reach
```

`STATUS-LANE-B-PRE-A1-CONTROLLER-PACKAGE-2026-09-22.md` §3 names only two of these.
`LEDGER-LANE-B-FINDING-FAMILIES-2026-09-22.md` records `STATUS_UNDERREPORTS_OPEN_SET`.

Family root cause: the contract modelled privilege as a **declared grant list** when the
measured truth is a **reachability relation**. `IF-01` was repaired three times
(`47eab10` → `d2c094f` → `675975b`); the third exceeded the two-attempt rule, which is why the
legacy patch-by-finding loop is **DISABLED** and this is a single fresh reconstruction.

### 3.3 Artifact hashes re-verified at this handoff (10/10 match)

| Artifact | SHA-256 |
|---|---|
| `CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md` (REV5) | `9f49ea1a…66ff490` |
| `RECONSTRUCTION-LANE-B-CREDENTIAL-BOUNDARY-2026-09-23.md` | `9e690415…eb12dda8` |
| `LEDGER-LANE-B-FINDING-FAMILIES-2026-09-22.md` | `1477ff5a…fae35a2` |
| `evidence/LANE-B-U-R3-EXECUTABLE-CHECKS-2026-09-23.md` (exec branch) | `62f9ed6b…144aacc7` |
| `lib/six-layer-privileges.mjs` | `b8716595…40947bad` |
| `lib/probe-contract.mjs` | `b43a6ad2…bca11dd0` |
| `h3d/lane-b-gates.mjs` | `9ef94f6c…da7f1a3c3` |
| `inventory/lane-b-effective-reach.mjs` | `66ec3e62…625a982df` |

---

## 4. Decision-gate contract state

| Item | Value |
|---|---|
| Contract file | `docs/platform/shared-runtime/OWNER-DECISION-GATE-CONTRACT-LANE-B-2026-09-23.md` |
| Sol verdict on it | `READY_TO_LOCK_WITH_AMENDMENTS` — amendments applied (header, §2, §12) |
| Amendments scope, verified | §1, §3–§11, §13–§14 **byte-identical** to the pre-amendment revision `959605b`; substantive authority matrix (§4–§13) untouched |
| Owner decision | **APPROVED** — `SOL_DECISION_GATES_LOCKED` |
| Recorded in | `OWNER-APPROVAL-RECORD-LANE-B-GATE-CONTRACT-2026-09-23.md` (state recorded separately so the approved artefact is never edited) |
| Consequence | Hermes continues the LONG_RUN **without Owner interruption except §8** |

§8 Owner stops in force: `OWNER-CP-H3D-A1` · `OWNER-CP-H3D-LIVE` · `OWNER-CP-H3E` ·
`OWNER-CP-H4` · `OWNER-CP-HOUSE-A` · any Production mutation · irreversible/destructive
action without a reviewed rollback · secret exposure requiring rotation · architecture /
routing / contract / security-invariant / product-rule / scope expansion · new paid or
premium route · unresolved live-infrastructure collision · no safe remediation path.

---

## 5. What to do first, in order

1. **Re-measure, then re-freeze.** Read both worktrees; confirm parity/clean; record the exact
   `(planning_sha, execution_sha)` pair you measure. Do not inherit any prior binding blind.
2. **Clear the review-harness blocker** (§6.1) so the independent review can actually produce
   its record. This is `BLOCKED_TECHNICAL_REMEDIATION` with an existing canonical repair path,
   not an Owner decision.
3. **Dispatch the single fresh Codex review** bound to the re-frozen pair, per
   `BRIEF-CODEX-REVIEW-LANE-B-RECONSTRUCTED-PAIR-2026-09-23.md`. Expect `REMEDIATE` on
   `NEW-DEFECT-03` (§6.2) — do not treat that as an Owner gate.
4. **Route the `NEW-DEFECT-03` question to Sol** for classification under contract §7 before
   any fix. If the answer changes the security contract (§8.9 condition) it becomes an Owner
   decision; Hermes must not decide it.
5. Continue under the contract until the next §8 gate (`OWNER-CP-H3D-A1`).

---

## 6. Real blockers (measured)

### 6.1 Codex review harness blocks the reviewer's own evidence writes

```text
error   DIRECT_EXECUTOR_UNKNOWN:agent-codex:scope_violation
paths   .secretary-relay/t_5a99e202/direct-executors/codex-independent-review/agent-codex.stdout.txt
        .secretary-relay/t_5a99e202/…/wrapper-logs/codex-worker-*.{prompt.txt,stdout.log,stderr.log}
driver  {"phase":"BLOCKED","error_code":"DIRECT_EXECUTOR_UNKNOWN","blocked_at":…}
```

The reviewer ran (its sandbox log shows real gate executions) but the adapter's scope gate
classed the reviewer's **own** evidence directory as outside the allowed write scope, so the
run was recorded BLOCKED and the review record file was never created. This is a harness /
adapter scope-widening gap, not a defect of the reviewed work. The card is still open:
`t_5a99e202` (`ready`), relay plan/packet under
`D:\AI-Workspace\runtime\hermes-native\data\.hermes-runtime\lane-b-relay\CODEX-REVIEW-*.json`.

**Not a delivered verdict.** No `REVIEW-CODEX-LANE-B-RECONSTRUCTED-PAIR-2026-09-23.md` exists and
nothing about the review is committed. The reviewer's own log shows it had concluded it would
return `REMEDIATE` rather than PASS. Treat that as a signal to verify, **not** as a verdict.

### 6.2 `NEW-DEFECT-03` is very likely still open — corroborated by the artifact itself

The reviewer's log cited that `evaluateMeasured()` uses **all `ps01` relations** as its universe
and does not support the contract's fixture-DML exclusion / class-**W** row, and that the
generated runbooks carry **no** forbidden-write assertion.

This is independently corroborated by U-R3's own evidence §8 item 2: the §3
"no real-table write privilege (W)" row (all four write privileges false over the `ps01`
universe) is **not provable for W under L6 ownership** (a `ps01_migrator` member inherits the
owner's privileges), so U-R3 **deliberately did not encode** that assertion and left it as an
explicit tension for the Owner / A1 preflight. `checkForbiddenWritePrivileges()` takes the
universe as a parameter so a W-specific universe can be defined if the Owner rules one.

So: the check is incomplete **by recorded intention**, not by oversight. Defining the W universe
touches the security contract → route to Sol first, Owner only if §8.9 is crossed.

### 6.3 `FU-05` — no automated Hermes → Sol transport (non-blocking, preserved)

`SOL_VERIFY_OR_RESOLVE` has no automated channel: Sol has no CLI, no Hermes profile, no kanban
assignee; the executor registry holds `agent-opencode`, `agent-codex`, `agent-claude`,
`agent-qwen`, `agent-agy` only; S-Bridge `notify` carries no Sol-review state. A Sol gate
therefore needs a human to carry the request and return the verdict. **Per Sol: the authority
contract must NOT be changed to work around this.** See `BACKLOG-LANE-B-FOLLOWUP-HARDENING-2026-09-23.md` FU-01…FU-05.

---

## 7. Owner checkpoints still remaining

```text
OWNER-CP-H3D-A1    first H3D-A1 live / rollback-only DML or ephemeral writable-role creation  ← next expected
OWNER-CP-H3D-LIVE  H3D-LIVE Auth / grant / hook / live mutation
OWNER-CP-H3E       live role-retirement / shared-runtime authority mutation
OWNER-CP-H4        disposable-product live / platform mutation
OWNER-CP-HOUSE-A   final House acceptance / HOUSE-A PASS
```

No source/test/review PASS grants any of these. `HOUSE-A REVIEW READY` is **not** closure.

---

## 8. Resolved facts carried forward (no history replay)

| Topic | Resolved fact | Canonical reference |
|---|---|---|
| OpenCode provider auth | RESOLVED by a repo-owned managed contract; `OPENCODE_PROVIDER_AUTH_FIX_PERSISTENT / U-R2_ELIGIBLE = PASS`; before any new OpenCode dispatch run its `verify` then the real `probe`; repeat drift = technical remediation, not an Owner decision | `RUNTIME-HARDENING-OPENCODE-PROVIDER-CONTRACT-2026-09-23.md` (pinned `931e371`) |
| Legacy review loop | DISABLED — no patch-by-finding rounds; one fresh reconstruction review | contract §6, `LEDGER-LANE-B-FINDING-FAMILIES-2026-09-22.md` |
| Controller | Hermes = orchestrator/state holder/integration; Claude = difficult remediation only after `SEND_TO_CLAUDE`; AGY not a backend/database/security worker | `OWNER-ROUTING-OVERRIDE-LANE-B-HERMES-RELAY-CONTROLLER-2026-09-22.md`, `OWNER-RULING-LANE-B-HERMES-RELAY-TAKEOVER-2026-09-22.md` |

---

## 9. Non-claims at this handoff

No DB contact · no LAB/Supabase/Auth/role/grant/dashboard access · no migration · no deploy ·
no secret persisted · no live mutation of any kind · `H3D-A1` / `H3D-LIVE` / `H3E` / `H4` not
started · BK01 Junction A not touched · the Codex review was **attempted and blocked**, so
**no review verdict exists** · `HOUSE-A` not reached · planning and execution branches were not
merged to manufacture a single SHA.

Gates re-run by Hermes at this handoff (execution branch, offline, no LAB):
`npm run selftest` exit 0 · `h3d/sql-static-check.mjs` exit 0 · `git diff --check` exit 0 ·
worktree clean afterwards.

`next-action: new session — re-measure and re-freeze the pair, clear the review-harness scope
blocker, then dispatch the single fresh Codex independent review`
