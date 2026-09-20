# EVIDENCE — Orchestrator-held deterministic verification for B0 (PR #1 + rewrite check)

Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001`
Purpose: close the evidence gap raised by the B0 reviewer (Codex) at revision `28f571d`.
Recorded by: Hermes (orchestrator / deterministic gate runner)
Recorded: 2026-09-19 (Asia/Bangkok)
Command surface used: `gh` CLI with the existing authenticated session (no secret value printed).

## Why this artifact exists

The B0 review returned `OWNER_DECISION_REQUIRED` with one blocking finding:

> Draft PR #1 OPEN/isDraft status could not be independently verified because GitHub API
> access failed.

That is a reviewer-sandbox access limitation, not a defect in the reviewed state. The underlying
facts are immutable and deterministically observable from the orchestrator side, so this artifact
supplies them explicitly. Nothing here asks the reviewer to change a verdict; it only closes an
evidence gap.

## 1. Draft PR #1 — `Gutumrod/hub-web`

Command: `gh pr view 1 --repo Gutumrod/hub-web --json number,title,headRefName,baseRefName,isDraft,state,mergeable,commits,url`

Observed:

| Field | Value |
|---|---|
| number | `1` |
| title | `feat: add WSTERA Platform Control Plane Demo V2` |
| headRefName | `feature/platform-control-plane` |
| baseRefName | `main` |
| isDraft | `true` |
| state | `OPEN` |
| mergeable | `MERGEABLE` |
| commit count | `30` |
| url | `https://github.com/Gutumrod/hub-web/pull/1` |

Cross-check: the PR's 30 commit OIDs end at
`125af8435f4c80b9525c72405b44807206905fc5`, which is exactly the recorded
`feature/platform-control-plane` head and exactly the House closure branch head. The commit list
also contains `f986cd3c29b1ae4df230c7bdb5e171fa24f78158` (the previously observed Windows handoff
commit), confirming the fast-forward performed during T0 preserved that commit as an ancestor.

Authentication state: `gh auth status` reports logged in as `Gutumrod` on `github.com`
(active account true, token scopes `gist, read:org, repo, workflow`). No token value recorded.

## 2. History-rewrite check

Command: `git reflog show work/house-production-closure-longrun-20260919`

Observed sequence (oldest last):

```
1c3ff72  commit: docs(house): hand off resume point - T0 PASS, B0 harness fix ready
5fb2792  commit: docs(house): dispatch B0 independent review to Codex at T0 revision
28f571d  commit: docs(house): close T0 reconciliation - PRE-01 PASS + B0 packet
a502421  merge origin/master: Merge made by the 'ort' strategy.
8db298b  branch: Created from refs/remotes/origin/work/house-production-closure-longrun-20260919
```

A linear append-only sequence. No `reset`, no `rebase`, no force-update entry.

Ancestry checks (exit 0 = ancestor):

| Check | Result |
|---|---|
| `git merge-base --is-ancestor 8db298b59caa8264e739e30b29e9b49bd8914bd4 HEAD` | ancestor (PASS) |
| `git merge-base --is-ancestor f84a59c5d602ca37c95727997a0d63a709ddd63e HEAD` | ancestor (PASS) |
| `git merge-base --is-ancestor 1556d8a29ce5fa2f408bed981f26d9ef7d61aa33 HEAD` | ancestor (PASS) |

Remote ref history on `origin/work/house-production-closure-longrun-20260919` shows the same
append-only chain (`8db298b` -> `a502421` -> `28f571d` -> `5fb2792` -> `1c3ff72`); every published
head remains reachable from the current head.

## 3. Reviewer's non-blocking findings — orchestrator response

| Reviewer finding | Disposition |
|---|---|
| Branch has two descendants after T0 (`5fb2792`, `1c3ff72`), not one | Acknowledged. Neither touches T0 content: `5fb2792` added the B0 dispatch packet, `1c3ff72` added the resume handoff. Both are coordination docs under the approved path. T0 review remains correctly bound to `28f571d`. |
| Historical installer execution cannot be replayed read-only | Acknowledged and correct. The repair is verified by its *result* (file present, manifest declaration present, structural verifier 25/25 PASS, driver `--help` exit 0), not by replay. Recorded as a permanent evidence limitation, not a defect. |
| Historical "remote parity" at T0 not reconstructible from current refs alone | Acknowledged. Parity is an instantaneous observation recorded at push time; it is not a property recoverable later. Recorded as an evidence limitation. |

## 4. Scope note on PR disposition

Draft PR #1 / default-branch disposition is a **T6** deliverable per the Run Manifest
("Draft PR #1/default-branch strategy is explicitly dispositioned"). It is recorded here as
current state for review completeness; it is not a T0 acceptance criterion. T0's acceptance
contract is: reconciled history + recorded refs + SB01 recorded as external lane + CURRENT_STATUS
overlay + clean tree + remote parity + no out-of-scope source change.
