# LK01 WSTERA Link — Technical/Delivery Lens (Round 1)

**Lens:** Technical/Delivery — implementation reality, dependency cost, reusable capability fit, risk, distance to V1
**Date:** 2026-09-03
**Evidence base:** อ่านจาก repo จริง `D:\AI-Workspace\projects\saas-product-hub\products\WSTERA-Link` (branch `docs/hybrid-billing-promptpay`, HEAD `ae7c474`, clean tree), `modules-hub` (HEAD `7ed23ad`), `saas-product-hub/docs/platform/*` (master plan, billing-core plan, P0a-C1 review), `apps/hub-web` (HEAD `1cee560`)
**Label convention:** VERIFIED = ตรวจจากไฟล์/git โดยตรง; INFERENCE = สรุปจากหลักฐานที่ตรวจ; UNVERIFIED = ยังไม่มีหลักฐาน; RECOMMENDATION = ข้อเสนอของ lens นี้

---

## 1. สถานะจริง: สร้างอะไรแล้วบ้าง (VERIFIED)

- **VERIFIED:** `git ls-files` = 253 ไฟล์; องค์ประกอบ = docs/ (36), references/prototype-v2/ (14), vendor/modules/ (10 โมดูล, ~200 ไฟล์), .gitignore เท่านั้น
- **VERIFIED:** ไม่มี `src/`, `app/`, `pages/`, `package.json` ระดับ root, `tsconfig.json`, `wrangler.toml`, `.github/` (CI), หรือไฟล์ build ใดๆ ที่ top-level
- **VERIFIED:** ประวัติ git ทั้งหมด 6 commits (`bf591e3` → `ae7c474`) เป็น docs ทั้งสิ้น; ไม่มี commit ที่เพิ่ม/ลบ production code
- **VERIFIED:** `references/prototype-v2/` เป็น Python/FastAPI + SQLite prototype (~452 บรรทัด) เก็บเป็น behavior reference เท่านั้น (MODULE_PROVENANCE ระบุ HEAD `bf3a9658` เป็น reference)
- **VERIFIED:** `docs-pre-sync-20260826-201655/` เป็น untracked + gitignored (backup ในเครื่อง ไม่ใช่ส่วนของ repo)
- **VERIFIED:** CURRENT_STATUS.md ระบุ "no production application code exists" — ตรงกับ git state จริง (ไม่ใช่เอกสารเพ้อ)
- **VERIFIED:** vendor/modules ทั้ง 10 โมดูลตรงกับ upstream `modules-hub` @ `db441ce` (2026-08-26) แบบ byte-identical ยกเว้น CRLF line-ending และไฟล์ scratch 4 ไฟล์ (ดู §5)

**สรุป: สร้างแล้ว = 0 บรรทัด production code. สิ่งที่มี = เอกสารล็อก 12+ ฉบับ + โมดูล vendored 10 ตัว + prototype อ้างอิง. สถานะ "pre-build" เป็นจริง 100%.**

---

## 2. สิ่งที่ขาด / สิ่งที่อาจไม่จำเป็น

### ขาด (VERIFIED จาก roadmap + gates)
- Phase 0–7 ทั้งหมดยังไม่เริ่ม: scaffold/CI, schema+RLS, link core+redirect worker, analytics+quota, billing, paid features, hardening, beta
- ไม่มี Supabase project/schema/migration ใดๆ (ไม่มีไฟล์ SQL ใน repo)
- ไม่มี Stripe account preflight evidence (09_EXTERNAL_DEPENDENCIES ระบุเป็น hard preflight ก่อน Phase 4)
- ไม่มี CI/lint/typecheck/test baseline (P0b ยังไม่ทำสำหรับ LK01 — master plan §P0b)
- ไม่มี SLO ตัวเลขสำหรับ redirect latency (NFR-PERF-001 ตั้งใจ defer ไป Beta — VERIFIED ว่าเป็นเจตนา ไม่ใช่ช่องโหว่)
- **VERIFIED (สำคัญ):** centralized billing-core ยังไม่ถูกสร้าง — `services/billing-core/` ไม่มีอยู่จริง; migration `0001_billing_core_schema.sql` ขึ้นต้นด้วย `-- DRAFT — NOT APPLIED`; review security contracts Phase 0.5 (2026-08-30) = **CHANGES REQUIRED**; `apps/hub-web` grep ไม่พบโค้ด billing/stripe จริง (มีแค่ fixture demo-data)

