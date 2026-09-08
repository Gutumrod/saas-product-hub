# Security Invariants

These invariants are mandatory gates. A design or implementation that violates any item fails closed.

1. Live keys are impossible before explicit Owner authorization and runtime live-key boot guard.
2. No secrets in Product repos.
3. Product identity is bound server-side from credential, never caller body.
4. Account/tenant binding is verified by account-bound assertion where isolation is claimed.
5. Product credential alone is product-granularity authority, not account isolation.
6. No caller-supplied provider Price authority.
7. Return URLs are resolved only from server-side allowlists.
8. Test/live environment separation is enforced through credentials, profile environment, provider mappings, and boot guard.
9. Stripe Product/Price IDs are mapping/config data, not domain truth.
10. Webhook signature verification uses bounded raw body before JSON trust.
11. Webhook event processing is idempotent and replay-protected.
12. Durable event claim and outbox are persisted before webhook acknowledgement.
13. Duplicate events do not reapply state.
14. Out-of-order events cannot regress newer state.
15. Provider re-fetch and amount/currency/product/account/plan validation are required before money-dependent transition.
16. Browser redirect is never authoritative.
17. Metadata is routing/correlation hint only.
18. Raw sensitive provider payloads, secrets, card data, tokens, and unnecessary customer PII are not logged.
19. Audit logs use redacted allowlisted projection.
20. No cross-product access.
21. No cross-tenant/account access where account-bound assertion is required.
22. Refund, cancellation, renewal failure, and dunning behavior are policy-backed and auditable.
23. No mutable global `current_profile`, `active_product`, or unscoped active profile.
24. Profile activation is atomic and fail-closed.
25. BK01 merchant/customer PromptPay deposits never merge into WSTERA SaaS subscription billing.

