# WSTERA Module Reuse Policy

**Status:** CANONICAL / MANDATORY
**Effective:** 2026-09-04
**Applies to:** WSTERA SaaS Product Hub product/service implementation
**Canonical module library:** `D:\AI-Workspace\projects\modules-hub`
**Internal SaaS bootstrap reference:** `D:\AI-Workspace\projects\saas-product-hub\products\multi-tenant-ai`

## 1. Rule

WSTERA uses **Reuse Before Build**. Before production implementation introduces or materially changes a product, service, backend capability, major feature, infrastructure capability, or shared platform capability, the work must pass a Module Reuse Check.

A brief may not jump directly to coding. A builder may not create a replacement implementation merely because writing new code is easier.

## 2. Required inspection order

Before implementation, inspect:

1. The product Source of Truth and existing product-local modules/adapters.
2. `modules-hub/INDEX.md`, `modules/REGISTRY.md`, and serious candidate module documentation/source/tests.
3. MT01 when the work is SaaS, backend, multi-tenant, AI-SaaS, or a product-runtime/bootstrap concern.
4. Proven product-local capability from another WSTERA product only when there is direct evidence that it is reusable and its ownership/licensing/security boundary permits reuse.

Names alone are not evidence of fit. A module marked Completed is a candidate, not automatic authorization to use it without checking the contract.

## 3. Mandatory capability classification
Every required capability must be classified as exactly one of:

- **USE** — canonical module satisfies the requirement; reuse is mandatory.
- **USE + ADAPT** — canonical module is a valid base; copy it into the destination repository, then adapt only the destination-owned copy.
- **NOT APPLICABLE** — capability/module exists but this product does not need it, or a higher-authority platform boundary owns it.
- **REJECT WITH JUSTIFICATION** — a plausible module was inspected and cannot safely satisfy the requirement.
- **MISSING CAPABILITY** — no suitable canonical or proven reusable implementation exists; new implementation is allowed.

`REJECT WITH JUSTIFICATION` requires technical evidence such as incompatible contract/runtime, wrong security or trust boundary, deprecation, or a verified defect. `Writing it again is easier/faster` is never sufficient.

## 4. MT01 bootstrap rule

MT01 has two separate roles:

### Internal role — WSTERA SaaS Foundation / Bootstrap Standard

For a new WSTERA SaaS/backend runtime, MT01 is a reference baseline before architecture and implementation. At minimum inspect relevant baseline wiring/contracts for tenant context, Supabase auth, AI provider, enterprise/reliability features, webhook receiver, and central-platform integration seams.

MT01 is a reference and dogfood target, not a runtime dependency. Its local copied modules may be older than Module Hub; Module Hub registry/source is authoritative for current module versions.

### External role — Commercial Multi-Tenant AI Starter Kit

The sellable MT01 source product is productized separately under its own release gates. Internal WSTERA use should strengthen the patterns later sold externally, but internal bootstrap work does not silently widen the external product scope.

## 5. WSTERA platform boundary
Reuse does **not** mean every product owns every shared capability.

The current platform boundary is:

```text
WSTERA Platform
├─ Central Platform / Control Backend
│  ├─ accounts / customers / products
│  ├─ entitlement
│  ├─ billing / subscription
│  └─ support / case
└─ Product Runtime
   ├─ product schemas / data
   ├─ product workflows
   └─ product-specific runtime
```

If the central platform is authoritative, a product normally classifies the corresponding local module as `NOT APPLICABLE` and integrates through the locked platform contract. In particular, this policy does not authorize product-owned duplicate billing/subscription state machines that conflict with `BILLING_CORE_PLAN.md`.

## 6. Copy-and-own contract

`modules-hub` is a source library, not a cross-repository runtime dependency.

When a module is selected:

1. Copy the reviewed module into the destination repository.
2. The destination owns that copy.
3. Adapt only the destination-owned copy.
4. Do not import across repositories by filesystem path.
5. Do not modify upstream Module Hub to satisfy one product unless a separate upstream task proves the change belongs in the shared source.
6. Record provenance at copy time.

