-- H1 READ-ONLY INVENTORY — WSTERA LAB
-- Date: 2026-09-08
-- Project: ykxlqnshaaxmzzocpjlj
-- Contract: SELECT-only. Do not add DDL/DML to this evidence file.

-- Q1: relevant product/platform role attributes.
SELECT rolname, rolsuper, rolinherit, rolcreaterole, rolcreatedb,
       rolcanlogin, rolreplication, rolbypassrls, rolconfig
FROM pg_roles
WHERE rolname ~ '^(bk01|ps01|mt01)_'
   OR rolname IN (
     'postgres','supabase_admin','supabase_auth_admin',
     'supabase_storage_admin','supabase_functions_admin',
     'authenticator','anon','authenticated','service_role',
     'dashboard_user','supabase_read_only_user'
   )
ORDER BY rolname;

-- Q2: PostgreSQL 17 role-membership options.
SELECT member.rolname AS member_role,
       parent.rolname AS granted_role,
       m.admin_option, m.inherit_option, m.set_option,
       grantor.rolname AS grantor
FROM pg_auth_members m
JOIN pg_roles member ON member.oid = m.member
JOIN pg_roles parent ON parent.oid = m.roleid
JOIN pg_roles grantor ON grantor.oid = m.grantor
WHERE member.rolname IN ('ps01_migrator','ps01_runtime','ps01_runtime_login','authenticator','postgres')
   OR parent.rolname IN ('ps01_migrator','ps01_runtime','ps01_runtime_login')
ORDER BY member.rolname, parent.rolname, grantor.rolname;

-- Q3: schema owners and explicit schema ACLs.
WITH target_schemas AS (
  SELECT n.oid, n.nspname, pg_get_userbyid(n.nspowner) AS owner, n.nspacl
  FROM pg_namespace n
  WHERE n.nspname IN (
    'local_service','local_service_internal','ps01','ps01_internal',
    'mt01','mt01_private','net','cron','storage','auth','public',
    'extensions','realtime','vault'
  )
), acl AS (
  SELECT s.nspname, s.owner, COALESCE(r.rolname,'PUBLIC') AS grantee,
         a.privilege_type, a.is_grantable
  FROM target_schemas s
  CROSS JOIN LATERAL aclexplode(
    COALESCE(s.nspacl, acldefault('n',(SELECT oid FROM pg_roles WHERE rolname=s.owner)))
  ) a
  LEFT JOIN pg_roles r ON r.oid=a.grantee
)
SELECT * FROM acl
ORDER BY nspname, grantee, privilege_type;

-- Q4: effective PS01 DB/global authority.
WITH roles(role_name) AS (
  VALUES ('ps01_migrator'),('ps01_runtime'),('ps01_runtime_login')
)
SELECT r.role_name,
       has_database_privilege(r.role_name,current_database(),'CONNECT') AS db_connect,
       has_database_privilege(r.role_name,current_database(),'CREATE') AS db_create,
       has_database_privilege(r.role_name,current_database(),'TEMP') AS db_temp,
       has_schema_privilege(r.role_name,'public','CREATE') AS public_create,
       has_schema_privilege(r.role_name,'supabase_migrations','USAGE') AS migration_schema_usage,
       has_table_privilege(r.role_name,'supabase_migrations.schema_migrations','INSERT') AS migration_insert,
       has_table_privilege(r.role_name,'supabase_migrations.schema_migrations','UPDATE') AS migration_update,
       has_table_privilege(r.role_name,'supabase_migrations.schema_migrations','DELETE') AS migration_delete,
       (SELECT rolcreaterole FROM pg_roles WHERE rolname=r.role_name) AS createrole,
       (SELECT rolcreatedb FROM pg_roles WHERE rolname=r.role_name) AS createdb,
       (SELECT rolbypassrls FROM pg_roles WHERE rolname=r.role_name) AS bypassrls
FROM roles r ORDER BY r.role_name;

-- Q5: exact PUBLIC relation/sequence privileges on managed schemas.
WITH rels AS (
  SELECT n.nspname,c.relname,c.relkind,pg_get_userbyid(c.relowner) AS owner,c.relacl
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname IN ('net','cron','storage','auth','public','extensions','realtime','vault')
), rel_acl AS (
  SELECT x.nspname,x.relname,x.relkind,x.owner,
         COALESCE(g.rolname,'PUBLIC') AS grantee,a.privilege_type,a.is_grantable
  FROM rels x
  CROSS JOIN LATERAL aclexplode(COALESCE(x.relacl,acldefault(
    CASE WHEN x.relkind='S' THEN 'S'::"char" ELSE 'r'::"char" END,
    (SELECT oid FROM pg_roles WHERE rolname=x.owner)))) a
  LEFT JOIN pg_roles g ON g.oid=a.grantee
)
SELECT * FROM rel_acl
WHERE grantee='PUBLIC'
  AND privilege_type IN ('INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER','USAGE','SELECT')
ORDER BY nspname,relname,privilege_type;

