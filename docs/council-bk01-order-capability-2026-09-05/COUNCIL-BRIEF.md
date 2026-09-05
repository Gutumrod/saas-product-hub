# Council Brief — BK01 Order Capability Parent-Governance Handoff

**Status:** AUTHORIZED — PROPOSAL REVIEW + PRODUCT BOUNDARY GOVERNANCE ONLY
**Date:** 2026-09-05
**Procedure:** `llm-council-gate` v0.3.2
**Repo:** `D:\AI-Workspace\projects\saas-product-hub`
**Checkpoint:** `master @ 7b66b2f` (ahead origin/master by 1, not pushed)

## Objective

Review the BK01 Order Capability proposal and return a Parent Governance verdict. This is **Proposal Review + Product Boundary Governance only**. It does NOT authorize production code, migration, deploy, Supabase apply, merge, or any change to BK01 locked contracts.

## Frozen Question

> Should the parent portfolio approve BK01 Order capability to enter Phase 0 (Product Boundary Decision + Order V1 Contract + Reuse Gate), or remediate the proposal, or reject/defer it — and what boundary, reuse, overlap, and sequencing findings must the parent decide?

## Source Documents (inspect on disk, do not trust names)

- Proposal: `docs/proposals/BK01-ORDER-CAPABILITY-PROPOSAL-2026-09-05.md`
- Prototype lock: `prototypes/bk01-order-portal/PROTOTYPE-LOCK-2026-09-05.md`
- BK01 Product Source of Truth: `docs/council-product-destination-2026-09-03-canonical-01/01-product/BK01/PRODUCT-SOURCE-OF-TRUTH.md`
- BK01 Product Scope: `.../01-product/BK01/PRODUCT-SCOPE.md`
- BK01 Effective Product Gate: `.../01-product/BK01/EFFECTIVE-PRODUCT-GATE-STATUS.md`
- BK01 Open Decisions: `.../01-product/BK01/OPEN-DECISIONS.md`
- BK01 Business/Market: `.../01.5-business-market/BK01/`
- Portfolio registry: `docs/products/registry.yaml`
- Module Reuse Policy: `docs/platform/MODULE-REUSE-POLICY.md`
- Portfolio status: `docs/CURRENT_STATUS.md`
- Strategy layer model: `docs/strategy/WSTERA-LAYER-MODEL.md`
- Module Hub registry: `D:\AI-Workspace\projects\modules-hub\modules\REGISTRY.md`
- Product Catalog module: `D:\AI-Workspace\projects\modules-hub\modules\product-catalog\DESIGN.md`
- HC01 Headless Commerce: `products/headless-commerce/modules/product-catalog/`

## Required Review Areas

1. **Boundary findings** — Is the proposed Order capability boundary coherent? Does it preserve Booking as appointment authority? Are the non-goals (no inventory/warehouse/ERP/POS/shipping/BOM/routing/lift-bay-room-equipment scheduling) correctly scoped?
2. **Reuse findings** — Per MODULE-REUSE-POLICY: does Order V1 duplicate a canonical module? Specifically inspect `product-catalog` module (modules-hub) and HC01's product-catalog. Is the Order catalog a `USE`/`USE+ADAPT`/`NOT APPLICABLE`/`REJECT`/`MISSING` capability? Is MT01 bootstrap applicable?
3. **Product overlap findings** — Does Order overlap with HC01 (headless commerce), CM01 (claim/case), TT01 (ticket tracking), or any other portfolio product? Verify native capability before citing overlap.
4. **Impact on BK01 locked appointment contracts** — Does adding Order silently change the locked appointment-only boundary? What must be superseded/amended vs preserved historical?
5. **Sequencing** — Should Order Phase 0 run documentation-only in parallel with BK-A remediation, or wait for BK-A runtime baseline closeout? (CURRENT_STATUS: BK-A is next eligible heavy track; CONT-03/DB-backed gates still open.)
6. **Required parent decisions** — Enumerate the concrete decisions the Owner must make.

## Expert Output Contract

Each independent expert returns:
1. Recommendation (APPROVE PHASE 0 / REMEDIATE / REJECT-DEFER)
2. Verified facts / evidence used (with paths)
3. Boundary findings
4. Reuse findings (with module classification)
5. Product overlap findings
6. Impact on BK01 locked contracts
7. Required Owner decisions
8. Risks / failure cases
9. Assumptions
10. Open questions / missing evidence
11. Confidence 0-100

Experts do NOT issue the final gate verdict. Do NOT write production code, create migrations, apply Supabase, deploy, merge, or change any locked contract. Do NOT add features to the prototype.

## Synthesis Contract

Codex receives only the frozen brief, anonymized Candidate A/B/C, and identity-safe synthesis manifest. Codex must produce:
- consensus / majority / dissent with correct ratios;
- recommendation: APPROVE PHASE 0 / REMEDIATE / REJECT-DEFER;
- boundary, reuse, overlap, and sequencing findings;
- required Owner decisions;
- documents to supersede/amend/preserve;
- explicit build authorization status (default NO);
- confidence 0-100;
- concise Thai Owner Brief.
