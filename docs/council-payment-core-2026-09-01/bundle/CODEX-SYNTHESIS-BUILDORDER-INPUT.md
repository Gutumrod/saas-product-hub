# CODEX SYNTHESIS INPUT — Build Order + Endgame (Council Round 3)

**บทบาท:** คุณคือ Independent Synthesizer ไม่ใช่ expert
**งาน:** สังเคราะห์จาก anonymized expert answers ข้างล่าง ตาม output contract

---

## Original Council Brief

หลังจากตกลงสถาปัตยกรรม core รับเงิน (PromptPay + ตัดบัตรอัตโนมัติ) สำหรับ WSTERA.com แล้ว ต้องวางแผน:
1. **ลำดับการสร้าง** — เริ่มจากชิ้นไหนไปจบชิ้นไหน (phases/milestones)
2. **ปลายทาง** — ทำใช้เองใน WSTERA หรือกลายเป็น product ขาย (Billing-as-a-Service)? ถ้าขายต้องทำอะไรเพิ่ม

**สิ่งที่ settle แล้ว (จาก architecture round):** thin Billing Orchestrator เหนือ Payment+Subscription Core, เพิ่ม PromptPay adapter + reconciliation + dunning engine, Stripe = recurring rail หลัก + Stripe PromptPay (คืนเงินได้), ผู้ใช้ตอบครบ 4 ข้อ, มี `stripe-billing` product ใน saas-product-hub อยู่แล้ว.

**Evidence manifest:** `D:\AI-Workspace\projects\saas-product-hub\products\stripe-billing\BRIEF.md`, `products/` หลายตัว (DocCraft/PawSpace/RentMatrix/booking/WSTERA-Link ฯลฯ).

---

## Anonymized Expert Answers (Round 3 — build order + endgame)

### Expert E1
ลำดับ 6 phase ตาม "no money leaks first": **Phase 0** Stripe TH preflight (ยืนยันบัญชีไทย+pin API version+secrets production) → **Phase 1** ปิด Subscription Core gaps (grace_period→expired scheduled job, idempotency ledger atomic) → **Phase 2** Stripe Card end-to-end (thin orchestrator, proof recurring path) → **Phase 3** Reconciliation layer (poll pending, re-fetch, amount match) → **Phase 4** PromptPay adapter + notification flow → **Phase 5** Production hardening (API version audit, audit-log, live TH test). ปลายทาง: Internal-first → pivot BaaS. ต้องเพิ่มเมื่อขาย: multi-tenant isolation, self-serve onboarding, pricing model, Stripe Connect, refund workflow-as-service, PDPA, SLA, docs/SDK. **Confidence 82**

### Expert E2
ลำดับ 9 phase "money correctness spine": **P0** evidence freeze + Stripe TH gate → **P1** contract audit + boundary lock (ไม่ rebuild ไม่ merge core) → **P2** idempotency ledger + billing event persistence → **P3** PromptPay adapter one-time rail → **P4** reconciliation layer (ก่อน production) → **P5** billing orchestrator host layer → **P6** card recurring + Stripe dunning → **P7** PromptPay-only lifecycle + expiry/downgrade jobs → **P8** first internal product pilot → **P9** multi-product rollout. ปลายทาง: self-use first → productize BaaS ทีหลัง (ไม่ใช่ self-use only, ไม่ขายทันที). เหตุผล: field test จริงใน WSTERA (10+ products) ก่อนรับภาระ SLA/support/compliance. Positioning: ขายเป็น "Thai-first billing ops layer" ไม่ใช่ "แทน Stripe". **Confidence 86**

### Expert E3
ลำดับ 6 phase + เฟสเตรียมฐาน: **P0** groundwork (TH account, pin API version, test เขียว, ยืนยัน idempotency ledger) → **P1** thin orchestrator + Stripe card happy path (1 product) → **P2** reconciliation + scheduled lifecycle jobs (**ก่อน PromptPay เสมอ**) → **P3** PromptPay adapter → **P4** dunning/retry policy + กฎคุณฟรี (host-side policy ไม่ hard-code) → **P5** พิสูจน์ multi-product (product ที่ 2) → **P6** production cutover (เงินจริง) → **P7** productization gate. ปลายทาง: **ขายเป็น BaaS แต่ WSTERA ใช้จริงก่อนเป็นด่านบังคับ (dogfood ≥1-2 รอบ billing)** — internal-only เผา option value. **Confidence 82**

### Expert E4
ลำดับ 7 phase "ความปลอดภัยเงินก่อน": **P0** Stripe account verification (TH) + preflight environment → **P1** persistence & atomic idempotency ledger (Supabase) → **P2** PromptPay adapter → **P3** reconciliation layer (CF Workers cron) → **P4** automated subscription sweeper (grace→expired) → **P5** thin billing orchestrator (multi-product host) → **P6** E2E verification + failure injection dry-run. ปลายทาง: **Internal Core First ชัดเจน** (สร้างใช้ใน WSTERA ให้สมบูรณ์) แล้วค่อย Stage 3 commercial productization หลังพิสูจน์เสถียร 100%. ความเสี่ยงหลัก: webhook miss→เงินหาย, idempotency gap→double credit, non-TH account, involuntary churn, cron drift, scope creep. **Confidence 95**

---

## Consensus ที่เห็นจาก raw (คุณตรวจได้ แต่ห้าม infer เกิน evidence)

- **ทุก expert (4/4):** เริ่มจาก "เงิน/ความถูกต้องก่อน" ไม่ใช่ UI/PromptPay. Reconciliation ต้องมาก่อน PromptPay (กันเงินหาย). Stripe card = recurring rail หลัก.
- **ปลายทาง:** ทุกตัว = **Internal-First แล้วค่อย productize BaaS** (ไม่ self-use only, ไม่ขายทันที). ต่างกันแค่รายละเอียด phase.
- **ต้องทำเพิ่มถ้าขาย:** multi-tenant isolation, self-serve onboarding, dashboard, Stripe Connect, compliance (PDPA/PCI), SLA, docs/SDK, refund SLA.

---

## งานสังเคราะห์
ใช้ output contract:
1. Problem understood
2. Verified facts
3. Areas of agreement
4. Majority positions
5. Minority / dissent positions
6. Missing evidence / unresolved questions
7. Synthesizer recommendation
8. Why this recommendation
9. Rejected alternatives + why
10. Gate status
11. Blockers before next gate
12. Confidence 0-100

เขียนผลลง `synthesis.md` ใน workspace แล้วรายงาน path + สรุปสั้น.
