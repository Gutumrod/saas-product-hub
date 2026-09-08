# WS01 WSM — Product/Customer Lens Analysis (Round 1)

**Lens:** Product/Customer — user, buyer, pain, workflow, adoption, willingness to pay
**Date:** 2026-09-03
**Evidence base:** อ่านจริงจาก repo `D:\AI-Workspace\projects\saas-product-hub\products\WSM` (branch main, HEAD e1eff9b, clean tree — cross-check แล้ว) ไฟล์ SSOT 00–10, PRODUCT_DECISIONS, CURRENT_STATUS, audit 2 ฉบับ, design source, PHASE1_SCHEMA, MASTER_CHECKLIST, daily log 2026-09-03
**Label convention:** VERIFIED = อ่านเจอใน repo โดยตรง / INFERENCE = อนุมานจาก evidence ที่อ่าน / UNVERIFIED = ยังไม่มีหลักฐาน / RECOMMENDATION = ข้อเสนอของ lens นี้

---

## 0. Executive Verdict

WSM เป็น product ที่เอกสารเขียนดีมากในแง่ความซื่อสัตย์ (ทุกอย่างเป็น TARGET CONTRACT, ไม่มี fabricated commercial value, audit ผ่าน) แต่จากมุม Product/Customer: **เอกสารทั้งหมดเป็นสมมติฐาน (hypothesis) ที่ยังไม่เคยถูก validate กับลูกค้าจริงแม้แต่ครั้งเดียว** — ไม่มี evidence ของ customer discovery, interview, pilot, design partner, หรือ willingness-to-pay ใดๆ ใน repo (UNVERIFIED) ตัว product เองมี logic ของ pain ที่สมเหตุสมผล (spreadsheet/LINE/memory เป็น baseline ที่อ้างถึง) แต่ "ใครจะจ่าย" และ "จ่ายเท่าไร" ยังเป็นคำถามเปิดทั้งหมด

**Verdict หลัก:** เอกสารพร้อมสำหรับ Phase 1 build (ด้าน engineering) แต่ **ยังไม่พร้อมสำหรับการตัดสินใจเชิงพาณิชย์** (destination = build-to-validate ยังสมเหตุสมผล; destination = build-to-sell ยังไม่สมเหตุสมผล) ข้อเสนอของ lens นี้: Phase 1 ควรถูกวางเป็น **validation vehicle** — ใช้ thin loop ไปพิสูจน์ pain กับผู้ใช้จริง ก่อนลงทุนต่อใน Phase 2–8

---

## 1. Problem ที่แก้ และแก้ให้ใคร

### 1.1 ปัญหาที่เอกสารอ้าง (VERIFIED — `00_PRODUCT_VISION.md` §Problem, `design/01` §2)

> "Importers/distributors often manage dealer demand, factory commitments, shortages and allocation across spreadsheets, chat and memory. Ordered quantity is mistaken for confirmed supply; dealer requests are mistaken for guaranteed stock; delays are discovered too late."

ปัญหาหลัก 4 ข้อที่เอกสารระบุ:
1. **ข้อมูลกระจัดกระจาย** — demand/supply/commitment อยู่ใน spreadsheet, LINE chat และความจำคน (VERIFIED)
2. **สถานะสับสน** — "สั่งแล้ว" ถูกเข้าใจว่า "ได้ของแน่นอน", "จองแล้ว" ถูกเข้าใจว่า "ได้ของครบ" (VERIFIED — หลักการ Requested ≠ Allocated ≠ Fulfilled, Ordered ≠ Confirmed ≠ Received ใน `00` §Principles)
3. **ของขาด/ล่าช้าถูกค้นพบช้าเกินไป** — ไม่มีระบบเตือนล่วงหน้า (VERIFIED)
4. **การจัดสรรของ scarce supply ทำด้วยมือ** — ไม่มีกติกาที่เป็นระบบ (VERIFIED — ICP ข้อ "currently coordinates allocation manually")

### 1.2 แก้ให้ใคร (VERIFIED — `00` §Primary ICP)

ICP ที่เอกสารระบุ: importer/distributor ที่มีหลาย SKU และหลาย dealer, รับ supply จาก supplier/factory หนึ่งรายขึ้นไป, เจอ partial production/delay/shortage เป็นประจำ, ปัจจุบันจัดสรรด้วยมือ

