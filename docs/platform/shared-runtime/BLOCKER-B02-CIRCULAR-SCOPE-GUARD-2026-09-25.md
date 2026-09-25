# BLOCKER — B0.2 CANNOT BE DISPATCHED BEFORE THE B-3 SCOPE-GUARD FIX IS INSTALLED

Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001` / `WSTERA-HOUSE-DUAL-LANE-CONVERGENCE-001`
Stage: Lane B B0.2 (Codex classification of the scanner fingerprint)
Recorded: 2026-09-25 · By: Hermes (controller / state holder — mechanical record)

State: **`BLOCKED_TECHNICAL_REMEDIATION` — circular dependency between B0.2 and the B-3 install step**

---

## 1. What happened

Two dispatch attempts were made on the corrected revision. Both failed before a verdict existed:

| # | Failure | Cause |
|---|---|---|
| 1 | `DIRECT_EXECUTOR_SECRET_DETECTED:wrapper_log:codex-worker-*.stderr.log` | The reviewer's `--add-dir` is the **whole worktree**, which contains ~40 files with legitimate secret-shaped fixture literals (`test_secret_scanner.py`, `test_direct_external_executors.py`, `secretary-bridge/tests/…`). The reviewer read one and echoed it into stderr, and the wrapper-log scan then fired. Prompt-level "out of scope" is **advisory only**. |
| 2 | `DIRECT_EXECUTOR_UNKNOWN:agent-codex:scope_violation:.secretary-relay/…` | After confining the workspace to a scanner-clean minimal tree, the **non-BUILD scope guard** fired — on the harness's **own** stage evidence. |

Attempt 1's cause was my packet design (fixed by confining the workspace). Attempt 2's cause is not.

## 2. The circular dependency (measured, not inferred)

The B-3 scope-guard fix is committed to canonical but **not installed**:

```text
canonical  vault master 3a42877  tools/agent-relay-adapter/direct_external_executors.py
           -> HARNESS_EVIDENCE_ROOTS present (2 occurrences)

installed  <HERMES_HOME>/skills/devops/kanban-external-agent-dispatch/scripts/
           -> HARNESS_EVIDENCE_ROOTS absent (0 occurrences)
