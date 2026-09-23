# BLOCKER — LANE B CODEX REVIEW: MODEL PIN vs ACCOUNT REALITY (RELAY v2.5.4 CONFLICT)

Date: 2026-09-23
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
State: **`BLOCKED_HARD_STOP`** — contract §10.2 / §8
Supersedes: `BLOCKER-LANE-B-CODEX-REVIEW-PROVIDER-2026-09-23.md` (same root cause, now
root-caused precisely; that record's §3.1 harness finding still stands)
Reported by: Hermes, Lane-B Relay controller

---

## 1. The blocker, stated exactly

The Lane-B frozen pair cannot receive its mandatory Codex independent review because
**the Codex model pinned by the canonical Agent Relay skill cannot be used by this account**,
and **the skill's own structural verifier requires that dead pin**.

```text
canonical Relay SKILL.md  = v2.5.4  (installed 2026-09-23 18:30, mid-run; not by Hermes)
SKILL.md §Codex            = "The canonical Codex pin is `openai / gpt-6-luna / reasoning_effort=medium`"
model_pins.py PIN_CODEX    = openai / gpt-6-luna / medium
```

Measured reality on this host:

| Model | Result |
|---|---|
| `gpt-6-luna` | **HTTP 400** — `The 'gpt-6-luna' model is not supported when using Codex with a ChatGPT account.` |
| `gpt-6` | **HTTP 400** |
| `gpt-6-codex` | **HTTP 400** |
| `gpt-5-codex` | **HTTP 400** |
| **`gpt-5.6-luna`** | **works — replies `READY`** |

**Not a pin-configuration mistake by Hermes.** Two controls settle it:

1. `codex exec` **with no `--model` flag at all** returns the **same 400** — the CLI's own
   configured default resolves to the same unsupported model. So the pin is not the cause; the
   model simply does not exist for this account.
2. `gpt-5.6-luna` — a neighbouring model in the same family naming scheme — **works**.

## 2. Why Hermes did not fix it and move on

Hermes identified the working model and applied the one-line pin change
(`model_pins.py` and `~/.codex/config.toml` → `gpt-5.6-luna`). Codex readiness then went
**PASS** (`codex_isolated_probe: READY`) — i.e. the change demonstrably works.

**It was then reverted**, deliberately, because it is not a bounded repair inside Hermes's
authority:

| Reason | Detail |
|---|---|
| The pinned model is part of a **governed contract**, not a local setting | the canonical Relay `SKILL.md` names the pin, and `references/current-routing-evidence.md` carries routing evidence for it |
| The skill's **own verifier enforces the dead pin** | `MIRROR-ONLY__verify_agent_relay_contract_v2_5_4.py` asserts `'"model": "gpt-6-luna"' in model_pins.py` and `'"gpt-6-luna"' in invoke-codex-worker.ps1` |
| Changing it **breaks the release invariant** | with the working pin applied, the verifier reports `FAIL codex_model_effort_pin` → **26/27** instead of 27/27 |
| Premium/model/provider route changes are **Owner-reserved** | locked gate contract §9 (premium/model/provider policy) and §8 item 9/10 |

So the situation is a genuine contradiction **inside the governed system**:

```text
SKILL v2.5.4 requires pin = gpt-6-luna
this account rejects gpt-6-luna
the only working model is gpt-5.6-luna
the verifier forbids changing the pin
```

**Hermes cannot resolve that without a ruling.** Resolving it by quietly editing a protected,
governed skill and accepting a red verifier is exactly the "green by weakening the check"
outcome the contract forbids.

## 3. What was done instead

1. The working-pin experiment was **reverted**:
   - `scripts/model_pins.py` → restored (`PIN_CODEX.model = gpt-6-luna`)
   - `~/.codex/config.toml` → restored (`model = gpt-6-luna`)
   - backups kept: `%TEMP%\model_pins.bak` (sha256 `a8b9cccc…`), `%TEMP%\config.toml.bak` (sha256 `27e2e29d…`)
2. The skill's structural verifier was re-run and is back to **`{"pass": true, "count": 27, "total": 27}`** — the runtime is not left in a half-modified state.
3. Nothing in the protected skill was committed or left changed.

## 4. Second, independent blocker found on the same dispatch

`PLAN_RELAY_HASH_STALE` — the review plan/store binds `relay_hash = sha256:be80473c…` (v2.5.3),
but `SKILL.md` is now **v2.5.4**, sha256 `c46bca5447696aeafcbb3b1506dbaf1ca22cdc1a8fc26d0df1d17e35abd0dcf2`.

Consequence: **any plan materialized before the 18:30 skill upgrade is stale** and the driver
now fails closed. Every Lane-B plan built so far (U-R1/U-R2/U-R3/this review) carries the v2.5.3
hash. Re-planning is required — but re-planning under a skill whose mandated Codex pin does not
work would only reproduce the blocker above.

Note for the record: v2.5.3 → v2.5.4 was installed **during this run**, after the takeover
record measured and matched the v2.5.3 hash required by the routing override (§13). The
override's §2 rule ("if either skill is missing, unreadable, version-drifted, or the runtime
guard fails, state = `LANE_B_RELAY_PREFLIGHT_BLOCKED`; do not fall back silently") is directly
implicated — this is a **version drift on a protected skill mid-run**.

## 5. Why this is a hard stop, not a technical loop

- The mandatory Codex review (§6) cannot be produced.
- The reviewer may not be silently substituted (canonical Relay skill; contract §9/§8).
- The fix that works breaks the skill's release invariant and the routing evidence.
- The skill changed mid-run without Hermes action, on a protected component the routing override
  binds this task to.

All authorized remediation routes inside Hermes's authority are exhausted. Per §10.2 this names
a §8 condition: **routing/contract change requiring an Owner ruling.**

## 6. State at the stop

| Item | Value |
|---|---|
| Frozen pair | planning `90f5d5c` / execution `54327b1459bdecff1d00b19ca3b8099c5fc4f09a` — parity EXACT, clean |
| Reviewed artefacts | unchanged; approved contract blob still `00f0e9e5…` |
| U-R1 / U-R2 / U-R3 | COMPLETE, evidence preserved |
| Codex verdict | **does not exist** (no successful session — `hermes kanban runs t_83b005f7` → none) |
| Protected skill | **not modified**; verifier 27/27 PASS |
| Runtime config | restored to canonical pin |
| Live checkpoint | not started |
| LAB / Auth / role mutation | **NONE** |
| Secret persisted | **NONE** |

## 7. Options for the Owner

| Option | Effect |
|---|---|
| **A (recommended)** | Owner rules a **pin change to `gpt-5.6-luna`** and authorizes updating the v2.5.4 verifier + routing-evidence to match reality. Restores the mandated review on the frozen pair; Hermes then performs the change and re-proves 27/27. |
| **B** | Owner/routing authority restores availability of `gpt-6-luna` on this account (correct account or model entitlement). Keeps every governed artefact unchanged. |
| **C** | Owner rules a **different reviewer** for this review — a routing/authority change, naming the substitute and its independence basis. |
| **D** | Owner **waives** the independent review for this package. Highest risk: the four prior FAIL rounds make this review the load-bearing control. |
| **E** | Owner rules on the **v2.5.4 mid-run upgrade** itself: whether this task continues under v2.5.4 (and re-plans) or holds at the v2.5.3 contract the takeover bound it to. |

## 8. The single decision requested

> **The canonical Relay pin `gpt-6-luna` no longer works for this account (`gpt-5.6-luna` does),
> and the v2.5.4 verifier enforces the dead pin — so the mandatory Codex review cannot run
> without a routing/contract change. Which option (A/B/C/D/E) does the Owner rule?**

`next-action: Owner ruling per §8 (model-pin / routing authority, and the mid-run v2.5.4 upgrade); frozen pair held unchanged`
