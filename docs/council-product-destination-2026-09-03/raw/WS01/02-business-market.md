# WS01 WSM — Business/Market Lens Analysis (Round 1)

**Lens:** Business/Market — revenue model, competition, differentiation, distribution, commercial viability
**Date:** 2026-09-03
**Evidence base:** อ่านจาก repo จริง `D:\AI-Workspace\projects\saas-product-hub\products\WSM` (branch main, HEAD e1eff9b) — ไฟล์ SSOT 00–10, PRODUCT_DECISIONS, CURRENT_STATUS, audit 2 ฉบับ, UX/KPI/External Dependencies, design source 2 ฉบับ, daily logs 2026-08-30 ถึง 2026-09-03
**Label convention:** VERIFIED = มีหลักฐานใน repo / INFERENCE = สรุปจากหลักฐานอย่างมีเหตุผล / UNVERIFIED = ไม่มีหลักฐาน / RECOMMENDATION = ข้อเสนอของ lens นี้ / UNKNOWN = ไม่มีข้อมูล

---

## 0. สรุป verdict (Executive Summary)

WSM มี **ปัญหาและ domain ที่เขียนไว้ดีมาก** (VERIFIED) — ปัญหาการจัดสรรของขาดระหว่าง importer/distributor กับ dealer บน Excel + LINE + ความจำ เป็นปัญหาจริงและเกิดซ้ำทุก booking round ทุก shortage ทุก factory delay (VERIFIED จาก 00, design source) แต่ **หลักฐานเชิงพาณิชย์แทบเป็นศูนย์** (VERIFIED ว่าไม่มี): ไม่มีราคา ไม่มี competitor analysis ไม่มี market sizing ไม่มี customer discovery ไม่มีหลักฐาน tenant ที่สอง ไม่มี willingness-to-pay test (VERIFIED จาก 04, 08, PRODUCT_DECISIONS, CURRENT_STATUS — ทุกอย่างระบุ TBD/pending อย่างตรงไปตรงมา)

**Verdict ของ lens นี้:** ยังไม่ควรเป็น commercial SaaS เต็มรูปแบบในตอนนี้ ควรเดินแบบ **anchor-tenant pilot (ธุรกิจของ owner เอง) → evidence-gated SaaS conversion** — สร้าง tenancy ที่ถูกต้องตั้งแต่ต้น (ถูกและจำเป็น) แต่เลื่อน billing/entitlement/plan-state infrastructure ออกไปจนกว่าจะมีหลักฐาน tenant ที่สองที่จ่ายเงินจริง (RECOMMENDATION)

---

## 1. Product ทำเงินอย่างไร และทำไม buyer ต้องจ่าย / จ่ายต่อ

### 1.1 Revenue model

- **VERIFIED:** หมวดหมู่ที่ประกาศใน 00 = "Multi-tenant B2B supply planning and dealer allocation SaaS" — ตั้งใจเป็น SaaS subscription
- **VERIFIED:** 04 กำหนด entitlement dimensions (active dealers, active variants/SKUs, user seats, booking rounds, advanced allocation policies, multi-warehouse, automation/notification channels, API/webhooks, intelligence/scenario planning, audit export/enterprise controls) และ plan states (trial, active paid, past_due/grace, suspended, cancelled) — โครงสร้าง pricing แบบ tiered subscription
- **VERIFIED:** 04 ระบุชัดว่า "Exact provider, price, trial length and grace duration are not invented here; they require portfolio/business approval" — **ยังไม่มีราคา ไม่มี provider ไม่มี trial policy**
- **VERIFIED:** PRODUCT_DECISIONS (pending) + CURRENT_STATUS ระบุ commercial plan/pricing/trial/limits/grace เป็น blocker ที่ค้างอยู่
- **INFERENCE:** รูปแบบรายได้ที่ตั้งใจ = ค่า subscription รายเดือน/รายปีต่อ tenant แบบ tiered ตาม entitlement dimensions ข้างต้น
- **UNVERIFIED:** ไม่มีหลักฐาน tenant ที่จ่ายเงินจริง ไม่มีหลักฐานการทดสอบ willingness-to-pay ไม่มีหลักฐานว่าโครงสร้าง tier นี้ตรงกับที่ตลาดยอมรับ

