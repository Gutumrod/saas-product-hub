# Pipeline Status — Billing Core Multi-Product Profile Council

## Verified baseline before Council fan-out
- `saas-product-hub` branch: `master`
- HEAD: `7e1b65cac3f44e8a256d7f1cac976e059a1b98a1`
- Upstream divergence: `0/0`
- Working tree: DIRTY before this Council; unrelated pre-existing changes are out of scope and must not be modified, staged, committed, cleaned, or swept.

## Canonical inputs read from disk
1. `docs/platform/BILLING_CORE_PLAN.md`
2. `docs/platform/BILLING_CORE_PHASE_0_5_SECURITY_CONTRACTS.md`
3. `docs/strategy/WSTERA-FREE-FIRST-INFRASTRUCTURE-POLICY.md`
4. `docs/strategy/BUILD-TO-SELL-EXECUTION-2026-09-06.md`
5. `docs/council-payment-core-2026-09-01/FINAL-CODEX-SYNTHESIS.md`
6. Current seven Product Build-to-Sell briefs for BK01, DC01, PS01, LK01, WS01, MT01, CM01.

## Verified drift to preserve, not silently rewrite
- `BILLING_CORE_PLAN.md` still carries an older portfolio model where DocCraft is described as subscription/future subscription; current Owner decision is free Public Pilot then later one-time unlock experiment.
- `BILLING_CORE_PLAN.md` explicitly accepted two billing implementations because BK01 was fully excluded; this Council must evaluate a non-forced transitional facade/adapter path without rewriting BK01 solely for architecture symmetry.
- Phase 0.5 security contract states product credential binding alone prevents cross-product access but does not create same-product account isolation; account-bound assertions are required where account isolation is claimed.

## Current stage
Architecture + Risk/Invariant targeted Council only. Implementation Gate remains HOLD and Owner build authorization is absent.
## Expert fan-out
- Claude: `t_f10d7915` — running
- AGY: `t_eb9a2134` — running
- Qwen: `t_7ef699f4` — running
- Dependencies between expert tasks: NONE
- Raw outputs remain identity-separated until all completed; Candidate mapping must not be created before then.
## Status update — 2026-09-08 Owner clarification
The earlier expert-fan-out lines above are historical snapshots and are superseded by this section.

Verified expert outcomes from Hermes Kanban:
- AGY `t_eb9a2134` — DONE; valid raw `02-architecture-risk/raw/AGY.md`; proposed PASS 84/100.
- Qwen `t_7ef699f4` — DONE; valid raw `02-architecture-risk/raw/QWEN.md`; proposed REMEDIATE 84/100.
- Claude original `t_f10d7915` — BLOCKED due protected filename collision; excluded from Council evidence.
- Claude clean-room replacement `t_12535365` — DONE; valid raw `02-architecture-risk/raw/CLAUDE-EXPERT.md`; proposed REMEDIATE 78/100.

Owner added post-expert clarification:
- `OWNER-ADDENDUM-BK01-COMPATIBILITY-FIRST-EXTRACTION-2026-09-08.md`
- frozen expert brief remains unchanged
- synthesis must explicitly address Compatibility-First Extraction and any conflict with expert evidence

Prepared pre-build execution plan:
- `PRE-BUILD-BRIEF-WSTERA-BILLING-CORE-2026-09-08.md`
- implementation remains unauthorized until Council closure + explicit Owner build authorization.
