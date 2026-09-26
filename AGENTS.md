# AGENTS.md — SaaS Product Hub Governance

This file governs `D:\AI-Workspace\projects\saas-product-hub` and nested product/service work unless a more specific nested instruction adds stricter rules.

## Source-of-Truth Order

1. Latest explicit Owner decision.
2. `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md` and locked platform architecture.
3. `docs/platform/MODULE-REUSE-POLICY.md` for reuse procedure.
4. Product-specific locked PRD/architecture/security/release documents.
5. Current repository/code/runtime evidence.
6. Historical logs/evidence.

## Mandatory Pre-Build Sequence

Before production implementation introduces or materially changes a product, service, backend capability, major feature, infrastructure capability, or shared platform capability:

1. Read the product Source of Truth.
2. Perform the MT01 Bootstrap Check when the work is SaaS/backend/multi-tenant/bootstrap related.
3. Perform the Module Reuse Check from `docs/platform/MODULE-REUSE-POLICY.md`.
4. Resolve central-platform vs product-runtime ownership before selecting local modules.
5. Record module decisions and provenance plan.
6. Require `Reuse Gate: PASS` before coding.

Do not jump directly from a brief to production implementation.
## Reuse Hard Stop

If a canonical reusable capability is duplicated without an evidence-backed `REJECT WITH JUSTIFICATION`:

`STOP — REUSE GATE FAILED`

Reviewer classification: `UNJUSTIFIED_DUPLICATE_IMPLEMENTATION`.

Pure remediation that preserves an existing capability may use the policy-defined `Reuse Gate: N/A` exemption with a specific reason. Capability-building work may not.

## Copy-and-Own

`modules-hub` is a source library. Copy a reviewed module into the destination repository, record source version + immutable commit + copy date + local changes, and adapt only the destination-owned copy.

Never add a cross-repository runtime dependency to Module Hub. Never patch Module Hub inline to satisfy one product; open a separate scoped upstream task.

## Platform Boundary

Selecting MT01 or finding `payment` / `subscription` modules does not authorize product-owned duplication of central WSTERA platform services. Follow `docs/platform/BILLING_CORE_PLAN.md` and other locked platform contracts first.

## Agent Relay

Any build-capable Agent Relay dispatch must satisfy the canonical Relay reuse preflight. Missing or failed applicable reuse evidence is a hard HOLD before build cards are created or released.

## Mandatory WSTERA Production Readiness Gate

Canonical authority:

`Gutumrod/wstera-workflows:policies/PRODUCTION-READINESS-STANDARD.md`

Canonical evidence record:

`Gutumrod/wstera-workflows:templates/PRODUCTION-READINESS-RECORD-TEMPLATE.md`

For every product/module/platform capability:

`BUILD_PASS != PRODUCTION_READY != LIVE_PROVEN != OPERATED_STABLE`.

Tests green, reviewer PASS, merge, deploy, or one successful run must not be used as production-readiness proof.

Before any production-ready/live-stable claim:

1. pin the exact candidate revision/artifact and target environment;
2. complete all applicable G1-G10 readiness gates;
3. create/update the Production Readiness Record;
4. verify observability, recovery, security, operational ownership, and live acceptance evidence;
5. HOLD if any required gate/evidence is missing.

This gate applies prospectively to every new readiness claim. Existing products keep their evidence-backed current state and are assessed/remediated one at a time; do not mass-promote or mass-fail them.

## Existing Products

This governance change is prospective. Do not mass-refactor existing products. Audit and remediate them one at a time under separate approved scopes.

## Documentation-First Brief Rule

Owner decision effective 2026-09-08:

- Do not use chat as the canonical home of a brief, handoff, remediation plan, execution plan, or continuation instruction.
- Every new brief must be written to a durable repository document before it is handed off or used as execution authority.
- Chat may report status, decisions, commit SHAs, and the exact document path; it must not be the only copy of the brief.
- Every brief must contain a `Source-of-Truth References` section with exact repository paths and, when material, commit SHAs or runtime evidence.
- If a required reference does not exist, create or repair the evidence document first. Do not fill the gap with an unsupported chat summary.
- Handoffs must record current state, verified evidence, scope, blockers, decisions, acceptance criteria, and the next authorized action.
- Historical or failed evidence must remain clearly labeled and must not be silently rewritten into current truth.

