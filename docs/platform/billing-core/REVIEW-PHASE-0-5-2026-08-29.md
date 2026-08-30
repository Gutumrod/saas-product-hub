# Independent review — billing-core Phase 0.5 security contracts

**Review date:** 2026-08-30

**Reviewed document:** `docs/platform/BILLING_CORE_PHASE_0_5_SECURITY_CONTRACTS.md`

**Companion plan:** `docs/platform/BILLING_CORE_PLAN.md`

**Verdict:** **CHANGES REQUIRED before the security contracts can be accepted.** The overall
placement and scoped-runtime-role design remain viable, but T7, `/v1/*` authorization, and webhook
completion semantics materially overstate their current safety. This review does not apply a
migration or authorize Phase 1.

## Executive findings

1. **T7 conflates two different hub-web credentials.** The Supabase service-role client is bounded
   by PostgREST's configured exposed schemas, even though it bypasses RLS inside a reachable schema.
   It cannot name a non-exposed `billing_core` schema through the Data API. The direct
   `DATABASE_URL`, however, currently identifies the Project A `postgres` login through the Supabase
   pooler. A hub-web runtime compromise that can read/use that URL is therefore a database-owner
   compromise and can reach or re-grant access to `billing_core` regardless of its table grants.
2. **A product credential is product-bounded, not account-bounded.** A stolen credential can read or
   act on arbitrary account IDs within that product. `/v1/portal` makes this especially serious:
   the attacker can create a management session for any mapped Stripe customer in the product.
3. **The presence-only event ledger is unsafe.** A crash after intake but before downstream
   completion makes a retry look completed. `processed_events` needs explicit state and a
   transactionally-created delivery job; a reconciler is secondary repair, not the primary delivery
   guarantee.
4. **Tooling option (a), separately owned raw SQL, is recommended.** The actually installed
   `drizzle-kit` is 0.31.10. Its `generate` path is snapshot/schema-file based and defaults schema
   filtering to `public`; its `migrate` path reads the migration journal and SQL files and executes
   pending statements. Neither path discovers and drops an unmodelled private schema. `push` is a
   separate live-introspection path and remains prohibited for this coexistence contract.

## Evidence inspected

- `apps/hub-web/package.json` declares `drizzle-kit ^0.31.4`; both
  `apps/hub-web/pnpm-lock.yaml` and installed package metadata resolve **0.31.10**.
- The existing local binary reported `drizzle-kit v0.31.10` and `drizzle-orm v0.44.7`. Only
  `--version` and `generate --help` / `migrate --help` were run; no generate, migrate, push,
  installation, or dependency resolution was run.
- Installed `drizzle-kit/bin.cjs` defines the common PostgreSQL `schemaFilter` default as
  `['public']` and `generatePgSnapshot` excludes schemas outside that filter. The generate command
  requires schema files and produces a snapshot/diff; it does not require database credentials.
- Installed `drizzle-orm/migrator.js` reads only `meta/_journal.json` and the referenced SQL files.
  Installed `drizzle-orm/pg-core/dialect.js` creates/reads the Drizzle journal table and executes
  only pending migration SQL in a transaction. It does not introspect unrelated schemas.
- `apps/hub-web/drizzle.config.ts` models only `apps/hub-web/drizzle/schema.ts` and does not expand
  `schemaFilter` beyond its default.
- `apps/hub-web/server/_core/supabaseAdmin.ts` creates a server-side Supabase client with
  `SUPABASE_SERVICE_ROLE_KEY`. `apps/hub-web/server/db.ts` separately passes `DATABASE_URL` to
  postgres-js. Secret-safe inspection of the current local URL showed the username
  `postgres.coyelzlgukvpgguqpjdi`, i.e. the Project A `postgres` pooler identity; no secret value was
  printed or recorded.
- The installed Supabase CLI reported **2.101.0**. `supabase db query --help` confirms
  `--file`, `--db-url`, and `--linked`; `db advisors --help` confirms `--type security` and
  `--fail-on`. `psql` is not installed locally, so the draft received manual/static review rather
  than a live PostgreSQL parse.

