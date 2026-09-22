# T3-WU02 — REVISION-BOUND EVIDENCE PACKET

Task: `WSTERA-CONTROL-TRUTH-SYNC-001` · Workflow `WF-DEV-01 v1.3.0 / LONG_RUN`
Stage: **T3** (§8 of `RUN-MANIFEST-WSTERA-CONTROL-TRUTH-SYNC-001.md`)
Work Unit: **`T3-WU02`** — executed as four bounded sub-units under the Owner-authorized split
(Option 1, `OWNER-HOLD-T3-COMPOSITE-SCOPE-2026-09-21.md`)
Date: 2026-09-22 (Asia/Bangkok)

---

## 1. Revision identity

| Repo | Branch | Base | Target (this packet) |
|---|---|---|---|
| hub-web | `work/wstera-control-truth-sync-001` | `393af8eac1633f2bb68038a89ddd3bd3062710cf` (T3-WU01) | `458241cc4b5455172d1f44c43e125f6c647c844d` |

Remote parity `0/0` immediately before and after the push. Draft PR #2 read live from the GitHub
API: `state=OPEN`, `isDraft=true`, `mergedAt=null` — **not merged**.

Parent chain: `fbd3a6274d7ae0100c198f32ce6e952d47940ad1` → `393af8ea…` → `458241cc…`

---

## 2. Changed files (exactly 7, +212 / −37)

| File | Δ | Content |
|---|---|---|
| `server/control-plane/owner-inbox-router.ts` | +53/−10 | `InboxTruthMode`; 5 `ENV.isProduction` gates; demo fixture unreachable in production; no fabricated `decided`/`acknowledged` |
| `server/control-plane/agent-activity-router.ts` | +49 | 4 production gates on `list` + `summary` |
| `server/control-plane/portfolio-gates-router.ts` | +21 | 2 production gates on `list` |
| `client/src/pages/PlatformControlPlane.tsx` | +11/−4 | 4 × `?? "simulation"` → `?? "degraded"` |
| `client/src/components/control-plane/OwnerInboxTab.tsx` | +33/−? | prop union widened; badge derived from mode; banner split |
| `client/src/components/control-plane/AgentActivityTab.tsx` | +33/−? | same |
| `client/src/components/control-plane/PortfolioGateTab.tsx` | +39/−? | same |

Nothing outside `RUN-MANIFEST` §8 T3-WU02 scope changed. Allowed-scope check PASS (commander-run).

Per-file SHA256 of the committed revision (`458241c`) in the worktree:

```text
8eb80b8dcf2b41d86c0278a7956fbafe2a789d087e72a90d2a8929aeddf68d18  server/control-plane/owner-inbox-router.ts
d6f4b84d92230ea950ecdf131fc9ca2086454f73f43b841b65148f2a02ec65a8  server/control-plane/agent-activity-router.ts
e4ff0ad4210810996efe0b6b943feb1abcaecff131be798f855b4f668f8d5a64  server/control-plane/portfolio-gates-router.ts
b1176887b3b0a3dbd043e5a014e823e1fda61746cce66aea07be7abeb5bf0b68  client/src/pages/PlatformControlPlane.tsx
bd518b8967ae88fd537f6147631e073fdd33f7d47a98aba5455af7d86b938f72  client/src/components/control-plane/OwnerInboxTab.tsx
186450373d4bebb1bd12a8f96cd224b47d3393d071b30eadf7edea6be6300035  client/src/components/control-plane/AgentActivityTab.tsx
90b720b7f25bf6381530983a6229849addae61be13aae8268b09cb52a2f750f6  client/src/components/control-plane/PortfolioGateTab.tsx
```

---

## 3. Lane ledger

| Lane | Worker profile | Model | Objective | Lane state |
|---|---|---|---|---|
| `t3-wu02a` | `swarm-builder` | `deepseek-v4.1-flash:cloud` | owner-inbox-router truth modes | `SWARM_WORK_UNIT_FAIL` |
| `t3-wu02c` (attempt 1) | `swarm-builder` | same | client Control Plane truth modes | `SWARM_BLOCKED` (`GOVERNANCE_INCOMPLETE`) |
| `t3-wu02c` (attempt 2) | `swarm-builder` | same | same | `SWARM_WORK_UNIT_FAIL` (`WORKER_RETURN_UNPARSEABLE`) |
| `t3-wu02c-r2` | `swarm-builder` | same | same | `SWARM_WORK_UNIT_FAIL` (commander mutation check) |
| `t3-wu02c-r3` | `swarm-builder` | same | same | **`SWARM_WORK_UNIT_PASS`** |
| `t3-wu02b` | `swarm-builder` | same | agent-activity + portfolio-gates | lane FAIL (stale commander scope check) |
| `t3-wu02d` | `swarm-builder` | same | verify-only at final revision | **`SWARM_WORK_UNIT_PASS`** |

