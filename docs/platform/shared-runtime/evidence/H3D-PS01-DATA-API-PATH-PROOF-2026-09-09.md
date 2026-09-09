# H3D — PS01 Customer LINE Data API Path Proof (House lane)

**Date:** 2026-09-09 (Asia/Bangkok)
**Environment:** WSTERA LAB (`ykxlqnshaaxmzzocpjlj`) — Production LOCKED
**House execution branch:** `work/house-h3d-h5-20260909` (worktree `D:\AI-Workspace\runtime\worktrees\house-h3d-h5-20260909`), base `94ce432121b7bc79914fe22c976dab83745b8e50`
**PS01 execution branch:** `work/ps01-h3d-data-api-20260909` (worktree `D:\AI-Workspace\runtime\worktrees\ps01-h3d-data-api-20260909`), base `c21c27c18f57ee2c54172c0d08697ab02b184b4a`
**Status:** `H3D STATIC PASS / H3D LIVE SMOKE BLOCKED / H3D NOT PASS / DO NOT PROCEED TO H3E`

## Source-of-Truth References

1. `docs/platform/shared-runtime/BRIEF-CLAUDE-H3D-H5-HOUSE-A-LONG-RUN-EXECUTION-2026-09-09.md` §7, §13, §15, §17
2. `docs/platform/shared-runtime/DESIGN-H2-SHARED-RUNTIME-ISOLATION-EXECUTION-BOUNDARY-2026-09-08.md` (H3D workflow, security invariants)
3. `docs/platform/shared-runtime/evidence/H3C-FINAL-CLOSURE-2026-09-09.md` (immutable H3C input)
4. `docs/platform/shared-runtime/evidence/H3D-START-SNAPSHOT-2026-09-09.json` (this run, read-only)
5. `docs/platform/shared-runtime/evidence/H3D-LIVE-ACTION-REQUIRED-2026-09-09.md` (blocker)
6. PS01 lane: `docs/daily/H3D-DATA-API-PATH-REPLACEMENT-2026-09-09.md` (PS01 execution branch)

## 1. Pre-mutation READ-ONLY LAB start snapshot

Captured via House SELECT-only authority (pg session pooler, `current_user = postgres`, no DDL/DML). Full machine-readable output: `H3D-START-SNAPSHOT-2026-09-09.json`.

Compared against the brief §15 "Known post-H3C expectations at start":

| Expectation | Observed | Verdict |
|---|---|---|
| `ps01_line_runtime` NOLOGIN | `rolcanlogin=false`, NOINHERIT | MATCH |
| exact 3 Customer LINE V2 PS01 RPC EXECUTEs | `exec_count=3`; names/args exact; owner `ps01_migrator`; all `SECURITY DEFINER` | MATCH |
| zero direct PS01 write grants | `write_count=0`, `write_relations=[]` | MATCH |
| `local_service` usage false | `false` for `ps01_line_runtime` | MATCH |
| `public.rls_auto_enable()` EXECUTE false | `false` | MATCH |
| `ps01.ps01_request_user_id()` EXECUTE false | `false` | MATCH |
| Storage bucket count 2 | `2` (`deposit-slips`, `ps01-daily-report-photos`) | MATCH |
| cron job count 8 | `8` | MATCH |
| Data API schemas | `public, graphql_public, local_service, ps01` | MATCH |
| zero H3C proof users / grants | `runtime_token_grants` = 0 rows; 0 suspicious proof users (5 pre-existing LAB Auth users, per H3A) | MATCH |
| Advisor known finding only `local_service.shop_public_profile` | not DB-readable this session; requires operator Dashboard refresh (recorded as open) | DEFERRED |

