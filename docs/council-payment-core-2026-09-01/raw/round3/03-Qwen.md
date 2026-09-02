# Council Answer — Round 3 (Qwen, independent)

ว่าด้วย: Build Order / End State / Risks ของ Candidate D — Thin Billing Orchestrator over Payment Core + Subscription Core (ModuleHub)

---

## สรุป

สร้างเป็น 6 เฟส + เฟสเตรียมฐาน โดยยึดหลัก **"พิสูจน์เส้นเงินก่อน → ปิดรูรั่ว (reconciliation) ก่อนเปิด rail async → โชว์ multi-product → เงินจริงค่อยเข้า"** ลำดับที่ไม่ต้องถกกันคือ reconciliation ต้องมาก่อน PromptPay adapter เสมอ เพราะ PromptPay เป็น rail ที่ webhook หลุดแล้ว "เงินเข้าแต่สิทธิ์ไม่เปิด" ได้ง่ายที่สุด

ปลายทางจริง: **ขายเป็น Billing-as-a-Service (stripe-billing product) แต่ WSTERA ใช้จริงก่อนเป็นด่านบังคับ** — internal-only ถือเป็นการเผา option value ทิ้ง เพราะ BRIEF ของ stripe-billing รออยู่แล้ว และใน saas-product-hub มีสินค้าที่เก็บเงินคนละแบบกว่า 10 ตัว (ตลาดอยู่ในบ้านตัวเอง) แต่ห้ามขายก่อน reconciliation ผ่านสนามจริงกับ WSTERA ได้ 1 รอบ billing เต็ม

---

## ลำดับการสร้าง (Build Order)

### Phase 0 — ตรวจฐาน + ปิดความเสี่ยงราคาถูก (Groundwork)
- **Scope:**
  1. ยืนยันว่า Stripe account ของคุณฟรีเป็น **TH (Thai) account** — เงื่อนไขบังคับก่อนเปิด PromptPay (evidence: official docs, current secrets มีแต่ `STRIPE_*_BOOKING2` sandbox)
  2. ตรวจ Stripe API version ที่ `payment/adapters/stripe-adapter.ts` และ subscription core อ้างอิงอยู่ vs ปัจจุบัน → **pin API version** ลง adapter + เพิ่ม contract test พื้นฐาน (สิ่งที่ BRIEF ของ stripe-billing เตือนเองไว้)
  3. รัน test suite เดิมของ payment + subscription ให้เขียวหมด
  4. ยืนยัน idempotency ledger (`saveForBillingEvent`) ใน subscription core กับ `payment/core/idempotency.ts` ทำงานครบใน test
- **Depends on:** ไม่มี
- **Rationale:** ของถูกที่สุดที่ปิดความเสี่ยงใหญ่สุด 3 ตัว (TH account, API drift, ฐานราก idempotency) — ถ้าเจอปัญหาตรงนี้ตอนนี้ แพงน้อยกว่าเจอตอน production หลายเท่า
- **Exit criterion:** checklist 4 ข้อผ่านครบ, API version pinned, test ทั้งหมดเขียว

### Phase 1 — Thin Billing Orchestrator + Happy path ด้วย Stripe card (1 product)
- **Scope:** สร้าง Billing Orchestrator แบบบาง (billing event → normalize → ยิงเข้า subscription core) รวมถึง mapping `PaymentEvent` → subscription billing events (`subscription.started` / `renewed` / `payment_failed` / `cancelled` / `expired`) ต่อสาย webhook-receiver + payment + subscription ให้เป็นเส้นเดียวจบ, product config ชุดแรก (ราคา / free tier / grace) ดึงจาก WSTERA Control Plane ผ่าน config-runtime/product-catalog ที่มีอยู่แล้ว
- **Depends on:** Phase 0
- **Rationale:** พิสูจน์เส้นเงินด้วย rail ที่มีอยู่แล้ว (stripe-adapter) ก่อน — ห้ามเปิดหลายตัวแปรพร้อมกัน ไม่งั้นพังแล้วหาต้นตอยาก
- **Exit criterion:** ใน test mode: สมัคร → จ่าย card → webhook → subscription `active` → `canUseFeature` คืนผลถูก และ **replay webhook ซ้ำ สถานะไม่เพี้ยน** (idempotency พิสูจน์ได้จริง ไม่ใช่แค่เชื่อ)