### อาจไม่จำเป็น (INFERENCE จาก ADR-001 + roadmap)
- `subscription`, `payment`, `webhook-receiver` — ADR-001 + MODULE_PROVENANCE ระบุชัดว่าเป็น **historical/reference เท่านั้น ไม่ใช่ build source ของ Phase 4** (VERIFIED). คำถามคือ: เก็บไว้ทำไมในเมื่อ billing ไปอยู่ billing-core แล้ว? (RECOMMENDATION: ตัดออกจาก V1 scope หรือย้ายไปโฟลเดอร์ reference)
- `webhook-receiver` — webhook ของ LK01 เองเป็น Business-tier (Phase 5) และ billing webhook ไปที่ billing-core ไม่ใช่ LK01 → ไม่มี consumer ชัดเจนใน V1 (INFERENCE)
- `import-export` — product ต้องการ CSV export (Pro, Phase 5) แต่โมดูลนี้มี `xlsx-adapter` เป็นหลัก → fit ต้อง re-verify ตอน Phase 5 (INFERENCE)
- ไฟล์ scratch ใน vendor: `tenant-context/agy-prompt.md`, `rate-limit/codex-prompt.txt`, `rate-limit/codex-result.json`, `rate-limit/qwen-stage4-prompt.txt` — เป็น artifact ของ agent workflow ที่หลุดเข้า tree (VERIFIED) → ควรลบ (RECOMMENDATION)

---

## 3. ระยะทางถึง V1 ที่ขายได้

**VERIFIED:** ทุกอย่างยังเป็นศูนย์ — ต้องผ่าน Phase 0→7 พร้อม evidence gate ทุกเฟส (08_TEST_RELEASE_GATES: ทุกเฟสต้อง lint/typecheck/test/negative test/evidence/reviewer verdict)

**INFERENCE (ลำดับความเสี่ยง ไม่ใช่ตัวเลขเวลา):**
1. **Hard external dependency:** Phase 4 (billing) ถูก gate ด้วย billing-core ที่ยังไม่เกิด + security contracts ยัง CHANGES REQUIRED → LK01 ควบคุมจังหวะของตัวเองไม่ได้
2. **Portfolio sequencing:** master plan §7 วาง LK01 เป็นลำดับที่ 6 จาก 8 (หลัง P0b, hub hardening, billing-core, DC01/PS01, MT01) + focus gate เปิดได้แค่ 1 heavy track → ระยะทางตามปฏิทินขึ้นกับ portfolio ทั้งหมด ไม่ใช่ LK01 อย่างเดียว
3. **งานที่ต้องทำเอง:** Phase 0–3 + 5–7 เป็นงาน LK01 ล้วน (scaffold, RLS, redirect worker, analytics/quota, paid features, hardening) — ยังไม่นับ Phase 4 ที่รอ shared service

**Verdict (INFERENCE):** ระยะทางถึง V1 ที่ขายได้ = งาน build 6–7 เฟส + ขึ้นลิฟต์กับ billing-core + ผ่าน P0b/P1 ของ portfolio. ไม่มีหลักฐานใดใน repo ที่บอกว่าใกล้กว่า "ยังไม่เริ่ม". ตัวเลขเดือน = UNVERIFIED (ไม่มี evidence เรื่อง velocity)

---

## 4. สถาปัตยกรรม Cloudflare-first + Supabase + centralized billing-core: ฟังดูดีไหม?

**Verdict: หลักการถูกต้อง (VERIFIED จากเอกสาร), มีช่องโหว่ 3 จุด (INFERENCE)**

