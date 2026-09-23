# LEDGER — LANE B FINDING FAMILIES + SOURCE VERIFICATION (U-R1)

Date: 2026-09-22
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Unit: **U-R1** — finding-family ledger + source verification (stage 1 of the reconstruction)
Authority: `BRIEF-U-R1-LANE-B-FINDING-FAMILY-LEDGER-2026-09-22.md`;
`OWNER-RULING-LANE-B-HERMES-RELAY-TAKEOVER-2026-09-22.md` §2, §3
Method: read-only. No LAB/Supabase/Auth/secret access. No mutation to any file except
this deliverable. No commit / no push (Hermes holds integration authority).

Execution baseline re-verified for this ledger:
`BASELINE_2b1af861aa608f08abb0bd8224821b9ca5ac9981`
(`D:\AI-Workspace\runtime\worktrees\house-h3d-h5-20260909`, git worktree clean, HEAD ==
`2b1af861aa608f08abb0bd8224821b9ca5ac9981`, remote parity exact).

Contract tip checked for this ledger: planning branch `work/house-lane-b-longrun-plan-20260922`,
`docs/platform/shared-runtime/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md` last changed at
`675975b` (unchanged since Codex round 4 reviewed it) — confirmed by
`git log --oneline -- CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md`.

Source-of-Truth references:

1. `docs/platform/shared-runtime/REVIEW-CODEX-LANE-B-CONTROLLER-PACKAGE-2026-09-22.md` (R1, `4c3210d`)
2. `docs/platform/shared-runtime/REVIEW-CODEX-LANE-B-CONTROLLER-PACKAGE-ROUND2-2026-09-22.md` (R2, `47eab10`)
3. `docs/platform/shared-runtime/REVIEW-CODEX-LANE-B-CONTROLLER-PACKAGE-ROUND3-2026-09-22.md` (R3, `c6c5467`)
4. `docs/platform/shared-runtime/REVIEW-CODEX-LANE-B-CONTROLLER-PACKAGE-ROUND4-2026-09-22.md` (R4, `675975b`)
5. `docs/platform/shared-runtime/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md` (contract A)
6. `docs/platform/shared-runtime/BRIEF-AGY-LANE-B-PRE-A1-FINDINGS-REMEDIATION-2026-09-22.md` (contract B)
7. `docs/platform/shared-runtime/VERIFICATION-H2-H4-CONSISTENCY-2026-09-22.md` (contract C)
8. `docs/platform/shared-runtime/STATUS-LANE-B-PRE-A1-CONTROLLER-PACKAGE-2026-09-22.md`
9. `docs/platform/shared-runtime/TAKEOVER-PREFLIGHT-LANE-B-HERMES-RELAY-2026-09-22.md`
10. execution source at `2b1af86` (teardown SQL, runner, catalog, H1 inventory, operator pack)

---

## 0. Count reconciliation — "26 findings" vs. what the reviews actually contain

The brief (`BRIEF-U-R1` §2.2 item 1, §4) and the takeover record (§6 header, §10.3) both
state **"26 findings"** from Codex rounds 1–4.

Measured against the four review files, the review text contains **19 distinct defect
findings**, confirmed three independent ways:

| Source | Count |
|---|---|
| Round-1 review `### DEFECT-*` headings | 10 (`DEFECT-01`…`DEFECT-10`) |
| Round-2 review `### NEW-DEFECT-*` headings | 5 (`NEW-DEFECT-01`…`NEW-DEFECT-05`) |
| Round-3 review `### NEW-DEFECT-*` headings | 2 (`NEW-DEFECT-06`, `NEW-DEFECT-07`) |
| Round-4 review `### NEW-DEFECT-*` headings | 2 (`NEW-DEFECT-08`, `NEW-DEFECT-09`) |
| **Total distinct Codex round findings** | **19** |
| `STATUS` §2 review trail (10 + 5 + 2 + 2) | 19 |
| TAKEOVER §6.1 table rows (10 + 5 + 2 + 2) | 19 |
| TAKEOVER §6.2–§6.4 family-table rows | 19 |

The number **26** is reachable only if the two non-round finding groups are added to the
19 round findings:

```text
19 Codex round findings
+  4 additional G-H4 gaps surfaced in contract C and confirmed by Codex R1 (G-H4-1…G-H4-4)
+  3 pre-A1 H3D-S findings the package remediates (F-GATE-RLS-COUPLING,
     F-CATALOG-PROVENANCE, auth.users measurability)
= 26 enumerated finding-like items
```

This ledger therefore enumerates **26 finding-like items** (Table 1 = the 19 round
findings; Table 2 = the G-H4 gaps; Table 3 = the pre-A1 findings), and records explicitly
that the brief's phrase *"all 26 findings from Codex rounds 1–4"* is not literally
supported by the round reviews: **from the four rounds alone the count is 19**. This is
reported as a document-truth defect in §7.

Family markers used throughout: `FAMILY-F1-EVIDENCE-PROVENANCE`,
`FAMILY-F2-EFFECTIVE-PRIVILEGE`, `FAMILY-F3-NON-VACUOUS-CHECK`,
`FAMILY-F4-OPERATOR-ACTOR`.

---

## 1. Table 1 — all 19 Codex round-1…4 findings (round, id, severity, substance, disposition history, final state, family)

Final states: `CLOSED` / `PARTIALLY CLOSED` / `OPEN` (with supersession noted where the
finding was replaced by a same-family successor). Disposition history is taken from the
round reviews' own disposition sections (R2 §"Round-1 defect dispositions" /
§"New defects"; R3 §"Round-2 finding dispositions" / §"Further"; R4 §"Requested finding
dispositions" / §"Further").

