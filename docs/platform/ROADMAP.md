# Portfolio Development Roadmap — Source of Truth (2026-08-18)

**Status:** Ready for owner declaration as the source of truth for development
sequencing, technical gates, and evidence standards in this portfolio. It is not a commercial-readiness decision:
`commercial_status` and `acceptance.commercial` remain owner-only.

**Authority boundary:** This document records verified current state and the
development order. `docs/products/registry.yaml` remains the product catalog and
declared target configuration, but a target runtime there is not evidence that an
app is built, admitted, or deployed. When the two disagree about current reality,
this roadmap and its cited evidence win until the registry is reconciled.

**Evidence baseline:** `D:\AI-Workspace\runtime\hermes-native\workspace\audit-2026-08-18\FULL-PORTFOLIO-AUDIT-2026-08-18.md`, its Hermes/AGY source reports, and repository state checked on 2026-08-18. Any implementation must re-check live services, credentials, remote migration history, and test environments before a production claim.

---

## 0. Mandatory gates

These gates apply only to the stated scope. They do not block unrelated local
development, standalone products, or module hardening.

1. **Rotate exposed Supabase service-role/API credentials for the two affected projects** — owner-only action in Supabase Dashboard. `gyleqrjdzwwlqierdwcy` and `coyelzlgukvpgguqpjdi` are project references, not secret values; never place credentials in this roadmap, git, or chat. This blocks public production deployment that would use the affected credentials.
2. **Complete `docs/platform/SHARED_SAAS_RUNTIME_PROJECT_B_PLAN.md` Phase 0** — hard gate *before Project B accepts a second product schema*. It requires booking migration-history reconciliation, E3.3 live RLS/security verification, disposition of booking's outstanding work, and a reviewed baseline commit. It does not permit `db push`, migration repair, or dashboard SQL.

### Project B routing truth

| Product | Verified current state | Routing decision for development |
|---|---|---|
| `booking` | Existing Project B baseline | Phase 0 governs its baseline/security work; public launch also needs Stripe, domain, and live migration evidence. |
| `line_oa_ai` | Express app exists; no Project B admission evidence | First candidate only after Phase 0 and explicit owner confirmation, per the shared-runtime plan. |
| `headless_commerce` | Four copied modules; no app/schema/deploy config | Conditional Project B candidate. Build only after its storage, catalog-growth, payment, and admission review. |
| `feature_flag` | Two copied modules; no app/schema/service | Conditional Project B candidate. Require quota and developer-access review before admission. |
| `short_url_analytics` | FastAPI + local SQLite; no Project B integration | Standalone product today. Moving it to Project B is a new owner decision, not an existing gate. |
| `content_autopilot` | Four copied modules; no app | Registry says dedicated runtime, while the shared-runtime plan calls it a possible second candidate. Routing is unresolved; do not treat either as approved until the owner decides. |

---

## Track A — Products (sell the finished app, not just the module pile)

Ordered by verified delivery distance, not by `commercial_status`: finish runnable
apps first, then assemble module-only products. The order inside a wave is an
engineering default; customer demand or an owner decision may override it.

### A1. Finish the 5 that already have a real app layer

| Product | Gap to close | Effort |
|---|---|---|
| `booking_ticket_module` | Closest to done — 61/61 tests, E2E configured. Needs a real backend adapter (currently localStorage-only by design) before it is more than a demo template. | Small–medium |
| `line_oa_ai` | Needs a real LINE OA sandbox test before claiming end-to-end proof. Project B admission is a separate Phase 0 + owner-confirmation gate. | Small |
| `short_url_analytics` | `pytest` is environment-blocked (`pydantic_core` missing). Repair the isolated test environment and re-verify before any readiness claim; it remains standalone unless the owner approves a Project B migration. | Small |
| `tracking` | Functional MVP but no auth, no real DB (JSON file), and no tests — the largest gap of the five for anything beyond a demo. | Medium |
| `booking` | Most mature (25 migrations, real Stripe/auth/tenant code), but requires Phase 0 baseline/security evidence plus live Stripe configuration and a production domain. | Medium, mostly non-code |

### A2. Build application layers for wave_2 products (currently modules-only)

Wave 2 remains ahead of Wave 3 under the existing release-wave decision. The order
below is by existing scaffolding, not proof of market demand or commercial readiness:

1. **`multi_tenant_ai`** — six copied modules (`tenant-context`, `ai-provider`, `enterprise-features`, `auth-supabase`, `payment`, `subscription`). Closest to a host-app assembly task, but still lacks a runnable starter app.
2. **`headless_commerce`** — four modules (`product-catalog`, `file-storage`, `import-export`, `payment`); needs a real API, schema, and deploy configuration. Its possible Project B admission is conditional and cannot start before Phase 0 and its product admission review.
3. **`stripe_billing`** — scope depends on whether it is a sellable product or shared internal infrastructure. Do not create its application plan until the owner chooses.
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
2. **`subscription`** — only 3 tests for a P1 money-handling module. Expand success, failure, webhook/idempotency, entitlement, and cancellation coverage before a trusted billing claim.
3. **`http-client`, `event-bus`, `auth`** — used by zero portfolio products. Add each to at least one real product integration before calling it battle-tested; `auth` is also the newest module.
4. **`notification` and `ai-workflow-engine`** — document that email/LINE/Telegram notification providers are approved stubs and that AI workflow tests exercised a rule-based fallback warning. Neither proves a live provider/AI integration.

---

## Owner decisions still required

- `stripe_billing`: sellable product or shared internal infrastructure.
- `content_autopilot`: dedicated runtime or a conditional Project B candidate.
- `short_url_analytics`: stay standalone or deliberately migrate to Project B.
- Standalone module pricing and packaging.
- Whether to run Track A1 and A2 in parallel. This roadmap defaults to finishing A1 first; it is a priority choice, not a technical fact.

---

## Reconciled documentation and repository state (2026-08-18)

These are mechanical fact corrections, not commercial decisions:

- `docs/products/registry.yaml`: `modules:` list corrected for eight products (`booking`, `headless_commerce`, `stripe_billing`, `multi_tenant_ai`, `content_autopilot`, `it_ops_watchdog`, `bulk_etl_sync`, `compliance_audit`) to match copied modules on disk.
- `products/ai-resilience-gateway/BRIEF.md`: corrected the stale claim that `enterprise-features` is empty.
- `apps/hub-web/README.md`: corrected stale MySQL/TiDB + Manus OAuth claims to the real Postgres/Supabase + Supabase Auth stack.
- `apps/hub-web/todo.md`: checked off Phases 2–7 from verified files; Phase 7 relies on prior `HANDOFF.md` build/test evidence because `pnpm` was unavailable in the audit shell.
- Roadmap and registry corrections are in local commit `fe20468` (`2026-08-18 09:55 +07:00`). At this check, `master` is one commit ahead of locally tracked `origin/master`; four root `BRIEF-*.md` files remain untracked and are not part of that commit.

---

## Change-control rule

Update this roadmap in the same change whenever evidence changes a priority, gate,
routing decision, or verified readiness fact. Do not mark a product commercially
ready here; record the evidence and request the owner decision instead.
