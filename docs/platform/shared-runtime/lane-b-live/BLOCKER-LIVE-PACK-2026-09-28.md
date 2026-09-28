# Historical blocker — Lane B live-window pack (2026-09-28)

สถานะปัจจุบัน: **SUPERSEDED AS SOURCE-PACK BLOCKER** โดย `RUNBOOK-LANE-B-LIVE-WINDOW-2026-09-27.md` และ `STATUS-LIVE-PACK-2026-09-28.md`. ข้อความด้านล่างคงไว้เป็นหลักฐานเหตุผลก่อนมี rollback chain/H3D pin; ไม่ใช่สถานะปัจจุบันและไม่ใช่การอนุมัติ live window.

สถานะ `BLOCKED / NO LAB OR PRODUCTION CONNECTION`

## ตรวจฐานตาม sequence update

ฐานสำหรับชุด apply คือ BK01 `c16036d154912ebeb8217bf08ea06044daee8dfd` ซึ่งประกอบด้วย:

1. `supabase/shared-runtime/bk01-platform-bootstrap.sql` และ `bk01-platform-bootstrap-rollback.sql`
2. `supabase/bk01-migrations/20260926120000_bk01_entitlement_packs.sql`
3. `supabase/bk01-migrations/20260927120000_bk01_runtime_route_rpcs.sql`
4. `supabase/bk01-migrations/20260927130000_bk01_trial_line_bind.sql`

ตรวจ tree ที่ commit นี้แล้ว: ไม่มี rollback artifact สำหรับ product migrations ทั้งสามไฟล์. `supabase/bk01-migrations/README.md` กำหนดให้ applied files เป็น immutable และ policy ย้าย authoritative state เพิ่มใน BK01 schemas. ดังนั้น rollback เฉพาะ bootstrap ไม่สามารถคืน state ก่อนเริ่มได้.

## เหตุที่หยุดก่อนเขียนชุดคำสั่ง apply

บรีฟ live-window กำหนด rollback ที่ทดสอบแล้วและ snapshot หลัง rollback ต้องกลับตรงกับก่อน apply. หากสร้าง rollback โดยเดาใน runbook จะเสี่ยงลบ/ย้อน product state โดยไม่มี artifact ที่ผ่าน review; หากเสนอ restore backup ก็ไม่มีหลักฐานว่ามี snapshot/restore path ที่ทดสอบแล้ว. จึงไม่สร้างคำสั่ง mutation ให้ Owner กดจากสมมติฐาน.

อีกประเด็น: tools H3D ที่ระบุอยู่ใน branch `work/house-h3d-h5-20260909`; บน source branch นั้นมี `sql-static-check.mjs` แต่ไม่มี `README.md` ที่ระบุใน search path. ต้องระบุ immutable commit/วิธี pin script ก่อนส่งให้ operator ใช้. ชุด runbook ยังต้องอัปเดต gate ให้รวม migration trial ตาม `c16036d`.

## สิ่งที่ต้องมีเพื่อเดินต่อ

ผู้คุมต้องกำหนด rollback contract ต่อ BK01 migrations ทั้งสามและวิธีสร้าง/restore baseline แบบทดสอบได้; จากนั้นให้ source owner สร้าง rollback/proof ที่ exact chain `c16036d` และให้ reviewer อิสระตรวจ. หลังครบจึงเตรียม SQL editor commands, expected delta, SELECT-only snapshots และ probe.

ไม่มีการต่อ LAB/production, apply migration, grant/role mutation หรือ credential handling ใน work นี้. Evidence offline ที่ `c16036d` = 33/33 เป็นหลักฐาน source-level เท่านั้น ไม่ปิด live criteria ก–ง.