### Phase 2 — Reconciliation layer + scheduled lifecycle jobs  ⚠️ ก่อน PromptPay เสมอ
- **Scope:** scheduled job บน **scheduler module 0.3.0** (ออกแบบมาคู่กับ Cloudflare Workers Cron Triggers + job-retry อยู่แล้ว):
  - Poll `pending`/`processing`/`requires_action` payments → **re-fetch จาก provider (`getPayment`) + amount match — ไม่เชื่อ webhook body** (review win ของ C)
  - Transition `grace_period` → `expired` ด้วย schedule (review win ของ B)
  - Report รายวัน: payment ที่ provider บอก succeeded แต่ระบบไม่ match
  - ผูกกับ job-retry สำหรับ run ที่ล้ม
- **Depends on:** Phase 1 (ต้องมี pending payments เกิดขึ้นจริงก่อนจึงมีอะไรให้ reconcile)
- **Rationale:** consensus 4/4 ชี้ว่านี่คือชิ้นวิกฤตที่สุด ("webhook missed → money lost") ต้องมีก่อนเปิด rail async อย่าง PromptPay ไม่งั้น QR ที่ลูกค้า scan แล้ว webhook หลุด = เงินเข้าบัญชีแต่ entitlement ปิด — เก็บเงินแล้วทำลูกค้าโกรธ
- **Exit criterion:** จำลอง webhook drop → reconciler ดึงสถานะจริงมาอัพเดตให้ state ตรงกันทั้งสองทาง, cron fire ซ้ำ (double-fire) ไม่เกิด double-process (idempotency ledger เป็น backstop ไม่ใช่แค่หวังว่า cron ไม่ซ้ำ)

### Phase 3 — PromptPay adapter
- **Scope:** `promptpay-adapter.ts` ใน `payment/adapters/` implement `PaymentProvider` ตัวเดิม: `createPayment` (คืน QR/checkoutUrl — contract มี `checkoutUrl` รองรับอยู่แล้ว), `getPayment` (สำหรับ poll — หัวใจของ async rail), `refundPayment` (Stripe PromptPay รองรับ refund/partial = ไปทางเดียวกับ decision 3), THB เท่านั้น, **ไม่มี auto-renew** — อายุหมดจะแจ้งเตือนก่อนเสมอ (กฎของ Phase 4)
- **Depends on:** Phase 0 (TH account ยืนยันแล้ว) + Phase 2 (reconciler ครอบ async gap แล้ว)
- **Rationale:** PromptPay = adapter ใหม่ ไม่ใช่ core ใหม่ (consensus) งานนี้ isolated เล็กมาก แต่ต้องรอ Phase 2 เพราะเป็น rail ที่ลูกค้า "จ่ายแล้ว webhook หาย" หรือ "ไม่จ่าย" ได้สูงสุด
- **Exit criterion:** test mode: สร้าง QR → จ่าย → webhook มา = สำเร็จ, webhook ถูกบล็อก → reconciler เก็บได้, และทั้งสองทางไหลเข้า idempotency ledger ชุดเดียวไม่ double

### Phase 4 — Dunning/Retry policy + กฎ lifecycle ของคุณฟรี (host-side policy)
- **Scope:** ตาม decision 2 ของคุณฟรี เขียนเป็น **product policy ฝั่ง host ผ่าน orchestrator/config — ห้าม hard-code ใน core**:
  - แจ้ง email 2–5 วันก่อน expiry (notification module)
  - ไม่จ่าย 3 วันหลังหมด → revert free tier (ถ้ามี)
  - ไม่มี free tier → แจ้ง 5 วันก่อน + แจ้งอีกครั้งหลังหมด → cancel **แต่เก็บ subscription history ไว้ resubscribe**
  - Engine (decline classification, retry schedule) ใน subscription core เป็นกลไก — ค่า retry/grace มาจาก product config เสมอ
  - งาน card dunning ส่วนใหญ่ **ยกให้ Stripe Smart Retries อยู่แล้ว (8x / 2 สัปดาห์) — ห้าม reimplement** (consensus 6) engine ใน core มีไว้สำหรับ path ไม่มี card เช่น PromptPay และ product ที่ไม่ได้ใช้ Stripe Billing
- **Depends on:** Phase 2–3 (กลไกต้องนิ่งก่อนค่อยวางนโยบาย)
- **Rationale:** เป็น policy ปรับ cadence ได้ไม่ต้องแตะ core — ทำหลังกลไกนิ่งเพื่อไม่ดีบักสองชั้นพร้อมกัน
- **Exit criterion:** simulate ครบทุก branch (มี/ไม่มี free tier × จ่าย/ไม่จ่าย × ก่อน/หลังหมดอายุ) → สถานะจบถูกตามกฎทุกกรณี และ resubscribe จาก history เดิมได้