```

And the driver loads the **installed** copy, not the canonical one:

```text
relay_execution_driver.py:18   from direct_external_executors import (...)
relay_execution_driver.py:372  result = execute_direct_external(...)
```

Both files live in the same installed directory, so `from direct_external_executors` resolves to the
installed sibling. **The driver therefore executes the unfixed guard regardless of what canonical says.**

Consequence, stated plainly:

```text
B0.2 (Codex classify)  needs  the non-BUILD scope guard fixed in the INSTALLED runtime
the B-3 fix can only be INSTALLED  after  review
review needs B0.2's routing verdict  before  Claude may remediate the scanner
the scanner defect blocks review of the protected revision
```

That is a closed loop. It is **not** a defect in the approved sequence — the approved sequence
(Sol §4) is: reconcile → repair provenance → repair scope guard → tests+verifier → B0.2 classify →
Claude scanner fix → … → **independent review** → install. The install is placed late, after review.

What the sequence did not account for is that **B0.2 itself runs through the same Relay driver**, and
is therefore blocked by the very defect it is meant to help route.

## 3. Why this is not simply "install the fix early"

Installing the repaired adapter into the live runtime before review would:

- bypass the review gate that the Owner rulings require for protected components;
- make the live runtime the de-facto source of truth mid-run — explicitly forbidden by B-1
  ("never patch the live runtime as Source of Truth");
- put an unreviewed change into the component that scans for secrets, on the same day a retraction
  was issued for exactly that class of out-of-sequence change.

Hermes will not do that on its own initiative.

## 4. Options for the Owner

| Option | Effect | Note |
|---|---|---|
| **A (recommended)** | Authorize a **narrow, separately-reviewed install** of only the B-3 scope-guard fix (the `.secretary-relay` exclusion constant + helper use) into the installed runtime, ahead of the full B-1 install, so B0.2 can run. | The fix is already committed and tested (`c99dc25` region + 3 regression controls). It is a scope-guard correction, not a security-control weakening: the worker's own ignored-write bypass is still detected, proven by two negative controls. |
| **B** | Run B0.2 outside Relay — e.g. invoke the Codex classify directly against the confined workspace — accepting that this stage then has no Relay provenance record. | Loses exactly the provenance property that the earlier classify attempts failed to establish. Weakens the artifact. |
| **C** | Defer Lane B; park it and let Lane A proceed to its live window. | Lane A is independently parkable and its next gate needs the Owner at the interlocks anyway. |
| **D** | Reorder: allow Claude's scanner remediation to be reviewed and installed **with** the B-3 fix as one reviewed install, then run B0.2 afterwards. | Changes the approved sequence order; needs an explicit Owner ruling because Sol §4 step 6 gates Claude behind B0.2. |

Hermes does not choose between these.

## 5. Independent finding worth recording

While diagnosing attempt 2, a **second** non-BUILD guard gap was measured (see the lane traps):

```text
The non-BUILD mutation guard rejects ANY new workspace path and does NOT consult the
stage's declared `write_scope`. A non-BUILD stage whose deliverable is a FILE therefore
fails closed on its own deliverable.
```

Proof: in a scratch repo, a stage declaring `write_scope: [docs/…/CLASSIFY-RECORD.md]` and writing
exactly that file produced
`DIRECT_EXECUTOR_UNKNOWN:agent-codex:scope_violation:docs/…/CLASSIFY-RECORD.md`.

This is **distinct** from B-3 (which is about the harness's own evidence root). It is not fixed by
the `.secretary-relay` exclusion. The B0.2 packet was reshaped so the deliverable is the reviewer's
**stdout** with `write_scope: []`, which avoids the gap without needing a fix. The gap itself is
**open** and needs a separate ruling; it affects any non-BUILD stage that must produce a file.

## 6. Non-claims

No Codex verdict exists. No Claude dispatch occurred. The scanner defect is **open**. No production
mutation occurred. The installed runtime was not patched. The canonical revision is correct and
pushed; only its **installation** is pending review. Lane A is unaffected by this blocker and remains
`A0_COMPLETE / W0_PARTIAL`.

---

## Evidence

| Artifact | Value |
|---|---|
| Canonical revision (fixes present) | vault `master` `3a42877` |
| Scanner retraction | `9c8bcd4` |
| Classification brief | `44bc74b` |
| Installed adapter (fixes absent) | `<HERMES_HOME>/skills/devops/kanban-external-agent-dispatch/scripts/direct_external_executors.py` |
| Attempt 1 | `DIRECT_EXECUTOR_SECRET_DETECTED:wrapper_log` |
| Attempt 2 | `DIRECT_EXECUTOR_UNKNOWN:agent-codex:scope_violation:.secretary-relay/…` |
| Minimal scanner-clean workspace | `D:/AI-Workspace/runtime/worktrees/lane-b-b02-classify-scope` @ `9ceadd7` |

---

## 7. UPDATE — attempt log and an unresolved measurement (added after 4 attempts)

Per the debugging contract (3 attempts → stop), this is the honest record.

| # | Driver used | Result | Hypothesis tested |
|---|---|---|---|
| 1 | installed | `SECRET_DETECTED:wrapper_log` | reviewer read scope = whole worktree → **CONFIRMED**, fixed by a minimal scanner-clean workspace |
| 2 | installed | `scope_violation:.secretary-relay/…` | installed adapter lacks the B-3 fix → **CONFIRMED by hashes** (`HARNESS_EVIDENCE_ROOTS`: canonical 2, installed 0) |
| 3 | **canonical** (cwd switched to canonical scripts) | same `scope_violation` | "stale `__pycache__` shadowed the fix" → **DISPROVEN** (cache cleared, still failed) |
| 4 | canonical + `PYTHONDONTWRITEBYTECODE=1` | same `scope_violation` | same → **DISPROVEN again** |

### What is proven

Loading the canonical adapter directly and calling its helper reproduces **correct** behaviour:

```text
HARNESS_EVIDENCE_ROOTS = ('.secretary-relay',)
_nonbuild_workspace_changed_paths(mini worktree)          -> []
before/after simulation writing .secretary-relay/… files  -> scope_changes = []
```

The exclusion applies correctly to exactly the paths in the error message.

### What is NOT proven

**Why the driver's run still reports those paths.** Since the guard behaves correctly when the
canonical module is loaded directly, the running process must not be executing that module's helper —
but attempts 3 and 4 did not establish where it comes from. The remaining candidates, none verified:

- the `release-entry` / `finalize` **subprocess** the driver spawns via
  `sys.executable str(ADAPTER) …` resolving imports from a different root than the parent;
- an `import` resolution order difference in the driver's own process that the isolated probes do not
  reproduce.

**This must be measured, not assumed** — it is the next concrete step, and it is now also the only
thing standing between Lane B and a B0.2 verdict.

### Consequence

B0.2 remains **undispatched**; no verdict exists. The blocker in §2 (circular dependency with the
B-3 install) still stands and still needs an Owner ruling, but the two attempts on the canonical
driver suggest the dependency may be resolvable **without** installing anything — if the import
resolution question above is answered. That is worth one more measured attempt before any install is
authorised.
