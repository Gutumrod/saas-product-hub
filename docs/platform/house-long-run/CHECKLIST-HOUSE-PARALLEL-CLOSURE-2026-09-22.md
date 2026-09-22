# CHECKLIST — HOUSE PARALLEL CLOSURE

Date: 2026-09-22
Purpose: run the two current House critical lanes in parallel without mixing authority, worktrees, evidence, or live mutations.

This checklist does not replace either lane's locked Brief/Manifest. Reality on disk/runtime wins if drift is found.

---

## Lane A — Control Truth / platform.wstera.com

Primary run: `WSTERA-CONTROL-TRUTH-SYNC-001`
Execution: Hermes + `hermes-native-swarm`
Control projection: `wstera-control-sync`
Planning branch: `work/wstera-control-truth-sync-001`

Observed current state:
- [x] T0 / B0 — canonical reconciliation complete
- [x] T1 — scope contract complete
- [x] T2 — scope/API/RPC work complete
- [x] R1 — Codex `BATCH_APPROVED`
- [x] T3-WU01 — production demo default removal
- [x] T3-WU02 — Owner Inbox / Agent Activity / Portfolio Gates / client truth-mode work
- [x] literal-form production discriminator mechanism approved by Owner
- [x] Control Sync dead-letter classified/reconciled into T4 scope
- [~] T3-WU03 — IN PROGRESS; canonical dependency-free literal discriminator committed at hub-web `534e50b8162a7768dbd93c9dc163ee8369b31c0e`; related router migration currently has uncommitted work and must be treated as active Hermes work
- [ ] T3-WU04 — production dependency-closure + runtime-mode regression/falsification tests
- [ ] T3-WU05 — revision-bound T3 evidence packet
- [ ] B3 — T3 mechanical gate
- [ ] T4-WU01 — update `wstera-control-sync` sender/contract for explicit non-product scope
- [ ] T4-WU02 — durable outbox / retry / scope serialization / redaction tests
- [ ] T4-WU03 — source/install parity + installation evidence
- [ ] B4 — Control Sync gate
- [ ] T5-WU01 — hub-web agent-only Owner decision poll + acknowledgement path
- [ ] T5-WU02 — Control Sync durable decision poll/consume
- [ ] T5-WU03 — cross-repo replay/tamper/wrong-task/wrong-option tests
- [ ] T5-WU04 — revision-bound end-to-end evidence
- [ ] R2 — Codex independent review of exact hub-web + wstera-workflows revisions
- [ ] `OWNER_HOLD_PRODUCTION_MUTATION` — HARD STOP; Owner must authorize DB migration/deploy/runtime activation
- [ ] T6 — authorized release/apply/deploy + live proof
- [ ] R3 — Codex post-deploy review
- [ ] T7 — final reconciliation/evidence
- [ ] Final state: `READY FOR OWNER CONTROL TRUTH REVIEW — WSTERA-CONTROL-TRUTH-SYNC-001`

Lane A hard rules:
- MUST load/use `hermes-native-swarm` and `wstera-control-sync`.
- Agent Relay is not the ordinary execution path.
- No production DB/deploy/config mutation before the Owner hold is explicitly resolved.
- Draft PR #2 is not auto-merged.
- Do not touch unrelated work or clean/reset unknown changes.

---

## Lane B — Shared Runtime Isolation / HOUSE-A / BK01 unlock

Current dependency: this is the House lane BK01 is waiting on.
Remote execution branch observed: `work/house-h3d-h5-20260909 @ d6707c0c96309f2f0efb8f83f00b5f34aee6d2b5`
Current canonical checkpoint from durable task evidence: `CP-H3D-STATIC-REMEDIATION-PENDING`

### Owner-authorized lane-specific routing override

For this parallel closure lane only:
- **Claude = lane lead + primary technical executor** for bounded H3D/H3E/H4/H5 remediation/implementation.
- **Codex = independent reviewer** at exact revision-bound review batches; Codex must not approve its own mutations.
- **AGY = parallel support worker** for read-only/source inspection, browser/staff proof preparation and execution where safe, UI-facing regression evidence, evidence organization, and other bounded tasks that do not require DB/Auth/role authority.
- AGY MUST NOT perform platform DB/Auth/role/Data API mutation merely to increase speed.
- This routing is a task-specific Owner exception and does not rewrite standing role policy for other work.

