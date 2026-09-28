# House runtime token issuer candidate

สถานะ: `SOURCE ONLY / NOT DEPLOYED / AUTH HOOK NOT ACTIVATED / NO TOKENS ISSUED`

## API

- `POST /v1/runtime-tokens` with HTTP Basic client credentials and JSON `{ "audience": "supabase:<project-ref>" }`.
- Product, role, Auth URL, Auth user, TTL, and project are server-side values. The first source profile permits only `bk01` and `bk01_runtime`.
- The issuer verifies a PBKDF2-SHA-256 client secret hash, then consumes an atomic IP limit (60/minute) and client+IP limit (10/minute) in House Postgres before calling Auth.
- It uses the Supabase publishable key only for the password grant. The Auth email/password are Worker Secrets `BK01_AUTH_EMAIL` and `BK01_AUTH_PASSWORD`; neither is stored in House tables.
- It checks the exact Auth user UUID, issuer URL, `aud=authenticated`, `role=bk01_runtime`, and `exp` no more than 300 seconds away. It returns only the access token and expiry; it discards refresh tokens.
- The token is received directly from the configured Supabase Auth endpoint over HTTPS. The Worker validates the returned JWT claims but does not independently verify its signature; the Auth HTTPS response is the trust boundary.
- Every allowed product request outcome is audited with timestamp, product, result, and reason code only. The Module Hub audit core is adapted to drop actor/action/entity and arbitrary metadata before database insert. Store failure prevents issuing a token.
- No route or adapter accepts service_role credentials or project signing material.

## Storage and execution boundary

`docs/platform/shared-runtime/migrations/house_runtime_issuer.sql` creates client verifier, atomic fixed-window rate-limit, and minimal audit state in the House-only `wstera_platform_internal` schema. `house_runtime_issuer_rollback.sql` refuses teardown while any client, rate-limit, or audit state remains. Apply requires a separately provisioned `wstera_runtime_issuer_login` database identity, with no superuser, role/database creation, RLS bypass, or product-schema/table grants. Hyperdrive must use only that identity. The source migration deliberately contains no password. The House platform owner must verify effective privileges and Data API exposure before using it.

`docs/platform/shared-runtime/migrations/h3c_runtime_role_allowlist_expansion.sql` adds `bk01_runtime` to the existing H3C custom-token-hook allowlist and keeps the five-minute cap. Its rollback refuses while a BK01 grant row remains. Neither SQL file has been applied. `H3C` Dashboard setup remains an operator task in the live window.

The canonical Module Hub source is `Gutumrod/modules-hub` commit `f9dee01ecb797baa634e0e2a6a1498fdfdd8df37` (rate-limit v0.1.0, audit-log v0.1.0). Only the core source is copied here. The rate-limit memory adapter is not used; the destination adapter calls one House Postgres function per consume. The audit adapter persists only the four allowed fields. Local import extensions were adjusted for the Worker bundler; core logic remains source-owned copy.

## Rotation and emergency revocation

### Auth identity password rotation

1. Provision a replacement, dedicated Auth user for BK01. Add an enabled `runtime_token_grants` row for its UUID and role `bk01_runtime` with a bounded validity window.
2. Put the replacement email/password in the House Worker Secrets `BK01_AUTH_EMAIL` and `BK01_AUTH_PASSWORD`; never put either in source, SQL, logs, or an ordinary shell argument.
3. Request a token through the House endpoint and verify the subject UUID, role, issuer, and expiry without printing or saving the token. Run the negative role and expiry checks.
4. Disable and remove the previous hook grant, revoke its sessions, and change the Auth password so old credentials stop working. Wait at least five minutes before claiming old tokens have expired.

### Product client-secret rotation

1. Create a new high-entropy client secret and a new client ID; store only a PBKDF2 salt/hash in the House client table.
2. Put the new client ID/secret in the BK01 Worker Secrets. Do not enable the new client until the source proof has passed.
3. Verify a token request with the new client, then disable the old client row and remove the old product Worker Secrets.
4. Verify the old credential is rejected and record only the result code.

### Emergency revoke

Set the client row `enabled=false`, disable the corresponding Auth grant, revoke/delete its Auth user sessions, and remove its Worker Secrets. Already-issued JWTs remain valid until their `exp` (at most five minutes after issue); wait through that bound before asserting revocation complete.

## Offline gate

Run `npm test` in this directory for mocked Auth behavior. This does not prove Supabase hosted hook activation, Worker/Hyperdrive wiring, or a live Auth password grant. No deploy, database apply, Dashboard change, secret creation, or token issuance is authorized by this source package.