## 1. Threat-model review

The original T1–T10 set is incomplete. Add at least the following threats and controls.

| ID | Missing or understated threat | Required control |
|---|---|---|
| T11 | **SSRF through a caller-controlled URL.** Any checkout return URL, portal return URL, webhook destination, or downstream URL accepted from a caller can target internal services or leak data via redirects. | Do not accept arbitrary destinations. Resolve return destinations from an allowlisted product/environment configuration; require HTTPS in production; reject userinfo, fragments, IP literals, localhost/private/link-local ranges, non-default ports unless explicitly approved, and validate every redirect hop. PawSpace ingress and Stripe base URLs are configuration constants, never request fields. |
| T12 | **Stripe secret exfiltration.** A generic HTTP helper, verbose error, request dump, crash report, dependency instrumentation, or SSRF can expose `STRIPE_SECRET_KEY` or signed Authorization headers. | Use a dedicated Stripe client with a fixed origin; never forward caller headers; redact Authorization, cookies, signatures, secrets, connection URLs and Stripe client-secret values at logger and telemetry sinks; prohibit request/body dumps; keep egress allowlisted where the platform permits; rotation and incident runbook required. |
| T13 | **Checkout idempotency-key collision or attacker-chosen key reuse.** A global/caller-controlled key could return another account's Stripe object or bind a retry to changed parameters. | Derive a server-side key from environment, credential/product, account, operation and an immutable logical checkout-attempt ID; store the request fingerprint and result under a unique constraint; same key + different fingerprint returns `409`, never the old response. Scope Stripe idempotency keys identically. |
| T14 | **PII/secret leakage in audit, event payload, and metrics.** Stripe events and portal/checkout responses can contain email, address, client secrets, URLs, tokens and payment metadata. | Store an allowlisted audit projection only. Hash or pseudonymize account references where operator usability permits. Never store raw credentials, signatures, URLs containing secrets, full Stripe payloads, email/address/card data, or connection strings. Define retention and deletion policy for retry payloads, while ledger/audit integrity remains append-oriented. |
| T15 | **Timing oracle in bearer/HMAC/nonce comparisons.** Normal string comparison may reveal secret prefixes. | Decode/normalize to fixed-length bytes and use constant-time comparison; reject malformed length before comparison without revealing which credential/key ID matched. Keep authentication errors uniform. |
| T16 | **Product credential compromise has product-wide account reach.** The current text calls it merely “bounded to that product,” which hides arbitrary same-product account reads and actions. | Treat the caller as a privileged product backend. Prefer short-lived audience-bound signed assertions containing product, account, route/action, expiry, nonce and issuer, or perform a product-owned account proof/introspection. Until implemented, disable portal and account-reading routes for any integration that cannot supply account binding. Per-product rate limits and rapid credential revocation are necessary but do not create account isolation. |
| T17 | **Clock skew/replay-window failure on signed ingress.** Skew can reject valid commands; a wide window increases replay exposure. | Verify `issued_at` and `expires_at`, cap lifetime, allow a small documented skew, consume a unique nonce atomically until after expiry, monitor NTP/skew, return a distinct operator-visible but attacker-safe rejection category, and test both future and stale boundaries. Idempotency remains mandatory even inside the window. |
| T18 | **Credential/config substitution across environment or audience.** A staging credential or old rotating key may be accepted in production, or a valid token for one route reused on another. | Bind every credential/assertion to environment, service audience, HTTP method and route/action. Give key IDs an environment prefix, keep current/previous overlap time-bounded, and prove old/staging rejection after rotation. |
| T19 | **Unbounded queue retry and poison events.** A valid but permanently rejected event can consume connections, spam downstream systems, or block newer work. | Exponential backoff with jitter, bounded attempts, `next_attempt_at`, leases, dead-letter/failed state, alerting, and an operator-safe requeue path. Ordering/serialization is per `(product, account_id)` where transitions are order-sensitive. |
| T20 | **Out-of-order but distinct Stripe events.** Event-ID uniqueness prevents replay, not an older distinct event overwriting a newer state. | Compare Stripe object/version timestamps with the current snapshot, define monotonic transition rules, and reconcile from Stripe source-of-truth before applying ambiguous regressions. Record ignored stale events as completed/skipped with reason. |

