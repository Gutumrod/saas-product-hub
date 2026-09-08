# DC01 DocCraft — Business/Market Lens Analysis (Round 1)

> **Lens:** Business/Market — revenue model, competition, differentiation, distribution, commercial viability
> **Date:** 2026-09-03
> **Evidence base:** อ่านจาก repo จริง `D:\AI-Workspace\projects\saas-product-hub\products\DocCraft` (docs 13 ไฟล์ตามโจทย์ + BRIEF-sell-ready-execution.md + R0_REPO_INTAKE.md + ค้นหา competitor keywords ทั่ว repo)
> **Label convention:** VERIFIED = มีหลักฐานใน repo / INFERENCE = สรุปจากหลักฐานอย่างมีเหตุผล / UNVERIFIED = ยังไม่มีหลักฐาน / UNKNOWN = ไม่มีข้อมูล / RECOMMENDATION = ข้อเสนอของ lens นี้
> **หมายเหตุ:** CURRENT_STATUS.md อ่านเป็น overlay เท่านั้น ไม่ได้เชื่อตามนั้นโดยไม่ตรวจ — ใช้เฉพาะข้อเท็จจริงที่ cross-check กับ PRD/ROADMAP/PRODUCT_DECISIONS แล้ว

---

## 0. สถานะเชิงพาณิชย์ของโปรดักต์ ณ วันนี้ (ground truth)

- **VERIFIED:** DocCraft ยังไม่ launch — อยู่ในช่วง pre-launch build ตาม ROADMAP; Gate 1, 2, 3, 4 ปิดแล้ว แต่ Phase 4.1 (Business Logo) ยังไม่เริ่ม implement และ Phase 5, 6 ยังไม่ผ่าน (CURRENT_STATUS.md + ROADMAP.md)
- **VERIFIED:** ยังไม่มีผู้ใช้จริง ไม่มี pilot data ไม่มี interview ไม่มี usage evidence ใดๆ ใน repo — PRODUCT_VALIDATION_PLAN.md ระบุว่า PV Gate ยังไม่เปิด และห้ามเปิด Phase 7 จนกว่าจะมี real-user evidence
- **VERIFIED:** ยังไม่มีการรับเงินจริง — billing อยู่ใน Phase 8 และ CUSTOMER_LIFECYCLE_AND_BILLING_POLICY.md ระบุ "ห้ามรับเงินจริงจน pricing/package, lifecycle transitions, payment rail, cancellation/refund policy, entitlement tests และ customer-facing terms ตรงกันครบ"
- **VERIFIED:** ไม่มี competitor analysis / market sizing / TAM-SAM-SOM / channel plan อยู่ใน repo — ผมค้นหา keyword (FlowAccount, PEAK, Mango, Zoho, Wave, คู่แข่ง, WTP, interview, pilot, ผู้ใช้จริง) ทั่ว repo แล้ว ไม่พบเอกสารวิเคราะห์คู่แข่งหรือตลาดแม้แต่ไฟล์เดียว (VERIFIED absence ภายใน repo; หมายเหตุ: absence ใน repo ≠ ไม่มีคู่แข่งในตลาดจริง)

---

## 1. รายได้มาจากไหน และทำไม buyer ถึงจ่าย / จ่ายต่อ

### โมเดลรายได้ตามเอกสาร
- **VERIFIED:** โมเดลที่วางไว้ = Free (local-first core) → Pro (cloud sync, reusable customers/catalog, cross-device access) → paid add-ons หลัง validation (lifecycle conversion, reporting, E-Sign) (BUSINESS_MODEL.md §2, COMMERCIAL_PACKAGING.md §3)
- **VERIFIED:** ราคา hypothesis: ฿290/เดือน, ฿2,490/ปี, ฿1,490 lifetime early-bird (MONETIZATION_AND_PAYMENT_FLOW.md §3)
- **VERIFIED:** กลไกเก็บเงินจริง (entitlement, recurring rail, webhook, reconciliation) ยังไม่ถูกออกแบบ — เป็น contract กำหนด "ต้องมี" ก่อนเปิด Phase 8 เท่านั้น (CUSTOMER_LIFECYCLE_AND_BILLING_POLICY.md, MONETIZATION_AND_PAYMENT_FLOW.md §2)
- **VERIFIED:** PromptPay QR บนเอกสาร = payment instruction ของลูกค้าผู้ใช้ DocCraft ไม่ใช่รายได้ของ DocCraft (PRD §10, MONETIZATION_AND_PAYMENT_FLOW.md §1) — อย่าสับสนว่า QR = monetization

