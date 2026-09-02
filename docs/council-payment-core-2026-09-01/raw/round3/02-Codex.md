# Council R3 — ลำดับการสร้าง + ปลายทาง (Codex / agent-codex)

## A. ลำดับการสร้าง (Build Sequence)

คำแนะนำของกู: อย่าเริ่มจาก PromptPay UI หรือ dashboard ก่อน ให้เริ่มจาก "money correctness spine" ก่อน เพราะ architecture ตัดสินแล้วว่า core เดิมเป็นฐาน และความเสี่ยงจริงคือ double-process, webhook miss, lifecycle drift, product config ปนกัน ไม่ใช่การสร้าง payment form

### Phase 0: Evidence Freeze + Stripe TH Capability Gate

ทำก่อนทุกอย่าง เพราะถ้า Stripe account ไม่ใช่บัญชีไทย หรือเปิด PromptPay ไม่ได้จริง ลำดับงานถัดไปต้องเปลี่ยนทันที

Milestones:
- ตรวจ Stripe account country เป็น TH จาก dashboard/API/เอกสารบัญชีจริง
- ยืนยัน payment method `promptpay` ใช้กับ THB ได้ใน mode ที่จะเริ่มทดสอบ
- ตรวจ Stripe API version ที่ payment adapter ใช้อยู่ เพราะ `BRIEF.md` ระบุเองว่าต้องเช็คก่อนพูดว่า production-ready
- ทำ compatibility note ว่า card recurring ใช้ Stripe Billing/Subscription rail, PromptPay ใช้ one-time QR และไม่ auto-renew

Definition of Done:
- มีหลักฐาน account country = TH หรือมี blocker ชัดว่าไม่ใช่ TH
- สร้าง test PaymentIntent/Checkout แบบ PromptPay ใน sandbox ได้ หรือบันทึก blocker จาก Stripe โดยตรง
- ระบุ API version และ webhook event set ที่จะ support
- ยังไม่แก้ core business logic ถ้า gate นี้ไม่ผ่าน

### Phase 1: Contract Audit + Boundary Lock

มาก่อน implementation เพราะ core เดิมมี Payment Core, Subscription Core, webhook-receiver, audit-log แล้ว งาน R3 ต้อง reuse ไม่ rebuild และไม่ merge core เข้าด้วยกัน

Milestones:
- Audit `PaymentProvider` contract ที่ stripe-adapter ใช้อยู่ แล้วนิยามว่า promptpay-adapter ต้อง return field อะไรบ้าง เช่น providerPaymentId, status, paymentUrl/qr payload, expiresAt, amount, currency, referenceId
- Audit billing event contract ของ Subscription Core: `subscription.started`, `subscription.renewed`, `subscription.payment_failed`, `subscription.cancelled`, `subscription.expired`
- Lock status mapping จาก provider event เป็น normalized 7 payment statuses
- Lock error mapping เข้า 16 error codes เดิม ไม่สร้าง error taxonomy ใหม่
- ระบุ product/tenant/account identifiers ที่ต้องติดไปทุก payment, subscription, ledger, audit log

Definition of Done:
- มี contract spec สั้น ๆ ที่ adapter/orchestrator/subscription ใช้ร่วมกัน
- ไม่มีการเพิ่ม core ใหม่ซ้ำกับ Payment Core หรือ Subscription Core
- ทุก event ต้องมี `productId`, `tenantId/accountId`, `provider`, `providerEventId`, `idempotencyKey`, `amount`, `currency`
- ทีมเห็นตรงกันว่า core storage-agnostic ยังอยู่เหมือนเดิม host layer เป็นผู้ผูก storage/config

### Phase 2: Idempotency Ledger + Billing Event Persistence

นี่ต้องมาก่อน webhook, reconciliation และ dunning เพราะ `saveForBillingEvent` คือหัวใจ ถ้าตรงนี้ไม่ atomic งานหลังทั้งหมดจะขยาย bug ให้หนักขึ้น

