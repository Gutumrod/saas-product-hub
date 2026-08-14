# Visual Check — Apple-inspired Revision

ตรวจเมื่อ 13 สิงหาคม 2026 หลังปรับหน้า Landing Page เป็น Apple Clean & Precision และใช้ Noto Sans Thai เป็นฟอนต์หลัก

## Desktop 1280px
หน้าเว็บแสดงลำดับชัดเจนเป็น hero, product dashboard mockup, feature bento, workflow, pricing, FAQ, final CTA และ footer โดยใช้พื้นขาว/เทาอ่อน ตัวอักษร charcoal และ dark green เฉพาะปุ่ม/ไอคอน/แบรนด์ตามที่ตั้งใจไว้ Product mockup กลาง hero ทำให้หน้าเว็บมีจุดศูนย์กลางแบบ product page มากกว่าหน้า copy ยาว

## Mobile 390px
เมนูซ่อนใน mobile nav, dashboard ยุบเหลือ content หลัก, bento/workflow/pricing เรียงเป็นคอลัมน์, FAQ และ CTA ยังคงอ่านง่าย แพ็กเกจ Pro ยังแยกด้วยพื้นดำอย่างชัดเจน ปุ่มและลิงก์สำคัญยังอยู่ในลำดับที่เข้าถึงได้

## Validation
`pnpm check` และ `pnpm build` ผ่านเรียบร้อยแล้ว มีเพียงคำเตือนจาก pnpm เรื่องค่า config เดิมและคำเตือน bundle size ของ Vite ซึ่งไม่ทำให้ build ล้มเหลว
