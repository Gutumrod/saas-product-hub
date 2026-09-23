# OWNER DECISION GATE CONTRACT — LANE B

Date: 2026-09-23
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Provenance: proposed in the Owner identity (commit `959605b`, 2026-09-23 11:06 +0700)
**before** Sol review; subsequently reviewed by Sol
(`SOL_GATE_VERDICT = READY_TO_LOCK_WITH_AMENDMENTS`, amendments applied 2026-09-23).
**Sol is not the author of the original revision.**
Execution controller: Hermes
Execution system: Canonical Agent Relay + WSTERA Control Sync
State: `SOL_REVIEW_PASS / OWNER_ONE_TIME_APPROVAL_REQUIRED`

## 1. Purpose

This contract defines the authority boundary for the remainder of Lane B LONG_RUN.

Hermes is NOT an authority-decider. Hermes may only orchestrate, dispatch, gate, persist,
integrate, and continue according to this contract and the locked technical briefs.

After the Owner approves this contract once, Hermes MUST NOT stop for Owner input outside
the explicit `OWNER_DECISION_REQUIRED` gates defined here.

Silence is never approval at an Owner gate. Outside an Owner gate, silence is not a reason
to stop an otherwise pre-authorized technical workflow.
## 2. Precedence and role definitions

For authority/routing questions in Lane B, precedence is:

1. the canonical Agent Relay `SKILL.md` for **Relay execution and safety invariants** — this
   Lane-B contract does **not** claim precedence over it, and governs task-specific
   authority/routing only **within** those canonical Relay constraints;
2. explicit later Owner ruling that names this task, for task-specific authority/routing
   within the canonical Relay execution/safety constraints (or together with an explicitly
   authorized change to those constraints);
3. this Owner Decision Gate Contract after one-time Owner approval;
4. active Lane-B resume/work-unit brief;
5. prior Lane-B routing/decision documents;
6. worker/reviewer prose.

Where this contract and the canonical Relay skill differ on Relay execution behaviour
(admission/provenance, named-executor invariant, context modes, independent-QA contract,
failure-recovery ladder, Kanban mechanics), **the canonical skill wins** and this contract
governs only the task-specific authority/routing decision.

Technical facts from older evidence remain valid when not superseded by measured reality.

Roles:
- **Owner** — final authority for live-risk, architecture, scope, cost, and final House acceptance.
- **Sol** — technical governance authority below Owner; verifies evidence, resolves bounded ambiguity,
  classifies gates, and may release continuation when no Owner gate is crossed.
- **Hermes** — LONG_RUN orchestrator/state holder/integration controller; never invents authority.
- **OpenCode** — ordinary implementation worker.
- **Qwen** — bounded specialist/testing/remediation support.
- **Codex** — independent reviewer/classifier; cannot self-approve a revision it mutates.
- **Claude** — difficult remediation only after the Relay/Codex escalation contract permits it.
- **AGY** — UI/UX-only ordinary work; not a Lane-B backend/database/security worker.

## 3. Authority state vocabulary

Every transition MUST be classified as exactly one of:
- `PRE_AUTHORIZED_CONTINUE`
- `CODEX_REVIEW_REQUIRED`
- `SOL_VERIFY_OR_RESOLVE`
- `OWNER_DECISION_REQUIRED`
- `BLOCKED_TECHNICAL_REMEDIATION`
- `BLOCKED_HARD_STOP`

Unknown/ambiguous authority defaults to `SOL_VERIFY_OR_RESOLVE`, not Owner escalation.
## 4. PRE_AUTHORIZED_CONTINUE — Hermes may continue without asking Owner

Hermes is pre-authorized to perform and advance all of the following when the active brief allows them:

- read/reconcile repo, worktree, runtime, board, Control Sync, and evidence state;
- classify dirty/untracked work without destructive cleanup;
- run Relay/Control Sync/runtime/provider preflights and canonical repair procedures already locked in source;
- dispatch ordinary work through the locked Relay role map;
- execute source-only implementation, tests, falsification, evidence preparation, docs sync, and review preparation;
- run bounded technical remediation inside already-authorized paths/contracts;
- create/update task manifests, handoffs, evidence, status records, and Control activity truth;
- mechanically stage, commit, push, and verify parity on the two locked Lane-B branches;
- freeze/re-freeze the candidate revision pair and its manifest;
- close child work units/stages whose acceptance evidence and required reviews are complete;
- advance automatically to the next pre-authorized technical stage until a Codex, Sol, or Owner gate is reached.

