# Council Round 2 — Blind Peer Review Bundle

นี่คือคำตอบสถาปัตยกรรม 4 ข้อ (Candidate A/B/C/D) จาก Round 1 — **ลบชื่อ agent แล้ว** เพื่อให้คุณรีวิวแบบ blind (ไม่รู้ว่าใครเขียน)

โจทย์เดิม: สร้าง core รับเงิน (PromptPay + ตัดบัตรอัตโนมัติ) plug-and-play สำหรับ WSTERA.com (หลายโปรดักต์) โดยใช้ ModuleHub payment + subscription module ที่มีอยู่ + Stripe

---

## Candidate A

**Recommendation:** ออกแบบ core แบบ provider-agnostic 2 ชั้น โดยใช้ ModuleHub ที่มีอยู่เป็นฐาน แล้วเพิ่ม PromptPay adapter เป็น provider ตัวที่ 2 (ข้างๆ Stripe) ใน payment module และเชื่อม subscription module เข้ากับ billing event ผ่าน webhook idempotency ledger ที่มีอยู่แล้ว:
1. Payment Core (มีแล้ว) = ชั้น abstraction เดียว — เพิ่ม `adapters/promptpay-adapter.ts` ที่ implement `PaymentProvider` contract เดียวกับ Stripe. Host เลือก provider ผ่าน config.
2. Subscription Core (มีแล้ว) = ชั้น state machine + entitlement — รับ billing event จาก webhook แล้วเรียก `handleBillingEvent()` ซึ่งมี idempotency ledger อยู่แล้ว. Stripe dunning/retry ปล่อย Stripe จัดการ (Smart Retries) ส่วน PromptPay ไม่มี recurring — ต้องมี scheduler/job คอยสร้าง QR ใหม่ทุกงวด.

**เหตุผลหลัก:** PromptPay ไม่มี open public merchant API — ต้องผ่าน licensed gateway (Stripe PromptPay, Omise/Opn, Welpay, GUPay). Stripe adapter ที่มีอยู่รองรับ PromptPay อยู่แล้ว (ผ่าน Checkout/Payment Element). Subscription module มี idempotency + state machine ครบแล้ว. PromptPay เป็น one-time QR (expiry 24h) ไม่มี auto-charge — ต้อง scheduler สร้าง QR ใหม่ทุกงวด.

**ความเสี่ยง:** Idempotency ต้องเป็น event-level (ledger) ไม่ใช่ subscription-level. Map event type ผิดระหว่าง Stripe กับ subscription core → cancel เร็วเกินไป. PromptPay refund ไม่สม่ำเสมอตาม provider. QR expiry ต้องจัดการ. ต้อง verify webhook signature.

**Assumptions:** WSTERA เป็นนิติบุคคลไทย. เลือก Stripe เป็น PromptPay gateway หลัก. Stripe จัดการ dunning. PromptPay ต้อง manual scan ทุกงวด.

**Confidence:** 78/100

---

## Candidate B

**Recommendation:** คงการแยก 2 ชั้นเดิมไว้ (Payment Core + Subscription Core) แล้วเพิ่ม PromptPay เป็น adapter ตัวใหม่ใน payment module พร้อมเพิ่ม "reconciliation layer" (async-payment polling) เป็นชิ้นส่วนใหม่ที่ขาดอยู่ — อย่าสร้าง core ใหม่ อย่ารวมสอง module. โครงสร้าง 5 ชั้น: Business Project → Subscription Core → Payment Core → Provider Adapters (Stripe + PromptPay) → Reconciliation Layer (ใหม่) → Billing Orchestration.

**เหตุผลหลัก:** การแยก Payment/Subscription Core ที่มีอยู่ถูกต้องแล้วและเป็น plug-and-play อยู่แล้ว. PromptPay ควรเป็น adapter ใหม่ไม่ใช่ core ใหม่ (เป็น rail ที่ async/offline ต่างจากบัตร แต่ PaymentProvider contract ครอบคลุมได้). ชิ้นส่วนที่ขาดจริงคือ Reconciliation Layer — PromptPay เป็น async และ QR มี expiry, webhook คือ source of truth แต่ถ้า webhook พลาดเงินถูกเก็บแต่ order ไม่ถูก mark paid = เงินหาย. ต้องมี scheduled job poll `getPayment()` ของ pending payments.

**ความเสี่ยง:** PromptPay recurring ต่างจากบัตรโดยพื้นฐาน — "high reliability" ต้องออกแบบใหม่ (generate-new-QR → notify → grace → expire). QR expiry ต้องจัดการ. Refund ไม่ได้มีทุก provider. ช่องว่างใน subscription module: ไม่มี transition อัตโนมัติ grace_period → expired (ต้อง scheduled job). Ledger ต้อง atomic จริงใน durable adapter. Reconciliation ต้อง idempotent ด้วย.

