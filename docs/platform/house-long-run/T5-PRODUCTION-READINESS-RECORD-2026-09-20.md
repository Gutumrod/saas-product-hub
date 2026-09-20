# PRODUCTION READINESS RECORD — WSTERA-HOUSE-PRODUCTION-CLOSURE-001 (T5)

Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001` · Stage **T5** · Review Batch **B5**
Standard: `Gutumrod/wstera-workflows:policies/PRODUCTION-READINESS-STANDARD.md` v1.0.0 (ACTIVE/LOCKED)
Recorded: 2026-09-20 (Asia/Bangkok) · Orchestrator: Hermes

**Candidate revision (to be frozen before any mutation):** hub-web
`381fef3f639f1b6da225c217ce6ddd3e0f29cd61` on `work/house-platform-closure-20260919`
Coordination revision: `Gutumrod/saas-product-hub` `work/house-production-closure-longrun-20260919`

**Current production state claim: `BUILD_PASS` at most.** Per the standard,
`BUILD_PASS != PRODUCTION_READY != LIVE_PROVEN != OPERATED_STABLE`. Nothing below authorises a
production claim until the corresponding evidence exists.

---

## G1 — Contract / Ownership

| Item | State | Evidence |
|---|---|---|
| Hub/Control/SB01 boundaries | Defined | Master Plan §10 D2/D3; `OWNER-DIRECTIVE-BILLING-AUTHORITY-BOUNDARY-2026-09-11.md`; T4 dependency gate |
| Authority direction | One-way | `Control -> SB01 approved read projection -> SB01/provider truth`; T4 transport is GET-only with no provider SDK |
| Operational owner | Owner = Free (WSTERA) | Manifest Owner field; Owner is final closure authority |
| Escalation / kill switch | **GAP** | No documented kill switch or escalation path exists for the Control read path. T5-WU01 must record one or explicitly mark N/A with evidence. |
| Authority boundaries | Preserved | `canExecutePaymentActions: false` invariant verified on every path in T4 (`billing-core-adapter.ts`, router, transport) |

## G2 — Functional

| Item | State | Evidence |
|---|---|---|
| Full relevant tests | **PASS (recorded)** | `npx vitest run` → 23 files / 347 tests passing at `381fef3`, run by Hermes in the project workspace |
| Negative auth/role/tenant tests | **PASS** | T4 transport suite: missing/unknown accountId, unresolvable productCode, no-enumeration, account assertion binding, unknown providerStatus rejection |
| Negative event tests | **PASS** | T2 signer suite: wrong-signer, wrong-product, tamper, replay, version mismatch, over-limit, rate limit |
| Negative fulfillment tests | **PASS** | T3 suite: partial revoke/reissue completion, duplicate suppression, failure durability, exactly-one-audit |
| Known regression cases | **PASS** | Baseline preserved at every stage: 174 → 213 → 277 → 326 → 333 → 345 → 347, no test removed |
| **Live transport never exercised** | **GAP (live)** | The SB01 read transport has not run against a running Billing Core. This is a T5-WU06 live-proof item. |

## G3 — Failure / Recovery

| Item | State | Evidence |
|---|---|---|
| Provider/unavailable projection | **PASS (unit)** | T4: connection_failed / timeout (injectable) / http_error (503 retryable) / malformed_response / contract_violation / invalid_request, each typed and distinguishable |
| Degraded fail-closed visibility | **PASS (unit)** | Readiness moves to degraded with `canRead: false`; router returns `{ readiness, snapshot: null, error }` so an operator sees why, never an empty panel or an unhandled 500 |
| Duplicate/retry | **PASS** | T3 idempotency controls; T4 rate/replay handling |
| DB/auth/network failure | **PASS (unit) / live untested** | Source-contract covered; live behaviour is a T5-WU06 item |
| Rollback/recovery | **GAP** | No recorded rollback target/procedure for this candidate yet. Required before any mutation. |
| Deploy rollback | **GAP** | Cloudflare version rollback exists in principle (deployments list shows prior versions) but the exact rollback target has not been recorded. |

## G4 — Data / Integrity

| Item | State | Evidence |
|---|---|---|
| Migration/version/idempotency | **PASS (source)** | T3 migration `0007_shared_one_time_fulfillment.sql`; unique indexes declared in schema and pinned by mutation-probed tests |
| R15 privilege state | **PREPARED, NOT APPLIED** | T1 produced the R15 package (matrix, deny matrix, deploy/rollback plan). Per the manifest, the role/grant apply is a T5-WU05 controlled operation after B5 approval. `hub_web_app` is NOT yet live. |
| Fulfillment durable state | **PASS (unit)** | T3: durable FAILED state, resumable partial operations, received-version audit |
| Control no local financial truth | **PASS** | T4 reviewer confirmed no local authoritative billing state; Control reads a projection and stores nothing authoritative |

## G5 — Security

| Item | State | Evidence |
|---|---|---|
| R15 | **OPEN until applied** | Package approved at B1; apply is T5-WU05. Owner's `public.profiles` exclusion ruling applied to the package. |
| Signer binding | **PASS** | T2 per-product signer identity; wrong-product impersonation impossible; verified at B2 |
| Auth/RBAC | **PASS** | Router uses `wsteraInternalProcedure`; T4 strict input schema; account assertion bound to product/environment/account/operation_id/action |
| Secret scan | **PASS** | Canonical Relay scanner: 0 findings across every changed file at every stage |
| Dependency audit | **GAP** | `npm audit` result not yet recorded for this candidate. T5-WU02 item. |
| HTTP→HTTPS | **FAIL (measured today)** | `http://wstera.com` and `http://platform.wstera.com` both return **HTTP 200 with no redirect**. Measured 2026-09-20. This is a real hardening gap. |
| Security headers | **FAIL (measured today)** | HTTPS response carries no `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options` or CSP. Only Cloudflare defaults (`CF-Cache-Status`, `Report-To`, `Nel`, `alt-svc`) are present. |
| No billing mutation | **PASS** | T4: GET-only, no checkout/portal, no subscription/payment/customer mutation, no entitlement write |

