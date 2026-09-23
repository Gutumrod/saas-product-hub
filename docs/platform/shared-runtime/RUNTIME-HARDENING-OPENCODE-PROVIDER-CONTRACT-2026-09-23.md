# RUNTIME HARDENING — OPENCODE PROVIDER CONFIG AS A MANAGED, REPO-OWNED CONTRACT

Date: 2026-09-23
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Unit: Runtime hardening (between U-R1 and U-R2)
Authority: Owner instruction — hold U-R2; make Option A a persistent managed runtime fix
Gate: **`OPENCODE_PROVIDER_AUTH_FIX_PERSISTENT / U-R2_ELIGIBLE`** → **PASS** (§6)

State entering: `U-R1 COMPLETE / RUNTIME HARDENING REQUIRED BEFORE U-R2`

---

## 1. The problem this replaces

The previous fix was a **machine-local manual edit** of
`D:\AI-Workspace\runtime\opencode\cli-v2\config\opencode\opencode.json`. That file is
**not inside any git repository** (verified: `git rev-parse` fails on the opencode runtime
root, on `HERMES_HOME`, and on the skill tree). So:

- there was no source of truth for the provider contract;
- a reinstall/restore/config drift would silently reintroduce the 401 defect;
- nothing checked the contract before a dispatch.

This unit moves the contract into a repository and makes it applyable, verifiable and
fail-closed.

## 2. Source of Truth (requirement 1)

Repository: `github.com/Gutumrod/saas-product-hub`
Branch: `work/house-lane-b-longrun-plan-20260922` (the Lane-B planning/contract branch)

| Artifact | Role |
|---|---|
| `tools/shared-runtime/opencode-runtime/opencode-provider-config.canonical.json` | **canonical provider-config contract** — the source of truth |
| `tools/shared-runtime/opencode-runtime/opencode_contract.py` | apply / verify / probe / restore tool (idempotent, fail-closed) |
| `tools/shared-runtime/opencode-runtime/README.md` | operator procedure + rollback |

`tools/shared-runtime/` is the existing shared-runtime tooling home on this branch, so the
contract lives with the rest of the shared-runtime tooling rather than in a new location.

## 3. Canonical contract content

```json
providers.ollama.env                      = ["OLLAMA_API_KEY"]      ← credential source
providers.ollama.settings.baseURL         = "https://ollama.com/v1"
providers.ollama.settings.apiKey          ← ABSENT by design
permissions[external_directory].effect    = "allow"                ← required for the
                                                                     read-only execution
                                                                     worktree
```

There is deliberately **no `apiKey` field** (requirement: `settings.apiKey` must not exist).
The credential is resolved by OpenCode from the process environment at dispatch time.

## 4. Mechanisms

### 4.1 Apply (idempotent)

`python opencode_contract.py apply`

- validates the canonical file first and **refuses to apply if it contains any
  credential-like field** (`apiKey`, `password`, `token`, `secret`, `bearer`);
- if the live config already equals canonical → `ALREADY_IN_SYNC`, **no write**;
- otherwise takes a **one-time** backup (`opencode.json.bak-opencode-contract`; an existing
  backup is never overwritten) and writes the canonical content;
- reads the file back and fails if it does not match.

### 4.2 Verify (drift detection)

`python opencode_contract.py verify`

Checks, in order: canonical file exists and is credential-free; live config exists, parses,
and is credential-free; then a **structural diff** against canonical (order-insensitive for
the permission list, and it reports unexpected extra keys).

Exit codes: `0` in sync · `1` drift/invalid · `2` usage/IO error.

### 4.3 Probe (end-to-end)

`python opencode_contract.py probe`

Runs verify first, then requires `OLLAMA_API_KEY` present and `PWD` not MSYS-shaped, then
performs a **real OpenCode dispatch** and requires the agent to answer exactly `READY`.

### 4.4 Restore (rollback)

`python opencode_contract.py restore` — copies the newest managed backup back over the live
config.

## 5. Verified behaviour (requirement 2, 3 and the drift-recovery proof)

All commands run on this host, `PWD` cleared. Nothing was dispatched twice; U-R1 remained
the only substantive run.

| # | Scenario | Command | Observed |
|---|---|---|---|
| 1 | In-sync verify | `verify` | `PASS OPENCODE_PROVIDER_CONFIG_IN_SYNC`, exit 0 |
| 2 | Idempotent apply, already canonical | `apply` ×3 | `ALREADY_IN_SYNC (no write)` every time, exit 0 |
| 3 | **Drift injected** (original placeholder `apiKey` restored + `permissions` removed — i.e. the reinstall/drift case) | `verify` | **`FAIL live config stores a credential-like field: providers.ollama.settings.apiKey`**, exit **1** — fail-closed |
| 4 | Repair from repo | `apply` | `PASS APPLIED canonical config -> …opencode.json`, exit 0 |
| 5 | Re-verify | `verify` | `PASS OPENCODE_PROVIDER_CONFIG_IN_SYNC`, exit 0 |
| 6 | Drift really gone | inspect | placeholder string **absent**; `permissions` **present** |
| 7 | Repeatable recovery ×2 from a second injected drift (`permissions` removed) | `apply` ×2 | 1st `PASS APPLIED`, 2nd `ALREADY_IN_SYNC`; final `verify` PASS |
| 8 | End-to-end | `probe` | `dispatch returncode=0`, agent said `READY`, `PASS OPENCODE_DISPATCH_PROBE` |
| 9 | Preflight fail-closed, **no auto-fix** | preflight against drifted config | `STOP as designed (fail-closed)`; config sha256 **unchanged** by the failed check |
| 10 | Deliberate repair after that | `apply` then `verify` | `PASS APPLIED` / `PASS …IN_SYNC` |

