# Domain-readiness blockers — staged execution, checkpoint-gated

**สถานะรวม (อัปเดต 2026-08-19 เย็น):** Stage 1-3 เสร็จและ commit แล้ว (local เท่านั้น ยังไม่ push) —
`booking@ed06fa2`+`2472e12`, `headless-commerce@79c1d7c`, `multi-tenant-ai@92139cf` ปิดบล็อกเกอร์ซื้อโดเมนครบ
4/4 ข้อใน `docs/platform/ROADMAP.md` §0 gate 3 แล้ว ดูรายละเอียดในหัวข้อ "สถานะล่าสุด" ของแต่ละ stage ด้านล่าง
Stage 4 (booking Phase 0) ยังไม่เริ่ม — คนละ gate ไม่บล็อกการซื้อโดเมน

**ต่างจาก `BRIEF-*-for-hermes.md` ตัวก่อนหน้านี้ทั้งหมด:** อันนี้คือ **execution brief** ให้แก้โค้ดจริง ไม่ใช่แค่สำรวจ
แต่แบ่งเป็น 4 stage อิสระต่อกัน แต่ละ stage **ห้ามเริ่มลงมือ (แก้ไฟล์/รันคำสั่งที่เปลี่ยนแปลงอะไร) จนกว่าเจ้าของจะ
คอนเฟิร์มเป็นลายลักษณ์อักษรใน thread ก่อน** — ตาม `products/booking/CLAUDE.md` STRICT RULE #0 (ห้ามคิดทายเอาเอง
ต้องรอคำสั่งอนุมัติชัดเจนก่อนแตะไฟล์ทุกครั้ง) กฎนี้ใช้กับทุก stage ในไฟล์นี้ ไม่ใช่แค่ `products/booking/`

## กฎเหล็กที่ใช้ทุก stage

1. **หยุดรอ confirm ก่อนเริ่ม stage และก่อน commit ทุกครั้ง** — ส่งแผนสั้นๆ ว่าจะแก้ตรงไหนยังไงก่อน แล้วรอคำตอบ
   ก่อนแก้ไฟล์จริง เสร็จ stage แล้วก็หยุดรออีกรอบก่อนไป stage ถัดไป (ไม่ใช่ไล่ทำรวดเดียวจบ 4 stage)
