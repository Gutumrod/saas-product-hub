# SOL REVIEW REQUEST — LANE B OWNER DECISION GATE CONTRACT

Date: 2026-09-23
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Requester: Hermes (Lane-B orchestrator / state holder) — **requesting review, not deciding**
Review subject: commit `959605b38a4917a18f7218a97393d78030e164ce` on
`work/house-lane-b-longrun-plan-20260922`
Reviewer requested: **Sol**
Authority for this request: Owner instruction 2026-09-23 — "ผู้รับผิดชอบ review จุดนี้คือ Sol
ไม่ใช่ Hermes และไม่ควรให้ Owner approve แบบ blind"
Hermes authority boundary: **Hermes must NOT decide, amend, approve, or self-resolve this
contract** (Owner instruction item 5).

---

## 1. What is under review, and why Hermes did not decide it

Commit `959605b` ("docs(platform): lock Lane B owner decision gates") was authored in the
**Owner identity** (`Gutumrod <titazmth@gmail.com>`) on 2026-09-23 11:06 +0700. Hermes did not
author it, did not request it, and did not review it.

It adds two files:

| File | Lines | Role |
|---|---|---|
| `OWNER-DECISION-GATE-CONTRACT-LANE-B-2026-09-23.md` | 242 | proposed authority/routing model for the remainder of Lane B |
| `BRIEF-RESUME-LANE-B-HERMES-RELAY-AFTER-OPENCODE-RECOVERY-2026-09-23.md` | 203 | resume brief reflecting post-OpenCode-recovery state |

The contract's own §14 states it **"becomes canonical only after one explicit Owner approval
of this exact revision"** and names the resulting canonical state
`SOL_DECISION_GATES_LOCKED`. **That approval has not been given** in this session.

Because the document changes the authority/routing model, Hermes referred it rather than
absorbing it, freezing the candidate, or presenting it to the Owner as a blind approval.
`CODE_REVIEW` and the Codex independent review have **not** been started.

## 2. Exact review instructions (Owner, verbatim intent)

1. Freeze current state — do not enter Codex review.
2. Route the gate contract in commit `959605b` to **Sol review**.
3. Sol must check it against the governance / role boundaries / long-run contract actually in
   force, specifically:
   - Owner authority
   - Sol decision / final-verify authority
   - Hermes orchestrator authority
   - Codex independent-review boundary
   - premium / routing policy
   - top-level task closure authority
   - the points that must be `OWNER_DECISION_REQUIRED`
4. Sol must report:
   - what matches existing governance
   - what changes from existing governance
   - conflicts with exact file/section
   - the minimum amendment required, if any
   - a verdict on whether the contract is ready to lock
5. Hermes must not amend the contract.
6. If verdict = `READY_TO_LOCK` and no Owner-level policy change is needed → escalate to the
   Owner for approval as `SOL_DECISION_GATES_LOCKED`.
7. If Sol finds a policy/authority change requiring an Owner ruling → ask for **only that
   decision**, with evidence and impact.

## 3. Documents Sol should compare against (measured, exact)

| Document | Path / revision | Relevance |
|---|---|---|
| Proposed gate contract | planning `959605b`: `docs/platform/shared-runtime/OWNER-DECISION-GATE-CONTRACT-LANE-B-2026-09-23.md` | subject |
| Lane-B routing override in force | planning: `docs/platform/shared-runtime/OWNER-ROUTING-OVERRIDE-LANE-B-HERMES-RELAY-CONTROLLER-2026-09-22.md` (commit `1943d1a`) | current routing authority for this task |
| Owner takeover ruling | planning: `docs/platform/shared-runtime/OWNER-RULING-LANE-B-HERMES-RELAY-TAKEOVER-2026-09-22.md` | commit authority + candidate-pair model |
| Lane-B long-run brief | planning: `docs/platform/shared-runtime/BRIEF-LANE-B-SHARED-RUNTIME-LONG-RUN-CLAUDE-AGY-CODEX-2026-09-22.md` | stage path, role map, checkpoints |
| Run manifest | planning: `docs/platform/shared-runtime/RUN-MANIFEST-LANE-B-SHARED-RUNTIME-LONG-RUN-2026-09-22.md` | locked stage ordering |
| Canonical Relay skill | `…\data\skills\devops\kanban-external-agent-dispatch\SKILL.md` v2.5.3, sha256 `be80473c…d0d5f` | execution/review role separation, failure protocol |
| Council gate skill | `…\data\skills\reasoning\llm-council-gate\SKILL.md` | release semantics (not used for this route) |
| Precedent Sol/Owner closure package | `D:\AI-Workspace\runtime\reviews\sb01-lr2fa-native-swarm\LR2FA-OWNER-SOL-CLOSURE-PACKAGE.md` | how Sol/Owner packages were previously prepared |
| S-Bridge canonical decision | vault `04_Technical_Ref/secretary-gpt-hermes-bridge.md` | Owner ↔ Secretary GPT ↔ Hermes boundary; states the bridge does not transfer decision authority to Hermes |

