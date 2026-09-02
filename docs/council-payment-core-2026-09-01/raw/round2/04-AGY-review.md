# Council R2 — Blind Peer Review (AGY)

โจทย์: สร้าง core รับเงิน (PromptPay + ตัดบัตรอัตโนมัติ) plug-and-play สำหรับ WSTERA.com โดยใช้ ModuleHub payment + subscription module ที่มีอยู่ + Stripe

---

## Ranking

**D > C > B > A**

---

## จุดแข็งของแต่ละ candidate

### Candidate A
- ใช้ Payment Core + Subscription Core ที่มีอยู่เป็นฐาน ไม่สร้าง core ใหม่ — ถูกต้อง
- เพิ่ม PromptPay เป็น adapter ตัวที่ 2 ข้างๆ Stripe ผ่าน `PaymentProvider` contract เดียว — เรียบง่าย ตรงไปตรงมา
- รับรู้ว่า PromptPay ไม่มี recurring ต้องมี scheduler สร้าง QR ใหม่ทุกงวด
- ระบุความเสี่ยงเรื่อง event-level idempotency (ledger) ไม่ใช่ subscription-level — จุดที่ละเอียดดี

### Candidate B
- ชี้ชัดว่าชิ้นส่วนที่ขาดจริงคือ **Reconciliation Layer** (async-payment polling) — เป็น insight ที่ถูกต้องและสำคัญที่สุด
- อธิบาย scenario เงินหายได้ชัดเจน: webhook พลาด → เงินถูกเก็บแต่ order ไม่ถูก mark paid
- ระบุช่องว่างใน subscription module: ไม่มี transition อัตโนมัติ grace_period → expired (ต้อง scheduled job) — จุดที่ A/C/D ไม่ได้พูดถึงชัดเท่า
- เน้นว่า Reconciliation ต้อง idempotent ด้วย

### Candidate C
- ครบที่สุดในแง่ "ชิ้นส่วนที่ขาด": เพิ่มทั้ง PromptPay Adapter **และ** Dunning/Retry + Reconciliation Engine
- จุดแข็งทางเทคนิคที่โดดเด่น: **อย่าเชื่อ webhook body — ต้อง re-fetch transaction + amount match** (ถูกต้องมาก เป็น best practice)
- Idempotency 2 ชั้น: key TTL + business-logic period check — เป็น design ที่เป็นรูปธรรม
- ระบุ decline classification + retry schedule ใน Subscription Core

### Candidate D
- Grounded ที่สุด: อ้าง BOT (QR scan) + Stripe (Recurring payments: No) เพื่อยืนยันว่า PromptPay ไม่เหมาะกับ recurring — มีหลักฐานรองรับ
- Scoping ถูกต้อง: PromptPay สำหรับ one-time checkout/top-up/invoice, Stripe Billing/card เป็น recurring rail หลัก
- ละเอียดเรื่อง atomicity: saveForBillingEvent ต้อง atomic Supabase transaction
- รับรู้ว่า bank/PromptPay API อาจไม่มี Idempotency-Key header → ต้อง host-side idempotency เอง
- ระบุว่า dunning/retry ต้องเป็น product policy ไม่ใช่ hard-coded
- Confidence สูงสุด (86) และสมเหตุสมผล

---

## จุดอ่อน / สิ่งที่พลาด ของแต่ละ

### Candidate A
- **พลาดเรื่อง Reconciliation มากที่สุด** — ไม่มีชิ้นส่วนใหม่ที่จัดการ "webhook พลาด → เงินหาย" เลย พึ่งแค่ idempotency ledger ที่มีอยู่ ซึ่งไม่พอสำหรับ async rail อย่าง PromptPay
- วางใจ Stripe จัดการ dunning อย่างเดียว ไม่พูดถึง reconciliation กับ ledger
- ไม่พูดถึง re-fetch + amount match (เชื่อ webhook body ตรงๆ)
- เรียบง่ายเกินไป — เหมาะกับบัตร (sync) แต่ไม่ครอบคลุม async/offline ของ PromptPay