### 1.2 ทำไม buyer ต้องซื้อ / จ่ายต่อ

- **VERIFIED (เหตุผลเชิงโครงสร้าง):** 00 + design source ระบุ core value = เจ้าของตอบได้ว่าใครต้องการอะไร, supply ไหนเชื่อถือได้จริง, ขาดตรงไหน, ใครได้ของ scarce, ใครโดนกระทบเมื่อ supply เปลี่ยน, และส่งอะไรไปจริง — เป็น "one traceable source of truth"
- **INFERENCE (เหตุผลจ่ายต่อ):** 3 กลไก retention ที่ออกแบบไว้ใน docs:
  1. **Operational dependency** — dealer booking link กลายเป็นโครงสร้างพื้นฐานการรับออเดอร์ (dealer ใช้ลิงก์จองทุก round) ถอดยากเมื่อ dealer คุ้นชินแล้ว
  2. **Data moat / switching cost** — revision history, audit trail, supply confidence, และใน Phase 2+ supplier reliability / promise accuracy สะสมเป็นข้อมูลที่ spreadsheet เริ่มใหม่ไม่ได้ (05, design source §9, §17)
  3. **Recurring event-driven pain** — ทุก shortage ทุก factory delay ต้องใช้ระบบจัดสรร (00) — ความเจ็บปวดเกิดซ้ำตามรอบธุรกิจ
- **INFERENCE (จุดอ่อน retention ใน Phase 1):** Phase 1 ยังเป็น thin loop — admin ยังต้องกรอก supply ด้วยมือและจัดสรรด้วยมือ (01, 05 §Phase 1 simplification) — คุณค่าหลักใน Phase 1 คือ "source of truth + dealer self-service + gap visibility" ซึ่งยังไม่ใช่ automation ที่ลึกพอจะผูก tenant ไว้แน่น ระยะนี้ switching cost ยังต่ำ (history ยังบาง) → **ความเสี่ยง churn หลัง trial สูงถ้าเปิดขายตอน Phase 1**
- **UNVERIFIED:** ไม่มีหลักฐานว่า dealer/owner เห็นคุณค่า Phase 1 มากพอจะจ่าย (ไม่มี pilot, ไม่มี interview, ไม่มี feedback)

---

## 2. ใครคือ buyer กันแน่

- **VERIFIED:** Primary ICP ใน 00 = importer/distributor ที่มีหลาย SKU และหลาย dealer, รับ supply จาก supplier/factory หนึ่งรายขึ้นไป, เจอ partial production/delay/shortage เป็นประจำ, และปัจจุบันจัดสรรด้วยมือ
- **VERIFIED:** บทบาทผู้ใช้ที่ออกแบบไว้ = **tenant owner/admin** (FR-TEN-001, FR-AUTH-001, UX flow owner journey) และ **dealer** (FR-BKG-002, dealer code identity ตาม PD-008, dealer เห็นเฉพาะข้อมูลตัวเอง)
- **VERIFIED:** Dealer เป็นผู้ใช้ฝั่งรับ (booking link ฟรี) ไม่ใช่ผู้จ่ายเงิน — ไม่มี entitlement dimension หรือ pricing ฝั่ง dealer
- **VERIFIED:** ไม่มีบทบาท "purchasing team" หรือ "factory coordinator" ปรากฏใน docs — Phase 1 admin กรอก supply เอง (01, 05); Phase 2 เพิ่ม PO/commitment/batch ซึ่งเป็นงานสาย purchasing แต่ก็ยังไม่มี role แยก
- **INFERENCE:** tenant แรกคือธุรกิจของ owner เอง — หลักฐาน: PD-010 "First tenant base currency is THB", daily log ลงนาม "WSTERA / Owner", design source เขียนเป็นภาษาไทยเจาะตลาดไทย
- **UNVERIFIED:** จำนวน tenant ที่คาดหวัง, ใครคือ tenant ที่ 2, 3 — ไม่มีหลักฐานใน repo
- **สรุป buyer:** **เจ้าของธุรกิจนำเข้า/จัดจำหน่าย (importer/distributor owner) หรือ admin ที่เขามอบหมาย** — คนเดียวกับที่วันนี้ทำ allocation บน Excel/LINE ด้วยมือ (VERIFIED จาก ICP + UX flows) ส่วน purchasing team / factory coordinator = UNVERIFIED ว่าเป็น buyer/user กลุ่มจริง

