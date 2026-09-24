# BRIEF — HOUSE DUAL-LANE CONVERGENCE

Date: 2026-09-24
Task: `WSTERA-HOUSE-DUAL-LANE-CONVERGENCE-001`
Mode: `LONG_RUN / TWO ISOLATED LANES / ONE CONVERGENCE GATE`
Controller / state holder: Hermes
Technical governance at convergence: Sol
Terminal state of this brief: `DUAL_LANE_CONVERGENCE_READY / SOL_RECONCILIATION_REQUIRED`

## 1. Objective

Run Lane A and Lane B as two isolated workstreams from their measured current states.

Each lane must:
- use its own locked runtime/routing contract;
- remediate and complete its own lane-local gates;
- preserve exact evidence and revision identity;
- never mutate the other lane's workspace or reinterpret the other lane's authority.

The two lanes meet only after BOTH independently reach `LANE_*_READY_FOR_CONVERGENCE`.

At that point Hermes builds one convergence packet and STOPS.
No merge, no final House closure, and no cross-lane integration mutation is authorized by this brief.
## 2. Measured entry state

### Lane A — Control Truth rollout

Planning:
- workspace: `D:\AI-Workspace\runtime\worktrees\wstera-control-truth-sync-001`
- branch: `work/wstera-control-truth-sync-001`
- measured HEAD before this brief: `6af0f7ba4c381135368a9ce5fc48ceaf6ff7aca6`
- state: clean / remote parity exact

Reviewed source:
- hub-web `A_CONTRACT_REV = dd9a629eaa4e75c29fe0b8aa31698b5f9c4e1dae`
- wstera-workflows `fb84b9d6517186246dacde2871937d98c52ec7a6`

Current Lane-A state:
- `LANE_A_PRODUCTION_RELEASE_V1` was opened;
- W0 failed before W1;
- unauthorized Control DB CLI login-role mutation incident is OPEN;
- W1 remains CLOSED.

### Lane B — Shared Runtime closure

Planning:
- workspace: `D:\AI-Workspace\runtime\worktrees\house-lane-b-longrun-plan-20260922`
- branch: `work/house-lane-b-longrun-plan-20260922`
- measured HEAD: `c56f709672415626422e3fb6e65f27a1a2193008`
Execution:
- workspace: `D:\AI-Workspace\runtime\worktrees\house-h3d-h5-20260909`
- branch: `work/house-h3d-h5-20260909`
- measured HEAD: `53346383faa2a87fac483a7a3bf5233a200e295d`
- state: clean / remote parity exact

Authority:
- Owner-approved Lane-B gate contract is active:
  `SOL_DECISION_GATES_LOCKED`
- approved contract SHA256:
  `00f0e9e57a620e5ad0a3c51f4596e285dfcf77b8cecdb84980efcff0bc6c1d6a`

Current Lane-B state:
- R2 reviewer verdict does not yet exist;
- scanner false-positive blocks independent review;
- a distinct executor/driver `stdout_sha256` provenance-contract defect is proven;
- non-BUILD scope-guard defect is already remediated and is NOT reopened by this brief.

## 3. Global orchestration rules

1. Lane A and Lane B are independent mutable lanes.
2. A worker assigned to one lane must not mutate the other lane's worktree.
3. No branch merge/rebase/cherry-pick between lanes is authorized.
4. Never reset/clean/stash unknown work.
5. Stage exact declared files only; never `git add .` or `git add -A`.
6. A lane-local blocker parks only that lane. The other lane may continue.
7. Existing Owner gates remain real; this brief does not silently waive them.
8. If a required Owner gate is not yet approved, mark only that lane `PARKED_OWNER_GATE` and keep the other lane moving.
9. Before any shared live mutation, re-check the other lane for an open live window/collision.
10. No lane may claim the other lane's PASS as its own evidence.
11. No lane may change architecture, routing, scope, authority contracts, premium/model/provider policy, or live checkpoints.
12. When both lanes reach their convergence-ready states, all lane execution stops.

## 4. Lane routing

### Lane A routing

Hermes = orchestrator/state holder.

Execution:
- installed `hermes-native-swarm`;
- `Model:cloud`;
- exact baseline `deepseek-v4.1-flash:cloud`;
- `model_substitution_authorized: false`.

Lane A does not use ordinary Agent Relay execution for this work.

### Lane B routing

Hermes = LONG_RUN controller/state holder.
Canonical Agent Relay governs execution/safety.
OpenCode = ordinary implementation worker.
Qwen = bounded specialist.
Codex = independent reviewer/classifier.
Claude = difficult remediation only after an admissible `SEND_TO_CLAUDE`.
AGY is not a backend/database/security worker.
## 5. LANE A — task graph

