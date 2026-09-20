# T1-R15 BILLING DENY MATRIX — `hub_web_app` vs `billing_core` / `billing_core_staging`

Task ID: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001`
Stage: T1 (R15 least-privilege preparation)
Work unit: `T1-WU04B-BILLING-DENY-MATRIX-FIX` (revision B of this artifact)
Supersedes: `T1-WU04-BILLING-DENY-MATRIX` (revision A, work unit `house-t1-wu04-20260920`)
Correlation id: `house-t1-wu04b-20260920`
Role class: `evidence_preparation`
Record type: **EVIDENCE PREPARATION ARTIFACT — NOT A GRANT, NOT A REVOKE, NOT AN APPROVAL**
Recorded: 2026-09-20 (Asia/Bangkok)

Citations source: `docs/platform/house-long-run/T1-CITATION-PACK.md` (sections **E, H, J, J.1** only),
pack verified at revision `61dcdfcc07f8ae5edd493fcde61568e2ef0ca51d`.
Governing ruling: `docs/platform/house-long-run/T1-RLS-DECISION-RECORD-2026-09-20.md`
(Owner decision OPTION 3, binding).
Review that required this revision: `docs/platform/house-long-run/B1-REVIEW-OUTCOME-2026-09-20.md`
(verdict `WORKER_FIX`; findings BLK-2, BLK-3, NB-1).
Sibling lane (positive-control targets): `docs/platform/house-long-run/T1-R15-PUBLIC-PRIVILEGE-MATRIX.md`
(work unit `T1-WU03-PUBLIC-PRIVILEGE-MATRIX`).

## 0. Revision note — what changed, and why

Revision A of this artifact was reviewed by B1 (`agent-codex`, independent) and returned
`WORKER_FIX`. This revision addresses each finding. Revision A remains the historical record of what
was reviewed; it is not deleted from history but this file is overwritten as the current revision.

| Finding | Reviewer finding (B1) | Correction in this revision |
|---|---|---|
| **BLK-2** | Revision A §3.2b presented a **session `search_path` assignment** as an expected `42501` denial. PostgreSQL accepts a search_path assignment without granting schema access and does not raise `42501` merely because access is denied, so the probe proves nothing about denial. | The session-search-path-assignment probe has been **REMOVED** as a denial proof and replaced by probes that actually attempt schema access (§3.2b, §3.2e). A dedicated removal note records the disposition (§3.2, "Removed probe"). |
| **BLK-3** | Verification did not directly verify schema/object **ownership**, did not enumerate **effective/transitive** role membership, and did not scan **object-level `PUBLIC` ACLs**; denial can leak through each of those routes. The matrix claimed stronger proof than its commands provided. | Three probe families added: **ownership** (§3.1h), **effective/transitive membership closure** (§3.1i), **object-level `PUBLIC` ACL scan** for relations, sequences, routines and types (§3.1j). Interpretation rows for each added to §3.4. |
| **NB-1** | Master-Plan strings quoted in revision A were attributed to citation pack §J, where they do not appear (facts correct, attribution wrong). | Every quoted Master-Plan string in §2 and §3 is attributed to `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md:896`, per citation pack §J.1 (verbatim strings) and errata K-2. Pack §J is cited only for its own condensed sentence. |

Unsupported claim removed: revision A's implication that the listed runtime commands could prove
denial is withdrawn — in particular the search_path expectation (BLK-2) and the incomplete
effective-privilege coverage (BLK-3). §3.4 now states the exact conjunction of observations required
before a DENY may be recorded, and §8 states that this revision claims no verification.

> **Lane rule applied:** every citation pack reference below is **copied** from
> `T1-CITATION-PACK.md` sections **E, H, J, J.1**. Nothing here was re-derived, re-verified, or
> re-read from source by this lane. No citation was introduced from any citation-pack section other
> than E, H, J, J.1.

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

Master-Plan strings below are quoted **verbatim from
`docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md:896`** (R15 row). Per citation pack §J.1, these
strings are Master Plan text, **not** text of the citation pack; pack §J carries only the condensed
sentence "R15: runtime connects as Project A `postgres` **owner**; correct state = dedicated
`hub_web_app` **login role** scoped to exactly the `public` objects used — no ownership, no
`CREATE`, no escalating membership". Errata K-2 records the earlier mis-attribution.

| Authority statement | Source |
|---|---|
| R15 required control: "Move hub-web's runtime to a dedicated `hub_web_app` login role scoped to exactly the `public` objects it uses — no ownership, no `CREATE`, no escalating role membership; keep the owner URL out of the app runtime" | `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md:896` (verbatim; listed in citation pack §J.1) |
| R15 required control (denial): "denial tests prove `hub_web_app` cannot use `billing_core`/`billing_core_staging`" | `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md:896` (verbatim; listed in citation pack §J.1) |
| R15 ordering: "**Pre-data gate:** must be closed before any billing data exists in Project A. Standing hub-web security fix regardless of billing-core timing." | `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md:896` (verbatim; listed in citation pack §J.1) |
| R15 defect statement: hub-web's application runtime connects to Project A as the `postgres` **owner** identity (`DATABASE_URL` = `postgres.coyelzlgukvpgguqpjdi` pooler) — a hub-web runtime compromise is a database-owner compromise, and it "defeats every grant boundary" the `billing_core` schema relies on | `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md:896` (verbatim; listed in citation pack §J.1) |
| R15 condensed restatement of the required end state (role scoped to `public` objects used; no ownership, no `CREATE`, no escalating membership) | citation pack §J (condensed sentence only — not the source of the quoted strings above) |
| R15 least-privilege intent: "explicit deny on `billing_core`" and "explicit deny on `billing_core_staging`"; also "no `BYPASSRLS`", "no ownership", "no `CREATE`", "no escalating role membership", "owner `DATABASE_URL` removed from application runtime" | governing ruling §1 (`T1-RLS-DECISION-RECORD-2026-09-20.md`) |
| "`billing_core` and `billing_core_staging` must be explicitly denied." | governing ruling §3 |
| Owner boundary: `hub_web_app` is the scoped direct-Postgres application role **only** (`public.profiles` excluded; `public` scope carried by the sibling lane) | governing ruling §1, §3 |

Both schema names in scope — `billing_core` and `billing_core_staging` — are named by the governing
ruling and by the R15 text at `PORTFOLIO_PRODUCTION_MASTER_PLAN.md:896`. No schema name in this
document is inferred.

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
  privileges (no escalating membership — governing ruling §1) — **including transitive membership**;
- `hub_web_app` has no `BYPASSRLS` and no `SUPERUSER` (governing ruling §1: "no `BYPASSRLS`");
- no `PUBLIC` grant, no object-level `PUBLIC` ACL, no `ALTER DEFAULT PRIVILEGES` and no
  `GRANT ... TO PUBLIC` confers `billing_core` access to `hub_web_app`;
- no `hub_web_app` **ownership** of the schema, of any relation, sequence, routine, or type in it,
  because an owner holds privileges implicitly and would not appear as a grant;
- the runtime credential presented by `hub_web_app` does not resolve to a different, more
  privileged identity (pooler role/session identity must be the scoped role, per the R15 defect
  text at `PORTFOLIO_PRODUCTION_MASTER_PLAN.md:896`).

### 3.1 Verification command form — catalog introspection (authoritative for grant state)

Run in Project A as an **auditing role that is not `hub_web_app`** (no membership in it).

```sql
-- 3.1a exact schema-privilege assertion (expect: f, f for hub_web_app)
SELECT r.rolname,
       has_schema_privilege(r.rolname, 'billing_core', 'USAGE') AS core_usage,
       has_schema_privilege(r.rolname, 'billing_core', 'CREATE') AS core_create
