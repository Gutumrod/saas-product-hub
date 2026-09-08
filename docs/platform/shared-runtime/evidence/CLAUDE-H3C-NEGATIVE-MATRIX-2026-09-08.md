# CLAUDE — H3C Data API Positive / Negative Matrix (Work Package E)

**Date:** 2026-09-08 · **Mode:** DESIGN ONLY — not executed.
**Implemented by:** `tools/shared-runtime/h3c/h3c-proof-harness.mjs` (Work Package D).
**Run by:** WSTERA House operator, after H3C-3/4/5 provisioning, against WSTERA LAB only.

## Ground rules

- Every probe is **non-destructive**. No probe creates a real booking, customer, pet, shop or business row to prove a denial. Positive RPC probes either use House-supplied read-only fixtures or run in **boundary-only mode** (prove the call reaches the function and is not rejected by role/schema/grant; a domain-level 4xx from *inside* the function counts as reaching the boundary).
- **Unexpected HTTP/SQL success on any negative probe is a GATE FAILURE**, not a warning. The harness exits non-zero.
- The harness verifies token properties from the **decoded JWT** (`exp`, `iss`, `role`), never from the OAuth `expires_in` response field (see independent review WP-A A4).
- Tokens/keys/secrets are never printed. The harness logs at most: `iss`, `role`, `exp`, `iat`, `kid`, first 6 chars of `sub`.

## Token pre-checks (fail closed before any probe)

| ID | Check | Expected |
|---|---|---|
| TOK-1 | JWT header `alg` | `ES256` |
| TOK-2 | Signature verifies against `${url}/auth/v1/.well-known/jwks.json` (key matched by `kid`) | valid |
| TOK-3 | `iss` | `${url}/auth/v1` (WSTERA LAB Auth issuer) |
| TOK-4 | `role` claim | exactly `ps01_line_runtime` |
| TOK-5 | `exp - iat` | `≤ 300` seconds |
| TOK-6 | `exp` | in the future at run time (not already expired) |
| TOK-7 | `ref` / project identity (aud or project claim, whichever LAB Auth emits) | WSTERA LAB `ykxlqnshaaxmzzocpjlj` |
| TOK-8 | No signing material present in env dump / repo | absent |

If TOK-1..7 do not all pass, the harness stops and runs nothing else.

## Positive matrix (must succeed / reach the function boundary)

| ID | Request | Pass condition |
|---|---|---|
| POS-1 | `POST ${url}/rest/v1/rpc/get_customer_booking_context_v2_internal` · headers `apikey: <anon>`, `Authorization: Bearer <runtime jwt>`, `Content-Profile: ps01`, `Accept-Profile: ps01` · body `{ "p_verified_line_user_id": <fixture or "">, "p_shop_id": <fixture or nil-uuid> }` | HTTP not in {401, 403}; not PostgREST `PGRST202`/`PGRST301` (function-not-found / schema). 200, or a 400 whose body is a Postgres error raised *inside* the function, both prove role+grant+`SET ROLE`+schema resolution worked. |
| POS-2 | same for `quote_customer_booking_v2_internal` with its 6 args (fixtures or typed nulls) | same |
| POS-3 | same for `submit_booking_request_v2_internal` with its 7 args | same (boundary-only unless House explicitly authorizes a disposable-shop fixture; default = do NOT actually submit) |
| POS-CONTROL-1 | Sign in as a **non-allowlisted** LAB Auth user while the hook is enabled; decode its token | `role` = `authenticated` (unchanged), `exp - iat` = project default (not capped). Proves the hook is a no-op for ordinary users (TM-6). *(Operator step; harness accepts a second token via `H3C_CONTROL_JWT` and checks it.)* |
| POS-AUTHZ-1 | POS-1 with a **mismatched** `p_shop_id` (a real shop id the fixture LINE user is not linked to, supplied read-only by House) | the RPC returns a domain rejection / empty context — **must not** return another shop's data. |
| POS-AUTHZ-2 | POS-1 with a blank / obviously-unverified `p_verified_line_user_id` | domain rejection; no customer context returned. |
| POS-AUTHZ-3 | POS-2 with `p_pet_ids` = a uuid array belonging to a different customer (House read-only fixture) | domain rejection; no cross-customer quote. |

POS-AUTHZ-1..3 are the TM-11 checks: they prove the 3 SECURITY DEFINER RPC **bodies** enforce verified-LINE-user + shop scoping, independent of the Postgres role. If House cannot supply safe fixtures, these are marked `RUNTIME-BLOCKED / NOT PROVEN` — **not** passed.

## Negative matrix (every one must fail closed)

### Non-allowlisted PS01 RPC / unintended SECURITY DEFINER

| ID | Request | Expected failure |
|---|---|---|
| NEG-SD-1 | `POST /rest/v1/rpc/sync_booking_occupancy_window` (`Accept-Profile: ps01`) | 404 `PGRST202` (no EXECUTE for this role / not exposed) |
| NEG-SD-2 | `POST /rest/v1/rpc/<any other ps01 function name from live metadata not in the 3>` | 404 / 403 |
| NEG-ROLE-1 | `POST /rest/v1/rpc/<an anon-granted local_service SECURITY DEFINER fn>` with `Accept-Profile: local_service` | 401/403/404 (role has no `local_service` USAGE) |
| NEG-PUB-1 | `POST /rest/v1/rpc/rls_auto_enable` (`Accept-Profile: public`) | 404 (event-trigger callback, not an RPC for this role) |

