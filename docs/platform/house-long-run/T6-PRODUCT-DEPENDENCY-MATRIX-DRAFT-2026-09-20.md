# T6 PRODUCT DEPENDENCY UNBLOCK MATRIX — DRAFT (prepared during T5, to be finalised at T6)

Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001` · Stage T6 · Work Unit T6-WU02 (draft)
Status: **DRAFT — figures below are indicative until T5 closes and T6-WU01 reconciles the repo state.**
Recorded: 2026-09-20 · Orchestrator: Hermes

Per the Run Manifest, this matrix states for each product lane **only**: whether the House dependency
is available, the exact contract/evidence reference, and what product-specific work remains. It must
**not** mark any product production-ready from House evidence alone.

## House capabilities that products consume

| Capability | State at T5 | Evidence |
|---|---|---|
| Product-event trust (per-product signer) | Delivered; **inert in production until its config is delivered** | T2 closure; B2 BATCH_APPROVED; hub-web `e24d5a9`; 29 signer cases |
| Shared one-time fulfillment (P1/L4) | Delivered; **not activated for any product** | T3 closure; B3 BATCH_APPROVED; hub-web `33082f8`; 8 acceptance proofs |
| SB01 authoritative read projection consumed by Control | Delivered; **inert in production until its config is delivered** | T4 closure; B4 BATCH_APPROVED; hub-web `381fef3` + T5 hardening; SB01 LR-2F-A accepted at `96abe085` |
| Production hardening (headers, HTTP→HTTPS, build-env gate, dependency fix) | Delivered; HTTP→HTTPS requires the zone change at WU05 | T5-WU02; hub-web `15b1579` |
| R15 least-privilege DB role | **PREPARED, NOT APPLIED** | T1 package + Owner `public.profiles` exclusion ruling |

## Per product lane

| Lane | House dependency available? | Exact contract / evidence reference | Product-specific work still required |
|---|---|---|---|
| **MT01** Multi-Tenant AI | Fulfillment path: available (P1/L4 capability delivered). Signer + read projection: available but inert until configured. | `T3-CLOSURE-2026-09-20.md`; Master Plan `:503-507`; L4 rung `:368` | MT01 product content and its own L0–L5 evidence (buyer/scope lock, clean-install proof, license/IP, packaging/versioning, support boundary). House closes the fulfillment mechanism only; it does not define MT01's commercial terms or ship its artifact. |
| **CM01** Booking Ticket Module | Same as MT01 for fulfillment. | as above | CM01 artifact packaging + its own L-rungs. House provides the delivery/grant/revoke/reissue mechanism, not CM01's contents. |
| **HC01** Headless Commerce | Same as MT01 for fulfillment. | as above | HC01 artifact packaging + its own L-rungs. Note the Master Plan records HC01's `BRIEF.md` as an empty checklist that fails L0 today — that is HC01's work, not House's. |
| **BK01** Booking | Not a consumer of the fulfillment capability in this scope. Billing stays isolated (`BILLING_CORE_PLAN.md`). | T1 R15 package; `docs/CURRENT_STATUS.md` | BK01's own BK-A/BK-B closure and release gates; BK01 billing migration remains its own track. |
| **PS01** Pawstia | Signer + read projection available in principle; **Project B admission not authorized**. | T2/T4 closures | PS01 Phase 13 verification is not closed; Project B admission requires schema-scoped migrations/RLS/grants/denial evidence plus explicit authorization. |
| **LK01** WSTERA Link | Not a consumer of the new capabilities in this scope. | `docs/CURRENT_STATUS.md` | LK01 remains behind applicable P0b/P1 + Phase P4 scheduling. |
| **DC01** DocCraft | Not a consumer of the new capabilities. | `docs/CURRENT_STATUS.md` | DC01 Public Pilot / PV Gate is open with zero real-user evidence; Phases 7–9 remain frozen by its own gates. |
| **SB01** stripe-billing | **Not a House dependency — SB01 is an external authoring lane.** House consumes its accepted read projection. | SB01 LR-2F-A handoff; `T4-DEPENDENCY-ENTRY-GATE-2026-09-20.md` | SB01's remaining work is its own; `LR-2F-B` was ruled DO NOT START by Owner/Sol, and production activation is not authorized. |
| **WS01** WSM | Not a consumer of the new capabilities. | registry identity records | WSM Phase 1 schema contract remains its own; runtime placement is a separate decision. |
| Other tracks (`RM01`, `OD01`, `FF01`, `CA01`, `IO01`, `ET01`, `CO01`, `AR01`, `LN01`, `TT01`, Money Leak Buddy) | Not consumers in this scope. | `docs/CURRENT_STATUS.md` | Unchanged; each needs its own approved contract and work slot. |

## What House explicitly does NOT claim

- No product is marked production-ready by House evidence.
- The fulfillment capability being delivered does **not** mean MT01/CM01/HC01 have a working buyer path
  yet: activation, artifact packaging and each product's own L-rungs remain theirs.
- The signer and read capabilities being delivered does **not** mean any product emits signed events or
  consumes billing truth yet: each requires its own configuration and verification.
- R15 being prepared does **not** mean the Hub runtime is least-privileged yet: the apply is a T5-WU05
  operation and, until it runs, the production runtime still uses the prior credential.
- SB01's acceptance does not authorize production activation of billing.

## Open items that could change this matrix

1. T5-WU05 outcome (deploy + capability activation sequencing) — determines whether the caps are merely
   "delivered" or actually "available in production".
2. T6-WU01 reconciliation — may adjust product-lane states recorded in `docs/CURRENT_STATUS.md`.
3. The recorded `GATE-COVERAGE-FINDING` (test files outside every typecheck gate) is a platform-level
   limitation that affects how much a green `tsc` proves for **every** consumer of these capabilities.
