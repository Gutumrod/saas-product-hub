VERDICT: BATCH_APPROVED

REVISION REVIEWED: 857a5d0743821691356b1620a68869b842e19fb6

CHECKS PERFORMED:
- BLK-1: grep พบว่าไม่มี grant-positive `USAGE` บน `user_role`; granted enum set มีตรง 4 ตัวเท่านั้น: `product_status`, `asset_type`, `installation_status`, `installation_source`. ตรวจ source แล้ว `user_role` ใช้เฉพาะ `profiles.role`; production columns ใช้ enum ทั้งสี่ตามที่ระบุ
- BLK-2: ไม่พบ `SET search_path` หรือ search-path assignment ที่ถูกใช้เป็น denial proof; มีเพียง removal note อธิบายว่า probe เดิมใช้ไม่ได้
- BLK-3: billing deny matrix มี probes สำหรับ ownership, effective/transitive membership และ object-level `PUBLIC` ACL ทั้ง `billing_core` และ `billing_core_staging`; มี positive control และ runtime `42501` probes จึงสามารถพิสูจน์หรือหักล้าง denial ได้จริง
- NB-1: quoted Master Plan strings ถูกระบุที่ `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md:896`; ตรวจ source แล้วตรงกับข้อความ R15
- FK caveat: `routers.ts:388,406` เขียนค่า FK ไปยัง `profiles.id`; schema ยืนยัน `uploadedBy` เป็น `ON DELETE RESTRICT` และ `recordedBy` เป็น `ON DELETE SET NULL`. การตัดสินว่าการตรวจ FK ผ่านได้โดยไม่มี privilege/RLS ผลกระทบหรือไม่ ยังยืนยันจาก source อย่างเดียวไม่ได้ และ matrix จัดเป็น live verification item โดยไม่ขยาย grant set
- Git review: commit `857a5d0` เปลี่ยนเฉพาะเอกสาร house-long-run; ไม่มี `apps/hub-web` path เปลี่ยน และไม่มี role/grant/migration/deploy operation
- Working tree: ไม่มี source diff; มีเพียง untracked shared-runtime documents ที่อยู่นอก scope และไม่ได้แก้ไข

FINDINGS:
- Blocking: none
- Non-blocking: FK referential-integrity behavior กับ `public.profiles` ยังต้อง live verification ก่อน R15 apply โดยเฉพาะ PostgreSQL/Supabase RLS configuration และ delete-path behavior
- Non-blocking: `apps/hub-web` ถูก ignore ใน repository จึงไม่มี source git object ให้ bind line-level source claims กับ revision นี้โดยตรง; ตรวจ source จาก workspace ได้ และตรวจแล้วว่า fix commit ไม่มี source path เปลี่ยน

UNSUPPORTED CLAIMS: none

UNTESTED AREAS:
- Live PostgreSQL privilege behavior ของ `hub_web_app`
- FK checks บน `public.profiles` โดยไม่มี privilege บนตารางนั้น
- Actual existence/ownership state ของ `billing_core` และ `billing_core_staging`
- Runtime credential identity และ Worker secret state
- Deployment/rollback execution
- Source files under `apps/hub-web` are workspace-only and absent from the reviewed git object set