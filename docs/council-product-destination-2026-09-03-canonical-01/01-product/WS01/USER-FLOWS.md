# USER-FLOWS - WS01 WSM V1

## Owner/Admin Flow

1. Create or access tenant workspace.
2. Configure tenant policy defaults needed for V1.
3. Create products and variants.
4. Map variants to suppliers.
5. Create dealers and issue dealer codes.
6. Create booking round and round items.
7. Share mobile booking link with dealers.
8. Review submitted dealer demand.
9. Confirm demand according to the build-brief rule.
10. Enter manual reliable supply with confidence and provenance.
11. Review Gap by variant and optional booking-round filter.
12. Allocate full or partial supply manually.
13. Review backorders.
14. Publish or expose dealer self-scoped result.

## Dealer Flow

1. Open mobile-first booking link.
2. Enter tenant-issued dealer code.
3. View current round items and close time.
4. Submit requested quantities.
5. Receive explicit notice that request is not guaranteed allocation.
6. Retry safely if network fails, without duplicate demand.
7. View only own requested, allocated, and waiting/backorder result.

## Required Recovery States

- Expired or closed booking round.
- Invalid dealer code.
- Already-used or conflicting dealer identity claim.
- Quantity outside allowed limits.
- Network retry after submission.
- Supply changed while admin is allocating.
- Attempted over-allocation.
- Session expiry or permission change.
- Entitlement limit reached.

## UX Language Rules

- Do not call requested quantity "reserved".
- Do not call ordered/factory-requested quantity "confirmed supply" unless the state proves it.
- Keep dealer result self-scoped and clear: requested, allocated, waiting/backorder.
- Mobile dealer flow is first-class V1 scope.
