# คำตอบสภา LLM Council (รอบ R3) — ลำดับการสร้าง + ปลายทาง Core รับเงิน WSTERA

**ผู้จัดทำ:** Antigravity (AGY) — Senior Architecture / Billing Engineer  
**เป้าหมาย:** กำหนดลำดับการสร้าง (Build Sequence), นิยาม Milestone, สรุปทิศทางปลายทาง (Internal vs Productized), ประเมินความเสี่ยง และระบุ Assumptions สำหรับระบบรับเงิน WSTERA ตามสถาปัตยกรรม **Candidate D (Thin Billing Orchestrator เหนือ Payment Core + Subscription Core)**

---

## 1. ลำดับการสร้าง / Build Sequence (Phases & Milestones)

การเรียงลำดับถูกออกแบบบนหลักการ **"ความปลอดภัยของเงินและข้อมูลธุรกรรมต้องมาก่อน (Financial Correctness & Zero Data Loss First)"** โดยสร้างรากฐานระดับ Adapter และ Idempotency ให้มั่นคง ก่อนขยับขึ้นไปสร้าง Reconciliation และ Billing Orchestration ในระดับบน

```
Phase 0: Account Verification & Preflight
   │
Phase 1: Persistence & Idempotency Ledger (Supabase)
   │
Phase 2: PromptPay Adapter (Payment Module)
   │
Phase 3: Reconciliation Layer (CF Workers Cron)
   │
Phase 4: Automated Subscription Sweeper (Grace → Expired)
   │
Phase 5: Thin Billing Orchestrator (Multi-Product Host)
   │
Phase 6: E2E Verification & Failure Injection Dry-Run
```

---

### Phase 0: Stripe Account Verification & Preflight Environment
- **เหตุผลที่ต้องทำก่อน:** Stripe PromptPay เปิดใช้งานได้เฉพาะบัญชี Stripe ประเทศไทย (TH Account) และสกุลเงิน THB เท่านั้น หากบัญชีไม่ใช่ TH การพัฒนา Adapter จะติดข้อจำกัดด้าน Provider ทันที
- **ขอบเขตงาน:**
  1. ตรวจสอบและยืนยัน Stripe Account Country = `TH` (ผ่าน Stripe Dashboard หรือ API test call)
  2. ตรวจสอบการตั้งค่า Minor Units (1 THB = 100 satang) ใน `assertValidAmount()`
  3. ตรวจสอบ API Version Pinned ใน Stripe Adapter Config
- **Definition of Done (Milestone 0):**
  - มีหลักฐานยืนยันว่า Stripe Secret Key เป็นบัญชี TH และสามารถสร้าง PromptPay PaymentIntent ในโหมด Test ได้สำเร็จ

---

### Phase 1: Persistence & Atomic Idempotency Ledger (Supabase Storage)
- **เหตุผลที่ต้องทำก่อน:** การประมวลผล Webhook หรือการรัน Reconciliation อาจมีการยิงซ้ำ (Replay/Duplicate events) หากไม่มีฐานข้อมูลที่รองรับ Atomic Idempotency Ledger ตั้งแต่แรก จะเกิดความเสี่ยงดับเบิ้ลเครดิตหรือบันทึกสถานะผิดพลาด
- **ขอบเขตงาน:**
  1. สร้าง Table `processed_billing_events` (เก็บ `provider_event_id`, `provider`, `processed_at`, `payload_hash`) โดยตั้ง Unique Constraint ที่ `provider_event_id`
  2. สร้าง Table `subscriptions` และ `payment_records` ใน Supabase
  3. Implement `SubscriptionRepository.saveForBillingEvent` ให้รันแบบ Atomic Transaction (บันทึก event ID + อัปเดต subscription state ในคำสั่งเดียว)
- **Definition of Done (Milestone 1):**
  - Unit test / Integration test ยืนยันว่าเมื่อส่ง `eventId` ซ้ำ ฟังก์ชัน `saveForBillingEvent` จะ return `false` ทันทีและไม่เปลี่ยนแปลงข้อมูลในฐานข้อมูล

---

