# B5 FINDING-4 RULING — DECISION RECORD — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Decision authority: **Codex** (per the Owner's standing direction that, while away, decisions of this
kind should be taken by Codex rather than bounced back for confirmation)
Question raised by: the B5 pre-deploy review (independent reviewer = same Codex, separate session)
Recorded: 2026-09-20 (Asia/Bangkok) · Orchestrator: Hermes

## Ruling

**(a) claim-wording defect only.** The exposed billing-action endpoint is pre-existing, admin-only and
simulation-scoped; the defect is that this task's invariant wording overclaims *endpoint absence*
instead of accurately describing the deployed surface.

## Facts Codex verified

- `server/routers.ts` exposes `customersTree` as `adminProcedure` and `executeBillingAction` as an
  admin-only mutation.
- `executeBillingAction` calls `controlPlaneService.dispatchCommand`.
- `ControlPlaneService` defaults to `DemoControlPlaneRepository`, which clones `DEMO_*` fixtures.
- `DemoCommandExecutor` contains the explicit "Deterministic simulation outcome hook (Phase 7)" and its
  `RETRY_PAYMENT` path only updates **in-memory** demo subscriptions/payments.
- No provider SDK or database call exists on this billing-action path.
- `billing-core-snapshot-router.ts` is read-only and preserves `canExecutePaymentActions: false`.

## Correction to Hermes's own claim (accepted)

Codex flagged that Hermes's broader statement — *that all of `server/control-plane` is fixture-only* —
is **too broad**: `adapters/control-db.ts` and the work-queue paths can use Supabase. The verified
claim is **narrower and must be stated narrowly**: *this billing-action path* is fixture-only.

This is recorded as a Hermes over-broad claim, in the same class as the invariant wording the review
caught — the task's standard is that a claim is worth exactly what its evidence supports.

## Reasoning

The endpoint is pre-existing, admin-only, simulation-scoped, and has no production billing/customer
mutation path. **Removing it would expand T5 scope contrary to the manifest.** The defect is the
wording, not the code.

## Exact remedy — replace the invariant with this wording

> The deployed Control surface exposes an admin-only `customersTree` read endpoint and an admin-only
> billing-action endpoint. Billing actions operate solely through `DemoControlPlaneRepository` and
> `DemoCommandExecutor` over in-memory `DEMO_*` fixtures; they have no database, provider, Stripe,
> payment, subscription, or customer mutation path. The SB01 billing-core read path remains read-only,
> and `canExecutePaymentActions` is always literal `false`.

Required accompanying tests:

1. admin-RBAC coverage for both endpoints;
2. a route-to-executor test proving billing actions use the demo repository;
3. a regression/static test proving **no** provider/DB call is reachable from `executeBillingAction`;
4. the existing billing snapshot tests proving read-only behaviour and `canExecutePaymentActions: false`.

## Effect on the deploy

**Still blocked overall.** This question is unblocked once the corrected wording and its evidence are
recorded, but the following remain open and still block the intended deploy/activation window:

- BLK-B5-1 signer config not whole-config fail-closed
- BLK-B5-2 Billing Core accepts plaintext base URLs
- BLK-B5-3 readiness record bound to the wrong candidate revision
- the kill-switch and runbook requirements (the reviewer ruled these block capability activation)
- the Control request-correlation requirement (blocks `PRODUCTION_READY`)

Reviewer condition #4 is therefore **satisfied** by the ruling plus the corrected wording; the other
conditions are untouched by it.

## Residual risk (for the Owner)

The endpoint still **looks like** a billing mutation to operators and clients. If its demo-only boundary
ever changes, this wording becomes false immediately — which is exactly why the accompanying static
regression test (item 3) matters: it is what keeps the wording true rather than merely asserted. The
broader Control surface must not be described as universally fixture-only.

## Untested areas

Live deployed-route behaviour; runtime proof that production configuration cannot replace the demo
repository for this path; live provider/database isolation; the WU05/WU06 deployment and smoke evidence.