**Assumptions:** WSTERA ใช้ licensed PromptPay gateway. บัตร (Stripe) เป็นช่องทางหลักสำหรับ subscription. แต่ละโปรดักต์มี Supabase เป็น durable store. Scheduler module เป็นตัวขับ reconciliation + grace→expired job.

**Confidence:** 78/100

---

## Candidate C

**Recommendation:** ใช้ Payment Core + Subscription Core เดิมเป็นฐาน (seams แข็งแรง) แล้วเพิ่ม 2 ชิ้นที่ขาด: (1) PromptPay Adapter ใน Payment Core (ผ่าน licensed gateway เช่น Omise/Stripe, verify-on-webhook re-fetch + amount match, declared refund capability), (2) Dunning/Retry + Reconciliation Engine ใน Subscription Core (decline classification, retry schedule, period-check idempotency, scheduled reconciliation). Key constraint: PromptPay เป็น customer-initiated และไม่สามารถ auto-renew ได้ ดังนั้น Stripe card ต้องเป็น primary recurring rail.

**เหตุผลหลัก:** Seams ของ Payment/Subscription Core แข็งแรงอยู่แล้ว. PromptPay ไม่มี public merchant API — ต้อง licensed gateway. ต้อง re-fetch transaction จาก provider + match amount (อย่าเชื่อ webhook body). Subscription Core ขาด dunning/retry + reconciliation — ต้องเพิ่ม decline classification, retry schedule, period-check idempotency, scheduled reconciliation. Idempotency ต้อง 2 ชั้น: key TTL + business-logic period check.

**ความเสี่ยง:** PromptPay refund เป็น provider decision ไม่ใช่ rail property. อย่าเชื่อ webhook body — ต้อง re-fetch + amount match. ต้องมี reconciliation เพื่อกันเงินหาย.

**Assumptions:** ใช้ licensed gateway. Stripe card เป็น primary recurring rail.

**Confidence:** 78/100

---

## Candidate D

**Recommendation:** สร้าง Billing Orchestrator บางๆ เหนือ PaymentCore + SubscriptionCore: เพิ่ม PromptPayPaymentProvider เป็น adapter ใหม่สำหรับ QR/inquiry/webhook-normalized event และใช้ SubscriptionCore เป็น source of truth ของ lifecycle + entitlements; สำหรับ monthly recurring ที่ต้อง "no missed charges" ให้ใช้ Stripe Billing/card หรือ direct-debit provider เป็น recurring rail หลัก ไม่ใช่ PromptPay.

**เหตุผลหลัก:** ของที่มีอยู่เหมาะเป็นฐานแล้ว (PaymentCore แยก business logic ออกจาก provider, บังคับ integer minor units, normalize 7 สถานะ, บังคับ idempotencyKey, Cloudflare Workers-ready). PromptPay เหมาะกับ one-time checkout/top-up/invoice มากกว่า recurring — BOT อธิบายว่าเป็น QR scan, Stripe ระบุ Recurring payments: No. Stripe Billing เป็น baseline สำหรับ subscription reliability (Smart Retries 8 retries ใน 2 สัปดาห์). ต้องมี reconciler รายวันเทียบ Supabase ledger กับ provider state เพราะ webhook เป็น at-least-once.

**ความเสี่ยง:** PromptPay ไม่ใช่ pull-based recurring debit — ถ้าต้องการ monthly subscription แบบไม่พลาด ต้องใช้ Stripe card/direct-debit. Webhook อย่างเดียวไม่พอ — ต้อง polling/inquiry reconciler. PromptPay/bank APIs อาจไม่มี Idempotency-Key header — ต้อง host-side idempotency เอง. saveForBillingEvent ต้อง atomic Supabase transaction. Dunning/retry ต้องเป็น product policy ไม่ใช่ hard-coded.

**Assumptions:** PromptPay ใช้เป็น push/QR customer-initiated เป็นหลัก ไม่รองรับ native recurring. WSTERA ยอมรับ card/Stripe Billing สำหรับ subscription ที่ต้อง auto-charge. Supabase เป็น durable ledger store. Cloudflare Workers เป็น runtime หลัก.

**Confidence:** 86/100

---

## งานของคุณ (Reviewer)

รีวิวทั้ง 4 candidates แบบ blind แล้วตอบ:

- **Ranking** — ดีที่สุด → แย่ที่สุด (เช่น D > B > A > C)
- **จุดแข็งของแต่ละ candidate**
- **จุดอ่อน / สิ่งที่พลาด** ของแต่ละ
- **มี fatal flaw หรือไม่** (ในตัวไหน)
- **จุดที่ทุก candidate ยังตอบไม่ได้**
- **Confidence** — 0-100

เขียนผลลงไฟล์ `review.md` ใน workspace ของการ์ดนี้ แล้วรายงาน path + สรุปสั้น
