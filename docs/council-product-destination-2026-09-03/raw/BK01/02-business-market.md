# BK01 Booking — Business/Market Lens (Council Round 1)

**Lens:** Business/Market — revenue model, competition, differentiation, distribution, commercial viability
**Date:** 2026-09-03
**Evidence base:** อ่านจาก repo จริง `D:\AI-Workspace\projects\saas-product-hub\products\booking` (branch `feature/bk-a-v1-contract-remediation`, HEAD `213360a`, clean tree) — ไฟล์ vision/PRD/pricing/domain/external-deps/roadmap/decisions/status/audit/market/marketing ครบตามที่กำหนด
**Label convention:** VERIFIED = มีหลักฐานใน repo / INFERENCE = สรุปจากหลักฐาน / UNVERIFIED = ยังไม่มีหลักฐาน / RECOMMENDATION = ข้อเสนอของ lens นี้ / UNKNOWN = ไม่มีหลักฐาน

---

## 1. Product ทำเงินยังไง และทำไม buyer ถึงซื้อ/จ่ายต่อ

### Revenue model
- **VERIFIED:** รายได้เป็น monthly Stripe subscription 3 ระดับ: Trial ฿0/14 วัน (50 bookings, ≤5 staff), Basic pilot reference ฿490/mo (≤5 staff, manual slip verification), Pro pilot reference ฿990/mo (≤10 staff, auto-slip required ก่อนขาย) — `04_PRICING_ENTITLEMENTS.md` L10-15
- **VERIFIED:** Public V1 รองรับ monthly billing เท่านั้น; annual billing เป็น POST-V1 (PD-008) — `04_PRICING_ENTITLEMENTS.md` L17-21, `PRODUCT_DECISIONS.md` PD-008
- **VERIFIED:** รายได้ไม่ได้มาจาก database rows — legacy 100/500 booking walls ถูก retire แล้ว (PD-002); paid capacity "effectively unlimited" สำหรับ ICP ปกติ — `04_PRICING_ENTITLEMENTS.md` L8, L23
- **VERIFIED:** รายได้เสริมที่เป็นไปได้ (ยังไม่ใช่รายได้จริง): auto-slip verification allowance/top-up และ managed LINE messaging — แต่ทั้งคู่เป็น `PENDING COST EVIDENCE` ยังขายไม่ได้ — `04_PRICING_ENTITLEMENTS.md` L41, L55
- **VERIFIED:** เงินมัดจำลูกค้าไปที่ merchant โดยตรง ไม่ผ่าน WSTERA — ไม่มี commission/transaction fee model (vision L22, positioning L32) — นี่คือ choice ที่ทำให้ revenue เป็น subscription-only อย่างแท้จริง

### ทำไม buyer ถึงซื้อ (value proposition ตามเอกสาร)
- **VERIFIED:** Core value = merchant publish booking link → expose เฉพาะเวลาที่ว่างจริง → เก็บมัดจำ PromptPay → staff schedule สอดคล้อง → ลดงาน manual confirm/follow-up — `00_PRODUCT_VISION.md` L17
- **VERIFIED:** JTBD หลัก = ลด repeated chat coordination + ป้องกัน double-booking — `ICP_JTBD.md` L33
- **VERIFIED:** Pain hierarchy: (1) collisions/manual availability check, (2) repetitive chat confirm, (3) no-show risk, (4) fragmented history, (5) dependence on staff memory — `POSITIONING_MESSAGING.md` L11-15

### ทำไม buyer ถึงจ่ายต่อ (retention logic)
- **INFERENCE:** กลไก retention ที่เอกสารวางไว้คือ (ก) ข้อมูลธุรกิจจริง (booking history, customers, staff schedules) อยู่ในระบบ → switching cost เกิดขึ้นจริง (ข) merchant-owned LINE OA ผูก workflow ประจำวันของร้าน (ค) data portability (CSV export + closure process) มีอยู่เพื่อลด fear of lock-in — แต่ **ไม่มีหลักฐาน retention จริง** เพราะยังไม่มี pilot
- **UNVERIFIED:** ไม่มีหลักฐาน churn/retention metric ใดๆ — ยังไม่เคยมีลูกค้าจ่ายเงิน

---

## 2. Differentiation จริง vs tools/workarounds

