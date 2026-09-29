# Runbook — Lane B live window / BK01 source chain

สถานะ: **SOURCE PACK READY / WINDOW 1 รอ Owner พิมพ์ `GO LIVE WINDOW 1`** · Window 1 จำกัดเฉพาะฐานข้อมูล LAB ตาม source chain ด้านล่างเท่านั้น. ห้ามเปิด Auth hook, สร้าง Auth user, เปลี่ยน Cloudflare Worker/secret หรือออก token; งานเหล่านี้เป็น Window 2 แยกต่างหาก. งาน source-only นี้ไม่ได้เชื่อม LAB, อ่าน secret, apply SQL, ตั้งค่า Dashboard หรือ deploy.

## Source-of-Truth และฐานที่ pin

| ส่วน | branch / base หรือ immutable source |
|---|---|
| BK01 runner source (use for both apply intervals) | `codex/bk01-runner-through-20260928` `53fa72dd6fe72f8ff176ce90028827ff96499837` (based on `42a9c3789f2d7a3be5d703b1b0009529c88bf05f`); `--through` is part of this exact source |
| House live-window source | `codex/house-live-window-integration-20260928` `3713656dc56401895d4b2c99070fad75aa3ef4d8`; issuer and H3C source files below |
| Platform SQL apply tool | `codex/platform-sql-apply-20260929` (tool, ordered manifest, and offline tests in `tools/shared-runtime/platform-sql/`); uses the capture target validator, pinned CA, client factory, and redactor from House `0646a86a795e82a39a739fe08f8bd97f87bf3d9f` |
| House storage grant | same House source SHA; `docs/platform/shared-runtime/storage/house_storage_upload_grants.sql` and `_rollback.sql` |
| H3D static checker | repo `saas-product-hub`, branch `work/house-h3d-h5-20260909`, pinned commit `53346383faa2a87fac483a7a3bf5233a200e295d`, path `tools/shared-runtime/h3d/sql-static-check.mjs` |
| H3D stage contract | commit เดียวกัน: `docs/platform/shared-runtime/fixtures/lane-b-per-stage-allowlist.json` เป็นแหล่ง allowlist เดียว; generated role SQL อยู่ `docs/platform/shared-runtime/runbooks/` |
| BK01 migration stream | `supabase/shared-runtime/bk01-platform-bootstrap.sql` แล้ว migrations ด้านล่าง; forward files frozen |
| House issuer store | `docs/platform/shared-runtime/migrations/house_runtime_issuer.sql` and guarded rollback |
| H3C runtime role allowlist | `docs/platform/shared-runtime/migrations/h3c_runtime_role_allowlist_expansion.sql` and rollback |

ก่อน operator เริ่ม ต้องให้ reviewer อิสระจากผู้เขียนตรวจ SHA ของทุก branch, exact diff, tests/proof ภายนอก repo และ runbook นี้. หาก SHA เปลี่ยนหลัง review ให้หยุดและ review ใหม่.

## 0. เตรียมงานแบบ offline

ใน checkout ที่ pin และสะอาด ติดตั้ง dependency ตาม lockfile โดยปิด lifecycle scripts ก่อนรัน offline checks หรือ capture:

```powershell
Push-Location tools/shared-runtime
try {
  npm ci --ignore-scripts
  if ($LASTEXITCODE -ne 0) { throw "npm ci failed" }
} finally {
  Pop-Location
}
```