2. **ห้าม `git push`, `supabase db push`, `supabase migration repair`, deploy ใดๆ, หรือแตะอะไรใต้
   `D:\AI-Workspace\.secrets\`** โดยไม่มีการขออนุมัติแยกต่างหากอีกครั้ง แม้ stage นั้นจะถูก confirm ให้แก้แล้วก็ตาม —
   confirm ให้แก้โค้ด ≠ confirm ให้ push/deploy
3. **แก้เท่าที่โจทย์ระบุเท่านั้น** ห้าม refactor พ่วง ห้ามเพิ่ม dependency ใหม่นอกจากจำเป็นจริงๆ (ถ้าคิดว่าจำเป็น ให้
   หยุดถามก่อน อย่าเพิ่มเอง) ห้ามแก้ราคา/ตัวเลข business ใดๆ — เอาตามเอกสารที่อนุมัติแล้วเท่านั้น
4. **ทุกทางเลือกที่มีมากกว่า 1 วิธีสมเหตุผล ต้องแสดงข้อดี-ข้อเสียคู่กันก่อนขอ confirm** (ตาม booking `CLAUDE.md` ข้อ 3)
5. **ห้ามเคลมว่า "แก้เสร็จ 100%" หรือ "verified" ถ้าไม่มีเทสรันจริงยืนยัน** — รายงานตามที่เทสจริงพิสูจน์เท่านั้น
6. ทุก stage อ้างอิงจาก `docs/platform/DEEP-VERIFICATION-2026-08-18-CONSOLIDATED.md` และ
   `docs/platform/ROADMAP.md` §0 ข้อ 3 — เปิดสองไฟล์นี้ก่อนเริ่มทุก stage เพื่อดูรายละเอียด/หลักฐานตั้งต้นที่ยืนยันบั๊กแล้ว
   ไม่ต้องสืบใหม่ตั้งแต่ศูนย์ แต่ต้องเปิดไฟล์จริงที่เขียนไว้ในนั้นเพื่อยืนยันก่อนแก้ (โค้ดอาจขยับตั้งแต่ 2026-08-18)

## ทำไมต้องแก้ 4 จุดนี้

เจ้าของจะซื้อโดเมนจริงเปิดขายก็ต่อเมื่อพ้อยต์บล็อกเกอร์ 3 ใน 4 ข้อด้านล่างปิดหมด (ข้อ 4 เป็น bug คนละตัวไฟล์เดียวกับ
ข้อ 1 ไม่ใช่ gate หลักแต่ควรแก้พร้อมกันเพราะไฟล์เดียวกัน) — ไม่มีอันไหนปิด **ห้ามซื้อโดเมน** ตาม `ROADMAP.md` §0.3

---

## Stage 1 — booking: quota/staff/top-up enforcement

**บล็อกเกอร์:** ROADMAP §0.3 ข้อ 2 — `PRICING_SPEC.md` ขาย Basic 100 คิว/5 staff, Pro 500/10 + top-up add-on แต่
ไม่มีโค้ด enforce ที่ไหนเลย

**ขอบเขต:** `products/booking/` เท่านั้น (apps/booking-admin + shared lib ที่จัดการสร้างคิว/สร้าง staff)

**สิ่งที่ต้องทำ:**
1. อ่าน `products/booking/docs/business/PRICING_SPEC.md` ให้ตรงตัวเลขจริง (Basic 100/5, Pro 500/10, top-up)
2. หาจุดที่สร้างคิว (booking) ใหม่ และจุดที่เพิ่ม staff ใหม่ในโค้ดจริง
3. เพิ่ม gate ตรวจ quota ปัจจุบันเทียบ limit ของ tier ก่อนอนุญาตสร้าง — เกิน limit ต้อง reject พร้อม error ที่
   บอกเหตุผลชัดเจน (ไม่ใช่ 500 เงียบๆ)
4. top-up add-on ต้องขยาย limit ได้จริงตามที่ซื้อ ไม่ใช่แค่ field ในฐานข้อมูลที่ไม่มีใครอ่าน

**หลักฐานที่ต้องส่งก่อนขอ confirm ต่อ:**
- ไฟล์:บรรทัดที่จะแก้ (ก่อนแก้จริง เสนอแผนก่อน)
- หลังแก้: เทสจริง (unit หรือ manual repro) พิสูจน์ว่า Basic tier ที่มี 100 คิวแล้ว สร้างคิวที่ 101 ถูก reject, และ
  top-up ทำให้สร้างเกิน 100 ได้จริง

**STOP — รอ confirm ก่อนแก้ไฟล์ และรอ confirm อีกรอบก่อน commit**

---

## Stage 1 — สถานะล่าสุด (อัปเดต 2026-08-19, หลังรอบ QA ครั้งที่ 1)

Migration `20260819000000_quota_staff_topup_enforcement.sql` และ QA suite
`products/booking/qa/quota_enforcement_test.sql` ถูกเขียนไปแล้ว (AGY เขียน migration, Qwen เขียนเทสรอบแรก) —
รันแล้วพบว่า Qwen เขียนเทสผิด 2 จุด (ไม่ใช่บั๊ก migration): T3 นับ staff หลัง idempotent-fill ผิด, T5 ส่ง scalar
UUID แทน array ให้ `make_confirmed_booking` — Hermes แก้ทั้งสองจุดแล้ว รันเต็มสคริปต์ (T0-T5 + summary รวดเดียว)
ได้ **PASS=6, FAIL=0**

**Claude review เจอเพิ่ม 1 จุด (ยืนยันแล้วว่าเป็นบั๊กจริง ไม่ใช่ false positive):**

TOCTOU race ใน `create_staff` ([:275](products/booking/supabase/migrations/20260819000000_quota_staff_topup_enforcement.sql:275))
และ `set_staff_active` ([:348](products/booking/supabase/migrations/20260819000000_quota_staff_topup_enforcement.sql:348))
— ทั้งคู่แค่ `SELECT COUNT(*)` เช็ค limit โดยไม่ล็อกระดับร้าน (ต่างจาก `enforce_booking_quota` ที่ล็อก ledger row
ด้วย `FOR UPDATE` ถูกต้องอยู่แล้ว) ยิง 2 request สร้าง/reactivate staff พร้อมกันตอนใกล้ limit อาจทำให้ staff เกิน
limit จริงได้

**อีก 1 จุดที่ Hermes เสนอมา ตรวจแล้วเป็น false positive** — "re-confirm หลัง cancel consume quota ซ้ำ" ไม่จริง
เพราะ trigger คนละตัว `enforce_booking_status_transition`
([20260806000000_product_rules_v1.sql:176-179](products/booking/supabase/migrations/20260806000000_product_rules_v1.sql:176))
กัน `cancelled` เป็น terminal state ไว้แล้ว ย้ายออกจาก cancelled ไม่ได้เลยไม่ว่าทางไหน ไม่ต้องแก้จุดนี้

### ✅ อนุมัติแก้แล้ว — ทำได้เลยไม่ต้องขอ confirm ก่อนแก้ไฟล์ซ้ำ (อนุมัติแล้วใน thread นี้)

แก้ไฟล์เดิม (ยัง `git status` เป็น `??` ไม่เคย commit — แก้ในไฟล์เดิมได้ตรงๆ ไม่ต้องสร้าง migration ใหม่ทับ):
`products/booking/supabase/migrations/20260819000000_quota_staff_topup_enforcement.sql`

1. **`create_staff`** (บรรทัด ~275, หลัง idempotency check, ก่อนคอมเมนต์ "ตรวจสอบขีดจำกัดพนักงานตามแพ็กเกจ")
   เพิ่ม:
   ```sql
   PERFORM pg_advisory_xact_lock(hashtext(v_shop_id::text));
   ```
2. **`set_staff_active`** (บรรทัด ~348, บรรทัดแรกใน `IF p_is_active = true AND (v_current_is_active IS DISTINCT
   FROM true) THEN` block ก่อนดึง plan) เพิ่มบรรทัดเดียวกัน:
   ```sql
   PERFORM pg_advisory_xact_lock(hashtext(v_shop_id::text));
   ```

**ขอบเขต:** แก้แค่ 2 บรรทัดนี้เท่านั้น ห้ามแตะฟังก์ชันอื่น ห้าม refactor พ่วง

**หลักฐานที่ต้องส่งก่อนขอ confirm commit:**
- รัน `qa/quota_enforcement_test.sql` เต็มสคริปต์ซ้ำ ต้องยัง PASS=6/FAIL=0 (advisory lock ไม่เปลี่ยนพฤติกรรม
  single-threaded ที่เทสอยู่)
- เทส concurrent จริงต้องใช้ 2 connection พร้อมกัน ถ้าเขียนไม่ทันให้บอกตรงๆ ว่า "ไม่ได้เทส concurrent จริง แก้ตาม
  logic เท่านั้น" ห้ามเคลมว่าเทสแล้วถ้าไม่ได้ทำจริง

**STOP — แก้ได้เลย (อนุมัติแล้ว) แต่ยังรอ confirm อีกรอบก่อน commit จริง ตามกฎเดิมของบรีฟนี้**

---

## Stage 2 — headless_commerce: Stripe webhook signature + malformed JSON

**บล็อกเกอร์:** ROADMAP §0.3 ข้อ 1 (CRITICAL — ปลอม payment event ได้) และข้อ 4 (JSON เพี้ยน → 500 ไม่มี handle)

**ขอบเขต:** `products/headless-commerce/server/` (ไฟล์ webhook route ที่ระบุใน
`DEEP-VERIFICATION-2026-08-18-CONSOLIDATED.md` §2)

**สิ่งที่ต้องทำ:**
1. เปิด `DEEP-VERIFICATION-2026-08-18-CONSOLIDATED.md` §2 อ่านตำแหน่งบั๊กที่ยืนยันแล้ว
2. เช็คก่อนว่า `modules-hub/modules/webhook-receiver` มี Stripe provider ที่แก้เสร็จแล้ว (real HMAC-SHA256, ตาม
   `ROADMAP.md` บรรทัด 125) — headless-commerce ก็อปโมดูลนี้เข้ามาใช้ได้ไหม แทนที่จะเขียน signature verify เอง
   ใหม่ (ถ้าใช้ได้ ให้เสนอเป็นตัวเลือกแรกพร้อมข้อดี-ข้อเสียเทียบกับเขียนเอง)
3. ใส่ signature verification ก่อนประมวลผล event ใดๆ — verify ไม่ผ่าน reject ทันที ไม่ประมวลผลต่อ
4. JSON parse ผิดพลาด (malformed body) ต้องตอบ 400 ไม่ใช่ 500 ไม่มี handle

**หลักฐาน:** เทสจริง — ส่ง event ปลอม (ไม่มี/signature ผิด) ต้องถูก reject, ส่ง JSON เพี้ยนต้องได้ 400, ส่ง event
ที่ signature ถูกต้องต้องผ่านปกติ

**STOP — รอ confirm ก่อนแก้ไฟล์ และรอ confirm อีกรอบก่อน commit**

---

## Stage 2 — สถานะล่าสุด (อัปเดต 2026-08-19, หลัง Hermes เสนอแผนรอบ 1)

Hermes ตรวจโค้ดจริงมาแล้ว ยืนยันถูกทุกจุด:
- `products/headless-commerce/modules/` มีแค่ `file-storage`, `import-export`, `payment`, `product-catalog` — ไม่มี
  `webhook-receiver`
- [payments.ts:33-37](products/headless-commerce/server/src/routes/payments.ts:33) — `createPaymentWebhookHandler`
  เรียก `parser(payload)` (คือ `parsePaymentEvent`) ตรงๆ ไม่มีการ verify signature เลย (ตรงบั๊ก CRITICAL #1)
- [error-handler.ts:42-47](products/headless-commerce/server/src/middleware/error-handler.ts:42) เช็คแค่
  `error.status` (body-parser SyntaxError) ไม่จับ native `JSON.parse()` SyntaxError จาก `parseRawJson` ที่ไม่มี
  `.status` → fall ไปที่ 500 handler (ตรงบั๊ก #4)
- [app.ts:28](products/headless-commerce/server/src/app.ts:28) ใช้ `express.raw({type:'application/json'})` มา
  ก่อน `express.json()` ถูกต้องอยู่แล้ว — **ไม่ต้องแก้จุดนี้**

**แผนรอบแรกของ Hermes (Option A — ก็อป `webhook-receiver` module เข้ามา) ทิศทางถูก แต่ขาดขั้นตอนสำคัญที่สุด:**
แค่ก็อปไฟล์ module เข้ามาโดยไม่แก้ `createPaymentWebhookHandler` ให้เรียกใช้จริง = บั๊ก CRITICAL ยังไม่ถูกปิด (payments.ts
ยังคง parse payload ตรงๆ เหมือนเดิมทุกอย่าง)

### ✅ แผนที่แก้ไขแล้ว — อนุมัติแล้ว ทำได้เลยไม่ต้องขอ confirm ก่อนแก้ไฟล์ซ้ำ

**ต้นแบบที่พิสูจน์แล้วในเรพอเดียวกัน** (อ่านจริงแล้วยืนยันว่าใช้งานได้):
`products/multi-tenant-ai/server/src/routes/payment-demo.ts:97-153` (`paymentWebhookHandler`) — pattern การ wire
`StripeWebhookVerifier` เข้า Express route จริง มี timing-safe HMAC-SHA256 + timestamp-tolerance replay guard +
malformed-JSON handling ในตัว (ดู
[modules/webhook-receiver/providers/stripe/index.ts:91-108](products/multi-tenant-ai/modules/webhook-receiver/providers/stripe/index.ts:91)
— `try/catch` รอบ `JSON.parse` คืน `WEBHOOK_MALFORMED_JSON` เป็น structured failure ไม่ throw)

**ขั้นตอนที่อนุมัติ:**

1. ก็อป `products/multi-tenant-ai/modules/webhook-receiver` → `products/headless-commerce/modules/webhook-receiver`
   ทั้งโฟลเดอร์ (ไม่แก้เนื้อหา)
2. เขียน `createPaymentWebhookHandler` ใน
   [payments.ts](products/headless-commerce/server/src/routes/payments.ts:31) ใหม่ ตาม pattern ของ
   `payment-demo.ts:97-153`:
   - สร้าง `receiver = createWebhookReceiver({ verifier: new StripeWebhookVerifier({ secret: config.stripeWebhookSecret }) })`
     — `stripeWebhookSecret` มีอยู่แล้วใน
     [config.ts:17](products/headless-commerce/server/src/config.ts:17) ไม่ต้องเพิ่ม env ใหม่
   - `const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf-8') : ''`
   - `const result = await receiver.verify({ rawBody, headers: req.headers })`
   - `if (!result.valid)` → ตอบด้วย `errorBody(result.error.code, result.error.message)` ของไฟล์นี้เอง (ไม่ใช่
     raw json shape ของ multi-tenant-ai) status 400 (หรือ 401 ถ้าอยากแยก signature-fail จาก malformed — เลือกได้
     แต่ต้อง reject ก่อนแตะ business logic เสมอ)
   - valid แล้วค่อยเรียก `parser(result.payload)` (payload ที่ verify แล้ว ไม่ re-parse เอง)
