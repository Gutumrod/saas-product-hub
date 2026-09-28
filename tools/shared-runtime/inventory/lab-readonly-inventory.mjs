#!/usr/bin/env node
// WSTERA LAB read-only shared-runtime inventory — reusable across H3D-start,
// H3F re-measure, and H5 final regression.
//
// SELECT-only. No DDL/DML. It never reads a password/hash/secret value; only
// role attributes and a "password configured" boolean where required.
//
// Env (never logged by this script):
//   LAB_DB_URL         postgres connection string for a House SELECT-only session
//   INVENTORY_OUT      output JSON path (default: stdout)
//   INVENTORY_LABEL    free-text label recorded in the output (e.g. "H3F post-apply")
//
// `pg` is this tool tree's own declared dependency (tools/shared-runtime/package.json);
// run `npm install` in tools/shared-runtime once. No cross-worktree / absolute paths.
//
// Exit 0 on success, 1 on connection failure, 2 on missing env.

import fs from "node:fs";
import crypto from "node:crypto";
import process from "node:process";
import pg from "pg";

const { Client } = pg;

const url = process.env.LAB_DB_URL;
if (!url) {
  console.error("LAB_DB_URL not set");
  process.exit(2);
}
const outFile = process.env.INVENTORY_OUT || "";
const label = process.env.INVENTORY_LABEL || "unlabelled";

// Product / platform roles measured everywhere.
const PRODUCT_ROLES = [
  "ps01_migrator",
  "ps01_runtime",
  "ps01_runtime_login",
  "ps01_line_runtime",
];

