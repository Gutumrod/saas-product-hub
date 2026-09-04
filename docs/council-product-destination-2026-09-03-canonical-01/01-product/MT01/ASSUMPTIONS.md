> **NON-CANONICAL / DO NOT USE AS COUNCIL OUTPUT OR FUTURE COUNCIL INPUT**
> Author: `@default` (NOT `agent-codex`). See `DEVIATION-RECORD.md`. Owner Decision 2026-09-03.

---

# MT01 — Product Gate Assumptions

Procedure: `llm-council-gate` v0.3.2. Gate: Product Gate (identity-anonymized).
Source of truth: `PRODUCT-SYNTHESIS.md` (gate verdict **REMEDIATE**).
This file records the assumptions the Product Gate relied upon. It is intentionally **not** a risk register (Risk Gate is excluded from this task's scope); each assumption is an explicitly-labeled premise that future gates (Buyer/Scope, License/IP, Architecture, Risk, Portfolio Arbitration, build) should confirm or overturn.

## Assumptions about the artifact and buyer

- **A-001 — Reference server = proof, not product.** The Express reference server in `server/` is treated solely as the composition proof (tenant -> auth/RBAC -> AI-provider abstraction -> subscription/entitlement -> Stripe charge -> verified webhook -> entitlement transition). We assume no V1 buyer is sold the reference server as a production application. (Backed 3/3 in synthesis; non-goal confirmation required by build gate.)
- **A-002 — Buyer owns production infrastructure.** We assume every buyer brings their own Supabase, Stripe, AI-provider, and persistence accounts and replaces the in-memory mock adapters (`payment-demo.ts` idempotency `Set`, mock repos) with their own production infrastructure. No hosted infrastructure ships in V1.
- **A-003 — Primary buyer is technical.** We assume the primary buyer is a developer / indie-builder / small team / agency who can read TypeScript, provision their own cloud accounts, and operate a self-hosted backend — not a non-technical end customer. (Buyer-segment split, OD-001, is still an open Owner decision.)
- **A-004 — No authentication UI.** We assume V1 has no login/auth UI/frontend; the buyer consumes the backend via API and code. (Consistent with non-goal "no auth UI/frontend".)

## Assumptions about technical evidence

- **A-005 — Tests and typecheck are the differentiation proof.** We assume the 13/13 passing tests and the clean typecheck at HEAD `92139cf` remain valid and reproducible at the release commit. These are point-in-time; they must be re-run at release (time-sensitive, per synthesis §8).
- **A-006 — Module drift is real and must be re-synced.** We assume the module copies currently lag the canonical Module Hub exactly as recorded (ai-provider 0.2.0->0.3.0, tenant-context 0.2.0->0.3.0, auth-supabase 0.1.0->0.2.0, subscription = older engine) and that re-sync is a hard packaging precondition, not optional polish (D-007).
- **A-007 — `webhook-receiver` is wired in V1.** We assume the 7th module is present in the repo and wired into the Stripe webhook path, and that whether it ships as an "included capability" or an "internal dependency" is an open Owner decision (OD-002), not resolved by this gate.
- **A-008 — No OTel adapter.** We assume only `MemoryTracer`/`NoopTracer` ship and no OpenTelemetry exporter is included, so "distributed tracing" must not be marketed as a V1 capability until OD-004 is decided.

## Assumptions about the productization boundary

- **A-009 — V1 is non-production by contract.** We assume "backend-only, explicitly non-production" is a hard boundary of the sellable V1, and that all production-hardening items are explicitly documented "buyer continues from here."
- **A-010 — Release requires preconditions.** We assume no package/first sale ships from HEAD `92139cf` because L0 (buyer/scope), L2 (license/IP), L1 (clean-install proof), provenance pins, and a dependency/license audit at the release commit are all unresolved (3/3).
- **A-011 — Productization is deferred to P5.** We assume productization goes through the L0-L5 one-time-product ladder in portfolio **P5** and is not authorized by this Gate. (Consistent with synthesis §1 and CURRENT_STATUS.md DEFERRED TO P5.)

## Assumptions that could overturn this synthesis

- **A-012 — Registry `commercial_status: "sellable"` is stale.** We assume the registry claim `commercial_status: "sellable"` currently contradicts the DELAYED-to-P5 reality and must be reconciled before any catalog/sales claim. If the registry is actually authoritative, the Product Gate recommendation would need revisiting.
- **A-013 — No hidden module drift beyond the recorded set.** We assume the recorded drift (ai-provider, tenant-context, auth-supabase, subscription) is the complete drift set. A fresh hub-vs-copies diff may reveal more. Reconcile before packaging (OD-002 / L3).

These assumptions are premises, not conclusions. Each should be explicitly confirmed or overturned by the gate responsible for it before build authorization.
