# WSM — WSTERA Supply Management — North Star Architecture

**Product ID:** WS01  
**Updated:** 2026-08-29  
**Status:** North Star / Product Destination  
**Scope:** จุดหมายปลายทางของระบบ ไม่ใช่รายการงานที่พัฒนาเสร็จแล้ว

> หลักการ: **คิดภาพปลายทางให้ครบก่อน แล้วค่อยแบ่งทำทีละ Phase**
> Phase แรกไม่จำเป็นต้องใหญ่ แต่โครงสร้างและทิศทางต้องไม่ตันเมื่อระบบโต

---

## 1. North Star Statement

**WSM (WSTERA Supply Management)** คือระบบกลางสำหรับธุรกิจนำเข้าที่มีสินค้า โรงงาน และตัวแทนหลายราย
เพื่อควบคุมตั้งแต่ความต้องการของตัวแทน การสั่งและการผลิตจากโรงงาน การจัดการของขาด
การจัดสรรสินค้า การรับเข้า จนถึงการส่งสินค้าให้ตัวแทน โดยทุกฝ่ายอ้างอิงข้อมูลชุดเดียวกัน

แกนหลักของ Product คือ:

**Demand → Supply → Gap → Allocation → Fulfillment**

ทุก feature ในอนาคตต้องตอบได้ว่าช่วยอย่างน้อยหนึ่งแกนนี้หรือไม่

---

## 2. ปัญหาหลักที่ระบบต้องแก้

เจ้าของธุรกิจต้องตอบคำถามเหล่านี้ได้ตลอดเวลา:

- ตัวแทนต้องการสินค้าอะไร จำนวนเท่าไร และต้องการเมื่อไร
- มีของพร้อมส่งจริงเท่าไร
- มีของกำลังผลิต/กำลังเข้าเท่าไร และเชื่อถือได้แค่ไหน
- โรงงานไหนรับปากว่าจะผลิตอะไร จำนวนเท่าไร เมื่อไร
- โรงงานส่งช้าหรือผลิตไม่ครบจะกระทบใครบ้าง
- สินค้าตัวไหนกำลังจะขาด และขาดเท่าไร
- ถ้าของไม่พอ ใครควรได้ของรอบไหน และตามกติกาอะไร
- ตัวแทนแต่ละรายจะได้ของเท่าไร เหลือ Backorder เท่าไร และคาดว่าจะได้เมื่อไร
- ของที่เข้าคลังแล้วต้องถูกส่งต่อให้ใคร
- ควรออก PO เพิ่มเมื่อไร และควรสั่งเท่าไร

ระบบต้องลดการพึ่งพา Excel, LINE chat และความจำของคน
โดยทำให้ Demand, Supply, Allocation และสถานะการส่งเป็น Source of Truth เดียวกัน

---

## 3. End-to-End System Flow

```text
Dealer / Sales Demand
        ↓
Booking / Order Intake
        ↓
Demand Control
        ↓
Stock + Existing Incoming Supply
        ↓
Purchase Planning / PO
        ↓
Supplier / Factory Commitment
        ↓
Production Batch / Revision
        ↓
Incoming Shipment
        ↓
Supply Gap Detection
        ↓
Allocation / Backorder
        ↓
Dealer Promise
        ↓
Warehouse Receive / Cross-dock
        ↓
Pick / Pack / Ship
        ↓
Dealer Fulfillment / Tracking
```

North Star ต้องเชื่อม flow นี้ทั้งเส้น แม้ในแต่ละ Phase จะเปิดใช้เพียงบางความสามารถ

---

## 4. Product / Supplier Relationship — ต้องรองรับหลายแบบตั้งแต่ต้น

ระบบต้อง **ไม่ผูก 1 สินค้า = 1 โรงงาน**

ต้องรองรับพร้อมกันได้ทั้งหมด:

1. หลายสินค้า จากโรงงานเดียว
2. หลายสินค้า จากหลายโรงงาน
3. สินค้าเดียว ซื้อได้จากหลาย Supplier / Factory
4. Supplier เดียวมีหลายโรงงานผลิต
5. PO เดียวสามารถมีหลาย SKU
6. SKU เดียวสามารถมีหลาย PO และหลาย Production Batch พร้อมกัน

ความสัมพันธ์เชิงแนวคิด:

