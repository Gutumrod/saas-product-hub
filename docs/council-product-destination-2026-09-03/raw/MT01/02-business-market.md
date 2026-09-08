# MT01 Multi-Tenant AI Starter Kit — Business/Market Lens (Raw Output)

**Council:** WSTERA Product Destination Council Round 1
**Lens:** Business/Market — revenue model, competition, differentiation, distribution, commercial viability
**Date:** 2026-09-03
**Analyst:** Hermes (Business/Market expert lens)
**Repo:** `D:\AI-Workspace\projects\saas-product-hub\products\multi-tenant-ai`

---

## 0. Evidence basis (สิ่งที่ตรวจจริง)

| หลักฐาน | สถานะ |
|---|---|
| Git: branch `master`, HEAD `92139cf` (`92139cfa4697fbade1a023d76dc4734dd82d5862`), untracked `docs/` | **VERIFIED** (รัน `git branch --show-current`, `git rev-parse HEAD`, `git status` เอง) |
| `docs/CURRENT_STATUS.md` มี placeholder `$branch`/`$head` ค้างอยู่จริง | **VERIFIED** (อ่านไฟล์ตรง) — เอกสารนี้เป็น overlay ที่ stale ต้องไม่เชื่อตามตรง |
| `server/README.md` — ระบุชัดว่าเป็น "reference / example code", "educational reference architecture", in-memory mock repos, buyer ต้อง implement เอง: persistent storage, OTel exporter, frontend/auth UI, deployment | **VERIFIED** |
| `server/` — Express server, routes: `/health`, `/whoami`, `/me`, `/ai/demo`, `/subscription/*`, `/payment/*`; seed plans `free` (50 req/mo) / `pro` ($29/mo, 1000 req/mo) | **VERIFIED** (อ่าน ROUND1–4_HANDOFF + README) |
| Tests: `npm test` รันเอง → **13/13 passed** (server.test.ts 9 + webhook.test.ts 4) | **VERIFIED** (รันจริง 2026-09-03) |
| Modules ก็อปมา 7 ตัว: tenant-context, ai-provider, enterprise-features, auth-supabase, payment, subscription, webhook-receiver — ทุกตัวมี VERSION + DESIGN/MODULE.md | **VERIFIED** (`ls modules/`) |
| ทุก module มีต้นทางใน modules-hub (ทั้ง 7 ตัว EXISTS) | **VERIFIED** (`ls D:/AI-Workspace/projects/modules-hub/modules/`) |
| ไม่มี LICENSE file ใน repo | **VERIFIED** (`ls -la` ไม่พบ license) |
| ไม่มี release tag, ไม่มี CI workflow, ไม่มี changelog, ไม่มี buyer artifact, ไม่มี support policy | **VERIFIED** (PORTFOLIO_PRODUCTION_MASTER_PLAN.md §3.3 + PORTFOLIO_REAUDIT_2026-08-27.md) |
| `npm audit` server: 5 findings (3 moderate, 1 high, 1 critical) — ณ 2026-08-27 | **VERIFIED** (จาก PORTFOLIO_REAUDIT_2026-08-27.md; ตัวเลข time-sensitive ต้อง regenerate ณ release) |
| Registry: `delivery_model: one_time_source_product`, `commercial_status: sellable`, wave 2 | **VERIFIED** (docs/products/registry.yaml) |
| Master plan: MT01 = one-time source product, ต้องผ่าน L0–L5 ladder; ณ ปัจจุบัน L0–L5 ยังไม่มีหลักฐานครบ (L2 license: "MT01 and HC01 do not [have a license]") | **VERIFIED** (PORTFOLIO_PRODUCTION_MASTER_PLAN.md §3.3/§4) |
| `docs/CURRENT_STATUS.md`: productization **DEFERRED TO P5**, ยังไม่มี slot | **VERIFIED** |
| `BRIEF.md`: TODO ยังเปิด — ลูกค้าเป้าหมาย, MVP scope, โมเดลราคา, Timeline, ความเสี่ยง | **VERIFIED** |
| ราคา: **ไม่มี pricing ที่ owner อนุมัติ** — REVENUE-STRATEGY.md ระบุชัด "multi_tenant_ai ... still have no owner-approved pricing at all — every number ... remains a proposal only" | **VERIFIED** |
| Demand evidence: ไม่พบ waitlist / pilot / inbound interest / LOI ใดๆ ใน repo | **UNVERIFIED / UNKNOWN** (ค้นแล้วไม่พบ) |