### vs manual LINE + spreadsheet/calendar (workaround หลัก)
- **VERIFIED:** งานที่ BK01 แทนที่ = manual availability checking, chat confirmation, deposit slip checking, reminder — `ICP_JTBD.md` L23-29, `MARKET_AND_SEGMENTATION_2026.md` L46-52
- **VERIFIED:** จุดขายที่ต่างจาก workaround = scheduling integrity ที่บังคับที่ data layer (DB exclusion constraint, fail-closed schedule, hold expiry) — `05_BOOKING_DOMAIN_RULES.md` L13-29, `COMPETITIVE_LANDSCAPE_2026.md` L73
- **INFERENCE:** ต่างจาก spreadsheet/chat ตรงที่ "availability เป็น authoritative state" ไม่ใช่แค่ UI — นี่คือ differentiation ที่เป็นรูปธรรมที่สุด แต่ **ยังพิสูจน์ไม่ได้จนกว่า DB-backed gates ผ่าน** (ดู Section 6)

### vs คู่แข่งไทย (Onque/JongQ/QueueBooking และอื่นๆ)
- **VERIFIED:** LINE integration, Thai language, PromptPay QR, booking page, ราคาถูก = commodity — `COMPETITIVE_LANDSCAPE_2026.md` L91
- **VERIFIED:** ราคาคู่แข่ง: Onque ฿299/mo unlimited bookings; JongQ ฿499/mo unlimited; QueueBooking ฿990/mo (2,000 bookings) / ฿2,490/mo; MeQueue ฿399-599/mo; EikQueue ฿590-1,290/mo; FoxConnect ฿690-2,990/mo; Bangkok Boost ฿990+/mo — `COMPETITIVE_LANDSCAPE_2026.md` L15-23
- **VERIFIED:** BK01 ราคา ฿490/฿990 อยู่กลาง band ตลาด (low band ฿299-690, complete systems ฿990+) — `ICP_JTBD.md` L65
- **VERIFIED:** จุดที่ BK01 แพ้ baseline: auto-slip (LOSE), automated reminders (LOSE), customer reschedule/cancel (LOSE), export/portability (LOSE) — `COMPETITIVE_LANDSCAPE_2026.md` L76-81 — ทุกจุดนี้เป็น V1 blocker ใน BK-A
- **VERIFIED:** จุดที่ BK01 อาจชนะ (POTENTIAL WIN): DB-enforced scheduling integrity, Any Staff allocation, merchant-owned customer relationship — `COMPETITIVE_LANDSCAPE_2026.md` L73-75, L98
- **INFERENCE:** differentiation ที่เหลืออยู่จริงหลังตัด commodity ออก = **scheduling integrity + merchant-owned LINE + low setup burden** เป็น combination — vision เองยอมรับว่า LINE หรือ PromptPay อย่างเดียวไม่ defensible (`00_PRODUCT_VISION.md` L42)
- **UNVERIFIED:** ยังไม่มีหลักฐานว่า combination นี้ชนะใจลูกค้าจริง — เป็น hypothesis ที่ต้องพิสูจน์ใน pilot

### สรุป differentiation
- **VERIFIED:** เอกสาร positioning วาง BK01 ไว้ที่ "Thailand-first appointment operations SaaS" ไม่ใช่ generic scheduler และไม่ใช่ marketplace — `00_PRODUCT_VISION.md` L14
- **INFERENCE:** ในตลาดที่คู่แข่งราคาถูกกว่า (Onque ฿299, JongQ ฿499) และ feature ครบกว่า (auto-slip, reminders, multi-branch) — BK01 ต้องขายที่ "ความน่าเชื่อถือของคิว" + "เจ้าของร้านเป็นเจ้าของลูกค้า" ซึ่งเป็นคุณสมบัติที่พิสูจน์ยากและต้องใช้ pilot evidence — นี่คือจุดอ่อนเชิงพาณิชย์ที่ใหญ่ที่สุดของ differentiation ณ วันนี้

---

## 3. ราคา ฿490/฿990: verified contract หรือ hypothesis?

