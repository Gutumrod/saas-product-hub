# WSTERA SaaS Product Bootstrap Template

**Product:** <name/code>
**Status:** PRE-BUILD
**Owner:** <owner>
**Canonical reuse policy:** `docs/platform/MODULE-REUSE-POLICY.md`

## A. Product Source of Truth

- PRD / product contract: <path>
- Architecture: <path>
- Security / tenancy: <path>
- Platform integration contracts: <paths>

## B. MT01 Bootstrap Check

**Result:** PASS / HOLD

Inspect the current MT01 reference baseline for relevant seams:

| Baseline area | MT01 artifact inspected | Decision |
|---|---|---|
| tenant context | <path> | reuse / reference / not required |
| auth | <path> | reuse / reference / not required |
| AI provider | <path> | reuse / reference / not required |
| reliability / enterprise | <path> | reuse / reference / not required |
| webhook receiver | <path> | reuse / reference / not required |
| central platform seam | <path> | integrate / not required |
MT01 is not the version authority for copied modules. Resolve current module source/version from Module Hub before copying.

## C. Platform Boundary Check

### Central platform owns
- accounts/customers/products: <decision>
- billing/subscription/entitlement: <decision>
- support/case: <decision>

### Product runtime owns
- product schema/data: <decision>
- product workflows: <decision>
- product-specific runtime/integrations: <decision>

Any local capability that would duplicate an authoritative central platform service must be classified `NOT APPLICABLE` unless a higher-authority decision says otherwise.

## D. Module Reuse Check

`Module Reuse Check: COMPLETE`
`MT01 Bootstrap Check: PASS`
`Reuse Gate: PASS`

### Required Capabilities
- <capability>

### Module Decisions

| Capability | Candidate inspected | Classification | Technical reason |
|---|---|---|---|
| <capability> | <module/path> | USE / USE + ADAPT / NOT APPLICABLE / REJECT WITH JUSTIFICATION / MISSING CAPABILITY | <reason> |
### Missing Capabilities
- <capability and evidence that no suitable canonical reusable source exists>

## E. Copy-and-Own / Provenance Plan

| Module | Version | Source commit | Destination | Planned local changes |
|---|---|---|---|---|
| <module> | <version> | <sha> | <path> | none / <details> |

No cross-repository runtime imports are allowed.

## F. Missing Product-Specific Capability

- Capability: <name>
- Why existing modules do not satisfy it: <technical evidence>
- Product-owned implementation location: <path>

## G. Pre-Build Gate

The product may enter implementation only when:

- [ ] Product Source of Truth is implementation-ready.
- [ ] MT01 Bootstrap Check is PASS.
- [ ] Module Reuse Check is COMPLETE.
- [ ] Reuse Gate is PASS.
- [ ] Platform boundary is explicit.
- [ ] Selected source versions/commits are recorded.
- [ ] Missing capabilities are explicitly identified.
- [ ] Owner / Implementation Gate approval is present.

Failure result: `STOP — REUSE GATE FAILED`.
