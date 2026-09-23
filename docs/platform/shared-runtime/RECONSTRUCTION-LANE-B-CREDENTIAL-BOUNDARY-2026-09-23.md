# RECONSTRUCTION — LANE B CREDENTIAL / EFFECTIVE-PRIVILEGE BOUNDARY (U-R2)

Date: 2026-09-23
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Unit: **U-R2** — credential / effective-privilege contract reconstruction (stage 2 of 3)
`U-R2-RECONSTRUCTION`
Authority: `OWNER-RULING-LANE-B-HERMES-RELAY-TAKEOVER-2026-09-22.md` §2/§3;
Owner gate approval `OPENCODE_PROVIDER_AUTH_FIX_PERSISTENT / U-R2_ELIGIBLE = PASS`
Pinned runtime SoT: commit `931e3711f0fec19860be1e59769674a4981b7e4a`
Baseline: `BASELINE_2b1af861aa608f08abb0bd8224821b9ca5ac9981`
Execution mode: `LONG_RUN` / `STAGE_GRAPH`
Mutation: **NONE** to the execution source, LAB, Supabase, Auth, roles or secrets. No
commit, no push (brief §6: the controller performs mechanical integration).

Source-of-Truth References (read at the revisions stated):

1. `docs/platform/shared-runtime/BRIEF-U-R2-LANE-B-CONTRACT-RECONSTRUCTION-2026-09-23.md`
2. `docs/platform/shared-runtime/LEDGER-LANE-B-FINDING-FAMILIES-2026-09-22.md` (U-R1)
3. `docs/platform/shared-runtime/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md` (reconstructed by this unit)
4. `docs/platform/shared-runtime/OWNER-RULING-LANE-B-HERMES-RELAY-TAKEOVER-2026-09-22.md` §3
5. `docs/platform/shared-runtime/REVIEW-CODEX-LANE-B-CONTROLLER-PACKAGE-ROUND3-2026-09-22.md` (`c6c5467`)
6. `docs/platform/shared-runtime/REVIEW-CODEX-LANE-B-CONTROLLER-PACKAGE-ROUND4-2026-09-22.md` (`675975b`)
7. `docs/platform/shared-runtime/BACKLOG-LANE-B-FOLLOWUP-HARDENING-2026-09-23.md` (FU-01..04, non-blocking)
8. Execution source at `2b1af861aa608f08abb0bd8224821b9ca5ac9981`,
   `D:\AI-Workspace\runtime\worktrees\house-h3d-h5-20260909`:
   - `docs/platform/shared-runtime/evidence/H1-EFFECTIVE-PRIVILEGE-INVENTORY-2026-09-08.md`
   - `docs/platform/shared-runtime/fixtures/h3d-authz-fixture-teardown.sql`
   - `tools/shared-runtime/h3d/h3d-live-runner.mjs`

## 0. Terminal state, and nothing stronger

```text
U-R2 COMPLETE — CONTRACT RECONSTRUCTED, READY FOR U-R3 EXECUTABLE CHECKS
```

## 1. Marker index (required evidence)

| Marker | Present | Where |
|---|---|---|
| `U-R2-RECONSTRUCTION` | yes | this file, §0/§1 |
| `SIX-LAYERS-SEPARATED` | yes | strategy §1b; this file §2 |
| `EFFECTIVE-REACH-VS-CATALOG-INVENTORY` | yes | strategy §3.1; this file §3 |
| `NO-BARE-RELNAME` | yes | strategy §3.0/§3; this file §4 |
| `EXECUTABLE-PROBE-CONTRACT` | yes | strategy §3b; this file §5 |
| `OPEN-FINDINGS-ADDRESSED-BY-NAME` | yes | strategy §9; this file §6 |
| `BASELINE_2b1af861aa608f08abb0bd8224821b9ca5ac9981` | yes | this file header/§8 |

## 2. `SIX-LAYERS-SEPARATED` — the model that replaced the declared-grant list

The repeated defect was one model error surviving four revisions: privilege modelled as
a **declared grant list** instead of a **reachability relation**. U-R2 replaces the model
in the strategy (§1b) with six explicitly separated, individually asserted, individually
falsifiable layers:

```text
catalog presence (L1)  !=  object grant (L2)  !=  schema USAGE (L3)  !=  effective reach (L4)
                       !=  RLS visibility (L5)  !=  ownership capability (L6)
```

Layer → catalog source → assertion primitive → falsifier is tabulated in strategy §1b.
The two binding consequences are stated there: `has_table_privilege` answers **L2, not
L4** (reach is L2 ∧ L3 on the same qualified object), and `has_schema_privilege` answers
**L3, not L4**. Every window-open check in strategy §3 carries a "Layer asserted (of the
six)" column; the two non-privilege rows (target = provenance; identity = session) are
labelled as asserting no layer, and the connection-level read-only probe is labelled a
diagnostic that asserts no layer.

