# T5-WU04 — T5 STAGE EVIDENCE PACKET (revision-bound, R2 candidate)

Task: `WSTERA-CONTROL-TRUTH-SYNC-001` · Workflow `WF-DEV-01 v1.3.0 / LONG_RUN`
Stage: **T5** — "Owner Inbox decision round-trip" (`RUN-MANIFEST` §10)
Prepared: 2026-09-22 (Asia/Bangkok) · By: Hermes (Long-Run Orchestrator / State Holder)
Execution engine: `hermes-native-swarm v0.1.1` · `relay_path_used: false` on every lane

---

## 1. R2 candidate revisions

| Repo | Branch | Revision |
|---|---|---|
| `hub-web` | `work/wstera-control-truth-sync-001` | **`fde38f6`** |
| `wstera-workflows` | `work/wstera-control-truth-sync-001-t4` | **`8afc8d7`** |

Both pushed, remote parity `0/0`. Draft PR #2 remains `state=OPEN`, `isDraft=true`, `mergedAt=null`.

### hub-web chain in this stage

| Revision | Work unit | Content |
|---|---|---|
| `f033eb6` | T5-WU01a | `owner-decisions.ts` — poll/ack logic, domain-separated HMAC, fail-closed refusals |
| `480f5c8` | T5-WU01b | `owner-decisions-http.ts` + routes wired into **both** runtime entry points |
| `fde38f6` | T5-WU03 | `owner-decisions-contract.test.ts` — 37 cross-repo contract tests |

### wstera-workflows chain (T4+T5 combined, same branch)

| Revision | Work unit | Content |
|---|---|---|
| `07b2b0e` | T4-WU01 | local `activity.detail` bound at the measured 2000-char limit |
| `5770bd8` | T4-WU02 | outbox/retry/redaction/bound regression tests (7 → 21) |
| `68276c6` | **T5-WU02** | durable decision poll/consume with domain-separated signing |
| `8afc8d7` | T5-WU03a | gitignore Python bytecode caches |

