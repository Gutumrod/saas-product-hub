# Handoff — saas-product-hub

วันที่: 2026-08-25
สรุปงานที่ทำในเซสชันนี้ (ต่อเนื่องจาก 2026-08-24): เจอ/แก้เอกสาร wstera.com ที่บันทึกผิด, ตัด customer signup ออกจาก apps/hub-web, ย้าย apps/hub-web ไป Cloudflare Workers ทั้งหมด, rotate DB password ที่ค้างมาตั้งแต่ incident 2026-08-15, ถอด Vercel ออก

เอกสารนี้แทนที่ฉบับ 2026-08-15 ทั้งหมด — เนื้อหาเก่าล้าสมัยแล้ว (README/todo.md ที่เคยพูดถึงแก้ไปหมดแล้ว, service_role key ที่เคยบอกว่ายังไม่ rotate ก็ rotate ไปแล้วตั้งแต่ 2026-08-20, DB password ที่เคยบอกว่า "ยังไม่ทำ" ก็ปิดจบวันนี้)

## 1. สถานะ apps/hub-web ตอนนี้

**Production เดียวคือ Cloudflare Workers:** `https://hub-web.titazmth.workers.dev` — deploy สำเร็จ ทดสอบ live ครบ (`/`, SPA routes, tRPC health check, DB query จริง) ยังไม่ได้ผูกโดเมน `wstera.com` (พรุ่งนี้)

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

## 4. ยังไม่ได้ทำ (รอวันพรุ่งนี้ตามที่เจ้าของบอกไว้)

1. ผูก `wstera.com` เป็น custom domain ของ Worker `hub-web`
2. เพิ่มสินค้าจริงผ่าน `/admin/products` + `/admin/customers` — รอ booking มี URL สมัครจริงก่อน ไม่งั้นปุ่ม CTA จะว่างอยู่ดี
3. ลบ Vercel project เองที่ dashboard (ไม่เร่งด่วน โค้ดถอดออกแล้ว)
