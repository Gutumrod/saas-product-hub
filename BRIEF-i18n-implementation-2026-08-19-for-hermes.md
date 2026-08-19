# Bilingual UI (Thai/English) — full implementation, all 4 phases

**Status:** Design approved by owner + Claude (`BRIEF-i18n-design-2026-08-19-agy-proposal.md`,
`docs/platform/I18N_POLICY.md`). **Owner has delegated full execution — build all 4 phases below,
report back per phase with evidence, Claude reviews + commits + pushes at the end. No need to wait
for a re-confirm between phases**, but every hard stop and verification requirement below still
applies — this is delegation of *execution*, not a waiver of *verification*.

Work through phases in order (each is a separate product/repo, independent of the others except
that Phase 4 reuses Phase 1's `next-intl` setup as a template).

---

## Phase 1 — `booking-consumer` (pilot, do this first)

**Repo:** `products/booking` (`apps/booking-consumer`)

**Build:**
1. Add `next-intl`, cookie-based (no URL locale prefix), default locale `th`.
2. `messages/th.json` + `messages/en.json` covering: landing page (`src/app/page.tsx`), the full
   booking wizard (`src/app/book/[slug]/page.tsx` — hold → deposit → confirm flow), and **form
   validation error messages** (phone format, required fields, slip-upload errors) — these are
   explicitly P0 per the approved scope, not optional.
3. Toggle button: top-right on `/`, sticky/fixed pill on `/book/[slug]` per AGY's proposal §2.1.
4. Wire the cookie read into `src/app/layout.tsx` (currently hardcoded `lang="en"` at line 23 —
   fix that too, it should reflect the actual active locale).
5. Toasts/confirmation messages (e.g. "คัดลอกสำเร็จ") also localized — P0 per approved scope.

**Explicitly deferred (do not touch in this phase):** LINE Flex message templates
(`src/lib/line-flex-templates.ts`) — the proposal marks these P1, tiered, not part of the pilot.

**Verification required before reporting done:**
- `npx tsc --noEmit` clean.
- Production build succeeds (`npm run build` or equivalent for this app).
- Manual check (describe what you did, don't just claim it): load the app, verify Thai renders by
  default, click the toggle, verify the SAME page re-renders in English with no page reload/flash,
  verify at least one validation error message and one toast render in both languages.
- No secrets touched, no unrelated files changed.

---

## Phase 2 — `ticket-tracking-relay` (audit, should be fast — most of this already exists)

**Repo:** `products/ticket-tracking-relay`

**Build:**
1. Read the full `STRINGS` object in `public/app.js` end to end. Cross-reference against every
   user-facing string actually rendered in `public/index.html` and any dynamically-generated DOM
   text in `app.js` (ticket status badges, modal titles, error alerts).
2. Fill in any missing keys. Do not touch the existing pattern/architecture — it's already correct
   per the approved design, this phase is coverage-completion only.

**Verification:** since this repo has no test suite, verify by describing exactly which strings you
checked and which (if any) were missing/added — cite `public/app.js:<line>` for each addition, same
evidence discipline as the rest of this brief series.

---

## Phase 3 — `apps/hub-web`

**Repo:** `saas-product-hub` root (`apps/hub-web`)

**Build:**
1. Create `client/src/contexts/I18nContext.tsx` — a small provider + `useI18n()` hook, backed by
   JSON dictionaries (`client/src/locales/th.json`, `en.json`).
2. Wire the **existing** `lang` state/toggle (`App.tsx:14-25`, `HubNavbar.tsx:82-90`) into the new
   context instead of the current bespoke `useState`+localStorage pair — don't build a second,
   parallel mechanism.
3. Replace the inline ternaries in `HubHome.tsx:148-190` (and anywhere else doing
   `lang === 'th' ? ... : ...`) with dictionary lookups via `useI18n()`.
4. `productCatalog.ts` display strings (name/tagline/description shown on cards) also need a
   bilingual source — note in your report whether you extended the catalog data shape or handled
   this separately, and why.

**Verification required before reporting done:**
- `npx tsc --noEmit` clean (or this app's equivalent typecheck).
- Dev build runs; manually verify toggling still works exactly as it did before (don't regress the
  existing working toggle) and now actually changes the storefront card text, not just a `lang`
  variable nothing reads.

---

## Phase 4 — `booking-admin` (largest phase, do last)

**Repo:** `products/booking` (`apps/booking-admin`)

**Build:**
1. Replicate the `next-intl` setup from Phase 1 (same cookie approach — a shared preference between
   the two booking apps would be a nice-to-have, note in your report if you made the cookie name
   shared or separate and why).
2. Dictionaries for: auth pages (`login`, `register`), dashboard (`dashboard/page.tsx`), tickets
   (`dashboard/tickets/*`), settings — this is the P1 "shop-owner admin" scope from the approved
   design.
3. **Explicitly deferred, do not touch:** `platform-admin/page.tsx` (P2, internal-only per the
   approved scope — leave it as-is).
4. Fix the hardcoded `lang="en"` at `src/app/layout.tsx:23` same as Phase 1.
5. Localized date/time formatting (`th-TH` vs `en-US`) where dates are displayed to the shop owner.

**Verification:** same bar as Phase 1 — `tsc --noEmit` clean, build succeeds, manual toggle check
covering at least the dashboard and one settings/tickets page in both languages.

---

## Hard stops (apply to every phase)

- No changes to `products/booking/apps/*/next.config.*`, middleware, or auth logic beyond what's
  needed to read the locale cookie — don't refactor anything unrelated.
- No new dependency beyond `next-intl` in the two Next.js apps — `hub-web` and
  `ticket-tracking-relay` get zero new npm packages (per the approved design).
- Don't touch `platform-admin` (Phase 4) or LINE Flex templates (Phase 1) — explicitly deferred.
- Don't commit or push — per this project's standing rule, only Claude commits/pushes. Report each
  phase's diff + verification evidence; Claude reviews and commits.

## Reporting format (per phase)

Same as every prior stage this session: what changed (file:line), verification evidence (commands
run + actual output, not a summary claim), and explicit confirmation of what was deferred/untouched
per the hard stops. Write one evidence file per phase at the relevant repo's root
(`I18N_PHASE1_EVIDENCE.md` etc.) so Claude can review and commit per-repo, same pattern as the
Stage 1-4 domain-readiness work.
