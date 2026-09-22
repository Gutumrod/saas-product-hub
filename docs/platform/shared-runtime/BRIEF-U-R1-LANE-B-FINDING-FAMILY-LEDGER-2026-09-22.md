# BRIEF — U-R1 LANE B FINDING-FAMILY LEDGER + SOURCE VERIFICATION

Date: 2026-09-22
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Unit: **U-R1** (first reconstruction unit, stage 1 of 2)
Authority: `OWNER-RULING-LANE-B-HERMES-RELAY-TAKEOVER-2026-09-22.md` §2, §3
Routing: canonical Agent Relay v2.5.3 via the Hermes Lane-B Relay controller
Execution mode: `LONG_RUN` / `STAGE_GRAPH`
Terminal state for this unit, and nothing stronger:
**`U-R1 COMPLETE — FINDING-FAMILY LEDGER READY FOR U-R2 RECONSTRUCTION`**

---

## 0. Where you work

| Field | Value |
|---|---|
| Workspace (write) | `D:\AI-Workspace\runtime\worktrees\house-lane-b-longrun-plan-20260922` |
| Branch | `work/house-lane-b-longrun-plan-20260922` |
| Base revision | `4c40883feed6dd56ddeb292c87a0a096dda7c303` (clean, remote parity exact at issue) |
| Read-only source (do NOT write) | `D:\AI-Workspace\runtime\worktrees\house-h3d-h5-20260909` @ `2b1af861aa608f08abb0bd8224821b9ca5ac9981` |
| `H3D_OUT_DIR` | must point outside every repo for any tool run |

The execution worktree is **read-only for this unit**. Open it for reading only. No write,
no checkout, no reset, no clean, no stash, no branch change.

## 1. Hard boundary — read before anything else

**No LAB access of any kind.** No DB connection, no Auth API call, no Dashboard action, no
role/credential creation, no DML/DDL — not even read-only measurement against LAB. Every
input for this unit is already on disk.

Do not: `git add .` / `git add -A`; force push; reset / clean / rebase; merge the planning
branch with the execution branch; touch `products/`, PS01, `migrations/*`,
`tools/shared-runtime/h4/h4-probe-harness.mjs`; run scaffolders; read or reference
`BILLING_DATABASE_URL` / `SUPABASE_DB_PASSWORD_WSTERA_LAB`; edit any `REVIEW-CODEX-*`,
`OWNER-*`, `STATUS-*`, `RUN-MANIFEST-*`, `ANALYSIS-*` or `BATCH-*` file.

### 1.1 Allowed write scope (only these paths)

- `docs/platform/shared-runtime/LEDGER-LANE-B-FINDING-FAMILIES-2026-09-22.md` **(new — the deliverable)**

Anything else → stop and report. Do not widen scope yourself.

## 2. What you must produce

One durable ledger at
`docs/platform/shared-runtime/LEDGER-LANE-B-FINDING-FAMILIES-2026-09-22.md`.

### 2.1 Required required-content markers (the stage gate checks these literally)

The file must contain **all** of these literal strings:

- `FAMILY-F1-EVIDENCE-PROVENANCE`
- `FAMILY-F2-EFFECTIVE-PRIVILEGE`
- `FAMILY-F3-NON-VACUOUS-CHECK`
- `FAMILY-F4-OPERATOR-ACTOR`
- `IF-01`, `IF-02`, `IF-03`, `IF-04`
- `DEFECT-02`, `DEFECT-03`, `DEFECT-05`, `DEFECT-06`, `DEFECT-08`
- `NEW-DEFECT-02`, `NEW-DEFECT-03`, `NEW-DEFECT-05`, `NEW-DEFECT-06`, `NEW-DEFECT-07`
- `NEW-DEFECT-08`, `NEW-DEFECT-09`
- `OPEN_SET_IS_FIVE`
- `STATUS_UNDERREPORTS_OPEN_SET`
- `BASELINE_2b1af861aa608f08abb0bd8224821b9ca5ac9981`
- `REPAIR_CAP_2_EXCEEDED_AT_REV3`

### 2.2 Required content

