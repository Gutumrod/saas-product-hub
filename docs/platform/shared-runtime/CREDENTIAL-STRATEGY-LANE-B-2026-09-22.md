# CREDENTIAL STRATEGY — LANE B, ALL REMAINING STAGES

Date: 2026-09-22 (reconstructed 2026-09-23, unit U-R2)
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Author: Claude (Windows) — Lane-B controller
Authority: `OWNER-DECISION-LANE-B-PRE-A1-REMEDIATION-2026-09-22.md` §3.A;
`OWNER-RULING-LANE-B-HERMES-RELAY-TAKEOVER-2026-09-22.md` §3 (root-cause reconstruction, not isolation patching)
Status: `CONTROLLER DRAFT REV5 — U-R2 ROOT-CAUSE RECONSTRUCTION: SIX-LAYER PRIVILEGE MODEL; CLOSES NEW-DEFECT-03/05/06/08/09 BY NAME; AWAITING CODEX INDEPENDENT REVIEW`
Reconstruction record: `RECONSTRUCTION-LANE-B-CREDENTIAL-BOUNDARY-2026-09-23.md`
Execution baseline read: `work/house-h3d-h5-20260909 @ 2b1af861aa608f08abb0bd8224821b9ca5ac9981` (`BASELINE_2b1af861aa608f08abb0bd8224821b9ca5ac9981`)

This document **defines** roles and runbooks. It creates nothing. No LAB role,
credential, grant, Auth setting or row is created or changed by it or by any unit that
cites it before the Owner checkpoint that stage belongs to.

**Rev5 replaces the privilege model, it does not patch findings one at a time.** Rev4
(named grants, round 3/4 review `REVIEW-CODEX-LANE-B-CONTROLLER-PACKAGE-ROUND4-2026-09-22.md`)
modelled privilege as a *declared grant list*. The measured truth is a *reachability
relation* over catalog presence, object grants, schema `USAGE`, effective reach, RLS
visibility and ownership capability. §1b states those six layers as separate,
individually asserted, individually falsifiable contracts; §3 states, for every check,
which layer it asserts; §3c states the **effective-reach assertion** and the
**catalog-surface inventory** as two separate labelled contracts that are never
conflated.

## 0. Measured facts this policy is built on

Each fact is cited to source at `2b1af86` or to a measured record. Nothing here is
inferred from a file name.

| # | Fact | Source |
|---|---|---|
| F1 | Seed and teardown SQL hard-assert `current_user = 'postgres'` and `pg_has_role('postgres','ps01_migrator','MEMBER')`. | `fixtures/h3d-authz-fixture-seed.sql` §2; `…-teardown.sql:28-31` |
| F2 | Teardown issues `ALTER TABLE ps01.subscription_audit_log DISABLE/ENABLE TRIGGER` — table-owner DDL, not DML. | `…-teardown.sql:185,188` |
| F3 | The runner's `assertDbIdentity()` requires `current_user = 'postgres'` at hook-probe, run and teardown. | `h3d-live-runner.mjs:361-366`, called at 757, 823, 942 |
| F4 | The runner writes `wstera_platform_internal.runtime_token_grants` (INSERT/DELETE/SELECT) and creates/deletes Auth identities through the Admin API with `H3D_SERVICE_KEY`. | `h3d-live-runner.mjs:302-360` |
| F5 | No runner/catalog/psql path checks the **database** connection target against `LAB_REF`. Only the Auth/API origin is checked (`assertLabTarget`). | `h3d-live-runner.mjs:130`, `:497-510`; `catalog-manifest.mjs:260-266` |
| F6 | H3E forward, H4 forward and H4 rollback assert `current_user = 'postgres'` and perform role DDL (`ALTER ROLE … NOLOGIN`, `CREATE ROLE`, `GRANT … TO authenticator`). | `migrations/h3e_*.sql`, `migrations/h4_*.sql` |
| F7 | `h4_runtime_token_grants` is `REVOKE ALL` from a finite named list (`PUBLIC, anon, authenticated, service_role, authenticator, ps01_migrator, ps01_runtime, ps01_runtime_login, ps01_line_runtime, h4_migrator, h4_runtime`) and separately `GRANT SELECT` to `supabase_auth_admin`. This is not a proven all-roles statement — the source does not assert "no other role can access this table" as a catalog check. Owner (`h4_migrator`, by `CREATE TABLE` ownership) can still write it; only the platform `postgres` session (which owns/administers `h4_migrator`) can insert the H4 grant row in practice. | `h4_disposable_product_forward.sql:83-95` |
| F8 | `lab-readonly-inventory.mjs` reads `auth.users`, `storage.buckets`, `cron.job`, `supabase_migrations.schema_migrations`. `storage.buckets` and `cron.job` carry RLS in Supabase; `auth.users` returned `42501` to a granted role. | `lab-readonly-inventory.mjs:151-208`; `BATCH-H3D-S` §3, §6 |
| F9 | Supabase `postgres` is not a true superuser: `DROP OWNED BY` for another role is refused (`42501`); teardown needs a mirrored explicit `REVOKE` list. | `BATCH-H3D-S` §8 teardown |
| F10 | Any role created in LAB inherits the managed `PUBLIC` **object grants** on `cron` (1 table) and `net` (2 tables) at creation; this cannot be avoided by grant scoping. **Layer correction (L2 ≠ L4):** the `cron` object grants are present but **not reachable** — schema `cron` `USAGE` is not held; schema `net` `USAGE` **is** `PUBLIC`, so the `net` objects are reachable. | `BATCH-H3D-S` §7; `H1-EFFECTIVE-PRIVILEGE-INVENTORY-2026-09-08.md:57-64,81-85` |
| F11 | The Supabase pooler drops `options=` and ignores `ALTER ROLE … SET`; connection-level read-only cannot be enforced. | `ANALYSIS` B1 |
| F12 | `ps01.commercial_packages` holds 3 reference rows behind RLS (`{authenticated}` policy). A role without RLS bypass reads 0. | `BATCH-H3D-S` §3, §5 |