3. **ลบ `parseRawJson` function ทิ้ง** ([:61-67](products/headless-commerce/server/src/routes/payments.ts:61)) —
   ไม่ใช้แล้วหลัง wire ตัวใหม่เข้าไป ไม่ต้อง patch ด้วย try/catch ตามแผนเดิม
4. `error-handler.ts` และ `app.ts` **ไม่ต้องแก้** — บล็อกเกอร์ #4 ปิดไปในตัวเพราะ verifier ไม่ throw

**ขอบเขต:** แก้แค่ 3 จุดนี้ (ก็อป module + เขียน handler ใหม่ + ลบ `parseRawJson`) ห้าม refactor route อื่น

**หลักฐานที่ต้องส่งก่อนขอ confirm commit:** เทสจริง 3 เคส — (1) ไม่มี/signature ผิด → reject ไม่ผ่านไป
`parsePaymentEvent`, (2) JSON เพี้ยนไม่มี signature ถูกก็ยัง reject ด้วย error code ที่ชัดเจน ไม่ใช่ 500, (3) event
ที่ signature ถูกต้องจริงผ่านไป `parsePaymentEvent` ปกติ

**STOP — แก้ได้เลย (อนุมัติแล้ว) แต่ยังรอ confirm อีกรอบก่อน commit จริง**

