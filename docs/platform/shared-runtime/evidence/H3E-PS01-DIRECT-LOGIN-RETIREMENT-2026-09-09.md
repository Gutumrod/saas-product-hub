# H3E — Retire Direct PS01 Product DB Login (PREPARED / NOT APPLIED)

**Date prepared:** 2026-09-09 (Asia/Bangkok)
**Environment:** WSTERA LAB (`ykxlqnshaaxmzzocpjlj`) only — Production LOCKED
**Status:** `PREPARE-ONLY — DO NOT APPLY UNTIL H3D IS PASS`
**Entry gate (brief §8):** H3C PASS/CLOSED **and** H3D PASS (real Customer LINE Data API smoke green). H3D is currently BLOCKED — see `H3D-LIVE-ACTION-REQUIRED-2026-09-09.md`.

## Source-of-Truth References

1. `docs/platform/shared-runtime/BRIEF-CLAUDE-H3D-H5-HOUSE-A-LONG-RUN-EXECUTION-2026-09-09.md` §8
2. `docs/platform/shared-runtime/DESIGN-H2-SHARED-RUNTIME-ISOLATION-EXECUTION-BOUNDARY-2026-09-08.md` (H3E)
3. `docs/platform/shared-runtime/ADDENDUM-CLAUDE-PREPARE-UNTIL-OPERATOR-ACTION-2026-09-09.md`
4. Forward: `docs/platform/shared-runtime/migrations/h3e_ps01_runtime_login_retirement.sql`
5. Rollback: `docs/platform/shared-runtime/migrations/h3e_ps01_runtime_login_retirement_rollback.sql`
6. Rehearsal: `docs/platform/shared-runtime/migrations/h3e_ps01_runtime_login_rollback_rehearsal.sql`
7. Query pack: `docs/platform/shared-runtime/evidence/H3E-ROLE-STATE-QUERIES-2026-09-09.sql`
8. Baseline: `docs/platform/shared-runtime/evidence/H3D-BASELINE-INVENTORY-2026-09-09.json`

## 1. Pre-mutation state (from H3D-BASELINE-INVENTORY-2026-09-09.json, 2026-09-09 ~08:33 UTC)

`ps01_runtime_login`:

| Attribute | Value |
|---|---|
| `rolcanlogin` | **true** |
| `rolinherit` | true |
| `rolsuper` / `rolcreatedb` / `rolcreaterole` / `rolbypassrls` / `rolreplication` | false |
| `rolconfig` | `search_path=ps01, pg_catalog` · `statement_timeout=8s` · `lock_timeout=8s` |
| password configured | **true** (SCRAM-SHA-256; value NOT read) |
| membership | member of `ps01_runtime` (`inherit_option=true`, `set_option=true`, grantor `postgres`) |
| active sessions | **0** (`pg_stat_activity` — no `ps01_runtime_login` backend at snapshot) |

Application references to `PS01_RUNTIME_DB_*` / direct pooler code: only `lib/env.ts` (`requirePs01RuntimeDatabaseEnv`, now marked rollback/reference). No active caller on `work/ps01-h3d-data-api-20260909` (verified by grep + boundary verifier at H3D).

## 2. Forward artifact — `h3e_ps01_runtime_login_retirement.sql`

Effect: `ALTER ROLE ps01_runtime_login NOLOGIN` + `PASSWORD NULL`. Role and `ps01_runtime` membership preserved (audit/rollback identity). Nothing else touched.

Self-guards: platform postgres session; role exists; role is in the expected pre-H3E LOGIN/INHERIT shape; password currently present; **zero active `ps01_runtime_login` sessions**; `ps01_line_runtime` replacement boundary present and bounded. Post-checks: NOLOGIN, passwordless, membership intact, no attribute drift, `ps01_line_runtime` still exactly 3 EXECUTEs.

## 3. Rollback contract (brief §8)

`h3e_ps01_runtime_login_retirement_rollback.sql` re-enables LOGIN **only** with a `-v new_pw=` psql variable that the operator generates fresh (`openssl rand -base64 30`) and injects out-of-band. The old password is never restored from source control or evidence. The script refuses to run without `new_pw`.

