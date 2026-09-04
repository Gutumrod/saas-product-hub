# BK01 User Flows

Status: Product Gate level

## Core Booking Loop

1. Owner configures shop, services, providers/staff, schedules, closures, deposit rules, cancel/reschedule rules, and LINE boundary.
2. Owner publishes the BK01 customer booking URL.
3. Customer opens URL without installing an app.
4. Customer selects service, provider or Any Staff, date, and time.
5. System checks active shop/service/provider, explicit schedule, duration fit, closures, breaks, time-off, and overlap.
6. If no deposit is required, booking confirms atomically.
7. If deposit is required, booking enters hold with PromptPay QR, countdown, and private slip upload.
8. Customer submits slip; booking enters pending review unless Pro auto-slip returns a positive exact match.
9. Merchant verifies or rejects deposit; confirmed bookings receive confirmation state and notification.
10. LINE confirmation and reminder are sent/logged without mutating booking truth on notification failure.
11. Merchant marks completion or no-show explicitly.
12. History, audit, export, and operational support are retained tenant-scoped.

## Customer Change Flow

1. Customer opens recovery/change surface.
2. System checks token, booking state, merchant policy, and window.
3. Cancel releases capacity when allowed and records audit.
4. Reschedule checks new slot under the same availability rules.
5. Reschedule atomically releases old slot and reserves new slot; failure leaves original booking unchanged.
6. Customer and merchant receive updated state/notification where configured.

## Owner / Admin Flows

- Onboard shop and publish first booking URL.
- Manage services, providers, schedules, closures, and policy windows.
- Review slips and confirm/reject bookings.
- Monitor daily schedule and operational statuses.
- Mark completed/no-show explicitly.
- Export CSV and request account closure.
- Use native ticket/case support as operational support, not as a lead product.

## Staff Flows

- Staff user maps to exactly one provider identity.
- Staff sees only own bookings/schedule.
- Missing mapping fails closed.
- Staff cannot access shop-wide ticket/case surfaces.

## Platform Operator Flows

- Platform actions are audited.
- No unaudited impersonation.
- Operator support does not override tenant authority or booking truth without traceable action.
