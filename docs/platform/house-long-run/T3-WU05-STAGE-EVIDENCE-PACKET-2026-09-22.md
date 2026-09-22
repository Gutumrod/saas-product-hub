# T3-WU05 — T3 STAGE EVIDENCE PACKET (revision-bound)

Task: `WSTERA-CONTROL-TRUTH-SYNC-001` · Workflow `WF-DEV-01 v1.3.0 / LONG_RUN`
Stage: **T3** — "Remove production mock/demo runtime paths" (`RUN-MANIFEST` §8)
Prepared: 2026-09-22 (Asia/Bangkok) · By: Hermes (Long-Run Orchestrator / State Holder)
Execution engine: `hermes-native-swarm v0.1.1` · `relay_path_used: false` on every lane

---

## 1. Stage revision map

### hub-web — branch `work/wstera-control-truth-sync-001`

| Revision | Work unit | Content |
|---|---|---|
| `393af8e` | T3-WU01 | remove production demo substitution from the Control plane service |
| `458241c` | T3-WU02 | Owner Inbox / Agent Activity / Portfolio Gates server truth modes |
| `87903fe` | T3-WU02 sub-unit E | Overview/Customers/Billing/Operations tabs stop asserting simulation |
| `534e50b` | T3-WU03R lane A | canonical zero-import literal-form discriminator module |
| `2e49004` | T3-WU03R lane B | 14 router guards migrated to the canonical discriminator |
| `340d1a0` | **T3-WU03** | simulation-only command success disabled in production (inlined gate) |
| `6a0c043` | **T3-WU04** | production runtime-mode regression tests, falsification-verified |
| `f7e7447` | T3-WU03R lane D | agent-events production guard migrated |

Parent of `393af8e` = `fbd3a627` (T2). Remote parity `0/0` after every push.
Draft PR #2 remains `state=OPEN`, `isDraft=true`, `mergedAt=null` (read live from the GitHub API).

### saas-product-hub (planning) — `work/wstera-control-truth-sync-001`

`443e849` → `a507711` → `ce46984` → `2f4f8c1` → `ae2ea05` → `19e34b2` → `9d1d7ce` → `19dc09c` →
`c6a9ca8` → `5ab8f25` → `2f31be7` → `3fd87ab` → `6e821d4` → `a0bb79a`