---

## 3. Recurring operational pain ที่ทำให้คุ้มจ่าย vs spreadsheet/LINE

- **VERIFIED (pain ที่ระบุใน docs):**
  - "Ordered quantity is mistaken for confirmed supply; dealer requests are mistaken for guaranteed stock; delays are discovered too late" (00)
  - จัดการ demand, factory commitment, shortage, allocation ผ่าน spreadsheet + chat + memory (00)
  - design source §2: เจ้าของตอบคำถาม 10 ข้อไม่ได้แบบ real-time (ใครต้องการอะไร, มีของพร้อมส่งเท่าไร, โรงงานรับปากอะไร, โรงงานช้าจะกระทบใคร, ตัวไหนกำลังขาด, ใครควรได้ของ, backorder เท่าไร, ควรออก PO เพิ่มเมื่อไร)
  - design source §12: ตัวอย่าง X100 — Demand 470 / On Hand 50 / Confirmed Future 250 / SHORTAGE 170 — ตัวเลขที่ spreadsheet ต้องคำนวณเองทุกครั้ง
  - Phase 1 exit gate (design source 03): "ทดสอบ scenario จริงได้ครบโดยไม่ใช้ Excel แทรกกลาง" — ยืนยันว่า Excel คือ baseline ที่ต้องแทนที่
- **INFERENCE (ทำไม pain นี้ recurring):** shortage/delay เป็นเหตุการณ์ที่เกิดซ้ำตามรอบการผลิตและรอบ booking (00 ระบุ ICP "regularly faces partial production, delay or shortage") — ทุก round ต้องรวบรวม demand, เทียบ supply, จัดสรร, แจ้ง dealer → งานนี้เกิดซ้ำทุกสัปดาห์/ทุกเดือน ไม่ใช่ครั้งเดียว
- **INFERENCE (ทำไม spreadsheet/LINE พัง):** spreadsheet ไม่มี state machine (requested ≠ allocated ≠ fulfilled, ordered ≠ confirmed ≠ received — 05 invariants), ไม่มี revision history (05 invariant 7), ไม่มี dealer self-service (dealer ต้องถาม admin), ไม่มี audit (05 invariant 10) — ความผิดพลาดคือ "คนลืมอัปเดต" ซึ่งเป็น structural failure ของเครื่องมือ ไม่ใช่ความผิดพลาดของคน
- **UNVERIFIED:** ไม่มีหลักฐานเชิงปริมาณของ pain — ไม่มีตัวเลขเวลาที่เสียไปต่อ round, ไม่มีมูลค่าความเสียหายจาก over-promise/under-delivery, ไม่มีจำนวน dealer/SKU จริงของ tenant แรก

---

## 4. Differentiation จริง vs เครื่องมือ/workaround ที่มีอยู่

- **VERIFIED (vs spreadsheet/LINE/memory baseline):** 00 + 05 + design source ระบุชัด:
  1. Single source of truth ครบเส้น Demand → Supply → Gap → Allocation → Fulfillment
  2. แยกสถานะที่คนมักปนกัน: Requested/Allocated/Fulfilled และ Ordered/Confirmed/Received (05 invariants 1–4)
  3. Supply confidence classes เรียงจาก on-hand ถึง planned/unconfirmed — "ไม่เอา incoming ทุกชนิดมานับเป็นของพร้อมใช้เท่ากัน" (05, design source §11)
  4. Gap engine คำนวณ shortage ต่อ SKU/เวลา (05 §Gap rule, design source §12)
  5. Audit + revision history สำหรับ commitment/override (05 invariants 7, 10)
  6. Dealer self-service: เห็นเฉพาะของตัวเอง ไม่ต้องถาม admin (FR-DLR-002, UX)
  7. Tenant-configurable allocation policy — "no one allocation rule fits every business" (00 principle 5)
