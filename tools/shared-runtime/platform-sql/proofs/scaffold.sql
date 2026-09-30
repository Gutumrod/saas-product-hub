-- Copy-and-own: second-brain-vault 7281e93, tools/platform-sql-review-claude/a7/scaffold.sql.
-- LOCAL TEST ONLY; use a fresh disposable cluster, never a hosted database.
-- LAB-shaped scaffold for the A6 roundtrip (local disposable Postgres 16). Mirrors booking's wu1_e2e.mjs scaffold,
-- but with REAL pgcrypto / uuid-ossp / btree_gist / pg_trgm instead of stubs.
create role anon nologin;
create role authenticated nologin;
create role service_role nologin;
create role authenticator nologin noinherit;
create role supabase_auth_admin nologin;
create role ps01_migrator nologin;
create role ps01_runtime nologin;
create role ps01_runtime_login nologin;
create role ps01_line_runtime nologin noinherit nosuperuser nocreatedb nocreaterole noreplication nobypassrls;
create role wstera_runtime_issuer_login login noinherit nosuperuser nocreatedb nocreaterole nobypassrls;
-- A9: bk01_runtime is deliberately absent; the real platform SQL must create it.

create schema extensions;
grant usage on schema extensions to public;
create extension pgcrypto schema extensions;
create extension "uuid-ossp" schema extensions;
create extension btree_gist schema extensions;
create extension pg_trgm schema extensions;
alter database lab set search_path = "$user", public, extensions;

create schema auth;
create table auth.users(id uuid primary key, email text);
create or replace function auth.uid() returns uuid language sql stable as $authuid$
  select coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''),
                  (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'))::uuid
$authuid$;
revoke all on schema auth from public;

create schema storage;
create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(), bucket_id text, name text, owner uuid, metadata jsonb not null default '{}'::jsonb);
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[] language sql immutable as $$ select string_to_array(name, '/') $$;
create function storage.filename(name text) returns text language sql immutable as $$ select (string_to_array(name,'/'))[array_length(string_to_array(name,'/'),1)] $$;

create schema ps01; create schema ps01_internal; create schema mt01; create schema mt01_private;
create table ps01.runtime_boundary_probe(id integer primary key, note text);
create table mt01.runtime_boundary_probe(id integer primary key, note text);
create schema net; create table net.http_request_queue(id integer primary key);
create schema cron; create table cron.job(jobid integer primary key);
