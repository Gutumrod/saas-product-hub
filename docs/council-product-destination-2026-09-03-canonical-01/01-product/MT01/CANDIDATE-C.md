# MT01 — Product Gate Candidate C

_(anonymized candidate; identity withheld from synthesizer)_

---

# MT01 Multi-Tenant AI Starter Kit — Product Gate Expert Answer 

**Independent expert:** this-expert
**Gate:** Product Gate, llm-council-gate v0.3.2 canonical run 01
**Date:** 2026-09-03
**Repo under review:** D:\AI-Workspace\projects\saas-product-hub\products\multi-tenant-ai
**Gate question:** What exactly is the sellable MT01 artifact, for whom, and where does V1 end?

---

## Recommendation

MT01 is a **multi-module reference/starter architecture — not yet a single coherent sellable source product.** The sellable artifact is best defined as a **self-hostable, versioned "Multi-Tenant AI SaaS Starter Kit": a composition of six reusable modules (tenant-context, auth-supabase, ai-provider, subscription, payment, enterprise-features) plus a wiring-only reference Express server (server/) that proves the modules compose** — sold under a permissive source license to a developer/indie-builder or agency buyer constructing a multi-tenant AI SaaS backend on their own infrastructure.

The exact answer to the gate question:

- **Primary buyer / job-to-be-done** (from BRIEF.md TODO, uncommitted): a developer building their own multi-tenant AI SaaS who wants the tenant-gating, auth/RBAC, AI-provider abstraction, subscription/entitlement and billing backbone pre-composed, instead of assembling and securing these five concerns themselves against a real DB/auth/AI provider/billing service.
- **Product identity:** a **reference/starter architecture** — a composition of reusable modules (the source product), NOT a deployable application and NOT hosted SaaS.
- **Exact buyer artifact & flow:** a **source archive**: `modules/*` (six reusable TS packages) + `server/` (composable reference) + `BRIEF.md` + `server/README.md` + handoffs + `.env.example`. Buyer flow: `git` receive/copy → read `server/README.md` → `npm install && npm run dev` in `server/` (boots unconfigured) → replace in-memory mock repos + inject own Supabase/AI/Stripe keys → extend.
- **Smallest V1 package:** the six modules + reference server, with in-memory/demo boundaries; explicit non-goals: real DB, auth UI/frontend, deployment, OTel exporter, production Stripe flows.
- **Essential modules vs bloat:** the six on-brief modules are the essential core. `webhook-receiver` (a 7th present module) is **not on the BRIEF copied list** — it is wired only into the reference server's Stripe webhook path and should be declared either "bundled example wiring" or cut from V1 scope, not silently shipped as a claimed module.
- **Clean-install/configuration/documentation = the V1 gating definition:** `npm install` + `npm run dev` boot clean; typecheck + 13/13 tests pass; `.env.example` documents buyer-owned credentials; `README` disclaims in-memory boundaries. **L0/L2 NOT met**: no locked buyer scope doc, no product license, no dependency-license audit.
- **Where V1 ends:** at a clean-installable, license-carrying, scope-locked source kit that boots and passes its tests with mock/demo boundaries — productization explicitly deferred to portfolio **P5** with the **L0–L5 ladder** applied first.

