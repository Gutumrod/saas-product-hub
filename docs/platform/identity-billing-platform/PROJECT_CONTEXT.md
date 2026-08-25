# Project Context: Hub Identity, Entitlement & Billing Platform

**Last Updated:** 2026-08-25
**Current Phase:** Pre-implementation — PRD drafted, awaiting owner approval
**Progress:** 0% (planning only)
**Next Session:** รอเจ้าของอนุมัติ PRD.md แล้วเริ่ม Phase 1 (billing engine wiring)

---

## 🎯 สถานะปัจจุบัน

### เสร็จแล้ว (Completed — ของเดิมที่ต่อยอดได้)
| ส่วน | รายละเอียด | เสร็จเมื่อ |
|-------|-------|-----------|
| hub-web → Cloudflare Workers | Deploy จริงที่ `wstera.com`, DB ต่อได้ | 2026-08-25 |
| `product_installations` table | จุดเริ่มต้นของ entitlement tracking — บันทึกมือที่ `/admin/customers` หรือ webhook | 2026-08-24 (Phase 9) |
| `products/stripe-billing` modules | payment, subscription+entitlement engine, webhook-receiver, audit-log — 291/291 tests | ก่อนหน้านี้ (ไม่ทราบวันที่แน่ชัด ดู module VERSION) |
| `modules-hub/modules/event-bus` | publish/subscribe เสร็จ v0.1.0 | ก่อนหน้านี้ |
| Discovery interview (5 หัวข้อ) | Vision, product/module criterion, constraints, pricing, data/integrations — ทั้งหมดยืนยันแล้วในเซสชันนี้ | 2026-08-25 |

### ยังไม่ได้ทำ (Pending)
| Phase | Tasks | Priority | Depends On |
|-------|-------|----------|------------|
| Phase 1 | Wire stripe-billing modules เข้า server จริง, isolate hosting | High | อนุมัติ PRD |
| Phase 2 | Schema `organizations`/`product_entitlements`/`platform_audit_events` ที่ hub-web DB | High | Phase 1 |
| Phase 3 | event-bus wiring (Hub → product) + platform-client module ใหม่ | High | Phase 2 |
| Phase 4 | Checkout UX (ตะกร้าหลายโปรดักต์, ส่วนลด 10%, ใบเสร็จรวม) | Medium | Phase 2 |
| Phase 5 | `booking` subdomain ต่อร้าน (pilot) | Medium | Phase 3, ต้องรอ booking deploy จริงก่อน (ยังไม่ deploy) |

---

## 📝 Last Session Summary

**Session Date:** 2026-08-25

### ทำอะไรเสร็จไปบ้าง
- ✅ ผูก `wstera.com` เป็น custom domain ของ hub-web Worker (แยกงานจาก platform นี้ แต่ทำในเซสชันเดียวกัน)
- ✅ Discovery interview ครบ 5 หัวข้อ สำหรับ platform ใหม่นี้
- ✅ อ่านโค้ด/เอกสารจริงยืนยันว่า billing engine + tenant-context + event-bus **มีอยู่แล้วใน modules-hub แต่ไม่มีใครต่อสายใช้**
- ✅ แก้ความเข้าใจผิดของตัวเอง 2 จุดระหว่างสนทนา (ดู "บทเรียนที่ได้")

### เจอปัญหาอะไร
- ⚠️ ตอนแรกเข้าใจผิดว่า `docs/products/registry.yaml` กับ `docs/platform/ROADMAP.md` ขัดกันเรื่อง `short_url_analytics`
  - **ความจริง:** ไม่ขัดกัน — registry.yaml คือ declared target, ROADMAP.md คือ verified status ตามที่ registry.yaml เขียนกฎไว้เองแล้ว (บรรทัด 4-7)
