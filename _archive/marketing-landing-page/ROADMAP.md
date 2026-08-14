# Execution Roadmap: SaaS Product Hub

**หลักการ:** ทำเป็น phase, แต่ละ phase ต้องมี output และเกณฑ์ผ่านก่อนเริ่ม phase ถัดไป

## Phase 0 — Documentation Baseline

**สถานะ:** Complete for planning

- [x] PRD, Roadmap, Design System และ Architecture
- [x] Content model, checklist และ decision log
- [x] ระบุ boundary กับ `local-service-booking-saas`
- [ ] ยืนยันชื่อแบรนด์, domain และรายชื่อ product ชุดแรก

**Exit criteria:** ทีมใช้เอกสารชุดเดียวกันและ open decisions ถูกระบุชัดเจน

## Phase 1 — Hub MVP Foundation

- [ ] ตรวจ codebase ปัจจุบันและสร้าง shared layout
- [ ] แยก route `/`, `/products`, `/products/:slug`
- [ ] สร้าง typed product catalog จาก `CONTENT_MODEL.md`
- [ ] ทำ product card, search, filter, sort และ empty state
- [ ] รักษา TH/EN, Light/Dark และ responsive behavior เดิม
- [ ] เพิ่ม tests สำหรับ search/filter และ route fallback

**Exit criteria:** catalog ทำงานจาก data กลาง, มี product detail อย่างน้อย 1 ตัว และไม่มี regression ของ landing page

## Phase 2 — Premium Product Experience

- [ ] ทำ detail template ให้รองรับทุก product
- [ ] เพิ่ม workflow, feature grouping, pricing block และ FAQ
- [ ] ใช้ Magic UI แบบ selective ตาม `DESIGN_SYSTEM.md`
- [ ] ปรับ accessibility, reduced motion และ performance
- [ ] ทำ SEO metadata, Open Graph และ structured content ที่เหมาะสม

**Exit criteria:** product ใหม่เพิ่มด้วย data/config เป็นหลัก และ visual language สม่ำเสมอทุกหน้า

## Phase 3 — Conversion และ Account Handoff

- [ ] ยืนยัน auth provider และ account model
- [ ] ทำ login/signup หรือ external auth handoff
- [ ] ทำ free trial/request demo flow
- [ ] กำหนด return URL ไปยัง product app
- [ ] เพิ่ม analytics สำหรับ search, filter, product view และ CTA

**Exit criteria:** ผู้ใช้เข้า flow ทดลองหรือสมัครได้จริง และมี error/success state ที่ตรวจสอบได้

## Phase 4 — Billing และ Operations

- [ ] ยืนยัน pricing, billing owner, tax และ cancellation policy
- [ ] เชื่อม payment/subscription provider หลังอนุมัติ
- [ ] วาง entitlement และสถานะ subscription
- [ ] เพิ่ม catalog workflow หรือ CMS เมื่อมี product มากพอ
- [ ] เพิ่ม monitoring, backup, security review และ release checklist

**Exit criteria:** subscription flow ใช้งานจริง มี owner และ rollback/support procedure

## Phase 5 — Scale the Hub

- [ ] เพิ่ม category/use-case landing pages
- [ ] เพิ่ม bundle/cross-product recommendation
- [ ] account area รวม product ที่เปิดใช้งาน
- [ ] พิจารณา vendor/admin portal เมื่อ business model พร้อม

## Working Rules

1. ห้ามแก้ `local-service-booking-saas` จากงาน storefront
2. ห้ามเพิ่ม effect ก่อนผ่าน design rules และ performance check
3. ห้ามใช้ review/rating/testimonial จำลอง
4. ทุก milestone ต้องมี acceptance checklist และ checkpoint
5. หาก requirement เปลี่ยน ให้บันทึกใน `DECISIONS.md` ก่อนแก้โค้ด
