# CM01 — Technical/Delivery Lens (Round 1) — Raw Analysis

**Lens:** Technical/Delivery — implementation reality, dependency cost, reusable capability fit, risk, distance to V1
**Date:** 2026-09-03
**Evidence basis:** อ่านไฟล์จริงใน repo `products/booking-ticket-module` (PRD.md, README.md, implementation_plan.md, docs/CURRENT_STATUS.md, docs/THEME_INTEGRATION.md, .github/workflows/ci.yml, package.json, src/ ทั้งหมด 51 ไฟล์, e2e/ 5 ไฟล์), `docs/platform/TICKET_SYSTEMS_DISAMBIGUATION.md`, `docs/products/registry.yaml`, `REVENUE-STRATEGY.md`, modules-hub `ticket-tracker`/`auth`/`audit-log`/`notification`; รัน `npm test` (63/63), `npm run typecheck`, `npm run build`, `npx playwright test` (28/28) เองบนเครื่องนี้; ตรวจ GitHub Actions ผ่าน `gh run list/view`; ตรวจ git state (HEAD 6202108, main, clean tree, origin/main = 6202108)
**Label:** VERIFIED = เห็นหลักฐานโดยตรง / INFERENCE = สรุปจากหลักฐาน / UNVERIFIED = ไม่มีหลักฐาน / RECOMMENDATION = ข้อเสนอ

---

## 0. สถานะ git และ CI — cross-check กับ CURRENT_STATUS.md

