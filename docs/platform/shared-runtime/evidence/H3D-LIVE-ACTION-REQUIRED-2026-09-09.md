# H3D-LIVE-ACTION-REQUIRED — Hosted Operator Blocker

**Date:** 2026-09-09 (Asia/Bangkok)
**Phase:** H3D live LAB smoke
**Environment:** WSTERA LAB (`ykxlqnshaaxmzzocpjlj`) only — Production LOCKED
**Blocking:** H3D PASS, and therefore H3E / H3F / H4 / H5 / HOUSE-A
**Owner action needed:** WSTERA authorized Supabase Dashboard operator

## 1. Where execution stopped

- H3D static / source replacement is complete and green (see `H3D-PS01-DATA-API-PATH-PROOF-2026-09-09.md`).
- The read-only LAB start snapshot matches the expected post-H3C boundary with no unexplained delta (`H3D-START-SNAPSHOT-2026-09-09.json`).
- The H3D **live** smoke was not run because it needs a hosted control-plane change that only the authorized operator can make.

## 2. Exact failing step

Step: activate the Supabase **Custom Access Token Hook** for WSTERA LAB so that Auth stamps the `role` claim on the issued access token.

Why it is required: PostgREST selects the Postgres role from the verified JWT `role` claim. Without the hook enabled, an Auth-issued token for the proof identity carries `role=authenticated`, not `role=ps01_line_runtime`, so the Data API path cannot be proven end to end.

Why the agent cannot do it: hook activation is a hosted Auth configuration field in the Dashboard (or a broad `config push`, which brief §6 forbids). There is no DB/catalog surface in this session to read or change hosted Auth hook config. H3C recorded the same boundary — the hook was enabled and later disabled "manually in Dashboard by the authorized operator".

## 3. Smallest operator action to unblock

All in WSTERA LAB (`ykxlqnshaaxmzzocpjlj`) only. Do not touch Production. Do not do a broad `supabase config push`.

1. **Provision a disposable LAB Auth identity** for the proof (Dashboard → Authentication → Users → Add user, or Auth Admin API with the LAB service key). Record only its UUID.
2. **Add one finite grant row** so the hook will map that identity to the runtime role:
   `INSERT INTO wstera_platform_internal.runtime_token_grants (…)` for that identity UUID → `ps01_line_runtime`, with a short expiry. (House SELECT-only session confirmed the table exists with 0 rows.)
3. **Enable the hosted Custom Access Token Hook** (Dashboard → Authentication → Hooks → Custom Access Token → point at `wstera_platform_internal.custom_access_token_hook`, enable). Field-level change only; capture a before/after of that one field.
4. **Issue a fresh access token** for the proof identity (password grant or Admin generate-link → session), confirm `role=ps01_line_runtime` and `exp − iat ≤ 300s` from the JWT itself.
5. **Inject the raw token only into the live server process env** as `PS01_LINE_RUNTIME_JWT` (plus `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` for LAB). Never persist it.
6. **Run the smoke** against the real PS01 server action / HTTP path:
   - valid LINE test identity/config → `getCustomerBookingContextServer` → context returns;
   - → `quoteCustomerBookingServer` → quote returns;
   - cross-shop `p_shop_id` the LINE user is not linked to → denied;
   - confirm no direct-DB / service-role fallback was used (adapter has none).
   The H3C proof harness (`tools/shared-runtime/h3c/h3c-proof-harness.mjs`) already runs the equivalent Data API probe matrix and can be reused with the same env — it is safe-by-default (no submit, no writes).
7. **Teardown, identity-first** (brief §7): delete the proof Auth identity + sessions → remove its `runtime_token_grants` row → disable the hosted hook → record the last JWT `exp` and do not claim authority gone until it passes → verify zero proof residue.
8. Re-run the read-only shared-surface snapshot and confirm it matches `H3D-START-SNAPSHOT-2026-09-09.json` (role attrs, exact 3 EXECUTEs, 0 PS01 writes, Storage 2, cron 8, Data API schemas, migration ledger 41).

## 4. After the smoke passes

Record `H3D-PS01-DATA-API-PATH-PROOF` §4 with the live probe outcomes + token claims (issuer/ref/role/iat/exp/lifetime/identity UUID only — no raw token), mark **H3D: PASS**, checkpoint both execution branches (brief §14), then continue to H3E (retire `ps01_runtime_login`).

## 5. Hard stops still in force

- WSTERA LAB only. No Production.
- No broad Auth `config push`. Field-level hook change only, with pre/post diff.
- If hosted Auth rejects the non-`public` hook schema, STOP and report (brief §13) — do not move the hook to `public` or widen its ACL.
- Any runtime token that reaches `local_service`, `ps01_internal`, MT01, `net`, `cron`, `auth`, `storage`, or platform-internal surfaces outside the reviewed contract = STOP.
- No secret/token value in git, logs, evidence, or chat.
