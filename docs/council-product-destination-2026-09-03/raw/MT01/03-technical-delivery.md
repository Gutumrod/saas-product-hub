# MT01 Multi-Tenant AI Starter Kit — Technical/Delivery Lens (Round 1)

**Lens:** Technical/Delivery — implementation reality, dependency cost, reusable capability fit, risk, distance to V1
**Date:** 2026-09-03
**Evidence basis:** อ่านไฟล์จริงใน repo + git state + diff กับ canonical Module Hub + รัน test suite จริง (ไม่เชื่อ CURRENT_STATUS.md ตามลำพัง)

---

## 0. Executive Verdict

**VERIFIED** — Repo นี้เป็น **source-product / reference server** ที่พิสูจน์ว่า 7 modules ประกอบกันได้จริง (test 13/13 ผ่านจริงบนเครื่อง) แต่ **ยังไม่ใช่ sellable V1** และ **ไม่ใช่ production-ready** ตามที่ BRIEF.md/README ระบุเอง

**VERIFIED** — มี **version drift กับ canonical Module Hub** ใน 4 จาก 7 modules (ai-provider, tenant-context, auth-supabase, subscription) — copy เก่ากว่า hub โดยเฉพาะ subscription ที่ขาด billing-core Phase 0 fix (grace period / past_due / durable eventId claim) ซึ่ง hub merge ไปแล้ว 2026-08-29

**INFERENCE** — ระยะห่างถึง sellable V1 ≈ งาน productization 1 รอบ (L0-L5 ladder ตาม CURRENT_STATUS.md) + งาน engineering หลัก 3 ชิ้น (real DB adapter, auth UI/frontend, OTel exporter) + เอกสาร/license/clean-install proof ยังไม่มีเลย

**DISSENT/UNCERTAINTY:** BRIEF.md นับ modules แค่ 6 ตัว แต่ repo มี 7 (webhook-receiver ไม่ถูกนับใน BRIEF) — ต้องตัดสินใจว่า webhook-receiver เป็น "included capability" หรือ "implementation detail" ก่อนตั้งราคา/สัญญา

---

## 1. Git State (cross-check CURRENT_STATUS.md)

| รายการ | ผล | Label |
|---|---|---|
| branch | master | VERIFIED (`git branch`) |
| HEAD | 92139cf (`92139cfa4697fbade1a023d76dc4734dd82d5862`) | VERIFIED (`git rev-parse HEAD`) |
| docs/ | untracked (`?? docs/`) | VERIFIED (`git status --short`) |
| CURRENT_STATUS.md `$branch`/`$head` | **placeholder ยังไม่ถูกแทนที่** (บรรทัด 4-5) | VERIFIED (read_file) |
| Commit history | 5 commits: 8600384 scaffold → ce9ceb9 enterprise-features → 3247b41 reference server → ef821f6 webhook-receiver+subscription fixes → 92139cf webhook middleware order | VERIFIED (`git log`) |
| node_modules | gitignored ทั้งหมด (`.gitignore`: node_modules/, dist/) — ไม่มี node_modules ใน git | VERIFIED |
| modules/subscription/node_modules (49MB) | อยู่บน disk แต่ถูก gitignore — ไม่ปนเข้า repo | VERIFIED |

**หมายเหตุ:** CURRENT_STATUS.md ระบุ "master @ 92139cf" ถูกต้อง แต่ placeholder `$branch`/`$head` ใน header ยัง unresolved — เอกสารนี้ยังไม่พร้อมเป็น release artifact (และยังไม่ commit ด้วยซ้ำ)

---

## 2. สิ่งที่ Built จริง (implementation reality)

