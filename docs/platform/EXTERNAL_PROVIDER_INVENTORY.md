# External Provider Inventory

**Satisfies:** P0a item 4's external-provider inventory requirement, companion to
`ENVIRONMENT_AND_SECRETS_POLICY.md`.

**Verification method:** every provider row is evidenced by code, `.env.example`/`.env` variable
**names** (never values), or explicit statements in `PORTFOLIO_PRODUCTION_MASTER_PLAN.md`,
`BILLING_CORE_PLAN.md`, or `HANDOFF.md` — not by prose assumption. A provider is listed only where
this session found direct evidence of its use. No network call or provider API check was made.

---

## Providers in use

### Supabase

- **Depends on it:** `hub-web` (Project A, `coyelzlgukvpgguqpjdi`), BK01, PS01 (own project, project
  ID not captured in this session's reads beyond `HANDOFF.md`'s two known project IDs
  `gyleqrjdzwwlqierdwcy`/`coyelzlgukvpgguqpjdi` — which one is PS01's specifically is
  **UNVERIFIED** from documents read this session), MT01 (buyer's own project, per its `.env.example`
  comment — not a WSTERA-operated dependency once shipped), billing-core (planned — dedicated
  `billing_core` schema inside Project A per §10 D3).
- **Used for:** primary application database (Postgres + RLS), Auth, and for `hub-web` also Storage
  (`SUPABASE_STORAGE_BUCKET`).
- **Request path:** critical — every product's core data reads/writes go through it directly; not a
  background/best-effort dependency for any of BK01/PS01/`hub-web`.
- **Degraded mode if it fails:** **not documented for any product.** No repository's code or docs
  reviewed this session define a fallback, cache, or graceful-degradation behavior for a Supabase
  outage — this is a direct G4 gap (§4 G4 requires an approved degraded mode) for BK01, PS01, and
  `hub-web` alike. Per §10 D3's accepted residual risk, a Project-A outage is explicitly accepted to
  mean "billing-core checkout fails, not a data-loss event" — that is the one documented
  degraded-mode statement found, and it covers only billing-core's future checkout path, not the
  Hub's or any product's general database availability.
- **Per-environment credentials:** each product's `.env.example` declares its own
  `SUPABASE_SERVICE_ROLE_KEY`/`SUPABASE_URL` (or `NEXT_PUBLIC_` equivalents), implying per-project
  separation by design, but no repository was found declaring a *second* (staging) Supabase project —
  see the environment-naming gap in the companion document. **Gap: no verified staging/production
  credential split for any product's Supabase usage today.**
