# AGENT DISPATCH — T2 product-event signer hardening — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Stage: T2 (product-event signer hardening)
Review Batch: **B2 — Product Event Trust Boundary**
Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001`
Workflow: `WF-DEV-01 v1.3.0` / LONG_RUN
Workspace (absolute): `D:\AI-Workspace\projects\saas-product-hub`
Allowed write scope: `apps/hub-web/server/**`
Task revision base: see `docs/platform/house-long-run/TASK-WSTERA-HOUSE-PRODUCTION-CLOSURE-001.md`
Recorded: 2026-09-20

## Objective

Replace the current shared-secret / caller-selected-product trust shape with the Production Master
Plan's server-bound per-product signer contract, in the existing `hub-web` product-event webhook.

## Locked contract (Production Master Plan — do not reinterpret)

- `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md:192-194`:
  > Each product-event signer must have a separate identity/key bound server-side to exactly one
  > product. The signed envelope includes version, key ID, product ID, event ID, issued-at time and
  > body digest; the Hub enforces a short replay window, idempotency, body-size limit and rate limit
  > before database
- `:884` R3: "Hub's shared HMAC secret lets one product signer impersonate another product" —
  decided §10 D2 "per-product HMAC keys bound to one product ID, with timestamp and replay window;
  shared secret retired at P1"
- `:918` D2: "Per-product HMAC keys: each product-event signer holds its own secret"
- `:518-519` acceptance: "Invalid signatures and replayed events cannot duplicate state changes."
  "A valid signer for one product cannot emit an event for another product."

Required controls: raw-body signature verification **before** any mutation; short replay window;
idempotency; bounded body/request validation; rate/abuse control; wrong-product impersonation
impossible; safe key rotation without caller-controlled product authority.

## Current state (verified by the orchestrator — you do not need to re-derive it)

File: `apps/hub-web/server/webhooks/productEvents.ts` (110 lines)

| Element | Line | Current behaviour |
|---|---|---|
| `productEventSchema` | `:7-19` | includes **`productSlug`** supplied by the caller (`:10`) |
| `verifySignature` | `:37-59` | HMAC-SHA256 over raw body using one shared `secret` |
| `handleProductEventPayload` | `:71-110` | verifies with `ENV.productEventsHmacSecret` (`:75`), then parses, then `getProductBySlug(productSlug)` (`:93`) → writes |
| shared secret env | `apps/hub-web/server/_core/env.ts:8` | `productEventsHmacSecret` = `getRuntimeEnvString("PRODUCT_EVENTS_HMAC_SECRET")` |
| Worker entry | `apps/hub-web/server/worker.ts` | reads header `X-Hub-Signature`, calls `handleProductEventPayload(rawBody, signature)` |
| local dev entry | `apps/hub-web/server/_core/index.ts:19` | same handler on the Express route |

Defect in one sentence: the signature only proves possession of **one shared** secret, while the
**body itself chooses which product the event applies to** — so any signer can emit an event for any
other product. That is exactly R3.

Existing tests: `apps/hub-web/server/webhooks/productEvents.test.ts` — 6 tests, all passing.
Full suite baseline at task start: **174/174 PASS** across 18 files (do not regress this).

## What to implement

1. **Server-side signer registry.** A keyed structure mapping a `keyId` to exactly one authorized
   `productId` plus that signer's own secret. Configuration must come from runtime env/config — do
   not hardcode secrets in source, and do not print any secret value.
2. **Envelope binding.** The signed material must bind, at minimum: `version`, `keyId` (signer
   identity), `productId`, `eventId`, `issuedAt`, and a **body digest**. Signing must cover the raw
   request body plus the envelope fields, so that neither body nor envelope can be tampered with
   independently.
3. **Server-authoritative product.** The authorized `productId` must be resolved from the
   server-side registry by `keyId`. Any caller-supplied product field must either be removed from
   the contract or be treated as a claim that must **equal** the registry binding — a mismatch is a
   denial, never a lookup. Wrong-product impersonation must be impossible.
4. **Verification order.** Raw-body signature + envelope verification must complete **before** any
   database access. Unknown key, unknown product, bad signature, tampered body, expired/too-old
   `issuedAt` (short replay window), and `version` mismatch must all fail closed.
5. **Idempotency.** Duplicate `eventId` must not duplicate state. Preserve the existing
   `recordProductInstallationFromWebhook` dedupe behaviour and its `deduplicated` response field.
6. **Bounded validation.** Explicit maximum body size, and field length bounds (keep the existing
   zod bounds where they are already correct).
7. **Rate/abuse control appropriate to the endpoint.** Bounded per-signer or per-key throttling.
   Implement it in a way that is testable and does not require new paid services or external state.
8. **Rotation path.** Rotating a signer's key must not let a caller choose its own product authority.
9. **Secret hygiene.** No secret value may be logged, echoed in responses, placed in the error body,
   or printed in tests.
10. **Compatibility.** Local dev and the Cloudflare Worker path must both still work; keep the
    handler's existing "runtime-agnostic core" shape so both entries can call it.

## Prohibited

- Do not change `server/_core/index.ts` production semantics or the Worker's route contract beyond
  what the signer envelope requires.
- Do not touch any other webhook (`agentEvents.ts`) or any Control Plane code.
- Do not add dependencies that require a new paid service.
- Do not print or commit any secret value.
- Do not weaken or delete the existing 6 product-event tests; extend them.
- No database mutation, no deploy, no migration.

## Required tests (add, keep all existing)

- missing signature → denied before DB mutation
- bad signature → denied before DB mutation
- tampered body with otherwise-valid signature → denied
- valid signer for Product A cannot emit a Product B event → denied
- unknown `keyId` → fails closed
- unknown product binding → fails closed
- replayed `eventId` → no duplicate state
- expired / out-of-window `issuedAt` → denied or deduplicated per contract
- `version` mismatch → denied
- over-limit body → denied
- rate limit exceeded → denied
- no secret value present in any response body or captured log

## Acceptance evidence to report

- exact files changed
- the full test command run and its exact result (expect the whole suite to stay green)
- typecheck command and result
- which requirements 1-10 above are satisfied and by what code
- statement that no secret value appears in tests, logs, or responses
- statement of no DB mutation / no deploy
