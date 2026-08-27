# แผนพัฒนา 7 Product สู่ Production ระดับ SaaS

**จัดทำโดย:** Claude (Opus 5) — Mac session
**สั่งการโดย:** CEO (owner)
**วันที่:** 2026-08-27
**สถานะ:** SUPPLEMENTAL INDEPENDENT REVIEW — เก็บไว้เป็น audit/ข้อสังเกตประกอบ ไม่ใช่ execution plan
**ขอบเขต:** 7 product ใน Active scope ที่ owner ล็อกไว้ 2026-08-27 (ดู `ROADMAP.md` §Active scope)
**อำนาจของเอกสารนี้:** ไม่มีอำนาจกำหนดลำดับ execution, effort, ราคา, รายได้, งบประมาณ หรือการตัดสินใจเชิงการเงิน
**ความสัมพันธ์กับเอกสารอื่น:** `PORTFOLIO_PRODUCTION_MASTER_PLAN.md` คือ execution authority;
`PORTFOLIO_REAUDIT_2026-08-27.md` คือ intake evidence ล่าสุด; `BILLING_CORE_PLAN.md` คือแผนย่อย
billing ที่แก้ trust boundary แล้ว เอกสารนี้ไม่แทนที่เอกสารใดในสามตัวนั้น

> **VOID sections — Commander Final Review Gate, 2026-08-27.** ส่วนต่อไปนี้ **เพิกถอน ห้ามนำไปใช้**
> เพราะจัดลำดับงานด้วย usage/demand ซึ่งขัดกฎเหล็ก CEO 2026-08-27 (`agent-iron-rules.md` — usage
> น้อยหรือศูนย์ไม่ใช่เหตุผลตัดสโคป/ลด priority/kill งาน infra):
> **(1) §4.4 DC-5 และ DC-6** ทั้งข้อ — "เก็บ metric จาก V1 เพื่อ validate ว่ามีคนอยากได้ cloud sync
> ก่อนลงทุนสร้าง Phase 8" และ "DC-6 ทำก็ต่อเมื่อ DC-5 บอกว่าคุ้ม" คือการ gate งาน infra ด้วย demand
> ตรงๆ Phase 7–8 ของ DC01 เดินตาม dependency order ใน master plan §5/§6.4 เท่านั้น
> **(2) §4.4 ย่อหน้า "คำแนะนำเชิงกลยุทธ์ที่สำคัญที่สุดในเอกสารนี้"** — เหตุผล "ปล่อยฟรีเพื่อได้ผู้ใช้
> จริง/feedback/พิสูจน์ว่าปล่อยของได้" เพิกถอน ข้อเท็จจริงที่ยังใช้ได้และถูกดูดเข้า master plan แล้วคือ
> DC01 V1 เป็น local-first จึงไม่มี billing-core dependency ไม่แย่ง critical path — เป็นเหตุผลเชิง
> dependency ไม่ใช่เชิง demand
> **(3) §4.3 และ R10** ที่ให้เหตุผลว่า LK01 "ห่างรายได้ที่สุด" — ข้อสรุป (LK01 อยู่ท้ายลำดับ) ยังถูก
> แต่เหตุผลที่ใช้ได้คือ zero application code + พึ่ง billing-core ให้เสถียรก่อน
>
> ทั้งสามข้อนี้เป็นเหตุผลที่ `PORTFOLIO_PRODUCTION_MASTER_PLAN.md` §0 ปฏิเสธ input ประเภทนี้ไว้ชัดเจน
> ห้ามดึงกลับเข้าแผนผ่านเอกสารเสริมนี้
>
> **CEO scope clarification applied 2026-08-27:** เนื้อหาเรื่องราคา รายได้ งบ forecast,
> ช่องทางขาย หรือ effort ด้านล่างเป็นข้อความจาก independent draft เดิมและ **non-authoritative**
> ทั้งหมด ห้ามนำไปใช้เป็น financial plan หรือ blocker ของ engineering plan ข้อสังเกตสถานะโค้ดที่ยัง
> มีประโยชน์ต้อง revalidate กับ commit ปัจจุบันก่อนใช้ เพราะ clean-slate rerun พบข้อมูลใหม่ เช่น
> BK01 lint fail, PS01 test runner หาย, HC01 13/14 test และ dependency advisories

---

## 0. วิธีอ่านเอกสารนี้

เอกสารนี้ตอบคำถามเดียว: **"จากสถานะจริงวันนี้ ต้องทำอะไรบ้าง ตามลำดับไหน และวัดยังไงว่าผ่าน จนขายได้จริงระดับ SaaS"**

โครงสร้าง:
- §1 — สถานะจริงที่ผมตรวจเองวันนี้ (อ่านโค้ด ไม่ใช่อ่านเอกสาร) + จุดที่เอกสารเดิมพูดไม่ตรง
- §2 — นิยามกลางว่า "production ระดับ SaaS" แปลว่าอะไร (gate ladder 2 ชุด)
- §3 — งานกลาง 6 track ที่หลาย product พึ่งร่วมกัน ทำครั้งเดียวใช้ได้หลายตัว
- §4 — แผนรายตัว 7 product พร้อม checkpoint
- §5 — ลำดับการทำจริง (wave) + dependency graph
- §6 — Risk register
- §7 — การตัดสินใจที่ยังต้องรอ owner

**เรื่องเวลา:** ผมให้ effort เป็นแถบ (S/M/L/XL) ไม่ใช่วันที่ปฏิทิน เพราะกำลังคนคือ owner คนเดียว + agent และไม่มีข้อมูล velocity จริงย้อนหลังที่วัดได้ ตัวเลขวันที่ใดๆ ที่ผมเดาให้ตอนนี้จะเป็นการแต่งข้อมูล — ถ้า owner อยากได้ปฏิทินจริง ให้ล็อก wave 1 ก่อนแล้ววัด velocity จริงจาก wave นั้น ค่อยประมาณ wave ถัดไป

| แถบ | ความหมาย |
|---|---|
| **S** | งานย่อยเดียว จบในรอบ session เดียว |
| **M** | หลาย session แต่ไม่ต้องออกแบบสถาปัตยกรรมใหม่ |
| **L** | ต้องออกแบบ + implement + test เป็น phase ของตัวเอง |
| **XL** | เป็นโปรเจกต์ย่อยเต็มตัว (มี phase หลาย phase ในตัวเอง) |

---

## 1. สถานะจริง ตรวจ 2026-08-27 (code-level ไม่ใช่ doc-level)

ผมเปิดโค้ดจริงทั้ง 7 repo วันนี้ นับไฟล์ test จริง อ่าน `package.json` จริง เช็ค branch/remote จริง ตารางนี้คือสิ่งที่เห็น ไม่ใช่สิ่งที่เอกสารเดิมอ้าง