- VERIFIED: HEAD = `6202108` (`docs: record post-fix CI reality for CM01`), branch `main`, working tree clean, `origin/main` = `6202108` (git rev-parse + git status + git log)
- VERIFIED: ประวัติ commit: `fdf6608` (initial) → `be37b0a` (theme system) → `ff15819` (CI baseline) → `aeaa750` (fix timezone pin) → `6202108` (docs)
- VERIFIED: GitHub Actions run จริง (gh CLI): `33670789635` (push main @ aeaa750) = success; `33670273164` (PR #1) = success; `33671032357` (push main @ 6202108) = success; `33128547044` (ff15819) = failure (RED เดิม)
- VERIFIED: CI run `33670789635` มี 9 steps: checkout, setup-node, Install (frozen lockfile), Typecheck, Test, Build, Dependency audit (advisory), Upload artifact — ทุก blocking stage success
- VERIFIED: CURRENT_STATUS.md ระบุ HEAD `aeaa750` แต่ HEAD จริงคือ `6202108` (commit docs ต่อจาก aeaa750) — สาระสำคัญ (CI green, 63 tests) ตรงกัน แต่ค่า HEAD ในไฟล์ล้าสมัยเล็กน้อย ไม่ใช่การโกหก
- VERIFIED: ci.yml header comment "This repository has never run a GitHub Actions workflow before this file; it has not yet executed in Actions" — **stale** (repo รัน Actions ไปแล้ว 4 runs) — เอกสารใน repo ล้าสมัย ไม่กระทบ substance
- VERIFIED: รันเองบนเครื่องนี้: `npm test` = 13 files / 63 tests passed; `npm run typecheck` = ผ่าน; `npm run build` = ผ่าน (dist 199.24 kB JS / 61.86 kB gzip); `npx playwright test` = 28 passed (Chromium, 12.0s) — หลัง `npx playwright install chromium` (browser ยังไม่เคยถูกติดตั้งบนเครื่องนี้)

## 1. สิ่งที่สร้างแล้วจริง (built)

- VERIFIED: React SPA 3 หน้า — Intake (`#/new`), Ticket Detail (`#/tickets/:id`), History/Retention (`#/history`) — routing ด้วย URL hash, ไม่มี router dependency (implementation_plan.md §2, src/App.tsx, src/navigation/routes.ts)
- VERIFIED: domain layer แยกชัด: `types.ts` (Ticket, Status 8 ค่า, Priority, TimelineEntry, RecheckPayload), `phone.ts` (normalize/validate), `deadline.ts` (overdue), `transitions.ts` (state machine)
- VERIFIED: repository abstraction: `TicketRepository` interface 10 methods (getAll/getById/save/create/search/findByNormalizedPhone/previewRetention/deleteClosedBefore/reset) + `createLocalStorageRepository()` เป็น adapter เดียว (src/data/repository.ts)
- VERIFIED: localStorage persistence `booking_tickets_v1` พร้อม schema migration ของ ticket เดิม, corrupted-data fallback กลับ seed, persistence error result (src/data/storage.ts)
- VERIFIED: seed 3 เคสตรง PRD §6: TKT-0001 (ServiceIssue, InReview, มี booking, เบอร์ 0812345678), TKT-0002 (ProductClaim, New, ไม่มี booking, เบอร์เดียวกับ 0001 — สำหรับ phone-history), TKT-0003 (Closed 2023-01-10 — สำหรับ retention) (src/data/seed.ts)
- VERIFIED: services: caseIntakeService (validate → สร้าง ID TKT-XXXX → timeline Created → persist → เปิด detail), caseHistoryService, retentionService, ticketService
- VERIFIED: i18n ไทย/อังกฤษ persist แยก key (`booking_ticket_locale`), ไทยเป็น default
- VERIFIED: theme system 4 presets (light/dark/super-admin/system) ผ่าน semantic CSS tokens, host config props `defaultTheme`/`allowThemeSwitch` + `window.__BOOKING_TICKET_THEME_CONFIG__`, locked branding mode (docs/THEME_INTEGRATION.md, src/theme/)
- VERIFIED: retention: default cutoff 12 เดือน, preview → confirmation → พิมพ์ `DELETE` → ลบเฉพาะ Closed ที่เกิน cutoff, active ticket ลบไม่ได้ (README.md, src/services/retentionService.ts, e2e/retention.spec.ts)
- VERIFIED: RecheckPayload สร้าง local-only ไม่มีการส่งออก (README.md ระบุชัด)
- VERIFIED: 63 unit/integration tests (13 files) + 28 E2E tests (5 specs: intake 2, history 2, retention 2, theme 4, ticket 18) — ผ่านจริงบนเครื่องนี้
- VERIFIED: MIT license, Copyright 2026 Gutumrod (LICENSE)
- VERIFIED: 79 ไฟล์ใน git, `relay/` (agent handoff docs) ถูก gitignore — ไม่ใช่ส่วนของ deliverable

## 2. สิ่งที่ขาด (missing) — แยก "by design" กับ "debt"

**By design (ไม่ใช่ gap):**
- VERIFIED: auth/roles — PRD §2/§8 "MVP ไม่มี authentication" + disambiguation: "No auth by design, not a 'not built yet' gap"
- VERIFIED: backend/database/API — PRD §8 out of scope; README ระบุ non-claims ชัดเจน
- VERIFIED: notification (LINE/Telegram) — PRD §8/§9 future roadmap
- VERIFIED: binary upload — PRD §8, attachment เก็บ metadata เท่านั้น
- VERIFIED: deploy/hosting — source product, ไม่มี .env.example (implementation_plan §10)

**Debt จริง (P0b ตาม CURRENT_STATUS.md):**
- VERIFIED: lint ยัง disabled — `.eslintrc.cjs` มีอยู่แต่ไม่มี `eslint` dependency และไม่มี `lint` script ใน package.json; CI stage 3 ถูก comment ออก
- VERIFIED: `npm audit` = 1 moderate (esbuild ผ่าน vite) / 3 high (playwright) / 2 critical (vitest) — ทั้งหมดใน devDependencies; `npm audit --omit=dev` = 0 vulnerabilities (production deps react/react-dom สะอาด)
- VERIFIED: CI ไม่มี E2E stage — 28 E2E tests ผ่านแค่ local เท่านั้น, CI รันแค่ install/typecheck/test/build
- VERIFIED: ไม่มี engines/packageManager pin ใน package.json (CI ใช้ node 22 ตาม ci.yml แต่ buyer ไม่ถูกบังคับ)
- VERIFIED: CI stages 7-9 (license audit, secret scan, SAST) ยัง disabled — รอ CEO decision เรื่อง tool/allowlist (ci.yml comment)
- VERIFIED: registry.yaml acceptance: architecture=true, operations=false, commercial=false, support=false

**Gap เชิงพาณิชย์หลัก:**
- VERIFIED: ไม่มี backend adapter — localStorage เป็น adapter เดียว (disambiguation: "Missing backend adapter is its one real gap")
- VERIFIED: ไม่มี packaging เชิงพาณิชย์ (checkout/distribution/buyer docs) — REVENUE-STRATEGY.md ระบุเป็น "Exact Gap to Close" ของ booking_ticket_module

## 3. สิ่งที่อาจไม่จำเป็น (may be unnecessary)

- INFERENCE: theme system โดยเฉพาะ preset `super-admin` — ถูกสร้างใน commit `be37b0a` หลังจากการตัดสินใจ 2026-08-21 ที่ retract การ bundle CM01 เข้า booking; "super-admin" ฟังดูออกแบบเพื่อ host รายหนึ่งที่ถูกยกเลิกไปแล้ว แต่มันก็เป็นจุดขายจริงสำหรับกลุ่ม dev/agency (embed + skin ตามแบรนด์) — เก็บไว้ได้ แต่ต้องยอมรับว่าเป็น speculative investment
- INFERENCE: RecheckPayload — local-only, ไม่เคยถูกส่งออกไปไหน; เป็นมรดกจาก ticket detail เดิม ใช้เป็นตัวอย่าง payload contract ได้ แต่ไม่มี consumer จริงใน repo
- VERIFIED: `relay/` directory (agent handoff จำนวนมาก) ถูก gitignore — ไม่ปน deliverable อยู่แล้ว ไม่ต้องจัดการ
- RECOMMENDATION: อย่าตัดอะไรออกก่อนขาย — ทุกอย่างที่ build มี test คุม; การตัด = เสี่ยง regression มากกว่าประโยชน์

## 4. Distance to sellable V1

- VERIFIED: ตัวโค้ด template ครบ workflow ตาม PRD success criteria ครบ (สร้าง/ค้น/ดู/ดำเนินการ/ปิด/เปิดใหม่, ค้นด้วยเบอร์/ชื่อ/ID, phone-history ไม่ autofill, overdue badge+filter, ไทย/อังกฤษ, persist+reset, UI ไม่ผูก localStorage)
- VERIFIED: เกตคุณภาพหลักผ่าน: CI green (typecheck/test/build), 63 unit + 28 E2E ผ่าน local
- INFERENCE: ระยะห่างจาก "ขายเป็น UI template ได้" (Option A $39/$129) = **งาน packaging + hardening ไม่ใช่งาน feature** — ประมาณ: (1) enable lint + เพิ่ม E2E ใน CI + pin engines, (2) disposition npm audit findings ผ่าน G1 ledger หรือ upgrade dev deps, (3) license audit + secret scan (รอ CEO เลือก tool), (4) checkout/distribution/buyer docs, (5) flip registry commercial acceptance → รวมแล้วเป็นงานวัน-ไม่กี่วัน ไม่ใช่สัปดาห์
- INFERENCE: ระยะห่างจาก "ขาย tier สูง / hosted widget" (Option B ฿350/mo) = **ต้องมี backend adapter** — งานนี้ใหญ่กว่า: adapter + schema + (ถ้าจะขายจริงจัง) auth/audit/notification ตาม segment

## 5. Frontend/local-first template พอเป็นสินค้าขายได้ไหม หรือ backend adapter จำเป็น?

- VERIFIED: REVENUE-STRATEGY.md เองเขียนว่า "Needs a real backend adapter (currently localStorage-only by design) before it is more than a demo template" — แต่เอกสารเดียวกันก็ตั้งราคา Option A ($39/$129) ไว้เป็น UI template license → **มีความตึงเครียดภายในเอกสารเอง** ระหว่าง "ขาย template ได้เลย" กับ "ยังเป็นแค่ demo template"
- VERIFIED: disambiguation ระบุ audience = "frontend devs / agencies who want to license a case-management UI to embed in their own client work" — กลุ่มนี้ซื้อ UI เป็นจุดตั้งต้น ไม่ใช่ระบบจบในตัว
- VERIFIED: README.md มี non-claims ครบถ้วนและตรงไปตรงมา (localStorage เท่านั้น, ไม่มี deploy/auth/sync, E2E เฉพาะ Chromium) — ขายแบบนี้ได้โดยไม่หลอกลวง ถ้าคำโฆษณาตรงกับ non-claims
- INFERENCE (ของผม): **template ขายได้ใน tier $39 โดยไม่ต้องมี backend adapter** ถ้าขายในฐานะ "local-first boilerplate + UI" อย่างตรงไปตรงมา — แต่ **tier $129 agency จะไม่น่าเชื่อถือถ้าไม่มี backend adapter** เพราะ agency ต้องส่งงานจริงให้ลูกค้า และ localStorage ต่อ browser ตัวเดียวใช้ในงานจริงไม่ได้; **Option B (hosted widget) ต้องมี backend adapter 100%**
- RECOMMENDATION: ลำดับที่สมเหตุสมผล = ขาย template ก่อน (ต้นทุนต่ำ, ของมีอยู่แล้ว) → ใช้รายได้/feedback วัดว่าควรลงทุน adapter หรือไม่ → adapter ตัวแรกควรเป็น Supabase (ตาม PRD roadmap) หรือ wire เข้า modules-hub ticket-tracker (ตาม disambiguation proposal) — อย่าทำทั้งคู่พร้อมกัน

## 6. Technical/delivery risk

| ความเสี่ยง | ระดับ | หลักฐาน | การจัดการ |
|---|---|---|---|
| CI lint disabled | ต่ำ-กลาง | VERIFIED: ไม่มี eslint dep/script, stage ถูก comment | typecheck+test+build ยัง blocking; lint เป็นคุณภาพ gate ที่หายไป — P0b CM-D ตามแผน |
| npm audit 6 findings (2 critical ใน vitest) | กลาง | VERIFIED: ทั้งหมด devDependencies; `--omit=dev` = 0 | vitest critical เป็น RCE เมื่อ API server เปิด — กระทบ dev machine ไม่ใช่ bundle ที่ขาย; **แต่** source product = buyer รัน `npm install` แล้วได้ dev deps พร้อม findings ไปด้วย → ต้อง disposition ผ่าน G1 ledger หรือ upgrade (vitest 2.1.9+, playwright 1.55.1+, vite 5.4.21+ — อยู่นอก range ที่ประกาศไว้ ต้องทดสอบ) |
| ไม่มี backend adapter | สูง (เชิงพาณิชย์) / ต่ำ (เชิงเทคนิค) | VERIFIED | ตัว repo ทำงานครบตาม scope; risk อยู่ที่ ceiling ของมูลค่าสินค้า ไม่ใช่ความพังของโค้ด |
| E2E ไม่เข้า CI | กลาง | VERIFIED: 28 tests ผ่าน local เท่านั้น | browser layer ไม่มี regression guard อัตโนมัติ — เพิ่ม stage ง่าย (playwright อยู่ใน devDeps แล้ว) |
| ไม่มี engines pin | ต่ำ | VERIFIED | buyer อาจรัน node เก่า/ใหม่เกินที่ทดสอบ — เพิ่ม `engines: node >=20` |
| License audit / secret scan / SAST disabled | กลาง (เฉพาะตอนขาย) | VERIFIED: ci.yml stages 7-9 | สำหรับ source product ที่ขายให้ buyer: license audit ไม่ใช่ optional ตลอดไป (ci.yml comment เองยอมรับ); secret scan กัน WSTERA secret หลุดไปใน artifact — รอ CEO เลือก tool |
| localStorage ข้อมูลหาย/แยก browser | กลาง (งานจริง) / ต่ำ (template) | VERIFIED: README ระบุ non-claims ครบ | ขายเป็น template = ยอมรับได้; ขายเป็นระบบจริง = ต้อง adapter |
| ไม่มี concurrency guard (2 tabs เขียนทับกัน) | ต่ำ | INFERENCE จาก localStorage adapter design (ไม่มี lock) | ไม่มี test ครอบ — ยอมรับได้ใน template scope |
| เอกสารใน repo ล้าสมัยบางจุด | ต่ำ | VERIFIED: ci.yml header "never run in Actions" (stale), CURRENT_STATUS HEAD aeaa750 (จริง 6202108) | ไม่กระทบโค้ด; ควรแก้ก่อนส่งมอบ buyer |

## 7. เปรียบเทียบกับ modules-hub capabilities — ชื่อคล้าย ≠ reuse fit

- VERIFIED: **ticket-tracker (v0.2.0)** — backend-only, `TicketStore` interface เป็น **async (Promise)** + schema-driven (`TicketSchema`, `field_values`), มีแค่ list/get/create/updateStatus, default store = JSON file, ไม่มี auth/tenancy โดย design, 12 tests (6 core + 6 routes)
- VERIFIED: **CM01 `TicketRepository`** — **sync**, domain รวย (customer, bookingRef, timeline, attachments, normalizedPhone, retention, search/filter) — **interface ต่างกันทั้ง async/sync และ data shape** → ไม่ใช่ drop-in; การ "wire เข้า ticket-tracker" ต้องมี adapter layer ที่ map domain รวยของ CM01 ลง `field_values` + ต้อง extend store (timeline/attachments/retention/phone search ไม่มีใน ticket-tracker) → **เป็นงานจริง ไม่ใช่ zero-cost**; disambiguation เองก็ระบุว่าเป็น "proposal, not a plan in motion"
- VERIFIED: **auth (v0.1.0)** — backend-side (jwt/credential-store/supabase adapters, 9 test files); CM01 ไม่มี auth by design และไม่มี login flow ใน UI → ถ้า buyer ต้องการ auth ต้องเขียน UI flow ใหม่ + wire กับ auth module — ไม่ใช่ reuse fit วันนี้
- VERIFIED: **audit-log (v0.1.0)** — backend (memory/postgres adapters); CM01 มีแค่ timeline (event log ใน UI, actor เป็น string ธรรมดา) — ไม่ใช่ audit trail แบบ tamper-evident; ไม่มีการ integrate กัน
- VERIFIED: **notification (v0.2.0)** — providers email/line/telegram stub + webhook; CM01 ไม่มี notification และ PRD วางไว้ใน future roadmap → ไม่มีการเชื่อม
- VERIFIED: **persistence** — CM01 มี localStorage adapter ตัวเดียว; modules-hub มี `file-storage` module (ไม่ได้อ่านรายละเอียด — UNVERIFIED ว่า fit แค่ไหน)
- INFERENCE: สรุป reuse fit — ticket-tracker เป็นคู่หู backend ที่ "เป็นไปได้" ที่สุด แต่ต้องลงทุน adapter + store extension; auth/audit/notification เป็นงานใหม่ทั้งหมดถ้า segment ต้องการ; **ชื่อ "ticket" ที่เหมือนกันไม่ใช่หลักฐาน reuse ได้** — interface, data model, sync/async ต่างกันหมด

## 8. การแยกจาก BK01 — ต้องรักษาไว้

- VERIFIED: registry.yaml: CM01 = `one_time_source_product`, own family, "explicitly NOT grouped with booking/BK01 despite the name" — owner decision 2026-08-26 หลัง code-level verification
- VERIFIED: disambiguation: CM01 กับ booking's native ticket system (BK01) target กลุ่มลูกค้าคนละกลุ่ม, ไม่มี live code path ร่วม (มีแค่ historical ancestor — booking's `ticket-domain.ts` ถูก port จาก CM01 แล้ว diverged)
- VERIFIED: การ bundle CM01 เข้า booking ถูกเสนอแล้ว **retract ในวันเดียวกัน** (2026-08-21) เพราะ BK01 มีระบบที่เหนือกว่า (real backend/auth/tenancy)
- RECOMMENDATION: ห้ามเสนอให้ CM01 กลายเป็น feature ของ BK01 อีก — ทิศทางที่ถูกคือ CM01 ขายเป็น template อิสระ และถ้าจะมี backend ก็ wire กับ modules-hub (ticket-tracker) หรือ Supabase ตาม PRD roadmap

