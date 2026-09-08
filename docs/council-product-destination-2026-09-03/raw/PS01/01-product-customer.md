# PS01 Pawstia PMS — Product/Customer Lens Analysis (Council Round 1)

**Lens:** Product/Customer — user, buyer, pain, workflow, adoption, willingness to pay
**Date:** 2026-09-03
**Evidence base:** อ่านจาก repository จริง `D:\AI-Workspace\projects\saas-product-hub\products\PawSpace` (branch `verify/phase13-closure-2026-09-01`, HEAD `fdd10e7`, working tree clean — verified ด้วย `git status`/`git log` เอง)
**Label convention:** VERIFIED = มีหลักฐานใน repo / INFERENCE = สรุปจากหลักฐาน / UNVERIFIED = ยังไม่มีหลักฐาน / RECOMMENDATION = ข้อเสนอจากเลนส์นี้ / UNKNOWN = ไม่มีข้อมูล

---

## 0. การจัดการความขัดแย้งของเอกสารสถานะ (Contradiction Resolution)

- **VERIFIED:** `git log` แสดง HEAD ปัจจุบัน = `fdd10e7` "fix(docs): remove evidence whitespace errors" (2026-09-03 17:29 +0700) บน branch `verify/phase13-closure-2026-09-01`; commit ก่อนหน้า `6527987` "docs(phase13): record independent closure evidence" (2026-09-03 17:28) และ `d6f4acf` "test(phase7): make worker claim fixture ordering deterministic" (2026-09-03 17:19) อยู่ใน history ทั้งหมด
- **VERIFIED:** `PHASE13_IMPLEMENTATION_EVIDENCE.md` (2026-09-03) บันทึก CI run `33743691064` = **success** ครอบคลุม: fresh migration replay + DB lint, Phase 1/2/3 historical regressions, Phase 13 quota concurrency races, legacy `trial`→`trialing` upgrade probe, TypeScript regressions ทั้งหมดรวม Phase 7 worker claims, Phase 10 browser E2E, typecheck/lint/build/`git diff --check`
- **VERIFIED:** `docs/CURRENT_STATUS.md` (2026-09-02) อ้างอิง CI run `33494605562` (ล้มเหลวที่ Phase 1 regression) และ HEAD `c063592`/`58b8305` — **เป็นสถานะที่เก่ากว่า** หลักฐาน 2026-09-03 และ git HEAD ปัจจุบัน
- **VERDICT:** `CURRENT_STATUS.md` ล้าสมัย (stale) — หลักฐานที่แข็งแรงที่สุดคือ `PHASE13_IMPLEMENTATION_EVIDENCE.md` + git state จริง ณ HEAD `fdd10e7` → **Phase 13 implementation ผ่าน CI matrix แล้ว**
- **UNVERIFIED:** ยังไม่พบไฟล์ `REVIEW-phase13-*.md` ใดๆ ใน repo (search = 0 ผล) — ตาม convention ของ repo (ดู REVIEW-phase10/11/12) ต้องมี independent review ก่อนประกาศ CLOSED อย่างเป็นทางการ
- **VERIFIED:** ตัว `PHASE13_IMPLEMENTATION_EVIDENCE.md` เองระบุชัด: "This is isolated CI evidence, not production deployment evidence. No PR was merged, no remote database migration was applied, and no deployment occurred. PR #4 remains Draft/Open against master."
- **สรุปสำหรับเลนส์นี้:** สถานะ Phase 13 เป็น engineering gate ไม่ได้เปลี่ยน verdict ด้าน product/customer — จุดที่ชี้ขาดคือ **ยังไม่มีร้านจริงแม้แต่ร้านเดียว** (ดู §7) และ **payment/brand/production-ops ยังไม่พร้อม** (ดู §6, §8)

---

## 1. ปัญหาที่แก้ และแก้ให้ใคร (Problem & Who)

