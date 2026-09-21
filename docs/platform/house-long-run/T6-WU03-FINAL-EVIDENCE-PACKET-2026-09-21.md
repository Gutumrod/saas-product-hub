# T6-WU03 — FINAL HOUSE EVIDENCE PACKET

Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001` · Stage **T6** · Work Unit **T6-WU03**
Worker Rule: **Hermes** · Review Batch: **B6**
Status: **PREPARED — entered only on B5 `BATCH_APPROVED`**

> Every figure below was measured in this task's evidence set. Nothing here asserts a PASS by itself;
> it is the packet B6 will check.

---

## A. Required handoff fields

| Field | Value |
|---|---|
| Exact House commit | `Gutumrod/saas-product-hub` branch `work/house-production-closure-longrun-20260919` — see the latest commit on the branch at review time; the T6 entry commit was `59656d9`, preceded by `573c893` (T6-WU01 CURRENT_STATUS) |
| Exact hub-web commit | `Gutumrod/hub-web` branch `work/house-platform-closure-20260919` @ `407130718646d13630b9789f68522a521fc74483` |
| Default-branch disposition | **Explicitly dispositioned, not silently left** — see `T6-WU01-REPO-PR-RECONCILE-2026-09-21.md` §2. Closure branch is **45 commits ahead of `main`**; draft PR #1 targets `feature/platform-control-plane`, a different line. Three disposition options are stated; **the choice is an Owner/repo-governance decision and is NOT taken here.** |
| Deployed artifact / Worker identity | Worker `hub-web`, version **`5dc81232-c116-4722-a6c1-74c15ad50385`** live, built from `4071307`. Earlier versions `9a004fa9`, `00bdb1b5`, `9db4fb70` remain rollback-addressable. The credential was re-issued on 2026-09-21 (`R15-CREDENTIAL-REPAIR-INCIDENT-2026-09-21.md`); post-repair verification in `R15-POST-CREDENTIAL-REPAIR-VERIFY-2026-09-21.txt`. |
| Rollback-addressable versions | `9a004fa9` → `00bdb1b5` → `9db4fb70` (all three verified present in the deployment history) |
| Production Readiness state | **`BUILD_PASS` and `LIVE_PROVEN` (code-only deploy scope only).** Not `PRODUCTION_READY` (capabilities inert, correlation design-only). Not `OPERATED_STABLE` (no stability window). |
| R15 state | **APPLIED AND VERIFIED.** `hub_web_app` exists with the exact reviewed grants; `DATABASE_URL` switched; runtime identity confirmed `hub_web_app`; every owner-only privilege denied `42501` |
| Signer state | **absent / inert** — `PRODUCT_EVENT_SIGNERS` does not exist in this environment |
| Fulfillment state | Tables **live and reachable** (5 `fulfillment_*` + `product_installations`); **end-to-end path not exercised**; runbook `BILLING-CORE-READ-FULFILLMENT-RUNBOOK-2026-09-20.md` |
| Control / SB01 read boundary state | Narrow billing-action path proven fixture-scoped; **no whole-Control-surface claim** (the pre-existing admin `customersTree` still enumerates demo fixtures). T4 consumes SB01's accepted LR-2F-A projection over HTTP. |
| Billing deny (Project A) | **absence-invariant**, explicitly **NOT** a DENY PASS; mandatory re-verification when `billing_core` is created in Project A (Owner disposition A) |
| **Current House worktree state** | **NOT fully clean — 3 untracked files** under `docs/platform/shared-runtime/`: `BRIEF-HOUSE-SELL-READY-LONG-RUN-2026-09-16.md`, `RUN-MANIFEST-HOUSE-SELL-READY-LONG-RUN-2026-09-16.md`, `TASK-HOUSE-SHARED-RUNTIME-ISOLATION-001.md`. They are **not this task's files and were not created by it** — captured as pre-existing in the session-start snapshot and labelled "not mine" at `T1-WU01-CARRYFORWARD-FINDINGS.md:32-36`. They belong to a different workstream. All **tracked** revisions are at parity with their remotes and `git diff --check` is clean. Disposition: left untouched; committing another workstream's drafts would be an unauthorised scope expansion and deleting them would destroy that workstream's work. **An Owner/workstream decision is required** if the final state must be a fully clean worktree. |
| Remaining House blockers | (1) capability material absent — signer + billing-read; (2) Control request correlation design-only; (3) Owner-authenticated surfaces unverified; (4) synthetic fulfillment E2E not exercised; (5) PR/default-branch disposition pending Owner/governance; (6) stability evidence absent |

## B. Claim discipline B6 will check

- **No `OPERATED_STABLE`** — no stability window/sample evidence exists.
- **No whole-Control-surface claim** — only the narrow billing-action path is proven fixture-scoped.
- The reachability claim is bounded to the **static import closure** of the billing-action path; dynamic
  imports, runtime DI and bundler substitution are outside it.
- A fail-closed scanner run is **not** a clean PASS. Latest scan: **official relay scanner, 0 findings
  across every R15 evidence file**; no committed file contains a credential literal.
- **Clean-state precision:** *tracked* revisions are at parity and `git diff --check` is clean, but the House
  worktree is **not fully clean** — three untracked files from an unrelated workstream remain (see the row above).
  Any claim of a fully clean worktree would be inaccurate and is not made.
- **Precise privilege claim** (Owner ruling 2026-09-21): *explicit grants = exact matrix; effective
  privileges = exact matrix plus the recorded PostgreSQL PUBLIC-default exception on `user_role`. The
  exception was not granted by this task and does not confer access to `public.profiles`.*
- Live production claims are limited to what was measured: HTTPS on both hosts, HTTP→HTTPS 301 both,
  HSTS/XCTO/XFO/CSP both routes, health 200, both unsigned webhooks rejected by the **application**
  (401 invalid signature — with the edge-block `1010` case explicitly excluded), billing read route
  failing closed. **16/16 PASS.**

## C. AUTO_GATE checks to run at T6

1. `docs/CURRENT_STATUS.md` vs exact refs consistency
2. no stale HOLD/PASS contradictions in the current overlay
3. branch/upstream parity (both repos)
4. `git diff --check`
5. exact evidence links resolve
6. no product-source changes in the House diff

## D. Evidence index (exact paths under `docs/platform/house-long-run/`)

**Stage gates / reviews**
`B0-REVIEW-CLOSURE-2026-09-19.md` · `B1-REVIEW-CLOSURE-2026-09-20.md` · `B2-REVIEW-OUTCOME-2026-09-20.md` · `B3-REVIEW-OUTCOME-2026-09-20.md` · `B4-REVIEW-CLOSURE-2026-09-20.md` · `B5-PREDEPLOY-REPORT-CODEX-2026-09-20.md` · `B5-R2-REVIEW-REPORT-CODEX-2026-09-20.md` · `B5-R3-REVIEW-REPORT-CODEX-2026-09-20.md` · `B5-R4-REVIEW-REPORT-CODEX-2026-09-20.md` · `B5-R5-REVIEW-REPORT-CODEX-2026-09-20.md` · `B5-R6-REVIEW-REPORT-CODEX-2026-09-20.md` · `B5-R7-REVIEW-REPORT-CODEX-2026-09-20.md` · `B5-CLOSURE-REVIEW-REPORT-CODEX-2026-09-20.md` · `B5-RER15-REVIEW-REPORT-CODEX-2026-09-21.md` (+ review #2)

**T5 readiness / deploy / live proof**
`T5-CANDIDATE-FREEZE-2026-09-20.md` · `T5-PRODUCTION-READINESS-RECORD-2026-09-20.md` · `T5-WU03-PREDEPLOY-QUALIFICATION-2026-09-20.md` · `T5-WU05-OPERATOR-CONTRACT-2026-09-20.md` · `T5-WU05-WU06-EXECUTION-AND-LIVE-PROOF-2026-09-20.md` · `T5-WU06-LIVE-PROOF-SCRIPT.py` · `T5-WU06-LIVE-PROOF-RESULT-2026-09-20.txt` · `T5-WU06-PRE-DEPLOY-BASELINE-2026-09-20.txt`

**R15**
`R15-D0-PREFLIGHT-OUTCOME-2026-09-20.md` · `R15-D0-BASELINE-EVIDENCE-2026-09-20.json` · `R15-D0-TOPOLOGY-EVIDENCE-2026-09-20.json` · `R15-D0-DRIFT-EVIDENCE-2026-09-20.json` · `R15-D0-DECISION-REQUEST-BILLING-DENY-2026-09-20.md` · `R15-D0-DECISION-OUTCOME-2026-09-20.md` · `R15-D0-SCHEMA-REMEDIATION-PROPOSAL-2026-09-20.md` · `R15-D0-DRYRUN-EVIDENCE-2026-09-20.txt` · `R15-SCHEMA-REMEDIATION-APPLIED-2026-09-21.txt` · `R15-D0-RERUN-AFTER-REMEDIATION-2026-09-21.txt` · `R15-D1-PROVISION-OUTPUT-2026-09-21.txt` (SUPERSEDED banner - checker defect, not state) · `R15-D1-FRESH-EVIDENCE-2026-09-21.txt` (current) · `R15-POST-CREDENTIAL-REPAIR-VERIFY-2026-09-21.txt` · `R15-CREDENTIAL-REPAIR-INCIDENT-2026-09-21.md` · `R15-D1-VERIFY-OUTPUT-2026-09-21.txt` · `R15-D2-PRESWITCH-PROOF-2026-09-21.txt` · `R15-D3-SWITCH-AND-RUNTIME-VERIFY-2026-09-21.txt` · `R15-D1D2D3-REVERIFY-AFTER-USERROLE-RULING-2026-09-21.txt` · `R15-D4-EVIDENCE-CLOSURE-2026-09-21.md` · `R15-D0-BASELINE-PROBE.mjs` · `R15-D0-TOPOLOGY-PROBE.mjs` · `R15-D0-DRIFT-PROBE.mjs` · `R15-D0-DRYRUN-PROBE.mjs` · `R15-D1-PROVISION-PROBE.mjs` · `R15-D1-VERIFY-PROBE.mjs` · `R15-D2-PRESWITCH-PROBE.mjs` · `R15-D3-SET-SECRET-PROBE.mjs` · `R15-D3-VERIFY-PROBE.mjs` · `R15-0008-PRODUCT-INSTALLATIONS-DRAFT-NOT-APPLIED.sql` · `R15-0008-AS-APPLIED-2026-09-21.sql`

**Owner decisions**
`OWNER-DECISION-R15-AUTHORIZATION-2026-09-20.md` · `OWNER-DECISION-USERROLE-EFFECTIVE-PRIVILEGE-2026-09-21.md` · `T1-RLS-DECISION-RECORD-2026-09-20.md` · `OWNER-HOLD-T5-R15-AUTHORITY-2026-09-20.md` (SUPERSEDED, historical)

**T6**
`T6-WU01-REPO-PR-RECONCILE-2026-09-21.md` · `T6-WU02-PRODUCT-DEPENDENCY-MATRIX-2026-09-21.md` · this packet (all three committed to this directory in T6)

**Operational records (hub-web repo)**
hub-web repo: `docs/control-plane/BILLING-CORE-READ-FULFILLMENT-RUNBOOK-2026-09-20.md` · `docs/control-plane/CAPABILITY-KILL-SWITCH-ESCALATION-2026-09-20.md` · `docs/control-plane/CONTROL-READ-CORRELATION-DESIGN-2026-09-20.md`
hub-web repo: `apps/hub-web/drizzle/migrations/0007_shared_one_time_fulfillment.sql` · `apps/hub-web/drizzle/migrations/0008_product_installations.sql`

## E. Final stop condition (verbatim from the manifest)

On B6 `BATCH_APPROVED`:

```
READY FOR OWNER HOUSE CLOSURE REVIEW — WSTERA-HOUSE-PRODUCTION-CLOSURE-001
```

**No automatic Owner acceptance.**
