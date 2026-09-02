# Council R1 — Qwen: สถาปัตยกรรม core รับเงิน (PromptPay + ตัดบัตรอัตโนมัติ) สำหรับ WSTERA

## Recommendation

ออกแบบ core รับเงินแบบ **provider-agnostic 2 ชั้น** โดยใช้ ModuleHub ที่มีอยู่เป็นฐาน แล้วเพิ่ม **PromptPay adapter** เป็น provider ตัวที่ 2 (ข้างๆ Stripe) ใน `payment` module และเชื่อม `subscription` module เข้ากับ billing event ผ่าน webhook idempotency ledger ที่มีอยู่แล้ว:

1. **Payment Core (มีแล้ว) = ชั้น abstraction เดียว** — เพิ่ม `adapters/promptpay-adapter.ts` ที่ implement `PaymentProvider` contract เดียวกับ Stripe (`createPayment` / `getPayment` / `refundPayment` / `parsePaymentEvent`). Host เลือก provider ผ่าน config (Stripe หรือ PromptPay) โดยไม่ต้องแตะ business logic.
2. **Subscription Core (มีแล้ว) = ชั้น state machine + entitlement** — รับ billing event จาก webhook (ผ่าน `webhook-receiver` module) แล้วเรียก `handleBillingEvent()` ซึ่งมี idempotency ledger (`saveForBillingEvent`) อยู่แล้ว. Stripe dunning/retry ปล่อยให้ Stripe จัดการ (Smart Retries) ส่วน PromptPay ไม่มี recurring — ต้องมี **scheduler/job** (module `scheduler` + `job-retry` ที่มีอยู่) คอยสร้าง QR ใหม่ทุกงวด.

**Plug-and-play seam:** Host ต่อแค่ 2 จุด — (ก) inject provider config (Stripe keys หรือ PromptPay merchant keys) เข้า `createPaymentCore()`, (ข) ต่อ webhook → `parsePaymentEvent()` → `handleBillingEvent()`. Business logic, entitlement, state machine ไม่ต้องแก้เลย.

---

## เหตุผลหลัก

### 1. PromptPay ไม่มี "open public merchant API" — ต้องผ่าน licensed gateway
จาก research จริง (Boldrails, Welpay, GUPay, MATTPAY, HSBC Omni Collect, Stripe):
- PromptPay เป็น national rail (BOT/ITMX) ที่ **ไม่มี API ให้ merchant เรียกตรงๆ** มี 3 ทาง: (ก) open-source QR library (สร้าง EMVCo payload ได้ แต่ **ไม่มี webhook/ยืนยันยอด/refund**), (ข) bank API (ผูกกับบัญชีธนาคารนั้น, เป็น disbursement rail ไม่ใช่ collection), (ค) **licensed payment gateway** (collection + webhook + reconciliation + settlement).
- **QR payload ตัว amount เป็น optional** — static QR จาก library ฟรีจะไม่บอกระบบว่า payer จ่ายเท่าไหร่. **Webhook คือ source of truth** ไม่ใช่ QR.
- ทางที่ถูกต้อง = ใช้ gateway (Stripe PromptPay, Omise/Opn, Welpay, GUPay, Boldrails, MATTPAY) ซึ่งให้ webhook + reconciliation.

**นัยต่อสถาปัตยกรรม:** เพราะ provider เหล่านี้มี API/webhook shape ต่างกัน (Stripe ใช้ PaymentIntent/Checkout, GUPay ใช้ `/v1/charges`, Welpay ใช้ `/entry.asp`), การมี `PaymentProvider` abstraction เดียว + adapter ต่อ provider คือคำตอบที่ถูกต้อง — ตรงกับที่ `payment` module ออกแบบไว้แล้ว.

### 2. Stripe adapter ที่มีอยู่รองรับ PromptPay อยู่แล้ว (แทบไม่ต้องแก้)
จาก `stripe-adapter.ts`:
- `createPayment()` ใช้ Checkout Session (`mode: 'payment'` หรือ `'subscription'`) — Stripe PromptPay เปิดผ่าน Payment Element/Checkout ได้เลย (จากหน้า Stripe PromptPay).
- `parsePaymentEvent()` จัดการ `payment_intent.succeeded`, `checkout.session.completed`, `charge.refunded` ฯลฯ — ครอบคลุม event ที่ PromptPay ผ่าน Stripe จะส่ง.
- มี idempotency (`Idempotency-Key` header), error normalization, minor-unit amount, zero `node:*` import (Cloudflare Workers ready).