These actions are not Owner decisions and MUST NOT create Owner Inbox requests merely because they occur.

## 5. Commit / push and repository integration authority

For this task Hermes is pre-authorized as the mechanical integration owner on:

- planning: `work/house-lane-b-longrun-plan-20260922`
- execution: `work/house-h3d-h5-20260909`

Hermes may stage only the declared allowed files, run `git diff --cached --check`, secret scan,
commit, push, and prove local HEAD = remote HEAD.

Forbidden without Owner approval: force push, destructive reset/clean/rebase, merging the two
branches merely to manufacture one SHA, unrelated branch mutation, or widening write scope.
## 6. CODEX_REVIEW_REQUIRED

Codex independent review is mandatory before continuation when any of these occurs:

- a frozen candidate pair is ready for package-level review;
- a security/auth/credential/privilege/isolation contract is newly created or materially changed;
- a difficult remediation was authored by Claude;
- a reviewer or fixer mutated the exact revision under review;
- a source change can alter an isolation/security gate relied on by a later live checkpoint;
- the run is about to claim `HOUSE-A REVIEW READY` from a new exact candidate pair.

Codex review is bound to exact immutable inputs. For Lane B the review identity is the pair:

`(planning_sha, execution_sha)`

plus the candidate manifest hash. If either SHA changes, the prior review cannot be inherited.

Codex PASS does not grant live-mutation authority and does not replace Sol or Owner gates.

## 7. SOL_VERIFY_OR_RESOLVE

Sol may verify, resolve, and release continuation without Owner input when the issue does NOT change
architecture, routing, security policy, product/business contract, live-mutation authority, or cost policy.

Sol may resolve:
- stale or contradictory documentation against measured reality;
- worker/reviewer claims that conflict with the actual diff, source, runtime, or evidence;
- whether a failure is the same Issue Fingerprint or a materially new root cause;
- whether an allowed-scope technical repair satisfies the locked contract;
- whether a stage gate is complete from evidence;
- candidate-pair binding, revision/evidence mismatch, and review invalidation;
- bounded ambiguity in test method, evidence format, file organization, or execution ordering;
- whether a technical blocker can return to ordinary remediation or must enter Codex review.

Sol may issue `SOL_RESOLVED_CONTINUE` or `SOL_GATE_PASS`.
Sol may not use this authority to silently widen the task.
## 8. OWNER_DECISION_REQUIRED — the only mandatory Owner stops

Hermes MUST stop and request explicit Owner approval only for:

1. `OWNER-CP-H3D-A1` — first authorized H3D-A1 live/rollback-only DML or ephemeral writable-role creation.
2. `OWNER-CP-H3D-LIVE` — H3D-LIVE Auth/grant/hook/live mutation.
3. `OWNER-CP-H3E` — live role-retirement / shared-runtime authority mutation.
4. `OWNER-CP-H4` — disposable-product live/platform mutation.
5. `OWNER-CP-HOUSE-A` — final House acceptance / `HOUSE-A PASS`.
6. any Production mutation.
7. any irreversible/destructive action with no already-reviewed rollback path.
8. secret exposure requiring rotation, credential replacement, or account-level intervention.
9. architecture, routing, contract, security invariant, product/business rule, or task-scope expansion.
10. new paid service, new premium route, new model/provider/account, or materially increased premium usage not already authorized below.
11. unresolved cross-product/shared-runtime collision where proceeding could mutate overlapping live infrastructure.
12. no safe technical remediation path remains inside locked authority.

No other issue may be converted into `OWNER_DECISION_REQUIRED` merely because a worker,
reviewer, runtime, test, or tool failed.

## 9. Premium/model/provider authority

Pre-authorized premium/reviewer use for this task is limited to:
- required Codex independent review/classification gates;
- one bounded Claude difficult-remediation dispatch only after Codex explicitly returns
  `SEND_TO_CLAUDE` under the locked Relay escalation ladder.

