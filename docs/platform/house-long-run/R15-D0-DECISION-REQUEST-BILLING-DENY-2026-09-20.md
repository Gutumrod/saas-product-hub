# R15 D0 — DECISION REQUEST: BILLING-DENY GATE vs THE DECIDED BILLING-CORE PLACEMENT

Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001` · Stage T5 · Work Unit R15 D0
Recorded: 2026-09-20 · Author: Hermes
Status: **DECISION REQUEST — R15 remains STOPPED before D1**

---

## 1. What the Owner's P4/U4 clause required, and what D0 found

The Owner's clause 3: *"If a required schema is absent and the approved deny matrix therefore produces
`3F000` / inconclusive rather than a valid DENY proof: → STOP before D1/D3 and report the exact
topology. Do not reinterpret schema absence as DENY PASS."*

Measured: `billing_core` and `billing_core_staging` are **absent from Project A** and present in
**WSTERA_LAB** (`ykxlqnshaaxmzzocpjlj`). R15 was stopped before D1. No mutation.

## 2. NEW evidence: this is not merely "absent" — it contradicts a decided placement

`docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md` §10 **D3 — Billing-core database placement**
(recorded under *"Decided (2026-08-27 unless noted) — implementation must follow these, not re-open
them"*) states, verbatim:

> "`billing_core` lives as a dedicated schema **inside the Hub project (Project A, `apps/hub-web`,
> Supabase `coyelzlgukvpgguqpjdi`)** — the `BILLING_CORE_PLAN.md` P-1 'dedicated schema in the Hub
> project' option. This matches the already-approved `identity-billing-platform` PRD, which places the
> central billing/entitlement schema in Project A … **A separate free account was rejected**: free tier
> has no automatic backups and pauses idle organizations, which is the wrong home for payment records."

R14 in the same plan restates it: *"Billing-core shares the Hub project database with the public
storefront (**decided §10 D3**)."*

And R15 — the very risk this transition closes — reads:

> "denial tests prove `hub_web_app` cannot use `billing_core`/`billing_core_staging`. **Pre-data gate:**
> must be closed before any billing data exists **in Project A**. **Standing hub-web security fix
> regardless of billing-core timing.**"

**Measured reality:** both schemas live in **WSTERA_LAB**, not Project A.

## 3. What else D0 measured that bears on this

| Fact | Evidence |
|---|---|
| hub-web contains **no reference to WSTERA_LAB or `BILLING_DATABASE_URL` anywhere** | repo-wide grep over `server/`, `scripts/`, `drizzle/`, config — zero hits |
| The runtime reads **no billing-database env name** | `server/_core/env.ts` exposes only `BILLING_CORE_CONTROL_READ_BASE_URL` / `_CREDENTIALS` (HTTP), plus `WSTERA_CONTROL_*` — no billing-DB URL |
| T4's billing read path is therefore **HTTP, not a second Postgres connection** | `TransportBackedBillingCoreAdapter` over `GET /v1/billing/control/snapshot` |
| WSTERA_LAB has dedicated billing roles and **no `hub_web_app`** | `billing_core_app` (login), `billing_core_staging_app` (login); `hub_web_app` absent |
| Neither schema holds business billing data | `payments` / `subscriptions` / `plans` / `stripe_customers` all **0**; staging's 78 rows are runtime/audit plumbing |

## 4. The question this raises

R15's deny gate is written against **Project A**. Project A has no billing schema, and per D3 one is
*supposed* to arrive there before Phase P1. So the deny gate is not vacuous by intent — it is
**un-testable now and required before billing_core lands**.

Meanwhile R15's own text calls the least-privilege role change a *"Standing hub-web security fix
regardless of billing-core timing"* — i.e. the role/grant half is meant to proceed independently, and
the deny half is the pre-data gate for billing's arrival.

Three dispositions are conceivable, and the Owner explicitly reserved this interpretation to himself:

| | Disposition | Consequence |
|---|---|---|
| **A** | Proceed D1→D4 now. Record the billing-deny step as **"absence-invariant asserted; not 42501-testable because the schema is not in Project A; mandatory re-verification when `billing_core` lands in Project A per D3"** — never as a DENY PASS. | Closes the standing security fix now; deny proof deferred to the correct moment, with a named trigger. |
| **B** | Treat the current LAB placement as the new architecture and re-scope the deny there. | Contradicts D3's "not re-open them" status, so it needs an explicit Owner re-open, and touches a project where hub-web has no code path. |
| **C** | HOLD R15 entirely until billing_core's placement is settled. | Leaves the owner-identity runtime in place longer, which R15 calls a High risk that "defeats every grant boundary". |

**Hermes does not choose.** Under the re-ask rule this is permitted to be raised because D0 evidence
exposes a new architecture gap — the decided placement and the deployed placement disagree.

## 5. Separate item, revenue-critical (independent of §4)

`product_installations` and all five `fulfillment_*` tables are absent from Project A, so the live
deployed Worker has no tables behind its product-installation and fulfillment write paths. This blocks
product lanes from fulfilling against the live database, and it also blocks R15 D2.2 (the matrix
requires SELECT/INSERT/UPDATE on `product_installations`, which must exist first). Full scope and the
shortest safe remediation path are in `R15-D0-SCHEMA-REMEDIATION-PROPOSAL-2026-09-20.md`.

## 6. Current state (unchanged)

Worker `00bdb1b5` live · zone hardened · runtime `DATABASE_URL` still the owner credential ·
`hub_web_app` does not exist · capabilities inert · no role, grant, deny, credential, secret or deploy
resulted from D0. All rollback targets available.
