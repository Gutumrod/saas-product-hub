# DC01 DocCraft — Product/Customer Lens Analysis (Round 1)

> **Lens:** Product/Customer — user, buyer, pain, workflow, adoption, willingness to pay
> **Date:** 2026-09-03
> **Repo evidence read:** PRODUCT_ONE_PAGER.md, PRD.md, BUSINESS_MODEL.md, COMMERCIAL_PACKAGING.md, CUSTOMER_LIFECYCLE_AND_BILLING_POLICY.md, SYSTEM_ARCHITECTURE.md, ROADMAP.md, PRODUCT_DECISIONS.md, CURRENT_STATUS.md, GATE3_INDEPENDENT_FINAL_REVIEW_2026-09-01.md, GATE4_INDEPENDENT_REVIEW_2026-08-26.md, PRODUCT_VALIDATION_PLAN.md, SALES_PLAYBOOK.md, MONETIZATION_AND_PAYMENT_FLOW.md, MVP_METRICS_AND_ANALYTICS.md, ONBOARDING_AND_SUPPORT.md, BRIEF-phase5-promptpay-qr.md, package.json, src/ structure, git log/status
> **Label convention:** VERIFIED / INFERENCE / UNVERIFIED / RECOMMENDATION — ทุกข้อความต้องมี label; ไม่มี evidence = UNKNOWN/UNVERIFIED

---

## 0. สถานะ repo ที่ cross-check แล้ว (ไม่เชื่อ CURRENT_STATUS.md ตามลำพัง)

- **VERIFIED:** HEAD = `b942a22` ("docs: record owner decision D-2026-09-03 to keep JSON backup controls hidden..."), branch `master`, working tree clean (git log/status ตรวจสด 2026-09-03)
- **VERIFIED:** CURRENT_STATUS.md (2026-09-03) อ้าง HEAD `ceeb2a1` — ล้าสมัย 3 commits; commits หลัง (`edaee15`, `ea5f513`, `b942a22`) เปลี่ยนเฉพาะ `docs/` (diff stat ceeb2a1..HEAD = 10 ไฟล์ docs เท่านั้น, 217 insertions) — **ไม่มี code เปลี่ยน** ดังนั้นข้อสรุปด้าน code state ของ CURRENT_STATUS.md ยังใช้ได้ แต่ HEAD reference ในไฟล์เก่า
- **VERIFIED:** Gate 3 PASS/CLOSED — GATE3_INDEPENDENT_FINAL_REVIEW_2026-09-01.md: 118/118 unit, 33/33 E2E, typecheck/lint/build PASS, native Chrome print evidence (5 screenshots)
- **VERIFIED:** Gate 4 PASS — GATE4_INDEPENDENT_REVIEW_2026-08-26.md: item-image pipeline, schema v2, migration, quota-failure, JSON round-trip ผ่าน (32/32 E2E ณ ตอนนั้น)
- **VERIFIED:** Phase 4.1 (Business Logo) — approved V1 insertion (ROADMAP.md L109) แต่ **ยังไม่ implement**: มีแค่ BRIEF-phase4.1-business-logo-branding-block.md, ไม่มี evidence file, ไม่มี logo code ใน src/ (grep src/ ไม่พบ branding/logo pipeline)
- **VERIFIED:** Phase 5 (PromptPay QR) — **PREPARED — NOT OPENED** (BRIEF-phase5-promptpay-qr.md L4); grep `qrcode|emv|crc|promptpay` ใน src/, tests/, app/ **ไม่พบ implementation** — PaymentSection.tsx มีแค่ textarea `paymentInstructions` (ไม่มี QR generator)
- **VERIFIED:** ไม่มี backend: app/ มีแค่ globals.css, layout.tsx, page.tsx (static, ไม่มี api routes); package.json dependencies = next/react/react-dom เท่านั้น (ไม่มี supabase, auth, payment libs); ไม่พบ .env
- **VERIFIED:** สิ่งที่ build จริง (src/): domain (document schema/types, calculation, tax, validation, fixtures), persistence (storage, migration, validation, import-export, errors), image (item-image pipeline), ui (editor + 7 sections + BlockVisibilityControls, preview/DocumentPreview) — ตรงกับ Phase 1–4 scope