**จุดอ่อนของ evidence (UNVERIFIED):** ไม่มี evidence ใน repo ว่า ICP นี้มาจากไหน — ไม่มี interview transcript, ไม่มี survey, ไม่มี pilot, ไม่มี design partner, ไม่มี evidence ว่า WSTERA เองเป็นธุรกิจนำเข้าจริงที่มี pain นี้ (search ทั่ว repo: ไม่พบคำว่า validate/interview/pilot/beta/design partner ในบริบท customer discovery) ICP นี้จึงเป็น **สมมติฐานที่เขียนขึ้น** ไม่ใช่ข้อเท็จจริงที่พิสูจน์แล้ว

---

## 2. Buyer คือใครกันแน่

### 2.1 บทบาทที่เอกสารระบุ (VERIFIED — `03_DATA_SECURITY_TENANCY.md` §Role contract, `PHASE1_SCHEMA.md` §tenant_users)

| บทบาท | เอกสารระบุ |
|---|---|
| **Owner** | เจ้าของ tenant — full own-tenant operations + commercial settings |
| Admin | own-tenant operations: catalogue, dealers, rounds, supply, allocation |
| Purchasing | own-tenant supply scope (suppliers/PO/commitments — "when enabled") |
| Warehouse | inventory/fulfillment ("when enabled") |
| Finance | finance scope ("when enabled") |
| Dealer | own data only — booking + status |
| Platform operator | audited support scope |

### 2.2 ใครคือ buyer (INFERENCE จาก evidence)

- **ผู้จ่ายเงิน = tenant owner** — บุคคล/ธุรกิจที่เป็น importer/distributor (INFERENCE: `00` ระบุ "The owner can answer..." และ `03` ให้ Owner เป็น role ที่มี commercial settings; `PHASE1_SCHEMA` tenants.name = "importer business name" — VERIFIED)
- **ผู้ใช้หลักรายวัน = owner/admin** — คนที่สร้างรอบจอง, ดู demand, ใส่ supply, จัดสรร (VERIFIED — `06_UX_USER_FLOWS.md` owner/admin journey 10 ขั้น)
- **ผู้ใช้รอง = dealer** — ตัวแทน/ร้านค้าปลายทางที่กรอก demand ผ่าน booking link (VERIFIED — `06` dealer journey)
- **Purchasing/Warehouse/Finance = ยังไม่ใช่ผู้ใช้ V1** — ทุก role นี้ถูก mark "when enabled" และ roadmap วาง PO/fulfillment/finance ไว้ Phase 2/4/5 (VERIFIED — `10_DEVELOPMENT_ROADMAP.md`)

**ข้อสังเกตสำคัญ (INFERENCE):** ใน V1 คนเดียวที่ "ได้ของ" จากระบบคือ owner/admin (เห็นภาพรวม) และ dealer (เห็นสถานะตัวเอง) — Purchasing/Warehouse/Finance ยังไม่ได้อะไรเลยจนกว่า Phase 2+ จะมา นี่คือข้อจำกัดของ thin loop ที่ต้องยอมรับ: **V1 ขาย pain ของ owner เป็นหลัก ไม่ใช่ pain ของทั้งองค์กร**

**UNVERIFIED:** ไม่มี evidence ว่า "owner" ในที่นี้คือเจ้าของธุรกิจนำเข้าจริงรายใดรายหนึ่ง (เช่น คุณฟรีเองหรือธุรกิจ WSTERA) หรือเป็นสมมติฐานเชิงนามธรรม

---

## 3. Pain ที่ทำให้ยอมจ่ายเงิน แทน spreadsheet/LINE

### 3.1 Pain ที่เอกสารอ้าง (VERIFIED — `00`, `design/01` §2, `05_SUPPLY_DOMAIN_RULES.md`)

