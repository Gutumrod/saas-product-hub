# BK01 Booking — Technical/Delivery Lens (Round 1 Council)

**Lens:** Technical/Delivery — implementation reality, dependency cost, reusable capability fit, risk, distance to V1
**Repo:** `D:\AI-Workspace\projects\saas-product-hub\products\booking`
**Branch/HEAD ณ เวลาตรวจ:** `feature/bk-a-v1-contract-remediation` @ `213360a` (working tree clean — VERIFIED ผ่าน `git status --porcelain` ว่างเปล่า, `git log --oneline -5` ตรงกับ evidence)
**วันที่:** 2026-09-03 (Asia/Bangkok)
**Label:** VERIFIED = อ่านจากไฟล์จริง/git จริง / INFERENCE = อนุมานจากหลักฐาน / UNVERIFIED = ยังไม่มีหลักฐาน / RECOMMENDATION = ข้อเสนอ / UNKNOWN = ไม่มีหลักฐานใดๆ

---

## 0. วิธีตรวจ (evidence base)

- อ่านไฟล์ docs ครบ 12 ไฟล์ตามที่กำหนด (01_PRD, 03_DATA_SECURITY_TENANCY, 05_BOOKING_DOMAIN_RULES, 08_EXTERNAL_DEPENDENCIES, 10_DEVELOPMENT_ROADMAP, PRODUCT_DECISIONS, CURRENT_STATUS, audit/CURRENT_TRUTH_AND_CONTRADICTIONS, audit/BK-A-IMPLEMENTATION-EVIDENCE, audit/INDEPENDENT_REVIEW_CODEX, technical/STRIPE_SUBSCRIPTION_STATE_MACHINE, technical/ARCHITECTURE_SECURITY_STANDARD) — VERIFIED
- ตรวจโครงสร้างจริง: `apps/` (booking-consumer + booking-admin), `supabase/migrations/` (29 ไฟล์), `package.json` (npm workspaces), `wrangler.jsonc` ทั้งสอง app, `custom-worker.ts`, `tests/` (7 ไฟล์), `qa/`, `docs/MASTER_CHECKLIST.md`, `docs/09_TEST_RELEASE_GATES.md`, `BRIEF-BK-A-CONT-04-DB-RUNTIME-GATES` — VERIFIED
- อ่าน migration BK-A ทั้ง 663 บรรทัด (`20260829105155_bk_a_v1_contract_remediation.sql`) — VERIFIED
- ตรวจ git: `git log --oneline`, `git diff --stat 3aee2a5..HEAD`, merge-base กับ main = `3aee2a5` — VERIFIED
- ตรวจ Module Hub: `INDEX.md`, `modules/REGISTRY.md` (24 modules) — VERIFIED
- ตรวจ registry ระดับ portfolio: `docs/products/registry.yaml` (CM01), `docs/platform/TICKET_SYSTEMS_DISAMBIGUATION.md`, brief CM01 — VERIFIED
- **ไม่ได้** รัน `npm test`/`lint`/`build` ซ้ำเอง — อ้างอิง evidence สองชุดอิสระ (BK-A evidence + Codex independent review) ที่บันทึก exit code ตรงกัน — ระบุเป็น VERIFIED (documented, cross-checked กับ git state) แต่ไม่ใช่การ re-run ของ lens นี้

---

## 1. สิ่งที่สร้างแล้ว / ขาด / เกินจำเป็น

### 1.1 สร้างแล้วจริง (VERIFIED — จากไฟล์จริง)

**Baseline (ก่อน BK-A, `main @ e99615d`):**
- Booking domain ครบ: services/staff/schedules/holidays/bookings, hold 15 นาที + expiry, EXCLUDE constraint กัน overlap (`prevent_overlapping_staff_bookings`), Any Staff allocation แบบ lowest workload, fail-closed เมื่อไม่มี schedule, deposit flow, LINE notifications, Stripe billing (checkout/portal/webhook/idempotency/out-of-order guard), tickets, platform-admin, quota/top-up, i18n TH/EN — VERIFIED (migrations 28 ไฟล์ + audit/CURRENT_TRUTH §4)

