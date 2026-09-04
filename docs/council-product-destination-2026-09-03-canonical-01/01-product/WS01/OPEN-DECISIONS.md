# OPEN-DECISIONS - WS01 WSM

These decisions remain open after Product Gate synthesis. They should be resolved in the Phase 1 build brief or later gate as indicated.

## OD-001 - Runtime and Database Placement

Decision needed: Where Phase 1 development and eventual production runtime/database live.

Recommended for next step: keep Product Gate neutral; Phase 1 build brief must either lock placement or explicitly constrain itself to development-only placement with no live assumption.

Council support level: 3/3 surfaced as unresolved.

## OD-002 - Billing and Entitlement Contract

Decision needed: How WSM reads central billing/entitlement state, sync timing, failure behavior, and server-side enforcement boundary.

Recommended for next step: define a minimal read-only entitlement snapshot contract with fail-safe behavior before implementation.

Council support level: 3/3 surfaced entitlement/placement uncertainty; 2/3 emphasized contract details.

## OD-003 - Demand Confirmation Actor and Timing

Decision needed: Who confirms dealer demand and when it becomes included in open confirmed demand for Gap.

Recommended for next step: make admin confirmation explicit unless owner approves automatic confirmation at round close.

Council support level: 2/3 surfaced as unresolved.

## OD-004 - Round Completion Trigger and Backorder Creation

Decision needed: What action/status change completes a round, when backorders are generated, and what dealers see after completion before carry.

Recommended for next step: define explicit admin completion action that computes backorder once, with dealer waiting result visible until explicit carry/resolution.

Council support level: 2/3 surfaced as unresolved.

## OD-005 - Dealer-Code Security Parameters

Decision needed: Dealer code format, uniqueness strength, rotation rules, leak handling, and already-used/conflicting identity recovery.

Recommended for next step: use non-guessable tenant-scoped codes with rotation/reissue support and negative tests for forged identity.

Council support level: 3/3 identified dealer-code trust boundary; 2/3 requested operational detail.

## OD-006 - Phase 1 Success Thresholds

Decision needed: What measurable threshold proves the V1 thin loop is valuable.

Recommended for next step: define target values for demand capture, time to first completed loop, allocation coverage, backorder rate visibility, and dealer active submission before build acceptance.

Council support level: 3/3 identified KPI definitions; 2/3 emphasized missing target values.

## OD-007 - Commercial Values

Decision needed: Pricing, plans, trial, limits, grace, overage/fair-use.

Recommended for next step: defer to Business-Market gate; do not let engineering invent values.

Council support level: 3/3 surfaced as unresolved and out of Product Gate scope.

## OD-008 - Retention and Public Support/SLA

Decision needed: Data retention periods and public support/SLA wording.

Recommended for next step: defer to legal/operations/launch gate; treat as launch blocker, not Product Gate blocker.

Council support level: 2/3 surfaced explicitly; no candidate contradicted.
