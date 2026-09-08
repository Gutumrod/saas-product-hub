# CM01 — Booking Claim & Case Management Module
## Lens: Product / Customer — Raw Analysis (Round 1, 2026-09-03)

**Evidence read (all VERIFIED by direct read):** PRD.md, README.md, implementation_plan.md, docs/CURRENT_STATUS.md, docs/THEME_INTEGRATION.md, docs/MAC_HANDOFF.md, .github/workflows/ci.yml, docs/platform/TICKET_SYSTEMS_DISAMBIGUATION.md, REVENUE-STRATEGY.md, docs/products/registry.yaml (CM01 entry), LICENSE, package.json, live git state + GitHub Actions run list.

**Git/CI cross-check (CURRENT_STATUS.md ไม่เชื่อตาบอด):**
- VERIFIED: HEAD = `6202108` (`docs: record post-fix CI reality for CM01`), branch `main` clean, `== origin/main` (terminal `git status --short --branch` + `git log`).
- VERIFIED: CI runs ล่าสุด 3 runs success ทั้งหมด — `33671032357` (6202108, push main), `33670789635` (aeaa750, push main), `33670273164` (PR #1, pull_request) — ตรงกับที่ CURRENT_STATUS.md อ้าง (run 33670789635) และมี run ใหม่กว่าหลังจากนั้นอีก 1 run success (CURRENT_STATUS.md เขียนก่อน HEAD 6202108 — เนื้อหายังสอดคล้อง ไม่ขัดแย้ง).
- VERIFIED: ci.yml — lint stage ยัง disabled (มี .eslintrc.cjs แต่ไม่มี eslint dependency/script); license audit, secret scan, SAST ยังไม่ enable (รอ tool/allowlist decision); npm audit advisory-only (1 moderate / 3 high / 2 critical ใน dev toolchain playwright/vitest).
- VERIFIED: LICENSE = MIT, Copyright (c) 2026 Gutumrod; package.json name `booking-ticket-module` v1.0.0.

---

## 1. ปัญหาที่แก้ และแก้ให้ใคร

**ผู้ใช้ปลายทาง (end user) — VERIFIED จาก PRD §1–2:**
- บทบาทเดียว: `เจ้าหน้าที่ดูแลเคส` (case officer) — รับเคสใหม่, ค้น/ดูประวัติ, ดำเนินการ, ปิด/เปิดเคสใหม่, ล้างเคสเก่าตาม retention — โดยไม่ต้อง login (no-auth by design, PRD §2, §8).
- ปัญหาที่ PRD ระบุ (VERIFIED): ระบบเดิมจัดการได้เฉพาะเคสที่มีอยู่แล้ว ไม่มีหน้ารับเคสใหม่; ไม่มีหน้าประวัติรวมสำหรับค้น/กรอง; เจ้าหน้าที่ไม่เห็นประวัติลูกค้าเดิมระหว่างรับเรื่อง; ไม่มีวันครบกำหนด/overdue; ต้องควบคุมอายุข้อมูลเพื่อรองรับ backend free tier ในอนาคต.
- ภาษา: Thai-first + English toggle (VERIFIED PRD §7, README).

**ผู้จ่ายเงิน (buyer) ≠ ผู้ใช้ปลายทาง — VERIFIED จาก TICKET_SYSTEMS_DISAMBIGUATION.md:**
- "Audience: **frontend devs / agencies** who want to license a case-management UI to embed in *their own* client work — not booking's own end customers."
- registry.yaml (VERIFIED): `delivery_model: one_time_source_product`, `deployment_model: source_product`, `commercial_status: prototype`, `acceptance: {architecture: true, operations: false, commercial: false, support: false}`.
- นี่คือโครงสร้าง 3 ชั้น: WSTERA ขาย template → dev/agency ซื้อไป embed → end-user (เจ้าหน้าที่ของลูกค้า agency) ใช้. **ผู้จ่ายเงินคือ dev/agency; ผู้ใช้คือเจ้าหน้าที่ของลูกค้าของ agency.** ข้อนี้เป็นหัวใจของทุกการตัดสินใจ packaging ต่อจากนี้.

**INFERENCE:** ปัญหาที่แก้จริงในมุม buyer คือ "ต้อง build case-management UI ให้ลูกค้าเองทุกโปรเจกต์" — CM01 ขายการประหยัดเวลา build + domain logic ที่ทดสอบแล้ว (phone normalization, overdue, retention, status transitions) ไม่ใช่ขาย "ระบบจัดการเคสสำเร็จรูป" ให้ธุรกิจ.

---

## 2. ใครจ่าย และจ่ายเท่าไหร่

- VERIFIED: REVENUE-STRATEGY.md §2 Option A (Recommended) — Single Use $39 one-time / Agency License $129 one-time (React template, theme switcher, i18n, 61 unit tests included). Option B — Drop-In Hosted Widget ฿350/month (post-adapter).
- VERIFIED: REVENUE-STRATEGY.md ระบุตัวเองว่า "Working draft, not an approved pricing document" — ตัวเลข $39/$129/฿350 เป็น **proposal** ไม่ใช่ decision ที่อนุมัติแล้ว.
- VERIFIED: registry.yaml — `commercial: false` ใน acceptance (ยังไม่ผ่านเกณฑ์ commercial readiness).
- UNVERIFIED: ไม่มีหลักฐานใดใน repo ว่าเคยมี sale, customer discovery กับ buyer จริง, หรือ market validation ของราคา. PRD กล่าวถึง "discovery interview" (implementation_plan §9: "ไม่มี blocking question หลัง discovery interview ปัจจุบัน") แต่ไม่พบหลักฐานว่า interview นั้นเป็น buyer จริงหรือ internal — **UNVERIFIED**.
- INFERENCE: $39 single-use อยู่ในช่วงราคาปกติของตลาด UI template (CodeCanyon/Gumroad ระดับ $15–60) แต่ $129 agency license จะ justify ได้ก็ต่อเมื่อมี backend adapter + buyer onboarding docs ที่ดีพอ — ไม่งั้น agency จะรู้สึกว่าจ่ายแพงเพื่อ localStorage demo.

---

## 3. Frontend/local-first template พอเป็นสินค้าขายได้ หรือ backend adapter จำเป็น?

**หลักฐานฝั่ง "จำเป็น":**
- VERIFIED: REVENUE-STRATEGY.md §1 เขียนเองว่า "**Needs a real backend adapter (currently localStorage-only by design) before it is more than a demo template.**"
- VERIFIED: README "Storage limitations and non-claims" — ข้อมูลอยู่ใน localStorage ของ browser เดียว; ล้าง site storage / เปลี่ยน browser/device = ข้อมูลแยกหรือหาย; ไม่มี deployment, auth, external DB/API, multi-user sync, cross-browser verification (E2E เฉพาะ Chromium).
- VERIFIED: PRD §8 Out of scope — external database/API, Supabase schema, multi-device sync, auth ล้วนอยู่นอกขอบเขต MVP.

**หลักฐานฝั่ง "template ขายได้จริง":**
- VERIFIED: ตลาด template license (source_product) เป็นรูปแบบที่ REVENUE-STRATEGY ใช้กับ multi_tenant_ai ($79/$199) และ CM01 ($39/$129) อยู่แล้ว — portfolio มี path นี้เป็น "Path 1: Instant Zero-Infra Revenue".
- VERIFIED: disambiguation เสนอทางเลือก "natural fit" — ต่อ CM01 เข้ากับ modules-hub `ticket-tracker` (#3, backend-only, no-auth philosophy เดียวกัน, production-ready) แทนสร้าง Supabase adapter ใหม่ — แต่ระบุชัดว่า "This has not been done; it's a proposal, not a plan in motion."

**Verdict (RECOMMENDATION):**
- Template-only **ขายได้** ในฐานะสินค้าราคาต่ำ ($39) — แต่ ceiling ราคาต่ำ, perception เป็น "demo" สูง (REVENUE-STRATEGY เขียนเอง), และ buyer ทุกคนต้องเขียน adapter เอง → friction ซ้ำทุกราย.
- Backend adapter **ไม่จำเป็นสำหรับ V1 ขาย template** แต่ **จำเป็นสำหรับ tier $129 agency และ Option B ฿350/mo** — และเป็นตัวเปลี่ยน willingness to pay จาก "ซื้อเพราะถูก" เป็น "ซื้อเพราะประหยัดเวลา".
- RECOMMENDATION: อย่าถือว่า "backend adapter mandatory" เป็น absolute gate สำหรับการขาย template tier — แต่ต้องถือเป็น gate สำหรับ agency tier. ลำดับที่แนะนำ: ขาย template-only ก่อน (zero-infra, เร็ว) → ต่อ ticket-tracker (#3) เป็น reference backend adapter (ถูกกว่าเขียน Supabase adapter ใหม่) → แล้วค่อยเปิด agency tier/ hosted widget.
- RECOMMENDATION: ถ้าจะเปิด hosted widget (฿350/mo) — นี่คือ product ใหม่เกือบทั้งตัว (hosting, uptime, auth, multi-tenant, support) ที่ขัดกับ no-auth-by-design และ local-first ของ CM01. อย่าทำใน V1.

---

## 4. Defensible value เหนือ generic admin/dashboard template

**VERIFIED differentiators (มีหลักฐานใน code/docs):**
1. **Domain logic ที่ทดสอบแล้ว** — phone normalization (081-234-5678 = 0812345678), overdue computation (due_at < now, status ≠ Closed, ไม่เปลี่ยนสถานะอัตโนมัติ), retention policy (12 เดือน, ลบเฉพาะ Closed, preview → confirm → พิมพ์ DELETE), status transitions, deadline validation (dueAt ≥ receivedAt). Generic admin template ไม่มี domain นี้ — นี่คือ "case management ที่คิดมาแล้ว" ไม่ใช่ CRUD เปล่า.
2. **Host-configurable theme system** — `window.__BOOKING_TICKET_THEME_CONFIG__`, `defaultTheme`/`allowThemeSwitch`, 4 presets (light/dark/super-admin/system), semantic CSS tokens, locked-branding mode. VERIFIED (README + THEME_INTEGRATION.md). นี่คือคุณสมบัติที่ agency ต้องการจริงเมื่อ embed UI ในงานลูกค้า — generic template ไม่มี contract แบบนี้.
3. **Repository abstraction** — `TicketRepository` contract (getAll/getById/save/create/search/findByNormalizedPhone/previewRetention/deleteClosedBefore/reset) + UI/services ห้ามเรียก localStorage ตรง (PRD §5, implementation_plan §2). Buyer สลับ adapter ได้โดยไม่รื้อ UI.
4. **Thai-first i18n + English toggle** — ตลาดเป้าหมาย (ไทย) ต้องการสิ่งนี้; generic international template มัก English-first.
5. **Quality evidence** — 63 unit/integration tests + 28 Chromium E2E, CI green บน main, mobile 375px verified. VERIFIED (CI runs + implementation_plan Phase 5–6).

**จุดอ่อน (VERIFIED/INFERENCE):**
- VERIFIED: ไม่มี auth, ไม่มี multi-user, ไม่มี backend — generic admin templates (react-admin, shadcn admin, Refine) มี ecosystem, docs, community ใหญ่กว่ามาก.
- INFERENCE: CM01 ต้องขายเป็น "domain-ready case management workflow" ไม่ใช่ "admin UI" — ถ้าขายในหมวด admin template จะแพ้ generic อย่างราบคาบ; ถ้าขายในหมวด niche "booking claim / after-sales case management" จะไม่มีคู่แข่งตรงๆ ในตลาด template ไทย.

---

## 5. Minimum V1 finish line ที่ใช้ได้และขายได้

**สถานะปัจจุบัน (VERIFIED):** workflow 3 หน้า (Intake / Detail / History+Retention) ครบ, i18n ครบ, theme system ครบ, 63 tests + 28 E2E, CI green, README/documentation ครบสำหรับ dev. **ฟังก์ชันหลัก "ใช้ได้" แล้วในฐานะ template.**

**Gap ที่ต้องปิดก่อนขาย (เรียงตาม evidence):**
1. VERIFIED: **License audit + secret scan ยังไม่ enable** (ci.yml Stage 7–8) — REVENUE-STRATEGY/ci.yml ระบุเองว่านี่ "matters concretely for CM01: it is a one-time source product sold to buyers... no WSTERA secret may appear in a buyer artifact." **นี่คือ gate ที่ไม่ใช่ optional สำหรับ source product** — ขาย source ให้คนนอกโดยไม่ scan = ความเสี่ยงตรง.
2. VERIFIED: **Lint ยัง disabled** (P0b, master plan CM-D) — คุณภาพ code ที่ buyer จะอ่าน.
3. VERIFIED: **npm audit มี 2 critical / 3 high** (dev toolchain) — advisory เท่านั้น แต่ buyer ที่รัน audit เองจะเห็น → ต้องมี exception-ledger หรืออธิบายใน docs.
4. UNVERIFIED: **Packaging/distribution ยังไม่มีหลักฐาน** — REVENUE-STRATEGY ระบุ gap นี้ชัดสำหรับ multi_tenant_ai (checkout, repo access, buyer docs) แต่สำหรับ CM01 ไม่พบ evidence ว่าทำแล้ว. registry `commercial: false` สนับสนุนว่า packaging ยังไม่เสร็จ (INFERENCE).
5. UNVERIFIED: **Buyer onboarding docs** — README เป็น dev setup (npm ci, playwright) ไม่ใช่ buyer-facing "วิธี embed ในโปรเจกต์ลูกค้า + วิธีเขียน adapter" — ไม่พบ evidence ของ buyer guide.

**RECOMMENDATION — Minimum V1 finish line (sellable template tier):**
- ปิด secret scan + license audit (gate บังคับสำหรับ source product) → lint → packaging (checkout + repo/zip delivery + buyer embed guide + adapter-writing guide) → เปิดขาย $39.
- **ไม่ต้องรอ backend adapter สำหรับ tier นี้** — แต่ต้องเขียนใน listing ให้ชัดว่า "local-first, BYO backend, repository contract พร้อม" เพื่อกัน refund/expectation mismatch.
- ตัวเลข 63 tests / 28 E2E / CI green เป็น selling point ที่ใช้ได้เลย (VERIFIED).

---

## 6. Delivery / setup / support burden ตาม product identity

| Identity | Delivery burden | Setup burden (buyer) | Support burden (WSTERA) | Verdict |
|---|---|---|---|---|
| **A. UI template license ($39/$129)** | ต่ำ: zip/repo access + docs. ต้อง scan secret/license ก่อนส่ง (VERIFIED ว่า gate ยังไม่ปิด) | กลาง: buyer ต้องเขียน adapter เอง + embed เอง | ต่ำ: ไม่มี hosting; support = issues/docs. แต่ buyer ที่ไม่ใช่ dev ระดับสูงจะติด adapter | **RECOMMENDED สำหรับ V1** — zero-infra, สอดคล้องกับ portfolio Path 1 |
| **B. Template + reference backend adapter (ต่อ ticket-tracker #3)** | กลาง: maintain adapter + schema + docs | ต่ำกว่า A: มี reference ให้ลอก | กลาง: ต้อง maintain 2 codebase + version sync | **RECOMMENDED เป็น V1.5** — ปลดล็อก agency tier $129 |
| **C. Hosted widget (฿350/mo)** | สูง: hosting, uptime, auth, multi-tenant, billing | ต่ำสุด: embed script | สูง: production support, SLA, data privacy | **ไม่แนะนำ** — ขัดกับ no-auth/local-first design; คือ product ใหม่ |
| **D. Bundle เข้า booking/BK01** | — | — | — | **ปิดแล้ว** — VERIFIED: owner retracted 2026-08-21 (disambiguation); booking มีระบบของตัวเอง (#4) ที่เหนือกว่า (real backend/auth/tenancy) |

**Burden ที่ตาม identity A ทันที (VERIFIED evidence):** license audit + secret scan ต้อง enable ก่อนส่ง source; npm audit findings ต้องมีคำอธิบาย; buyer จะถามเรื่อง "ข้อมูลอยู่ที่ไหน / หลายเครื่อง怎么办" เพราะ localStorage — ต้องมี FAQ/limitations section (README มีแล้ว — ดี).

---

## 7. ควร extract/reuse capability ไหน โดยไม่ collapse CM01 เข้า BK01

**VERIFIED ข้อเท็จจริง:**
- Domain logic ของ CM01 (types/transitions/deadline/phone) **ถูก port ไปแล้ว** ใน booking's native system (#4) — `ticket-domain.ts:3`: "Ported from products/booking-ticket-module/src/domain/{types, transitions, deadline, phone}.ts" แล้ว diverged. → พิสูจน์แล้วว่า domain layer มีค่า reusable จริง.
- CM01 กับ BK01 มี buyer ต่างกันโดยสิ้นเชิง (dev/agency vs SME tenant) และไม่มี live code path ร่วม (disambiguation, registry comment) — **ห้าม collapse**.
- modules-hub `ticket-tracker` (#3) เป็น backend-only counterpart ที่ "no auth, host decides" philosophy เดียวกัน — ยังไม่ถูกต่อ (proposal).

**RECOMMENDATION:**
1. **Extract domain layer กลับเป็น shared module** (modules-hub หรืออย่างน้อย vendored copy ที่ sync ได้) — ตอนนี้ booking fork ไปแล้ว, CM01 มีของตัวเอง → ความเสี่ยง drift ซ้ำ (เหมือนที่เกิดกับ ticket-tracker ที่ถูก port เป็น JS manual). ถ้า domain logic เปลี่ยน (เช่น retention rule) จะต้องแก้ 2 ที่.
2. **ต่อ CM01 ↔ ticket-tracker (#3) เป็น reference adapter** — ใช้ backend ที่มีอยู่แล้ว แทนสร้าง Supabase adapter ใหม่ (disambiguation เสนอแบบนี้). ได้ทั้ง "backend adapter" ที่ REVENUE-STRATEGY เรียกร้อง และเพิ่ม value ให้ #3 (มี UI ให้ใช้) โดยไม่แตะ BK01.
3. **ห้าม** นำ CM01 ไปเป็น feature ของ booking (owner ตัดสินแล้ว, retracted) และห้ามตั้งชื่อ/แพ็คเกจให้สับสนกับ BK01 — buyer ของ CM01 คือ dev/agency ไม่ใช่ SME tenant ของ booking.
4. Theme system + repository contract เป็น asset ที่ reuse ได้ข้าม product (เช่น wstera_link หรือ product หน้า) — แต่ไม่ต้อง extract ตอนนี้; เก็บเป็น design pattern ใน modules-hub docs (RECOMMENDATION, ไม่มี evidence ว่าจำเป็นเร่งด่วน).

---

## 8. Willingness to pay — สรุป

- UNVERIFIED: ไม่มีหลักฐาน market validation ใดๆ (ไม่มี sale, ไม่มี buyer interview evidence, ราคาเป็น proposal ใน working draft).
- INFERENCE: $39 template — ซื้อได้ impulse (ราคาต่ำ, zero-infra) แต่ buyer ต้องเห็นคุณค่า "domain logic + theme lock + i18n" ผ่าน listing/demo; $129 agency — ต้องมี backend adapter + docs; ฿350/mo hosted — ต้องมี infra ที่ยังไม่มี.
- RECOMMENDATION: ก่อนตั้งราคา final ควรมี evidence ขั้นต่ำ 1 อย่าง: (ก) วาง listing บน marketplace แล้ววัด click/interest, หรือ (ข) interview dev/agency 2–3 ราย ว่าปัญหา "build case UI ให้ลูกค้า" เจ็บจริงแค่ไหน. จนกว่าจะมี ราคา $39/$129 ยังเป็นสมมติฐาน.

---

## 9. Dissent / Uncertainty

1. **Dissent กับ REVENUE-STRATEGY เอง:** เอกสารเขียนว่า backend adapter จำเป็น "before it is more than a demo template" — ผมเห็นว่า template-only ขายได้จริงในตลาด dev template (ราคาต่ำ, zero-infra) และการรอ adapter ก่อนขาย = เสียโอกาส revenue เร็ว. แต่ยอมรับว่า template-only มี ceiling ราคาต่ำและ perception risk — ดังนั้น verdict คือ "ขาย template ก่อน, adapter เป็น gate ของ agency tier" ไม่ใช่ "รอ adapter ถึงค่อยขาย".
2. **Uncertainty หลัก:** ไม่มี evidence ว่า buyer จริงต้องการอะไร — ทุกข้อสรุปเรื่อง willingness to pay เป็น INFERENCE จากโครงสร้างตลาด ไม่ใช่จาก customer evidence.
3. **Uncertainty:** ตัวเลข 63 tests / 28 E2E มาจาก CI runs + implementation_plan — ยังไม่ได้รัน test suite เองในรอบนี้ (CI evidence ถือว่าเพียงพอสำหรับ council แต่ถ้าจะขาย ควรมี local rerun เป็น evidence เพิ่ม).
4. **หมายเหตุ:** CURRENT_STATUS.md เขียนที่ HEAD aeaa750; ปัจจุบัน HEAD 6202108 (commit docs-only) — เนื้อหาไม่ขัดแย้งกับ git/CI จริง (cross-check แล้ว) แต่ตัวเลข "63 tests" ควรยืนยันกับ run 33671032357 ก่อนอ้างอิงในเอกสารขาย.

---

*End of raw analysis — CM01 Product/Customer lens, Round 1.*
