# BK01 Booking — Product/Customer Lens (Council Round 1)

**Lens:** Product/Customer — user, buyer, pain, workflow, adoption, willingness to pay
**Date:** 2026-09-03
**Repo evidence read:** docs/00_PRODUCT_VISION.md, 01_PRD.md, 04_PRICING_ENTITLEMENTS.md, 05_BOOKING_DOMAIN_RULES.md, 06_UX_USER_FLOWS.md, 08_EXTERNAL_DEPENDENCIES.md, 10_DEVELOPMENT_ROADMAP.md, PRODUCT_DECISIONS.md, CURRENT_STATUS.md, audit/CURRENT_TRUTH_AND_CONTRADICTIONS.md, audit/BK-A-IMPLEMENTATION-EVIDENCE-2026-08-29.md, audit/INDEPENDENT_REVIEW_CODEX_BK-A_2026-08-29.md
**Git cross-check:** branch `feature/bk-a-v1-contract-remediation`, HEAD `213360a` (docs commit on top of `908108c`), working tree clean — VERIFIED. CURRENT_STATUS.md กล่าวถึง `51771f6`/`908108c` สอดคล้องกับประวัติ commit จริง (docs commits ต่อเนื่องกัน) — VERIFIED.
**Note:** docs/business/OFFICIAL_BUSINESS_MODEL.md และ PRICING_SPEC.md ถูกระบุเป็น HISTORICAL/NON-AUTHORITATIVE หลัง BK-0 — ไม่ถูกใช้เป็นความจริงปัจจุบันในบทวิเคราะห์นี้

---

## 1. ปัญหาที่แก้ และแก้ให้ใคร

- **VERIFIED** — Vision ระบุปัญหาหลัก: ธุรกิจนัดหมายขนาดเล็กในไทยยังประสานงานผ่าน LINE/DM, ปฏิทินมือ, spreadsheet และความจำพนักงาน; ความล้มเหลวซ้ำๆ ไม่ใช่แค่ "รับการจอง" แต่คือการรักษาความสอดคล้องของ availability ของพนักงาน, เงินมัดจำ, การยืนยัน, การเปลี่ยนแปลง และการสื่อสารกับลูกค้า โดยไม่ double-book หรือต้องติดตามด้วยมือมากเกินไป (00_PRODUCT_VISION.md L8)
- **VERIFIED** — กลุ่มที่แก้ให้: ร้านทำผม/ตัดผม/เสริมสวย/เล็บ และธุรกิจนัดหมายคล้ายกัน 1 สาขา มีผู้ให้บริการ ~1–10 คน ใช้ LINE เป็นช่องทางสื่อสารลูกค้า ต้องการ workflow แบบไทย-first (00_PRODUCT_VISION.md L11; PD-001)
- **VERIFIED** — ปัญหาที่ Vision เน้นคือ *operational consistency* (scheduling integrity, deposits, confirmations, changes) ไม่ใช่แค่ "มีลิงก์จอง" (00_PRODUCT_VISION.md L8, L17)
- **INFERENCE** — ตัวเลข "1–10 providers" และ "single-location" ถูกเลือกเพราะเป็นจุดที่ scheduling integrity + deposit + LINE มีมูลค่าจริง (ร้านเล็กเกินไปอาจใช้ LINE ฟรีได้; ร้านใหญ่/หลายสาขาต้องการ enterprise complexity ที่ V1 ตัดออก) — เป็นการอ่านเหตุผลจาก PD-001 rationale ("best fit to current staff/time/deposit domain") ไม่ใช่ข้อเท็จจริงจากตลาดโดยตรง
- **UNVERIFIED** — ยังไม่มีหลักฐาน pilot/ลูกค้าจริงยืนยันว่าปัญหานี้เจ็บปวดพอจะจ่ายเงิน (Vision ระบุชัดว่า no-show reduction, conversion uplift, WTP ยังเป็น hypothesis จนกว่าจะวัดได้ — 00_PRODUCT_VISION.md L48)

## 2. ผู้ใช้หลัก vs ผู้ซื้อ

