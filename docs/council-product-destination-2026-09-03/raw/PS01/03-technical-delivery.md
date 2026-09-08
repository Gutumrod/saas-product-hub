# PS01 Pawstia PMS — Technical/Delivery Lens (Round 1)

**Lens:** Technical/Delivery — implementation reality, dependency cost, reusable capability fit, risk, distance to V1
**Date:** 2026-09-03
**Repo:** `D:\AI-Workspace\projects\saas-product-hub\products\PawSpace`
**Branch:** `verify/phase13-closure-2026-09-01` @ `fdd10e7` (working tree clean — VERIFIED via `git status`)
**Evidence basis:** อ่านไฟล์จริงใน repo + `git log`/`git diff`/`gh run view`/`gh pr view` + Module Hub `INDEX.md`/`REGISTRY.md` (อ่านอย่างเดียว ไม่แก้ไข)

---

## 0. สรุปความขัดแย้ง CURRENT_STATUS.md vs PHASE13_IMPLEMENTATION_EVIDENCE.md (ตรวจด้วยหลักฐานจริง)

- **VERIFIED:** `docs/CURRENT_STATUS.md` (2026-09-02) ระบุ Phase 13 NOT CLOSED โดยอ้าง HEAD `c063592` และ CI run `33494605562` (run ที่ FAIL ที่ Phase 1 isolation regression)
- **VERIFIED:** `PHASE13_IMPLEMENTATION_EVIDENCE.md` (2026-09-03) ระบุ CI run `33743691064` = success ที่ HEAD `d6f4acf` (และต่อมา `fdd10e7` หลัง fix whitespace)
- **VERIFIED (ตรวจย้อนกับ GitHub จริง):** `gh run view 33743691064` → job `verify` = ✓ ทุก step (24/24 steps เขียว: clean migration replay, DB lint, Phase 1/2/3 historical-boundary regressions, pgTAP suites, quota concurrency races, legacy `trial`→`trialing` normalization probe, TS suites ทั้งหมด, Phase 10 browser E2E, typecheck, lint, build, `git diff --check`) ใช้เวลา 8m14s
- **VERIFIED:** `gh pr view 4` → PR #4 ยังเป็น **DRAFT** ไม่ได้ merge เข้า `master`
- **VERIFIED:** `git log` — 20 commits ที่ branch นำหน้า `master` (master @ `767a512`); commit `6527987` "docs(phase13): record independent closure evidence" และ `fdd10e7` "fix(docs): remove evidence whitespace errors" เป็น commit ล่าสุด (2026-09-03)
- **VERIFIED:** `docs/daily/2026-09-02.md` และ `docs/IMPLEMENTATION_STATUS.md` (reconciled 2026-09-02) ยังอ้างสถานะเก่า (c063592 / run 33494605562) — เป็นเอกสารที่ **ล้าสมัย** ณ วันที่ 2026-09-03 ไม่ใช่เอกสารที่ "ผิด" ณ เวลาที่เขียน
- **INFERENCE:** ความขัดแย้งคลี่คลายแล้ว — หลักฐาน 2026-09-03 (CI เขียว + evidence doc) เป็นหลักฐานที่ใหม่และแข็งแรงกว่า CURRENT_STATUS.md (2026-09-02) ตามหลัก "prefer strongest current evidence" อย่างไรก็ตาม CURRENT_STATUS.md ยังไม่ถูกอัปเดตให้สะท้อน run ที่สำเร็จ
- **UNVERIFIED:** ยังไม่มีไฟล์ `REVIEW-phase13-*.md` ใน repo (ls REVIEW-* → มีแค่ phase 3, 8, 9, 10, 11, 11.1, 12) — evidence doc ระบุผล CI แต่ **ไม่มีการบันทึก verdict ของ independent reviewer** ตาม convention ของ repo (ดู Phase 11 correction: implementer ห้าม self-declare completion)

---

## 1. สิ่งที่สร้างแล้วจริง (Implementation Reality)