- **Known blast radius:** the `service_role`/secret key for any given project bypasses RLS entirely
  for that project (see `ENVIRONMENT_AND_SECRETS_POLICY.md`'s secret inventory). PawSpace's elevated
  key is singled out in §10 D4 specifically because of this.

### Cloudflare

- **Depends on it:** `hub-web` (deployed and live on Cloudflare Workers since 2026-08-25, custom
  domain `wstera.com` attached), BK01 (Workers build scaffolded via `@opennextjs/cloudflare`, not yet
  deployed per `registry.yaml`), and by extension every future subdomain (`<code>.wstera.com`)
  reserved under it. Also the domain registrar for `wstera.com` itself (Cloudflare Registrar).
- **Used for:** DNS/zone for `wstera.com`, Workers compute/hosting, custom-domain routing, and (per
  `HANDOFF.md`) the secret store for at least `hub-web`'s production credentials ("sync ไปแล้วทั้ง
  Cloudflare secret และ vault กลาง").
- **Request path:** critical for `hub-web` — it *is* the request path (edge compute), not a
  dependency called from another origin.
- **Degraded mode if it fails:** **not documented.** No repository has a documented Cloudflare-outage
  runbook; G6 requires DNS/TLS/cache verification "from outside the operator network" but this
  session made no network call and cannot confirm any such verification has occurred. Recorded as a
  gap, not resolved.
- **Per-environment credentials:** **UNVERIFIED.** No document read this session states whether the
  Cloudflare API token/account credential used for deploys is scoped per-environment (e.g. a
  narrower token for preview builds vs. a production-deploy token) or is one account-wide credential
  used everywhere.
- **Known blast radius:** highest in the portfolio if compromised — control of the `wstera.com` zone
  and every Worker deployed under it, including the ability to redirect the entire portfolio's public
  surface. See the companion document's secret table.

### Stripe

- **Depends on it:** BK01 (own isolated integration — checkout, billing portal, webhook route, price
  IDs `STRIPE_PRICE_BASIC`/`STRIPE_PRICE_PRO`), MT01 (buyer-facing demo payment path, optional per
  its `.env.example`), HC01 (`payment` module, `USE_MOCK_PAYMENT` toggle present in its config),
  billing-core (planned — the entire point of the service, per `BILLING_CORE_PLAN.md`).
- **Used for:** subscription checkout, billing portal, webhook-driven subscription-state
  synchronization.
- **Request path:** critical for the checkout/portal flow specifically; background/asynchronous for
  webhook-driven state sync (a delayed webhook does not block a page load, but does delay
  entitlement correctness).
- **Degraded mode if it fails:** `BILLING_CORE_PLAN.md` §5c explicitly documents one: "`/v1/checkout`
  failing is a lost sale, not a data-integrity problem — it is safe to hard-fail with a clear
  user-facing error." This is the one provider/degraded-mode pairing in the whole portfolio with an
  actual written answer — but it is written for billing-core, which does not exist yet, not for BK01's
  already-live inline integration. **BK01 has no documented Stripe-outage degraded mode found in this
  session's reads.**
- **Per-environment credentials:** `BILLING_CORE_PLAN.md` P-2 requires test-mode keys through Phase 3
  and a startup guard refusing to boot on a live key without an explicit override flag — a real,
  written per-environment discipline, but again only specified for billing-core (not yet built). BK01
  and HC01's `.env.example` files show a single `STRIPE_SECRET_KEY` name with no environment suffix
  or separate staging/production variable — **UNVERIFIED** whether BK01 in practice uses different
  keys per environment; the variable naming convention alone does not prove it.
- **Known blast radius:** full Stripe account API access for whichever key/mode is compromised —
  read customer/payment data, create charges. §10 D7 already accounts for the sensitivity of
  payment data by giving billing-core the tightest RPO in the portfolio (1h).
- **Known constraint (explicit, §10 D3 / R14):** the portfolio runs **two permanently separate
  billing implementations** — BK01's inline Stripe integration and billing-core. Any Stripe
  integration defect must be triaged against both; a runbook naming only one fails G6 per the master
  plan's explicit text.

### LINE

- **Depends on it:** BK01 (`LINE_CHANNEL_SECRET`, `LINE_CHANNEL_ACCESS_TOKEN`, central LINE OA ID),
  PS01 (LINE Messaging API for daily-report delivery, LINE Login/LIFF for customer identity claim,
  per-shop and Phase-6 multi-token dispatch). LN01 (`line_oa_ai`, out of the seven-product scope) also
  depends on it but is explicitly excluded from this brief's scope per the master plan's seven-product
  boundary.
- **Used for:** webhook-driven customer messaging (BK01), staff/customer daily-report push messages
  and LIFF-based identity/booking flows (PS01).
- **Request path:** background for outbound message dispatch (report delivery, notifications);
  potentially on the critical path for PS01's LIFF customer identity claim flow (a customer cannot
  claim/verify identity if LINE Login is unreachable) — **not independently confirmed** whether PS01's
  LIFF claim flow has a fallback path; no such fallback was found in this session's reads.
- **Degraded mode if it fails:** **not documented** for either BK01 or PS01 in any file read this
  session. Master plan R9 names LINE among the providers requiring "per-provider
  timeout/retry/reconciliation/degraded-mode runbooks and alerts" as a portfolio risk still requiring
  control — i.e., the master plan itself records this as unresolved, not something this brief is
  contradicting.
- **Per-environment credentials:** PS01's `.env.example` shows both a single-token
  (`LINE_CHANNEL_ACCESS_TOKEN`, early phase) and a later per-shop JSON map
  (`LINE_CHANNEL_ACCESS_TOKENS_JSON`) pattern — this is a per-*tenant* credential split, not a
  per-*environment* (staging vs. production) split. **UNVERIFIED** whether staging/production use
  distinct LINE channels at all.
- **Known blast radius:** a compromised channel access token allows sending messages as the
  product's LINE OA (spam/impersonation risk to real customers); a compromised channel secret allows
  forging inbound webhook signatures.

### Google (Google Sheets / service account)

- **Depends on it:** PS01 only — `GOOGLE_SERVICE_ACCOUNT_JSON`, `GOOGLE_SYNC_DISPATCH_SECRET` in its
  `.env.example`, and `google-sheets-api.ts` in its `lib/` directory.