- **UNVERIFIED (vs เครื่องมือเชิงพาณิชย์):** **repo ไม่มี competitor analysis เลย** — ไม่มีชื่อคู่แข่ง, ไม่มีตารางเปรียบเทียบ, ไม่มีเหตุผลว่าทำไม ERP module / ระบบ order management / booking form tool / LINE OA ordering bot ที่มีอยู่แล้วไม่ตอบโจทย์
- **INFERENCE:** จุดต่างที่อาจเป็นจริงในตลาด = การผสม "supply confidence + gap + allocation with audit + dealer self-service" ใน product เดียวที่เบาพอสำหรับ importer ขนาดกลาง-เล็ก — ระบบ ERP ใหญ่เกินไป/แพงเกินไป, spreadsheet/form tool ไม่มี state machine, LINE-only workflow ไม่มี audit — แต่ข้อนี้เป็น INFERENCE เพราะไม่มีหลักฐานตลาดใน repo
- **UNVERIFIED:** ไม่มีหลักฐานว่าคู่แข่ง/workaround ที่มีอยู่ "ไม่ดีพอ" จริง — เป็นสมมติฐานของ product เอง

---

## 5. Multi-tenant SaaS สมเหตุสมผลกับ buyer/problem หรือ delivery model อื่นแข็งแรงกว่า?

- **VERIFIED:** docs ตั้งสมมติฐาน multi-tenant SaaS ตั้งแต่ต้น — 00 ประกาศหมวดหมู่, 01 มี SEC-TEN-001/REL-001, 03 (tenancy) เป็น SSOT, 04 มี entitlement/plan states, 07 มี SaaS KPIs (activated tenants, trial-to-paid, churn) — **การตัดสินใจนี้เป็น PD-006 (hardening ระดับ SaaS) ซึ่ง owner อนุมัติแล้ว**
- **VERIFIED:** ยังไม่มีหลักฐาน tenant ที่สอง — PD-010 ใช้ THB เป็นสกุลเงิน tenant แรก, ไม่มีหลักฐาน pipeline ของ tenant อื่น
- **INFERENCE:** ต้นทุนของ multi-tenant SaaS ใน V1 = tenancy/RLS (ถูก ถ้าทำถูกตั้งแต่ schema แรก — และ docs ยืนยันว่าการย้อนมาแก้ทีหลังแพง, design source 03 cross-phase non-negotiables) + billing/entitlement/plan-state infrastructure (แพงกว่า และ 04/08 เองก็ยัง mark เป็น pending)
- **INFERENCE:** ปัญหาของ buyer (importer กลาง-เล็กในไทย) เป็นปัญหาที่ "เหมือนกันข้ามธุรกิจ" — importer ทุกเจ้ามี dealer, factory, shortage, allocation — ฉะนั้น multi-tenant มีเหตุผลเชิง domain (ไม่ใช่แค่ฝัน) แต่ **ยังไม่มีเหตุผลเชิงตลาด** (ไม่มีหลักฐานว่ามีหลายเจ้าอยากจ่าย)
- **RECOMMENDATION:** แยกสองส่วนออกจากกัน:
  - **Tenancy/RLS/isolation → ทำตั้งแต่ V1** (ถูก, จำเป็น, ย้อนแก้แพง) — ตรงกับที่ docs วางไว้แล้ว
  - **Billing/entitlement enforcement/plan states/trial-grace → เลื่อน** จนกว่าจะมีหลักฐาน tenant ที่สองที่จ่ายเงิน (04/08 อนุญาตให้เลื่อนอยู่แล้ว — ระบุเป็น pending portfolio decision)
  - Delivery model ที่แข็งแรงกว่าสำหรับตอนนี้ = **single-tenant-first pilot บน codebase ที่ tenanted ถูกต้อง** ไม่ใช่ "internal tool ที่ต้องรื้อ" และไม่ใช่ "commercial SaaS ที่ยังไม่มีลูกค้า"
- **UNVERIFIED:** ยังไม่มีคำตอบว่า importer ไทยยอมจ่ายรายเดือนสำหรับเครื่องมือแบบนี้หรือไม่ — ต้องทดสอบกับ tenant จริง