### ทำไม buyer ถึงจ่าย (ตามเหตุผลที่เอกสารวางไว้)
- **VERIFIED:** เหตุผลที่เอกสารวางไว้ = cloud persistence, reusable data, cross-device workflow (COMMERCIAL_PACKAGING.md §3) — คือ "ข้อมูลไม่หาย + ไม่ต้องกรอกซ้ำ + ใช้ได้หลายเครื่อง"
- **UNVERIFIED:** ยังไม่มีหลักฐานว่ากลุ่มเป้าหมาย (freelancer/ช่าง/ร้านงานสั่งทำ/micro-SME) ยอมจ่ายเพื่อ value เหล่านี้ — PRODUCT_VALIDATION_PLAN.md §4 ตั้งคำถามนี้เป็นคำถามที่ "ต้องตอบจากผู้ใช้จริง" ยังไม่ได้ตอบ
- **INFERENCE (สำคัญ):** โมเดลนี้เป็น "freemium ที่ขาย convenience" ไม่ใช่ "ขาย pain ที่บังคับจ่าย" — ฟรี V1 ทำ core loop ได้ครบ (สร้างเอกสาร → preview → print) โดยไม่ต้องจ่ายเลย; สิ่งที่ขายคือความสะดวก (sync/catalog) ไม่ใช่ความจำเป็น (ทำเอกสารได้) → conversion ต้องพึ่ง "ความถี่ใช้ + ความเจ็บปวดเรื่องข้อมูล" ซึ่งยังไม่มี evidence
- **INFERENCE:** จุดที่ buyer จะจ่ายต่อ (retention) ขึ้นกับว่า cloud data กลายเป็น "ของที่ย้ายออกยาก" (switching cost) — แต่เอกสารเองกำหนดนโยบาย export/deletion ต้องมีก่อน paid launch (CUSTOMER_LIFECYCLE_AND_BILLING_POLICY.md §6) ซึ่งจะลด switching cost ลง → เป็นดาบสองคมเชิงพาณิชย์: ต้อง balance ระหว่าง data portability (trust) กับ retention

### ความขัดแย้งที่พบ (ต้องรายงาน)
- **VERIFIED:** SALES_PLAYBOOK.md §3 (demo flow step 6) สอนให้ "แสดง JSON backup เป็น proof ของ data portability" แต่ PRODUCT_DECISIONS.md D-2026-09-03 (owner decision) ซ่อน UI ของ JSON Import/Export ทั้งหมดใน V1 — กล่าวคือ **จุดขาย "data portability" ที่ playbook ใช้โชว์ ไม่มีทางเข้าถึงได้ใน UI จริงของ V1** นี่คือความขัดแย้งระหว่าง marketing doc กับ shipped reality ที่ lens การตลาดต้องระวัง: ถ้าโชว์ demo ตาม playbook จะโชว์สิ่งที่ผู้ใช้จริงเข้าถึงไม่ได้
- **VERIFIED:** PRD §9 ยืนยันว่า JSON Import/Export "ไม่ใช่ V1 customer-facing backup contract" และ UI ถูกซ่อน (D-2026-09-03) → ผู้ใช้ V1 ไม่มีช่องทาง export ข้อมูลของตัวเองที่เห็นได้ชัดเจน (มีแค่ local autosave ใน browser) → ความเสี่ยง trust/data-loss ต่อผู้ใช้ และเป็นจุดอ่อนเชิงขาย

---

## 2. Differentiation จริง vs เครื่องมือ/workaround เดิม