---

## 1. Product ทำเงินยังไง และทำไม buyer ถึงซื้อ/จ่ายต่อ?

**VERIFIED — กลไกรายได้ที่ออกแบบไว้ (ยังไม่ใช่ของจริง):**
- Registry + Master Plan กำหนด `one_time_source_product` — ขาย source code ครั้งเดียว ไม่มี recurring revenue
- REVENUE-STRATEGY.md เสนอ (เป็น proposal เท่านั้น ไม่ใช่ decision): Standard $79 / Extended $199–249 one-time, Option C = maintenance pass $99/yr — **ยังไม่มี owner อนุมัติราคาใดๆ**
- ไม่มีกลไก recurring revenue ใดๆ ในโค้ดหรือเอกสารที่อนุมัติ — ตัว reference server เองมี Stripe billing แต่เป็น **demo ของ product ที่ buyer จะสร้าง** ไม่ใช่รายได้ของเรา

**ทำไม buyer ถึงซื้อ (เหตุผลที่เอกสารภายในเสนอ):**
- **INFERENCE** — ตรรกะที่เสนอคือ "ประหยัดเวลา" (buyer ไม่ต้องออกแบบ multi-tenant + quota + AI provider abstraction เอง) แต่ไม่มีหลักฐาน demand ภายนอกยืนยันว่าคนจะจ่ายเพื่อสิ่งนี้
- **UNVERIFIED** — ไม่มีหลักฐานว่า buyer กลุ่มใดเคยแสดงความสนใจจ่ายเงิน

**ทำไม buyer ถึง "จ่ายต่อ":**
- **VERIFIED** — โมเดล one-time ไม่มี "จ่ายต่อ" โดยธรรมชาติ; คำถามที่ถูกต้องคือ "ทำไม buyer ถึงซื้อเลย" และ "support burden หลังขายจะกินกำไรหรือไม่" (L5 support boundary ยังไม่ถูกเขียน — Master Plan ระบุว่าต้อง publish ก่อนขายครั้งแรก)

---

## 2. ใครคือ buyer จริง?

**VERIFIED — เอกสารภายในเสนอ (ยังไม่ lock):**
- `BRIEF.md` TODO: "ลูกค้าเป้าหมาย (dev ที่จะสร้าง AI SaaS ของตัวเอง, ขายเป็น boilerplate)" — ยังเป็น checklist ที่เปิดอยู่ ไม่ใช่การตัดสินใจ
- REVENUE-STRATEGY.md (proposal): "SaaS Builders, Tech SMEs, AI Indie Hackers"

**UNVERIFIED / UNKNOWN — ไม่มีหลักฐาน demand ภายนอก:**
- ไม่มี waitlist, ไม่มี pilot, ไม่มี inbound interest, ไม่มี LOI — ทุก segment ข้างต้นเป็นสมมติฐานภายในล้วน
- **INFERENCE** — ถ้าต้องเลือกจากหลักฐานที่อ่อนที่สุด: กลุ่ม "indie SaaS builder / AI indie hacker" เป็น segment ที่สมเหตุสมผลที่สุด (เพราะ artifact เป็นโค้ด dev-facing, ภาษา/เครื่องมือเป็น English-first, ราคา $79–199 เหมาะกับ dev ที่ซื้อของเอง) แต่เป็น inference ไม่ใช่ fact
- **INFERENCE** — กลุ่ม "internal tech SME" และ "agency" มีหลักฐานรองรับน้อยกว่า: ไม่มี evidence ว่า SME ไทยจะซื้อ source code ภาษาอังกฤษที่ต้อง self-host เอง; agency ต้องการ license แบบ unlimited projects ($199–249 tier) ซึ่งยังเป็นแค่ proposal