## 3. `EFFECTIVE-REACH-VS-CATALOG-INVENTORY` — two separate labelled contracts

Strategy §3.1 states both contracts, separately, as required (`OWNER-RULING` §3;
`NEW-DEFECT-09`):

- **Contract A — effective-reach assertion:** schema-qualified relation identity
  (`nspname.relname`) or OID, the schema `USAGE` (L3) distinction, and the object
  privilege set (L2) for that exact relation; reach asserted as L2 ∧ L3.
- **Contract B — catalog-surface inventory:** what exists in the catalog (L1); never
  described as effective reach and never used to conclude about L4.

They are **not alternatives** — both exist and each assertion chooses one explicitly.
The accepted-exposure verification is therefore two rows, not one: "accepted exposure —
effective reach (Contract A)" and "accepted exposure — catalog-surface inventory
(Contract B)". Concretely, the `net` objects are effective reach (L3 schema `USAGE` is
`PUBLIC`), while `cron.job` / `cron.job_run_details` carry L2 object grants but are not
effective reach (L3 schema `cron` `USAGE` is not held — `H1-…:81-85`); the reconstruction
classifies them into Contract B. A change in that classification (e.g. `cron` `USAGE`
measuring true) STOPs the window rather than being silently accepted.

## 4. `NO-BARE-RELNAME` — qualified identity or OID in every reconstructed check

Strategy §3.0 gives the shared primitive. The catalog enumeration returns `c.oid` **and**
`(n.nspname, c.relname)`; the exception relation is matched by
`n.nspname = 'wstera_platform_internal' AND c.relname = 'runtime_token_grants'` (or its
resolved OID); every privilege primitive receives the OID
(`has_table_privilege(current_user, c.oid, p)`, `has_sequence_privilege(current_user,
c.oid, p)`). Sequence (`S`) and foreign-table (`f`) enumeration is stated separately from
tables (`r`/`p`) so the "every relation" claims are complete (`NEW-DEFECT-06`). The
superseded round-4 defect string `r = 'wstera_platform_internal.runtime_token_grants'` is
absent (gate G5, exit 1 = not found). A new gate `G-NO-BARE-RELNAME` (§6 of the strategy)
makes the property a selftest, not a hope.

## 5. `EXECUTABLE-PROBE-CONTRACT` — bounded, guaranteed teardown (closes NEW-DEFECT-05)

Strategy §3b is now code, not prose. It matches the **real teardown** exactly:

| Bound | Probe value | Real teardown (`fixtures/h3d-authz-fixture-teardown.sql`) |
|---|---|---|
| `lock_timeout` | `'4s'` | `:21` `SET LOCAL lock_timeout = '4s'` |
| `statement_timeout` | `'30s'` | `:22` `SET LOCAL statement_timeout = '30s'` |
| `idle_in_transaction_session_timeout` | `'30s'` | `:23` `SET LOCAL idle_in_transaction_session_timeout = '30s'` |

The round-4 gap — `client.connect()` outside the guard — is fixed by moving the connect
**inside** `withRoleSession`, whose outer `finally` calls a bounded `endGuaranteed(client)`
on **every** path: success, `42501`, `55P03`/`57014` timeout abort, an unexpected rethrow,
**and a throw from `client.connect()`**. Harmlessness is a property of the code
(session termination + `ROLLBACK`, with server-side transaction abort on disconnect as
the fallback), not a prose assertion.

## 6. `OPEN-FINDINGS-ADDRESSED-BY-NAME` — all five, by name

The real open set (`LEDGER` §5, `OPEN_SET_IS_FIVE`) is
`NEW-DEFECT-03 · NEW-DEFECT-05 · NEW-DEFECT-06 · NEW-DEFECT-08 · NEW-DEFECT-09`.
Each is addressed by name in the reconstructed strategy:

| Finding | Family | Strategy location | One-line resolution |
|---|---|---|---|
| `NEW-DEFECT-03` | F2 | §3 "no real-table write privilege"; §1a inv. 5 | all four write privileges retained on the forbidden product/data universe, accepted surfaces excluded |
| `NEW-DEFECT-05` | F3 | §3b | executable probe; matching 4s/30s bounds; connect inside the guaranteed-teardown wrapper |
| `NEW-DEFECT-06` | F2 | §1a; §3 forbidden-reach row; §3.0 | non-filtered `pg_catalog` enumeration over `r/p/S/f`; full negative privilege set on every non-exception relation; exact positive/negative set on the exception |
| `NEW-DEFECT-08` | F2 | §3.0; §3 forbidden-reach row | qualified identity/OID everywhere; no bare `relname` comparison remains |
| `NEW-DEFECT-09` | F2 | §3.1; §3 accepted-exposure rows | effective reach and catalog inventory stated as two separate labelled contracts |