## 4. Hermes's own observations — for Sol to verify or reject (NOT conclusions)

Hermes is not judging the contract. It records what it observed, so Sol can check each point
against the sources rather than re-deriving it:

| # | Observation | Where it appears |
|---|---|---|
| O1 | Introduces a named authority layer **"Sol"** positioned "below Owner, above Hermes" for technical governance | contract §2 roles, §7 |
| O2 | Introduces a new authority-state vocabulary of six states | contract §3 |
| O3 | §4 pre-authorizes Hermes to continue a long list of actions **without** Owner input | contract §4 |
| O4 | Restricts mandatory Owner stops to a **closed list of twelve** (§8) | contract §8 |
| O5 | States that outside §8 gates, silence "is not a reason to stop an otherwise pre-authorized technical workflow" | contract §1, §8 |
| O6 | Grants Hermes commit/push on the two Lane-B branches | contract §5 — consistent with the existing takeover ruling §1 |
| O7 | Makes Codex review mandatory in six named situations and binds it to the candidate pair | contract §6 — consistent with takeover ruling §2 |
| O8 | Allows Hermes to close child cards automatically, but never `HOUSE-A PASS` or top-level Owner acceptance | contract §11, §12 |
| O9 | Pre-authorizes premium use limited to Codex review gates + one bounded Claude remediation after `SEND_TO_CLAUDE` | contract §9 |
| O10 | Declares itself canonical only after one-time Owner approval; later changes to §§4–13 need a new approval | contract §14 |

**The question for Sol is not whether these are good ideas, but whether each one is (i) already
true in the in-force governance, (ii) a change that needs Owner ruling, or (iii) a conflict.**

Hermes specifically flags, without judging, that **O1/O3/O4/O5** touch Owner stopping authority
and therefore sit closest to the Owner's own stop-list for this round ("เปลี่ยน architecture /
routing / locked contract").

## 5. Known interaction with the frozen candidate

The proposed contract lives on the planning branch, so it is **inside any
`(planning_sha, execution_sha)` pair frozen at `959605b`**. Hermes froze the pair at
`959605b` / `54327b1` in
`CANDIDATE-MANIFEST-LANE-B-2026-09-23.md` and **deliberately did not release it** for Codex
review, because reviewing that pair would hand Codex a governing document whose canonical
status is unapproved.

Options Sol may address in its verdict:

- contract approved as-is → pair `959605b` / `54327b1` stands;
- contract held out of scope for this review → re-freeze planning at `b80f813` (the SHA before
  `959605b`) and review the reconstruction alone;
- contract amended → re-freeze and review the amended pair.

## 6. Current frozen state (unchanged by this request)

| Item | Value |
|---|---|
| Planning SHA | `959605b38a4917a18f7218a97393d78030e164ce` (+ this-request commit) |
| Execution SHA | `54327b1459bdecff1d00b19ca3b8099c5fc4f09a` |
| U-R1 / U-R2 / U-R3 | COMPLETE (U-R3 stage gate PASS, controller-run) |
| Candidate pair frozen | yes |
| Candidate released to Codex | **NO** |
| Contract amended by Hermes | **NO** |
| LAB / Auth / role mutation | **NONE** |
| Secret persisted | **NONE** |

## 7. Proposed Sol verdict vocabulary (for Sol to accept, change, or reject)

```text
SOL_GATE_VERDICT = READY_TO_LOCK
SOL_GATE_VERDICT = READY_TO_LOCK_WITH_AMENDMENTS   (list the minimum amendment)
SOL_GATE_VERDICT = OWNER_RULING_REQUIRED           (name the exact policy/authority decision)
SOL_GATE_VERDICT = CONFLICT                        (name exact file/section)
```

## 8. Delivery note — how this request reaches Sol

Measured facts, so nobody assumes an automated link that does not exist:

- **Sol has no CLI, no profile, and no kanban assignee** in this environment. The direct
  executor registry contains `agent-opencode`, `agent-codex`, `agent-claude`, `agent-qwen`,
  `agent-agy` only (verified).
- The **S-Bridge** (`secretary_bridge.py`) is the canonical Owner ↔ Secretary GPT ↔ Hermes
  channel. Its `notify` subcommand sends to **Telegram** and accepts only a fixed state set
  (`ACCEPTED`, `BLOCKED`, `CHANGES_REQUIRED`, `DONE`, `OWNER_DECISION_REQUIRED`,
  `READY_FOR_GPT_REVIEW`, `REMEDIATION`) — there is **no Sol-review-request state**.
- Therefore this document is the transport artifact: it is committed to the planning branch so
  Sol can review the exact revision, and the Owner is notified. **Hermes cannot itself obtain a
  Sol verdict** — the Sol review has to be delivered by whoever holds that role.

`next-action: Sol review of this document + the named sources; verdict per §7`
