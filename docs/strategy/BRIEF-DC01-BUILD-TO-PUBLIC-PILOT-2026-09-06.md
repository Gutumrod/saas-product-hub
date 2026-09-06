# BRIEF — DC01 Build to Public Pilot

**Date:** 2026-09-06
**Mode:** WSTERA BUILD-TO-SELL
**Product:** DocCraft (DC01)

## Owner Direction
- Build-to-Sell is the active priority.
- Plan before every implementation, even for small changes.
- Do not open Council, Module Hub Scan, cloud/account/subscription scope, or unrelated research by default.
- Read current repo/docs/source before changing code; do not assume stale handoff state.
- Preserve architecture and completed evidence; do not restart closed work.

## Current Verified State
- Repo: `D:\AI-Workspace\projects\saas-product-hub\products\DocCraft`
- Branch: `master`
- HEAD: `15a58ccca221a9d568513f103b9d163cdc9dd382`
- Local vs origin: `0/0`
- Working tree: clean
- DC-SR-01 / Phase 4.1 Business Logo: CLOSED
- Implementation commit: `11f21e55ae2789720b393411097db4b08b107967`
- Closure/status commit: `15a58ccca221a9d568513f103b9d163cdc9dd382`

## Evidence Already Closed
- Owner native Chrome print/manual acceptance: PASS
- Independent Stage QA: `agent-qwen` task `t_7c87a5cc` PASS
- Relay final evidence `t_b77aaa67`: PASS
- lint PASS; typecheck PASS; unit 136/136; build PASS; Chromium E2E 36/36; `git diff --check` PASS
- Standard document-number prefix sync is implemented; custom numbers are preserved; Tax Invoice remains fail-closed.

## Problem / User / Destination
**Problem:** Core V1 works, but Public Pilot still lacks PromptPay document QR and final release hardening.
**User:** Thai micro-SME, freelancer, and service business creating quotations, invoices, receipts, work orders and tax invoices.
**Sell-ready destination:** create → persist/restore → PromptPay instruction → preview/print → backup/recovery → public pilot URL/support/privacy expectations.

## Immediate Next Ticket — DC-SR-02 / Phase 5 PromptPay Document QR
Before implementation, inspect current `DocCraftDocument.payment`, calculation totals, payment editor block, `DocumentPreview`, persistence validation/migration, JSON import/export and current dependencies.
Use `docs/BRIEF-phase5-promptpay-qr.md` as historical prepared input, but update the plan against current HEAD/schema v3 before coding.

### Locked Scope
- PromptPay identifier validation/normalization
- deterministic EMV payload + CRC
- amount modes: deposit / net payable / no fixed amount
- QR presentation in editor preview/native print
- persistence/refresh/JSON round-trip
- invalid identifier/amount must fail closed

### Explicit Non-Scope
- payment confirmation / slip verification / bank API / webhook
- DocCraft subscription billing or recurring payment
- Supabase/auth/cloud sync
- server-side QR/PDF generation

## Workflow
1. Verify repo/docs/source and present current-state + Phase 5 implementation plan to Owner.
2. Wait for Owner confirmation.
3. Implement thin end-to-end PromptPay slice.
4. Run targeted tests, lint, typecheck, unit, build, E2E, diff-check and native-print acceptance.
5. Independent implementation review.
6. Close DC-SR-02 only with evidence.
7. Plan and execute DC-SR-03 Phase 6 MVP hardening.
8. After release candidate passes, move to DC-SR-04 Controlled Public Pilot.

## Failure / Security
- Never render a usable-looking QR from invalid target or invalid amount.
- Preserve local-first/no-login architecture and existing persistence compatibility.
- Do not collect sensitive document contents for pilot telemetry.

## Acceptance / Stop
DC-SR-02 closes only when known payload/CRC vectors, all amount modes, invalid-state guards, persistence round-trip, print layout, regression suite and independent review pass.
Stop for contract ambiguity, migration-safety conflict, security/privacy issue, or requirement that crosses into payment confirmation/billing/backend.
