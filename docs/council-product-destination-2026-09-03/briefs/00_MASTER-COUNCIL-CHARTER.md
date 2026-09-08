# WSTERA Product Destination Council — Round 1 Charter

Date: 2026-09-03
Parent repo: `D:\AI-Workspace\projects\saas-product-hub`
Capability library: `D:\AI-Workspace\projects\modules-hub`

## Purpose
Round 1 determines what each selected product should ultimately be, who pays for it, what V1 must accomplish, and whether the current implementation direction supports that destination.

This is a product/business council, not an implementation sprint.

## Products in scope
1. DC01 — DocCraft — `products/DocCraft`
2. BK01 — Booking — `products/booking`
3. PS01 — Pawstia — `products/PawSpace`
4. WS01 — WSTERA Supply Management — `products/WSM`
5. LK01 — WSTERA Link — `products/WSTERA-Link`
6. MT01 — Multi-Tenant AI Starter Kit — `products/multi-tenant-ai`
7. CM01 — Booking Claim & Case Management Module — `products/booking-ticket-module`

## Evidence rule
Evidence-first. No inference may be promoted to fact. Missing evidence must be reported as `UNKNOWN` or `UNVERIFIED`, never filled by assumption.
## Mandatory verification before analysis
For each product, inspect the real repository state first: current branch, HEAD, working tree, relevant source code, current docs, decision records, and recent gate/evidence files.

Do not trust a status sentence merely because it is in `CURRENT_STATUS.md`. If docs, Git state, code, or evidence disagree, record the contradiction and prefer the strongest current evidence.

Known caution at council start:
- Pawstia `docs/CURRENT_STATUS.md` is older than the successful 2026-09-03 Phase 13 verification work; verify current branch/CI/evidence directly.
- MT01 `docs/CURRENT_STATUS.md` contains unresolved `$branch` / `$head` placeholders; verify Git directly.

## Hermes role
Hermes is orchestrator only: collect evidence, dispatch experts, preserve raw outputs, enforce boundaries, and bundle results.
Hermes must not invent missing product facts, silently reconcile contradictions, or decide the final product destination by itself.

## Expert lenses
- Product/Customer: user, buyer, pain, workflow, adoption, willingness to pay.
- Business/Market: revenue model, competition, differentiation, distribution, commercial viability.
- Technical/Delivery: implementation reality, dependency cost, reusable capability fit, risk and distance to V1.

Each expert must distinguish `VERIFIED`, `INFERENCE`, `UNVERIFIED`, and `RECOMMENDATION`.
## Questions every product review must answer
- What problem is being solved, and for whom?
- Who is the primary user and who is the buyer?
- What is the single primary product identity/destination?
- What is the core value loop?
- What is the minimum V1 finish line that is usable and sellable?
- How does the product make money, and why would the buyer keep paying or buy it?
- What is the real differentiation versus existing tools/workarounds?
- What is already built, what is missing, and what may be unnecessary?
- Which Module Hub capabilities could increase value or reduce delivery cost without bloating V1?
- What is the largest business risk and technical/delivery risk?

## Round 1 verdicts
Each product receives exactly one provisional verdict: `LOCK`, `REVISE`, `PAUSE`, or `DROP`.
This verdict remains provisional until Round 2 portfolio arbitration.

## Freeze boundary
During the council: no feature implementation, migration, refactor, deploy, production DB apply, major merge, or new product admission.
Research, read-only audit, evidence collection, and council-document creation are allowed.

## Module Hub rule
`modules-hub` is a read-only capability library. Never import it across repositories and never modify its canonical modules to satisfy one product. Candidate reuse must be evaluated as `USE_NOW`, `LATER`, `NOT_RELEVANT`, or `SHARED_CAPABILITY`.

## Output
Raw expert outputs go under `raw/`. Product synthesis goes under `round1-product-reviews/`. Module analysis goes under `module-scan/`. Round 1 must end with seven evidence-backed product destination cards ready for Round 2.
## Round 1 execution sequence
Run the product reviews in this order unless the Owner explicitly changes it:
1. DC01
2. BK01
3. PS01
4. WS01
5. LK01
6. MT01
7. CM01
8. Cross-product Module Hub capability scan

For each product:
1. Verify repository truth.
2. Collect evidence and contradictions.
3. Dispatch the three expert lenses independently.
4. Save each expert's unedited output under `raw/<PRODUCT>/`.
5. Produce one evidence-backed product destination card under `round1-product-reviews/`.
6. Do not start implementation from the verdict.

Do not let a later expert overwrite or summarize away an earlier dissent. Preserve disagreement for Round 2.

Round 1 is complete only when all seven product cards and `module-scan/ROUND1-MODULE-CAPABILITY-MAP.md` exist and clearly label unresolved facts.