# T6-WU01 DRAFT — REPO / PR / CURRENT STATUS RECONCILIATION NOTES (prepared during T5)

Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001` · Stage T6 · Work Unit T6-WU01 (draft)
Status: **DRAFT — measured 2026-09-20 during T5; T6 must re-measure before recording.**
Recorded by: Hermes

## Measured dispositions (this revision)

### House coordination repository — `Gutumrod/saas-product-hub`

- Branch: `work/house-production-closure-longrun-20260919`
- Reconciles `origin/master` (T0 merge, `--no-ff`); `origin/master` is an ancestor.
- All House-side governance, evidence, dispatch, closure, ruling and handoff records for
  `WSTERA-HOUSE-PRODUCTION-CLOSURE-001` live under `docs/platform/house-long-run/`.
- **Untracked, deliberately untouched:** three pre-existing files under
  `docs/platform/shared-runtime/` that belong to a separate shared-runtime isolation work stream
  (recorded as deviation D-2 at T0). T6 must either disposition them explicitly or keep carrying them;
  it must not silently absorb them into this Task.

### Hub/Control repository — `Gutumrod/hub-web`

| Item | Measured state |
|---|---|
| Closure branch | `work/house-platform-closure-20260919` |
| Divergence vs `main` | **42 commits ahead / 0 behind** |
| Default branch | `main` |
| Draft PR #1 | **OPEN, isDraft=true, base `main`, head `feature/platform-control-plane`, 30 commits, MERGEABLE** |

**The material finding for T6: PR #1 does not contain this task's work.** It still points at
`feature/platform-control-plane` with its original 30 commits, while the closure branch has advanced
to 42 commits carrying the T1–T5 platform work (R15 package evidence, per-product signer contract,
shared fulfillment capability, SB01 read projection transport, hardening, and the B5 remediation).
So the repository currently has:

- a **Draft PR describing a demo** (PR #1, 30 commits), and
- an **unmerged production-only branch** (42 commits) that is not represented by any PR.

The Run Manifest explicitly requires that "Draft PR #1/default-branch strategy is explicitly
dispositioned; no stale unmerged production-only code is silently left as canonical." T6 must therefore
record an explicit disposition. The options, none of which Hermes may choose unilaterally because they
change what is canonical:

1. **Open a new PR** from `work/house-platform-closure-20260919` → `main`, and either close PR #1 as
   superseded or keep it as the demo-only record.
2. **Retarget/expand PR #1** to the closure branch, converting the demo PR into the platform PR.
3. **Merge the closure branch to `main`** after B6 and closure review, then close PR #1.
4. **Leave both unmerged** and record explicitly that `main` is not the production source of truth for
   this work — acceptable only as a *recorded* decision, never as a silent default.

Whichever is chosen, the deployed Worker's source must be attributable to a specific branch+commit that
is reachable from the repository's canonical line, or the handoff must state plainly that it is not.

## Current status document

`docs/CURRENT_STATUS.md` already carries a 2026-09-19 House overlay written at T0 (verified current
state separated from retained historical text). T6 must refresh it with the **final** state: the frozen
House revision, the hub-web revision actually deployed, the Production Readiness state, R15 state,
signer state, fulfillment state, and the Control/SB01 read-boundary state — each with its evidence
reference, and with no product-readiness claim.

## What T6 must NOT do

- Do not rewrite historical PASS/FAIL records.
- Do not claim product readiness from House evidence.
- Do not merge or retarget anything without the disposition being recorded and, for a merge to the
  default branch, without the manifest's merge/release gate being satisfied.
- Do not remove the T0 deviation D-2 files without an explicit decision.

## Items to re-measure at T6 (do not copy these figures)

- branch divergence for both repositories
- PR #1 metadata
- the deployed Worker version and its source commit
- `docs/CURRENT_STATUS.md` freshness against the measured reality
- whether the three shared-runtime files are still untracked
