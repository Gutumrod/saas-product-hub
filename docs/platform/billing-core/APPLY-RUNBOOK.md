# billing-core Phase 0.5 migration apply runbook

**Status:** draft; nothing in this runbook has been applied.

**Migration:** `docs/platform/billing-core/migrations/0001_billing_core_schema.sql`

**Tooling decision:** option (a), owner-controlled raw SQL, transported with Supabase CLI
`db query --file`. This is not a second Supabase migration chain and does not modify hub-web's
Drizzle journal.

## Authority and prerequisites

Only the designated **Project A migration owner** applies this file. Application operators,
hub-web runtime credentials, `billing_core_app`, and `billing_core_staging_app` are not authorized.

Before scheduling the change, all of the following must be true:

1. Commander has reconciled every required change in
   `REVIEW-PHASE-0-5-2026-08-29.md` into the owned security contract; Commander and CEO have signed
   off the final SQL and apply window.
2. The target is confirmed as Project A (`coyelzlgukvpgguqpjdi`) by the migration owner without
   putting a URL, password, token, or key in the repository or shell history.
3. A current backup/restore point exists and the owner has confirmed the restore procedure. The
   initial migration is expand-only but role/schema creation is project-level administration.
4. Project A's current Data API exposed-schema configuration is recorded and does **not** contain
   `billing_core` or `billing_core_staging`.
5. Hub-web's application runtime no longer uses a Project A `postgres`/owner `DATABASE_URL`; it uses
   a reviewed `hub_web_app`-equivalent scoped role and denial tests prove it cannot use either billing
   schema. This migration does not create that role because it is outside the authorized files.
6. No role or schema named `billing_core_app`, `billing_core_staging_app`, `billing_core`, or
   `billing_core_staging` exists unexpectedly. If any exists, stop and investigate; do not treat
   `IF NOT EXISTS` as approval to merge with unknown state.
7. The SQL diff contains only `billing_core*` schemas/roles plus references to built-in/project roles
   `PUBLIC`, `anon`, and `authenticated`. It contains no secret or role password.
8. Installed CLI syntax is rechecked. This draft was verified with Supabase CLI 2.101.0, where raw
   SQL is `supabase db query --file`; `supabase db execute` is not the command.
9. Production and staging application-role passwords have been generated separately and an
   out-of-band vault location/rotation owner exists. Passwords are never added to this SQL or log.
10. The apply owner has an administrative database URL capable of creating login roles. A
    service-role API key and the scoped application URLs are insufficient.

## Preflight (read-only)

Use a clean checkout of the signed-off commit and confirm no local substitution:

```powershell
git status --short --branch
git show --stat --oneline HEAD
git diff HEAD^ -- docs/platform/billing-core
supabase --version
supabase db query --help
supabase db advisors --help
```

Set the admin URL only in the current process from the approved secret manager. The variable below
is a placeholder name, not a value. Do not echo it:

```powershell
$BillingCoreAdminDbUrl = '<retrieve from approved secret manager; do not paste into docs or logs>'
```

Run these read-only preflight queries through a temporary reviewed SQL file or an interactive query
whose history is controlled:

```sql
SELECT current_database(), current_user;

SELECT rolname
FROM pg_catalog.pg_roles
WHERE rolname IN ('billing_core_app', 'billing_core_staging_app');

SELECT nspname, pg_catalog.pg_get_userbyid(nspowner) AS owner
FROM pg_catalog.pg_namespace
WHERE nspname IN ('billing_core', 'billing_core_staging');
```

Expected before the initial apply: no rows from the last two queries. Any row is a hard stop until
its provenance and exact state are reviewed.

## Apply

From the repository root, the Project A migration owner runs exactly one transport command:

```powershell
supabase db query `
  --db-url $BillingCoreAdminDbUrl `
  --file 'docs/platform/billing-core/migrations/0001_billing_core_schema.sql'
```

Do not use `--linked` for this change: the explicit approved database URL makes the target part of
the operator check. Do not run `supabase db push`, `drizzle-kit generate`, `drizzle-kit migrate`, or
`drizzle-kit push` as part of this apply. Record operator, UTC time, commit SHA, CLI version, target
project reference, command exit status, and redacted output in the Project A change log.

