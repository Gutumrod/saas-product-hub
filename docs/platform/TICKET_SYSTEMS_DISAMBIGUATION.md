# Ticket / Case-Management Systems — Disambiguation

**Created:** 2026-08-26
**Why this file exists:** Four unrelated things in this portfolio all involve
"tickets" and status lifecycles. They look interchangeable from the name alone.
They are not. This file pins down what each one actually is, verified against
code (not just docs), so this doesn't need to be re-investigated from scratch
next time.

---

## The four things

| # | Name | Kind | Location |
|---|---|---|---|
| 1 | `tracking` | **product** (registry: `key: "tracking"`, code `TT01`) | `products/ticket-tracking-relay` |
| 2 | `booking_ticket_module` | **product** (registry: `key: "booking_ticket_module"`, code `CM01`) | `products/booking-ticket-module` |
| 3 | `ticket-tracker` | **module** (not a registry product — internal shared code) | `modules-hub/modules/ticket-tracker` |
| 4 | *(no registry entry — it's a feature, not a product)* | booking's own native ticket/claim system | `products/booking/apps/booking-admin/src/lib/ticket-service.ts` + `ticket-domain.ts` |

**#4 does not get a `product_id`/`product_code`.** It is not a separate
sellable unit and never will be — it ships bundled inside `booking`'s own
subscription price. It is listed here only so the other three can be
correctly distinguished from it.

**#3 does not get a `product_id`/`product_code` either.** It's a modules-hub
library module (backend-only, no UI, no commercial listing of its own) —
same category as `auth`, `payment`, `webhook-receiver`, etc. It is reused
*inside* products, it is not itself a product.

Only **#1 and #2** are registry-level products that needed their own identity.

---

## What each one actually is (verified against code)

### #1 `tracking` (`products/ticket-tracking-relay`)
- Stack: Node/Express server + static HTML/vanilla JS frontend.
- **Backend is `ticket-tracker` (#3), ported to plain JS.** Confirmed in
  [`server.js:9-10`](../../products/ticket-tracking-relay/server.js):
  ```js
  const { createJsonFileStore } = require("./modules/ticket-tracker/json-file-store");
  const { createTicketRoutes } = require("./modules/ticket-tracker/routes");
  ```
  Every file under `products/ticket-tracking-relay/modules/ticket-tracker/`
  is headed `// Manual JS port of modules-hub/modules/ticket-tracker v0.1.0`
  (ported because this product is plain JS; modules-hub's canonical source is
  TypeScript). Also uses the `auth` module (handler login).
- Audience: any business wanting a **public-facing** "report an issue → track
  by ID" flow. Reporters have no login; handlers do.
- No multi-tenancy concept. No relation to `booking` at all — registry.yaml
  already noted this was checked before building it (no overlap).
- Commercial status: `prototype`. REVENUE-STRATEGY.md recommends
  deprioritizing it — no tests, JSON-file storage with no locking, "anyone
  can modify or delete any ticket" in its current state.

### #2 `booking_ticket_module` (`products/booking-ticket-module`)
- Stack: **React SPA only. No backend of any kind.** Ships with a
  `TicketRepository` interface; the only implementation is a `localStorage`
  adapter.
- Has a feature #1 and #3 don't: a **host-configurable theme system**
  (`window.__BOOKING_TICKET_THEME_CONFIG__`, `light`/`dark`/`super-admin`/
  `system`) so a third party can embed this UI in their own product and skin
  it to their brand without touching the module's code. See
  [`README.md`](../../products/booking-ticket-module/README.md#theme-configuration).
- Audience: **frontend devs / agencies** who want to license a case-management
  UI to embed in *their own* client work — not booking's own end customers.
- No auth **by design** (PRD §2: "MVP ไม่มี authentication, account switching
  หรือ role-based permission"), not a "not built yet" gap.
- Commercial plan already exists in `REVENUE-STRATEGY.md`: one-time template
  license ($39 single-use / $129 agency-unlimited), not a hosted SaaS.
- **Missing backend adapter is its one real gap.** If it's ever finished, the
  natural fit is wiring it to `ticket-tracker` (#3) — same "no auth, host
  decides" philosophy, already production-ready — rather than building a new
  Supabase adapter from scratch. This has not been done; it's a proposal, not
  a plan in motion.

### #3 `ticket-tracker` (`modules-hub/modules/ticket-tracker`)
- Backend-only library module: HTTP route handlers + schema-driven validation
  + a swappable `TicketStore` interface (ships with a JSON-file store; a host
  can substitute a DB-backed one). **No UI, no auth, no tenancy** — by design,
  the host wires all three. See
  [`DESIGN.md`](file:///Users/wachirayachankhonkan/AI-Workspace/projects/modules-hub/modules/ticket-tracker/DESIGN.md).
- Not sold on its own. It's shared infrastructure copied into whichever
  product needs a ticket-lifecycle backend — currently just `tracking` (#1).

### #4 booking's native ticket/claim system (inside `products/booking`)
- Full stack: React UI + real Supabase RPC/RLS backend
  (`supabase/migrations/20260818000000_local_service_tickets.sql`,
  schema `local_service`), real shop-role auth, real multi-tenant isolation,
  real foreign-key linkage to actual booking records.
- **Its domain logic (`types`/`transitions`/`deadline`/`phone`) was ported
  from #2.** Confirmed in
  [`ticket-domain.ts:3`](../../products/booking/apps/booking-admin/src/lib/ticket-domain.ts#L3):
  `"Ported from products/booking-ticket-module/src/domain/{types, transitions, deadline, phone}.ts"`.
  So #4 and #2 share a common ancestor, then diverged completely.
- **2026-08-21 owner decision (same-day retraction):** bundling #2 into
  `booking` as an after-sales add-on was proposed, then retracted the same
  day once it was discovered #4 already existed and was more capable for
  booking's own use case (real backend/auth/tenancy vs. #2's local-first,
  no-auth-by-design template). See `docs/platform/ROADMAP.md` line ~167.
  **#2 is not, and is not planned to become, a feature of `booking`.**
- Never sold separately. Not a registry product. No `product_code`.

---

## The actual differentiator (once you stop reading the names)

Ignore "ticket" in every name — it's coincidental. Separate by:

1. **Which layer of the stack is it?**
   UI-only (#2) · backend-only (#3) · full-stack (#1, #4)
2. **Who is the paying customer?**
   `booking`'s own tenants (#4, never sold separately) · a business wanting
   a public issue-tracker deployed for itself (#1) · a dev/agency buying a
   UI template to embed elsewhere (#2) · nobody — internal shared code (#3)

No two of the four compete for the same customer. #2 and #3 are
complementary halves of a product that doesn't exist yet (UI + backend). #1
and #4 look similar in shape (full-stack ticket app) but serve completely
different buyers and were independently verified to have no code overlap.

---

## Registry disposition (owner-approved 2026-08-26)

- `tracking` → `product_code: TT01`, own family (no relation to booking).
- `booking_ticket_module` → `product_code: CM01` ("Case Management"), own
  family — explicitly **not** grouped with `booking`/`BK01` despite the
  name, because #2 and #4 target disjoint customer bases and share no live
  code path (only a historical ancestor commit).
- `ticket-tracker` module and #4 (booking's native system) — no
  `product_id`/`product_code`, not registry products.