### Phase 5 — พิสูจน์ multi-product (product ที่ 2)
- **Scope:** ออนบอร์ด product ที่สอง (เช่น booking หรือ WSTERA-Link — มีอยู่จริงใน saas-product-hub) ด้วย config ต่างจาก product แรก (ราคา/plan/รอบ), ยืนยัน tenant/product scoping แยกจริงทั้งข้อมูล สิทธิ์ และ audit-log
- **Depends on:** Phase 1–4
- **Rationale:** decision 4 ของคุณฟรีคือ shared core แยกด้วย product/tenant ID — จะเรียก "unified collection core" ได้ต้องมีมากกว่า 1 product เท่านั้น และนี่คือ rehearsal ของการขายเป็น product ในขั้นถัดไป
- **Exit criterion:** 2 products × 2 tenants ใช้ core เดียว config ต่างกัน ข้อมูล/สิทธิ์ไม่ตกหล่นข้ามกัน

### Phase 6 — Production cutover (เงินจริง WSTERA)
- **Scope:** สลับ live key, เปิด PromptPay จริง, refund = claim ticket + โอนมือ (decision 3 — คุณฟรีทำเอง), alert เมื่อ reconcile fail, ทดสอบ PromptPay live ด้วยยอดเล็กจริงหนึ่งครั้ง
- **Depends on:** Phase 5
- **Rationale:** เงินจริงเข้าได้เมื่อกลไก + reconciler + audit + alert ผ่านครบใน sandbox แล้วเท่านั้น
- **Exit criterion:** รอบ billing จริง 1 เดือนแรก **ไม่มีเงินหายเงียบ** — ทุก payment ที่ provider บอก succeeded ต้อง match กับ entitlement ในรายงาน reconciliation รายวัน

### Phase 7 — Productization gate (เข้าสู่การขาย — ดูหัวข้อ End State)

---

## จุดสิ้นสุด/ปลายทาง (End State)

**ตัดสินใจเด็ดขาด: ปลายทางคือขายเป็น Billing-as-a-Service — internal WSTERA คือด่านบังคับ ไม่ใช่ปลายทางจริง**

เหตุผล:
1. BRIEF ของ `stripe-billing` วางไว้แล้วใน saas-product-hub — ตลาดคือ indie SaaS/agency ที่ไม่อยากเขียน billing เอง
2. ใน saas-product-hub มี product ที่เก็บเงินคนละแบบมากกว่า 10 ตัว (DocCraft, RentMatrix, booking, headless-commerce, LINE OA AI ฯลฯ) = first customers อยู่ในบ้านตัวเอง
3. สถาปัตยกรรม D ถูกเลือกบนหลัก multi-product shared core อยู่แล้ว — สร้างแล้วใช้แค่ตัวเดียวคือทิ้ง option value ไปฟรี

**เงื่อนไขบังคับก่อนขาย:** ผ่าน Phase 6 แล้วรัน production จริงกับ WSTERA อย่างน้อย 1–2 รอบ billing โดย reconciler พิสูจน์ตัวเองในสนามจริง — ห้ามขายของที่ยังไม่เคยกินของตัวเอง (eat your own dog food ก่อน)

**สิ่งที่ต้องเพิ่ม/เปลี่ยนเมื่อขาย (vs internal-only):**
1. **Tenant-scoped credentials** — ตอนนี้ host inject secret key เดียว; ขายได้ต้องมี Stripe API key ต่อ tenant + secret vault + isolation test
2. **Self-serve onboarding API** — tenant สมัครเอง ตั้ง plan/price เอง รับ webhook endpoint และ API key ของตัวเอง
3. **Tenant dashboard/reporting** — MRR, failed payments, dunning status, reconciliation report ต่อ tenant (ตอน internal ดูจาก audit-log พอไหว ขายแล้วไม่ไหว)
4. **Metering + ราคาของบริการเอง** — โมเดลราคาของ stripe-billing เอง (BRIEF ยัง TODO อยู่) + SLA + status page
5. **Packaging** — npm package ที่ publish ได้, semver จริงจัง, docs + SDK examples
6. **Compliance** — PCI scope (ใช้ Stripe Hosted Checkout/Elements = อยู่ SAQ-A ต้องรักษา scope นี้ไว้), PDPA (ข้อมูลลูกค้าไทย), retention policy ของ audit-log
7. **Stripe API version maintenance contract** — pin version + contract tests + นโยบายอัพเกรด (สิ่งที่ BRIEF เตือนเอง — ขาย BaaS แปลว่ารับผิดชอบ API bumps ของลูกค้าทุกราย)
8. **Refund ต้องมี SLA** — "คุณฟรีโอนมือ" ใช้ได้ตอน internal แต่ขายแล้ว claim ticket ต้องมี SLA และ audit ต่อ tenant ไม่งั้นเป็น bottleneck + ความเสี่ยงชื่อเสียงทันที

