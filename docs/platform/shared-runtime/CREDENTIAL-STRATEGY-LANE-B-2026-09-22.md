# CREDENTIAL STRATEGY — LANE B, ALL REMAINING STAGES

Date: 2026-09-22
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Author: Claude (Windows) — Lane-B controller
Authority: `OWNER-DECISION-LANE-B-PRE-A1-REMEDIATION-2026-09-22.md` §3.A
Status: `CONTROLLER DRAFT REV2 — CORRECTS DEFECT-02/03/04/05/06/10 FROM CODEX ROUND 1 (REVIEW-CODEX-LANE-B-CONTROLLER-PACKAGE-2026-09-22.md) — AWAITING CODEX INDEPENDENT REVIEW`
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
| F7 | `h4_runtime_token_grants` is `REVOKE ALL` from a finite named list (`PUBLIC, anon, authenticated, service_role, authenticator, ps01_migrator, ps01_runtime, ps01_runtime_login, ps01_line_runtime, h4_migrator, h4_runtime`) and separately `GRANT SELECT` to `supabase_auth_admin`. This is not a proven all-roles statement — the source does not assert "no other role can access this table" as a catalog check. Owner (`h4_migrator`, by `CREATE TABLE` ownership) can still write it; only the platform `postgres` session (which owns/administers `h4_migrator`) can insert the H4 grant row in practice. | `h4_disposable_product_forward.sql:83-95` |
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
| **M — measurement** | `lane_b_measure_<stage>` | `LOGIN`, `NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION`, **`BYPASSRLS`**, `CONNECTION LIMIT 2`, `VALID UNTIL` ≤ window end. `USAGE` + `SELECT` only on the schemas/tables the stage's gates read (§4). No **intended** `INSERT/UPDATE/DELETE/TRUNCATE` grant anywhere; no role membership. **Effective privilege is broader than the intended grant** — see §1a. | ephemeral, one window |
| **W — scoped write** | `lane_b_rw_<stage>` | `LOGIN`, no superuser/createdb/createrole/replication, **no `BYPASSRLS` attribute**, `CONNECTION LIMIT 3`, `VALID UNTIL` ≤ window end. Membership `ps01_migrator` (`INHERIT TRUE, SET TRUE`) **only** where F1/F2 owner DDL is required. **This membership is an ownership-level capability, not a table-only grant** — see §1a. | ephemeral, one window |
| **A — Auth admin** | env `H3D_SERVICE_KEY` / `LANE_B_AUTH_ADMIN_KEY` ← `.secrets` `SUPABASE_SECRET_KEY_WSTERA_LAB` | Project secret key. Supabase offers no narrower Auth-admin credential — this is a **platform ceiling**, recorded not waived. Used only by agent tooling for `/auth/v1/admin/*`; never passed to a child process, harness, product, browser, or evidence. | existing key; per-window use only |
| **P — platform admin** | LAB `postgres` | Role DDL and platform-owned migrations only (F6, F7). **Executed by the Owner in the Supabase SQL editor.** The agent never holds this credential in any Lane-B stage. `BILLING_DATABASE_URL` and `SUPABASE_DB_PASSWORD_WSTERA_LAB` are **not** injected into any agent process. | none on agent side |
| **T — product token** | JWT, `role = ps01_line_runtime` / `h4_runtime` | Auth-issued through the hook, ≤ 300 s, held in memory / minimal child env only. | ≤ 5 min |

### 1a. Effective boundary — corrected from Codex round 1 (DEFECT-02, DEFECT-03)

The table above states each class's *intended* grants. Round-1 review found that
stating "no other schema" (W) and "no writes anywhere" (M) as if those were the
*effective* privilege was false, because both classes inherit privilege they were
never explicitly granted. This section states the effective boundary; §3 and §6 gate
it, they do not merely assert it.

**M's effective reach beyond SELECT:** `BYPASSRLS` is a row-visibility attribute, not
a write grant, and it grants no write capability by itself. But every role created in
LAB — M included — inherits managed `PUBLIC` write privilege on `cron` (1 table) and
`net` (2 tables) at creation, with nothing explicitly granted (F10,
`BATCH-H3D-S-2026-09-22.md:191-198`). **M is therefore not read-only in the
project-wide sense; it is read-only with respect to product/data schemas, and it
carries an accepted, bounded, re-measured managed-surface write exposure on
`cron`/`net`.** That exposure is not removed by role design — Supabase does not
expose a supported way to opt a new role out of it — so it is controlled at the tool
boundary (G-STATIC-NOSHARED, §6) and re-measured (zero `cron.job` / `net` delta,
§1 inv. 5), never described as absent.

**W's effective reach beyond table DML:** `ps01_migrator` **owns** schemas `ps01` and
`ps01_internal` (`H1-EFFECTIVE-PRIVILEGE-INVENTORY-2026-09-08.md:48,100`). Role
membership with `INHERIT TRUE` inherits *ownership-derived* privilege, not only the
grants a policy author lists — an owning role can `ALTER`/`DROP`/`GRANT` on every
object it owns, not merely the tables a stage's fixture SQL happens to touch. A W
session for a stage that only needs `ps01` fixture DML and the
`ps01.subscription_audit_log` trigger toggle (F2) is therefore *capable* of far more
than that stage's task, for as long as the membership grant exists. Plus, like M, W
inherits the same managed `PUBLIC` `cron`/`net` write (F10).

