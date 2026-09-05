# BK01 Order Capability — Parent Governance — Independent Expert: [EXPERT]

Gate: Proposal Review + Product Boundary Governance (independent expert input; Codex synthesizes the verdict)
Procedure: `llm-council-gate` v0.3.2
Date of analysis: 2026-09-05
Frozen brief: `docs/council-bk01-order-capability-2026-09-05/COUNCIL-BRIEF.md`
Checkpoint: `master @ 7b66b2f` (ahead origin/master by 1, not pushed)

---

## 1. Recommendation

**APPROVE PHASE 0** — allow BK01 Order capability to enter formal Phase 0 (Product Boundary Decision + Order V1 Contract + Reuse Gate), **with two explicit conditions**:

1. **Phase 0 is documentation-only.** It authorizes a dated superseding product-boundary decision and an Order V1 contract. It does NOT authorize production code, migration, Supabase apply, deploy, merge, or any change to locked BK01 contracts.
2. **Order production implementation is gated behind (a) Reuse Gate PASS and (b) BK-A runtime baseline closeout.** Phase 0 documentation may run in parallel with BK-A remediation, but no Order migration may be stacked onto the BK01 runtime until the BK-A remediation / DB-runtime baseline is reconciled or explicitly checkpointed (per CURRENT_STATUS: BK-A is the next eligible heavy track; CONT-03 and DB-backed gates remain open).

The proposal's boundary is coherent, Booking is preserved as the appointment authority, the non-goals are correctly scoped, and the proposal correctly asks to supersede the appointment-only boundary without silently rewriting historical locked documents. The reuse classification is decidable now (USE+ADAPT for the catalog master-data portion; MISSING for the order lifecycle/capacity engine). The main residual risk is sequencing and the risk of an unjustified duplicate catalog implementation, both of which the conditions above close.

---

## 2. Verified facts / evidence used (with paths)