---

## 6. ความเสี่ยงทางธุรกิจที่ใหญ่ที่สุด

**อันดับ 1 — Commercial demand ยังไม่ถูก validate เลย (VERIFIED ว่าไม่มีหลักฐาน / INFERENCE ว่าคือความเสี่ยง):**
- ไม่มีราคา (04), ไม่มี competitor analysis (ทั้ง repo), ไม่มี market sizing, ไม่มี customer discovery, ไม่มีหลักฐาน tenant ที่สอง, ไม่มี willingness-to-pay test
- โครงสร้างทั้งหมดสร้างจาก pain ของ owner เอง (INFERENCE จาก THB + "WSTERA / Owner") — ความเสี่ยง classic คือ "build for one, sell to none"
- **ผลกระทบ:** ลงทุน SaaS infrastructure (billing, entitlement, plan states, multi-tenant hardening) ไปก่อนที่ demand จะพิสูจน์ → ต้นทุนจมถ้าไม่มี tenant ที่สอง

**อันดับ 2 — Phase 1 thin loop อาจยังไม่ "คุ้มจ่าย" (INFERENCE จาก roadmap):**
- Phase 1 ยัง manual ทั้ง supply entry และ allocation (01, 05) — คุณค่าหลักคือ visibility + dealer self-service + audit
- คุณค่าที่ "ขายได้จริง" (allocation policies, PO/commitment, impact analysis, intelligence) อยู่ใน Phase 2–7 (10) ซึ่งยังห่าง
- ถ้าเปิดขายตอน Phase 1 → เสี่ยง churn หลัง trial สูง (ดู §1.2)

**อันดับ 3 — Pain เป็น event-driven (INFERENCE):** shortage/delay เกิดเป็นรอบ — ระหว่างรอบ ระบบอาจ idle → การรับรู้คุณค่าลดลง → churn; ต้องมีกลไกให้ระบบ "ดึงปัญหาขึ้นมา" (Phase 6 control tower) ก่อนที่ retention จะแข็งแรง

**อันดับ 4 — Key-person / single-owner dependency (INFERENCE):** product ขับเคลื่อนโดย owner คนเดียว; ถ้า tenant แรกคือธุรกิจ owner เอง ความสำเร็จเชิงพาณิชย์ = ความสามารถ owner ในการขายให้คนอื่น

**อันดับ 5 — Distribution ไม่มีหลักฐาน (VERIFIED ว่าไม่มี / INFERENCE ว่าเป็นช่องโหว่):** ไม่มี GTM plan, ไม่มี channel, ไม่มี sales motion ใน repo; design source เอ่ยถึง LINE LIFF (dealer booking) และ Phase 6 เอ่ยถึง LINE OA — LINE คือช่องทางธรรมชาติของตลาดไทย (INFERENCE) แต่ยังไม่มีการออกแบบ distribution

---

## 7. Destination: commercial SaaS / operational tool / อื่น?

**RECOMMENDATION ของ lens นี้: "Anchor-tenant pilot → evidence-gated SaaS conversion"**

1. **Phase 1 = pilot ในธุรกิจของ owner เอง (anchor tenant)** — ใช้ KPI ที่ 07 กำหนดไว้แล้วเป็น evidence gate: time to first completed thin loop, demand capture rate, weekly active operators, active dealers submitting demand, manual override rate
2. **ก่อน commercial launch ต้องมีหลักฐาน 3 อย่าง:**
   - (ก) pilot ผ่าน: dealer ใช้ booking link จริง, gap/allocation ถูกใช้จริงในรอบธุรกิจจริง ≥ 2–3 รอบ
   - (ข) customer discovery: interview importer/distributor ภายนอก 3–5 ราย (ในเครือข่าย dealer/industry ของ owner) — ยืนยัน pain, ยืนยัน willingness-to-pay ช่วงราคา
   - (ค) tenant ที่สองที่จ่ายเงินจริง (หรือ LOI) — ถึงตอนนั้นค่อยลงทุน billing/entitlement/plan-state
