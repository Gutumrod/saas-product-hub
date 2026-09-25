# REPAIR RECORD — `EXECUTION_PROOF_EXCLUSION_PREFIX_STRIP_V1` — ordinary repair #1

Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Governing ruling: `SOL-RULING-EXECUTION-PROOF-EXCLUSION-REPAIR-LADDER-2026-09-25.md`
Ruling checkpoint: `4c66c38b040dcfe484c777bbf88cf2ddd179dab6`
Input evidence: `ATTEMPT5-FAILURE-RECORD-2026-09-25.md`
Recorded: 2026-09-25 · By: Hermes (LONG_RUN controller — mechanical record, not an authority decision)

State: **`REPAIR_1_AUTHORED / EXACT_GATE_PASS / CODEX_REVIEW_REQUIRED`**

---

## 1. Fingerprint and root cause (as ruled)

`execution_proof._excluded()` normalized a candidate path with `str.lstrip("./")`, a
**character-set** strip rather than a **prefix** strip. `.` and `/` were removed from the left end
until the first other character, so a relative path such as `.secretary-relay/t_…/x.txt` lost its
leading `.` and could never match the `.secretary-relay/` entry of `EXCLUDED_PREFIXES`.
The exclusion matched nothing at all — neither `.secretary-relay/` nor `.git/`.

Consequence: `evaluate_workspace_scope(..., read_only=True)` counted the Relay harness's **own**
stage evidence as new workspace paths and failed the stage closed on its own evidence
(`DIRECT_EXECUTOR_UNKNOWN:agent-codex:scope_violation:.secretary-relay/…`).

## 2. Source change (allowed scope only)

Two byte-identical canonical copies, per the release manifest (`execution_proof.py` ∈ `scripts_common`):

| File | Before | After |
|---|---|---|
| `tools/agent-relay-adapter/execution_proof.py` | `b5a3bf83320f50c2c96998240247264b6ff44957344bb95f2ac4fc2fd18ab144` | `d463b9beab422e4114224298b210dabc46318aa0c95cd4299d3dd0469cb933b3` |
| `skills/kanban-external-agent-dispatch/scripts/execution_proof.py` | `b5a3bf83…` | `d463b9be…` (identical) |

Change, in full — one new helper plus a one-line call-site substitution:

```python
def _normalize_exclusion_candidate(path: str) -> str:
    normalized = str(path or "").replace("\\", "/")
    while normalized.startswith("./"):
        normalized = normalized[2:]
    return normalized


def _excluded(path: str) -> bool:
    normalized = _normalize_exclusion_candidate(path)
    return any(normalized == p.rstrip("/") or normalized.startswith(p) for p in EXCLUDED_PREFIXES)
```

Untouched, by measurement (`git diff` contains no other logic change):

- `EXCLUDED_PREFIXES` — still exactly `(".git/", ".secretary-relay/")`;
- `_changed_paths`, `_path_state`, `capture_workspace_state`, `_normalize_root`, `_matches`,
  `evaluate_workspace_scope` — byte-identical to the pre-repair revision;
- no scanner logic (`test_secret_scanner.py` and its regression test have **no diff**);
- no routing / model / provider constant;
- no change to `direct_external_executors.py` (the B-3 site was already correct).

New focused regression test:
`tools/agent-relay-adapter/tests/test_execution_proof_exclusion_prefix.py` (9 tests).

## 3. Exact acceptance gate (ruling §4) — all ten measured

