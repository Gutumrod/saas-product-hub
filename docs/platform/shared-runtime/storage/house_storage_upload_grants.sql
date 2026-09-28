-- House-owned one-time upload grant registry. Source-only candidate; do not apply
-- until a separate operator window and independent SQL review authorize it.
BEGIN;

DO $preflight$
BEGIN
    IF has_schema_privilege('bk01_runtime','wstera_platform_internal','USAGE') THEN
        RAISE EXCEPTION 'BK01 storage grant setup blocked: runtime already has House schema USAGE; review pre-existing grants first';
    END IF;
END;
$preflight$;

CREATE TABLE wstera_platform_internal.storage_upload_grants (
    grant_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_code   text NOT NULL CHECK (product_code = 'bk01'),
    runtime_role   text NOT NULL CHECK (runtime_role = 'bk01_runtime'),
    bucket_id      text NOT NULL CHECK (bucket_id = 'deposit-slips'),
    object_path    text NOT NULL UNIQUE CHECK (object_path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$'),
    grant_token_hash text NOT NULL CHECK (grant_token_hash ~ '^[0-9a-f]{64}$'),
    content_type   text NOT NULL CHECK (content_type IN ('image/jpeg','image/png','image/webp')),
    size_bytes     bigint NOT NULL CHECK (size_bytes BETWEEN 1 AND 5242880),
    expires_at     timestamptz NOT NULL CHECK (expires_at <= created_at + interval '5 minutes'),
    created_at     timestamptz NOT NULL DEFAULT statement_timestamp(),
    consumed_at    timestamptz,
    UNIQUE (grant_token_hash)
);
ALTER TABLE wstera_platform_internal.storage_upload_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE wstera_platform_internal.storage_upload_grants FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE wstera_platform_internal.storage_upload_grants
    FROM PUBLIC, anon, authenticated, service_role, bk01_runtime;

CREATE FUNCTION wstera_platform_internal.register_bk01_storage_upload_grant(
    p_object_path text,
    p_grant_token_hash text,
    p_content_type text,
    p_size_bytes bigint,
    p_expires_at timestamptz
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, wstera_platform_internal
AS $function$
DECLARE v_grant_id uuid;
BEGIN
    IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'bk01_runtime' THEN
        RAISE EXCEPTION 'Storage grant registration requires bk01_runtime';
    END IF;
    IF p_object_path IS NULL OR p_object_path !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$'
       OR p_grant_token_hash IS NULL OR p_grant_token_hash !~ '^[0-9a-f]{64}$'
       OR p_content_type NOT IN ('image/jpeg','image/png','image/webp')
       OR p_size_bytes NOT BETWEEN 1 AND 5242880
       OR p_expires_at <= statement_timestamp()
       OR p_expires_at > statement_timestamp() + interval '5 minutes' THEN
        RAISE EXCEPTION 'Invalid BK01 storage grant';
    END IF;
    IF (p_content_type='image/jpeg' AND right(p_object_path,4) <> '.jpg')
       OR (p_content_type='image/png' AND right(p_object_path,4) <> '.png')
       OR (p_content_type='image/webp' AND right(p_object_path,5) <> '.webp') THEN
        RAISE EXCEPTION 'BK01 storage grant extension does not match content type';
    END IF;
    INSERT INTO wstera_platform_internal.storage_upload_grants(
      product_code,runtime_role,bucket_id,object_path,grant_token_hash,content_type,size_bytes,expires_at)
    VALUES ('bk01','bk01_runtime','deposit-slips',p_object_path,p_grant_token_hash,
      p_content_type,p_size_bytes,p_expires_at)
    RETURNING grant_id INTO v_grant_id;
    RETURN v_grant_id;
END;
$function$;

CREATE FUNCTION wstera_platform_internal.can_create_bk01_storage_upload(
    p_bucket_id text, p_object_path text
) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, wstera_platform_internal
AS $function$
    SELECT current_setting('request.jwt.claim.role', true) = 'bk01_runtime'
       AND EXISTS (
          SELECT 1 FROM wstera_platform_internal.storage_upload_grants g
           WHERE g.product_code='bk01' AND g.runtime_role='bk01_runtime'
             AND g.bucket_id=p_bucket_id AND g.object_path=p_object_path
             AND g.expires_at > statement_timestamp() AND g.consumed_at IS NULL
       )
$function$;

CREATE FUNCTION wstera_platform_internal.consume_bk01_storage_upload()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, wstera_platform_internal, storage
AS $function$
DECLARE v_role text; v_mimetype text; v_size bigint;
BEGIN
    IF NEW.bucket_id <> 'deposit-slips' THEN RETURN NEW; END IF;
    v_role := current_setting('request.jwt.claim.role', true);
    v_mimetype := NEW.metadata ->> 'mimetype';
    BEGIN v_size := (NEW.metadata ->> 'size')::bigint;
    EXCEPTION WHEN others THEN RAISE EXCEPTION 'Upload metadata size is invalid';
    END;
    UPDATE wstera_platform_internal.storage_upload_grants g
       SET consumed_at=statement_timestamp()
     WHERE g.product_code='bk01' AND g.runtime_role='bk01_runtime'
       AND v_role='bk01_runtime' AND g.bucket_id=NEW.bucket_id AND g.object_path=NEW.name
       AND g.expires_at > statement_timestamp() AND g.consumed_at IS NULL
       AND g.content_type=v_mimetype AND v_size=g.size_bytes;
    IF NOT FOUND THEN RAISE EXCEPTION 'No matching unused BK01 storage grant'; END IF;
    RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION wstera_platform_internal.register_bk01_storage_upload_grant(text,text,text,bigint,timestamptz)
    FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION wstera_platform_internal.can_create_bk01_storage_upload(text,text)
    FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION wstera_platform_internal.consume_bk01_storage_upload()
    FROM PUBLIC, anon, authenticated, service_role, bk01_runtime;
GRANT USAGE ON SCHEMA wstera_platform_internal TO bk01_runtime;
GRANT EXECUTE ON FUNCTION wstera_platform_internal.register_bk01_storage_upload_grant(text,text,text,bigint,timestamptz)
    TO bk01_runtime;
GRANT EXECUTE ON FUNCTION wstera_platform_internal.can_create_bk01_storage_upload(text,text)
    TO bk01_runtime;

CREATE POLICY bk01_deposit_slip_grant_insert ON storage.objects
    FOR INSERT TO bk01_runtime
    WITH CHECK (bucket_id='deposit-slips'
      AND wstera_platform_internal.can_create_bk01_storage_upload(bucket_id,name));
CREATE TRIGGER wstera_consume_bk01_storage_upload_grant
    BEFORE INSERT ON storage.objects
    FOR EACH ROW EXECUTE FUNCTION wstera_platform_internal.consume_bk01_storage_upload();

DO $postflight$
BEGIN
    IF has_table_privilege('bk01_runtime','wstera_platform_internal.storage_upload_grants','SELECT')
       OR has_table_privilege('bk01_runtime','wstera_platform_internal.storage_upload_grants','INSERT')
       OR has_function_privilege('anon','wstera_platform_internal.register_bk01_storage_upload_grant(text,text,text,bigint,timestamptz)','EXECUTE')
       OR has_function_privilege('authenticated','wstera_platform_internal.register_bk01_storage_upload_grant(text,text,text,bigint,timestamptz)','EXECUTE') THEN
        RAISE EXCEPTION 'House storage grant privilege boundary is not exact';
    END IF;
END;
$postflight$;

COMMIT;
