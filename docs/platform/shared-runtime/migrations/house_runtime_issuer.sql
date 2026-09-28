-- House-owned source artifact. Operator review/apply only; no hosted change in this task.
-- Provision wstera_runtime_issuer_login as a dedicated NOINHERIT, NOSUPERUSER,
-- NOBYPASSRLS login in the House project, then set its password in the host secret
-- manager. Never grant it product schema/table privileges.

CREATE SCHEMA IF NOT EXISTS wstera_platform_internal;
REVOKE ALL ON SCHEMA wstera_platform_internal FROM PUBLIC;

CREATE TABLE wstera_platform_internal.runtime_issuer_clients (
    client_id       text PRIMARY KEY,
    product_code    text NOT NULL CHECK (product_code ~ '^[a-z0-9_]+$'),
    project_ref     text NOT NULL CHECK (project_ref ~ '^[a-z0-9]{20}$'),
    auth_user_id    uuid NOT NULL,
    runtime_role    text NOT NULL CHECK (runtime_role = 'bk01_runtime'),
    secret_salt     bytea NOT NULL CHECK (octet_length(secret_salt) >= 16),
    secret_hash     bytea NOT NULL CHECK (octet_length(secret_hash) = 32),
    enabled         boolean NOT NULL DEFAULT false,
    expires_at      timestamptz NOT NULL,
    created_at      timestamptz NOT NULL DEFAULT now(),
    rotated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE wstera_platform_internal.runtime_issuer_rate_limits (
    rate_key        text NOT NULL,
    window_start    timestamptz NOT NULL,
    hit_count       integer NOT NULL CHECK (hit_count > 0),
    PRIMARY KEY (rate_key, window_start)
);

CREATE TABLE wstera_platform_internal.runtime_issuer_audit (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    at              timestamptz NOT NULL,
    product_code    text NOT NULL CHECK (product_code ~ '^[a-z0-9_]+$'),
    result          text NOT NULL CHECK (result IN ('issued','denied')),
    reason_code     text NOT NULL CHECK (reason_code ~ '^[a-z0-9_]+$')
);

ALTER TABLE wstera_platform_internal.runtime_issuer_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE wstera_platform_internal.runtime_issuer_clients FORCE ROW LEVEL SECURITY;
ALTER TABLE wstera_platform_internal.runtime_issuer_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE wstera_platform_internal.runtime_issuer_rate_limits FORCE ROW LEVEL SECURITY;
ALTER TABLE wstera_platform_internal.runtime_issuer_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE wstera_platform_internal.runtime_issuer_audit FORCE ROW LEVEL SECURITY;

CREATE POLICY runtime_issuer_client_select ON wstera_platform_internal.runtime_issuer_clients
    FOR SELECT TO wstera_runtime_issuer_login USING (true);
CREATE POLICY runtime_issuer_rate_limit_access ON wstera_platform_internal.runtime_issuer_rate_limits
    FOR ALL TO wstera_runtime_issuer_login USING (true) WITH CHECK (true);
CREATE POLICY runtime_issuer_audit_insert ON wstera_platform_internal.runtime_issuer_audit
    FOR INSERT TO wstera_runtime_issuer_login WITH CHECK (true);

CREATE OR REPLACE FUNCTION wstera_platform_internal.consume_runtime_issuer_rate_limit(
    p_rate_key text, p_limit integer, p_window_seconds integer, p_now timestamptz
) RETURNS TABLE(allowed boolean, remaining integer, reset_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, wstera_platform_internal
AS $function$
DECLARE
    v_start timestamptz;
    v_count integer;
BEGIN
    IF p_rate_key IS NULL OR length(p_rate_key) NOT BETWEEN 1 AND 200
       OR p_limit NOT BETWEEN 1 AND 1000 OR p_window_seconds NOT BETWEEN 1 AND 3600
       OR p_now IS NULL THEN
        RAISE EXCEPTION 'Invalid issuer rate limit input';
    END IF;
    v_start := to_timestamp(floor(extract(epoch FROM p_now) / p_window_seconds) * p_window_seconds);
    INSERT INTO wstera_platform_internal.runtime_issuer_rate_limits(rate_key, window_start, hit_count)
    VALUES (p_rate_key, v_start, 1)
    ON CONFLICT (rate_key, window_start) DO UPDATE
       SET hit_count = wstera_platform_internal.runtime_issuer_rate_limits.hit_count + 1
     WHERE wstera_platform_internal.runtime_issuer_rate_limits.hit_count < p_limit
    RETURNING hit_count INTO v_count;
    IF NOT FOUND THEN
        SELECT hit_count INTO v_count FROM wstera_platform_internal.runtime_issuer_rate_limits
         WHERE rate_key = p_rate_key AND window_start = v_start;
        RETURN QUERY SELECT false, 0, v_start + make_interval(secs => p_window_seconds);
        RETURN;
    END IF;
    RETURN QUERY SELECT true, greatest(p_limit - v_count, 0), v_start + make_interval(secs => p_window_seconds);
END;
$function$;

REVOKE ALL ON FUNCTION wstera_platform_internal.consume_runtime_issuer_rate_limit(text,integer,integer,timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION wstera_platform_internal.consume_runtime_issuer_rate_limit(text,integer,integer,timestamptz) FROM anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION wstera_platform_internal.consume_runtime_issuer_rate_limit(text,integer,integer,timestamptz)
    TO wstera_runtime_issuer_login;

REVOKE ALL ON ALL TABLES IN SCHEMA wstera_platform_internal FROM PUBLIC, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA wstera_platform_internal TO wstera_runtime_issuer_login;
GRANT SELECT ON wstera_platform_internal.runtime_issuer_clients TO wstera_runtime_issuer_login;
GRANT INSERT ON wstera_platform_internal.runtime_issuer_audit TO wstera_runtime_issuer_login;
GRANT USAGE, SELECT ON SEQUENCE wstera_platform_internal.runtime_issuer_audit_id_seq TO wstera_runtime_issuer_login;

-- Do not add INSERT/UPDATE/DELETE on the client table or UPDATE/DELETE on audit.
-- The issuer runtime login receives no grants in product schemas.
