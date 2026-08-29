# billing-core — Phase 0.5 Security Contracts

**Status:** Design, Commander-authored 2026-08-29. This is the reviewed specification Phase 1 builds
against. It does not authorize code, a Supabase change, a deployment, or a Stripe account.

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
5. **hub-web and billing-core co-tenant Project A.** Different schemas, different DB roles. hub-web's
   publishable/anon key cannot see `billing_core` (not Data-API exposed). See residual **T7**.

### 1.3 Threats and controls

| ID | Threat | Control |
|---|---|---|
| T1 | Forged Stripe webhook | Raw-body-first, verify `Stripe-Signature` against `STRIPE_WEBHOOK_SECRET` before any parse or state read. Invalid → `401`. |
| T2 | Webhook replay — same event twice, or an old event after a newer one | `billing_core.processed_events` with a `UNIQUE` constraint on the Stripe event ID; the insert and the subscription-state write commit in **one transaction**; a conflicting insert means "already processed" → `200 {duplicate:true}`, no state change, no hook, no downstream call. This is the DB-level form of the Phase 0 module fix. |
| T3 | Caller supplies an account ID it does not own on `/v1/checkout` | Authorization is at **product granularity**: the caller credential maps to exactly one product; billing-core rejects a request whose body `product` field disagrees with the credential. The `accountId` is data the product vouches for (the product authenticated its own end-user); billing-core records `(product, accountId)` and sets both as immutable Stripe metadata. billing-core does not and cannot check the accountId against a product's tenant table. |
| T4 | One product's credential used to act on another product | Per-product credentials; every `/v1/*` route derives the product from the credential and rejects a path/body product that differs. Product-to-product is not a supported call shape. |
| T5 | billing-core Worker compromise | Attacker gets: the Stripe **test** key (bounded — no live money until go-live and the `sk_live_` boot guard), the `billing_core` schema data, the `/v1` caller credentials, and the ingress key. Attacker does **not** get any Project B key. Attacker **can** send signed ingress commands to PawSpace — but only the narrow validated transitions the function allows, inside its replay window. Blast radius is billing state + bounded PawSpace subscription transitions, not tenant data. |
| T6 | `PAWSPACE_BILLING_INGRESS_KEY` compromise | Short clock window + one-time nonce, key ID with current/previous overlap for rotation then proven rejection of the old key, the function validates every product/shop/event/transition field, and the function's grants + fixed `search_path` pin it to the `pawspace` schema so it cannot touch `local_service` even with the elevated key. |
| T7 | **hub-web compromise reaches `billing_core` data** — hub-web holds a Project A `service_role`/secret key (`SUPABASE_SECRET_KEY_SAAS_HUB`) which bypasses RLS across every schema in Project A, `billing_core` included | **Accepted residual**, same class as D3's "a Project-A outage takes billing offline". Mitigations that do not fully remove it: `billing_core` migrations `REVOKE ALL` from `PUBLIC`/`anon`/`authenticated` and grant only `billing_core_app`; `billing_core` is never Data-API exposed so no browser path exists; payment records store no card data (Stripe holds that). If this residual becomes unacceptable, the answer is D10's exit — billing-core earns its own project once revenue funds one. Record the acceptance with the CEO. |
| T8 | Oversized or malformed webhook body | Strict max body size (**64 KB**) enforced before parsing; over → `413`. Malformed JSON after a valid signature is impossible (signature covers the bytes); malformed with an invalid signature → `401`. |
| T9 | DoS on the public webhook | Body-size cap, fast signature reject (no DB touch before verify), per-source rate limit, and a processing queue so a burst cannot exhaust DB connections. |
| T10 | Provider event with no event ID slips through | Handler drops it — audit-log + `200`, no transition (`BILLING_CORE_PLAN.md` §2e). |

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
| `POST /v1/checkout` | caller credential required | body `product` must equal the credential's product; `accountId` is recorded as-is and set as Stripe `metadata.product` + `metadata.account_id`; an idempotency key + a DB uniqueness/lock boundary prevent a retry creating a second Stripe Customer or a second non-cancelled subscription |
| `POST /v1/portal` | caller credential required | same product match; the portal session is scoped to the `(product, accountId)` Stripe Customer |
| `GET /v1/subscriptions/:product/:accountId` | caller credential required | `:product` must equal the credential's product; cross-product read → `403` |
| `GET /v1/entitlements/:product/:accountId/:key` | caller credential required | same |
| `POST /webhooks/stripe` | **no caller credential** | Stripe signature only; see §3 |

- Request authentication is tested **independently of Stripe success** — an unauthenticated or
  wrong-product `/v1/checkout` fails before any Stripe call.
- PawSpace reads its own subscription state from its own `pawspace` schema; it does **not** call
  `GET /v1/subscriptions` for its own status. Those routes serve LK01/DC01's pull model.

### 2.3 What billing-core does not verify

billing-core has no view of any product's tenant tables. It trusts that the calling product
authenticated its end-user and passed a real `accountId`. The credential-to-product binding is the
only authorization boundary billing-core enforces. This is acceptable because a product credential
is scoped to that product and a compromise of it is bounded to that product's billing.

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
- `service_role` / `postgres` still reach the schema structurally — that is **T7**, an accepted
  residual, not something grants can close inside one project.

### 3.1 Migration ownership and tooling — OPEN, resolve in the Phase 0.5 review

Project A must have **one migration owner** at the process level (one person/role reviews and
applies every schema change), same principle as Project B in `SHARED_SAAS_RUNTIME_PROJECT_B_PLAN.md`
§4.

