# ATTEMPT 5 — FAILURE RECORD (Sol §3) — IMPORT PROVENANCE DIAGNOSTIC

Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001` / `WSTERA-HOUSE-DUAL-LANE-CONVERGENCE-001`
Governing ruling: `SOL-RULING-B02-IMPORT-PROVENANCE-BEFORE-EARLY-INSTALL-2026-09-25.md`
Stage: Lane B B0.2 (`codex-classify-fingerprint`)
Recorded: 2026-09-25 · By: Hermes (controller / state holder — mechanical record only)
Outcome: **`ATTEMPT5_FAILED — SAME FINGERPRINT — ROOT CAUSE PROVEN — SEPARATE CLASS`**

---

## 1. What was executed (the authorized attempt, once)

Exactly the Sol §2 conditions, all of them:

| # | Condition | Observed |
|---|---|---|
| 1 | canonical driver by **absolute path** | `python -B D:\AI-Workspace\runtime\hermes-native\hermes-native-vault\skills\kanban-external-agent-dispatch\scripts\relay_execution_driver.py run --plan … --graph … --hermes <venv python> --board house-shared-runtime-lane-b` |
| 2 | confined scanner-clean workspace | `D:\AI-Workspace\runtime\worktrees\lane-b-b02-classify-scope` @ `9ceadd7` |
| 3 | record provenance **before** dispatch | `ATTEMPT5-PRE-DISPATCH-PROVENANCE.json` (sha256 `c49cb4081fc39f7219018a71db06ebc2594bb616b414d72b12bf1b3e475bde45`) |
| 4 | prove loaded executor = canonical repaired file | **PROVEN TRUE** — see §2 |
| 5 | `PYTHONDONTWRITEBYTECODE=1` | set (verified in dispatch header) |
| 6 | no install / no live-runtime mutation / no scanner remediation | honoured — nothing installed, no file in either skill tree modified |
| 7 | classification only if the stage passes through the normal Relay driver | not obtained (stage failed) |

Pre-dispatch readiness gate (`agent-codex`) was measured **PASS** before dispatch, so this was
not a readiness failure:

```text
EXECUTOR_READY            PASS
executable_health         PASS   codex-cli 0.156.1
auth_readiness            PASS   (ChatGPT login)
invocation_probe          PASS   READY
provenance_session        1
session_route_code        CODEX_SESSION_1_SELECTED
wrapper_sha256            sha256:d106f2a78210c9384291e31dcad383bf34ea15b9c7dae4e48d813c0a614fe6a9
```

## 2. Import provenance — the hypothesis the ruling asked to test

Sol §2 hypothesis: *"attempts 3–4 did not actually execute the canonical driver by absolute script
path, even though their working directory was changed."*

**Measured: the hypothesis is CONFIRMED.** Invoking the canonical driver by absolute path does load
the canonical, repaired executor — so the B-3 `.secretary-relay` exclusion **is** present and active
in the running process:

```text
# python -B -v "<canonical abs path>"  (verbose import trace)
...\hermes-native-vault\skills\kanban-external-agent-dispatch\scripts\__pycache__\direct_external_executors.cpython-311.pyc
    matches ...\hermes-native-vault\skills\kanban-external-agent-dispatch\scripts\direct_external_executors.py

