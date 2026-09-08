# WS01 WSM — Technical/Delivery Lens (Raw Analysis)

**Council:** WSTERA Product Destination Council Round 1
**Lens:** Technical/Delivery — implementation reality, dependency cost, reusable capability fit, risk, distance to V1
**Date:** 2026-09-03
**Evidence base:** อ่านจาก repo จริง `D:\AI-Workspace\projects\saas-product-hub\products\WSM` (branch `main`, HEAD `e1eff9b`, clean tree) + `D:\AI-Workspace\projects\modules-hub` (INDEX.md / modules/REGISTRY.md เท่านั้น — ไม่ได้แก้/modify อะไร)
**Label convention:** VERIFIED = มีหลักฐานใน repo/ระบบจริง · INFERENCE = อนุมานจากหลักฐาน · UNVERIFIED = ยังไม่มีหลักฐาน · RECOMMENDATION = ข้อเสนอของ lens นี้ · UNKNOWN = ไม่มีหลักฐานเลย

---

## 0. สถานะจริงของ repo (cross-check กับ git — ไม่เชื่อ CURRENT_STATUS.md ตามลำพัง)

- VERIFIED: `git rev-parse HEAD` = `e1eff9b02b15642729c3691e600195f788c6a8a7` ตรงกับที่โจทย์ระบุ; `git status --porcelain` = 0 (clean tree); branch = `main`.
- VERIFIED: ไฟล์ทั้งหมดใน repo = 41 ไฟล์ `.md` + 1 ไฟล์ `.gitignore` เท่านั้น — ไม่มี source code, ไม่มี migration SQL, ไม่มี scaffold, ไม่มี config ของแอป (find พบไฟล์ non-md แค่ `.gitignore`).
- VERIFIED: git history 5 commits ล่าสุดทั้งหมดเป็น `docs:` (e1eff9b, 977da38, cc59d21, 9560983, 0d068dc) — ไม่มี commit ที่แตะโค้ด.
- VERIFIED: `CURRENT_STATUS.md` ระบุ "No migration, application scaffold, production deployment or database apply exists yet" — ข้อความนี้สอดคล้องกับ git state จริง (ไม่ใช่แค่ self-report).
- VERIFIED: `docs/audit/INDEPENDENT_REVIEW.md` (2026-08-30) verdict = PASS ไม่มี P0/P1 ค้างใน SSOT; ระบุชัดว่า "documentation-only... does not authorize implementation, migration, or Phase 1 scaffold."
- VERIFIED: `docs/audit/CURRENT_TRUTH_AND_CONTRADICTIONS.md` ยืนยัน "No implementation/migration baseline exists in this product folder."
- **สรุป: คำตอบข้อ "อะไรถูก build แล้ว" = ไม่มีอะไรเลย — docs-only 100%.** (VERIFIED)

---

## 1. อะไรมีแล้ว / อะไรขาด / อะไรอาจไม่จำเป็น

### มีแล้ว (VERIFIED — ทั้งหมดเป็นเอกสาร)
- SSOT 00–10 ครบชุด: vision, PRD (25 requirement IDs), architecture, security/tenancy, supply domain rules, pricing/entitlement boundary, UX, KPI, external dependencies, release gates, roadmap.
- Column-level Phase 1 schema contract (`docs/technical/PHASE1_SCHEMA.md`, promoted 2026-09-03) + canonical data model — ระดับละเอียดพอเขียน migration ได้เลย (16 tables + views + RLS design + migration discipline).
- Decision log PD-001–PD-012 (Documentation Lock authorized 2026-09-03).
- Operations pack (deploy/incident/backup-restore/support/legal-privacy runbooks) — เอกสารมีแล้ว แต่ยังไม่เคยถูก execute จริง.
- Requirement traceability 25/25 + release gates G0–G9 (VERIFIED ผ่าน INDEPENDENT_REVIEW §6 และ PHASE1_SCHEMA อ้าง G2/G3/G6).