### Checklist

- [ ] PRE-01 — verify active execution machine/worktrees, exact branch/HEAD/dirty state, remote parity, source docs, credentials-by-name only, and preserve unknown local work
- [ ] H3D-S — close static acceptance findings S1–S5
- [ ] BATCH-H3D-S — Codex exact-revision review
- [ ] OWNER-CP-H3D-A1 — explicit Owner authority before rollback-only/two-session LAB validation
- [ ] H3D-A1 — atomicity/concurrency/failure-injection proof
- [ ] BATCH-H3D-A1 — Codex review
- [ ] OWNER-CP-H3D-LIVE — explicit Owner authority before real LAB Auth/grant/hook/app-path mutation
- [ ] H3D-LIVE — prove PS01 Customer LINE path uses Data API + short-lived Auth-issued runtime token; prove cross-shop denial; teardown temporary identity/grant/hook/token authority
- [ ] BATCH-H3D-LIVE — review H3D candidate
- [ ] OWNER-CP-H3E — explicit Owner authority before retiring PS01 direct DB login
- [ ] H3E — retire reusable `ps01_runtime_login`; prove NOLOGIN/passwordless/no active sessions and safe rollback rehearsal
- [ ] H3F — re-measure shared surfaces; explain every expected delta; no unexplained BK01/MT01/Storage/cron/extensions/Data API/migration drift
- [ ] BATCH-H3-CLOSE — Codex review and close H3
- [ ] OWNER-CP-H4 — explicit Owner authority before disposable-product live proof
- [ ] H4 — disposable product positive proof + full negative isolation matrix; no BK01/PS01/MT01/shared escape; complete zero-residue teardown
- [ ] BATCH-H4 — Codex review
- [ ] H5 — existing-product regression + rollback proof:
  - [ ] PS01 staff/browser authenticated LAB flow
  - [ ] PS01 Customer LINE bounded Data API proof
  - [ ] BK01 preserved baseline only; no quarantined bootstrap
  - [ ] MT01 unchanged or explicitly explained
  - [ ] Storage/cron/extensions/Data API/global migration signatures clean
  - [ ] rollback evidence verified
  - [ ] no new attributable Security Advisor finding
- [ ] BATCH-H5-HOUSE-A — final independent review package
- [ ] OWNER-CP-HOUSE-A — Owner final House isolation decision
- [ ] Final state: `SHARED-RUNTIME PLATFORM ISOLATION: PASS / HOUSE-A PASS`
- [ ] Return package to BK01
- [ ] BK01 may then create a fresh A0 baseline and retry Junction A; Order/Claim live integration remains locked until Junction A itself passes

### Speed split for Claude + Codex + AGY

Work may be parallelized only when dependencies permit:
- Claude drives the security/runtime implementation path and prepares exact revision checkpoints.
- Codex can prepare review criteria/read-only baseline in parallel, but final verdict must target the frozen exact revision.
- AGY can prepare H5 browser/staff proof harness, UI regression checklist, screenshots/evidence structure, and read-only product-surface checks before H5 entry; execution that depends on prior gates waits for those gates.
- Do not force AGY into DB/Auth/security mutation work outside its safe role just to create apparent parallelism.

---

## Cross-lane collision rules

- [ ] Separate branch/worktree/ledger/evidence for Lane A and Lane B.
- [ ] Never edit the same mutable worktree from both lanes.
- [ ] Never treat one lane's PASS as the other lane's PASS.
- [ ] Live DB/Auth/role/config/deploy mutations are serialized and must obey the relevant Owner checkpoint.
- [ ] Before any live mutation, re-check the other lane for a conflicting mutation window.
- [ ] Production and LAB claims stay separate.
- [ ] No fake Product identity, no hidden fallback, no silent dead-letter, no secret values in evidence.
- [ ] Each Codex verdict is exact-revision-bound.

## Parallel-plan completion

This parallel plan is complete only when:
- Lane A reaches `READY FOR OWNER CONTROL TRUTH REVIEW`; and
- Lane B reaches durable `HOUSE-A PASS` and returns the release package to BK01.

Re-check any remaining House-wide gates separately before claiming the entire WSTERA House `PRODUCTION_READY` or `OPERATED_STABLE`.
