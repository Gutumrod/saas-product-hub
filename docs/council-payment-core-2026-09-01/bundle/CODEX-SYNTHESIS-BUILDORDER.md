# WSTERA Payment Core Round 3 Synthesis: Build Order + Endgame

## Problem understood

The question is how WSTERA should build the settled payment core after the architecture round.

The scope is not to redesign the architecture. The already-settled architecture is:

- A thin Billing Orchestrator above the Payment + Subscription Core.
- PromptPay adapter.
- Reconciliation.
- Dunning engine.
- Stripe as the primary recurring rail.
- Stripe PromptPay as an available PromptPay path with refunds.
- Existing `stripe-billing` product exists in `saas-product-hub`.
- WSTERA has multiple products that can become internal pilots.

The two decisions requested are:

- Build order: which pieces should be implemented first, in what milestones, and where the gates should sit.
- Endgame: whether this remains internal WSTERA infrastructure or becomes a Billing-as-a-Service product, and what extra work would be required to sell it.

The synthesizer role is limited to weighing the four expert answers E1-E4. I am not adding a new expert architecture beyond what their positions support.

## Verified facts

From the original brief:

- The payment core covers PromptPay and automatic card billing.
- Stripe is already settled as the recurring rail.
- Stripe PromptPay is part of the settled direction because it supports refunds.
- A thin Billing Orchestrator over the existing Payment + Subscription Core is already settled.
- PromptPay adapter, reconciliation, and dunning engine are already part of the target architecture.
- There is already a `stripe-billing` product in `saas-product-hub`.
- The evidence manifest references `products\stripe-billing\BRIEF.md` and multiple products including DocCraft, PawSpace, RentMatrix, booking, and WSTERA-Link.

From E1:

- E1 proposes 6 phases.
- E1 starts with Stripe Thailand preflight, API version pinning, and production secrets readiness.
- E1 puts Subscription Core gap closure before Stripe card end-to-end.
- E1 explicitly includes `grace_period -> expired` scheduled job.
- E1 explicitly includes atomic idempotency ledger.
- E1 puts Stripe card end-to-end before reconciliation and PromptPay.
- E1 puts reconciliation before PromptPay.
- E1 ends with production hardening, audit logging, API version audit, and live Thailand test.
- E1 recommends internal-first, then pivot to BaaS.
- E1 lists productization additions: multi-tenant isolation, self-serve onboarding, pricing model, Stripe Connect, refund workflow-as-service, PDPA, SLA, docs/SDK.
- E1 confidence is 82.

From E2:

- E2 proposes 9 phases.
- E2 frames the order as a "money correctness spine."
- E2 starts with evidence freeze and Stripe Thailand gate.
- E2 includes contract audit and boundary lock before implementation.
- E2 explicitly says not to rebuild or merge the core.
- E2 puts idempotency ledger and billing event persistence early.
- E2 puts PromptPay adapter before reconciliation.
- E2 says reconciliation must happen before production.
- E2 puts billing orchestrator host layer before card recurring and Stripe dunning.
- E2 includes PromptPay-only lifecycle and expiry/downgrade jobs.
- E2 includes first internal product pilot and multi-product rollout.
- E2 recommends self-use first, then BaaS later.
- E2 says the positioning should be "Thai-first billing ops layer," not a Stripe replacement.
- E2 confidence is 86.

From E3:

- E3 proposes groundwork plus 7 numbered phases.
- E3 starts with Thailand account confirmation, API version pinning, green tests, and idempotency ledger confirmation.
- E3 puts thin orchestrator plus Stripe card happy path for one product early.
- E3 explicitly says reconciliation and scheduled lifecycle jobs must come before PromptPay.
- E3 puts PromptPay adapter after reconciliation.
- E3 separates dunning/retry policy and says host-side policy should not be hard-coded.
- E3 requires proof with a second product before production cutover.
- E3 includes production cutover with real money.
- E3 puts productization behind a later gate.
- E3 recommends selling as BaaS eventually, but only after WSTERA dogfoods it for at least 1-2 billing cycles.
- E3 says internal-only burns option value.
- E3 confidence is 82.

From E4:

