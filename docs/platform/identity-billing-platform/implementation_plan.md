# Implementation Plan: Phase 1 — Billing Engine Wiring

**สถานะ:** Draft — เสนอเพื่ออนุมัติ ยังไม่ลงมือทำ
**ขอบเขตเอกสารนี้:** เจาะเฉพาะ Phase 1 ของ `PRD.md` ให้ลึกพอเริ่มโค้ดได้จริง (Phase 2-5 อยู่ใน PRD ระดับหัวข้อ จะเขียนแผนละเอียดแยกทีหลังตอนถึงคิว)

---

## 0. สิ่งที่ตรวจสอบแล้วจากโค้ดจริง (ไม่ใช่จากคำโฆษณาใน REGISTRY.md)

อ่าน `MODULE.md` ของ `payment` และ `subscription` ใน `modules-hub` แล้วเจอช่องโหว่จริงที่ **ต้องแก้ก่อนใช้กับเงินจริง**:

| Module | ปัญหาที่เจอ | กระทบยังไงกับ requirement ที่ยืนยันไปแล้ว |
|---|---|---|
| `subscription` | `canUseFeature`/`getLimit` **ไม่บล็อกสถานะ `past_due`** — บล็อกแค่ `expired`/`cancelled` เท่านั้น | ขัดกับที่ยืนยันไว้ตอน interview ข้อ 3 ("จ่ายไม่ผ่าน → ระงับเฉพาะโปรดักต์นั้น") — ของจริงตอนนี้ยังไม่ระงับให้ ต้องแก้ก่อน |
| `subscription` | `createSubscription` ตั้ง `currentPeriodEnd` เป็น `+30 วัน` เสมอ **ไม่สนใจ `billingInterval`** (`month`/`year`) | ถ้าโปรดักต์ไหนขายแผนรายปี จะถูกตัดรอบทุก 30 วันผิด ต้องแก้ก่อนเปิดขายแผนรายปีจริง |
| `subscription` | ไม่มี auto grace-period/auto-expiry ตามเวลา — ต้องมี job ภายนอกมาเรียก `handleBillingEvent`/`cancelSubscription` เอง | ต้องมี scheduler (มี `modules-hub/modules/scheduler` อยู่แล้ว) มาต่อ ไม่ใช่แค่ deploy module เฉยๆ |
| `payment` | Stripe adapter **ไม่เคยถูกทดสอบกับ Stripe จริง** (mock fetch เท่านั้น) | ต้องมี sandbox test จริงก่อนต่อเงินจริง ห้ามเชื่อว่า "โค้ดมี = ใช้ได้" |

**สรุป:** โมดูลที่มีอยู่คือ**จุดเริ่มต้นที่ดี ไม่ใช่ของสำเร็จรูปพร้อมใช้** ต้องแก้ 2 จุดใน `subscription` ก่อนอย่างน้อย ไม่งั้น requirement ที่เจ้าของยืนยันไปแล้วจะไม่ทำงานจริง

---

## 1. ขั้นตอนเตรียมระบบ

```bash
# 1. Copy module เข้า repo ใหม่สำหรับ billing service (ไม่ copy เข้า hub-web/booking โดยตรง)
mkdir -p D:/AI-Workspace/projects/saas-product-hub/services/billing-core/modules
cp -r D:/AI-Workspace/projects/modules-hub/modules/payment D:/AI-Workspace/projects/saas-product-hub/services/billing-core/modules/
cp -r D:/AI-Workspace/projects/modules-hub/modules/subscription D:/AI-Workspace/projects/saas-product-hub/services/billing-core/modules/
cp -r D:/AI-Workspace/projects/modules-hub/modules/webhook-receiver D:/AI-Workspace/projects/saas-product-hub/services/billing-core/modules/
cp -r D:/AI-Workspace/projects/modules-hub/modules/audit-log D:/AI-Workspace/projects/saas-product-hub/services/billing-core/modules/
cp -r D:/AI-Workspace/projects/modules-hub/modules/event-bus D:/AI-Workspace/projects/saas-product-hub/services/billing-core/modules/
```

ตั้งเป็น service ใหม่แยกต่างหาก (`services/billing-core`) ไม่ใช่โฟลเดอร์ย่อยใน `apps/hub-web` — ตรงกับที่ตัดสินใจไว้ใน PRD ว่าต้อง isolate เพราะ blast-radius ของ secret การเงิน

## 2. แก้ 2 บั๊กที่เจอใน `subscription` module (ในสำเนาที่ copy มา ไม่แตะต้นฉบับ modules-hub)

1. `core/engine.ts` — เพิ่มเงื่อนไข `past_due` ให้ `canUseFeature`/`getLimit` คืนค่า blocked เหมือน `expired` (ตาม requirement ที่ยืนยันแล้ว: จ่ายไม่ผ่าน = ระงับทันที ไม่ต้องรอ grace period เพราะ grace period ยังไม่ implement จริง)
2. `core/service.ts` — แก้ `createSubscription` ให้อ่าน `plan.billingInterval` จริง (`month` → +30 วัน, `year` → +365 วัน) แทนการ hardcode 30 วัน

## 3. Server layer ใหม่ (ยังไม่มีอยู่เลย — ต้องสร้างจากศูนย์)

- Cloudflare Worker ใหม่ (`services/billing-core/worker.ts`) — fetch-based เหมือน `apps/hub-web/server/worker.ts`
- Endpoint ที่ต้องมี: `POST /checkout` (สร้าง Stripe Checkout session สำหรับตะกร้าหลายโปรดักต์), `POST /webhooks/stripe` (รับ webhook, verify ผ่าน `webhook-receiver`), `GET /entitlements/:tenantId` (ให้ hub-web/โปรดักต์เรียกถาม)
- ตั้ง Stripe secret ผ่าน `wrangler secret put STRIPE_SECRET_KEY` — secret นี้อยู่เฉพาะที่ billing-core เท่านั้น ห้ามให้ hub-web หรือโปรดักต์อื่นถือ

## 4. Verification Plan (ก่อนถือว่า Phase 1 เสร็จ)

- [ ] `npm test` ผ่านทั้งหมดในสำเนาที่แก้ (รวม test ใหม่สำหรับ `past_due` blocking + `billingInterval` fix ที่ยังไม่มีอยู่ในชุดเทสต์เดิม)
- [ ] Sandbox test กับ Stripe จริง (ไม่ใช่ mock) อย่างน้อย 1 รอบ: สร้าง checkout session จริง, จ่ายด้วยบัตรทดสอบ, ยืนยัน webhook มาถึงจริงและ verify signature ผ่าน
- [ ] จำลอง payment fail (บัตรทดสอบที่ decline) แล้วยืนยันว่า `canUseFeature` คืนค่า blocked จริง (พิสูจน์ว่าบั๊กข้อ 2 ที่เจอถูกแก้จริง ไม่ใช่แค่แก้โค้ดแล้วไม่ได้เทส)
- [ ] ยืนยันแผนรายปีได้ `currentPeriodEnd` ที่ +365 วันจริง ไม่ใช่ +30 วัน

---

## Next: Phase 2 (ยังไม่เริ่มเขียนละเอียด)

รอ Phase 1 verify ผ่านก่อน ค่อยเขียนแผนละเอียดของ schema `organizations`/`product_entitlements`/`platform_audit_events` ที่ hub-web — ไม่เขียนล่วงหน้าตอนนี้เพราะ schema ควรอิงจาก event contract จริงที่ Phase 1 สร้าง ไม่ใช่เดาไว้ก่อน
