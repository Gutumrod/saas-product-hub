# 01-PRODUCT-OWNER-BRIEF - WS01 WSTERA Supply Management

Gate: Product Gate  
Procedure: `llm-council-gate` v0.3.2  
Experts completed: 3/3, no degraded run  
Verdict: PASS

## 1. สรุปปัญหาที่ Council เข้าใจ

WSM คือ SaaS แบบ multi-tenant สำหรับธุรกิจ importer/distributor ที่ต้องรับ demand จาก dealer หลายราย แล้วจัดสรร supply ที่มีจำกัดอย่างตรวจสอบย้อนกลับได้

ปัญหาหลักคือ วันนี้คนทำงานมักเอา "dealer ขอ" ไปปนกับ "ของยืนยันแล้ว" และเอา "จัดสรรแล้ว" ไปปนกับ "ส่งมอบแล้ว" ทำให้ shortage รู้ช้า allocation ใช้ spreadsheet/chat/memory และไม่มี single source of truth

V1 ต้องจบที่ loop บางแต่ครบ: dealer booking -> confirmed demand -> manual reliable supply -> gap -> manual/partial allocation -> backorder -> dealer เห็นผลเฉพาะของตัวเอง

## 2. ข้อเท็จจริงที่ยืนยันแล้ว

- Product identity คือ multi-tenant B2B supply-planning + dealer-allocation SaaS สำหรับ importer/distributor. Support: 3/3.
- North Star คือ Demand -> Supply -> Gap -> Allocation -> Fulfillment. Support: 3/3.
- Buyer/tenant คือเจ้าของหรือ operator ฝั่ง importer/distributor; dealer เป็นคนส่ง demand ผ่าน mobile booking link. Support: 3/3.
- Pain หลักคือ requested ถูกเข้าใจเป็น confirmed supply และ allocated ถูกเข้าใจเป็น fulfilled. Support: 3/3.
- V1 คือ Phase 1 thin end-to-end loop ไม่ใช่ deep module. Support: 3/3.
- V1 ไม่รวม PO, factory commitment, production batch, allocation policy/auto-allocation, warehouse/inventory, finance/payment, AI/intelligence, multi-site suppliers, auto backorder carry. Support: 3/3.
- Multi-tenancy เป็น product-required ไม่ใช่แค่ architecture preference; tenant = importer business. Support: 3/3.
- Gap ต้องไม่ double-subtract backorder. Support: 3/3.
- สถานะตอนนี้เป็น docs-only: Documentation Lock authorized แต่ยังไม่มี migration/scaffold/deploy/db apply/build approval. Support: 3/3.
- Candidate confidence: A=78, B=88, C=72.

## 3. Consensus / Majority / Dissent

Consensus 3/3:
- WSM เป็น supply-planning/dealer-allocation SaaS
- ICP คือ importer/distributor
- dealer เป็น demand actor ไม่ใช่ buyer
- V1 จบที่ thin loop
- multi-tenancy เป็นแกน product
- Documentation Lock ไม่ใช่ approval ให้ build

Majority 2/3:
- ต้องล็อก demand confirmation actor/timing
- ต้องล็อก round completion/backorder timing
- ต้องล็อก dealer-code security detail
- ต้องมี measurable success threshold ก่อนเอาไปใช้เป็น build acceptance

Dissent แบบ emphasis 1/3:
- Candidate B เน้นว่า endgame คือ Supply Gap Engine + Allocation decision record
- Candidate C เน้นว่าขาด pilot/design partner evidence
- Candidate A เน้น Module Hub vendoring caution ชัดกว่าอีกสองราย

ไม่มี candidate ไหนเสนอให้ขยาย V1 เกิน thin loop

## 4. หลักฐานที่ยังขาด / คำถามที่ยังไม่จบ

