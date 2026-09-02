# Council R1 — สถาปัตยกรรม core รับเงิน (PromptPay + ตัดบัตรอัตโนมัติ) สำหรับ WSTERA

**Candidate:** Claude (agent-claude)
**Evidence อ่านแล้ว:** payment/DESIGN.md + core/* + adapters/stripe-adapter.ts, subscription/DESIGN.md + core/* (engine/service/repository/types) + tests, REGISTRY.md
**Research:** PromptPay ecosystem (Omise/Opn, 2C2P, EBANX, Boldrails, Stripe), Stripe subscription/dunning, billing idempotency/reconciliation

---

## Recommendation

**คงการแยก 2 ชั้นเดิมไว้ (Payment Core + Subscription Core) แล้วเพิ่ม PromptPay เป็น adapter ตัวใหม่ใน payment module พร้อมเพิ่ม "reconciliation layer" (async-payment polling) เป็นชิ้นส่วนใหม่ที่ขาดอยู่** — อย่าสร้าง core ใหม่ อย่ารวมสอง module เข้าด้วยกัน เพราะการแยกแบบนี้คือหัวใจของ plug-and-play อยู่แล้ว: แต่ละโปรดักต์แค่เลือก provider adapter + ต่อ repository + ตั้ง config (ราคา/รายละเอียด) โดยไม่ต้องแตะ business logic

โครงสร้างที่แนะนำ (5 ชั้น):

```
Business Project (WSTERA / โปรดักต์อื่น)
   │
   ├─ Subscription Core (มีแล้ว)  ← lifecycle + entitlements, billing-agnostic
   │     └─ handleBillingEvent + saveForBillingEvent ledger (idempotency backbone)
   ├─ Payment Core (มีแล้ว)      ← single-payment abstraction, provider-agnostic
   │     └─ PaymentProvider interface = จุด plug ของทุก adapter
   ├─ Provider Adapters (มี Stripe, เพิ่ม PromptPay)
   │     ├─ stripe-adapter.ts (มีแล้ว)
   │     └─ promptpay-adapter.ts (ใหม่)  ← Omise/Opn, 2C2P, EBANX, Boldrails
   ├─ Reconciliation Layer (ใหม่) ← async-payment polling + expiry handling
   └─ Billing Orchestration (host หรือ thin module) ← map PaymentEvent→SubscriptionBillingEvent, dunning/retry
```

---

## เหตุผลหลัก (ทำไมถึงเป็นแบบนี้)

1. **การแยก Payment Core / Subscription Core ที่มีอยู่ถูกต้องแล้ว และเป็น plug-and-play อยู่แล้ว** — Payment Core เป็น abstraction ของการจ่ายครั้งเดียว (provider-agnostic ผ่าน `PaymentProvider` interface), Subscription Core เป็น lifecycle + entitlements (billing-agnostic ผ่าน repository interface). ทั้งคู่ zero `node:*`, ใช้ Web API, Cloudflare Workers-ready. การเพิ่มโปรดักต์ใหม่ = ต่อ adapter + repo + config เท่านั้น. **อย่า merge** — การ merge จะทำลายจุด plug ของทั้งสองฝั่ง.

2. **PromptPay ควรเป็น adapter ใหม่ใน payment module ไม่ใช่ core ใหม่** — PromptPay เป็น "rail" ที่ async/offline ต่างจากบัตร แต่ `PaymentProvider` contract (create/get/refund) ยังครอบคลุมได้: `createPayment` คืน `requires_action`/`pending` พร้อม QR, การยืนยันมาทาง webhook ไม่ใช่ response ของ create. `PaymentStatus` 7 สถานะที่มีอยู่ (pending/requires_action/processing/succeeded/failed/refunded/cancelled) ครอบคลุม flow นี้ครบ. Research ยืนยันว่า PromptPay ไม่มี public merchant API เปิด — ต้องผ่าน licensed gateway (Omise/Opn, 2C2P, EBANX, Boldrails, Stripe) ซึ่งล้วนให้ webhook + reconciliation + settlement. Adapter ต้อง expose `qrPayload` (EMVCo string), `qrImage`, `expiresAt` เป็น extension (เหมือน `StripeAdapterExtensions.parsePaymentEvent`).

3. **ชิ้นส่วนที่ขาดจริงคือ Reconciliation Layer** — PromptPay เป็น async และ QR มี expiry (10 นาที ถึง 24 ชม. ตาม provider). Webhook คือ source of truth แต่ถ้า webhook พลาด (network, retry หมด) เงินถูกเก็บแต่ order ไม่ถูก mark paid = "เงินหาย". ต้องมี scheduled job (ใช้ Scheduler module ที่มีอยู่) poll `getPayment()` ของ pending payments เพื่อจับ: paid-but-webhook-missed, expired, never-scanned. นี่คือการันตี "ไม่เงินหาย" ที่ webhook อย่างเดียวให้ไม่ได้.

4. **Subscription reliability backbone มีอยู่แล้วใน `handleBillingEvent` + `saveForBillingEvent`** — ledger idempotency (atomic insert eventId + persist state ใน transaction เดียว) กัน replay/duplicate/concurrent delivery ได้จริง (test ครอบคลุม replay-after-different-event, concurrent, cancel-replay). Grace period configurable. นี่คือหัวใจของ "ตัดบัตรแม่นยำ ไม่พลาด" — เก็บไว้.

5. **Dunning/retry ควรเป็น host-level หรือ thin orchestration ไม่ใช่ core** — Stripe จัดการ dunning ให้เองสำหรับบัตร (smart retry Day 1/3/7/14, grace 7-14 วัน). สำหรับ PromptPay recurring ใช้ provider's recurring plan (2C2P RPP, Omise Schedule) หรือ host-driven retry ผ่าน Scheduler. Core ไม่ควรฝัง policy นี้ — ปล่อยให้แต่ละโปรดักต์ตั้ง.

---

## ความเสี่ยง / จุดที่อาจผิด (โดยเฉพาะความแม่นยำตัดบัตร)

1. **PromptPay recurring ต่างจากบัตรโดยพื้นฐาน — "high reliability" ต้องออกแบบใหม่** — บัตร retry อัตโนมัติได้ (card-updater, smart retry) แต่ PromptPay ที่ fail ไม่มี auto-retry แบบนั้น; recovery = สร้าง QR ใหม่ + แจ้งลูกค้า + ให้สแกนใหม่. ถ้าออกแบบ dunning แบบบัตรมาใช้กับ PromptPay จะ "เงินหาย" เพราะ QR หมดอายุ. ต้องมี: generate-new-QR → notify → grace → expire.

2. **QR expiry ต้องจัดการ** — dynamic QR หมดอายุ (10 นาที–24 ชม.). Subscription renewal ที่สร้าง QR แล้วลูกค้าไม่สแกน → QR expire → ต้อง map เป็น `cancelled`/`failed` → เข้า grace period. ถ้าไม่จัดการ expiry จะค้างสถานะ `pending` ตลอดกาล.

3. **Refund ไม่ได้มีทุก provider** — Omise ไม่สามารถ void/refund PromptPay ได้. `PaymentProvider.refundPayment` อาจเป็น no-op สำหรับ PromptPay. อย่าออกแบบให้ business logic สมมติว่า refund พร้อมเสมอ — ต้องมี fallback (manual settlement / provider-specific).

4. **ช่องว่างใน subscription module ที่มีอยู่ (ต้องปิด):**
   - `handleBillingEvent` ตั้ง `grace_period` ตรงๆ จาก payment_failed (ข้าม `past_due` ตาม DESIGN.md state machine) — discrepancy เล็กน้อย ควรตัดสินใจให้ชัด.
   - **ไม่มี transition อัตโนมัติ grace_period → expired** — ต้องมี scheduled job (Scheduler) ตรวจ `gracePeriodEnd` แล้วยิง `subscription.expired`. นี่คือจุดที่ "ไม่เงินหาย" จะพังถ้าไม่มี.
   - `changePlan` แค่สลับ planId ไม่มี proration / immediate-vs-period-end billing — ต้องประสานกับ billing layer.

5. **Ledger ต้อง atomic จริงใน durable adapter** — `saveForBillingEvent` ต้องเป็น transaction เดียว (Supabase) ไม่งั้น concurrent delivery ยังรั่วได้. Mock repo ผ่าน test แล้ว แต่ durable adapter ต้องพิสูจน์ atomicity.

6. **Reconciliation ต้อง idempotent ด้วย** — polling job กับ webhook อาจยิง event ซ้ำกัน; ต้องผ่าน `saveForBillingEvent` ledger เดียวกันเพื่อกัน double-processing.

---

## Assumptions

- WSTERA ใช้ licensed PromptPay gateway (Omise/Opn, 2C2P, EBANX, Boldrails, หรือ Stripe PromptPay) — ไม่ใช่ open-source QR library เปล่าๆ เพราะ library เปล่าไม่มี webhook/reconciliation/settlement (research ยืนยัน).
- บัตร (Stripe) ยังเป็นช่องทางหลักสำหรับ subscription; PromptPay เป็นช่องทางเสริม (ลูกค้าไทยส่วนใหญ่).
- "ตัดบัตรอัตโนมัติรายเดือน" หมายถึง recurring billing ผ่าน Stripe subscription (Stripe จัดการ dunning/retry ให้) — core แค่รับ normalized billing event.
- แต่ละโปรดักต์มี Supabase เป็น durable store (ledger + subscription state ใน transaction เดียว).
- Scheduler module (มีอยู่แล้ว) เป็นตัวขับ reconciliation + grace→expired job.

---

## Confidence

**78/100** — ลดจากสูงเพราะ: (1) ยังไม่ได้เห็น durable Supabase adapter ของ subscription (atomicity ยังไม่พิสูจน์), (2) PromptPay recurring flow ยังต้องออกแบบ dunning ใหม่ให้ต่างจากบัตร, (3) reconciliation layer ยังไม่มีใน evidence pack (เป็นชิ้นส่วนใหม่ที่ต้องสร้าง). โครงสร้างหลัก (แยก 2 ชั้น + adapter + reconciliation) มั่นใจสูงจาก evidence + research.