### สิ่งที่เอกสารอ้าง
- **VERIFIED:** Positioning ที่เอกสารวาง = "ทำเอกสารเร็ว ยืดหยุ่น (modular blocks) A4-ready จากมือถือ/คอม โดยไม่ต้องใช้ระบบบัญชีเต็มรูปแบบ" (PRODUCT_ONE_PAGER.md, PRD §1)
- **VERIFIED:** ข้อห้ามเคลม (claim guardrail) แข็งแรงผิดปกติ: ห้ามเคลมประหยัดเวลาเป็นตัวเลขตายตัว, ห้ามเคลมเพิ่ม conversion/cashflow แบบรับประกัน, ห้ามเคลมถูกกฎหมาย/ภาษี 100%, ห้ามเคลม PDF เหมือนกันทุก browser (PRD §14, PRODUCT_ONE_PAGER.md Claim Guardrail) — นี่คือจุดแข็งด้านวินัยการตลาด (VERIFIED)
- **VERIFIED:** V1 ไม่ใช่ e-Tax Invoice/e-Receipt platform และไม่ใช่ระบบบัญชี (PRD §11 non-goals, §2) — Tax Invoice เป็น conditional type ต้อง VAT registered + validation ครบ

### การประเมิน differentiation (lens นี้)
- **UNVERIFIED:** ไม่มีหลักฐานใน repo ว่า "Thai freelancer/ช่าง ใช้ spreadsheet/Word/โปรแกรมบัญชีอยู่จริง และเจ็บปวดกับมันจริง" — เอกสารตั้งสมมติฐาน pain นี้ (SALES_PLAYBOOK §2) แต่ไม่มี interview/field evidence
- **INFERENCE:** differentiation ที่เป็นจริงตาม scope = (1) ไม่ต้อง login ใช้ได้ทันที, (2) mobile-first editor + A4 preview, (3) calculation helper (VAT/WHT/deposit/discount) ที่คนทำ Word/Excel ต้องคำนวณเอง, (4) modular blocks ยืดหยุ่นกว่าระบบบัญชีสำเร็จรูป — ทั้ง 4 ข้อนี้เป็น "ความสะดวก" ไม่ใช่ "ความสามารถที่คู่แข่งทำไม่ได้ถาวร"
- **INFERENCE:** คู่แข่งจริงในตลาดไทย (FlowAccount, PEAK, Mango, Zoho Invoice, Wave, ฟอร์ม Excel/Word ดาวน์โหลดฟรี) ไม่ถูกกล่าวถึงใน repo เลย → ยังไม่มีการวิเคราะห์ว่า DocCraft ชนะ/ต่างจากใครด้วยอะไร — differentiation ณ วันนี้เป็น "positioning statement" ไม่ใช่ "verified competitive moat"
- **INFERENCE:** จุดที่อาจต่างจริงเชิงตลาด = "ฟรี + ไม่ต้องสมัคร + ใช้หน้างานจากมือถือ" สำหรับ segment ที่ไม่อยากผูกกับระบบบัญชี (ช่าง/ร้านงานสั่งทำ) — แต่ segment นี้มี willingness-to-pay ต่ำโดยธรรมชาติ (เป็นกลุ่มที่ใช้ของฟรี/Excel อยู่แล้ว) → differentiation ที่ดึงดูดการใช้งาน ≠ differentiation ที่ดึงดูดการจ่ายเงิน
- **UNVERIFIED:** ยังไม่มี evidence ว่า "A4 print ผ่าน browser" เป็นที่ยอมรับของกลุ่มเป้าหมาย (บางคนอาจต้องการไฟล์ PDF จริง/ส่งไลน์ให้ลูกค้า) — PRD เลือกไม่ generate PDF ใน V1 (window.print() อย่างเดียว) ซึ่งเป็น decision ทางเทคนิคที่มีผลเชิงพาณิชย์ (ผู้ใช้ที่ต้องการ PDF ไฟล์อาจรู้สึกว่า "ได้แค่พิมพ์") ต้อง validate กับผู้ใช้จริง

---

## 3. ราคา (฿290/เดือน, ฿2,490/ปี, ฿1,490 lifetime) — contract หรือ hypothesis?

