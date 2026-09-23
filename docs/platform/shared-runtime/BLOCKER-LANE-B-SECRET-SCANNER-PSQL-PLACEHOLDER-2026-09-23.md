# BLOCKER — LANE B REVIEW R2: SECRET-SCANNER FALSE POSITIVE ON PSQL VARIABLE REFERENCES

Date: 2026-09-23
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
State: **`BLOCKED_TECHNICAL_REMEDIATION` — repair cap reached, escalated**
Authority: locked gate contract §10.1 (per-fingerprint repair ladder)
Reported by: Hermes, Lane-B Relay controller

---

## 1. What is blocked

Review round 2 (`t_cb7bcef6`) was dispatched on the re-frozen pair and failed before the reviewer
could produce a verdict:

```text
DIRECT_EXECUTOR_SECRET_DETECTED
baseline_revision = 7fee6b05ee181466a89b8f3fcae239ff7a5880e7   (pair binding correct)
```

The reviewer never ran. **No R2 verdict exists.**

## 2. Root cause — found and proven

The Relay secret scanner fires on the **Lane B runbooks' own psql variable references**:

```sql
  PASSWORD :'role_password';          <- psql -v variable, NOT a credential
  VALID UNTIL :'window_valid_until';
```

`_is_synthetic_secret_value` has no exemption for this shape, so
`PASSWORD :'role_password` matches the assignment pattern with candidate `role_password`.

**Why Codex triggers it and the earlier OpenCode stages did not:** the review stage is instructed to
read `tools/shared-runtime/**` and the runbooks. Codex echoes what it reads into its stderr, the
wrapper writes that stderr to a log, and `_assert_wrapper_logs_secret_free` scans it — so the
runbooks' placeholder reaches the scanner.

**Measured, not inferred.** Controller scan with the scanner's own two patterns over 122 candidate
files: exactly **5 files** fire, all on the same string:

```text
tools/shared-runtime/h3d/generate-runbooks.mjs                                 line 105
docs/platform/shared-runtime/runbooks/lane-b-role-lane_b_measure_a1-create.sql   line 19
docs/platform/shared-runtime/runbooks/lane-b-role-lane_b_measure_live-create.sql line 19
docs/platform/shared-runtime/runbooks/lane-b-role-lane_b_rw_a1-create.sql        line 19
docs/platform/shared-runtime/runbooks/lane-b-role-lane_b_rw_live-create.sql      line 19
```

Every one is the psql variable reference. **No actual credential is present** — confirmed by grepping
for the real `OLLAMA_API_KEY` value across the same set: 0 hits.

This is the same false positive class recorded earlier on the U-R3 dispatch
(`BLOCKER-LANE-B-U-R1-OPCODE-PROVIDER-AUTH-2026-09-23.md` §12 / `LANE-B-U-R3-EXECUTABLE-CHECKS`),
where it was worked around. It is now reproducible and root-caused.

### 2.1 Prior workaround is not available here

On U-R3 the controller ran the stage gate itself and cleared the hit as a false positive. That is not
possible for an independent Codex review: the whole point of the stage is that a **different agent**
produces the verdict from its own reading. Suppressing the scanner for that stage would be exactly
the "green by weakening the check" outcome the contract forbids, and running the gate myself would
substitute Hermes for the mandated independent reviewer.

## 3. Repair attempt log — cap reached, per §10.1

| # | Attempt | Result |
|---|---|---|
| 1 | U-R3 era: clear the hit as a false positive and run the stage gate as controller | worked for U-R3; **not applicable** to an independent review |
| 2 | Widen the scanner's synthetic-value exemption with a broad "psql variable" pattern (`^'?identifier'?$`) | **REJECTED BY TEST** — it also exempted `password = 'AKIAIOSFODNN7EXAMPLE'` and `secret = 'Xy9zzzz…'`, i.e. it **weakened** the scanner |
| 3 | Narrow the same pattern to `:\s*'identifier'` | **REJECTED BY TEST** — still exempted a non-psql colon string, and did not exempt the real runbook line |
| 4 (diagnostic, not an edit) | Printed the matched text and candidate for the real file | `matched = "PASSWORD :'role_password"` — the match ends at the identifier; the closing quote is **not** part of the match, which is why a `:'name'`-anchored regex cannot fire on it |

Attempt 1–3 are the same Issue Fingerprint (`secret-scanner false positive on psql placeholder`).
Per §10.1 the cap is two ordinary repairs, then classification. That cap is **already exceeded** from
the U-R3 era, and three further edits have now been tried. **No attempt 5.**

All scanner edits were **reverted**. Verified state:

| Check | Result |
|---|---|
| `_PSQL_VAR` edits present | **0** — scanner is pristine |
| Scanner behaviour on real credentials | unchanged (stripe / openai / github / slack / hex all still fire) |
| Earlier verified scope-guard fix | **present** (non-BUILD evidence root no longer counted) |
| `direct_external_executors.py` syntax | OK |
| v2.5.4 release verifier | **27/27 PASS** |