- **VERIFIED** — ผู้ใช้หลัก (primary user): เจ้าของร้าน/owner/admin ที่ configure ร้าน, บริการ, พนักงาน, ตาราง, ตรวจ slip, ยืนยัน/ยกเลิก/complete/no-show (06_UX_USER_FLOWS.md L20–23; FR-* หลายรายการ)
- **VERIFIED** — ผู้ใช้รอง: staff (เห็นเฉพาะตาราง/การจองของตัวเอง — FR-STF-002, PD-006) และลูกค้าปลายทาง (จองผ่าน public link โดยไม่ต้องสมัคร account — FR-BKG-001)
- **VERIFIED** — ผู้ซื้อ (buyer) = เจ้าของร้านคนเดียวกับผู้ใช้หลัก: owner เป็นคนสมัคร, provision shop, จ่ายค่า subscription (FR-AUTH-001, FR-ONB-001, FR-BILL-*)
- **INFERENCE** — โมเดล self-serve + owner-as-buyer หมายถึง adoption funnel ต้องพึ่ง "first value เร็ว" (publish link → จองแรกสำเร็จ) เพราะไม่มี sales team; UX flow ระบุ first-value candidate = first successful booking (06_UX_USER_FLOWS.md L20)
- **INFERENCE** — ลูกค้าปลายทางไม่ใช่ผู้ซื้อโดยตรง แต่เป็น "ผู้ใช้ที่ต้องไม่สะดุด" — ถ้าลูกค้าจอง/จ่ายมัดจำไม่ได้ เจ้าของร้านจะเลิกใช้; ดังนั้น customer UX เป็น retention factor ของผู้ซื้อ ไม่ใช่ revenue unit

## 3. Segment ที่ V1 ควรเจาะก่อน

- **VERIFIED** — PD-001 (APPROVED 2026-08-28): hair/barber/beauty/nail, 1 location, ~1–10 providers; rejected: generic "all service businesses", clinic-first, multi-branch-first (PRODUCT_DECISIONS.md L57–61)
- **VERIFIED** — PD-016: medical clinics ถูก exclude จาก primary V1 positioning (PRODUCT_DECISIONS.md L133–137)
- **VERIFIED** — PD-015: multi-branch เป็น POST-V1 (PRODUCT_DECISIONS.md L129–132)
- **INFERENCE** — เหตุผลเชิง product/customer ที่ทำให้ segment นี้เหมาะสม: (1) ราคาต่อการจองสูงพอให้ deposit มีความหมาย, (2) จำนวน staff 1–10 ทำให้ "Any Staff" + collision rule มีคุณค่า, (3) LINE เป็นช่องทางหลักของ segment นี้ในไทยจริง, (4) ไม่มี compliance overhead แบบคลินิก — แต่ทั้งหมดนี้เป็น inference จาก rationale ในเอกสาร ไม่ใช่ market research ที่อ้างอิงแหล่งภายนอกในไฟล์ที่อ่าน
- **RECOMMENDATION** — V1 ควร positioning แบบ "single-location hair/beauty/nail" อย่างเคร่งครัด และใช้ pilot (BK-B: 5–15 ร้าน) เพื่อพิสูจน์ product-market fit ใน segment นี้ก่อนขยาย; อย่าเปิดประตูให้ vertical อื่น (clinic, fitness, education) ก่อน pilot evidence

## 4. ประเภทของผลิตภัณฑ์

