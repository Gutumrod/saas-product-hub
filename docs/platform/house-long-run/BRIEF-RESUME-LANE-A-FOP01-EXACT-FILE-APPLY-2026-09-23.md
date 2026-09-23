# BRIEF — RESUME LANE A / RESOLVE F-OP-01 WITH EXACT-FILE APPLY CONTRACT

Date: 2026-09-23
Task: `WSTERA-CONTROL-TRUTH-SYNC-001`
Workflow: `WF-DEV-01 v1.3.0 / LONG_RUN`
Lane: A — Control Truth / platform.wstera.com
Controller: Hermes
Execution: Hermes Native Swarm
Model: `deepseek-v4.1-flash:cloud`
Entry state: `OWNER_HOLD_PRODUCTION_MUTATION_V2`
Authority of this brief: SOURCE / DOCS / RUNBOOK / TEST / EVIDENCE / REVIEW ONLY
Live Production authority: NONE

## 1. Objective

Resolve `F-OP-01` by replacing the invalid migration-runner premise with one explicit,
reviewable production apply contract:

`EXACT REVIEWED SQL FILE -> TRANSACTIONAL DRY-RUN -> ASSERTIONS -> ROLLBACK ->
REAL TRANSACTION APPLY -> POST-APPLY ASSERTIONS -> RELEASE EVIDENCE`

This brief does NOT authorize the production apply itself.
## 2. Canonical measured entry state

Planning:
- workspace: `D:\AI-Workspace\runtime\worktrees\wstera-control-truth-sync-001`
- branch: `work/wstera-control-truth-sync-001`
- measured HEAD before this brief: `2c7a3e8abb9b8d4c5f229afbadc8ddd13e220a04`
- remote parity: exact
- worktree: clean

hub-web:
- workspace: `D:\AI-Workspace\runtime\worktrees\hub-web-cts001`
- branch: `work/wstera-control-truth-sync-001`
- `A_EXPAND_REV = dfcb4be4ac8b488ef740e2147f83b5c19251fbd8`
- `A_CONTRACT_REV = dd9a629eaa4e75c29fe0b8aa31698b5f9c4e1dae`
- current HEAD: `dd9a629eaa4e75c29fe0b8aa31698b5f9c4e1dae`
- worktree: clean

wstera-workflows:
- revision: `fb84b9d6517186246dacde2871937d98c52ec7a6`
- clean / remote parity exact

Do not reset, clean, rewrite, or replace these revisions.
## 3. Required read order

Before editing anything, Hermes MUST read:

1. this brief;
2. `OWNER-HOLD-PRODUCTION-MUTATION-V2-2026-09-23.md`;
3. `FINDING-MIGRATION-RUNNER-CONTRADICTS-BRIEF-2026-09-23.md`;
4. `R2-AMENDMENT-CODEX-VERDICT-2026-09-23.md`;
5. `RUNBOOK-LANE-A-EXPAND-DEPLOY-CONTRACT-2026-09-23.md`;
6. `BRIEF-RESUME-LANE-A-CONTROL-TRUTH-EXPAND-CONTRACT-2026-09-22.md`;
7. prior Owner decision / qualification evidence cited by F-OP-01:
   - `R15-D0-DECISION-REPORT-CODEX-2026-09-20.md`
   - `R15-D0-DECISION-OUTCOME-2026-09-20.md`
   - `T2-WU02-MIGRATION-RPC-QUALIFICATION-2026-09-21.md`;
8. exact headers/content of reviewed `0009` and `0010`.

Measured repository/runtime truth overrides stale prose.

## 4. Required runtime

Hermes remains Lane-A orchestrator/state holder.

Ordinary work MUST use installed `hermes-native-swarm`.

Model policy:
- `Model:cloud`;
- exact baseline: `deepseek-v4.1-flash:cloud`;
- `model_substitution_authorized: false`;
- no silent local/model/provider/Relay substitution.

Load `wstera-control-sync` for governed activity projection.
## 5. Sol decision — F-OP-01 apply mechanism is locked

For this Lane-A release, the approved mechanism DESIGN is:

`LANE_A_EXACT_FILE_POSTGRES_TRANSACTION_APPLY_V1`

Implementation contract:
- use Node.js with the existing `postgres` client dependency, matching the proven R15 transaction pattern;
- read the exact reviewed SQL file bytes from the pinned git revision;
- never invoke `drizzle-kit generate`, `drizzle-kit migrate`, or `npm run db:push`;
- do not create `drizzle/migrations/meta/_journal.json`, `__drizzle_migrations`, or any new migration ledger;
- perform one migration file per transaction;
- dry-run first in a transaction that is deliberately rolled back;
- real apply later in a separate transaction only after explicit Owner Production authorization;
- run assertions inside the same transaction before commit;
- fail closed on any target/revision/hash/precondition/assertion mismatch.

The absence of a Drizzle ledger is explicit and accepted for this release mechanism.
Release evidence, plus live catalog preconditions/postconditions, is the sequencing proof.

This decision resolves the *mechanism-design* portion of F-OP-01.
F-OP-01 is not fully closed until the operator helper/runbook are produced and independently reviewed.

## 6. Exact migration identities

EXPAND:
- revision: `dfcb4be4ac8b488ef740e2147f83b5c19251fbd8`
- file: `drizzle/migrations/0009_work_scope_identity.sql`
- sha256: `8f88a7d1e4d3777dd0c2adefa999f61799bd50dd1270407fa025f3c4068d3487`

CONTRACT:
- revision: `dd9a629eaa4e75c29fe0b8aa31698b5f9c4e1dae`
- file: `drizzle/migrations/0010_retire_legacy_work_event_rpc.sql`
- sha256: `3963c6a6e6423f006889d87c735e86ef30831680964c19b096f23f2b091a7b30`
## 7. Required deliverables

Hermes must prepare, but NOT execute in live apply mode:

1. corrected `RUNBOOK-LANE-A-EXPAND-DEPLOY-CONTRACT-2026-09-23.md`;
2. an operator helper implementing `LANE_A_EXACT_FILE_POSTGRES_TRANSACTION_APPLY_V1`;
3. deterministic tests/falsification for the helper;
4. an evidence template for dry-run/apply/post-apply records;
5. a focused independent Codex review packet covering the amendment only.

Preferred helper path:
`docs/platform/house-long-run/tools/lane-a-exact-file-postgres-apply.mjs`

The helper is operator tooling, not application runtime code.

## 8. Operator-helper hard requirements

The helper must support exactly:
- `--mode dry-run`
- `--mode apply`

Inputs must include:
- exact migration identity (`0009` or `0010`);
- expected git revision;
- expected file path;
- expected SHA256;
- expected target project identity.

Before opening a transaction it must:
- verify the migration file bytes hash exactly;
- verify the file originates from the declared git revision;
- verify the target credential resolves to the expected project without printing the URL/secret;
- reject an unknown migration id/path/hash/revision combination;
- reject use against any non-Control target.

No credential value may appear in argv, logs, docs, evidence, or git.
## 9. Transaction semantics

### Dry-run mode

Dry-run must execute:

`BEGIN -> exact migration SQL -> live-shape assertions -> deliberate rollback`

It must prove:
- PostgreSQL accepts the full file in one transaction;
- all expected post-migration assertions become true inside that transaction;
- rollback occurs deliberately;
- the persistent database shape after rollback equals the measured pre-run shape.

A dry-run PASS does not authorize apply.

### Apply mode

Apply must execute:

`BEGIN -> preconditions -> exact migration SQL -> postconditions -> COMMIT`

If any precondition, SQL statement, or postcondition fails:
- transaction rolls back;
- result is FAIL;
- no retry occurs automatically;
- dependent release windows remain blocked.

The helper must never split one migration file across transactions.

## 10. Ledgerless sequencing contract

Because no DB migration ledger is used, sequencing is proven from BOTH:

1. live catalog state immediately before each apply; and
2. immutable release evidence for the exact file/revision/hash.

Before EXPAND/0009:
- legacy 17-argument RPC must exist in the expected shape;
- the release packet must show 0009 has not already been recorded as successfully applied;
- current schema/catalog must match the reviewed preconditions.