| ID | Round | Sev | Substance (from review text) | Disposition history | Final state | Family |
|---|---|---|---|---|---|---|
| `DEFECT-01` | R1 | HIGH | C §2 makes a **false unchanged-range claim**: the H4 file list "last changed at `7ab7b6c`, unchanged in `d6707c0..2b1af86`" is false for the operator pack, which changed at `2c1ef3a`. | R2 **NOT CLOSED** → superseded by `NEW-DEFECT-01`; R3 CLOSED | **CLOSED** | FAMILY-F1-EVIDENCE-PROVENANCE |
| `DEFECT-02` | R1 | HIGH | W is **not** the exact "no other schema" boundary claimed: membership of `ps01_migrator` is ownership-level reach, not a table-only grant; effective reach was not enumerated. | R2 **PARTIALLY CLOSED** → `NEW-DEFECT-02`; R3 CLOSED *as policy-table correction* (its gate remained under-specified → `NEW-DEFECT-06`) | CLOSED as its own wording defect; **root cause survives** downstream (`NEW-DEFECT-06`/`-08`/`-09`) | FAMILY-F2-EFFECTIVE-PRIVILEGE |
| `DEFECT-03` | R1 | HIGH | M is **not actually read-only**: every M/W role inherits managed `PUBLIC` write on `cron`/`net`, contradicting "no writes anywhere". | R2 **CLOSED** (records the inherited exposure as accepted/bounded/re-measured) | **CLOSED** | FAMILY-F2-EFFECTIVE-PRIVILEGE |
| `DEFECT-04` | R1 | MEDIUM | The window-open M write probe (`LOCK TABLE ps01.shops IN ROW EXCLUSIVE MODE`) is **not harmless** — a broken guardrail still takes a real product-table lock. | R2 **PARTIALLY CLOSED** (metadata inspection replaced the lock, but tested only `INSERT`) | **superseded** by `NEW-DEFECT-03`/`NEW-DEFECT-09` and the §3a rewrite | FAMILY-F2-EFFECTIVE-PRIVILEGE |
| `DEFECT-05` | R1 | MEDIUM | W sufficiency for trigger DDL is **asserted, not proven**: membership checks do not prove `ALTER TABLE … DISABLE/ENABLE TRIGGER` succeeds. | R2 **PARTIALLY CLOSED**; R3 **PARTIALLY CLOSED**; R4 **PARTIALLY CLOSED** | **OPEN** (carried as `NEW-DEFECT-05`) | FAMILY-F3-NON-VACUOUS-CHECK |
| `DEFECT-06` | R1 | MEDIUM | Per-stage cleanup **incomplete** for H3D-LIVE/H4 Auth identities, runtime-grant rows, hooks and tokens (only a generic M/W role teardown existed). | R2 **PARTIALLY CLOSED** → `NEW-DEFECT-04`; R3 CLOSED | **CLOSED** | FAMILY-F3-NON-VACUOUS-CHECK |
| `DEFECT-07` | R1 | MEDIUM | Provenance negative controls **do not reject a constant** database-side identity (no "same schema, different database" test). | R2 **CLOSED** | **CLOSED** | FAMILY-F1-EVIDENCE-PROVENANCE |
| `DEFECT-08` | R1 | MEDIUM | Auth measurement can **pass without a complete measurement object** (missing/null `count`/`id_set_sha256` not forced to `UNMEASURED`). | R2 **CLOSED** | **CLOSED** | FAMILY-F3-NON-VACUOUS-CHECK |
| `DEFECT-09` | R1 | HIGH | C misses the operator-pack actor contradiction for P: the pack tells **"Agent"** to run H4 platform SQL, contradicting class P. | R2 **CLOSED as a recorded gap** (renumbered G-H4-5) | CLOSED as a finding; **remediation debt remains**, scheduled before `OWNER-CP-H4` | FAMILY-F4-OPERATOR-ACTOR |
| `DEFECT-10` | R1 | LOW | F7 **overstates the ACL evidence**: "revoked from every role except its owner" vs. a finite named `REVOKE` list + `GRANT SELECT` to `supabase_auth_admin`. | R2 **CLOSED** | **CLOSED** | FAMILY-F1-EVIDENCE-PROVENANCE |
| `NEW-DEFECT-01` | R2 | HIGH | C still asserts a **false common last-change SHA** ("all six other files at `7ab7b6c`") — false for the Design doc (`c0d95b5`). | R3 **CLOSED** (per-file SHAs recorded; range log empty for all seven) | **CLOSED** | FAMILY-F1-EVIDENCE-PROVENANCE |
| `NEW-DEFECT-02` | R2 | HIGH | A's effective W boundary **contradicts** the H3D-LIVE grant to `wstera_platform_internal.runtime_token_grants` and its own forbidden-reach gate. | R3 **CLOSED as policy-table correction** | CLOSED as its own contradiction; the proving gate survived as `NEW-DEFECT-06` | FAMILY-F2-EFFECTIVE-PRIVILEGE |
| `NEW-DEFECT-03` | R2 | MEDIUM | The "no real-table write privilege" check tests only **`INSERT`** (not UPDATE/DELETE/TRUNCATE). | R3 **PARTIALLY CLOSED**; R4 **PARTIALLY CLOSED** | **OPEN** | FAMILY-F2-EFFECTIVE-PRIVILEGE |
| `NEW-DEFECT-04` | R2 | MEDIUM | The claimed H3D-LIVE teardown sequence is **not the source execution order** (runner cleanup is concurrent; hook/expiry are external). | R3 **CLOSED** | **CLOSED** | FAMILY-F3-NON-VACUOUS-CHECK |
| `NEW-DEFECT-05` | R2 | MEDIUM | Trigger capability probe **not operationally harmless**: `ALTER TABLE` on the live table with no bounded lock/statement timeout and no executable rollback wrapper. | R3 **PARTIALLY CLOSED**; R4 **PARTIALLY CLOSED** | **OPEN** | FAMILY-F3-NON-VACUOUS-CHECK |
| `NEW-DEFECT-06` | R3 | MEDIUM | H3D-LIVE exception gate **cannot prove an exhaustive object boundary**: `information_schema.tables` is privilege-filtered, and UPDATE/TRUNCATE/REFERENCES/TRIGGER were not asserted false on the allowed table. | R4 **PARTIALLY CLOSED** | **OPEN** | FAMILY-F2-EFFECTIVE-PRIVILEGE |
| `NEW-DEFECT-07` | R3 | MEDIUM | The revised all-privilege write check **includes the accepted managed-surface writes** (`cron`/`net`) in its forbidden set, so a correctly-shaped role fails the check. | R4 **CLOSED** | **CLOSED** | FAMILY-F2-EFFECTIVE-PRIVILEGE |
| `NEW-DEFECT-08` | R4 | MEDIUM | H3D-LIVE relation checks **cannot identify the exception relation**: the catalog query returns bare `c.relname` while the contract compares a schema-qualified value and passes `r` to `has_table_privilege`. | (new in R4) | **OPEN** | FAMILY-F2-EFFECTIVE-PRIVILEGE |
| `NEW-DEFECT-09` | R4 | MEDIUM | The accepted-exposure **positive query is not an exact reachable-relation assertion**: it enumerates catalog presence (`r/p/S`) and selects only `relname`, conflating catalog presence with effective reach. | (new in R4) | **OPEN** | FAMILY-F2-EFFECTIVE-PRIVILEGE |

