# HERMES RUN STATUS — WSTERA-CONTROL-TRUTH-SYNC-001 — T0 → mid-T2

Owner-facing status record written by Hermes as Long-Run Orchestrator / Coordinator / State Holder.
Recorded: 2026-09-21 (Asia/Bangkok). Task: `WSTERA-CONTROL-TRUTH-SYNC-001`, `WF-DEV-01 v1.3.0 / LONG_RUN`.

Execution engine: **`hermes-native-swarm v0.1.1`** only. Agent Relay was **not** used as an ordinary
execution path — every lane evidence record carries `relay_path_used: false`. Codex and Claude were
**not** invoked; they wait for the manifest's R1/R2/R3 checkpoints.

Run ledger (machine-readable, with all hashes):
`D:\AI-Workspace\runtime\hermes-native\workspace\wstera-cts-001\RUN-LEDGER-WSTERA-CONTROL-TRUTH-SYNC-001-2026-09-21.json`

---

## 1. Stage state

| Stage | Lane | Worker | Swarm state | Commander verdict |
|---|---|---|---|---|
| T0 reconcile | `t0-wu01` | swarm-inspector | SWARM_WORK_UNIT_PASS / invariant CLEAN | ACCEPTED after one remediation |
| T0 remediation | `t0-wu02` | swarm-builder | SWARM_WORK_UNIT_PASS / invariant CLEAN | ACCEPTED |
| T0/B0 packet | `t0-wu03` | swarm-evidence | SWARM_WORK_UNIT_PASS / invariant CLEAN | ACCEPTED |
| T1 spec | `t1-wu01` | swarm-inspector | SWARM_WORK_UNIT_PASS / invariant CLEAN | ACCEPTED |
| T2 implementation | `t2-wu01` | swarm-builder | SWARM_WORK_UNIT_PASS / invariant CLEAN | ACCEPTED |
| T2 DB qualification | `t2-wu02` | swarm-db | SWARM_WORK_UNIT_PASS / invariant CLEAN | ACCEPTED AS EVIDENCE — verdict `QUALIFIED_WITH_FINDINGS` |

**B0 has no blocking finding.** T1 is complete. T2 is implemented but **not reviewed** (R1 not run) and
**not committed**.

## 2. Artifacts produced (all in this worktree)

| Document | sha256 | bytes |
|---|---|---|
| `T0-CANONICAL-RECONCILIATION-2026-09-21.md` | `fc9fa54fe62aa7cb8186330fc0f491eeca02d3cf88a68fcb195871ea160643d9` | 60040 |
| `T0-B0-EVIDENCE-PACKET-2026-09-21.md` | `4a60a303fe4ff7d2…` | 21659 |
| `T1-SCOPE-CONTRACT-AND-DEPENDENCY-CLOSURE-2026-09-21.md` | `415ed8e4a0e64cd28e5e81a355f952951b7896b2a627497f05bde371c1101c43` | 64259 |
| `T2-WU02-MIGRATION-RPC-QUALIFICATION-2026-09-21.md` | `1e7a81b1c9c36a905c08ace4ce235e454b9b93ce6ed1e2b0b115f612d3cd8c63` | 72451 |

## 3. T0 measured reconciliation — result

Every pinned value was re-observed and matched:

- House `Gutumrod/saas-product-hub` @ `13a2d55b509d15ee5b6375562b029c0dc98dce49`, origin parity `0/0`.
- hub-web @ `407130718646d13630b9789f68522a521fc74483`, parity `0/0`, worktree clean, 45 commits ahead of `main@8a3e493`.
- wstera-workflows @ `e711b94835525def94757e9ec3b4ec5bda615308`, parity `0/0`, clean.
- **Draft PR #2: OPEN + DRAFT + unmerged**, read live from the GitHub API (`mergedAt: null`). PR #1 untouched.
- Production Worker `hub-web` version `5dc81232-c116-4722-a6c1-74c15ad50385` at 100 % traffic; public `platform.wstera.com` returns HTTP 200.
- Installed skills: Swarm `0.1.1` sha256 `42fe2875…`, Control Sync `0.1.0` sha256 `e1d23903…` — both MATCH; installed↔source byte parity SAME.
- Control Sync `doctor` **re-run through the Hermes-loaded environment**: `endpoint_configured=true`, `endpoint_https=true`, `secret_configured=true`, `secret_source=canonical_secret_file`, `secret_value_exposed=false`. Outbox `[]` (no pending, no dead-letter).
- Mac parity: `MAC_PARITY_UNVERIFIED` (no Tailscale client, no recorded Mac address, no `~/.ssh`). Not a Windows blocker.
- Ten observed differences recorded verbatim; **all classified not contract-affecting**.

