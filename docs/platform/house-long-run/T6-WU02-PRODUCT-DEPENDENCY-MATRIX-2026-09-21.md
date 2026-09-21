# T6-WU02 — PRODUCT DEPENDENCY UNBLOCK MATRIX

Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001` · Stage **T6** · Work Unit **T6-WU02**
Worker Rule: OpenCode · Objective: factual dependency matrix only; **no product implementation**.
Status: **PREPARED — entered only on B5 `BATCH_APPROVED`**

Per the manifest, each lane states **only**: (a) House dependency available/unavailable,
(b) exact contract/evidence reference, (c) product-specific work still required.
**No product is marked `PRODUCTION_READY` by House evidence.**

---

## 1. What House now actually provides (measured, 2026-09-21)

| House capability | State | Evidence |
|---|---|---|
| Schema: products / product_assets / **product_installations** | **live** (9/9 tables, 9/9 enums) | `R15-SCHEMA-REMEDIATION-APPLIED-2026-09-21.txt`, `R15-D0-RERUN-AFTER-REMEDIATION-2026-09-21.txt` |
| Fulfillment delivery/revocation truth (`fulfillment_*`) | **live — tables exist and are reachable by the runtime** | same; migration `0007` |
| Least-privilege runtime role `hub_web_app` | **live** — runtime no longer connects as the owner | `R15-D3-SWITCH-AND-RUNTIME-VERIFY-2026-09-21.txt` |
| Product-event webhook (signed, replay/size/rate controlled) | **deployed; rejects unsigned with 401** | WU06 live proof; T2 / B2 |
| Agent-event webhook | **deployed; rejects unsigned with 401** | WU06 live proof |
| Control read projection (`GET /v1/billing/control/snapshot`) | **deployed code path; fail-closed 403 unauthenticated** | T4 / B4; WU06 |
| HTTPS + security headers on both hosts | **live and enforced** | WU06 16/16 |
| `PRODUCT_EVENT_SIGNERS` | **INERT — material does not exist in this environment** | WU05 record; searched by name only |
| `BILLING_CORE_CONTROL_READ_*` | **INERT — material does not exist** | same |
| Control request correlation | **DESIGN ONLY, not implemented** | `CONTROL-READ-CORRELATION-DESIGN-2026-09-20.md` |
| Billing deny on Project A | **absence-invariant** (schemas not present there); re-verify when created | Owner disposition A |
| Owner-authenticated surfaces (login, Work Queue, Owner Inbox, Agent Activity) | **NOT verification-tested** | pending Owner-visible verification |
| Fulfillment synthetic end-to-end path | **NOT exercised** | untested at T5 |

**Reading of that table:** the *storage and transport* half of the fulfillment capability is now
available and live; the *activation and end-to-end proof* half is not.

## 2. Matrix — per product lane

| Lane | Product | House dependency available? | Exact contract/evidence reference | Product-specific work still required |
|---|---|---|---|---|
| **MT01** | `multi_tenant_ai` (one-time source) | **Partial** — product/installation records and fulfillment tables are live; event signing is inert | `T4-DEPENDENCY-ENTRY-GATE-2026-09-20.md`, `R15-D4-EVIDENCE-CLOSURE-2026-09-21.md` | Server is in-memory/demo-only; high/critical dependency findings, license, packaging, deployable product — all open. **Also needs the seller to activate `PRODUCT_EVENT_SIGNERS` and a reviewed provisioning procedure for its per-product signer.** |
| **CM01** | `booking_ticket_module` (one-time source/template) | **Partial** — same as MT01 | same | High/critical toolchain findings, exact browser rerun, adapter/package/release automation, buyer verification. Independent of House for its own release, but its **fulfillment** depends on the same inert signer material (see §3). |
| **HC01** | `headless_commerce` (one-time source) | **Partial** — same as MT01 | same | Default branch has no integrated product; PR #1 server has no auth/persistent DB and passes only 13/14 tests. HC01's own repo `BRIEF.md` is an empty checklist (fails L0). |
| **BK01** | `booking` | **Partial** — House provides installation/fulfillment records only | same | Clean lint fails, clean build depends on untracked env state, no application test suite or CI. |
| **PS01** | `pawspace` / Pawstia | **Partial** — same | same | TypeScript phase tests lack a checked-in runner; billing, operations, internal rename, social-handle claim, TH trademark search, real-shop pilot open. Not admitted until its schema/RLS/grants package is independently reviewed and explicit Project B admission is authorized. |
| **DC01** | `doccraft` | **Partial** — same | same | Gate 3 manual Chrome/Edge print acceptance open; critical test-tool advisory; all cloud/SaaS work remains. |
| **LK01** | `wstera_link` | **Not applicable yet** — no production application code exists | same | No production application code exists. |
| **SB01** (separate lane) | central billing core | **Independent** — its LR-2F-A projection contract was accepted and is what the T4 adapter consumes | `SB01 LR-2F-A @ 96abe08`; `T4-DEPENDENCY-ENTRY-GATE-2026-09-20.md` | SB01 remains its own lane; House does not implement it. Billing truth lives in **WSTERA_LAB** today and production `billing_core` arrives in Project A at Phase P1 per Master Plan §10 D3. |

## 3. The one House-side gate that touches every fulfillment lane

Every product lane that wants to record an installation from its own signed event needs
`PRODUCT_EVENT_SIGNERS`, and every lane that wants read visibility into billing entitlement needs
`BILLING_CORE_CONTROL_READ_*`. **Neither exists in this environment.** Per the Owner's own ruling:

> "Do not conflate R15 authorization with permission to invent missing application credentials…
> If required credential material or a reviewed provisioning procedure does not exist: keep that
> capability fail-closed/inert and report the exact blocker. Do not invent a credential protocol merely
> to close T5."

So this is a **named, owner-facing blocker shared by all fulfillment lanes**, not a per-product defect.
It needs either (a) real per-product signer material supplied through the canonical secret channel plus a
reviewed provisioning procedure, or (b) an explicit Owner decision to proceed without it.

## 4. What this work unit must NOT do

- Must not implement anything for any product lane.
- Must not mark any product `PRODUCTION_READY`.
- Must not activate capabilities, invent credentials, or describe an inert capability as available.
- Must not infer product readiness from House evidence. House proves the **contract and storage**;
  each product's own release ladder (L0–L5 for one-time products, G0–G7 for SaaS) remains its own evidence.

## 5. Boundary statement (required)

House evidence closes the House-side dependency only. Products remain at their own recorded stages:

- one-time source products (MT01, CM01, HC01) still owe **L0–L5**, with **L4 (fulfillment path)** now
  *possible* against live House tables but **not exercised end to end**;
- SaaS lanes (BK01, PS01, LK01, DC01) still owe their own release gates.

**`PRODUCTION_READY` is not claimed for any lane by this matrix.**
