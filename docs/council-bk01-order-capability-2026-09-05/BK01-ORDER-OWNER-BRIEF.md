# BK01 Order Capability — OWNER BRIEF

Run: `council-bk01-order-capability-2026-09-05`
Procedure: `llm-council-gate` v0.3.2
ภาษา: Thai canonical human brief
Verdict เดียวกับ `CODEX-SYNTHESIS.md`: **APPROVE PHASE 0 แบบ documentation-only**
> **OWNER CORRECTION — 2026-09-05:** Hermes' prior owner-facing decision numbering was inconsistent with the synthesis. Effective Owner decisions are now D1–D12 in `OWNER-OVERRIDE-AND-CORRECTION-2026-09-05.md`. Council provenance remains historical; the Owner override is authoritative where they differ.

## 1. รอบนี้ประชุมเรื่องอะไร

รอบนี้ประชุมว่า BK01 ควรให้ capability ใหม่ชื่อ Order เข้า Phase 0 ได้ไหม

Order ในที่นี้คือระบบรับงานแบบ product / made-to-order / pre-order ที่มี catalog, สถานะ order, lead time, ready date, capacity รายวัน และการ link กลับไป Booking ตอนงานพร้อมนัดลูกค้า

รอบนี้ไม่ใช่การอนุมัติให้สร้างของจริง ยังไม่อนุมัติ code, migration, Supabase apply, deploy, merge, แก้ locked contract หรือเพิ่ม feature ใน prototype

## 2. สุดท้ายเสนอให้ทำอะไร

เสนอให้ **APPROVE PHASE 0** แต่ล็อกว่าเป็นงานเอกสารเท่านั้น

Phase 0 ควรทำสองชั้น:

- Phase 0A: Product Boundary Decision ว่า BK01 จะขยายจาก appointment-only ไปเป็น Business Portal ที่มี Booking + Order ได้แค่ไหน
- Phase 0B: Order V1 Contract + Module Reuse Check / Reuse Gate

ยังไม่ให้เริ่ม implementation จนกว่า Reuse Gate จะ PASS และ BK-A/DB-runtime baseline จะปิดหรือ checkpoint ชัดแล้ว

## 3. ทำไมถึงเลือกแบบนี้

เพราะ expert 3/3 เห็นตรงกันว่า boundary หลักของ proposal ใช้ได้: Booking ยังเป็นเจ้าของเรื่อง appointment ทั้งหมด ส่วน Order เป็น domain แยกสำหรับงานสั่งทำ/เตรียมของ/ready date

ความเสี่ยงที่เจอไม่ได้แปลว่าต้อง reject ตอนนี้ แต่เป็นสิ่งที่ Phase 0 ต้องล็อกให้ชัด เช่น catalog reuse, capacity semantics, deposit policy, entitlement/pricing, และ sequencing

ถ้าให้ build ตอนนี้จะผิด gate เพราะ contract ยังไม่ล็อก, Reuse Gate ยังไม่ PASS, และ BK-A/DB baseline ยังไม่เสร็จ

## 4. ทุก expert เห็นตรงกันเรื่องอะไร พร้อม ratio

- 3/3 เห็นตรงกันให้ **APPROVE PHASE 0** แบบมีเงื่อนไข
- 3/3 เห็นตรงกันว่า Phase 0 เป็น documentation-only
- 3/3 เห็นตรงกันว่า **ยังไม่มี build authorization**
- 3/3 เห็นตรงกันว่า Booking ต้องเป็น authority เดียวของ appointment/staff/time
- 3/3 เห็นตรงกันว่า Order ต้องไม่กลายเป็น scheduler ตัวที่สอง
- 3/3 เห็นตรงกันว่า non-goals ถูกทาง: ไม่มี inventory, warehouse, ERP, POS, shipping, BOM/routing, room/bay/equipment scheduling
- 3/3 เห็นตรงกันว่า Order catalog ต้องใช้ `product-catalog` แบบ **USE + ADAPT**
- 3/3 เห็นตรงกันว่า order lifecycle / production capacity / ready-date engine เป็น **MISSING CAPABILITY**
- 3/3 เห็นตรงกันว่า HC01 ทับกันแค่ระดับ catalog module และแก้ด้วย reuse
- 3/3 เห็นตรงกันว่า CM01 และ TT01 ไม่ overlap กับ Order V1
- 3/3 เห็นตรงกันว่า Phase 0 docs อาจวิ่งคู่ BK-A remediation ได้ แต่ implementation ต้องรอ baseline/reuse gate

## 5. เห็นต่างกันตรงไหน พร้อม ratio และผลกระทบ

