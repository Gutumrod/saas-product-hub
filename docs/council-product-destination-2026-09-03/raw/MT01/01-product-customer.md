# MT01 Multi-Tenant AI Starter Kit — Product/Customer Lens (Round 1)

**Lens:** Product/Customer — user, buyer, pain, workflow, adoption, willingness to pay
**Date:** 2026-09-03
**Evidence basis:** อ่านไฟล์จริงใน repo (BRIEF.md, docs/CURRENT_STATUS.md, server/README.md, ROUND1-4_HANDOFF.md, STAGE3_EVIDENCE_REPORT.md, server/package.json, server/src/*, modules/*) + git state จริง (branch master, HEAD 92139cf, `?? docs/`) + รัน test suite จริง (13/13 passed, typecheck clean) + เอกสาร portfolio ระดับ hub (REVENUE-STRATEGY.md, docs/products/registry.yaml, docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md, HANDOFF.md)

**กฎ:** ทุก claim ติด label VERIFIED / INFERENCE / UNVERIFIED / RECOMMENDATION. ไม่มีหลักฐาน = UNKNOWN/UNVERIFIED. ไม่เชื่อ CURRENT_STATUS.md ตามลำพัง — cross-check กับ git แล้ว (branch master ✅, HEAD 92139cf ✅, docs/ untracked ✅, placeholder `$branch`/`$head` ยัง unresolved ✅)

---

## 0. Executive Verdict (Product/Customer)

**VERDICT: ยังขายไม่ได้ในวันนี้ — และยังไม่มีหลักฐานว่า "มีคนจะซื้อ"**

- **VERIFIED** — สิ่งที่ built จริงคือ **reference implementation / architecture starter** (7 modules + Express reference server, in-memory mocks, 13/13 tests ผ่านจริง) ไม่ใช่ production-ready boilerplate และไม่ใช่ sellable artifact
- **VERIFIED** — ไม่มีหลักฐาน demand จริงแม้ชิ้นเดียว: ไม่มี buyer interview, ไม่มี market research, ไม่มี competitor scan, ไม่มี sale, ไม่มี waitlist ใน repo หรือเอกสาร portfolio
- **VERIFIED** — เอกสารทุกฉบับ (BRIEF.md, server/README.md, CURRENT_STATUS.md, registry.yaml, master plan) ระบุตรงกันว่าไม่ใช่ production และ productization ยังไม่เริ่ม (deferred ถึง P5)
- **INFERENCE** — สิ่งเดียวที่ "ขายได้จริง" ณ วันนี้คือ **architecture blueprint + reusable source bundle** ให้ dev ที่อยากประหยัดเวลา 2-4 สัปดาห์ในการประกอบ multi-tenant AI backend — แต่ราคา/ความเต็มใจจ่ายยังเป็น UNVERIFIED ทั้งหมด
- **DISSENT/UNCERTAINTY:** registry.yaml ระบุ `commercial_status: "sellable"` แต่ acceptance flags ระบุ `commercial: false, support: false` และ BRIEF.md ระบุเองว่า "ยังต้องประเมิน commercial readiness ก่อนตั้งราคา/สัญญาลูกค้า" — registry กับ product เองขัดแย้งกัน ต้อง resolve ก่อน council สรุป

---

## 1. ปัญหาที่แก้ และแก้ให้ใคร (Problem & Who)

### 1.1 ปัญหาที่ product นี้ตั้งใจแก้

| Claim | Label | หลักฐาน |
|---|---|---|
| Product ตั้งใจแก้ปัญหา "การประกอบ multi-tenant AI SaaS backend ตั้งแต่ศูนย์ใช้เวลานาน" — tenant isolation, quota/entitlement, billing, provider abstraction ต้องต่อเองทั้งหมด | INFERENCE | ไม่มี statement เรื่อง pain โดยตรงใน repo; อนุมานจากสิ่งที่ modules/server สร้างจริง (tenant-context, subscription, payment, ai-provider) และ tagline ใน registry "Boilerplate สำหรับสร้างเว็บแอป AI รองรับหลาย Tenant และจำกัด Quota" |
| วงจรที่พิสูจน์แล้วว่าทำงานจริง: subscribe → Stripe charge → verified webhook → entitlement update (test 13/13 ผ่านจริง, webhook signature verify + replay dedupe + handleBillingEvent ต่อครบ) | VERIFIED | server/src/app.ts, payment-demo.ts, STAGE3_EVIDENCE_REPORT.md, รัน vitest เอง 13/13 passed |
| ปัญหาที่ product นี้ **ไม่ได้** แก้: real database, auth UI/frontend, deployment, monitoring, OTel exporter, secret management — buyer ต้องทำเองทั้งหมด | VERIFIED | server/README.md บรรทัด 5, 78-83; BRIEF.md บรรทัด 19; ไม่มีโค้ดดังกล่าวใน repo |

### 1.2 แก้ให้ใคร (ผู้ใช้/ผู้ซื้อ)

| Claim | Label | หลักฐาน |
|---|---|---|
| สมมติฐาน buyer เพียงชิ้นเดียวใน repo: "dev ที่จะสร้าง AI SaaS ของตัวเอง, ขายเป็น boilerplate" — อยู่ใน TODO ของ BRIEF.md ยังไม่ถูก lock | VERIFIED | BRIEF.md บรรทัด 22: `- [ ] ลูกค้าเป้าหมาย (dev ที่จะสร้าง AI SaaS ของตัวเอง, ขายเป็น boilerplate)` |
| REVENUE-STRATEGY.md ระบุ target audience: "SaaS Builders, Tech SMEs, AI Indie Hackers" | VERIFIED | REVENUE-STRATEGY.md บรรทัด 98 |
| ไม่มีหลักฐานว่า segment ไหนจ่ายจริง: ไม่มี buyer interview, ไม่มี market research, ไม่มี competitor scan, ไม่มี sale history ใน repo/portfolio | VERIFIED | search ทั่ว repo + portfolio docs ไม่พบหลักฐาน demand |
| ใครคือ "real buyer" ระหว่าง indie SaaS builder / agency / internal tech SME | **UNVERIFIED** | มีแค่สมมติฐาน 2 แหล่ง (BRIEF TODO + REVENUE-STRATEGY) ที่ไม่ตรงกันเป๊ะ (BRIEF พูด dev ทั่วไป, REVENUE-STRATEGY พูด 3 segments) และไม่มีหลักฐานยืนยันทั้งคู่ |

**ข้อสังเกต Product lens:** ราคาที่เสนอ ($79/$199) และโมเดล one-time source license ชี้ไปทาง **indie dev / agency** มากกว่า internal SME (internal SME ซื้อ service ไม่ใช่ซื้อ source code) — แต่เป็น INFERENCE จากราคา ไม่ใช่จากหลักฐาน buyer จริง

---

## 2. ผู้ซื้อซื้ออะไรกันแน่ (Artifact Definition)

| Claim | Label | หลักฐาน |
|---|---|---|
| Registry กำหนด delivery model: `one_time_source_product`, deployment: `source_product` (External / Self-hosted) | VERIFIED | registry.yaml บรรทัด 240, 246 |
| REVENUE-STRATEGY กำหนด: "downloadable codebase / developer boilerplate", "One-Time License / Source Code", "no multi-tenant hosting, no custom domain, no production database management, zero ongoing server operational costs" | VERIFIED | REVENUE-STRATEGY.md บรรทัด 56-58 |
| Master plan กำหนด target: "complete self-hostable multi-tenant AI starter kit sold as a versioned source product" และสั่งให้ **แก้ registry ที่อ้าง "production-ready boilerplate"** จนกว่า gates ผ่าน | VERIFIED | PORTFOLIO_PRODUCTION_MASTER_PLAN.md บรรทัด 703, 709 |
| สิ่งที่ buyer จะได้จริงวันนี้ (ถ้าขาย): 7 modules (source copy) + reference server + README + .env.example — **ไม่มี** LICENSE, ไม่มี buyer docs, ไม่มี clean-install proof, ไม่มี packaging/versioning | VERIFIED | repo tree, find license = ว่าง, ไม่มี root README, docs/ ยัง untracked |

**สรุป artifact (INFERENCE จากหลักฐานข้างต้น):** สิ่งที่ buyer ซื้อจริงคือ **"reusable source bundle + reference implementation ที่พิสูจน์ว่า modules ประกอบกันได้"** — ไม่ใช่ production-ready boilerplate (registry เองถูกสั่งให้เลิกอ้างคำนี้), ไม่ใช่ hosted service, ไม่ใช่ turnkey app

**ประเด็น Product lens ที่ต้องตัดสินใจก่อนขาย (RECOMMENDATION):**
1. ขายเป็น **backend-only architecture starter** (ราคาต่ำ, buyer ต้องทำ frontend/DB เอง) หรือ **full-stack starter** (ต้อง build frontend + real DB adapter ก่อน — งานใหญ่กว่า 2-3 เท่า) — master plan MT-B/MT-E บอกว่าต้องมี real DB + deployment kit ก่อนขาย หมายถึง V1 ที่ "usable" ต้องมีอย่างน้อย real DB adapter
2. ต้องประกาศชัดว่า **webhook-receiver เป็น module ที่ 7** (BRIEF นับ 6, registry นับ 7 แล้ว) — buyer ที่ซื้อ "6 modules" แล้วเจอ module ที่ 7 ในโค้ดจะสับสน; buyer ที่ซื้อ "7 modules" ต้องได้ docs ครบ

---

## 3. Minimum V1 Finish Line (ขายได้ + ใช้ได้)

### 3.1 นิยาม V1 ที่ binding (VERIFIED)

| Gate | เนื้อหา | สถานะ MT01 วันนี้ |
|---|---|---|
| **L0** Buyer & scope lock | ใครซื้อ, สร้างอะไรได้, อะไร ship, อะไรไม่ ship — เขียนและ current | **FAIL** — BRIEF.md TODO ยังไม่ lock buyer/scope |
| **L1** Clean-install proof | คนที่ไม่เคยเขียนโค้ด clone ลงเครื่องสะอาด, ทำตาม docs ที่ ship เท่านั้น, ถึงสถานะ running/passing โดยไม่ต้องเข้าถึง repo/secret ภายใน WSTERA | **FAIL** — ไม่มีหลักฐาน; modules ไม่มี lock file |
| **L2** License & IP | license ของตัวเอง + buyer terms + dependency-license audit ว่าไม่มีอะไรห้าม redistribute | **FAIL** — ไม่มี LICENSE file เลย; master plan ระบุเอง "MT01 and HC01 do not [have licenses]" |
| **L3** Packaging & versioning | immutable tag, changelog, checksum, SBOM, compatibility matrix, update policy | **FAIL** — ไม่มีอะไรเลย |
| **L4** Fulfillment path | buyer จ่ายเงินแล้วได้รับ artifact จริง (tested end-to-end รวม failed/repeated delivery) | **FAIL** — ไม่มี checkout/fulfillment |
| **L5** Support boundary | อะไร support, อะไรไม่ support, response commitment — ประกาศก่อนขาย | **FAIL** — ไม่มี |

(ที่มา: PORTFOLIO_PRODUCTION_MASTER_PLAN.md บรรทัด 328-344 — VERIFIED; สถานะ FAIL เป็น VERIFIED จาก absence ของหลักฐานใน repo)

### 3.2 งาน engineering ขั้นต่ำที่ทำให้ "usable" (INFERENCE จาก master plan MT-A..MT-F)

- **MT-B**: เปลี่ยน in-memory mock repos → real DB adapter + migrations + clean install command (master plan กำหนดเอง — ไม่ใช่แค่ความเห็น lens นี้)
- **MT-C**: tenant/RLS denial suite, provider-key custody, rate limits, audit logging
- **MT-D**: retry policy, provider failover, usage accounting, request correlation
- **MT-E**: dependency audit remediation, pin deps, deployment path
- **MT-F**: license, docs, examples, API contract, changelog, checksum, SBOM, buyer acceptance suite

**Product lens สรุป (INFERENCE):** V1 ที่ "ขายได้ + ใช้ได้" = **L0-L5 ครบ + real DB adapter + buyer docs + license** — งาน productization 1 รอบ (L0-L5) + engineering หลัก 3 ชิ้น (real DB, deployment kit, buyer package) ตาม master plan เอง ระยะห่างไม่ใช่ "1-2 วัน" ตาม REVENUE-STRATEGY (บรรทัด 63) — REVENUE-STRATEGY นับแค่ packaging/distribution ไม่นับงานที่ master plan กำหนดไว้

---

## 4. Essential Differentiation vs Bundle Bloat (จากมุม buyer)

### 4.1 สิ่งที่ buyer จ่ายแล้วได้ของจริง (VERIFIED — module มีจริง, server ใช้จริง, test ผ่าน)

| Capability | ทำไม essential | Label |
|---|---|---|
| **วงจร billing ครบ** (subscription entitlement + Stripe charge + verified webhook → billing event → entitlement update) | นี่คือ "AI SaaS ที่ขาย quota ได้" — ต่อครบวงจรจริง, replay-safe, signature-verified — ยากและแพงที่จะทำเอง | VERIFIED |
| **tenant-context** (typed immutable context + header resolver) | หัวใจของ multi-tenant — buyer ต้องได้จาก starter kit ไม่ใช่เขียนเอง | VERIFIED |
| **auth-supabase** (RBAC + tenant access guard) | multi-tenant security — จำเป็น | VERIFIED |
| **ai-provider** (unified interface 3 providers) | ลด vendor lock-in — เปลี่ยน OpenAI/Anthropic/Gemini ได้จาก config | VERIFIED |

### 4.2 สิ่งที่ buyer จ่ายแล้วยังขายไม่ได้ / เป็น bloat (VERIFIED/INFERENCE)

| Capability | เหตุผล | Label |
|---|---|---|
| **enterprise-features (CircuitBreaker + Tracer)** | ไม่มี OTel adapter — ขาย "distributed tracing" ไม่ได้จนกว่าจะเขียน adapter ฝั่ง host; BRIEF.md ระบุเองว่าเป็น optional-include | VERIFIED (BRIEF.md บรรทัด 15) |
| **webhook-receiver** | module แข็งแรงจริง (136 tests, real HMAC verify) แต่ BRIEF ไม่นับเป็น module — ถ้ารวมขายต้องประกาศ + ให้ docs; ถ้าไม่รวมก็เป็น internal dependency | VERIFIED (module มีจริง, BRIEF นับ 6) |
| **demo routes** (`/whoami`, `/payment/demo-charge`) | เป็น proof-of-composition ไม่ใช่ feature ที่ buyer ใช้ — เก็บไว้เป็นตัวอย่างได้ แต่ห้ามนับเป็น capability ในสัญญา | INFERENCE |
| **ai-provider fallback chain** | copy ใน product นี้ **ขาด** `core/fallback.ts` ที่ hub มี (v0.3.0) — ถ้าขาย "provider failover" ต้อง sync ก่อน | VERIFIED (diff กับ hub; technical lens ยืนยัน) |
| **subscription billing fixes** | copy ขาด grace period / past_due / durable eventId claim ที่ hub merge แล้ว 2026-08-29 — ขายวันนี้ buyer ได้ engine ที่เก่ากว่า canonical | VERIFIED (diff กับ hub) |

**Product lens สรุป (INFERENCE):** minimum module set ที่ขายได้ = **tenant-context + auth-supabase + ai-provider + subscription + payment + webhook-receiver** (6 ตัว) — enterprise-features เป็น optional add-on ที่ต้องมี OTel adapter ก่อนถึงจะคิดเงินเพิ่ม; demo routes ไม่นับ

---

## 5. Adoption & Workflow (buyer ใช้ยังไง)

| Claim | Label | หลักฐาน |
|---|---|---|
| Buyer workflow ตามที่ README ออกแบบ: clone → `npm install` → `npm run dev` → ใส่ .env ของตัวเอง (Supabase/Stripe/AI keys) → ทดสอบ routes | VERIFIED | server/README.md "Getting Started" + .env.example |
| ทุก API credential เป็นของ buyer เอง ไม่ใช่ service ที่ kit ให้ | VERIFIED | server/README.md บรรทัด 61 |
| Buyer ต้องมีบัญชีภายนอกอย่างน้อย: Supabase (auth), Stripe (billing), AI provider 1 ตัว — 3 บัญชีขึ้นไปก่อนจะเห็นของทำงานครบวงจร | VERIFIED | .env.example 7 ตัวแปร, README ตาราง config |
| **Adoption friction สูง**: ไม่มี frontend → buyer ต้องเขียน auth UI + tenant switcher + checkout UI เองทั้งหมด; ไม่มี real DB → ข้อมูลหายเมื่อ restart | VERIFIED | server/README.md บรรทัด 81-83; in-memory mock repos ในโค้ด |
| ไม่มีหลักฐานว่า buyer กลุ่มไหน "ติด" หรือใช้ต่อ — ไม่มี adoption data, ไม่มี user, ไม่มี issue tracker จาก buyer | UNVERIFIED | ไม่พบหลักฐานใน repo/portfolio |

**Product lens สรุป (INFERENCE):** adoption path ที่สมจริง = buyer ที่เป็น dev ระดับกลาง-สูงที่เข้าใจ multi-tenant + billing อยู่แล้ว และอยากได้ blueprint ไปต่อยอด — ไม่ใช่ buyer ที่อยากได้ "ของที่รันได้เลย" เพราะ friction ยังสูง (ต้องทำ frontend + DB เอง)

---

## 6. Willingness to Pay (ความเต็มใจจ่าย)

| Claim | Label | หลักฐาน |
|---|---|---|
| ราคาที่เสนอ: $79 Standard / $199 Extended (one-time) + Option C $99/yr maintenance pass | VERIFIED (เป็น proposal) | REVENUE-STRATEGY.md บรรทัด 98, 111-118 |
| ราคานี้ **ยังไม่ได้รับการอนุมัติ** — BRIEF.md ระบุ "โมเดลราคา" อยู่ใน TODO และ "ยังต้องประเมิน commercial readiness ก่อนตั้งราคา/สัญญาลูกค้า" | VERIFIED | BRIEF.md บรรทัด 3, 24 |
| ไม่มีหลักฐานความเต็มใจจ่าย: ไม่มี sale, ไม่มี price test, ไม่มี comparable marketplace data (Gumroad/CodeCanyon) ใน repo | UNVERIFIED | ไม่พบหลักฐาน |
| **One-time model สร้างภาระ support จริง** (จากมุม buyer/seller): modules เป็น source copy ไม่ใช่ npm dep → buyer ไม่ได้ update อัตโนมัติ; external API churn (Stripe/Supabase/AI providers) → buyer กลับมาหา seller เมื่อของพัง; version drift 4/7 modules กับ hub เป็นหลักฐานว่าภาระนี้เกิดจริงแล้ว | VERIFIED (drift) + INFERENCE (ภาระ) | diff กับ hub; technical lens ยืนยัน drift |

**Product lens สรุป (INFERENCE):**
- $79/$199 อยู่ในช่วงราคา plausible ของ dev boilerplate ตลาด (เทียบ CM01 $39/$129 ใน REVENUE-STRATEGY เอง) — แต่ **ไม่มีหลักฐานว่า segment นี้จะจ่าย** สำหรับของที่ต้องทำ frontend + DB เอง
- ราคา $79 ต้อง cover: license + support window + update promise — ถ้าไม่มี support boundary (L5) ราคานี้จะกลายเป็นหนี้สิน (ad-hoc support ไม่รู้จบ)
- **RECOMMENDATION:** ถ้าจะขาย one-time ต้อง (ก) ตั้งราคารวม support window จำกัด (เช่น 90 วัน) อย่างชัดเจน หรือ (ข) ขาย license + optional maintenance retainer — ตรงกับ technical lens

---

## 7. Clean-Install / Configuration / License-IP / Documentation Proof ก่อนขาย

| หมวด | สิ่งที่ต้องมี | สถานะ | Label |
|---|---|---|---|
| Clean-install | `npm install && npm run dev` ผ่านบนเครื่องสะอาด (คนไม่เคยเขียนโค้ด, ไม่เข้าถึง WSTERA secrets) | **ไม่มีหลักฐาน** | UNVERIFIED |
| Clean-install | module-level package-lock.json (มีแค่ server/) | **ขาด** | VERIFIED |
| Configuration | .env.example ครบ 7 ตัวแปร + README อธิบาย + "buyer ต้องมีบัญชีอะไรเอง" | **มีแล้ว** | VERIFIED |
| Configuration | เอกสาร setup/deploy/customize สำหรับ buyer (ไม่ใช่ handoff สำหรับ dev ภายใน) | **ขาด** | VERIFIED |
| License/IP | LICENSE file + buyer-facing terms | **ขาดทั้งหมด** | VERIFIED |
| License/IP | dependency-license audit ว่า modules ที่ก็อปจาก Module Hub อนุญาต redistribute ใน product ขายได้ | **UNVERIFIED** — ต้องตรวจกับ Module Hub governance | UNVERIFIED |
| License/IP | provenance ของ 7 modules (ก็อปจากไหน, version ไหน, sync กับ hub ยังไง) | **ขาด** — VERSION file กับ package.json ไม่ตรงกันใน copy (ai-provider 0.2.0 vs 0.1.0, tenant-context 0.2.0 vs 0.1.0) | VERIFIED |
| Documentation | Root README (ภาพรวม product, architecture, quickstart) | **ขาด** (มีแค่ BRIEF.md ซึ่งเป็น internal doc) | VERIFIED |
| Documentation | CURRENT_STATUS.md placeholder `$branch`/`$head` แก้ + commit docs/ | **ยังไม่ทำ** (docs/ untracked) | VERIFIED |
| Documentation | API contract / changelog / checksum / SBOM (L3) | **ขาด** | VERIFIED |

---

## 8. Support/Update Burden ของ One-Time Model (มุม product)

**INFERENCE** (จากหลักฐาน drift + โครงสร้าง source copy):

1. **Source copy ≠ npm dependency** — seller ต้อง maintain copy ใน product นี้แยกจาก hub ตลอดไป; วันนี้ drift ไปแล้ว 4/7 modules (subscription ขาด billing fix สำคัญที่สุด)
2. **External API churn** — Stripe API version, Supabase breaking changes, AI provider SDK/model changes — buyer ที่ซื้อ one-time จะกลับมาเมื่อของพัง
3. **ไม่มี support channel/contract กำหนด** — "one-time" ที่ไม่มี SLA = ad-hoc support ไม่รู้จบ
4. **RECOMMENDATION:** ต้องมี (ก) support window ชัดเจนในสัญญา หรือ (ข) maintenance retainer ($99/yr ตาม REVENUE-STRATEGY Option C เป็นทางเลือกที่สมเหตุสมผล) — และต้องมี process "re-sync modules จาก hub ก่อน packaging" เป็น gate

---

## 9. ข้อขัดแย้งที่ council ต้อง resolve (Dissent/Uncertainty)

1. **registry.yaml ว่า "sellable" แต่ acceptance flags บอก commercial: false, support: false และ BRIEF.md บอกยังไม่ประเมิน commercial readiness** — registry กับ product เองขัดแย้งกัน (VERIFIED ทั้งคู่) — council ต้องตัดสินว่า "sellable" หมายถึงอะไร
2. **REVENUE-STRATEGY บอก gap เหลือ "1-2 วัน" (packaging เท่านั้น) แต่ master plan กำหนดงาน MT-A..MT-F + L0-L5 ครบ** — เอกสาร 2 ฉบับใน portfolio เดียวกันบอกระยะห่างไม่ตรงกัน (VERIFIED ทั้งคู่) — ฉบับหลัง (master plan, 2026-08-27) ใหม่กว่าและละเอียดกว่า ควรเป็น authority
3. **BRIEF นับ 6 modules, registry นับ 7 (webhook-receiver)** — ต้องประกาศให้ตรงกันก่อนตั้งราคา/สัญญา
4. **ไม่มีหลักฐาน demand จริง** — council ควรตั้งคำถามว่า "เราจะขายให้ใคร" ต้องมีคำตอบจาก evidence ไม่ใช่จากสมมติฐาน TODO

---

## 10. Final Verdict (Product/Customer)

**VERDICT: DEFER TO P5 — ตรงกับ CURRENT_STATUS.md และ master plan** แต่จากมุม product/customer:

1. **ยังไม่มี buyer ที่พิสูจน์แล้ว** — L0 (buyer & scope lock) เป็น gate แรกและยังไม่ผ่าน; BRIEF.md TODO ยังไม่ถูก lock
2. **Artifact ที่ขายได้จริง = reference implementation + reusable source bundle** — ต้องเลิกอ้าง "production-ready boilerplate" (master plan สั่งแล้ว) และต้องประกาศชัดว่า buyer ต้องทำ frontend/DB/deployment เอง
3. **V1 finish line = L0-L5 ครบ + real DB adapter + buyer docs + license** — งาน productization 1 รอบ + engineering หลัก 3 ชิ้น ไม่ใช่ "1-2 วัน"
4. **Essential differentiation = วงจร billing ครบ (subscribe → charge → verified webhook → entitlement)** — นี่คือของที่พิสูจน์แล้วด้วย test จริง และยาก/แพงที่จะทำเอง
5. **ก่อนขายต้องมี: license/IP proof (ไม่มีเลย), clean-install proof (ไม่มี), buyer docs (ไม่มี), module re-sync จาก hub (drift 4/7), support boundary (ไม่มี)**
6. **One-time economics ยัง credible ได้ ถ้า** ตั้งราคารวม support window หรือ maintenance retainer — แต่ราคา $79/$199 ยังเป็น proposal ไม่ใช่ approved pricing

**จุดแข็งที่ควรขาย (จากมุม buyer):** วงจร billing + multi-tenant security + provider abstraction ที่พิสูจน์ด้วย test จริง — นี่คือ "ของที่ dev ไม่อยากเขียนเอง"

**จุดอ่อนที่ฆ่าการขายถ้าไม่แก้:** ไม่มี license, ไม่มี clean-install proof, ขาย subscription engine ที่เก่ากว่า canonical (ขาด billing fix), ไม่มี buyer docs, registry กับ product ขัดแย้งกันเรื่อง "sellable"

---

## Appendix: Evidence Checklist

| หลักฐาน | ผล |
|---|---|
| `git rev-parse HEAD` | 92139cfa4697fbade1a023d76dc4734dd82d5862 ✅ |
| `git status --short` | `?? docs/` ✅ |
| `npx vitest run` (server) | 13/13 passed ✅ (รันเอง) |
| `npx tsc --noEmit` | clean ✅ (รันเอง) |
| `find . -iname "*license*"` | ว่าง ✅ |
| BRIEF.md | 6 modules, buyer = TODO, pricing = TODO ✅ |
| server/README.md | ยอมรับไม่ใช่ production, buyer ต้องทำ DB/frontend/OTel เอง ✅ |
| CURRENT_STATUS.md | placeholder `$branch`/`$head` unresolved, docs/ untracked ✅ |
| registry.yaml | delivery=one_time_source_product, commercial_status=sellable แต่ acceptance.commercial=false ✅ |
| REVENUE-STRATEGY.md | $79/$199 proposal, target = SaaS Builders/Tech SMEs/AI Indie Hackers ✅ |
| PORTFOLIO_PRODUCTION_MASTER_PLAN.md | L0-L5 ladder, MT01 fails L0/L2, P5-C1 = "installs and operates as a complete starter kit" ✅ |
| modules vs hub | drift 4/7 (subscription ขาด billing fix, ai-provider ขาด fallback, tenant-context ขาด manager) ✅ (technical lens diff ยืนยัน) |
| หลักฐาน demand จริง (interview/research/sale) | ไม่พบ ✅ |