- ⚠️ ตอนแรกประเมินว่า "subdomain ต่อร้าน" เป็นงาน infra หนัก (เข้าใจผิดว่าเหมือน custom domain ของลูกค้า)
  - **ความจริง:** เป็นแค่ wildcard subdomain ใต้โดเมนที่เป็นเจ้าของอยู่แล้ว (`*.booking.wstera.com`) — เบากว่าที่คิดมาก จุดที่ต้องระวังจริงมีแค่ wildcard SSL 2 ชั้น

### บทเรียนที่ได้
- 💡 ก่อนตอบคำถามสถาปัตยกรรมในโปรเจกต์นี้ ต้องอ่านไฟล์เต็ม (`registry.yaml` ทั้งไฟล์, `modules-hub/INDEX.md`, `SHARED_SAAS_RUNTIME_PROJECT_B_PLAN.md`) ไม่ใช่แค่ grep บางส่วน — ดู memory `feedback-deep-research-over-doc-skim`
- 💡 ต้องแยก "custom domain ของลูกค้า" กับ "wildcard subdomain ใต้โดเมนที่เราเป็นเจ้าของ" ให้ชัด — คนละความยากกันมาก อย่าปนกัน

---

## 🚀 Next Steps

### ต้องทำอะไรต่อ (ลำดับความสำคัญ)
1. **High Priority:**
   - [ ] เจ้าของอ่าน `PRD.md` + `implementation_plan.md` แล้วอนุมัติ (หรือแก้ scope)
   - [ ] ตัดสินใจเรื่อง `pawspace` — จะเสนอย้ายจาก self-hosted-sold เป็น hosted subscription ผ่านระบบนี้ไหม (ยังไม่ตัดสิน)
   - [ ] คิดจำนวนวัน free tier ต่อโปรดักต์ให้จบ (ค้างจาก interview ข้อ 3)

2. **Medium Priority:**
   - [ ] เริ่ม Phase 1 (billing engine wiring) หลังอนุมัติ

### Skills/Tools ที่ต้องใช้ครั้งหน้า
- อ่าน `products/stripe-billing/modules/*/MODULE.md` แต่ละตัวก่อนเริ่ม wiring จริง (ยังไม่ได้อ่าน MODULE.md ละเอียด แค่เห็น REGISTRY.md สรุป)
- ตรวจ Cloudflare Advanced Certificate Manager ราคา/วิธีเปิดจริงก่อนตัดสินใจ subdomain 2 ชั้น

---

## ❓ Open Questions / Decisions Needed

| คำถาม | ต้องตัดสินใจเมื่อ | Impact |
|-------|------------------|--------|
| Free tier กี่วันต่อโปรดักต์ (แต่ละตัวต่างกันไหม) | ก่อน Phase 2 (schema ต้องรู้ shape ของ trial field) | Medium |
| `pawspace` ย้ายเป็น hosted subscription ไหม | ก่อนแก้ `registry.yaml` `deployment_model` | High — กระทบ commercial model ของ pawspace ทั้งหมด |
| Billing service host ที่ไหน (Cloudflare Worker แยก? ชื่ออะไร?) | Phase 1 | High |
| `*.booking.wstera.com` หรือ `*.wstera.com` (wildcard 1 หรือ 2 ชั้น) | Phase 5 | Medium — กระทบ cost (Advanced Cert Manager) |

---

## 📁 ไฟล์สำคัญในโปรเจกต์นี้

| ไฟล์ | Path | หน้าที่ |
|------|------|--------|
| PRD.md | `./PRD.md` | Objective, architecture, phases, risks |
| implementation_plan.md | `./implementation_plan.md` | ขั้นตอนทำจริงเชิงลึก + verification plan |
| SHARED_SAAS_RUNTIME_PROJECT_B_PLAN.md | `../SHARED_SAAS_RUNTIME_PROJECT_B_PLAN.md` | ต้นแบบสถาปัตยกรรม Project A/B เดิม |
| registry.yaml | `../../products/registry.yaml` | สถานะจริงของทุกโปรดักต์ |