- 2/3 flag ว่า made-to-order / pre-order อาจเป็น ICP expansion หรืออย่างน้อยต้องมี market sanity check; 1/3 มองว่าเป็น downstream validation ไม่ใช่ blocker ของ Phase 0
  ผลกระทบ: Owner ต้องตัดสินใจว่า Order จะขยาย ICP หรือจำกัดเฉพาะร้านใน ICP เดิมที่มีงานสั่งทำ

- 1/3 flag ว่าประโยคเรื่อง "reuse CM01-owned lifecycle" ไม่แม่น เพราะ CM01 อาจไม่มี backend/runtime lifecycle ให้ reuse; 2/3 มองว่าไม่มี overlap และ defer ได้
  ผลกระทบ: Phase 0B ควรแก้ wording ให้ชัดว่า future claim integration จะอ้าง owner/capability จริง ไม่ผูก BK01 กับ CM01 แบบเดา

- Candidate confidence คือ 78/100, 78/100, 82/100
  Synthesis confidence: **80/100**

## 6. เรื่องเทคนิคสำคัญที่ Owner ควรเข้าใจ อธิบายเป็นภาษาคน

Booking กับ Order ต้องไม่แย่งหน้าที่กัน

Booking คือระบบนัดหมาย: วัน เวลา staff ตารางว่าง การชนกันของนัด deposit ของ booking และ lifecycle ของ booking

Order คือระบบงานสั่งทำ: ลูกค้าสั่งอะไร สถานะ order อยู่ตรงไหน ต้องใช้เวลากี่วัน วันไหนน่าจะพร้อม และเมื่อพร้อมแล้วค่อยพาไปนัดหมายผ่าน Booking

Catalog ไม่ควรเขียนใหม่เอง เพราะมี module กลางชื่อ `product-catalog` อยู่แล้ว ต้อง copy-and-own มา adapt ใน BK01 ถ้าเขียนใหม่โดยไม่มีเหตุผล reuse gate จะ fail

Production capacity ไม่ใช่ appointment scheduler ถ้า capacity ถูกออกแบบเป็นการจอง slot เวลา/ห้อง/เครื่องมือ มันจะกลายเป็น scheduler ตัวที่สองทันที ต้องล็อกว่า capacity ของ Order คืออะไรและละเอียดแค่ไหน

Prototype เป็นหลักฐาน product/visual exploration ไม่ใช่ production code ห้ามยก prototype เข้า production ตรง ๆ

## 7. อะไรยังไม่รู้ / ยังไม่ตัดสิน

- Order V1 contract ยังไม่มี
- data model ของ Order ยังไม่ล็อก
- capacity unit และ workshop calendar ยังไม่ชัด
- Order-linked Booking deposit policy ยังไม่ชัด
- Order payment status จะสัมพันธ์กับ PromptPay/slip ยังไงยังไม่ล็อก
- Order จะอยู่ใน Basic/Pro หรือเป็น add-on ยังไม่ตัดสิน
- made-to-order/pre-order เป็น ICP ใหม่หรือแค่ use case ใน ICP เดิมยังไม่ตัดสิน
- Order-to-Booking link เป็น many-to-many แบบไหนยังไม่ล็อก
- Reuse Gate ยังไม่ PASS
- MT01 bootstrap check ยังไม่ recorded PASS สำหรับ Order
- BK-A/DB-runtime baseline ยังไม่ปิดหรือ checkpoint ชัดใน evidence ชุดนี้

## 8. ความเสี่ยงและกรณีพังสำคัญ

- ถ้า build catalog ใหม่เอง จะเป็น duplicate ของ `product-catalog` และ Reuse Gate fail
- ถ้า Order capacity กลายเป็น slot/time/resource scheduler จะชนกับ Booking authority
- ถ้าแก้ locked contract แบบเงียบ ๆ จะทำให้ governance พัง เพราะ BK01 เดิมล็อกเป็น appointment operations
- ถ้า stack Order migration ก่อน BK-A/DB baseline ชัด เวลา migration พังจะหาต้นเหตุยาก
- ถ้า capability toggle ปิดแล้วซ่อนหรือลบ history จะละเมิดหลัก business history preservation
- ถ้า deposit/payment ไม่ล็อก จะปนกันระหว่าง Order payment status, Booking deposit, และ billing/subscription
- ถ้าเอา prototype ไป production จะข้าม contract, reuse gate, security, และ runtime evidence

## 9. Gate status พร้อมคำแปลว่าหมายถึงอะไร

**Gate status: APPROVE PHASE 0 — documentation-only, implementation blocked**

