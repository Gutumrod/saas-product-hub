-- H3C fresh privilege snapshot — SELECT only / WSTERA LAB.
-- Save the single JSON object returned by this query to a local evidence file,
-- then set H3C_PRIVILEGE_SNAPSHOT to that file before running the harness.

WITH funcs AS (
  SELECT p.oid, p.proname, pg_get_function_identity_arguments(p.oid) AS args
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'ps01'
), execs AS (
  SELECT proname, args
  FROM funcs
  WHERE has_function_privilege('ps01_line_runtime', oid, 'EXECUTE')
), writes AS (
  SELECT c.relname,
         has_table_privilege('ps01_line_runtime', c.oid, 'INSERT') AS ins,
         has_table_privilege('ps01_line_runtime', c.oid, 'UPDATE') AS upd,
         has_table_privilege('ps01_line_runtime', c.oid, 'DELETE') AS del,
         has_table_privilege('ps01_line_runtime', c.oid, 'TRUNCATE') AS trunc
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'ps01'
    AND c.relkind IN ('r','p','v','m','f')
)
SELECT jsonb_build_object(
  'captured_at', now(),
  'project_ref', 'ykxlqnshaaxmzzocpjlj',
  'role', 'ps01_line_runtime',
  'role_no_login', EXISTS (
    SELECT 1 FROM pg_roles WHERE rolname='ps01_line_runtime' AND NOT rolcanlogin
  ),  'exec_count', (SELECT count(*) FROM execs),
  'exec_functions', (
    SELECT jsonb_agg(jsonb_build_object('name',proname,'args',args) ORDER BY proname)
    FROM execs
  ),
  'write_count', (
    SELECT count(*) FROM writes WHERE ins OR upd OR del OR trunc
  ),
  'write_relations', (
    SELECT coalesce(jsonb_agg(relname ORDER BY relname),'[]'::jsonb)
    FROM writes WHERE ins OR upd OR del OR trunc
  ),
  'public_usage', has_schema_privilege('ps01_line_runtime','public','USAGE'),
  'public_rls_auto_enable_exec',
    has_function_privilege('ps01_line_runtime','public.rls_auto_enable()','EXECUTE'),
  'local_service_usage',
    has_schema_privilege('ps01_line_runtime','local_service','USAGE'),
  'ps01_request_user_id_exec',
    has_function_privilege('ps01_line_runtime','ps01.ps01_request_user_id()','EXECUTE')
) AS snapshot;