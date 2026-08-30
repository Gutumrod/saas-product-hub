# WSM — WSTERA Supply Management — Phase Map

**Product ID:** WS01  
**Updated:** 2026-08-29  
**Status:** Development roadmap / implementation not started  
**Depends on:** `01-north-star-architecture.md`

> หลักการ: **North Star ต้องครบ แต่การพัฒนาต้องเป็น Phase และ Phase แรกต้องครบ end-to-end loop แบบบางที่สุด**

---

## 0. กติกาของ Phase Map

1. ทุก Phase ต้องเพิ่มความสามารถบน flow เดิม ไม่สร้างระบบแยกที่ต้องรื้อภายหลัง
2. Multi-tenant boundary, tenant ownership และ auditability ต้องคิดตั้งแต่ schema แรก
3. Product ↔ Supplier/Factory ต้องเป็น many-to-many ตั้งแต่ต้น
4. Requested, Allocated, Fulfilled และ Ordered, Confirmed, Received ต้องเป็นคนละสถานะ
5. Manual operation ทำได้ในช่วงแรก แต่ต้องบันทึกที่มาและคนแก้
6. ห้ามทำ AI/forecast ก่อนข้อมูลธุรกรรมพื้นฐานเชื่อถือได้
7. Dealer-facing flow ต้องมีตั้งแต่ Phase แรก เพราะเป็นต้นทาง Demand จริง
8. แต่ละ Phase ต้องมี Exit Gate ก่อนขึ้น Phase ถัดไป

---

## Phase Overview

| Phase | เป้าหมาย | สิ่งที่ผู้ใช้ได้จริง |
|---|---|---|
| 0 | Product & Domain Lock | คำศัพท์, flow, schema direction และกติกาหลักไม่คลุมเครือ |
| 1 | Thin End-to-End Supply Loop | Dealer จอง → หลังบ้านเห็น Demand → ใส่ Supply → เห็น Gap → จัดสรร → Dealer เห็นผล |
| 2 | Supply Planning Core | PO, Factory Commitment, Production Batch, Revision และ Incoming ที่เชื่อถือได้ |
| 3 | Allocation & Backorder Core | กติกาจัดสรร, Partial, Backorder, Promise Date และ Reallocation |
| 4 | Inventory & Fulfillment Core | รับเข้า, Stock Ledger, คลัง, Cross-dock, Pick/Pack/Ship |
| 5 | Dealer Operations & Finance | Dealer Portal, payment/deposit, credit, invoice และ shipment visibility |
| 6 | Control Tower & Automation | Dashboard ความเสี่ยง, impact analysis, notification และ workflow automation |
| 7 | Planning Intelligence | Supplier reliability, forecast, recommended PO, risk-adjusted ETA, scenario planning |
| 8 | Scale & Platform Maturity | Enterprise controls, integrations, observability, plan limits และ scale hardening |

---

# Phase 0 — Product & Domain Lock

## Objective

ทำให้ทุกคำในระบบมีความหมายเดียวกันก่อนเขียน schema หรือ code จริง
และปิดช่องว่างระหว่าง North Star กับ Data Model v1 เดิม

## Must Have

- Canonical glossary: Product, Variant, Dealer, Supplier, Factory, PO, Commitment, Production Batch, Incoming, Allocation, Backorder, Promise Date, Fulfillment
- Canonical end-to-end state flow
- Product ↔ Supplier/Factory many-to-many rule
- Supply state definitions: Planned / Ordered / Confirmed / In Production / Completed / Shipped / Received
- Demand state definitions: Requested / Confirmed / Allocated / Backordered / Fulfilled / Cancelled
- Tenant boundary และ role direction
- Audit/event history rule
- Data Model v2 ที่รองรับ North Star และ Phase 1

## Explicitly Deferred

- UI production
- Migration production
- Forecast / AI
- Carrier / accounting integrations
- Full WMS

## Exit Gate