| # | Product | รูปแบบขาย | สิ่งที่มีจริงบนดิสก์ | Test จริง | ช่องว่างใหญ่สุดถึง production |
|---|---|---|---|---|---|
| 1 | `booking` BK01 | Subscribe | Next.js 2 แอป (`booking-admin`, `booking-consumer`), 28 migrations, Stripe checkout/portal/webhook เขียนเอง, quota/staff/top-up enforcement ระดับ DB, Cloudflare Workers deploy scaffold (`wrangler.jsonc` ทั้ง 2 แอป) | **0 ไฟล์** — ไม่มี vitest/jest/playwright config เลย มีแต่ SQL QA script (`qa/run_tests.sh`) | **ไม่มี automated test ชั้น application เลย** + ยังไม่ deploy จริง + Stripe production webhook endpoint ยังไม่ลงทะเบียน |
| 2 | `pawspace` PS01 | Subscribe | Next.js app เต็ม, 12 migrations ถึง Phase 13 (subscription lifecycle + hardening), LINE LIFF, Google Sheets sync, camera access, dashboard | 10 ไฟล์ (9 integration + 1 Playwright E2E) แต่ **ไม่มี `test` script** ใน `package.json` มีแค่ `test:e2e` | **ไม่มีการเก็บเงินจริงเลย** (Phase 13 คือ schema รอ billing authority ภายนอก) + ยังไม่มีร้าน pilot จริงเดินครบ loop + ชื่อแบรนด์ยังไม่เคลียร์ (GitHub Issue #2) |
| 3 | `wstera_link` LK01 | Subscribe | **เอกสารล้วน** — 9 spec docs + operations/marketing docs + prototype Python เก่าเก็บไว้อ้างอิง + `vendor/` | ไม่มี (ไม่มีโค้ด) | **ยังไม่เขียนโค้ดสักบรรทัด** — ต้องสร้างทั้ง product จาก Phase 0 |
| 4 | `doccraft` DC01 | Subscribe | Next.js, `src/{domain,image,persistence,ui}`, Phase 1–4 ผ่าน gate แล้ว (Gate 4 PASS 2026-08-26) | 14 ไฟล์ + มี `test`/`test:e2e`/`typecheck` script ครบ — **จัดชุด test ดีที่สุดในพอร์ต** | Gate 3 ยังไม่ปิด (ต้อง manual print verification บน Chrome/Edge) → Phase 5 ยังเปิดไม่ได้ + cloud sync/auth/billing ยังเป็น post-MVP ทั้งหมด |
| 5 | `multi_tenant_ai` MT01 | ขายขาด | 7 modules + reference server (Express) พร้อม test | 22 ไฟล์ | โค้ดพร้อมแล้ว **ช่องว่างคือฝั่งพาณิชย์ล้วน** — ไม่มี license, ไม่มีช่องขาย, ไม่มี packaging/versioning policy |
| 6 | `booking_ticket_module` CM01 | ขายขาด | React/Vite template ครบ (`src/{domain,services,pages,i18n,theme}`) + 5 Playwright E2E spec | 17 ไฟล์ + `test`/`e2e`/`typecheck` ครบ | **localStorage อย่างเดียว ไม่มี backend adapter** + ไม่มีช่องทางจัดจำหน่าย (ดู §1.1 ข้อ 4) |
| 7 | `headless_commerce` HC01 | ขายขาด | **บน `master` มีแค่ 4 modules + BRIEF.md** — reference server + Stripe webhook fix อยู่บน branch `feat/reference-server` ยังไม่ merge (PR #1 ค้าง, +10,770 บรรทัด 55 ไฟล์) | 19 ไฟล์ (อยู่บน branch ที่ยังไม่ merge) | **PR #1 ยังไม่ merge** — `master` ที่ลูกค้าจะซื้อยังไม่มี server + BRIEF.md ยังเป็น TODO เปล่า (ลูกค้าเป้าหมาย/scope/ราคายังไม่เขียน) |

### 1.1 จุดที่เอกสารเดิมในพอร์ตพูดไม่ตรงกับโค้ด — ต้องแก้ก่อนใช้แผนนี้

1. **`booking` ถูกทำเครื่องหมาย "Done" ใน `ROADMAP.md` §A1 แต่ไม่มี automated test ชั้น application เลยแม้แต่ไฟล์เดียว** — นี่คือความเสี่ยงที่ซ่อนอยู่ใหญ่ที่สุดในพอร์ตทั้งหมด product ที่โตที่สุด แตะเงินจริง มี Stripe จริง มี multi-tenant RLS จริง แต่ไม่มีตาข่ายกันพลาดสำหรับ regression ใดๆ ทั้งสิ้น SQL QA suite (PASS=6/FAIL=0) พิสูจน์ได้แค่ enforcement ระดับ DB ไม่ได้พิสูจน์ว่า route/handler/auth ฝั่ง Next.js ทำงานถูก "Done" ในเอกสารนั้นหมายถึง *feature complete* ไม่ได้หมายถึง *production safe* — ต้องแก้ถ้อยคำในเอกสารด้วย
2. **`pawspace` — `docs/COMMERCIAL_READINESS.md` ยังติ๊ก "Subscription lifecycle implemented" ว่ายังไม่ทำ** ทั้งที่ commit `97c9fd6` (2026-08-25) ลง Phase 13 ไปแล้ว (migration 672+274 บรรทัด + SQL test) ของจริงคือ **schema/RPC ทำแล้ว แต่การเก็บเงินยังไม่มี** ซึ่งตรงกับ checklist ข้อถัดไปที่ยังไม่ติ๊ก — ต้องแยกสองข้อนี้ให้ชัดในเอกสารของมันเอง
3. **`headless_commerce` — `ROADMAP.md` §A2 พูดถึง reference server และ "14/14 tests pass" ราวกับเป็นของที่มีอยู่แล้ว** แต่บน `master` ไม่มี ต้องอ่านคู่กับประโยค "PR #1's description still needs updating before merge" ถึงจะเข้าใจ — ในทางปฏิบัติ**สินทรัพย์ที่ขายได้ยังไม่มีอยู่บน branch หลัก**
4. **`booking_ticket_module` — `ROADMAP.md` §A1 เขียนไว้ว่า "no clear sell path — dropped from the near-term sell-first shortlist entirely"** (ตัดสิน 2026-08-21) แต่ Active scope lock 2026-08-27 ดึงกลับเข้ามาในกลุ่มขายขาด ตามกฎ recency lock ใหม่ชนะ แต่ตาราง §A1 ยังค้างของเก่าอยู่ **และเหตุผลที่เคยตัดทิ้ง (ไม่มีช่องทางจัดจำหน่าย) ยังไม่ถูกแก้** — lock ใหม่ไม่ได้แก้ปัญหานั้น แค่ตัดสินใจกลับทาง จึงต้องนับ "ช่องทางจัดจำหน่าย" เป็นงานที่ต้องทำจริงใน §4.6 ไม่ใช่สมมติว่ามีแล้ว
5. **`pawspace` ไม่มี `test` script** — มี test 9 ไฟล์ที่รันด้วย `npx tsx` ตอน gate review แต่ไม่มี entrypoint มาตรฐาน แปลว่าไม่มีใครรันชุดนี้ซ้ำได้ง่ายๆ และ CI รันไม่ได้

---

## 2. นิยาม "Production ระดับ SaaS" — Gate Ladder

พอร์ตนี้มี 2 โมเดลธุรกิจที่ต้องการหลักฐานคนละชุด จึงต้องมี ladder 2 ชุด **ห้ามใช้ ladder เดียวตัดสินทั้ง 7 ตัว**

กฎร่วมของทุก gate (สืบทอดจาก `ROADMAP.md` และวิธีทำงานที่ owner สั่งไว้ 2026-08-27):
- **ผ่าน = มีหลักฐานรันจริงแนบ** ไม่ใช่รายงานจาก agent, ไม่ใช่ไฟล์ test ที่มีอยู่เฉยๆ, ไม่ใช่ toast สีเขียวบนหน้าเว็บ
- **ผู้ verify ต้องไม่ใช่ผู้ implement** — คนตรวจต้องเปิดโค้ด/รันเอง ไม่ใช่เชื่อรายงาน
- **ห้ามข้าม gate** ถ้า gate ก่อนหน้ายังไม่ PASS
- **ห้าม ship บางส่วนก่อน launch จริง** (คำสั่ง owner 2026-08-27) — ทำ minimal ให้เดินได้ → self-test → test 3 แนวทาง → review 3 แนวทางพร้อมกัน → ค่อยทำ phase ที่เหลือให้ครบ

### 2.1 SaaS Ladder (S0–S7) — ใช้กับ `booking`, `pawspace`, `wstera_link`, `doccraft`

| Gate | ชื่อ | ผ่านเมื่อ (หลักฐานที่ต้องมี) |
|---|---|---|
| **S0** | Scope lock | ขอบเขต V1 เขียนเป็นลายลักษณ์อักษร มี non-goals ชัด ไม่มี contradiction ระหว่างเอกสารหลัก |
| **S1** | Code complete + test เขียว | `typecheck` + `lint` + `build` + unit/integration suite ผ่าน **มี entrypoint มาตรฐาน (`npm test`) ที่คนอื่นรันซ้ำได้** + ผลรันแนบ |
| **S2** | Security & tenant isolation | cross-tenant negative test ผ่านจริง, RLS/authz fail-closed, secrets ไม่อยู่ใน repo, webhook signature verify จริง, rate limit ที่จุดที่เปิดสาธารณะ |
| **S3** | Billing live-path | Stripe test-mode E2E ผ่านครบ 5 event (`checkout.session.completed`, `customer.subscription.updated`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`) + replay/tamper/concurrent-checkout/grace-period negative test ผ่าน + ตรวจ Stripe Dashboard ด้วยตาว่าไม่มี customer ซ้ำและ delivery rate 100% |
| **S4** | Deploy + domain + observability | deploy จริงบน subdomain ของตัวเองใต้ `wstera.com`, health check ตอบจริง, error/log/uptime monitoring มีจริงและเคย alert จริงอย่างน้อย 1 ครั้งจากการยิงทดสอบ, backup/restore เคยทดสอบ restore จริง |
| **S5** | Legal & PDPA | ToS + Privacy Notice ฉบับจริง (ไม่ใช่ template ว่าง), รายชื่อ subprocessor ครบ, data retention/deletion path ใช้งานได้จริง, PDPA consent point ในระบบ |
| **S6** | Pilot จริง | ลูกค้าจริงอย่างน้อย 1 ราย (ไม่ใช่ร้านของ owner เอง สำหรับ product ที่ owner มีร้าน) เดิน loop ครบตั้งแต่สมัคร → ใช้งาน → จ่ายเงิน → ได้ใบเสร็จ → ยกเลิก/ต่ออายุ โดยไม่ต้องให้ owner เข้าไปแก้มือ |
| **S7** | Public launch | หน้าขายบน hub ต่อ CTA จริง, ราคาที่ owner อนุมัติแล้ว, support channel เปิดจริง, runbook incident พร้อม, มีคน on-call (คือ owner) รู้ว่าต้องทำอะไรตอนพัง |

### 2.2 License Ladder (L0–L5) — ใช้กับ `multi_tenant_ai`, `booking_ticket_module`, `headless_commerce`

ของขายขาดไม่ต้อง host ไม่ต้อง uptime ไม่ต้อง PDPA ของลูกค้าปลายทาง — แต่ต้องการหลักฐานคนละชุดที่พอร์ตนี้ยังไม่เคยทำเลย

| Gate | ชื่อ | ผ่านเมื่อ |
|---|---|---|
| **L0** | Buyer & scope lock | เขียนชัดว่าใครซื้อ ซื้อไปทำอะไร ได้อะไรบ้าง ไม่ได้อะไรบ้าง (`headless_commerce/BRIEF.md` ยังเป็น TODO เปล่า — ข้อนี้ยังไม่ผ่าน) |
| **L1** | Clean-install proof | clone จาก `master` ลงเครื่องเปล่า → ทำตาม README ของตัวเอง → รันได้ + test ผ่าน โดยไม่ต้องรู้อะไรที่ไม่ได้เขียนไว้ **ทำโดยคนที่ไม่ได้เขียนโค้ดนั้น** |
| **L2** | License & IP | เลือก license จริง (`booking_ticket_module` มี `LICENSE` แล้ว อีก 2 ตัวยังไม่มี), เช็ค dependency license ทั้งต้นไม้ว่าไม่มีตัวที่ห้ามขายต่อ, เขียน EULA ของสินค้า |
| **L3** | Packaging & versioning | มี release artifact จริง (tag + changelog), นโยบายอัปเดต/แก้บั๊กหลังขายเขียนไว้ชัด, ประกาศชัดว่าซื้อแล้วได้อัปเดตนานแค่ไหน |
| **L4** | ช่องทางขาย | หน้าขาย + ระบบรับเงิน + ส่งมอบไฟล์/สิทธิ์ repo อัตโนมัติ (นี่คือช่องว่างจริงของทั้ง 3 ตัว) |
| **L5** | Support boundary | เขียนชัดว่าซัพพอร์ตอะไร ไม่ซัพพอร์ตอะไร ตอบภายในกี่วัน — solo founder ต้องกันขอบเขตนี้ไว้ก่อนขาย ไม่ใช่หลังขาย |

---

## 3. Platform Track — งานกลางที่ทำครั้งเดียวใช้ได้หลาย product

หัวใจของแผนนี้: **อย่าทำงานเดียวกัน 4 รอบ** ทั้ง 4 ตัวในกลุ่ม Subscribe ต้องการ billing/domain/legal/ops เหมือนกันหมด ถ้าแยกทำแต่ละ product จะเสียเวลา 4 เท่าและได้พฤติกรรมที่ไม่ตรงกัน 4 แบบ

| Track | ชื่อ | สถานะวันนี้ | Effort | ใครพึ่ง | Gate ที่ปลดล็อก |
|---|---|---|---|---|---|
| **P1** | `billing-core` (บริการเก็บเงินกลาง) | **แผน LOCKED แล้ว** `BILLING_CORE_PLAN.md` — ยังไม่เขียนโค้ด | **XL** | PS01, LK01, DC01 (BK01 ไม่พึ่ง มีของตัวเอง) | S3 |
| **P2** | Storefront + entitlement sync (`apps/hub-web`) | Worker live ที่ `wstera.com` แล้ว แต่ DB ยังไม่มีสินค้าจริง ปุ่ม CTA ว่างทุกปุ่ม, `product_installations` webhook ยังไม่มี product ไหนยิงจริง | **M** | ทั้ง 7 | S7, L4 |
| **P3** | Domain/DNS/subdomain convention | `wstera.com` เป็นของ Hub แล้ว, `<code>.wstera.com` ยังจองไว้ในเอกสารเฉยๆ **ยังไม่มี DNS record ของ product ไหนเลย** | **S** | BK01, PS01, LK01, DC01 | S4 |
| **P4** | Legal baseline (ToS/Privacy/PDPA/subprocessor) | มีร่างกระจายอยู่ในบาง product (`pawspace/docs/TERMS_AND_PRIVACY.md`, `doccraft/docs/TERMS_PRIVACY_AND_DATA_NOTICE.md`, `wstera-link/docs/operations/LEGAL_PRIVACY_CHECKLIST.md`) **ไม่มีฉบับกลาง ไม่มีอันไหน final** | **M** | ทั้ง 7 | S5, L2 |
| **P5** | Observability + backup/restore + incident runbook | มี runbook เขียนไว้ 2 ที่ (`pawspace/docs/PRODUCTION_OPERATIONS.md`, `wstera-link/docs/operations/INCIDENT_RUNBOOK.md`) **ยังไม่มี monitoring จริงที่ทำงานอยู่** | **M** | 4 ตัว Subscribe | S4 |
| **P6** | Support channel + SLA boundary | ยังไม่มี | **S** | ทั้ง 7 | S7, L5 |

**หมายเหตุ P1:** `BILLING_CORE_PLAN.md` ล็อกไว้แล้วว่า `booking` **ไม่** ย้ายมาใช้ billing-core ตั้งใจให้เป็นแบบนั้น อย่าไปเปลี่ยน แต่ผลข้างเคียงที่ต้องรับรู้คือ **พอร์ตจะมีระบบเก็บเงิน 2 ระบบถาวร** (booking inline + billing-core) ซึ่งแปลว่าเวลาแก้บั๊กเรื่องเงินต้องแก้ 2 ที่ ต้องเขียนไว้ใน runbook ให้ชัด ไม่งั้นอีก 6 เดือนจะลืม

**หมายเหตุ P3 (RESOLVED 2026-08-27):** ~~convention ที่ต้องล็อก...~~ ตัดสินแล้ว — canonical host = `product_code` (`bk01.wstera.com`) ตาม master plan §10 D1 (การตัดสินใจนี้เกิดจริง 2026-08-26 พร้อม product_id/product_code adoption) ที่ค้างคือแก้ ROADMAP routing table บรรทัดเดียวที่ยังเขียน `booking.wstera.com` — เป็น P0a doc-fix ไม่ใช่ decision

---

## 4. แผนรายตัว

### 4.1 `booking` (BK01) — Subscribe — ใกล้ที่สุด แต่มีหลุมที่ต้องถมก่อน

**สถานะ ladder:** S0 ✅ / S1 ❌ / S2 บางส่วน / S3 บางส่วน / S4 ❌ / S5 ❌ / S6 ❌ / S7 ❌

| Checkpoint | งาน | Effort | ผ่านเมื่อ |
|---|---|---|---|
| **BK-1** | **ตั้งชุด test ชั้น application ตั้งแต่ศูนย์** — vitest + Playwright, ครอบคลุมอย่างน้อย: Stripe webhook handler (signature, replay, ทุก event type), billing checkout/portal route, auth/tenant boundary, booking creation + collision, quota/staff limit ฝั่ง app | **L** | `npm test` รันได้จาก root, ผ่าน 100%, ครอบ 5 พื้นที่ข้างบนครบ, มีผลรันแนบ |
| **BK-2** | Regression sweep ด้วยชุด test ใหม่ — คาดว่าจะเจอบั๊กจริง เพราะโค้ดนี้ไม่เคยถูก test ชั้นนี้มาก่อน | **M** | บั๊กที่เจอทั้งหมดถูกแก้หรือบันทึกเป็น known issue พร้อมเหตุผล |
| **BK-3** | Security review รอบเต็ม (S2) — cross-tenant negative test, RLS fail-closed, rate limit บน endpoint สาธารณะ (`/api/webhooks/*`, consumer booking submit) | **M** | negative test ผ่านจริงทุกข้อ |
| **BK-4** | Deploy จริงบน Cloudflare Workers + ผูก subdomain (รอ P3 ล็อก convention) ทั้ง admin และ consumer | **M** | เข้าถึงได้จริงจาก internet, health check ผ่าน, DB query จริงผ่าน |
| **BK-5** | Stripe production endpoint + live-mode cutover — ลงทะเบียน webhook endpoint จริง (ต้องมี URL จาก BK-4 ก่อน), ทดสอบ test-mode ครบก่อนสลับ live | **M** | ครบ S3 |
| **BK-6** | Observability + backup restore test (ผ่าน P5) | **S** | ครบ S4 |
| **BK-7** | Legal (ผ่าน P4) + pricing approval จาก owner | **S** | ครบ S5 + ราคาอนุมัติ |
| **BK-8** | Pilot ร้านจริงที่ไม่ใช่ของ owner | **M** | ครบ S6 |

**ความเสี่ยงเฉพาะตัว:** BK-1 คืองานที่ใหญ่กว่าที่ทุกคนคิด เพราะเป็นการเขียน test ย้อนหลังให้โค้ด 28 migration ที่โตมาโดยไม่มี test — และ BK-2 มีโอกาสสูงที่จะเจอของที่ต้องแก้ **อย่าตั้งสมมติฐานว่า BK-1 จะผ่านฉลุยแล้วข้ามไป BK-4 เลย**

---

### 4.2 `pawspace` (PS01) — Subscribe — โค้ดแน่นที่สุด ขาดแค่เงิน

**สถานะ ladder:** S0 ✅ / S1 เกือบ / S2 ✅ (ผ่าน gate review หลายรอบ) / S3 ❌ / S4 ❌ / S5 บางส่วน / S6 ❌ / S7 ❌

| Checkpoint | งาน | Effort | ผ่านเมื่อ |
|---|---|---|---|
| **PS-1** | เพิ่ม `test` script มาตรฐานใน `package.json` ให้ชุด 9 ไฟล์ที่มีอยู่รันได้ด้วยคำสั่งเดียว + รันซ้ำจากเครื่องเปล่าให้ผ่าน | **S** | `npm test` เขียว มีผลรันแนบ |
| **PS-2** | **รอ P1 Phase 1** — billing-core ต่อกับ PawSpace RPC ครบ (`transition_shop_subscription`, `set_shop_commercial_package`) | **(อยู่ใน P1)** | ร้านจริง 1 ร้าน checkout test-mode สำเร็จ + `shop_subscriptions` อัปเดตถูก |
| **PS-3** | **รอ P1 Phase 3** — test 3 แนวทาง (regression / Stripe CLI E2E / adversarial) review พร้อมกัน | **(อยู่ใน P1)** | ครบ S3 |
| **PS-4** | แก้ `docs/COMMERCIAL_READINESS.md` ให้ตรงความจริง — แยก "subscription lifecycle schema ทำแล้ว" ออกจาก "payment collection ยังไม่มี" | **S** | เอกสารตรงกับโค้ด |
| **PS-5** | ปิด GitHub Issue #2 (brand name collision) — **นี่เป็น blocker ทางธุรกิจไม่ใช่ทางเทคนิค** ถ้าชื่อชนต้องเปลี่ยนก่อนไปหาลูกค้า ไม่ใช่หลัง | **M** | มีคำตอบชัดว่าใช้ชื่อนี้ได้หรือต้องเปลี่ยน + ถ้าเปลี่ยน rename ครบทุกที่ |
| **PS-6** | Deploy + subdomain + observability (ผ่าน P3/P5) | **M** | ครบ S4 |
| **PS-7** | Legal (ผ่าน P4) + ราคาอนุมัติ (Starter/Pro/Enterprise มีอยู่แล้วในโค้ด แต่ยังไม่มีการอนุมัติราคาเป็นทางการ) | **S** | ครบ S5 |
| **PS-8** | Pilot ร้านสัตว์เลี้ยงจริง 1 ร้าน เดิน loop ครบรวมจ่ายเงิน | **L** | ครบ S6 |

**จุดแข็งที่ควรใช้:** นี่คือ product ที่หลักฐานแน่นที่สุดในพอร์ต (concurrency test จริง, RLS negative test จริง, E2E จริง) และตรงกับ conviction ของ owner — ถ้าจะเลือกตัวเดียวไปให้สุดก่อน เลือกตัวนี้

**ความเสี่ยงเฉพาะตัว:** PS-8 ไม่ใช่งานเขียนโค้ด เป็นงานหาลูกค้า ซึ่งเป็นคอขวดจริงที่โค้ดแก้ให้ไม่ได้ **ควรเริ่มหาร้าน pilot ขนานไปตั้งแต่ตอนนี้ ไม่ใช่รอโค้ดเสร็จก่อน**

---

### 4.3 `wstera_link` (LK01) — Subscribe — ยังไม่มีโค้ด ต้องสร้างทั้งตัว

**สถานะ ladder:** S0 ✅ (spec ล็อกแล้ว) / S1–S7 ❌ ทั้งหมด

repo นี้มี `BUILD_QUEUE.md` ของตัวเองที่แบ่ง Phase 0–7 ไว้ดีแล้ว **ให้ใช้อันนั้นเป็นแผนปฏิบัติการ ไม่ต้องเขียนใหม่** สิ่งที่แผนนี้เพิ่มคือ 2 การแก้:

| Checkpoint | งาน | Effort | ผ่านเมื่อ |
|---|---|---|---|
| **LK-1** | **แก้เอกสารก่อนเริ่มโค้ด** — `02_SYSTEM_ARCHITECTURE.md` ระบุว่า billing มาจาก billing-core ไม่ใช่ module ที่ vendor ไว้เอง (สั่งไว้แล้วใน `BILLING_CORE_PLAN.md` §3) ทำตาม convention การแก้เอกสาร LOCKED ของ repo นั้น (changelog line ไม่ใช่แก้เงียบ) | **S** | เอกสารไม่ขัดกับ P1 |
| **LK-2** | `BUILD_QUEUE.md` Phase 0–3 (scaffold → auth/tenant/RLS → link/redirect → analytics/quota) | **XL** | gate ของแต่ละ phase ตามที่ `08_TEST_RELEASE_GATES.md` เขียนไว้ |
| **LK-3** | **`BUILD_QUEUE.md` Phase 4 (Billing) เปลี่ยนความหมาย** — เดิมคือ "สร้าง subscription/payment ของตัวเอง" ใหม่คือ "ต่อ billing-core ผ่าน `GET /v1/subscriptions` + `GET /v1/entitlements` แบบ pull" ซึ่งงานน้อยกว่าเดิมมาก แต่**พึ่ง P1 ให้เสร็จก่อน** | **M** | ครบ S3 |
| **LK-4** | Phase 5–6 (paid features + hardening) | **L** | ตาม gate เดิม |
| **LK-5** | Phase 7 (beta/launch) + P3/P4/P5/P6 | **M** | ครบ S4–S7 |

**การตัดสินใจที่ต้องทำก่อน LK-2:** จุดขายหลักที่ทั้ง 4 ข้อเสนอ differentiation เห็นตรงกันคือ **channel-aware routing** (ลิงก์เดียว ปลายทางเปลี่ยนตามช่องทางที่กดมา) — ถ้าจะให้มันเป็นจุดขาย ต้องอยู่ใน Phase 2 (link/redirect core) ตั้งแต่แรก **ไม่ใช่ไปแปะทีหลังใน Phase 5** เพราะมันเปลี่ยน data model ของ link เอง ควรตัดสินใจข้อนี้ก่อนเขียนโค้ดบรรทัดแรก

**ความเสี่ยงเฉพาะตัว (แก้เหตุผล 2026-08-27):** LK01 มี zero application code และต้องรอ billing-core contract เสถียรก่อน (master plan §5 P4) จึงอยู่ท้าย dependency order **อย่าเอา LK01 มาเปิดเป็น heavy track ทับ BK01/PS01** — ข้อสรุปเดิมถูก แต่เหตุผลเดิมที่ว่า "ห่างจากรายได้มากที่สุด" เพิกถอน (VOID §3 ด้านบน)

---

### 4.4 `doccraft` (DC01) — Subscribe — MVP ใกล้จบ แต่โมเดล Subscribe ยังห่าง

**สถานะ ladder:** S0 ✅ / S1 ✅ (ชุด test ดีที่สุดในพอร์ต) / S2 ไม่บังคับสำหรับ V1 (local-first ไม่มี backend) / S3 ❌ / S4 ❌ / S5 บางส่วน / S6 ❌ / S7 ❌

**ต้องเข้าใจโครงสร้างของมันก่อน:** V1 คือ local-first ไม่มี login ไม่มี backend — ซึ่งแปลว่า **V1 เก็บเงินไม่ได้** สิ่งที่ทำให้มันเป็น Subscribe คือ Pro tier (cloud sync) ซึ่งอยู่ที่ Phase 8 ตาม ROADMAP ของมันเอง จึงต้องมองเป็น 2 การปล่อยแยกกัน

| Checkpoint | งาน | Effort | ผ่านเมื่อ |
|---|---|---|---|
| **DC-1** | **ปิด Gate 3** — manual print verification บน Chrome/Edge จริง (ค้างอยู่ ปิดไม่ได้ด้วยการเขียนโค้ด ต้องมีคนเปิด print dialog จริงแล้วดู) | **S** | Gate 3 PASS มีหลักฐาน |
| **DC-2** | Phase 5 (PromptPay QR) — brief เขียนไว้แล้ว (`BRIEF-phase5-promptpay-qr.md`) รอ Gate 3 | **M** | EMV payload + CRC test vectors ผ่าน |
| **DC-3** | Phase 6 (MVP hardening + RC) | **M** | ตาม gate เดิม |
| **DC-4** | **ปล่อย V1 ฟรี** — local-first ไม่ต้องมี billing/backend/PDPA ของข้อมูลผู้ใช้ (ข้อมูลอยู่บนเครื่องผู้ใช้) นี่คือทางลัดที่มีจริงในพอร์ต: **ได้ผู้ใช้จริงและ feedback จริงก่อนสร้าง Pro** | **S** | deploy เป็น static/Worker ได้, มีหน้าขายบน hub, มี privacy notice ที่บอกตรงว่าไม่เก็บข้อมูลอะไร |
| **DC-5** ~~VOID~~ | ~~เก็บ metric จริงจาก V1 (`MVP_METRICS_AND_ANALYTICS.md` มีแผนแล้ว) เพื่อ validate ว่ามีคนอยากได้ cloud sync จริงไหม **ก่อน**ลงทุนสร้าง Phase 8~~ | ~~M~~ | **VOID — usage-gating ผิดกฎเหล็ก** |
| **DC-6** ~~VOID as written~~ | Phase 7–8 (auth + cloud sync + ต่อ billing-core แบบ pull) — ~~ทำก็ต่อเมื่อ DC-5 บอกว่าคุ้ม~~ **เดินตาม dependency order ใน master plan §6.4 ไม่มีเงื่อนไข demand** | **XL** | ครบ S3–S7 |

**~~คำแนะนำเชิงกลยุทธ์~~ VOID:** ย่อหน้าเดิมเสนอให้ปล่อย DC01 V1 ฟรีเร็วๆ เพื่อ "ได้ผู้ใช้จริง ได้ feedback จริง และได้ข้อมูลว่าควรสร้าง Pro ไหม" — เพิกถอนทั้งย่อหน้า เป็น demand-validation reasoning ที่กฎเหล็ก 2026-08-27 ห้าม ข้อเท็จจริงที่เหลืออยู่และถูกดูดเข้า master plan แล้ว: **DC01 V1 เป็น local-first จึงไม่มี billing-core dependency และไม่แย่ง critical path** จึงเป็น bounded track ที่เดินขนานได้ภายใต้ focus gate — ด้วยเหตุผล dependency ล้วน ไม่ใช่เพราะเข้าถึงผู้ใช้เร็ว

---

### 4.5 `multi_tenant_ai` (MT01) — ขายขาด — โค้ดเสร็จแล้ว ขาดร้าน

**สถานะ ladder:** L0 บางส่วน / L1 ❌ / L2 ❌ / L3 ❌ / L4 ❌ / L5 ❌

| Checkpoint | งาน | Effort | ผ่านเมื่อ |
|---|---|---|---|
| **MT-1** | L0 — เขียนให้ชัดว่าใครคือผู้ซื้อ (dev/agency ที่จะสร้าง SaaS multi-tenant + AI) ได้อะไรบ้าง ไม่ได้อะไรบ้าง | **S** | มีเอกสาร buyer/scope |
| **MT-2** | **L1 clean-install proof** — clone จาก `master` ลงเครื่องเปล่า ทำตาม README แล้วรันได้ + test ผ่าน **โดยคนที่ไม่ได้เขียน** นี่คือหลักฐานที่พอร์ตนี้**ยังไม่เคยทำกับ product ไหนเลย** และเป็นสิ่งที่ผู้ซื้อเจอเป็นอย่างแรก | **M** | มีบันทึกการรัน clean install จริง |
| **MT-3** | L2 — เลือก license + EULA + audit license ของ dependency ทั้งต้นไม้ | **M** | ไม่มี dependency ที่ห้ามขายต่อ |
| **MT-4** | L3 — tag release + changelog + นโยบายอัปเดตหลังขาย | **S** | มี v1.0.0 จริง |
| **MT-5** | L4 — ช่องทางขาย (ผ่าน P2): หน้าขายบน hub + รับเงิน + ส่งมอบสิทธิ์ repo/ไฟล์ | **M** | ซื้อทดสอบด้วยตัวเองได้ครบ loop |
| **MT-6** | L5 — เขียนขอบเขต support | **S** | มีเอกสารสาธารณะ |
| **MT-7** | **พิจารณาฝัง `feature_flag` เข้าไปเป็นจุดขาย** — ทั้ง 4 ข้อเสนอ differentiation เห็นตรงกัน 100% ว่า `feature_flag` ขายแยกไม่ได้ แต่เป็นของแถมที่ดีของ starter-kit | **M** | (ทางเลือก) — owner ตัดสิน |

**หมายเหตุ:** `REVENUE-STRATEGY.md` เรียกตัวนี้ว่า "เส้นทางเร็วสุดสู่รายได้แรก (1–2 วัน)" — **ตัวเลขนั้นนับเฉพาะงานโค้ด** ของจริงคือ MT-2 ถึง MT-6 ทั้งหมดเป็นงานที่ยังไม่เคยทำ และงานที่ยากที่สุดคือ MT-5 (ช่องทางขาย) ซึ่งไม่ใช่ 1–2 วัน อย่าวางแผนตามตัวเลขนั้น

---

### 4.6 `booking_ticket_module` (CM01) — ขายขาด — template เสร็จ แต่ยังเป็นแค่ demo

**สถานะ ladder:** L0 บางส่วน / L1 ❌ / L2 ✅ (มี `LICENSE` แล้ว) / L3 ❌ / L4 ❌ / L5 ❌

| Checkpoint | งาน | Effort | ผ่านเมื่อ |
|---|---|---|---|
| **CM-1** | **ตัดสินใจก่อนทำอย่างอื่น: ขายแบบไหน** — (ก) ขายเป็น UI template ที่ localStorage อย่างเดียวตามที่เป็นอยู่ ราคาถูก ตลาด template หรือ (ข) เพิ่ม backend adapter (Supabase/REST) ให้เป็นของที่ใช้งานจริงได้ ราคาสูงขึ้น สองทางนี้ effort ต่างกันมาก | **(owner ตัดสิน)** | มีคำตอบเป็นลายลักษณ์อักษร |
| **CM-2** | ถ้าเลือก (ข): implement backend adapter ตาม repository/adapter boundary ที่ออกแบบไว้แล้ว | **L** | adapter ทำงานจริงกับ Supabase + test ครอบ |
| **CM-3** | L0 — เขียน buyer/scope ให้ชัด รวมทั้งบอกตรงๆ ว่าตัวนี้**ไม่ใช่**ระบบ ticket ของ `booking` (มี `TICKET_SYSTEMS_DISAMBIGUATION.md` แล้ว ให้ดึงสาระมาไว้ในหน้าขาย) | **S** | หน้าขายไม่ทำให้ผู้ซื้อสับสนกับ BK01 |
| **CM-4** | L1 clean-install proof | **S** | เหมือน MT-2 |
| **CM-5** | L3 + L4 + L5 (ผ่าน P2) | **M** | ครบ ladder |

**ความเสี่ยงเฉพาะตัว — ต้องพูดตรงๆ:** เหตุผลที่ `ROADMAP.md` เคยตัดตัวนี้ทิ้ง 2026-08-21 คือ "ไม่มีช่องทางจัดจำหน่าย" การดึงกลับเข้า active scope เมื่อ 2026-08-27 **ไม่ได้แก้เหตุผลนั้น** ตลาด template (Gumroad/ThemeForest ฯลฯ) เป็นตลาดที่ต้องมี distribution จริงถึงจะขายได้ ไม่ใช่แค่มีของดี **ถ้าจะให้ CM01 คุ้มค่าที่จะทำ ต้องมีคำตอบเรื่องช่องทางก่อน ไม่ใช่หลัง** — ผมแนะนำให้ทำ CM-1 และหาคำตอบเรื่องช่องทางให้ได้ก่อน แล้วค่อยตัดสินว่าจะลงแรงต่อไหม

---

### 4.7 `headless_commerce` (HC01) — ขายขาด — สินทรัพย์ยังไม่อยู่บน branch หลัก

**สถานะ ladder:** L0 ❌ (BRIEF ยังเป็น TODO เปล่า) / L1 ❌ / L2 ❌ / L3 ❌ / L4 ❌ / L5 ❌

| Checkpoint | งาน | Effort | ผ่านเมื่อ |
|---|---|---|---|
| **HC-1** | **merge PR #1** — แก้คำอธิบาย PR ที่ยังเรียก missing webhook verification ว่า "acceptable documented limitation" (มันคือ CRITICAL ไม่ใช่ limitation) แล้ว merge เข้า `master` | **S** | `master` มี server + test 19 ไฟล์ + รันผ่าน |
| **HC-2** | **L0 — เขียน BRIEF ให้เสร็จ** ตอนนี้ `BRIEF.md` มี checklist เปล่า 5 ข้อ (ลูกค้าเป้าหมาย / MVP scope / ราคา / timeline / ความเสี่ยง) ยังไม่ตอบสักข้อ **ขายไม่ได้ถ้ายังไม่รู้ว่าขายใคร** | **M** | ตอบครบ 5 ข้อ |
| **HC-3** | ตัดสินใจจุดขาย — จาก `SYNTHESIS-2026-08-27.md`: มุม "marketplace sync" อ่อนลงแล้วหลัง fact-check (Shopify มี app ทำได้) มุมที่ยังยืนได้แข็งกว่าคือ **COD + PromptPay + ขนส่งไทย เป็น order state ระดับ native** | **M** | จุดขายเลือกแล้ว + ถ้าเลือกมุมไทย ต้องประเมินว่าโค้ดปัจจุบันรองรับแค่ไหน |
| **HC-4** | L1 clean-install proof | **S** | เหมือน MT-2 |
| **HC-5** | L2 + L3 (license, EULA, dependency audit, release tag) | **M** | ครบ |
| **HC-6** | L4 + L5 (ผ่าน P2) | **M** | ครบ ladder |

**ทางเลือกที่ควรพิจารณา:** ทั้ง `chatgpt` และ `agy` เสนอตรงกันว่าให้เอา HC01 ไปเป็น backbone ให้ product อื่นในพอร์ตใช้เองก่อน แล้วค่อยขายออกนอก — ถ้าทำแบบนั้นจะได้ dogfooding จริงซึ่งเป็นหลักฐานการขายที่ดีกว่า test 14 ตัว แต่มันขยาย scope ออกไปจาก "ขายขาด" ที่ owner ล็อกไว้ **ผมไม่แนะนำให้ทำใน wave นี้** บันทึกไว้เป็นทางเลือกอนาคต

---

## 5. ลำดับการทำจริง

### 5.1 หลักการจัดลำดับ

1. **ปิดหลุมความปลอดภัยก่อนขยายของใหม่** — BK-1 (test ของ booking) มาก่อนทุกอย่างที่เป็นการสร้างของใหม่ เพราะ booking คือตัวที่แตะเงินจริงแล้วและไม่มีตาข่าย
2. **Platform track ที่มีคนพึ่งเยอะ ทำก่อน** — P1 (billing-core) ปลดล็อก 3 product, ทำก่อน product ที่รอมัน
3. **ห้ามทำ 4 ตัวพร้อมกัน** — solo founder ทำขนานได้จริงประมาณ 1 product หนัก + 1 งานเบา
4. **ของที่ปล่อยได้เร็วโดยไม่พึ่งใคร ปล่อยเลย** — DC01 V1 ฟรี ไม่ต้องรออะไรทั้งนั้น

### 5.2 Wave

**Wave 0 — งานถมหลุม + เตรียมฐาน (ทำก่อนอย่างอื่นทั้งหมด)**

| งาน | ทำไมต้องก่อน |
|---|---|
| BK-1, BK-2, BK-3 | booking แตะเงินจริงแล้วแต่ไม่มี test — ทุกวันที่ปล่อยไว้คือความเสี่ยงสะสม |
| PS-1 (test script) | งาน S ทำเสร็จในรอบเดียว ปลดล็อกให้ CI ทำงานได้ |
| P3 (ล็อก DNS convention) | งาน S แต่ถ้าไม่ล็อกก่อน จะต้อง migrate URL ทั้งพอร์ตทีหลัง |
| HC-1 (merge PR #1) | งาน S ที่ค้างอยู่เฉยๆ ทำให้สินทรัพย์ที่มีอยู่แล้วกลับมาใช้ได้ |
| LK-1 (แก้เอกสารให้ตรง billing-core) | งาน S ต้องทำก่อนเริ่มโค้ด LK ไม่งั้นสร้างผิดทาง |
| PS-4 (แก้ COMMERCIAL_READINESS ให้ตรงจริง) | งาน S เอกสารผิดทำให้ตัดสินใจผิด |
| DC-1 (ปิด Gate 3) | งาน S ที่บล็อกทั้ง Phase 5–6 ของ DC01 อยู่ |

**Wave 1 — เอาของขึ้นและเริ่มเก็บเงิน** (ทำ 2 สายขนาน)

- **สายหลัก:** P1 `billing-core` ทั้งหมดตามแผน LOCKED (Phase 0 → 1 → 2 → 3 → 4) → ปลดล็อก PS-2, PS-3
- **สายเบาขนาน:** DC-2, DC-3, DC-4 (ปล่อย DocCraft V1 ฟรี) + P6 (support channel)

จบ Wave 1 ควรได้: **PawSpace เก็บเงินได้จริงใน test-mode ครบ + DocCraft V1 ออนไลน์ให้คนใช้จริง**

**Wave 2 — ขึ้น production จริง**

- BK-4 → BK-5 → BK-6 (booking deploy + Stripe live)
- PS-5 (brand) → PS-6 (deploy)
- P4 (legal) + P5 (observability) — ทำครั้งเดียวใช้ทั้ง booking + pawspace
- P2 (storefront ต่อ CTA จริง)

จบ Wave 2 ควรได้: **booking + pawspace live บน subdomain จริง เก็บเงินจริงได้ มีหน้าขายที่กดซื้อได้**

**Wave 3 — Pilot + ขายจริง**

- BK-8, PS-8 (pilot ลูกค้าจริง — งานหาลูกค้า **ควรเริ่มขนานตั้งแต่ Wave 1**)
- MT-1 → MT-6 (multi_tenant_ai ครบ License ladder)
- BK-7, PS-7 (ราคาอนุมัติ + legal)

**Wave 4 — ขยาย**

- LK-2 → LK-5 (wstera_link ทั้งตัว — XL)
- CM-1 (ตัดสินใจก่อน) แล้วค่อย CM-2 ถึง CM-5
- HC-2 → HC-6
- DC-5 → DC-6 (ตัดสินใจจาก data จริงว่าจะสร้าง Pro ไหม)

### 5.3 Dependency ที่ห้ามลืม

```
P3 (DNS convention) ──> BK-4, PS-6, LK-5, DC-4
P1 (billing-core)   ──> PS-2/PS-3, LK-3, DC-6      [booking ไม่พึ่ง - มีของตัวเอง]
P2 (storefront)     ──> S7 ทุกตัว + L4 ทุกตัว
P4 (legal)          ──> S5 ทุกตัว + L2 ทุกตัว
BK-4 (deploy)       ──> BK-5 (Stripe ต้องมี URL จริงก่อนลงทะเบียน endpoint)
DC-1 (Gate 3)       ──> DC-2 (Phase 5 ถูกบล็อกอยู่)
HC-1 (merge PR#1)   ──> HC-4 (clean install ต้องมีของบน master ก่อน)
CM-1 (owner ตัดสิน) ──> CM-2 ทั้งหมด
```

---

## 6. Risk Register

| # | ความเสี่ยง | ระดับ | เห็นได้จาก | วิธีลด |
|---|---|---|---|---|
| R1 | **booking ไม่มี test ชั้น app แต่รับเงินจริง** — regression ใดๆ ในอนาคตจะหลุดถึง production เงียบๆ | **สูงสุด** | 0 test files, verified 2026-08-27 | BK-1 ก่อนงานอื่นทั้งหมด |
| R2 | **7 product พร้อมกันสำหรับคนเดียว** — ความเสี่ยงคลาสสิกคือทุกตัวไปถึง 80% แล้วไม่มีตัวไหนถึง 100% | **สูง** | active scope ขยายจาก 3 → 7 ในวันเดียว (2026-08-23 → 2026-08-27) | บังคับ wave, ห้ามเปิด wave ถัดไปก่อน wave ปัจจุบันปิด |
| R3 | **ระบบเก็บเงิน 2 ระบบถาวร** (booking inline + billing-core) | กลาง | `BILLING_CORE_PLAN.md` ตั้งใจให้เป็นแบบนั้น | เขียนไว้ใน runbook ให้ชัด, bug เรื่องเงินต้องเช็ค 2 ที่เสมอ |
| R4 | **ไม่มีลูกค้าจริงสักรายในทั้ง 7 ตัว** — S6/L4 ยังไม่มีตัวไหนผ่าน แผนทั้งหมดนี้ยังเป็นการเดาความต้องการตลาด | **สูง** | ไม่มีหลักฐาน pilot ใน repo ไหนเลย | เริ่มหา pilot ขนานตั้งแต่ Wave 1 ไม่ใช่รอโค้ดเสร็จ; DC-4 (ปล่อยฟรี) เป็นวิธีได้ผู้ใช้จริงที่ถูกที่สุด |
| R5 | **CM01 ไม่มีช่องทางจัดจำหน่าย** — เหตุผลที่เคยตัดทิ้ง ยังไม่ถูกแก้ | กลาง | `ROADMAP.md` §A1 vs Active scope lock | CM-1 ก่อนลงแรง |
| R6 | **HC01 ยังไม่รู้ว่าขายใคร** — BRIEF เป็น checklist เปล่า | กลาง | `headless-commerce/BRIEF.md` | HC-2 ก่อน HC-4/5/6 |
| R7 | **PS01 ชื่อแบรนด์อาจชนของคนอื่น** | กลาง | GitHub Issue #2 ยังเปิด | PS-5 ก่อนออกไปหาลูกค้า ไม่ใช่หลัง |
| R8 | **ยังไม่มีราคาที่อนุมัติสำหรับ 5 ใน 7 ตัว** | กลาง | `ROADMAP.md` §Owner decisions | §7 ข้างล่าง |
| R9 | **Supabase free tier จำกัด 2 project** — บวก billing-core ที่ต้องการ project ใหม่ตามแผน LOCKED | กลาง | `BILLING_CORE_PLAN.md` §2 + `ROADMAP.md` (owner ตั้งใจอัป Pro หลังมีรายได้) | ต้องอัป Pro ก่อน P1 Phase 1 หรือหาทาง share project — ตัดสินใจก่อน Wave 1 |
| R10 | **LK01 มี zero application code และพึ่ง billing-core contract** | กลาง | zero code, verified 2026-08-27 | อยู่ท้าย dependency order (master plan P4) ไม่เปิดเป็น heavy track ทับตัวอื่น — เหตุผลเดิม "ห่างรายได้ที่สุด" VOID |

---

## 7. การตัดสินใจที่ต้องรอ owner (แผนนี้เดินต่อไม่ได้ถ้าไม่ตอบ)

เรียงตามความเร่งด่วน — ข้อ 1–3 บล็อก Wave 0/1

> **RESOLVED 2026-08-27 (ดู master plan §10):** ข้อ 1 = canonical host `bk01.wstera.com` (code host,
> §10 D1). ข้อ 2 = billing_core เป็น dedicated schema ใน Project A/hub-web ไม่ใช่ project แยก
> ไม่ใช่ account แยก (§10 D3 + 5 เงื่อนไข). Hub event signing = per-product HMAC key (§10 D2).
> ที่ยังค้าง: CM01 boundary, ราคา (CEO/financial plan), จุดขาย LK01/HC01, PawSpace brand, PawSpace
> billing trust (D4), operational targets

1. ~~**DNS convention**~~ **RESOLVED** — `bk01.wstera.com` (code host) §10 D1
2. ~~**Supabase Pro / billing-core project ที่ 3**~~ **RESOLVED** — billing_core = schema ใน Project A §10 D3
3. **CM01 ขายแบบไหน** — template อย่างเดียว หรือเพิ่ม backend adapter (CM-1) — effort ต่างกันหลายเท่า
4. **ราคาที่อนุมัติ** — 5 ตัวยังไม่มีราคาเป็นทางการ: `pawspace` (มี tier ในโค้ดแต่ยังไม่อนุมัติ), `multi_tenant_ai`, `headless_commerce`, `booking_ticket_module`, `doccraft` (มีแค่ hypothesis ฿290/เดือน) — `booking` มี `PRICING_SPEC.md` อนุมัติแล้ว, `wstera_link` มีสเปกล็อกแล้ว (฿199/฿590)
5. **จุดขายของ LK01** — channel-aware routing เข้า Phase 2 หรือไปรอ Phase 5 (เปลี่ยน data model, ต้องตัดสินก่อนเขียนโค้ด)
6. **จุดขายของ HC01** — มุมไทย (COD/PromptPay/ขนส่ง) หรือมุม neutral catalog (HC-3)
7. **`feature_flag` ฝังใน MT01 ไหม** — ทั้ง 4 ข้อเสนอเห็นตรงกันว่าควร แต่ยังไม่มีการตัดสินใจ (MT-7)

---

## 8. Change control

เอกสารนี้ถูก freeze เป็น supplemental snapshot:
- ไม่อัปเดต priority/gate/financial status ที่นี่ ให้แก้ master plan และ evidence ปัจจุบันแทน
- **ห้ามทำเครื่องหมายว่า product ไหน commercially ready ในเอกสารนี้**
- เมื่อข้อมูลขัดกัน ให้ `PORTFOLIO_PRODUCTION_MASTER_PLAN.md` กำกับ execution และให้
  `PORTFOLIO_REAUDIT_2026-08-27.md` หรือ evidence ที่ใหม่กว่ากำกับ verified state
- เก็บ §1.1 ไว้เป็น provenance ของ independent review เดิม ไม่ใช่ current verdict
