-- Read-only A11 catalog gate. Run after BK01 migrations as a platform observer.
-- Any returned row is a failure except the two separately asserted postgres-owned
-- rollback functions: link_staff_user(uuid,text) and submit_deposit_slip(...).
WITH object_refs(object_name, object_owner, object_kind, definition) AS (
  SELECT n.nspname || '.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')',
         pg_get_userbyid(p.proowner), 'function', p.prosrc
    FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
   WHERE n.nspname IN ('local_service','local_service_internal') AND p.prokind='f'
  UNION ALL
  SELECT n.nspname || '.' || c.relname, pg_get_userbyid(c.relowner), 'view', pg_get_viewdef(c.oid)
    FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE n.nspname IN ('local_service','local_service_internal') AND c.relkind IN ('v','m')
  UNION ALL
  SELECT n.nspname || '.' || c.relname || '.' || a.attname, pg_get_userbyid(c.relowner), 'default', pg_get_expr(d.adbin,d.adrelid)
    FROM pg_attrdef d JOIN pg_class c ON c.oid=d.adrelid
    JOIN pg_namespace n ON n.oid=c.relnamespace
    JOIN pg_attribute a ON a.attrelid=d.adrelid AND a.attnum=d.adnum
   WHERE n.nspname IN ('local_service','local_service_internal')
  UNION ALL
  SELECT n.nspname || '.' || c.relname || ':' || p.polname, pg_get_userbyid(c.relowner), 'policy',
         coalesce(pg_get_expr(p.polqual,p.polrelid),'') || ' ' || coalesce(pg_get_expr(p.polwithcheck,p.polrelid),'')
    FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE n.nspname IN ('local_service','local_service_internal')
  UNION ALL
  SELECT n.nspname || '.' || c.relname || ':' || con.conname, pg_get_userbyid(c.relowner), 'check', pg_get_constraintdef(con.oid)
    FROM pg_constraint con JOIN pg_class c ON c.oid=con.conrelid JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE n.nspname IN ('local_service','local_service_internal') AND con.contype='c'
  UNION ALL
  SELECT n.nspname || '.' || c.relname || ':' || t.tgname, pg_get_userbyid(c.relowner), 'trigger', pg_get_triggerdef(t.oid)
    FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE n.nspname IN ('local_service','local_service_internal') AND NOT t.tgisinternal
)
SELECT object_name, object_owner, object_kind,
       (regexp_matches(lower(definition), '\m(extensions|auth|storage|net|cron)\.[a-z_]+', 'g'))[1] AS foreign_schema
  FROM object_refs
 WHERE object_owner='bk01_migrator'
   AND lower(definition) ~ '\m(extensions|auth|storage|net|cron)\.[a-z_]+'
 ORDER BY object_kind, object_name;

-- Expected identities are link_staff_user and the two legacy submit_deposit_slip
-- overloads, all owned by postgres. These legacy
-- functions are rollback-only exceptions; never grant extensions to the product role.
SELECT n.nspname || '.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' AS function_identity,
       pg_get_userbyid(p.proowner) AS owner
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='local_service' AND p.proname IN ('link_staff_user','submit_deposit_slip')
 ORDER BY p.proname;