**VERIFIED: เป็น hypothesis / pilot reference — ไม่ใช่ contract ที่ล็อกแล้ว**
- `04_PRICING_ENTITLEMENTS.md` L4: "LOCKED STRUCTURE / PRICE POINTS PROVISIONAL"
- L14-15: "**Pilot reference ฿490/mo; not final**" / "**Pilot reference ฿990/mo; not final**"
- L58: Price-lock gate ต้องการ = V1 feature contract implemented + variable-cost model + pilot WTP evidence + competitor refresh + owner approval
- `PRODUCT_DECISIONS.md` PD-003: "Keep prices **provisional**, not LOCKED, until feature contract + pilot WTP"
- `ICP_JTBD.md` L63-66: "Willingness-to-pay hypothesis — Status: UNPROVEN... ฿490/฿990 pricing is therefore a hypothesis, not a locked truth"
- `BK-A-IMPLEMENTATION-EVIDENCE-2026-08-29.md` L67: "Final public Basic/Pro prices; current UI values are reference-only"
- **VERIFIED:** UI ถูกแก้ให้แสดง pilot/reference wording แล้ว (BK-A A4) — `BK-A-IMPLEMENTATION-EVIDENCE-2026-08-29.md` L11

**นัยเชิงพาณิชย์:**
- **VERIFIED:** Public paid launch ถูก BLOCKED จนกว่า price lock ผ่าน — `04_PRICING_ENTITLEMENTS.md` L5
- **INFERENCE:** ราคา ฿490/฿990 เป็น "educated guess" ที่อิง competitor band (฿299-฿990+) ไม่ได้อิง WTP ของลูกค้าจริง — ยังไม่มีหลักฐานว่าลูกค้าไทยยอมจ่ายเท่านี้

---

## 4. Recurring-revenue justification

- **VERIFIED:** รูปแบบ = monthly subscription (Stripe) — recurring โดยโครงสร้าง — `04_PRICING_ENTITLEMENTS.md` L17
- **VERIFIED:** เหตุผลที่ลูกค้าควรจ่ายรายเดือน = operational value (ลดงาน manual, ป้องกัน double-booking, deposit workflow) ไม่ใช่ quota — `04_PRICING_ENTITLEMENTS.md` L8
- **VERIFIED:** ต้นทุนผันแปรที่ WSTERA ต้องแบกรับถูกออกแบบให้จำกัด: merchant-owned LINE OA = merchant จ่ายค่า LINE เอง (L32); auto-slip = ยังไม่มี cost model (L41) — นี่คือโครงสร้างที่ทำให้ gross margin ของ subscription ดีได้
- **UNVERIFIED:** ยังไม่มีหลักฐานว่า recurring revenue จะเกิดขึ้นจริง — ไม่มี pilot, ไม่มี paid customer, ไม่มี churn data
- **INFERENCE:** justification ของ recurring revenue ณ วันนี้ = โครงสร้าง (subscription + merchant bears LINE cost) + สมมติฐาน value (operational pain) — ยังไม่ใช่หลักฐานเชิงประจักษ์

---

## 5. ความเสี่ยงทางธุรกิจที่ใหญ่ที่สุด

**VERIFIED (จากหลักฐาน):** ความเสี่ยงที่ใหญ่ที่สุดคือ **การเปิดตัวเชิงพาณิชย์ไม่สามารถเกิดขึ้นได้ตามกำหนด และเมื่อเปิดตัวก็ยังไม่มีหลักฐาน WTP/retention** — ประกอบด้วย:

1. **VERIFIED — Launch blocker ทางเทคนิคยังค้าง:** DB-backed gates (G2, G3-G9) ยัง BLOCKED_ENVIRONMENT — ไม่มี PostgreSQL runtime, migration ยังไม่เคย replay, RLS/concurrency/Stripe ordering/LINE delivery ยังไม่เคยพิสูจน์ — `BK-A-IMPLEMENTATION-EVIDENCE-2026-08-29.md` L55-61, `INDEPENDENT_REVIEW_CODEX_BK-A_2026-08-29.md` L73
2. **VERIFIED — Pro ขายไม่ได้จนกว่า auto-slip มีจริง:** PD-004 = auto-slip เป็น V1 REQUIRED ก่อน Pro sale; auto-slip provider/allowance/unit economics ยังเป็น owner decision ที่ค้าง — `BK-A-IMPLEMENTATION-EVIDENCE-2026-08-29.md` L63-68
3. **VERIFIED — WTP ไม่มีหลักฐาน:** ราคาเป็น hypothesis; competitor band ไม่ใช่ WTP ของลูกค้า — `ICP_JTBD.md` L63-66
4. **VERIFIED — คู่แข่ง feature ครบกว่าในราคาเท่ากันหรือถูกกว่า:** QueueBooking ฿990 = 2,000 bookings + multi-branch; Onque ฿299 = unlimited; FoxConnect มี CRM ครบ — `COMPETITIVE_LANDSCAPE_2026.md` L15-23
5. **INFERENCE — ความเสี่ยงเชิงกลยุทธ์:** ถ้า BK01 เปิดตัวช้า (รอ DB runtime + pilot + price lock) คู่แข่งที่ feature ครบกว่าจะยิ่งฝังตัวในตลาด; ถ้าเปิดตัวเร็วโดยไม่มี evidence จะขาย "scheduling integrity" ที่ยังพิสูจน์ไม่ได้

