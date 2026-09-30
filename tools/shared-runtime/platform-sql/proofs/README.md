# A10/A11 — BK01 managed runtime role and no-extension proof (source-only)

บรีฟ: Second Brain `06-Agent-Logs/WSTERA-House/briefs/codex-parallel-20260927/18-LIVE-WINDOW-1-OPERATOR.md` ส่วน A9 ที่ vault `7281e93`. เป้าหมายคือซ่อม prerequisite ที่ขาดของ boundary เดิม ไม่เพิ่ม runtime identity แบบ LOGIN หรือสิทธิ์ใหม่. **Reuse Gate: N/A — pure remediation ของ NOLOGIN boundary ที่ล็อกแล้ว** ตาม `docs/platform/MODULE-REUSE-POLICY.md`; ไม่ได้ bootstrap สินค้าใหม่หรือเพิ่ม service. การสร้าง role เป็นของแพลตฟอร์ม; booking bootstrap/runner ยังคง frozen source เดิม.

## Provenance / adaptation

Copy date: 2026-09-30. Immutable vault source: `7281e932d9721ff9fc8219da5e7325017da5ee4e`.

| ไฟล์ | แหล่งที่นำมาใช้ | การปรับในสำเนาปลายทาง |
|---|---|---|
| `h3_bk01_runtime_role.sql` | House `7695b62783d4e4be5092dd9c39f8ab9cdc793579`, `docs/platform/shared-runtime/migrations/h3_ps01_line_runtime_boundary.sql` | ใช้ platform guard + CREATE ROLE attributes + timeout/comment; เปลี่ยน role/product เป็น BK01; ไม่มี GRANT หรือ PS01 ACL changes |
| `catalog-snapshot.mjs` | `Gutumrod/second-brain-vault` `7281e93`, `06-Agent-Logs/WSTERA-House/tools/platform-sql-review-claude/a7/snapshot.mjs` | เปลี่ยนเฉพาะ pg import มาใช้ dependency ของ package; คง catalog/data snapshot และ default-ACL normalization เดิม |
| `scaffold.sql` | vault/commit เดียวกัน, `tools/platform-sql-review-claude/a7/scaffold.sql` | เอาการสร้าง `bk01_runtime` ล่วงหน้าออก เพื่อจำลอง prerequisite ที่ขาดจริง |

ไม่มีการแก้แหล่งต้นฉบับหรือเพิ่ม cross-repository production runtime dependency. Proof อ่าน booking source จาก path ที่ส่งเข้ามาและตรวจ immutable SHA `32df434e1057a83ecbf0c290a659be42f24bbc55`.

## วิธีรันซ้ำ

1. ใช้ PostgreSQL **17** cluster ใหม่ bound เฉพาะ `127.0.0.1`, initdb ด้วย initial superuser `supabase_admin`, port ว่าง. Proof สร้าง role `postgres` และ database `lab`; ถ้ามีอยู่แล้วจะล้ม ไม่ reset/drop ฐานเดิม. ห้ามใช้ LAB/production/server ของงานอื่น. PG16 หรือ cluster ที่ใช้ initial superuser ชื่อ postgres ไม่ตรง contract และต้องปฏิเสธ.
2. ที่ worktree ของ candidate นี้ รัน `npm ci --ignore-scripts` ใน `tools/shared-runtime`.
3. สำหรับ A10 role-only proof รัน:

```powershell
node tools/shared-runtime/platform-sql/proofs/bk01-runtime-role-roundtrip.mjs --booking-root <absolute-booking-worktree-at-32df434> --port <loopback-port> --evidence <fresh-absolute-external-directory>
```

สำหรับ A11 ให้เพิ่ม `--product-root <absolute-worktree-at-codex/bk01-no-extensions-20260930>`. Current candidate pin: `fb455a6d3876dfcb9db31079700e1c0c1bffb4ac`. `--booking-root` ยังคง checkout `32df434e1057a83ecbf0c290a659be42f24bbc55` เพื่อให้ platform bootstrap ใช้ pin เดิม; `--product-root` ใช้อ่าน legacy chain และรัน BK01 candidate runner จริง. โหมดนี้ต่อ platform role/bootstrap/issuer/H3C/storage ตาม manifest, ตรวจ extensions ไม่มี PUBLIC USAGE และ `bk01_migrator` ไม่มี USAGE, จากนั้น apply migration 1–5 ทีละไฟล์และ apply ซ้ำ. มันเรียก `generate_link_token`, `create_booking_hold` สองเส้นทาง, normal/trial LINE bind และ upload grant/House registration; ตรวจ SHA-256, owner/ACL, และ foreign-schema catalog gate.

4. หยุด PostgreSQL ของ cluster ทดสอบใน `finally` และเก็บ logs/evidence นอก repo. Fixture cluster และ raw evidence ห้าม commit ลง vault/repo.

