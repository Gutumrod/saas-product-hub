# DC01 DocCraft — Product Gate Candidate C

_(anonymized candidate; identity withheld from synthesizer)_

---

# DC01 DocCraft — Product Gate Independent Answer (Q)

> Council procedure: `llm-council-gate` v0.3.2 — Product Gate DC01
> Reviewer: (independent expert, working alone)
> Date: 2026-09-03
> Scope: product identity and V1 boundary only. No Council gate verdict; no pricing/revenue/competitor decisions; no code/docs mutation, build, deploy, merge, migration, or implementation.
> Frozen brief read in full: `docs/council-product-destination-2026-09-03-canonical-01/01-product/DC01/COUNCIL-BRIEF.md`

---

## Recommendation

**What DocCraft should be.** DocCraft should be defined as a **no-login, browser-first Thai business-document studio for micro-businesses** — freelancers, field contractors, custom workshops/service shops, and micro-SMEs — that generates **quotation / invoice / receipt / work order (+ VAT-conditional tax invoice)** with Thai tax-aware calculations, modular blocks, A4-native browser print, local autosave, and PromptPay QR as a payment instruction on the document. The product's identity is "fast, flexible, A4-controlled business documents without a full accounting system" — explicitly **not** an accounting system, not an e-Tax platform, not a template designer (PRD §1–2, §11; PRODUCT_ONE_PAGER "Positioning").

**Endgame.** Free local-first V1 as the validation vehicle → **Cloud/Pro only after the PV Gate** shows real repeat usage and recurring pain from ≥3 real-user segments (ROADMAP Phase 7 precondition; PRODUCT_VALIDATION_PLAN §2, §6). Cloud/Auth/Supabase/billing/E-Sign are post-MVP phases 7–9, not V1.

**Where sellable V1 ends.** The V1 boundary is the **Phase 6 MVP Release Gate** (PRD §13 gates 1–11 + Phase 6 evidence, per ROADMAP/IMPLEMENTATION_PLAN). Concretely, V1 scope is:

- No-login use; 5 document types with tax_invoice conditionally locked until VAT-registered profile + required fields pass validation (PRD §3–4);
- Modular block editor (business, logo, customer, items, item images, discount/VAT/WHT/deposit summary, payment + optional PromptPay QR, terms/notes, signature placeholders), desktop ≥1024px dual-pane, 431–1023px switcher, 375–430px phone (PRD §7);
- Pure calculation engine: line/document discounts, VAT only when registered+enabled, WHT on explicit eligible lines with proportional document-discount allocation, deposit modes, centralized 2-decimal rounding (PRD §6 + Amendment A1);
- A4 portrait `window.print()` only — no PDF engine; Save-as-PDF is a browser/OS dialog capability; Chrome/Edge desktop is the reference environment (PRD §8; SYSTEM_ARCHITECTURE §5);
- Local autosave + schema-versioned restore, storage-failure survival of in-memory state, no silent data loss (PRD §9);
- Optional single business logo, fixed header placement (Phase 4.1 — V1 insertion, approved; **not yet implemented**);
- PromptPay EMV/CRC QR from validated identifier, amount modes deposit/net-payable/no-fixed-amount (**Phase 5 — prepared, not opened**).

**V1 explicitly ends before:** login/account, Supabase sync, subscription billing, E-Sign/customer signing links, payment confirmation/slip verification, automatic quotation→invoice→receipt conversion, Excel monthly reports, inventory, double-entry ledger, e-Tax integration, AI generation, free-form template/page designer, multiple logos/watermarks/brand kits (PRD §11). **JSON Import/Export is capability-held-but-not-exposed** per owner decision D-2026-09-03 — it is NOT a V1 customer-facing backup contract.

**Local-first: value proposition or implementation choice?** In V1, local-first is **primarily an implementation/delivery choice that enables the actual value proposition** — instant, zero-friction use with no signup, no backend dependency, and zero backend cost — plus a supporting privacy/data-control disclosure ("drafts live in your browser; browser storage is not durable backup", PRD §9 Data-model note; TERMS_PRIVACY §1–3). It should not be marketed as the headline benefit yet: PRODUCT_VALIDATION_PLAN §4 explicitly keeps "local-first/JSON backup เพียงพอหรือไม่" as an open pilot question. Recommend framing: local-first = the delivery model that makes "start immediately, no signup" true; "your data stays with you" is a trust/disclosure statement, upgraded to a value proposition only if pilot evidence supports it.