**BK-A remediation (VERIFIED — migration 663 บรรทัด + 32 ไฟล์ app, +864/−183):**
- A1: private slip storage — bucket `public=false`, size/mime limit, policy อ่านเฉพาะ owner/admin ผ่าน join กับ booking, `submit_deposit_slip` ตรวจ path booking-scoped + object มีอยู่จริง + hold ยังไม่ expired — VERIFIED
- A2: staff mapping — `staff.user_id` + unique index, `current_staff_id()` SECURITY DEFINER `search_path=''`, RLS staff/booking/customer self-scope, `link_staff_user` จำกัด owner — VERIFIED
- A3/A4/A14: monthly-only checkout, annual ถูกถอด, 100/500 wall ถูกถอด (`get_tier_limits` paid = 2147483647), ฿490/฿990 เป็น pilot-reference — VERIFIED
- A5/A6: merchant LINE boundary (server-side `LINE_MERCHANT_CHANNELS_JSON`, `server-only`), HMAC raw-body + timingSafeEqual, notification job queue + retry + idempotency, cron `*/5 * * * *` บน consumer Worker เรียก `/api/notifications/dispatch` — VERIFIED
- A7: auto-slip fail-safe boundary — `auto_slip_attempts` table, `classifyAutoSlipResult` auto-confirm เฉพาะผลบวกตรงเป๊ะ, timeout/unknown/ambiguous → manual review, `auto_slip_limit = 0` ทุก plan (ไม่เคลม) — VERIFIED
- A8: PromptPay payload ในเครื่อง + `QRCodeSVG` (qrcode.react) — `createPromptPayPayload` ใน `src/lib/promptpay.ts`, ใช้ใน `book/[slug]/page.tsx` — VERIFIED (ไม่พบ `promptpay.io` ใน source)
- A9/A10: `customer_cancel_booking` / `customer_reschedule_booking` (SECURITY DEFINER, FOR UPDATE, policy window fail-closed เมื่อ NULL, audit + notification ใน transaction เดียว), `set_booking_outcome` (completed/no_show) — VERIFIED
- A11/A12: `export_core_business_data` (owner-only), `request_account_closure`, ticket owner/admin-only (policy + trigger), platform-admin audit trigger — VERIFIED
- A13: copy ปลอดภัย 100% ถูกลบ, static absence checks — VERIFIED (0 hits ใน source; `.next` cache มี string เก่าแต่ gitignored — ตาม Codex review)

**Tests:** 19 unit/static tests (7 ไฟล์) + `supabase/tests/bk_a_contract.sql` (28 บรรทัด) — VERIFIED

### 1.2 ขาด (VERIFIED / UNVERIFIED)

| รายการ | สถานะ |
|---|---|
| DB runtime evidence: clean replay, db lint, pgTAP, RLS/tenancy denial, concurrency, Stripe ordering, LINE delivery, CSV content, audit persistence | **BLOCKED_ENVIRONMENT** — migration ไม่เคยถูก apply กับ DB ใดเลย (VERIFIED จาก evidence + BRIEF CONT-04) |
| Deployment evidence: deploy, routing, smoke, rollback | **ไม่มีเลย** — G10 ยังไม่เปิด (VERIFIED: ไม่พบ deploy evidence; wrangler.jsonc ไม่มี routes/zone_id/custom_domain) |
| Real provider integration: LINE push จริง, Stripe webhook จริง, auto-slip provider | **ไม่มี** — auto-slip provider ยังไม่ถูกเลือก (owner blocker) (VERIFIED) |
| Merchant-owned LINE OA จริง | ไม่มี — มีแค่ boundary/config (VERIFIED) |
| Owner decisions: auto-slip provider/allowance/cost, LINE allowance, ราคา final, policy windows | ค้าง (VERIFIED จาก evidence + MASTER_CHECKLIST) |
| Legal/privacy: retention durations, privacy checklist, data location/subprocessor | ค้าง (VERIFIED จาก MASTER_CHECKLIST) |
| BK-B pilot readiness: staging rehearsal, support playbook, incident rehearsal, instrumentation | ค้าง (VERIFIED จาก roadmap) |

### 1.3 เกินจำเป็น / น่าสงสัย (INFERENCE + RECOMMENDATION)

