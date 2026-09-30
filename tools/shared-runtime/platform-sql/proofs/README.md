# A9 — BK01 runtime role proof (source-only)

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

1. ใช้ PostgreSQL 16 **cluster ใหม่ที่ใช้ทิ้งได้** bound เฉพาะ `127.0.0.1`, user `postgres`, port ว่าง. Proof สร้าง database `lab`; ถ้ามีอยู่แล้วจะล้ม ไม่ reset/drop ฐานเดิม. ห้ามใช้ LAB/production/server ของงานอื่น.
2. ที่ worktree ของ candidate นี้ รัน `npm ci --ignore-scripts` ใน `tools/shared-runtime`.
3. รัน:

```powershell
node tools/shared-runtime/platform-sql/proofs/bk01-runtime-role-roundtrip.mjs --booking-root <absolute-booking-worktree-at-32df434> --port <loopback-port> --evidence <fresh-absolute-external-directory>
```

4. หยุด PostgreSQL ของ cluster ทดสอบใน `finally` และเก็บ logs/evidence นอก repo. Fixture cluster และ raw evidence ห้าม commit ลง vault/repo.

Proof สร้าง baseline จาก legacy migration จริง 30 ไฟล์ + H3C baseline, ยืนยัน 22 relation/61 function และไม่มี role BK01. เครื่องมือจริงยังทำ target validation กับ URL ปลอมของ test; injected pg client ทุก connection ต่อ `127.0.0.1` เท่านั้น ไม่อ่าน `.secrets` หรือรับ hosted credential.

## Acceptance

- bootstrap frozen ล้มก่อน role prerequisite บน PostgreSQL จริง, แล้วผ่านเมื่อสร้าง role ผ่าน manifest/tool.
- role มี NOLOGIN/NOINHERIT/non-privileged attributes ครบ, timeout 8s/comment และไม่มี direct privileges/ownership/membership.
- platform guard, duplicate-role guard และ rollback guard ปฏิเสธ ownership, ACL, default privileges และ membership ทั้งเข้า/ออก; synthetic fixtures ย้อนด้วย transaction rollback.
- tool บังคับ role ก่อน bootstrap และย้อน bootstrap ก่อน role.
- role → bootstrap → rollback bootstrap → rollback role คืน catalog/data snapshot = baseline, ยกเว้น ACL NULL→explicit PostgreSQL default ที่ A7 ยอมรับ; ฟังก์ชัน `is_platform_admin()`/`is_shop_member()` ให้ผลเดิม; ไม่เหลือ role/idle transaction.
- หลักฐานเก็บ snapshot ทั้ง normalized และ raw พร้อม `raw_delta` เพื่อให้ reviewer ตรวจ ACL exception เอง; ไม่ซ่อนความต่าง raw.
- `npm run test:platform-sql`, `npm run selftest` และ syntax/diff checks ผ่าน.

นี่คือ proof local/source เท่านั้น. AGY ต้องตรวจ exact SHA และรัน gates เอง; ห้ามแตะ LAB จน Owner GO ใหม่.
