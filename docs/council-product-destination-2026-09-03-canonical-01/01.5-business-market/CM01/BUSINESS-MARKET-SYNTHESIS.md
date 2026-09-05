# CM01 Business / Market Synthesis

Gate: Business / Market Gate (Council #1.5)
Product: CM01 Booking Claim & Case Mgmt
Official verdict: **REMEDIATE**
Confidence: **59/100**
Locked blocker: **OD-001 License Strategy**

## Problem Understood

CM01 is not being evaluated as a SaaS runtime, backend product, or BK01 feature. It is a Thai-first, local-first React case-management UI template/module sold as source code to frontend developers or web agencies that embed case-management workflow into client projects.

The Business / Market Gate question is whether CM01 has a credible payer, reason to pay, commercial category, competitive position, and monetization path before later gates. The locked answer is conditional: the market direction is credible enough to continue, but the gate cannot PASS while the current MIT license conflicts with a paid single-use source-code distribution model.

## Verified Facts

- Expert denominator: 3/3.
- Official gate verdict artifact: `.secretary-relay/t_59b056c4/CM01-GATE-VERDICT.json`.
- Official verdict: **REMEDIATE**, confidence **59/100**.
- Effective Product Gate for CM01 remains **PASS**; historical Product Gate REMEDIATE is provenance only.
- CM01 product identity is a Thai-first local-first React source template/module for case-management UI.
- Primary payer is a frontend developer or web agency embedding the UI into client work.
- End user is a single-role case officer.
- V1 has no auth, no backend, and localStorage persistence by design behind the `TicketRepository` boundary.
- Backend absence does not block V1 sale when CM01 is positioned honestly as source code with BYO-backend / post-V1 adapter roadmap.
- Current pricing references such as `$39`, `$129`, and `THB 350/month` are draft proposals only, not approved pricing.
- `THB 350/month` recurring conflicts with the locked V1 source-template category and must not be treated as the V1 monetization direction.
- OD-001 is open: current MIT licensing permits redistribution/resale and conflicts with paid single-use source distribution.

## Agreement

- **3/3** experts supported a conditional commercial direction for CM01 as a narrow source-template product.
- **3/3** agreed backend absence is not the Business / Market blocker for V1.
- **3/3** agreed OD-001 is real and must be resolved before first sale.
- **3/3** agreed buyer demand and willingness-to-pay remain unvalidated.
- **3/3** agreed pricing and packaging are unresolved.

## Dissent

No substantive dissent exists on the verdict direction, product identity, buyer, backend-absence positioning, or OD-001 blocker.

Confidence differed only slightly: Candidate A gave 60/100, Candidate B gave 58/100, and Candidate C gave 58/100. One candidate framed CM01 as commercially credible but not blocked by backend absence; another emphasized that CM01 is not sellable as-is until pre-sale conditions are resolved. These positions are compatible under the locked REMEDIATE verdict.

## Market Thesis

CM01 has a plausible narrow buyer: Thai-first frontend developers and web agencies that repeatedly build back-office case, claim, after-sales, booking-support, or service-issue screens for clients.

The reason to pay is not generic dashboard UI. The proposed value is saved implementation and localization work around a ready case workflow:

- Thai-first case intake and officer workflow.
- Phone normalization and prior-history notice without autofill.
- Overdue visibility without automatic status mutation.
- Closed-case retention preview and destructive confirmation.
- Host-configurable theme and locked-branding behavior.
- Repository boundary that gives a buyer a clear backend integration point later.

The credible wedge is narrow and execution-sensitive. It works only if buyers value a Thai case-management workflow more than broad generic React/admin templates or continuing with Excel, LINE, Google Sheets, Make/n8n, paper, or ad-hoc manual operations.

## Competitive Context

External market evidence in the Council synthesis, fetched on 2026-09-05, supports that source templates and admin templates are a real category:

- ThemeForest admin templates: approximately `$12-69` regular and `$399-499` extended.
- AdminLTE: from `$69`.
- CoreUI React and a large ThemeForest React admin-template supply, including 518 React admin templates.

Indirect comparison points include:

- Thai custom CRM/back-office builds: approximately `THB 105k-420k`.
- Hosted ticket SaaS such as Zendesk: approximately `THB 720-4,300` per agent per month.
- Freshdesk: approximately `THB 1,075-4,042` per agent per month.
- Udesk: approximately `$765-1,118` per agent per year.

These comparisons support category credibility, not proven demand for CM01 specifically.

## Recommendation

Evidence-supported default: continue treating CM01 as a credible but narrow commercial source-template candidate, conditional on resolving OD-001 before first sale.

This is not an Owner decision. The Owner must choose the license strategy under OD-001 before the Business / Market Gate can be remediated to PASS.

## Rejected Alternatives

- **Launch/sell as-is under the current state:** rejected by 3/3 because OD-001 remains a real pre-sale blocker.
- **Treat backend absence as the blocker:** rejected by 3/3 because backend absence correctly defines the V1 source-template category.
- **Pivot V1 to hosted SaaS or per-seat recurring product:** rejected for V1 because it conflicts with the locked source-template identity.
- **Reject CM01 as commercially non-credible now:** not supported by the Council because the market/category thesis is credible enough for conditional validation.

## Gate Verdict

**Business / Market Gate = REMEDIATE.**

Reason: CM01 has a credible pre-build market thesis, but the gate cannot close while OD-001 remains unresolved. The current MIT license permits redistribution/resale and contradicts a paid single-use source-code model.

## Owner Decision Required

### OD-001 License Strategy

Decision: How will paid source distribution work given the current MIT license conflict with a paid single-use model?

- **Option A (Recommended in canonical Product Gate OPEN-DECISIONS.md):** Replace/augment sale package with commercial EULA or dual-license terms before first sale.
- **Option B:** Keep MIT and sell only convenience/support, accepting redistribution risk.
- **Option C:** Delay sale until legal/licensing review produces a final policy.

Council support: **3/3** that the contradiction is real and must be resolved before sale.

## Preserved Downstream Gaps

These are not the remaining Business / Market gate blocker under the locked verdict, but they must carry forward:

- OD-002 buyer demand: no primary buyer interviews, paid pilots, pre-orders, LOIs, conversion evidence, or channel proof.
- Willingness-to-pay versus cheaper generic React/admin templates.
- Final pricing and packaging.
- OD-006 buyer docs/support: embed guide, adapter guide, theme guide, limitations, distribution manifest, and support scope.
- OD-004 backend adapter direction: Supabase, REST, Module Hub `ticket-tracker`, or other path remains post-V1 and undecided.
- Support burden, unit economics, dev-days saved, localization hours avoided, cross-browser support, repeat purchase, and retention potential.

## Boundary

This document does not authorize product code changes, license mutation, pricing mutation, backend work, architecture work, implementation, launch, deployment, later-gate release, commit, or push.
