## Verdict: `OWNER_DECISION_REQUIRED`

แนะนำให้ Owner อนุมัติ schema remediation แบบ bounded เพิ่มเติม แต่ตอนนี้ยังถือว่าอนุมัติให้ execute ไม่ได้ เพราะ Owner grant เดิมระบุชัดว่า “No redesign or expansion”; การ apply `0007` และสร้าง/apply `0008` เป็น production schema mutation นอก grant เดิม

### A. อนุญาต remediation ไหม?

ควรอนุญาต เพื่อปลด blocker ของ R15 D1 และฟื้น product/fulfillment write path แต่ต้องออกเป็น authorization แยกที่ระบุชัดว่า:

- target คือ Project A เท่านั้น
- อนุญาตเฉพาะ `0007` และ additive `0008`
- ห้าม `db:push`
- ห้าม apply `0002`–`0006`
- ห้ามแตะ billing schema, roles, grants, RLS, secrets, Worker หรือ Cloudflare
- ต้องหยุดทันทีเมื่อ dry-run หรือ verification ล้มเหลว

ปัจจุบัน `product_installations` ไม่มีจริง ขณะที่ D1.2 ต้อง grant บน object นี้ จึงเดิน R15 ต่อไม่ได้  
หลักฐาน: [R15 schema proposal](</D:/AI-Workspace/projects/saas-product-hub/docs/platform/house-long-run/R15-D0-SCHEMA-REMEDIATION-PROPOSAL-2026-09-20.md:55>)

### B. Proposed path ถูกต้องไหม?

ถูกต้องในหลักการ แต่ต้องแก้ถ้อยคำสำคัญ:

1. สร้าง additive `0008` สำหรับ:

   - `installation_status`
   - `installation_source`
   - `product_installations`
   - foreign keys ไป `products` และ `profiles`
   - unique index `product_installations_event_unique`

   ตรงกับ [schema.ts](</D:/AI-Workspace/projects/saas-product-hub/apps/hub-web/drizzle/schema.ts:132>)

2. Apply `0007` ก่อนหรือแยก dry-run ได้ เพราะ `0007` สร้าง fulfillment tables และ enums ของมันเอง

3. Dry-run ต้องแยก transaction ต่อไฟล์:

   - `BEGIN → 0007 → assertions → ROLLBACK`
   - `BEGIN → 0008 → assertions → ROLLBACK`

4. Apply จริงตามลำดับ `0007` แล้ว `0008`

5. ตรวจ tables, columns, enums, indexes, foreign keys และ rerun D0 topology probe

6. ห้ามใช้ `drizzle-kit migrate` หรือ `db:push` บน Project A จนกว่าจะมี migration-history strategy ที่ปลอดภัย เพราะ database ไม่มี `__drizzle_migrations`

Hand-authoring `0008` ยอมรับได้ ไม่ได้บังคับว่าต้องมาจาก `drizzle-kit generate` แต่ต้องเป็น DDL ที่ตรวจเทียบกับ `schema.ts` แบบ column-by-column และผ่าน independent review

การรัน `drizzle-kit generate` ตรงกับ Project A มีความเสี่ยง เพราะไม่มี journal และ schema ปัจจุบันมีตารางที่ถูกสร้างนอก migration system แล้ว อาจสร้าง migration รวมสิ่งที่ไม่ควรแตะทั้งหมด ดังนั้นทางที่ปลอดภัยกว่าคือ hand-author แบบ additive ที่ถูกตรวจ หรือ generate ใน disposable/offline baseline แล้ว review ผลลัพธ์ก่อนนำมาใช้

### C. มีเหตุผลห้าม apply `0007` ไหม?

ไม่พบเหตุผลด้าน target หรือ scope ที่ห้าม apply

ตรวจจากไฟล์จริงแล้ว:

- header ระบุ target เป็น hub-web product database
- ระบุชัดว่าไม่ใช่ WSTERA LAB & CONTROL
- เป็น additive-only
- ใช้ `IF NOT EXISTS` กับ tables/indexes
- enum creation ใช้ duplicate-object handling
- ไม่มี billing reference
- ไม่มี privilege grant/revoke
- ไม่มี RLS mutation

หลักฐาน: [0007 migration](</D:/AI-Workspace/projects/saas-product-hub/apps/hub-web/drizzle/migrations/0007_shared_one_time_fulfillment.sql:1>)

ข้อควรระวังที่ยังต้องตรวจตอน execution: dry-run ต้องยืนยันว่า PostgreSQL ยอมรับทุก statement ใน transaction เดียว และตรวจว่า schema/index/FK ตรงกับ `schema.ts` จริง

