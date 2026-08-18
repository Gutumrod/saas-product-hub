# Full portfolio audit — read-only, do not trust any existing doc

คุณกำลังทำการสำรวจล้วนๆ (investigation only) — **ห้ามแก้ไข สร้าง หรือลบไฟล์ใดๆ ห้ามรัน
`npm install`/`npm run build`/`git commit`/`git push` หรือคำสั่งใดที่เปลี่ยนแปลง repo
หรือติดตั้ง dependency ห้ามแตะอะไรใต้ `D:\AI-Workspace\.secrets\`** นี่คือการวิเคราะห์อย่างเดียว
คำตอบสุดท้ายของคุณคือรายงานที่เขียน ไม่ใช่การแก้โค้ด

## บริบท — ทำไมต้องสำรวจรอบนี้

เจ้าของ platform ต้องการวาง **roadmap การพัฒนา** สำหรับ 2 track แยกกัน:

1. **ขาย Module แยกเดี่ยว** — module ใน `D:\AI-Workspace\projects\modules-hub\modules\` (copy-and-own library, 23 module ตาม `modules/REGISTRY.md`)
2. **ขาย Product** — product ใน `D:\AI-Workspace\projects\saas-product-hub\products\` (13+ ตัวใน `docs/products/registry.yaml` บวก `booking-ticket-module` ที่เพิ่งลงทะเบียนเมื่อวาน)

ก่อนจะวาง roadmap/priority ได้ ต้องมี**ข้อมูลสถานะจริง** ของทุกตัวก่อน — ห้ามเชื่อ checkbox หรือ status column ในเอกสารเฉยๆ เพราะ repo นี้มีประวัติ doc-drift ซ้ำๆ มาแล้วหลายรอบ (ตัวอย่างจริงจาก session ก่อนหน้า: `modules-hub/modules/enterprise-features` เคยถูกบันทึกว่า "ว่างเปล่า" ทั้งที่จริงเขียนเสร็จแล้ว, `line_oa_ai` ใน registry.yaml เคลม `acceptance.commercial: true` ทั้งที่ไม่มีลูกค้าจริงสักรายเลย, `apps/hub-web/README.md` ยังอธิบาย stack ผิดมาหลายวันแล้ว) — **สงสัยทุก status ไว้ก่อน จนกว่าจะเช็คกับซอร์สโค้ด/test จริง**

## งานของคุณ — แบ่ง 3 ส่วน

### ส่วนที่ 1: ตรวจทุก Module ใน modules-hub (23 ตัวตาม REGISTRY.md)

อ่าน `D:\AI-Workspace\projects\modules-hub\modules\REGISTRY.md` ก่อน (มี column: Module, Path, Priority, Status, Version) แล้วไล่ตรวจทีละตัว:

สำหรับแต่ละ module (`modules-hub/modules/<path>/`):
- มี source code จริงไหม (ไม่ใช่แค่ `package-lock.json` เปล่าๆ) — ดู `src/` หรือ `core/`
- มี `VERSION` file ตรงกับ column "Version" ใน REGISTRY.md ไหม
- รัน `npm run typecheck` และ `npm test` จริง (อย่าแค่เดาจากไฟล์ที่เห็น) — บันทึกผลจริง (ผ่าน/ไม่ผ่าน, จำนวน test)
- มี `MODULE.md` ที่อธิบาย scope/contract จริงไหม
- สถานะจริงตรงกับ column "Status" (⬜/🟡/🧪/✅) ไหม — ถ้าไม่ตรง ระบุว่าควรเป็นอะไร

### ⚠️ หมายเหตุก่อนเริ่มส่วนที่ 2 — มี "ticket" 2 ตัว อย่าสับสน

Portfolio นี้มี product ที่ชื่อเกี่ยวกับ "ticket" อยู่ **2 ตัวแยกกัน** ไม่ใช่ตัวเดียว — ทั้งคู่ลงทะเบียนใน
`registry.yaml` แล้ว (ไม่มี module ชื่อ ticket ใน modules-hub เลย, เช็คแล้ว) แต่ต้องตรวจทั้งคู่แยกกันให้ครบ
เพราะเป็นคนละระบบกันจริงๆ:

- `key: "tracking"`, `path: "products/ticket-tracking-relay"` — Express + local JSON, ระบบแจ้ง/ติดตามปัญหา
- `key: "booking_ticket_module"`, `path: "products/booking-ticket-module"` — React, ระบบจัดการเคส/booking claim (ลงทะเบียนเมื่อ 2026-08-17)

อย่ารายงานรวมกันเป็นตัวเดียวหรือเข้าใจว่าซ้ำกัน — ตรวจแยกตามหัวข้อส่วนที่ 2 ด้านล่างเหมือน product อื่นทุกตัว

### ส่วนที่ 2: ตรวจทุก Product ใน saas-product-hub

อ่าน `docs/products/registry.yaml` ทั้งไฟล์ก่อน (source of truth ที่อ้างไว้) แล้วไล่ตรวจทีละ entry ทุกตัว (`booking`, `line_oa_ai`, `tracking`, `headless_commerce`, `stripe_billing`, `multi_tenant_ai`, `feature_flag`, `content_autopilot`, `it_ops_watchdog`, `bulk_etl_sync`, `compliance_audit`, `ai_resilience_gateway`, `short_url_analytics`, `booking_ticket_module`):

สำหรับแต่ละ product (`products/<path>/`):
- **มี application layer จริงไหม** หรือมีแค่ "modules ที่ก็อปมา + BRIEF.md" (สถานะเดียวกับที่ `line_oa_ai` และ `multi_tenant_ai` เคยถูกพบว่าเป็นก่อนหน้านี้ — "modules copied, not yet assembled into an app") เช็คว่ามี server/deploy config/migration จริงไหม หรือแค่ folder `modules/`
- **`modules:` list ใน registry.yaml ตรงกับที่ก็อปมาจริงใน `products/<name>/modules/` ไหม** (ระบุ module ไหนเคลมไว้แต่ไม่มีจริง, module ไหนมีจริงแต่ไม่ได้ list ไว้)
- **`commercial_status`/`acceptance.*` ดูสอดคล้องกับสถานะจริงไหม** (ไม่ต้องเสนอค่าใหม่ แค่รายงานว่าตรง/ไม่ตรง — การเปลี่ยนค่าเป็นเรื่องที่ผู้ใช้ตัดสินใจเองเท่านั้น)
- **อ่าน `BRIEF.md`/`PRD.md`/`README.md` ของ product นั้น** (ถ้ามี) เทียบ TODO/สถานะที่เขียนไว้กับโค้ดจริง — เจออันไหนเขียนว่า "เสร็จ" ทั้งที่ไม่จริง หรือ "ค้าง" ทั้งที่จริงๆ เสร็จแล้ว ให้ระบุ
- ถ้ามี `package.json`/build script: รัน `npm run typecheck`/`npm test`/`npm run build` จริงถ้าทำได้ในเวลาอันควร (ไม่ต้องรันถ้าไม่มี script พวกนี้ หรือใหญ่เกินไป) บันทึกผลจริง

### ส่วนที่ 3: Cross-reference — module ไหนไม่มี product ไหนใช้เลย

จากข้อมูลส่วนที่ 1+2: สร้างตารางว่า module ไหนใน modules-hub **ไม่ถูกอ้างอิงใน `modules:` list ของ product ไหนเลย** ใน registry.yaml — นี่คือ candidate สำหรับ "ขายเป็น standalone module" ที่ยังไม่เคยถูกพิสูจน์ในสถานการณ์จริงผ่าน product ใดๆ เลย (สำคัญสำหรับ track "ขาย module แยก")

### ส่วนเสริม (ถ้ามีเวลา — ไม่ใช่ blocker ต่อรายงานหลัก)

- เช็คซ้ำ 2 เรื่องที่ session ก่อนหน้าเคยพบว่ายังค้าง ให้ได้ timestamp ใหม่ล่าสุด:
  - service_role key (`gyleqrjdzwwlqierdwcy`, `coyelzlgukvpgguqpjdi`) rotate หรือยัง (เช็คจาก `HANDOFF.md` และ git log — เท่าที่เช็คได้แบบ read-only)
  - `docs/platform/SHARED_SAAS_RUNTIME_PROJECT_B_PLAN.md` — Phase 0 (freeze/reconcile booking migration baseline) เสร็จหรือยัง (สำคัญเพราะ product หลายตัวใน registry ถูก gate ไว้ด้วยแผนนี้ก่อนจะ deploy จริงบน Project B)
- ไล่หาไฟล์ `BRIEF-*.md`/`BRIEF.md` ทั้งหมดในทั้ง 2 repo (glob หา อาจมีมากกว่าที่คิด) ที่ยังไม่ถูกกล่าวถึงในส่วนที่ 2 — เผื่อมีบรีฟที่ยังไม่ได้เช็ค

## รัน git status ก่อนส่งรายงาน

```
git -C D:\AI-Workspace\projects\saas-product-hub log --oneline -10 --branch
git -C D:\AI-Workspace\projects\saas-product-hub status --short --branch
git -C D:\AI-Workspace\projects\modules-hub log --oneline -10 --branch
git -C D:\AI-Workspace\projects\modules-hub status --short --branch
```

ให้รายงานอิงสถานะปัจจุบันจริง ไม่ใช่ snapshot เก่า

## ส่งมอบ — ขอเป็นตาราง ไม่ใช่ prose ยาวๆ

รายงาน (เป็นคำตอบสุดท้าย ไม่ใช่ไฟล์แยก) ต้องมี:

1. **ตาราง Module** (23 แถว): Module | Path | Priority | Status เคลม | Status จริง (ตรง/ไม่ตรง+เหตุผล) | typecheck/test ผล | หมายเหตุ
2. **ตาราง Product** (14 แถว): Product key | มี app layer จริงไหม | modules: list ตรงจริงไหม | commercial_status ดูสมเหตุสมผลไหม | BRIEF.md ตรงโค้ดไหม | หมายเหตุ
3. **ตาราง Module ที่ไม่มี product ใช้เลย** (จากส่วนที่ 3)
4. รายการ doc-drift อื่นๆ ที่เจอเพิ่มนอกเหนือจาก 3 ตารางข้างต้น (ถ้ามี)
5. ผล git status/log ล่าสุดทั้ง 2 repo

จุดประสงค์ของรายงานนี้คือให้ Claude (Commander) เอาไปสังเคราะห์เป็น roadmap ที่มีลำดับความสำคัญจริง — เพราะฉะนั้นเน้นข้อเท็จจริงที่ verify แล้ว ไม่ต้องเสนอ roadmap หรือ priority เอง ปล่อยให้เป็นงานขั้นถัดไป
