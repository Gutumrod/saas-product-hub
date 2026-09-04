# CM01 Product Owner Brief

Gate Verdict: REMEDIATE

## 1. สรุปปัญหาที่ Council เข้าใจ

CM01 คือ React UI template/module สำหรับจัดการเคส claim/case แบบ local-first และ Thai-first ขายเป็น source code ให้ frontend developer หรือ web agency เอาไปฝังในงานลูกค้า ไม่ใช่ SaaS ที่ deploy แล้วใช้ได้ทันที ไม่ใช่ backend module และไม่ใช่ feature ของ BK01

V1 จบที่ template tier ที่ใช้งาน workflow ได้ครบในเครื่อง/browser เดียว: เปิดเคส ค้นหา ดูรายละเอียด ปิด/เปิดเคสใหม่ ดูประวัติ และลบเคสปิดแล้วตาม retention แบบ manual ยังไม่รวม auth, backend, Supabase, Module Hub, multi-user sync, notification, file upload, hosted widget หรือ deployment

## 2. ข้อเท็จจริงที่ยืนยันแล้ว

- ตัวตนสินค้า: local-first Thai-first React case-management UI template/module. สนับสนุน 3/3
- Buyer: frontend developer / web agency. สนับสนุน 3/3
- End user: เจ้าหน้าที่ดูแลเคส role เดียว ไม่มี auth ตาม design. สนับสนุน 3/3
- V1 มี 3 หน้า: intake, ticket detail/action, history/retention. สนับสนุน 3/3
- localStorage เป็น adapter เดียวตอนนี้ และมี `TicketRepository` เป็น boundary สำหรับอนาคต. สนับสนุน 3/3
- Backend ไม่จำเป็นสำหรับ V1 template; เป็น post-V1. สนับสนุน 3/3
- ต้องแยก CM01 ออกจาก BK01 และ Module Hub `ticket-tracker`. สนับสนุน 3/3
- Code baseline ถูก report ว่า complete และ green: 63 unit/integration, 28 Chromium E2E, typecheck, build, HEAD `6202108`, main clean == origin/main. สนับสนุน 3/3
- ราคา `$39`, `$129`, `THB 350/mo` เป็น proposal ใน working draft ไม่ใช่ราคาที่อนุมัติแล้ว. สนับสนุน 3/3
- ยังมี debt ก่อนขาย source product: lint disabled, E2E ไม่อยู่ใน CI, npm audit advisory, license/secret/SAST ยัง disabled รอ decision. สนับสนุน 3/3

## 3. Consensus / Majority / Dissent

Consensus 3/3:

- ล็อก CM01 เป็น source-code UI template/module สำหรับ dev/agency
- ไม่ merge กับ BK01, TT01, หรือ Module Hub `ticket-tracker`
- Backend adapter ไม่ใช่ V1 gate
- งานที่เหลือก่อนขายคือ packaging, docs, license, hardening ไม่ใช่ feature build
- Product Gate ห้าม approve pricing
- Demand ยังไม่ validate
- MIT license ขัดกับ paid single-use model ต้องเคลียร์ก่อนขาย

Majority 2/3:

- A และ C เน้นว่า V1 คือ sellable single-use template tier; B เห็นด้วยกับ source-product V1 แต่ระวังไม่ endorse tier/price เพราะเป็น proposal
- A และ C บอกว่า packaging + hardening เป็นงานสั้นกว่า feature build; B เห็นด้วยเชิงสาระ แต่ย้ำว่า PRD scope complete แล้ว

Dissent / emphasis 1/3:

- B เท่านั้นที่ชี้ว่า adapter swap ตอนนี้ยังต้องแก้ source ใน `App.tsx` ไม่ใช่ config prop
- B เท่านั้นที่ชี้ timezone caveat และชื่อ theme `super-admin` เป็น buyer-facing caveat
- B ให้ confidence 86 สูงกว่า A/C ที่ 78 เพราะ evidence เรื่อง identity แข็งกว่า แต่ทุกคนยังยอมรับ commercial/legal gaps

## 4. หลักฐานที่ยังขาด / คำถามที่ยังไม่จบ

