# WS01 — Product Gate Candidate A

_(anonymized candidate; identity withheld from synthesizer)_

---

# WS01 WSM — C Expert Answer

Council Product Gate · llm-council-gate v0.3.2 · WS01 WSTERA Supply Management
Independent expert; output persisted for the Council; no gate verdict issued.

---

## Recommendation

WSM should be a **multi-tenant B2B supply-planning and dealer-allocation SaaS for importers/distributors**, answering one core recurring question: from dealer demand through reliable supplier/factory supply to actual allocation and fulfillment, what is the traceable truth, where are the shortages, and who gets scarce supply?

The product identity and endgame is the **thin end-to-end supply loop** — **Demand → Supply → Gap → Allocation → Fulfillment** — as a single source of truth built on the invariant that Requested ≠ Allocated ≠ Fulfilled and Ordered ≠ Confirmed ≠ Received. V1 must be exactly and only that thin loop (Phase 1), with nothing beyond it: no PO/commitment/batch supply model, no allocation policies, no multi-site supplier master, no warehouse/fulfillment module, no intelligence in V1. V1 ends the moment the loop "dealer books demand → admin enters reliable manual supply → Gap is computed → admin allocates (full/partial) → backorder preserved → dealer sees only their own requested/allocated/waiting result" is demonstrable end-to-end and secure.

I am NOT issuing a gate verdict, not choosing pricing/revenue/competition, and not producing a build brief, migration, scaffold, or production-placement decision. That is the Council and Owner's call.

---

## Verified facts/evidence used