---

## Stage 3 — multi_tenant_ai: webhook middleware order + `handleBillingEvent` wiring

**บล็อกเกอร์:** ROADMAP §0.3 ข้อ 3 — `express.json()` mount ก่อน route ที่ต้องการ `express.raw()` ทำให้ signature
verify พังจริง และ verified event ไม่เคยถูกเอาไปอัปเดต subscription state เลย

**ขอบเขต:** `products/multi-tenant-ai/server/` (ไฟล์ตาม `DEEP-VERIFICATION-2026-08-18-CONSOLIDATED.md` §3)

**สิ่งที่ต้องทำ:**
1. อ่าน `DEEP-VERIFICATION-2026-08-18-CONSOLIDATED.md` §3 ยืนยันตำแหน่ง middleware order ที่ผิดจริง
2. แก้ mount order ให้ route webhook ได้ raw body ก่อน `express.json()` ประมวลผล (scope `express.raw()` เฉพาะ
   webhook path หรือย้ายลำดับ mount ให้ถูก)
3. หา `handleBillingEvent` (จาก `modules-hub/modules/subscription`) แล้วเรียกมันจริงหลัง verify signature ผ่าน
4. เช็คด้วยว่า idempotency fix ของ `subscription` module (ROADMAP บรรทัด 122, `eventId`/`lastProcessedEventId`)
   ที่ก็อปเข้ามาแล้วใน `multi-tenant-ai@ef821f6` ยังอยู่ครบ ไม่ได้หายไปตอนแก้ครั้งนี้