FROM pg_roles r
WHERE r.rolname = 'hub_web_app';
```

```sql
-- 3.1b enumerated RELATION/SEQUENCE privileges inside the schema (expect: ZERO ROWS)
SELECT c.relkind, n.nspname, c.relname, a.privilege_type
FROM pg_namespace n
JOIN pg_class c ON c.relnamespace = n.oid
CROSS JOIN LATERAL aclexplode(COALESCE(c.relacl, acldefault('r', c.relowner))) a
JOIN pg_roles g ON g.oid = a.grantee
WHERE n.nspname = 'billing_core'
  AND g.rolname = 'hub_web_app';
```

```sql
-- 3.1c schema-level ACL entries naming hub_web_app (expect: ZERO ROWS)
SELECT n.nspname, g.rolname, a.privilege_type
FROM pg_namespace n
CROSS JOIN LATERAL aclexplode(COALESCE(n.nspacl, acldefault('n', n.nspowner))) a
JOIN pg_roles g ON g.oid = a.grantee
WHERE n.nspname = 'billing_core'
  AND g.rolname = 'hub_web_app';
```

```sql
-- 3.1d schema-level PUBLIC / default-ACL leak for the schema (expect: ZERO ROWS)
SELECT n.nspname, a.grantee AS grantee_oid, a.privilege_type
FROM pg_namespace n
CROSS JOIN LATERAL aclexplode(COALESCE(n.nspacl, acldefault('n', n.nspowner))) a
WHERE n.nspname = 'billing_core'
  AND a.grantee = 0;   -- 0 = PUBLIC