### ขาด (VERIFIED — ทุกข้อระบุในเอกสารเองว่า "not started / pending")
1. **Phase 1 build brief** — ยังไม่ถูกเขียน (CURRENT_STATUS: "The next gate is a separate approved Phase 1 build brief"; MASTER_CHECKLIST: implementation gate ยังไม่ผ่าน). นี่คือของขาดชิ้นแรกสุด.
2. **Migration SQL** — schema contract มีแต่ยังไม่มี migration; ห้ามรันจนกว่า build brief ผ่าน (PHASE1_SCHEMA §9).
3. **Application scaffold / server layer / UI** — ไม่มีเลย.
4. **Runtime/database placement** — pending portfolio decision (PD log "Pending decisions"; 02 §Placement decisions still pending; 08 §Current portfolio facts). Schema ออกแบบให้ placement-agnostic (VERIFIED) แต่ deployment/ops จริงยังกำหนดไม่ได้.
5. **Central billing/entitlement integration contract** — pending (08: "not yet proven in WSM documentation").
6. **Commercial values** — pricing/plans/trial/limits/grace = launch blockers, intentionally TBD (04 + PHASE1_SCHEMA §1: plan keys เป็น "shape placeholders only").
7. **Data retention periods + SLA/support wording** — launch blockers (03 §Data lifecycle; INDEPENDENT_REVIEW §7).
8. **Release evidence** — OPS-002 ต้องการ evidence mapping ทุก Required requirement ถึง tests/evidence; ยังไม่มีเพราะยังไม่มีโค้ด.
9. **Auth provider เฉพาะ** — 03 ระบุ "approved WSTERA auth boundary" แต่ตัว provider จริง/การ integrate ยังไม่ถูกพิสูจน์ในเอกสาร WSM (08 ระบุ auth เป็น "approved dependency class" แต่ไม่ระบุตัวเลือก). UNVERIFIED ว่าใช้ตัวไหน (AGENTS.md บ้านเราบอก Clerk เป็น default แต่ WSM docs ไม่ได้ระบุ — อย่าเอาไปปน).

### อาจไม่จำเป็น / เสี่ยง bloat ใน Phase 1 (INFERENCE + RECOMMENDATION)
- **`entitlement_snapshots`** (PHASE1_SCHEMA §1): ตารางนี้สมมติว่ามี billing source ที่จะ pull snapshot มา แต่ billing integration contract ยัง pending — ตอนนี้ยังไม่มีอะไรให้ pull. INFERENCE: เป็น candidate หลักที่อาจ defer ออกไปได้โดยไม่กระทบ thin loop. RECOMMENDATION: ให้ build brief ตัดสินใจชัดเจน — (ก) implement ตาม contract ที่ lock ไว้ (ต้นทุนต่ำ เพราะเป็นตารางง่ายๆ) หรือ (ข) เสนอ ADR defer ไปจนกว่าจะมี billing จริง. อย่าปล่อยให้ค้างครึ่งๆ.
- **`supplier_products` columns `unit_price`/`price_currency`/`moq`/`lead_time_days`** (PHASE1_SCHEMA §2): Phase 1 manual supply ใช้แค่ `supplier_id` เป็น provenance บน `supply_entries`; ฟิลด์ราคา/lead time เป็นของ Phase 2/7. INFERENCE: เป็น future-ready surface ที่เพิ่ม migration surface โดยไม่มี consumer ใน V1. RECOMMENDATION: เก็บไว้ได้ (ต้นทุนต่ำ) แต่ build brief ต้องระบุว่าไม่ต้องมี UI/validation ครบใน V1 — อย่าให้ scope creep.
- **`dealers.tier`** (PHASE1_SCHEMA §1): เอกสารเองบอก "the allocation engine reads it in Phase 3" — ฟิลด์ free-form ใน Phase 1. INFERENCE: เก็บได้ (ถูก lock แล้ว) แต่ห้ามมี logic ใดๆ อ่านมันใน V1.
- **`tenant_policies` 3 keys**: `reliable_confidence_threshold` จำเป็นจริง (Gap engine อ่านมัน — VERIFIED จาก v_supply_position). `booking_identify_mode` กับ `over_allocation_allowed` — PD-008/ค่า default lock ค่าไว้แล้ว; INFERENCE: hard-code ได้ใน V1 แต่กลไก policy เป็น principle ข้อ 5 ของ product (tenant-configurable) — ต้นทุนต่ำทั้งสองทาง, เก็บไว้ตาม contract ดีกว่า (หลีกเลี่ยง ADR).
- **`audit_events` / `backorders` / `supplier_products` join** — จำเป็นตาม PRD (SEC-AUD-001, FR-ALC-002, FR-SUP-001/PD-005) — VERIFIED. ไม่ใช่ของที่ตัดได้.

