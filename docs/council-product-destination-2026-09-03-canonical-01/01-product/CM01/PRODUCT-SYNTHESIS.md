# CM01 Product Gate Synthesis

Procedure: `llm-council-gate` v0.3.2  
Product: CM01 Booking Claim & Case Management Module  
Inputs: `COUNCIL-BRIEF.md`, `CANDIDATE-A.md`, `CANDIDATE-B.md`, `CANDIDATE-C.md`, `SYNTHESIS-MANIFEST.md`  
Experts completed: 3/3. No degraded run.  
Candidate confidence: A=78, B=86, C=78.

## 1. Problem Understood

CM01 is a local-first, Thai-first React case-management UI template/module for booking claims and service/product cases. It is a `one_time_source_product` / source product, not a deployed SaaS, not a backend capability, and not a BK01 feature.

The primary buyer is a frontend developer or web agency licensing source code to embed in client work. The in-app end user is a single-role case officer. V1 ends at a sellable single-use template tier: a complete 3-page UI workflow with localStorage persistence and repository boundaries. V1 does not include auth, tenancy, deployment, external database/API, Supabase adapter, Module Hub integration, multi-user sync, notifications, binary upload, or hosted widget.

## 2. Verified Facts

- CM01 product identity is a local-first, Thai-first React case-management UI template/module, not a deployable product or BK01 feature. Agreement: 3/3.
- CM01 registry status is source-product / one-time-source with commercial/support/operations acceptance not yet complete. Agreement: 3/3.
- Primary buyer is frontend developer / web agency; end user is a single-role case officer. Agreement: 3/3.
- V1 implemented scope is the 3-page workflow: intake, ticket detail/action, history/retention. Agreement: 3/3.
- No auth or multi-role model is included by design. Agreement: 3/3.
- LocalStorage is the only current adapter; `TicketRepository` is the intended boundary for future adapter work. Agreement: 3/3.
- Backend capability is not required for usable V1 template tier; backend adapter is post-V1 for agency/hosted-widget paths. Agreement: 3/3.
- The code baseline is reported complete and CI-green: 63 unit/integration tests, 28 Chromium E2E, typecheck, and build pass; HEAD `6202108`; main clean and aligned with origin/main. Agreement: 3/3, with Candidate B noting it verified CI config/source but did not independently query Actions.
- CM01 must remain separated from BK01 and Module Hub `ticket-tracker`; similar "ticket" naming is not evidence of merge/reuse fit. Agreement: 3/3.
- Module Hub `ticket-tracker` is backend-only and not a drop-in fit for CM01's current synchronous UI repository/data shape. Agreement: 3/3.
- The `$39`, `$129`, and `THB 350/mo` figures are proposals in a working draft, not approved prices. Agreement: 3/3.
- Current hardening gaps include disabled lint, E2E not in CI, advisory audit findings, and disabled license/secret/SAST checks pending owner/tool decisions. Agreement: 3/3.

## 3. Consensus / Majority / Dissent

### 3/3 Consensus

- Lock CM01 as a source-code UI template/module for dev/agency buyers.
- Preserve CM01 separation from BK01, TT01, and Module Hub `ticket-tracker`.
- Treat backend adapter work as post-V1, not a blocker for local-first V1 usability.
- Treat remaining V1 distance as packaging, documentation, licensing, and hardening, not feature construction.
- Do not approve or decide pricing in Product Gate.
- Treat buyer demand as unvalidated and commercially material.
- Resolve MIT-vs-paid-single-use contradiction before first sale.

### 2/3 Majority

- Candidate A and C emphasize a sellable single-use template tier as the V1 finish line; Candidate B agrees with source-product V1 but avoids endorsing the price/tier framing beyond proposal status. Agreement: 2/3 emphasis, 3/3 underlying boundary.
- Candidate A and C explicitly frame packaging + hardening as days of work rather than feature build; Candidate B agrees substantively but focuses on exact PRD scope already complete. Agreement: 2/3 emphasis, 3/3 underlying conclusion.

### 1/3 Emphasis-Dissent

- Candidate B uniquely flags the adapter injection nuance: repository swap currently requires a source edit in `App.tsx`, not a configuration-level prop. Agreement: 1/3 emphasis; no candidate disputes it.
- Candidate B uniquely flags timezone buyer exposure and `super-admin` theme naming as buyer-facing caveats. Agreement: 1/3 emphasis; no candidate disputes them.
- Candidate B uniquely gives higher confidence, 86 vs A=78 and C=78, because product identity evidence is strong. Confidence spread is noted, not reconciled into expert re-decision.

## 4. Missing Evidence / Unresolved Questions

