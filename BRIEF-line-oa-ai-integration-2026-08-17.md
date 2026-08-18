# SaaS Product Hub — LINE OA AI Integration + Doc-Drift Cleanup Brief (2026-08-17)

## 🔄 สถานะ: รอ cross-check จาก Hermes (กำลังสำรวจแยกอิสระอยู่ตอนนี้)

Hermes กำลังสำรวจ repo นี้เองแบบอิสระคู่ขนานอยู่ (โจทย์ที่ให้ไป: `BRIEF-independent-investigation-2026-08-17-for-hermes.md` — ไม่ได้อ่านบรีฟนี้มาก่อน) ผู้ใช้จะเอาผลมาเทียบกับบรีฟนี้ทีหลัง

**สิ่งที่ทำได้เลยตอนนี้ไม่ต้องรอ** (ข้อเท็จจริงที่ Commander เช็คกับไฟล์จริงเองแล้ว ไม่ได้เชื่อ AGY เปล่าๆ ความเสี่ยงต่ำที่จะขัดกับ Hermes): **Package A** (อัปเดต `line-oa-ai-module`) และ **Package D** (ลงทะเบียน `booking-ticket-module` เข้า registry — แค่ส่วนข้อมูลเชิงเทคนิค ไม่ใช่ `commercial_status`) — เริ่มทำได้เลยเพื่อไม่เสียเวลา

**สิ่งที่ต้องรอ Hermes ก่อน**: Package B/C หรือจุดไหนก็ตามที่เกี่ยวกับการตัดสินใจ (`commercial_status`, `acceptance.commercial`) หรือจุดที่ยังไม่ได้ verify ด้วยตัวเอง (เช่นสถานะ rotate key ข้อ 0) — ถ้า Hermes รายงานอะไรที่**ขัดแย้ง**กับบรีฟนี้ ให้ **หยุดทันที ไม่ต้องเดาว่าใครถูก รายงานผู้ใช้** ห้ามเลือกเชื่อฝ่ายใดฝ่ายหนึ่งเอง

---

> เขียนโดย Claude Code (Sonnet 5) — สรุปจาก AGY investigation report ที่ Commander (Claude) ตรวจ cross-check กับไฟล์จริงแล้วทุกจุดสำคัญ (ไม่เชื่อ AGY เปล่าๆ). อีก session หนึ่งกำลังให้ Hermes สำรวจแบบเดียวกันแยกกัน — เทียบ 2 รายงานก่อนเชื่อ 100% ถ้าขัดแย้งกันให้หยุดถามผู้ใช้ ห้ามเลือกเชื่ออันใดอันหนึ่งเอง

## 0. 🚨 อ่านก่อนอย่างอื่น — ความปลอดภัย

`HANDOFF.md` (commit `63e9075`, 2026-08-15) บันทึกว่าเคยมีไฟล์ `products/booking/key.txt` เก็บ Supabase `service_role` key + `DATABASE_URL` แบบ plaintext ของ 2 project (`gyleqrjdzwwlqierdwcy`, `coyelzlgukvpgguqpjdi`) — **ยืนยันแล้วว่าไฟล์ถูกลบจริง** แต่**ไม่พบหลักฐานใดๆ ใน git log หรือเอกสารว่า key ทั้ง 2 ตัวถูก rotate บน Supabase Dashboard จริง** นี่คือความเสี่ยงที่ยังเปิดอยู่ (service_role bypass RLS ทั้งหมด) — **สิ่งแรกที่ session ใหม่ควรทำคือถามผู้ใช้ว่า rotate key ทั้ง 2 ตัวนี้หรือยัง ถ้ายัง ให้ผู้ใช้ไป rotate เองที่ Supabase Dashboard ก่อน (agent ทำแทนไม่ได้ เป็น credential)**

## 1. สถานะจริงของ `products/line-oa-ai/` (ยืนยันจากไฟล์จริงแล้ว ไม่ใช่แค่เอกสาร)