### A0 — close the W0 incident and restore a valid W0

Read first:
- `REPORT-LANE_A_PRODUCTION_RELEASE_V1-W0-FAIL-AND-INCIDENT-2026-09-23.md`
- `INCIDENT-UNAUTHORIZED-CONTROL-DB-MUTATION-W0-2026-09-23.md`
- `W0-PREFLIGHT-LANE-A-RELEASE-V1-2026-09-23.md`
- active Lane-A runbook and V3 package.

Required outcomes before W1:
- the exposed CLI login-role credential is revoked/rotated under explicit Owner authority;
- the temporary CLI login role is remediated under the Owner's chosen incident action;
- the backup/recovery posture has an explicit Owner ruling;
- human-operator / credential-provisioning authority is recorded;
- W0 is re-run without `supabase db dump --dry-run` or any unreviewed mutation path;
- all W0 gates PASS;
- no unresolved secret-exposure incident remains.

If any required Owner ruling is absent:
`LANE_A = PARKED_OWNER_GATE`
and Lane B continues.

### A1 — EXPAND

Only after W0 PASS:
- exact `0009` from `dfcb4be4ac8b488ef740e2147f83b5c19251fbd8`;
- exact-file transactional dry-run;
- required assertions;
- real apply only under active release authority;
- live post-apply proof.
### A2 — DEPLOY 19-argument client

After A1 PASS:
- deploy the reviewed hub-web Worker revision;
- prove the new Worker is serving;
- prove the 19-argument RPC path live;
- prove the legacy 17-argument path remains available until CONTRACT;
- persist live-worker proof bound to the same target/task.

### A3 — CONTRACT

Only after A2 PASS:
- exact `0010` from `dd9a629eaa4e75c29fe0b8aa31698b5f9c4e1dae`;
- exact-file transactional dry-run;
- require successful 0009 evidence + live-worker proof;
- real apply;
- prove 17-argument overload retired and 19-argument path healthy.

### A4 — Control Sync install

Only after A3 PASS and collision check:
- install the exact reviewed Control Sync revision;
- capture pre-install hashes;
- verify post-install parity;
- verify activity-detail bound / previously known dead-letter cause is no longer live;
- preserve rollback hashes.

### A5 — live proof / closure path

Run the nine locked live proofs, then:
- R3;
- T7;
- all required Control Truth readbacks;
- no fake Product code;
- no unresolved new dead-letter caused by this lane.

Lane A must not enter convergence with an open release incident or an invalidated live proof.
### Lane A terminal criteria

Lane A becomes:

`LANE_A_READY_FOR_CONVERGENCE`

only when ALL are true:
- W0 PASS and incident closed;
- 0009 applied + asserted;
- reviewed Worker deployed + 19-argument live proof;
- 0010 applied + asserted;
- exact Control Sync install/parity complete;
- nine live proofs complete;
- R3 complete;
- T7 complete;
- all Lane-A repos/worktrees clean with remote parity;
- exact evidence/revisions/hashes persisted;
- no Lane-A Owner gate remains open except final cross-lane/House acceptance.

When this state is reached, Lane A freezes and performs no further mutation.

## 6. LANE B — task graph

### B0 — protected Relay remediation

Current blockers are two distinct protected Relay defects:

1. `stdout_sha256` provenance contract mismatch:
   executor hashes output-file bytes while driver validates `output.strip()` bytes.
2. secret scanner false-positive on psql client-variable references.

The earlier non-BUILD scope-guard defect is already fixed and MUST NOT be reopened.

Any required protected-skill Owner authorization must be consumed before mutation.
If absent:
`LANE_B = PARKED_OWNER_GATE`
and Lane A continues.
#### B0.1 — provenance contract repair

Bounded objective:
- establish one semantic definition for `stdout_sha256`;
- executor and driver must hash the same canonical bytes;
- do not remove or bypass provenance validation.

Required regression coverage:
- reviewer output file exists;
- output-file-absent/fallback path;
- trailing newline;
- UTF-8 content;
- tampered output must fail provenance.

Required gates:
- targeted provenance tests PASS;
- canonical Relay release verifier PASS;
- exact protected-file hashes recorded before/after;
- no routing/model/provider change.

#### B0.2 — re-run Codex classification

After provenance repair PASS:
- re-run the scanner-fingerprint classification;
- bind it to the exact repaired Relay revision;
- verdict must be provenance-valid/admissible.

If verdict is not `SEND_TO_CLAUDE`, follow that admissible verdict.
If verdict is `SEND_TO_CLAUDE`, continue to B0.3.

#### B0.3 — bounded Claude scanner remediation

