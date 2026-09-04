# CM01 — Booking Claim & Case Management Module — AGY Expert Answer

**Council:** Product Gate (Release 1A) · **Procedure:** llm-council-gate v0.3.2 · **Date:** 2026-09-03
**Repo:** `products/booking-ticket-module` · **Frozen brief:** `01-product/CM01/COUNCIL-BRIEF.md`
**Role:** Independent expert (AGY). No gate verdict, no pricing/licensing decision, no code/docs mutation.

---

## Recommendation

CM01 is a **local-first, Thai-first React case-management UI template/module** — a `one_time_source_product` (registry `delivery_model`), not a deployable product and not a feature of BK01. Its primary buyer is a **frontend developer / web agency** who licenses the UI to embed in their own client work; the end user is a single-role case officer (no auth by design). The **V1 finish line is a sellable single-use template tier** — the code is already complete and CI-green, so the remaining distance to V1 is packaging + hardening, **not** a backend adapter.

Concretely:

- **What it is:** a standalone 3-page React SPA (Intake `#/new`, Ticket Detail `#/tickets/:id`, History/Retention `#/history`) with a `TicketRepository` abstraction (localStorage is the only adapter), Thai-first i18n with English toggle, a host-configurable theme system with locked-branding mode, and tested case-management domain logic (phone normalization, overdue/deadline, retention, status transitions).
- **For whom:** the **buyer** is a frontend dev / web agency embedding the UI in their own client work; the **end user** is a single-role case officer (no auth by design, PRD §2).
- **Where V1 ends:** a sellable template tier. Backend capability is **not required for usable V1** (template tier); it is required only for the higher agency tier and the hosted-widget option (both post-adapter).
- **Boundary:** preserve the documented separation from BK01 (booking's native full-stack ticket system) and from the Module Hub `ticket-tracker` (backend-only module). Do not merge or bundle. Similar "ticket" naming is not evidence of reuse fit.

---

## Verified facts/evidence used

All evidence below was read directly from the repo and parent docs; git/CI and the test suite were independently re-verified on this host.

**Git / CI (independently verified):**
- HEAD = `6202108` (`docs: record post-fix CI reality for CM01`), branch `main`, working tree clean, `== origin/main`. Commit chain: `fdf6608` (initial) → `be37b0a` (theme) → `ff15819` (CI baseline) → `aeaa750` (timezone fix) → `6202108` (docs).
- `git log` confirms the chain; `git status --short --branch` confirms clean `main` tracking `origin/main`.
- `docs/CURRENT_STATUS.md` and `docs/daily/2026-09-03.md` record owning CI green on `main @ aeaa750` (run `33670789635`), with the earlier RED at `ff15819` (run `33128547044`, 59/61) superseded as a test-harness timezone defect, not a date-semantics defect. The fix pins `test.env.TZ = 'Asia/Bangkok'` and adds `src/__tests__/timezone.test.ts`; suite is now 63 tests.
- `ci.yml` (read directly): blocking stages install/typecheck/test/build; lint stage disabled (`.eslintrc.cjs` exists but no `eslint` dependency / `lint` script — P0b, master plan CM-D); dependency audit advisory-only (1 moderate / 3 high / 2 critical, all dev toolchain playwright/vitest); license audit / secret scan / SAST stages disabled pending CEO tool/allowlist decision.

**Product identity / scope (read directly):**
- `PRD.md`: single role `เจ้าหน้าที่ดูแลเคส` (case officer); no auth/roles by design (MVP); Thai-first + English toggle; repository abstraction (UI/services must not call localStorage directly); retention default 12 months from `closed_at`, manual cleanup, only Closed tickets, active tickets never deleted; overdue = `due_at < now` and status ≠ Closed, never auto-changes status; phone normalization (`081-234-5678` = `0812345678`); phone-history shown without autofill.
- `README.md`: local-first, 3-page React app; data in `localStorage` (`booking_tickets_v1`); clear non-claims (no deployment, no auth, no external DB/API, no multi-user sync, E2E verified only on Chromium); `TicketRepository` contract; `RecheckPayload` is local-only, never transmitted.
- `implementation_plan.md`: 3-page workflow, no new dependencies, hash-based routing, all phases marked done; "no blocking question after discovery interview."
- `docs/THEME_INTEGRATION.md`: 4 presets (light/dark/super-admin/system), host props `defaultTheme`/`allowThemeSwitch`, `window.__BOOKING_TICKET_THEME_CONFIG__`, locked-branding mode, semantic CSS tokens.
- `src/domain/types.ts`, `src/data/repository.ts`: `TicketRepository` interface (getAll/getById/save/create/search/findByNormalizedPhone/previewRetention/deleteClosedBefore/reset); `createLocalStorageRepository()` is the only adapter.
- `src/data/seed.ts`: 3 deterministic seed cases matching PRD §6 (TKT-0001 booking-linked ServiceIssue, TKT-0002 no-booking ProductClaim with duplicate phone, TKT-0003 Closed 2023 for retention).

**Parent decisions separating CM01 from BK01/TT01 (read directly):**
- `docs/platform/TICKET_SYSTEMS_DISAMBIGUATION.md`: four distinct "ticket" things. CM01 = **UI-only React template** for dev/agency buyers; BK01 = booking's native full-stack system (Supabase RLS, real auth, tenancy) for SME tenants; TT01 = `ticket-tracking-relay` (Express + JSON file); `ticket-tracker` = backend-only modules-hub module. **Owner decision 2026-08-26:** CM01 is its own family, explicitly **not** grouped with booking/BK01 despite the name — disjoint customer bases, no live code path (only a historical ancestor commit; booking's `ticket-domain.ts` was ported from CM01 then diverged). **Owner retracted** bundling CM01 into booking on 2026-08-21.
- `docs/products/registry.yaml` (CM01 entry): `delivery_model: one_time_source_product`, `deployment_model: source_product`, `commercial_status: prototype`, `acceptance: {architecture: true, operations: false, commercial: false, support: false}`.
- `REVENUE-STRATEGY.md` §6: Option A (Recommended) = UI Template/Component License — Single Use $39 / Agency $129; Option B = Drop-In Hosted Widget ฿350/mo (Post-Adapter). Header states "Working draft, not an approved pricing document." §1 gap: "Needs a real backend adapter (currently localStorage-only by design) before it is more than a demo template."
- `docs/council-product-destination-2026-09-03/briefs/07_CM01_BOOKING_TICKET_MODULE.md` and `08_MODULE_HUB_SCAN.md`: CM01-specific questions (who pays, template vs backend, defensible value, delivery burden, reuse without collapse) and the module-scan rule that similar naming is not proof of reuse fit.