- E4 proposes 7 phases.
- E4 starts with Stripe Thailand account verification and preflight environment.
- E4 puts persistence and atomic idempotency ledger early.
- E4 puts PromptPay adapter before reconciliation.
- E4 implements reconciliation through Cloudflare Workers cron.
- E4 includes an automated subscription sweeper for `grace -> expired`.
- E4 puts the thin billing orchestrator as a later multi-product host layer.
- E4 ends with E2E verification and failure injection dry-run.
- E4 recommends Internal Core First clearly, then Stage 3 commercial productization after proven stability.
- E4 identifies risks: missed webhook causing lost money, idempotency gap causing double credit, non-Thai Stripe account, involuntary churn, cron drift, and scope creep.
- E4 confidence is 95.

Verification of the provided "consensus from raw":

- "Start with money/correctness first" is supported by 4/4 experts.
- "Do not start with UI" is consistent with the expert answers, although not every expert says this explicitly.
- "Do not start with PromptPay" is not supported as 4/4: E2 and E4 put PromptPay before reconciliation, though both still put money-safety foundations before or around it.
- "Reconciliation must come before PromptPay" is not supported as 4/4: E1 and E3 put reconciliation before PromptPay; E2 and E4 put PromptPay before reconciliation.
- "Reconciliation before production" is supported by 4/4 in substance.
- "Stripe card as recurring rail" is settled by the original brief and is directly emphasized by E1, E2, and E3; E4 focuses on Stripe preflight but does not explicitly restate card recurring as the primary rail.
- "Internal-first then productize BaaS" is supported by 4/4.
- "Not self-use only" is supported by E1, E2, and E3. E4 says Internal Core First and then Stage 3 commercial productization after proven stability, so E4 also preserves a productization path, but more conservatively.
- "Not sell immediately" is supported by 4/4.
- Productization requirements listed in the raw consensus are supported broadly, but the exact set is strongest in E1 and E2. E4 does not enumerate the same full commercial checklist.

## Areas of agreement

4/4 experts agree that the build should begin with money correctness and operational safety, not a polished customer-facing layer.

4/4 experts include a Stripe Thailand or Stripe environment preflight at the beginning:

- E1: Stripe TH preflight, account confirmation, API version pinning, production secrets.
- E2: evidence freeze plus Stripe TH gate.
- E3: Thailand account, API version, tests, idempotency confirmation.
- E4: Stripe account verification and preflight environment.

4/4 experts agree that idempotency or persistence correctness is an early requirement:

- E1: atomic idempotency ledger in Phase 1.
- E2: idempotency ledger plus billing event persistence in P2.
- E3: idempotency ledger confirmation in groundwork.
- E4: persistence and atomic idempotency ledger in P1.

4/4 experts agree that reconciliation is required before real production exposure:

- E1 puts reconciliation before PromptPay and before production hardening.
- E2 puts reconciliation after PromptPay adapter but before production.
- E3 says reconciliation must come before PromptPay and production cutover.
- E4 puts reconciliation before lifecycle sweeper, orchestrator, and final E2E verification.

4/4 experts agree that lifecycle automation cannot be left manual:

- E1 includes `grace_period -> expired` scheduled job.
- E2 includes PromptPay-only lifecycle and expiry/downgrade jobs.
- E3 includes scheduled lifecycle jobs and later dunning/retry policy.
- E4 includes automated subscription sweeper for `grace -> expired`.

4/4 experts agree that the path should be internal-first before external commercialization:

- E1: Internal-first, then pivot BaaS.
- E2: self-use first, then productize BaaS later.
- E3: BaaS, but WSTERA real use is a mandatory gate.
- E4: Internal Core First, then Stage 3 commercial productization after stability.

4/4 experts agree, directly or by phase structure, that productization is a later gate and not the next implementation step.

4/4 experts agree that external productization requires materially more than payment logic. The recurring themes are:

- Tenant isolation.
- Onboarding.
- Operational dashboard.
- Compliance.
- Support/SLA.
- Documentation.
- Refund/support workflows.
- Commercial model.

## Majority positions

3/4 experts clearly put Stripe/card recurring proof before or ahead of PromptPay as the main business-critical rail:

- E1 builds Stripe Card end-to-end before PromptPay.
- E2 builds card recurring and Stripe dunning after PromptPay/reconciliation, but still frames Stripe as part of the money correctness spine and the recurring rail.
- E3 builds Stripe card happy path before PromptPay.
- E4 does not explicitly prioritize card recurring before PromptPay; E4 puts PromptPay adapter early.

3/4 experts explicitly require proving the system inside WSTERA products before productization:

- E2 includes first internal product pilot and multi-product rollout.
- E3 requires one product, then a second product, then real-money cutover before productization gate.
- E4 requires internal core first and commercial productization only after proven stability.
- E1 says internal-first, but does not detail multi-product dogfooding phases as explicitly as E2/E3/E4.