This rule applies to House, product coordinators, agents, Council follow-ups, platform work, and cross-product remediation.

## WSTERA Commercial Rules L-01–L-15 (Owner-locked 2026-09-25)

Canonical source (Thai, wins on conflict): `Gutumrod/second-brain-vault:06-Agent-Logs/WSTERA-House/PLAN-HOUSE-LOCKED-v1-2026-09-25.md` (sha256 `27772B0A…06814A`) and its addenda in `STATUS-HOUSE.md`. This section is a pointer copy; do not edit rule content here without an Owner-approved addendum there.

Applies to every product WSTERA sells (BK01, PS01, DC01, MT01, HC01, WS01, LK01, Module Hub, and any later product).

- **L-01 TH/EN:** every customer-facing UI and every customer-read document (product page, manual/README, integration guide, license/terms/support docs) must exist in both Thai and English. API/function/type names, code comments and error codes stay English-only. Missing either language = not sell-ready.
- **L-02 Delivery acceptance:** the Owner must personally complete the flow as a customer (CD-01–CD-04: test mode, then real money + refund; evidence the Owner can see personally; any step the Owner cannot do alone = not passed). Agent logs, tests or TEST mode alone never count.
- **L-03 Payments:** WSTERA collects money through SB01 (central billing) only. Products must not hold Stripe/provider keys or set amounts. Known transitional exception: BK01's own Stripe subscription (Owner-approved, extraction plan applies).
- **L-04 Ship when ready:** a product/module that is sell-ready may launch alone; do not wait for others or a full bundle.
- **L-05 Not ready = not shown:** Module Hub items that are not sell-ready do not appear on the site (no Coming Soon, no waitlist). SaaS keeps the existing Coming Soon until 4 SaaS products are really on sale, then remove it.
- **L-06 No overclaiming:** no fake customer counts, ratings or social proof. A registry "Completed" status is not sell-ready.
- **L-07 Prices come from the Owner only:** agents never invent prices, discounts, coupons, tax/VAT or renewal prices. Currency follows language: Thai → THB, English → USD. Both prices are fixed numbers set by the Owner (no automatic FX conversion); the customer pays in the currency shown; SB01 billing profiles store both; PromptPay is THB-only; a separate currency switch may come later. (Supersedes the earlier "Module Hub primary price in USD, other currencies display-only" rule.)
- **L-08 One storefront, one catalog:** `wstera.com` only; one catalog split by `productKind` (saas/module/pack/bundle) + `billingModel` (subscription/one_time). No parallel catalog database. Business buyers → SaaS Hub; developers → Module Hub.
- **L-09 Separate customer and staff surfaces:** staff/admin pages stay off the buyer path. `platform.wstera.com` is the Control Plane and must not merge with the storefront.
- **L-10 Catalog is not financial truth:** no Stripe/provider logic in the storefront as a shortcut; no fake payment or entitlement states.
- **L-11 Minimum security:** secrets live only on the host / `D:\AI-Workspace\.secrets\` — never in client bundles, docs, logs or fixtures. Hiding a button is not authorization; enforce on the server. Keep security headers. Migrations must be forward-safe and non-destructive unless the Owner approves.
- **L-12 Solid foundations for future scale:** catalog, billing, auth/security, data model and TH/EN must be designed to grow without a rewrite (long-term plan over current usage).
- **L-13 Launch support:** text-only support (ticket / bug report / written). No live calls. Consulting/installation is not included and is sold separately.
- **L-14 Minimum sell-ready bar:** works for real + TH/EN docs (L-01) + Owner customer run passed (L-02) + deliverable + support channel + license/terms or ToS.
- **L-15 Legal before charging:** source products need a license/terms; SaaS needs ToS + Privacy Policy before any money is collected.

Module Hub only (not required for other products): one-time purchase + 12 months of free updates; unlimited projects, no per-seat pricing; Pack discount 15–25% / Bundle 30–40%; packs grouped by use case; Sell Ready Standard (5 items: source, docs, example, integration guide, tests).

Changing any price, license/legal text, payment path, production DB/deploy/secret, security boundary, or repo visibility is a high-risk decision reserved for the Owner.