Milestones:
- สร้าง/ยืนยัน ledger table หรือ repository สำหรับ billing events แบบ unique claim
- Unique key ต้องกันทั้ง provider replay และ business duplicate เช่น `(provider, providerEventId)` และ business key ตาม event type เช่น subscription renewal period
- `saveForBillingEvent` ต้องเป็น atomic insert/claim ไม่ใช่เช็คแล้วค่อย insert
- บันทึก processing state: received, processing, processed, failed, dead_letter
- เชื่อม audit-log ให้ตามรอย event lifecycle ได้

Definition of Done:
- Replay event เดิมไม่ทำให้ entitlement/payment/subscription ถูก process ซ้ำ
- Concurrent duplicate event มีผู้ชนะหนึ่งตัวเท่านั้น
- มี test เคส non-consecutive replay เช่น A -> B -> A
- มี recovery path สำหรับ failed event โดยไม่เสีย idempotency

### Phase 3: PromptPay Adapter แบบ One-Time Rail

ทำหลัง contract/ledger เพราะ PromptPay เป็น adapter ใหม่ ไม่ใช่ core ใหม่ และต้องเสียบกับ PaymentProvider contract เดิม

Milestones:
- สร้าง `promptpay-adapter` ที่ implement contract เดียวกับ stripe-adapter
- ใช้ Stripe PromptPay เป็น one-time payment rail สำหรับ THB
- รองรับ create/get/refund ตามเท่าที่ Stripe rail ทำได้ แต่ policy refund ของ WSTERA ยังเป็น manual-ticket-first
- Return QR/payment URL, expiry, providerPaymentId และ normalized status
- Webhook parser ต้อง normalize event แล้วส่งต่อผ่าน ledger ก่อนแตะ subscription

Definition of Done:
- Unit test ผ่านด้วย mock provider และ Stripe-shaped fixture
- สร้าง pending PromptPay payment ได้
- Paid/failed/expired/cancelled ถูก map เป็น normalized payment status
- ไม่มี auto-renew path สำหรับ PromptPay
- ไม่มี hard-code Stripe secret หรือ product-specific config ใน adapter

### Phase 4: Reconciliation Layer

ต้องมาก่อนเปิดใช้งานจริง เพราะ council เห็นตรงกันว่า webhook อย่างเดียวไม่พอ และ PromptPay เป็น async rail ที่พลาดแล้วเงินหายง่าย

Milestones:
- Scheduled job poll pending payments ตาม cadence ที่กำหนด เช่น ทุก 5-15 นาทีสำหรับ pending ใหม่ และ daily sweep สำหรับค้างนาน
- Re-fetch payment จาก Stripe ก่อนเชื่อข้อมูลสำคัญ ไม่เชื่อ webhook body อย่างเดียว
- Match amount, currency, providerPaymentId, tenant/product reference ก่อน mark paid
- สร้าง repair action สำหรับ pending เกิน expiry, webhook missing, amount mismatch, unknown provider status
- สร้าง dead-letter และ alert สำหรับ manual investigation

Definition of Done:
- ถ้า webhook หาย แต่ Stripe payment สำเร็จ ระบบ reconcile แล้วเปิด entitlement ได้
- ถ้า amount/currency/reference ไม่ตรง ระบบไม่เปิด entitlement และส่ง manual review
- มี test สำหรับ webhook-before-create-state, duplicate webhook, missed webhook, stale pending
- มี operational report ว่า pending/failed/dead_letter เหลือเท่าไรต่อ product

### Phase 5: Billing Orchestrator Host Layer

ทำหลัง rail correctness เพราะ Orchestrator มีหน้าที่บาง ๆ: normalize billing intent/event, อ่าน product config, ส่งเข้า core ไม่ใช่ถือ business truth เอง

Milestones:
- สร้าง host layer ที่รับ product billing request จาก WSTERA Control Plane
- โหลด per-product config: plans, price, trial/free tier, grace days, supported rails, notification windows, downgrade behavior
- Map checkout/payment completion เป็น subscription billing event
- บังคับทุก request มี product/tenant scope
- แยก policy ต่อ product โดย config ไม่ hard-code ใน core

