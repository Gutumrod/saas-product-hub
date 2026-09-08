# H3C Auth-Issued Runtime Token Proof Harness

**Status:** PREPARE-ONLY. On `review/claude-h3c-proof-20260908`. **Not yet run** against WSTERA LAB. Run by the WSTERA House operator / Secretary GPT after H3C-3/4/5 provisioning.
**Rev 2** — remediated per `../../../docs/platform/shared-runtime/evidence/HOUSE-REVIEW-CLAUDE-H3C-PROOF-PACK-2026-09-08.md` (H-01…H-07).

## What it is

A single self-contained Node script that proves the H3C data-plane boundary:

- decodes and **cryptographically verifies** an Auth-issued access token against the LAB JWKS (ES256, public key only — no signing material);
- checks `iss`, `role=ps01_line_runtime`, project ref (**from the token / issuer / JWKS only, never from the target URL**), and `exp − iat ≤ 300s` **measured from the JWT** (GoTrue does not cap the OAuth `expires_in` — see the independent review WP-A A4);
- runs the positive + negative matrix from `../../../docs/platform/shared-runtime/evidence/CLAUDE-H3C-NEGATIVE-MATRIX-2026-09-08.md`;
- enforces an **explicit required-probe contract**: `PASS` only if every required probe is present exactly once with verdict `PASS` and there is no `FAIL`, duplicate, or unknown verdict anywhere. A `RUNTIME-BLOCKED` required probe keeps the verdict below `PASS`.
- emits machine-readable JSON + a human summary. Exit `0` only on `PASS`.

## Safe by default — no mutation

- Default mode issues only `GET` requests and `POST`s to the two **read/compute** RPCs (`get_customer_booking_context_v2_internal`, `quote_customer_booking_v2_internal`).
- It **never** calls `submit_booking_request_v2_internal` and **never** issues a table `INSERT/PUT/DELETE`.
- The submit EXECUTE grant is proven **offline** (`POS-GRANTS`) by reading committed H3B privilege evidence — not by invoking submit.
- `NEG-TBL-2` (write-authority) is a `PATCH` against a **guaranteed-nonexistent primary key** — non-mutating even if the role held `UPDATE`.
- Negative RPC probes use only non-mutating targets/methods. VOLATILE read-only RPCs use safe `POST` bodies so a `405` method response cannot masquerade as an isolation result. Dangerous `public.rls_auto_enable()` is never invoked; its denial comes from the fresh DB privilege snapshot.
- A mutating submit probe exists **only** behind `H3C_ALLOW_SUBMIT_PROBE=1` + `H3C_SUBMIT_DISPOSABLE_ACK=1` + disposable fixtures, and is **advisory** — it can never contribute to a `PASS`.

## Requirements

- Node ≥ 20 (tested on Node 24). Built-in `fetch` + `node:crypto` JWK import. **No npm install. No Docker.**

## Environment variables (operator-supplied; never persisted or logged by the harness)

### Required

| Var | Meaning |
|---|---|
| `H3C_SUPABASE_URL` | LAB project URL, e.g. `https://ykxlqnshaaxmzzocpjlj.supabase.co` |
| `H3C_ANON_KEY` | LAB anon / publishable API key (sent as `apikey`) |
| `H3C_H3B_EVIDENCE` | path to `H3B-POST-APPLY-RUNTIME-BOUNDARY-2026-09-08.md` — needed for `POS-GRANTS` (offline proof of the 3-function grant incl. submit) |

### Runtime token — provide **one** of

| Option | Vars |
|---|---|
| A (preferred) | `H3C_RUNTIME_JWT` — an already-obtained Auth access token for the allowlisted LAB service identity |
| B | `H3C_SERVICE_EMAIL` + `H3C_SERVICE_PASSWORD` — one `grant_type=password` call to LAB Auth. Credentials read from env only, never logged, never written. |

### Required for a full `PASS` (each missing one keeps the verdict `INCOMPLETE`)

| Var | Enables |
|---|---|
| `H3C_CONTROL_JWT` | `POS-CONTROL-1` — signed token for a **non-allowlisted** LAB Auth user, issued while the hook is enabled |
| `H3C_EXPIRED_JWT` | `NEG-EXP-1` — a previously-issued, now-expired runtime token |
| `H3C_FIX_SHOP_ID` | `POS-AUTHZ-2` (blank-line-user read probe) |
| `H3C_FIX_OTHER_SHOP_ID` | `POS-AUTHZ-1` — a real shop the fixture LINE user is **not** linked to |
| `H3C_FIX_OTHER_PET_IDS` (comma-sep) + `H3C_FIX_SHOP_ID`/`ROOM_ID`/`RATE_PLAN_ID` | `POS-AUTHZ-3` — another customer's pet ids |
| `H3C_PS01_TABLE_COL` | `NEG-TBL-2` — any real column name of `H3C_PS01_TABLE` for the non-mutating PATCH-nonexistent-PK write-authority probe |