(All paths under `D:\AI-Workspace\projects\saas-product-hub\products\WSM\` unless noted. Git: branch `main`, clean, HEAD `e1eff9b`, Documentation Lock authorized commit on top of `977da38`, 7 commits total; implementation NOT started.)

1. **Product name/id and mandate**: Product name WSM — WSTERA Supply Management (PD-001, APPROVED), Product ID WS01 (PD-002, APPROVED). Repo `products/WSM`, docs SSOT locked (PD-012, 2026-09-03).

2. **Problem statement** (`00_PRODUCT_VISION.md` §Problem): "Ordered quantity is mistaken for confirmed supply; dealer requests are mistaken for guaranteed stock; delays are discovered too late." The value proposition: the owner can answer who wants what, what supply is actually reliable, where shortages exist, who receives scarce supply, who is affected when supply changes, and what was ultimately shipped (§Core value).

3. **North Star and primary ICP** (`00_PRODUCT_VISION.md`): North Star = Demand → Supply → Gap → Allocation → Fulfillment. Primary ICP = importer/distributor with multiple SKUs and dealers; receives supply from one or more suppliers/factories; regularly faces partial production, delay or shortage; currently coordinates allocation manually.

4. **Seven product principles** (`00_PRODUCT_VISION.md` §Principles), incl. Requested≠Allocated≠Fulfilled; Ordered≠Confirmed≠Received; Product↔Supplier many-to-many; history over overwrite; tenant-configurable policy; thin end-to-end loop before deep modules; intelligence evidence-based and explainable.

5. **Phase 1 scope is a thin loop, not a deep module** (PD-004 APPROVED; `10_DEVELOPMENT_ROADMAP.md` Table): Phase 1 = "Dealer booking → demand → manual reliable supply → gap → manual/partial allocation → backorder → dealer result." Later phases are explicitly separate: Phase 2 Supply Planning Core (PO, factory commitment, production batch, revision history, provenance), Phase 3 Allocation & Backorder Core (policies, future-supply allocation, reallocation, backorder queue, dealer promise history), Phase 4 Inventory & Fulfillment, Phase 5-8 (finance, control tower, intelligence, platform maturity).

6. **V1 PRD requirements** (`01_PRD.md`, 25 IDs, V1 Required): tenant access (FR-TEN-001, FR-AUTH-001), catalogue/supplier/dealer setup (FR-CAT-001, FR-SUP-001, FR-DLR-001), booking demand (FR-BKG-001..004, FR-DMD-001), supply/gap/allocation (FR-SPL-001, FR-GAP-001, FR-ALC-001, FR-ALC-002, FR-DLR-002), plus cross-cutting SEC/REL/NFR/OPS. Explicit public-launch rule: nothing marketed as shipped until its Required row has implementation + release evidence.

7. **Resolved Phase 1 owner decisions** (`PRODUCT_DECISIONS.md`, PD-007..PD-011, all APPROVED 2026-09-03, applied into `PHASE1_SCHEMA.md`): one supplier = one production source in Phase 1 (no `supplier_sites` table; multi-site is a Phase 2 expand migration, PD-007); dealer identity on booking link = `code` (PD-008: `login`/`open` defined but unused in V1); manual supply tenant-global by default (`supply_entries.booking_round_id` null), Gap view default global per variant with optional round filter (PD-009); first tenant base currency THB, multi-currency deferred (PD-010); backorders do not auto-carry at round completion, stay `open` until explicit admin carry (PD-011; auto-carry Phase 3).

8. **Security/tenancy contract** (`03_DATA_SECURITY_TENANCY.md`): multi-tenant with server-authoritative domain layer; RLS + tenant-scoped reads/writes; dealer self-scoped reads only; cross-tenant FK mismatches rejected not hidden; audit immutable to app roles; release requires negative tests (anonymous bypass, cross-tenant, cross-dealer, privilege escalation, forged booking identity, replay/idempotency abuse, unauthorized audit mutation). Role contract: Owner/Admin/Purchasing/Warehouse/Finance/Dealer/Platform operator.

9. **Supply domain invariants** (`05_SUPPLY_DOMAIN_RULES.md`): 10 non-negotiable invariants; confidence classes ordered strongest→weakest (on-hand, in-transit, production-completed, factory-confirmed, planned/unconfirmed); tenant policy defines reliability threshold; Gap is a derived result over a time horizon and "the formula and whether backorder is already included in confirmed demand must be defined once to avoid double subtraction."

10. **Locked Phase 1 schema** (`docs/technical/PHASE1_SCHEMA.md`, promoted 2026-09-03 as AUTHORITATIVE together with `CANONICAL_DATA_MODEL.md`; supersedes `design/04`): 16 concrete entities (tenants, tenant_users, dealers, products, product_variants, suppliers, supplier_products, booking_rounds, booking_round_items, demand_requests, demand_lines, supply_entries, allocations, backorders, tenant_policies, audit_events). Operational granularity = `product_variants.id`. `allocated_qty` is derived (sum of allocations), not stored. Manual supply is a Phase 1 adapter with kind/confidence/quantity/effective_date/provenance. Allocation source abstraction (on_hand | supply_entry) stable for later sources.

11. **Correct Gap semantics (DOC-001 correction)** (`CANONICAL_DATA_MODEL.md`, `PHASE1_SCHEMA.md` §v_supply_position): `reliable_supply = on_hand + reliable_incoming`; `open_confirmed_demand = sum(requested_qty for confirmed/allocated/partially_allocated/backordered demand lines)`; `supply_position = reliable_supply − open_confirmed_demand`; `shortage = max(−supply_position, 0)`. **Backorders are NOT subtracted again** (avoids double-count); backorder is for queueing/reporting/consistency only. This corrects the historical `design/04` §7 defect.

12. **Gates and readiness** (`MASTER_CHECKLIST.md`): Documentation Lock AUTHORIZED 2026-09-03 (PD-012); independent documentation review PASS 2026-08-30, no unresolved P0/P1 (`audit/INDEPENDENT_REVIEW.md`); 25/25 PRD IDs traced, 0 missing, 0 orphaned (`audit/FEATURE_REQUIREMENT_TRACEABILITY.md`); current status overlay confirms no migration/scaffold/deploy/db apply exists (`CURRENT_STATUS.md`); next gate = a **separate approved Phase 1 build brief**, not implementation approval of the lock.

13. **Pending / not-decided** (`PRODUCT_DECISIONS.md` §Pending, `CURRENT_STATUS.md`, `04_PRICING_ENTITLEMENTS.md`, `02_SYSTEM_ARCHITECTURE.md` §Placement): production runtime/database placement; exact central billing/entitlement integration contract; commercial plans/prices/trial/limits/grace; data retention periods; public support/SLA wording. Prices and limit values in schema are shape placeholders only.

14. **Module Hub fit** (`D:\AI-Workspace\projects\modules-hub\INDEX.md`): a library of reusable modules (Notification, Config/Runtime, File Storage, Webhook Receiver, Audit Log, HTTP Client, Auth, Tenant Context, Subscription+Entitlement, Feature Flags, Rate Limit, Product Catalog, Job/Retry, Scheduler, Import/Export, Health Check, etc.); rule is **copy the module into the destination project and vendor it — never import across path from modules-hub directly**; it is a library for building new projects, not shared runtime infrastructure. This means shared modules are candidates to copy, but they do NOT belong inside WSM V1 automatically and are a build-phase decision, not a V1 requirement.

---

## Key reasons

1. **The thin loop is the smallest unit that proves value.** The ICP's pain is cross-entity misreadings: treating ordered as confirmed, requests as guaranteed stock, discovering delays late. Only an end-to-end loop (demand → reliable supply → gap → allocation → backorder → dealer-visible result) exposes all of these as a single demonstrable artifact. A deep isolated module (e.g. only allocation, or only gap math) proves nothing because the pain lives in the transitions between facts. PD-004 and roadmap Phase 1 both codify this.

2. **Product-defining invariants are already resolved and locked.** The semantic spine — Requested≠Allocated≠Fulfilled, Ordered≠Confirmed≠Received, many-to-many sourcing, derived-as-truth amounts, tenant policy, backorder as persistent lifecycle (not a subtraction), history over overwrite — are all PRODUCT-DEFINING and now owner-approved (PD-007..PD-011). This is different from the historical state where agent recommendations risked being read as decisions. V1 can be built against a frozen contract.

3. **The gap/double-count correction (DOC-001) meaningfully changes V1 meaning.** Backorder being a queue/reporting construct rather than a second subtraction keeps the shortage number honest. Without it, an operator sees a false shortage and misallocates — exactly the failure mode the product exists to fix. This is why `CANONICAL_DATA_MODEL.md` defines the formula once and `PHASE1_SCHEMA.md` carries the corrected view while `design/04` remains historical evidence.

4. **Multi-tenancy is product-required, not just architectural intent.** The ICP is a business that itself manages dealers; WSM's economic shape is one SaaS instance serving many importing businesses, with the importer as the tenant and its dealers as tenant-scoped business entities. Security (`03`) and schema (RLS, `tenant_id` on every business row) encode this as a hard requirement (SEC-TEN-001, SEC-DLR-001), not a nice-to-have. Dealers are business entities under a tenant, not tenants themselves — the tenant/customer boundary is the importer.

5. **V1 scope is precisely bounded by "no second-order machinery."** Manual supply is an adapter, explicitly replaceable by PO/commitment/batch supply later without reinterpreting historical demand (`05` Phase 1 simplification, `02` architectural invariant). Allocation is manual (Phase 3 policies deferred). No inventory/warehouse, no finance, no intelligence, no multi-site suppliers, no auto backorder carry. This keeps V1 demonstrable and honest, and every deferred capability has a named later phase.

6. **The correctness of the money/inventory math is an NFR, not optional.** NFR-003 (integer/precise numeric, no floating-point inventory math) and NFR-002 (timezone-aware) are release requirements in the PRD, consistent with a domain where a rounding error in shortage or allocation is a real business loss.

---

## Risks/failure cases

1. **Scope creep into Phase 2+ machinery.** The strongest failure mode is treating V1 as "get the loop plus a little supply-planning/PO, a little allocation policy, a little dealer portal." Each of these is a named later phase; pulling any one forward enlarges the loop and delays proof. Mitigation: enforce the Phase 1 thin-loop contract and the schema as the boundary.

2. **Misreading "reliable" supply.** `reliable_incoming` depends on the tenant's `reliable_confidence_threshold` policy and effective-date horizon. If reliability semantics or the default (`factory_confirmed`) are misconfigured or misunderstood, the Gap view reports a false surplus/shortage and allocation is distorted. The `05`/`07`/schema definition must be implemented literally, not reinterpreted.

3. **Over-allocation race / double demand.** FR-BKG-003 (idempotency key), REL-001 (concurrent submission/allocation cannot double-demand or over-allocate), and the advisory-lock note in `PHASE1_SCHEMA.md` exist precisely because this is the classic allocation bug. Negative tests for replay/idempotency abuse are a release baseline.

4. **Dealer identity / privacy leakage.** Public booking link (`/b/{public_token}`) is an anonymous-role path that validates the dealer code server-side and must grant no read access to any existing dealer rows (SEC-DLR-001). If the code claim is mishandled as an authorization token, cross-dealer or cross-tenant reads become possible. This is a release gate (G3).

5. **Tenant-scope and audit-integrity failures.** RLS on every business table, cross-tenant FK rejection, and immutable `audit_events` (no UPDATE/DELETE grants) are product-critical. A single bypass undoes the whole "single traceable source of truth" claim.

6. **Commercial/pricing/placement remain undecided** (pending). Building V1 does not require them, but marketing anything as shipped before pricing, retention, SLA, and placement are owner-approved would violate the public-launch rule and the "no invented values" discipline. These are launch blockers, not V1-shape blockers.

7. **Module Hub mis-application.** If a V1 build imports modules directly from `modules-hub/` (forbidden across-path) or assumes shared infrastructure is part of V1, it violates the hub's own rule and the brief's caution ("do not assume shared infrastructure belongs in V1"). Any shared-module use is a build-phase vendoring decision, not a V1 requirement.

8. **Doc-vs-implementation drift during build.** The contract is large (`00`–`10` + schema + ops). The build brief must map each Required PRD ID and each schema invariant to evidence; silent reinterpretation of "allocated derived, not stored" or "backorder not double-subtracted" would silently recreate the exact defects the lock was meant to prevent.

---

## Assumptions

- "Thin end-to-end loop" in this brief means **Demand → Supply → Gap → Allocation → Backorder → Dealer result**, matching `10_DEVELOPMENT_ROADMAP.md` Phase 1 and PD-004. This is the definition of V1 scope I applied.
- The importer/distributor is the **tenant** customer; dealers are tenant-scoped business entities. This reading follows `03`, the role contract, and the schema (dealer under tenant, not tenant under dealer).
- Phase 1 uses the approved identity mode `code` for the booking link, per PD-008; `login`/`open` remain defined but out of V1.
- Manual supply entry and manual (full/partial, policy-free) allocation are the intended V1 adapters, per PD-009, PD-011, and `05` Phase 1 simplification.
- The corrected Gap formula (single subtraction, no double-subtract of backorder) in `CANONICAL_DATA_MODEL.md` + `PHASE1_SCHEMA.md` is the authoritative semantics (it supersedes `design/04`).
- THB is the sole V1 base currency (PD-010); multi-currency is deferred.
- Documentation Lock is a Phase 0 baseline only and is **not** implementation approval (explicit in `CURRENT_STATUS.md`, `MASTER_CHECKLIST.md`).

---

## Open questions/missing evidence

- **Exact primary-persona segmentation among the ICP**: the docs name importer/distributor as ICP but do not pin one concrete persona profile (e.g. single product-category wholesaler vs multi-category importer). The brief asks for "exact primary user/buyer role" — the docs give the category and pain but not a named buyer persona or decision-maker/economic-buyer split. Evidence gap, not a defect.
- **Proof of the pain / competitive baseline**: no market/competitive/demand evidence (surveys, lost-sale anecdotes, competitor scans) is present in the WSM folder. The problem statement is plausible and internally consistent but not externally validated.
- **The concrete "recurring operational pain" cadence**: docs describe shortages/delays as recurring but do not quantify frequency (weekly booking rounds? monthly commitments?), which would sharpen V1 flows and edge cases.
- **Which tenant policy values ship as defaults vs per-tenant** (beyond `reliable_confidence_threshold`, `booking_identify_mode`, `over_allocation_allowed`), and what the minimum viable set is for V1.
- **Exact recovery/cancel semantics and audit scope for edge cases** ("already-used dealer identity", "supply changed while allocating", "quantity outside limits") are listed as required recovery states but the precise behavior rules are not fully specified; they may need the build brief or an ADR.
- **Module Hub fit is confirmed as a library; which, if any, shared modules (Auth, Tenant Context, Audit Log, Subscription/Entitlement) should be vendored into the V1 build** is an open build-phase decision, not a V1 requirement.
- **Success thresholds** (KPI targets) are listed in `07_ANALYTICS_KPI_SPEC.md` but have no acceptance target values/units yet.

---

## Confidence 0-100

**78 / 100**

The product identity, the thin-loop V1 boundary, the product-defining invariants, multi-tenancy as a requirement, and the Phase 1 schema/scope are clearly, consistently, and owner-approved — high confidence there. The confidence is not higher because the docs are exclusively internal design + audit (no external demand/persona/competitive validation), the primary buyer persona is only category-level, V1 success thresholds have no target values, and several edge-case recovery semantics and the module-vendoring decision remain open until the build phase.
