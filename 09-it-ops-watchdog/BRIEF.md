# 09 — Autonomous IT Ops Watchdog

**สถานะ:** ⚠️ Engine จริง แต่บาง — ต้องเขียน "สมอง" เองก่อนขาย (เหมือนข้อ 08)

## Modules ที่ก็อปมา
- `health-check` — HealthCheckRegistry + MetricsCollector (247 บรรทัด)
- `ai-workflow-engine` — AdaptiveWorkflowRuntime (214 บรรทัด)
- `job-retry` — remediation job runner (367 บรรทัด)
- `notification` — แจ้งเตือนทีม (433 บรรทัด — มีแค่ webhook.ts ที่ใช้งานได้จริง)

## ⚠️ รู้ไว้ก่อนเขียนบรีฟ — สำคัญ
- เหมือนข้อ 08: `ai-workflow-engine` เป็นแค่ตัว orchestrate ไม่มี "Root Cause Analysis" หรือ AI diagnostic logic ในตัว ต้องเขียน action/prompt เองทั้งหมด
- `notification` แจ้งเตือนทีมได้จริงแค่ทาง webhook (เช่นยิงเข้า Slack) — ยังส่งอีเมล/LINE/Telegram ตรงไม่ได้จนกว่าจะเขียน provider เพิ่ม

## TODO — ไล่เขียนด้วยกัน
- [ ] ลูกค้าเป้าหมาย (ทีม DevOps ที่ไม่มี on-call พอ)
- [ ] MVP scope (diagnostic logic จริงคืออะไร)
- [ ] โมเดลราคา
- [ ] Timeline
- [ ] ความเสี่ยง
