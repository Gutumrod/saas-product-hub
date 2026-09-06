# WSTERA House Major — Portfolio Control Checkpoint

**Date:** 2026-09-06 (Asia/Bangkok)
**Mode:** WSTERA HOUSE MAJOR / SECRETARY CONTROL / BUILD-TO-SELL
**Owner:** Free — Final Authority
**Parent repository:** `Gutumrod/saas-product-hub`
**Parent baseline before this checkpoint:** `master@4ace950b2c56320c3461669e57b4580bc938efd2`

## Owner Direction Recorded

บ้านใหญ่ต้องควบคุม execution ของทุก canonical product ให้อยู่ใน Council/Owner-approved contract และเส้น Build-to-Sell ปัจจุบันอย่างเข้มงวด ทุก movement ที่เป็น portfolio authority, handoff, release direction หรือ project-control decision ต้องมี durable repository evidence; ห้ามพึ่งเฉพาะ chat history.

## Portfolio-Control Evidence Included

- `BUILD-TO-SELL-EXECUTION-2026-09-06.md` — current portfolio execution authority
- `HANDOFF-BK01-PS01-DC01-2026-09-06.md` — verified continuation checkpoint for the three active sell tracks
- `BRIEF-BK01-BUILD-TO-MERCHANT-PILOT-2026-09-06.md`
- `BRIEF-DC01-BUILD-TO-PUBLIC-PILOT-2026-09-06.md`
- `BRIEF-PS01-BUILD-TO-1-STORE-CLOSED-BETA-2026-09-06.md`
- `BRIEF-WSTERA-PORTFOLIO-PROJECT-MANAGER-STRICT-CONTROL-2026-09-06.md`
## Control Invariants

- Owner remains final authority; Secretary/Project Manager does not invent or reinterpret Owner decisions.
- Council/Owner-approved contracts outrank worker convenience and stale status prose.
- Current portfolio remains Layer 1; Layer 2/3 are not authorized.
- Build-to-Sell is the active execution priority: finish, deploy, onboard, support, pilot, payment readiness, and real blocker removal before expansion.
- Every implementation, including small changes, requires plan/contract review before code mutation.
- Agent self-report is not closure evidence. PASS/CLOSED requires direct Git/disk/test/runtime evidence and the required review chain.
- Closed work is not reopened without contradicting new evidence or explicit Owner authority.
- KMO execution remains a separate workstream; only evidence-backed generic defects may flow back to canonical WSTERA products.
- Production mutation, secrets, provider changes, migration applies, deploys, merges, and new Council/Module Hub work require the authority defined by the governing product/portfolio contract.

## Explicit Exclusions From This Checkpoint

Other pre-existing untracked parent-repository items were observed but are NOT included in this checkpoint because they were not created or verified as part of this House Major movement: `AGENTS.md`, old council artifacts/probes, `products/`, `nul`, and other unrelated untracked paths.

This checkpoint must not be used to imply those excluded paths are accepted, reviewed, clean, or ready to commit.
