# HANDOFF — WSTERA-HOUSE-PRODUCTION-CLOSURE-001 — Resume Point 2026-09-19

Task ID: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001`
Workflow: `WF-DEV-01 v1.3.0` / `LONG_RUN` + `WF-RELAY-01 v1.3.0`
Runtime: `kanban-external-agent-dispatch v2.5.3` (+ `hermes-native-swarm` v0.1.0 for implementation lanes)
Repository: `Gutumrod/saas-product-hub`
Branch: `work/house-production-closure-longrun-20260919`
Status: `T0 GATE PASS — B0 DISPATCHED, EXECUTION BLOCKED ON HARNESS SCOPE ERROR (self-inflicted, fix ready)`
Recorded: 2026-09-19 (Asia/Bangkok)
Session stopped: Owner requested pause, resume next day

## Exact current revision

```
House branch HEAD          : 5fb279288d722cb906342a94ea9667129748ceec
House remote HEAD          : 5fb279288d722cb906342a94ea9667129748ceec   (PARITY PASS)
T0 content revision        : 28f571de053c6a7433268e707fe9b9244162d31a
Prior launch checkpoint    : 8db298b59caa8264e739e30b29e9b49bd8914bd4
Governance base (master)   : 1556d8a29ce5fa2f408bed981f26d9ef7d61aa33   (now an ancestor)
Worktree                   : D:\AI-Workspace\projects\saas-product-hub
Ahead/behind master        : 0 behind / 28 ahead
```

Hub/Control (`Gutumrod/hub-web`, worktree `apps/hub-web` inside the House worktree):
```
main                          : 8a3e49330e6cc1d52d6ad3d96fd0d291a66b4f56
feature/platform-control-plane: 125af8435f4c80b9525c72405b44807206905fc5  (30 ahead / 0 behind main)
work/house-platform-closure-20260919: 125af843...  (identical to feature branch; PINNED, local branch checked out)
Draft PR #1                   : OPEN, feature/platform-control-plane -> main, 30 commits
```

SB01 external lane (`Gutumrod/stripe-billing`) — **do not execute**:
```
work/sb01-central-billing-pc-20260911 : 4d8311b835eb149f44d36e226db4a701d9b37821
LR-2C CLOSED/PASS · LR-2D CLOSED/PASS · LR-2E CLOSED/PASS (Codex PASS cd7363cf)
LR-2F : NOT RELEASED  -> T4 must be DEPENDENCY_WAIT
```

## What is DONE

- **PRE-01 PASS.** Full runtime provenance verified (Relay v2.5.3 sha256 `be80473c...`, guard `ok=true`,
  HERMES_HOME canonical, Brief/Manifest/Owner-approval read, WF registry + Production Readiness
  Standard v1.0.0 pinned). Evidence: `docs/platform/house-long-run/EVIDENCE-PRE01-T0-WSTERA-HOUSE-PRODUCTION-CLOSURE-001.md`.
- **One runtime defect found + repaired (1/2 attempts).**
  Fingerprint `RELAY_INSTALL_MANIFEST_MISSING_MODEL_PINS`: the v2.5.3 live install was missing
  `scripts/model_pins.py` because `RELEASE-MANIFEST.json` never declared it; the module is loaded
  unconditionally by path at import in `direct_external_executors.py`, so the entire Relay driver
  path died with `FileNotFoundError`. Fix: added `"model_pins.py"` to `scripts_common` in the
  canonical manifest and re-ran the Windows installer. Result: structural verifier **25/25 PASS**,
  `relay_execution_driver.py --help` exit 0, file byte-identical across canonical skill /
  `tools/agent-relay-adapter` / live install.
  - Installer env trap: `powershell.exe` 5.1 on this host cannot autoload `Microsoft.PowerShell.Utility`
    (`PSModulePath` polluted by PS 7.6.6), so `Get-FileHash` is unavailable and the installer exits
    `ok:false` **and rolls back safely**. Run it with `pwsh` 7.6.6:
    `D:\AI-Workspace\runtime\powershell\7.6.6\pwsh.exe -NoProfile -ExecutionPolicy Bypass -File <install-relay-windows.ps1> -HermesHome D:\AI-Workspace\runtime\hermes-native\data`
- **T0 GATE PASS.** `origin/master` merged with `--no-ff` into the LONG_RUN branch; changed paths were
  governance docs only (`AGENTS.md`, `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md`); no source
  code; no rebase/reset/force push; all prior House/SB01 history preserved; `git diff --check` clean;
  `origin/master` is an ancestor. `docs/CURRENT_STATUS.md` now carries a 2026-09-19 current overlay
  that separates verified current state from retained historical text.
- **Owner ruling recorded:** Hermes MAY commit+push for THIS task only (conflict between the
  `claude-owns-git-commits` standing rule and this Brief's "commit and push" authorization; Manifest
  rules a material Source-of-Truth conflict as `OWNER_HOLD`, so it was escalated, not assumed).
  Owner decision 2026-09-19: allowed, this task only. Memory updated.
- **Both worktrees pinned and clean.** hub-web local branch moved fast-forward `f986cd3` -> `125af843`
  (verified ancestor, no work discarded).

## What is BLOCKED and exactly how to unblock

### B0 — Codex independent review: NOT COMPLETE

Blocker is **self-inflicted harness configuration**, not a real defect:

```
DIRECT_EXECUTOR_UNKNOWN:agent-codex:scope_violation:
  .house-b0-review/agent-codex.stdout.txt,
  .house-b0-review/wrapper-logs/codex-worker-*.stderr.log,
  .house-b0-review/wrapper-logs/codex-worker-*.stdout.log,
  .house-b0-review/wrapper-logs/codex-worker-*.prompt.txt
