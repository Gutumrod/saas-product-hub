# 🏛️ สรุปสภารอบ 2 — ลำดับการสร้าง + ปลายทาง Core รับเงิน WSTERA

**วันที่:** 2026-09-01
**Chairman:** Hermes
**สภา:** Claude, Codex, Qwen, AGY (4 ตัว — R3)
**ข้อมูลดิบ:** `raw/round3/01-Claude.md` ~ `04-AGY.md`
**Confidence:** Claude 82 · Codex 86 · Qwen 82 · AGY 95 (เฉลี่ย 86)

---

## 🎯 โจทย์
ลำดับการสร้าง core รับเงิน (PromptPay + ตัดบัตรอัตโนมัติ) ควรทำอะไรก่อน-หลัง และปลายทางจบที่ตรงไหน (ใช้เอง vs ขาย product)

---

## 🏆 Consensus (4/4 เห็นพ้องบนหลักเดียวกัน)

### ลำดับการสร้าง — หลักสำคัญ
ทุกตัวเห็นตรงกันว่าเริ่มจาก **"ความปลอดภัยของเงินก่อน (money correctness spine)"** ไม่ใช่เริ่มจาก UI/PromptPay:

**Phase 0 — Stripe TH Preflight (บล็อกเกอร์)**
- ยืนยัน Stripe account = **บัญชีไทย (TH)** + เปิด PromptPay ได้จริง → ถ้าไม่ใช่ TH ต้องหยุดก่อน
- Pin Stripe API version (adapter เดิมใช้ optional — ต้อง explicit)
- รัน test payment + subscription ให้เขียว

**Phase 1 — ปิด Subscription Core Gaps + Idempotency Ledger**
- แก้ `gracePeriodDays` (comment out อยู่) + transition payment_failed → past_due → grace_period (เก็บ graceEndsAt)
- สร้าง table `processed_billing_events` unique constraint + `saveForBillingEvent` atomic transaction
- เพิ่ม scheduled job `grace_period → expired`

**Phase 2 — Stripe Card End-to-End (เส้นเงินแรก)**
- สร้าง thin Billing Orchestrator รับ webhook → normalize → ยิง subscription core
- พิสูจน์ card recurring happy path ใน test mode (สมัคร→จ่าย→active→renew)

**Phase 3 — Reconciliation Layer (⚠️ ต้องมาก่อน PromptPay)**
- **ทุกตัวเน้นว่าแยกกันไม่ได้:** PromptPay เป็น async rail ที่ webhook หลุดได้ → เงินหาย
- Scheduled job poll pending → re-fetch จาก Stripe + amount match → กัน "จ่ายแล้วสิทธิ์ไม่เปิด"

**Phase 4 — PromptPay Adapter (ทำทีหลัง reconciliation)**
- `promptpay-adapter.ts` implement PaymentProvider เดิม (createPayment → QR, getPayment สำหรับ poll)
- ไม่มี auto-renew — ใช้สำหรับ manual/one-time

**Phase 5 — พิสูจน์ Multi-Product (product ที่ 2)**
- ออนบอร์ด product ที่ 2 ด้วย config ต่าง → ยืนยัน product/tenant scoping แยกจริง
- Decision 4 ของคุณฟรี (shared core แยก product ID) จะจริงได้ต้องมี >1 product

**Phase 6 — Production Cutover (เงินจริง)**
- สลับ live key, เปิด PromptPay จริง, refund = ticket + โอนมือ
- ผ่านเกณฑ์: รอบ billing จริง 1 เดือนไม่มีเงินหายเงียบ

> **หมายเหตุ:** Claude/AGY วาง PromptPay ไว้ช่วงหลัง (card ก่อน) ส่วน Codex/Qwen วาง PromptPay ไว้ก่อน recurring — แต่ทั้ง 4 เห็นตรงกันเรื่อง **reconciliation ต้องมาก่อน PromptPay** และ **Stripe card เป็น recurring rail หลัก** ซึ่งเป็นประเด็นที่สำคัญสุด

---

## 🏆 ปลายทาง — Consensus เข้มแข็ง

**ทุกตัว (4/4) เห็นตรงกัน: "Internal-First แล้วค่อย Productize"**

### ปลายทางที่ถูกต้อง
> **สร้างเพื่อใช้ภายใน WSTERA ให้สมบูรณ์ก่อน (dogfood) → พิสูจน์ว่าของจริงเสถียร ≥ 1-2 รอบ billing → แล้วค่อยหุ้มเป็น Billing-as-a-Service ขาย**

- **ไม่ใช่** internal-only (เสียโอกาส — BRIEF `stripe-billing` รออยู่ + มีสินค้า >10 ตัวในบ้านที่เก็บเงินคนละแบบ = first customers อยู่ในบ้าน)
- **ไม่ใช่** ขายทันที (ระบบยัง Experimental 0.1.0 — ขายก่อนใช้เอง = รับภาระ SLA/support/compliance ทั้งที่ยังไม่พิสูจน์)

### ต้องเพิ่ม/เปลี่ยนถ้าขาย (vs internal):
| มิติ | Internal | ขาย (BaaS) |
|-----|----------|:--:|
| Tenant isolation | แยก productId ภายใน | API key ต่อ tenant, zero-trust |
| Onboarding | ฝัง config ทีมงาน | Self-serve UI, สมัครเอง |
| Refund | ticket + คุณฟรีโอนมือ | Self-serve portal + SLA |
| Compliance | internal risk | PDPA + PCI (SAQ-A) + audit export |
| Stripe Connect | บัญชีเดียว | tenant ใช้บัญชีตัวเอง (เฉพาะ marketplace) |
| Dashboard/Support | ดู Stripe Dashboard ตรง | Tenant dashboard + 24/7 support |
| ราคา BaaS | — | ยัง TODO (BRIEF) |

---

## ⚠️ ความเสี่ยงหลัก (ทุกตัวเห็นตรงกัน)

1. **Stripe ไม่ใช่ TH** → PromptPay ใช้ไม่ได้ทั้งแผน (Rank สูงสุด) → Phase 0 = hard gate
2. **Webhook พลาด → เงินหาย** (PromptPay) → Reconciliation ต้องมาก่อน PromptPay (strict)
3. **Idempotency ไม่ atomic** → double credit / duplicate renewal → unique claim + replay test
4. **grace_period → expired job พัง** = money leak เงียบ → ทำ Phase 1 ก่อน + monitor
5. **Scope creep ไป productization เร็วเกิน** → internal dogfood ผ่านก่อน
6. **Bus factor = คุณฟรีคนเดียว** (refund + support) → ใช้ได้ตอน internal, ขายต้องมี tooling

---

## 🚦 Gate Verdict: **PASS (พร้อมสร้าง)**

- สถาปัตยกรรม settle แล้ว (R1) + ลำดับชัดเจน (R3) + ปลายทางชัด
- **ขั้นตอนถัดไปทันที:** Phase 0 — เช็คว่า Stripe account ของคุณฟรีเป็นบัญชีไทย (TH) ไหม → pin API version

---

## 🔗 การ์ด R3 (audit)
- `t_25d2e2e5` (Claude) · `t_336f82b6` (Codex) · `t_fab6a763` (Qwen) · `t_9f2f4fb9` (AGY)