- runtime/database placement ยังไม่ตัดสิน
- central billing/entitlement contract ยังไม่ตัดสิน
- pricing/trial/limits/grace ยังไม่ตัดสิน และอยู่นอก Product Gate
- demand confirmation ใครกด/เกิดตอนไหน ยังไม่ชัด
- round completion trigger และ backorder creation timing ยังไม่ชัด
- dealer code format/rotation/leak handling ยังไม่ชัด
- KPI มีหมวดแล้ว แต่ยังไม่มี target number สำหรับบอกว่า V1 prove value แล้ว
- retention period และ public support/SLA wording ยังเป็น launch blocker
- ยังไม่มี market/pilot/customer validation ใน evidence ชุดนี้

## 5. คำแนะนำของ Synthesizer

ให้ PASS Product Gate เพื่อ lock นิยาม product และ Product Pack เท่านั้น:

WSM คือ multi-tenant B2B supply-planning/dealer-allocation SaaS สำหรับ importer/distributor tenant โดย V1 ต้องพิสูจน์ loop Demand -> Supply -> Gap -> Allocation -> Backorder -> Dealer Result แบบ manual, traceable, tenant-safe

หลังจากนี้ต้องทำ Phase 1 build brief แยกต่างหาก และ brief นั้นต้อง resolve blocker ที่เกี่ยวกับ build ก่อนเริ่ม migration/code

## 6. ทำไมถึงแนะนำแบบนี้

เพราะ 3/3 candidates เห็นตรงกันในแกน product, user, pain, V1 boundary และ non-goals

ถ้าเริ่มจาก PO, inventory, finance, AI หรือ auto-allocation มันจะใหญ่เกินและยังไม่ prove pain หลัก กูมองว่า V1 ที่ถูกต้องคือ thin loop ที่ทำให้เจ้าของเห็นความจริงก่อนว่า dealer ขออะไร supply ที่เชื่อได้มีเท่าไหร่ ขาดตรงไหน ใครได้ของ และใครรอ

manual supply/manual allocation ไม่ใช่ข้อเสียใน V1 ถ้ามันถูกทำเป็น adapter ที่มี provenance/audit และไม่ทำให้ historical demand ต้องตีความใหม่ในอนาคต

## 7. ทางเลือกที่ไม่เลือก + เหตุผล

- ERP-lite: ไม่เลือก เพราะลาก inventory/finance/PO/warehouse เข้ามาก่อน prove loop
- PO/factory commitment first: ไม่เลือก เพราะเป็น Phase 2
- allocation engine first: ไม่เลือก เพราะ policy/auto-allocation เป็น Phase 3
- dealer portal first: ไม่เลือก เพราะ V1 dealer scope ควรมีแค่ booking + self-result
- single-tenant internal tool: ไม่เลือก เพราะ multi-tenancy เป็น product requirement
- assume Module Hub/shared infra เข้า V1: ไม่เลือก เพราะ manifest ระบุ Module Hub scan เป็น HOLD

## 8. Gate Verdict + Blockers

Verdict: PASS

ความหมายของ PASS นี้: ผ่าน Product Gate สำหรับล็อกนิยาม product/docs เท่านั้น ไม่ใช่ build approval, launch approval, pricing decision, architecture placement decision หรือ migration approval

Blockers ก่อนอนุมัติ Phase 1 build brief:
- runtime/database placement ต้องล็อก หรือระบุชัดว่าเป็น development-only ไม่มี live assumption
- billing/entitlement contract ต้องล็อกอย่างน้อยในระดับ read/enforcement/fail-safe
- demand confirmation actor/timing ต้องล็อก
- round completion trigger และ backorder creation/carry behavior ต้องล็อก
- dealer-code security format/rotation/recovery ต้องล็อก
- measurable V1 success thresholds ต้องล็อก

Launch blockers:
- pricing/plans/trial/limits/grace
- retention period
- public support/SLA wording
- implementation + release evidence สำหรับ Required PRD rows และ G0-G9

## 9. Confidence

82 / 100

มั่นใจสูงเรื่อง product identity, buyer, V1 boundary, non-goals, invariants และ docs-only status เพราะ 3/3 เห็นตรงกัน แต่ยังไม่ให้สูงกว่านี้เพราะยังไม่มี implementation evidence, pilot evidence, market validation, และยังมี owner decisions ที่ต้องล็อกก่อน build/launch

## 10. Technical Document Pack

