# Module Reuse Check — House Live Window (04/05)

Date: 2026-09-28  
Module Hub source: `Gutumrod/modules-hub` commit `f9dee01ecb797baa634e0e2a6a1498fdfdd8df37` (`main`)  
Destination: `Gutumrod/saas-product-hub`, House shared-runtime platform  
Scope: House runtime token issuer (04) and House Storage upload grant (05), source-only.

Module Reuse Check: COMPLETE  
MT01 Bootstrap Check: PASS  
Reuse Gate: PASS

## Source-of-Truth References

- `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md` §§1, 3, 4 (platform/product boundary and production gates).
- `docs/platform/MODULE-REUSE-POLICY.md` §§2–10 (inspection order, copy-and-own, provenance, and gate).
- `docs/platform/shared-runtime/DESIGN-H2-SHARED-RUNTIME-ISOLATION-EXECUTION-BOUNDARY-2026-09-08.md` (product NOLOGIN identities, House-owned token authority, private internal schema boundary).
- `docs/platform/shared-runtime/migrations/h3c_auth_runtime_token_support.sql` (Auth hook, role allowlist, five-minute token cap).
- Vault brief `06-Agent-Logs/WSTERA-House/briefs/codex-parallel-20260927/14-UNBLOCK-LIVE-WINDOW-04-05-06.md` (current decisions supersede the prior 04/05/06 blockers).
- Vault briefs `05-HOUSE-STORAGE-UPLOAD-GRANT-POLICY.md` and `06-LANE-B-LIVE-WINDOW-OPERATOR-PACK.md`.
- BK01 source at `Gutumrod/booking` commit `c16036d154912ebeb8217bf08ea06044daee8dfd`; frozen migrations remain unchanged.
- Module Hub `INDEX.md`, `modules/REGISTRY.md`, and candidate `MODULE.md`/source/tests at the immutable commit above.
- MT01 internal bootstrap reference at SaaS Product Hub baseline `3eeea7bafc343fa034911c64f856024c53f79ceb`, `products/multi-tenant-ai/PROVENANCE.md`, `docs/CURRENT_STATUS.md`, module contracts, and reference server middleware.

## MT01 Bootstrap Check

| Baseline area | Evidence inspected | Disposition |
|---|---|---|
| Tenant context | MT01 `modules/tenant-context` v0.3.0 and `server/src/middleware/tenant.ts`; header resolver accepts a host-provided tenant header. | Inspect as reference only. Not used: issuer clients map to one fixed product and do not select tenant data. |
| Supabase Auth | MT01 `modules/auth-supabase` and `server/src/middleware/auth.ts`; helpers verify user JWT/session context. | Inspect as reference only. Not used: issuer must make a password-grant request and validate the returned token's role and expiry; user authorization helpers do not implement that contract. |
| AI provider | MT01 `modules/ai-provider` contract; the issuer has no AI flow. | NOT APPLICABLE. |
| Enterprise/reliability | MT01 `modules/enterprise-features` v0.3.0 supports in-process circuit breaker/tracing; no distributed durable store. | Inspect as reference only. Durable atomic limiting/audit still requires House-owned persistence. |
| Webhook receiver | MT01 `modules/webhook-receiver` v0.1.0 validates signed inbound events and optional replay store. | NOT APPLICABLE: the issuer is a client-authenticated request/response API, not a webhook consumer. |
| Central-platform seam | MT01 reference server uses product Supabase adapters and no House issuer seam. MT01 current status labels its server demo/reference-only. | Follow H2/H3C directly; MT01 is not a runtime dependency and supplies no issuer implementation. |
| Durable rate limit/audit | Inspected MT01 module tree and current status; no rate-limit or audit-log module is present in MT01. | Use current Module Hub contracts below; do not copy stale product-local code. |

MT01 Bootstrap Check: PASS. The required baseline areas were inspected; the unrelated AI, tenant, and webhook capabilities are excluded with reasons. This is an internal-platform implementation and does not change MT01 product scope.

## Required Capabilities and Module Decisions

