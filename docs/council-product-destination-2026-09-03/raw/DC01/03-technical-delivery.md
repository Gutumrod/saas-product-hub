# DC01 DocCraft — Technical/Delivery Lens — Raw Analysis

> Council: WSTERA Product Destination Council Round 1
> Lens: Technical/Delivery (implementation reality, dependency cost, reusable capability fit, risk, distance to V1)
> Date: 2026-09-03
> Evidence basis: อ่านไฟล์จริงใน repo + รัน test/typecheck/lint/build/E2E เอง + ตรวจ git state + ดู Module Hub registry
> Label rule: VERIFIED = ตรวจจาก repo/รันเอง / INFERENCE = อนุมานจากหลักฐาน / UNVERIFIED = ยังไม่มีหลักฐาน / RECOMMENDATION = ข้อเสนอ

---

## 0. สถานะ repo ที่ตรวจเอง (VERIFIED)

- Branch `master`, HEAD `b942a22` (`docs: record owner decision D-2026-09-03...`), working tree **clean** (0 files modified), 17 commits ทั้งหมด. — VERIFIED (รัน `git status` / `git log` เอง)
- `CURRENT_STATUS.md` ระบุ HEAD `ceeb2a1` — **ล้าสมัย 3 commits** (ต่อมาคือ `edaee15`, `ea5f513`, `b942a22` ซึ่งเป็น docs-only). สาระสำคัญของไฟล์ยังตรงกับความจริง แต่ HEAD ที่บันทึกไม่ใช่ HEAD ปัจจุบัน. — VERIFIED
- รันเองจาก working tree ปัจจุบัน:
  - `pnpm test` → **118/118 PASS** (10 test files) — VERIFIED
  - `pnpm test:e2e` → **33/33 PASS** (Playwright chromium) — VERIFIED
  - `pnpm typecheck` → PASS — VERIFIED
  - `pnpm lint` → PASS — VERIFIED
  - `pnpm build` → PASS (Next.js 16.3.1, static 3/3) — VERIFIED
- ตัวเลข 118/118 + 33/33 ตรงกับที่ `GATE3_INDEPENDENT_FINAL_REVIEW_2026-09-01.md` และ `CURRENT_STATUS.md` อ้าง (Gate 3 review ระบุ 118/118 + 33/33; Gate 4 review ระบุ 118/118 + 32/32 — E2E เพิ่มมา 1 ตัวคือ "backup JSON controls stay hidden" ตาม D-2026-09-03). — VERIFIED

---

## 1. สิ่งที่สร้างแล้วจริง (VERIFIED จาก source tree + tests)

**Phase 1 — Domain + Calculation (Gate 1 PASS):**
- `src/domain/document/types.ts` + `schema.ts` — canonical `DocCraftDocument`, `CURRENT_SCHEMA_VERSION = 2` (ตรวจเจอในไฟล์จริง). — VERIFIED
- `src/domain/tax/types.ts` + `validation.ts` — entityType แยกจาก vatStatus, tax-invoice eligibility. — VERIFIED
- `src/domain/calculation/` — calculate/rounding/types, VAT 7% centralized, WHT proportional allocation, deposit. — VERIFIED
- `src/domain/validation/result.ts`. — VERIFIED

**Phase 2 — Editor + Modular Blocks (Gate 2 PASS):**
- `src/ui/editor/` ครบ: DocCraftEditor, editor-state (pure immutable), BlockVisibilityControls, sections ทั้ง 8 (Document/Business/Customer/Items/Adjustments/Payment/TermsNotes), create-initial-document. — VERIFIED
- `src/ui/preview/DocumentPreview.tsx` — live preview. — VERIFIED
- Responsive: desktop >=1024 dual-pane, compact <1024 switcher (มี E2E ตรวจ breakpoint 1024px). — VERIFIED (จาก evidence + E2E ที่รันผ่าน)