`relay_path_used: false` on every lane. `execution.engine: hermes-native`.

### 3.1 Failure classification — all four non-clean lanes were harness/commander defects, not work defects

- **`t3-wu02a` FAIL** — `npm run check` failed with
  `client/src/pages/PlatformControlPlane.tsx(496,15): error TS2322: Type 'InboxTruthMode' is not
  assignable to type '"live" | "simulation" | "demo_fallback"'`. Root cause: splitting T3-WU02 **by
  layer** makes any repo-wide gate unsatisfiable inside one layer. The server unit widened the mode
  union before the client unit could accept it. The worker correctly refused to touch the prohibited
  client file. Substance of the unit is correct; the defect is a **packet-sequencing error by the
  commander**. Fixed by ordering the client unit first.
- **`t3-wu02c` attempt 1 BLOCKED** — `GOVERNANCE_INCOMPLETE: MISSING:acceptance_checks`,
  `MISSING:allowed_scope`. Commander defect: the governance header's top-level `acceptance_checks`
  and `allowed_scope` were left empty while only the work-unit packet carried them. Fail-closed
  behaviour was correct.
- **`t3-wu02c` attempt 2 `WORKER_RETURN_UNPARSEABLE`** — the worker's structured verdict marker fell
  outside the 8192-byte output excerpt bound because the worker wrote a long evidence summary first.
  Harness bound, not a work defect. Mitigated by adding an explicit output contract to the packet.
- **`t3-wu02c-r2` FAIL** — `expected_mutations` was declared on a **verify-only** unit, so
  `mutation-observed:*` returned FAIL for all four files with `DECLARED_MUTATION_NOT_OBSERVED`.
  Commander defect; corrected by emptying `expected_mutations` for verify-only units.
- **`t3-wu02b` lane FAIL** — `test -z "$(git status --porcelain | grep -vE '…')"` scope check still
  listed only the server routers and did not whitelist the four already-committed-in-this-run client
  files. Commander defect: a stale scope allowlist. `mutation-observed` and `npm run check` both
  PASSed. The final verify unit `t3-wu02d` used a corrected allowlist and returned PASS.

**All five issues were reproduced, classified and corrected by the commander. No worker output was
converted into a PASS and no FAIL was repaired by editing a prohibited file.**

---

## 4. Commander-verified deterministic evidence

Run by the commander after every worker had stopped, on the final revision:

| Check | Command | Result |
|---|---|---|
| Typecheck | `npm run check` (`tsc --noEmit`) | **exit 0** |
| Full suite | `npx vitest run` | **26 files, 430/430 PASS** |
| Whitespace/lint safety | `git diff --check` | **CLEAN** |
| Allowed-scope | `git status --porcelain` vs allowlist | **PASS** (exactly 7 files) |
| Secret scan | `swarmctl secret-scan` over the 7 files | `files_scanned: 7`, `findings: []` |
| Simulation default removed | `grep -rn '?? *"simulation"' client/src` | **no matches** |
| Production guard present | `grep -n isProduction` × 3 routers | 11 guards present |

---

## 5. Behavioural proof (executed, not read)

A probe invoked the real tRPC router through `appRouter.createCaller` with no Control datastore
configured. Source: `tmp/truth-mode-probe.ts` in the worktree (gitignored, removed after the run).

### 5.1 `NODE_ENV=production`

```json
"ownerInbox_list":        { "mode": "degraded", "items": 0, "pendingCount": 0 },
"agentActivity_list":     { "mode": "degraded", "items": 0 },
"agentActivity_summary":  { "mode": "degraded", "total": 0 },
"portfolioGates_list":    { "mode": "degraded", "items": 0 },
"ownerInbox_get_demo_id": null,
"ownerInbox_decide_demo_id":      { "ok": false, "error": "Control database not available in production", "mode": "degraded" },
"ownerInbox_acknowledge_demo_id": { "ok": false, "error": "Control database not available in production", "mode": "degraded" }
```

### 5.2 `NODE_ENV=development` — the control that proves it is a real gate

