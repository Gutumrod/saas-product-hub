# 10 — LINE OA AI Customer Service Bot

**สถานะ:** ✅ ปลดล็อกแล้ว — module เขียนเสร็จโดย Manus AI, ตรวจสอบผ่านจริง (tsc + vitest) เมื่อ 14 ส.ค. 2026 03:44

## Modules ที่ก็อปมา
- `line-oa-ai-module` — LINE OA webhook signature verify + session state manager + AI engine adapter + LINE client (17 ไฟล์)

## ประวัติย่อ (กันงงทีหลัง)
- รอบแรก (03:05-03:07): โฟลเดอร์ว่าง 100% แล้วพัง (JSON/TS escape เพี้ยนจาก shell write bug ของ Manus)
- รอบสอง (03:22-03:28): เขียนใหม่บางส่วน ยังพัง 3 จุด (package.json invalid, ai-engine.ts template literal พัง, webhook-handler.ts import type ที่ไม่มีอยู่)
- รอบสาม (03:37-03:39): แก้ครบ + เพิ่ม tests/MODULE.md/tsconfig — **ตรวจซ้ำด้วยการรันจริงแล้วผ่าน:**
  - `npx tsc --noEmit` → 0 errors
  - `npx vitest run` → 20/20 tests ผ่าน
  - ไม่มี `process.env` รั่วใน src/

## รู้ไว้ก่อนเขียนบรีฟ
- ยังไม่ได้ลงทะเบียนใน `modules/REGISTRY.md` ของ modules-hub (แนะนำเพิ่มเป็น Module #21 ทีหลัง)
- ยังไม่ได้ตรวจ integration.example.ts จริงกับ LINE Messaging API ของจริง (แค่ unit test ผ่าน ไม่ใช่ end-to-end กับ LINE server จริง) — ต้องทดสอบกับ LINE OA sandbox ก่อนขาย

## TODO — ไล่เขียนด้วยกัน
- [ ] ลูกค้าเป้าหมาย (ธุรกิจ SME ไทยที่ใช้ LINE OA)
- [ ] MVP scope (ตอบคำถามทั่วไป / จอง / สั่งของ — ดูจาก state machine ที่มีอยู่: IDLE/ORDERING/BOOKING/CONFIRMING/COMPLETED)
- [ ] โมเดลราคา
- [ ] Timeline
- [ ] ความเสี่ยง (ทดสอบกับ LINE OA sandbox จริงก่อน)
