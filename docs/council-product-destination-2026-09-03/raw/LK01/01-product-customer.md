# LK01 WSTERA Link — Product/Customer Lens (Round 1)

**Lens:** Product/Customer — user, buyer, pain, workflow, adoption, willingness to pay
**Date:** 2026-09-03
**Evidence base:** อ่านไฟล์จริงใน repo ทั้ง 12 ไฟล์ที่กำหนด + ตรวจ git state เอง + อ่านไฟล์สนับสนุนเพิ่มเติม (marketing/GO_TO_MARKET.md, marketing/POSITIONING_MESSAGING.md, marketing/KPI_METRICS.md, marketing/LAUNCH_PLAN.md, DOCUMENTATION_AUDIT.md, BUILD_QUEUE.md, references/prototype-v2/FINAL_REPORT.md, docs/daily/2026-09-03.md)
**Git cross-check:** branch `docs/hybrid-billing-promptpay` ✓, HEAD `ae7c474` (commit "docs: refresh LK01 gates after P0a closure" อยู่บน baseline `0bb1ee8` ตามที่ CURRENT_STATUS.md อ้าง) ✓, working tree clean ✓, ไม่มี production application code ใน tree (มีแต่ docs/, vendor/, references/) ✓ — CURRENT_STATUS.md สอดคล้องกับ git state จริง

**Label convention:** VERIFIED = มีหลักฐานใน repo/ระบบจริง / INFERENCE = สรุปจากหลักฐานโดยให้เหตุผล / UNVERIFIED = ไม่มีหลักฐาน / RECOMMENDATION = ข้อเสนอของ lens นี้

---

## 0. ภาพรวมหลักฐาน (Evidence Inventory)

- **VERIFIED:** ผลิตภัณฑ์อยู่ในสถานะ pre-build — ไม่มี production code เลยแม้แต่บรรทัดเดียว (git tree มีเฉพาะ docs/, vendor/modules/, references/prototype-v2/; CURRENT_STATUS.md + daily log 2026-09-03 ยืนยัน "no production application code exists")
- **VERIFIED:** มี documentation pack ครบและผ่าน Documentation Audit (PASS 2026-08-26 + billing addendum 2026-09-02) — เอกสารสอดคล้องกันข้ามไฟล์ (pricing, quota, downgrade, billing authority)
- **VERIFIED:** มี prototype v2 (Python/FastAPI local URL shortener + click analytics) ที่รันได้จริงและ QA PASS — แต่เป็นหลักฐานความ feasibility ทางเทคนิคเท่านั้น
- **UNVERIFIED:** ไม่มีหลักฐานว่า prototype มีผู้ใช้จริงคนเดียว (FINAL_REPORT.md เป็น QA ทางเทคนิค ไม่มี user/customer data)
- **UNVERIFIED:** ไม่มี customer research ใดๆ ใน repo — ค้นหา keyword interview/survey/willingness/competitor/คู่แข่ง/สัมภาษณ์/แบบสอบถาม พบเพียงการอ้างถึงใน GTM plan ว่า "ต้องพิสูจน์" เท่านั้น ไม่มีผลลัพธ์
- **UNVERIFIED:** ไม่มี competitive analysis (ไม่มีตารางเทียบ Bitly/GA/เครื่องมืออื่น ไม่มี benchmark ราคา)
- **UNVERIFIED:** ยังไม่มี pilot tenant, case study, landing page, pricing page, support channel (GTM Readiness Checklist ทุกข้อยัง unchecked)

---

## 1. ปัญหาที่แก้ และแก้ให้ใคร

**คำตอบสั้น:** แก้ปัญหา "โพสต์หลายช่องแต่ไม่รู้ว่าคลิกมาจากไหน + ลิงก์/QR เปลี่ยนปลายทางทีหลังไม่ได้ + วัด outbound click ก่อนออกจากช่องตัวเองไม่ได้" ให้กับร้านค้าออนไลน์ไทย, creator/affiliate, ธุรกิจเล็ก, agency

