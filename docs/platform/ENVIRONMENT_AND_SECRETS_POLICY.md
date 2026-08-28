# Environment and Secrets Policy

**Satisfies:** P0a item 4 (`PORTFOLIO_PRODUCTION_MASTER_PLAN.md` §5) — environment naming,
required-variable validation, secret ownership, domain ownership, RTO/RPO/SLO decision owner and
external-provider inventory. The provider inventory itself is the companion document
`EXTERNAL_PROVIDER_INVENTORY.md`.

**Verification method:** every claim below comes from reading `.env.example` files in full (they
contain placeholders, not values), extracting variable **names only** from real `.env`/`.env.local`
files with `grep -oE '^[A-Za-z_][A-Za-z0-9_]*=' <file> | tr -d '='` (no value was ever read or
printed), reading env-handling source files (`apps/hub-web/server/_core/env.ts`,
`products/PawSpace/lib/env.ts`, `products/headless-commerce/server/src/config.ts`,
`products/line-oa-ai/server/src/config.ts`, `products/booking/apps/booking-admin/src/lib/supabase/config.ts`),
and reading `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md`, `docs/products/registry.yaml`,
`HANDOFF.md`, `docs/platform/BILLING_CORE_PLAN.md`, `docs/platform/REPOSITORY_MAP.md` and
`docs/platform/RUNTIME_MATRIX.md`. `D:\AI-Workspace\.secrets\` was never opened. No network call,
DNS lookup, or credential-liveness test was made. Anything not established this way is marked
`UNVERIFIED` with the reason.

---

## a. Environment naming

Master plan §3.4: every hosted product and shared service uses separate **local, preview, staging,
production** configuration; preview and staging never write to production data.

| Name | Purpose | Who runs it |
|---|---|---|
| `local` | A developer's own machine. Uses `.env`/`.env.local` (gitignored), local or personal-tier provider accounts, mock/test-mode keys only. | Individual developer/agent |
| `preview` | An ephemeral environment for one branch/PR — a Cloudflare Workers preview deployment or a local build pointed at staging services. Torn down after the branch merges or closes. | CI / whoever opens the branch |
| `staging` | A long-lived environment that mirrors production configuration shape but uses test-mode/sandbox provider credentials and non-production data. This is where G2–G5 gate evidence (staging in the gate text) is produced. | CEO / release owner |
| `production` | The live, customer-facing environment. Real provider credentials, real data, subject to G6/G7. | CEO / release owner |

**How an environment is identified at runtime — current state, not yet a portfolio standard:**
`NODE_ENV` (`development`/`production`/`test`) is the only environment discriminator found in code
this session (`products/headless-commerce/server/src/config.ts` `parseNodeEnv`; Next.js apps —
`booking`, `PawSpace` — get it implicitly from the Next.js build). No repository was found declaring
a fourth value for `staging` or `preview`; where those exist today they are implemented as a
same-`NODE_ENV=production` deployment pointed at different provider projects/keys (e.g. a second
Cloudflare Workers environment in `wrangler.jsonc`), not a distinct `NODE_ENV` value. **Rule going
forward:** `NODE_ENV` distinguishes `production` from non-production only; which of `local` /
`preview` / `staging` a non-production deployment is must be recorded by its deploy target name
(Cloudflare Workers environment name, e.g. `staging`/`preview` sections in `wrangler.jsonc`) and by
which provider project/credential set it is configured with — never inferred from `NODE_ENV` alone.
A production `NODE_ENV` value combined with a staging provider project is the concrete way "preview/
staging never writes to production data" is enforced today: by using a *different provider project*,
not a runtime flag inside the same project.

**Verified today:** no repository in the portfolio has a distinct `staging` or `preview` Cloudflare
Workers environment block, or a second Supabase project per product, confirmed to exist — this
session found no `wrangler.jsonc` environment section beyond a single default, and `REPOSITORY_MAP.md`
/ `RUNTIME_MATRIX.md` record no repository-declared staging project. **UNVERIFIED / gap:** whether any
product currently has a real staging provider project distinct from production. Treat "staging" in
this portfolio today as a target to build under P0b, not an environment that already exists for any
of the seven products.

---

## b. Required-variable validation

**Rule (concrete, implementable):**

1. **When it runs.** For a long-running web service (Next.js server, Hono/Express server), required
   production variables are validated once at process boot, before the server starts accepting
   requests — not lazily on first use of each variable, and not only inside the request handler that
   happens to need it. For a static/edge build (Cloudflare Workers build step), validation runs at
   build/deploy time, before the artifact is published, because a Worker has no separate "boot"
   moment distinct from receiving its first request.
2. **What it checks.** Every variable a `production` deployment needs is enumerated once (a schema
   or an explicit list), and each is checked for: present, non-empty after trimming, not equal to a
   known development/placeholder value (`your-...`, `changeme`, `sk_test_` where only `sk_live_` is
   valid in production, etc.), and — where the variable has a shape (URL, JSON, UUID, minimum key
   length) — that shape is validated, not just presence. `products/PawSpace/lib/env.ts`'s
   `CAMERA_SESSION_SIGNING_SECRET`/`CAMERA_IP_HASH_PEPPER` minimum-byte-length checks are the one
   example in the portfolio today of shape validation beyond presence.
3. **What "fail closed" means for a web service.** The process must not start (or must not serve
   traffic) if a required production variable is missing/invalid. A caught exception that logs a
   warning and continues with an empty string is not fail-closed — it is the exact "empty strings ...
   forbidden in production" case §3.4 names. `apps/hub-web/server/_core/env.ts` is the portfolio's
   clearest violation of this: every field falls back to `""` via `??` with no throw, no boot-time
   check, and no distinction between `local` and `production`.
4. **What "fail closed" means for a build.** A build/deploy step that would publish an artifact
   containing an empty required secret must exit non-zero instead of producing that artifact. No
   repository in this portfolio was found doing this today — it is a P0b gap for every repository
   that deploys (BK01, PS01 target, and the future billing-core).
5. **What an implementer must add to a product to comply:**
   - One module (already present as a pattern in `products/PawSpace/lib/env.ts` and
     `products/line-oa-ai/server/src/config.ts`, though line-oa-ai is out of the seven-product scope)
     that lists every required variable for that product, throws with a clear per-variable message on
     violation, and is invoked unconditionally at process start — not only from the code path that
     happens to need the variable.
   - A `NODE_ENV === 'production'` branch so `local` can still run with partial configuration (a
     developer without Stripe test keys can still boot the app) while `production` cannot.
   - Removal of every `?? ""` / `|| ''` fallback pattern on a variable that is required in production.
   - No mock/demo adapter selectable in a production build. `USE_MOCK_PAYMENT=false` in HC01's
     `.env.example` is the one example found; the corresponding code must refuse to boot with
     `USE_MOCK_PAYMENT=true` when `NODE_ENV=production`, which was not verified to exist —
     **UNVERIFIED**, the `config.ts` read in this session parses the flag but does not gate it against
     `NODE_ENV`.

**Portfolio status — determined by reading code, not by assumption:**

| Product/service | Has a dedicated env-validation module? | Fails closed at boot? | Evidence |
|---|---|---|---|
| `hub-web` | Yes, `server/_core/env.ts` | **No.** Every field defaults to `""` via `??`; nothing throws. | `apps/hub-web/server/_core/env.ts:1-9` |
| BK01 `booking` | Partial — `booking-admin/src/lib/supabase/config.ts` has one throwing getter for the two public Supabase vars only | **No**, not for the whole app. Stripe/LINE/service-role vars (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `LINE_CHANNEL_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`) have no equivalent guard found in this session's search; the Stripe/LINE route handlers were not individually audited line-by-line for an inline check. | `products/booking/apps/booking-admin/src/lib/supabase/config.ts:1-10` |
| PS01 `pawspace` | Yes, `lib/env.ts` — the most complete in the portfolio (11 `require*` functions, one with byte-length shape checks) | **Partial.** Each `require*` function fails closed *when called*, but this session found no single startup call site that invokes all of them together before the server accepts traffic — each is invoked lazily by the route/module that needs it, so a misconfigured variable only surfaces when that specific feature is first exercised, not at boot. | `products/PawSpace/lib/env.ts:1-185` |
| LK01 `wstera_link` | N/A — no application code exists (docs-only intake) | N/A | `RUNTIME_MATRIX.md` |
| DC01 `doccraft` | N/A — no backend/env dependency exists today (local-first, no `.env.example` found) | N/A | file search this session found no `.env*` under `products/DocCraft` |
| MT01 `multi_tenant_ai` | **No.** No `config.ts`/`env.ts` file exists under `server/src`; `process.env.*` is read ad hoc in `routes/payment-demo.ts`, `index.ts`, `lib/payments.ts`, `lib/ai.ts`, `lib/supabase.ts`. | **No.** | grep for `process.env.` across `products/multi-tenant-ai/server/src` |
| CM01 `booking_ticket_module` | N/A — local-storage-only template, no `.env.example`, no server env dependency | N/A | file search |
| HC01 `headless_commerce` | Yes, `server/src/config.ts` | **Partial.** Numeric/enum fields (`PORT`, `NODE_ENV`, `MAX_FILE_SIZE_BYTES`, `USE_MOCK_PAYMENT`) throw at module-load time on a malformed value — that is a real fail-closed boot check for shape. But `STRIPE_SECRET_KEY`/`STRIPE_PUBLISHABLE_KEY`/`STRIPE_WEBHOOK_SECRET` all default to `''` via `readEnv(name, '')` with no presence check and no `NODE_ENV`-gated requirement — an HC01 production deploy can boot with empty Stripe secrets. | `products/headless-commerce/server/src/config.ts:26-51` |
| billing-core (planned, not built) | N/A — does not exist yet | N/A | `REPOSITORY_MAP.md` confirms no `billing-core` checkout exists; `BILLING_CORE_PLAN.md` P-2 already specifies one required boot-time guard (refuse to boot on `STRIPE_SECRET_KEY` starting `sk_live_` unless `BILLING_CORE_ALLOW_LIVE=true`) as a design requirement for when it is built | `docs/platform/BILLING_CORE_PLAN.md:119-123` |

**Summary: none of the eight (seven products + `hub-web`) fully implement §3.4's required-variable
validation as specified — a real startup-validation pattern exists only in PawSpace and, partially,
HC01, and neither is wired to run unconditionally at boot before serving traffic.** This is P0b work
per repository, not something this brief closes.

---

## c. Secret ownership

### Rule (restating the workspace's standing constraints)

- `D:\AI-Workspace\.secrets\keys.txt` is the single central vault. Copy only the individual value
  actually needed for a task; never copy the file or a directory from it; never open or print it
  wholesale.
- Never print a secret value into chat, a log, a document, or a commit. A key **name** is always
  safe to record; a key **value** is never safe to record outside the vault and the system of record
  that consumes it (Cloudflare secret store, Supabase project settings, provider dashboard).
- Verify a rotated credential with a live functional call (e.g. `SELECT 1` against the database),
  never by trusting a dashboard "success" message alone — `HANDOFF.md` records a 2026-08-20 DB
  password rotation that silently failed this way and was only caught on 2026-08-25 by an agent that
  insisted on a live check.
- **Operational lesson on connection strings (from `HANDOFF.md`, 2026-08-25):** a Supabase-generated
  password commonly contains special characters (e.g. `%`) that must be URL-encoded before being
  placed in a Postgres connection string. An un-encoded special character fails silently with a
  misleading `password authentication failed` error that looks like a wrong password, not an
  encoding bug. When copying from Supabase's "Connect" dialog, confirm the `[YOUR-PASSWORD]`
  placeholder was actually replaced with the real (encoded) password and not copied verbatim
  including the brackets. This applies directly to `DATABASE_URL` (`hub-web`) and the future
  `BILLING_CORE_DATABASE_URL`.

### Secret name inventory

Names only, extracted from `.env.example` files read in full and from real `.env`/`.env.local` files
via the safe key-only grep. `BLAST RADIUS` is qualitative (what an attacker with this value alone can
do), not a formal rating.

| Secret name | Used by | System of record | Rotation owner | Blast radius if leaked |
|---|---|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | `hub-web`, BK01, PS01 (each product's own Supabase project has its own value under this name) | Supabase project settings (API) per project; mirrored in central vault and, once deployed, Cloudflare Workers secrets | CEO | Full project-wide `service_role` access, bypasses RLS entirely, for that one Supabase project. Per G2, this key is "project-wide even if it has a service-specific name." |
| `DATABASE_URL` | `hub-web` | Supabase project settings → Database → Connection string; central vault | CEO | Direct Postgres connection to the Hub project (Project A) — same practical blast radius as the service-role key for that project, plus the URL-encoding failure mode above. |
| `BILLING_CORE_DATABASE_URL` (planned) | billing-core (not built) | Will be a dedicated scoped Postgres role per §10 D3, not `DATABASE_URL`/service key | CEO | Scoped to the `billing_core` schema only, by design (D3) — narrower than `DATABASE_URL` above once built correctly. |
| `PRODUCT_EVENTS_HMAC_SECRET` | `hub-web` (`server/_core/env.ts`) | **UNVERIFIED where it is actually set** — not present in `apps/hub-web/.env.example`'s variable list despite being read in code; not present among the key names extracted from the real `apps/hub-web/.env`. Likely undocumented/unset today. | UNVERIFIED (no owner recorded because the variable itself is undocumented) | Per master plan §3.1/§10 D2, this is the single shared secret that — **if it is set** — lets any product-event signer impersonate any product (R3, High). Whether it is set is unresolved: verification fails closed on an empty secret, so an unset value makes the endpoint reject everything rather than accept forgeries. See "Open items for a reviewer". |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | `hub-web` (client bundle) | Supabase project settings (publishable values, safe for client exposure by design) | CEO | Low — anon key is meant to be public; RLS is the actual boundary. |
| `SUPABASE_STORAGE_BUCKET` | `hub-web` | Not a secret — a bucket name (defaults to `product-assets` in code) | N/A | None — configuration, not a credential. |
| `OWNER_USER_ID` | `hub-web` | Not a secret — a Supabase Auth UID used for admin auto-promotion | N/A | Low — misconfiguration risk (wrong user auto-promoted to admin), not a credential leak. |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | BK01, PS01 | Supabase project settings (publishable) | CEO | Low, same reasoning as the Vite equivalents. |
| `LINE_CHANNEL_SECRET` | BK01 | LINE Developers console | CEO | Allows forging LINE webhook signatures for BK01's channel — webhook spoofing. |
| `LINE_CHANNEL_ACCESS_TOKEN` | BK01, PS01 | LINE Developers console | CEO | Send messages as the product's LINE OA; abuse/spam and impersonation risk. |
| `LINE_CHANNEL_ACCESS_TOKENS_JSON` (PS01, per-shop, Phase 6) | PS01 | LINE Developers console, one token per shop | CEO | Same as above, multiplied per compromised shop entry. |
| `LINE_DISPATCH_SECRET` | PS01 | Generated internal secret (not provider-issued) | CEO | Allows unauthorized calls to PS01's internal LINE dispatcher endpoint. |
| `LINE_LOGIN_CHANNEL_ID` | PS01 | LINE Developers console | CEO | Low by itself (an identifier, not a bearer credential) — paired with LIFF flow config. |
| `NEXT_PUBLIC_LINE_LIFF_ID` | PS01 | LINE Developers console (public by design) | CEO | Low — meant to be client-visible. |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | PS01 | Google Cloud service-account console | CEO | Full access to whatever the service account is scoped to (Sheets sync) — a full credential file, not a single token. |
| `GOOGLE_SYNC_DISPATCH_SECRET` | PS01 | Generated internal secret | CEO | Unauthorized calls to PS01's internal Google Sheets sync dispatcher. |
| `CAMERA_SESSION_SIGNING_SECRET` | PS01 | Generated internal secret (≥32 bytes enforced in code) | CEO | Forge public camera session tokens — unauthorized camera feed access. |
| `CAMERA_IP_HASH_PEPPER` | PS01 | Generated internal secret (≥16 bytes enforced) | CEO | Weakens IP-hash rate limiting/abuse tracking for camera access if leaked; not a direct data-access key. |
| `LINE_TARGET_ID` | PS01 | Deployment configuration (`.env`), not a credential | CEO | Not a secret — names a LINE delivery target. Wrong value misroutes notifications; it grants no access on its own. |
| `CAMERA_REQUESTER_IP_HEADER` | PS01 | Deployment configuration, not a credential | CEO | Not a secret — names which header carries the client IP. Wrong value silently breaks IP-based rate limiting, so treat it as security-relevant configuration even though it is not itself sensitive. |
| `CAMERA_ALLOWED_FEED_HOSTS` | PS01 | Deployment configuration, not a credential | CEO | Not a secret — an allowlist of permitted camera feed hosts. Over-broad value widens SSRF/feed-source exposure; security-relevant configuration. |
| `APP_BASE_URL` | PS01 | Deployment configuration, not a credential | CEO | Not a secret — the product's own base URL. Wrong value breaks generated links and callback URLs; per §10 D1 it must point at the product's code host. |
| `STRIPE_SECRET_KEY` | BK01, MT01, HC01, billing-core (planned) | Stripe dashboard (per Stripe account/mode); central vault | CEO | Full Stripe account API access for that key's mode (test or live) — create charges/subscriptions, read customer data. |
| `STRIPE_WEBHOOK_SECRET` | BK01, MT01, HC01, billing-core (planned) | Stripe dashboard (per webhook endpoint) | CEO | Allows forging Stripe webhook payloads, bypassing signature verification. |
| `STRIPE_PUBLISHABLE_KEY` | BK01, HC01 | Stripe dashboard (public by design) | CEO | Low — meant to be client-visible. |
| `STRIPE_PRICE_BASIC` / `STRIPE_PRICE_PRO` | BK01 (found only in real `.env.local` files, **not** documented in `products/booking/.env.example`) | Stripe dashboard (Price IDs, not secret values, but undocumented in the example file — a gap) | CEO | None directly (identifiers, not credentials) — but their absence from `.env.example` means a fresh clone cannot discover they're required without reading the checkout route source. |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GEMINI_API_KEY` | MT01 (buyer-supplied in the shipped product; only one is required) | Respective provider dashboards; for WSTERA's own internal test use, central vault | CEO (for WSTERA's own test key); buyer owns their own in the shipped product | Provider API spend/abuse on whichever key is compromised. |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` (MT01) | MT01 (explicitly the **buyer's own** Supabase project per the `.env.example` comment, not WSTERA's) | Buyer's own Supabase project | Buyer, not WSTERA, once shipped | N/A to WSTERA once shipped as a source product — scoped to whichever buyer project is misconfigured. |
| `PAWSPACE_BILLING_INGRESS_KEY` (planned) | billing-core → PawSpace narrow ingress (not built) | Per-environment credential, per `BILLING_CORE_PLAN.md` §5a | CEO | Scoped by design to calling the narrow ingress function only — not the elevated PawSpace key. |
| PawSpace elevated project key (internal to the future ingress Edge Function) | PawSpace Edge Function environment only, never billing-core | Supabase project settings (PS01's own project) | CEO | Full PS01 project-wide RLS-bypass access — this is why D4 forbids billing-core from ever holding it. |
| Cloudflare account/API token (deploy, DNS, Workers secrets) | `hub-web` (deployed), and every product once it deploys | Cloudflare dashboard / API token; central vault | CEO | Full control of the `wstera.com` zone and every deployed Worker — the single highest-blast-radius credential in the inventory; no dedicated `.env` name was found for it because it is a deploy-tool credential (`wrangler`), not an application runtime variable. `UNVERIFIED`: exact token scoping (account-wide vs zone-scoped vs per-Worker) — not established from any document read this session. |

**Count:** 30 distinct secret/config-adjacent variable names were inventoried above (excluding pure
buyer-owned MT01 values once shipped, which are out of WSTERA's ownership by design). Of these, 20
are genuine bearer credentials or connection strings; the remainder are public/client-safe values or
non-secret configuration recorded for completeness because the brief asked for every name in use.

Corrected 2026-08-27 after `REVIEW-P0a-B3-2026-08-27.md`: the first version of this table stated 26
and had omitted four PS01 names present in `products/PawSpace/.env.example` — `LINE_TARGET_ID`,
`CAMERA_REQUESTER_IP_HEADER`, `CAMERA_ALLOWED_FEED_HOSTS` and `APP_BASE_URL`. None is a credential,
but two of them (`CAMERA_REQUESTER_IP_HEADER`, `CAMERA_ALLOWED_FEED_HOSTS`) are security-relevant
configuration whose wrong value degrades a control, so their omission was not harmless bookkeeping.
The credential-class count of 20 is unchanged.
Every credential-class name above has an attributed owner (CEO, or buyer for the two MT01
buyer-supplied values) and an attributed or explicitly `UNVERIFIED` system of record — one name
(`PRODUCT_EVENTS_HMAC_SECRET`) and one credential class (the Cloudflare deploy token's exact scoping)
could not be fully attributed and are marked `UNVERIFIED` above rather than guessed at.

---

## d. Domain ownership

- **Zone owner:** `wstera.com` is owned by the Hub (`apps/hub-web`), registered via Cloudflare
  Registrar, acquired 2026-08-23 (`registry.yaml` header comment; confirmed again in
  `PORTFOLIO_PRODUCTION_MASTER_PLAN.md` §3.1 and `HANDOFF.md`). Products get subdomains; they do not
  own the root domain. `HANDOFF.md` records the root domain was briefly misattributed to `booking` on
  2026-08-24 and corrected the same day.
- **Canonical hostname rule (§10 D1):** every product's canonical technical host is `<product_code>.wstera.com`
  (e.g. `bk01.wstera.com`). Stripe redirect URLs, OAuth callbacks and LINE callbacks must point at the
  code host, because the code never changes even if a brand name does (see PS01/Pawstia, §10 D8, where
  the brand changed but `PS01` did not). A branded alias (e.g. `pawspace.wstera.com` →PS01, or a future
  `pawstia.wstera.com`) may be added later pointing at the same product; it blocks nothing.
- **Reservation status, verified from `registry.yaml` directly (grep for `canonical_host`/`product_code`,
  not inferred from the master plan's prose):**

  | Product | `product_code` | `canonical_host` reservation actually found in `registry.yaml` |
  |---|---|---|
  | BK01 `booking` | `BK01` | Reserved by name only in a comment: "canonical_host bk01.wstera.com is reserved, not yet live." No `canonical_host:` YAML key/field exists anywhere in the file. |
  | LK01 `wstera_link` | `LK01` | Same pattern, comment only: "canonical_host lk01.wstera.com reserved (docs-only, no DNS record created)." |
  | PS01 `pawspace` | `PS01` | **No `canonical_host` comment or field found for PS01** in this session's read of the registry entry (lines ~494-535). The implied host under the D1 rule would be `ps01.wstera.com`, but the registry does not state it anywhere. |
  | DC01 `doccraft` | `DC01` | **No `canonical_host` comment or field found for DC01** either. Implied host under D1: `dc01.wstera.com`, not written down anywhere in the registry. |
  | MT01, CM01, HC01 | `MT01`/`CM01`/`HC01` | Not applicable in the same way — these are one-time source products distributed to buyers, not hosted under a WSTERA subdomain; no `canonical_host` expectation applies. |

  **Correction to the brief's framing:** the brief states each product's code host is "already
  reserved in `registry.yaml`." Verified: this is only actually written down for BK01 and LK01, as
  free-text comments, not as a structured field. PS01 and DC01 have no such statement anywhere in the
  registry despite both being subscription-SaaS products the D1 rule applies to. This is a real gap in
  the registry, not a documentation-reading error — recorded here as a finding for the reviewer, not
  silently corrected (this brief may not edit `registry.yaml`).
- **Live-resolution status: `UNVERIFIED` for every hostname, by this brief's own hard rule (no DNS
  lookups, no network calls permitted).** `HANDOFF.md` states only `wstera.com` itself (the root) is
  live on Cloudflare Workers as of 2026-08-25, serving an empty catalog. No document read this session
  states that any `<code>.wstera.com` subdomain has an actual DNS record — `registry.yaml`'s own header
  comment says explicitly "reservation is documentation-only here; no DNS record has been created for
  any product, including booking/BK01." Take that as the current ground truth: **zero product
  subdomains are live**, only the root is.
- **Callback rule:** Stripe redirect URLs, OAuth callbacks, and LINE callbacks must point at the
  `<code>.wstera.com` host, never a branded alias — because the code host is permanent and a brand name
  is not (demonstrated by PS01/Pawstia). No product's Stripe/LINE callback configuration was verified
  against this rule in this session (would require reading live provider dashboard config, out of
  scope/impossible without a value-bearing credential).
- **Publication gate (§3.1):** no product's destination URL or purchase path may be published on the
  live Hub catalog before that product's own release checkpoint records a CEO `GO`. Verified true today
  by construction: `HANDOFF.md` confirms the Hub's catalog is currently empty and every CTA renders
  "coming soon" because no product has reached its release checkpoint yet.

---

## e. RTO/RPO/SLO decision owner

**Decision owner: the CEO**, per master plan §10 D7 ("These values are raised, never silently
lowered, and any raise is recorded with its trigger") and per `REPOSITORY_MAP.md`'s finding that no
repository names a different release/decision authority anywhere in the portfolio.

**Starting values (§10 D7), recorded per product/service:**

| Product/service | SLO (availability) | RTO | RPO | Notes |
|---|---|---|---|---|
| BK01 `booking` | 99% | 4h | 24h | Standard starting value |
| PS01 `pawspace` | 99% | 4h | 24h | Standard starting value |
| LK01 `wstera_link` | 99% | 4h | 24h | Standard starting value; product does not exist yet |
| DC01 `doccraft` | 99% | 4h | 24h | Standard starting value; applies once cloud sync (Phase 8) exists — local-only usage has no server SLO to violate |
| `hub-web` (Hub/control plane) | 99% (implied by "every hosted product/shared service" in §3.4; no product-specific override found) | 4h | 24h | Not explicitly separately stated in §10 D7's text, which names "every hosted product" — Hub is a shared service, not one of the seven products; **UNVERIFIED** whether the CEO intends the same starting values for Hub itself or a different set — no document read this session states Hub's own SLO/RTO/RPO explicitly. |
| billing-core (planned) | Not separately stated; inherits "every hosted product" language | 4h (not separately stated — same reasoning as Hub) | **1h or better** (explicitly stated, §10 D7 exception) | The one product/service with an explicit RPO tighter than the 24h default, because "a lost payment record cannot be reconstructed from the product side." |
| MT01, CM01, HC01 (one-time source products) | Not applicable — buyer operates them; §10 D7 explicitly scopes to hosted products | Not applicable | Not applicable | Uptime/RTO/RPO obligations do not transfer to WSTERA for a shipped source artifact, per master plan §4's one-time-product ladder discussion. |

**Procedure for changing a target (from §10 D7's text, made concrete):**

1. A target may only be **raised** (made stricter) informally by engineering proposing it; it may
   never be silently **lowered**.
2. Any change — raise or (in the rare case a lowering is ever proposed) exception — requires an
   explicit CEO decision, recorded the same way other §10 decisions are recorded: a dated entry in the
   master plan's §10 with the trigger that caused it (e.g. "raised BK01's RPO to 1h after the first paid
   pilot cohort" would be a valid future entry; "usage is low so we can loosen the target" is not a
   valid trigger under §0).
3. A raised target is only meaningful once G3's restore-rehearsal evidence proves the system actually
   meets it — recording a stricter number without rehearsal evidence is a plan change, not an
   operational fact.

---

## Open items for a reviewer

- `PRODUCT_EVENTS_HMAC_SECRET` is read by `hub-web` code but not documented in `apps/hub-web/.env.example`
  and not found among the real `.env` file's key names.

  **Fail direction, verified from code under `REVIEW-P0a-B3-2026-08-27.md`:** the signing path in
  `apps/hub-web/server/webhooks/productEvents.ts` opens `verifySignature` with
  `if (!secret || !signatureHeader) return false;`. An empty secret therefore makes verification
  return false unconditionally — the endpoint **fails closed and rejects every request, forged or
  legitimate.** It does not accept forged events. An earlier draft of this document implied the
  opposite; that implication was wrong and is retracted here.

  What remains open is therefore an availability and correctness question, not an authentication
  bypass: if the secret is genuinely unset, `POST /api/webhooks/product-events` is dead code that
  rejects everything, and R3's shared-secret risk is not live today because no shared secret is in
  use. If it is set in the Cloudflare Workers secret store and merely undocumented locally, then R3
  is live and the per-product-key work under §10 D2 is urgent. **This can only be settled by
  inspecting the Cloudflare Workers secret store for the `hub-web` Worker — it cannot be determined
  from the repository.** Assign it to the CEO.
- `registry.yaml` does not record a `canonical_host` for PS01 or DC01 anywhere, contradicting the
  brief's assumption that all four subscription products already have this reserved in the registry.
- No repository was found with a real, distinct staging deployment/provider-project setup — "preview
  and staging never write to production data" is currently true only by absence (nothing is deployed
  to staging at all), not by an enforced separation mechanism.
