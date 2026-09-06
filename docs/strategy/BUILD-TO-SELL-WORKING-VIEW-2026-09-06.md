# WSTERA Build-to-Sell Working View

**Date:** 2026-09-06
**Authority:** Owner direction — WSTERA House Major / Secretary Control
**Mode:** BUILD-TO-SELL

## Operating rule

Favor `finish > expand`, `deploy > redesign`, `real customer evidence > more theory`, and `revenue path > more gates`.

Do not automatically reopen Product Gate 1A, Business/Market Gate 1B, Module Hub Scan, Portfolio Arbitration, new Council rounds, or architecture/research work unless new evidence proves they directly unblock sale, onboarding, deployment, payment, support, or a generic pilot defect.

## Portfolio baseline

- Product Gate 1A: **7/7 PASS**.
- Business / Market Gate 1B: **7/7 PASS**.
- Primary heavy track: **BK01 Booking**.
- BK01 Order implementation: **HOLD / NOT AUTHORIZED**.
- KMO BK01 Pilot: **separate independent workstream**; KMO-specific work does not belong in canonical BK01.
- Next product after BK01 is chosen by distance to revenue; current leading candidate is DocCraft.

## BK01 sellability view

| Area | Current state | Immediate blocker / next proof |
|---|---|---|
| Build | Non-DB verification previously PASS: 19/19 tests, lint, consumer/admin builds. Current working tree has authorized CONT-04 remediation changes only. | Finish current G8 remediation and re-run required checks. |
| Runtime | WSTERA Lab is now the approved non-production DB proving runtime; migration history previously verified 29/29 and pgTAP contract 19/19 before current G8 defect. | Close remaining DB-backed G8/G9/CONT-04 evidence. |
| Deploy | Canonical WSTERA production deployment is not yet proven. | Finish BK-A/CONT-04, then release-readiness and deployment gate. |
| Payment | Monthly Stripe checkout/portal/webhook surfaces exist; public annual billing is out of V1. | Generic G8 billing wrapper defect must be fixed and lifecycle/idempotency/out-of-order authorization re-proven. Final public prices remain Owner-unapproved. |
| Onboarding | Self-service register, email confirmation, shop provisioning, 14-day trial and business settings surfaces exist. | Must be proven end-to-end in release/pilot environment without per-customer code work. |
| Support | Ticket/support surfaces and runbooks exist. | DB-backed role/audit verification and real support operating path still need release evidence. |
| Pilot | KMO independent pilot is active on its own branch/repo boundary. | Consume only evidence-backed generic defects/UX issues; do not absorb KMO config requests into canonical. |
| Canonical defects | Active: G8 billing wrapper result-field mismatch (`out_applied` vs `applied`). | Remediation packet `SGPT-bk01-cont04-remediate-billing-wrapper-005` is active. |
| Sellable | **NO** — not yet full buy → activate → use → support path. | Close DB/runtime/payment release blockers before expanding capability. |
## KMO feedback intake

Current inspection found no explicit `BUG_GENERIC`, `UX_GENERIC`, or canonical-defect handoff from the KMO pilot yet. Treat the KMO pilot repository as evidence source only; do not modify its execution scope from House Major.

## WSTERA Platform

Current hub-web remediation working tree contains production-runtime work and evidence. The runtime evidence reports Control Supabase migrations/RLS/persistence verified, `platform.wstera.com` DNS/deployment completed, external Windows smoke passed, and typecheck/tests/build passed 112/112. Mac-first external smoke remains unperformed.

S-Bridge task `SGPT-wstera-platform-prod-runtime-remediation-003` currently records `BUILDER_FAILED`, while the repository contains later remediation/deployment evidence. This is a coordination/evidence anomaly: do not self-certify Platform release from the repository document alone. Review the agent result and reconcile relay lifecycle before final Council Release closeout.

## Active agents / transport

- Hermes runtime process is active.
- S-Bridge health check: `ok=true`, `kanban_available=true` when bound to canonical `HERMES_HOME`.
- BK01 remediation packet `SGPT-bk01-cont04-remediate-billing-wrapper-005`: builder released; no commit/push authority in that packet.
- Platform runtime remediation: repository work exists, but relay lifecycle currently reports builder failure; monitor/reconcile, do not duplicate implementation.

## Secretary next actions

1. Protect BK01 current two-file authorized dirty baseline while G8 remediation runs.
2. Review G8 evidence immediately when the task returns; if PASS, release continuation of remaining CONT-04 G9/final verification under existing authority.
3. Do not start BK01 Order or any new feature track.
4. Review Platform remediation evidence against actual relay result; require Mac-first smoke before release PASS.
5. Intake KMO pilot findings only when explicitly evidence-backed and classify them before touching canonical BK01.
6. After BK01 runtime gates close, move directly toward reproducible deployment, pricing lock needed for sale, onboarding smoke, support smoke, and first sellable release.

## Owner decisions needed now

**None immediately.** Current blockers are executable verification/remediation work already inside approved authority. Escalate only if G8/G9 exposes a product decision, final public pricing becomes the next launch blocker, or Platform Mac smoke reveals a release defect.