```text
Products
   ↕
Supplier Products
   ↕
Suppliers / Factories
   ↓
Purchase Orders
   ↓
Production Batches
```

ตัวอย่าง:

| SKU | Supplier/Factory | สั่ง | Confirmed | ETA |
|---|---|---:|---:|---|
| X100 | Factory A | 500 | 300 | 20 Sep |
| X100 | Factory B | 100 | 100 | 12 Sep |
| X200 | Factory C | 200 | 180 | 25 Sep |

ระบบจึงต้องดูได้ทั้งมุม **ต่อ SKU**, **ต่อ Factory**, **ต่อ PO** และ **ภาพรวมทั้งบริษัท**

---

## 5. Dealer Demand & Booking Intake

ระบบต้องมีช่องทางรับ Demand จากตัวแทนโดยตรง เช่น Booking Link / Dealer Portal / LINE LIFF
ตัวแทนสามารถระบุสินค้า จำนวน Variant และข้อมูลที่จำเป็นต่อการจอง

Demand ต้องมีสถานะอย่างน้อย:

- Requested
- Confirmed
- Allocated
- Partially Allocated
- Backordered
- Fulfilled
- Cancelled

หลักสำคัญ: **Requested Quantity ไม่เท่ากับ Allocated Quantity**
ระบบต้องไม่ทำให้ตัวแทนเข้าใจว่าจองแล้วแปลว่าได้ของครบแน่นอน

ระบบหลังบ้านต้องรวม Demand ต่อ SKU / รอบ / Dealer ได้ทันที
เพื่อให้เห็นยอดต้องการจริงก่อนสั่งของหรือก่อนของเข้าคลัง

---

## 6. Demand Control Center

เจ้าของต้องเห็นอย่างน้อย:

- Dealer Demand
- Confirmed Orders
- Backorders
- Current Stock
- Existing Incoming
- Demand Gap
- Demand Trend

ตัวอย่าง: `X100 — Demand 500 / On Hand 50 / Existing Incoming 200 / Gap 250`

---

## 7. Purchase Planning / Replenishment

ระบบต้องช่วยเจ้าของตัดสินใจก่อนออก PO โดยเทียบ:

```text
Dealer Demand
+ Safety Stock Target
- On Hand
- Reliable Incoming
= Replenishment Need
```

North Star สามารถแนะนำ Recommended PO ได้ แต่เจ้าของยังเป็นผู้อนุมัติ

ข้อมูลที่ควรนำมาคิดในอนาคต:

- MOQ
- Lead Time
- Supplier price break
- Current stock
- Existing PO
- Backorder
- Demand trend
- Supplier reliability
- Safety stock policy

การแนะนำ PO ต้องอธิบายเหตุผลได้ ไม่ใช่ตัวเลขจาก AI ที่ตรวจสอบไม่ได้

---

## 8. Supplier & Factory Management

Supplier / Factory ต้องเป็นข้อมูลหลักของระบบ ไม่ใช่ text field ใน PO
ควรเก็บอย่างน้อย:

- Supplier / Factory identity
- สินค้าที่ผลิตหรือขายได้
- MOQ
- Lead Time ปกติ
- Production Capacity ถ้ามีข้อมูล
- Currency / Payment Terms
- Contact / Shipping Origin
- Historical delivery performance

หากสินค้าเดียวมีหลาย Supplier ระบบต้องเปรียบเทียบต้นทุน Lead Time และความเสี่ยงได้
โดยไม่บังคับให้เจ้าของเลือก Supplier สำรองอัตโนมัติ

---

## 9. Factory Commitment

PO คือสิ่งที่ผู้นำเข้าสั่ง แต่ **Factory Commitment คือสิ่งที่โรงงานรับปากว่าจะส่งจริง**
สองอย่างนี้ต้องแยกจากกัน

ตัวอย่าง: สั่ง X100 จำนวน 500 คู่ แต่โรงงาน Confirm เป็นหลายรอบ:

- Batch A — 150 คู่ — 10 Sep
- Batch B — 200 คู่ — 25 Sep
- Batch C — 100 คู่ — 10 Oct
- Remaining 50 — Unconfirmed

สถานะ Supply ต้องแยกได้อย่างน้อย:

- Ordered
- Confirmed
- In Production
- Production Completed
- Shipped
- Received
- Cancelled

---

## 10. Production Batch & Revision History

PO หนึ่งใบต้องรองรับการผลิตและส่งหลาย Batch
เพราะโลกจริงโรงงานอาจผลิตไม่ครบตามจำนวนหรือวันที่ที่ตกลงครั้งแรก

การเปลี่ยน Commitment ห้ามแก้ข้อมูลเดิมทับแล้วหายไป
ระบบต้องเก็บ Revision History เช่น:

```text
Initial     200 units — 15 Sep
Revision 1  180 units — 20 Sep
Revision 2  150 units — 25 Sep
Actual      142 units — 27 Sep
```

ทุก Revision ต้องตอบได้ว่า:

- เปลี่ยนจากอะไรเป็นอะไร
- ใครเป็นคนบันทึก
- เปลี่ยนเมื่อไร
- กระทบ Allocation / Dealer Promise ไหนบ้าง

ข้อมูลนี้จะกลายเป็นฐานของ Factory Reliability ในอนาคต

---

## 11. Incoming Supply Confidence

ของกำลังเข้าแต่ละสถานะมีความแน่นอนไม่เท่ากัน
ระบบต้องแยก Planned Supply ออกจาก Reliable Supply

ตัวอย่างระดับความมั่นใจเชิงธุรกิจ:

- On Hand — แน่นอนที่สุด
- Shipped / In Transit — ความมั่นใจสูง
- Production Completed — สูง
- Factory Confirmed — ปานกลางถึงสูงตามประวัติ
- Planned / Unconfirmed — ต่ำ

ระบบต้องไม่เอา Incoming ทุกชนิดมานับเป็นของพร้อมใช้เท่ากันโดยไม่แยกสถานะ

---

## 12. Supply Gap Engine

นี่คือแกนกลางของ Product

ระบบต้องคำนวณอย่างต่อเนื่องต่อ SKU / Variant / ช่วงเวลา:

```text
On Hand
+ Reliable Future Supply
- Confirmed Dealer Demand
- Backorder
= Supply Position
```

ถ้าค่าติดลบ ระบบต้องระบุ Shortage อย่างชัดเจน

ตัวอย่าง:

```text
X100
On Hand                 50
Confirmed Future       250
Dealer Demand          470
SHORTAGE               170
```

Gap ต้องดูได้ทั้งวันนี้ ตาม Batch และตามช่วงเวลาในอนาคต

---

## 13. Allocation Engine

เมื่อ Supply น้อยกว่า Demand ระบบต้องช่วยจัดสรรของตามกติกาของแต่ละธุรกิจ

กติกาที่รองรับควรมีได้หลายแบบ เช่น:

- First Come First Served
- Dealer Tier / Priority
- Fixed Quota
- Sales Performance
- Deposit Paid First
- Pro-rata ตามสัดส่วน
- Strategic Dealer
- Manual Priority
- Hybrid Policy

เจ้าของต้องสามารถ Override ได้ แต่ทุก Override ต้องมี Audit Trail

ผล Allocation ต้องระบุอย่างน้อย:

- Requested Quantity
- Allocated Quantity
- Remaining Backorder
- Source Supply / Batch
- Allocation Reason / Policy
- Allocated By / Allocated At

หลักสำคัญ: Allocation ต้องผูกได้ทั้งกับ On-Hand Stock และ Future Supply ที่เชื่อถือได้
ไม่ควรบังคับให้รอสินค้ากลายเป็น Stock Lot ก่อนจึงเริ่มจัดคิวได้

---

## 14. Backorder Queue & Dealer Promise

ของที่จัดสรรไม่ครบต้องคงอยู่เป็น Backorder ไม่ใช่หายจากระบบ

ตัวอย่าง:

```text
Dealer B / X100
Requested    50
Allocated    30
Backorder    20
```

Backorder ต้องสามารถไหลไปหา Production Batch หรือ Incoming Batch ถัดไปได้

เมื่อ Allocation เชื่อมกับ Supply Batch ระบบจะสร้าง Dealer Promise ได้ เช่น:

```text
30 units — Expected Dispatch 14 Sep
20 units — Expected Dispatch 29 Sep
```