- **Frozen brief** — `docs/council-bk01-order-capability-2026-09-05/COUNCIL-BRIEF.md`. Authorizes Proposal Review + Product Boundary Governance only; experts do NOT issue the final gate verdict.
- **Proposal** — `docs/proposals/BK01-ORDER-CAPABILITY-PROPOSAL-2026-09-05.md`. Proposes `Business Portal → Booking + Order + future Claim integration`; Booking remains appointment authority; Order owns catalog, order lifecycle `DRAFT→CONFIRMED→IN_PROGRESS→READY→COMPLETED`, production lead days, workshop production calendar, daily production capacity, capacity reservation, earliest/requested/promised ready dates, customer pre-order mobile flow. Order→Booking link only when Order is `READY`, same staff+time authority, cannot displace existing Booking, separate lifecycles. Explicit non-goals: no inventory/warehouse/ERP/POS/shipping/BOM/routing/lift-bay-room-equipment scheduling. Claim/case remains outside Order V1; future claim integration reuses CM01-owned lifecycle.
- **Prototype lock** — `prototypes/bk01-order-portal/PROTOTYPE-LOCK-2026-09-05.md`. FROZEN/OWNER-REVIEWED; visual/product contract reference only, not production implementation. Locked behavior items 1–10 confirm Booking remains appointment authority, Order-linked Booking only after `READY`, separate lifecycles, no auto-completion, no raw capacity units exposed to customer. Non-goals of the lock match the proposal.
- **Prototype hashes verified on disk** — `sha256sum` of `prototypes/bk01-order-portal/index.html` = `571a67d6...c4bf1` and `customer.html` = `fafa02b1...d1e60`, matching the lock record exactly.
- **BK01 Product Source of Truth** — `docs/council-product-destination-2026-09-03-canonical-01/01-product/BK01/PRODUCT-SOURCE-OF-TRUTH.md`. Locked target with remediation required; governing docs include `00_PRODUCT_VISION.md`, `01_PRD.md`, `05_BOOKING_DOMAIN_RULES.md`, `06_UX_USER_FLOWS.md`, `10_DEVELOPMENT_ROADMAP.md`, `PRODUCT_DECISIONS.md` (all LOCKED 2026-08-28). Traceability rule: no V1 feature accepted unless mapped to locked contract with release evidence.
- **BK01 Product Scope** — `.../01-product/BK01/PRODUCT-SCOPE.md`. V1 product-defining capabilities are appointment operations; explicit non-goals include POS, inventory, payroll, accounting, ERP, marketplace, multi-branch. Current implementation is not yet sellable V1.
- **BK01 Effective Product Gate** — `.../01-product/BK01/EFFECTIVE-PRODUCT-GATE-STATUS.md`. Effective verdict = **PASS** (per PRODUCT-GATE-META-AUDIT + Owner Decision 2026-09-03); historical REMEDIATE is provenance only. Later-gate remediation items carried forward to their classified gates.
- **BK01 Open Decisions** — `.../01-product/BK01/OPEN-DECISIONS.md`. OD-001 auto-slip, OD-002 pricing, OD-003 LINE allowance, OD-004 cancel/reschedule windows, OD-005 DB runtime approval, OD-006 blacklist. OD-005: DB-backed gates are `BLOCKED_ENVIRONMENT`; public V1 cannot pass without runtime evidence.
- **BK01 Business/Market** — `.../01.5-business-market/BK01/BUSINESS-MARKET-SYNTHESIS.md`. Verdict PASS (document-level only); merchant-paid recurring subscription; Trial/Basic/Pro ladder; pilot WTP/retention/outcome evidence is downstream validation, not a current blocker.
- **Portfolio registry** — `docs/products/registry.yaml`. BK01 (booking) = subscription_saas, shared_runtime, Project B, `local_service` schema, commercial_status sellable, acceptance operations/commercial false. HC01 (headless_commerce) = one_time_source_product, source_product, wave 2, modules include product-catalog, deferred to P5. CM01 (booking_ticket_module) = one_time_source_product, own family, explicitly NOT grouped with BK01. TT01 (tracking) = source_product, own family, unrelated to booking. MT01 (multi_tenant_ai) = one_time_source_product, source_product, modules: tenant-context, ai-provider, enterprise-features, auth-supabase, payment, subscription, webhook-receiver.
- **Module Reuse Policy** — `docs/platform/MODULE-REUSE-POLICY.md`. CANONICAL/MANDATORY, effective 2026-09-04. Reuse Before Build; mandatory capability classification USE / USE+ADAPT / NOT APPLICABLE / REJECT WITH JUSTIFICATION / MISSING CAPABILITY. MT01 bootstrap rule applies to SaaS/backend/multi-tenant/bootstrap concerns. Copy-and-own contract; provenance must name immutable upstream commit. Hard gate: `STOP — REUSE GATE FAILED / UNJUSTIFIED_DUPLICATE_IMPLEMENTATION`. New capability work may not use the `Reuse Gate: N/A` exemption.
- **Portfolio status** — `docs/CURRENT_STATUS.md`. BK-A remediation is the next eligible heavy track; CONT-03 and DB-backed gates remain open. HC01 deferred to P5 except authorized HC-A cleanup. MT01 reference server only, deferred to P5/L0-L5.
- **Strategy layer model** — `docs/strategy/WSTERA-LAYER-MODEL.md`. DRAFT — COUNCIL REVIEW COMPLETE — OWNER REMEDIATION PENDING. Portfolio work remains Layer 1; Layer 2/3 require separate authorization. Layer 1 anti-scope-creep rule: "Agent-ready" must never justify adding speculative capability.
- **Module Hub registry** — `D:\AI-Workspace\projects\modules-hub\modules\REGISTRY.md`. 24 registered modules; **no Order, no production-capacity, no made-to-order module exists**. Product Catalog = `product-catalog` v0.1.0 ✅ Completed.
- **Product Catalog module DESIGN** — `D:\AI-Workspace\projects\modules-hub\modules\product-catalog\DESIGN.md`. Manages products, variants, brands, categories, custom attributes, product media, catalog search/filter. **Explicitly EXCLUDES**: cart, checkout, order fulfillment, payment, table/room booking & reservations, promotion engine. Phase 1 adapters = CSV data + local media only; Supabase/Postgres and R2 are future phases.
- **HC01 product-catalog** — `products/headless-commerce/modules/product-catalog/` (BRIEF.md, MODULE.md, DESIGN.md). Same canonical module embedded in headless-commerce; HC01 deferred to P5. Reuse source is modules-hub canonical, not HC01's copy.
- **Ticket systems disambiguation** — `docs/platform/TICKET_SYSTEMS_DISAMBIGUATION.md`. TT01 (tracking) and CM01 (booking_ticket_module) are separate products, own families, unrelated to booking's native ticket system. No overlap with an Order capability.
- **Locked BK01 PRD** — `products/booking/docs/01_PRD.md` (LOCKED 2026-08-28). V1 is appointment operations; FR-BKG-* availability/collision, FR-DEP-* deposits, FR-LIFE-* lifecycle, FR-SUP-001 native ticket/case as operational support only. No Order capability exists in the locked contract.
- **Locked BK01 Vision** — `products/booking/docs/00_PRODUCT_VISION.md` (LOCKED 2026-08-28). Category: appointment operations SaaS; explicit non-goals include POS, inventory, payroll, accounting, ERP, marketplace, multi-branch. No Order capability in the locked vision.