- **VERIFIED** — Vision ระบุชัด: BK01 คือ **Thailand-first appointment operations SaaS** กับ LINE-assisted customer communication และ PromptPay-native deposit workflows; ไม่ใช่ queue ticketing, medical system, marketplace, POS, ERP หรือ multi-branch enterprise suite (00_PRODUCT_VISION.md L14)
- **VERIFIED** — หลักการข้อ 6: operational simplicity — single location first; ห้ามเพิ่ม clinic/branch/POS/marketplace complexity ใน V1 (00_PRODUCT_VISION.md L25)
- **VERIFIED** — V1 non-goals: POS, inventory, payroll, accounting, full CRM/marketing automation, marketplace/discovery/commission (00_PRODUCT_VISION.md L29–39)
- **INFERENCE** — คำตอบ: V1 = **appointment operations SaaS** (เน้น scheduling integrity + deposit + LINE ops) มากกว่า appointment SaaS เปล่าๆ (เพราะมี deposit/verification/staff-scope) และยังไม่ใช่ service-operations platform กว้างๆ (ไม่มี POS/CRM/ERP); "broader product" เป็น POST-V1 เท่านั้น
- **VERIFIED** — Post-V1 candidates ระบุไว้: annual billing, multi-branch, CRM/marketing automation, marketplace, APIs/webhooks, waitlist, calendar sync, advanced analytics (10_DEVELOPMENT_ROADMAP.md L48)

## 5. Core value loop

- **VERIFIED** — จาก Vision L17: merchant publish booking link → expose เฉพาะเวลาที่ว่างจริง → secure high-intent appointments ด้วย deposit เมื่อจำเป็น → staff schedule สอดคล้อง → ลดงาน manual confirm/follow-up → merchant ยังเป็นเจ้าของความสัมพันธ์ลูกค้า
- **VERIFIED** — UX flow ยืนยัน loop: owner onboarding → configure service/provider/schedule → publish link → first booking = first value (06_UX_USER_FLOWS.md L20)
- **INFERENCE** — core value loop ที่วัดได้: **publish → book (collision-safe) → deposit (ถ้าจำเป็น) → confirm/remind → complete/no-show → KPI truth**; loop นี้ครบที่ "completed/no-show" เพราะเป็นจุดที่เจ้าของร้านเห็นว่าปัญหา (no-show, double-book, manual follow-up) ลดลงจริง
- **VERIFIED** — ตัวชี้วัดความสำเร็จที่ Vision กำหนด: first value โดยไม่ต้อง high-touch setup, booking integrity ภายใต้ concurrency จริง, deposit/notification flows เชื่อถือได้, retention/value metrics (00_PRODUCT_VISION.md L48)
- **UNVERIFIED** — ยังไม่มี evidence ว่า loop นี้ทำงานจริงในสภาพแวดล้อม production (DB-backed gates BLOCKED_ENVIRONMENT; ไม่มีการ deploy — BK-A evidence L24, L55–61)

## 6. Minimum V1 finish line (usable + sellable)

- **VERIFIED** — V1 outcome (Vision L27): merchant self-register → configure 1 shop → services/providers/schedules → publish URL → collision-safe bookings → optional PromptPay deposit → review/verify → confirm/change/cancel → complete/no-show → required notifications → subscription state → export core data
- **VERIFIED** — PRD กำหนด "public-launch blockers": ทุก Required row ต้องมี passing traceability evidence ก่อน marketing เป็น public V1 (01_PRD.md L80–81)
- **VERIFIED** — BK-A ยังไม่ release-complete: DB-backed gates G2 + DB portions G3–G9 BLOCKED_ENVIRONMENT (ไม่มี PostgreSQL/Docker); migration ยังไม่ถูก apply กับ live/remote project; ไม่มี production deploy (BK-A evidence L24, L55–61; INDEPENDENT_REVIEW L73)
- **VERIFIED** — Independent review verdict: PASS (no P0/P1 code defect) แต่ต้องมี Continuation 04 (DB runtime gates) ก่อน public release (INDEPENDENT_REVIEW L16, L78–79)
- **VERIFIED** — Owner-decision blockers ที่ค้าง: auto-slip provider/allowance/cost, managed LINE allowance, final prices, cancel/reschedule policy windows (BK-A evidence L63–68)
- **INFERENCE** — จากมุม product/customer: minimum sellable V1 = สิ่งที่ Vision L27 ระบุ **ทั้งหมด** ทำงานจริงใน production (รวม deposit flow, LINE confirm+reminder, reschedule/cancel, no-show) — เพราะ competitor baseline (Onque/JongQ/QueueBooking อ้างอิงใน PD-002) มี reschedule/reminder/automation เป็นของปกติ; ขาย V1 ที่ขาดชิ้นส่วนเหล่านี้ = ขายของที่ด้อยกว่า competitor ในจุดที่ลูกค้าเห็นได้ทันที
- **RECOMMENDATION** — เส้นชัย V1 ที่ "usable and sellable" ต้องรวม: (1) booking integrity ผ่าน DB-level proof (ไม่ใช่แค่ unit test), (2) deposit flow ครบ (QR → slip → verify → confirm) กับ merchant อย่างน้อย 1 รายจริง, (3) LINE confirm + reminder ส่งจริง, (4) reschedule/cancel ทำงานจริง, (5) complete/no-show วัดได้, (6) pilot 5–15 ร้านเก็บ evidence (BK-B) — ไม่งั้น "sellable" ยังเป็นเพียงสมมติฐาน