const Q = {
  identity: `SELECT current_user, current_database(),
      (SELECT setting FROM pg_settings WHERE name='server_version') AS server_version`,

  // Q1 — role attributes for product + platform roles (+ any h4_* disposable role).
  roles: `SELECT rolname, rolsuper, rolinherit, rolcreaterole, rolcreatedb,
       rolcanlogin, rolreplication, rolbypassrls, rolconfig,
       (rolpassword IS NOT NULL) AS password_present
     FROM pg_roles
     WHERE rolname ~ '^(bk01|ps01|mt01|h4)_'
        OR rolname IN ('postgres','authenticator','anon','authenticated','service_role',
                       'supabase_admin','supabase_auth_admin','supabase_storage_admin')
     ORDER BY rolname`,

  // Q2 — PG17 membership options.
  memberships: `SELECT member.rolname AS member_role, parent.rolname AS granted_role,
       m.admin_option, m.inherit_option, m.set_option, grantor.rolname AS grantor
     FROM pg_auth_members m
     JOIN pg_roles member ON member.oid = m.member
     JOIN pg_roles parent ON parent.oid = m.roleid
     JOIN pg_roles grantor ON grantor.oid = m.grantor
     WHERE member.rolname ~ '^(bk01|ps01|mt01|h4)_' OR parent.rolname ~ '^(bk01|ps01|mt01|h4)_'
        OR member.rolname='authenticator'
     ORDER BY member_role, granted_role, grantor`,

  // Q3 — effective authority per product role.
  effective_authority: `WITH r(role_name) AS (VALUES ${PRODUCT_ROLES.map((x) => `('${x}')`).join(",")})
     SELECT r.role_name,
       has_database_privilege(r.role_name,current_database(),'CONNECT') AS db_connect,
       has_database_privilege(r.role_name,current_database(),'CREATE') AS db_create,
       has_schema_privilege(r.role_name,'public','CREATE') AS public_create,
       has_schema_privilege(r.role_name,'ps01','USAGE') AS ps01_usage,
       has_schema_privilege(r.role_name,'ps01_internal','USAGE') AS ps01_internal_usage,
       has_schema_privilege(r.role_name,'local_service','USAGE') AS local_service_usage,
       has_schema_privilege(r.role_name,'mt01','USAGE') AS mt01_usage,
       has_schema_privilege(r.role_name,'mt01_private','USAGE') AS mt01_private_usage,
       has_schema_privilege(r.role_name,'net','USAGE') AS net_usage,
       has_schema_privilege(r.role_name,'cron','USAGE') AS cron_usage,
       has_schema_privilege(r.role_name,'auth','USAGE') AS auth_usage,
       has_schema_privilege(r.role_name,'storage','USAGE') AS storage_usage,
       has_schema_privilege(r.role_name,'extensions','USAGE') AS extensions_usage,
       has_table_privilege(r.role_name,'supabase_migrations.schema_migrations','INSERT') AS migration_insert,
       (SELECT rolcreaterole FROM pg_roles WHERE rolname=r.role_name) AS createrole,
       (SELECT rolcreatedb FROM pg_roles WHERE rolname=r.role_name) AS createdb,
       (SELECT rolbypassrls FROM pg_roles WHERE rolname=r.role_name) AS bypassrls,
       (SELECT rolcanlogin FROM pg_roles WHERE rolname=r.role_name) AS canlogin
     FROM r ORDER BY r.role_name`,

  // ps01_line_runtime privilege snapshot (harness-consumable shape).
  line_runtime_privilege: `WITH funcs AS (
       SELECT p.oid, p.proname, pg_get_function_identity_arguments(p.oid) AS args
       FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'ps01'
     ), execs AS (
       SELECT proname, args FROM funcs WHERE has_function_privilege('ps01_line_runtime', oid, 'EXECUTE')
     ), writes AS (
       SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname='ps01' AND c.relkind IN ('r','p','v','m','f')
         AND (has_table_privilege('ps01_line_runtime',c.oid,'INSERT')
           OR has_table_privilege('ps01_line_runtime',c.oid,'UPDATE')
           OR has_table_privilege('ps01_line_runtime',c.oid,'DELETE')
           OR has_table_privilege('ps01_line_runtime',c.oid,'TRUNCATE'))
     )
     SELECT jsonb_build_object(
       'captured_at', now(), 'project_ref','ykxlqnshaaxmzzocpjlj', 'role','ps01_line_runtime',
       'role_no_login', EXISTS (SELECT 1 FROM pg_roles WHERE rolname='ps01_line_runtime' AND NOT rolcanlogin),
       'exec_count', (SELECT count(*) FROM execs),
       'exec_functions', (SELECT jsonb_agg(jsonb_build_object('name',proname,'args',args) ORDER BY proname) FROM execs),
       'write_count', (SELECT count(*) FROM writes),
       'write_relations', (SELECT coalesce(jsonb_agg(relname ORDER BY relname),'[]'::jsonb) FROM writes),
       'public_usage', has_schema_privilege('ps01_line_runtime','public','USAGE'),
       'public_rls_auto_enable_exec', has_function_privilege('ps01_line_runtime','public.rls_auto_enable()','EXECUTE'),
       'local_service_usage', has_schema_privilege('ps01_line_runtime','local_service','USAGE'),
       'ps01_request_user_id_exec', has_function_privilege('ps01_line_runtime','ps01.ps01_request_user_id()','EXECUTE')
     ) AS snapshot`,

  // Q5 — PUBLIC relation ACLs on managed schemas (the H1 pg_net finding surface).
  public_managed_acls: `WITH rels AS (
       SELECT n.nspname,c.relname,c.relkind,c.relacl,pg_get_userbyid(c.relowner) AS owner
       FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
       WHERE n.nspname IN ('net','cron','storage','auth','extensions')
     ), acl AS (
       SELECT x.nspname,x.relname,x.relkind,x.owner,
              COALESCE(g.rolname,'PUBLIC') AS grantee,a.privilege_type
       FROM rels x
       CROSS JOIN LATERAL aclexplode(COALESCE(x.relacl,acldefault(
         CASE WHEN x.relkind='S' THEN 'S'::"char" ELSE 'r'::"char" END,
         (SELECT oid FROM pg_roles WHERE rolname=x.owner)))) a
       LEFT JOIN pg_roles g ON g.oid=a.grantee
     )
     SELECT nspname,relname,relkind,owner,privilege_type FROM acl
     WHERE grantee='PUBLIC' AND privilege_type IN ('INSERT','UPDATE','DELETE','TRUNCATE','SELECT','USAGE')
     ORDER BY nspname,relname,privilege_type`,

  // Q7 — exposed-schema functions that reference net.* (bridge check).
  net_bridges: `SELECT n.nspname,p.proname,pg_get_function_identity_arguments(p.oid) AS args,
       pg_get_userbyid(p.proowner) AS owner,p.prosecdef,
       has_function_privilege('anon',p.oid,'EXECUTE') AS anon_exec,
       has_function_privilege('authenticated',p.oid,'EXECUTE') AS authenticated_exec,
       has_function_privilege('ps01_line_runtime',p.oid,'EXECUTE') AS line_runtime_exec
     FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
     WHERE p.prokind='f' AND n.nspname IN ('public','graphql_public','local_service','ps01')
       AND pg_get_functiondef(p.oid) ~* '(^|[^a-zA-Z0-9_])net\\.'
     ORDER BY n.nspname,p.proname`,

  // Q8 — extension set/owners.
  extensions: `SELECT e.extname,e.extversion,n.nspname AS schema,pg_get_userbyid(e.extowner) AS owner
     FROM pg_extension e JOIN pg_namespace n ON n.oid=e.extnamespace ORDER BY e.extname`,

  // Q10 — global/shared baseline.
  global: `SELECT
       (SELECT count(*) FROM storage.buckets) AS storage_bucket_count,
       (SELECT jsonb_agg(id ORDER BY id) FROM storage.buckets) AS storage_bucket_ids,
       (SELECT count(*) FROM cron.job) AS cron_job_count,
       (SELECT jsonb_agg(jobname ORDER BY jobname) FROM cron.job) AS cron_job_names,
       (SELECT count(*) FROM pg_extension) AS extension_count,
       (SELECT count(*) FROM supabase_migrations.schema_migrations) AS global_migration_count,
       (SELECT max(version) FROM supabase_migrations.schema_migrations) AS latest_global_migration_version,
       (SELECT setting FROM (SELECT unnest(rolconfig) AS setting FROM pg_roles WHERE rolname='authenticator') s
          WHERE setting LIKE 'pgrst.db_schemas=%' LIMIT 1) AS data_api_schemas`,

  recent_migrations: `SELECT version, name FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 15`,

  // Q11 — product/platform schema counts + owners.
  schema_counts: `WITH t(schema_name) AS (VALUES ('local_service'),('ps01'),('ps01_internal'),
       ('mt01'),('mt01_private'),('wstera_platform_internal'))
     SELECT t.schema_name, pg_get_userbyid(n.nspowner) AS owner,
       (SELECT count(*) FROM pg_class c WHERE c.relnamespace=n.oid AND c.relkind IN ('r','p')) AS tables,
       (SELECT count(*) FROM pg_proc p WHERE p.pronamespace=n.oid) AS functions,
       (SELECT count(*) FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid WHERE c.relnamespace=n.oid) AS policies,
       (SELECT count(*) FROM pg_class c WHERE c.relnamespace=n.oid AND c.relkind='i') AS indexes,
       (SELECT count(*) FROM pg_constraint c JOIN pg_class r ON r.oid=c.conrelid WHERE r.relnamespace=n.oid AND c.contype='f') AS foreign_keys
     FROM t JOIN pg_namespace n ON n.nspname=t.schema_name ORDER BY t.schema_name`,

  // Advisor-relevant SECURITY DEFINER surfaces:
  //  - non-security_invoker views in product/exposed schemas (catches
  //    local_service.shop_public_profile, the known open Advisor finding);
  //  - SECURITY DEFINER functions reachable by anon specifically (authenticated
  //    staff RPCs are the normal product surface and are counted, not listed).
  security_definer_surfaces: `SELECT n.nspname, c.relname AS name, 'secdef_view' AS kind,
       pg_get_userbyid(c.relowner) AS owner
     FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
     WHERE c.relkind='v' AND n.nspname IN ('public','local_service','ps01','ps01_internal')
       AND NOT COALESCE(
         EXISTS (SELECT 1 FROM unnest(c.reloptions) o WHERE o ILIKE 'security_invoker=on'
                    OR o ILIKE 'security_invoker=true'), false)
     UNION ALL
     SELECT n.nspname, p.proname, 'anon_secdef_function', pg_get_userbyid(p.proowner)
     FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
     WHERE p.prosecdef AND n.nspname IN ('public','local_service','ps01','ps01_internal')
       AND has_function_privilege('anon',p.oid,'EXECUTE')
     ORDER BY 1,3,2`,

  // count of authenticated-reachable SECURITY DEFINER functions per schema
  // (expected product surface — track the count, not each row).
  secdef_function_counts: `SELECT n.nspname,
       count(*) FILTER (WHERE has_function_privilege('authenticated',p.oid,'EXECUTE')) AS authenticated_secdef,
       count(*) FILTER (WHERE has_function_privilege('anon',p.oid,'EXECUTE')) AS anon_secdef
     FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
     WHERE p.prosecdef AND n.nspname IN ('public','local_service','ps01','ps01_internal','mt01','mt01_private')
     GROUP BY n.nspname ORDER BY n.nspname`,

  // H3C / proof residue.
  proof_residue: `SELECT
       (SELECT count(*) FROM auth.users) AS auth_user_count,
       (SELECT count(*) FROM auth.users
          WHERE email ~* '(h3c|h3d|h4|proof|disposable|runtime-probe)') AS suspicious_proof_users,
       to_regclass('wstera_platform_internal.runtime_token_grants') IS NOT NULL AS token_grants_table_exists,
       COALESCE((SELECT count(*) FROM wstera_platform_internal.runtime_token_grants), -1) AS token_grant_rows`,

  // ps01 Customer LINE V2 gateway EXECUTE map.
  ps01_v2_gateway: `SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args,
       pg_get_userbyid(p.proowner) AS owner, p.prosecdef,
       has_function_privilege('ps01_line_runtime',p.oid,'EXECUTE') AS line_runtime_exec,
       has_function_privilege('ps01_runtime',p.oid,'EXECUTE') AS ps01_runtime_exec,
       has_function_privilege('anon',p.oid,'EXECUTE') AS anon_exec,
       has_function_privilege('authenticated',p.oid,'EXECUTE') AS authenticated_exec
     FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
     WHERE n.nspname='ps01' AND p.proname IN
       ('get_customer_booking_context_v2_internal','quote_customer_booking_v2_internal','submit_booking_request_v2_internal')
     ORDER BY p.proname`,

  // active sessions for bounded identities.
  sessions: `SELECT usename, application_name, state, count(*) AS sessions
     FROM pg_stat_activity
     WHERE usename ~ '^(ps01|bk01|mt01|h4)_' OR usename IN ('authenticator','postgres')
     GROUP BY usename,application_name,state ORDER BY usename,application_name,state`,
};

