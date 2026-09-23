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
| Contract content SHA-256 | `00f0e9e57a620e5ad0a3c51f4596e285dfcf77b8cecdb84980efcff0bc6c1d6a` |
| Amendment commit (the revision this approval binds to) | `05442fa76cd83e3dc97955b501f8d2e0723a61cb` |
| Approval-bound planning revision | `05442fa76cd83e3dc97955b501f8d2e0723a61cb` |
| Execution SHA (unchanged) | `54327b1459bdecff1d00b19ca3b8099c5fc4f09a` |

**Provenance, stated accurately:** the contract was
**proposed in the Owner identity** (original commit `959605b`, 2026-09-23 11:06 +0700)
**before** Sol review, and was **subsequently reviewed by Sol**. Sol is **not** the author of
the original revision.

**Verified:** the approval-bound contract is the exact content at `05442fa76cd83e3dc97955b501f8d2e0723a61cb`,
with SHA-256 `00f0e9e57a620e5ad0a3c51f4596e285dfcf77b8cecdb84980efcff0bc6c1d6a`.
Any later planning commits that only update the candidate manifest / approval request are bookkeeping
and do not change the approval-bound contract content.

## 3. Amendments Sol directed, and what was applied

The three original Sol-directed amendments were applied scope-limited. Final Sol validation then
found one precedence defect in §2: a later explicit Owner ruling was incorrectly listed below the
standing contract. Amendment 4 corrects only that precedence. **§§4–§10 remain byte-identical.**

| # | Sol direction | Applied |
|---|---|---|
| 1 | §2 — canonical Relay `SKILL.md` remains authoritative for Relay execution/safety invariants; this contract must not claim precedence over it | §2 precedence list now puts the canonical Relay skill first and states this contract governs task-specific authority/routing only within those constraints |
| 2 | §12 — automatic closure only for evidence-backed technical stages/child cards/work units; Hermes must not mark the governing Lane-B / Secretary / Owner-acceptance task `done`; `HOUSE-A PASS` and Owner acceptance remain Owner-gated | §12 rewritten accordingly; requesting review is explicitly not closure |
| 3 | Provenance + activation state — do not claim "Authority designer: Sol"; record proposed-before-review then Sol-reviewed; use `SOL_REVIEW_PASS / OWNER_ONE_TIME_APPROVAL_REQUIRED` before approval | header rewritten; `SOL_DECISION_GATES_LOCKED` reserved for post-approval only |
| 4 | Final Sol precedence validation — explicit later Owner ruling must override the standing contract for task-specific authority while canonical Relay execution/safety invariants remain authoritative | §2 reordered only: canonical Relay safety first, later Owner ruling second, standing contract third |

**Sol stated no new Owner policy/architecture/routing decision is required** — the core
authority model is compatible with the active Lane-B routing and Relay recovery doctrine.

## 4. Diff scope proof

```text
original Sol amendments: `959605b..2bb3ebf` → header + §2 + §12 only
final precedence correction: `600aa9c..05442fa` → §2 only, 4 insertions / 2 deletions
```

Per-section comparison against the pre-amendment revision:

| Section | Result |
|---|---|
| §2 | CHANGED (amendments 1 + 4 — canonical Relay safety precedence + later Owner-ruling precedence) |
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
  → (pair already re-frozen: planning 05442fa / execution 54327b1)
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
> `00f0e9e57a620e5ad0a3c51f4596e285dfcf77b8cecdb84980efcff0bc6c1d6a`) once, so
> `SOL_DECISION_GATES_LOCKED` becomes canonical and the LONG_RUN may proceed to the frozen-pair
> Codex review without further Owner interruption outside the §8 gates?**
>
> Approve / Reject / Amend.

`next-action: Owner one-time approval; then Codex review of (planning 05442fa, execution 54327b1)`
