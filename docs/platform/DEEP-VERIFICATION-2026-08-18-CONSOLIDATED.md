# Deep Code Verification — Consolidated (2026-08-18 → 2026-08-19 checkpoint)

> **Update (2026-08-19 evening):** the four blockers this document identifies are now fixed and
> committed (local only, not pushed) — `booking@ed06fa2`, `headless-commerce@79c1d7c`,
> `multi-tenant-ai@92139cf`. This document is left as-is below as the point-in-time evidence that
> justified the fix work; see `docs/platform/ROADMAP.md` §0 gate 3 for current status and
> `D:\AI-Workspace\vault\06-Agent-Logs\SaaS-Product-Hub\2026-08-19-domain-readiness-fixes-execution.md`
> for the fix narrative.

**Purpose:** Answer one question with evidence, not documentation claims: is any product in this
portfolio genuinely ready for the owner to buy a production domain and open it for real paying
customers? "Ready to open the domain" was defined by the owner as "ready to receive real revenue."

**Sources merged into this document:**
1. An independent external reviewer (no context on this project, no access to this conversation or
   to Hermes) — `SaaS-Product-Hub-Deep-Code-Verification-2026-08-18.md`.
2. Hermes, dispatched via `BRIEF-deep-code-verification-2026-08-18-for-hermes.md`, run in **two
   independent rounds**: round 1 by agent-agy/agent-qwen, round 2 by agent-codex explicitly
   re-deriving every round-1 claim from source rather than trusting the round-1 report. Nine files
   under `D:\AI-Workspace\runtime\hermes-native\workspace\deep-verify-2026-08-18\`.
3. Claude (Commander) — direct read of the two most consequential contested files
   (`headless-commerce/server/src/routes/payments.ts` + `error-handler.ts`,
   `multi-tenant-ai/server/src/app.ts`) to resolve a conflict between sources 1 and 2 below.

**Method note:** where source 1 and source 2 disagreed, source 2's claim was checked directly
against the file on disk before being accepted. This document states only what is confirmed by at
least one direct code read, never a claim taken on trust from a single report.

---

## Bottom line

**No product is ready to open a domain for real revenue yet.** Booking is closest. All four
near-term products have at least one confirmed blocker that would let the product take money (or
claim to) without actually delivering or protecting it.

| Product | Core engineering | Confirmed blocker(s) | Domain-ready? |
|---|---|---|---|
| `booking` | Solid — DB-level hold/collision protection, real LINE HMAC, real Stripe Checkout/Portal/webhook | Quota (100/500 bookings, 5/10 staff, top-up) is **sold but not enforced anywhere in code** | ❌ |
| `headless-commerce` | Reference server works for its tested paths | Stripe webhook **never verifies signature**; malformed webhook JSON throws unhandled 500 | ❌ |
| `multi-tenant-ai` | Real `StripeWebhookVerifier` with HMAC/timing-safe compare exists | Middleware **mount order breaks it in this app** (`express.json()` before the route's `express.raw()`); idempotency store and `handleBillingEvent` are never wired to the server | ❌ |
| `line_oa_ai` | Module source is clean, no stubs; **core AI-response path has 1–3 days of real production traffic via a live KMO LINE OA** (owner-run internal pilot, not a synthetic test) | Zero automated or manual test against a real LINE Messaging API/OA sandbox for the *product* packaging (onboarding, per-shop config, billing); `RedisSessionStore` is documented but not implemented | ❌ (lower AI-quality risk than the others, given live evidence) |

---

## 1. Booking — corrected verdict

Both source 1 (independent outsider) and source 2 (Hermes, 2 rounds) independently reached the
same verdict; source 2 additionally pinned exact evidence. Not contested.

**Confirmed working (code-level, not just docs):**
- 26 migrations, sequential, all committed (`9134a1c` latest)
- `create_booking_hold` RPC: 15-minute hold, DB-level overlap exclusion constraint
- `submit_deposit_slip` RPC: expiry-checked, re-submit allowed (overwrites, counted, no hard block)
- `cancel_booking` RPC: auth + shop-membership + status-guarded
- LINE webhook: `crypto.timingSafeEqual` HMAC check, hard 401 on bad/missing signature, **no silent
  fallback**
- Stripe: real `checkout.sessions.create`, real `billingPortal.sessions.create`, real
  `constructEvent()` + idempotency table + `sync_subscription_state` RPC in the webhook route

**Confirmed broken/missing:**
- **HIGH — Quota is sold, not enforced.** `PRICING_SPEC.md` (owner-approved 2026-08-05) promises
  Basic 100 bookings/5 staff and Pro 500 bookings/10 staff plus paid top-ups. Two migrations
  explicitly say quota/add-on accounting is out of scope. `grep` across the whole app for
  quota/staff_limit/queue_limit/top-up returns **zero matches**. A free-trial shop can add
  unlimited staff and take unlimited bookings today. This is a revenue-integrity gap, not a
  polish item — the product would be sold on a promise the system does not keep.
- MEDIUM — live-apply of the 26 migrations to the actual Supabase project is unverified from
  source (read-only investigation could not confirm this directly).
- MEDIUM — 3 untracked paths still open the Project B §4 "clean baseline" gate:
  `.claude/launch.json`, `.claude/settings.local.json`, `.qwen/settings.json`,
  `docs/proposals/PROPOSAL_MODULE_HUB_INTEGRATION.md`. Low risk (tooling config + a proposal doc,
  not product schema) but the gate is not formally clean yet.
- LOW — Stripe webhook acks (200) before confirming `sync_subscription_state` succeeded; a DB
  write failure could leave billing state silently stale. Documented, deliberate trade-off to
  avoid Stripe retry storms — worth monitoring, not blocking.

---

## 2. headless-commerce — corrected verdict (source 1 was wrong on one point)

**Source 1 claimed** "malformed JSON → 400" passed. **This is incorrect** — verified directly by
Claude against `server/src/routes/payments.ts` and `server/src/middleware/error-handler.ts` on
disk:

- The webhook handler's `parseRawJson()` calls `JSON.parse(text)` directly with **no try/catch**.
- `error-handler.ts`'s only non-500 branch checks `error.status` — a property Express's
  `body-parser` attaches to *its own* SyntaxErrors (for the normal JSON-body endpoints), but a
  native `SyntaxError` thrown by a manual `JSON.parse()` call has no such property.
- Result: a malformed webhook body throws a plain `SyntaxError`, falls through every branch, and
  returns **500**, not 400.
- This is a different code path from the one earlier fixed in this same session (the general
  `express.json()`-parsed endpoints do correctly return 400/413 via the `error.status` branch) —
  the webhook route parses the body manually and was missed by that fix.

**Confirmed independently by both Hermes rounds and Claude's own read — CRITICAL:**
- **Stripe webhook signature is never verified.** `payments.ts` calls
  `provider.parsePaymentEvent(payload)` with no signature/header input at all. The payment
  adapter's config accepts `webhookSecret`, but nothing in the adapter or the route ever calls an
  HMAC/`timingSafeEqual`/`constructEvent`-equivalent check. **Anyone who can reach this endpoint
  can POST a forged `payment_intent.succeeded` event and the server will accept it as genuine.**
  This is a stronger statement than the "documented, acceptable limitation" framing used in this
  session's own `relay/HANDOFF_QA.md` and PR #1 description — those undersold the severity and
  should be corrected.

**Confirmed, lower severity:**
- Unknown Stripe event types still return 200 (silently acknowledged, not rejected/flagged)
- `GET /payments/refund` is shadowed by the earlier-registered `GET /payments/:id` route
- `.meta.json` sidecar files are served publicly via the `/media` static mount

**Confirmed fine (both sources agree):** local-storage path-traversal protection, CSV export
formula-injection escaping (`escapeFormulas: true`), oversized-import → 413.

---

## 3. multi-tenant-ai — corrected verdict (new findings, session's own QA missed both)

This session's own Qwen QA pass reported multi-tenant-ai's webhook as correctly HMAC-verified
(true, in isolation) but did not catch two defects in how the server actually wires it together.
Both were found by Hermes round 2 and independently reproduced by Claude reading `app.ts` directly.

- **HIGH — Middleware mount order breaks real signature verification.** `app.ts:17` mounts
  `app.use(express.json())` globally, *before* the webhook route's scoped `express.raw(...)` at
  lines 27–31. Express body parsers consume the request stream; by the time the route-scoped
  `express.raw()` middleware runs, `express.json()` has already consumed and parsed the body. A
  real Stripe webhook POST would very likely fail signature verification against this server today
  despite the verifier code itself being correct. The code comment at lines 25–26 shows the author
  clearly *intended* to isolate raw-body handling to this one route — the intent just didn't
  survive the earlier global `.use()`.
- **HIGH — Verified events are acknowledged and then discarded.** No `idempotencyStore` is passed
  to `createWebhookReceiver`, so replay protection is silently skipped. More importantly,
  `handleBillingEvent` (the function that actually updates subscription state) is **never called**
  anywhere in `server/src` — grep confirms it. Even a webhook that somehow verified correctly today
  would not move a subscription from trial to paid, or reflect a cancellation.
- MEDIUM — `/payment/demo-charge` generates a fresh `crypto.randomUUID()` idempotency key on every
  request, so retries are never deduplicated (defeats the purpose of the key).
- MEDIUM — `/ai/demo` is auth-gated but never checks `subscriptionCore.canUseFeature`/quota —
  entitlement is only enforced on the separate `/subscription/status` read endpoint, not on the
  endpoint that actually costs money to run.

**Overall:** this is a good reference implementation of each module in isolation, but the server's
own billing loop does not currently close — verified webhook events have nowhere to land. Selling
this as a hosted SaaS is not on the table; per
`docs/platform/SHARED_SAAS_RUNTIME_PROJECT_B_PLAN.md` §3 it was never meant to be one — it is
source/starter-kit material. These bugs matter for anyone who buys the kit and expects the included
billing wiring to work out of the box.

---

## 4. line_oa_ai — Pilot status confirmed correct, with one important new fact

Both Hermes rounds independently confirm: the module's *source* is clean (zero TODO/FIXME/stub
matches), 23 passing unit tests (not 20 as two stale docs claim), but **every** test — module-level
and server-level — mocks the LINE API. No log, screenshot, or report of a real LINE Messaging
API/OA sandbox end-to-end run exists anywhere in the module, product, or docs. The module's own
`MODULE.md`/`ROADMAP.md` say this themselves. `RedisSessionStore` is documented in two places but
`grep -rni "redis" src/` returns nothing — only `MemorySessionStore` exists.

**New fact, not visible to any of the code reviewers (owner-provided, 2026-08-19):** the owner has
been running this module's core AI-response path against a real KMO LINE Official Account for 1–3
days, with genuine production chat traffic, as an internal pilot (the owner works inside that
organization and has legitimate access to run this). This is corroborated by
`modules-hub` commit `75fd498 docs(audit-log): record production validation from KMO integration`.

This **does not** change the Pilot verdict for the *standalone SaaS product* — onboarding schema,
per-shop configuration, usage metering, and billing/checkout are still entirely unbuilt, exactly as
both reviewer rounds found. It **does** substantially de-risk the AI-response core itself: this is
stronger validation (real users, real conversations, multi-day) than any other module in this
portfolio has, most of which have only mocked unit tests.

---

## 5. Pricing — approved vs. proposed

| Product | Owner-approved pricing | `REVENUE-STRATEGY.md` (untracked draft) | Status |
|---|---|---|---|
| `booking` | `docs/business/PRICING_SPEC.md`, approved 2026-08-05: Trial (14d), Basic ฿490/mo, Pro ฿990/mo, top-up add-ons | Adds a "Business ฿2,490/mo" tier and a "Pro ฿1,290" figure that don't exist in the approved spec | 🔴 **Conflicts with approved pricing** — must be reconciled before use |
| `line_oa_ai` | None. `implementation_plan.md` has a pricing sketch explicitly marked as an unvalidated discovery draft | Starter ฿590 / Growth ฿1,490 / Scale ฿2,990 | 🟡 No approved baseline to conflict with; both are drafts |
| `multi_tenant_ai` | None (BRIEF.md pricing section is still a TODO) | $79 / $199 one-time proposal | 🟡 Proposal only, not approved |
| `headless_commerce` | None (BRIEF.md pricing section is still a TODO) | $29 / $79 per month proposal | 🟡 Proposal only, not approved |

`REVENUE-STRATEGY.md` at the repo root is an untracked working draft, not an approved pricing
document. Only booking has an owner-approved price; everything else needs one before it can be
called a real price rather than a proposal.

---

## 6. Consolidated blocker punch-list, ranked

1. 🔴 **headless-commerce: Stripe webhook has no signature verification.** Security/fraud blocker.
   Must fix before this server is ever reachable from the public internet.
2. 🔴 **booking: quota/staff/top-up not enforced anywhere.** Revenue-integrity blocker. Cannot
   sell Basic/Pro on these limits until a real gate exists.
3. 🟠 **multi-tenant-ai: webhook middleware ordering breaks real signature verification**, and
   **verified events are never applied to subscription state.** Two bugs, same area — fix together.
4. 🟠 **headless-commerce: malformed webhook JSON → unhandled 500** (not 400). Same file as #1,
   same fix session makes sense.
5. 🟡 **line_oa_ai: no real LINE OA sandbox end-to-end test for the product surface.** Lower risk
   than it looks given the live KMO evidence for the AI core, but the *product* (onboarding,
   per-shop config, billing) still needs its own real-world proof.
6. 🟡 **booking: Project B §4 clean-baseline gate not yet clean** (4 untracked files) — low risk,
   quick to close (review + commit or gitignore each path).
7. 🟢 **Pricing doc-drift** — fix `REVENUE-STRATEGY.md`'s booking numbers to match
   `PRICING_SPEC.md`; get owner-approved pricing for the other three products before selling them.

Items 1–4 are the direct blockers to "domain purchase = ready for real revenue." Item 5 gates
`line_oa_ai` specifically. Items 6–7 are cleanup, not launch blockers, but should close before a
public production cutover per the repo's own governance docs.