## 1. Credential classes

Every Lane-B credential falls into exactly one class. A stage may use only the
classes listed for it in §2.

| Class | Name pattern | Shape | Lifetime |
|---|---|---|---|
| **M — measurement** | `lane_b_measure_<stage>` | `LOGIN`, `NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION`, **`BYPASSRLS`**, `CONNECTION LIMIT 2`, `VALID UNTIL` ≤ window end. `USAGE` + `SELECT` only on the schemas/tables the stage's gates read (§4). No **intended** `INSERT/UPDATE/DELETE/TRUNCATE` grant anywhere; no role membership. **Effective privilege is broader than the intended grant** — see §1a and §1b. | ephemeral, one window |
| **W — scoped write** | `lane_b_rw_<stage>` | `LOGIN`, no superuser/createdb/createrole/replication, **no `BYPASSRLS` attribute**, `CONNECTION LIMIT 3`, `VALID UNTIL` ≤ window end. Membership `ps01_migrator` (`INHERIT TRUE, SET TRUE`) **only** where F1/F2 owner DDL is required. **This membership is an ownership-level capability (L6), not a table-only grant** — see §1a and §1b. | ephemeral, one window |
| **A — Auth admin** | env `H3D_SERVICE_KEY` / `LANE_B_AUTH_ADMIN_KEY` ← `.secrets` `SUPABASE_SECRET_KEY_WSTERA_LAB` | Project secret key. Supabase offers no narrower Auth-admin credential — this is a **platform ceiling**, recorded not waived. Used only by agent tooling for `/auth/v1/admin/*`; never passed to a child process, harness, product, browser, or evidence. | existing key; per-window use only |
| **P — platform admin** | LAB `postgres` | Role DDL and platform-owned migrations only (F6, F7). **Executed by the Owner in the Supabase SQL editor.** The agent never holds this credential in any Lane-B stage. `BILLING_DATABASE_URL` and `SUPABASE_DB_PASSWORD_WSTERA_LAB` are **not** injected into any agent process. | none on agent side |
| **T — product token** | JWT, `role = ps01_line_runtime` / `h4_runtime` | Auth-issued through the hook, ≤ 300 s, held in memory / minimal child env only. | ≤ 5 min |

### 1a. Effective boundary — restated on the six-layer model (closes DEFECT-02/NEW-DEFECT-02 root cause; NEW-DEFECT-06, NEW-DEFECT-08)

Earlier revisions stated "no other schema" (W) and "no writes anywhere" (M) as if a
declared grant list were the *effective* privilege. That was false because both classes
inherit capability they were never explicitly granted. Rev5 does not restate that as
prose: §1b defines six layers, and §3 gates them layer by layer.

**M's reach beyond its listed grants.** `BYPASSRLS` (L5, row visibility) grants no write
capability by itself. M also inherits the managed `PUBLIC` **object grants (L2)** on
`cron` (1 table) and `net` (2 tables) at creation (F10). Reach (L4) is the conjunction
of L2 and schema `USAGE` (L3):

- `net`: L3 schema `USAGE` = `PUBLIC` = true; the two `net` tables carry seven `PUBLIC`
  privileges; the sequence carries `SELECT, USAGE, UPDATE` — so the `net` objects are
  **effectively reachable (L4)**, accepted, bounded and re-measured, never described as
  absent;
- `cron`: L2 object grants exist (`SELECT` on `cron.job`; `SELECT/DELETE` on
  `cron.job_run_details`), but L3 schema `USAGE` is **not** held
  (`H1-…:81-85`), so the `cron` objects are **catalog-present but not reachable
  (L2 ≠ L4)**. They belong to the catalog-surface inventory (§3c, Contract B), not to
  the accepted effective-reach set (Contract A).

**M is therefore read-only with respect to product/data schemas, and it carries an
accepted, bounded, re-measured managed-surface effective reach on `net` (L4).** That
exposure cannot be removed by role design (Supabase offers no supported opt-out), so it
is controlled at the tool boundary (G-STATIC-NOSHARED, §6) and re-measured (§1 inv. 5),
never described as absent.

**W's reach beyond table DML.** `ps01_migrator` **owns** schemas `ps01` and
`ps01_internal` (`H1-…:48,100`). Role membership with `INHERIT TRUE` confers
**ownership capability (L6)** — an owning role can `ALTER`/`DROP`/`GRANT` on every object
it owns, not merely the grants a policy author lists. A W session for a stage that only
needs `ps01` fixture DML and the `ps01.subscription_audit_log` trigger toggle (F2) is
therefore *capable* of far more than that stage's task for as long as the membership
exists. W also inherits the M `net` managed-surface reach (L4).

**Base effective reach, every W role regardless of stage:** L6 ownership capability over
every object ownable by `ps01_migrator` (`ps01`, `ps01_internal`) **plus** the accepted
`net` managed-surface reach (L4), enumerated from H1:
`net._http_response` and `net.http_request_queue` each carry `PUBLIC`
`SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER`,
`net.http_request_queue_id_seq` carries `PUBLIC` `SELECT, USAGE, UPDATE`, schema `net`
carries `PUBLIC USAGE`, and all 12 installed `net` functions (including
`net.http_get/post/delete`, `net.worker_restart`, `net.wake`) are `EXECUTE`-able through
that schema `USAGE` (`H1-…:57-77`).

Per-stage exception, explicit and exhaustive — **this table is the sole allowlist source
consumed by the forbidden-reach gate (§3). No second constant list may appear in any
check, runbook, SQL file or tool.** No other exception may be added without amending this
table:

| Stage | W's allowed reach beyond the base | Everything else in `wstera_platform_internal`, `local_service`, `mt01`, `mt01_private`, `auth`, `vault` |
|---|---|---|
| `H3D-A1` | none | forbidden |
| `H3D-LIVE` | `wstera_platform_internal.runtime_token_grants` — `USAGE` on the schema, `SELECT/INSERT/DELETE` on that one table only | forbidden, including every other `wstera_platform_internal` object |