---

## 3. Boundary findings

1. **The proposed boundary is coherent.** `Business Portal → Booking + Order + future Claim integration` cleanly separates Booking (appointment authority: date/time, staff availability, schedule, working hours/breaks/holidays, duration, collision prevention, booking lifecycle, booking-specific payment/deposit) from Order (product/made-to-order catalog, immutable order line snapshots, order lifecycle, order payment status kept separate, production lead days, workshop production calendar, daily production capacity, capacity reservation, earliest/requested/promised ready dates, customer pre-order mobile flow). The two lifecycles are explicitly separate; completing a Booking does not complete the Order.
2. **Booking is preserved as the appointment authority.** The Order→Booking link is correctly constrained: allowed only when Order is `READY`, uses the same staff+time authority as a normal Booking, cannot bypass/move/displace an existing Booking, installation duration explicit, staff persisted into the Booking must be the staff whose availability was checked. This preserves the locked booking domain rules (availability, collision, hold, deposit) rather than creating a second appointment scheduler.
3. **The non-goals are correctly scoped.** The proposal and the prototype lock both exclude inventory/warehouse, suppliers/purchasing, accounting/ERP/POS, shipping carrier engine, marketplace sync, BOM/production routing, worker workload optimization, lift/bay/room/machine resource scheduling, generic resource-booking engine, automatic cross-module payment aggregation, and automatic Booking→Order completion. These exclusions keep Order V1 bounded and prevent drift into ERP/POS/warehouse territory.
4. **The capability activation model is a new concept requiring explicit decision.** The proposal's `booking_enabled` / `order_enabled` / `claim_enabled` shop-level capability model, with "stop new intake, keep history visible, never delete/hide business history" behavior, is not present in any locked BK01 document. It is a reasonable tenancy-preserving model (do not rename `shops`/`shop_users`/`shop_id`), but it must be explicitly decided in Phase 0A, not assumed.
5. **The many-to-many Order→Booking link is correctly flagged as open.** The proposal explicitly says a many-to-many link model should be evaluated in the formal contract rather than assuming one Order always has exactly one Booking. This is the right call and must be locked in Phase 0B.

---

## 4. Reuse findings (with module classification)

Per MODULE-REUSE-POLICY, the Order V1 capability decomposes into two distinct required capabilities:

### 4a. Product / made-to-order catalog master data — **USE + ADAPT**

- **Candidate inspected:** `modules-hub/modules/product-catalog` v0.1.0 (✅ Completed), and HC01's embedded copy at `products/headless-commerce/modules/product-catalog/`.
- **Classification: USE + ADAPT.** The canonical `product-catalog` module satisfies the catalog master-data requirement (products, variants, brands, categories, custom attributes, product media, search/filter). Per the copy-and-own contract, BK01 must copy the reviewed module into the destination repository, own that copy, adapt only the destination-owned copy, and record provenance (immutable upstream commit). The reuse source is **modules-hub canonical**, not HC01's copy (HC01 is a separate product deferred to P5).
- **Adaptation required:** The module's Phase 1 adapters are CSV data + local media only. BK01 runs on a Supabase/Postgres runtime (`local_service` schema, Project B). Therefore BK01 must implement/adapt a Supabase/Postgres `ProductRepository` and a suitable `MediaStorage` adapter (R2/Supabase Storage) — these are future-phase adapters in the module design, so this is a legitimate USE+ADAPT, not a REJECT.
- **Boundary note:** The module explicitly EXCLUDES cart, checkout, order fulfillment, payment, and booking/reservations. So the module covers only the catalog master-data slice of Order V1; it does NOT cover the order lifecycle or capacity engine.