## 7. Provenance requirement

Each copied module must record at least:

```yaml
module: tenant-context
source_repo: modules-hub
source_version: 0.3.0
source_commit: <immutable commit>
copied_at: YYYY-MM-DD
local_changes: none
```

If adapted:

```yaml
local_changes:
  - added product-specific adapter
  - changed host integration
```

A table is acceptable if it preserves the same information. Provenance must name the immutable upstream commit; version alone is insufficient.

## 8. Required Module Reuse Check artifact

An implementation-ready reuse artifact must contain:
```text
Module Reuse Check: COMPLETE
MT01 Bootstrap Check: PASS | N/A
Reuse Gate: PASS

Required Capabilities
Module Decisions
Missing Capabilities
Provenance Plan
```

For each capability, record the candidate inspected, classification, and reason. `N/A` for MT01 is allowed only when the work is not a SaaS/backend/bootstrap concern and the artifact states why.

Pure remediation that preserves an existing capability may record `Reuse Gate: N/A` with a specific reason. New capability work, major features, new services, new products, infrastructure capability, and shared platform capability may not use that exemption.

## 9. Hard gate

If applicable implementation starts without a completed Module Reuse Check, or duplicates a canonical capability without a verified rejection:

```text
STOP — REUSE GATE FAILED
UNJUSTIFIED_DUPLICATE_IMPLEMENTATION
```

The implementation cannot close its Implementation Gate and cannot be considered complete.

## 10. Builder responsibilities

Before coding, the Builder must:

- read the reuse artifact and named Source of Truth;
- verify selected module source/contract before copying;
- implement only missing/product-specific capability;
- preserve architecture and platform boundaries;
- update provenance when a copied module is adapted.

A Builder must stop on an unclassified required capability or an architecture decision gap.

## 11. Reviewer / Final Auditor responsibilities

The reviewer must independently verify:

- Module Hub was actually inspected, not merely named;
- MT01 was inspected when applicable;
- relevant product-local modules were considered;
- plausible modules were not ignored;
- rejection reasons are technically supported;
- provenance matches source version/commit;
- no unjustified duplicate implementation was introduced.

A reviewer finding `UNJUSTIFIED_DUPLICATE_IMPLEMENTATION` returns `REMEDIATE`; the affected implementation gate remains open.

## 12. Hermes / Agent Relay enforcement
Before releasing a build-capable Relay card, Hermes must persist a reuse artifact and run the canonical reuse preflight guard from the Agent Relay skill.

For applicable capability work:

```text
Reuse Gate = PASS
```

is required. Missing artifact, failed guard, MT01 omission when required, or `Reuse Gate = FAIL` is a hard HOLD. Hermes enforces procedure; it does not invent architecture or override a documented platform boundary.

## 13. Mandatory new-product flow

```text
Approved Product / Build
  -> Read Product Source of Truth
  -> MT01 Bootstrap Check
  -> Module Reuse Check
  -> Platform Boundary Check
  -> Select / Reject modules
  -> Copy-and-own selected modules
  -> Record provenance/version/commit
  -> Implement only missing product-specific capability
  -> Test
  -> Reuse Verification
  -> Implementation Gate
```

## 14. Existing products
This policy is prospective. It does not authorize broad retroactive refactoring of Booking, Pawstia, DocCraft, WSTERA Link, MT01, or other existing products.

Existing products are audited one at a time under a separate scoped task. A current implementation is not replaced merely because a similar Module Hub module now exists.

## 15. Source-of-truth precedence

For reuse decisions inside SaaS Product Hub:

1. Later explicit Owner decision.
2. `PORTFOLIO_PRODUCTION_MASTER_PLAN.md` and locked platform architecture such as `BILLING_CORE_PLAN.md`.
3. This policy for reuse procedure.
4. Product-specific locked architecture/PRD.
5. Module Hub current registry/module contract for current reusable source.
6. Historical evidence.

This policy controls **procedure**, not product business rules or higher-authority architecture.
