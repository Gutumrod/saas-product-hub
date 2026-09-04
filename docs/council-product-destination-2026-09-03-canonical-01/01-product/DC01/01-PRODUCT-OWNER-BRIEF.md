# DC01 DocCraft — Product Owner Brief

Gate status: REMEDIATE  
Procedure: llm-council-gate v0.3.2  
ผู้เชี่ยวชาญที่ส่งคำตอบครบ: 3/3  
สถานะ identity-blind: ไม่อ่าน mapping, ไม่อ่าน raw, ไม่ใช้ชื่อ expert  
ไฟล์ synthesis หลัก: PRODUCT-SYNTHESIS.md

## 1. รอบนี้ประชุมเรื่องอะไร

Verified fact: รอบนี้คือ Product Gate ของ DC01 DocCraft คำถามคือ DocCraft ควรเป็นอะไร ขาย/ทำให้ใคร และ V1 ที่พอเอาไป pilot/sellable ได้ควรจบตรงไหน

External blocker: รอบนี้ยังไม่ตัดสินราคา รายได้ คู่แข่ง Module Hub, Architecture, Build, Release, Merge, Deploy หรือ Portfolio Arbitration

## 2. สุดท้ายเสนอให้ทำอะไร

Recommendation: ให้ล็อกนิยาม DocCraft V1 เป็น:

DocCraft คือ no-login, browser-first Thai business-document studio สำหรับเจ้าของธุรกิจรายย่อยในไทย ที่ต้องทำใบเสนอราคา ใบแจ้งหนี้ ใบเสร็จ ใบงาน และใบกำกับภาษีแบบมีเงื่อนไข ให้เร็ว ถูกหลักภาษีไทยระดับเอกสาร และพิมพ์ A4 ได้ โดยไม่ต้องใช้ระบบบัญชีเต็มรูปแบบ

Recommendation: V1 จบที่ PRD acceptance gates ถึง Phase 6 เท่านั้น ยังไม่ใช่ระบบบัญชี ยังไม่ใช่ e-Tax/e-Receipt ยังไม่มี cloud/login/payment confirmation/billing/e-sign/AI/template designer

Gate status: REMEDIATE

ความหมายแบบภาษาคน: ทิศทาง product ตอบได้แล้ว แต่ยังไม่ควรบอกว่า PASS สะอาด เพราะต้องแก้/ล็อกถ้อยคำสำคัญก่อนส่งต่อ โดยเฉพาะ "ของปัจจุบันยังไม่ใช่ sellable V1", เรื่อง JSON backup ที่ซ่อนอยู่, และ decision ก่อน pilot

## 3. ทำไมถึงเลือกแบบนี้

Evidence: 3/3 expert เห็นตรงกันว่า core value คือทำเอกสารธุรกิจไทยให้เร็ว ถูกกว่า Word/Excel manual และไม่หนักเท่าระบบบัญชี

Evidence: 3/3 เห็นตรงกันว่า Thai tax correctness เป็น differentiator สำคัญ เช่น entityType ไม่เท่ากับ vatStatus, VAT/WHT/deposit/rounding ต้องชัด

Evidence: 3/3 เห็นตรงกันว่า V1 ต้องคุม scope แคบ ไม่ลากไปเป็น accounting/cloud/e-Tax/payment platform

Evidence: 3/3 บอกว่ายังไม่มี live-user evidence เรื่อง willingness to pay หรือ repeat usage เพราะฉะนั้น Product Gate ตอบ "ควรเป็นอะไร" ได้ แต่ยังตอบ "ตลาดจะซื้อไหม" ไม่ได้

## 4. ทุก expert เห็นตรงกันเรื่องอะไร พร้อม ratio

Consensus 3/3 among completed experts:

- DocCraft ควรเป็น Thai business-document studio ไม่ใช่ accounting software
- กลุ่มหลักคือ freelancer, ช่าง/contractor, ร้าน service, ร้านงานสั่งทำ, micro-SME ในไทย
- core loop คือเลือกเอกสาร -> กรอก -> เปิด/ปิด block -> ตรวจยอด -> Preview A4 -> Print
- V1 เป็น no-login/browser-first/local persistence/no backend
- Native print คือใช้ browser print dialog ไม่ใช่ PDF engine ของแอป
- ภาษีไทยเป็น business rule สำคัญ: entityType แยกจาก vatStatus, VAT/WHT/deposit/rounding ต้อง deterministic
- PromptPay เป็น payment instruction บนเอกสาร ไม่ใช่ payment gateway หรือระบบยืนยันการจ่าย
- Local storage เป็น autosave convenience ไม่ใช่ durable cloud backup
- ยังไม่มีหลักฐาน pilot/paid conversion/repeat usage/willingness to pay

