# Product Requirement Document (PRD)

## SaaS Product Hub & Software Marketplace

**สถานะ:** Planning baseline  
**ขอบเขต:** Marketing storefront แยกจาก `local-service-booking-saas`

## 1. วิสัยทัศน์

SaaS Product Hub คือหน้าร้านกลางสำหรับนำเสนอ ค้นหา เปรียบเทียบ และพาผู้ใช้ไปสมัครใช้งานซอฟต์แวร์หลายผลิตภัณฑ์ภายใต้แบรนด์เดียวกัน เริ่มจาก ServiceBooking SaaS และขยายไปยัง Booking, CRM, Inventory, POS และเครื่องมือธุรกิจอื่นในอนาคต

หน้าที่ของ storefront คือสร้างความเข้าใจ ความเชื่อมั่น และ conversion ก่อนเข้าสู่ product app ไม่ใช่การย้าย dashboard หรือ business logic จากแอปหลักมาไว้ที่นี่

## 2. หลักการผลิตภัณฑ์

1. **One Hub, Many Products:** ค้นพบทุกผลิตภัณฑ์จากศูนย์กลาง แต่มี positioning และหน้า detail ของตัวเอง
2. **Marketing First:** ทุกส่วนต้องช่วยให้ผู้ใช้เข้าใจคุณค่าและไปยัง CTA ที่ถูกต้อง
3. **Separation of Concerns:** แยก storefront จากแอปหลักทั้งโค้ด การ deploy และข้อมูล
4. **Premium Simplicity:** Apple-inspired Clean & Precision ใช้ whitespace, hierarchy และ Noto Sans Thai
5. **Progressive Commitment:** สำรวจ → ดูรายละเอียด → ทดลองใช้ → สมัคร → เข้าแอป
6. **Honest Communication:** ห้ามสร้าง review, rating, testimonial หรือ social proof ที่ไม่มีข้อมูลจริง

## 3. เป้าหมายและขอบเขต

### Goals

- เปลี่ยน landing page เดิมเป็น storefront รองรับหลาย SaaS
- ให้ค้นหาและกรองผลิตภัณฑ์ได้บน desktop และ mobile
- มี Product Detail ที่สื่อ value proposition, feature, workflow, ราคา และ CTA
- รองรับภาษาไทย/อังกฤษ และ Light/Dark จาก control cluster เดียวกัน
- เพิ่ม product ใหม่ผ่าน schema กลางโดยไม่ copy หน้าใหม่ทั้งชุด
- เตรียมจุดเชื่อมต่อ auth, subscription และ product app

### Non-goals ของ MVP

- ไม่มี dashboard ภายใน storefront
- ไม่มี catalog admin/CMS ในเฟสแรก
- ไม่ย้ายฐานข้อมูลหรือ business logic จาก `local-service-booking-saas`
- ยังไม่ทำ payment จริงจนกว่าจะยืนยัน provider, pricing และ policy
- ยังไม่รองรับ vendor ภายนอก

## 4. กลุ่มผู้ใช้

| กลุ่ม | Job-to-be-done | ความต้องการ |
|---|---|---|
| เจ้าของธุรกิจ | หาเครื่องมือช่วยงาน | เข้าใจประโยชน์และราคาเร็ว |
| ผู้ให้บริการนัดหมาย | ลดงานแอดมิน | เห็น workflow และทดลองง่าย |
| ผู้จัดการทีม | เปรียบเทียบซอฟต์แวร์ | ค้นหา กรอง และเปิดหลาย detail |
| ผู้ใช้เดิม | เข้าแอปที่สมัครไว้ | Login/Dashboard link ชัดเจน |
| เจ้าของ product | เพิ่ม SaaS ใหม่ | ใช้ schema และ template ร่วมกัน |

## 5. Information Architecture

- `/` — Hub homepage, featured products, categories และ CTA
- `/products` — catalog, search, filters, sorting และ empty state
- `/products/:slug` — product detail, benefits, features, workflow, pricing, FAQ และ CTA
- `/pricing` — pricing overview หรือ product-specific pricing
- `/login`, `/signup` — จุดเชื่อมต่อ auth ในเฟสถัดไป
- `/app/:productSlug` — handoff ไป product app ไม่ใช่ dashboard ของ storefront