### Candidate B
- **โครงสร้าง 5 ชั้นสับสน** — ประกาศ "5 ชั้น" แต่ list 6 รายการ และลำดับแปลก (Billing Orchestration ไปอยู่ท้ายสุด ทั้งที่ควรเป็นชั้นบนสุด) — architecture clarity ต่ำ
- ไม่พูดถึง dunning/retry สำหรับบัตรชัดเจน (บอกแค่ Stripe จัดการ)
- ไม่พูดถึง re-fetch + amount match / webhook signature verification
- Reconciliation ดี แต่ placement ในลำดับชั้นไม่ชัด

### Candidate C
- ไม่ได้พูดถึง webhook signature verification ตรงๆ (แม้จะเน้น re-fetch)
- ไม่ได้พูดถึง QR expiry UX / retry UX สำหรับ PromptPay
- ไม่ได้พูดถึง atomicity ของ ledger write (D ละเอียดกว่า)
- ครบแต่ไม่ลึกเท่า D ในแง่ grounding

### Candidate D
- ไม่ได้พูดถึง grace_period → expired transition ใน subscription module (B พูดถึง)
- ไม่ได้พูดถึง decline classification / retry schedule ละเอียดเท่า C
- ไม่ได้พูดถึง QR expiry UX / วิธีแจ้ง user เมื่อ QR หมดอายุ
- จุดอ่อนน้อยที่สุด แต่ยังไม่ครบเรื่อง lifecycle transition

---

## Fatal flaw?

**ไม่มี candidate ใดมี fatal flaw** — ทั้ง 4 หลีกเลี่ยงกับดักหลักได้ถูกต้อง (ไม่สร้าง core ใหม่, ไม่ใช้ PromptPay เป็น recurring rail, ใช้ Stripe card เป็น recurring หลัก)

จุดที่ใกล้ fatal ที่สุดคือ **Candidate A** — การไม่มี reconciliation layer สำหรับ async rail ถือเป็น gap ที่ร้ายแรงต่อ requirement "no missed charges" (ถ้า webhook พลาด เงินหายจริง) แต่ไม่ถึงขั้น fatal เพราะ design ยังใช้งานได้กับบัตร และ Stripe จัดการ dunning เอง — จัดเป็น "significant gap" ไม่ใช่ fatal

---

## จุดที่ทุก candidate ยังตอบไม่ได้

1. **เลือก licensed PromptPay gateway ตัวไหนจริง** — Omise/Opn vs Welpay vs GUPay vs Stripe PromptPay — ไม่มีใคร commit ตัวเดียวพร้อมราคา/availability/refund capability
2. **QR expiry UX** — QR หมดอายุกลาง checkout ทำยังไง, retry UX, grace period กี่วัน
3. **Refund flow ของ PromptPay** — partial refund, timing, provider-specific behavior
4. **Multi-product billing** — core เดียวรับหลายโปรดักต์ของ WSTERA ที่ billing cycle ต่างกันยังไง
5. **Webhook signature verification** — implementation ยังไง (ทุกตัวพูดถึงแต่ไม่ลงรายละเอียด)
6. **Scheduler/job infrastructure** — cron บน Cloudflare Workers / durable execution ตัวไหน ขับ reconciliation + QR generation ยังไง
7. **Compliance** — Thai tax invoice, PromptPay merchant registration, PCI scope สำหรับบัตร
8. **Dispute/chargeback** — reconciliation จัดการยังไง
9. **Dunning/retry policy** — กำหนดเป็น product policy ยังไง (D พูดถึงแต่ไม่นิยาม)

---

## Confidence

**82/100**

เหตุผล: ทั้ง 4 candidate มีคุณภาพสูงและเห็นพ้องในหลักการสำคัญ (ใช้ core เดิมเป็นฐาน, PromptPay = adapter ไม่ใช่ recurring rail, ต้องมี reconciliation) — ความเห็นพ้องนี้ทำให้ ranking ค่อนข้างมั่นใจ แต่มั่นใจไม่ถึง 90 เพราะ (1) ยังไม่มีใครตอบเรื่อง gateway selection + compliance + scheduler infra ซึ่งเป็นตัวตัดสิน feasibility จริง, (2) ranking ระหว่าง D กับ C ใกล้กันมาก (D ชนะด้วย grounding + atomicity, C ชนะด้วยความครบของ dunning/retry) — ถ้าโจทย์เน้น recurring reliability มากกว่า C อาจแซง D ได้
