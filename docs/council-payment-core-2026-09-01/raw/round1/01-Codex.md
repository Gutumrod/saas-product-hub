## Recommendation
ให้สร้าง Billing Orchestrator บาง ๆ เหนือ `PaymentCore` + `SubscriptionCore`: เพิ่ม `PromptPayPaymentProvider` เป็น adapter ใหม่สำหรับ QR / inquiry / webhook-normalized event และใช้ `SubscriptionCore` เป็น source of truth ของ lifecycle + entitlements; สำหรับ monthly recurring ที่ต้อง "no missed charges" ให้ใช้ Stripe Billing/card หรือ direct-debit provider เป็น recurring rail หลัก ไม่ใช่ PromptPay.

## เหตุผลหลัก (Key reasons)
ของที่มีอยู่เหมาะเป็นฐานแล้ว: `PaymentCore` แยก business logic ออกจาก provider ผ่าน `PaymentProvider`, บังคับ amount เป็น integer minor units, normalize payment states 7 สถานะ, บังคับ `idempotencyKey`, ไม่อ่าน env ตรง และใช้ Web APIs จึงเข้า Cloudflare Workers + Supabase ได้. `PromptPayPaymentProvider` ควร map flow เป็น `createPayment()` -> สร้าง dynamic QR/charge, return `checkoutUrl` หรือ QR payload ใน `rawProviderMetadata`, state เริ่ม `pending/requires_action`, `getPayment()` -> inquiry/check status, `parsePaymentEvent()` -> map webhook หลัง signature verification จาก Webhook Receiver.

`SubscriptionCore` ควรเป็น projection ของ billing truth: plan/price เปลี่ยนต่อ product ผ่าน `PlanRepository` เท่านั้น, entitlement ใช้ `canUseFeature/getLimit/checkUsage`, billing event จาก Stripe/PromptPay/direct-debit ถูก normalize เป็น `subscription.renewed`, `subscription.payment_failed`, `subscription.cancelled`, `subscription.expired`. จุดที่ดีมากคือ contract `saveForBillingEvent(subscription, eventId)` เป็น durable idempotency boundary ที่ต้องทำเป็น transaction เดียวใน Supabase: claim provider eventId + persist state พร้อมกัน.