3. **ถ้า (ข)/(ค) ไม่เกิดภายในกรอบเวลาที่กำหนด → ลดระดับเป็น operational tool ภายใน** (ยังมีคุณค่า: เป็นระบบจริงของธุรกิจ owner) — ไม่ใช่ความล้มเหลว แต่คือการไม่จมทุน SaaS
4. **สิ่งที่ควรทำทันทีโดยไม่รอ:** tenancy/RLS/isolation ถูกต้องตั้งแต่ V1 (ตรงกับ docs อยู่แล้ว), เก็บ KPI/event ตาม 07 ตั้งแต่ pilot (ข้อมูลนี้เองคือหลักฐาน commercial viability)

**เหตุผล:** ปัญหาและ domain ดีพอจะเดินต่อ (VERIFIED) แต่หลักฐานตลาดยังไม่พอจะประกาศ commercial SaaS (VERIFIED ว่าไม่มี) — ทางเลือกที่ประหยัดต้นทุนและไม่ปิดทางคือ pilot-first + evidence gate

---

## 8. Evidence gaps — สิ่งที่ council ควรถาม owner โดยตรง (UNKNOWN)

1. WSTERA คือธุรกิจนำเข้าของ owner เองหรือไม่ และ tenant แรกคือธุรกิจนี้ใช่ไหม? (repo บอกแค่ THB + "WSTERA / Owner")
2. มี importer/distributor รายอื่นที่ owner คุยด้วยแล้วหรือยัง? กี่ราย? ตอบรับอย่างไร?
3. owner เคยทดสอบ willingness-to-pay กับใครหรือยัง? ช่วงราคาที่คิดไว้?
4. ขนาดธุรกิจจริง: กี่ SKU, กี่ dealer, กี่ factory, กี่รอบ booking ต่อเดือน? (ตัวเลขนี้กำหนด tier/pricing และ Phase 1 scope)
5. มีคู่แข่ง/workaround ที่ owner รู้จักและประเมินแล้วหรือไม่? (repo ไม่มี)
6. ถ้าไม่มี tenant ที่สองภายใน 6 เดือน owner จะยังเดินต่อในฐานะ internal tool หรือไม่?

---

## 9. Dissent / Uncertainty

- **Dissent:** ผมไม่เห็นด้วยกับการตีความว่า "multi-tenant SaaS" ถูก justify แล้วจากหลักฐาน — docs ตั้งสมมติฐานนี้ไว้ (category, tenancy, entitlements) แต่ไม่มีหลักฐานตลาดรองรับแม้แต่ชิ้นเดียว; การประกาศ destination เป็น commercial SaaS ตอนนี้ = อนุมัติต้นทุนโดยไม่มี demand evidence
- **Dissent (รอง):** การวาง plan states + entitlement dimensions ใน 04 ก่อนมี tenant ที่สอง เป็นการออกแบบ pricing structure ล่วงหน้าโดยไม่มีข้อมูลตลาด — ไม่ผิด (เป็น contract ที่ปลอดภัย) แต่ไม่ควรถูกมองว่าเป็น "ความก้าวหน้าทางพาณิชย์" เพราะมันคือ engineering contract ไม่ใช่ market validation
- **Uncertainty:** ผมไม่สามารถยืนยันตัวตนของ WSTERA, จำนวน tenant ที่คาดหวัง, หรือความตั้งใจเชิงพาณิชย์ของ owner ได้จาก repo — ต้องถาม owner โดยตรง (ดู §8)
- **Uncertainty:** ไม่มีหลักฐานว่า Phase 1 thin loop เพียงพอต่อการจ่ายเงินหรือไม่ — verdict นี้จึงพึ่งพา pilot เป็น evidence gate อย่างหลีกเลี่ยงไม่ได้
- **จุดที่ lens นี้เห็นด้วยกับ docs:** การไม่ invent ราคา/ค่า commercial (04, 08, audit PASS) เป็นวินัยที่ถูกต้อง — ปัญหาไม่ใช่ docs แต่คือการไม่มีกระบวนการหา evidence เชิงตลาดเลย

---

*End of Business/Market lens raw output — WS01 WSM, Round 1, 2026-09-03*