T8 also needs correction: malformed JSON after a valid signature is possible—Stripe or integration
bugs, truncated/replayed test fixtures, and validly signed non-JSON bytes exist. It should return a
bounded `400` (or recorded `200` only under an explicitly approved provider retry policy), never be
described as impossible. T9's “per-source” rate limiting must not trust source IP alone and must
avoid suppressing legitimate Stripe retries; signature-first cost, global/route concurrency limits,
and provider-aware limits are safer.

## 2. T7: Project A co-tenancy and hub-web reach

### Supabase service-role API path

`service_role` bypasses RLS for objects that PostgREST can reach, but it does not expand
PostgREST's configured exposed-schema list. If `billing_core` and `billing_core_staging` are absent
from that list, a request made through the Supabase Data API cannot select them merely by presenting
the service-role key. This blocks the asserted service-role API path into `billing_core` today.

That boundary is configuration, not a grant substitute. A project administrator can expose the
schema later, and RPC/functions in an exposed schema can create an indirect path. The apply gate must
therefore verify exposed schemas and audit exposed `SECURITY DEFINER` functions, not only table
grants.

### Direct PostgreSQL path

The separate `DATABASE_URL` path is materially worse. Current local configuration uses the Project
A `postgres` pooler identity. That role is the project database owner/administrator. `REVOKE` from
`PUBLIC`, `anon`, and `authenticated` does not constrain it: an attacker using that URL can read the
private schema and alter grants or objects. RLS does not form a security boundary against a table
owner/superuser-like administration path, and column encryption helps only when decryption keys are
not available to the compromised hub-web runtime.

### Required remediation and residual risk

Create a dedicated **`hub_web_app`** login role with only the exact `public` tables, sequences and
functions hub-web needs; rotate hub-web's runtime `DATABASE_URL` to that role. Keep a separate
migration-owner URL out of the application runtime. This materially reduces an application-runtime
compromise from project-owner reach to the granted public surface without requiring another project.
It must be accompanied by denial tests against both billing schemas and by removal of ownership,
role-membership and `CREATE` privileges that would allow escalation.

The irreducible same-project residual is narrower than T7 currently says: trusted Project A database
owners/administrators, the control plane, backups and a project-wide database compromise can reach
both schemas; a Project A outage affects both. A hub-web **application** compromise is not
irreducibly project-wide—its blast radius is reducible by replacing the current owner URL and
keeping billing schemas outside the Data API.

For genuinely sensitive values, application-layer envelope encryption with a key held only by
billing-core can reduce database-only/admin snapshot disclosure. It does not help if billing-core
and its key are compromised. Avoid storing customer PII where Stripe identifiers suffice. Moving
only `stripe_customers` to another system would reduce identity-correlation exposure but introduces
cross-store transaction/recovery complexity and does not repair the unsafe hub-web owner URL; scope
the hub-web role first.

**T7 verdict:** reject the current “accepted residual” wording. Record the current postgres-owner URL
as a blocker before billing data exists. CEO acceptance may cover owner/control-plane and outage
co-tenancy, but must not silently accept an avoidable application-runtime owner credential.

## 3. `/v1/*` authentication and account ownership

Product-granularity authorization is sound only if the product backend itself is the intended
security principal for every account in that product. It does **not** prove tenant/account ownership.
A leaked PawSpace credential can submit or query every guessed/known PawSpace shop ID, create
checkout attempts, discover subscription/entitlement state, and create portal sessions for every
account with a `stripe_customers` mapping. The design must call this **product-wide account reach**.

