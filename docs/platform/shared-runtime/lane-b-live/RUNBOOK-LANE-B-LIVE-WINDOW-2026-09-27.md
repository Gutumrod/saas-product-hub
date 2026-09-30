# Runbook — Lane B live window / BK01 source chain

สถานะ: **A11 SOURCE CANDIDATE / WINDOW 1 HOLD จน independent review และ Owner GO ใหม่** · Window 1 จำกัดเฉพาะฐานข้อมูล LAB ตาม source chain ด้านล่างเท่านั้น. ห้ามเปิด Auth hook, สร้าง Auth user, เปลี่ยน Cloudflare Worker/secret หรือออก token; งานเหล่านี้เป็น Window 2 แยกต่างหาก. งาน source-only นี้ไม่ได้เชื่อม LAB, อ่าน secret, apply SQL, ตั้งค่า Dashboard หรือ deploy.

## Source-of-Truth และฐานที่ pin

| ส่วน | branch / base หรือ immutable source |
|---|---|
| BK01 runner source (use for product migrations) | `codex/bk01-no-extensions-20260930` `fb455a6d3876dfcb9db31079700e1c0c1bffb4ac`; includes `--through`, five migrations, and per-file apply. `BK01_REPO_ROOT` for platform bootstrap remains the separate booking pin `32df434e1057a83ecbf0c290a659be42f24bbc55`. |
| House live-window source | `codex/house-live-window-integration-20260928` `3713656dc56401895d4b2c99070fad75aa3ef4d8`; issuer and H3C source files below |
| Platform SQL apply tool + A11 manifest | `codex/bk01-no-extensions-platform-20260930` `d807649e1d31d16e0a15faeb03c5bc4376cae59e` (based on A10 tool `09034a362dca079b26023fa188171038a4e893a0`); apply code is unchanged, A11 accepted-ledger pin/proof are in this candidate; capture validator, pinned CA, client factory, and redactor remain House `0646a86a795e82a39a739fe08f8bd97f87bf3d9f` |
| House storage grant | same House source SHA; `docs/platform/shared-runtime/storage/house_storage_upload_grants.sql` and `_rollback.sql` |
| H3D static checker | repo `saas-product-hub`, branch `work/house-h3d-h5-20260909`, pinned commit `53346383faa2a87fac483a7a3bf5233a200e295d`, path `tools/shared-runtime/h3d/sql-static-check.mjs` |
| H3D stage contract | commit เดียวกัน: `docs/platform/shared-runtime/fixtures/lane-b-per-stage-allowlist.json` เป็นแหล่ง allowlist เดียว; generated role SQL อยู่ `docs/platform/shared-runtime/runbooks/` |
| BK01 role prerequisite | `docs/platform/shared-runtime/migrations/h3_bk01_runtime_role.sql` + `_rollback.sql`; manifest order 5, before bootstrap; role-only with no grants |
| BK01 platform SQL source | booking `32df434e1057a83ecbf0c290a659be42f24bbc55` for `BK01_REPO_ROOT`; product runner uses the A11 source pin above |
| BK01 migration stream | `supabase/shared-runtime/bk01-platform-bootstrap.sql` แล้ว migrations 1–5 ด้านล่าง; migration 1 and bootstrap remain frozen |
| House issuer store | `docs/platform/shared-runtime/migrations/house_runtime_issuer.sql` and guarded rollback |
| H3C runtime role allowlist | `docs/platform/shared-runtime/migrations/h3c_runtime_role_allowlist_expansion.sql` and rollback |

A8 ที่ Owner อนุมัติยังมีผล: Window 1 ไม่ทำ PS01 LINE app-path smoke และไม่สร้าง/หา session/token/Auth user; (ข) = `UNMEASURED_APP_PATH (Owner waiver A8)` พร้อมผล PS01 zero-delta ใน `ps01`/`ps01_internal` (นอก DEV-1/DEV-2); พบ delta ให้ STOP. (ง) รันตัวเทียบ zero-delta ซ้ำหลัง apply รอบสอง. ห้ามอ้าง PS01 healthy/PASS.

