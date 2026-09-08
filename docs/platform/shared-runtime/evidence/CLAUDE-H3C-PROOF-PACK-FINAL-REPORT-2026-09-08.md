# CLAUDE — H3C Independent Validation + Proof Pack — FINAL REPORT

**Date:** 2026-09-08 (Asia/Bangkok) · **Rev 2** — post `HOUSE-REVIEW-CLAUDE-H3C-PROOF-PACK-2026-09-08.md` + `BRIEF-CLAUDE-H3C-PROOF-PACK-REMEDIATION-2026-09-08.md`.
**Brief:** `docs/platform/shared-runtime/BRIEF-CLAUDE-H3C-INDEPENDENT-VALIDATION-PROOF-PACK-2026-09-08.md`
**Executor:** Claude Desktop · **Final reviewer:** WSTERA House / Secretary GPT
**Mode:** INDEPENDENT REVIEW + PREPARE ONLY. **No WSTERA LAB mutation. No Production access. No Auth Hook enabled. No service identity created. No allowlist/grant row inserted. No secret or signing material obtained. No merge.**

## Git

| Item | Value |
|---|---|
| Base | `origin/master` = `ec56365f5eb978367b5fc522879925b8347c6a8d` (`docs(platform): hand off H3C independent validation to Claude`) |
| Branch | `review/claude-h3c-proof-20260908` (worktree `D:\AI-Workspace\worktrees\claude-h3c-proof`) |
| Rev 1 SHA | `5e4433b1826a28e07e5c1cab20b4ed264dff4d0d` (initial proof pack) |
| Rev 2 SHA | see the remediation commit / push output at the end of this file |
| Divergence | branch = base + 2 commits; **not merged**; pushed to `origin/review/claude-h3c-proof-20260908` |
| Clean tree | `git status --short` empty after each commit; `git diff --check` clean |
| Merge to master | **NOT DONE** — forbidden; awaits House re-review + live proof |

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

### D — Proof harness (rev 2)

`tools/shared-runtime/h3c/h3c-proof-harness.mjs` — self-contained Node (no npm, no Docker), env-var / operator-input only, never prints tokens/secrets, ES256 JWKS signature verification (public key only, shared by runtime **and** control token — H-06), token/project-ref checks from the JWT/issuer/JWKS only (H-05), explicit `REQUIRED_PROBES` contract + pure `computeGate()` (H-01), in-function-SQLSTATE-only boundary classifier that rejects `5xx` (H-04), **safe by default — never calls `submit`, never writes a table** (H-02/H-03), `POS-GRANTS` offline proof of the submit EXECUTE grant, `residualNarrowAuthorityUntil` in output (H-07). Offline `--selftest` → **`SELFTEST PASS (crypto, project-ref H-05, classifiers H-04, gate H-01, safety H-02/H-03)`** — 12 gate assertions incl. all 8 the remediation brief mandated. Missing-prerequisite and no-token runs exit `1`. `node --check` clean.

### E — Negative matrix (rev 2)

