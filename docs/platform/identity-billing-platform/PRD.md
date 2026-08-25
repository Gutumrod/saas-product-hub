# PRD: Hub Identity, Entitlement & Billing Platform

**Project Owner:** เจ้าของ saas-product-hub
**Scope:** Extension of `apps/hub-web` (Project A) + a new isolated billing service — not a new standalone project
**Created:** 2026-08-25
**Last Updated:** 2026-08-25

> เอกสารนี้เบี่ยงจากเทมเพลตมาตรฐาน `PRD_TEMPLATE.md`/`PROJECT_CONTEXT_TEMPLATE.md` โดยตั้งใจ — เทมเพลตเดิมออกแบบมาสำหรับ pipeline Hermes/OpenClaw+Telegram ซึ่งไม่ตรงกับวิธีทำงานจริงของ repo นี้ (git-based, docs ใน `docs/platform/`, ตัดสินใจผ่าน `registry.yaml`/`ROADMAP.md`) เนื้อหาปรับให้ตรงสถาปัตยกรรมจริงแทนที่จะบังคับกรอกฟิลด์ที่ไม่เกี่ยวข้อง

---

## 1. Objective

**ปัญหาที่ต้องการแก้:**
- ลูกค้าที่อยากใช้มากกว่า 1 โปรดักต์ในพอร์ต ต้องสมัครแยก จ่ายแยก จำหลาย login — ไม่มีทาง "ซื้อครั้งเดียว ใช้ได้หลายตัว"
- แต่ละโปรดักต์ถ้าต้องเขียน Stripe integration เอง จะเกิดบั๊กซ้ำแบบเดียวกับที่เคยเจอมาแล้ว (Stripe webhook ไม่ verify signature ใน `headless_commerce`) และเสียเวลาสร้างซ้ำทุกโปรดักต์ใหม่
- ไม่มีจุดกลางที่บอกว่า "tenant นี้มีสิทธิ์ใช้อะไรบ้าง" — ทำให้ผูก entitlement เข้าโปรดักต์ใหม่แต่ละตัวต้องคิดใหม่ทุกครั้ง

**เป้าหมาย:**
- ลูกค้าสมัคร Hub account ครั้งเดียว (= 1 organization/tenant) ใช้ login เดียวดู subscription ทุกโปรดักต์ที่ซื้อในที่เดียว
- ซื้อได้หลายโปรดักต์ในตะกร้าเดียว จ่ายเงินครั้งเดียว (bundle discount 10% เมื่อซื้อครบ 3 โปรดักต์)
- แต่ละโปรดักต์ยังคงเป็นเจ้าของ tier/ราคา/business logic ของตัวเอง 100% — Hub ไม่ยุ่งเรื่องนี้
- Payment fail กระทบเฉพาะโปรดักต์นั้น ไม่ลามไปตัวอื่น
- โปรดักต์ใหม่ที่จะสร้างต่อจากนี้ ต่อกับ billing กลางได้ทันที ไม่ต้องเขียน Stripe integration ใหม่

**ขอบเขต:**
- อยู่ใน scope: ระบบ organization/tenant, entitlement, billing engine กลาง (แยก isolate), การซิงก์ entitlement ไปยังโปรดักต์, ระบบ subdomain ต่อร้านสำหรับ `booking` (pilot)
- ไม่อยู่ใน scope รอบนี้: การรื้อ business logic ภายในของแต่ละโปรดักต์, ระบบ VAT/ใบกำกับภาษี (ยังไม่จด VAT — ออกใบเสร็จธรรมดาพอ), tenant custom domain (ลูกค้าเอาโดเมนตัวเองมาผูก — คนละเรื่องกับ subdomain ย่อยที่ทำรอบนี้)

---

## 2. Full System Architecture

### สามชั้นที่แยกจากกันโดยเจตนา (อิงจาก `docs/platform/SHARED_SAAS_RUNTIME_PROJECT_B_PLAN.md` ที่มีอยู่แล้ว แต่ไม่เคยถูกประกอบใช้จริง)

```
ลูกค้า → Hub (Project A = apps/hub-web, DB เดิม coyelzlgukvpgguqpjdi)
           │  organizations, product_installations, product_entitlements,
           │  platform_audit_events — "ใครสมัคร ใครมีสิทธิ์อะไร"
           │
           ├──► Billing Service (แยก isolate — ต่อยอดจาก products/stripe-billing
           │     ที่มี 4 module เสร็จแล้ว: payment, subscription+entitlement engine,
           │     webhook-receiver, audit-log — 291/291 tests ผ่านอยู่แล้ว)
           │     ถือ Stripe secret ที่เดียว ไม่กระจายไปแต่ละโปรดักต์
           │
           └──► event-bus (modules-hub, มีอยู่แล้ว v0.1.0, ยังไม่มีใครใช้)
                 ยิง entitlement เปลี่ยนแปลง → โปรดักต์แต่ละตัว (Project B / source_product)
                 โปรดักต์เก็บ business logic + ข้อมูลใช้งานจริงของตัวเองเหมือนเดิม
```

