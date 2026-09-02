# Council R2 — Blind Peer Review (Candidate A/B/C/D)

โจทย์: สร้าง core รับเงิน (PromptPay + ตัดบัตรอัตโนมัติ) plug-and-play สำหรับ WSTERA.com (หลายโปรดักต์) โดยใช้ ModuleHub payment + subscription module ที่มีอยู่ + Stripe

---

## Ranking

**D > C > B > A**

---

## จุดแข็งของแต่ละ candidate

### Candidate A
- ออกแบบ provider-agnostic 2 ชั้นชัดเจน — เพิ่ม PromptPay เป็น adapter ตัวที่ 2 ข้างๆ Stripe โดย implement `PaymentProvider` contract เดียวกัน (plug-and-play จริง)
- ใช้ idempotency ledger ที่มีอยู่แล้วใน subscription module ต่อ — reuse ดี ไม่สร้างของซ้ำ
- ระบุถูกว่า PromptPay เป็น one-time QR (expiry 24h) ไม่มี auto-charge → ต้อง scheduler สร้าง QR ใหม่ทุกงวด
- ระบุความเสี่ยงเรื่อง event-level idempotency (ไม่ใช่ subscription-level) และ webhook signature verification

### Candidate B
- **จุดแข็งที่สุด: ระบุช่องว่างที่แท้จริงได้แม่น** — Reconciliation Layer (async-payment polling) เป็นชิ้นส่วนที่ขาดอยู่จริง และอธิบาย scenario "webhook พลาด → เงินถูกเก็บแต่ order ไม่ถูก mark paid = เงินหาย" ได้ตรงประเด็น
- ยืนยันหลักการถูกต้อง: PromptPay ควรเป็น adapter ใหม่ ไม่ใช่ core ใหม่ (เป็น rail ที่ async/offline ต่างจากบัตร แต่ PaymentProvider contract ครอบคลุมได้)
- ระบุช่องว่างใน subscription module: ไม่มี transition อัตโนมัติ grace_period → expired (ต้อง scheduled job) — เป็น insight ที่ candidate อื่นไม่ได้พูดชัด
- เน้นว่า reconciliation ต้อง idempotent ด้วย

### Candidate C
- **จุดแข็งที่สุด: เน้นความถูกต้องของข้อมูล (correctness)** — "อย่าเชื่อ webhook body — ต้อง re-fetch transaction จาก provider + match amount" เป็นจุดที่ candidate อื่นไม่ได้เน้นชัดเท่า
- Idempotency 2 ชั้น: key TTL + business-logic period check — ละเอียดและใช้งานได้จริง
- ระบุ dunning/retry + reconciliation engine ครบ (decline classification, retry schedule, scheduled reconciliation)
- ระบุ constraint ถูก: PromptPay เป็น customer-initiated ไม่สามารถ auto-renew → Stripe card ต้องเป็น primary recurring rail

### Candidate D
- **จุดแข็งที่สุด: ครบถ้วนและ grounded กับข้อเท็จจริงมากที่สุด** — อ้างหลักฐานจริง: BOT อธิบาย PromptPay เป็น QR scan, Stripe ระบุ "Recurring payments: No", Stripe Billing Smart Retries 8 retries ใน 2 สัปดาห์
- แยกชัด: PromptPay เหมาะกับ one-time checkout/top-up/invoice ไม่ใช่ recurring — ตัดสินใจ product decision ได้ตรง
- ระบุ host-side idempotency เอง (PromptPay/bank APIs อาจไม่มี Idempotency-Key header) — เป็นจุดที่ candidate อื่นพลาด
- ระบุ daily reconciler เทียบ Supabase ledger กับ provider state เพราะ webhook เป็น at-least-once
- ระบุ dunning/retry ต้องเป็น product policy ไม่ใช่ hard-coded
- Confidence สูงสุด (86) และสอดคล้องกับความครบถ้วน

---

## จุดอ่อน / สิ่งที่พลาด ของแต่ละ candidate

### Candidate A
- **พลาดช่องว่าง reconciliation/polling** — อาศัย webhook idempotency ledger ที่มีอยู่ แต่ไม่ได้ระบุชัดว่าต้องมี scheduled job poll `getPayment()` เพื่อกัน "webhook พลาด → เงินหาย" (candidate B/C/D ระบุชัด)
- ไม่พูดถึง re-fetch + amount match (อย่าเชื่อ webhook body) — อ่อนเรื่อง correctness
- ไม่พูดถึง host-side idempotency เมื่อ bank API ไม่มี Idempotency-Key header
- ไม่ระบุช่องว่าง grace_period → expired transition ใน subscription module

### Candidate B
- **โครงสร้าง 5 ชั้นมั่ว** — ระบุ "โครงสร้าง 5 ชั้น" แต่ list 6 ชิ้น (Business Project, Subscription Core, Payment Core, Provider Adapters, Reconciliation Layer, Billing Orchestration) และลำดับชั้นสับสน (Reconciliation Layer อยู่ใต้ Provider Adapters แต่ Billing Orchestration อยู่ล่างสุด)
- ไม่เน้น re-fetch + amount match (อย่าเชื่อ webhook body) เท่า C
- ไม่พูดถึง host-side idempotency เมื่อ bank API ไม่มี Idempotency-Key header
- วาง Reconciliation Layer เป็นชั้นแยก — ดี แต่ placement ในลำดับชั้นไม่ชัดเจน