**หลักฐาน:** เทสจริง — ยิง webhook event ที่ signature ถูกต้อง ต้อง verify ผ่านและ subscription state เปลี่ยนจริงใน
DB/mock, ยิงซ้ำ event เดิม (replay) ต้องไม่ apply ซ้ำ (idempotency)

**STOP — รอ confirm ก่อนแก้ไฟล์ และรอ confirm อีกรอบก่อน commit**

---

## Stage 3 — สถานะล่าสุด (อัปเดต 2026-08-19, หลัง Hermes แก้รอบ 1)

Hermes แก้แล้ว 2 ไฟล์ ยืนยันตรวจอิสระเองแล้ว (`tsc` ผ่าน, `vitest` 13/13 pass จริง):
- [app.ts:21-27](products/multi-tenant-ai/server/src/app.ts:21) — ย้าย webhook route ขึ้นก่อน `express.json()` แล้ว
  จริง ปิดบั๊ก A
- [payment-demo.ts:225](products/multi-tenant-ai/server/src/routes/payment-demo.ts:225) — เรียก
  `subscriptionCore.handleBillingEvent(billingEvent)` จริงหลัง verify signature ผ่าน เทสพิสูจน์ state เปลี่ยนจริง
  (active → cancelled) ปิดบั๊ก B

