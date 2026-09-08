# CLAUDE — H3C Data API Positive / Negative Matrix (Work Package E)

**Date:** 2026-09-08 · **Rev:** 2 (post House review `HOUSE-REVIEW-CLAUDE-H3C-PROOF-PACK-2026-09-08.md`).
**Implemented by:** `tools/shared-runtime/h3c/h3c-proof-harness.mjs`.
**Run by:** WSTERA House operator, after H3C-3/4/5 provisioning, against WSTERA LAB only.

## Ground rules

- **Safe by default — no mutation.** Every default-mode probe is a `GET`, or a `POST` to one of the two read/compute RPCs (`get_customer_booking_context_v2_internal`, `quote_customer_booking_v2_internal`). The harness **never** calls `submit_booking_request_v2_internal` and **never** issues a table `INSERT/PUT/DELETE` in default mode. Negative RPC probes use `GET /rest/v1/rpc/<fn>` so a role that *can* execute a VOLATILE function gets `405` (no execution) rather than running it. (House H-02, H-03)
- **The submit EXECUTE grant is proven offline** from committed H3B privilege evidence (`POS-GRANTS`), not by invoking submit. (House H-02)
- A non-2xx result counts as "reached the function boundary" **only** when the error is unambiguously raised inside the target Postgres function (SQLSTATE class `22`/`23`/`40`/`09`/`2F`/`P0…`). Generic `5xx`, transport errors, `PGRST202`/`PGRST301`/`PGRST100`, `404`, `405` never count. (House H-04)
- Token/project identity is validated **only** from the JWT issuer, a `ref` claim, and the LAB JWKS — never from the configured target URL. (House H-05)
- Any token used as evidence (runtime token AND control token) gets the full signature + issuer + project-ref + expiry check before its role/lifetime is read. (House H-06)
- **Unexpected success on any negative probe is a GATE FAILURE.** So is a missing required probe, a duplicate probe id, or an unknown verdict value.
- Tokens/keys/secrets are never printed. At most: `iss`, `role`, `exp`, `iat`, `kid`, 6-char `sub` prefix.

## Required-probe contract (the gate — House H-01)

Final `PASS` requires **every** id below present exactly once with verdict `PASS`, and **no** `FAIL` anywhere:

```
TOK-1 TOK-2 TOK-3 TOK-4 TOK-5 TOK-6 TOK-7
POS-1 POS-2 POS-GRANTS POS-AUTHZ-1 POS-AUTHZ-2 POS-AUTHZ-3 POS-CONTROL-1
NEG-SD-1 NEG-SD-2 NEG-ROLE-1 NEG-PUB-1 NEG-TBL-1 NEG-TBL-2 NEG-LS-1
NEG-INT-1 NEG-MT-1 NEG-MT-2 NEG-WPI-1 NEG-NET-1 NEG-NET-1b NEG-CRON-1
NEG-AUTH-1 NEG-EXT-1 NEG-STOR-1 NEG-EXP-1 NEG-SIG-1 NEG-SIG-2 NEG-KEY-1 NEG-ANON-1
```

A required probe that is `RUNTIME-BLOCKED` (fixture/token not supplied) **keeps the verdict below PASS** — the operator must supply the input, it is not waived.

**Advisory probes** (may be non-PASS without blocking the gate; a `FAIL` on them still blocks via the any-FAIL rule):

- `NEG-ROLE-2` — `NOT TESTABLE`: a validly-signed token with `role=service_role/authenticator/postgres` cannot be produced without a signing path the design withholds. Covered by threat-model TM-7 (table `CHECK` + hook role re-check + `pg_roles` attribute check + `authenticator` not a SET-member of those roles).
- `POS-3` — the mutating submit probe. `RUNTIME-BLOCKED` unless `H3C_ALLOW_SUBMIT_PROBE=1` + `H3C_SUBMIT_DISPOSABLE_ACK=1` + disposable fixtures; even then it is advisory and the operator must verify/clean up.

## Token pre-checks (fail closed before any probe)

| ID | Check | Expected |
|---|---|---|
| TOK-1 | JWT header `alg` | `ES256` |
| TOK-2 | Signature verifies against `${url}/auth/v1/.well-known/jwks.json` (key by `kid`) | valid |
| TOK-3 | `iss` matches `https://<20-char ref>.supabase.co/auth/v1` shape | yes |
| TOK-4 | `role` claim | exactly `ps01_line_runtime` |
| TOK-5 | `exp − iat` (from the JWT) | `> 0` and `≤ 300` s |
| TOK-6 | `exp` in the future | yes |
| TOK-7 | project ref = `ykxlqnshaaxmzzocpjlj`, derived from **issuer / `ref` claim / JWKS URL only** | yes |

