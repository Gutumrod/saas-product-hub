# OPERATOR ACTION PACK — H3D → H5

**Date:** 2026-09-09 (Asia/Bangkok)
**For:** WSTERA authorized Supabase operator (CEO / Secretary GPT)
**Environment:** WSTERA LAB (`ykxlqnshaaxmzzocpjlj`) **only**. Production LOCKED.
**Parent:** `BRIEF-CLAUDE-H3D-H5-HOUSE-A-LONG-RUN-EXECUTION-2026-09-09.md` + `ADDENDUM-CLAUDE-PREPARE-UNTIL-OPERATOR-ACTION-2026-09-09.md` + `BRIEF-CLAUDE-H3D-OPERATOR-PACK-REMEDIATION-2026-09-09.md`
**Execution state:** `OPERATOR ACTION PACK READY / H3D LIVE BLOCKED` (remediation applied)

All PREPARE-ONLY work is done. For **H3D the operator does exactly two Dashboard
toggles** (enable the hook, then disable it). Everything between — identities,
grant row, both token issuances, the expired-token wait, the fresh privilege
snapshot, the full H3C probe matrix, and identity-first teardown — is one agent
command: `h3d-live-runner.mjs --run`. Tokens live only in memory / a child
process env; nothing secret is printed, saved, or placed on a command line.

Branches (both isolated, committed, **pushed** — see the final section for SHAs):
- House: `work/house-h3d-h5-20260909` — worktree `D:\AI-Workspace\runtime\worktrees\house-h3d-h5-20260909`
- PS01: `work/ps01-h3d-data-api-20260909` — worktree `D:\AI-Workspace\runtime\worktrees\ps01-h3d-data-api-20260909`

Secret values are **never** in this pack. Use env-var names; source real values from
`D:\AI-Workspace\.secrets\keys.txt` at runtime.

---

## STEP -1 — one-time tool install (agent, once per machine)

```
cd D:/AI-Workspace/runtime/worktrees/house-h3d-h5-20260909/tools/shared-runtime
npm install          # installs pg 8.13.1 into ./node_modules (gitignored)
npm run selftest     # h3c + h4 + h3d offline selftests -> all PASS
```

## STEP 0 — one-time env for the agent's shell (no secrets in logs)

```
cd D:/AI-Workspace/runtime/worktrees/house-h3d-h5-20260909
export H3D_SUPABASE_URL="https://ykxlqnshaaxmzzocpjlj.supabase.co"
export H3D_OUT_DIR="docs/platform/shared-runtime/evidence"
# names only — source the values from .secrets/keys.txt at runtime, never echo them:
#   H3D_ANON_KEY      <- SUPABASE_PUBLISHABLE_KEY_WSTERA_LAB
#   H3D_SERVICE_KEY   <- SUPABASE_SECRET_KEY_WSTERA_LAB
#   H3D_GRANTS_DB_URL <- postgresql://postgres.ykxlqnshaaxmzzocpjlj:<SUPABASE_DB_PASSWORD_WSTERA_LAB>@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```

---

## H3D — two operator toggles + one agent command

### Agent — preflight FIRST (before the operator touches the Dashboard)

```
node tools/shared-runtime/h3d/h3d-live-runner.mjs --preflight
```
`--preflight` (no hosted mutation beyond a self-torn-down probe identity) verifies:
env present · `h3c-proof-harness.mjs` / `h3c-privilege-snapshot.sql` / H3B evidence on
disk · a nullable `ps01.bookings` column resolves for `NEG-TBL-2` · the live
privilege snapshot still matches the `ps01_line_runtime` boundary · the probe
identity + grant it created were fully removed · whether the hook is currently active.

- **exit 2** — `NOT READY — operator must enable the Custom Access Token hook`. Do
  operator action A, wait ~30s, re-run `--preflight`.
- **exit 1 / STOP** — a required input can't be resolved read-only. Do **not** ask
  the operator to enable the hook. Report the reason.
- **exit 0** — `READY (hook active)`. Continue to `--run`.

### Operator action A (Dashboard, ~1 min)

1. **Supabase → project `wstera-lab` → Authentication → Hooks**.
2. **Custom Access Token** hook → Postgres function
   `wstera_platform_internal.custom_access_token_hook` → **Enable**. Screenshot before + after.
   Change **only** this field. No project-wide `config push`.

> If the Dashboard rejects a non-`public` hook schema: **STOP**, tell the agent
> (brief §13). Do not move the hook to `public` or widen its ACL.

### Agent — one command (~7 min; it self-waits for the expired-token window)

```
node tools/shared-runtime/h3d/h3d-live-runner.mjs --run ; echo "exit=$?"
```
`--run` does, in order: create a runtime + a control Auth identity → add one
`ps01_line_runtime` grant (900 s row) → issue the runtime token that will be the
**expired** input → issue the control token (must stay `role=authenticated`) →
resolve the table column → **wait out the token expiry** → write a fresh privilege
snapshot → issue the **active** runtime token → spawn `h3c-proof-harness.mjs` with
all tokens in the child ENV (never argv/stdout) → read the verdict → **teardown
identity-first**: delete both identities, delete the grant row, verify each exact
UUID is gone → emit `H3D-RUN-*.json` + `H3D-LIVE-PROOF-*.json`.

