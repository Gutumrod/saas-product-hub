# T5-WU05 / WU06 — CONTROLLED PRODUCTION APPLY, DEPLOY, LIVE PROOF — OUTCOME RECORD

Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001` · Stage **T5** · Work Units **T5-WU05 + T5-WU06**
Recorded: 2026-09-20 (Asia/Bangkok) · Orchestrator/operator: Hermes

Authority: B5 R7 = `BATCH_APPROVED` for a **code-only deploy** under exact conditions, with capability
activation required to be sequenced. This record states what was actually executed and measured.

---

## 1. Preconditions re-verified immediately before mutation (B5 R7 conditions)

| Condition | Result | Evidence |
|---|---|---|
| Exact candidate SHA | PASS | `679ff279e5ff2a9a3006bea79ccc6ccde90715ec` |
| Clean worktree | PASS | `git status --porcelain` empty |
| Upstream parity | PASS | `@{u}` = same SHA |
| Rollback target captured | PASS | `9db4fb70-a5e5-4989-94b5-1d271ab10055` (via `wrangler deployments status`) |
| Both new configuration sets ABSENT | PASS | `wrangler secret list` — 8 secrets, **no** `PRODUCT_EVENT_SIGNERS`, **no** `BILLING_CORE_CONTROL_READ*` (names only; no value read or printed) |
| Build-env delivery | PASS | `check:build-env`: `VITE_SUPABASE_URL` present, `VITE_SUPABASE_ANON_KEY` present |
| No R15 / activation / migration / DB mutation in this lane | HONOURED | see §5 |

## 2. Build and deploy (executed)

```
npx tsc --noEmit          -> exit 0
npx vitest run            -> 25 files, 366 tests, all passing
npm run build             -> BUILD_RC=0  (check:build-env ran first and passed)
npm run cf:deploy         -> DEPLOY_RC=0
```

| Artifact identity | Value |
|---|---|
| Deployed version ID | `00bdb1b5-70d2-4e41-b97d-f1f238e9bf31` |
| Deployed at | 2026-09-20T11:34:10.899Z |
| Routes | `wstera.com`, `platform.wstera.com` (existing targets) |
| Superseded (rollback) version | `9db4fb70-a5e5-4989-94b5-1d271ab10055` — verified still rollback-addressable |
| Configuration at deploy time | **both capability sets absent** → new capabilities inert |

## 3. Zone-level HTTP→HTTPS enforcement (approved operator-contract step 1)

Zone `wstera.com` (`a94702438f99a15c357425999ecdeed5`), existing target, reversible:

```
GET always_use_https  -> 'off'      PATCH {"value":"on"}  -> success=True   VERIFY -> 'on'
GET min_tls_version   -> '1.0'      PATCH {"value":"1.2"} -> success=True   VERIFY -> '1.2'
```

Rollback (documented, not executed): same PATCHes with `{"value":"off"}` and `{"value":"1.0"}`.

## 4. WU06 live proof — 16/16 PASS (measured after deploy + zone change)

```
apex over HTTPS returns 200                                 PASS  200
platform over HTTPS returns 200                             PASS  200
http apex redirects to HTTPS                                PASS  301 -> https://wstera.com/
http platform redirects to HTTPS                            PASS  301
HSTS present (apex)                                         PASS  max-age=63072000; includeSubDomains
X-Content-Type-Options nosniff (apex)                       PASS
X-Frame-Options present (apex)                              PASS
CSP present (apex)                                          PASS
HSTS / XCTO / XFO / CSP (platform)                          PASS  (4 checks)
platform health endpoint 200                                PASS  200
unsigned product-event webhook rejected by the application   PASS  401 {"error":"invalid signature"}
unsigned agent-event webhook rejected by the application     PASS  401 {"error":"invalid signature"}
billing read route does not 500 (fails closed)              PASS  403
TOTAL 16  PASS 16  FAIL 0
```

Pre-deploy baseline for comparison: **6 PASS / 10 FAIL** — the 10 failures were exactly the two gaps
closed here (no HTTP→HTTPS redirect; no security headers).

### 4.1 Evidence correction made during WU06 (important)

The first WU06 run recorded the webhook probes as PASS on HTTP **403** with body `error code: 1010`.
That is a **Cloudflare edge block, not the application** — the request never reached the Worker, so it
was not evidence of application fail-closed behaviour.

Re-probed with several User-Agents:

| User-Agent | Result |
|---|---|
| Python urllib (script default) | 403 `error code: 1010` — edge block |
| `curl/8.0`, browser UA, `Stripe/1.0`, custom | **401 `{"error":"invalid signature"}` — reaches the Worker** |

The probe was corrected to use a realistic UA **and** to fail if the body is an edge `1010` block, so the
check now asserts the **application's** rejection. This is recorded rather than quietly fixed because the
first version would have credited an edge block as application evidence.

### 4.2 Live surfaces beyond the smoke script (measured, unauthenticated)

| Surface | Observed |
|---|---|
| `/` | 200 |
| `/health` | 200 |
| `/api/trpc/controlPlane.workQueue.get` | 403 |
| `/api/trpc/controlPlane.ownerInbox.get` | 403 |
| `/api/trpc/auth.me` | 200 |
| `/api/trpc/controlPlane.summary.get`, `.agentActivity.get`, `/api/trpc/profile.get` | 404 (route names differ from those probed) |

Owner **authenticated** surfaces (login, Work Queue / Owner Inbox / Agent Activity contents) were **not**
exercised — that requires Owner credentials and a human/browser check. Recorded as untested, not as PASS.

## 5. Steps NOT executed, and why

### 5.1 R15 apply — NOT EXECUTED (blocked on provisioning authority, not on technique)

The R15 package (`T1-R15-DEPLOY-ROLLBACK-PLAN.md`) is an **evidence-preparation artifact** that states
explicitly it is "not an execution plan authorization". Its deploy gate is P1–P10, and it records that
the following are **not** carried by it and require the provisioning/deploy authority:

| Item | Status in the plan |
|---|---|
| P3 owner-credential retention confirmation | required from the provisioning authority |
| P4 R15 ordering-constraint disposition | "AUTHORITY DECISION — not taken here" (U4) |
| U3 exact Worker-secret-setting command form | "UNKNOWN — deploy authority must supply; do not invent" |
| U5 rollback-viability window length | "OWNER/PROVISIONING DECISION — not taken here" |
| Creation of the `hub_web_app` role and its credential | provisioning authority |

Per B5 R7 the R15 apply is "separately authorized controlled operation". **That authorization has not
been given, and the plan forbids inventing the missing command/decision inputs.** R15 therefore remains
**PREPARED, NOT APPLIED**.

### 5.2 Capability activation — NOT EXECUTED (no material present)

Activating `PRODUCT_EVENT_SIGNERS` requires per-product signer secrets, and activating Billing Core read
requires the `BILLING_CORE_CONTROL_READ_*` credentials. **No such material exists in this environment**
(searched by NAME only — no value was read or printed). Activation also requires the sequenced
verification programme B5 specified. Not attempted; not improvised.

## 6. Production state claims (limited to measured evidence)

| Claim | Status |
|---|---|
| `BUILD_PASS` | **YES** — `tsc` exit 0; 25 files / 366 tests; `npm run build` exit 0 |
| `LIVE_PROVEN` (for the code-only deploy) | **YES, within the scope measured in §4** — HTTPS reachability, HTTP→HTTPS redirect, security headers, health, application-level webhook rejection, billing route failing closed |
| `PRODUCTION_READY` | **NO** — B5 ruled it cannot be claimed while Control request correlation is design-only, and the R15 apply and capability activation are not performed |
| `OPERATED_STABLE` | **NO** — no stability window/sample evidence exists |

## 7. Remaining House blockers (for B5 closure / T6)

1. **R15 apply** — needs provisioning authority: P3 retention confirmation, P4 ordering disposition,
   U3 secret-setting command form, U5 rollback window, and role/credential creation. *(Owner/provisioning)*
2. **Capability activation** — needs the signer and Billing Core read credentials, then the sequenced
   verification programme. *(Owner-supplied material)*
3. **Control request correlation** — design-only; blocks `PRODUCTION_READY`. *(implementation work)*
4. **Owner-authenticated surface verification** — login, Work Queue, Owner Inbox, Agent Activity
   contents. *(Owner/human verification)*
5. **Scanner evidence for activation** — B5 requires a rerun scoped to changed source files before any
   zero-finding claim is used as activation evidence.
6. **PR/default-branch disposition** — closure branch is 42 commits ahead of `main`; draft PR #1 still
   targets `feature/platform-control-plane`. *(T6-WU01)*

## 8. Rollback state (prepared, not triggered)

Rollback is available and was deliberately kept available:

- Worker: `npx wrangler rollback 9db4fb70-a5e5-4989-94b5-1d271ab10055`, or redeploy that version.
- Zone: reverse PATCHes → `always_use_https: off`, `min_tls_version: 1.0`.
- Capabilities: nothing to undo — both sets were never delivered.
- Not triggered, because every check in §4 passed.

---

**Operator declaration:** every command in §2–§3 was actually executed and every figure above was
measured in this run. Nothing in §5 was executed. No secret value was read, printed, or committed.