Definition of Done:
- Product A และ Product B ใช้ core เดียวกันแต่ราคา/grace/free-tier ต่างกันได้
- ไม่มี cross-product subscription/payment leakage
- Contract test ยืนยันว่า missing productId/tenantId ถูก reject
- Orchestrator บางพอ: ไม่มี payment state machine ใหม่ซ้อน core

### Phase 6: Card Recurring + Stripe Dunning Integration

ทำหลัง Orchestrator เพราะ recurring ต้องผูก plan/product/subscription lifecycle และ entitlement ให้ครบ

Milestones:
- ใช้ Stripe เป็น primary recurring rail สำหรับบัตร
- รับ Stripe subscription/payment events แล้ว normalize เข้า Subscription Core
- ใช้ Stripe Smart Retries เป็น dunning หลัก ไม่เขียน retry engine ซ้ำกับ Stripe
- ทำ decline classification เฉพาะส่วนที่ต้องแปลงเป็น policy/action ของ WSTERA เช่น notify, grace, downgrade, manual review
- Sync `past_due`, `grace_period`, `cancel_at_period_end`, `cancelled`, `expired` ให้ตรง entitlement

Definition of Done:
- Card renewal success ต่ออายุ entitlement อัตโนมัติ
- Failed payment เข้าสถานะ past_due/grace ตาม config
- Stripe retry event ไม่ทำให้ต่ออายุซ้ำ
- หลัง retry window หมด สถานะและ entitlement ถูกลดสิทธิ์ตาม policy

### Phase 7: PromptPay-Only Lifecycle + Expiry/Downgrade Jobs

ทำหลัง recurring เพราะ PromptPay-only เป็น exception path ที่ user ตัดสินใจยอมรับ แต่ไม่ควรลากให้ core design บิดตั้งแต่ต้น

Milestones:
- Notification ก่อนหมดอายุ 2-5 วันสำหรับ PromptPay-only
- หลังหมด 3 วัน ถ้ามี free tier ให้ downgrade เป็น free tier
- ถ้าไม่มี free tier ให้แจ้งก่อนหมด 5 วัน แจ้งหลังหมดอีกครั้ง แล้ว expire/cut access
- เก็บ subscription history เพื่อกลับมาสมัครใหม่ได้
- สร้าง scheduled job สำหรับ grace -> expired เพราะ webhook ไม่ได้ช่วย transition นี้

Definition of Done:
- PromptPay-only customer ต่ออายุด้วย QR ได้แบบ manual renewal flow
- ไม่จ่ายตามกำหนดแล้ว entitlement เปลี่ยนตาม product config
- ลูกค้ากลับมาจ่ายใหม่แล้ว resume/renew ได้โดยไม่สร้าง account ซ้ำ
- มี test ครบสำหรับ free-tier และ no-free-tier product

### Phase 8: First Internal Product Pilot

ทำ pilot กับ product เดียวก่อน เพราะ WSTERA มีหลายโปรดักต์ ถ้าเปิดพร้อมกันจะ debug ยากและเสี่ยงเงิน/สิทธิ์ลูกค้าปนกัน

Milestones:
- เลือก product ที่ transaction ต่ำแต่ use case ครบ เช่น มี paid plan, entitlement, downgrade
- เปิด sandbox/staging E2E ก่อน production
- ทดสอบ card recurring, PromptPay one-time, refund-ticket note, reconciliation, expired job
- สร้าง runbook incident: webhook down, Stripe outage, mismatch, duplicate event, wrong entitlement

Definition of Done:
- E2E ผ่านอย่างน้อย: card subscribe -> renew -> fail -> recover, PromptPay pay -> reconcile paid, PromptPay expire -> downgrade
- Dashboard/ops report เห็นสถานะ payment/subscription/event ได้
- ไม่มี manual DB fix ใน happy path
- ทีม support รู้ขั้นตอน refund/manual transfer แล้ว

### Phase 9: Multi-Product Rollout

ทำเมื่อ pilot พิสูจน์ว่า product scoping และ operational loop ใช้ได้จริง