## G6 — Observability / Auditability

| Item | State | Evidence |
|---|---|---|
| Request/run/event identifiers | **PARTIAL** | Agent Relay emits bounded lifecycle activity; fulfillment audit records operation keys; Control request correlation for the new router is **not** evidenced. |
| Actionable health/alerts | **GAP** | `/health` returns 200 on `platform.wstera.com`, but there is no evidenced alerting or readiness surfacing for the Billing Core read path beyond the router's readiness field. |
| Fulfillment + Control read auditability | **PASS (unit)** | T3 audit trail includes immutable version + recipient digest; T4 read is attributable to the SB01 projection |
| Deploy/version traceability | **PARTIAL** | `wrangler deployments list` works and shows prior versions; the exact deployed artifact identity for this candidate will be recorded at T5-WU05/WU06 |

## G7 — SLO / Capacity / Cost / Limits

| Item | State | Note |
|---|---|---|
| Existing locked House targets | **N/A WITH EVIDENCE** | No locked House SLO target exists in the Master Plan for this capability; the standard forbids inventing a universal target |
| Provider/rate/storage limits | **RECORDED** | T2 per-signer rate limit; T3 body-size bound; T4 transport timeout (injectable), 503-only retryable classification |
| Cost | **N/A WITH EVIDENCE** | No new paid service introduced; deployment targets existing Cloudflare account (verified authenticated) |

## G8 — Change / Regression

| Item | State |
|---|---|
| Exact candidate | hub-web `381fef3` (to be frozen at T5-WU05) |
| Dependency/runtime/config changes | T2 added signer-registry env keys (`PRODUCT_EVENT_SIGNERS`, bounds); T4 added `BILLING_CORE_CONTROL_READ_BASE_URL` + `BILLING_CORE_CONTROL_READ_CREDENTIALS`. **Production currently has none of these configured** — see the live-config gap below. |
| Invalidated evidence rerun | Every stage reran the full suite; counts recorded per stage |

**Live configuration gap (material):** the deployed Worker currently has no `PRODUCT_EVENT_SIGNERS`
and no Billing Core read credentials. Both new paths therefore resolve to their **fail-closed**
states in production: the T2 webhook rejects (no signer registry) and the T4 adapter returns
`UnconfiguredBillingCoreAdapter`. That is *safe* but means the new capability is **inert** until
configuration is delivered. Config delivery is a T5 item and must be verified without printing values.

## G9 — Operations / Incident

| Item | State |
|---|---|
| Runbook | **GAP** — not yet written for the Control read path / fulfillment capability |
| Health/readiness | `/health` 200 observed; Billing Core readiness surfaces through the router |
| Rollback | **GAP** — target/procedure not yet recorded (also G3) |
| Owner/contact | Owner = Free (WSTERA) |
| Known limits | Enumerated in this record and in the T3/T4 closures; SB01's five accepted disclosures are carried below |

## G10 — Outcome / Live Acceptance

| Item | State |
|---|---|
| Owner can use the platform/control shared capability as declared | **NOT YET PROVEN** — requires T5-WU06 live smoke after deploy |
| Product-specific business outcomes | **N/A WITH EVIDENCE** — this task closes shared House/platform capability only; MT01/CM01/HC01 product work remains theirs |

---

## Carried-in limitations that must be dispositioned (not dropped)

From SB01 LR-2F-A acceptance:
1. some DB qualification evidence carries older revision provenance;
2. some real-Postgres suites were not part of the final revision-bound independent run;
3. migration ledger provenance for `0002_multi_product_billing_runtime` is absent;
4. a dead `UNKNOWN_PRODUCT` branch/comment remains cosmetic;
5. the Control repository advanced independently during SB01 work.

From T3/T4:
6. the live SB01 transport has never been exercised against a running Billing Core;
7. test files are outside every typecheck gate (`tsconfig.json` excludes `**/*.test.ts`);
8. B3 non-blocking: proof-7's mutation probe remains tautological;
9. B3 non-blocking: the boundary scanner's vocabulary is limited, so "no provider SDK" is
   static-review dependent rather than exhaustively proven;
10. B4 non-blocking: the reviewer sandbox cannot execute vitest (`spawn EPERM`), so test counts rest on
    the Hermes run.

## Gap summary (what T5 must close before any production claim)

**Must close before mutation:** rollback target + procedure; exact candidate freeze; build-time config
delivery verification without printing secrets; dependency audit.
**Must close for a `PRODUCTION_READY` claim:** HTTP→HTTPS enforcement; security headers; runbook;
kill-switch/escalation record; Control request correlation.
**Must close for `LIVE_PROVEN`:** T5-WU06 live smoke across apex/platform, redirects, health,
fail-closed unauth behaviour, Owner login surfaces, Control Billing read truthful/degraded behaviour,
product-event negative auth, and a synthetic fulfillment path.

No production mutation may occur before the B5 pre-deploy independent review approves this exact
candidate and evidence set.