- **VERIFIED:** Vision (00_PRODUCT_VISION.md) ระบุ product promise: "Create a stable branded link, know which channel sends customers, and change the destination without replacing published links or QR codes" และ JTBD 5 ข้อ (stable link, เปรียบเทียบแหล่ง traffic, เปลี่ยน destination หลังแจกจ่าย, วัด outbound affiliate clicks, มีหลักฐานตัดสินใจ)
- **VERIFIED:** ICP 4 กลุ่ม: (1) Thai online sellers บน Facebook/LINE/TikTok/Shopee-Lazada affiliate/QR, (2) creators/affiliate operators, (3) small businesses, (4) agencies/social admins
- **VERIFIED:** Pain statements ถูกเขียนเป็นคำพูดลูกค้าใน POSITIONING_MESSAGING.md ("โพสต์หลายช่อง แต่ไม่รู้ว่าคลิกมาจากไหน", "QR พิมพ์ไปแล้ว แต่ปลายทางเปลี่ยนทีหลัง", "ลิงก์ร้านดูไม่เป็นแบรนด์", "Affiliate ส่งคนออกจากช่องตัวเองแล้ววัดอะไรต่อไม่ได้", "เครื่องมือใหญ่เกินไป แพงเกินไป")
- **UNVERIFIED:** Pain statements เหล่านี้ไม่มีหลักฐานว่ามาจากการสัมภาษณ์/สำรวจจริง — เป็นสมมติฐานที่เขียนเป็นคำพูดลูกค้า (ไม่มี interview transcript, survey data, หรือ citation ใดๆ ใน repo)
- **INFERENCE:** ปัญหาหลักที่เอกสารชูคือ "attribution ก่อนออกจากช่อง" (pre-departure click measurement) + "dynamic destination" — ไม่ใช่ "ย่อลิงก์" ซึ่งถูกปฏิเสธอย่างชัดเจนว่าไม่ใช่ positioning หลัก

---

## 2. ใครคือ primary user และใครคือ buyer

- **UNVERIFIED:** เอกสารไม่เคยแยก user กับ buyer อย่างชัดเจน — ไม่มี persona, ไม่มี "ใครจ่าย ใครใช้" ในเอกสารใด
- **VERIFIED:** GTM (GO_TO_MARKET.md) ระบุว่า Pro คือ "default paid plan สำหรับร้าน/creator จริง" — นัยว่า seller/creator คือเป้าหมายผู้จ่ายหลัก
- **VERIFIED:** UX (06_UX_USER_FLOWS.md) ระบุว่า dashboard ต้อง mobile-first "เพราะ target sellers operate heavily from phones" — นัยว่า primary user ทำงานจากมือถือ
- **INFERENCE:** ในทางปฏิบัติ user = เจ้าของร้าน/creator ที่จัดการลิงก์เอง (single-operator) ส่วน buyer = คนเดียวกัน (self-serve) จนกว่าจะถึง Business tier ที่มี team/API ซึ่ง buyer อาจเป็น agency/หัวหน้าทีม — แต่ทั้งหมดเป็น inference เพราะไม่มีหลักฐานแยก user/buyer
- **UNVERIFIED:** ไม่มีหลักฐานว่า seller ไทยยอมจ่ายเงินเอง (self-pay) สำหรับเครื่องมือ analytics — นี่คือสมมติฐานหลักของโมเดลที่ยังไม่ถูกทดสอบ

---

## 3. Branded destination switching + attribution เป็น pain ที่แรงพอจะจ่ายรายเดือนหรือไม่?

**คำตอบสั้น:** ไม่มีหลักฐานใน repo — เป็นสมมติฐานที่ GTM เองยอมรับว่ายังต้องพิสูจน์

