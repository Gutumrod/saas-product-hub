# BRIEF — U-R2 LANE B CREDENTIAL / EFFECTIVE-PRIVILEGE CONTRACT RECONSTRUCTION

Date: 2026-09-23
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Unit: **U-R2** (reconstruction unit, stage 2 of 3)
Authority: `OWNER-RULING-LANE-B-HERMES-RELAY-TAKEOVER-2026-09-22.md` §2/§3; Owner gate
approval `OPENCODE_PROVIDER_AUTH_FIX_PERSISTENT / U-R2_ELIGIBLE = PASS`
Inputs: `LEDGER-LANE-B-FINDING-FAMILIES-2026-09-22.md` (U-R1, complete)
Pinned runtime SoT: commit `931e3711f0fec19860be1e59769674a4981b7e4a`
Execution mode: `LONG_RUN` / `STAGE_GRAPH`
Terminal state, and nothing stronger:
**`U-R2 COMPLETE — CONTRACT RECONSTRUCTED, READY FOR U-R3 EXECUTABLE CHECKS`**

---

## 0. Where you work

| Field | Value |
|---|---|
| Workspace (write) | `D:\AI-Workspace\runtime\worktrees\house-lane-b-longrun-plan-20260922` |
| Branch | `work/house-lane-b-longrun-plan-20260922` |
| Base revision | `931e3711f0fec19860be1e59769674a4981b7e4a` (+ the U-R2 brief commit) |
| Read-only source (do NOT write) | `D:\AI-Workspace\runtime\worktrees\house-h3d-h5-20260909` @ `2b1af861aa608f08abb0bd8224821b9ca5ac9981` |
| `H3D_OUT_DIR` | must point outside every repo for any tool run |

The execution worktree is **read-only for this unit**. No write, no checkout, no reset.

## 1. Hard boundary — read before anything else

**No LAB access of any kind.** No DB connection, no Auth API call, no Dashboard action, no
role/credential creation, no DML/DDL — not even read-only measurement against LAB. Every
input is already on disk.

Do not: `git add .` / `git add -A`; force push; reset / clean / rebase; merge the planning
branch with the execution branch; touch `products/`, PS01, `migrations/*`,
`tools/shared-runtime/h4/h4-probe-harness.mjs`; run scaffolders; read or reference
`BILLING_DATABASE_URL` / `SUPABASE_DB_PASSWORD_WSTERA_LAB`; edit any `REVIEW-CODEX-*`,
`OWNER-*`, `STATUS-*`, `RUN-MANIFEST-*`, `ANALYSIS-*`, `BATCH-*`, or the U-R1 ledger.

### 1.1 Allowed write scope (only these paths)

- `docs/platform/shared-runtime/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md` **(reconstruct in place)**
- `docs/platform/shared-runtime/RECONSTRUCTION-LANE-B-CREDENTIAL-BOUNDARY-2026-09-23.md` **(new — the record of change)**
- `docs/platform/shared-runtime/BRIEF-AGY-LANE-B-PRE-A1-FINDINGS-REMEDIATION-2026-09-22.md`
  (only where the reconstructed contract requires the brief to change)

Anything else → stop and report. Do not widen scope yourself.

## 2. What is wrong — the surviving root cause (from U-R1 §9)

The repeated defect is one **model error surviving four revisions**. The contract models
privilege as a **declared grant list** when the measured truth is a **reachability relation
over qualified objects, schema `USAGE`, ownership capability, and RLS visibility**.

The open findings that must all be closed by this reconstruction:

| Finding | Family | Substance |
|---|---|---|
| `NEW-DEFECT-03` | F2 | the forbidden-write check tests only `INSERT`, not all four write privileges |
| `NEW-DEFECT-06` | F2 | the `H3D-LIVE` exception gate cannot prove an exhaustive object boundary (privilege-filtered enumeration) |
| `NEW-DEFECT-08` | F2 | `H3D-LIVE` relation checks return a bare `relname`; the qualified exception cannot match reliably |
| `NEW-DEFECT-09` | F2 | the accepted-exposure positive query conflates catalog presence with effective reach |
| `NEW-DEFECT-05` | F3 | the trigger-DDL probe's harmlessness is prose, not an executable guaranteed-rollback contract |

**Do NOT patch `NEW-DEFECT-08`/`-09` in isolation.** The whole F2 model is replaced.

## 3. Required reconstruction

### 3.1 Six layers, separately asserted and separately falsifiable

