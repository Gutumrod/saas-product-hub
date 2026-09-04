# DC01 DocCraft — Product Gate Candidate B

_(anonymized candidate; identity withheld from synthesizer)_

---

# DC01 DocCraft — Product Gate Expert Answer (A)

Gate question: *What exactly should DocCraft be, for whom, and where does sellable V1 end?*
Procedure: `llm-council-gate` v0.3.2 (frozen brief). Independent expert; no Council verdict issued here.

---

## Recommendation

DocCraft ควรเป็น **local-first, browser-based modular business document studio สำหรับเจ้าของธุรกิจรายย่อยในไทยที่ต้องออกเอกสารธุรกิจ (ใบเสนอราคา/ใบแจ้งหนี้/ใบเสร็จ/ใบงาน/ใบกำกับภาษีแบบ conditional) โดยไม่ต้องใช้ระบบบัญชีเต็มรูปแบบ** กลุ่มเป้าหมายหลัก = freelancer/ช่าง/ร้านงานสั่งทำ/micro-SME ที่เป็นทั้ง user และ buyer ในคนเดียว (self-serve; ไม่มี buyer/decision-maker แยกจาก user)

Primary product identity/endgame = **document production speed + controlled A4 output** ไม่ใช่ accounting software, ไม่ใช่ hosted SaaS สำหรับ V1, ไม่ใช่ e-Tax/e-Receipt platform

**Sellable V1 ends at:** ครบ PRD §13 MVP acceptance gates ผ่าน Phase 6 (Gate 6), บน stack browser-first ที่ไม่ต้อง login, ไม่มี Supabase, ไม่มี payment gateway — ประกอบด้วย
1. core document loop: เลือกประเภทเอกสาร → กรอก → เปิด/ปิด block → ตรวจยอด → Preview A4 → `window.print()` → browser print dialog (ผู้ใช้เลือก Save as PDF เองได้เมื่อ environment รองรับ)
2. calculation engine ครบ (discount, VAT, WHT proportional, deposit, rounding policy เดียว)
3. modular blocks + business logo (Phase 4.1) + local autosave/persistence (schema v2) ที่ failure-tolerant
4. PromptPay QR (Phase 5) เป็น *payment instruction* บนเอกสาร ไม่ใช่ billing
- และสิ้นสุดตรงจุดที่ V1 มี **non-goal ชัดเจน**: login/account, cloud sync, subscription billing, E-Sign, payment confirmation, auto-quotation→invoice conversion, Excel report, e-Tax/e-Receipt integration, AI generation, template designer — ทั้งหมดเลื่อนเป็น post-MVP

**Local-first คือ implementation/enablement choice เป็นหลัก ไม่ใช่ identity** หลักฐาน: PRD/Architecture ออกแบบ no-login เพื่อลด friction และ zero backend dependency เพื่อเริ่มใช้เร็ว/ต้นทุนต่ำ; แต่ value proposition ตัวจริงคือ speed+flexibility ของการออกเอกสาร ไม่ใช่ "offline/local-only tool" เป็นตัวขาย Cloud sync เป็น post-MVP candidate หลัง PV Gate — แสดงว่า local-first เป็น V1 baseline ไม่ใช่ destination

**ลำดับงานที่เหลือกว่าจะถึง sellable V1:** Phase 4.1 (logo, APPROVED แต่ยังไม่ opened — ต้อง intake) → Phase 5 (PromptPay QR, prepared-not-opened) → Phase 6 (MVP hardening) → Gate 6 → PV (Pilot Validation with real-user evidence) — แล้วค่อยเปิด Phase 7+

---

## Verified facts/evidence used

ทุกข้อ VERIFIED จากไฟล์/โค้ด/ประวัติจริง (repo root `D:\AI-Workspace\projects\saas-product-hub\products\DocCraft`):

