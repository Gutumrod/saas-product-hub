# Handoff — saas-product-hub

วันที่: 2026-08-15
สรุปงานที่ทำในเซสชันนี้: รีวิวโค้ด `apps/hub-web` + ตรวจความพร้อมเปิดเว็บ + เจอและแก้ไข secret รั่ว

## 1. ความปลอดภัย — แก้ไขแล้ว ✅

พบไฟล์ `products/booking/key.txt` มี Supabase `service_role` key + `DATABASE_URL` (มีรหัสผ่าน) ของ 2 โปรเจกต์เก็บเป็น plaintext อยู่ในโฟลเดอร์โปรเจกต์ (ไม่ได้ถูก track ใน git แต่เสี่ยงหลุดถ้ามีการ sync/แชร์โฟลเดอร์)

**ดำเนินการ:**
- ยืนยันว่าทั้ง 2 โปรเจกต์ (`gyleqrjdzwwlqierdwcy` และ `coyelzlgukvpgguqpjdi` / "SaaS Hub") มี backup ครบอยู่แล้วใน vault ตัวจริง `D:\AI-Workspace\.secrets\keys.txt`
- ลบไฟล์ `products/booking/key.txt` ทิ้ง (ไม่มีสำเนาเหลือนอกวอลต์แล้ว)

**กฎใหม่ที่บันทึกไว้ในหน่วยความจำของ agent:** ห้ามคัดลอก/ย้ายเนื้อหาออกจาก `D:\AI-Workspace\.secrets\keys.txt` ไปที่อื่นอีกเด็ดขาด — อ่านจากวอลต์ตรงๆ เท่านั้น (ดูรายละเอียดกฎที่ `memory/secrets-vault-handling.md` ของ agent)

**ยังไม่ทำ / ควรพิจารณาต่อ:** ยังไม่ได้ rotate service_role key ทั้ง 2 ตัว — ไฟล์นอนอยู่ในโฟลเดอร์โปรเจกต์มาตั้งแต่ 14 ส.ค. 11:15 ถ้าไม่มั่นใจว่าไม่เคยหลุดไปที่ไหน ควร rotate ที่ Supabase dashboard เพื่อความชัวร์

## 2. รีวิวโค้ด `apps/hub-web` (เว็บ Hub หลัก)

รัน `tsc --noEmit`, `vite build`, `vitest run` จริงแล้ว — ผ่านหมด (0 type errors, build สำเร็จ, 4/4 tests ผ่าน)

**จุดที่แข็งแรง:**
- Auth verify token ฝั่ง server จริงผ่าน Supabase (`server/_core/context.ts`) ไม่เชื่อ client
- `adminProcedure` บังคับ role ฝั่ง server ทุก mutation (`server/_core/trpc.ts`)
- Owner auto-promote อิงจาก env var ฝั่ง server เท่านั้น ไม่มีช่อง self-promote
- Input validation ด้วย zod รัดกุม (slug regex, mime whitelist, ขนาดไฟล์ cross-check)

**ค้างจากรีวิว — ยังไม่ได้แก้:**
| จุด | ปัญหา |
|---|---|
| `README.md` | อธิบายสถาปัตยกรรมผิด บอกว่าใช้ MySQL/TiDB + Manus OAuth แต่โค้ดจริงย้ายไป Postgres + Supabase แล้ว (ดู commit `859840f`) |
| `todo.md` | Phase 2-7 ติ๊ก `[ ]` ทั้งที่งานทำเสร็จจริงแล้วตาม git log — ทำให้เข้าใจสถานะผิด |
| `server/index.ts` | dead code — ไม่มีใคร import/ใช้เลย (dev/build/start ชี้ไป `server/_core/index.ts` หมด) |
| build output | bundle เดียว 796KB (gzip 232KB) รวม admin code เข้าไปด้วย ไม่มี code splitting |
| `drizzle/` | มีแค่ `schema.ts` ไม่มี migration file ที่ generate ไว้เลย — สร้าง DB ใหม่จาก repo นี้ตรงๆ ไม่ได้ |
| tests | มีแค่ 4 tests ครอบคลุมแค่ `server/products.test.ts` — auth/admin-gate/upload ไม่มี test |

## สรุปความพร้อมเปิดเว็บ

โค้ดหลัก (auth, admin gate, build, deploy config) แข็งแรงพอเปิดได้ แต่แนะนำให้แก้ README กับ todo.md ก่อน (กัน dev/agent คนต่อไปเข้าใจสถานะ/สถาปัตยกรรมผิด) และพิจารณา rotate key ตามข้อ 1