- `auto_slip_attempts` + `classifyAutoSlipResult` + `auto_slip_limit=0`: **ตายสนิทจนกว่า owner ตัดสินใจ provider** — Codex review เองชี้ว่า column นี้ dead (INFERENCE: ต้นทุนต่ำ, เป็น contract boundary ของ PD-004 — RECOMMENDATION: เก็บไว้เป็น boundary แต่อย่า invest เพิ่ม, อย่าเคลม)
- `get_tier_limits.auto_slip_limit` = 0 ทุก plan: dead column (VERIFIED) — cosmetic
- Blacklist: V1 optional, ไม่ได้ implement — **ถูกต้องที่ defer** (VERIFIED)
- Admin LINE webhook เก่าคืน 410: ถูกต้อง (VERIFIED)
- `qa/` stub SQL + run_tests.sh: historical evidence, ไม่ใช่ deliverable (VERIFIED)
- **ไม่พบ** ของที่สร้างเกินสัญญา V1 อย่างมีนัยสำคัญ — ขอบเขต BK-A ตรงกับ PRD/PD-001..018 (INFERENCE: จาก traceability + diff stat)

---

## 2. ระยะห่างถึง V1 ที่ขายได้ (gates)

อ้างอิง `docs/09_TEST_RELEASE_GATES.md` (G0–G10) — VERIFIED

| Gate | สถานะ | หลักฐาน |
|---|---|---|
| G0 Documentation | **PASS** | SSOT locked, independent doc reviewer PASS (VERIFIED จาก MASTER_CHECKLIST) |
| G1 Static/build | **PASS** | 19/19 tests, lint 0 errors/13 warnings, build consumer+admin — บันทึก 2 ชุดอิสระตรงกัน (VERIFIED documented; ไม่ได้ re-run เอง) |
| G2 Database | **BLOCKED_ENVIRONMENT** | ไม่มี PostgreSQL local, ห้าม Docker, migration ไม่เคย apply (VERIFIED) |
| G3 Tenancy/security | **BLOCKED_ENVIRONMENT** (ส่วน DB) | RLS/denial ยังไม่พิสูจน์ runtime (VERIFIED) |
| G4 Booking integrity | **BLOCKED_ENVIRONMENT** (ส่วน DB) | concurrency/overlap ยังไม่พิสูจน์ runtime (VERIFIED) |
| G5 Deposit/money | **BLOCKED_ENVIRONMENT** (ส่วน DB) | slip/duplicate/auto-slip paths ยังไม่พิสูจน์ runtime (VERIFIED) |
| G6 Lifecycle | **BLOCKED_ENVIRONMENT** (ส่วน DB) | cancel/reschedule atomicity ยังไม่พิสูจน์ runtime (VERIFIED) |
| G7 LINE | **BLOCKED_ENVIRONMENT** (ส่วน DB) | delivery/retry จริงยังไม่พิสูจน์ (VERIFIED) |
| G8 Billing | **BLOCKED_ENVIRONMENT** (ส่วน DB) | webhook lifecycle จริงยังไม่พิสูจน์ (VERIFIED) |
| G9 Data/support | **BLOCKED_ENVIRONMENT** (ส่วน DB) | export/closure/audit persistence ยังไม่พิสูจน์ (VERIFIED) |
| G10 Deployment | **BLOCKED** | ไม่มี deploy/smoke/rollback ใดๆ (VERIFIED) |

**Verdict ระยะห่าง:** (INFERENCE)
- **Code surface: ~90% ของ V1 contract เสร็จ** — static/build PASS, migration + app paths ครบทุก PD item
- **Runtime evidence: 0% ของ G2–G10** — ชั้นที่อันตรายที่สุด (เงิน, tenancy, concurrency) ไม่เคยถูก execute
- ระยะห่างจริง = **1 approved PostgreSQL/Supabase runtime + CONT-04 + G10 rehearsal + owner commercial decisions (BK-C) + legal/privacy (BK-B)** — ไม่ใช่ระยะห่างของโค้ด แต่เป็นระยะห่างของ environment และ evidence
- **ไม่สามารถขายเป็น public V1 ได้ในสถานะนี้** — ตรงกับ release rule ใน 09_TEST_RELEASE_GATES.md (VERIFIED)

---

## 3. ความเสี่ยงทางเทคนิค/การส่งมอบ