### 2.1 Reference server (`server/`) — VERIFIED
- Express 4 + TypeScript strict + ESM, deps จริงแค่ 2 ตัว: `express ^4.19.2`, `@supabase/supabase-js ^2.45.4` (VERIFIED — package.json)
- Routes ครบ: `/health`, `/whoami`, `/me`, `/ai/demo`, `/subscription/subscribe`, `/subscription/status`, `/payment/demo-charge`, `/payment/webhook` (VERIFIED — app.ts)
- **Webhook middleware order fix ถูกต้องจริง**: `/payment/webhook` mount ก่อน global `express.json()` ด้วย `express.raw()` — แก้บั๊ก rawBody ว่าง (VERIFIED — app.ts บรรทัด 21-27)
- **handleBillingEvent wiring จริง**: verified event → `mapStripeEventToBilling()` → `subscriptionCore.handleBillingEvent()` (VERIFIED — payment-demo.ts บรรทัด 232-235)
- **Replay handling ถูกต้อง**: replay ตอบ 200 `{received:true, duplicate:true}` ไม่ใช่ 401 (VERIFIED — payment-demo.ts บรรทัด 208-211) — ตรงกับที่ STAGE3_EVIDENCE_REPORT.md อ้าง
- **Test suite ผ่านจริง**: `npx vitest run` → 13/13 passed (webhook 4 + server 9) — VERIFIED (รันเองบนเครื่อง)
- **In-memory mock repos ชัดเจน**: `createMockSubscriptionRepository`, `createMockPlanRepository`, `processedEvents = new Set<string>()` (VERIFIED — subscriptions.ts, payment-demo.ts) — comment ในโค้ดระบุเองว่า persistent store จำเป็นสำหรับ multi-instance
- **Graceful degradation**: ไม่มี env → server boot ได้, route ตอบ 503 (VERIFIED — supabase.ts, auth.ts, ai.ts, payments.ts)

### 2.2 Modules (7 ตัว ไม่ใช่ 6 ตาม BRIEF) — VERIFIED
| Module | Version (copy) | Tests | สถานะ |
|---|---|---|---|
| tenant-context | 0.1.0 (VERSION file: 0.2.0) | 14 | built |
| ai-provider | 0.1.0 (VERSION file: 0.2.0) | 8 | built |
| subscription | 0.1.0 | 14 | built |
| payment | 0.1.0 | 17 | built |
| auth-supabase | 0.1.0 | 23 | built |
| enterprise-features | 0.3.0 | 10 | built |
| **webhook-receiver** | 0.1.0 | 136 | **built แต่ BRIEF.md ไม่นับ** |

**VERIFIED** — BRIEF.md (บรรทัด 5-11) ระบุ 6 modules ไม่มี webhook-receiver แต่ `modules/` มี 7 ตัว และ server ใช้ webhook-receiver จริง (payment-demo.ts import `createWebhookReceiver`, `StripeWebhookVerifier`)

### 2.3 สิ่งที่ยังขาด (missing) — VERIFIED (ไม่มีไฟล์/โค้ดดังกล่าวใน repo)
- **Real database adapter** — ไม่มี (มีแต่ mock repos)
- **Auth UI / frontend** — ไม่มี (server เป็น backend-only; README ระบุเองว่าผู้ซื้อต้องทำ)
- **OTel exporter** — ไม่มี (มีแต่ MemoryTracer/NoopTracer; BRIEF.md ระบุเอง)
- **LICENSE file** — ไม่มี (find license → ว่าง)
- **Root README** — ไม่มี (มีแค่ BRIEF.md + server/README.md)
- **CI / deployment config** — ไม่มี
- **Clean-install proof** — ไม่มีหลักฐานว่า `npm install && npm run dev` ผ่านบนเครื่องสะอาด (server มี package-lock.json แต่ modules ไม่มี lock file)
- **Module-level lock files** — modules ไม่มี package-lock.json (มีแค่ server/)

