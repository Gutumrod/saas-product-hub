# 🏛️ FINAL CODEX SYNTHESIS — Council Payment Core WSTERA

**ผู้สังเคราะห์:** Codex (Independent Synthesizer) ตาม llm-council-gate v2
**Coordinator/Delivery:** Hermes
**Final Authority:** คุณฟรี (owner)
**วันที่:** 2026-09-02

> **หมายเหตุจัดทำ:** เอกสารนี้รวม synthesis ของ Codex จาก 2 รอบ (architecture + build order) เป็นฉบับเดียว โดย**รักษาความหมายของ Codex ตามตัวอักษร** Hermes ไม่ได้ตีความ/สรุป/ลงความเห็นเพิ่มเติม — ส่วน "Summary" ข้างล่างคือการคัดข้อสรุปของ Codex มาแสดง ไม่ใช่บทสรุปของ Hermes.

---

## PART 1 — ARCHITECTURE SYNTHESIS (Codex)

### Synthesizer recommendation
ใช้ **Candidate D เป็น architecture baseline** ผสาน safeguards จาก C และ B:

1. สร้าง **Thin Billing Orchestrator** เหนือ ModuleHub PaymentCore + SubscriptionCore
2. ให้ **SubscriptionCore** เป็น source of truth สำหรับ subscription lifecycle และ entitlement state
3. ให้ **Stripe card/Billing เป็น primary recurring rail** สำหรับ auto-charge รายเดือน
4. เพิ่ม **`PromptPayPaymentProvider`** ใน PaymentCore — QR creation, inquiry/re-fetch, webhook normalization, **amount match**, expiry handling, declared manual refund flow
5. เพิ่ม **payment ledger + provider event ledger + host-side idempotent event claim** ผูกกับ product_id, customer_id, subscription_id, billing_period, provider, provider_event_id/payment_id
6. เพิ่ม **scheduled reconciler ใน Billing Orchestrator** (ไม่ฝังหนาใน SubscriptionCore) เริ่ม daily, เปิดให้ปรับ cadence ต่อ product/policy ได้
7. ทำ **product billing config ต่อ product** — price, currency, rails enabled, free-tier fallback, grace days, email notification windows, retry/dunning policy, entitlement mapping
8. ก่อน implementation gate → **ทำ source contract audit ของ ModuleHub `payment`/`subscription` จริง** แล้วออก adapter/orchestrator interface ที่ไม่ละเมิด TS strict + Cloudflare Workers constraints

### Gate status (Codex)
| Gate | Status |
|------|:--:|
| **Decision** | ✅ **PASS with constraints** (4 ข้อคุณฟรีชัดพอ) |
| **Architecture** | ⚠️ **CONDITIONAL PASS** (ต้องปิด unresolved items ก่อน locked) |
| **Implementation** | ❌ **NOT READY** (ต้อง audit source + Stripe PromptPay + schema + webhook security) |
| **Production** | ❌ **NOT READY** |
| **Confidence** | **82/100** |

### Blockers (Codex — ก่อน implementation)
- ตรวจ source จริง ModuleHub payment/subscription → สรุป current contracts/extension points/constraints
- ยืนยัน Stripe PromptPay integration path จริง (event mapping, QR expiry, inquiry/re-fetch, amount match, settlement, failure states)
- นิยาม canonical billing domain model (product/customer/subscription/invoice/payment attempt/billing period/entitlement/provider event/ledger)
- ออก idempotency design: atomic event claim + business period guard + audit trail
- ออก webhook security สำหรับ Cloudflare Workers (signature, raw body, replay, retry/dead-letter)
- ล็อก PromptPay-only lifecycle (renewal reminder/grace/downgrade/cancellation/reactivation/historical retention)
- ล็อก reconciliation cadence + ownership (daily default, per-product override, retry/backoff, alerting, manual review)
- ล็อก multi-product isolation (config ownership, schema/RLS/service-role, product_id enforcement, reporting)
- นิยาม acceptance criteria (unit/integration/webhook replay/duplicate/missed webhook+reconciler recovery/PromptPay under-over amount/expired QR/card retry-dunning/cross-product isolation)

---

## PART 2 — BUILD ORDER + ENDGAME SYNTHESIS (Codex)

### Synthesizer recommendation
**Internal Core First + explicit BaaS option gate** (ไม่ใช่ self-use-only, ไม่ใช่ขายทันที).

