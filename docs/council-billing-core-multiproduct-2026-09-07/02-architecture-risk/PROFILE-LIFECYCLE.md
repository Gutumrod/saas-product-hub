# Profile Lifecycle

## States

```text
draft -> pending_validation -> active -> deprecated -> retired
                         \-> suspended
active -> suspended -> active
```

## State Definitions

`draft`

Profile is being authored. Billing API MUST reject checkout, portal, entitlement mutation, and provider operations for this profile.

`pending_validation`

All required fields appear present, but admission gates are not complete. Billing API MUST reject runtime money operations.

`active`

Only state that can serve new billing requests. Activation requires complete provider mappings, authorization binding, entitlement adapter, reconciliation capability, audit controls, test suite pass, and isolation proof.

`suspended`

Fail-closed operational hold. Existing subscriptions may be reconciled if safe, but no new checkout or entitlement expansion is allowed unless an explicit incident runbook permits it.

`deprecated`

Superseded for new checkout. Still readable for existing subscriptions, webhook handling, reconciliation, refund/cancel, and audit.

`retired`

Not routable for new billing. Retained for historical reconciliation and audit references.

## Activation Gate

Activation MUST fail closed if any of these are missing:

- canonical product registration
- environment binding
- provider mapping for every activated paid plan
- server-side return URL allowlist
- per-product caller credential binding
- account assertion mechanism where required
- entitlement adapter contract
- reconciliation capability
- redacted audit projection
- deterministic test identity
- webhook, reconciliation, entitlement, negative, and isolation tests
- rollback profile version or explicit no-rollback justification

## Migration

Profile migration is versioned, not mutable.

1. Create new `draft` version.
2. Populate complete mappings and policies.
3. Run admission suite.
4. Activate new version atomically.
5. Keep prior active version as rollback target through the declared soak period.
6. Migrate existing subscriptions only by explicit plan/price migration procedure.

Runtime MUST NOT use "latest profile" lookup for existing events. Webhooks and reconciliation use the profile version pinned at checkout/subscription creation when available; otherwise they resolve by provider object mapping and then record the recovered version in audit.