- **VERIFIED:** เป็น **HYPOTHESIS อย่างชัดเจนและซ้ำกัน 5 จุด** — BUSINESS_MODEL.md §2 ("ให้ถือเป็น HYPOTHESIS ไม่ใช่ราคาที่อนุมัติถาวร"), COMMERCIAL_PACKAGING.md §5 ("remain hypotheses, not approved public prices"), MONETIZATION_AND_PAYMENT_FLOW.md §3 ("ตัวเลขต่อไปนี้เป็น hypothesis เท่านั้น"), PRODUCT_ONE_PAGER.md §Pricing ("ยังไม่ประกาศราคา Pro เป็น contract... อยู่ในสถานะ commercial hypothesis"), BRIEF-sell-ready-execution.md §2 ("ห้าม lock ราคาสาธารณะจาก hypothesis โดยไม่มี validation/cost evidence")
- **VERIFIED:** ยังไม่มี evidence ใดที่รองรับตัวเลขเหล่านี้: ไม่มี willingness-to-pay data, ไม่มี cost model, ไม่มี payment fee จริง, ไม่มี retention/churn (BUSINESS_MODEL.md §3, MONETIZATION_AND_PAYMENT_FLOW.md §3)
- **VERIFIED:** Lifetime deal (฿1,490) ถูกห้ามขายจนกว่าจะมี cost model + entitlement persistence + discontinuation policy (COMMERCIAL_PACKAGING.md §7, BRIEF-sell-ready-execution.md §2) — ตัวเลข lifetime นี้เป็น hypothesis ที่มี guardrail ห้าม execute
- **INFERENCE:** ตัวเลข ฿290/เดือน อยู่ในช่วงราคาโปรแกรมบัญชีไทยระดับ entry (FlowAccount/PEAK เริ่มหลักร้อยบาท/เดือน) — เป็นราคาที่ "สมเหตุสมผลเชิงตลาด" แต่ **ไม่มีหลักฐานว่า segment เป้าหมาย (ช่าง/ฟรีแลนซ์) ยอมจ่าย**; กลุ่มนี้คุ้นเคยของฟรี (Excel template, ฟอร์ม Word) มากกว่า
- **RECOMMENDATION:** อย่านำตัวเลขทั้ง 3 ไปใช้ในงาน council นี้เป็น "ราคา" — ใช้เป็น "pricing hypothesis ที่ต้อง validate" เท่านั้น; ตัวเลขที่ควรทดสอบก่อนคือ willingness-to-pay ของ segment จริง ผ่าน pilot (ตาม PRODUCT_VALIDATION_PLAN.md §6 "Open paid experiment")

---

## 4. Commercial viability ของ local-first free V1 + paid cloud/Pro หลัง

### จุดแข็งของกลยุทธ์นี้ (ตามหลักฐาน)
- **VERIFIED:** ต้นทุน V1 ต่ำมากโดยออกแบบ — ไม่มี backend, ไม่มี Supabase, ไม่มี payment gateway, ไม่มี PDF engine ใน Phase 1–6 (SYSTEM_ARCHITECTURE.md §1, §7) → free tier ไม่มี infrastructure cost ต่อผู้ใช้จริงๆ (จนกว่าจะเปิด Phase 7)
- **VERIFIED:** กลยุทธ์ "free ก่อน → วัด → ค่อยลงทุน cloud" ถูกเขียนเป็น gate บังคับ: Phase 7 เปิดได้ต่อเมื่อ PV Gate ผ่าน (repeat usage + recurring pain จากผู้ใช้จริงหลายราย) (ROADMAP.md PV, PRODUCT_VALIDATION_PLAN.md §6) — นี่คือการป้องกัน "build แล้วไม่มีคนใช้" ที่ดี
- **VERIFIED:** หลักการ "ห้ามทำให้ free core พิการเพื่อบังคับขาย Pro" (COMMERCIAL_PACKAGING.md §1, BRIEF-sell-ready-execution.md §2) — ลดความเสี่ยง reputation damage