- **VERIFIED:** GTM objective เขียนตรงๆ ว่า "หา users กลุ่มแรกที่มี traffic จริง... เพื่อพิสูจน์ activation, repeat usage และ willingness to pay ก่อนขยายตลาด" — เอกสารของตัวเองยอมรับว่า WTP ยังไม่ถูกพิสูจน์
- **VERIFIED:** KPI_METRICS.md "Decision Threshold Rule": "Before enough data exists, targets are hypotheses rather than promises" — หลักการของโปรเจกต์เองถือว่า target/สมมติฐานยังไม่ใช่ข้อเท็จจริง
- **VERIFIED:** ราคา ฿199/฿590 ไม่มีที่มาที่ไปในเอกสาร — ไม่มี cost model, ไม่มี value-based justification, ไม่มี benchmark กับคู่แข่ง
- **UNVERIFIED:** ไม่มีหลักฐานว่า "เปลี่ยน destination โดยไม่ต้องแก้โพสต์เก่า" เป็น pain ที่คนจ่ายเงินจริง (dynamic destination เป็น feature ที่ Bitly/เครื่องมืออื่นก็มีในบาง tier — เอกสารไม่ได้วิเคราะห์ว่าต่างกันตรงไหนในมุมลูกค้า)
- **INFERENCE:** ความเสี่ยงหลักของผลิตภัณฑ์นี้คือ "nice-to-have มากกว่า must-have" — attribution ก่อนออกจากช่องเป็นข้อมูลที่มีประโยชน์ แต่ seller ไทยส่วนใหญ่ใช้ platform-native analytics (Facebook Insights, LINE Official Account stats) ฟรีอยู่แล้ว และอาจไม่รู้สึกเจ็บพอจะจ่าย ฿199/เดือน จนกว่าจะเห็นหลักฐานว่าข้อมูลนี้เปลี่ยนการตัดสินใจ/รายได้จริง
- **INFERENCE:** จุดที่อาจมี WTP จริงที่สุดคือ affiliate/creator ที่ต้องการ first-party outbound click evidence (เพราะ platform ไม่ให้ข้อมูลนี้กับ affiliate) — แต่ก็เป็น inference เพราะไม่มีหลักฐาน

---

## 4. ควรเริ่ม segment ไหนก่อน: seller, creator/affiliate, หรือ agency?

**คำตอบสั้น:** เอกสารเลือก seller ก่อน (ตาม GTM beachhead) แต่ lens นี้เห็นว่า creator/affiliate มีเหตุผลเชิง WTP แข็งกว่า — ต้องทดสอบทั้งคู่ใน beta

- **VERIFIED:** GTM beachhead เรียงลำดับ: (1) ร้านค้าออนไลน์/เพจขายของ, (2) creator/affiliate, (3) ร้านบริการที่ใช้ QR, (4) agency ขนาดเล็ก — และ acquisition order: dogfooding → friendly businesses → seller/creator communities → content/SEO → referral/agency (agency มาท้ายสุด)
- **VERIFIED:** First 100 tenant strategy: 10 internal/friendly pilot → 20 closed beta → 20 paid beta → 50 public early adopters (เป็น planning target ไม่ใช่ guarantee)
- **INFERENCE:** เหตุผลที่ seller มาก่อนในเอกสารน่าจะเป็น "ตลาดใหญ่ + เข้าถึงง่ายผ่าน community" แต่ seller มีทางเลือกฟรีเยอะ (platform-native analytics) และมี pain เรื่อง attribution น้อยกว่า affiliate
- **INFERENCE:** creator/affiliate เป็น segment ที่ (ก) มี pain แรงสุดเพราะ platform ไม่ให้ outbound click data แก่ affiliate, (ข) คุ้นเคยกับการใช้เครื่องมือ paid อยู่แล้ว (affiliate marketing มีค่าใช้จ่ายเครื่องมือเป็นเรื่องปกติ), (ค) วัด ROI ได้ชัดเจน — แต่เป็น inference ไม่มีหลักฐาน
- **RECOMMENDATION:** อย่าเลือก segment เดียว upfront — ใช้ closed beta (20 tenants) แบ่งเป็น seller กับ creator/affiliate อย่างละครึ่ง แล้วให้ data ตัดสิน (ดู activation rate, return-to-dashboard rate, และ conversion intent ตาม KPI framework ที่มีอยู่แล้ว) — เอกสารมีกลไกวัดอยู่แล้ว แค่ยังไม่มีข้อมูล
- **RECOMMENDATION:** Agency ควรเลื่อนไปทีหลังจริงตามเอกสาร เพราะต้องมี workflow ที่ stable ก่อน และ agency มีความต้องการ feature (multi-client, reporting) ที่ยังไม่ใช่ V1

