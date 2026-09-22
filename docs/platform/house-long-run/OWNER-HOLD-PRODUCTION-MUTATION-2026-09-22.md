# OWNER HOLD — PRODUCTION MUTATION

Task: `WSTERA-CONTROL-TRUTH-SYNC-001` · Workflow `WF-DEV-01 v1.3.0 / LONG_RUN`
State: **`OWNER_HOLD_PRODUCTION_MUTATION`** — the run is stopped at the manifest checkpoint, not failed.
Reached: 2026-09-22 (Asia/Bangkok) · Held by: Hermes (Long-Run Orchestrator / State Holder)

R2 is closed. Per `RUN-MANIFEST` §11, **no live mutation may proceed without your explicit decision.**
Nothing was advanced past this gate.

---

## 1. Exactly what R2 approved

`R2_FINAL_VERDICT=APPROVED_WITH_FINDINGS` — a **source/revision verdict only**.

| Repo | Branch | Revision |
|---|---|---|
| `hub-web` | `work/wstera-control-truth-sync-001` | `fde38f64e6bd72de9af549a88777bf276933c051` |
| `wstera-workflows` | `work/wstera-control-truth-sync-001-t4` | `fb84b9d` (reviewed at `37865cc`) |

Both pushed, remote parity `0/0`. Draft PR #2 remains `OPEN`, `isDraft=true`, `mergedAt=null`.

R2 history: initial `CHANGES_REQUIRED` (one real defect: consume-exactly-once not enforced) →
remediation 1 `5189a39` → remediation 2 `cf8b45b` → re-review `APPROVED_WITH_FINDINGS` with the
original FAIL **CLOSED** → remediation 3 `37865cc` → final `APPROVED_WITH_FINDINGS` with both minor
findings **CLOSED** → final minor `fb84b9d`. **No finding remains open.**

**This is not production approval** — the reviewer said so explicitly: not deployment approval, not
DB-migration approval, not runtime-skill installation approval, not live-behaviour evidence.

---

## 2. Deterministic gates at the approved revisions

```text
hub-web          npm run check       → exit 0
hub-web          npx vitest run      → 28 files, 490 tests, exit 0
hub-web          git diff --check    → CLEAN
hub-web          closure gate        → PASS, allowlist never widened
wstera-workflows python unittest     → 29 tests, OK
wstera-workflows git diff --check    → CLEAN
```

Bundle proof (local dry-run build of the approved revision): `function isProductionRuntime() {
return true; }`, **0** runtime `process.env.NODE_ENV` reads, 19 helper call sites.

---

## 3. What you are being asked to authorize

Four separate mutations. You may approve them independently; they are listed in the order the manifest
requires, and item 1 must not ship separately from item 2 (see §5).

| # | Mutation | Why it is needed | Risk if skipped |
|---|---|---|---|
| 1 | **Live Control DB migration apply** of `0009_work_scope_identity.sql` | without it, non-product work cannot be projected without a fake Product code | House/Platform work stays invisible in the Work Queue |
| 2 | **hub-web production deployment** | ships the truth-mode gating + the decision poll/ack routes | the truth gates and the Owner decision path exist only in source |
| 3 | **Revised Control Sync runtime skill installation** | installs the `activity.detail` bound and the decision poll/consume support | the classified dead-letter root cause stays live (see §7) |
| 4 | **Rollback / forward-fix plan acceptance** | defines the recovery path before it is needed | unrecoverable failure with no agreed path |

The manifest additionally requires that no owner response means no live mutation. Nothing will move
until you answer.

---

## 4. Exact deployment/migration coupling — read this before approving

Codex flagged this at R1 and it still holds:

> migration `0009` **drops** the 17-argument `ingest_agent_work_event_atomic` overload **after**
> creating and granting the 19-argument function (`0009:557-576`). If an old client is still live at
> `DROP` time, every ingestion call returns `42883 undefined_function`.

Therefore **items 1 and 2 must be applied as one coupled window**, not sequentially days apart:

1. deploy the new hub-web revision (client sends 19 arguments) **and**
2. apply `0009` in the same window, or apply first and deploy immediately after, so no window exists
   in which the old 17-argument client runs against the dropped overload.

A safe ordering that avoids the gap is: deploy the new client revision → confirm it is serving → apply
`0009` → verify ingestion → then observe.

**Additional coupling from the new decision path:** the decision routes are additive and do not
require the migration, but the Control Sync consumer (item 3) should not be installed before the
routes are deployed, or it will poll an endpoint that does not exist yet.

---

## 5. Rollback / forward-fix plan

**Migration rollback.** `0009` is additive except for the `DROP FUNCTION` of the 17-argument overload.
A true rollback therefore requires recreating that overload, which is only safe if no client is
sending 19 arguments. Practical forward-fix is preferred over rollback:

- if ingestion fails with `42883` after apply: the 17-argument function was dropped while an old
  client was still live. **Forward-fix** by completing the client deploy first; do not attempt to
  restore the overload while 19-argument clients are running.
- the additive columns and the `NOT VALID` CHECK are backwards-compatible, so a partial state is safe.

