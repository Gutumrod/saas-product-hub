# H3C Auth-Issued Runtime Token Proof Harness

**Status:** PREPARE-ONLY. Committed by Claude on `review/claude-h3c-proof-20260908`. **Not yet run** against WSTERA LAB. Run by the WSTERA House operator / Secretary GPT after H3C-3/4/5 provisioning.

## What it is

A single self-contained Node script that proves the H3C data-plane boundary:

- decodes and **cryptographically verifies** an Auth-issued access token against the LAB JWKS (ES256, public key only — no signing material);
- checks `iss`, `role=ps01_line_runtime`, project ref, and that `exp − iat ≤ 300s` **measured from the JWT** (never from the OAuth `expires_in`, which GoTrue does not cap — see `../../../docs/platform/shared-runtime/evidence/CLAUDE-H3C-INDEPENDENT-REVIEW-2026-09-08.md` WP-A A4);
- runs the positive + negative matrix from `../../../docs/platform/shared-runtime/evidence/CLAUDE-H3C-NEGATIVE-MATRIX-2026-09-08.md`;
- emits machine-readable JSON + a human summary;
- **fails closed**: missing prerequisite, any `FAIL`, or a security-relevant `RUNTIME-BLOCKED` → exit code 1.

It performs **no mutation**. Every probe is a read-shaped RPC/REST call whose *denial* is the evidence. `POS-3` (submit booking) stays boundary-only by default and does not create a booking.

## Requirements

- Node ≥ 20 (tested on Node 24). Built-in `fetch` + `node:crypto` JWK import. **No npm install. No Docker.**

## Environment variables (operator-supplied, never persisted by the harness)

### Required

| Var | Meaning |
|---|---|
| `H3C_SUPABASE_URL` | LAB project URL, e.g. `https://ykxlqnshaaxmzzocpjlj.supabase.co` |
| `H3C_ANON_KEY` | LAB anon / publishable API key (sent as `apikey`, exactly as `lib/ps01-runtime.ts` does) |

### Runtime token — provide **one** of

| Option | Vars |
|---|---|
| A (preferred) | `H3C_RUNTIME_JWT` — an already-obtained Auth access token for the allowlisted LAB service identity |
| B | `H3C_SERVICE_EMAIL` + `H3C_SERVICE_PASSWORD` — the harness does one `grant_type=password` call to LAB Auth to obtain the token. Credentials are read from env only, never logged, never written. |

### Optional — makes more of the matrix executable

| Var | Purpose |
|---|---|
| `H3C_CONTROL_JWT` | token for a **non-allowlisted** LAB Auth user, issued while the hook is enabled → proves `POS-CONTROL-1` (hook is a no-op for ordinary users) |
| `H3C_EXPIRED_JWT` | a previously-issued, now-expired runtime token → `NEG-EXP-1` |
| `H3C_FIX_SHOP_ID`, `H3C_FIX_LINE_USER_ID`, `H3C_FIX_ROOM_ID`, `H3C_FIX_RATE_PLAN_ID`, `H3C_FIX_PET_IDS` (comma-sep), `H3C_FIX_START_AT` (ISO) | read-only fixtures so `POS-1..3` exercise real inputs instead of boundary-only |
| `H3C_FIX_OTHER_SHOP_ID` | a real shop the fixture LINE user is **not** linked to → `POS-AUTHZ-1` (cross-shop rejection, TM-11) |
| `H3C_FIX_OTHER_PET_IDS` (comma-sep) | another customer's pet ids → `POS-AUTHZ-3` |
| `H3C_PS01_OTHER_RPC`, `H3C_PS01_TABLE`, `H3C_PS01_INTERNAL_OBJ`, `H3C_LOCAL_SERVICE_FN`, `H3C_MT01_TABLE` | real object names from live metadata for the negative probes (defaults are best-guess; override from the H3C-3 metadata refresh) |
| `H3C_OUT` | write JSON evidence to this path instead of stdout |
| `H3C_EXPECTED_PROJECT_REF` | default `ykxlqnshaaxmzzocpjlj` |
| `H3C_MAX_TOKEN_LIFETIME_SEC` | default `300` |

## Run

```bash
# offline self-test of the crypto + classifier logic (no env, no network):
node tools/shared-runtime/h3c/h3c-proof-harness.mjs --selftest

# the live proof (operator, against LAB only):
export H3C_SUPABASE_URL="https://ykxlqnshaaxmzzocpjlj.supabase.co"
export H3C_ANON_KEY="…"                 # LAB anon key
export H3C_RUNTIME_JWT="…"              # or H3C_SERVICE_EMAIL + H3C_SERVICE_PASSWORD
export H3C_OUT="docs/platform/shared-runtime/evidence/H3C7-PROOF-HARNESS-RESULT-$(date +%Y%m%dT%H%M%SZ).json"
node tools/shared-runtime/h3c/h3c-proof-harness.mjs
echo "exit: $?"   # 0 = PASS, 1 = FAIL / INCOMPLETE / ABORTED
```

PowerShell:

```powershell
$env:H3C_SUPABASE_URL = "https://ykxlqnshaaxmzzocpjlj.supabase.co"
$env:H3C_ANON_KEY     = "…"
$env:H3C_RUNTIME_JWT  = "…"
$env:H3C_OUT = "docs/platform/shared-runtime/evidence/H3C7-PROOF-HARNESS-RESULT-$(Get-Date -Format yyyyMMddTHHmmssZ).json"
node tools/shared-runtime/h3c/h3c-proof-harness.mjs
"exit: $LASTEXITCODE"
```

## Output

- **JSON** (`H3C_OUT` or stdout): `verdict` (`PASS` / `FAIL` / `INCOMPLETE…` / `ABORTED`), `tokenClaims` (safe projection only), and a `results[]` array — each `{ id, category, verdict, http, code, snippet }`. Body snippets are capped at 300 chars.
- **Human summary** (stderr): one line per probe.
- `verdict: "PASS"` requires: every `TOK-*` PASS, `POS-1..3` reached the boundary, and **every** `NEG-*` PASS (failed closed). `POS-AUTHZ-*` and `POS-CONTROL-1` that are `RUNTIME-BLOCKED` downgrade the verdict to `INCOMPLETE` — House must either supply the fixtures or record separate PS01-owned evidence for those (TM-11 is a gate item).

## Security properties

- Never prints a full token, key, password, or signing material. Logs at most `iss`, `role`, `exp`, `iat`, `kid`, and a 6-char `sub` prefix.
- Verifies signatures with the **public** JWKS only. It cannot and does not mint tokens.
- Reads credentials from env at runtime and never writes them anywhere.
- No mutation, no Docker, no external dependency, no network egress except to `H3C_SUPABASE_URL`.

## After running

1. Commit the JSON evidence under `docs/platform/shared-runtime/evidence/`.
2. Run the **cleanup in the order given in** `../../../docs/platform/shared-runtime/evidence/CLAUDE-H3C-HOSTED-AUTH-ACTIVATION-ROLLBACK-2026-09-08.md` **STEP 4** — service identity first, then grant row, then hook, then SQL rollback.
3. Re-run shared-runtime signatures + Security Advisor and compare to the H3C1 baseline.