## 7. Pricing/entitlement promises ที่มีคุณค่าจริงและ defendable ทางการค้า

- **VERIFIED** — PD-002: retire 100/500 paid booking walls; paid capacity effectively unlimited + fair-use; เหตุผล: competitors ให้ unlimited หรือสูงกว่า (Onque/JongQ unlimited, QueueBooking 2,000 @ ฿990) — rows ไม่ใช่ value (PRODUCT_DECISIONS.md L63–67)
- **VERIFIED** — PD-003: ฿490/฿990 เป็น pilot reference เท่านั้น ไม่ใช่ final; ต้องมี feature contract + pilot WTP + competitor refresh + owner approval ก่อน lock (04_PRICING_ENTITLEMENTS.md L58; PRODUCT_DECISIONS.md L69–73)
- **VERIFIED** — PD-004: auto-slip เป็น V1 REQUIRED ก่อนขาย Pro; competitors ถือว่า automation เป็นฟังก์ชันปกติของแผนจ่ายเงิน (PRODUCT_DECISIONS.md L75–79)
- **VERIFIED** — PD-005: merchant-owned LINE OA สำหรับ paid production; central OA เฉพาะ trial/onboarding; merchant รับผิดชอบค่า LINE OA/message cost (04_PRICING_ENTITLEMENTS.md L31–34)
- **VERIFIED** — Staff entitlement: Trial/Basic 5, Pro 10 (04_PRICING_ENTITLEMENTS.md L26–29)
- **INFERENCE** — สิ่งที่ defendable ทางการค้าจริง (จาก evidence):
  1. **Deposit workflow (PromptPay + slip verification)** — เป็น pain จริงของ segment (Vision ระบุ deposits เป็นส่วนหนึ่งของ recurring failure) และเป็นสิ่งที่ LINE เปล่าๆ/Google Calendar ทำไม่ได้; แต่ต้องระวัง: Vision เองยอมรับว่า LINE/PromptPay อย่างเดียวไม่ใช่ differentiator เพราะ competitor ไทยมีแล้ว (00_PRODUCT_VISION.md L42) — คุณค่าอยู่ที่ *combination* กับ scheduling integrity
  2. **Scheduling integrity (collision-safe, fail-closed availability)** — เป็น core trust; ถ้า double-book เกิดขึ้นจริง merchant จะเลิกใช้ทันที; defendable เพราะต้องทำที่ data layer ไม่ใช่ UI
  3. **Merchant-owned LINE + notification evidence** — ลด manual follow-up ซึ่งเป็น pain ที่ Vision ระบุ; defendable ตรงที่ "sent/failed evidence" เป็นสิ่งที่ LINE OA เปล่าๆ ไม่ให้
  4. **No-show/completion measurement** — จำเป็นต่อ KPI truth ของเจ้าของร้าน (PD-013)
- **INFERENCE** — สิ่งที่ *ไม่* defendable ณ ตอนนี้: ฿490/฿990 ยังไม่ใช่ final (ต้อง pilot WTP); auto-slip ยังไม่มี provider/allowance/cost (ขายไม่ได้จนกว่าจะ implement); "effectively unlimited" เป็น fair-use ต้อง document ก่อน enforce (04_PRICING_ENTITLEMENTS.md L23)
- **RECOMMENDATION** — อย่าใช้ "unlimited bookings" เป็น headline หลัก (competitor มีเหมือนกัน); ใช้ "deposit + scheduling integrity + LINE ops ที่ทำงานจริง" เป็น core pitch; ราคา ฿490/฿990 ใช้เป็น pilot reference ได้ แต่ต้องไม่ถูกนำเสนอเป็น final (BK-A ตรวจแล้วว่า UI ระบุ pilot/reference — VERIFIED จาก INDEPENDENT_REVIEW L60)

