# Architecture Synthesis - Council Payment Core for WSTERA.com

## 1. Problem understood

WSTERA.com ต้องการ payment core กลางที่ใช้ซ้ำได้หลาย product โดยแต่ละ product เปลี่ยนราคา รายละเอียด และ policy ได้ผ่าน product ID + config ต่อ product ไม่ใช่ hard-code ราย product

Core นี้ต้องรองรับ 2 payment rails ที่ต้องมาคู่กันเสมอ:

- PromptPay สำหรับลูกค้าไทยที่ถนัด QR / manual payment / async confirmation
- Card auto-charge รายเดือนสำหรับ subscription billing ที่ต้องแม่นยำสูง ห้ามพลาด

บริบทที่ยืนยันจาก brief คือมี ModuleHub `payment` Completed 0.1.0 พร้อม `stripe-adapter.ts` และ ModuleHub `subscription` Completed 0.1.0 พร้อม state machine แล้ว Stack คือ Cloudflare Workers + Supabase, TypeScript strict, และไม่มี `node:*`

โจทย์ architecture จึงไม่ใช่สร้าง payment ใหม่ทั้งก้อน แต่ต้องวาง payment/subscription core กลางที่ plug-and-play, ใช้ของเดิมเป็นฐาน, เพิ่ม PromptPay, card recurring, reconciliation, entitlement lifecycle, และ product policy ให้ไม่ปนกัน

## 2. Verified facts

- User decision เลือก gateway เป็น Stripe แล้ว
- User decision ยอมรับ PromptPay และกำหนด policy เบื้องต้น: แจ้งเมลก่อนหมด 2-5 วัน, ไม่จ่ายหลังหมด 3 วันให้ตัดกลับฟรีเทียร์ถ้ามี, ถ้าไม่มีฟรีเทียร์ให้แจ้ง 5 วันขึ้นไปและแจ้งหลังหมดอีกครั้งก่อนตัด โดยเก็บประวัติ
- User decision กำหนด refund เป็น ticket แล้วเจ้าหน้าที่โอนมือ
- User decision กำหนด multi-product model เป็น core กลางร่วมกัน แยก product ID + config ต่อ product
- Round 1 ทั้ง A/B/C/D ใช้แนวทางต่อยอด ModuleHub payment/subscription core เดิม ไม่เสนอ rewrite ทั้งระบบ
- Round 2 reviewer ทั้ง 3 คนเห็นพ้อง ranking: D > C > B > A และไม่มี fatal flaw
- Candidate D ได้อันดับสูงสุดเพราะเสนอ Thin Billing Orchestrator เหนือ PaymentCore + SubscriptionCore, PromptPay provider adapter, SubscriptionCore เป็น source of truth lifecycle/entitlements, Stripe Billing/card หรือ direct-debit เป็น recurring rail หลัก, daily reconciler, host-side idempotency, และ product policy
- Candidate C เด่นเรื่อง correctness ของ PromptPay ด้วย verify-on-webhook re-fetch + amount match + declared refund
- Candidate B เด่นเรื่อง reconciliation gap และ grace_period -> expired ที่ไม่ควรปล่อยให้หายไป
- Candidate A ถูกทิศทางเรื่อง provider-agnostic และ event-level ledger แต่ reviewer ระบุว่าอ่อนเรื่อง reconciliation/polling ซึ่งเป็น business-critical

## 3. Areas of agreement