---

## 3. Buyer กำลังซื้ออะไรกันแน่?

**VERIFIED — คำตอบจากหลักฐาน: "reference implementation / architecture starter" (จุดอ่อนที่สุดใน 4 ตัวเลือก)**

`server/README.md` ระบุตรงตัว:
- "This server is **reference / example code** intended to prove that the modules compose cleanly"
- "educational reference architecture showing clean module wiring"
- Buyer ต้อง implement เอง: **persistent storage** (mock repos → real DB), **OpenTelemetry exporter**, **frontend/auth UI**, **deployment pipelines**, **secret management**

**VERIFIED — สิ่งที่ buyer ได้รับจริง:**
- 7 modules (ก็อปจาก modules-hub) + Express reference server ที่ต่อสายครบ 6 modules พร้อม tests 13/13 ผ่าน
- ไม่ใช่ production-ready boilerplate (ไม่มี DB จริง, ไม่มี frontend, ไม่มี deployment, ไม่มี migrations)
- ไม่ใช่ reusable source bundle ที่ clean-install ได้ (L1 clean-install proof ยังไม่เคยทำ — Master Plan ระบุว่า "no product in this portfolio has ever produced" หลักฐานชุดนี้)

**INFERENCE — ช่องว่างระหว่าง promise กับ artifact:**
- คำว่า "Starter Kit" สื่อว่า buyer ได้ "จุดเริ่มต้นที่ต่อยอดได้ทันที" แต่ของจริงคือ "ตัวอย่างการต่อสายที่ buyer ต้องเขียนงานส่วนใหญ่เอง" (DB, auth UI, frontend, deploy, monitoring) — นี่คือช่องว่างเชิงพาณิชย์ที่ใหญ่ที่สุด
- **INFERENCE** — buyer ที่จ่าย $79–199 คาดหวังประหยัดเวลาเป็นสัปดาห์; reference server แบบ in-memory mock ประหยัดเวลาได้จริงแค่ส่วน architecture design (วัน–สองวัน) ไม่ใช่ส่วน build ทั้งหมด

---

## 4. One-time source-product economics น่าเชื่อถือไหม?

**VERIFIED — เงื่อนไขเชิงโครงสร้างที่ทำให้โมเดลนี้ "เป็นไปได้" ในทฤษฎี:**
- Zero infra cost: ไม่มี hosting, ไม่มี multi-tenant runtime, ไม่มี ongoing ops (REVENUE-STRATEGY.md Path 1)
- ไม่ถูกบล็อกโดย mandatory gates ของ hosted products (credential rotation, Phase 0)
- ต้นทุน marginal ต่อการขาย ≈ 0 (ขายไฟล์/zip)

**VERIFIED — เงื่อนไขที่ทำให้ "ยังไม่น่าเชื่อถือ" ในทางปฏิบัติ:**
1. **ไม่มีราคาที่อนุมัติ** — ทุกตัวเลขเป็น proposal
2. **ไม่มี demand evidence** — ยังไม่เคยพิสูจน์ว่ามีคนจ่าย
3. **L0–L5 ladder ยังไม่ผ่านแม้แต่ขั้นเดียว** — L0 (buyer lock) ยังเป็น TODO ใน BRIEF.md, L1 (clean-install) ไม่เคยทำ, L2 (license/IP) ไม่มี license, L3 (packaging/versioning) ไม่มี tag, L4 (fulfillment) ไม่เคยทดสอบ, L5 (support boundary) ไม่มี
4. **npm audit มี high/critical findings** — ต้องแก้ก่อนขาย (L2 dependency-license audit)
5. **Support burden ไม่มีขอบเขต** — โมเดล one-time หมายถึง support ตลอดชีพโดยไม่มีรายได้ recurring มาหักล้าง; L5 ยังไม่ถูกเขียน

