-- Rollback only after the issuer is stopped, tokens expire, and no grant remains.
BEGIN;
DO $preflight$
BEGIN
    IF EXISTS (SELECT 1 FROM wstera_platform_internal.storage_upload_grants) THEN
        RAISE EXCEPTION 'Rollback refused: House storage upload grants remain';
    END IF;
END;
$preflight$;

DROP TRIGGER wstera_consume_bk01_storage_upload_grant ON storage.objects;
DROP POLICY bk01_deposit_slip_grant_insert ON storage.objects;
DROP FUNCTION wstera_platform_internal.consume_bk01_storage_upload();
DROP FUNCTION wstera_platform_internal.can_create_bk01_storage_upload(text,text);
DROP FUNCTION wstera_platform_internal.register_bk01_storage_upload_grant(text,text,text,bigint,timestamptz);
DROP TABLE wstera_platform_internal.storage_upload_grants;
REVOKE USAGE ON SCHEMA wstera_platform_internal FROM bk01_runtime;
COMMIT;
