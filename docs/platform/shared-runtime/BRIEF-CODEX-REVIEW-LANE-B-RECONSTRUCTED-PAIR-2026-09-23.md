# BRIEF — CODEX INDEPENDENT REVIEW, LANE B RECONSTRUCTION (FROZEN PAIR)

Date: 2026-09-23
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Review kind: **independent** — this is the single fresh review of a reconstructed package,
NOT a continuation of the four-round patch loop (that loop is DISABLED).
Authority: `SOL_DECISION_GATES_LOCKED` (Owner-approved 2026-09-23); contract §6
Context mode: `INDEPENDENT-QA`
Terminal output form, first line, exactly one of:
`LANE_B_PAIR_VERDICT=PASS` · `LANE_B_PAIR_VERDICT=REMEDIATE` · `LANE_B_PAIR_VERDICT=BLOCK`

---

## 1. Exact inputs — immutable bound pair

```text
planning_sha  = 74db7cc  (work/house-lane-b-longrun-plan-20260922)
execution_sha = 54327b1459bdecff1d00b19ca3b8099c5fc4f09a  (work/house-h3d-h5-20260909)
repo          = github.com/Gutumrod/saas-product-hub
```

Both branches have remote parity EXACT and clean worktrees at those revisions.

**Independence rule.** The review binds to **both** SHAs. It is your review, on the current
content — no prior round's conclusions transfer. If you mutate anything, you cannot approve it;
return `REMEDIATE` with the new SHA.

## 2. What is under review

A reconstructed **credential / effective-privilege boundary contract** for the House shared
runtime, and its **executable implementation**, produced to close five findings that survived
four FAIL review rounds under the old, now-disabled loop.

### 2.1 Contract (planning branch)

- `docs/platform/shared-runtime/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md` (REV5, reconstructed)
- `docs/platform/shared-runtime/RECONSTRUCTION-LANE-B-CREDENTIAL-BOUNDARY-2026-09-23.md`
- `docs/platform/shared-runtime/LEDGER-LANE-B-FINDING-FAMILIES-2026-09-22.md` (the finding ledger)

### 2.2 Executable checks (execution branch)

- `tools/shared-runtime/lib/six-layer-privileges.mjs`
- `tools/shared-runtime/lib/provenance.mjs`
- `tools/shared-runtime/lib/probe-contract.mjs`
- `tools/shared-runtime/h3d/lane-b-gates.mjs`
- `tools/shared-runtime/h3d/generate-runbooks.mjs`
- `tools/shared-runtime/inventory/lane-b-effective-reach.mjs`
- `docs/platform/shared-runtime/runbooks/**` (8 role create/teardown runbooks)
- `docs/platform/shared-runtime/fixtures/lane-b-per-stage-allowlist.json`
- `docs/platform/shared-runtime/evidence/LANE-B-U-R3-EXECUTABLE-CHECKS-2026-09-23.md`

## 3. The five findings this reconstruction must close

The real open set (**not** the two named in `STATUS-…`, which under-reports it):

```text
NEW-DEFECT-03   forbidden-write check tested only INSERT (not all four write privileges)
NEW-DEFECT-05   trigger-DDL probe harmlessness was prose, not an executable contract
NEW-DEFECT-06   H3D-LIVE exception gate could not prove an exhaustive object boundary
NEW-DEFECT-08   H3D-LIVE relation checks returned a bare relname; qualified exception could not match
NEW-DEFECT-09   accepted-exposure query conflated catalog presence with effective reach
```

**Root cause being corrected:** the contract modelled privilege as a **declared grant list**
when the measured truth is a **reachability relation** over qualified objects, schema `USAGE`,
ownership capability and RLS visibility. `DEFECT-02 → NEW-DEFECT-02 → NEW-DEFECT-06 →
NEW-DEFECT-08/09` is one model error surviving four revisions.

## 4. What to verify — independently, from source, not from the documents' claims