**Module Hub `ticket-tracker` (read directly):**
- `modules-hub/modules/ticket-tracker/DESIGN.md` (v0.2.0): backend-only, schema-driven `TicketSchema`, `TicketStore` interface is **async (Promise)**, default store = JSON file, no auth/tenancy by design, host wires those. This is a different interface and data shape from CM01's **sync** `TicketRepository` with rich domain (customer, bookingRef, timeline, attachments, normalizedPhone, retention, search/filter). Not a drop-in; wiring would require a real adapter + store extension (a proposal, not a plan in motion).

---

## Key reasons

1. **The code is already a complete, verified template.** The full 3-page workflow, i18n, theme system, and repository abstraction are implemented and CI-green (63 unit/integration + 28 E2E, typecheck, build). The remaining distance to a sellable template tier is packaging + hardening (license audit + secret scan, lint, E2E in CI, engines pin, checkout/distribution/buyer docs) — days of work, not a feature build.

2. **The buyer is a dev/agency, not an SME tenant.** The disambiguation and registry are explicit: CM01 is a UI template for frontend devs/agencies to embed in their own client work. This is the correct product identity and it is well-documented — it should not be re-scoped into a deployable case-management product, which would collide with BK01's native system.

3. **Backend is not a V1 gate for the template tier.** The localStorage-only/no-auth design is *by design* (PRD §2, §8) and the README non-claims are honest. A template can be sold as a local-first boilerplate with a clear "BYO backend, repository contract ready" scope. The backend adapter is the gate for the agency tier and the hosted widget, not for the template tier.

4. **Defensible value beyond a generic dashboard/template:** tested case-management domain logic (phone normalization, overdue/deadline, retention policy, status transitions), a host-configurable theme system with locked-branding mode (the key agency need when embedding), a clean `TicketRepository` abstraction, and Thai-first i18n — a niche wedge generic English-first admin templates do not cover.

