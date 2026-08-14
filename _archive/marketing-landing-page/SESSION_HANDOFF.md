# Session Handoff

## Project

`D:\AI-Workspace\projects\saas-product-hub\marketing-landing-page` — storefront แยกจาก `local-service-booking-saas`

## เอกสารที่ต้องอ่านก่อนบิวด์

1. `PRD.md` — scope และ acceptance criteria
2. `ROADMAP.md` — phase และ milestone
3. `DESIGN_SYSTEM.md` — Apple-inspired, Noto Sans Thai และ Magic UI rules
4. `ARCHITECTURE.md` — routes, boundaries และ testing
5. `CONTENT_MODEL.md` — schema สำหรับ product ใหม่
6. `IMPLEMENTATION_CHECKLIST.md` — checklist ลงมือทำ
7. `DECISIONS.md` — เหตุผลของ decision สำคัญ

## สถานะก่อนเริ่ม session ถัดไป

Landing page เดิมมี TH/EN, Light/Dark, responsive layout และ Apple-inspired foundation แล้ว ขั้นถัดไปคือสร้าง Hub/catalog จาก data model ไม่ใช่รื้อหน้าเดิมทั้งหมด

## ขั้นตอนแรก

1. อ่านเอกสารชุดนี้
2. รับรายชื่อ SaaS/product ชุดแรกจาก owner
3. เติมข้อมูลตาม `CONTENT_MODEL.md`
4. ตรวจ checklist
5. วางแผนแก้ routes, shared layout, catalog data และ pages
6. ค่อยเพิ่ม Magic UI หลัง Hub MVP ทำงาน

## ข้อห้าม

- ห้ามแก้ source code ของ `local-service-booking-saas`
- ห้ามสร้าง review/rating/testimonial จำลอง
- ห้ามฝัง secret หรือ payment key ใน frontend
- ห้ามเพิ่ม Magic UI ทุกส่วนโดยไม่ผ่าน design rules
