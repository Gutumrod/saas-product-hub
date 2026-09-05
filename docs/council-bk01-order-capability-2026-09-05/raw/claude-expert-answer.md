# BK01 Order Capability — Proposal Review + Product Boundary Governance — Independent Expert: Claude

**Date:** 2026-09-05 (Asia/Bangkok)
**Role:** Independent expert, WSTERA Council run `llm-council-gate` v0.3.2
**Scope:** Proposal Review + Product Boundary Governance ONLY. This is NOT a gate verdict (Codex synthesizes). No production code, migration, Supabase apply, deploy, merge, or locked-contract change was made. No prototype feature was added. Nothing was committed.
**Checkpoint:** `master @ 7b66b2f` (ahead origin/master by 1, not pushed)

---

## 1. Recommendation

**APPROVE PHASE 0 — with explicit boundary, reuse, and sequencing conditions.**

The BK01 Order capability proposal is a coherent, well-bounded product-boundary expansion that preserves Booking as the appointment authority and correctly scopes its non-goals. It should be allowed to enter formal Phase 0 (Product Boundary Decision + Order V1 Contract + Reuse Gate) as **documentation-only work**, running in parallel with BK-A remediation, subject to the conditions below. It must NOT be treated as authorization to build, migrate, deploy, or change any locked contract.

Conditions attached to this recommendation:
1. **Phase 0 is documentation-only.** It locks domain terms, lifecycle, data model, capacity semantics, scheduler behavior, security/RLS, failure cases, audit requirements, acceptance criteria, and non-goals. No Order migration is stacked onto BK01 until the BK-A / DB-runtime baseline is reconciled or explicitly checkpointed (the proposal itself already requires this — endorse it).
2. **The Order catalog must be classified `USE + ADAPT` against the canonical `product-catalog` module** (modules-hub v0.1.0), not built from scratch. The proposal's "product / made-to-order catalog" is a catalog-master-data capability that the canonical module already satisfies; building a fresh catalog inside BK01 without a verified rejection would be an `UNJUSTIFIED_DUPLICATE_IMPLEMENTATION` under MODULE-REUSE-POLICY §9.
3. **The Order lifecycle / production-capacity / ready-date engine is a `MISSING CAPABILITY`** — no canonical module covers order lifecycle, production lead days, workshop production calendar, daily capacity, or capacity reservation. This is the genuinely new, product-specific core that BK01 may implement.
4. **The Order→Booking link must be locked as a many-to-many model** (the proposal already flags this) and must preserve the locked appointment-only boundary for the Booking engine itself.
5. **Sequencing:** Phase 0 documentation may run in parallel with BK-A remediation, but **no Order production implementation may begin until the BK-A / DB-runtime baseline is closed or explicitly checkpointed** (CURRENT_STATUS: BK-A is next eligible heavy track; CONT-03/DB-backed gates still open). This preserves migration-failure attribution.

---

## 2. Verified facts / evidence used (with paths)