```

```sql
-- 3.1e DIRECT role membership of hub_web_app (expect: ZERO ROWS)
SELECT m.roleid::regrole AS member_of, m.admin_option
FROM pg_auth_members m
JOIN pg_roles g ON g.oid = m.member
WHERE g.rolname = 'hub_web_app';
```

```sql
-- 3.1f identity-escape check
--      (expect: rolsuper=f, rolcreatedb=f, rolcreaterole=f, rolbypassrls=f)
SELECT rolname, rolsuper, rolcreatedb, rolcreaterole, rolbypassrls, rolinherit
FROM pg_roles
WHERE rolname = 'hub_web_app';
```

```sql
-- 3.1g ROUTINE privileges in schema (expect: ZERO ROWS)
SELECT n.nspname, p.proname, a.privilege_type
FROM pg_namespace n
JOIN pg_proc p ON p.pronamespace = n.oid
CROSS JOIN LATERAL aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner))) a
JOIN pg_roles g ON g.oid = a.grantee
WHERE n.nspname = 'billing_core'
  AND g.rolname = 'hub_web_app';
```

```sql
-- 3.1h OWNERSHIP probe (added for B1 BLK-3) — expect ZERO ROWS on every part.
--      Rationale: an OWNER holds all privileges on its object implicitly and therefore
--      would NOT appear as a grant row in 3.1b/3.1c/3.1g. Ownership is a separate leak path.

-- 3.1h-i schema ownership
SELECT n.nspname, pg_get_userbyid(n.nspowner) AS owner
FROM pg_namespace n
WHERE n.nspname IN ('billing_core')
  AND n.nspowner = (SELECT oid FROM pg_roles WHERE rolname = 'hub_web_app');

-- 3.1h-ii relation/sequence ownership (relkind r,v,m,S,f,p)
SELECT n.nspname, c.relkind, c.relname, pg_get_userbyid(c.relowner) AS owner
FROM pg_namespace n
JOIN pg_class c ON c.relnamespace = n.oid
WHERE n.nspname = 'billing_core'
  AND c.relowner = (SELECT oid FROM pg_roles WHERE rolname = 'hub_web_app');

-- 3.1h-iii routine ownership
SELECT n.nspname, p.proname, pg_get_userbyid(p.proowner) AS owner
FROM pg_namespace n
JOIN pg_proc p ON p.pronamespace = n.oid
WHERE n.nspname = 'billing_core'
  AND p.proowner = (SELECT oid FROM pg_roles WHERE rolname = 'hub_web_app');

-- 3.1h-iv type ownership (enums/domains in the schema)
SELECT n.nspname, t.typname, pg_get_userbyid(t.typowner) AS owner
FROM pg_namespace n
JOIN pg_type t ON t.typnamespace = n.oid
WHERE n.nspname = 'billing_core'
  AND t.typowner = (SELECT oid FROM pg_roles WHERE rolname = 'hub_web_app');
