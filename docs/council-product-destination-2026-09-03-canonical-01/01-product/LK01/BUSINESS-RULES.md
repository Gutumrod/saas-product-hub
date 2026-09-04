# LK01 Business Rules

Gate: Product Gate only  
Verdict carried from synthesis: **REMEDIATE**

This file records product/business behavior rules only. It does not decide market, pricing, competition, revenue strategy, GTM, architecture, or release.

## Link and Redirect Rules

- A public short link/QR must remain stable when its destination changes. Agreement: 3/3.
- QR must encode the stable public URL, not the destination URL. Agreement: 3/3.
- Redirect reliability is more important than analytics completeness. Agreement: 3/3.
- A resolvable redirect must not depend synchronously on analytics, billing, or dashboard availability. Agreement: 3/3.
- On unsafe or unresolved destinations, the system must fail safely and not guess a fallback destination. Agreement: 3/3.
- Quota exhaustion must never disable a resolvable redirect. Agreement: 3/3.

## Analytics Rules

- V1 analytics counts tracked clicks, not unique visitors. Agreement: 3/3.
- Raw IP must not be persisted as analytics. Agreement: 3/3.
- Fingerprinting and cross-device identity resolution are out of scope. Agreement: 3/3.
- Attribution precedence is UTM source, then normalized referrer, then Direct/None. Agreement: 3/3.
- Bot filtering must be deterministic/versioned and must not block redirect. Agreement: 3/3.
- Dashboard copy must not claim parity with Facebook, TikTok, LINE, Shopee, Lazada, or ad-platform counters. Agreement: 3/3.

## Tenant and Entitlement Rules

- Tenant-owned data must be tenant-scoped and fail closed. Agreement: 3/3.
- Cross-tenant read/write/export/inference is a hard failure. Agreement: 3/3.
- Entitlement cannot be granted from browser checkout success. Agreement: 3/3.
- Entitlement must come from verified provider event and persisted transition through centralized billing-core. Agreement: 3/3.
- Redirect hot path must not call billing-core synchronously. Agreement: 3/3.

## Commercial Input Facts

The following values are reported from locked input documents and are not re-decided here:

- Free: 0 THB. Agreement as reported fact: 3/3.
- Pro: 199 THB/month. Agreement as reported fact: 3/3.
- Business: 590 THB/month. Agreement as reported fact: 3/3.
- Free plan includes 5 links, 250 tracked clicks/month, and 7-day analytics visibility/retention behavior as documented. Agreement as reported fact: 3/3.
- Pro and Business plan limits are reported as documented input facts. Agreement as reported fact: 3/3.

## Billing Rail Rules

- Card rail is recurring only after verified provider truth. Agreement: 3/3.
- PromptPay is manual/non-auto-renew and cannot launch without reconciliation. Agreement: 3/3.
- PromptPay success/return UI is not authoritative entitlement proof. Agreement: 3/3.

## Deferred Rule Decisions

- Exact abuse thresholds remain unresolved. Agreement: 3/3.
- Exact retention/deletion semantics remain unresolved. Agreement: 3/3.
- Exact redirect SLO remains unresolved/deferred to Beta measurement. Agreement: 3/3.
- Custom-domain apex behavior remains unresolved/deferred. Agreement: 3/3.
