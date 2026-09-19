# AGENT DISPATCH — B0 Independent Review — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Agent: `agent-codex` (PRINCIPAL_REVIEWER / independent batch reviewer)
Review Batch: **B0 — House State Integrity**
Stage: T0 (House canonical reconciliation)
Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001`
Workflow: `WF-DEV-01 v1.3.0` / `LONG_RUN` + `WF-RELAY-01 v1.3.0`
Runtime Procedure: `kanban-external-agent-dispatch v2.5.3`
Context mode: **INDEPENDENT-QA** (no Builder conclusions, no expected verdict)
Recorded: 2026-09-19

## Exact revision under review

Repository: `Gutumrod/saas-product-hub`
Branch: `work/house-production-closure-longrun-20260919`
Revision: `28f571de053c6a7433268e707fe9b9244162d31a`
Prior checkpoint: `8db298b59caa8264e739e30b29e9b49bd8914bd4`
Governance base merged in: `origin/master @ 1556d8a29ce5fa2f408bed981f26d9ef7d61aa33`
Worktree: `D:\AI-Workspace\projects\saas-product-hub`
Remote parity: verified equal to `origin/work/house-production-closure-longrun-20260919`

## Critical focus for this batch (from Run Manifest, B0)

- history preservation
- exact current-state truth

## Authorized review surface for B0

Read-only. Codex may read:
- `docs/platform/house-long-run/**` (Task, Manifest, Brief, Handoff, evidence)
- `docs/CURRENT_STATUS.md`
- `AGENTS.md`
- `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md`
- git history/refs of the revision under review
- `Gutumrod/hub-web` and `Gutumrod/stripe-billing` refs for cross-checking recorded refs
- `Gutumrod/wstera-workflows` registry/policies

Codex must **not** modify any file. Review writes nothing except its own report.

## B0 questions to answer

1. **History preservation.** Is prior House/SB01 evidence history preserved? Did T0 avoid
   rebase/reset/force push/history rewrite? Is `origin/master` genuinely an ancestor of the
   reviewed revision?
2. **Changed-path audit.** Did T0 change only approved coordination/governance paths? Was any
   source code, product repository, or out-of-scope file modified?
3. **Current-state truth.** Does the `docs/CURRENT_STATUS.md` 2026-09-19 overlay distinguish
   verified current state from historical text, and are its factual claims independently
   supportable from the exact revision and remote refs?
4. **Recorded refs accuracy.** Are the House / hub-web / SB01 refs recorded in the T0 evidence
   accurate against the actual remotes?
5. **SB01 boundary.** Is SB01 correctly recorded as an external dependency lane rather than
   House implementation scope, and is its current LR state (LR-2F not released) recorded
   accurately?
6. **PRE-01 runtime repair.** The evidence records one repaired runtime defect
   (`RELAY_INSTALL_MANIFEST_MISSING_MODEL_PINS`) in the canonical Relay skill manifest and a
   re-install. Is that repair within the declared scope, correctly evidenced, and does it
   preserve Relay provenance integrity?
7. **Deviations.** Are deviations D-1 (native-swarm routing for implementation because
   `agent-opencode` fails the external CLI health gate) and D-2 (three pre-existing untracked
   shared-runtime files left untouched) correctly classified and honestly disclosed?
8. **Any false or unsupported claim** in the T0 packet, including any product-readiness claim
   that House should not be making.

## Required verdict (LONG_RUN contract)

Exactly one of:

```text
BATCH_APPROVED
WORKER_FIX
SENIOR_REMEDIATION_REQUIRED
OWNER_DECISION_REQUIRED
STOP
```

Report must state: verdict, exact revision reviewed, checks actually performed with observed
results, findings (blocking vs non-blocking), any unsupported claim found, and untested areas.

## Prohibited

- No file modification of any kind.
- No secret values in the report.
- No repair of findings (findings return to the responsible worker/Hermes).
- Do not print environment variable values or credentials.