## 9. เงื่อนไขที่แน่นอนที่ CM01 จะขายได้ (exact condition)

**VERIFIED เงื่อนไขบังคับจากหลักฐาน:**
1. registry acceptance `commercial` ต้อง flip จาก false → true (ตอนนี้ architecture=true, commercial=false)
2. CI hardening: lint enabled (P0b CM-D), E2E เข้า CI, engines pin — ตาม CI_BASELINE
3. npm audit findings dispositioned (G1 exception-ledger หรือ upgrade dev deps) — เพราะ buyer จะได้ dev deps ไปด้วย
4. License audit + secret scan ผ่าน — ต้องรอ CEO decision เรื่อง tool/allowlist (ci.yml stages 7-8)
5. Commercial packaging: checkout, distribution (repo access/zip), buyer-facing docs

**INFERENCE เงื่อนไขแยกตาม tier:**
- **ขายเป็น UI template ($39 single-use):** เงื่อนไข 1-5 ข้างบน **โดยไม่ต้องมี backend adapter** — ขายในฐานะ local-first boilerplate พร้อม non-claims ที่ README เขียนไว้แล้ว; ต้องยอมรับว่า REVENUE-STRATEGY.md มีข้อความ "needs a real backend adapter before it is more than a demo template" ที่ขัดกับ tier นี้ → ต้องตัดสินใจ/ปรับ wording ให้ตรงกันก่อนขาย
- **ขาย tier agency ($129) อย่างน่าเชื่อถือ:** ต้องมี backend adapter อย่างน้อย 1 ตัว (Supabase ตาม PRD roadmap หรือ ticket-tracker ตาม disambiguation proposal) + buyer setup docs
- **ขาย hosted widget (฿350/mo, Option B):** ต้องมี backend adapter + hosting + auth (อย่างน้อย admin login) + ต้องผ่านเกต Project B/CI_BASELINE เต็มรูปแบบ — นี่คือผลิตภัณฑ์คนละตัวกับ template

