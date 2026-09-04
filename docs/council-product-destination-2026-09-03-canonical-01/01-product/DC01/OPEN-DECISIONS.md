# DC01 DocCraft — Open Decisions

Status: Product Gate artifact  
Gate verdict: REMEDIATE  
Completed experts: 3/3

## Decision Summary

Owner Decision: This Product Gate does not need the owner to choose a new product identity. The council inputs already support the same V1 destination.

Consensus: 3/3 among completed experts on product identity, target, core loop, V1 non-goals, and primary boundary.

Owner Decision: Several downstream choices must be made before pilot or later gates, but they are not blockers to defining the Product Gate scope.

## Decision D1 — Phase 4.1 business-logo intake scope

- Status: REQUIRED
- Council recommendation: Option A
- Council support: 2/3
- Confidence: 82%

#### Option A — Confirm fixed single-logo V1 scope and proceed to intake

- ข้อดี: Keeps V1 branded enough for real documents without opening template/design scope.
- ข้อเสีย: Users needing multiple logos, watermark, or brand kit must wait.
- ผลต่อระบบ: Requires Phase 4.1 implementation and gate evidence before V1 claim.
- ผลต่อรายได้/ต้นทุน: Low implementation surface compared with template designer; helps perceived document professionalism.
- ความเสี่ยง: Logo size/format limits must be locked during intake to avoid scope drift.

#### Option B — Defer logo out of V1

- ข้อดี: Reduces immediate implementation work.
- ข้อเสีย: Conflicts with candidates treating single logo as approved V1 value; weakens professional document output.
- ผลต่อระบบ: Phase 4.1 skipped or rescheduled.
- ผลต่อรายได้/ต้นทุน: Faster build path, but lower perceived readiness for businesses.
- ความเสี่ยง: V1 scope would need formal amendment because candidates treat logo as in-scope.

## Decision D2 — Pilot telemetry collection mode

- Status: REQUIRED BEFORE PUBLIC PILOT
- Council recommendation: Option A
- Council support: 2/3
- Confidence: 76%

#### Option A — Consent-based or privacy-preserving anonymous event collection

- ข้อดี: Lets PV measure activation, print/save completion, return usage, and support failures.
- ข้อเสีย: Needs privacy copy and implementation discipline.
- ผลต่อระบบ: Add/enable only approved event collection without document/customer payloads.
- ผลต่อรายได้/ต้นทุน: Improves evidence quality for Business/Market Gate and Phase 7 decisions.
- ความเสี่ยง: Bad telemetry design can collect sensitive document data; must be explicitly prohibited.

#### Option B — No telemetry; collect manual pilot feedback only

- ข้อดี: Lowest privacy and implementation risk.
- ข้อเสีย: Weak evidence for repeat usage and funnel drop-off.
- ผลต่อระบบ: No analytics implementation required.
- ผลต่อรายได้/ต้นทุน: Slower, noisier validation; harder to justify paid/cloud work.
- ความเสี่ยง: Owner may make market decisions from anecdotes.

## Decision D3 — JSON import/export future

- Status: REQUIRED LATER
- Council recommendation: Option A
- Council support: 3/3 for current hidden/non-contractual V1 state; future packaging is unresolved
- Confidence: 74%

#### Option A — Keep hidden in V1; revisit only through scope review

- ข้อดี: Matches D-2026-09-03 and avoids promising a backup contract V1 does not expose.
- ข้อเสีย: Higher data-loss anxiety; no visible backup path for users who clear browser storage.
- ผลต่อระบบ: Existing hidden capability remains non-product surface.
- ผลต่อรายได้/ต้นทุน: Does not create immediate paid feature; avoids support promise.
- ความเสี่ยง: Stale docs or sales messaging may over-claim JSON backup.

#### Option B — Re-expose as visible V1 backup/data portability

- ข้อดี: Reduces local-storage trust risk.
- ข้อเสีย: Contradicts current owner decision unless formally amended.
- ผลต่อระบบ: Needs UI, support, tests, docs, and product scope review.
- ผลต่อรายได้/ต้นทุน: Could strengthen V1 trust; may reduce future paid backup/cloud differentiation.
- ความเสี่ยง: Scope creep and support burden.

#### Option C — Reserve as paid/deferred capability

- ข้อดี: Could become a monetization lever or Pro bridge.
- ข้อเสีย: Pricing/revenue decision is out of this Product Gate.
- ผลต่อระบบ: Requires later Business/Market and product-scope decision.
- ผลต่อรายได้/ต้นทุน: Potential revenue hook, but unvalidated.
- ความเสี่ยง: Charging for data portability can create trust backlash.

## Decision D4 — Phase 7+ endgame after PV

- Status: REQUIRED LATER
- Council recommendation: Option A
- Council support: 3/3 for deferring Phase 7+ until PV evidence
- Confidence: 80%

#### Option A — Keep Cloud/Pro/history/catalog/billing behind PV Gate

- ข้อดี: Prevents V1 from becoming broad SaaS before core pain is validated.
- ข้อเสีย: V1 remains less durable and less repeat-friendly.
- ผลต่อระบบ: No backend/auth/Supabase for V1.
- ผลต่อรายได้/ต้นทุน: Lower V1 operating cost; delays recurring-revenue infrastructure.
- ความเสี่ยง: Weak repeat-use loop may depress PV evidence.

