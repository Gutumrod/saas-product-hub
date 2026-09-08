# CLAUDE — H3C Threat Model / Failure Modes (Work Package C)

**Date:** 2026-09-08 (Asia/Bangkok)
**Mode:** PREPARE ONLY / NO LIVE MUTATION
**Chain under analysis:**

```
LAB service identity
  → Supabase Auth (GoTrue, commit 0907af9b…)
  → wstera_platform_internal.custom_access_token_hook(jsonb)   [SECURITY INVOKER, runs as supabase_auth_admin]
  → signed ES256 JWT  (role=ps01_line_runtime, exp ≤ iat+300)
  → Supabase Data API (Kong → PostgREST authenticator)
  → SET LOCAL ROLE ps01_line_runtime   [NOLOGIN, SET-only membership, NOINHERIT]
  → USAGE ps01 + EXECUTE on exactly 3 SECURITY DEFINER RPCs (owned by ps01_migrator)
  → PS01 Customer LINE Booking V2 domain
```

**Tags:** VERIFIED FACT / INFERENCE / BLOCKER / RECOMMENDATION.
Each failure mode: **Preventive control**, **Detection evidence**, **Rollback/recovery**, **Blocks H3C? (Y/N)**.

---

## TM-1 — Service identity compromise (LAB Auth user credentials leak)

- **Vector.** Attacker signs in as the LAB service identity → hook fires (row enabled) → gets `role=ps01_line_runtime` tokens.
- **Blast radius.** Bounded to the 3 PS01 Customer LINE RPCs. No table DML, no other schema, no `net`/`cron`/`auth`/`storage` (not exposed to that role via Data API). The 3 RPCs are SECURITY DEFINER and enforce `p_verified_line_user_id` + shop scoping internally, so the attacker still cannot read arbitrary customer data without a valid verified-LINE-user context (see TM-11).
- **Preventive control.** LAB-only identity; credentials never in repo or product runtime (brief H3C-3); `runtime_token_grants.valid_until` short (RECOMMENDATION: ≤ proof session); grant row `enabled=false` except during the active proof window; identity deleted in H3C-8.
- **Detection evidence.** `auth.audit_log_entries` for the service `user_id` (logins, token refreshes); Data API request logs showing `role=ps01_line_runtime` calls outside the proof window; `runtime_token_grants.updated_at`.
- **Rollback/recovery.** Ban/delete the service user (kills sessions + refresh tokens) → then delete grant row → then disable hook (ordering per WP-B STEP 4). Rotate nothing project-wide (no shared secret involved).
- **Blocks H3C?** **N** — provided the identity is LAB-only, short-lived, and deleted after the run. **RECOMMENDATION:** treat the service identity like a secret; never reuse it for Production.

## TM-2 — Refresh-token persistence after the 5-minute access token expires  *(highest-priority finding)*