function stableStringify(v) {
  if (Array.isArray(v)) return `[${v.map(stableStringify).join(",")}]`;
  if (v && typeof v === "object") {
    return `{${Object.keys(v).sort().map((k) => JSON.stringify(k) + ":" + stableStringify(v[k])).join(",")}}`;
  }
  return JSON.stringify(v);
}

const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false }, statement_timeout: 25000 });
const out = { tool: "lab-readonly-inventory", version: 1, label, captured_at: new Date().toISOString(), mode: "READ-ONLY", queries: {} };

try {
  await client.connect();
  for (const [k, sql] of Object.entries(Q)) {
    try {
      out.queries[k] = (await client.query(sql)).rows;
    } catch (e) {
      out.queries[k] = { error: String(e.message || e) };
    }
  }
} catch (e) {
  out.fatal = String(e.message || e);
} finally {
  try { await client.end(); } catch {}
}

// signature: hash of the parts that must be byte-stable across phases (drop timestamps).
const sigInput = {
  effective_authority: out.queries.effective_authority,
  public_managed_acls: out.queries.public_managed_acls,
  net_bridges: out.queries.net_bridges,
  extensions: out.queries.extensions,
  schema_counts: out.queries.schema_counts,
  ps01_v2_gateway: out.queries.ps01_v2_gateway,
  security_definer_surfaces: out.queries.security_definer_surfaces,
  secdef_function_counts: out.queries.secdef_function_counts,
  memberships: out.queries.memberships,
  data_api_schemas: out.queries.global?.[0]?.data_api_schemas,
  storage_bucket_ids: out.queries.global?.[0]?.storage_bucket_ids,
  cron_job_names: out.queries.global?.[0]?.cron_job_names,
  global_migration_count: out.queries.global?.[0]?.global_migration_count,
};
out.signature_algo = "sha256(stable-json of effective authority, PUBLIC managed ACLs, net bridges, extensions, schema counts, ps01 v2 gateway, secdef surfaces, data-api schemas, storage buckets, cron jobs, migration count)";
out.signature = crypto.createHash("sha256").update(stableStringify(sigInput)).digest("hex");

const json = JSON.stringify(out, null, 2);
if (outFile) {
  fs.writeFileSync(outFile, json + "\n");
  console.error(`written: ${outFile}  signature=${out.signature}`);
} else {
  process.stdout.write(json + "\n");
}
process.exit(out.fatal ? 1 : 0);