## 5. เห็นต่างกันตรงไหน พร้อม ratio และผลกระทบ

Majority 2/3: V1 ที่ sellable ต้องจบที่ Phase 6 / PRD acceptance gates  
Minority/compatible 1/3: ยึด PRD V1 non-goal boundary เหมือนกัน แต่ไม่ได้เน้น Phase 6 เท่าอีกสองคน  
ผลกระทบ: ควรเขียนให้ชัดว่า current code ยังไม่ใช่ sellable V1 จนกว่า Phase 4.1, Phase 5, Phase 6 จะผ่าน

Majority 2/3: local-first เป็น implementation/delivery choice เป็นหลัก ช่วยให้ no-login, เริ่มเร็ว, ต้นทุนต่ำ  
Minority 1/3: local-first เป็นส่วนหนึ่งของ value proposition ได้  
ผลกระทบ: เวลาขาย/อธิบาย ควรพูดว่า "เริ่มใช้ได้ทันที ไม่ต้องสมัคร ข้อมูล draft อยู่ใน browser" แต่อย่าขายว่า backup ปลอดภัยถาวร

Minority evidence 1/3: มีความเสี่ยงว่าเอกสารบางชุดยังพูดเหมือน JSON backup เป็น user-facing backup ทั้งที่ decision ล่าสุดซ่อน JSON controls แล้ว  
ผลกระทบ: ก่อน public pilot/sales ต้อง reconcile messaging ไม่งั้น owner/support/sales อาจสัญญา feature ที่ผู้ใช้มองไม่เห็น

Minority emphasis 1/3: single-active-draft/no-history อาจทำให้ repeat usage ต่ำ ไม่ใช่เพราะตลาดไม่ต้องการ แต่เพราะ V1 ยังไม่มี history  
ผลกระทบ: ตอนอ่านผล pilot ต้องระวัง อย่าตัดสิน demand ผิดจากข้อจำกัด product

## 6. เรื่องเทคนิคสำคัญที่ Owner ควรเข้าใจ แบบภาษาคน

Verified fact: entityType กับ vatStatus เป็นคนละเรื่องกัน นิติบุคคลไม่ได้แปลว่าจด VAT เสมอ และบุคคลธรรมดาก็จด VAT ได้ ถ้าระบบผูกสองอันนี้ผิด เอกสารภาษีจะพัง

Verified fact: VAT ใช้เมื่อธุรกิจเป็น VAT registered และเปิด VAT เท่านั้น ไม่ใช่เดาจากประเภทกิจการ

Verified fact: WHT ต้องคิดจากรายการที่ eligible เท่านั้น และถ้ามีส่วนลดทั้งเอกสาร ต้องกระจายส่วนลดเข้า basis ให้ถูก ไม่งั้นยอดหัก ณ ที่จ่ายจะเพี้ยน

Verified fact: Tax invoice ต้อง lock จนกว่า VAT profile และ required fields ครบ แต่การ validate ในแอปไม่ใช่ legal certification

Verified fact: PromptPay QR ใน V1 คือคำสั่งให้ลูกค้าจ่าย ไม่ใช่ระบบรับเงิน ไม่รู้ว่าจ่ายแล้วหรือยัง ไม่ verify slip

Verified fact: Save as PDF เป็นความสามารถของ browser/OS print dialog ไม่ใช่ PDF generator ของ DocCraft

Verified fact: localStorage ช่วย autosave draft แต่ถ้าผู้ใช้ล้าง browser data, ใช้ private mode, เปลี่ยนเครื่อง หรือ browser policy ล้างข้อมูล draft หายได้

## 7. อะไรยังไม่รู้ / ยังไม่ตัดสิน

Unknown: segment ไหนเจ็บสุดและยอมจ่ายสุด

Unknown: ผู้ใช้จะยอมจ่ายให้ no-login local-first document studio โดยไม่มี cloud/history หรือไม่

Unknown: telemetry mode สำหรับ pilot จะใช้แบบไหน

Unknown: print fidelity นอก Chrome/Edge desktop จะดีพอไหม