- ยังไม่มีหลักฐาน buyer demand, sale, channel หรือ market research
- ยังไม่ตัดสิน license strategy ระหว่าง MIT กับ paid single-use
- ราคาทั้งหมดเป็น proposal ยังไม่ approved
- revenue draft ยังพูดขัดกันเอง: จะขาย template แต่บอกว่ายังต้องมี backend ก่อนถึงจะมากกว่า demo
- ยังไม่เลือก post-V1 adapter direction: Supabase/REST หรือ Module Hub `ticket-tracker`
- Module Hub scan ยัง HOLD ห้าม revive ใน gate นี้
- ยังขาด buyer onboarding docs: embed guide, adapter guide, limitation, package manifest, support boundary
- tooling/security gates ยังไม่จบ: lint, E2E-in-CI, dependency audit, license audit, secret scan, SAST, cross-browser

## 5. คำแนะนำของ Synthesizer

ให้ verdict เป็น REMEDIATE

ล็อก product direction ได้แล้ว: CM01 คือ Thai-first local-first React source template/module สำหรับ dev/agency buyer และ V1 ไม่ต้องมี backend แต่ยังไม่ควรปล่อยไปเป็น sellable package จนกว่า owner จะตัดสิน license, demand threshold, positioning, docs, hardening และ adapter direction ให้ชัด

## 6. ทำไมถึงแนะนำแบบนี้

ไม่ควร BLOCK เพราะผู้เชี่ยวชาญ 3/3 เห็นตรงกันว่าตัวตนสินค้า ผู้ซื้อ และ V1 boundary ชัดแล้ว

แต่ยังไม่ควร PASS เพราะถ้าเดินขายทันทีจะชนเรื่อง license, demand ที่ยังไม่ prove, positioning ที่ขัดกัน, buyer docs ที่ยังไม่พอ และ tooling/security debt ของ source product

## 7. ทางเลือกที่ไม่เลือก + เหตุผล

- ไม่เลือกทำเป็น deployable SaaS: ขัดกับ PRD/README/registry และต้องเพิ่ม backend/auth/tenancy นอก V1. สนับสนุน 3/3
- ไม่เลือก merge เข้า BK01: owner decision แยก product family และ BK01 มี native full-stack ticket system เอง. สนับสนุน 3/3
- ไม่เลือก merge/bundle กับ Module Hub `ticket-tracker`: scan ยัง HOLD และตัวนั้นเป็น backend-only ไม่ใช่ drop-in. สนับสนุน 3/3
- ไม่เลือกบังคับ backend เป็น V1: local-first template ใช้งาน V1 ได้แล้ว. สนับสนุน 3/3
- ไม่เลือก approve pricing ใน gate นี้: ตัวเลขยังเป็น proposal. สนับสนุน 3/3

## 8. Gate Verdict + Blockers

Gate Verdict: REMEDIATE

Build-approval blockers:

- ต้องตัดสิน license/EULA ให้เข้ากับ paid source distribution
- ต้องตัดสินว่าจะ require buyer validation แค่ไหนก่อน packaging/launch
- ต้องแก้ positioning ไม่ให้พูดขัดกันระหว่าง "usable V1 template" กับ "ยังเป็น demo ถ้าไม่มี backend"
- ต้อง approve limitation language: localStorage-only, no auth, no backend, no deployment, no multi-user sync, Chromium-only E2E
- ต้องตัดสิน tooling/security gates หรือ accepted-risk ledger
- ต้องทำ buyer onboarding pack ให้พอสำหรับคนซื้อ source code

Launch blockers:

- license/EULA final
- buyer-facing docs final
- pricing ต้องผ่าน Business/Market หรือ owner decision ที่ถูก gate
- source package ต้องผ่าน hardening gates หรือมี risk acceptance ชัด
- backend integration claim ต้องตรงกับ implementation จริง

## 9. Confidence

Confidence: 81/100

เหตุผล: identity, buyer, V1 boundary, และ separation มี consensus 3/3 ชัดมาก แต่ความมั่นใจถูกกดลงเพราะ demand, license, pricing/package, docs, tooling/security ยังไม่จบ

## 10. Technical Document Pack