```

```sql
-- 3.1i EFFECTIVE / TRANSITIVE membership closure (added for B1 BLK-3) — expect ZERO ROWS.
--      Direct membership (3.1e) is insufficient: a role reachable only through an
--      intermediate role can still confer privileges. This enumerates the whole closure
--      explicitly rather than relying on any assumption about how inheritance is resolved.
WITH RECURSIVE reach(roleid) AS (
    SELECT m.roleid
    FROM pg_auth_members m
    JOIN pg_roles g ON g.oid = m.member
    WHERE g.rolname = 'hub_web_app'
  UNION
    SELECT m2.roleid
    FROM reach r
    JOIN pg_auth_members m2 ON m2.member = r.roleid
)
SELECT DISTINCT roleid::regrole AS effective_membership FROM reach ORDER BY 1;
```

```sql
-- 3.1j OBJECT-LEVEL PUBLIC ACL scan (added for B1 BLK-3) — scan every object class in the
--      schema for grantee = 0 (PUBLIC), because a PUBLIC grant reaches hub_web_app without
--      naming it and therefore never appears in 3.1b/3.1c/3.1g.

-- 3.1j-i schema PUBLIC ACL
SELECT n.nspname, a.grantee AS grantee_oid, a.privilege_type
FROM pg_namespace n
CROSS JOIN LATERAL aclexplode(COALESCE(n.nspacl, acldefault('n', n.nspowner))) a
WHERE n.nspname = 'billing_core' AND a.grantee = 0;

-- 3.1j-ii relation / sequence PUBLIC ACL
SELECT n.nspname, c.relkind, c.relname, a.privilege_type
FROM pg_namespace n
JOIN pg_class c ON c.relnamespace = n.oid
CROSS JOIN LATERAL aclexplode(COALESCE(c.relacl, acldefault('r', c.relowner))) a
WHERE n.nspname = 'billing_core' AND a.grantee = 0;

-- 3.1j-iii routine PUBLIC ACL  (disposition of any row: see §3.4, row "PUBLIC ACL rows present")
SELECT n.nspname, p.proname, a.privilege_type
FROM pg_namespace n
JOIN pg_proc p ON p.pronamespace = n.oid
CROSS JOIN LATERAL aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner))) a
WHERE n.nspname = 'billing_core' AND a.grantee = 0;

-- 3.1j-iv type PUBLIC ACL
SELECT n.nspname, t.typname, a.privilege_type
FROM pg_namespace n
JOIN pg_type t ON t.typnamespace = n.oid
CROSS JOIN LATERAL aclexplode(COALESCE(t.typacl, acldefault('T', t.typowner))) a
WHERE n.nspname = 'billing_core' AND a.grantee = 0;
```

**Expected-value note on 3.1j-iii (honesty over convenience):** this lane does **not** assert an
expected row count for the routine PUBLIC probe. PostgreSQL applies a default ACL to newly created
functions, and if that default includes `PUBLIC`, rows returned here are a **FINDING to record and
dispose of**, not a pass. Whether such rows are reachable by `hub_web_app` also depends on schema
`USAGE` (3.1a/3.1d) and on whether the default holds on the target server version. The exact
behaviour must be **observed at verification time**, not assumed by this lane.

### 3.2 Verification command form — runtime negative test (authoritative for effective capability)

Run using **the `hub_web_app` credential itself** (not `SET ROLE` from a more privileged session,
which would not prove the runtime identity).

```sql
-- 3.2a schema reachability via a real, enumerated object
--      (expect: SQLSTATE 42501, "permission denied for schema billing_core")
SELECT 1 FROM billing_core.<enumerated_object> LIMIT 1;
```

```sql
-- 3.2b REPLACEMENT for the removed probe: an operation that actually attempts schema access.
--      (expect: SQLSTATE 42501, "permission denied for schema billing_core")

-- 3.2b-i aggregate read through a resolved qualified name
SELECT count(*) FROM billing_core.<enumerated_object>;

-- 3.2b-ii DDL against the schema (expect: 42501) — also covers the CREATE boundary
CREATE TABLE billing_core.<probe> (id int);

