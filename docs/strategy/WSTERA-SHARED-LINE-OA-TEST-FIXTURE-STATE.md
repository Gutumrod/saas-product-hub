# WSTERA Shared LINE OA Test Fixture State

**Canonical policy:** `WSTERA-SHARED-LINE-OA-TEST-FIXTURE-POLICY.md`
**Fixture:** Queueeasy LINE Official Account
**Current state:** `TESTING:BK01`
**Product:** BK01 Booking
**Test ticket:** `BK-SR-03`
**Claim date:** 2026-09-07 Asia/Bangkok
**Testing start:** 2026-09-07 Asia/Bangkok

## Claim basis

- Owner explicitly authorized immediate BK01 use under the locked shared-fixture policy.
- Owner states Queueeasy was unused before this claim.
- No other canonical fixture state file or policy-era active claim existed at claim time.
- This is the first claim under the canonical shared-fixture policy.

## Baseline verification

- Owner supplied provider-console evidence for Queueeasy before product-specific binding.
- Bot basic ID: `@264iezuj`.
- Provider console shows Messaging API channel status active.
- Channel ID shown by provider console: `2011005991`.
- Webhook URL is empty; no product webhook binding is present at testing start.
- The supplied console view does not expose a separate `Use webhook` toggle, so no ON/OFF state is inferred.
- No secret values are recorded in this file.

## Approved BK01 test slice

BK01 may now bind Queueeasy only for the approved non-production BK-SR-03 LINE acceptance test. Any product-specific binding must remain temporary and reversible. Broadcast and production customer use remain forbidden.

## Release requirement

After the approved BK-SR-03 LINE slice completes or becomes blocked, BK01 must remove or deactivate its temporary binding, capture non-secret evidence, transition to `RELEASE_PENDING:BK01`, complete RESET verification, then return the fixture to `AVAILABLE` before another product claims it.

## Scope guard

Queueeasy is non-production shared WSTERA test infrastructure only. It is not BK01-owned, not a production identity, and must be RELEASED and RESET after the approved BK-SR-03 LINE test slice.