Phase 0 ผ่านเมื่อ North Star, Phase Map, glossary และ Data Model v2 ไม่มี conflict กัน และสามารถอธิบาย flow ตั้งแต่ Dealer Demand ถึง Fulfillment ได้โดยไม่ต้องเดาความหมายของ field/status
---

# Phase 1 — Thin End-to-End Supply Loop

## Objective

สร้าง loop แรกที่ใช้งานจริงได้ครบเส้น โดยแต่ละส่วนทำเท่าที่จำเป็น:

**Create Booking Round → Dealer Link → Demand → Supply Input → Gap → Manual Allocation → Dealer Result**

## Admin / Owner

- สร้าง Tenant และผู้ใช้เจ้าของธุรกิจ
- สร้าง Product / Variant ขั้นพื้นฐาน
- สร้าง Supplier/Factory ขั้นพื้นฐาน และผูก Product ได้หลายราย
- สร้าง Dealer
- สร้าง Booking Round พร้อมวันเปิด/ปิด
- เลือก SKU ที่เปิดรับจองและสร้าง shareable link
- ดู Demand รวมต่อ SKU และต่อ Dealer
- ใส่ On Hand และ Incoming/Confirmed Supply แบบ manual
- เห็น Supply Gap ทันที
- จัด Allocation แบบ manual/partial
- เห็น Remaining Backorder

## Dealer-facing

- เปิด Booking Link โดย flow ต้องเบาและ mobile-first
- ระบุตัวตนตามวิธีที่ tenant อนุญาต
- เลือกสินค้า/variant และจำนวน
- เห็นข้อความชัดว่า Request ไม่ใช่การรับประกัน Allocation
- ส่งคำขอและกลับมาดูสถานะของตัวเองได้
- เห็น Requested / Allocated / Waiting โดยไม่เห็นข้อมูล Dealer อื่น

## Minimum Safety

- Tenant isolation / RLS
- Server-side validation
- Idempotent booking submit
- Audit allocation changes
- ห้าม allocate เกิน supply ที่ระบบอนุญาตโดยไม่มี explicit override
- ห้าม Dealer อ่านข้อมูลข้าม tenant/ข้าม dealer
## Explicitly Deferred

- Auto allocation policy engine
- PO workflow เต็มรูปแบบ
- Production Batch / Revision history
- Warehouse movement / barcode
- Payment / invoice
- Forecast / AI

## Exit Gate

ทดสอบ scenario จริงได้ครบโดยไม่ใช้ Excel แทรกกลาง:

1. Admin เปิดรอบ X100
2. Dealer A ขอ 50, Dealer B ขอ 80
3. ระบบแสดง Demand 130
4. Admin ใส่ Reliable Supply 100
5. ระบบแสดง Shortage 30
6. Admin จัด A=40, B=60
7. ระบบเก็บ Backorder A=10, B=20
8. Dealer ทั้งสองเปิดหน้าตัวเองและเห็นผลถูกต้อง

---

# Phase 2 — Supply Planning Core

## Objective

เปลี่ยน Supply จากตัวเลข manual ให้มีต้นทางและประวัติจริงจาก Supplier/Factory

## Must Have

- Supplier / Factory master ที่สมบูรณ์ขึ้น
- Supplier Product / sourcing relationship
- Purchase Order + PO Items
- Factory Commitment แยกจาก PO
- PO item หนึ่งรายการแตกเป็นหลาย Production Batch ได้
- Requested Qty / Confirmed Qty / Actual Qty แยกกัน
- Planned Date / Confirmed Date / Actual Date แยกกัน
- Commitment / ETA Revision History แบบไม่ overwrite
- Incoming Shipment เบื้องต้น
- Supply Confidence ตามสถานะ
- Gap recalculation เมื่อ Commitment เปลี่ยน
- Trace จาก Supply กลับไป Supplier → PO → Batch

## Exit Gate

PO 500 หน่วยสามารถถูกโรงงาน confirm 150 + 200 + 100 และเหลือ 50 unconfirmed ได้; เมื่อ Batch ใดถูกเลื่อนหรือลดจำนวน Gap ต้องเปลี่ยนตามข้อมูลใหม่ โดย history เดิมยังอยู่ครบ
---