-- 3.2b-iii attempt to obtain a value from a sequence in the schema
--          (only if a sequence name is enumerated by 3.1b; expect: 42501)
SELECT nextval('billing_core.<enumerated_sequence>');
```

```sql
-- 3.2c DDL attempt if any object name were guessable (expect: SQLSTATE 42501)
--     (listed for completeness; §E records no DDL in the runtime, so this only probes the boundary)
CREATE TABLE billing_core.<probe> (id int);
```

```sql
-- 3.2d information_schema enumeration (expect: no billing_core rows visible from this identity)
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema = 'billing_core';
```

```sql
-- 3.2e self-check executed AS the runtime identity (supplementary to the catalog forms; not a
--      substitute for them). Record BOTH this result and the auditing-role result from 3.1a.
SELECT current_user AS identity,
       has_schema_privilege(current_user, 'billing_core', 'USAGE') AS core_usage_self,
       has_schema_privilege(current_user, 'billing_core', 'CREATE') AS core_create_self;
```

**Removed probe (B1 BLK-2 disposition).** Revision A §3.2b presented a session-search-path-assignment
statement as an expected `42501` denial. It has been **REMOVED** and is **not** part of this
revision's verification plan. Reason (B1, verified): assigning a search path is a session-level
configuration change; PostgreSQL accepts it without granting schema access and does not raise
`42501` merely because access to the named schema is denied. Any observation of that statement is
therefore **not evidence of denial**, and nothing in this document may be read as treating it as
such. Schema access is proven only by operations that actually attempt schema access (§3.2a,
§3.2b, §3.2c, §3.2d) under the runtime credential.

`<enumerated_object>` / `<probe>` / `<enumerated_sequence>` are placeholders deliberately left
unresolved: this lane did not read the billing-core schema definition and must not invent object
names. The verification run must substitute real names enumerated by the auditing role (forms
3.1b/3.1c/3.1h-ii) — a test that asserts privilege denial on an invented object name proves nothing.

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
- The positive control must also be run as **the same identity** used for the negative forms
  (§3.2), not from an auditing session.

### 3.4 Result interpretation (mandatory — the distinction is binding for the evidence record)

| Observed result | SQLSTATE / shape | Meaning | Required disposition |
|---|---|---|---|
| `permission denied for schema billing_core` | `42501` | privilege absent for this identity | **DENY CONFIRMED at schema level** (still requires §3.4 conjunction below) |
| `permission denied for table/relation ...` | `42501` | schema usable but object privilege absent | **DENY CONFIRMED at object level; FINDING** — schema-level `USAGE` is present and must be recorded, not silently passed |
| `schema "billing_core" does not exist` | `3F000` | schema absent in this project/identity view | **INCONCLUSIVE — HOLD.** Absence is not denial; §7 records this as an unverified precondition |
| `relation ... does not exist` | `42P01` | object absent | **INCONCLUSIVE — HOLD** (same reason) |
| `role "hub_web_app" does not exist` | `42704` | precondition unmet | **BLOCKED** — the R15 role does not exist yet; no deny can be asserted |
| positive control fails | any | test rig invalid | **INCONCLUSIVE — HOLD**, rerun |
| **ownership probe returns rows (§3.1h-i … 3.1h-iv)** | any | `hub_web_app` owns the schema or an object in it | **DENY FALSIFIED — FINDING.** Owner holds privileges implicitly; the deny cannot be asserted until ownership is transferred. Record as a blocker for R15 apply |
| **direct membership probe returns rows (§3.1e)** | any | privileges may arrive by inheritance | **FINDING** — resolve each member role's privileges on `billing_core`; only a fully-reviewed non-privileged closure supports the deny |
| **transitive membership closure returns rows (§3.1i)** | any | privileges may arrive via an intermediate role | **FINDING** — same disposition; the closure result must be recorded verbatim in the evidence |
| **object-level PUBLIC ACL rows present (§3.1j-ii, 3.1j-iv)** | any | a PUBLIC grant may reach `hub_web_app` without naming it | **FINDING** — record the row and the object; denial requires `REVOKE ... FROM PUBLIC` on that object, not a hub_web_app-specific deny |
| **routine PUBLIC ACL rows present (§3.1j-iii)** | any | default ACL on functions may grant `PUBLIC` EXECUTE | **FINDING — record, then dispose** (reachability depends on schema `USAGE`; do not assume it is harmless) |
| **3.2e self-check disagrees with 3.1a** | any | catalog and runtime views of the privilege differ | **FINDING — HOLD**; resolve the disagreement before recording any deny |

**A DENY may be recorded as verified only when ALL of the following hold**, in one run, at one
recorded revision of the database state:

1. the positive control (§3.3) succeeded from the runtime identity;
2. catalog forms §3.1a–§3.1d and §3.1g returned their expected values;
3. the **ownership** probes §3.1h-i … §3.1h-iv returned zero rows;
4. the **direct and transitive membership** probes §3.1e and §3.1i returned zero rows;
5. the **object-level `PUBLIC` ACL** probes §3.1j-i … §3.1j-iv returned zero rows, or every
   returned row was recorded as a FINDING and disposed of;
6. the runtime forms §3.2a–§3.2d returned `42501` (or the schema was proven absent under §3.4's
   HOLD rule) for a real, enumerated `billing_core` object.

If any element is missing, the outcome is HOLD or FINDING — **never** DENY CONFIRMED. No single
probe in this section is by itself sufficient, and no probe in this section proves denial by
itself.

## 4. DENY REQUIREMENT — `billing_core_staging`

The requirement is identical in shape and is a **separate assertion**: passing the `billing_core`
checks does **not** attest `billing_core_staging`, and vice versa. The R15 authority names both
schemas in the same sentence ("denial tests prove `hub_web_app` cannot use
`billing_core`/`billing_core_staging`" — `PORTFOLIO_PRODUCTION_MASTER_PLAN.md:896`), so both must
carry their own evidence.

**Required state (must hold for `hub_web_app`, in Project A or wherever the schema lives — see F2):**

```
billing_core_staging
  schema  USAGE            -> NOT GRANTED (DENY)
  every object in schema   -> NO privilege of any kind
  every sequence in schema -> NO privilege of any kind
  every routine in schema  -> NO EXECUTE
  ownership of the schema or of any object in it -> NOT HELD
