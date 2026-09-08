# Billing API Contract

## Global Requirements

Every route MUST enforce:

- server-side product identity from credential
- account/tenant identity from verified account assertion where route requires it
- environment binding
- authorization
- idempotency
- active profile and valid plan
- server-side provider object resolution
- redacted audit correlation

Caller bodies MUST NOT supply authoritative `product_id`, Stripe Price ID, amount, currency, environment, or return URL.

## Routes

| Route | Purpose | Required controls |
|---|---|---|
| `POST /v1/checkout` | Create or resume checkout for subscription or one-time WSTERA sale. | Product from credential; account assertion recommended and required for account-sensitive products; plan_id checked against active profile; Stripe Price resolved server-side; server-side idempotency; return URL from allowlist. |
| `GET /v1/subscription/status` | Return subscription/payment status for a product/account. | Product from credential; account_id verified by assertion or explicitly accepted product-wide read; environment scoped; no cross-product lookup. |
| `GET /v1/entitlements` | Return Billing Core entitlement projection or hand off to Product adapter. | Product from credential; account binding; stale snapshot policy; no entitlement grant based only on caller input. |
| `POST /v1/portal` | Create a Stripe Billing Portal session or safer account-management equivalent. | Account-bound assertion REQUIRED; server-side customer lookup; server-selected return URL; rate limit by credential and account; no caller customer ID authority. |
| `POST /webhooks/stripe` | Stripe event intake. | No product credential; raw body cap; Stripe signature verification; durable claim/outbox before acknowledgement. |

## Checkout Contract

Input accepted from Product server:

```json
{
  "account_id": "product-owned-account-reference",
  "plan_id": "profile-plan-id",
  "operation_id": "caller-logical-operation-id",
  "success_return_ref": "allowlisted-ref",
  "cancel_return_ref": "allowlisted-ref"
}
```

Billing Core derives:

- `product_id` from credential
- `environment` from deployment/credential binding
- `profile_version` from active profile resolution
- Stripe Product/Price from provider mapping
- idempotency key from environment/product/account/operation/profile
- redirect URLs from allowlist refs

Rejected:

- caller-supplied Stripe Product/Price IDs
- caller-supplied amount/currency
- caller-supplied arbitrary URLs
- product/account mismatch
- stale/inactive profile
- missing provider mapping for paid plan

## Account Isolation

Product credential alone is product-granularity authority. Any claim that Account A cannot access Account B requires account-bound assertion or equivalent verified ownership proof. `/v1/portal` always requires that assertion. GET routes either require assertion or must be explicitly documented as accepted product-wide read for that Product.