### Phase 2: PromptPay Adapter (`promptpay-adapter.ts`)
- **เหตุผลที่ต้องทำก่อน:** ต้องสร้างช่องทางการจ่ายเงินจริงให้ครบตาม `PaymentProvider` contract ก่อนที่จะนำไปต่อกับ Reconciliation และ Orchestration
- **ขอบเขตงาน:**
  1. สร้าง `promptpay-adapter.ts` ใน `modules/payment/adapters/` ตาม contract `PaymentProvider`
  2. ใช้ Web `fetch` (CF Workers compatible) ยิง Stripe API สร้าง PaymentIntent ที่เปิด `payment_method_types: ['promptpay']`
  3. รองรับการดึง QR Code URL / Action Payload ส่งกลับใน `PaymentResult` (`requires_action`)
  4. Implement `getPayment` และ `parsePaymentEvent` สำหรับ `payment_intent.succeeded` และ `payment_intent.payment_failed`
- **Definition of Done (Milestone 2):**
  - `promptpay-adapter.test.ts` ผ่านครบ 100% (สร้าง QR, ดึงสถานะ, map สถานะเข้า 7 normalized states ได้ถูกต้อง)

---

### Phase 3: Host-Side Reconciliation Layer (CF Workers Cron)
- **เหตุผลที่ต้องทำก่อน:** Webhook มีโอกาสหลุด หาย หรือล่าช้า (เช่น Cloudflare cold start หรือ Stripe webhook failure) หากเปิดรับเงินโดยไม่มี Reconciler จะเกิดเคส **"ลูกค้าจ่ายเงินแล้วแต่ระบบไม่ปลดล็อก (เงินหาย/ลูกค้าด่า)"** ทันที
- **ขอบเขตงาน:**
  1. สร้าง Cloudflare Workers Scheduled Cron (ตั้ง Cadence ทุก 5-15 นาที)
  2. Query รายการธุรกรรมที่มีสถานะ `pending` หรือ `processing` ที่ค้างเกิน 5 นาที แต่ไม่เกิน 24 ชั่วโมง
  3. สั่ง Re-fetch สถานะล่าสุดจาก Stripe API ด้วย `getPayment(paymentId)`
  4. ตรวจสอบ Amount Match & Currency Match อย่างเคร่งครัด
  5. อัปเดตสถานะผ่าน Idempotency Ledger ป้องกันการชนกับ Webhook ที่อาจวิ่งเข้ามาพร้อมกัน
- **Definition of Done (Milestone 3):**
  - รัน Simulation ทดสอบ: ตัดการส่ง Webhook ปลอม → Reconciler ตรวจพบและปรับสถานะเป็น `succeeded` พร้อมบันทึกลงฐานข้อมูลได้อย่างถูกต้อง 100%

---

### Phase 4: Automated Subscription Lifecycle Sweeper (Grace Period → Expired)
- **เหตุผลที่ต้องทำก่อน:** แก้ไข Gap สำคัญใน `SubscriptionCore` เนื่องจากไม่มี Provider Webhook ตัวไหนยิงมาบอกว่า "หมดเวลา Grace Period แล้ว" ระบบต้องมีตัวตรวจจับเวลาและสั่ง Transition เอง
- **ขอบเขตงาน:**
  1. เพิ่ม Scheduled Job ใน CF Worker (รันวันละ 1-2 ครั้ง หรือทุกชั่วโมง)
  2. Query ค้นหา Subscription ที่มีสถานะ `grace_period` และ `currentPeriodEnd + grace_days < NOW()`
  3. ยิง `SubscriptionCore.handleBillingEvent({ eventType: 'subscription.expired', accountId })`
  4. อัปเดตสถานะเป็น `expired` และตัดสิทธิ์การใช้งาน (Entitlements lock) หรือลดระดับสู่ Free Tier ตามนโยบาย
- **Definition of Done (Milestone 4):**
  - Scheduled Job ทำงานและเปลี่ยนสถานะ Subscription ที่เลยกำหนด Grace Period เป็น `expired` ได้อย่างแม่นยำ

---

