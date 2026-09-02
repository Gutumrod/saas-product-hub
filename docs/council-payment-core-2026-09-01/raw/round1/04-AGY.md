# Council Round 1 — AGY: สถาปัตยกรรม core รับเงิน (PromptPay + ตัดบัตรอัตโนมัติ) สำหรับ WSTERA

> **หมายเหตุ:** ไฟล์นี้สร้างโดย Hermes (chairman) จาก completion metadata ของ task `t_44425987` — AGY ตอบกลับมาใน summary/metadata ของการ์ด (ไม่มี council-answer.md attach แยก)

## Recommendation

ใช้ Payment Core + Subscription Core (ModuleHub) ที่มีอยู่เป็นฐาน (seams แข็งแรง) แล้วเพิ่ม 2 ชิ้นที่ขาด:
1. **PromptPay Adapter** ใน Payment Core — ผ่าน licensed gateway (Omise/Stripe), verify-on-webhook re-fetch + amount match, declared refund capability
2. **Dunning/Retry + Reconciliation Engine** ใน Subscription Core — decline classification, retry schedule, period-check idempotency, scheduled reconciliation

**Key constraint:** PromptPay เป็น customer-initiated และไม่สามารถ auto-renew ได้ → **Stripe card ต้องเป็น primary recurring rail**

## เหตุผลหลัก

- Seams ของ Payment/Subscription Core แข็งแรงอยู่แล้ว — reuse ดี ไม่สร้างของซ้ำ
- PromptPay ไม่มี public merchant API — ต้อง licensed gateway (KYB)
- ต้อง re-fetch transaction จาก provider + match amount (ห้ามเชื่อ webhook body อย่างเดียว)
- Subscription Core ขาด dunning/retry + reconciliation — ต้องเพิ่ม decline classification, retry schedule, period-check idempotency, scheduled reconciliation
- Idempotency ต้อง 2 ชั้น: key TTL + business-logic period check

## ความเสี่ยง / จุดที่อาจผิด

- PromptPay refund เป็น provider decision ไม่ใช่ rail property — อย่า assume refund ได้ทุกราย
- ห้ามเชื่อ webhook body — ต้อง re-fetch + amount match
- ต้องมี reconciliation เพื่อกันเงินหาย

## Assumptions

- ใช้ licensed gateway (KYB)
- Stripe card เป็น primary recurring rail

## Confidence

**78/100**

## research_sources (จาก metadata)
Boldrails PromptPay API, Bangkok Bank QR Payment API, Payrails/dLocal PromptPay, Ezypay PromptPay, GUPay PromptPay, SCB Partners API, ireadcustomer PromptPay reconciliation, Stripe idempotent requests, HookCap webhook best practices, Stripe dunning, pratikdhanave dunning/retry engine, Praesidia reliable billing, techinterview subscription billing, spacecomplexity subscription billing, letsbuildsolutions payment processing