## 8. PromptPay, slip verification, LINE, central billing — ผลต่อ destination โดยไม่กลายเป็น payments product

- **VERIFIED** — หลักการ Vision ข้อ 3: Thai-native money flow — เงินลูกค้าไปที่ merchant โดยตรง เว้นแต่ product decision อนาคตจะบอกเป็นอื่น (00_PRODUCT_VISION.md L22) — นี่คือเส้นแบ่งสำคัญ: BK01 ไม่ถือเงิน ไม่เป็น PSP
- **VERIFIED** — Deposit refund เป็น merchant policy/operation; BK01 ต้องไม่ claim ว่าเงินถูก refund อัตโนมัติ (05_BOOKING_DOMAIN_RULES.md L47)
- **VERIFIED** — Auto-slip: auto-confirm เฉพาะผลบวกที่ตรง amount/recipient/trans_ref; timeout/unknown/ambiguous → manual review เสมอ (05_BOOKING_DOMAIN_RULES.md L40; INDEPENDENT_REVIEW L50)
- **VERIFIED** — Duplicate trans_ref ถูก reject ที่ DB level (INDEPENDENT_REVIEW L51)
- **VERIFIED** — QR generation ต้องไม่พึ่ง public `promptpay.io` (PD-011; BK-A ใช้ local SVG QR — INDEPENDENT_REVIEW L33)
- **VERIFIED** — LINE: merchant-owned OA สำหรับ paid; central OA เฉพาะ trial; notification failure ไม่ mutate booking state (05_BOOKING_DOMAIN_RULES.md L59; FR-LINE-003)
- **VERIFIED** — Billing: Stripe monthly เท่านั้นใน V1; annual POST-V1; webhook idempotent/out-of-order safe (FR-BILL-001/002; PD-008)
- **INFERENCE** — ผลต่อ destination: ฟีเจอร์เหล่านี้ควรเป็น **enablers ของ core loop** ไม่ใช่ product เอง:
  - PromptPay/slip = ลด friction ของ deposit (ซึ่งเป็น pain จริง) และลดงาน manual ของเจ้าของร้าน — ควรอยู่ในระดับ "trusted deposit ops" ไม่ใช่ "payment platform"
  - LINE = ช่องทาง communication ที่ segment ใช้อยู่แล้ว — ควรเป็น "notification/ops layer" ไม่ใช่ "messaging product"
  - Stripe = plumbing ของ subscription — ควรเป็น "billing ops" ที่เงียบๆ ไม่ใช่ feature pitch
- **RECOMMENDATION** — เส้นแบ่งที่ควรยึด: BK01 รับผิดชอบ *evidence ของเงิน* (slip verified/rejected, trans_ref unique, audit) แต่ไม่รับผิดชอบ *การเคลื่อนเงิน* (refund, settlement, escrow) — ถ้า feature ใดเริ่มต้องการ ledger/refund automation/escrow ให้ย้ายไปเป็น product decision ใหม่ (post-V1) ไม่ใช่ขยายขอบเขต V1
- **RECOMMENDATION** — อย่าให้ "auto-slip" กลายเป็นจุดขายหลักของ Pro จนกว่า provider/cost evidence จะมี (PD-004 กำหนดไว้แล้ว); ระหว่างนี้ Pro ควร pitch ที่ "staff scope + lower manual deposit workload" ตามที่ 04_PRICING_ENTITLEMENTS.md L15 ระบุ

## 9. Owner-decision blockers — ผลต่อ saleability vs later optimization