**Phase 3 — A4 Preview + Print (Gate 3 PASS):**
- `app/globals.css` — `@page A4 portrait`, `@media print` rules, `break-inside: avoid`, `.no-print` chrome hiding. — VERIFIED
- `window.print()` อยู่ที่ `src/ui/editor/DocCraftEditor.tsx:100` พร้อม fail-closed guard (invalid doc → print disabled). — VERIFIED
- Fixtures 6 ตัวใน `src/domain/fixtures/representative-documents.ts` (1 หน้า, 22 รายการหลายหน้า, ไทยยาว, ลูกค้ายาว, มีรูป, minimal). — VERIFIED
- หลักฐาน native print จริง: 5 screenshots ใน `docs/evidence/` (1 หน้า before/after fix, multi-page P1–P3) + independent review 2026-09-01 ตรวจเอง. — VERIFIED (มีไฟล์ภาพจริง; ตัวภาพเองไม่ได้เปิดดู — แต่อยู่ใน evidence trail ที่ reviewer อ้างอิง)

**Phase 4 — Local Persistence + Image Pipeline (Gate 4 PASS):**
- `src/persistence/` ครบ: storage (localStorage adapter + SecurityError/QuotaExceededError guard), migration (v1→v2), validation (untrusted payload), import-export, errors, types. — VERIFIED
- `src/image/item-image.ts` — browser-only decode/resize/compress/encoded-size guard (max 262,144 bytes, 960px, 4 attempts). — VERIFIED
- JSON export/import: **built และถูกซ่อนใน UI** — `btn-import-json`, `btn-export-json`, `btn-mobile-export` มี attribute `hidden` ใน `DocCraftEditor.tsx` (ตรวจเจอในไฟล์จริง) ตาม owner decision D-2026-09-03 (KEEP hidden). Capability ยังถูก test ผ่าน `dispatchEvent`. — VERIFIED

**Dependency cost (VERIFIED จาก package.json):**
- runtime dependencies = `next 16.3.1`, `react 19.2.8`, `react-dom 19.2.8` เท่านั้น. devDeps = test/lint/tooling ล้วน. **Zero runtime dependency เพิ่มจาก scaffold** — ไม่มี PDF lib, ไม่มี Supabase, ไม่มี state library, ไม่มี UI framework เพิ่ม. — VERIFIED
- นี่คือจุดแข็งด้าน delivery: V1 core loop ทำงานด้วย 3 runtime deps และ static export ได้ (build เป็น static 3/3 routes). — VERIFIED

---

## 2. สิ่งที่ยังขาด / ยังไม่เปิด (VERIFIED)

| Phase | สถานะ | หลักฐาน |
|---|---|---|
| Phase 4.1 Business Logo | **NOT OPENED** — brief reviewed, ยังไม่มี production code | grep `branding|businessLogo|logo` ใน `src/` = 0 matches; brief ระบุ "NOT OPENED FOR IMPLEMENTATION" |
| Phase 5 PromptPay QR | **NOT OPENED** — brief prepared | grep `promptpay|crc16|emv` ใน `src/` = เจอแค่ข้อความ fixture (payment instruction copy) ไม่มี payload/CRC code |
| Phase 6 MVP Hardening + RC | **NOT STARTED** — ไม่มี PHASE6 evidence, ไม่มี release runbook | ไม่มีไฟล์ evidence ของ Phase 6 ใน docs/ |
| PV Pilot Validation | **NOT REACHED** — ยังไม่มี real-user evidence | ไม่มีหลักฐาน pilot |
| Phase 7–9 Cloud/Billing/Post-MVP | **NOT STARTED** — ถูก gate ด้วย PV | — |

