# WSTERA Shared LINE OA Test Fixture State

**Canonical policy:** `WSTERA-SHARED-LINE-OA-TEST-FIXTURE-POLICY.md`
**Fixture:** Queueeasy LINE Official Account
**Current state:** `RELEASE_PENDING:BK01`
**Product:** BK01 Booking
**Test ticket:** `BK-SR-03`
**Claim date:** 2026-09-07 Asia/Bangkok
**Testing resumed:** 2026-09-08 Asia/Bangkok
**Release pending:** 2026-09-08 Asia/Bangkok

## Completed BK01 evidence

- Queueeasy identity verified as display name `Queueeasy`, Basic ID `@264iezuj`.
- BK01 non-production webhook verification PASS against `wstera-consumer-staging`.
- Real Owner binding PASS; persisted LINE UID reuse and server-side push PASS.
- Confirmation, reminder, reschedule and cancellation deliveries PASS.
- New-customer no-UID failure is fail-closed; no wrong-recipient delivery occurred.
- Provider HTTP 400 retry/backoff PASS through terminal attempt 5 with booking truth preserved.
- Repeated dispatcher calls after successful delivery claimed zero duplicate work.
- Reminder duplicate-like defect was reproduced, remediated, and externally re-accepted.
- No Queueeasy credential values were committed to product or house repositories.

## Release status

BK01's approved LINE notification acceptance matrix is complete. BK01 no longer needs Queueeasy reserved for active testing.
RESET is not yet complete because provider `Use webhook` remains enabled and the BK01 staging webhook therefore remains active.

Required Owner/manual reset step:

1. LINE Developers Console / Queueeasy / Messaging API -> set `Use webhook` = OFF.
2. Verify provider API reports `active=false`.
3. Record RESET evidence and change this state to `AVAILABLE`.

Until those steps pass, the next product must not CLAIM Queueeasy.

## Scope guard

Queueeasy remains non-production shared WSTERA test infrastructure only. It is not BK01-owned, not a production identity, and the remaining BK01 webhook configuration must not be treated as permanent architecture.