A10 (บรีฟ 18 vault `04ebb9e`): managed postgres เป็น non-superuser CREATEROLE. Role ที่มีอยู่ต้องมี creator ADMIN row หนึ่งแถวตรง member=postgres, ADMIN=true, INHERIT=false, SET=false, grantor=postgres หรือ supabase_admin; หลัง bootstrap ต้องมี authenticator อีกหนึ่งแถว ADMIN=false, INHERIT=false, SET=true, grantor=postgres. แถวอื่น/ค่าอื่นปฏิเสธ. Recovery หลัง GO ใหม่ใช้ evidence directory ใหม่และ plan สด: role ขั้น 5 อ่านเป็น apply แล้ว, next ต้องเป็น bootstrap; ไม่ต้อง DROP/recreate role. ยังคง pin booking source/runner/capture/SQL/manifest เดิมทั้งหมด.

Role rollback A10 เป็น exception เฉพาะ `bk01-runtime-role` ใน tool: ตรวจ pinned file/checksum/confirm/order/plan/advisory lock ตามเดิม แต่ execute tool-owned guard + `DROP ROLE bk01_runtime` ใน transaction (`executionPolicy=A10_MANAGED_RUNTIME_ROLE_DROP`). **ไม่ execute rollback SQL เดิม** ที่ปฏิเสธ membership ทุกแถว และไม่แก้ bytes/hash ของไฟล์นั้น. Guard ยอมเพียง creator ADMIN row หนึ่งแถว, ต้องไม่มี ownership/direct privilege/dependency; ไม่มีการ REVOKE ADMIN ก่อน DROP. DROP ลบ membership เอง. SQL อื่นรัน frozen bytes ตามเดิม. AGY ต้องรีวิว exception นี้ใน exact tool SHA และรัน PG17 proof ด้วย non-superuser actor; PG16/superuser proof ไม่ทดแทน A10.

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

ก่อนแต่ละ mutation ให้ operator ประกาศ step และ reviewer บันทึก go/no-go. Platform SQL ในข้อ 0/1/3/4/5 ใช้ `apply-platform-sql.mjs`; product migration stream ในข้อ 2/6 ใช้ BK01 runner ที่ pin ไว้ ซึ่งตรวจ `SET LOCAL ROLE bk01_migrator`, operator identity, advisory lock, policy, checksum และ ledger. ห้าม paste product migrations ด้วย `postgres`/Dashboard SQL Editor.