# Phase 3 — Allocation & Backorder Core

## Objective

ทำให้การแบ่งของไม่พอเป็นกระบวนการจริง ไม่พึ่งความจำหรือการจดคิวนอกระบบ

## Must Have

- Allocation policy ต่อ tenant
- First Come First Served
- Dealer Tier / Priority
- Fixed quota
- Pro-rata
- Manual priority / override
- Partial allocation
- Allocation ต่อ On Hand และ Future Supply Batch
- Backorder queue
- Reallocation เมื่อ supply เปลี่ยน
- Dealer Promise Date
- Promise revision history
- Allocation reason / policy snapshot
- Audit ว่าใครแก้อะไรเมื่อไร

## Important Rule

Policy Engine ช่วยคำนวณและเสนอผลได้ แต่การ override ต้องทำได้ตามสิทธิ์ และต้องมีเหตุผล/audit

## Exit Gate

เมื่อ supply 100 แต่ demand 180 ระบบต้องสามารถจัดสรรตาม policy, เก็บ 80 เป็น backorder, ผูก backorder กับ batch ถัดไป และอัปเดต promise ของ Dealer ได้เมื่อ batch ถัดไปเลื่อน

---

# Phase 4 — Inventory & Fulfillment Core

## Objective

เชื่อมสิ่งที่ระบบวางแผนไว้กับของจริงตั้งแต่รับเข้าคลังจนส่งออก

## Must Have

- Warehouse master / multi-warehouse
- Receiving จาก Incoming/Production Batch
- Stock Lot / Batch traceability
- Stock Ledger
- On Hand / Reserved / Available แยกความหมายชัดเจน
- Allocation conversion จาก future supply ไป actual stock
- Cross-dock สำหรับของที่มีคิวรอ
- Pick / Pack
- Full / Partial shipment
- Shipment / tracking record
- Return / damage / stock adjustment ขั้นพื้นฐาน
## Exit Gate

ของที่มาจาก Supplier/PO/Production Batch ต้องรับเข้าเป็น Stock จริงได้, Allocation เดิมต้องตามของล็อตจริงได้, และ Shipment ต้องลด stock / ปิด fulfillment อย่างตรวจสอบย้อนหลังได้

---

# Phase 5 — Dealer Operations & Finance

## Objective

ลดงาน Admin ซ้ำ ๆ โดยให้ Dealer ดูและจัดการธุรกรรมของตัวเองได้มากขึ้น

## Must Have

- Dealer Portal / authenticated dealer view
- Booking / order history
- Allocation / Backorder / Promise Date visibility
- Incoming visibility ตาม policy ของ tenant
- Payment / Deposit
- Payment verification workflow
- Balance due
- Credit limit / credit term
- Receipt / Invoice / Tax Invoice direction
- Shipment / Tracking visibility
- Dealer profile / address / contacts

## Explicitly Deferred

- Full accounting ERP
- Complex tax localization ทุกประเทศ
- Automated credit scoring

## Exit Gate

Dealer สามารถจอง ดูผล allocation จ่าย/แนบหลักฐาน ดูยอดค้าง และติดตาม shipment ของตัวเองโดยไม่ต้องถาม Admin ใน flow ปกติ

---

# Phase 6 — Control Tower & Automation

## Objective

ทำให้ระบบเป็นฝ่ายดึงปัญหาขึ้นมา ไม่ใช่รอให้เจ้าของเปิดดูทีละหน้า

## Must Have

- Executive Control Tower
- Need Attention / risk queue
- Supply Gap by SKU / time window
- Delayed batches
- Affected dealers / orders / units
- Promise at risk
- Impact Analysis เมื่อ commitment เปลี่ยน
- In-app notifications
- Email / LINE OA / webhook integration direction
- Booking close reminders
- Backorder-ready alerts
- Operational task / acknowledgement tracking
## Exit Gate

