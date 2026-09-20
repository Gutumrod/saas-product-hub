# T6-WU03 — FINAL HOUSE EVIDENCE PACKET (SKELETON — figures filled after WU05/WU06)

Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001` · Stage **T6** · Work Unit **T6-WU03**
Worker Rule: **Hermes** · Review Batch: **B6** · Status: **SKELETON — NOT A CLOSURE CLAIM**

> This is a structure only. Every field marked `⟨…⟩` must be filled from a measured command in the same
> step that writes it. Nothing here may be cited as evidence until then. Producing this file does not
> assert any PASS.

## A. Required handoff fields (manifest acceptance contract)

| Field | Value |
|---|---|
| Exact House commit | ⟨`Gutumrod/saas-product-hub` branch `work/house-production-closure-longrun-20260919` @ ⟩ |
| Exact hub-web commit | ⟨`Gutumrod/hub-web` branch `work/house-platform-closure-20260919` @ ⟩ |
| Default-branch disposition | ⟨T6-WU01 decision — PR #1 / `feature/platform-control-plane` vs closure branch⟩ |
| Deployed artifact / Worker identity | ⟨deployment id + version id from WU05, name-only⟩ |
| Production Readiness state | ⟨one of BUILD_PASS / PRODUCTION_READY / LIVE_PROVEN — per measured evidence only⟩ |
| R15 state | ⟨PREPARED / APPLIED — with the exact operation reference⟩ |
| Signer state | ⟨absent / active — presence only, never a value⟩ |
| Fulfillment state | ⟨what the deployed revision actually does, with the runbook reference⟩ |
| Control / SB01 read boundary state | ⟨narrow billing-action path proven; whole-Control claim explicitly NOT made⟩ |
| Remaining House blockers | ⟨list, or "none" with the evidence that closes each⟩ |

## B. Claim discipline that B5 repeated and B6 will check

- **Never** claim `OPERATED_STABLE` — no stability evidence exists for that.
- **Never** make a whole-Control-surface claim: the pre-existing admin `customersTree` endpoint still
  enumerates demo fixtures, and demo payment/subscription simulation remains. Only the narrow
  billing-action path is proven fixture-scoped.
- The reachability claim is bounded to the **static import closure** of the billing-action path; dynamic
  imports, runtime DI and bundler-level substitution are outside it.
- A fail-closed scanner run is **not** a clean PASS. Record the scanner outcome for the final candidate
  as what it actually was.
- Production claims are limited to what was measured live; anything not exercised live is listed as
  untested rather than implied.

## C. AUTO_GATE checks to run at T6 (measured, not asserted)

1. `docs/CURRENT_STATUS.md` vs exact refs consistency
2. no stale HOLD/PASS contradictions in the current overlay
3. branch/upstream parity (both repos)
4. `git diff --check`
5. exact evidence links resolve
6. no product-source changes in the House diff

## D. Dependency matrix reference

T6-WU02 output (`T6-PRODUCT-DEPENDENCY-MATRIX-DRAFT-2026-09-20.md`, to be finalised) states, per product
lane, only: House dependency available/unavailable · exact contract/evidence reference · product-specific
work still required. **No product is marked PRODUCTION_READY by House evidence.**

## E. Final stop condition (verbatim from the manifest)

On B6 `BATCH_APPROVED`:

```
READY FOR OWNER HOUSE CLOSURE REVIEW — WSTERA-HOUSE-PRODUCTION-CLOSURE-001
```

**No automatic Owner acceptance.**
