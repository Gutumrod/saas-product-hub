-- H3C House hardening — remove Data API callers from public.rls_auto_enable().
-- WSTERA LAB only. This function remains attached to event trigger ensure_rls.

DO $$
BEGIN
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION 'H3C public ACL hardening requires platform postgres session';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public'
      AND p.proname='rls_auto_enable'
      AND p.prorettype='event_trigger'::regtype
      AND p.prosecdef
      AND pg_get_userbyid(p.proowner)='postgres'
  ) THEN
    RAISE EXCEPTION 'public.rls_auto_enable() baseline does not match reviewed function';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_event_trigger
    WHERE evtname='ensure_rls'
      AND evtfoid='public.rls_auto_enable()'::regprocedure
      AND evtenabled='O'
  ) THEN
    RAISE EXCEPTION 'ensure_rls event trigger is missing or not enabled';
  END IF;
END $$;

REVOKE EXECUTE ON FUNCTION public.rls_auto_enable()
FROM PUBLIC, anon, authenticated, service_role;
DO $$
BEGIN
  IF has_function_privilege('anon','public.rls_auto_enable()','EXECUTE')
     OR has_function_privilege('authenticated','public.rls_auto_enable()','EXECUTE')
     OR has_function_privilege('service_role','public.rls_auto_enable()','EXECUTE')
     OR has_function_privilege('ps01_line_runtime','public.rls_auto_enable()','EXECUTE') THEN
    RAISE EXCEPTION 'public.rls_auto_enable() still executable by an external/runtime role';
  END IF;

  IF NOT has_function_privilege('postgres','public.rls_auto_enable()','EXECUTE') THEN
    RAISE EXCEPTION 'postgres owner lost execute authority';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_event_trigger
    WHERE evtname='ensure_rls'
      AND evtfoid='public.rls_auto_enable()'::regprocedure
      AND evtenabled='O'
      AND pg_get_userbyid(evtowner)='postgres'
  ) THEN
    RAISE EXCEPTION 'ensure_rls event trigger changed during ACL hardening';
  END IF;
END $$;