**INFERENCE — ความเสี่ยงที่ lens นี้มองว่าใหญ่สุด:** **การที่ "scheduling integrity" ซึ่งเป็น differentiation หลัก ยังไม่เคยถูกพิสูจน์ในสภาพแวดล้อมจริง (DB-backed gates ยังไม่ผ่าน) ขณะที่คู่แข่งราคาถูกกว่า/ครบกว่า** — ถ้า integrity พิสูจน์ไม่ได้หรือพิสูจน์แล้วไม่ต่างจากคู่แข่ง BK01 จะเหลือแค่ commodity (LINE + PromptPay + booking page) ที่สู้ราคา ฿299 ของ Onque ไม่ได้

---

## 6. Booking เป็น appointment SaaS, service-operations SaaS, หรือกว้างกว่า?

- **VERIFIED:** Vision ระบุชัด = "Thailand-first **appointment operations SaaS** with LINE-assisted customer communication and PromptPay-native deposit workflows" — `00_PRODUCT_VISION.md` L14
- **VERIFIED:** Market doc ระบุ = "LINE-first appointment booking and **lightweight service-operations SaaS**" — `MARKET_AND_SEGMENTATION_2026.md` L8
- **VERIFIED:** ไม่ใช่ queue ticketing, medical clinic, marketplace, POS, ERP, multi-branch suite — `00_PRODUCT_VISION.md` L14, L29-39
- **VERIFIED:** V1 non-goals: POS/inventory/payroll/accounting, full CRM/marketing automation, marketplace/commission — `00_PRODUCT_VISION.md` L29-39
- **INFERENCE:** คำตอบที่ evidence สนับสนุน = **appointment SaaS ที่ขยายไปทาง service-operations เบาๆ** (staff schedule, no-show, deposit, ticket/support) — แต่ยังไม่ใช่ service-operations เต็มรูปแบบ (ไม่มี POS, inventory, payroll) และไม่ใช่ broader platform
- **INFERENCE:** การวางตำแหน่งแคบนี้เป็นทั้งจุดแข็ง (focus, fit กับ ICP) และจุดอ่อน (upsell path จำกัด — ต้องพึ่ง multi-branch/CRM/annual billing ที่เป็น post-V1 เพื่อขยาย ARPU)

---

## 7. Owner-decision blockers: กระทบ saleability vs later optimization

### Saleability blockers (ขายไม่ได้ถ้าไม่ตัดสินใจ) — VERIFIED จาก `BK-A-IMPLEMENTATION-EVIDENCE-2026-08-29.md` L63-68 + `04_PRICING_ENTITLEMENTS.md`
| Blocker | ผลกระทบต่อ saleability |
|---|---|
| Final Pro auto-slip provider + allowance + unit economics/top-up price | **Pro ขายไม่ได้** (PD-004) — ตัดรายได้ tier บนออกไปครึ่งหนึ่ง |
| WSTERA-managed LINE allowance/cost model | Trial/onboarding experience กำหนดไม่ได้ → first-value path ไม่ชัด |
| Final public Basic/Pro prices | **Public paid launch blocked ทั้งหมด** (price-lock gate) — ขายได้แค่ pilot |
| Customer cancel/reschedule policy windows (nullable, fail-closed) | UX ลูกค้าไม่สมบูรณ์ → objection "เปลี่ยนคิวไม่ได้" ในการขาย |

### Later optimization (ไม่บล็อกการขาย) — VERIFIED จาก roadmap
- Multi-branch (PD-015), annual billing (PD-008), marketplace/discovery, CRM/marketing automation, waitlist, calendar sync, advanced analytics — ทั้งหมด POST-V1 — `10_DEVELOPMENT_ROADMAP.md` L48

