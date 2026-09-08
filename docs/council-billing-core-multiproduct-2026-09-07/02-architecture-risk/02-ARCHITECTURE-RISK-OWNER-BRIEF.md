# 02 Architecture/Risk Owner Brief

## round

02 Architecture + Risk/Invariant synthesis สำหรับ WSTERA Billing Core Multi-Product Profile Architecture

## recommendation

ล็อก architecture เป็น `PASS` สำหรับ contract/risk decision:

`Products -> Central Billing API -> request-scoped product_id/account/env -> Product Billing Profile Registry -> Stripe/provider adapter`

แต่ PASS นี้ไม่อนุญาตให้เริ่ม implementation, ใช้ live key, รับเงินจริง, deploy production, หรือ rewrite BK01

## why

ผู้สมัคร 3/3 เห็นตรงกันว่า central billing + profile registry คือทางที่ถูก และต้องมี request-scoped identity ห้ามมี global `current_profile`

เสียงแตกอยู่ที่ verdict: 2/3 ให้ `REMEDIATE` เพราะ canonical docs เดิมยังไม่มี profile registry/admission gate เต็มรูปแบบ, 1/3 ให้ `PASS` เพราะ contract สามารถล็อกในรอบนี้ได้

กู resolve เป็น `PASS` เพราะ output pack นี้เขียน contract ที่ขาดให้ครบแล้ว แต่ยังถือ gates ตอน build เป็น stop gate จริง

## consensus ratio

3/3 เห็นด้วย:

- central billing path
- Product Billing Profile Registry
- one shared Stripe/provider path
- durable webhook intake/outbox
- reconciliation ก่อน entitlement
- metadata เป็น routing hint เท่านั้น
- no caller-supplied Stripe Price
- no mutable global active/current profile
- BK01 ห้าม forced rewrite
- BK01 PromptPay deposit ห้ามรวมกับ WSTERA SaaS billing

## dissent ratio

2/3 เสนอ `REMEDIATE`

1/3 เสนอ `PASS`

เหตุผล dissent หลัก: profile registry กับ new-product admission harness ยังไม่เคยถูกล็อกใน canonical docs เดิม กูถือว่าเอกสารชุดนี้เป็นตัวล็อก contract รอบนี้ จึงให้ PASS แบบจำกัดขอบเขต

## simple technical facts

- Product identity ต้องมาจาก server-side credential ไม่ใช่ request body
- Account isolation ต้องมี account-bound assertion; product credential อย่างเดียวไม่พอ
- Stripe Price เปลี่ยนจำนวนเงินไม่ได้แบบแก้ของเดิม ต้องสร้าง Price ใหม่และ version profile
- Stripe webhook ต้อง verify จาก raw body ก่อน parse JSON
- Webhook duplicate/out-of-order ต้องรับมือด้วย event ledger + provider re-fetch + monotonic state
- PromptPay เป็น customer-initiated/manual rail; ห้ามทำเป็น auto-recurring subscription state machine
- Browser success redirect ไม่ใช่หลักฐานว่า paid แล้ว

## unknowns

- Stripe Test preflight ของบัญชี WSTERA ยังต้องทำตอน build gate
- PromptPay capability จริงของบัญชี/โหมดต้อง verify ใน preflight
- Product #1 admission order ยังต้อง confirm ถ้าไม่ใช้ PS01
- Refund/cancel/renewal financial policy ยังต้องล็อกก่อน live
- จะบังคับ account-bound assertion กับ GET routes ทุกตัวหรือยอม product-wide read บาง Product ยังเป็น Owner decision

## risks/failures

ความเสี่ยงหลัก:

- cross-product routing ถ้าเผลอใช้ global profile
- cross-account access ถ้าอ้าง account isolation โดยไม่มี assertion
- paid-but-no-entitlement ถ้า Product adapter ล่ม
- entitlement-without-payment ถ้าไม่ reconcile
- wrong amount/currency/product/account ถ้าเชื่อ metadata หรือ redirect
- stale Stripe Price/profile ถ้าไม่มี immutable versioning
- BK01 destabilization ถ้า rewrite เร็วเกิน

ทุกเคสถูกใส่ไว้ใน `FAILURE-HANDLING-MATRIX.md`

## gate status

Architecture/risk contract: PASS

Implementation: not authorized

Live key/live money/production: not authorized

BK01 rewrite/migration: not authorized

PromptPay subscription state machine: prohibited

## next steps

1. Owner ยืนยันให้เอกสารชุดนี้เป็น canonical contract ของรอบ 02
2. ทำ Stripe Test preflight
3. สร้าง profile registry/admission harness ตาม contract
4. ทำ Product #1 vertical slice
5. ทำ Product #2 isolation proof
6. ทำ Pre-Build/Implementation Gate audit ก่อนแตะ live readiness

## Owner decisions

- Product #1 admission order
- GET routes จะบังคับ account-bound assertion ทุกตัวหรือยอม product-wide read แบบ documented acceptance
- default reconciliation cadence สำหรับ Product #1
- refund/cancel/renewal policy สำหรับ internal-first phase
- timing ของ BK01 extraction หลัง facade/parity evidence

