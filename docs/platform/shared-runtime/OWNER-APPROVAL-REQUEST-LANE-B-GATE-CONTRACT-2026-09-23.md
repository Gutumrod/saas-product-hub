# OWNER APPROVAL REQUEST — LANE B GATE CONTRACT (ONE-TIME APPROVAL)

Date: 2026-09-23
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Requesting authority: **Sol** — `SOL_GATE_VERDICT = READY_TO_LOCK_WITH_AMENDMENTS`
Prepared by: Hermes (orchestrator; does not decide, does not approve)
Current state: **`SOL_REVIEW_PASS / OWNER_ONE_TIME_APPROVAL_REQUIRED`**

---

## 1. What is being asked of the Owner

**One-time approval of the amended Lane B gate contract**, so that its authority matrix
(§§4–13) becomes canonical for the remainder of this task.

Approval meaning (per the contract's own §14, wording preserved):

- the Owner approves the authority matrix in §§4–13;
- Hermes may thereafter continue the LONG_RUN without Owner interruption except at the §8 gates;
- prior Lane-B documents remain technical/history inputs but cannot create extra Owner stops.

Resulting canonical state after approval: **`SOL_DECISION_GATES_LOCKED`**
(not applied yet — the contract currently reads `SOL_REVIEW_PASS / OWNER_ONE_TIME_APPROVAL_REQUIRED`).

## 2. Exact revision to approve

| Item | Value |
|---|---|
| Contract file | `docs/platform/shared-runtime/OWNER-DECISION-GATE-CONTRACT-LANE-B-2026-09-23.md` |
| Contract content SHA-256 | `4aa80cbb773cfaeafe3d093f5f2d6ecfedd6e6b6280e23dd8e14923ddccbe91f` |
| Amendment commit (the revision this approval binds to) | `2bb3ebf6ae33c6a75f6d4057c87c358e0cd56984` |
| Planning head at request time | `6791239e860adbf23a4366396f96de5be721e541` |
| Execution SHA (unchanged) | `54327b1459bdecff1d00b19ca3b8099c5fc4f09a` |

**Provenance, stated accurately:** the contract was
**proposed in the Owner identity** (original commit `959605b`, 2026-09-23 11:06 +0700)
**before** Sol review, and was **subsequently reviewed by Sol**. Sol is **not** the author of
the original revision.

**Verified:** the contract file is **unchanged** between the amendment commit `2bb3ebf` and the
current planning head (`git diff --name-only 2bb3ebf..HEAD -- <file>` → 0 files); its content
hash is identical at both points. The two commits after it touch only the candidate manifest
and the backlog — bookkeeping, not reviewed content.

## 3. Amendments Sol directed, and what was applied

All three applied verbatim, scope-limited. **Nothing else changed** — §§4–§10 verified
byte-identical to the pre-amendment revision.

| # | Sol direction | Applied |
|---|---|---|
| 1 | §2 — canonical Relay `SKILL.md` remains authoritative for Relay execution/safety invariants; this contract must not claim precedence over it | §2 precedence list now puts the canonical Relay skill first and states this contract governs task-specific authority/routing only within those constraints |
| 2 | §12 — automatic closure only for evidence-backed technical stages/child cards/work units; Hermes must not mark the governing Lane-B / Secretary / Owner-acceptance task `done`; `HOUSE-A PASS` and Owner acceptance remain Owner-gated | §12 rewritten accordingly; requesting review is explicitly not closure |
| 3 | Provenance + activation state — do not claim "Authority designer: Sol"; record proposed-before-review then Sol-reviewed; use `SOL_REVIEW_PASS / OWNER_ONE_TIME_APPROVAL_REQUIRED` before approval | header rewritten; `SOL_DECISION_GATES_LOCKED` reserved for post-approval only |

**Sol stated no new Owner policy/architecture/routing decision is required** — the core
authority model is compatible with the active Lane-B routing and Relay recovery doctrine.

## 4. Diff scope proof

```text
git diff 959605b -- <contract file>
  → 1 file changed, 30 insertions(+), 14 deletions(-)
  → hunks only at: header §, §2, §12
```

Per-section comparison against the pre-amendment revision:

| Section | Result |
|---|---|
| §2 | CHANGED (amendment 1 — expected) |
| **§4 · §5 · §6 · §7 · §8 · §9 · §10** | **IDENTICAL** (byte-for-byte) |
| §12 | CHANGED (amendment 2 — expected) |
| header | CHANGED (amendment 3 — expected) |

Sol's instruction "do not change the substantive authority matrix in §§4–10" was satisfied.

## 5. State while approval is pending

| Constraint (Sol) | Status |
|---|---|
| No Codex candidate review | **held** — not started |
| No live checkpoint execution | **held** — nothing started |
| U-R1/U-R2/U-R3 evidence preserved | **preserved**, unchanged (hashes in the candidate manifest) |
| Authority contract changed to work around the missing Sol transport | **not changed** — gap recorded as `FU-05` |

## 6. After approval — the sequence Sol prescribed

```text
OWNER_ONE_TIME_APPROVAL
  → SOL_DECISION_GATES_LOCKED
  → (pair already re-frozen: planning 2bb3ebf / execution 54327b1)
  → Codex independent review of the frozen pair
  → remediation / closure per contract
```

## 7. Non-blocking gap carried, not worked around

`SOL_VERIFY_OR_RESOLVE` has no direct automated Hermes→Sol transport (measured: Sol has no CLI,
no profile, no kanban assignee; S-Bridge `notify` targets Telegram with no Sol-review state).
Recorded as **`FU-05`** in `BACKLOG-LANE-B-FOLLOWUP-HARDENING-2026-09-23.md`.
Per Sol: **the authority contract must not be changed to work around it.**

---

## 8. The single decision requested

> **Approve the amended Lane B gate contract (content SHA-256
> `4aa80cbb773cfaeafe3d093f5f2d6ecfedd6e6b6280e23dd8e14923ddccbe91f`) once, so
> `SOL_DECISION_GATES_LOCKED` becomes canonical and the LONG_RUN may proceed to the frozen-pair
> Codex review without further Owner interruption outside the §8 gates?**
>
> Approve / Reject / Amend.

`next-action: Owner one-time approval; then Codex review of (planning 2bb3ebf, execution 54327b1)`