Capture ใช้ Supabase Root 2021 CA ที่ pin ใน `tools/shared-runtime/inventory/lane-b-capture-config.json`; CA ที่ขาดหรือ SHA-256 ไม่ตรงต้องถูกปฏิเสธก่อนสร้าง client. ห้ามใช้ certificate ที่ server ส่งมาเป็น trust source.

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
3. ตั้ง `LANE_B_PROJECT_REF`, `LANE_B_DATABASE_URL`, `LANE_B_STAGE=H3D-LIVE` และ `LANE_B_CAPTURE_OUTPUT` ตาม `tools/shared-runtime/inventory/README.md` ด้วยวิธีรับ credential ที่ Owner อนุมัติ แล้วรัน `node tools/shared-runtime/inventory/lane-b-effective-reach.mjs --capture` จาก checkout ของ combined branch ที่ reviewer อนุมัติ. สร้าง `LANE_B_DATABASE_URL` ใน process environment เท่านั้นจาก URI ในแถว LAB ที่อนุมัติ โดยตัด query เดิมทั้งหมดแล้วเติม `?sslmode=verify-full`; ห้ามแก้ `.secrets`, พิมพ์ URL หรือเก็บ URL ลงไฟล์. Preflight ใช้ `pg-connection-string` parser เดียวกับ `pg` และตรวจ effective host, port, user, database ก่อนสร้าง client; ต้องมี `sslmode=verify-full` เพียงตัวเดียวและไม่มี query parameter อื่น. ใช้ CA ที่ pin ใน `lane-b-capture-config.json`, `rejectUnauthorized: true`, และ `servername` เป็น hostname ที่ผ่าน validation ทั้ง client หลักและ cleanup client. target ใช้ direct `db.<ref>.supabase.co` ตามเดิม หรือ Supavisor session pooler ที่ host ตรง `aws-<n>-<region>.pooler.supabase.com`, port `5432`, username `postgres.<ref>` ตรงกับ LAB ref และ database `postgres`. Transaction pooler port `6543`, query parameter อื่น, suffix อื่น, username ref อื่น และ production/foreign ref ต้องถูกปฏิเสธก่อน connect. Measurement role ใช้เป็น subject ของ `has_*_privilege` queries บน admin connection เท่านั้น ห้าม login ด้วย measurement role; ถ้าจำเป็นให้หยุดขอออกแบบ/รีวิวใหม่. Tool สร้าง measurement role หลัง preflight, วัด catalog privileges, revoke/drop role ใน `finally` และตรวจว่า role หาย; ถ้า cleanup ไม่ผ่านจะคืน non-zero และไม่เขียน artifact. Error diagnostic แสดง class/message หลัง redaction credential, host, resolved IP address และ LAB project ref. ห้ามรันคำสั่งนี้ใน source-only review.
4. เก็บ JSON catalog snapshot ของ role attributes/memberships, schema USAGE, relation privileges, function EXECUTE, owners, RLS/policies, triggers และรายการ object ใน `net`/`cron`/`ps01`/`ps01_internal`/`local_service`/`local_service_internal`/`wstera_platform_internal`.
5. บันทึกก่อน snapshot ของ `local_service_internal.schema_migrations`, BK01 allowlist function set, issuer/client rows, H3C `runtime_token_grants`, storage grant registry counts. เก็บเฉพาะ metadata/count/hash ที่จำเป็น ห้าม dump แถวธุรกิจหรือ secret.

**HOLD:** ถ้า pre-snapshot หาย, target ไม่ตรง, role/object inventory อ่านไม่ครบ, มี writer อื่น, preflight/capture ไม่ผ่าน หรือ independent reviewer ยังไม่รับ exact SHA ให้หยุดโดยไม่เปลี่ยนฐาน.

## 2. สร้างสิทธิ์ชั่วคราวเพื่อวัด Lane B

สร้างเฉพาะ role ที่ตรงกับ stage ใน generated H3D runbook จาก pinned commit. ใช้ operator-controlled ephemeral password entry (psql variable/secret input) และ `VALID UNTIL` ไม่เกินเวลาปิด window. ห้ามพิมพ์ password, ส่งผ่าน command-line literal, เก็บในไฟล์ repo หรือเปิดให้ role อื่นใช้.

- ใช้ `lane-b-effective-reach.mjs --capture` สำหรับการวัดและ cleanup role ชั่วคราวอัตโนมัติ. Generated create/teardown SQL ที่ `docs/platform/shared-runtime/runbooks/lane-b-role-*-create.sql` และ `*-teardown.sql` จาก commit `53346383…` เป็น contract reference เท่านั้นสำหรับ flow นี้; ห้ามรันซ้ำหรือสร้าง role เองควบคู่กับ capture. Reviewer ต้องตรวจ contract/exception ของ stage ก่อน window.
- Pair ของ `H3D-LIVE` มี exception เฉพาะที่ระบุใน fixture allowlist. ห้ามเพิ่ม grant/exception เองเพื่อให้ probe ผ่าน.
- W role ที่ได้รับ membership/ownership capability เป็นความสามารถด้าน DDL จริง ไม่ใช่สิทธิ์ DML จำกัด. ใช้เฉพาะช่วงวัดและ teardown ทันที.
- รัน `node tools/shared-runtime/h3d/lane-b-gates.mjs --check` ใน checkout pin ก่อนใช้ generated SQL.