Before CONTRACT/0010:
- 19-argument RPC must exist with the reviewed privilege shape;
- legacy 17-argument RPC must still exist exactly once;
- new Worker must be proven live on the 19-argument path;
- release evidence must record successful 0009 apply;
- old Worker/in-flight compatibility window must be closed by measured evidence.

Any contradiction -> STOP before mutation.
## 11. Live-access guard

The operator helper must fail closed unless explicit runtime guards are present.

For any live DB connection, require:
`LANE_A_LIVE_DB_AUTHORIZED=YES`

For real commit/apply mode, additionally require:
`LANE_A_PRODUCTION_APPLY_AUTHORIZED=YES`

These environment guards are safety interlocks only.
They do NOT create authority and MUST NOT be set before the future Owner Production approval.

Without the required guard:
- no network DB connection;
- no SQL execution;
- non-zero exit;
- evidence records `AUTHORITY_GUARD_REFUSAL`.

## 12. Release evidence contract

Each migration execution record must contain only non-secret evidence:

- task id and release id;
- migration id;
- git revision;
- exact file path;
- file SHA256;
- operator-helper revision/hash;
- sanitized target identity;
- mode: dry-run or apply;
- transaction start/end timestamps;
- precondition results;
- SQL execution result;
- postcondition results;
- rollback/commit result;
- exit code;
- final classification.

Never record raw connection strings, passwords, access tokens, or secret-bearing stderr.

A successful APPLY record is the release ledger for this lane.
It does not pretend to be a Drizzle migration journal.

## 13. Offline acceptance gates before review

No live DB access is allowed while preparing this amendment.

Required offline proof:
- helper parses and validates both locked migration identities;
- wrong revision/path/hash/migration-id combinations fail closed;
- wrong target identity fixture fails closed;
- missing authority guards refuse before connection;
- dry-run mode is structurally guaranteed to roll back;
- apply mode commits only after postconditions pass;
- simulated assertion failure causes rollback/non-zero exit;
- secret-shaped fixture scan = 0 persisted values;
- active runbook contains no instruction to use `db:push` or Drizzle migrate;
- `git diff --check` clean;
- changed paths remain inside this brief's allowed scope.
## 14. Allowed write scope

This brief authorizes edits only to:
- `RUNBOOK-LANE-A-EXPAND-DEPLOY-CONTRACT-2026-09-23.md`;
- `FINDING-MIGRATION-RUNNER-CONTRADICTS-BRIEF-2026-09-23.md` only to append disposition/closure status;
- new operator helper under `docs/platform/house-long-run/tools/**`;
- new tests/fixtures for that helper under the same tools subtree;
- new F-OP-01 amendment evidence/review/handoff documents;
- this brief only if a factual correction is required and separately recorded.

Do NOT modify:
- `0009` or `0010`;
- application/runtime source;
- Control Sync source;
- billing/auth/product logic;
- migrations 0001..0008;
- unrelated House/Lane-B files.

Any required change outside this scope -> STOP and route to Sol.

## 15. Existing reviewed revisions stay immutable

The source/revision review already completed for:
- `A_EXPAND_REV = dfcb4be...`
- `A_CONTRACT_REV = dd9a629...`
- `wstera-workflows = fb84b9d...`

This amendment must not manufacture replacement source revisions merely to close F-OP-01.
## 16. Native Swarm stage graph

Hermes must create bounded work units with full governance headers.

### FOP-WU1 — inspection / reconciliation
Assign: `swarm-inspector`
- remeasure all entry revisions/hashes;
- verify active documents and F-OP-01 evidence;
- verify no Lane-B live collision window is open;
- no mutation.

### FOP-WU2 — implementation
Assign: `swarm-builder`
- implement the operator helper;
- amend the active runbook;
- append truthful F-OP-01 disposition;
- no live DB access.

### FOP-WU3 — offline verification
Assign: `swarm-tester`
- run all §13 gates and falsification;
- no network DB connection;
- no production mutation.

