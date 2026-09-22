# T3-WU03R — CANONICAL PRODUCTION DISCRIMINATOR: BUNDLE PROOF AND READER INVENTORY

Task: `WSTERA-CONTROL-TRUTH-SYNC-001` · Workflow `WF-DEV-01 v1.3.0 / LONG_RUN`
Stage: **T3** · Work Units: `T3-WU03` (re-run under the Owner mechanism) + `T3-WU03R` lanes A–D
Date: 2026-09-22 (Asia/Bangkok) · Owner authority:
`OWNER-DECISION-LITERAL-NODE-ENV-T3-RESUME-2026-09-22.md`
Final revision proven: hub-web `f7e7447aa3812f8e822ef528e6975149288c452f`

---

## 1. Revision chain

| Revision | Content |
|---|---|
| `534e50b` | lane A — `server/control-plane/runtime-mode.ts` created: zero-import, literal-form predicate `isProductionRuntime()` |
| `2e49004` | lane B — 14 production guards across the four Control Truth routers migrated to the helper; `_core/env.js` import removed from each |
| `340d1a0` | lane C — **T3-WU03 closed**: command path gates inlined (no import) so the billing-action closure gate stays satisfied |
| `6a0c043` | `T3-WU04` — production runtime-mode regression tests, falsification-verified |
| `f7e7447` | lane D — agent-events production guard migrated; `_core/env.js` retained for the HMAC secret |

Remote parity `0/0` after every push. Draft PR #2 untouched.

---

## 2. Owner evidence requirement #1 — the literal form IS build-time replaced

Measured on the **final** revision with `npx wrangler deploy --dry-run` (no upload). The emitted
bundle contains:

```js
function isProductionRuntime() {
  return true;
}
__name(isProductionRuntime, "isProductionRuntime");
```

The literal `process.env.NODE_ENV === "production"` was replaced by the bundler and folded to a
constant. `isProductionRuntime` is called from the routers in the same bundle
(`isProductionRuntime()`, `isProductionRuntime()) return null;`).

## 3. Owner evidence requirement #2 — no runtime `NODE_ENV` binding is required

`grep -c 'process.env.NODE_ENV'` over the built worker: **0** relevant occurrences. The single
`NODE_ENV` string remaining in the bundle belongs to a third-party dependency's own `test`
environment check, not to any Control Truth path.

`grep -c '=== "production"'`: **1**, inside the third-party check. Our paths carry no runtime
comparison at all because they were resolved at build time. **No `NODE_ENV` Worker binding was
added, and the Owner decision requires none.**

## 4. Owner evidence requirement #3 — every named reader resolves through the same canonical decision

| Owner-named reader | File | Shape used | Revision |
|---|---|---|---|
| Owner Inbox truth paths | `owner-inbox-router.ts` | imports the helper | `2e49004` |
| Agent Activity truth paths | `agent-activity-router.ts` | imports the helper | `2e49004` |
| Portfolio Gates truth paths | `portfolio-gates-router.ts` | imports the helper | `2e49004` |
| Work Queue production truth guards | `work-queue-router.ts` | imports the helper | `2e49004` |
| agent-events production truth guard | `webhooks/agentEvents.ts` | imports the helper | `f7e7447` |
| simulation-only command success | `commands/command-service.ts`, `commands/demo-command-executor.ts` | **inlined** literal check | `340d1a0` |

`grep -rn "ENV.isProduction"` over `server/` **excluding tests returns nothing**, and over the whole
repository including tests it returns **0**. There is no remaining production-truth reader on the old
discriminator, so the Owner's no-competing-discriminators rule holds.

### Why one shape is an import and the other is inlined — and why that is not two discriminators

The billing-action import-closure gate (`control-plane.test.ts:175`, allowlist `:49-62`) scans the
closure seeded from `routers.ts` → `service.ts` → `command-service.ts`. The four routers and the
webhook entry are **outside** it and can import the helper. The command path is **inside** it, and the
gate rejects any closure member outside its allowlist — including a zero-import file, which was
measured:

```text
Unexpected billing-action import closure module(s): server/control-plane/runtime-mode.ts
1 failed | 47 passed (48)
```

So the command path writes the same literal expression in place instead. It is the **same literal
comparison and the same decision**; only the mechanism of reach differs, because one site is
import-constrained. The allowlist was **not** widened — the Owner required that.