จุดแข็ง (VERIFIED จาก 02_SYSTEM_ARCHITECTURE, 03_DATA_SECURITY_TENANCY, ADR-001):
- Redirect worker แยกจาก analytics/billing อย่างชัดเจน; failure matrix ครบ (analytics down → redirect ต่อ; billing down → entitlement เดิมอยู่; cache miss + Supabase down → fail safely)
- Supabase เป็น source of truth, Cloudflare cache เป็นแค่ performance — ถูกต้อง
- RLS fail-closed + negative cross-tenant tests เป็น gate บังคับ — ถูกต้อง
- Centralized billing-core + local entitlement snapshot + ไม่เรียก billing บน hot path — ถูกต้องตามหลักการ
- ADR-001 ไล่ทางเลือก (card-only, promptpay-only, product-owned billing core, bank transfer) และให้เหตุผลปิด — ครบถ้วน

ช่องโหว่ (INFERENCE):
1. **Cold path ของ redirect ยังพึ่ง Supabase อยู่:** cache miss + Supabase outage = redirect ล้มเหลว (เอกสารยอมรับ "fail safely; never guess destination") — ขัดกับหลักการข้อ 1 "Redirect reliability is more important than analytics completeness" ในแง่ availability. ไม่มี edge replica (KV/D1) หรือ stale-while-revalidate ในเอกสาร → RECOMMENDATION: เพิ่ม ADR/design สำหรับ edge fallback ก่อน Phase 2 gate
2. **Dashboard deployment target ไม่ชัด:** 02_SYSTEM_ARCHITECTURE บอก "Next.js Dashboard" แต่ไม่ระบุว่ารันที่ไหน (Workers/OpenNext? Pages? Vercel?) — Next.js บน Cloudflare Workers มี complexity จริง (UNVERIFIED ในเอกสาร) → RECOMMENDATION: ตัดสินใจ + บันทึกก่อน Phase 0
3. **PromptPay reconciliation เป็น dependency chain ยาว:** LK01 Money Gate ต้องการ reconciliation ที่ billing-core ต้อง build + ผ่าน security review ของตัวเองก่อน → LK01 รับความเสี่ยงของ shared service เต็มๆ

---

## 5. ความเสี่ยงทางเทคนิค/ส่งมอบที่ใหญ่ที่สุด

### อันดับ 1 — Redirect hot-path independence (INFERENCE)
- เอกสารออกแบบดีมาก (async analytics, no sync billing) แต่ **cold path ยังมี single point of failure = Supabase** (VERIFIED จาก failure matrix)
- ยังไม่มี SLO ตัวเลข (defer ไป Beta — VERIFIED) → Phase 2 gate พิสูจน์ "correctness" ได้ แต่พิสูจน์ "availability/perf" ไม่ได้จนกว่า Beta
- RECOMMENDATION: Phase 2 ต้องรวม load/failure drill ของ cold path (Supabase down + cache miss) เป็น gate เงื่อนไข ไม่ใช่แค่ unit test

### อันดับ 2 — PromptPay reconciliation (INFERENCE)
- ถูกต้องตามหลักการ (reconciliation ก่อน activation, idempotency, no browser authority) — VERIFIED จาก ADR-001 + PRD FR-BILL-008
- แต่ **ทุกอย่าง hinge กับ billing-core ที่ยังไม่เกิด** + review Phase 0.5 = CHANGES REQUIRED (VERIFIED) → ความเสี่ยงคือ "PromptPay เปิดไม่ได้จนกว่า shared service จะผ่าน gate ของตัวเอง" ซึ่ง LK01 ควบคุมไม่ได้
- ภาระ ops เพิ่ม: manual renewal + 3-day grace + refund แบบ support-ticket (VERIFIED จาก ADR-001) → ต้องมี runbook/คนดูแลก่อนเปิด PromptPay (RECOMMENDATION)

### อันดับ 3 — Portfolio sequencing (VERIFIED)
- LK01 = ลำดับ 6/8, ต้องรอ P0b + P1 billing contract + P4 slot → ความเสี่ยง "เมื่อไหร่" ไม่ใช่ "อย่างไร"

### อันดับ 4 — Vendor drift (VERIFIED)
- โมดูล vendored แช่แข็งที่ `db441ce` (2026-08-26) แต่ upstream วิ่งต่อแล้ว: `payment` เพิ่ม `recurringInterval` (subscription checkout), `subscription` engine เพิ่ม `past_due` handling (VERIFIED จาก diff จริง) → ถ้า LK01 ใช้โมดูลเหล่านี้ (เฉพาะ non-billing ตัวอื่น) ต้องมี drift/update test — master plan §P1 ข้อ 8 ระบุไว้แล้ว (VERIFIED) แต่ยังไม่ implement