- No verified buyer demand, sale, channel evidence, or market research exists.
- License strategy is unresolved: MIT conflicts with a paid single-use license model.
- Pricing/package names remain proposals only and are outside Product Gate approval.
- `REVENUE-STRATEGY.md` has positioning tension: it proposes template sale while also saying a backend adapter is needed before more than demo-template status.
- Backend adapter direction is unresolved: Supabase/REST roadmap vs possible Module Hub `ticket-tracker` wiring. Module Hub scan remains HOLD.
- Buyer onboarding docs are missing or insufficient: embed guide, adapter guide, limitations, distribution contents, and support expectations.
- Tooling/security hardening disposition is incomplete: lint, E2E-in-CI, dependency audit, license audit, secret scan, SAST.
- Cross-browser E2E is not verified beyond Chromium.
- Repository injection is not config-level today; buyer-facing claims must not overstate drop-in backend swapping.

## 5. Synthesizer Recommendation

Issue Product Gate verdict: REMEDIATE.

Lock CM01's product definition as a Thai-first, local-first React source-code case-management UI template/module for frontend developers and agencies. Do not merge it into BK01, do not bundle it with Module Hub `ticket-tracker`, and do not require backend capability for V1 template usability.

Before build/release work proceeds toward sale, remediate the owner-decision and packaging blockers: license model, demand validation threshold, positioning language, buyer onboarding/docs, tooling/security disposition, and explicit post-V1 adapter direction.

## 6. Why This Recommendation

The experts are fully aligned on the core Product Gate question: what CM01 is, who it serves, and where V1 ends. That makes `BLOCK` too strong for the product identity decision.

`PASS` would be too loose because Product Gate must not let contradictory licensing, unvalidated demand, unresolved packaging claims, and source-product hardening gaps flow into a sellable artifact unchecked. The right decision is `REMEDIATE`: product direction is locked, but owner decisions and hardening must be resolved before build/release authorization for a paid V1 package.

## 7. Rejected Alternatives + Why

- Reject "make CM01 a deployable SaaS/product": contradicted by PRD/README/registry and would require backend/auth/tenancy outside V1. Agreement: 3/3.
- Reject "merge CM01 into BK01": documented owner decisions separate the families and BK01 has its own native full-stack ticket system. Agreement: 3/3.
- Reject "merge/bundle CM01 with Module Hub `ticket-tracker` now": Module Hub scan is HOLD, and `ticket-tracker` is backend-only with a different contract. Agreement: 3/3.
- Reject "backend adapter required for V1": experts agree local-first template V1 is usable without backend; adapter belongs to post-V1 or higher-tier work. Agreement: 3/3.
- Reject "approve pricing in this gate": figures are working-draft proposals, not Product Gate decisions. Agreement: 3/3.
- Reject "commercial PASS without remediation": license, demand, positioning, docs, and tooling gaps are unresolved. Agreement: 3/3 on gaps; synthesizer verdict.

## 8. Gate Verdict + Blockers

Gate Verdict: REMEDIATE

Build-approval blockers:

- Owner must decide license strategy for paid source distribution, especially MIT vs single-use commercial license.
- Owner must decide whether V1 sellable package can proceed without buyer-demand evidence, or define a minimum validation threshold first.
- Owner must reconcile product positioning so CM01 is not simultaneously sold as usable V1 and described as needing backend before being more than a demo.
- Owner must approve exact V1 package scope and limitation language: localStorage-only, no auth, no deployment, no external DB/API, no multi-user sync, Chromium-only E2E.
- Owner must decide hardening disposition: lint, E2E in CI, dependency audit findings, license audit, secret scan, SAST, and cross-browser claim.
- Owner must approve buyer onboarding scope: embed guide, adapter guide, theming guide, distribution manifest, and support boundary.

Launch blockers:

- Final license/EULA must be in place before sale.
- Buyer-facing docs must explicitly state what is included and excluded.
- Pricing must be approved in Business/Market Gate or equivalent owner decision, not inferred from draft proposals.
- Source package must pass agreed hardening gates or carry explicit accepted-risk ledger.
- Any claim about backend integration must match the real integration mechanism.

## 9. Confidence 0-100

Confidence: 81

Rationale: product identity, buyer, V1 boundary, and separation from BK01/Module Hub are strongly supported by all three experts. Confidence is capped by unresolved commercial/legal/tooling decisions and lack of buyer-demand evidence.

## 10. Technical Document Pack

- `D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\CM01\PRODUCT-SYNTHESIS.md`
- `D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\CM01\PRODUCT-SOURCE-OF-TRUTH.md`
- `D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\CM01\PRODUCT-SCOPE.md`
- `D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\CM01\USER-FLOWS.md`
- `D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\CM01\BUSINESS-RULES.md`
- `D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\CM01\V1-ACCEPTANCE-CRITERIA.md`
- `D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\CM01\OPEN-DECISIONS.md`
- `D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\CM01\01-PRODUCT-OWNER-BRIEF.md`

## 11. Thai OWNER-BRIEF Reference

`D:\AI-Workspace\projects\saas-product-hub\docs\council-product-destination-2026-09-03-canonical-01\01-product\CM01\01-PRODUCT-OWNER-BRIEF.md`
