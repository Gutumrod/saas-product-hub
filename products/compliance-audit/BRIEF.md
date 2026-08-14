# 04 — Audit / Compliance-as-a-Service

**สถานะ:** ✅ พร้อมเริ่มเขียนบรีฟ — แต่มีข้อจำกัด 1 จุดใน `notification` (ดูด้านล่าง)

## Modules ที่ก็อปมา
- `audit-log` — audit trail contract (974 บรรทัด)
- `auth-supabase` — RBAC/RLS helpers (587 บรรทัด)
- `webhook-receiver` — รับ event จากระบบอื่น (863 บรรทัด)
- `notification` — แจ้งเตือนเมื่อพบ action ผิดปกติ (433 บรรทัด)

## ⚠️ รู้ไว้ก่อนเขียนบรีฟ — สำคัญ
- **`notification` module มีแค่ `webhook.ts` ที่ทำงานจริง** — `email.stub.ts`, `line.stub.ts`, `telegram.stub.ts` throw `Error('not implemented yet')` ทั้งหมด
- ถ้าจะขายว่า "แจ้งเตือนผ่านอีเมล/LINE" ต้องเขียน provider เหล่านี้เองจริง (ไม่ใช่แค่ก็อปแล้วใช้ได้เลย) — ตอนนี้ทำได้แค่ยิง webhook ไป Slack/Discord/ระบบอื่นเท่านั้น

## TODO — ไล่เขียนด้วยกัน
- [ ] ลูกค้าเป้าหมาย (fintech/healthtech ที่ต้องมี audit trail)
- [ ] MVP scope (แจ้งเตือนช่องทางไหนบ้าง — ตัดสินใจเรื่อง notification ก่อน)
- [ ] โมเดลราคา
- [ ] Timeline
- [ ] ความเสี่ยง