`POST /v1/portal` is highest risk because a valid Stripe Billing Portal session can expose payment
method, cancellation, invoice, and subscription-management actions configured for that portal. It
must require a fresh end-user/account-bound assertion, not only the product bearer credential. The
assertion should bind issuer/product, exact account, billing-core audience, route/action, environment,
issued/expiry time and one-time nonce; use asymmetric signing or a separate per-product HMAC key with
rotation. The product must issue it only after authenticating and authorizing the end-user. Portal
sessions should be short-lived, use a server-selected allowlisted return URL, and be rate-limited per
credential and account.

The same account assertion is recommended for checkout and account-reading routes. At minimum,
checkout requires the server-derived idempotency/fingerprint rule in T13; GET routes require
product-wide data-access acceptance if account proof is deferred. Audience binding, constant-time
credential comparison, per-route scopes, bounded rotation overlap, replay protection for mutations,
per-credential/account rate limits, audit correlation, and immediate revocation are required.

**Auth verdict:** credential-to-product binding prevents cross-product use but provides no
same-product account isolation. The current “trust the product's accountId” contract contradicts
`BILLING_CORE_PLAN.md`'s stronger statement that caller-supplied account IDs are rejected when not
owned. Reconcile the design to require account-bound proof, especially for portal, or obtain explicit
product-wide risk acceptance and remove any tenant/account-bounded claim.

## 4. Webhook durability, ordering, and acknowledgement

The current steps are not race-free. A row inserted in `processed_events` followed by a process death
before transition delivery means Stripe's retry conflicts on the row and is incorrectly returned as
a completed duplicate. Calling the row “processed-but-incomplete” does not help unless the database
represents and actively schedules that state.

Required contract:

1. Verify raw body and event ID before database work.
2. In one database transaction, claim/upsert `processed_events` as `pending` and create a unique
   `delivery_jobs` row containing only the minimal redacted canonical transition payload. For a
   billing-core-local transition, the state write and ledger completion may instead happen in that
   same transaction.
3. Commit intake. A worker leases due jobs with `FOR UPDATE SKIP LOCKED`, changes them to
   `processing`, calls the downstream idempotent target, and marks both job and event `completed`.
   A lease timeout makes an abandoned `processing` job eligible again. Permanent/retry-exhausted
   failures become `failed` and alert; operators can deliberately requeue them.
4. A duplicate delivery reads state:
   - `completed` (or intentional terminal `skipped`) → `200 {duplicate:true, completed:true}`;
   - `pending`, live/expired `processing`, or retryable `failed` → ensure a due job exists/reawaken it,
     then `200 {duplicate:true, completed:false}` only because durable retry responsibility is proven;
   - inability to persist/verify that retry responsibility → non-2xx so Stripe retries.
5. `200` is safe after durable intake **and** durable delivery obligation, not after row presence.
   A synchronous implementation may return non-2xx on downstream failure if no durable job exists.

The scheduled reconciler compares aggregate state to Stripe and repairs missed/out-of-order truth. It
cannot substitute for delivery of every transition, preserve audit causality, or reliably discover a
portal/notification side effect. It is a secondary safety net.

The companion migration implements explicit `pending/processing/completed/failed/skipped` event
state, attempts/timestamps/errors, and a one-to-one delivery job with lease/backoff fields. It avoids
raw Stripe payload storage; Phase 1 must define the allowlisted canonical job-payload schema and
retention. Per-account ordering and T20's monotonic transition rule remain Phase 1 code obligations.

## 5. Migration-tooling verdict

Choose **(a): raw SQL, separately applied by the single Project A migration owner**, with these
controls:

- Keep files under `docs/platform/billing-core/migrations/` and an explicit apply ledger/runbook;
  do not place them into hub-web's Drizzle journal.
- Keep hub-web `generate`/`migrate` modelling `public` only. Add a CI/static guard that rejects
  `billing_core*` references in generated hub-web migration SQL unless the ownership decision is
  deliberately changed.
