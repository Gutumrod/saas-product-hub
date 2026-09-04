# V1-ACCEPTANCE-CRITERIA - WS01 WSM

## Product Acceptance

- A tenant admin can complete the thin loop without spreadsheets in the middle.
- Dealer demand, manual reliable supply, gap, allocation, backorder, and dealer self-result are visible as one traceable chain.
- Users cannot confuse requested, allocated, and fulfilled states in UI labels or domain records.
- Users cannot confuse ordered, confirmed, and received supply states.
- Backorders do not inflate Gap through double subtraction.

## Scenario Acceptance

The Phase 1 build brief must include at least one concrete shortage scenario:

- Two or more dealers submit demand for the same variant.
- Reliable supply is less than confirmed demand.
- Gap shows shortage correctly.
- Admin allocates partial quantities.
- Remaining demand becomes backorder.
- Dealer A sees only Dealer A's result.
- Dealer B sees only Dealer B's result.

## Integrity Acceptance

- Dealer booking retry cannot duplicate demand.
- Closed or expired round rejects new demand.
- Invalid quantity fails cleanly.
- Allocation race cannot over-allocate.
- Allocation cannot silently exceed product/domain limits.
- Manual supply confidence changes produce deterministic Gap behavior.

## Security Acceptance

- Anonymous bypass fails.
- Cross-tenant access fails.
- Cross-dealer access fails.
- Privilege escalation fails.
- Forged booking identity fails.
- Replay/idempotency abuse fails.
- Unauthorized audit mutation fails.

## Evidence Acceptance

Before claiming V1 shipped, evidence must exist for:

- Implementation for every Required PRD row.
- G0-G9 release gates.
- Database migration replay, constraints, permissions, RLS, and negative tests.
- Desktop and mobile E2E thin-loop UX.
- Build/lint/typecheck/test commands relevant to the implemented stack.
- Independent review and owner authorization.

## Not Accepted As Evidence

- Documentation Lock alone.
- Health endpoint alone.
- Process existence alone.
- Mock-only screenshots.
- Unverified manual claim that the loop works.
- Any public launch claim before Required rows and gates have evidence.