### 2.4 สิ่งที่อาจไม่จำเป็น (potential bloat) — INFERENCE
- **`/payment/demo-charge`** — เป็น demo ของ Stripe charge ที่ไม่มี checkout flow จริง (ไม่มี customer creation, ไม่มี payment link) — คุณค่าเป็นแค่ "พิสูจน์ว่า payment module ต่อได้" ซึ่ง webhook flow พิสูจน์ได้อยู่แล้ว
- **`/whoami`** — ซ้ำซ้อนกับ `/me` (ทั้งคู่คืน tenant context; `/me` เพิ่ม auth) — ใช้เป็น smoke test ได้แต่ไม่ใช่ capability ที่ขายได้
- **`enterprise-features` (CircuitBreaker + Tracer)** — เป็น framework-agnostic contract ที่ไม่มี OTel adapter — ถ้าขาย "distributed tracing" ต้องเขียน adapter ฝั่ง host ก่อน (BRIEF.md ระบุเอง) — ณ ตอนนี้เป็น **optional-include** ไม่ใช่ core selling point

---

## 3. Production Readiness — VERDICT: **NO**

**VERIFIED** — Reference server **ไม่ใช่ production-ready**:
1. In-memory mock repos → data หายเมื่อ restart, ไม่ scale multi-instance
2. In-memory idempotency Set → replay dedupe พังเมื่อมี >1 instance (comment ในโค้ดยอมรับเอง)
3. ไม่มี real DB, ไม่มี auth UI, ไม่มี OTel exporter, ไม่มี secret management, ไม่มี deployment pipeline
4. `express.json()` global + raw webhook — ถูกต้องสำหรับ demo แต่ไม่มี rate limiting, body size limit tuning, logging middleware
5. ไม่มี error tracking / observability นอกเหนือจาก MemoryTracer (ซึ่งไม่ export ไปไหน)

**VERIFIED** — ทุกฝ่าย (BRIEF.md บรรทัด 19, server/README.md บรรทัด 5 และ 78-83, CURRENT_STATUS.md บรรทัด 15) ระบุตรงกันว่าไม่ใช่ production — ไม่มี overclaim ในเอกสาร

---

## 4. Distance to Sellable V1

**INFERENCE** (จาก evidence ข้างต้น) — งานที่ต้องทำก่อนขาย แบ่งเป็น 2 กลุ่ม:

### 4.1 Engineering (งานโค้ดจริง)
| งาน | ขนาด (INFERENCE) | หมายเหตุ |
|---|---|---|
| Real DB adapter (Postgres/Supabase/Drizzle) แทน mock repos | กลาง | ต้องเขียน adapter ตาม interface ที่ module กำหนด — interface มีอยู่แล้ว |
| Auth UI / frontend (login, tenant switcher, checkout) | ใหญ่ | งาน frontend ทั้งชิ้น — ยังไม่มีอะไรเลย |
| OTel exporter (ถ้าขาย tracing) | เล็ก-กลาง | ต้องเขียน adapter ฝั่ง host |
| Persistent idempotency store | เล็ก | แทน Set ด้วย DB-backed store |
| Deployment guide + CI | เล็ก-กลาง | เอกสาร + config |

### 4.2 Productization (งานเอกสาร/กฎหมาย — ยังเป็น 0 ทั้งหมด)
- License/IP proof (ไม่มี LICENSE file เลย — VERIFIED)
- Clean-install proof (ไม่มีหลักฐาน)
- Configuration guide (มี .env.example + README บางส่วน — เริ่มมีแล้ว)
- Documentation (มี handoff 4 รอบ + README — ดีสำหรับ dev แต่ไม่ใช่ docs สำหรับ buyer)
- Support/update policy

**INFERENCE** — ระยะห่าง ≈ **1 sprint งาน productization + 1-2 sprints งาน engineering** (ถ้า scope V1 = backend + demo frontend) ขึ้นกับว่า V1 รวม frontend หรือไม่

---

## 5. Clean-Install / Configuration / License-IP / Documentation Proof ที่ต้องมีก่อนขาย

