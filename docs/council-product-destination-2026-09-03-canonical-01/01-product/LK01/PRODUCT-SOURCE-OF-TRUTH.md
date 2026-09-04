# LK01 Product Source of Truth

Gate: Product Gate only  
Verdict carried from synthesis: **REMEDIATE**

## Locked Product Definition

WSTERA Link is a Thai-first branded campaign-link and first-party outbound click-attribution SaaS. Agreement: 3/3.

It serves Thai online sellers first, especially sellers distributing links across Facebook, LINE, TikTok, Shopee/Lazada affiliate destinations, and printed QR. Agreement: 3/3.

It also serves creators/affiliate operators, agencies/social admins, and SMBs that need the same stable-link and attribution loop. Agreement: 3/3.

It is not a generic URL shortener. Agreement: 3/3.

## Locked Core Promise

Create one stable branded link/QR, publish it, know which channel sends outbound clicks, and change the destination later without replacing the distributed link or QR. Agreement: 3/3.

## Locked V1 Product Core

V1 product core is the smallest hot-path-safe destination-switching and attribution loop:

- Multi-tenant account/tenant foundation and RLS. Agreement: 3/3.
- Link creation, slug/default-domain behavior, destination editing, and stable public URL/QR. Agreement: 3/3.
- Redirect edge that resolves independently of analytics, billing, or dashboard failure. Agreement: 3/3.
- Minimal analytics: tracked clicks, source/referrer/UTM attribution, trend/date-range view, deterministic bot filtering, and quota accounting. Agreement: 3/3.
- Quota behavior that never disables resolvable redirects. Agreement: 3/3.

## Product-Defining Capabilities

- Stable branded link and QR. Agreement: 3/3.
- Destination switching after distribution. Agreement: 3/3.
- First-party outbound click attribution. Agreement: 3/3.
- Redirect hot-path reliability and fail-safe behavior. Agreement: 3/3.
- Tenant isolation and fail-closed entitlement boundaries. Agreement: 3/3.

## Platform Plumbing / Not Product-Defining

Vendored module presence is not proof of V1 necessity. Agreement: 3/3.

Billing-related vendored modules are historical/reference only after the centralized billing-core decision. Agreement: 3/3.

Reusable auth, tenant, rate-limit, config, health, audit, and import/export modules may support implementation but do not define the product identity. Agreement: 3/3.

## Locked Non-Goals

- Generic URL shortener. Agreement: 3/3.
- Full web analytics suite. Agreement: 3/3.
- Ad-platform pixel/conversion attribution replacement. Agreement: 3/3.
- Link-in-bio builder. Agreement: 3/3.
- Marketing automation suite. Agreement: 3/3.
- A/B testing engine. Agreement: 3/3.
- Unique visitor, fingerprinting, cross-device identity resolution. Agreement: 3/3.
- Enterprise SSO/SAML. Agreement: 3/3.
- SU01 revival. Agreement: 3/3.

## Commercial Facts Reported, Not Re-Decided

The candidates report the existing locked commercial inputs as facts: Free 0 THB, Pro 199 THB/month, Business 590 THB/month, with documented quota and grace-period behavior. Agreement: 3/3.

This Product Gate does not decide pricing, revenue model, competitive positioning, GTM, or market sizing.