### Phase 5: Thin Billing Orchestrator (Multi-Product Host Integration)
- **เหตุผลที่ต้องทำในจุดนี้:** เมื่อกลไกชำระเงิน, Subscription Lifecycle, และ Reconciler ทำงานได้ถูกต้องแล้ว จึงสร้างเลเยอร์ Orchestration เพื่อเชื่อมต่อไปยัง WSTERA Control Plane และแยกคอนฟิกตามรายโปรดักต์
- **ขอบเขตงาน:**
  1. สร้าง Thin Orchestrator รับ Event จาก Webhook และ Reconciler
  2. โหลด Per-Product Config (Product ID, ระยะ Grace Period, นโยบาย Fallback to Free Tier, ราคา)
  3. จัดการ Flow พิเศษสำหรับ **PromptPay-only Customers** (ระบบส่งแจ้งเตือนต่ออายุทางอีเมลก่อนหมดอายุ 2-5 วัน และหลังหมดอายุ 1 ครั้ง เนื่องจาก PromptPay ไม่สามารถตัดเงินอัตโนมัติได้)
  4. ปลั๊กเข้ากับ Entitlement Engine เพื่อให้แต่ละโปรดักต์เช็ค `canUseFeature()` ได้ทันที
- **Definition of Done (Milestone 5):**
  - โปรดักต์ตัวอย่าง (เช่น `booking` หรือ `WSTERA-Link`) สามารถเรียกผ่าน Orchestrator เพื่อสร้างลิงก์ชำระเงิน, รับ Webhook, และอัปเดตสิทธิ์ผู้ใช้ได้สมบูรณ์

---

### Phase 6: End-to-End Verification & Failure Injection Dry-Run
- **ขอบเขตงาน:**
  1. จำลอง Webhook ล่าช้า / หาย (Verify Reconciliation)
  2. จำลอง Replay Webhook เดิมซ้ำ 5 ครั้ง (Verify Idempotency Ledger)
  3. จำลองลูกค้าชำระเงินผ่าน PromptPay สำเร็จ / หมดอายุ
  4. จำลองบัตรเครดิตถูกปฏิเสธ (Dunning/Grace period trigger)
  5. ทดสอบ Flow เปิด Ticket ขอคืนเงิน (Manual Refund โดยคุณฟรี ผ่าน Stripe Dashboard/API)
- **Definition of Done (Milestone 6):**
  - Test Case ทุกสถานการณ์ผ่านทั้งหมด พร้อมออกรายงาน Readiness Report ก่อนเปิดรับเงินจริง

---

## 2. ปลายทาง / Endgame: ใช้เอง (Internal) vs ขาย Product (Billing-as-a-Service)

### 🎯 ข้อเสนอแนะเชิงกลยุทธ์ (Clear Recommendation)
> **"สร้างเพื่อใช้เองภายใน WSTERA ให้สมบูรณ์ก่อน (Internal Core First) และชะลอการทำ Productized SaaS จนกว่าจะมีโปรดักต์ภายในอย่างน้อย 1-2 ตัวเปิดรับเงินจริงและสร้างรายได้แล้ว"**

### การเปรียบเทียบภาระงาน (Internal Core vs Productized Service)

| มิติการทำงาน | 1. ใช้เองใน WSTERA (Internal Shared Core) | 2. ทำขายภายนอก (`stripe-billing` SaaS) |
|---|---|---|
| **ขอบเขต Core Logic** | เหมือนกัน (`@module-hub/payment` + `subscription`) | เหมือนกัน |
| **Control Plane / Tenancy** | แยกด้วย `product_id` ภายใน WSTERA Control Plane | ต้องทำ Multi-Tenant Self-serve Dashboard เต็มรูปแบบ |
| **Onboarding & Auth** | ฝังในโค้ด/คอนฟิกของทีมงาน WSTERA เอง | ต้องมี UI สมัครสมาชิก, จัดการ API Keys, Secret Rotation |
| **Webhook Delivery** | รับ Webhook เข้าหา Endpoint กลางของ WSTERA | ต้องทำ Webhook Forwarding + Retry Engine ไปยัง Server ของลูกค้าภายนอก |
| **ความรับผิดชอบด้าน Compliance & Support** | ดูแลเฉพาะธุรกิจของตัวเอง | ต้องมี SLA, ระบบซัพพอร์ต 24/7, Docs, SDKs หลายภาษา, ข้อตกลงทางกฎหมาย |
| **ความเสี่ยงการเบี่ยงเบนโฟกัส** | **ต่ำมาก** — ช่วยให้ทุกโปรดักต์ของ WSTERA รับเงินได้ทันที | **สูงมาก** — เพิ่มภาระงาน Support และ UI หน้าบ้านมหาศาล |