## 3. Apply ตามลำดับ dependency ที่ล็อกไว้

ก่อนแต่ละ mutation ให้ operator ประกาศ step และ reviewer บันทึก go/no-go. Platform SQL ในข้อ 1/3/4/5 ใช้ `apply-platform-sql.mjs`; product migration stream ในข้อ 2/6 ใช้ BK01 runner ที่ pin ไว้ ซึ่งตรวจ `SET LOCAL ROLE bk01_migrator`, operator identity, advisory lock, policy, checksum และ ledger. ห้าม paste product migrations ด้วย `postgres`/Dashboard SQL Editor.

1. ตั้ง `BK01_REPO_ROOT` ไปยัง clean booking worktree ที่ HEAD=`53fa72dd6fe72f8ff176ce90028827ff96499837` และ `PLATFORM_SQL_EVIDENCE_DIR` ไปยังโฟลเดอร์นอก repo. รัน `node tools/shared-runtime/platform-sql/apply-platform-sql.mjs plan`; ตรวจ local_service baseline, ledger, key objects และรายการถัดไป. จากนั้น bootstrap ด้วย `node tools/shared-runtime/platform-sql/apply-platform-sql.mjs apply --file supabase/shared-runtime/bk01-platform-bootstrap.sql --confirm <sha256 จาก plan>`. Tool ตรวจ manifest/checksum/ลำดับก่อนสร้าง client, แล้ว apply ไฟล์เดียวใน transaction เดียว. ถ้า baseline หรือ ledger ชี้ว่ามี BK01 chain เก่าขัดกัน ให้หยุด ห้าม overlay.
2. ที่ BK01 runner source `53fa72dd6fe72f8ff176ce90028827ff96499837`, รัน `npm run db:bk01:plan -- --through 20260927130000_bk01_trial_line_bind.sql`; pending ต้องมี migrations 1–3 ตามตารางด้านล่าง. ใช้ `npm run db:bk01:apply -- --through 20260927130000_bk01_trial_line_bind.sql`; ตรวจ ledger/checksum ทั้งสามรายการ. ห้ามเปลี่ยน source checkout.
3. รัน tool `plan` แล้ว apply House issuer store `docs/platform/shared-runtime/migrations/house_runtime_issuer.sql` ด้วย `--confirm <sha256 จาก plan>`; ยืนยัน role `wstera_runtime_issuer_login` เป็น dedicated `NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS`, มีเพียง client `SELECT`, atomic rate RPC และ audit `INSERT`; snapshot ต้องยืนยันไม่มี product schema usage/table privileges.
4. หลังเก็บ H3C pre-state ให้รัน tool `plan` แล้ว apply `docs/platform/shared-runtime/migrations/h3c_runtime_role_allowlist_expansion.sql` ด้วย `--confirm <sha256 จาก plan>`. Manifest pin ไฟล์นี้เป็น `tx: "self"`; tool ตรวจว่า statement แรกเป็น `BEGIN`, statement สุดท้ายเป็น `COMMIT` และไม่มี transaction control อื่น โดยข้าม string, dollar-quote และ comment จากนั้นส่ง bytes ที่ pin ให้ PostgreSQL ตามตัวอักษรโดยไม่มี wrapper เพิ่ม. เมื่อ query error tool ส่ง `ROLLBACK` และตรวจ protocol status ว่ากลับเป็น idle. ห้ามแก้ SQL หรือ checksum ที่ pin. ห้ามสร้าง Auth user, เปิด hook หรือออก token ใน Window 1.
5. รัน tool `plan` แล้ว apply `docs/platform/shared-runtime/storage/house_storage_upload_grants.sql` ด้วย `--confirm <sha256 จาก plan>`. Manifest pin ไฟล์นี้เป็น `tx: "self"` และใช้ structural check, exact-source execution กับ rollback verification เช่นเดียวกับข้อ 4; ห้าม rewrite SQL หรือ checksum ที่ pin. ยืนยัน initial map มีเฉพาะ `bk01_runtime -> bk01` และ `(bk01,deposit-slips)`; source ต้องปฏิเสธ pre-existing grants ที่ rollback ต้องถอนได้. BK01 migration ข้อ 6 ซึ่งขึ้นกับ House registration RPC ให้ทำต่อเมื่อข้อ 5 ผ่าน.

