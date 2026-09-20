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

## 2. NEW evidence: what the LAB placement actually is

`docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md` §10 **D3 — Billing-core database placement**
(recorded under *"Decided (2026-08-27 unless noted) — implementation must follow these, not re-open
them"*) states, verbatim:

> "`billing_core` lives as a dedicated schema **inside the Hub project (Project A, `apps/hub-web`,
> Supabase `coyelzlgukvpgguqpjdi`)** — the `BILLING_CORE_PLAN.md` P-1 'dedicated schema in the Hub
> project' option. This matches the already-approved `identity-billing-platform` PRD, which places the
> central billing/entitlement schema in Project A … **A separate free account was rejected**: free tier
> has no automatic backups and pauses idle organizations, which is the wrong home for payment records."

R14 restates it: *"Billing-core shares the Hub project database with the public storefront (**decided
§10 D3**)."* And R15 — the risk this transition closes — reads: *"denial tests prove `hub_web_app`
cannot use `billing_core`/`billing_core_staging`. **Pre-data gate:** must be closed before any billing
data exists **in Project A**. **Standing hub-web security fix regardless of billing-core timing.**"*

**Initially this looked like a contradiction, because the schemas were measured in WSTERA_LAB. Reading
the SB01 lane documents resolves it — and the resolution matters:**

> `BRIEF-SB01-WSTERA-CENTRAL-BILLING-CONTINUATION-2026-09-09.md:129` — *"Use WSTERA LAB only; no
> production DB."*
> `BRIEF-SB01-PHASE-2B-DB-CONTRACT-2026-09-11.md:54` — *"Use WSTERA LAB only when runtime application
> is authorized; never production."* (and `:62` lists "mutate production databases" as forbidden)

So WSTERA_LAB is **SB01's development/staging environment**, not a relocated production billing store.
The LAB schemas exist because SB01 built and proved the contract there. **Production `billing_core` has
not been created in Project A yet — it arrives at Phase P1, exactly as D3 says.**

**Corrected reading:** there is **no divergence from D3.** What D0 measured is the expected state —
billing_core is not yet in Project A, therefore no billing data exists in Project A, therefore R15's
**pre-data condition is still truthfully satisfiable**. What is *not* yet possible is the **deny proof
itself**, because the deny matrix can only assert a DENY against a schema that exists in the target
project; against Project A today it is `3F000` = INCONCLUSIVE.

This is precisely the situation the Owner's clause 3 covers, and the Owner reserved the interpretation
to himself: *"Hermes is not authorized to weaken or rewrite the R15 security gate to make it pass."*

## 3. What else D0 measured that bears on this

| Fact | Evidence |
|---|---|
| hub-web contains **no reference to WSTERA_LAB or `BILLING_DATABASE_URL` anywhere** | repo-wide grep over `server/`, `scripts/`, `drizzle/`, config — zero hits |
| The runtime reads **no billing-database env name** | `server/_core/env.ts` exposes only `BILLING_CORE_CONTROL_READ_BASE_URL` / `_CREDENTIALS` (HTTP), plus `WSTERA_CONTROL_*` — no billing-DB URL |
| T4's billing read path is therefore **HTTP, not a second Postgres connection** | `TransportBackedBillingCoreAdapter` over `GET /v1/billing/control/snapshot` |
| WSTERA_LAB has dedicated billing roles and **no `hub_web_app`** | `billing_core_app` (login), `billing_core_staging_app` (login); `hub_web_app` absent |
| Neither schema holds business billing data | `payments` / `subscriptions` / `plans` / `stripe_customers` all **0**; staging's 78 rows are runtime/audit plumbing |

## 4. This question is moot in practice — a hard D1 blocker sits in front of it

Before D1 can reach the deny step at all, **D1.2 must apply the approved grant scope**, and that scope
includes `public.product_installations` SELECT + INSERT + UPDATE. That object does not exist.

**Proved, not assumed** — every statement ran inside a deliberately aborted transaction per the Owner's
own D2.2 test authority (`BEGIN → statement → ROLLBACK`), so nothing persisted:

```
target public.products                 exists
target public.product_assets           exists
target public.product_installations    DOES NOT EXIST

OK    products SELECT+INSERT
OK    product_assets SELECT+INSERT
FAIL  product_installations SELECT+INSERT+UPDATE
      -> SQLSTATE 42P01: relation "public.product_installations" does not exist
```

So D1.2 **cannot** be executed as written. The transition cannot complete D1→D4 while that object is
absent, regardless of how the deny interpretation is resolved. The deny question therefore does not
need to gate the run — the schema gap gates it, and that gap is also the revenue-critical one (§5).

**Consequence:** the only decision that unblocks forward progress is whether to authorize the schema
remediation. Once the objects exist, D1 proceeds, the grants can be applied and proven, and the deny
step can be handled on its own merits.

## 4.1 The deny dispositions, for completeness (not the immediate blocker)

R15's deny gate is written against **Project A**, where `billing_core` does not yet exist and — per D3 —
arrives at Phase P1. So the deny is **un-testable today and required before billing_core lands**, while
R15's own text calls the role change a *"Standing hub-web security fix regardless of billing-core
timing"*.

| | Disposition | Consequence |
|---|---|---|
| **A** | Proceed once the schema exists. Record the deny step as **"absence-invariant asserted; not 42501-testable because `billing_core` does not yet exist in Project A (arrives at Phase P1 per D3); mandatory re-verification at that point"** — never as a DENY PASS. | Closes the standing security fix; deny proof deferred with a named trigger. |
| **B** | Assert the deny against WSTERA_LAB instead. | LAB is SB01's dev/staging ("never production") and hub-web has no code path to it — it would deny a connection the runtime cannot make anyway. |
| **C** | HOLD R15 until `billing_core` exists in Project A. | Leaves the owner-identity runtime — the High risk R15 exists to close — in place while waiting on a Phase P1 event. |

**Hermes does not choose.** Raised under the re-ask rule because D0 evidence bears directly on a
condition the Owner wrote.

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
