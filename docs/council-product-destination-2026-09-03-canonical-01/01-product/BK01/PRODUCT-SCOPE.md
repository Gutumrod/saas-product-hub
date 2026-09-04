# BK01 Product Scope

Status: Product Gate locked target, remediation required  
Verdict: REMEDIATE

## V1 Product-Defining Capabilities

- Thailand-first single-location appointment operations for hair/barber/beauty/nail shops.
- Public customer booking URL with mobile-first Thai-first booking flow.
- Owner setup for one shop, services, providers/staff, schedules, closures, and policies.
- Collision-safe booking creation and reschedule at the authoritative data layer.
- PromptPay-native deposit flow with controlled QR generation and private slip storage.
- Manual deposit review for merchant; Pro auto-slip verification before Pro sale.
- Merchant-owned LINE OA for paid production; WSTERA central OA only for trial/onboarding boundary.
- Required confirmation and at least one reminder with evidence/logging.
- Customer cancel/reschedule with merchant policy, recovery token, audit, and atomic mutation.
- Explicit completed/no-show actions, never elapsed-time inference.
- Staff identity mapped to provider with self-scope and fail-closed behavior.
- CSV export and account closure request.
- Native BK01 ticket/case capability as owner/admin operational support only.
- Monthly Stripe billing surface with retired legacy 100/500 booking walls.

## V1 Completion Boundary

V1 ends when all PRD Required rows and BK-A 14 closeout items pass release evidence, including:

- Non-DB gates remain passing: tests, lint, build, static absence, diff hygiene, secret scan.
- DB-backed gates G2 and DB-backed G3-G9 pass in an approved PostgreSQL/Supabase runtime.
- Independent review remains PASS after DB/runtime closeout.
- Auto-slip Pro provider/cost/failure policy is decided and evidenced.
- Final prices and LINE cost/allowance model are owner-approved for public sale.
- Pilot evidence exists before outcome claims are made.

Current implementation is **not yet sellable V1**.

## Explicit Non-Goals

- Medical/clinic workflows.
- Multi-branch operations.
- Marketplace or commission model.
- POS, inventory, payroll, accounting, or ERP.
- Full CRM or marketing automation suite.
- Annual billing in V1.
- Customer-installed mobile app requirement.
- Public deposit slip URLs.
- Runtime `promptpay.io`.
- Unaudited platform impersonation.
- CM01 standalone claim/case product.
- Module Hub integration claims while the scan is HOLD.