Promise Date ต้องอัปเดตเมื่อ Factory Commitment หรือ ETA เปลี่ยน
และต้องเก็บประวัติการเปลี่ยนเพื่ออธิบายย้อนหลังได้

---

## 15. Impact Analysis

เมื่อโรงงานลดจำนวนหรือเลื่อนวัน ระบบต้องคำนวณผลกระทบทันที เช่น:

- Affected Dealers
- Affected Orders
- Affected Units
- Affected Promise Dates
- Backorder เพิ่มขึ้นเท่าไร
- Revenue / Cash Flow ที่เกี่ยวข้องถ้ามีข้อมูล

เจ้าของต้องเห็นว่า "การเปลี่ยนของโรงงานหนึ่งครั้ง" กระทบใครบ้างก่อนตัดสินใจ Reallocate

---

## 16. Scenario Planning — Plan A / B / C

North Star ต้องรองรับการจำลองสถานการณ์ก่อนปัญหาเกิดจริง

ตัวอย่าง:

### Plan A — โรงงานมาตามแผน
- Supply ครบ
- ไม่มี Shortage
- Promise Date ไม่เปลี่ยน

### Plan B — โรงงานผลิตได้ 70%
- Supply ลด
- ระบบคำนวณ Shortage ใหม่
- แสดง Dealer ที่ได้รับผลกระทบ
- ทดลอง Allocation Policy ใหม่ได้ก่อน Commit จริง

### Plan C — โรงงาน Delay 30 วัน
- Promise Date ที่เสี่ยงทั้งหมดถูกแสดง
- แสดง Backorder เพิ่ม
- แสดงว่าควรหยุดรับจอง SKU ใด
- ใช้ประกอบการพิจารณา Supplier สำรองหรือ PO เพิ่ม

Scenario ต้องเป็นพื้นที่ทดลอง ไม่เปลี่ยนข้อมูลจริงจนกว่าเจ้าของจะยืนยัน

---

## 17. Factory / Supplier Reliability

เมื่อมีข้อมูลสะสม ระบบต้องวัด Performance ของ Supplier ได้ เช่น:

- On-Time Rate
- Quantity Fulfillment Rate
- Average Delay Days
- Commitment Revision Frequency
- Defect / Return Rate ถ้ามี
- Lead Time Actual vs Promised

North Star สามารถแสดง Risk-adjusted ETA ได้ เช่น:

```text
Factory Promise ETA   20 Sep
Historical Risk ETA   28 Sep
Confidence            Medium
```

ค่าความเสี่ยงต้องอิงข้อมูลย้อนหลังที่ตรวจสอบได้ ไม่ใช่การเดาแบบไม่มีหลักฐาน

---

## 18. Inventory & Warehouse

เมื่อสินค้าเข้าจริง ระบบต้องรองรับอย่างน้อย:

- On Hand
- Reserved
- Available
- Incoming
- Damaged
- Return
- Multi-Warehouse
- Lot / Batch
- Stock Ledger
- Stock Adjustment

Stock Ledger ต้องเป็นแหล่ง Audit หลักของการเคลื่อนไหวสินค้า

ต้องตามย้อนกลับได้ว่า:

`Supplier → PO → Production Batch → Incoming → Stock Lot → Allocation → Dealer`

---

## 19. Cross-Docking & Fulfillment

ของที่มี Allocation หรือ Backorder อยู่แล้วไม่จำเป็นต้องเข้าชั้นเก็บก่อนเสมอไป

Flow ที่ระบบควรรองรับ:

```text
Incoming Receive
↓
Match Allocation
↓
Cross-dock / Put-away
↓
Pick / Pack
↓
Ship
↓
Tracking / Delivered
```

Fulfillment ต้องรองรับ:

- Full shipment
- Partial shipment
- Bulk dealer shipment
- Dropship
- Picking / Packing List
- Barcode / Scan verification
- Carrier tracking

---

## 20. Dealer Portal / Dealer Link

ปลายทาง Dealer ต้องเข้าถึงข้อมูลของตัวเองได้โดยไม่ต้องถาม Admin ทุกครั้ง

Dealer ควรเห็นได้อย่างน้อย:

- สินค้าที่เปิดรับจอง
- Stock พร้อมส่งตามสิทธิ์ที่ธุรกิจอนุญาตให้เห็น
- Incoming / รอบถัดไป
- Requested Quantity ของตัวเอง
- Allocated Quantity
- Backorder
- Expected Dispatch / Promise Date
- Payment Status
- Shipment / Tracking

