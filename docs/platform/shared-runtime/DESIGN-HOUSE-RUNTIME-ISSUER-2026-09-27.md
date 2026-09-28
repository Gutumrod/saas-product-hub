# House Runtime Token Issuer — Source Design

วันที่: 2026-09-28  
สถานะ: `SOURCE DESIGN / NO HOSTED AUTH CHANGE / NO TOKEN ISSUED`

## Source of Truth

- `docs/platform/shared-runtime/DESIGN-H2-SHARED-RUNTIME-ISOLATION-EXECUTION-BOUNDARY-2026-09-08.md`
- `docs/platform/shared-runtime/migrations/h3c_auth_runtime_token_support.sql`
- `docs/platform/shared-runtime/BLOCKER-H3C-HOSTED-AUTH-FIELD-LEVEL-ACTIVATION-2026-09-09.md`
- `D:/AI-Workspace/runtime/relay/house-20260927/bk01-no-service-role/DESIGN.md` §5
- `D:/AI-Workspace/vault/06-Agent-Logs/WSTERA-House/briefs/codex-parallel-20260927/04-HOUSE-RUNTIME-TOKEN-ISSUER.md`

## ทางเลือกและข้อสรุป

| ทางเลือก | ข้อดี | ความเสี่ยง/ข้อจำกัด | ผล |
|---|---|---|---|
| (a) Supabase Auth identity + Custom Access Token Hook | เป็น H3C ที่มี migration/hook และ proof precedent; Auth เป็นผู้ลงนาม; role ถูกจำกัดด้วย allowlist และ hook จำกัดอายุ | ต้องตั้ง hook ผ่าน Dashboard; ต้อง provision identity และ client secret อย่างปลอดภัย; live issue ยังไม่พิสูจน์ | **เลือก** สอดคล้อง H2 และเก็บ signing authority ไว้กับ Auth |
| (b) House ลงนาม JWT เอง | ไม่พึ่ง Auth hook | House ต้องเก็บ project signing key/legacy JWT secret และดูแล rotation; เพิ่ม blast radius และขัด H2 | **ปฏิเสธ** |

สมมติฐานตั้งต้นสำหรับ source candidate: Cloudflare Worker ของ House เป็น HTTPS façade; จะเรียก Supabase Auth ด้วย identity ที่ provision โดย operator และ publishable key เท่านั้น ไม่มี service_role หรือ signing key ใน Worker. ค่า client secret และข้อมูลยืนยันตัวตนของ identity ต้องอยู่ใน secret store ฝั่ง House, ไม่อยู่ใน repo. Hook เป็น authority สุดท้ายในการกำหนด `role` และ TTL (ไม่เกิน 5 นาทีตาม H3C ปัจจุบัน; เพดาน API 15 นาทีเป็นเพียง upper bound).

## API contract candidate

- `POST /v1/runtime-tokens` เท่านั้น; บังคับ TLS, JSON, request body จำกัดขนาด และ `Cache-Control: no-store`.
- Auth: `Authorization: Basic` ด้วย `client_id:client_secret` ต่อ product; เก็บ verifier ของ secret แบบ salted password hash ใน datastore ของ House; ปฏิเสธ client ที่ disable/หมดอายุและ constant-time compare.
- Request: `{ "audience": "supabase:<project-ref>" }`. ไม่รับ role, user id, TTL, URL หรือ project ref จาก caller.
- Server map แบบ static จาก client record → project, Auth identity, runtime role ที่ allowlist; ห้าม caller เลือก role/product.
- Response: `{access_token, token_type:"Bearer", expires_in}`; ไม่ persist/log token. `expires_in` คำนวณจาก `exp` ใน JWT ที่ได้จริง ไม่เชื่อ metadata OAuth.
- ห้าม refresh token ออกจาก endpoint; เก็บไว้ใน memory เฉพาะคำขอและลบทิ้งเมื่อจบ.
- rate limit ต่อ client และ IP; audit log เก็บ client id, request id, timestamp, outcome และ reason code เท่านั้น ห้ามเก็บ token, password, secret, email หรือ body.
- ปฏิเสธ audience ไม่ตรง, Auth error, response ไม่มี access token/exp, role ไม่ตรง allowlist, token lifetime เกิน 300 วินาที, upstream timeout/5xx; ไม่ fallback.
- Revoke: disable client และระงับ Auth identity/grant ผ่าน operator runbook; token ที่ออกแล้วใช้ได้จน `exp` จึงต้องระบุ residual authority.

## Host selection

เลือก Cloudflare Worker เพื่อให้ endpoint อยู่ใน House platform edge และไม่เพิ่ม service ที่รันใน product. แต่ Worker ยังต้องมี durable rate-limit/audit store ที่ป้องกัน replay/abuse ข้าม isolate. Module Hub `http-client` เป็น generic transport ไม่ได้ implement OAuth token broker หรือ Cloudflare durable state จึงจัดเป็น `REJECT WITH JUSTIFICATION` สำหรับ core issuer; ใช้ native Fetch/Workers APIs ได้เฉพาะเมื่อ reuse review ยืนยันขอบเขตนี้. `auth-supabase` เป็น user authorization helper ไม่ใช่ Auth service token issuer; ไม่ copy มาใช้.

## Operator steps (ห้ามทำจาก source-only task)

1. ยืนยัน target LAB และ snapshot hosted Auth config/hook fields ก่อนการเปลี่ยน.
2. สร้าง LAB-only service identity ใน Supabase Auth Dashboard และตั้งรหัสผ่านแบบสุ่มผ่าน secret manager; ห้ามใช้ service_role.
3. เปิดเฉพาะ Custom Access Token Hook ที่ `pg-functions://postgres/wstera_platform_internal/custom_access_token_hook` หลังตรวจ rollback field-only ใช้ได้.
4. บันทึก grant อายุสั้นเฉพาะ user/role ที่อนุมัติ; เปิด issuer secret ให้ product client เฉพาะในช่วงอนุมัติ.
5. ขอ token ผ่าน endpoint, ตรวจ issuer/audience/role/exp โดยไม่บันทึก token; รัน negative matrix.
6. PASS เมื่อ valid token อายุไม่เกิน 300s ได้ role ที่ตรง mapping และ bad client/audience/role/expired/upstream failure ถูกปฏิเสธทั้งหมด. STOP เมื่อ hook config เปลี่ยน field อื่น, token ออก role ผิด/อายุเกิน, หรือ secret/token หลุด log.
7. Rollback: ปิด client ก่อน, revoke/delete identity/session, ลบ grant, คืน hook field สู่ค่าที่ snapshot ไว้; เฝ้ารอ token หมดอายุก่อนกล่าวว่า authority หมด.

## Blockers before implementation/live proof

- H3C blocker ยืนยันว่าไม่มีช่องทาง field-only hosted Auth config ที่อนุมัติในเครื่อง; ต้องให้ Owner/operator กด Dashboard และยืนยัน rollback.
- ยังไม่มี contract ระบุการ provision/rotation ของ product client secrets และ service identity credential; ต้องตรวจว่าห้ามเก็บรหัส Auth user ระยะยาวใน Worker หรือไม่. หากข้อสรุปต้องใช้ service_role หรือ signing key ให้หยุด implementation ตาม brief.
- ยังไม่มี shared rate-limit/audit backing store ที่ผ่าน reuse gate ใน root repo; ต้องยืนยัน datastore/platform boundary และ retention ก่อนสร้าง.

ผลลัพธ์นี้เป็น design-only และไม่อ้าง issuer, BUILD_PASS, hosted config หรือ token issuance ว่าพร้อมใช้งาน.

