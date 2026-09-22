# HANDOFF — LANE-B CONTROLLER, WINDOWS → MAC

Date: 2026-09-22
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Outgoing controller: Claude (Windows)
Incoming controller: Claude (Mac)
Owner decision: controller relocates to Mac so the
`CLAUDE → AGY → CODEX → CLAUDE` loop runs on one machine without human relay.

## 1. What is being transferred

The Lane-B `LONG_RUN` controller role defined in
`BRIEF-LANE-B-SHARED-RUNTIME-LONG-RUN-CLAUDE-AGY-CODEX-2026-09-22.md` §3: state
holder, brief interpreter, AGY/Codex dispatcher, post-mutation verifier, and stage
advancement authority.

Nothing else changes. The brief, the manifest, the stage path, the Owner
checkpoints, and the safety rules are unchanged and remain binding.

## 2. Required reading before you act

In order:

1. `BRIEF-LANE-B-SHARED-RUNTIME-LONG-RUN-CLAUDE-AGY-CODEX-2026-09-22.md`
2. `RUN-MANIFEST-LANE-B-SHARED-RUNTIME-LONG-RUN-2026-09-22.md`
3. `PRE-01-CLASSIFICATION-AND-CLOSURE-2026-09-22.md` ← the state you inherit
4. `BRIEF-CLAUDE-H3D-STATIC-ACCEPTANCE-REMEDIATION-2026-09-09.md` ← defines S1–S5
5. `BRIEF-CLAUDE-H3D-H5-HOUSE-A-LONG-RUN-EXECUTION-2026-09-09.md`
6. `BRIEF-SHARED-RUNTIME-PLATFORM-ISOLATION-REMEDIATION-2026-09-08.md`
7. `OPERATOR-ACTION-PACK-H3D-TO-H5-2026-09-09.md`
8. `REPORT-BK01-JUNCTION-A-PLATFORM-ISOLATION-HANDOFF-2026-09-08.md`

These live on `work/house-lane-b-longrun-plan-20260922`. Read them without
checking out that branch over your execution worktree:

```
git show origin/work/house-lane-b-longrun-plan-20260922:docs/platform/shared-runtime/<file>
```

## 3. Inherited state — measured, not asserted

| Item | Value |
|---|---|
| Stage | `PRE-01 PASS`; next unit `H3D-S` |
| House execution worktree (Mac) | `/Users/wachirayachankhonkan/AI-Workspace/runtime/worktrees/house-h3d-h5-20260909` |
| Execution branch | `work/house-h3d-h5-20260909` @ `d6707c0c96309f2f0efb8f83f00b5f34aee6d2b5`, parity `0/0` |
| Working tree | dirty by design: `M tools/shared-runtime/h3d/h3d-live-runner.mjs`, blob `c7a426c6792e59c4670a2e23f4ec89f1f1e31847` |
| Preserve commit | `db19abda329a31c08ad63b6be83afa47bd0eb494` on `origin/preserve/mac-h3d-dirty-20260922` |
| Local bundle backup | `~/mac-h3d-preserve-20260922.bundle` sha256 `33374d298b62cd20b9018283acda4fd9c41a3661f6f1662ab72efdc9e19d6a45` |
| Committed baseline blob | `899d9cbf24d3a8445e483b364e44ec9ffb22e6e4` |
| PS01 worktree | `…/ps01-h3d-data-api-20260909`, `work/ps01-h3d-data-api-20260909` @ `c169e5dfc6ba3da45c653b853f1694355ee8ae88`, clean, `0/0` — do not modify |
| Planning branch | `work/house-lane-b-longrun-plan-20260922` @ `0bee492` |
| Production authority | none |
| Cross-lane conflict | none — `WSTERA-HOUSE-PRODUCTION-CLOSURE-001` is CLOSED (2026-09-21), `Next Allowed Action: NONE` |

The dirty working-tree content is valid continuation work. **Do not discard it.**
S1–S4 of the static-acceptance brief are addressed within it; S5 is not.

It is unattributed and **carries zero prior review**, and no gate has ever been run
against it. Nothing in it may be treated as accepted.

## 4. Locked unit — `H3D-S`

### Objective

Complete the H3D static acceptance remediation so the revision is reviewable: close
`F-S5-RESIDUAL`, then run the full required gate set and produce one exact SHA.

### AGY work items — `F-S5-RESIDUAL`

`camera_access_audit` has no FK to `ps01.shops`, so deleting fixture Shop A/B cannot
remove its rows. Post-seed detection alone does not close S5. Required:

1. Teardown: lock `ps01.camera_access_audit` in the deterministic lock set and assert
   zero fixture-shop rows before the first `DELETE`
   (`docs/platform/shared-runtime/fixtures/h3d-authz-fixture-teardown.sql`).
2. Seed: atomic precondition of zero fixture-shop rows with the baseline expectation
   recorded (`…/h3d-authz-fixture-seed.sql`).
3. Restoration: assert fixture-shop rows remain zero after teardown, and include the
   count/signature in restoration evidence.
4. `catalog-manifest.mjs`: distinguish FK-reachable tables from extra monitored
   surfaces so the manifest stops overstating graph reachability.
5. Document `camera_rate_limit_buckets` as non-shop-scoped with no FK. It does not
   appear anywhere in the current revision.

### Allowed scope

Only: `tools/shared-runtime/h3d/h3d-live-runner.mjs` and H3D offline tests/tooling;
`…/fixtures/h3d-authz-fixture-seed.sql`; `…/fixtures/h3d-authz-fixture-teardown.sql`;
catalog expected/tooling; H3D evidence and the Operator Pack sections needed to make
the corrected state machine executable.