1. **ไม่รู้ยอด demand จริงรวม** — dealer ส่งความต้องการผ่าน LINE/โทรศัพท์ กระจัดกระจาย ไม่มี aggregate เรียลไทม์ (VERIFIED — `00` "who wants what")
2. **ไม่รู้ supply ที่ "เชื่อถือได้จริง"** — เอา planned supply มาคิดเป็นของพร้อมใช้ ทำให้ตัดสินใจผิด (VERIFIED — `05` §Supply confidence: on-hand > in-transit > production-completed > factory-confirmed > planned; `00` "what supply is actually reliable")
3. **ของขาดถูกค้นพบช้า** — delay/shortage รู้ทีหลัง กระทบ dealer promise (VERIFIED — `00` "delays are discovered too late")
4. **จัดสรร scarce supply ไม่มีกติกา/ตามย้อนไม่ได้** — ใครได้เท่าไร ตัดสินใจเฉพาะหน้า ไม่มี audit (VERIFIED — `05` invariant 10: manual override ต้องมี actor/reason/audit)
5. **การเปลี่ยนของโรงงานกระทบใครบ้าง ไม่รู้** — impact analysis เป็น North Star (Phase 6) ไม่ใช่ V1 (VERIFIED — `design/01` §15, `10` Phase 6)

### 3.2 Pain ไหน "จ่ายเงินได้จริง" (INFERENCE + RECOMMENDATION)

จากมุม lens นี้ pain ที่มีน้ำหนักเชิงพาณิชย์มากที่สุดคือ **#1 + #2 รวมกัน**: "รวม demand จาก dealer หลายรายเป็นตัวเลขเดียวที่เชื่อถือได้ + แยกของที่ 'มั่นใจได้' ออกจากของที่ 'แค่สั่งไว้'" — เพราะนี่คือสิ่งที่ spreadsheet ทำได้ยากจริง (ต้อง merge หลายไฟล์/หลายแชท) และผิดพลาดแล้วเสียเงินจริง (สั่งของเกิน/ขาด, จัดสรรผิดตัวแทน)

Pain #3 (delay รู้ช้า) และ #4 (จัดสรรด้วยมือ) เป็น pain จริงแต่ spreadsheet ยัง "พอรับมือได้" — ต้องพิสูจน์ว่า WSM ดีกว่าอย่างมีนัยสำคัญ (RECOMMENDATION: ใช้เป็นข้อความขายรอง ไม่ใช่แกน)

**UNVERIFIED:** ไม่มี evidence ตัวเลขว่า pain เหล่านี้คิดเป็นเงินเท่าไร (เช่น % ของ shortage, มูลค่าความเสียหายจาก delay) — ไม่มีตัวเลข TAM/SAM, ไม่มี competitor analysis, ไม่มี evidence ว่าธุรกิจนำเข้าไทย/ภูมิภาคนี้กำลังจ่ายเงินแก้ปัญหานี้กับ tool อะไรอยู่

---

## 4. Smallest end-to-end supply loop ที่พิสูจน์ value

### 4.1 Loop ที่ล็อกแล้ว (VERIFIED — `10` Phase 1, `01_PRD.md`, `06_UX_USER_FLOWS.md`)

```
Dealer booking (mobile link) → demand → manual reliable supply → gap → manual/partial allocation → backorder → dealer result
```

Owner journey 10 ขั้น (`06`): login → สร้าง variant + supplier mapping → สร้าง dealer → สร้าง booking round → แชร์ลิงก์ → ดู demand aggregate → ใส่ supply + confidence → ดู gap → จัดสรร full/partial → ดู backorder + ผลที่ dealer เห็น

### 4.2 เกณฑ์ "พิสูจน์ value" ของ lens นี้ (RECOMMENDATION)

Loop นี้พิสูจน์ value ได้จริงเมื่อตอบคำถาม 3 ข้อนี้ได้จากระบบเดียว (INFERENCE จาก `00` §Core value):

1. **"รอบนี้ dealer ทั้งหมดต้องการ X100 รวมเท่าไร"** — แทนการนับจาก LINE/spreadsheet (VERIFIED ว่าเป็นคำถามใน `00`)
2. **"ของ X100 ที่มั่นใจได้จริงมีเท่าไร (ไม่นับ planned)"** — แทนการเดาจากความจำ (VERIFIED — `05` confidence classes)
3. **"ของไม่พอ ใครได้เท่าไร เหลือ backorder เท่าไร"** — แทนการจัดสรรด้วยมือ (VERIFIED — `01` FR-ALC-001/002, FR-DLR-002)

