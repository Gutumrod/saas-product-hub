# R15 — D0 PRE-FLIGHT OUTCOME — COMPLETE TOPOLOGY (corrected and final)

Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001` · Stage T5 · Work Unit **R15 D0**
Authority: **OWNER DECISION 2026-09-20 — AUTHORIZE R15 D0→D4**, bounded to `T1-R15-DEPLOY-ROLLBACK-PLAN.md`
Executed: 2026-09-20 (Asia/Bangkok) · Operator: Hermes (deterministic provisioning operator, per Owner delegation)
Method: **READ-ONLY.** `SELECT` and `to_regclass()` only. No CREATE / ALTER / GRANT / REVOKE / INSERT / UPDATE / DELETE ran. No credential value printed, persisted, or committed.

> **Correction notice.** The first revision of this record stated that `billing_core` /
> `billing_core_staging` were absent "anywhere". That was wrong — the first probe only inspected
> Project A. The Owner's P4/U4 clause explicitly asks *where `billing_core_staging` actually lives*, so
> the search was completed across the connection targets named in the canonical secret store. This
> revision records the corrected, complete finding. The disposition (STOP before D1) is unchanged, but
> for a more precise reason.

---

## D0.1 — Transition target (pinned)

| Item | Value |
|---|---|
| Runtime credential role form | `postgres.<ref>`, ref `coyelzlgukvpgguqpjdi` — **matches the R15 defect identity in the Master Plan exactly** |
| Server | PostgreSQL 17.6 · database `postgres` |
| Target Worker | `hub-web` (`wstera.com`, `platform.wstera.com`) |
| Superseded version (rollback target) | `9db4fb70-a5e5-4989-94b5-1d271ab10055` |
| Current live version | `00bdb1b5-70d2-4e41-b97d-f1f238e9bf31` |

## D0.2 — Baseline captured (rollback reference)

| Baseline item | Observed |
|---|---|
| `current_user` / `session_user` | **`postgres`** — the owner identity; this is the R15 defect, confirmed by measurement rather than assumed |
| `hub_web_app` role | **does not exist** (zero rows) — expected at baseline |
| Objects owned by `hub_web_app` | 0 |
| `public.profiles` RLS | `relrowsecurity = true`, `relforcerowsecurity = false` |
| `public.profiles` policies | `profiles_self_read` → `authenticated`; `profiles_internal_read` → `authenticated`; `profiles_service_write` → `service_role`. **No `hub_web_app` policy** — matches the Owner OPTION 3 ruling |

## D0.4 — P4/U4 pre-data gate: ACTUAL PRODUCTION TOPOLOGY

### Project map (established from the canonical secret store)

| Project | Ref | Role in this task |
|---|---|---|
| **Project A** ("saas-hub") | `coyelzlgukvpgguqpjdi` | **the hub-web runtime database — the target of the R15 transition** |
| WSTERA_LAB | `ykxlqnshaaxmzzocpjlj` | **holds `billing_core` and `billing_core_staging`** |
| WSTERA_CONTROL | `plvpbribiomqppfokzir` | Control project; not inspected (outside this authorization) |

### Project A — every schema

`auth` (27 tables) · `extensions` · `graphql` · `graphql_public` · `pgbouncer` · **`public` (3 tables)** ·
`realtime` (3) · `storage` (8) · `vault` (1). Databases on the server: `postgres` only.

### Project A — `public` contents (complete, measured)

Tables: **`products`, `product_assets`, `profiles`** — and nothing else.
Sequences: `products_id_seq`, `product_assets_id_seq`.
Indexes: `products_pkey`, `products_slug_unique`, `product_assets_pkey`, `product_assets_product_storage_unique`, `profiles_pkey`.

| Object the approved privilege matrix requires (`T1-R15-PUBLIC-PRIVILEGE-MATRIX.md` §4.1) | Present in Project A? |
|---|---|
| `public.products` (SELECT, INSERT) | **yes** |
| `public.product_assets` (SELECT, INSERT) | **yes** |
| `public.product_installations` (SELECT, INSERT, UPDATE) | **NO — `to_regclass` returns null** |
| `public.profiles` (excluded by ruling) | present, correctly excluded |

Also absent from Project A: every `fulfillment_*` table (migration `0007`), every control-plane table
(`work_queue_items`, `owner_inbox_items`, `portfolio_gates`, `agent_activity_events` — migration
`0002`), and the drizzle migration journal. Row counts: `products` = 0, `product_assets` = 0,
`profiles` = 1.

### Where `billing_core` / `billing_core_staging` actually live (the Owner's question, answered)

**Both exist — in WSTERA_LAB (`ykxlqnshaaxmzzocpjlj`), not in Project A.** Each has 16 tables:
`audit_events`, `delivery_jobs`, `payments`, `plans`, `processed_events`, `runtime_audit_events`,
`runtime_credential_bindings`, `runtime_entitlement_test_sink`, `runtime_entitlement_transitions`,
`runtime_operations`, `runtime_outbox_jobs`, `runtime_provider_customers`, `runtime_provider_events`,
`runtime_reconciliation_state`, `stripe_customers`, `subscriptions`.

| Schema | Total rows | Business billing data? |
|---|---|---|
| `billing_core` | **0** (every table empty) | `payments` 0, `subscriptions` 0, `plans` 0, `stripe_customers` 0 |
| `billing_core_staging` | **78** | `payments` 0, `subscriptions` 0, `plans` 0, `stripe_customers` 0 — the 78 rows are runtime/audit plumbing only (`runtime_audit_events` 38, `runtime_provider_events` 35, `runtime_credential_bindings` 3, `runtime_operations` 1, `runtime_provider_customers` 1) |

No business billing data exists in either schema. The pre-data condition is therefore **not** violated —
but that is not the deciding factor here.

## Disposition under the Owner ruling's P4/U4 clause

The Owner's decision states, verbatim, for this situation:

> "3. If a required schema is absent and the approved deny matrix therefore produces `3F000` /
> inconclusive rather than a valid DENY proof: → **STOP before D1/D3 and report the exact topology.**
> Do not reinterpret schema absence as DENY PASS."

The R15 deny requirement names `billing_core` and `billing_core_staging` as schemas that `hub_web_app`
must be denied **in Project A**. Both schemas are **absent from Project A**. A probe against
`billing_core.<object>` on Project A yields `3F000` (invalid schema name) — which
`T1-R15-BILLING-DENY-MATRIX.md` §3.4 and finding F1 classify as **INCONCLUSIVE, not DENY**.

**Therefore: STOP before D1/D3, exactly as the Owner directed, with the topology reported above. No
role was created, no grant issued, no deny recorded, no secret set, no credential provisioned, no
deploy performed.**

Recording a DENY here would have required exactly the reinterpretation the Owner forbade. The R15
deny gate as written is unsatisfiable in Project A because its target schemas are not there.

## Second material finding — the privilege matrix cannot be fully granted either

`public.product_installations` does not exist in Project A, yet the approved matrix requires
SELECT + INSERT + UPDATE on it, and D2.2 requires proving the scoped credential serves **every**
required operation. Privileges cannot be meaningfully granted or proven on a non-existent object.

This is an environment/migration gap discovered at D0. The Owner decision authorizes the R15
role/grant/deny transition and states explicitly that **no redesign or expansion is authorized**.
Applying an unapplied product-schema migration is a different action that this authorization does not
cover, so it was **not** performed.

## Third finding — REVENUE IMPACT: the production fulfillment path has no tables

Measured on Project A (the project the live Worker connects to for the direct-Postgres path):

| Table | State |
|---|---|
| `products` | PRESENT |
| `product_assets` | PRESENT |
| `profiles` | PRESENT |
| **`product_installations`** | **ABSENT** |
| **`fulfillment_records`** | **ABSENT** |
| **`fulfillment_recipients`** | **ABSENT** |
| **`fulfillment_deliveries`** | **ABSENT** |
| **`fulfillment_lifecycle_operations`** | **ABSENT** |
| **`fulfillment_audit`** | **ABSENT** |
| `work_queue_items` | ABSENT |
| `owner_inbox_items` | ABSENT |
| `portfolio_gates` | ABSENT |
| `agent_activity_events` | ABSENT |

The runtime credential does hold `SELECT`/`INSERT` on `products` and `USAGE` on `public` — so it is not
a permission problem. The objects simply **do not exist**.

**Why this matters beyond R15.** `fulfillment_*` is the delivery/revocation truth that T3 built and
B3 approved. `product_installations` is what the product-event webhook records an installation into.
Neither exists on the database the deployed Worker actually uses. Migrations `0002` and `0007` exist in
the repository but **no migration in `drizzle/migrations/` creates `products`, `product_assets` or
`profiles` at all** — those three were created outside the migration system, and the rest were never
applied here.

So the live deploy is proven to serve HTTPS, security headers, health and fail-closed rejection — but
the **product/fulfillment write path has no tables to write to** in production. This is a House-side
blocker on the product lanes' ability to fulfil anything, and it is exactly the kind of item the CEO
revenue mandate ranks above polish. It is reported here, not fixed, because applying migrations is
outside the granted R15 authorization.

## What was NOT done, and why

| Step | Status | Reason |
|---|---|---|
| D1.1 create `hub_web_app` | **NOT DONE** | P4/U4 clause 3 — required deny-target schema absent in Project A |
| D1.2 apply `public` grants | **NOT DONE** | same; and `product_installations` is itself absent |
| D1.3 assert billing deny | **NOT DONE** | would be `3F000` = INCONCLUSIVE; reinterpreting it as DENY is forbidden |
| D1.4 freeze `public.profiles` boundary | not needed | no mutation ran; the boundary is unchanged and verified intact |
| D2 credential + pre-switch proof | **NOT DONE** | depends on D1 |
| D3 `DATABASE_URL` switch + deploy | **NOT DONE** | depends on D2; the runtime credential is unchanged |
| D4 evidence closure | this document | — |
| Rollback | **not required** | D0 changed no production runtime state |

## Conclusion

**R15 D0 = COMPLETE. Transition STOPPED before D1 under the Owner's own P4/U4 clause 3.** The exact
topology is reported, including the answer to the Owner's specific question: `billing_core` and
`billing_core_staging` live in **WSTERA_LAB**, not in Project A, and hold no business billing data.

No security gate was weakened, no DENY was recorded without proof, and no credential was invented or
disclosed.

## Why a further Owner decision is required (and is not a re-ask)

The Owner's instruction was: *"Do not ask Owner again for P3/P4/U3/U5 unless actual D0 evidence
contradicts one of the conditions above or exposes a new architecture/security authority gap."*

D0 evidence **does** expose one. The P4/U4 clause was written on the assumption that `billing_core`
lives in Project A and merely might be empty. Measurement shows the deny gate's named schemas **live in
a different project entirely (WSTERA_LAB)**, while the R15 transition targets Project A. That is a new
architecture fact, and it changes what the deny requirement can mean:

**Option 1 — Accept that no Project-A deny is required.** If `billing_core`/`billing_core_staging` are
not in Project A, then `hub_web_app` in Project A cannot reach them regardless of grants, and the deny
requirement as a *Project A* control is vacuous. R15 would then proceed D1→D4 with the billing-deny step
recorded as **N/A WITH EVIDENCE (target schemas absent in the target project)** rather than as a proven
DENY. This requires an explicit Owner ruling, because the Owner forbade exactly this interpretation
being made unilaterally.

**Option 2 — Re-scope the deny to where the schemas actually live.** If the R15 intent is that no
hub-runtime identity may reach billing truth anywhere, then the deny must be asserted against whatever
role actually connects to WSTERA_LAB. Determining that role is outside this authorization and touches a
different project.

**Option 3 — HOLD R15 as recorded.** R15 stays PREPARED / NOT APPLIED, with the topology evidence above
as the reason, and the task parks here.

**Separately — an independent blocker on D2.2.** `public.product_installations` does not exist in
Project A (confirmed: `to_regclass` → null), yet the approved matrix requires SELECT/INSERT/UPDATE on it
and D2.2 must prove every required operation. This is not resolved by any of the options above; it needs
its own disposition, and applying the missing product-schema migration is outside the granted
authorization.

## Current production state (unchanged by this work unit)

Worker `00bdb1b5` live · zone hardened (`always_use_https: on`, `min_tls_version: 1.2`) · runtime
`DATABASE_URL` still the owner credential · `hub_web_app` does not exist · capabilities inert ·
rollback targets available and untouched.

## Evidence files

- `R15-D0-BASELINE-EVIDENCE-2026-09-20.json` — D0.1/D0.2 records
- `R15-D0-TOPOLOGY-EVIDENCE-2026-09-20.json` — Project A schema/database enumeration
- `R15-D0-BASELINE-PROBE.mjs`, `R15-D0-TOPOLOGY-PROBE.mjs` — the read-only probes
- The WSTERA_LAB billing inspection was performed by an ad-hoc read-only query (row counts and
  `to_regclass` only) and its results are transcribed above; the probe was removed from the working
  tree after use so the repository stayed clean.