### 3.1 BLOCKED_ENVIRONMENT — ความเสี่ยงหลัก (VERIFIED + INFERENCE)
- Migration BK-A 663 บรรทัด ประกอบด้วย SECURITY DEFINER functions หลายตัว + RLS policies + triggers + data migration (`link_token` ถูก regenerate สำหรับแถวสั้น) — **ไม่เคยถูก execute กับ PostgreSQL จริงแม้แต่ครั้งเดียว** (VERIFIED)
- Blast radius สูง: ถ้ามี syntax error / policy bug / grant mismatch จะระเบิดตอน apply ครั้งแรก — ณ จุดนั้นต้อง debug บน environment ที่เพิ่ง approve (INFERENCE)
- `supabase/tests/bk_a_contract.sql` แค่ 28 บรรทัด — **บางมาก** เทียบกับ scope ของ migration (VERIFIED) — RECOMMENDATION: CONT-04 ต้องขยาย pgTAP ให้ครอบคลุม negative paths ตาม 09_TEST_RELEASE_GATES.md (14 mandatory negative paths) ก่อนสรุป PASS
- ความเสี่ยงนี้เป็น **process risk ไม่ใช่ code risk** — โค้ดผ่าน static review อิสระแล้ว แต่ static review พิสูจน์ RLS/concurrency ไม่ได้ (VERIFIED จาก Codex review)

### 3.2 Dissent ต่อ Codex PASS — fail-open ใน notification dispatch (VERIFIED + INFERENCE)
- `apps/booking-consumer/src/app/api/notifications/dispatch/route.ts` บรรทัด 39–49: `const { data: subscription } = await admin.from('subscriptions')...maybeSingle()` — **ไม่ตรวจ error**; ถ้า lookup ล้มเหลว `subscription` = null → fallback ไป trial/central OA (VERIFIED — อ่านโค้ดจริง)
- Daily log 2026-08-30/31 ระบุ P1: "notification dispatch must fail closed when paid-plan subscription lookup fails; it must not fall back to WSTERA central LINE OA on lookup ambiguity/error" (VERIFIED)
- **ที่ HEAD `213360a` ยังไม่เห็นการแก้ fail-open นี้** (VERIFIED — โค้ดปัจจุบันยังเป็น pattern เดิม) — Codex review ผ่านโดยไม่จับประเด็นนี้ (INFERENCE: review มองที่ signature/secret boundary ไม่ได้มองที่ lookup-failure path)
- ผลกระทบ: ร้านค้า paid ที่ subscription lookup error → ข้อความ confirmation/reminder ไปผ่าน central OA — ผิด PD-005 (merchant-owned สำหรับ paid) และผิด FR-LINE-003 (fail-safe) (INFERENCE)
- **นี่คือ dissent หลักของ lens นี้** — ควรเปิดเป็น finding ก่อนปิด CONT-03/04

### 3.3 ความเสี่ยงอื่น (INFERENCE / UNVERIFIED)
- **Worker execution limit:** dispatch loop ทำ LINE push แบบ sequential สูงสุด 25 ครั้ง + DB RPC ต่อ booking (claim + complete) ใน request เดียวบน cron — อาจชน CPU/wall-clock limit ของ Workers (INFERENCE, UNVERIFIED — ต้องทดสอบใน G10)
- **OpenNext + Next 16 บน Workers:** stack ใหม่, ไม่เคย deploy จริง — G10 จะเจอ integration issues แน่นอน (auth redirects, callbacks, streaming) (INFERENCE)
- **Routing config ไม่อยู่ใน repo:** wrangler.jsonc ทั้งสองไม่มี `routes`/`zone_id`/`custom_domain` — การ routing ของ webhooks (Stripe→admin, LINE→consumer) ต้อง config ที่ Cloudflare dashboard ซึ่งไม่มี evidence ใน repo (VERIFIED) — G10 ต้องบันทึก routing จริง
- **Single Supabase project = single point of failure** สำหรับทั้งสอง Workers — ยอมรับได้ที่ scale V1 (INFERENCE)
- **Dependency cost ต่ำ:** stripe SDK (admin เท่านั้น), supabase-js, qrcode.react, LINE ผ่าน raw fetch — ไม่มี dependency หนัก/เสี่ยง (VERIFIED จาก package.json) — ต้นทุน dependency ไม่ใช่ปัญหา
- **`past_due` grace 7 วัน** ใน state machine doc เป็น historical design — MASTER_CHECKLIST ยังค้าง "past_due grace duration/policy implemented, tested and approved" (VERIFIED) — ต้องปิดก่อน V1

---

## 4. สถาปัตยกรรม two-Worker Cloudflare + Supabase — sound หรือไม่

