# LK01 V1 Acceptance Criteria

Gate: Product Gate only  
Verdict carried from synthesis: **REMEDIATE**

These criteria define product acceptance for the V1 core. They do not authorize implementation or replace later architecture, risk, pre-build, security, money, or release gates.

## Product Identity

- LK01 is presented as branded campaign links plus first-party outbound click attribution, not generic URL shortening. Agreement: 3/3.
- Primary Thai seller use case is visible in product copy and flows. Agreement: 3/3.
- V1 does not claim full analytics, ad-platform parity, unique visitors, pixel replacement, or identity resolution. Agreement: 3/3.

## Core Loop

- A tenant can create a first valid link. Agreement: 3/3.
- The link has a stable public URL and QR. Agreement: 3/3.
- The public URL/QR continues to represent the link after destination edit. Agreement: 3/3.
- A click can redirect and then appear as an accepted tracked click in analytics. Agreement: 3/3.
- User can understand which source/channel sent clicks. Agreement: 3/3.

## Redirect Safety

- Resolvable redirects continue when analytics is unavailable. Agreement: 3/3.
- Resolvable redirects continue when billing-core is unavailable. Agreement: 3/3.
- Resolvable redirects continue when dashboard is unavailable. Agreement: 3/3.
- Unsafe or unresolved destinations fail safely. Agreement: 3/3.
- Destination-change propagation has bounded stale-cache behavior or is explicitly measured as a gate. Agreement: 3/3.

## Analytics Minimum

- Analytics stores and displays tracked click totals. Agreement: 3/3.
- Analytics displays source breakdown using UTM/referrer/direct precedence. Agreement: 3/3.
- Analytics displays recent trend/date range within plan visibility. Agreement: 3/3.
- Bot-filtered and quota-dropped behavior is explainable and deterministic. Agreement: 3/3.
- No raw IP analytics persistence, fingerprinting, or unique-visitor claims. Agreement: 3/3.

## Quota Behavior

- Over-quota links still redirect if resolvable. Agreement: 3/3.
- Over-quota analytics can pause/drop and UI explains tracking status. Agreement: 3/3.
- Quota counters are authoritative server-side product behavior in later implementation gates. Agreement: 3/3.

## Tenant Isolation

- Tenant-scoped product data is isolated. Agreement: 3/3.
- Cross-tenant read/write/export/inference fails closed. Agreement: 3/3.

## Build-Approval Remediation Required Before PASS

- Owner locks V1 paid-launch cut. Agreement that unresolved: 3/3.
- Owner locks PromptPay/Stripe preflight requirement. Agreement that unresolved: 3/3.
- Owner locks custom-domain promise/non-promise for V1 and first paid launch. Agreement that unresolved: 3/3.
- Owner locks abuse/bot-filter threshold approach. Agreement that unresolved: 3/3.
- Owner locks retention/deletion policy sufficient for later gates. Agreement that unresolved: 3/3.
- Owner locks redirect SLO handling: Beta-measured only or provisional engineering target. Agreement that unresolved: 3/3.
