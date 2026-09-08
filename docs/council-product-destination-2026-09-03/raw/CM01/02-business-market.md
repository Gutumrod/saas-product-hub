# CM01 — Business/Market Lens (Round 1 Raw Output)

**Lens:** Business / Market — revenue model, competition, differentiation, distribution, commercial viability
**Date:** 2026-09-03
**Product:** CM01 Booking Claim & Case Management Module (`products/booking-ticket-module`)
**Repo state (verified by lens):** branch `main`, HEAD `6202108` (docs commit on top of `aeaa750` fix), clean tree — confirmed via `git log`/`git status` directly.

**Evidence read (all by this lens, no secondhand):**
- `PRD.md`, `README.md`, `implementation_plan.md`, `docs/CURRENT_STATUS.md`, `docs/THEME_INTEGRATION.md`, `.github/workflows/ci.yml`, `LICENSE`
- `docs/platform/TICKET_SYSTEMS_DISAMBIGUATION.md`
- `REVENUE-STRATEGY.md` (CM01 sections + owner-decision gates), `docs/products/registry.yaml` (CM01 entry), `docs/platform/PRODUCTION_MASTER_PLAN.md` (L0–L4 gates), `docs/platform/PORTFOLIO_REAUDIT_2026-08-27.md`, `BRIEF-differentiation-medium-slow-tier-2026-08-26.md`

**Label convention:** VERIFIED = directly supported by repo/docs evidence read; INFERENCE = reasoned from verified facts; UNVERIFIED/UNKNOWN = no evidence found; RECOMMENDATION = this lens's judgment.

---

## 0. Executive verdict

CM01 เป็นสินทรัพย์ที่ "สร้างเสร็จแล้ว ยังไม่เคยขาย" — มีโค้ดที่ผ่าน CI, มี license, มีแผนการตลาดแบบ draft แต่ **ไม่มีหลักฐานแม้ชิ้นเดียวว่ามีผู้ซื้อจริง, มีช่องทางขาย, หรือมีราคาที่ owner อนุมัติ** (REVENUE-STRATEGY ระบุชัดว่าเป็น working draft และ "Standalone module pricing and packaging" ยังเป็น owner decision ที่ยังไม่ตัดสินใจ — VERIFIED)

