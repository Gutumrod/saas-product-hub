# Runbook — Lane B live window / BK01 source chain

สถานะ: **SOURCE PACK ONLY / ยังไม่อนุมัติให้เปิด LAB window** · ทุกคำสั่งที่แตะฐานข้อมูลหรือ Dashboard ด้านล่างเป็นคำสั่งสำหรับ operator ในหน้าต่างที่ Owner อนุมัติแยกต่างหากเท่านั้น. งาน Codex รอบนี้ไม่ได้เชื่อม LAB, อ่าน secret, apply SQL, ตั้งค่า Dashboard, deploy Worker หรือออก token.

## Source-of-Truth และฐานที่ pin

| ส่วน | branch / base หรือ immutable source |
|---|---|
| BK01 rollback chain | `codex/bk01-rollback-chain-20260928`, base `c16036d154912ebeb8217bf08ea06044daee8dfd` |
| House issuer + H3C allowlist | `codex/house-runtime-issuer-20260927`; SQL rollback `house_runtime_issuer_rollback.sql` |
| House storage grant | `codex/house-storage-upload-grant-20260927`; BK01 integration เป็น follow-up ที่ยังไม่ทำ |
| H3D static checker | repo `saas-product-hub`, branch `work/house-h3d-h5-20260909`, pinned commit `53346383faa2a87fac483a7a3bf5233a200e295d`, path `tools/shared-runtime/h3d/sql-static-check.mjs` |
| H3D stage contract | commit เดียวกัน: `docs/platform/shared-runtime/fixtures/lane-b-per-stage-allowlist.json` เป็นแหล่ง allowlist เดียว; generated role SQL อยู่ `docs/platform/shared-runtime/runbooks/` |
| BK01 migration stream | `supabase/shared-runtime/bk01-platform-bootstrap.sql` แล้ว migrations `20260926120000`, `20260927120000`, `20260927130000`; forward files frozen |
| House issuer source | `docs/platform/shared-runtime/migrations/house_runtime_issuer.sql`, `h3c_runtime_role_allowlist_expansion.sql`, rollback filesคู่กัน |
| House storage source | `docs/platform/shared-runtime/storage/house_storage_upload_grants.sql` และ `_rollback.sql` |

ก่อน operator เริ่ม ต้องให้ reviewer อิสระจากผู้เขียนตรวจ SHA ของทุก branch, exact diff, tests/proof ภายนอก repo และ runbook นี้. หาก SHA เปลี่ยนหลัง review ให้หยุดและ review ใหม่.

## 0. เตรียมงานแบบ offline

ใน checkout สะอาดที่มี commit H3D ตาม pin:

```powershell
git checkout --detach 53346383faa2a87fac483a7a3bf5233a200e295d
node tools/shared-runtime/h3d/sql-static-check.mjs
node tools/shared-runtime/h3d/tests.mjs
node tools/shared-runtime/h3d/lane-b-gates.mjs --check
```

ผลคาดหวัง: `SQL STATIC CHECK PASS`, H3D tests PASS และ `LANE-B GATES PASS`. หลักฐาน checker ที่ตรวจใน source pack นี้: `node tools/shared-runtime/h3d/sql-static-check.mjs` → PASS บน checkout `53346383…`; lane-b gates → PASS. Static check ไม่ใช่ผลทดสอบสิทธิ์จริงบน LAB.

เตรียม directory หลักฐานนอก repository และบันทึกเวลา UTC, operator, reviewer, project ref แบบไม่ปกปิดตัวตนของ project, SHA ของ branch ทั้งหมด, และชื่อคำสั่ง. ห้ามบันทึก token, password, connection string หรือ secret value.

## 1. ก่อนเปลี่ยนแปลง: snapshot แบบ SELECT-only

Operator ยืนยัน project ref ด้วยช่องทางที่ Owner อนุมัติ แล้วทำ snapshot ก่อน mutation โดยใช้ query จาก pinned H3D source และ query ต่อไปนี้ผ่าน read-only/platform authority:

1. รัน `tools/shared-runtime/h3c/h3c-privilege-snapshot.sql` เพื่อเก็บ PS01 runtime role snapshot ที่ต้องสดไม่เกิน 15 นาทีเมื่อ consume.
2. ก่อน capture ทุกครั้ง ให้รัน read-only `SELECT rolname FROM pg_catalog.pg_roles WHERE rolname LIKE 'lane_b_probe_%' ORDER BY rolname`; ต้องได้ 0 แถว. ถ้าพบ role ใด ให้หยุดแจ้งผู้คุม ห้าม DROP เอง.
3. ตั้ง `LANE_B_PROJECT_REF`, `LANE_B_DATABASE_URL`, `LANE_B_STAGE=H3D-LIVE` และ `LANE_B_CAPTURE_OUTPUT` ตาม `tools/shared-runtime/inventory/README.md` ด้วยวิธีรับ credential ที่ Owner อนุมัติ แล้วรัน `node tools/shared-runtime/inventory/lane-b-effective-reach.mjs --capture` จาก checkout ของ combined branch ที่ reviewer อนุมัติ. Preflight ปฏิเสธ project ref ที่ไม่ใช่ LAB ก่อนสร้าง client/connection; target ใช้ direct `db.<ref>.supabase.co` ตามเดิม หรือ Supavisor session pooler ที่ host ตรง `aws-<n>-<region>.pooler.supabase.com`, port `5432`, username `postgres.<ref>` ตรงกับ LAB ref. Transaction pooler port `6543`, suffix อื่น, username ref อื่น และ production/foreign ref ต้องถูกปฏิเสธก่อน connect. Measurement role ใช้เป็น subject ของ `has_*_privilege` queries บน admin connection เท่านั้น ห้าม login ด้วย measurement role; ถ้าจำเป็นให้หยุดขอออกแบบ/รีวิวใหม่. Tool สร้าง measurement role หลัง preflight, วัด catalog privileges, revoke/drop role ใน `finally` และตรวจว่า role หาย; ถ้า cleanup ไม่ผ่านจะคืน non-zero และไม่เขียน artifact. Error diagnostic แสดง class/message หลัง redaction credential และ host. ห้ามรันคำสั่งนี้ใน source-only review.
4. เก็บ JSON catalog snapshot ของ role attributes/memberships, schema USAGE, relation privileges, function EXECUTE, owners, RLS/policies, triggers และรายการ object ใน `net`/`cron`/`ps01`/`ps01_internal`/`local_service`/`local_service_internal`/`wstera_platform_internal`.
5. บันทึกก่อน snapshot ของ `local_service_internal.schema_migrations`, BK01 allowlist function set, issuer/client rows, H3C `runtime_token_grants`, storage grant registry counts. เก็บเฉพาะ metadata/count/hash ที่จำเป็น ห้าม dump แถวธุรกิจหรือ secret.

**HOLD:** ถ้า pre-snapshot หาย, target ไม่ตรง, role/object inventory อ่านไม่ครบ, มี writer อื่น, preflight/capture ไม่ผ่าน หรือ independent reviewer ยังไม่รับ exact SHA ให้หยุดโดยไม่เปลี่ยนฐาน.

## 2. สร้างสิทธิ์ชั่วคราวเพื่อวัด Lane B

สร้างเฉพาะ role ที่ตรงกับ stage ใน generated H3D runbook จาก pinned commit. ใช้ operator-controlled ephemeral password entry (psql variable/secret input) และ `VALID UNTIL` ไม่เกินเวลาปิด window. ห้ามพิมพ์ password, ส่งผ่าน command-line literal, เก็บในไฟล์ repo หรือเปิดให้ role อื่นใช้.