The role passwords are then set through an approved out-of-band administrative session and stored in
the vault. Do not include the password-setting statement in terminal transcripts or this repository.
Rotate/revoke any temporary administrative credential after the window according to policy.

## Security advisor

Run the advisor against the same explicit target after the migration:

```powershell
supabase db advisors `
  --db-url $BillingCoreAdminDbUrl `
  --type security `
  --fail-on error
```

An error is a failed gate. Warnings are reviewed and dispositioned in the change evidence; they are
not silently waived. The advisor is additive evidence and does not replace the grant/denial tests.

## Verification queries

Run the following with the migration-owner connection. Save redacted results.

### Roles and role attributes

```sql
SELECT rolname, rolcanlogin, rolsuper, rolinherit, rolcreaterole,
       rolcreatedb, rolreplication
FROM pg_catalog.pg_roles
WHERE rolname IN ('billing_core_app', 'billing_core_staging_app')
ORDER BY rolname;
```

Expected: exactly two rows; login true; superuser, inherit, create-role, create-db and replication
all false.

### Required objects and production/staging equivalence

```sql
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema IN ('billing_core', 'billing_core_staging')
  AND table_type = 'BASE TABLE'
ORDER BY table_schema, table_name;

WITH surface AS (
  SELECT table_schema,
         table_name,
         column_name,
         ordinal_position,
         data_type,
         udt_name,
         is_nullable,
         COALESCE(column_default, '') AS column_default
  FROM information_schema.columns
  WHERE table_schema IN ('billing_core', 'billing_core_staging')
), normalized AS (
  SELECT table_schema,
         table_name,
         column_name,
         ordinal_position,
         data_type,
         regexp_replace(udt_name, '^billing_core_staging\\.', 'billing_core.') AS udt_name,
         is_nullable,
         regexp_replace(column_default, 'billing_core_staging', 'billing_core', 'g') AS column_default
  FROM surface
)
(SELECT table_name, column_name, ordinal_position, data_type, udt_name, is_nullable, column_default
 FROM normalized WHERE table_schema = 'billing_core'
 EXCEPT
 SELECT table_name, column_name, ordinal_position, data_type, udt_name, is_nullable, column_default
 FROM normalized WHERE table_schema = 'billing_core_staging')
UNION ALL
(SELECT table_name, column_name, ordinal_position, data_type, udt_name, is_nullable, column_default
 FROM normalized WHERE table_schema = 'billing_core_staging'
 EXCEPT
 SELECT table_name, column_name, ordinal_position, data_type, udt_name, is_nullable, column_default
 FROM normalized WHERE table_schema = 'billing_core');
```

Expected tables in each schema: `plans`, `subscriptions`, `payments`, `stripe_customers`,
`processed_events`, `delivery_jobs`, and `audit_events`. The equivalence query returns zero rows.
Also compare constraints and indexes from `pg_catalog` before acceptance; names may match across
schemas but definitions must differ only by schema qualification.

### Schema grants and negative reach

```sql
SELECT grantee, table_schema, privilege_type, count(*) AS table_count
FROM information_schema.role_table_grants
WHERE table_schema IN ('billing_core', 'billing_core_staging')
GROUP BY grantee, table_schema, privilege_type
ORDER BY grantee, table_schema, privilege_type;

SELECT role_name, schema_name,
       has_schema_privilege(role_name, schema_name, 'USAGE') AS can_usage,
       has_schema_privilege(role_name, schema_name, 'CREATE') AS can_create
FROM (VALUES
  ('billing_core_app', 'billing_core'),
  ('billing_core_app', 'billing_core_staging'),
  ('billing_core_staging_app', 'billing_core'),
  ('billing_core_staging_app', 'billing_core_staging'),
  ('anon', 'billing_core'),
  ('anon', 'billing_core_staging'),
  ('authenticated', 'billing_core'),
  ('authenticated', 'billing_core_staging')
) AS checks(role_name, schema_name)
ORDER BY role_name, schema_name;