---

## ความเสี่ยงหลัก (Top Risks)

1. **เปิด PromptPay ก่อน reconciler เสร็จ** = เงินหายเงียบแบบที่ consensus เตือน → ทำเป็น **hard gate**: Phase 3 เริ่มได้เมื่อ Phase 2 ผ่าน exit criterion เท่านั้น
2. **Stripe account ไม่ใช่ TH** → PromptPay เปิดไม่ได้ทั้งแผน → เช็คใน Phase 0 (ถูกมาก) และเตรียม fallback ถ้าไม่ใช่ (สมัครบัญชี TH ใหม่ = กระทบ timeline ไม่กระทบสถาปัตยกรรม)
3. **Stripe API drift** ใน adapter เดิม (BRIEF เตือนเอง) → pin version + contract test ตั้งแต่ Phase 0 ก่อนสร้างอะไรทับ
4. **Scheduler double-fire / cron หลุดบน Cloudflare Workers** → อย่าฝากความถูกต้องไว้กับ cron เดียว: ownership lock ของ scheduler + idempotency ledger ต้องเป็น backstop สองชั้นเสมอ
5. **Scope creep ไปทาง productization ก่อนเวลาอันควร** (ทำ tenant dashboard/onboarding API ระหว่างยังไม่มีลูกค้า internal คนแรก) → ล็อก scope ด้วย exit criterion ของแต่ละ phase
6. **Dunning ซ้ำซ้อนกับ Stripe Smart Retries** → กติกาเดียว: schedule เป็น product config ฝั่ง host, core มีแต่กลไก, ไม่ reimplement ของ Stripe
7. **Bus factor = คนเดียว** — refund โอนมือ + support คนเดียว ใช้ได้ตอน internal; ตอนจะขายต้องมี SLA/tooling ก่อน ไม่งั้นเจองาน support ท่วมตั้งแต่ลูกค้ารายที่สอง
8. **Webhook-receiver config ผิด** (signature verification หลวม) = รับเงิน event ปลอม → ทดสอบ reject invalid signature เป็น exit criterion ของ Phase 1 ด้วย

---

## Assumptions

1. Stripe account ของคุณฟรีเป็น TH account หรือยืนยัน/สมัครได้ก่อนถึง Phase 3 (ยังไม่ยืนยัน — จึงเป็น checklist ของ Phase 0)
2. Deploy target คือ Cloudflare Workers + Cron Triggers (scheduler 0.3.0 ออกแบบมาเพื่อสิ่งนี้โดยตรง)
3. WSTERA Control Plane มีอยู่จริงตาม R2 verdict และ per-product config (price/free tier/grace) ใส่ผ่าน config-runtime/product-catalog ได้
4. notification module ส่ง email ได้จริง (มี module อยู่ใน modules-hub)
5. `saveForBillingEvent` idempotency ledger ใน subscription core พร้อมใช้ตาม R2 verdict (ตรวจซ้ำใน Phase 0 ก่อนพึ่งพา)
6. คุณฟรียอมรับค่าธรรมเนียม Stripe ต่อรายการทั้ง card และ PromptPay และเป็นคนโอน refund เองช่วง internal
7. WSTERA product ชุดแรกมี free tier อย่างน้อยบาง product (มิฉะนั้นเดิน branch "ไม่มี free tier" ของ decision 2 เป็นหลัก)

---

## Confidence

**82 / 100**

สถาปัตยกรรมนิ่งแล้ว (consensus 4/4), ทุก module ที่อ้างมีอยู่บนดิสก์จริงและ contract ของ `PaymentProvider` รองรับ PromptPay ได้โดยไม่ต้องแก้ core — ตัวเลขที่เหลือหักไปที่ operational unknowns: TH account ยังไม่ยืนยัน, พฤติกรรม PromptPay จริงกับ reconciler ต้องพิสูจน์ในสนาม, และ capacity คนเดียวของคุณฟรีคือตัวแปรที่ควบคุมไม่ได้ทั้งหมด