Unknown: JSON import/export จะกลับมาเมื่อไหร่ กลับมาเป็น backup ฟรี เป็น paid feature หรือไม่กลับใน V1

Owner Decision: Phase 4.1 logo intake ยังต้องยืนยันขอบเขตก่อนทำ

External blocker: ราคา แพ็กเกจ รายได้ และ competitor positioning ต้องไป Business/Market Gate

## 8. ความเสี่ยงและกรณีพังสำคัญ

Risk: ประกาศว่า V1 พร้อมขายเร็วเกินไป ทั้งที่ Phase 4.1 logo, Phase 5 PromptPay, Phase 6 hardening ยังไม่เสร็จ

Risk: ผู้ใช้เข้าใจผิดว่า browser autosave คือ backup ถาวร แล้ว draft หายจากการล้าง browser data

Risk: messaging เรื่อง JSON backup ไม่ตรงกับของจริง เพราะ current decision คือซ่อน controls และไม่ถือเป็น V1 backup contract

Risk: ผู้ใช้คิดว่า tax invoice ที่ระบบ validate แล้วคือ legal/tax compliance certification

Risk: print output ต่างกันตาม browser/OS โดยเฉพาะนอก Chrome/Edge desktop

Risk: ไม่มี telemetry/measurement mode ทำให้ pilot วัด repeat usage และ funnel ไม่ได้

Risk: single active draft/no history อาจทำให้คนไม่กลับมาใช้ซ้ำ แม้ pain จริงมีอยู่

## 9. Gate status พร้อมคำแปลว่าหมายถึงอะไร

Gate status: REMEDIATE

แปลตรง ๆ: Product direction ผ่านระดับ "ตอบได้" แต่ยังไม่ใช่ PASS สะอาดสำหรับส่งต่อแบบไม่ต้องระวัง ต้อง remediate 4 เรื่อง:

1. เขียนชัดว่าปัจจุบันยังไม่ใช่ sellable V1
2. ยืนยันว่า JSON import/export ไม่ใช่ user-facing V1 backup contract
3. เตือนว่าต้องแก้ messaging/docs ที่อาจยังพูดเรื่อง JSON backup เกินจริงก่อน public pilot
4. Owner ต้องตัดสิน Phase 4.1 intake และ telemetry mode ก่อนเดินต่อบางส่วน

Block: ไม่มี hard blocker ที่ทำให้ Product Gate ตอบไม่ได้

## 10. ต่อจากนี้จะเกิดอะไร

Recommendation: ใช้ Product Pack ชุดนี้เป็น source สำหรับ Product Gate handoff:

- PRODUCT-SOURCE-OF-TRUTH.md
- PRODUCT-SCOPE.md
- USER-FLOWS.md
- BUSINESS-RULES.md
- V1-ACCEPTANCE-CRITERIA.md
- OPEN-DECISIONS.md

Recommendation: งานถัดไปที่ควรเกิดหลัง owner รับ brief:

1. ยืนยัน Phase 4.1 logo intake
2. ทำ/ตรวจ Phase 4.1 แล้ว gate
3. เปิด Phase 5 PromptPay ตาม brief
4. ทำ Phase 6 hardening/release gate
5. เลือก telemetry mode ก่อน public pilot
6. ค่อยส่งต่อ Business/Market Gate เพื่อดู pricing/packaging/revenue

## 11. Owner ต้องตัดสินอะไรบ้าง

### Decision D1 — Phase 4.1 logo จะยืนยัน fixed single-logo V1 scope ไหม
- Status: REQUIRED
- Council recommendation: Option A
- Council support: 2/3
- Confidence: 82%

#### Option A — ยืนยัน single logo fixed placement แล้วเข้า intake
- ข้อดี: เอกสารดูเป็นธุรกิจจริงขึ้น โดยไม่เปิด scope template designer
- ข้อเสีย: ยังไม่รองรับ multi-logo, watermark, brand kit
- ผลต่อระบบ: ต้องทำ Phase 4.1 และมี gate evidence ก่อนเรียก V1
- ผลต่อรายได้/ต้นทุน: ต้นทุนต่ำกว่า template designer และช่วยให้เอกสารดูพร้อมใช้
- ความเสี่ยง: ถ้าไม่ล็อก size/format limits จะ scope creep