- **VERIFIED** — Blockers ที่ค้าง (BK-A evidence L63–68):
  1. Final Pro auto-slip provider, allowance, unit economics/top-up price, failure policy
  2. WSTERA-managed LINE allowance/cost model
  3. Final public Basic/Pro prices (ปัจจุบันเป็น reference-only)
  4. Customer cancel/reschedule policy windows (nullable, fail-closed จนกว่า merchant/owner จะ configure)
- **INFERENCE** — แบ่งผลกระทบ:
  - **กระทบ saleability โดยตรง (blocker จริง):**
    - *Final prices* — ขาย public ไม่ได้จนกว่าจะ lock (price-lock gate, 04_PRICING_ENTITLEMENTS.md L58) — นี่คือ gate ทางการค้า ไม่ใช่ optimization
    - *Auto-slip* — Pro ขายไม่ได้จนกว่าจะ implement + มี cost model (PD-004) — ถ้า Pro เป็น tier หลักที่ตั้งใจขาย นี่คือ saleability blocker
    - *Cancel/reschedule policy windows* — ถ้าไม่ configure ลูกค้า cancel/reschedule ไม่ได้ (fail-closed) → UX ลูกค้าสะดุด → merchant เห็นว่า "ระบบจองแต่เปลี่ยนไม่ได้" → retention เสียหาย; นี่กระทบ saleability เพราะ competitor มี change flow เป็นปกติ (PD-009 rationale)
  - **กระทบ later optimization มากกว่า:**
    - *Managed LINE allowance/cost model* — merchant-owned OA เป็น default อยู่แล้ว (PD-005); managed allowance เป็น add-on อนาคต — ไม่บล็อก Basic/Pro ที่ merchant ใช้ OA ตัวเอง
    - *Auto-slip top-up economics* — ต่อเมื่อ auto-slip ทำงานแล้ว; เป็น pricing detail ไม่ใช่ gate ของ core loop
- **RECOMMENDATION** — ลำดับการตัดสินใจที่ควรเร่ง (จากมุม product/customer): (1) cancel/reschedule policy windows — ต้องมี default ที่สมเหตุสมผล (เช่น cancel ภายใน X ชม. ก่อนเวลา) เพื่อให้ UX ใช้งานได้จริง ไม่ใช่ปล่อย fail-closed, (2) final prices หลัง pilot WTP, (3) auto-slip provider + cost — จำเป็นก่อน Pro sale, (4) managed LINE allowance — รอได้
- **UNVERIFIED** — ยังไม่มี evidence ว่า owner ได้รับข้อมูล WTP จาก pilot แล้ว (BK-B ยังไม่เริ่ม — 10_DEVELOPMENT_ROADMAP.md L29–35 ระบุ pilot 5–15 ร้านเป็นเป้าหมาย ยังไม่ใช่ผลลัพธ์)

## 10. Adoption / GTM มุมมอง (จาก evidence เท่าที่มี)

- **VERIFIED** — Trial: ฿0/14 วัน, 50 bookings, central OA onboarding mode — ออกแบบมาเพื่อ "prove first value" (04_PRICING_ENTITLEMENTS.md L13)
- **VERIFIED** — BK-B pilot: 5–15 qualifying single-location shops; เก็บ time-to-first-value, support burden, booking integrity, deposits, notifications, WTP (10_DEVELOPMENT_ROADMAP.md L29–35)
- **VERIFIED** — BK-C commercial lock: competitor refresh, final prices, auto-slip/managed-message economics, landing-page claims validation (10_DEVELOPMENT_ROADMAP.md L37–42)
- **INFERENCE** — adoption hypothesis: self-serve onboarding + trial 14 วัน + central OA (ลด friction ตอนเริ่ม) → first booking เร็ว → เห็น value → convert เป็น Basic/Pro; แต่ยังไม่มี evidence ว่า funnel นี้ทำงาน (ยังไม่มี pilot)
- **UNVERIFIED** — ไม่มี evidence เรื่อง churn, activation rate, หรือ conversion rate จาก pilot จริง

## 11. Dissent / uncertainty