0. **A9 runtime role prerequisite:** ตั้ง `BK01_REPO_ROOT` ไปยัง clean booking worktree ที่ HEAD=`32df434e1057a83ecbf0c290a659be42f24bbc55` และ `PLATFORM_SQL_EVIDENCE_DIR` ไปยังโฟลเดอร์ใหม่ของรอบที่ได้รับ GO. รัน `node tools/shared-runtime/platform-sql/apply-platform-sql.mjs plan`; baseline ที่ยังไม่มี BK01 ต้องเสนอ `h3_bk01_runtime_role.sql` ก่อน bootstrap. ประกาศแล้ว apply ด้วย `--file docs/platform/shared-runtime/migrations/h3_bk01_runtime_role.sql --confirm <sha256 จาก plan>`. SQL สร้างเฉพาะ NOLOGIN/NOINHERIT/non-privileged role + timeout 8s/comment; ไม่มี GRANT. มี role อยู่ก่อนแล้ว SQL ปฏิเสธ; plan ปฏิเสธ attributes/config/membership/dependencies ที่ขัด boundary. ห้ามสร้าง role ด้วย SQL มือหรือแก้ bootstrap เพื่อข้าม guard. หลัง role apply สำเร็จ plan ใหม่ต้องเสนอ bootstrap.
1. คง `BK01_REPO_ROOT` ไปยัง clean booking worktree ที่ HEAD=`32df434e1057a83ecbf0c290a659be42f24bbc55` และ `PLATFORM_SQL_EVIDENCE_DIR` ไปยังโฟลเดอร์นอก repo. รัน `node tools/shared-runtime/platform-sql/apply-platform-sql.mjs plan`; ตรวจ local_service baseline, ledger, key objects และรายการถัดไป. จากนั้น bootstrap ด้วย `node tools/shared-runtime/platform-sql/apply-platform-sql.mjs apply --file supabase/shared-runtime/bk01-platform-bootstrap.sql --confirm <sha256 จาก plan>`. Tool ตรวจ manifest/checksum/ลำดับก่อนสร้าง client, แล้ว apply ไฟล์เดียวใน transaction เดียว. ถ้า baseline หรือ ledger ชี้ว่ามี BK01 chain เก่าขัดกัน ให้หยุด ห้าม overlay.
2. ที่ BK01 runner source A11 pin, apply migration 1, 2, 3 ทีละไฟล์ตาม timestamp: ก่อนแต่ละไฟล์ให้ประกาศชื่อ/SHA, รัน `npm run db:bk01:plan -- --through <ชื่อไฟล์>` และตรวจ pending มีเฉพาะไฟล์นั้น จากนั้น `npm run db:bk01:apply -- --through <ชื่อไฟล์>`; ตรวจ ledger/checksum หลังแต่ละรายการ. ห้ามรวมหลายไฟล์ใน transaction เดียว.
3. รัน tool `plan` แล้ว apply House issuer store `docs/platform/shared-runtime/migrations/house_runtime_issuer.sql` ด้วย `--confirm <sha256 จาก plan>`; ยืนยัน role `wstera_runtime_issuer_login` เป็น dedicated `NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS`, มีเพียง client `SELECT`, atomic rate RPC และ audit `INSERT`; snapshot ต้องยืนยันไม่มี product schema usage/table privileges.
4. หลังเก็บ H3C pre-state ให้รัน tool `plan` แล้ว apply `docs/platform/shared-runtime/migrations/h3c_runtime_role_allowlist_expansion.sql` ด้วย `--confirm <sha256 จาก plan>`. Manifest pin ไฟล์นี้เป็น `tx: "self"`; tool ตรวจว่า statement แรกเป็น `BEGIN`, statement สุดท้ายเป็น `COMMIT` และไม่มี transaction control อื่น โดยข้าม string, dollar-quote และ comment จากนั้นส่ง bytes ที่ pin ให้ PostgreSQL ตามตัวอักษรโดยไม่มี wrapper เพิ่ม. เมื่อ query error tool ส่ง `ROLLBACK` และตรวจ protocol status ว่ากลับเป็น idle. ห้ามแก้ SQL หรือ checksum ที่ pin. ห้ามสร้าง Auth user, เปิด hook หรือออก token ใน Window 1.
5. รัน tool `plan` แล้ว apply `docs/platform/shared-runtime/storage/house_storage_upload_grants.sql` ด้วย `--confirm <sha256 จาก plan>`. Manifest pin ไฟล์นี้เป็น `tx: "self"` และใช้ structural check, exact-source execution กับ rollback verification เช่นเดียวกับข้อ 4; ห้าม rewrite SQL หรือ checksum ที่ pin. ยืนยัน initial map มีเฉพาะ `bk01_runtime -> bk01` และ `(bk01,deposit-slips)`; source ต้องปฏิเสธ pre-existing grants ที่ rollback ต้องถอนได้. BK01 migration ข้อ 6 ซึ่งขึ้นกับ House registration RPC ให้ทำต่อเมื่อข้อ 5 ผ่าน.

ทุก `apply` ต้องตามหลัง `plan` ล่าสุดไม่เกิน 15 นาทีและตรงกับ project ref, file, SHA, tool SHA และลำดับใน `latest-plan.json` ภายใต้ evidence folder. ผล plan เป็น read-only. Apply บันทึก JSON ต่อไฟล์ไว้นอก repo; error ถูก redact ด้วยกฎเดียวกับ capture. ห้ามตั้ง `PGOPTIONS`. รายการ `tx: "wrap"` ใช้ transaction wrapper ของ tool และ `SET LOCAL statement_timeout`; รายการ `tx: "self"` ต้องมี BEGIN/COMMIT ที่ผ่าน structural check, รัน source bytes ตามตัวอักษรโดยไม่มี wrapper หรือ SQL rewrite และยืนยัน protocol status กลับเป็น idle หลัง COMMIT หรือ ROLLBACK. Client factory คง timeout ที่กำหนดไว้โดยไม่แทรก statement เข้า SQL ที่ pin.
6. ที่ BK01 runner A11 pin, apply migration 4 `20260928120000_bk01_house_upload_grants.sql` หลัง House storage step 5 ผ่าน; plan/apply ต้องมีเพียงไฟล์ 4. จากนั้นประกาศและ apply migration 5 `20260930120000_bk01_link_token_no_extensions.sql` แยกไฟล์. ตรวจ ledger/checksum ครบ 5 รายการ; plan/apply ซ้ำต้องเป็น no-op.