Evidence holds only: identity UUIDs, issuer/ref, role, iat/exp/lifetime, probe
verdicts, HTTP/error classes. No raw token, ever.

**H3D LIVE PASS** = `--run` exit 0 and `H3D-RUN-*.json` `verdict: "H3D LIVE PASS"`:
- child `h3c-proof-harness` `verdict: PASS`, exitCode 0 (every required probe PASS);
- `tokens.active.role = ps01_line_runtime`, `lifetimeSec ≤ 300`;
- `tokens.control.role = authenticated` (hook is a no-op for non-allowlisted users);
- `teardown`: both identities gone, our grant row gone, `grant_rows_after ≤ grant_rows_before`.

**STOP** (`--run` exit 1) if: `verdict` starts `H3D RUN FAILED` (an error or a
cleanup that could not be verified) or `H3D LIVE NOT PASS` (harness FAIL /
INCOMPLETE — inspect `harness.gate` and the proof JSON `results[]`). A cleanup
failure is a hard failure — chase the residual identity/grant with
`--teardown-only <uuid,uuid>` using the UUIDs in `H3D-RUN-*.json`.

### Operator action B (Dashboard, ~30 s) — after `--run` returns

- **Authentication → Hooks → Custom Access Token → Disable.** Screenshot.
- The last issued token stays valid until `residualNarrowAuthorityUntil` in
  `H3D-RUN-*.json` (≤ 5 min out). Do not declare authority gone before it.

### Agent finishes H3D

- fill `evidence/H3D-PS01-DATA-API-PATH-PROOF-2026-09-09.md` §4 from `H3D-RUN-*.json`
  + `H3D-LIVE-PROOF-*.json` (UUIDs / iss / ref / role / iat / exp / lifetime / verdicts only);
- mark **H3D: PASS**; checkpoint + push both branches (brief §14);
- `lab-readonly-inventory.mjs` + `compare-inventory.mjs` vs
  `H3D-BASELINE-INVENTORY-2026-09-09.json` → expect **SIGNATURE MATCH** (teardown
  leaves no LAB delta).

---

## H3E — after H3D PASS (agent applies, one operator check)

Agent, in the House worktree:
```
psql "$H3D_GRANTS_DB_URL" -f docs/platform/shared-runtime/evidence/H3E-ROLE-STATE-QUERIES-2026-09-09.sql   # pre-state
psql "$H3D_GRANTS_DB_URL" -f docs/platform/shared-runtime/migrations/h3e_ps01_runtime_login_retirement.sql  # forward (self-guarded)
psql "$H3D_GRANTS_DB_URL" -f docs/platform/shared-runtime/migrations/h3e_ps01_runtime_login_rollback_rehearsal.sql  # rehearsal (transaction, ROLLBACK)
psql "$H3D_GRANTS_DB_URL" -f docs/platform/shared-runtime/evidence/H3E-ROLE-STATE-QUERIES-2026-09-09.sql   # post-state
```
- re-run the H3D smoke (operator re-enables the hook briefly, or reuse if still in window) to prove the Data API path still works after retirement;
- direct-login failure probe (command in `H3E-...-RETIREMENT-2026-09-09.md` §5) → expect auth failure.

**Operator:** only needed to briefly re-enable the hook for the post-H3E Data API re-smoke, then disable. No other action.

Secret-registry: mark `PS01_RUNTIME_DB_PASSWORD_WSTERA_LAB` **RETIRED/QUARANTINED** by NAME (checklist in the H3E evidence doc §6). Coordinate with the Secret Vault rebuild owner.

---

## H3F — after H3E (agent only, no operator)

```
node tools/shared-runtime/inventory/lab-readonly-inventory.mjs   # -> H3F-SHARED-SURFACE-SNAPSHOT
node tools/shared-runtime/inventory/compare-inventory.mjs \
  docs/platform/shared-runtime/evidence/H3D-BASELINE-INVENTORY-2026-09-09.json \
  docs/platform/shared-runtime/evidence/H3F-SHARED-SURFACE-SNAPSHOT-2026-09-09.json \
  docs/platform/shared-runtime/evidence/H3F-EXPECTED-DELTA-MANIFEST-2026-09-09.json
```
exit 0 → fill `H3F-SHARED-SURFACE-REMEASURE-2026-09-09.md` verdict → **H3 PASS/CLOSED**.
exit 3 → **STOP**, unexplained shared-surface delta.

---

## H4 — after H3 PASS/CLOSED (operator toggles marked ⚙)

1. Agent: `psql -f migrations/h4_disposable_product_forward.sql` (self-guarded; needs H3E applied).
2. ⚙ **Operator:** Dashboard → **Settings → API → Exposed schemas**: add **only** `h4_probe`
   (result string: `public, graphql_public, local_service, ps01, h4_probe`). Screenshot before/after.