If any TOK-* fails, the harness records the failure and runs **no** live probes.

## Positive matrix

| ID | Request | Pass condition |
|---|---|---|
| POS-1 | `POST /rest/v1/rpc/get_customer_booking_context_v2_internal` · `apikey`, `Authorization: Bearer`, `Accept/Content-Profile: ps01` · body `{p_verified_line_user_id, p_shop_id}` (fixtures or `""`/nil-uuid) | `boundaryReached` — 2xx, or a 4xx whose SQLSTATE is an in-function error. Proves role + grant + `SET LOCAL ROLE` + `ps01` schema resolution. |
| POS-2 | same for `quote_customer_booking_v2_internal` (6 args) | same. `quote` is a pricing/compute RPC — non-persistence by the Order V1 / PS01 contract (House to confirm from RPC source). |
| POS-GRANTS | **offline.** Reads the H3B evidence file (`H3C_H3B_EVIDENCE`) and asserts it documents: all three RPC names, "execute exactly three PS01 functions and no fourth", and "Direct write-capable privileges on PS01 relations: `0`". | all three assertions true. This is the proof that `ps01_line_runtime` holds EXECUTE on exactly the 3 RPCs **including submit**, and zero table writes — without invoking submit. `RUNTIME-BLOCKED` (→ blocks PASS) if the file is not supplied. |
| POS-3 | *(advisory, opt-in)* `POST /rest/v1/rpc/submit_booking_request_v2_internal` — **only** when `H3C_ALLOW_SUBMIT_PROBE=1` + `H3C_SUBMIT_DISPOSABLE_ACK=1` + disposable fixtures. | boundary reached. **Mutating** — operator verifies and cleans up. Cannot make the gate PASS. |
| POS-AUTHZ-1 | POS-1 with `p_shop_id` = `H3C_FIX_OTHER_SHOP_ID` (a real shop the fixture LINE user is NOT linked to) | RPC does not return another shop's context (4xx, or a `null`/deny body). Weak signal from the harness — House also confirms from the RPC body / logs. `RUNTIME-BLOCKED` without the fixture. |
| POS-AUTHZ-2 | POS-1 with `p_verified_line_user_id = ""` and `p_shop_id = H3C_FIX_SHOP_ID` | no customer context returned (read-only probe). `RUNTIME-BLOCKED` without `H3C_FIX_SHOP_ID`. |
| POS-AUTHZ-3 | POS-2 with `p_pet_ids` = `H3C_FIX_OTHER_PET_IDS` (another customer's pets) | quote rejected / not returned. `quote` is compute-only, non-mutating. `RUNTIME-BLOCKED` without the fixtures. |
| POS-CONTROL-1 | `H3C_CONTROL_JWT` — a **signed** token for a NON-allowlisted LAB Auth user, issued while the hook is enabled. Full identity verify (H-06) + role/lifetime. | identity valid AND `role = authenticated` (unchanged) AND lifetime not capped. Proves the hook is a no-op for ordinary users (TM-6). `RUNTIME-BLOCKED` without the token. |

## Negative matrix (every one must fail closed: `401` / `403` / `404`)

### Non-allowlisted RPC / unintended SECURITY DEFINER — `GET /rest/v1/rpc/<fn>`

| ID | Function / profile | Expected |
|---|---|---|
| NEG-SD-1 | `sync_booking_occupancy_window` / `ps01` | `404 PGRST202` (no EXECUTE for this role). GET form → a VOLATILE fn also yields `405`, never execution. |
| NEG-SD-2 | `H3C_PS01_OTHER_RPC` (a real 4th `ps01` fn from live metadata) / `ps01` | `404` / `403` |
| NEG-ROLE-1 | `H3C_LOCAL_SERVICE_FN` (an anon-granted `local_service` SECURITY DEFINER fn) / `local_service` | `401` / `403` / `404` — role has no `local_service` USAGE |
| NEG-PUB-1 | `rls_auto_enable` / `public` | `404` — event-trigger callback, not an RPC for this role |

### Direct read / write outside the contract

| ID | Request | Expected |
|---|---|---|
| NEG-TBL-1 | `GET /rest/v1/<H3C_PS01_TABLE>?limit=1` (`Accept-Profile: ps01`) | `401` / `403` / `404` — no SELECT grant |
| NEG-TBL-2 | `PATCH /rest/v1/<H3C_PS01_TABLE>?id=eq.<nil-uuid>` (`Content-Profile: ps01`, body `{<H3C_PS01_TABLE_COL>: null}`, `Prefer: return=minimal`) | `401` / `403` / `404`. **Non-mutating** — the PK matches no row even if the role had UPDATE. A `2xx`/`204` means the role holds write authority → **FAIL**. `RUNTIME-BLOCKED` without `H3C_PS01_TABLE_COL`. |
| NEG-LS-1 | `GET /rest/v1/shop_public_profile?limit=1` (`Accept-Profile: local_service`) | `401` / `403` / `404` — `local_service` unreachable by this role even though it is exposed and a SECURITY DEFINER view (WP-F) |

### Internal / other-product / platform-internal schemas — `GET`

| ID | Profile / object | Expected |
|---|---|---|
| NEG-INT-1 | `ps01_internal` / `H3C_PS01_INTERNAL_OBJ` | `404` — not in Data API exposure |
| NEG-MT-1 | `mt01` / `H3C_MT01_TABLE` | `404` |
| NEG-MT-2 | `mt01_private` / any | `404` |
| NEG-WPI-1 | `wstera_platform_internal` / `runtime_token_grants` | `404` — platform-internal schema never exposed |

### Managed shared surfaces — `GET`

| ID | Profile / object | Expected | Note |
|---|---|---|---|
| NEG-NET-1 | `net` / `_http_response` | `404` | core H3C boundary proof — the Postgres role still inherits `net` USAGE/EXECUTE from PUBLIC (H1/H3B) but `net` is not exposed. GET on a table, not an RPC — no `http_post` side effect. |
| NEG-NET-1b | `net` / `http_request_queue` | `404` | |
| NEG-CRON-1 | `cron` / `job` | `404` | |
| NEG-AUTH-1 | `auth` / `users` | `404` | |
| NEG-EXT-1 | `extensions` / any | `404` | |
| NEG-STOR-1 | `GET /storage/v1/bucket` with the runtime token | `401` / `403` | token role is not `service_role`; Storage API not authorized for `ps01_line_runtime` |

### Token-level failures

| ID | Request | Expected |
|---|---|---|
| NEG-EXP-1 | POS-1 shape with `H3C_EXPIRED_JWT` (a previously issued, now expired runtime token) | `401`. `RUNTIME-BLOCKED` (→ blocks PASS) if the token is not supplied. |
| NEG-SIG-1 | POS-1 shape, one byte of the signature flipped | `401` |
| NEG-SIG-2 | POS-1 shape, payload `role` rewritten to `postgres`, original signature kept | `401` — signature no longer matches |
| NEG-ROLE-2 | *(advisory)* validly-signed foreign-role token | `NOT TESTABLE` — no signing path; covered by TM-7 |
| NEG-KEY-1 | POS-1 shape, valid runtime token, **omit `apikey`** | `401` from the API gateway (Kong) |
| NEG-ANON-1 | POS-1 shape, **no `Authorization`**, only `apikey` | request runs as `anon` → `404 PGRST202` (anon has no EXECUTE) |

### Search-path / DEFINER hardening (WP-F, offline note)

`NEG-PATH-1` is not a live probe. `ps01_line_runtime` has no writable schema in which to plant a shadow object, so a `search_path` shadowing attack against the 3 SECURITY DEFINER RPCs is structurally impossible from this role. PS01 should still pin `search_path` on `ps01.ps01_request_user_id/_email/_name` (WP-F) — verified during House's PS01-owned review, not by this harness.

## Result classification

- `PASS` — expected outcome with re-checkable evidence (`http`, `code`, trimmed `snippet`).
- `FAIL` — unexpected success, an ambiguous result (`5xx`, `405`, `400` without an in-function SQLSTATE), or a probe that should have failed closed and did not.
- `RUNTIME-BLOCKED` — input not supplied. For a required probe this **blocks** PASS.
- `NOT TESTABLE` — only `NEG-ROLE-2`; documented, advisory.

## Gate rule (implemented in `computeGate()`, exercised by `--selftest`)

`PASS` ⇔ (every required probe present exactly once with `PASS`) ∧ (no `FAIL` anywhere) ∧ (no duplicate id) ∧ (no unknown verdict) ∧ (no harness abort note). Otherwise `FAIL` (on any FAIL / duplicate / unknown) or `INCOMPLETE` (required probe missing or `RUNTIME-BLOCKED`).
