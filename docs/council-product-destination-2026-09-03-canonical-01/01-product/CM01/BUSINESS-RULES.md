# CM01 Business Rules

Gate verdict: REMEDIATE

## Locked Rules

- Single in-app role: case officer. Agreement: 3/3.
- No auth and no roles in V1 by design. Agreement: 3/3.
- Thai is default; English toggle exists. Agreement: 3/3.
- Tickets persist locally through localStorage adapter in V1. Agreement: 3/3.
- UI/domain must remain decoupled from direct localStorage calls through repository boundary. Agreement: 3/3.
- Phone search uses normalized phone values, so formatted and unformatted versions match. Agreement: 3/3.
- Prior-history notice must not autofill new case fields. Agreement: 3/3.
- Overdue is computed from due date and non-Closed status. Agreement: 3/3.
- Overdue state must not automatically change ticket status. Agreement: 3/3.
- Retention cleanup is manual. Agreement: 3/3.
- Retention cleanup deletes Closed tickets only. Agreement: 3/3.
- Active/non-Closed tickets are never deleted by retention cleanup. Agreement: 3/3.
- `RecheckPayload` is local-only and not transmitted in V1. Agreement: 3/3.
- Backend adapter is post-V1 unless a later owner decision changes scope. Agreement: 3/3.

## Buyer-Facing Rules

- CM01 must be described as source UI/template/module, not deployed software. Agreement: 3/3.
- LocalStorage-only limitations must be explicit. Agreement: 3/3.
- Chromium-only E2E evidence must not be represented as cross-browser support. Agreement: 3/3.
- Pricing proposals must not be represented as approved pricing. Agreement: 3/3.
- MIT vs paid single-use distribution must be resolved before first sale. Agreement: 3/3.