**ดังนั้น** ถ้าเลือก Stripe เป็น PromptPay gateway → แทบไม่ต้องเขียน adapter ใหม่เลย. ถ้าเลือก gateway อื่น (Welpay/GUPay) → เขียน `promptpay-adapter.ts` ใหม่ implement เดียวกัน.

### 3. Subscription module มี idempotency + state machine ครบแล้ว
จาก `subscription/core/service.ts` + `engine.ts`:
- `handleBillingEvent()` รองรับ `subscription.started / renewed / payment_failed / cancelled / expired`.
- **Idempotency ledger ผ่าน `saveForBillingEvent(sub, eventId)`** — atomic insert event ID + persist state ใน transaction เดียว, คืน `false` ถ้า event ซ้ำ. นี่คือหัวใจของความแม่นยำ (ห้ามพลาด) — webhook replay ปลอดภัย.
- State machine: `trialing → active → past_due → grace_period → expired`, `cancel_at_period_end`, `cancelled`.
- Entitlement engine: `canUseFeature / getLimit / checkUsage` — fail-closed สำหรับ past_due/expired/cancelled, grace_period ตรวจ deadline.

**จุดที่ต้องเสริม:** `handleBillingEvent` รับ `payment_failed` → ตั้ง `grace_period` ทันที. แต่ Stripe dunning ใช้ `invoice.payment_failed` (ไม่ใช่ `payment_intent.payment_failed`) — ต้อง map event type ให้ถูก. และ `subscription.payment_failed` ควรแยก "hard decline" (ไม่ retry ได้) กับ "soft decline" (Stripe จะ retry เอง) — ไม่งั้น core จะเข้า grace_period เร็วเกินไปทั้งที่ Stripe ยัง retry อยู่.

### 4. Stripe dunning/retry ปล่อย Stripe จัดการ (Smart Retries)
จาก research Stripe:
- Stripe Smart Retries default = **8 tries within 2 weeks** — retry อัตโนมัติ, ใช้ `invoice.payment_failed` webhook + `attempt_count` + `next_payment_attempt`.
- Hard decline (bank reject) → Stripe ไม่ retry จนกว่าจะได้ payment method ใหม่.
- หลัง retry หมด → subscription ไป `canceled` / `unpaid` / `past_due` ตาม config.

**นัย:** core เราไม่ควร implement dunning เองซ้ำ — ใช้ Stripe เป็น dunning engine, core แค่รับ event มาอัปเดต state. ตรงกับ boundary ที่ DESIGN.md วางไว้ (Payment Core ไม่จัดการ recurring billing).

### 5. PromptPay ไม่มี recurring — ต้องมี scheduler สร้าง QR ใหม่ทุกงวด
PromptPay เป็น one-time QR (expiry 24h ตาม provider). **ไม่มี auto-charge** — ลูกค้าต้องสแกน QR ใหม่ทุกครั้ง. ดังนั้น subscription billing ผ่าน PromptPay ต้อง:
- ทุกงวด: scheduler (module `scheduler` ที่มี) trigger → สร้าง QR ใหม่ (amount = งวดนั้น) → ส่งให้ลูกค้า (Notification module) → รอ webhook `payment.succeeded` → `handleBillingEvent('subscription.renewed')`.
- ถ้าไม่จ่ายภายใน grace period → `subscription.expired` (entitlement lock).

**นี่คือความต่างหลักจาก Stripe card:** Stripe auto-charge ได้, PromptPay ต้อง manual scan ทุกงวด. สถาปัตยกรรมต้องรองรับทั้ง 2 โหมดผ่าน provider abstraction เดียว.

---

## ความเสี่ยง / จุดที่อาจผิด (โดยเฉพาะเรื่องความแม่นยำตัดบัตร)

1. **Idempotency ต้องเป็น "event-level" ไม่ใช่ "subscription-level"** — DESIGN.md ของ subscription ระบุชัด: ตรวจแค่ `lastProcessedEventId` บน subscription ไม่พอ เพราะ event เก่าสามารถ replay หลัง event ใหม่ได้. ต้องใช้ `saveForBillingEvent` (ledger) เสมอ. **ถ้า implementer ใช้แค่ `lastProcessedEventId` → จะ double-process ได้** = เสี่ยงตัดบัตรซ้ำ/อัปเดต state ผิด. ต้องบังคับใช้ ledger.

