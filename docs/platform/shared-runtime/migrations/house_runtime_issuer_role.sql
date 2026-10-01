-- GO6 Window 1: managed login identity for the House runtime issuer.
-- The role is deliberately NOLOGIN here; Window 2 must separately enable login.
DO $house_runtime_issuer_role$
BEGIN
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION 'House runtime issuer role requires platform postgres session';
  END IF;
  IF NOT (SELECT rolcreaterole FROM pg_catalog.pg_roles WHERE rolname=current_user) THEN
    RAISE EXCEPTION 'House runtime issuer role requires CREATEROLE';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname='wstera_runtime_issuer_login') THEN
    RAISE EXCEPTION 'wstera_runtime_issuer_login already exists';
  END IF;
END;
$house_runtime_issuer_role$;

CREATE ROLE wstera_runtime_issuer_login NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
ALTER ROLE wstera_runtime_issuer_login SET statement_timeout = '8s';
ALTER ROLE wstera_runtime_issuer_login SET lock_timeout = '8s';
COMMENT ON ROLE wstera_runtime_issuer_login IS 'House runtime issuer connection identity; NOLOGIN until separately authorized for Window 2';
