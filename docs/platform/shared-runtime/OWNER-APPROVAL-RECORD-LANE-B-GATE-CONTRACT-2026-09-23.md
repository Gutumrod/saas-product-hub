# OWNER APPROVAL RECORD — LANE B GATE CONTRACT

Date: 2026-09-23
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Decision: **APPROVED — `SOL_DECISION_GATES_LOCKED`**
Issued by: Owner
Recorded by: Hermes (mechanical record only; Hermes does not decide or approve)

---

## 1. What the Owner approved

| Item | Value |
|---|---|
| Contract file | `docs/platform/shared-runtime/OWNER-DECISION-GATE-CONTRACT-LANE-B-2026-09-23.md` |
| **Contract content SHA-256 (approved)** | `00f0e9e57a620e5ad0a3c51f4596e285dfcf77b8cecdb84980efcff0bc6c1d6a` |
| **Approval-bound planning revision** | `05442fa76cd83e3dc97955b501f8d2e0723a61cb` |
| Resulting canonical state | `SOL_DECISION_GATES_LOCKED` |

Approval is bound to that exact revision. Any later change to §§4–13 requires a new explicit
Owner approval (contract §14).

## 2. Verification performed before acting on the approval

The Owner's approved hash was verified against the repository rather than assumed:

| Check | Result |
|---|---|
| Contract blob at the approval-bound revision | sha256 `00f0e9e57a620e5ad0a3c51f4596e285dfcf77b8cecdb84980efcff0bc6c1d6a` — **matches the approved hash exactly** |
| Contract blob at current planning HEAD `586d7db` | same hash — **contract unchanged since the approved revision** |
| `§§4–§10` vs the pre-amendment revision `959605b` | **all IDENTICAL** — Sol's "do not change the substantive authority matrix" respected |
| Execution branch | `54327b1459bdecff1d00b19ca3b8099c5fc4f09a`, parity EXACT, clean |

### 2.1 Discrepancy in the approval message, resolved by measurement

The approval message cited `00f0e9e5…` / `05442fa`, **not** the `4aa80cbb…` / `600aa9c` pair
Hermes had reported in `OWNER-APPROVAL-REQUEST-…`. Hermes re-measured instead of assuming either
value. Measured: the Owner's cited values are **correct and are the current ones** — two Owner
commits landed after Hermes's request:

- `05442fa` *"docs(platform): preserve later Owner ruling precedence"* — amended §2 so an
  explicit later Owner ruling that names the task ranks **above** the gate contract (within the
  canonical Relay constraints). This is the approval-bound revision.
- `586d7db` *"docs(platform): re-freeze Lane B gate approval pair"* — updated the candidate
  manifest and approval request to the new SHAs.

Hermes's earlier reported pair was **stale**, not the Owner's. The Owner's values are the ones
that bind.

### 2.2 A Hermes error, caught and reverted before any commit

While recording the approval, Hermes edited the contract header (State → `SOL_DECISION_GATES_LOCKED`).
**That edit changed the approved content and would have broken the revision binding.** It was
detected immediately, the file was reverted to the approved revision, and **nothing was
committed** — the working tree is clean and the committed blob still hashes to the approved
`00f0e9e5…`.

Consequence adopted: **the approved contract file is now immutable to Hermes.** The
`SOL_DECISION_GATES_LOCKED` state is recorded in this separate approval record instead, so the
approved artefact's bytes are never touched. Any future state change to the contract itself
requires Owner action, not a Hermes edit.

Host note: the working tree shows CRLF line endings (`core.autocrlf=true` on this host), so a
raw working-tree `sha256sum` differs from the committed blob. **The committed blob is the
authoritative content hash** and is the one that matches the approval.

## 3. Authority now in force

Per the approved contract, Hermes may continue the LONG_RUN without Owner interruption
**except** at the §8 gates:

`OWNER-CP-H3D-A1` · `OWNER-CP-H3D-LIVE` · `OWNER-CP-H3E` · `OWNER-CP-H4` ·
`OWNER-CP-HOUSE-A` · any Production mutation · irreversible/destructive action without a
reviewed rollback · secret exposure requiring rotation · architecture/routing/contract/security/
scope expansion · new paid or premium route · unresolved live-infrastructure collision · no safe
technical remediation path.

## 4. Frozen pair for the Codex independent review

```text
planning_sha  = 586d7dbd4dc6a1c68d0d541a4c620a2784b39b98
execution_sha = 54327b1459bdecff1d00b19ca3b8099c5fc4f09a
```

Both branches: remote parity **EXACT**, worktree clean.

Note on binding: the contract's approval binds to `05442fa`; the planning branch has since
advanced to `586d7db` by **bookkeeping only** (candidate manifest + approval request re-freeze).
The approved contract blob is byte-identical at both revisions (`00f0e9e5…`). The review is
therefore released on planning `586d7db` with the approved contract content unchanged, which
this record states explicitly rather than glossing over.

## 5. Constraints carried into the review (Owner + Sol)

| Constraint | Status |
|---|---|
| No change to architecture / routing / scope / authority contract / premium-model-provider policy / live checkpoints beyond locked authority | **in force** |
| U-R1 / U-R2 / U-R3 evidence preserved | **preserved** (hashes unchanged; see candidate manifest) |
| No live checkpoint execution | **in force** — none started |
| `FU-05` (no automated Hermes→Sol transport) | **preserved as follow-up**; contract not changed to work around it |
| LAB / Auth / role mutation | **NONE** |
| Secret persisted | **NONE** |

`next-action: release Codex independent review bound to (586d7db, 54327b1)`
