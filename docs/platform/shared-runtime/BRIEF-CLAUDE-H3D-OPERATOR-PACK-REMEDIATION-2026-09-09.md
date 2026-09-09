# BRIEF — Claude H3D Operator Pack Remediation

**Date:** 2026-09-09 (Asia/Bangkok)
**Mode:** WSTERA HOUSE / H3D REMEDIATION ONLY
**Environment:** WSTERA LAB (`ykxlqnshaaxmzzocpjlj`) only
**Owner direction:** PREPARE + VERIFY ONLY. LIVE MUTATION NOT AUTHORIZED.
**Status:** `H3D PREPARED / OPERATOR PACK REMEDIATION REQUIRED / LIVE NOT AUTHORIZED`

## Goal

Repair the H3D execution package so an authorized operator can enable the hosted Custom Access Token Hook once, hand control back to the agent, and obtain a complete H3D PASS-or-STOP result without copying secrets into chat, logs, git, or evidence.

The repaired package must be internally consistent with the existing H3C proof harness contract. Do not weaken the H3C gate to make H3D pass.

## Locked current state

House worktree:
`D:\AI-Workspace\runtime\worktrees\house-h3d-h5-20260909`
branch `work/house-h3d-h5-20260909` @ `7ab7b6c`

PS01 worktree:
`D:\AI-Workspace\runtime\worktrees\ps01-h3d-data-api-20260909`
branch `work/ps01-h3d-data-api-20260909` @ `4efee70`

Both worktrees were independently verified clean before this remediation brief was created.

Original House master remains untouched. PS01 staging remains untouched, including its existing untracked handoff file.

Neither remediation branch currently exists on origin. This matters because canonical H3C requires House to be clean and pushed before LAB mutation.

H3D static work is not rejected by this brief. The PS01 Data API adapter and its local 3-RPC allowlist remain the current candidate implementation pending repaired live proof.

## Hard locks — effective immediately

1. Do NOT enable any Supabase Auth Hook.
2. Do NOT change WSTERA LAB Dashboard configuration.
3. Do NOT apply H3E, H3F, H4, or H5 actions.
4. Do NOT retire `ps01_runtime_login`.
5. Do NOT release HOUSE-A or BK01 quarantine.
6. Do NOT alter the H3C required-probe contract to manufacture a PASS.
7. Do NOT move the hook to `public`, widen ACLs, expose internal schemas, or use broad `supabase config push`.
8. Do NOT print, persist, commit, or copy raw JWTs, passwords, service keys, anon keys, DB URLs with passwords, or signing material into evidence/logs/chat.

## Verified blocker 1 — runtime JWT handoff is broken

`tools/shared-runtime/h3d/h3d-live-runner.mjs --run` obtains the Auth-issued runtime JWT only in process memory.

The runner then prints a placeholder:
`H3C_RUNTIME_JWT="<the token this runner issued>"`

It does not output or otherwise securely pass the real token to the H3C harness, then immediately enters teardown in `finally`.

Required remediation:
- keep the runtime JWT in memory;
- invoke the H3C proof harness from the orchestrated run, or provide an equivalent secure in-process/ephemeral handoff;
- never write the raw token to disk or stdout;
- teardown must happen only after all required proof consumers have finished;
- always teardown identity first, then grant row, including failure paths.

## Verified blocker 2 — required H3C inputs are missing from the Operator Pack

The current H3C harness treats the following as required-for-PASS inputs/probes, not optional conveniences:

- `H3C_CONTROL_JWT` for `POS-CONTROL-1`;
- `H3C_EXPIRED_JWT` for `NEG-EXP-1`;
- `H3C_PS01_TABLE_COL` for `NEG-TBL-2`;
- `H3C_FIX_SHOP_ID` for positive authorization probes;
- `H3C_FIX_OTHER_SHOP_ID` for `POS-AUTHZ-1`;
- `H3C_FIX_OTHER_PET_IDS` plus valid shop/room/rate-plan fixtures for `POS-AUTHZ-3`.

Missing required inputs produce `RUNTIME-BLOCKED`, therefore the gate cannot be PASS.

The existing Operator Pack incorrectly calls `H3C_EXPIRED_JWT` optional. Fix the documentation and execution contract; do not downgrade `NEG-EXP-1`.

Required remediation:
- provision/gather every required non-secret fixture before operator action, or fail preflight before the hook is enabled;
- obtain a signed non-allowlisted control JWT while the hook is active and prove it remains ordinary `authenticated` with normal lifetime;
- produce a real Auth-signed runtime JWT, let it expire, then use that exact expired token for `NEG-EXP-1` without logging it.

## Verified blocker 3 — hidden absolute-path dependency

The House runner currently contains:
`createRequire("D:/AI-Workspace/projects/saas-product-hub/products/PawSpace-pssr02-staging/")`

to obtain `pg` from another worktree.

This is an environment-specific hardcode and breaks worktree isolation. Remove it.

Required remediation:
- House tooling must resolve its own declared dependency or use an existing repository-local supported mechanism;
- no dependency on original PS01 staging, another worktree's `node_modules`, user profile paths, or machine-specific absolute project paths;
- do not modify the original PS01 staging worktree to solve this.

## Verified blocker 4 — canonical push gate not satisfied

`BRIEF-H3C-AUTH-ISSUED-RUNTIME-TOKEN-PROOF-2026-09-08.md` locks H3C-1 as:
`House repo clean and pushed before LAB mutation.`