The reconstructed contract must distinguish explicitly, as **separate, individually
asserted, individually falsifiable** layers — never collapsed into one another:

```text
catalog presence  !=  object grant  !=  schema USAGE  !=  effective reach
                  !=  RLS visibility  !=  ownership capability
```

Every gate must name which layer it asserts. A gate that reads one layer and concludes about
another is the defect being reconstructed.

### 3.2 Two separate, labelled contracts — never conflated

State and label **both** of these as distinct contracts:

1. **effective-reach assertion** — schema-qualified relation identity (`nspname.relname`) or
   relation OID; the schema `USAGE` distinction; the object privilege set for that exact
   relation;
2. **catalog-surface inventory** — what exists in the catalog, **never described as
   effective reach**.

`NEW-DEFECT-09` requires choosing one contract explicitly per assertion. The Owner ruling
(§3) requires **both to exist**, separately labelled — they are not alternatives, and
conflating them was the defect.

### 3.3 Mandatory specific corrections

| # | Correction | From |
|---|---|---|
| C1 | No check may compare a bare `relname`. Address relations by qualified identity or OID, and call `has_table_privilege` with that identity. | `NEW-DEFECT-08` |
| C2 | The `H3D-LIVE` allowed relation must assert `SELECT/INSERT/DELETE = true` **and** `UPDATE/TRUNCATE/REFERENCES/TRIGGER = false` on that exact relation; every other enumerated relation asserts all seven `false`. | `NEW-DEFECT-06` |
| C3 | Enumeration of a target schema must come from a **non-privilege-filtered** catalog source (`pg_catalog`, not `information_schema.tables`), covering `r/p/S`, with foreign tables and sequences enumerated separately wherever the text claims "every relation". | `NEW-DEFECT-06` |
| C4 | The forbidden-write universe is **product/data relations only**, explicitly excluding accepted `cron`/`net` exposure, `ps01_internal` ownership reach, and the stage's named exception — while retaining **all four** of `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE` for genuinely forbidden relations. | `NEW-DEFECT-03`, `NEW-DEFECT-07` |
| C5 | The §3a trigger-DDL probe must be an **executable contract**, not prose: bounded `lock_timeout` **and** `statement_timeout` matching the real teardown's `30s`, and a wrapper that guarantees session termination on **every** path including a failure *inside* `client.connect()`. | `NEW-DEFECT-05` |
| C6 | Per-stage exception table remains the **sole** allowlist source consumed by the forbidden-reach gate — no second constant list anywhere. | R3/R4 |
| C7 | Accepted `cron`/`net` exposure is asserted as an exact qualified set via **effective reach** (schema `USAGE` included), described as accepted + bounded + re-measured — never as absent. | §8 / credential strategy §1a inv. 5 |

### 3.4 Invariants that must survive unchanged

- H2 `NOLOGIN` product roles; no product-direct DB LOGIN; no reusable product credential.
- No class **P** (LAB `postgres`) on the agent side.
- No LAB/role/Auth mutation in this unit.
- Secret values never in config, repo, artifact, log, or command arguments.

## 4. Evidence rules

- A claim with no command output behind it is not evidence. Every `file:line` citation must
  come from actually reading that file at that revision.
- The contract file lives on the **planning** branch; the source it gates lives on the
  **execution** branch at `2b1af86`. State which you are citing.
- Any check you add must be **falsifiable**: state the concrete wrong situation it would
  reject. A check that cannot fail is not a check.
- Your report will be checked against the diff and the cited lines.

## 5. Required gates before you return

- deliverable paths exist exactly as in §1.1;
- every one of the five open findings is addressed by name in the reconstructed contract;
- no bare-`relname` comparison remains in any reconstructed check;
- every reconstructed check states which of the six layers it asserts;
- `git diff --check` clean against the base revision;
- changed-file list ⊆ §1.1 — show it;
- `git status` clean apart from the declared deliverables.

## 6. Commit / push

**Do not commit. Do not push.** The controller performs the mechanical integration after the
stage gate.

## 7. What this unit does NOT do

- It does not patch findings one at a time; it replaces the F2 model.
- It does not touch `tools/**` — executable checks and runbooks are **U-R3**.
- It does not start `H3D-A1`, `H3D-LIVE`, `H3E`, `H4`; it does not touch Production or BK01.
- It does not freeze the candidate pair `(planning_sha, execution_sha)` — that is U-R3.
- It does not codify a skill.
