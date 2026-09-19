# EVIDENCE — WSTERA-HOUSE-PRODUCTION-CLOSURE-001 / PRE-01 + T0

Stage: PRE-01 LONG_RUN PREFLIGHT + T0 HOUSE CANONICAL RECONCILIATION
Review Batch: B0
Recorded: 2026-09-19 (Asia/Bangkok)
Coordinator: Hermes
Owner: Free

Status: `PRE-01 PASS (with 1 technical runtime repair) — T0 merge complete, awaiting B0`

---

## 1. PRE-01 — Runtime provenance

| Check | Result | Evidence |
|---|---|---|
| Canonical Relay skill path | `D:\AI-Workspace\runtime\hermes-native\data\skills\devops\kanban-external-agent-dispatch\SKILL.md` | file present |
| Canonical Relay version | `2.5.3` | `version: 2.5.3` in frontmatter |
| Canonical Relay SHA-256 | `be80473c22ff0eda0f3480b35aa056287983f861c83c6a72a6ef21db721d0d5f` | `sha256sum` |
| Hermes runtime home (`HERMES_HOME`) | `D:\AI-Workspace\runtime\hermes-native\data` | env + gateway bound |
| `assert-relay-runtime.py` guard | `ok=true` (process_home / gateway_home / skill_version all true) | guard JSON |
| Work type | `DIRECT-APPROVED` (Brief line 9) | Brief |
| Brief revision | `c5fd93b5bbe1a23020bb1d4f54992dac5873c51c` | git log |
| Manifest revision | `f84a59c5d602ca37c95727997a0d63a709ddd63e` | git log, manifest APPROVED |
| Owner approval | `Owner Decision: APPROVED` (Manifest §Approval) | Manifest |
| Production Readiness Standard | `policies/PRODUCTION-READINESS-STANDARD.md` v1.0.0 ACTIVE/LOCKED | `origin/main` of wstera-workflows |
| Workflow registry | v1.5.0, WF-DEV-01 v1.3.0 LONG_RUN + WF-RELAY-01 v1.3.0 | `origin/main` |
| Secrets printed | NONE | — |

### 1.1 PRE-01 blocker found and repaired — `RELAY_INSTALL_MANIFEST_MISSING_MODEL_PINS`

Issue Fingerprint: `RELAY_INSTALL_MANIFEST_MISSING_MODEL_PINS`
Failure class: release-install incompleteness · Component: live Relay install vs `RELEASE-MANIFEST.json`
Failing gate: `direct_external_executors` import (and therefore the whole Relay driver path)

Observed:
- The live install of Relay v2.5.3 had **no** `scripts/model_pins.py`.
- `direct_external_executors.py` loads it unconditionally by file path at import time
  (`_PINS_PATH = Path(__file__).with_name("model_pins.py")`), so every entry point
  died with `FileNotFoundError` before doing anything:
  `python relay_execution_driver.py --help` → `FileNotFoundError: ...\scripts\model_pins.py`.
- Root cause: `model_pins.py` was **added** in `a22b37a` (v2.5.3 release) but was **never
  declared** in `RELEASE-MANIFEST.json` `scripts_common`. Both installers copy only the
  manifest-declared set, so the file was never deployed and no drift tool flagged a
  *missing* file (the drift tool only reports extras).
- This was invisible to the v2.5.3 structural verifier, which checks file *presence* of
  helper/driver/adapter but does not assert `model_pins.py` or import-ability. It reported
  25/25 PASS against the broken install.

Repair (Attempt 1 — deterministic, within manifest/runtime authority):
1. Backed up by the installer's own mechanism.
2. Added `"model_pins.py"` to `scripts_common` in the canonical
   `skills/kanban-external-agent-dispatch/RELEASE-MANIFEST.json`.
3. Re-ran the canonical Windows installer
   (`scripts/install-relay-windows.ps1 -HermesHome D:\AI-Workspace\runtime\hermes-native\data`).

Evidence after repair:
- Installer result: `ok: true`, `relay_version: 2.5.3`.
- Guard: `user_home_matches_or_unset / process_home_matches / skill_version_matches /
  gateway_home_matches_or_unset` all `true`.
- `scripts/model_pins.py` now present in the live install (sha256 `30eb534b154b7f0e6392cf95cbe463082d911911295e60c5f443ea1d51222211`,
  byte-identical to canonical skill script and `tools/agent-relay-adapter/` copy).
- `python relay_execution_driver.py --help` → exit 0, prints usage.
- Structural verifier v2.5.3 → `{"pass": true, "count": 25, "total": 25}`.

