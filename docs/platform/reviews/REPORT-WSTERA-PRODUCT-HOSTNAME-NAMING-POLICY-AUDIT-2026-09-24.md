# REPORT — WSTERA Product Hostname & Public Naming Policy Audit — 2026-09-24

**Purpose:** Read-only audit and handoff for the WSTERA house/controller before any portfolio-wide hostname policy change.
**Owner direction:** Public product names must be unique across the WSTERA portfolio. If a later product would reuse an existing public name, the later product must be renamed before launch. Product codes remain internal identifiers and should not be required in customer-facing URLs.
**Scope:** SaaS Product Hub policy/docs + DocCraft/DC01 hostname blast radius.
**No policy, DNS, Cloudflare route, callback, runtime, or product source was changed by this report.**

## Executive Summary

The current WSTERA policy still explicitly locks product-code hostnames as canonical technical hosts:
- `DC01` → `dc01.wstera.com`
- `BK01` → `bk01.wstera.com`
- `PS01` → `ps01.wstera.com`
- `LK01` → `lk01.wstera.com`

This is not merely an old proposal. The rule was promoted into active portfolio policy in `PORTFOLIO_PRODUCTION_MASTER_PLAN.md` §10 D1 and then propagated into registry comments, HANDOFF, environment/secrets policy, ROADMAP, and launch planning.

The new Owner direction supersedes the original collision rationale: customer-facing product names must themselves be unique, so public hostnames can safely be derived from the unique product slug/name instead of the internal product code.

Recommended target policy:
```text
product_id   = permanent machine identity
product_code = permanent internal portfolio code
name         = unique public product name
slug         = unique/reserved public product slug
public_host  = <slug>.wstera.com
```
For DocCraft:
```text
product_code = DC01
name         = DocCraft
slug         = doccraft
public_host  = doccraft.wstera.com
```

## 1. Current Active Policy That Must Be Superseded

### 1.1 Portfolio Production Master Plan — primary authority
File: `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md`

Section §10 D1 currently states:
- implementation must follow the locked decisions and not re-open them;
- canonical technical host for every product is its product code;
- examples include `bk01.wstera.com`, `ps01.wstera.com`, `lk01.wstera.com`, `dc01.wstera.com`;
- Stripe redirect URLs, OAuth callbacks and LINE callbacks point to the code host;
- branded hostnames are treated only as optional aliases.

**Disposition:** MUST UPDATE. This is the root policy that currently overrides other documents.

### 1.2 Product Registry — active portfolio declaration
File: `docs/products/registry.yaml`

The registry header currently says `product_code` is used for canonical hostnames of the form `<code>.wstera.com`. The DocCraft entry records `product_code: DC01`, `name: DocCraft`, `slug: doccraft`, and live/runtime references to `dc01.wstera.com`. The Booking entry likewise records `bk01.wstera.com` as its canonical technical host.

**Disposition:** MUST UPDATE after the replacement policy is approved.
### 1.3 HANDOFF — active cross-chat continuity
File: `HANDOFF.md`

The “CEO decisions locked — 2026-08-27” section repeats that canonical technical host = product code and that branded aliases may be layered on later.

**Disposition:** MUST UPDATE so future agents do not continue restoring the old rule.

### 1.4 Environment and Secrets Policy
File: `docs/platform/ENVIRONMENT_AND_SECRETS_POLICY.md`

Current domain ownership policy states that every product canonical host is `<product_code>.wstera.com`; Stripe redirects, OAuth callbacks and LINE callbacks must use the code host; branded hostnames are aliases.

**Disposition:** MUST UPDATE. This affects security/integration behavior, so callback migration must be explicit rather than a blind text replacement.

### 1.5 ROADMAP
File: `docs/platform/ROADMAP.md`

The Project B routing table explicitly calls `bk01.wstera.com` the Booking canonical host and cites Master Plan §10 D1.

**Disposition:** MUST UPDATE current routing truth after the replacement policy is adopted.

### 1.6 Current status overlays
File: `docs/CURRENT_STATUS.md`

Current DocCraft status correctly records production at `dc01.wstera.com` for its dated state.

**Disposition:** DO NOT rewrite history. When migration occurs, add a new dated overlay stating old host → new canonical public host and the compatibility/redirect status.
## 2. Historical Documents That Should Not Be Rewritten

These documents are provenance/evidence of decisions and system state at their original dates. Their original text should remain intact.

### 2.1 Original namespace proposal
`docs/platform/PRODUCT_ID_HOSTNAME_NAMESPACE_PROPOSAL.md`

This proposal contains the original collision rationale and proposes code hosts such as `bk01.wstera.com` / `dc01.wstera.com` with branded hosts as secondary aliases. Its own header says “Proposal only — not approved for implementation”, although the idea was later approved in the Master Plan.

**Recommended treatment:** preserve the body and add a supersession notice pointing to the new approved policy/decision.

### 2.2 Frozen launch plan
`docs/platform/PRODUCTION_LAUNCH_PLAN_2026-08-27.md`

This is already marked as a frozen supplemental snapshot and records D1 as resolved to the code-host model.

**Recommended treatment:** preserve historical wording; add only a supersession annotation if needed.

### 2.3 Review, evidence and council artifacts
Examples:
- `docs/platform/PHASE_P0a_B4_EVIDENCE.md`
- `docs/platform/REVIEW-P0a-B4-2026-08-27.md`
- council candidate/raw/synthesis documents
- dated release/security evidence under product repos

**Recommended treatment:** preserve. These prove what was believed, tested, or approved at that time.
## 3. New Owner Direction to Formalize

The replacement policy should explicitly state:

1. **Public product name uniqueness** — every customer-facing WSTERA product name must be unique across the active and reserved portfolio. A later product that would collide must be renamed before launch.
2. **Public slug uniqueness** — every public product slug must be unique across WSTERA. Once published/reserved, a slug is not silently recycled to another product.
3. **Public hostname** — canonical customer-facing application host is `<public_slug>.wstera.com`. Example: DocCraft → `doccraft.wstera.com`.
4. **Internal identifiers remain internal** — `product_id` remains permanent machine identity; `product_code` remains permanent internal portfolio/reference code. Codes remain valid in Control Plane, billing metadata, internal docs, repo references, gates, audit trails and operational records.
5. **Historical host preservation** — previously published code hosts are not immediately deleted. They are migrated/redirected under an explicit compatibility plan so bookmarks, QR codes, old documents and callbacks are not broken.
6. **Rename behavior** — public name changes require an explicit migration decision. A previously published slug remains reserved unless the Owner explicitly releases it after compatibility review.

## 4. DocCraft / DC01 Runtime Blast Radius

A search of the current DocCraft working tree found **47 matches** referencing `dc01.wstera.com`. They fall into two categories and must not be bulk-replaced blindly.

### 4.1 Current runtime/config/test references — migrate deliberately
- `wrangler.jsonc`
- `wrangler.http-redirect.jsonc`
- `worker/http-redirect.mjs`
- `scripts/phase6-production-smoke.mjs`
- `scripts/security-adversarial-browser-round1.mjs`
- `scripts/security-adversarial-round1.mjs`
- `scripts/security-boundary-selftest.mjs`
- `scripts/security-csp-residual-probe.mjs`
- `docs/CURRENT_STATUS.md`
- `docs/RELEASE_AND_OPERATIONS_RUNBOOK.md`
### 4.2 Historical evidence — preserve original hostname
Examples include:
- `docs/GATE6_INDEPENDENT_REVIEW_2026-09-07.md`
- `docs/PHASE6_MVP_IMPLEMENTATION_EVIDENCE.md`
- `docs/PUBLIC_PILOT_SECURITY_READINESS_2026-09-08.md`
- `docs/ADVERSARIAL_SECURITY_ROUND1_2026-09-08.md`
- `docs/testing/AGENT_TEST_PRE_2026-09-09.md`
- dated handoffs/reviews/testing evidence that observed production at `dc01.wstera.com`.

These records were factually correct at their timestamps and should not be rewritten.

## 5. Migration Risks / Items Requiring House Coordination

### 5.1 DNS and Cloudflare routing
The new hostname must be attached and proven before the old host is retired or redirected.

### 5.2 Redirect semantics
The old host needs an explicit compatibility behavior. Do not assume delete/rebind is safe.

At the time of this report, a separate DocCraft smoke finding already exists where live HTTP → HTTPS returns `301` while an older smoke contract expects `308`. That transport issue is separate from this naming decision and should not be silently mixed into the hostname migration.

### 5.3 OAuth / Stripe / LINE / external callback URLs
The current house policy specifically binds callbacks to code hosts. Any product with live provider callbacks must inventory and migrate those endpoints deliberately.

DocCraft V1 currently has no cloud/auth/billing dependency, so its hostname migration is materially simpler than future hosted products with OAuth, Stripe webhooks/redirects or LINE callbacks.
### 5.4 Certificates, HSTS and redirects
New hostname validation must include TLS/certificate state, HTTPS behavior, HSTS policy, redirect loops and old-host compatibility.

### 5.5 Monitoring and release evidence
Production smoke/security tests should be parameterized or updated to the new canonical public host, while preserving old-host tests where compatibility is intentionally supported.

## 6. Recommended Change Sequence

1. Owner/house controller approves a new portfolio hostname/naming decision that explicitly supersedes §10 D1.
2. Create/approve a canonical policy document for public product naming, slug reservation and hostname rules.
3. Update active policy surfaces:
   - Portfolio Production Master Plan
   - registry header + affected product entries
   - HANDOFF
   - Environment and Secrets Policy
   - ROADMAP/current routing truth
4. Mark the old namespace proposal and frozen launch-plan wording as superseded without rewriting historical evidence.
5. Audit every hosted product for code-host assumptions, callbacks and external integrations.
6. Migrate **DocCraft first** as the lowest-complexity real hosted example:
   - attach `doccraft.wstera.com`
   - update current runtime/test config
   - verify production
   - establish compatibility behavior for `dc01.wstera.com`
   - record new dated evidence
7. Only after the pattern is proven, migrate or reserve other hosted products under their unique public slugs.
8. Update Hub/storefront links to point to the canonical public product host.
## 7. Decision Requested From House Controller

Please confirm or reject the following replacement for the old D1 rule:

> **WSTERA public product names and slugs must be unique across the portfolio. The canonical customer-facing application hostname is `<public_slug>.wstera.com`. Product codes remain permanent internal identifiers and are not used as the required customer-facing hostname. Existing code-based hosts are migrated with explicit compatibility/redirect handling and are not removed blindly.**

For DC01, approval would establish:
```text
Internal code: DC01
Public name:   DocCraft
Public slug:   doccraft
Canonical app: doccraft.wstera.com
Legacy host:   dc01.wstera.com (migration/compatibility disposition required)
```

## Audit Verdict

**POLICY CONFLICT CONFIRMED / HOUSE DECISION REQUIRED**

The current active portfolio policy still mandates code-based canonical hostnames. The Owner's new direction is coherent with the existing `name` + `slug` registry model but requires an explicit portfolio-level supersession before runtime migrations should be treated as canonical.

## Evidence Basis

This report is grounded in direct read-only inspection of the current SaaS Product Hub workspace and DocCraft working tree on 2026-09-24. No external assumptions were substituted for repository policy text.