### Prohibited

PS01 business/schema code; H3E/H3F/H4/H5; merge; fixture seed or teardown SQL
execution; Auth identity create/delete; runtime grant INSERT/DELETE; Custom Access
Token hook changes; H3D live run; rollback-only/two-session DML validation; any
Production mutation; discarding or rewriting the preserved work.

### Acceptance checks

- `npm run selftest` PASS
- `node h3d/sql-static-check.mjs` PASS
- `node tools/shared-runtime/h3d/catalog-manifest.mjs --verify <expected-manifest.json>`
  PASS — **only** if the SELECT-only LAB credential is already present in the Mac
  session. If it is not, report that and stop; never place a credential into repo
  files, argv, or evidence.
- worktree-commit selftest proving `houseCommit()` equals `git rev-parse HEAD`
- receipt-chain and dead-end tests PASS
- manifest-hash tamper test PASS
- `camera_access_audit` scope test PASS
- `git diff --check`, secret/PII scan, exact diff review
- LAB state unchanged: fixture/business/support rows 0, `runtime_token_grants` 0,
  `auth.users` unchanged
- House pushed at parity `0/0`; PS01 untouched

### Expected evidence

Exact commit SHA; changed-file list; allowed-scope proof; gate command outputs;
evidence paths and hashes; dirty-state classification; remote parity; no secret
exposure.

### Commit shape

One commit on `work/house-h3d-h5-20260909` containing the inherited S1–S4 work plus
the S5 completion. Do not split the inherited work into a separate "already done"
commit — it has zero review, so Codex must review all of it as one revision. The
preserve ref and the local bundle are the rollback path.

### Owner authority

None required to begin or complete `H3D-S`. The next hard stop is
`OWNER-CP-H3D-A1`, which comes after Codex review and your own check.

## 5. Codex review focus for this unit

Beyond ordinary review, direct Codex at these specifically:

- Whether the S1 test required by the static-acceptance brief actually exists — a
  test proving `houseCommit()` equals `git rev-parse HEAD` **against the real
  worktree shape**, not a mock. The outgoing controller could not confirm it.
- Whether `receiptFresh()`'s `required` table is applied at every call site, so no
  path can pass `undefined` for a binding and silently re-open the S2 skip.
- Whether `assertChainTransition()` is unavoidable — i.e. no code path writes a
  receipt without passing through it.
- Whether teardown genuinely passes the same verified bytes it hashed, with no
  window between `assertManifestUnchanged()` and `runPsqlFile()`.
- Whether the S5 lock set ordering can deadlock against the existing lock sequence.

## 6. Loop rules — unchanged, plus one correction

`CLAUDE CONTROL → AGY EXECUTE → CODEX REVIEW/FIX → CLAUDE CHECK → CONTINUE`

- Codex mutation → outcome is `FIX_APPLIED_AWAITING_CLAUDE_REVIEW`, never a final PASS.
- Claude mutation → the mutated SHA goes back to Codex for independent review.
- Any mutation invalidates review on the prior SHA. No reviewer shopping.
- Do not run two writers against the same worktree.

**Gate correction (learned this run).** The broad secret-scan pattern in
`BRIEF-MAC-PRE-01-DIRTY-STATE-PRESERVATION-2026-09-22.md` §4 included the bare token
`password`, which produced a false positive on legitimate redaction and runtime
code and cost two round trips. From this unit forward the **blocking** gate is the
assignment-shape pattern:

```
(password|passwd|pwd|secret|token|apikey|api_key|access_key|private_key)[a-z_]*[[:space:]]*[:=][[:space:]]*['"][^'"]{8,}['"]
```

The broad pattern is retained as **advisory only**. A non-zero advisory hit must be
classified — with string literals ≥10 chars masked — and recorded, but it does not
by itself block.

## 7. Owner checkpoints — hard stops, unchanged

`OWNER-CP-H3D-A1`, `OWNER-CP-H3D-LIVE`, `OWNER-CP-H3E`, `OWNER-CP-H4`,
`OWNER-CP-HOUSE-A`.

No silence or timeout is approval. No Production mutation is authorized.

## 8. Remaining stage path

`H3D-S → BATCH-H3D-S → OWNER-CP-H3D-A1 → H3D-A1 → BATCH-H3D-A1 →
OWNER-CP-H3D-LIVE → H3D-LIVE → BATCH-H3D-LIVE → OWNER-CP-H3E → H3E → H3F →
BATCH-H3-CLOSE → OWNER-CP-H4 → H4 → BATCH-H4 → H5 → BATCH-H5-HOUSE-A →
OWNER-CP-HOUSE-A`

BK01 stays quarantined and must not be used as the disposable H4 product. Only after
a durable Owner `HOUSE-A PASS` may the BK01 return package be produced.

## 9. Audit trail — what the outgoing controller did

- Read the brief, manifest, and Source of Truth; measured both Windows worktrees and
  the remote; established that no Mac commit had ever been pushed since `d6707c0`.
- Declared `PRE-01 BLOCKED` rather than switching execution to the cleaner Windows
  copy, which brief §2 forbids.
- Issued `BRIEF-MAC-PRE-01-DIRTY-STATE-PRESERVATION-2026-09-22.md` (commit `8cd9a21`).
- Authorized `refs/preserve/*` creation and the push after classifying the secret-scan
  hit as a gate-design false positive; recorded the deviation.
- Fetched `db19abd`, verified blob and parent independently, classified S1–S5, and
  closed PRE-01 (commit `0bee492`).
- Wrote no code and mutated no execution branch. All controller output is docs on the
  planning branch.

Controller state now lives entirely in the planning-branch documents. There is no
undocumented context on the Windows side.