- Payment Core และ Subscription Core เดิมควรเป็นฐานของ architecture
- ต้องเพิ่ม PromptPay adapter หรือ provider สำหรับ QR / inquiry / webhook / async confirmation
- Card recurring ต้องเป็น rail หลักสำหรับ subscription auto-charge เพราะ PromptPay เป็น customer-initiated และไม่ใช่ native recurring rail ตามข้อสรุปของ Candidate C/D และ review
- Webhook อย่างเดียวไม่พอ ต้องมี reconciliation หรือ polling/scheduled check เพราะ async payment/webhook พลาดแล้วเสี่ยงเงินหาย
- ต้องมี idempotency และ event/payment ledger เพื่อกัน duplicate webhook, duplicate payment confirmation, และ duplicate entitlement mutation
- Subscription lifecycle และ entitlements ต้องมี source of truth ที่ชัด ไม่ผูกกับ provider event ดิบแบบตรง ๆ
- Refund ไม่ควร assume ว่า provider ทุกเจ้ารองรับครบ เพราะ user decision กำหนด manual ticket flow แล้ว
- Multi-product ต้องแยก product ID + config ต่อ product และไม่ให้ policy หรือ ledger ของ product หนึ่งกระทบอีก product

## 4. Majority positions

- ใช้ architecture แบบ layered core เดิม แล้วเพิ่ม orchestration บาง ๆ ด้านบน ดีกว่าสร้าง framework billing หนา ๆ ใหม่
- PromptPay ต้องถูกจัดเป็น async/manual payment rail ที่มี QR expiry, inquiry/re-fetch, amount match, ledger, notification, grace, expiry, และ reconciliation
- Card recurring ควรอยู่บน Stripe Billing/card rail เป็นหลัก เพื่อให้ auto-charge รายเดือนแม่นและใช้ retry/dunning capability ได้
- Billing Orchestrator ควรรับผิดชอบ workflow ข้าม payment/subscription เช่น create invoice/order, request payment, process provider event, reconcile, apply product policy, และ update entitlement ผ่าน Subscription Core
- Dunning/retry ควรเป็น product policy ที่ configurable ต่อ product มากกว่าฝังตายตัวเป็น behavior เดียวทั้งระบบ
- Reconciler ควรมี scheduled cadence อย่างน้อย daily ตาม Candidate D แต่ cadence จริงยังต้องล็อกก่อน implementation gate

## 5. Minority / dissent positions

- Candidate B เสนอ layer model ที่ใหญ่กว่า โดยมี Business, Subscription Core, Payment Core, Provider Adapters, Reconciliation, Billing Orchestration แต่ reviewer เห็นว่าโครงสร้างสับสนและอาจหนาเกินจำเป็น
- Candidate C วาง Dunning/Retry + Reconciliation Engine ไว้ใน Subscription Core แต่ reviewer เห็นว่า correctness ดี แต่เสี่ยง scope creep เพราะ reconciliation เป็น cross-cutting billing concern
- Candidate A ให้ภาพ provider-agnostic สองชั้นและ event-level ledger แต่ไม่ได้เน้น reconciliation/polling พอ ซึ่ง reviewers มองว่าเป็นจุดอ่อนสำคัญ
- มีข้อเสนอจาก A ว่า PromptPay adapter อาจผ่าน licensed gateway หลายทาง เช่น Omise/Stripe/Welpay/GUPay แต่ user decision ระบุ Stripe เป็น gateway แล้ว และยังไม่มี evidence ใน bundle ว่า gateway อื่นควรถูกเลือก

## 6. Missing evidence / unresolved questions

