# 🏛️ สรุปการประชุมสภา — Core รับเงิน (PromptPay + ตัดบัตรอัตโนมัติ) สำหรับ WSTERA

**วันที่:** 2026-09-01
**Chairman:** Hermes
**สภา:** Claude, Codex, Qwen, AGY (4 ตัว)
**รอบ:** R1 independent answers → R2 blind peer review (D > C > B > A)
**ประเด็น:** สถาปัตยกรรม core รับเงินจากลูกค้า ใช้กับ WSTERA.com หลายโปรดักต์

---

## 📋 ข้อมูลดิบ (สำหรับ audit)
- คำตอบ R1: `raw/round1/01-Codex.md` ~ `04-AGY.md`
- Review R2: `raw/round2/01-Claude-review.md` ~ `04-AGY-review.md`
- Anonymized bundle: `raw/bundle/council-r2-bundle.md`

---

## 🎯 โจทย์

สร้าง core รับเงินจากลูกค้า ใช้กับ WSTERA.com (หลายโปรดักต์ แต่ละตัวเก็บเงินต่างกัน) โดย:
1. แพทเทิร์นรับเงินด้วย **PromptPay** (QR / ตรวจยอด)
2. **ตัดบัตรอัตโนมัติรายเดือน** (subscription billing — ความแม่นยำสูง ห้ามพลาด)

ทั้ง 2 ต้องมาคู่กันเสมอ และ **plug-and-play** — เอาไปใช้กับโปรดักต์ไหนก็ได้ แค่เปลี่ยนราคา/รายละเอียด

---

## 🏆 Council Verdict (Chairman ตัดสิน)

### สถาปัตยกรรมที่เลือก (อิง Candidate D — Codex, ได้รับโหวตสูงสุด 4/4)

**Thin Billing Orchestrator** เหนือ Payment Core + Subscription Core (ModuleHub ที่มีอยู่):

```
WSTERA Control Plane (มีอยู่แล้ว — แยก Customer/Product/Tenant)
   │
   ├─ Product A · Product B · Product C · ...   (หลายโปรดักต์)
   │        └─ แต่ละ product ตั้ง config: ราคา, ฟรีเทียร์, ระยะ grace
   │
   ▼
   Billing Orchestrator (ใหม่ — บางๆ)
   │        └─ รับ billing event → normalize → ส่งลง core
   ▼
 Subscription Core (มีแล้ว)     ← source of truth ของ lifecycle + entitlements
   │        └─ idempotency ledger (saveForBillingEvent) = หัวใจความแม่นยำ
   ▼
 Payment Core (มีแล้ว)          ← abstraction ของการจ่ายครั้งเดียว
   │        └─ PaymentProvider interface = จุด plug ของ adapter
   ▼
 Provider Adapters
   ├─ **stripe-adapter.ts** (มีแล้ว)   ← Stripe card = recurring rail หลัก
   └─ **promptpay-adapter.ts** (ใหม่)  ← PromptPay = one-time QR (ผ่าน Stripe PromptPay)
```

### องค์ประกอบที่ต้องสร้าง/เพิ่ม (จาก consensus 4/4)
1. **PromptPay adapter** ใหม่ใน payment module (implement `PaymentProvider` contract เดียวกับ Stripe)
2. **Reconciliation layer** (ใหม่) — scheduled job poll pending payments กัน "webhook พลาด → เงินหาย" ← *ทุกตัวเน้นว่าสำคัญที่สุด*
3. **Dunning/Retry + Reconciliation Engine** ใน subscription core (decline classification, retry schedule)
4. **Billing Orchestration** (บางๆ) — host-level, dunning/retry = product policy ไม่ใช่ hard-coded ใน core

### จุดที่ทุกตัวเห็นตรงกัน (consensus)
| # | ข้อ | เหตุผล |
|---|-----|--------|
| 1 | ใช้ Payment+Subscription Core เดิมเป็นฐาน | อย่าสร้างใหม่ อย่า merge — plug-and-play อยู่แล้ว |
| 2 | PromptPay = adapter ใหม่ ไม่ใช่ core ใหม่ | เป็น rail async ต่างจากบัตร แต่ PaymentProvider contract ครอบคลุมได้ |
| 3 | **PromptPay ไม่ auto-renew** | Stripe card ต้องเป็น recurring rail หลัก |
| 4 | ต้องมี reconciliation layer | webhook อย่างเดียวไม่พอ — กัน "เงินหาย" |
| 5 | Idempotency ledger เป็นหัวใจ | `saveForBillingEvent` atomic กัน double-process/replay |
| 6 | Stripe จัดการ dunning/retry (Smart Retries 8 ครั้ง/2 สัปดาห์) | core ไม่ implement dunning ซ้ำ |