**Deliberately NOT decided here (per rules):** Council gate verdict (PASS/HOLD/FAIL is Codex's), pricing, license economics, packaging, release.

---

## Verified facts / evidence used

Directly verified (Git + file system, since `docs/CURRENT_STATUS.md` has unresolved `$branch`/`$head` placeholders):

1. **Git state:** branch `master`, HEAD `92139cf` "fix(webhook): correct middleware order, wire handleBillingEvent, fix replay status" (2026-08-19 18:47 +0700); working tree clean except **untracked `docs/`**. `docs/CURRENT_STATUS.md` line 5 says `Repository branch: $branch` and line 6 `HEAD before documentation pass: $head` — placeholders **unresolved**; Git direct inspection confirms `master @ 92139cf`. Evidence basis there also states `master @ 92139cf`.
2. **Reference server build state:** in `server/`, `npx tsc --noEmit` **exit 0 (typecheck passes)**; `npx vitest run` → **2 files passed, 13/13 tests passed** (9 in `tests/server.test.ts`, 4 in `tests/webhook.test.ts`) [I re-ran both; matches the committed `STAGE3_EVIDENCE_REPORT.md` claim of 13/13].
3. **Reference server wiring:** `server/src/app.ts` (61 lines) mounts `POST /payment/webhook` with `express.raw()` **before** global `express.json()` and mounts all tenant/auth gated routes under `tenantMiddleware`/`authMiddleware`. Routes wired: `/health`, `/whoami`, `/me`, `/ai/demo`, `/subscription/subscribe`, `/subscription/status`, `/payment/demo-charge`, `/payment/webhook`. All six on-brief modules are imported via relative paths `../../../modules/<name>/index.js`; `webhook-receiver` is additionally imported (`createWebhookReceiver`, `StripeWebhookVerifier`) in `server/src/routes/payment-demo.ts`.
4. **In-memory / demo boundaries:** `server/README.md` lines 5, 78–83 state the server uses mock repositories and is NOT production; buyer must add persistent storage, OTel exporter, frontend/auth UI, deployment. `server/src/lib/subscriptions.ts` seeds mock free/pro plans (50 vs 1000 AI reqs/mo, pro $29.00 USD = 2900 minor units) per ROUND4_HANDOFF.
5. **Module inventory (7 dirs present):** `ai-provider`, `auth-supabase`, `enterprise-features`, `payment`, `subscription`, `tenant-context`, `webhook-receiver`. **BRIEF.md "Modules ที่ก็อปมา" lists only 6**: tenant-context, ai-provider, subscription, payment, auth-supabase, enterprise-features. **`webhook-receiver` is NOT in the BRIEF copied list** — it was added by commit `ef821f6` "Add webhook-receiver + subscription fixes, wire real Stripe verification" (2026-08-18).
6. **Version / provenance vs Canonical Module Hub (`D:\AI-Workspace\projects\modules-hub`, read-only):**
   | module | product copy | hub | delta |
   |---|---|---|---|
   | ai-provider | 0.2.0 | 0.3.0 | product **lags** hub (hub has `core/fallback.ts`, `fallback.test.ts`) |
   | auth-supabase | 0.1.0 | 0.2.0 | product **lags** hub |
   | enterprise-features | 0.3.0 | 0.3.0 | match |
   | payment | 0.1.0 | 0.1.0 | match |
   | subscription | 0.1.0 | 0.1.0 | match |
   | tenant-context | 0.2.0 | 0.3.0 | product **lags** hub (hub has `manager.ts`, `express-like-middleware.ts`) |
   | webhook-receiver | 0.1.0 | 0.1.0 | match |
   Product copies for ai-provider, auth-supabase, tenant-context are **older snapshots** than current hub; hub `INDEX.md` states the copy-out workflow is: copy the whole module folder, then extend the copy.
7. **enterprise-features tracing limitation:** BRIEF.md lines 14–15 + module state confirm `MemoryTracer`/`NoopTracer` are the only shipped implementations; **no OpenTelemetry adapter**. Any "distributed tracing" claim requires the buyer/host to write an OTel adapter.
8. **Parent portfolio delivery model:** `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md` §3.1/3.3 lists MT01 as `multi_tenant_ai` = **"One-time source product"**, governed by the **L0–L5 one-time-product ladder** (§4) in addition to G0–G7 gates. §6.5 defines target "complete self-hostable multi-tenant AI starter kit sold as a versioned source product." **Productization currently DEFERRED TO P5**; `docs/CURRENT_STATUS.md` Blockers/Gates: at P5 start with **L0 (buyer/scope lock), license/IP (L2), and clean-install proof** before packaging; "do not treat the reference server as production-ready."
9. **L-gate status for MT01:** L0 (buyer & scope lock) **not met** — BRIEF.md TODO buyer target & MVP scope are all **unchecked**; L2 (license + IP + dependency-license audit) **not met** — plan states "MT01 and HC01 do not" have a license and reports high/critical dependency findings open for MT01.
10. **P2 gate conflict note:** the (non-canonical) prior run at `docs/council-product-destination-2026-09-03/` contains MT01 raw artifacts; the canonical run at `...-canonical-01/00-PIPELINE-STATUS.md` explicitly **excludes** the failed/non-canonical run's evidence from this run's synthesis. I relied only on the canonical run path + the repo itself.

---

## Key reasons

1. **The modules are the durable asset; the server is proof, not the product.** The real value is the modular composition already exercised end-to-end: tenant gating → Supabase auth/RBAC → AI-provider abstraction → subscription/entitlement → payment → webhook verification, with type-safe contracts and passing tests. The server is explicitly "reference/example" with mock repos (README). Selling "a starter kit app" would misrepresent the artifact as runtime-ready.
2. **Composition is credible and verified.** 13/13 tests pass, typecheck clean, webhook signature verification is real HMAC (timing-safe, timestamp-window checked), and the recent webhook commit fixed real defects (middleware order, `handleBillingEvent` wiring, 200-on-replay). This is sufficient evidence that modules compose, which is the central V1 claim.
3. **The buyer's job is real but generic.** Assembling multi-tenant isolation + auth + AI fallback + entitlements + billing is a well-documented pain for indie/agency builders. The kit's differentiation is the pre-verified composition and the framework-agnostic module contracts — but this is shared with the Canonical Module Hub, so fit must be shown, not just asserted.
4. **The gate's core missing piece is scope discipline, not code.** V1 is defined less by what code exists and more by what is explicitly excluded. Because the server is a demo and the modules are copied snapshots lagging the hub, a saleable V1 must state: ship these six modules at these pinned versions + reference server + this license + these documented mock boundaries; anything production (real DB, OTel, UI, deploys) is explicitly buyer-led or a separate paid service.
5. **Tracing/monitoring must be de-scoped or re-scoped.** With no OTel adapter, "distributed tracing" cannot be promised. V1 must either (a) ship tracing as in-process `MemoryTracer` demo only, or (b) be an explicit paid add-on for an OTel adapter — never implied as included.
6. **webhook-receiver is a scope leak today.** It is in the repo, used by the server, and matches hub 0.1.0 — a mature module — but is absent from the BRIEF copied list. Leaving it undefined invites either over-claim (shipping 7 modules) or confusion about V1 contents. It must be explicitly classified before V1 scope is locked.

---

## Risks / failure cases

- **Over-promise on production-readiness.** If marketing or the contract says "production-ready boilerplate," the mock-repo boundaries, missing OTel adapter, and lagging module copies become contract violations. The plan explicitly warns not to make this claim before L0–L5 pass.
- **Version drift vs Module Hub.** ai-provider, auth-supabase, tenant-context copies lag the hub (0.2.0 vs 0.3.0 etc.). A buyer receiving an older AI-provider snapshot misses `FallbackAIProvider`; auth-supabase misses current helpers. Without a recorded source-commit pin, provenance and bug-fix lineage are unprovable.
- **webhook-receiver under-defined.** It is a separate, mature module included de facto via the server. If it ships, its license/attribution and version must be itemized; if it does not ship in V1, the server's Stripe webhook path must be re-scoped to the `payment` module alone so buyers don't receive a partial dependency.
- **Licensing/IP failure blocks sale.** No product license + dependency-license audit not clean (plan: at least one high/critical finding for MT01). Redistribution of copied modules whose own licenses are not itemized is a legal failure case at L2.
- **Buyer mis-match on infra.** The kit's real cost is in the buyer doing production work. A buyer expecting a turnkey multi-tenant AI SaaS is the wrong buyer; expectation must be set at the artifact boundary (source kit, not SaaS) to avoid refund/abandonment.
- **No persistent-store boundary anywhere in demo.** Subscription/payment/entitlement state is all in-memory, so quota enforcement and billing are illustrative only; a naive buyer deploying this without replacing mocks gets a non-functional multi-tenant product.
- **Single-track/sequencing risk:** P5 is shared (MT01 before HC01). Delay in P5 start or in L0/L2 evidence stalls MT01 with no revenue path; the kit has no alternative scheduling slot now.

---

## Assumptions

- Buyer segment is **developer-facing**: indie builders, or small agencies building multi-tenant AI SaaS backends, who already hold their own Supabase/AI/Stripe accounts and can wire production infra (per `server/README.md` credentials note). This is an assumption derived from the uncommitted BRIEF TODO ("dev ที่จะสร้าง AI SaaS ของตัวเอง, ขายเป็น boilerplate"), not verified against market data.
- The deliverable is distributed as a **source product (archive/copy), not hosted service or executable** — consistent with portfolio §3.3 one-time source-product model.
- Modules remain **framework-agnostic** (host injects env/config/adapters; cores never read env) — this is a stated invariant I did not attempt to violate.
- The canonical run's exclusion of the failed prior-run artifacts is respected; I did not treat prior-run MT01 files as evidence.
- "V1" here means the first clean-installable, license-carrying, scope-locked source kit — not necessarily the current master HEAD, which still lacks L0/L2 prerequisites.

---

## Open questions / missing evidence

- **Who pays and how much is unverified:** no locked buyer persona, willingness-to-pay, or competitor/license pricing evidence exists; BRIEF.md buyer/MVP/pricing TODOs are all unchecked. This is the product gate's biggest open question and feeds directly to the (later) Business/Market gate.
- **Exact V1 module list unconfirmed:** is `webhook-receiver` in V1 or out? BRIEF lists 6; repo has 7. Owner must decide before scope lock.
- **Provenance pin unrecorded:** whether the six modules were copied from the current hub or an older snapshot, and at which commit, is not documented in the repo (BRIEF only says "ก็อปมา", with dates for enterprise-features/webhook additions). A precise source-commit manifest is missing for L2/provenance.
- **License/IP status:** MT01 has no license file and no dependency-license audit; which permissive license is intended and which dependencies restrict redistribution are unresolved (L2).
- **OTel / tracing scope:** whether distributed tracing is in V1 scope (requiring a new adapter) or intentionally deferred is an open owner decision.
- **"Quota"/entitlement semantics** (50 vs 1000 AI reqs/mo) are demo seeds only; real plan definitions, per-customer pricing tiers, and enforcement strategy are undefined.
- **Clean-machine install proof** (a fresh buyer machine installs, runs, tests, removes per §4 L-ladder definition) has not been executed or evidenced.
- **Dependency audit detail:** the plan cites "at least one high or critical finding" for MT01 but the specific finding and its mitigation path are not recorded in the product repo.

---

## Confidence 0-100

**72 / 100**

The evidence is strong for what exists (module code, wiring, tests passing 13/13, typecheck clean, correct portfolio classification as a one-time source product, clear in-memory boundaries) — that side is well-verified by direct Git/source/test inspection. The uncertainty concentrates on the saleability question the gate must answer: buyer persona/pricing are entirely unverified; scope (webhook-receiver in/out), license/IP, provenance pin, and OTel scope are unresolved owner decisions; and L0/L2 gates are unmet. For the *"exact artifact and V1 boundary"* framing I am confident; for the *"for whom / will anyone pay"* framing I am not, which caps overall confidence well below where it would be for a scope-locked, licensed product.

---

*Scope of this answer: independent Product Gate expert input only. No gate verdict, pricing, license, packaging, release, checkout, or code/doc modification performed. Canonical Module Hub inspected read-only for provenance/fit only.*