```json
"ownerInbox_list":       { "mode": "simulation", "items": 2, "pendingCount": 2 },
"agentActivity_list":    { "mode": "simulation", "items": 0 },
"portfolioGates_list":   { "mode": "simulation", "items": 0 },
"ownerInbox_get_demo_id":         { "id": "oi-001", "title": "Production Deployment Approval — platform.wstera.com", "status": "pending" },
"ownerInbox_decide_demo_id":      { "ok": true, "status": "decided", "mode": "simulation" }
```

Raw probe outputs retained:

```text
D:/AI-Workspace/runtime/hermes-native/workspace/wstera-cts-001/T3-WU02-PROBE-PRODUCTION-2026-09-22.json
  sha256 dd3c2293dc8f59ee036835c2840bf968f88f325cc71536cde01cf8019a939b91
D:/AI-Workspace/runtime/hermes-native/workspace/wstera-cts-001/T3-WU02-PROBE-NONPRODUCTION-2026-09-22.json
  sha256 2dc7eb5d035af156555f81a1eb887d68dd19fd05d54d4dfc88593a7b178d7fe2
```

The production run proves the change; the development run proves the fixture set was **gated, not
deleted** — which is what the Brief §10 requires ("Test fixtures may remain only outside production
dependency closure").

---

## 6. Acceptance mapping — T3-WU02

| Acceptance criterion (manifest §8) | Status at source/revision level | Status on the deployed Worker |
|---|---|---|
| production cannot select demo fixtures as live data | **PASS** (proven under `NODE_ENV=production`) | **NOT SATISFIED** — see §8 |
| no-data returns empty / not-connected / degraded | **PASS** | **NOT SATISFIED** — see §8 |
| DB error returns degraded / unavailable | **PASS** | **NOT SATISFIED** — see §8 |
| loading/missing query never defaults to `simulation` | **PASS** (no `?? "simulation"` remains) | **PASS** (client-side, independent of `NODE_ENV`) |
| no fabricated customers/billing/operations/work/inbox/activity/gates | **PASS** at source | **NOT SATISFIED** — see §8 |
| no new real payment action | **PASS** | **PASS** |
| test fixtures permitted only outside production closure | **PASS** (gated, proven reachable only when `isProduction` is false) | **NOT SATISFIED** — see §8 |

---

## 7. Non-claims

- No database was contacted. No migration was applied. `0009_work_scope_identity.sql` exists but is
  **not applied**. No production mutation occurred. Draft PR #2 was not merged.
- No `PRODUCTION_READY`, no `OPERATED_STABLE`, no stage PASS asserted by Hermes on its own authority.
- T3 is **not** complete: `T3-WU03`, `T3-WU04`, `T3-WU05` are outstanding.
- R1 `BATCH_APPROVED` remains a source/revision verdict only. **R2 has not started.**
- Mac parity remains `MAC_PARITY_UNVERIFIED`.
- This packet is **not** an independent review. `T3-WU02` has not passed R2.

---

## 8. 🔴 Carry-forward: the deployed-Worker blocker

While resuming T3, the commander measured that the deployed Worker version
`5dc81232-c116-4722-a6c1-74c15ad50385` carries **no `NODE_ENV` binding**, and that
`wrangler.jsonc` declares no `vars` block. Because `server/_core/env.ts:4` derives
`isProduction` from `getRuntimeEnvString("NODE_ENV")` — a **computed** property read that Wrangler's
esbuild `process.env.NODE_ENV` define cannot replace — `ENV.isProduction` evaluates **false in
production**.

Consequence: every `ENV.isProduction` guard in this repository is **inert on the live system**,
including the pre-existing guards in `work-queue-router.ts` that T1 §7.4 named as "the model to
preserve".

This makes the T3 acceptance criteria **not satisfied on the deployed system**, even though the
committed source is correct and independently proven. It is a production-configuration finding, not
a regression from this run, and it is outside Hermes's authority to change.

**Raised as an Owner hold:** `OWNER-HOLD-PRODUCTION-TRUTH-GATE-INERT-2026-09-22.md` (same directory).

---

## 9. Next actions

1. Owner rules on the deployed-Worker `NODE_ENV` blocker and on the `T3-WU03` test-gate question.
2. `T3-WU03` — the partial edit is preserved and the worktree was returned to the committed
   revision:

   ```text
   D:/AI-Workspace/runtime/hermes-native/workspace/wstera-cts-001/T3-WU03E-WIP-NOT-COMMITTED-2026-09-22.patch
   sha256 784bc261d9650fa62dc71ec87a9bf5a57945ee51d577cb6de88d068c1a070747  (75 lines)
   ```

3. Then `T3-WU04` → `T3-WU05` → `T4` → `T5` → `R2` → `OWNER_HOLD_PRODUCTION_MUTATION`.
