# SYNTHESIS-MANIFEST — BK01 Order Capability Council
**Date:** 2026-09-05
**Procedure:** llm-council-gate v0.3.2
**Purpose:** Identity-safe input manifest for Codex synthesis. No expert identity or Candidate→Expert mapping is included.

## Inputs to Codex
- Frozen brief: `COUNCIL-BRIEF.md`
- Anonymized candidates: `CANDIDATE-A.md`, `CANDIDATE-B.md`, `CANDIDATE-C.md` (3 independent expert answers, identity-scrubbed)

## Provenance integrity
- 3 independent expert answers collected 2026-09-05, each written to disk and verified (file sizes: 26097 / 31284 / 40069 chars)
- Candidates are anonymized; identity clues removed
- No Hermes recommendation, consensus, or gate verdict is included in this bundle

## Source documents referenced by experts (on disk)
- docs/proposals/BK01-ORDER-CAPABILITY-PROPOSAL-2026-09-05.md
- prototypes/bk01-order-portal/PROTOTYPE-LOCK-2026-09-05.md
- docs/council-product-destination-2026-09-03-canonical-01/01-product/BK01/*
- docs/products/registry.yaml
- docs/platform/MODULE-REUSE-POLICY.md
- docs/CURRENT_STATUS.md
- docs/strategy/WSTERA-LAYER-MODEL.md
- D:/AI-Workspace/projects/modules-hub/modules/REGISTRY.md
- D:/AI-Workspace/projects/modules-hub/modules/product-catalog/DESIGN.md
- products/headless-commerce/modules/product-catalog/