**สิ่งที่อาจไม่จำเป็น (INFERENCE/RECOMMENDATION):**
- **Item-image pipeline** เป็นฟีเจอร์ที่ซับซ้อนที่สุดของ V1 (schema v2 + migration + 4-attempt retry + strict validation) เพื่อรองรับ block ที่เป็น optional — complexity-to-value ratio สูงสุดใน V1. แต่สร้างเสร็จและผ่าน gate แล้ว การตัดทิ้งตอนนี้ไม่ประหยัดอะไร — เก็บไว้. — INFERENCE
- **JSON export/import ที่ถูกซ่อน** — capability ถูก build และ test ครบ แต่ V1 ship โดยไม่มี customer-facing backup path ใดๆ. ไม่ใช่ของที่ไม่จำเป็น (มันคือ backup ทางเดียวที่เหลือ) แต่สถานะ "hidden" สร้างช่องโหว่ UX (ดู Section 5). — INFERENCE
- ไม่พบ scope ที่ "เกินจำเป็น" ระดับที่ควรตัด — ทุกอย่างที่ build อยู่ใน PRD V1 contract. — INFERENCE

---

## 3. Distance to Sellable V1

**ระยะถึง "free V1 ที่ deploy ได้" (ตาม PRD §13): สั้นมาก.**
- ปิดแล้ว: Phase 1, 2, 3, 4 (Gates 1–4 PASS, ตรวจซ้ำเองผ่าน 118/118 + 33/33). Core loop `เลือกเอกสาร → กรอก → คำนวณ → preview → print → autosave` ทำงานครบ ไม่ต้อง login/backend. — VERIFIED
- เหลือ: Phase 4.1 (logo — brief พร้อม, scope เล็ก), Phase 5 (PromptPay QR — brief พร้อม, scope เล็ก), Phase 6 (integration/hardening + release runbook + final gate). — VERIFIED
- ประเมิน effort: 4.1 + 5 เป็นงานขนาดเล็ก (มี brief + infrastructure + test harness พร้อม); 6 เป็นงาน integration/regression. **ระยะทางสั้น — ระดับ 1–2 สัปดาห์งานโฟกัส** (INFERENCE — ไม่มี estimate ทางการใน repo). — INFERENCE

**ระยะถึง "paid sell-ready" (ตาม BRIEF-sell-ready-execution.md): ไกลมาก.**
- Sell-ready ตาม brief ต้องการ: real-user PV evidence + Auth + cloud sync + tenant isolation + conflict/recovery + billing + entitlement + production ops + independent review. ทั้งหมดนี้คือ Phase 7–8 ซึ่ง **ยังไม่เริ่มเลย** และเป็นงานขนาดใหญ่ (backend ใหม่ทั้งก้อน). — VERIFIED (brief ระบุชัด) + INFERENCE (ขนาดงาน)
- **จุดตัดของ council:** ถ้า destination = local-first free V1 → ใกล้เสร็จ. ถ้า destination = paid cloud → ยังห่างหลาย phase และต้องมี PV evidence ก่อน. — INFERENCE

---

## 4. Local-First Browser Architecture (no login, no backend, window.print) — Sound หรือไม่?

**Verdict: SOUND สำหรับ destination ที่ PRD กำหนด (free, no-login, browser-first).** — INFERENCE จากหลักฐาน

เหตุผล (VERIFIED/INFERENCE):
- PRD §1/§11, Architecture §1, ROADMAP Phase 1–6 ล็อก no-login/no-backend ไว้ชัด และ implementation ก็ทำตามจริง (scope scan ไม่พบ Supabase/fetch/API route). — VERIFIED
- `window.print()` + print CSS เป็นทางเลือกที่ถูกต้องสำหรับ V1: ไม่มี PDF engine dependency, ใช้ความสามารถ browser/OS (Save as PDF) ที่ผู้ใช้คุ้นเคย, และ PRD §8 ตั้ง expectation ไว้ถูกต้องว่า "predictable ไม่ใช่ identical ทุก browser". — INFERENCE
- LocalStorage + schema migration + quota guard + fail-safe (in-memory state ไม่หาย) เป็น design ที่สมเหตุสมผลสำหรับ convenience storage. — INFERENCE
- **ข้อจำกัดที่ต้องยอมรับ (ไม่ใช่จุดพัง):**
  1. **Print fidelity ต่าง browser/device** — reference env คือ Chrome/Edge desktop เท่านั้น (PRD §8). แต่ PRD ระบุเป้าหมายผู้ใช้ "จากมือถือหรือคอม" — **mobile print dialog ยังไม่เคยถูก verify** (evidence ทั้งหมดเป็น desktop Chrome). นี่คือช่องว่างระหว่าง target user กับ test surface. — INFERENCE
  2. **Data อยู่ที่ browser เดียว** — localStorage ไม่ sync ข้าม device; ล้าง browser data = เอกสารหาย. — VERIFIED (โดยธรรมชาติของสถาปัตยกรรม)
  3. **ไม่มี customer-facing backup** — JSON export ถูกซ่อน (D-2026-09-03). — VERIFIED

