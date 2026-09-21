## Verdict: `OWNER_DECISION_REQUIRED`

R15 ถูก execute ตาม authorization โดยรวม และหลักฐานส่วนใหญ่สอดคล้องกัน แต่ยังอนุมัติ B5/T6 ไม่ได้ เพราะพบ security-contract mismatch ที่ D1 บันทึกไว้เอง:

- explicit grants ตรง matrix
- แต่ `hub_web_app` มี effective `USAGE` บน `user_role = true` ผ่าน PostgreSQL `PUBLIC` default  
  (`R15-D1-VERIFY-OUTPUT-2026-09-21.txt:43-53`)
- matrix ระบุ `user_role` ต้องไม่มี privilege (`T1-R15-PUBLIC-PRIVILEGE-MATRIX.md:199-207`)

ดังนั้นคำว่า “grant set equals matrix and nothing more” จริงเฉพาะ explicit ACL แต่ไม่จริงถ้าหมายถึง effective privilege ทั้งหมด ต้องมี Owner decision ว่าจะยอมรับ exception นี้ หรือกำหนด remediation ที่ปลอดภัยและ re-verify ใหม่

### สิ่งที่ตรวจแล้ว

- Schema source และ `0008` ตรงกัน: `product_installations` มี 13 columns, 2 FKs, unique index และ enum values ตรงกับ `drizzle/schema.ts`.
- `0007` มี 5 fulfillment tables + 4 enums; รวมกับ schema เดิมและ `0008` เป็น 9 tables / 9 enums ตาม catalog transcript
  (`R15-SCHEMA-REMEDIATION-APPLIED-2026-09-21.txt:2-25`, `R15-D0-RERUN-AFTER-REMEDIATION-2026-09-21.txt:1-30`).
- ไม่พบหลักฐานว่าใช้ `db:push`, apply `0002–0006`, แตะ billing schema หรือ WSTERA_LAB.
- Role posture, memberships, table grants, sequence grants และ profiles privilege ตรงกับหลักฐานที่บันทึก
  (`R15-D1-VERIFY-OUTPUT-2026-09-21.txt:1-67`).
- OV-1 ถือว่าพิสูจน์ได้จากการ INSERT ด้วย real profile IDs โดยไม่มี privilege บน `profiles`
  (`R15-D2-PRESWITCH-PROOF-2026-09-21.txt:25-28`).
- การ revert `ALTER ROLE ... SET search_path` เพียงพอในระดับหลักฐานที่ให้มา: `rolconfig = null` และ role attributes อื่นไม่เปลี่ยน
  (`R15-D3-SWITCH-AND-RUNTIME-VERIFY-2026-09-21.txt:40-46`).
- Runtime identity `hub_web_app` และ deployed version ถูกบันทึกอย่างสอดคล้องกัน แต่การ review นี้ไม่ได้เชื่อมต่อ Cloudflare/DB เพื่อ re-query สด จึงจัดเป็น operator-recorded evidence ไม่ใช่ independent live re-verification.
- Rollback มี documented path และ owner credential ยัง retained ตาม P3 แต่ยังไม่เคย execute.

### Billing deny

Disposition A ถูก Owner อนุมัติแล้ว: absence-invariant และต้อง re-verify เมื่อ schemas ถูกสร้างใน Project A; ไม่ใช่ DENY PASS (`R15-D3...txt:48-51`, Owner authorization §D0).

ดังนั้นไม่ควรเขียนว่า billing deny ผ่าน แต่ไม่ block R15 ต่อ เพราะเป็น exception ที่ Owner อนุมัติภายหลัง อย่างไรก็ตาม manifest เดิมยังเขียน acceptance เป็น “explicit DENY proof” (`RUN-MANIFEST...md:223-232`) จึงต้องถือว่าเป็น amended acceptance ไม่ใช่ literal pass ของ contract เดิม

### T5 / T6

- T5 acceptance contract: **ยังไม่ผ่านแบบ literal** เพราะ billing deny ไม่ใช่ DENY PASS และ effective `user_role` privilege เกิน matrix
- T6: **ยังไม่อนุญาต**
- B6 ต้องรอ:
  1. Owner ruling ต่อ effective `user_role` privilege หรือ remediation ที่ไม่ขยายผลกระทบโดยพลการ
  2. re-run D1/D2/D3 และ fresh B5 review หลัง ruling/remediation
  3. reconcile เอกสารสถานะที่ยัง stale: task file ยังระบุ Worker `00bdb1b5` และ candidate `679ff279` แม้ D4 ระบุ `9a004fa9`
  4. ตรวจ root worktree ที่ยังมี untracked shared-runtime documents ก่อน final reconciliation

ยังเปิดอยู่สำหรับ B6/House closure: capability activation, Control request correlation, Owner-authenticated surfaces, synthetic fulfillment E2E, billing re-verification trigger และ stability evidence. ห้าม claim `PRODUCTION_READY`, `OPERATED_STABLE` หรือ final House closure ตอนนี้.