**INFERENCE — การเทียบเคียงตลาด (จากความรู้ตลาด ไม่ใช่หลักฐานใน repo):**
- ตลาด boilerplate/starter kit มีของฟรีและของถูกเกลื่อน: Supabase templates, create-t3-app (ฟรี), open-source boilerplates, และ commercial อย่าง shipfa.st / nextless ($99–299) ที่รวม **frontend + deployment + updates ต่อเนื่อง** — MT01 ณ ปัจจุบันไม่มี frontend, ไม่มี deployment, ไม่มี update policy (L3) จึงเทียบราคา $79–199 กับของที่ให้มากกว่าได้ยาก
- **UNVERIFIED** — repo ไม่มีการวิเคราะห์คู่แข่งของ starter kit นี้เลย (ต่างจาก feature-flag ที่ differentiation proposals วิเคราะห์ LaunchDarkly/GrowthBook/Unleash ไว้) — ช่องว่างหลักฐานชัดเจน

**สรุป: โมเดล one-time "น่าเชื่อถือได้" เฉพาะถ้า artifact ถูกยกระดับจาก reference → clean-install boilerplate และมี L0–L5 ครบ; ณ สถานะปัจจุบัน (reference-only, ไม่มี license, ไม่มีราคา, ไม่มี demand proof) เศรษฐศาสตร์ยังไม่น่าเชื่อถือ**

---

## 5. ความเสี่ยงทางธุรกิจที่ใหญ่ที่สุด

**VERIFIED — ความเสี่ยงที่หลักฐานรองรับ:**

1. **ช่องว่าง promise–artifact (ใหญ่ที่สุด):** ขายในนาม "Starter Kit" แต่ของจริงคือ reference implementation ที่ buyer ต้องเขียนงานหลักเอง (DB, frontend, deploy, monitoring) → ความเสี่ยง refund/chargeback/รีวิวเสีย/ชื่อเสียงพอร์ตเสียหายสูงสุด
2. **Support burden ไม่มีขอบเขตบนโมเดล one-time:** ไม่มี L5 support policy, ไม่มี update policy (L3) — dev buyer ที่ซื้อโค้ดแล้วเจอปัญหา จะเรียกร้อง support ตลอดชีพในราคา $79
3. **ไม่มี demand validation:** ลงทุน packaging/distribution ไปโดยไม่รู้ว่ามีคนอยากซื้อ — ความเสี่ยง sunk cost
4. **License/IP:** ไม่มี license ของตัวเอง + dependency audit มี high/critical → ขายไม่ได้ตามกฎ L2 อยู่แล้ว
5. **ราคาไม่เคยถูกอนุมัติ:** ตัวเลข $79/$199 เป็น proposal ที่อาจไม่ตรงกับ willingness-to-pay จริง

**INFERENCE — ความเสี่ยงเชิงกลยุทธ์:**
- การขาย "reference" ในราคา boilerplate จะทำลายความน่าเชื่อถือของพอร์ต (ซึ่งยังไม่มีรายได้เลย — ทุก product ต้องพึ่ง trust เดียวกัน) มากกว่ามูลค่าที่จะได้จากยอดขายไม่กี่สิบราย

---

## 6. Verdict: commercialize / reshape / pause?

**RECOMMENDATION — PAUSE (คงสถานะ DEFERRED TO P5 ตาม CURRENT_STATUS.md) โดยมี reshape gate ก่อน commercialization**

