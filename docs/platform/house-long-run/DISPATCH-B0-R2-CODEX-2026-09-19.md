# AGENT DISPATCH — B0 RE-REVIEW (R2) — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Agent: `agent-codex` (same reviewer as R1 — this is NOT a reviewer change)
Review Batch: **B0 — House State Integrity** (evidence gap closed, re-review)
Stage: T0
Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001`
Context mode: **INDEPENDENT-QA**
Recorded: 2026-09-19

## What changed since R1 and why this is a legitimate re-run

R1 (same reviewer, same revision) returned `OWNER_DECISION_REQUIRED` with exactly one blocking
finding: GitHub API access failed inside the reviewer sandbox, so Draft PR #1 metadata could not be
verified. That is a **reviewer tooling-access gap**, not an authority boundary and not a defect in
the reviewed state.

This re-run does **not** ask for a different verdict. It supplies the orchestrator-held
deterministic evidence that R1 could not fetch, and confirms that PR/default-branch disposition is
a T6 deliverable rather than a T0 acceptance criterion. Reviewer identity is unchanged
(`agent-codex`), the revision under review is unchanged, and T0 is not otherwise altered.

## Exact revision under review (unchanged from R1)

`28f571de053c6a7433268e707fe9b9244162d31a`

## Newly supplied evidence (read this)

- `docs/platform/house-long-run/EVIDENCE-B0-PR1-DETERMINISTIC-2026-09-19.md`
  Contains: PR #1 metadata as observed via the authenticated `gh` CLI (OPEN / isDraft=true /
  MERGEABLE / 30 commits / head `feature/platform-control-plane` / base `main`), the PR commit list
  ending at `125af843...`, the branch reflog proving an append-only history with no reset/rebase/
  force-update, and three ancestry assertions.

You are asked to **verify that this evidence is internally consistent with the git objects you can
read directly** (e.g. that `125af843...` is indeed the recorded head, that `f986cd3...` is an
ancestor, that the reflog chain matches the reachable history). You are NOT asked to confirm a
conclusion.

## Required verdict (LONG_RUN contract)

Exactly one of:

```text
BATCH_APPROVED
WORKER_FIX
SENIOR_REMEDIATION_REQUIRED
OWNER_DECISION_REQUIRED
STOP
```

If after reading the supplied evidence a check still genuinely cannot be performed in your
environment, say so explicitly and name the check; do not carry an unresolvable access gap into a
generic owner escalation without naming it.

## Prohibited

- No file modification of any kind. Read-only review.
- No secret values in the report.
- Do not repair findings.

## Report structure (exact)

```text
VERDICT: <one of the five>
REVISION REVIEWED: <sha>
CHECKS PERFORMED: <list with observed results>
FINDINGS: <blocking and non-blocking, each with evidence>
UNSUPPORTED CLAIMS: <none, or list>
UNTESTED AREAS: <list>
```
