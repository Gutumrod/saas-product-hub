# LK01 WSTERA Link - Product Owner Brief

Gate: Product Gate only  
Procedure: `llm-council-gate` v0.3.2  
ผลตัดสิน Gate: **REMEDIATE**

## 1. สรุปปัญหาที่ Council เข้าใจ

WSTERA Link คือ SaaS สำหรับทำ branded campaign link และเก็บ first-party outbound click attribution ให้คนขายของไทย/ครีเอเตอร์/แอดมินเพจ/เอเจนซี่/SMB โดยเฉพาะคนที่ปล่อยลิงก์ผ่าน Facebook, LINE, TikTok, Shopee/Lazada affiliate และ QR ที่พิมพ์ออกไปแล้ว

แก่นปัญหาคือ ลิงก์หรือ QR ที่ปล่อยไปแล้วแก้ปลายทางยาก และเจ้าของร้านไม่รู้จากข้อมูลของตัวเองว่าช่องทางไหนส่งคลิกออกไปจริงก่อนคนออกจากช่องทางของเรา

Product นี้ไม่ใช่ generic URL shortener. หัวใจคือ "ลิงก์/QR เดิมยังใช้ได้ เปลี่ยนปลายทางได้ และเห็น attribution ว่าคลิกมาจากช่องทางไหน"

## 2. ข้อเท็จจริงที่ยืนยันแล้ว

- Product identity คือ branded campaign-link + first-party outbound click attribution ไม่ใช่ URL shortener ทั่วไป. Support: 3/3.
- Primary user แรกคือคนขายของไทยที่ใช้ Facebook, LINE, TikTok, Shopee/Lazada affiliate และ QR/สื่อพิมพ์. Support: 3/3.
- Core value loop คือสร้างลิงก์/QR คงที่, กระจายลิงก์, วัดคลิกตาม source/channel, แล้วเปลี่ยน destination ได้โดยไม่ต้องเปลี่ยนลิงก์/QR. Support: 3/3.
- V1 ที่เล็กที่สุดแต่ยังปลอดภัยต่อ hot path คือ tenant/auth/RLS + link core/redirect + analytics/quota. Support: 3/3.
- Redirect ที่ resolve ได้ต้องไม่พังเพราะ analytics, billing, หรือ dashboard ล่ม. Support: 3/3.
- Minimum analytics คือ tracked clicks, source breakdown จาก UTM/referrer/direct, trend/date range, quota behavior, bot filtering แบบ deterministic. Support: 3/3.
- V1 ห้าม claim unique visitors, raw IP analytics, fingerprinting, ad-platform parity, cross-device identity. Support: 3/3.
- Quota เต็มแล้ว redirect ต้องยังทำงาน แต่อาจหยุด/ดรอป analytics ได้. Support: 3/3.
- Billing ต้องอิง centralized billing-core ไม่ใช่ product-owned Stripe state machine. Support: 3/3.
- PromptPay ห้าม launch ก่อนมี reconciliation กับ provider truth. Support: 3/3.
- Custom domain, campaign/UTM builder, export, API/webhook, team เป็น Phase 5/non-V1 โดย default. Support: 3/3.
- Module ที่ vendored มาไม่ใช่หลักฐานว่าต้องเป็น V1 scope. Support: 3/3.
- SU01 ห้าม revive เป็น product destination. Support: 3/3.
- ราคาและ quota ที่มีอยู่เป็น input ที่ล็อกไว้แล้ว ไม่ใช่เรื่องที่ Product Gate นี้ตัดสินใหม่. Support: 3/3.

## 3. Consensus / Majority / Dissent

Consensus 3/3:

- Council เห็นตรงกันว่า LK01 ควรเป็น branded campaign-link + first-party attribution สำหรับตลาดไทย
- เห็นตรงกันว่า V1 ต้องพิสูจน์ loop เปลี่ยนปลายทาง + วัด source attribution
- เห็นตรงกันว่า analytics ต้องพอใช้ แต่ต้องไม่ overclaim เป็น web analytics หรือ ad pixel replacement
- เห็นตรงกันว่า redirect reliability สำคัญกว่า analytics completeness
- เห็นตรงกันว่า paid features Phase 5 ไม่ควรถูกดึงเข้า V1 โดยอัตโนมัติ
- เห็นตรงกันว่า PromptPay/billing correctness เป็น risk ใหญ่และต้องมี preflight

Majority 2/3:

- 2/3 มองว่า V1 product core คือ Phases 1-3 และ Phase 4 เป็น monetization gate
- 1/3 มองว่า V1 build core ควรรวม Phase 4 เพราะถ้าจะขายจริงต้องมี billing

Dissent / emphasis 1/3:

- 1/3 เน้นว่ากฎ Free "แก้ destination ได้ 1 ครั้งตลอดอายุ link" อาจกระทบ promise หลัก ควร monitor หรือให้ Owner ยืนยัน
- 1/3 เน้น evidence repo/head/clean-tree มากกว่า แต่ไม่ได้ขัด product conclusion
- 1/3 เน้น classification ของ module plumbing มากกว่า แต่ไม่ได้ขัด product conclusion

