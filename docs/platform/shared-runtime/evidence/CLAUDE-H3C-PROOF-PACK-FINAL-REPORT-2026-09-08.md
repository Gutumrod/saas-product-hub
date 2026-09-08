# CLAUDE — H3C Independent Validation + Proof Pack — FINAL REPORT

**Date:** 2026-09-08 (Asia/Bangkok)
**Brief:** `docs/platform/shared-runtime/BRIEF-CLAUDE-H3C-INDEPENDENT-VALIDATION-PROOF-PACK-2026-09-08.md`
**Executor:** Claude Desktop · **Final reviewer:** WSTERA House / Secretary GPT
**Mode:** INDEPENDENT REVIEW + PREPARE ONLY. **No WSTERA LAB mutation. No Production access. No Auth Hook enabled. No service identity created. No allowlist/grant row inserted. No secret or signing material obtained.**

## Git

| Item | Value |
|---|---|
| Base | `origin/master` = `ec56365f5eb978367b5fc522879925b8347c6a8d` (`docs(platform): hand off H3C independent validation to Claude`) |
| Branch | `review/claude-h3c-proof-20260908` (worktree `D:\AI-Workspace\worktrees\claude-h3c-proof`) |
| Final SHA | recorded in `git log -1` for this branch after the single review commit (see push output) |
| Divergence | branch = base + 1 commit; **not merged**; pushed to `origin/review/claude-h3c-proof-20260908` |
| Clean tree | `git status --short` empty after commit; `git diff --check` clean |
| Merge to master | **NOT DONE** — forbidden by brief; awaits House review + live proof |

## Deliverables (all created)

| # | Path | Work package |
|---|---|---|
| 1 | `docs/platform/shared-runtime/evidence/CLAUDE-H3C-INDEPENDENT-REVIEW-2026-09-08.md` | A + F |
| 2 | `docs/platform/shared-runtime/evidence/CLAUDE-H3C-HOSTED-AUTH-ACTIVATION-ROLLBACK-2026-09-08.md` | B |
| 3 | `docs/platform/shared-runtime/evidence/CLAUDE-H3C-THREAT-MODEL-2026-09-08.md` | C |
| 4 | `docs/platform/shared-runtime/evidence/CLAUDE-H3C-NEGATIVE-MATRIX-2026-09-08.md` | E |
| 5 | `tools/shared-runtime/h3c/h3c-proof-harness.mjs` | D |
| 6 | `tools/shared-runtime/h3c/README.md` | D |
| 7 | `docs/platform/shared-runtime/evidence/CLAUDE-H3C-PROOF-PACK-FINAL-REPORT-2026-09-08.md` | this file |

## Sources cross-checked (pinned)

- supabase/auth master HEAD `0907af9bd6be3c76f472c40a7dcc0dc34abeffaf` (2026-09-03) — `internal/tokens/service.go`, `internal/hooks/hookspgfunc/hookspgfunc.go`, `internal/api/token.go`. **Same commit the repo's own `H3C-AUTH-HOOK-ROLE-VALIDATION` cited — still current.**
- PostgREST `docs/references/auth.rst` @ `main`.
- PostgreSQL 17 `GRANT` docs (`SET`/`INHERIT` role-membership options).
- Supabase docs: Custom Access Token Hook; Auth Hooks (SECURITY INVOKER guidance, plan availability); Management API `v1-update-auth-service-config`.
- Supabase GitHub issues `#36861`, `#22031` (Management API `PATCH /config/auth` defect with hooks).
- Repo: H1 / H2 / H3A / H3B / H3C1 evidence, `h3c_auth_runtime_token_support.sql` + rollback, `h3_ps01_line_runtime_boundary.sql`, Security Advisor handoff, BK01 Junction A handoff, migration/config ADR.
- PS01 prototype `products/PawSpace-pssr02-staging` @ `c21c27c` (`lib/ps01-runtime.ts`, `ps01-runtime-db.ts`, `line-booking-core.ts`, `line-booking-server.ts`, `ps01-schema.ts`, `env.ts`).

