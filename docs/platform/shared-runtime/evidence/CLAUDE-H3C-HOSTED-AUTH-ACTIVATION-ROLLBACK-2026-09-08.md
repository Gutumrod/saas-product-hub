# CLAUDE — H3C Hosted Auth Hook Activation & Rollback Procedure (Work Package B)

**Date:** 2026-09-08 (Asia/Bangkok)
**Mode:** PREPARE ONLY — nothing in this document was executed. No Auth config was changed.
**Environment (for the operator, later):** WSTERA LAB `ykxlqnshaaxmzzocpjlj` only.
**Executor of this doc:** Claude Desktop · **Executor of the procedure:** WSTERA House operator / Secretary GPT.

## Objective

Enable exactly one **Custom Access Token Hook** bound to the already-applied inert Postgres function
`wstera_platform_internal.custom_access_token_hook(jsonb)`, then disable it, with no broad Auth config drift and without `supabase config push`.

## Verified facts

- **VERIFIED FACT.** The Custom Access Token Hook is available on Free and Pro plans (`https://supabase.com/docs/guides/auth/auth-hooks` availability table: "Custom Access Token | Free, Pro"). No Team/Enterprise plan requirement for this hook.
- **VERIFIED FACT.** Postgres-function hook URI format is `pg-functions://postgres/<schema>/<function>` (`https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook`). For H3C: `pg-functions://postgres/wstera_platform_internal/custom_access_token_hook`.
- **VERIFIED FACT.** Management API surface: `GET /v1/projects/{ref}/config/auth` (read), `PATCH /v1/projects/{ref}/config/auth` (update). Custom-access-token hook fields: `hook_custom_access_token_enabled` (boolean), `hook_custom_access_token_uri` (string), `hook_custom_access_token_secrets` (string) — `https://supabase.com/docs/reference/api/v1-update-auth-service-config`. `hook_custom_access_token_secrets` is only for HTTP hooks (signing secret); it is **not used** for a `pg-functions://` hook.
- **VERIFIED FACT (bug risk).** `PATCH /v1/projects/{ref}/config/auth` has an open defect (`https://github.com/supabase/supabase/issues/36861`, related `#22031`) where the Management API wrongly rejects config PATCH with *"Auth Hooks can only be configured on Team or Enterprise Plans"* on Free/Pro projects that already have any hook configured — even for changes unrelated to hooks, and even though the Dashboard accepted the same config. No maintainer fix at time of writing.
- **VERIFIED FACT.** The hosted Dashboard control lives at `Authentication > Hooks` (`https://supabase.com/dashboard/project/_/auth/hooks`).
- **VERIFIED FACT.** GoTrue reads hook config per token issuance (`config.Hook.CustomAccessToken.Enabled` checked inside `GenerateAccessToken`, source commit `0907af9bd6be3c76f472c40a7dcc0dc34abeffaf`). Enable/disable takes effect on the next token issuance/refresh; there is no cache to clear beyond GoTrue picking up the new project config (seconds, not a redeploy).

## Recommended control surface: **Dashboard first**, Management API for read/verify only

Because of defect #36861, do **not** rely on `PATCH /config/auth` as the primary enable/disable mechanism on this project. Use the Dashboard toggle. Use the Management API `GET` for before/after evidence and, optionally, as an independent cross-check of the enable/disable — but expect the PATCH to possibly 4xx and fall back to Dashboard.

`supabase config push` is **rejected** regardless (H3A: no dry-run, House has no canonical full-project `config.toml`; a partial push would risk clobbering unrelated Auth settings). Not used anywhere in this procedure.

---

## STEP 0 — Preconditions (verify, do not change)

1. `h3c_auth_runtime_token_support` migration applied (global migration row `20260908123549`, per `H3C1-INERT-SUPPORT-POST-APPLY`). Confirm `wstera_platform_internal.custom_access_token_hook(jsonb)` exists, is `SECURITY INVOKER` (`prosecdef = false`), and `supabase_auth_admin` has USAGE + SELECT + EXECUTE.
2. `wstera_platform_internal.runtime_token_grants` has **0 rows** (hook is inert).
3. LAB service Auth identity provisioned via a supported Auth Admin path (H3C-3) — record only its UUID.
4. Grant row for that UUID inserted with `database_role='ps01_line_runtime'`, `enabled=true`, `valid_until` = end of the proof window (H3C-4). Keep `valid_until` short (≤ the proof session; hours, not days).
5. `ps01_runtime_login` still `LOGIN` (not retired). BK01 still quarantined.

## STEP 1 — Capture the pre-change Auth config (evidence)

```
GET https://api.supabase.com/v1/projects/ykxlqnshaaxmzzocpjlj/config/auth
Authorization: Bearer <MANAGEMENT_API_TOKEN>          # operator-held; never in repo
```

Save the full JSON response as `evidence/H3C-AUTHCONFIG-PRE-<timestamp>.json`. The values that matter for rollback:

- `hook_custom_access_token_enabled` (expected: `false`)
- `hook_custom_access_token_uri` (expected: `""` / null / absent — H3A found no existing hook)
- `hook_custom_access_token_secrets` (expected: empty)
- `jwt_exp` (record it — the hook caps to 5 min regardless, but the OAuth `expires_in` in responses reflects this value; see the independent review WP-A A4)
- Also note `mailer_*`, `sms_*`, `external_*`, `sessions_*`, `refresh_token_rotation_enabled`, `security_*` so a later diff can prove nothing else moved.

## STEP 2 — Enable the hook (Dashboard)

1. Open `https://supabase.com/dashboard/project/ykxlqnshaaxmzzocpjlj/auth/hooks`.
2. Under **Custom Access Token**, choose **Postgres** (not HTTPS).
3. Schema: `wstera_platform_internal`. Function: `custom_access_token_hook`. (This composes the URI `pg-functions://postgres/wstera_platform_internal/custom_access_token_hook`.)
4. Enable the hook. Save.
5. If the Dashboard rejects a non-`public` schema in the picker: **STOP**. Do not work around it by moving the function to `public`. Record the exact rejection text as a BLOCKER and hand back to House.
   - **B-2 is a hosted control-plane question only, not a GoTrue limitation.** House independently confirmed (review V-4) that current GoTrue source accepts any valid PostgreSQL schema identifier in `pg-functions://postgres/<schema>/<function>` and builds a quoted `"<schema>"."<function>"` call from it; GoTrue's own tests use non-`auth` schemas. So the *runtime* accepts `wstera_platform_internal`. The only open item is whether the hosted **Dashboard / Management-API field validation** accepts it.
   - If the Dashboard picker refuses it, try the STEP 2 (alternative) Management API `PATCH` with the explicit `pg-functions://postgres/wstera_platform_internal/custom_access_token_hook` URI before concluding it is unsupported. If both refuse, hand to House: (a) file with Supabase support, (b) a different non-exposed schema name the control plane accepts (still `REVOKE ALL FROM PUBLIC`, still not in `pgrst.db_schemas`). Do **not** relocate the hook into `public` merely to satisfy UI examples.

### STEP 2 (alternative) — Management API, only if Dashboard cannot target the schema

```
PATCH https://api.supabase.com/v1/projects/ykxlqnshaaxmzzocpjlj/config/auth
Authorization: Bearer <MANAGEMENT_API_TOKEN>
Content-Type: application/json

{
  "hook_custom_access_token_enabled": true,
  "hook_custom_access_token_uri": "pg-functions://postgres/wstera_platform_internal/custom_access_token_hook"
}
```