---

## 1. ปัญหาที่แก้ และแก้ให้ใคร

- **VERIFIED (PRD.md §1, PRODUCT_ONE_PAGER.md L8):** DocCraft แก้ปัญหา "การทำเอกสารธุรกิจ (ใบเสนอราคา/ใบแจ้งหนี้/ใบเสร็จ/ใบงาน) จากมือถือหรือคอม โดยไม่ต้องใช้ระบบบัญชีเต็มรูปแบบ" ให้กับ ฟรีแลนซ์, ช่าง, ร้านงานสั่งทำ, ธุรกิจขนาดเล็ก (micro-SME)
- **VERIFIED (PRD.md §1 L15):** จุดขายหลัก = เริ่มใช้ได้เร็ว ไม่ต้องสมัครสมาชิก งานหลักทำใน browser
- **VERIFIED (PRD.md §2 L21):** V1 ไม่รับประกันว่าเป็นระบบบัญชี/ภาษี/e-Tax ที่ทดแทนผู้ทำบัญชี — positioning ชัดเจนว่าเป็น "document studio" ไม่ใช่ accounting tool
- **INFERENCE:** ปัญหาที่แท้จริงที่เอกสารอ้างคือ "friction ในการจัดหน้าเอกสารซ้ำๆ" (SALES_PLAYBOOK.md §2: "ไม่อยากจัดหน้า Word/Excel ซ้ำ") — ยังไม่มี evidence จากผู้ใช้จริงว่าปัญหานี้เจ็บจริงแค่ไหน (ดู §6)

## 2. ใครคือ primary user และใครคือ buyer

- **VERIFIED (ทุก commercial doc):** เอกสารทั้งหมดสมมติ **user = buyer = ผู้ประกอบการรายเล็กที่ทำเอกสารเอง** (freelancer/ช่าง/ร้าน/ธุรกิจเล็ก) — ไม่มี evidence แยก persona ของผู้จ่ายเงินออกจากผู้ใช้
- **UNVERIFIED:** ไม่มี evidence ว่า buyer อาจเป็นคนอื่น (เช่น เจ้าของร้านจ่ายให้ลูกจ้างใช้, หรือผู้ทำบัญชี/เลขาเป็น user) — เอกสารไม่มี persona/user-journey แยก
- **RECOMMENDATION:** ก่อน Phase 8 ต้องแยก user/buyer ให้ชัด — ถ้า user = ช่างหน้างาน (มือถือ) แต่ buyer = เจ้าของร้าน กลไกการขายและ pricing จะต่างจากกรณี user=buyer

## 3. เอกลักษณ์/จุดหมายหลักของผลิตภัณฑ์ (product identity/destination)

- **VERIFIED (SYSTEM_ARCHITECTURE.md L6, L10, L30; PRD.md §1):** จุดหมาย = **browser-first, local-first document studio** — V1 ทำงานครบโดยไม่ login, ไม่ใช้ Supabase, ไม่มี backend
- **VERIFIED (SYSTEM_ARCHITECTURE.md L49):** "ไม่มี backend dependency ใน V1"
- **VERIFIED (PRD.md §11):** login/account, cloud sync, subscription billing เป็น explicit V1 non-goals
- **VERIFIED (COMMERCIAL_PACKAGING.md §1):** "Free V1 is the intended local-first core" — hosted SaaS เป็น Phase 7+ destination หลัง validation
- **VERDICT:** identity หลัก = **local-first document studio (browser-based)**; hosted SaaS เป็น destination ระยะหลังที่ยังไม่มี evidence รองรับ