- **Used for:** syncing shop operational data (per PS01's description, care/report data) to a
  merchant-owned Google Sheet.
- **Request path:** background — sync, not a request-blocking dependency for the core booking/care
  flows (based on the module naming; not independently traced through every call site in this
  session).
- **Degraded mode if it fails:** **not documented.** `BILLING_CORE_PLAN.md` (§4 PS-D work package,
  referenced in the master plan) explicitly lists "Google Sheets retry and reconciliation" as future
  work still to be tested — confirming this is a known open gap, not resolved yet.
- **Per-environment credentials:** the service account JSON is one value per `.env.example`; no
  staging/production split evidenced.
- **Known blast radius:** whatever the service account's Google Cloud IAM scope grants — full access
  to sync target sheets at minimum; exact IAM scope was not verified (would require reading the
  credential's actual grants, out of scope for a names-only inventory).

### Object storage (Supabase Storage)

- **Depends on it:** `hub-web` (`SUPABASE_STORAGE_BUCKET`, defaults to `product-assets`) for public
  product-catalog asset uploads.
- **Used for:** product logo/screenshot/doc storage for the Hub catalog.
- **Request path:** background relative to the main catalog page (an upload failure does not take
  down browsing), but on the critical path for the admin upload flow itself.
- **Degraded mode if it fails:** not separately documented from the general Supabase entry above —
  it is the same Supabase project, so its availability is coupled to the Supabase row above, not an
  independent provider.
- **Per-environment credentials:** same as Supabase generally — no verified staging split.
- **Known blast radius:** master plan §3.1 already documents the specific upload-path risk in detail
  (magic-byte/content validation, active-content rejection, quarantine policy) as required controls,
  separate from the credential-leak blast radius — recorded here for completeness, not re-derived.

### AI providers (OpenAI / Anthropic / Google Gemini)

- **Depends on it:** MT01 only, and only as buyer-supplied optional keys in the shipped starter kit
  (`.env.example`: "only one AI provider key is required to exercise the `/ai/demo` endpoint"). Not a
  WSTERA-operated production dependency for any of the seven products' own hosted operation — MT01 is
  a source product the buyer deploys and configures themselves.
- **Used for:** demonstrating the AI-provider adapter pattern in the shipped reference server.
- **Request path:** non-critical, demo-only, per the `.env.example`'s own "Optional" framing.
- **Degraded mode if it fails:** not applicable to WSTERA's own operation; a buyer's own concern once
  shipped. **Gap for the shipped product itself:** whether the reference server handles a missing/
  invalid AI key gracefully (clear error) vs. crashing was not verified in this session.
- **Per-environment credentials:** not applicable — buyer-supplied, buyer-scoped.
- **Known blast radius:** limited to whichever single buyer's own account is misconfigured; not a
  WSTERA-side blast radius once shipped.

---

## Decided architectural constraints (restated, not re-derived)

- **§10 D3 — billing-core database placement.** `billing_core` is a **dedicated schema inside the Hub
  Supabase project** (Project A), reached by **a dedicated Postgres role scoped to that schema
  only**. Billing-core never uses the project `service_role`/secret key. The schema is not exposed to
  the Data API. This is a locked CEO decision, not a proposal — recorded here because it is the
  concrete answer to "how does billing-core touch Supabase without holding project-wide access."
- **§10 D4 — PawSpace billing trust.** billing-core reaches PawSpace **only** through a narrow signed
  Edge Function ingress (`billing-entitlement-ingress`, per `BILLING_CORE_PLAN.md` §2) and **never**
  holds PawSpace's own project-wide elevated Supabase key. The risk-acceptance alternative ("just
  accept billing-core holding the elevated key") is explicitly closed by CEO decision. The elevated
  key stays inside the PawSpace Edge Function environment only.

---

## Gaps — every provider dependency with no documented degraded mode, no per-environment credential
separation, or no named rotation owner

Compiled from the "Degraded mode" and "Per-environment credentials" rows above; rotation owner is the
CEO for every credential-class secret per the companion document's inventory, so no rotation-owner
gap exists at the *name* level — the gap that does exist is that no document evidences an actual
rotation *schedule/cadence* for any of them beyond the one-off 2026-08-25 DB password rotation
recorded in `HANDOFF.md`.

| Provider | No documented degraded mode | No verified per-environment credential separation | No rotation cadence documented (schedule, not just capability) |
|---|---|---|---|
| Supabase | Yes — for BK01, PS01, `hub-web` general availability (billing-core's future checkout-only case is the one exception) | Yes | Yes |
| Cloudflare | Yes | Yes (UNVERIFIED, treated as a gap) | Yes |
| Stripe | Yes for BK01's live inline integration (billing-core's plan has one, once built) | Partial — written requirement exists for billing-core (test-mode-only through Phase 3), not verified for BK01/HC01 today | Yes |
| LINE | Yes | Yes | Yes |
| Google (Sheets) | Yes | Yes | Yes |
| AI providers (MT01) | Not applicable — buyer-owned once shipped | Not applicable | Not applicable |

**Reading this table plainly:** every provider actually in production use today (Supabase, Cloudflare,
Stripe via BK01, LINE, Google) has zero documented degraded mode and zero verified environment
credential separation. This matches — and gives concrete evidence for — master plan risk R9 ("LINE,
Google, Stripe, Supabase, Cloudflare and storage failures cross operational boundaries") and G4's
explicit requirement that a degraded mode be "approved and tested" before a product is release-ready.
None of the seven products currently meets that G4 clause for any external provider.
