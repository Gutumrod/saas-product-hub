# PS01 Pawstia PMS — Business/Market Lens Analysis (Council Round 1)

**Lens:** Business/Market — revenue model, competition, differentiation, distribution, commercial viability
**Date:** 2026-09-03
**Evidence base:** อ่านจาก repository จริง `D:\AI-Workspace\projects\saas-product-hub\products\PawSpace` (branch `verify/phase13-closure-2026-09-01`, HEAD `fdd10e7`, working tree clean — ยืนยันด้วย `git status` / `git log` เอง)
**Files read:** PRODUCT_ONE_PAGER.md, PRD.md, BUSINESS_MODEL.md, COMMERCIAL_READINESS.md, ROADMAP.md, SALES_PLAYBOOK.md, CURRENT_STATUS.md, PHASE13_IMPLEMENTATION_EVIDENCE.md, IMPLEMENTATION_STATUS.md, BRIEF-sell-ready-execution.md, daily logs 2026-09-01/02, WORK-BRIEF-2026-09-02.md

**Label convention:** VERIFIED = มีหลักฐานใน repo / INFERENCE = สรุปจากหลักฐาน / UNVERIFIED = ยังไม่มีหลักฐาน / UNKNOWN = ไม่มีข้อมูล / RECOMMENDATION = ข้อเสนอของ lens นี้

---

## 0. สถานะข้อขัดแย้ง Phase 13 (ตรวจจริงจาก git)

- VERIFIED: HEAD ปัจจุบันคือ `fdd10e7` (2026-09-03 17:29 +0700, "fix(docs): remove evidence whitespace errors") บน branch `verify/phase13-closure-2026-09-01`, working tree clean
- VERIFIED: `PHASE13_IMPLEMENTATION_EVIDENCE.md` (2026-09-03) บันทึก CI run `33743691064` = **success** ครอบคลุม migration replay, Phase 1–3 regressions, Phase 13 quota concurrency races, legacy `trial→trialing` probe, TypeScript suites, Phase 10 browser E2E, typecheck/lint/build
- VERIFIED: ไฟล์ evidence ระบุขอบเขตชัดเจน — "isolated CI evidence, not production deployment evidence. No PR was merged, no remote database migration was applied, and no deployment occurred. PR #4 remains Draft/Open against master"
- VERIFIED: `docs/CURRENT_STATUS.md` (2026-09-02) บอก Phase 13 NOT CLOSED — แต่เอกสารนี้เก่ากว่า evidence (อ้าง HEAD `58b8305`/`c063592` และ CI run `33494605562` ที่ล้มเหลว)
- INFERENCE: หลักฐานที่แข็งแกร่งที่สุดในปัจจุบัน = CI verification ผ่าน (run 33743691064) → Phase 13 **engineering closure มีหลักฐาน CI ผ่านแล้ว** แต่ CURRENT_STATUS.md ยังไม่ถูกอัปเดตตาม reality ใหม่ (evidence ระบุว่า "Do not rewrite historical evidence" — ควรอัปเดต CURRENT_STATUS แทนที่จะเชื่อตามเดิม)
- VERIFIED: ไม่ว่า Phase 13 จะปิดหรือไม่ **ไม่มีผลต่อข้อสรุปทางธุรกิจ** เพราะทุกเอกสารยืนยันตรงกันว่า payment collection, production deployment, และ Closed Beta ยังไม่เกิดขึ้น

---

## 1. รายได้: ผลิตภัณฑ์ทำเงินอย่างไร และทำไมผู้ซื้อถึงจ่ายต่อ

### โมเดลรายได้ (จากเอกสาร)
- VERIFIED: B2B subscription SaaS รายเดือน/รายปี (BUSINESS_MODEL.md §2):
  - Starter ฿990/ด. (9,900/ปี) — 10 ห้อง, ประวัติ 300 ตัว, Daily Report LINE, Google Sheets sync
  - Pro ฿1,490/ด. (14,900/ปี) — ไม่จำกัดห้อง/ประวัติ
  - Enterprise ฿2,490/ด. (24,900/ปี) — พนักงานไม่จำกัด + Priority Support/SLA
  - Founding Member ฿990/ด. = Pro entitlement ตลอดชีพ (Decision C2, non-transferable, ต้องต่ออายุต่อเนื่อง, ไม่รวม future add-ons)