## 4. Core value loop

- **VERIFIED (PRD.md §1 L13, PRODUCT_ONE_PAGER.md L11):** `เลือกประเภทเอกสาร → กรอกข้อมูล → เปิด/ปิดบล็อก → ตรวจยอด → Preview A4 → Print (Save as PDF ผ่าน browser dialog เมื่อรองรับ)`
- **VERIFIED (SYSTEM_ARCHITECTURE.md L13):** runtime เดียวกัน: `Editor State → Domain Validation/Calculation → A4 Preview → Local Persistence → window.print()`
- **VERIFIED (PRODUCT_VALIDATION_PLAN.md §3):** funnel ที่ต้องวัด = `Visit → Create document → Preview → Print/Save via browser → Return and create again`; Activation = สร้างเอกสาร valid + ถึง preview/print ใน session แรก; Repeat use = กลับมาสร้าง/แก้ในวัน/สัปดาห์ถัดไป
- **INFERENCE:** loop นี้เป็น "create-and-print" ต่อเนื่อง — มูลค่าอยู่ที่การกลับมาสร้างเอกสารใหม่ซ้ำ (repeat), ไม่ใช่ feature เดี่ยว

## 5. Minimum V1 finish line ที่ usable และ sellable

- **VERIFIED (PRD.md §2 L19):** V1 "ใช้ได้" = ผู้ใช้ใหม่สร้างเอกสารถูกต้องตามข้อมูลที่กรอก → ตรวจ preview → เปิด browser print dialog → พิมพ์ได้โดยไม่ต้อง login; draft ไม่หายจากการ refresh ปกติ
- **VERIFIED (PRD.md §13):** 11 acceptance gates (tax state, calculation suite, compact layout 375–430px/431–1023px, A4 print ไม่มี editor UI รั่ว, print dialog + Save as PDF ผ่าน environment, refresh restore, storage failure, JSON round-trip, PromptPay vectors, no-login/no-backend E2E, business logo)
- **VERIFIED (ROADMAP.md):** ลำดับ gate: Phase 1–4 ผ่านแล้ว (Gate 3, 4 PASS) → **ยังต้องผ่าน Phase 4.1 (logo), Phase 5 (PromptPay), Phase 6 (hardening)** ก่อน release
- **VERIFIED (SALES_PLAYBOOK.md §1):** ก่อน Phase 6 ต้องใช้ prototype/demo qualifier ห้ามสื่อว่า release พร้อมใช้จริง
- **VERDICT:** minimum sellable V1 = **Phase 6 ผ่านครบ** (รวม logo + PromptPay + hardening) — ตอนนี้ยังอยู่ที่ "pre-release, ผ่าน 4 จาก ~6 phase" ไม่ใช่ sellable
- **RECOMMENDATION:** V1 finish line ที่ควร lock = PRD §13 gates ครบ 11 ข้อ + Phase 6 E2E smoke; อย่าขายก่อน Phase 6 ตาม playbook

## 6. Segment ไหนมี paid pain แรงสุด