The §3 "forbidden reach (W)" check therefore takes the stage's row from this table as
its allowlist, addressed by **qualified identity or OID — never a bare `relname`**
(NEW-DEFECT-08). For `H3D-A1` the check includes `wstera_platform_internal` in the
forbidden set (L3 `USAGE` false); for `H3D-LIVE` it excludes only the one named relation
(L3 `USAGE` true, L2 restricted to `SELECT/INSERT/DELETE`). `ps01_internal` and `net`
reach is accepted as unavoidable under ownership-level membership / managed `PUBLIC`
(L6/L4) and bounded by G-STATIC-NOSHARED plus the H3F-style zero-delta re-measure — it is
not a table-DML-only credential, and no document in this package may describe it as one.

The §1a per-stage exception table is the **only** allowlist the forbidden-reach gate and
the create-runbook closing block consume (`G-ALLOWLIST-SINGLE-SOURCE`, §6).

Invariants across all classes:

1. **No product-direct LOGIN.** No class above is a product credential. Product roles
   (`ps01_line_runtime`, `ps01_runtime*`, `h4_runtime`, `h4_migrator`) stay `NOLOGIN`
   and no Lane-B step issues a password to them. Any stage that appears to need one
   STOPs (H2 invariant 1; Lane-B brief §13 hard stop).
2. **No persisted secret value.** M/W passwords are generated inside the SQL editor
   session by `gen_random_uuid()`-derived text, shown once, placed by the Owner in a
   scratch file outside every repository (`%TEMP%\lane-b\<window>.env`, user-only
   ACL), read into process env by the tool, and deleted at teardown. Never in
   `.secrets/keys.txt`, a vault, git, a command line, a log, a receipt, or evidence.
3. **Evidence records metadata only:** role name, attribute booleans, `VALID UNTIL`,
   grant list, measured provenance (§5), creation/teardown timestamps, sha256 of
   create/teardown SQL. Never a password, URL with credentials, JWT, or key.
4. **One writer per surface per window** (Lane-B brief §8). M and W for the same stage
   may coexist; W windows of different stages never overlap.
5. **F10 is accepted, bounded, and re-measured.** Every M/W role carries the managed
   `PUBLIC` object grants on `cron`/`net` (L2) and the accepted `net` effective reach
   (L4); W additionally carries `ps01_internal` ownership capability (L6) through
   `ps01_migrator` membership (§1a). Compensating controls: (a) the tool that uses the
   role is static-checked to issue no statement naming `cron`, `net`, `pg_net`,
   `http_`, `local_service.`, `mt01`, `vault.`, `auth.` (except the Auth API path, which
   is HTTP), or (for W) any `ps01_internal.` object outside what the stage's fixture SQL
   already names (§6 gate G-STATIC-NOSHARED); (b) the post-window H3F-style inventory
   shows zero `cron.job` / `net` / `ps01_internal` delta beyond the stage's declared
   changes. This does not close H1; H1 remains open (§7).

### 1b. The six layers — `SIX-LAYERS-SEPARATED`

Privilege is asserted **one layer at a time**. A gate may read one layer and must not
conclude about another. The layers, their catalog source, their assertion primitive and
their falsifier:

| Layer | Meaning | Read from | Assertion primitive | Falsified by |
|---|---|---|---|---|
| **L1 — catalog presence** | the object exists in the catalog, independent of any caller's privilege | `pg_catalog.pg_class` ⋈ `pg_catalog.pg_namespace` (never `information_schema.*`, which is privilege-filtered) | membership of the qualified identity `nspname.relname` (or OID) in a catalog-enumerated set | an object present in the catalog but absent from the enumerated set |
| **L2 — object grant** | an ACL privilege on the object, direct or via inherited role membership | `has_table_privilege` / `has_sequence_privilege` / `has_function_privilege` on the resolved OID | boolean per `(object, privilege)` | a grant true where the model claims false, or false where the model claims true |
| **L3 — schema `USAGE`** | the caller may reference objects in the schema by qualified name | `has_schema_privilege(role, nspname, 'USAGE')` | boolean per schema | `USAGE` true on a schema the model claims unreachable, or false on one it claims reachable |
| **L4 — effective reach** | the caller can actually name and exercise the object: **L2 ∧ L3** (plus membership/inheritance) | conjunction of the L2 and L3 primitives on the **same** qualified identity | membership of the qualified identity in the asserted reachable set | a qualified object reachable that is not in the set, or an asserted-reachable object that is not reachable |
| **L5 — RLS visibility** | which rows of a reachable relation the session may see | `pg_class.relrowsecurity` + `pg_roles.rolbypassrls`, plus the behavioural control | `measurable` / `UNMEASURED`; a count is never coerced | a relation counted as a number while its rows are invisible |
| **L6 — ownership capability** | abilities derived from owning the object/schema (owner may `ALTER`/`DROP`/`GRANT`, toggle triggers), beyond listed grants | `pg_class.relowner` / `pg_namespace.nspowner` + `pg_has_role(member_of_owner)` | ownership/membership predicate | claiming a listed-grant ceiling while ownership-derived reach exists |

Canonical separation (the model Rev4 got wrong, stated once and binding):

```text
catalog presence (L1)  !=  object grant (L2)  !=  schema USAGE (L3)  !=  effective reach (L4)
                       !=  RLS visibility (L5)  !=  ownership capability (L6)
```

Two consequences, both binding:

- **`has_table_privilege` answers L2, not L4.** Full reach is L2 ∧ L3 on the same
  qualified object. A check that reads `has_table_privilege` and reports "reachable" —
  or "not reachable" — without also asserting L3 has moved the error one layer down.
- **`has_schema_privilege` answers L3, not L4.** Schema `USAGE` on a schema whose objects
  have no applicable L2 grant confers no reach (and vice versa).

Every check in §3 names the layer(s) it asserts; a check that reads L1/L2 and concludes
about L4 is the defect this reconstruction removes.