`NEW-DEFECT-07` (CLOSED at round 4) stays closed: the accepted `cron`/`net` surfaces are
kept out of the forbidden-write set. The F2 model error is replaced, not isolated-patched.

## 7. Invariants preserved unchanged

- **H2 `NOLOGIN` product roles** — strategy §1 inv. 1: product roles
  (`ps01_line_runtime`, `ps01_runtime*`, `h4_runtime`, `h4_migrator`) stay `NOLOGIN`; no
  Lane-B step issues a password to them; no product-direct LOGIN. Preserved verbatim.
- **No class P on the agent side** — strategy §1 (class P row), §2 ("The agent-held
  surfaces are therefore only **M**, **W**, **A** and **T**. Class **P** never leaves the
  dashboard."), and gate `G-NO-P-ON-AGENT` (§6). Preserved unchanged.
- No secret value in config, repo, artifact, log, or command arguments (strategy §1
  inv. 2–3; gate `G-NO-SECRET-AT-REST`).
- No LAB/role/Auth mutation in this unit (header).

## 8. Stage gates — commands and literal exit codes

All commands read-only; run from the planning worktree
`D:\AI-Workspace\runtime\worktrees\house-lane-b-longrun-plan-20260922`.

| Gate | Command | Result | Exit |
|---|---|---|---|
| G1 execution baseline is the expected SHA | `git -C "D:/…/house-h3d-h5-20260909" rev-parse HEAD` | `2b1af861aa608f08abb0bd8224821b9ca5ac9981` | `0` |
| G1b execution worktree clean | `git -C "D:/…/house-h3d-h5-20260909" status --porcelain -b` | `## work/house-h3d-h5-20260909...origin/work/house-h3d-h5-20260909` (no file entries) | `0` |
| G2 changed-file list | `git status --porcelain` | the two declared deliverables below | `0` |
| G3 whitespace / conflict check | `git diff --check` | clean (only a CRLF notice) | `0` |
| G4 five findings named in the strategy | `grep -c -E 'NEW-DEFECT-(03\|05\|06\|08\|09)' …CREDENTIAL-STRATEGY…` | 17 matches | `0` |
| G5 superseded bare-relname defect string absent | `grep -n "r = 'wstera_platform_internal.runtime_token_grants'" …` | no match | `1` (expected) |
| G6 probe bounds present and matched | `grep -n "statement_timeout = '30s'\|lock_timeout = '4s'\|idle_in_transaction_session_timeout = '30s'" …` | 4s + 30s + 30s present (strategy §3b) | `0` |
| G7 H2 invariants present | `grep -n "stay \`NOLOGIN\`\|never leaves the dashboard" …` | present (§1 inv. 1; §2) | `0` |
| G8 six layer tokens present | `grep -c "L1 — catalog presence" …` … `"L6 — ownership capability"` | all six present | `0` |
| G9 required markers in the strategy | `grep -c` per marker | `SIX-LAYERS-SEPARATED`, `EFFECTIVE-REACH-VS-CATALOG-INVENTORY`, `NO-BARE-RELNAME`, `EXECUTABLE-PROBE-CONTRACT`, `OPEN-FINDINGS-ADDRESSED-BY-NAME`, `BASELINE_2b1af86…` present | `0` |
| G10 required markers in this record | `grep -c` per marker over this file | all seven present | `0` |

### 8.1 Exact changed-file list (must be ⊆ brief §1.1)

```text
docs/platform/shared-runtime/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md            (reconstructed in place)
docs/platform/shared-runtime/RECONSTRUCTION-LANE-B-CREDENTIAL-BOUNDARY-2026-09-23.md   (new — this record)
```

`docs/platform/shared-runtime/BRIEF-AGY-LANE-B-PRE-A1-FINDINGS-REMEDIATION-2026-09-22.md`
(brief §1.1 third allowed path) is **unchanged**: its §5 references
`CREDENTIAL-STRATEGY` §3/§6 generically and none of its text was made false by the
reconstruction (the runbook/gate names it cites are unchanged), so no edit was required.
No other file was created, modified, staged, committed or deleted.

## 9. What this unit does not do

- It does not patch `NEW-DEFECT-08`/`-09` in isolation; it replaces the F2 model.
- It does not touch `tools/**`; executable checks and runbooks are **U-R3**.
- It does not start `H3D-A1`, `H3D-LIVE`, `H3E`, `H4`; it does not touch Production or
  BK01 (brief §7).
- It does not freeze the candidate pair `(planning_sha, execution_sha)` — that is U-R3.
- It does not codify a skill.
- It does not commit or push (brief §6).

## 10. Terminal state

```text
U-R2 COMPLETE — CONTRACT RECONSTRUCTED, READY FOR U-R3 EXECUTABLE CHECKS
```

`next-action: release U-R3 (executable checks + runbooks, tools/**, planning branch)`