- **UNVERIFIED:** ไม่มี evidence จากผู้ใช้จริง — ยังไม่มี pilot, ไม่มี analytics data, ไม่มี interview (PRODUCT_VALIDATION_PLAN.md ยังเป็น contract ยังไม่เริ่ม execution; MVP_METRICS_AND_ANALYTICS.md ระบุว่า telemetry ยังไม่เปิด — "Candidate events เมื่อ analytics ถูกเปิดจริง")
- **VERIFIED (PRODUCT_VALIDATION_PLAN.md §2):** ต้องมีผู้ใช้จากอย่างน้อย 3 กลุ่ม (freelancer/contractor, custom workshop/service shop, micro-SME) ก่อนสรุป product-market fit; ห้ามสรุปจากกลุ่มเดียว
- **INFERENCE (จาก pain profile ใน SALES_PLAYBOOK.md §2):** สองกลุ่มที่มี pain เฉพาะชัดเจนที่สุด = **custom workshops** (ต้องใส่รูปงาน รายการ มัดจำ เงื่อนไขยืดหยุ่น — ตรงกับ modular blocks + item image + deposit ที่ V1 สร้างจริง) และ **field contractors** (ต้องออกเอกสารหน้างานจากมือถือ — ตรงกับ mobile editor) ส่วน freelancer/micro-SME มี pain "ไม่อยากจัดหน้า Word/Excel" ซึ่งเบากว่าและมี workaround ฟรีอยู่แล้ว
- **RECOMMENDATION:** pilot ควรโฟกัส custom workshop + field contractor ก่อน (pain เฉพาะ + ตรงกับ capability ที่ build จริง); อย่าเดา willingness-to-pay จนมี interview/event evidence

## 7. Hosted cloud ควรอยู่ใน V1 หรือหลัง local-first loop ที่ขายได้

- **VERIFIED (ROADMAP.md PV Gate L79):** "Phase 7 ห้ามเปิดเพียงเพราะ Phase 6 code ผ่าน ต้องมี real-user evidence แสดง repeat usage และ recurring pain ที่ justify Cloud/Pro investment; ไม่งั้น iterate V1 โดยไม่เปิด Phase 7"
- **VERIFIED (COMMERCIAL_PACKAGING.md §1):** Free local-first core กลายเป็น validated baseline หลัง Phase 6 + Pilot Validation evidence เท่านั้น; paid packaging ต้อง charge ค่า incremental value (cloud persistence, reusable data, cross-device) ไม่ใช่การตัด core
- **VERIFIED (BUSINESS_MODEL.md §4):** คำถาม validation ข้อ 5 = "cloud sync มีมูลค่าพอเป็น subscription หรือไม่" — ยังไม่มีคำตอบ
- **VERDICT:** **hosted cloud ต้องอยู่หลัง sellable local-first loop** — นี่คือลำดับที่ถูกต้องตาม evidence; ไม่มี evidence ใดสนับสนุนการเร่ง cloud เข้า V1
- **RECOMMENDATION:** ยืนยันลำดับ local-first → pilot → PV gate → Phase 7; ห้ามเปิด Phase 7 ด้วยเหตุ "ต้องมี cloud ถึงจะขายได้" เพราะยังไม่มี evidence ว่า cloud เป็น pain ที่คนจ่ายเงิน

## 8. Document workflow ไหนสร้าง repeat usage (ไม่ใช่ one-off)

- **UNVERIFIED:** ไม่มี evidence วัด document type ที่ใช้ซ้ำ (MVP_METRICS_AND_ANALYTICS.md ยังไม่เปิด telemetry; event `document_started` พร้อม type ยังไม่เก็บ)
- **INFERENCE (จากธรรมชาติของธุรกิจ + V1 scope):**
  - **Work Order (ใบงาน)** สำหรับช่าง/ร้านซ่อม/งานสั่งทำ = recurring ตามจำนวนงาน — repeat ตามธรรมชาติ
  - **Quotation → Invoice** สำหรับงานที่ต้องเสนอราคาก่อนแล้วเก็บเงินทีหลัง = repeat ต่อเนื่อง (แต่ V1 ไม่มี lifecycle conversion — PRD.md §11 non-goal — ผู้ใช้ต้องสร้างใหม่เองทุกครั้ง ซึ่งเป็นทั้ง friction และโอกาส)
  - **Receipt** = ตามยอดขายรายวันสำหรับร้านค้า