#### Option B — เลื่อน logo ออกจาก V1
- ข้อดี: ลดงาน implementation ทันที
- ข้อเสีย: ขัดกับทิศทาง expert ส่วนใหญ่ที่มองว่า logo เป็น V1 value
- ผลต่อระบบ: ต้องแก้ scope/PRD หรือบันทึก deviation
- ผลต่อรายได้/ต้นทุน: ทำเร็วขึ้น แต่เอกสารดูไม่พร้อมขายเท่าเดิม
- ความเสี่ยง: V1 อาจดูไม่ professional สำหรับธุรกิจจริง

### Decision D2 — Pilot telemetry จะเก็บแบบไหน
- Status: REQUIRED BEFORE PUBLIC PILOT
- Council recommendation: Option A
- Council support: 2/3
- Confidence: 76%

#### Option A — เก็บ anonymous/consented events แบบไม่เก็บเนื้อหาเอกสาร
- ข้อดี: วัด activation, print/save completion, return usage ได้
- ข้อเสีย: ต้องทำ privacy copy และ guardrail ให้ดี
- ผลต่อระบบ: เพิ่ม event collection เฉพาะที่อนุญาต ห้ามเก็บ customer/document content
- ผลต่อรายได้/ต้นทุน: ช่วยให้ Business/Market Gate มี evidence จริง
- ความเสี่ยง: ถ้าออกแบบแย่จะเสี่ยง privacy

#### Option B — ไม่เก็บ telemetry ใช้ feedback manual เท่านั้น
- ข้อดี: privacy risk ต่ำสุด
- ข้อเสีย: หลักฐานอ่อน วัด funnel/repeat usage ยาก
- ผลต่อระบบ: ไม่ต้องเพิ่ม analytics
- ผลต่อรายได้/ต้นทุน: ตัดสิน pricing/Phase 7 ยากขึ้น
- ความเสี่ยง: ตัดสินจาก anecdote มากเกินไป

### Decision D3 — JSON import/export อนาคตจะเอายังไง
- Status: REQUIRED LATER
- Council recommendation: Option A
- Council support: 3/3 for current hidden/non-contractual V1 state; future packaging unresolved
- Confidence: 74%

#### Option A — ซ่อนต่อใน V1 แล้วค่อย scope review
- ข้อดี: ตรงกับ D-2026-09-03 และไม่สัญญา backup ที่ UI ไม่มี
- ข้อเสีย: ผู้ใช้ยังเสี่ยง draft หายโดยไม่มี visible export
- ผลต่อระบบ: handler ยังอยู่แต่ไม่เป็น product surface
- ผลต่อรายได้/ต้นทุน: ยังไม่ใช่ paid lever แต่ลด support promise
- ความเสี่ยง: docs/sales อาจเผลอพูดเกินจริง

#### Option B — เปิดกลับมาเป็น visible V1 backup/data portability
- ข้อดี: ลดความกลัวเรื่อง localStorage
- ข้อเสีย: ต้องแก้ owner decision ปัจจุบัน
- ผลต่อระบบ: ต้องทำ UI/docs/tests/support ใหม่
- ผลต่อรายได้/ต้นทุน: เพิ่ม trust แต่อาจลดเหตุผลของ cloud/pro ภายหลัง
- ความเสี่ยง: scope creep และ support burden

#### Option C — เก็บไว้เป็น paid/deferred capability
- ข้อดี: อาจเป็น monetization hook
- ข้อเสีย: เป็นเรื่อง Business/Market Gate ไม่ใช่ Product Gate นี้
- ผลต่อระบบ: ต้องรอตัดสินรอบหลัง
- ผลต่อรายได้/ต้นทุน: อาจสร้างรายได้ แต่ยังไม่มี evidence
- ความเสี่ยง: คิดเงินกับ data portability อาจกระทบ trust

### Decision D4 — Phase 7+ Cloud/Pro จะเปิดเมื่อไหร่
- Status: REQUIRED LATER
- Council recommendation: Option A
- Council support: 3/3
- Confidence: 80%

#### Option A — รอ PV Gate ก่อนเปิด Cloud/Pro/history/catalog/billing
- ข้อดี: ไม่ทำ SaaS กว้างเกินก่อนพิสูจน์ pain
- ข้อเสีย: V1 ยังไม่มี history/cloud ทำให้ repeat loop อ่อนกว่า
- ผลต่อระบบ: V1 คง no-backend/no-login
- ผลต่อรายได้/ต้นทุน: ต้นทุนต่ำ แต่ recurring revenue infrastructure ช้าลง
- ความเสี่ยง: pilot อาจดู repeat ต่ำเพราะ product ยังไม่มี history

