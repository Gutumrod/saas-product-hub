# OPERATOR ACTION PACK — H3D → H5

**Date:** 2026-09-09 (Asia/Bangkok)
**For:** WSTERA authorized Supabase operator (CEO / Secretary GPT)
**Environment:** WSTERA LAB (`ykxlqnshaaxmzzocpjlj`) **only**. Production LOCKED.
**Parent:** the H3D-H5 long-run brief + the addendum + the operator-pack / AUTHZ-fixture / disposable-fixture-prep / **final one-shot** remediation briefs (all under `docs/platform/shared-runtime/`)
**Execution state:** `H3D FINAL REMEDIATION IMPLEMENTED / LIVE DML AWAITING SEPARATE AUTHORIZATION` (all §11 acceptance gates green; see `evidence/H3D-FINAL-REMEDIATION-2026-09-09.md`)

Every §5–§10 remediation of the final one-shot brief is implemented. The H3D flow
below is now the **16 gated transitions of §9** — no command crosses the mutation
boundary without a separate external authorization receipt. The guarded fixture
package is prepared and static-verified but **NOT applied**:

- `fixtures/h3d-authz-fixture-precheck.sql` (SELECT-only, EVIDENCE ONLY — never the guard)
- `fixtures/h3d-authz-fixture-seed.sql` (§5: locks + 7 in-txn pre-DML assertions + exact +8/+4 delta + exact subscription/audit semantics + manifest)
- `fixtures/h3d-authz-fixture-teardown.sql` (§6: ACCESS EXCLUSIVE audit lock + exact-id deletes with ROW_COUNT + residue zero + pre-seed count restoration)
- `fixtures/h3d-expected-catalog-manifest.json` (version-controlled expected trigger/FK/function graph; `catalog-manifest.mjs --verify` STOPs on any drift)

**Live authorization boundary:** `IMPLEMENTED / REVIEW-READY` → Secretary/House
review → the four **external authorization receipts** of §9 (issued per phase, per
commit + run id, ≤ 15 min TTL) → each guarded phase. Claude issues no `*_AUTHORIZED`
receipt and applies no seed/teardown/Auth/grant/hook/run.

<details><summary>historical: earlier state before the final one-shot remediation</summary>

The tooling gate was green but `--preflight` STOPped: `POS-AUTHZ-1/3` need REAL
cross-shop / cross-customer PS01 rows and WSTERA LAB has zero PS01 business rows.
House selected unblock option 1 — a bounded disposable fixture — then commissioned
the Codex final review whose 12 findings this pack now implements.
</details>

Historical boundary text: `PREPARED / REVIEW-READY` → Secretary/House
review of those 3 SQL files → **explicit Owner/House authorization** → apply the
seed. Claude does not apply it.

Once the seed is applied (real PS01 cross-tenant rows exist), the flow below runs unchanged: for
**H3D the operator does exactly two Dashboard toggles** (enable the hook, then
disable it). Everything between — fixture discovery, identities, grant row, both
token issuances, the expired-token wait, the fresh privilege snapshot, the full
H3C probe matrix, and identity-first teardown — is one agent command:
`h3d-live-runner.mjs --run`. Tokens live only in memory / a child process env;
nothing secret is printed, saved, or placed on a command line.

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

## H3D — 16 gated transitions (§9 of the final one-shot remediation brief)

**No single command crosses the mutation boundary.** `--preflight-readonly` is
mechanically mutation-free. Every mutating phase needs a *separate*, fresh,
hash-linked external authorization receipt that the runner reads but cannot mint.
Each phase writes a durable receipt (15-min TTL, invalidated on commit / catalog /
fixture / hook-state drift). `node tools/shared-runtime/h3d/h3d-live-runner.mjs --state`
prints the current chain.

One-time: `H3D_RUN_ID` (a stable id for the whole authorized window),
`H3D_HOUSE_ROOT`, `H3D_OUT_DIR`, `H3D_RECEIPTS_DIR`, the LAB env from STEP 0.