| # | Gate item | Result | Evidence |
|---|---|---|---|
| 1 | `.secretary-relay/**` excluded from execution-proof mutation accounting | **PASS** | `test_secretary_relay_paths_are_excluded` · `test_changed_paths_omits_harness_evidence` · `test_read_only_stage_does_not_fail_on_its_own_evidence` |
| 2 | `.git/**` excluded under the same documented invariant | **PASS** | `test_git_paths_are_excluded_by_the_same_invariant` |
| 3 | unauthorized worker write outside excluded roots still detected | **PASS** | `test_unauthorized_worker_write_is_still_detected_after_the_fix` (negative control: `docs/platform/shared-runtime/OUT-OF-SCOPE-WRITE.md`) · `test_worker_writes_outside_excluded_roots_are_not_excluded` |
| 4 | allowed-path logic unchanged except prefix normalization | **PASS** | `git diff` section §2 — only the exclusion candidate normalization changed |
| 5 | no broad path suppression introduced | **PASS** | `test_no_broad_suppression_beyond_the_declared_prefixes` (`docs/.secretary-relay-notes.md`, `docs/secretary-relay/x.md` not suppressed; `EXCLUDED_PREFIXES` unchanged) |
| 6 | targeted regression tests PASS | **PASS** | `Ran 9 tests … OK` |
| 7 | full canonical Relay test suite PASS | **PASS** | baseline `Ran 255 tests … OK (skipped=1)` → after `Ran 264 tests … OK (skipped=1)`, 0 FAIL/ERROR |
| 8 | canonical Relay release verifier PASS | **PASS** | `{"pass": true, "count": 27, "total": 27}` against a temp home built from canonical source |
| 9 | canonical skill/adapter parity intact | **PASS** | both copies `d463b9be…`; staged git blobs identical (`bc87e854…` each) |
| 10 | no install / no live-runtime mutation | **PASS** | installed `execution_proof.py` still `b5a3bf83…` and still contains `lstrip("./")` — the pre-fix byte image |

Non-vacuity control (ruling §4, last paragraph) — required to fail on the pre-fix implementation:

- `test_nonvacuity_control_fails_on_prefixed_character_strip` — the byte-for-byte pre-fix predicate
  returns `False` for `.secretary-relay/…` and `.git/…`; the repaired predicate returns `True`.
- `test_nonvacuity_control_pre_fix_implementation_would_fail_this_stage` — on the real attempt-5 stage
  shape, the pre-fix predicate reports all five harness evidence paths as worker changes, while the
  repaired implementation reports none.

## 4. What was NOT done (ruling §3 / §5 boundaries)

- No install into the live runtime; installed blob unchanged (gate 10).
- No scanner logic touched; no scanner remediation attempted.
- No routing/model/provider change.
- No B0.2 attempt and no B0.2 retry — B0.2 must wait for the focused Codex review (ruling §5).
- No card archived or completed (ruling §7 / T78).
- No merge, no branch mutation beyond this task's two locked branches.
- B-3's `HARNESS_EVIDENCE_ROOTS` site was left exactly as-is.

## 5. Next required gate

Focused independent Codex review bound to **this exact repair revision**, inspecting only
scanner-clean files (ruling §5). A Codex PASS here reviews the execution-proof repair only and does
**not** replace B0.2 scanner classification. Only after that PASS may B0.2 be retried exactly once
on the repaired canonical source.

Ladder position: repair #1 of at most two (§2 — no repair #3).

## 6. Evidence index

| Artifact | Location |
|---|---|
| repaired source (canonical, tool copy) | `tools/agent-relay-adapter/execution_proof.py` @ `d463b9be…` |
| repaired source (canonical, skill copy) | `skills/kanban-external-agent-dispatch/scripts/execution_proof.py` @ `d463b9be…` |
| focused regression tests | `tools/agent-relay-adapter/tests/test_execution_proof_exclusion_prefix.py` |
| baseline suite log | `Ran 255 tests … OK (skipped=1)` |
| post-repair suite log | `Ran 264 tests … OK (skipped=1)` |
| verifier run | temp-home structural verifier, `27/27`, `pass: true` |
| attempt-5 root-cause evidence | `runtime/hermes-native/workspace/dual-lane-20260924/ATTEMPT5-GUARD-SITE-PROOF.json` · `ATTEMPT5-NONVACUITY-CONTROL.json` |
