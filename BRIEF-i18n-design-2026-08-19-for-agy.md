# Bilingual UI (Thai/English) — design survey, for AGY

**Scope:** Design + survey only. **Do not write implementation code, do not add any npm
dependency, do not touch any product's source files.** Deliverable is a written proposal
(markdown), reviewed by the owner/Claude before any product starts implementing.

## Context

Owner locked in a standing policy 2026-08-19 (see `docs/platform/I18N_POLICY.md` — read it first,
it has the confirmed current-state survey and candidate list, don't re-derive that part): every
`saas-product-hub` product with a user-facing UI must support Thai and English, switchable with a
single button, going forward. No product in the portfolio has any i18n mechanism today — this is
greenfield, not a retrofit of an existing pattern.

Three products have a real UI today and are the only current candidates:

- `products/booking/apps/booking-admin` — Next.js 16 / React 19
- `products/booking/apps/booking-consumer` — same stack
- `apps/hub-web` — same Next.js/React stack (storefront)
- `products/ticket-tracking-relay` — plain Express + vanilla JS, `public/index.html` +
  `public/app.js`, no framework — genuinely different stack from the other three

## What you're asked to produce

A single markdown proposal answering:

1. **Per-stack approach.** The 3 Next.js apps (booking-admin, booking-consumer, hub-web) can
   likely share one approach — propose it (e.g. `next-intl` vs. a hand-rolled context+JSON
   dictionary, with trade-offs: bundle size, App Router server-component compatibility, dev
   ergonomics). `ticket-tracking-relay`'s plain vanilla-JS frontend needs a separate, much lighter
   answer — don't force a React-oriented library onto it; propose something proportionate (a
   small JSON dictionary + a client-side toggle is probably enough, but make the call and justify
   it).
2. **The toggle itself.** Where does the button live, how is the choice persisted (cookie?
   localStorage? URL param?), what's the default (Thai, given the current products are
   Thai-first)?
3. **String inventory scope.** Does "user-facing" include: form validation error messages,
   toast/notification text, email or LINE-notification templates the customer receives, admin
   dashboard labels (staff are Thai-speaking today — still in scope, or admin-only and lower
   priority)? Propose a boundary and justify it — don't just assert one without reasoning.
4. **Rollout order + effort estimate.** Given the 3 Next.js apps can likely share infrastructure,
   propose a build-once-then-apply-3x sequence vs. building it into one app first as a pilot. Give
   a rough effort size per app (small/medium/large), not a time estimate.
5. **Pros/cons table for the top-level library choice** (matches this project's own convention —
   `products/booking/CLAUDE.md` requires every option to be presented with pros/cons, apply the
   same discipline here even though this is a different repo).

## Hard stops

- No code changes to any product.
- No `npm install` / dependency additions.
- No new files inside any product directory — write your proposal as a new file at the
  `saas-product-hub` repo root (`BRIEF-i18n-design-2026-08-19-agy-proposal.md` or similar), not
  inside `products/` or `apps/`.
- Don't commit or push anything — this repo's standing rule is that only Claude commits/pushes;
  hand the proposal back for review the same way prior Stage work did.

## Deliverable format

One markdown file, sections matching the 5 questions above. Cite anything you check in the repo
by file:line, same evidence discipline as the Stage 1-4 briefs in
`BRIEF-domain-readiness-fixes-2026-08-19-for-hermes.md` — don't assert without checking.
