# T1-R15 BILLING DENY MATRIX — `hub_web_app` vs `billing_core` / `billing_core_staging`

Task ID: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001`
Stage: T1 (R15 least-privilege preparation)
Work unit: `T1-WU04-BILLING-DENY-MATRIX`
Correlation id: `house-t1-wu04-20260920`
Role class: `evidence_preparation`
Record type: **EVIDENCE PREPARATION ARTIFACT — NOT A GRANT, NOT A REVOKE, NOT AN APPROVAL**
Recorded: 2026-09-20 (Asia/Bangkok)

Citations source: `docs/platform/house-long-run/T1-CITATION-PACK.md` (sections **E, H, J** only),
pack verified at revision `61dcdfcc07f8ae5edd493fcde61568e2ef0ca51d`.
Governing ruling: `docs/platform/house-long-run/T1-RLS-DECISION-RECORD-2026-09-20.md`
(Owner decision OPTION 3, binding).
Sibling lane (positive-control targets): `docs/platform/house-long-run/T1-R15-PUBLIC-PRIVILEGE-MATRIX.md`
(work unit `T1-WU03-PUBLIC-PRIVILEGE-MATRIX`).

> **Lane rule applied:** every citation pack reference below is **copied** from
> `T1-CITATION-PACK.md` sections E, H, J. Nothing here was re-derived, re-verified, or re-read
> from source by this lane. No citation was introduced from any citation-pack section other than
> E, H, J.

---

## 1. Purpose and boundary

This document states (a) the **explicit DENY requirement** for `hub_web_app` against the
`billing_core` and `billing_core_staging` schemas, and (b) the **verification approach and command
forms** by which that deny would later be proven or falsified.

`hub_web_app` is the dedicated Project A **direct-Postgres** login role required by R15 in place of
the current `postgres` owner connection.

This document is a **declaration of a required denial and of a verification plan, not an
execution**:

- No role was created, altered, or dropped.
- No `GRANT` or `REVOKE` was issued, and none is authorized by this work unit.
- No database connection was opened, no SQL statement was run, no query result was observed.
- No secret was read, printed, or required (see §8).
- One documentation file was written, inside `docs/platform/house-long-run/` only.

## 2. Authority for the DENY requirement

| Authority statement | Source |
|---|---|
| R15 required control: "dedicated `hub_web_app` **login role** scoped to exactly the `public` objects used — no ownership, no `CREATE`, no escalating membership"; and "denial tests prove `hub_web_app` cannot use `billing_core`/`billing_core_staging`" | citation pack §J — `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md:896` |
| R15 also records: "**Pre-data gate:** must be closed before any billing data exists in Project A. Standing hub-web security fix regardless of billing-core timing." | citation pack §J — `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md:896` |
| R15 states the defect it closes: hub-web's application runtime connects to Project A as the `postgres` **owner** identity (`DATABASE_URL` = `postgres.coyelzlgukvpgguqpjdi` pooler), which "defeats every grant boundary the `billing_core` schema relies on" | citation pack §J — `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md:896` |
| R15 least-privilege intent: "explicit deny on `billing_core`" and "explicit deny on `billing_core_staging`"; also "no `BYPASSRLS`", "no ownership", "no `CREATE`", "no escalating role membership", "owner `DATABASE_URL` removed from application runtime" | governing ruling §1 (`T1-RLS-DECISION-RECORD-2026-09-20.md`) |
| "`billing_core` and `billing_core_staging` must be explicitly denied." | governing ruling §3 |
| Owner boundary: `hub_web_app` is the scoped direct-Postgres application role **only** (`public.profiles` excluded; `public` scope carried by the sibling lane) | governing ruling §1, §3 |

Both schema names in scope — `billing_core` and `billing_core_staging` — are named by the governing
ruling and by the R15 text carried in pack §J. No schema name in this document is inferred.

## 3. DENY REQUIREMENT — `billing_core`

**Required state (must hold for `hub_web_app`, in Project A):**

```
billing_core
  schema  USAGE            -> NOT GRANTED (DENY)
  every object in schema   -> NO privilege of any kind (SELECT, INSERT, UPDATE, DELETE,
                              TRUNCATE, REFERENCES, TRIGGER, MAINTAIN)
  every sequence in schema -> NO privilege of any kind (USAGE, SELECT, UPDATE)
  every routine in schema  -> NO EXECUTE
  ownership of the schema or of any object in it -> NOT HELD