### Component Stack

| Component | Technology | สถานะ |
|-----------|------------|--------|
| Identity/Tenant (Project A) | apps/hub-web, Supabase (`coyelzlgukvpgguqpjdi`), tRPC | ต่อยอดจากของเดิม — `product_installations` มีแล้วตั้งแต่ Phase 9 |
| Billing engine | `products/stripe-billing` modules (payment, subscription, webhook-receiver, audit-log) | มีโค้ดพร้อมใช้ ยังไม่มี app/server layer wiring |
| Entitlement sync | `modules-hub/modules/event-bus` (publish/subscribe) | มีโค้ดพร้อมใช้ ไม่มีโปรดักต์ไหนต่อสายอยู่ |
| Pilot product | `products/booking` | ใกล้ launch ที่สุด — ใช้เป็นตัวแรกที่ต่อระบบนี้ |
| Public tenant subdomain (booking) | Cloudflare wildcard route `*.booking.wstera.com` หรือ `*.wstera.com` | ยังไม่สร้าง — งานใหม่ |

### Product participation criterion (ยืนยันระหว่าง interview)

เข้าร่วมระบบนี้ได้เฉพาะ **"hosted SaaS ที่ tenant subscribe แล้วใช้ต่อเนื่อง"** เท่านั้น:

**เข้าเกณฑ์ (ผู้สมัครในอนาคต ยังไม่ได้ตัดสินใจรับเข้าทุกตัว — ตัดสินทีละตัวตอน admission จริง):**
`booking` (pilot), `headless_commerce`, `feature_flag`, `line_oa_ai_sales_service_engine`, `content_autopilot`, `it_ops_watchdog`, `bulk_etl_sync`, `compliance_audit`

**ไม่เข้าเกณฑ์ — เก็บเป็น source_product/ขายขาดต่อไป (เหตุผลทางสถาปัตยกรรม ไม่ใช่ความขี้เกียจ):**
- `multi_tenant_ai` — เป็น developer boilerplate ที่ลูกค้าซื้อไปรันเอง บังคับเข้า Hub billing จะทำลาย value proposition ของมันเอง
- `booking_ticket_module` — ไม่มี backend เลย เป็นแค่ React component
- `doccraft` — ตั้งใจ local-first/no-login โดยเจตนา (Cloud sync เป็น post-MVP แยกต่างหาก)
- `tracking` — เก็บข้อมูลเป็น JSON file ต้องรื้อ backend ก่อนไม่ว่าจะขายแบบไหน

**Pending owner decision (ไม่ได้ยืนยันใน interview รอบนี้ — เป็นข้อเสนอที่ต้องอนุมัติแยก):**
- `pawspace` — ปัจจุบันเป็น `source_product`/self-hosted แต่ architecture ใกล้เคียง hosted-SaaS มากแล้ว (multi-tenant, RLS, tier UI พร้อม) ข้อเสนอ: ย้ายมาเป็น hosted subscription ผ่านระบบนี้ — **ต้องขออนุมัติแยกจากเจ้าของก่อนเปลี่ยน `deployment_model` ใน registry.yaml**
- `rentmatrix`, `omnidesk` — ยังไม่มีโค้ดรันได้ ตัดสินตอนเริ่มสร้างจริง

---

## 3. Detailed Implementation Steps