## 4. Why this needs a ruling rather than another edit

The correct fix is a **scanner change in the canonical Agent Relay skill**, and the shape is now
known precisely, but it cannot be done safely by trial:

- the scanner is a **security control**; the last two attempts each *weakened* it in a way the
  controller's own negative controls caught. Continuing to edit it by guesswork is exactly how a
  scanner gets quietly defanged;
- a correct fix must distinguish *"the SQL file contains a psql variable name"* from *"the SQL file
  contains an assigned credential"*. Given the pattern matches `PASSWORD :'role_password` (no closing
  quote included), the reliable discriminator is the **`:'` prefix inside the matched text**, not the
  extracted candidate — which the diagnostic established. That is a real design decision for the
  scanner, and it must ship **with negative controls proving real credentials still fire**;
- `direct_external_executors.py` is part of the protected canonical Relay skill and is listed in the
  v2.5.4 release manifest.

## 5. State at the stop

| Item | Value |
|---|---|
| Frozen pair | planning `7fee6b0` / execution `5334638` — parity EXACT, clean |
| R1 verdict | `REMEDIATE`, five findings verified CLOSED, `NEW-DEFECT-10` raised |
| `NEW-DEFECT-10` remediation | **done and committed** (`5334638`) — gate `G-RUNBOOK-PRIV-LIST-BOUND` + 3 mutation controls, selftest exit 0 |
| R2 verdict | **does not exist** |
| Canonical Relay skill | scanner **pristine**; scope-guard fix present; verifier 27/27 |
| Codex pin | corrected to `gpt-5.6-luna`; readiness PASS; review R1 ran successfully under it |
| LAB / Auth / role mutation | **NONE** |
| Secret persisted | **NONE** |
| Board | `t_cb7bcef6` left `ready`, not falsely closed |

## 6. Options

| Option | Effect |
|---|---|
| **A (recommended)** | Authorize a bounded scanner fix: exempt a psql client-variable reference when the **matched text** contains `:'<identifier>` — shipped together with negative controls proving real credentials still fire (the four probes already used: stripe live/test, openai project key, github pat, slack token, 32-hex value). Then re-dispatch R2 on the unchanged frozen pair. |
| **B** | Rule that the runbooks should not use `PASSWORD :'var'` at all (rewrite to a form that carries no `PASSWORD` token), leaving the scanner untouched. Changes a governed runbook convention. |
| **C** | Rule the review stage exempt from the wrapper-log secret scan. **Not recommended** — it weakens a security control on the one stage that is supposed to be independent. |
| **D** | Rule a different reviewer, or waive the R2 review. |

## 6.1 Exact fix for Option A — already derived and tested offline

The controller worked out the precise discriminator and verified it **read-only** (no edit made):

| Probe | Result |
|---|---|
| matched raw text from the real runbook line | `"PASSWORD :'role_password"` |
| proposed regex `:\s*'[A-Za-z_][A-Za-z0-9_]*` applied to that raw match | **True** (correctly identified as a psql reference) |
| the previous, rejected regex requiring a closing quote (`…'`) | **False** — this is exactly why attempt 3 failed |
| proposed regex applied to `PASSWORD = 'AKIAIOSFODNN7EXAMPLE'` (a credential-shaped value) | **False** (correctly NOT exempted) |

**Why the earlier attempts failed, stated precisely:** the assignment pattern captures
`PASSWORD :'role_password` **without the closing quote** (the pattern's character class excludes it).
Any exemption that anchors on a complete `:'name'` pair can therefore never fire on the real text —
while an exemption loose enough to fire on `role_password` alone also fires on genuine key-like
values. The working discriminator is the **`:'` prefix present inside the raw match**, with no
closing-quote requirement.

**Option A would therefore be:** add `_PSQL_VAR_IN_MATCH = re.compile(r":\s*'[A-Za-z_][A-Za-z0-9_]*")`,
test it against the **raw `matched` text** (not the quote-stripped candidate), and require a
negative-control suite proving real credentials still fire before the change is accepted.

**The controller did NOT apply this.** Deriving a fix is not the same as being authorized to change a
security control inside a protected canonical skill mid-run, and the repair cap for this fingerprint
is already reached. The code above is offered so the Owner's decision can be made on a tested shape
rather than an open question.

## 7. The single decision requested

> **The Relay secret scanner false-positives on the runbooks' own psql variable references
> (`PASSWORD :'role_password'`), so the independent Codex review cannot complete. Two repair
> attempts weakened the scanner and were rejected by test; the repair cap is reached. Which option
> (A / B / C / D) does the Owner rule?**

`next-action: Owner ruling per §10.1 escalation; frozen pair held unchanged`