## 2. Per-stage credential map

| Stage | Classes | Exact privilege boundary | Creation authority | Why not narrower |
|---|---|---|---|---|
| Pre-A1 remediation (this unit) | none | — | — | No live access is authorized. |
| `OWNER-CP-H3D-A1` preflight | M | §4 read set | Owner, in the A1 window | — |
| `H3D-A1` | M + W(`lane_b_rw_a1`) | W: member of `ps01_migrator` (seed/teardown owner DDL, F1/F2). **No** `runtime_token_grants` access, **no** Auth key — A1 creates no identity or grant. | Owner at `OWNER-CP-H3D-A1` | Teardown needs trigger DDL on `subscription_audit_log` (F2), which only the owner path can do. |
| `H3D-LIVE` | M + W(`lane_b_rw_live`) + A + T | W: member of `ps01_migrator` + `SELECT, INSERT, DELETE` on `wstera_platform_internal.runtime_token_grants` + `USAGE` on that schema. A: Admin API for run identities only. | Owner at `OWNER-CP-H3D-LIVE` | Needs fixture DML/DDL + grant rows + Auth identities (F4). |
| `H3E` | P (forward, rehearsal) + M (pre/post state) | P runs `h3e_*.sql` unchanged in the SQL editor. | Owner at `OWNER-CP-H3E` | `ALTER ROLE ps01_runtime_login` needs role administration (F6). |
| `H3F` | M + A (read: list users) | §4 read set incl. `storage.buckets`, `cron.job`, `supabase_migrations`. | Owner, H3F window (no Owner CP; role creation is still an Owner SQL-editor act) | Read-only. |
| `H4` | P (forward, rollback, grant-row insert/delete) + A + T + M | P for all DDL and the `h4_runtime_token_grants` row (F7). A for the one disposable identity. | Owner at `OWNER-CP-H4` | Grant table is owner-only by design (F7); keeps H4 on the platform lane per H2. |
| `H5` | M + A (read) + T (brief hook window) | read probes only | Owner, H5 window | Read-only + one smoke. |

The agent-held surfaces are therefore only **M**, **W**, **A** and **T**. Class **P**
never leaves the dashboard. (`G-NO-P-ON-AGENT`, §6, is preserved unchanged.)

### 2a. Per-stage teardown sequences for Auth/grant/token surfaces (Codex round 1, DEFECT-06)

§3's generic M/W runbook teardown (revoke grants → revoke membership → terminate
sessions → drop role) is necessary but not sufficient for `H3D-LIVE` and `H4`: both
also create Auth identities, runtime-grant rows, and (for `H4`) a hook, none of which
the generic template touches. Each of those has its own lifecycle and must be torn
down in this exact order, **before** the M/W database role teardown runs:

**`H3D-LIVE` teardown order — corrected from Codex round 2 (NEW-DEFECT-04): this is
the required safe operator sequence, not a description of current runner behaviour.**
Round 1's fix wrongly claimed this sequence "matches the runner's own ledgered
`--teardown-only` path". Verified against source: it does not.

- The runner's normal `--run` cleanup (`Ledger.cleanupAll()`, called from the
  `finally` block of `modeRun`, `h3d-live-runner.mjs:918-924`) deletes every ledgered
  Auth identity and grant row **concurrently** via `Promise.allSettled`
  (`h3d-live-runner.mjs:534-555`) — it does not disable the hook first, and it does
  not wait for token expiry; it runs automatically on both the success and the
  failure path of a live run.
- `modeTeardownOnly` (the `--teardown-only <uuid,uuid>` recovery path) only registers
  and cleans up the identity/grant resources for the given ids
  (`h3d-live-runner.mjs:981-989`); it likewise does not touch the hook or wait for
  expiry.
- Hook disable and the expiry wait are Operator Action Pack steps 11–12
  (`OPERATOR-ACTION-PACK-H3D-TO-H5-2026-09-09.md:99-103`), performed by the human
  operator **outside** the runner, after the runner's own cleanup has already run.

**Required sequence for this credential strategy** (operator + agent, in this order —
this is a policy requirement this package adds, not a claim about what the runner
already enforces; changing the runner to enforce this order in source is out of scope
for this unit and is not authorized here):

1. disable the Custom Access Token hook (operator, Dashboard) — **before** relying on
   any identity/grant cleanup, because the runner's own concurrent cleanup provides
   no ordering guarantee with the hook;
2. let (or force, via `--teardown-only`) the runner's concurrent identity + grant
   cleanup complete; treat any `residual_resources` it reports as still present, not
   as cleaned;
3. for anything still residual, delete it directly (class A for identities, class W
   for the grant row) and re-verify;
