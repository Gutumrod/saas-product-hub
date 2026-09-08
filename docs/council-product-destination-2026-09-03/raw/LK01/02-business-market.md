# LK01 WSTERA Link — Business/Market Lens (Round 1)

**Lens:** Business/Market — revenue model, competition, differentiation, distribution, commercial viability
**Date:** 2026-09-03
**Evidence base:** docs/00_PRODUCT_VISION.md, 01_PRD.md, 04_PRICING_ENTITLEMENTS.md, 05_ANALYTICS_SPEC.md, 07_DEVELOPMENT_ROADMAP.md, ADR-001_HYBRID_BILLING_PROMPTPAY.md, PRODUCT_DECISIONS.md, CURRENT_STATUS.md, marketing/GO_TO_MARKET.md, marketing/POSITIONING_MESSAGING.md, marketing/LAUNCH_PLAN.md, marketing/KPI_METRICS.md (+ repo-wide scan for competitor/TAM evidence)
**Label convention:** VERIFIED = อ่านจากเอกสารใน repo โดยตรง / INFERENCE = สรุปเชิงตรรกะจากหลักฐาน / UNVERIFIED = ไม่มีหลักฐานใน repo / UNKNOWN = ไม่มีข้อมูล / RECOMMENDATION = ข้อเสนอของ lens นี้

---

## 0. สถานะหลักฐานโดยรวม (Evidence Inventory)