Note on installer execution environment: `powershell.exe` (Windows PowerShell 5.1) on this
host fails to autoload `Microsoft.PowerShell.Utility` because `PSModulePath` is polluted with
the PowerShell 7.6.6 module tree; `Get-FileHash` is then unavailable and the installer exits
`ok: false` and rolls back safely. Running the same installer under the host's
`pwsh` 7.6.6 (`D:\AI-Workspace\runtime\powershell\7.6.6\pwsh.exe`) succeeds. The installer's
fail-closed + rollback behaviour was verified correct during the failed attempt (live install
was unchanged).

### 1.2 External executor readiness

| Executor | Result | Detail |
|---|---|---|
| `agent-qwen` | **PASS** | v0.23.3, wrapper sha256 `9f379176…`, provider prerequisites PASS, pin PASS (ollama / glm-5.3-flash:cloud), probe sentinel `READY` |
| `agent-codex` | **PASS** | codex-cli 0.147.0, wrapper sha256 `d50e07e4…`, auth `text_authenticated`, sandbox probe `READY` |
| `agent-opencode` | **FAIL** | `DIRECT_EXECUTOR_NOT_READY:agent-opencode:invocation_failed` |

OpenCode detail (bounded diagnosis, no scope drift):
- Registry admission is correct: `"agent-opencode": "opencode-cli"` present; version probe
  `opencode v2.0.3` exit 0; executable present.
- Auth prerequisite PASS (`ollama list` lists the pinned model), but the invocation probe
  returns `exit:1` with `provider.auth / Unauthorized / 401` from the OpenCode server.
- Proven: `opencode run --standalone …` with `OLLAMA_API_KEY` in the caller env **succeeds**
  (returns `READY`, RC=0, session id present), and the same non-standalone call succeeds when
  the caller env carries the key. The 401 path is the shared background service holding a
  stale environment.
- This matches the already-recorded standing condition
  `OPENCODE_PROVIDER_PATH_UNAVAILABLE` (session ledger line 116; routing evidence note;
  vault ledger line 510: "OpenCode เรียกผ่าน canonical relay path ไม่ได้บน host นี้ (PWD MSYS
  + OLLAMA_API_KEY ไม่ inherit + service ค้าง) — ยังไม่ซ่อม").
- Disposition: OpenCode is **not repaired in this task**. Repairing a host-level CLI/service
  environment condition is outside the House closure manifest scope, and the manifest locks a
  *capability slot* (`PRIMARY_GENERAL_IMPLEMENTATION_WORKER`) rather than a permanent identity.
  Implementation work units are therefore routed to the native-swarm pool
  (`hermes-native-swarm` v0.1.0, installed and active) whose `swarm-builder` holds the
  `implementation` capability class, with `swarm-db` / `swarm-tester` / `swarm-inspector`
  covering the other classes T0–T3 require.
  This is recorded as deviation D-1 below.

### 1.3 Owner ruling — git authority (recorded)

Conflict detected: the standing rule `claude-owns-git-commits` forbids every agent except
Claude from committing/pushing in `saas-product-hub`, while this Brief/Manifest authorizes
"commit and push" for the LONG_RUN. The Manifest states that a material Source-of-Truth
conflict is `OWNER_HOLD`, so the conflict was escalated rather than silently resolved.

Owner ruling (2026-09-19): **Hermes may commit and push for this task
(`WSTERA-HOUSE-PRODUCTION-CLOSURE-001`) per its Brief/Manifest — this task only.**

---

## 2. T0 — House canonical reconciliation

### 2.1 Starting refs (reverified at execution, not copied from the Brief)

| Ref | Value |
|---|---|
| Coordination branch | `work/house-production-closure-longrun-20260919` |
| Launch HEAD (checkpoint) | `8db298b59caa8264e739e30b29e9b49bd8914bd4` |
| `origin/master` | `1556d8a29ce5fa2f408bed981f26d9ef7d61aa33` |
| Divergence before T0 | master ahead 2 / branch ahead 25 |
| House worktree | `D:\AI-Workspace\projects\saas-product-hub` |
| Hub/Control repository | `Gutumrod/hub-web` |
| Hub/Control worktree | `D:\AI-Workspace\projects\saas-product-hub\apps\hub-web` |
| Hub/Control closure branch | `work/house-platform-closure-20260919` @ `125af8435f4c80b9525c72405b44807206905fc5` |
| Hub/Control active platform branch | `feature/platform-control-plane` @ `125af843…` (identical to closure branch) |
| Hub/Control default branch | `main` @ `8a3e49330e6cc1d52d6ad3d96fd0d291a66b4f56` |
| Hub/Control divergence | 30 ahead / 0 behind `main` |
| Draft PR #1 | OPEN, `feature/platform-control-plane` → `main`, isDraft=true, 30 commits |
| SB01 external lane | `Gutumrod/stripe-billing` `work/sb01-central-billing-pc-20260911` @ `4d8311b835eb149f44d36e226db4a701d9b37821` |

### 2.2 Merge performed (T0-WU02)

Merged `origin/master` into the LONG_RUN branch with `--no-ff`. No history rewrite, no reset,
no clean, no force push.