The old getter remains in `_core/env.ts` with **no remaining caller**. It was left in place because
the Owner decision forbids broadening this into unrelated environment refactoring; the reviewer should
note it as a deliberate, documented leftover rather than an oversight.

## 5. Owner evidence requirement #4 — no reachable production demo/simulation success path through an inert discriminator

The gates are no longer inert **on the deployed Worker**: §2 shows the helper compiles to `return true`
in a production build, so `isProductionRuntime()` is true there regardless of any binding.

Behaviour proven by execution at the revision chain (probes retained outside the repo):

```text
production  → ownerInbox.list / agentActivity.list / agentActivity.summary / portfolioGates.list
              all mode "degraded" with 0 items; ownerInbox.get null; decide and acknowledge
              ok:false degraded; dispatchCommand refuses all three simulationOutcome values;
              RETRY_PAYMENT status FAILED with paymentsDelta 0 and the subscription still past_due
development → the simulation fallbacks and the simulated payment recovery behave exactly as
              before, which is what proves a gate rather than deleted fixtures
```

## 6. Owner evidence requirement #5 — the closure gate stays PASS without widening

`server/control-plane/control-plane.test.ts` → **48/48 PASS** at `340d1a0` and unchanged since. Zero
allowlist edits: `git log -p -- control-plane.test.ts` shows no change on this branch.

## 7. Owner evidence requirement #6 — deterministic gates

```text
npm run check   → exit 0
npx vitest run  → 27 files, 453 tests, exit 0     (430 pre-existing + 23 new from T3-WU04)
git diff --check → CLEAN
```

## 8. Owner evidence requirement #7 — development/test behaviour preserved

Every production assertion added by `T3-WU04` is paired with a non-production control asserting the
simulation/demo fallback still occurs. The development probe run in §5 shows the same at runtime.

## 9. Owner evidence requirement #8 — exact files and hashes bound to the revision

```text
server/control-plane/runtime-mode.ts                    2cc1ae871e33ab81b00429e95cfdb387aaf707174770da50b54d154bc6d622ad
server/control-plane/owner-inbox-router.ts              0cae1152682455ad2e9afa8d2dc6f5691a7cdccf872f8df6d482374f3a8a55a2
server/control-plane/agent-activity-router.ts           3b78f26002893ac484de513f8a480cf511b5efb08e382ac75df2fda5958b5366
server/control-plane/portfolio-gates-router.ts          c6c6e75cf6cb189109eba8156ce9961fe580895a3daeabe45df90999867f8297
server/control-plane/work-queue-router.ts               b1a383f825de58fad06e18ba68830bf2b6e243345fba2a4298c2aed82ac40414
server/control-plane/commands/command-service.ts        e0abef61d79a6f8b223a4d9681f490e7ded34a20a37cfc6d207d5eb43942d0bf
server/control-plane/commands/demo-command-executor.ts  7068c8e68e1c85ce725f7d8391620c380cd805bd5be5d33c2c7304762c017e96
server/control-plane/production-runtime-mode.test.ts    544641354789fe2803e1cceeb45d55768eaf9cd901f2ad0872fa9e6b0715a3c7
server/webhooks/agentEvents.ts                          accfb92fa1628a8b6b6aad31c9858e4255705a0df1b2970aba4eeff0725c436a
```

(The router and command-file hashes are those recorded at their respective commits; the tree is
unchanged for those paths since.)

## 10. Correction carried forward — my earlier finding was wrong

`FINDING-LITERAL-NODE-ENV-RESOLVES-BOTH-BLOCKERS-2026-09-22.md` claimed a zero-import helper is
closure-neutral and therefore dissolves the `T3-WU03` blocker by import alone. **That was falsified
during implementation** and corrected in place: the gate rejects any closure member outside its
allowlist, so the inlined shape is required there. Recorded as a correction section rather than a
silent edit.

## 11. Non-claims

- No live DB migration, no production deployment, no Cloudflare variable mutation, no PR merge.
- The bundle proof is a **local dry-run build** of the committed revision, not a deployed artefact.
  No code was executed inside the live Worker.
- `T3-WU03` and `T3-WU04` have **not** passed R2. This packet is not an independent review.