### จุดอ่อน/ความเสี่ยงเชิงพาณิชย์ของกลยุทธ์นี้
- **INFERENCE (ความเสี่ยงหลัก):** **Free V1 เป็นผลิตภัณฑ์ที่ "สมบูรณ์ในตัวเอง" สำหรับ segment เป้าหมาย** — ฟรีแลนซ์/ช่างที่ทำเอกสารเดือนละไม่กี่ฉบับ อาจพอใจกับ free ไปตลอดกาล เพราะ core loop ครบ (สร้าง → preview → print) และไม่มี account/cloud ให้ผูก → **ไม่มีเหตุผลเชิงโครงสร้างที่จะจ่าย**; โมเดลพึ่งพา "ความถี่ใช้สูง + ต้องการ sync" ซึ่งเป็นสมมติฐานที่ยังไม่พิสูจน์
- **INFERENCE:** การไม่มี login/account ใน V1 (PRD §11 non-goal) หมายความว่า **ไม่มีช่องทางติดตามผู้ใช้เพื่อ conversion** — ไม่มี email, ไม่มี identity, ไม่มีทาง re-engage; ผู้ใช้ที่ใช้ free แล้วหายไป = หลุดจาก funnel ตลอดกาล (metrics ใช้ anonymous/consented identifier เท่านั้น — MVP_METRICS_AND_ANALYTICS.md §5) → conversion path จาก free → Pro อ่อนแอโดยโครงสร้าง
- **VERIFIED:** ยังไม่มี distribution/channel strategy ใน repo — SALES_PLAYBOOK.md เป็น messaging guide ล้วน ไม่มีช่องทาง (Facebook groups ของช่าง/ฟรีแลนซ์, LINE OA, marketplace, SEO) ไม่มี acquisition plan → "ถ้าสร้างเสร็จแล้วใครจะรู้จัก" ยังไม่มีคำตอบ
- **INFERENCE:** จุดเปลี่ยน (pivot point) ของ viability อยู่ที่ PV Gate: ถ้า pilot ไม่พบ repeat usage → เอกสารเองสั่งให้ "iterate V1 โดยไม่เปิด Phase 7" (PRODUCT_VALIDATION_PLAN.md §6) → กลยุทธ์นี้มี exit ramp ที่ชัดเจน = จุดแข็งเชิงวินัย แต่ก็หมายความว่า **viability ยังเป็น UNKNOWN จนกว่า pilot จะผ่าน** — ณ วันนี้ viability ยังพิสูจน์ไม่ได้
- **RECOMMENDATION:** viability ของ "free local-first → paid cloud" ควรถูกมองเป็น "การทดลองที่ออกแบบมาดี ยังไม่ใช่ธุรกิจที่พิสูจน์แล้ว"; ตัวชี้ขาดคือ repeat usage + WTP จาก pilot จริง ไม่ใช่ code ที่ผ่าน gate

---

## 5. ความเสี่ยงทางธุรกิจใหญ่สุด

จัดอันดับจากหลักฐาน (เรียงตามความรุนแรง):

1. **INFERENCE — ความเสี่ยงใหญ่สุด: ไม่มีเหตุผลเชิงโครงสร้างให้กลุ่มเป้าหมายจ่ายเงิน (conversion risk)**
   - Free V1 ครบวงจร ไม่มี account ไม่มี lock-in; segment เป้าหมาย (ช่าง/ฟรีแลนซ์/micro-SME) คุ้นเคยของฟรี; สิ่งที่ Pro ขาย (sync/catalog/cross-device) เป็น convenience ไม่ใช่ necessity → ความเสี่ยงที่ "มีคนใช้เยอะ แต่จ่ายน้อย/ไม่จ่าย" สูง
   - เอกสารเองยอมรับความเสี่ยงนี้โดยปริยาย (PV Gate กำหนด "Do not open Phase 7: cloud feature เป็นเพียงความเห็นเชิงสมมติ" — PRODUCT_VALIDATION_PLAN.md §6)

2. **INFERENCE — ไม่มี evidence ว่า pain ที่เอกสารอ้างเป็น pain จริง (market validation risk)**
   - ไม่มี interview, ไม่มี competitor analysis, ไม่มี field evidence ว่า "Thai freelancer/ช่างเจ็บปวดกับการทำเอกสารด้วย Word/Excel จริง" — ทั้งโปรดักต์สร้างจากสมมติฐาน pain (SALES_PLAYBOOK §2) ที่ยังไม่ถูกพิสูจน์