- VERIFIED: รายได้เสริมวางแผนไว้ (future): onboarding/setup 3,000–5,000 บาท/ร้าน (ฟรีช่วง beta), Google Drive photo backup, SlipOK/e-Tax, camera add-on, multi-branch (BUSINESS_MODEL.md, PRD non-goals)
- VERIFIED: **Payment collection ยังไม่ถูก implement เลย** — COMMERCIAL_READINESS.md: "Payment collection absent. No payment/billing integration exists anywhere in the product by design (Phase 9/11 both explicitly scoped it out)"; ROADMAP.md: "Payment collection | NOT IMPLEMENTED"
- INFERENCE: โมเดลรายได้ = classic B2B SaaS subscription + ต่อยอด add-on — โครงสร้างสมเหตุสมผล แต่เป็น **โมเดลบนกระดาษล้วน ยังไม่มีเงินเข้าแม้แต่บาทเดียว**

### ทำไมผู้ซื้อถึงจ่าย/จ่ายต่อ (จากเอกสาร)
- VERIFIED: คุณค่าที่ขาย = 1) ป้องกันห้องชน (DB-level), 2) Daily Report LINE 15 วิ (ลดภาระพี่เลี้ยง + สร้างความประทับใจลูกค้า), 3) Google Sheets replica (แก้ fear of lock-in) (PRD §1, ONE_PAGER)
- INFERENCE: เหตุผลที่ "จ่ายต่อ" ตามทฤษฎี = ข้อมูลลูกค้า/ประวัติสะสมอยู่ในระบบ (switching cost) + พนักงานชินกับ workflow + ลูกค้าเจ้าของสัตว์ชินกับ LINE card → แต่ **ยังไม่มีหลักฐานจริงว่า retention เกิดขึ้น** เพราะยังไม่มีร้านจ่ายเงิน
- UNVERIFIED: ยังไม่มีหลักฐานว่าเจ้าของร้านยอมจ่ายจริง (H3 Willingness to Pay ยังไม่ถูกทดสอบ — BUSINESS_MODEL.md ระบุเป็น hypothesis เอง)

---

## 2. Differentiation จริง vs เครื่องมือเดิม

