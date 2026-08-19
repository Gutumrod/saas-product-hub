# Bilingual UI policy (Thai/English) — added 2026-08-19

**Status:** Owner-approved standing policy, not yet designed or implemented anywhere in the
portfolio.

## The rule

Every `saas-product-hub` product with a user-facing UI must support **Thai and English**,
switchable with a **single button** — for new products going forward, and retrofitted onto
existing ones where an app layer already exists. This applies to product UI text (labels,
buttons, messages, emails/notifications a customer sees) — not to internal code comments,
commit messages, or developer-facing docs.

## Why this exists

Surfaced while modules-hub PR #9 (ticket-tracker module) was having its mixed Thai/English text
cleaned up — the owner decided this should be a standing convention rather than a recurring
one-off cleanup across products.

## Current state (corrected 2026-08-19, after AGY's design survey — see below)

Initial `grep` for i18n libraries found none, but that undersold the real state — reading actual
source found two products already partway there:

| Product | Real stack | i18n state | Evidence |
|---|---|---|---|
| `booking` (`apps/booking-admin`, `apps/booking-consumer`) | Next.js 16 / React 19, App Router | Nothing — hardcoded Thai text, `lang="en"` hardcoded in both root layouts | `booking-admin/src/app/layout.tsx:23`, `booking-consumer/src/app/layout.tsx:23` |
| `apps/hub-web` | **Vite 7 + React 19 + wouter SPA — not Next.js** | Partial: working `lang` state + localStorage persistence + toggle function already in `App.tsx:14-25`, `<Globe/>` toggle button already in `HubNavbar.tsx:82-90`; not yet wired to actual page text (inline ternaries in `HubHome.tsx`) | verified directly |
| `ticket-tracking-relay` | Plain Express + vanilla JS, no framework | Largely done already — comprehensive `STRINGS` th/en dictionary + `data-i18n` DOM binding in `public/app.js:10-106`, toggle button in `public/index.html` | verified directly |

`headless-commerce`, `multi-tenant-ai`, `line-oa-ai` have no UI yet — not in scope until they grow
one. `line_oa_ai`'s eventual "language" surface is conversational (LINE bot replies), a different
problem from a UI toggle button.

## Approved design (2026-08-19, from AGY's proposal — `BRIEF-i18n-design-2026-08-19-agy-proposal.md`)

Per-stack, not one library everywhere:
- **Next.js apps (`booking-admin`, `booking-consumer`):** `next-intl`, cookie-based, no URL locale
  prefix. Chosen because plain React Context breaks on Server Components (this codebase uses RSC
  in layouts/actions) — `next-intl` has real `getTranslations()`/`useTranslations()` support for
  both.
- **`hub-web` (Vite SPA):** finish what's already there — wire the existing `lang` state/toggle to
  a proper `I18nProvider` + JSON dictionaries instead of inline ternaries. No new heavy dependency.
- **`ticket-tracking-relay`:** keep the existing zero-dependency `data-i18n`/`STRINGS` pattern as-is,
  just audit for full coverage.

Default locale: Thai. Persistence: cookie for the Next.js apps (SSR-readable), localStorage for
the other two. Scope: customer-facing UI + form validation + toasts are P0; shop-owner admin UI is
P1; internal super-admin console is deferred (P2); DB enums/log/code stay untouched.

Rollout order: `booking-consumer` first (pilot, proves the `next-intl` setup) → audit
`ticket-tracking-relay` (small, nearly done already) → finish `hub-web` (medium) →
`booking-admin` (large, most surface area).

## What's authorized right now

Design is approved. **Implementation of Phase 1 (`booking-consumer` pilot) requires a separate
explicit go-ahead** before any code/dependency change — same confirm-before-execute discipline as
the rest of this portfolio's work this session.