- `D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\CM01\PRODUCT-SYNTHESIS.md`
- `D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\CM01\PRODUCT-SOURCE-OF-TRUTH.md`
- `D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\CM01\PRODUCT-SCOPE.md`
- `D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\CM01\USER-FLOWS.md`
- `D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\CM01\BUSINESS-RULES.md`
- `D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\CM01\V1-ACCEPTANCE-CRITERIA.md`
- `D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\CM01\OPEN-DECISIONS.md`
- `D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\CM01\01-PRODUCT-OWNER-BRIEF.md`

## 11. REQUIRED Owner Decision Cards

### OD-001 License Strategy

Decision: จะขาย source code แบบ paid single-use อย่างไรเมื่อ repo เป็น MIT

Options:

- A (Recommended): ทำ commercial EULA หรือ dual-license สำหรับ sale package ก่อนขาย
- B: คง MIT แล้วขาย convenience/support โดยยอมรับ redistribution risk
- C: ยังไม่ขายจนกว่าจะ legal/licensing review เสร็จ

Council support: 3/3 เห็นว่า contradiction นี้จริงและต้อง resolve ก่อน sale

### OD-002 Buyer Demand Threshold

Decision: ต้องมีหลักฐาน demand แค่ไหนก่อนลงทุน packaging/launch

Options:

- A (Recommended): validate กับ dev/agency buyer จริงแบบ lightweight ก่อน launch
- B: ทำ package ขายเป็น experiment ต้นทุนต่ำ และยอมรับ risk
- C: รอ Business/Market Gate ก่อนทำ commercial work

Council support: 3/3 เห็นว่า demand ยังไม่ validate และเป็น risk ใหญ่

### OD-003 Product Positioning

Decision: จะอธิบาย CM01 ยังไงไม่ให้ขัดกันเอง

Options:

- A (Recommended): วางเป็น usable local-first source template พร้อม BYO-backend roadmap
- B: วางเป็น demo/template เท่านั้นจนกว่าจะมี backend adapter
- C: วางเป็น agency/backend-ready หลังทำ adapter แล้วเท่านั้น

Council support: 3/3 เห็นว่า backend ไม่ต้องเป็น V1; 3/3 เห็นว่า revenue draft tension ต้องแก้

### OD-004 Backend Adapter Direction

Decision: ถ้าจะทำ post-V1 adapter จะเลือกทางไหน

Options:

- A (Recommended): defer จนมี buyer demand และเข้า Architecture Gate
- B: Supabase/REST adapter ตาม PRD roadmap
- C: สำรวจ Module Hub `ticket-tracker` หลัง Module Hub scan ถูก release เท่านั้น

Council support: 3/3 ว่า backend เป็น post-V1; 3/3 ว่า Module Hub scan HOLD; 3/3 ว่า `ticket-tracker` ไม่ใช่ drop-in ตอนนี้

### OD-005 Hardening Gates

Decision: ก่อนขาย source package ต้องผ่าน check อะไร

Options:

- A (Recommended): remediate หรือ risk-accept lint, E2E-in-CI, dependency audit, license audit, secret scan, SAST, cross-browser claims
- B: ship พร้อม limitation และ accepted-risk ledger
- C: block packaging จนทุก check automate ครบ

Council support: 3/3 เห็นว่า gaps เหล่านี้มีจริงและกระทบ source-product readiness

### OD-006 Buyer Onboarding Pack

Decision: เอกสารสำหรับ buyer V1 ต้องมีอะไรบ้าง

Options:

- A (Recommended): embed guide, adapter guide, theme guide, limitations, distribution manifest, support boundary
- B: ใช้ README อย่างเดียวและยอมรับ support/refund risk
- C: รอ full docs + independent review ก่อนขาย

Council support: 3/3 เห็นว่า docs/onboarding ยังไม่พอ

### OD-007 Repository Injection Claim

Decision: จะพูดเรื่อง adapter integration ยังไง

Options:

- A (Recommended): บอกตรง ๆ ว่าตอนนี้ adapter swap เป็น source-code integration ไม่ใช่ config-level injection
- B: เพิ่ม repository prop/config ก่อนขาย
- C: เลี่ยง backend-adapter claim ทั้งหมดใน V1

Council support: 1/3 explicit emphasis; ไม่มี dissent