Exact quoted strings and per-point reasoning are in deliverable #1.

## Work-package verdicts

### A — Architecture audit (each point: VERIFIED / CONTRADICTED / UNPROVEN)

| # | Point | Verdict |
|---|---|---|
| A1 | Hosted Auth can issue a JWT with a custom PG role claim | **VERIFIED** (issuance mechanism, from GoTrue source) / **UNPROVEN** end-to-end on the hosted LAB (needs the live config + a decoded token) |
| A2 | Auth validation accepts arbitrary string roles | **VERIFIED** — `MinimumViableTokenSchema` `role:{type:string}`, no enum; `validateTokenClaims` re-runs on hook output |
| A3 | PostgREST `authenticator` can SET the NOLOGIN role (PG17 SET/INHERIT) | **VERIFIED** — PostgREST `SET LOCAL ROLE`; PG17 `SET TRUE` allows `SET ROLE`; H3B live check confirms `set_option=true, inherit_option=false`; NOLOGIN target is the documented anon/authenticated pattern |
| A4 | 5-min `exp` cap valid; refresh cannot restore broader authority | **cap: VERIFIED** in the signed JWT. **second clause: PARTIALLY CONTRADICTED** — the hook runs on every refresh; once the grant row is gone the refresh restores the identity's real `authenticated` role, which is broader than `ps01_line_runtime` across the 4 exposed schemas. Mitigated only by cleanup ordering. **New finding:** the OAuth `expires_in`/`expires_at` response fields are NOT capped (GoTrue returns the uncapped value); consumers must read expiry from the JWT `exp`. |
| A5 | Hook return shape preserves every required claim | **VERIFIED** — hook passes the full claims object through, only `jsonb_set`s `role` + `exp`; GoTrue re-validates required claims and fails closed otherwise |
| A6 | SECURITY INVOKER + `supabase_auth_admin` grants sufficient and safer | **VERIFIED** — matches Supabase's explicit "recommend against `security definer`" guidance; hook runs as `supabase_auth_admin` with exactly USAGE+SELECT+EXECUTE; product/anon/authenticated roles have zero reach; migration self-check enforces `prosecdef=false` |

### B — Hosted activation / rollback

**Executable, `config push`-free path exists.** Primary control surface: **Dashboard `Authentication > Hooks`** (Postgres hook, schema `wstera_platform_internal`, function `custom_access_token_hook`, URI `pg-functions://postgres/wstera_platform_internal/custom_access_token_hook`). Management API `GET /v1/projects/{ref}/config/auth` for before/after evidence; `PATCH` is a documented fallback carrying open defect `#36861` and must not be first choice on this project. Fields: `hook_custom_access_token_enabled` (bool), `hook_custom_access_token_uri` (string); `_secrets` is HTTP-only and unused here. Before/after `GET` diffs are the proof that no other Auth setting moved. **One open question that can still block:** whether hosted validation accepts a non-`public` hook schema (Supabase examples use `public`); the runbook STEP 2 stops and returns to House rather than relocating the function into an exposed schema.

### C — Threat model

14 failure modes analysed (`CLAUDE-H3C-THREAT-MODEL-2026-09-08.md`), each with preventive control / detection evidence / rollback / blocks-H3C. Two gate the live proof:

- **TM-2 (blocker, process, low effort):** the LAB service Auth identity must be banned/deleted **before** the grant row and hook are torn down. The brief's current Rollback Order does the reverse. Corrected order is written into deliverable #2 STEP 4.
- **TM-11 (must be actively proven, not inferred):** the 3 target RPCs are SECURITY DEFINER running as `ps01_migrator`; the live matrix must prove their bodies enforce verified-LINE-user + shop scoping regardless of the caller's Postgres role. Harness probes `POS-AUTHZ-1..3` cover this and are `RUNTIME-BLOCKED` until House supplies read-only fixtures.