**เจอช่องโหว่ใหม่ 1 จุด** (เกิดจากการเปิด `idempotencyStore` เป็นครั้งแรกใน Stage นี้ — Stage 2 ไม่เจอเพราะไม่ได้เปิด):
[webhook.test.ts:132](products/multi-tenant-ai/server/tests/webhook.test.ts:132) ยืนยันว่า **event ที่ถูกยิงซ้ำ
(replay) ตอบ 401** — [payment-demo.ts:202-208](products/multi-tenant-ai/server/src/routes/payment-demo.ts:202)
เหมารวม `!result.valid` ทุกกรณีเป็น 401 ไม่แยก `WEBHOOK_REPLAY_DETECTED`
([idempotency.ts:62-67](products/multi-tenant-ai/modules/webhook-receiver/core/idempotency.ts:62)) ออกจาก
signature ผิดจริง — **ผิดหลัก Stripe**: Stripe แนะนำให้ตอบ 2xx เมื่อได้ event ซ้ำ (บอกว่า "รับแล้ว หยุดส่งซ้ำ") ถ้า
ตอบ 401 ต่อเนื่อง Stripe จะ retry ไม่หยุดแล้วสุดท้ายปิด webhook endpoint ให้เองอัตโนมัติ

### ✅ อนุมัติแก้แล้ว — ทำได้เลยไม่ต้องขอ confirm ก่อนแก้ไฟล์ซ้ำ

1. **`payment-demo.ts`** — ใน `paymentWebhookHandler` แยกเช็ค
   `result.error?.code === 'WEBHOOK_REPLAY_DETECTED'` ออกจาก `!result.valid` กรณีอื่น → กรณี replay ตอบ
   `res.status(200).json({ received: true, duplicate: true })` แทน 401 (ยังคง**ไม่ apply ซ้ำ**เหมือนเดิม แค่เปลี่ยน
   status code ที่ตอบกลับ Stripe)
2. **`webhook.test.ts:132`** — แก้ assertion จาก `expect(replay.status).toBe(401)` เป็น
   `expect(replay.status).toBe(200)` และเพิ่มเช็คว่า subscription state ยังคงเดิม (ไม่ re-apply ซ้ำ) เพื่อพิสูจน์ว่า
   "ไม่ apply ซ้ำ" ยังจริงอยู่แม้ status code จะเปลี่ยน

**ขอบเขต:** แก้แค่ 2 จุดนี้ ห้ามแตะ signature-fail/no-signature path (ยังต้องเป็น 401 เหมือนเดิม)

**หลักฐานที่ต้องส่งก่อนขอ confirm commit:** รัน `vitest` เต็มสวีทซ้ำ ต้องยัง 13/13 pass พร้อม assertion ใหม่ที่พิสูจน์
ทั้ง 2 อย่าง: (1) replay ตอบ 200 ไม่ใช่ 401, (2) subscription state ไม่เปลี่ยนซ้ำจาก replay

**STOP — แก้ได้เลย (อนุมัติแล้ว) แต่ยังรอ confirm อีกรอบก่อน commit จริง**

---

