# BK01 Business Rules

Status: Locked domain rules for Product Gate

## Canonical States

Booking states:

- `hold`
- `pending_review`
- `confirmed`
- `completed`
- `cancelled`
- `no_show`
- `expired`

Deposit states:

- `not_required`
- `awaiting`
- `submitted`
- `verified`
- `rejected`
- `refunded`

## Availability

A slot is bookable only when shop, service, and provider are active; explicit weekly schedule exists; duration fits; no closure/time-off/break blocks it; and no active booking overlaps.

Missing schedule is unavailable by default. This fail-closed rule is product-defining because it protects booking integrity.

## Any Staff

Any Staff selects a qualifying provider deterministically by lowest qualifying workload with stable tie-breaker and collision-safe reservation. It must not create hidden double-booking risk.

## Holds and Expiry

Deposit-required bookings start as `hold/awaiting` with a 15-minute hold. Expiry releases capacity and moves the booking to `expired`.

No-deposit bookings enter `confirmed/not_required` atomically.

## Deposits and Slips

- PromptPay QR must be controlled/self-generated in the approved boundary.
- Runtime `promptpay.io` is not allowed.
- Deposit slips are private objects, not public URLs.
- Slip submission moves eligible booking toward review.
- Manual verify confirms only when merchant accepts.
- Rejection is recoverable only inside the allowed window.
- Auto-slip may confirm only on positive provider result tied to expected amount, merchant, and transaction.
- Duplicate or ambiguous transaction references must reject or escalate fail-safe.

## Reschedule and Cancel

- Customer cancel/reschedule is V1 required.
- Policy windows must be enforced.
- Reschedule must be atomic: old slot release and new slot reserve succeed together, or original booking remains unchanged.
- Cancel releases capacity when allowed.
- Refund behavior is merchant policy; BK01 does not claim automated refund in V1.
- Nullable policy windows currently fail closed and require owner decision or onboarding enforcement.

## LINE

- Paid production uses merchant-owned LINE OA.
- Central WSTERA OA is limited to trial/onboarding boundary.
- Confirmation and at least one reminder are required.
- Notification failure is logged/recoverable and never mutates authoritative booking state.
- WSTERA-managed LINE allowance/cost model is unresolved.

## Completion, No-Show, and Blacklist

- Completion and no-show are explicit actions only.
- No-show must never be inferred from elapsed time.
- Blacklist is V1 optional and requires final owner disposition.

## Tickets / Cases

BK01 ticket/case capability is native operational support under PD-018. It is not CM01 and not a lead marketing feature.
