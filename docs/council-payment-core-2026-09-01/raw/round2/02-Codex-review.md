# Blind Peer Review - Council Round 2

## 1. Ranking - ดีที่สุด -> แย่ที่สุด

**D > C > B > A**

เหตุผลสั้น: Candidate D ตอบโจทย์ business reliability ได้ชัดที่สุด เพราะแยกตรง ๆ ว่า PromptPay ไม่ใช่ rail สำหรับ "automatic recurring charge" และเสนอให้ใช้ Stripe Billing/card หรือ direct-debit provider เป็น recurring rail หลัก พร้อมวาง Billing Orchestrator บาง ๆ เหนือ PaymentCore + SubscriptionCore. Candidate C ตามมาติด ๆ เพราะเข้มเรื่อง webhook verification, re-fetch, amount match, dunning/retry และ reconciliation แต่ยังไม่ชัดเท่า D เรื่อง ownership ของ orchestrator และ product policy. Candidate B ดีเรื่อง reconciliation และ scheduler แต่โครงสร้างที่เขียนเป็น 5 ชั้นยังสับสนเล็กน้อย. Candidate A ถูกทิศทางพื้นฐาน แต่ขาด reconciliation และตอบความเสี่ยง async payment เบาเกินไป.

## 2. Strengths of Each Candidate

### Candidate A

- วางฐานถูกว่าไม่ควรสร้าง core ใหม่ แต่ควรใช้ ModuleHub เดิมเป็นฐาน แล้วเพิ่ม `PromptPay adapter` เป็น provider ตัวที่ 2 ข้าง Stripe.
- เข้าใจข้อจำกัดสำคัญว่า PromptPay เป็น one-time QR, ไม่มี auto-charge, QR มี expiry และต้องมี scheduler/job สร้าง QR ใหม่ทุกงวด.
- ชี้เรื่องสำคัญด้าน safety ได้หลายจุด: event-level idempotency, webhook signature verification, risk จากการ map event type ผิด และ refund capability ที่ขึ้นกับ provider.
- ระบุทางเลือก gateway ได้สมเหตุสมผล เช่น Stripe PromptPay, Omise/Opn, Welpay, GUPay แทนการ assume ว่ามี PromptPay merchant API ตรง.

### Candidate B

- จับ gap สำคัญที่ A พลาด: `Reconciliation Layer` สำหรับ async payment โดยเฉพาะกรณี webhook พลาดแล้วเงินถูกเก็บแต่ order/subscription ไม่ถูก mark paid.
- ระบุ lifecycle ของ PromptPay recurring-like flow ได้ดีกว่า A: generate-new-QR -> notify -> grace -> expire.
- เห็นปัญหาใน Subscription Core ว่าไม่มี transition อัตโนมัติจาก `grace_period` -> `expired` จึงต้องมี scheduled job.
- ย้ำว่า durable adapter ต้องมี atomic ledger และ reconciliation ต้อง idempotent ซึ่งตรงกับ risk จริงของ billing system.

### Candidate C

- แข็งเรื่อง payment verification กว่า B/A: บอกชัดว่า webhook ต้อง `re-fetch transaction from provider + amount match` ไม่เชื่อ webhook body อย่างเดียว.
- เสนอ Dunning/Retry + Reconciliation Engine ใน Subscription Core พร้อม decline classification, retry schedule, period-check idempotency และ scheduled reconciliation.
- แยกข้อเท็จจริงถูกว่า PromptPay เป็น customer-initiated และ Stripe card ควรเป็น primary recurring rail.
- ระบุว่า refund เป็น provider decision ไม่ใช่ property ของ PromptPay rail ซึ่งเป็น nuance สำคัญต่อ contract ของ adapter.

### Candidate D

- ตอบโจทย์ "PromptPay + automatic card charging" ได้ตรงที่สุด: PromptPay สำหรับ push/QR customer-initiated, ส่วน monthly recurring/no missed charges ต้องใช้ Stripe Billing/card หรือ direct-debit provider.
- เสนอ `Billing Orchestrator` แบบบาง ๆ เหนือ PaymentCore + SubscriptionCore ซึ่งเป็นตำแหน่ง abstraction ที่เหมาะกว่าเอา policy ทั้งหมดไปยัดใน payment adapter หรือ subscription state machine.
- ให้รายละเอียดจากของเดิมมากที่สุด เช่น PaymentCore บังคับ integer minor units, normalize 7 status, require idempotencyKey, Cloudflare Workers-ready.
- ระบุ operational reliability ครบกว่า: webhook เป็น at-least-once, ต้องมี daily reconciler เทียบ Supabase ledger กับ provider state, PromptPay/bank APIs อาจไม่มี Idempotency-Key header จึงต้อง host-side idempotency.
- แยก product policy ออกจาก core ได้ดี โดยบอกว่า dunning/retry ต้องเป็น product policy ไม่ใช่ hard-coded.

