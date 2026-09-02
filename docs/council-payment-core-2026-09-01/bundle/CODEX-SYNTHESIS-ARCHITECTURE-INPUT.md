# CODEX SYNTHESIS INPUT — Architecture (Council Round 1 + Round 2)

**บทบาท:** คุณคือ Independent Synthesizer ไม่ใช่ expert
**ห้าม:** ทำหน้าที่เป็น expert, infer consensus ที่ evidence ไปไม่ถึง, อ้าง Candidate identity
**งาน:** สังเคราะห์จาก anonymized candidates + evidence manifest ข้างล่าง แล้วออก synthesis ตาม output contract

---

## Original Council Brief (คำต่อคำที่ expert ได้)

สร้าง core รับเงินจากลูกค้า ใช้กับ WSTERA.com (หลายโปรดักต์ แต่ละตัวเก็บเงินต่างกัน) โดย:
1. แพทเทิร์นรับเงินด้วย **PromptPay** (QR / ตรวจยอด)
2. **ตัดบัตรอัตโนมัติรายเดือน** (subscription billing — ความแม่นยำสูง ห้ามพลาด)

ทั้ง 2 ต้องมาคู่กันเสมอ และ **plug-and-play** — เอาไปใช้กับโปรดักต์ไหนก็ได้ แค่เปลี่ยนราคา/รายละเอียด

**สิ่งที่มีแล้ว:** ModuleHub `payment` (Completed 0.1.0, มี stripe-adapter.ts) + `subscription` (Completed 0.1.0, state machine ครบ). Stack: Cloudflare Workers + Supabase (TS strict, ไม่มี node:*).

**Evidence manifest (ที่ expert ต้องอ่าน):**
- `D:\AI-Workspace\projects\modules-hub\modules\payment\DESIGN.md` + `core/` + `adapters/stripe-adapter.ts`
- `D:\AI-Workspace\projects\modules-hub\modules\subscription\DESIGN.md` + `core/`
- `D:\AI-Workspace\projects\modules-hub\modules\REGISTRY.md`

**User decisions (คุณฟรี ตอบแล้ว):**
1. Gateway = **Stripe** (สมัครไว้แล้ว)
2. ยอมรับ **PromptPay** (คนไทยถนัด QR). กติกา: แจ้งเมลก่อนหมด 2-5 วัน → ไม่จ่ายหลังหมด 3 วัน → ตัดกลับฟรีเทียร์ (ถ้ามี) / ไม่มีฟรีเทียร์ → แจ้ง 5 วัน+หลังหมดอีกครั้ง → ตัด (เก็บประวัติ)
3. Refund = **เปิด ticket → เจ้าหน้าที่โอนมือ** (คุณฟรีเอง)
4. Multi-product = **core กลางใช้ร่วม แยก product ID + config ต่อ product** (สอดคล้อง WSTERA Control Plane)

---

## Anonymized Candidates (Round 1 — architecture answers)

### Candidate A
Provider-agnostic 2 ชั้น ใช้ ModuleHub เดิมเป็นฐาน. เพิ่ม PromptPay adapter เป็น provider ที่ 2 (ข้าง Stripe) ผ่าน licensed gateway (Omise/Stripe/Welpay/GUPay). Subscription core จัด dunning/retry (Stripe Smart Retries) ส่วน PromptPay ต้อง scheduler สร้าง QR ใหม่ทุกงวด. Idempotency ต้อง event-level (ledger). Map event type ต้องแม่น (Stripe invoice.payment_failed ≠ payment.failed). Refund ขึ้นกับ provider. **Confidence 78**

### Candidate B
คง 2 ชั้นเดิม + PromptPay adapter + **Reconciliation layer** (async-payment polling) เป็นชิ้นส่วนใหม่ที่ขาด. โครงสร้าง 5 ชั้น: Business → Subscription Core → Payment Core → Provider Adapters → Reconciliation → Billing Orchestration. Webhook คือ source of truth แต่ถ้าพลาด = เงินหาย. ต้อง scheduled job poll `getPayment()`. PromptPay recurring ต่างจากบัตร (generate-new-QR → notify → grace → expire). ต้องจัดการ grace_period→expired (ไม่มี transition อัตโนมัติ). Refund ไม่ได้มีทุก provider. **Confidence 78**

### Candidate C
ใช้ Payment+Subscription Core เดิมเป็นฐาน + เพิ่ม (1) PromptPay adapter ผ่าน licensed gateway (verify-on-webhook re-fetch + amount match + declared refund), (2) Dunning/Retry + Reconciliation Engine ใน Subscription Core (decline classification, retry schedule, period-check idempotency, scheduled reconciliation). PromptPay เป็น customer-initiated ไม่ auto-renew → **Stripe card ต้องเป็น primary recurring rail**. Idempotency 2 ชั้น (key TTL + business-logic period check). **Confidence 78**

### Candidate D (หมายเหตุ: ไม่ระบุ identity ให้คุณ)
สร้าง **Thin Billing Orchestrator** เหนือ PaymentCore + SubscriptionCore. เพิ่ม PromptPayPaymentProvider adapter (QR/inquiry/webhook). SubscriptionCore = source of truth lifecycle + entitlements. **Stripe Billing/card หรือ direct-debit เป็น recurring rail หลัก** (PromptPay no native recurring — BOT/Stripe ยืนยัน). Daily reconciler เทียบ Supabase ledger กับ provider state (webhook at-least-once). Host-side idempotency (bank API ไม่มี Idempotency-Key). Dunning/retry = product policy. Stripe Smart Retries 8/2wk. **Confidence 86**

---

## Anonymized Blind Peer Reviews (Round 2 — ranking ของ 3 reviewer)

> ทั้ง 3 reviewer เห็นพ้อง: **D > C > B > A**, ไม่มี fatal flaw

- **Candidate D** อ้าง BOT/Stripe spec, host-side idempotency, daily reconciler, product policy — grounded ครบถ้วนสุด. อ่อน: QR expiry UX, Stripe↔core event mapping, multi-product isolation ยังไม่ละเอียด.
- **Candidate C** correctness ดีสุด (re-fetch + amount match). อ่อน: วาง dunning/reconciliation ใน Subscription Core (เสี่ยง scope creep), ไม่พูด host-side idempotency.
- **Candidate B** ระบุ reconciliation gap + grace→expired ได้ดี. อ่อน: โครงสร้าง 5 ชั้นสับสน (list 6 ชิ้น), ไม่เน้น re-fetch.
- **Candidate A** อ่อนสุด — พลาด reconciliation/polling (เสี่ยง "webhook พลาด → เงินหาย" = business-critical). ถูกทิศทางแต่ตอบ async payment เบาไป.
- **จุดที่ทุกตัวยังตอบไม่ได้:** PromptPay refund policy จริง, ลูกค้า PromptPay-only (ไม่มีบัตร), reconciliation cadence จริง, เลือก gateway ตัวไหน, multi-product isolation, webhook signature/security ละเอียด.

---

## งานสังเคราะห์
ใช้ output contract ต่อไปนี้ (Codex synthesis):
1. Problem understood
2. Verified facts
3. Areas of agreement
4. Majority positions
5. Minority / dissent positions
6. Missing evidence / unresolved questions
7. Synthesizer recommendation
8. Why this recommendation
9. Rejected alternatives + why
10. Gate status (ถ้ามี: Decision/Architecture/Implementation/Production)
11. Blockers before next gate
12. Confidence 0-100

เขียนผลลง `synthesis.md` ใน workspace แล้วรายงาน path + สรุปสั้น.
