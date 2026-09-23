# BLOCKER — LANE B CODEX INDEPENDENT REVIEW: REVIEWER PROVIDER UNAVAILABLE

Date: 2026-09-23
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
State: **`BLOCKED_HARD_STOP`** — per the locked gate contract §10.2
("all authorized remediation routes are exhausted" / mandatory reviewer unavailable)
Authority: `SOL_DECISION_GATES_LOCKED`; contract §6 (Codex review mandatory before
continuation), §10.2 (hard stop), §8 (Owner decision required)
Reported by: Hermes, Lane-B Relay controller

---

## 1. What happened

The frozen reconstructed pair was released for the mandatory Codex independent review.

```text
planning_sha  = 4b792e9794d921f89efd53998bb83ffbd3b06bf8   (all reviewed artefacts unchanged vs 74db7cc)
execution_sha = 54327b1459bdecff1d00b19ca3b8099c5fc4f09a
board         = house-shared-runtime-lane-b
top           = t_5a99e202
hold          = t_5815f8c4 (done)
review card   = t_83b005f7 (agent-codex, context INDEPENDENT-QA)
```

**No review product exists.** The reviewer never produced a verdict.

## 2. Root cause — measured, not inferred

`agent-codex` cannot execute on this host: **every** Codex invocation returns HTTP 400.

Reproduced directly, outside the Relay, on the real workspace:

```text
ERROR: {"type":"error","status":400,"error":{"type":"invalid_request_error",
        "message":"The 'gpt-6-luna' model is not supported when using Codex with a ChatGPT account."}}
```

| Test | Command | Result |
|---|---|---|
| Pinned model | `codex exec --model gpt-6-luna --sandbox read-only -c approval_policy=never -` | **400** — same error |
| **Control: no `--model` flag** (uses the CLI's own default) | `codex exec --sandbox read-only -c approval_policy=never -` | **400** — **same error** |

The control matters: even with no model flag, the failure is identical. So this is
**not** a model-pin problem that could be fixed by changing the pin — the CLI's own default
resolves to the same unsupported model. The Codex CLI on this machine is configured against a
model that this ChatGPT account cannot use.

Secondary evidence from the same runs:

- `codex_models_manager::manager: failed to load models cache: missing field
  'supports_parallel_tool_calls'` — the local model metadata is stale/malformed;
- `warning: Model metadata for 'gpt-6-luna' not found. Defaulting to fallback metadata`;
- an unrelated MCP transport error (Cloudflare MCP wants OAuth) that does **not** cause the
  failure but pollutes stderr.

Executor health/auth layers still report healthy (`codex-cli 0.147.0`, `text_authenticated`):
the binary exists and the session is authenticated. **Health is necessary but not sufficient** —
the substantive call is refused. This is exactly the distinction the Relay's own readiness
contract draws.

## 3. What was already tried (so it is not repeated)

| # | Attempt | Result |
|---|---|---|
| 1 | Relay dispatch of the review card | failed — `scope_violation` on the harness's own `.secretary-relay/**` evidence paths |
| 2 | Bounded repair of the non-BUILD scope guard (exclude the harness evidence root — the S-Bridge hygiene already git-excludes it; the `.log`-scratch bypass stayed closed and was verified) | **repair worked** (scope error gone) → revealed the real failure below |
| 3 | Relay re-dispatch | failed — `DIRECT_EXECUTOR_SECRET_DETECTED:wrapper_log:…stderr.log` |
| 4 | Isolated reproduction of the wrapper with the real prompt | wrapper-log check came back **CLEAN** — the "secret" was not reproducible from the prompt |
| 5 | Direct Codex invocation, pinned model | **400 unsupported model** ← root cause |
| 6 | Direct Codex invocation, **no model flag** | **400, identical** ← proves it is not the pin |

Attempts 2 and 5/6 are different Issue Fingerprints (a harness scope-guard defect vs. a
reviewer-provider defect), so the repair counter is per-fingerprint; the provider fingerprint
reached its conclusion in one step because the failure is deterministic and externally caused,
not an ambiguity to iterate on.

**The harness repair from attempt 2 was reverted** (`direct_external_executors.py` restored to
its pre-repair state, sha256 `705083a92130f386d94e5f74ad5265a2f85ac49acda06b8a3b1d0e6fb181ebc1`).
Rationale: it is a change to a **protected** component (the canonical Agent Relay skill's own
scripts) that was not needed once the real blocker was identified, and it would have altered
the runtime under review. It is recorded here as a genuine defect found, not applied.

### 3.1 The scope-guard defect is real and worth fixing separately

Measured and verified while diagnosing: `_nonbuild_workspace_changed_paths` is *designed* to
report gitignored paths (to catch a worker hiding a scratch `.log`). Its side effect is that the
Relay driver's **own** stage evidence under `<workspace>/.secretary-relay/**` counts as a new
ignored path, so **every non-BUILD (review/QA) stage fails closed** with
`scope_violation:<harness evidence paths>`. Observed twice (Lane-B U-R3, then this review).
The verified fix (exclude only the harness evidence root) preserved the intended bypass
detection. **Not applied** — recorded for a separate authorized remedy.

## 4. Why this is a hard stop rather than a technical loop

The locked contract makes a Codex independent review **mandatory** before continuation (§6),
and the review identity is bound to the frozen pair. Therefore:

- the run cannot advance without it;
- **the reviewer cannot be substituted** — silent substitution is forbidden by the canonical
  Relay skill and by the contract's §9 (premium/model/provider routes are fixed:
  Codex review gates + one bounded Claude remediation **only after Codex returns
  `SEND_TO_CLAUDE`** — which requires a Codex verdict that cannot be produced);
