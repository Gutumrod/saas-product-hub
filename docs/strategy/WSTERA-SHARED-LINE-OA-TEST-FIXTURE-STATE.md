# WSTERA Shared LINE OA Test Fixture State

**Canonical policy:** `WSTERA-SHARED-LINE-OA-TEST-FIXTURE-POLICY.md`
**Fixture:** Queueeasy LINE Official Account
**Current state:** `CLAIMED:BK01`
**Product:** BK01 Booking
**Test ticket:** `BK-SR-03`
**Claim date:** 2026-09-07 Asia/Bangkok

## Claim basis

- Owner explicitly authorized immediate BK01 use under the locked shared-fixture policy.
- Owner states Queueeasy is currently unused.
- No other canonical fixture state file or policy-era active claim existed at claim time.
- This is the first claim under the canonical shared-fixture policy.

## Mandatory first test step

Verify Queueeasy bot identity and current webhook/binding state before any product-specific provider change. If an unexpected active binding is found, transition immediately to `HOLD` and stop BK01 fixture testing until reset is proven.

## Scope guard

Queueeasy is non-production shared WSTERA test infrastructure only. It is not BK01-owned, not a production identity, and must be RELEASED and RESET after the approved BK-SR-03 LINE test slice.