The T4 work rides the same branch because it has not yet passed R2; **R2 covers both stages' revisions
together**, which is the correct scope since the two are coupled (the manifest's R2 is "after T5").

---

## 2. Work-unit ledger for T5

| Lane | Worker | Objective | Lane state |
|---|---|---|---|
| `t5-wu01a` | swarm-builder | decision handler module | **PASS** |
| `t5-wu01b` | swarm-builder | HTTP wiring into both entries | **PASS** |
| `t5-wu02` | swarm-builder | durable poll/consume in the sender | **PASS** |
| `t5-wu03a` | swarm-builder | gitignore pycache root-cause fix | **PASS** |
| `t5-wu03` | swarm-tester | cross-repo contract tests | **PASS** |

No lane was non-PASS in this stage. Every worker self-report was independently reproduced by the
commander (see §5), and no self-report was converted into a PASS.

---

## 3. Acceptance mapping — `RUN-MANIFEST` §10

| Requirement | Evidence | Status |
|---|---|---|
| agent-only decided-item poll + consumption acknowledgement linked to task/root | `owner-decisions.ts` poll/ack; routes in `worker.ts` and `_core/index.ts` | **PASS** |
| Owner UI decision preserved as immutable audit data | acknowledgement writes only `agent_consumed_*`; `status`/`selected_option`/`decision_note`/`decided_at` declared preserved and collision-free | **PASS** |
| Hermes has no Control DB owner/service-role credential | the sender authenticates over HTTP with its own HMAC; no DB connection string or service-role key is introduced | **PASS** |
| polling only returns decisions authorized for the requesting canonical task/root | scope matcher rejects wrong task, wrong root and unattributable items | **PASS** |
| Hermes persists decision evidence before acknowledging consumption | the ack path refuses to acknowledge a decision not already recorded locally; assert recorded in the ledger with `acknowledged_at` NULL until ack | **PASS** |
| repeated poll after acknowledged consumption cannot re-advance the run | `acknowledged_at` set once; repeat ack idempotent; repeated poll does not re-return consumed items | **PASS** |
| cross-endpoint HMAC replay prevented by domain separation | signed over `wstera-control-owner-decisions-v1:` + body; agent-events-style signature rejected | **PASS** |
| wrong-task, stale, tampered or unsupported-option decisions fail closed | scope refusals 403, tamper/missing/empty 401, unsupported option 422, already-consumed 409 | **PASS** |

**R2 entry condition met.** The manifest places R2 after T5 for exactly this cross-repo surface.

---

## 4. Deterministic gates at the candidate revisions

```text
hub-web      npm run check                 → exit 0
hub-web      npx vitest run                → 28 files, 490 tests, exit 0   (453 + 37 new)
hub-web      git diff --check              → CLEAN
hub-web      billing-action closure gate   → PASS (allowlist never edited)
wstera-wf    python -m unittest discover   → 21 tests, OK
wstera-wf    git diff --check              → CLEAN
secret-scan over changed files             → 0 findings
```

## 5. Commander-side verification (executed, independent of worker reports)

### 5.1 Signing and anti-replay, both sides

```text
hub-web  agent-events-style signature (no domain prefix) → REJECTED
hub-web  domain-separated signature                      → ACCEPTED
hub-web  tampered body with a valid signature            → REJECTED
hub-web  missing / empty signature                       → REJECTED
hub-web  scope: matching task ACCEPTED; wrong task, wrong root, null item REJECTED
hub-src  domain-separated signature ≠ agent-events style for the same body
```

### 5.2 Durable ledger in the sender (real execution, temp database)

```text
record  identical payload re-poll  → recorded:false conflict:false   (dedupe)
record  tampered payload           → recorded:false conflict:true    (fail-closed, evidence not overwritten)
ledger  columns                    → 11, incl. fingerprint, first_seen_at, acknowledged_at, ack_status, request_*_id
ledger  acknowledged_at            → NULL until ack                  (consume-once)
ack     first                      → acknowledged_at set, ack_status 200
ack     second                     → idempotent, no error storm
```

### 5.3 Falsification of the T5-WU03 contract tests (the acceptance criterion for that unit)

```text
domain prefix changed to "TAMPERED:"      → 25 of 37 tests FAIL
refusal tag 401 mapped to 200             →  8 of 37 tests FAIL
both mutations reverted; git diff --quiet → owner-decisions.ts and owner-decisions-http.ts
                                            byte-identical to the committed revision
```

A test that passes with the behaviour broken proves nothing; these tests demonstrably do not.

### 5.4 Status mapping completeness

Every refusal tag in the adapter maps to a non-2xx status, asserted over the whole mapping rather
than a sample: `signature_missing`/`signature_invalid` 401, `request_invalid` 400,
`task_mismatch`/`root_task_mismatch`/`scope_unresolved` 403, `already_consumed` 409,
`not_decided`/`unsupported_option` 422, `db_unavailable`/`read_failed`/`write_failed` 503.

### 5.5 Raw evidence retained

```text
D:/AI-Workspace/runtime/hermes-native/workspace/wstera-cts-001/T5-WU01A-VERIFY-PROBE-2026-09-22.json
  sha256 e0ef3dcb28c76d82239895c9f3a1a1a1f484edd060965f558fc8bd8ca700407a
```

---

## 6. Per-file hashes at the candidate revisions

### hub-web

```text
server/control-plane/owner-decisions.ts                 15790550c3052c5b6e80e32dd62883914c9535675a8a5210ed75ab19772281fb
server/control-plane/owner-decisions-http.ts            2198997f8d5a1ecf3cc195b1b3c1375e5ebd72842fddf3e98ec93c04670684b3
server/worker.ts                                        e62bcf0877d4f880e3428e8d99578e57f02407afa2810fa709bfda388a2a37b7
server/_core/index.ts                                   b7e9662f8a7f11580f45e47cf7778c84045f2170850d48a39ca7e8aafeea37c5
server/control-plane/owner-decisions-contract.test.ts   da842cf61780cbec127a97cf0eefdcb326d4acad624469b12832fd91c8e8952b
```

### wstera-workflows (branch T4)

```text
runtime-skills/devops/wstera-control-sync/scripts/control_sync.py      c48ea0a0fbe30c36ff4d4cb3c48d802acf4be5daaaae1e688aab49602c60fd6d
runtime-skills/devops/wstera-control-sync/references/EVENT-CONTRACT.md 6e3103fcd9d22375dc7810cb4bad4bfbce2bfd5245e9651a6103d42b3f8785a6
runtime-skills/devops/wstera-control-sync/tests/test_control_sync.py   cdaeb4599d52ee0809a8fa87996a18973ffe9fb8dedcda92851cdf9e8b6b008d
.gitignore                                                              6e9702d3624f31e1d9cc7fe245313b8046b424921821e373442553e1d247137c
```

Worktree verified clean (`git status --porcelain` empty) at `8afc8d7`, so these hashes are the
committed revisions and not a working-copy state.

**Contrast with the installed copy** (parity tracked in
`T4-WU03-SOURCE-INSTALL-PARITY-PLAN-2026-09-22.md`): the installed sender is still
`ad330dd5d4c3571c…` and still lacks the detail bound, which is why §7 keeps the dead-letter exposure
visible rather than reporting it as fixed.

---

## 7. Non-claims — read before R2

- **No live DB migration apply.** `0009_work_scope_identity.sql` exists and is **not applied**.
- **No production deployment, no Cloudflare variable mutation, no runtime-skill production activation.**
- **Draft PR #2 not merged.**
- **The installed Control Sync copy is NOT updated.** It still lacks the `activity.detail` bound, so
  the dead-letter root cause classified in `CONTROL-SYNC-DEAD-LETTER-CLASSIFICATION-2026-09-22.md`
  **remains live** for any run emitting through the installed copy, including this one. The fix exists
  in source only; installation waits for R2 per `RUN-MANIFEST` §9.
- **The Control Sync outbox is reported as 40 delivered + 11 dead-letter** at the canonical path. No item is claimed as delivered that is not delivered, and no dead letter is hidden.
- `work.sync` remains blocked by GAP-A (non-product House/Platform work cannot be projected without a
  fake Product code). **No fake Product code was invented.**
- No `PRODUCTION_READY`, no `OPERATED_STABLE`, no stage PASS asserted by Hermes on its own authority.
- R3 has not started. T6/T7 have not started. Mac parity remains `MAC_PARITY_UNVERIFIED`.
- Every probe and test above ran in-process or against a temp database. **No code was executed inside
  the live Worker**, and no live Control endpoint call was used to verify the decision path.
- **The T3-WU02D verdict cannot be carried forward** (the files it verified changed); T3-WU04's
  falsification-verified regression suite is the replacement assurance. R2 review targets the
  revisions in §1, not earlier ones.
