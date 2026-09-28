-- Rollback only after issuance is stopped, tokens expire, and all non-seed
-- product configuration has been explicitly removed and reviewed.
BEGIN;
DO $preflight$
BEGIN
    IF EXISTS (SELECT 1 FROM wstera_platform_internal.storage_upload_grants) THEN
        RAISE EXCEPTION 'Rollback refused: House storage upload grants remain';
    END IF;
    IF EXISTS (SELECT 1 FROM wstera_platform_internal.storage_upload_runtime_roles
        WHERE (runtime_role,product_code) <> ('bk01_runtime','bk01'))
       OR EXISTS (SELECT 1 FROM wstera_platform_internal.storage_upload_bucket_allowlist
        WHERE (product_code,bucket_id) <> ('bk01','deposit-slips')) THEN
        RAISE EXCEPTION 'Rollback refused: non-seed House product storage configuration remains';
    END IF;
END;
$preflight$;

DROP TRIGGER wstera_consume_product_storage_upload_grant ON storage.objects;
DROP POLICY product_storage_upload_grant_insert ON storage.objects;
DROP FUNCTION wstera_platform_internal.consume_storage_upload();
DROP FUNCTION wstera_platform_internal.can_create_storage_upload(text,text);
DROP FUNCTION wstera_platform_internal.register_storage_upload_grant(text,text,text,text,bigint,timestamptz);
DROP TABLE wstera_platform_internal.storage_upload_grants;
DROP TABLE wstera_platform_internal.storage_upload_bucket_allowlist;
DROP TABLE wstera_platform_internal.storage_upload_runtime_roles;
REVOKE USAGE ON SCHEMA wstera_platform_internal FROM bk01_runtime, bk01_migrator;
REVOKE INSERT ON storage.objects FROM bk01_runtime;
REVOKE USAGE ON SCHEMA storage FROM bk01_runtime;
COMMIT;