`CLAUDE-H3C-NEGATIVE-MATRIX-2026-09-08.md` — the required-probe contract (7 token pre-checks; `POS-1/2` boundary; `POS-GRANTS` offline; `POS-AUTHZ-1/2/3` read-only RPC-body authz; `POS-CONTROL-1` verified control token; 22 negative probes across non-allowlisted RPC, unintended SECURITY DEFINER, direct read + non-mutating write-authority, `local_service`/`ps01_internal`/`mt01`/`mt01_private`/`wstera_platform_internal`, `net`/`cron`/`auth`/`storage`/`extensions`, expired/bad-sig/tampered-payload/missing-apikey/anon tokens) plus advisory `NEG-ROLE-2` (NOT TESTABLE) and `POS-3` (opt-in mutating). All default-mode probes are `GET` or a `POST` to a read/compute RPC. Unexpected success, a missing required probe, a duplicate id, or an unknown verdict = gate failure.

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
| proof harness covers positive+negative matrix and fails closed | ✅ (#5 rev 2, explicit required-probe gate, selftest PASS, exit-1 on prereq/fail; no false PASS with blocked authz probes — House H-01) |
| no secret/token/private key in git diff or evidence | ✅ (harness redacts; no secrets committed; `git diff --check` clean) |
| no live LAB mutation | ✅ |
| no Production access | ✅ |
| branch static checks for created scripts pass | ✅ (`node --check` + `--selftest`) |
| branch committed, pushed, clean | ✅ (see push output) |
| findings distinguish VERIFIED / CONFLICT / INFERENCE / BLOCKER / RECOMMENDATION | ✅ (register above) |
| findings outside H3C recorded separately, not self-remediated | ✅ (WP-F; no code/SQL change to those) |

## Rev 2 — House review disposition (H-01 … H-07)

House review `HOUSE-REVIEW-CLAUDE-H3C-PROOF-PACK-2026-09-08.md` verified V-1..V-4 (custom role claim, `exp` vs `expires_in`, refresh re-invokes hook, non-`public` hook schema OK at GoTrue source level) and required 7 harness/doc fixes. All addressed on the same branch:

| # | Severity | Finding | Disposition |
|---|---|---|---|
| **H-01** | CRITICAL | `finish()` could return PASS while `POS-AUTHZ-2/3` and `POS-CONTROL-1` were `RUNTIME-BLOCKED` | **Fixed.** Explicit `REQUIRED_PROBES` contract + pure `computeGate()`. `PASS` ⇔ every required probe present exactly once with `PASS`, no `FAIL`/duplicate/unknown verdict, no abort note. `RUNTIME-BLOCKED` on any required probe → `INCOMPLETE`. Only `NEG-ROLE-2` (`NOT TESTABLE`) and `POS-3` (opt-in mutating) are advisory. 12 offline gate assertions in `--selftest`, incl. the 8 mandated by the remediation brief. |
| **H-02** | CRITICAL | harness always called `submit_booking_request_v2_internal` (mutating) | **Fixed.** Default mode never calls submit. The submit EXECUTE grant is proven **offline** by `POS-GRANTS` reading committed H3B privilege evidence (asserts the 3-function allowlist incl. submit + "Direct write-capable privileges on PS01 relations: `0`"). A mutating submit probe (`POS-3`) exists only behind `H3C_ALLOW_SUBMIT_PROBE=1` + `H3C_SUBMIT_DISPOSABLE_ACK=1` + disposable fixtures, and is advisory — it can never contribute to `PASS`. Selftest asserts exactly one guarded submit call site. |
| **H-03** | HIGH | `NEG-TBL-2` did an unconditional table `POST` | **Fixed.** Replaced with a `PATCH /rest/v1/<table>?id=eq.<nil-uuid>` — non-mutating even if the role held `UPDATE` (PK matches no row). `2xx`/`204` ⇒ role has write authority ⇒ `FAIL`. Negative RPC probes changed to `GET /rest/v1/rpc/<fn>` so a role that *could* execute a VOLATILE function gets `405` (no execution). `NEG-NET-1` changed from `POST rpc/http_post` to `GET` on a `net` table (no side effect). Selftest asserts a single PATCH probe against a specific id filter, and no `PUT`/`DELETE` anywhere. |
| **H-04** | HIGH | `boundaryReached()` accepted generic `5xx` as "function executed" | **Fixed.** `boundaryReached` now returns `false` for `≥500`, transport error, `404`, `405`, `406`. A non-2xx counts as boundary reach **only** when the SQLSTATE is an unambiguous in-function error (`22`/`23`/`40`/`09`/`2F`/`P0…`), not a routing/parse code. Selftest covers `500`, `502`, transport error, `PGRST100`, `PGRST202`, `22P02`, `P0001`. |
| **H-05** | MEDIUM | `TOK-7` project-ref check was tautological (used `CFG.url`) | **Fixed.** `validateProjectRef()` derives the ref only from the JWT issuer (`https://<ref>.supabase.co/auth/v1`), a `ref` claim, or the JWKS URL — `CFG.url` is not an input. Selftest: a foreign-issuer token **fails** even when the operator's target URL contains the expected ref. |
| **H-06** | MEDIUM | control JWT (`POS-CONTROL-1`) was decoded but not signature-verified | **Fixed.** `verifyTokenIdentity()` is shared by the runtime token and the control token: ES256 signature vs JWKS, issuer shape, project ref, expiry — all before role/lifetime is read. `POS-CONTROL-1` passes only when `identityOk && role==authenticated && lifetime uncapped`. |
| **H-07** | MEDIUM | teardown didn't account for an already-issued narrow token still being valid until its `exp` | **Fixed (docs).** Harness output adds `residualNarrowAuthorityUntil` (ISO of the token `exp`). Activation/rollback STEP 4.0 records it; STEP 4.7 forbids declaring "authority fully gone" before that time or before demonstrating the token is rejected. Threat model TM-2 updated. Rationale: PostgREST validates the JWT without checking Auth-user existence. |

**B-2 reclassified** per House V-4: GoTrue *runtime* acceptance of a non-`public` hook schema is **VERIFIED**; only the **hosted Dashboard / Management-API field validation** remains `UNPROVEN`. Docs updated; the hook is **not** to be moved into `public`.

`--selftest` after rev 2: **`SELFTEST PASS (crypto, project-ref H-05, classifiers H-04, gate H-01, safety H-02/H-03)`**. `node --check` clean. Missing-prerequisite run exits `1`.

Deliverables #4 (negative matrix) and #5/#6 (harness + README) are at **rev 2**; #1/#2/#3 updated where the old behaviour or cleanup claim was stated.

## FINAL HANDOFF VERDICT

# `H3C REMEDIATION REQUIRED BEFORE LIVE PROOF`

**Rationale.** The Auth-issued short-lived NOLOGIN-role-claim architecture is **sound and implementable** on current Supabase / GoTrue `0907af9b` / PostgREST / PostgreSQL 17. Its security-critical mechanics are VERIFIED against source, not just documentation. It is **not `READY FOR HOUSE LIVE PROOF`** because:

1. **BLOCKER B-1** — House must adopt the corrected teardown/rollback order (deliverable #2 STEP 4, rev 2: record residual `exp` → invalidate the LAB service identity → clear the grant row → disable the hook → SQL rollback → residual close-out) as the operative runbook.
2. **B-2 (narrowed, control-plane only)** — GoTrue runtime acceptance of the `wstera_platform_internal` hook schema is now VERIFIED (House V-4). During STEP 2, House must still confirm the hosted **Dashboard / Management-API field validation** accepts it; if not, resolve via Supabase support or a different non-exposed schema name — **not** by moving the hook into `public`.
3. Low-effort pre-run items: concrete (non-NULL) `valid_until` on every grant row; PS01 pins `search_path` on `ps01.ps01_request_user_id/_email/_name`; PS01 confirms the 3 target RPC bodies enforce verified-LINE-user + shop scoping.
4. The proof harness (rev 2) is now correct — no false PASS, no default-mode mutation — but the live H3C-6/7 run under its required-probe gate has **not** happened; it remains the House live proof's job.

It is **not `ARCHITECTURE REJECTED`** — House verified V-1..V-4; no VERIFIED finding contradicts the design's viability or safety model. The one CONTRADICTED sub-point (A4 refresh) is a runbook-ordering fix.

After B-1, the B-2 control-plane check, and the pre-run items, House may run H3C-6/7 (live token issuance + `h3c-proof-harness.mjs --` under the required-probe gate + the negative matrix). Only Secretary GPT / WSTERA House may then issue `SHARED-RUNTIME PLATFORM ISOLATION PASS`, and only after the separately-owned global-gate items (WP-F: `pg_net` PUBLIC ACL, `shop_public_profile` SECURITY DEFINER view, broad anon/authenticated SECURITY DEFINER surface) are also closed.

**Claude does not merge this branch and does not execute any live H3C step.** Handing to WSTERA House / Secretary GPT for re-review.