## Stage 4 — booking: Phase 0 baseline (gate ก่อน Project B รับ product ตัวที่ 2)

**อ้างอิง:** `docs/platform/SHARED_SAAS_RUNTIME_PROJECT_B_PLAN.md` §5 Phase 0 — คนละเรื่องกับ 3 stage บนนี้
(Stage 1-3 ปลดล็อกโดเมน, Stage 4 ปลดล็อก Project B ให้รับ product ที่ 2) ทำคู่ขนานกับ Stage 1-3 ได้ ไม่ต้องรอกัน

**ขอบเขต:** `products/booking/supabase/migrations/` + review ล้วนๆ ก่อน ยังไม่ authorize ให้แก้ migration จริง

**สิ่งที่ต้องทำ (เป็น investigation + เสนอแผน ไม่ใช่ execution จนกว่าจะ confirm แยกอีกรอบ):**
1. `supabase migration list --linked` (project ref `gyleqrjdzwwlqierdwcy`) เทียบกับไฟล์ใน
   `supabase/migrations/` local — มี drift ไหม ระบุให้ชัดว่า remote มีอะไรที่ local ไม่มีหรือกลับกัน
2. เช็คสถานะ E3.3 live RLS/security verification gap (ตามที่ `SHARED_SAAS_RUNTIME_PROJECT_B_PLAN.md` §4 อ้างว่า
   ยัง unresolved ณ 2026-08-18) — ยังจริงอยู่ไหม
3. `git status` ของ `products/booking/` ระบุไฟล์ที่ยัง uncommitted ทั้งหมด (platform-admin migration/UI work ที่
   แผนพูดถึง) แยกเป็นตารางว่าไฟล์ไหนควร commit ทันที (พร้อม review) ไฟล์ไหนควร defer พร้อมเหตุผล
4. เสนอแผน reconciliation (ถ้ามี drift) เป็นตัวเลือกพร้อมข้อดี-ข้อเสีย — **ห้ามรัน `supabase migration repair`
   หรือ `db push` เองแม้จะดู trivial ก็ตาม ต้องขอ confirm แยกก่อนเสมอ** เพราะกระทบ production database ตรง Project B

**Exit evidence ที่ต้องมีก่อนปิด stage นี้ (ตาม plan §5):** reviewed baseline commit, migration list ตรงกับ source
of truth ที่อนุมัติแล้ว, live REST/browser negative test ผ่าน, ไม่มี unreviewed product schema work ค้าง

**STOP — Stage นี้เป็น investigation-first เท่านั้น ห้ามแก้ migration/รัน repair จนกว่าจะมีการ confirm แยกต่างหาก
อีกรอบสำหรับแผน reconciliation ที่เสนอ**

---

## หลัง Stage ไหนเสร็จและ confirm แล้ว

อัปเดต `docs/platform/ROADMAP.md` §0 ข้อ 3 (ตัดรายการที่ปิดแล้วออก หรือทำ strikethrough พร้อมวันที่/หลักฐาน) ตาม
"Change-control rule" ท้ายไฟล์ — **เสนอ diff ของ ROADMAP.md ให้ owner review ก่อน commit เหมือนกัน ไม่ commit เอง
เงียบๆ**

## รูปแบบรายงานต่อ stage (ส่งก่อนขอ confirm ทุกครั้ง)

1. Stage นี้จะแก้ไฟล์ไหนบ้าง (path:บรรทัดโดยประมาณ)
2. ถ้ามีมากกว่า 1 วิธี — ตารางข้อดี/ข้อเสียของแต่ละวิธี
3. หลังแก้จริง (รอบถัดไปที่ confirm แล้ว): diff สรุป + หลักฐานเทสจริง (คำสั่งที่รัน + ผลลัพธ์จริง ไม่ใช่สรุปด้วยคำพูด)
4. สถานะ: "รอ confirm ก่อนแก้ไฟล์" หรือ "แก้เสร็จแล้ว รอ confirm ก่อน commit" หรือ "commit แล้ว รอ confirm ก่อน push"
   ให้ระบุชัดเจนทุกครั้งว่ากำลังรออะไรอยู่ ไม่ใช่แค่ "เสร็จแล้ว"
