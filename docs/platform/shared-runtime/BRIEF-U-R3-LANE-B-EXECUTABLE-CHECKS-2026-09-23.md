# BRIEF — U-R3 LANE B EXECUTABLE CHECKS + RUNBOOKS (EXECUTION BRANCH)

Date: 2026-09-23
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Unit: **U-R3** (stage 3 of 3 before review)
Authority: Owner instruction — run through U-R3 → freeze pair → Codex review → closure
Inputs: `CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md` REV5 (U-R2, planning branch),
`RECONSTRUCTION-LANE-B-CREDENTIAL-BOUNDARY-2026-09-23.md`, `LEDGER-…` (U-R1)
Execution mode: `LONG_RUN` / `STAGE_GRAPH`
Terminal state, and nothing stronger:
**`U-R3 COMPLETE — EXECUTABLE CHECKS + RUNBOOKS LANDED; READY FOR CANDIDATE PAIR FREEZE`**

---

## 0. Where you work

| Field | Value |
|---|---|
| Workspace (write) | `D:\AI-Workspace\runtime\worktrees\house-h3d-h5-20260909` |
| Branch | `work/house-h3d-h5-20260909` |
| Base revision | `2b1af861aa608f08abb0bd8224821b9ca5ac9981` (clean, remote parity exact) |
| Contract source (READ-ONLY) | `D:\AI-Workspace\runtime\worktrees\house-lane-b-longrun-plan-20260922` @ `b80f813` |
| PS01 worktree | untouched — do not open it for writing |
| `H3D_OUT_DIR` | must point outside the repo for any tool run |

This unit writes on the **execution branch**. The contract you implement lives on the
**planning branch** — read it from there; do not copy it here.

## 1. Hard boundary

**No LAB access of any kind.** No DB connection, no Auth API call, no Dashboard action, no
role/credential creation, no DML/DDL. Every test in this unit is **offline**. A test that
would need LAB is written and marked `LIVE_DEFERRED_TO_A1_PREFLIGHT` — it is not run.

Do not: `git add .` / `git add -A`; force push; reset / clean / rebase; merge branches;
touch `products/`, PS01, `migrations/*`, `tools/shared-runtime/h4/h4-probe-harness.mjs`; run
scaffolders; read or reference `BILLING_DATABASE_URL` / `SUPABASE_DB_PASSWORD_WSTERA_LAB`.

### 1.1 Allowed write scope (only these paths)

- `tools/shared-runtime/lib/**` **(new — shared helpers, including the six-layer privilege
  primitives and the target/provenance helper)**
- `tools/shared-runtime/h3d/**`
- `tools/shared-runtime/inventory/**`
- `tools/shared-runtime/package.json` (script entries only; **no new dependency**)
- `docs/platform/shared-runtime/runbooks/**` (new)
- `docs/platform/shared-runtime/fixtures/**`
- `docs/platform/shared-runtime/evidence/LANE-B-U-R3-EXECUTABLE-CHECKS-2026-09-23.md` (new)

Anything else → stop and report.

## 2. What you must implement

The reconstructed contract (planning branch `b80f813`) is the specification. Implement it as
**executable checks** on this branch, offline.

### 2.1 Required content markers (the stage gate checks these literally)

The U-R3 evidence file must contain all of:

- `U-R3-EXECUTABLE-CHECKS`
- `SIX-LAYER-PRIMITIVES`
- `NO-BARE-RELNAME-GATE`
- `EFFECTIVE-REACH-AND-CATALOG-INVENTORY-SPLIT`
- `EXECUTABLE-PROBE-CONTRACT-IMPLEMENTED`
- `PER-STAGE-ALLOWLIST-CONSUMED`
- `LIVE_DEFERRED_TO_A1_PREFLIGHT`

### 2.2 Required implementation

1. **Six-layer privilege primitives.** One shared module under `tools/shared-runtime/lib/`
   exposing the six layers as distinct, separately-callable assertions
   (`catalog presence` / `object grant` / `schema USAGE` / `effective reach` /
   `RLS visibility` / `ownership capability`). Reach must be computed as
   `object grant ∧ schema USAGE` on the same qualified object — never inferred from either
   alone. Each primitive documents which layer it answers. `SIX-LAYER-PRIMITIVES`.

2. **No bare-`relname` gate.** Every relation is addressed by `c.oid` or by the exact pair
   `(n.nspname, c.relname)`. Add a source-level gate `G-NO-BARE-RELNAME` that scans the
   in-scope tool sources and fails if a reconstructed check compares a bare `relname`.
   `NO-BARE-RELNAME-GATE`.

3. **Two separate labelled contracts.** An **effective-reach assertion** and a
   **catalog-surface inventory** must exist as two distinct functions/paths, and neither may
   be used to conclude about the other. `EFFECTIVE-REACH-AND-CATALOG-INVENTORY-SPLIT`.

4. **Per-stage allowlist consumed from the contract only.** The forbidden-reach check reads
   the per-stage exception table (contract §1a) as its **sole** allowlist source — no second
   constant list in code. `PER-STAGE-ALLOWLIST-CONSUMED`.

5. **Executable probe contract.** Implement the guaranteed-teardown wrapper exactly as the
   contract §3b specifies: `client.connect()` **inside** the guarded scope; `finally` always
   terminates the session (bounded); bounds `lock_timeout='4s'`, `statement_timeout='30s'`,
   `idle_in_transaction_session_timeout='30s'`; timeout codes classify as `UNMEASURED`;
   unexpected errors rethrow but still tear down. `EXECUTABLE-PROBE-CONTRACT-IMPLEMENTED`.

6. **Runbooks** under `docs/platform/shared-runtime/runbooks/`: role create/teardown pairs
   per contract §3, with the mirrored `REVOKE` list and **no `DROP OWNED BY`**. Files only —
   **not executed**.

7. **Falsification selftests.** For every check above, a negative control that would fail if
   the check's logic were removed. Each must be demonstrated to fail under mutation, in a
   **test run only** (never committed).

8. **`LIVE_DEFERRED_TO_A1_PREFLIGHT`.** Everything that genuinely needs LAB is written,
   marked, and **not run**.

### 2.3 Required gates before you return

- `npm run selftest` (in `tools/shared-runtime`) PASS, including every new negative control;
- `node tools/shared-runtime/h3d/sql-static-check.mjs` PASS;
- `git diff --check 2b1af86..HEAD` clean;
- blocking secret scan over diff + evidence = 0;
- changed-file list ⊆ §1.1 — show it;
- write-scope self-check passes;
- every `LIVE_DEFERRED` item listed explicitly.

## 3. Evidence and honesty rules

- A claim with no command output behind it is not evidence. Record literal exit codes.
- Your report will be checked against the diff line by line. An earlier unit on this task
  reported changing a function it had not changed. Do not repeat that.
- Do not describe an offline selftest as live-verified.

## 4. Commit / push

**Do not commit. Do not push.** The controller performs mechanical integration and the
candidate-pair freeze after the stage gate.

## 5. What this unit does NOT do

- It does not touch the planning branch or the contract text.
- It does not start `H3D-A1`, `H3D-LIVE`, `H3E`, `H4`; does not touch Production or BK01.
- It does not run anything against LAB.
- It does not freeze the candidate pair — the controller does that after this gate.
- It does not codify a skill.
