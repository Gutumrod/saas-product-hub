# Handoff — saas-product-hub

## 2026-08-27 — Seven-product production master plan

CEO approved the engineering-only production plan for the final seven products: subscription SaaS
BK01/PS01/LK01/DC01 and one-time source products MT01/CM01/HC01. The plan explicitly excludes
prices, revenue targets, budgets, forecasts, and other financial planning; those remain in the
CEO's separate plan.

Canonical execution document:
`docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md`

Centralized billing architecture remains governed by the already locked
`docs/platform/BILLING_CORE_PLAN.md`: BK01 keeps its existing isolated Stripe implementation;
PS01/LK01/DC01 use billing-core according to that document. Do not invent a parallel billing
architecture.

Next authorized implementation checkpoint is **P0-C1 — Release foundation ready**. Before changing
any product, refresh the named repository's default-branch baseline and follow that repository's
own AGENTS/CLAUDE instructions and approval gates.

### Clean-slate re-audit revision

Codex reran a fresh intake after the initial plan instead of trusting prior status reports. Evidence:
`docs/platform/PORTFOLIO_REAUDIT_2026-08-27.md`.

New hard facts that P0 must address:

- `hub-web` is a separate private repo (`Gutumrod/hub-web`) and is now a first-class platform gate;
- BK01 currently fails clean lint/build and still has no application test suite;
- PS01 builds but its TypeScript phase tests have no installed runner or standard `test` script;
- DC01 automated gates pass, but manual Chrome/Edge print Gate 3 and a critical tool advisory remain;
- HC01 PR #1 is open, demo-only, has dependency findings, and reproducibly passes 13/14 tests on the
  audit host;
- Hub product events use one shared HMAC secret without signer-to-product binding;
- a Supabase service-role/secret key is project-wide and bypasses RLS, so billing-core must use the
  narrow PawSpace ingress amendment now recorded in `BILLING_CORE_PLAN.md`.

`docs/platform/PRODUCTION_LAUNCH_PLAN_2026-08-27.md` is preserved as a supplemental independent
review only. It cannot override the master plan or the CEO's separate financial plan.

วันที่: 2026-08-25
สรุปงานที่ทำในเซสชันนี้ (ต่อเนื่องจาก 2026-08-24): เจอ/แก้เอกสาร wstera.com ที่บันทึกผิด, ตัด customer signup ออกจาก apps/hub-web, ย้าย apps/hub-web ไป Cloudflare Workers ทั้งหมด, rotate DB password ที่ค้างมาตั้งแต่ incident 2026-08-15, ถอด Vercel ออก

เอกสารนี้แทนที่ฉบับ 2026-08-15 ทั้งหมด — เนื้อหาเก่าล้าสมัยแล้ว (README/todo.md ที่เคยพูดถึงแก้ไปหมดแล้ว, service_role key ที่เคยบอกว่ายังไม่ rotate ก็ rotate ไปแล้วตั้งแต่ 2026-08-20, DB password ที่เคยบอกว่า "ยังไม่ทำ" ก็ปิดจบวันนี้)

## 1. สถานะ apps/hub-web ตอนนี้

**Production เดียวคือ Cloudflare Workers:** `https://wstera.com` — custom domain ผูกสำเร็จ 2026-08-25 (`wrangler.jsonc` route + redeploy, zone active อยู่แล้วในบัญชี Cloudflare) ทดสอบ live ครบ (`/`, SPA routes, tRPC health check, DB query จริง) URL ชั่วคราวเดิม `hub-web.titazmth.workers.dev` ปิดอัตโนมัติแล้ว (ปกติของ Cloudflare เมื่อมี custom domain)

**Vercel ถอดออกแล้ว 2026-08-25:** `api/index.ts`, `vercel.json` ลบออกจาก repo แล้ว (commit `45fb7b7`) ตัว Vercel project เอง (`service-booking-saas`) ยังไม่ได้ลบ — ต้องเข้า vercel.com ลบเองที่ Settings → Delete Project (API คืน 403 บน plan Hobby)

**Auth เปลี่ยนสถาปัตยกรรม 2026-08-24 (commit `7d7bb3b`):** Hub ไม่รัน customer signup เองแล้ว — `AuthModal.tsx` และ `/account` ถูกลบ เหลือแค่ `Login.tsx` สำหรับ admin/staff เข้าจัดการ catalog เท่านั้น แต่ละโปรดักต์ (booking ฯลฯ) ต้องมีระบบสมัครสมาชิกของตัวเอง Hub แค่บันทึกว่า "ลูกค้าคนนี้ใช้โปรดักต์อะไรบ้าง" ผ่านตารางใหม่ `product_installations` (2 ทาง: บันทึกมือที่ `/admin/customers`, หรือ webhook `POST /api/webhooks/product-events` ที่ยังไม่มีโปรดักต์ไหนยิงจริง)

