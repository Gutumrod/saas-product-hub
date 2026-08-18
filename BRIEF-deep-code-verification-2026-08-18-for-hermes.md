# Deep code-level verification — read-only, do not trust any doc including this one's claims

คุณกำลังทำการสำรวจล้วนๆ (investigation only) — **ห้ามแก้ไข สร้าง หรือลบไฟล์ใดๆ ห้ามรัน
`npm install`/`npm run build`/`git commit`/`git push`/`supabase db push`/`supabase migration repair`
หรือคำสั่งใดที่เปลี่ยนแปลง repo, ฐานข้อมูล, หรือ deployment ห้ามแตะอะไรใต้ `D:\AI-Workspace\.secrets\`**
คำตอบสุดท้ายของคุณคือรายงานที่เขียน ไม่ใช่การแก้โค้ดหรือแก้ปัญหาที่เจอ — เจอบั๊กก็แค่รายงาน ห้ามแก้เอง

`products/booking/CLAUDE.md` มีกฎของ repo นั้นเองเขียนไว้ว่าห้าม agent แตะโค้ด/รันคำสั่งใดๆ โดยไม่มีการอนุมัติ
เป็นลายลักษณ์อักษรจากเจ้าของก่อนทุกครั้ง — งานนี้เป็น read-only เท่านั้นจึงไม่ขัดกฎนั้น (ไม่มีการแก้ไข)
แต่ถ้าเจอจุดที่ "อยากแก้ให้เลย" ให้ระงับไว้ แล้วเขียนลงรายงานแทน

## บริบท — ทำไมต้องสำรวจรอบนี้ (ต่อจาก audit เดิมวันเดียวกัน)

วันนี้ (2026-08-18) มีการสำรวจ portfolio กว้างๆ ไปแล้วรอบหนึ่ง (ดู `BRIEF-full-portfolio-audit-2026-08-18-for-hermes.md`
และผลที่ sync กลับเข้า `docs/platform/ROADMAP.md`/`docs/products/registry.yaml`) — รอบนั้นเน้น "มี app layer จริงไหม,
module list ตรงไหม" ระดับ inventory

รอบนี้ต่างออกไป: เจ้าของกำลังจะตัดสินใจ **ซื้อโดเมนจริงเพื่อเปิดขาย** โดยมีเงื่อนไขว่า "พร้อมเปิดโดเมนต้องแปลว่า
พร้อมรับรายได้จริง" — ดังนั้นต้องเช็คลึกระดับ**โค้ด/พฤติกรรมจริง** ไม่ใช่แค่ checkbox หรือคำอธิบายในเอกสาร รวมถึง
ต้อง**รีวิวงานที่เพิ่งสร้างเสร็จวันนี้เอง**ด้วย (ไม่ใช่แค่เชื่อรายงานของ agent ที่สร้างมันขึ้นมา)

ห้ามเชื่อสิ่งต่อไปนี้จนกว่าจะเช็คกับซอร์สโค้ด/รัน test จริง — เอกสาร/ข้อเคลมเหล่านี้อาจถูกหรือผิดก็ได้:

- `products/booking/README.md` เคลมว่า consumer booking flow "manually verified end-to-end" — เช็คว่าโค้ดจริงรองรับ
  เคสนี้ครบไหม (hold → deposit slip upload → status transition) ไม่ใช่แค่เชื่อคำว่า verified
- `docs/platform/SHARED_SAAS_RUNTIME_PROJECT_B_PLAN.md` §4 เขียนว่า booking มี "unresolved remote/local
  migration-history reconciliation" และ "uncommitted platform-admin work" — ยังจริงอยู่ไหม ณ ตอนนี้
- `docs/platform/ROADMAP.md` §0 เขียนว่ามี Supabase credential หลุด (project ref `gyleqrjdzwwlqierdwcy`,
  `coyelzlgukvpgguqpjdi`) ยังไม่ได้หมุน — เช็คเท่าที่ทำได้แบบ read-only (git log, HANDOFF.md, .env.example ไม่ใช่
  .env.local ที่มีค่าจริง — **ห้ามเปิดอ่าน `.env.local` หรือไฟล์ secret ใดๆ ที่มีค่าจริง**)
- `products/line-oa-ai` ใน `modules-hub/INDEX.md` ถูกจัดเป็น "🧪 Pilot/Testing" (ตัวเดียวในทั้งหมดที่ไม่ใช่ ✅
  Completed) — เช็คว่าจริงๆ มันขาดอะไรถึงยังไม่ขึ้น Completed เทียบกับ module อื่นที่ Completed แล้ว
- `products/headless-commerce/server/` และ `products/multi-tenant-ai/server/` **สร้างเสร็จวันนี้โดย AGY→Codex→Qwen
  agent relay** — Qwen รายงานว่า typecheck ผ่าน/test ผ่านและแก้บั๊ก 2 ตัว (malformed JSON → 500 ผิดที่ควร 400,
  import ใหญ่เกิน → 500 ผิดที่ควร 413) — **ต้องรีวิวโค้ดจริงเอง ไม่ใช่แค่เชื่อว่า agent ทำถูก** โดยเฉพาะจุดที่
  Qwen เขียนไว้ว่า "ตัดสินใจไม่แก้" (Stripe webhook ไม่ verify signature เพราะ module payment ไม่มี method — จริงไหม
  ไปดู `modules-hub/modules/payment/` เองว่ามี signature verification ไหมจริงๆ)
- `REVENUE-STRATEGY.md` (ที่ root, ยังไม่ commit) เขียนราคา booking tier "Business ฿2,490/mo" — แต่
  `products/booking/docs/business/PRICING_SPEC.md` (เอกสารที่ CEO อนุมัติแล้วจริง 2026-08-05) มีแค่ Basic ฿490
  กับ Pro ฿990 เท่านั้น ไม่มี tier ฿2,490 — ยืนยันความขัดแย้งนี้อีกครั้งให้ชัด พร้อมเช็คว่ามี doc ราคาอื่นที่ขัดกัน
  แบบนี้ซ่อนอยู่อีกไหมสำหรับ product อื่น (เช่น line_oa_ai, headless_commerce มีเอกสารราคาที่อนุมัติแล้วซ่อนอยู่ไหม
  ที่ REVENUE-STRATEGY.md อาจขัดด้วย)

## งานของคุณ — แบ่ง 5 ส่วน

### ส่วนที่ 1: booking — Phase 0 readiness เช็คจริง (ส่วนสำคัญสุด เพราะเป็นตัวปลดล็อกโดเมน)

ที่ `products/booking/`:
- `supabase/migrations/` — ไล่ดูไฟล์ migration ทั้งหมด เทียบกับที่ README อ้างว่า "applied and verified against
  the live project" — มีไฟล์ไหนดู draft/ไม่สมบูรณ์ไหม มีช่องว่างในลำดับเลขไหม
- อ่านโค้ดจริงของ `apps/booking-consumer` route ที่จัดการ `/book/[slug]` (hold → deposit → status) — ตรรกะครบตามที่
  README เคลมไหม มี error handling ครบไหม มี edge case ที่ไม่ได้ handle ไหม (เช่น หมดเวลา hold 15 นาทีพร้อมกัน,
  อัปโหลดสลิปซ้ำ, ยกเลิกกลางคัน)
- อ่านโค้ด `/api/line/webhook` — HMAC verification จริงไหม (`crypto.timingSafeEqual` ตามที่ README เคลม), ถ้า
  signature ผิดจริง ๆ จะเกิดอะไรขึ้น (reject ถูกไหม หรือ fallback ผ่านไปเงียบๆ)
- `apps/booking-admin` — billing tab ที่เชื่อม Stripe checkout/portal: โค้ดมีจริงไหม เรียก Stripe API ถูก endpoint
  ไหม มี error path ที่ครบไหม หรือแค่โครงเปล่า (README บอกว่า "Launch-1 migration and live Stripe/browser
  verification still pending" — เช็คว่าโค้ดพร้อมรอแค่ verify หรือยังไม่เขียนจริง)
- เช็คว่า quota ตาม `PRICING_SPEC.md` (Basic 100 คิว/5 staff, Pro 500 คิว/10 staff, top-up add-on) ถูก enforce ใน
  โค้ดจริงไหม หรือมีแค่ในเอกสารแต่ไม่มีโค้ด gate จริง
- git log ของ `products/booking/` (ถ้าเป็น git repo แยก เช็คด้วย) — มี commit ไหนที่ยัง uncommitted ตามที่
  `SHARED_SAAS_RUNTIME_PROJECT_B_PLAN.md` §4 เขียนไว้ไหม ระบุ path ไฟล์ที่ยัง uncommitted ให้ชัด

### ส่วนที่ 2: line_oa_ai — ทำไมยังเป็น Pilot ไม่ใช่ Completed

- `modules-hub/modules/line-oa-ai-module/` — เทียบโครงสร้าง/ความสมบูรณ์กับ module อื่นที่ Completed แล้ว (เช่น
  `payment/`, `webhook-receiver/`) — ขาด test coverage ไหม, ขาด adapter ไหน, มี TODO/stub ค้างอยู่ไหม
  (`grep -rn "TODO\|FIXME\|not implemented\|stub" src/`)
- `products/line-oa-ai/server/` — อ่านโค้ดจริง เทียบกับ `PROJECT_HANDOVER_BRIEF.md` และ `TICKET_SERVICE_HANDOFF.md`
  ที่มีอยู่ในโฟลเดอร์นั้น — งานที่เขียนว่าเสร็จ ตรงกับโค้ดจริงไหม
- เคยมีหลักฐานว่าเทสกับ LINE OA sandbox จริงหรือยัง (ไม่ใช่ mock) — หาใน `docs/`, `relay/`, HANDOFF ต่างๆ ว่ามี
  log/screenshot/report การเทสสดจริงไหม หรือมีแต่ unit test ที่ mock LINE API ทั้งหมด

### ส่วนที่ 3: รีวิวโค้ดที่เพิ่งสร้างวันนี้ (headless-commerce/server, multi-tenant-ai/server)

- `products/headless-commerce/server/src/` — อ่านทุกไฟล์จริง (ไม่ใช่แค่ผ่าน test): route handlers, middleware,
  adapters — หา correctness bug, security issue (เช่น path traversal ใน storage adapter, injection ใน CSV
  export, missing input validation), หรือ logic ที่ผิดจาก spec ใน `relay/HANDOFF.md`
- ตรวจ `modules-hub/modules/payment/` เองว่ามี signature-verification method ให้ webhook จริงไหม (Qwen อ้างว่าไม่มี
  — ยืนยัน/หักล้างด้วยการอ่านโค้ดจริง ไม่ใช่เชื่อคำอ้างของ Qwen)
- `products/multi-tenant-ai/server/src/` — เช็คแบบเดียวกัน โดยเฉพาะจุดที่ ROADMAP.md อ้างว่า "subscription
  idempotency" และ "real HMAC-SHA256 Stripe webhook signature verification" ถูก fix แล้ว — อ่านโค้ดจริงยืนยันว่า
  implementation ถูกต้องจริง ไม่ใช่แค่ผ่าน test ที่ coverage ไม่ครบ
- เปิด PR https://github.com/Gutumrod/headless-commerce/pull/1 (หรือ `git log`/`git diff` ของ branch
  `feat/reference-server` ถ้าเข้า GitHub ไม่ได้) แล้ววิจารณ์เหมือน code review จริง — ไม่ต้องนุ่มนวล ระบุปัญหาตรงๆ

### ส่วนที่ 4: cross-check ราคาที่อนุมัติแล้ว vs REVENUE-STRATEGY.md

- หา official pricing doc ที่อนุมัติแล้วจริงสำหรับทุก product ที่จะขายเร็วๆ นี้ (`booking`, `line_oa_ai`,
  `multi_tenant_ai`, `headless_commerce`) — ไม่ใช่แค่ `products/booking/docs/business/PRICING_SPEC.md` เช็คว่า
  product อื่นมีเอกสารราคาที่อนุมัติแล้วซ่อนอยู่ที่ไหนไหม (`docs/business/`, `BRIEF.md`, หรือที่อื่น)
- เทียบทุก tier/ราคาใน `REVENUE-STRATEGY.md` (root ของ `saas-product-hub`) กับเอกสารที่อนุมัติแล้วที่เจอ — ระบุทุก
  จุดที่ขัดกัน ไม่ใช่แค่จุดที่รู้แล้ว (฿2,490 tier)

### ส่วนที่ 5: สรุปความคุ้มค่าจริงต่อราคา (evidence-based, ไม่ใช่ความเห็น)

สำหรับ 4 product ที่จะขายเร็วๆ นี้ (`booking`, `line_oa_ai`, `multi_tenant_ai`, `headless_commerce`) ให้สรุปเป็น
ตารางว่า **จากสิ่งที่เช็คในส่วนที่ 1-3 จริง** — ของที่มีตอนนี้สมเหตุผลกับราคาที่จะขายไหม (อ้างอิงหลักฐานที่เจอ
ไม่ใช่เดา) และช่องว่างที่เหลือ (ถ้ามี) คืออะไรกันแน่แบบเจาะจง ไม่ใช่คำกว้างๆ แบบ "ต้อง polish เพิ่ม"

## รัน git status ก่อนส่งรายงาน

```
git -C D:\AI-Workspace\projects\saas-product-hub log --oneline -10 --branch
git -C D:\AI-Workspace\projects\saas-product-hub status --short --branch
git -C D:\AI-Workspace\projects\modules-hub log --oneline -10 --branch
git -C D:\AI-Workspace\projects\modules-hub status --short --branch
git -C D:\AI-Workspace\projects\saas-product-hub\products\headless-commerce log --oneline -5 --branch
git -C D:\AI-Workspace\projects\saas-product-hub\products\booking log --oneline -10 --branch 2>&1
git -C D:\AI-Workspace\projects\saas-product-hub\products\booking status --short --branch 2>&1
```

ให้รายงานอิงสถานะปัจจุบันจริง ไม่ใช่ snapshot เก่า

## ส่งมอบ — ขอเป็นตาราง + หลักฐานอ้างอิงไฟล์:บรรทัด ไม่ใช่ prose ยาวๆ

รายงาน (เป็นคำตอบสุดท้าย ไม่ใช่ไฟล์แยก) ต้องมี:

1. **booking Phase 0 readiness** — ตาราง: รายการเช็ค | อ้างอิงไฟล์:บรรทัด | สถานะจริง | หลักฐาน
2. **line_oa_ai maturity gap** — รายการเจาะจงว่าขาดอะไรถึงยังไม่ Completed พร้อมอ้างอิงไฟล์
3. **Code review findings** ของ headless-commerce/server และ multi-tenant-ai/server — bug/security issue ที่เจอ
   ใหม่ (ถ้ามี) แยกจากที่ Qwen เจอไปแล้ว ระบุ severity
4. **ตารางราคาที่ขัดแย้งกัน** — product | ราคาที่อนุมัติแล้ว (พร้อมที่มา) | ราคาใน REVENUE-STRATEGY.md | ขัดกันไหม
5. **ตารางความคุ้มค่าจริง** (ส่วนที่ 5) พร้อมหลักฐาน
6. ผล git status/log ทั้งหมดจากคำสั่งด้านบน

จุดประสงค์ของรายงานนี้คือให้ Claude (Commander) เอาไปตัดสินใจว่าจะซื้อโดเมนตอนไหน — เพราะฉะนั้นความแม่นยำสำคัญกว่า
ความเร็ว ถ้าเช็คไม่ทันครบทุกข้อในเวลาที่มี ให้บอกตรงๆ ว่าข้อไหนเช็คไม่ทัน อย่าเดาแทนการเช็ค
