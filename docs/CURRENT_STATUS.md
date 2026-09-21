# SaaS Product Hub - Current Portfolio Status

**Reconciled:** 2026-09-21 (Asia/Bangkok) — House LONG_RUN T5 closure overlay; see below.
**Parent repository:** `Gutumrod/saas-product-hub`
**Parent branch/HEAD:** `work/house-production-closure-longrun-20260919 @ 59656d9` (T6 entry); governance base `master @ 1556d8a`
**Execution authority:** `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md` revision 3 + later explicit owner decisions
**Purpose:** current-state overlay. This file does not replace product PRDs, architecture contracts, gate evidence or historical daily logs.
**Latest Owner overlay:** 2026-09-21 (Owner rulings on R15 authorization and the `user_role` effective privilege)

---

## 2026-09-21 House Production Closure LONG_RUN (current)

Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001`. Workflow `WF-DEV-01 v1.3.0 / LONG_RUN` +
`WF-RELAY-01 v1.3.0` (runtime `kanban-external-agent-dispatch v2.5.3`).
Coordination branch: `work/house-production-closure-longrun-20260919`.

### Stage state

| Stage | Review | State |
|---|---|---|
| T0 House reconcile | B0 | **PASS / BATCH_APPROVED** |
| T1 R15 least-privilege preparation | B1 | **PASS / BATCH_APPROVED** (Owner ruling OPTION 3 on `public.profiles`) |
| T2 product-event signer hardening | B2 | **PASS / BATCH_APPROVED** |
| T3 shared fulfillment | B3 | **PASS / BATCH_APPROVED** |
| T4 Control read projection | B4 | **PASS / BATCH_APPROVED** (consumes SB01 LR-2F-A @ `96abe08`) |
| T5 readiness / apply / deploy / live proof | B5 | **PASS / BATCH_APPROVED** — predeploy 7 rounds; post-R15 re-review 6 rounds, final `BATCH_APPROVED` |
| R15 D0–D4 least-privilege transition | within T5 | **EXECUTED AND VERIFIED** |
| T6 final reconciliation + dependency matrix | B6 | **ENTERED — WU01..WU03 in progress** |

### Verified production state (measured, not asserted)

- **Application repo.** `Gutumrod/hub-web`, branch `work/house-platform-closure-20260919 @ 4071307`
  (clean, parity with origin). **45 commits ahead of `main @ 8a3e493`.**
- **Worker.** `hub-web` version **`5dc81232-c116-4722-a6c1-74c15ad50385`** live on `wstera.com` and
  `platform.wstera.com`. Rollback-addressable: `9a004fa9` → `00bdb1b5` → `9db4fb70`.
- **Live proof.** 16/16 PASS (HTTPS both hosts, HTTP→HTTPS 301 both, HSTS/XCTO/XFO/CSP both routes,
  health 200, both unsigned webhooks rejected by the application with 401 invalid signature, billing
  read route failing closed).
- **Zone `wstera.com`.** `always_use_https: on`, `min_tls_version: 1.2`.
- **R15 — CLOSED at implementation level.** The hub-web runtime **no longer connects as the `postgres`
  owner identity**; it connects as the dedicated scoped role **`hub_web_app`**. Verified: `current_user`
  / `session_user` = `hub_web_app`; every owner-only privilege denied `42501` (UPDATE/DELETE on
  `products`, SELECT on `profiles`, CREATE TABLE, CREATE SCHEMA, DROP TABLE, ALTER TABLE, TRUNCATE).
- **Schema (Project A).** `public` went from 3/9 to **9/9 tables and 9/9 enums**, matching
  `drizzle/schema.ts` exactly. Migration `0008_product_installations.sql` (new, additive) plus the
  existing `0007` filled the gap. **`product_installations` and all five `fulfillment_*` tables exist
  and are reachable by the runtime** — previously the live Worker had no tables behind its
  product-installation and fulfillment write paths.
- **Precise privilege claim (Owner ruling 2026-09-21).** The explicit grant set for `hub_web_app` equals
  the reviewed R15 matrix exactly, with no explicit grant beyond it. One **effective** privilege outside
  that explicit set exists: `USAGE` on `public.user_role`, inherited through PostgreSQL's PUBLIC default
  for that enum type. It was not granted by this task and does not confer access to `public.profiles`.
- **Capabilities.** `PRODUCT_EVENT_SIGNERS` and `BILLING_CORE_CONTROL_READ_*` are **absent in this
  environment → both capabilities inert and fail-closed**.

### Claims permitted by the evidence

`BUILD_PASS` and `LIVE_PROVEN` (code-only deploy scope). **NOT** `PRODUCTION_READY` and **NOT**
`OPERATED_STABLE`.

### Open items

| Item | State |
|---|---|
| Capability material (`PRODUCT_EVENT_SIGNERS`, `BILLING_CORE_CONTROL_READ_*`) | absent — needs real material via the canonical secret channel + a reviewed provisioning procedure |
| Control request correlation | design only (`CONTROL-READ-CORRELATION-DESIGN-2026-09-20.md`) — blocks `PRODUCTION_READY` |
| Owner-authenticated surfaces (login, Work Queue, Owner Inbox, Agent Activity) | pending Owner-visible verification |
| Synthetic fulfillment end-to-end path | not exercised |
| Billing deny in Project A | **absence-invariant** (schemas not present there), explicitly **not** a DENY PASS; re-verify when `billing_core` is created in Project A per Master Plan §10 D3 |
| PR / default-branch disposition | **pending Owner/repo-governance decision** — the closure branch is 45 commits ahead of `main`; draft PR #1 targets `feature/platform-control-plane`, a different line (see `T6-WU01-REPO-PR-RECONCILE-2026-09-21.md`) |
| Stability evidence | absent — no `OPERATED_STABLE` claim |

### House-side capability now available to product lanes

Product/installation records and the fulfillment delivery/revocation tables are live and reachable. The
**storage and transport** half of fulfillment is available; the **activation and end-to-end proof** half
is not (signer material absent). No product lane is marked `PRODUCTION_READY` by House evidence — see
`T6-WU02-PRODUCT-DEPENDENCY-MATRIX-2026-09-21.md`.

---

## 2026-09-19 House Production Closure LONG_RUN — T0 (historical)

- **House coordination baseline was reconciled.** `origin/master` (`1556d8a`) became an ancestor of the
  LONG_RUN branch at `a502421`. The merge brought in WSTERA production-readiness governance (`9793a5b`)
  and the organization-wide cybersecurity program overlay (`1556d8a`); changed paths were governance
  documents only (`AGENTS.md`, `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md`). Prior House/SB01
  evidence history is preserved; no rebase/reset/force push occurred.
- **Hub/Control platform at that time.** `Gutumrod/hub-web` default `main @ 8a3e493`; active platform
  branch `feature/platform-control-plane @ 125af843` was 30 commits ahead of `main` with Draft PR #1
  open; the closure branch was identical to it at `125af843`.
- **R15 was OPEN** then: the runtime had not yet moved off the Project A owner identity. *(Superseded by
  the 2026-09-21 state above.)*

---

*Historical plan authority remains `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md`; this overlay
reflects current measured state and does not rewrite that authority.*
