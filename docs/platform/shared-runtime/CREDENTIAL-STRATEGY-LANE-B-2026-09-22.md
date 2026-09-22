# CREDENTIAL STRATEGY — LANE B, ALL REMAINING STAGES

Date: 2026-09-22
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Author: Claude (Windows) — Lane-B controller
Authority: `OWNER-DECISION-LANE-B-PRE-A1-REMEDIATION-2026-09-22.md` §3.A
Status: `CONTROLLER DRAFT — AWAITING CODEX INDEPENDENT REVIEW`
Execution baseline read: `work/house-h3d-h5-20260909 @ 2b1af861aa608f08abb0bd8224821b9ca5ac9981`

This document **defines** roles and runbooks. It creates nothing. No LAB role,
credential, grant, Auth setting or row is created or changed by it or by any unit that
cites it before the Owner checkpoint that stage belongs to.

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
| F7 | `h4_runtime_token_grants` is `REVOKE ALL` from every role except its owner; only the platform `postgres` session can insert the H4 grant row. | `h4_disposable_product_forward.sql` token-support block |
| F8 | `lab-readonly-inventory.mjs` reads `auth.users`, `storage.buckets`, `cron.job`, `supabase_migrations.schema_migrations`. `storage.buckets` and `cron.job` carry RLS in Supabase; `auth.users` returned `42501` to a granted role. | `lab-readonly-inventory.mjs:151-208`; `BATCH-H3D-S` §3, §6 |
| F9 | Supabase `postgres` is not a true superuser: `DROP OWNED BY` for another role is refused (`42501`); teardown needs a mirrored explicit `REVOKE` list. | `BATCH-H3D-S` §8 teardown |
| F10 | Any role created in LAB inherits write on `cron` (1 table) and `net` (2 tables) through the managed `PUBLIC` ACL at creation. This cannot be avoided by grant scoping. | `BATCH-H3D-S` §7 |
| F11 | The Supabase pooler drops `options=` and ignores `ALTER ROLE … SET`; connection-level read-only cannot be enforced. | `ANALYSIS` B1 |
| F12 | `ps01.commercial_packages` holds 3 reference rows behind RLS (`{authenticated}` policy). A role without RLS bypass reads 0. | `BATCH-H3D-S` §3, §5 |

## 1. Credential classes

Every Lane-B credential falls into exactly one class. A stage may use only the
classes listed for it in §2.

| Class | Name pattern | Shape | Lifetime |
|---|---|---|---|
| **M — measurement** | `lane_b_measure_<stage>` | `LOGIN`, `NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION`, **`BYPASSRLS`**, `CONNECTION LIMIT 2`, `VALID UNTIL` ≤ window end. `USAGE` + `SELECT` only on the schemas/tables the stage's gates read (§4). No `INSERT/UPDATE/DELETE/TRUNCATE` anywhere; no role membership. | ephemeral, one window |
| **W — scoped write** | `lane_b_rw_<stage>` | `LOGIN`, no superuser/createdb/createrole/replication, **no `BYPASSRLS` attribute**, `CONNECTION LIMIT 3`, `VALID UNTIL` ≤ window end. Membership `ps01_migrator` (`INHERIT TRUE, SET TRUE`) **only** where F1/F2 owner DDL is required; stage-specific table DML otherwise (§2). No other schema. | ephemeral, one window |
| **A — Auth admin** | env `H3D_SERVICE_KEY` / `LANE_B_AUTH_ADMIN_KEY` ← `.secrets` `SUPABASE_SECRET_KEY_WSTERA_LAB` | Project secret key. Supabase offers no narrower Auth-admin credential — this is a **platform ceiling**, recorded not waived. Used only by agent tooling for `/auth/v1/admin/*`; never passed to a child process, harness, product, browser, or evidence. | existing key; per-window use only |
| **P — platform admin** | LAB `postgres` | Role DDL and platform-owned migrations only (F6, F7). **Executed by the Owner in the Supabase SQL editor.** The agent never holds this credential in any Lane-B stage. `BILLING_DATABASE_URL` and `SUPABASE_DB_PASSWORD_WSTERA_LAB` are **not** injected into any agent process. | none on agent side |
| **T — product token** | JWT, `role = ps01_line_runtime` / `h4_runtime` | Auth-issued through the hook, ≤ 300 s, held in memory / minimal child env only. | ≤ 5 min |

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
   `PUBLIC` write on `cron`/`net`. Compensating controls: (a) the tool that uses the
   role is static-checked to issue no statement naming `cron`, `net`, `pg_net` or
   `http_` (§6 gate G-STATIC-NOSHARED); (b) the post-window H3F-style inventory shows
   zero `cron.job` / `net` delta. This does not close H1; H1 remains open (§7).

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
never leaves the dashboard.

### Consequence for existing source — required changes (prepared in the B brief, not here)

F1 and F3 hard-bind the fixture path to `postgres`, which this policy removes from the
agent side. Required source changes, all offline, none executed:

- seed/teardown identity assertion: replace `current_user = 'postgres'` with an
  assertion of the W shape — `current_user LIKE 'lane_b_rw_%'`, not superuser, not
  `rolbypassrls`, `pg_has_role(current_user,'ps01_migrator','MEMBER')`, and **no**
  `USAGE` on `local_service`, `mt01`, `mt01_private`, `auth`, `vault` (the schemas the
  `postgres` credential could reach — `BATCH-H3D-S` §8.2).