**Verdict: SOUND สำหรับ destination นี้ (INFERENCE) — มี caveats**

จุดแข็ง (VERIFIED):
- แยก public booking surface (consumer, anon RPCs) ออกจาก merchant admin (authenticated) — ตรงกับ security boundary จริง
- Cron อยู่บน consumer Worker เท่านั้น — ถูกที่ (notification เกิดจาก booking flow)
- ตรงกับ PD-017: canonical host `bk01.wstera.com` + two-Worker routing (VERIFIED)
- ตรงกับ portfolio convention (product อื่นใช้ pattern เดียวกัน) (VERIFIED จาก registry)

Caveats (INFERENCE/RECOMMENDATION):
1. **Worker split คือ defense-in-depth ไม่ใช่ security boundary หลัก** — boundary จริงคือ RLS ใน Supabase (ทั้งสอง Workers ใช้ service-role/admin ตัวเดียวกัน) — อย่า marketing ว่า Worker split คือ isolation (INFERENCE)
2. Routing config ไม่อยู่ใน repo (VERIFIED) — ต้องบันทึกเป็น evidence ใน G10
3. OpenNext maturity + ไม่เคย deploy (VERIFIED) — G10 คือจุดที่ architecture จะถูกพิสูจน์จริง
4. RECOMMENDATION: ตรวจ `FREE-TIER-RULES`/`OPERATIONS-RULES`/`ENGINEERING-RULES` (vault SOP) ก่อน deploy — lens นี้ไม่ได้อ่าน (UNVERIFIED) แต่ AGENTS.md กำหนดเป็น MUST-follow gate

---

## 5. Module Hub — reusable capability fit (VERIFIED จาก INDEX.md/REGISTRY.md)

**ข้อเท็จจริง:** Module Hub มี 24 modules (23 Completed, 1 Pilot — line-oa-ai-module) — VERIFIED

**Verdict หลัก: อย่า retrofit Module Hub เข้า BK01 V1 (RECOMMENDATION + INFERENCE)**
- BK01 ได้ implement ความสามารถเทียบเท่าไว้ใน-DB แล้ว: notification (line_notification_logs + dispatch), webhook receiver (LINE HMAC + Stripe constructEvent), audit log (audit_events), rate limit (booking_recovery_attempts), subscription/entitlement (subscriptions + get_tier_limits), tenant context (has_shop_role), file storage (private bucket), import/export (export_core_business_data) — VERIFIED
- Module Hub modules เป็น framework-neutral, host-injected, ส่วนใหญ่ in-memory/JSON/Redis store — **คนละรูปทรง** กับ DB-RPC + RLS ของ BK01 (VERIFIED จาก INDEX.md) — การ retrofit = เขียนใหม่ + เสี่ยง ไม่ลด delivery cost (INFERENCE)

**ที่เพิ่มมูลค่าได้จริงโดยไม่บวม V1 (RECOMMENDATION):**
- `health-check` (Completed 0.2.0) — ใช้เป็น G10 smoke gate สำหรับสอง Workers — เล็ก, ใช้ได้ทันที
- `config-runtime` (Completed 0.1.0) — env validation/redaction ตรง SEC-PRIV-001 + env inventory ใน 08_EXTERNAL_DEPENDENCIES.md — เล็ก, ใช้ได้ทันที
- ที่เหลือ (scheduler, job-retry, payment, subscription, auth, ticket-tracker, line-oa-ai-module) — **ไม่ fit V1** (INFERENCE)

**ทิศทางที่ถูกกว่า (RECOMMENDATION):** ค่า reusable จริงของ BK01 อยู่ที่ **pattern ใน-DB** — `has_shop_role`, `audit_events`, `claim_due_line_notifications` (FOR UPDATE SKIP LOCKED), EXCLUDE constraint booking guard, recovery rate-limit — ควร **สกัดออกเป็น reference pattern ใน Module Hub** สำหรับ product อนาคต (PS01/LK01) มากกว่าจะดึง module เข้ามา (INFERENCE)

---

## 6. CM01 (booking-ticket-module) — อยู่ใน BK01 หรือแยก

**Verdict: แยกเป็น product ต่างหาก — ถูกต้องแล้ว (VERIFIED + RECOMMENDATION)**

