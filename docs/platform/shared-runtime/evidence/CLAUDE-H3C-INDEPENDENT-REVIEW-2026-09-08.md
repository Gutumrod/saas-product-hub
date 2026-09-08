# CLAUDE — H3C Independent Architecture Review (Work Package A + F)

**Date:** 2026-09-08 (Asia/Bangkok)
**Mode:** INDEPENDENT REVIEW / PREPARE ONLY / NO LIVE MUTATION
**Environment scope:** WSTERA LAB (`ykxlqnshaaxmzzocpjlj`) — not touched by this review
**Executor:** Claude Desktop
**Final reviewer:** WSTERA House / Secretary GPT
**Branch:** `review/claude-h3c-proof-20260908` (base `origin/master` = `ec56365`)

## Method

Audited "as if preparing to reject." Every architecture claim is traced to (a) current repository state, (b) current official Supabase documentation, or (c) current upstream implementation source at a pinned commit. Where none of those can settle a point without a live LAB run, the verdict is **UNPROVEN** with the exact missing evidence named. No point is inferred to PASS.

Finding tags: **VERIFIED FACT**, **SOURCE/DOC CONFLICT**, **INFERENCE**, **BLOCKER**, **RECOMMENDATION**.

## Sources inspected (exact revisions)

| Source | Revision / URL |
|---|---|
| supabase/auth `internal/tokens/service.go` | commit `0907af9bd6be3c76f472c40a7dcc0dc34abeffaf` (master HEAD, committed 2026-09-03) — `https://github.com/supabase/auth/blob/0907af9bd6be3c76f472c40a7dcc0dc34abeffaf/internal/tokens/service.go` |
| supabase/auth `internal/hooks/hookspgfunc/hookspgfunc.go` | same commit |
| supabase/auth `internal/api/token.go` (`RefreshTokenGrant` caller) | same commit |
| PostgREST `docs/references/auth.rst` | `main` — `https://github.com/PostgREST/postgrest/blob/main/docs/references/auth.rst` |
| PostgreSQL 17 `GRANT` (role membership `SET`/`INHERIT`) | `https://www.postgresql.org/docs/17/sql-grant.html` |
| Supabase Custom Access Token Hook | `https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook` |
| Supabase Auth Hooks (security guidance) | `https://supabase.com/docs/guides/auth/auth-hooks` |
| Supabase Management API — update auth config | `https://supabase.com/docs/reference/api/v1-update-auth-service-config` (`PATCH /v1/projects/{ref}/config/auth`) |
| Repo H1/H2/H3A/H3B/H3C1 evidence + `h3c_auth_runtime_token_support.sql` + rollback | this branch, `docs/platform/shared-runtime/**` |
| PS01 runtime prototype | `products/PawSpace-pssr02-staging` @ `c21c27c` (`lib/ps01-runtime.ts`, `lib/ps01-runtime-db.ts`, `lib/line-booking-server.ts`, `lib/ps01-schema.ts`, `lib/env.ts`) |

The Supabase docs pages above render server-side; exact quoted strings are reproduced inline below. The upstream `supabase/auth` HEAD is the **same commit** the repo's own `H3C-AUTH-HOOK-ROLE-VALIDATION-2026-09-08.md` cited — that prior evidence is still current as of this review.

---

## Work Package A — architecture audit verdicts

### A1 — Can hosted Supabase Auth issue a JWT whose `role` claim is a custom existing PostgreSQL role (`ps01_line_runtime`)?

**Verdict: VERIFIED (issuance mechanism) / UNPROVEN (hosted end-to-end).**