## 4. Fail-closed events that actually occurred (not hidden)

1. **Commander secret-scan FAILED on the first T0 document.** The observation lane had copied two real
   credential values out of a `wrangler whoami` transcript into evidence — the Cloudflare account
   identifier and the account administrator email. T0 was **not** accepted. One bounded local fix
   attempt (of the two-attempt budget) withdrew both literals, **preserved the non-credential ETag
   value byte-for-byte**, and the scan now returns `findings: []`. The redaction is **disclosed in
   section 9** of the document. The worker had also self-disclosed a metadata-only `ls` on the
   canonical secret file outside its allowed roots; that was recorded rather than normalised.
2. **A routing refusal fired before dispatch.** T1's first packet declared an unknown capability token
   and `swarmctl plan` returned `SWARM_REVIEW_REQUIRED / ROUTING_UNCERTAIN` with zero lanes. No worker
   ran. The packet was corrected and re-validated.
3. **An isolated-worktree environment defect, found and fixed.** The global git setting
   `core.autocrlf=true` materialised the fresh hub-web worktree with CRLF line endings, which broke
   four mutation-probe tests (366 → 362 passing). After forcing LF materialisation the baseline is
   **366/366**. This was a harness defect, not a product defect — verified by running the same test in
   the source worktree, where it passes.

## 5. T1 — locked scope contract (summary)

The five-value vocabulary is `product | house | platform | workflow_infrastructure | shared_runtime`.
Product scope keeps canonical immutable `productCode + productId`. Non-product scope carries no Product
identity and requires an explicit non-product `scopeType` + non-empty `scopeKey`. Missing Product
identity with no explicit non-product scope fails closed. Scope is additive; `product_code` is not
repurposed. The migration section is declared **design only — not written, not applied**.

## 6. T2 — implementation verified by the commander, not taken on trust

Changed files in the isolated worktree `D:\AI-Workspace\runtime\worktrees\hub-web-cts001`
(branch `work/wstera-control-truth-sync-001`, HEAD still `4071307`, **zero commits**):

```
server/control-plane/work-event-schema.ts |  29 ++-
server/control-plane/identity.ts          | 161 +++++++++-
server/webhooks/agentEvents.ts            |  45 ++-
server/control-plane/work-event-schema.test.ts | 139 +++++++
server/webhooks/agentEvents.test.ts       | 109 ++++++
server/control-plane/identity.test.ts     |  77 +++++
```

Commander independent verification (re-run by Hermes, not the worker):

- `npm run check` → PASS.
- `npx vitest run` → **381/381 PASS** (baseline 366/366).
- Exactly the six allowed files changed; no out-of-scope edit; no untracked file; **no migration file created**; no database contacted.
- Out-of-repo probe of `resolveWorkScope` (bundled with esbuild, run by node outside the repo) →
  **PROBE_ALL_OK — 10/10 scope rows correct, 5/5 legacy `resolveProductIdentity` rows unchanged.**
- RPC arguments `p_scope_type` / `p_scope_key` added additively; `p_product_code` and `p_identity_state`
  keep their names and meaning; `product_code` not repurposed; exact-body HMAC path untouched.

## 7. T2 DB qualification — 12 findings, one rated HIGH

Verdict: **`QUALIFIED_WITH_FINDINGS`** — the design intent is sound and additive, but it is *not* a
migration ready to write. Hermes independently corroborated the three most important findings from source:

- **F1 (HIGH) — arity change creates an overload, not a replacement.** `grep -rn "DROP FUNCTION" drizzle/`
  returns nothing, and `0006:32-49` declares a **17-argument** function that `0006:265-288` grants to
  `service_role`. A 19-argument `CREATE OR REPLACE` therefore leaves the **17-argument function live with
  no scope gate**, so the new fail-closed scope contract is bypassable by any 17-argument caller.
  Corroborated: the T2-WU01 client now sends **19** arguments while the migration signature is still **17**.
- **F2 (MEDIUM)** — the RPC error tag must be pinned to the exact strings the handler matches
  (`scope_identity_invalid` / `scope_identity_conflict`); an unrecognised tag falls through to a
  *retryable* 500 instead of a non-retryable 422 — a fail-open outcome for an integrity violation.
- **F9 (MEDIUM)** — `work-truth-migration.test.ts` asserts only statement **suffixes**
  (`") FROM PUBLIC;"` etc.), which are identical for 17- and 19-entry signatures, and reads **only
  `0006`** — so a wrong-arity block, a missing block for the new function, and an entirely new
  migration file would all pass.
- **F10 (MEDIUM)** — this migrations folder targets **two different databases** (`0002`–`0006` Control,
  `0007`/`0008` product DB), and there is **no `__drizzle_migrations` journal**. The new file must
  declare its target and predecessor explicitly.
- Also recorded: F3 (row constraint never given as SQL), F4 (`identity_state` unbounded vocabulary),
  F5 (50 vs 30 char mismatch), F6 (speculative index), F7 (`IF NOT EXISTS` does not verify type),
  F8 (payload byte-comparison surface widened), F11 (no rollback block), F12 (apply/deploy ordering).
- Declared limitation: **applied database state was never inspected** — every DB statement is a
  statement about migration *source* at `4071307`, not applied truth. That must be checked at T6.

## 8. Blockers requiring an Owner decision

- **B1 — Control Work Queue sync is BLOCKED (GAP-A).** Migration `0006:70-78` raises
  `product_identity_invalid` for any task projection without a canonical `productCode + productId`.
  House/Platform work therefore **cannot** be truthfully projected into Work Queue without inventing a
  fake Product code, which is forbidden. No work-sync was attempted. Control received
  **activity-only telemetry**, delivered HTTP 200. This is the exact gap this task exists to close.
- **B2 — commit / branch authority is unresolved.** The task instructions lock the branch
  `work/wstera-control-truth-sync-001`; the repository git policy prescribes `task/<TASK-ID>-<slug>`;
  and the standing rule says `saas-product-hub` commits are Claude-only. **Nothing has been committed
  or pushed anywhere**, so R1 has no pinned revision to review yet.
- **B3 — T2 F1 (HIGH) must be closed inside the migration text** before T2-WU03/WU04 and R1.

## 9. Retry / remediation budget

| Budget | Total | Consumed | Remaining |
|---|---|---|---|
| local_fix_attempts | 2 | 1 (T0 secret-scan defect) | 1 |
| reviewer_remediation_attempts | 2 | 0 | 2 |
| senior_escalations | 1 | 0 | 1 |

## 10. Not reached

T2-WU03 (`swarm-tester`), T2-WU04 (`swarm-evidence`), **R1 Codex review**, T3 (mock removal), T4 (Control
Sync integration), T5 (Owner Inbox round-trip), **R2**, `OWNER_HOLD_PRODUCTION_MUTATION`, T6 (deploy +
live proof), R3, T7 (final reconciliation).

## 11. Non-claims

No `PRODUCTION_READY`. No `OPERATED_STABLE`. No `LIVE_PROVEN` beyond what is quoted from the House closure
record. No stage PASS asserted by Hermes on its own authority. No Owner decision made or inferred.
Draft PR #2 remains unmerged. No database was contacted. No migration file was created. No production
mutation of any kind occurred. Mac parity remains unverified.