### Phase 1: Billing engine ตั้งต้น
- [ ] Wire 4 module ของ `products/stripe-billing` เข้า app/server layer จริง (ตอนนี้เป็นแค่ module ลอย ไม่มี server)
- [ ] ตัดสินใจ hosting: isolate เป็น Cloudflare Worker แยกต่างหาก (ไม่ผูกกับ hub-web's worker หรือ product ใดๆ)
- [ ] ตั้ง Stripe account/webhook endpoint ใหม่สำหรับ billing service นี้โดยเฉพาะ

### Phase 2: Schema กลางที่ Project A (hub-web DB เดิม)
- [ ] เพิ่มตาราง `organizations` (หรือขยาย concept เดิมของ Hub auth ที่มีอยู่แล้วให้เป็น tenant), `product_entitlements`, `platform_audit_events`
- [ ] ขยาย `product_installations` ที่มีอยู่แล้ว (Phase 9) ให้เก็บสถานะ billing/subscription ด้วย ไม่ใช่แค่ installed: true/false

### Phase 3: Entitlement sync
- [ ] Copy `event-bus` module (modules-hub v0.1.0) เข้า billing service + hub-web
- [ ] ออกแบบ event contract: `subscription.changed`, `product.entitlement.changed` (ตั้งชื่อให้ตรงกับที่ `SHARED_SAAS_RUNTIME_PROJECT_B_PLAN.md` เคยเสนอไว้แล้ว)
- [ ] สร้าง "platform client" module ใหม่ (ยังไม่มีใน modules-hub) — โปรดักต์ copy เข้าไปเพื่อรับ event + ยืนยัน entitlement กับ Hub

### Phase 4: Checkout UX ที่ hub-web
- [ ] ตะกร้าเลือกได้หลายโปรดักต์ + คำนวณส่วนลด 10% เมื่อครบ 3 ตัว
- [ ] ออกใบเสร็จรวม (ไม่มี VAT — เผื่อฟิลด์ VAT/เลขผู้เสียภาษีเป็น nullable ไว้ล่วงหน้า)
- [ ] Partial-failure handling: บัตรผ่านบางโปรดักต์ ไม่ผ่านบางโปรดักต์ → ระงับเฉพาะตัวที่ไม่ผ่าน

### Phase 5: Pilot — `booking` subdomain ต่อร้าน
- [ ] Wildcard DNS + route (`*.booking.wstera.com` หรือ `*.wstera.com` แล้วแต่ผล cert-depth check)
- [ ] เปิด Advanced Certificate Manager ถ้าจำเป็น (2 ชั้น wildcard)
- [ ] Slug validation: unique + กันคำสงวน (`admin`, `api`, `www`, ชื่อโปรดักต์อื่น)
- [ ] ต่อ `booking` เข้า entitlement client จริง (ตัวแรกในพอร์ตที่ผ่านระบบนี้)

---

## 4. Success Criteria

- [ ] ลูกค้าสมัคร Hub account 1 ครั้ง ซื้อ `booking` ได้จริงผ่านระบบ billing กลาง (ไม่ใช่ Stripe เดิมของ booking)
- [ ] ร้านที่สมัคร `booking` ได้ subdomain ของตัวเอง ใช้งานจริงได้ ไม่ต้องส่งลิงก์มือ
- [ ] Payment fail 1 โปรดักต์ ไม่กระทบสิทธิ์โปรดักต์อื่นของ tenant เดียวกัน (ทดสอบจริง)
- [ ] ใบเสร็จรวมออกถูกต้อง ไม่มี VAT

---

## 5. Risks & Mitigation

| ความเสี่ยง | ผลกระทบ | วิธีแก้ |
|-----------|----------|----------|
| Billing service เป็น SPOF การเงินของทั้งพอร์ต | ทุกโปรดักต์รับเงินไม่ได้พร้อมกันถ้า service ล่ม | Isolate เป็น service แยกต่างหาก (ตามที่ `SHARED_SAAS_RUNTIME_PROJECT_B_PLAN.md` เตือนไว้แล้ว) ไม่ผูกกับ hub-web's worker |
| `booking` มี Stripe integration ของตัวเองอยู่แล้ว (ตาม `products/booking/CLAUDE.md`) | รื้อตอนใกล้ launch เสี่ยง regression | ไม่รื้อทันที — ปล่อย booking ขึ้นด้วยระบบเดิมจนขายได้ก่อน ค่อยย้ายเข้า billing กลางเป็น migration แยก |
| Wildcard SSL 2 ชั้น (`*.booking.wstera.com`) ไม่ครอบใน Universal SSL ฟรี | subdomain ต่อร้านใช้ HTTPS ไม่ได้ | เปิด Advanced Certificate Manager หรือปรับ slug มาอยู่ชั้นเดียวใต้ root แทน |
| Free tier ต่อโปรดักต์ (จำนวนวัน) ยังไม่ตกผลึก | ออกแบบ schema entitlement ผิดถ้าเดาผิด | เผื่อฟิลด์ trial period แบบ nullable/configurable ต่อ tenant ต่อโปรดักต์ ไม่ hardcode จำนวนวัน |

---

## 6. Related Documents

- [`docs/platform/SHARED_SAAS_RUNTIME_PROJECT_B_PLAN.md`](../SHARED_SAAS_RUNTIME_PROJECT_B_PLAN.md) — ต้นแบบสถาปัตยกรรม Project A/B ที่มีอยู่แล้ว
- [`docs/products/registry.yaml`](../../products/registry.yaml) — สถานะจริงของแต่ละโปรดักต์
- [`D:\AI-Workspace\projects\modules-hub\INDEX.md`] — module ที่มีอยู่แล้วให้ copy ใช้
- `PROJECT_CONTEXT.md`, `implementation_plan.md` (ในโฟลเดอร์เดียวกัน)

---

**สถานะ:** Draft — รอเจ้าของอนุมัติก่อนเริ่มโค้ดจริง
**Priority:** High