### 4b. Order lifecycle + production capacity engine — **MISSING CAPABILITY**

- **Candidate inspected:** modules-hub REGISTRY (24 modules) and INDEX.md. **No Order, no production-capacity, no made-to-order, no lead-time/ready-date module exists.** MT01's modules (tenant-context, auth-supabase, payment, subscription, webhook-receiver, enterprise-features, ai-provider) contain no catalog or order module.
- **Classification: MISSING CAPABILITY.** New implementation is allowed for: order lifecycle state machine (`DRAFT→CONFIRMED→IN_PROGRESS→READY→COMPLETED`), immutable order line snapshots, order payment status separation, production lead days, workshop production calendar, daily production capacity, capacity reservation, earliest/requested/promised ready-date computation, and the Order→Booking link. This is product-specific capability with no canonical reusable source.

### 4c. MT01 bootstrap — **APPLICABLE (PASS required before implementation)**

- Order V1 is a SaaS/backend/multi-tenant/bootstrap concern, so the MT01 bootstrap rule applies. MT01 must be inspected as a reference baseline for tenant context, Supabase auth, payment/subscription seams, webhook receiver, and central-platform integration seams. MT01 does NOT supply catalog or order capability, so its role is bootstrap reference only, not a runtime dependency.

### 4d. Reuse Gate status

- **Reuse Gate: NOT YET PASS — must be PASS before any Order production implementation.** The proposal itself correctly requires `Reuse Gate: PASS` before production implementation. The classification above (USE+ADAPT for catalog, MISSING for order/capacity) is the decidable input; the formal Module Reuse Check artifact must be produced in Phase 0B. If BK01 builds its own catalog instead of reusing the canonical module, that is `UNJUSTIFIED_DUPLICATE_IMPLEMENTATION` → Reuse Gate FAIL.

---

## 5. Product overlap findings

1. **HC01 (Headless Commerce) — partial overlap at catalog master-data level only, resolved by reuse.** HC01's `product-catalog` module is the same canonical module. Order V1's catalog overlaps HC01's catalog capability. This is NOT a product overlap requiring rejection: (a) HC01 is deferred to P5 (CURRENT_STATUS), (b) the reuse source is modules-hub canonical, not HC01's copy, and (c) Order V1 is not headless commerce — it has no cart/checkout/payment aggregation. The overlap is confined to catalog master data and is resolved by both products reusing the same canonical module (copy-and-own), not by duplicating.
2. **CM01 (Booking Claim & Case Management) — no overlap; correctly scoped out.** The proposal explicitly keeps claim/case handling outside Order V1 and says future claim integration should reuse the CM01-owned lifecycle rather than duplicate it inside BK01. This is consistent with the registry (CM01 is its own family, explicitly not grouped with BK01) and the disambiguation doc. No overlap.
3. **TT01 (Ticket & Service Tracking) — no overlap.** TT01 is a public-facing issue-reporting/ticket-tracking product, own family, unrelated to booking and to an Order capability. No overlap.
4. **No other portfolio product overlaps Order.** SB01 (billing), FF01, CA01, IO01, ET01, CO01, AR01, RM01, OD01, PS01, DC01, LK01, LN01, WS01 — none provide an order lifecycle or production-capacity capability. The only material overlap is the catalog master-data slice shared with HC01, resolved by canonical reuse.

---

## 6. Impact on BK01 locked appointment contracts