### ตามที่เอกสารอ้าง (VERIFIED = เป็น documented claim)
- vs สมุด/Excel: ป้องกันห้องชนที่ระดับ DB (สมุดพลาดบ่อย), ส่งรูป LINE อัตโนมัติ (เดิมส่งทีละคน), ผังห้อง real-time บน iPad
- vs โปรแกรม Windows เก่า: iPad/mobile-first (ของเก่าต้องเปิดคอม), LINE integration (ของเก่าไม่มี), ข้อมูลไม่ล็อก (ของเก่าข้อมูลติดในโปรแกรม) — ONE_PAGER ตารางเปรียบเทียบ
- จุดขายเชิงกลยุทธ์ที่ฉลาด: **Google Sheets replica = อาวุธต่อต้าน objection "กลัวข้อมูลหาย/โดนล็อก"** ซึ่งเป็นกำแพงใหญ่สุดของการขาย SaaS ให้ร้านเล็ก (SALES_PLAYBOOK objection #3)

### ข้อจำกัดของ differentiation (INFERENCE/UNVERIFIED)
- UNVERIFIED: **ไม่มีเอกสาร competitive analysis ใน repo** — ไม่มีหลักฐานว่าได้ศึกษา Gingko/คู่แข่ง PMS ไทย หรือซอฟต์แวร์ต่างประเทศ (PetExec, Gingr, PawPartner ฯลฯ) เลย ไม่รู้ว่าจุดต่างที่อ้าง "จริง" ในตลาดหรือไม่
- INFERENCE: differentiation ที่อ้างเป็น **functional claims ที่ engineering พิสูจน์ได้** (DB constraint, LINE delivery, Sheets sync) แต่ **market differentiation ยังไม่ถูกพิสูจน์** — ยังไม่มีร้านจริงเทียบ workflow เดิม
- INFERENCE: จุดอ่อนเชิงตำแหน่ง: ราคา 990–1,490 บ./ด. สำหรับร้านเล็กไทยอาจถูกมองแพงเมื่อเทียบกับ "Excel ฟรี" — SALES_PLAYBOOK objection #1/#5 ยอมรับเองว่าลูกค้าจะยกเหตุผลนี้ (มี script ตอบแล้ว แต่ยังไม่รู้ว่าตอบแล้วปิดได้จริงไหม)

---

## 3. ราคา: สัญญาที่ verified หรือ hypothesis?

- VERIFIED: ราคา Starter 990 / Pro 1,490 / Enterprise 2,490 / Founding 990 เป็น **สัญญาที่ล็อกในเอกสาร** (PRD Decision C2 + BUSINESS_MODEL.md + ONE_PAGER + SALES_PLAYBOOK ตรงกันหมด) และ **Starter quota (10 ห้อง/300 ตัว) ถูก enforce จริงที่ DB boundary ใน Phase 13** (PRD §11, IMPLEMENTATION_STATUS §2)
- VERIFIED: แต่ BUSINESS_MODEL.md §3 ระบุเองว่า H1–H4 (market pain, trial→paid >40%, willingness to pay 990–1,490, B2C add-on) เป็น **สมมติฐานที่ต้องทดสอบ** — ยังไม่มีการทดสอบใดเกิดขึ้น
- INFERENCE: ราคา = **verified contract ทางเอกสาร + engineering enforcement แต่เป็น hypothesis ทางตลาด** — ยังไม่มีลูกค้าจ่ายเงินจริงแม้แต่รายเดียว ตัวเลข 990/1,490/2,490 มาจากการตั้งโดยทีม ไม่ใช่จาก data
- UNVERIFIED: ไม่มีหลักฐานการ benchmark ราคากับคู่แข่ง หรือการทดสอบ price sensitivity กับร้านจริง

---

## 4. Commercial viability ของเส้นทาง Closed Beta → Paid Launch

- VERIFIED: เส้นทางถูกนิยามชัดเจนและมีวินัยดี:
  - ROADMAP Stage B (Closed Beta): 1 ร้านจริง → 3 → 5 → 10, วัด onboarding time / booking failures / LINE success / Sheets sync / learning curve / support burden / willingness-to-pay, "Do not call technical PILOT READY the same thing as successful real-world beta validation"
  - Stage C (Paid Launch): ต้องมี Phase 13 ปิด + payment integration + commercial rules + ops + legal + brand ก่อน
  - BRIEF-sell-ready-execution.md: PS-SR-06 (beta) → PS-SR-07 (commercial contract) → PS-SR-08 (payment) → PS-SR-09 (launch gate) → PS-SR-10 (progressive rollout) — "ห้ามเริ่ม payment integration จน Closed Beta evidence และ PS-SR-07 approved"
- VERIFIED: **Closed Beta ยังไม่เริ่ม** — IMPLEMENTATION_STATUS: "Closed Beta business validation | NOT COMPLETED"; ไม่มีหลักฐานร้านจริงแม้แต่ร้านเดียวใน repo
- INFERENCE: viability ของเส้นทาง = **โครงสร้างถูกต้อง (gate-based, evidence-first) แต่ยังเป็นศูนย์** — ยังไม่มี cohort แรก, ยังไม่มี metrics, ยังไม่มี willingness-to-pay data จุดที่เส้นทางจะพิสูจน์ตัวเองคือ Stage B เท่านั้น
- INFERENCE: จุดแข็งของเส้นทาง = ลำดับถูกต้อง (beta ก่อน payment) ลดความเสี่ยงสร้าง billing ก่อนรู้ว่ามีคนอยากจ่าย
- INFERENCE: จุดเสี่ยงของเส้นทาง = ระยะเวลาจากวันนี้ถึง paid launch ยังอีกไกล (ต้อง beta + ops + legal + payment integration) — ความเสี่ยงคือ "engineering เก่งแต่ขายไม่เคยเริ่ม"

---

## 5. ความเสี่ยงทางธุรกิจที่ใหญ่ที่สุด

- INFERENCE (จัดอันดับจากหลักฐาน): **ความเสี่ยงใหญ่สุด = ไม่มีหลักฐาน demand จริง — ศูนย์ร้านจริง, ศูนย์ผู้จ่ายเงิน, ศูนย์ competitive analysis** โมเดลรายได้, ราคา, differentiation, retention ล้วนเป็น hypothesis ที่ยังไม่ถูกทดสอบกับตลาด
- VERIFIED (สนับสนุน): BUSINESS_MODEL.md ระบุ H1–H4 ยังไม่ทดสอบ; IMPLEMENTATION_STATUS: Closed Beta NOT COMPLETED; COMMERCIAL_READINESS: payment/legal/ops/brand ยังไม่พร้อม
- INFERENCE: ความเสี่ยงรอง = **channel/distribution ยังไม่เกิด** — ONE_PAGER ระบุ LINE OA handle = TBD, website = TBD, เอกสารเป็น DRAFT ห้าม publish จนกว่า trademark/legal clearance; SALES_PLAYBOOK เป็น founder-led outreach ผ่าน Google Maps/Facebook (list 50 ร้าน กทม.) ยังไม่มีการ execute
- INFERENCE: ความเสี่ยงรองอีกตัว = **cost of delay** — โปรเจกต์ engineering 13 phases เสร็จแล้ว แต่ยังไม่มีรายได้; ถ้า beta ลากยาว ต้นทุนจมเพิ่มโดยไม่มี revenue signal
- UNVERIFIED: ไม่มีข้อมูลตลาด (ขนาด TAM/SAM, จำนวน pet hotel ในไทย, อัตราการเติบโต) ใน repo — ไม่สามารถประเมิน upside ได้จากหลักฐาน

---

## 6. V1 ต้องพึ่ง Project B admission และ billing หรือไม่?

- VERIFIED: **Pilot/value validation ไม่ต้องพึ่ง billing** — COMMERCIAL_READINESS: payment absent "by design"; ROADMAP Stage B (beta) มาก่อน Stage C (payment) อย่างชัดเจน; BRIEF-sell-ready: "ห้ามเริ่ม payment integration จน Closed Beta evidence" → Closed Beta วิ่งได้โดยไม่ต้องมีระบบเก็บเงิน (เก็บเงินด้วยมือ/Excel ระหว่าง beta ก็ได้)
- VERIFIED: **Project B admission (PS-A2) ยังไม่ผ่าน** — CURRENT_STATUS (2026-09-02): "Pawstia is not yet admitted"; Booking Stage 4 prerequisite ปิดแล้ว → PS-A2 unblocked แต่ยังต้องถูก dispatch/admit อย่างชัดเจน
- INFERENCE: Project B admission เป็น **portfolio-level gate ทางการบริหาร** ไม่ใช่ technical blocker ของ pilot — แต่ถ้า portfolio ยังไม่ admit โปรเจกต์ การเริ่ม beta อาจขัดกับ scheduling rule (CURRENT_STATUS: "QUEUED VERIFICATION TRACK", "Keep PS-A2 as a separate explicitly dispatched admission track")
- RECOMMENDATION: pilot/value validation ควรเริ่มได้ทันทีที่ PS-A2 admission ผ่าน — **ไม่ควรรอ payment integration**; ระหว่าง beta เก็บเงินด้วยวิธี manual (บิล/โอน) เพื่อพิสูจน์ willingness-to-pay ก่อนลงทุนสร้าง billing

---

## 7. Retention loop ที่แข็งแกร่งที่สุด (มุมมอง commercial)

- INFERENCE: **Daily Care Report ผ่าน LINE คือ retention loop หลัก** — เหตุผล:
  1. ใช้ทุกวัน (daily habit ของพี่เลี้ยง) → product ฝังใน routine ไม่ใช่เครื่องมือเปิดเดือนละครั้ง
  2. สร้างคุณค่าให้ B2C (เจ้าของสัตว์) ทุกวัน → เจ้าของสัตว์กดดัน/ชื่นชมร้าน → ร้านเห็นคุณค่าโดยตรง
  3. LINE เป็นช่องทางที่คนไทยใช้อยู่แล้ว ไม่ต้องโหลดแอปใหม่ (PRD: "โดยไม่ต้องโหลดแอป")
  4. ประวัติรูป/รายงานสะสม = switching cost ฝั่งเจ้าของสัตว์ (ย้ายร้าน = เสียประวัติ)
- VERIFIED (สนับสนุน): PRD §3 "The Core Daily Loop" วาง Daily Report เป็นหัวใจ; ONE_PAGER เรียกเป็น "3 ฟีเจอร์ชูโรง"; SALES_PLAYBOOK ใช้เป็น hook เปิดบทสนทนาทุก script
- INFERENCE: loop รอง = Google Sheets replica (ลด fear of churn — ลูกค้าไม่กลัวติดระบบ) + ข้อมูลลูกค้าสะสม (CRM switching cost ฝั่งร้าน)
- UNVERIFIED: ยังไม่มี data ว่า retention จริงเป็นเท่าไร (ต้องวัดจาก beta: daily active usage, report volume, churn)

---

## 8. สรุป verdict ของ lens Business/Market

- VERIFIED: โมเดลรายได้/ราคา/playbook ครบถ้วนและสอดคล้องกันในเอกสาร — **commercial blueprint คุณภาพดี**
- VERIFIED: Engineering พร้อมรับ beta (Phase 13 CI ผ่าน) แต่ **ยังไม่พร้อมขาย** (payment, ops, legal, brand, production deployment ยังไม่ปิด)
- INFERENCE: **สถานะจริง = "engineering-complete, market-zero"** — จุดเปลี่ยนสำคัญถัดไปไม่ใช่ engineering แต่คือ **การหาร้านจริง 1 ร้านแรกเข้า Closed Beta** เพื่อพิสูจน์ H1–H3
- INFERENCE: ราคา 990–1,490 บ./ด. เป็น hypothesis ทางตลาด (แม้เป็น contract ทางเอกสาร) — ต้องให้ beta เป็นตัวตัดสิน ไม่ใช่ยึดตาย
- INFERENCE: ความเสี่ยงใหญ่สุด = ไม่มี demand evidence + ไม่มี competitive analysis + channel ยังไม่เกิด
- RECOMMENDATION หลัก:
  1. เร่ง PS-A2 admission แล้วเริ่ม Closed Beta กับร้านจริง 1 ร้านทันที (ไม่ต้องรอ billing)
  2. ทำ competitive analysis + market sizing ก่อน Paid Launch gate (ปัจจุบันไม่มีใน repo)
  3. ใช้ beta วัด willingness-to-pay ด้วยการเก็บเงิน manual ก่อนสร้าง payment integration
  4. อัปเดต CURRENT_STATUS.md ให้ตรงกับ evidence ใหม่ (Phase 13 CI ผ่าน) — เอกสารปัจจุบันล้าหลัง reality

**Dissent/uncertainty:** (1) ผมไม่สามารถยืนยันผล CI run 33743691064 ได้ด้วยตัวเอง (ไม่มี access ไป GitHub Actions) — เชื่อตาม evidence file ที่ commit ใน repo; (2) ไม่มีข้อมูลตลาดภายนอกใน repo → ทุกข้อสรุปเรื่องขนาดตลาด/คู่แข่งเป็น UNKNOWN; (3) การประเมิน "retention loop แข็งแกร่ง" เป็น INFERENCE จาก design intent ไม่ใช่จาก data จริง