- ใช้ `lane-b-effective-reach.mjs --capture` สำหรับการวัดและ cleanup role ชั่วคราวอัตโนมัติ. Generated create/teardown SQL ที่ `docs/platform/shared-runtime/runbooks/lane-b-role-*-create.sql` และ `*-teardown.sql` จาก commit `53346383…` เป็น contract reference เท่านั้นสำหรับ flow นี้; ห้ามรันซ้ำหรือสร้าง role เองควบคู่กับ capture. Reviewer ต้องตรวจ contract/exception ของ stage ก่อน window.
- Pair ของ `H3D-LIVE` มี exception เฉพาะที่ระบุใน fixture allowlist. ห้ามเพิ่ม grant/exception เองเพื่อให้ probe ผ่าน.
- W role ที่ได้รับ membership/ownership capability เป็นความสามารถด้าน DDL จริง ไม่ใช่สิทธิ์ DML จำกัด. ใช้เฉพาะช่วงวัดและ teardown ทันที.
- รัน `node tools/shared-runtime/h3d/lane-b-gates.mjs --check` ใน checkout pin ก่อนใช้ generated SQL.

## 3. Apply ตามลำดับที่ล็อกไว้

ก่อนแต่ละ mutation ให้ operator ประกาศ step และ reviewer บันทึก go/no-go. ใช้ platform migration runner ที่กำหนดให้; ห้าม paste product migrations ด้วย `postgres`/Dashboard SQL Editor เพราะ runner ต้องตรวจ `SET LOCAL ROLE bk01_migrator`, operator identity, advisory lock, policy, checksum และ ledger.

1. Apply House-only issuer migration `house_runtime_issuer.sql` หลังตรวจ role `wstera_runtime_issuer_login` เป็น dedicated `NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS`, จำกัดสิทธิ์แค่ client `SELECT`, atomic rate RPC, audit `INSERT`; snapshot ต้องยืนยันไม่มี product schema usage/table privileges.
2. Apply `h3c_runtime_role_allowlist_expansion.sql` หลังบันทึก H3C pre-state. มันเพิ่มเฉพาะ `bk01_runtime` และคง cap ไม่เกิน 300 วินาที.
3. Bootstrap BK01 ด้วย `supabase/shared-runtime/bk01-platform-bootstrap.sql` ผ่าน platform bootstrap procedure ที่อนุมัติ.
4. รัน `npm run db:bk01:plan` และตรวจว่ามีเพียง 3 migration ที่ระบุ. เมื่อ reviewer เซ็น expected filenames/checksum แล้วรัน `npm run db:bk01:apply` กับ credential ที่ Owner จัดให้เฉพาะ process นี้.
5. ตรวจ `schema_migrations` ว่ามี 3 filenames/hash ที่คาด และเรียก `npm run db:bk01:apply` ซ้ำอีกครั้งเพื่อทดสอบ idempotent no-op. หากมี pending/unknown migration ให้หยุด.
6. **ห้าม apply Storage grant SQL ใน pack ปัจจุบัน:** BK01 ยังไม่ได้เรียก House registration RPC ตามสเปก `README-BK01-UPLOAD-GRANT-FOLLOWUP.md`. ทำได้หลัง follow-up implementation + independent review + PGlite/source gates + Owner เปิด scope ใหม่เท่านั้น.

ห้าม deploy Worker หรือออก Auth token ใน window นี้จนกว่าจะมี deployment/auth runbook ที่ Owner อนุมัติแยก. ชุด issuer ปัจจุบันเป็น source-only.

## 4. Probe Lane B — expected results ต่อข้อ

เก็บ output ดิบใน external evidence folder และให้ reviewer ตรวจแต่ละผลโดยไม่ใช้สิทธิ์ของผู้ลงมือ.