ช่องทางอาจเป็น Web Portal, Booking Link หรือ LINE LIFF
โดย North Star ไม่ผูก Product ไว้กับช่องทางเดียว

---

## 21. Finance Supporting Layer

Finance เป็นส่วนสนับสนุน Allocation และ Fulfillment ไม่ใช่แกนหลักของ Product

ระบบปลายทางควรรองรับ:

- Deposit
- Full payment
- Balance due
- Credit limit
- Credit term
- Refund
- Receipt / Invoice / Tax Invoice
- Payment verification

Allocation Policy สามารถใช้สถานะการเงินเป็นเงื่อนไขได้หาก tenant เลือก เช่น Deposit Paid First

---

## 22. Executive Control Tower

หน้าแรกของเจ้าของต้องตอบได้ว่า "ตอนนี้ตรงไหนกำลังมีปัญหา"

ตัวอย่างข้อมูลรวม:

```text
Dealer Demand          12,540 units
On Hand                 3,420
Confirmed Incoming      6,300
Supply Gap              2,820
At-Risk SKUs               14
Delayed Factory Batches     3
Affected Dealers           27
Backorders                842 units
```

Need Attention ควรจัดลำดับตามผลกระทบ เช่น:

- SKU ขาดหนัก
- Factory Delay
- Commitment ถูกลด
- Backorder สูง
- Demand พุ่งผิดปกติ
- Promise Date เสี่ยงหลุด

Dashboard ต้อง drill down จากภาพรวม → SKU → Supplier/Factory → PO/Batch → Dealer ได้

---

## 23. Forecasting & Replenishment Intelligence

เมื่อข้อมูลมีมากพอ ระบบสามารถพยากรณ์ Demand และแนะนำรอบสั่งได้
ข้อมูลที่ใช้ควรรวม:

- Dealer Demand History
- Seasonality
- Current Stock
- Existing Incoming
- Backorder
- Supplier Lead Time
- Supplier Reliability
- MOQ / Price Break
- Safety Stock Policy

ระบบอาจแนะนำว่า:

> X100 ควรออก PO ภายใน 7 วัน จำนวนแนะนำ 450–520 คู่

แต่ recommendation ต้องแสดงข้อมูลที่ใช้คำนวณ และเจ้าของเป็นผู้อนุมัติ

---

## 24. Notification & Automation

ระบบต้องเป็นฝ่ายดึงปัญหาขึ้นมา ไม่ใช่รอให้คนเปิด Dashboard อย่างเดียว

เหตุการณ์ที่ควรแจ้งเตือน เช่น:

- Demand เกิน Supply
- Factory Commitment ลด
- Production / Shipment Delay
- ETA เปลี่ยน
- Dealer Promise เปลี่ยน
- Booking ใกล้ปิด
- Backorder พร้อม Allocate
- ของเข้าและพร้อม Fulfill

ช่องทางอาจเป็น In-app, LINE OA, Email หรือ Webhook

---

## 25. Multi-Tenant SaaS Boundary

North Star นี้เป็น SaaS ไม่ใช่ระบบของบริษัทเดียว

หลักการ:

- 1 tenant = 1 ธุรกิจผู้นำเข้า / distributor
- ทุก tenant มี Products, Suppliers, Dealers, Policies, PO, Stock และ Finance ของตัวเอง
- ข้อมูลต้องแยกขาดด้วย tenant boundary และ RLS ตั้งแต่ schema แรก
- Tenant แต่ละรายตั้งกติกา Allocation / Booking / Credit / Visibility ได้เอง
- ห้าม hardcode วิธีแบ่งของแบบเดียวให้ทุกบริษัท

---

## 26. Configurable Business Policies

Policy สำคัญที่ต้องปรับได้ต่อ tenant เช่น:

- Allocation priority
- Partial allocation / wait next / cancel
- Booking window
- Dealer quota
- Auto-release
- Deposit requirement
- Credit terms
- Incoming visibility
- Safety stock
- Supplier preference
- Manual override permission

Policy ที่ซับซ้อนควรเป็น structured policy ไม่ยัดทุกอย่างไว้ใน JSON ก้อนเดียวโดยไม่มี schema/validation