ทุก `apply` ต้องตามหลัง `plan` ล่าสุดไม่เกิน 15 นาทีและตรงกับ project ref, file, SHA, tool SHA และลำดับใน `latest-plan.json` ภายใต้ evidence folder. ผล plan เป็น read-only. Apply บันทึก JSON ต่อไฟล์ไว้นอก repo; error ถูก redact ด้วยกฎเดียวกับ capture. ห้ามตั้ง `PGOPTIONS`. รายการ `tx: "wrap"` ใช้ transaction wrapper ของ tool และ `SET LOCAL statement_timeout`; รายการ `tx: "self"` ต้องมี BEGIN/COMMIT ที่ผ่าน structural check, รัน source bytes ตามตัวอักษรโดยไม่มี wrapper หรือ SQL rewrite และยืนยัน protocol status กลับเป็น idle หลัง COMMIT หรือ ROLLBACK. Client factory คง timeout ที่กำหนดไว้โดยไม่แทรก statement เข้า SQL ที่ pin.
6. คง BK01 runner source SHA เดิม `53fa72dd6fe72f8ff176ce90028827ff96499837`; `npm run db:bk01:plan` ต้องแสดง pending เพียง `20260928120000_bk01_house_upload_grants.sql` เพราะ migration นี้เรียก House registration RPC จากข้อ 5. ตรวจ checksum แล้วรัน `npm run db:bk01:apply` โดยไม่ระบุ `--through`; plan/apply ซ้ำต้องเป็น no-op. Ledger หลังจบต้องมีครบ 4 migration.

ใช้เฉพาะ migration runner/platform procedure ที่ระบุและ credential LAB ที่ Owner อนุญาตหลัง GO; ห้าม paste product migration ผ่าน Dashboard SQL Editor. Window 1 ห้าม deploy Worker, เปิด Auth hook, สร้าง Auth user, ตั้ง/อ่าน Worker secret หรือออก token. Probe ที่ต้องมี token/session ใหม่ให้หยุดเป็น UNMEASURED และเลื่อนไป Window 2; ห้ามทำ Auth setup เพื่อให้ probe ผ่าน.

### BK01 migrations ที่เพิ่มจาก baseline ที่ pin

| ลำดับ | ไฟล์ | SHA-256 |
|---:|---|---|
| 1 | `supabase/bk01-migrations/20260926120000_bk01_entitlement_packs.sql` | `DB297AE07F1BE3CFBA5EC1D5A1FCA6E194B4D3188082E533A0F976C8ED005998` |
| 2 | `supabase/bk01-migrations/20260927120000_bk01_runtime_route_rpcs.sql` | `744BA05FBEE678CD5B0CF6BEAFC92C43E388432C3B7AF841ACD3BF4043177B92` |
| 3 | `supabase/bk01-migrations/20260927130000_bk01_trial_line_bind.sql` | `7F695E01AFC7BB62B3588DE1330954573895924F3A28D227B6953F8ABB6A6DCE` |
| 4 | `supabase/bk01-migrations/20260928120000_bk01_house_upload_grants.sql` | `B757691AE714416862C7DB647423715C9E8B3738430554BB4F31C53DD4B9C18E` |

House dependency files ที่ต้อง bind กับ `3713656dc56401895d4b2c99070fad75aa3ef4d8`: `house_runtime_issuer.sql` SHA-256 `A56443B43B81CE2587599DF7EF7C8F5DB7EF58CC2A43FC583B37D317A2AAF1DD`; `h3c_runtime_role_allowlist_expansion.sql` SHA-256 `E17E8CBC3C0B4DE063510E9D29CA3E1D77C0A9DA2B1013549421480176700D78`; `house_storage_upload_grants.sql` SHA-256 `A14DCEEFEED6DA3911504A522924393D36979D4181B36361149C1106B3B5C4D3`.

## 4. Probe Lane B — expected results ต่อข้อ

เก็บ output ดิบใน external evidence folder และให้ reviewer ตรวจแต่ละผลโดยไม่ใช้สิทธิ์ของผู้ลงมือ.