Confidence ของ candidates: A 78/100, B 88/100, C 78/100.

## 4. หลักฐานที่ยังขาด / คำถามที่ยังไม่จบ

- Stripe Thailand / PromptPay preflight ยังไม่ครบ: account eligibility, API version, card + PromptPay test flow, reconciliation, idempotency. Support ว่ายังไม่จบ: 3/3.
- V1 paid-launch cut ยังไม่ล็อกชัดว่ารอบขายแรกจะมีแค่ billing/higher limits หรือดึง custom domain/campaign/export/API/team เข้ามา. Support ว่ายังไม่จบ: 3/3.
- Custom domain โดยเฉพาะ apex domain ยังไม่ควร promise จนกว่าจะ re-verify Cloudflare. Support ว่ายังไม่จบ: 3/3.
- Bot filter / abuse threshold สำหรับ public redirect ยังไม่มีตัวเลข/ขอบเขตพอ. Support ว่ายังไม่จบ: 3/3.
- Retention/deletion policy ของ analytics detail, aggregate, downgrade visibility, audit/security records ยังไม่ล็อก. Support ว่ายังไม่จบ: 3/3.
- Redirect SLO ยังถูก defer ไป Beta measurement ยังไม่มี target ชัด. Support ว่ายังไม่จบ: 3/3.
- Billing-core entitlement snapshot/reconciliation contract ยังอยู่นอก LK01 และต้องปิดใน shared gate. Support ว่ายังไม่จบ: 3/3.

## 5. คำแนะนำของ Synthesizer

ให้ผล Product Gate เป็น **REMEDIATE**

แปลตรง ๆ คือ product direction ผ่านในสาระหลัก แต่เอกสารยังไม่ควรถูกนับเป็น build-approved source of truth จนกว่า Owner จะล็อก decision ที่กระทบ scope/build/launch ก่อน

## 6. ทำไมถึงแนะนำแบบนี้

ให้ PASS ตอนนี้จะ overstate readiness เพราะ candidates ทั้งสามเห็นตรงกันว่ามี decision ที่ยังไม่จบและมีผลต่อ product boundary จริง เช่น paid launch cut, PromptPay, custom domain, retention, abuse และ SLO

ให้ BLOCK ก็แรงเกิน เพราะไม่ได้มี expert contradiction และ product identity/V1 core ชัดมากแล้ว

ดังนั้น REMEDIATE ถูกสุด: รับ product thesis แต่ต้องปิด decision cards ก่อนเอาไปใช้เป็นฐาน build approval

## 7. ทางเลือกที่ไม่เลือก + เหตุผล

- ไม่เลือก PASS: เพราะ unresolved Owner decisions ยังเยอะพอจะกระทบ build/launch promise. Support: 3/3.
- ไม่เลือก BLOCK: เพราะ candidates converge สูง ไม่มีเหตุผลให้หยุด product direction. Support: 3/3.
- ไม่เลือก generic URL shortener: เพราะผิด identity ที่ล็อกไว้. Support: 3/3.
- ไม่เลือก revive SU01: brief/manifest ห้ามชัด. Support: 3/3.
- ไม่เลือกดึง Phase 5 paid features เข้า V1 default: เพราะเสี่ยง scope creep และขัด roadmap. Support: 3/3.
- ไม่เลือกให้ PromptPay launch ก่อน reconciliation: money correctness risk สูง. Support: 3/3.

## 8. Gate Verdict + Blockers

Gate Verdict: **REMEDIATE**

Build-approval blockers:

- Owner ต้องล็อกว่า V1 product core ใช้ภาษา Phases 1-3 หรือรวม Phase 4 ใน V1 build-core language
- Owner ต้องล็อก paid-launch feature cut
- Owner ต้องล็อก PromptPay/Stripe preflight rule
- Owner ต้องล็อก bot-filter/abuse-control boundary
- Owner ต้องล็อก retention/deletion policy ขั้นต่ำ

Launch blockers:

- PromptPay ห้าม launch จนกว่า reconciliation จะ verified
- Custom domain ห้าม launch จนกว่า Cloudflare/DNS/TLS/apex behavior จะ re-verified
- ห้าม claim redirect SLO, ad-platform parity, unique visitors, identity resolution โดยไม่มี evidence และ ADR
- Production launch ต้องผ่าน later gates เรื่อง tenant isolation, redirect safety, quota behavior, bot filtering, retention/deletion

## 9. Confidence

**81/100**

เหตุผล: identity, primary segment, V1 core, non-goals, analytics minimum และ module boundary ได้ support 3/3 ชัด แต่ลดคะแนนเพราะทั้งหมดยังเป็น doc/pre-build evidence และยังมี owner decisions หลายข้อที่ต้องล็อกก่อน PASS

## 10. Technical Document Pack

