# CODEX SYNTHESIS — BK01 Order Capability Parent-Governance Council

> **OWNER OVERRIDE NOTICE — 2026-09-05:** Council synthesis below is preserved as historical council provenance. Hermes' owner-facing decision numbering was inconsistent. Effective D1–D12 decisions and sequencing are defined in `OWNER-OVERRIDE-AND-CORRECTION-2026-09-05.md`. Where Owner decisions differ from recommendation wording, the Owner record controls.

Run: `council-bk01-order-capability-2026-09-05`
Procedure: `llm-council-gate` v0.3.2
Role: Independent Synthesizer + Document Author
Inputs used: `COUNCIL-BRIEF.md`, `CANDIDATE-A.md`, `CANDIDATE-B.md`, `CANDIDATE-C.md`, `SYNTHESIS-MANIFEST.md` only.

## 1. Problem understood

The gate question is whether the parent portfolio should allow the proposed BK01 Order capability to enter Phase 0, or instead remediate or reject/defer it.

The governance problem is not whether to build Order now. It is whether the proposal is coherent enough to authorize a documentation-only Phase 0 covering Product Boundary Decision, Order V1 Contract, and Module Reuse Gate. The parent must decide whether Order can become an additive BK01 capability without silently changing Booking's locked appointment authority, duplicating reusable catalog capability, overlapping other products, or disrupting the BK-A remediation/runtime baseline sequence.

This synthesis does not authorize production code, migrations, Supabase apply, deploy, merge, prototype changes, or locked-contract changes.

## 2. Verified facts

These facts are verified across the three candidate evidence files unless marked otherwise. I did not inspect the source documents directly; this synthesis is identity-blind and uses only the frozen brief, three anonymized candidates, and synthesis manifest.

- 3/3 candidates state the run scope is Proposal Review + Product Boundary Governance only.
- 3/3 candidates state the proposed boundary keeps Booking authoritative for appointment date/time, staff availability, working hours/breaks/holidays, duration, collision prevention, booking lifecycle, and booking deposit behavior.
- 3/3 candidates state Order owns a separate product/made-to-order catalog, immutable order-line snapshots, order lifecycle, production lead days, workshop calendar/capacity, ready-date computation, and customer pre-order/order tracking flow.
- 3/3 candidates state Order-linked Booking is constrained to the Booking engine and must not bypass, displace, or recreate appointment scheduling.
- 3/3 candidates state the proposal and prototype lock exclude inventory, warehouse, ERP, POS, shipping, BOM/routing, lift/bay/room/equipment scheduling, generic resource booking, automatic payment aggregation, and automatic Booking-to-Order completion.
- 3/3 candidates classify the Order catalog capability as `USE + ADAPT` from the canonical `modules-hub/modules/product-catalog` module, using copy-and-own with provenance.
- 3/3 candidates classify Order lifecycle, production capacity, ready-date computation, and Order-to-Booking link as `MISSING CAPABILITY`.
- 3/3 candidates state MT01 bootstrap inspection is applicable before implementation, as reference baseline only, not as a runtime dependency.
- 3/3 candidates state HC01 overlap is limited to catalog master data and is resolved by canonical module reuse, not product rejection.
- 3/3 candidates state CM01 and TT01 do not natively overlap with Order.
- 3/3 candidates state Phase 0 documentation may run in parallel with BK-A remediation only if Order implementation remains blocked behind reuse/runtime baseline gates.
- UNVERIFIED by this synthesizer: prototype scenario counts, hash checks, module test counts, and source-document line-level claims. Candidates report these as evidence, but this role's input boundary did not allow direct reinspection.
- UNVERIFIED/hypothesis: actual market demand for made-to-order/pre-order workflows within or adjacent to the BK01 ICP.
- UNRESOLVED: exact Order V1 data model, capacity units, workshop calendar semantics, Order-linked Booking deposit policy, entitlement/pricing impact, and final Order-to-Booking link cardinality/lifecycle rules.

## 3. Consensus / majority / dissent