### Build order (Codex — 10 phase)
| Phase | ชื่อ | สาระ |
|:--:|------|------|
| 0 | Evidence freeze + boundary lock + Stripe TH preflight | ตรวจสถานะ `stripe-billing` จริง, lock boundary (thin orchestrator, อย่า rebuild/merge core), ยืนยัน Stripe TH, pin/audit API version, แยก test/prod secret |
| 1 | **Money correctness foundation** | atomic idempotency ledger + billing event persistence + replay-safe webhook + duplicate handling + audit log + amount/currency matching |
| 2 | Subscription lifecycle automation | scheduled jobs: grace→expired, payment pending expiry, downgrade/cancel timing, cron ownership + failure visibility |
| 3 | **Stripe card recurring vertical slice (1 product)** | thin orchestrator path, prove subscribe/renew/webhook/dunning/retry/lifecycle, Stripe-native recurring, test mode ก่อนเงินจริง |
| 4 | **Reconciliation layer (ก่อน production)** | poll/re-fetch, match amount/currency/customer/subscription/product/provider, จับ missing webhook + paid-not-credited + credited-not-paid, admin review queue |
| 5 | PromptPay adapter + notification flow | one-time/payment-pending, expiry, user notification, reconciliation identifiers, refund (Stripe PromptPay), explicit PromptPay-only lifecycle |
| 6 | Internal pilot (product 1) | blast-radius เล็ก, เต็ม card path + PromptPay, verify payment/subscription/dunning/reconciliation/logs/refund/expiry |
| 7 | Second-product proof | พิสูจน์ multi-product ไม่ rewrite core, product policy ไม่ hard-code, event isolation, reporting |
| 8 | **Production hardening gate** | E2E + failure injection (missed/duplicate/out-of-order webhook, cron drift, card retry/downgrade, PromptPay expiry, refund) + audit/alert/runbook |
| 9 | **Productization decision gate** | หลัง ≥1–2 รอบ billing จริง จึงตัดสินขาย. ถ้าขาย: กำหนด BaaS customer, merchant-of-record, Stripe Connect, pricing, support model, compliance, tenant isolation, docs, dashboard, SDK, refund SLA |

### Endgame (Codex)
**Internal First → แล้วค่อย productize BaaS** — สนับสนุน 4/4 experts. Position เป็น **"Thai-first billing ops layer"** ไม่ใช่ Stripe replacement.

### Consensus points (Codex สรุปจาก raw)
- **เริ่มจาก money correctness ก่อน** — 4/4
- **Stripe TH preflight + idempotency/persistence เป็น early foundation** — 4/4
- **Reconciliation ต้องครบก่อน production** — 4/4 (แต่ "ก่อน PromptPay implementation" เป็น 2/4 — Codex แยกให้ถูก)
- **Lifecycle automation ต้องไม่เป็น manual** — 4/4
- **Internal-first ก่อน commercialization** — 4/4
- **การ split:** PromptPay vs reconciliation order = E1/E3 (recon ก่อน PP) vs E2/E4 (PP ก่อน recon) — 2/4 vs 2/4; แต่ recon ก่อน production ยัง 4/4

### Gate status (Codex)
| Gate | Status |
|------|:--:|
| Plan internal build phases | ✅ **READY** |
| Commercial BaaS product | ❌ **NOT READY** |
| Production money movement | ❌ **NOT READY** |
| Endgame direction (Internal→BaaS option) | ✅ **READY** (4/4) |
| **Confidence** | **87/100** |

### Blockers ก่อน next gate (Codex)
- Evidence สถานะจริงของ `stripe-billing` (BRIEF/schema/webhook/state machine/scheduled jobs/idempotency/tests/runtime)
- Stripe preflight evidence (TH account, card recurring, PromptPay, refund behavior, API version, secret separation, webhook secret)
- Money-correctness evidence (atomic event claim, replay-safe, duplicate/out-of-order tests, amount match, audit log)
- Reconciliation evidence (re-fetch, pending/expired resolution, paid-not-credited, credited-not-paid, mismatch process, refund)
- Card recurring evidence (success path, failed retry, dunning, grace, downgrade/expiry, notification, host-side policy)
- Multi-product evidence (product boundary contract, no hard-coded product behavior, isolation, ops visibility)
- BaaS commercial/compliance decisions (customer segment, merchant-of-record, Stripe Connect, tenant isolation, onboarding, dashboard, pricing, SLA, PDPA, PCI, docs/SDK, refund SLA, runbooks)

---

## 📌 บันทึกการส่งมอบ

- **Council members:** Claude, AGY, Qwen (experts) · Codex (synthesizer) — ทุกตัวรันสำเร็จ
- **Owner decision required** — คุณฟรีคือ Final Authority ต้อง approve/reject
- **ไฟล์ raw (audit):**
  - `raw/round1/` (01-Claude ~ 04-AGY) · `raw/round2/` (01~04 reviews) · `raw/round3/` (01~04)
- **ไฟล์ bundle (anonymized):**
  - `bundle/CODEX-SYNTHESIS-ARCHITECTURE.md` (ฉบับเต็ม)
  - `bundle/CODEX-SYNTHESIS-BUILDORDER.md` (ฉบับเต็ม)
- **Kanban task IDs:** expert R1 (t_aac1da35/t_1972a75f/t_aeb73630/t_44425987), R2 reviews (t_5e4b0ab1/t_3aa2fc30/t_5c66909c/t_711f8399), R3 (t_25d2e2e5/t_336f82b6/t_fab6a763/t_9f2f4fb9), synthesis (t_424a7afa/t_735db64c)
