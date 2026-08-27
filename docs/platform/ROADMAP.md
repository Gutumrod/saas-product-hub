# Portfolio Development Roadmap — Source of Truth (2026-08-18)

> **2026-08-27 authority update:** The CEO-approved seven-product production execution plan is
> `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md`. It governs engineering sequence, production
> gates, checkpoints, and the final scope of BK01, PS01, LK01, DC01, MT01, CM01, and HC01. This file
> remains historical evidence and detailed prior context. Financial planning is outside the new
> master plan and remains owner-controlled.
>
> **2026-08-27 revision 3 (Commander Final Review Gate):** the master plan now excludes usage and
> demand as planning inputs (its §0), splits P0 into P0a/P0b, makes the single-heavy-track focus
> gate binding, and adds the L0–L5 ladder for the one-time products. Two items in this roadmap are
> P0a reconciliation work: §A1's BK01 "Done" wording predates the finding that BK01 has no
> application test layer, and §A1 still carries CM01's superseded 2026-08-21 removal against the
> 2026-08-27 seven-product lock. §A2's HC01 reference server and its passing tests exist on the
> open PR, not on the default branch.

**Status:** Historical portfolio roadmap; superseded for the locked seven-product engineering
sequence and production gates by `PORTFOLIO_PRODUCTION_MASTER_PLAN.md`. It remains detailed prior
context and is not a commercial-readiness decision:
`commercial_status` and `acceptance.commercial` remain owner-only.

**Authority boundary:** This document records verified current state and the
development order. `docs/products/registry.yaml` remains the product catalog and
declared target configuration, but a target runtime there is not evidence that an
app is built, admitted, or deployed. When the two disagree about current reality,
this roadmap and its cited evidence win until the registry is reconciled.

**Evidence baseline:** `D:\AI-Workspace\runtime\hermes-native\workspace\audit-2026-08-18\FULL-PORTFOLIO-AUDIT-2026-08-18.md`, its Hermes/AGY source reports, and repository state checked on 2026-08-18. Any implementation must re-check live services, credentials, remote migration history, and test environments before a production claim.

**2026-08-19 addition:** `docs/platform/DEEP-VERIFICATION-2026-08-18-CONSOLIDATED.md` — a
code-level (not documentation-level) verification of `booking`, `headless_commerce`,
`multi_tenant_ai`, and `line_oa_ai`, run independently twice (an outside reviewer + Hermes in two
self-checking rounds) and cross-checked directly against source by Claude where the two disagreed.
Triggered by an owner decision to buy a production domain only once a product is genuinely ready
for real revenue, not just reference-complete. See §0 and the A1/A2 corrections below for what it
changed.

---

## 0. Mandatory gates

These gates apply only to the stated scope. They do not block unrelated local
development, standalone products, or module hardening.

