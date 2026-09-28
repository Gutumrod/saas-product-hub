# สถานะชุดเอกสาร Lane B live window (2026-09-28)

สถานะ: **SOURCE PACK READY WITH STORAGE HOLD**. รายงาน blocker เดิม `BLOCKER-LIVE-PACK-2026-09-28.md` ถูกแทนที่ด้วย runbook source-only หลังมี rollback chain BK01 และ pin H3D checker แล้ว.

## ปิดแล้วใน source

- Rollback แยก 3 migrations ถูกเพิ่มและพิสูจน์ที่ PGlite บนฐาน `c16036d154912ebeb8217bf08ea06044daee8dfd`: partial rollback latest, ปฏิเสธเมื่อข้อมูลยังอยู่, rollback ทั้ง chain แล้ว catalog กลับเท่ากัน.
- House issuer + H3C allowlist source/proofs อยู่ branch `codex/house-runtime-issuer-20260927`.
- House storage grant registry/RLS/atomic consume source และ isolated PGlite proof อยู่ branch `codex/house-storage-upload-grant-20260927`.
- Runbook/operator sequence และ expected delta/probes/rollback อยู่ `RUNBOOK-LANE-B-LIVE-WINDOW-2026-09-27.md`.
- H3D static checker ถูก pin ที่ `53346383faa2a87fac483a7a3bf5233a200e295d`.

## ค้างก่อนเปิด LAB

1. Independent reviewer ต้อง review exact branch SHAs และหลักฐานของทุก step.
2. **Superseded on the integration branch:** `tools/shared-runtime/inventory/lane-b-effective-reach.mjs --capture` now implements exact pinned project-ref + direct-host preflight, temporary role cleanup, and provenance-bound external output. Offline preflight tests pass 4/4. This is source-level only; no LAB capture was run. Independent exact-SHA review and a separately authorized live window remain required.
3. Owner/operator ยังต้องเปิด live window และทำ hosted Auth/Cloudflare Dashboard actions ใน runbook ภายใต้ authorization แยก.
4. BK01 ยังไม่ได้เรียก House storage registration RPC; ห้าม apply storage grant SQL หรือ probe upload จน follow-up implementation/review เสร็จ.

ไม่มี LAB/production connection, SQL apply, Dashboard change, secret read, Worker deploy หรือ token issuance ในงาน source pack นี้. สถานะนี้ไม่ใช่ Lane B PASS.
