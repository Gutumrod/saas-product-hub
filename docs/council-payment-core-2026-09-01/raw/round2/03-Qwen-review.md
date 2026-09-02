# Council R2 — Blind Peer Review (Qwen)

โจทย์: สร้าง core รับเงิน (PromptPay + ตัดบัตรอัตโนมัติ) plug-and-play สำหรับ WSTERA.com (หลายโปรดักต์) โดยใช้ ModuleHub payment + subscription module ที่มีอยู่ + Stripe

---

## Ranking

**D > C > B > A**

---

## จุดแข็งของแต่ละ candidate

### Candidate A
- ใช้ idempotency ledger ที่มีอยู่แล้วเป็นฐาน — ไม่สร้างของซ้ำ
- รับรู้ถูกต้องว่า PromptPay ไม่มี recurring → ต้องมี scheduler/job สร้าง QR ใหม่ทุกงวด
- รับรู้ว่า PromptPay ต้องผ่าน licensed gateway (Stripe/Omise/Welpay/GUPay) ไม่มี public merchant API
- ระบุความเสี่ยงเรื่อง map event type ผิดระหว่าง Stripe กับ subscription core

### Candidate B
- **จุดแข็งที่สุด:** ระบุช่องว่าง reconciliation ได้ชัดเจนที่สุดในกลุ่ม — "webhook พลาด → เงินถูกเก็บแต่ order ไม่ถูก mark paid = เงินหาย" และเสนอ scheduled job poll `getPayment()` ของ pending payments
- ระบุช่องว่างใน subscription module: ไม่มี transition อัตโนมัติ grace_period → expired (ต้อง scheduled job)
- ยืนยันว่า PromptPay ควรเป็น adapter ใหม่ ไม่ใช่ core ใหม่ (เป็น rail ที่ async/offline ต่างจากบัตร แต่ PaymentProvider contract ครอบคลุมได้)

### Candidate C
- **จุดแข็งที่สุด:** เน้น verify-on-webhook re-fetch + amount match — "อย่าเชื่อ webhook body" (ถูกต้องที่สุดด้าน security)
- เสนอ dunning/retry + reconciliation engine ครบ (decline classification, retry schedule, period-check idempotency, scheduled reconciliation)
- Idempotency 2 ชั้น: key TTL + business-logic period check
- ระบุ constraint ถูกต้อง: Stripe card ต้องเป็น primary recurring rail เพราะ PromptPay เป็น customer-initiated

### Candidate D
- **จุดแข็งที่สุด:** ครบถ้วนที่สุด — ครอบคลุมทุกประเด็นที่ A/B/C พูด และเพิ่มอีกหลายจุด
- ระบุชัดว่า PromptPay ไม่ใช่ pull-based recurring debit → ใช้ Stripe Billing/card/direct-debit เป็น recurring rail หลัก
- ระบุ webhook เป็น at-least-once → ต้องมี daily reconciler เทียบ Supabase ledger กับ provider state
- ระบุว่า bank/PromptPay APIs อาจไม่มี Idempotency-Key header → ต้อง host-side idempotency เอง
- ระบุ saveForBillingEvent ต้อง atomic Supabase transaction
- ระบุ dunning/retry ต้องเป็น product policy ไม่ใช่ hard-coded
- Confidence สูงสุด (86) และสมเหตุสมผล

---

## จุดอ่อน / สิ่งที่พลาดของแต่ละ

### Candidate A
- **พลาด reconciliation gap** — พูดถึง webhook idempotency ledger แต่ไม่ครอบคลุมกรณี "webhook พลาด → เงินหาย" ที่ B/D ระบุชัด
- ไม่พูดถึง dunning/retry gap ใน subscription module
- ไม่พูดถึง verify-on-webhook re-fetch + amount match (เชื่อ webhook body เกินไป)
- ไม่ระบุ primary recurring rail อย่างชัดเจน (แค่บอกว่า Stripe จัดการ dunning)

