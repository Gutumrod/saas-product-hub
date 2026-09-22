# CARRY-FORWARD TO T3-WU04 — the production truth gates have no committing regression test

Task: `WSTERA-CONTROL-TRUTH-SYNC-001` · Workflow `WF-DEV-01 v1.3.0 / LONG_RUN`
Stage: **T3** · Target Work Unit: **`T3-WU04`** ("production dependency-closure and runtime-mode tests")
Raised during: T3-WU02 verification · Date: 2026-09-22 (Asia/Bangkok) · By: Hermes
Revision measured: hub-web `87903fecc9d8ee1932ca32bc8ae9f65edffd6ea4`

---

## 1. Finding

The production truth-mode gates added in `T3-WU02` — and the pre-existing `isProduction` gates in
`work-queue-router.ts` — are **not protected by any committed test**. The behavioural proof that
justifies T3-WU02 exists only as commander-run probes held outside the repository, so a future
refactor could silently destroy the gating and the suite would stay green.

## 2. Evidence — an empirical falsification test

The gates were individually disabled in the worktree and the full suite was run. If any committed
test covered the gate, the suite would fail.

| File | Mutation applied | `npx vitest run` result |
|---|---|---|
| `server/control-plane/agent-activity-router.ts` | `if (ENV.isProduction) {` → `if (false) {` | **exit 0 — 430/430 still PASS** |
| `server/control-plane/owner-inbox-router.ts` | same substitution (both forms, incl. `if (ENV.isProduction) return null;`) | **exit 0 — 430/430 still PASS** |
| `server/control-plane/portfolio-gates-router.ts` | same substitution | **exit 0 — 430/430 still PASS** |

All three worktree mutations were reverted immediately; `git status --porcelain` is clean and HEAD is
unchanged at `87903fe`. **No mutant survived into a commit.**

Corroborating greps at the same revision:

```text
grep -rn 'NODE_ENV *= *"production"' --include=*.test.ts server
  → only server/webhooks/agentEvents.test.ts:110,112      (the agent-events 503 path)

grep -rn 'ownerInbox|agentActivity|portfolioGates' --include=*.test.ts server
  → only server/control-plane/wstera-rbac.test.ts         (RBAC / access-tier assertions)

grep -n 'mode' server/control-plane/wstera-rbac.test.ts | head
  → :47 :52 :57 :62  expect(result.mode).toBe("simulation")   (workQueue in NON-production)
```

So the only test that ever sets `NODE_ENV=production` covers the agent-events webhook, and the three
truth routers are exercised only for their access tiers under non-production defaults. **Not one
committed test asserts that a production read returns `degraded` rather than a demo payload.**

## 3. Why this belongs to T3-WU04 and not to WU02

`RUN-MANIFEST` §8 declares `T3-WU04` as `swarm-tester`: *"production dependency-closure and
runtime-mode tests."* That is exactly this gap. Adding these tests was deliberately **not** folded
into the builder sub-units, because doing so would have widened their packets beyond
single-objective scope and because the manifest assigns the testing work to a separate unit with a
different worker capability.

## 4. Exact target for T3-WU04

A production runtime-mode test suite that fails if any of the following regresses:

1. `owner-inbox-router.ts` `list` with `NODE_ENV=production` and no Control datastore returns
   `{ items: [], pendingCount: 0, mode: "degraded" }` — **not** `DEMO_INBOX_ITEMS` and not
   `simulation`.
2. `owner-inbox-router.ts` `list` with `NODE_ENV=production` and a datastore error returns empty +
   `degraded` — **not** the demo fixture set with `demo_fallback`.
3. `owner-inbox-router.ts` `decide` / `acknowledge` in production return `ok:false` — **never** a
   fabricated `status:"decided"`/`"acknowledged"`.
4. `owner-inbox-router.ts` `get` in production returns `null` for a demo fixture id.
5. `agent-activity-router.ts` `list` and `summary` production no-DB and error paths return
   `degraded`.
6. `portfolio-gates-router.ts` `list` production no-DB and error paths return `degraded`.
7. `work-queue-router.ts` `list` production no-DB returns `degraded` (the pre-existing guard, which
   T1 §6.1 named as the model to preserve).
8. The non-production branch still returns the simulation fallbacks, so the tests prove a **gate**
   rather than fixture deletion.
9. The client default: no `?? "simulation"` mode fallback exists in `client/src`.

`NODE_ENV` can be driven per test with `process.env.NODE_ENV = "production"` plus
`clearRuntimeBindings()` in cleanup, following the pattern already proven at
`server/webhooks/agentEvents.test.ts:64,110,112`.

**Test-quality warning.** Because the current suite passes with every guard disabled, a new test must
be validated by the same falsification method before it is accepted: disable the gate, confirm the new
test **fails**, re-enable, confirm it passes. A test that passes in both states proves nothing. This is
the acceptance check for WU04, not an optional nicety.

## 5. Non-claims

- This is a **test-coverage gap, not a product defect.** The gates do work when `isProduction` is
  true, as demonstrated by execution in `T3-WU02-EVIDENCE-PACKET-2026-09-22.md` §5 and
  `T3-WU03E-BEHAVIOURAL-PROOF-2026-09-22.md`.
- It is **coupled to the deployed-Worker blocker**: on the deployed Worker `isProduction` is false,
  so these gates are inert there regardless of test coverage. Fixing coverage does not fix that; see
  `OWNER-HOLD-PRODUCTION-TRUTH-GATE-INERT-2026-09-22.md` and
  `CORRECTION-BLAST-RADIUS-NODE-ENV-2026-09-22.md`.
- The three mutations described in §2 were test-harness experiments on a working copy, reverted
  before any commit. No mutant is present in any revision.