- **VERIFIED FACT.** `GenerateAccessToken()` in `service.go` builds `claims` with `Role: params.User.Role`, then — only when `config.Hook.CustomAccessToken.Enabled` — calls `s.hookManager.InvokeHook(tx, r, input, output)` and sets `gotrueClaims = jwt.MapClaims(output.Claims)` before `SignJWT`. The signed JWT therefore carries whatever `role` string the hook returns.
- **VERIFIED FACT.** `AccessTokenClaims.Role` is `string` (no type constraint). `MinimumViableTokenSchema` at this commit declares `"role": { "type": "string" }` with **no `enum`**. `validateTokenClaims(output.Claims)` runs immediately after the hook and only enforces the JSON-schema (string type + required-claim presence + `exp` integer). A custom role string such as `ps01_line_runtime` passes.
- **SOURCE/DOC CONFLICT (already known, restated).** The public Custom Access Token Hook doc renders a JSON-schema example that constrains `role` to `anon`/`authenticated`. That example does **not** match the enforced `MinimumViableTokenSchema` in source. The enforced schema wins. This is the same ambiguity `H3C-AUTH-HOOK-ROLE-VALIDATION` recorded; it remains a documentation defect, not a validator constraint.
- **VERIFIED (GoTrue runtime, House review V-4).** GoTrue's extensibility-point validation accepts any valid PostgreSQL schema identifier in `pg-functions://postgres/<schema>/<function>` and constructs a quoted `"<schema>"."<function>"` call from it; its own tests use non-`auth` schemas. So `wstera_platform_internal` is fine at the *runtime* level.
- **UNPROVEN (narrowed — B-2).** Whether the **hosted control plane** (Dashboard picker / Management-API field validation) accepts `wstera_platform_internal` in the hook URI, and whether the hosted LAB Auth service then issues a token with `role=ps01_line_runtime` for the LAB service identity.
  **Exact missing evidence:** the `GET /v1/projects/ykxlqnshaaxmzzocpjlj/config/auth` response showing `hook_custom_access_token_enabled=true` + `hook_custom_access_token_uri` set to the `wstera_platform_internal` URI, and a decoded (non-secret claims only) Auth-issued access token for the LAB service identity showing `role=ps01_line_runtime`, correct `iss`, and `exp − iat ≤ 300`.

### A2 — Does current GoTrue/Auth token validation accept arbitrary string roles in practice?

**Verdict: VERIFIED.**

- **VERIFIED FACT.** `service.go` line ~1004: `var schemaLoader = gojsonschema.NewStringLoader(MinimumViableTokenSchema)`; `validateTokenClaims` runs `gojsonschema.Validate` against the claims map. The schema's `role` property is `{"type":"string"}`; `required` is `["aud","exp","iat","sub","email","phone","role","aal","session_id","is_anonymous"]`. No enum, no pattern, no format on `role`.
- **VERIFIED FACT.** Post-hook validation is enforced: `if err := validateTokenClaims(output.Claims); err != nil { return "", 0, err }` sits between `InvokeHook` and `SignJWT`. A hook that drops a required claim, changes `exp` to a non-integer, or returns a non-string `role` causes token issuance to fail (fail-closed).
- **INFERENCE (low risk).** PostgREST/Data-API side does not re-enum `role`; it attempts `SET LOCAL ROLE <claim>` and relies on Postgres membership/existence (see A3). No allowlist of role names beyond Postgres was found in PostgREST docs.

### A3 — Can PostgREST `authenticator` SET the reviewed NOLOGIN role under H3B's PostgreSQL 17 membership semantics?

**Verdict: VERIFIED.**

- **VERIFIED FACT (PostgREST).** `auth.rst` (main): "When a request contains a valid JWT with a role claim PostgREST will switch to the database role with that name for the duration of the HTTP request"; "the database administrator must allow the authenticator role to switch into this user by previously executing `GRANT user123 TO authenticator;`"; the docs show `SET LOCAL ROLE user123;` — transaction-scoped, auto-reset at end of request.
- **VERIFIED FACT (PostgreSQL 17).** `sql-grant.html`: the `SET` option "if it is set to `TRUE`, allows the member to change to the granted role using the `SET ROLE` command … This option defaults to `TRUE`." The `INHERIT` option "if set to `FALSE`, the new member does not inherit." H3B applied `GRANT ps01_line_runtime TO authenticator WITH INHERIT FALSE, SET TRUE;` and its self-check asserts `pg_auth_members` has `set_option = true AND inherit_option = false`. H3B post-apply evidence confirms it live.
- **VERIFIED FACT (H3B live).** `H3B-POST-APPLY-RUNTIME-BOUNDARY` records member=`authenticator`, granted=`ps01_line_runtime`, `ADMIN=false`, `INHERIT=false`, `SET=true`, and executable-PS01-function count exactly `3`, direct table-write count `0`.
- **INFERENCE (well-supported).** `SET ROLE` to a `NOLOGIN` role: PostgreSQL's `rolcanlogin` gates connection authentication only, not `SET ROLE`. This is the exact mechanism Supabase's own `anon`/`authenticated` (both `NOLOGIN`) roles use behind `authenticator`. The PG17 `GRANT` page does not spell out "NOLOGIN" verbatim, hence INFERENCE not VERIFIED-by-quote, but it is the documented reference PostgREST topology and is already proven for the sibling roles in this same project.
- **RECOMMENDATION.** The live H3C matrix should still capture one explicit positive call as proof that the Supabase Data API path (Kong → PostgREST) performs the `SET LOCAL ROLE ps01_line_runtime` without an intermediate role-name gate. Named in the negative matrix as `POS-1`.