3. **VERIFIED — Data portability ถูกซ่อนจากผู้ใช้ (trust + legal risk)**
   - D-2026-09-03 ซ่อน JSON Import/Export UI; ผู้ใช้ V1 ไม่มีทาง export ข้อมูลตัวเองที่เห็นได้ → ถ้า browser data ถูกล้าง ข้อมูลหายถาวรโดยผู้ใช้ช่วยไม่ได้; ขัดกับ playbook ที่โชว์ "data portability" เป็นจุดขาย; เป็นความเสี่ยง trust และอาจเป็น legal exposure (ข้อมูลธุรกิจ/ลูกค้าของผู้ใช้)

4. **INFERENCE — ไม่มี distribution plan (go-to-market risk)**
   - ไม่มี channel/acquisition strategy ใน repo; product ที่ดีแต่ไม่มีคนรู้จัก = dead on arrival; เอกสารทั้งหมดโฟกัส build/validation แต่ไม่มี "ใครจะพาไปหาผู้ใช้"

5. **VERIFIED — Lifetime deal เป็นระเบิดเวลาเชิงหนี้สิน (ถ้าถูกปลด guardrail ก่อนมี cost model)**
   - ฿1,490 lifetime ถูกห้ามขายจนกว่าจะมี cost model + entitlement + discontinuation policy (COMMERCIAL_PACKAGING.md §7) — guardrail ดี แต่ตัวเลข lifetime ยังลอยอยู่ในเอกสารการตลาด → ต้องมั่นใจว่าไม่มีใครขายก่อน guardrail ครบ

6. **INFERENCE — ความเสี่ยงรอง:** browser print-only (ไม่มี PDF generation) อาจไม่ตรงความคาดหวังผู้ใช้ที่ต้องการไฟล์ PDF ส่งไลน์/เมล; และ "free ไม่ต้อง login" ทำให้ไม่มี data moat → คู่แข่ง (FlowAccount/PEAK/Zoho) ที่มี free tier + ecosystem อยู่แล้วสามารถ copy feature ได้

---

## 6. Destination identity เชิงพาณิชย์: local-first document studio / hosted SaaS / อื่น?

- **VERIFIED:** เอกสารวาง destination ไว้ชัดเจนเป็น **เส้นทางสองชั้น**: V1 = local-first document studio (free, no-login, browser-first) → ปลายทางเชิงพาณิชย์ = **hosted SaaS (Pro cloud)** ที่ขาย cloud sync/catalog/cross-device ผ่าน Phase 7–8 (ROADMAP.md, COMMERCIAL_PACKAGING.md, BRIEF-sell-ready-execution.md §1 "SELL READY = ผู้ใช้สามารถสมัคร ใช้ Pro cloud workflow จ่ายเงิน ต่ออายุ ยกเลิก...")
- **VERIFIED:** BRIEF-sell-ready-execution.md §1 ให้นิยาม "SELL READY" = paid commercial launch ที่รับเงินได้จริง — นั่นคือ destination ที่เอกสารประกาศ
- **INFERENCE:** จากมุม commercial lens: **primary identity ปลายทาง = hosted SaaS (Pro cloud) ที่มี local-first free เป็น funnel/onboarding ชั้นล่าง** — local-first ไม่ใช่ destination แต่เป็น "trojan horse" เพื่อลด friction เริ่มใช้; อย่างไรก็ตาม identity นี้ยังเป็น "intended destination" ไม่ใช่ "achieved identity" เพราะยังไม่มีผู้ใช้/รายได้/cloud
- **INFERENCE:** มีทางเลือก identity อื่นที่เอกสารไม่ได้เลือกอย่างชัดเจน: (ก) "free tool ที่เป็น standalone utility" (เหมือนเครื่องคิดเลข/เทมเพลตออนไลน์ — ไม่มีรายได้ ใช้เป็น lead magnet ของอย่างอื่น), (ข) "paid document tool ตรงๆ" (ขายครั้งเดียว/รายเดือนโดยไม่ต้องมี cloud) — เอกสารเลือกเส้นทาง (SaaS cloud) โดยปริยาย แต่ยังไม่มี evidence ว่าเส้นทางนี้เป็นเส้นทางที่ตลาดจะจ่าย
- **RECOMMENDATION:** Council ควรตัดสินใจ destination อย่างใดอย่างหนึ่งโดยชัดเจน เพราะ identity ส่งผลต่อ architecture (Phase 7 backend), ราคา, และ metric ที่วัด — เอกสารปัจจุบัน "ล็อก" ไว้ที่ SaaS cloud ผ่าน gate แต่ยังเปิดโอกาสให้ PV Gate พลิกกลับเป็น "iterate V1" ได้ (ซึ่งเท่ากับเลือก identity แบบ utility)