- **VERIFIED FACT.** `GenerateAccessToken` runs the hook on **every refresh** (`service.go:598` inside `RefreshTokenGrant`), not only at sign-in. While the grant row is `enabled` and unexpired, each refresh mints a new ≤5-min `ps01_line_runtime` token — intended.
- **VERIFIED FACT / BLOCKER-ADJACENT.** Once the grant row is disabled/deleted/expired, the hook returns the claims **unchanged** → the next refresh yields `role=authenticated` (the service identity's real role). `authenticated` reaches every exposed schema (`public`, `graphql_public`, `local_service`, `ps01`) through the Data API — **broader than the H3C contract**.
- **Preventive control.** **Cleanup ordering:** invalidate the service identity (delete/ban + revoke sessions) **before** removing the grant row or disabling the hook. Short session timebox on the LAB identity. `valid_until` ≤ proof window so the grant self-expires even if a step is missed.
- **Detection evidence.** `auth.refresh_tokens` / `auth.sessions` rows for the service `user_id` after H3C-8 (must be zero); Data API logs showing any `role=authenticated` call from the proof client after cleanup.
- **Rollback/recovery.** Delete the service user; if a leak is suspected, also review `local_service` / `ps01` Data API logs for `authenticated`-role access in the exposure window.
- **Blocks H3C?** **Y until the runbook is reordered.** The brief's current "Rollback Order" (disable hook → remove grant rows → … → identity revocation deferred to H3C-8 bullet 2) is the wrong sequence. `CLAUDE-H3C-HOSTED-AUTH-ACTIVATION-ROLLBACK-2026-09-08.md` STEP 4 encodes the fix. Once adopted: **N**.

## TM-3 — Stolen access-token replay

- **Vector.** A minted `ps01_line_runtime` JWT is captured (logs, proxy, client).
- **Preventive control.** ES256 signed; ≤5-min lifetime (VERIFIED in the signed token); no refresh capability in the token itself; PS01 runtime client uses `persistSession:false`. Bounded scope (3 RPCs) limits value.
- **Detection evidence.** Data API logs: same `jti`/`session_id` from multiple IPs; calls after `exp`.
- **Rollback/recovery.** Wait out ≤5 min, or delete the grant row to stop new mints, or ban the identity to kill the session. No project-wide action.
- **Blocks H3C?** **N.** The 5-minute cap is the designed mitigation and is VERIFIED. **RECOMMENDATION:** harness and operators must never log full tokens (harness prints only `iss`, `role`, `exp`, `iat`, first 6 chars of `sub`).

## TM-4 — `expires_in` / `expires_at` response metadata not capped  *(new finding, WP-A A4)*

- **VERIFIED FACT.** GoTrue returns `expires_at = issuedAt + config.JWT.Exp` (uncapped) in the OAuth response while the JWT `exp` is hook-capped to ≤5 min. A client trusting `expires_in` over-estimates token life.
- **Impact.** Availability/UX only (401s until the client refreshes). Not privilege escalation. PS01 client has `autoRefreshToken:false` so it is unaffected; a naive operator script could be surprised.
- **Preventive control.** Harness computes the window from decoded JWT `exp` only. Operator runbook states the same.
- **Detection evidence.** Decoded JWT `exp − iat` vs response `expires_in` mismatch (harness records both).
- **Rollback/recovery.** n/a (no state change).
- **Blocks H3C?** **N.** **RECOMMENDATION:** file upstream as a GoTrue metadata-consistency bug; do not gate H3C on it.

## TM-5 — Allowlist grant accidentally left enabled after the proof

- **Vector.** `runtime_token_grants` row stays `enabled=true` with a far-future / null `valid_until`.
- **Preventive control.** `CHECK (valid_until IS NULL OR valid_until > created_at)` exists but permits NULL. **RECOMMENDATION:** for the LAB proof, always set a concrete `valid_until` (hours), never NULL. The rollback SQL's guard already refuses to drop the schema while `enabled OR valid_until IS NULL OR valid_until > now()` — a NULL `valid_until` therefore also *blocks rollback*, which is a useful forcing function but means the operator must explicitly disable the row.
- **Detection evidence.** Post-proof query: `SELECT * FROM wstera_platform_internal.runtime_token_grants WHERE enabled OR valid_until IS NULL OR valid_until > now();` must return 0.
- **Rollback/recovery.** Delete the row; ban the identity.
- **Blocks H3C?** **N**, but the H3C-8 evidence MUST include the zero-row query output.

## TM-6 — Hook failure affecting ordinary Auth users

- **VERIFIED FACT.** For a non-allowlisted user, the hook takes the `v_database_role IS NULL` branch and returns the original claims — no `RAISE`, no `jsonb_set`. Ordinary users are unaffected while the hook is enabled.
- **VERIFIED FACT (edge).** The hook's first statement `IF jsonb_typeof(v_claims) <> 'object' THEN RAISE EXCEPTION` executes for *every* invocation before the allowlist lookup. If a future GoTrue change ever sent a malformed `claims`, this would break sign-in for all users. GoTrue's contract guarantees a claims object, so risk is low.
- **VERIFIED FACT (timeout).** The hook runs under `set local statement_timeout '2000'`. The hook is an indexed PK lookup + one `pg_roles` scan — sub-millisecond. A `runtime_token_grants` table bloated with millions of rows could theoretically approach the limit; it will hold a handful of LAB rows.
- **Preventive control.** Keep the hook body minimal and side-effect-free (`STABLE`, no writes). Keep `runtime_token_grants` tiny. **RECOMMENDATION (optional):** return `event->'claims'` unchanged instead of `RAISE` on a non-object, to fail-open for the untargeted population.
- **Detection evidence.** `auth` logs show hook errors; a spike in failed token issuance after enable; Security Advisor.
- **Rollback/recovery.** Disable the hook (Dashboard) — instantly restores default token issuance for all users.
- **Blocks H3C?** **N.** **RECOMMENDATION:** the live run should include one control check — sign in as a *non-allowlisted* Auth user while the hook is enabled and confirm the token is unchanged (`role=authenticated`, normal `exp`). Named `POS-CONTROL-1` in the negative matrix.

## TM-7 — Role-name injection / unexpected database role in the claim

- **Vector.** The hook, or a compromised allowlist row, sets `role` to something other than `ps01_line_runtime` (e.g. `postgres`, `supabase_admin`, `service_role`, `authenticator`).
- **Preventive control (defense in depth, all VERIFIED in the migration SQL).**
  1. `runtime_token_grants.database_role` has `CHECK (database_role = 'ps01_line_runtime')` — the table physically cannot hold another role.
  2. The hook re-checks `v_database_role <> 'ps01_line_runtime'` → `RAISE`.
  3. The hook re-checks `pg_roles` that the target is `NOT rolcanlogin AND NOT rolsuper AND NOT rolcreatedb AND NOT rolcreaterole AND NOT rolbypassrls` → `RAISE` otherwise.
  4. Even if a bad `role` were signed into a JWT, PostgREST/`authenticator` can only `SET ROLE` to roles it is a **member of with SET TRUE** — currently only `ps01_line_runtime` (and the standard `anon`/`authenticated`). `SET ROLE postgres` fails: `authenticator` is not a member.
- **Detection evidence.** Any `RAISE` from the hook in `auth` logs; Data API 401/403 with "role … does not exist" or "permission denied to set role".
- **Rollback/recovery.** n/a — blocked before issuance or before role switch.
- **Blocks H3C?** **N.** Four independent controls. **RECOMMENDATION:** negative matrix `NEG-ROLE-2` — hand-craft (out of band, for the test only) a token with `role=postgres` signed by… *(cannot — no signing key)*. Instead test `role=service_role` and `role=authenticator` are refused by the Data API for the `authenticator` membership set (these are separate roles `authenticator` is not a SET member of in the standard topology — **INFERENCE, verify live**).

## TM-8 — Privilege escalation through PUBLIC / managed `net` privileges

- **VERIFIED FACT (H1 + H3B).** The `ps01_line_runtime` *Postgres role* still has `USAGE` on schema `net` and `EXECUTE` on all 12 `net` functions, inherited from `PUBLIC`. This is the unfixed platform ACL defect.
- **VERIFIED FACT.** `net` is **not** in `pgrst.db_schemas` (`public, graphql_public, local_service, ps01`). H1 found **no** function in any exposed schema that references `net.*`. H3B re-confirmed and additionally revoked PUBLIC EXECUTE from the one PS01 trigger function.
- **The H3C claim.** The inherited `net` capability is **not reachable through the supported Data API path** for a `role=ps01_line_runtime` token, because (a) `net` is not exposed, so `Accept-Profile: net` → 404, and (b) no exposed RPC bridges to `net`.
- **Preventive control.** Execution-boundary neutralization (H2 design) — no direct DB LOGIN for the product; the only channel is PostgREST, which only exposes the 4 schemas.
- **Detection evidence.** Harness `NEG-NET-1` (`POST /rest/v1/rpc/http_post` + `GET /rest/v1/_http_response` with `Accept-Profile: net` → must 404) and `NEG-NET-2` (re-scan exposed schemas for any `net.*`-referencing function). Data API logs for any `net`-schema request.
- **Rollback/recovery.** n/a for H3C. The managed-ACL fix is a **separate House track** (H2 "Managed ACL Hardening Track").
- **Blocks H3C?** **N for the H3C role-scoped proof** (the boundary holds via non-exposure). **Y for a global `SHARED-RUNTIME PLATFORM ISOLATION: PASS`** — the `PUBLIC` grant on `pg_net` remains a platform defect for any *direct-DB* identity and must be architecturally neutralized for **every** product (not just PS01) before the global gate. H3C proves the pattern for one product; it does not close the platform finding.

## TM-9 — Calling unintended SECURITY DEFINER functions

- **Vector.** The 3 target RPCs are SECURITY DEFINER owned by `ps01_migrator`; a 4th PS01 SECURITY DEFINER function, or a `local_service` / `public` one, is reachable.
- **VERIFIED FACT.** H3B: `ps01_line_runtime` has EXECUTE on **exactly 3** `ps01` functions, `0` direct table writes; the 4th PS01 function (`sync_booking_occupancy_window`, a trigger fn) had its PUBLIC EXECUTE revoked. The 11 anon- / 46 authenticated-executable SECURITY DEFINER functions (Security Advisor) are granted to `anon`/`authenticated`, **not** to `ps01_line_runtime`.
- **Preventive control.** Exact per-function GRANT; `USAGE` on `ps01` only; no `local_service`/`public`-beyond-default reach; the migration self-check asserts executable count = 3.
- **Detection evidence.** Harness `NEG-SD-1` (call a known 4th `ps01` function → must 404/403), `NEG-ROLE-1` (call an `anon`-granted `local_service` SECURITY DEFINER RPC → must fail), `NEG-PUB-1` (`public.rls_auto_enable()` via RPC → must fail).
- **Rollback/recovery.** n/a — no grant exists to exploit.
- **Blocks H3C?** **N.** **RECOMMENDATION:** the 3 target RPC **bodies** must be confirmed (PS01-owned review) to enforce their own authorization (verified LINE user + shop scope) and to have pinned `search_path`, because as SECURITY DEFINER they run as `ps01_migrator` regardless of caller. This is the true authority boundary. See also TM-11.

## TM-10 — Bypass through exposed `public`, `local_service` or `ps01` APIs

- **VERIFIED FACT.** Exposed schemas: `public, graphql_public, local_service, ps01`. `ps01_line_runtime` has USAGE only on `ps01`; it has no `local_service` USAGE and only default `public` reach (no table/function grants beyond PUBLIC defaults, which for `local_service`/`ps01` objects it does not have).
- **Preventive control.** PostgREST resolves the request schema from `Accept-Profile` / `Content-Profile` and then runs as the JWT role; a role without `USAGE` on that schema gets a permission error.
- **Detection evidence.** Harness `NEG-LS-1` (`Accept-Profile: local_service` on `shop_public_profile` → fail), `NEG-GQL-1` (`/graphql/v1` with the runtime token → fail / empty), `NEG-PUB-2` (enumerate `public` tables via `/rest/v1/` → only PUBLIC-granted rows, expect none meaningful).
- **Rollback/recovery.** n/a.
- **Blocks H3C?** **N.** The `shop_public_profile` SECURITY DEFINER-view finding is a **global-gate** item (WP-F), not an H3C-role reachability item.

## TM-11 — Cross-product / cross-tenant access to BK01 / MT01 / PS01-internal surfaces

- **VERIFIED FACT.** `ps01_line_runtime` has **no** USAGE on `local_service`, `ps01_internal`, `mt01`, `mt01_private`, `auth`, `storage`, `cron` (H3B self-check + H3B/H3C1 post-apply evidence).
- **Residual authority boundary.** The 3 SECURITY DEFINER RPCs run as `ps01_migrator` (which owns `ps01` + `ps01_internal`). A caller with a valid `ps01_line_runtime` token but a *forged verified-LINE-user id* or a *cross-shop* `p_shop_id` must be rejected **by the RPC body**, not by the role. This is the single most important thing the live run must prove.
- **Preventive control.** RPC-internal authorization (PS01-owned); `p_verified_line_user_id` must be server-verified upstream (LINE Login token exchange in `line-booking-core.ts` before the RPC is called — VERIFIED that the prototype verifies the LINE id token via `requireLineLoginEnv().channelId` before calling the RPC).
- **Detection evidence.** Harness `POS-AUTHZ-1..3`: for each RPC, a fixture with (a) a mismatched shop, (b) an unverified/blank LINE user id, (c) another customer's pet ids → must be rejected with a domain error, not return another tenant's data. `NEG-INT-1`: `Accept-Profile: ps01_internal` → 404.
- **Rollback/recovery.** n/a for the boundary; if an RPC body is found to over-trust, that is a PS01 remediation and H3C **fails** until fixed.
- **Blocks H3C?** **Y if any of the 3 RPC bodies fail their own tenant/identity checks.** This must be part of the live H3C-7 matrix, not assumed from the role grant alone (per the platform "Independent Verification" rule — a narrow role does not prove a safe RPC).

## TM-12 — Hook / allowlist tampering (write path to `runtime_token_grants`)

- **VERIFIED FACT.** `runtime_token_grants`: `REVOKE ALL … FROM PUBLIC, anon, authenticated, service_role, authenticator, ps01_migrator, ps01_runtime, ps01_runtime_login, ps01_line_runtime`. `supabase_auth_admin` has **SELECT only** (INSERT/UPDATE/DELETE = false, confirmed live in H3C1). Schema `wstera_platform_internal` owner = `postgres`, `REVOKE ALL … FROM PUBLIC`, not in Data API.
- **Who can write the allowlist?** Only `postgres` (platform migration authority) — i.e. House. Not GoTrue, not any product/anon/authenticated/service role, not via the Data API.
- **Detection evidence.** `runtime_token_grants.updated_at` / row count vs the H3C1 baseline (0); Security Advisor for any new exposure of `wstera_platform_internal`; the migration's own post-conditions.
- **Rollback/recovery.** `TRUNCATE`/`DELETE` the table (House), then rollback SQL.
- **Blocks H3C?** **N.** Write path is correctly platform-only.

## TM-13 — Signing-material exposure

- **VERIFIED FACT (design).** House never receives the project signing private key or legacy JWT secret; the token is Auth-issued and Auth-signed (ES256/JWKS). The product repo/runtime holds only a short-lived bearer token (`PS01_RUNTIME_JWT` env, server-only).
- **Preventive control.** Nothing in H3C reads or copies signing material. The harness verifies signatures using the **public** JWKS only.
- **Detection evidence.** `git diff` / secret scan of the branch (must be clean); no `SUPABASE_JWT_SECRET` / private key in any artifact.
- **Rollback/recovery.** n/a.
- **Blocks H3C?** **N** — and this is a core design strength vs. a self-signed-token approach.

## TM-14 — Data API infrastructure assumptions (Kong / PgBouncer / PostgREST)

- **INFERENCE.** The Supabase Data API path is Kong (API key + routing) → PostgREST (`authenticator` LOGIN, per-request `SET LOCAL ROLE`, transaction-scoped). The `apikey` header (publishable/anon key) is required by Kong in addition to the `Authorization: Bearer` token. A request with a valid runtime JWT but **no `apikey`** is rejected by Kong before PostgREST.
- **Detection evidence.** Harness `NEG-KEY-1` (valid runtime token, omit `apikey` → 401 from Kong).
- **Blocks H3C?** **N.** **RECOMMENDATION:** the harness must send the anon/publishable key as `apikey` exactly as `lib/ps01-runtime.ts` does (`createClient(url, anonKey, { global.headers.Authorization })` — supabase-js sends both `apikey: anonKey` and the Bearer).

---

## Summary — does anything block H3C?

| # | Failure mode | Blocks H3C? |
|---|---|---|
| TM-1 | Service identity compromise | N (LAB-only, short-lived, deleted) |
| TM-2 | **Refresh after expiry → `authenticated` restored** | **Y until runbook reordered** (fix in activation doc STEP 4) |
| TM-3 | Stolen token replay | N (5-min cap VERIFIED) |
| TM-4 | `expires_in` not capped | N (UX only; file upstream) |
| TM-5 | Grant left enabled | N (require concrete `valid_until`; zero-row evidence) |
| TM-6 | Hook breaks ordinary users | N (non-allowlisted branch is a no-op; add `POS-CONTROL-1`) |
| TM-7 | Role-name injection | N (4 independent controls) |
| TM-8 | `net` / PUBLIC escalation | **N for H3C role proof; Y for global platform PASS** |
| TM-9 | Unintended SECURITY DEFINER call | N (exact 3-function grant) |
| TM-10 | Exposed-schema bypass | N |
| TM-11 | **Cross-tenant via RPC body over-trust** | **Y if any of the 3 RPC bodies fail their own checks** — must be in the live matrix |
| TM-12 | Allowlist tampering | N (platform-only write path) |
| TM-13 | Signing-material exposure | N (design strength) |
| TM-14 | Data API infra assumptions | N |

**Two things gate the live proof:** (1) reorder the identity-revocation step ahead of hook/grant teardown (TM-2); (2) the live H3C-7 matrix must actively prove the 3 RPC bodies enforce verified-LINE-user + shop scoping (TM-11), not infer safety from the role grant.

**One thing gates the *global* Shared-Runtime Isolation PASS but not H3C itself:** the managed `pg_net` `PUBLIC` ACL (TM-8) plus the broad SECURITY DEFINER / `shop_public_profile` surface (WP-F).