### Direct table read / write outside the contract

| ID | Request | Expected failure |
|---|---|---|
| NEG-TBL-1 | `GET /rest/v1/<a ps01 table>?limit=1` (`Accept-Profile: ps01`) | 401/403/404 — no SELECT grant to `ps01_line_runtime` |
| NEG-TBL-2 | `POST /rest/v1/<a ps01 table>` with a body (`Content-Profile: ps01`) | 401/403/404 — no INSERT grant |
| NEG-LS-1 | `GET /rest/v1/shop_public_profile?limit=1` (`Accept-Profile: local_service`) | 401/403/404 — `local_service` not reachable by this role (even though it is an exposed schema and a SECURITY DEFINER view) |

### Internal / other-product schemas

| ID | Request | Expected failure |
|---|---|---|
| NEG-INT-1 | `GET /rest/v1/<ps01_internal table>` (`Accept-Profile: ps01_internal`) | 404 — schema not in Data API exposure |
| NEG-MT-1 | `GET /rest/v1/<mt01 table>` (`Accept-Profile: mt01`) | 404 — not exposed |
| NEG-MT-2 | `GET /rest/v1/<mt01_private object>` (`Accept-Profile: mt01_private`) | 404 |
| NEG-WPI-1 | `GET /rest/v1/runtime_token_grants` (`Accept-Profile: wstera_platform_internal`) | 404 — platform-internal schema never exposed |

### Managed shared surfaces (`net`, `cron`, `auth`, `storage`, `extensions`)

| ID | Request | Expected failure |
|---|---|---|
| NEG-NET-1 | `POST /rest/v1/rpc/http_post` and `GET /rest/v1/_http_response` (`Accept-Profile: net`) | 404 — `net` not exposed, though the underlying Postgres role still inherits `net` USAGE/EXECUTE from PUBLIC (H1/H3B). This is the core H3C boundary proof. |
| NEG-CRON-1 | `GET /rest/v1/job` (`Accept-Profile: cron`) | 404 |
| NEG-AUTH-1 | `GET /rest/v1/users` (`Accept-Profile: auth`) | 404 |
| NEG-STOR-1 | `GET /storage/v1/bucket` with the runtime token | 401/403 — token role is not `service_role`; `storage` API not authorized for `ps01_line_runtime` |
| NEG-EXT-1 | `Accept-Profile: extensions` on any object | 404 |

### Token-level failures (fail closed)

| ID | Request | Expected failure |
|---|---|---|
| NEG-EXP-1 | POS-1 shape, but with an **expired** runtime token (operator supplies via `H3C_EXPIRED_JWT`, or harness waits out `exp`) | 401 (`PGRST301` / JWT expired) |
| NEG-SIG-1 | POS-1 shape, token with a **tampered signature** (harness flips one byte of the sig) | 401 — signature invalid |
| NEG-SIG-2 | POS-1 shape, token with a tampered **payload** (`role` changed to `postgres`, original signature kept) | 401 — signature no longer matches |
| NEG-ROLE-2 | POS-1 shape, token whose `role` claim is `service_role` / `authenticator` / `postgres`, **validly signed** — only possible if the hook or a House operator mints it; if unobtainable, mark `NOT TESTABLE WITHOUT SIGNING PATH` | Data API must reject: `authenticator` is not a SET-member of those roles → "permission denied to set role" / 401/403 |
| NEG-KEY-1 | POS-1 shape, valid runtime token, **omit the `apikey` header** | 401 from the API gateway (Kong) before PostgREST |
| NEG-ANON-1 | POS-1 shape, **no `Authorization` header**, only `apikey: <anon>` | request runs as `anon`; `rpc/get_customer_booking_context_v2_internal` → 404 (anon has no EXECUTE) — proves the RPC is not accidentally anon-callable |

### Search-path / DEFINER hardening (TM-9 / WP-F)

| ID | Request | Expected |
|---|---|---|
| NEG-PATH-1 | POS-1 shape with a crafted `search_path` request parameter/header | ignored or rejected; the harness also records that `ps01_line_runtime` has no writable schema in which to plant a shadow object (structurally cannot exploit). PS01 should still pin `search_path` on `ps01_request_user_id/_email/_name`. |

## Result classification

- `PASS` — expected outcome observed with re-checkable evidence (status + code + trimmed body).
- `FAIL` — unexpected success, or an unexpected error masking a possible success.
- `RUNTIME-BLOCKED` — could not run because House has not provisioned the identity/token/fixtures. **Not** a pass.
- `NOT TESTABLE` — requires a signing path the design deliberately withholds (only `NEG-ROLE-2`); documented, not counted against the gate.

## Gate rule

H3C-7 is PASS only when: all TOK checks pass; POS-1..3 reach the boundary; POS-AUTHZ-1..3 prove RPC-body authorization (or House explicitly accepts them as separately owned PS01 verification with its own evidence); and **every** NEG probe is `PASS` (fails closed). Any `FAIL`, or any `RUNTIME-BLOCKED` on a security-relevant NEG probe, keeps H3C `NOT PASS`.
