# CM01 Business / Market Doc Pack

Gate: Business / Market Gate
Status: **REMEDIATE awaiting Owner OD-001**
Confidence: **59/100**

## Business Model

CM01 should be treated as a source-code product candidate, not hosted SaaS.

- Payer: frontend developer or web agency.
- User: case officer inside the buyer's client workflow.
- Delivery: source-code React case-management UI template/module.
- V1 runtime: local-first, localStorage-backed, no auth, no backend.
- Commercial promise: save implementation and localization work for Thai-first case-management screens.
- Non-promise: production backend, multi-user sync, hosted deployment, auth, cross-browser support, or finished adapter.

## Monetization

Monetization remains hypothesis-level until OD-001 and downstream validation are resolved.

Permitted gate-level direction:

- One-time source-template / source-license direction is commercially plausible.
- Agency/source reuse packaging is plausible only after license/support boundaries are decided.
- Hosted or recurring SaaS monetization is not V1 and should not be used as the primary V1 model.

Not approved:

- `$39` single-use price.
- `$129` agency price.
- `THB 350/month` recurring.
- Any final plan name, entitlement, refund policy, support promise, update term, or resale permission.

## Competitive Landscape

Direct category pressure:

- Broad React/admin templates are cheaper, mature, and plentiful.
- Generic templates can be "good enough" if the buyer does not need Thai-specific case workflow.

Indirect/status-quo pressure:

- LINE OA/chat, Google Sheets, Excel, Make/n8n, paper, and owner/admin memory.
- Custom Thai CRM/back-office builds.
- Hosted ticket/support SaaS.

CM01 competes by being narrower and faster to embed, not by being broader.

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

## Pricing Hypotheses

Pricing is not approved. Preserve these as hypotheses only:

- Low one-time template price may fit the broad template market, but must be reconciled with commercial license terms.
- Higher agency package may be possible only if license permissions, reuse rights, docs, examples, and support boundaries are clear.
- Recurring V1 pricing is currently misaligned with local-first source-template identity unless future scope changes.
- Willingness-to-pay must be validated against cheaper generic templates and the buyer's actual implementation-time savings.

## Market Assumptions To Validate

- Thai frontend developers/web agencies repeatedly need case-management UI.
- Thai-first domain workflow matters enough to beat generic templates.
- Buyers accept local-first V1 when BYO-backend is explicit.
- Buyers understand and accept source-code integration instead of no-code installation.
- Buyers will pay before a backend adapter exists.
- Support burden is manageable at the intended price.
- Repeat purchase or maintenance revenue exists.

## Open Decisions

### OD-001 License Strategy

Status: **Owner Decision Required**

Canonical options from `01-product/CM01/OPEN-DECISIONS.md`:

- **A (Recommended):** Replace/augment sale package with commercial EULA or dual-license terms before first sale.
- **B:** Keep MIT and sell only convenience/support, accepting redistribution risk.
- **C:** Delay sale until legal/licensing review produces a final policy.

Business / Market Gate cannot PASS until this is resolved.

### OD-002 Buyer Demand Threshold

Carry forward. Demand validation remains unproven and should be handled before launch execution.

### OD-004 Backend Adapter Direction

Carry forward. Backend remains post-V1 and undecided.

### OD-006 Buyer Onboarding Pack

Carry forward. Buyer docs/support package is missing and must be defined before sale/launch execution.

## Gate Acceptance State

CM01 does not satisfy Business / Market PASS because OD-001 remains unresolved. Once Owner decides OD-001, targeted remediation may update the Business / Market docs and verdict if the decision resolves the license contradiction.

Release 1B remains incomplete while CM01 is in REMEDIATE. No Architecture, Risk, Pre-Build, Agent Relay, implementation, launch, deployment, pricing mutation, license mutation, or backend work is released by this doc pack.