Round-by-round review revisions: R1 `4c3210d` · R2 `47eab10` · R3 `c6c5467` · R4 `675975b`.
Every round: **Mutation: None** to package and execution source; no LAB/Auth/secret access.

---

## 2. Family assignment — exactly one family per finding, justified from review text

Family assignment is by the **defect's mechanism as stated in the review body**, not by its
title. Four families only. Each finding appears exactly once.

### FAMILY-F1-EVIDENCE-PROVENANCE — claims must be provable from the exact revision/source

| Finding | Justification (review text) |
|---|---|
| `DEFECT-01` | R1: "the exact-revision evidence statement is not trustworthy" — a claim about what changed in a revision range. |
| `NEW-DEFECT-01` | R2: "the exact-revision evidence section remains internally false and can cause a reviewer to bind the H2/H4 table to the wrong historical revision." |
| `DEFECT-07` | R1: "An implementation can replace the current literal with another constant … and still label a foreign database as LAB." — provenance falsification. |
| `DEFECT-10` | R1: "The measured fact is broader than the checked source." — claim-vs-source overstatement. |

### FAMILY-F2-EFFECTIVE-PRIVILEGE — the privilege model must describe effective reach, not declared grants

| Finding | Justification (review text) |
|---|---|
| `DEFECT-02` | R1: "Define the effective boundary, not only direct grants … A W session can reach at least the PS01 internal ownership surface and the managed PUBLIC surfaces." |
| `NEW-DEFECT-02` | R2: "The effective-boundary statement is false for a named stage, so the credential gate is not executable as written." |
| `DEFECT-03` | R1: "Those statements cannot both be true as effective-privilege claims … it has effective managed-surface write capability." |
| `NEW-DEFECT-03` | R2: "A role with only UPDATE, DELETE, or TRUNCATE on a forbidden table passes the stated window-open check" — the effective-write boundary is under-tested. |
| `DEFECT-04` | R1: the probe "still acquires a real table lock"; a write-mode lock as a read-only boundary preflight. |
| `NEW-DEFECT-06` | R3: "the gate can pass without proving the 'one table only, exact privilege set' boundary." |
| `NEW-DEFECT-07` | R3: the forbidden-write set wrongly includes accepted managed-surface privilege — the model of reachable-vs-accepted is wrong. |
| `NEW-DEFECT-08` | R4: "A bare name is resolved through the session `search_path`; it is not the relation identified by the `pg_namespace` join." |
| `NEW-DEFECT-09` | R4: "It … mixes catalog presence with effective reach and cannot perform an exact schema-qualified set comparison." |

### FAMILY-F3-NON-VACUOUS-CHECK — a check that cannot fail (or cannot execute safely) is not a check

| Finding | Justification (review text) |
|---|---|
| `DEFECT-05` | R1: "no trigger-DDL behavior check is specified … membership alone is not proof." |
| `NEW-DEFECT-05` | R2: "Rollback protects catalog state after completion; it does not make an unbounded lock acquisition harmless." |
| `DEFECT-06` | R1: "A later stage can satisfy the role teardown template while leaving an Auth identity, grant row, enabled hook, or unexpired token." — cleanup is not guaranteed by the template. |
| `NEW-DEFECT-04` | R2: "A failed run may leave the operator with a different cleanup state than this sequence assumes." — the asserted ordering is not enforced. |
| `DEFECT-08` | R1: "A malformed or vacuous `{ count: null, id_set_sha256: null }` result could compare equal before/after." |

### FAMILY-F4-OPERATOR-ACTOR — who executes a platform action must be unambiguous