**VERIFIED (PRD §1, PRODUCT_ONE_PAGER):** แก้ 3 ปัญหาหลักของโรงแรม/ศูนย์รับฝากสัตว์เลี้ยง (single-store):
1. **Double Booking** — จดสมุด/Excel เสี่ยงรับห้องซ้ำช่วงเทศกาล ลูกค้ามาถึงแล้วไม่มีห้อง
2. **Daily Care Report Chaos** — พี่เลี้ยงส่งรูปทีละคนผ่าน LINE ส่วนตัว วุ่นวาย รูปตกหล่น ไม่มีประวัติย้อนหลัง
3. **Data Lock-in Fear** — ร้านไม่กล้าใช้ซอฟต์แวร์ใหม่เพราะกลัวข้อมูลประวัติติดอยู่ในระบบ

**VERIFIED (PRD positioning statement):** "Pawstia PMS คือ Pet Hotel OS ที่จัดการห้อง การเข้าพัก และ Daily Care Report ผ่าน LINE โดยร้านยังมีสำเนาส่งออกของข้อมูลลูกค้าและรายการจองอยู่ใน Google Sheets"

**VERIFIED (BUSINESS_MODEL §1):** คุณค่า 2 ชั้น — B2B ต่อร้าน (ห้องไม่ชน + ส่งรายงาน 15 วิ + Data Export Replica) และ B2C ต่อเจ้าของสัตว์ (สบายใจ ได้การ์ดสรุปทาง LINE ทุกวัน ไม่ต้องโหลดแอป)

**INFERENCE:** นี่คือผลิตภัณฑ์ B2B2C — ร้านจ่ายเงิน (B2B) แต่คุณค่าที่ลูกค้าปลายทาง (เจ้าของสัตว์) เห็นคือการ์ด LINE รายวัน ซึ่งเป็นกลไกที่ทำให้ร้าน "ดูมืออาชีพ" ต่อหน้าลูกค้าตัวจริง

---

## 2. ผู้ใช้หลัก vs ผู้ซื้อ (Primary User vs Buyer)