**Product-defining vs breadth-that-can-wait.**

- Product-defining (V1 must have): no-login core loop; the 4+1 document types; entityType/vatStatus separation; calculation engine incl. WHT basis rules; modular block editor on all three layout bands; A4 native print with fixture matrix; autosave/restore + storage-failure survival; PromptPay document QR (in-scope V1, pending Phase 5); single business logo (in-scope V1, pending Phase 4.1).
- Breadth that can wait (post-MVP / Phase 7+): auth, cloud sync, reusable customer/product catalog, cross-device history, lifecycle conversion, Excel reports, E-Sign/public links, advanced templates/themes, billing (Phases 7–9; ROADMAP; PRD §11–12).
- Module Hub (inspected per brief): no Module Hub capability is needed for V1 — V1 requires no backend (PRD acceptance gate 10). Auth-supabase/subscription/payment/entitlement modules become relevant only at Phase 7/8; import-export (XLSX) only post-MVP; product-catalog only post-MVP. Per canonical rule any future use is copy-into-product; **no integration recommendation is binding or even warranted at this gate** (Module Hub `INDEX.md`; council brief `08_MODULE_HUB_SCAN.md`).

**Current reality vs the V1 line (as of 2026-09-03, HEAD `b942a22`, clean tree).** Gates 1–4 are PASS/CLOSED with independent evidence. Phase 4.1 (logo) is unblocked for mandatory intake but unopened; Phase 5 (PromptPay) is prepared-not-opened; Phase 6 hardening has not started. So the sellable V1 described above **does not yet exist in code**; the scope line is crisp, but two V1-scope capabilities (logo, PromptPay) and Phase 6 hardening remain to be built and gated.

---

## Verified facts/evidence used

