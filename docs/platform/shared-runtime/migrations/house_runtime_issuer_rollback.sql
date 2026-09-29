-- Guarded rollback for house_runtime_issuer.sql. Operator review/apply only.
-- Stop token issuance and drain all client, rate-limit, and audit rows first.
BEGIN;

DO $issuer_rollback_guard$
DECLARE
  clients_count bigint;
  rate_count bigint;
  audit_count bigint;
BEGIN
  IF to_regclass('wstera_platform_internal.runtime_issuer_clients') IS NULL
     OR to_regclass('wstera_platform_internal.runtime_issuer_rate_limits') IS NULL
     OR to_regclass('wstera_platform_internal.runtime_issuer_audit') IS NULL THEN
    RAISE EXCEPTION 'House runtime issuer rollback blocked: expected source tables are incomplete';
  END IF;
  EXECUTE 'SELECT count(*) FROM wstera_platform_internal.runtime_issuer_clients' INTO clients_count;
  EXECUTE 'SELECT count(*) FROM wstera_platform_internal.runtime_issuer_rate_limits' INTO rate_count;
  EXECUTE 'SELECT count(*) FROM wstera_platform_internal.runtime_issuer_audit' INTO audit_count;
  IF clients_count <> 0 OR rate_count <> 0 OR audit_count <> 0 THEN
    RAISE EXCEPTION 'House runtime issuer rollback blocked: clients %, rate limits %, audit rows % remain',
      clients_count, rate_count, audit_count;
  END IF;
END;
$issuer_rollback_guard$;

REVOKE USAGE ON SCHEMA wstera_platform_internal FROM wstera_runtime_issuer_login;

DROP FUNCTION wstera_platform_internal.consume_runtime_issuer_rate_limit(text,integer,integer,timestamptz);
DROP TABLE wstera_platform_internal.runtime_issuer_rate_limits;
DROP TABLE wstera_platform_internal.runtime_issuer_audit;
DROP TABLE wstera_platform_internal.runtime_issuer_clients;
-- Keep the dedicated login role and shared House schema; their ownership/lifecycle
-- is platform-managed and must be reviewed separately.
COMMIT;