| เกณฑ์ | Probe | ผลคาดหวัง / STOP |
|---|---|---|
| (ก) ข้ามโปรดักต์ | ใช้ effective reach ที่แยก L1 catalog, L2 object grant, L3 schema USAGE, L4 effective reach; probe role BK01 ต่อ `ps01`/`ps01_internal` และ role PS01 ต่อ `local_service`/`local_service_internal`; รวม schema/table/function privileges | ทุก cross-product L4 = false; privilege-denied ต้องแยกจาก timeout/5xx/measurement unknown. Any USAGE/EXECUTE/write/ownership reach ที่ไม่อยู่ allowlist = STOP. ห้ามสรุปจาก object grant อย่างเดียว.
| (ข) migration ไม่ทำ PS01 พัง | หลัง apply BK01 chain ทำ H3D non-mutating PS01 Customer LINE path smoke ด้วย customer context ผ่าน app path; ทดสอบ cross-shop denial และยืนยันไม่มี direct-DB fallback. ใช้ได้เฉพาะ session/token ที่มีอยู่ก่อน Window 1; ห้ามออก token หรือเปลี่ยน Auth setup ในรอบนี้ | valid request ผ่าน, invalid/cross-shop ถูกปฏิเสธ, no direct DB fallback. หากไม่มี session ที่ได้รับอนุมัติ หรือมี hook/token/app path ใช้ไม่ได้, 5xx/timeout ให้ FAIL/UNMEASURED และหยุด; ห้ามอ้าง PS01 healthy จาก SQL migration success อย่างเดียว.
| (ค) pg_net/cron | effective-reach snapshot โดย schema usage + qualified object OID privileges; เปรียบเทียบกับ pinned `lane-b-per-stage-allowlist.json` | `net` effective set ต้องตรง exact accepted set ของ stage; `cron` schema USAGE ยังคง false, ดังนั้น catalog object grants ที่ไม่มี schema USAGE ห้ามรายงานเป็น reachable. Reach เพิ่ม/ลดไม่อธิบายได้ = STOP.
| (ง) forward BK01 repeat | `npm run db:bk01:apply` ครั้งที่สอง; verify ledger/checksum; rerun (ข), (ก), (ค) probes | migration runner no-op, 4 checksums ไม่เปลี่ยน, PS01 path ยังทำงาน และ probe (ก)/(ค) ไม่ drift. หาก probe (ข) ต้อง setup Auth ใหม่ ให้หยุด UNMEASURED และส่งต่อ Window 2.
| Storage | พยายามขอ registration/grant ด้วย shop อื่น และด้วย bucket อื่นจาก client/runtime BK01; ตรวจผลจาก SQL return/status และ registry โดยไม่อ่านข้อมูลธุรกิจ | ทั้งคู่ถูกปฏิเสธแบบ fail-closed และไม่มี grant row เพิ่ม. หากไม่แยก policy denial จาก timeout/5xx ได้ให้ STOP; ห้ามสลับ bucket หรือ shop เพื่อให้ผ่าน.

การสร้าง Auth user, เปลี่ยน Custom Access Token Hook, ใช้ Worker secret หรือออก token ไม่อยู่ใน Window 1. บันทึกเป็นงาน Window 2 แยก และไม่ทำระหว่าง probe/rollback รอบนี้.

## 5. Snapshot หลังและ rollback

จับ snapshot ชุดเดียวกับก่อน apply ทันทีหลัง probes แล้วเทียบ machine-readable. ความต่างที่อนุญาตได้ต้องอธิบายเป็น exact object/ACL/owner ต่อบรรทัด; drift ที่ไม่คาดคิดให้หยุดและ rollback ตามลำดับด้านล่าง. อย่าแก้ managed ACL โดยตรง.

Rollback operator run order:

สำหรับ rollback ของ platform SQL ในรายการ House ด้านล่าง ต้องตั้ง `PLATFORM_SQL_EVIDENCE_DIR` เดิม แล้วรัน `node tools/shared-runtime/platform-sql/apply-platform-sql.mjs plan` ก่อนทุกไฟล์. ตรวจ `rollback.file` และ `rollback.sha256` ในผล plan ให้ตรงไฟล์ที่ต้องย้อน จากนั้นใช้ `node tools/shared-runtime/platform-sql/apply-platform-sql.mjs rollback --file <rollback.file> --confirm <rollback.sha256 จาก plan>`. Tool ยอมรับเฉพาะคู่ rollback ที่ pin ใน manifest, ใช้ plan สด, ลำดับล่าสุดใน evidence, preflight และ advisory lock; ห้าม paste SQL หรือรัน rollback platform SQL ด้วยช่องทางอื่น. Guard ที่ SQL ส่งกลับเมื่อยังมีข้อมูลเป็น STOP; ห้ามฝืนหรือลบข้อมูล.