---

## 2. Distance ถึง V1 ที่ขายได้

- VERIFIED: Phase 1 thin loop (dealer booking → demand → manual reliable supply → gap → manual/partial allocation → backorder → dealer result) ยังไม่ถูก implement เลยแม้แต่ชิ้นเดียว.
- VERIFIED: เอกสารไม่มี effort estimate / timeline ใดๆ — UNKNOWN ระยะเวลา. (ไม่มีหลักฐาน → อย่ามโนตัวเลข)
- องค์ประกอบของระยะทาง (INFERENCE — เรียงตามลำดับ gate):
  1. เขียน + อนุมัติ Phase 1 build brief (vertical slice + verification plan) — gate แรก.
  2. Migration: 16 tables + RLS policies + 3 views + grants + advisory lock strategy — schema contract ละเอียดพอเขียนได้เลย (VERIFIED) → งานนี้ de-risk ไปแล้วระดับหนึ่ง.
  3. Server layer: auth/tenant context, booking link `/b/{public_token}` + idempotency (FR-BKG-003), demand CRUD, supply entry, gap view, allocation transaction + advisory lock (REL-001), backorder lifecycle, dealer self-scoped read (SEC-DLR-001).
  4. UI: admin surface + dealer mobile-first booking link (NFR-001).
  5. Security negative tests ตาม release baseline (03 §Security release baseline: anonymous bypass, cross-tenant, cross-dealer, privilege escalation, forged booking identity, replay/idempotency abuse, audit mutation) + gates G0–G9.
  6. **Launch blockers ที่ไม่ใช่งาน engineering**: pricing/plans, retention, SLA/support wording, runtime placement, billing contract — เหล่านี้เป็น business/portfolio decision (VERIFIED ว่า pending) แต่ gate การ launch จริง.
- INFERENCE: ระยะทาง engineering ถึง "loop ทำงานได้" = 1 build brief + 1 รอบ implement (ขอบเขตเล็กและถูก lock ละเอียด); ระยะทางถึง "ขายได้" = loop นั้น + 5 launch blockers ข้างต้น. ตัวเลขสัปดาห์/คน-วัน = UNKNOWN (ไม่มีหลักฐาน).
- RECOMMENDATION: build brief ควรกำหนด time-boxed vertical slice (เช่น "booking link + demand + gap view ทำงาน end-to-end ก่อน allocation") เพื่อพิสูจน์ tenancy/idempotency path ก่อนลงลึก — สอดคล้องกับ PD-004 (thin loop ก่อน deep module).

---

## 3. Phase 1 invariants ที่ lock ไว้: ตัวไหน product-defining, ตัวไหน implementation detail