ทุกหน้าต้องมีทางกลับ Hub, language/theme controls และ CTA ที่ไม่เกิด dead-end

## 6. Functional Requirements

| ID | Requirement | Priority | เกณฑ์ยอมรับ |
|---|---|---:|---|
| FR-001 | Global header | P0 | brand, nav, language/theme controls, CTA และ keyboard access |
| FR-002 | Hub hero | P0 | สื่อ positioning และพาไป catalog/featured product |
| FR-003 | Product catalog | P0 | cards ขับเคลื่อนจาก data source กลาง |
| FR-004 | Search | P0 | ค้นชื่อ/tagline/category/keyword TH/EN และมี empty state |
| FR-005 | Category filter | P0 | filter, active state และ reset ใช้งานได้ |
| FR-006 | Product detail | P0 | route, feature summary, CTA และ content ครบ |
| FR-007 | Theme | P0 | Light/Dark contrast ถูกต้องและจำค่าด้วย localStorage |
| FR-008 | Language | P0 | TH/EN ไม่ทำให้ route หรือข้อมูลหาย |
| FR-009 | Responsive | P0 | 375px, 768px, desktop และไม่มี horizontal overflow |
| FR-010 | Accessibility | P0 | semantic landmarks, focus, alt, labels และ contrast |
| FR-011 | Auth/trial | P1 | handoff พร้อม success/error state หลังยืนยัน provider |
| FR-012 | Subscription | P1 | pricing/checkout/entitlement หลังยืนยัน business model |

## 7. Product Detail ขั้นต่ำ

ชื่อ product, category, status, one-line value proposition, visual พร้อม alt text, ปัญหาที่แก้, feature groups, workflow, ราคาเมื่อ approved, FAQ, ข้อจำกัด และ CTA หลักที่ชัดเจน

## 8. Content และ Localization

ข้อความที่แสดงต้องอยู่ใน translation dictionary หรือ product object ห้ามต่อ string ผสมภาษาใน component โดยตรง ภาษาไทยต้องชัดเจนเป็นมืออาชีพ ภาษาอังกฤษต้องเป็น natural product copy และ product ที่ยังไม่พร้อมต้องใช้ “กำลังเตรียมเปิดตัว” หรือ “Coming soon” อย่างตรงไปตรงมา

## 9. Design และ Motion

ใช้ Apple-inspired Clean & Precision: whitespace มีจังหวะ, typography ชัด, accent ใช้เพื่อ hierarchy และ motion ช่วยอธิบาย state เท่านั้น Magic UI ใช้แบบ selective enhancement เฉพาะ hero, CTA หลัก หรือ featured product พร้อม reduced-motion fallback

## 10. Baseline Metrics

- Product detail CTR จาก catalog >= 20%
- Search/filter usage >= 15%
- CTA CTR จาก detail >= 8%
- Mobile layout blocker = 0
- Mobile Lighthouse performance >= 85

ตัวเลขเป็น baseline สำหรับวัดผล ไม่ใช่คำรับประกันทางธุรกิจ

## 11. Release Acceptance

- [ ] Hub → catalog → detail ไม่มี dead-end
- [ ] Search, filter และ reset ทำงานถูกต้อง
- [ ] Product data ไม่มี placeholder สำคัญก่อนเผยแพร่
- [ ] TH/EN และ Light/Dark ครบทุกหน้าที่อยู่ใน scope
- [ ] CTA มีปลายทางจริงหรือระบุ coming soon
- [ ] ตรวจ keyboard, focus, alt text และ reduced motion
- [ ] ตรวจ mobile/desktop และ console error
- [ ] ยืนยันว่าไม่ได้แก้ `local-service-booking-saas`

## 12. Open Questions

- auth provider และ account model
- pricing แบบ per-product, bundle หรือ unified subscription
- catalog ระยะหลังใช้ repository, CMS หรือ database
- product app ใช้ subdomain, path หรือ domain แยก
- ข้อกำหนดภาษี ใบเสร็จ และการยกเลิก