---

## 27. Roles & Visibility

ระบบปลายทางควรแยกสิทธิ์อย่างน้อย:

- SaaS Super Admin
- Tenant Owner / Admin
- Purchasing
- Warehouse / Fulfillment
- Finance
- Dealer
- Sub-dealer (ถ้าธุรกิจใช้)

Dealer ต้องเห็นเฉพาะข้อมูลที่เกี่ยวกับตัวเองและข้อมูลรวมที่ tenant อนุญาตให้เห็น
เช่น ไม่ควรเห็น Allocation หรือยอดจองของ Dealer รายอื่นโดยค่าเริ่มต้น

---

## 28. Source of Truth

เป้าหมายสุดท้ายคือทุกฝ่ายอ้างอิงข้อมูลชุดเดียวกัน:

- Dealer รู้ว่าจองอะไรและจะได้เมื่อไร
- Importer รู้ว่ามี Demand / Supply / Gap เท่าไร
- Purchasing รู้ว่าต้องสั่งอะไรและโรงงาน Commit อะไรไว้
- Warehouse รู้ว่าของที่เข้ามาต้องไปหาใคร
- Management รู้ว่า SKU / Supplier / Dealer ไหนกำลังมีความเสี่ยง

ข้อมูลสำคัญทุกการเปลี่ยนแปลงต้อง audit ได้
โดยเฉพาะ Commitment, Allocation, Promise Date, Stock และ Payment

---

## 29. Architectural Guardrails

1. **Complete North Star, phased implementation** — ออกแบบปลายทางครบ แต่ทำทีละ Phase
2. **Thin end-to-end before deep modules** — Phase แรกควรครบ loop หลักก่อนเพิ่มความลึก
3. **No product-to-factory hard binding** — Product ↔ Supplier/Factory เป็น many-to-many
4. **Ordered ≠ Confirmed ≠ Received** — ห้ามรวมสถานะ Supply เหล่านี้เป็นตัวเลขเดียว
5. **Requested ≠ Allocated ≠ Fulfilled** — Demand ต้องแยกสถานะชัดเจน
6. **History over overwrite** — Commitment / ETA / Promise ที่เปลี่ยนต้องเก็บ revision
7. **Auditability first** — Manual override ทำได้ แต่ต้องตามย้อนหลังได้
8. **Tenant-configurable rules** — กติกาธุรกิจต้องไม่ hardcode กลาง
9. **Evidence-based intelligence** — Forecast / Risk / Recommendation ต้องอิงข้อมูลที่ตรวจสอบได้
10. **No false completion markers** — เอกสาร North Star ห้ามใช้ `[x]` เพื่อสื่อว่าฟีเจอร์พัฒนาเสร็จแล้ว

---

## 30. Success Definition

North Star ถือว่าบรรลุเมื่อเจ้าของธุรกิจสามารถตอบจากระบบเดียวได้ว่า:

> **ลูกค้าตัวแทนต้องการอะไร → ของมี/กำลังมาเท่าไร → โรงงานไหนรับปากอะไร → ของจะขาดตรงไหน → ใครได้ของรอบไหน → ใครได้รับผลกระทบเมื่อแผนเปลี่ยน → ของถูกส่งจริงเมื่อไร**

และข้อมูลทั้งหมดเชื่อมย้อนกลับได้ตั้งแต่ Dealer Demand ถึง Supplier / Factory และ Shipment จริง

---

## 31. Phase Planning Rule — Locked

Phase Map ถูกกำหนดแล้วใน `03-phase-map.md` โดยใช้หลัก:

- Phase แรกต้องเป็น **thin end-to-end loop** ที่ใช้งานจริงได้
- แต่ละ Phase ต้องมีขอบเขตและ Exit Gate ชัดเจน
- ห้ามทำ feature ลึกในโมดูลเดียวจน loop หลักยังไม่ครบ
- Schema ของ Phase แรกต้องไม่ปิดทาง North Star ที่ล็อกไว้ในเอกสารนี้
- ทุก Phase ต้องระบุสิ่งที่ตั้งใจเลื่อนไป Phase ถัดไปอย่างชัดเจน

**Phase Map:** `03-phase-map.md`  
**Next artifact:** `04-data-model-v2.md`