---

## 5. ทำไมต้องใช้ WSTERA Link แทน short-link/analytics tools เดิม และ platform-native analytics?

**คำตอบสั้น:** เอกสารมี positioning argument แต่ไม่มีหลักฐานว่า argument นี้ชนะในตลาดจริง

- **VERIFIED:** POSITIONING_MESSAGING.md มี objection handling ครบ: vs Bitly ฟรี = "เน้น workflow ร้าน/creator ที่ต้องการ campaign visibility, branded link, QR และ dynamic destination ในแพ็กเกจที่เข้าใจง่าย ไม่ใช่แข่งด้วยคำว่า short URL อย่างเดียว"; vs GA = "GA วัดเว็บไซต์ปลายทางได้ดี แต่ WSTERA Link เน้นจุดก่อนออกจากช่องของคุณ เช่น Facebook/LINE/QR/affiliate outbound links"
- **VERIFIED:** เอกสารระบุชัดเจนว่าไม่แทนที่ GA หรือ ad-platform attribution (What We Do Not Claim) — เป็น positioning ที่ซื่อสัตย์
- **UNVERIFIED:** ไม่มี competitive analysis — ไม่มีหลักฐานว่า Bitly/GA/platform-native analytics มีช่องโหว่จริงในมุมลูกค้าไทย หรือว่า WSTERA Link ต่างจริงในสิ่งที่ลูกค้าใส่ใจ
- **INFERENCE:** จุดต่างที่จับต้องได้จริงที่สุดคือ (1) dynamic destination + QR ที่พิมพ์แล้วไม่ต้องพิมพ์ใหม่, (2) first-party outbound click measurement สำหรับ affiliate, (3) ภาษา/บริบทไทย + PromptPay — แต่จุด (3) เป็นเรื่อง payment ไม่ใช่ core value
- **INFERENCE:** จุดอ่อน: Bitly ฟรี + GA ฟรี + platform-native analytics ฟรี ตั้งกำแพงราคาไว้ที่ ฿0 — WSTERA Link ต้องพิสูจน์ว่า "workflow ที่เข้าใจง่าย + ข้อมูลก่อนออกจากช่อง" ต่างพอที่จะจ่าย ฿199/เดือน ซึ่งยังไม่มีหลักฐาน
- **RECOMMENDATION:** ก่อน Phase 7 ต้องมี minimum competitive scan (Bitly free tier, GA4, platform-native) อย่างน้อย 1 หน้าใน repo เพื่อให้ sales narrative มีหลักฐาน ไม่ใช่แค่ positioning copy

---

## 6. Free/Pro/Business boundaries สอดคล้องกับ value จริง หรือเป็นแค่ documented hypothesis?

**คำตอบสั้น:** เป็น documented hypothesis ที่สอดคล้องกันภายใน (internally consistent) แต่ไม่มีการ validate กับ value จริง