```

Effective-deny conditions that must also hold, because a DENY stated only against `hub_web_app`
would be vacuous if the privilege arrives by another route:

- no role membership of `hub_web_app` grants, inherits, or sets a role that holds `billing_core`
  privileges (no escalating membership — governing ruling §1);
- `hub_web_app` has no `BYPASSRLS` and no `SUPERUSER` (governing ruling §1: "no `BYPASSRLS`");
- no `PUBLIC` grant, no `ALTER DEFAULT PRIVILEGES` and no `GRANT ... TO PUBLIC` confers
  `billing_core` access to `hub_web_app`;
- the runtime credential presented by `hub_web_app` does not resolve to a different, more
  privileged identity (pooler role/session identity must be the scoped role, per the R15 defect
  text in pack §J).

### 3.1 Verification command form — catalog introspection (authoritative for grant state)

Run in Project A as an **auditing role that is not `hub_web_app`** (no membership in it):

```sql
-- 3.1a exact schema-privilege assertion (expect: f, f for hub_web_app)
SELECT r.rolname,
       has_schema_privilege(r.rolname, 'billing_core', 'USAGE') AS core_usage,
       has_schema_privilege(r.rolname, 'billing_core', 'CREATE') AS core_create
FROM pg_roles r
WHERE r.rolname = 'hub_web_app';

-- 3.1b enumerated object privileges inside the schema (expect: ZERO ROWS)
SELECT c.relkind, n.nspname, c.relname, a.privilege_type
FROM pg_namespace n
JOIN pg_class c ON c.relnamespace = n.oid
CROSS JOIN LATERAL aclexplode(COALESCE(c.relacl, acldefault('r', c.relowner))) a
JOIN pg_roles g ON g.oid = a.grantee
WHERE n.nspname = 'billing_core'
  AND g.rolname = 'hub_web_app';

-- 3.1c schema-level ACL entries naming hub_web_app (expect: ZERO ROWS)
SELECT n.nspname, g.rolname, a.privilege_type
FROM pg_namespace n
CROSS JOIN LATERAL aclexplode(COALESCE(n.nspacl, acldefault('n', n.nspowner))) a
JOIN pg_roles g ON g.oid = a.grantee
WHERE n.nspname = 'billing_core'
  AND g.rolname = 'hub_web_app';

-- 3.1d PUBLIC / default-ACL leak scan for the schema (expect: ZERO ROWS)
SELECT n.nspname, a.grantee AS grantee_oid, a.privilege_type
FROM pg_namespace n
CROSS JOIN LATERAL aclexplode(COALESCE(n.nspacl, acldefault('n', n.nspowner))) a
WHERE n.nspname = 'billing_core'
  AND a.grantee = 0;   -- 0 = PUBLIC

-- 3.1e privilege arriving by membership (expect: ZERO ROWS)
SELECT m.roleid::regrole AS inherits_via
FROM pg_auth_members m
JOIN pg_roles g ON g.oid = m.member
WHERE g.rolname = 'hub_web_app';

-- 3.1f identity-escape check (expect: rolbypassrls = f, rolsuper = f, rolcreatedb = f, rolcreaterole = f)
SELECT rolname, rolsuper, rolcreatedb, rolcreaterole, rolbypassrls, rolinherit
FROM pg_roles
WHERE rolname = 'hub_web_app';

