# R2 FOCUSED ROLLOUT AMENDMENT — CODEX VERDICT (recorded)

Task: `WSTERA-CONTROL-TRUTH-SYNC-001` · Workflow `WF-DEV-01 v1.3.0 / LONG_RUN`
Reviewer: `agent-codex` via `codex exec -s read-only -m gpt-5.5`
Reviewed: 2026-09-23 (Asia/Bangkok)
Raw transcript: `D:/AI-Workspace/runtime/hermes-native/workspace/wstera-cts-001/lane-a-expand-contract/R2-AMENDMENT-CODEX-VERDICT.txt`
Raw exit: `CODEX_EXIT=0` · tokens used 167,594

## Verdict

```text
VERDICT: APPROVED_WITH_FINDINGS
FILES_MUTATED_BY_REVIEWER: none
```

This is a **source/revision verdict only**. It is NOT deployment approval, NOT DB-migration
approval, NOT runtime-skill installation approval, and NOT live behaviour evidence.

## Revisions the reviewer inspected

| Repository | Revision |
|---|---|
| `hub-web` R2-approved source (parent of Revision A) | `fde38f64e6bd72de9af549a88777bf276933c051` |
| `hub-web` Revision A / EXPAND (`A_EXPAND_REV`) | `dfcb4be4ac8b488ef740e2147f83b5c19251fbd8` |
| `hub-web` Revision B / CONTRACT (`A_CONTRACT_REV`) | `dd9a629eaa4e75c29fe0b8aa31698b5f9c4e1dae` |
| planning / evidence | `ffd4aee4a11d76221f6c5cc71c2db1ce30df4c25` |
| `wstera-workflows` (declared unchanged) | `fb84b9d6517186246dacde2871937d98c52ec7a6` |

## Reviewer's answers to the focused questions

1. **Old 17-argument client after EXPAND, before deploy** — YES. 0009 deliberately retains the
   17-argument overload (`0009:37-41`, `:568-589`).
2. **New 19-argument client after deploy, before CONTRACT** — YES, assuming 0009 is applied. The
   19-argument function is created and granted to `service_role`; the 17-argument path remains until
   CONTRACT.
3. **Contract only after the new Worker is proven live** — the source supports that ordering, but SQL
   alone cannot prove liveness; `0010:30-38` documents the hard boundary, and the production operator
   gate must enforce it.
4. **Runner applies only 0009 from `A_EXPAND_REV`** — **no / UNVERIFIED as written.** The source split
   is correct (no 0010 exists at `dfcb4be`), but the brief's stated runner is not a valid proven
   runner in this repo — see F-OP-01.
5. **Runner applies only 0010 later** — **no / UNVERIFIED as written**, for the same reason; an
   exact-file reviewed apply mechanism could satisfy it by operator discipline, but no ledger-backed
   runner exists.
6. **Rollback safe on both sides** — YES, conditionally. Before CONTRACT, re-pointing to the old Worker
   is safe because the 17-argument path remains. After CONTRACT, an old-client rollback is unsafe
   until the 17-argument function is restored from 0006 and verified live (`0010:78-106`).
7. **F1 (ungated overload bypass) status** — closed by the full two-revision source design, but only
   **after CONTRACT**; during EXPAND/deploy the 17-argument overload is intentionally retained as the
   compatibility bridge, and it is not live-closed until 0010 is applied after live Worker proof.
8. **Migration-runner finding** — reviewer **agrees**: the brief's stated runner does not exist as an
   executable repo contract, and the finding is correctly classified as **blocking for the operator
   runbook, not blocking for the source revisions**. Cited: brief `:22`, `:117-118`; `package.json:16`;
   `0009:11-13`; `0010:14-17`.
9. **Preserved invariants — all preserved**, per invariant:
   - product identity — preserved (`0009` keeps the conflict checks and adds scope gates);
   - revision N→N+1 — preserved (`0009:402-407`);
   - event-id idempotency — preserved (`0009:322-336`);
   - event-id/payload conflict — preserved (`0009:331-355`);
   - single-transaction atomicity — preserved in RPC source; `0010` requires single-transaction apply,
     but the operator mechanism remains a runbook issue;
   - Owner Inbox effect identity — preserved (`0009:496-525`);
   - service_role-only posture — preserved (`0009:542-566`); `0010` performs no grant/revoke and only
     drops the 17-argument overload.
10. **Reviewer mutation** — NO; the reviewer mutated no reviewed file.

**Falsification judgment:** adequate for the offline/source invariants of 0010 the rollout depends on
(precondition presence, DROP arity, no unrelated DDL/DML, postcheck ordering, 42883 recovery
documentation). Unfalsified because they require live/operator evidence: actual DB catalog state,
actual transactionality of the selected apply mechanism, actual Worker-live proof, and the missing
migration-runner/ledger sequencing property.

## Findings

### F-OP-01 — BLOCKING for the production operator runbook · NOT blocking for the source revisions

Evidence the reviewer cited:

- brief `BRIEF-RESUME-LANE-A-CONTROL-TRUTH-EXPAND-CONTRACT-2026-09-22.md:117-118` — the stated
  production runner is `drizzle-kit migrate`;
- brief `:246` — 0009 is "already recorded" so only 0010 should apply;
- `package.json:16` — the repo exposes only `db:push` = `drizzle-kit generate && drizzle-kit migrate`;
- `0009_work_scope_identity.sql:11-13` and `0010_retire_legacy_work_event_rpc.sql:14-17` — both state
  there is no `__drizzle_migrations` journal and that `db:push` must not be used.

Required before a production window: replace the brief/runbook runner premise with the actual approved
apply mechanism and the ledger/evidence rule. **No change is required to the reviewed source
revisions.**

This matches, independently, the finding the commander raised as
`FINDING-MIGRATION-RUNNER-CONTRADICTS-BRIEF-2026-09-23.md`.

## Gates: reviewer-verified vs UNVERIFIED

Independently verified by the reviewer:

```text
npm run check              -> exit 0
git diff --check           -> clean
check_expand_static.py     -> 10/10
check_contract_static.py   -> 11/11
bundle-equivalence method  -> sufficient (non-migration/non-test diff fde38f6..dd9a629 is EMPTY)
```

UNVERIFIED by the reviewer, and therefore still commander-run evidence only:

```text
npx vitest run             -> UNVERIFIED (sandbox failed with spawn EPERM while Vitest/esbuild loaded config)
28 files / 497 tests       -> UNVERIFIED by the reviewer
esbuild bundle hash        -> not independently regenerated (method judged sufficient)
```

Note for the record: this is the same sandbox limitation recorded at the earlier R2 review
(`host-tooling-and-git-rules.md` §10.3 T15). The commander's suite runs are commander-produced
evidence, not reviewer-reproduced.

## Reviewer non-claims

- not deployment approval;
- not DB-migration approval;
- not approval to run `drizzle-kit migrate`, `db:push`, or any live mutation;
- not runtime-skill installation approval;
- not live behaviour evidence;
- does not approve the production runbook until F-OP-01 is resolved.

## Post-review immutability check (commander-measured)

| Repository | HEAD | dirty | migration hashes |
|---|---|---|---|
| `hub-web` | `dd9a629` | 0 | 0009 `8f88a7d1…` · 0010 `3963c6a6…` — unchanged |
| planning | `fb24204` | 0 | — |
| `wstera-workflows` | `fb84b9d` | 0 | — |

`git ls-files -s drizzle/migrations/` digest `538f873b164abb180bf4d249289b1f1e949caa5c9cd5e3b4c2f7df3bfa1cf361`
— the reviewed tree was not mutated by the review.
