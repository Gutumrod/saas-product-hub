# billing-core — Phase 0.5 Security Contracts

**Status:** Design, Commander-authored 2026-08-29, **revision 2 (2026-08-30)** reconciling the
independent review (`docs/platform/billing-core/REVIEW-PHASE-0-5-2026-08-29.md`, verdict CHANGES
REQUIRED). This is the reviewed specification Phase 1 builds against. It does not authorize code, a
Supabase change, a deployment, or a Stripe account.

**Revision 2 changes:** T7 replaced with a two-credential-path analysis and a **pre-data gate**
(remove hub-web's Project-A `postgres`-owner runtime URL); `/v1/*` auth restated as **product-wide
account reach** with an account-bound assertion required for `/v1/portal`; the webhook contract
replaced with explicit event state + a transactional `delivery_jobs` outbox; T8 corrected; T11–T20
added; §3.1 tooling locked to option (a); §7 exit criteria split from later-phase gates.

**Parent:** `BILLING_CORE_PLAN.md` §4 step 3 (Phase 0.5). Decisions it inherits: §10 D3 (billing_core
schema in Project A), D4 (PawSpace reached only via a Project B Edge Function ingress), D10 (no new
Supabase project, no Pro, schema isolation only), and the Phase 0 QA carry-forwards (durable
event-ID ledger; provider event ID mandatory).

**Scope of Phase 0.5:** the threat model, the `/v1/*` authentication and account-ownership contract,
the `billing_core` schema access model, the durable webhook intake contract, the vendor provenance
and pin policy, and the Worker `scheduled()` contract. No Stripe checkout work starts until this is
reviewed and, where it touches Project B, until PawSpace is admitted to Project B (blocked on
Booking Stage 4).

---

## 1. Trust boundaries and threat model

### 1.1 Components and what each holds

| Component | Holds | Never holds |
|---|---|---|
| **billing-core Worker** (Cloudflare) | `STRIPE_SECRET_KEY` (test-mode until go-live), `STRIPE_WEBHOOK_SECRET`, `BILLING_CORE_DATABASE_URL` (scoped role, `billing_core` schema only), `PAWSPACE_BILLING_INGRESS_KEY`, per-product `/v1` caller credentials | any Project A or Project B `service_role` key, `DATABASE_URL` for the whole project, any product's tenant data |
| **`billing_core` schema** (in Project A, `coyelzlgukvpgguqpjdi`) | `plans`, `subscriptions`, `payments`, `stripe_customers`, `processed_events`, `audit_events` | anything a product owns; PawSpace's `shop_subscriptions` stays authoritative in Project B |
| **PawSpace billing ingress** — Edge Function in **Project B** (`gyleqrjdzwwlqierdwcy`) | Project B `service_role` key (RLS-bypass, all Project B schemas), `PAWSPACE_BILLING_INGRESS_KEY` verifier | is never reachable except through billing-core's signed call; never returns the elevated key |
| **Stripe** | the source of truth for money state; sends webhooks to one public endpoint | — |
| **Product callers** (PawSpace app; later LK01, DC01) | their own `/v1` credential, their own end-user auth | billing-core's Stripe or DB credentials |

### 1.2 Boundaries

1. **Internet → billing-core.** `POST /webhooks/stripe` is the only public, unauthenticated route;
   the Stripe signature is its authentication. Every `/v1/*` route requires a caller credential.
2. **billing-core → Project A database.** Only through `BILLING_CORE_DATABASE_URL`, a Postgres role
   granted `USAGE` on `billing_core` and DML on its tables and nothing else — no `public`, no other
   schema, not `service_role`.
3. **billing-core → PawSpace.** Only a signed HTTPS call to the Project B ingress Edge Function.
   billing-core never opens a database connection to Project B and never holds a Project B key.
4. **billing-core → Stripe.** Outbound HTTPS with `STRIPE_SECRET_KEY`.
5. **hub-web and billing-core co-tenant Project A.** Different schemas. hub-web's publishable/anon
   key cannot see `billing_core` (not Data-API exposed). hub-web's Supabase `service_role` API
   client also cannot name `billing_core` through PostgREST while the schema is not in the exposed
   list — `service_role` bypasses RLS *inside a reachable schema*, it does not expand the reachable
   set. **But** hub-web's direct `DATABASE_URL` currently connects as the Project A `postgres` pooler
   identity (the database owner). That path can reach `billing_core` regardless of grants. See **T7**
   — it is a gate, not an accepted residual.

### 1.3 Threats and controls

| ID | Threat | Control |
|---|---|---|
| T1 | Forged Stripe webhook | Raw-body-first, verify `Stripe-Signature` against `STRIPE_WEBHOOK_SECRET` before any parse or state read. Invalid → `401`. |
| T2 | Webhook replay — same event twice, or an old event after a newer one | `billing_core.processed_events` with a `UNIQUE` constraint on the Stripe event ID **and an explicit `status` (`pending`/`processing`/`completed`/`failed`/`skipped`)**; the claim row and a `delivery_jobs` outbox row are created in **one transaction** (see §4). A duplicate delivery reads state: `completed`/`skipped` → `200 {duplicate:true, completed:true}`; `pending`/`processing`/retryable `failed` → ensure a due job exists, then `200 {duplicate:true, completed:false}`; cannot confirm durable retry responsibility → non-2xx so Stripe retries. Row *presence* alone never means "done". Distinct out-of-order events are T20. |
| T3 | Caller supplies an account ID it does not own on `/v1/checkout` | The caller credential maps to one product and billing-core rejects a body/path `product` that disagrees — but this is **product-granularity only, not account isolation** (T16). A leaked product credential can act on any account ID in that product. `/v1/checkout` additionally requires the server-derived idempotency rule of T13; account-bound proof (§2.3) is required for `/v1/portal` and recommended elsewhere. |
| T4 | One product's credential used to act on another product | Per-product credentials; every `/v1/*` route derives the product from the credential and rejects a path/body product that differs. Product-to-product is not a supported call shape. Credentials are environment- and audience-bound (T18). |
| T5 | billing-core Worker compromise | Attacker gets: the Stripe **test** key (bounded — no live money until go-live and the `sk_live_` boot guard), the `billing_core` schema data, the `/v1` caller credentials, and the ingress key. Attacker does **not** get any Project B key. Attacker **can** send signed ingress commands to PawSpace — but only the narrow validated transitions the function allows, inside its replay window. Blast radius is billing state + bounded PawSpace subscription transitions, not tenant data. |
| T6 | `PAWSPACE_BILLING_INGRESS_KEY` compromise | Short clock window + one-time nonce, key ID with current/previous overlap for rotation then proven rejection of the old key, the function validates every product/shop/event/transition field, and the function's grants + fixed `search_path` pin it to the `pawspace` schema so it cannot touch `local_service` even with the elevated key. Also T17 (skew) and T18 (env/audience binding). |
| T7 | **hub-web's runtime credentials reach `billing_core`** — two paths, treated separately | **Not an accepted residual — a pre-data gate.** (a) hub-web's Supabase `service_role` API client: blocked *today* because `billing_core`/`billing_core_staging` are not in Project A's Data-API exposed-schema list — `service_role` bypasses RLS but not the exposed-schema config. The apply gate must verify the exposed list and audit exposed `SECURITY DEFINER` functions, not just table grants. (b) hub-web's direct `DATABASE_URL`: currently the Project A **`postgres` owner** identity — a hub-web runtime compromise on this path is a database-owner compromise and can read `billing_core` and re-grant access regardless of `REVOKE`/`GRANT`. **Required before any billing data exists in Project A:** hub-web's application runtime moves to a dedicated `hub_web_app` login role scoped to exactly the `public` objects it uses (no ownership, no `CREATE`, no role membership that escalates), the owner URL stays out of the app runtime, and denial tests prove `hub_web_app` cannot use either billing schema. Tracked as master-plan **R15** and its own hub-web hardening task. The genuinely irreducible same-project residual is then narrow: trusted Project A owners/administrators, the control plane, backups, a project-wide DB compromise, and a Project-A outage — the CEO may accept those (same class as D3); the CEO must **not** silently accept the avoidable owner-URL-in-runtime. Application-layer envelope encryption (key held only by billing-core) can further reduce admin/backup snapshot disclosure of specific sensitive fields; store Stripe identifiers instead of PII where possible. |
| T8 | Oversized or malformed webhook body | Strict max body size (**64 KB**) enforced before parsing; over → `413`. Malformed JSON **after** a valid signature is possible — truncated or replayed test fixtures, validly-signed non-JSON bytes, an integration bug — and returns a bounded `400` (or a recorded `200` only under an explicitly approved provider-retry policy), never treated as impossible. Invalid signature → `401`. |
| T9 | DoS on the public webhook | Body-size cap, signature-first cost (no DB touch before verify), global and per-route concurrency limits, and provider-aware limits. Rate limiting must **not** trust source IP alone and must not suppress legitimate Stripe retries. A processing queue so a burst cannot exhaust DB connections. |
| T10 | Provider event with no event ID | Stripe normally supplies one, so a missing ID is an intentional terminal `skipped` outcome — separately alerted, an `audit_events` row written with a synthetic correlation ID (never a synthesized Stripe event ID), no state transition. Returning `200` here prevents provider retry, which is acceptable only because Stripe does not retry ID-less events; if that assumption ever changes, revisit. |
| T11 | **SSRF via a caller-controlled URL** — checkout/portal return URLs or any downstream URL from a caller | Return destinations resolve from an allowlisted per-product/per-environment config, not a request field. Require HTTPS in production; reject userinfo, fragments, IP literals, `localhost`/private/link-local ranges, non-default ports unless approved; validate every redirect hop. Stripe base URL and the PawSpace ingress URL are configuration constants. |
| T12 | **Stripe secret exfiltration** — a generic HTTP helper, verbose error, request dump, crash report, or SSRF leaks `STRIPE_SECRET_KEY` or a signed `Authorization` header | Dedicated Stripe client with a fixed origin; never forward caller headers; redact `Authorization`, cookies, signatures, secrets, connection URLs and Stripe client-secret values at every logger/telemetry sink; no request/body dumps; egress allowlist where the platform permits; rotation + incident runbook. |
| T13 | **Checkout idempotency-key collision / attacker-chosen key reuse** | The idempotency key is **server-derived** from environment + credential/product + account + operation + an immutable logical checkout-attempt ID — never caller-supplied. Store the request fingerprint and result under a unique constraint; same key + different fingerprint → `409`, never the old response. The Stripe idempotency key is scoped identically. |
| T14 | **PII / secret leakage in audit, event payload, metrics** | Store an allowlisted audit projection only — never raw credentials, signatures, secret-bearing URLs, full Stripe payloads, email/address/card data, or connection strings. Pseudonymize account references where operator usability allows. Define retention/deletion for any retained retry payload; ledger/audit rows stay append-oriented. |
| T15 | **Timing oracle in bearer/HMAC/nonce comparisons** | Decode/normalize to fixed-length bytes, constant-time compare; reject malformed length before comparison without revealing which credential/key ID matched; keep auth errors uniform. |
| T16 | **A leaked product credential has product-wide account reach** | Treat the caller as a privileged product backend. The mitigation is an audience-bound, short-lived, account-bound signed assertion (§2.3) — per-product rate limits and fast revocation are necessary but do not create account isolation. Until assertions exist, `/v1/portal` and account-reading GET routes are disabled for any integration that cannot supply account binding. |
| T17 | **Clock skew / replay-window failure on the signed ingress** | Verify `issued_at` and `expires_at`, cap lifetime, allow a small documented skew, consume a unique nonce atomically until after expiry, monitor skew, return an attacker-safe but operator-visible rejection category, test both future and stale boundaries. Idempotency stays mandatory inside the window. |
| T18 | **Credential / config substitution across environment or audience** | Bind every credential and assertion to environment, service audience, HTTP method and route/action. Key IDs carry an environment prefix; current/previous overlap is time-bounded; prove old/staging rejection after rotation. |
| T19 | **Unbounded queue retry / poison events** | Exponential backoff with jitter, bounded `max_attempts`, `next_attempt_at`, worker leases, a `failed`/dead-letter state, alerting, and an operator-safe requeue path. Per-`(product, account_id)` serialization where transitions are order-sensitive. |
| T20 | **Out-of-order but distinct Stripe events** — event-ID uniqueness stops replay, not an older distinct event overwriting newer state | Compare the Stripe object/version timestamp with the current snapshot (`provider_state_updated_at`), define monotonic transition rules, reconcile from Stripe before applying an ambiguous regression, and record an ignored stale event as `skipped` with reason. |

---

## 2. `/v1/*` authentication and account-ownership contract

### 2.1 Caller credentials

- Each consuming product (PawSpace now; LK01, DC01 later) is issued **one billing-core caller
  credential** — a bearer secret, per environment, stored in the central vault and the product's
  Worker secret store, mapped server-side by billing-core to exactly one product code.
- billing-core keeps the mapping in `billing_core` config, not in caller-supplied data.
- Rotation supports a current and a previous credential per product for a bounded overlap.

### 2.2 Per-route rules

| Route | Auth | Ownership check |
|---|---|---|
| `POST /v1/checkout` | caller credential + product match | server-derived idempotency key + request fingerprint under a unique constraint (T13); DB lock/reservation before the Stripe Customer call so a concurrent retry cannot create a duplicate Customer; account-bound assertion **recommended**; return URL from allowlisted config only (T11) |
| `POST /v1/portal` | caller credential + product match + **account-bound assertion required** | a valid Stripe Billing Portal session exposes payment-method, cancellation, invoice and subscription-management actions — the bearer credential alone is insufficient. The product issues a fresh assertion (issuer/product, exact account, billing-core audience, route/action, environment, issued/expiry, one-time nonce; asymmetric or a separate per-product HMAC key) only after authenticating and authorizing the end-user. Portal sessions are short-lived, use a server-selected allowlisted return URL, and are rate-limited per credential **and** per account |
| `GET /v1/subscriptions/:product/:accountId` | caller credential + product match | `:product` must equal the credential's product; cross-product → `403`. Without an account-bound assertion this route grants **product-wide** subscription-state read; enabling it for a product is an explicit product-wide-data-access acceptance |
| `GET /v1/entitlements/:product/:accountId/:key` | caller credential + product match | same product-wide-read caveat |
| `POST /webhooks/stripe` | **no caller credential** | Stripe signature only; see §4 |

- Every credential comparison is constant-time (T15); credentials are environment- and
  audience-bound (T18); per-route scopes, bounded rotation overlap, replay protection for mutations,
  per-credential and per-account rate limits, audit correlation, and immediate revocation are
  required.
- Request authentication is tested **independently of Stripe success** — an unauthenticated,
  wrong-product, or (for portal) unasserted call fails before any Stripe call.
- PawSpace reads its own subscription state from its own `pawspace` schema; it does **not** call
  `GET /v1/subscriptions` for its own status. Those routes serve LK01/DC01's pull model.

### 2.3 Account ownership — product-granularity is not account isolation

billing-core has no view of any product's tenant tables. The credential-to-product binding prevents
**cross-product** use but provides **no same-product account isolation**: a leaked PawSpace
credential can submit or query every known or guessed PawSpace shop ID — create checkout attempts,
read subscription/entitlement state, and (without §2.2's portal control) open a portal session for
any account with a `stripe_customers` mapping. The design calls this **product-wide account reach**
and never claims tenant- or account-bounded behaviour without an account-bound assertion.

This contradicts `BILLING_CORE_PLAN.md`'s stronger statement that "a caller-supplied account ID it
does not own" is rejected. The reconciliation: that stronger guarantee holds **only** where an
account-bound assertion (§2.2) is presented. For routes without one, billing-core requires an
explicit CEO product-wide-data-access acceptance per product, recorded, and every "account-bounded"
phrasing is removed from that route's description. `/v1/portal` never runs without the assertion.

---

## 3. `billing_core` schema access model

- Schema `billing_core` in Project A. **Not** listed in the Data API `exposed_schemas` — no
  PostgREST path, no browser reach.
- Postgres role `billing_core_app`: `GRANT USAGE ON SCHEMA billing_core`, `GRANT SELECT, INSERT,
  UPDATE ON` the named tables (no `DELETE` on `processed_events` / `audit_events`), nothing on
  `public` or any other schema. `BILLING_CORE_DATABASE_URL` connects as this role.
- Every migration: `REVOKE ALL ON SCHEMA billing_core FROM PUBLIC, anon, authenticated;` then
  explicit `GRANT` to `billing_core_app`; fixed `search_path` on any function; idempotency
  constraints declared in-migration; `supabase db advisors --type security` clean before release.
- Staging: schema `billing_core_staging`, role `billing_core_staging_app`, identical pattern. Same
  project (§10 D10 — no branch DB). The restore rehearsal (P-1 condition 4) targets
  `billing_core_staging` and must demonstrate RPO ≤ 1 h for the schema.
- `postgres` (the DB owner) and any role with `service_role`/owner membership still reach the schema
  structurally — grants do not constrain an owner. The mitigation is **not** a grant; it is keeping
  owner-level connection strings out of application runtimes (T7 pre-data gate) and, for Project A's
  Data API, keeping `billing_core*` out of the exposed-schema list. The apply runbook verifies both.
- `billing_core_app` must **not** own its schema or tables and must **not** hold `CREATE` on the
  schema — the migration owner retains ownership, otherwise the table grants are not a real boundary.

### 3.1 Migration ownership and tooling — LOCKED to option (a)

Project A has **one migration owner** at the process level: one person/role serializes hub-web's
Drizzle `public`-schema migrations and billing-core's raw SQL, and records one database change log.
"Separate file chain" must not become competing owners.

Reality: `apps/hub-web` manages Project A's `public` schema with **Drizzle** (`apps/hub-web/drizzle/schema.ts`,
`drizzle-kit generate && drizzle-kit migrate`), not Supabase CLI migrations. `billing_core` needs a
dedicated schema, roles, `REVOKE`/`GRANT` and fixed `search_path` — none of which Drizzle's DSL
expresses.

**Decision (review-confirmed): option (a) — raw SQL, owner-applied.** Evidence from the review: the
installed `drizzle-kit` is **0.31.10** (not the `^0.31.4` floor); its `generate` path is
snapshot/schema-file based with the PostgreSQL `schemaFilter` defaulting to `['public']` and
`generatePgSnapshot` excluding schemas outside that filter; its `migrate` path reads
`meta/_journal.json` and executes only pending migration SQL in a transaction and does not introspect
unrelated schemas. Neither discovers or drops an unmodelled private schema. `drizzle-kit push` is a
separate live-introspection path and stays **prohibited** against Project A.

Controls: files live under `docs/platform/billing-core/migrations/` with an explicit apply
ledger/runbook and are never added to hub-web's Drizzle journal; a CI/static guard rejects
`billing_core*` references in generated hub-web migration SQL unless the ownership decision is
deliberately changed; every `billing_core` migration carries its own `REVOKE`/`GRANT`, fixed
`search_path`, and `supabase db advisors` evidence and is reviewed before apply.

**Re-review triggers:** a Drizzle Kit upgrade, a `drizzle.config.ts` `schemaFilter` change, the
introduction of `pgSchema` in hub-web, or any use of `drizzle-kit push`.

Option (b) (model `billing_core` in Drizzle) makes hub-web the owner of a service schema it does not
run, still needs companion SQL for roles/grants, and adds coupling for no security benefit —
rejected. Option (c) (a second Supabase CLI migration chain over the same database) — rejected. A
one-shot `supabase db query --file` is the *transport* for option (a), not a migration chain.

---

## 4. Durable webhook intake contract — transactional outbox

A remote call (the PawSpace ingress) **cannot** participate atomically in a PostgreSQL transaction,
and holding a transaction open across it is unsafe. The contract is a transactional outbox: intake
commits a durable claim plus a delivery job, and a separate worker performs the transition.

**Intake (synchronous, `routes/webhook.ts`):**

1. Read the raw body; enforce the 64 KB cap → `413` if over.
2. Verify `Stripe-Signature` against `STRIPE_WEBHOOK_SECRET` → `401` if invalid.
3. Parse. Missing `event.id` → T10 `skipped` outcome (alerted audit row, no state), `200`.
4. Read `metadata.product` / `metadata.account_id`. Unknown/absent `product` → `skipped` audit row,
   `200`, no guess.
5. **One transaction:**
   - `INSERT INTO billing_core.processed_events (stripe_event_id, event_type, product, account_id,
     status='pending', ...) ON CONFLICT (stripe_event_id) DO NOTHING`.
   - If a row was inserted: also `INSERT` one `billing_core.delivery_jobs` row (`processed_event_id`,
     `destination`, `action`, a minimal **redacted canonical** `payload`, `status='pending'`,
     `next_attempt_at=now()`). For a billing-core-local transition (LK01/DC01 snapshot) the state
     write and `processed_events.status='completed'` may instead happen in this same transaction.
   - Commit.
6. **Duplicate (0 rows inserted at step 5)** — read `processed_events.status`:
   - `completed` / `skipped` → `200 {duplicate:true, completed:true}`.
   - `pending` / a live-or-expired `processing` / retryable `failed` → make sure a due `delivery_jobs`
     row exists (reawaken it), then `200 {duplicate:true, completed:false}` — *only* because durable
     retry responsibility is now proven.
   - cannot persist or verify that retry responsibility → **non-2xx**, so Stripe retries.
7. `200` is safe only after **durable intake AND a durable delivery obligation** — never on row
   presence alone. A purely synchronous implementation may return non-2xx on downstream failure when
   no durable job exists.

**Delivery (asynchronous worker, also run from `scheduled()` and a manual CLI):**

- Lease due jobs with `SELECT ... FOR UPDATE SKIP LOCKED`, set `status='processing'` + `lease_owner`
  + `lease_expires_at`.
- Call the idempotent downstream target: PawSpace → the signed replay-bounded Project B ingress
  (RPC idempotency UUID = UUIDv5(fixed namespace, `event.id`)); LK01/DC01 → the local snapshot write
  with T20 monotonic-transition rules.
- On success: `delivery_jobs.status='completed'`, `processed_events.status='completed'`,
  `completed_at=now()`.
- On a retryable failure: `attempt_count++`, `next_attempt_at = now() + backoff(attempt)` with
  jitter, release the lease. On `attempt_count >= max_attempts` or a permanent error:
  `status='failed'`, alert, leave for a deliberate operator requeue.
- An expired lease makes an abandoned `processing` job due again.
- Per-`(product, account_id)` serialization where transitions are order-sensitive (T19/T20).

**Audit:** every outcome (`verified` / `replay` / `invalid-signature` / `routed` / `skipped` /
`rpc-rejected` / `retry` / `failed`) writes one redacted `billing_core.audit_events` row —
allowlisted projection only (T14), correlation ID, product, pseudonymized account reference,
attempt, latency. A duplicate delivery writes a `replay` audit row; it does **not** re-run the
business transition.

**Reconciler (§6):** compares aggregate `billing_core` state with Stripe and repairs
missed/out-of-order truth. It is a secondary safety net — it cannot deliver every individual
transition, preserve audit causality, or discover a portal/notification side effect.

---

## 5. Vendor provenance and pin policy

- `services/billing-core/vendor/modules/` holds copies of `payment`, `subscription`,
  `webhook-receiver`, `audit-log` from `modules-hub`.
- `services/billing-core/vendor/PROVENANCE.md` records, per module: source repo
  (`github.com/Gutumrod/modules-hub`), the pinned commit hash, the date, the reviewer, and the
  `git log --oneline <pin>` of what is included.
- **The pin is `modules-hub` `main` `3b6401a28e6f7e69b383277a200fca1986f49ede`** — the squash-merge
  of PR #12 (Phase 0 item 1), 2026-08-29. The rejected implementation `c8fef32` must never be a pin.
- A billing-core CI stage `vendor-drift`: fetch `modules-hub` at the pinned hash, diff against
  `vendor/modules/`, fail on any difference. No silent local edits to vendored code.
- Updating the pin is a deliberate PR: bump `PROVENANCE.md`, re-copy at the new hash, re-run the
  full billing-core suite, review. Never an incidental change.
- `products/stripe-billing/modules/*` is historical and is not a copy source (it has drifted — see
  `BILLING_CORE_PLAN.md` §2).

---

## 6. Worker `scheduled()` contract

- `wrangler.jsonc` cron trigger, every 15 minutes → `scheduled(event, env, ctx)`.
- The handler runs three idempotent jobs:
  1. **Own grace sweep:** `UPDATE billing_core.subscriptions SET status='expired' WHERE
     status='grace_period' AND grace_period_end < now()`. Running twice is a no-op.
  2. **PawSpace expire:** enqueue one `delivery_jobs` row (`destination='pawspace-ingress'`,
     `action='expire_due'`) and let the delivery worker send the signed, replay-bounded command to
     the Project B ingress; the Edge Function selects and advances only eligible `pawspace` rows
     inside its own project. billing-core never queries PawSpace directly and never blocks the cron
     tick on the remote call.
  3. **Stripe reconciler:** for subscriptions changed in a recent window, compare local state with
     Stripe's `customer.subscription` object; on drift, enqueue a correction and alert.
- Each job is a plain exported function, also invoked by tests and a manual operator CLI.
- **No public `/internal/cron/*` HTTP route.** The only public route is `/webhooks/stripe`.
- Alert on: a sweep that throws, a reconciler that finds drift, an ingress `expire_due` rejection.

---

## 7. Gates

### 7.1 This Phase-0.5 review cycle — DONE (2026-08-30)

- [x] Design doc written (`this file`, rev 1).
- [x] Independent review (`REVIEW-PHASE-0-5-2026-08-29.md`, verdict CHANGES REQUIRED) — Codex,
      adversarial, evidence-backed.
- [x] Draft schema migration (`migrations/0001_billing_core_schema.sql`) + apply runbook
      (`APPLY-RUNBOOK.md`) — DRAFT, nothing applied.
- [x] Commander reconciled the five required changes into this doc (rev 2): T7 two-path + pre-data
      gate, product-wide account reach + portal assertion, transactional outbox, T8 correction,
      T11–T20, tooling option (a) locked.
- [ ] Draft SQL gets an independent QA pass (Qwen) before it enters the apply queue — **not urgent;
      apply is a Phase-1-adjacent step.**

### 7.2 Later-phase gates (NOT exit criteria for this cycle)

These belong to Phase 1 / the apply window, not to accepting the contracts:

- **R15 pre-data gate:** hub-web's application runtime no longer uses the Project A `postgres` owner
  `DATABASE_URL`; a `hub_web_app` scoped role exists and denial tests prove it cannot use either
  billing schema. Must be true **before any billing data exists in Project A**.
- The `0001` migration is applied by the Project A migration owner per `APPLY-RUNBOOK.md`, passes
  `supabase db advisors --type security`, and every verification query in the runbook returns the
  expected result (roles, grants, cross-schema denial, Data-API exposed-list, prod/staging catalog
  equivalence).
- `/v1/*` authentication + the account-bound assertion for `/v1/portal` are implemented and tested
  independently of Stripe.
- The Project B ingress Edge Function is implemented and its adversarial tests pass **(blocked until
  PawSpace is admitted to Project B — Booking Stage 4)**.
- `services/billing-core/vendor/PROVENANCE.md` + the `vendor-drift` CI stage exist, pin = `3b6401a`.
- The `scheduled()` contract and its jobs are implemented with idempotency tests.
- Retention/partitioning/archival authority defined for `processed_events`, `delivery_jobs`,
  `audit_events` before production volume; a catalog-diff gate runs on every later `billing_core`
  migration and every restore rehearsal to prove prod/staging stay equivalent.

Phase 1 (build the skeleton, wire PawSpace end to end) starts only after 7.1 is accepted; the 7.2
gates are then closed within Phase 1 in dependency order.