### Optional (defaults are best-guess; override from the H3C-3 metadata refresh)

`H3C_FIX_LINE_USER_ID`, `H3C_FIX_ROOM_ID`, `H3C_FIX_RATE_PLAN_ID`, `H3C_FIX_PET_IDS`, `H3C_FIX_START_AT` (makes `POS-1/2` fixture-mode); `H3C_PS01_OTHER_RPC`, `H3C_PS01_TABLE`, `H3C_PS01_INTERNAL_OBJ`, `H3C_LOCAL_SERVICE_FN`, `H3C_MT01_TABLE`; `H3C_OUT` (write JSON evidence to this path); `H3C_EXPECTED_PROJECT_REF` (default `ykxlqnshaaxmzzocpjlj`); `H3C_MAX_TOKEN_LIFETIME_SEC` (default `300`).

### Mutating opt-in (advisory `POS-3` only — never needed for PASS)

`H3C_ALLOW_SUBMIT_PROBE=1` + `H3C_SUBMIT_DISPOSABLE_ACK=1` + disposable `H3C_FIX_SHOP_ID`/`ROOM_ID`/`RATE_PLAN_ID`. The operator MUST verify and clean up anything created.


Before running the harness, execute `h3c-privilege-snapshot.sql` through House SELECT-only authority and save the returned JSON object as the file referenced by `H3C_PRIVILEGE_SNAPSHOT`. The harness rejects snapshots older than 15 minutes or with a mismatched project/role.

## Run

```bash
# offline self-test — proves the gate logic (H-01), project-ref rule (H-05),
# 5xx classifier (H-04), and the no-mutation structure (H-02/H-03). No env, no network:
node tools/shared-runtime/h3c/h3c-proof-harness.mjs --selftest

# the live proof (operator, LAB only):
export H3C_SUPABASE_URL="https://ykxlqnshaaxmzzocpjlj.supabase.co"
export H3C_ANON_KEY="…"
export H3C_PRIVILEGE_SNAPSHOT="runtime/h3c-privilege-snapshot.json"
export H3C_RUNTIME_JWT="…"          # or H3C_SERVICE_EMAIL + H3C_SERVICE_PASSWORD
export H3C_CONTROL_JWT="…" H3C_EXPIRED_JWT="…"
export H3C_FIX_SHOP_ID="…" H3C_FIX_OTHER_SHOP_ID="…" H3C_PS01_TABLE_COL="…"
export H3C_OUT="docs/platform/shared-runtime/evidence/H3C7-PROOF-HARNESS-RESULT-$(date +%Y%m%dT%H%M%SZ).json"
node tools/shared-runtime/h3c/h3c-proof-harness.mjs
echo "exit: $?"   # 0 = PASS, 1 = FAIL / INCOMPLETE / ABORTED
```

PowerShell: set `$env:H3C_*` the same way; the script is identical.

## Output

- **JSON** (`H3C_OUT` or stdout): `verdict`, `mode` (`safe-read-only` / `MUTATING-SUBMIT-OPT-IN`), `tokenClaims` (safe projection only), `residualNarrowAuthorityUntil` (see below), a `gate` object (`missing`, `requiredNotPass`, `duplicates`, `unknownVerdicts`, `advisoryNonPass`), and `results[]` — each `{id, category, verdict, http, code, snippet}` (snippets capped at 280 chars).
- **Human summary** (stderr): one line per probe + the gate failures.

## `residualNarrowAuthorityUntil` (House review H-07)

The JSON records the runtime token's `exp` as an ISO timestamp. **An already-issued `ps01_line_runtime` JWT stays valid until that exact time even after the LAB service identity and its refresh tokens are deleted**, because PostgREST validates the JWT signature/expiry without checking current Auth-user existence. Teardown is not "proof authority fully gone" until that timestamp passes (or the token's rejection is otherwise demonstrated). The activation/rollback doc STEP 4 requires recording this value.

## Security properties

- Never prints a full token, key, password, or signing material. Logs at most `iss`, `role`, `exp`, `iat`, `kid`, 6-char `sub` prefix.
- Verifies signatures with the **public** JWKS only. Cannot and does not mint tokens.
- No mutation in default mode. No Docker, no npm dependency, no network egress except to `H3C_SUPABASE_URL`.

## After running

1. Commit the JSON evidence under `docs/platform/shared-runtime/evidence/`.
2. Run the cleanup **in the order in** `../../../docs/platform/shared-runtime/evidence/CLAUDE-H3C-HOSTED-AUTH-ACTIVATION-ROLLBACK-2026-09-08.md` **STEP 4** — record last JWT `exp`, invalidate the service identity first, then grant row, then hook, then SQL rollback, and do not declare authority gone before `residualNarrowAuthorityUntil`.
3. Re-run shared-runtime signatures + Security Advisor and compare to the H3C1 baseline.
