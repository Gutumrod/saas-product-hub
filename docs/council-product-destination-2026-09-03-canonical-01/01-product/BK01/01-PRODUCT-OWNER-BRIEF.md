# BK01 Booking by WSTERA — Product Gate OWNER-BRIEF

ภาษา: ไทย  
Gate: Product เท่านั้น  
Verdict: **REMEDIATE**

## 1. สรุปปัญหาที่ Council เข้าใจ

BK01 ต้องตอบให้ชัดว่า Booking by WSTERA คืออะไร ขายให้ใครก่อน และ V1 จบตรงไหน

คำตอบจากผู้เชี่ยวชาญ 3/3 ตรงกัน: BK01 คือ SaaS งานปฏิบัติการนัดหมายสำหรับร้านไทยแบบสาขาเดียว เช่น ร้านผม บาร์เบอร์ บิวตี้ และเล็บ ขนาดประมาณ 1-10 คนให้บริการ จุดขายไม่ใช่แค่มีหน้าจอง แต่คือการคุมคิว พนักงาน เงินมัดจำ PromptPay สลิป LINE และสถานะงานให้ไม่หลุด

## 2. ข้อเท็จจริงที่ยืนยันแล้ว

- Identity: Thailand-first single-location appointment-operations SaaS. Council support: 3/3
- ICP แรก: ร้านผม/บาร์เบอร์/บิวตี้/เล็บ ไทย ใช้ LINE เป็นหลัก มี 1-10 providers. Council support: 3/3
- ไม่ใช่ booking widget ธรรมดา แต่เป็น operations product. Council support: 3/3
- Core loop: ตั้งค่าร้าน → เปิดลิงก์จอง → ลูกค้าจองแบบกันชนคิว → มัดจำ/อัปสลิป → ตรวจสลิป → confirm → LINE แจ้งเตือน → complete/no-show → export/history. Council support: 3/3
- V1 ต้องมี cancel/reschedule, reminder, staff self-scope, PromptPay QR แบบควบคุมเอง, private slip, merchant-owned LINE, CSV/export/closure, ticket support native. Council support: 3/3
- V1 ไม่รวม clinic, multi-branch, marketplace, POS/ERP, CRM suite, annual billing, customer app, public slip URL, runtime `promptpay.io`. Council support: 3/3
- DB-backed gates ยังเป็น `BLOCKED_ENVIRONMENT`; G2 และ DB portions ของ G3-G9 ยังไม่มีหลักฐานผ่านจริง. Council support: 3/3
- ปัจจุบัน implementation ยังไม่ใช่ sellable V1. Council support: 3/3
- CM01 เป็นคนละ product/repo กับ BK01 ห้ามรวมกันเพราะชื่อคล้าย. Council support: 3/3
- Module Hub scan ยัง HOLD และไม่มี decision ของ Product Gate นี้ที่ขึ้นกับ Module Hub. Council support: 3/3

## 3. Consensus / Majority / Dissent

Consensus 3/3:

- Product identity, ICP, V1 boundary, core flows, domain rules และ CM01 separation ชัดพอให้ล็อกทิศทาง product ได้
- แต่ยังห้ามบอกว่า V1 พร้อมขาย เพราะ DB/runtime/provider/pilot evidence ยังไม่ครบ
- Auto-slip Pro, final prices และ LINE cost model ยังต้องให้ Owner ตัดสิน

Majority 2/3:

- มี release-hygiene risk จาก stale build/source-map legacy strings ถึง source ปัจจุบันจะผ่าน static absence

Dissent / emphasis 1/3:

- มี tension ระหว่าง `CURRENT_STATUS.md` ที่ยังบอก BK-A open กับ independent review ที่ PASS ต้องให้ CONT-04/CONT-03 closeout เคลียร์ให้ชัด

## 4. หลักฐานที่ยังขาด / คำถามที่ยังไม่จบ

- ยังไม่มี approved PostgreSQL/Supabase runtime เพื่อรัน DB-backed gates
- ยังไม่มี runtime evidence ของ migration replay, RLS, tenant isolation, concurrent overlap, atomic reschedule, Stripe ordering, LINE delivery, reminder scheduler, CSV, audit persistence
- ยังไม่มี provider evidence จริงของ LINE/Stripe/PromptPay/auto-slip
- ยังไม่มี pilot evidence: WTP, concurrency จริง, notification reliability, deposit reliability, retention, no-show effect
- ราคาสุดท้ายยัง provisional ตาม PD-003
- Auto-slip Pro ยังไม่มี provider/allowance/cost/policy
- Merchant-owned LINE ยังไม่ล็อกว่า WSTERA จะรวม allowance หรือให้ร้านแบก cost เองอย่างไร
- Cancel/reschedule windows nullable fail-closed ยังเสี่ยง ถ้าร้านไม่ตั้งค่า ลูกค้าอาจเปลี่ยน/ยกเลิกไม่ได้
- Blacklist ยังเป็น V1 optional ต้องตัดสินว่าจะ ship, hide, หรือ defer

## 5. คำแนะนำของ Synthesizer

ให้ verdict เป็น **REMEDIATE**

เหตุผลคือ product direction ตัดสินได้แล้ว แต่ evidence และ owner decisions ยังไม่พอสำหรับ clean PASS แบบปล่อยขาย V1 ได้ กูไม่แนะนำ BLOCK เพราะไม่มี blocker ด้าน identity/scope แล้ว แต่ก็ห้าม PASS เพราะจะทำให้ downstream เข้าใจผิดว่าสินค้าพร้อมขาย

## 6. ทำไมถึงแนะนำแบบนี้