(Owner authorization and the Owner's own parallel-closure checklist commit `f927530` are included.)

---

## 2. Lane ledger

| Lane | Worker | Objective | Lane state |
|---|---|---|---|
| `t3-wu02a` | swarm-builder | owner-inbox truth modes | FAIL — cross-unit type coupling (commander packet-sequencing defect) |
| `t3-wu02b` | swarm-builder | activity + gates truth modes | FAIL — stale commander scope allowlist |
| `t3-wu02c` (×3 attempts) | swarm-builder | client truth modes | attempt 1 `SWARM_BLOCKED` (incomplete header), attempt 2 `WORKER_RETURN_UNPARSEABLE` (excerpt bound), r2 FAIL (`expected_mutations` on a verify-only unit) → **r3 PASS** |
| `t3-wu02d` | swarm-builder | verify-only at final revision | **PASS** |
| `t3-wu02e` | swarm-builder | Overview/Customers/Billing/Operations tab claims | worker PASS · lane FAIL (commander ANSI-grep defect) |
| `t3-wu03e` (attempt 1) | swarm-builder | command production gate | BLOCKED correctly — test-owned closure gate |
| `t3-wu03r-a` | swarm-builder | canonical discriminator module | **PASS** |
| `t3-wu03r-b` | swarm-builder | router migration | **PASS** |
| `t3-wu03r-c` (attempt 1) | swarm-builder | command production gate | BLOCKED correctly — helper is a closure member |
| `t3-wu03r-d` | swarm-builder | agent-events guard | **PASS** |
| `t3-wu04` | swarm-tester | production runtime-mode tests | **PASS** |

**Every non-PASS lane was classified and the classification is in §6.** No worker self-report was
converted into a PASS, no FAIL was repaired by editing a prohibited file, and every mutant used for
falsification was reverted before commit.

---

## 3. Acceptance mapping — `RUN-MANIFEST` §8

| Acceptance criterion | Evidence | Status |
|---|---|---|
| production import/runtime closure cannot select demo fixtures/repository/executor as live data | T3-WU01 (`393af8e`) removed the demo repository default; T3-WU02 removed the fixture reachability in the three truth routers; bundle proof shows zero simulation text in the served asset | **PASS at source and bundle level** |
| no-data returns empty / not-connected; DB error returns degraded; authority stop returns blocked | runtime probes under production and development; `T3-WU04` regression tests | **PASS** |
| test fixtures permitted only outside production dependency closure | every production assertion paired with a non-production control; dev probe shows fallbacks intact | **PASS** |
| loading/missing query never defaults to `simulation` | no `?? "simulation"` remains in `client/src`; `T3-WU02E` bundle proof | **PASS** |
| no fabricated customers/billing/operations/work/inbox/activity/gates | all four tab classes plus the four truth routers covered | **PASS at source and bundle level** |
| no new real payment action | `RETRY_PAYMENT` fails closed in production with `paymentsDelta 0` | **PASS** |
| simulation-only commands disabled rather than returning fake success (Brief §10) | `T3-WU03` at `340d1a0`; all three injection values refused; `RETRY_PAYMENT` FAILED | **PASS** |

**B3 (mechanical stage gate):** manifest says B3 is mechanical unless critical/batch rules force Codex
review. `git diff --check`, typecheck and the full suite are all clean, so B3 passes mechanically.
Codex is reserved for R2 at the manifest checkpoints.

---

## 4. Deterministic gates at the final revision `f7e7447`

```text
npm run check     (tsc --noEmit)  → exit 0
npx vitest run                    → 27 files, 453 tests, exit 0   (430 → 453 with T3-WU04's 23)
git diff --check                  → CLEAN
secret-scan over changed files    → 0 findings
billing-action closure gate       → 48/48 PASS, allowlist never edited on this branch
```

---

## 5. Behavioural proof (executed, not read)

### 5.1 Truth routers — production vs development

```text
NODE_ENV=production
  ownerInbox.list       → mode degraded, items 0, pendingCount 0
  ownerInbox.get        → null
  ownerInbox.decide     → ok:false, mode degraded
  ownerInbox.acknowledge→ ok:false, mode degraded
  agentActivity.list    → mode degraded, items 0
  agentActivity.summary → mode degraded, total 0
  portfolioGates.list   → mode degraded, items 0

NODE_ENV=development  (the control that proves a gate, not deleted fixtures)
  ownerInbox.list       → mode simulation, items 2
  ownerInbox.get        → the oi-001 demo fixture
  ownerInbox.decide     → ok:true, status decided, mode simulation
```

Raw: `T3-WU02-PROBE-PRODUCTION-2026-09-22.json` (sha256 `dd3c2293…`),
`T3-WU02-PROBE-NONPRODUCTION-2026-09-22.json` (sha256 `2dc7eb5d…`).

### 5.2 Command path — production vs development

```text
NODE_ENV=production
  inject simulationOutcome success/failure/timeout → all three REFUSED (throws)
  RETRY_PAYMENT → status FAILED, "Payment recovery is not available in production.",
                  paymentsDelta 0, subscriptionStatusAfter "past_due"

NODE_ENV=development
  inject → SUCCEEDED / FAILED / TIMED_OUT
  RETRY_PAYMENT → SUCCEEDED, "SIMULATED payment recovery: ฿1,290 charge succeeded",
                  paymentsDelta 1, subscriptionStatusAfter "active"
```

Raw: `T3-WU03R-PROBE-PRODUCTION-2026-09-22.json` (sha256 `af672141…`),
`T3-WU03R-PROBE-NONPRODUCTION-2026-09-22.json` (sha256 `470ce74b…`).

### 5.3 Shipped asset contains no simulation claim

Local client build of `87903fe`: `SIMULATION SANDBOX` **0**, `In-Memory Demo` **0**,
`Simulated Recovery` **0**, `NO TRUTH MODE` **4**. `ComponentShowcase.tsx` (which still holds
simulation strings) has zero importers and a bundle count of 0 — dead code, tree-shaken, not in the
production dependency closure. See `T3-WU02E-PRODUCTION-BUNDLE-PROOF-2026-09-22.md`.

### 5.4 Deployed-Worker bundle — the discriminator is a build-time constant

Local `wrangler deploy --dry-run` of the final revision:

```js
function isProductionRuntime() {
  return true;
}
```

`process.env.NODE_ENV` reads on our paths: **0**. No `NODE_ENV` binding is required.
See `T3-WU03R-DISCRIMINATOR-BUNDLE-PROOF-2026-09-22.md`.

---

## 6. Failure and remediation ledger (complete, nothing hidden)

| # | Failure | Class | Root cause | Resolution |
|---|---|---|---|---|
| 1 | `t3-wu02a` FAIL | commander | layer-split packet vs a repo-wide typecheck gate | reordered so the client unit landed first |
| 2 | `t3-wu02c` attempt 1 `SWARM_BLOCKED` | commander | header `acceptance_checks` / `allowed_scope` left empty | populated; correct fail-closed behaviour |
| 3 | `t3-wu02c` attempt 2 `WORKER_RETURN_UNPARSEABLE` | harness | verdict marker outside the 8192-byte excerpt | added a bounded output contract to packets |
| 4 | `t3-wu02c-r2` FAIL | commander | `expected_mutations` declared on a verify-only unit | set `expected_mutations: []` |
| 5 | `t3-wu02b` FAIL | commander | scope allowlist did not whitelist same-run client files | corrected whitelist |
| 6 | `t3-wu02e` FAIL | commander | vitest emits ANSI codes so the grep pattern never matched | gate on the runner's exit code |
| 7 | `t3-wu03e` attempt 1 BLOCKED | **real constraint** | `_core/env.js` import extends the billing-action closure | mechanism changed by Owner decision |
| 8 | `t3-wu03r-c` attempt 1 BLOCKED | **real constraint** | even a zero-import helper becomes a closure member | inlined the literal check instead |
| 9 | Control Sync dead-letter | sender contract gap | `activity.detail` over the endpoint's 2000-char cap | classified, reconciled, routed to T4-WU01 |

**Issues 2, 4, 5, 6, 8 were findings against Hermes's own work, not the workers'.** All are recorded
with their remediation rather than smoothed over.

---

## 7. Independent-verification note for R2

`T3-WU02D`'s verdict verified the three truth routers at `458241c`. Those files **have since changed**
(the lane-B discriminator migration at `2e49004`), so that verdict **cannot be carried forward**. The
replacement assurance is `T3-WU04`'s regression suite, which the commander independently
falsification-tested against all four routers. R2 must review the **final** revisions, not `458241c`.

---

## 8. Non-claims

- No live DB migration. `0009_work_scope_identity.sql` exists but is **not applied**.
- No production deployment, no Cloudflare variable mutation, no runtime-skill production activation.
- Draft PR #2 not merged.
- No `PRODUCTION_READY`, no `OPERATED_STABLE`, no stage PASS asserted by Hermes on its own authority.
- R2/R3 have not started. T4–T7 have not started.
- Mac parity remains `MAC_PARITY_UNVERIFIED`.
- The Control Sync dead-letter remains visible: the outbox reports **40 delivered + 11 dead-letter**
  at the canonical path (1 original task event, reconciled and superseded by a successful bounded
  re-send, plus 10 root-cause probe rejections disclosed in the classification document). **No item is
  claimed as delivered that is not delivered, and no dead letter is hidden.** An earlier run of this
  packet stated 28 delivered; the measured figure at this hold is 40, corrected rather than silently
  updated.
- Every bundle proof above is a **local dry-run/ local build** of the committed revision, not a
  deployed artefact. No code was executed inside the live Worker.
