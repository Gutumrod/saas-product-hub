# BRIEF — `H3D-S-LIVEGATE` CLOSURE

Date: 2026-09-22
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Unit: `H3D-S-LIVEGATE`
Revision under test: `2b1af861aa608f08abb0bd8224821b9ca5ac9981`
Author: Claude (Windows), at Owner direction
Controller: Claude (Mac) — unchanged

Role note: the Owner routed this unit brief through the Windows session. The Mac
remains Lane-B controller and runs the loop. This document is an input to that
controller, not a transfer of the role back.

## 1. Independent verification of the `H3D-S` report

The Windows session re-measured the Mac controller's claims against the remote
rather than accepting the report. All of it holds:

| Claim | Verified |
|---|---|
| `origin/work/house-h3d-h5-20260909` = `2b1af86` | yes |
| Range `d6707c0..2b1af86` = 3 commits | yes — `2c1ef3a`, `6928932`, `2b1af86` |
| 9 files, +883 / −167 | yes, exactly |
| No path outside the allowed scope | yes — every path is under `tools/shared-runtime/h3d/`, `docs/platform/shared-runtime/fixtures/`, `…/evidence/`, or the Operator Pack |
| PS01 untouched | yes — no PS01 path appears in the range |

## 2. Manifest risk — re-assessed downward, with evidence

The Windows session previously flagged the expected-manifest fingerprint change
(`001c2c21…` → `3413b349…`) as a possible silencing of the drift detector. That
concern is now **withdrawn on the structural question**, because it was checked:

| `camera_access_audit` coverage | at `d6707c0` | at `2b1af86` |
|---|---|---|
| `graph_tables` | present | removed |
| `graph_fks` edges touching it | **0** | 0 |
| `fixture_table_columns` | **0 entries** | 0 entries |
| `fixture_table_constraints` | **0 entries** | 0 entries |
| `triggers` | 2 entries | 2 entries |
| `monitored_non_fk_surfaces` | — | present, with notes |

Nothing was dropped from structural monitoring. The table had **zero FK edges while
sitting in `graph_tables`**, which is precisely the "manifest overstates graph
reachability" defect S5 named. Moving it into an explicit
`monitored_non_fk_surfaces` list with documented reasoning makes the manifest more
truthful, not less watchful. `camera_rate_limit_buckets` is handled the same way and
is correctly documented as non-shop-scoped.

**What remains genuinely open is narrower:** `3413b349…` was recomputed offline and
has never been compared against a live LAB capture. If the LAB catalog drifted since
the 2026-09-09 baseline, an offline recompute would carry the stale snapshot forward
under new field names and would not notice. That is exactly what `--verify` exists to
catch, and it has not been run.

This unit exists to close that.

## 3. Objective

Run the two outstanding SELECT-only acceptance checks against `2b1af86` and
determine whether the expected catalog manifest is truthful against the live LAB.

## 4. Credential handling — Owner action

The Owner provides the SELECT-only LAB credential as `LAB_DB_URL` in the Mac
session environment. Confirmed from the tool itself: `catalog-manifest.mjs` reads
`process.env.LAB_DB_URL` (and `CATALOG_MANIFEST_OUT` for capture output).

Rules:
- the value is set in the shell environment only;
- it never appears in chat, in a repo file, in argv, in evidence, or in a log;
- it is SELECT-only; if only a broader credential is available, STOP and report
  rather than proceeding with it;
- do not echo, print, or partially reveal it at any point.

If no credential is provided, this unit stays open. Do not substitute an offline
recompute for the live check, and do not mark the gate met.

## 5. Checks to run

### Check 1 — live catalog verify

```
node tools/shared-runtime/h3d/catalog-manifest.mjs --verify docs/platform/shared-runtime/fixtures/h3d-expected-catalog-manifest.json
```

Per the tool's own contract: exit `3` on **any** drift = STOP. Exit `0` = the
expected manifest matches the live LAB and `3413b349…` is confirmed truthful.

### Check 2 — LAB state unchanged

Use the runner's existing SELECT-only mode rather than ad-hoc SQL:

```
node tools/shared-runtime/h3d/h3d-live-runner.mjs --preflight-readonly
```

Expected, per the static-acceptance brief's recorded baseline: PS01
fixture/business/support counts `0`, `runtime_token_grants` `0`, `auth.users`
unchanged at `5`, `camera_access_audit` `0`.

Any deviation is a finding, not a number to update.

## 6. Hard prohibition — the point of this unit

**If Check 1 reports drift, do not regenerate the expected manifest to make it
pass.** Recapturing and committing a fresh manifest would convert a detected drift
into a silent baseline move, which is the failure mode brief §7 forbids
("do not weaken negative isolation checks merely to get green tests").

On drift: capture the live manifest to a **scratch path outside the repo**, diff it
against the committed expected manifest, classify what drifted and whether it is
explained, and route the finding back through the loop. The Owner decides whether a
baseline move is legitimate.

Also prohibited in this unit: any DML, fixture seed or teardown execution, Auth
identity create/delete, runtime grant INSERT/DELETE, hook changes, H3D live run,
merge, and any PS01 or Production mutation. This unit is read-only against LAB.

## 7. Outcomes

