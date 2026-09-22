# T3-WU03E — BEHAVIOURAL PROOF (production gates close all three simulation holes)

Task: `WSTERA-CONTROL-TRUTH-SYNC-001` · Workflow `WF-DEV-01 v1.3.0 / LONG_RUN`
Stage: **T3** · Work Unit: **`T3-WU03`** (§8 of `RUN-MANIFEST-WSTERA-CONTROL-TRUTH-SYNC-001.md` — "disable
simulation-only command success in production; do not activate payment/billing mutation")
Date: 2026-09-22 (Asia/Bangkok)
Status: **change proven by execution · work unit BLOCKED by a test-owned gate · not committed**

> `T3-WU03E` is **not** committed. The worker returned `BLOCKED` honestly and the commander
> reproduced the block. This packet preserves the executed proof so the Owner decision has full
> evidence. See §4 for why the change cannot land unchanged.

---

## 1. The change (2 files, +28/−4, both inside the declared scope)

Applied from the preserved patch:

```text
D:/AI-Workspace/runtime/hermes-native/workspace/wstera-cts-001/T3-WU03E-WIP-NOT-COMMITTED-2026-09-22.patch
sha256 784bc261d9650fa62dc71ec87a9bf5a57945ee51d577cb6de88d068c1a070747  (75 lines)
git apply --check → PATCH APPLIES CLEAN
```

| File | Change |
|---|---|
| `server/control-plane/commands/command-service.ts` | `import { ENV }` + in `dispatchCommand`: refuse a caller-supplied `simulationOutcome` when `ENV.isProduction` |
| `server/control-plane/commands/demo-command-executor.ts` | `import { ENV }`; `outcomeOverride` forced to `undefined` when `ENV.isProduction`; `RETRY_PAYMENT` fails closed in production **before** any subscription/payment mutation |

The three holes the RUN-MANIFEST T3 / Brief §10 criteria name:

1. caller-injected `simulationOutcome: "success"` → fabricated terminal `SUCCEEDED`
2. the `simulationOutcome` failure/timeout injection seam on the executor path
3. `RETRY_PAYMENT` fabricating `SIMULATED payment recovery` (marks the subscription `active` and
   writes a payment row with `paymentMethod: "Credit Card (Simulated Recovery Re-charge)"`)

---

## 2. Executed proof — `NODE_ENV=production`

Real modules, real `ENV.isProduction`, in-memory demo repository, a tenant whose subscription is
genuinely `past_due` (`BK-00140`, tenant 5, product 1). Probe: `tmp/wu03e-probe.ts` in the worktree
(gitignored, removed after the run).

```json
{
  "NODE_ENV": "production",
  "context": { "subscriptonId": 5, "tenantId": 5, "tenantCode": "BK-00140", "productId": 1, "subscriptionStatus": "past_due" },
  "paymentsBefore": 1,
  "inject_success": { "threw": true, "message": "Simulation outcome injection is not available in production (actionType 'RETRY_SYNC')." },
  "inject_failure": { "threw": true, "message": "Simulation outcome injection is not available in production (actionType 'RETRY_SYNC')." },
  "inject_timeout": { "threw": true, "message": "Simulation outcome injection is not available in production (actionType 'RETRY_SYNC')." },
  "retryPayment": {
    "threw": false,
    "status": "FAILED",
    "result": { "outcome": "failed", "message": "Payment recovery is not available in production.", "affectedResources": [] },
    "paymentsAfter": 1,
    "paymentsDelta": 0,
    "subscriptionStatusAfter": "past_due"
  }
}
```

Reading of the proof:

- **Holes 1 and 2 are closed at the entry point.** All three outcome values are refused by
  `dispatchCommand`, so no fabricated terminal status can be produced on the production path.
- **Hole 3 is closed and side-effect-free.** `RETRY_PAYMENT` returns `outcome: "failed"`
  → terminal status `FAILED`. `paymentsDelta = 0` and `subscriptionStatusAfter = "past_due"` prove
  **no payment row was written and no subscription was mutated** — the acceptance criterion
  "no new real payment action" holds, and equally no *fake* payment action survives.

---

## 3. Control run — `NODE_ENV=development`

The same probe with the flag off, which is what makes §2 a real production gate rather than a
broken test setup:

```json
{
  "NODE_ENV": "development",
  "inject_success": { "threw": false, "status": "SUCCEEDED" },
  "inject_failure": { "threw": false, "status": "FAILED" },
  "inject_timeout": { "threw": false, "status": "TIMED_OUT" },
  "retryPayment": {
    "threw": false,
    "status": "SUCCEEDED",
    "result": { "outcome": "changed", "message": "SIMULATED payment recovery: ฿1,290 charge succeeded via Demo Payment Simulator.", "affectedResources": ["sub_5"] },
    "paymentsAfter": 2,
    "paymentsDelta": 1,
    "subscriptionStatusAfter": "active"
  }
}
```

The non-production behaviour — including the fabricated payment recovery — is **unchanged**, which is
what the existing test suite depends on. So the change is a production gate, not a deletion of the
non-production seam.

Raw outputs retained:

```text
D:/AI-Workspace/runtime/hermes-native/workspace/wstera-cts-001/T3-WU03E-PROBE-PRODUCTION-2026-09-22.json
  sha256 67adcddd93f38a4966aa43f439479626959ffa0b6f5ea23fa4ad6b445accb203
D:/AI-Workspace/runtime/hermes-native/workspace/wstera-cts-001/T3-WU03E-PROBE-NONPRODUCTION-2026-09-22.json
  sha256 5fbc7fa70c01d2b6cc493fd286b07d68c21325cfb9b68e11642f7371f604e162
```

Worker-side raw output recovered from the lane evidence (truncated there at the 8192-byte excerpt
bound; the full 13,965-byte transcript was not persisted to disk):

```text
D:/AI-Workspace/runtime/hermes-native/workspace/wstera-cts-001/T3-WU03E-WORKER-PROBE-OUTPUT-2026-09-22.txt
  sha256 b78cbe7d0a7674b1b7f4c94ca13d427b4832ab383685a24cd89e28da7cad50f8
```

---

## 4. Why it could not land — the test-owned gate

The mandated `import { ENV } from "../../_core/env.js"` pulls `server/_core/env.ts` +
`server/_core/runtime-env.ts` into the **billing-action import closure**, which the existing gate at
`server/control-plane/control-plane.test.ts:175` rejects against its `BILLING_ACTION_SAFE_MODULES`
allowlist (`:49-62`). Reproduced by the commander on the applied patch:

```text
AssertionError: Unexpected billing-action import closure module(s):
  server/_core/env.ts, server/_core/runtime-env.ts
→ FAIL  control-plane.test.ts > 1. Security & Permission Guards >
        proves the billing-action static closure has no reachable DB/provider path
Test Files  1 failed (1)      Tests  1 failed | 47 passed (48)
```

Full suite with the patch applied: **1 failed | 429 passed (430)**.
`npx tsc --noEmit` → exit 0. Typecheck is clean; **the only failure is the closure gate.**

That gate is a deliberate security control (it proves the billing-action path reaches no
DB/provider module) and it lives in a `*.test.ts` file, which the work-unit packet prohibited.
The worker's refusal to change a prohibited file to make its own work pass is **the correct
fail-closed behaviour** and is recorded as such.

**Resolving it is a deliberate, review-gated decision** — widen the allowlist to admit
`_core/env.ts` + `_core/runtime-env.ts`, or reach the production discriminator without extending the
closure. It is raised to the Owner as option 4 in
`OWNER-HOLD-PRODUCTION-TRUTH-GATE-INERT-2026-09-22.md`, together with the finding that the
discriminator itself may be inert on the deployed Worker.

**Consequence of that second finding for this work unit:** even if the closure gate were widened and
this change committed, on the deployed Worker `ENV.isProduction` is currently false (§2 of the hold
document), so these gates would be inert in production exactly like the others. The two blockers are
therefore coupled and are best resolved together.

---

## 5. Worktree state

The applied patch was reverted after the proof was captured, returning the worktree to the committed
revision:

```text
HEAD 458241cc4b5455172d1f44c43e125f6c647c844d   (unchanged, no new commit)
git status --porcelain → clean
npx vitest run → 26 files, 430/430 PASS
npm run check  → exit 0
```

The change itself remains preserved and re-appliable from the patch, so **no work was lost**.

---

## 6. Non-claims

- `T3-WU03` is **not complete and not committed**. It has no lane `SWARM_WORK_UNIT_PASS`.
- The probe runs in-process against real modules with a real `NODE_ENV`; it is **not** a live
  deployment test. Nothing was deployed.
- No database was contacted. No migration was applied. No real payment provider was contacted at any
  point — the "payment" in both runs is an in-memory demo repository row.
- This packet is not an independent review.