Milestones:
- เพิ่ม product ทีละตัวด้วย per-product config
- ทำ config validation ก่อน deploy เช่น currency, plan mapping, grace, free-tier behavior
- ทำ migration/checklist ต่อ product
- ทำ alert แยก product เพื่อรู้ว่า product ไหนมี billing failure

Definition of Done:
- อย่างน้อย 2-3 products ใช้ core เดียวกันจริงโดยไม่ fork
- Billing config เพิ่ม product ใหม่ได้โดยไม่แก้ Payment Core/Subscription Core
- มี regression suite ครอบ product scoping
- มี monthly reconciliation report ต่อ product

## B. ปลายทาง (Endgame)

กูแนะนำทิศทางเดียว: build self-use first แล้ว productize เป็น Billing-as-a-Service ทีหลัง ไม่ใช่ self-use only และไม่ใช่ขายทันทีตั้งแต่วันแรก

เหตุผล:
- WSTERA มี multi-product SaaS portfolio อยู่แล้ว นี่คือสนามจริงที่ดีที่สุดสำหรับพิสูจน์ billing core เพราะมี productId/tenantId/config ต่างกันจริง
- `stripe-billing` มีฐาน product idea อยู่แล้ว และ modules หนาแน่นพอจะต่อยอด แต่สถานะยังเป็น Experimental/Pilot Ready ไม่ใช่ production SaaS ที่ขายให้คนนอกได้ทันที
- Billing เป็นระบบเงิน ถ้าขายก่อนกินเอง จะต้องรับภาระ SLA, support, compliance, edge cases ของลูกค้าคนนอก ทั้งที่ internal loop ยังไม่พิสูจน์
- แต่ถ้าทำ self-use แบบปิดทิศ productization ทิ้งตั้งแต่ต้น จะเสียโอกาส เพราะ architecture ที่เลือกเหมาะกับ product อยู่แล้ว: shared core, adapter pattern, per-product config, storage-agnostic repos

Timing ที่แนะนำ:
- Phase 0-9: ทำเพื่อ WSTERA internal use ก่อน แต่รักษา public-product boundary ใน code เช่น stable API, tenant isolation, audit trail, config model
- หลังมี 2-3 WSTERA products ใช้งาน production จริง 1-2 billing cycles ค่อยเริ่ม Productization Phase
- อย่าทำ self-serve external customer, public dashboard, pricing page, SLA ก่อน internal reliability ผ่าน

สิ่งที่ต้องเพิ่ม/เปลี่ยนเมื่อ pivot เป็น product:
- Tenant onboarding: external tenant signup, KYB/KYC expectation, Stripe account connection หรือ hosted billing account model, environment separation test/live
- Billing API surface: stable REST/API keys/webhooks, idempotency contract, SDK/examples, versioning policy
- Dashboard: tenants, products, plans, subscriptions, payments, failed events, reconciliation queue, manual review, audit log
- Usage metering: usage event ingestion, quotas, overage, reset period, anti-duplicate usage events
- Dunning-as-a-feature: configurable retry policy, reminder templates, grace rules, downgrade actions, channel integrations
- Docs: integration guide, webhook guide, status mapping, failure handling, PromptPay limitations, refund process
- Self-serve checkout: hosted checkout links/pages, test mode, customer portal, plan switch/cancel flows
- Ops/SLA: uptime target, incident response, backups, replay tooling, admin impersonation controls, data export/delete
- Security/compliance: scoped API keys, tenant isolation tests, audit retention, least privilege secrets, webhook signature rotation
- Pricing: platform fee/month + transaction/event volume tier; อย่าเริ่มจาก revenue share อย่างเดียว เพราะ Stripe fee/chargeback/support จะทำ margin อ่านยาก

สรุป endgame: Productize แต่หลังจาก internal dogfood สำเร็จ ไม่ใช่ขายทันที และไม่ใช่ทำเป็น internal script เฉพาะ WSTERA จน productize ไม่ได้

## C. ความเสี่ยงหลัก (Key Risks)

1. Stripe TH/PromptPay capability ไม่ผ่านจริง
Mitigation: ทำ Phase 0 เป็น hard gate ถ้าไม่ผ่านให้หยุด PromptPay adapter แล้วตัดสินใจ rail ใหม่ ไม่เขียน abstraction หลอกตัวเอง