### D. `0002`–`0006` ต้องไม่ apply Project A ไหม?

ยืนยันว่าไม่ควร apply

ทุกไฟล์ระบุ target เป็น WSTERA LAB & CONTROL ซึ่งเป็นคนละ project กับ Project A:

- `0002`: control-plane tables
- `0003`–`0006`: work queue changes/RPC/product identity

หลักฐานจาก headers ใน `apps/hub-web/drizzle/migrations/0002` ถึง `0006` และสรุปใน [proposal](</D:/AI-Workspace/projects/saas-product-hub/docs/platform/house-long-run/R15-D0-SCHEMA-REMEDIATION-PROPOSAL-2026-09-20.md:48>)

### E. Billing-deny disposition

คำตอบคือ **A**

หลัง schema gap แก้แล้ว ให้ดำเนิน R15 ต่อโดยบันทึก billing step เป็น:

> absence-invariant asserted; not a DENY PASS; mandatory re-verification when `billing_core` / `billing_core_staging` are created in Project A

ห้ามเลือก B เพราะ WSTERA_LAB เป็น SB01 dev/staging และ hub-web ไม่มี connection path ไปที่นั่น

ห้ามเลือก C เพราะจะปล่อยให้ runtime ใช้ owner credential ต่อไป ทั้งที่ R15 เป็น standing security fix

แต่ A ต้องได้รับ Owner acceptance อย่างชัดเจนก่อนใช้เป็น disposition เนื่องจาก Owner เดิมสั่งว่า schema absence เป็น `INCONCLUSIVE/HOLD` และห้าม reinterpret เป็น DENY PASS  
หลักฐาน: [billing decision request](</D:/AI-Workspace/projects/saas-product-hub/docs/platform/house-long-run/R15-D0-DECISION-REQUEST-BILLING-DENY-2026-09-20.md:93>)

### F. สิ่งที่เกิน Owner grant หรือยังไม่ได้รับอนุญาต

สิ่งเหล่านี้ต้องอยู่ใน authorization ใหม่:

- apply `0007` production
- สร้างและ apply `0008`
- สร้าง/แก้ migration bookkeeping หรือ journal
- commit migration/evidence files
- เปลี่ยน interpretation ของ billing-deny จาก `HOLD` เป็น absence-invariant
- ทำ product/fulfillment runtime acceptance นอก schema verification

สิ่งที่ไม่เกิน scope หากทำตามแผน:

- read-only inspection
- dry-run ใน rolled-back transaction
- post-apply catalog verification
- rerun D0 probe
- ไม่แตะ billing schemas หรือ WSTERA_LAB

## Blocking findings

1. `product_installations` และ fulfillment tables ไม่มีใน Project A
2. D1.2 จึงล้มด้วย `42P01`
3. ไม่มี `__drizzle_migrations`
4. Billing-deny ปัจจุบันยังไม่ใช่ valid DENY proof
5. Schema remediation ยังไม่มี explicit Owner authorization

## Non-blocking findings

- `0007` target ถูกต้องและ additive/idempotent
- `0002`–`0006` target ผิดสำหรับ Project A
- ไม่มี code path จาก hub-web ไป WSTERA_LAB
- ไม่มี business billing data ใน schemas ที่ตรวจพบ
- การ rerun D0 หลัง remediation เป็นขั้นตอนที่เหมาะสม

## Unsupported claims / ยังห้ามสรุป

- ยังไม่มีหลักฐานว่า `0008` ที่ยังไม่ถูกสร้างจะ generate ได้สมบูรณ์
- ยังไม่มีหลักฐานว่า dry-run `0007`/`0008` ผ่านจริง
- ยังไม่มีหลักฐานว่า post-apply columns, indexes, FK และ enum values ตรงครบ
- ยังไม่มี valid billing DENY evidence
- ยังไม่มี production readiness หรือ live fulfillment proof

## Untested areas

- ไม่มีการเปิด write transaction
- ไม่มีการ apply migration
- ไม่มีการตรวจ PostgreSQL execution ของ DDL ใน transaction จริง
- ไม่มีการทดสอบ Worker หลัง schema remediation
- ไม่มีการทดสอบ product installation webhook หรือ fulfillment flow จริง
- ไม่มีการตรวจ migration runner behavior หลังไม่มี journal

สรุป: **authorize ได้ในเชิง recommendation แต่ยัง execute ไม่ได้จน Owner ออก bounded schema-remediation authorization และรับรอง disposition A อย่างชัดเจน**