One item gates the **global** Shared-Runtime PASS but not H3C itself: managed `pg_net` `PUBLIC` ACL (TM-8) + the broad SECURITY DEFINER / `shop_public_profile` surface (WP-F).

### D — Proof harness

`tools/shared-runtime/h3c/h3c-proof-harness.mjs` — self-contained Node (no npm, no Docker), env-var / operator-input only, never prints tokens/secrets, ES256 JWKS signature verification (public key only), token pre-checks from the decoded JWT, full positive + negative matrix, machine-readable JSON + human summary, fails closed. Offline self-test: `node h3c-proof-harness.mjs --selftest` → **SELFTEST PASS** (jwt decode, ES256 verify good/tampered, `sub` redaction, boundary/fails-closed classifiers). Missing-prerequisite and no-token runs exit `1` (verified). `node --check` clean.

### E — Negative matrix

`CLAUDE-H3C-NEGATIVE-MATRIX-2026-09-08.md` — 8 token pre-checks, 7 positive probes (incl. 3 RPC-body authz + 1 ordinary-user control), 25+ negative probes across: non-allowlisted PS01 RPC, unintended SECURITY DEFINER (`local_service`, `public.rls_auto_enable`), direct table read/write, `local_service` / `ps01_internal` / `mt01` / `mt01_private` / `wstera_platform_internal`, `net` / `cron` / `auth` / `storage` / `extensions`, expired / bad-signature / tampered-payload / missing-apikey / anon tokens, search-path. All non-destructive; unexpected success = gate failure.

### F — Security-advisor intersection

No advisor finding invalidates the **role-scoped** H3C token proof, provided the added probes (`NEG-LS-1`, `NEG-ROLE-1`, `NEG-PUB-1`, `NEG-TBL-1`, `NEG-NET-1/1b`, `POS-AUTHZ-1..3`) pass. Findings that must close before a **global** `SHARED-RUNTIME PLATFORM ISOLATION: PASS` (not before H3C): `security_definer_view` on `local_service.shop_public_profile`; the broad anon/authenticated SECURITY DEFINER EXECUTE surface (11/46); managed `pg_net` PUBLIC ACL neutralised for **all** products. Cheap PS01-owned pre-run fixes: pin `search_path` on `ps01.ps01_request_user_id/_email/_name`; confirm the 3 RPC bodies' own authz. Recorded separately; **not remediated in this branch** (brief prohibition honoured).

## Findings register (classified per brief)

| Class | Finding |
|---|---|
| **VERIFIED FACT** | Custom string `role` claim accepted by GoTrue at commit `0907af9b`; post-hook `validateTokenClaims` re-runs; hook output claims re-validated; signed JWT carries the hook-capped `exp`; hook is invoked on refresh as well as sign-in; hook executes as `supabase_auth_admin` via `select "<schema>"."<fn>"($1)` in a 2 s-timeout transaction; PG17 `SET TRUE / INHERIT FALSE` gives SET-only role switching; Custom Access Token Hook is Free/Pro; migration keeps the hook SECURITY INVOKER and `wstera_platform_internal` unexposed with product-role reach = 0 (H3C1 live). |
| **SOURCE/DOC CONFLICT** | Public Custom Access Token Hook doc renders a `role` enum (`anon`/`authenticated`) that the enforced `MinimumViableTokenSchema` does not have. Enforced schema wins. (Pre-existing; restated.) |
| **INFERENCE** | `SET ROLE` to a NOLOGIN role works (documented anon/authenticated pattern, not spelled out verbatim in PG17 `GRANT`); Management API `PATCH` partial-update leaves other keys untouched (verify via `GET` diff); Kong requires `apikey` in addition to the Bearer. |
| **BLOCKER** | **B-1 (process):** reorder H3C-8 / Rollback Order so the LAB service identity is invalidated *before* hook/grant teardown (else a leaked refresh token yields `authenticated`-scoped Data API access). Fix is written into deliverable #2 STEP 4; House must adopt it. |
| **BLOCKER (conditional)** | **B-2 (runtime):** if the hosted Dashboard/validator rejects a non-`public` hook schema, H3C cannot proceed as designed without either a Supabase-side resolution or House choosing a different non-exposed schema name. Runbook STEP 2 stops here. |
| **UNPROVEN** | Hosted LAB actually issues `role=ps01_line_runtime`; Data API `SET LOCAL ROLE ps01_line_runtime` succeeds and the 3 RPCs execute; the full negative matrix fails closed live; the 3 RPC bodies enforce their own tenant/identity checks. **Missing evidence:** the H3C-6/7 live run + `h3c-proof-harness.mjs` output + `GET /config/auth` before/after diffs. This is UNPROVEN *by design of this PREPARE-ONLY brief* — it is exactly the House live proof's job. |
| **RECOMMENDATION** | Concrete (non-NULL) `valid_until` on every LAB grant row; shortest usable session timebox on the service identity; harness/runbook read expiry from JWT `exp` not `expires_in`; PS01 pins `search_path` on 3 helpers pre-run; file the `expires_in` mismatch upstream; optional hook hardening (return original claims instead of `RAISE` on a non-object). |