1. **PRD.md** (Authoritative Product Contract, v2.1): §1 product definition + core loop; §2 V1 success definition (new user reaches preview/print without login, draft survives normal refresh); §3 five document types; §4 `entityType` ⊥ `vatStatus` contract; §5 document data model + branding amendment; §6 calculation contract incl. WHT proportional basis and single rounding policy; §7 modular blocks + 1024px/431–1023px layout bands; §8 A4/print contract (no PDF engine, Chrome/Edge reference); §9 local persistence contract — **including the D-2026-09-03 amendment that JSON Import/Export is capability-held-but-not-exposed and not a V1 customer-facing backup contract**; §10 PromptPay = user's payment instruction, not DocCraft billing, no payment confirmation in V1; §11 explicit V1 non-goals (11 items); §12 post-MVP buckets; §13 eleven MVP acceptance gates; §14 claims guardrail; §15 source-of-truth order.
2. **PRODUCT_ONE_PAGER.md** (v2.0): core loop `เลือกเอกสาร → กรอกข้อมูล → เปิด/ปิดบล็อก → ตรวจยอด → Preview A4 → Print ผ่าน browser`; target V1 capabilities list; positioning statement; data/privacy model ("local persistence ไม่ใช่ durable cloud backup"); post-MVP candidates; pricing explicitly hypothesis-only; claim guardrail.
3. **SYSTEM_ARCHITECTURE.md** (v2.1): browser-only topology, zero backend in V1; locked toolchain (Next.js 16.3.1 App Router, React 19.2.8, TS 5.9.3 strict, Tailwind 4.3.3, pnpm 11.21.0, Vitest, Playwright 1.62.1); domain module boundaries (document-domain / tax-domain / calculation / promptpay / persistence / print / image); print architecture §5; PromptPay boundary §6; post-MVP backend boundary §7; §9 explicitly deferred list.
4. **ROADMAP.md** (v2.1): Phase 0→6 sequence + PV Gate + Phases 7–9; Phase 4.1 approved V1 insertion; "checkbox/report จาก agent ไม่ใช่หลักฐานการผ่าน"; pricing/marketing cannot accelerate capability across gates.
5. **PRODUCT_DECISIONS.md** — D-2026-09-03: owner chose option 2 KEEP; JSON backup UI controls (`btn-import-json`, `btn-export-json`, `btn-mobile-export` in `src/ui/editor/DocCraftEditor.tsx`) remain hidden; capability handler retained; JSON Import/Export not a V1 customer-facing backup contract; re-exposure requires scope review per ONBOARDING §6.
6. **CURRENT_STATUS.md** (2026-09-03): Gates 1/2/4 closed; Gate 3 PASS/CLOSED 2026-09-01 with 118/118 unit + 33/33 E2E; `ceeb2a1` committed/pushed; P0a-C1 PASS after portfolio reassessment; **next authorized action = Phase 4.1 mandatory intake before coding**; disclosure that `ceeb2a1` absorbed the pre-existing Codex JSON-control changes directed to be kept separate.
7. **Code verified directly:** `src/domain/document/types.ts` — `CURRENT_SCHEMA_VERSION = 2`, 5 document types, `LineItem.image` canonical 4-field shape, no `branding` field yet (logo not implemented); `package.json` — only next/react/react-dom dependencies, no PDF/storage/backend libs; `src/ui/editor/DocCraftEditor.tsx` — `hidden` attribute on the three JSON backup controls and header copy "…พร้อมพิมพ์เอกสาร A4" (matches D-2026-09-03); `git log` — history matches evidence chain (`b942a22` owner-decision commit on `origin/master`, clean tree).
8. **Gate evidence:** GATE1 (PHASE1_IMPLEMENTATION_EVIDENCE.md, 47/47, VAT=7% constant, WHT proportional basis, pure calculation, no forbidden tokens); GATE2 (PHASE2_IMPLEMENTATION_EVIDENCE.md, 57/57 unit + 9/9 E2E, exact-1024px breakpoint, fail-closed tax invoice, remediations listed); GATE_REVIEW_PHASE3_PHASE4_2026-08-24 (independent: Gate 3 REMEDIATE for manual native print, Gate 4 REMEDIATE for missing image pipeline); GATE4_INDEPENDENT_REVIEW_2026-08-26 (PASS; image pipeline constants: 262,144-byte data-URL cap, 960px long edge, quality 0.82, ≤4 attempts; strict untrusted-payload validation; fresh cloud verification run 32916220299 with 118/118 + 32/32); GATE3_NATIVE_PRINT_ACCEPTANCE_2026-09-01 (real Chrome 152/W11 native print matrix; one-page defect found→fixed to 1/1; 22-item fixture across 3 sheets; fresh 118/118 + 33/33); GATE3_INDEPENDENT_FINAL_REVIEW_2026-09-01 (independent verdict PASS/CLOSED, screenshots inspected).
9. **OPEN-FINDING-json-backup-controls-2026-09-03.md**: the hidden controls shipped in `ceeb2a1` contradicting PRD/ONBOARDING/Gate-4 record until resolved by owner decision D-2026-09-03; the 33/33 E2E suite was amended to assert the hidden state (green suite encodes the amended contract).
10. **ONBOARDING_AND_SUPPORT.md** (as amended by D-2026-09-03): first-use flow `Choose type → Business/Customer → Items → Adjustments → Preview → Print` with no staff help; V1 backup = browser autosave + Save-as-PDF; storage-full path = reduce/remove images (not JSON export); support matrix; severity model; scope-review requirement before re-exposing JSON controls.
11. **PRODUCT_VALIDATION_PLAN.md**: pilot needs ≥3 segments (freelancer/contractor, workshop, micro-SME); funnel `Visit → Create → Preview → Print/Save → Return`; activation/repeat definitions; §4 open questions incl. "local-first/JSON backup เพียงพอหรือไม่" and cloud-sync pain; §6 decision gates; §7 exit criteria and explicit ban on inventing conversion/retention targets.
12. **MVP_METRICS_AND_ANALYTICS.md**: event vocabulary; prohibited payloads (no document/customer contents to telemetry); §5 requires an explicit collection-mode choice before pilot; KPI definitions.
13. **BUSINESS_MODEL.md**: segments; V1 value drivers actually in scope; `฿290/เดือน` etc. = HYPOTHESIS; unit-economics bans (read for V1-boundary context; no pricing decision taken here).
14. **TERMS_PRIVACY_AND_DATA_NOTICE.md**: local-first data notice; user responsibilities; limitations to disclose (browser data may be cleared; print rendering varies; Save as PDF is browser capability; PromptPay no confirmation; tax-invoice validation ≠ legal certification); publication gate before Public Pilot.
15. **SALES_PLAYBOOK.md**: target-segment pains (Word/Excel repetition, mobile on-site issuance, item images/มัดจำ flexibility, lighter-than-accounting); demo flow; objection handling; pre-launch policy (prototype/demo language until Phase 6 passes).
16. **IMPLEMENTATION_PLAN.md** + **R0_REPO_INTAKE.md**: 4-step phase protocol (intake/brief/implement/gate review), "reviewer ตรวจไฟล์จริง, diff จริง, tests จริง"; repo separation verified standalone; sequencing amendments incl. Phase 4 opened before Gate 3 review by explicit user direction (disclosed deviation).
17. **BRIEF-phase4.1-business-logo-branding-block.md** (REVIEWED — READY AFTER GATE 3; NOT OPENED): logo scope, mandatory intake, non-scope (no drag/positioning/brand kit/AI), failure semantics (failed replacement preserves accepted logo), verification matrix; PRD §9 logo-specific limits "ต้องกำหนดแยกและ review ก่อนใช้".
18. **BRIEF-phase5-promptpay-qr.md** (PREPARED — NOT OPENED): full Phase 5 scope/tests/stop conditions; document-QR vs billing separation.
19. **BRIEF-sell-ready-execution.md** (EXECUTION PLAN — NOT LAUNCH AUTHORIZATION): DC-SR-01..10 chain from Gate 3 closure to paid launch; "SELL READY ไม่เท่ากับ build ผ่าน"; invariant "Free V1 core ต้องไม่ถูกทำให้พิการย้อนหลังเพื่อบังคับขาย Pro"; pricing hypotheses locked behind validation evidence (quoted as boundary only, not decided here).
20. **Module Hub** (`D:\AI-Workspace\projects\modules-hub\INDEX.md`, canonical library): 24 completed modules are SaaS plumbing (notification, config, file storage, webhook receiver, audit log, http client, event bus, payment/stripe, subscription/entitlement, auth-supabase, auth, ticket tracker, tenant-context, rate-limit, feature flags, product catalog, job-retry, scheduler, import-export, health-check, AI provider/workflow, enterprise features); read-only copy-in rule; none required by the no-backend V1 core loop.