**ข้อจำกัดของ loop นี้ (INFERENCE):** loop จบที่ "dealer เห็นผล" แต่ **ยังไม่จบที่ "ของส่งจริง"** — fulfillment อยู่ Phase 4 ดังนั้น V1 ยังพิสูจน์ได้แค่ "วางแผนถูกต้อง" ไม่ใช่ "ส่งของถูกต้อง" นี่คือขอบเขตที่ต้องสื่อสารกับลูกค้าให้ชัด (RECOMMENDATION: อย่าขาย V1 ว่าเป็นระบบ fulfillment)

**UNVERIFIED:** ไม่มี evidence ว่า loop นี้เคยถูกทดลองกับผู้ใช้จริง (ไม่มี pilot/beta evidence) — "พิสูจน์ value" ในตอนนี้เป็นเพียงทฤษฎี

---

## 5. Phase 1 invariants ที่ล็อกแล้ว: product-defining vs implementation detail

### 5.1 Product-defining (ต้องคงไว้ ไม่ใช่แค่ engineering) (INFERENCE)

| Invariant | เหตุผลที่ product-defining |
|---|---|
| **PD-004: thin end-to-end loop ก่อน deep module** | ตรงกับหลัก "พิสูจน์ value ทั้งเส้นก่อนลงลึก" — ถ้า loop ไม่ครบ ลูกค้าไม่เห็น value เลย (VERIFIED — `10` Phase 1) |
| **PD-005: Product ↔ Supplier/Factory many-to-many** | สะท้อนความจริงธุรกิจ (สินค้าเดียวซื้อหลายโรงงาน) — ถ้าทำ one-to-many จะบังคับให้ลูกค้าโกหกข้อมูล (VERIFIED — `00` principle 3, `05` invariant 5) |
| **Requested ≠ Allocated ≠ Fulfilled / Ordered ≠ Confirmed ≠ Received** | นี่คือ "ภาษา" ของ product — ถ้าไม่แยกสถานะ product ก็ไม่ต่างจาก spreadsheet ที่ปนกัน (VERIFIED — `00` principles 1–2, `05` invariants 1–4) |
| **Tenant-configurable policy** | "no one allocation rule fits every business" — ถ้า hardcode กติกาจัดสรร จะขายได้แค่ธุรกิจเดียว (VERIFIED — `00` principle 5) |
| **History over overwrite (audit)** | จำเป็นต่อความไว้ใจในเรื่องเงิน/ของ — override ได้แต่ต้องตามย้อนได้ (VERIFIED — `00` principle 4, `05` invariant 10) |
| **PD-008: dealer identity = code** | ถูกต้องสำหรับ V1 — dealer กรอก code ผ่านลิงก์ ไม่ต้องสร้าง account ลด friction การรับ demand (VERIFIED — `PRODUCT_DECISIONS.md`) |

### 5.2 Implementation detail (เปลี่ยนได้โดยไม่ทำลาย product) (INFERENCE)

| Invariant | เหตุผล |
|---|---|
| **PD-007: 1 supplier = 1 production source (ไม่มี supplier_sites)** | เป็นการตัดขอบเขตเพื่อความเร็ว — มี expand migration ชัดเจนใน Phase 2 (VERIFIED — `PHASE1_SCHEMA.md` §suppliers) |
| **PD-009: manual supply tenant-global โดย default** | เป็นค่า default ของ UX ไม่ใช่หลักการ — round-scope ยังเป็น filter ได้ (VERIFIED — `PHASE1_SCHEMA.md` §supply_entries) |
| **PD-010: THB base currency** | ถูกต้องตามหลัก "อย่าออกแบบล่วงหน้าเกินจริง" — เปลี่ยนได้เมื่อมี non-THB tenant จริง (VERIFIED — `PRODUCT_DECISIONS.md`) |
| **PD-011: backorder ไม่ auto-carry** | เป็นการตัดขอบเขต UX — ต้องมี admin action แทน แต่ไม่กระทบหลัก "backorder ต้องไม่หาย" (VERIFIED — `PRODUCT_DECISIONS.md`, `PHASE1_SCHEMA.md` §backorders) |
| **Advisory lock per variant-round** | เป็น engineering detail ล้วน (VERIFIED — `PHASE1_SCHEMA.md` §allocations) |

