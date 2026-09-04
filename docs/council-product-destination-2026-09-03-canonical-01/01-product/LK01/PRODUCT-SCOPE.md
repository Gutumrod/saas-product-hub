# LK01 Product Scope

Gate: Product Gate only  
Verdict carried from synthesis: **REMEDIATE**

## In Scope for V1 Core

- Thai-first onboarding for online sellers and creator/affiliate operators. Agreement: 3/3.
- Tenant creation and tenant-scoped product data. Agreement: 3/3.
- Link creation with stable branded public URL. Agreement: 3/3.
- QR generation/encoding of the stable public short URL, not the destination URL. Agreement: 3/3.
- Destination editing without changing the public URL/QR. Agreement: 3/3.
- Redirect edge resolution with fail-safe behavior. Agreement: 3/3.
- Background analytics capture that does not block redirect. Agreement: 3/3.
- Minimal analytics dashboard: link totals, source breakdown, recent trend, and date range within plan limits. Agreement: 3/3.
- UTM/referrer/direct attribution precedence. Agreement: 3/3.
- Deterministic bot filtering and tracked-click definition. Agreement: 3/3.
- Quota accounting where over-quota redirects continue and analytics can pause/drop. Agreement: 3/3.
- Tenant isolation/RLS and fail-closed entitlement behavior. Agreement: 3/3.

## Phase Boundary

Smallest hot-path-safe V1 is Phases 1-3: tenant/auth/RLS, link core/redirect, analytics/quota. Agreement: 3/3.

Phase 4 billing is required before monetized launch, but candidates differ in framing: A/C treat Phases 1-3 as the smallest V1 product core and Phase 4 as monetization gate; B treats Phases 0-4 as the V1 build core because billing is needed to sell. Agreement on the distinction: 3/3. Majority framing: 2/3 for Phases 1-3 as V1 core.

Phase 5 paid features are outside V1 core unless Owner recuts scope. Agreement: 3/3.

## Out of Scope for V1 Core

- Custom domains by default. Agreement: 3/3.
- Campaign grouping and UTM builder by default. Agreement: 3/3.
- CSV export by default. Agreement: 3/3.
- API/webhooks by default. Agreement: 3/3.
- Team access by default. Agreement: 3/3.
- Full web analytics and visitor identity features. Agreement: 3/3.
- Ad-platform parity or conversion-pixel replacement. Agreement: 3/3.
- Business/market decisions such as pricing, revenue, competition, market sizing, or GTM. Agreement: 3/3.
- Architecture, pre-build, risk, release, Module Hub scan, or portfolio arbitration decisions. Agreement: 3/3.

## Required Scope Clarifications Before PASS

- Whether Product Gate should define V1 build approval as Phases 1-3 only, or include Phase 4 billing in V1 build-core language. Agreement that decision is needed: 3/3.
- Which paid features, if any, are allowed into the first paid launch. Agreement that decision is needed: 3/3.
- Whether custom-domain apex behavior is promised, explicitly excluded, or deferred until Phase 5 verification. Agreement that decision is needed: 3/3.