## 3. Weaknesses / What Each Missed

### Candidate A

- จุดอ่อนหลักคือไม่มี reconciliation/polling/inquiry layer ทั้งที่ PromptPay เป็น async/offline rail. ถ้า webhook หายหรือ delayed จะเกิดสถานะเงินกับ subscription ไม่ตรงกัน.
- พูดว่า Stripe adapter ที่มีอยู่รองรับ PromptPay ผ่าน Checkout/Payment Element แต่ยังไม่แยกชัดว่าถ้าใช้ Stripe PromptPay จริง จะเป็น Stripe adapter capability ไม่ใช่ necessarily ต้องมี PromptPay adapter แยกอีกตัวเสมอ.
- Scheduler ถูกพูดถึงเฉพาะสร้าง QR ใหม่ทุกงวด แต่ยังไม่ครอบคลุม expire pending invoice, notify user, grace handling, failed renewal, retry policy และ entitlement decision.
- ไม่พูดเรื่อง provider re-fetch/amount/currency match ก่อน mark paid.
- ไม่ระบุ adapter contract สำหรับ refund/capability discovery ให้ชัดพอ.

### Candidate B

- โครงสร้าง "5 ชั้น" ที่เขียนเป็น Business Project -> Subscription Core -> Payment Core -> Provider Adapters -> Reconciliation Layer -> Billing Orchestration อ่านแล้วกลายเป็น 6 component และ ordering ไม่ค่อยถูก: reconciliation/orchestration ไม่ควรอยู่ใต้ provider adapter แบบ linear stack ง่าย ๆ แต่ควรเป็น workflow layer ที่ consume provider inquiry/webhook และเขียน ledger.
- พูดว่า PaymentProvider contract ครอบคลุม PromptPay ได้ แต่ยังไม่พิสูจน์ว่า contract เดิมรองรับ async pending/expired/inquiry/refund capability ครบหรือไม่.
- แม้เสนอ scheduled job grace->expired แต่ยังไม่ชัดว่า state authority อยู่ที่ Subscription Core, Billing Orchestrator หรือ product DB/RLS layer.
- ยังไม่กล่าว explicit เรื่อง re-fetch provider transaction และ amount/currency match เท่า C.
- ยังไม่ชัดเรื่อง Stripe Billing vs custom recurring orchestration: ถ้าใช้ Stripe card เป็นหลัก จะ delegate invoice/dunning ให้ Stripe Billing แค่ไหน และ sync กลับ Subscription Core อย่างไร.

### Candidate C

- Technical safety ดีมาก แต่มี tendency จะเพิ่ม `Dunning/Retry + Reconciliation Engine` เข้า Subscription Core โดยตรง ซึ่งอาจทำให้ core กลายเป็น policy-heavy ถ้า WSTERA มีหลาย product/package policy ต่างกัน.
- บอกว่าต้องมี key TTL + business-logic period check แต่ยังไม่ชัดว่า event ledger ต้องเป็น durable unique claim แบบ atomic transaction ก่อน side effect.
- ยังไม่ลงรายละเอียดว่า Billing Orchestrator ควรเป็น owner ของ invoice generation, provider selection, renewal run, notification และ entitlement sync หรือไม่.
- ไม่กล่าว Cloudflare Workers/Supabase operational shape ชัดเท่า D.
- ยังไม่ชัดว่า PromptPay adapter ควร expose `inquiry/getPayment`, `expiresAt`, `providerCapabilities`, และ normalized event schema อย่างไร.

### Candidate D

