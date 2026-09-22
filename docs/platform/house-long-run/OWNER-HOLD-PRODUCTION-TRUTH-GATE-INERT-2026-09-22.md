# OWNER HOLD — T3 production-truth gates are inert on the deployed Worker (`NODE_ENV` is not set)

Task: `WSTERA-CONTROL-TRUTH-SYNC-001` · Workflow `WF-DEV-01 v1.3.0 / LONG_RUN`
Held: 2026-09-22 (Asia/Bangkok) · Held by: Hermes (Long-Run Orchestrator / Coordinator / State Holder)
State: **`OWNER_HOLD_PRODUCTION_TRUTH_GATE_INERT`** — the run is stopped, not failed.

This is a **new blocker discovered while resuming T3 under the Owner-authorized split (Option 1)**.
It is a finding about the running production system, not a defect introduced by this run, and it
materially affects the acceptance criteria of the whole T3 stage. Hermes holds no authority to
change a production deployment configuration, so it is handed to the Owner.

---

## 1. What is already done and pushed in this resume

Planning repo `work/wstera-control-truth-sync-001`: HEAD `2f4f8c119c723b4a3e52716b6b71504a58c2e1d0`
(= the Owner authorization commit itself; remote parity `0/0`, clean).

hub-web `work/wstera-control-truth-sync-001`:

| Revision | Content |
|---|---|
| `458241cc4b5455172d1f44c43e125f6c647c844d` | **T3-WU02** — production truth modes for Owner Inbox, Agent Activity, Portfolio Gates and the client Control Plane (7 files, +212/−37) |

Parent `393af8eac1633f2bb68038a89ddd3bd3062710cf` (T3-WU01). Remote parity `0/0` verified.
Draft PR #2 remains `state=OPEN`, `isDraft=true`, `mergedAt=null` (read live from GitHub).

**T3-WU02 was executed as four bounded sub-units under Owner Option 1** (a re-expression of the
existing WU02 scope only — no scope added, no acceptance criterion removed):

| Sub-unit | Worker | Result |
|---|---|---|
| `T3-WU02A` owner-inbox-router truth modes | `swarm-builder` | substance correct; lane FAIL from a cross-unit type coupling |
| `T3-WU02B` agent-activity + portfolio-gates truth modes | `swarm-builder` | substance PASS; commander scope check was stale |
| `T3-WU02C` client Control Plane truth modes | `swarm-builder` | **`SWARM_WORK_UNIT_PASS`** |
| `T3-WU02D` verify-only at the final revision | `swarm-builder` | **`SWARM_WORK_UNIT_PASS`** |

Commander-side verification, independently reproduced after every worker stopped:

- `npm run check` (`tsc --noEmit`) → exit 0
- `npx vitest run` → 26 files, **430/430 PASS**
- `git diff --check` → CLEAN
- secret-scan over the 7 changed files → **0 findings**
- no `?? "simulation"` mode default remains anywhere in `client/src`

**Behavioural proof at runtime (not source reading only).** A probe was run against the real tRPC
router with no Control datastore configured:

```text
NODE_ENV=production   → ownerInbox.list / agentActivity.list / agentActivity.summary /
                        portfolioGates.list  = mode "degraded", 0 items
                        ownerInbox.get       = null
                        ownerInbox.decide    = { ok:false, mode:"degraded" }
                        ownerInbox.acknowledge = { ok:false, mode:"degraded" }
NODE_ENV=development  → the non-production simulation fallback still returns
```

The development run is the important control: it proves the change is a **real production gate**,
not deletion of the fixture set.

---

## 2. The blocker

**The deployed Worker has no `NODE_ENV`, so `ENV.isProduction` is false in production — which makes
every `ENV.isProduction` gate inert on the live system.**

### 2.1 Evidence (measured, not inferred)

Deployed version `5dc81232-c116-4722-a6c1-74c15ad50385` (100% traffic). Its binding list, read from
the Cloudflare API:

```text
AGENT_EVENTS_HMAC_SECRET    secret_text
ASSETS                      assets
DATABASE_URL                secret_text
OWNER_USER_ID               secret_text
SUPABASE_SERVICE_ROLE_KEY   secret_text
SUPABASE_STORAGE_BUCKET     secret_text
SUPABASE_URL                secret_text
WSTERA_CONTROL_SECRET_KEY   secret_text
WSTERA_CONTROL_SUPABASE_URL secret_text
```