Scenario 3→4→5 is the requirement-「restore/reinstall or config drift can be applied back
from the repo to canonical state」proof. Scenario 9 is the requirement that the dispatcher
must **not** auto-fix the shared runtime config.

### 5.1 Reinstall simulation — the strongest form of that proof

Run at commit `be21bdb`, after the contract was committed:

| Step | Action | Observed |
|---|---|---|
| 1 | Overwrite the live config with the **original pre-Lane-B backup** (`opencode.json.bak-lane-b-20260923`) — i.e. the exact state a reinstall/restore would produce | placeholder `apiKey` present: True; `permissions` present: False |
| 2 | `verify` | **`FAIL live config stores a credential-like field: providers.ollama.settings.apiKey`**, exit **1** — fail-closed |
| 3 | `apply` (repo only — no manual editing, no memory of the fix) | `PASS APPLIED canonical config -> …opencode.json` |
| 4 | `verify` | `PASS OPENCODE_PROVIDER_CONFIG_IN_SYNC` |
| 5 | `probe` — real OpenCode dispatch | `dispatch returncode=0`, agent said `READY`, `PASS OPENCODE_DISPATCH_PROBE` |

The runtime was returned to the **fully broken original state** and recovered **from the
repository alone**. That is the persistent-fix property the Owner required.

## 6. Acceptance gate — evidence table

| # | Requirement | Result | Evidence |
|---|---|---|---|
| 1 | Canonical config comes from the repo | **PASS** | §2; canonical file is tracked on the planning branch |
| 2 | Apply is repeatable | **PASS** | §5 rows 2, 7 — three consecutive no-op applies; recovery repeated from fresh drift |
| 3 | Verifier passes | **PASS** | §5 rows 1, 5, 7, 10 — `PASS …IN_SYNC`, exit 0 |
| 4 | `OLLAMA_API_KEY` injected from the real environment | **PASS** | `verify` reports `credential source: env OLLAMA_API_KEY (present=True)`; `probe` refuses when the variable is absent; dispatch works only with it exported |
| 5 | OpenCode dispatch passes | **PASS** | §5 row 8 — `OPCODE_DISPATCH_PROBE` PASS, returncode 0, agent answered `READY` |
| 6 | No secret in config / log / artifact | **PASS** | §7 — 0 hits in all six scanned locations |
| 7 | No regression in the related shared runtime | **PASS** | §8 — codex / claude / qwen / agy all healthy; no other file touched |

**Gate result: `OPENCODE_PROVIDER_AUTH_FIX_PERSISTENT / U-R2_ELIGIBLE` — PASS.**

## 7. Secret audit (requirement 6)

The real credential value was grepped for (value never printed) across six locations:

| Location | Hits |
|---|---|
| live OpenCode config | 0 |
| canonical config in repo | 0 |
| contract tool source | 0 |
| managed backup file | 0 |
| Lane-B dispatch artifacts (`.secretary-relay/**`) | 0 |
| OpenCode's own log directory | 0 |

The tool itself is credential-blind: it validates that no credential-like key exists and it
never reads or writes a credential value. The credential enters only the dispatch process
environment.

## 8. No regression (requirement 7)

Post-change executor health on this host:

| Executor | Version | Health |
|---|---|---|
| `agent-opencode` | opencode v2.0.3 | ready (probe PASS) |
| `agent-codex` | codex-cli 0.147.0 | OK |
| `agent-claude` | 2.1.269 (Claude Code) | OK |
| `agent-qwen` | 0.23.3 | OK |
| `agent-agy` | 1.2.8 | OK |

Only the OpenCode provider config was modified. No other runtime file changed.

## 9. Honest limitations

1. **The live config path is still machine-specific.** The contract is repo-owned and
   applyable, but the *deployment* step (running `apply` on a machine) is still a manual
   operator action on this host. There is no automatic deployment on machine bootstrap —
   that would be a separate unit.
2. **There is no scheduler/cron hook** that runs `verify` before every dispatch
   independently of the launcher. The fail-closed check currently lives in the Lane-B
   dispatch launcher
   (`D:\AI-Workspace\runtime\hermes-native\data\.hermes-runtime\lane-b-relay\run-u-r1-dispatch.sh`),
   which is outside the repo.
3. `permissions[external_directory] = allow` is deliberately broad (all external
   directories). It is required because the Relay card legitimately lists the read-only
   execution worktree in `source_of_truth`, and the adapter's own clean-before/diff-after
   allowed-path gate remains the authoritative write-scope boundary. Narrowing it to the
   specific allowed roots would be an improvement, not a correctness fix.
4. The verifier compares **structure**, not file bytes: it does not care about key order or
   formatting. That is intentional (idempotent apply must not thrash the file), but it means
   a comment-only or whitespace-only difference would not be reported.

## 10. Rollback

```
python tools/shared-runtime/opencode-runtime/opencode_contract.py restore
```

or restore manually from `opencode.json.bak-opencode-contract`. The pre-hardening backup
from the original blocker work (`opencode.json.bak-lane-b-20260923`, sha256
`4420743eadf824ec3bcae680caa4090d3ca0a1dd2249a796832c04c33e525778`) is still present and
returns the runtime to its state before any Lane-B change.

## 11. State

| Field | Value |
|---|---|
| U-R1 | COMPLETE (deliverable sha256 `1477ff5acdd07c36bbfe929f57de58eeaa7c3514daae41357dc7d507afae35a2`) |
| U-R2 | **NOT RELEASED** — held pending this gate |
| Gate | `OPENCODE_PROVIDER_AUTH_FIX_PERSISTENT / U-R2_ELIGIBLE` = **PASS** |
| Live mutation (LAB/Auth/role/data) | **NONE** |
| Secret persisted anywhere | **NONE** |
