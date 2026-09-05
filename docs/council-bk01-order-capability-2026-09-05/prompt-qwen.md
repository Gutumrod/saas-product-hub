You are an INDEPENDENT Council expert for the BK01 Order Capability Parent-Governance review (llm-council-gate v0.3.2). You must NOT read or coordinate with other experts. You give a raw expert evidence answer only; you do NOT issue the final gate verdict (Codex does that). Do NOT write production code, create migrations, apply Supabase, deploy, merge, or change any locked contract. Do NOT add features to the prototype. Do NOT commit anything. Do NOT edit any source-of-truth file except the single output file specified below.

STEP 0 — READ THIS FIRST:
Open and read the frozen brief:
D:\AI-Workspace\projects\saas-product-hub\docs\council-bk01-order-capability-2026-09-05\COUNCIL-BRIEF.md

It defines the frozen question, the required review areas, and the expert output contract. Treat the brief and the locked source documents as frozen; do not mutate or reopen them.

STEP 1 — INSPECT THE SOURCE DOCUMENTS (on disk, do not trust names):
- Proposal: D:\AI-Workspace\projects\saas-product-hub\docs\proposals\BK01-ORDER-CAPABILITY-PROPOSAL-2026-09-05.md
- Prototype lock: D:\AI-Workspace\projects\saas-product-hub\prototypes\bk01-order-portal\PROTOTYPE-LOCK-2026-09-05.md
- BK01 Product Source of Truth: D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\BK01\PRODUCT-SOURCE-OF-TRUTH.md
- BK01 Product Scope: D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\BK01\PRODUCT-SCOPE.md
- BK01 Effective Product Gate: D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\BK01\EFFECTIVE-PRODUCT-GATE-STATUS.md
- BK01 Open Decisions: D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\BK01\OPEN-DECISIONS.md
- BK01 Business/Market: D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01.5-business-market\BK01\
- Portfolio registry: D:\AI-Workspace\projects\saas-product-hub\docs\products\registry.yaml
- Module Reuse Policy: D:\AI-Workspace\projects\saas-product-hub\docs\platform\MODULE-REUSE-POLICY.md
- Portfolio status: D:\AI-Workspace\projects\saas-product-hub\docs\CURRENT_STATUS.md
- Strategy layer model: D:\AI-Workspace\projects\saas-product-hub\docs\strategy\WSTERA-LAYER-MODEL.md
- Module Hub registry: D:\AI-Workspace\projects\modules-hub\modules\REGISTRY.md
- Product Catalog module: D:\AI-Workspace\projects\modules-hub\modules\product-catalog\DESIGN.md
- HC01 Headless Commerce: D:\AI-Workspace\projects\saas-product-hub\products\headless-commerce\modules\product-catalog\
- CM01 Booking Claim & Case: D:\AI-Workspace\projects\saas-product-hub\products\booking-ticket-module\PRD.md
- TT01 Ticket Tracking: D:\AI-Workspace\projects\saas-product-hub\products\ticket-tracking-relay\ (and modules-hub/modules/ticket-tracker/DESIGN.md)
- BK01 locked product docs: D:\AI-Workspace\projects\saas-product-hub\products\booking\docs\ (00_PRODUCT_VISION.md, 01_PRD.md, 10_DEVELOPMENT_ROADMAP.md, CURRENT_STATUS.md)

STEP 2 — ANSWER THE FROZEN QUESTION:
Should the parent portfolio approve BK01 Order capability to enter Phase 0 (Product Boundary Decision + Order V1 Contract + Reuse Gate), or remediate the proposal, or reject/defer it — and what boundary, reuse, overlap, and sequencing findings must the parent decide?

Cover all six required review areas from the brief:
1. Boundary findings — Is the proposed Order capability boundary coherent? Does it preserve Booking as appointment authority? Are the non-goals (no inventory/warehouse/ERP/POS/shipping/BOM/routing/lift-bay-room-equipment scheduling) correctly scoped?
2. Reuse findings — Per MODULE-REUSE-POLICY: does Order V1 duplicate a canonical module? Specifically inspect the product-catalog module (modules-hub) and HC01's product-catalog. Classify the Order catalog capability as exactly one of USE / USE+ADAPT / NOT APPLICABLE / REJECT / MISSING. Is MT01 bootstrap applicable?
3. Product overlap findings — Does Order overlap with HC01 (headless commerce), CM01 (claim/case), TT01 (ticket tracking), or any other portfolio product? Verify native capability before citing overlap.
4. Impact on BK01 locked appointment contracts — Does adding Order silently change the locked appointment-only boundary? What must be superseded/amended vs preserved historical?
5. Sequencing — Should Order Phase 0 run documentation-only in parallel with BK-A remediation, or wait for BK-A runtime baseline closeout? (CURRENT_STATUS: BK-A is next eligible heavy track; CONT-03/DB-backed gates still open.)
6. Required parent decisions — Enumerate the concrete decisions the Owner must make.

Evidence rules:
- Ground every claim in the on-disk source documents. Cite the exact path for each verified fact.
- Mark any changing or unverified claim with the literal token `UNVERIFIED`.
- Label unproven business outcomes with the literal token `hypothesis`.
- Do not invent facts. If a capability is not natively present in a product, say so.

STEP 3 — WRITE THE EXACT OUTPUT FILE:
Write your full raw expert answer to EXACTLY this path (create it):
D:\AI-Workspace\projects\saas-product-hub\docs\council-bk01-order-capability-2026-09-05\raw\qwen.md

Output must contain the following 11 sections in this exact order:
1. Recommendation (APPROVE PHASE 0 / REMEDIATE / REJECT-DEFER)
2. Verified facts / evidence used (with paths)
3. Boundary findings
4. Reuse findings (with module classification)
5. Product overlap findings
6. Impact on BK01 locked contracts
7. Required Owner decisions
8. Risks / failure cases
9. Assumptions
10. Open questions / missing evidence
11. Confidence 0-100

Do NOT issue the final gate verdict. Do NOT authorize production implementation. This is an expert evidence file only.

Write the file directly to disk (do not rely on stdout echo). After writing, verify the file exists on disk and report its absolute path and line count in your final message. Use your file/shell tools in this workspace as needed.

ALLOWED WRITE PATHS: the single output file above, plus temporary scratch under your own workspace only.
PROHIBITED PATHS: any source-of-truth file under the council-product-destination-2026-09-03-canonical-01 tree other than your output file; the BK01 product repo; the modules-hub repo; any other expert's raw output; any other project area. Never modify or delete existing files in the frozen brief directory.