| Finding | Justification (review text) |
|---|---|
| `DEFECT-09` | R1: "The controller package has two incompatible execution authorities … an agent must hold P." |

Note on the takeover's grouping: TAKEOVER §6.2 lists `DEFECT-09`/`G-H4-5` inside
FAMILY-F1. Per the review text it is an operator-authority defect (who runs the SQL), and
it is the subject of fingerprint `IF-04` (`operator_authority_actor`). It is therefore
assigned to FAMILY-F4-OPERATOR-ACTOR here; the takeover grouping is recorded as an
internal inconsistency in §7.

---

## 3. Table 2 — the five G-H4 documentation/authority gaps (contract C, confirmed "real" by Codex R1)

`G-H4-5` is the same issue as `DEFECT-09` and is **not** counted twice; it is listed once
for traceability.

| ID | Sev | Substance | Source | Final state | Family |
|---|---|---|---|---|---|
| `G-H4-1` | MEDIUM | Token-issuance path exists only as prose; harness consumes `H4_RUNTIME_JWT` but nothing produces it. | `VERIFICATION` §4 G-H4-1; R1 confirms "real" | OPEN — remediation scheduled before `OWNER-CP-H4` | FAMILY-F3-NON-VACUOUS-CHECK |
| `G-H4-2` | MEDIUM | H4 forward/rollback are not atomic under `psql -f` (no `ON_ERROR_STOP`, no transaction). | `VERIFICATION` §4 G-H4-2; R1 confirms "real" | OPEN — before `OWNER-CP-H4` | FAMILY-F3-NON-VACUOUS-CHECK |
| `G-H4-3` | LOW | Privilege snapshot narrower than the forward post-check (missing foreign-schema + migration-ledger booleans). | `VERIFICATION` §4 G-H4-3; R1 confirms "real" | OPEN — before `OWNER-CP-H4` | FAMILY-F1-EVIDENCE-PROVENANCE |
| `G-H4-4` | (unrated) | `h4-privilege-snapshot.sql:18` stamps a literal `project_ref` — sibling of `F-CATALOG-PROVENANCE`. | `VERIFICATION` §4 G-H4-4 | handled by the root-cause fix in contract B | FAMILY-F1-EVIDENCE-PROVENANCE |
| `G-H4-5` | HIGH | Operator pack assigns H4 platform SQL to "Agent", contradicting class P. **= `DEFECT-09`.** | `VERIFICATION` §4 G-H4-5; R1 DEFECT-09 | CLOSED as a finding; remediation debt before `OWNER-CP-H4` | FAMILY-F4-OPERATOR-ACTOR |

---

## 4. Table 3 — the three pre-A1 H3D-S findings (inputs the package remediates)

| ID | Sev | Substance | Source | Final state | Family |
|---|---|---|---|---|---|
| `F-GATE-RLS-COUPLING` | HIGH | Gates were authored under an RLS-bypassing credential; 12 of 23 counted tables read a blind `0` that reads as green. | `BATCH-H3D-S` §5 | remediated by contract B (offline); live proof deferred | FAMILY-F3-NON-VACUOUS-CHECK |
| `F-CATALOG-PROVENANCE` | HIGH | `catalog-manifest.mjs:174` stamps `project_ref` from a literal, so a schema-identical foreign database verifies PASS as LAB. | `BATCH-H3D-S` §6; R1 F5 | root-cause fix in contract B; live proof deferred | FAMILY-F1-EVIDENCE-PROVENANCE |
| `auth.users` measurability | MEDIUM | `auth.users` returns `42501` to any grantable role, yet "no Auth residue" claims depend on it. | `BATCH-H3D-S` §6 | replaced by an Auth-Admin-API measurement module (contract B) | FAMILY-F3-NON-VACUOUS-CHECK |

26 enumerated finding-like items = 19 (Table 1) + 4 unique G-H4 gaps (Table 2, excluding
`G-H4-5`) + 3 (Table 3). See §0.

---

## 5. Open set — derived from Codex dispositions, not from STATUS

**`OPEN_SET_IS_FIVE`** — the real open set, taken from Codex's own disposition table (R4
§"Requested finding dispositions" + §"Further NEW-DEFECT findings", and R3 for the two it
raised), is:

```text
NEW-DEFECT-03 · NEW-DEFECT-05 · NEW-DEFECT-06 · NEW-DEFECT-08 · NEW-DEFECT-09
```

Derivation (each is `PARTIALLY CLOSED`/`OPEN` at the last round that touched it and was
never subsequently `CLOSED`):

| Finding | Last Codex disposition | Round |
|---|---|---|
| `NEW-DEFECT-03` | PARTIALLY CLOSED | R4 |
| `NEW-DEFECT-05` | PARTIALLY CLOSED | R4 |
| `NEW-DEFECT-06` | PARTIALLY CLOSED | R4 |
| `NEW-DEFECT-08` | raised (OPEN) | R4 |
| `NEW-DEFECT-09` | raised (OPEN) | R4 |

Every other round finding reaches `CLOSED` or is `superseded` by a same-family successor
(and therefore not separately open): `DEFECT-01→ND-01→CLOSED`, `DEFECT-02`/`ND-02` CLOSED
as policy-table corrections, `DEFECT-03` CLOSED, `DEFECT-04` superseded by `ND-09`/§3a,
`DEFECT-06`/`ND-04` CLOSED, `DEFECT-07` CLOSED, `DEFECT-08` CLOSED, `DEFECT-09` CLOSED as a
finding, `DEFECT-10` CLOSED, `NEW-DEFECT-07` CLOSED.