Additional facts (all explained):
- `authenticator` has `ps01_line_runtime` granted `WITH SET TRUE, INHERIT FALSE` — matches H3B.
- `wstera_platform_internal` schema present: 1 table (`runtime_token_grants`, 0 rows), 1 function (`custom_access_token_hook`, SECURITY INVOKER, owner `postgres`) — the inert Auth-hook support layer from H3C1. Hosted hook itself is disabled (operator-confirmed at H3C closure; not DB-readable).
- `net` schema USAGE still `true` for every `ps01_*` role — the known H1 PUBLIC leak, neutralised at the execution boundary by H2, not by ACL. Not an H3D regression.
- Global migration ledger: **41 rows**, latest `20260909013819 h3c_ps01_request_helpers_search_path_hardening`. Delta vs H1 (37): `h3_ps01_line_runtime_boundary` (H3B) + `h3c_auth_runtime_token_support` + `h3c_public_rls_auto_enable_acl_hardening` + `h3c_ps01_request_helpers_search_path_hardening` (H3C) = +4. All reviewed House H3 work. No unexplained row.
- `local_service` 21/61/26/61/35, `ps01` 21/92/16/58/32, `ps01_internal` 1/0/0/1/0, `mt01` 6/2/6/12/7, `mt01_private` 0/2/0/0/0 — all unchanged vs H1/H3A/H3B.
- Active sessions: `authenticator` (PostgREST 14.5, idle), `postgres` (pg_net 0.20.3, idle), `postgres` (Supavisor, this snapshot). No stray `ps01_runtime_login` session.

**No unexplained collateral delta. H3C is not regressed. H3D static work authorized to proceed.**

## 2. H3D source replacement (PS01 lane)

PS01 execution branch `work/ps01-h3d-data-api-20260909`, HEAD `4efee706d39b8aa66d2b610793c987d9f6e1f948` (1 commit on top of base `c21c27c`).

Changed files:
- `lib/ps01-runtime.ts` — repurposed into the active `getPs01LineRuntimeClient(): Ps01RuntimeRpcClient`. Transport = `createClient(url, anonKey, { db.schema=ps01, Authorization: Bearer <PS01_LINE_RUNTIME_JWT> })`. In-process allowlist of exactly `get_customer_booking_context_v2_internal`, `quote_customer_booking_v2_internal`, `submit_booking_request_v2_internal`; any other name returns `{data:null, error:{message:"...is not allowlisted: <name>"}}` **without a network call**. Underlying error mapped to `{message}`; no table/admin fallback.
- `lib/env.ts` — `requirePs01RuntimeEnv()` now reads `PS01_LINE_RUNTIME_JWT` (was `PS01_RUNTIME_JWT`); error text names `role=ps01_line_runtime`. `PS01_RUNTIME_DB_*` retained, commented rollback/reference only.
- `lib/line-booking-server.ts` — all 3 call sites + import swapped from `getPs01RuntimeDatabaseClient` (`./ps01-runtime-db`) to `getPs01LineRuntimeClient` (`./ps01-runtime`).
- `.env.example` — `PS01_LINE_RUNTIME_JWT` documented as the active Customer LINE path; `PS01_RUNTIME_DB_*` demoted to rollback/reference.
- `scripts/verify-ps01-shared-runtime-boundary.mjs` — asserts the active path is the Data API adapter, no pooler/service-role in `line-booking-server.ts`, adapter allowlist + role contract + no service-role; keeps the pooler adapter's own guards as a retained reference file.
- `tests/h3d_data_api_runtime.test.ts` (new) — 7 static checks, no DB.
- `docs/daily/H3D-DATA-API-PATH-REPLACEMENT-2026-09-09.md` (new) — the PS01 H3D plan/record.

`lib/ps01-runtime-db.ts` (pooler adapter) is **retained unchanged** as rollback/reference (brief §7). It has no active importer.

### Required implementation properties (brief §7) — check

| Property | Status |
|---|---|
| active path does not import/call `getPs01RuntimeDatabaseClient()` | PASS — grep: only the reference file defines it; `line-booking-server.ts` clean |
| server-only Data API adapter implementing `Ps01RuntimeRpcClient` | PASS |
| allowlist of exactly 3 RPC names; no generic caller-named RPC interface | PASS |
| token contract `role=ps01_line_runtime` (not `ps01_runtime`) | PASS |
| token server-only, short-lived, not persisted in source/committed env | PASS — `.env.example` blank; no token in repo |
| no `SUPABASE_SERVICE_ROLE_KEY` fallback in the Customer LINE data-plane | PASS — grep clean in `line-booking-server.ts`, `line-booking-core.ts`, `ps01-runtime.ts` |
| no direct table/admin fallback on Data API RPC failure | PASS — adapter returns `{error:{message}}`, no alternate path |
| old direct-DB adapter kept as rollback/reference, not removed | PASS |

## 3. H3D static / source gates (brief §7)