1. **Six separated layers.** Catalog presence ≠ object grant ≠ schema `USAGE` ≠ effective reach
   ≠ RLS visibility ≠ ownership capability. Check each is separately asserted and separately
   falsifiable, and that **reach is computed as `object grant ∧ schema USAGE` on the same
   qualified object** — never inferred from one alone.
2. **No bare `relname`.** Every relation addressed by OID or the exact `(nspname, relname)`
   pair; `has_table_privilege` receives the OID. Verify `G-NO-BARE-RELNAME` actually catches
   the old pattern (try to defeat it).
3. **Effective-reach vs catalog-inventory are two separate, labelled contracts.** Verify
   neither path is used to conclude about the other (`NEW-DEFECT-09`).
4. **Per-stage allowlist single source.** The forbidden-reach gate consumes the contract's
   per-stage table as its **only** allowlist; find any second constant list.
5. **All four write privileges** (`INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`) on the forbidden
   product/data universe, with accepted `cron`/`net` exposure, `ps01_internal` ownership reach
   and the named exception correctly **excluded** from that universe.
6. **Enumeration not privilege-filtered** (`pg_catalog`, not `information_schema.tables`),
   covering `r/p/S` with sequences/foreign tables handled by their own privilege primitives.
7. **Executable probe contract** (`NEW-DEFECT-05`): `connect()` inside the guarded scope; a
   `finally` that terminates the session on **every** path including a throw from
   `client.connect()`; bounds matching the real teardown (`lock_timeout='4s'`,
   `statement_timeout='30s'`, `idle_in_transaction_session_timeout='30s'`); timeout codes
   classified `UNMEASURED`, not silently pass/fail.
8. **Runbooks**: every `GRANT` mirrored by exactly one `REVOKE`; **no `DROP OWNED BY`**.
9. **Falsification controls**: for each new check, a negative control that fails if the logic
   is removed. Confirm the controls are real, not vacuous.
10. **Invariants preserved**: H2 `NOLOGIN` product roles; no product-direct DB LOGIN; no class
    **P** (LAB `postgres`) on the agent side; no secret in repo/artifact/log.
11. **Evidence honesty**: every `LIVE_DEFERRED_TO_A1_PREFLIGHT` item must be genuinely
    deferred and **not** described as live-verified. Check for any claim the diff does not
    support.

## 5. What to check for, specifically — past failure modes on this task

These are the documented ways this package previously went wrong. Check for each:

- a check that **cannot fail** (vacuous) or that passes when its logic is removed;
- **claim-vs-reality** mismatches: a document asserting something the source does not do
  (a prior unit reported changing a function it had not changed; another asserted a live verify
  that had only been recomputed offline);
- a fix in one place that leaves the **same defect family** alive one layer down;
- accepted exposure described as **absent** rather than as accepted + bounded + re-measured;
- a relation addressed by bare name, or a schema `USAGE` distinction silently skipped;
- an executable contract that is still **prose** in the file that matters.

## 6. Gates you may reproduce (read-only / offline)

```bash
cd <execution worktree>/tools/shared-runtime
npm run selftest                                   # expected exit 0
node ../tools/shared-runtime/h3d/sql-static-check.mjs   # expected exit 0
git diff --check                                   # expected exit 0
```

**No LAB access.** Do not connect to LAB, Supabase, Auth, or any live database. Everything
here is offline-verifiable; live items are marked deferred by design.

## 7. Constraints

- You may apply **bounded fixes**, but then you cannot approve the revision you mutated:
  return `REMEDIATE` with the new SHA and what you changed.
- Do not widen scope, do not touch the planning branch, do not touch `migrations/*`,
  `products/`, PS01, or `tools/shared-runtime/h4/h4-probe-harness.mjs`.
- No secret may appear in your output.

## 8. Required response shape

```text
LANE_B_PAIR_VERDICT=PASS|REMEDIATE|BLOCK
reviewed pair: planning <sha> / execution <sha>
mutation: none | <exact files + new sha>
findings: <id, severity, file:line, evidence, required fix>  (or "none")
checks reproduced: <command -> literal exit code>
untested / deferred: <list>
```

`PASS` requires that you verified the substance yourself, not that the documents assert it.