- มีแค่: `BRIEF.md`, `implementation_plan.md` (draft แผนธุรกิจ, ราคา 3 แพ็กเกจ), และ `modules/line-oa-ai-module/` (ก็อปจาก modules-hub วันที่สร้าง 2026-08-14)
- **ไม่มี application layer เลย** — ไม่มี `package.json` กลาง, ไม่มี server, ไม่มี migration สำหรับ schema `line_oa`, ไม่มี deploy config ใดๆ — สถานะเดียวกับที่ `multi-tenant-ai` เคยถูกอธิบายไว้ก่อนแก้ ("modules copied, not yet assembled into an app")
- **โมดูล `line-oa-ai-module` ที่ก็อปมาเป็นเวอร์ชันเก่า** — เช็คไฟล์ [`modules/line-oa-ai-module/src/handlers/webhook-handler.ts`](products/line-oa-ai/modules/line-oa-ai-module/src/handlers/webhook-handler.ts) แล้วยืนยันว่า **ไม่มี** `respondToGroups` option และ **ไม่เช็ค** `event.source.type` เลย — เป็นเวอร์ชันก่อนบั๊ก group-chat จะถูกแก้ (แก้จริงใน `modules-hub` commit `71e01dd`, merge เข้า `main` แล้ว 2026-08-17)
- **`registry.yaml` ไม่ตรงกับความจริง** (`docs/products/registry.yaml` บรรทัด 61-82): เคลม `commercial_status: "beta"` และ `acceptance.commercial: true` ทั้งที่ไม่มี app จริงเลย — เป็น doc drift ชัดเจน ควรแก้เป็นสถานะที่ตรงความจริงกว่า (`prototype`/`discovery`) **แต่ห้าม agent ตัดสินใจเปลี่ยนค่า commercial เอง** ให้ผู้ใช้/coordinator เป็นคนสั่งเปลี่ยนเท่านั้น (ตาม pattern เดียวกับที่ `BRIEF-HERMES-enterprise-features-integration-2026-08-16.md` วางกฎไว้กับ `multi-tenant-ai`)
- `registry.yaml`'s `modules:` list ของ `line_oa_ai` (บรรทัด 73-76) มีแค่ `line-oa-ai-module`, `webhook-receiver`, `ai-provider` — **ไม่มี `audit-log`**

## บริบท: KMO พิสูจน์อะไรมาแล้ววันนี้ (production จริง, ไม่ใช่ทฤษฎี)

Session ก่อนหน้าใช้บอท KMO (ร้านอะไหล่มอเตอร์ไซค์ไทย, live production, `kmorackbarcustom.github.io` — **คนละ repo คนละเรื่อง ไม่เกี่ยวกับ saas-product-hub เลย ห้ามไปแตะ**) เป็น testbed แล้วพบ+แก้บั๊กจริง 2 จุด ซึ่ง merge เข้า `modules-hub` แล้ว:

1. **`respondToGroups` config option** ใน `line-oa-ai-module` — บอทเคยตอบในกลุ่ม LINE ที่ไม่ควรตอบ แก้เป็น config แทน hardcode (`modules-hub` commit `71e01dd`, PR #6)
2. **`audit-log` module + `SupabaseAuditStore` adapter** — เขียน adapter ใหม่ implement `AuditStore` interface ด้วย `@supabase/supabase-js` PostgREST builder แทน raw-SQL adapter เดิม (เพราะ Supabase Edge Functions ไม่มี raw-SQL executor) ทดสอบจริงแล้วว่าใช้งานได้ครบวงจร รวมถึงพบว่า **`AUDIT_LOG_DDL`'s `REVOKE ... FROM PUBLIC` เป็น no-op บน Supabase** เพราะ `service_role`/`anon`/`authenticated` ถือ direct grant ไม่ได้ inherit จาก PUBLIC — ต้อง revoke ระบุ role ตรงๆ (`modules-hub` commit `75fd498`, PR #7, บันทึกไว้ใน `audit-log/MODULE.md` "Production Validation" section แล้ว)

## งานที่ต้องทำ (แบ่งเป็น package ตาม pattern ของ brief เดิมในนี้)

### Package A: อัปเดต `line-oa-ai-module` ให้เป็นเวอร์ชันล่าสุด

- ก็อป `modules-hub/modules/line-oa-ai-module` ทั้งโฟลเดอร์ทับ `products/line-oa-ai/modules/line-oa-ai-module` (copy-and-own ตามกฎเดิม — **ห้ามแก้ใน `modules-hub` เพื่อ shortcut**)
- รัน `npm test` + `npm run typecheck` ในโฟลเดอร์ที่ก็อปมา ให้ผ่านเหมือนต้นฉบับ (23 tests รวม 3 test ใหม่ของ `respondToGroups`)

### Package B: นำ `audit-log` เข้ามา (ถ้าผู้ใช้ตัดสินใจว่าอยากได้ฟีเจอร์นี้ตอนสร้าง app จริง)

- ก็อป `modules-hub/modules/audit-log` เข้า `products/line-oa-ai/modules/audit-log`
- เพิ่ม `"audit-log"` เข้า `modules:` list ของ `line_oa_ai` ใน `registry.yaml`
- **อุปสรรคจริง**: ยังไม่มี host app ให้เรียก `audit.record()` เลย — งานนี้รอจนกว่าจะเริ่มสร้าง application layer จริง (นอกขอบเขตของ brief นี้)
- เมื่อถึงตอนเขียน migration จริงสำหรับ schema `line_oa`: **ใช้บทเรียนจาก KMO** — `revoke update, delete on <table> from public, anon, authenticated, service_role;` ระบุ role ตรงๆ ไม่ใช่ revoke จาก PUBLIC เฉยๆ

### Package C: แก้ `registry.yaml` ให้ตรงความจริง (เอกสารเท่านั้น)

- แก้ `commercial_status`/`acceptance.commercial` ของ `line_oa_ai` — **เสนอค่าที่ควรเป็น แต่ห้ามเปลี่ยนเองโดยไม่ถามผู้ใช้ก่อน**
- เพิ่ม `"audit-log"` เข้า modules list (ถ้าทำ Package B)

### Package D: ลงทะเบียน `products/booking-ticket-module` เข้า `registry.yaml` (ผู้ใช้ระบุว่าสำคัญ ใกล้เสร็จจริง — priority เท่ากับ Package A-C)

ตรวจแล้ว **ไม่ใช่แค่ scaffold** — เป็นแอปที่ใช้งานได้จริง (local-first React, ไม่มี external API):
- 3 workflow ครบ: Intake (`/#/new`), Ticket Detail (`/#/tickets/:id`), History/Retention (`/#/history`)
- มีระบบ theme ที่ host ปรับได้ (`defaultTheme`, `allowThemeSwitch`), รองรับ 2 ภาษา (ไทย/อังกฤษ) เก็บ preference ใน localStorage
- มี `npm run typecheck` / `npm test` / `npm run build` / `npm run e2e` (Playwright) ครบ, `dist/` build ไว้แล้วจริง
- git log: `be37b0a Add host-configurable theme system`, `fdf6608 Initial booking ticket module`
- อ่าน `docs/THEME_INTEGRATION.md` และ `PRD.md` เพิ่มก่อนเขียน registry entry เพื่อเข้าใจ scope เต็มๆ

**งานที่ต้องทำ**: เพิ่ม entry ใหม่ใน `docs/products/registry.yaml` (ตาม schema เดียวกับ product อื่น: key, name, slug, category, tagline, description, deployment_model, commercial_status, wave, path, modules, acceptance) — รัน `npm run typecheck && npm test && npm run build` ในโฟลเดอร์นี้ก่อน เพื่อยืนยันสถานะจริงก่อนตั้งค่า `acceptance.architecture`/`operations` เอง **ห้ามเดา `commercial_status`/`acceptance.commercial` เอง ถามผู้ใช้ก่อน** (กฎเดียวกับ product อื่น)

## จุดคลาดเคลื่อนอื่นที่เจอระหว่างสำรวจ (นอกเรื่อง line-oa-ai แต่ควรรายงานผู้ใช้)

1. **`products/ai-resilience-gateway/BRIEF.md`** ยังอ้างว่า `enterprise-features` ว่างเปล่า — ข้อมูลเก่า ไม่จริงมาตั้งแต่ 2026-08-14 (โมดูลเสร็จแล้ว v0.3.0)
2. **`products/bulk-etl-sync/BRIEF.md`** อ้าง 4 โมดูล แต่ `registry.yaml` list แค่ `import-export` โมดูลเดียว
3. **`apps/hub-web/README.md`** ยังอธิบาย stack ผิด (บอก MySQL/TiDB + Manus OAuth ทั้งที่โค้ดจริงย้ายไป Postgres + Supabase ตั้งแต่ commit `859840f`) — ยังไม่แก้ตั้งแต่ HANDOFF.md ชี้ไว้เมื่อ 2026-08-15
5. **`apps/hub-web/todo.md`** ยัง `[ ]` ว่างทุกช่องทั้งที่ Phase 2-7 ทำเสร็จจริงแล้ว (ผ่าน tsc/build/test)
6. **`apps/hub-web/server/index.ts`** เป็น dead code ไม่มีอะไรเรียกใช้

## กฎที่ต้องยึด (เหมือนกับ brief เดิมในนี้)

1. `modules-hub` เป็น copy-and-own library — ห้ามแก้ในนั้นเพื่อ shortcut ให้ product นี้ใช้งานได้ ก็อปออกมาแก้ที่สำเนาเท่านั้น
2. ห้ามเปลี่ยน `acceptance.commercial`/`commercial_status` เองโดยไม่ถามผู้ใช้
3. ห้าม push ขึ้น `origin` โดยไม่ได้รับอนุญาตชัดเจนจากผู้ใช้ — commit local ไว้พอ
4. ห้ามแตะ KMO repo/Supabase (`kmorackbarcustom.github.io`, `xfhpwxjywqgqefbncumm`, `ybyseaenceyswjnwdmdf`) เรื่องนี้ปิดจบแล้ว ไม่เกี่ยวกับงานนี้
5. ก่อนแก้อะไร ให้ diff เทียบกับรายงานของ Hermes (ถ้ามาถึงแล้ว) ก่อน — ถ้าสองรายงานขัดแย้งกันเรื่องข้อเท็จจริงใด ให้หยุดถามผู้ใช้ ห้ามเลือกเชื่อฝ่ายใดฝ่ายหนึ่งเอง

## รายงานกลับ

รายงานแบบ per-package pass/fail พร้อม diff จริง (`git diff`, ไม่ใช่สรุป) และผล test/typecheck ของ Package A ก่อนทุกครั้ง อย่า commit/push โดยไม่ถามผู้ใช้ก่อน