| หมวด | สิ่งที่ต้องมี | สถานะปัจจุบัน | Label |
|---|---|---|---|
| Clean-install | `npm install && npm run dev` ผ่านบนเครื่องสะอาด (ไม่มี node_modules) | **UNVERIFIED** — ไม่มีหลักฐาน; modules ไม่มี lock file | UNVERIFIED |
| Clean-install | Module-level package-lock.json | **ขาด** | VERIFIED |
| Configuration | `.env.example` ครบ 7 ตัวแปร + README อธิบาย | **มีแล้ว** | VERIFIED |
| Configuration | เอกสาร "buyer ต้องมีบัญชีอะไรเอง" (Supabase/Stripe/AI providers) | **มีแล้ว** (README บรรทัด 61) | VERIFIED |
| License/IP | LICENSE file + provenance ของ 7 modules (ก็อปจาก Module Hub) | **ขาดทั้งหมด** | VERIFIED |
| License/IP | ตรวจว่า modules ที่ก็อปมามี license อนุญาตให้ redistribute ใน product ขายได้หรือไม่ | **UNVERIFIED** — ต้องตรวจกับ Module Hub governance | UNVERIFIED |
| Documentation | Root README (ภาพรวม product, architecture, quickstart) | **ขาด** (มีแค่ BRIEF.md ซึ่งเป็น internal doc) | VERIFIED |
| Documentation | Buyer-facing docs (setup, deploy, customize) | **ขาด** | VERIFIED |
| Documentation | CURRENT_STATUS.md placeholder `$branch`/`$head` แก้ + commit docs/ | **ยังไม่ทำ** | VERIFIED |

---

## 6. Support/Update Burden ของ One-Time Model

**INFERENCE** — โมเดล one-time (ขายครั้งเดียว ไม่มี recurring) สร้างภาระต่อเนื่องจริง เพราะ:

1. **Modules เป็น source copy ไม่ใช่ npm dependency** — buyer ไม่ได้ update อัตโนมัติ; seller ต้อง maintain copy ใน product นี้แยกจาก hub ตลอดไป (เห็นแล้วว่าวันนี้ drift ไปแล้ว 4/7 modules)
2. **External API churn** — Stripe API version, Supabase breaking changes, OpenAI/Anthropic/Gemini SDK/model changes — buyer ที่ซื้อ one-time จะกลับมาหา seller เมื่อของพัง
3. **Version drift เป็นหลักฐานของภาระนี้แล้ว** — hub มี billing-core Phase 0 fix (2026-08-29) ที่ copy ใน product นี้ไม่มี (VERIFIED — diff จริง) — ถ้าขายวันนี้ buyer จะได้ subscription engine ที่ไม่มี grace period/past_due handling
4. **ไม่มี support channel/contract กำหนด** — "one-time" ที่ไม่มี SLA หมายถึง ad-hoc support requests ที่ไม่มีที่สิ้นสุด

**RECOMMENDATION** — ถ้าจะขาย one-time ต้อง (ก) ตั้งราคารวม support window จำกัด (เช่น 90 วัน) อย่างชัดเจนในสัญญา หรือ (ข) ขายเป็น license + optional maintenance retainer — ไม่ใช่ "จ่ายครั้งเดียวจบ" แบบไม่มีคำนิยาม

---

## 7. Essential Differentiation vs Bundle Bloat

**INFERENCE** (จาก evidence: อะไรที่ module ทำได้จริงและยากที่จะทำเอง)

### Essential (differentiation จริง)
| Capability | เหตุผล | Label |
|---|---|---|
| **tenant-context** (typed immutable context + header resolver) | หัวใจของ multi-tenant — เป็นสิ่งที่ buyer ต้องได้จาก starter kit | VERIFIED (module มีจริง, server ใช้จริง) |
| **subscription + payment + webhook-receiver** (entitlement engine + Stripe + verified webhook → billing event) | วงจร billing ครบ: subscribe → charge → webhook → entitlement — นี่คือ "AI SaaS" ที่ขายได้ | VERIFIED (server ต่อครบวงจร, test ผ่าน) |
| **ai-provider** (unified interface 3 providers) | ลด vendor lock-in — buyer เปลี่ยน provider ได้ | VERIFIED (module มีจริง) |
| **auth-supabase** (RBAC/RLS + tenant access guard) | จำเป็นสำหรับ multi-tenant security | VERIFIED (module มีจริง) |

