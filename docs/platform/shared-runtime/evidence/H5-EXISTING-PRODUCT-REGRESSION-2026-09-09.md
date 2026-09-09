# H5 — Existing Product Regression + Rollback Proof (TEMPLATE / NOT RUN)

**Environment:** WSTERA LAB (`ykxlqnshaaxmzzocpjlj`) — Production LOCKED
**Status:** `PREPARE-ONLY — RUN AFTER H4 PASS + FULLY TORN DOWN`
**Entry gate (brief §11):** H4 PASS and torn down.

## Source-of-Truth References
1. Brief §11
2. `docs/platform/shared-runtime/evidence/H3D-BASELINE-INVENTORY-2026-09-09.json` (+ H3F post value)
3. `docs/platform/shared-runtime/evidence/H5-BK01-MT01-READONLY-PROBES-2026-09-09.sql`
4. `docs/strategy/WSTERA-SHARED-LINE-OA-TEST-FIXTURE-POLICY.md`
5. PS01 execution branch `work/ps01-h3d-data-api-20260909` (@ `4efee70`) + `tests/phase*`, `tests/h3d_data_api_runtime.test.ts`

## 1. PS01 regression (brief §11)

Run in the PS01 execution worktree. Local Supabase is required for the DB-backed
`tests/phase*` suites (no Docker on this host — the operator runs these where
local Supabase is available, OR against a LAB Auth fixture per below).

| Check | How | Result |
|---|---|---|
| Staff/browser authenticated LAB flow | LAB-only Auth fixture via the normal authenticated app path (NOT service-role); login → dashboard | `____` |
| room / rate-plan / Booking V2 staff behavior | `tests/phase4_booking_backend.test.ts` + Booking V2 acceptance matrix (last: 21/21 @ `c21c27c`) | `____` |
| Customer LINE bounded Data API context + quote | H3D live smoke path (`getCustomerBookingContextServer` → `quoteCustomerBookingServer`) with the `ps01_line_runtime` token | `____` |
| cross-shop denial | quote/context for a shop the LINE user is not linked to → rejected | `____` |
| no active Customer LINE dependency on `PS01_RUNTIME_DB_*` / `ps01_runtime_login` | grep + `pnpm test:ps01-boundary` (H3D: PASS) | PASS (static) / re-confirm `____` |
| no service-role/admin fallback in browser/customer data-plane | boundary verifier "Core PMS admin-client dependency: none" + `h3d_data_api_runtime.test.ts` (7/7) | PASS (static) / `____` |
| static gates re-run | `npx tsx --conditions=react-server tests/h3d_data_api_runtime.test.ts`, `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build`, `pnpm build:ps01-baseline`, `pnpm test:ps01-boundary` | `____` |

A mutating booking-request smoke is authorized in H5 **only** after proving the
submit path has no uncontrolled payment / Storage / cron / pg_net / external
notification side effect for the disposable LAB fixture (brief §11). Otherwise
keep customer proof to the strongest non-mutating path (context + quote) and
record the limitation.

LINE fixture: Queueeasy shared fixture, `CLAIM → TEST → EVIDENCE → RELEASE → RESET`
(strategy doc). Dedicated test identity only. Do not take over a merchant OA.

## 2. BK01 preservation (brief §11) — read-only, baseline confirmed 2026-09-09

Run `H5-BK01-MT01-READONLY-PROBES-2026-09-09.sql`. Baseline (confirmed this run):

| Probe | Expected | Baseline 2026-09-09 |
|---|---|---|
| B1 `local_service` owner/tables/functions/policies | postgres / 21 / 61 / 26 | **MATCH** |
| B2 `bk01_*` roles | none | **none** |
| B3 `local_service_internal` | NULL | **NULL** |
| B4 secdef views in `local_service` | exactly `shop_public_profile` | **shop_public_profile** (known-open Advisor ERROR, separately owned) |
| B5 `local_service.is_shop_member(nil)` | `false`, not an error | `____` (re-run after H4) |
| B6 `local_service` function owners | postgres × 61 | **postgres × 61** (Junction A regression fully rolled back) |