1. **Adding Order is a material product-boundary expansion.** The locked PRD (`01_PRD.md`), Vision (`00_PRODUCT_VISION.md`), and domain rules (`05_BOOKING_DOMAIN_RULES.md`) define BK01 as appointment operations only. Order introduces a new capability not present in any locked contract. This cannot be treated as a routine feature addition.
2. **The proposal correctly asks to supersede the appointment-only boundary where required, without silently rewriting historical locked documents.** This is the right governance posture. The locked docs must remain historical; a new dated superseding boundary decision (Phase 0A) must explicitly state which parts of the appointment-only boundary are superseded and which remain.
3. **The Order→Booking link must not silently change the locked booking domain rules.** The link uses the same staff+time authority, cannot displace existing bookings, and keeps lifecycles separate — this preserves the locked availability/collision/hold/deposit rules. Any change to those rules (e.g. a new booking state or deposit rule for Order-linked bookings) must be an explicit superseding decision, not an implicit side effect. The prototype lock notes Order-linked Booking deposit policy is `Not configured` — this must be explicitly decided in Phase 0B.
4. **The capability activation model (`booking_enabled`/`order_enabled`/`claim_enabled`) is a new tenancy concept.** It must be decided explicitly and must not alter the existing `shops`/`shop_users`/`shop_id` tenancy/security foundation. The "stop new intake, keep history visible, never delete/hide history" behavior must be locked to prevent capability toggles from hiding or deleting business history.
5. **Documents to supersede/amend/preserve:** Preserve historical `00_PRODUCT_VISION.md`, `01_PRD.md`, `05_BOOKING_DOMAIN_RULES.md`, `06_UX_USER_FLOWS.md`, `10_DEVELOPMENT_ROADMAP.md`, `PRODUCT_DECISIONS.md` as historical. Create a new dated superseding boundary decision (Phase 0A) and an Order V1 contract (Phase 0B). Do not edit the historical locked docs in place.

---

## 7. Required Owner decisions

1. **Approve the superseding product-boundary decision** — formally allow BK01 to become a modular Business Portal foundation with independent Booking and Order capabilities, superseding the appointment-only boundary where required, while preserving Booking as appointment authority.
2. **Approve the Order V1 contract scope** — lock domain terms, lifecycle, data model, capacity semantics, scheduler behavior, security/RLS, failure cases, audit requirements, acceptance criteria, and non-goals (Phase 0B).
3. **Decide the shop-level capability activation model** — approve `booking_enabled`/`order_enabled`/`claim_enabled` (or an alternative) and lock the disabled-capability behavior (stop new intake, keep history, never delete/hide history). Confirm it does not alter the existing `shops`/`shop_users`/`shop_id` tenancy/security foundation.
4. **Decide the Order→Booking link model** — approve the many-to-many link evaluation and confirm whether any locked booking domain rule (availability, collision, hold, deposit) is superseded for Order-linked bookings. Decide the Order-linked Booking deposit policy (currently `Not configured` in the prototype).
5. **Approve the reuse classification** — USE+ADAPT for the product-catalog module (copy-and-own from modules-hub canonical, with Supabase/Postgres + R2/Supabase-Storage adapter adaptation) and MISSING for the order lifecycle/capacity engine. Require the formal Module Reuse Check artifact and `Reuse Gate: PASS` before implementation.
6. **Approve the MT01 bootstrap applicability** — confirm MT01 is inspected as the SaaS/backend bootstrap reference (tenant context, Supabase auth, payment/subscription seams, webhook receiver) and record the MT01 Bootstrap Check result.
7. **Decide sequencing** — approve Phase 0 documentation-only running in parallel with BK-A remediation, and gate any Order production implementation behind BK-A runtime baseline closeout (reconcile/checkpoint the BK-A remediation / DB-runtime baseline before stacking Order migrations).
8. **Decide Order entitlement/pricing** — whether Order V1 is bundled in the BK01 subscription or is a separate entitlement/tier. This affects billing and the locked Trial/Basic/Pro structure (OD-002 pricing is provisional).
9. **Decide central-platform vs BK01 runtime ownership** — whether order data is product-runtime-owned (BK01 `local_service` schema) or central-platform-owned, per the MODULE-REUSE-POLICY platform boundary.

---

## 8. Risks / failure cases

