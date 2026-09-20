RULING: (a) claim-wording defect only

FACTS VERIFIED: `server/routers.ts` exposes `customersTree` as `adminProcedure` and `executeBillingAction` as an admin-only mutation. `executeBillingAction` calls `controlPlaneService.dispatchCommand`. `ControlPlaneService` defaults to `DemoControlPlaneRepository`, which clones `DEMO_*` fixtures. `DemoCommandExecutor` contains the explicit “Deterministic simulation outcome hook (Phase 7)” and its `RETRY_PAYMENT` path only updates in-memory demo subscriptions/payments. No provider SDK or database call exists on this billing-action path. `billing-core-snapshot-router.ts` is read-only and preserves `canExecutePaymentActions: false`.

Correction: the broader statement that all of `server/control-plane` is fixture-only is too broad. `adapters/control-db.ts` and work-queue paths can use Supabase. The verified claim is narrower: this billing-action path is fixture-only.

REASONING: The endpoint is pre-existing, admin-only, simulation-scoped, and has no production billing/customer mutation path. Removing it would expand T5 scope contrary to the manifest. The defect is that the invariant wording overclaims endpoint absence rather than accurately describing the deployed surface.

EXACT REMEDY: Replace the invariant with:

> The deployed Control surface exposes an admin-only `customersTree` read endpoint and an admin-only billing-action endpoint. Billing actions operate solely through `DemoControlPlaneRepository` and `DemoCommandExecutor` over in-memory `DEMO_*` fixtures; they have no database, provider, Stripe, payment, subscription, or customer mutation path. The SB01 billing-core read path remains read-only, and `canExecutePaymentActions` is always literal `false`.

Required tests: admin-RBAC coverage; route-to-executor test proving billing actions use the demo repository; regression/static test proving no provider/DB call is reachable from `executeBillingAction`; existing billing snapshot tests proving read-only behavior and `canExecutePaymentActions: false`.

DEPLOY STATUS AFTER RULING: still blocked overall. This question is unblocked after the corrected wording and evidence are recorded, but B5-1, B5-2, B5-3, kill-switch/runbook requirements, request-correlation requirements, and the remaining reviewer conditions still block the intended deployment/activation window.

REVIEWER CONDITION SATISFIED: yes for condition #4, because the conflict is resolved by precise documentation of the existing simulation endpoint and its evidence boundary. It does not satisfy the other independent B5 conditions.

RESIDUAL RISK: The endpoint still looks like a billing mutation to operators and clients. If its demo-only boundary ever changes, this wording becomes false immediately. The broader Control surface must not be described as universally fixture-only.

UNTESTED AREAS: live deployed-route behavior; runtime proof that production configuration cannot replace the demo repository for this path; live provider/database isolation; actual WU05/WU06 deployment and smoke evidence.