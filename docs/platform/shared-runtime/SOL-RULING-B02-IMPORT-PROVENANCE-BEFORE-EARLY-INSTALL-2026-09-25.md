# SOL RULING — B0.2 IMPORT PROVENANCE BEFORE ANY EARLY INSTALL

Date: 2026-09-25
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Input blocker: `BLOCKER-B02-CIRCULAR-SCOPE-GUARD-2026-09-25.md`
State: `SOL_RULING / ONE_BOUNDED_DIAGNOSTIC_AUTHORIZED`

## 1. Ruling

Do **not** choose Owner options A, B, C or D yet.

The premise that B0.2 *must* install B-3 before classification is not proven.

Measured after the blocker:
- executing/importing from the canonical scripts directory resolves
  `direct_external_executors.__file__` to the canonical source;
- that canonical module contains `HARNESS_EVIDENCE_ROOTS = ('.secretary-relay',)`;
- the same probe against the installed scripts directory resolves the installed unfixed module.

Therefore attempts labelled "canonical driver" do not yet prove that an explicit absolute-path
execution of the canonical driver is using the installed adapter.
## 2. Authorized attempt 5 — diagnostic only

Authorize exactly one new attempt because there is a new, testable hypothesis:

> attempts 3–4 did not actually execute the canonical driver by absolute script path, even though
> their working directory was changed.

The attempt must:

1. invoke the exact absolute canonical driver path:
   `D:\AI-Workspace\runtime\hermes-native\hermes-native-vault\skills\kanban-external-agent-dispatch\scripts\relay_execution_driver.py`
2. use the confined scanner-clean B0.2 workspace;
3. before dispatch, record:
   - `relay_execution_driver.__file__`
   - `direct_external_executors.__file__`
   - SHA256 of both loaded files
   - `HARNESS_EVIDENCE_ROOTS`
4. prove the loaded direct executor is the canonical repaired file;
5. use `PYTHONDONTWRITEBYTECODE=1`;
6. perform no install and no live-runtime mutation;
7. perform no scanner remediation;
8. produce the B0.2 classification only if the stage passes through the normal Relay driver.

This is a read-only provenance experiment, not another repair attempt.
## 3. Outcome handling

### If attempt 5 succeeds

- admit the Codex classification only if provenance validation passes;
- if verdict = `SEND_TO_CLAUDE`, continue with the already-approved Claude-only scanner remediation;
- do not install B-3 early;
- preserve the current source-first install order.

### If attempt 5 still fails on `.secretary-relay`

The failure record must prove the module/file actually executing at the failing guard site.

Do not infer this from cwd.

Record:
- executable/script path;
- imported module path;
- imported module SHA256;
- exact guard function source/hash;
- exact failing call site.

Only after that proof may Owner Option A be considered.

### If a different fingerprint appears

Stop and classify it separately under the Lane-B repair ladder.
Do not spend another attempt by analogy.

## 4. Existing Option A–D disposition

- A: **DEFERRED**, not rejected. Eligible only if attempt 5 proves the installed runtime is an unavoidable execution dependency.
- B: **REJECTED for now** because it discards Relay provenance.
- C: **not selected**; Lane A may continue independently anyway under the dual-lane brief.
- D: **REJECTED for now** because it would put Claude before the required admissible classification.

## 5. Separate finding

The non-BUILD guard not consulting declared `write_scope` remains an open follow-up.
B0.2 has been reshaped to stdout-only / `write_scope: []`, so this finding does not justify
changing the B0.2 sequence now.

Do not fold that separate defect into attempt 5.

## 6. Worktree safety

Do not archive any Relay card that owns or points at a shared/reused worktree until its cleanup
semantics have been proven safe. T78 has already removed a worktree twice.

For this attempt use a disposable/confined workspace whose loss cannot destroy unpushed work.
