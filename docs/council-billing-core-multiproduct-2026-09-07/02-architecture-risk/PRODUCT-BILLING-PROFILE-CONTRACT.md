# Product Billing Profile Contract

## Purpose

A Product Billing Profile is the versioned contract that tells Billing Core which product is being billed, what billing models are allowed, which provider objects are mapped, which entitlement adapter is used, and which lifecycle/reconciliation policies apply.

It is configuration/domain contract data in Billing Core. It is not caller input.

## Minimum Schema

```yaml
schema_version: 1
product_id: string
product_code: string
display_name: string
environment: test | live
profile_version: integer
status: draft | pending_validation | active | suspended | deprecated | retired

billing_models:
  - free | trial | subscription | one_time | manual_renewal

currency:
  code: ISO-4217
  minor_unit_exponent: integer
  allowed_minor_units:
    min: integer
    max: integer
    increment: integer

commercial_policy:
  policy_ref: string
  refund_policy_ref: string
  tax_policy_ref: string | null
  price_change_policy_ref: string | null

plans:
  - plan_id: string
    package_ref: string
    model: free | trial | subscription | one_time | manual_renewal
    amount_minor: integer | null
    interval: none | month | year | manual_period
    trial_ref: string | null
    free_tier_ref: string | null
    grace_ref: string | null
    retry_dunning_ref: string | null
    entitlement_keys:
      - string

rails:
  card_subscription:
    enabled: boolean
    auto_renew: true
  promptpay_manual:
    enabled: boolean
    auto_renew: false
    expiry_policy_ref: string | null
  card_one_time:
    enabled: boolean
    auto_renew: false

entitlement_adapter:
  adapter_id: string
  contract_version: integer
  mode: push | pull | snapshot
  ingress_ref: string | null
  snapshot_ref: string | null
  ttl_seconds: integer | null
  signing_key_ref: string | null

provider_mappings:
  stripe:
    test:
      stripe_product_id: string | null
      stripe_price_ids:
        plan_id: stripe_price_id
    live:
      stripe_product_id: string | null
      stripe_price_ids:
        plan_id: stripe_price_id

admission:
  registered_at: timestamp
  activated_at: timestamp | null
  activated_by: string | null
  test_run_id: string | null
  isolation_evidence_ref: string | null
  rollback_profile_version: integer | null
```

## Generic Contract Rules

- Generic profiles MUST use canonical `product_id`, not BK01-specific `shop_id`.
- Generic plans MUST NOT assume Basic/Pro, Booking entitlement semantics, or monthly-only billing.
- A Product may have multiple billing models where commercially valid.
- A Product with no paid rail in a given phase may have `null` Stripe mappings while in `draft` or `pending_validation`; activation for paid checkout requires complete provider mapping.
- Product repos MUST NOT hardcode Stripe Product IDs, Stripe Price IDs, currency exponents, amounts, intervals, dunning constants, or provider secrets.

## Versioning

- Activated profiles are immutable.
- Any material change creates a new `profile_version`.
- Runtime MUST resolve an exact active profile version from the request/event/job context.
- Partially written profiles MUST NOT be routable.
- Rollback target MUST be explicit before activation of a replacement version.