Proof สร้าง baseline จาก legacy migration จริง 30 ไฟล์ + H3C baseline, ยืนยัน 22 relation/61 function และไม่มี role BK01. เครื่องมือจริงยังทำ target validation กับ URL ปลอมของ test; injected pg client ทุก connection ต่อ `127.0.0.1` เท่านั้น ไม่อ่าน `.secrets` หรือรับ hosted credential. โหมด A11 ทิ้ง fixture state ไว้เฉพาะใน disposable local cluster; ห้ามนำ cluster/evidence ไปใช้กับ LAB.

## Acceptance

- bootstrap frozen ล้มก่อน role prerequisite บน PostgreSQL จริง, แล้วผ่านเมื่อสร้าง role ผ่าน manifest/tool.
- role มี NOLOGIN/NOINHERIT/non-privileged attributes ครบ, timeout 8s/comment และไม่มี direct privileges/ownership; มีเพียง exact creator ADMIN row ตาม A10.
- platform guard, duplicate-role guard และ rollback guard ปฏิเสธ ownership, ACL, default privileges และ membership ทั้งเข้า/ออก; synthetic fixtures ย้อนด้วย transaction rollback.
- tool บังคับ role ก่อน bootstrap และย้อน bootstrap ก่อน role.
- role → bootstrap → rollback bootstrap → rollback role คืน catalog/data snapshot = baseline, ยกเว้น ACL NULL→explicit PostgreSQL default ที่ A7 ยอมรับ; ฟังก์ชัน `is_platform_admin()`/`is_shop_member()` ให้ผลเดิม; ไม่เหลือ role/idle transaction.
- หลักฐานเก็บ snapshot ทั้ง normalized และ raw พร้อม `raw_delta` เพื่อให้ reviewer ตรวจ ACL exception เอง; ไม่ซ่อนความต่าง raw.
- A11 local PG17 forward proof ต้องแสดง migration 1–5 แยก transaction, second apply no-op, token/ACL equivalence, `create_booking_hold`, normal/trial LINE bind และ House upload registration ผ่าน; catalog gate ต้องไม่มี forbidden refs ใน objects ที่ bk01_migrator เป็นเจ้าของ.
- `npm run test:platform-sql`, `npm run selftest` และ syntax/diff checks ผ่าน.

## A10 actor และ rollback exception

Authority: บรีฟ 18 A10 ที่ vault `04ebb9ebdcaa1ab4ec8f34b3075700ce85f1d648`; House base `4be457be6f17c6560fc771b822d29b723b9e5f21`. SQL forward/rollback/bootstrap และ manifest ที่ pin ไม่เปลี่ยน. Reuse Gate ยังคง N/A — ซ่อม actor/membership contract ของ capability เดิม.

Fixture ใช้ superuser เฉพาะเตรียม legacy baseline, demote postgres เป็น NOSUPERUSER ก่อน snapshot/chain. Tool ต่อโดย user/session_user postgres จริงที่มี CREATEROLE; check บังคับ PG17 และ rolsuper=false. Supervisor connection ใช้ transaction-local negative fixtures เท่านั้น โดย SET LOCAL ROLE postgres ก่อนทดสอบ guard; ทุก fixture ROLLBACK. ไม่มี tool apply/rollback connection เป็น superuser.

PG17 สร้าง creator ADMIN row อัตโนมัติ grantor=supabase_admin (initial superuser), member=postgres, ADMIN=true/INHERIT=false/SET=false ตรง LAB. ตรวจ fresh recovery directory ไม่มี apply history: plan อ่าน role ขั้น 5 applied และ next bootstrap; rollback=null ไม่แอบนำ role เดิมมาให้ undo.

Role rollback ใช้ tool-owned guard ของ `bk01-runtime-membership.mjs` + DROP ROLE ภายใต้ transaction/lock/plan/pins เดิม; immutable rollback file ยังตรวจ checksum/confirm แต่ **ไม่ได้ execute** สำหรับ role entry นี้. Evidence ระบุ `executionPolicy=A10_MANAGED_RUNTIME_ROLE_DROP`. ยอม creator ADMIN row เพียงหนึ่งแถว ไม่มี dependencies; ไม่ REVOKE ADMIN และ DROP ลบแถวเอง. ไม่มี exception นี้สำหรับ SQL entry อื่น. Guard ปฏิเสธ ownership, direct/default privileges, outbound/inbound membership และ non-platform actor.

ตรวจหลักฐาน role attributes/automatic membership/actor/recovery/raw snapshots พร้อม normalized delta. Unit tests ต้อง reject admin/inherit/set/member/grantor mutation ทุกตัว, missing/duplicate/extra rows และ authenticator ที่ผิดค่า. Acceptance ของ A9 คำว่าไม่มี membership ถูกแทนด้วย A10 exact creator row; original frozen rollback SQL ใช้กับ actor นี้ไม่ได้ จึงตรวจ guard ของ tool แทนโดยไม่แก้ไฟล์ pinned.

นี่คือ proof local/source เท่านั้น. AGY ต้องตรวจ exact SHA และรัน gates เอง; ห้ามแตะ LAB จน Owner GO ใหม่.