### 1.1 ฐานข้อมูล (13 migrations, replay ตามลำดับ — VERIFIED จาก `git ls-files` + CI)
- Phase 1: initial schema (shops, staff_users, pet_owners, pets, rooms, bookings, booking_pets, daily_reports, google_sync_mappings, sync_queue)
- Phase 2: authoritative gateways (RPC + RLS + deterministic lock ordering + GiST exclusion)
- Phase 3: auth/tenant (bootstrap_shop, staff roles, tenant context)
- Phase 5: LINE claim; Phase 6: daily report + LINE delivery; Phase 7: Google Sheets sync; Phase 8: camera access; Phase 9: commercial entitlements; Phase 11: customer booking requests (LIFF); Phase 12: pilot onboarding + CSV import + import_batches audit
- Phase 13 (3 migrations): `20260825141500_subscription_lifecycle` (shop_subscriptions, subscription_audit_log, transition RPCs, quota triggers, legacy status mirror), `20260825141600_subscription_hardening` (audit immutability, commercial mutation triggers ทุก aggregate, idempotent package mutation), `20260825141700_bootstrap_trialing_remediation` (bootstrap_shop ใช้ `trialing` แทน `trial`)
- **VERIFIED:** master มี migration 41500 และ 41600 อยู่แล้ว; branch นี้ **แก้ไข** 41500 (16 บรรทัด: drop constraint → normalize → add constraint) และ **เพิ่ม** 41700

### 1.2 แอปพลิเคชัน (Next.js 16.3.1 App Router — VERIFIED จาก package.json + file listing)
- Routes: `/` (operations), `/dashboard`, `/login`, `/onboarding`, `/auth/accept-invite`, `/line/book` (LIFF), `/line/claim`, `/camera/[shopSlug]`
- API: `/api/daily-reports`, `/api/line/claim`, `/api/camera/*`, `/api/internal/line-dispatch`, `/api/internal/google-sync`
- Server Actions: auth, booking, camera, daily-report, google-sheet, line-booking, line-claim, onboarding, operations, staff, tenant
- lib/: booking-service, daily-report-service (+media/storage), line-claim/booking/worker/transport/id-token, google-sheet-sync-core/worker/records/api, camera-access-core/server, csv-import-service, import-export (Module Hub subtree copy), entitlements, dashboard-service, pilot-readiness-service, tenant-context, supabase-admin/browser/server
- Tests: 10 TS suites (phase3–13) + e2e/phase10-pilot.spec.ts + 6 pgTAP SQL suites + concurrency script

### 1.3 สิ่งที่ยังไม่มี (VERIFIED)
- **Payment collection: ไม่มี** — grep Stripe/PromptPay/SlipOK/billing ใน app/ lib/ พบแค่ `lib/entitlements.ts` (นิยามราคา/โควตา pure logic) ไม่มี SDK/webhook/charge path; `.env.example` ไม่มี payment keys; PRD ระบุเป็น non-goal ของ V1
- **Production deployment: ไม่มี** — ไม่มี vercel.json/Dockerfile/fly.toml/wrangler.toml; `.github/workflows/` มีแค่ `phase13-verification.yml` (verification อย่างเดียว ไม่มี deploy pipeline); PRODUCTION_OPERATIONS.md เป็น framework เอกสาร (pre-production) ไม่ใช่ implementation
- **Staging environment: ไม่มี** — ยังไม่มี isolated Supabase cloud project ตามที่ ROADMAP วางไว้
- **Supabase Vault: ยังไม่ใช้** — LINE tokens ยังอยู่ที่ `LINE_CHANNEL_ACCESS_TOKENS_JSON` (env) ตามที่ SYSTEM_ARCHITECTURE.md รับเอง (reconciliation note)
- **Independent Phase 13 review: ไม่มีไฟล์** (ดู §0)
- **Real-store Closed Beta: ยังไม่เกิด** — ไม่มีหลักฐานร้านจริง

### 1.4 สิ่งที่อาจไม่จำเป็น (สำหรับ V1 scope-trim)
- **VERIFIED:** Phase 8 camera access สร้างและทดสอบแล้ว (22/22) แต่ PRD จัดเป็น bounded capability ไม่ใช่ core loop; เป็น differentiator ที่เพิ่ม attack surface (public routes, signing secret, IP hashing) — **RECOMMENDATION:** เก็บไว้ได้ถ้าเป็นจุดขาย แต่ถ้าต้องตัด scope เพื่อ V1 ให้ตัดก่อน (ไม่กระทบ core loop)
- **VERIFIED:** `wip/warm-hospitality-design-c-2026-08-28` เป็น branch แยก (design reference) ไม่ได้ merge — ไม่ใช่ critical path ของ V1
- **INFERENCE:** Google Sheets sync (Phase 7) จำเป็นต่อ positioning (Data Ownership — แก้ fear ของร้าน) ไม่ควรตัด; LINE LIFF booking (Phase 11) เป็น value-add แต่ core loop (จอง+report) ทำงานได้โดยไม่ต้องมี — ตัดได้ถ้าจำเป็นแต่เสียจุดขาย

---

## 2. ระยะห่างถึง V1 ที่ขายได้ (Distance to Sellable V1)