```

plus the same effective-deny conditions listed in §3 (no escalating membership — direct or
transitive, no `BYPASSRLS`/`SUPERUSER`, no schema-level or object-level `PUBLIC`/default-privilege
route, no ownership, runtime credential resolves to the scoped role).

### 4.1 Verification command form — catalog introspection

Run the **complete** §3.1 probe set (3.1a–3.1j-iv, including the ownership, transitive-membership
and object-level PUBLIC scans) with `'billing_core_staging'` substituted for `'billing_core'` in
every schema predicate. Representative forms:

```sql
SELECT r.rolname,
       has_schema_privilege(r.rolname, 'billing_core_staging', 'USAGE') AS staging_usage,
       has_schema_privilege(r.rolname, 'billing_core_staging', 'CREATE') AS staging_create
FROM pg_roles r
WHERE r.rolname = 'hub_web_app';
-- expect: staging_usage = f, staging_create = f
```

```sql
-- enumerated relation/sequence privileges (expect: ZERO ROWS)
SELECT c.relkind, n.nspname, c.relname, a.privilege_type
FROM pg_namespace n
JOIN pg_class c ON c.relnamespace = n.oid
CROSS JOIN LATERAL aclexplode(COALESCE(c.relacl, acldefault('r', c.relowner))) a
JOIN pg_roles g ON g.oid = a.grantee
WHERE n.nspname = 'billing_core_staging'
  AND g.rolname = 'hub_web_app';
```

```sql
-- ownership (expect: ZERO ROWS) — staging schema and its objects
SELECT n.nspname, pg_get_userbyid(n.nspowner) AS owner
FROM pg_namespace n
WHERE n.nspname = 'billing_core_staging'
  AND n.nspowner = (SELECT oid FROM pg_roles WHERE rolname = 'hub_web_app');