### 🛣️ เส้นทางการพัฒนาแบบเป็นลำดับขั้น (Staged Roadmap)
1. **Stage 1 (Internal Powerhouse - ปัจจุบัน):** สร้าง Shared Core และ Thin Orchestrator ใช้ร่วมกันในทุกโปรดักต์ของ WSTERA (Booking, WSTERA-Link, DocCraft ฯลฯ) เพื่อให้รับเงินได้เร็วที่สุดและทดสอบระบบในสภาพแวดล้อมจริง
2. **Stage 2 (Battle-Tested Foundation):** ให้ระบบรันจริงกับลูกค้าจริง ปรับจูนระบบ Reconciliation, Dunning, และ PromptPay Lifecycles จนเสถียร 100%
3. **Stage 3 (Commercial Productization):** เมื่อ Core เสถียรและพิสูจน์แล้วว่าประหยัดต้นทุน/สร้างรายได้ จึงนำโครงสร้างนี้มาหุ้มด้วย Dashboard + API Key Management เพื่อเปิดตัวเป็นโปรดักต์ `stripe-billing` ออกสู่ตลาดภายนอก

---

## 3. ความเสี่ยงหลักและการจัดการ (Key Risks & Mitigations)

เรียงลำดับตามระดับผลกระทบต่อความปลอดภัยทางการเงินและการดำเนินงาน (Ranked by Impact):

1. **ความเสี่ยงเงินหายจาก Webhook พลาด (Missed Webhook → Lost Revenue) — [วิกฤตสูงสุด / Rank 1]**
   - *ผลกระทบ:* ลูกค้าโอนเงิน/ตัดบัตรสำเร็จ แต่ระบบไม่ปลดล็อกสิทธิ์
   - *มาตรการป้องกัน:* ใช้ **Host-Side Reconciliation Layer (CF Workers Cron)** คอย Polling รายการที่ค้าง `pending`/`processing` ทุก 5-15 นาที พร้อมตรวจสอบ Re-fetch Amount Match เสมอ

2. **ความเสี่ยงข้อมูลธุรกรรมซ้ำซ้อน (Idempotency Gaps & Double Crediting) — [วิกฤต / Rank 2]**
   - *ผลกระทบ:* เมื่อ Webhook ส่งซ้ำ หรือ Reconciler ทำงานซ้อนกับ Webhook อาจเกิดการต่ออายุซ้ำซ้อน
   - *มาตรการป้องกัน:* บังคับใช้ `saveForBillingEvent` ร่วมกับ Database Unique Constraint บน `provider_event_id` ในระดับ Atomic Transaction

3. **ความเสี่ยงบัญชี Stripe ไม่รองรับ PromptPay (Non-TH Stripe Account) — [บล็อกเกอร์ / Rank 3]**
   - *ผลกระทบ:* ไม่สามารถเปิดรับชำระผ่าน PromptPay ได้
   - *มาตรการป้องกัน:* ตรวจสอบและยืนยันใน Phase 0 ทันที หากบัญชีไม่ใช่ไทย ให้ดำเนินการเปิดบัญชีนิติบุคคล/บุคคลธรรมดาในไทยก่อนเริ่มเขียน Adapter

4. **ความเสี่ยง PromptPay ไม่ตัดเงินอัตโนมัติทำให้เกิด Involuntary Churn — [ปานกลาง / Rank 4]**
   - *ผลกระทบ:* ลูกค้าลืมสแกน QR รายเดือน ทำให้บริการถูกตัด
   - *มาตรการป้องกัน:* Orchestrator มีระบบตั้งเวลาแจ้งเตือนทางอีเมลล่วงหน้า 2-5 วัน + ให้ระยะ Grace Period 3 วันก่อนลดระดับสิทธิ์ (Downgrade) ไปยัง Free Tier