### 2.1 สถานะ phase (VERIFIED จาก ROADMAP + evidence/review files + CI)
| Phase | สถานะ | หลักฐาน |
|---|---|---|
| 1–12 | **CLOSED** | ROADMAP + evidence files; REVIEW files มีสำหรับ 3, 8, 9, 10, 11, 11.1, 12 |
| 13 | **IMPLEMENTED + CI VERIFIED แต่ closure gate ยังไม่ครบ** | CI 33743691064 เขียว + evidence doc มีแล้ว; แต่ PR #4 ยัง DRAFT, ไม่มี REVIEW-phase13, CURRENT_STATUS.md ยังไม่ update |
| Payment | **NOT IMPLEMENTED** | ไม่มีโค้ด/keys |
| Production deploy | **NOT VERIFIED / NOT LAUNCHED** | ไม่มี deploy config/staging |
| Closed Beta | **NOT COMPLETED** | ไม่มีร้านจริง |

### 2.2 ระยะห่าง (INFERENCE/RECOMMENDATION)
- **ถึง technical pilot-ready:** เหลือแค่ (1) independent review ของ Phase 13 + (2) อัปเดต CURRENT_STATUS/IMPLEMENTATION_STATUS + (3) ตัดสินใจ merge PR #4 — เป็นงานเอกสาร/process ไม่ใช่งานโค้ดใหญ่
- **ถึง paid production (V1 ขายได้):** ต้องเพิ่ม payment integration (ผ่าน authoritative subscription domain เดิม), staging + deploy pipeline, monitoring, backup/restore drill, incident/support process, Terms/Privacy/DPA review, brand decision, และ Closed Beta validation — ตาม ROADMAP Stage C ครบทุกข้อ
- **RECOMMENDATION:** อย่าเรียก "V1 ขายได้" ก่อน Stage C; สิ่งที่พร้อมตอนนี้คือ "Closed Beta technical readiness" เท่านั้น

---

## 3. สถาปัตยกรรม Authoritative-RPC + Supabase — sound ไหม?

**VERDICT: SOUND สำหรับ destination นี้ (single-store PMS, multi-tenant per shop)** — หลักฐาน:
- **VERIFIED:** หลัก "no generic CRUD on invariant-bearing tables; ทุก mutation ผ่าน SECURITY DEFINER RPC" ถูก enforce ทั้ง migration (REVOKE + RPC-only) และทดสอบจริง (Phase 2 concurrency, cross-tenant 409 ใน E2E, direct-RPC anti-forgery probes ใน Phase 12)
- **VERIFIED:** Deterministic lock ordering (Booking→Pet→Room) + GiST exclusion constraint + pet no-overlap — มี concurrency race tests (phase13-concurrency.sh: 9→10→11 rooms, 299→300→301 pets, exactly-one-success race)
- **VERIFIED:** RPC ทั้งหมดตั้ง `SET search_path = public, pg_temp` (ลด search_path hijack risk); helper ตัวใน (enqueue_sync_event) revoke จาก browser
- **VERIFIED:** Outbox pattern (sync_queue) enqueue ใน transaction เดียวกับ business mutation — ถูกต้องตามหลัก
- **VERIFIED:** Phase 13 subscription domain เป็น DB-authoritative (service_role-only transition RPC, audit immutability trigger, commercial mutation triggers ทุก aggregate, idempotency key + fingerprint) — ออกแบบดีและ provider-agnostic (มี `future_billing_event` source รองรับ payment ภายหลัง)
- **จุดอ่อนที่ต้องยอมรับ (VERIFIED จาก docs):** LINE secrets ยังเป็น env JSON ไม่ใช่ Vault (target architecture); worker เป็น route handler ใน Next.js (ไม่ใช่ infra-level worker) — พอใช้ได้กับ scale V1 แต่ต้อง monitor
- **INFERENCE:** สถาปัตยกรรมนี้เหมาะกับ destination (pet hotel OS) เพราะ invariant อยู่ที่ DB boundary ทำให้ UI หลายหน้า (staff app, LIFF, dashboard) ใช้ gateway เดียวกันโดยไม่เสี่ยง bypass

---

## 4. ความเสี่ยงทางเทคนิค/การส่งมอบที่ใหญ่ที่สุด