- **Recommendation:** 3/3 consensus for `APPROVE PHASE 0` with binding conditions. All candidates restrict approval to documentation-only work.
- **Build authorization:** 3/3 consensus that there is no build, migration, Supabase apply, deploy, merge, prototype feature, or locked-contract change authorization.
- **Booking authority:** 3/3 consensus that Booking remains the sole appointment/staff/time authority.
- **Boundary coherence:** 3/3 consensus that the proposed Order boundary is coherent at Phase 0 level.
- **Non-goals:** 3/3 consensus that the listed non-goals are correctly scoped and must be carried into the Order V1 contract.
- **Catalog reuse:** 3/3 consensus for `product-catalog = USE + ADAPT`, copy-and-own from modules-hub canonical source, not from HC01's destination copy.
- **Order/capacity capability:** 3/3 consensus for `MISSING CAPABILITY` for order lifecycle, production-capacity/ready-date engine, payment-status state domain, and Order-to-Booking link.
- **MT01:** 3/3 consensus that MT01 bootstrap check is applicable before implementation as reference inspection.
- **Overlap:** 3/3 consensus that HC01 overlap is module-level catalog overlap only; CM01 and TT01 are not Order overlaps.
- **Sequencing:** 3/3 consensus that Phase 0 docs can run in parallel with BK-A remediation, but implementation must wait until reuse gate and BK-A/DB-runtime baseline conditions are satisfied.
- **ICP / market evidence:** 2/3 majority explicitly flag made-to-order/pre-order as an ICP or market-evidence uncertainty requiring Owner decision or targeted sanity check; 1/3 treats it as downstream validation and not a Phase 0 blocker. Synthesizer adopts the stricter Owner-decision framing.
- **CM01 wording:** 1/3 dissent/stricter finding says "reuse CM01-owned lifecycle" is imprecise because CM01 may not own a backend/runtime lifecycle; 2/3 accept the statement as no-overlap/deferred integration. Synthesizer treats this as a Phase 0 wording remediation, not a gate blocker.
- **Confidence:** candidate confidence is 78/100, 78/100, and 82/100. Synthesizer confidence: 80/100.

## 4. Missing evidence / unresolved questions

- No Order V1 contract exists yet.
- Capacity granularity is not locked: day-level capacity, per-capability units, workshop calendar semantics, reservation rules, and ready-date recomputation behavior remain open.
- Order-linked Booking deposit/slip policy is explicitly unresolved.
- Entitlement/pricing impact is unresolved: Order may be included in BK01 tiers, gated by capability toggles, or priced separately, but no decision exists in the candidate bundle.
- Made-to-order/pre-order ICP status is unresolved: it may be an adjacent segment rather than the locked appointment-operations ICP.
- No direct demand/pilot evidence for Order workflows is established in the candidate bundle.
- Formal Module Reuse Check artifact is not yet produced; the council classification is a recommended Phase 0 direction, not a completed Reuse Gate PASS.
- MT01 bootstrap check is applicable but not yet recorded as completed for Order.
- Exact BK-A/DB-runtime baseline closeout/checkpoint mechanism is not locked.
- CM01 future integration language needs clarification so it does not imply a backend/runtime dependency on a product that may not own one.

## 5. Synthesizer recommendation

**APPROVE PHASE 0** with binding conditions.

Approval is limited to Phase 0 documentation work:

- Phase 0A: Product Boundary Decision and required Owner decisions.
- Phase 0B: Order V1 Contract plus formal Module Reuse Check / Reuse Gate artifact.

This recommendation does not approve production implementation.

## 6. Why this recommendation

The proposal is coherent enough for governance work because all three candidates independently found the same core split: Booking remains the appointment authority, while Order introduces a separate pre-order/made-to-order lifecycle and production-readiness domain.

Rejecting or deferring the proposal would be disproportionate because the major risks are contract, reuse, and sequencing questions that Phase 0 is specifically designed to answer. The proposal does not ask to build now, and 3/3 candidates agree that documentation-only Phase 0 can proceed without disturbing BK-A remediation if implementation remains blocked.

The strongest implementation risk is catalog duplication. That risk is controllable because the reuse classification is already clear across 3/3 candidates: the catalog slice must be `USE + ADAPT` from the canonical product-catalog module, while the true new Order lifecycle/capacity work is `MISSING CAPABILITY`.

## 7. Rejected alternatives + why

- **REMEDIATE as gate verdict:** rejected. Candidate concerns are Phase 0 deliverables or wording fixes, not defects requiring the proposal to be returned before Phase 0.
- **REJECT-DEFER:** rejected. No candidate found product-boundary incoherence, fatal overlap, or impossible reuse conflict. Deferral would slow the needed boundary decision without reducing risk.
- **APPROVE BUILD / implementation now:** rejected. 3/3 candidates and the frozen brief prohibit production code, migration, Supabase apply, deploy, merge, prototype changes, and locked-contract changes. Reuse Gate, MT01 bootstrap, and BK-A/DB baseline remain prerequisites.
- **Build a bespoke BK01 catalog:** rejected. 3/3 candidates classify the catalog as `USE + ADAPT`; a fresh catalog without justified rejection would be `UNJUSTIFIED_DUPLICATE_IMPLEMENTATION`.
- **Import from HC01:** rejected. HC01's copy is destination-owned. The source must be modules-hub canonical, copied into BK01 under copy-and-own provenance.
- **Treat Order as a Layer 2/agentic platform capability now:** rejected. Candidates characterize this as Layer 1 product capability only; broader shared Order/production platform work is future/hypothesis.

## 8. Boundary findings