```

```sql
-- object-level PUBLIC ACL, relations/sequences in staging (expect: ZERO ROWS; any row = FINDING)
SELECT n.nspname, c.relkind, c.relname, a.privilege_type
FROM pg_namespace n
JOIN pg_class c ON c.relnamespace = n.oid
CROSS JOIN LATERAL aclexplode(COALESCE(c.relacl, acldefault('r', c.relowner))) a
WHERE n.nspname = 'billing_core_staging' AND a.grantee = 0;
```

The direct (3.1e) and transitive (3.1i) membership probes are **role-scoped, not schema-scoped** —
they return the same rows for any schema. A single run of 3.1e/3.1i therefore serves both schemas,
but the evidence record must state that explicitly rather than implying each schema has an
independent membership result.

### 4.2 Verification command form — runtime negative test

```sql
-- expect: SQLSTATE 42501, "permission denied for schema billing_core_staging"
SELECT 1 FROM billing_core_staging.<enumerated_object> LIMIT 1;
```

Subject to the same positive-control rule (§3.3) and the same result interpretation (§3.4). As in
§3.2, `<enumerated_object>` must be substituted from an object actually enumerated for this schema.
The removed revision-A search_path probe (§3.2, "Removed probe") applies here equally: no
session-search-path-assignment statement may be used as a `billing_core_staging` denial proof.

## 5. Where the DENY must be enforced (pack §H basis)

Pack §H carries the **migration inventory (DDL scope)** for this repository and records that
**none of the six migrations reference `billing_core`** (§H, final inventory bullet). Consequences
recorded by this lane:

| Consequence | Basis |
|---|---|
| The `billing_core` / `billing_core_staging` deny **cannot be produced by the existing hub-web migration set** — there is no existing grant in it to reverse, and no existing DDL there that references those schemas | pack §H — "None of the six reference `billing_core`"; inventory lists `0001`–`0006` only |
| Because nothing in the migration set creates or grants `billing_core` access, the deny is an **absence-invariant** to be asserted by whatever authority provisions `hub_web_app` (the R15 role provisioning), not a migration reversal | pack §H; governing ruling §3 |
| The migration set is applied through drizzle, which requires the owner-ish `DATABASE_URL`; R15 also removes the owner `DATABASE_URL` from the application runtime | pack §H — `drizzle.config.ts:3` requires `process.env.DATABASE_URL`; `drizzle.config.ts:8-15` dialect `postgresql`, schema `./drizzle/schema.ts`, out `./drizzle`; removal of the owner URL: `PORTFOLIO_PRODUCTION_MASTER_PLAN.md:896` ("keep the owner URL out of the app runtime") / governing ruling §1 |
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
the deny rests on the R15 scoping ruling (role "scoped to exactly the `public` objects it uses" —
`PORTFOLIO_PRODUCTION_MASTER_PLAN.md:896`) and on pack §H recording that no hub-web migration
references `billing_core`. This lane did not perform that read-analysis and does not claim it; it is
an input to the B1 review, not a result of this lane.

## 7. Findings and unknowns (recorded, not resolved by this lane)

| # | Item | Status |
|---|---|---|
| F1 | Whether `billing_core` **exists** in Project A at verification time is **not verified** by this lane (no connection was opened). If it does not exist, the runtime negative test yields `3F000` and is INCONCLUSIVE per §3.4 — not a DENY. | **UNKNOWN — must be established at verification time** |
| F2 | Whether `billing_core_staging` **exists**, and in which project/environment, is **not verified** by this lane. The governing ruling names it as a schema to deny; this document does not assert where it lives. | **UNKNOWN — must be established at verification time** |
| F3 | The concrete object names to substitute into `<enumerated_object>` / `<probe>` / `<enumerated_sequence>` are **not known to this lane** (the billing-core schema definition is outside this work unit's citation set). Object names must be enumerated at verification time via §3.1b/§3.1c/§3.1h-ii. | **UNKNOWN — enumeration required at verification time** |
| F4 | Whether the deny is to be asserted in `billing_core_staging`'s project by the same role provisioning, or by a separate environment path, is a provisioning decision **outside this work unit's authority**. This document states the required end state only. | **OWNER/PROVISIONING DECISION — not taken here** |
| F5 | The R15 "Pre-data gate" ordering (`PORTFOLIO_PRODUCTION_MASTER_PLAN.md:896`: must be closed before any billing data exists in Project A) makes the DENY evidence time-sensitive: a DENY proven after billing data exists does not satisfy the gate as written. | **RECORDED CONSTRAINT on the verification run sequencing** |
| F6 | The results of the newly added probes — ownership (§3.1h), effective/transitive membership (§3.1i), and object-level `PUBLIC` ACLs (§3.1j) — are **not observed**. This revision adds the probes required by B1 BLK-3; it does not supply their outcomes. A DENY cannot be recorded from this document alone. | **UNKNOWN — must be established at verification time** |
| F7 | The PostgreSQL default ACL behaviour for functions (whether `PUBLIC` holds `EXECUTE` on newly created functions in the billing schemas, and on the target server version) is **not asserted** by this lane; §3.1j-iii must be observed. | **UNKNOWN — must be established at verification time** |

No finding above is presented as a citation-pack error. Per the lane rule, no pack citation was
re-derived; F1–F3 and F6–F7 are scope/verification gaps in this lane's own knowledge, not claims
about the pack.

## 8. Declarations

- **Explicit DENY stated for both schemas.** `billing_core` → §3; `billing_core_staging` → §4.
  Each carries a concrete catalog-introspection command form (§3.1 / §4.1) and a concrete runtime
  negative-test command form (§3.2 / §4.2), plus the required positive control (§3.3) and the
  mandatory interpretation table (§3.4).
- **B1 BLK-2 addressed.** The revision-A session-search-path-assignment probe is **removed** and
  nothing in this document presents any search_path assignment as a denial proof. Schema access is
  probed only by operations that attempt schema access (§3.2a–§3.2d) under the runtime credential.
- **B1 BLK-3 addressed.** An **ownership** probe (§3.1h-i … 3.1h-iv) is present; an
  **effective/transitive** membership probe (§3.1e direct + §3.1i recursive closure) is present; and
  an **object-level `PUBLIC` ACL** probe covering schema, relations/sequences, routines and types
  (§3.1j-i … 3.1j-iv) is present. §3.4 makes each of the three a required element of any recorded
  DENY.
- **B1 NB-1 addressed.** Every Master-Plan quoted string in this document is attributed to
  `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md:896`, per citation pack §J.1. Pack §J is cited
  only for its own condensed sentence.
- **Citations copied, not re-derived.** Every citation-pack reference above is copied from
  `T1-CITATION-PACK.md` sections **E, H, J, J.1** only, per this work unit's authority. No source
  file was re-read to produce this artifact and no citation was re-verified or re-derived by this
  lane. The only non-citation-pack references used are the sibling lane artifact
  `T1-R15-PUBLIC-PRIVILEGE-MATRIX.md` (positive-control target only), the governing ruling
  `T1-RLS-DECISION-RECORD-2026-09-20.md` (Owner authority), the review record
  `B1-REVIEW-OUTCOME-2026-09-20.md` (findings being remediated), and
  `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md:896` (attribution target named by the review
  and by the work packet for the quoted strings).
- **No production mutation occurred.** This work unit produced **one documentation file**
  (overwrite of this path) under `docs/platform/house-long-run/`. No database connection was
  opened, no role created/altered/dropped, no `GRANT`/`REVOKE` issued, no migration run, no schema
  or object created, and no file outside `docs/platform/house-long-run/` was written or modified.
- **No secret is required to record this plan.** Every command form in this document is expressed
  against role name `hub_web_app`, the schema names, and `<placeholder>` object names. No connection
  string, password, service-role key, or pooler URL is needed to write, read, or review this
  artifact. The only credential that would ever be required is for the **future execution** of
  §3.1/§3.2/§4.1/§4.2 — and that execution is **not authorized by this work unit**.
- **No execution performed.** No command in §3, §4, §5, or §6 of this document was run by this
  lane. Every "expect:" line is a **proposed expectation of the future verification run**, not an
  observed result.
- **No approval is implied.** This is a normalized evidence-preparation record. It is not a grant
  script, not a review PASS, and not a production-readiness claim. R15 remains **open** until the
  deny is executed and its evidence recorded under independent review.