**ข้อสังเกต (INFERENCE):** สัดส่วน product-defining ต่อ implementation detail ในชุดนี้ดี — สิ่งที่ล็อกเป็นหลักการ (สถานะแยก, many-to-many, audit, tenant policy) ล้วนเป็นสิ่งที่แก้ทีหลังยาก ส่วนที่ล็อกเป็นรายละเอียด (site, currency, carry) ล้วนมีทาง expand ชัดเจน ไม่มี invariant ไหนที่ "ตัน" ต่อ North Star

---

## 6. Multi-tenant SaaS: สมเหตุสมผลไหม

### 6.1 Evidence (VERIFIED)

- `00` §Product category: "Multi-tenant B2B supply planning and dealer allocation SaaS"
- `design/01` §25: "North Star นี้เป็น SaaS ไม่ใช่ระบบของบริษัทเดียว" — 1 tenant = 1 ธุรกิจนำเข้า/distributor, tenant boundary + RLS ตั้งแต่ schema แรก
- `02` §Architectural shape: multi-tenant web SaaS, server-authoritative
- `03` + `PHASE1_SCHEMA`: RLS ทุก business table, tenant_id ทุกตาราง

### 6.2 การประเมินของ lens นี้ (INFERENCE + RECOMMENDATION)

**ข้อโต้แย้งที่สนับสนุน multi-tenant SaaS:**
- Pain นี้ (importer/distributor หลาย SKU หลาย dealer) เป็น pain ที่เกิดซ้ำในหลายธุรกิจประเภทเดียวกัน — ไม่ใช่ pain เฉพาะบริษัทเดียว (INFERENCE จาก ICP ที่เอกสารเขียน — แต่ ICP เองยังไม่ validated)
- Tenant-configurable policy (principle 5) บอกเป็นนัยว่าออกแบบมาเพื่อหลายธุรกิจที่มีกติกาต่างกัน (VERIFIED)
- ต้นทุนต่อ tenant ต่ำ (SaaS บน Supabase) — โมเดลนี้ feasible ทางเทคนิค (VERIFIED — `08` Phase 1 ต้องการแค่ auth + server + database)

**ข้อโต้แย้งที่ท้าทาย:**
- **ไม่มี evidence ของ demand จากหลาย tenant** — ไม่มี waitlist, ไม่มี LOI, ไม่มี evidence ว่ามีธุรกิจนำเข้า 2+ รายที่ต้องการสิ่งนี้ (UNVERIFIED) การตัดสินใจ "SaaS หลาย tenant" ณ ตอนนี้เป็น **การพนันเชิงกลยุทธ์ของ owner** ไม่ใช่การตอบสนองต่อ demand ที่พิสูจน์แล้ว
- **ค่าใช้จ่ายแฝงของ SaaS** — multi-tenant หมายถึงต้องมี billing/entitlement (ยัง pending), onboarding, support, SLA, retention policy (ทุกอย่างยัง TBD — VERIFIED `04`, `PRODUCT_DECISIONS.md` pending list) นี่คือภาระที่ single-tenant/self-host ไม่มี
- **ทางเลือกที่แข็งกว่าสำหรับระยะแรก (RECOMMENDATION):** "single-tenant-first แต่ schema เป็น multi-tenant-ready" — โค้ดและ schema ยังเป็น multi-tenant (RLS, tenant_id) แต่ขาย/ deploy ให้ tenant แรก (หรือ WSTERA เอง) ก่อน พิสูจน์ value กับธุรกิจจริง 1–2 ราย แล้วค่อยเปิดเป็น SaaS เต็มรูปแบบ วิธีนี้ได้ทั้งความเร็วและไม่ต้องจ่ายค่า SaaS overhead (billing, support, SLA) ก่อนมี revenue

**Verdict ด้านนี้ (INFERENCE):** multi-tenant SaaS เป็นทิศทางที่สมเหตุสมผลในระยะยาวและ schema ก็เตรียมไว้ถูกต้องแล้ว แต่ **การเปิดเป็น SaaS เต็มรูปแบบก่อนมี tenant จริงพิสูจน์ value = เสี่ยง** lens นี้แนะนำ single-tenant-first deployment (schema ยัง multi-tenant) เป็น bridge

---

## 7. Minimum V1 finish line ที่ใช้ได้และขายได้

### 7.1 เส้นชัยตามเอกสาร (VERIFIED — `01_PRD.md`)

