# MT01 Multi-Tenant AI Starter Kit — Product Gate Expert Answer (Claude)

Role: Independent Council expert (agent-claude). This is NOT a gate verdict and I do not set pricing/license economics. I answer the gate question (`What exactly is the sellable MT01 artifact, for whom, and where does V1 end?`) from direct git/source/test inspection, per the frozen brief.

---

## Recommendation

Sell MT01 as a **bounded source-product / "starter kit / reference architecture"** — one-time delivery of the module source (7 modules, not 6 as the brief currently counts) plus the Express reference server plus buyer docs and a license, delivered as a packaged immutable repository. The **primary buyer is an individual/team developer who builds their own multi-tenant AI SaaS backend** and needs a proven composition blueprint with working billing/quota/providers wiring, not a hosted service.

**V1 ends at: backend-only reference composition, explicitly non-production.** The smallest sellable V1 ships:
- all 7 modules (`tenant-context`, `auth-supabase`, `ai-provider`, `payment`, `subscription`, `enterprise-features`, `webhook-receiver`) synced to canonical Module Hub;
- the reference server wiring them into the full billing loop (subscribe → Stripe charge → verified webhook → entitlement), which is verified working (13/13 tests pass on a real run);
- `.env.example`, a root README, buyer setup/run guide, LICENSE (MT01 owns one), provenance/license-of-copied-modules proof, and clean-install evidence.

Explicit non-goals for V1 (so the seller does not over-promise): **no production database adapter, no auth UI/frontend, no OpenTelemetry exporter, no deployment pipeline/CI, no multi-instance idempotency.** These are documented as "buyer continues from here," and the server README already states this honestly. Do NOT market "distributed tracing" or "production-ready billing" until the OTel adapter and the canonical subscription hardening are folded in.

Before any packaging, the modules must be **re-synced from canonical Module Hub** and the version drift closed (see Verified facts), otherwise the buyer receives stale copies (most critically the subscription engine). This is a hard precondition to a sellable artifact, not an optional polish.

---

## Verified facts/evidence used