direct_external_executors.__file__ = ...vault\skills\kanban-external-agent-dispatch\scripts\direct_external_executors.py
direct_external_executors sha256   = cc09cca7366478ec97e2493cb12667853fbea17f3f9f63d6109ab8d85ed730a2
HARNESS_EVIDENCE_ROOTS             = ('.secretary-relay',)
_nonbuild_workspace_changed_paths(real workspace) = []          <-- B-3 guard is CLEAN
```

So the B-3 fix works, is loaded, and yet the stage still failed on `.secretary-relay`.

## 3. Proof of the module/file actually executing at the failing guard site

The ruling requires the module, its hash, the guard function source/hash and the **exact failing
call site** — not an inference from cwd. All three were measured.

### 3.1 There are TWO guard sites, not one

`direct_external_executors.execute()` contains two independent fail-closed scope guards:

| Site | Lines (canonical) | Function | Consults `HARNESS_EVIDENCE_ROOTS`? |
|---|---|---|---|
| **A** | `1430`–`1434` | `_nonbuild_workspace_changed_paths` | **yes** (B-3 fix) — clean, `[]` |
| **B** | `1438`–`1454` | `execution_proof.evaluate_workspace_scope(read_only=True)` | **no** — uses `execution_proof.EXCLUDED_PREFIXES` |

Site A was fixed by B-3. **Site B was not.** The attempt-5 failure came from **site B**.

### 3.2 Controlled guard-site reconstruction (throwaway copy; real workspace untouched)

Both guards were exercised on a copy of the confined workspace, writing exactly the five evidence
paths named in the attempt-5 failure message:

```text
site A  _nonbuild_workspace_changed_paths  -> scope_changes = []        A_raises = false
site B  evaluate_workspace_scope(read_only=True)
          verdict  = WRITE_SCOPE_VIOLATION
          reason   = READ_ONLY_MUTATION_OBSERVED
          violations = <the five .secretary-relay evidence paths>
          exact_failure_message_match = true                              B_raises = true
```

### 3.3 Which file/function actually raised

```text
executable / script      D:\...\hermes-native-vault\skills\kanban-external-agent-dispatch\scripts\relay_execution_driver.py
                         sha256 705710c2327458d06ed5fcd502fc8d9cde4fe5ecdea82bdc4d98c277907c80e9
imported module (guard)  D:\...\hermes-native-vault\skills\kanban-external-agent-dispatch\scripts\execution_proof.py
                         sha256 b5a3bf83320f50c2c96998240247264b6ff44957344bb95f2ac4fc2fd18ab144
guard function           execution_proof.evaluate_workspace_scope
                         source sha256 b4ce016edf2b0485150c44e59ff0a69271b57c0a5cb4d765cd2e19d545516ad5
exact failing call site  direct_external_executors.py:1451-1454
                           scope_proof = execution_proof.evaluate_workspace_scope(
                               workspace, scope_before,
                               allowed_paths=allowed_write_paths,
                               forbidden_paths=forbidden_write_paths,
                               read_only=context_mode != "BUILD",
                           )
                           if not scope_proof.get("allowed"):
                               raise DirectExecutorError(
                                   f"DIRECT_EXECUTOR_UNKNOWN:{identity}:scope_violation:" + …)