---

## 6. Provenance และ fit ของ 10 โมดูล vendored

**Provenance (VERIFIED ทั้งหมด):**
- ทั้ง 10 โมดูลตรงกับ upstream `modules-hub` @ `db441ce` แบบ byte-identical (หลัง normalize CRLF) — VERSION ตรงกันทุกตัว (auth-supabase 0.2.0, tenant-context 0.3.0, subscription 0.1.0, payment 0.1.0, webhook-receiver 0.1.0, rate-limit 0.1.0, audit-log 0.1.0, config-runtime 0.1.0, health-check 0.2.0, import-export 0.2.0)
- ต่างกันแค่: CRLF line-ending (upstream เป็น CRLF, vendored เป็น LF) + ไฟล์ scratch 4 ไฟล์ที่หลุดเข้า (ดู §2)
- โมดูลเป็น TypeScript source (`main: ./index.ts`) + vitest devDeps — เป็น library ไม่ใช่ service; ไม่มี node_modules/package-lock ระดับ root ใน repo นี้ → **ไม่เคยถูก build/test ภายใน repo นี้** (VERIFIED)

**Test evidence (VERIFIED):** มี TEST-REPORT.md แค่ 2/10 (audit-log อ้าง 126 tests pass, webhook-receiver) — ที่เหลือมี test files แต่ไม่มี evidence doc ในสำเนา vendored

**Fit แบ่งตามคุณค่า (INFERENCE):**

| โมดูล | ประเภท | จำเป็นใน V1? | เฟส |
|---|---|---|---|
| auth-supabase | platform plumbing | ใช่ | 1 |
| tenant-context | platform plumbing | ใช่ | 1 |
| config-runtime | platform plumbing | ใช่ | 0 |
| health-check | platform plumbing | ใช่ | 0/6 |
| rate-limit | platform plumbing | ใช่ (abuse) | 3/6 |
| audit-log | platform plumbing | ใช่ (billing/security gate) | 6 (แต่ audit actions เริ่มเฟส 1) |
| subscription | ~~billing~~ → historical/reference | **ไม่** (ADR-001) | — |
| payment | ~~billing~~ → historical/reference | **ไม่** (ADR-001) | — |
| webhook-receiver | ~~billing~~ → historical/reference | **ไม่** (ADR-001; LK01 webhook = Business, Phase 5) | — |
| import-export | customer-visible (Pro CSV export) | ไม่ (Phase 5; fit xlsx vs CSV ต้อง re-check) | 5 |

**Platform plumbing = 7 ตัว (auth-supabase, tenant-context, config-runtime, health-check, rate-limit, audit-log) + import-export เป็น customer-visible แต่ Phase 5. Billing 3 ตัว = dead weight หลัง ADR-001.**

---

## 7. V1 ที่เล็กที่สุดที่ hot-path-safe และ validate willingness to pay

**ข้อจำกัด (VERIFIED):** ADR-001 ปฏิเสธ manual bank transfer/slip review เป็น payment rail; portfolio ล็อก centralized billing-core เป็นทางเดียว; PRD FR-BILL-007 ห้าม product-owned billing state machine → **LK01 ไม่มีทางเก็บเงินโดยไม่พึ่ง billing-core**