**RECOMMENDATION (verdict โดยรวม):**
- CM01 เป็นสินค้าที่ "โค้ดเสร็จ, packaging ยังไม่เริ่ม" — ระยะห่างจาก V1 (template tier) สั้นที่สุดในแง่เทคนิค: งาน hardening + packaging ไม่กี่วัน
- อย่าให้ "ไม่มี backend adapter" เป็นตัวบล็อกการขาย template tier — แต่ต้องขายอย่างตรงไปตรงมาในฐานะ local-first UI boilerplate
- ลงทุน backend adapter ต่อเมื่อมีสัญญาณ demand จริง (ยอดขาย template หรือ buyer ถามหา) — อย่าทำล่วงหน้า
- รักษาการแยกจาก BK01 ไว้; อย่าเสนอ merge/bundle

## 10. Dissent / uncertainty

- INFERENCE: การประเมินว่า "template ขายได้โดยไม่ต้องมี adapter" ขัดกับข้อความใน REVENUE-STRATEGY.md เอง ("more than a demo template") — นี่คือจุดที่ผมเห็นต่างจากเอกสาร; เอกสารตั้งราคา template ไว้แล้ว (Option A) แต่ gap statement บอกว่ายังเป็น demo → ต้อง reconcile ก่อนขาย ไม่ใช่เรื่องเทคนิคแต่เป็นเรื่อง positioning
- UNVERIFIED: คุณภาพ/ความ fit ของ modules-hub `file-storage` module กับ CM01 — ไม่ได้อ่าน; ไม่กระทบ verdict
- UNVERIFIED: ว่า buyer segment (dev/agency) จะจ่าย $39/$129 จริงหรือไม่ — ไม่มีหลักฐาน demand; เป็นสมมติฐานเชิงพาณิชย์ของ REVENUE-STRATEGY
- INFERENCE: theme system (super-admin preset) อาจ over-built สำหรับ host ที่ถูก retract — แต่มีค่าเป็นจุดขาย; ไม่แนะนำให้ตัด
- VERIFIED caveat: E2E 28 tests ผ่านบนเครื่องนี้ (Windows, Chromium) — CI ไม่ได้รัน; cross-browser (Firefox/WebKit) ไม่เคยถูกทดสอบ (README ระบุ "verified E2E target is Chromium")