---

## 5. ความเสี่ยงทางเทคนิค/ส่งมอบที่ใหญ่ที่สุด

**อันดับ 1 — Data durability/portability ของเอกสารธุรกิจ (INFERENCE + RECOMMENDATION):**
- เอกสารธุรกิจ (quotation/invoice/tax invoice) เป็นข้อมูลที่ผู้ใช้ต้องเก็บ. สถาปัตยกรรมปัจจุบัน = localStorage อย่างเดียว + JSON export ถูกซ่อนจาก UI. ผู้ใช้ที่ล้าง browser data, เปลี่ยนเครื่อง, หรือใช้ incognito จะสูญงานโดยไม่มี path กู้ที่เห็นได้. — INFERENCE
- นี่คือความเสี่ยงด้าน trust ต่อผลิตภัณฑ์ที่ขายให้ธุรกิจเล็ก — ใหญ่กว่า bug ใดๆ. — INFERENCE
- RECOMMENDATION: ก่อน/พร้อม V1 launch ต้องตัดสินใจชัดเจน — (a) surface backup path บางรูปแบบ (แม้ไม่ใช่ JSON UI เดิม — เช่น export เอกสารฉบับเดียว, หรือ warning เรื่อง data อยู่ที่เครื่อง), หรือ (b) ยอมรับความเสี่ยงอย่างชัดแจ้งใน terms/onboarding. สถานะ "hidden capability" ปัจจุบันคือ worst of both worlds: ผู้ใช้ไม่มี backup แต่ก็ไม่มี warning. — RECOMMENDATION

**อันดับ 2 — Mobile print ไม่เคยถูก verify (INFERENCE):**
- PRD ตั้งเป้าใช้งานจากมือถือ แต่ Gate 3 evidence ทั้งหมดเป็น desktop Chrome/Edge. Mobile print dialog (iOS Safari / Android Chrome) มีพฤติกรรมต่างกันมาก (margins, headers/footers, page size). ถ้า destination เน้น mobile-first ต้องมี mobile print acceptance ก่อนอ้างว่า V1 ใช้ได้จากมือถือ. — INFERENCE
- RECOMMENDATION: เพิ่ม mobile print manual acceptance ใน Phase 6 ก่อน release. — RECOMMENDATION

**อันดับ 3 — ถ้า destination = cloud: Phase 7–8 เป็นงานใหม่ทั้งก้อน (VERIFIED + INFERENCE):**
- Auth + Supabase/RLS + sync + conflict/recovery + billing + entitlement ยังไม่เริ่ม และ roadmap บังคับ PV evidence ก่อน. ต้นทุน delivery ของเส้นทางนี้สูงและยังไม่มีหลักฐานว่าคุ้ม (ยังไม่มี real-user pain evidence). — VERIFIED (ยังไม่เริ่ม) + INFERENCE (ต้นทุน)

**อันดับ 4 — กระบวนการ gate เองเป็น bottleneck (INFERENCE):**
- ประวัติ repo แสดงว่า gate ผ่านช้าเพราะต้องมี independent human review (Gate 3 ใช้เวลา 2026-08-23 → 2026-09-01). งาน code เหลือน้อย แต่ทุก phase ต้องรอ review. — INFERENCE