- runner `assertDbIdentity()`: same W-shape assertion instead of `postgres`, plus the
  stage-specific extras (runtime-grant privileges for `H3D-LIVE` only).
- H3E/H4 SQL keep their `postgres` assertion — they run on class P.

## 3. Runbook templates (to be authored as files by AGY; executed only at the owning checkpoint)

For each M/W role the unit that needs it ships two SQL files, both reviewed before the
window opens:

- `runbooks/lane-b-role-<name>-create.sql` — `CREATE ROLE … LOGIN … VALID UNTIL …
  CONNECTION LIMIT …`; each `GRANT` on its own line; a closing `DO` block that
  **asserts behaviour**: `has_*_privilege` for every intended grant true, for every
  forbidden schema false, `rolbypassrls` exactly as the class requires, and
  `pg_has_role` membership exactly as the class requires.
- `runbooks/lane-b-role-<name>-teardown.sql` — in this order:
  1. `REVOKE` every grant from the create file, one line each, **generated from the
     create file** so the two cannot diverge (gate G-REVOKE-MIRROR, §6);
  2. `REVOKE ps01_migrator FROM <role>` where granted;
  3. `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE usename = '<role>'`;
  4. `DROP ROLE <role>` — **never** `DROP OWNED BY` (F9);
  5. closing assertion: `NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '<role>')`.

Injection: the Owner saves the one-time password to the scratch env file (§1 inv. 2);
the tool reads `LANE_B_DB_URL` built from non-secret host/user parts plus that file;
the pooler username `<role>.<project_ref>` carries the ref that §5 measures.

Verification at window open, before any gate runs (all must pass or the window closes):

| Check | Assertion — behaviour, not settings |
|---|---|
| target | §5 provenance: measured ref = `ykxlqnshaaxmzzocpjlj`, both from the connection and from the database. |
| identity | `current_user` = the planned role; `session_user` = same. |
| visibility (M) | `SELECT count(*) FROM ps01.commercial_packages` = `3` (F12). A role that reads 0 is RLS-blind → window STOPs. |
| no write (M) | `BEGIN; SET LOCAL lock_timeout='1s'; LOCK TABLE ps01.shops IN ROW EXCLUSIVE MODE; ROLLBACK;` must fail `42501`. `ROW EXCLUSIVE` requires a write privilege; if the role wrongly has one, the probe only takes and releases a lock — it cannot write a row. |
| forbidden reach (W) | `LOCK TABLE local_service.<any table> IN ACCESS SHARE MODE` inside a rolled-back txn must fail `42501`. |

Teardown verification: the closing assertion in the teardown file, **plus** an
independent re-measure by the next M role or H3F inventory showing the role absent.
The Owner's report alone is not closure (`BATCH-H3D-S` §8 limitation).

## 4. RLS measurability handling

Policy: **a count is evidence only if the measuring session is proven able to see
every row of that table.** Otherwise the result is `UNMEASURED`, and `UNMEASURED`
is never `PASS`.

- M roles carry `BYPASSRLS` (justified in `BATCH-H3D-S` §8.3: read visibility, no
  write). W roles do **not**; W never produces counted evidence.
- Measurability is decided per table by the tool, from the live catalog:
  `has_table_privilege(current_user, t, 'SELECT')` AND (`NOT relrowsecurity` OR
  `rolbypassrls` of `current_user`). Plus the session-level behavioural control
  (`commercial_packages = 3`). Either failing → that table `UNMEASURED`.
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
| G-STATIC-NOSHARED | every tool that runs under M/W contains no SQL naming `cron.`, `net.`, `pg_net`, `http_request`, `local_service.`, `mt01`, `vault.`, `auth.` (except the Auth API path, which is HTTP). |
| G-REVOKE-MIRROR | a selftest parses each create runbook and its teardown; every `GRANT` has exactly one mirrored `REVOKE`; teardown contains no `DROP OWNED`. |
| G-NO-SECRET-AT-REST | blocking assignment-shape secret scan (`HANDOFF` §5) over the diff and evidence = 0. |
| G-NO-P-ON-AGENT | no Lane-B tool or runbook reads `BILLING_DATABASE_URL`, `SUPABASE_DB_PASSWORD_WSTERA_LAB`, or accepts `current_user = 'postgres'` outside the H3E/H4 platform SQL files. |

## 7. What this policy does not do

- It does not close H1 (F10). It bounds exposure per window and re-measures it.
- It does not authorize creating any role. Each role is created only inside the
  window of the Owner checkpoint listed in §2.
- It does not change H3E/H4 migration SQL; those remain class P, platform lane.

## 8. Unverified assumption — resolved only in the A1 window

Class W assumes the LAB `postgres` role can `GRANT ps01_migrator TO lane_b_rw_*`
(i.e. holds `ADMIN OPTION` on `ps01_migrator`). This cannot be measured without live
access, which this unit does not have. The create runbook's closing assertion tests it
behaviourally (`pg_has_role(role,'ps01_migrator','MEMBER')` after the grant).

If it fails, the fixture path cannot run under class W, and the only remaining shape
is class P on the agent side — which §1 forbids. That is a **new security decision**
and the run STOPs to the Owner; it is not silently resolved by using `postgres`.