Claude scope is only the scanner false-positive fingerprint.

Required design:
- distinguish psql client-variable reference from an assigned credential using raw matched text;
- no stage exemption;
- no wrapper-log scan bypass;
- no broad synthetic-secret exemption.

Required negative controls must prove real credential classes still fail closed.
Required controls include at minimum:
- Stripe live/test;
- OpenAI project key;
- GitHub PAT;
- Slack token;
- opaque assignment;
- 32-hex secret;
- non-psql colon string.

After the scanner change:
- targeted scanner tests PASS;
- canonical Relay release verifier PASS;
- independent review of the protected Relay revision PASS;
- no silent weakening of the scanner.

### B1 — re-dispatch Lane-B R2

After B0 is fully approved/reviewed:
- remeasure the Lane-B candidate pair;
- preserve execution revision `53346383faa2a87fac483a7a3bf5233a200e295d` unless a real candidate change is required;
- use the exact current planning candidate declared by the Lane-B manifest/card;
- if either candidate SHA changed, re-freeze before review;
- dispatch one independent Codex R2;
- require an admissible verdict and exact revision binding.

Do not inherit R1 as R2.
Do not waive review because the scanner/provenance path was repaired.

### B2 — process R2 and close technical remediation

Process the admissible R2 verdict under the approved Lane-B gate contract.

For ordinary findings:
- use the locked two-repair-attempt fingerprint ladder;
- Codex classify after cap;
- Claude only after admissible `SEND_TO_CLAUDE`.

Do not create new Owner stops outside the approved contract §8.
### B3 — Lane-B live checkpoints

After technical review PASS, advance through the existing Lane-B live checkpoints only under
their already-defined Owner gates:

- `OWNER-CP-H3D-A1`
- `OWNER-CP-H3D-LIVE`
- `OWNER-CP-H3E`
- `OWNER-CP-H4`

This brief does not pre-approve those live mutations.

At each checkpoint:
- obtain/consume exact Owner authority if not already recorded;
- run the reviewed bounded operation;
- verify rollback/teardown;
- persist exact evidence;
- stop that lane on FAIL before the next checkpoint.

A missing approval parks Lane B and does not stop Lane A.

### Lane B terminal criteria

Lane B becomes:

`LANE_B_READY_FOR_CONVERGENCE`

only when ALL are true:
- protected Relay provenance/scanner defects are closed and independently reviewed;
- canonical Relay verifier passes on the installed/effective revision;
- R2 has an admissible terminal verdict;
- all R2 blocking findings are closed;
- required H3D-A1 / H3D-LIVE / H3E / H4 lane-local checkpoints are complete;
- teardown/rollback evidence is complete;
- Lane-B planning/execution branches are clean with remote parity;
- exact evidence/revisions/hashes are persisted;
- no Lane-B Owner gate remains open except final cross-lane/House acceptance.

When this state is reached, Lane B freezes and performs no further mutation.
## 7. Shared-surface collision rule

Before any live/shared-runtime mutation, Hermes must compare both lanes' active targets.

Never mutate the same shared surface concurrently.

Shared surfaces include at minimum:
- Control DB / roles / grants / functions;
- platform Worker / Cloudflare deployment;
- installed Control Sync skill;
- installed canonical Agent Relay skill;
- shared secret/credential material;
- shared task/control records where one lane could invalidate the other's evidence.

If overlap exists:
- serialize the windows;
- freeze the non-owning lane;
- record which lane owns the mutable surface;
- release ownership only after post-checks and evidence are complete.

A collision is not permission to merge the lanes.

## 8. Intermediate Owner gates

This brief intentionally contains lane-local Owner gates.

Hermes must NOT terminate the whole dual-lane controller merely because one lane needs an Owner ruling.

Instead:
- mark that lane `PARKED_OWNER_GATE`;
- persist the exact requested decision;
- continue the other lane where safe;
- resume the parked lane only after the required ruling is recorded.

If BOTH lanes are parked, report both exact decisions together in one Owner packet.

No Owner gate may be invented outside the governing Lane-A release contract or approved Lane-B §8.
## 9. Convergence gate — where A and B meet

The lanes meet only when:

`LANE_A_READY_FOR_CONVERGENCE`
AND
`LANE_B_READY_FOR_CONVERGENCE`

Hermes then performs a READ-ONLY cross-lane reconciliation.

Required checks:
1. both lane terminal states are backed by exact evidence;
2. every reviewed revision still matches the bytes/hashes that were approved;
3. no review has been invalidated by a later artifact mutation;
4. no live/shared mutation window remains open;
5. no unresolved secret-exposure incident remains;
6. no shared-surface ownership/collision remains;
7. both lane worktrees/branches are clean with remote parity;
8. installed runtime/skill revisions are measured and recorded;
9. Control Truth state produced by Lane A does not contradict Lane-B shared-runtime assumptions;
10. no Owner gate remains open except final House/cross-lane acceptance.