---

## 6. Module Hub Capabilities Fit (VERIFIED จาก INDEX.md/REGISTRY.md — ไม่ได้แก้ไขอะไร)

Module Hub มี 24 modules (ส่วนใหญ่ ✅ Completed) แต่ **เป็น backend-oriented ทั้งก้อน** (Node/Express-style, Redis, Supabase): auth, auth-supabase, tenant-context, payment, subscription, webhook-receiver, rate-limit, audit-log, job-retry, scheduler, file-storage, import-export (XLSXAdapter), product-catalog, feature-flags, notification, health-check, AI provider/workflow, enterprise-features, ticket-tracker, event-bus, http-client, config-runtime, line-oa-ai-module. — VERIFIED

**สำหรับ V1 (local-first): ไม่มี module ใดที่ควรแตะ.**
- V1 ใช้ runtime deps 3 ตัวและผ่าน gate ครบแล้ว; การดึง module ใดเข้ามาจะ (a) ละเมิด no-backend boundary ของ PRD/Architecture, (b) เพิ่ม dependency cost โดยไม่เพิ่ม value ให้ core loop. — INFERENCE
- **ไม่มี module ด้าน document/template/PDF/print/PromptPay QR ใน hub** — ตรวจแล้วไม่มี. Phase 5 PromptPay ต้อง build เอง (scope เล็ก, brief พร้อม). — VERIFIED

**สำหรับ Phase 7+ (cloud) — ลด delivery cost ได้จริง:**
- Phase 7: `auth-supabase`/`auth` (P1 ✅), `tenant-context` (P1 ✅ — RLS/tenant isolation), `file-storage` (P0 ✅ — cloud image/logo storage), `audit-log` (P0 ✅ — document history), `product-catalog` (P1 ✅ — reusable catalog; หมายเหตุ: เป็น product catalog ไม่ใช่ customer catalog — fit บางส่วน), `feature-flags` (P1 ✅ — gate Pro features). — VERIFIED (มีใน registry) + INFERENCE (fit)
- Phase 8: `payment` (P1 ✅), `subscription` (P1 ✅), `webhook-receiver` (P0 ✅), `rate-limit` (P1 ✅), `job-retry` (P2 ✅ — reconciliation), `health-check` (P2 ✅). — VERIFIED + INFERENCE
- Phase 9: `import-export` (P2 ✅ — XLSXAdapter สำหรับ monthly Excel reports). — VERIFIED + INFERENCE
- **Caveat:** กฎ Module Hub คือ copy-don't-import และ modules เป็น backend-style — ต้องประเมิน integration cost กับ Next.js App Router จริงก่อนอ้างว่าลด cost. ยังไม่มีหลักฐานว่า module ใดถูกใช้ในโปรเจกต์ Next.js จริง. — INFERENCE

**สรุป fit:** Module Hub ไม่ช่วย V1 เลย (ไม่จำเป็นต้องช่วย — V1 เสร็จแล้ว), แต่เป็น asset จริงสำหรับ Phase 7–8 ถ้า council เลือกเส้นทาง cloud. — INFERENCE

---

## 7. Hosted Cloud ใน V1 หรือหลัง local-first loop?