SELECT
  has_table_privilege('billing_core_app',
                      'billing_core.processed_events', 'DELETE') AS prod_event_delete,
  has_table_privilege('billing_core_app',
                      'billing_core.audit_events', 'DELETE') AS prod_audit_delete,
  has_table_privilege('billing_core_staging_app',
                      'billing_core_staging.processed_events', 'DELETE') AS staging_event_delete,
  has_table_privilege('billing_core_staging_app',
                      'billing_core_staging.audit_events', 'DELETE') AS staging_audit_delete;
```

Expected:

- `billing_core_app`: USAGE true only on production, CREATE false everywhere; SELECT/INSERT/UPDATE
  only on production tables.
- `billing_core_staging_app`: USAGE true only on staging, CREATE false everywhere;
  SELECT/INSERT/UPDATE only on staging tables.
- `anon` and `authenticated`: USAGE false on both schemas and no table grants.
- all four DELETE checks: false.

Connect separately as each application login and prove real query denial, not only catalog claims:

```sql
-- As billing_core_app: first succeeds, second must fail with insufficient privilege.
SELECT count(*) FROM billing_core.plans;
SELECT count(*) FROM billing_core_staging.plans;

-- As billing_core_staging_app: first succeeds, second must fail.
SELECT count(*) FROM billing_core_staging.plans;
SELECT count(*) FROM billing_core.plans;
```

Also run equivalent denial probes with hub-web's scoped runtime database role. Verify through Project
A configuration/API tests that neither billing schema is Data-API-exposed; service-role RLS bypass
does not make a non-exposed schema addressable, but configuration drift must be caught.

### Durable-ledger surface

```sql
SELECT conrelid::regclass AS table_name, conname, pg_get_constraintdef(oid) AS definition
FROM pg_catalog.pg_constraint
WHERE connamespace IN (
  'billing_core'::regnamespace,
  'billing_core_staging'::regnamespace
)
ORDER BY conrelid::regclass::text, conname;

SELECT schemaname, tablename, indexname, indexdef
FROM pg_catalog.pg_indexes
WHERE schemaname IN ('billing_core', 'billing_core_staging')
ORDER BY schemaname, tablename, indexname;
```

Confirm unique Stripe event IDs, one delivery job per event, state/lease/completion checks, and due-job
indexes exist in both schemas. Do not insert synthetic rows into production for this draft gate; use
staging during the later behavioral rehearsal.

## Evidence and completion gate

The migration is not accepted merely because the command succeeds. The change record must contain:

- approved commit SHA and reviewers;
- redacted apply output and exact CLI version;
- roles/object/grant query results and real cross-schema denial results;
- Data API exposed-schema evidence;
- security-advisor output with every warning dispositioned;
- production/staging catalog-equivalence result;
- password-vault ownership confirmation without values; and
- later staging evidence that an intake crash leaves a retryable job, a completed duplicate does not
  reapply, an incomplete duplicate is reawakened, and lease expiry recovers an abandoned worker.

Only Commander records the final gate result.

## Rollback and recovery

### Initial empty-schema rollback only

If the apply fails or must be reversed **before any real billing, event, delivery-job, or audit data
exists**, stop all application use, prove every table in both schemas is empty, preserve the failed
apply evidence, and have the Project A migration owner run a separately reviewed rollback:

```sql
BEGIN;
DROP SCHEMA billing_core_staging CASCADE;
DROP SCHEMA billing_core CASCADE;
DROP ROLE billing_core_staging_app;
DROP ROLE billing_core_app;
COMMIT;
```

This is destructive and is not embedded in `0001_billing_core_schema.sql`. Do not run it based on
assumption or application health alone. Confirm no other object depends on either role/schema first.

### After any real data exists

Routine rollback is **Worker/config rollback or forward remediation while preserving the database**:

1. activate the processing kill switch so verified events continue durable intake but transitions
   stop;
2. roll the Worker/configuration back to the last schema-compatible artifact;
3. retain all `processed_events`, `delivery_jobs`, `payments`, and `audit_events` data;
4. apply a reviewed forward-fix/expand-contract migration;
5. replay due jobs and reconcile against Stripe before clearing the kill switch.

`DROP SCHEMA ... CASCADE`, role deletion, ledger truncation, or destructive restore is **not** a
normal production rollback. After real data, it is an explicit disaster/manual procedure requiring
CEO, Commander, Project A migration owner and incident authority, with preserved evidence and a
tested restore/reconciliation plan.