-- Q6: net functions actually executable by PS01 product identities.
WITH roles(role_name) AS (
  VALUES ('ps01_migrator'),('ps01_runtime'),('ps01_runtime_login')
), funcs AS (
  SELECT p.oid,n.nspname,p.proname,pg_get_function_identity_arguments(p.oid) AS args,
         pg_get_userbyid(p.proowner) AS owner,p.prosecdef,p.provolatile
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='net'
)
SELECT f.nspname,f.proname,f.args,f.owner,f.prosecdef,f.provolatile,
       array_agg(r.role_name ORDER BY r.role_name) AS reachable_product_roles
FROM funcs f CROSS JOIN roles r
WHERE has_schema_privilege(r.role_name,f.nspname,'USAGE')
  AND has_function_privilege(r.role_name,f.oid,'EXECUTE')
GROUP BY f.oid,f.nspname,f.proname,f.args,f.owner,f.prosecdef,f.provolatile
ORDER BY f.proname,f.args;

-- Q7: exposed-schema functions that bridge to net.
WITH funcs AS (
  SELECT p.oid,n.nspname,p.proname,pg_get_function_identity_arguments(p.oid) AS args,
         pg_get_userbyid(p.proowner) AS owner,p.prosecdef,pg_get_functiondef(p.oid) AS def
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE p.prokind='f'
    AND n.nspname IN ('public','graphql_public','local_service','ps01')
)
SELECT nspname,proname,args,owner,prosecdef,
       has_function_privilege('anon',oid,'EXECUTE') AS anon_execute,
       has_function_privilege('authenticated',oid,'EXECUTE') AS authenticated_execute,
       has_function_privilege('ps01_runtime_login',oid,'EXECUTE') AS ps01_login_execute
FROM funcs
WHERE def ~* '(^|[^a-zA-Z0-9_])net\.'
ORDER BY nspname,proname,args;

-- Q8: managed extension ownership for pg_net / pg_cron objects.
SELECT e.extname,e.extversion,n.nspname AS extension_schema,
       pg_get_userbyid(e.extowner) AS owner
FROM pg_extension e
JOIN pg_namespace n ON n.oid=e.extnamespace
ORDER BY e.extname;

-- Q9: can normal WSTERA postgres own/change net directly?
SELECT
  (SELECT rolsuper FROM pg_roles WHERE rolname='postgres') AS postgres_superuser,
  pg_has_role('postgres','supabase_admin','MEMBER') AS postgres_member_supabase_admin,
  pg_has_role('postgres','supabase_admin','USAGE') AS postgres_usage_supabase_admin,
  has_schema_privilege('postgres','net','CREATE') AS postgres_net_create,
  has_schema_privilege('postgres','net','USAGE') AS postgres_net_usage,
  (SELECT pg_get_userbyid(nspowner) FROM pg_namespace WHERE nspname='net') AS net_owner;

-- Q10: shared runtime/global baseline.
SELECT
  (SELECT count(*) FROM storage.buckets) AS storage_bucket_count,
  (SELECT jsonb_agg(id ORDER BY id) FROM storage.buckets) AS storage_bucket_ids,
  (SELECT count(*) FROM cron.job) AS cron_job_count,
  (SELECT count(*) FROM pg_extension) AS extension_count,
  (SELECT count(*) FROM supabase_migrations.schema_migrations) AS global_migration_count,
  (SELECT max(version) FROM supabase_migrations.schema_migrations) AS latest_global_migration_version,
  (SELECT setting FROM (
      SELECT unnest(rolconfig) AS setting FROM pg_roles WHERE rolname='authenticator'
   ) s WHERE setting LIKE 'pgrst.db_schemas=%' LIMIT 1) AS data_api_schemas;

-- Q11: product schema counts/owners. These counts should be compared with the
-- canonical rollback report. Any new hash algorithm must not be compared to an
-- older hash without proving the canonicalization algorithm is identical.
WITH targets(schema_name) AS (
  VALUES ('local_service'),('ps01'),('ps01_internal'),('mt01'),('mt01_private')
)
SELECT t.schema_name, pg_get_userbyid(n.nspowner) AS owner,
       (SELECT count(*) FROM pg_class c WHERE c.relnamespace=n.oid AND c.relkind IN ('r','p')) AS tables,
       (SELECT count(*) FROM pg_proc p WHERE p.pronamespace=n.oid) AS functions,
       (SELECT count(*) FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid WHERE c.relnamespace=n.oid) AS policies,
       (SELECT count(*) FROM pg_class c WHERE c.relnamespace=n.oid AND c.relkind='i') AS indexes,
       (SELECT count(*) FROM pg_constraint c JOIN pg_class r ON r.oid=c.conrelid
          WHERE r.relnamespace=n.oid AND c.contype='f') AS foreign_keys
FROM targets t
JOIN pg_namespace n ON n.nspname=t.schema_name
ORDER BY t.schema_name;

-- Q12: current active sessions for bounded/runtime identities (snapshot only).
SELECT usename, application_name, state, count(*) AS sessions
FROM pg_stat_activity
WHERE usename IN ('ps01_runtime_login','ps01_migrator','postgres','authenticator')
GROUP BY usename,application_name,state
ORDER BY usename,application_name,state;