ก่อน GO4 ต้องมี local PG17 proof บน A11 branch ด้วย actor `postgres` ที่เป็น non-superuser `CREATEROLE` และ `BYPASSRLS`; scaffold ต้องไม่มี PUBLIC USAGE บน `extensions`, และ `bk01_migrator` ต้องไม่มี USAGE. ใช้ actual BK01 runner apply ทีละ 1–5, execute the affected functions, compare `generate_link_token()` owner/ACL before and after migration 5, check 64-char SHA-256 upload token/hash equivalence, and run `tools/shared-runtime/platform-sql/proofs/bk01-no-foreign-schema-refs.sql`: result set แรกต้องว่าง, result set ที่สองต้องเป็น `link_staff_user` และ `submit_deposit_slip` ที่ owner=`postgres`. ห้ามใช้ extension grant เป็น workaround. จากนั้น static source gate `npm run db:bk01:policy` ต้องยืนยันไม่มี `extensions.` ใน product migration SQL. นี่เป็น local source evidence เท่านั้น ไม่แทน LAB preflight/probe.

ใช้เฉพาะ migration runner/platform procedure ที่ระบุและ credential LAB ที่ Owner อนุญาตหลัง GO; ห้าม paste product migration ผ่าน Dashboard SQL Editor. Window 1 ห้าม deploy Worker, เปิด Auth hook, สร้าง Auth user, ตั้ง/อ่าน Worker secret หรือออก token. Probe ที่ต้องมี token/session ใหม่ให้หยุดเป็น UNMEASURED และเลื่อนไป Window 2; ห้ามทำ Auth setup เพื่อให้ probe ผ่าน.

### BK01 migrations ที่เพิ่มจาก baseline ที่ pin

| ลำดับ | ไฟล์ | SHA-256 |
|---:|---|---|
| 1 | `supabase/bk01-migrations/20260926120000_bk01_entitlement_packs.sql` | `DB297AE07F1BE3CFBA5EC1D5A1FCA6E194B4D3188082E533A0F976C8ED005998` |
| 2 | `supabase/bk01-migrations/20260927120000_bk01_runtime_route_rpcs.sql` | `57E816C81009A2E0288AE1A8EE38D28D196E46F61B8568F146264C45E3961AD1` |
| 3 | `supabase/bk01-migrations/20260927130000_bk01_trial_line_bind.sql` | `A050E4C8CCCEC51E4A5D4F2F7F3BD76EC69A12258A9CF9567747CC64CC2F9446` |
| 4 | `supabase/bk01-migrations/20260928120000_bk01_house_upload_grants.sql` | `5EFA7D4120C6E939C1C7C63D02FEC4E78A2955FB4392E58986112AB89021EE14` |
| 5 | `supabase/bk01-migrations/20260930120000_bk01_link_token_no_extensions.sql` | `7ABD286B88679324C6D54DAD329C340C1D40C2ACF038D190FDAAF7E6414109EA` |

House dependency files ที่ต้อง bind กับ `3713656dc56401895d4b2c99070fad75aa3ef4d8`: `house_runtime_issuer.sql` SHA-256 `A56443B43B81CE2587599DF7EF7C8F5DB7EF58CC2A43FC583B37D317A2AAF1DD`; `h3c_runtime_role_allowlist_expansion.sql` SHA-256 `E17E8CBC3C0B4DE063510E9D29CA3E1D77C0A9DA2B1013549421480176700D78`; `house_storage_upload_grants.sql` SHA-256 `A14DCEEFEED6DA3911504A522924393D36979D4181B36361149C1106B3B5C4D3`.

## 4. Probe Lane B — expected results ต่อข้อ

เก็บ output ดิบใน external evidence folder และให้ reviewer ตรวจแต่ละผลโดยไม่ใช้สิทธิ์ของผู้ลงมือ.