- **Frozen brief:** `docs/council-bk01-order-capability-2026-09-05/COUNCIL-BRIEF.md` — defines the frozen question, required review areas, and expert output contract. Confirms this is Proposal Review + Product Boundary Governance only.
- **Proposal:** `docs/proposals/BK01-ORDER-CAPABILITY-PROPOSAL-2026-09-05.md` — proposes `Business Portal → Booking + Order + future Claim integration`; Booking remains authoritative for appointments; Order owns catalog, immutable order-line snapshots, lifecycle `DRAFT→CONFIRMED→IN_PROGRESS→READY→COMPLETED`, production lead days, workshop production calendar, daily capacity, capacity reservation, earliest/requested/promised ready dates, customer pre-order mobile flow. Core rule: `Lead Time + Production Calendar + Available Capacity → earliest available ready date`. Order→Booking link only when Order is `READY`; separate lifecycles; many-to-many link model to be evaluated. Non-goals explicitly exclude inventory/warehouse/ERP/POS/shipping/BOM/routing/lift-bay-room-equipment scheduling. Requires MT01 bootstrap check, Module Reuse Check, Reuse Gate PASS before production.
- **Prototype lock:** `prototypes/bk01-order-portal/PROTOTYPE-LOCK-2026-09-05.md` — frozen, owner-reviewed; 22/22 + 19/19 PASS; Booking remains appointment authority; Order-linked Booking only after `READY`; separate lifecycles; Booking completion does not auto-complete Order; deposit policy for Order-linked Booking is `Not configured`; phone is customer-matching not auth; customer UI hides raw capacity units. Non-goals mirror the proposal.
- **BK01 Product Source of Truth:** `docs/council-product-destination-2026-09-03-canonical-01/01-product/BK01/PRODUCT-SOURCE-OF-TRUTH.md` — Product Gate locked target; governing docs include `00_PRODUCT_VISION.md`, `01_PRD.md`, `05_BOOKING_DOMAIN_RULES.md`, `10_DEVELOPMENT_ROADMAP.md`, `PRODUCT_DECISIONS.md` (all LOCKED/OWNER-APPROVED 2026-08-28). BK01 separate from CM01; native ticket/case is V1 operational capability under PD-018.
- **BK01 Product Scope:** `.../01-product/BK01/PRODUCT-SCOPE.md` — V1 product-defining capabilities are appointment operations; non-goals include POS, inventory, payroll, accounting, ERP, marketplace, multi-branch, CM01 standalone claim/case. Current implementation is **not yet sellable V1**.
- **BK01 Effective Product Gate:** `.../01-product/BK01/EFFECTIVE-PRODUCT-GATE-STATUS.md` — effective verdict **PASS** (post-meta-audit); historical REMEDIATE is provenance only.
- **BK01 Open Decisions:** `.../01-product/BK01/OPEN-DECISIONS.md` — OD-001 auto-slip, OD-002 pricing, OD-003 LINE allowance, OD-004 cancel/reschedule windows, OD-005 DB runtime approval, OD-006 blacklist. OD-005 (DB runtime) is directly relevant to Order sequencing.
- **BK01 Business/Market:** `.../01.5-business-market/BK01/BUSINESS-MARKET-SYNTHESIS.md` — Business/Market PASS (document-level only); merchant-paid recurring subscription; Trial/Basic/Pro ladder; auto-slip required for Pro; merchant-owned LINE OA; pilot WTP/retention evidence downstream. Confirms BK01 is appointment-operations SaaS, not commerce.
- **Portfolio registry:** `docs/products/registry.yaml` — BK01 = Local Service Booking (subscription_saas, shared_runtime, Project B, schema `local_service`, sellable); HC01 = Headless Commerce (one_time_source_product, source_product, beta, wave 2, modules include product-catalog); CM01 = Booking Claim & Case Management Module (source_product, prototype, wave 1); TT01 = Ticket & Service Tracking (source_product, prototype, wave 1); MT01 = Multi-Tenant AI Starter Kit (source_product, sellable, wave 2). Booking has **no modules/ folder** — auth/tenant/billing built inline (confirmed via portfolio audit).
- **Module Reuse Policy:** `docs/platform/MODULE-REUSE-POLICY.md` — Reuse Before Build; mandatory capability classification (USE / USE+ADAPT / NOT APPLICABLE / REJECT WITH JUSTIFICATION / MISSING CAPABILITY); MT01 bootstrap rule; copy-and-own contract; provenance requirement; hard gate `STOP — REUSE GATE FAILED / UNJUSTIFIED_DUPLICATE_IMPLEMENTATION`; §14 prospective (no broad retroactive refactor); §15 source-of-truth precedence.
- **Portfolio status:** `docs/CURRENT_STATUS.md` — P0a-C1 PASS; **BK-A remediation is the next eligible heavy track**; CONT-03 and DB-backed gates remain open; no production deploy/DB apply verified. HC01 deferred to P5 except authorized HC-A cleanup.
- **Strategy layer model:** `docs/strategy/WSTERA-LAYER-MODEL.md` — DRAFT, council review complete, owner remediation pending; current portfolio work remains **Layer 1**; Layer 2/3 require explicit Owner authorization after Layer 1 closeout. Order is a Layer 1 product-foundation capability, not Layer 2.
- **Module Hub registry:** `D:\AI-Workspace\projects\modules-hub\modules\REGISTRY.md` — 24 registered modules; **Product Catalog `product-catalog` v0.1.0 ✅ Completed** (Registry #19). **No order, cart, checkout, or fulfillment module exists or is planned.**
- **Product Catalog module DESIGN:** `D:\AI-Workspace\projects\modules-hub\modules\product-catalog\DESIGN.md` — standalone provider-agnostic domain engine for products, variants, brands, categories, custom attributes, product media, catalog search/filter. Explicitly **out of scope**: shopping cart, checkout, order fulfillment, payment, table/room booking & reservations, promotion engine, customer auth. `CatalogContext` is multi-tenant. Tests: **213/213 PASS** (verified by running `npm test` in `modules/product-catalog`).
- **HC01 product-catalog:** `products/headless-commerce/modules/product-catalog/` — a copy of the canonical module (same DESIGN.md, VERSION 0.1.0, package.json `@module-hub/product-catalog`). Confirms the module is already vendored into a portfolio product.
- **BK01 locked PRD:** `products/booking/docs/01_PRD.md` — LOCKED 2026-08-28; V1 contract is appointment operations (FR-BKG-*, FR-DEP-*, FR-LIFE-*, FR-SCH-*, FR-SVC-*, FR-STF-*). No order capability. FR-SUP-001: native ticket/case is operational support only.
- **BK01 locked domain rules:** `products/booking/docs/05_BOOKING_DOMAIN_RULES.md` — LOCKED; canonical booking states `hold/pending_review/confirmed/completed/cancelled/no_show/expired`; deposit states; availability/collision rules; hold; reschedule; cancellation; completion/no-show; blacklist optional; quota/entitlement; LINE notifications; identity/authorization; audit invariants. This is the locked appointment-only boundary.
- **BK01 Product Vision:** `products/booking/docs/00_PRODUCT_VISION.md` — LOCKED; BK01 is a **Thailand-first appointment operations SaaS**; explicit V1 non-goals include POS, inventory, payroll, accounting, ERP, marketplace, multi-branch. Order capability is a boundary expansion beyond this locked vision.
- **BK01 Product Decisions:** `products/booking/docs/PRODUCT_DECISIONS.md` — OWNER APPROVED 2026-08-28; PD-001 ICP, PD-015 multi-branch POST-V1, PD-016 medical clinics excluded, PD-018 ticket module = V1 operational/support capability (not lead feature). Any change to locked decisions requires a dated decision update or ADR.
- **BK01 Development Roadmap:** `products/booking/docs/10_DEVELOPMENT_ROADMAP.md` — LOCKED; BK-A (V1 contract remediation) → BK-B (pilot) → BK-C (commercial lock) → BK-D (public V1 launch). BK-A open; DB-backed gates blocked until approved runtime. Post-V1 candidates include broader APIs/webhooks, waitlist, deeper calendar sync — **not** order capability.
- **BK01 CURRENT_STATUS:** `products/booking/docs/CURRENT_STATUS.md` — BK-A open; CONT-03 requires remediation + independent review; CONT-04 DB-backed gates environment-blocked; no production deploy/DB apply verified; next eligible heavy track.
- **Booking schema (verified on disk):** `products/booking/supabase/migrations/*.sql` — tables: shops, shop_users, services, staff, customers, bookings, staff_schedules, shop_holidays, line_users, line_notification_logs, subscriptions, stripe_webhook_events, entitlement_usage, audit_events, tickets, ticket_timeline_entries, booking_status_history, booking_recovery_attempts, auto_slip_attempts, account_closure_requests, platform_admins. **No order, product_catalog, or catalog table exists.** No order capability in booking source (non-node_modules scan clean).

---

## 3. Boundary findings

1. **The proposed Order boundary is coherent and well-scoped.** The proposal cleanly separates Booking (appointment authority: date/time, staff availability, schedule, working hours/breaks/holidays, duration, collision prevention, booking lifecycle, booking-specific payment/deposit) from Order (catalog, order-line snapshots, order lifecycle, production lead days, workshop production calendar, daily capacity, capacity reservation, ready dates, pre-order mobile flow). This is a sound domain split.
2. **Booking remains the appointment authority.** The proposal and prototype lock both state Order must not create a second appointment scheduler, and Order-linked Booking can only be created after Order is `READY`, using the same staff+time authority, without bypassing/displacing existing bookings. This preserves the locked appointment-only boundary for the Booking engine itself.
3. **Non-goals are correctly scoped.** The proposal explicitly excludes inventory/warehouse, suppliers/purchasing, accounting/ERP/POS, shipping carrier, marketplace sync, BOM/production routing, worker workload optimization, lift/bay/room/machine resource scheduling, generic resource-booking engine, automatic cross-module payment aggregation, and automatic Booking→Order completion. These align with BK01's locked non-goals (POS, inventory, payroll, accounting, ERP, marketplace) and prevent scope creep into ERP/POS/warehouse territory.
4. **The `Business Portal → Booking + Order + future Claim` shape is a material product-boundary expansion** beyond the locked appointment-only vision (`00_PRODUCT_VISION.md`). It therefore requires an explicit dated Owner/architecture decision (Phase 0A) that supersedes the appointment-only boundary where required — the proposal correctly asks for this rather than silently rewriting historical locked documents.
5. **Capability activation model is sound.** The proposed `booking_enabled` / `order_enabled` / `claim_enabled` shop-level capability model, with "stop new intake, keep historical records visible, never delete/hide business history on toggle change," is consistent with BK01's existing tenancy/security foundation and the locked entitlement rule that downgrades must not delete historical business records (`05_BOOKING_DOMAIN_RULES.md`). Do-not-rename `shops`/`shop_users`/`shop_id` to "tenant" is correct and avoids churn.
6. **Boundary gap — Order catalog ownership is under-specified.** The proposal lists "product / made-to-order catalog" as an Order-owned capability but does not state whether this is a fresh catalog or a reuse of the canonical `product-catalog` module. This must be resolved in Phase 0B as a `USE + ADAPT` decision (see Reuse findings), not left ambiguous.
7. **Boundary gap — Order payment status vs lifecycle.** The proposal correctly keeps order payment status separate from order lifecycle, but the deposit/slip policy for Order-linked Booking is `Not configured` in the prototype lock. Phase 0B must lock whether Order deposits reuse the BK01 PromptPay/slip flow, and how that interacts with the locked deposit rules.

---

## 4. Reuse findings (per MODULE-REUSE-POLICY)

### 4.1 Product Catalog capability classification: **USE + ADAPT**

The Order proposal's "product / made-to-order catalog" is a catalog-master-data capability. The canonical `product-catalog` module (modules-hub v0.1.0, ✅ Completed, Registry #19) manages products, variants, brands, categories, custom attributes, product media, and catalog search/filter, with multi-tenant `CatalogContext` scoping. It is explicitly designed to be a shared module ("เสียบเข้ากับโปรเจกต์ใดก็ได้" — plug into any project) and is already vendored into HC01 (`products/headless-commerce/modules/product-catalog/`). Its 213/213 tests pass (verified by running `npm test`).

- **Classification: `USE + ADAPT`** — the canonical module is a valid base for the Order catalog. Per MODULE-REUSE-POLICY §6, copy the reviewed module into the BK01 destination repository, own that copy, adapt only the destination-owned copy (e.g. made-to-order-specific fields, lead-time attributes), and record provenance (module, version 0.1.0, immutable source commit, copy date, local changes).
- **Why not `USE` (mandatory reuse without copy):** modules-hub is a source library, not a cross-repository runtime dependency (§6). BK01 must copy-and-own, not import across repos by filesystem path.
- **Why not `NOT APPLICABLE`:** the Order catalog genuinely needs catalog-master-data management; this is not a central-platform-owned boundary. The central platform owns accounts/customers/products/entitlement/billing/support per §5, but the Order catalog is product-runtime catalog data, not central-platform product master data.
- **Why not `REJECT`:** no technical evidence (incompatible contract/runtime, wrong security/trust boundary, deprecation, verified defect) exists to reject it. "Writing it again is easier" is explicitly insufficient (§3).
- **Why not `MISSING`:** the capability exists and is proven (213/213 tests, vendored in HC01).

**Hard-gate implication:** If BK01 builds a fresh Order catalog without a verified rejection, that is `UNJUSTIFIED_DUPLICATE_IMPLEMENTATION` under MODULE-REUSE-POLICY §9 and the Reuse Gate fails. Phase 0B must record the `USE + ADAPT` decision and provenance plan.

### 4.2 Order lifecycle / production-capacity / ready-date engine: **MISSING CAPABILITY**

No canonical module covers order lifecycle (`DRAFT→CONFIRMED→IN_PROGRESS→READY→COMPLETED`), production lead days, workshop production calendar, daily production capacity, capacity reservation, or earliest/requested/promised ready-date computation. The modules-hub registry (24 modules) and ROADMAP have **no order, cart, checkout, or fulfillment module** — the product-catalog BRIEF explicitly delegates "ใครซื้อ · ซื้อกี่ชิ้น · จ่ายเงินหรือยัง · นัดวันไหน · ส่งของยังไง" (who buys, how many, paid or not, appointment date, shipping) to Commerce/Booking/Payment/Fulfillment modules that do not yet exist. This is the genuinely new, product-specific core that BK01 may implement as `MISSING CAPABILITY`.

### 4.3 MT01 bootstrap applicability: **APPLICABLE (inspect), not a runtime dependency**

Per MODULE-REUSE-POLICY §4, MT01 is a reference baseline for a new WSTERA SaaS/backend runtime. Order is a SaaS/backend/multi-tenant capability addition to BK01, so the MT01 bootstrap check is **applicable** — at minimum inspect MT01's baseline wiring/contracts for tenant context, Supabase auth, AI provider, enterprise/reliability features, webhook receiver, and central-platform integration seams. MT01 is a reference and dogfood target, not a runtime dependency; its local copied modules may be older than Module Hub (Module Hub registry/source is authoritative). The proposal already requires the MT01 bootstrap check — endorse it.

### 4.4 Other capabilities

- **Booking engine:** remains BK01-owned, appointment authority — not a reuse candidate (Booking is the product's core, not a canonical module).
- **Payment/deposit:** Order deposits should reuse the BK01 PromptPay/slip flow (product-local capability) rather than duplicate a payment module; the central platform owns billing/subscription per §5, and `BILLING_CORE_PLAN.md` governs billing state machines. Order must not create a competing payment state machine.
- **Claim/case:** the proposal correctly defers claim integration to reuse the CM01-owned lifecycle rather than duplicate it inside BK01. This aligns with PD-018 (ticket/case is operational support, not a lead feature) and the registry's CM01/TT01 disambiguation.

---

## 5. Product overlap findings

1. **HC01 (Headless Commerce) — partial overlap on catalog, no overlap on order lifecycle.** HC01 is a one-time self-hosted source product (wave 2, beta) whose modules include `product-catalog`. The Order catalog overlaps HC01's catalog capability — but this is exactly why the canonical `product-catalog` module should be reused (`USE + ADAPT`) rather than duplicated. HC01 is deferred to P5 except authorized HC-A cleanup (CURRENT_STATUS), so it is not a competing runtime. The Order lifecycle/production-capacity engine does **not** overlap HC01 (HC01 has no order/fulfillment module). **No native capability conflict** — the shared catalog is a reuse opportunity, not a duplication.
2. **CM01 (Booking Claim & Case Management Module) — no overlap.** CM01 is a standalone local-first React case-management template (intake, ticket detail, history/retention), source_product, prototype, wave 1. The Order proposal explicitly defers claim integration to reuse the CM01-owned lifecycle. Order (product pre-order/made-to-order) and CM01 (claim/case) are disjoint domains. **No overlap.**
3. **TT01 (Ticket & Service Tracking) — no overlap.** TT01 is an MVP issue-reporting/ticket-tracking app (Express + local JSON storage), source_product, prototype, wave 1, unrelated to booking (registry note). Order is a product pre-order capability, not ticket tracking. **No overlap.**
4. **Booking native ticket/case (FR-SUP-001, PD-018)** — operational support capability, not a lead feature; unrelated to Order. **No overlap.**
5. **Other portfolio products (SB01, MT01, FF01, CA01, IO01, ET01, CO01, AR01, LK01, PS01, DC01, WS01, RM01, OD01)** — none provide an order lifecycle or production-capacity capability. **No overlap.**

**Conclusion:** The only material overlap is the Order catalog vs the canonical `product-catalog` module (also vendored in HC01), which is resolved by `USE + ADAPT` reuse, not by duplication. No product overlap requires rejecting or deferring the proposal.

---

## 6. Impact on BK01 locked appointment contracts

1. **The locked appointment-only boundary is preserved for the Booking engine.** `00_PRODUCT_VISION.md`, `01_PRD.md`, and `05_BOOKING_DOMAIN_RULES.md` (all LOCKED 2026-08-28) define BK01 as appointment operations. The Order proposal does not change the Booking engine's authority, states, availability/collision rules, deposit rules, or lifecycle. Order-linked Booking uses the same staff+time authority and cannot bypass/displace existing bookings. **No locked Booking contract is silently changed.**
2. **The product-boundary expansion requires an explicit superseding decision.** Adding Order makes BK01 a "modular business portal foundation" rather than appointment-only. This is a material change to the locked product identity/scope. Per the proposal and PD-018's precedent (any change to locked decisions requires a dated decision update or ADR), the parent must issue a **dated Owner/architecture decision (Phase 0A)** that formally supersedes the appointment-only boundary where required — without rewriting historical locked documents.
3. **Documents to supersede/amend vs preserve:**
   - **Supersede (via new dated decision, not silent rewrite):** the appointment-only product-boundary framing in `00_PRODUCT_VISION.md` and `PRODUCT-SCOPE.md` (to the extent it implies BK01 is appointment-only), and the roadmap's post-V1 candidate list (to add Order as a Phase 0/Phase 0B capability).
   - **Amend (new dated addendum):** `01_PRD.md` (add Order V1 contract rows), `10_DEVELOPMENT_ROADMAP.md` (add Order Phase 0/0B sequencing), `04_PRICING_ENTITLEMENTS.md` (if Order affects entitlement/capability toggles).
   - **Preserve historical (do not rewrite):** the locked `05_BOOKING_DOMAIN_RULES.md` (Booking engine contract stays authoritative), the historical Product Gate REMEDIATE provenance, and all prior gate records. Historical evidence stays historical per CURRENT_STATUS safety rule.
4. **No locked contract is changed by this review.** This expert answer authorizes no production code, migration, deploy, remote DB change, or replacement of existing locked BK01 contracts. Phase 0 is documentation-only.
5. **Order→Booking link must be locked as many-to-many** in Phase 0B (the proposal already flags this), so the link model does not silently constrain the Booking engine's one-booking-per-order assumption.

---

## 7. Required Owner decisions

1. **D1 — Approve Phase 0 (Product Boundary Decision + Order V1 Contract + Reuse Gate) as documentation-only**, or REMEDIATE / REJECT-DEFER. (This is the frozen question.)
2. **D2 — Issue a dated Owner/architecture decision (Phase 0A)** formally allowing BK01 to become a modular Business Portal foundation with independent Booking and Order capabilities, superseding the appointment-only boundary where required, without rewriting historical locked documents.
3. **D3 — Approve the Order catalog as `USE + ADAPT`** against the canonical `product-catalog` module (modules-hub v0.1.0), with copy-and-own + provenance, rather than a fresh build. This is required to pass the Reuse Gate.
4. **D4 — Approve the Order lifecycle / production-capacity / ready-date engine as `MISSING CAPABILITY`** (new product-specific implementation), and confirm the MT01 bootstrap check is applicable (inspect, not runtime dependency).
5. **D5 — Lock the Order→Booking link model as many-to-many** in Phase 0B, preserving the Booking engine's appointment authority and the locked appointment-only boundary.
6. **D6 — Decide Order deposit/slip policy** (reuse BK01 PromptPay/slip flow vs separate), since the prototype lock leaves it `Not configured`.
7. **D7 — Decide sequencing:** allow Phase 0 documentation in parallel with BK-A remediation, but require the BK-A / DB-runtime baseline to be reconciled or explicitly checkpointed before any Order production migration is stacked onto BK01 (preserves migration-failure attribution).
8. **D8 — Confirm the capability activation model** (`booking_enabled` / `order_enabled` / `claim_enabled`) with the "stop new intake, keep history, never delete on toggle change" rule, and confirm no rename of `shops`/`shop_users`/`shop_id` to "tenant."
9. **D9 — Confirm claim integration is deferred** to reuse the CM01-owned lifecycle (not duplicated inside BK01), consistent with PD-018.

---

## 8. Risks / failure cases

1. **Unjustified duplicate catalog implementation (highest risk).** If Phase 0B does not record the `USE + ADAPT` decision for the Order catalog, a builder may create a fresh catalog, triggering `UNJUSTIFIED_DUPLICATE_IMPLEMENTATION` and a Reuse Gate FAIL. Mitigation: lock the reuse decision in Phase 0B and require the Module Reuse Check artifact before any Order implementation.
2. **Order→Booking boundary erosion.** If the Order→Booking link is not locked as many-to-many with the "READY-only, same staff+time authority, no bypass/displace" rules, Order could silently create a second appointment scheduler or displace bookings. Mitigation: lock the link contract in Phase 0B; keep Booking engine authoritative.
3. **Migration-stacking attribution loss.** If Order migrations are stacked onto BK01 before the BK-A / DB-runtime baseline is reconciled, later migration failures become unattributable. Mitigation: D7 sequencing gate.
4. **Scope creep into ERP/POS/warehouse.** The proposal's non-goals are correct, but the "modular business portal foundation" framing could invite future expansion into inventory/ERP/POS. Mitigation: keep the explicit non-goals in the locked Order V1 contract and require a new decision for any expansion.
5. **Deposit/slip ambiguity.** Order deposit policy is `Not configured`; if unresolved, Order could diverge from the locked PromptPay/slip rules or create a competing payment state machine. Mitigation: D6.
6. **Capability-toggle data-loss risk.** If the capability activation model is implemented without the "never delete/hide business history on toggle change" rule, toggling a capability off could hide/delete history. Mitigation: D8; align with the locked entitlement rule that downgrades must not delete historical records.
7. **Layer 2 conflation.** The strategy layer model is DRAFT and current work is Layer 1. If Order is framed as "agent-ready" or Layer 2, it could inflate scope. Mitigation: keep Order as a Layer 1 product-foundation capability; no AI orchestration in Order V1.
8. **Prototype-to-production promotion.** The prototype passed visual review (22/22 + 19/19) but is not production implementation. Risk of promoting prototype code directly. Mitigation: the proposal already requires Reuse Gate PASS and no direct promotion; enforce it.

---

## 9. Assumptions

1. The frozen brief and proposal are the authoritative scope for this review; I did not infer Owner decisions beyond what the documents state.
2. The canonical `product-catalog` module (modules-hub v0.1.0) is the current authoritative source for catalog capability (per MODULE-REUSE-POLICY §2, Module Hub registry/source is authoritative over MT01's local copies).
3. HC01's `product-catalog` is a copy of the canonical module (verified: same DESIGN.md, VERSION 0.1.0, package.json `@module-hub/product-catalog`).
4. The effective BK01 Product Gate verdict is PASS (per EFFECTIVE-PRODUCT-GATE-STATUS.md); historical REMEDIATE is provenance only.
5. "Phase 0" in this review means documentation-only Product Boundary Decision + Order V1 Contract + Reuse Gate, consistent with the proposal and brief. It does not authorize build/migration/deploy.
6. The BK01 locked appointment-only boundary is defined by `00_PRODUCT_VISION.md`, `01_PRD.md`, `05_BOOKING_DOMAIN_RULES.md`, and `PRODUCT-SCOPE.md` (all LOCKED/OWNER-APPROVED 2026-08-28).
7. No order/cart/checkout/fulfillment module exists or is planned in modules-hub (verified against REGISTRY.md and ROADMAP.md).

---

## 10. Open questions / missing evidence

1. **Order catalog reuse intent is not explicit in the proposal.** The proposal lists "product / made-to-order catalog" as Order-owned but does not state whether it reuses the canonical `product-catalog` module. This must be resolved in Phase 0B (I recommend `USE + ADAPT`).
2. **Order deposit/slip policy is unresolved** (prototype lock: `Not configured`). Phase 0B must decide whether Order deposits reuse the BK01 PromptPay/slip flow.
3. **Order pricing/entitlement impact is not specified.** Whether Order is included in Trial/Basic/Pro or is a separate capability/entitlement is not addressed; Phase 0B must define it (and whether it affects the locked pricing structure).
4. **Order→Booking many-to-many link model** is flagged for evaluation but not yet designed; Phase 0B must lock it.
5. **BK-A / DB-runtime baseline state** (CONT-03, CONT-04) is open; the exact checkpoint mechanism for Order sequencing is not yet defined.
6. **No Order pilot/ICP evidence exists** (the proposal is a boundary expansion, not a market validation). Whether made-to-order businesses are in BK01's ICP (hair/barber/beauty/nail) or a new segment is not established — this is a Business/Market question for a later gate, not a Phase 0 blocker.
7. **Whether the capability activation model requires schema changes** to the locked `shops` table (adding `order_enabled` etc.) is not specified; Phase 0B must confirm this does not silently alter the locked tenancy contract.

---

## 11. Confidence

**Confidence: 82/100**

High confidence on: boundary coherence, Booking-authority preservation, non-goal scoping, the `USE + ADAPT` classification of the Order catalog (canonical module verified, 213/213 tests, vendored in HC01), the `MISSING CAPABILITY` classification of the order lifecycle engine (no canonical module exists), no product overlap with HC01/CM01/TT01, and the locked-contract preservation requirement.

Confidence is not higher because: the proposal does not explicitly state the Order catalog reuse intent (my `USE + ADAPT` classification is the correct reading but the proposal leaves it implicit), Order deposit/pricing/entitlement policy is unresolved, the Order→Booking link model is not yet designed, and the BK-A/DB-runtime baseline checkpoint mechanism is not yet defined. These are Phase 0B contract items, not reasons to reject the proposal.

---

*This is an independent expert input. The final gate verdict is issued by Codex synthesis. No production code, migration, Supabase apply, deploy, merge, or locked-contract change was made. No prototype feature was added. Nothing was committed.*