1. หยุดการออก signed upload capability และตรวจ grant registry. ห้ามลบ grant row ด้วยมือ; House rollback ปฏิเสธถ้ายังมี active grant/config ที่ไม่ใช่ seed.
2. รัน BK01 rollback `20260928120000_bk01_house_upload_grants.rollback.sql` ด้วย BK01 runner แล้ว House `house_storage_upload_grants_rollback.sql` ด้วย platform SQL rollback command ด้านบน; ทั้งคู่ต้องผ่าน guard และคืนเฉพาะ state ที่ source chain เพิ่ม.
3. เอา BK01 role row ออกจาก `runtime_token_grants`, ตรวจไม่มี BK01 role grant เหลือ แล้วใช้ `h3c_runtime_role_allowlist_expansion_rollback.sql` ด้วย platform SQL rollback command.
4. ใช้ `house_runtime_issuer_rollback.sql` ด้วย platform SQL rollback command หลัง client/rate/audit tables เป็น 0; มันปฏิเสธเมื่อยังมี state. เก็บ dedicated login role/shared schema ไว้ให้ platform owner ตัดสินแยก.
5. รัน BK01 rollback ตามลำดับย้อน timestamp: `20260927130000_bk01_trial_line_bind.rollback.sql`, `20260927120000_bk01_runtime_route_rpcs.rollback.sql`, `20260926120000_bk01_entitlement_packs.rollback.sql`. แต่ละไฟล์ transaction เดียว; ถ้ามีข้อมูลที่ guard ปฏิเสธ **ห้ามฝืน/ลบข้อมูล**.
6. รัน `supabase/shared-runtime/bk01-platform-bootstrap-rollback.sql` ด้วย platform SQL rollback command เฉพาะหลัง product migration ledger กลับเป็น 0; script จะปฏิเสธถ้ายังมี applied migration.
7. Teardown role วัดชั่วคราวด้วย teardown SQL คู่ที่ pinned ไว้. ตรวจ `pg_stat_activity` ไม่มี session ของ role และยืนยัน role ถูก DROP.
8. เก็บ post-rollback snapshot แบบเดียวกับ baseline. ต้องตรงทุก catalog/privilege row ยกเว้นความต่างที่ Owner อนุมัติและบันทึกไว้ก่อน window; mismatch = FAIL, ห้ามปิด PASS.

## 6. ขอบเขต live storage probe

BK01 registration integration และ SQL House ผ่าน source/PGlite gates แล้วตาม SHA ที่ pin ไว้ด้านบน; Window 1 อนุญาต apply SQL บน LAB หลัง GO เท่านั้น. Probe storage ต้องยืนยัน (1) ร้านอื่นถูกปฏิเสธ และ (2) bucket อื่นถูกปฏิเสธ. การพิสูจน์ signed URL/TTL/metadata/successful hosted upload/replay และ failed-upload consumption ยังต้องบันทึกจาก live probe; PGlite ไม่พิสูจน์พฤติกรรม hosted Storage. หากเจอ grant ค้าง ห้าม rollback ฝืน.

## 7. Exit และผู้ตัดสิน

- ผู้ลงมือส่ง SHA ของทุก source branch, pre/post snapshots, migration ledger, logs, probe matrix, rollback proof, และรายการ deviation ให้ reviewer.
- Reviewer ต้องเป็นคนละ agent กับผู้ลงมือ และ bind ผลกับ SHA exact ก่อนให้ PASS ต่อ (ก)–(ง).
- Operator ลบ role วัดชั่วคราวหลัง probe/rollback, ตรวจไม่มี active session และส่งผลให้ Owner.
- สถานะปัจจุบันคือ **SOURCE_READY_PENDING_INDEPENDENT_REVIEW**; เปิด Window 1 ได้หลัง reviewer รับ exact SHA และ Owner พิมพ์ GO เท่านั้น. ห้ามเรียก Lane B/PASS, hosted-ready หรือ production-ready จาก offline evidence.
