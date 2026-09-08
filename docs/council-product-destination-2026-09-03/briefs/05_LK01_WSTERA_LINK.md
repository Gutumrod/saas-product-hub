# Round 1 Product Brief — LK01 WSTERA Link

Repo: `D:\AI-Workspace\projects\saas-product-hub\products\WSTERA-Link`
Output: `round1-product-reviews/LK01-WSTERA-LINK.md`

## Objective
Test whether the locked pre-build concept — branded campaign links plus click analytics for Thai online sellers/creators/agencies — is the strongest commercial destination before implementation.

## Mandatory sources
Verify Git state first, then inspect at minimum:
- `docs/00_PRODUCT_VISION.md`
- `docs/01_PRD.md`
- `docs/02_SYSTEM_ARCHITECTURE.md`
- `docs/04_PRICING_ENTITLEMENTS.md`
- `docs/05_ANALYTICS_SPEC.md`
- `docs/06_UX_USER_FLOWS.md`
- `docs/07_DEVELOPMENT_ROADMAP.md`
- `docs/09_EXTERNAL_DEPENDENCIES.md`
- `docs/ADR-001_HYBRID_BILLING_PROMPTPAY.md`
- `docs/MODULE_PROVENANCE.md`
- `docs/PRODUCT_DECISIONS.md`
- `docs/CURRENT_STATUS.md`

## Questions specific to LK01
- Is branded destination switching + attribution a pain strong enough for recurring payment?
- Which buyer segment should be first: seller, creator/affiliate, or agency?
- Why use WSTERA Link instead of existing short-link/analytics tools and platform-native analytics?
- Are Free/Pro/Business boundaries aligned with actual value or merely a documented hypothesis?
- What is the smallest hot-path-safe V1 that validates willingness to pay?
## Module scan focus
The repo already vendors multiple Module Hub capabilities. Verify actual provenance and fit; do not assume all vendored modules belong in V1. Identify modules that are platform plumbing versus customer-visible value.

## Required output
Produce the standard destination card plus: first buyer segment, alternative/workaround comparison, minimum analytics needed for paid value, module keep/defer list, and whether current pricing architecture should be `LOCK`, `REVISE`, or remain `UNVERIFIED`.

## Boundary
No Phase 0/code/schema work. Do not revive the retired SU01 product as the destination. Central billing-core and PromptPay reconciliation decisions are existing constraints unless contradictory owner evidence is found.