- Send **only** these two fields. PATCH is a partial update; unspecified fields are documented to be left unchanged. (INFERENCE — verify via the STEP 3 diff, because Supabase's config layer has round-tripped fields before.)
- If it returns *"Auth Hooks can only be configured on Team or Enterprise Plans"* (defect #36861), that is the known bug — go back to the Dashboard path; do not retry with more fields.

## STEP 3 — Verify enable (evidence, no mutation)

1. `GET /v1/projects/ykxlqnshaaxmzzocpjlj/config/auth` → save as `H3C-AUTHCONFIG-POST-ENABLE-<timestamp>.json`.
2. Diff PRE vs POST-ENABLE. **Exactly** these keys may differ: `hook_custom_access_token_enabled` (`false`→`true`), `hook_custom_access_token_uri` (empty→the pg-functions URI). Any other changed key is a **STOP / rollback** condition — record it and do not run the proof.
3. Run the proof harness `tools/shared-runtime/h3c/h3c-proof-harness.mjs` (WP-D, rev 2). Supply `H3C_RUNTIME_JWT` (or `H3C_SERVICE_EMAIL`/`H3C_SERVICE_PASSWORD`), `H3C_H3B_EVIDENCE`, `H3C_CONTROL_JWT`, `H3C_EXPIRED_JWT`, and the fixture ids. It verifies each token (ES256 signature vs LAB JWKS, issuer shape, project ref from the token only, `exp − iat ≤ 300`) and runs the full positive/negative matrix under the explicit required-probe gate. Default mode is non-mutating (never calls submit). Exit `0` only on `PASS`.

## STEP 4 — Disable the hook (rollback) — ORDER MATTERS

> **BLOCKER fix from the independent review (WP-A A4):** the LAB service identity must be invalidated *before* the hook/grant is removed. If the hook or grant row is removed first, a still-valid refresh token for that identity will mint `role=authenticated` access tokens (broader than `ps01_line_runtime` across all exposed schemas).

0. **Record the last issued runtime JWT `exp` (House review H-07).** From the harness output (`residualNarrowAuthorityUntil`) or by decoding the last token you obtained. Write it into the teardown evidence as `H3C_RESIDUAL_AUTHORITY_UNTIL = <ISO timestamp>`. An **already-issued** `ps01_line_runtime` JWT stays valid until this exact time regardless of steps 1–5 below, because PostgREST validates the JWT signature/expiry and does **not** check whether the Auth user still exists.
1. **Invalidate the service identity first.** Via a supported Auth Admin path: delete the LAB service user (preferred), or ban it and revoke all its sessions/refresh tokens. Confirm `auth.sessions` / `auth.refresh_tokens` for that `user_id` are gone. Record the UUID and the action in evidence. This stops *new* `ps01_line_runtime` and *new* `authenticated` tokens; it does not shorten a token already in someone's hand.
2. **Remove the grant row.** `DELETE FROM wstera_platform_internal.runtime_token_grants WHERE user_id = '<uuid>';` (or set `enabled=false` and `valid_until` in the past). Confirm the table is back to 0 enabled/unexpired rows.
3. **Disable the hook (Dashboard).** `Authentication > Hooks` → Custom Access Token → disable → Save.
   - Management API equivalent (only if the Dashboard was not used to enable): `PATCH /config/auth` with `{ "hook_custom_access_token_enabled": false }`. Leaving `hook_custom_access_token_uri` set but disabled is acceptable and matches "keep or disable the hook according to the next approved phase"; to fully clear, also send `"hook_custom_access_token_uri": ""`.
4. `GET /config/auth` → save `H3C-AUTHCONFIG-POST-DISABLE-<timestamp>.json`. Diff against PRE. The only acceptable residual delta is `hook_custom_access_token_uri` still holding the pg-functions string with `hook_custom_access_token_enabled = false` (if House chose to keep the URI for the next phase). If House wants an exact match to PRE, clear the URI too and re-verify the diff is empty.
5. **Only then** run the SQL rollback artifact `h3c_auth_runtime_token_support_rollback.sql` if the whole H3C support layer is being torn down. Its own guard refuses to run while any enabled/unexpired grant row exists, and its header says the hosted hook config must be disabled first — both now satisfied by steps 1–3.
6. Re-run shared-runtime signatures + Supabase Security Advisor (per the brief's Rollback Order step 6). Compare to the H3C1 baseline.
7. **Residual-authority close-out (House review H-07).** Do **not** state "H3C proof authority is fully gone" until **either** the wall clock is past `H3C_RESIDUAL_AUTHORITY_UNTIL`, **or** you have shown a request with that exact token is now rejected (e.g. re-run `POS-1` from the harness with the old token env — expect `401`). Record whichever you used. Because the token is `exp`-capped to ≤ 5 minutes, waiting it out is normally trivial.

## STEP 5 — Does changing only this hook affect other Auth settings?

- **INFERENCE (needs the STEP 3 / STEP 4 diffs to confirm on this project).** The Dashboard hooks toggle writes only the `hook_custom_access_token_*` keys. The Management API `PATCH` is documented as a partial update. Neither should touch `jwt_exp`, mailer, SMS, external providers, session timeboxes, refresh-token rotation, password policy, or SMTP.
- **The proof is the before/after `GET /config/auth` diff**, kept as evidence at every enable and disable. Treat any non-`hook_custom_access_token_*` delta as a defect and stop.
- **Not affected either way:** the 5-minute token lifetime is enforced by the hook body, independent of the project `jwt_exp` setting. Do **not** lower project `jwt_exp` as part of H3C — that would change token lifetime for *every* user of the LAB project.

## STEP 6 — Can `supabase config push` be avoided completely?

**Yes.** Every step above uses either the Dashboard toggle or a two-field Management API `PATCH`. `supabase config push` is never required and is explicitly forbidden by H3A (no dry-run, no canonical full `config.toml`, clobber risk). The rollback likewise uses the Dashboard toggle + the committed SQL rollback artifact.

## Residual unknowns for House to close during the live run

| Item | Status | Evidence that resolves it |
|---|---|---|
| GoTrue *runtime* accepts a `pg-functions://` URI in a **non-`public`** schema | **VERIFIED** (House review V-4 — GoTrue source builds a quoted `"<schema>"."<function>"` call from any valid schema id; its tests use non-`auth` schemas) | — |
| **Hosted Dashboard / Management-API field validation** accepts `wstera_platform_internal` in the hook URI | **UNPROVEN** (B-2, narrowed to control-plane only) | STEP 2 outcome (accepted, or the exact rejection text) — then try the STEP 2 alternative Management API PATCH before concluding unsupported |
| PATCH `/config/auth` with only the 2 hook fields leaves all other keys untouched on this project | **UNPROVEN (INFERENCE)** | STEP 3 diff PRE vs POST-ENABLE |
| Defect #36861 affects Postgres-function hooks on this project (not just `send_email`) | **UNKNOWN** | first PATCH attempt result; Dashboard path is the fallback regardless |
| GoTrue picks up enable/disable without a project restart | **VERIFIED (source)** / timing UNPROVEN | first token issuance after STEP 2 carries `role=ps01_line_runtime`; first issuance after STEP 4 does not |

## WP-B verdict

A precise, executable, `config push`-free activation and rollback path exists. **Primary surface: Dashboard `Authentication > Hooks`.** Management API `GET` is used for evidence; Management API `PATCH` is a documented fallback carrying known defect #36861 and must not be the first choice on this project. The one open question that could still block is whether hosted validation accepts a non-`public` hook schema — STEP 2 stops and hands back to House if it does not, rather than relocating the function to an exposed schema.