- แม้ดีที่สุด แต่ยังมีจุดที่ต้องขยาย: ถ้าเลือก Stripe Billing เป็น recurring rail หลัก ต้องนิยาม mapping ระหว่าง Stripe invoice/subscription events กับ SubscriptionCore state machine ให้ละเอียดกว่าเดิม.
- Daily reconciler อาจไม่พอสำหรับบาง payment SLA; ควรระบุ configurable cadence และ event-driven + scheduled hybrid.
- อ้าง Smart Retries "8 retries ใน 2 สัปดาห์" อาจเป็น Stripe-policy/config-specific มากกว่าค่าตายตัว ควรระวังไม่ lock architecture กับตัวเลขนี้.
- ยังไม่ได้ลงรายละเอียด multi-product isolation: tenant/product IDs, price/plan mapping, ledger partitioning, RLS/service-role boundary และ credential scoping.
- ยังไม่ตอบ migration path จาก ModuleHub module เดิมเข้า WSTERA แบบ package/adapter/config contract.

## 4. Fatal Flaw

ไม่มี candidate ไหน fatal ถึงขั้นใช้ไม่ได้ทั้งหมด แต่ **Candidate A มี flaw ที่รุนแรงที่สุด** เพราะละเลย reconciliation/inquiry layer สำหรับ PromptPay async payment. สำหรับระบบรับเงินจริง ข้อนี้อาจทำให้เกิดเคส "provider รับเงินแล้ว แต่ระบบไม่ mark paid / entitlement ไม่เปิด" หรือกลับกัน "pending/expired ผิดสถานะ" ได้ ถ้า webhook หาย, duplicate, delayed หรือ delivery fail.

Candidate B/C/D ไม่มี fatal flaw ระดับ architecture แต่ยังต้อง validate implementation contract จริง โดยเฉพาะ atomic processed-event claim, transaction boundary, provider verification และ scheduled reconciliation.

## 5. Points None of the Candidates Answered

- **Exact ModuleHub contract fit:** ไม่มีใครอ้าง interface จริงของ ModuleHub payment/subscription ว่ามี method/status/event schema อะไรอยู่แล้ว ต้องเปลี่ยน breaking หรือ extend แบบ backward-compatible อย่างไร.
- **WSTERA multi-product model:** ยังไม่มีคำตอบเรื่อง product isolation, tenant isolation, plan/price mapping, product-specific policy, shared ledger schema และการป้องกัน cross-product access.
- **Supabase schema/RLS/security:** ทุก candidate พูด Supabase/ledger กว้าง ๆ แต่ยังไม่ตอบ table design, unique constraints, RLS boundary, service-role functions, audit log, no-delete policy และ migration/replay strategy.
- **Stripe Billing vs custom subscription authority:** ยังไม่ล็อกว่า Stripe เป็น source of truth สำหรับ card subscriptions แค่ไหน หรือ SubscriptionCore เป็น source of truth แล้ว sync event จาก Stripe อย่างไร. จุดนี้กระทบ cancellation, proration, invoice failure, grace, entitlement และ recovery.
- **PromptPay provider choice:** ทุกคนบอก licensed gateway แต่ยังไม่เลือก baseline provider และ fallback strategy เช่น Stripe PromptPay vs Omise/Opn รวมถึง settlement, fee, refund, inquiry API, webhook reliability และ production onboarding constraints.
- **Notification workflow:** ยังไม่ตอบว่าจะส่ง QR/expiry/failure/grace/paid receipt ผ่านช่องทางไหน เช่น email, LINE OA, in-app notification และ idempotency ของ notification job.
- **Failure and recovery operations:** ยังขาด runbook สำหรับ webhook outage, provider outage, duplicated charge, under/over-payment, currency mismatch, partial refund, manual reconciliation และ support tooling.
- **Testing/acceptance gates:** ไม่มีใครกำหนด concrete gates เช่น unit tests, integration tests with provider mocks, webhook replay A->B->A, concurrent duplicates, clean DB migration replay, RLS negative tests, E2E checkout, reconciliation drill และ audit evidence.
- **Secrets/config management:** ยังไม่ตอบ per-product provider credentials, environment separation, key rotation, webhook secret rotation และ least-privilege runtime config.
- **Commercial/legal/accounting:** ยังไม่ตอบ invoice/receipt/tax invoice, VAT, refund records, settlement reconciliation, Thai business onboarding และ accounting export.

## 6. Confidence

**84/100**

มั่นใจใน ranking ระดับสูง เพราะ D/C/B/A ต่างกันชัดในประเด็น core reliability: recurring rail choice, reconciliation, webhook/idempotency และ policy placement. ความไม่มั่นใจที่เหลือมาจาก bundle ไม่มี source code/interface จริงของ ModuleHub จึงยังตัดสินไม่ได้ว่า candidate ไหน fit กับ implementation ปัจจุบันมากที่สุดในระดับ method/schema contract.