- **INFERENCE:** เอกสารที่ "ต้องออกซ้ำทุกงาน/ทุกวัน" (work order, quotation, receipt) สร้าง repeat มากกว่าเอกสาร one-off; แต่ต้องวัดจริง
- **RECOMMENDATION:** เปิด telemetry แบบ anonymous minimal (ตาม MVP_METRICS_AND_ANALYTICS.md §5 mode 2) ตั้งแต่ pilot เพื่อวัด `document_started` per type + repeat — นี่คือ evidence ชิ้นเดียวที่จะตอบคำถามนี้ได้จริง

## 9. Branding/logo, PromptPay QR, persistence, print/PDF, backup — ตำแหน่งใน paid value proposition ถูกต้องไหม

### 9.1 Branding/logo
- **VERIFIED (PRD.md §12 L210):** "baseline single business logo เป็น V1 capability แล้ว" — logo เป็น **V1 free capability** (Phase 4.1 ยังไม่ implement แต่เป็น approved V1 scope)
- **VERIFIED (PRD.md §11 L195):** สิ่งที่เกิน V1 (multiple logos, watermarks, org-wide brand kit, free-form positioning) เป็น non-goal/deferred
- **VERDICT:** ตำแหน่งถูกต้อง — logo พื้นฐานเป็น free V1, การ custom เกินพื้นฐานเป็น paid/deferred หลัง validation; **แต่ยัง implement ไม่เสร็จ** (Phase 4.1 ยังไม่เปิด) — ยังไม่ใช่ selling point ได้

### 9.2 PromptPay QR
- **VERIFIED (PRD.md §10):** PromptPay QR = payment instruction ของผู้ใช้ให้ลูกค้าของเขา ไม่ใช่ subscription ของ DocCraft; V1 generate client-side, optional amount (deposit/net payable), ไม่ยืนยันการรับเงิน
- **VERIFIED (BRIEF-phase5-promptpay-qr.md L4):** Phase 5 PREPARED — NOT OPENED; ยังไม่มี code
- **VERDICT:** ตำแหน่งถูกต้อง (เป็น V1 free capability ที่เพิ่มมูลค่าให้เอกสาร ไม่ใช่ paid feature) — แต่ยังไม่พร้อมขายจน Phase 5 ผ่าน gate

### 9.3 Persistence (local autosave)
- **VERIFIED (GATE4 review §3.5):** autosave/restore, quota-failure preserves in-memory state, migration v1→v2 ผ่าน
- **VERIFIED (PRD.md §9 L162, PRODUCT_DECISIONS.md D-2026-09-03):** JSON Import/Export = **capability-held-but-not-exposed** — UI controls ถูกซ่อนตาม owner decision; **ไม่ใช่ V1 customer-facing backup contract**
- **VERDICT:** local autosave เป็น free V1 core ที่ถูกต้อง; การ reposition JSON backup ออกจาก customer-facing contract สอดคล้องกับ reality (feature ไม่ได้ถูกใช้จริง) — แต่มีผลข้างเคียงต่อ sales (ดู 9.5)

### 9.4 Print/PDF
- **VERIFIED (PRD.md §8, SYSTEM_ARCHITECTURE.md §5):** browser native print (window.print()) เท่านั้น; **ไม่มี PDF generator ใน V1**; Save as PDF ผ่าน browser/OS dialog; Chrome/Edge = reference environment
- **VERIFIED (GATE3 review):** native print ผ่าน — 1 หน้า/หลายหน้า ไม่มี editor UI รั่ว, PDF-capable destination มี evidence
- **VERDICT:** ตำแหน่งถูกต้องและเป็นจริงตาม build — ต้องระวัง marketing ไม่เคลม "PDF เหมือนกันทุก browser" (PRD §14 guardrail)