BK01 stays quarantined. Do not apply BK01 schema/bootstrap. The
`local_service.shop_public_profile` SECURITY DEFINER finding and BK01
auth/ownership findings remain separately owned — report, do not claim solved.

## 3. MT01 preservation (brief §11) — read-only, baseline confirmed 2026-09-09

| Probe | Expected | Baseline 2026-09-09 |
|---|---|---|
| M1 `mt01` / `mt01_private` owners+counts | postgres 6/2 · postgres 0/2 | **MATCH** |
| M2 `mt01_*` roles | none | **none** |
| M3 `mt_mp_02*` migration rows | 4 rows, exact versions | **4 rows MATCH** |

Do not repair or refactor MT01.

## 4. Shared / global regression (brief §11)

Run `lab-readonly-inventory.mjs` (post-H4-teardown) → `compare-inventory.mjs`
against `H3D-BASELINE-INVENTORY-2026-09-09.json` + the H3E manifest entry.

| Surface | Expected | Result |
|---|---|---|
| Storage bucket list/signatures | unchanged (`deposit-slips`, `ps01-daily-report-photos`) | `____` |
| cron jobs | unchanged (8) | `____` |
| extension set/versions | unchanged (8) | `____` |
| Data API schemas | back to `public, graphql_public, local_service, ps01` | `____` |
| global migration history | only reviewed House rows: H3B + 3×H3C + H3E (+ H4 forward/rollback pair retained as evidence) | `____` |
| no disposable H4 object remains | S1 probes NULL / 0 | `____` |
| Security Advisor | no new H3/H4/H5-attributable finding; only the pre-existing `local_service.shop_public_profile` | `____` (operator Dashboard refresh) |

## 5. Rollback proof (brief §11)

Assemble + verify rollback evidence for every persistent House change:

| Change | Rollback artifact | Verified against live? |
|---|---|---|
| H3B `ps01_line_runtime` boundary | `migrations/h3_ps01_line_runtime_boundary_rollback.sql` | `____` |
| H3C token support | `migrations/h3c_auth_runtime_token_support_rollback.sql` | `____` |
| H3C H-08 ACL hardening | `migrations/h3c_public_rls_auto_enable_acl_hardening_rollback.sql` | `____` |
| H3C helper search_path | `migrations/h3c_ps01_request_helpers_search_path_hardening_rollback.sql` | `____` |
| H3E `ps01_runtime_login` retirement | `migrations/h3e_ps01_runtime_login_retirement_rollback.sql` + rehearsal (transaction-scoped, executed) | `____` |
| H4 disposable product | `migrations/h4_disposable_product_rollback.sql` (executed at H4 teardown) | `____` |

Demonstrate the declared pre-change role/config/signature state can be restored
**without old stored secrets**, and the intended final state is re-established
after rehearsal. Record what was **executed** vs only **reviewed**.

## 6. Security Advisor capture template

- Dashboard → Advisors → Security → Refresh at `____` (UTC)
- findings returned (JSON/screenshot ref): `____`
- classification of each: `____`
  - `local_service.shop_public_profile` `security_definer_view` ERROR → **pre-existing, BK01 scope, NOT H3/H4/H5**
  - any `function_search_path_mutable` for `ps01.ps01_request_*` → must NOT reappear (H3C hardened)
  - any new `ps01_line_runtime` / `h4_*` / hook finding → **STOP, H5 FAIL**

## 7. Verdict (fill)

- PS01 browser/staff: `____`
- PS01 Customer LINE: `____`
- BK01 baseline preserved: `____`
- MT01 unchanged: `____`
- shared/global final signature: `____` (== post-H3F)
- rollback execution/rehearsal: `____`
- final Security Advisor: `____`
- **H5: `____`** — FAIL on any real PS01 regression, unexplained BK01/MT01/shared delta, rollback failure, or new security finding. If H5 FAILS, HOUSE-A must NOT be prepared PASS-ready.
