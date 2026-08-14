# 08 — Content Auto-Pilot

**สถานะ:** ⚠️ Engine จริง แต่บาง — ต้องเขียน "สมอง" เองก่อนขาย

## Modules ที่ก็อปมา
- `scheduler` — MemorySchedulerEngine (201 บรรทัด)
- `ai-workflow-engine` — AdaptiveWorkflowRuntime (214 บรรทัด รวม 6 ไฟล์)
- `ai-provider` — LLM interface (573 บรรทัด)
- `notification` — แจ้งเตือนเมื่อ publish (433 บรรทัด — มีแค่ webhook.ts ที่ใช้งานได้จริง ดู module 04 brief)

## ⚠️ รู้ไว้ก่อนเขียนบรีฟ — สำคัญ
- ตรวจโค้ดจริงของ `ai-workflow-engine` แล้ว: มันคือ manifest-driven action dispatcher (รับ intent → เช็ค approval → execute action → บันทึก audit trail) **ไม่ได้มี logic เรื่อง "เขียนคอนเทนต์/SEO" อยู่ในตัวมันเอง** — คุณต้องนิยาม action เหล่านั้นเอง (เช่น `generate-draft`, `seo-optimize`) แล้วส่ง prompt ไปที่ `ai-provider`
- เข้าใจง่ายๆ: module นี้เป็นแค่ "ตัวเดินเรื่อง" ส่วน "เนื้อหา AI" ต้องเขียนเพิ่มทั้งหมด

## TODO — ไล่เขียนด้วยกัน
- [ ] ลูกค้าเป้าหมาย (content/social agency)
- [ ] MVP scope (workflow steps จริงมีอะไรบ้าง)
- [ ] โมเดลราคา
- [ ] Timeline
- [ ] ความเสี่ยง