| เกณฑ์ | Probe | ผลคาดหวัง / STOP |
|---|---|---|
| (ก) ข้ามโปรดักต์ | ใช้ effective reach ที่แยก L1 catalog, L2 object grant, L3 schema USAGE, L4 effective reach; probe role BK01 ต่อ `ps01`/`ps01_internal` และ role PS01 ต่อ `local_service`/`local_service_internal`; รวม schema/table/function privileges | ทุก cross-product L4 = false; privilege-denied ต้องแยกจาก timeout/5xx/measurement unknown. Any USAGE/EXECUTE/write/ownership reach ที่ไม่อยู่ allowlist = STOP. ห้ามสรุปจาก object grant อย่างเดียว.
| (ข) migration ไม่ทำ PS01 พัง | หลัง apply BK01 chain ทำ H3D non-mutating PS01 Customer LINE path smoke: Auth-issued short-lived role `ps01_line_runtime` → customer context → quote ผ่าน app path; ทดสอบ cross-shop denial และยืนยันไม่มี direct-DB fallback | valid request ผ่าน, invalid/cross-shop ถูกปฏิเสธ, no direct DB fallback. หาก hook/token/app path ใช้ไม่ได้หรือมี 5xx/timeout ให้ FAIL/UNMEASURED; ห้ามอ้าง PS01 healthy จาก SQL migration success อย่างเดียว.
| (ค) pg_net/cron | effective-reach snapshot โดย schema usage + qualified object OID privileges; เปรียบเทียบกับ pinned `lane-b-per-stage-allowlist.json` | `net` effective set ต้องตรง exact accepted set ของ stage; `cron` schema USAGE ยังคง false, ดังนั้น catalog object grants ที่ไม่มี schema USAGE ห้ามรายงานเป็น reachable. Reach เพิ่ม/ลดไม่อธิบายได้ = STOP.
| (ง) forward BK01 repeat | `npm run db:bk01:apply` ครั้งที่สอง; verify ledger/checksum; rerun (ข), (ก), (ค) probes | migration runner no-op, 3 checksums ไม่เปลี่ยน, PS01 path ยังทำงาน และ probe (ก)/(ค) ไม่ drift. ถ้า code path ต้องใช้ Auth hook ต้องมี operator-approved H3C action ด้านล่างครบ.

**H3C Owner action เฉพาะเมื่อมีหน้าต่าง Auth แยกและ authorization:** สร้าง Auth service user แยกสำหรับ BK01 ผ่านขั้นตอนที่ Owner ควบคุม; grant เฉพาะ `bk01_runtime`; เปิด Custom Access Token Hook ที่ reviewed function เท่านั้น; เก็บ password เป็น Cloudflare Worker Secrets `BK01_AUTH_EMAIL` / `BK01_AUTH_PASSWORD` และไม่ใส่ใน repo/log. ตรวจ token โดยไม่พิมพ์หรือบันทึก token: subject/issuer/audience/role ถูกต้อง, expiry ≤300s. ปิด hook, revoke session/grant และลบ identity เมื่อจบ; รอ expiry bound ก่อนยืนยันว่า token หมดอายุ. หากทำขั้น Dashboard/secret อย่างปลอดภัยไม่ได้ให้หยุด probe ที่ต้องใช้ token.

## 5. Snapshot หลังและ rollback

จับ snapshot ชุดเดียวกับก่อน apply ทันทีหลัง probes แล้วเทียบ machine-readable. ความต่างที่อนุญาตได้ต้องอธิบายเป็น exact object/ACL/owner ต่อบรรทัด; drift ที่ไม่คาดคิดให้หยุดและ rollback ตามลำดับด้านล่าง. อย่าแก้ managed ACL โดยตรง.

Rollback operator run order:

1. ปิดการออก token/หยุด traffic ที่ใช้ capability ใหม่; revoke dedicated Auth session/grant และเอา Cloudflare Worker Secrets ออก. รอ JWT ≤300s expiry ก่อนรายงาน revoke complete.
2. ถ้า House storage grant ถูก apply ในอนาคต ให้หยุดการออก grant และล้าง/ทบทวน registry ก่อน; `_rollback.sql` ปฏิเสธถ้ายังมี grant rows. ใน source pack นี้ขั้นนี้ยัง HOLD เพราะ integration ยังไม่มี.
3. รัน `supabase/rollback/20260927130000_bk01_trial_line_bind.rollback.sql`, แล้ว `20260927120000_bk01_runtime_route_rpcs.rollback.sql`, แล้ว `20260926120000_bk01_entitlement_packs.rollback.sql` ตามลำดับ. แต่ละไฟล์ transaction เดียว; ถ้ามีข้อมูลที่ guard ปฏิเสธ **ห้ามฝืน/ลบข้อมูล**.
4. รัน `supabase/shared-runtime/bk01-platform-bootstrap-rollback.sql` เฉพาะหลัง product migration ledger กลับเป็น 0; script จะปฏิเสธถ้ายังมี applied migration.
5. เอา BK01 role row ออกจาก `runtime_token_grants`, ตรวจไม่มี BK01 role grant เหลือ แล้วจึงใช้ `h3c_runtime_role_allowlist_expansion_rollback.sql`.
6. ใช้ `house_runtime_issuer_rollback.sql` หลัง client/rate/audit tables เป็น 0; มันปฏิเสธเมื่อยังมี state. เก็บ dedicated login role/shared schema ไว้ให้ platform owner ตัดสินแยก.
7. Teardown role วัดชั่วคราวด้วย teardown SQL คู่ที่ pinned ไว้. ตรวจ `pg_stat_activity` ไม่มี session ของ role และยืนยัน role ถูก DROP.
8. เก็บ post-rollback snapshot แบบเดียวกับ baseline. ต้องตรงทุก catalog/privilege row ยกเว้นความต่างที่ owner อนุมัติและบันทึกไว้ก่อน window; mismatch = FAIL, ห้ามปิด PASS.

## 6. Storage hold ที่ต้องปิดก่อน live upload probe

BK01 registration integration อยู่ในขั้นตอน source-only แยกต่างหากและต้องยึด exact RPC contract จาก `README-BK01-UPLOAD-GRANT-FOLLOWUP.md` กับ SQL House ที่ pin ไว้. ก่อน apply `house_storage_upload_grants.sql` หรือทดลอง signed upload ต้องมี registration call ใน `authorize_deposit_slip_upload` transaction, ปฏิเสธการคืน signed capability เมื่อ registration ล้ม, และมี tests สำหรับ replay/path/MIME/size/expiry/other-role. หลัง reviewer อิสระรับ diff และ Owner อนุมัติ scope ใหม่ ให้เพิ่ม stage แยก: exact signed URL, TTL จริง, metadata ที่ `storage.objects` เห็น, successful upload หนึ่งครั้ง, replay denial, failed upload ไม่ consume, แล้ว rollback หลัง registry ว่าง. PGlite proof ยืนยันเฉพาะ SQL stand-in; ไม่ยืนยัน signed-URL TTL หรือ hosted metadata timing.

## 7. Exit และผู้ตัดสิน

- ผู้ลงมือส่ง SHA ของทุก source branch, pre/post snapshots, migration ledger, logs, probe matrix, rollback proof, และรายการ deviation ให้ reviewer.
- Reviewer ต้องเป็นคนละ agent กับผู้ลงมือ และ bind ผลกับ SHA exact ก่อนให้ PASS ต่อ (ก)–(ง).
- Operator ลบ role วัดชั่วคราวหลัง probe/rollback, ตรวจไม่มี active session และส่งผลให้ Owner.
- สถานะสูงสุดของ pack นี้ก่อน live evidence คือ **SOURCE_PACK_READY_WITH_STORAGE_HOLD**; ห้ามเรียก Lane B/PASS, hosted-ready หรือ production-ready จาก offline evidence.
