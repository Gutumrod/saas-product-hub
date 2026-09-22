# BLOCKER — LANE B U-R1: `agent-opencode` DIRECT EXECUTOR NOT READY

Date: 2026-09-23
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Unit: U-R1
State: **`LANE_B_RELAY_EXECUTOR_BLOCKED`**
Authority: `OWNER-RULING-LANE-B-HERMES-RELAY-TAKEOVER-2026-09-22.md` §3 (release U-R1)
Reported by: Hermes, Lane-B Relay controller

U-R1 was released and the Relay graph materialized. **No worker ever executed.** The run
stopped at the executor readiness gate, so **no finding was patched, no file was written by
a worker, and no LAB/Auth/secret access occurred.**

---

## 1. What actually ran (measured)

| Step | Result |
|---|---|
| Board created | `house-shared-runtime-lane-b` |
| Relay preflight | PASS (guard `ok:true`, both skill hashes match) |
| Top task | `t_08fb2ca1` |
| Plan prepared | `U-R1-PLAN.json` — route `LONG_RUN` / `STAGE_GRAPH`, 1 worker stage |
| Graph materialized | `t_01c383fe` (`materialization-hold`) → `t_f8b81d92` (`u-r1-ledger`, `agent-opencode`) |
| Hold release | ✓ hold advanced to `done`; worker card advanced to `ready` |
| Worker dispatch | ✗ **BLOCKED at readiness** |
| Driver error | `DIRECT_EXECUTOR_NOT_READY:agent-opencode:invocation_failed` |
| Driver state | `phase: BLOCKED`, `error_code: DIRECT_EXECUTOR_NOT_READY` |
| Worker card end state | `ready` — **never claimed, never executed** |
| Files written by a worker | **none** |
| LAB / Supabase / Auth / secret access | **none** |

---

## 2. Root cause — established, not guessed

`opencode` fails every provider call with **HTTP 401 Unauthorized** because its active
configuration passes a **literal, unsubstituted placeholder** as the API key.

**Active config** (the `.cmd` wrapper pins `XDG_CONFIG_HOME`, so this is the file that is
actually read — not `~/.config/opencode`):

`D:\AI-Workspace\runtime\opencode\cli-v2\config\opencode\opencode.json`

```json
"ollama": {
  "name": "Ollama Cloud",
  "env": ["OLLAMA_API_KEY"],
  "settings": { "baseURL": "https://ollama.com/v1", "apiKey": "{env:OLLAMA_API_KEY}" }
}
```

The stored `apiKey` value is the **11-character literal** `{env:OLLAMA_API_KEY}` — the
placeholder text itself, never substituted at runtime. Every request therefore sends
`Authorization: Bearer {env:OLLAMA_API_KEY}`.

### 2.1 Evidence chain

| # | Test | Result |
|---|---|---|
| 1 | opencode `run` with model `ollama/deepseek-v4.1-flash:cloud` | `{"type":"error","error":{"type":"provider.auth","message":"Unauthorized","status":401}}` |
| 2 | opencode's own log | `AI.Error.Authentication: Unauthorized` / `Failed to drain Session` |
| 3 | `curl` chat/completions → `ollama.com/v1` with the literal placeholder value | **401** |
| 4 | `curl` chat/completions → `ollama.com/v1` with the real credential | **200** |
| 5 | `curl` chat/completions → `127.0.0.1:11434/v1` (local gateway) | **200** |
| 6 | Stored `apiKey` string, recovered verbatim | `{env:OLLAMA_API_KEY}` (11 chars) |

So the model, the network and the credential are all fine: **only the key opencode sends is
wrong.** The provider is not down; the config hands opencode a placeholder.

### 2.2 Two aggravating conditions, both real

1. **The Relay executor does not inject the provider credential.** `direct_external_executors.py`
   sets no environment for `agent-opencode`/`OLLAMA_API_KEY` before invoking it, and this
   terminal session has no `OLLAMA_API_KEY` either. Even a correctly substituted `env` key
   would have to come from the ambient environment at dispatch time.
2. **The bash session's MSYS `PWD` breaks opencode's chdir first.** With
   `PWD=/d/AI-Workspace/...` inherited, opencode exits with
   `Failed to change directory to /d/AI-Workspace/...` — a *different* failure that masks
   the auth failure. Unsetting `PWD`/`OLDPWD` moves it on to the 401. This is the known MSYS
   path trap (`host-tooling-and-git-rules` §1) reaching a Node CLI that trusts `PWD`.

---

## 3. Circuit-breaker position

This is the **same Issue Fingerprint** (`agent-opencode` cannot reach its provider) across
three attempts:

| Attempt | Action | Result |
|---|---|---|
| 1 | Relay driver dispatch | `DIRECT_EXECUTOR_NOT_READY:agent-opencode:invocation_failed` |
| 2 | direct `_probe_opencode_invocation` with the registry binary (`OPENCODE_EXE`) | `exit:1` → provider 401 |
| 3 | isolated-config sandbox with the placeholder removed | **inconclusive** — see §4 |

**STOP reached.** No attempt 4 until there is a new hypothesis or an Owner decision, per the
debugging contract. No ordinary repair is being attempted on a shared runtime config.

---

## 4. Why attempt 3 was inconclusive (honest limitation)

My first two "isolated config" tests were **invalid evidence** and are retracted:

- `D:\AI-Workspace\runtime\opencode\bin\opencode.cmd` **hard-sets** `XDG_CONFIG_HOME` /
  `XDG_DATA_HOME` / `XDG_CACHE_HOME` / `XDG_STATE_HOME` to `cli-v2\…` and then calls the
  launcher. Setting `XDG_*` in my command line therefore had **no effect** — those runs still
  read the placeholder config, so they cannot distinguish the hypothesis.
- Calling the real launcher directly (`D:\AI-Workspace\runtime\opencode\opencode.cmd`) with a
  genuinely separate config dir got past the config layer but then failed at
  `Timed out waiting for the background service to start` — the sandbox cannot bring up
  opencode's service (separate profile/DB/lock), so the auth path was never reached.

**Net:** the 401 cause is established beyond reasonable doubt (evidence 1–6 above). The
*fix* is **not** verified. I am not claiming it is.

### 4.1 Corrected-wrapper re-test (attempt 3b) — same sandbox limit

A third test used a purpose-built temporary wrapper that redirects `XDG_*` to a fresh
sandbox (copying the real wrapper's `SETLOCAL` behaviour so the redirect actually applies),
with `settings.apiKey` removed entirely and `baseURL` pointed at the local gateway
`http://127.0.0.1:11434/v1` — i.e. the config shape option A proposes. Result:

```
Error: Timed out waiting for the background service to start
```

Identical to §4. So even with the redirect working correctly, the sandbox cannot start
opencode's background service, the auth path is never reached, and **the fix remains
unproven**. The shared config was confirmed untouched afterwards (field still the literal
placeholder; file mtime unchanged at Sep 15 20:53).

**Consequence:** verifying option A end-to-end requires either applying it to the real
config and re-running the readiness probe (a shared-runtime change needing authorization),
or resolving why opencode's background service cannot start outside its normal `cli-v2`
data/state paths. Neither is authorized or resolved here.

---

## 5. Shortest safe remediation path

The one-line defect is the literal placeholder in a **shared** opencode runtime config that
other agents and tasks also use. That is outside this task's Lane-B source/test/evidence
scope, so it is **proposed, not applied**.

| Option | Change | Risk / note |
|---|---|---|
| **A (recommended)** | In `cli-v2\config\opencode\opencode.json`, remove the `settings.apiKey` field so the declared `"env": ["OLLAMA_API_KEY"]` is used, and ensure `OLLAMA_API_KEY` is present in the dispatch environment | one field; reversible; but touches shared opencode config and needs the env-substitution path verified |
| **B** | Replace the placeholder with the real credential in that shared config | stores a secret in a runtime config file — conflicts with the no-persisted-secret rule; not recommended |
| **C** | Route U-R1 to a different healthy executor | `agent-codex` and `agent-qwen` are health+auth verified. **Changes the Owner-locked Relay routing** (override §1/§9) → needs an explicit Owner ruling |
| **D** | Grant a bounded, explicitly-scoped repair of the opencode provider config to a worker/Hermes, then re-dispatch U-R1 | turns the blocker into a small authorized unit with its own evidence |

Until one is chosen, the run holds at `LANE_B_RELAY_EXECUTOR_BLOCKED`.

---

## 6. What is NOT affected

- U-R1's brief, plan, graph and board state are intact and reusable — only the dispatch failed.
- No finding was patched; `NEW-DEFECT-08`/`-09` and the open set `ND-03/-05/-06/-08/-09`
  remain exactly as recorded.
- Legacy Round-5 patch loop remains **DISABLED**.
- All Owner checkpoints and live-mutation boundaries remain in force.
- `agent-codex` (0.147.0), `agent-claude` (2.1.269), `agent-qwen` (0.23.3) and `agent-agy`
  (1.2.7) remain executable-healthy and auth-verified; only `agent-opencode`'s **provider
  path** is broken.