### 5.1 The STATUS document under-reports the open set

**`STATUS_UNDERREPORTS_OPEN_SET`**

`STATUS-LANE-B-PRE-A1-CONTROLLER-PACKAGE-2026-09-22.md` §3 ("Exact open items (block round
5)", lines 53–76) states *"Both are in `CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md`"* and
names only **`NEW-DEFECT-08`** and **`NEW-DEFECT-09`**. Codex round 4 leaves **three**
further findings `PARTIALLY CLOSED` (`NEW-DEFECT-03`, `NEW-DEFECT-05`, `NEW-DEFECT-06`).
The status document therefore names 2 of the 5 real open findings and **under-reports the
open set by three**.

Consequence recorded (takeover §6.5): a reconstruction scoped only to `-08`/`-09` — exactly
the failure mode `OWNER-RULING` §3 and takeover §8.1 warn against — would leave three
known-open, same-family defects in place. This ledger's open set is derived from the Codex
disposition table, not from the status summary.

---

## 6. Re-verification of the five open claims against the execution source

For each open finding: (a) the contract citation at the current tip of
`CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md` (planning branch; the file is **absent** from the
execution branch — confirmed `git cat-file -e 2b1af86:…` → absent); (b) the execution-source
citation(s) at `2b1af86` that ground the claim; (c) classification.

Round-4 line references were re-checked against the current tip, **not copied**:
`CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md` last changed at `675975b` and is unchanged at the
current tip, so R4's `:263` and `:265` still resolve exactly (see §6.1). R3's citations were
taken at `c6c5467` and are reconciled separately.

### 6.1 R4 citations re-checked against the current tip

| R4 citation | Current tip (`675975b`, unchanged) | Result |
|---|---|---|
| `NEW-DEFECT-08` → `:265` | line 265 = the "forbidden reach (W)" row, containing `SELECT c.relname FROM pg_class c JOIN pg_namespace n …` and the exception comparison `r = 'wstera_platform_internal.runtime_token_grants'` | **matches** |
| `NEW-DEFECT-09` → `:263` | line 263 = the "no real-table write privilege (M, W)" row, containing the positive query `SELECT relname FROM pg_class c JOIN pg_namespace n … WHERE n.nspname IN ('cron','net') AND c.relkind IN ('r','p','S')` | **matches** |

### 6.2 The five open claims

#### `NEW-DEFECT-03` — STILL_TRUE / NO_LONGER_TRUE — **`NO_LONGER_TRUE`**

- Claim (R2): the "no real-table write privilege" check tests only `INSERT`.
- Contract citation: `CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md:263`.
- Current text at `:263`: "assert `has_table_privilege(current_user, t, p) = false` for
  **each** of `p ∈ {'INSERT','UPDATE','DELETE','TRUNCATE'}`" — all four privileges now.
- Execution-source grounding: `H1-EFFECTIVE-PRIVILEGE-INVENTORY-2026-09-08.md:57-64` at
  `2b1af86` (managed `net` relations carry `SELECT, INSERT, UPDATE, DELETE, TRUNCATE, …`).
- **Classification: `NO_LONGER_TRUE`** — the specific defect (only `INSERT`) is fixed at the
  tip. `NEW-DEFECT-03` remains Codex-labelled `PARTIALLY CLOSED` only because its sibling
  positive assertion carries `NEW-DEFECT-09`.

#### `NEW-DEFECT-05` — STILL_TRUE — **`STILL_TRUE`**

- Claim (R4): the §3a probe's unconditional session-termination contract does not cover
  every connection path — `client.connect()` is outside the `try`/`finally`.
- Contract citation: `CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md:266` (checks-table trigger-DDL
  row) and `:276-297` (§3a code).
- Current text: line 278 `await client.connect();` sits **before** the `try {` on line 280;
  the `finally { … }` (lines 291–296) therefore does not run if `connect()` throws or the
  socket dies during connect.
- Execution-source grounding at `2b1af86`:
  `docs/platform/shared-runtime/fixtures/h3d-authz-fixture-teardown.sql:21-23` (the real
  `lock_timeout='4s'`, `statement_timeout='30s'`, `idle_in_transaction_session_timeout`) and
  `:185,188` (the `ALTER TABLE … DISABLE/ENABLE TRIGGER` the probe must prove). R4's bound
  citation `:19-23` resolves correctly.
- **Classification: `STILL_TRUE`** — the disconnect-fallback prose in §3a still does not
  cover a failure inside `client.connect()`.

#### `NEW-DEFECT-06` — STILL_TRUE (partially) — **`STILL_TRUE`**

- Claim (R3): the H3D-LIVE exception gate cannot prove an exhaustive object boundary
  (privilege-filtered `information_schema.tables`; UPDATE/TRUNCATE/REFERENCES/TRIGGER not
  asserted false on the allowed table; enumeration not `r/p/S`-complete; identity loss).
- Contract citation: `CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md:265`.
- Current text at `:265`: corrected to enumerate from `pg_catalog` (fixing the
  privilege-filter) and to assert `SELECT/INSERT/DELETE → true` and
  `UPDATE/TRUNCATE/REFERENCES/TRIGGER → false` on the exception relation. **But** the
  `relkind` filter is `('r','p','v','m')` — it excludes sequences (`S`) and foreign tables
  (`f`) while the row still claims an exhaustive relation boundary, and it still selects only
  `c.relname` (identity loss → `NEW-DEFECT-08`).