เมื่อ Factory Batch ถูกเลื่อน ระบบต้องระบุผลกระทบที่เกี่ยวข้อง, สร้างรายการที่ต้องจัดการ และแจ้งผู้เกี่ยวข้องตาม policy ได้ โดยไม่ต้องไล่เช็ก order ทีละรายการ

---

# Phase 7 — Planning Intelligence

## Objective

ใช้ข้อมูลจริงที่สะสมแล้วช่วยตัดสินใจล่วงหน้า โดย recommendation ทุกอย่างต้องอธิบายได้

## Must Have

- Supplier / Factory reliability metrics
- Promised vs Actual lead time
- Quantity fulfillment rate
- Revision frequency
- Demand history / trend
- Safety stock policy
- Recommended reorder point / PO quantity
- Risk-adjusted ETA
- Scenario Planning: Plan A / B / C
- ทดลอง supply reduction / delay โดยไม่แก้ข้อมูลจริง
- Recommended supplier comparison เมื่อ SKU มีหลาย source

## Guardrail

AI หรือ statistical model ไม่มีสิทธิ์สร้าง PO, เปลี่ยน allocation หรือแก้ promise เองโดยไม่มี policy/approval ที่ชัดเจน

## Exit Gate

Recommendation ต้องแสดง input และเหตุผลที่ตรวจสอบได้ และ scenario ต้องสามารถแสดง shortage / affected dealers / promise impact โดยไม่เปลี่ยน production data จริง

---

# Phase 8 — Scale & Platform Maturity

## Objective

ทำให้ WSM พร้อมรองรับ SaaS หลาย tenant และ operation ที่ใหญ่ขึ้นโดยไม่ลดความปลอดภัยหรือ traceability

## Must Have

- Plan / entitlement enforcement
- Usage limits
- Enterprise roles / permission refinement
- SSO / enterprise auth direction ถ้าตลาดต้องการ
- Integration framework / API / webhook hardening
- Accounting / carrier connector ecosystem
- Import/export and migration tooling
- Observability / audit export
- Performance / indexing / archival strategy
- Backup / restore / disaster recovery runbook
- Rate limiting / abuse protection
- Multi-region / localization direction เมื่อมี demand จริง
## Exit Gate

มี tenant หลายรายใช้งานร่วม platform ได้โดยข้อมูลไม่รั่วข้ามกัน, สิทธิ์และ entitlement บังคับใช้จริง, ระบบมี observability/audit และมี runbook สำหรับเหตุขัดข้องสำคัญ

---

# Cross-Phase Non-Negotiables

สิ่งต่อไปนี้ห้ามเลื่อนไปทำทีหลังจนต้องรื้อฐานระบบ:

1. Tenant boundary / RLS
2. Product ↔ Supplier/Factory many-to-many
3. Immutable revision/audit สำหรับข้อมูลที่เป็นคำมั่นและการตัดสินใจสำคัญ
4. Separation of Demand / Allocation / Fulfillment states
5. Separation of PO / Commitment / Receipt states
6. Future-supply allocation capability
7. Dealer data isolation
8. Explicit manual override with audit
9. Stable IDs / timestamps / actor tracking
10. Schema migration discipline

---

# Development Sequence

```text
Phase 0  Domain Lock + Data Model v2
   ↓
Phase 1  Thin End-to-End Loop
   ↓
Phase 2  Supply Planning Core
   ↓
Phase 3  Allocation & Backorder Core
   ↓
Phase 4  Inventory & Fulfillment
   ↓
Phase 5  Dealer Operations & Finance
   ↓
Phase 6  Control Tower & Automation
   ↓
Phase 7  Planning Intelligence
   ↓
Phase 8  Scale & Platform Maturity
```

## Next Artifact

**`04-data-model-v2.md`** — ออกแบบ canonical data model ตาม North Star + Phase Map โดยเริ่มจาก entity/state/constraint ที่ Phase 1 ต้องใช้ แต่ต้องไม่ปิดทาง Phase 2–8

> ห้ามเริ่ม implementation จาก `02-data-model.md` ซึ่งเป็น legacy draft