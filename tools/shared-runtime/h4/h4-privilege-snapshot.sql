-- H4 fresh privilege snapshot — SELECT only / WSTERA LAB.
-- Save the single JSON object; set H4_PRIVILEGE_SNAPSHOT to that file before the harness.

WITH funcs AS (
  SELECT p.oid, p.proname, pg_get_function_identity_arguments(p.oid) AS args
  FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'h4_probe'
), execs AS (
  SELECT proname, args FROM funcs WHERE has_function_privilege('h4_runtime', oid, 'EXECUTE')
), writes AS (
  SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'h4_probe' AND c.relkind IN ('r','p','v','m')
    AND (has_table_privilege('h4_runtime', c.oid, 'INSERT')
      OR has_table_privilege('h4_runtime', c.oid, 'UPDATE')
      OR has_table_privilege('h4_runtime', c.oid, 'DELETE'))
)
SELECT jsonb_build_object(
  'captured_at', now(),
  'project_ref', 'ykxlqnshaaxmzzocpjlj',
  'role', 'h4_runtime',
  'role_no_login', EXISTS (SELECT 1 FROM pg_roles WHERE rolname='h4_runtime' AND NOT rolcanlogin),
  'exec_count', (SELECT count(*) FROM execs),
  'exec_functions', (SELECT jsonb_agg(jsonb_build_object('name',proname,'args',args) ORDER BY proname) FROM execs),
  'write_count', (SELECT count(*) FROM writes),
  'write_relations', (SELECT coalesce(jsonb_agg(relname ORDER BY relname),'[]'::jsonb) FROM writes),
  'foreign_schema_usage', (
    has_schema_privilege('h4_runtime','ps01','USAGE')
    OR has_schema_privilege('h4_runtime','ps01_internal','USAGE')
    OR has_schema_privilege('h4_runtime','local_service','USAGE')
    OR has_schema_privilege('h4_runtime','mt01','USAGE')
    OR has_schema_privilege('h4_runtime','mt01_private','USAGE')
    OR has_schema_privilege('h4_runtime','wstera_platform_internal','USAGE')
  ),
  'migrator_foreign_usage', (
    has_schema_privilege('h4_migrator','ps01','USAGE')
    OR has_schema_privilege('h4_migrator','local_service','USAGE')
    OR has_schema_privilege('h4_migrator','mt01','USAGE')
  ),
  'migrator_db_create', has_database_privilege('h4_migrator', current_database(), 'CREATE'),
  'runtime_db_create', has_database_privilege('h4_runtime', current_database(), 'CREATE'),
  'runtime_public_create', has_schema_privilege('h4_runtime','public','CREATE'),
  'runtime_migration_insert', has_table_privilege('h4_runtime','supabase_migrations.schema_migrations','INSERT')
) AS snapshot;