- Execution-source grounding at `2b1af86`:
  `docs/platform/shared-runtime/evidence/H1-EFFECTIVE-PRIVILEGE-INVENTORY-2026-09-08.md:57-77`
  (the `net` object set incl. `net.http_request_queue_id_seq`) and `:81-85` (catalog presence
  vs. schema `USAGE` distinction); `tools/shared-runtime/h3d/h3d-live-runner.mjs:343-360`
  (the runner's real use of the grant relation).
- **Classification: `STILL_TRUE`** — the "exhaustive boundary" defect survives as a narrowed
  residual (coverage + identity).
- R3 citation reconciliation: R3 cited `:265,301-308` against `c6c5467`. At `c6c5467` line
  265 correctly resolves to the forbidden-reach row it describes; lines 301–308 resolve to
  §6 "Gates this policy adds" (326-line file), **not** to the forbidden-reach assertion. The
  second half of that citation is inaccurate — see §7.

#### `NEW-DEFECT-08` — STILL_TRUE — **`STILL_TRUE`**

- Claim (R4): the catalog query returns only `c.relname`, but the contract compares the
  returned value to the qualified string `wstera_platform_internal.runtime_token_grants` and
  passes that value to `has_table_privilege`; a bare name resolves through `search_path`.
- Contract citation: `CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md:265`.
- Current text at `:265` (verbatim): the enumeration is
  `SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE
  n.nspname = 'wstera_platform_internal' AND c.relkind IN ('r','p','v','m')`, and the
  exception branch is `r = 'wstera_platform_internal.runtime_token_grants'`. Unchanged.
- Execution-source grounding at `2b1af86`: the runner addresses that relation only by its
  fully qualified name (`h3d-live-runner.mjs:343-360`: `wstera_platform_internal.runtime_token_grants`),
  which is the identity the check must resolve, not a bare `relname`.
- **Classification: `STILL_TRUE`**.

#### `NEW-DEFECT-09` — STILL_TRUE — **`STILL_TRUE`**

- Claim (R4): the accepted-exposure positive query enumerates every `r/p/S` relation in
  `cron`/`net` and selects only `relname`, while the expected set is four schema-qualified
  relations — mixing catalog presence with effective reach.
- Contract citation: `CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md:263`.
- Current text at `:263` (verbatim): "… via `SELECT relname FROM pg_class c JOIN pg_namespace
  n ON n.oid = c.relnamespace WHERE n.nspname IN ('cron','net') AND c.relkind IN
  ('r','p','S')` … any relation beyond the documented set → window STOPs". Unchanged.
- Execution-source grounding at `2b1af86`:
  `docs/platform/shared-runtime/evidence/H1-EFFECTIVE-PRIVILEGE-INVENTORY-2026-09-08.md:81-85`
  records `cron.job_run_details` as a catalog relation with `PUBLIC` object grants while PS01
  identities have **no `USAGE` on schema `cron`** — so a `r/p/S` catalog enumeration would
  count it as an unexpected fifth relation even on a correctly-shaped role; and `:64` records
  schema `net` `USAGE` as a distinct grant from the object grants.
- **Classification: `STILL_TRUE`**.

### 6.3 Live-behaviour note

All five classifications above are **static** (contract text vs. source text) and are
therefore evaluable offline. Whether the current checks would actually PASS or FAIL against
the live LAB ACL is a separate matter that **`CANNOT_EVALUATE_WITHOUT_LAB`** for the
accepted-exposure set comparison; it is not claimed either way here.

---

## 7. Fingerprints and circuit-breaker audit

Fingerprint format (takeover §7):
`failure_class | component | failing_gate | root_cause/symptom signature`. Counters are
per-fingerprint and are **not** reset by wording or filename changes.

| ID | Fingerprint | Full round history | Per-fingerprint ordinary repairs |
|---|---|---|---|
| `IF-01` | `security_contract_model | CREDENTIAL-STRATEGY §1a + §3 forbidden-reach/accepted-exposure gates | relation identity + effective reach vs catalog presence | declared-grant-list model cannot express reachability` | R1 `DEFECT-02` → R2 `NEW-DEFECT-02` → R3 `NEW-DEFECT-06` → R4 `NEW-DEFECT-08`/`NEW-DEFECT-09` | **3** — repair #1 `47eab10`, repair #2 `d2c094f`, repair #3 `675975b` |
| `IF-02` | `nonvacuous_probe_contract | CREDENTIAL-STRATEGY §3a trigger-DDL capability probe | guaranteed rollback / bounded lock | harmlessness rests on prose; no executable wrapper contract` | R1 `DEFECT-05` → R2 `NEW-DEFECT-05` → R3 `NEW-DEFECT-05` → R4 `NEW-DEFECT-05` | **3** — repair #1 `47eab10`, repair #2 `d2c094f`, repair #3 `675975b` |
| `IF-03` | `evidence_provenance | VERIFICATION-H2-H4 §2 exact-revision claims | unchanged-range assertion | claim-vs-reality on revisions` | R1 `DEFECT-01` → R2 `NEW-DEFECT-01` → R3 CLOSED | **2** — repair #1 `47eab10`, repair #2 `d2c094f` |
| `IF-04` | `operator_authority_actor | OPERATOR-ACTION-PACK §H4 vs credential class P | who executes platform SQL | documentation/authority gap G-H4-5` | R1 `DEFECT-09`/`G-H4-5` → R2 CLOSED as recorded gap | **1** — repair #1 `47eab10` |

### 7.1 Circuit-breaker audit — the legacy loop breached its own limit

Per §6, an issue fingerprint allows **at most two** ordinary bounded repairs, then Codex
classification, then at most one bounded Claude repair. Measured for the shared fingerprint
`IF-01` (takeover §7.1, re-verified against the commit graph):

| Step | Act | Revision |
|---|---|---|
| R1 FAIL | repair #1 | `47eab10` |
| R2 FAIL | repair #2 | `d2c094f` |
| R3 FAIL | repair **#3** ← **NOT PERMITTED under §6** | `675975b` |
| R4 FAIL | no further patch (Owner issued the override) | — |

**`REPAIR_CAP_2_EXCEEDED_AT_REV3`** — ordinary repair **#3** was executed at `675975b`,
which the circuit breaker does not permit (cap = 2 ordinary repairs). The same count (3)
applies to `IF-02`; `IF-03` and `IF-04` stayed within the cap. The overrun is the direct,
mechanical explanation of why four rounds produced no PASS — the loop kept patching a model
it had already failed to repair twice. The new controller must not repeat it; the legacy
Round-5 patch loop stays **DISABLED** (`OWNER-RULING` §3; takeover §8.1).

Commit-graph confirmation: `4c3210d` (R1 reviewed) → `47eab10` (R2 reviewed) → `d2c094f` →
`c6c5467` (R3 reviewed) → `675975b` (R4 reviewed) → `2db3f89` → `1943d1a`.

---

## 8. Claims inside the governing documents that are themselves wrong

Reviewers and the governing records are **not** assumed correct. Each item below is
evidence-backed.

### 8.1 The "26 findings" count is unsupported by the round reviews (document-truth defect)

- Claim: `BRIEF-U-R1` §2.2 item 1 and §4, and `TAKEOVER` §6 header / §10.3, say there are
  **26 findings from Codex rounds 1–4**.
- Evidence: the four review files contain 19 distinct findings (10+5+2+2); `STATUS` §2 and
  the TAKEOVER §6.1 table and §6.2–§6.4 tables all contain **19**. `26` is reachable only by
  also counting the 4 non-duplicate G-H4 gaps and the 3 pre-A1 H3D-S findings (§0).
- Report: the phrase *"from Codex rounds 1–4"* does not describe a 26-item set; the round
  findings are 19. No finding is silently added or removed in this ledger.

### 8.2 Round-4's "planning worktree was clean at the reviewed SHA" is inaccurate for the review file itself

- Claim (R4 `REVIEW-…-ROUND4`, line 15): *"The planning worktree was clean at the reviewed
  SHA."*
- Evidence (verified on the planning branch):
  ```text
  git cat-file -e 675975b:docs/…/REVIEW-CODEX-LANE-B-CONTROLLER-PACKAGE-ROUND4-2026-09-22.md → ABSENT
  git cat-file -e 2db3f89:…ROUND4… → ABSENT
  git cat-file -e 1943d1a:…ROUND4… → ABSENT   (takeover-time HEAD)
  git log --all -- …ROUND4… → 4c40883 "persist Lane B takeover record, round-4 review, Owner ruling"
  ```
  The round-4 review was **never committed before `4c40883`**; it existed only as an
  untracked file — which the takeover record itself classifies (§4) as the single untracked
  item at takeover. So the physical worktree was not literally clean: it contained the
  review's own untracked deliverable.
- Report: the accurate statement is *"the tracked tree was clean at `675975b`; the review's
  own deliverable was untracked"*. The literal "worktree was clean" overstates it, and the
  single untracked file persisted across `2db3f89`/`1943d1a` until `4c40883`.

### 8.3 R3's `NEW-DEFECT-06` second citation does not resolve to the content claimed (minor)

- Claim (R3 `REVIEW-…-ROUND3`, `NEW-DEFECT-06`): File
  `CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md:265,301-308`.
- Evidence: at the reviewed revision `c6c5467` (326 lines), line 265 correctly resolves to
  the forbidden-reach row the finding describes, but **lines 301–308 resolve to §6 "Gates
  this policy adds"**, not to the forbidden-reach assertion.
- Report: substantive defect is correctly located at `:265`; the `:301-308` half of the
  citation is inaccurate. Recorded so a later unit does not inherit a bad reference.

### 8.4 TAKEOVER §6.2 files `DEFECT-09`/`G-H4-5` under the wrong family (internal inconsistency)

- The TAKEOVER §6.2 table places `DEFECT-09`/`G-H4-5` under "Family F1 — exact-revision
  provenance", while its own `IF-04` fingerprint classifies the same defect as
  `operator_authority_actor` and the brief defines `FAMILY-F4-OPERATOR-ACTOR` for exactly
  this. By the review text (R1 DEFECT-09: "two incompatible execution authorities") it is an
  operator-actor defect. This ledger assigns it to FAMILY-F4-OPERATOR-ACTOR (§2).

### 8.5 STATUS under-reports the open set (already recorded in §5.1)

- `STATUS` §3 names 2 open findings (`NEW-DEFECT-08`, `NEW-DEFECT-09`); Codex dispositions
  leave 5. `STATUS_UNDERREPORTS_OPEN_SET`. Also `STATUS` §3 asserts *"Both are in
  `CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md`"*, which is true for `-08`/`-09` but omits that
  `NEW-DEFECT-03`/`-05`/`-06` are equally open there.

### 8.6 Minor: the reviewed revision's commit also carried the round-3 review record

- R4 line 15 says *"The requested diff is confined to `CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md`."*
  The commit that carries the reviewed revision, `675975b`, changed **two** files:
  `CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md` (+55/−4) **and**
  `REVIEW-CODEX-LANE-B-CONTROLLER-PACKAGE-ROUND3-2026-09-22.md` (+47). The "requested diff"
  (the package change) is indeed confined to the strategy; the observation is recorded only
  so the revision content is not misread.

---

## 9. What U-R2 must reconstruct (derived from this ledger)

**Surviving root cause family: `FAMILY-F2-EFFECTIVE-PRIVILEGE`.** Four of the five open
findings (`NEW-DEFECT-03`, `NEW-DEFECT-06`, `NEW-DEFECT-08`, `NEW-DEFECT-09`) sit in it, and
the recurrence `DEFECT-02 → NEW-DEFECT-02 → NEW-DEFECT-06 → NEW-DEFECT-08/09` is one model
error surviving four revisions: the contract models privilege as a **declared grant list**
when the measured truth is a **reachability relation over qualified objects, schema `USAGE`,
ownership capability, and RLS visibility**. Each repair moved the error one layer down
instead of changing the model. `NEW-DEFECT-05` (`FAMILY-F3-NON-VACUOUS-CHECK`) is the
second, narrower root cause: an executable probe contract that is still prose around a live
table.

U-R2 must replace the declared-list model with an explicit, separately-asserted and
separately-falsifiable distinction between the **six layers**:

```text
catalog presence  !=  object grant  !=  schema USAGE  !=  effective reach
                  !=  RLS visibility  !=  ownership capability
```

and must state **both contracts separately, labelled** (never conflated): an
**effective-reach** assertion (schema-qualified relation identity or OID + schema `USAGE`
distinction + object privilege set) and, separately, a **catalog-surface inventory** that is
never described as effective reach (`OWNER-RULING` §3; takeover §9.1). It must also preserve,
without weakening: per-stage exception allowlists, qualified relation identity, accepted
`cron`/`net` residual exposure described as accepted+bounded+re-measured, non-vacuous checks,
harmless/bounded probes as an executable contract, the no-LAB/no-class-P-on-agent rule, and
the H2 `NOLOGIN` invariant.

U-R2 does **not** patch `NEW-DEFECT-08`/`-09` in isolation, and U-R1 makes no contract edits.

---

## 10. Stage gates, evidence commands, and changed-file list

All commands run read-only against the named worktrees/revisions.

| Gate | Command | Result |
|---|---|---|
| Execution baseline is the expected SHA | `git -C …/house-h3d-h5-20260909 rev-parse HEAD` | `2b1af861aa608f08abb0bd8224821b9ca5ac9981` (exit 0) |
| Execution worktree clean | `git -C …/house-h3d-h5-20260909 status --porcelain -b` | clean, remote parity exact (exit 0) |
| Strategy absent from execution branch | `git cat-file -e 2b1af86:…/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md` | absent (as brief §2.2(5) states) |
| Strategy tip unchanged since R4 | `git log --oneline -- …/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md` | last change `675975b` |
| R4 `:263` / `:265` still resolve | `sed -n '263p;265p' …/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md` | §3 rows as cited |
| §3a JS block syntax | `sed -n '277,296p' … > tmp.mjs; node --check tmp.mjs` | exit 0 |
| Teardown bounds + trigger DDL | `sed -n '21,23p;185,188p' …/fixtures/h3d-authz-fixture-teardown.sql` | `lock_timeout='4s'`, `statement_timeout='30s'`; DISABLE/ENABLE TRIGGER |
| Round-4 review untracked at reviewed SHA | `git cat-file -e 675975b:…ROUND4…` | `ABSENT` (exit non-zero → recorded) |
| Diff check vs. base | `git diff --check 4c40883..HEAD` | exit 0 |
| Diff check (worktree) | `git diff --check` | exit 0 |
| Deliverable present | `LEDGER-LANE-B-FINDING-FAMILIES-2026-09-22.md` | present (new, untracked) |

### 10.1 Changed-file list (must be ⊆ §1.1 of the brief)

```text
docs/platform/shared-runtime/LEDGER-LANE-B-FINDING-FAMILIES-2026-09-22.md   (new — the only change)
```

No other file was created, modified, staged, committed, or deleted. No LAB/Supabase/Auth/
secret access occurred. No commit, no push (per brief §5).

### 10.2 Required markers present in this file

`FAMILY-F1-EVIDENCE-PROVENANCE` · `FAMILY-F2-EFFECTIVE-PRIVILEGE` ·
`FAMILY-F3-NON-VACUOUS-CHECK` · `FAMILY-F4-OPERATOR-ACTOR` · `IF-01` · `IF-02` · `IF-03` ·
`IF-04` · `DEFECT-02` · `DEFECT-03` · `DEFECT-05` · `DEFECT-06` · `DEFECT-08` ·
`NEW-DEFECT-02` · `NEW-DEFECT-03` · `NEW-DEFECT-05` · `NEW-DEFECT-06` · `NEW-DEFECT-07` ·
`NEW-DEFECT-08` · `NEW-DEFECT-09` · `OPEN_SET_IS_FIVE` · `STATUS_UNDERREPORTS_OPEN_SET` ·
`BASELINE_2b1af861aa608f08abb0bd8224821b9ca5ac9981` · `REPAIR_CAP_2_EXCEEDED_AT_REV3`.

---

## 11. Terminal state of this unit

`U-R1 COMPLETE — FINDING-FAMILY LEDGER READY FOR U-R2 RECONSTRUCTION` — and nothing stronger.
No contract edit, no patch, no LAB access, no commit, no push. The state remains
`PACKAGE_RECONSTRUCTION_REQUIRED`.

`next-action: release U-R2 (contract reconstruction, planning branch)`