3. ⚙ **Operator:** Dashboard → **Auth → Hooks → Custom Access Token**: point at
   `wstera_platform_internal.h4_custom_access_token_hook`, **Enable**. Screenshot.
4. Agent: provision H4 Auth identity + `h4_runtime_token_grants` row + token (analogous
   to the H3D runner path), then:
   ```
   node tools/shared-runtime/h4/h4-probe-harness.mjs   # H4_RUNTIME_JWT etc.
   ```
   plus the SQL negative matrix in `evidence/H4-DISPOSABLE-PRODUCT-PROOF-2026-09-09.md`.
5. Agent: positive migrator op via `SET ROLE h4_migrator; SELECT h4_probe.h4_migrate_note('h4-forward-proof');`
6. **Teardown (order):** agent deletes H4 Auth identity + grant row → ⚙ operator **disables the hook**
   → ⚙ operator **restores Exposed schemas** to `public, graphql_public, local_service, ps01`
   → agent `psql -f migrations/h4_disposable_product_rollback.sql` → agent re-inventory + compare
   (signature back to pre-H4).

**H4 STOP:** any `h4_*` identity reaching a foreign schema / net / cron / auth / storage /
`wstera_platform_internal`; any need for a direct DB login credential; a 5xx-only "denial";
any unrelated BK01/MT01/shared delta.

---

## H5 — after H4 PASS + torn down (mostly agent; ⚙ operator for Advisor + brief hook)

- Agent: `psql -f evidence/H5-BK01-MT01-READONLY-PROBES-2026-09-09.sql` (baseline already confirmed 2026-09-09).
- Agent: PS01 static gates + (where local Supabase available) `tests/phase*`; Customer LINE
  context+quote via the Data API token (⚙ operator briefly enables the hook, or reuse the
  H3E-era window).
- ⚙ **Operator:** Dashboard → **Advisors → Security → Refresh**; export the findings JSON /
  screenshot. Expected: only `local_service.shop_public_profile` (pre-existing). Any new
  `ps01_line_runtime` / `h4_*` / hook finding → **H5 FAIL**.
- Agent: rollback-proof table (`H5-...-REGRESSION-2026-09-09.md` §5); final inventory + compare.
- Agent: assemble `REPORT-HOUSE-A-REVIEW-READY-2026-09-09.md`, status `HOUSE-A REVIEW READY`,
  candidate recommendation only. **Claude does not declare HOUSE-A PASS or release BK01.**

---

## Operator-only action summary (the whole run)

| # | Phase | Dashboard page | The one change | Reversible by |
|---|---|---|---|---|
| A | H3D | Auth → Hooks | Enable Custom Access Token hook → `wstera_platform_internal.custom_access_token_hook` | B |
| B | H3D | Auth → Hooks | Disable that hook | — |
| (re-A/B) | H3E, H5 | Auth → Hooks | brief enable/disable for the post-retirement + H5 Customer-LINE re-smoke | each other |
| C | H4 | Settings → API → Exposed schemas | add `h4_probe` | F |
| D | H4 | Auth → Hooks | Enable → `wstera_platform_internal.h4_custom_access_token_hook` | E |
| E | H4 | Auth → Hooks | Disable that hook | — |
| F | H4 | Settings → API → Exposed schemas | remove `h4_probe` (restore exact string) | — |
| G | H5 | Advisors → Security | Refresh + export findings | read-only |

Everything else — Auth identity provisioning, grant rows, probes, SQL migrations,
inventories, comparisons, evidence — the agent does with the LAB secrets it already has.

## Residual-authority note

Every issued runtime/H4 token is capped at ≤ 5 minutes by the hook. After each
`Disable`, wait past the last token's `exp` (the runners print
`residualNarrowAuthorityUntil`) before recording "authority gone".

---

## Branch / commit evidence (pushed)

| Lane | Branch | Remote | Base | HEAD | Parity |
|---|---|---|---|---|---|
| House | `work/house-h3d-h5-20260909` | `github.com/Gutumrod/saas-product-hub` | `94ce432` (master, contains this brief; `6b0020c` ancestor) | `7e1f2bb` (H3D operator-pack remediation) + this doc-evidence commit on top | `0/0` at each push |
| PS01 | `work/ps01-h3d-data-api-20260909` | `github.com/Gutumrod/pawspace` | `c21c27c` (required source commit) | `4efee70` (H3D Data API adapter) | `0/0` |

Neither branch is merged. Original House `master` and the original PS01
`build/ps-sr02-staging-2026-09-06` worktree (incl. its untracked handoff) are
untouched. Secretary GPT owns the review/merge decision and the final HOUSE-A gate.

No WSTERA LAB mutation has occurred through H3D preparation or the operator-pack
remediation — only read-only catalog/inventory queries and a self-torn-down
`--preflight` probe identity when explicitly run.