-- 3.1g routine privilege in schema (expect: ZERO ROWS)
SELECT n.nspname, p.proname, a.privilege_type
FROM pg_namespace n
JOIN pg_proc p ON p.pronamespace = n.oid
CROSS JOIN LATERAL aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner))) a
JOIN pg_roles g ON g.oid = a.grantee
WHERE n.nspname = 'billing_core'
  AND g.rolname = 'hub_web_app';
```

### 3.2 Verification command form — runtime negative test (authoritative for effective capability)

Run using **the `hub_web_app` credential itself** (not `SET ROLE` from a more privileged session,
which would not prove the runtime identity):

```sql
-- 3.2a schema reachability (expect: SQLSTATE 42501, "permission denied for schema billing_core")
SELECT 1 FROM billing_core.<any_object> LIMIT 1;

-- 3.2b explicit search_path attempt (expect: SQLSTATE 42501)
SET search_path TO billing_core, public;

-- 3.2c DDL attempt if any object name were guessable (expect: SQLSTATE 42501)
--     (listed for completeness; §E records no DDL in the runtime, so this only probes the boundary)
CREATE TABLE billing_core.<probe> (id int);

-- 3.2d information_schema enumeration (expect: no billing_core rows visible from this identity)
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema = 'billing_core';
```

`<any_object>` / `<probe>` are placeholders deliberately left unresolved: this lane did not read
the billing-core schema definition and must not invent object names. The verification run must
substitute a real object name enumerated by the auditing role (form 3.1b/3.1c) — a test that
asserts privilege denial on an invented object name proves nothing.

### 3.3 Positive control (required — a negative test alone is not evidence)

Each negative form in §3.2 must be run **paired with a positive control from the same session, in
the same run**, against an object `hub_web_app` **is** required to hold. If the positive control
does not succeed, the negative result is inconclusive (connection, credential, pooler, or network
failure would otherwise masquerade as a confirmed deny).

- Positive-control target: any object listed as required-and-granted for `hub_web_app` in
  `docs/platform/house-long-run/T1-R15-PUBLIC-PRIVILEGE-MATRIX.md` §4.1 (that artifact carries the
  granted `public` scope; this lane does not re-derive it).
- Expectation: positive control returns rows / succeeds; `billing_core` probe returns SQLSTATE
  42501.

### 3.4 Result interpretation (mandatory — the distinction is binding for the evidence record)

| Observed result | SQLSTATE | Meaning | Required disposition |
|---|---|---|---|
| `permission denied for schema billing_core` | `42501` | privilege absent for this identity | **DENY CONFIRMED** |
| `permission denied for table/relation ...` | `42501` | schema usable but object privilege absent | **DENY CONFIRMED at object level; FINDING** — schema-level `USAGE` is present and must be recorded, not silently passed |
| `schema "billing_core" does not exist` | `3F000` | schema absent in this project/identity view | **INCONCLUSIVE — HOLD.** Absence is not denial; §7 records this as an unverified precondition |
| `relation ... does not exist` | `42P01` | object absent | **INCONCLUSIVE — HOLD** (same reason) |
| `role "hub_web_app" does not exist` | `42704` | precondition unmet | **BLOCKED** — the R15 role does not exist yet; no deny can be asserted |
| positive control fails | any | test rig invalid | **INCONCLUSIVE — HOLD**, rerun |

A DENY may be recorded as verified **only** when: the positive control succeeded, the catalog forms
(§3.1) returned their expected values, **and** the runtime form (§3.2) returned `42501` for a real,
enumerated `billing_core` object.

## 4. DENY REQUIREMENT — `billing_core_staging`

The requirement is identical in shape and is a **separate assertion**: passing the `billing_core`
checks does **not** attest `billing_core_staging`, and vice versa.

**Required state (must hold for `hub_web_app`, in Project A):**

```
billing_core_staging
  schema  USAGE            -> NOT GRANTED (DENY)
  every object in schema   -> NO privilege of any kind
  every sequence in schema -> NO privilege of any kind
  every routine in schema  -> NO EXECUTE
  ownership of the schema or of any object in it -> NOT HELD