| เกณฑ์ | Probe | ผลคาดหวัง / STOP |
|---|---|---|
| (ก) ข้ามโปรดักต์ | ใช้ effective reach ที่แยก L1 catalog, L2 object grant, L3 schema USAGE, L4 effective reach; probe role BK01 ต่อ `ps01`/`ps01_internal` และ role PS01 ต่อ `local_service`/`local_service_internal`; รวม schema/table/function privileges | ทุก cross-product L4 = false; privilege-denied ต้องแยกจาก timeout/5xx/measurement unknown. Any USAGE/EXECUTE/write/ownership reach ที่ไม่อยู่ allowlist = STOP. ห้ามสรุปจาก object grant อย่างเดียว.
| (ข) PS01 zero-delta | Baseline เทียบหลัง BK01 apply ของ `ps01`/`ps01_internal` objects, definitions, owner, ACL, RLS/policies และ catalog grants; ไม่ทำ app-path smoke รอบนี้ตาม Owner waiver A8. DEV-1 84 `ps01` ownership objects และ DEV-2 cron sequence เป็น waiver เฉพาะ window | ไม่มี delta นอก DEV-1/DEV-2; มี delta = STOP. Matrix ต้องระบุ `UNMEASURED_APP_PATH (Owner waiver A8)` พร้อมผล zero-delta; ห้ามเขียน PS01 healthy/PASS.
| (ค) pg_net/cron | effective-reach snapshot โดย schema usage + qualified object OID privileges; เปรียบเทียบกับ pinned `lane-b-per-stage-allowlist.json` | `net` effective set ต้องตรง exact accepted set ของ stage; `cron` schema USAGE ยังคง false, ดังนั้น catalog object grants ที่ไม่มี schema USAGE ห้ามรายงานเป็น reachable. Reach เพิ่ม/ลดไม่อธิบายได้ = STOP.
| (ง) forward BK01 repeat | `npm run db:bk01:apply` ครั้งที่สอง; verify ledger/checksum; rerun (ข) zero-delta comparator | migration runner no-op, 5 checksums ไม่เปลี่ยน, zero-delta ต้องยังเป็น 0 นอก waiver.
| Storage | พยายามขอ registration/grant ด้วย shop อื่น และด้วย bucket อื่นจาก client/runtime BK01; ตรวจผลจาก SQL return/status และ registry โดยไม่อ่านข้อมูลธุรกิจ | ทั้งคู่ถูกปฏิเสธแบบ fail-closed และไม่มี grant row เพิ่ม. หากไม่แยก policy denial จาก timeout/5xx ได้ให้ STOP; ห้ามสลับ bucket หรือ shop เพื่อให้ผ่าน.

การสร้าง Auth user, เปลี่ยน Custom Access Token Hook, ใช้ Worker secret หรือออก token ไม่อยู่ใน Window 1. บันทึกเป็นงาน Window 2 แยก และไม่ทำระหว่าง probe/rollback รอบนี้.

## 5. Snapshot หลังและ rollback

จับ snapshot ชุดเดียวกับก่อน apply ทันทีหลัง probes แล้วเทียบ machine-readable. ความต่างที่อนุญาตได้ต้องอธิบายเป็น exact object/ACL/owner ต่อบรรทัด; drift ที่ไม่คาดคิดให้หยุดและ rollback ตามลำดับด้านล่าง. อย่าแก้ managed ACL โดยตรง.

Rollback operator run order:

สำหรับ rollback ของ platform SQL ในรายการ House ด้านล่าง ต้องตั้ง `PLATFORM_SQL_EVIDENCE_DIR` เดิม แล้วรัน `node tools/shared-runtime/platform-sql/apply-platform-sql.mjs plan` ก่อนทุกไฟล์. ตรวจ `rollback.file` และ `rollback.sha256` ในผล plan ให้ตรงไฟล์ที่ต้องย้อน จากนั้นใช้ `node tools/shared-runtime/platform-sql/apply-platform-sql.mjs rollback --file <rollback.file> --confirm <rollback.sha256 จาก plan>`. Tool ยอมรับเฉพาะคู่ rollback ที่ pin ใน manifest, ใช้ plan สด, ลำดับล่าสุดใน evidence, preflight และ advisory lock; ห้าม paste SQL หรือรัน rollback platform SQL ด้วยช่องทางอื่น. Guard ที่ SQL ส่งกลับเมื่อยังมีข้อมูลเป็น STOP; ห้ามฝืนหรือลบข้อมูล.

