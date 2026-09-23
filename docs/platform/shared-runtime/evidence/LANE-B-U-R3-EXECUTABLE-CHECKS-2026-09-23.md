# EVIDENCE — U-R3 LANE-B EXECUTABLE CHECKS + RUNBOOKS

Date: 2026-09-23
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Unit: **U-R3** (stage 3 of 3 before review)
Workspace: `D:\AI-Workspace\runtime\worktrees\house-h3d-h5-20260909`
Branch: `work/house-h3d-h5-20260909`
Head at execution: `b8a8f47e0ac04194dbfb6761c439f0ad5c0e8a33` (brief commit — see §8 note on the brief's `2b1af86` base label)
Contract source (read-only): planning branch `work/house-lane-b-longrun-plan-20260922` @ `b80f813050cb57457b4e31504e4a14720878d169`
Pinned runtime SoT: `931e3711f0fec19860be1e59769674a4981b7e4a`
Marker: `U-R3-EXECUTABLE-CHECKS`

This file records what was built, the literal gate results, and exactly what is deferred.
No commit and no push were performed; the controller performs integration and the candidate-pair freeze.

---

## 1. Markers required by the stage gate

- `U-R3-EXECUTABLE-CHECKS`
- `SIX-LAYER-PRIMITIVES`
- `NO-BARE-RELNAME-GATE`
- `EFFECTIVE-REACH-AND-CATALOG-INVENTORY-SPLIT`
- `EXECUTABLE-PROBE-CONTRACT-IMPLEMENTED`
- `PER-STAGE-ALLOWLIST-CONSUMED`
- `LIVE_DEFERRED_TO_A1_PREFLIGHT`

---

## 2. What was implemented (map: acceptance item → file → how)

### 2.1 `SIX-LAYER-PRIMITIVES`
`tools/shared-runtime/lib/six-layer-privileges.mjs`

Six distinct, separately-callable primitives, each documenting the single layer it answers:

| Layer | Primitive |
|---|---|
| L1 catalog presence | `catalogPresence()` (pg_catalog enumeration, never `information_schema`) |
| L2 object grant | `objectGrant()` (by resolved OID only) |
| L3 schema USAGE | `schemaUsage()` |
| L4 effective reach | `effectiveReach()` = **L2 ∧ L3 on the same qualified object** |
| L5 RLS visibility | `rlsMeasurability()` / `rlsCountEvidence()` (UNMEASURED never 0-as-PASS) |
| L6 ownership capability | `ownershipCapability()` |

`effectiveReach()` throws if the L3 reading is not for the object's own `nspname`, so two
different objects can never be silently combined. `objectGrant()` throws without a resolved
OID. Both are asserted in the selftest.

### 2.2 `NO-BARE-RELNAME-GATE`
`tools/shared-runtime/h3d/lane-b-gates.mjs` — gate `G-NO-BARE-RELNAME`

Every relation is addressed by `c.oid` or by the pair `(n.nspname, c.relname)`; every object
privilege primitive receives the OID (`objectPrivilegeSql()` emits `c.oid`, asserted directly).
The source-level gate scans the reconstructed Lane-B sources and the generated runbooks and
fails on (a) a bare `relname` compared to a name string without an `nspname` qualifier on the
same statement line, and (b) an object privilege primitive whose object argument is a name
string rather than a resolved OID.

### 2.3 `EFFECTIVE-REACH-AND-CATALOG-INVENTORY-SPLIT`
`tools/shared-runtime/lib/six-layer-privileges.mjs` — two labelled contracts

- **Contract A — effective-reach assertion** (`assertEffectiveReachContract`, tag `A`, layer L4):
  qualified identity + schema USAGE + object privilege set; concludes reach. **Throws if handed
  a catalog enumeration.**
- **Contract B — catalog-surface inventory** (`inventoryCatalogSurface`, tag `B`, layer L1):
  enumeration + expected set; exposes `reach: undefined`. **Throws if handed grants or schema
  USAGE.**

`tools/shared-runtime/inventory/lane-b-effective-reach.mjs` consumes both as separate paths and
labels each report block. Selftest negative controls confirm each contract rejects the other's
inputs.

### 2.4 `PER-STAGE-ALLOWLIST-CONSUMED`
- Sole source of record: contract §1a, projected verbatim into
  `docs/platform/shared-runtime/fixtures/lane-b-per-stage-allowlist.json` (machine-readable).
- `tools/shared-runtime/h3d/generate-runbooks.mjs` reads `always_forbidden_schemas` and the
  per-stage `exceptions` row from that fixture only; it holds **no** forbidden list of its own.
- `tools/shared-runtime/h3d/lane-b-gates.mjs` gate `G-ALLOWLIST-SINGLE-SOURCE` proves no
  reconstructed tool source carries a literal forbidden-schema name, and that each generated
  create runbook's forbidden set equals the fixture's set exactly once each (a same-line second
  list is also caught).
- Selftest (`lane-b-effective-reach.mjs`) builds its schema map from
  `loadAllowlist().always_forbidden_schemas` — the list is not re-typed in the test either.

### 2.5 `EXECUTABLE-PROBE-CONTRACT-IMPLEMENTED`
`tools/shared-runtime/lib/probe-contract.mjs`

`withRoleSession()` places `client.connect()` **inside** the guard; `endGuaranteed()` is in the
outer `finally` and is bounded by a `Promise.race`, so the session terminates on success, error,
timeout, and a throw from `connect()`. Bounds match
`fixtures/h3d-authz-fixture-teardown.sql:21-23` (`lock_timeout='4s'`,
`statement_timeout='30s'`, `idle_in_transaction_session_timeout='30s'`); `42501 → capable:false`,
`55P03/57014 → UNMEASURED`, unexpected errors rethrow and are still torn down. The selftest
verifies the bounds against the real teardown fixture rather than restating them.

### 2.6 Target/provenance helper
`tools/shared-runtime/lib/provenance.mjs` — parses the project ref from the connection
parameters, requires pooler-user/host agreement, STOPs before connecting when missing or
ambiguous, and requires measured database-side evidence to equal `LAB_REF`. The database-side
mechanism is a candidate and is marked deferred (§4).

### 2.7 Runbooks
`docs/platform/shared-runtime/runbooks/` — 8 generated SQL files (M/W × {create,teardown} × the
two §1a stages `H3D-A1`, `H3D-LIVE`). Each create runbook carries a closing `DO` block that names
the layer it asserts (attribute, L2, L3, L4, L6, forbidden reach), with the forbidden set expanded
from the sole allowlist source; each teardown mirrors every `GRANT` with one `REVOKE`
(`G-REVOKE-MIRROR`) and contains no role-ownership drop (`G-NO-DROP-OWNED`, F9). Passwords are
never persisted: the files reference `:'role_password'` / `:'window_valid_until'` psql variables.

Only the two stages with §1a rows are generated. H3F/H5/H4 M runbooks were intentionally **not**
generated: §1a defines no exception row for them, and §1a is the sole allowlist source, so
inventing one would create a second list.

### 2.8 Remediation found and applied during this unit
1. **`sql-static-check.mjs` CRLF defect (pre-existing red gate).** `stripComments()` split on
   `\n` but left a trailing `\r`, so `-- .*$` never reached the line end and a `--` comment
   containing "ON CONFLICT" tripped the `no ON CONFLICT` check. `stripComments` now normalises
   `\r\n?` → `\n` first (semantics preserved). This is in-scope: the file is under
   `tools/shared-runtime/h3d/**`.
2. **Generated closing-block defect (found by reading the generated SQL).** The `is_exception`
   boolean was initialised in `DECLARE` from the loop variable `r` (NULL at block entry, so the
   branches were skipped) and every assertion used `current_user`, which is the creating class-P
   session, not the created role. Fixed in `generate-runbooks.mjs`: `is_exception` is assigned
   per loop row, and every assertion targets the created role by name
   (`has_table_privilege('<role>', …)`, `has_schema_privilege('<role>', …)`,
   `pg_has_role('<role>', …)`, `pg_roles WHERE rolname = '<role>'`). Rationale: the create file is
   executed by class P; asserting the role's behaviour by name is the only single-file,
   executable, falsifiable form of contract §3's "asserts behaviour" requirement. Recorded here
   as an interpretation, not silently applied.

---

## 3. Declared stage gate — literal results

Commands run with `H3D_OUT_DIR` pointing outside the repo
(`C:\Users\Win11\AppData\Local\Temp\opencode\h3d-out`). No LAB access.

### 3.1 `npm run selftest` (in `tools/shared-runtime`)

```
$ npm run selftest
...
SQL STATIC CHECK PASS
...
ALL H3D OFFLINE TESTS PASS
PROBE-CONTRACT SELFTEST PASS (guaranteed teardown on every path)
PROVENANCE SELFTEST PASS
RUNBOOK GENERATOR CHECK PASS (runbooks derive from the sole allowlist source)
LANE-B GATES SELFTEST PASS (G-NO-BARE-RELNAME, G-ALLOWLIST-SINGLE-SOURCE, G-REVOKE-MIRROR, G-NO-DROP-OWNED)
LANE-B EFFECTIVE-REACH SELFTEST PASS (Contract A effective reach + Contract B catalog inventory separated)
```

`exit code = 0`

### 3.2 `node tools/shared-runtime/h3d/sql-static-check.mjs` (from repo root)

```
$ node tools/shared-runtime/h3d/sql-static-check.mjs
SQL STATIC CHECK PASS
```

`exit code = 0`

### 3.3 `git diff --check`

```
$ git diff --check
warning: in the working copy of 'tools/shared-runtime/package.json', LF will be replaced by CRLF the next time Git touches it
```

`exit code = 0` — the only output is git's normal autocrlf notice; there are no whitespace errors.

### 3.4 Blocking secret scan

`rg` over every changed/new file for the two platform-admin credential variable names named in
brief §1 (the billing URL and the LAB DB password), the Auth-admin key variable names, private-key
headers, and assignment-shaped `password = '<value>'`:

```
SCAN_CLEAN(no hits)
```

`0` hits. No platform-admin or Auth-admin credential variable is read or named by any file in
this change.

### 3.5 Stage gate result

| Gate | Result |
|---|---|
| U-R3 evidence present with all 7 markers | PASS |
| Write scope ⊆ brief §1.1 | PASS (§5) |
| `npm run selftest` | PASS (exit 0) |
| `sql-static-check` | PASS (exit 0) |
| `git diff --check` | PASS (exit 0) |
| Secret scan = 0 | PASS |
| Declared stage gate | **PASS** |

---

## 4. `LIVE_DEFERRED_TO_A1_PREFLIGHT` — written, marked, not run

1. `tools/shared-runtime/inventory/lane-b-effective-reach.mjs --capture` — the live catalog
   capture. Printed as a deferred plan and exits `3`; it opens no connection. The capture
   contract (enumerate `r/p/S/f` in `ps01`, `ps01_internal`, `wstera_platform_internal`, `cron`,
   `net` from `pg_catalog`; per-kind OID privilege primitives; `has_schema_privilege` USAGE;
   RLS measurability) is encoded in `liveCapturePlan()`.
2. `tools/shared-runtime/lib/provenance.mjs` `databaseRefEvidenceSql()` — the database-side
   provenance mechanism is a candidate only; its discriminating power between two
   schema-identical projects is unverified offline (`status: LIVE_DEFERRED_TO_A1_PREFLIGHT`).
3. Real execution of any runbook (role create/teardown) and of `probeTriggerDdl()` against LAB —
   files and wrappers only; nothing was executed.
4. Contract §8 assumption: that LAB `postgres` holds `ADMIN OPTION` on `ps01_migrator` (needed to
   `GRANT ps01_migrator TO lane_b_rw_*`). Not measurable offline; behavioural assertion is in the
   create runbook closing block.

No other item in this unit requires LAB. Every selftest above is offline.

---

## 5. Changed-file list ⊆ brief §1.1

Modified (2):
```
tools/shared-runtime/h3d/sql-static-check.mjs      (stripComments CRLF fix)
tools/shared-runtime/package.json                  (script entries only; no new dependency)
```

New (16 — including this evidence file):
```
docs/platform/shared-runtime/evidence/LANE-B-U-R3-EXECUTABLE-CHECKS-2026-09-23.md
docs/platform/shared-runtime/fixtures/lane-b-per-stage-allowlist.json
docs/platform/shared-runtime/runbooks/lane-b-role-lane_b_measure_a1-create.sql
docs/platform/shared-runtime/runbooks/lane-b-role-lane_b_measure_a1-teardown.sql
docs/platform/shared-runtime/runbooks/lane-b-role-lane_b_measure_live-create.sql
docs/platform/shared-runtime/runbooks/lane-b-role-lane_b_measure_live-teardown.sql
docs/platform/shared-runtime/runbooks/lane-b-role-lane_b_rw_a1-create.sql
docs/platform/shared-runtime/runbooks/lane-b-role-lane_b_rw_a1-teardown.sql
docs/platform/shared-runtime/runbooks/lane-b-role-lane_b_rw_live-create.sql
docs/platform/shared-runtime/runbooks/lane-b-role-lane_b_rw_live-teardown.sql
tools/shared-runtime/h3d/generate-runbooks.mjs
tools/shared-runtime/h3d/lane-b-gates.mjs
tools/shared-runtime/inventory/lane-b-effective-reach.mjs
tools/shared-runtime/lib/probe-contract.mjs
tools/shared-runtime/lib/provenance.mjs
tools/shared-runtime/lib/six-layer-privileges.mjs
```

Every path is inside an allowed §1.1 prefix (`lib/**`, `h3d/**`, `inventory/**`, `package.json`,
`runbooks/**`, `fixtures/**`, and the named evidence file). No `products/`, PS01, `migrations/*`,
`h4-probe-harness.mjs`, or schema/role object was touched. No new dependency was added.

---

## 6. Negative controls — demonstrated to fail under mutation (test run only)

Each new check has a negative control in its selftest. In addition, a test-run-only script
**outside the repository** mutated **real** artifacts in memory (nothing written to disk) and each
gate fired:

```
CAUGHT  G-NO-BARE-RELNAME        [real M create: OID arg -> quoted name arg]           1 violation(s)
CAUGHT  G-REVOKE-MIRROR          [real W live teardown: all REVOKEs removed]           4 violation(s)
CAUGHT  G-ALLOWLIST-SINGLE-SOURCE[real W live create: extra residual forbidden name]  residual=auth
CAUGHT  G-NO-DROP-OWNED          [real W a1 teardown: role-ownership drop appended]   1 violation(s)
CAUGHT  EFFECTIVE-REACH (A)      [cron USAGE=false -> true]                            violations=2
CAUGHT  PROBE-CONTRACT teardown  [connect() outside guard vs inside]                   buggy_end=false real_end=true
CAUGHT  PROVENANCE               [database_ref_evidence mismatch / constant ref]       mismatch_threw=true constant_threw=true
SUMMARY {"mutations":7,"caught":7,"missed":0}
```

The `PROBE-CONTRACT` control is the round-4 regression test: with `connect()` moved outside the
guard the session is **not** terminated; with the implemented wrapper it is.

---

## 7. Two-source provenance facts (for the reviewer)

- The six-layer contract text lives only on the planning branch
  `work/house-lane-b-longrun-plan-20260922 @ b80f813`; it was read, not copied here.
- `931e3711f0fec19860be1e59769674a4981b7e4a` remains the pinned runtime SoT referenced by the
  allowlist fixture header. Candidate identity is the immutable pair `(planning_sha,
  execution_sha)` and is frozen by the controller, not here.

---

## 8. Open observations (not silently resolved)

1. **Brief base label.** Brief §0 lists base revision `2b1af861…`; the actual worktree HEAD is
   `b8a8f47e…` (the brief commit). Both were recorded; `2b1af86` is the contract baseline label,
   not this worktree's HEAD.
2. **Contract tension — W "no real-table write privilege" under L6 ownership.** §1a/§1b establish
   that a W role carries L6 ownership capability over `ps01`/`ps01_internal` via `ps01_migrator`
   membership, and a member of the owning role inherits the owner's privileges, so
   `has_table_privilege(w_role, ps01.<t>, 'INSERT')` can be true. The §3 "no real-table write
   privilege (W)" row (all four write privileges false over the `ps01` universe) is therefore not
   provable for W under L6 and would STOP the window if asserted naively. This unit did **not**
   encode that W assertion into the runbooks; it is left as an explicit tension for the Owner /
   A1 preflight rather than resolved by weakening the model. `checkForbiddenWritePrivileges()`
   takes the universe as a parameter so a W-specific universe can be defined at the preflight if
   the Owner rules one.
3. **Closing-block interpretation.** See §2.8 item 2 — the create runbook asserts the created
   role by name from the class-P session. This is a deliberate, recorded interpretation of
   contract §3's `current_user` wording; it is behaviourally correct and single-file executable,
   whereas a literal `current_user` in the creating session would be the class-P session.

---

## 9. Terminal state (nothing stronger)

**`U-R3 COMPLETE — EXECUTABLE CHECKS + RUNBOOKS LANDED; READY FOR CANDIDATE PAIR FREEZE`**

No commit, no push, no LAB access.