1. **UNVERIFIED — WTP ยังเป็น hypothesis ล้วนๆ** — Vision เองยอมรับ (L48) ว่า no-show reduction/conversion uplift/WTP ยังไม่ถูกวัด; ฿490/฿990 เป็นแค่ reference; อย่าให้ council ตัดสิน destination โดยถือว่าราคาเหล่านี้ "จริง"
2. **INFERENCE — "combination" เป็น differentiator hypothesis ยังไม่ถูกพิสูจน์** — Vision L42 ระบุว่า LINE/PromptPay อย่างเดียวไม่พอ แต่ combination กับ scheduling integrity ก็ยังเป็น hypothesis; pilot ต้องพิสูจน์ว่า merchant เห็นคุณค่าของ combination จริง (เช่น ลด manual follow-up ได้กี่นาที/วัน)
3. **UNVERIFIED — DB-backed truth ยังไม่ผ่าน** — ทุกอย่างที่เกี่ยวกับ booking integrity, RLS, concurrency, Stripe ordering, LINE delivery ยังเป็น BLOCKED_ENVIRONMENT; จากมุม product: ยังไม่สามารถอ้าง "collision-safe" หรือ "deposit flow ทำงาน" กับลูกค้าได้จนกว่า Continuation 04 จะผ่าน
4. **INFERENCE — ความเสี่ยงของ "effectively unlimited"** — เป็นการตัดสินใจที่ถูกต้องเชิง competitor parity (PD-002) แต่ถ้า fair-use guard ถูก enforce โดยไม่ document ล่วงหน้า อาจกลายเป็น trust issue กับ merchant; ต้อง document ก่อน enforce (04_PRICING_ENTITLEMENTS.md L23 ระบุไว้แล้ว — เป็นข้อกำหนด ไม่ใช่แค่คำแนะนำ)
5. **INFERENCE — cancel/reschedule policy windows fail-closed** — การไม่มี default อาจทำให้ pilot merchant สะดุด (ลูกค้าเปลี่ยนนัดไม่ได้); แนะนำให้ owner ตั้ง default ที่สมเหตุสมผลก่อน pilot แทนที่จะปล่อย nullable — แต่ต้องระวัง: BK-A evidence ระบุชัดว่า "no default was invented" (L68) ซึ่งเป็นความตั้งใจ; การเพิ่ม default ต้องเป็น owner decision ใหม่ ไม่ใช่การแก้เอง

## 12. สรุป verdict (Product/Customer lens)

- **VERIFIED** — ปัญหาและ ICP ชัดเจนและสมเหตุสมผล: single-location hair/beauty/nail ในไทย, owner เป็นทั้งผู้ใช้และผู้ซื้อ, pain คือ operational consistency (scheduling + deposit + LINE follow-up)
- **VERIFIED** — V1 = appointment operations SaaS (ไม่ใช่ payments product, ไม่ใช่ marketplace, ไม่ใช่ multi-branch) — ขอบเขตชัดเจนและถูกต้อง
- **VERIFIED** — Core value loop ครบถ้วนในเอกสาร แต่ยังไม่พิสูจน์ใน production (DB gates blocked)
- **VERIFIED** — Minimum sellable V1 = Vision L27 ทั้งหมดทำงานจริง + pilot evidence; ยังไม่ถึงเส้นชัย (BK-A เปิด, Continuation 04 ยังต้องทำ)
- **INFERENCE** — สิ่งที่ defendable: deposit workflow + scheduling integrity + merchant-owned LINE ops + no-show measurement (เป็น combination); สิ่งที่ยังไม่ defendable: ราคา final, auto-slip (ยังไม่มี provider/cost)
- **RECOMMENDATION** — Destination ที่แนะนำจากมุมนี้: **เดินหน้า V1 ให้ครบตาม contract (BK-A + Continuation 04) แล้วเข้าสู่ pilot (BK-B) ก่อนตัดสินใจเรื่องราคา/ขยาย scope ใดๆ**; อย่าเลื่อนเส้นชัย V1 ออกไปเพื่อเพิ่ม feature; อย่าเปิด vertical ใหม่ก่อน pilot evidence; อย่าให้ payments/LINE กลายเป็น product หลัก — ให้เป็น enabler ของ core loop