3/4 experts treat Stripe account/API/environment confirmation as a hard gate, not just a setup step:

- E1 calls it Phase 0.
- E2 calls it part of P0 gate.
- E3 includes it in groundwork.
- E4 also starts there, but does not frame API version pinning as explicitly as E1/E3.

3/4 experts explicitly call out API version pinning or audit:

- E1: pin API version and later audit.
- E3: pin API version.
- E1 and E3 are explicit; E2's "contract audit + boundary lock" implies interface stability but does not specifically say API version pinning.
- E4 does not explicitly mention API version pinning.

Because only E1 and E3 explicitly mention pinning, the stricter statement is 2/4 explicit agreement, with E2 partially adjacent through contract audit.

3/4 experts identify the orchestrator as thin and host-facing rather than a replacement for payment/subscription core:

- E1: thin orchestrator.
- E2: billing orchestrator host layer, boundary lock, do not rebuild/merge core.
- E3: thin orchestrator.
- E4: thin billing orchestrator as multi-product host.
- This is effectively 4/4 when including E4, and it matches the settled architecture.

3/4 experts explicitly place productization behind a named later gate:

- E2: after internal pilot and multi-product rollout.
- E3: P7 productization gate.
- E4: Stage 3 commercial productization after stability.
- E1 says internal-first then pivot BaaS, but with less gated sequencing.

## Minority / dissent positions

The biggest split is the exact order of PromptPay adapter versus reconciliation.

E1 and E3 say reconciliation should be built before PromptPay:

- E1: reconciliation Phase 3, PromptPay Phase 4.
- E3: reconciliation and scheduled lifecycle jobs before PromptPay always.

E2 and E4 put PromptPay before reconciliation:

- E2: PromptPay adapter P3, reconciliation P4.
- E4: PromptPay adapter P2, reconciliation P3.

Therefore "reconciliation before PromptPay" is a 2/4 position, not unanimous.

However, "reconciliation before production" is still 4/4.

E4 is the most conservative about commercialization:

- E4 recommends Internal Core First clearly.
- E4 says commercial productization comes after stability is proven 100%.
- This is not a rejection of productization, but it is stricter than E1/E2/E3 in tone and gate severity.

E3 is the strongest dissent against internal-only:

- E3 says internal-only burns option value.
- E3 still requires dogfooding before selling, but its endgame leans more actively toward BaaS.

E2 is the most explicit about not rebuilding or merging core:

- E2 adds contract audit and boundary lock as a separate early phase.
- Other experts imply or follow the thin-orchestrator architecture, but E2 uniquely emphasizes this as a phase.

E4 is the only expert to explicitly name Cloudflare Workers cron for reconciliation.

E3 is the only expert to explicitly say retry/dunning policy should be host-side policy and not hard-coded.

E2 is the only expert to explicitly position the future product as a "Thai-first billing ops layer" rather than a Stripe replacement.

E1 is the most explicit about refund workflow-as-service and pricing model in the productization list.

## Missing evidence / unresolved questions

The expert answers do not provide direct inspected evidence from `products\stripe-billing\BRIEF.md`.

The expert answers do not confirm the current implementation state of the existing `stripe-billing` product.

It is unresolved whether `stripe-billing` already has:

- Atomic idempotency ledger.
- Billing event persistence.
- Subscription lifecycle jobs.
- Stripe webhook handling.
- Stripe card recurring proof.
- Stripe PromptPay adapter.
- Refund handling.
- Dunning behavior.
- Audit logs.
- Multi-product host boundaries.

It is unresolved whether the Stripe account is confirmed as Thailand-capable for the needed rails.

It is unresolved whether Stripe PromptPay behavior in the target account supports all required operational flows, including refund handling, expiration behavior, metadata, and reconciliation identifiers.

It is unresolved whether the team has pinned a Stripe API version.

It is unresolved whether production and test secrets are already separated and managed safely.

It is unresolved which system owns the canonical subscription state: Stripe, the internal Subscription Core, or a defined combination of both.

It is unresolved what the exact state machine is for subscription statuses such as active, past_due, grace_period, expired, canceled, and payment_pending.

It is unresolved how PromptPay-only subscriptions should behave if payment is late, partially paid, duplicated, reversed, or manually corrected.

It is unresolved what "auto card billing" means operationally for retry timing, customer communication, involuntary churn, and downgrade timing.

It is unresolved whether dunning should be fully internal, delegated to Stripe Billing where possible, or split by rail.