- changing provider, model, or reviewer **is** a routing/authority change, which §8 reserves
  to the Owner.

Routing `agent-claude` (healthy, 2.1.269) as a substitute reviewer would be exactly the kind of
silent role substitution the contract forbids, and would also collapse the independence the
review exists to provide. **Hermes is not doing that.**

## 5. State at the stop

| Item | Value |
|---|---|
| Frozen pair | planning `4b792e9` / execution `54327b1` — both parity EXACT, clean |
| Reviewed artefacts | unchanged (contract blob still `00f0e9e5…`, approval binding intact) |
| U-R1 / U-R2 / U-R3 | COMPLETE, evidence preserved |
| Codex verdict | **does not exist** |
| Harness changes left in place | **none** (repair reverted) |
| Live checkpoint execution | not started |
| LAB / Auth / role mutation | **NONE** |
| Secret persisted | **NONE** |
| Board | `t_83b005f7` left `ready`, not falsely closed |

## 6. Options for the Owner

| Option | Effect | Note |
|---|---|---|
| **A. Restore Codex availability** (correct account/model configuration for the Codex CLI on this host) | the mandated review proceeds unchanged on the frozen pair | **recommended** — it is the only path that keeps the locked routing and the review's independence |
| B. Owner rules a different reviewer for this review | changes the locked routing/authority model — requires an explicit Owner decision naming the substitute and its independence basis | would also need the contract §6/§9 implications addressed |
| C. Owner accepts the package without an independent review | explicit, recorded waiver of a mandatory gate | highest risk; the four prior FAIL rounds make this review the load-bearing control |
| D. Authorize the separate harness fix (§3.1) | unblocks non-BUILD stages generally | independent of the Codex provider problem; does not by itself produce a review |

## 7. The single decision requested

> **Codex cannot execute on this host (HTTP 400, unsupported model, reproducible without any
> model flag). The mandatory independent review therefore cannot be produced. Which option
> (A / B / C / D) does the Owner rule?**

`next-action: Owner decision per §8 (reviewer availability / reviewer change); frozen pair held unchanged`
