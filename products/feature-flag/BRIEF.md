# 05 — Feature-Flag + Config Platform

**สถานะ:** ✅ พร้อมเริ่มเขียนบรีฟเต็ม — เบาสุดใน 10 ไอเดีย (2 module) แต่ทั้งคู่มีโค้ดจริงครบ

## Modules ที่ก็อปมา
- `feature-flags` — createFeatureFlags/isEnabled/getFlag (556 บรรทัด, test 6 ไฟล์)
- `config-runtime` — defineConfig/validateConfig/redactConfig (494 บรรทัด, test 1 ไฟล์)

## รู้ไว้ก่อนเขียนบรีฟ
- เดิมแผนจะดึง `audit-log` + `tenant-context` มาด้วย (log ว่าใครเปลี่ยน flag เมื่อไหร่ + แยกตาม tenant) — ยังไม่ได้ก็อปมา ถ้าจะทำเป็น multi-tenant SaaS ต้องเพิ่มสองตัวนี้เข้าไปทีหลัง
- ของสองตัวนี้เบามาก แปลว่า MVP ทำเร็ว แต่ก็แปลว่า "มูลค่าที่ขายได้" ต่ำกว่าตัวอื่นถ้าไม่เสริม tenant-context/audit-log

## TODO — ไล่เขียนด้วยกัน
- [ ] ลูกค้าเป้าหมาย (ทีม dev ที่อยากได้ LaunchDarkly เวอร์ชันคุมเอง)
- [ ] MVP scope (ต้องเพิ่ม tenant-context/audit-log ไหม)
- [ ] โมเดลราคา
- [ ] Timeline
- [ ] ความเสี่ยง