### FOP-WU4 — evidence
Assign: `swarm-evidence`
- normalize hashes, commands, exit codes, changed files, and non-claims.

Hermes performs commander-side deterministic verification after every work unit.
## 17. Retry/remediation budget

For one stable issue fingerprint in this amendment:
- bounded Native Swarm repair attempt #1;
- rerun the exact failed gate;
- bounded Native Swarm repair attempt #2;
- rerun the exact failed gate.

No ordinary repair #3.

If still unresolved:
- stop the amendment;
- persist exact evidence;
- route to Sol for classification before any premium escalation.

Native Swarm does not invent a retry count or widen scope.

## 18. Commit / push

After FOP-WU1..4 PASS:
- Hermes may mechanically stage only the declared amendment files;
- never use `git add .` or `git add -A`;
- run cached diff check + secret scan;
- commit/push on `work/wstera-control-truth-sync-001`;
- prove local HEAD = remote HEAD.

No hub-web or workflows commit is expected from F-OP-01.
## 19. Focused Codex review gate

After the amendment commit/push, request one independent Codex review of:

- exact planning amendment SHA;
- operator helper + tests;
- corrected runbook;
- F-OP-01 disposition;
- immutable `dfcb4be` / `dd9a629` migration identities;
- ledgerless sequencing and transaction guarantees;
- authority guards;
- rollback/forward-fix ordering.

Codex must answer:
1. Is F-OP-01 closed at the operator-contract level?
2. Can 0009 be dry-run/applied alone from its exact reviewed bytes?
3. Can 0010 be dry-run/applied alone only after the 19-arg Worker path is proven live?
4. Can the helper ever apply the wrong file, wrong hash, wrong target, or run without authority guards?
5. Does any active instruction still suggest `db:push` / Drizzle migrate for this release?
6. Is the release evidence sufficient to replace a migration-ledger sequencing claim without pretending a DB ledger exists?

Reviewer mutation = no self-approval; create a new revision and review again.

Required review result before Owner gate:
`APPROVED` or `APPROVED_WITH_FINDINGS` with no open blocking finding.
## 20. Terminal state — OWNER_HOLD_PRODUCTION_MUTATION_V3

After §19 passes, STOP before any live DB/network/deploy/install mutation.

Prepare one Owner package containing:
- amendment planning SHA;
- exact operator-helper hash;
- exact corrected-runbook hash;
- Codex verdict;
- `A_EXPAND_REV` / `A_CONTRACT_REV`;
- 0009 / 0010 SHA256;
- rollback/forward-fix contract;
- current Lane-B collision state;
- exact operator identity and live credential source class, without secret values.

Terminal state:
`OWNER_HOLD_PRODUCTION_MUTATION_V3`

## 21. One-time future Owner release authorization shape

At V3, present one bounded release decision:

`LANE_A_PRODUCTION_RELEASE_V1`

If Owner approves it once, it authorizes the ordered release only:

Window 0 -> live preflight / backup / target proof
Window 1 -> 0009 transactional dry-run -> PASS -> exact-file APPLY -> live assertions
Window 2 -> hub-web deploy -> live 19-arg proof
Window 3 -> 0010 transactional dry-run -> PASS -> exact-file APPLY -> live assertions
Window 4 -> exact Control Sync skill install + parity
Window 5 -> nine live proofs -> R3 -> T7

Every window is conditional on the prior window PASS.
Any FAIL stops before the next window; no authority is inferred to skip a gate.

Without explicit `LANE_A_PRODUCTION_RELEASE_V1` approval:
no live DB access, no backup, no apply, no deploy, no Cloudflare mutation, no skill install.

## 22. Non-claims

Completion of this brief means only:
`F_OP_01_OPERATOR_CONTRACT_REVIEW_READY` or, after Codex, `F_OP_01_OPERATOR_CONTRACT_APPROVED`.

It does NOT mean:
- migration applied;
- Production deployed;
- runtime skill installed;
- GAP-A live-closed;
- `PRODUCTION_READY`;
- `OPERATED_STABLE`.

After reaching `OWNER_HOLD_PRODUCTION_MUTATION_V3`, stop and report the exact package.