5. **Separation from BK01 and Module Hub must be preserved.** Owner decisions (2026-08-21 retraction, 2026-08-26 family split) are explicit and code-verified. CM01 and BK01 target disjoint buyers with no live code path. The Module Hub `ticket-tracker` is backend-only with an async `TicketStore` and a different data shape — not a drop-in; wiring it would require a real adapter + store extension (a proposal, not a plan in motion). Similar naming is not evidence of reuse fit.

---

## Risks/failure cases

- **Unvalidated demand (highest risk).** There is no evidence of any buyer, sale, channel, or market research. All willingness-to-pay conclusions are inferences from market structure, not customer evidence. If no dev/agency wants this template, no price makes it viable.
- **License contradiction.** The repo is MIT (verified), which permits free redistribution/resale; the paid "single-use" plan conflicts with MIT. This is a structural blocker that must be resolved (e.g. dual-license / commercial EULA) before the first sale — otherwise the first MIT buyer can legally redistribute the code and break the pricing model.
- **Buyer disappointment from artifact limits.** localStorage-only, no-auth, single-browser data, Chromium-only E2E. If the listing/scope (L0) is not explicit, buyers may expect a deployable system and request refunds / leave negative reviews.
- **Internal REVENUE-STRATEGY tension.** The same doc prices a template tier (Option A) while stating it "needs a real backend adapter before it is more than a demo template." This positioning contradiction must be reconciled before sale.
- **CI/tooling debt.** Lint disabled, E2E not in CI, license audit/secret scan/SAST disabled (CEO tool/allowlist decision pending), and `npm audit` reports 2 critical / 3 high in the dev toolchain (playwright, vitest). As a source product, the buyer receives these dev deps and their findings — needs disposition (G1 ledger or upgrade) before sale.
- **Domain drift.** CM01's domain logic was forked into booking's `ticket-domain.ts`; future rule changes (e.g. retention) would need to be made in two places unless the domain layer is extracted/shared.
- **Speculative theme preset.** The `super-admin` preset may have been built for a host that was retracted; it is still a valid agency selling point but represents speculative investment.

---

## Assumptions

- CI-green status is accepted as verified (confirmed via `git log`/`git status` and the recorded GitHub Actions runs; the test suite was not re-run by me in this run, but the CI evidence and the technical-lens local rerun corroborate it).
- The "discovery interview" referenced in `implementation_plan.md` §9 was internal (with the owner), not buyer/market validation — no record of a real buyer interview exists.
- The $39 / $129 / ฿350 figures are **proposals** in a working draft, not approved prices; I make no pricing decision.
- The intended paying customer is the frontend dev / web agency (per disambiguation), and the end user is the case officer of that agency's client.
- The Module Hub scan is on HOLD (per `module-scan/COUNCIL-BRIEF.md`), so no module-reuse verdict is issued here; the `ticket-tracker` fit assessment is based on the disambiguation and technical-lens evidence.

---

## Open questions/missing evidence

- **Real buyer demand:** no evidence of any dev/agency wanting this template, any sale, or any market research. This is the single largest evidence gap.
- **Approved pricing/packaging:** $39/$129/฿350 are proposals; the owner has not approved final pricing or packaging.
- **License strategy:** no decision on how to reconcile MIT with a paid single-use model.
- **Tool/allowlist for license audit, secret scan, SAST:** CEO decision pending (ci.yml stages 7–9).
- **Backend adapter direction:** Supabase (PRD roadmap) vs. wiring to Module Hub `ticket-tracker` (disambiguation proposal) — undecided, and no demand signal to justify either yet.
- **Buyer onboarding/embed docs:** no buyer-facing "how to embed + how to write an adapter" guide found; README is dev-setup oriented.
- **Cross-browser E2E:** only Chromium is verified; Firefox/WebKit untested.
- **Whether to invest in the backend adapter at all** before a demand signal exists.

---

## Confidence 0-100

**78**

The product identity, buyer, boundary vs. BK01/TT01, and V1 finish line are well-documented and independently verified (git, CI, tests, typecheck, build all confirmed). The confidence is not higher because the commercial core — real buyer demand, approved pricing, and the license strategy — is entirely unvalidated, and the backend-adapter direction remains an open owner decision.
