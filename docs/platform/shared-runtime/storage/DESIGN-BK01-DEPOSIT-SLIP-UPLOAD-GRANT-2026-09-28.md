# BK01 Deposit Slip Storage Grant — Design and Evidence

วันที่ 2026-09-28 · สถานะ `SOURCE CANDIDATES IMPLEMENTED / INDEPENDENT REVIEW PENDING / NO HOSTED PROOF`

อัปเดตตามคำตัดสินผู้คุม 2026-09-28 (A-9): เลือก allowlist กลาง House ตามคู่ `(product_code,bucket_id)`; RPC รับ bucket แต่ไม่รับ product; House map role จาก JWT claim. Candidate อยู่บน branch รวม `codex/house-live-window-integration-20260928` และ `codex/bk01-live-window-integration-20260928`; ยังห้าม apply hosted.

## ตรวจ source จริง

- BK01 runtime RPC `local_service.authorize_deposit_slip_upload(uuid,text,text,bigint)` ออก `grant_id`, `object_path`, expiry 5 นาที, content type, size และเก็บ SHA-256 ของ grant token ใน `local_service.deposit_slip_upload_grants`.
- BK01 candidate ที่ `c16036d` เรียก `createSignedUploadUrl(grant.object_path)` ด้วย client ที่มี `bk01_runtime` JWT แล้วส่ง `{objectPath, token}` ให้ consumer; browser ใช้ `uploadToSignedUrl`.
- source ใน `@supabase/storage-js` `2.112.0` ที่ติดตั้งอยู่กับ BK01: `src/packages/StorageFileApi.ts` สร้าง URL ด้วย `POST /object/upload/sign/<path>` และ `uploadToSignedUrl` ใช้ `POST /object/upload/sign/<path>?token=...`. Comment ระบุว่า upload ผ่าน signed token ไม่ต้อง `storage.objects` RLS ตอน upload; RLS `INSERT` ใช้ตอนขอ URL ตาม docs.
- BK01 bucket migration กำหนด `deposit-slips` เป็น public, ขนาดสูงสุด 5 MiB, MIME JPEG/PNG/WebP; policy เดิม `anon INSERT` อนุญาตรูปแบบ path กว้างกว่า grant contract.
- เอกสาร Supabase ปัจจุบันระบุ `createSignedUploadUrl` ต้องมี `INSERT` บน `storage.objects`; custom roles ใช้ระบบ RLS เดียวกับบริการอื่นและใช้ JWT claim `role` ใน policy.

### หลักฐานกับข้อจำกัด

| ข้ออ้าง | สถานะ |
|---|---|
| signed upload URL ต้องผ่าน INSERT authorization ในตอนสร้าง | ยืนยันจาก docs ของ Supabase |
| `bk01_runtime` custom role สามารถใช้ Storage | source/docs สนับสนุนรูปแบบ JWT+RLS; **ต้องพิสูจน์ hosted LAB** สำหรับ config จริง |
| upload ที่ใช้ signed token ไม่ได้ประเมิน RLS ซ้ำ | ยืนยันจาก comment ใน storage-js ที่ติดตั้ง; ยังไม่ใช่หลักฐาน behavior ของ hosted server |
| signed URL ถูกใช้ครั้งเดียว/หมดอายุ 5 นาที | ไม่พบหลักฐานจาก client source; ห้ามอ้าง. client API ไม่ส่งค่า TTL |
| MIME/ขนาดราย grant ถูกบังคับตอน bytes เข้าจริง | ยังไม่ยืนยันจาก server source/hosted |

## Candidate enforcement ที่เพิ่มบน branch รวม

