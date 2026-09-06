# WSTERA Free-First Infrastructure Policy

**Status:** CANONICAL OWNER POLICY — LOCKED
**Effective:** 2026-09-06
**Mode:** WSTERA PORTFOLIO STRATEGY / BUILD-TO-SELL
**Owner:** Free — FINAL AUTHORITY
**Applies to:** all current and future WSTERA products

## Canonical principle

> WSTERA will not create fixed infrastructure cost for a product that has not earned real revenue while a viable free path can satisfy the product's acceptance criteria.
>
> Paid infrastructure is an evidence-backed investment, not a default architecture choice.

This policy governs Hosting, Runtime, Database, Auth, Storage, CDN, Queue, Cron, Monitoring, Logging, Email, Messaging, Analytics, AI Provider, Payment infrastructure, CI/CD, Backup, DNS, and other external infrastructure/services.

## 1. Pre-Revenue = FREE FIRST

For every `PRE-REVENUE` product, the default infrastructure path is free.

Before real revenue exists, do not propose a paid provider or paid tier as the default merely because it is easier to configure, more popular, recommended by a framework, familiar to a worker, or commonly described as "production ready".

`Production` is not a cost trigger. Revenue, operational need, capacity, and material risk are cost triggers.

## 2. Paid before revenue = LAST RESORT

A paid path may be proposed before revenue only when evidence proves all of the following:

1. appropriate free paths were evaluated;
2. the viable free paths cannot satisfy a material requirement or acceptance criterion;
3. the blocker cannot reasonably be solved through architecture/configuration;
4. the blocker directly prevents sale, onboarding, pilot, operation, security, recovery, or another material requirement; and
5. no other suitable free alternative remains.

If a viable free path remains, paid infrastructure is **NOT AUTHORIZED**.
## 3. Provider neutrality

Provider selection must follow:

`Requirement -> Constraints -> Current Baseline -> Candidate Discovery -> Comparison -> Decision`

It must never follow:

`Preferred Provider -> search for justification`

A provider name appearing in PRD, Architecture, Operations, Terms/Privacy, Deployment Guide, README, environment docs, Roadmap, Pricing, or source/config does not make that provider canonical.

Every provider reference must be classified as one of:

- `LOCKED` — supported by an explicit canonical decision.
- `PROVISIONAL` — currently used or trialed inside bounded authority, but not permanently selected.
- `ASSUMPTION` — written or configured without an authoritative provider decision.
- `UNDECIDED` — capability is required but provider selection has not been made.

Unsupported provider-specific text is `ASSUMPTION / DOCUMENT DRIFT` and must not be promoted into architecture fact.

## 4. First revenue opens evaluation; it does not authorize migration

Revenue states are evidence-based only:

- `PRE-REVENUE`
- `EARLY-REVENUE`
- `REVENUE`

After revenue begins, the current stack remains the baseline. Revenue only opens a Paid Evaluation Gate; it does not automatically approve a paid provider or migration.
## 5. Paid Evaluation Gate

Any paid proposal must compare the current baseline against the candidate across all material dimensions, including:

- cost;
- reliability and availability;
- performance;
- security, privacy, and compliance;
- operational complexity;
- deployment and rollback;
- monitoring and backup/recovery;
- developer experience;
- scaling;
- migration risk and vendor lock-in;
- support; and
- regional suitability.

A paid candidate passes only when it is better than the current baseline on **every material requirement**. A material trade-off means the Migration Gate remains closed unless Owner explicitly overrides this policy.

Acceptable triggers may open evaluation, not approval: free quota blocking real customers, paid-customer reliability/SLA requirements, backup/recovery or security/compliance requirements that free paths cannot meet, actual capacity exhaustion, evidence that operating the free solution costs more, or a paid capability that removes a real revenue blocker.

## 6. Free-stage architecture quality

Free infrastructure must not be deliberately disposable. Prefer standards-based, portable, exportable, reversible, migration-friendly, low-lock-in designs so later paid migration does not require rewriting the product.

Terms/Privacy must not name or promise a provider before the architecture/provider decision is authoritative.
## 7. Mandatory portfolio audit fields

For every product, current control evidence must identify:

- Revenue State with evidence;
- actual infrastructure inventory;
- current cost as `Free`, `Usage-based`, `Fixed monthly`, or `Unknown`;
- each provider decision as `LOCKED`, `PROVISIONAL`, `ASSUMPTION`, or `UNDECIDED`;
- document/runtime drift; and
- a Free-First path plus future paid-evaluation trigger.

The required lifecycle is:

`Stage 1 Pre-Revenue: FREE FIRST`
`Stage 2 Closed Beta/Pilot: FREE FIRST unless hard blocker is proven`
`Stage 3 First Revenue: current stack remains default`
`Stage 4 Revenue Growth: Paid Evaluation Gate may open`
`Stage 5 Scale: migrate only after candidate beats current baseline under Owner policy`

## 8. Fail-closed enforcement

Workers, reviewers, Hermes, and Secretary must stop provider-specific implementation when provider authority is absent or when a paid path is proposed for a pre-revenue product without the required evidence.

A worker may discover and compare candidates, but may not convert preference, framework defaults, or convenience into provider authority.

The PS01 Vercel/Vercel Pro proposal that triggered this correction is retained as evidence of provider-assumption drift. It is **not an approved provider decision** and must not be used as authority for PS01 staging.

## 9. Supersession

This Owner policy supersedes any older current-state strategy, roadmap, deployment prose, or worker recommendation that treats paid infrastructure, a named provider, or "production" status as an automatic infrastructure decision. Historical evidence remains unchanged for provenance.

## 10. Owner Cost Doctrine — Family-Money Standard

All product infrastructure cost is treated as **Owner family money that requires justification before spending**, regardless of whether the amount is 100, 500, 1,000 THB/month, or more.

The controlling principle is:

> Money a Product has not earned is not money the Product is entitled to ask the Owner to fund, unless the Owner can clearly see that the spending unlocks real revenue or mitigates a material risk.

Therefore:

- No revenue = no new fixed cost while a viable free path exists.
- If a free path works, use it first.
- Spending requires a proven blocker or a proven material return.
- Revenue does not justify replacing a working free/current solution merely because paid infrastructure appears better.
- Every proposed expense must be compared against the actual current baseline, not against provider marketing claims.
- "Future-proofing", "for future scale", or "เผื่ออนาคต" is not sufficient justification for spending today.
- Small recurring charges must not be normalized as trivial. Repetition across products turns small assumptions into portfolio-level fixed cost.

This doctrine applies to every current and future WSTERA product and to every agent/worker/provider recommendation.