| Gate | Command | Result |
|---|---|---|
| focused H3D unit proof | `npx tsx --conditions=react-server tests/h3d_data_api_runtime.test.ts` | **7/7 PASS**, exit 0 |
| typecheck | `pnpm exec tsc --noEmit` | PASS, exit 0 |
| lint | `pnpm lint` (eslint) | PASS, exit 0 |
| build | `pnpm build` (Next.js 16.3.1 / Turbopack) | PASS — compiled, TS checked, 13/13 routes generated, exit 0 |
| shared-runtime generator | `pnpm build:ps01-baseline` | PASS — source hash `6cda75d1aec8e12326662fe2c2db017c3be7d012ce961d9d1bef0c6d1748c044` unchanged; 14 migrations; no tracked SQL content change (LF churn reverted) |
| boundary verifier | `pnpm test:ps01-boundary` | PASS — 14/14 canonical sources, "Core PMS admin-client dependency: none", Data API route asserted |
| source scan: no active Customer LINE dependency on `PS01_RUNTIME_DB_*` / `lib/ps01-runtime-db.ts` | grep over `lib/`, `app/` | PASS — `getPs01RuntimeDatabaseClient` only in its own definition file; `PS01_RUNTIME_DB_*` only in `env.ts` (rollback def); `line-booking-server.ts` + `line-booking-core.ts` clean |

The H3D static-proof-test list from brief §7:
- missing runtime JWT fails closed — PASS (check 1)
- Data API adapter cannot execute a fourth/unallowlisted RPC — PASS (checks 2, 3)
- Customer LINE server actions select the Data API adapter, not the pg pool — PASS (checks 4, 5)
- service-role/admin credentials not consulted by the Customer LINE runtime path — PASS (checks 5, 6)
- current role/schema assumptions match `ps01_line_runtime` and the `ps01` Data API profile — PASS (check 6 + start snapshot §1)

### Not run — environment limitation (not a pass, not a failure)

`tests/phase11_customer_self_booking.test.ts` and the other `tests/phase*` DB-backed suites require a running **local Supabase** (`scripts/run-test.ps1` → `supabase status`). This host has no Docker/WSL, so local Supabase cannot start. These suites were last recorded PASS 21/21 at the PS01 handoff checkpoint `c21c27c` and are unchanged by H3D (H3D touches only the transport adapter behind the unchanged `Ps01RuntimeRpcClient` interface). Their re-run belongs to the H3D live LAB smoke / H5 regression, gated below.

## 4. H3D live LAB smoke — BLOCKED

The non-mutating live smoke (real LINE test identity/config → customer context → quote through the actual PS01 server action/HTTP path; plus cross-shop/context denial and no direct-DB fallback) cannot be completed this run.

Blocking dependency: the hosted Supabase **Custom Access Token Hook must be enabled in the Dashboard** so Auth stamps `role=ps01_line_runtime` onto the issued JWT. This is a hosted control-plane action that is operator-only — the same boundary H3C recorded ("no DB/catalog surface exists in this session to independently read [or change] hosted Auth hook configuration"; hook enable/disable was done "manually in Dashboard by the authorized operator"). The operator is not available for this run.

Per brief §7 ("If hosted Auth hook activation cannot be changed safely without an operator, finish all static H3D work, write a precise H3D-LIVE-ACTION-REQUIRED blocker, and STOP before H3D PASS. Do not proceed to H3E.") and §13 / §17B.

Full operator runbook: `H3D-LIVE-ACTION-REQUIRED-2026-09-09.md`.

## 5. What was NOT changed

- No LAB mutation. Only the read-only start snapshot was taken (SELECT-only, `pg_stat_activity` / catalog reads).
- No Auth identity provisioned, no `runtime_token_grants` row added, no hook touched.
- No BK01 / `local_service` / MT01 / Storage / cron / extension / Data API / migration-ledger change.
- `ps01_runtime_login` still LOGIN (H3E scope).
- PS01 historical migrations and `supabase/migrations/*` untouched (generator source hash unchanged).
- No `service_role` key, DB password, signing material, connection string, or token in git, docs, logs, or this evidence.

## 6. H3D verdict

`H3D STATIC: PASS. H3D LIVE SMOKE: BLOCKED (operator). H3D: NOT PASS.`

Do not mark H3D PASS. Do not begin H3E. Do not push execution branches past this checkpoint without reviewer decision (brief §14 requires "all H3D gates pass" before the PS01 push; live smoke is a required gate). HOUSE-A remains OPEN; BK01 remains quarantined.
