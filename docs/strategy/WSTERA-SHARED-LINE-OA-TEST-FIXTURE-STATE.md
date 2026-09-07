# WSTERA Shared LINE OA Test Fixture State

**Canonical policy:** `WSTERA-SHARED-LINE-OA-TEST-FIXTURE-POLICY.md`
**Fixture:** Queueeasy LINE Official Account
**Current state:** `RELEASE_PENDING:BK01`
**Product:** BK01 Booking
**Test ticket:** `BK-SR-03`
**Claim date:** 2026-09-07 Asia/Bangkok
**Testing start:** 2026-09-07 Asia/Bangkok
**Release pending:** 2026-09-07 Asia/Bangkok

## Completed BK01 evidence

- Queueeasy identity verified as display name `Queueeasy`, Basic ID `@264iezuj`.
- BK01 non-production webhook verification PASS against `wstera-consumer-staging`.
- Real Owner binding PASS; persisted LINE UID reuse and server-side push PASS.
- Reminder duplicate-like defect reproduced, remediated, and externally re-accepted with exactly one fresh notification.
- No Queueeasy credential values were committed to product or house repositories.

## Release status

BK01 approved LINE test scope has ended. BK01 no longer needs the fixture reserved for active testing.

RESET is not yet complete because provider `Use webhook` remains enabled and the previous BK01 staging webhook therefore remains active. LINE's public Messaging API can set/get/test the webhook URL but does not expose the console `Use webhook` ON/OFF control.

Required Owner/manual reset step:

1. LINE Developers Console / Queueeasy / Messaging API -> set `Use webhook` = OFF.
2. Verify provider API reports `active=false`.
3. Record RESET evidence and change this state to `AVAILABLE`.

Until those steps pass, the next product must not CLAIM Queueeasy.

## Scope guard

Queueeasy remains non-production shared WSTERA test infrastructure only. It is not BK01-owned, not a production identity, and the remaining BK01 webhook configuration must not be treated as permanent architecture.