- **VERIFIED:** ขอบเขต plan สอดคล้องกันข้ามทุกไฟล์ (PRD FR-Q-001..003, 04_PRICING_ENTITLEMENTS.md, PRODUCT_DECISIONS.md, DOCUMENTATION_AUDIT.md PASS): Free 5 links/250 clicks/7d/1 destination change, Pro ฿199 500/50k/365d + campaigns/UTM/custom domain/export/unlimited edits, Business ฿590 5,000/500k/730d + team/API/webhook
- **VERIFIED:** หลักการออกแบบ Free ถูกเขียนไว้ชัด: "Free must demonstrate value, not replace a paid plan indefinitely" (Vision) และ "Free ออกแบบให้ทดลอง value loop จริงโดยไม่ทำให้ paid plan ไม่มีเหตุผล" (Positioning)
- **UNVERIFIED:** ไม่มีหลักฐานว่า 250 clicks/เดือน หรือ 5 links เหมาะกับ seller จริง — ตัวเลขนี้ไม่มีที่มา (ไม่มี usage data จาก prototype, ไม่มี benchmark, ไม่มี customer input)
- **UNVERIFIED:** ไม่มีหลักฐานว่า "365-day retention" หรือ "unlimited destination edits" เป็นสิ่งที่ลูกค้าเต็มใจจ่าย ฿199/เดือน — เอกสารจัดให้เป็น paid value แต่ไม่เคยถามลูกค้า
- **INFERENCE:** โครงสร้าง plan ดูสมเหตุสมผลเชิง logic (free = proof of value loop, pro = individual operator, business = team/API) แต่ตัวเลข quota ทั้งหมดเป็น guess — ความเสี่ยงคือ free tier ใจดีเกินไป (250 clicks อาจพอใช้ฟรีตลอดไปสำหรับร้านเล็ก) หรือเข้มงวดเกินไป (5 links อาจ block การทดลองก่อนเห็น value)
- **RECOMMENDATION:** ตั้ง quota เป็น config ที่ปรับได้ (เอกสารมี seed plans ใน Phase 7 อยู่แล้ว) และใช้ closed beta data ปรับก่อน paid beta — อย่า lock ตัวเลขเป็น "ความจริง" จนกว่าจะมี usage data

---

## 7. V1 ที่เล็กที่สุดที่ hot-path-safe และ validate willingness to pay

**คำตอบสั้น:** Phases 0–4 (link core + redirect + analytics + quota + billing) + อย่างน้อย 1 paid feature ที่จับต้องได้ — โดยไม่ต้องรอ custom domain

- **VERIFIED:** สถาปัตยกรรมแยก hot path ชัดเจนอยู่แล้ว: redirect ไม่มี synchronous dependency กับ analytics/billing (NFR-REL-001, FR-REDIRECT-003, failure matrix ใน 02_SYSTEM_ARCHITECTURE.md) — hot-path safety เป็น design principle ที่ lock ไว้แล้ว
- **VERIFIED:** Funnel การ monetize ถูกออกแบบไว้: "Visitor → Signup → First Link → First Real Click → Return to Analytics → Second Link/Campaign → Limit/Paid Feature Need → Upgrade" (GO_TO_MARKET.md) — กลไกการขายคือ quota/feature ceiling กระตุ้น upgrade
- **VERIFIED:** Roadmap เรียง Phase 0→7 โดย Phase 4 (billing) อยู่ก่อน Phase 5 (paid features) — หมายความว่า paid beta (Stage 2) เริ่มได้ด้วย Pro = higher limits + 365-day retention + unlimited edits โดยยังไม่มี custom domain/campaign/UTM/export
- **INFERENCE:** WTP validation ไม่จำเป็นต้องรอ custom domain — สิ่งที่ต้องมีคือ (1) value loop ทำงาน (link → click → analytics), (2) quota ชนจริง, (3) upgrade path จ่ายจริงได้ (Card + PromptPay), (4) entitlement ถูกบังคับจริง — ครบใน Phases 0–4
- **RECOMMENDATION:** V1 สำหรับ WTP validation = Phases 0–4 + เปิด Pro ขายด้วย "higher limits + 365-day retention + unlimited destination edits" เป็นหลัก (custom domain เป็น Phase 5 hook สำหรับ retention/upsell ไม่ใช่ gate ของ WTP) — ถ้าไม่มีใครจ่าย ฿199 เพื่อ quota/retention ที่สูงขึ้น แสดงว่า core value hypothesis ผิด ต้องกลับไปทบทวนก่อนลงทุน Phase 5
- **RECOMMENDATION:** เพิ่ม "destination change" เป็น paid trigger ที่ชัดเจนใน UX — เพราะเป็น JTBD ที่ต่างจากคู่แข่งฟรีมากที่สุด และเป็น moment ที่ user เจ็บจริง (โพสต์/QR แจกจ่ายไปแล้ว) — เอกสารมี 1 change/link ใน Free อยู่แล้ว ใช้ moment นี้เป็น upgrade CTA หลัก

