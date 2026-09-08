# Round 1 Product Brief — BK01 Booking

Repo: `D:\AI-Workspace\projects\saas-product-hub\products\booking`
Output: `round1-product-reviews/BK01-BOOKING.md`

## Objective
Determine the commercial destination of Booking from the verified contract, pricing, domain rules, implementation evidence and current unresolved owner decisions — not from maturity alone.

## Mandatory sources
Verify Git/branch/current evidence first, then inspect at minimum:
- `docs/00_PRODUCT_VISION.md`
- `docs/01_PRD.md`
- `docs/04_PRICING_ENTITLEMENTS.md`
- `docs/05_BOOKING_DOMAIN_RULES.md`
- `docs/06_UX_USER_FLOWS.md`
- `docs/08_EXTERNAL_DEPENDENCIES.md`
- `docs/10_DEVELOPMENT_ROADMAP.md`
- `docs/PRODUCT_DECISIONS.md`
- `docs/CURRENT_STATUS.md`
- `docs/business/` pricing/business authority
- current BK-A audit/evidence and independent review

## Questions specific to BK01
- Which service-business segment should V1 deliberately serve first?
- Is Booking primarily appointment SaaS, service-operations SaaS, or a broader product only after V1?
- Which existing pricing/entitlement promises are actually valuable and commercially defensible?
- How should PromptPay, slip verification, LINE notifications and central billing affect the destination without turning Booking into a payments product?
- Which owner-decision blockers materially affect saleability versus later optimization?
## Module scan focus
Check reusable auth/tenant/billing/notification/audit/import-export/ticket capabilities, but first verify whether Booking already implements equivalent native behavior. Never recommend replacing proven native code merely because a similar module exists.

## Required output
Produce the standard destination card plus: owner decisions that must be locked before sale, recurring-revenue justification, V1 exclusions, and a clear statement on whether any CM01 capability belongs inside BK01 or remains a separate product.

## Boundary
Do not reopen closed Stage 4 work. CONT-04 environment limits are technical evidence, not permission to invent runtime proof. No code, migration, deployment, pricing rewrite, or DB workaround during Council.