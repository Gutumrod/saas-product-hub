# OpenCode provider config — managed runtime contract

The Lane-B fix for the OpenCode 401 defect was originally a machine-local manual edit.
This directory makes it a **repo-owned, applyable, verifiable** contract so a reinstall,
restore, or config drift can be repaired from the repository.

## Files

| File | Role |
|---|---|
| `opencode-provider-config.canonical.json` | **Source of truth.** The canonical OpenCode provider config. |
| `opencode_contract.py` | `verify` / `apply` / `probe` / `restore` tool. Idempotent and fail-closed. |

## The contract

- `providers.ollama.env = ["OLLAMA_API_KEY"]` — the credential comes from the environment.
- `providers.ollama.settings.apiKey` — **absent by design.** No credential is stored.
- `providers.ollama.settings.baseURL = "https://ollama.com/v1"`.
- `permissions[external_directory] = allow` — required so OpenCode can read a legitimate
  read-only source tree outside its own workspace.

## Usage

Run from this directory (or with an absolute path):

```bash
# check the live config against the contract — writes nothing
python opencode_contract.py verify

# repair the live config from the repo (idempotent; one-time backup kept)
python opencode_contract.py apply

# verify + perform a real dispatch to prove provider auth end to end
# requires OLLAMA_API_KEY in the environment and a non-MSYS PWD
python opencode_contract.py probe

# roll the live config back to the managed backup
python opencode_contract.py restore
```

Exit codes: `0` in sync / success · `1` drift or invalid · `2` usage or IO error.

## Target path

`D:\AI-Workspace\runtime\opencode\cli-v2\config\opencode\opencode.json`

Override with `--target` or the `OPENCODE_RUNTIME_ROOT` environment variable. The
`cli-v2` location is where the OpenCode v2 launcher actually reads configuration — the
`.cmd` wrapper pins `XDG_CONFIG_HOME` to `cli-v2/config`, so `~/.config/opencode` is
**not** the active file.

## Two host preconditions for a dispatch

Both are required and are handled by the dispatch launcher, not by this tool:

1. `OLLAMA_API_KEY` must be present in the **process environment** (never in a file).
2. `PWD`/`OLDPWD` must be cleared. This host's bash exports the MSYS form
   (`/d/AI-Workspace/...`), and OpenCode v2 derives its working directory from `PWD`, so an
   MSYS value makes it fail with `Failed to change directory to …`.

## Policy

- Never hard-code, persist, log or commit a credential. The tool refuses to apply a
  canonical file that contains any credential-like field.
- **Drift fails closed.** The dispatch preflight runs `verify` and stops on drift; it does
  not auto-repair the shared runtime config. Repair is a deliberate operator action.