ไฟล์ที่สร้างใน Product Pack:

- `PRODUCT-SOURCE-OF-TRUTH.md`
- `PRODUCT-SCOPE.md`
- `USER-FLOWS.md`
- `BUSINESS-RULES.md`
- `V1-ACCEPTANCE-CRITERIA.md`
- `OPEN-DECISIONS.md`

## 11. REQUIRED Owner Decision Cards

### OD-001 - Runtime/Database Placement

Decision: Phase 1 จะใช้ runtime/database placement แบบไหน และ production จะอยู่ที่ไหน

Options:
- A. Product Gate neutral; Phase 1 build brief ต้องล็อก placement หรือจำกัดเป็น dev-only ชัดเจน (recommended)
- B. เลือก shared portfolio placement ตอนนี้
- C. เลือก dedicated WSM placement ตอนนี้

Council support level: 3/3 ระบุว่า unresolved

### OD-002 - Billing/Entitlement Contract

Decision: WSM จะอ่าน entitlement จาก boundary ไหน sync อย่างไร และ fail-safe อย่างไร

Options:
- A. กำหนด read-only entitlement snapshot contract + server-side fail-safe ก่อน build (recommended)
- B. defer entitlement ทั้งหมดออกจาก V1
- C. ผูกตรงกับ billing system แบบ live integration ตั้งแต่แรก

Council support level: 3/3 ระบุ uncertainty; 2/3 เน้น contract detail

### OD-003 - Demand Confirmation Actor/Timing

Decision: demand จาก dealer จะกลายเป็น confirmed demand โดยใคร และเมื่อไร

Options:
- A. admin explicitly confirms demand ก่อนเข้า Gap (recommended)
- B. auto-confirm เมื่อ dealer submit
- C. auto-confirm ตอน round close

Council support level: 2/3 ระบุว่า unresolved

### OD-004 - Round Completion / Backorder Creation

Decision: round completed เมื่อไร และ backorder ถูกสร้าง/คำนวณเมื่อไร

Options:
- A. admin explicitly completes round แล้วระบบคำนวณ backorder หนึ่งครั้ง (recommended)
- B. complete อัตโนมัติเมื่อถึง close time
- C. complete อัตโนมัติหลัง allocation ทุก line จบ

Council support level: 2/3 ระบุว่า unresolved

### OD-005 - Dealer-Code Security

Decision: dealer code ควรมี format, uniqueness, rotation, leak handling และ recovery อย่างไร

Options:
- A. ใช้ non-guessable tenant-scoped code พร้อม rotation/reissue และ negative tests (recommended)
- B. ใช้ short human-readable code แบบง่าย
- C. เปลี่ยน V1 เป็น dealer login เต็ม

Council support level: 3/3 เห็นว่า dealer-code เป็น trust boundary; 2/3 ขอรายละเอียดเพิ่ม

### OD-006 - V1 Success Thresholds

Decision: ตัวเลขอะไรบอกว่า V1 prove value แล้ว

Options:
- A. กำหนด target สำหรับ demand capture, time to first completed loop, allocation coverage, backorder visibility, active dealer submission (recommended)
- B. ใช้แค่ pass/fail E2E scenario
- C. defer KPI targets หลัง build

Council support level: 3/3 เห็นว่ามี KPI categories; 2/3 ระบุว่ายังขาด target values

### OD-007 - Commercial Values

Decision: pricing, plan, trial, limits, grace, overage/fair-use

Options:
- A. defer ไป Business-Market gate และห้าม engineering invent values (recommended)
- B. ใส่ placeholder ใน build brief
- C. owner ตัดสิน commercial values ตอนนี้

Council support level: 3/3 ระบุว่า unresolved และ out of Product Gate

### OD-008 - Retention / Support / SLA

Decision: retention period และ public support/SLA wording

Options:
- A. defer ไป legal/ops/launch gate และถือเป็น launch blocker (recommended)
- B. ใช้ default internal wording ชั่วคราว
- C. owner ตัดสินตอนนี้

Council support level: 2/3 ระบุชัด; ไม่มี candidate คัดค้าน