1. **Rotate exposed Supabase service-role/API credentials for the two affected projects** — owner-only action in Supabase Dashboard. `gyleqrjdzwwlqierdwcy` and `coyelzlgukvpgguqpjdi` are project references, not secret values; never place credentials in this roadmap, git, or chat.
   **2026-08-20 — API-key half closed.** Both projects migrated off the legacy JWT-based `anon`/`service_role` keys to the new `sb_publishable_.../sb_secret_...` format (wired into `products/booking`'s 3 env files and `apps/hub-web/.env`), then the legacy keys were disabled at the platform level via the Management API (`PUT /v1/projects/{ref}/api-keys/legacy?enabled=false`) — verified dead on both projects (`401 Legacy API keys are disabled`) and the new keys verified live (`200`). The BOOKING2-scoped Management API PAT (separate credential, account-level) was also rotated and the old one confirmed dead.
   **DB password half — CLOSED 2026-08-25.** `coyelzlgukvpgguqpjdi`'s Postgres password (the `DATABASE_URL` used by `apps/hub-web`) is the other half of what leaked in the original `key.txt` incident. The 2026-08-20 reset attempt failed silently (new value matched the old one byte-for-byte); a second attempt on 2026-08-25 succeeded — verified with a live `SELECT 1` connection test, not just a dashboard success toast — and the new value is pushed to the Cloudflare Worker "hub-web" secret `DATABASE_URL` (part of the Cloudflare migration cutover). Central vault (`D:\AI-Workspace\.secrets\keys.txt`) updated to match. This credential no longer blocks public production deployment on that basis.
2. **Complete `docs/platform/SHARED_SAAS_RUNTIME_PROJECT_B_PLAN.md` Phase 0** — hard gate *before Project B accepts a second product schema*. It requires booking migration-history reconciliation, E3.3 live RLS/security verification, disposition of booking's outstanding work, and a reviewed baseline commit.
   **CLOSED 2026-08-20.** All 5 exit-evidence items verified live against the deployed
   project (not self-reported) — see `products/booking/docs/platform/PHASE_0_BASELINE_SNAPSHOT_2026-08-20.md`.
   Migration history: 28/28 local matches remote (2 pending migrations pushed this session,
   owner-confirmed). E3.3 RLS fix live-tested with 3 real anon REST calls, all passed. No
   uncommitted platform-admin work outstanding. Project B is now clear to admit its second
   product schema per the admission order recorded below (`line_oa_ai` → `headless_commerce`
   → `pawspace`), subject to each product's own admission review under §3 of the shared-runtime plan.
3. **Domain-purchase gate (added 2026-08-19, all 4 code blockers closed 2026-08-19 — see below).**
   The owner will buy a production domain only once a product is genuinely revenue-ready, not just
   reference-complete. Deep code verification (see `DEEP-VERIFICATION-2026-08-18-CONSOLIDATED.md`)
   found four concrete blockers, ranked. **Status as of 2026-08-19 evening — code-level fix for all
   4 is committed locally (not pushed) and independently re-verified by Claude (re-ran `tsc`/tests
   myself, did not just trust agent reports):**
   1. ~~`headless_commerce`: Stripe webhook never verifies signature — forgeable payment events.~~
      **Closed** — real `StripeWebhookVerifier` wired into `createPaymentWebhookHandler`
      (`headless-commerce@79c1d7c`). 14/14 tests pass.
   2. ~~`booking`: quota/staff/top-up limits are sold in `PRICING_SPEC.md` but enforced nowhere in
      code.~~ **Closed** — `20260819000000_quota_staff_topup_enforcement.sql` migration
      (`booking@ed06fa2`), plus an advisory-lock fix for a TOCTOU race in the staff-limit RPCs found
      during review. QA suite PASS=6/FAIL=0 against a local dev DB (`booking_qa2`) — not yet
      verified in production.
   3. ~~`multi_tenant_ai`: webhook middleware mount order breaks real signature verification, and a
      verified event is never applied to subscription state (`handleBillingEvent` unwired).~~
      **Closed** — route remounted before `express.json()`, `handleBillingEvent` now wired
      (`multi-tenant-ai@92139cf`). Also fixed a follow-on bug found during review: replayed events
      were answered with 401 (would make Stripe retry forever and risk auto-disabling the endpoint)
      instead of the 2xx Stripe expects for duplicates — now returns 200 without re-applying. 13/13
      tests pass.
   4. ~~`headless_commerce`: malformed webhook JSON throws an unhandled 500 (separate bug from #1,
      same file).~~ **Closed** — resolved as a side effect of #1's fix (the verifier's own
      `JSON.parse` is wrapped in try/catch and never throws), no separate change needed.

   **Not part of this code gate, still open before an actual public launch:** credential rotation
   (mandatory gate 1 above — owner decided to defer to near-launch, not before), Stripe webhook
   *production* endpoint registration (needs a live URL first), and pricing approval for
   `line_oa_ai`/`multi_tenant_ai`/`headless_commerce` (see Owner decisions below). None of these are
   code work.

### Project B routing truth