```
git merge --no-ff origin/master
Merge made by the 'ort' strategy.
 AGENTS.md                                         | 26 +++++
 docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md | 29 +++++
 2 files changed, 55 insertions(+)
```

Merged governance commits:
- `9793a5b` governance: enforce WSTERA production readiness across products
- `1556d8a` plan: adopt organization-wide WSTERA cybersecurity program overlay

New HEAD: `a502421bfc28bdd3c35458d58f433e3f96248f81`
Pre-merge conflict prediction (`git merge-tree --write-tree`) was clean (0 conflicts).

### 2.3 T0 AUTO_GATE

| Gate | Result |
|---|---|
| `git branch --show-current` | `work/house-production-closure-longrun-20260919` |
| `git rev-parse HEAD` | `a502421bfc28bdd3c35458d58f433e3f96248f81` |
| `git rev-parse origin/master` | `1556d8a29ce5fa2f408bed981f26d9ef7d61aa33` |
| `git merge-base --is-ancestor origin/master HEAD` | **PASS** (exit 0) |
| `git diff --check` | clean |
| Changed-path audit | `AGENTS.md`, `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md` — governance docs only, **no source code** |
| Ahead/behind after merge | 0 behind / 26 ahead of `origin/master` |
| Prior House/SB01 evidence history | preserved (all 24 prior commits still reachable) |

### 2.4 Worktree disposition

- Hub/Control worktree fast-forwarded from `f986cd3` (feature/platform-control-plane) to the
  closure branch at `125af843`. Verified `f986cd3` is an **ancestor** of `125af843`, so no work
  was discarded; the local branch was moved forward only, and the pre-existing
  `feature/platform-control-plane` ref was left byte-identical to `origin`.
- Both worktrees clean except for three pre-existing untracked files under
  `docs/platform/shared-runtime/` (see §4, deviation D-2).

---

## 3. SB01 dependency state (external lane — inspected only, not executed)

| Item | State |
|---|---|
| LR-2C | CLOSED / PASS |
| LR-2D | CLOSED / PASS (Codex PASS at `c59fc85d`) |
| LR-2E | CLOSED / PASS (Codex PASS at `cd7363cf661e69e19e4ee207824cd354110e1180`) |
| LR-2F | **NOT RELEASED** — Task records `Current Worker: (none — LR-2E closed; LR-2F not yet released)` |
| Task file | `docs/tasks/TASK-SB01-LONG-RUN-2C-2F-001.md` @ `4d8311b` |

Consequence: T4 is `PENDING_DEPENDENCY`. T0–T3 are unaffected and proceed.
No temporary billing projection will be created.

---

## 4. Deviations

**D-1 — Implementation-worker routing via native-swarm instead of `agent-opencode`.**
Reason: `agent-opencode` fails the External CLI health gate on this host
(`OPENCODE_PROVIDER_PATH_UNAVAILABLE`, pre-existing and documented, not caused by this task).
The manifest locks the `PRIMARY_GENERAL_IMPLEMENTATION_WORKER` capability slot; the
`hermes-native-swarm` skill (installed/active) provides the equivalent `implementation`
capability class through `swarm-builder`, with `swarm-db`, `swarm-tester`, `swarm-inspector`,
`swarm-release`, `swarm-evidence` for the remaining classes. Work units are routed by the
skill's deterministic capability table, not by judgement. Review independence is preserved:
swarm workers cannot self-approve (`SWARM_REVIEW_REQUIRED` ceiling), and Codex remains the
independent batch reviewer.

**D-2 — Three pre-existing untracked files remain untracked.**
`docs/platform/shared-runtime/{BRIEF-HOUSE-SELL-READY-LONG-RUN-2026-09-16.md,
RUN-MANIFEST-HOUSE-SELL-READY-LONG-RUN-2026-09-16.md,
TASK-HOUSE-SHARED-RUNTIME-ISOLATION-001.md}` were present before this task started, are not on
`origin/master` or any other branch, and belong to a separate shared-runtime isolation work
stream — not to this House closure Task. They were left untouched (not committed, not deleted)
to avoid absorbing unrelated work into this Task. Recorded so T0 "working tree clean" is read
accurately: the tree is clean of *Task* changes; these three files are pre-existing external
untracked artifacts.

---

## 5. Counters

```
Issue Fingerprint: RELAY_INSTALL_MANIFEST_MISSING_MODEL_PINS
Local Fix Attempts: 1/2
Reviewer Remediation Attempts: 0/2
Senior Escalations: 0/1
```

---

## 6. Actual stop / next allowed action

Actual stop: PRE-01 PASS; T0 merge + gate PASS on `a502421`; T0 evidence recorded.
Next allowed action: complete T0-WU03 (`docs/CURRENT_STATUS.md` current overlay + Task
checkpoint update), then submit B0 to Codex for independent review.