| # | Owner | Prerequisite | Action | Mutation authority | Evidence |
|---|---|---|---|---|---|
| 1 | Agent | locked House + PS01 commits | `--reviewed` — catalog `--verify`, SELECT-only collision / baseline / inventory, fixture discovery. Writes `REVIEWED` receipt. | **none** | `H3D-REVIEWED-*.json` |
| 2 | House / Owner | Step 1 PASS | issue a `FIXTURE_DML_AUTHORIZED` external receipt for this exact commit + `H3D_RUN_ID` | authorizes the seed only | the receipt file |
| 3 | Agent / operator | Step 2 receipt + catalog `--verify` PASS | `psql -v manifest=… -f fixtures/h3d-authz-fixture-seed.sql` (guarded: 7 pre-DML assertions under `SHARE ROW EXCLUSIVE` locks, exact +8/+4 delta, exact subscription/audit semantics, emits a manifest) | fixture + trigger-support DML only | seed manifest JSON |
| 4 | Agent | Step 3 manifest | `--verify-post-seed` (`H3D_SEED_MANIFEST=…`) — SELECT-only, matches manifest ids + topology + exact delta + fixture fingerprint. Writes `POST_SEED_VERIFIED` receipt. | **none** | `H3D-POST-SEED-VERIFIED-*.json` |
| 5 | House / Owner | Step 4 PASS | issue a `HOOK_PROBE_AUTHORIZED` external receipt | temporary Auth user + grant probe only | the receipt file |
| 6 | Agent / operator | Step 5 + fresh `POST_SEED_VERIFIED` | `--preflight-hook-probe --authorize-hook-probe <f> --expect-hook-off` — creates one probe identity + grant, checks the token stays `authenticated`, tears both down (ledger, verified). Writes `HOOK_OFF_CONFIRMED`. | Auth/grant probe only | `H3D-HOOK-PROBE-*.json` |
| 7 | Human operator | Step 6 `HOOK_OFF_CONFIRMED` | **Supabase → Auth → Hooks → Custom Access Token → point at `wstera_platform_internal.custom_access_token_hook` → Enable.** Screenshot. Only this field; no `config push`. | one Dashboard control | screenshots |
| 8 | Agent / operator | Step 7 | `--preflight-hook-probe --authorize-hook-probe <f> --expect-hook-on` — fresh probe yields `role=ps01_line_runtime`, exact project/lifetime checks, torn down + verified. Writes `HOOK_ON_CONFIRMED`. | Auth/grant probe only | `H3D-HOOK-PROBE-*.json` |
| 9 | House / Owner | Step 8 PASS | issue a `RUN_AUTHORIZED` external receipt | run identities + grant only | the receipt file |
| 10 | Agent / operator | Step 9 + fresh `HOOK_ON_CONFIRMED` + fixture fingerprint + catalog | `--run --authorize-run <f>` — runtime + control identities/grant (ledger); expired + control + fresh active tokens; fixed recorded `start_at`; spawn `h3c-proof-harness.mjs` with `H3C_STRICT_H3D=1` and every token in a **minimal child env**; strict AUTHZ + 2xx-positive matrix; failure-safe teardown of every registered resource on every path. Writes `RUN_COMPLETE` only on PASS. | bounded run DML | `H3D-RUN-*.json`, `H3D-LIVE-PROOF-*.json` |
| 11 | Human operator | Step 10 terminal evidence (PASS **or** FAIL) | **Auth → Hooks → Custom Access Token → Disable.** Screenshot. | one Dashboard control | screenshots |
| 12 | Agent / operator | Step 11 | confirm hook off (`--preflight-hook-probe … --expect-hook-off` if the Step 5 receipt still covers it); wait past the max `exp` of **every** issued token (`residualNarrowAuthorityUntil`); verify zero owned identities/grants. Writes `RESIDUAL_EXPIRED`. | authorized probe if the Step 5 receipt allows | `H3D-HOOK-PROBE-*.json` |
| 13 | House / Owner | Step 12 PASS | issue a `FIXTURE_TEARDOWN_AUTHORIZED` external receipt | fixture teardown only | the receipt file |
| 14 | Agent / operator | Step 13 + catalog `--verify` PASS | `psql -v manifest=… -f fixtures/h3d-authz-fixture-teardown.sql` (ACCESS EXCLUSIVE on `subscription_audit_log`, exact-id deletes with `ROW_COUNT`, immutable-audit disable/re-enable for exactly the two shops' audit ids, residue zero, counts restored). | exact fixture/support DELETE only | teardown NOTICE + `H3D-BK01-MT01…` re-run |
| 15 | Agent | Step 14 | `lab-readonly-inventory.mjs` + `compare-inventory.mjs` vs `H3D-BASELINE-INVENTORY-2026-09-09.json` → SIGNATURE MATCH; assemble the closure package. Writes `RESTORED`. | **none** | closure package |
| 16 | House | all evidence PASS | decide H3D closure | no automatic H3E/H3F/H4/H5 authority | — |

On any failure after Step 7: **disable the hook first**, preserve the redacted
recovery ledger IDs, `--teardown-only <uuid,uuid>` for runner-owned
identities/grants, wait out token expiry, then decide fixture teardown. Do not
run a later phase to "recover".

### External authorization receipt format (House / Owner writes these; the runner never does)

```json
{ "kind": "h3d-external-authorization",
  "state": "FIXTURE_DML_AUTHORIZED" | "HOOK_PROBE_AUTHORIZED" | "RUN_AUTHORIZED" | "FIXTURE_TEARDOWN_AUTHORIZED",
  "run_id": "<H3D_RUN_ID>", "commit": "<House HEAD full SHA>",
  "expires_at": "<ISO, <= 15 min out>", "signer": "<House / Owner reference, no sensitive data>" }
```

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

| Lane | Branch | Remote | Base | HEAD (latest) | Parity |
|---|---|---|---|---|---|
| House | `work/house-h3d-h5-20260909` | `github.com/Gutumrod/saas-product-hub` | `94ce432` (master, contains the parent brief; `6b0020c` ancestor) | final one-shot remediation commit on top of `0a7430f` (the CEO-locked final review brief) | `0/0` at each push |
| PS01 | `work/ps01-h3d-data-api-20260909` | `github.com/Gutumrod/pawspace` | `c21c27c` | `c169e5d` — brief-canonical adapter `4efee70` + Owner's own `test(ps01): add booking v2 verification evidence` on top; this lane did not touch it | `0/0` |

Neither branch is merged. Original House `master` and the original PS01
`build/ps-sr02-staging-2026-09-06` worktree (incl. its untracked handoff) are
untouched. Secretary GPT owns the review/merge decision and the final HOUSE-A gate.

**No WSTERA LAB mutation** has occurred through any H3D round — only read-only
catalog / RPC-signature / inventory / fixture-discovery queries (verified after
this round: `ps01.shops` 0, `runtime_token_grants` 0, `auth.users` 5). The H3D
flow no longer has a single command that reaches the mutation boundary — see the
§9 16-transition table above.
