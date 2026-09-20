VERDICT: SENIOR_REMEDIATION_REQUIRED

B3-4D ASSESSMENT: production defect — `expect(retried.grant.id).toBe(successorId)` asserts the SAME planted successor. `successorId` is captured from the inserted row, not hard-coded. Receiving `grant-0009` instead of `grant-0008` proves retry minted a new successor.

INTENT-MARKER CHARACTERISATION: correct for both — revoke uses `operation.inserted` as completion evidence; reissue uses the pre-existing successor row/link as completion evidence. In both cases, intent existence is not durable completion.

CORRECT FIX PER HALF: revoke — completion is `grantDone && bindingDone`; remove `operation.inserted &&` from `service.ts:1033`. Reissue — when the successor already exists, call `finishReissueIntent`/`completeReissue` for that successor; do not mint another row. Completion requires predecessor linkage, successor binding, audit, and delivery durable.

SUFFICIENCY CHECK: yes for the one-audit-entry assertion. Dropping `operation.inserted` is sufficient because a fully complete end state returns before the completion/audit branch. The partial-completion branch must retain its existing conditional audit behavior so only the retry that completes missing state writes the single audit entry.

DECISION CLASS: SENIOR_REMEDIATION_REQUIRED — two ordinary rounds are exhausted, one packet contained a factual misdiagnosis, and this is a correctness-critical intent-versus-completion boundary in an idempotent/auditable capability.

REMEDY SHAPE: `service.ts`: remove `operation.inserted` from the revoke dedup predicate; preserve end-state-gated audit behavior; route existing reissue successors through `finishReissueIntent` and make full-end-state retries audit-free and delivery-idempotent. `fulfillment.test.ts`: import `deriveOperationKey`, remove `TEMP-DEBUG`, retain the planted-successor assertion. `repository.ts`: no structural change indicated. Pass B3-4c, B3-4d, repeated revoke with exactly one audit, repeated reissue with one successor/one audit, full Vitest, and `npx tsc --noEmit`.

WORKER REFUSAL ASSESSMENT: correct — Hermes’s id-ordering diagnosis was factually wrong, and changing the assertion to the returned ID would make it tautological. Escalation instead of a third ordinary repair was correct under the Decision Gap contract.

B3 FINDINGS ASSESSMENT: the reviewer’s findings were sound. Nothing indicates B3-4d was a bad finding; its assertion detects the real production invariant. The revoke finding is independently confirmed by `operation.inserted` at `service.ts:1033`.

EVIDENCE READ: read the four requested records in order; inspected `service.ts` revoke, `finishReissueIntent`, `completeReissue`, and `reissue`; inspected the relevant tests and repository symbols; `npx tsc --noEmit` exited 0; `npx vitest run` could not start because the environment returned `spawn EPERM`; no files were modified.

UNTESTED AREAS: full Vitest execution; runtime confirmation of B3-4c/B3-4d after current edits; live PostgreSQL partial-failure behavior; concurrency races; real storage-provider retry/idempotency; post-handoff persistence recovery; test-file typecheck coverage.