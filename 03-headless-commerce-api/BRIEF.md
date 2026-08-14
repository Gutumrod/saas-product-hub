# 03 — Headless Commerce API

**สถานะ:** ✅ พร้อมเริ่มเขียนบรีฟเต็ม — `product-catalog` เป็น module ที่หนาที่สุดในทั้งหมด (2,777 บรรทัด, test 9 ไฟล์)

## Modules ที่ก็อปมา
- `product-catalog` — core service + data/media adapters (2,777 บรรทัด)
- `file-storage` — storage adapter สำหรับรูปสินค้า (809 บรรทัด)
- `payment` — checkout (968 บรรทัด)
- `import-export` — bulk upload สินค้า (568 บรรทัด)

## รู้ไว้ก่อนเขียนบรีฟ
- module ใหญ่สุด = ของแน่นสุด แต่ก็แปลว่าใช้เวลาอ่าน MODULE.md/ทำความเข้าใจ contract นานสุดด้วย เผื่อเวลาให้พอ
- ยังไม่ได้เช็คว่ามี subscription/tenant-context ผูกด้วยไหม ถ้าจะทำ multi-store ต้องดึง `tenant-context` มาเสริม

## TODO — ไล่เขียนด้วยกัน
- [ ] ลูกค้าเป้าหมาย (SME ที่อยากได้ backend อีคอมเมิร์ซแบบ headless)
- [ ] MVP scope
- [ ] โมเดลราคา
- [ ] Timeline
- [ ] ความเสี่ยง
