# FINDING — a mechanism exists that resolves BOTH T3 blockers without touching a production variable

Task: `WSTERA-CONTROL-TRUTH-SYNC-001` · Workflow `WF-DEV-01 v1.3.0 / LONG_RUN`
Stage: **T3** · Date: 2026-09-22 (Asia/Bangkok) · By: Hermes
Adds a concrete resolution path to `OWNER-HOLD-PRODUCTION-TRUTH-GATE-INERT-2026-09-22.md`
Measured at: hub-web `87903fecc9d8ee1932ca32bc8ae9f65edffd6ea4`

---

## 1. What was measured

Wrangler's esbuild pass statically replaces the **literal** `process.env.NODE_ENV` at build time.
It cannot replace the **computed** read `process.env[name]` that `getRuntimeEnvString` uses — which
is the whole reason `ENV.isProduction` is false on the deployed Worker.

A two-line probe module was added to the worktree, imported from `server/worker.ts`, and the Worker
was built with `npx wrangler deploy --dry-run` (no upload). Compiled output in the emitted bundle:

```js
// the LITERAL form
function commandPathProductionGate() {
  return true;                     // ← process.env.NODE_ENV === "production" replaced at BUILD time
}

// the COMPUTED form (what server/_core/env.ts does today)
function commandPathComputedGate(name) {
  return process.env[name] === "production";   // ← survives verbatim, read at RUNTIME
}
```

`grep -c 'process.env.NODE_ENV'` over the built bundle: **0** — every literal occurrence was
replaced. No `NODE_ENV` Worker binding is required for the literal form to work.

The probe module and the `worker.ts` edit were **reverted before any commit**. Verified afterwards:
`git status --porcelain` empty, HEAD still `87903fe`, `npm run check` exit 0, `npx vitest run`
exit 0 (430/430).

## 2. Why this matters — it collapses both blockers

### Blocker 1 (inert production gate) gets a mechanism that needs no deployment variable

A module that reads the literal `process.env.NODE_ENV` gets the correct value on the deployed Worker
with **no `NODE_ENV` binding and no production configuration change**. This is a strictly better
shape than the hold document's option 2 ("return degraded unconditionally"), because it keeps a real
production/non-production distinction instead of discarding it.

### Blocker 2 (`T3-WU03` blocked by the billing-action import closure) is dissolved by the same trick

The reason `T3-WU03E` could not land is that `import { ENV } from "../../_core/env.js"` pulls
`server/_core/env.ts` + `server/_core/runtime-env.ts` into the billing-action import closure, which
the gate at `control-plane.test.ts:175` rejects against its allowlist (`:49-62`).

A module that reads the literal `process.env.NODE_ENV` directly:

- imports **nothing** — it is already a dependency-free file, so the closure is **unchanged**;
- reads `process.env` as a global with a **literal** member access, which esbuild replaces at build
  time (proven above);
- therefore satisfies the closure gate **and** gives correct production behaviour.

Concretely, one small dependency-free helper in `server/control-plane/` (for example
`isProductionRuntime(): boolean { return process.env.NODE_ENV === "production"; }`) could replace the
`ENV.isProduction` reads in the three truth routers and in the command path. Existing tests that
drive `process.env.NODE_ENV` directly (`agentEvents.test.ts:64,110,112`) already prove that form is
testable per case.

## 3. Scope and authority — what this does NOT authorize

### 3.0 ⚠️ CORRECTION (2026-09-22, after implementation) — the helper is NOT closure-neutral

This document originally claimed that because the helper imports nothing, it does not extend the
billing-action import closure, and therefore dissolves Blocker 2. **That claim was wrong**, and it was
falsified by execution during implementation:

```text
AssertionError: Unexpected billing-action import closure module(s):
  server/control-plane/runtime-mode.ts
1 failed | 47 passed (48)
```

The gate flags **any** closure member that is not in its allowlist. A zero-import helper is still a
member, so admitting it would require widening the allowlist, which the Owner decision forbids. The
correct shape inside that closure is an **inlined** literal check with **no import at all**.

Corrected scope of the mechanism:

| Path | Inside the closure gate? | Correct shape | Outcome |
|---|---|---|---|
| the four Control Truth routers | **no** — the closure is seeded from `routers.ts` → `service.ts` → `command-service.ts`, so the routers are never scanned | import the canonical helper | migrated at `2e49004`; gate unaffected |
| the command path (`command-service.ts`, `demo-command-executor.ts`) | **yes** | inline the literal check, import nothing | landed at `340d1a0`; closure gate PASS 48/48 |

So the mechanism still resolves both blockers, but **not by a single shared import in every place** —
the routers share the helper, while the gated command path inlines the same literal form. Two
discriminators are still avoided because it is the same literal expression and the same decision in
both shapes; what differs is only whether it is reached through a module or written in place.

The rest of this section stands.

This finding is a **mechanism**, not a permission.

- Changing `ENV.isProduction`, or introducing a competing production discriminator, is a
  **revision-bound source change across several files** and needs its own review. It must not be
  slipped into a builder sub-unit.
- It introduces a second way to answer "is this production?", which is a **coupling/consistency
  risk** the Owner should rule on deliberately: after such a change there would be two
  discriminators, one literal-based and one computed, and they could disagree. A reviewer will ask
  for that to be resolved explicitly (either migrate all readers, or collapse them into one).
- It does **not** retroactively make `T3-WU03E` complete; that unit still has to be re-run against
  the chosen mechanism and independently reviewed.
- It does not change the finding in `CORRECTION-BLAST-RADIUS-NODE-ENV-2026-09-22.md`: the reachable
  exposure today is the datastore-error branch, and that remains true until a fix lands.

## 4. Recommended Owner decision, revised

The cheapest path that closes the reachable exposure, needs no production variable, and unblocks
`T3-WU03` is now:

1. Authorize a small, dependency-free production-discriminator helper using the **literal**
   `process.env.NODE_ENV` form, plus a reviewable migration of the existing `ENV.isProduction`
   readers to it.
2. Keep the Worker's `NODE_ENV` binding question separate — with this mechanism it becomes
   **optional** rather than required, because the literal form is resolved at build time. (Setting it
   anyway would also fix the computed form, and would be belt-and-braces if the Owner prefers the
   deployed configuration to be explicit.)
3. Re-run `T3-WU03` against the chosen mechanism, then continue
   `T3-WU04 → WU05 → T4 → T5 → R2`.

## 5. Non-claims

- The compiled evidence proves replacement **inside the client-visible function body**. The probe
  functions were retained (assigned, not eliminated) by the minifier, and their bodies are
  verbatim in the bundle as shown. No live Worker was executed.
- No claim is made that this mechanism has been implemented, tested, reviewed, or is in any revision.
  It is a measured capability plus a proposed direction.
- This is not an independent review.