1. หยุดการออก signed upload capability และตรวจ grant registry. ห้ามลบ grant row ด้วยมือ; House rollback ปฏิเสธถ้ายังมี active grant/config ที่ไม่ใช่ seed.
2. Rollback migration 5 `supabase/rollback/20260930120000_bk01_link_token_no_extensions.rollback.sql` ก่อน migration 4 using platform `postgres` identity: it restores the frozen `auth.uid()` policy and the legacy extension-backed token body, so do not `SET ROLE bk01_migrator`; preserve the existing function owner/ACL. If the approved rollback channel cannot execute this exact pinned file as `postgres`, STOP and do not grant schema access. จากนั้น rollback migration 4 `20260928120000_bk01_house_upload_grants.rollback.sql` ด้วย BK01 rollback channel แล้ว House `house_storage_upload_grants_rollback.sql` ด้วย platform SQL rollback command ด้านบน; ทั้งหมดต้องผ่าน guardและคืนเฉพาะ state ที่ source chain เพิ่ม.
3. เอา BK01 role row ออกจาก `runtime_token_grants`, ตรวจไม่มี BK01 role grant เหลือ แล้วใช้ `h3c_runtime_role_allowlist_expansion_rollback.sql` ด้วย platform SQL rollback command.
4. ใช้ `house_runtime_issuer_rollback.sql` ด้วย platform SQL rollback command หลัง client/rate/audit tables เป็น 0; มันปฏิเสธเมื่อยังมี state. เก็บ dedicated login role/shared schema ไว้ให้ platform owner ตัดสินแยก.
5. รัน rollback migrations 3, 2, 1 ตาม timestamp ย้อนกลับ โดยใช้ BK01 rollback channel สำหรับ files 3 และ 2. เมื่อถึง rollback ของ migration 1 ให้ใช้ platform `postgres` identity สำหรับการคืน `link_staff_user` และ `submit_deposit_slip`; ห้าม `SET ROLE bk01_migrator` กับสองฟังก์ชันนี้ เพราะ ACL/function ownership ของ legacy objects อยู่นอก BK01 role boundary. Migration 1 และ rollback source เป็น frozen ห้ามแก้. แต่ละ rollback ต้องเป็น transaction เดียว; ถ้ามีข้อมูลที่ guard ปฏิเสธ **ห้ามฝืน/ลบข้อมูล**.
6. รัน `supabase/shared-runtime/bk01-platform-bootstrap-rollback.sql` ด้วย platform SQL rollback command เฉพาะหลัง product migration ledger กลับเป็น 0; script จะปฏิเสธถ้ายังมี applied migration.
7. หลัง bootstrap rollback สำเร็จ ใช้ platform tool `plan` แล้ว `rollback --file docs/platform/shared-runtime/migrations/h3_bk01_runtime_role_rollback.sql --confirm <sha256 จาก plan>` เป็นไฟล์สุดท้ายของ platform chain. ต้องเป็น successful apply ของรอบนี้ใน evidence เท่านั้น. Role rollback ปฏิเสธ ownership, direct privileges/shared dependencies และ membership ทุกทิศทางที่นอก exact creator ADMIN row ของ A10; ห้ามถอนสิทธิ์หรือ CASCADE เพื่อให้ผ่าน.
8. Teardown role วัดชั่วคราวด้วย teardown SQL คู่ที่ pinned ไว้. ตรวจ `pg_stat_activity` ไม่มี session ของ role และยืนยัน role ถูก DROP.
9. เก็บ post-rollback snapshot แบบเดียวกับ baseline. ต้องตรงทุก catalog/privilege row ยกเว้นความต่างที่ Owner อนุมัติและบันทึกไว้ก่อน window; mismatch = FAIL, ห้ามปิด PASS.

## 6. ขอบเขต live storage probe

BK01 registration integration และ SQL House ผ่าน source/PGlite gates แล้วตาม SHA ที่ pin ไว้ด้านบน; Window 1 อนุญาต apply SQL บน LAB หลัง GO เท่านั้น. Probe storage ต้องยืนยัน (1) ร้านอื่นถูกปฏิเสธ และ (2) bucket อื่นถูกปฏิเสธ. การพิสูจน์ signed URL/TTL/metadata/successful hosted upload/replay และ failed-upload consumption ยังต้องบันทึกจาก live probe; PGlite ไม่พิสูจน์พฤติกรรม hosted Storage. หากเจอ grant ค้าง ห้าม rollback ฝืน.

## 7. Exit และผู้ตัดสิน

- ผู้ลงมือส่ง SHA ของทุก source branch, pre/post snapshots, migration ledger, logs, probe matrix, rollback proof, และรายการ deviation ให้ reviewer.
- Reviewer ต้องเป็นคนละ agent กับผู้ลงมือ และ bind ผลกับ SHA exact ก่อนให้ PASS ต่อ (ก)–(ง).
- Operator ลบ role วัดชั่วคราวหลัง probe/rollback, ตรวจไม่มี active session และส่งผลให้ Owner.
- สถานะปัจจุบันคือ **SOURCE_READY_PENDING_INDEPENDENT_REVIEW**; เปิด Window 1 ได้หลัง reviewer รับ exact SHA และ Owner พิมพ์ GO เท่านั้น. ห้ามเรียก Lane B/PASS, hosted-ready หรือ production-ready จาก offline evidence.