**Verdict: ขายเป็น one-time template/module ทันที (RECOMMENDATION) — แต่ต้องแก้ license contradiction ก่อน และอย่าขยายเป็น case-management product แบบ deployable** เพราะ (1) ต้นทุนส่วนเพิ่มในการวางขายต่ำมาก (โค้ดเสร็จ, CI เขียว), (2) การขยายเป็น product เต็มรูปแบบจะชนกับระบบ native ของ `booking` (#4) ที่มี backend/auth/tenancy จริงอยู่แล้ว, (3) โมดูลนี้ได้ "จ่ายค่าตัว" ไปแล้วในฐานะ reusable capability — domain code ถูก port เข้า `booking` แล้ว (VERIFIED)

---

## 1. Product ทำเงินยังไง และทำไม buyer ถึงซื้อ/จ่ายต่อ

**VERIFIED — แผนรายได้เดียวที่มีหลักฐาน:**
- `REVENUE-STRATEGY.md` §2.6 Option A (ระบุว่า "Recommended"): **UI Template / Component License แบบ one-time** — Single Use $39 / Agency $129 (unlimited client implementations)
- Option B: Drop-In Hosted Widget ฿350/เดือน — **แต่ระบุเงื่อนไข "Post-Adapter"** หมายถึงต้องมี backend adapter ก่อน ซึ่งยังไม่มี (VERIFIED: repo มีแค่ localStorage adapter)
- `registry.yaml` CM01: `delivery_model: one_time_source_product`, `commercial_status: prototype`, `acceptance.commercial: false` (VERIFIED)
- `REVENUE-STRATEGY.md` header: "Working draft, not an approved pricing document" + "Zero current revenue (pre-launch portfolio)" (VERIFIED)

**VERIFIED — ยังไม่มีกลไกขายจริง:**
- Master plan L4 (fulfillment path): "ช่องทางขาย — หน้าขาย + ระบบรับเงิน + ส่งมอบไฟล์/สิทธิ์ repo อัตโนมัติ **(นี่คือช่องว่างจริงของทั้ง 3 ตัว)**" — ยังไม่ผ่าน
- ไม่พบหลักฐาน checkout (Gumroad/Lemon Squeezy/Stripe), หน้า landing, หรือการส่งมอบ artifact ใดๆ ใน repo/plan

**ทำไม buyer ถึงซื้อ (INFERENCE จากคุณสมบัติที่ VERIFIED):** ซื้อเพื่อประหยัดเวลา dev 2–4 วัน (ตัวเลข effort จาก REVENUE-STRATEGY §1: "Small–medium (2–4 days)") ในการสร้าง case-intake UI ที่มี Thai-first i18n, phone normalization, overdue/deadline logic, retention, theme system, และ 63 tests + E2E ที่ผ่านแล้ว

**ทำไม buyer ถึง "จ่ายต่อ": ไม่มีเหตุผล — เพราะเป็น one-time license (VERIFIED ว่าไม่มี maintenance pass / subscription สำหรับ CM01 ในเอกสารใด)** นี่คือธรรมชาติของโมเดล: เงินสดก้อนเดียว, ไม่มี LTV, ไม่มี recurring revenue, ไม่มีเหตุผลให้ buyer กลับมา ยกเว้นซื้อ agency tier ครั้งเดียวแล้วจบ

**UNVERIFIED:** ไม่มีหลักฐาน demand validation — ไม่มี buyer interview, ไม่มี competitor analysis, ไม่มี market research ใน repo (implementation_plan §9 อ้างถึง "discovery interview" ซึ่งเป็น internal interview กับเจ้าของ ไม่ใช่การทดสอบตลาด — INFERENCE)

---

## 2. ใครเป็นคนจ่าย

**VERIFIED (จาก TICKET_SYSTEMS_DISAMBIGUATION.md + REVENUE-STRATEGY):**
- **ผู้จ่าย = frontend developer / web agency** ที่จะเอา UI ไป embed ในงาน client ของตัวเอง — "Audience: frontend devs / agencies who want to license a case-management UI to embed in their own client work — not booking's own end customers"
- **ไม่ใช่ business operator โดยตรง** ใน Option A (Option B ฿350/เดือนจะเจาะ operator แต่ต้องมี adapter ก่อน — ยังไม่เกิด)

**INFERENCE — จุดอ่อนเชิงโครงสร้าง:** คนจ่าย (dev/agency) กับคนได้ประโยชน์สุดท้าย (เจ้าหน้าที่ดูแลเคสของ operator — persona ใน PRD §2: ผู้ใช้ 40+, Thai-first, ไม่ login) เป็นคนละคนกัน คุณค่าต้อง "ขาย" ให้ dev ในรูปของเวลาที่ประหยัด ไม่ใช่ในรูปของผลลัพธ์ทางธุรกิจของ operator — ทำให้การตั้งราคาและ messaging ยากกว่า B2B SaaS ที่ขายผลลัพธ์ตรงๆ

---

## 3. ราคา $39 / $129 น่าเชื่อถือไหม

**VERIFIED:** ตัวเลขนี้เป็น **proposal ใน working draft เท่านั้น** — REVENUE-STRATEGY ระบุ "Final packaging decisions remain strictly with the owner" และ "Standalone module pricing and packaging" ยังเป็น unchecked owner decision ใน §4 (The Owner Decisions Blocking Monetization) ดังนั้น **สภาไม่ควรถือว่า $39/$129 เป็นราคาที่ตัดสินแล้ว**

**INFERENCE — ระดับราคา:**
- $39 single-use อยู่ในช่วงล่างของตลาด React template (CodeCanyon/Gumroad โดยทั่วไป ~$19–79) — เป็นราคาที่ impulse-buy แบบ self-serve ได้
- $129 agency-unlimited เทียบได้กับของแพงกว่าในตลาด (เช่น Tailwind UI ~$299) — ราคาไม่สูงเกินจริง
- **แต่ความน่าเชื่อถือของราคา ≠ ความน่าเชื่อถือของ demand** — ไม่มีหลักฐานว่ามี dev/agency อยากซื้อ

**INFERENCE — ปัญหาเชิงกฎหมายที่ร้ายแรงกว่า (license contradiction):**
- Repo ใช้ **MIT license (VERIFIED จาก LICENSE file)** — MIT อนุญาตให้ใครก็ได้ใช้, คัดลอก, แก้ไข, **และขายต่อ** ได้ฟรี
- แผนขาย "Single Use $39" (VERIFIED จาก REVENUE-STRATEGY) ต้องการจำกัดการใช้ครั้งเดียว — **ขัดกับ MIT โดยตรง**: ผู้ซื้อ MIT มีสิทธิตามกฎหมายที่จะแจกจ่ายโค้ดนี้ต่อฟรี และผู้ขายไม่สามารถบังคับ "single-use" ภายใต้ MIT ได้
- ci.yml เองก็ยอมรับว่า license audit "is not optional forever" เพราะ CM01 "is a one-time source product sold to buyers" (VERIFIED) — แต่ยังถูกบล็อกด้วย tool choice ที่ยัง OPEN
- **ทางออก (RECOMMENDATION):** dual-license — คง MIT สำหรับ non-commercial/การใช้งานภายใน แต่ขาย commercial license (EULA) สำหรับผู้ซื้อ หรือเปลี่ยนเป็น "pay for convenience/support/updates" แทนการขาย "สิทธิ์" — ต้องตัดสินใจก่อนขายชิ้นแรก (L2 gate)

---

## 4. คุณค่าที่ป้องกันได้ (defensible value) เหนือ generic admin/dashboard template

**VERIFIED — สิ่งที่ generic template ไม่มี:**
1. **Thai-first i18n** พร้อม English toggle และ locale persistence (PRD §7, README)
2. **Phone normalization + duplicate-history detection** — `081-234-5678` = `0812345678`, แสดงประวัติลูกค้าเดิมโดยไม่ autofill (PRD §3.1, business rules)
3. **Deadline/overdue logic** — due date validation, overdue badge/filter, ไม่เปลี่ยนสถานะอัตโนมัติ (PRD §4)
4. **Retention policy** — 12 เดือน default, preview → confirmation สองขั้น → ลบเฉพาะ Closed (PRD §4, README)
5. **Host-configurable theme system** — `window.__BOOKING_TICKET_THEME_CONFIG__`, lock branding ได้โดยไม่แตะโค้ด (THEME_INTEGRATION.md) — นี่คือจุดขายหลักสำหรับ dev/agency ที่จะ embed
6. **Repository abstraction** — UI ไม่ผูกกับ localStorage, สลับ adapter ภายหลังได้ (PRD §5)
7. **คุณภาพที่พิสูจน์ได้** — 63 tests, typecheck, build, 28 E2E Chromium, mobile 375px (implementation_plan, CURRENT_STATUS)

**INFERENCE — ขอบเขตของความ defensible:**
- จุดที่ "ลึก" กว่า generic template คือ **domain rules ของ case management** (phone, overdue, retention) + **theme/branding contract** — นี่คือสิ่งที่ dev ซื้อ
- แต่ **ไม่มี backend, ไม่มี auth, ไม่มี multi-user, ไม่มี sync** (VERIFIED: PRD out-of-scope + README non-claims) — ดังนั้น **ไม่สามารถแข่งกับ case-management product จริง** (Zendesk/Freshdesk/HelpDesk หรือแม้แต่ Airtable) ได้ มันคือ UI template ไม่ใช่ product
- จุดยืนที่สมเหตุสมผลที่สุด (INFERENCE): "**Thai-first case intake UI component พร้อม domain rules ที่ทดสอบแล้ว**" — niche wedge ที่ global template (English-first) ไม่มี และ differentiation brief จัด CM01 อยู่ใน "fast tier" ด้วยเหตุผล near-zero competition (VERIFIED ว่า brief กล่าวเช่นนั้น — แต่ brief เป็น session ranking ภายใน ไม่ใช่ market data)

---

## 5. ความเสี่ยงทางธุรกิจที่ใหญ่ที่สุด

**อันดับ 1 — Demand ไม่เคยถูก validate (INFERENCE จากช่องว่างหลักฐานที่ VERIFIED):**
- ไม่มีหลักฐานผู้ซื้อ, ไม่มีช่องทางขาย, ไม่มี market research, portfolio มีรายได้เป็นศูนย์ (VERIFIED ทั้งหมด)
- ความเสี่ยงนี้เป็น existential: ถ้าไม่มี dev/agency อยากซื้อ template นี้ ราคาเท่าไรก็ไม่มีความหมาย
- หลักฐานเดียวที่ "บวก" คือ differentiation brief จัด CM01 ใน fast tier (VERIFIED ว่า brief กล่าวเช่นนั้น) — แต่เป็นความเห็นภายใน ไม่ใช่ข้อมูลตลาด

**อันดับ 2 — License contradiction (MIT vs. paid single-use) (INFERENCE จากข้อเท็จจริง VERIFIED):**
- เป็น blocker เชิงโครงสร้างที่ต้องแก้ก่อนขายชิ้นแรก (L2 gate) — ถ้าไม่แก้ ผู้ซื้อ MIT คนแรกสามารถแจกจ่ายโค้ดฟรี และทำลายโมเดลราคาทั้งหมด
- เป็นความเสี่ยงที่ "ชัดและใกล้ที่สุด" แต่ไม่ใช่ความเสี่ยงที่ใหญ่ที่สุด เพราะแก้ได้ด้วยการตัดสินใจ (dual-license)

**อันดับ 3 — Buyer disappointment จากข้อจำกัดของ artifact (INFERENCE):**
- REVENUE-STRATEGY เองยอมรับ: "Needs a real backend adapter (currently localStorage-only by design) before it is more than a demo template" (VERIFIED)
- ถ้า buyer เอาไป deploy ตามสภาพ (localStorage, no-auth) ข้อมูลจะอยู่แค่ browser เดียว ไม่มี multi-user — ต้องเขียน L0 (buyer & scope lock) ให้ชัดว่า "ซื้อไปได้อะไร ไม่ได้อะไร" ไม่เช่นนั้นเสี่ยง refund/negative review

**สรุป (RECOMMENDATION):** ความเสี่ยงใหญ่ที่สุด = **unvalidated demand**; blocker ที่ต้องแก้ทันที = **license contradiction**; ทั้งคู่ต้องเคลียร์ก่อนวางขาย

---

## 6. Destination — 4 ทางเลือก

### 6.1 ขายเป็น one-time React template/module (RECOMMENDATION — ทางที่ควรไป)
**หลักฐานสนับสนุน (VERIFIED):**
- REVENUE-STRATEGY แนะนำ Option A นี้เป็น "Recommended" อยู่แล้ว
- โค้ดเสร็จสมบูรณ์: CI เขียว (CURRENT_STATUS + implementation_plan ระบุ run `33670789635` success; git log ยืนยัน commit fix มีอยู่จริง — ผมไม่ได้ re-run pipeline เอง), 63 tests, build ผ่าน
- ต้นทุนส่วนเพิ่มต่ำมาก: เหลือแค่ L0 (buyer scope lock), L1 (clean-install proof), L2 (license/EULA), L4 (fulfillment — Gumroad/Lemon Squeezy) — master plan ประเมิน effort 2–4 วัน (VERIFIED)
- เป็นเส้นทางเดียวใน portfolio ที่ให้รายได้ "เกือบ $0 infra cost" (REVENUE-STRATEGY ใช้คำนี้กับ source product)

**เงื่อนไขก่อนขาย (RECOMMENDATION):** แก้ license contradiction, เขียน L0 ให้ชัด (ซื้อไปได้อะไร ไม่ได้อะไร — โดยเฉพาะ "localStorage-only, no-auth, Chromium-verified"), ตั้ง checkout + ส่งมอบอัตโนมัติ, ประกาศนโยบายอัปเดตหลังขาย (L3)

### 6.2 ขยายเป็น deployable case-management product (RECOMMENDATION — อย่าทำตอนนี้)
**หลักฐาน (VERIFIED):**
- Disambiguation: booking มีระบบ native (#4) ที่ "more capable" (real backend/auth/tenancy) และ **owner ตัดสินใจแล้วว่า CM01 ไม่ใช่และจะไม่เป็น feature ของ booking** (retracted 2026-08-21)
- ทางเลือกที่ "natural fit" ตาม disambiguation คือ wire เข้ากับ `ticket-tracker` module (#3, backend-only, production-ready) — **แต่ระบุชัดว่า "This has not been done; it's a proposal, not a plan in motion"**
- การขยาย = ต้องทำ backend adapter + auth + hosting + support burden — ตรงข้ามกับจุดแข็ง "zero ongoing operational cost" ของ source product และจะแย่ง bandwidth จากเส้นทางรายได้หลัก (booking/line_oa_ai — REVENUE-STRATEGY §5)
- **INFERENCE:** ถ้าจะขยายจริง ควรทำผ่าน #3 (ticket-tracker) ไม่ใช่สร้าง Supabase adapter ใหม่จากศูนย์ — แต่ยังไม่ควรทำจนกว่า template license จะพิสูจน์ demand

### 6.3 ใช้เป็น reusable capability เป็นหลัก (RECOMMENDATION — ใช้เป็น "ผลพลอยได้" ไม่ใช่ "ทางเลือกหลัก")
**หลักฐาน (VERIFIED):**
- **สิ่งนี้เกิดขึ้นแล้วโดยพฤตินัย**: domain code ของ CM01 (types/transitions/deadline/phone) ถูก port เข้า `booking`'s `ticket-domain.ts` ("Ported from products/booking-ticket-module/src/domain/...") — CM01 ได้ "จ่ายค่าตัว" ไปแล้วในฐานะ internal capability แม้จะขายไม่ได้สักชิ้น
- แต่อย่าใช้เป็น destination หลัก เพราะ (a) มันไม่สร้างรายได้, (b) มันลดคุณค่าของงานที่ทำเสร็จแล้วให้เหลือแค่ "โค้ดตัวอย่าง" — REVENUE-STRATEGY เองเตือนว่า "more than a demo template" เป็นเงื่อนไข (VERIFIED)

### 6.4 Pause (RECOMMENDATION — อย่าทำ)
- โค้ดเสร็จ, CI เขียว, ต้นทุนวางขาย ~2–4 วัน — การ pause คือการทิ้งเส้นทางรายได้ที่ต้นทุนต่ำที่สุดเส้นทางหนึ่งใน portfolio โดยไม่มีเหตุผล
- ทางเดียวที่ pause จะสมเหตุผล: ถ้า owner ตัดสินใจว่า bandwidth ทั้งหมดต้องไปที่ booking/line_oa_ai และ CM01 ไม่ใช่ priority — แต่แม้ตอนนั้น การวางขายแบบ "set and forget" (Gumroad + zip) ก็ใช้ bandwidth น้อยกว่า pause + กลับมาทีหลัง

---

## 7. สรุปคำตอบตามคำถามบังคับ

| คำถาม | คำตอบ | Label |
|---|---|---|
| ทำเงินยังไง / ทำไมจ่ายต่อ | One-time license $39/$129 (proposal เท่านั้น); ไม่มี recurring — buyer จ่ายครั้งเดียว ไม่มีเหตุผลจ่ายต่อ | VERIFIED (แผน) / INFERENCE (เหตุผลซื้อ) |
| ใครจ่าย | Frontend dev / web agency ที่ embed ในงาน client — ไม่ใช่ operator โดยตรง | VERIFIED |
| $39/$129 น่าเชื่อถือไหม | ระดับราคาใช้ได้ แต่ยังไม่ใช่ราคาที่อนุมัติ; **MIT license ขัดกับ "single-use"** — ต้อง dual-license ก่อน | INFERENCE |
| คุณค่าที่ป้องกันได้ | Thai-first i18n, phone normalization, overdue/retention rules, theme/branding lock, repository abstraction, 63 tests — ลึกกว่า generic template แต่เป็น UI template ไม่ใช่ product | VERIFIED (คุณสมบัติ) / INFERENCE (ตำแหน่ง) |
| ความเสี่ยงใหญ่สุด | **Unvalidated demand** (ไม่มีหลักฐานผู้ซื้อ/ช่องทางขาย/รายได้); runner-up = license contradiction | INFERENCE |
| Destination | **ขายเป็น one-time template ทันที** (หลังแก้ license + L0/L1/L4); อย่าขยายเป็น product; ใช้ reusable capability เป็นผลพลอยได้; อย่า pause | RECOMMENDATION |

---

## 8. Evidence gaps / UNKNOWN

- **UNKNOWN:** มี dev/agency จริงกี่รายที่อยากซื้อ template แบบนี้ — ไม่มีหลักฐานใดๆ ใน repo
- **UNKNOWN:** ราคาที่ owner อนุมัติจริง — $39/$129 ยังเป็น proposal
- **UNKNOWN:** ตลาด React template สำหรับ case management โดยเฉพาะ (ไม่ใช่ generic admin) มีขนาดเท่าไร — ไม่มี market data
- **UNKNOWN:** คู่แข่งตรง (template case-management Thai-first) — differentiation brief อ้าง "near-zero competition" แต่เป็นความเห็นภายใน ไม่ใช่การสำรวจตลาด
- **UNVERIFIED (โดยผม):** สถานะ CI เขียว — อ้างอิงจาก CURRENT_STATUS/implementation_plan + git log ที่ยืนยัน commit; ผมไม่ได้ re-run pipeline เอง
- **UNVERIFIED:** ว่า "discovery interview" ใน implementation_plan §9 เป็นการคุยกับผู้ใช้จริงหรือไม่ — ไม่มีบันทึก

## 9. Dissent / ความไม่แน่นอน

1. **จุดที่ผมไม่เห็นด้วยกับ REVENUE-STRATEGY อย่างชัดเจน:** การขาย "single-use license" ของโค้ด MIT เป็นโมเดลที่ไม่ยั่งยืนทางกฎหมาย — เอกสารวางแผนขายโดยไม่พูดถึงความขัดแย้งนี้เลย (REVENUE-STRATEGY ไม่มีการกล่าวถึง license strategy สำหรับ CM01; มีแต่ master plan L2 ที่บอกว่า "มี LICENSE แล้ว" โดยไม่ตั้งคำถามว่า MIT เหมาะกับ commercial resale หรือไม่)
2. **ความไม่แน่นอนหลักของผม:** ผมให้ RECOMMENDATION "ขายทันที" เพราะต้นทุนต่ำและ asset เสร็จ — แต่ถ้า owner มี bandwidth จำกัดจริง (REVENUE-STRATEGY เน้น solo-founder focus) การเลื่อน CM01 ไปหลัง booking/line_oa_ai ก็สมเหตุผลได้ ตราบใดที่ยังไม่ทิ้งมัน
3. **จุดที่อาจถูกแย้ง:** บางคนอาจเถียงว่า "ขาย template ที่ localStorage-only/no-auth" คือการขายของที่ buyer ใช้จริงไม่ได้ → ควรทำ adapter ก่อนขาย — ผมตอบว่าไม่: L0 ที่เขียนชัด ("ซื้อไปได้อะไร ไม่ได้อะไร") + ราคา $39 จัดการความคาดหวังได้ และการรอ adapter จะเลื่อนรายได้ออกไปโดยไม่มีหลักฐานว่า adapter จะเพิ่มยอดขาย