---

## Key reasons

1. **The identity is already contracted, consistent, and code-matched.** PRD §1 + One-Pager + BUSINESS_MODEL §1 converge on the same definition (micro-business document studio, not accounting). The shipped code matches: 5 doc types, VAT/WHT/deposit engine, modular editor, native print, autosave. This is a rare case where the "what should it be" answer is already disciplined — the Product Gate's job is to confirm the line, not redraw it.
2. **The core loop, not feature breadth, is the product.** The six-step loop ends in a physical A4 print through the browser's native dialog. Gate 3's whole remediation history (screen-spacing leaking into print → 1-sheet fix) proves print fidelity is the make-or-break quality attribute and is now independently evidenced. This is the hardest-to-copy, most user-visible property; breadth items (cloud, catalog, reports) do not differentiate V1.
3. **Thai tax-domain correctness is a defensible differentiator** inside the "not accounting" boundary: entityType ⊥ vatStatus, conditional tax-invoice locking, WHT explicit-eligible-lines with proportional document-discount basis (Amendment A1), deposit modes, centralized rounding. These are precisely the details generic invoice makers get wrong for Thailand, and they are tested (GATE1/2 evidence).
4. **No-login + local-first is the fastest-path delivery model, and the evidence discipline supports it.** V1 acceptance gate 10 requires end-to-end operation with zero credentials; the architecture has zero backend. The benefit is onboarding friction ≈ 0 and operating cost ≈ 0 — but the durability caveat is contractual (storage is convenience, not backup), so the value claim must stay "start instantly," not "your data is safe forever."
5. **The V1 end line is crisp and already gated:** everything inside PRD §13 gates 1–11 through Phase 6 is V1; everything in §11 non-goals is out until PV Gate evidence. Phase 4.1 (logo) and Phase 5 (PromptPay) are V1-scope because identity on the document (logo) and a payment instruction (PromptPay) are part of the core loop for the target segments (workshops need มัดจำ + PromptPay; businesses need a logo) — both already approved as V1 insertions in the authoritative chain, and both still unbuilt.
6. **JSON backup demotion is consistent with observed reality** (feature not in active use; owner decision). It narrows V1's customer-facing surface to: create → preview → print + autosave. The residual backup story becomes "Save as PDF keeps the artifact; autosave keeps the draft" — acceptable for V1 only if the data-loss risk is actively disclosed (see Risks).
7. **Repeat-use economics require history/cloud — deliberately deferred.** V1 has a single active draft model (Phase 4 evidence: "current draft" envelope). Document history/multi-document retrieval is post-MVP. This keeps V1 small but also means V1's value must be re-proven each session; the PV Gate exists precisely to measure whether the returning-user pain justifies Phase 7.
8. **Module Hub adds nothing to V1.** All completed modules are backend/SaaS plumbing; V1 runs without a server by acceptance gate 10. Any future integration is Phase 7+ and copy-in per the canonical rule. Treating Module Hub as V1 leverage would be scope drift.