## 4. Rollback rehearsal (brief §8 — "prove rollback safely")

`h3e_ps01_runtime_login_rollback_rehearsal.sql` runs inside a single transaction that is `ROLLBACK`-ed:
1. asserts the role is currently NOLOGIN/passwordless;
2. `ALTER ROLE ... LOGIN PASSWORD <gen_random_uuid()::text × 2>` — a throwaway value generated in-transaction, never `SELECT`-ed, never logged;
3. asserts LOGIN + password-present;
4. `ALTER ROLE ... NOLOGIN PASSWORD NULL` — asserts the intended final shape;
5. `ROLLBACK` — no catalog change survives.

`ALTER ROLE` attribute/password changes are catalog writes and are transaction-scoped in PostgreSQL 17, so the rehearsal proves restorability without leaving the direct login re-enabled and without exposing any secret. **Limitation:** the rehearsal proves the role can be *shaped* back to LOGIN/password-present; it does not prove an end-to-end pooler authentication with a specific credential (that would require issuing and using a real credential). This is the reviewed rollback procedure; recorded per brief §8's "record that limitation explicitly" allowance.

## 5. Post-apply proof plan (brief §8) — fill after apply

Run `H3E-ROLE-STATE-QUERIES-2026-09-09.sql` (post) + `lab-readonly-inventory.mjs` (post) and record:

- [ ] `ps01_runtime_login`: `rolcanlogin=false`, `password_present=false`.
- [ ] zero active sessions for `ps01_runtime_login`.
- [ ] H3D Data API context/quote smoke still passes after retirement (re-run the H3D live smoke path).
- [ ] direct network login using the retired identity **fails** (attempt a pooler connect as `ps01_runtime_login` with any credential → expect auth failure; record the error class, not a credential).
- [ ] `ps01_line_runtime` remains NOLOGIN with exactly 3 RPC EXECUTEs and 0 direct PS01 writes.
- [ ] no BK01 / MT01 / shared privilege changed — `compare-inventory.mjs <baseline> <post> H3E-EXPECTED-DELTA.json` → exit 0.

### Direct-login failure probe

```
# expect: connection refused at auth — "password authentication failed" / "role ... is not permitted to log in"
PGPASSWORD='any-nonsense' psql "host=aws-1-ap-southeast-1.pooler.supabase.com port=5432 dbname=postgres user=ps01_runtime_login.ykxlqnshaaxmzzocpjlj sslmode=require" -c 'select 1' ; echo "exit=$?"
```

## 6. Secret-registry cleanup checklist (by NAME only — brief §8)

After H3E post-apply proof is green, in `D:\AI-Workspace\.secrets\` (coordinate with the Secret Vault rebuild owner — do not edit `registry.tsv` from this brief):

- [ ] `PS01_RUNTIME_DB_PASSWORD_WSTERA_LAB` — mark **RETIRED / QUARANTINED**. The LAB role is now passwordless; this value authenticates nothing. Do not delete the historical record; do not print the value.
- [ ] `PS01_RUNTIME_DB_HOST` / `PS01_RUNTIME_DB_PORT` / `PS01_RUNTIME_DB_NAME` / `PS01_RUNTIME_DB_USER` (LAB) — mark **reference-only**; not consumed by the active Customer LINE path.
- [ ] Any ignored/local `.env` on a PS01 runtime profile that carries `PS01_RUNTIME_DB_PASSWORD` — remove the active key/value from that profile (do not copy it elsewhere, never commit).
- [ ] Production `PS01_RUNTIME_DB_*` names — untouched by this LAB work; Production provisions fresh and repeats proof separately.

## 7. What H3E does NOT do

- Does not drop `ps01_runtime_login` (kept as audit/rollback identity).
- Does not change `ps01_runtime`, `ps01_migrator`, `ps01_line_runtime`, or any BK01/MT01/managed role.
- Does not touch Data API exposed schemas, Storage, cron, extensions, or the migration ledger beyond adding its own reviewed row.
- Does not restore or read the old credential.

## 8. Verdict

`H3E PREPARED — BLOCKED ON H3D PASS.` Do not apply. Do not proceed to H3F until H3E post-apply proof is clean.