- `D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\LK01\PRODUCT-SYNTHESIS.md`
- `D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\LK01\PRODUCT-SOURCE-OF-TRUTH.md`
- `D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\LK01\PRODUCT-SCOPE.md`
- `D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\LK01\USER-FLOWS.md`
- `D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\LK01\BUSINESS-RULES.md`
- `D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\LK01\V1-ACCEPTANCE-CRITERIA.md`
- `D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\LK01\OPEN-DECISIONS.md`
- `D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\LK01\01-PRODUCT-OWNER-BRIEF.md`

## 11. REQUIRED Owner Decision Cards

### OD-001 - V1 Build-Core Boundary

Decision: จะเขียน V1 build approval ว่า Phases 1-3 หรือรวม Phase 4 billing ด้วย

Options:

- A (Recommended): V1 product core = Phases 1-3; Phase 4 billing = monetization gate ก่อน paid launch
- B: V1 build core = Phases 1-4 เพราะจะขายจริงต้องมี billing
- C: แยก Free V1 กับ Paid V1 เป็น gate language คนละชุด

Council support: 3/3 เห็นว่าต้องล็อกเรื่องนี้; 2/3 หนุน Phases 1-3 เป็น smallest V1 product core

### OD-002 - First Paid-Launch Feature Cut

Decision: paid launch แรกจะมี feature อะไรบ้าง

Options:

- A (Recommended): ไม่เอา Phase 5 paid features เข้า V1 core; paid launch แรกมี billing/higher limits เท่านั้น เว้นแต่มี ADR ใหม่
- B: เพิ่ม custom domain เข้า paid launch แรก
- C: เพิ่ม custom domain + campaign/UTM + export + API/webhook + team

Council support: 3/3 เห็นว่า Phase 5 เป็น non-V1 default และต้องให้ Owner confirm

### OD-003 - Stripe Thailand / PromptPay Preflight

Decision: rule ก่อน billing ถือว่า launchable

Options:

- A (Recommended): PromptPay ห้าม launch จนกว่า Stripe Thailand eligibility, pinned API version, card/PromptPay test flow และ provider-truth reconciliation จะ verified
- B: Launch card ก่อน และ disable PromptPay จนกว่า reconciliation verified
- C: เปิด PromptPay ก่อนด้วย manual ops reconciliation

Council support: 3/3 หนุน mandatory preflight และ reconciliation ก่อน PromptPay release

### OD-004 - Custom-Domain / Apex Promise

Decision: จะ promise custom domain แบบไหนก่อน Phase 5 verification

Options:

- A (Recommended): ยังไม่ promise apex; promise เฉพาะ behavior ที่ verify แล้วหลัง Cloudflare re-check ใน Phase 5
- B: promise subdomain เท่านั้น
- C: promise apex + subdomain ตั้งแต่ตอนนี้

Council support: 3/3 เห็นว่า custom-domain/apex ยัง unresolved และต้อง re-verify

### OD-005 - Bot Filter / Abuse Threshold

Decision: public redirect จะกัน bot/spam/abuse ด้วย boundary แรกแบบไหน

Options:

- A (Recommended): ตั้ง conservative initial thresholds สำหรับ bot filtering, unsafe destination, edit-rate limit, moderation แล้ว refine ใน Beta
- B: defer threshold ทั้งหมดไป implementation
- C: ใช้ generic rate limit อย่างเดียว

Council support: 3/3 เห็นว่า bot/abuse thresholds ยัง unresolved และเป็น risk จริง

### OD-006 - Analytics Retention / Deletion

Decision: ข้อมูล analytics ที่หมด plan visibility/downgrade จะ hide, delete, aggregate หรือ retain ยังไง

Options:

- A (Recommended): ล็อก policy แยก detail retention, aggregate retention, downgrade visibility, deletion job, audit/security retention ก่อน Product Gate PASS
- B: hide data เกิน plan ก่อน แล้วค่อยตัดสิน deletion ทีหลัง
- C: เก็บ detail/aggregate ไม่มีกำหนดจนกว่าผู้ใช้ลบ tenant

Council support: 3/3 เห็นว่า retention/deletion ยัง unresolved

### OD-007 - Redirect SLO

Decision: V1 จะ promise redirect performance ยังไง

Options:

- A (Recommended): Public SLO รอ Beta measurement แต่ตั้ง internal provisional engineering budget สำหรับ Phase 2 verification
- B: defer SLO ทั้งหมดไป Beta
- C: lock public latency/availability SLO ตอนนี้

Council support: 3/3 เห็นว่า redirect SLO ยัง unresolved/deferred

### OD-008 - Free Destination Change Limit

Decision: กฎ Free "แก้ destination ได้ 1 ครั้งตลอดอายุ link" จะคงไว้ไหม

Options:

- A (Recommended): คงค่าที่ล็อกไว้สำหรับ V1, monitor Beta, ถ้าจะเปลี่ยนต้อง ADR
- B: เปลี่ยนเป็นแก้ได้ 1 ครั้งต่อเดือน
- C: เอา limit ออก

Council support: 1/3 ยกเป็น concern ชัด; 3/3 ไม่ได้คัดค้าน locked current rule