แปลว่า: ให้ไปต่อเฉพาะงานตัดสิน boundary และเขียน contract/reuse artifact ได้

ไม่ได้แปลว่า: สร้าง production code ได้, เขียน migration ได้, apply Supabase ได้, deploy ได้, merge ได้, เปลี่ยน locked contract ได้, หรือเพิ่ม feature ใน prototype ได้

Implementation ยัง block จนกว่า:

- Reuse Gate PASS
- Order V1 Contract locked
- Owner decisions รอบนี้ถูกบันทึก
- BK-A/DB-runtime baseline ปิดหรือ checkpoint ชัด

## 10. ต่อจากนี้จะเกิดอะไร

ถ้า Owner รับ verdict นี้ งานถัดไปคือเปิด Phase 0A/0B แบบเอกสาร:

- เขียน Product Boundary Decision
- เขียน Order V1 Contract
- ทำ Module Reuse Check artifact
- ล็อก catalog reuse เป็น `USE + ADAPT`
- ล็อก lifecycle/capacity/link/payment/deposit/entitlement rules
- ล็อก sequencing ว่า no implementation จนกว่า baseline พร้อม

BK-A remediation ยังเป็น heavy track หลักของ BK01 อยู่ Order documentation ห้ามดึงทีมไปเริ่ม implementation ก่อนเวลา

## 11. Effective Owner Decisions — CORRECTED D1–D12

This section supersedes the prior misnumbered owner-facing decision list. Canonical effective decisions are recorded in `OWNER-OVERRIDE-AND-CORRECTION-2026-09-05.md`.

- **D1 Phase 0:** APPROVED, documentation/governance only. Build authorization remains NO.
- **D2 Product boundary:** APPROVED modular Business Portal foundation; Booking remains appointment authority and Order is independent.
- **D3 ICP/market:** APPROVED bounded expansion to SMB made-to-order/pre-order/production-to-ready/service+product/Order-only workflows; no generic commerce/POS/ERP/marketplace expansion.
- **D4 Document treatment:** dated addenda/decisions only; preserve historical locked records and provenance.
- **D5 Reuse:** catalog `USE + ADAPT` from canonical modules-hub product-catalog; Order lifecycle/capacity/ready-date/link are `MISSING CAPABILITY`; MT01 bootstrap applies.
- **D6 Sequencing:** Phase 0A/0B may run with BK-A, but Order implementation remains blocked by Codex release-plan prerequisites and formal reuse/runtime gates.
- **D7 Capability activation:** approve `booking_enabled/order_enabled/claim_enabled` concept; preserve existing shop tenancy and business history when disabled.
- **D8 Booking deposit:** Booking policy remains authoritative; no automatic waive/merge/settlement from Order payment.
- **D9 Order payment:** local operational payment status only, not a payment engine or billing-core replacement.
- **D10 Order↔Booking link:** Phase 0B locks many-to-many-capable link, READY-only creation, lifecycle/cancel/rebook/unlink/audit rules; no auto-complete propagation.
- **D11 Prototype:** frozen exploration evidence only; no direct production promotion.
- **D12 Claim/CM01 wording:** use neutral future Claim/Case owner boundary; do not assert CM01 runtime lifecycle ownership without proof.

## 12. Execution implication after Owner correction

Parent Codex execution authority remains `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md`. That plan already selects BK01 as the first P2 heavy track after P0a/P0b readiness. Current parent status records P0a-C1 PASS and BK01 as the next eligible heavy track.

Therefore:

1. **BK01 Booking core may resume now** as the heavy track; it does not wait for DC01, PS01, LK01, MT01, WS01 or another product to finish.
2. **BK01 Order Phase 0A/0B is now COMPLETE/LOCKED as the bounded documentation track; Reuse Gate PASS and MT01 Bootstrap PASS. The bounded slot is returned.**
3. **Order implementation does not start now.** Codex risk R1 requires BK-A/B closure before feature expansion; Reuse Gate, MT01 bootstrap record and a clear DB/runtime baseline must also exist.
4. Existing Booking V1 should reach its release/pilot decision before Order implementation is allowed to delay or destabilize that release path, unless Owner later records an explicit overlap/risk override.

**BUILD AUTHORIZATION: NO for Order implementation.**
## 13. Phase 0 completion

Phase 0A/0B has completed after the Owner correction. Canonical product artifacts live in products/booking/docs/order/. This completion does not change the Order build boundary: **BUILD AUTHORIZATION: NO**.

Booking documentation checkpoint: 82b297d (docs(booking): lock Order phase0 contract and reuse gate).