- Repo `products/multi-tenant-ai`: `git rev-parse --abbrev-ref HEAD` = `master`; `git rev-parse HEAD` = `92139cfa4697fbade1a023d76dc4734dd82d5862`; `git status` = clean except untracked `docs/`. `git log` = 5 commits (8600384 scaffold → ce9ceb9 enterprise-features → 3247b41 reference server → ef821f6 webhook-receiver+subscription fixes → 92139cf webhook middleware order).
- `docs/CURRENT_STATUS.md` genuinely has unresolved `$branch`/`$head` placeholders (lines 4–5), states "master @ 92139cf" and "DEFERRED TO P5", and explicitly says the server "remains a source-product reference with in-memory/demo boundaries, not a release artifact." Verified against the real git state (the doc's commit reference is accurate; only the header placeholders are unresolved).
- `server/README.md`: confirms reference/example intent, in-memory mock repos, "buyer would replace mock adapters with their production infrastructure," and names the three required buyer-side additions (persistent storage, OTel exporter, frontend). No overclaim.
- `server/` real source: Express 4 + TypeScript strict + ESM, `package.json` runtime deps only `express ^4.19.2` + `@supabase/supabase-js ^2.45.4`. 8 routes: `/health`, `/whoami`, `/me`, `/ai/demo`, `/subscription/subscribe`, `/subscription/status`, `/payment/demo-charge`, `/payment/webhook`. Ran the suite myself: `npx tsc --noEmit` exit 0, `npx vitest run` = 13/13 passed (webhook 4 + server 9). The webhook middleware-order fix (raw body before global `express.json()`), `handleBillingEvent` wiring, and replay→200 duplicate handling are all real in `server/src/app.ts` and `server/src/routes/payment-demo.ts` and covered by `server/tests/`.
- Modules: **7 directories** present in `modules/`: tenant-context, auth-supabase, ai-provider, payment, subscription, enterprise-features, webhook-receiver. `BRIEF.md` lists only 6 (omits webhook-receiver) even though the server imports it via `createWebhookReceiver`/`StripeWebhookVerifier`.
- Provenance vs canonical `D:\AI-Workspace\projects\modules-hub` @ `7ed23ad` (real `diff -rq` I ran):
  - enterprise-features v0.3.0 = hub v0.3.0, core identical (synced).
  - webhook-receiver v0.1.0 = hub v0.1.0, core identical and `providers/stripe/index.ts` identical (synced).
  - payment v0.1.0 = hub v0.1.0, but `core/error.ts`/`types.ts` differ (hub adds `INVALID_PAYMENT_REQUEST`) — copy slightly older.
  - ai-provider product VERSION 0.2.0 vs hub 0.3.0; copy is **missing `core/fallback.ts`** (provider fallback chain) — copy older by 2 minors.
  - tenant-context product VERSION 0.2.0 vs hub 0.3.0; copy **missing `core/manager.ts`**, `index.ts`/`types.ts` differ — copy older.
  - auth-supabase product VERSION 0.1.0 vs hub 0.2.0; core identical but DESIGN/MODULE/VERSION/package.json differ — copy older by 1 minor.
  - subscription both VERSION 0.1.0, but `core/engine.ts`, `repository.ts`, `service.ts`, `types.ts` differ materially: canonical hub has the durable `saveForBillingEvent(sub, eventId)` idempotency claim, fail-closed grace-period enforcement in the entitlement engine, UTC calendar period arithmetic, and on `payment_failed` sets `grace_period` + `gracePeriodEnd`. The product copy is the **older** variant: `payment_failed` sets `past_due` and stops, the engine does not enforce a grace deadline, there is no durable claim, and it uses a fixed 30-day interval. So the product carries the older subscription engine and is missing the billing-core Phase 0 hardening that lives in canonical.
  - Also: product copy internal version inconsistency — `VERSION` files (ai-provider 0.2.0) don't match `package.json` (0.1.0).
- Absences (verified — files don't exist): no `LICENSE` anywhere in the repo; no root `README.md` (only `BRIEF.md`, an internal doc, plus `server/README.md`); no frontend/auth UI; no OTel adapter (enterprise-features ships only `MemoryTracer`/`NoopTracer`; `MODULE.md` line 15 states there is no OpenTelemetry adapter); no CI; no clean-install evidence committed; in-memory idempotency is a `Set` in `payment-demo.ts` so multi-instance replay dedupe breaks (the code comment admits this); modules other than `server/` have no package-lock.json.
- Parent portfolio delivery-model records:
  - `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md` (R3) lists MT01 as `One-time source product`, requires the one-time L0–L5 ladder "mandatory in addition" to G0–G6, and states a one-time product "is not release-ready until every rung has evidence." L0 = buyer and scope lock; L1 = clean-install proof; L2 = license and IP; L3 = packaging/versioning; L4 = fulfillment path (delivered as a shared Hub capability); L5 = support boundary. The same plan's intake baseline table records MT01 as "Reference server typecheck and 13 tests pass; server remains in-memory/demo-only; high/critical dependency findings, license, packaging and deployable product are open."
  - `docs/products/registry.yaml` records `delivery_model: one_time_source_product`, `deployment_model: source_product`, `commercial_status: "sellable"`, and lists all 7 modules. A comment states "Commercial readiness is still an open human decision — see product BRIEF.md." So the registry's "sellable" is aspirational/a declared target, not verified commercial readiness (the BRIEF itself says commercial readiness is unassessed).
  - The Round-1 technical-delivery lens (`docs/council-product-destination-2026-09-03/raw/MT01/03-technical-delivery.md`) reached the same DELAY-to-P5 conclusion as CURRENT_STATUS.md; I independently re-verified its Git/module findings and confirmed the subscription drift (though the round-1 doc's subscription claim is directionally correct: the product copy is older than hub).

---

## Key reasons

1. **The identity is unambiguous from the evidence: a one-time source product, not a hosted SaaS.** Both the portfolio master plan (delivery model + L0–L5 ladder) and CURRENT_STATUS.md (DEFERRED TO P5; "not a release artifact") agree. The seller's obligation is a clean, licensed, documented source deliverable — not uptime/tenant privacy/SLOs.

2. **The verifiable technical heart of the product is the billing composition loop** (subscribe → Stripe charge → verified webhook → entitlement transition), proven to compose by real tests (13/13). That is the differentiation to sell: the buyer gets a working multi-tenant billing/quota/providers wiring blueprint, which is the hardest part to assemble from scratch.

3. **The buyer and job-to-be-done are clear enough to lock at L0.** Buyer = developer building their own AI SaaS backend; JtBD = "I want a proven blueprint + modules that compose into a multi-tenant backend with billing and quota, so I don't rewire 6+ modules myself." README, BRIEF (target: dev building own AI SaaS, boilerplate) and registry target ("SaaS Builders") all point the same way. This is the one piece that is ready to write.

4. **V1 must be explicitly non-production to be both honest and shippable.** Shipping real DB auth, a frontend, and OTel would be several sprints and is not needed to make the blueprint valuable. The evidence (server is in-memory/demo by design; all docs say so) supports a sharply bounded V1. This also keeps the "where does V1 end" answer crisp.

5. **Module provenance is the #1 technical gate.** Four of the seven copies drift from canonical, and the subscription copy is materially older (missing the durable claim/grace semantics). Selling today ships stale capability to the buyer. Re-sync must be a release gate (L0–L3), otherwise the artifact is knowingly inferior to what the canonical modules already provide.

---

## Risks/failure cases

- **Stale-module liability (high):** If packaged without re-sync, the buyer gets a subscription engine without the durable eventId claim and grace-period enforcement, and an ai-provider/tenant-context without fallback/manager capability. A post-sale bug on billing/entitlements becomes a seller support obligation with no support contract defined.
- **License/IP gap (high):** No OWN license and no recorded license/provenance proof for copied modules. Without confirming each module's license permits redistribution inside a sold product, the artifact may not be legally transferable. L2 is unmet.
- **One-time model → unbounded support (high):** Source copy, not a package; external API churn (Stripe, Supabase, 3 AI providers) will drive ongoing buyer requests. With the master plan requiring L5 support boundary before first sale, selling without a defined support window (e.g., fixed 90-day + optional retainer) invites indefinite ad-hoc demand.
- **Clean-install failure (medium):** No clean-install evidence exists, module `package-lock.json`s are absent, `docs/` is untracked, and `CURRENT_STATUS.md` retains placeholders. Buyer's first install experience could fail on undocumented steps, damaging the product's one chance at first impression.
- **"Tracing" overclaim (medium):** enterprise-features has no OTel adapter; marketing "distributed tracing / observability" before the host-side adapter exists would be a false customer claim (per brief and MODULE.md).
- **Single-instance idempotency (medium):** The in-memory `Set` replay store breaks under multi-instance; if any buyer runs horizontally, duplicate webhooks can double-apply. Fine for a reference, a real defect if presented as safe at scale.
- **Scope ambiguity → rework (medium):** Whether V1 is backend-only or full-stack materially changes price/effort/contract. If left open at packaging, the seller risks delivering the wrong thing.

---

## Assumptions

- The canonical Module Hub (`D:\AI-Workspace\projects\modules-hub`, current head `7ed23ad`) is the intended provenance source for the copied modules, and its current versions (ai-provider 0.3.0, tenant-context 0.3.0, auth-supabase 0.2.0, hardened subscription 0.1.0) are what a re-sync should target.
- "Sellable V1" means a **backend-only reference composition** (modules + reference server + docs + license); a full production frontend, DB migration layer, OTel deployment, and horizontal scaling are out-of-scope and clearly documented as such.
- The buyer will bring their own Supabase/Stripe/AI-provider accounts (the README already states this); the artifact provides no hosted infrastructure.
- "One-time source product" pricing/license economics are owned by the CEO and are deliberately excluded from this analysis; my Recommendation assumes whatever terms they set can be layered onto the L0–L5 evidence.
- The reference server's correctness at the `92139cf` commit (13/13 tests, exit-0 typecheck) remains valid as the basis for the buyer-flow claim; no uncommitted source changed it (the worktree is clean apart from untracked `docs/`).
- `commercial_status: "sellable"` in registry.yaml is a target declaration, not verified readiness; the BRIEF's "must assess commercial readiness before pricing" governs.

---

## Open questions/missing evidence

- **Owner decisions not yet made (block L0/L2):** (a) exact buyer lock and target persona/price band; (b) V1 scope final answer — backend-only reference vs must-include demo frontend; (c) license choice for MT01 and the copied modules; (d) support window/update policy for the one-time model (L5).
- **Clean-install proof (missing):** no evidence that `npm install && npm run dev` reaches a passing state on a clean machine using only shipped instructions and no WSTERA secrets. Must be produced before release.
- **Module re-sync evidence (missing):** no record/process that the product copies are re-synced from canonical before packaging (P1 requirement to record vendored-module upstream commit/checksum + drift test is not present in this product).
- **Dependency/license audit (missing):** high/critical npm dependency findings for MT01 were recorded in the master-plan intake; they are time-sensitive and must be regenerated at the release commit. Redistribution license compatibility of all bundled deps is unverified.
- **webhook-receiver accounting:** BRIEF counts 6 modules; the repo and server use 7. Must be decided whether it's an "included capability" or an "internal dependency" and reflected consistently in BRIEF/registry/sales copy.
- **Registry vs reality:** `commercial_status: sellable` (registry) must be reconciled with the un-assessed commercial readiness stated in BRIEF and the DELAYED-to-P5 status.
- **OTel / tracing intent:** whether distributed tracing is an advertised capability (and thus whether the OTel adapter is a V1 requirement) is unresolved.

---

## Confidence 0-100

**75**. The core identity (one-time source product, developer buyer, backend-reference V1, billing-composition heart, must-re-sync modules, license/clean-install gaps) is strongly evidenced and independently re-verified against real git/source/tests. Confidence is not higher because (a) final buyer lock, V1 scope, license, and support economics are unresolved owner decisions that gate L0/L2/L5 and change what is actually delivered; (b) no clean-install evidence exists to prove the promised artifact works; and (c) the registry/BRIEF module-count and commercial-status inconsistencies mean the product's own documentation is not yet internally consistent enough to underpin a contract.
