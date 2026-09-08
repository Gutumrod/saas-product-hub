# AGENTS.md — SaaS Product Hub Governance

This file governs `D:\AI-Workspace\projects\saas-product-hub` and nested product/service work unless a more specific nested instruction adds stricter rules.

## Source-of-Truth Order

1. Latest explicit Owner decision.
2. `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md` and locked platform architecture.
3. `docs/platform/MODULE-REUSE-POLICY.md` for reuse procedure.
4. Product-specific locked PRD/architecture/security/release documents.
5. Current repository/code/runtime evidence.
6. Historical logs/evidence.

## Mandatory Pre-Build Sequence

Before production implementation introduces or materially changes a product, service, backend capability, major feature, infrastructure capability, or shared platform capability:

1. Read the product Source of Truth.
2. Perform the MT01 Bootstrap Check when the work is SaaS/backend/multi-tenant/bootstrap related.
3. Perform the Module Reuse Check from `docs/platform/MODULE-REUSE-POLICY.md`.
4. Resolve central-platform vs product-runtime ownership before selecting local modules.
5. Record module decisions and provenance plan.
6. Require `Reuse Gate: PASS` before coding.

Do not jump directly from a brief to production implementation.
## Reuse Hard Stop

If a canonical reusable capability is duplicated without an evidence-backed `REJECT WITH JUSTIFICATION`:

`STOP — REUSE GATE FAILED`

Reviewer classification: `UNJUSTIFIED_DUPLICATE_IMPLEMENTATION`.

Pure remediation that preserves an existing capability may use the policy-defined `Reuse Gate: N/A` exemption with a specific reason. Capability-building work may not.

## Copy-and-Own

`modules-hub` is a source library. Copy a reviewed module into the destination repository, record source version + immutable commit + copy date + local changes, and adapt only the destination-owned copy.

Never add a cross-repository runtime dependency to Module Hub. Never patch Module Hub inline to satisfy one product; open a separate scoped upstream task.

## Platform Boundary

Selecting MT01 or finding `payment` / `subscription` modules does not authorize product-owned duplication of central WSTERA platform services. Follow `docs/platform/BILLING_CORE_PLAN.md` and other locked platform contracts first.

## Agent Relay

Any build-capable Agent Relay dispatch must satisfy the canonical Relay reuse preflight. Missing or failed applicable reuse evidence is a hard HOLD before build cards are created or released.

## Existing Products

This governance change is prospective. Do not mass-refactor existing products. Audit and remediate them one at a time under separate approved scopes.

## Documentation-First Brief Rule

Owner decision effective 2026-09-08:

- Do not use chat as the canonical home of a brief, handoff, remediation plan, execution plan, or continuation instruction.
- Every new brief must be written to a durable repository document before it is handed off or used as execution authority.
- Chat may report status, decisions, commit SHAs, and the exact document path; it must not be the only copy of the brief.
- Every brief must contain a `Source-of-Truth References` section with exact repository paths and, when material, commit SHAs or runtime evidence.
- If a required reference does not exist, create or repair the evidence document first. Do not fill the gap with an unsupported chat summary.
- Handoffs must record current state, verified evidence, scope, blockers, decisions, acceptance criteria, and the next authorized action.
- Historical or failed evidence must remain clearly labeled and must not be silently rewritten into current truth.

This rule applies to House, product coordinators, agents, Council follow-ups, platform work, and cross-product remediation.