PromptPay เหมาะกับ one-time checkout, top-up, invoice/manual renewal มากกว่า recurring. Bank of Thailand อธิบาย Thai QR Payment ว่าเป็นการสแกน QR ผ่าน mobile banking ([BOT](https://www.bot.or.th/en/financial-innovation/digital-finance/digital-payment/promptpay.html)); Stripe ระบุ PromptPay เป็น customer-initiated และ `Recurring payments: No` ([Stripe PromptPay](https://stripe.com/en-li/payment-method/promptpay)); เอกสาร Stripe PromptPay ก็อธิบาย flow ว่าลูกค้าเห็น QR แล้วสแกนด้วย Thailand bank app ([Stripe docs](https://docs.stripe.com/payments/promptpay)). Provider ไทย/SEA หลายเจ้ามีแนวทาง QR + webhook/inquiry เช่น Omise/Opn บอกให้ create charge, receive completion webhook, update status ([Opn/Omise PromptPay](https://www.omise.co/promptpay)); Bangkok Bank มี Thai QR Verify Online และ Thai QR Notification callback ([Bangkok Bank API portal](https://apiportal.bangkokbank.com/en/api/qr-payment/api-documents)); SCB Payment Gateway ระบุ real-time notifications และ reports เพื่อ reconciliation ([SCB](https://www.scb.co.th/en/corporate-banking/business-cash-management/scb-business-collection/scb-payment-gateway)).

สำหรับ subscription reliability ให้ใช้ Stripe Billing เป็น baseline ถ้ารับ card ได้: Stripe แนะนำ verify webhook signatures, handle subscription events, configure Smart Retries/custom retry rules, และกำหนด behavior หลัง retry สุดท้าย ([Stripe subscription overview](https://docs.stripe.com/billing/subscriptions/overview), [Stripe subscription webhooks](https://docs.stripe.com/billing/subscriptions/webhooks)). Smart Retries เลือกเวลาลองเก็บเงินซ้ำและ default ที่ Stripe แนะนำคือ 8 retries ใน 2 สัปดาห์ ([Stripe Smart Retries](https://docs.stripe.com/billing/revenue-recovery/smart-retries)). Billing core ควรมี reconciler รายวันเทียบ Supabase ledger กับ provider state เพราะ webhook เป็น at-least-once และ duplicate ได้; หลักการ idempotency/reconciliation ของระบบ payment คือใช้ idempotent writes + ledger ไม่ใช่หวัง exactly-once networking ([Prachub payment systems](https://prachub.com/concepts/payment-systems-ledgers-idempotency-and-reconciliation), [Lago webhook reliability](https://getlago.com/blog/billing-webhook-reliability-idempotency-and-retries)).

## ความเสี่ยง / จุดที่อาจผิด (Risks / failure points)
ความเสี่ยงใหญ่สุด: PromptPay ไม่ใช่ pull-based recurring debit. ถ้า WSTERA ต้องการ monthly subscription แบบไม่พลาดรอบเก็บเงินจริง ๆ การใช้ PromptPay QR รายเดือนจะกลายเป็น manual invoice/reminder flow: ออก QR ใหม่, แจ้งลูกค้า, รอจ่าย, webhook/polling, เข้า grace period. มันลด card decline ได้บางเคส แต่ไม่มี guarantee ว่าจะ charge เองเมื่อครบเดือน.

Webhook อย่างเดียวไม่พอสำหรับ PromptPay: ต้องมี polling/inquiry reconciler เพราะ provider บางรายอาจส่ง notification ช้า, ซ้ำ, หรือหาย. Architecture ต้องมี `payment_attempts`, `provider_events`, `billing_events`, `reconciliation_runs`, และ immutable audit log ใน Supabase; webhook handler ควรรับแล้ว ack เร็ว จากนั้น enqueue/process ด้วย idempotent job.

`PaymentCore` บังคับ `idempotencyKey` ดีสำหรับ Stripe แต่ PromptPay/bank APIs อาจไม่มี `Idempotency-Key` header แบบ Stripe. Adapter ใหม่จึงต้องทำ host-side idempotency เองด้วย unique `(provider, merchantId, referenceId/idempotencyKey)` + request hash + saved provider reference; ถ้า retry ด้วย key เดิม payload ต่างกันต้อง reject ไม่ใช่สร้าง QR/charge ใหม่เงียบ ๆ.

`SubscriptionCore.handleBillingEvent()` มีทั้ง `lastProcessedEventId` และ `saveForBillingEvent()`. จาก source ปัจจุบัน event ซ้ำติดกันจะถูกกันด้วย `lastProcessedEventId`, แต่ replay แบบ A -> B -> A ต้องพึ่ง implementation ของ `saveForBillingEvent()` เท่านั้น. ดังนั้น Supabase adapter ห้ามทำเป็น presence-only ที่ไม่ atomic; ต้อง unique provider event ID และ update subscription ใน transaction เดียว พร้อมเรียก hooks หลัง claim สำเร็จเท่านั้น.

Stripe adapter ปัจจุบันมี `recurringInterval` ใน `CreatePaymentRequest` และสร้าง Checkout Session `mode: subscription` ได้ แต่ `PaymentCore` design เดิมบอก subscription out of scope. ถ้าจะทำ plug-and-play ระยะยาวควรแยก `BillingProviderAdapter` สำหรับ subscription/invoice/provider subscription IDs ออกจาก one-time `PaymentProvider` ไม่งั้น PaymentCore จะเริ่มปน subscription semantics.

Dunning/retry ต้องเป็น product policy ไม่ใช่ hard-coded module behavior: failed payment -> `grace_period`, ส่ง email/LINE/in-app notice, retry schedule, payment method update link, final lock/expire. ถ้าใช้ PromptPay manual renewal ต้องมี invoice expiry, QR expiry, reminder schedule และ manual override/audit สำหรับลูกค้าธุรกิจ.

## Assumptions
PromptPay ใช้เป็น push/QR customer-initiated payment เป็นหลัก และไม่รองรับ native recurring debit ตามข้อมูล Stripe.

WSTERA ยอมรับ card/Stripe Billing หรือ direct-debit rail แยกสำหรับ subscription ที่ต้อง auto-charge; PromptPay เป็น local payment option สำหรับ one-time/manual invoice fallback.

Supabase เป็น durable ledger store สำหรับ event claim, payment attempts, subscription projection, reconciliation state และ audit events.

Cloudflare Workers เป็น runtime หลัก จึงต้องรักษา TypeScript strict, no `node:*`, no direct env access, secrets injected via host config.

ค่าธรรมเนียมและ settlement ขึ้นกับ provider/acquirer จริง; T+1 อาจใช้กับบาง provider แต่ไม่ควร hard-code ใน core. ให้เก็บ `availableAt/settledAt/providerFeeMinorUnits` จาก reconciliation/settlement report ต่อ provider.

## Confidence
86