### Product-defining (เปลี่ยน = ต้อง owner decision ใหม่; กระทบคุณค่าหลัก) — VERIFIED จาก 05/PHASE1_SCHEMA/PD log
1. **Requested ≠ Allocated ≠ Fulfilled** — `allocated_qty` ไม่ถูก store, derived จาก `sum(allocations.quantity)` (PHASE1_SCHEMA §3/§5). เปลี่ยนเป็น "copy ลง demand" = ทำลายหลักการข้อ 1 ของ vision.
2. **Many-to-many supplier sourcing** (PD-005, `supplier_products`) — non-negotiable ตาม vision principle 3.
3. **Gap single-subtraction semantics** (DOC-001 correction) — `backorders.quantity` ไม่ถูกหักซ้ำ (PHASE1_SCHEMA §7, CANONICAL_DATA_MODEL). ตัวเลข shortage ผิด = product ผิด.
4. **Backorder เป็น lifecycle row, ไม่ auto-carry** (PD-011) — พฤติกรรม business ที่ owner ตัดสินใจแล้ว.
5. **Manual supply เป็น adapter ที่ replace ได้** (05 §Phase 1 simplification) — ต้อง record source/confidence/effective date; อนาคต PO/commitment ต้องไม่ reinterpret ประวัติ.
6. **Tenant-scoped RLS + server-authoritative domain** (SEC-TEN-001, 03) — client ไม่เคยตัดสินใจ tenant scope/allocation integrity.
7. **Dealer identity mode = `code` ใน V1** (PD-008) — code เป็น identity claim ไม่ใช่ authorization token; กระทบ UX และ security surface.
8. **Integer/precise quantities** (NFR-003) — ไม่มี floating-point inventory math.
9. **Audit immutability** (SEC-AUD-001) — append-only, ไม่มี UPDATE/DELETE grant.
10. **One supplier = one production source ใน Phase 1** (PD-007) — กำหนดรูปร่าง data model; `supplier_sites` เป็น expand migration Phase 2.

### Implementation detail (เปลี่ยนได้ด้วย ADR โดยไม่กระทบคุณค่าผลิตภัณฑ์) — INFERENCE
1. **Advisory lock per `(tenant_id, variant_id, booking_round_id)`** — ตัว schema เองมี comment ว่า "narrow to per-source locks only if allocation throughput ever measurably suffers" (VERIFIED) → เป็นกลไก, ไม่ใช่ contract.
2. **`tenant_policies` เป็นกลไก** (jsonb + effective_from) vs hard-code config — ทางเลือก implementation; 3 keys ที่ lock ไว้คือค่าเริ่มต้น.
3. **`entitlement_snapshots` รูปร่าง/ตำแหน่ง** — ขึ้นกับ billing contract ที่ยัง pending; เปลี่ยนได้เมื่อ contract จริงมา.
4. **THB base currency (PD-010)** — owner decision แต่ implementation ง่าย (default ค่าเดียว); multi-currency defer อยู่แล้ว.
5. **`dealers.tier` / `supplier_products` ฟิลด์ราคา** — ฟิลด์สำรองที่ V1 ไม่ consume (ดู §1).

---

## 4. ความเสี่ยง technical/delivery ใหญ่สุด

