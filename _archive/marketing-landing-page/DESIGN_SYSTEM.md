# Design System & Magic UI Guidelines

## Design Direction

**Apple-inspired Clean & Precision** — premium, calm, clear และมีพื้นที่หายใจ ไม่ทำให้ storefront ดูเหมือน template marketplace ทั่วไป

## Core Principles

- Content hierarchy มาก่อน effect
- ใช้ whitespace เป็นองค์ประกอบ ไม่ใช่พื้นที่เหลือ
- สี accent ใช้เพื่อ action และ status ที่สำคัญ
- ทุก interaction ต้องตอบสนองเร็วและไม่รบกวนการอ่าน

## Typography

- Primary: **Noto Sans Thai**
- Headline: น้ำหนัก 600–700, line-height กระชับแต่ไม่อัดภาษาไทย
- Body: น้ำหนัก 400–500, line-height 1.65–1.8
- Caption/label: ห้ามเล็กจนอ่านภาษาไทยยาก
- หลีกเลี่ยง Inter เป็น default และหลีกเลี่ยงการใช้หลาย font โดยไม่มีเหตุผล

## Color Philosophy

- Light: off-white/white, charcoal, muted gray และ signature dark green ของแบรนด์
- Dark: near-black, warm white, muted green และ accent ที่สว่างขึ้นอย่างมี contrast
- ห้ามใช้ purple gradient เป็น visual default
- ทุก semantic background ต้องจับคู่ foreground ที่อ่านได้จริง

## Layout

- ใช้ asymmetric composition และ editorial rhythm เมื่อเหมาะสม
- จำกัด container width เพื่อให้ข้อความอ่านง่าย
- ไม่ทำทุก section เป็น card ที่มี border/radius เหมือนกัน
- Product cards ต้องมีลำดับ: identity → value → status → action

## Magic UI Policy

| Component family | ใช้ตรงไหน | ข้อจำกัด |
|---|---|---|
| Spotlight/soft glow | hero หรือ featured product | ต้องไม่ทำให้ข้อความเสีย contrast |
| Shimmer button | primary CTA หนึ่งจุดต่อ viewport | ไม่วนตลอดเวลาและมี reduced-motion |
| Border Beam | featured card หรือ announcement | ไม่ใช้กับทุก card |
| Marquee | logo/feature strip ที่ไม่ใช่ข้อมูลสำคัญ | หยุดได้ด้วย prefers-reduced-motion |
| Particles | ใช้ได้เฉพาะ background ที่ไม่รบกวน content | จำกัด density และไม่ใช้เป็น default |

Magic UI เป็น enhancement ไม่ใช่โครงสร้างหลัก หากปิด animation แล้ว UX ต้องยังสมบูรณ์

## Motion

- button press 100–160ms
- dropdown 150–250ms
- ใช้ transform/opacity เป็นหลัก
- ใช้ ease-out ที่ snappy และไม่ใช้ ease-in กับ UI
- รองรับ `prefers-reduced-motion: reduce`

## Accessibility

ทุก icon button มี accessible label, ทุก image มี alt ที่มีความหมาย, focus ring มองเห็นได้, keyboard เข้าถึงได้ และต้องตรวจ contrast ในทั้ง Light/Dark

## Brand Voice

หัวข้อควรตรงประเด็นและบอกผลลัพธ์ ไม่ใช้ filler เช่น “Welcome to our website” ตัวอย่าง: “ซอฟต์แวร์ที่ช่วยให้ธุรกิจเดินหน้าได้เป็นระบบ” และ “เลือกเครื่องมือให้ตรงกับงาน ก่อนเสียเวลาไปกับระบบที่ไม่ใช่”