4. wait past `residualNarrowAuthorityUntil` (the latest issued token's `exp`) —
   record the wait, do not shortcut it;
5. independently re-verify zero owned identities/grants (class M, fresh session) —
   this is the actual closure proof; the runner's own report is a claim, not evidence
   (`BATCH-H3D-S` §8 discipline);
6. **only then** run the class-W fixture teardown (F1/F2) and the M/W runbook
   teardown from §3.

**`H4` teardown order** (already specified in source at
`h4_disposable_product_rollback.sql:1-5` and `BRIEF-H4-DISPOSABLE-PRODUCT-PROOF-2026-09-09.md`
§6 — restated here so the credential strategy does not contradict it, per Codex round
1 DEFECT-06):

1. delete the disposable H4 Auth identity + its sessions (class A, operator-directed);
2. delete the `h4_runtime_token_grants` row (class P — the table is owner-only by F7);
3. disable the hosted hook; wait past the last issued token's `exp`, or prove
   rejection;
4. restore the exact pre-H4 `pgrst.db_schemas` string (operator, Dashboard);
5. run `h4_disposable_product_rollback.sql` (class P, platform SQL editor — see
   `VERIFICATION-H2-H4-CONSISTENCY-2026-09-22.md` G-H4-5 for the actor gap this
   depends on resolving before `OWNER-CP-H4`);
6. re-run the inventory/compare tooling (class M) and require signature match.

Both sequences end in an M-class re-measurement, not merely the actor's report,
consistent with `BATCH-H3D-S` §8's stated limitation that a report alone is not
closure.

### Consequence for existing source — required changes (prepared in the B brief, not here)

F1 and F3 hard-bind the fixture path to `postgres`, which this policy removes from the
agent side. Required source changes, all offline, none executed:

- seed/teardown identity assertion: replace `current_user = 'postgres'` with an
  assertion of the W shape — `current_user LIKE 'lane_b_rw_%'`, not superuser, not
  `rolbypassrls`, `pg_has_role(current_user,'ps01_migrator','MEMBER')` (**L6**), and
  **no** `USAGE` on `local_service`, `mt01`, `mt01_private`, `auth`, `vault` (**L3**)
  (the schemas the `postgres` credential could reach — `BATCH-H3D-S` §8.2).
- runner `assertDbIdentity()`: same W-shape assertion instead of `postgres`, plus the
  stage-specific extras (runtime-grant privileges for `H3D-LIVE` only).
- H3E/H4 SQL keep their `postgres` assertion — they run on class P.

## 3. Runbook templates (to be authored as files by AGY; executed only at the owning checkpoint)

For each M/W role the unit that needs it ships two SQL files, both reviewed before the
window opens:

- `runbooks/lane-b-role-<name>-create.sql` — `CREATE ROLE … LOGIN … VALID UNTIL …
  CONNECTION LIMIT …`; each `GRANT` on its own line; a closing `DO` block that
  **asserts behaviour, and names the layer it asserts**:
  - **L2** — `has_table_privilege(current_user, <oid>, …)` / `has_sequence_privilege(…)`
    true for every intended object grant;
  - **L3** — `has_schema_privilege(current_user, <schema>, 'USAGE')` exactly as the
    class/stage requires (true for `ps01`, `ps01_internal`, and — `H3D-LIVE` only —
    `wstera_platform_internal`; false for `local_service`, `mt01`, `mt01_private`,
    `auth`, `vault`);
  - **L4** — the conjunction L2 ∧ L3 for the stage's named `wstera_platform_internal`
    exception relation only;
  - **L6** — `pg_has_role(current_user, 'ps01_migrator', 'MEMBER')` exactly as the class
    requires;
  - **attribute** — `rolbypassrls` exactly as the class requires;
  - the forbidden set is read from the **§1a per-stage exception table only**
    (`G-ALLOWLIST-SINGLE-SOURCE`).
- `runbooks/lane-b-role-<name>-teardown.sql` — in this order:
  1. `REVOKE` every grant from the create file, one line each, **generated from the
     create file** so the two cannot diverge (gate G-REVOKE-MIRROR, §6);
  2. `REVOKE ps01_migrator FROM <role>` where granted (**L6**);
  3. `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE usename = '<role>'`;
  4. `DROP ROLE <role>` — **never** `DROP OWNED BY` (F9);
  5. closing assertion: `NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '<role>')`
     (**L1 — catalog presence of the role itself**).

Injection: the Owner saves the one-time password to the scratch env file (§1 inv. 2);
the tool reads `LANE_B_DB_URL` built from non-secret host/user parts plus that file;
the pooler username `<role>.<project_ref>` carries the ref that §5 measures.

Verification at window open, before any gate runs (all must pass or the window closes).
**Every row states the one layer it asserts; no row concludes about a layer it did not
read:**

| Check | Layer asserted (of the six) | Assertion — behaviour, not settings |
|---|---|---|
| target | *none — provenance gate, not a privilege layer* | §5 provenance: measured ref = `ykxlqnshaaxmzzocpjlj`, both from the connection and from the database. |
| identity | *none — session-identity gate, not a privilege layer* | `current_user` = the planned role; `session_user` = same. |
| visibility (M) | **L5** (RLS visibility), preconditioned on **L4** (SELECT reach) with `BYPASSRLS` | `SELECT count(*) FROM ps01.commercial_packages` = `3` (F12). A role that reads 0 is RLS-blind → window STOPs; the count is `UNMEASURED`, never `0`-as-PASS. |
| no real-table write privilege (M, W) | **L2** (object grant). L3 for the same schema is asserted by the create-runbook block and by the forbidden-reach row; **L4 is not inferred from this row alone** | Forbidden-write relation universe = **product/data relations only** (`ps01` `r`/`p`), enumerated from `pg_catalog` by qualified identity/OID (§3a): for M, every `ps01` table; for W, every `ps01` table outside the stage's declared fixture DML set. This universe **excludes** `cron`/`net` (accepted managed surface: L2 object grants + accepted `net` L4 reach), `ps01_internal` (accepted L6 ownership capability), and the stage's named `wstera_platform_internal` exception row (§1a). For every relation in the universe, assert `has_table_privilege(current_user, c.oid, p) = false` for **each** of `p ∈ {'INSERT','UPDATE','DELETE','TRUNCATE'}` — all four retained. Any `true` → window STOPs before any gate runs. (Closes `NEW-DEFECT-03` — four privileges, not only `INSERT` — and `NEW-DEFECT-07` — accepted surfaces excluded.) |
| accepted exposure — **effective reach** (Contract A, §3c) | **L4** = **L2 ∧ L3** | The accepted managed surface is asserted as an **exact qualified effective-reach set**, schema `USAGE` included: `has_schema_privilege(current_user, n.nspname, 'USAGE')` for `n.nspname ∈ {'cron','net'}`, then for each reachable (`L2 ∧ L3`) `r`/`p`/`S` relation, its qualified identity must be in the documented effective-reach set `{net._http_response, net.http_request_queue, net.http_request_queue_id_seq}`; `cron.job` / `cron.job_run_details` carry L2 grants but are **not** reachable because L3 schema `cron` `USAGE` is not held. Any reachable relation outside the set, **or** a change in the schema-`USAGE` classification (e.g. `cron` `USAGE` measuring true, contrary to `H1-…:81-85`) → window STOPs and returns to the Owner. Described as accepted + bounded + re-measured, never as absent. |
| accepted exposure — **catalog-surface inventory** (Contract B, §3c) | **L1** (catalog presence) — **never described as reach** | Enumerate `r`/`p`/`S` in `cron`/`net` from `pg_catalog` by qualified identity and compare as an **exact qualified set** against the documented catalog baseline `{cron.job (r), cron.job_run_details (r), net._http_response (r), net.http_request_queue (r), net.http_request_queue_id_seq (S)}`. Any extra relation → window STOPs (a new managed-ACL surface, not previously accepted). This row asserts catalog presence only; it is **not** an effective-reach assertion (that is the row above). |
| forbidden reach (W) | **L3** (schema `USAGE`) for the always-forbidden schemas; **L1** (enumeration) then **L2** (object grant) for `wstera_platform_internal`; **L4** follows only from L2 ∧ L3 | For each forbidden schema `s ∈ {'local_service','mt01','mt01_private','auth','vault'}` (always forbidden, every stage): `has_schema_privilege(current_user, s, 'USAGE') = false` — **L3**. For `wstera_platform_internal`, enumerate **all** relations from `pg_catalog` (**L1**) — `c.relkind IN ('r','p','S','f')`, `r`/`p` first, then sequences `S` and foreign tables `f` enumerated **separately** (per-kind privilege primitives, §3a) — selecting the qualified identity `n.nspname, c.relname` **and** `c.oid` (never a bare `relname`; `NEW-DEFECT-08`). Then, by OID: for `r`/`p` assert `has_table_privilege(current_user, c.oid, p)` for all **seven** `p`; for `S` assert `has_sequence_privilege(current_user, c.oid, p)` for `{SELECT,USAGE,UPDATE}`; for `f` the foreign-table privilege set. `H3D-A1`: all seven (resp. per-kind set) `false` on every relation, and `has_schema_privilege(…,'wstera_platform_internal','USAGE') = false`. `H3D-LIVE`: schema `USAGE` = true (**L3** required for the exception to be **L4**-reachable), and for the exception relation identified by `n.nspname='wstera_platform_internal' AND c.relname='runtime_token_grants'` assert `{'SELECT','INSERT','DELETE'} → true` **and** `{'UPDATE','TRUNCATE','REFERENCES','TRIGGER'} → false`; every other enumerated relation still requires the full per-kind set `false`. The forbidden allowlist is read from the **§1a per-stage table only**. |
| trigger-DDL capability (W) | **L6** (ownership capability) | Required before any stage that uses F2 (fixture teardown) proceeds under class W. See §3b for the exact bounded, guaranteed-teardown execution contract (`EXECUTABLE-PROBE-CONTRACT`). |
| connection-level read-only behaviour (M only, where the tool still wants the compensating control of F11) | *not a gate — diagnostic, asserts no layer* | `CREATE TEMP TABLE lane_b_probe(x int); INSERT INTO lane_b_probe VALUES (1); DROP TABLE lane_b_probe;` — session-local, never touches shared storage, safe to succeed or fail either way. Its *purpose* is to distinguish "role genuinely cannot write" (the L2 STOP above) from "pooler silently dropped a read-only setting" (F11). Its result is recorded, not enforced. |

#### 3.0 Qualified-identity SQL (the primitive every row above consumes) — `NO-BARE-RELNAME`

No reconstructed check compares a bare `relname`. Every relation is addressed by its
**OID** or by the **pair** `(n.nspname, c.relname)`, and every privilege primitive
receives the OID (`NEW-DEFECT-08`, `NEW-DEFECT-06`):

```sql
-- Catalog enumeration (L1). pg_catalog, not information_schema (privilege-filtered).
SELECT c.oid AS reloid, n.nspname AS nspname, c.relname AS relname, c.relkind AS relkind
FROM pg_catalog.pg_class c
JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = ANY($1)          -- e.g. '{ps01}' | '{wstera_platform_internal}' | '{cron,net}'
  AND c.relkind IN ('r','p','S','f')   -- r/p = tables; S = sequences; f = foreign tables (enumerated separately)
ORDER BY n.nspname, c.relkind, c.relname;

-- L2 object-grant primitive — by OID, never by a bare name.
--   r/p: has_table_privilege(current_user, reloid, p) for p in
--        {'SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER'}
--   S:   has_sequence_privilege(current_user, reloid, p) for p in {'SELECT','USAGE','UPDATE'}
--   f:   has_table_privilege(current_user, reloid, p) for the foreign-table privilege set
-- L3 schema primitive:
--   SELECT n.nspname, has_schema_privilege(current_user, n.nspname, 'USAGE')
--   FROM pg_catalog.pg_namespace n WHERE n.nspname = ANY($1);
```

`has_table_privilege(current_user, '<schema>.<rel>')` is **not** used: a string without a
schema resolves through the session `search_path` and is exactly the
`NEW-DEFECT-08` defect. The exception relation is matched by
`n.nspname = 'wstera_platform_internal' AND c.relname = 'runtime_token_grants'`
(qualified pair) or by its resolved OID.

#### 3.1 Two separate, labelled contracts — `EFFECTIVE-REACH-VS-CATALOG-INVENTORY`

The accepted/exposure assertions above are **two distinct contracts**. They are not
alternatives; both exist, and conflating them was `NEW-DEFECT-09`:

- **Contract A — effective-reach assertion.** Schema-qualified relation identity
  (`nspname.relname`) or OID; the schema `USAGE` distinction (L3); the object privilege
  set for that exact relation (L2). Reach is asserted as L2 ∧ L3. Used by the
  "accepted exposure — effective reach" row and by the forbidden-reach row's L4
  conclusions.
- **Contract B — catalog-surface inventory.** What exists in the catalog (L1). It is
  **never described as effective reach** and is never used to conclude about L4. Used by
  the "catalog-surface inventory" row.

Choosing one contract *per assertion* is mandatory (`NEW-DEFECT-09`); stating both,
separately labelled, is mandatory (`OWNER-RULING` §3).

### 3b. Trigger-DDL capability probe — executable execution contract (`EXECUTABLE-PROBE-CONTRACT`; closes NEW-DEFECT-05)

Round 2 stated bounds and rollback in prose; round 3 found the stated
`statement_timeout` (10s) did not match the real teardown's 30s
(`fixtures/h3d-authz-fixture-teardown.sql:21-23`, alongside `lock_timeout='4s'` and
`idle_in_transaction_session_timeout='30s'`); round 4 found `client.connect()` sat
outside the `try/finally`, so a failure **inside `connect()`** was not covered. All three
are corrected below as the executable specification AGY implements. **The probe asserts
L6 (ownership capability): only a table owner can `ALTER TABLE … DISABLE/ENABLE
TRIGGER`.**

The bounds **match the real teardown exactly**: `lock_timeout = '4s'`,
`statement_timeout = '30s'`, `idle_in_transaction_session_timeout = '30s'`. The wrapper
below guarantees session termination on **every** path — success, `42501`, a
`lock_timeout`/`statement_timeout` abort, an unexpected rethrow, **and a throw from
`client.connect()`** — because the connect is now **inside** the outer guard whose
`finally` always runs:

```js
// Guaranteed-teardown wrapper. `client.end()` runs on EVERY exit path, including a
// throw from client.connect(). If connect() rejected after opening a socket, end()
// still closes it; if no socket exists, end() is a no-op. A bounded race prevents a
// wedged socket from hanging the wrapper.
async function endGuaranteed(client, ms = 5000) {
  await Promise.race([
    client.end().catch(() => {}),
    new Promise((resolve) => setTimeout(resolve, ms)),
  ]);
}

async function withRoleSession(wRoleUrl, fn) {
  const client = new Client({ connectionString: wRoleUrl });
  try {
    await client.connect();            // INSIDE the guard: a failure here is covered
    return await fn(client);
  } finally {
    await endGuaranteed(client);        // runs on success, error, timeout, and connect() failure
  }
}

async function probeTriggerDdl(wRoleUrl) {
  return withRoleSession(wRoleUrl, async (client) => {
    let result;
    try {
      await client.query('BEGIN');
      // Bounds identical to fixtures/h3d-authz-fixture-teardown.sql:21-23.
      await client.query(`SET LOCAL lock_timeout = '4s'`);
      await client.query(`SET LOCAL statement_timeout = '30s'`);
      await client.query(`SET LOCAL idle_in_transaction_session_timeout = '30s'`);
      await client.query('ALTER TABLE ps01.subscription_audit_log DISABLE TRIGGER trg_subscription_audit_immutable');
      await client.query('ALTER TABLE ps01.subscription_audit_log ENABLE TRIGGER trg_subscription_audit_immutable');
      result = { capable: true };
    } catch (e) {
      result = /42501/.test(e.code) ? { capable: false, code: e.code }
             : /55P03|57014/.test(e.code) ? { capable: 'UNMEASURED', code: e.code }
             : (() => { throw e; })();   // unexpected error -> rethrown, still torn down by the outer finally
    } finally {
      try { await client.query('ROLLBACK'); } catch {
        // No ROLLBACK possible (socket gone). PostgreSQL aborts the still-open
        // server-side transaction on client disconnect, so the DDL cannot persist.
      }
    }
    return result;
  });
}
```

What makes the probe harmless, stated as an executable property rather than prose:

1. **Bounded lock wait.** `lock_timeout = '4s'` aborts the `ACCESS EXCLUSIVE` acquisition
   within 4s instead of blocking indefinitely; the abort raises `55P03`.
2. **Bounded statement.** `statement_timeout = '30s'` and
   `idle_in_transaction_session_timeout = '30s'` match the real teardown's own bounds, so
   the probe's behaviour is directly comparable to production use — not merely "some
   bound".
3. **Guaranteed session termination.** `client.end()` is in the outer `finally`, which
   every path reaches, **including a throw from `client.connect()`** (the round-4 gap).
   The bounded race means a wedged socket cannot hang the wrapper.
4. **Guaranteed catalog non-persistence.** The two DDL statements run inside one
   transaction; `ROLLBACK` discards them. If the socket is gone, the server aborts the
   open transaction on disconnect. Either way no disabled-trigger state can persist
   (the teardown's own `tgenabled='O'` re-check remains the independent backstop).

Result handling: `capable: 'UNMEASURED'` is recorded as lock contention, not as a
capability answer, and does not STOP the window on its own (retry once outside the
window-open gate, or treat as inconclusive for this window). `capable: false`
(`42501`) STOPs the window: **do not fall back to class P**; this is the "inability to
prove a finding closed without a mutation belonging to a later checkpoint" stop
condition in the Owner decision §5, and the new credential decision returns to the
Owner. `capable: true` allows the window to proceed to F1/F2 fixture work.

Teardown verification: the closing assertion in the teardown file, **plus** an
independent re-measure by the next M role or H3F inventory showing the role absent.
The Owner's report alone is not closure (`BATCH-H3D-S` §8 limitation).

## 4. RLS measurability handling (**L5**)

Policy: **a count is evidence only if the measuring session is proven able to see
every row of that table.** Otherwise the result is `UNMEASURED`, and `UNMEASURED`
is never `PASS`. This section asserts **L5** only; the L4 precondition
(`has_table_privilege(…,'SELECT')`) is read to decide measurability, not to conclude
reach.

- M roles carry `BYPASSRLS` (justified in `BATCH-H3D-S` §8.3: read visibility, no
  write). W roles do **not**; W never produces counted evidence.
- Measurability is decided per table by the tool, from the live catalog:
  `has_table_privilege(current_user, t.oid, 'SELECT')` AND (`NOT relrowsecurity` OR
  `rolbypassrls` of `current_user`). Plus the session-level behavioural control
  (`commercial_packages = 3`). Either failing → that table `UNMEASURED`. (The
  relation is addressed by OID — `NEW-DEFECT-08` — so no measurability decision
  resolves a name through `search_path`.)
- `auth.users` is never counted through SQL. It is measured through the Auth Admin
  API (class A, GET only) — see the B brief, finding 3.

## 5. Provenance

Every connection made by Lane-B tooling must measure its target **before** issuing a
gate query, and record the measured value, not a constant:

- `connection_ref` — parsed from the actual connection parameters (pooler user suffix
  `.<ref>` or host `db.<ref>.supabase.co`); user and host must agree when both carry
  a ref; missing/ambiguous → STOP before connecting.
- `database_ref_evidence` — a database-side value that differs between two
  schema-identical projects, read after connecting. The B brief lets AGY select the
  mechanism, subject to a live-readability check at the A1 preflight.
- Mismatch between either value and `LAB_REF` → STOP, exit non-zero, no gate output
  labelled as LAB.

## 6. Gates this policy adds

| Gate | Checks |
|---|---|
| G-STATIC-NOSHARED | every tool that runs under M/W contains no SQL naming `cron.`, `net.`, `pg_net`, `http_request`, `local_service.`, `mt01`, `vault.`, `auth.` (except the Auth API path, which is HTTP), or `ps01_internal.` outside the stage's declared fixture SQL (§1a). |
| G-REVOKE-MIRROR | a selftest parses each create runbook and its teardown; every `GRANT` has exactly one mirrored `REVOKE`; teardown contains no `DROP OWNED`. |
| G-NO-SECRET-AT-REST | blocking assignment-shape secret scan (`HANDOFF` §5) over the diff and evidence = 0. |
| G-NO-P-ON-AGENT | no Lane-B tool or runbook reads `BILLING_DATABASE_URL`, `SUPABASE_DB_PASSWORD_WSTERA_LAB`, or accepts `current_user = 'postgres'` outside the H3E/H4 platform SQL files. |
| G-ALLOWLIST-SINGLE-SOURCE | the §1a per-stage exception table is the **sole** allowlist source: a selftest asserts the forbidden-reach check and every create-runbook closing block read their forbidden set from that table and that **no second constant list** of forbidden schemas/relations exists in any check, runbook, SQL file or tool. |
| G-NO-BARE-RELNAME | a selftest asserts no reconstructed check compares a bare `relname`: every relation is addressed by `c.oid` or by the pair `(n.nspname, c.relname)`, and every privilege primitive receives the OID. |

## 7. What this policy does not do

- It does not close H1 (F10). It bounds exposure per window and re-measures it.
- It does not authorize creating any role. Each role is created only inside the
  window of the Owner checkpoint listed in §2.
- It does not change H3E/H4 migration SQL; those remain class P, platform lane.

## 8. Unverified assumption — resolved only in the A1 window

Class W assumes the LAB `postgres` role can `GRANT ps01_migrator TO lane_b_rw_*`
(i.e. holds `ADMIN OPTION` on `ps01_migrator`). This cannot be measured without live
access, which this unit does not have. The create runbook's closing assertion tests it
behaviourally (**L6**: `pg_has_role(role,'ps01_migrator','MEMBER')` after the grant).

If it fails, the fixture path cannot run under class W, and the only remaining shape
is class P on the agent side — which §1 forbids. That is a **new security decision**
and the run STOPs to the Owner; it is not silently resolved by using `postgres`.

## 9. Open-finding closure map (`OPEN-FINDINGS-ADDRESSED-BY-NAME`)

The five findings Codex leaves open at round 4 (`LEDGER-LANE-B-FINDING-FAMILIES-2026-09-22.md`
§5, `OPEN_SET_IS_FIVE`) are each addressed by name in this reconstruction:

| Finding | Family | Where it is closed in this file | Substance of the correction |
|---|---|---|---|
| `NEW-DEFECT-03` | F2 | §3 "no real-table write privilege" row; §1a inv. 5 | The forbidden-write check retains **all four** write privileges (`INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`) on the forbidden product/data universe, and separates `cron`/`net` from that universe so a correctly-shaped role no longer fails on accepted exposure. |
| `NEW-DEFECT-05` | F3 | §3b | The trigger-DDL probe is an **executable** contract: bounds `lock_timeout='4s'` + `statement_timeout='30s'` matching `fixtures/h3d-authz-fixture-teardown.sql:21-23`, and a wrapper whose `finally` runs on every path **including a throw from `client.connect()`**. Harmlessness is a property of the code, not prose. |
| `NEW-DEFECT-06` | F2 | §1a; §3 forbidden-reach row; §3.0 | The `wstera_platform_internal` boundary is proven from a **non-privilege-filtered** `pg_catalog` enumeration covering `r`/`p`/`S`/`f` (sequences and foreign tables separately), and the allowed relation asserts `SELECT/INSERT/DELETE = true` **and** `UPDATE/TRUNCATE/REFERENCES/TRIGGER = false`, with every other relation asserting the full per-kind set `false`. |
| `NEW-DEFECT-08` | F2 | §3.0; §3 forbidden-reach row; §1a | No check compares a bare `relname`: enumeration returns `c.oid` **and** `(n.nspname, c.relname)`, the exception is matched by the qualified pair or OID, and `has_table_privilege`/`has_sequence_privilege` receive the OID. |
| `NEW-DEFECT-09` | F2 | §3.1; §3 accepted-exposure rows | The accepted-exposure assertion is split into two separate labelled contracts — **Contract A** effective reach (L2 ∧ L3) and **Contract B** catalog-surface inventory (L1) — never conflated, each chosen explicitly per assertion. |

The model error behind `NEW-DEFECT-03`/`-06`/`-08`/`-09` (one declared-grant-list model
surviving four revisions) is replaced, not patched: §1b's six layers and §3's per-row
"layer asserted" column are the replacement. `NEW-DEFECT-05` is the second, narrower
root cause and is replaced by §3b's executable wrapper.