หลักฐาน (VERIFIED):
- registry.yaml: CM01 = `one_time_source_product`, "explicitly NOT grouped with booking/BK01 despite the name" — owner decision 2026-08-26 หลัง code-level verification: disjoint customer bases, ไม่มี live code path ร่วม (มีแค่ historical ancestor — `ticket-domain.ts` ของ BK01 port มาจาก CM01 แล้ว diverged)
- TICKET_SYSTEMS_DISAMBIGUATION.md: BK01's native ticket system = **feature ไม่ใช่ product** (ไม่มี product_id, ship ใน subscription price); CM01 = React SPA, localStorage adapter, ไม่มี auth **โดย design**, theme system สำหรับ embed
- BK01 ticket system: Supabase-RLS-backed, owner/admin-only หลัง BK-A (VERIFIED จาก migration + policies)

เหตุผลทางเทคนิค (INFERENCE):
- CM01 (frontend template, no auth, localStorage) กับ BK01 (multi-tenant RLS SaaS) เป็นคนละ stack layer — การ merge = เอา template ที่ไม่มี auth ใส่เข้า SaaS ที่ RLS เป็น boundary — ทิศทางผิด
- BK01's ticket feature ไม่ควรถูก extract ออกเป็น CM01 — มัน RLS-coupled กับ schema local_service
- CM01 gap แท้ๆ คือ backend adapter — ถ้าจะทำ ควรต่อกับ `ticket-tracker` module (philosophy เดียวกัน: no auth, host decides) ไม่ใช่ BK01 (VERIFIED จาก disambiguation doc)

**RECOMMENDATION:** คงการแยกไว้; ไม่มีเหตุผลทางเทคนิค/การส่งมอบที่จะรวม CM01 เข้า BK01 หรือดึง BK01 ticket ออก

---

## 7. สรุป verdict ของ lens

1. **สร้างแล้ว:** booking domain ครบ + BK-A remediation ครบทุก PD item ในระดับ code/static — ผ่าน G0/G1 (VERIFIED)
2. **ขาด:** runtime evidence ทั้งหมด (G2–G9 DB-backed, G10 deploy) + owner commercial decisions + legal/privacy — ยังขายเป็น V1 ไม่ได้ (VERIFIED)
3. **ระยะห่าง:** โค้ด ~90%, evidence ~0% ของชั้น DB/deploy — critical path คือ approved DB runtime + CONT-04 + G10 ไม่ใช่โค้ด (INFERENCE)
4. **ความเสี่ยงหลัก:** migration 663 บรรทัดไม่เคย execute + pgTAP บาง (28 บรรทัด) + **fail-open ใน notification dispatch (dissent ต่อ Codex PASS)** (VERIFIED)
5. **สถาปัตยกรรม:** two-Worker + Supabase sound สำหรับ destination — caveat: routing ไม่อยู่ใน repo, Worker split ไม่ใช่ security boundary หลัก (INFERENCE)
6. **Module Hub:** อย่า retrofit เข้า V1; ใช้แค่ health-check/config-runtime ถ้าต้องการ; ค่า reusable อยู่ที่การสกัด pattern ใน-DB ออกไป (RECOMMENDATION)
7. **CM01:** แยก product ต่างหาก — ถูกต้อง (VERIFIED)

## 8. Dissent / uncertainty

- **Dissent หลัก:** Codex independent review ให้ PASS (no P0/P1) แต่ fail-open path ใน notification dispatch (subscription lookup error → fallback central OA) ยังอยู่ที่ HEAD — daily log ระบุเป็น P1 ตั้งแต่ 08-30 และไม่เห็นการแก้ — ควรเปิดเป็น finding ก่อนปิด CONT-03/04
- **Uncertainty:** lens นี้ไม่ได้ re-run npm test/lint/build เอง — อ้างอิง evidence สองชุดที่ตรงกัน (ถือว่าเชื่อถือได้แต่ไม่ใช่การ verify ของตัวเอง)
- **UNVERIFIED:** Worker execution limit ของ dispatch loop, routing จริงบน Cloudflare, สถานะ live Supabase project (`gyleqrjdzwwlqierdwcy.supabase.co` ใน doc เก่า) เทียบกับ migrations — ไม่มีหลักฐานว่า project นี้ถูก apply หรือยัง live
- **UNKNOWN:** retention durations, past_due grace policy จริง, auto-slip provider — เป็น owner/legal blockers ไม่ใช่ engineering defect