---

## 8. Minimum V1 finish line ที่ usable และ sellable

**คำตอบสั้น:** Usable = Closed Beta (Phase 3 gate ผ่าน), Sellable = Paid Beta (Phase 4 Money Gate ผ่าน) — ตาม Launch Plan ที่ lock ไว้

- **VERIFIED:** Launch Plan Stage 1 (Closed Beta) entry = Phase 3 Analytics/Quota Gate PASS — usable หมายถึง: create/edit/disable/QR, redirect ถูกต้อง, analytics อ่านเข้าใจ, quota ทำงาน, privacy notice พร้อม
- **VERIFIED:** Launch Plan Stage 2 (Paid Beta) entry = Phase 4 Money Gate PASS — sellable หมายถึง: จ่ายจริงได้ (Card + PromptPay), entitlement ไม่มี forgery path, pricing ที่โชว์ = entitlement ที่บังคับจริง, refund/cancel/support process พร้อม
- **VERIFIED:** Stage 2 exit criteria รวม "successful real paid transactions" และ "measure Free→Paid conversion intent" — เอกสารนิยาม "sellable" ไว้แล้วว่าต้องมี transaction จริง
- **VERIFIED:** ยังไม่มี gate ใดผ่าน (ทุก phase ยังไม่เริ่ม — implementation hold ตาม CURRENT_STATUS.md)
- **INFERENCE:** ลำดับที่ถูกต้องตามเอกสารคือ อย่าขายก่อน Phase 4 — การเปิด paid beta ก่อน Money Gate จะทำลายความน่าเชื่อถือ (entitlement/billing ผิดพลาด = churn ทันทีใน segment ที่ sensitive เรื่องเงิน)
- **RECOMMENDATION:** Minimum sellable V1 = Phases 0–4 + Stage 2 exit criteria ครบ + อย่างน้อย 1 case study จาก closed beta (มี template ใน GTM แล้ว) — อย่าเปิด public launch (Stage 4) จนกว่า paid beta จะพิสูจน์ conversion intent จริง

---

## 9. Verdict สรุป (Product/Customer Lens)

**Verdict: เอกสาร product contract ดีและสอดคล้องกัน (VERIFIED) แต่ customer validation = ศูนย์ (UNVERIFIED ทุกข้อที่เกี่ยวกับลูกค้า) — ผลิตภัณฑ์นี้ยังเป็น "documented hypothesis" ไม่ใช่ "validated product"**

จุดแข็ง (VERIFIED):
- Product contract ครบถ้วน สอดคล้องข้ามไฟล์ มี gate/evidence discipline ที่ดี
- Hot-path safety และ billing authority เป็น design ที่คิดมาดี — ลดความเสี่ยงด้าน trust
- GTM/KPI framework ซื่อสัตย์ — ยอมรับว่า WTP ยังต้องพิสูจน์ ไม่โอ้อวด
- PromptPay + ภาษาไทย + mobile-first = เข้ากับบริบทผู้ใช้ไทยจริง