| Product | Verified current state | Routing decision for development |
|---|---|---|
| `booking` | Existing Project B baseline; canonical host is `bk01.wstera.com` (product-code host, decided 2026-08-26 with the `product_id`/`product_code` adoption and `PORTFOLIO_PRODUCTION_MASTER_PLAN.md` §10 D1 — the root `wstera.com` is the SaaS Product Hub's own domain, see `apps/hub-web`; a branded alias may be added later pointing at the same product) — Cloudflare Workers deploy scaffolded (`@opennextjs/cloudflare`, Worker names `wstera-consumer`/`wstera-admin` — brand naming, not a claim on the root domain) but not yet deployed or attached to the host | Phase 0 governs its baseline/security work; public launch also needs Stripe, a live deploy on `bk01.wstera.com`, and live migration evidence. |
| `line_oa_ai` | Express app exists; no Project B admission evidence | Cleared to start (Phase 0 closed 2026-08-20). **Order changed 2026-08-21 — now 2nd** (see below). Still needs its own Phase 3 admission review (schema, RLS, webhook idempotency, quota) before code lands. |
| `headless_commerce` | Four copied modules; no app/schema/deploy config | Conditional Project B candidate. Build only after its storage, catalog-growth, payment, and admission review. |
| `feature_flag` | Two copied modules; no app/schema/service | Conditional Project B candidate. Require quota and developer-access review before admission. |
| ~~`short_url_analytics`~~ → `wstera_link` (`LK01`) | **Retired 2026-08-26** (owner decision, merged into `wstera_link` — see `docs/products/registry.yaml`). Cloudflare-first multi-tenant TypeScript rebuild; docs-only intake, zero application code as of 2026-08-26. | Standalone/dedicated-runtime by its own locked architecture doc; not a Project B candidate. |
| `content_autopilot` | Four copied modules; no app | Registry says dedicated runtime, while the shared-runtime plan calls it a possible second candidate. Routing is unresolved; do not treat either as approved until the owner decides. |

**Owner decision 2026-08-20 — Project B admission order locked (booking already in), superseded 2026-08-21 (see below):**

1. ~~`line_oa_ai`~~ — matches `SHARED_SAAS_RUNTIME_PROJECT_B_PLAN.md` Phase 3's own pre-selected first candidate; closest to revenue (real KMO pilot traffic).
2. `headless_commerce` — code-ready (webhook fix on `feat/reference-server`, not yet merged to `master` — needs that merge plus the admission policy's storage/payment estimate).
3. ~~`pawspace`~~ — not in the shared-runtime plan's original 10-product scope (registered after that plan was written); added deliberately because its PRD/architecture is unusually rigorous (concurrency, idempotency, RLS boundaries already fully specified). **This "zero business-logic code" framing is now stale — corrected 2026-08-22 below.** Needs its own fresh admission review before Phase 3+ treatment, same policy as any other product.

**Owner decision 2026-08-21 — `pawspace` moved ahead of `line_oa_ai`. New order: `pawspace` → `line_oa_ai` → `headless_commerce`.** At decision time no code work had landed on either product's Project B admission — a pure reordering, no rework caused. **Reality changed fast after this decision:** by 2026-08-22, `pawspace` has Phase 1–10 implemented, independently reviewed, and committed to its own `master` (schema/RLS/RPC hardening, auth+tenant, booking backend, LINE LIFF identity claim, Daily Report LINE delivery, Google Sheets sync, public visitor camera access, Owner/Manager dashboard + Starter/Pro/Enterprise/Founding-Member entitlement representation, live staff Operations UI, and a real Playwright browser/HTTP E2E harness — 8/8 passing). A visual design pass and a Phase 11 customer self-service booking flow (LINE LIFF, request-first: customer submits, staff confirms/declines) are implemented and reviewer-gate-passed but not yet committed. No payment/billing collection exists anywhere by design. No real pilot shop has run the operational loop yet. See `products/PawSpace/registry.yaml`'s pawspace entry for the full, current correction. This makes the "pawspace admission review" referenced above much closer to actionable than it was at decision time — the admission review can now evaluate real shipped code, not just a spec.

Reason, recorded 2026-08-21: `pawspace` "ดูมีแววกว่า" (owner's read: stronger upside) — consistent with the
2026-08-20 finding above that its PRD/architecture is the most rigorous spec in the portfolio, even
pre-code. `line_oa_ai` dropped a slot because the owner is "ยังไม่มีความมั่นใจ" (not confident yet) in
its real-world answer quality — KMO's live LINE OA answers customers inconsistently ("ตอบได้บ้าง ไม่ได้บ้าง").
Investigated 2026-08-20/21 by reading the live `line-webhook`/`ai-providers.ts` source directly (not
guessing): 4 concrete, evidence-ranked hypotheses (primary model `gemma4:31b-cloud` may not reliably
follow the dense multi-part system prompt; sparse `shop_faqs`/`products` data triggers the deliberate
anti-hallucination refusal; `line_ai_rollout`/`customers.paused_until` can silence replies entirely
for some customers; no timeout on the AI provider calls) — handed off as
`CODEX_TASK_line_ai_reliability_review.md` in the KMO repo (`kmorackbarcustom/kmorackbarcustom.github.io@136e3c6`)
for the KMO repo owner to verify against real data before any fix lands. Project B admission for
`line_oa_ai` waits on that review closing the confidence gap, not just on the Phase 3 schema work.

**Owner decision 2026-08-21 — goes further than the confidence-gap fix above: `line_oa_ai` is removed
from the near-term "sell first" shortlist entirely, not just deprioritized.** Owner's own read: the
KMO live bot can't decide much on its own and doesn't cover the range of real inbound customer
messages — tolerable so far only because KMO is the owner's own shop and he personally catches what
it misses, which is not evidence it can serve a third-party customer unsupervised.
The replacement, `products/LINE OA AI Sales & Service Engine/`, is now a separate nested repo at
`Gutumrod/line-oa-ai-sales-service-engine` (created 2026-08-24). Ground-truth verification on
2026-08-24 confirms Phase 1 code exists and its automated gate passes: **25/25 tests + typecheck +
build PASS**. Its real LINE OA sandbox round-trip is still NOT RUN/pending external LINE setup, and
its own contracts explicitly block Phase 2 (Transaction Engine: ORDER + BOOKING) until that evidence
passes. The PRD remains "Draft for Owner Review — NOT approved for pilot"; no Pilot/Commercial SaaS
claim is authorized. The portfolio therefore has a real replacement codebase, but still no sellable
LINE OA AI product until the evidence gates close.

Strategy stated by owner: use these 4 (booking + 3 above) to reach revenue, then upgrade the org to Supabase Pro to remove the 2-free-project ceiling and admit the remaining portfolio. Explicitly deferred for now: `feature_flag`, `content_autopilot`, `multi_tenant_ai` (not a hosted tenant by plan design), `stripe_billing`, `ai_resilience_gateway`, `it_ops_watchdog` (all Project-B-eligible but not in this first wave); `bulk_etl_sync`/`compliance_audit` remain dedicated-project by design regardless. `booking_ticket_module`, `tracking`, `wstera_link` (retired `short_url_analytics`/`SU01`, replaced 2026-08-26 by `LK01` — see `docs/products/registry.yaml`) are standalone/self-hosted by design and don't consume Project B's schema slots or the 2-project Supabase quota at all — they can launch on their own timeline independent of this sequencing.

**Hard dependency:** §0 gate 2 (Phase 0) blocked admission until it closed — **closed 2026-08-20** (see above). `pawspace` admission (Phase 3 of the shared-runtime plan) can now start first.

---

## Active scope — locked 2026-08-27 (supersedes 2026-08-23 lock below)

Owner expanded and re-split the active scope in this session, after a full differentiation pass
(`differentiation-proposals/SYNTHESIS-2026-08-27.md` — 4 submitted proposals cross-checked, 3
competitive claims independently web-verified) and a market-speed-to-first-sale ranking of the
whole 18-product registry. Locked to **7 products**, split by commercial model so each track can be
built as one coherent motion instead of mixing SaaS-subscription and one-time-license work:

**Subscribe (hosted, recurring billing) — 4:**
1. **`booking`** (`BK01`) — unchanged from the 2026-08-23 lock; already Done per A1 below, work
   continues on remaining production-launch items (Stripe webhook production endpoint, domain,
   deferred DB-password rotation).
2. **`pawspace`** (`PS01`) — unchanged from the 2026-08-23 lock; Phase 1–10 shipped, work continues
   toward a real pilot shop running the operational loop end to end. No billing collection exists
   yet by design (see its registry entry) — will need `stripe_billing`'s modules, same as the rest
   of this Subscribe group (see the `stripe_billing` update below).
3. **`wstera_link`** (`LK01`) — added this session. Docs-only (LOCKED pre-build spec, zero app
   code), but its own PRD already has a locked billing spec (Free/Pro ฿199/Business ฿590,
   full lifecycle) and its market wedge (channel-aware link routing) was independently arrived at
   by all 4 differentiation submissions and survived competitive fact-checking. Weakest execution
   state of the four — flagged, not hidden.
4. **`doccraft`** (`DC01`) — added this session, moved here (not to the license-sale track) after
   re-reading `products/DocCraft/docs/BUSINESS_MODEL.md`, which is explicit: "แนวทางหลัง MVP: Free:
   core local-first document creation / Pro: cloud sync, reusable customers/catalog, cross-device
   access" with hypothesis pricing at ฿290/month (lifetime is a secondary option, not the primary
   model). Cloud sync/auth/billing are still explicitly post-MVP/not built — this is a Free/Pro
   *subscription* target, not a one-time license, despite V1 itself being local-first/no-login.

**Sell outright (one-time license) — 3:**
1. **`multi_tenant_ai`** (`MT01`) — REVENUE-STRATEGY.md's own fastest path to first revenue (Path
   1, 1–2 days); reference server + tests already done, remaining gap is purely commercial
   packaging (checkout, distribution).
2. **`booking_ticket_module`** (`CM01`) — closest-to-done template in the portfolio (61/61 tests,
   E2E configured); own family, not `BK02` (see `docs/platform/TICKET_SYSTEMS_DISAMBIGUATION.md` —
   targets dev/agency buyers embedding the UI, a disjoint customer base from `booking`'s own
   tenants).
3. **`headless_commerce`** (`HC01`) — four modules + reference server + 14/14 tests already exist;
   REVENUE-STRATEGY.md already prices a one-time self-host source-license option ($99) alongside
   its SaaS-tier option.

**Independent review retained for comparison (added 2026-08-27):**
`docs/platform/PRODUCTION_LAUNCH_PLAN_2026-08-27.md` is supplemental only. The CEO-approved execution
authority is `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md`; refreshed executable evidence is
`docs/platform/PORTFOLIO_REAUDIT_2026-08-27.md`. Financial/price/revenue/effort content in the
supplemental draft is non-authoritative. Its useful code observations must be revalidated against the
new audit: `booking` has no application tests and currently fails clean lint/build gates, PawSpace's
phase tests lack a checked-in runner, and HC01 PR #1 reproducibly passes only 13/14 tests on the audit
host rather than the previously reported 14/14.

Everything else in the portfolio (`feature_flag`, `content_autopilot`, `omnidesk`, `tracking`,
`rentmatrix`, `compliance_audit`, `ai_resilience_gateway`, `it_ops_watchdog`, `bulk_etl_sync`,
`line_oa_ai`) is paused — no further doc work or dev work — until the owner revisits this lock.
`line_oa_ai` was explicitly considered for the Subscribe track and dropped: real demand and a warm
channel (KMO pilot) exist, but the owner's own 2026-08-21 decision (above) already pulled it from
the near-term sell-first shortlist over AI-answer-quality confidence, and that has not changed.

### 2026-08-23 lock (superseded above, kept for history)

Owner locked the current hands-on-keyboard working set to three products, decided in a Mac
session after independently verifying each candidate against source (not doc-trust — same
discipline as the rest of this roadmap):

1. **`booking`** — already Done per A1 below; work continues on its remaining production-launch
   items (Stripe webhook production endpoint, domain, deferred DB-password rotation).
2. **`pawspace`** — already Phase 1–10 shipped per its registry entry; work continues toward a
   real pilot shop running the operational loop end to end.
3. **`doccraft`** — newly added to active scope this session. Ground-truth code scan (Claude Mac,
   2026-08-23) found Phase 1 (domain calculation) and Phase 2 (editor + modular blocks)
   implemented with real logic (not stubs) in `src/domain/` and `src/ui/editor/`, independently
   reviewer-verified as **Gate 2 PASS** (`docs/PHASE2_IMPLEMENTATION_EVIDENCE.md`: 57/57 unit
   tests, typecheck, lint, prod build, Playwright E2E 9/9, no later-phase scope drift detected).
   Selected over two other pre-implementation candidates reviewed the same session:
   - `rentmatrix` — only Phase 0 (scaffold) exists: a reviewed DB schema (16 tables/16 RLS/19
     policies) plus empty `.gitkeep` placeholders in `lib/auth`, `lib/billing`, `lib/domain`. Its
     own Phase 0 evidence doc states plainly "No auth UI, tenant workflow, asset/contract feature,
     business RPC, offline workflow or billing feature was added." Not runnable yet — stays
     deprioritized until Phase 1 lands.
   - `omnidesk` — zero code confirmed on disk (no `package.json`, no `app/`, no `src/`); docs-only,
     matching its own PRD's self-reported evidence state. Stays deprioritized until implementation
     starts.

   `doccraft` is additive, not a Project B admission — it needs no backend/auth/multi-tenant/billing
   for V1 by product design (browser-only, no-login), so it does not compete with or depend on the
   `pawspace` → `line_oa_ai` → `headless_commerce` Project B admission order above.

---

## Track A — Products (sell the finished app, not just the module pile)

Ordered by verified delivery distance, not by `commercial_status`: finish runnable
apps first, then assemble module-only products. The order inside a wave is an
engineering default; customer demand or an owner decision may override it.

### A1. Finish the 5 that already have a real app layer

| Product | Gap to close | Effort |
|---|---|---|
| `booking_ticket_module` | Closest to done — 61/61 tests, E2E configured (re-verified 2026-08-21: `npm test` really runs 12 files/61 tests, 5 real Playwright E2E specs). Needs a real backend adapter (currently localStorage-only by design) before it is more than a demo template. **Owner decision 2026-08-21, superseded same day:** first proposed bundling this into `booking` as an after-sales case-management add-on — retracted after discovering `booking` already has its own native, more capable ticket system (`apps/booking-admin/src/lib/ticket-service.ts` + `ticket-domain.ts`, real Supabase/RLS-backed, migration `20260818000000_local_service_tickets.sql`), making the bundle redundant. **Current status: no clear sell path** — dropped from the near-term "sell first" shortlist entirely (final shortlist: `booking`, `pawspace`). Standalone template-market sale remains theoretically possible but weak (no distribution channel); revisit only if a concrete buyer/channel appears. | Small–medium |
| `line_oa_ai` | Needs a real LINE OA sandbox test for the *product* surface (onboarding, per-shop config, billing) before claiming end-to-end proof — still true after 2026-08-19 deep verification. **New evidence:** the module's core AI-response path has 1–3 days of real production traffic via a live KMO LINE OA (owner-run internal pilot); this de-risks the AI core specifically but does not close the product-packaging gap. `RedisSessionStore` is documented but not implemented (only `MemorySessionStore` exists). Project B admission is a separate Phase 0 + owner-confirmation gate. | Small |
| ~~`short_url_analytics`~~ | **Retired 2026-08-26** (owner decision) — the Python/FastAPI/SQLite prototype (6/6 tests passing per the 2026-08-22 correction below, once "Done") is kept only as behavior reference inside `wstera_link`'s own repo (`references/prototype-v2/`), not run or deployed. Superseded by **`wstera_link`** (`LK01`) — a from-scratch Cloudflare-first, multi-tenant TypeScript rebuild with real Supabase Auth/RLS and a locked billing spec (Free/Pro ฿199/Business ฿590), currently docs-only (LOCKED pre-build spec, zero app code). See `docs/products/registry.yaml`. ~~2026-08-22 note: the `pydantic_core`-missing blocker does not reproduce — `pytest -q` runs clean, 6/6 passed.~~ | ~~Done~~ → docs-only intake |
| `tracking` | **Corrected 2026-08-20** (live code check, not doc-trust): real auth now exists (salted password hash, `HttpOnly` session cookie) — the "no auth" claim above was stale. Still no real DB (`fs.readFileSync`/`writeFileSync` on `tickets.json`/`users.json`) and in-memory sessions (`Map`) — single always-on Node process only, cannot deploy to Vercel serverless as-is. No tests. | Medium |
| `booking` | Most mature (28 migrations, real Stripe/auth/tenant code, DB-level hold/collision protection, real LINE HMAC). **2026-08-19 deep verification found quota/staff/top-up limits from `PRICING_SPEC.md` enforced nowhere in code — fixed same day** (`booking@ed06fa2`, migration `20260819000000_quota_staff_topup_enforcement.sql`, QA PASS=6/FAIL=0 in dev DB). Phase 0 baseline (§0 gate 2) **closed 2026-08-20** — see `SHARED_SAAS_RUNTIME_PROJECT_B_PLAN.md` §5 and `products/booking/docs/platform/PHASE_0_BASELINE_SNAPSHOT_2026-08-20.md`. | Done |

### A2. Build application layers for wave_2 products (currently modules-only)

Wave 2 remains ahead of Wave 3 under the existing release-wave decision. The order
below is by existing scaffolding, not proof of market demand or commercial readiness:

1. **`multi_tenant_ai`** — Reference server at `products/multi-tenant-ai/server/` wiring all 6
   modules together (Express, no build step, mirrors `line-oa-ai/server`'s shape — this is
   example/reference code for the starter-kit buyer, not a hosted app, so it's not equivalent to an
   A1 product). **2026-08-19: the webhook bug found by deep verification is fixed**
   (`multi-tenant-ai@92139cf`) — route order corrected, `handleBillingEvent` wired, and a follow-on
   replay-status bug (401 instead of 2xx for duplicate events) found and fixed during review.
   13/13 tests pass. Fine to represent as a working billing example now, with the caveat that this
   remains reference/source material, not a hosted app.
2. **`headless_commerce`** — four modules (`product-catalog`, `file-storage`, `import-export`,
   `payment`); reference server built 2026-08-18
   (PR [`headless-commerce#1`](https://github.com/Gutumrod/headless-commerce/pull/1)).
   **2026-08-19: both bugs found by deep verification are fixed** (`headless-commerce@79c1d7c`) —
   Stripe webhook signature is now verified (copied the same proven `webhook-receiver` module used
   by `multi-tenant-ai`) and malformed-JSON handling is closed as a side effect. 14/14 tests pass.
   PR #1's description still needs updating to drop the old "acceptable documented limitation"
   framing before merge. Its possible Project B admission is still conditional and cannot start
   before Phase 0 and its product admission review, independent of these bugs.
3. ~~`stripe_billing` — scope depends on whether it is a sellable product or shared internal infrastructure. Do not create its application plan until the owner chooses.~~ **Resolved 2026-08-27, plan locked same day** — shared internal infrastructure, built as one centralized service (`services/billing-core/`, not per-product copies) for the Active scope Subscribe group. Full locked plan: `docs/platform/BILLING_CORE_PLAN.md`. No standalone application/reference-server layer for `stripe_billing` itself planned.
4. **`feature_flag`** — two modules and no app. Its possible Project B admission is conditional and needs Phase 0 plus a quota/access review.

### A3. Wave 3 (backlog tier)

`content_autopilot`, `it_ops_watchdog`, `bulk_etl_sync`, `compliance_audit`, and
`ai_resilience_gateway` are all modules-only. Wave 3 remains backlog. The currently
dedicated/external routing applies to `it_ops_watchdog`, `bulk_etl_sync`,
`compliance_audit`, and `ai_resilience_gateway`; `content_autopilot` routing is
unresolved per §0. `ai_resilience_gateway/BRIEF.md` is corrected: the finished
`enterprise-features` module has not yet been copied into that product.

---

## Track B — Modules (standalone package readiness)

**Verified:** all 23 modules have source, `VERSION`, and `MODULE.md`; 22 executed
typecheck/tests successfully in the audit environment. This is structural and
unit-test evidence only—not evidence that every module is commercially package-ready.

Before marketing any module as proven, require a clean-install test, documented
consumer integration, dependency/license/security review, and an explicit release
artifact. Prioritise these gaps:

1. **`enterprise-features`** — tests were not run because audit constraints prohibited install. Install and run in an isolated local workspace; do not assume the outcome or duration.
2. ~~**`subscription`** — only 3 tests~~ — **Fixed (2026-08-18).** `handleBillingEvent` had no idempotency at all (no `eventId` field, replaying a webhook event just reapplied the transition — a real correctness gap, not just a test gap). Added `eventId`/`lastProcessedEventId` with a short-circuit check; expanded tests 3→12 (error paths, `changePlan`, all 5 billing event types, one test proving the idempotency fix). Recopied into `stripe-billing` and `multi-tenant-ai`, verified independently in both (12/12).
3. **`http-client`, `event-bus`, `auth`** — used by zero portfolio products. Add each to at least one real product integration before calling it battle-tested; `auth` is also the newest module.
4. **`notification` and `ai-workflow-engine`** — document that email/LINE/Telegram notification providers are approved stubs and that AI workflow tests exercised a rule-based fallback warning. Neither proves a live provider/AI integration.
5. **`webhook-receiver`'s Stripe provider was a stub, fixed (2026-08-18)** — `providers/stripe/index.ts` unconditionally returned `WEBHOOK_UNKNOWN_PROVIDER` despite the module being marked "✅ Completed" in `REGISTRY.md` — no code path in the platform actually verified a Stripe webhook signature. Implemented the real HMAC-SHA256 algorithm (multi-signature support, timestamp-tolerance replay check); 136/136 tests pass. Recopied into `stripe-billing` (had it already) and `multi-tenant-ai` (added fresh — didn't have this module before). **`github` and `line` providers are still stubs** — not touched, out of scope, same caveat applies to them as applied to Stripe before this fix.

---

## Owner decisions still required

- ~~`stripe_billing`: sellable product or shared internal infrastructure.~~ **Resolved 2026-08-22, refined 2026-08-27, plan locked 2026-08-27** — owner chose backlog on 2026-08-22 (leave the 4 proven modules as-is, no app/reference-server layer, no dedicated plan). **2026-08-27: given a dedicated role, centralized (not per-product copies)** — a new isolated service `services/billing-core/` (built from `modules-hub`'s `payment`/`subscription`/`webhook-receiver`/`audit-log` modules, not the stale `products/stripe-billing` copy) is the single billing authority for the "Active scope" Subscribe group (`pawspace`, `wstera_link`, `doccraft`). `booking` keeps its own existing inline Stripe integration untouched — explicitly out of scope. Full locked implementation plan, phase breakdown, and per-product integration design: `docs/platform/BILLING_CORE_PLAN.md`. `stripe_billing` itself is still **not** a standalone sellable product — that part of the 2026-08-22 decision stands; its modules are now a build source for `billing-core`, not a product in their own right.
- `content_autopilot`: dedicated runtime or a conditional Project B candidate.
- ~~`short_url_analytics`: stay standalone or deliberately migrate to Project B.~~ **Moot 2026-08-26** — retired, replaced by `wstera_link` (`LK01`), which is Cloudflare-first/dedicated-runtime by its own locked architecture doc; this decision no longer applies.
- Standalone module pricing and packaging.
- Whether to run Track A1 and A2 in parallel. This roadmap defaults to finishing A1 first; it is a priority choice, not a technical fact.
- **(Added 2026-08-19)** Approved pricing for `line_oa_ai`, `multi_tenant_ai`, and
  `headless_commerce` — none of the three has an owner-approved price yet; `REVENUE-STRATEGY.md`
  is an untracked draft only, and its `booking` numbers conflict with the already-approved
  `PRICING_SPEC.md` (invents a "Business ฿2,490/mo" tier that doesn't exist there).
- ~~**(Added 2026-08-19)** Whether to build booking quota/staff/top-up enforcement before or in
  parallel with the remaining Phase 0/Stripe/domain work.~~ **Resolved 2026-08-19** — built same day
  (`booking@ed06fa2`), see §0 gate 3 above. ~~Phase 0 itself is still open~~ **Closed 2026-08-20**,
  see §0 gate 2 above.

---

## Reconciled documentation and repository state (2026-08-18)

These are mechanical fact corrections, not commercial decisions:

- `docs/products/registry.yaml`: `modules:` list corrected for eight products (`booking`, `headless_commerce`, `stripe_billing`, `multi_tenant_ai`, `content_autopilot`, `it_ops_watchdog`, `bulk_etl_sync`, `compliance_audit`) to match copied modules on disk.
- `products/ai-resilience-gateway/BRIEF.md`: corrected the stale claim that `enterprise-features` is empty.
- `apps/hub-web/README.md`: corrected stale MySQL/TiDB + Manus OAuth claims to the real Postgres/Supabase + Supabase Auth stack.
- `apps/hub-web/todo.md`: checked off Phases 2–7 from verified files; Phase 7 relies on prior `HANDOFF.md` build/test evidence because `pnpm` was unavailable in the audit shell.
- Roadmap and registry corrections are in local commit `fe20468` (`2026-08-18 09:55 +07:00`). At this check, `master` is one commit ahead of locally tracked `origin/master`; four root `BRIEF-*.md` files remain untracked and are not part of that commit.

**2026-08-18, later same day — Track A2 progress + Track B fixes:**
- `multi_tenant_ai` reference server built and pushed (`multi-tenant-ai@ef821f6`).
- `modules-hub`'s `subscription` idempotency fix and `webhook-receiver`'s real Stripe
  verifier: committed at `modules-hub@6d95d3c`, **not yet pushed** — `modules-hub`'s
  `main` has branch protection (PR + 2 required status checks), direct push is
  rejected by GitHub itself. A PR needs to be opened from a feature branch before
  this reaches `origin`. Recopies into `stripe-billing@714a238` and
  `multi-tenant-ai@ef821f6` (same commit as the server) are already pushed and don't
  depend on the modules-hub PR landing first — they're independent copies, per
  copy-and-own convention.
- `headless-commerce` and `feature_flag` do not have `subscription` or
  `webhook-receiver` copied in, so neither fix applies to them.

**2026-08-19 — deep code verification checkpoint (domain-purchase gate):** owner asked whether
the portfolio is genuinely ready to buy a production domain and take real revenue, not just
reference-complete. Full evidence in `DEEP-VERIFICATION-2026-08-18-CONSOLIDATED.md`, run
independently by an outside reviewer and by Hermes (two self-checking rounds), with the one
disagreement between them (headless-commerce malformed-JSON status code) resolved by Claude
reading the source directly. Verdict: **no product is ready yet.** Four concrete blockers found
(headless-commerce webhook signature + malformed-JSON handling, booking quota enforcement,
multi-tenant-ai webhook middleware ordering + unwired subscription update) — see §0 gate 3 above
for the ranked list. `booking` remains closest. New fact: `line_oa_ai`'s core AI-response path has
real production traffic via a live KMO LINE OA pilot (1–3 days as of this date), which de-risks
the AI core specifically without closing the standalone-product packaging gap. This session also
corrected two of its own overstatements: the "multi_tenant_ai done" framing above, and the
headless-commerce PR/QA description that called the missing webhook verification an "acceptable
documented limitation" — it is a CRITICAL blocker.

**2026-08-19, later same day — domain-purchase gate closed at the code level.** Owner asked to fix
the 4 blockers found above, working through a checkpoint-gated brief
(`BRIEF-domain-readiness-fixes-2026-08-19-for-hermes.md`): Hermes proposed each fix, Claude verified
every claim against source directly (not trusting the self-report — same discipline as the original
audit) before authorizing a commit, in three stages:

- **Stage 1 (booking, `ed06fa2` + `2472e12`):** quota/staff/top-up enforcement migration. Review
  caught a real TOCTOU race in the staff-limit RPCs (concurrent `create_staff`/`set_staff_active`
  calls could both pass the count check near the limit) — fixed with `pg_advisory_xact_lock` before
  commit. Also separately verified (and rejected as a false positive) a "re-confirm after cancel
  double-counts quota" concern — a different, independent trigger already makes `cancelled` a
  terminal state, so that transition is structurally impossible.
- **Stage 2 (headless-commerce, `79c1d7c`):** wired the real `StripeWebhookVerifier` (copied
  verbatim from `multi-tenant-ai`'s already-proven module) into the webhook handler. First plan from
  Hermes only copied the module in without wiring it to the request handler — caught before any
  code was touched, corrected against the proven `multi-tenant-ai/server/src/routes/payment-demo.ts`
  pattern.
- **Stage 3 (multi-tenant-ai, `92139cf`):** fixed middleware order and wired `handleBillingEvent`.
  Review of the first pass found a new bug introduced by turning idempotency on for the first time:
  replayed events were answered with 401 instead of the 2xx Stripe expects for duplicates — fixed
  before commit.

Every commit was independently re-verified by Claude (`tsc --noEmit` + full test suite re-run, not
just reading the agent's report) before being approved. All commits are local only, not pushed.
Full narrative: `D:\AI-Workspace\vault\06-Agent-Logs\SaaS-Product-Hub\2026-08-19-domain-readiness-fixes-execution.md`.

---

## Change-control rule

Update this roadmap in the same change whenever evidence changes a priority, gate,
routing decision, or verified readiness fact. Do not mark a product commercially
ready here; record the evidence and request the owner decision instead.
