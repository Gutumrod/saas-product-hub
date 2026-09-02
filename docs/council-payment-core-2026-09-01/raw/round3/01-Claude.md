# Council R3 — ลำดับการสร้าง + ปลายทาง Core รับเงิน WSTERA
**สมาชิกสภา:** Claude (Commander)
**วันที่:** 2026-09-01
**รอบ:** R3 — Build Sequence + Endgame

---

## 1. ลำดับการสร้าง (Build Sequence)

### หลักคิดก่อนเรียงลำดับ
มี 2 invariant ที่ต้องรักษาตลอด:
- **"No money leaks"** — ต้องไม่มี state ที่ user ได้ feature โดยไม่จ่ายเงิน หรือจ่ายเงินแล้วไม่ได้ feature
- **"Smallest vertical slice first"** — proof ที่เล็กที่สุดที่พิสูจน์ว่าเงินไหลครบ loop ก่อนขยาย

---

### Phase 0 — Prerequisites (บล็อคเกอร์ต้องคลีนก่อน)
**ทำอะไร:**
- ยืนยัน Stripe account เป็นบัญชีไทย (TH) → เพื่อ unlock PromptPay ได้จริง
- ตรวจ/pin `apiVersion` ใน `StripeAdapterConfig` (ปัจจุบัน optional — ต้องทำให้ explicit เป็น version ที่ verified แล้ว)
  ตาม BRIEF.md: "ต้องเช็ค Stripe API version compatibility ก่อนโปรโมท production-ready"
- Secrets ย้ายออกจาก sandbox (`STRIPE_*_BOOKING2`) ไปเป็น production key ในเซฟ `.secrets/`

**ทำไมก่อน:**
- ถ้า Stripe account ไม่ใช่ TH → PromptPay adapter เขียนเสร็จก็ใช้ไม่ได้
- API version drift = silent break ในทุก phase ถัดไป

**Gate:** มีหลักฐาน Stripe dashboard ว่า account = TH + PromptPay enabled + `apiVersion` ถูก pin

---

### Phase 1 — ปิด Subscription Core Gaps (Money Safety Net)
**ทำอะไร:**
1. **แก้ `service.ts` grace period** (line 37 `gracePeriodDays` ถูก comment out):
   - uncomment + implement transition จาก `payment_failed` → `past_due` → `grace_period` (set `graceEndsAt`)
   - ต้องเก็บ timestamp `graceEndsAt` ลง Subscription record

2. **เพิ่ม scheduled job: `grace_period → expired`**
   - CF Cron Trigger หรือ Durable Object alarm — poll subscriptions ที่ `status = 'grace_period'` และ `graceEndsAt < now`
   - เมื่อ expire: เรียก `handleBillingEvent({ eventType: 'subscription.expired', accountId })` → ตัด entitlement
   - ต้องใช้ idempotency key เพื่อป้องกัน double-expire

3. **ทดสอบ state machine ครบ loop:**
   `active → payment_failed → past_due → grace_period → (no pay) → expired → entitlement locked`

**ทำไมก่อน:**
- นี่คือ "no money leaks" gap ที่ใหญ่ที่สุด — ถ้าไม่มี scheduled job นี้, user ที่การ์ดถูกปฏิเสธจะอยู่ใน `past_due` ตลอดไปและยังได้ใช้ feature ฟรี
- Stripe Smart Retries ทำ dunning ให้ (8 ครั้ง/2 สัปดาห์) แต่ถ้าทุกครั้งล้มเหลว — core ต้องจัดการ expire เอง
- แก้ก่อน Orchestrator เพราะ Orchestrator จะ wire event เข้า service นี้ — ต้องให้ service ถูกต้องก่อน

**Gate:** test สุดขอบ: payment_failed event → รอ gracePeriodDays → verify `status = 'expired'` + `canUseFeature = false`

---

### Phase 2 — Thin Billing Orchestrator + Stripe Card End-to-End
**ทำอะไร:**
1. สร้าง **Billing Orchestrator** (ไฟล์ใหม่ บางๆ):
   - รับ Stripe webhook (ผ่าน `webhook-receiver` module ที่มีแล้ว)
   - normalize Stripe events → `SubscriptionBillingEvent` → ส่งเข้า `subscriptionCore.handleBillingEvent()`
   - map product/tenant ID จาก Stripe subscription metadata → `accountId` ที่ถูกต้อง

2. Wire Payment Core + Subscription Core ใต้ Orchestrator:
   - Stripe card = recurring rail (Stripe จัดการ auto-charge)
   - Orchestrator ไม่สร้าง PaymentIntent ใหม่เอง — แค่ process webhook events จาก Stripe

3. ทดสอบ happy path บน test mode Stripe:
   - `trialing → active → past_due → grace_period → expired`
   - `active → subscription.renewed → active`

**ทำไมตรงนี้:**
- Phase 1 ทำให้ core ถูกต้อง Phase 2 ต่อสายเข้า Stripe จริง
- ยังไม่ต้องการ PromptPay — prove the recurring card path first
- การ wire ก่อน reconciliation ยอมรับได้ เพราะ Stripe card webhook มี reliability สูงและมี Stripe Dashboard ให้ตรวจ manual

