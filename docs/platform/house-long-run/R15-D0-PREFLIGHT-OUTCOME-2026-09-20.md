# R15 — D0 PRE-FLIGHT OUTCOME — PROJECT A TOPOLOGY

Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001` · Stage T5 · Work Unit **R15 D0**
Authority: **OWNER DECISION 2026-09-20 — AUTHORIZE R15 D0→D4** (bounded to `T1-R15-DEPLOY-ROLLBACK-PLAN.md`)
Executed: 2026-09-20 (Asia/Bangkok) · Operator: Hermes (deterministic provisioning operator, per Owner delegation)
Method: **READ-ONLY SELECT statements only.** No CREATE / ALTER / GRANT / REVOKE / INSERT / UPDATE / DELETE ran.

---

## D0.1 — Transition target (pinned)

| Item | Value |
|---|---|
| Credential role form | `postgres.<ref>` — matches the R15 defect identity `postgres.coyelzlgukvpgguqpjdi` **exactly** |
| Server | PostgreSQL 17.6 · database `postgres` |
| Target Worker | `hub-web` (`wstera.com`, `platform.wstera.com`) |
| Superseded version (rollback target) | `9db4fb70-a5e5-4989-94b5-1d271ab10055` |
| Current live version | `00bdb1b5-70d2-4e41-b97d-f1f238e9bf31` |

The R15 defect statement in the Master Plan names the owner pooler `postgres.coyelzlgukvpgguqpjdi` as
the runtime identity — **confirmed by measurement**, not assumed.

## D0.2 — Baseline captured (the rollback reference)

| Baseline item | Observed |
|---|---|
| `current_user` / `session_user` | **`postgres`** (the owner identity — this is the R15 defect) |
| `hub_web_app` role | **does not exist** (zero rows in `pg_roles`) — expected at baseline |
| Objects owned by `hub_web_app` | 0 |
| `public.profiles` RLS | `relrowsecurity = true`, `relforcerowsecurity = false` |
| `public.profiles` policies | `profiles_self_read` → `authenticated`; `profiles_internal_read` → `authenticated`; `profiles_service_write` → `service_role` — **no `hub_web_app` policy**, matching the Owner OPTION 3 ruling |

## D0.4 — P4/U4 pre-data gate: ACTUAL PRODUCTION TOPOLOGY

### Schemas present in Project A

| Schema | Owner | Tables |
|---|---|---|
| `auth` | `supabase_admin` | 27 |
| `extensions` | `postgres` | 0 |
| `graphql`, `graphql_public` | `supabase_admin` | 0 |
| `pgbouncer` | `pgbouncer` | 0 |
| **`public`** | `pg_database_owner` | **3** |
| `realtime` | `supabase_admin` | 3 |
| `storage` | `supabase_admin` | 8 |
| `vault` | `supabase_admin` | 1 |

Databases on the server: `postgres` only.

### The decisive finding

| Required object | Present in Project A? |
|---|---|
| `billing_core` schema | **NO — absent** (no schema of that name; no schema matching `billing\|core\|payment\|stripe\|entitle`) |
| `billing_core_staging` schema | **NO — absent** |
| Tables matching billing/entitlement/subscription/invoice/payment names anywhere | **none** (only `pg_catalog.pg_subscription*` and `realtime.subscription`, which are unrelated system tables) |
| `public.products` | present |
| `public.product_assets` | present |
| `public.profiles` | present |
| **`public.product_installations`** | **NO — absent** |
| Any `fulfillment_*` table | **NO — absent** |
| Any control-plane table (`work_queue_items`, `owner_inbox_items`, `portfolio_gates`, `agent_activity_events`) | **NO — absent** |

`public` contains exactly three tables: `products`, `product_assets`, `profiles`.

The three other projects named in the canonical secret store are `WSTERA_CONTROL`
(`plvpbribiomq…`) and `WSTERA_LAB` (`ykxlqnshaaxm…`) — **neither is Project A**, and neither was
inspected under this authorization.

## Disposition under the Owner ruling's P4/U4 clause

The Owner's decision states, for this exact situation:

> "3. If a required schema is absent and the approved deny matrix therefore produces `3F000` /
> inconclusive rather than a valid DENY proof: → **STOP before D1/D3 and report the exact topology.**
> Do not reinterpret schema absence as DENY PASS."

**The condition is met.** A required schema — both `billing_core` and `billing_core_staging` — is
absent from Project A.

**Therefore: STOP before D1/D3. Reported as the Owner directed. No role was created, no grant issued,
no credential provisioned, no secret set, no deploy performed.**

The D1.3 deny assertion (`T1-R15-BILLING-DENY-MATRIX.md`) cannot produce a valid DENY proof here: with
no schema of that name, a probe against `billing_core.<object>` yields `3F000` (invalid schema name),
which the deny matrix itself classifies as **INCONCLUSIVE, not DENY** (§3.4, F1). Recording it as a
DENY would be exactly the reinterpretation the Owner forbade.

## Second, independently material finding (not part of the P4/U4 clause — reported for completeness)

Three of the four objects the approved privilege matrix requires **do not exist in Project A at all**:

| Matrix requirement (`T1-R15-PUBLIC-PRIVILEGE-MATRIX.md` §4.1) | Present? |
|---|---|
| `public.products` SELECT, INSERT | yes |
| `public.product_assets` SELECT, INSERT | yes |
| `public.product_installations` SELECT, INSERT, UPDATE | **absent** |
| `public.profiles` — excluded | present (correctly excluded) |

`product_installations` is defined in `drizzle/schema.ts:132-165` and is used by the runtime
(`routers.ts`, `webhooks/productEvents.ts`), but it is **not on the production server**. The
`public`-schema migration that would create it has not been applied there. The fulfillment tables
from migration `0007_shared_one_time_fulfillment.sql` are likewise absent.

This means the R15 transition cannot be completed to a verified end state in Project A as it stands:
`D2.2` requires proving the scoped credential serves **every** required operation including
`product_installations` INSERT/UPDATE, and that object does not exist. Granting privileges on a
non-existent object would either fail or produce a grant that proves nothing.

This is a genuine environment/migration gap discovered at D0 and is **not** something the R15
authorization covers — the Owner decision authorizes the R15 role/grant/deny transition, and
explicitly states no redesign or expansion. Applying an unapplied product-schema migration is a
different, un-authorized action.

## What was NOT done (and why)

| Step | Status | Reason |
|---|---|---|
| D1.1 create `hub_web_app` | **NOT DONE** | P4/U4 clause: required schema absent → STOP before D1 |
| D1.2 apply `public` grants | **NOT DONE** | same; and one required object is itself absent |
| D1.3 assert billing deny | **NOT DONE** | would be `3F000` = INCONCLUSIVE; reinterpreting it as DENY is forbidden |
| D1.4 freeze `public.profiles` boundary | not needed | no mutation occurred; the boundary is unchanged and verified intact |
| D2 credential + pre-switch proof | **NOT DONE** | depends on D1 |
| D3 `DATABASE_URL` switch + deploy | **NOT DONE** | depends on D2; the runtime credential is unchanged |
| D4 evidence closure | in progress | this document |
| Rollback | **not required** | no production runtime state was changed by D0 |

## Current production state (unchanged by this work unit)

Worker `00bdb1b5` live · zone hardened (`always_use_https: on`, `min_tls_version: 1.2`) · runtime
`DATABASE_URL` still the owner credential · `hub_web_app` does not exist · capabilities inert.
Rollback targets remain available and untouched.

## Evidence files

- `d0-baseline.json` — every D0.1/D0.2/D0.4 record captured by the read-only probe
- `d0-topology.json` — full schema/database enumeration
- probes: `d0_baseline.mjs`, `d0_topology.mjs` (SELECT-only; no credential value printed)

## Conclusion

**R15 D0 = COMPLETE. Transition STOPPED before D1 under the Owner's own P4/U4 disposition clause.**
Owner decision required on the environment/migration gap named above. No security gate was weakened,
no DENY recorded without proof, and no credential was invented or disclosed.
