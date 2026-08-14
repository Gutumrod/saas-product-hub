# Decision Log

## D-001 — แยก storefront จากระบบหลัก
**สถานะ:** Accepted  
แยก release cycle, ลด coupling และป้องกันการแก้ business logic โดยไม่ตั้งใจ การเชื่อมต่ออนาคตต้องผ่าน contract ที่ชัดเจน

## D-002 — Apple-inspired Clean & Precision
**สถานะ:** Accepted  
เลือก positioning แบบ premium, calm และน่าเชื่อถือ ใช้ whitespace และ hierarchy มากกว่า visual effect

## D-003 — ใช้ Noto Sans Thai
**สถานะ:** Accepted  
รองรับภาษาไทย/อังกฤษในระบบ typography เดียวกัน และต้องตรวจ line-height/wrapping ทั้งสองภาษา

## D-004 — รวม language/theme controls
**สถานะ:** Accepted  
รวมไว้ใน control cluster เดียวเพื่อค้นพบง่ายและประหยัดพื้นที่ header ต้องมี label, focus state และ persistence

## D-005 — Magic UI แบบ selective enhancement
**สถานะ:** Accepted  
ใช้เฉพาะ hero, primary CTA หรือ featured product เพื่อรักษาความนิ่งและ performance พร้อม reduced-motion fallback

## D-006 — Typed local catalog ใน MVP
**สถานะ:** Accepted for MVP  
ทำให้เริ่มสร้าง UI ได้เร็วและย้ายไป CMS/API ได้ภายหลังผ่าน adapter

## D-007 — ไม่สร้าง social proof จำลอง
**สถานะ:** Accepted  
ใช้เฉพาะข้อมูลจริงและ product facts เพื่อรักษาความน่าเชื่อถือ

## D-008 — Payment deferred
**สถานะ:** Deferred  
ต้องยืนยัน pricing, auth, entitlement และ policy ก่อนเชื่อม payment จริง

## Open Decisions

- [ ] ชื่อแบรนด์และ domain
- [ ] auth provider และ account model
- [ ] payment provider และ pricing model
- [ ] product app URL strategy
- [ ] local catalog, CMS หรือ API ในระยะหลัง
