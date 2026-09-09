-- H3E — ps01_runtime_login role-state queries. SELECT only. WSTERA LAB.
-- Run the same file before (pre-state) and after (post-apply). Never reads the
-- password hash/value; only a boolean for "password configured".

-- R1: role attributes + settings + password-present boolean.
SELECT rolname, rolcanlogin, rolinherit, rolsuper, rolcreatedb, rolcreaterole,
       rolbypassrls, rolreplication, rolconnlimit, rolconfig,
       (rolpassword IS NOT NULL) AS password_present
FROM pg_roles
WHERE rolname = 'ps01_runtime_login';

-- R2: role memberships (both directions).
SELECT member.rolname AS member_role, parent.rolname AS granted_role,
       m.admin_option, m.inherit_option, m.set_option, grantor.rolname AS grantor
FROM pg_auth_members m
JOIN pg_roles member ON member.oid = m.member
JOIN pg_roles parent ON parent.oid = m.roleid
JOIN pg_roles grantor ON grantor.oid = m.grantor
WHERE member.rolname = 'ps01_runtime_login' OR parent.rolname = 'ps01_runtime_login'
ORDER BY member_role, granted_role;

-- R3: active sessions for the login (must be zero before forward apply, and
--     zero after).
SELECT pid, usename, application_name, client_addr, state, backend_start,
       state_change, left(query, 60) AS query_head
FROM pg_stat_activity
WHERE usename = 'ps01_runtime_login';

-- R4: schema/authority reach (must be unchanged pre vs post — only LOGIN and
--     password change).
SELECT 'ps01_runtime_login' AS role,
  has_schema_privilege('ps01_runtime_login','ps01','USAGE')            AS ps01_usage,
  has_schema_privilege('ps01_runtime_login','ps01_internal','USAGE')   AS ps01_internal_usage,
  has_schema_privilege('ps01_runtime_login','local_service','USAGE')   AS local_service_usage,
  has_schema_privilege('ps01_runtime_login','mt01','USAGE')            AS mt01_usage,
  has_database_privilege('ps01_runtime_login',current_database(),'CREATE') AS db_create,
  has_schema_privilege('ps01_runtime_login','public','CREATE')         AS public_create,
  (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
     WHERE n.nspname='ps01' AND has_function_privilege('ps01_runtime_login',p.oid,'EXECUTE')) AS ps01_exec_count;

-- R5: ps01_line_runtime replacement boundary is still exact (regression guard).
SELECT 'ps01_line_runtime' AS role,
  (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
     WHERE n.nspname='ps01' AND has_function_privilege('ps01_line_runtime',p.oid,'EXECUTE')) AS ps01_exec_count,
  has_schema_privilege('ps01_line_runtime','local_service','USAGE') AS local_service_usage,
  EXISTS (SELECT 1 FROM pg_roles WHERE rolname='ps01_line_runtime' AND NOT rolcanlogin) AS is_nologin;