Do not fix a contradiction during this reconciliation.
A contradiction returns the owning lane to remediation.

## 10. Convergence packet

When §9 passes, create exactly one:

`DUAL-LANE-CONVERGENCE-PACKET-2026-09-24.md`

It must bind:
- Lane-A final planning SHA;
- Lane-A hub-web revision/deployed Worker identity;
- Lane-A wstera-workflows / installed Control Sync revision and hashes;
- Lane-B final planning SHA;
- Lane-B final execution SHA;
- canonical Relay installed revision / protected-file hashes;
- Lane-B R2 terminal verdict and review binding;
- each live checkpoint result;
- Owner approvals consumed by each lane;
- unresolved non-blocking backlog only;
- shared-surface collision table;
- current Control/board state;
- final secret/credential hygiene statement;
- exact proof that both lanes are frozen.

The packet must distinguish:
- facts measured live;
- revision-bound evidence;
- historical evidence;
- unresolved non-blocking follow-up.

No stale SHA may be copied without remeasurement.

## 11. Mandatory stop

After the convergence packet passes deterministic checks, set:

`DUAL_LANE_CONVERGENCE_READY / SOL_RECONCILIATION_REQUIRED`

Then STOP.

This brief does NOT authorize:
- merging Lane-A and Lane-B branches;
- cherry-picking one lane into the other;
- cross-lane source repair;
- a new combined deployment;
- marking `HOUSE-A PASS`;
- closing the governing House/Lane-B/Secretary task;
- final Owner acceptance;
- changing architecture/routing/contracts to make the lanes fit.

The next task after this stop is a separate Sol reconciliation of the frozen combined package.

## 12. Commit / push authority

Hermes may mechanically commit/push lane-local docs/evidence/code only where that lane's
existing authority allows it.

For this controller brief:
- commit only this brief on the Lane-A planning branch;
- do not copy this brief into the Lane-B branch;
- Lane B reads this file cross-worktree as controller authority while preserving its own SoT.
## 13. Execution graph

```text
LANE A
A0 incident/W0
  -> A1 EXPAND 0009
  -> A2 DEPLOY + 19-arg proof
  -> A3 CONTRACT 0010
  -> A4 Control Sync install
  -> A5 nine live proofs -> R3 -> T7
  -> LANE_A_READY_FOR_CONVERGENCE

                                                                       > READ-ONLY CROSS-LANE RECONCILIATION
                                   /  -> DUAL_LANE_CONVERGENCE_READY
                                      -> STOP FOR SOL
LANE B
B0.1 provenance repair
  -> B0.2 Codex classify
  -> B0.3 Claude scanner repair if admissibly routed
  -> B1 independent R2
  -> B2 technical remediation closure
  -> B3 H3D-A1 -> H3D-LIVE -> H3E -> H4
  -> LANE_B_READY_FOR_CONVERGENCE
```

No arrow in this graph permits skipping a gate.

## 14. Failure semantics

- lane-local deterministic failure -> remediate under that lane's contract;
- lane-local Owner gate -> park that lane only;
- shared-surface collision -> serialize, never race;
- secret exposure -> hard stop owning lane and invoke its security/Owner gate;
- revision/evidence mismatch -> invalidate affected review and re-freeze only that lane;
- global contradiction affecting both lanes -> stop both and route to Sol;
- never convert FAIL to PASS by narrative disposition.

## 15. Definition of done for this brief

This brief is DONE only when:

- Lane A = `LANE_A_READY_FOR_CONVERGENCE`;
- Lane B = `LANE_B_READY_FOR_CONVERGENCE`;
- read-only cross-lane reconciliation passes;
- convergence packet is committed/pushed;
- all referenced SHAs/hashes are remeasured;
- no active mutation process remains;
- no orphan worker remains;
- both lane workspaces are clean/parity-exact;
- terminal state is exactly:
  `DUAL_LANE_CONVERGENCE_READY / SOL_RECONCILIATION_REQUIRED`.

Anything beyond that state belongs to a new task/brief.

## 16. Reporting rule

Hermes must report progress as two independent lines:

`LANE_A: <state> / next gate`
`LANE_B: <state> / next gate`

Do not collapse them into one PASS/FAIL before convergence.

At convergence report only:
- exact Lane-A frozen identity;
- exact Lane-B frozen identity;
- convergence packet path/hash;
- cross-lane reconciliation result;
- terminal stop state.

No final House PASS claim is allowed from this brief.