## Acceptance contract check

| Requirement | Status |
|---|---|
| all mandatory sources inspected | ✅ (10/10 + supporting) |
| current Supabase docs + implementation source cross-checked | ✅ (pinned commit / URLs in #1) |
| every architecture claim has evidence or is marked unproven | ✅ (A1/A4 partly UNPROVEN, named) |
| hosted activation + rollback precise enough to execute without guessing | ✅ (#2, Dashboard-first, ordered rollback) |
| proof harness covers positive+negative matrix and fails closed | ✅ (#5, selftest PASS, exit-1 on prereq/fail) |
| no secret/token/private key in git diff or evidence | ✅ (harness redacts; no secrets committed; `git diff --check` clean) |
| no live LAB mutation | ✅ |
| no Production access | ✅ |
| branch static checks for created scripts pass | ✅ (`node --check` + `--selftest`) |
| branch committed, pushed, clean | ✅ (see push output) |
| findings distinguish VERIFIED / CONFLICT / INFERENCE / BLOCKER / RECOMMENDATION | ✅ (register above) |
| findings outside H3C recorded separately, not self-remediated | ✅ (WP-F; no code/SQL change to those) |

## FINAL HANDOFF VERDICT

# `H3C REMEDIATION REQUIRED BEFORE LIVE PROOF`

**Rationale.** The Auth-issued short-lived NOLOGIN-role-claim architecture is **sound and implementable** on current Supabase / GoTrue `0907af9b` / PostgREST / PostgreSQL 17. Its security-critical mechanics are VERIFIED against source, not just documentation. It is **not `READY FOR HOUSE LIVE PROOF`** because:

1. **BLOCKER B-1** — the teardown/rollback order in the H3C brief must be corrected so the LAB service identity is invalidated before the hook/grant are removed (deliverable #2 STEP 4 provides the corrected procedure; House must adopt it as the operative runbook).
2. **BLOCKER B-2 (conditional)** — House must confirm during STEP 2 that hosted Auth accepts a hook function in the non-`public` `wstera_platform_internal` schema; if not, resolve before proceeding (do **not** move the function to an exposed schema).
3. Two low-effort pre-run items should land first: concrete `valid_until` on grant rows, and PS01 pinning `search_path` on its 3 request helpers.

It is **not `ARCHITECTURE REJECTED`** — no VERIFIED finding contradicts the design's viability or safety model; the one CONTRADICTED sub-point (A4 refresh) is a runbook-ordering fix, not a design flaw.

After B-1/B-2 and the pre-run items, House may run H3C-6/7 (live token issuance + `h3c-proof-harness.mjs` + the negative matrix). Only Secretary GPT / WSTERA House may then issue `SHARED-RUNTIME PLATFORM ISOLATION PASS`, and only after the separately-owned global-gate items (WP-F) are also closed.

**Claude does not merge this branch and does not execute any live H3C step.** Handing to WSTERA House / Secretary GPT for review.