เหตุผล (evidence-first):
- **VERIFIED** — ณ วันนี้ขายไม่ได้ตามกฎของตัวเอง: L0–L5 ยังไม่ผ่าน, ไม่มี license, ไม่มีราคาอนุมัติ, ไม่มี clean-install proof, ไม่มี fulfillment path, ไม่มี support boundary
- **VERIFIED** — ไม่มี demand evidence ใดๆ → ยังไม่มีเหตุผลเร่งด่วนที่จะ commercialize ก่อน product อื่นในพอร์ต
- **VERIFIED** — CURRENT_STATUS.md กำหนด P5 ไว้แล้ว; การขายก่อน P5 จะขัดกับแผนที่ owner อนุมัติ

**เงื่อนไข reshape ก่อนขาย (เมื่อถึง P5):**
1. **L0 — Lock buyer + artifact definition ให้ชัด:** เลือก segment เดียว (แนะนำ: indie AI SaaS builder) และนิยามให้ตรงว่า "ซื้อ reference architecture + module bundle" ไม่ใช่ "ซื้อ production boilerplate" — หรือลงทุนยกระดับ artifact ให้เป็น clean-install boilerplate จริง (DB adapter, frontend, deployment) แล้วค่อยขายในนาม starter kit
2. **L2 — License + dependency audit:** เขียน license, แก้ high/critical findings
3. **L1 — Clean-install proof:** คนนอก clone แล้วรันผ่านโดยไม่ต้องเข้าถึง repo/secret ภายใน
4. **L5 — Support boundary:** กำหนดขอบเขต support + update policy ก่อนขายครั้งแรก
5. **Demand check ก่อนลงทุน packaging:** หา evidence ว่า dev กลุ่มเป้าหมายสนใจจริง (เช่น pre-sale ผ่าน Gumroad/Lemon Squeezy กับ landing page) ก่อนเขียน docs ชุดใหญ่

**ทางเลือกที่ควรพิจารณาเพิ่ม (RECOMMENDATION):**
- **Dogfood ก่อนขาย:** ใช้ MT01 เป็น backbone ให้ product ภายในพอร์ต (สอดคล้องกับ differentiation synthesis ที่เสนอให้ฝัง feature-flags ลงใน MT01 เป็นจุดขาย) — พิสูจน์คุณค่าจริงก่อนขายนอก
- **ถ้าจะขายจริง:** reposition เป็น "Multi-Tenant AI Reference Architecture + Module Source" ในราคาที่สมเหตุสมผลกับของจริง (ต่ำกว่า $79 หรือ bundle กับ module-hub access) แทนที่จะขายในนาม "Starter Kit" ที่ promise เกินของจริง

---

## 7. Dissent / Uncertainty

1. **ไม่มี demand evidence เลย** — verdict ทั้งหมดเป็น supply-side; ถ้า owner มีข้อมูล demand นอก repo (เช่น มีคนถามซื้อแล้ว) verdict ควรเปลี่ยนเป็น REVISE/LOCK ได้ทันที
2. **การวิเคราะห์คู่แข่งเป็น INFERENCE จากความรู้ตลาด ไม่ใช่หลักฐานใน repo** — repo ไม่มีการวิเคราะห์คู่แข่ง starter kit เลย; ตัวเลขเปรียบเทียบ (shipfa.st ฯลฯ) ต้อง verify ใหม่ก่อนใช้
3. **npm audit findings เป็นข้อมูล ณ 2026-08-27** — time-sensitive, ต้อง regenerate ณ release
4. **ราคา $79/$199 เป็น proposal ที่ไม่มี owner อนุมัติ** — อย่านำไปใช้เป็น fact ใน council นี้
5. **จุดที่อาจมี dissent กับ lens อื่น:** lens เทคนิคอาจเห็นว่า "reference server 13/13 tests ผ่าน = พร้อม" — แต่จากมุมธุรกิจ tests ผ่าน ≠ สินค้าขายได้; ต้องมี buyer lock, license, clean-install, fulfillment, support boundary ครบก่อน