V1 = Required ทั้งหมด: FR-TEN/AUTH/CAT/SUP/DLR (tenant + catalogue) + FR-BKG/DMD (booking + demand) + FR-SPL/GAP/ALC/DLR-002 (supply + gap + allocation + dealer result) + SEC-TEN/DLR/AUD + REL-001/002 + NFR-001/002/003 + OPS-001/002 + public-launch rule (ห้าม marketing ว่า shipped ก่อนมี evidence)

### 7.2 การประเมินของ lens นี้ (INFERENCE + RECOMMENDATION)

**V1 ที่ "ใช้ได้" (usable) ต้องมี:**
1. Booking round + mobile link + dealer code (FR-BKG-001/002, PD-008) — VERIFIED
2. Demand aggregate ต่อ SKU/dealer (FR-DMD-001) — VERIFIED
3. Manual supply + confidence + gap computation (FR-SPL-001, FR-GAP-001) — VERIFIED
4. Manual/partial allocation + backorder + dealer-visible result (FR-ALC-001/002, FR-DLR-002) — VERIFIED
5. Idempotency (FR-BKG-003) — **สำคัญต่อความไว้ใจของ dealer** ถ้า submit ซ้ำแล้ว demand ซ้ำซ้อน dealer จะไม่ไว้ใจ (VERIFIED — REL-001)

**V1 ที่ "ขายได้" (sellable) ต้องมีเพิ่ม (RECOMMENDATION — ยังไม่ใช่ Required ใน PRD):**
- **Export (OPS-001)** — ลูกค้าที่ใช้ spreadsheet อยู่จะไม่ย้ายมาถ้า export กลับไป spreadsheet ไม่ได้ นี่คือ "ทางหนี" ที่จำเป็นต่อ adoption (VERIFIED ว่า OPS-001 เป็น Required อยู่แล้ว — ดี)
- **การสื่อสาร "ไม่ใช่ระบบ fulfillment"** — ต้องตั้งความคาดหวังให้ถูก (RECOMMENDATION)
- **Onboarding ที่เร็วมาก** — ตั้ง tenant + สร้าง variant + dealer + รอบจองแรก ภายในไม่กี่นาที (RECOMMENDATION — ไม่มี NFR วัดเวลานี้ใน PRD)

**สิ่งที่ V1 ไม่จำเป็นต้องมี (ตัดออกได้โดยไม่เสียการขาย) (INFERENCE):**
- Notification/LINE integration (Phase 6) — dealer ยังเข้าลิงก์เองได้
- Finance/deposit (Phase 5) — ยังไม่จำเป็นต่อ loop วางแผน
- Intelligence/forecast (Phase 7) — ขายทีหลังเมื่อมี data

**เส้นชัยขั้นต่ำ (RECOMMENDATION):** "owner สร้างรอบจอง → dealer กรอก demand ผ่านลิงก์ → owner เห็น demand รวม + gap + จัดสรร + dealer เห็นผลตัวเอง" ครบ + export ได้ + tenant isolation พิสูจน์ได้ (negative tests) + release evidence ครบ Required — นี่คือ minimum sellable V1

---

## 8. Evidence gaps ที่ lens นี้พบ (สำคัญที่สุด)

1. **UNVERIFIED: ไม่มี customer discovery ใดๆ** — ไม่มี interview/survey/pilot/design partner ใน repo ทั้งหมด ICP เป็นสมมติฐาน
2. **UNVERIFIED: ไม่มี evidence ของ willingness to pay** — ราคา/plan/limits ทั้งหมด TBD (`04`), ไม่มี evidence ว่าธุรกิจเป้าหมายจ่ายเงินแก้ปัญหานี้อยู่แล้วกับ tool ไหน
3. **UNVERIFIED: ไม่มี evidence ว่า WSTERA เองเป็นธุรกิจนำเข้าจริง** — repo ไม่มี evidence ว่า product นี้จะถูกใช้กับธุรกิจจริงของ owner ก่อน (ถ้าใช่ นี่คือ design partner ฟรีที่ควรใช้)
4. **UNVERIFIED: ไม่มี competitor/alternative analysis** — spreadsheet/LINE ถูกอ้างเป็น baseline แต่ไม่มี evidence ว่า baseline นี้ "เจ็บ" แค่ไหนในเชิงตัวเลข
5. **UNVERIFIED: ไม่มี evidence ของ demand หลาย tenant** — การตัดสินใจ multi-tenant SaaS ยังไม่ grounded
6. **VERIFIED (แต่ต้องระวัง):** CURRENT_STATUS.md ถูก cross-check แล้ว — สอดคล้องกับ git state (HEAD e1eff9b = "docs: authorize WSM lock and prepare phase1 schema contract", clean tree) และ audit evidence (INDEPENDENT_REVIEW PASS, PD-012 authorized) — ไม่พบความขัดแย้ง

