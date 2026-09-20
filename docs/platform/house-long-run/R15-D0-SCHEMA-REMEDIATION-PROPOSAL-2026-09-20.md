# R15 D0 — SCHEMA DRIFT REPORT + SHORTEST SAFE REMEDIATION PATH

Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001` · Stage T5
Companion to `R15-D0-PREFLIGHT-OUTCOME-2026-09-20.md`
Recorded: 2026-09-20 · Author: Hermes · Status: **PROPOSAL — NOT AUTHORIZED, NOT EXECUTED**

Purpose: the CEO revenue mandate requires any blocker that can delay revenue to be surfaced with the
shortest safe remediation path. The D0 topology finding is such a blocker. Step 1 of that path — the
read-only drift report — has been **executed**, so this proposal now rests on measured scope rather than
assumption.

---

## 1. Measured drift — `drizzle/schema.ts` vs live Project A

Declared in `schema.ts`: **9 tables, 9 enums**. Measured on Project A (`coyelzlgukvpgguqpjdi`):

### Present (3/9)

| Table | Columns | Rows |
|---|---|---|
| `profiles` | 7 | 1 |
| `products` | 13 | 0 |
| `product_assets` | 10 | 0 |

### ABSENT (6/9)

`product_installations` · `fulfillment_records` · `fulfillment_recipients` · `fulfillment_deliveries` ·
`fulfillment_lifecycle_operations` · `fulfillment_audit`

### Enum types

| Enum | State |
|---|---|
| `user_role`, `product_status`, `asset_type` | present |
| `installation_status`, `installation_source` | **ABSENT** |
| `fulfillment_status`, `fulfillment_artifact_kind`, `fulfillment_delivery_status`, `fulfillment_lifecycle_operation` | **ABSENT** |

### Bookkeeping

No `__drizzle_migrations` journal in either `drizzle` or `public` schema — drizzle has no record of
anything applied to this project.

## 2. The decisive structural finding

**Which migration file would create what:**

| Migration | Creates | Target |
|---|---|---|
| `0001_rbac_roles.sql` | nothing — only `ALTER TYPE user_role` + RLS policies on the **already-existing** `profiles` | hub-web product DB |
| `0002_control_plane_schema.sql` | `work_queue_items`, `owner_inbox_items`, `portfolio_gates`, `agent_activity_events` | **WSTERA LAB & CONTROL (separate project)** — per its own header |
| `0003`, `0004`, `0005`, `0006` | `work_queue_items` changes / RPC / canonical product id | **WSTERA LAB & CONTROL (separate project)** — per their own headers; `0005` and `0006` record themselves as already applied there |
| `0007_shared_one_time_fulfillment.sql` | `fulfillment_records`, `_recipients`, `_deliveries`, `_lifecycle_operations`, `_audit` | hub-web product DB (self-contained, idempotent) |

**No migration anywhere in `drizzle/migrations/` creates `product_installations`, or its enums
`installation_status` / `installation_source`.** Those exist only in `drizzle/schema.ts`. So:

- **`0007`** can supply five of the six missing tables as a single self-contained, idempotent,
  additive migration.
- **`product_installations` and its two enums have no migration at all** — they would need a **new
  migration generated from `schema.ts`**, which is new DDL and therefore needs its own review.
- **`0002`–`0006` must NOT be applied to Project A.** They belong to a different project; applying them
  here would create control-plane objects in the wrong database.

This is why `npm run db:push` is not a safe move: with no journal, drizzle would try to reconcile the
entire schema and would generate DDL for everything, including objects whose proper home is another
project.

## 3. Shortest safe path (proposed)

### Step 0 — authorization
Outside the granted R15 authorization (which permits no expansion). Needs its own Owner decision.
Nothing below runs without it.

### Step 1 — read-only drift report — **DONE**
Results in §1–§2 above. Cost: zero mutation, zero external-agent spend.

### Step 2 — generate the missing product-schema migration (reviewable DDL only)
Create a single additive migration (`0008`) from `schema.ts` that creates `product_installations` plus
`installation_status` and `installation_source`. Additive `CREATE TYPE` / `CREATE TABLE IF NOT EXISTS`
only. **Review this file before applying** — it is new DDL, unlike `0007` which already exists in the repo.

### Step 3 — dry-run each migration inside a rolled-back transaction
```
BEGIN;
  <0007 contents>
  <0008 contents>
  -- assert the 6 tables + 5 enums now exist with the expected columns
ROLLBACK;                     -- prove it applies cleanly, then discard
```
Mirrors the Owner's D2.2 test-authority rule (bounded transaction, nothing persistent). Each file is
applied separately so a failure is attributable.

### Step 4 — apply for real, then verify and re-run D0
Apply `0007` then `0008`, verify object + column presence, then **re-run the D0 topology probe**.
Only then can R15 D1 resume: the privilege matrix requires `product_installations` to exist before
privileges on it can be granted or proven.

### Step 5 — record
Commit the new migration, the applied-order record, and the post-apply drift report showing 9/9 tables
and 9/9 enums.

## 4. What this path must NOT do

- **Not** `db:push` / `drizzle-kit generate` against Project A — unbounded reconciliation against an
  untracked schema, and it would try to generate DDL for objects that belong to WSTERA LAB/CONTROL.
- **Not** apply `0002`–`0006` to Project A — they target a different project.
- **Not** hand-write DDL that diverges from `schema.ts`.
- **Not** create `billing_core` / `billing_core_staging` in Project A — they live in WSTERA_LAB.
- **Not** touch `public.profiles` RLS, the OPTION 3 ruling, or anything in the not-authorized list.
- **Not** run under the R15 authorization.

## 5. Relationship to the two open decisions

| Open decision | Relationship |
|---|---|
| Billing-deny re-scope (Project A vacuous / re-scope to WSTERA_LAB / hold R15) | **Independent.** The schema gap blocks product fulfilment however the deny question is answered. |
| Product/fulfillment schema gap (this document) | **The revenue-critical one.** It blocks product lanes from fulfilling, and it blocks R15 D2.2 from proving every required operation. |

If only one decision can be made now, **this one carries the revenue impact**; the deny-scope question
only governs whether the R15 least-privilege transition can close.

## 6. Cost and risk

| | |
|---|---|
| Mutating steps | 1 (step 4), each migration separately, dry-run verified first |
| Read-only steps | 3 (step 1 done, step 2 generates a file only, step 4's verification) |
| External-agent cost | **zero** — deterministic operator work |
| Residual risk | `0007` is idempotent and self-contained; `0008` is new but purely additive; no existing object is altered or dropped |
| Risk of the `db:push` alternative | **high and unbounded** — not proposed |