Reality check: `apps/hub-web` does **not** use Supabase CLI migrations. It manages Project A's
`public` schema with **Drizzle** — a TypeScript schema at `apps/hub-web/drizzle/schema.ts`,
generated/applied via `drizzle-kit generate && drizzle-kit migrate` (`db:push` script), driven by
`DATABASE_URL`. There is no `apps/hub-web/supabase/` directory and no `.sql` migration chain.

`billing_core` needs a dedicated schema, dedicated Postgres roles, `REVOKE`/`GRANT`, and a fixed
`search_path` — none of which Drizzle's schema DSL expresses. So the Phase 0.5 review must decide,
and record, one of:

- **(a) Raw SQL, separately applied.** `billing_core` is defined by hand-written `.sql` migration
  files applied by the Project A owner via `psql`/`supabase db execute`, coexisting with hub-web's
  Drizzle-managed `public` schema. Requires confirming that `drizzle-kit generate/migrate` (not
  `push`) never touches a schema it doesn't model — Drizzle's default scope is `public` and
  migration mode does not drop untracked objects, but this must be verified against the installed
  `drizzle-kit@0.31.4` before relying on it.
- **(b) Model `billing_core` in Drizzle too.** `drizzle-orm` supports `pgSchema("billing_core")`.
  hub-web's Drizzle then owns the table DDL for both schemas; the role/grant/`search_path` statements
  still ship as a small raw-SQL companion migration.
- **(c) A distinct Supabase CLI chain for billing-core.** Explicitly discouraged — two migration
  tools racing on one database is the failure mode the shared-runtime plan warns against.

Default recommendation pending review: **(a)** — it keeps billing-core's schema self-contained and
reviewable, and keeps hub-web's Drizzle workflow untouched, at the cost of one verified assumption
about `drizzle-kit`'s blast radius. Whichever is chosen, every `billing_core` migration carries its
own `REVOKE`/`GRANT`, fixed `search_path`, and `supabase db advisors` evidence, and is reviewed
before apply.

---

## 4. Durable webhook intake contract

`routes/webhook.ts`, ported from the one proven pattern (`multi-tenant-ai/server/src/routes/payment-demo.ts`), executed in this order:

1. Read the raw body; enforce the 64 KB cap → `413` if over.
2. Verify `Stripe-Signature` against `STRIPE_WEBHOOK_SECRET` → `401` if invalid.
3. Parse. Require `event.id`. Missing → audit-log, `200`, stop (§2e / T10).
4. **One transaction:** `INSERT INTO billing_core.processed_events (stripe_event_id, event_type, received_at, ...) ON CONFLICT (stripe_event_id) DO NOTHING`. If `0` rows → this is a duplicate → commit, return `200 {duplicate:true}`, do nothing else.
5. In the same transaction (or immediately after, before acknowledging): read `metadata.product` and
   `metadata.account_id`. Unknown / absent `product` → audit-log, `200`, no guess.
6. Apply the transition:
   - **PawSpace** → build a signed, replay-bounded ingress request and call the Project B Edge
     Function; the RPC idempotency UUID is derived from `event.id` (UUIDv5, fixed namespace).
   - **LK01 / DC01** (later) → update the `billing_core.subscriptions` snapshot.
7. Write a redacted `billing_core.audit_events` row: outcome (`verified` / `replay` /
   `invalid-signature` / `routed` / `skipped` / `rpc-rejected`), Stripe event ID, correlation ID,
   product, account reference, attempt, latency.
8. Acknowledge (`200`) only after step 4 has durably committed and step 6 has dispatched or enqueued.
9. A reconciler (§6) compares `billing_core` state against Stripe on a schedule to recover missed,
   delayed, or out-of-order deliveries.

Invalid signatures → `401`. Legitimate duplicates → `200` without re-applying. A downstream failure
(ingress `5xx`, DB error after step 4) → the event is durably recorded as processed-but-incomplete
and the reconciler / retry queue drives it to completion; billing-core never silently loses a
verified event.

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
  2. **PawSpace expire:** send one signed, replay-bounded `expire_due` command to the Project B
     ingress; the Edge Function selects and advances only eligible `pawspace` rows inside its own
     project. billing-core never queries PawSpace directly.
  3. **Stripe reconciler:** for subscriptions changed in a recent window, compare local state with
     Stripe's `customer.subscription` object; on drift, enqueue a correction and alert.
- Each job is a plain exported function, also invoked by tests and a manual operator CLI.
- **No public `/internal/cron/*` HTTP route.** The only public route is `/webhooks/stripe`.
- Alert on: a sweep that throws, a reconciler that finds drift, an ingress `expire_due` rejection.

---

## 7. Phase 0.5 exit criteria

- This document reviewed by someone other than its author; no unresolved security blocker.
- The `billing_core` / `billing_core_staging` schema + role migration is written and passes
  `supabase db advisors`, applied to Project A.
- The Project B ingress Edge Function is implemented and its adversarial tests pass **(blocked until
  PawSpace is admitted to Project B — Booking Stage 4)**.
- `/v1/*` authentication + account-ownership is implemented and tested independently of Stripe.
- `PROVENANCE.md` + the `vendor-drift` CI stage exist and the pin is `3b6401a` (merged PR #12).
- The `scheduled()` contract and its three jobs are implemented with idempotency tests.

Only then does Phase 1 (build the skeleton, wire PawSpace end to end) start.