Product Gate นี้ควรล็อกว่า BK01 คือ service-operations SaaS สำหรับร้านไทยสาขาเดียว ไม่ใช่ marketplace ไม่ใช่ CM01 และ V1 จบที่ required booking/deposit/LINE/staff/change/export/support loop

สิ่งที่ต้อง remediate คือหลักฐานและ decision ไม่ใช่กลับไปคิด product ใหม่

## 7. ทางเลือกที่ไม่เลือก

- PASS: ไม่เลือก เพราะ DB-backed gates ยัง blocked, auto-slip ยังไม่ล็อก provider, ราคายังไม่ final, LINE cost model ยังไม่จบ, pilot evidence ยังไม่มี
- BLOCK: ไม่เลือก เพราะ Council 3/3 เห็นตรงกันว่า identity, ICP, V1 scope และ non-goals ชัดแล้ว
- รวม CM01 เข้า BK01: ไม่เลือก เพราะผิด boundary 3/3
- ตัดสิน Module Hub ตอนนี้: ไม่เลือก เพราะ Module Hub scan ยัง HOLD
- ตัดสิน pricing/revenue/competition: ไม่เลือก เพราะเป็น Business/Market gate ไม่ใช่ Product Gate

## 8. Gate Verdict + Blockers

Verdict: **REMEDIATE**

Blockers ก่อน sellable V1:

- ปิด G2 และ DB-backed G3-G9 ใน approved PostgreSQL/Supabase runtime
- เคลียร์ CONT-04/CONT-03 closeout ให้ชัดว่า open items ใน status แก้แล้วหรือยัง
- เลือก auto-slip provider และล็อก allowance/cost/top-up/failure policy
- อนุมัติ final Basic/Pro prices
- ล็อก LINE allowance/cost model สำหรับ merchant-owned LINE
- ตัดสิน cancel/reschedule default หรือบังคับตั้งค่า
- ตัดสิน blacklist V1 disposition
- เก็บ pilot evidence ก่อน claim เรื่อง WTP, no-show, reliability
- ตรวจ release artifact hygiene รวม stale `.next`/source-map legacy strings

## 9. Confidence

Confidence: **82/100**

มั่นใจสูงเรื่อง identity/scope เพราะผู้เชี่ยวชาญ 3/3 เห็นตรงกันและอิง locked docs เดียวกัน แต่ไม่ให้สูงกว่านี้เพราะ DB/runtime/provider/pilot evidence และ owner decisions ยังไม่ครบ

## 10. Technical Document Pack

เอกสารที่สร้างใน Product Pack:

- `PRODUCT-SYNTHESIS.md`
- `PRODUCT-SOURCE-OF-TRUTH.md`
- `PRODUCT-SCOPE.md`
- `USER-FLOWS.md`
- `BUSINESS-RULES.md`
- `V1-ACCEPTANCE-CRITERIA.md`
- `OPEN-DECISIONS.md`
- `01-PRODUCT-OWNER-BRIEF.md`

## 11. REQUIRED Owner Decision Cards

### OD-001 Auto-Slip Provider / Allowance / Cost / Policy

Decision: เลือก provider และกำหนด allowance, unit cost, top-up, failure/escalation policy

Options:

- A: เลือก provider ตอนนี้และ require provider-backed evidence ก่อนขาย Pro
- B: ให้ Pro เป็น private/beta จน provider และ economics ผ่าน
- C: เอา auto-slip ออกจาก V1 หรือ defer

Council support: 3/3 เห็นว่าเรื่องนี้ยัง unresolved และ block Pro sale

### OD-002 Final Basic / Pro Prices

Decision: อนุมัติราคาขายจริง

Options:

- A: ใช้ราคาปัจจุบันเป็น pilot reference เท่านั้น แล้วตัดสินหลัง WTP/cost model
- B: Lock ราคาตอนนี้โดย Owner approval
- C: รอ BK-C commercial lock ก่อนโชว์ public price

Council support: 3/3 เห็นว่าราคายัง provisional และ Product Gate ห้ามตัดสินราคาแทน

### OD-003 WSTERA-Managed LINE Allowance

Decision: WSTERA รวม LINE allowance ไหม หรือร้านแบก OA/message cost เอง

Options:

- A: ร้านแบก cost เอง WSTERA แค่ integrate/setup
- B: WSTERA รวม allowance พร้อม cap/overage
- C: ทำ managed LINE เป็น add-on หลัง V1

Council support: 3/3 เห็นว่า merchant-owned LINE จำเป็น แต่ cost/allowance ยังไม่จบ

### OD-004 Cancel / Reschedule Window Defaults

Decision: ถ้าร้านไม่ตั้งค่า window จะทำอย่างไร

Options:

- A: บังคับตั้งค่าก่อน publish
- B: ตั้ง default กลางแบบ conservative
- C: คง nullable fail-closed แต่ UX ต้องบอกชัด

Council support: 3/3 flag เป็น risk; 1/3 ย้ำว่าถ้าไม่แก้ self-service promise จะกลวง

### OD-005 DB Runtime Approval

Decision: อนุมัติ runtime สำหรับ DB gates

Options:

- A: local PostgreSQL/Supabase test runtime
- B: remote Supabase test project แบบ scope ปลอดภัย
- C: block DB gates ต่อจน infrastructure พร้อม

Council support: 3/3 เห็นว่า DB-backed gates ยัง `BLOCKED_ENVIRONMENT`

### OD-006 Blacklist V1 Disposition

Decision: blacklist จะอยู่ V1 แบบไหน

Options:

- A: ship เป็น V1 optional พร้อม entitlement ชัด
- B: hide/internal จนจบ pilot
- C: defer post-V1 และเอา copy ออกจาก V1-facing surface

Council support: 3/3 เห็นว่า blacklist optional ไม่ใช่ product-defining; 1/3 ระบุว่าต้องตัดสิน disposition