1. **Full enumeration of all 26 findings** from Codex rounds 1–4, each with: round, ID,
   severity, one-line substance, disposition history across subsequent rounds, and final
   state (`CLOSED` / `PARTIALLY CLOSED` / `OPEN`).

2. **Family assignment for every finding**, with the justification taken from the review
   text — not from the finding's title. Exactly one family per finding.

3. **Open set derived from Codex dispositions, not from `STATUS`.** The open set is
   `NEW-DEFECT-03`, `NEW-DEFECT-05`, `NEW-DEFECT-06`, `NEW-DEFECT-08`, `NEW-DEFECT-09`.
   Record explicitly that `STATUS-LANE-B-PRE-A1-CONTROLLER-PACKAGE-2026-09-22.md` §3 names
   only `NEW-DEFECT-08`/`-09` and therefore under-reports the real open set by three.

4. **Re-verification of each of the 5 open claims against the execution source at
   `2b1af861aa608f08abb0bd8224821b9ca5ac9981`**, with exact `file:line` citations. For each,
   classify: `STILL_TRUE` / `NO_LONGER_TRUE` / `CANNOT_EVALUATE_WITHOUT_LAB`.

5. **Correct citation source for the open claim set.** Read the current
   `CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md` from the **planning** branch (it is not present
   on the execution branch). Round-4 review's line references (e.g. `:263`, `:265`) were
   taken at reviewed SHA `675975b` and must be checked against the current tip, not copied.
   If a cited line no longer matches, say so and give the current location.

6. **Reproduce the four issue fingerprints** `IF-01`…`IF-04` with their full round history
   and per-fingerprint repair counters. For `IF-01`, record that ordinary repair **#3** was
   executed at `675975b`, which the circuit breaker (`§6`) does not permit — it allows at
   most two ordinary repairs before Codex classification. Emit the marker
   `REPAIR_CAP_2_EXCEEDED_AT_REV3`.

7. **Any claim inside the round reviews that is itself wrong** must be reported. Reviewers
   are not assumed correct. In particular, verify the round-4 assertion that the planning
   worktree was clean at the reviewed SHA — the round-4 review file was itself untracked at
   that time.

8. **A short statement of what U-R2 must reconstruct**, derived from this ledger — the
   family with the surviving root cause, and the six distinct layers the reconstructed
   contract has to separate (`catalog presence` / `object grant` / `schema USAGE` /
   `effective reach` / `RLS visibility` / `ownership capability`).

## 3. Evidence rules

- A claim with no command output behind it is not evidence. Every `file:line` citation must
  be produced by actually reading that file at that revision.
- Use `git -C <path>` / explicit revision reads. Do not assume a line number.
- Prefer `read_file` / `search_files` over ad-hoc shell for file inspection.
- Your report will be checked against the diff and against the cited lines.
- An earlier unit on this task reported changing a function it had not changed
  (`BATCH-H3D-S` §2). Do not repeat that.

## 4. Required gates before you return

- the deliverable exists at the exact path in §1.1;
- it contains every marker in §2.1;
- it contains all 26 findings;
- the 5 open findings each carry a `file:line` citation and a classification;
- `git diff --check` clean against the base revision;
- changed-file list ⊆ §1.1 — show it;
- `git status` clean apart from the single new deliverable.

## 5. Commit / push

**Do not commit. Do not push.** Hermes holds commit/push authority for this task
(`OWNER-RULING` §1) and performs the mechanical integration after the stage gate.
Leave the deliverable as an uncommitted new file and report its exact path.

## 6. What this unit does NOT do

- It does not patch `NEW-DEFECT-08`/`-09` or any other finding. No contract edits in U-R1.
- It does not modify `CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md`,
  `BRIEF-AGY-LANE-B-PRE-A1-FINDINGS-REMEDIATION-2026-09-22.md` or
  `VERIFICATION-H2-H4-CONSISTENCY-2026-09-22.md`. Those are U-R2's surface.
- It does not start `H3D-A1`, `H3D-LIVE`, `H3E`, `H4`, or touch Production / BK01.
- It does not create or assume a candidate revision. The candidate pair
  `(planning_sha, execution_sha)` is frozen in U-R3, not here.
- It does not codify a skill.
