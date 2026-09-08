# Round 1 Brief — Module Hub Capability Scan

Canonical library: `D:\AI-Workspace\projects\modules-hub`
Products: DC01, BK01, PS01, WS01, LK01, MT01, CM01
Output: `module-scan/ROUND1-MODULE-CAPABILITY-MAP.md`

## Objective
Identify existing reusable capabilities that can increase product value, reduce duplicated delivery work, or become shared portfolio capability — without bloating V1 or replacing proven product-native domain logic.

## Mandatory sources
Verify Module Hub Git/current state first, then inspect:
- `INDEX.md`
- `modules/REGISTRY.md`
- `modules/ROADMAP.md` where needed
- `docs/CURRENT_STATUS.md`
- each candidate module's `MODULE.md`, public entry point, integration example, version and relevant tests before recommending it

## Canonical rule
`modules-hub` is a read-only source library.
- Never import across repository paths.
- Never modify canonical module code for a product-specific need.
- Reuse means copy the module into the destination product and adapt only the copy, after later implementation authorization.
- Council performs no copying or code changes.

## Evidence rule
A module name that sounds relevant is not evidence of fit. A product already having similar native behavior is not evidence that it should be replaced.
## Required evaluation per product/module pair
Record:
- Product and candidate module
- Product need/problem being served
- Existing native capability or overlap
- Customer-visible value gained
- Delivery/complexity cost
- Dependencies and integration risk
- Module maturity/version evidence
- Decision: `USE_NOW`, `LATER`, `NOT_RELEVANT`, or `SHARED_CAPABILITY`
- Reason and confidence

`USE_NOW` is allowed only when the capability is required by the proposed V1 destination and materially better than rebuilding/retaining existing behavior.

`SHARED_CAPABILITY` means the capability should be treated as portfolio plumbing or common foundation, not marketed as a feature merely because several products need it.

## Cross-product analysis
After all seven products are scanned, identify:
- capabilities requested by multiple products
- duplicated product-native implementations that may warrant future convergence
- modules already copied/vendored and whether they remain justified
- capability gaps not present in Module Hub

A missing module is a finding only. Do not create or propose implementation details for a new module in Round 1.

## Boundary
No Module Hub commit, copy, refactor, version bump, module creation, dependency installation or product integration. Round 1 output is decision evidence only.