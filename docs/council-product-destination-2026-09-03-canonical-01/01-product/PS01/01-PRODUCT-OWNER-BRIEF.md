# PS01 Pawstia — Product Owner Brief

ขั้นตอน: `llm-council-gate` v0.3.2  
สถานะผู้เชี่ยวชาญ: ครบ 3/3  
Gate นี้ตัดสินเฉพาะ Product: Pawstia ควรเป็นอะไร, สำหรับใคร, และ V1 จบตรงไหน

## 1. Verdict

**REMEDIATE**

แปลตรง ๆ: ทิศทางสินค้าใช้ได้และชัด แต่ยังไม่ควรให้ Product Gate ผ่านเต็ม เพราะยังขาดหลักฐานจากร้านจริงและ decision ของ Owner บางข้อก่อนเข้าด่านถัดไป

นี่ไม่ใช่ BLOCK และไม่ใช่คำสั่งหยุดโปรเจกต์ เป็นคำสั่งให้เคลียร์ scope + validation ให้ครบก่อน PASS

## 2. Agreement 3/3

ผู้เชี่ยวชาญทั้ง 3 คนเห็นตรงกันว่า Pawstia V1 ควรเป็น:

**Pet Hotel/Daycare OS สำหรับร้านเดี่ยวในไทย**

ไม่ใช่ PMS กว้าง ๆ, ไม่ใช่ระบบคลินิก, ไม่ใช่ grooming suite, ไม่ใช่ระบบ multi-branch, ไม่ใช่ marketplace และไม่ใช่ paid-production SaaS ที่พร้อมขายจาก CI เขียวอย่างเดียว

Agreement หลัก:

- Product identity: **3/3**
- V1 ควรแคบและยึด daily stay loop: **3/3**
- ยังไม่มี market fit / real-store validation: **3/3**
- ต้องแยก technical closure ออกจาก product-market proof: **3/3**

## 3. Product Identity

Pawstia V1 คือระบบ daily operations ของร้าน pet hotel/daycare ร้านเดี่ยว

คำอธิบายที่ควรใช้:

**ระบบจัดการห้อง การเข้าพัก และ Daily Care Report ผ่าน LINE พร้อมสำเนาข้อมูลใน Google Sheets สำหรับร้าน pet hotel/daycare ร้านเดี่ยว**

คำว่า PMS ใช้เป็นชื่อหรือ category ได้ แต่ห้ามให้มันลาก scope ไปเป็นระบบกว้างเกินจริง

## 4. For Whom

คนจ่ายเงินหลัก: เจ้าของร้าน pet hotel/daycare ร้านเดี่ยว

คนใช้ทุกวัน: เจ้าของร้าน, manager, staff หน้าร้าน/คนดูแลสัตว์

คนได้รับ value ทางอ้อม: เจ้าของสัตว์เลี้ยงที่ได้รับ report ใน LINE

ห้ามสลับ focus ไปเป็น B2C-first เพราะคนที่ต้องใช้ทุกวันและจ่ายเงินคือร้าน

## 5. Strongest Pain

Pain ที่ควรยึดเป็นหัวใจ:

1. ห้องชน / booking ซ้อน โดยเฉพาะช่วงเทศกาล
2. staff ต้องส่งรูปและ update สัตว์เลี้ยงผ่าน LINE แบบกระจัดกระจายทุกวัน
3. เจ้าของร้านกลัว data lock-in ถ้าย้ายจาก Excel/paper ไปใช้ software

ถ้า message ขายไม่แตะ 3 เรื่องนี้ แปลว่าหลุดจาก product core

## 6. Core Daily Value Loop

loop หลักของสินค้า:

ลูกค้านำสัตว์มา check-in -> staff จัดห้องโดยไม่ชน -> staff บันทึก care/status -> ส่ง Daily Care Report พร้อมรูป 1-4 รูป -> เจ้าของสัตว์ได้รับใน LINE -> ร้านมีข้อมูลสำเนาใน Google Sheets

นี่คือ retention loop จริง ไม่ใช่ dashboard และไม่ใช่ subscription screen

## 7. V1 Boundary

V1 ควรจบที่:

- single-store tenant/staff authorization
- customer, pet, room, booking
- check-in, check-out, cleaning, maintenance
- booking integrity / no-overlap
- Daily Care Report + LINE delivery/retry
- LINE identity claim
- Google Sheets replica/export
- onboarding + CSV import
- owner/manager dashboard ที่พอใช้ควบคุมร้าน
- subscription/entitlement/quota foundation ในฐานะ access-control ไม่ใช่หลักฐานว่าพร้อมเก็บเงิน

V1 ไม่รวม:

- clinic/pharmacy
- grooming queue
- payment, SlipOK, billing, e-tax
- Google Drive photo sync
- digital pet passport
- full multi-camera / RTSP-HLS platform
- multi-branch
- marketplace