- ยังไม่มีหลักฐานละเอียดว่า Stripe PromptPay capability ที่จะใช้จริงรองรับ flow ใดบ้าง เช่น QR expiry, inquiry, webhook event names, settlement timing, และ refund constraints
- PromptPay refund policy จริงยังไม่ยืนยัน แม้ user decision จะกำหนด manual ticket + staff transfer แล้ว
- ยังไม่ล็อก behavior สำหรับลูกค้า PromptPay-only ที่ไม่มีบัตร โดยเฉพาะ subscription renewal, grace, downgrade, cancellation, และ reactivation
- Reconciliation cadence จริงยังไม่ล็อก นอกจากข้อเสนอ daily ของ Candidate D และ polling/scheduled checks ของ B/C
- ยังไม่เลือกหรือยืนยัน gateway implementation detail สำหรับ PromptPay ใน Stripe จริง เช่น PaymentIntent, invoice, hosted payment, หรือ adapter contract เฉพาะ
- Multi-product isolation ยังไม่ละเอียดพอ: ต้องกำหนด schema boundary, product config ownership, product_id enforcement, RLS/service role usage, ledger partitioning, และ cross-product reporting
- Webhook signature/security ยังไม่ลงรายละเอียด เช่น signature verification, replay window, raw body handling บน Cloudflare Workers, idempotent event claim, retry/dead-letter, และ audit log
- Stripe to core event mapping ยังไม่ล็อก เช่น invoice/payment/subscription event ใดเป็น authority สำหรับ lifecycle transition แต่ละแบบ
- ยังไม่มี evidence จากการอ่าน source file จริงใน synthesis input ว่า ModuleHub payment/subscription contracts ปัจจุบัน expose method ใดบ้าง จึงต้องตรวจ source ก่อน implementation gate

## 7. Synthesizer recommendation

แนะนำให้ใช้ Candidate D เป็น architecture baseline โดยผสาน correctness guard จาก Candidate C และ lifecycle gap จาก Candidate B:

1. สร้าง Thin Billing Orchestrator เหนือ ModuleHub PaymentCore + SubscriptionCore
2. ให้ SubscriptionCore เป็น source of truth สำหรับ subscription lifecycle และ entitlement state
3. ให้ Stripe card/Billing เป็น primary recurring rail สำหรับ auto-charge รายเดือน
4. เพิ่ม `PromptPayPaymentProvider` ใน PaymentCore สำหรับ QR creation, inquiry/re-fetch, webhook normalization, amount match, expiry handling, and declared manual refund flow
5. เพิ่ม payment ledger + provider event ledger + host-side idempotent event claim ที่ผูกกับ product_id, customer_id, subscription_id, billing_period, provider, provider_event_id/payment_id
6. เพิ่ม scheduled reconciler ใน Billing Orchestrator ไม่ใช่ฝังหนาใน SubscriptionCore โดยเริ่มจาก daily reconciliation และเปิดให้ปรับ cadence ต่อ product/policy ได้
7. ทำ product billing config ต่อ product: price, currency, rails enabled, free-tier fallback, grace days, email notification windows, retry/dunning policy, entitlement mapping
8. ก่อน implementation gate ให้ทำ source contract audit ของ ModuleHub `payment` และ `subscription` จริง แล้วออก adapter/orchestrator interface ที่ไม่ละเมิด TS strict และ Cloudflare Workers constraints

## 8. Why this recommendation

คำแนะนำนี้ grounded กับ ranking ที่ reviewer ทั้ง 3 เห็นตรงกันว่า D ดีสุดและไม่มี fatal flaw เพราะ D ครอบคลุม source-of-truth boundary, thin orchestration, recurring rail ที่ถูกต้อง, reconciler, host-side idempotency, และ product policy

แต่ D ยังมีช่องว่างที่ reviewer ระบุไว้ จึงต้องดึง Candidate C มาเสริมเรื่อง re-fetch + amount match สำหรับ PromptPay correctness และดึง Candidate B มาเสริมเรื่อง reconciliation gap กับ grace_period -> expired transition

แนวทางนี้ลดความเสี่ยงหลักของระบบรับเงิน:

- ไม่ให้ webhook เป็น single point of failure
- ไม่เอา PromptPay ไปทำเหมือน auto-recurring ทั้งที่เป็น customer-initiated
- ไม่ให้ provider event ดิบ mutate entitlement โดยไม่มี normalized state machine
- ไม่ผูก policy ราย product เข้ากับ core กลางแบบแก้ยาก
- ไม่สร้าง billing framework ใหญ่เกินจำเป็นก่อนเห็น contract จริงของ ModuleHub

## 9. Rejected alternatives + why

