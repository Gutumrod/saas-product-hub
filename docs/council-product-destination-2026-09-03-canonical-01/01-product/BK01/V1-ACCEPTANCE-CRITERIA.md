# BK01 V1 Acceptance Criteria

Status: Product Gate remediation required

## V1 Ends Here

V1 is complete only when all PRD Required rows, BK-A 14-item remediation closeout, DB-backed release gates, and independent review evidence pass together.

Current implementation is **not yet sellable V1**.

## Required Evidence

- All PRD Required rows mapped to traceability evidence.
- BK-A 14 closeout items completed and reconciled against current status.
- Non-DB gates pass: tests, lint, type/build, static absence, diff check, secret scan.
- G2 and DB-backed portions of G3-G9 pass in an approved PostgreSQL/Supabase runtime.
- Migration replay passes on a clean database.
- Tenant/RLS denial and staff self-scope pass.
- Concurrent overlap prevention and atomic reschedule pass under real DB behavior.
- Hold expiry, deposit transition, duplicate transaction handling, and provider fail-safe pass.
- Stripe webhook idempotency/out-of-order behavior passes.
- LINE confirmation/reminder logging/retry behavior passes.
- CSV export, closure request, and platform audit persistence pass.
- Independent review PASS after DB/runtime closeout.
- Release artifact hygiene proves stale `.next`/source-map legacy strings are not shipped.

## Owner / Commercial Preconditions

These do not let this Product Gate decide Business/Market, but they block public V1 sale:

- Auto-slip provider, allowance, unit cost/top-up, and failure policy decided.
- Final Basic/Pro public prices approved.
- Merchant-owned LINE cost and any WSTERA-managed allowance model approved.
- Cancel/reschedule policy default or forced-configuration decision approved.
- Blacklist V1 disposition approved.

## Pilot Evidence

Before outcome claims, BK-B must measure:

- Time to first value.
- Booking integrity under real concurrency.
- Deposit and notification reliability.
- Retention and willingness to pay.
- No-show impact, if claimed.

No pilot/WTP/concurrency/notification outcome is accepted as proven today.