**Both checks pass** → `H3D-S` acceptance is complete. Proceed to `BATCH-H3D-S`,
then stop at `OWNER-CP-H3D-A1`.

**Check 1 drifts** → `H3D-S BLOCKED — CATALOG DRIFT`. Report the classified drift.
Codex's PASS on `2b1af86` is not invalidated (it reviewed code, and no code changed),
but the acceptance gate stays unmet and the revision cannot advance.

**Check 2 deviates** → `H3D-S BLOCKED — LAB STATE DEVIATION`. Do not proceed; an
unexplained LAB delta must be understood before any stage that mutates LAB.

**No credential** → `H3D-S HELD — LIVE GATE UNMET`, state unchanged.

## 8. `BATCH-H3D-S` package — required contents

If both checks pass, record the batch on the planning branch in the same form as
`PRE-01-CLASSIFICATION-AND-CLOSURE-2026-09-22.md`:

- exact repo / worktree / branch / base / target SHA, and the reviewed range;
- changed-file list and allowed-scope proof;
- every gate with its command and result, including the two live checks and their
  exit codes;
- the three review rounds: what Codex failed, what was fixed, who fixed it, and
  that Codex did not mutate the revision it finally passed;
- the two defects the controller found independently of Codex (the always-passing
  tamper test and the evidence that overstated the live verify), since they are
  part of the honest record;
- evidence paths and hashes;
- dirty-state classification and remote parity;
- the commit-shape deviation and why the range was not squashed;
- the secret-gate result, blocking and advisory, with the advisory hit classified.

Ratified, so it is not left ambiguous: **the three-commit shape stands.** The
handoff asked for one commit to prevent the inherited S1–S4 work from appearing
pre-accepted. Codex reviewed `d6707c0..2b1af86` as a single revision, which achieves
that. Squashing now would mint a new SHA and void the review for no gain. Do not
squash.

## 9. Amendment — 2026-09-22, after Mac preflight preparation

### 9.1 §5 Check 2 was wrong — corrected

This brief specified `h3d-live-runner.mjs --preflight-readonly` for Check 2 "rather
than ad-hoc SQL". That instruction was written from the mode's name without reading
what it measures. The Mac controller read it and found the error. Verified
independently from the Windows side against `2b1af86`:

`modePreflightReadonly()` runs `verifyCatalog()` → `resolvePs01TableCol()` →
`discoverAuthzFixtures()` → `writeFreshSnapshotFile()`, then throws with
`{ stop: true }` when fixture discovery fails. It counts **none** of the values
Check 2 requires, and because LAB has no fixtures it is *designed* to STOP at
discovery. Using it as written would have produced either a false alarm or a gate
that never measures its own criterion.

It also calls `writeEvidence()`, which writes into the repo evidence directory and
would dirty the working tree.

**Ratified correction.** Check 2 splits:

- **2a** — direct SELECT-only counts: the 20 `ps01` tables, `runtime_token_grants`,
  `auth.users`, and `camera_access_audit`, compared against the recorded baseline
  (`0` / `0` / `5` / `0`). A table the read-only role cannot read is reported
  **`UNMEASURED`**, never as a pass. This is the correct discipline: an unreadable
  table is missing evidence, not a green check.
- **2b** — `--preflight-readonly` with evidence redirected to scratchpad, not the
  repo. The expected outcome is the STOP at AUTHZ fixture discovery, and it is
  classified as expected rather than as a failure.

The Mac's external preflight (target confirmation, role privilege checks,
`READ ONLY` session) is ratified as written, including the additions beyond §4:
`rolreplication`, transitive role membership, write privileges across every schema
rather than only the three named, and refusing the `postgres` role.

### 9.2 New finding — `F-CATALOG-PROVENANCE` (HIGH, deferred)

`catalog-manifest.mjs:174` writes `project_ref: "ykxlqnshaaxmzzocpjlj"` as a string
literal. It is the only occurrence in the file; the value is never derived from the
live connection.

Consequence: a capture taken from any database is stamped as LAB. Because both sides
of `--verify` carry the same constant, the field cancels out and contributes nothing
to drift detection. A different PS01 instance with a matching schema — a production
one, for example — would verify **PASS** and be recorded as LAB. PS01 is a shipped
product, so a schema-identical production database is a realistic target for an
operator typo, not a hypothetical.

No committed manifest can currently prove which database it came from.

**Disposition: do not fix in this unit.** `2b1af86` holds a clean Codex PASS that
did not involve Codex mutation. Editing `catalog-manifest.mjs` now mints a new SHA,
voids that review, and forces a fourth round, in exchange for a defect that the
Mac's external preflight already contains for this run.

Instead:
- record it in `BATCH-H3D-S` as a known open finding so it cannot be lost;
- fix it in a dedicated unit with its own review;
- treat it as a **hard gate before `H3D-LIVE`**, because that is the first stage
  where a wrong-target connection mutates data rather than only mis-labelling
  evidence.

Intended fix for that later unit: derive the project ref from the live connection
and STOP on mismatch with `LAB_REF`, rather than asserting it. The host/username
parsing in the Mac's preflight is the obvious source to move into the tool.

## 10. Owner checkpoint after this unit

`OWNER-CP-H3D-A1` is a hard stop. Present the batch and wait. No silence or timeout
is approval. Nothing in this brief authorizes `H3D-A1` execution.
