> **NON-CANONICAL / DO NOT USE AS COUNCIL OUTPUT OR FUTURE COUNCIL INPUT**
> Author: `@default` (NOT `agent-codex`). See `DEVIATION-RECORD.md`. Owner Decision 2026-09-03.

---

# MT01 — Product Gate Open Questions

Procedure: `llm-council-gate` v0.3.2. Gate: Product Gate (identity-anonymized).
Source of truth: `PRODUCT-SYNTHESIS.md` (gate verdict **REMEDIATE**).
This file tracks the unresolved questions that the Product Gate surfaced. They are deliberately separated from Decision Log (settled or owner-decided items) and Assumptions (premises). Each open question has an owner-answerable shape and a target gate to resolve it.

## Blocking before Product Gate can serve as build-approval evidence

- **Q-001 — Buyer segment lock (OD-001).** Which buyer is primary — indie developer / indie-builder / small team / agency — and what is the buyer licensed to build? Unchecked BRIEF.md TODO. Target: Owner (L0 buyer/scope lock) before build approval.
- **Q-002 — V1 module list, `webhook-receiver` in/out (OD-002).** BRIEF lists 6 modules; repo/server carry 7 (`webhook-receiver` wired into the Stripe path). Is it an "included capability" or an "internal dependency"? Target: Owner, before scope lock, reflected consistently in BRIEF / registry / sales copy.
- **Q-003 — License variant + IP terms (OD-003).** No LICENSE file anywhere; no dependency-license audit; no recorded license/provenance for the copied modules. Which MT01 license, and is redistribution of the copied modules permitted? Target: Owner (L2) + legal review.
- **Q-004 — OTel / tracing V1 scope (OD-004).** In-process demo only, or a paid add-on OTel adapter? Only `MemoryTracer`/`NoopTracer` ship today. Target: Owner (scope).
- **Q-005 — Production persistence reference in V1 (OD-005).** Does V1 ship any production persistence reference, and if so which stack (PostgreSQL / Supabase DB / Prisma / Drizzle)? Target: Owner (scope).

## Blocking before any first sale / package (release preconditions)

- **Q-006 — Clean-install proof (L1).** Has a clean machine, non-author, with no WSTERA secrets successfully installed from the release candidate? No such evidence exists yet. Target: build/QA (L1).
- **Q-007 — Provenance pins.** At which canonical hub commit was each module copy taken? No precise source-commit manifest exists, so provenance and bug-fix lineage are unprovable today. Target: build (L3 provenance manifest).
- **Q-008 — Dependency/license audit at release.** High/critical npm findings are time-sensitive; has the audit been regenerated at the release commit and the current finding/mitigation recorded? Target: build/QA (L2 + release).
- **Q-009 — Fulfillment path (L4).** Can a buyer actually receive the artifact (delivery channel, versioned archive, checksum, install from artifact, not from author's working tree)? No evidence a buyer can receive it. Target: Owner/build (L4).
- **Q-010 — Support boundary (L5).** What is the defined support window / update policy for a one-time product before first sale? Target: Owner (L5).
- **Q-011 — Registry reconciliation.** `commercial_status: "sellable"` contradicts the DELAYED-to-P5 readiness. When is the registry reconciled so no catalog/sales claim is stale? Target: Owner/portfolio.

## Confirmatory questions for downstream gates (not blocking)

- **Q-012 — Test/time-of-HEAD reproducibility.** Are the 13/13 passing tests and clean typecheck at `92139cf` still green at the release commit? (Current evidence is point-in-time.) Target: build/QA at release.
- **Q-013 — Complete-hub-drift inventory.** Is the recorded drift (ai-provider, tenant-context, auth-supabase, subscription) the complete set, or does a fresh hub-vs-copies diff reveal more before packaging? Target: build (re-sync).

## Questions explicitly out of scope for this file / this gate

- Pricing, license economics, revenue model, competition, GTM (Business/Market gate).
- Architecture design decisions (Architecture gate).
- Risk ownership and mitigations (Risk gate — excluded from this task; this file records open questions, not risk register content).
- Portfolio resource arbitration (Portfolio Arbitration gate).

Each question above is a decision a human Owner must answer; none is answerable by further machine inspection of the same inputs.