---

## 9. Dissent / ความไม่เห็นด้วยกับทิศทางปัจจุบัน

1. **Dissent หลัก (INFERENCE):** ลำดับ "Documentation Lock → Phase 1 build brief → build" ถูกต้องสำหรับ engineering แต่ **ไม่มี gate ใดบังคับให้ product ไปเจอผู้ใช้จริง** — lens นี้เสนอให้เพิ่ม "customer validation gate" ใน Phase 1 build brief: ก่อน/ระหว่าง build ต้องระบุ tenant จริง (แม้แต่ WSTERA เอง) ที่จะใช้ thin loop นี้ และ metric ที่จะวัด (เช่น เวลาที่ใช้รวม demand ลดลง, % shortage ที่รู้ล่วงหน้า)
2. **Dissent รอง (INFERENCE):** การล็อก "multi-tenant SaaS" เป็น product category ตั้งแต่ `00` (VERIFIED) อาจ premature — ควรล็อกเป็น "multi-tenant-ready" และปล่อย delivery model (SaaS เต็ม vs single-tenant-first) เป็นการตัดสินใจหลัง validation (RECOMMENDATION)
3. **Dissent เรื่องขอบเขต V1 (INFERENCE):** PRD 25 ข้อเป็นขอบเขตที่สมเหตุสมผล แต่ **ไม่มีข้อใดวัด "value ที่ลูกค้ารับรู้"** — ทั้งหมดเป็น functional/security/ops ไม่มี success metric ด้านลูกค้า (เช่น dealer adoption rate ต่อรอบ, เวลาที่ owner ประหยัดได้) (RECOMMENDATION: เพิ่ม NFR/OKR ด้าน adoption ใน build brief)

---

## 10. สรุปสำหรับ Council

| คำถาม | คำตอบ | สถานะ |
|---|---|---|
| Problem แก้อะไร | demand/supply/gap/allocation กระจัดกระจายใน spreadsheet/LINE/ความจำ, สถานะสับสน, ของขาดรู้ช้า | VERIFIED (เป็น hypothesis ที่เขียนใน docs) |
| แก้ให้ใคร | importer/distributor (owner/admin) + dealer | VERIFIED (ICP ใน docs) / UNVERIFIED (ICP ไม่เคย validated) |
| Buyer คือใคร | tenant owner (เจ้าของธุรกิจนำเข้า) — จ่ายเงิน; admin ใช้รายวัน; dealer ใช้กรอก demand | INFERENCE |
| Pain ที่จ่ายเงินได้ | รวม demand หลาย dealer + แยก reliable supply ออกจาก planned | INFERENCE |
| Smallest loop | booking → demand → supply → gap → allocation → backorder → dealer result | VERIFIED (Phase 1) |
| Invariants product-defining | thin loop, many-to-many, สถานะแยก, tenant policy, audit, dealer code | INFERENCE |
| Multi-tenant SaaS | ทิศทางถูกระยะยาว แต่ premature ณ ตอนนี้ — แนะนำ single-tenant-first (schema ยัง multi-tenant) | RECOMMENDATION |
| Minimum V1 | thin loop ครบ + export + tenant isolation + release evidence | RECOMMENDATION |

**ข้อความสุดท้ายถึง Council:** WSM มีรากฐานเอกสารที่แข็งแรงและซื่อสัตย์ แต่เป็น product ที่ "ยังไม่เคยเจอลูกค้า" — อย่าตัดสินใจเชิงพาณิชย์ (ราคา, delivery model, phase 2+ scope) บนสมมติฐานที่ยังไม่ validated ให้ Phase 1 เป็นเครื่องพิสูจน์ pain กับผู้ใช้จริง แล้วค่อยตัดสินใจ destination ใหญ่
