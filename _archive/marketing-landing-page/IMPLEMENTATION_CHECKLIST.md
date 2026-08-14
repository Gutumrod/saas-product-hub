# Implementation Checklist

## Before Coding

- [ ] อ่าน PRD, Design System, Architecture และ Decisions
- [ ] รับรายชื่อ product และข้อมูลจาก owner
- [ ] ตรวจว่า project path คือ `D:\AI-Workspace\projects\saas-product-hub\marketing-landing-page`
- [ ] ยืนยันว่าไม่แก้ `local-service-booking-saas`
- [ ] สร้าง typed catalog ตาม CONTENT_MODEL

## Hub MVP

- [ ] shared header/footer และ back navigation
- [ ] Home hero และ featured product
- [ ] `/products` catalog
- [ ] search, category filter, sort และ reset
- [ ] loading/empty/error state
- [ ] `/products/:slug` shared detail template
- [ ] external CTA resolver

## Design Quality

- [ ] Noto Sans Thai ทุกหน้า
- [ ] Light/Dark contrast ตรวจแล้ว
- [ ] TH/EN content parity
- [ ] Magic UI ใช้เฉพาะจุดตาม Design System
- [ ] reduced motion และ keyboard focus
- [ ] mobile 375px, tablet 768px, desktop

## Validation

- [ ] typecheck/lint/build ผ่าน
- [ ] ทดสอบ search/filter/route fallback
- [ ] ตรวจ console/network errors
- [ ] ตรวจ image alt และ link destinations
- [ ] ตรวจไม่มี secret ใน client
- [ ] ทำ checkpoint ก่อนส่งมอบ
- [ ] อัปเดต ROADMAP และ DECISIONS เมื่อมีการเปลี่ยน scope
