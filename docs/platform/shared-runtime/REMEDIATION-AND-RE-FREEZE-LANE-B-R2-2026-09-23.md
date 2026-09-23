# REMEDIATION + RE-FREEZE RECORD — NEW-DEFECT-10 AND THE CODEX PIN FIX

Date: 2026-09-23
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Authority: `SOL_DECISION_GATES_LOCKED`; contract §6 (review), §10.1 (remediation ladder)
Prepared by: Hermes (controller)

---

## 1. Two separate defects were remediated between review R1 and review R2

### 1.1 Codex reviewer unusable — model pin vs account reality

The mandatory Codex review could not run: **every** invocation returned HTTP 400
`The 'gpt-6-luna' model is not supported when using Codex with a ChatGPT account.`

Control proving it was not a pin-configuration error: `codex exec` **with no `--model` flag**
returned the **same 400** — the CLI's own configured default also resolved to the unsupported
model. Measured model matrix:

| Model | Result |
|---|---|
| `gpt-6-luna` (v2.5.4 pin) | 400 |
| `gpt-6`, `gpt-6-codex`, `gpt-5-codex` | 400 |
| **`gpt-5.6-luna`** | **works — replies `READY`** |

Supporting evidence that the pin was never validated: Relay `references/current-routing-evidence.md`
itself records the v2.5.4 pin as *"configuration evidence only; no live Codex model invocation was
run as part of the update, so it does not establish current service availability"*. The same file's
earlier baseline records `gpt-5.6-luna` as the working Codex wrapper default.

**Owner ruled: use the model that works.** The pin was corrected coherently across every site that
enforces or verifies it:

| File | Change |
|---|---|
| `scripts/model_pins.py` — `PIN_CODEX` | `gpt-6-luna` -> `gpt-5.6-luna` |
| `scripts/invoke-codex-worker.ps1` — `$Model` default | -> `gpt-5.6-luna` |
| `SKILL.md` section Codex | -> `gpt-5.6-luna` (+ provenance note) |
| `MIRROR-ONLY__SKILL.v2.5.4.md` | -> `gpt-5.6-luna` (+ provenance note) |
| `verification/MIRROR-ONLY__verify_agent_relay_contract_v2_5_4.py` (2 assertions) | bound to the new model |
| `~/.codex/config.toml` | `model = "gpt-5.6-luna"` |

**Proof after the change:**
- skill release verifier: **`{"pass": true, "count": 27, "total": 27}`** — the release invariant holds,
  not weakened;
- `readiness("agent-codex")` -> **`EXECUTOR_READY: PASS`**, `invocation_probe: {"status":"PASS",
  "method":"codex_isolated_probe","detail":"READY"}`;
- the review then actually ran (see section 3).