- **อันดับ 1 (INFERENCE — จัดอันดับโดย lens นี้, ตั้งบนหลักฐาน VERIFIED): พื้นผิว anonymous booking link + dealer-code identity path.** หลักฐาน: 03 §Mandatory controls ระบุ booking link รันเป็น anonymous role ภายใต้ narrow policy, code เป็น identity claim ไม่ใช่ token; release baseline ต้องการ negative tests สำหรับ forged booking identity + replay/idempotency abuse. นี่คือจุดเดียวที่ actor ไม่ได้ authenticate สัมผัส DB — พลาดตรงนี้ = cross-tenant data exposure (SEC-DLR-001 แตก). เป็น surface ที่ novel ที่สุดและแพงสุดถ้าผิด.
- **อันดับ 2 (INFERENCE): Allocation concurrency (REL-001)** — over-allocation race ต้องพึ่ง transaction + advisory lock + CHECK constraints; เอกสารระบุวิธีไว้ชัด (VERIFIED) แต่ยังไม่มี code พิสูจน์. ความเสี่ยงปานกลาง, วิธีแก้ถูกออกแบบไว้แล้ว.
- **อันดับ 3 (VERIFIED เป็น pending, INFERENCE เป็นผลกระทบ): Runtime/database placement + billing contract ยังไม่ตัดสินใจ** — schema กันผลกระทบไว้แล้ว (placement-agnostic) แต่ build brief ไม่สามารถ finalize deployment/ops/entitlement จริงได้; ถ้าตัดสินใจช้า = delay launch, ถ้าตัดสินใจผิดทีหลัง = rework ฝั่ง deployment ไม่ใช่ domain.
- **อันดับ 4 (INFERENCE): Scope creep จาก future-ready surface** — entitlement_snapshots, ฟิลด์ราคา, tier, policies 3 keys ถูก lock เข้า schema ก่อนมี consumer; ถ้า build brief ไม่จำกัดขอบเขตชัดเจน จะกลายเป็น "implement ทุกอย่างใน schema" แทน "implement thin loop" — ขัด PD-004.
- **UNKNOWN: ไม่มี effort estimate, ไม่มีทีม/คนที่ระบุ, ไม่มี stack ของแอปที่ระบุใน WSM docs** (02 บอกแค่ "Web UI" + "Server/API" + PostgreSQL/Supabase) — อย่าประเมิน delivery โดยไม่มีตัวเลขเหล่านี้.

---

## 5. Module Hub capabilities ที่ fit (อ่านจาก INDEX.md + modules/REGISTRY.md เท่านั้น — ไม่ได้อ่านโค้ด module ภายใน)

**ข้อควรระวัง (VERIFIED จาก INDEX.md):** modules-hub เป็น library — ห้าม import ข้าม path; ต้อง copy ทั้งโฟลเดอร์ไปที่โปรเจกต์ปลายทาง. ทุกข้อด้านล่างเป็น INFERENCE เรื่อง fit จาก description ใน INDEX/REGISTRY (ไม่ได้อ่าน source จริง → ระดับ confidence = medium).

### Fit สูง — ลด delivery cost ใน V1 ได้จริง
1. **Tenant Context** (P1, ✅ 0.3.0 — `createTenantContext`, `TenantContextManager`, Express-like middleware): ตรงกับความต้องการ tenant scoping ฝั่ง server ของ WSM (SEC-TEN-001). ใช้ได้ทันทีกับ thin loop.
2. **Auth (Data/Login-Agnostic)** (P1, ✅ 0.1.0 — `requireTenantMembership`, `requireRole`, `requirePermission`, `createSupabaseAdapter`/`createJwtAdapter`) + **Supabase Auth Helpers** (P1, ✅ 0.2.0 — `buildRlsContext`): map ตรงกับ role contract ของ WSM (owner/admin/purchasing/warehouse/finance/dealer) และ RLS context. ตัวเลือก adapter ช่วยให้ไม่ต้องผูก auth provider ก่อนตัดสินใจ placement.
3. **Audit Log** (P0, ✅ 0.1.0 — contract actor/action/entity): ตรงกับ SEC-AUD-001. หมายเหตุ: WSM ออกแบบ audit เป็น DB table + RLS (append-only) — module นี้เป็น TS contract; fit แบบ "เอา contract ไปอ้างอิง/เทียบ" มากกว่า copy ตรงๆ เพราะหัวใจอยู่ที่ RLS/GRANT ใน DB (VERIFIED จาก PHASE1_SCHEMA §6).

### Fit กลาง — มีประโยชน์แต่ conditional
4. **Rate Limit** (P1, ✅ 0.1.0): ป้องกัน abuse บน booking link (สอดคล้องกับ negative test "replay/idempotency abuse") — ควรมี, แต่เป็น optional hardening.
5. **Subscription + Entitlement** (P1, ✅ 0.1.0 — `createEntitlementEngine`): fit กับ `entitlement_snapshots`/limits **ก็ต่อเมื่อ** central billing contract ลงตัว — ถ้า WSTERA billing-core เป็นคนกำหนด contract เอง, module นี้ต้องเทียบก่อน. Conditional — อย่า commit ก่อน billing decision.
6. **Product Catalog** (P1, ✅ 0.1.0): WSM มี products/product_variants แต่ model เป็น variant-centric เฉพาะตัว (demand/supply/allocation อ้าง `product_variants.id` เท่านั้น — VERIFIED) — INFERENCE: adapt module ทั่วไปอาจแพงกว่าเขียนเอง; fit ต่ำ-กลาง.

