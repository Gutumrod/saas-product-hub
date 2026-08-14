# 01 — Enterprise Bulk ETL & Sync

**สถานะ:** ✅ พร้อมเริ่มเขียนบรีฟเต็ม — module ที่ใช้ทั้งหมดมีโค้ดจริง, มี MODULE.md, มี test

## Modules ที่ก็อปมา (จาก modules-hub/modules/)
- `import-export` — StreamParser/StreamSerializer/XLSXAdapter (568 บรรทัด, test 3 ไฟล์)
- `job-retry` — DefaultJobRunner + retry/backoff (367 บรรทัด, test 4 ไฟล์)
- `health-check` — HealthCheckRegistry + MetricsCollector (247 บรรทัด, test 2 ไฟล์)
- `audit-log` — audit trail contract (974 บรรทัด, test 1 ไฟล์)

## รู้ไว้ก่อนเขียนบรีฟ
- `job-retry` เวอร์ชันในนี้เป็น in-memory/base runner — Redis job storage adapter (ตามที่ blueprint พูดถึง) ต้องเช็คว่ามีจริงใน job-retry หรือไม่ก่อนสัญญาลูกค้าเรื่อง distributed queue
- ยังไม่ได้ตรวจ scalability จริง (streaming batch size, memory) — ต้องทดสอบกับไฟล์ใหญ่จริงก่อนขาย

## TODO — ไล่เขียนด้วยกัน
- [ ] ลูกค้าเป้าหมาย (ใคร, ขนาดข้อมูลแค่ไหน)
- [ ] MVP scope (format ไหนบ้าง: CSV/Excel/JSON)
- [ ] โมเดลราคา
- [ ] Timeline
- [ ] ความเสี่ยง/สิ่งที่ต้องทดสอบก่อนขาย