It is unresolved what failure-injection cases are required before production.

It is unresolved what the first internal pilot product should be.

It is unresolved what the second product should be for multi-product proof.

It is unresolved whether product-level billing differences require host-side policy config before the first pilot.

It is unresolved whether WSTERA needs a dashboard in the internal phase or only event logs/admin tools.

It is unresolved whether the future BaaS target customer is internal WSTERA products only, sister products, Thai SMEs, SaaS builders, agencies, or enterprise merchants.

It is unresolved what compliance bar applies before external sale: PDPA is named, PCI scope is implied by card billing, but no expert details a compliance implementation plan.

It is unresolved whether Stripe Connect is mandatory for BaaS or only needed if WSTERA collects on behalf of third-party merchants.

It is unresolved whether external merchants would bring their own Stripe accounts or pay through WSTERA-owned merchant infrastructure.

It is unresolved what SLA and support burden WSTERA is willing to accept.

## Synthesizer recommendation

Recommended direction:

Build WSTERA Payment Core as **Internal Core First with an explicit BaaS option gate**, not as self-use-only and not as an immediately sold Billing-as-a-Service product.

Recommended build order:

Phase 0: Evidence freeze, boundary lock, and Stripe Thailand preflight.

- Confirm current `stripe-billing` state from the existing product.
- Freeze the current evidence and contracts.
- Confirm the system boundary: thin Billing Orchestrator above Payment + Subscription Core.
- Do not rebuild or merge the existing core unless evidence proves it is necessary.
- Confirm Stripe Thailand account capability.
- Pin or audit Stripe API version.
- Confirm test and production secret separation.
- Define the minimum event model and subscription state machine before implementation.

Phase 1: Money correctness foundation.

- Implement or verify atomic idempotency ledger.
- Implement or verify billing event persistence.
- Make webhook processing replay-safe.
- Make duplicate event handling safe.
- Define audit logging for money-moving state changes.
- Define amount/currency/customer/product matching rules.
- Add core tests around duplicate events, out-of-order events, and retry paths.

Phase 2: Subscription lifecycle automation.

- Implement or verify scheduled lifecycle jobs.
- Cover `grace_period -> expired`.
- Cover payment pending expiry.
- Cover downgrade/cancel timing.
- Define cron/scheduler ownership.
- Add failure visibility for missed jobs and stale states.

Phase 3: Stripe card recurring vertical slice for one internal product.

- Build the thin orchestrator path for one product.
- Prove subscription creation, recurring charge, webhook update, dunning/retry behavior, and lifecycle outcome.
- Prefer Stripe-native recurring behavior where the settled architecture expects Stripe as the recurring rail.
- Keep WSTERA-specific product policy outside hard-coded payment logic.
- Produce evidence from test mode before any real-money cutover.

Phase 4: Reconciliation layer before production exposure.

- Poll or re-fetch payment state.
- Match amount, currency, customer, subscription, product, and provider identifiers.
- Detect missing webhook events.
- Detect paid-but-not-credited cases.
- Detect credited-but-not-paid cases.
- Produce operational logs or an admin review queue for mismatches.
- This phase must be complete before real production use of PromptPay or card billing.

Phase 5: PromptPay adapter and notification flow.

- Add PromptPay one-time/payment-pending flow.
- Support expiry behavior.
- Support user notification.
- Support reconciliation identifiers.
- Support refund handling if Stripe PromptPay is used as settled.
- Ensure PromptPay-only lifecycle rules are explicit.

Phase 6: Internal pilot with real WSTERA product.

- Pick one product with manageable blast radius.
- Run the full card recurring path.
- Run the full PromptPay path if it is in pilot scope.
- Verify payment, subscription state, dunning, reconciliation, logs, refund path, and expiry jobs.
- Do not call the core production-ready from health checks alone.

Phase 7: Second-product proof.

- Add a second WSTERA product.
- Prove the orchestrator is truly multi-product.
- Prove product-specific billing policy does not require core rewrites.
- Prove event isolation between products.
- Prove reporting and audit trail remain understandable.

Phase 8: Production hardening gate.

- Run E2E verification.
- Run failure injection dry-runs.
- Test missed webhooks.
- Test duplicate webhooks.
- Test out-of-order events.
- Test cron drift or missed scheduled runs.
- Test failed card retries and final downgrade/expiry.
- Test PromptPay expiry.
- Test refund workflow.
- Audit logs, alerting, and operational runbooks must be in place.

Phase 9: Productization decision gate.