### ไม่ควรใช้ใน V1 (VERIFIED ว่า deferred ใน 08 §Phase 1 dependency minimization: "require only auth, server runtime and database")
- Notification (P0), Webhook Receiver (P0), HTTP Client (P0), Event Bus (P1), Job/Retry (P2), Scheduler (P2), Import/Export (P2), AI Provider (P2), AI Workflow Engine (P2), LINE OA (Pilot), Payment (P1), Feature Flags (P1), Config/Runtime (P0), Health Check (P2), Enterprise Features (P1), Ticket Tracker (P2), File Storage (P0) — ทั้งหมดเป็นของ Phase 2+ หรือไม่ตรงความต้องการ V1. ใช้ตอนนั้นค่อยหยิบ.

### สรุป fit (RECOMMENDATION)
- V1 ควรพิจารณา: **Tenant Context + Auth helpers + Audit Log contract** (3 ตัวนี้ลดงาน tenancy/security ซึ่งเป็น risk อันดับ 1) + **Rate Limit** เป็น hardening.
- ห้าม: ดึง Notification/Event Bus/Job/Scheduler เข้า V1 — ขัด 08 อย่างชัดเจน.
- ทุกตัวที่หยิบต้อง copy เข้าโปรเจกต์ (กฎ INDEX.md) และต้องมี license/version metadata ตาม REGISTRY.

---

## 6. Phase 1 build brief ควร remain authorized ไหม?

- VERIFIED: Documentation Lock (PD-012) authorized แล้ว; build brief ยังไม่ถูกเขียน; MASTER_CHECKLIST ระบุชัดว่า "No migration, scaffold or Phase 1 code is authorized until a separate Phase 1 build brief is written, reviewed and approved."
- **Verdict ของ lens นี้: YES — อนุมัติเส้นทางต่อไป (เขียน + อนุมัติ build brief) ไว้.** เหตุผล (INFERENCE จากหลักฐาน):
  1. เอกสารพร้อมผิดปกติ: column-level schema + RLS design + gates + traceability 25/25 + independent review PASS — งานที่ปกติเป็น "unknown" ในโปรเจกต์ docs-only ถูกขจัดไปแล้ว; เหลือแค่ execution.
  2. PD-004 (thin loop) เป็นหลักการที่ถูกต้องทาง delivery — ขอบเขต V1 เล็กและถูก lock ละเอียด; ความเสี่ยงหลักไม่ใช่ขนาดงานแต่เป็น security surface ซึ่งเอกสารระบุวิธีรับมือไว้แล้ว.
  3. การ "freeze" ต่อจากนี้จะไม่ลดความเสี่ยงอะไรเพิ่ม — ความเสี่ยงที่เหลือ (placement/billing/commercial) เป็น decision ไม่ใช่ documentation.
- **เงื่อนไข/ข้อแม้ (RECOMMENDATION):**
  1. Build brief ต้องไม่แอบ resolve pending decisions (กฎ change rule ใน PRODUCT_DECISIONS: "A pending item cannot be converted into a fact by an implementation brief") — โดยเฉพาะ runtime placement กับ billing contract. ถ้า brief ต้องการ entitlement_snapshots จริง ต้องระบุ source ว่าเป็น stub/placeholder หรือขอ ADR defer.
  2. Brief ต้อง define vertical slice + verification plan + time-box ก่อน migration (ตาม CURRENT_STATUS "Activation Gate").
  3. Brief ต้องระบุ stack ของแอป (ตอนนี้ WSM docs ไม่ระบุ framework — UNVERIFIED) และต้องสอดคล้อง house stack (AGENTS.md: Next.js 15 + Drizzle + Clerk + Tailwind) — แต่ WSM ต้องตัดสินใจเอง, อย่าเดา.
  4. Brief ต้อง scope ฟิลด์ future-ready (ราคา/tier/entitlement) ให้เป็น "schema-only, ไม่มี UI/logic ใน V1" เพื่อกัน scope creep.