## 8. Defining Vs Optional

Product-defining:

- room matrix + booking integrity
- pet/room no-overlap
- Daily Care Report เข้า LINE
- Google Sheets data ownership
- LINE claim ที่เชื่อมเจ้าของสัตว์ถูกคน

Optional/support:

- LIFF self-booking
- visitor camera
- dashboard polish
- entitlement/quota UI
- CSV import tooling

ของ optional มีได้ แต่ห้ามเอามาเป็น headline ของ V1 ก่อนพิสูจน์ loop หลักกับร้านจริง

## 9. Dissent / Divergence

ไม่มี dissent ใหญ่เรื่อง identity

จุดที่ต่างกัน:

- Candidate A เน้นว่า Phase 13 ยังไม่มี independent review และ docs บางส่วน drift
- Candidate B ให้น้ำหนักกับ CI run ที่ verified success และ PR #4 ที่ยัง Draft/Open
- Candidate C สรุป Phase 13 เป็น engineered/CI-closed แต่ยังไม่ independently closed

สรุปรวม: Phase 13 เป็น technical evidence ที่แรง แต่ไม่ใช่ market fit, ไม่ใช่ paid launch readiness, และยังไม่ควรใช้แทน Product Gate PASS

เรื่อง Module Hub:

- Candidate A/B ตรวจ overlap แล้วเห็นว่าไม่ควรแทน native Pawstia behavior
- Candidate C ถือว่า Module Hub scan ยัง HOLD

สรุปรวม: Product Gate นี้ไม่ใช้ Module Hub มาตัด scope ของ Pawstia

เรื่อง camera/LIFF:

- ทั้ง 3 มองว่าไม่ใช่ product-defining
- camera ต้องให้ Owner ตัดสินใจว่าจะโชว์, ซ่อน, หรือ postpone ใน beta

## 10. Risks / Blockers

ความเสี่ยงหลัก:

- ยังไม่มีร้านจริงใช้ product loop
- ยังไม่มีหลักฐาน willingness-to-pay
- มีโอกาสเข้าใจผิดว่า CI เขียว = market fit
- Phase 13 ยังขาด independent review verdict ตาม candidate reports
- payment/legal/ops/support/brand/channel ยังไม่พร้อมสำหรับ paid production
- LINE OA / channel ownership ยังไม่ชัด
- Founding Member 990 THB Pro-forever อาจ lock ราคาเร็วเกินไปก่อนรู้ WTP จริง
- secret handling เช่น per-shop LINE token ยังควรถือเป็น beta/ops risk ไม่ใช่ production-hardening complete

## 11. Required Owner Decision Cards

### Decision 1 — ยืนยัน public V1 identity

ต้องตัดสินว่า Pawstia V1 จะพูดว่าเป็น **single-location Pet Hotel/Daycare OS** ไม่ใช่ PMS กว้าง ๆ

Default จาก synthesis: ยืนยันทางนี้

### Decision 2 — ล็อก V1 promise

ต้องล็อกว่า headline คือ room integrity + Daily Report to LINE + Google Sheets ownership

Default จาก synthesis: ล็อก และห้ามเพิ่ม clinic/grooming/payment/multi-branch เข้า V1

### Decision 3 — Visitor camera

ต้องเลือก: โชว์ใน beta, ซ่อน, หรือ postpone

Default จาก synthesis: postpone หรือซ่อนหลัง controlled/internal flag จนกว่าร้านจริงบอกว่ามี value

### Decision 4 — Store #1

ต้องระบุร้าน beta แรกและ success metrics

metrics ขั้นต่ำ: onboarding time, staff learning, booking conflict, report time, LINE delivery, Sheets sync, support burden, owner value, WTP signal

### Decision 5 — Founding Member offer

ต้องตัดสินว่า 990 THB Pro-forever จะ keep, revise, หรือ hold ก่อน WTP validation

Default จาก synthesis: hold public commitment ถ้ายังไม่มี WTP evidence

### Decision 6 — Paid launch separation

ต้องยืนยันว่า paid launch ห้ามเริ่มจนกว่า payment/legal/ops/brand gates ปิดจริง

Default จาก synthesis: ยืนยัน hard separation

### Decision 7 — LINE OA / channel ownership

ต้องตัดสินว่า beta/production ใช้ LINE OA ของร้าน, ของ Pawstia, หรือ hybrid setup

Default จาก synthesis: เลือกให้ชัดก่อนร้านแรก เพราะ LINE report คือ product core

## Final Product Gate Output

**Verdict: REMEDIATE**

**Agreement: 3/3 เห็นตรงกันเรื่อง identity และ V1 boundary; 3/3 ของ evidence ชี้ว่าต้อง remediate ก่อน PASS**