---

## 7. Verdict สรุป (lens Business/Market)

- **VERIFIED:** เอกสารเชิงพาณิชย์ของ DocCraft มีวินัยสูงผิดปกติ — ทุกตัวเลขการเงินถูกติดป้าย hypothesis, มี guardrail ห้ามเคลมเกินจริง, มี gate บังคับให้ validate ก่อนลงทุน cloud/billing → **โครงสร้างการตัดสินใจเชิงพาณิชย์ดี**
- **UNVERIFIED:** แต่ทุกสมมติฐานเชิงพาณิชย์หลักยังไม่ถูกพิสูจน์: (1) pain ของ segment จริง, (2) willingness-to-pay, (3) repeat usage, (4) ราคา, (5) distribution — **ณ วันนี้ DocCraft เป็น "product ที่ build เก่ง ยังไม่ใช่ business ที่พิสูจน์แล้ว"**
- **INFERENCE:** ความเสี่ยงใหญ่สุด = conversion (ฟรี → จ่าย) เพราะ free V1 สมบูรณ์ในตัวเอง + ไม่มี account/lock-in + segment คุ้นเคยของฟรี
- **INFERENCE:** ความขัดแย้งที่ต้องแก้ก่อน launch: playbook โชว์ JSON backup เป็นจุดขาย แต่ UI ถูกซ่อน (D-2026-09-03) — ต้องเลือกอย่างใดอย่างหนึ่ง (surface กลับ หรือแก้ playbook)
- **RECOMMENDATION:** Council ควรยืนยัน destination = "hosted SaaS (Pro cloud) ที่มี local-first free เป็น funnel" เป็น working hypothesis แต่กำหนด PV Gate เป็นจุดตัดสินใจจริง (ไม่ใช่แค่พิธีกรรม) และเพิ่มงาน distribution/WTP testing เข้า roadmap ก่อน Phase 7 — เพราะ viability ทั้งหมด hinge อยู่ที่ pilot จริง

### Dissent / ความไม่แน่นอน
- ผมไม่เห็นด้วยกับน้ำหนักที่เอกสารให้ "cloud sync" เป็น value หลักของ Pro โดยไม่มี evidence — ใน segment ช่าง/ฟรีแลนซ์ "reusable catalog + ไม่กรอกซ้ำ" อาจมีค่าเท่ากันหรือมากกว่า sync แต่เอกสารจัดให้ catalog เป็น Phase 7 เช่นกัน; ควรทดสอบ WTP แยกต่อ capability (ตาม PRODUCT_VALIDATION_PLAN.md §4 ข้อ 3–5) ก่อนล็อก Pro scope
- ความไม่แน่นอนหลักของผม: ตัวเลข ฿290/เดือน อาจสูงหรือต่ำเกินไปสำหรับ segment นี้ — ไม่มีข้อมูลใดใน repo ที่จะบอกได้; ต้องได้จาก pilot เท่านั้น
- ข้อจำกัดของ lens นี้: ผมประเมินจากเอกสารใน repo เท่านั้น ไม่ได้ออกไปสำรวจตลาดจริง (นอกขอบเขตงาน) — การวิเคราะห์คู่แข่ง/ตลาดจริงของผมจึงเป็น INFERENCE จากความรู้ทั่วไป ไม่ใช่ VERIFIED