### จุดที่ต้องระวัง (จาก reviews)
- **A อ่อนสุด** — พลาด reconciliation layer (เสี่ยงเงินหาย) แต่ไม่มี fatal flaw ตัวไหน
- **C ชนะเรื่อง correctness** — ต้อง re-fetch + amount match อย่าเชื่อ webhook body
- **B ชนะเรื่อง reconciliation gap + grace→expired** (ไม่มี transition อัตโนมัติ ต้อง scheduled job)
- **D ครบถ้วน+grounded** — host-side idempotency (bank API ไม่มี Idempotency-Key), daily reconciler, product policy

---

## ✅ การตัดสินใจของผู้ใช้ (คุณฟรี) — 4 ข้อ

| ข้อ | คำถาม | คำตอบ |
|----|-------|-------|
| 1 | เลือก gateway? | **Stripe** — สมัครไว้แล้ว |
| 2 | ลูกค้าไม่มีบัตร (PromptPay-only)? | **ยอมรับ PromptPay** (คนไทยถนัด QR). กติกา: แจ้งเตือนทางเมลก่อนหมด 2-5 วัน → ไม่จ่ายหลังหมด 3 วัน → ตัดกลับฟรีเทียร์ (ถ้ามี). ถ้าไม่มีฟรีเทียร์ → แจ้งก่อนหมด 5 วัน + หลังหมดอีกครั้ง → ตัดเลย (แต่เก็บประวัติว่าสมัครเคย เพื่อกลับมาสมัครใหม่) |
| 3 | Refund? | **เปิด ticket เคลม → เจ้าหน้าที่โอนมือ** (คุณฟรีเอง) |
| 4 | Multi-product แยกยังไง? | **ดูโครงสร้างโปรเจกต์** — ตกลงเป็น core กลาง ใช้ร่วมทุก product แยกด้วย product/tenant ID + config ต่อ product (สอดคล้องกับ WSTERA Control Plane ที่มีอยู่) |

---

## ✅ Stripe PromptPay — พร้อมใช้ (เช็คจาก docs ทางการ 2026-09-01)

| จุด | Stripe PromptPay |
|-----|:--:|
| บัญชีไทย (TH) รับได้ | ✅ (ต้องบัญชีไทยจึงเปิดได้ตรงๆ) |
| สกุลเงิน | THB |
| **Refunds / Partial refunds** | ✅ **Yes / Yes** ← ตรงกับข้อ 3 (เปิด ticket → คืน) |
| Billing support (subscription) | ✅ |
| Connect support | ✅ |
| Webhook ยืนยันทันทีเมื่อจ่าย | ✅ |
| QR ให้ลูกค้าสแกน | ✅ |

**ข้อควรตรวจต่อ:** ตอนนี้ secrets มี `STRIPE_*_BOOKING2` (sandbox) — ต้องยืนยันว่าบัญชี Stripe ที่คุณฟรีสมัครเป็น **บัญชีไทย (TH)** ก่อนเปิด PromptPay

---

## 🚦 Gate Verdict: **PASS**

Direction ชัดเจนแล้ว (Candidate D) + 4 ข้อของผู้ใช้ตอบครบ + Stripe PromptPay พร้อม → **เดินหน้าสร้างได้**

**ยังต้องตัดสินใจ/ตรวจต่อก่อน implement:**
1. ✅ ยืนยันบัญชี Stripe เป็นของไทย (TH) — เปิดใช้งาน PromptPay ได้จริง
2. การออกแบบ **Billing Orchestrator + Reconciliation layer** รายละเอียด (cadence, scheduler บน CF Workers)
3. ลำดับการสร้าง (จะถามสภารอบถัดไป)

---

## 🔗 การ์ดที่ใช้ (audit)
- R1: `t_aac1da35` (Claude) · `t_1972a75f` (Codex) · `t_aeb73630` (Qwen) · `t_44425987` (AGY)
- R2: `t_5e4b0ab1` (Claude) · `t_3aa2fc30` (Codex) · `t_5c66909c` (Qwen) · `t_711f8399` (AGY)