1. **Unjustified duplicate catalog implementation (highest risk).** If BK01 builds its own product catalog instead of reusing the canonical `product-catalog` module, the Reuse Gate fails with `UNJUSTIFIED_DUPLICATE_IMPLEMENTATION` and the Implementation Gate cannot close. The proposal's own governance list requires the Module Reuse Check; this must be enforced.
2. **Scope creep into ERP/POS/warehouse.** Despite the explicit non-goals, an Order capability with production capacity and ready-date computation is adjacent to inventory/ERP territory. The non-goals must be enforced in the V1 contract and re-checked at each build step.
3. **Silent change to locked booking domain rules.** If the Order→Booking link introduces a new booking state, deposit rule, or availability behavior without an explicit superseding decision, it silently amends the locked appointment contract. This must be prevented by the Phase 0A superseding decision.
4. **Migration stacking on an unreconciled BK-A baseline.** CURRENT_STATUS shows BK-A remediation is the next eligible heavy track with CONT-03 and DB-backed gates still open. Stacking Order migrations before the BK-A runtime baseline is reconciled makes later migration failures unattributable. The pre-implementation baseline checkpoint is mandatory.
5. **Capability toggle hiding/deleting business history.** If the `order_enabled`/`booking_enabled` toggles are implemented to hide or delete history when disabled, it violates the proposal's own "never delete or hide business history" rule and the locked tenant-safety principle. Must be locked in Phase 0B.
6. **Order payment status separation creating reconciliation complexity.** Keeping order payment status separate from order lifecycle is correct, but without a locked reconciliation/audit model it can create money-state ambiguity. Must be specified in Phase 0B.
7. **Catalog adapter mismatch.** The canonical module's Phase 1 adapters are CSV/local only. If BK01's Supabase/Postgres adapter is not implemented/adapted correctly, the catalog capability cannot run on the BK01 runtime. This is a USE+ADAPT execution risk, not a rejection reason.

---

## 9. Assumptions

1. The prototype evidence (22/22 and 19/19 PASS, HTTP 200, hashes verified) is accepted as **visual/product contract reference only**, not as production implementation proof. The proposal itself states no prototype code should be promoted directly into production.
2. The canonical reuse source for the catalog capability is **modules-hub** (`modules/product-catalog`), not HC01's embedded copy. HC01 is a separate product deferred to P5.
3. Order V1 is a **new capability** requiring a completed Module Reuse Check and `Reuse Gate: PASS` before production implementation; the `Reuse Gate: N/A` exemption does not apply.
4. The MT01 bootstrap rule applies because Order V1 is a SaaS/backend/multi-tenant concern; MT01 is a reference baseline, not a runtime dependency.
5. The locked BK01 documents (`00_PRODUCT_VISION.md`, `01_PRD.md`, `05_BOOKING_DOMAIN_RULES.md`, `06_UX_USER_FLOWS.md`, `10_DEVELOPMENT_ROADMAP.md`, `PRODUCT_DECISIONS.md`) remain historical and are superseded only by an explicit dated decision, not edited in place.
6. The strategy layer model (DRAFT, owner remediation pending) keeps portfolio work at Layer 1; Order V1 is Layer 1 product capability, not Layer 2 agentic work.

---

## 10. Open questions / missing evidence

1. **Exact Order V1 data model and capacity semantics** are not yet locked — these are Phase 0B deliverables, not current evidence.
2. **Whether Order is a separate entitlement/pricing tier or bundled in the BK01 subscription** is undecided; this affects billing and the locked Trial/Basic/Pro structure.
3. **Whether the shop-level capability model conflicts with the existing `shops`/`shop_users`/`shop_id` tenancy/security foundation** needs a concrete design review in Phase 0B.
4. **Whether the canonical product-catalog module's Supabase/Postgres and R2/Supabase-Storage adapters are sufficient for BK01's runtime** — the module currently ships CSV/local adapters only; the Supabase adapter is a future phase. The adaptation scope must be confirmed.
5. **The many-to-many Order→Booking link model** is flagged for evaluation but not yet decided.
6. **Order-linked Booking deposit policy** is `Not configured` in the prototype and must be decided.
7. **No pilot evidence exists for Order demand** (pre-order/made-to-order willingness-to-pay, capacity utilization, ready-date accuracy). This is downstream validation, not a Phase 0 blocker, but it caps confidence in the commercial value of the Order capability.

---

## 11. Confidence

**78/100.**

Confidence is high on the boundary coherence, the preservation of Booking as appointment authority, the correctness of the non-goals, the reuse classification (USE+ADAPT for catalog, MISSING for order/capacity), and the absence of material product overlap (HC01 overlap resolved by canonical reuse; CM01/TT01 no overlap). It is capped because: (a) the exact Order V1 data model and capacity semantics are not yet locked (Phase 0B work), (b) the Order entitlement/pricing decision is open, (c) the canonical module's Supabase adapter is a future phase requiring adaptation, and (d) no Order pilot/demand evidence exists. These are Phase 0 / downstream items, not reasons to reject Phase 0 itself.