```

## 4. Root cause (a new, separate defect — not B-3, not the scanner)

`execution_proof._excluded()` uses `str.lstrip("./")`, which treats its argument as a **set of
characters**, not a prefix. Because `.` and `/` are stripped from the **left end only**, a **relative**
path that begins with `./`-family characters loses its leading `.` and can never match `.secretary-relay/`.

`execution_proof.py:70`
```python
normalized = path.replace("\\", "/").lstrip("./")     # <-- character-set strip, not prefix strip
```

Non-vacuity proof of the defect (`ATTEMPT5-NONVACUITY-CONTROL.json`):

| path | shipped `_excluded` | intended |
|---|---|---|
| `.secretary-relay/t_6b5d8d1e/EXECUTION-DRIVER.json` | **False** | True |
| `.secretary-relay/…/agent-codex.stdout.txt` | **False** | True |
| `.git/config` | **False** | True |
| `docs/platform/shared-runtime/BRIEF.md` | False | False |

So **`EXCLUDED_PREFIXES` has never excluded anything** in this helper — neither `.git/` nor
`.secretary-relay/`. `execution_proof`'s own docstring claims `coverage =
"git_tracked_plus_untracked_nonignored"`, but its `_changed_paths()` calls
`git ls-files --others --exclude-standard`, then re-applies a broken exclusion on top.

### 4.1 End-to-end control, both directions (in-memory correction only — no install)

| | harness evidence allowed | unauthorized worker write still caught |
|---|---|---|
| as shipped | **False** (fails on its own evidence) | True |
| `_excluded` corrected in memory (`ATTEMPT5-NONVACUITY-CONTROL.json`) | **True** | **True** (`docs/platform/shared-runtime/OUT-OF-SCOPE-WRITE.md`) |

⇒ correcting `_excluded` fixes the self-blocking failure **without** opening a bypass.

### 4.2 Why this went unnoticed until now

Site A (B-3) was hit first in earlier attempts and fixed. Site B only becomes reachable once site A
passes — which is exactly what attempt 5 achieved. Attempt 5 therefore did **not** reproduce a
"same as before" failure by accident: it advanced past site A and exposed the next guard.

## 5. Blast radius

| Consumer | Present in | Effect |
|---|---|---|
| `execution_proof.py` | canonical **and** installed, identical blob `b5a3bf83…` (vault `HEAD:tools/` ≡ `HEAD:skills/` ≡ installed) | both environments affected |
| introduced by | `e0ed693 feat(relay): add execution proof kernel` | pre-existing; **not** part of the retracted `4d94649` scanner portion and **not** part of B-3 |
| `execution_proof._changed_paths` | used by `capture_workspace_state` and `evaluate_workspace_scope` | report surfaces overcount non-ignored untracked files |
| `DIRECT_EXECUTOR_NOT_READY:…:secret_detected` | — | unrelated; no secret was detected in attempt 5 |

`.git/` being equally unexcluded is benign today only because `git ls-files --others --exclude-standard`
and `git diff --name-only` never emit `.git/…`; the `.secretary-relay/` miss is not benign.

## 6. Consequence for the Sol ruling

Per the ruling's §3: *"If a different fingerprint appears — stop and classify it separately under the
Lane-B repair ladder. Do not spend another attempt by analogy."*

- This is a **different fingerprint** in the sense that matters: a **different guard site** with a
  **different root cause**, proven by measurement.
- **B0.2 still has no verdict.** The one authorized attempt 5 is spent.
- The circular-dependency blocker in `BLOCKER-B02-CIRCULAR-SCOPE-GUARD-2026-09-25.md` §2 is now
  resolved **on its own terms**: attempt 5 proved the installed runtime is **not** an unavoidable
  execution dependency. Sol's Option A ("install B-3 early") is **not needed** for B0.2 to run.
- What now blocks B0.2 is this new guard defect, which is **not** the B-3 fix and **not** the scanner.
  Fixing it is a separate bounded repair under the Lane-B repair ladder and needs its own routing.

## 7. Non-claims

No B0.2 classification was obtained. No install occurred. No live-runtime mutation occurred. No file in
either skill tree (`hermes-native-vault/skills/…`, `data/skills/devops/…`) was modified. No scanner
remediation was attempted. The retracted `4d94649` scanner portion remains retired and was not used.
No card was archived or completed (T78 safety). No merge/cherry-pick. No secret was read, printed or
stored. Lane A is untouched and remains `A0_COMPLETE / W0_PARTIAL`.

## 8. Evidence index

| Artifact | Path | sha256 |
|---|---|---|
| pre-dispatch provenance | `runtime/hermes-native/workspace/dual-lane-20260924/ATTEMPT5-PRE-DISPATCH-PROVENANCE.json` | `c49cb4081fc39f7219018a71db06ebc2594bb616b414d72b12bf1b3e475bde45` |
| guard-site proof | `…/ATTEMPT5-GUARD-SITE-PROOF.json` | `9f600152427fdc2dfff53e74a8fd297467bdb967ea1b490d3bea6989dacf0995` |
| non-vacuity + negative control | `…/ATTEMPT5-NONVACUITY-CONTROL.json` | `f866c3d91c0fcd81010199be4d25b10deac17656df0d6683662b4c777033e13c` |
| dispatch header / driver stdout+stderr | `…/attempt5/` | — |
| probes | `…/attempt5_provenance.py` · `…/attempt5_guard_site_proof.py` · `…/attempt5_nonvacuity_control.py` | — |
| prior blocker | `BLOCKER-B02-CIRCULAR-SCOPE-GUARD-2026-09-25.md` (same directory) | — |

### Observed side-effect on the shared Relay/kanban surface (reported, not fixed here)

While this attempt ran, the `runtime/worktrees/vault-relay-reconcile-20260924` worktree was removed
from disk and from `hermes-native-vault git worktree list` — the **third** occurrence of the T78
class. It was local-only (no remote configured, nothing pushed) at the time it was observed empty, and
the Lane-B planning/execution worktrees and the B0.2 workspace are intact. **No further card was
archived or completed by this session.** See `04_Technical_Ref/host-tooling-and-git-rules.md` §10.14 T78.
