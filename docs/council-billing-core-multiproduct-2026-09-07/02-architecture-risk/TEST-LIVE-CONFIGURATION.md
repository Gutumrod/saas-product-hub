# Test And Live Configuration

## Current Authorization

Only Stripe Test Mode is authorized now. Live money, live keys, live charges, and production deployment are prohibited until explicit Owner authorization.

## Environment Model

```yaml
environment:
  name: local | staging | production
  provider_mode: test | live
  owner_authorized_live: boolean
  stripe_secret_key_ref: secret-ref
  stripe_webhook_secret_ref: secret-ref
  profile_environment: test | live
```

## Live-Key Boot Guard

Runtime MUST refuse to boot with a `sk_live_` Stripe key unless all are true:

- explicit Owner live authorization exists
- `BILLING_CORE_ALLOW_LIVE=true`
- live provider mappings are activated
- live-readiness gate passed
- audit and rollback controls are enabled

## Secret Boundaries

- No provider secrets in Product repos.
- No live key in local `.env` or Worker secret before authorization.
- Product credentials are environment-bound.
- Webhook signing secrets are central Billing Core secrets.

## Mapping Isolation

The profile registry stores separate provider mappings:

- `provider_mappings.stripe.test`
- `provider_mappings.stripe.live`

Runtime MUST reject any request where credential environment, profile environment, provider mode, or provider object prefix/mapping conflicts.

## Stripe Preflight

Before implementation evidence can pass:

- confirm WSTERA Stripe Test Mode access
- confirm API version pin
- confirm webhook signature verification path
- confirm PromptPay availability/limitations for the account and mode
- confirm test Product/Price creation and cleanup procedure