1. **VERIFIED — ช่องว่างระหว่าง isolated-CI กับ production reality:** ไม่เคยมี run กับ Supabase cloud project จริง, LINE channel จริง, Google Sheet จริง, หรือร้านจริงเลย (evidence doc รับเอง: "isolated CI evidence, not production deployment evidence") — การ integration ครั้งแรกกับของจริง (LIFF production config, Google service account scopes, Storage CDN, camera feed hosts, LINE rate limits) คือจุดที่ defect จะโผล่
2. **VERIFIED — Migration hygiene:** branch **แก้ไข migration 41500 ที่ master มีอยู่แล้ว** (แทนที่จะเพิ่ม migration ใหม่ล้วนๆ) — ปลอดภัยตอนนี้เพราะยังไม่มี remote apply (evidence doc ยืนยัน "no remote migration was applied") แต่ **ต้อง freeze migrations ก่อน apply กับ environment ใด** มิฉะนั้น replay พัง; 41700 (remediation แบบ forward migration) เป็น pattern ที่ถูกต้องกว่า
3. **VERIFIED — Process risk:** ยังไม่มี independent review ของ Phase 13; ประวัติ repo แสดงว่า self-declared completion เคยผิดพลาดมาแล้ว (Phase 11 correction) — อย่าปิด Phase 13 โดยไม่มี REVIEW file
4. **INFERENCE — Single-operator dependency:** commits ทั้งหมดมาจาก Gutumrod; ความต่อเนื่องของ process (evidence-first) พึ่งวินัยคนเดียว
5. **INFERENCE — Per-shop onboarding ops cost:** LINE channel token ต่อร้าน, Google service account, camera feed host — เป็น operational cost ต่อ tenant ที่ต้องมี SOP (มี ONBOARDING_SOP.md แล้ว — VERIFIED) แต่ยังไม่เคยพิสูจน์กับร้านจริง

**Dependency cost โดยรวม: ต่ำ (VERIFIED จาก package.json)** — deps runtime แค่ supabase-js, google-auth-library, sharp, next, react, lucide-react, clsx, tailwind-merge, server-only — ไม่มี bloat; ค่าใช้จ่ายจริงอยู่ที่ ops ต่อร้าน ไม่ใช่ library

---

## 5. Module Hub capabilities ที่เพิ่มมูลค่า/ลดต้นทุนโดยไม่ bloating V1

(อ่าน `INDEX.md` + `modules/REGISTRY.md` — 24 modules, 23 Completed, 1 Pilot — VERIFIED; ไม่แก้ไขอะไร)

| Module | สถานะ | Verdict สำหรับ PS01 | เหตุผล |
|---|---|---|---|
| `import-export` 0.2.0 | ✅ | **ใช้แล้ว (ADAPTER ONLY / SOURCE SUBTREE COPY)** — VERIFIED จาก Phase 12 evidence | ก็อป core/adapters เข้า `lib/import-export/` แล้ว |
| `payment` 0.1.0 + `webhook-receiver` 0.1.0 | ✅ | **RECOMMENDATION — สำหรับ Stage C (paid launch) เท่านั้น** | ลดต้นทุนสร้าง billing webhook/charge path; ต้องต่อเข้ากับ `transition_shop_subscription(..., 'future_billing_event')` ที่มีอยู่แล้ว — ไม่ใช่ V1 pilot |
| `health-check` 0.2.0 | ✅ | **RECOMMENDATION — Stage C** | ตรงกับ prerequisite monitoring ของ PRODUCTION_OPERATIONS.md |
| `feature-flags` 0.1.0 | ✅ | **RECOMMENDATION (optional, ต้นทุนต่ำ)** | ใช้ gate เปิด/ปิด LIFF booking หรือ camera ต่อร้านระหว่าง pilot |
| `subscription` 0.1.0 | ✅ | **NOT NEEDED สำหรับ core** | PawSpace สร้าง subscription domain ที่ DB-authoritative เองแล้ว; TS module จะซ้ำ authority (INFERENCE) |
| `auth-supabase` / `tenant-context` | ✅ | **NOT NEEDED** — VERIFIED (ประเมินแล้วใน Phase 11/12) | RLS + current_staff_shop_id() ครอบคลุม |
| `notification` / `audit-log` / `job-retry` / `scheduler` / `rate-limit` / `event-bus` | ✅ | **NOT NEEDED** | มีของเองแล้ว: LINE delivery, subscription_audit_log + import_batches, outbox/worker + retry, camera rate limit (INFERENCE จาก file listing + evidence) |
| `line-oa-ai-module` 0.1.0 | 🧪 | **NOT NEEDED** — VERIFIED (ประเมินแล้วใน Phase 11) | chatbot-oriented ไม่ตรง structured booking contract |

**RECOMMENDATION สรุป:** V1 pilot ไม่ต้องหยิบ module ใหม่เลย; ของที่คุ้มคือ payment+webhook-receiver+health-check ตอน Stage C เท่านั้น

---

## 6. V1 ต้องมี Project B admission + billing ไหม? Pilot ก่อน paid production ได้ไหม?

