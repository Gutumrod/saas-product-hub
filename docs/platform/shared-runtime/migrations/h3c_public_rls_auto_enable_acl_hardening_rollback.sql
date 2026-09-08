-- Rollback for H3C public.rls_auto_enable() ACL hardening.
-- Restores the exact pre-hardening external EXECUTE shape observed in WSTERA LAB.

DO $$
BEGIN
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION 'H3C ACL rollback requires platform postgres session';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_event_trigger
    WHERE evtname='ensure_rls'
      AND evtfoid='public.rls_auto_enable()'::regprocedure
      AND evtenabled='O'
  ) THEN
    RAISE EXCEPTION 'ensure_rls event trigger baseline missing; stop rollback';
  END IF;
END $$;

GRANT EXECUTE ON FUNCTION public.rls_auto_enable()
TO PUBLIC, anon, authenticated, service_role;

DO $$
BEGIN
  IF NOT has_function_privilege('anon','public.rls_auto_enable()','EXECUTE')
     OR NOT has_function_privilege('authenticated','public.rls_auto_enable()','EXECUTE')
     OR NOT has_function_privilege('service_role','public.rls_auto_enable()','EXECUTE') THEN
    RAISE EXCEPTION 'rollback did not restore reviewed ACL baseline';
  END IF;
END $$;