### 9.5 Backup — จุดขัดแย้งที่ต้อง flag
- **VERIFIED (SALES_PLAYBOOK.md §3 step 6):** demo flow ยังบอก "แสดง JSON backup เป็น proof ของ data portability"
- **VERIFIED (PRODUCT_DECISIONS.md D-2026-09-03):** JSON backup UI controls ถูกซ่อน — ผู้ใช้เข้าถึงไม่ได้ใน V1
- **VERDICT:** **SALES_PLAYBOOK.md ยังไม่ถูก amend ตาม D-2026-09-03** — เอกสารขัดแย้งกัน: playbook สั่งให้โชว์ JSON backup ใน demo แต่ UI ซ่อนอยู่ (ONBOARDING_AND_SUPPORT.md §4 เองก็ห้าม "สั่งผู้ใช้ใช้งาน UI ที่ซ่อนอยู่") — **นี่คือ dissent ที่ council ควรรับทราบ**: ถ้า backup ไม่ใช่ customer-facing contract จริง ต้องแก้ playbook ให้โชว์ "autosave + Save as PDF" เป็น proof แทน ไม่ใช่ JSON export
- **RECOMMENDATION:** amend SALES_PLAYBOOK.md §3 step 6 + objection handling "ข้อมูลอยู่ไหน?" (L36) ให้ตรงกับ D-2026-09-03 ก่อน pilot; มิฉะนั้น sales จะสัญญาสิ่งที่ UI ไม่มี

### 9.6 สรุปตำแหน่ง paid value proposition
- **VERIFIED (COMMERCIAL_PACKAGING.md §3):** Pro candidates = account+cloud sync, cross-device history, reusable customers/products, cloud recovery — ทั้งหมดหลัง PV gate
- **VERDICT:** การวาง branding/QR/persistence/print ไว้ใน free V1 core และ cloud/reusable data ไว้ใน Pro หลัง validation **ถูกต้องตาม evidence**; สิ่งที่ยังไม่ถูกต้องคือ playbook ที่อ้าง JSON backup (9.5) และความจริงที่ว่า logo+QR ยังไม่ implement

---

## 10. Verdict สรุป (สำหรับ council)

1. **VERIFIED:** DocCraft เป็น local-first browser document studio สำหรับผู้ประกอบการรายเล็กไทย — identity ชัดเจน, scope lock ดี, claims guardrail แข็งแรง
2. **VERIFIED:** ยังไม่ sellable — ผ่าน Gate 3/4 แล้ว แต่ยังต้อง Phase 4.1 (logo), Phase 5 (PromptPay), Phase 6 (hardening) ตาม ROADMAP; playbook เองห้ามขายก่อน Phase 6
3. **UNVERIFIED:** ไม่มี evidence ผู้ใช้จริงเลย — segment, pain, repeat usage, willingness-to-pay ทั้งหมดเป็น hypothesis; validation plan ยังไม่เริ่ม
4. **VERIFIED:** ลำดับ local-first → pilot → PV gate → cloud ถูกต้อง; ห้ามเร่ง cloud เข้า V1
5. **DISSENT:** SALES_PLAYBOOK.md ขัดแย้งกับ D-2026-09-03 (โชว์ JSON backup ใน demo แต่ UI ซ่อน) — ต้องแก้ก่อน pilot
6. **RECOMMENDATION:** pilot โฟกัส custom workshop + field contractor; เปิด anonymous telemetry วัด document type + repeat ตั้งแต่ pilot; อย่า lock ราคา (฿290/เดือน ฯลฯ) จนมี observed baseline

## 11. ความไม่แน่นอน / สิ่งที่ council ควรขอ evidence เพิ่ม

- **UNVERIFIED:** user vs buyer persona แยก — ไม่มี evidence
- **UNVERIFIED:** กลุ่ม segment ที่จ่ายเงินจริง — ไม่มี evidence
- **UNVERIFIED:** workflow ไหน repeat จริง — ไม่มี evidence (ต้อง telemetry)
- **UNVERIFIED:** willingness-to-pay — ไม่มี evidence (ราคาเป็น hypothesis)
- **UNVERIFIED:** Phase 4.1/5/6 implementation status — ยังไม่เปิด (ต้องติดตาม gate evidence ใหม่)