### Candidate C
- วาง Dunning/Retry + Reconciliation Engine **ใน Subscription Core** — เสี่ยง scope creep / ผสม concern (reconciliation ควรเป็นชั้นแยกหรือ orchestrator มากกว่าอยู่ใน core)
- ไม่พูดถึง host-side idempotency เมื่อ bank API ไม่มี Idempotency-Key header
- ไม่ระบุช่องว่าง grace_period → expired transition (B ระบุ)
- ไม่พูดถึง daily reconciler cadence / at-least-once webhook อย่างชัดเจนเท่า D

### Candidate D
- ไม่ได้ระบุชัดเรื่อง QR expiry handling / generate-new-QR → notify → grace → expire workflow (B ระบุละเอียดกว่า)
- ไม่ได้พูดถึง event type mapping ระหว่าง Stripe ↔ subscription core (A ระบุ)
- ไม่ได้ระบุช่องว่าง grace_period → expired transition ใน subscription module (B ระบุ)
- จุดอ่อนน้อยที่สุด แต่ยังไม่ครบทุกมุม

---

## Fatal flaw?

**ไม่มี candidate ใดมี fatal flaw** — ทั้ง 4 เห็นพ้องบนแกนหลักที่ถูกต้อง (ใช้ core เดิมเป็นฐาน, เพิ่ม PromptPay เป็น adapter ไม่ใช่ core ใหม่, ใช้ licensed gateway, Stripe card เป็น primary recurring rail, ต้องมี reconciliation) และไม่มีใครแนะนำสถาปัตยกรรมที่ผิดพลาดร้ายแรง

จุดที่ใกล้ fatal ที่สุดคือ **Candidate A** — ถ้า implement ตามที่เขียนโดยไม่เพิ่ม reconciliation/polling layer จะเสี่ยง "webhook พลาด → เงินหาย" (เงินถูกเก็บแต่ order ไม่ mark paid) ซึ่งเป็น business-critical แต่ A ยังระบุความเสี่ยงเรื่อง QR expiry และ scheduler ไว้บ้าง จึงไม่ถึงขั้น fatal

---

## จุดที่ทุก candidate ยังตอบไม่ได้

1. **PromptPay refund** — ทุกคนยอมรับว่าเป็น provider decision ไม่ใช่ rail property แต่ไม่มีใครให้ concrete policy ว่าจะ handle ยังไงเมื่อ provider ปฏิเสธ refund (partial/duplicate/chargeback)
2. **"No missed charges" สำหรับลูกค้า PromptPay-only** — ทุกคนปัดไปที่ "ใช้ Stripe card เป็น primary recurring rail" แต่ไม่มีใครตอบว่า WSTERA จะทำยังไงกับลูกค้าที่ไม่มีบัตร (จะบังคับให้มีบัตรเท่านั้น? หรือยอมรับ missed payment?)
3. **Reconciliation cadence ที่แท้จริง** — ทุกคนบอก "ต้องมี reconciler" แต่ไม่มีใครระบุ concrete cadence/strategy (daily? per-event? batch window? จะ reconcile ยังไงกับ partial/duplicate webhook)
4. **grace_period → expired transition** — มีแค่ B ที่ระบุเป็นช่องว่าง แต่ไม่มีใครให้ design ที่สมบูรณ์ว่า scheduled job นี้จะอยู่ที่ไหนและ trigger ยังไง
5. **Provider API capabilities จริง** — ทุกคน assume licensed gateway แต่ไม่มีใคร verify ว่า gateway ที่เลือก (Stripe PromptPay / Omise / Welpay / GUPay) รองรับ inquiry endpoint, idempotency-key, refund ยังไงจริง
6. **Multi-product billing orchestration** — ทุกคนพูดถึง "หลายโปรดักต์" แต่ไม่มีใครอธิบายว่า Billing Orchestrator จะ route billing ต่อ product ยังไง (per-product config? shared ledger?)
7. **Webhook signature / security** — มีแค่ A ที่พูดถึง verify webhook signature; ไม่มีใครให้ design ครบเรื่อง secret rotation, replay protection

---

## Confidence

**85/100**

เหตุผล: Ranking D > C > B > A ค่อนข้างชัดเจน — D ครบถ้วนและ grounded กับข้อเท็จจริงมากที่สุด (อ้าง BOT/Stripe spec, ครอบคลุม host-side idempotency, daily reconciler, product policy) ส่วน A อ่อนสุดเพราะพลาด reconciliation gap ที่เป็น business-critical อย่างไรก็ตาม ความต่างระหว่าง C กับ B ใกล้กัน (C ชนะเรื่อง correctness re-fetch/amount-match, B ชนะเรื่องระบุ reconciliation gap และ grace→expired) และไม่มี candidate ใดมี fatal flaw จึงไม่ลด confidence มากนัก แต่ยังมีจุดที่ทุกคนตอบไม่ได้ (refund policy, PromptPay-only customers, reconciliation cadence) ที่ต้องให้ human/owner ตัดสินใจต่อ