- **Git state:** `master` @ `b942a22` ("docs: record owner decision D-2026-09-03 to keep JSON backup controls hidden") — working tree clean, synced with origin. Verified via `git status -sb`, `git log`, `git rev-parse HEAD`.
- **Product identity/positioning:** `docs/PRODUCT_ONE_PAGER.md` — browser-first document studio; ไม่ใช่บัญชีเต็มรูปแบบ; V1 ไม่ใช่ e-Tax/e-Receipt platform.
- **Core loop:** `PRD.md` §1 — `เลือกประเภทเอกสาร → กรอกข้อมูล → เปิด/ปิดบล็อก → ตรวจยอด → Preview A4 → Print (ผู้ใช้เลือก Save as PDF เองใน browser dialog)`.
- **V1 document types:** `PRD.md` §3 — quotation/invoice/receipt/work_order/**tax_invoice (conditional; lock จนกว่า business เป็น VAT registered + required fields ครบ)**. Source `src/domain/document/types.ts` — `DOCUMENT_TYPES` 5 ประเภท, `CURRENT_SCHEMA_VERSION = 2`.
- **Entity/VAT contract:** `PRD.md` §4 — `entityType` ≠ `vatStatus`; ห้าม infer VAT จากนิติฐานะ.
- **Calculation contract:** `PRD.md` §6 + `src/domain/calculation/` — pure domain, deterministic; WHT basis = eligible line totals × amount after doc discount ÷ subtotal (proportional, PRD/sys-arch align); rounding policy จุดเดียว.
- **Modular editor/blocks:** `PRD.md` §7 + `src/ui/editor/` — business/businessLogo(optional)/customer/items/item image column/discount-tax-WHT-deposit/payment+QR/terms/signature placeholders. Desktop ≥1024 editor+live preview; compact <1024 switcher; 431–1023px ไม่ใช่ desktop.
- **A4/print:** `PRD.md` §8 + `SYSTEM_ARCHITECTURE.md` §5 — native `window.print()`, NOT PDF generator (verified: `package.json` dependencies = only next/react/react-dom; `grep` พบ `window.print()` path แต่ไม่มี pdf-lib/jspdf); Chrome/Edge reference; `break-inside: avoid` = best-effort.
- **Local persistence:** `PRD.md` §9 + `SYSTEM_ARCHITECTURE.md` §4 — autosave, schema versioning, quota-failure surfaced (ห้าม silent data loss), import ต้อง validate schema; **JSON Import/Export = capability-held-but-not-exposed** (owner decision D-2026-09-03: UI controls hidden; handler retained; ไม่ใช่ V1 customer-facing backup contract). Verified in `src/ui/editor/DocCraftEditor.tsx` (`hidden` on btn-import-json/btn-export-json/btn-mobile-export).
- **PromptPay:** `PRD.md` §10 + `BRIEF-phase5-promptpay-qr.md` — client-side QR, payment instruction (ไม่ใช่ DocCraft billing), optional amount deposit/net payable, validate target/amount; NO payment confirmation/paid-status automation.
- **Business logo:** `PROPOSAL-business-logo-branding-block.md` + `BRIEF-phase4.1-business-logo-branding-block.md` — APPROVED for V1, fixed single logo, Phase 4.1 insertion; **ยัง NOT OPENED for implementation** (ต้อง mandatory intake ก่อน).
- **V1 non-goals:** `PRD.md` §11 — login/account, Supabase sync, subscription billing, E-Sign, payment confirmation, auto conversion, Excel reports, inventory, double-entry/GL, e-Tax/e-Receipt integration, AI generation, free-form designer/arbitrary logo/brand kit.
- **Post-MVP buckets:** `PRD.md` §12, `ROADMAP.md` Phase 7–9 — auth/supabase sync/catalog/history (Cloud/Pro) หลัง PV Gate; lifecycle conversion/Excel/E-Sign/templates หลัง validation.
- **MVP acceptance gates:** `PRD.md` §13 — 11 gates (tax states, calc suite, mobile/desktop layout, A4 print, native print dialog, refresh restore, storage-failure, JSON round-trip, PromptPay vectors, no-login E2E, logo).
- **Gate status (evidence-backed, not just CURRENT_STATUS.md):**
  - Gate 1, 2: PASS/CLOSED (`DOCUMENTATION_READINESS_INDEX.md` §11).
  - Gate 3: PASS/CLOSED — `GATE3_INDEPENDENT_FINAL_REVIEW_2026-09-01.md` + `GATE3_NATIVE_PRINT_ACCEPTANCE_2026-09-01.md` (1-page `1/1`, 22-item multi-page clean, no editor leak; 118/118 unit, 33/33 E2E).
  - Gate 4: PASS/CLOSED — `GATE4_INDEPENDENT_REVIEW_2026-08-26.md` (schema v2, image pipeline, 32/32 E2E).
  - Phase 4.1 logo: UNBLOCKED for intake, not opened.
  - Phase 5 (QR): PREPARED — NOT OPENED (`BRIEF-phase5-promptpay-qr.md`).
  - Phase 6 (MVP release): not reached.
  - `docs/CURRENT_STATUS.md` + `docs/daily/2026-09-03.md` confirm current executable state.
- **Module Hub (product-fit only, from `D:\AI-Workspace\projects\modules-hub\INDEX.md`):** มี modules file-storage, import-export, payment+stripe, subscription+entitlement, auth/supabase, product-catalog เป็นต้น — แต่ทั้งหมดเป็น backend/server-side และสอดคล้องกับ post-MVP (Phase 7+) เท่านั้น. **ไม่มี module ใด product-defining สำหรับ V1** เพราะ V1 เป็น browser-only/no-backend by design.

---

## Key reasons

1. **"Sellable V1" = local-first document studio, and it is already ~80% built.** Gate 1–4 closed; core loop, calc, print, persistence, item images, logo (approved) are real. The shortest path to a sellable V1 is finishing Phase 4.1→5→6, NOT re-scoping. Evidence: gate records + `src/` structure match PRD V1 scope exactly.

2. **The destination answers "what/who/where V1 ends":** a self-serve tool for one-person/micro businesses to produce correct, A4-controlled business documents fast, without an accounting system. Both user and buyer are the same person — this collapses the go-to-market to a single target and removes buyer/user misalignment.

3. **V1 non-goals are the strongest scoping signal.** Accounting/GL, e-Tax integration, cloud sync, billing, E-Sign, AI are all explicitly deferred. This prevents scope-creep into a "mini accounting system" and keeps V1 deliverable. Roadmap Phase 9 candidates require PRD extension before implementation (evidence: `ROADMAP.md` policy).

4. **Local-first is an implementation/enablement choice, not the identity:** PRD §15 §1/§5 and Architecture §1 target no-login + zero backend to reduce friction and infra cost for V1. The durable identity is **document production speed + controlled output**, which stays true whether later phases add cloud. This means the product should NOT be positioned/packaged primarily as an "offline/local-first" tool — that positioning would undercut later Pro (cloud) value.

5. **Branding/logo + PromptPay QR are correctly V1 product value, not post-MVP breadth** (given they're approved/in-scope): they directly serve the primary loop (professional-looking quotes/orders, and a payment *instruction* that makes the document actionable), and each has a defined, bounded Phase 4.1/5 with explicit non-scope. Excel, E-Sign, AI, templates remain Phase 9 because they serve secondary workflows, not the initial core pain.

6. **JSON backup repositioning is coherent with the destination:** owner decision D-2026-09-03 keeps Backup capability-held-but-not-exposed. This matches a local-first product where durability is convenience, not a contractual backup promise — avoiding a false cloud/backup claim in V1 (guardrail in `PRODUCT_ONE_PAGER.md`/`PRD.md` §14).

7. **Module Hub adds nothing to V1 product definition** — its modules are reusable infra for the post-MVP Pro foundation, not capabilities that should bloat V1 (per freeze boundary and hub copy-into-repo rule). No product-fit evidence suggests a module belongs in V1.

---

## Risks/failure cases

1. **Pilot-validation gap is the largest risk.** V1 can be technically green (gates) yet fail commercially if no real-user evidence shows *repeat* use and a recurring pain worth paying for. `PRODUCT_VALIDATION_PLAN.md`/`MVP_METRICS_AND_ANALYTICS.md` explicitly forbid opening Phase 7 without pilot evidence. If the pain is truly one-off (a user issues a single invoice), the product has no repeat loop → low willingness-to-pay. **This is the biggest failure case** and is why Phase 6→PV must not be shortcut.
2. **No telemetry decision yet.** `MVP_METRICS_AND_ANALYTICS.md` §5 allows three collection modes but none is chosen. Without a chosen, privacy-approved collection mode, pilot evidence gathering is stalled → delays PV gate.
3. **Phase 4.1 logo not opened** — a gap between gate-closure and actual sellable V1. If intake/implementation slips, V1 ships without branding that is in approved scope. Must be sequenced before Phase 5.
4. **Native-print/PDF fragility:** V1 promises no PDF parity across browsers and relies on `window.print()`. A user on an unsupported browser may not get acceptable PDF output → support burden and a partial promise. Guardrail exists but is operational, not contractual-complete.
5. **JSON backup hidden → data-loss confusion:** since controls are hidden and LocalStorage is not a durable backup, a user who clears browser storage loses drafts with no in-UI export path. This is a deliberate decision, but it raises the "storage-failure escape hatch" risk if the hidden capability is mis-repositioned as paid without user visibility.
6. **Tax-invoice legality ambiguity:** V1 doesn't guarantee tax/legal compliance; tax_invoice requires VAT-registered profile + fields. A user issuing a tax invoice could misread the app as guaranteeing compliance. Guardrail (`PRD` §14) mitigates but doesn't remove liability exposure.

---

## Assumptions

- The primary/initial sellable segment is the **same person as user and buyer** (freelancer/technician/workshop/micro-SME) — no separate buyer persona assumed for V1.
- The "sellable V1" is defined by **PRD §13 acceptance gates reached through Phase 6**, and this is the floor for revenue — not pre-gate. (Pricing/segment commercial verdict is out of scope here.)
- Local-first remains V1's architectural baseline; cloud/pro is a post-PV add-on, not a V1 requirement.
- Thai-market context (ภาษา/currency/ภาษี-WHT/VAT/PromptPay) is the target environment; nothing beyond the repo docs is assumed about demand magnitude.
- "Sellable" here means *able to be offered and generate paying users*, not "pricing decided" — pricing/packaging belongs to Business/Market Gate and remains hypothesis (`BUSINESS_MODEL.md`/`COMMERCIAL_PACKAGING.md`: ฿290/mo etc. = hypothesis).

---

## Open questions/missing evidence

1. **Real-user repeat-usage evidence — UNVERIFIED (none exists yet).** No pilot/interview/funnel data in repo. The most important missing evidence for whether V1 is sellable as-is.
2. **Actual target-addressable demand per segment — UNVERIFIED.** Docs list 4 segments (freelancer/contractor, workshop/service shop, micro-SME) but give no evidence which segment has the strongest paid pain.
3. **Willingness-to-pay / which capability users would pay for — UNVERIFIED.** Docs define candidates (cloud sync, catalog, history) but no observed preference.
4. **Module Hub fit is only inventoried at INDEX level** — the module-scan (product-fit for this product) has not run; no concrete reuse decision for post-MVP modules.
5. **Phase 4.1 intake and Phase 5/6 execution are not done** (logo unopened; QR prepared-not-opened; Phase 6 not started) — so a *complete* sellable V1 evidence chain does not yet exist in the repo.
6. Whether the hidden JSON-backup capability will be surfaced later as a paid/deferred capability, and on what trigger — unresolved owner follow-through (decision D-2026-09-03 says so, timing/conditions unrecorded).
7. `docs/daily/2026-09-02.md` noted the JSON-control change had no decision record at the time; this is now resolved (D-2026-09-03) but the commit `ceeb2a1` mixing Gate 3 fixes with the JSON-control change is a recorded commit-hygiene defect (`CURRENT_STATUS.md`) — an auditability consideration.

---

## Confidence 0-100

**Confidence: 78**

High confidence on the *product definition and V1 boundary* — these are unambiguously documented and code-verified (identity, user, core loop, non-goals, gate state, local-first-as-enablement). The confidence is not higher because: (a) no real-user/pilot evidence exists to confirm the product is *actually sellable* in-market, (b) Phase 4.1/5/6 work is unfinished so a complete sellable V1 is not yet demonstrated end-to-end, and (c) Module Hub product-fit for post-MVP is only index-level, not confirmed.

*Scope note: no Council gate verdict (LOCK/REVISE/PAUSE/DROP) issued here; pricing/packaging competition left to Business/Market Gate.*
