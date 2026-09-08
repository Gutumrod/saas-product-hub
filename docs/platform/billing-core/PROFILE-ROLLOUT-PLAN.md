# WSTERA Billing Core — Product Profile Rollout Plan

Status: OWNER-AUTHORIZED BUILD / TEST MODE ONLY — 2026-09-08

## Core rule
Billing Core is built once. Products join one at a time through a versioned Product Billing Profile. No Product may create a competing Stripe/subscription state machine after admission.

Every runtime profile MUST have a matching human-readable dossier under `docs/platform/billing-core/profiles/` before activation. The dossier records payer, billing model, price/cadence, rails, entitlement effect, unresolved commercial decisions, and authoritative source documents.

## Rollout sequence
1. Build Profile Registry + request-scoped resolver + activation guard.
2. Register PS01 as Profile #1 in `pending_validation`.
3. Run Stripe Test preflight and map PS01 Test Product/Price.
4. Prove PS01 checkout -> webhook -> reconcile -> entitlement in Test Mode.
5. Add Product #2 only after PS01 evidence; prove cross-product isolation.
6. Continue one profile at a time. A profile with unresolved commercial terms stays draft/pending and cannot serve paid checkout.
7. BK01 is last-path compatibility work: facade first, then capability extraction only after parity/rollback evidence.

## Mandatory activation gate
A profile cannot become `active` without: canonical product identity, approved dossier, complete billing terms for the enabled rail, environment-bound caller auth, account-bound assertion for account-scoped routes, provider mappings, entitlement adapter contract, reconciliation policy, negative/isolation tests, audit projection, and rollback target.

## Current profile queue
PS01 = first implementation. LK01/WS01/DC01/MT01/CM01 = documented queue, activation gated by each Product's commercial readiness. BK01 = transitional compatibility profile; no forced migration.

## Non-negotiable
No live keys, live charges, production billing deploy, arbitrary caller Price/amount/currency, mutable global active profile, or mixing BK01 merchant/customer PromptPay deposits with WSTERA SaaS billing.