**Verdict: หลัง — cloud ไม่ควรอยู่ใน V1. หลักฐานชัดเจน:**
- PRD §11 non-goals: login, Supabase sync, subscription billing — ล็อกไว้ชัด. — VERIFIED
- ROADMAP: Phase 7 precondition = PV Gate PASS (real-user evidence); Phase 8 ต่อจาก Phase 7. — VERIFIED
- BRIEF-sell-ready-execution.md เองย้ำ: "Phase 7 ห้ามเปิดก่อน PV Gate มี real-user evidence" และ "SELL READY ไม่เท่ากับ build ผ่าน". — VERIFIED
- Technical เหตุผล: (1) V1 core loop เสร็จและผ่าน gate ด้วย zero backend — การเพิ่ม cloud เข้า V1 = เพิ่มงานมหาศาล (auth+RLS+sync+conflict+billing) โดยไม่มี evidence ว่า user จะใช้/จ่าย; (2) local-first loop ที่ deploy ได้คือเครื่องมือ validation ที่ถูกที่สุด — ปล่อยให้ user พิสูจน์ repeat usage ก่อนลงทุน cloud; (3) Module Hub จะลด cost ของ cloud phase ได้จริงเมื่อถึงเวลา. — INFERENCE
- RECOMMENDATION: ลำดับที่ถูกต้องคือ — ปิด 4.1 + 5 + 6 → deploy free V1 → PV เก็บ real-user evidence → ตัดสินใจ cloud ด้วย evidence. การใส่ cloud ใน V1 จะ delay delivery และขัดกับ gate contract ที่ approve ไว้แล้ว. — RECOMMENDATION

---

## 8. สรุป Verdict (Technical/Delivery)

1. **Implementation reality:** V1 core loop สร้างเสร็จจริง, ผ่าน Gate 1–4, ตรวจซ้ำเองผ่าน (118/118 unit, 33/33 E2E, typecheck/lint/build clean), zero runtime dependency เพิ่ม, static export ได้. — VERIFIED
2. **Distance to V1:** free deployable V1 = สั้น (เหลือ 4.1 + 5 + 6, briefs พร้อม). paid sell-ready = ไกล (ต้อง PV + Phase 7–8 ทั้งก้อน). — VERIFIED + INFERENCE
3. **Architecture:** local-first browser + window.print = sound สำหรับ destination ที่ PRD ล็อกไว้; จุดอ่อนคือ data durability (localStorage เดี่ยว + backup ซ่อน) และ mobile print ที่ยังไม่ verify. — INFERENCE
4. **Largest risk:** data loss/portability ของเอกสารธุรกิจ (ไม่มี customer-facing backup path) — ตามด้วย mobile print gap และต้นทุน cloud phase ถ้าเลือกเส้นทางนั้น. — INFERENCE
5. **Module Hub:** ไม่ fit V1 (V1 ไม่ควรมี dependency เพิ่ม); fit จริงสำหรับ Phase 7–8 (auth, tenant, payment, subscription, webhook, audit, file-storage, import-export). — VERIFIED + INFERENCE
6. **Cloud:** หลัง sellable local-first loop + PV evidence — ไม่ใช่ V1. — RECOMMENDATION

## 9. Dissent / Uncertainty

- **UNVERIFIED:** ตัวเลข effort estimate (1–2 สัปดาห์) เป็น INFERENCE ของผม — repo ไม่มี estimate ทางการ.
- **UNVERIFIED:** ภาพ native print screenshots อยู่ใน evidence trail แต่ผมไม่ได้เปิดดูภาพเอง — อ้างอิงจาก independent review ที่ตรวจแล้ว.
- **UNVERIFIED:** Module Hub integration cost กับ Next.js ยังไม่เคยถูกพิสูจน์ — "ลด delivery cost" ของ Phase 7–8 เป็น INFERENCE จาก registry ไม่ใช่จากประสบการณ์ใช้งานจริง.
- **Dissent note:** สถานะ "JSON backup hidden" (D-2026-09-03) เป็น owner decision ที่ผมเคารพ แต่จากมุม technical/delivery ผมเห็นว่านี่คือความเสี่ยงด้าน data durability ที่ใหญ่ที่สุดของ V1 และควรมี mitigation (อย่างน้อย warning หรือ export path ง่ายๆ) ก่อน launch — ไม่ใช่แค่ปล่อย hidden ไว้.
- **Minor finding:** `CURRENT_STATUS.md` ระบุ HEAD `ceeb2a1` แต่ HEAD จริงคือ `b942a22` (ล้าสมัย 3 docs commits) — ควรอัปเดตในรอบถัดไป.