```

plus the same four effective-deny conditions listed in §3 (no escalating membership, no
`BYPASSRLS`/`SUPERUSER`, no `PUBLIC` or default-privilege route, runtime credential resolves to the
scoped role).

### 4.1 Verification command form — catalog introspection

Repeat §3.1a–§3.1g with `'billing_core_staging'` substituted for `'billing_core'` in every
predicate, e.g.:

```sql
SELECT r.rolname,
       has_schema_privilege(r.rolname, 'billing_core_staging', 'USAGE') AS staging_usage,
       has_schema_privilege(r.rolname, 'billing_core_staging', 'CREATE') AS staging_create
FROM pg_roles r
WHERE r.rolname = 'hub_web_app';
-- expect: staging_usage = f, staging_create = f
```

```sql
-- enumerated object privileges (expect: ZERO ROWS)
SELECT c.relkind, n.nspname, c.relname, a.privilege_type
FROM pg_namespace n
JOIN pg_class c ON c.relnamespace = n.oid
CROSS JOIN LATERAL aclexplode(COALESCE(c.relacl, acldefault('r', c.relowner))) a
JOIN pg_roles g ON g.oid = a.grantee
WHERE n.nspname = 'billing_core_staging'
  AND g.rolname = 'hub_web_app';
```

### 4.2 Verification command form — runtime negative test

```sql
-- expect: SQLSTATE 42501, "permission denied for schema billing_core_staging"
SELECT 1 FROM billing_core_staging.<any_object> LIMIT 1;
```

Subject to the same positive-control rule (§3.3) and the same result interpretation (§3.4). As in
§3.2, `<any_object>` must be substituted from an object actually enumerated for this schema.

## 5. Where the DENY must be enforced (pack §H basis)

Pack §H carries the **migration inventory (DDL scope)** for this repository and records that
**none of the six migrations reference `billing_core`** (§H, final inventory bullet). Consequences
recorded by this lane:

| Consequence | Basis |
|---|---|
| The `billing_core` / `billing_core_staging` deny **cannot be produced by the existing hub-web migration set** — there is no existing grant in it to reverse, and no existing DDL there that references those schemas | pack §H — "None of the six reference `billing_core`"; inventory lists `0001`–`0006` only |
| Because nothing in the migration set creates or grants `billing_core` access, the deny is an **absence-invariant** to be asserted by whatever authority provisions `hub_web_app` (the R15 role provisioning), not a migration reversal | pack §H; governing ruling §3 |
| The migration set is applied through drizzle, which requires the owner-ish `DATABASE_URL`; R15 also removes the owner `DATABASE_URL` from the application runtime | pack §H — `drizzle.config.ts:3` requires `process.env.DATABASE_URL`; `drizzle.config.ts:8-15` dialect `postgresql`, schema `./drizzle/schema.ts`, out `./drizzle`; removal of the owner URL: pack §J / governing ruling §1 |
| The repo already contains a REVOKE-then-GRANT precedent pattern in the migration inventory (`0005_atomic_work_event_rpc.sql` — REVOKE at `:214-228`, GRANT to `service_role` at `:234-237`), cited here only as the pattern recorded in pack §H; pack §H does not label this migration's project | pack §H |
| `0002_control_plane_schema.sql` is labelled **Control project** in pack §H, so its `service_role` policies (`:129-132`) are not Project A evidence and are not used here as a deny basis | pack §H |

## 6. Why the DENY removes no production capability (pack §E basis)

Pack §E records the **absent operations** used as least-privilege proof:

- "No `CREATE` / `ALTER` / `DROP` anywhere in `apps/hub-web/server/**`"
- "No `DELETE` anywhere in `apps/hub-web/server/**`"

Copied consequence: the production runtime needs no DDL privilege and no `DELETE` privilege
anywhere, so a deny that withholds `CREATE`/DDL and `DELETE` on billing schemas cannot remove a
capability the runtime uses.

**Scope limit stated honestly:** pack §E establishes the absence of DDL and `DELETE` in the runtime
source. **§E does not by itself prove** that the runtime never reads `billing_core` — that part of
the deny rests on the R15 scoping ruling (pack §J: role "scoped to exactly the `public` objects
used") and on pack §H recording that no hub-web migration references `billing_core`. This lane did
not perform that read-analysis and does not claim it; it is an input to the B1 review, not a result
of this lane.

## 7. Findings and unknowns (recorded, not resolved by this lane)

| # | Item | Status |
|---|---|---|
| F1 | Whether `billing_core` **exists** in Project A at verification time is **not verified** by this lane (no connection was opened). If it does not exist, the runtime negative test yields `3F000` and is INCONCLUSIVE per §3.4 — not a DENY. | **UNKNOWN — must be established at verification time** |
| F2 | Whether `billing_core_staging` **exists**, and in which project/environment, is **not verified** by this lane. The governing ruling names it as a schema to deny; this document does not assert where it lives. | **UNKNOWN — must be established at verification time** |
| F3 | The concrete object names to substitute into `<any_object>` are **not known to this lane** (the billing-core schema definition is outside this work unit's citation set). Object names must be enumerated at verification time via §3.1b/§3.1c. | **UNKNOWN — enumeration required at verification time** |
| F4 | Whether the deny is to be asserted in `billing_core_staging`'s project by the same role provisioning, or by a separate environment path, is a provisioning decision **outside this work unit's authority**. This document states the required end state only. | **OWNER/PROVISIONING DECISION — not taken here** |
| F5 | The R15 "**Pre-data gate**" ordering (pack §J: must be closed before any billing data exists in Project A) makes the DENY evidence time-sensitive: a DENY proven after billing data exists does not satisfy the gate as written. | **RECORDED CONSTRAINT on the verification run sequencing** |

No finding above is presented as a citation-pack error. Per the lane rule, no pack citation was
re-derived; F1–F3 are scope/verification gaps in this lane's own knowledge, not claims about the
pack.

## 8. Declarations

- **Explicit DENY stated for both schemas.** `billing_core` → §3; `billing_core_staging` → §4.
  Each carries a concrete catalog-introspection command form (§3.1 / §4.1) and a concrete runtime
  negative-test command form (§3.2 / §4.2), plus the required positive control (§3.3) and the
  mandatory interpretation table (§3.4).
- **Citations copied, not re-derived.** Every citation-pack reference above is copied from
  `T1-CITATION-PACK.md` sections **E, H, J** only, per this work unit's authority. No source file
  was re-read to produce this artifact and no citation was re-verified or re-derived by this lane.
  The only non-citation-pack reference used is the sibling lane artifact
  `T1-R15-PUBLIC-PRIVILEGE-MATRIX.md`, referenced for the positive-control target only.
- **No production mutation occurred.** This work unit produced **one documentation file** under
  `docs/platform/house-long-run/`. No database connection was opened, no role created/altered/
  dropped, no `GRANT`/`REVOKE` issued, no migration run, no schema or object created, and no file
  outside `docs/platform/house-long-run/` was written or modified.
- **No secret is required to record this plan.** Every command form in this document is expressed
  against role name `hub_web_app`, the schema names, and `<placeholder>` object names. No
  connection string, password, service-role key, or pooler URL is needed to write, read, or review
  this artifact. The only credential that would ever be required is for the **future execution** of
  §3.1/§3.2/§4.1/§4.2 — and that execution is **not authorized by this work unit**.
- **No execution performed.** No command in §3, §4, or §5 of this document was run by this lane.
  Every "expect:" line is a **proposed expectation of the future verification run**, not an
  observed result.
- **No approval is implied.** This is a normalized evidence-preparation record. It is not a grant
  script, not a review PASS, and not a production-readiness claim. R15 remains **open** until the
  deny is executed and its evidence recorded under independent review.
