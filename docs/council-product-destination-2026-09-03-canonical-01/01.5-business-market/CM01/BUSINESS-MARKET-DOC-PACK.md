# CM01 Business / Market Doc Pack

Gate: Business / Market Gate
Status: **PASS after OD-001 Option A**
Confidence: **59/100**

## Business Model

CM01 should be treated as a source-code product candidate, not hosted SaaS.

- Payer: frontend developer or web agency.
- User: case officer inside the buyer's client workflow.
- Delivery: source-code React case-management UI template/module.
- V1 runtime: local-first, localStorage-backed, no auth, no backend.
- Commercial promise: save implementation and localization work for Thai-first case-management screens.
- Non-promise: production backend, multi-user sync, hosted deployment, auth, cross-browser support, or finished adapter.

## OD-001 License Strategy

Status: **DECIDED - Owner chose Option A**

Future paid CM01 sale packages use **WSTERA Commercial License + EULA** rather than relying on the old MIT package as the commercial sale contract.

Applied terms for Business / Market gate purposes:

- Buyer may use, modify, and deploy the purchased source commercially under the purchased license.
- Buyer may not redistribute or resell the source as a standalone or competing module, template, or source package.
- Rights already granted under historical MIT versions remain granted and are not retroactively revoked.
- WSTERA-owned future versions may be released under the new commercial terms.
- Sale packaging direction is **WSTERA Commercial License + EULA**.

Effect on gate: the prior MIT-vs-paid-single-use contradiction is resolved at the Owner-decision level. Actual license/EULA drafting and legal review remain downstream Legal/Launch work.

## Monetization

Monetization remains hypothesis-level even though the Business / Market Gate now passes.

Permitted gate-level direction:

- One-time source-template / source-license direction is commercially plausible if packaged under WSTERA Commercial License + EULA.
- Agency/source reuse packaging is plausible only after license/support boundaries are drafted and approved.
- Hosted or recurring SaaS monetization is not V1 and should not be used as the primary V1 model.

Not approved:

- `$39` single-use price.
- `$129` agency price.
- `THB 350/month` recurring.
- Any final plan name, entitlement, refund policy, support promise, update term, legal term, or resale permission beyond the OD-001 decision boundary.

## Competitive Landscape

Direct category pressure:

- Broad React/admin templates are cheaper, mature, and plentiful.
- Generic templates can be good enough if the buyer does not need Thai-specific case workflow.

Indirect/status-quo pressure:

- LINE OA/chat, Google Sheets, Excel, Make/n8n, paper, and owner/admin memory.
- Custom Thai CRM/back-office builds.
- Hosted ticket/support SaaS.

CM01 competes by being narrower and faster to embed for Thai-first case workflow, not by being broader.

## Positioning

Use this positioning until changed by a later Owner decision:

> Thai-first React source template for case intake, action tracking, history, and retention, built for developers/agencies that need to embed a ready case-management UI into client projects.

Required positioning boundaries:

- Say local-first and source-code clearly.
- Say BYO backend / backend adapter later.
- Say no auth and no multi-user sync in V1.
- Say Chromium-only E2E evidence if any browser support claim is made.
- Do not call CM01 a SaaS, full ticketing system, backend module, or BK01 feature.
- Do not claim config-level repository injection unless that is built and documented later.

## Customer Value Proposition

Pain -> Capability -> Outcome -> Business Value -> Reason to Pay:

- Rebuilding Thai case workflow repeatedly -> ready intake/detail/history screens -> less implementation work -> faster client delivery -> pays to save developer time.
- Client needs Thai officer workflow -> Thai-first UI/i18n -> less localization work -> lower project friction -> pays to avoid custom translation/domain work.
- Generic CRUD misses case rules -> phone normalization, overdue, retention, status behavior -> fewer workflow mistakes -> more credible back-office UX -> pays for domain-specific behavior.
- Agency needs client branding -> theme presets and host-configurable theme -> faster client adaptation -> easier reuse across projects -> pays if support/license allows reuse.
- Future backend needed -> repository boundary -> clearer integration path -> lower architecture ambiguity -> pays only if expectations are documented honestly.

## Market Assumptions To Validate

- Thai frontend developers/web agencies repeatedly need case-management UI.
- Thai-first domain workflow matters enough to beat generic templates.
- Buyers accept local-first V1 when BYO-backend is explicit.
- Buyers understand and accept source-code integration instead of no-code installation.
- Buyers will pay before a backend adapter exists.
- Support burden is manageable at the intended price.
- Repeat purchase or maintenance revenue exists.

## Preserved Downstream Gaps

These are not Business / Market blockers after OD-001 Option A, but they must carry forward:

- OD-002 buyer demand: no primary buyer interviews, paid pilots, pre-orders, LOIs, conversion evidence, or channel proof.
- Willingness-to-pay versus cheaper generic React/admin templates.
- Final pricing and packaging.
- OD-006 buyer docs/support: embed guide, adapter guide, theme guide, limitations, distribution manifest, and support scope.
- OD-004 backend adapter direction: Supabase, REST, Module Hub `ticket-tracker`, or another path remains post-V1 and undecided.
- Unit economics and support burden.
- Cross-browser evidence.
- Repeat-purchase and retention evidence.

## Gate Acceptance State

CM01 now satisfies the Business / Market Gate at the document level because the only locked blocker, OD-001 License Strategy, has been resolved by Owner Option A.

Release 1B is complete at the document level after CM01 PASS. This doc pack does not release Architecture, Risk, Pre-Build, Module Hub Scan, Agent Relay, implementation, launch, deployment, code changes, actual license/EULA drafting, or final pricing approval.