จุดเสี่ยงหลัก (UNVERIFIED/INFERENCE):
1. **ไม่มีหลักฐาน WTP เลย** — ราคา ฿199/฿590 และ quota ทั้งหมดเป็น guess
2. **คู่แข่งฟรีตั้งกำแพงที่ ฿0** — Bitly/GA/platform-native analytics ฟรีทั้งหมด; differentiation ที่เอกสารอ้าง (workflow, pre-departure attribution) ยังไม่ถูกพิสูจน์ว่าลูกค้าใส่ใจ
3. **User ≠ Buyer ไม่ถูกแยก** — โมเดล self-serve seller-pay เป็นสมมติฐาน
4. **Segment แรก (seller) อาจไม่ใช่ segment ที่ WTP แรงสุด** — affiliate/creator มีเหตุผลเชิง pain แข็งกว่า แต่เอกสารเลือก seller ตามขนาดตลาด

Dissent / ความไม่เห็นด้วยกับเอกสาร:
- เอกสาร lock "seller ก่อน" เป็น beachhead โดยไม่มีหลักฐาน — lens นี้เห็นว่า closed beta ควรทดสอบ seller + creator/affiliate คู่กัน แล้วให้ data ตัดสิน (เอกสารมีกลไกอยู่แล้ว แค่ต้องไม่ lock segment เร็วเกินไป)
- เอกสารวาง custom domain เป็น paid feature หลัก (Pro) แต่ lens นี้เห็นว่า WTP validation ควรพึ่ง "quota/retention/unlimited edits" ก่อน — custom domain เป็น nice-to-have สำหรับ segment ไทยส่วนใหญ่ (คนไทยไม่ค่อยมี domain ของตัวเอง) และอาจเป็น value ที่อ่อนที่สุดใน 3 paid pillars

Uncertainty ที่ต้องยอมรับ:
- ทั้งหมดข้างต้นอิงจากเอกสารใน repo เท่านั้น — ไม่มีข้อมูลตลาดจริงให้ตรวจทาน; ถ้ามี customer interview/survey อยู่นอก repo (เช่นใน vault หรือ Drive) ต้องนำมา merge ก่อนสรุปขั้นสุดท้าย
- ตัวเลข quota/ราคาอาจมีที่มาจากประสบการณ์ของคุณฟรี (owner) ที่ไม่ได้บันทึกใน repo — ถ้าเป็นเช่นนั้น ควรบันทึกเป็น evidence เพื่อให้ council ตัดสินด้วยข้อมูลครบ

**คำตอบตรงคำถาม 8 ข้อ (TL;DR):**
1. แก้ปัญหา attribution ก่อนออกจากช่อง + dynamic destination ให้ seller/creator/ธุรกิจเล็กไทย — VERIFIED (เป็นเอกสาร) / UNVERIFIED (ว่าเป็น pain จริง)
2. User = เจ้าของร้าน/creator; Buyer = ไม่ถูกแยกในเอกสาร — UNVERIFIED
3. ยังไม่มีหลักฐานว่าแรงพอจะจ่ายรายเดือน — UNVERIFIED (เอกสารเองยอมรับ)
4. เอกสารเลือก seller ก่อน; lens แนะนำทดสอบ seller + creator/affiliate คู่กัน — RECOMMENDATION
5. มี positioning argument แต่ไม่มี competitive evidence — UNVERIFIED
6. Plan boundaries สอดคล้องกันภายใน (VERIFIED) แต่เป็น hypothesis กับ value จริง (UNVERIFIED)
7. V1 เล็กสุด = Phases 0–4 + Pro ขายด้วย quota/retention/unlimited edits — RECOMMENDATION
8. Usable = Closed Beta (Phase 3 PASS), Sellable = Paid Beta (Phase 4 Money Gate PASS) — VERIFIED ตามเอกสาร