**Corrected boundary statement for W:** effective reach = every object ownable by
`ps01_migrator` (`ps01`, `ps01_internal`) **plus** the managed `PUBLIC` write on
`cron`/`net`. W does **not** reach `local_service`, `mt01`, `mt01_private`, `auth`,
`vault`, or `wstera_platform_internal` — no grant or membership path gives it those,
and this is a check, not an assumption (§3's window-open "forbidden reach (W)"
check). `ps01_internal` reach is accepted as unavoidable under ownership-level
membership and is bounded by G-STATIC-NOSHARED plus the H3F-style zero-delta
re-measure, exactly like the `cron`/`net` exposure above — it is not a table-DML-only
credential, and no document in this package may describe it as one again.

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
   `PUBLIC` write on `cron`/`net`; W additionally carries `ps01_internal` ownership
   reach through `ps01_migrator` membership (§1a). Compensating controls: (a) the
   tool that uses the role is static-checked to issue no statement naming `cron`,
   `net`, `pg_net`, `http_`, or (for W) any `ps01_internal` object outside what the
   stage's fixture SQL already names (§6 gate G-STATIC-NOSHARED); (b) the post-window
   H3F-style inventory shows zero `cron.job` / `net` / `ps01_internal` delta beyond
   the stage's declared changes. This does not close H1; H1 remains open (§7).

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

### 2a. Per-stage teardown sequences for Auth/grant/token surfaces (Codex round 1, DEFECT-06)

§3's generic M/W runbook teardown (revoke grants → revoke membership → terminate
sessions → drop role) is necessary but not sufficient for `H3D-LIVE` and `H4`: both
also create Auth identities, runtime-grant rows, and (for `H4`) a hook, none of which
the generic template touches. Each of those has its own lifecycle and must be torn
down in this exact order, **before** the M/W database role teardown runs:

**`H3D-LIVE` teardown order** (matches the runner's own ledgered `--teardown-only`
path and the Operator Action Pack §9 transitions 11–14 — this section makes it an
explicit credential-strategy requirement rather than leaving it implicit in the
runner's code):

1. disable the Custom Access Token hook (operator, Dashboard);
2. delete every ledgered Auth identity created this window (class A, `DELETE
   /auth/v1/admin/users/<id>`, per identity);
3. delete the corresponding `wstera_platform_internal.runtime_token_grants` row(s)
   (class W, the grant-privileged session for this stage only);
4. wait past `residualNarrowAuthorityUntil` (the latest issued token's `exp`) —
   record the wait, do not shortcut it;
5. independently re-verify zero owned identities/grants (class M, fresh session);
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
| no real-table write privilege (M, W) | **Corrected from Codex round 1 (DEFECT-04): no live lock is taken on a product table.** For every table the role must not write (all of `ps01` for M; everything outside the stage's declared fixture set for W): `has_table_privilege(current_user, t, 'INSERT') = false` from `information_schema`/`pg_catalog`, queried directly — a metadata read, not a lock. Any `true` → window STOPs before any gate runs. |
| connection-level read-only behaviour (M only, where the tool still wants the compensating control of F11) | `CREATE TEMP TABLE lane_b_probe(x int); INSERT INTO lane_b_probe VALUES (1); DROP TABLE lane_b_probe;` — session-local, never touches shared storage, safe to succeed or fail either way. Its *purpose* is to distinguish "role genuinely cannot write" (real STOP above) from "pooler silently dropped a read-only setting" (F11) — it is diagnostic, not a gate, and its result is recorded, not enforced. |
| forbidden reach (W) | `LOCK TABLE local_service.<any table> IN ACCESS SHARE MODE` inside a rolled-back txn must fail `42501`. Same for `mt01`, `mt01_private`, `auth`, `vault`, `wstera_platform_internal` (§1a: these are the schemas W must **not** reach). |
| trigger-DDL capability (W, Codex round 1 DEFECT-05) | **Required before any stage that uses F2 (fixture teardown) is allowed to proceed under class W.** In its own transaction, rolled back regardless of outcome: `BEGIN; ALTER TABLE ps01.subscription_audit_log DISABLE TRIGGER trg_subscription_audit_immutable; ALTER TABLE ps01.subscription_audit_log ENABLE TRIGGER trg_subscription_audit_immutable; ROLLBACK;` — the `ROLLBACK` means neither statement's effect persists even on success, so the probe is harmless whether it passes or fails. If either statement raises (expected error `42501` if membership does not confer the capability the §8 assumption expects), the window STOPs: **do not fall back to class P**; this is exactly the "inability to prove a finding closed without a mutation belonging to a later checkpoint" stop condition in the Owner decision §5, and the new credential decision returns to the Owner. |

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
| G-STATIC-NOSHARED | every tool that runs under M/W contains no SQL naming `cron.`, `net.`, `pg_net`, `http_request`, `local_service.`, `mt01`, `vault.`, `auth.` (except the Auth API path, which is HTTP), or `ps01_internal.` outside the stage's declared fixture SQL (§1a). |
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