- VERIFIED: ผลิตภัณฑ์เป็น pre-build — ไม่มี production code (CURRENT_STATUS.md, daily/2026-09-03.md) และ repo scan ยืนยันว่าไม่มีไฟล์ implementation
- VERIFIED: โครงสร้างราคา 3 แผน + entitlement matrix ถูก LOCK เป็น baseline (04_PRICING_ENTITLEMENTS.md, PRODUCT_DECISIONS.md, PRD FR-BILL-002/FR-Q-001..003)
- VERIFIED: มี GTM, positioning, launch plan, KPI framework ครบชุด (marketing/*)
- **UNVERIFIED/UNKNOWN: ไม่พบหลักฐานใดใน repo เกี่ยวกับ — ขนาดตลาด/TAM, การวิเคราะห์คู่แข่งเชิงลึก (ราคา/feature ของ Bitly, Rebrandly, ฯลฯ), customer interview / demand validation, willingness-to-pay, ต้นทุนต่อหน่วย/unit economics, churn หรือ retention data ใดๆ**
- UNVERIFIED: ไม่มีหลักฐานว่า pricing/entitlement ตัวเลขใดผ่านการทดสอบกับผู้ใช้จริง (เอกสารระบุเองว่า KPI targets เป็น "hypotheses rather than promises" — KPI_METRICS.md "Decision Threshold Rule")

---

## 1. ผลิตภัณฑ์ทำเงินอย่างไร และทำไม buyer ถึงจ่าย/จ่ายต่อ

### Revenue model
- VERIFIED: รายได้ = subscription รายเดือน 2 ระดับ: Pro ฿199/เดือน, Business ฿590/เดือน (PRD FR-BILL-002; 04_PRICING_ENTITLEMENTS.md)
- VERIFIED: Free ฿0 — 5 active links, 250 tracked clicks/เดือน, 7-day analytics, 1 destination change/link (PRD FR-Q-001; 04_PRICING_ENTITLEMENTS.md)
- VERIFIED: Pro ปลดล็อก campaign grouping, UTM builder, custom domain, unlimited destination edits, CSV export, 365-day analytics (PRD FR-PAID-001)
- VERIFIED: Business เพิ่ม team access + API/webhook (PRD FR-PAID-002)
- VERIFIED: ช่องทางชำระ 2 แบบ — Card recurring (Stripe) และ PromptPay manual non-auto-renew (ADR-001) — PromptPay ต้องมี reconciliation ก่อนเปิดใช้งาน
- VERIFIED: ไม่มี promotional trial ใน V1 (04_PRICING_ENTITLEMENTS.md; PRODUCT_DECISIONS.md)
- INFERENCE: รายได้ต่อ tenant ต่อเดือน = ฿199 หรือ ฿590 เท่านั้น ไม่มี add-on/usage-based revenue ใน V1 — รายได้เติบโตต้องพึ่ง tenant count × conversion เท่านั้น

### ทำไม buyer ถึงจ่าย (ตามที่เอกสารอ้าง)
- VERIFIED (เอกสารอ้าง): value pillars = stable link, useful analytics, branded presence (custom domain), practical pricing (POSITIONING_MESSAGING.md)
- VERIFIED (เอกสารอ้าง): Free ออกแบบให้พิสูจน์ value loop (link → real click → analytics) แล้ว upgrade เมื่อ traffic/feature โต (GO_TO_MARKET.md Offer Strategy; POSITIONING_MESSAGING.md objection "250 clicks ฟรีน้อยไปไหม?")
- **UNVERIFIED: ไม่มีหลักฐานว่า buyer จริงยอมจ่าย** — ไม่มี paid-beta data, ไม่มี customer interview, ไม่มี case study ที่มี outcome จริง (Launch Plan ระบุ case study ต้องมี "Real measurement period" และ "Permission to publish" — ยังไม่มี)

### ทำไม buyer ถึงจ่ายต่อ (retention logic)
- VERIFIED (เอกสารอ้าง): ลิงก์/QR ที่เผยแพร่ไปแล้วผูกกับระบบ — paid→free ไม่ทำลายลิงก์ default domain (PRD Downgrade Rules; PRODUCT_DECISIONS.md) แต่ custom domain routing ถูกปิดหลัง 7-day grace
- INFERENCE: switching cost เกิดจาก "ลิงก์ที่พิมพ์/โพสต์ไปแล้ว" — ถ้าเปลี่ยนระบบ ต้องแก้สื่อที่เผยแพร่แล้วทั้งหมด นี่คือ lock-in เชิงพฤติกรรมที่แท้จริงของผลิตภัณฑ์
- INFERENCE: แต่ lock-in นี้มีขีดจำกัด — ถ้า user ใช้ default domain `go.wstera.com` (ไม่ใช่ custom domain) การย้ายออกไปยัง Bitly/Rebrandly ฟรีทำได้โดยเสียแค่ "ลิงก์เก่า" ซึ่ง seller หลายรายอาจยอมรับได้ถ้าไม่เห็น value ต่อเนื่อง
- UNVERIFIED: ไม่มี retention target ที่มีหลักฐาน — KPI มี "Tenant retention by signup cohort, Paid logo retention, Revenue retention" (KPI_METRICS.md) แต่เป็นกรอบวัด ไม่ใช่ผลลัพธ์

---

## 2. Branded destination switching + attribution — pain แรงพอสำหรับ recurring payment หรือไม่?

### หลักฐานที่สนับสนุนว่า pain มีจริง
- VERIFIED (เอกสารอ้าง): pain statements — "โพสต์หลายช่อง แต่ไม่รู้ว่าคลิกมาจากไหน", "QR พิมพ์ไปแล้ว แต่ปลายทางเปลี่ยนทีหลัง", "ลิงก์ร้านดูไม่เป็นแบรนด์", "Affiliate ส่งคนออกจากช่องตัวเองแล้ววัดอะไรต่อไม่ได้" (POSITIONING_MESSAGING.md)
- VERIFIED (เอกสารอ้าง): JTBD — เปลี่ยน destination หลังลิงก์/QR เผยแพร่แล้ว, เปรียบเทียบ traffic ตามช่องทาง (00_PRODUCT_VISION.md)
- VERIFIED: ฟีเจอร์ destination switching เป็น core ของผลิตภัณฑ์ (FR-LINK-004, FR-LINK-006 QR encodes stable URL) — ไม่ใช่ feature เสริม

### การประเมินความแรงของ pain (lens นี้)
- INFERENCE: "เปลี่ยน destination โดยไม่ต้องแก้ QR ที่พิมพ์แล้ว" เป็น pain ที่**เฉพาะเจาะจงและจับต้องได้** สำหรับธุรกิจที่พิมพ์ QR ลงสื่อจริง (ป้ายหน้าร้าน, โบรชัวร์, แพ็กเกจ) — การพิมพ์ QR ใหม่มีต้นทุนจริง (พิมพ์ซ้ำ, แก้สื่อ) นี่คือจุดที่ Bitly ฟรี/เครื่องมือย่อลิงก์ทั่วไป**ไม่ตอบ** (Bitly เปลี่ยน destination ได้เช่นกัน แต่ไม่ใช่ positioning หลัก และไม่มี QR-centric workflow)
- INFERENCE: "รู้ว่าคลิกมาจากช่องไหน" เป็น pain ที่**มีอยู่จริงแต่ competition แน่น** — platform-native analytics (Facebook Insights, LINE Official Account analytics, TikTok analytics) ให้ข้อมูลคล้ายกันฟรีสำหรับ traffic ในแพลตฟอร์มนั้นๆ จุดที่ WSTERA Link ต่างคือ cross-channel + outbound click (ก่อนออกจากช่อง) ซึ่ง platform วัดไม่ได้
- **UNVERIFIED: ความเต็มใจจ่าย (willingness to pay) สำหรับ pain นี้ยังไม่ถูกพิสูจน์** — ฿199/เดือน เทียบกับค่าใช้จ่ายอื่นของ seller ไทยรายเล็ก (ค่าโฆษณา, ค่าเครื่องมือ) อยู่ในระดับ "ถูกพอจะลอง" แต่ไม่มีหลักฐานว่า seller เห็นว่าคุ้มที่จะจ่ายต่อเนื่อง
- INFERENCE: ความเสี่ยงเชิงโครงสร้าง — attribution analytics เป็น "nice-to-have" สำหรับ seller หลายราย (ข้อมูลช่วยตัดสินใจ แต่ไม่ใช่สิ่งที่ทำให้ขายได้โดยตรง) ต่างจาก affiliate/creator ที่ click = commission โดยตรง → **creator/affiliate มี pain ที่เชื่อมกับรายได้โดยตรงมากกว่า seller**
- UNVERIFIED: ไม่มีหลักฐานว่า "branded link" (custom domain) เป็นเหตุผลหลักที่คนจ่าย — เอกสารวางเป็น value pillar (POSITIONING_MESSAGING.md) แต่ไม่มี evidence ว่า user จ่ายเพราะแบรนด์ vs จ่ายเพราะ analytics/limits

**Verdict ข้อนี้:** pain มีเหตุผลเชิงตรรกะ (INFERENCE) แต่ความแรงพอสำหรับ recurring payment ยังเป็น **UNVERIFIED** — ต้องพิสูจน์ด้วย paid beta ก่อน (ซึ่ง Launch Plan Stage 2 วางไว้แล้ว: "measure Free→Paid conversion intent")

---

## 3. ควรเริ่ม segment ไหนก่อน: seller, creator/affiliate, หรือ agency?

### หลักฐานในเอกสาร
- VERIFIED: ICP ลำดับ 1 = Thai online sellers (Facebook, LINE, TikTok, Shopee/Lazada affiliate links, QR) (00_PRODUCT_VISION.md)
- VERIFIED: GTM beachhead เรียง seller → creator/affiliate → ร้านบริการ QR → agency/social admin (GO_TO_MARKET.md)
- VERIFIED: Acquisition order วาง agency/referral ไว้เป็น Channel 5 (หลังสุด) (GO_TO_MARKET.md)
- VERIFIED: First 100 tenants = 10 internal/friendly + 20 closed beta + 20 paid beta + 50 early adopters (GO_TO_MARKET.md) — ตัวเลขเป็น planning target ไม่ใช่ guarantee

### การประเมินของ lens นี้
- INFERENCE: **seller เป็น segment ที่ใหญ่ที่สุดและเข้าถึงง่ายที่สุด** (มีจำนวนมาก, ใช้ Facebook/LINE อยู่แล้ว) — เหมาะเป็น segment สำหรับ volume/activation
- INFERENCE: **creator/affiliate เป็น segment ที่จ่ายง่ายที่สุด** — click มีมูลค่าเงินตรง (affiliate commission) และต้องการ first-party outbound click evidence (00_PRODUCT_VISION.md ระบุเป็น ICP #2) — pain เชื่อมกับรายได้โดยตรง
- INFERENCE: **agency เป็น segment ที่ ARPA สูงสุด** (จัดการหลาย client → ต้องใช้ Business tier หลาย seat/API) แต่ซับซ้อนที่สุด (ต้องมี workflow stable ก่อน — เอกสารเองวาง agency ไว้ท้ายสุด)
- RECOMMENDATION: **เริ่มที่ seller (ตามเอกสาร) แต่ให้ paid-beta cohort เน้น creator/affiliate เป็นกลุ่มทดสอบ willingness-to-pay** — seller ให้ volume/activation evidence, creator/affiliate ให้ conversion evidence ที่เร็วและตรงกว่า เอกสารปัจจุบันวางทั้งคู่ไว้ใน ICP แล้ว แต่ไม่มีการแยกกลยุทธ์ monetization ต่อ segment
- RECOMMENDATION: อย่าเริ่มที่ agency — เอกสารถูกต้องที่วางไว้ท้ายสุด (ต้องมี case study + workflow stable ก่อน)

---

## 4. ทำไมต้องใช้ WSTERA Link แทน Bitly/Rebrandly/platform-native analytics?

### หลักฐานในเอกสาร
- VERIFIED: เอกสารระบุชัดว่าไม่ positioning เป็น generic URL shortener (00_PRODUCT_VISION.md; POSITIONING_MESSAGING.md)
- VERIFIED: Objection handling ต่อ Bitly — "WSTERA Link เน้น workflow ร้าน/creator ที่ต้องการ campaign visibility, branded link, QR และ dynamic destination ในแพ็กเกจที่เข้าใจง่าย ไม่ใช่แข่งด้วยคำว่า short URL อย่างเดียว" (POSITIONING_MESSAGING.md)
- VERIFIED: Objection handling ต่อ GA — "GA วัดเว็บไซต์ปลายทางได้ดี แต่ WSTERA Link เน้นจุดก่อนออกจากช่องของคุณ เช่น Facebook/LINE/QR/affiliate outbound links" (POSITIONING_MESSAGING.md)
- **UNVERIFIED: ไม่มี competitor analysis เชิงลึกใน repo** — ไม่มีตารางเปรียบเทียบราคา/feature กับ Bitly, Rebrandly, หรือเครื่องมือไทย ไม่มีข้อมูลว่า Bitly free tier ให้เท่าไร (repo ไม่ได้บันทึก) ไม่มี evidence ว่า differentiation นี้ถูกทดสอบกับผู้ใช้

### การประเมินของ lens นี้
- INFERENCE: differentiation ที่แท้จริงมี 3 จุด: (1) **QR-centric + destination switching** — workflow ที่ Bitly/Rebrandly ไม่ได้ positioning ไว้, (2) **ภาษาไทย + PromptPay + ราคาไทย** — localization จริง (ADR-001 ยืนยันว่า PromptPay เป็น decision เพื่อลด friction ของผู้ใช้ไทย), (3) **ความเรียบง่าย** — "ไม่ใช่ enterprise analytics complexity"
- INFERENCE: จุดอ่อน — ฟีเจอร์ core (short link, click analytics, custom domain, UTM) **ล้วนมีใน Bitly/Rebrandly อยู่แล้ว** ความต่างอยู่ที่ packaging/workflow/localization ไม่ใช่ capability ใหม่ → differentiation เป็น "positioning" มากกว่า "technology moat"
- INFERENCE: ความเสี่ยง — ถ้า Bitly free tier หรือ platform-native analytics ครอบคลุม use case หลักของ seller ได้ (ซึ่งเป็นไปได้สำหรับ seller ที่ใช้แพลตฟอร์มเดียวเป็นหลัก) differentiation จะบางลงมาก จุดที่ WSTERA Link ชนะจริงคือ **multi-channel seller + QR ที่พิมพ์แล้ว** เท่านั้น
- UNVERIFIED: ไม่มีหลักฐานว่า "แพ็กเกจที่เข้าใจง่าย" เอาชนะ "ฟรีและติดตั้งง่ายของ Bitly" ได้จริง — ต้องพิสูจน์ใน beta

---

## 5. Free/Pro/Business boundaries สอดคล้องกับ value จริง หรือเป็นแค่ documented hypothesis?

### หลักฐาน
- VERIFIED: Entitlement matrix ถูก LOCK (04_PRICING_ENTITLEMENTS.md; PRODUCT_DECISIONS.md)
- VERIFIED: Design intent ชัดเจน — Free พิสูจน์ value ไม่ใช่แทน paid (00_PRODUCT_VISION.md Product Principles: "Free must demonstrate value, not replace a paid plan indefinitely")
- VERIFIED: เอกสารยอมรับว่า KPI targets เป็น hypotheses (KPI_METRICS.md Decision Threshold Rule)
- **UNVERIFIED: ไม่มีหลักฐานว่า boundary แต่ละจุด (250 vs 50k vs 500k clicks; 7 vs 365 vs 730 days; 1 vs unlimited destination edits) ผ่านการ calibrate กับผู้ใช้จริง**

### การประเมินของ lens นี้
- INFERENCE: **Free tier 250 clicks/เดือน น่าจะเป็นจุดที่เสี่ยงที่สุด** — seller ที่มี traffic จริง (แม้ร้านเล็ก) มักเกิน 250 clicks/เดือนจากโพสต์เดียว; ถ้า quota หมดเร็วเกินไปก่อนเห็น value loop ครบ (link → click → analytics → insight) user จะ churn ก่อน upgrade เอกสารเองยอมรับประเด็นนี้ใน objection handling ("250 clicks ฟรีน้อยไปไหม?") แต่คำตอบคือ "ควรเข้าสู่ Pro" — ซึ่งเป็น logic ที่ถูกต้อง**เฉพาะเมื่อ** user เห็น value แล้ว
- INFERENCE: **Pro 50k clicks/เดือน กับ Business 500k clicks/เดือน** — ช่องว่าง 10 เท่า สมเหตุสมผลเชิง volume แต่ไม่มี evidence ว่า seller/creator ไทยรายใดต้องการ 500k clicks/เดือน (ถ้าไม่มีใครถึง Business threshold ฟีเจอร์ team/API ก็ไม่ถูกทดสอบจริง)
- INFERENCE: **1 destination change/link ใน Free** — เป็น gate ที่ดู "ตั้งขึ้นเพื่อบังคับ upgrade" มากกว่าสะท้อนต้นทุนจริง (การเปลี่ยน destination มีต้นทุน marginal เกือบศูนย์) — อาจสร้าง friction กับ value proposition หลัก (dynamic destination) ในแผนฟรี
- INFERENCE: **custom domain อยู่ที่ Pro** — สมเหตุสมผล (เป็น feature ที่มีต้นทุนจริง — Cloudflare for SaaS) และเป็น "branded" pillar
- RECOMMENDATION: โครงสร้าง 3 แผน + ลำดับ feature (Pro = analytics/campaign/domain, Business = team/API) **LOCK ได้ในเชิงสถาปัตยกรรม** แต่ตัวเลข quota/ราคา**ต้องถือเป็น hypothesis ที่จะ calibrate หลัง paid beta** — เอกสารมีกลไกอยู่แล้ว (KPI Decision Threshold Rule, ADR change rule) ต้องใช้กลไกนั้นจริง

---

## 6. ความเสี่ยงทางธุรกิจที่ใหญ่ที่สุด

### ความเสี่ยงหลัก (เรียงตามความรุนแรง)
1. **Demand risk — ไม่มีหลักฐาน willingness to pay (UNVERIFIED → ความเสี่ยงสูงสุด)**
   - INFERENCE: ผลิตภัณฑ์อยู่ในตลาดที่เต็มไปด้วยทางเลือกฟรี/ถูก (Bitly free, platform-native analytics) และ pain หลัก (attribution) เป็น "ข้อมูลเพื่อตัดสินใจ" ไม่ใช่ "เครื่องมือทำเงิน" สำหรับ seller ส่วนใหญ่
   - UNVERIFIED: ไม่มี customer interview, ไม่มี paid beta data, ไม่มี case study — เอกสารทั้งหมดเป็น hypothesis ที่เขียนดี
   - RECOMMENDATION: นี่คือเหตุผลที่ paid beta (Launch Plan Stage 2) ต้องเป็น gate ที่เข้มงวดจริง — ถ้า Free→Paid conversion ไม่ผ่าน threshold ต้องกล้าตัดสินใจ REVISE หรือหยุด

2. **Free tier cannibalization / activation trap (INFERENCE)**
   - 250 clicks/เดือน อาจทำให้ (ก) user ที่มี traffic จริงรู้สึกถูกจำกัดเร็วเกินไป → churn ก่อนเห็น value หรือ (ข) user ที่ traffic น้อยอยู่แล้วอยู่ Free ตลอดไปโดยไม่เคยจ่าย
   - เอกสารออกแบบให้ Free "demonstrate value" แต่ไม่มี evidence ว่า 250 clicks เป็นจุดที่ balance ถูกต้อง

3. **Competition commoditization (INFERENCE)**
   - Core capability (short link + analytics + custom domain) เป็น commodity — differentiation อยู่ที่ workflow/localization ซึ่งลอกเลียนได้
   - ความเสี่ยง: ถ้าแพลตฟอร์ม (LINE, TikTok, Shopee) เพิ่ม native outbound-link analytics ฟรี จุดขาย "รู้ว่าคลิกมาจากไหน" จะถูกกัดกร่อน

4. **PromptPay manual renewal → churn จากการลืมต่ออายุ (INFERENCE)**
   - ADR-001 ระบุชัดว่า PromptPay ไม่ auto-renew — user ต้องจ่ายเองทุกเดือน
   - INFERENCE: manual renewal มี churn ตามธรรมชาติ (ลืม, เบื่อ) สูงกว่า card auto-renew — เอกสารมี 3-day grace + reminder แต่ไม่มี evidence ว่า recovery rate จะดีแค่ไหน (KPI มี "Payment failure recovery rate" แต่ยังไม่มี data)
   - RECOMMENDATION: ต้องติดตาม churn แยกตาม payment rail ตั้งแต่ paid beta — ถ้า PromptPay churn สูงมาก อาจต้องพิจารณา multi-month prepaid (3/6/12 เดือน) เป็น option

5. **ความเสี่ยงด้าน execution/portfolio dependency (VERIFIED จากเอกสาร)**
   - VERIFIED: LK01 ถูก hold อยู่หลัง P0b/P1 gates และ billing-core ของ portfolio (CURRENT_STATUS.md) — ความเสี่ยงนี้เป็น operational ไม่ใช่ market แต่กระทบ timing

---

## 7. Pricing architecture: LOCK, REVISE หรือ UNVERIFIED?

### ข้อเท็จจริง
- VERIFIED: เอกสาร LOCK ราคา/entitlement เป็น baseline แล้ว (04_PRICING_ENTITLEMENTS.md, PRODUCT_DECISIONS.md, PRD)
- VERIFIED: เอกสารมีกลไกเปลี่ยน (ADR change rule, KPI Decision Threshold Rule)
- UNVERIFIED: ไม่มีหลักฐาน market validation ของตัวเลขใดๆ

### Verdict ของ lens นี้: **UNVERIFIED (โครงสร้าง LOCK ได้, ตัวเลขต้องถือเป็น hypothesis ที่จะ calibrate)**

เหตุผล:
- RECOMMENDATION: **LOCK โครงสร้าง** — 3 แผน, ลำดับ feature (Pro = analytics/campaign/domain, Business = team/API), ราคา ฿199/฿590, Card+PromptPay — โครงสร้างนี้สมเหตุสมผลเชิงตรรกะและจำเป็นต้อง LOCK เพื่อให้ build ดำเนินต่อได้
- RECOMMENDATION: **ถือตัวเลข quota เป็น UNVERIFIED** — โดยเฉพาะ (ก) Free 250 clicks/เดือน, (ข) 1 destination change/link ใน Free, (ค) Business 500k clicks/เดือน — ตัวเลขทั้งสามไม่มี evidence และมีผลต่อ conversion/churn โดยตรง
- RECOMMENDATION: กำหนด **paid-beta decision gate** ไว้ล่วงหน้า: หลัง paid beta (Launch Plan Stage 2) ต้องมีตัวเลข Free→Paid conversion, churn แยกตาม payment rail, และเหตุผลจ่าย/ไม่จ่าย (GO_TO_MARKET.md Feedback Loop มีคำถามนี้อยู่แล้ว) — แล้วค่อยตัดสินใจ REVISE ตัวเลข
- RECOMMENDATION: อย่า REVISE ตอนนี้ (ไม่มี data) แต่อย่า LOCK ตัวเลขแบบถาวร (ไม่มี data เช่นกัน) — สถานะที่ถูกต้องคือ "LOCKED architecture, UNVERIFIED numbers, calibrate at paid beta"

---

## 8. สรุป verdict ของ lens

1. **Revenue model** — VERIFIED: subscription 2 tiers (฿199/฿590) + Free; เรียบง่ายและเข้าใจง่าย แต่ไม่มี add-on revenue ใน V1
2. **Pain strength** — INFERENCE: destination switching + QR มีเหตุผลแรง; attribution เป็น pain จริงแต่ competition แน่น; **willingness to pay = UNVERIFIED**
3. **Segment แรก** — VERIFIED: เอกสารเลือก seller; RECOMMENDATION: seller เพื่อ volume + creator/affiliate ใน paid-beta cohort เพื่อทดสอบ willingness-to-pay; agency ท้ายสุด (ถูกต้องแล้ว)
4. **Differentiation** — INFERENCE: เป็น positioning/localization (QR workflow, ภาษาไทย, PromptPay) ไม่ใช่ technology moat; core capability เป็น commodity
5. **Free/Pro/Business boundaries** — UNVERIFIED: design intent ชัดเจน แต่ตัวเลข quota ไม่มี calibration; Free 250 clicks และ 1 destination change เป็นจุดเสี่ยง
6. **ความเสี่ยงใหญ่สุด** — RECOMMENDATION: demand risk (ไม่มีหลักฐาน willingness to pay ในตลาดที่มีทางเลือกฟรี) รองลงมาคือ Free-tier design และ PromptPay manual-renewal churn
7. **Pricing verdict** — **UNVERIFIED**: LOCK โครงสร้าง, calibrate ตัวเลขที่ paid beta

### Dissent / ความไม่แน่นอน
- ผมไม่เห็นด้วยกับสมมติฐานที่แฝงในเอกสารว่า "Free 250 clicks พอให้เห็น value" — ไม่มี evidence และผมประเมินว่าน่าจะต่ำเกินไปสำหรับ seller ที่มี traffic จริง (INFERENCE, ไม่ใช่ข้อเท็จจริง)
- ผมไม่แน่ใจว่า "branded link" (custom domain) เป็นเหตุผลจ่ายจริงหรือไม่ — เอกสารวางเป็น pillar แต่ผมสงสัยว่า seller ไทยรายเล็กให้คุณค่ากับลิงก์แบรนด์น้อยกว่า analytics/limits (INFERENCE)
- ความไม่แน่นอนหลัก: เอกสารทั้งหมดเขียนอย่างมีวินัยและสอดคล้องกัน แต่**ความสอดคล้องภายใน ≠ ความจริงของตลาด** — ทุกข้อสรุปเชิงพาณิชย์ต้องรอ paid beta
- ข้อจำกัดของ lens นี้: ผมไม่ได้ทำการวิจัยตลาดภายนอก (Bitly pricing ปัจจุบัน, ตลาด short-link ไทย) — ข้อมูลเหล่านั้นเป็น UNKNOWN ใน repo และไม่ได้ถูกนำเข้าสู่การวิเคราะห์นี้