- Only after at least 1-2 real billing cycles, decide whether to productize.
- If productizing, define the BaaS customer, merchant-of-record model, Stripe Connect need, pricing, support model, compliance scope, tenant isolation model, docs, dashboard, SDK/API surface, refund SLA, and onboarding workflow.
- Position as a Thai-first billing operations layer, not a Stripe replacement.

## Why this recommendation

The recommendation follows the strongest shared evidence from E1-E4: all four experts prioritize correctness and internal proof before commercialization.

The recommendation keeps the already-settled architecture intact: thin Billing Orchestrator over Payment + Subscription Core.

It accepts E2's useful boundary-lock warning because rebuilding or merging the core would create scope creep before the payment correctness spine is proven.

It accepts E1, E3, and the original brief that Stripe card recurring is central because Stripe is the settled recurring rail.

It accepts E4's risk framing because the named risks are concrete payment failures:

- Webhook miss can cause paid-but-not-credited or unpaid-but-active states.
- Idempotency gap can cause double credit.
- Non-Thai account can invalidate the local payment assumption.
- Involuntary churn can damage subscription revenue.
- Cron drift can break expiry or retry behavior.
- Scope creep can delay the money-safe core.

It resolves the PromptPay versus reconciliation disagreement by separating two claims:

- Reconciliation does not have to be fully productized before any PromptPay adapter code exists.
- Reconciliation does have to be complete before production exposure.

This is the only synthesis that respects all four positions without overstating a false 4/4 consensus.

It follows E3's point that internal-only burns option value, but it also follows E4's caution that selling too early creates SLA, compliance, and support obligations before operational maturity exists.

It follows E2's product positioning: the future commercial product should be a Thai-first billing ops layer, not a Stripe replacement.

It preserves optionality:

- WSTERA gets a usable internal core first.
- Multi-product proof creates evidence for productization.
- External BaaS remains possible without forcing premature tenant/compliance work into the first production milestone.

## Rejected alternatives + why

Rejected alternative: sell BaaS immediately.

Reason:

- 4/4 experts reject or avoid immediate external sale.
- External sale requires tenant isolation, onboarding, support, compliance, SLA, documentation, and refund operations.
- The current evidence only supports building and proving the internal core first.
- Selling before internal billing cycles would turn unknown operational failures into customer-facing incidents.

Rejected alternative: keep it self-use-only permanently.

Reason:

- E1, E2, and E3 explicitly preserve or recommend the BaaS path.
- E4 also allows commercial productization after stability.
- The multi-product nature of WSTERA creates a natural internal proof path that can later support commercialization.
- Internal-only would discard option value before the system has generated evidence.

Rejected alternative: start with UI/dashboard first.

Reason:

- 4/4 experts prioritize money correctness, Stripe preflight, persistence, idempotency, reconciliation, and lifecycle automation.
- No expert recommends UI as the first milestone.
- A dashboard before the money spine is reliable would expose incomplete state rather than fix correctness.

Rejected alternative: start with PromptPay as the main first milestone.

Reason:

- The original architecture settles Stripe as the recurring rail.
- E1 and E3 put card recurring before PromptPay.
- E2 and E4 put PromptPay earlier, but still require correctness foundations and reconciliation before production.
- PromptPay without idempotency, lifecycle jobs, and reconciliation creates the exact money-loss risks all experts are trying to avoid.

Rejected alternative: require reconciliation before any PromptPay adapter code exists.

Reason:

- This is only supported by E1 and E3.
- E2 and E4 put PromptPay adapter before reconciliation.
- The evidence supports a stricter production gate, not necessarily a strict coding-order ban.
- The safe synthesis is: PromptPay may be developed before or near reconciliation, but cannot go production before reconciliation works.

Rejected alternative: productize before second internal product proof.

Reason:

- E2 explicitly calls for internal pilot and multi-product rollout.
- E3 explicitly calls for product 2 proof before production cutover/productization gate.
- E4 requires proven internal stability.
- BaaS requires multi-tenant or at least multi-product behavior; one product is insufficient evidence.

Rejected alternative: build a large platform before proving one vertical slice.

Reason:

- E1, E2, E3, and E4 all phase the work around correctness gates and pilots.
- Premature platform work increases scope before the core payment failure modes are tested.
- The existing `stripe-billing` product should be audited and extended through a thin orchestrator rather than replaced by a large rewrite.

## Gate status

Current gate status: **NOT READY for implementation as a commercial BaaS product.**

Reason:

- All experts recommend internal-first before external productization.
- Missing evidence remains around current implementation state, tenant model, compliance scope, and operational support.

Current gate status: **READY to plan internal build phases.**

Reason:

- There is clear expert agreement on starting with Stripe/account preflight, money correctness, idempotency, persistence, reconciliation, lifecycle jobs, and internal proof.
- The high-level architecture is already settled from the previous round.

Current gate status: **NOT READY for production money movement.**

Reason:

- The provided input does not prove Stripe Thailand readiness.
- The provided input does not prove idempotency ledger readiness.
- The provided input does not prove reconciliation readiness.
- The provided input does not prove lifecycle jobs.
- The provided input does not prove card recurring E2E.
- The provided input does not prove PromptPay E2E.
- The provided input does not prove failure injection.

Current gate status: **NOT READY to declare consensus that reconciliation must precede PromptPay implementation.**

Reason:

- E1 and E3 support that order.
- E2 and E4 do not.
- The verified consensus is reconciliation before production, not reconciliation before any PromptPay work.

Current gate status: **READY to declare endgame direction.**

Reason:

- 4/4 experts converge on internal-first, then possible BaaS productization.
- No expert recommends immediate sale.
- No expert recommends permanently closing the BaaS option.

## Blockers before next gate

Before the next gate, the team needs evidence for the current `stripe-billing` implementation.

Required evidence:

- Current BRIEF and implementation state.
- Existing schema.
- Existing webhook handlers.
- Existing subscription state machine.
- Existing scheduled jobs.
- Existing idempotency behavior.
- Existing tests.
- Existing deployment/runtime assumptions.

Before implementation starts, the team needs Stripe preflight evidence.

Required evidence:

- Stripe account country/capability confirmation for Thailand.
- Card recurring capability.
- PromptPay capability.
- Stripe PromptPay refund behavior.
- API version decision.
- Test/prod secret separation.
- Webhook signing secret management.

Before production money movement, the team needs money-correctness evidence.

Required evidence:

- Atomic event claim or equivalent idempotency ledger.
- Persistent billing event table/log.
- Replay-safe webhook processing.
- Duplicate event tests.
- Out-of-order event tests.
- Amount/currency/customer/product matching tests.
- Audit log for subscription state changes.

Before PromptPay production use, the team needs reconciliation evidence.

Required evidence:

- Provider re-fetch or polling behavior.
- Pending payment resolution.
- Expired payment handling.
- Paid-but-not-credited detection.
- Credited-but-not-paid detection.
- Mismatch handling process.
- Refund handling process if Stripe PromptPay is used.

Before card recurring production use, the team needs lifecycle and dunning evidence.

Required evidence:

- Successful recurring card billing path.
- Failed charge retry path.
- Dunning policy.
- Grace period handling.
- Final downgrade/expiry behavior.
- Customer notification behavior.
- Host-side policy config if product rules differ.

Before multi-product rollout, the team needs orchestrator evidence.

Required evidence:

- Product boundary contract.
- Product-specific policy config.
- No hard-coded product behavior inside the payment core.
- Product isolation in events and subscriptions.
- Operational visibility by product.

Before BaaS productization, the team needs commercial and compliance decisions.

Required evidence or decisions:

- Target customer segment.
- Merchant-of-record model.
- Whether Stripe Connect is required.
- Tenant isolation model.
- Self-serve onboarding.
- Admin/customer dashboard.
- Pricing model.
- SLA and support process.
- PDPA scope.
- PCI scope.
- Docs and SDK/API surface.
- Refund SLA and dispute workflow.
- Operational runbooks.

## Confidence 0-100

Confidence: **87/100**

Reason for confidence:

- The internal-first then BaaS-later direction is supported by 4/4 experts.
- The money-correctness-first direction is supported by 4/4 experts.
- Stripe preflight and idempotency/persistence foundations are strongly supported across all four answers.
- Reconciliation before production is supported by 4/4 experts.
- The need for lifecycle automation is supported by 4/4 experts.
- The need for later productization work beyond core payments is strongly supported.

Reasons confidence is not higher:

- The input does not include inspected code or docs from `stripe-billing`.
- The exact PromptPay versus reconciliation implementation order is split 2/4 versus 2/4.
- The exact first internal pilot product is not identified.
- The exact compliance and merchant-of-record model for BaaS is unresolved.
- E4's 95 confidence raises the weighted caution level, but its PromptPay-before-reconciliation order conflicts with E1/E3.
- The synthesis can recommend gates and order, but cannot verify implementation readiness from the provided expert answers alone.