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

## Status: all 4 phases shipped (2026-08-20)

- Phase 1 `booking-consumer` — `booking@0981581`
- Phase 2 `ticket-tracking-relay` — `ticket-tracking-relay@af01178`
- Phase 3 `hub-web` — `hub-web@ce3014d` + `hub-web@6f190d9`
- Phase 4 `booking-admin` — `booking@b171e42`

## Known follow-ups (deferred, not forgotten)

Found during Phase 4 review, deliberately left untranslated per the owner's call to stop rather
than keep expanding scope — noted here so they aren't lost:

- **`products/booking/apps/booking-admin/src/app/dashboard/tickets/page.tsx` — "Retention Cleanup"
  admin modal** (manual closed-ticket purge, lines ~546-698 as of `b171e42`): entire modal markup
  (title, description, cutoff-date picker, preview list, two-step delete confirmation) is still
  Thai-only. Internal ops tool, not customer-facing — low priority, but real P1/P2 gap against the
  bilingual policy. Fix pattern is already scoped: add `tickets.retentionModal*` keys mirroring the
  `retentionCheckFailed`/`retentionDone` keys that already exist in the same `tickets` namespace,
  reuse `STATUS_LABELS.Closed` (from `useTicketLabels()`) for the bolded "Closed" status name
  instead of a hardcoded gloss.
- **`products/booking/apps/booking-admin/src/app/dashboard/tickets/[id]/page.tsx:699,730`** —
  computes a "base" resolution message by stripping both possible language suffixes off a
  translated string (`t('resolutionSaved').replace(' สำเร็จแล้ว', '').replace(' successfully', '')`)
  instead of having a dedicated key for the unsuffixed phrase. Works correctly today in both
  languages, but breaks silently if the wording of `resolutionSaved` ever changes — fragile, not
  broken.

Neither blocks the bilingual-policy rule from being considered met for `booking-admin` — they're
tracked cleanup, not open requirements.