```

Cause: the executor's non-BUILD mutation guard compares workspace diff before/after and fails closed
when the executor's own stdout/log artifacts appear **inside** the reviewed workspace. The first
attempt put `output_dir` at `D:\AI-Workspace\projects\saas-product-hub\.house-b0-review` — inside the
repo. Guard behaved correctly; the invocation was wrong.

**Fix already prepared and verified on disk:**

```
Runner: D:\AI-Workspace\runtime\hermes-native\workspace\house-b0\run_b0.py
Output: D:\AI-Workspace\runtime\hermes-native\workspace\house-b0\   (OUTSIDE the repo)
```

The stray `.house-b0-review/` directory has been **removed** from the repo (it was untracked; nothing
was lost). To resume, simply run:

```bash
cd /d/AI-Workspace/projects/saas-product-hub
python D:/AI-Workspace/runtime/hermes-native/workspace/house-b0/run_b0.py
```

Expected: prints readiness `PASS`, executes Codex in `isolated` context mode, writes
`B0-REVIEW-REPORT.md` into the output dir, and prints the report with a
`VERDICT: BATCH_APPROVED | WORKER_FIX | SENIOR_REMEDIATION_REQUIRED | OWNER_DECISION_REQUIRED | STOP`.

If it again reports a scope violation, the alternative is to pass
`allowed_write_paths=['<relative output dir>']` to `dee.execute(...)` — but prefer the out-of-repo
output dir, which needs no scope widening.

Codex readiness itself is `PASS` (codex-cli 0.147.0, wrapper sha256 `d50e07e4...`, auth
`text_authenticated`, sandbox probe `READY`) — the reviewer is available, only the harness path was wrong.

### After B0 returns

- `BATCH_APPROVED` -> release **T1 (R15 least-privilege)**.
- `WORKER_FIX` -> apply findings then re-review B0.
- `OWNER_DECISION_REQUIRED` / `STOP` -> hard stop, return to Owner.

## Stage state

| Stage | State | Note |
|---|---|---|
| PRE-01 | **PASS** | 1 runtime repair, evidenced |
| T0 / B0 | **T0 GATE PASS / B0 dispatched, execution blocked on harness** | fix ready |
| T1 / B1 | PENDING | R15 least privilege — release after B0 APPROVED |
| T2 / B2 | PENDING | product-event signer hardening |
| T3 / B3 | PENDING | shared one-time fulfillment (Reuse Gate required first) |
| T4 / B4 | **PENDING_DEPENDENCY** | SB01 LR-2F NOT released — `DEPENDENCY_WAIT`, no workaround |
| T5 / B5 | PENDING | production readiness + controlled apply/deploy/live proof |
| T6 / B6 | PENDING | final reconciliation + dependency matrix |

Counters: `Local Fix Attempts: 1/2` (relay install) · `Reviewer Remediation Attempts: 0/2` ·
`Senior Escalations: 0/1`.

## Deviations (recorded, not hidden)

- **D-1 — implementation routed via `hermes-native-swarm` instead of `agent-opencode`.**
  `agent-opencode` fails the External CLI health gate on this host with the pre-existing, documented
  `OPENCODE_PROVIDER_PATH_UNAVAILABLE` condition (401 from the shared OpenCode background service).
  Evidence gathered: registry admission is correct, `opencode --version` = 2.0.3, auth prerequisite
  PASS, `opencode run --standalone` with `OLLAMA_API_KEY` in the caller env **succeeds** (RC 0,
  sentinel `READY`), so the failure is a host service-environment condition, not a House defect.
  Repair is out of House closure scope. The manifest locks the `PRIMARY_GENERAL_IMPLEMENTATION_WORKER`
  **capability slot**, not a permanent identity, and `hermes-native-swarm` v0.1.0 (installed/active)
  supplies the equivalent `implementation` class via `swarm-builder`, with `swarm-db`, `swarm-tester`,
  `swarm-inspector`, `swarm-release`, `swarm-evidence` for the other classes. Swarm workers cannot
  self-approve (`SWARM_REVIEW_REQUIRED` ceiling); Codex remains the independent batch reviewer.
  **Not yet exercised:** no implementation work unit has been dispatched through swarm yet.
- **D-2 — three pre-existing untracked files left untouched.**
  `docs/platform/shared-runtime/{BRIEF-HOUSE-SELL-READY-LONG-RUN-2026-09-16.md,
  RUN-MANIFEST-HOUSE-SELL-READY-LONG-RUN-2026-09-16.md,
  TASK-HOUSE-SHARED-RUNTIME-ISOLATION-001.md}` — pre-existing, on no branch, belonging to a separate
  shared-runtime isolation work stream. Not committed, not deleted, so they are not silently absorbed
  into this Task.

## Hard boundaries still in force

- SB01 is a separate lane. T4 waits for an **exact accepted LR-2F projection contract**. No temporary
  billing projection, no synthesized contract.
- `canExecutePaymentActions: false` is invariant in Control.
- No product repository writes. No destructive DB operation. No new paid service. No secret printing.
- No production mutation before T5 pre-deploy gates + independent B5 review.

## Next allowed action

Run the prepared B0 runner (command above), record the verdict, then proceed per the stage graph.