- **VERIFIED (ROADMAP Stage B/C):** Closed Beta เริ่มที่ 1 ร้านจริง → 3 → 5 → 10 วัด metrics (onboarding time, booking failures, LINE delivery success, Sheets sync failures, WTP) ก่อน "charging broadly"; payment collection เป็น prerequisite ของ Stage C (Paid Launch) เท่านั้น
- **VERIFIED (PRD non-goal #3):** billing automation / SlipOK / e-Tax อยู่นอก V1 อย่างชัดเจน
- **VERIFIED (โค้ดจริง):** `initialize_shop_subscription_internal` สร้าง subscription เป็น `trialing` 30 วันอัตโนมัติตอนสร้าง shop; `resolve_shop_commercial_authority` ให้ `commercial_access = TRUE` ระหว่าง trial — **ระบบรองรับ pilot แบบไม่เก็บเงินได้ทันที** (quota 10 rooms/300 pets ยังบังคับ)
- **VERIFIED (CURRENT_STATUS.md):** "Booking Stage 4 prerequisite is closed, so PS-A2 Project B admission work is unblocked... but Pawstia is not yet admitted" — Project B admission เป็น **portfolio governance gate** ไม่ใช่ technical gate
- **VERDICT (INFERENCE/RECOMMENDATION):** Pilot/value validation **ไม่ต้องรอ billing** และไม่ต้องรอ paid production; ส่วน Project B admission เป็นเรื่อง governance ของ portfolio (ต้องให้ council/owner ตัดสิน) — จากมุม technical ไม่มีอะไรในโค้ดที่ block pilot โดยไม่ admit

---

## 7. Verdict สรุป (Technical/Delivery lens)

1. **VERIFIED:** ระบบ core (booking, daily report + LINE, Sheets export, CRM, onboarding, subscription/quota) สร้างจริง ทดสอบจริง (CI เขียวครบ matrix) — คุณภาพงานสูง: invariant อยู่ที่ DB, มี concurrency/anti-forgery/cross-tenant tests
2. **VERIFIED:** Phase 13 implementation + CI evidence ครบแล้ว แต่ **closure ยังไม่สมบูรณ์** เพราะไม่มี independent REVIEW file และ PR #4 ยัง DRAFT — ต้องปิด process gate นี้ก่อนประกาศ CLOSED
3. **VERIFIED:** Payment + production deployment + real-store beta ยังไม่มี — ระยะห่างถึง "V1 ขายได้ (paid)" ยังมีงานอีก 1 ชุด (Stage C) แต่ระยะห่างถึง "pilot กับร้านจริง" เหลือแค่ process closure + ops setup
4. **RECOMMENDATION หลัก:** (a) ให้ independent reviewer อ่าน evidence + rerun/spot-check แล้วเขียน REVIEW-phase13; (b) อัปเดต CURRENT_STATUS.md/IMPLEMENTATION_STATUS.md ให้ตรงกับ run 33743691064; (c) freeze migrations ก่อน apply กับ cloud project ใด; (d) เริ่ม Closed Beta กับ 1 ร้านจริงโดยใช้ trialing subscription (ไม่ต้องรอ billing); (e) เลื่อน payment/webhook/health-check ไป Stage C

## 8. Dissent / Uncertainty

- **Dissent หลัก:** เอกสาร evidence ใช้คำว่า "Independent Closure Evidence" แต่ใน repo **ไม่มีไฟล์ independent review** — ผมถือว่า CI เขียว ≠ independent review ผ่าน (repo เองเคยพิสูจน์ว่า self-declared completion ผิดพลาดได้ใน Phase 11) ถ้า council จะปิด Phase 13 ต้องมี REVIEW file ก่อน
- **Uncertainty:** ผม verify CI run ผ่าน `gh run view` (ทุก step เขียว) แต่ไม่ได้ rerun ท้องถิ่นเอง — ตัวเลข test counts ใน evidence docs (เช่น 92/92, 45/45) เป็น self-report ของผู้เขียน ไม่ได้ rerun โดยผม
- **Uncertainty:** สถานะ "Phase 1–12 CLOSED" อ้างอิง ROADMAP + evidence/review files ที่มีอยู่ — phase 1–2 และ 4–6 ไม่มี REVIEW file เฉพาะ (มี evidence อยู่ใน PHASE10 doc) แต่ไม่มีสัญญาณว่ายัง open
- **Uncertainty:** Project B admission เป็น governance ไม่ใช่ technical — ผมตอบได้แค่ "technical ไม่ block" ไม่ใช่ "ควร admit หรือไม่"