**hub-web rollback.** Cloudflare Workers keeps prior versions; the last-known-good version is
`5dc81232-c116-4722-a6c1-74c15ad50385`. Rollback is a version re-point, but note it also reverts the
truth-mode gating — see §7 for why that is not a neutral choice.

**Control Sync rollback.** The skill directory is not a git repo. The pre-change hashes are recorded in
`T4-WU03-SOURCE-INSTALL-PARITY-PLAN-2026-09-22.md` §2 as the rollback targets:

```text
scripts/control_sync.py      ad330dd5d4c3571c…   (current installed)
references/EVENT-CONTRACT.md e763e48821a90f31…   (current installed)
tests/test_control_sync.py   9a8c054b35286f56…   (current installed)
```

---

## 6. Live-proof plan to run after the mutations

The manifest requires these to be demonstrated, not asserted:

1. **Product task sync still works** — a canonical product-scoped event is accepted and appears in the
   Work Queue.
2. **Identity conflicts still fail closed** — missing/unknown/conflicting Product identity rejected.
3. **House/Platform sync works with explicit non-product scope and no fake Product code** — the
   specific gap (`GAP-A`) this task exists to close.
4. **Owner hold produces exactly one Inbox item** for one source event.
5. **Owner decision is consumed by Hermes and advances only the authorized checkpoint**, then a
   repeat poll does not re-advance it (the R2 defect must be proven fixed **live**, not only by test).
6. **Live UI truth modes are LIVE / EMPTY / DEGRADED / BLOCKED as applicable** on
   `platform.wstera.com`.
7. **No demo customer/billing/operation/work/inbox/activity/gate state appears in production.**
8. **Control sender outbox has no unexplained pending or dead-letter items.**
9. **Public health and security baseline intact** — the 16-check live proof from the prior House task
   re-run green.

---

## 7. 🔴 The most important thing to read before deciding

**Two conditions in the current state are worse than "no change".**

### 7.1 The deployed Worker cannot reach the new truth gates until item 2

The bundle proof shows `isProductionRuntime()` compiles to `return true` in a production build, so the
gates work **once deployed**. The currently deployed version does not contain them. Approving item 2 is
what converts them from source into behaviour.

### 7.2 The installed Control Sync still has no detail bound, so the dead-letter cause is still live

`grep -c MAX_ACTIVITY_DETAIL_CHARS` on the installed sender returns **0**. The measured endpoint limit
is 2000 characters (2000 accepted, 2001 rejected). Until item 3 runs, **any governed run emitting
through the installed copy — including this one — can still produce a dead-letter** by sending an
over-long `activity.detail`. This run's mitigation is procedural (Hermes keeps details short), not
installed.

**The dead-letter count in this run's evidence must not be read as "fixed".**

**Delivery state at this hold — measured against the canonical outbox**
(`D:/AI-Workspace/runtime/hermes-native/data/.hermes-runtime/wstera-control-sync.sqlite3`):

```text
51 rows = 40 delivered + 11 dead_letter

the 11 dead letters:
  wcs-activity:cc6a86381fb4467a99828bce15988fe7   the original task event
  wcs-activity:probe-detaillimit-2001 … -2049     (10) root-cause probe rejections
```

- The **1 original task event** is classified and reconciled in
  `CONTROL-SYNC-DEAD-LETTER-CLASSIFICATION-2026-09-22.md` and was superseded by a successful bounded
  re-send.
- The **10 probe rejections are Hermes's own measurement traffic**, generated to pin the exact
  2000-character boundary. They are disclosed there in full: 13 probe events were sent to the live
  Control endpoint, 3 accepted and 10 rejected, and the 10 rejections wrote nothing server-side. They
  cannot be read as task telemetry, and no dead letter is claimed as delivered.
- An earlier count of "28 delivered" in this run's reporting was stale. The measured figure at this
  hold is **40 delivered**. The dead-letter figure was correct at 11 throughout. This is recorded
  rather than quietly corrected, because the owner-facing number must be the measured one.

---

## 8. Remaining non-claims and open items

- **`work.sync` is still blocked by GAP-A** and will remain so until item 1 + the Control-side
  compatibility patch land. **No fake Product code was ever invented.** Activity telemetry was used
  truthfully in the meantime.
- **Mac parity remains `MAC_PARITY_UNVERIFIED`.**
- **T6, R3 and T7 have not started.** `READY FOR OWNER CONTROL TRUTH REVIEW` has not been claimed.
- **No `PRODUCTION_READY` and no `OPERATED_STABLE`** is claimed anywhere.
- The reviewer never executed the suites itself (its sandbox could spawn no child processes and had no
  writable temporary directory). It marked those gates UNVERIFIED rather than passing them. The
  commander's runs are recorded as commander-produced evidence, not reviewer-reproduced.
- **`applied: true` is a claim about the local ledger only.** It does not prove an external side effect
  happened once; a crash after the marker but before the caller's downstream work commits means that
  work must be idempotent itself, and the acknowledgement network call is not in the same transaction
  as the persisted evidence.

---

## 9. What is required from you now

Answer with a decision per item in §3 (1–4), and state the intended operator for the live mutation.
If you approve, the first action is a Control DB backup, then the coupled window in §4.

**Nothing proceeds without your answer.** The run is held, not failed, and the approved revisions stay
exactly where they are.