Backups of every touched file: `%TEMP%\lane-b-pin-fix\`.

### 1.2 Non-BUILD stages could not run — harness scope guard counted its own evidence

`_nonbuild_workspace_changed_paths` deliberately reports gitignored paths (to catch a worker hiding
a scratch `.log`). Side effect: the Relay driver's **own** stage evidence under
`<workspace>/.secretary-relay/**` counted as a new ignored path, so **every non-BUILD
(review/QA) stage failed closed** with `scope_violation:<harness evidence paths>`. Observed twice:
the Lane-B U-R3 dispatch and the first Codex review dispatch.

**Fix:** exclude the harness-owned evidence root (`.secretary-relay`) from that guard only.
Verified both ways:

| Behaviour | Result |
|---|---|
| harness evidence under `.secretary-relay/**` | **filtered** (no longer a violation) |
| a worker's gitignored scratch write elsewhere (`scratch.log`) | **still reported** — the intended bypass detection is intact |

The repository-local `info/exclude` already hides `.secretary-relay/` (S-Bridge hygiene), so this
aligns the guard with the documented evidence-hygiene contract rather than relaxing it.

### 1.3 Controller defect — the review quoted a stale SHA

Review R1 reported reviewing planning `74db7cc...`; the driver had actually materialized on
`4b792e9...`. Cause: the brief is committed to the planning branch **and named a SHA inside itself**,
so the commit carrying the brief advanced the branch past the SHA it declared.

All reviewed artefacts were verified byte-identical between the two revisions, so R1's substance
stands — but under the contract's invalidation rule R1 is **not inheritable**.

**Fix applied:** the SHAs were removed from the brief entirely. The frozen pair now comes only from
the task card contract and the driver's recorded `baseline_revision`. R2's driver records
`baseline_revision = 7fee6b05ee181466a89b8f3fcae239ff7a5880e7`, matching the declared pair exactly.

---

## 2. Review R1 outcome (pre-remediation baseline)

| Item | Result |
|---|---|
| Verdict (reviewer's own) | **`LANE_B_PAIR_VERDICT=REMEDIATE`** |
| Mutation | none |
| **`NEW-DEFECT-03`, `-05`, `-06`, `-08`, `-09`** | **independently verified CLOSED** |
| New finding | `NEW-DEFECT-10` (HIGH) — runbook carries `allowed`/`denied` privilege arrays |
| Reviewer check anomalies | `npm run selftest` exit 1 and `node h3d/tests.mjs` exit 1 — **sandbox EPERM** (read-only QA sandbox writing a snapshot), classed environmental; both pass outside the sandbox |

Full transcription and controller appraisal:
`REVIEW-CODEX-LANE-B-RECONSTRUCTED-PAIR-2026-09-23.md`.

---

## 3. NEW-DEFECT-10 remediation

### 3.1 Controller appraisal of the finding

The reviewer was right that a privilege list exists in the runbook. Checked more precisely:

- the arrays are **rendered from the sole fixture**, not hand-authored:
  `generate-runbooks.mjs:128-129` -> `sqlArray(ex.allowed_privileges)` / `sqlArray(ex.denied_privileges)`;
- the "bind fail-closed" half of the required fix **already existed**:
  `generate-runbooks.mjs --check` is wired into `npm run selftest`;
- the requested **mutation negative control also already existed** in effect — controller-tested:
  mutate the committed array -> `--check` -> **exit 1** with
  `DRIFT ... (on-disk != render from the sole allowlist source)` -> restore -> clean.

**The genuine residual hole:** `--check` proves *on-disk == render*. It cannot see a hand-authored
list that is **self-consistent with the generator**. That is what the new gate closes.

### 3.2 What was added

Gate **`G-RUNBOOK-PRIV-LIST-BOUND`** in `tools/shared-runtime/h3d/lane-b-gates.mjs`:

every `ARRAY['...']` privilege literal in a runbook must equal, as a set, one of:

- the stage's declared `allowed_privileges`,
- the stage's declared `denied_privileges`,
- the full seven-privilege table universe, or
- the sequence set `SELECT, USAGE, UPDATE` (contract section 3a per-kind primitive);

and must contain no non-privilege token. Anything else is a violation.

**Note on the gate's first run:** it initially flagged the real runbook because the sequence set was
missing from the permitted list — i.e. the gate was too strict, not the runbook wrong. Corrected
after inspection. That is recorded because it shows the gate was verified against reality rather than
tuned to pass.

### 3.3 Mutation negative controls (the part the reviewer asked for)

Wired into the gates selftest, each verified to fail:

| Control | Expected |
|---|---|
| real H3D-LIVE runbook | PASS |
| widen `allowed` with `UPDATE` (a privilege the stage must not hold) | flagged |
| hand-authored extra list outside any permitted set | flagged |
| non-privilege token (`SUPERUSER`) inside a list | flagged |

### 3.4 Remediation scope — verified minimal

```text
5334638  fix(h3d): remediate NEW-DEFECT-10 ...
  tools/shared-runtime/h3d/lane-b-gates.mjs | 95 insertions(+), 1 deletion(-)
  1 file changed
```

Artefacts behind the five closed findings were **not touched**:

| Artefact | vs `54327b1` |
|---|---|
| `lib/six-layer-privileges.mjs` | UNCHANGED |
| `lib/probe-contract.mjs` | UNCHANGED |
| `inventory/lane-b-effective-reach.mjs` | UNCHANGED |
| `h3d/generate-runbooks.mjs` | UNCHANGED |
| `fixtures/lane-b-per-stage-allowlist.json` | UNCHANGED |

Gates after remediation: `npm run selftest` **exit 0** · `sql-static-check` **exit 0** ·
`git diff --check` **exit 0**.

---

## 4. Re-frozen pair for review R2

```text
planning_sha  = 7fee6b05ee181466a89b8f3fcae239ff7a5880e7
execution_sha = 53346383faa2a87fac483a7a3bf5233a200e295d
```

Both branches parity EXACT, worktrees clean. Card `t_9d0fdd37`, hold `t_a7931840`, review
`t_cb7bcef6` (agent-codex, `INDEPENDENT-QA`). The driver recorded
`baseline_revision = 7fee6b05...`, matching the declared pair.

The prior candidate (planning `d631b7d` / execution `54327b1`) **expired** when both SHAs changed,
per the invalidation rule. R1's verdict is therefore not inherited.

---

## 5. Invariants held throughout

| Invariant | Status |
|---|---|
| No LAB / Supabase / Auth / role / grant mutation | **NONE** |
| No live checkpoint started | **confirmed** |
| No secret in config, repo, artifact, log | **0 hits** |
| U-R1 / U-R2 / U-R3 evidence | preserved |
| Legacy Round-5 patch loop | DISABLED |
| Protected skill release invariant | verifier 27/27 PASS after the pin correction |
| Owner `SOL_DECISION_GATES_LOCKED` contract | approval binding intact (`00f0e9e5...` unchanged) |