`NODE_ENV` does not appear. `grep` over the whole version JSON for `NODE_ENV` returns **False**.

`wrangler.jsonc` declares **no `vars` block** at all — it has `"keep_vars": true` but nothing to
keep — and `git log -S 'NODE_ENV' -- wrangler.jsonc` shows it never contained one.

The discriminator itself:

```text
server/_core/env.ts:4   get isProduction() { return getRuntimeEnvString("NODE_ENV") === "production"; }
server/_core/runtime-env.ts:11-15
  getRuntimeEnvString(name) → runtimeBindings?.[name]  (a computed property)
                           ?? process.env[name] ?? ""
```

A `wrangler deploy` dry-run was performed (no upload) and the emitted bundle was inspected. Wrangler's
esbuild `define` replaces only the literal spellings `process.env.NODE_ENV` /
`global.process.env.NODE_ENV` / `globalThis.process.env.NODE_ENV`. Because
`getRuntimeEnvString` reads `process.env[name]` through a **variable** property name, no replacement
is applied — the call survives into the bundle unchanged. The only remaining `NODE_ENV` reference in
the built worker is React's own check.

Consequence: on the deployed Worker the lookup falls through to `runtimeBindings["NODE_ENV"]` and then
`process.env["NODE_ENV"]`, both absent, so `isProduction` evaluates `"" === "production"` → **false**.

### 2.2 Blast radius — every production truth guard in this repository depends on that one flag

`grep -rn "isProduction"` over `server/` (excluding tests) shows it is the **sole** production
discriminator on all of these paths:

| File | Guard | Effect on live production today |
|---|---|---|
| `server/control-plane/owner-inbox-router.ts` | 5 guards | demo items + fabricated `decided`/`acknowledged` success reachable |
| `server/control-plane/agent-activity-router.ts` | 4 guards | `simulation` / `demo_fallback` modes returned |
| `server/control-plane/portfolio-gates-router.ts` | 2 guards | `simulation` / `demo_fallback` modes returned |
| `server/control-plane/work-queue-router.ts` | 4 guards | **pre-existing** — "the model to preserve" in T1 §6.1 shares this flaw |
| `server/webhooks/agentEvents.ts:171` | 1 guard | the 503 fail-closed on a missing Control datastore never fires |
| `server/control-plane/service.ts` | (T3-WU01) | its non-live paths are reached via the repository resolver, not this flag |

This matters beyond this task: **the Work Queue "already strict in production" behaviour that T1
§7.4 declared to be the model to preserve is, on the live Worker, also inert.** That is a
pre-existing condition, not a regression introduced here, and it is not something this run may
silently redefine.

### 2.3 What this means for acceptance

The RUN-MANIFEST T3 acceptance criterion

```text
production import/runtime closure cannot select demo fixtures/repository/executor as live data
```

and the Brief §10 Production-truth criteria

```text
- Production runtime has no path that substitutes demo customers, billing, operations,
  Work Queue, Owner Inbox or Agent Activity as live state.
- No DB/data => EMPTY / NOT CONNECTED / DEGRADED
```

are **not satisfied on the deployed system today**, because the flag every guard tests is false
there. The source revision is correct and independently proven under `NODE_ENV=production`; the
**deployed configuration** cannot reach that state.

### 2.4 What is NOT proven

- No code was executed inside the live Worker. The conclusion is drawn from the deployed version's
  binding list plus inspection of the real dry-run bundle. A live-executed proof requires a
  deployment, which this brief forbids.
- It is not proven that no other mechanism sets `NODE_ENV` for the Worker (for example a dashboard
  variable not surfaced in the version JSON). The version binding list is the authoritative
  configuration for that version and it does not contain one.

---

## 3. Second blocker — `T3-WU03` is blocked by a legitimate, test-owned gate

`T3-WU03E` ("disable simulation-only command success in production") returned **BLOCKED from the
worker, correctly and without guessing**:

- The mandated production gate requires `import { ENV } from "../../_core/env.js"` in
  `command-service.ts` and `demo-command-executor.ts`.