### Bundle bloat / optional
| Capability | เหตุผล | Label |
|---|---|---|
| **enterprise-features (CircuitBreaker + Tracer)** | ยังไม่มี OTel adapter — ขาย "resiliency/tracing" ยังไม่จริง; เป็น optional-include ตาม BRIEF.md เอง | VERIFIED (BRIEF.md บรรทัด 15) |
| **webhook-receiver (136 tests, 4 providers)** | เป็น module ที่ robust มาก แต่ BRIEF ไม่นับ — ถ้ารวมต้องประกาศเป็น feature; ถ้าไม่รวมก็เป็น internal dependency | VERIFIED (module มีจริง, BRIEF ไม่นับ) |
| **demo routes** (`/whoami`, `/payment/demo-charge`) | เป็น proof-of-composition ไม่ใช่ product feature | INFERENCE |

---

## 8. Module Provenance vs Canonical Module Hub (เปรียบเทียบเท่านั้น — ไม่แก้ทั้งสองฝั่ง)

**Canonical:** `D:\AI-Workspace\projects\modules-hub` @ 7ed23ad (branch docs/daily-work-brief-2026-08-31)

| Module | Copy version | Hub version | Diff จริง (VERIFIED — `diff -rq`) | ความหมาย |
|---|---|---|---|---|
| enterprise-features | 0.3.0 | 0.3.0 | **core ไม่ต่าง** | ✅ sync |
| webhook-receiver | 0.1.0 | 0.1.0 | **core ไม่ต่าง** | ✅ sync |
| payment | 0.1.0 | 0.1.0 | error.ts/types.ts ต่าง — hub มี `INVALID_PAYMENT_REQUEST` เพิ่ม | ⚠️ copy เก่ากว่าเล็กน้อย |
| auth-supabase | 0.1.0 | 0.2.0 | DESIGN/MODULE/VERSION/package.json ต่าง | ⚠️ copy เก่ากว่า 1 minor |
| ai-provider | 0.1.0 (VERSION: 0.2.0) | 0.3.0 | **copy ขาด `core/fallback.ts`** (provider fallback chain) | ⚠️ copy เก่ากว่า 2 minor — ขาด capability |
| tenant-context | 0.1.0 (VERSION: 0.2.0) | 0.3.0 | **copy ขาด `core/manager.ts`**, types.ts/index.ts ต่าง | ⚠️ copy เก่ากว่า 2 minor — ขาด capability |
| subscription | 0.1.0 | 0.1.0 | **engine/service/repository/types ต่างกันมาก** — hub มี `past_due`/`grace_period` status, grace deadline check, durable eventId claim (billing-core Phase 0, merge 2026-08-29) | ⚠️⚠️ **copy ขาด billing fix สำคัญที่สุด** |

**VERIFIED** — VERSION files ใน copy (ai-provider 0.2.0, tenant-context 0.2.0) ไม่ตรงกับ package.json (0.1.0) — ตัว copy เองมี internal inconsistency ระหว่าง VERSION file กับ package.json

**INFERENCE** — นัยต่อ productization:
1. ถ้าขายวันนี้ buyer จะได้ subscription engine ที่ไม่มี grace period/past_due handling และ ai-provider ที่ไม่มี fallback chain — เทียบกับ hub ที่เป็น "canonical" แล้ว product นี้ขายของที่เก่ากว่า
2. ต้องมี process "re-sync modules from hub ก่อน packaging" เป็น gate ใน L0-L5 ladder
3. ต้องตัดสินใจ governance: modules ใน product นี้เป็น fork (จะ drift ต่อไป) หรือ mirror (ต้อง sync ทุกครั้งก่อน release)