---

## Risks / failure cases

1. **"V1" claimed before Phase 6 exists.** Two V1-scope capabilities (business logo, PromptPay QR) and the Phase 6 hardening pass are not built. Any launch/marketing that presents current state as V1 violates the project's own claim guardrail (One-Pager: "ก่อน Phase 6 gate ห้ามนำเสนอเป็น capability ที่ release แล้ว"). Failure mode: public messaging outrunning gated reality — the exact failure class the process was built to prevent.
2. **Data-loss trust failure.** Drafts live in browser storage; browser data can be cleared by the user, OS, private mode, or storage policy (TERMS_PRIVACY §3). With JSON export hidden (D-2026-09-03), a returning user who lost their draft has **no user-facing recovery path** — support matrix directs staff to in-memory continuation and image reduction only (ONBOARDING §4, as amended). For money-adjacent documents (invoices), a single high-profile loss can destroy trust. The warning surfaces exist (Gate 4: quota errors surfaced, in-memory preserved) but they prevent in-session loss, not cross-device/cross-time loss.
3. **Residual documentation contradictions after D-2026-09-03.** TERMS_PRIVACY_AND_DATA_NOTICE.md §1 still states "JSON Export คือกลไก backup/data portability ของ V1 และผู้ใช้ควรเก็บไฟล์สำรอง…" and SALES_PLAYBOOK.md §3 step 6 ("แสดง JSON backup เป็น proof ของ data portability") / §4 ("ผู้ใช้ควร export backup") still describe a user-facing JSON backup path. These three documents were **not** in the D-2026-09-03 amendment list (PRD, ONBOARDING, GATE4, CURRENT_STATUS were). Messaging built on the playbook would over-claim a capability users cannot see.
4. **Print-environment variability.** Chrome/Edge desktop is the only reference environment; PRD explicitly declines cross-browser PDF parity guarantees. Users on Safari/Firefox/mobile browsers may get different pagination; expectations set by "A4 preview" may not match their environment's output. Guardrail exists; user disappointment risk remains.
5. **Single-active-draft usability cliff.** V1 stores one current draft with no history/retrieval. A user who created last week's quotation cannot get it back (JSON import is hidden). Repeat-use measurement may be systematically depressed by this boundary — the pilot must distinguish "tool doesn't retain" from "user doesn't return," or PV Gate evidence will be confounded.
6. **PV Gate evidence is entirely absent today.** No real-user funnel, no repeat-usage data, no willingness-to-pay signal, no telemetry mode chosen (MVP_METRICS §5 requires an explicit choice before pilot). The Pro endgame rests on an unproven premise by design — fine as discipline, but it means the destination beyond V1 is a hypothesis, not a plan.
7. **Open engineering decisions inside V1 scope.** Logo-specific dimension/encoded-size limits must still be defined and reviewed (PRD §9, Phase 4.1 brief); PromptPay identifier-format rules depend on PRD clarity (Phase 5 stop condition). Either can stall or mutate scope if owner decisions lag.
8. **Process/governance risk has recurred.** Two self-declared "PASS" verdicts were corrected (Phase 3/4 provenance notes); Phase 4 was opened before Gate 3 review by explicit direction; `ceeb2a1` mixed an out-of-scope change into the Gate 3 commit (disclosed, history kept). The gate discipline is strong but has been stressed; the remaining V1 phases (4.1, 5, 6) are exactly where schedule pressure could repeat the pattern.
9. **Single-owner concentration.** Product decisions (logo insertion, JSON-hide KEEP) all route to one owner. Unresolved owner decisions are the only current blockers to Phase 4.1 intake (CURRENT_STATUS). Bus-factor and decision-latency risk.

