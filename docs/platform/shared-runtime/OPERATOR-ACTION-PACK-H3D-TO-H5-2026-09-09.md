# OPERATOR ACTION PACK — H3D → H5

**Date:** 2026-09-09 (Asia/Bangkok)
**For:** WSTERA authorized Supabase operator (CEO / Secretary GPT)
**Environment:** WSTERA LAB (`ykxlqnshaaxmzzocpjlj`) **only**. Production LOCKED.
**Parent:** `BRIEF-CLAUDE-H3D-H5-HOUSE-A-LONG-RUN-EXECUTION-2026-09-09.md` + `ADDENDUM-CLAUDE-PREPARE-UNTIL-OPERATOR-ACTION-2026-09-09.md`
**Execution state:** `OPERATOR ACTION PACK READY / H3D LIVE BLOCKED`

All PREPARE-ONLY work is done. The only thing standing between here and H3D PASS is
**one hosted Dashboard toggle**. After that, one script and one harness run finish H3D.
H3E / H3F are then automatable by the agent; H4 / H5 have a few more operator toggles
listed separately at the end.

Branches (both isolated, committed, **not pushed**):
- House: `work/house-h3d-h5-20260909` — worktree `D:\AI-Workspace\runtime\worktrees\house-h3d-h5-20260909`
- PS01: `work/ps01-h3d-data-api-20260909` @ `4efee70` — worktree `D:\AI-Workspace\runtime\worktrees\ps01-h3d-data-api-20260909`

Secret values are **never** in this pack. Use env-var names; source real values from
`D:\AI-Workspace\.secrets\keys.txt` at runtime.

---

## STEP 0 — one-time env for the agent's shell (no secrets in logs)

```
export H3D_SUPABASE_URL="https://ykxlqnshaaxmzzocpjlj.supabase.co"
# from .secrets/keys.txt, names only:
#   H3D_ANON_KEY      <- SUPABASE_PUBLISHABLE_KEY_WSTERA_LAB
#   H3D_SERVICE_KEY   <- SUPABASE_SECRET_KEY_WSTERA_LAB
#   H3D_GRANTS_DB_URL <- postgresql://postgres.ykxlqnshaaxmzzocpjlj:<SUPABASE_DB_PASSWORD_WSTERA_LAB>@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
export H3D_OUT_DIR="docs/platform/shared-runtime/evidence"
```

---

## H3D — the one operator toggle + finish

### Operator action A (Dashboard, ~1 min)

1. Open **Supabase → project `wstera-lab` → Authentication → Hooks** (or *Auth → Hooks*).
2. **Custom Access Token** hook → set it to the Postgres function
   `wstera_platform_internal.custom_access_token_hook` and **Enable**.
3. Screenshot the hook config panel (before + after) for the evidence file.
   Change **only** this one field. Do **not** run a project-wide config push.

> If the Dashboard rejects a non-`public` hook schema: **STOP**, tell the agent.
> Do not move the hook to `public` or widen its ACL (brief §13).

### Agent action (scripted — no further operator input)

```
cd D:/AI-Workspace/runtime/worktrees/house-h3d-h5-20260909
node tools/shared-runtime/h3d/h3d-live-runner.mjs --preflight
```
- **PASS →** prints `HOOK ACTIVE: token carries role=ps01_line_runtime` (exit 0). Continue.
- **STOP →** prints `HOOK NOT ACTIVE: token role=authenticated` (exit 2). The toggle
  didn't take — recheck Action A, wait ~30s for Auth to pick it up, re-run `--preflight`.

Then the live smoke:
```
# capture a fresh privilege snapshot (SELECT-only)
psql "$H3D_GRANTS_DB_URL" -Atf tools/shared-runtime/h3c/h3c-privilege-snapshot.sql \
  > "$H3D_OUT_DIR/H3D-PRIVILEGE-SNAPSHOT-$(date +%Y%m%dT%H%M%SZ).json"

node tools/shared-runtime/h3d/h3d-live-runner.mjs --run
# -> provisions a disposable Auth user, adds a 240s ps01_line_runtime grant,
#    issues a token, prints the exact h3c-proof-harness command, then
#    tears down identity-first (delete user -> delete grant row).

# run the probe matrix with the token the runner issued:
export H3C_SUPABASE_URL="$H3D_SUPABASE_URL"
export H3C_ANON_KEY="$H3D_ANON_KEY"
export H3C_RUNTIME_JWT="<token from the --run output>"
export H3C_PRIVILEGE_SNAPSHOT="<the snapshot file above>"
export H3C_H3B_EVIDENCE="docs/platform/shared-runtime/evidence/H3B-POST-APPLY-RUNTIME-BOUNDARY-2026-09-08.md"
export H3C_EXPIRED_JWT="<optional: an earlier expired ps01_line_runtime token>"
export H3C_OUT="$H3D_OUT_DIR/H3D-LIVE-PROOF-$(date +%Y%m%dT%H%M%SZ).json"
node tools/shared-runtime/h3c/h3c-proof-harness.mjs ; echo "exit=$?"
```

**H3D PASS indicators:**
- `--preflight` exit 0 (`HOOK ACTIVE`);
- `h3c-proof-harness.mjs` `verdict: PASS`, exit 0;
- `--run` output shows grant rows `after` = 0 and the disposable identity deleted;
- token in the proof JSON: `role=ps01_line_runtime`, `lifetimeSec ≤ 300`.

**STOP indicators (brief §13):**
- harness `verdict: FAIL` / any `NEG-*` not PASS / a 5xx being read as a denial;
- a runtime token reaching `local_service` / `ps01_internal` / MT01 / net / cron / auth / storage;
- teardown leaves a grant row or the Auth identity.

### Operator action B (Dashboard, ~30s) — after the harness run

- **Authentication → Hooks → Custom Access Token → Disable.** Screenshot.
- Residual authority: the last issued token stays valid until its `exp`
  (≤ 5 min after issuance, printed as `residualNarrowAuthorityUntil`). Do not
  declare authority gone before that timestamp.

### Agent finishes H3D

- fill `evidence/H3D-PS01-DATA-API-PATH-PROOF-2026-09-09.md` §4 with the live probe
  outcomes + token claims (issuer/ref/role/iat/exp/identity UUID only — **no raw token**);
- mark **H3D: PASS**; checkpoint both branches (brief §14);
- run `lab-readonly-inventory.mjs` again and `compare-inventory.mjs` vs
  `H3D-BASELINE-INVENTORY-2026-09-09.json` → expect SIGNATURE MATCH (no LAB delta
  from the smoke after teardown).

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
