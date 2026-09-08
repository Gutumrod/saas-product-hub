# Stripe Product And Price Mapping

## Mapping Rule

Default rule: one Stripe Product maps to one WSTERA Product per environment when that WSTERA Product has an active Stripe-paid rail.

Bounded exception: a Product in `free` only phase may have no Stripe Product until paid checkout is admitted. Source-sale Products still use WSTERA-owned one-time Stripe Product/Price mappings when WSTERA sells the source/license. Embedded payment modules inside a sold source product belong to the buyer's provider account and are out of WSTERA SaaS billing.

## Price Strategy

- One Stripe Price per plan/version/interval.
- Stripe Price IDs are immutable provider projections.
- Price amount changes create a new Stripe Price and a new profile version.
- Old Prices are archived/inactivated for new checkout but retained for existing subscriptions/history.
- Existing subscriptions remain pinned to their Price until an explicit migration policy changes them.

This follows official Stripe docs: Price amounts are not updated in place; Stripe recommends creating a new Price for a new amount and inactivating the old Price for new use.

## Storage

Stripe IDs are stored only in Billing Core profile/provider mapping data:

```yaml
provider_mappings:
  stripe:
    test:
      stripe_product_id: prod_test_x
      stripe_price_ids:
        founding_monthly: price_test_x
    live:
      stripe_product_id: null
      stripe_price_ids: {}
```

Product repos MUST NOT hardcode:

- Stripe Product IDs
- Stripe Price IDs
- Stripe Customer IDs
- Stripe subscription IDs as authority
- provider API versions
- provider secrets
- money amounts or currency exponents as uncontrolled constants

## Test/Live Isolation

Test and live mappings are separate. A live Price MUST NOT be resolvable in test mode and a test Price MUST NOT be resolvable in live mode. Live mappings remain absent or disabled until explicit Owner authorization and live-key boot guard conditions pass.

## Provider IDs Vs Domain Truth

Provider IDs are config/mapping data. Domain/commercial truth is the activated Product Billing Profile plus Owner-approved commercial policy references. Reconciliation validates provider truth against the profile; it does not let provider metadata redefine the Product's commercial policy.