Hermes/workers MUST NOT add, substitute, or increase premium/model/provider routes on their own.
No silent model substitution, provider fallback, account switch, or quota-expanding retry is allowed.

Any premium use outside the two routes above is `OWNER_DECISION_REQUIRED`.
## 10. Blocker policy

### 10.1 Remediation may continue automatically

Classify as `BLOCKED_TECHNICAL_REMEDIATION` and continue within the Relay recovery ladder for:
- test/lint/typecheck/build failures inside allowed scope;
- OpenCode/runtime/provider drift with an existing canonical repair contract;
- worker invocation or tooling failure where the locked route has a safe repair path;
- deterministic gate failure;
- stale generated evidence or docs;
- bounded implementation defects;
- reviewer findings that do not require a new architecture/security/scope decision.

Per stable Issue Fingerprint:
ordinary repair #1 → exact gate → ordinary repair #2 → exact gate → Codex classify.
No ordinary repair #3. Claude may run only after `SEND_TO_CLAUDE`.

### 10.2 Hard stop

Classify as `BLOCKED_HARD_STOP` only when:
- §8 Owner gate is reached;
- evidence of secret exposure exists;
- destructive/unrecoverable mutation occurred or is required;
- scope/architecture/routing/security contract must change;
- live-infrastructure collision cannot be made safe;
- exact revision/evidence cannot be reconstructed safely;
- all authorized remediation routes are exhausted.

A hard stop must name the exact §8 condition or exhausted route.

## 11. Board, docs, Control Sync, and closure authority

Hermes is pre-authorized to:
- update stage/work-unit board states after evidence-backed transitions;
- sync docs/manifests/handoffs that reflect already-measured truth;
- emit Control Sync activity/state allowed by the installed contract;
- close child cards/work units after their acceptance + required review gates pass;
- request review / mark `HOUSE-A REVIEW READY` when the technical package is complete.

Hermes MUST NOT mark final `HOUSE-A PASS` or top-level Owner acceptance by itself.
## 12. Automatic closure vs Owner acceptance

**Automatic closure applies only to evidence-backed technical stages, child cards, and work
units** — for example U-R1/U-R2/U-R3, runtime hardening, evidence normalization, and
source-only remediation. Such a unit MAY close automatically when all are true:
- scope is source/test/evidence/tooling/docs only;
- no Owner gate in §8 is crossed;
- deterministic acceptance checks pass;
- required Codex/Sol gates pass;
- exact revision/evidence is persisted;
- no open blocker remains.

**Hermes MUST NOT mark the governing Lane-B task, the Secretary task, or any
Owner-acceptance task `done`.** The governing task
`HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001` (and its Secretary counterpart) may advance through
technical completion to `HOUSE-A REVIEW READY`, but:

- `HOUSE-A PASS` requires `OWNER-CP-HOUSE-A`;
- the governing Lane-B / Secretary task is closed **only** by explicit Owner acceptance;
- requesting review (`READY_FOR_GPT_REVIEW` / `HOUSE-A REVIEW READY`) is not closure.

Any child task whose explicit acceptance contract itself says Owner acceptance is required
remains Owner-gated even if its implementation is technically complete.

## 13. Forbidden self-authority

Hermes, Relay workers, reviewers, and specialists MUST NOT independently:
- change the architecture;
- change the locked routing/role map;
- rewrite this authority contract;
- expand allowed scope or write paths;
- weaken security/isolation/negative controls to obtain PASS;
- merge planning/execution branches merely for convenience;
- invent a new live checkpoint or remove an existing one;
- reinterpret a Production/LAB boundary;
- add a new premium/model/provider route;
- convert technical failure into Owner escalation without a §8 basis;
- convert worker/reviewer prose into canonical truth without evidence.

Any such need routes to Sol first unless §8 explicitly requires Owner.

## 14. Activation and terminal marker

This contract becomes canonical only after one explicit Owner approval of this exact revision.

Required approval meaning:
- Owner approves the authority matrix in §§4–13;
- Hermes may thereafter continue LONG_RUN without Owner interruption except §8;
- prior Lane-B documents remain technical/history inputs but cannot create extra Owner stops.

Upon approval, canonical authority state is:

`SOL_DECISION_GATES_LOCKED`

Any later change to §§4–13 requires a new explicit Owner approval.