- Reject Candidate A เป็น baseline: แม้ provider-agnostic และ ledger ถูกทิศ แต่ reviewer ระบุว่าพลาด reconciliation/polling ซึ่งเป็น risk ระดับ business-critical สำหรับ async payment
- Reject Candidate B เป็น baseline: มี insight สำคัญเรื่อง reconciliation และ grace transition แต่ proposed layering สับสนและหนาเกินไปสำหรับ core กลางที่ต้อง plug-and-play
- Reject Candidate C เป็น baseline แบบตรงตัว: correctness ดีมาก โดยเฉพาะ PromptPay re-fetch + amount match แต่การวาง dunning/reconciliation ใน Subscription Core อาจทำให้ Subscription Core รับ cross-cutting billing concern มากเกิน
- Reject direct provider-to-subscription mutation: ไม่มี candidate/review สนับสนุนให้ provider event ดิบเป็น authority โดยตรง และเสี่ยง duplicate, replay, wrong mapping, และ cross-product contamination
- Reject PromptPay as primary auto-recurring rail: Candidate C/D และ review ชี้ตรงกันว่า PromptPay ไม่ใช่ native recurring rail จึงไม่เหมาะเป็น rail หลักสำหรับ subscription billing ที่ต้อง auto-charge แม่นยำ

## 10. Gate status (Decision/Architecture/Implementation/Production)

- Decision: PASS with constraints. User decisions เรื่อง Stripe, PromptPay policy, manual refund, และ multi-product config ชัดพอสำหรับ architecture baseline
- Architecture: CONDITIONAL PASS. ใช้ D baseline + C/B safeguards ได้ แต่ต้องปิด unresolved items ใน section 6 ก่อน implementation design จะถือว่า locked
- Implementation: NOT READY. ยังต้อง audit ModuleHub source contracts, Stripe PromptPay flow, schema boundaries, webhook security, event mapping, และ acceptance criteria
- Production: NOT READY. ยังไม่มี implementation, migration, test evidence, live provider behavior, reconciliation evidence, หรือ failure-mode evidence

## 11. Blockers before next gate

- ตรวจ source จริงของ ModuleHub `payment` และ `subscription` ตาม evidence manifest แล้วสรุป current contracts, extension points, และ constraints
- ยืนยัน Stripe PromptPay integration path จริง พร้อม event mapping, QR expiry, inquiry/re-fetch method, amount matching, settlement status, และ failure states
- นิยาม canonical billing domain model: product_id, customer_id, subscription_id, invoice/order, payment attempt, billing period, entitlement state, provider event, ledger status
- ออก idempotency design แบบ atomic event claim + business period guard + audit trail
- ออก webhook security design สำหรับ Cloudflare Workers รวม signature verification, raw body, replay handling, retry/dead-letter, และ logging
- ล็อก PromptPay-only lifecycle: renewal reminder, grace, downgrade/free-tier fallback, cancellation, reactivation, and historical retention
- ล็อก reconciliation cadence และ ownership: daily default, per-product override, retry/backoff, alerting, and manual review queue
- ล็อก multi-product isolation: config ownership, schema/RLS/service-role boundary, product_id enforcement, and reporting model
- นิยาม acceptance criteria สำหรับ Architecture -> Implementation gate รวม unit, integration, webhook replay, duplicate events, missed webhook + reconciler recovery, PromptPay under/over amount, expired QR, card retry/dunning, and cross-product isolation

## 12. Confidence 0-100

82

เหตุผล: confidence สูงกว่า candidate C/B/A เพราะ Round 2 reviewers ทั้งสามเห็นตรงกันว่า D เป็น baseline ที่ดีที่สุดและไม่มี fatal flaw แต่ยังไม่ควรเกิน 90 เพราะ bundle เองระบุ unresolved questions หลายข้อที่เป็น implementation-critical โดยเฉพาะ Stripe PromptPay details, webhook security, source contract audit, multi-product isolation, และ PromptPay-only behavior