---

## Assumptions

1. "Sellable V1" in this Product Gate means the coherent scope boundary of the releasable free/pilot product (Phase 6 release candidate) — **not** commercial pricing, packaging, or paid launch, which belong to the Business/Market gate.
2. Recorded test counts (118/118 unit, 33/33 E2E, typecheck/lint/build green) are accepted as documented evidence from independent reruns; this expert did not re-run builds or tests (verification runs are outside this gate's permitted actions).
3. The product's Thai-market framing (Thai tax semantics, PromptPay, Thai-language documents, A4) is intentional and core to identity, per every target-audience document.
4. The hidden JSON backup controls remain hidden through V1 (D-2026-09-03 ACTIVE) unless a future scope review re-exposes them.
5. The PRD's §15 source-of-truth order governs; historical evidence files do not override current contracts.
6. "DocCraft" as reviewed = the standalone repository `Gutumrod/doccraft` at `master` HEAD `b942a22` (2026-09-03), which is the repo the frozen brief points to.

---

## Open questions / missing evidence

1. **Phase 4.1 mandatory intake** — CURRENT_STATUS names it the next authorized action; the intake/owner confirmation has not happened. Logo-specific limits are undecided (PRD §9).
2. **When/how JSON backup returns** — surfaced later? as paid capability? Requires scope review per ONBOARDING §6; no owner timeline exists.
3. **Telemetry collection mode** (No-telemetry / anonymous / consented) is required before Public Pilot (MVP_METRICS §5) and is not yet recorded.
4. **Pilot operations readiness** — support contact channel, release runbook execution, privacy notice publication (ONBOARDING §3, TERMS_PRIVACY §8) are contractual but unproven; this expert did not deep-read RELEASE_AND_OPERATIONS_RUNBOOK.md/SERVICE_OPERATIONS.md, so their readiness state is unverified here.
5. **Doc reconciliation for D-2026-09-03** — TERMS_PRIVACY §1 and SALES_PLAYBOOK §3/§4 still describe a user-facing JSON backup contract (see Risks #3); an amendment pass is needed before any public messaging.
6. **PV Gate numeric targets** — explicitly deferred until observed baseline exists (PRODUCT_VALIDATION_PLAN §7); who sets them and when is open.
7. **Repeat-use design tension** — does the owner accept that V1's single-draft model may suppress the very repeat-usage signal the PV Gate depends on, and is "iterate V1" (e.g., surfacing a lightweight document list) the pre-planned response if so?
8. **Module Hub fit for Phase 7+** — auth-supabase vs auth module, subscription/entitlement modules vs Supabase-native RLS design: a decision for a later gate; no binding recommendation here.
9. **Unresolved owner decisions today** — none formally open (P0a-C1 closed; D-2026-09-03 resolved), but Phase 4.1 intake requires owner confirmation, and any PromptPay identifier-rule ambiguity would trip Phase 5 stop conditions (BRIEF-phase5 §8).

---

## Confidence 0-100

**86.**

- High confidence (identity, core loop, V1 boundary, capability classification): the authoritative contracts are explicit, mutually consistent after D0, and match the inspected code and git history.
- The main uncertainty is interpretive, not factual: whether local-first should eventually be *sold* as a value proposition is genuinely an open pilot question, and the expert's "implementation choice first, trust statement second" framing is a judgment call pending real-user evidence (hence not 90+).
- Minor deductions for: unread runbook/service-operations detail, the residual stale backup wording in two lower-authority docs, and the absence of any pilot evidence to validate the core-loop-as-value-proposition assumption.