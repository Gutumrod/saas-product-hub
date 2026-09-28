# BK01 Deposit Slip Storage Grant — Design and Evidence

วันที่ 2026-09-28 · สถานะ `DESIGN ONLY / IMPLEMENTATION BLOCKED / NO HOSTED PROOF`

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

## Candidate enforcement

1. Policy `INSERT` สำหรับ `bk01_runtime` จำกัด `bucket_id='deposit-slips'`, exact `name` ที่ match grant ที่ยังไม่หมดอายุและยังไม่ consume; ไม่มี `UPDATE`/`DELETE` policy และ `upsert=false`.
2. BEFORE INSERT trigger บน `storage.objects` ทำ atomic check-and-consume กับ capability ของ grant: path ตรง, ไม่หมดอายุ, ยังไม่ใช้, metadata MIME/size อยู่ในขอบเขต; consume ใน transaction เดียวกับ insert เพื่อให้ failure rollback ทั้งคู่. Path จาก BK01 grant เท่านั้น.
3. Test ว่า request ซ้ำ/path อื่น/หมดอายุ/MIME ผิด/ขนาดเกิน/role อื่นถูก deny. Storage server อาจสร้าง/เติม metadata ตาม pipeline ที่ไม่ตรงกับ PGlite mock จึงต้องมี hosted LAB proof.
4. Bucket size/MIME caps คงเป็น defense-in-depth; trigger ต้องตรวจค่าจริงที่ Storage เขียน ไม่เชื่อค่าจาก client โดยลำพัง.

## Blocker — ownership/contract

Grant table ปัจจุบันเป็น `local_service` ของ BK01 แต่ trigger/policy อยู่ใน House-owned `storage` schema. Storage artifact ไม่ควรอ่าน product-private grant table โดยตรง: จะผูก House storage กับ schema ของ product และข้าม platform/product ownership boundary. บรีฟนี้ห้ามแก้ repo booking. จึงยังไม่มีช่องทางให้ BK01 RPC เขียน grant ลง registry ที่ House Storage ใช้ได้โดยไม่เพิ่ม cross-boundary coupling.

ผู้คุมต้องเลือก contract ก่อน implementation: (A) BK01 RPC เรียก House-owned atomic grant RPC ด้วย narrow service boundary, (B) House-owned registry ที่ grant ถูกส่ง/สร้างผ่าน API contract ชัดเจน, หรือ (C) House upload broker. ห้ามเลือกเองใน task นี้.

นอกจากนี้ Storage signed token TTL/replay และ exact metadata timing ต้องตรวจใน LAB live window ก่อนเรียกว่า one-time. PGlite จำลอง Postgres trigger/policy ได้ แต่ไม่จำลอง Storage token issuance, server metadata, signed URL expiration หรือ upload pipeline.

## Operator proof ที่ต้องเตรียมหลัง contract ตกลง

LAB only. Snapshot bucket/RLS/policy/trigger/function hashes; สร้าง grant สำหรับ fixture; ตรวจ grant ถูก role ที่อนุมัติเท่านั้น; สร้าง signed URL; upload ไฟล์ถูกต้องหนึ่งครั้ง (PASS); reuse token, upload ซ้ำ, path อื่น, grant expiry, MIME ผิด, ไฟล์เกิน limit และ role อื่นต้อง fail; ตรวจ consume+object row หลังแต่ละกรณี; rollback คืน signatures ก่อนทดลอง. STOP หาก probe ใดต้องใช้ service_role ฝั่ง product หรือแก้ production.

## References

- `D:/AI-Workspace/runtime/worktrees/bk01-wub/supabase/bk01-migrations/20260927120000_bk01_runtime_route_rpcs.sql` (base `e8a5e5c`)
- `D:/AI-Workspace/runtime/worktrees/bk01-wub/node_modules/@supabase/storage-js/src/packages/StorageFileApi.ts` (`@supabase/storage-js` 2.112.0)
- [Supabase signed upload URL reference](https://supabase.com/docs/reference/python/storage-from-createsigneduploadurl)
- [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase custom roles for Storage](https://supabase.com/docs/guides/storage/schema/custom-roles)
- House H2 shared-runtime boundary and BK01 upload-grant contract in the 2026-09-27 relay design.