### สรุป
- **INFERENCE:** สิ่งที่ต้องตัดสินใจก่อนขาย = 4 อย่างในตารางบน (โดยเฉพาะ price + auto-slip economics) — สิ่งที่รอได้ = post-V1 features
- **INFERENCE:** จุดที่ควรระวัง: auto-slip economics เป็นทั้ง saleability blocker และ cost-model จำเป็น — ถ้าไม่ตัดสินใจ Pro จะเป็นแค่ "Basic + staff 10 คน" ซึ่งไม่ justify ส่วนต่าง ฿500/mo

---

## 8. Verdict ของ lens นี้

1. **VERIFIED:** โมเดลรายได้ = monthly subscription ล้วน (ไม่มี commission) — โครงสร้างสะอาด, gross margin potential ดี (merchant จ่าย LINE เอง)
2. **VERIFIED:** ราคา ฿490/฿990 = hypothesis อย่างเป็นทางการ — เอกสารทุกฉบับตรงกันว่ายังไม่ lock
3. **VERIFIED:** differentiation ที่เหลือจริง = scheduling integrity + merchant-owned LINE + low setup burden — commodity ถูกตัดออกไปแล้วในเอกสาร
4. **VERIFIED:** ความเสี่ยงใหญ่สุด = launch ถูกบล็อก (DB gates + price lock + auto-slip) ขณะที่คู่แข่ง feature ครบกว่า/ถูกกว่า และ WTP ยังไม่มีหลักฐาน
5. **INFERENCE:** ณ วันนี้ BK01 ยังไม่ใช่ "business ที่พิสูจน์แล้ว" — เป็น "product contract ที่ออกแบบมาดี + hypothesis ทางพาณิชย์" — การตัดสินใจ destination ควรยึด evidence นี้ ไม่ใช่ถือว่าราคา/ICP เป็นความจริงแล้ว

### Dissent / ความไม่แน่นอน
- **UNVERIFIED:** ตัวเลขตลาด (LINE 56M accounts, PromptPay volume, NSO establishment counts) เป็น universe indicators ไม่ใช่ TAM — เอกสารเองยอมรับว่าไม่มี monetary TAM/SAM/SOM ที่ lock — `MARKET_AND_SEGMENTATION_2026.md` L75-79
- **UNVERIFIED:** ยังไม่มีหลักฐานว่า "scheduling integrity" ขายได้จริงในตลาดไทย — คู่แข่งไม่โฆษณาจุดนี้เป็นหลัก (competitor matrix ไม่มีใคร lead ด้วย collision control) — อาจเป็นได้ทั้ง blue ocean หรือ "สิ่งที่ลูกค้าไม่ซื้อ"
- **INFERENCE:** ราคา ฿490/฿990 กลาง band อาจถูกต้อง แต่ไม่มีหลักฐาน — pilot WTP interview (ICP_JTBD L91) เป็นขั้นตอนบังคับก่อน lock
- **UNVERIFIED:** ไม่มีหลักฐาน demand-side เลย (ไม่มี pilot, ไม่มี waitlist, ไม่มี inbound interest) — ทุกอย่างเป็น supply-side design

### RECOMMENDATION (สำหรับ council)
1. อย่าถือว่า ฿490/฿990 หรือ ICP เป็น "ความจริง" — ต้องผ่าน pilot (BK-B) ก่อน commercial lock (BK-C)
2. จัดลำดับ auto-slip economics เป็น decision ที่ต้องตัดก่อน — เพราะมันคือครึ่งหนึ่งของ revenue model (Pro tier)
3. วัด pilot ด้วย WTP + time-to-first-value + support burden ตามที่ GTM วางไว้ — `GO_TO_MARKET.md` L15-19
4. ถ้า DB-backed gates ยังเปิดไม่ได้ในระยะเวลาที่รับได้ ควรพิจารณาว่า "scheduling integrity" จะถูกพิสูจน์ได้อย่างไรโดยไม่ต้องรอ — หรือลดน้ำหนัก differentiation ข้อนี้ใน messaging
5. อย่าเปิด paid acquisition จนกว่า activation/retention/support economics วัดได้ — `GO_TO_MARKET.md` L13