### Candidate B
- โครงสร้าง "5 ชั้น" สับสน — รายการจริงมี 6 ชั้น (Business Project → Subscription Core → Payment Core → Provider Adapters → Reconciliation Layer → Billing Orchestration) และตำแหน่ง Billing Orchestration กำกวม
- ไม่พูดถึง verify-on-webhook re-fetch + amount match (เหมือน A)
- ไม่ระบุ host-side idempotency สำหรับกรณี bank API ไม่มี Idempotency-Key header

### Candidate C
- ไม่พูดถึง scheduler สร้าง QR ใหม่ทุกงวดอย่างชัดเจน (A/B พูดถึง) — พูดแค่ reconciliation
- ไม่ระบุ daily reconciler เทียบ ledger กับ provider state อย่างชัดเจน (D ละเอียดกว่า)
- ไม่พูดถึง host-side idempotency สำหรับ bank API

### Candidate D
- เพิ่ม "Billing Orchestrator" เป็นชั้นใหม่ — เสี่ยง over-engineering / เพิ่ม seam ใหม่ที่ต้อง maintain (แม้จะบอกว่า "บางๆ")
- ไม่พูดถึง QR regeneration scheduler อย่างชัดเจน (A/B ครอบคลุมกว่าในจุดนี้)

---

## Fatal flaw?

**ไม่มี candidate ใดมี fatal flaw** — ทั้ง 4 ตัวเป็นสถาปัตยกรรมที่สมเหตุสมผลและใช้ของเดิมเป็นฐานถูกต้อง

ตัวที่อ่อนที่สุดคือ **A** (ไม่ครอบคลุม reconciliation + dunning gap) แต่ก็ไม่ถึงขั้น fatal — แค่ incomplete

---

## จุดที่ทุก candidate ยังตอบไม่ได้

1. **เลือก licensed gateway ตัวไหนจริง** — ทุกตัวบอก "Stripe/Omise/Welpay/GUPay" แต่ไม่มีตัวไหน commit กับตัวเดียวพร้อม tradeoff เรื่อง cost/approval/refund capability
2. **QR regeneration scheduling รายละเอียด** — ใครเป็นเจ้าของ job, cron cadence เท่าไหร่, จัดการ QR expiry ยังไง, แจ้งลูกค้ายังไง (ทุกตัวพูดถึง "ต้องมี scheduler" แต่ไม่มีตัวไหนออกแบบ flow เต็ม)
3. **Refund UX/policy สำหรับ PromptPay** — ทุกตัวยอมรับว่า refund เป็น provider decision แต่ไม่มีตัวไหนให้ concrete refund flow
4. **Multi-tenant/product isolation ใน ledger** — WSTERA มีหลายโปรดักต์ แต่ไม่มีตัวไหนพูดถึง tenant scoping ของ idempotency ledger / billing events
5. **Reconciliation mismatch handling** — เมื่อ reconciler เจอเงินถูกเก็บแต่ order ไม่ paid จะทำยังไง? manual intervention workflow? (ทุกตัวบอก "ต้องมี reconciler" แต่ไม่มีตัวไหนออกแบบ recovery path)
6. **Webhook signature verification** — ทุกตัวพูดถึง "ต้อง verify" แต่ไม่มีตัวไหนให้ concrete mechanism
7. **Card-fail fallback สำหรับ "no missed charges"** — ทุกตัวเห็นพ้องว่า Stripe card เป็น recurring rail แต่ไม่มีตัวไหนให้ dunning policy เฉพาะ + customer notification flow

---

## Confidence

**82/100**

เหตุผล: เนื้อหาทางเทคนิคของทั้ง 4 ตัวถูกต้องและสอดคล้องกันในประเด็นหลัก (PromptPay ไม่ใช่ recurring rail, ต้อง licensed gateway, ต้อง reconciliation) — ความเห็นพ้องสูงทำให้ ranking ค่อนข้างมั่นใจ แต่ยังมี blind spot ร่วม (gateway selection, QR scheduler detail, refund flow, tenant isolation) ที่ยังไม่มีตัวไหนตอบ ทำให้ไม่ถึง 90+