**Pricing:** ดึงออกมาเป็น `<PricingSection>` component ใช้ซ้ำได้ — `Home.tsx` (`/products/service-booking`) อ่าน `ctaUrl` จริงจาก DB แทนการเปิด signup modal เดิม (ตอนนี้ยังว่าง เพราะยังไม่มีสินค้าจริงใน DB → ปุ่มขึ้น "เร็วๆ นี้" ทุกปุ่ม)

## 2. ความปลอดภัย — ปิดจบวันนี้ ✅

**DB password ของ `coyelzlgukvpgguqpjdi` (apps/hub-web) rotate สำเร็จจริงแล้ว 2026-08-25** — นี่คือรหัสที่หลุดไปในไฟล์ `products/booking/key.txt` เมื่อ 2026-08-15 (ดูหัวข้อ 3 เดิม) การพยายาม rotate ครั้งแรก 2026-08-20 ล้มเหลวเงียบๆ (ใส่รหัสใหม่ตรงกับรหัสเดิมเป๊ะ) ครั้งนี้ยืนยันด้วยการเชื่อมต่อฐานข้อมูลจริง (`SELECT 1`) ไม่ใช่แค่เชื่อข้อความสำเร็จบนหน้าเว็บ — sync ไปแล้วทั้ง Cloudflare secret และ vault กลาง

**บทเรียนจากรอบนี้ (เผื่อต้อง rotate credential อื่นอีก):** รหัสที่ Supabase สุ่มให้มักมีอักขระพิเศษ (เช่น `%`) ที่ต้อง URL-encode ก่อนใส่ใน connection string ไม่งั้น connect ไม่ติดแบบเงียบๆ (error message จะบอกแค่ "password authentication failed" ทำให้เข้าใจผิดว่ารหัสผิด ทั้งที่จริงคือ encode ผิด) และถ้า copy จากหน้า "Connect" ของ Supabase ต้องเช็คว่าได้แทนที่ placeholder `[YOUR-PASSWORD]` ด้วยรหัสจริงแล้ว ไม่ใช่ copy ทั้ง bracket มาด้วย

**API keys (service_role/anon) ของทั้ง 2 โปรเจกต์ (`gyleqrjdzwwlqierdwcy`, `coyelzlgukvpgguqpjdi`) rotate เสร็จไปแล้วตั้งแต่ 2026-08-20** (ย้ายไป format ใหม่ `sb_publishable_.../sb_secret_...`, ปิด legacy key ยืนยันตายแล้วทั้งคู่) — ไม่ใช่เรื่องใหม่ของวันนี้ แต่บันทึกไว้เผื่อ session ถัดไปงง

**Vault กลาง** (`D:\AI-Workspace\.secrets\keys.txt`) sync ตรงกับของจริงแล้วทุกค่าที่เช็ค — กฎเดิมยังใช้อยู่: ห้าม copy ไฟล์นี้ออกไปที่อื่น อ่านค่าที่ต้องการตรงๆ เท่านั้น

**ข้อควรระวังสำหรับ agent ตัวถัดไป:** ตอนแก้ไฟล์ที่มี secret (เช่น keys.txt) ห้ามใช้ Read tool ดึงทั้งไฟล์/ทั้งบล็อกที่มีค่าจริงออกมาโชว์ในผลลัพธ์ — ใช้ script เทียบ hash หรือ grep เฉพาะชื่อ key (ไม่เอาค่า) แทน เคยพลาดจุดนี้ไปหนึ่งครั้งในเซสชันนี้

## 3. เอกสารที่แก้ไขให้ตรงกับความจริงวันนี้

- `docs/platform/ROADMAP.md` — domain ownership (`wstera.com` เป็นของ Hub ไม่ใช่ booking, แก้ commit เดิมที่บันทึกผิด), gate 1's DB-password half ปิดแล้ว
- `docs/products/registry.yaml` — เพิ่ม note ระดับ platform อธิบายว่า Hub เองไม่ได้อยู่ใน registry (เป็นหน้าร้าน ไม่ใช่สินค้า) และ wstera.com เป็นโดเมนของ Hub
- `apps/hub-web/README.md`, `docs/cloudflare-workers-deployment.md`, `todo.md`, `CLOUDFLARE-MIGRATION-BRIEF.md` — sync กับสถานะจริงหมดแล้ว (ดูหัวข้อ 1)

## 4. ยังไม่ได้ทำ

1. ~~ผูก `wstera.com` เป็น custom domain ของ Worker `hub-web`~~ **เสร็จ 2026-08-25**
2. เพิ่มสินค้าจริงผ่าน `/admin/products` + `/admin/customers` — รอ booking มี URL สมัครจริงก่อน ไม่งั้นปุ่ม CTA จะว่างอยู่ดี
3. ลบ Vercel project เองที่ dashboard (ไม่เร่งด่วน โค้ดถอดออกแล้ว)