1. House มี `storage_upload_runtime_roles` ผูก runtime role กับ product และ `storage_upload_bucket_allowlist` เก็บคู่ที่อนุญาต; seed เริ่มแค่ `bk01_runtime -> bk01` กับ `(bk01,deposit-slips)`. ไม่มีช่องรับ `product_code` จาก caller.
2. `register_storage_upload_grant(p_bucket_id,...)` อ่าน JWT role, derive product จาก House map, และปฏิเสธเมื่อไม่มีคู่ allowlist. Registration execute ให้ `bk01_migrator` (owner ของ BK01 SECURITY DEFINER RPC) เท่านั้น; `bk01_runtime` ใช้ narrow Storage policy helper แต่เรียก registration RPC โดยตรงไม่ได้.
3. House policy กับ BEFORE INSERT trigger ตรวจ role/product/bucket คู่เดียวกันและใช้ exact path, unused/unexpired grant, MIME/size; trigger consume อยู่ใน transaction เดียวกับ Storage insert. SQL เพิ่ม storage schema usage/insert ให้ BK01 runtime หลังตรวจ pre-existing grant และ rollback จะถอนเมื่อไม่มีข้อมูลหรือ config นอก seed.
4. BK01 migration `20260928120000_bk01_house_upload_grants.sql` เพิ่มการลงทะเบียน House grant ใน transaction ของ `authorize_deposit_slip_upload`; frozen migrations ไม่เปลี่ยนและ RPC return contract คงเดิม. Route ใช้ exact returned object path และ bucket constant ของ BK01.
5. House isolated proof และ BK01 full-chain PGlite proof ครอบคลุม bucket อื่นปฏิเสธ, BK01 ขอ bucket โปรดักต์อื่นไม่ได้, hypothetical allowlisted product ใช้ bucket ของตัวเองได้, consume/replay denial, rollback guards. หลักฐานเป็น embedded Postgres เท่านั้น.

## ยังไม่ยืนยัน — hosted behavior

SQL candidates ไม่ได้พิสูจน์ว่า hosted Supabase รับ privileges/metadata ตาม stand-in นี้, signed URL TTL/replay, เวลา metadata, หรือ upload pipeline จริง. PGlite จำลอง Postgres trigger/policy ได้ แต่ไม่จำลอง Storage token issuance, signed URL expiration หรือ server metadata. ต้อง independent exact-SHA review และ operator live window แยกก่อนเรียก live-ready.

## Operator proof ที่ต้องเตรียมหลัง contract ตกลง

LAB only. Snapshot bucket/RLS/policy/trigger/function hashes; สร้าง grant สำหรับ fixture; ตรวจ grant ถูก role ที่อนุมัติเท่านั้น; สร้าง signed URL; upload ไฟล์ถูกต้องหนึ่งครั้ง (PASS); reuse token, upload ซ้ำ, path อื่น, grant expiry, MIME ผิด, ไฟล์เกิน limit และ role อื่นต้อง fail; ตรวจ consume+object row หลังแต่ละกรณี; rollback คืน signatures ก่อนทดลอง. STOP หาก probe ใดต้องใช้ service_role ฝั่ง product หรือแก้ production.

## References

- `supabase/bk01-migrations/20260928120000_bk01_house_upload_grants.sql` and `supabase/rollback/20260928120000_bk01_house_upload_grants.rollback.sql` on the combined BK01 candidate branch.
- `docs/platform/shared-runtime/storage/house_storage_upload_grants.sql` and `docs/platform/shared-runtime/storage/house_storage_upload_grants_rollback.sql` on the combined House candidate branch.
- `scripts/proofs/lane-b/fixtures/house_storage_upload_grants.sql` is a copy for offline full-chain proof; SHA-256 must match the canonical House SQL before proof run.
- `D:/AI-Workspace/runtime/worktrees/bk01-wub/node_modules/@supabase/storage-js/src/packages/StorageFileApi.ts` (`@supabase/storage-js` 2.112.0)
- [Supabase signed upload URL reference](https://supabase.com/docs/reference/python/storage-from-createsigneduploadurl)
- [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase custom roles for Storage](https://supabase.com/docs/guides/storage/schema/custom-roles)
- House H2 shared-runtime boundary and BK01 upload-grant contract in the 2026-09-27 relay design.