### A4 — Is the 5-minute `exp` cap valid, and can refresh behaviour accidentally restore broader authority?

**Verdict: VERIFIED (cap holds in the signed token) / BLOCKER-ADJACENT (refresh restores the identity's *original* role, which is broader than `ps01_line_runtime`).**

- **VERIFIED FACT (cap).** The hook sets `v_capped_exp = floor(extract(epoch FROM statement_timestamp() + interval '5 minutes'))` and `jsonb_set(v_claims,'{exp}', to_jsonb(least(v_original_exp, v_capped_exp)))`. `validateTokenClaims` requires `exp` be an integer (it is). `SignJWT(ctx, &config.JWT, gotrueClaims)` signs `gotrueClaims = jwt.MapClaims(output.Claims)` — i.e. **the capped `exp` is what gets signed**. The cryptographic token lifetime is ≤ 5 min. VERIFIED against source.
- **VERIFIED FACT (response metadata mismatch — new finding).** `GenerateAccessToken` returns `expiresAt.Unix()` where `expiresAt = issuedAt + config.JWT.Exp` — the **original, uncapped** value. `RefreshTokenGrant` then builds `AccessTokenResponse{ ExpiresIn: int(expiresAt - now), ExpiresAt: expiresAt }` from that uncapped number. So the OAuth response body advertises the full (e.g. 3600 s) lifetime while the JWT itself dies in ≤ 300 s.
  - **Consequence:** a client that schedules refresh from `expires_in` (default `supabase-js` behaviour) will get 401s for the window between real expiry and scheduled refresh. Not a privilege escalation. The PS01 runtime client sets `autoRefreshToken: false` and `persistSession: false`, so it is unaffected — but any operator/harness MUST read expiry from the decoded JWT `exp`, never from `expires_in`.
  - **RECOMMENDATION:** the proof harness verifies the window from `exp` only (implemented). House operator runbook should state the same. Consider filing this upstream as a GoTrue metadata-consistency bug; do not block H3C on it.
- **BLOCKER-ADJACENT (refresh authority).** `GenerateAccessToken` is invoked from BOTH initial issue (`service.go:944`) and every refresh (`service.go:598`, inside `RefreshTokenGrant`'s transaction). The hook re-runs on each refresh and re-reads `runtime_token_grants` (`enabled` + `valid_until > statement_timestamp()`).
  - While the grant row is enabled/unexpired: every refresh mints a fresh ≤5-min `role=ps01_line_runtime` token. Correct.
  - The moment the grant row is disabled, deleted, or `valid_until` passes: the hook hits `v_database_role IS NULL` and returns `jsonb_build_object('claims', v_claims)` **with the service identity's original role unchanged**. The LAB service identity is a normal Auth user whose real `role` is `authenticated`. So a still-live refresh token then yields `authenticated` access tokens — which, through the Data API, can address every exposed schema (`public`, `graphql_public`, `local_service`, `ps01`) as the `authenticated` PostgREST role. That is **strictly broader** than the 3-RPC `ps01_line_runtime` contract.
  - This is not "broader than intended for that human/service identity" in Postgres terms, but it **defeats the isolation intent** if the service identity's refresh token leaks and the cleanup order is wrong.
  - **RECOMMENDATION (must be in the runbook and threat model):** H3C-8 cleanup order must be **(1) delete/ban the LAB service Auth user (invalidates its sessions/refresh tokens) FIRST**, then (2) delete the grant row, then (3) disable the hook, then (4) revoke `supabase_auth_admin` grants / drop schema per rollback SQL. Disabling the hook or the row while leaving the service user alive is the dangerous sequence. The current brief's Rollback Order lists "Disable hosted Auth Hook config" as step 1 and "Remove runtime-token grant rows" as step 2 and defers identity revocation to H3C-8 bullet 2 — **reorder so identity revocation is not last.**
  - Also **RECOMMENDATION:** give the LAB service identity the shortest usable session timebox / disable refresh-token rotation reuse window for the proof, and set `runtime_token_grants.valid_until` to a few hours max (the brief already says "finite valid_until for the LAB proof window" — keep it ≤ the proof session).

### A5 — Does the proposed hook return shape preserve every required claim?

**Verdict: VERIFIED.**

- **VERIFIED FACT.** The hook does `v_claims := event -> 'claims'` (the complete claims object GoTrue built), then only `jsonb_set(v_claims,'{role}',…)` and `jsonb_set(v_claims,'{exp}',…)`, then `RETURN jsonb_build_object('claims', v_claims)`. Every other claim (`iss, aud, iat, sub, email, phone, aal, amr, session_id, is_anonymous, app_metadata, user_metadata, …`) passes through untouched.
- **VERIFIED FACT (belt-and-braces).** Even if the hook *did* drop a required claim, `validateTokenClaims(output.Claims)` would reject issuance for that user (fail-closed). For a non-allowlisted user the hook returns the original claims verbatim, so ordinary users are never affected.
- **RECOMMENDATION (minor, non-blocking).** The hook's first statement `IF jsonb_typeof(v_claims) <> 'object' THEN RAISE EXCEPTION` runs **before** the allowlist lookup, so a hypothetical GoTrue change that sent a malformed `claims` would break sign-in for *all* users, not just allowlisted ones. GoTrue's contract guarantees a claims object, so risk is low, but returning `event->'claims'` unchanged (or `event`) on a non-object would fail-open for the untargeted population without weakening the targeted path. Optional hardening; not required for H3C.

### A6 — Are `SECURITY INVOKER` + current `supabase_auth_admin` grants sufficient and safer than `SECURITY DEFINER`?

**Verdict: VERIFIED.**

- **VERIFIED FACT (safer).** Supabase Auth Hooks doc: "For security, we recommend against the use the `security definer` tag … it will have the extensive permissions of the `postgres` role which make it easier for undesirable actions to occur." The H3C migration's final `DO $$` block asserts `NOT prosecdef` (rejects a DEFINER hook). Correct posture.
- **VERIFIED FACT (executing role).** Supabase docs: `supabase_auth_admin` is "the Postgres role that is used by Supabase Auth to make requests to your database." The pgfunc dispatcher (`hookspgfunc.go`) runs `select "wstera_platform_internal"."custom_access_token_hook"($1)` on GoTrue's own DB connection inside a transaction with `set local statement_timeout` (2000 ms default). So the hook body executes with `supabase_auth_admin`'s privileges.
- **VERIFIED FACT (sufficient).** The hook body needs: `USAGE` on `wstera_platform_internal`, `SELECT` on `runtime_token_grants`, and read of `pg_roles`. The migration grants the first two to `supabase_auth_admin` explicitly; `pg_roles` is world-readable (`pg_catalog` view). `search_path = pg_catalog, wstera_platform_internal` is pinned on the function. The migration's verification block confirms `has_schema_privilege`/`has_table_privilege`/`has_function_privilege` for `supabase_auth_admin` and asserts `anon`/`authenticated`/`service_role`/`authenticator`/`ps01_line_runtime` have **no** schema USAGE.
- **INFERENCE.** No path lets a product/anon/authenticated role read or execute anything in `wstera_platform_internal` — the migration revokes `ALL` from `PUBLIC` on the schema and from the full product-role list on the table and function, and the schema is not in the Data API exposed set. The H3C1 post-apply evidence measured this live and it held.
- **RECOMMENDATION.** Keep the migration's own post-conditions as the acceptance check after any future edit; they already encode A5/A6 invariants (`prosecdef=false`, exact `supabase_auth_admin` privileges, zero product-role reach, not in `pgrst.db_schemas`).

---

## Work Package F — Security-Advisor intersection with H3C

Reference: `REPORT-SHARED-RUNTIME-SECURITY-ADVISOR-HANDOFF-2026-09-08.md`.

| Advisor finding | Intersects H3C token proof? | Add to negative matrix | Must close before global Shared-Runtime PASS | Separately-owned remediation OK |
|---|---|---|---|---|
| `security_definer_view` — `local_service.shop_public_profile` (ERROR) | **No** for the `ps01_line_runtime` token — that role has no `local_service` USAGE, so the Data API rejects `Accept-Profile: local_service` for it. **Yes** for the platform gate — it is an exposed BK01 surface. | `NEG-LS-1`: token with `Accept-Profile: local_service` on `shop_public_profile` → must fail (`401/403/404`). Proves the view is unreachable *by this role* even though it is exposed. | **Yes** — BK01/House must resolve the SECURITY DEFINER view before "the exposed BK01 Data API surface is hardened" can be claimed. Not an H3C blocker. | Yes (BK01 coordinator + House regression). |
| Externally callable SECURITY DEFINER functions — 11 `anon`, 46 `authenticated` (incl. `local_service` fns, `public.rls_auto_enable()`) (WARN ×2) | **No** directly — those EXECUTE grants are to `anon`/`authenticated`, not `ps01_line_runtime`. H3C's token is `role=ps01_line_runtime`, so it does not inherit anon/authenticated EXECUTE. | `NEG-ROLE-1`: token cannot invoke a known `anon`-granted `local_service` SECURITY DEFINER RPC (e.g. a booking-recovery fn) — must fail. `NEG-PUB-1`: `public.rls_auto_enable()` via `/rest/v1/rpc/` → must fail (it is an event-trigger callback, not a normal RPC, and not granted to this role). | **Yes for the platform** — the broad anon/authenticated SECURITY DEFINER surface must be classified and default-EXECUTE revoked before global PASS. **No for H3C's role-scoped proof.** | Yes — per-product classification + House verification. |
| `rls_enabled_no_policy` — 4 `local_service` + 5 `ps01` tables (INFO) | **Partially.** For `ps01`: `ps01_line_runtime` has **zero** table privileges (H3B verified `write count = 0`; it also has no SELECT grant), so RLS-no-policy is moot for it — no grant, no access regardless of RLS. The risk is only via the 3 SECURITY DEFINER RPCs, which run as `ps01_migrator` and must enforce their own tenant checks. | `NEG-TBL-1`: direct `GET /rest/v1/<ps01 table>` with `Accept-Profile: ps01` and the runtime token → must fail (no SELECT grant). `POS-AUTHZ-1..3`: each of the 3 RPCs must reject a cross-shop / unverified-LINE-user input at its own boundary (fixture-driven). | **Recommended** — confirm each of the 3 target RPCs' internal authorization does not trust the caller's Postgres role and does enforce `p_verified_line_user_id` + shop scoping. This is the real authority boundary since the RPCs are SECURITY DEFINER. | Yes — PS01 owns the RPC-body review; House verifies via the matrix. |
| `function_search_path_mutable` — `ps01.ps01_request_user_id`, `ps01.ps01_request_email`, `ps01.ps01_request_name` (WARN) | **Conditionally.** If any of the 3 target SECURITY DEFINER RPCs call these helpers internally and the helpers lack a pinned `search_path`, a caller who can influence `search_path` could shadow objects the DEFINER function resolves. `ps01_line_runtime` cannot `ALTER ROLE`, but per-request `SET search_path` via PostgREST is possible if not blocked. | `NEG-PATH-1`: issue an RPC call with a crafted `search_path` request header/param and a shadow object in a schema the role *can* write (it has none — so this should be structurally impossible; document that). Also assert PostgREST config does not allow arbitrary `SET` from the client for this role. | **Yes** — PS01 should pin `search_path` on these 3 helpers (cheap fix) before global PASS, because they are `SECURITY DEFINER`-adjacent within the customer path. | Yes — PS01 remediation; does not widen any grant. |
| `extension_in_public` — `pg_net`, `btree_gist` (WARN) + managed `pg_net` PUBLIC ACL (H1 core blocker) | **This is the reason H3C exists.** The `ps01_line_runtime` Postgres role still inherits `net` schema USAGE + `net.http_post` EXECUTE from `PUBLIC` (H3B confirmed live). H3C must prove that inheritance is **not reachable through the Data API path** because `net` is not in `pgrst.db_schemas`. | `NEG-NET-1`: `POST /rest/v1/rpc/http_post` and `GET /rest/v1/_http_response` with `Accept-Profile: net` and the runtime token → must fail (`404` — schema not exposed). `NEG-NET-2`: no exposed RPC in `public`/`ps01` resolves to `net.*` (H1 already found none; re-assert post-hook). | **Yes** — this is the H1 blocker; the platform is not globally PASS until `PUBLIC` on `pg_net` is safely narrowed OR the execution-boundary neutralization is proven end-to-end (which is exactly what H3C's negative matrix does for PS01). | The managed-ACL hardening is a separate House track (H2 "Managed ACL Hardening Track"); H3C's job is to prove the boundary, not fix the ACL. |
| Auth leaked-password protection disabled (WARN) | **No.** Auth config hardening, unrelated to the runtime-token role. | — | No (not isolation) | Yes — House Auth config. |

### F verdict

- **No Security-Advisor finding invalidates the H3C *role-scoped* token proof**, provided the negative matrix additions above (`NEG-LS-1`, `NEG-ROLE-1`, `NEG-PUB-1`, `NEG-TBL-1`, `NEG-PATH-1`, `NEG-NET-1/2`, `POS-AUTHZ-1..3`) are executed and pass.
- **Findings that must close before a global `SHARED-RUNTIME PLATFORM ISOLATION: PASS`** (not before H3C itself): the `shop_public_profile` SECURITY DEFINER view, the broad anon/authenticated SECURITY DEFINER EXECUTE surface, and the managed `pg_net` `PUBLIC` ACL (or its proven architectural neutralization across *all* products, not just PS01).
- **Cheap PS01-owned fixes recommended before the live H3C run:** pin `search_path` on the 3 `ps01_request_*` helpers; confirm the 3 target RPCs enforce their own tenant/LINE-user checks independent of Postgres role.

---

## Consolidated WP-A verdict table

| # | Point | Verdict |
|---|---|---|
| A1 | Hosted Auth can issue JWT with custom PG role claim | VERIFIED (mechanism) / **UNPROVEN** (hosted end-to-end — needs live config + decoded token) |
| A2 | Auth validation accepts arbitrary string roles | **VERIFIED** |
| A3 | PostgREST `authenticator` can SET the NOLOGIN role (PG17 SET/INHERIT) | **VERIFIED** |
| A4 | 5-min `exp` cap valid; refresh cannot restore broader authority | **VERIFIED** (cap holds in signed JWT); **PARTIALLY CONTRADICTED** on the second clause — refresh *does* restore the identity's original `authenticated` role once the grant row is gone; mitigated only by cleanup ordering (RECOMMENDATION A4). New finding: `expires_in` response metadata is not capped. |
| A5 | Hook return shape preserves required claims | **VERIFIED** |
| A6 | SECURITY INVOKER + `supabase_auth_admin` grants sufficient and safer | **VERIFIED** |

## Blockers / must-fix before House live proof

1. **BLOCKER (process, low effort):** reorder H3C-8 / Rollback Order so the LAB service Auth identity is banned/deleted **before** the grant row and hook are disabled (WP-A A4). Otherwise a leaked refresh token yields `authenticated`-scoped Data API access after "cleanup."
2. **RECOMMENDATION (PS01, low effort, pre-run):** pin `search_path` on `ps01.ps01_request_user_id/_email/_name`; re-confirm the 3 target RPC bodies enforce `p_verified_line_user_id` + shop scoping regardless of caller role.
3. **UNPROVEN → needs the live H3C-6/7 run:** hosted *control plane* accepts the non-`public` schema URI (B-2, GoTrue runtime already VERIFIED); Auth issues `role=ps01_line_runtime`; Data API `SET LOCAL ROLE` succeeds; full positive + negative matrix under the required-probe gate.
4. **RECOMMENDATION:** the harness and operator runbook must derive token expiry from the decoded JWT `exp`, never from the OAuth `expires_in` (WP-A A4 metadata finding).

## Independent verdict for this review stage

`H3C ARCHITECTURE: SOUND / REMEDIATION-MINOR REQUIRED BEFORE LIVE PROOF`

The Auth-issued short-lived NOLOGIN-role-claim design is implementable on current Supabase/GoTrue/PostgREST/PG17 and its security-relevant mechanics (custom role claim, post-hook validation, signed-token `exp` cap, SET-only membership, SECURITY INVOKER least privilege, product-internal schema isolation) are VERIFIED against source. It is **not** yet `READY FOR HOUSE LIVE PROOF` because (a) the refresh/cleanup-ordering blocker must be fixed in the runbook, and (b) the end-to-end issuance + negative matrix is UNPROVEN by design and is precisely what the House live run + this proof pack's harness must establish.

Final handoff verdict is stated in `CLAUDE-H3C-PROOF-PACK-FINAL-REPORT-2026-09-08.md`.
