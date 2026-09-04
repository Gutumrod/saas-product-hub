# CM01 Open Decisions

Gate verdict: REMEDIATE

## OD-001 License Strategy

Decision: How will paid source distribution work given the current MIT license conflict with a paid single-use model?

Options:

- A (Recommended): Replace/augment sale package with commercial EULA or dual-license terms before first sale.
- B: Keep MIT and sell only convenience/support, accepting redistribution risk.
- C: Delay sale until legal/licensing review produces a final policy.

Council support: 3/3 that the contradiction is real and must be resolved before sale.

## OD-002 Buyer Demand Threshold

Decision: What evidence is required before investing in packaging and commercial launch?

Options:

- A (Recommended): Require lightweight validation from real dev/agency buyers before launch.
- B: Proceed with packaging as a low-cost experiment and treat lack of demand as accepted risk.
- C: Pause commercial work until Business/Market Gate.

Council support: 3/3 that demand is unvalidated and material.

## OD-003 Product Positioning

Decision: How should CM01 be described without contradicting itself?

Options:

- A (Recommended): Position as a usable local-first source template with BYO-backend roadmap.
- B: Position as demo/template only until backend adapter exists.
- C: Position as agency/backend-ready only after adapter work.

Council support: 3/3 that backend is not required for V1 template usability; 3/3 that draft revenue positioning tension must be fixed.

## OD-004 Backend Adapter Direction

Decision: If/when post-V1 adapter work starts, which path is authoritative?

Options:

- A (Recommended): Defer adapter decision until buyer demand and architecture gate.
- B: Supabase/REST adapter as suggested by PRD roadmap.
- C: Explore Module Hub `ticket-tracker` wiring only after Module Hub scan is released.

Council support: 3/3 that backend is post-V1; 3/3 that Module Hub scan is HOLD; 3/3 that current `ticket-tracker` is not a drop-in.

## OD-005 Hardening Gates

Decision: Which technical checks must pass before source package sale?

Options:

- A (Recommended): Remediate or risk-accept lint, E2E-in-CI, dependency audit, license audit, secret scan, SAST, and cross-browser claims.
- B: Ship with documented known limitations and accepted-risk ledger.
- C: Block all packaging until every check is fully automated.

Council support: 3/3 that these gaps exist and affect source-product readiness.

## OD-006 Buyer Onboarding Pack

Decision: What documentation is required for the V1 buyer?

Options:

- A (Recommended): Include embed guide, adapter guide, theme guide, limitations, distribution manifest, and support boundary.
- B: Ship README only and accept support/refund risk.
- C: Delay sale until full docs and examples are independently reviewed.

Council support: 3/3 that buyer onboarding/docs are missing or insufficient.

## OD-007 Repository Injection Claim

Decision: How should adapter integration be represented?

Options:

- A (Recommended): Say adapter swap is source-code integration today; do not claim config-level injection.
- B: Add repository prop/config before sale.
- C: Avoid backend-adapter claims entirely in V1.

Council support: 1/3 explicit emphasis; no dissent.
