> **NON-CANONICAL / DO NOT USE AS COUNCIL OUTPUT OR FUTURE COUNCIL INPUT**
> Author: `@default` (NOT `agent-codex`). See `DEVIATION-RECORD.md`. Owner Decision 2026-09-03.

---

# MT01 — Product Gate Decision Log

Procedure: `llm-council-gate` v0.3.2. Gate: Product Gate (identity-anonymized).
Run root: `council-product-destination-2026-09-03-canonical-01`
Source of truth: `PRODUCT-SYNTHESIS.md` (11 sections, gate verdict **REMEDIATE**).
This log records (a) the decisions the Product Gate established and (b) the Owner decisions still pending before Product Gate can serve as build-approval evidence.

## A. Decisions established by this Product Gate (3/3 agreement)

| ID | Decision | Status |
|----|----------|--------|
| D-001 | MT01 is a one-time, versioned, self-hosted source product — a "Multi-Tenant AI Starter Kit" (modules + Express reference server in `server/` + docs + license). Not a hosted SaaS, not a deployable production app, not generic boilerplate. | Decided (3/3) |
| D-002 | The reference server is a composition proof only; it must never be sold as the product itself. | Decided (3/3) |
| D-003 | Primary buyer is a developer / indie-builder / small team / agency building their own multi-tenant AI SaaS backend. Buyer brings their own Supabase / Stripe / AI-provider accounts. | Decided (3/3) |
| D-004 | V1 ends as a backend-only reference composition, explicitly non-production, with in-memory/demo boundaries. | Decided (3/3) |
| D-005 | V1 explicit non-goals: production DB adapter, auth UI/frontend, deployment/CI, OpenTelemetry exporter, multi-instance idempotency. | Decided (3/3) |
| D-006 | The differentiation to sell is the pre-verified billing/composition loop (subscribe -> Stripe charge -> verified webhook -> entitlement transition), evidenced by 13/13 passing tests and clean typecheck at HEAD `92139cf`. | Decided (3/3) |
| D-007 | Module copies that lag the canonical Module Hub (ai-provider, tenant-context, auth-supabase, subscription) must be re-synced before any package ships — a hard release gate, not optional polish. | Decided (3/3) |
| D-008 | Tracing/observability must not be overclaimed: only `MemoryTracer`/`NoopTracer` ship; there is no OTel adapter in V1. | Decided (3/3) |
| D-009 | Gate verdict for Product: **REMEDIATE** — accept the converged product thesis, require the listed Owner decisions/preconditions before build-approval evidence. | Decided (3/3) |

## B. Open Owner decisions (blockers before Product Gate can be trusted as build-approval evidence)

These are lifted verbatim from `PRODUCT-SYNTHESIS.md` §8 (OD-001 .. OD-005). They are **not** decided here; they belong to the Owner/portfolio and precede any build authorization.

| ID | Owner decision needed | Related gate |
|----|----------------------|--------------|
| OD-001 | Lock the primary buyer segment and scope of what the buyer is licensed to build (L0 buyer/scope lock). | L0 |
| OD-002 | Lock the exact V1 module list, resolving whether `webhook-receiver` ships as an included capability or is cut from V1 (BRIEF counts 6; repo/server carry 7). | L0 / scope |
| OD-003 | Select the MT01 license variant and confirm per-module license/permission to redistribute the copied modules. | L2 license/IP |
| OD-004 | Decide OTel/tracing V1 scope (in-process demo only vs a paid add-on adapter). | L0 / scope |
| OD-005 | Decide whether any production persistence reference ships in V1 and, if so, which stack (PostgreSQL / Supabase DB / Prisma / Drizzle). | L0 / scope |

## C. Decisions explicitly NOT made by this Product Gate

- Pricing, license *economics*, revenue, competition, GTM (Business/Market gate).
- Application architecture and infrastructure design (Architecture gate).
- Risk register and risk-mitigation ownership (Risk gate — excluded from this task's scope; see `ASSUMPTIONS.md`/`OPEN-QUESTIONS.md` for a non-risk register treatment).
- Portfolio arbitration / module-vs-portfolio resource decisions (Portfolio Arbitration gate).
- Release authorization, packaging/fulfillment, or implementation authorization for P5.

These gates are separate; this log and its sibling product-pack files carry only Product Gate content.