- BK01 Order is a material product-boundary expansion beyond appointment-only BK01.
- Booking remains the sole authority for appointment date/time, staff availability, collision prevention, booking lifecycle, and booking deposit rules.
- Order may own catalog, order lifecycle, immutable line snapshots, production lead days, workshop calendar/capacity, ready-date computation, and customer pre-order flow.
- Order must not create a second appointment scheduler, resource scheduler, room/bay/equipment scheduler, or generic booking engine.
- Order-to-Booking link must use Booking's normal availability and collision rules and must not auto-complete Order when Booking completes.
- Capacity semantics must be locked so workshop capacity cannot drift into time-slot resource booking.
- Capability toggles (`booking_enabled`, `order_enabled`, `claim_enabled`) are plausible but must be explicitly approved and must preserve historical records.
- Order payment status may be a separate local state domain, but it must not duplicate payment engines, billing/subscription state machines, or cross-module payment aggregation.
- The "future Claim integration" language must be clarified in Phase 0B to avoid implying an unverified CM01 runtime dependency.

## 9. Reuse findings (product-catalog classification per MODULE-REUSE-POLICY)

- **Product / made-to-order catalog:** `USE + ADAPT`.
- **Canonical source:** `modules-hub/modules/product-catalog` v0.1.0, not HC01's destination-owned copy.
- **Reuse procedure:** copy-and-own into BK01 destination, record source module, source version, immutable source commit at copy time, copy date, and local changes.
- **Expected adaptations:** Supabase/Postgres adapter, media storage adapter if needed, BK01 tenant/shop mapping, made-to-order fields/lead-time attributes, Thai-first merchant UX.
- **Hard-gate rule:** building a fresh BK01 catalog without evidence-backed `REJECT WITH JUSTIFICATION` fails reuse as `UNJUSTIFIED_DUPLICATE_IMPLEMENTATION`.
- **Order lifecycle/capacity/ready-date engine:** `MISSING CAPABILITY`; new BK01 implementation is allowed after Phase 0 and implementation gates.
- **Order payment status and Order-to-Booking link:** `MISSING CAPABILITY` / product-local state and relationship, with platform-boundary constraints.
- **MT01 bootstrap:** applicable; must be inspected/recorded before implementation, but MT01 is not a runtime dependency.
- **Reuse Gate status now:** not yet PASS. Phase 0B must produce the formal artifact.

## 10. Product overlap findings

- **HC01:** catalog master-data overlap only. This is resolved by reusing the canonical product-catalog module. No Order V1 product overlap requiring rejection because Order excludes checkout/payment/shipping/commerce fulfillment.
- **CM01:** no Order overlap. Claim/case remains outside Order V1. Phase 0B should clarify future integration ownership because one candidate flags "CM01-owned lifecycle" as imprecise.
- **TT01:** no overlap. Ticket/issue tracking is distinct from production orders.
- **BK01 native ticket/case:** no overlap; operational support under existing BK01 decisions remains separate from Order.
- **MT01:** not overlap; bootstrap reference only.
- **Other portfolio products:** no native order lifecycle or production-capacity overlap found in candidate consensus.
- **Future platform/shared Order capability:** hypothesis only. Do not inflate BK01 Order V1 into a shared platform layer now.

## 11. Impact on BK01 locked contracts

- No locked BK01 contract is changed by this synthesis.
- Phase 0 approval, if accepted by Owner, permits drafting dated additive/superseding decisions; it does not silently rewrite historical documents.
- The appointment engine contract remains preserved: booking states, deposit states, availability/collision rules, holds, reschedule, cancellation, completion/no-show, and tenant/audit invariants stay authoritative unless explicitly superseded.
- Order introduces a new product-boundary layer. It must be recorded as a dated Owner/architecture decision before any implementation.
- Order must not re-scope BK-A, replace the sellable-V1 spine, or convert the prototype lock into production acceptance evidence.

## 12. Documents to supersede/amend/preserve

- **Supersede-in-part by new dated decision:** the appointment-only product-boundary framing in BK01 Vision/Product Scope to the extent Order is approved as an additional capability.
- **Amend by dated addendum or new Order V1 contract:** PRD Order functional rows, Order lifecycle, capacity semantics, security/RLS, audit requirements, failure cases, acceptance criteria, and non-goals.
- **Amend by dated roadmap decision:** add Order Phase 0/0B track while preserving BK-A -> BK-B -> BK-C -> BK-D as the sellable-V1 spine unless Owner explicitly changes it.
- **Amend pricing/entitlements if needed:** decide whether `order_enabled` is tier-gated, add-on, bundled, or excluded.
- **Append Product Decisions:** PD-019+ or equivalent decisions for boundary, reuse, sequencing, capability toggles, deposit/payment policy, and link model.
- **Preserve historical/frozen:** prior council records, locked BK01 appointment contracts, prototype lock, and historical gate provenance. Do not rewrite them in place as if the past contract already included Order.