2. Idempotency ไม่ atomic แล้วเกิด double entitlement หรือ double renewal
Mitigation: ใช้ unique claim ใน persistence layer, test concurrent duplicates, replay test A -> B -> A, ห้ามใช้ memory variable หรือ check-then-insert

3. Webhook หายหรือมาช้าแล้วเงิน/สิทธิ์ไม่ sync
Mitigation: reconciliation เป็น Phase 4 ก่อน production, re-fetch จาก provider, amount/currency/reference match, daily sweep และ dead-letter queue

4. Product/tenant scoping รั่วใน multi-product portfolio
Mitigation: บังคับ productId/tenantId ในทุก event/payment/subscription/audit record, config validation, contract test ว่า missing/wrong scope ถูก reject

5. PromptPay-only lifecycle ทำให้ subscription semantics ปนกับ recurring
Mitigation: แยกให้ชัดว่า PromptPay คือ manual renewal/one-time rail, ไม่ auto-renew, ใช้ scheduled expiry/downgrade job เป็น policy layer

6. Stripe dunning กับ Subscription Core state drift
Mitigation: กำหนด mapping event -> lifecycle state ชัด, Stripe เป็น retry engine หลัก, Subscription Core เป็น entitlement truth, มี periodic consistency check

7. Refund policy manual อาจกลายเป็น ops bottleneck
Mitigation: เริ่มจาก ticket + manual transfer ตาม decision ปัจจุบัน แต่เก็บ provider refund capability/status ไว้ใน audit เพื่อ automate ทีหลังถ้าปริมาณสูง

8. Productization เร็วเกินไปจนทีมแบก support คนนอกก่อนระบบนิ่ง
Mitigation: productization gate ต้องมี internal production 2-3 products และอย่างน้อย 1-2 billing cycles พร้อม incident/runbook/reconciliation evidence

9. Business risk: ตลาด Billing-as-a-Service แข่งกับ Stripe เองและผู้เล่นใหญ่
Mitigation: positioning ต้องไม่ขายว่า "แทน Stripe" แต่ขายเป็น Thai-first billing ops layer สำหรับ indie SaaS/agency ที่ต้องการ Stripe card + PromptPay + entitlement + dunning workflow

10. Compliance/accounting/tax scope บาน
Mitigation: Phase แรกอย่า claim เป็น accounting/tax system; ระบุขอบเขตเป็น billing orchestration, payment sync, entitlement, audit export เท่านั้น

## D. Assumptions

- Stripe account ของ WSTERA สมัครไว้แล้ว แต่ยังต้องยืนยัน country = TH และ PromptPay enablement จากหลักฐานจริง
- Payment Core และ Subscription Core มีโค้ดจริงตาม `BRIEF.md` และ `MODULE.md` แต่ยังอยู่สถานะ Experimental/Pilot Ready
- `PaymentProvider` contract ของ stripe-adapter สามารถขยายเพื่อ PromptPay ได้โดยไม่ต้อง rewrite core
- WSTERA Control Plane มี concept ของ product/tenant/customer เพียงพอให้ Orchestrator ผูก config ต่อ product ได้
- Stripe card recurring จะเป็น recurring rail หลัก และ PromptPay จะไม่ถูกใช้เป็น auto-renew
- Refund สำหรับ PromptPay/card ในช่วงแรกใช้ manual-ticket-first ตาม user decision
- ทีมยอมรับการทำ vertical slice กับ product เดียวก่อน rollout หลาย product
- ระบบ production target น่าจะอยู่บน Cloudflare/Supabase/Edge-friendly stack จึงควรคง Web fetch และ storage-agnostic repos
- Productization เป็นเป้าหมายที่มีค่า แต่ยังไม่มี external customer commitment ที่บังคับให้ขายทันที
- ยังไม่มีหลักฐาน live E2E, clean DB replay, หรือ production billing cycle สำหรับ core ชุดนี้ใน evidence ที่อ่าน

## E. Confidence (0-100)

86
