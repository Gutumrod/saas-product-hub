# AGENT DISPATCH — T3 shared one-time product fulfillment — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Stage: T3 (shared one-time product fulfillment)
Review Batch: **B3 — Fulfillment Durability Boundary**
Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001`
Workflow: `WF-DEV-01 v1.3.0` / LONG_RUN
Workspace (absolute): `D:\AI-Workspace\projects\saas-product-hub`
Allowed write scope: `apps/hub-web/server/**`, plus the Drizzle migration directory for the new
fulfillment state only
Repository for source: `Gutumrod/hub-web` branch `work/house-platform-closure-20260919`
Base revision: `e24d5a91742f0c841fea395f01e864e5fe8fa1a5`
Reuse Gate: **PASS** — `docs/platform/house-long-run/T3-REUSE-GATE-2026-09-20.md`
Recorded: 2026-09-20

## Objective

Implement the P1/L4 shared fulfillment capability **once** in Hub, for later use by MT01/CM01/HC01,
without implementing those products.

## Locked capability contract (Production Master Plan — do not reinterpret)

Source: `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md`

- `:503-507` (§P1 item 5) — "Build the one-time product fulfillment path as a Hub capability in its
  own right, not as metadata attached to something else. It must deliver an artifact or repository
  grant to a buyer, be idempotent under repeated and retried delivery, fail visibly rather than
  silently, record who received which immutable version, and support revocation and re-issue.
  This is the L4 rung for MT01, CM01 and HC01, and it is built once and shared. It carries whatever
  commercial terms the CEO's separate plan sets and defines none of them."
- `:894` R13 — L4 built once as the P1 Hub capability with idempotent, revocable, recorded delivery
- `:368` L4 gate — "A buyer can complete purchase and receive the artifact or repository access
  through a path that has been exercised end to end, including a failed and a repeated delivery."

## Must

1. Accept an **already-authoritative** purchase/entitlement input contract **without becoming payment
   truth**. The Hub must not create, mutate, or locally own billing/subscription/customer state.
2. Bind recipient to an **immutable artifact / repository version**.
3. Deliver/grant **idempotently**: repeated and retried delivery must be safe.
4. **Fail visibly and durably** rather than silently — a failed delivery must leave inspectable state.
5. **Audit** who received which immutable version.
6. Support **revoke**.
7. Support **reissue**.
8. Never package WSTERA production secrets.
9. Keep product-specific artifact contents outside House scope (use a synthetic/non-product artifact).
10. Be built once as a shared Hub capability, not per-product.

## Reuse obligations from the Reuse Gate (copy-and-own, policy §6)

Record source version + immutable source commit + copy date + local changes for each:

| Base | Use |
|---|---|
| `modules/audit-log/` (P0, v0.1.0) | recipient / immutable-version audit |
| `modules/file-storage/` (P0, v0.1.0) | artifact handoff abstraction |
| `modules/job-retry/` (P2, v0.3.0) | durable retry for delivery attempts |

Do not import across repositories by filesystem path. Do not adopt `modules/subscription` — the
Reuse Gate rejected it as a billing-truth engine.

## Required acceptance proof (Run Manifest T3)

A test artifact/grant must demonstrate, end to end:

1. first delivery/grant
2. repeated identical request → no duplicate harmful side effect
3. interrupted/failed delivery → resumable/visible state
4. re-delivery
5. revoke
6. reissue
7. immutable version/audit linkage
8. no payment mutation and no product-content implementation

## Prohibited

- No Stripe/provider SDK business logic, no provider secrets.
- No entitlement writes into a billing system; no local authoritative billing state.
- No direct mutation of `billing_core` / `billing_core_staging`.
- No change to `canExecutePaymentActions: false` semantics anywhere.
- No real WSTERA production secret in any artifact, test fixture, or package.
- Do not implement MT01/CM01/HC01 product content.
- No deploy, no production mutation in this stage.
- Do not weaken existing tests.

## Environment facts

- `apps/hub-web` has **no live-database harness** (no pg-mem/pglite) and must not gain one. The
  repo's convention for DB-contract coverage is source/SQL assertion (see
  `server/control-plane/work-truth-migration.test.ts`). Use the same convention, and where a control
  could silently disappear, pair it with a mutation probe as established at
  `server/webhooks/installIdempotency.test.ts`.
- Current gates to preserve: `npx tsc --noEmit` exit 0; `npx vitest run` 19 files / **213 tests**
  passing.

## Evidence to report

- files created/changed, and the copy-and-own provenance records for the three reused bases
- exact commands and results for `npx tsc --noEmit` and `npx vitest run`
- the eight acceptance proofs above, each with the test that demonstrates it
- explicit statement that no payment/billing state is mutated and no product content was implemented
- explicit statement that no production secret value appears anywhere
