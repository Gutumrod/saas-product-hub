# Independent investigation task — read-only, do not trust any existing doc

> คำสั่งเดียวกับที่ส่งให้ AGY ไปสำรวจ repo นี้แยกกัน — ห้ามอ่าน `BRIEF-line-oa-ai-integration-2026-08-17.md` ก่อนทำงานนี้ให้เสร็จ (จะทำให้ผลไม่ independent) สำรวจเองจากศูนย์ แล้วเทียบกันทีหลัง

คุณกำลังทำการสำรวจล้วนๆ (investigation only) — **ห้ามแก้ไข สร้าง หรือลบไฟล์ใดๆ ห้ามรัน `npm install`/`npm run build`/`git commit`/`git push` หรือคำสั่งใดที่เปลี่ยนแปลง repo หรือติดตั้ง dependency ห้ามแตะอะไรใต้ `D:\AI-Workspace\.secrets\`** นี่คือการวิเคราะห์อย่างเดียว คำตอบสุดท้ายของคุณคือรายงานที่เขียน ไม่ใช่การแก้โค้ด

## บริบท

มี SaaS product portfolio monorepo อยู่ที่ `D:\AI-Workspace\projects\saas-product-hub` เก็บไอเดียโปรดักต์ 12+ ตัว (`docs/products/registry.yaml` คือ source of truth — อ่านให้ครบก่อน) โดยอิง shared module library ที่ `D:\AI-Workspace\projects\modules-hub` (copy-and-own convention — ก็อปโมดูลเข้า `products/<name>/modules/` ห้าม import ตรงๆ ข้าม repo)

แยกกันไป มีโปรเจกต์ production จริงชื่อ KMO (บอท LINE OA AI ให้ร้านอะไหล่มอเตอร์ไซค์จริง อยู่ที่ `D:\AI-Workspace\projects\kmorackbarcustom.github.io` — **ไม่ใช่ส่วนหนึ่งของ saas-product-hub อย่าไปแตะ**) ที่เจอบั๊กจริง+แก้จริงวันนี้ และ merge เข้า `modules-hub` แล้ว 2 อย่าง:

1. `modules-hub/modules/line-oa-ai-module` — เพิ่ม `respondToGroups` config option (default false) ใน `WebhookHandlerOptions` เพื่อแก้บั๊กบอทตอบในกลุ่ม LINE ที่ไม่ควรตอบ (commit `71e01dd`, merge เข้า `main` แล้ว)
2. `modules-hub/modules/audit-log` — บันทึก production validation notes ใน `MODULE.md` จากการใช้งานจริงกับ KMO รวมถึงพบว่า `AUDIT_LOG_DDL`'s `REVOKE ... FROM PUBLIC` เป็น no-op บน Supabase ที่ role มี direct grant (commit `75fd498`, merge เข้า `main` แล้ว)

## งานของคุณ

1. **อ่าน `docs/products/registry.yaml` ทั้งไฟล์** แล้วเทียบกับ `products/line-oa-ai/` จริง — มี application code จริงไหม (server, package.json กลาง, migration, deploy config) หรือมีแค่โมดูลที่ก็อปมา + brief? เช็คไฟล์ `products/line-oa-ai/modules/line-oa-ai-module/src/handlers/webhook-handler.ts` โดยตรง — มี `respondToGroups` option ไหม มีเช็ค `event.source.type` ไหม (นี่คือวิธีเช็คว่าเวอร์ชันที่ก็อปมาเก่าหรือใหม่กว่า fix วันนี้)
2. **เช็คว่า `audit-log` อยู่ใน `modules:` list ของ `line_oa_ai` ใน registry.yaml ไหม**
3. **อ่าน `HANDOFF.md` ที่ root repo** — มีการบันทึกว่าเคยมี Supabase `service_role` key หลุดเป็น plaintext ใน `products/booking/key.txt` (ลบไปแล้ว) — เช็คว่ามีหลักฐานใน git log หรือเอกสารไหนว่า key ถูก rotate แล้วหรือยัง (2 project: `gyleqrjdzwwlqierdwcy`, `coyelzlgukvpgguqpjdi`)
4. **อ่านทุกไฟล์ `BRIEF-*.md` และ `BRIEF.md`** ทั้งที่ root และใน `products/*/` (glob หา อาจมีมากกว่าที่คิด) เพื่อดูว่างานไหนเสร็จจริง งานไหนยังค้าง — เทียบกับไฟล์จริงในโค้ด อย่าเชื่อ checkbox ในเอกสารเฉยๆ
5. **เช็ค `products/booking-ticket-module`** — อยู่ใน registry.yaml ไหม? อ่าน `README.md`, `PRD.md`, เช็ค `package.json`/`dist/`/git log ว่าสมบูรณ์แค่ไหนจริงๆ
6. **เช็ค `apps/hub-web/README.md` และ `todo.md`** — ยังอธิบายผิดอยู่ไหม (เอกสารเก่าอ้าง MySQL/TiDB + Manus OAuth แต่โค้ดจริงย้ายไป Postgres + Supabase ตั้งแต่ commit `859840f`)
7. **รัน `git log --oneline -20` และ `git status --short --branch`** ทั้งใน `saas-product-hub` และ `modules-hub` เพื่อให้รายงานอิงสถานะปัจจุบันจริง ไม่ใช่ snapshot เก่า

## ส่งมอบ

เขียนรายงาน (เป็นคำตอบสุดท้าย ไม่ใช่ไฟล์) ครอบคลุม:
- สถานะจริงของ `products/line-oa-ai` เทียบกับที่ registry.yaml เคลม (ระบุจุดที่ตรง/ไม่ตรง พร้อมอ้างอิงไฟล์:บรรทัด)
- แผนที่เป็นไปได้ในการเอา fix จาก KMO (group-chat config + audit-log) เข้ามาใช้กับโปรดักต์นี้ ถ้าเจอ blocker จริงให้บอกตรงๆ ไม่ต้องมโนแผนสวยๆ
- สถานะ security เรื่อง service_role key (ข้อ 3) — เน้นให้ชัดถ้ายังไม่มีหลักฐานว่า rotate
- อะไรก็ตามที่เอกสารพูดไม่ตรงกับโค้ดจริงที่เจอเพิ่มเติมนอกเหนือจากที่ถามไว้ — เอกสารในนี้เคยมีประวัติคลาดเคลื่อนจากความจริงมาก่อน ให้สงสัยไว้ก่อนทุกอัน

อย่าเชื่อ claim ไหนในเอกสารจนกว่าจะเช็คกับไฟล์จริง/git log ด้วยตัวเอง