2. **Map event type ผิดระหว่าง Stripe กับ subscription core** — Stripe ส่ง `invoice.payment_failed` (dunning) แต่ payment module `parsePaymentEvent` map เป็น `payment.failed`. ต้องมี bridge layer แปลง `payment.failed` → `subscription.payment_failed` + เก็บ `attempt_count`/`next_payment_attempt` เพื่อให้ core ตัดสินใจถูก (เข้า grace_period หรือรอ Stripe retry). **ถ้า map ผิด → subscription ถูก cancel เร็วเกินไปทั้งที่ Stripe ยัง retry อยู่ = ลูกค้าดีหลุด.**

3. **PromptPay refund ไม่สม่ำเสมอ** — จาก research: Omise/Opn "cannot be voided or refunded", Stripe "full and partial refunds but payer must supply originating bank account", Xendit "not available", บาง provider "refunds not available". **Refund capability เป็น property ของ provider** — core ต้องไม่ assume ทุก provider refund ได้. `refundPayment()` ต้อง return structured error (`REFUND_FAILED` / `REFUND_NOT_SUPPORTED`) และ host ต้องมี fallback (manual refund / bank transfer).

4. **PromptPay amount mismatch / reconciliation** — QR amount optional, ลูกค้าอาจจ่ายผิดจำนวน. ต้องมี **reconciliation** (เทียบ webhook amount กับ order amount) — ถ้าไม่ตรง ต้อง flag ไว้ ไม่ auto-fulfill. `parsePaymentEvent` ต้อง expose amount ให้ host ตรวจ.

5. **QR expiry** — PromptPay QR expiry 24h (บาง provider). ถ้า scheduler สร้าง QR ล่วงหน้าแล้วลูกค้าจ่ายช้า → QR หมดอายุ. ต้องมี job ตรวจ/สร้าง QR ใหม่, และ webhook ต้อง map กับ QR instance ที่ถูกต้อง (ไม่ใช่แค่ referenceId).

6. **Cloudflare Workers + webhook signature** — ต้องใช้ `webhook-receiver` module ตรวจ signature (Stripe `Stripe-Signature`, gateway อื่น HMAC-SHA256 ตาม MATTPAY/Welpay) ก่อน `parsePaymentEvent`. ห้าม parse payload ที่ไม่ verify.

7. **Zero-decimal currency** — THB เป็น 2-decimal (minor unit = 100). ระบบรองรับ THB อยู่แล้วใน payment module. แต่ถ้า gateway รับ amount เป็น THB integer (บาท) ไม่ใช่ satang → ต้องแปลงที่ adapter boundary. ตรวจให้ชัดว่า gateway ใช้ minor unit หรือ major unit.

---

## Assumptions

- WSTERA เป็นนิติบุคคลไทย / มีบัญชีธนาคารไทย (PromptPay gateway ทุกเจ้า require Thai entity + KYB 3-14 วัน).
- เลือกใช้ **Stripe เป็น PromptPay gateway หลัก** (มี adapter อยู่แล้ว, รองรับ PromptPay ผ่าน Checkout/Payment Element) — ถ้าเลือก Welpay/GUPay ต้องเขียน `promptpay-adapter.ts` ใหม่.
- Stripe จัดการ dunning/retry (Smart Retries) — core ไม่ implement dunning ซ้ำ.
- Subscription billing ผ่าน PromptPay ต้อง manual scan ทุกงวด (ไม่มี auto-charge) — ใช้ scheduler สร้าง QR ใหม่.
- ModuleHub modules (`payment`, `subscription`, `webhook-receiver`, `scheduler`, `job-retry`, `notification`) เป็น Completed 0.1.0+ และใช้ได้จริง.
- Stack: Cloudflare Workers + Supabase, TS strict, ไม่มี `node:*`.

---

## Confidence

**78/100**

เหตุผล: สถาปัตยกรรม core (provider-agnostic + idempotency ledger + state machine) อ่านจาก evidence จริงแล้วแข็งแรงและตรงกับ best practice. แต่มี uncertainty เรื่อง (ก) gateway ตัวจริงที่ WSTERA จะเลือก (Stripe vs Welpay/GUPay — เปลี่ยน amount unit, refund, webhook shape), (ข) PromptPay refund capability ต่างกันตาม provider, (ค) ต้องมี bridge layer map Stripe dunning event → subscription core ซึ่งยังไม่มีใน evidence. ถ้าเลือก Stripe เป็น gateway → confidence สูงขึ้น (~85) เพราะ adapter มีอยู่แล้ว.