- **VERIFIED (PRD permission matrix, ONBOARDING_SOP):** ผู้ใช้หลัก (daily user) = **พนักงานหน้าร้าน/พี่เลี้ยง (staff)** บน iPad/มือถือ — ทำงาน 4 สเต็ป: รับจอง&ผูก LINE → เช็คอิน → ถ่ายรูปส่ง Daily Report → เช็คเอาท์&ทำความสะอาด; เจ้าของร้าน/manager ใช้ dashboard + จัดการ staff/room config
- **VERIFIED (SALES_PLAYBOOK, BUSINESS_MODEL §4):** ผู้ซื้อ (buyer) = **เจ้าของร้าน (shop owner)** — ทุกสคริปต์ขาย targeting เจ้าของร้านโดยตรง
- **INFERENCE:** รูปแบบคลาสสิก "buyer ≠ daily user" — เจ้าของร้านจ่ายเงิน แต่พี่เลี้ยงใช้ทุกวัน → **ความง่ายของ workflow หน้าร้าน (3 นาทีสอนได้) คือเงื่อนไข adoption ที่แท้จริง** (SALES_PLAYBOOK objection #2 "พนักงานไม่เก่งเทคโนโลยี" สะท้อนว่าเจ้าของร้านกังวลจุดนี้เอง)

---

## 3. เอกลักษณ์ผลิตภัณฑ์ที่ถูกต้องสำหรับ V1 (Primary Identity)

- **VERIFIED (PRD header + §1):** ขอบเขต V1 = **"Pet Hotel & Pet Daycare Management OS (Single-Store Focus)"** — เอกลักษณ์ที่ถูกต้องคือ **Pet Hotel/Daycare OS**
- **VERIFIED (PRD Non-Goals):** V1 ตัดออกอย่างเด็ดขาด: clinic/pharmacy, grooming queue, multi-branch, billing automation/e-Tax, Google Drive photo sync, full RTSP/HLS multi-camera
- **VERIFIED (IMPLEMENTATION_STATUS):** tagline ทางการค้าเขียนว่า "Pawstia PMS — Pet Management System by WSTERA" — คำว่า "Pet Management System" กว้างกว่าขอบเขต V1 จริง
- **RECOMMENDATION:** ใช้เอกลักษณ์แคบ = **"Pet Hotel & Daycare OS"** (ตาม PRD/one-pager) อย่าใช้ "Pet Management System" กว้างๆ เพราะ V1 ไม่มี clinic/grooming/multi-branch — การ positioning กว้างเกิน scope จะสร้าง expectation gap กับผู้ซื้อ และเปิดช่องให้คู่แข่ง/ลูกค้าตั้งคำถาม "แล้ว grooming ล่ะ?" ตัวย่อ "PMS" ใช้ได้ แต่คำขยายต้องเป็น Hotel/Daycare OS
- **RECOMMENDATION:** อย่าเลื่อนไป "broader Pet PMS" จนกว่าจะมี demand จากร้านจริง (ROADMAP Stage D: expansion ต่อเมื่อ validated demand)

---

## 4. ผู้ซื้อและความเจ็บปวดรายวันที่สร้าง Willingness to Pay (WTP)

- **VERIFIED (PRD §1, one-pager):** ผู้ซื้อ = เจ้าของร้านโรงแรม/เดย์แคร์สัตว์เลี้ยง
- **VERIFIED (PRD §1):** ความเจ็บปวด 3 อย่างมี "ความถี่" ต่างกัน:
  - Double booking = **ตามฤดูกาล** (เทศกาล) — รุนแรงแต่ไม่รายวัน
  - Daily Care Report = **รายวัน** — ทุกตัว ทุกวัน พี่เลี้ยงเสียเวลาส่งรูปทีละคน รูปกระจัดกระจาย ไม่มีประวัติ
  - Data lock-in fear = **ครั้งเดียวตอนตัดสินใจ adopt** — เป็น adoption barrier ไม่ใช่ recurring pain
- **INFERENCE:** แหล่ง WTP ที่เกิดซ้ำรายเดือน = **ภาระงานส่งรายงานรายวันของพี่เลี้ยง + คุณภาพประสบการณ์ลูกค้า (เจ้าของสัตว์)** — นี่คือ pain ที่เกิดขึ้นทุกวันทำการ จึงสร้างเหตุผลจ่ายรายเดือนได้ต่อเนื่อง ส่วน double-booking เป็น pain ที่ "จุดชนวน" การซื้อช่วงเทศกาล (เหตุผลแรกที่สนใจ) แต่ไม่เกิดทุกวัน
- **UNVERIFIED:** ยังไม่มีหลักฐานว่าเจ้าของร้านยอมจ่ายจริง — H3 (WTP 990–1,490 บ./ด.) ใน BUSINESS_MODEL เป็นสมมติฐานที่ยังไม่ได้ทดสอบ (ดู §7)

---

## 5. Retention Engine — วงจรใดคือเครื่องยึดลูกค้า

- **VERIFIED (PRD §3 Core Daily Loop):** วงจรแกน = `[สัตว์เข้าพัก] → [ผังห้องไม่ชน] → [ดูข้อมูลอาหาร/ยา] → [ส่ง Daily Report 15 วิ] → [เจ้าของได้ LINE]`
- **VERIFIED (Phase 6 evidence 43/43, Phase 10 E2E "pilot core loop runs through real UI"):** Daily Report + LINE delivery เป็นฟีเจอร์ที่ถูก implement และทดสอบเต็มรูปแบบ (dual idempotency, retry, Flex Message)
- **VERIFIED (ONBOARDING_SOP FAQ):** เจ้าของสัตว์ไม่ต้องโหลดแอป — ได้การ์ดผ่าน LINE ที่ใช้อยู่แล้ว
- **INFERENCE — Retention Engine = "Daily Care Report → LINE" loop:**
  - **Daily Care Report + LINE delivery = retention engine หลัก** — ความถี่รายวัน, คุณค่าเห็นได้ชัดทั้งสองฝั่ง (พี่เลี้ยงประหยัดเวลา, เจ้าของสัตว์ได้การ์ดน่ารักทุกวัน), เป็นเหตุผลที่ร้านต้องเปิดระบบทุกวัน
  - **Booking + Room Matrix = operational backbone / entry feature** — เป็นเหตุผลแรกที่ร้านสนใจ (กันห้องชน) และเป็นสิ่งที่ทำให้ระบบ "จริงจัง" แต่ความถี่การใช้งานต่ำกว่า (จองไม่ทุกวัน)
  - **Google Sheets sync = trust layer / anti-lock-in** — ชนะใจตอนขาย (objection #1, #3 ใน SALES_PLAYBOOK) แต่ไม่ใช่เหตุผลที่ทำให้เปิดใช้ทุกวัน
  - **Camera access (Phase 8) = differentiator เสริม** — bounded visitor camera มีอยู่แล้ว แต่ไม่ใช่ core loop
  - **LINE customer self-booking (Phase 11) = convenience layer** — ลูกค้าจองผ่าน LIFF แต่ staff ยังต้อง confirm (Request-First Flow) — ไม่ใช่ retention หลัก
- **RECOMMENDATION:** วัด retention ด้วย "Daily Report ต่อ pet ต่อวัน" และ "LINE delivery success rate" เป็น KPI หลักของ Stage B — ถ้าพี่เลี้ยงส่งรายงานทุกตัวทุกวัน แปลว่าระบบฝังใน workflow จริง

---

## 6. V1 ต้องพึ่ง Project B admission และ billing หรือไม่

- **VERIFIED (COMMERCIAL_READINESS):** "Payment collection absent. No payment/billing integration exists anywhere in the product by design (Phase 9/11 both explicitly scoped it out)." — subscription schema (Phase 13) เป็น state machine เท่านั้น ไม่ใช่การเก็บเงิน
- **VERIFIED (PRD Non-Goal #3):** SlipOK/billing automation/e-Tax → future paid-launch/add-on stage หลัง Core Loop นิ่ง
- **VERIFIED (ROADMAP Stage B):** "Goal: validate Pawstia PMS with real pet hotels **before charging broadly**... Fix operational friction **before payment automation**" และ Stage C (Paid Launch) มี prerequisite: Phase 13 closed + payment integration + commercial rules + monitoring + legal + brand
- **VERIFIED (ROADMAP):** "Do not call technical PILOT READY the same thing as successful real-world beta validation."
- **VERDICT:** **V1 pilot/value validation ไม่ต้องใช้ billing** — ตรงกันข้าม ROADMAP กำหนดให้ Closed Beta (ฟรี 30 วัน + Founding 10) มาก่อน payment integration อย่างชัดเจน
- **VERIFIED (CURRENT_STATUS/IMPLEMENTATION_STATUS):** PS-A2 (Project B admission) เป็น **portfolio governance gate** — "Pawstia is not yet admitted" และ P0a-C1 ยัง open ควบคุมว่า implementation work จะ resume ได้เมื่อไหร่ — นี่เป็น gate ด้าน governance/portfolio ไม่ใช่ข้อกำหนดทางผลิตภัณฑ์ และไม่บล็อกการทำ pilot ทางเทคนิค
- **RECOMMENDATION:** แยกสองเรื่องให้ชัด — (ก) pilot/value validation ปลดล็อกได้ทันทีโดยไม่ต้องรอ billing; (ข) paid production ต้องรอ Stage C gates ทั้งหมด (รวม PS-A2 admission ตาม governance ของ portfolio)

---

## 7. Differentiators vs Implementation Breadth

**Differentiators ที่ควรขับ positioning (VERIFIED — implement + ทดสอบแล้ว):**
1. **15-Second Daily Care Report → LINE Flex Message** (Phase 6, 43/43) — 1–4 รูป + ติ๊ก กิน/ขับถ่าย/อารมณ์ + ส่งการ์ด LINE ใน 15 วิ — ฟีเจอร์ฮีโร่ ไม่มีคู่แข่งรายย่อยรายไหนในตลาดไทยทำได้ในระดับนี้
2. **Visual Room Matrix บน iPad + ป้องกัน double-booking ที่ระดับ database** (Phase 4, 21/21; GiST exclusion constraint + deterministic lock ordering) — กันห้องชนแบบ hard guarantee
3. **Google Sheets Auto-Sync Replica (Pet-Centric)** (Phase 7, 23/23) — ต่อต้าน vendor lock-in ตรงๆ ชนะใจตอนขาย

**Implementation breadth ที่ไม่ควรขับ positioning (VERIFIED — มีอยู่จริง แต่เป็นของเสริม/ของจำเป็นพื้นฐาน):**
- Bounded visitor camera access (Phase 8) — differentiator เสริม ยังไม่ใช่ demand ที่พิสูจน์แล้ว
- LINE LIFF customer self-booking (Phase 11) — convenience; staff ยังต้อง confirm ทุกรายการ
- CSV import/onboarding + audit (Phase 12) — operational enabler (ลด friction ตอน adopt) ไม่ใช่จุดขาย
- Subscription/quota/entitlement engine (Phase 13) — commercial plumbing
- Staff invite/role management, dashboard — table stakes

**RECOMMENDATION:** positioning ต้องยึด 3 ฮีโร่ฟีเจอร์ (Report/LINE, Room Matrix, Sheets sync) — อย่าให้ breadth (camera, LIFF booking, quota engine) เข้ามาเจือจางข้อความขาย

---

## 8. Minimum V1 Finish Line ที่ใช้ได้และขายได้

**สิ่งที่ VERIFIED ว่ามีแล้ว (technical):**
- Core loop ครบ: booking → room matrix → check-in/out → Daily Report → LINE → Sheets sync (Phases 1–12 closed + reviewer-verified; Phase 13 CI-verified 2026-09-03)
- Onboarding/import + integration readiness check (Phase 12, 92/92) — "PILOT READY" ทางเทคนิค
- Pricing + Founding Member package + sales playbook (BUSINESS_MODEL, SALES_PLAYBOOK)

**สิ่งที่ VERIFIED ว่ายังไม่มี (blockers ของ "sellable"):**
- **Zero real-store validation** — ไม่พบหลักฐานการสัมภาษณ์ร้านจริงแม้แต่รายเดียว, ไม่มี pilot store, ไม่มี beta store (BUSINESS_MODEL H1 "สัมภาษณ์ 30 ร้าน" = แผน, ยังไม่ทำ; IMPLEMENTATION_STATUS: "Closed Beta business validation NOT COMPLETED — Technical readiness is not evidence of real-store adoption")
- **Payment collection ไม่มี** (COMMERCIAL_READINESS) — ตาม design แต่ก็แปลว่า "ขายแบบเก็บเงิน" ยังทำไม่ได้
- **Production deployment ไม่ verified/ไม่ launch** (IMPLEMENTATION_STATUS, PRODUCTION_OPERATIONS = pre-production; monitoring/backup/incident/support ยังไม่ setup)
- **Brand/channel ยังไม่พร้อม** — one-pager ระบุ `DRAFT — DO NOT PUBLISH`, LINE OA handle TBD, website TBD, trademark clearance ยังไม่ผ่าน (COMMERCIAL_READINESS)
- **Independent review ของ Phase 13 ยังไม่พบ** (ไม่มี REVIEW-phase13-*.md)

**RECOMMENDATION — Minimum V1 finish line (สองชั้น):**
1. **Pilot finish line (ใกล้ที่สุด):** เปิด Closed Beta กับร้านจริง 1 → 3 → 5 → 10 ร้าน (ROADMAP Stage B) วัด: onboarding time, LINE delivery success, Sheets sync failures, staff learning curve, Daily Report usage, support burden — ใช้ฟรี 30 วัน + Founding 10 @ 990 บ./ด. เป็นข้อเสนอ — **เทคนิคพร้อมแล้ว, เหลือ execution กับร้านจริง**
2. **Paid/sellable finish line (ต้องรอ):** ต่อเมื่อ Stage B ผ่าน (H1–H3 validated) + payment integration + production ops (monitoring/backup/support) + brand/legal/channel พร้อม — ตาม Stage C gates

**INFERENCE:** ณ วันนี้ผลิตภัณฑ์ "ใช้ได้" (pilot-ready) แต่ยัง "ขายไม่ได้" (ไม่มีการเก็บเงิน, ไม่มี brand channel, ไม่มี production ops, และที่สำคัญที่สุด — ยังไม่มีร้านจริงยืนยันว่าใครจะจ่าย)

---

## 9. สรุป Verdict (Product/Customer Lens)

1. **VERIFIED:** ปัญหาที่แก้ชัดเจนและตรงกลุ่ม — โรงแรม/เดย์แคร์ single-store: ห้องชน, ส่งรายงานรายวันวุ่นวาย, กลัว data lock-in
2. **VERIFIED:** ผู้ใช้ = พี่เลี้ยง/พนักงาน (iPad), ผู้ซื้อ = เจ้าของร้าน — เอกลักษณ์ที่ถูกต้อง = **Pet Hotel/Daycare OS** (แคบ), ไม่ใช่ broader Pet PMS
3. **INFERENCE:** Retention engine = **Daily Care Report → LINE loop** (รายวัน); booking/room matrix = entry/backbone; Sheets sync = trust layer; camera/LIFF = เสริม
4. **VERIFIED:** Pilot/value validation **ไม่ต้องใช้ billing** — ROADMAP กำหนด beta ก่อน payment; PS-A2 เป็น governance gate ไม่ใช่ product blocker
5. **VERIFIED:** จุดขาย = 3 ฮีโร่ฟีเจอร์ (Report/LINE, Room Matrix, Sheets sync); breadth ที่เหลืออย่าเอามาขับ positioning
6. **VERIFIED:** Minimum V1 = **Closed Beta กับร้านจริง** — เทคนิค pilot-ready แล้ว แต่ zero real-store validation + ไม่มี payment/brand/production-ops = ยังไม่ "sellable"

**Dissent / Uncertainty:**
- **UNVERIFIED (สำคัญที่สุด):** ไม่มีหลักฐานใดๆ ว่าเจ้าของร้านจริงจะจ่าย 990–1,490 บ./ด. — H1–H4 ทั้งหมดยังเป็นสมมติฐาน ตัวเลข conversion >40% (H2) เป็นเป้า ไม่ใช่ผลวัด
- **UNVERIFIED:** ไม่พบ independent review ของ Phase 13 (REVIEW-phase13-*.md) — CI ผ่านแล้ว แต่ gate "independent PASS" ตาม convention repo ยังไม่เห็นหลักฐาน
- **INFERENCE (ต้องระวัง):** การคาดว่า "Daily Report คือ retention engine" อิงจากโครงสร้างความถี่ของ workflow + ฟีเจอร์ที่ implement — ยังไม่มีข้อมูล usage จริงจากร้านมายืนยัน
- **UNKNOWN:** ไม่มีข้อมูลคู่แข่งจริงในตลาด (ราคา/ฟีเจอร์ของคู่แข่งรายอื่น) — การอ้าง "ไม่มีคู่แข่งรายย่อยทำได้" เป็น inference จากขอบเขตฟีเจอร์ ไม่ใช่ market research