- Do not use `drizzle-kit push` against Project A. Its live introspection/synchronization semantics
  are not the verified coexistence path.
- The Project A migration owner serializes Drizzle public-schema migrations and billing-core raw SQL
  changes and records one database change log. “Separate file chain” must not mean competing owners.

Option (b) mixes ownership: Drizzle can model `pgSchema`, but roles/grants still require companion SQL
and hub-web would become the owner of a service schema it does not run. It gives no security benefit
and increases accidental coupling. Option (c) creates a second stateful migration history over the
same database and is rejected. A one-shot use of Supabase CLI `db query --file` is merely the
transport for option (a), not a Supabase migration chain.

The safety verdict is specific to installed Drizzle Kit 0.31.10's **generate + migrate** workflow and
the current `public`-only config. It must be re-reviewed on a Drizzle upgrade, config/schema-filter
change, introduction of `pgSchema`, or use of `push`.

## 6. Other contradictions and underspecification

- The security-contract exit criteria say the migration is applied and the ingress implemented,
  while this bounded Phase 0.5 brief produces only review/draft artifacts. These are later phase
  gates, not exit criteria for this PR.
- §4 says event intake and subscription write occur in one transaction, then describes a PawSpace
  HTTPS call “in the same transaction.” A remote call cannot participate atomically in PostgreSQL;
  holding a transaction open across it is unsafe. The transactional outbox/delivery-job boundary is
  required.
- The phrase “malformed JSON after a valid signature is impossible” is false (T8 correction above).
- T10's `200` for a Stripe event missing an ID prevents provider retry. Stripe normally supplies an
  ID, so this can be an intentional terminal `skipped` outcome, but it must be separately alerted and
  must not create an untraceable audit row. Never synthesize an ID and never transition state.
- Audit semantics conflict: §4's duplicate path says “do nothing else,” while verification expects
  duplicate audit evidence. Define whether duplicates increment ledger counters or append a redacted
  audit row. The migration permits append-only audit rows; Phase 1 should record a replay outcome
  without duplicating business transitions.
- A unique `(product, account_id)` customer mapping prevents two mappings but does not by itself
  prevent duplicate Stripe Customers when concurrent requests call Stripe before insert. Checkout
  needs a database lock/reservation plus server-derived Stripe idempotency key and request fingerprint.
- `GRANT SELECT, INSERT, UPDATE` is broad for immutable audit/event records. This draft follows the
  authorized minimum, denies DELETE on ledger/audit, and documents that Phase 1 should use narrower
  statement/function-level paths if practical. A compromised `billing_core_app` can still rewrite
  audit rows; “audit” is not tamper-proof under that role.
- No retention, partitioning, size ceiling, archival, or deletion authority is defined for
  `processed_events`, `delivery_jobs`, or `audit_events`. Define these before production volume.
- No constraint can prove production and staging schemas remain equivalent after this draft. Add a
  catalog-diff gate to every future migration and restore rehearsal.
- Role creation and grants require a migration-owner/admin connection, not the future
  `billing_core_app` URL. The runbook states this explicitly.
- `billing_core_app` must not own its schema/tables and must not receive `CREATE` on the schema; the
  migration owner retains ownership. Otherwise table grants are not a meaningful boundary.

## Acceptance decision

The design is **not accepted as written**. Commander reconciliation must, at minimum:

1. replace T7 with the two-path analysis and make removal of hub-web's runtime postgres-owner URL a
   pre-data gate;
2. describe leaked product credentials as product-wide and require account-bound proof for portal;
3. replace presence-only duplicate handling with explicit event state plus durable delivery jobs;
4. add T11–T20 (or equivalent controls), correct T8, and resolve the contradictions above; and
5. lock tooling option (a) with the upgrade/config-change re-review triggers.

No gaps beyond those enumerated in this review were identified during this pass. “No additional
gap” is not a certification of implementation: no running service, remote database, Stripe account,
Data API configuration, or deployed ingress was tested in this draft-only phase.
