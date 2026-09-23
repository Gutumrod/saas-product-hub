# FOP-WU6 — commander disposition of a FAIL lane state

Task: `WSTERA-CONTROL-TRUTH-SYNC-001` · Lane A · F-OP-01 amendment
Recorded: 2026-09-23 (Asia/Bangkok) · Recorded by: Hermes (Long-Run Orchestrator / State Holder)

This record exists because a lane evidence file on disk says
`SWARM_WORK_UNIT_FAIL` while the revision that lane produced was subsequently
committed, independently reviewed, and approved. That discrepancy is a real
thing a reviewer or an Owner must be able to audit, so it is written down
plainly rather than left implicit.

## 1. What the evidence says

```text
file:  D:/AI-Workspace/runtime/hermes-native/workspace/wstera-cts-001/fop-amendment/out-fop-wu6/fop-wu6/evidence-fop-wu6.json
state: SWARM_WORK_UNIT_FAIL
reasons:
  DETERMINISTIC_CHECK_FAILED:no-live-authorization-claim
  DETERMINISTIC_CHECK_FAILED:only-three-docs-touched
worker self-report state: PASS
```

## 2. What the two failing checks actually did

Both were commander-authored inline `declared_checks`, and both were wrong.

**`no-live-authorization-claim`** was authored as
`! grep -niE 'F-OP-01 is (closed|approved)|live access is authorized' <docs>`.
It matched two sentences that are the *opposite* of a claim:

```text
FINDING-...md:198   "...operator-contract level**, and no live access is authorized by this document."
FOP-01-...PACKET:528  "- no live access is authorized by this packet, by the helper, or by the runbook;"
```

The check treated a prohibition as a claim. The documents were correct.

**`only-three-docs-touched`** compared the working tree against a declared
three-document allowlist. At the time it ran, the *previous* work unit's helper
and harness changes were still uncommitted, so their six files appeared as
extra changed paths and were counted as out-of-scope for WU6. WU6 itself
touched only its three declared documents.

Both defects are instances of the same failure mode that recurred five times in
this workstream: a check reading a prohibition as an instruction, or comparing
against the wrong baseline in time.

## 3. What the commander verified instead of trusting the FAIL

Independently measured after the lane finished:

```text
helper  sha256 d87bd4aa938d0d0a853cea84289e182d29e2cafe6237ff2df3e4fb5a3a77398b  (== the WU5-post value; WU6 did not touch it)
harness sha256 f62317c26923a0b41b143e48f0ed71ea8b8c5f8b1f4e2deb52ba89e4440f0b8c  (unchanged)
runbook        WORKER_LIVE_PROOF_MISSING present (the live-Worker gate WU6 was asked to document)
packet         current helper hash present; CHANGES_REQUIRED recorded
finding        states NOT approved and review pending
git diff --name-only f68af69 -- docs/platform/house-long-run/  ->  the 3 docs plus the WU5-owned tools paths only
git diff --check -> clean
secret scan over the five docs+tools artifacts -> 0 findings
```

A dedicated checker was then written to encode the correct rules
(`check_fop_docs.py`): comment-aware where relevant, and **negation-aware** — a
sentence containing a negation such as "no", "not", "never" or "pending" before
the matched phrase is not counted as a claim. That checker passes 6/6 on the
same documents, confirming the artifacts are correct and the two inline checks
were not.

## 4. Disposition

The commander dispositioned WU6 as **content-complete and correct**, on the
strength of the independent measurements in §3, and proceeded to commit the
remediation revision `4ca08f2` — which the independent reviewer then examined in
round 2 and approved (`APPROVED_WITH_FINDINGS`, no finding requiring artifact
change).

**What this record does NOT claim:**

- It does not claim the lane state was PASS. On disk it remains
  `SWARM_WORK_UNIT_FAIL`, exactly as the skill wrote it. The skill's verdict
  logic was correct given the observations it was handed; the observations were
  wrong because the checks were wrong.
- It does not claim the two failing checks were harmless in general. A FAIL
  state that a human overrides is exactly the situation where a real defect can
  be waved through. What licenses this override is that each failing check was
  traced to a specific, reproducible authoring error in the check itself, and
  that the artifacts were re-verified by other means rather than assumed good.
- It does not claim a lane may be overridden by assertion. A lane may only be
  dispositioned against measurements taken after the lane finished.

## 5. Lesson recorded (evidence only, not codified)

A `declared_check` that asserts the *absence* of a string in prose is fragile:
prose that forbids something necessarily contains the words for that thing.
Checks over documents should be authored as negation-aware scripts, or written
against structured fields, rather than as bare inverted greps. Recorded in
`host-tooling-and-git-rules.md` §10.5 alongside the other four instances of the
same pattern. Not codified, per the Owner ruling of 2026-09-22.