---

## 9. Dependency Cost

**VERIFIED** — runtime deps ของ server น้อยมาก (express + supabase-js) — ดี
**VERIFIED** — modules ทั้ง 7 ไม่มี runtime dependencies เลย (devDeps แค่ typescript/vitest) — framework-agnostic จริง
**INFERENCE** — dependency cost ต่ำในแง่ npm แต่สูงในแง่ **maintenance** (ดูข้อ 6): buyer ต้อง maintain การ integrate กับ 3 AI providers + Stripe + Supabase เอง

---

## 10. Risk Register

| Risk | ระดับ | Label |
|---|---|---|
| ขาย subscription engine ที่ขาด billing fix (grace/past_due) → buyer เจอ bug เรื่อง billing | **สูง** | INFERENCE (จาก diff จริง) |
| One-time model + source copy → support requests ไม่สิ้นสุด | **สูง** | INFERENCE |
| License/IP ไม่ชัด (ไม่มี LICENSE, provenance ไม่ documented) → ขายต่อไม่ได้ตามกฎหมาย | **สูง** | INFERENCE (จาก absence ของ LICENSE) |
| docs/ ยัง untracked + placeholder ยังไม่แก้ → release artifact ไม่สะอาด | กลาง | VERIFIED |
| VERSION file vs package.json ไม่ตรงกันใน copy → สับสนเรื่องเวอร์ชัน | กลาง | VERIFIED |
| ไม่มี clean-install proof → buyer ติดตั้งไม่ได้ตอนแรก impression เสีย | กลาง | UNVERIFIED (ยังไม่เคยทดสอบ) |

---

## 11. Final Verdict

**VERDICT: DEFER TO P5 (productization) — ตรงกับ CURRENT_STATUS.md** แต่เพิ่มเงื่อนไขทางเทคนิค:

1. **ก่อน packaging ต้อง re-sync modules จาก hub** (โดยเฉพาะ subscription, ai-provider, tenant-context) — ขายของที่เก่ากว่า canonical ไม่ได้
2. **V1 scope ต้องนิยามให้ชัด**: backend-only reference (ขายเป็น "architecture blueprint") หรือ full-stack (ต้องทำ frontend) — ราคา/สัญญาต่างกันมาก
3. **License/IP proof เป็น gate แรก** — ยังไม่มี LICENSE เลย
4. **webhook-receiver ต้องถูกนับเป็น module ที่ 7** ใน BRIEF/สัญญา — ตอนนี้ BRIEF นับ 6
5. **One-time model ต้องมี support window นิยามชัด** ในสัญญา

**จุดแข็งทางเทคนิคที่ควรขาย:** วงจร billing ครบ (subscribe → Stripe charge → verified webhook → entitlement) พิสูจน์ด้วย test จริง 13/13 — นี่คือ differentiation ที่จับต้องได้

**จุดอ่อนที่ต้องแก้ก่อนขาย:** version drift, ไม่มี license, ไม่มี clean-install proof, ไม่มี frontend, tracing ขายไม่ได้จนกว่าจะมี OTel adapter

---

## Appendix: Evidence Checklist

| หลักฐาน | ผล |
|---|---|
| `git rev-parse HEAD` | 92139cfa4697fbade1a023d76dc4734dd82d5862 ✅ |
| `git status --short` | `?? docs/` ✅ |
| `npx vitest run` (server) | 13/13 passed ✅ |
| `diff -rq modules/*/core` vs hub | drift 4/7 modules ✅ |
| `find . -iname "*license*"` | ว่าง ✅ |
| BRIEF.md | 6 modules, ไม่นับ webhook-receiver ✅ |
| server/README.md | ยอมรับไม่ใช่ production ✅ |
| CURRENT_STATUS.md | placeholder `$branch`/`$head` unresolved ✅ |
