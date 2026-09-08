# Acceptance Test Matrix

| Area | Required evidence |
|---|---|
| Profile schema | Valid/invalid profile fixtures; missing required fields fail; BK01-specific fields not required by generic contract. |
| Profile lifecycle | Draft/pending profiles cannot serve checkout; active only after gates; partial write never active; rollback target recorded. |
| Product identity | Caller cannot spoof product_id in body/path; credential-bound product wins; cross-product request returns denial. |
| Account isolation | `/v1/portal` requires account-bound assertion; GET routes either require assertion or documented product-wide-read acceptance. |
| Checkout | Server resolves Price; caller-supplied Price/amount/currency rejected; return URL refs allowlisted; idempotent retry creates no duplicate Customer/session. |
| Stripe mapping | Test/live mappings separate; stale Price cannot be used for new checkout; price change requires new Price/profile version. |
| Webhook signature | Raw-body verification passes; mutated body fails; oversized body rejected; invalid signature audited. |
| Durable intake | Event claim and outbox persist atomically before 2xx; DB failure returns non-2xx. |
| Duplicate webhook | Same event processed once; duplicate gets safe 2xx without reapplying. |
| Out-of-order webhook | Older event cannot regress newer state; ambiguous order triggers provider re-fetch. |
| Reconciliation | Missing webhook, paid-no-entitlement, entitlement-no-payment, refund, cancellation, failed renewal, stale provider state, PromptPay expiry, and drift repair covered. |
| Entitlement push | Signed ingress required; replay rejected/idempotent; Product outage retries; dead-letter audited. |
| Entitlement pull/snapshot | TTL/staleness enforced; expired paid snapshot fails closed unless policy grace applies. |
| Isolation | Product A cannot create/modify/read Product B billing or entitlement; Account A cannot access Account B on assertion-required routes. |
| PromptPay | Manual renewal only; expiry handled; no automatic subscription state machine; THB and Stripe support limitations verified in preflight. |
| Refund/cancel | Refund and cancel produce auditable entitlement effect per policy. |
| Observability | Metrics, alerts, audit projection, correlation IDs, and redaction verified. |
| Security | Live-key boot guard; no Product repo secrets; no raw sensitive payload logging. |
| Negative provider data | Wrong product/account/amount/currency/plan rejected and audited. |
| Build gate | Product #1 vertical slice passes; Product #2 isolation proof passes before new-product admission harness is trusted. |