5. **ความเสี่ยง Cron Trigger บน Cloudflare Workers ทำงานคลาดเคลื่อน (Schedule Drift) — [ปานกลาง / Rank 5]**
   - *ผลกระทบ:* Job Reconciliation หรือ Lifecycle Sweeper รันช้ากว่ากำหนด
   - *มาตรการป้องกัน:* ออกแบบการ Query แบบ Sliding Time Window (`updated_at < NOW() - INTERVAL '5 minutes'`) ทำให้แม้ Cron จะดีเลย์ ก็จะสามารถกวาดข้อมูลย้อนหลังครบถ้วนในรอบถัดไปโดยไม่มีข้อมูลตกหล่น

6. **ความเสี่ยงขอบเขตงานบานปลายจากการรีบทำเป็นสินค้าขาย (Scope Creep) — [ปานกลาง / Rank 6]**
   - *ผลกระทบ:* เสียเวลากับการทำ Dashboard/Billing Portal ภายนอกจนโปรดักต์หลักของ WSTERA ไม่ได้เปิดรับเงิน
   - *มาตรการป้องกัน:* ยึดหลัก Internal Core First ตามมติสภาอย่างเคร่งครัด

7. **ความเสี่ยงด้านภาระงานการคืนเงินด้วยตนเอง (Manual Refund Overhead) — [ต่ำ / Rank 7]**
   - *ผลกระทบ:* หากมีเคสขอคืนเงินจำนวนมาก คุณฟรีจะต้องใช้เวลาโอนมือ
   - *มาตรการป้องกัน:* ในระยะ MVP ปริมาณธุรกรรมยังจำกัด สามารถใช้ Ticket ได้ แต่เตรียมสคริปต์/CLI ยิง Stripe Refund API ไว้รองรับเมื่อมีปริมาณเพิ่มขึ้น

---

## 4. สมมุติฐานที่ชัดเจน (Assumptions)

1. **Stripe TH Account:** บัญชี Stripe ที่ใช้งานเป็นบัญชีที่จดทะเบียนในประเทศไทย รองรับการรับเงินสกุล THB และเปิดใช้งาน PromptPay Payment Method ได้
2. **Infrastructure Runtime:** ระบบทำงานบน Cloudflare Workers (Web APIs, Zero Node.js Native Dependencies) ร่วมกับ Supabase (PostgreSQL) สำหรับจัดเก็บข้อมูลและ Transactional Ledger
3. **Task Scheduling:** Cloudflare Cron Triggers มีความเสถียรเพียงพอสำหรับการรันงาน Background Reconciliation และ Subscription State Sweeper
4. **PromptPay Behavior:** Stripe PromptPay เป็น One-time Payment เท่านั้น ไม่รองรับ Recurring Direct-Debit ลูกค้าต้องสแกน QR เพื่อต่ออายุทุกรอบบิล
5. **Refund Policy:** ในระยะแรก การคืนเงินจะดำเนินการผ่านการเปิด Ticket และโอนเงินคืนโดยเจ้าหน้าที่ (คุณฟรี) หรือกดยืนยัน Refund ผ่าน Stripe Dashboard/API
6. **Multi-Product Tenancy:** ทุกโปรดักต์ของ WSTERA เชื่อมต่อผ่าน Control Plane เดียวกัน และใช้ฐานข้อมูลร่วมกันโดยแยก Partition ด้วย `product_id` และ `tenant_id`

---

## 5. ระดับความมั่นใจ (Confidence Score)

**Confidence Score: 95 / 100**

**เหตุผล:**  
สถาปัตยกรรมนี้ต่อยอดจากรากฐานโค้ดเดิมที่มีอยู่จริงใน `@module-hub/payment` และ `@module-hub/subscription` ซึ่งผ่านการออกแบบและทดสอบ Unit Test มาแล้วอย่างครอบคลุม การเติมเต็มด้วย Candidate D (Thin Orchestrator + PromptPay Adapter + CF Cron Reconciliation) แก้ไข Gap เรื่องความปลอดภัยของเงินและ Lifecycle ได้ตรงจุด 100% โดยหักคะแนน 5 คะแนนเพื่อรอการยืนยันสถานะบัญชี Stripe TH ในสภาพแวดล้อมจริง

---
*บันทึกคำตอบสภาโดย: Antigravity (AGY)*