**Gate:** subscription lifecycle ทำงานครบ end-to-end ใน Stripe test mode โดยไม่มี manual intervention

---

### Phase 3 — Reconciliation Layer (Safety Net)
**ทำอะไร:**
- Scheduled job (CF Cron, รันทุกชั่วโมงหรือทุก 15 นาที):
  - poll Stripe สำหรับ PaymentIntents/Checkout Sessions ที่ `status = processing` หรือ `pending` นานเกินกว่า threshold
  - เปรียบกับ local subscription state
  - ถ้า Stripe บอก `succeeded` แต่ local ยัง `past_due` → trigger `subscription.renewed` event
  - ถ้า Stripe บอก `failed` แต่ local ยัง `active` → trigger `subscription.payment_failed`

- ต้องใช้ idempotency key ที่ deterministic (เช่น `recon_${stripePaymentId}_${date}`) เพื่อป้องกัน double-credit

**ทำไมต้องมีก่อน PromptPay:**
- PromptPay = async QR payment, webhook อาจพลาดได้ง่ายกว่า card (ไม่มี instant card network confirmation)
- "webhook พลาด → เงินหาย" คือ consensus ของทุกตัวสภา
- ถ้า launch PromptPay โดยไม่มี reconciliation = รับเงินแต่ไม่ activate subscription

**Gate:** simulation: ปิด webhook endpoint ชั่วคราว → จ่ายเงิน → เปิด reconciler → verify subscription activate ถูกต้อง

---

### Phase 4 — PromptPay Adapter + Notification Flow
**ทำอะไร:**
1. สร้าง `promptpay-adapter.ts` implement `PaymentProvider` interface เดิม:
   - `createPayment()` → สร้าง Stripe PromptPay PaymentIntent (currency: THB)
   - return `checkoutUrl` หรือ QR payload ให้ frontend render
   - PromptPay ไม่ auto-renew: ใช้สำหรับ manual one-time payment เท่านั้น

2. Notification flow (ตามที่ผู้ใช้ตอบ):
   - Email D-5, D-2 ก่อนหมด (แจ้งเตือนต่ออายุ)
   - Email หลังหมดอีกครั้ง (แจ้งว่าตัด)
   - ถ้าไม่มีฟรีเทียร์: D-5 + post-expiry → ตัดทันที

3. Wire PromptPay เข้า Orchestrator เป็น payment method เสริม (ไม่ใช่ recurring)

**ทำไมถึงมาเป็น Phase 4:**
- ต้องการ: TH Stripe account (Phase 0) + reconciliation (Phase 3) ก่อนจึงปลอดภัย
- PromptPay path มีความซับซ้อนด้าน UX (QR + async) — มาสุดท้ายหลัง core path พิสูจน์แล้ว

**Gate:** PromptPay QR payment → ครอบคลุม reconciliation → subscription activate ทำงานถูกต้อง

---

### Phase 5 — Production Hardening
**ทำอะไร:**
- Stripe API version compatibility audit: verify ทุก endpoint call ยังตรงกับ pinned version
- Integrate `audit-log` module (มีอยู่แล้ว 974 บรรทัด) สำหรับทุก billing event
- สร้าง test integration บน live Stripe TH account (ไม่ใช่ sandbox)
- Promote Payment Core + Subscription Core จาก `Experimental/Pilot` → `Production-Ready`
- Load test edge case: double webhook delivery, out-of-order events, replay attacks

**Gate:** ไม่มี P0/P1 bug ในชั้น money path + audit log ครบทุก event + API version verified

---

### สรุปลำดับ (Timeline View)

```
Phase 0  →  Phase 1  →  Phase 2  →  Phase 3  →  Phase 4  →  Phase 5
[Block]     [Core]       [Card]       [Recon]      [PP]        [Prod]
ยืนยัน TH   ปิด gap      Stripe card  Safety net   PromptPay   Harden
             grace/exp   end-to-end   ก่อน PP live  + notify
```

---

## 2. ปลายทาง (Endgame)

### คำแนะนำ: Internal-First → Product Pivot

**Launch WSTERA internal ก่อน** แล้วค่อย pivot ไป Billing-as-a-Service

เหตุผล:
1. System ปัจจุบันเป็น v0.1.0 Experimental — ยังไม่ production-ready แม้ใน WSTERA เอง
2. WSTERA คือ forcing function ที่ดีที่สุด — มัน stress test real production workload จริง, bug จะโผล่ที่นี่ก่อน
3. BaaS product ต้องการ infra เพิ่มอีกชั้นหนึ่ง — ถ้า launch พร้อมกัน scope บาน ทั้งคู่ช้า

### ถ้าจะเป็น Billing-as-a-Service — ต้องเพิ่ม/เปลี่ยน:

| สิ่งที่ต้องเพิ่ม | รายละเอียด | ต่างจาก Internal |
|---|---|---|
| **Multi-tenant isolation** | accountId ต้องผูกกับ tenant API key, ไม่ใช่แค่ param | Internal = trust internal caller; BaaS = zero trust per tenant |
| **Self-serve onboarding** | UI ให้ลูกค้า inject Stripe key ตัวเอง, config plan | ไม่มีใน internal |
| **Pricing model** | จะเก็บเงิน BaaS เองยังไง (per-active-sub? flat?) | ไม่มีใน internal |
| **Stripe Connect** (ถ้า marketplace) | ให้ tenant ใช้ Stripe account ตัวเอง | Internal = one Stripe account |
| **Refund workflow as a service** | ตอนนี้ manual (เปิด ticket → คุณฟรีโอน) — BaaS ต้องมี self-serve refund portal | ต้องสร้างใหม่ |
| **PDPA + compliance** | Thai personal data protection, audit trail ที่ exportable | Internal = internal risk |
| **SLAs + uptime** | ลูกค้า BaaS ต้องการ guarantee | Internal = best effort |
| **Documentation + SDK** | Webhook setup guide, TypeScript SDK wrapper | ไม่มีใน internal |
| **Admin dashboard** | operator มองเห็น all-tenant health | Internal = ดู Stripe Dashboard ตรง |

### สิ่งที่ defer ออกไป (ไม่ต้องมีตอน internal launch):
- Stripe Connect (เพิ่มเมื่อ pivot)
- Self-serve onboarding UI
- PDPA compliance documentation ที่ formal
- Refund self-serve portal (manual ได้ตอนนี้)
- Multi-tenant API key isolation (WSTERA เป็น single-tenant ภายใน)

---

## 3. ความเสี่ยงหลัก (Key Risks)

### Risk 1 — Stripe TH Account ไม่พร้อม (ความเสี่ยง: สูง)
ถ้า Stripe account ที่ลงทะเบียนไว้ไม่ใช่ TH → PromptPay ใช้ไม่ได้เลย ไม่ว่า adapter จะดีแค่ไหน
**การลด:** Phase 0 = hard gate ก่อนเขียนโค้ดแม้แต่บรรทัดเดียวของ PromptPay

### Risk 2 — grace_period → expired Job Failure = Silent Money Leak (ความเสี่ยง: สูง)
scheduled job พัง/ไม่ deploy → user ค้างใน `past_due` ตลอดไป = ได้ใช้ feature ฟรีหลัง Stripe retry หมด
**การลด:** Phase 1 ทำก่อน + เพิ่ม monitoring alert ถ้า `grace_period` count เพิ่มแต่ `expired` count ไม่เพิ่ม

### Risk 3 — PromptPay Webhook Miss = เงินหาย (ความเสี่ยง: กลาง-สูง)
PromptPay async → webhook อาจถึงช้าหรือหาย → user จ่ายเงินแล้ว subscription ไม่ activate
**การลด:** Phase 3 (Reconciliation) ต้องเสร็จก่อน Phase 4 PromptPay go-live เป็น strict dependency

### Risk 4 — Stripe API Version Drift (ความเสี่ยง: กลาง)
Payment Core ใช้ Web fetch ตรง (ไม่ใช่ Stripe SDK) → ถ้า Stripe เปลี่ยน response shape หรือ deprecate field → silent break
**การลด:** Phase 0 pin version + Phase 5 audit ก่อน production promote + webhook alert บน Stripe deprecated event types

---

## 4. Assumptions

1. Stripe account มีอยู่แล้ว (ผู้ใช้ยืนยันว่าสมัครไว้แล้ว) — เพียงแต่ต้องยืนยัน TH vs non-TH
2. Cloudflare Workers คือ runtime เป้าหมาย (code สอดคล้อง: ใช้ Web fetch, zero node:* imports)
3. Supabase หรือ storage ที่เทียบเท่ามีอยู่แล้ว — Subscription/Plan repositories ต้องการ implementation
4. `webhook-receiver` module (863 บรรทัด ใน BRIEF.md) cover signature verification แล้ว — Orchestrator ไม่ต้องสร้างใหม่
5. PromptPay จะไม่ auto-renew (ต้อง manual ทุก cycle) — ตาม consensus สภา
6. WSTERA มี product/tenant ID system อยู่แล้ว (ระบุใน Chairman verdict — WSTERA Control Plane แยก Customer/Product/Tenant)
7. `gracePeriodDays` ของ WSTERA อยู่ที่ 3-7 วัน ตาม context ของผู้ใช้ (CEO ระบุ "ไม่จ่ายหลังหมด 3 วัน → ตัด")

---

## 5. Confidence

**82 / 100**

**ที่สูง:** dependencies ระหว่าง phase ชัดเจนจาก code จริง (gap ใน service.ts ยืนยันได้), consensus สภา R1/R2 สอดคล้องกับ sequence นี้, architecture ถูก settle แล้ว

**ที่ไม่ถึง 90:** ไม่รู้ timeline จริงของ Stripe TH verification (อาจช้าหรือมี KYC เพิ่มเติม), ยังไม่เห็น implementation ของ SubscriptionRepository จริง (อาจมี constraint ที่ซ่อนอยู่), CF Cron Trigger บน Workers มีข้อจำกัดที่ต้องออกแบบรอบ (ไม่ใช่ standard cron)
