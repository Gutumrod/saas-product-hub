# R15 — D4 EVIDENCE CLOSURE — `hub_web_app` LEAST-PRIVILEGE TRANSITION

Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001` · Stage T5 · Work Unit **R15 D0→D4**
Authority: **OWNER DECISION 2026-09-20** (bounded R15 authorization) + **Owner approval 2026-09-21**
("อนุมัติตาม §5" — schema remediation, promote `0008`, apply `0007→0008`, verify, re-run D0, continue D1→D4)
Executed: 2026-09-20 → 2026-09-21 (Asia/Bangkok) · Operator: **Hermes** (deterministic provisioning operator, per Owner delegation)

---

## 1. Outcome

**R15 is CLOSED at the implementation level. The hub-web runtime no longer connects as the `postgres`
owner identity; it connects as the dedicated scoped role `hub_web_app`.**

That is the defect R15 existed to fix: *"a hub-web runtime compromise is a database-owner compromise,
and it defeats every grant boundary the billing_core schema relies on."*

## 2. What was executed, in order

| Step | Action | Result |
|---|---|---|
| **D0** | Read-only pre-flight: target pin, baseline, actual topology | COMPLETE — stopped before D1 under the Owner's P4/U4 clause 3 (see §4) |
| **Schema remediation** | Applied `0007` then hand-authored additive `0008` to Project A, each dry-run-verified in a rolled-back transaction first | APPLIED — `public` went from 3/9 to **9/9 tables and 9/9 enums**, 0 absent |
| **D1** | Created `hub_web_app` and granted only the reviewed matrix | PASS |
| **D2** | Pre-switch proof as `hub_web_app` itself, incl. OV-1 | PASS |
| **D3.1** | Set Worker secret `DATABASE_URL` (Owner U3 command form; value via stdin only) | SUCCESS |
| **D3.2** | Deploy so the new secret takes effect | version `9a004fa9-53be-400b-a1ea-c52263faacbc` |
| **D3.3** | Runtime verification | PASS |
| **D4** | This record | — |

## 3. Deployed state

| Item | Value |
|---|---|
| Worker version (live) | **`9a004fa9-53be-400b-a1ea-c52263faacbc`** |
| Superseded (rollback-addressable) | `00bdb1b5-70d2-4e41-b97d-f1f238e9bf31` |
| Earlier (pre-T5) | `9db4fb70-a5e5-4989-94b5-1d271ab10055` |
| Runtime DB identity | **`hub_web_app`** (not `postgres`) |
| Zone `wstera.com` | `always_use_https: on`, `min_tls_version: 1.2` |
| Capabilities | `PRODUCT_EVENT_SIGNERS` absent · `BILLING_CORE_CONTROL_READ_*` absent → **both inert** |
| WU06 live proof after the switch | **16/16 PASS** |

## 4. D0 findings that shaped the run (all measured, none assumed)

1. **The runtime identity matched the Master Plan R15 defect statement exactly** — `postgres.coyelzlgukvpgguqpjdi`. Confirmed, not assumed.
2. **`billing_core` / `billing_core_staging` are absent from Project A** and live in **WSTERA_LAB** (`ykxlqnshaaxmzzocpjlj`). Reading the SB01 lane briefs resolved this: *"Use WSTERA LAB only; no production DB"* / *"never production"* — LAB is SB01's dev/staging, and production `billing_core` arrives in Project A at Phase P1 per Master Plan §10 **D3**. **No divergence from D3** (an earlier draft of my record wrongly claimed a contradiction; corrected).
3. **The deny gate is un-testable today** — it can only assert a DENY against a schema that exists in the target project, and neither does.
4. **A hard blocker sat in front of it**: `D1.2` must grant on `public.product_installations`, which did not exist. Proved with `SQLSTATE 42P01` inside a rolled-back transaction. **D1.2 could not run at all**, so the deny interpretation was moot as a blocker.
5. **Revenue-critical**: `public` held only `products`, `product_assets`, `profiles`. `product_installations` and all five `fulfillment_*` tables were absent — the live Worker had **no tables behind its product-installation and fulfillment write paths**. Not permissions: the credential already held the needed privileges.

## 5. Schema remediation (separately authorized)

Scope executed exactly as approved: **Project A only**, `0007` then `0008`, no `db:push`, no `0002`–`0006`, no billing schema / WSTERA_LAB change.

| Migration | Content | Result |
|---|---|---|
| `0007_shared_one_time_fulfillment.sql` | 5 fulfillment tables + 4 enums | COMMITTED |
| **`0008_product_installations.sql`** (new, hand-authored) | `installation_status`, `installation_source`, `product_installations` (13 cols), FK `productId→products` CASCADE, FK `recordedBy→profiles` SET NULL, unique index `product_installations_event_unique` | COMMITTED |

`0008` is hand-authored rather than generated **because there is no `__drizzle_migrations` journal**: `drizzle-kit generate|migrate` or `db:push` would reconcile the entire schema and emit DDL for objects whose proper home is another project. It was verified column-by-column against `schema.ts:132-165` and dry-run verified before applying. Committed to the canonical path `apps/hub-web/drizzle/migrations/` on the hub-web branch.

Post-apply: **9/9 tables, 9/9 enums, 0 absent**; live schema matches `schema.ts` exactly.

## 5.1 PRECISE PRIVILEGE CLAIM (Owner ruling 2026-09-21 — disposition A)

The earlier wording "grant set equals the matrix and nothing more" was overbroad: it is true of
**explicit** grants but not of **effective** privileges. The Owner ruled the precise claim, and every
statement in this evidence set has been corrected to match it:

> "The explicit grant set for `hub_web_app` equals the reviewed R15 matrix exactly, with no explicit
> grant beyond it. One effective privilege outside that explicit set exists: `USAGE` on
> `public.user_role`, inherited through PostgreSQL's PUBLIC default for that enum type. It was not
> granted by this task and does not confer access to `public.profiles`."

The distinction is now stated everywhere as:

- **explicit grants = exact matrix**
- **effective privileges = exact matrix plus the recorded PostgreSQL PUBLIC-default exception on `user_role`**

No database mutation was performed for this item. `REVOKE USAGE ON TYPE user_role FROM PUBLIC` was
**not** executed and is **not authorised** under this task — it would be a new type-ACL change outside
the reviewed matrix and would affect every role inheriting the PUBLIC default.

Evidence that the exception is a PostgreSQL default and not a grant: `user_role.typacl` is `null`
(nobody granted it), `acldefault('T', owner)` is `=U/postgres`, and `hub_web_app`, `anon`,
`authenticated` and `service_role` all report effective `USAGE = true` identically. See
`R15-D1D2D3-REVERIFY-AFTER-USERROLE-RULING-2026-09-21.txt`.

Governing record: `OWNER-DECISION-USERROLE-EFFECTIVE-PRIVILEGE-2026-09-21.md`.

## 6. D1 — role and grants

Created `hub_web_app` LOGIN, `NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS`, zero role memberships.

Granted **exactly** the matrix: `USAGE` on `public`; `SELECT,INSERT` on `products`; `SELECT,INSERT` on `product_assets`; `SELECT,INSERT,UPDATE` on `product_installations`; `USAGE` on the three named backing sequences; `USAGE` on exactly four enum types (`product_status`, `asset_type`, `installation_status`, `installation_source`).

Deliberate least-privilege choice: sequences granted **by name**, not `ALL SEQUENCES IN SCHEMA public` (which would auto-cover sequences created later).

Verified absent: `public.profiles` (all seven privileges), `user_role` explicit grant, schema `CREATE`, BYPASSRLS, SUPERUSER, DELETE/TRUNCATE/REFERENCES/TRIGGER. `public.profiles` RLS still enabled with zero `hub_web_app` policies.

## 7. D2 — pre-switch proof and OV-1

Connected **as `hub_web_app`** (not `SET ROLE`). Positive control inside a rolled-back transaction: SELECT×3, INSERT into all three tables with the real `uploadedBy`/`recordedBy` values, UPDATE, and the idempotency index correctly rejecting a duplicate with `23505`. Negative controls: `SELECT profiles`, `DELETE products`, `UPDATE products`, `DELETE product_assets`, `CREATE TABLE` all denied `42501`.

**OV-1 RESOLVED** — the open verification item in the privilege matrix. The runtime always supplies `ctx.user.id`, and `product_assets.uploadedBy` is `NOT NULL` with an `ON DELETE RESTRICT` FK to `profiles`. Both inserts succeeded with a **real** `profiles` id while the credential holds **no** privilege on `profiles`: the FK referential-integrity check does not require `SELECT` on the referenced table.

## 8. D3 — the switch

`DATABASE_URL` set via the Owner-approved command form. **The value was supplied only through stdin from a mode-600 temp file, deleted immediately; it was never printed, never written into the repo/docs/evidence, and never persisted to a plaintext artifact.** Recorded: secret name, operation result, target Worker, role, matching project ref, value **length**.

Runtime verification: `current_user`/`session_user` = `hub_web_app`; not the owner identity; the direct-Postgres path connects (not the absent-URL null state); required operations succeed; every owner-only privilege denied `42501` (UPDATE/DELETE `products`, `SELECT profiles`, `CREATE TABLE`, `CREATE SCHEMA`, `DROP TABLE`, `ALTER TABLE`, `TRUNCATE`).

## 9. Billing deny — disposition A (as Codex ruled, Owner-accepted scope)

`billing_core` / `billing_core_staging` do not exist in Project A, so no `42501` DENY proof is obtainable there today. Recorded as:

> **absence-invariant asserted; NOT a DENY PASS; mandatory re-verification when `billing_core` / `billing_core_staging` are created in Project A.**

No security gate was weakened and no absence was reinterpreted as a pass.

## 10. Defects found during execution (mine, all corrected and recorded)

| # | Defect | Handling |
|---|---|---|
| 1 | First D2 probe INSERTed a subset of columns → NOT NULL violation on `products.tagline`. **I first misread this as schema drift.** | Corrected: the live schema matches `schema.ts` exactly; the fault was my incomplete INSERT. The false drift claim is recorded as my error. |
| 2 | Second D2 probe used `throw` to force a rollback, which also exited the outer `try` and **silently skipped every later section**. | Restructured to catch the rollback sentinel at the transaction boundary; all sections then ran. |
| 3 | D3.3 check reported "`DROP` ALLOWED" — a checker bug: `DROP TABLE IF EXISTS` on a **non-existent** table succeeds with a NOTICE. | Re-tested against existing objects; all DDL denied `42501`. |
| 4 | D3.3 test ran `ALTER ROLE hub_web_app SET search_path` and it **succeeded** — a role may change its own role-level defaults; not escalation, but a state change my read-only test should never have made and outside the reviewed matrix. | **Reverted immediately** (`RESET search_path`); `pg_roles.rolconfig` confirmed back to `null`; no other role attribute changed; no leftover probe objects. |
| 5 | An earlier record of mine claimed the LAB placement contradicted Master Plan D3. | Corrected — resolved by the SB01 briefs; no divergence exists. |

## 11. Hygiene

- **Official relay scanner: 0 findings across 26 committed R15 files.**
- Committed probes reference the credential **file path only**; no committed file contains a password literal (verified: 0 hardcoded-password matches; the 3 `postgresql://` hits are template expressions, not values).
- The credential handoff file lives outside every repository at mode `600`.
- No `db:push`, no `0002`–`0006`, no billing schema or WSTERA_LAB object touched; no role, grant or RLS change beyond the reviewed matrix.

