# 07 — AI Resilience Gateway

**สถานะ:** ⚠️ พร้อมแต่ตัดฟีเจอร์หลักออก 1 อย่าง — ดูด้านล่างก่อนตั้งราคา/สัญญาลูกค้า

## Modules ที่ก็อปมา
- `ai-provider` — multi-provider interface (573 บรรทัด)
- `tenant-context` — quota/rate ต่อ tenant (365 บรรทัด)
- `rate-limit` — rate limiter (499 บรรทัด, test 8 ไฟล์)

## ⚠️ รู้ไว้ก่อนเขียนบรีฟ — สำคัญ
- **จุดขายหลักของไอเดียนี้คือ CircuitBreaker (จาก `enterprise-features`) แต่ module นั้นว่างเปล่า** (มีแค่ package-lock.json) — ไม่มี CircuitBreaker สำเร็จรูปให้ก็อป
- ถ้าจะทำไอเดียนี้ต่อ ต้องเขียน circuit-breaker + fallback-chain logic เอง (ประมาณ 100-200 บรรทัด ไม่ยาก แต่เป็น "เขียนใหม่" ไม่ใช่ "ประกอบของเดิม") หรือลดขอบเขตเหลือแค่ multi-provider fallback แบบง่าย (try provider A → ถ้า error ลอง B) โดยไม่มี circuit state

## TODO — ไล่เขียนด้วยกัน
- [ ] ตัดสินใจก่อน: เขียน circuit-breaker เองไหม หรือลด scope เหลือ fallback ธรรมดา
- [ ] ลูกค้าเป้าหมาย
- [ ] MVP scope
- [ ] โมเดลราคา
- [ ] Timeline