---

## 7. Dissent / Uncertainty (สิ่งที่ lens นี้ไม่แน่ใจหรือไม่เห็นด้วยกับเอกสาร)

1. **`entitlement_snapshots` ถูก lock เข้า schema ก่อนมี billing source** — เอกสาร self-consistent (ระบุว่าเป็น "bounded local copy" และ pending contract) แต่ในมุม delivery นี่คือ dead weight ชั่วคราว; ถ้า council อยาก lean ควรให้ build brief เสนอ ADR defer — แต่ถ้าไม่, ต้นทุนก็ต่ำ. ไม่ใช่ dissent แรง, เป็นข้อสังเกต.
2. **ไม่มี effort estimate / stack / ทีมในเอกสารเลย** — ผมไม่สามารถให้ตัวเลข delivery ได้; ใครก็ตามที่ให้ตัวเลขต้องถูกถามหลักฐาน. (UNKNOWN)
3. **Module Hub fit เป็นแค่ description-level** — ผมไม่ได้อ่าน source ของ module (task อนุญาตแค่ list INDEX/REGISTRY); ก่อน commit ใช้ module ใดต้อง audit source จริง + version/license. (UNVERIFIED ในระดับ source)
4. **Auth provider ตัวจริงของ WSM ยังไม่ระบุ** — 03 พูดถึง "approved WSTERA auth boundary" แต่ไม่บอกว่าคืออะไร; นี่เป็น dependency ที่ build brief ต้อง resolve ก่อนเขียน code auth. (UNVERIFIED)
5. **จุดที่ผมเห็นต่างจาก "เอกสารพร้อมแล้ว" narrative เล็กน้อย:** เอกสารพร้อมในแง่ contract แต่ยังไม่มีอะไรพิสูจน์ว่า tenancy/idempotency/concurrency design ใช้ได้จริง — นั่นคือหน้าที่ของ build brief ฉบับแรก; อย่าให้ Documentation Lock PASS ถูกอ่านว่า "implementation จะผ่านง่าย" (INDEPENDENT_REVIEW เองก็เตือนแบบนี้ — VERIFIED).

---

## 8. สรุปหนึ่งย่อหน้า

WSM เป็น docs-only 100% (VERIFIED จาก git) — ไม่มีอะไร build, ขาด build brief + migration + app + 5 launch blockers (placement/billing/commercial/retention/SLA) ซึ่ง 4 ใน 5 เป็น decision ไม่ใช่งาน engineering. ระยะทางถึง "loop ทำงาน" = 1 build brief + 1 รอบ implement (ขอบเขตเล็ก, schema ละเอียด); ถึง "ขายได้" = บวก decision เหล่านั้น. Invariant ที่ product-defining ต้องรักษา: derived allocation, many-to-many sourcing, Gap single-subtraction, backorder lifecycle, manual-supply-as-adapter, RLS/server-authoritative, integer quantities, audit immutability. ความเสี่ยงใหญ่สุด = anonymous booking link + dealer-code identity path (security surface เดียวที่ unauthenticated actor สัมผัส DB). Module Hub ที่ fit V1: Tenant Context, Auth helpers, Audit Log contract, Rate Limit — ห้ามดึง async/notification/AI เข้า V1. **Verdict: ให้ build brief remain authorized ต่อไป พร้อมเงื่อนไข 4 ข้อ (ห้าม resolve pending decisions, ต้องมี vertical slice + verification plan, ต้องระบุ stack, ต้อง scope ฟิลด์ future-ready).**