- That import pulls `server/_core/env.ts` + `server/_core/runtime-env.ts` into the billing-action
  import closure, which the existing gate at `server/control-plane/control-plane.test.ts:175`
  rejects against its `BILLING_ACTION_SAFE_MODULES` allowlist (`:49-62`).
- That gate lives in a `*.test.ts` file, which the work-unit packet prohibited.

Reproduced independently by the commander:

```text
AssertionError: Unexpected billing-action import closure module(s):
  server/_core/env.ts, server/_core/runtime-env.ts
1 failed | 47 passed (48)
```

The worker's refusal is the correct fail-closed behaviour. Resolving it is a deliberate,
review-gated change to a security test (widen the allowlist, or reach the production discriminator
without pulling the env module into the closure) — not something to be decided unilaterally inside a
bounded work unit.

**Worktree state:** the partial `T3-WU03E` edit was preserved as a patch and the worktree was
returned to the committed revision, so nothing is left ambiguous:

```text
D:/AI-Workspace/runtime/hermes-native/workspace/wstera-cts-001/T3-WU03E-WIP-NOT-COMMITTED-2026-09-22.patch
sha256 784bc261d9650fa62dc71ec87a9bf5a57945ee51d577cb6de88d068c1a070747   (75 lines)
```

After reverting: worktree clean, HEAD `458241c`, `npx vitest run` **430/430 PASS**, `npm run check`
exit 0.

---

## 4. Options for the Owner

### Blocker 1 — the inert production gate

1. **Set `NODE_ENV=production` on the Worker and deploy** *(recommended)*. Smallest safe change:
   add a `"vars": { "NODE_ENV": "production" }` block to `wrangler.jsonc`, or set it as a Worker
   variable in the Cloudflare dashboard. `vars` are delivered as bindings, so
   `getRuntimeEnvString("NODE_ENV")` reads it and every existing guard activates at once — this
   fixes T3-WU02, T3-WU01, the pre-existing Work Queue guards and `agentEvents.ts` together.
   **This is a production mutation and is forbidden by the current brief**, so it needs your
   explicit authority and a named operator. It also wants the migration/deploy coupling warning from
   R1 to be respected if it ships together with migration `0009`.
2. **Re-scope `ENV.isProduction` to a discriminator that is already present in the Worker
   environment** (for example `WSTERA_CONTROL_SUPABASE_URL` presence, or an explicit
   `PLATFORM_ENV` binding). More invasive: it touches `_core/env.ts` and every guard, and it must be
   a revision-bound change with its own review.
3. **Accept the source-only claim for this run** and defer the live truth to T6, recording
   explicitly that T3 acceptance is proven at source/revision level only and is **not** proven on
   the deployed system. This keeps the run moving but leaves acceptance criterion §10 unmet.

### Blocker 2 — `T3-WU03`

4. Authorize widening the billing-action closure allowlist to admit `_core/env.ts` +
   `_core/runtime-env.ts` (a deliberate, review-gated test change), or authorize an alternate
   mechanism that reaches the production discriminator without extending the closure.

Recommended sequencing: **1 + 4 together**, then continue `T3-WU03 → WU04 → WU05 → T4 → T5 → R2`.
Under the CEO revenue deadline, option 1 is the one that actually converts the work already
committed into live truth, and it is a one-line configuration change.

---

## 5. Standing at this hold

- hub-web: HEAD `458241cc4b5455172d1f44c43e125f6c647c844d`, pushed, remote parity `0/0`, worktree clean.
- Planning: HEAD `2f4f8c1`, remote parity `0/0`, clean (this hold document is the next commit).
- **No database was contacted. No migration was applied. No deployment occurred. Draft PR #2 was not
  merged.** No `PRODUCTION_READY`, no `OPERATED_STABLE`, and no stage PASS asserted by Hermes on its
  own authority.
- T3 is **not** complete. R2 has not started. T4–T7 have not started. Mac parity remains
  `MAC_PARITY_UNVERIFIED`.
- Control Sync activity telemetry was emitted for the resume and for each T3-WU02 transition
  (all HTTP 200). Work Queue projection remains blocked by GAP-A exactly as recorded in the previous
  report; **no fake Product code was invented.**

**To resume:** answer with an option for each blocker (1/2/3 and 4) and T3 continues immediately.