## 13. Required Owner decisions

- **D1 — Phase 0 authorization:** approve documentation-only Phase 0, remediate, or reject/defer.
- **D2 — Product boundary:** approve BK01 as a modular Business Portal foundation with independent Booking and Order capabilities while preserving Booking appointment authority.
- **D3 — ICP / market scope:** decide whether made-to-order/pre-order expands BK01's ICP or is constrained to existing BK01 ICP shops that also need Order.
- **D4 — Document treatment:** approve which locked framings are superseded-in-part, amended by addendum, or preserved historical.
- **D5 — Reuse direction:** ratify catalog `USE + ADAPT` from modules-hub product-catalog; lifecycle/capacity/link/payment state as `MISSING CAPABILITY`; MT01 bootstrap applicable.
- **D6 — Sequencing:** allow Phase 0 docs in parallel with BK-A remediation, while blocking implementation until BK-A/DB-runtime baseline is closed or explicitly checkpointed and Reuse Gate PASS exists.
- **D7 — Capability activation model:** approve or reject `booking_enabled` / `order_enabled` / `claim_enabled`, including disabled-capability behavior that preserves history.
- **D8 — Order-linked Booking deposit policy:** decide whether and how deposits/slips apply when Order creates/links a Booking.
- **D9 — Order payment status boundary:** confirm local payment-status state only; no payment engine, billing/subscription duplication, or automatic cross-module aggregation.
- **D10 — Order-to-Booking link model:** authorize Phase 0B to lock cardinality, lifecycle, cancellation/unlink rules, and READY-only linking.
- **D11 — Prototype disposition:** keep prototype frozen as exploration/visual-product evidence only; no direct production promotion.
- **D12 — CM01 wording:** decide or direct wording that future claim integration must name the actual owner/capability and not assume an unverified CM01 runtime lifecycle.

## 14. Recommended next phase

Proceed to **Phase 0A + Phase 0B documentation-only**:

- Phase 0A: Owner Product Boundary Decision covering D1-D4 and D6.
- Phase 0B: Order V1 Contract and formal Reuse Gate artifact covering D5 and D7-D12.

Recommended sequencing: run this documentation-only work in parallel with BK-A remediation under strict focus protection. Do not start Order implementation until the formal Reuse Gate is PASS and the BK-A/DB-runtime baseline is closed or explicitly checkpointed.

## 15. Explicit build authorization status

**NO BUILD AUTHORIZATION.**

This verdict does not authorize:

- production code;
- migrations;
- Supabase apply;
- deploy;
- merge;
- prototype feature additions;
- locked-contract edits in place;
- direct promotion of prototype code to production;
- cross-repo runtime dependency on modules-hub or HC01.

## 16. Gate verdict + blockers

**Gate verdict: APPROVE PHASE 0 — documentation-only, with implementation blocked.**

Phase 0 blockers: none fatal. The proposal can enter Phase 0.

Mandatory Phase 0 deliverables before implementation:

- Product Boundary Decision.
- Order V1 Contract.
- Formal Module Reuse Check with catalog `USE + ADAPT`, order/capacity `MISSING CAPABILITY`, MT01 bootstrap applicability, and provenance plan.
- Owner decisions listed in section 13.
- Capacity, deposit, entitlement, link, and payment-boundary rules locked.
- CM01/future-claim wording clarified.

Implementation blockers:

- Reuse Gate not yet PASS.
- BK-A/CONT-03 and DB-runtime baseline not yet closed or explicitly checkpointed, per candidate consensus.
- OD-005/runtime environment and DB-backed gates remain unresolved in candidate evidence.
- Order V1 contract does not exist yet.

## 17. Confidence 0-100

**80/100.**

Confidence is high because the three independent candidates converge on the same recommendation, same boundary, same reuse classification, same overlap finding, and same no-build sequencing guard.

Confidence is capped because this synthesizer did not directly inspect source documents, prototype hashes/tests, or runtime state; several Order V1 contract decisions are intentionally unresolved; and Order market/ICP evidence remains hypothesis-level.

## 18. Thai OWNER-BRIEF

Full Thai Owner Brief is written separately at:

`D:\AI-Workspace\projects\saas-product-hub\docs\council-bk01-order-capability-2026-09-05\BK01-ORDER-OWNER-BRIEF.md`

Summary: รอบนี้เสนอให้ **APPROVE PHASE 0 เฉพาะงานเอกสาร** เพื่อทำ Product Boundary Decision, Order V1 Contract, และ Reuse Gate โดย **ยังไม่อนุญาตให้ build/migration/deploy/merge หรือแก้ locked contract**. Implementation ต้องรอ Reuse Gate PASS และ BK-A/DB baseline ชัดก่อน.