| Capability | Candidate inspected | Decision | Evidence / reason |
|---|---|---|---|
| Auth service password grant and issuer API | Module Hub `auth`, `auth-supabase`, `http-client`; MT01 `auth-supabase` | MISSING CAPABILITY for the issuer flow; implement a small host-owned endpoint with Web Crypto and injected `fetch`. | `auth-supabase` resolves authorization context and does not authenticate a service identity or issue a new Auth token. Generic HTTP client is transport only and adds no issuer, secret verification, audience mapping, or JWT claim validation. No cross-repository runtime dependency. |
| Atomic distributed rate limit | Module Hub `rate-limit` v0.1.0 | USE + ADAPT. Copy core and its tests; add a destination-owned House Postgres adapter implementing `RateLimitStore.consume` as one atomic database operation. | Canonical interface explicitly requires atomic per-key consume. The shipped memory adapter is single-process and documented as unsuitable for distributed production; it will not be used in production. Source commit: `f9dee01ecb797baa634e0e2a6a1498fdfdd8df37`. |
| Durable issuer audit | Module Hub `audit-log` v0.1.0 | USE + ADAPT. Copy core; use a destination-owned store against House-only audit rows and permit only the approved client/request/time/outcome/reason fields. | The core supports an injected append-only `AuditStore`; the generic Postgres adapter assumes a raw SQL executor and its stock DDL does not express this narrower record shape or House role grants. Never persist token, password, secret, email, body, or refresh token. Source commit: `f9dee01ecb797baa634e0e2a6a1498fdfdd8df37`. |
| Supabase Auth helpers | Module Hub `auth-supabase` v0.2.1 and MT01 copy | REJECT WITH JUSTIFICATION. | User/session authorization helpers are not a password-grant client and do not validate issuer-specific audience, `role`, `exp`, or five-minute policy. Issuer uses a bounded direct Auth endpoint call; do not add the module's SDK dependency. |
| File Storage abstraction | Module Hub `file-storage` v0.1.0 | REJECT WITH JUSTIFICATION for step 05. | It provides R2 object CRUD, generated keys, and metadata adapters. It cannot enforce Supabase Storage `storage.objects` RLS, transactional trigger consumption, or the exact BK01 grant registry contract. The task is a database policy/trigger artifact, not a generic file adapter. |
| Tenant Context | Module Hub `tenant-context` v0.3.0 and MT01 copy | NOT APPLICABLE. | Product identity is fixed by server-side registration and cannot be selected by request; no tenant data is read or changed. |
| Webhook Receiver / Event Bus | Module Hub webhook/event-bus modules | NOT APPLICABLE. | No webhook event delivery or event distribution is needed. |
| AI Provider | Module Hub `ai-provider` v0.3.0 and MT01 copy | NOT APPLICABLE. | No AI inference is in this capability. |
| Storage grant registry / consume | Module Hub `file-storage`, Supabase Storage behavior inspected in prior design | MISSING CAPABILITY. | No reviewed module can perform transactional consume in the same Postgres transaction as `storage.objects` insertion. Implement the House-owned registry/RPC/trigger/policy from step 05 only. |
| BK01 migration rollback | Existing BK01 migrations and bootstrap rollback | NOT APPLICABLE (pure remediation exemption). | Add separate compensating rollback files outside frozen migrations, preserve current capability, and fail closed when migration-created data exists. No reusable House module applies. |
| Live-window operator runbook | H3D static checker and BK01 source chain | NOT APPLICABLE (operator documentation). | Runbook assembles exact source artifacts and copyable safe steps; it adds no runtime module. |

## Platform Boundary and Provenance Plan

- The issuer is House-owned. Product Auth credentials are separate per product and stored only as Cloudflare Worker secrets. Product requests cannot choose product, role, user ID, project ref, URL, or TTL.
- Persistent issuer state is in House-owned `wstera_platform_internal` and uses a dedicated House-only database adapter/identity with privileges limited to issuer tables/functions. It is not `service_role`, not a project signing key, and is never given to a product. Product runtime role privileges remain unchanged.
- The Storage grant registry is House-owned. BK01 interacts only through the House SECURITY DEFINER registration RPC granted to `bk01_runtime`; the storage policy/trigger reads House registry state, never BK01 schema. BK01 application wiring remains a follow-up.
- Copy `modules/rate-limit/` and `modules/audit-log/` from Module Hub commit `f9dee01ecb797baa634e0e2a6a1498fdfdd8df37` into the issuer package. Record each source version, immutable commit, copy date `2026-09-28`, destination path, and local changes in that package's `PROVENANCE.md`.
- Adapt only destination-owned copies. Do not modify Module Hub or add a runtime dependency on another repository.
- No production code is started before this artifact; no database connection/apply, hosted configuration change, secret creation, token issuance, or deployment is authorized here.
