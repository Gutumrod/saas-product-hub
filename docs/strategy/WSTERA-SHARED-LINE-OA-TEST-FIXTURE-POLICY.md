# WSTERA Shared LINE OA Test Fixture Policy

**Status:** CANONICAL OWNER POLICY — LOCKED
**Effective:** 2026-09-07
**Mode:** WSTERA HOUSE MAJOR / BUILD-TO-SELL
**Fixture:** Queueeasy LINE Official Account
**Applies to:** all WSTERA products requiring LINE OA integration testing

## Canonical decision

Queueeasy is a shared WSTERA test fixture, not a product-owned LINE OA and not a production dependency.

The fixture is reused sequentially, one product at a time.

No product may claim Queueeasy as permanent architecture, tenant resource, production endpoint, or commercial LINE identity.

## Operating model

`CLAIM -> TEST -> EVIDENCE -> RELEASE -> RESET`

A new product may CLAIM Queueeasy only after the previous product has completed RELEASE and RESET verification.

Concurrent product testing against Queueeasy is forbidden unless Owner explicitly changes this policy.

## CLAIM

Before a product uses Queueeasy:

1. record the product ID and test ticket;
2. confirm no other product currently owns the fixture;
3. verify Queueeasy is in RESET/CLEAN state;
4. bind only the test configuration required for that product;
5. keep credentials outside the product repository and source control.

CLAIM does not authorize production use or permanent provider architecture.

## TEST

During the test window:

- use Queueeasy only for the active product's approved LINE OA acceptance work;
- do not run another product through the same OA concurrently;
- do not treat Queueeasy behavior as proof of a customer's future OA configuration;
- do not store fixture credentials in product docs, logs, screenshots, Git history, or committed config;
- production customer data and production credentials remain forbidden.

## EVIDENCE

Before RELEASE, capture only non-secret evidence required to prove the test outcome:

- product/ticket identity;
- test date and environment;
- webhook/integration state without secret values;
- message/event acceptance results;
- failure/retry behavior when required;
- exact defects or blockers.

Evidence must identify Queueeasy as `WSTERA Shared LINE OA Test Fixture`, not as the product's OA.

## RELEASE

The active product must RELEASE Queueeasy after its approved test scope is complete or blocked.

RELEASE means product-specific temporary bindings are removed or made inactive and the product no longer treats the fixture as reserved.

## RESET

RESET must be verified before the next CLAIM.

At minimum verify:

1. the previous product webhook/binding is no longer active;
2. temporary product-specific state that could interfere with the next test is cleared or isolated;
3. no product-specific secret/config was committed;
4. fixture ownership is `AVAILABLE`;
5. any remaining external configuration is documented as intentional shared baseline.

If clean reset cannot be proven, fixture state is `HOLD` and the next product may not claim it.

## Infrastructure and MCP boundary

This decision does not require a permanent per-product LINE MCP process, fixed MCP profile, or new paid infrastructure.

The existing `.line-mcp/config.json` is not made canonical by this policy and does not need to be changed merely to adopt Queueeasy as the shared fixture.

MCP/config changes are allowed only when a specific approved test requires them and must remain temporary/reversible.

## Product architecture boundary

Queueeasy must never be written into a product architecture as:

- production LINE OA;
- customer tenant LINE identity;
- permanent webhook endpoint;
- commercial dependency;
- reason to select a paid hosting/provider path.

A product must still prove its real production/customer LINE architecture separately when that becomes part of sell-ready acceptance.

## Fixture control state

Allowed fixture states:

- `AVAILABLE` — reset verified; may be claimed.
- `CLAIMED:<PRODUCT>` — reserved by exactly one product.
- `TESTING:<PRODUCT>` — active approved test.
- `RELEASE_PENDING:<PRODUCT>` — test ended; cleanup/evidence incomplete.
- `HOLD` — contamination, ambiguous ownership, or reset failure.
- `RESETTING` — cleanup in progress.

Only `AVAILABLE` may transition to a new product CLAIM.

## Current adoption note — 2026-09-07

Owner approved Queueeasy as the shared sequential LINE OA fixture for WSTERA products.

Existing credential slots may be used when populated in the approved local secret store. Empty or missing credential values mean the fixture is not technically ready for a live test; this policy does not authorize fabricating or hard-coding them.

No `.line-mcp/config.json`, product code, provider configuration, webhook, or production system is changed by this governance decision alone.
