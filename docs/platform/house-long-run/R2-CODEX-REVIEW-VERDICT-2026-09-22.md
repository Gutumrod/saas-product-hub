# R2 — CODEX INDEPENDENT REVIEW VERDICT

Review checkpoint: **R2** (after T5) · Workflow `WF-DEV-01 v1.3.0 / LONG_RUN`
Reviewer: **agent-codex** (`codex-cli 0.147.0`, sandbox `read-only`, model `gpt-5.6-sol`)
Reviewer role: independent reviewer — read-only, no repair authority
Reviewed at: 2026-09-22 (Asia/Bangkok)

## Verdict

```text
R2_VERDICT=CHANGES_REQUIRED
```

## Exact revisions reviewed

| Repo | Branch | Exact commit |
|---|---|---|
| hub-web | `work/wstera-control-truth-sync-001` | `fde38f64e6bd72de9af549a88777bf276933c051` |
| wstera-workflows | `work/wstera-control-truth-sync-001-t4` | `8afc8d7aac118f3e96c49e536e74f7de8010ac9d` |

The reviewer verified SHA, branch, clean tree and remote parity for both before reviewing. Both
trees were **unchanged after the review** — confirmed by the commander's pre/post snapshot of `HEAD`
plus a hash of `git ls-files -s` for each worktree (`IDENTICAL` pre vs post).

## Findings by scope

**PASS (11 items)** — revision binding; canonical discriminator (`runtime-mode.ts` literal form,
imports nothing, no `ENV.isProduction` anywhere in `server/`); closure-constrained command checks
(inlined identical literal, allowlist **not** widened); no-competing-discriminators judgement; cross-endpoint
replay resistance with constant-time comparison; raw-body-before-parse on both entry points; refusal
status mapping (none maps to 2xx); decision preservation; decision scope enforcement; sender detail
bound pinned at source; existing activity/work signing unchanged; persist-before-ack and
fingerprint-conflict behaviour.

The reviewer's judgement on the discriminator split, verbatim in substance: one zero-import helper
for ordinary readers plus the same literal inlined in the import-constrained command closure is *one
semantic discriminator expressed through two mechanically necessary access forms* — not competing
production decisions.

### FAIL — 1 item (the material defect)

**Consume-exactly-once is NOT enforced.** The reviewer found that the ledger schema has **no
application marker** (`control_sync.py:127-139`) and that `_apply_decision_consumption()` performs
**no write**, returning `applied: true` on every call for the same acknowledged row (`:623-641`).
Consequence: after a restart, or simply a repeated command, the same decision can again be reported
as newly applied, allowing orchestration to re-advance. No Python test covers decision-ledger
behaviour; the 21 tests end at line 423 with T4 coverage.

**Commander reproduction — the finding is correct.** Executed against a temp ledger:

```text
call1: {'ok': True, 'applied': True, 'decision_id': 'oi-1', 'selected_option': 'approve', 'consumed': True}
call2: {'ok': True, 'applied': True, 'decision_id': 'oi-1', 'selected_option': 'approve', 'consumed': True}
call3: {'ok': True, 'applied': True, 'decision_id': 'oi-1', 'selected_option': 'approve', 'consumed': True}
ledger columns: [decision_id, task_id, root_task_id, selected_option, fingerprint, first_seen_at,
                 acknowledged_at, ack_status, ack_error, request_task_id, request_root_task_id]
has an application marker column: False
```

### UNVERIFIED — infrastructure, not work quality

The reviewer could not execute three gate families because this session's read-only sandbox could not
create child processes (`spawn EPERM`) and exposed no writable temporary directory:

- hub-web `npx vitest run` — exit 1 before collection, 0 tests collected;
- wstera-workflows `python -m unittest discover` — 21 tests discovered, **all 21 errored** on
  `tempfile.TemporaryDirectory()` having no writable location;
- `npx wrangler deploy --dry-run` — no bundle emitted, so the build-time discriminator claim was not
  reproduced by the reviewer.

`npm run check` and `git diff --check` **did** run and returned exit 0.

The commander's own runs of those same gates pass in a normal shell; the reviewer's failures are
environmental. They are recorded as UNVERIFIED rather than converted into passes, and the gates
should be re-run in a child-process-capable environment.

## Counter-evidence / not reproduced

- hub-web "28 files, 490 tests" — not reproduced (`spawn EPERM`).
- wstera-workflows "21 tests, OK" — not reproduced (no writable temp).
- Wrangler dry-run bundle claims — not reproduced.
- The raised-limit mutation — not executable without a writable out-of-repo scratch area; the
  independent literal pin was confirmed by source inspection only.
- No live endpoint, database, secret or reviewed-tree mutation was used.

## Document accuracy — accepted as findings against THIS run's own reporting

The reviewer judged three claims in the T5 packet **overstated**, and the commander accepts all three:

1. §3 claimed "repeated poll after acknowledged consumption cannot re-advance the run — PASS". This is
   **overstated**: polling suppresses acknowledged rows, but the exposed `--apply-consumption` path has
   no durable applied-once state and returns `applied: true` repeatedly.
2. §5.2 described the sender as a durable consumption ledger, but the 11 documented columns omit any
   application marker: acknowledgement durability is implemented, **consumption/application exactly-once
   is not**.
3. §2 said every worker PASS was independently reproduced. The reviewer could not reproduce the gates,
   and there are **no Python decision-ledger tests** at all. The 37 TypeScript contract tests copy the
   sender's rules but are not a substitute for executing the Python ledger/application lifecycle.

The disclosed orchestrator/commander failures in the T3 packet were judged candid; the missing
applied-once state and the missing Python decision tests are recorded as **material omissions from the
T5 accuracy narrative**.

## Residual risk for the Owner

- **Do not authorize production activation** of the revised Control Sync decision consumer until
  durable application state plus a restart/repeat regression test demonstrate exactly-once advancement.
- Re-run all deterministic gates and the Wrangler dry-run in an environment that permits child
  processes and writable scratch directories.
- The installed runtime skill remains explicitly unsynchronized; this verdict is **not** installation
  or deployment authorization.

## Boundary of this verdict

A read-only **source/revision** verdict for the two exact SHAs above. **Not** production approval, not
deployment approval, not DB-migration approval, not runtime-skill installation approval, and not
live-behaviour evidence.

## Remediation

Routed under `RUN-MANIFEST` §2 (`reviewer_remediation_attempts`). Remediation #1 targets the
application-marker defect: add a durable `applied_at` marker written under a conditional UPDATE so the
database decides the winner, make a repeat call report `already_applied`, and correct the contract
document so it no longer implies a guarantee the code does not provide. A Python decision-ledger test
is required in the same remediation arc; a source fix without a restart/repeat regression test does not
close the finding.

## Reviewer harness note (recorded for honesty)

R1 recorded that this host's codex restricted token sandbox could not spawn child processes
(`0xC0000142`). At R2 the sandbox ran successfully in `read-only` mode, which is a stronger boundary
than R1's prompt-only boundary — but a **plain** probe command succeeded while **child-process-spawning
gates** (`vitest`, `unittest`, `wrangler`) failed with `spawn EPERM`. The boundary therefore held, and
the reviewer honestly marked the affected gates UNVERIFIED instead of passing them. The first R2
attempt additionally failed because the commander's own prompt was self-contradictory (a read-only
boundary combined with an instruction to mutate a gate temporarily); the reviewer refused to resolve a
contradiction on its own authority and said so, which was the correct behaviour. The prompt was
corrected and the review re-run.
