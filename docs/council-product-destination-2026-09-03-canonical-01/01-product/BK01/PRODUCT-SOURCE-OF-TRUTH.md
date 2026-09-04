# BK01 Product Source of Truth

Gate: Product Gate  
Status: Locked target with remediation required  
Date: 2026-09-03  
Verdict reference: `PRODUCT-SYNTHESIS.md` = REMEDIATE

## Governing Documents

These documents govern BK01 Product scope and must be treated as the Product Gate source of truth:

| Document | Status | Product Use |
| --- | --- | --- |
| `docs/00_PRODUCT_VISION.md` | LOCKED 2026-08-28 | Product identity, ICP, differentiation, non-goals, success evidence rules |
| `docs/01_PRD.md` | LOCKED 2026-08-28 | V1 Required/Optional/Post-V1 contract and public-launch blocker rule |
| `docs/05_BOOKING_DOMAIN_RULES.md` | LOCKED | Booking/deposit states, availability, hold, Any Staff, slip, cancel/reschedule, LINE rules |
| `docs/06_UX_USER_FLOWS.md` | LOCKED | Customer, owner, staff, and platform-operator flows |
| `docs/10_DEVELOPMENT_ROADMAP.md` | LOCKED | BK-A/B/C/D sequence and release gates |
| `docs/PRODUCT_DECISIONS.md` | OWNER APPROVED 2026-08-28 | PD-001 through PD-018 owner decisions |
| `docs/04_PRICING_ENTITLEMENTS.md` | LOCKED structure, prices provisional | Monthly trial/basic/pro entitlement structure; final prices not locked |
| `docs/audit/FEATURE_REQUIREMENT_TRACEABILITY.md` | V1 evidence map | Requirement-to-feature-to-evidence traceability |
| `docs/CURRENT_STATUS.md` | Current state reference | BK-A open / DB gates blocked status requiring reconciliation |
| `docs/audit/BK-A-IMPLEMENTATION-EVIDENCE-2026-08-29.md` | Evidence reference | Non-DB PASS evidence and DB `BLOCKED_ENVIRONMENT` |
| `docs/audit/INDEPENDENT_REVIEW_CODEX_BK-A_2026-08-29.md` | Review reference | Code/design PASS, no P0/P1, DB evidence still blocked |

## Traceability Rule

No V1 feature is accepted unless it maps to the locked PRD/domain/UX/decision contract and has release evidence. Static/unit/build PASS is not sufficient for DB-authoritative or provider-backed behavior.

## Product Boundary

BK01 is separate from CM01. BK01 may include native ticket/case support as V1 operational/support capability under PD-018, but it is not CM01 and is not a lead product identity.

Module Hub scan is HOLD. No product-defining decision depends on Module Hub at this Product Gate, and no overlap claim is admissible here.
