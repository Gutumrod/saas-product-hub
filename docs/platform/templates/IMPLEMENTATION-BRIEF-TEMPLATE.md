# Implementation Brief Template

**Status:** DRAFT / READY / APPROVED
**Product / service:** <name>
**Owner approval:** <YES / NO>
**Source of Truth:** <paths>
**Target repository / branch:** <repo / branch>
**Canonical reuse policy:** `docs/platform/MODULE-REUSE-POLICY.md`

## 1. Objective

<What must be true when this work is complete?>

## 2. Scope

### In
- <item>

### Out
- <item>

## 3. Architecture / Security Invariants

- <invariant>
- <platform boundary that must not be duplicated>

## 4. MT01 Bootstrap Check
`PASS` or `N/A`

- MT01 paths inspected: <paths or N/A reason>
- Baseline contracts reused/referenced: <list>
- Differences required by this product: <list>

## 5. Module Reuse Check

`Module Reuse Check: COMPLETE`
`Reuse Gate: PASS`

### Required Capabilities
- <capability>

### Module Decisions

| Capability | Candidate inspected | Classification | Technical reason |
|---|---|---|---|
| <capability> | <module/path> | USE / USE + ADAPT / NOT APPLICABLE / REJECT WITH JUSTIFICATION / MISSING CAPABILITY | <reason> |

### Missing Capabilities
- <new product-specific capability and why no canonical reusable module exists>

### Provenance Plan

| Module | Source version | Source commit | Destination | Local adaptation |
|---|---|---|---|---|
| <module> | <version> | <sha> | <path> | none / <changes> |
## 6. Implementation Scope

- Copy-and-own selected modules before adaptation.
- Implement only classified `MISSING CAPABILITY` and product-specific integration.
- Do not edit `modules-hub` unless a separate upstream task is approved.

## 7. Failure / Stop Conditions

- Missing or failed Reuse Gate -> STOP.
- Unclassified required capability -> STOP.
- Platform/architecture decision gap -> STOP.
- Shared-source change required -> open a separate scoped upstream task; do not patch Module Hub inline.

## 8. Acceptance Criteria

- [ ] Reuse Gate PASS before production implementation.
- [ ] Selected modules copied from recorded immutable commits.
- [ ] Provenance recorded and updated for local adaptations.
- [ ] No `UNJUSTIFIED_DUPLICATE_IMPLEMENTATION`.
- [ ] Product/platform boundary preserved.
- [ ] Tests / lint / typecheck / build pass as applicable.
- [ ] Independent review verifies reuse and implementation evidence.

## 9. Allowed / Prohibited Paths

**Allowed:** <paths>
**Prohibited:** <paths>

## 10. Verification Evidence
- Commands:
- Raw logs/artifacts:
- Reviewer:
- Final Implementation Gate: PASS / REMEDIATE