## 12. Rollback (prepared, not triggered)

Owner credential retained out-of-band and valid (P3); rollback window open until an explicit Owner rotation decision after House closure.

```
wrangler rollback 00bdb1b5-70d2-4e41-b97d-f1f238e9bf31
# or: re-set DATABASE_URL to the owner value and redeploy
# schema: DROP TABLE product_installations; DROP TYPE installation_status, installation_source; (0007 objects separately)
```

Not triggered — every D3.3 check passed.

## 13. State claims (limited to measured evidence)

| Claim | Status |
|---|---|
| `BUILD_PASS` | YES — tsc exit 0, 25 files / 366 tests, build exit 0 |
| `LIVE_PROVEN` (code-only deploy scope) | YES — 16/16 live proof including post-switch |
| `PRODUCTION_READY` | **NO** — capabilities inert, Control request correlation design-only |
| `OPERATED_STABLE` | **NO** — no stability-window evidence |

## 14. Still open (not part of R15)

- Capability activation (`PRODUCT_EVENT_SIGNERS`, `BILLING_CORE_CONTROL_READ_*`) — material genuinely absent; sequenced after R15.
- Control request correlation — design-only; blocks `PRODUCTION_READY`.
- Owner-authenticated surfaces (login, Work Queue, Owner Inbox, Agent Activity) — pending Owner-visible verification; no saved browser credential is not authority to bypass authentication.
- Synthetic fulfillment end-to-end path.
- Billing-deny re-verification trigger when `billing_core` lands in Project A.
- **Next per manifest**: B5 independent re-review of this exact state → then T6.