**RECOMMENDATION — V1 ขั้นต่ำ:**
1. **Phase 0–3 เต็มรูปแบบ** (scaffold → auth/tenant/RLS → link core + redirect worker → analytics + quota) — นี่คือ "hot-path-safe core" ที่พิสูจน์ product promise: สร้างลิงก์คงที่, เปลี่ยน destination, นับ click, quota ไม่ตัด redirect
2. **Phase 4 เฉพาะเมื่อ billing-core พร้อม** — Card rail ก่อน, PromptPay ต่อเมื่อ reconciliation ผ่าน (ตาม ADR)
3. **ตัด Phase 5 ออกจาก V1-critical path** — campaign/UTM/custom domain/export/API/team เป็น upsell หลัง WTP พิสูจน์แล้ว (INFERENCE: ฟีเจอร์เหล่านี้เพิ่มค่าแต่ไม่ใช่เหตุผลที่คนจ่ายเงิน — เหตุผลคือ "ลิงก์คงที่ + รู้ว่า traffic มาจากไหน")
4. **WTP validation ต้องมี paid path จริง** — Free tier (5 links/250 clicks) พิสูจน์ activation/first-value ได้ แต่พิสูจน์ WTP ไม่ได้; ถ้า billing-core ยังไม่พร้อม → ทางเลือกเดียวที่ซื่อสัตย์คือรอ หรือขอ council เปิด ADR ใหม่เรื่อง paid beta แบบ manual onboarding (ต้องผ่าน owner approval — RECOMMENDATION นี้อยู่นอกเอกสารปัจจุบัน)

**Verdict (INFERENCE):** V1 ที่เล็กที่สุดที่ขายได้ = Phase 0–3 + Phase 4 (Card) โดยมี redirect worker พิสูจน์ independence ก่อน (Phase 2 gate) และ billing-core เป็น critical path ที่ LK01 ควบคุมไม่ได้

---

## 8. Dissent / ความไม่แน่นอน

- **UNVERIFIED:** ตัวเลขระยะเวลา/effort — ไม่มี evidence velocity ใน repo; อย่าเอาไปใช้ตัดสินใจเรื่อง "เมื่อไหร่"
- **UNVERIFIED:** Stripe Thailand + PromptPay eligibility จริง — เอกสารบอกว่าเป็น preflight ยังไม่ทำ; 09_EXTERNAL_DEPENDENCIES ระบุ "re-verify" ไว้แล้ว
- **UNVERIFIED:** Cloudflare for SaaS plan limits ปัจจุบัน — เอกสารเองบอกให้ re-verify ก่อน Phase 5
- **INFERENCE (ต้องระวัง):** การจัดหมวด "platform plumbing vs customer-visible" เป็น judgment ของ lens นี้ อิงจาก roadmap/ADR — ไม่ใช่ข้อเท็จจริงในเอกสาร
- **Dissent หลัก:** เอกสารออกแบบ hot-path เก่งเรื่อง "ไม่บล็อก redirect ด้วย analytics/billing" แต่ **ยอมรับว่า Supabase down + cache miss = redirect ล้ม** — ผมมองว่านี่คือจุดที่ขัดกับ product principle ข้อ 1 และควรมี edge fallback design ก่อน Phase 2 ไม่ใช่รอ Beta
- **Dissent รอง:** การ vendored billing 3 โมดูล (subscription/payment/webhook-receiver) หลัง ADR-001 = dead weight + ต้อง maintain drift — แนะนำให้ย้ายออกจาก vendor/ หรือทำเครื่องหมาย reference ให้ชัด ก่อน Phase 0 เพื่อไม่ให้ทีม build หลงไปใช้

---

## 9. สรุป verdict

1. **สถานะ:** pre-build จริง 100% — เอกสารล็อกครบและสอดคล้องกัน (audit PASS + ADR addendum), zero code, zero CI, zero schema
2. **สถาปัตยกรรม:** หลักการถูกต้อง; จุดอ่อน = cold path ของ redirect ยังพึ่ง Supabase + dashboard deployment target ไม่ชัด
3. **ความเสี่ยงใหญ่สุด:** (a) redirect cold-path availability, (b) PromptPay/billing ขึ้นกับ billing-core ที่ยังไม่เกิดและ security review ยัง CHANGES REQUIRED, (c) portfolio sequencing วาง LK01 ไว้ลำดับ 6/8
4. **V1 ขั้นต่ำ:** Phase 0–3 + Phase 4 (Card) — ตัด Phase 5 ออกจาก critical path; WTP พิสูจน์ไม่ได้จนกว่า paid path จริง (billing-core) พร้อม
5. **Vendor fit:** 7/10 เป็น platform plumbing ที่ใช้ได้จริง; 3 ตัว billing = historical/reference; import-export = Phase 5; ต้องมี drift test