The two remediation branches have no remote branch yet.

Required remediation after all repairs/tests:
- commit only scoped H3D remediation artifacts;
- push House branch and PS01 branch;
- prove working trees clean;
- prove local branch vs configured remote is `0/0`;
- record branch names + full commit SHAs in the updated operator pack/evidence.

No hosted LAB mutation is authorized before this push gate is satisfied.

## Required execution phases

### Phase R1 — inspect + design the secure one-shot live flow

Read the current H3C harness, H3D runner, H3C brief, H3C negative matrix, H3D evidence template, and Operator Action Pack before editing.

Produce one coherent flow with this lifecycle:

`preflight -> operator enable -> runtime identity/grant -> control identity -> runtime JWT -> control JWT -> fresh privilege snapshot -> required H3C probes -> wait/use expired runtime JWT -> teardown -> operator disable -> residual-expiry check -> inventory compare`

Preflight must detect every missing fixture/dependency that can be detected before hosted mutation and STOP before operator action.

### Phase R2 — implement runner/orchestration remediation

Make the smallest scoped changes required to execute the locked flow.

Requirements:
- no raw token logging;
- no secrets persisted to evidence;
- non-secret evidence may record UUID, issuer/project ref, role, iat, exp, lifetime, probe verdicts and HTTP/error classifications;
- cleanup errors must be explicit and make the run fail;
- `grant_rows_after` alone is insufficient: verify the created grant UUID is gone and disposable Auth identities are gone;
- an unrelated pre-existing grant row must not be treated as an H3D teardown failure unless it changed unexpectedly.

### Phase R3 — strengthen tests against the actual failure mode

Add/adjust offline tests so `--selftest` cannot pass while the live orchestration contract is impossible.

At minimum prove:
- secure runtime-token handoff exists without stdout/disk exposure;
- every required H3C PASS input is either generated/resolved by the runner or rejected by preflight;
- missing `CONTROL_JWT`, expired-token capability, table column, or authorization fixtures blocks operator readiness;
- teardown executes after proof consumption, including harness failure;
- machine-specific staging path is absent;
- operator pack commands exactly match implemented CLI behavior.

Run all relevant House H3C/H3D selftests and PS01 H3D static gates. Do not report PASS from source inspection alone.

### Phase R4 — repair documentation

Update `OPERATOR-ACTION-PACK-H3D-TO-H5-2026-09-09.md` to reflect executable reality.

For H3D, reduce the operator responsibility to only actions that truly require Dashboard authority. Every CLI command shown must be copy/runnable and must not contain a placeholder for data the script never exposes.

Explicitly document:
- what preflight proves before the operator touches Dashboard;
- exact operator enable action;
- exact command the agent runs after enable;
- automatic STOP/cleanup behavior;
- exact operator disable action;
- residual JWT-expiry rule.

### Phase R5 — checkpoint before asking for operator action

Only after R1-R4 pass:
- run final static/selftest gates;
- inspect git diff for scope creep and secrets;
- commit scoped remediation;
- push both House and PS01 branches;
- verify clean + remote `0/0`;
- update the Operator Pack with final branch/commit evidence.

Then STOP and return control to House/Owner. Do not enable the hook yourself.

## Acceptance criteria — all mandatory

H3D may return to `OPERATOR ACTION PACK READY` only when all are true:

1. The runner can securely carry the actual runtime JWT into the H3C harness without exposing it.
2. The full required H3C probe set can reach PASS inputs; none is silently optionalized.
3. `H3C_CONTROL_JWT` generation/collection is integrated.
4. `NEG-EXP-1` uses a genuine expired Supabase Auth-issued runtime JWT.
5. Required read-only authorization fixtures and `H3C_PS01_TABLE_COL` are resolved before operator enable or preflight fails closed.
6. No cross-worktree absolute dependency remains.
7. Failure paths perform verifiable identity-first teardown and report cleanup failure as failure.
8. Operator Pack and implemented CLI behavior match exactly.
9. Relevant House + PS01 static gates/selftests pass with captured commands/results.
10. No secrets appear in git diff, logs, evidence, or docs.
11. House remediation branch is pushed and remote parity is proven `0/0`.
12. PS01 remediation branch is pushed and remote parity is proven `0/0`.
13. Original House master and original PS01 staging remain untouched except for their already-existing state.
14. No WSTERA LAB mutation has occurred during remediation.

## Mandatory STOP conditions

STOP immediately and report evidence if any of these occurs:

- satisfying a required probe would require weakening the H3C/H3D security contract;
- a required fixture cannot be obtained safely/read-only;
- a raw JWT or secret is written to persistent evidence/log output;
- cleanup cannot prove the created Auth identity and grant row are gone;
- the solution requires modifying original PS01 staging or unrelated products;
- LAB state differs unexpectedly from the locked baseline;
- tests reveal a 5xx/ambiguous response being classified as security denial;
- git contains unrelated changes or remote history divergence.

## Deliverable back to House

Return one concise report containing:
- files changed;
- final House + PS01 commit SHAs;
- push/remote parity proof;
- exact tests/gates run and outcomes;
- confirmation that LAB was not mutated;
- final status: either `OPERATOR ACTION PACK READY` or `STOP — <reason>`.

Do not proceed into the live H3D toggle. House/Owner must explicitly authorize operator action after reviewing this remediation result.
